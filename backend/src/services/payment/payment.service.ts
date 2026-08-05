import crypto from 'node:crypto';
import type { ClientSession, Types } from 'mongoose';
import { env } from '../../config/env';
import { Order } from '../../models/order.model';
import { Payment } from '../../models/payment.model';
import type { IPayment } from '../../models/payment.model';
import { Refund } from '../../models/refund.model';
import { AuditLog } from '../../models/audit-log.model';
import { isCutoffPassed } from '../../utils/campusTime';
import { decimalToSubunits } from '../../utils/money';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { razorpayGatewayService } from './razorpayGateway.service';

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
}

interface RazorpayCapturedWebhook {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
}

export function verifyRazorpaySignature(rawBody: string, signature: string | undefined) {
  if (!signature) {
    throw new UnauthorizedError('Missing payment webhook signature');
  }

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  const received = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) {
    throw new UnauthorizedError('Invalid payment webhook signature');
  }
}

function parseWebhook(rawBody: string): RazorpayCapturedWebhook {
  try {
    return JSON.parse(rawBody) as RazorpayCapturedWebhook;
  } catch {
    throw new BadRequestError('Invalid payment webhook payload');
  }
}

function formatPaymentSession(data: {
  gatewayOrderId: string;
  amount: string;
  amountSubunits: number;
  reused: boolean;
}) {
  return {
    gateway: 'razorpay',
    mode: 'test',
    key_id: env.RAZORPAY_KEY_ID,
    gateway_order_id: data.gatewayOrderId,
    amount: data.amount,
    amount_subunits: data.amountSubunits,
    currency: 'INR',
    reused: data.reused
  };
}

function formatExistingSession(payment: IPayment): ReturnType<typeof formatPaymentSession> {
  if (!payment.gateway_order_id) {
    throw new ConflictError('Pending payment session is missing gateway order id');
  }

  return formatPaymentSession({
    gatewayOrderId: payment.gateway_order_id,
    amount: payment.amount,
    amountSubunits: decimalToSubunits(payment.amount),
    reused: true
  });
}

interface PaymentInitiationSnapshot {
  dropPoint: string;
  itemCount: number;
  totalAmount: string;
}

async function assertPaymentInitiationReady(order: {
  order_status: string;
  payment_status: string;
  drop_point: string | null;
  total_amount: string;
  campus_id?: { cutoff_time?: string };
}): Promise<PaymentInitiationSnapshot> {
  if (order.order_status !== 'cart' || order.payment_status !== 'pending') {
    throw new ConflictError('Order is not awaiting payment');
  }

  if (!order.drop_point || order.drop_point.trim() === '') {
    throw new BadRequestError('Drop point is required before payment');
  }

  if (isCutoffPassed(order.campus_id?.cutoff_time ?? '')) {
    throw new ConflictError('Campus cutoff time has passed; payment cannot be initiated');
  }

  return {
    dropPoint: order.drop_point,
    itemCount: 1,
    totalAmount: order.total_amount
  };
}

function parseWebhookEventDate(webhook: RazorpayCapturedWebhook) {
  if (typeof webhook.created_at !== 'number' || !Number.isFinite(webhook.created_at) || webhook.created_at <= 0) {
    throw new BadRequestError('Captured payment webhook is missing event timestamp');
  }

  return new Date(webhook.created_at * 1000);
}

function assertCapturedPaymentEntity(paymentEntity: RazorpayPaymentEntity | undefined) {
  if (!paymentEntity || paymentEntity.status !== 'captured' || paymentEntity.captured !== true) {
    throw new BadRequestError('Captured payment webhook has invalid payment status');
  }

  if (paymentEntity.currency !== 'INR') {
    throw new BadRequestError('Captured payment webhook has invalid currency');
  }

  const amount = paymentEntity.amount;

  if (!Number.isInteger(amount) || amount === undefined || amount <= 0) {
    throw new BadRequestError('Captured payment webhook has invalid amount');
  }
}

function assertWebhookAmountMatchesPayment(
  paymentEntity: RazorpayPaymentEntity | undefined, 
  payment: IPayment
) {
  if (paymentEntity?.amount !== decimalToSubunits(payment.amount)) {
    throw new BadRequestError('Captured payment webhook amount does not match payment session');
  }
}

async function withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await (await import('mongoose')).startSession();
  session.startTransaction();
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const paymentService = {
  async initiateRazorpayPayment(studentId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, student_id: studentId })
      .populate('campus_id', 'cutoff_time')
      .exec();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const populated = order as unknown as { campus_id: { cutoff_time: string } };
    await assertPaymentInitiationReady({
      order_status: order.order_status,
      payment_status: order.payment_status,
      drop_point: order.drop_point,
      total_amount: order.total_amount,
      campus_id: populated.campus_id
    });

    const existingSession = await Payment.findOne({
      order_id: orderId,
      gateway: 'razorpay',
      gateway_order_id: { $ne: null },
      gateway_txn_id: null,
      status: 'created'
    }).sort({ created_at: -1 }).exec();

    if (existingSession) {
      return formatExistingSession(existingSession);
    }

    const amountSubunits = decimalToSubunits(order.total_amount);
    const gatewayOrder = await razorpayGatewayService.createOrder({
      amountSubunits,
      receipt: orderId,
      notes: {
        internal_order_id: orderId,
        campus_id: order.campus_id.toString(),
        student_id: studentId
      }
    });

    return withTransaction(async (session: ClientSession) => {
      const lockedOrder = await Order.findOne({
        _id: orderId,
        student_id: studentId,
        order_status: 'cart',
        payment_status: 'pending'
      }).populate('campus_id', 'cutoff_time').session(session).exec();

      if (!lockedOrder) {
        throw new NotFoundError('Order not found');
      }

      const payment = await Payment.create([{
        order_id: orderId,
        gateway: 'razorpay',
        gateway_order_id: gatewayOrder.id,
        amount: lockedOrder.total_amount,
        status: 'created'
      }], { session });

      if (!payment[0]) {
        throw new ConflictError('Payment session was created by another request but could not be loaded');
      }

      await AuditLog.create([{
        order_id: orderId,
        actor_id: studentId,
        action: 'payment.session_created',
        details: {
          gateway: 'razorpay',
          gateway_order_id: payment[0].gateway_order_id,
          amount: lockedOrder.total_amount
        }
      }], { session });

      return formatPaymentSession({
        gatewayOrderId: gatewayOrder.id,
        amount: lockedOrder.total_amount,
        amountSubunits: decimalToSubunits(lockedOrder.total_amount),
        reused: false
      });
    });
  },

  async handleRazorpayWebhook(rawBody: string | undefined, signature: string | undefined) {
    if (!rawBody) {
      throw new BadRequestError('Missing payment webhook payload');
    }

    verifyRazorpaySignature(rawBody, signature);
    const webhook = parseWebhook(rawBody);

    if (webhook.event !== 'payment.captured') {
      return {
        handled: false,
        ignored: true,
        event: webhook.event ?? null
      };
    }

    const paymentEntity = webhook.payload?.payment?.entity;
    const gatewayTxnId = paymentEntity?.id;
    const gatewayOrderId = paymentEntity?.order_id;
    const paymentEventDate = parseWebhookEventDate(webhook);

    if (!gatewayTxnId || !gatewayOrderId) {
      throw new BadRequestError('Captured payment webhook is missing gateway identifiers');
    }

    assertCapturedPaymentEntity(paymentEntity);

    return withTransaction(async (session: ClientSession) => {
      const duplicate = await Payment.findOne({
        gateway: 'razorpay',
        gateway_txn_id: gatewayTxnId
      }).session(session).exec();

      if (duplicate) {
        assertWebhookAmountMatchesPayment(paymentEntity, duplicate);

        return {
          handled: true,
          duplicate: true,
          gateway_txn_id: gatewayTxnId
        };
      }

      const payment = await Payment.findOne({
        gateway: 'razorpay',
        gateway_order_id: gatewayOrderId
      }).sort({ created_at: -1 }).session(session).exec();

      if (!payment) {
        throw new NotFoundError('Payment session not found');
      }

      assertWebhookAmountMatchesPayment(paymentEntity, payment);

      if (payment.gateway_txn_id) {
        return {
          handled: true,
          duplicate: true,
          gateway_txn_id: payment.gateway_txn_id
        };
      }

      const order = await Order.findById(payment.order_id)
        .populate('campus_id', 'cutoff_time')
        .session(session)
        .exec();

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      await Payment.findByIdAndUpdate(payment._id, {
        gateway_txn_id: gatewayTxnId,
        status: 'captured',
        webhook_payload: webhook
      }, { session });

      const populated = order as unknown as { campus_id: { cutoff_time: string } };
      const cutoffPassed = isCutoffPassed(populated.campus_id?.cutoff_time ?? '', paymentEventDate);
      
      const transition = cutoffPassed
        ? await Order.findOneAndUpdate(
            { _id: order._id, order_status: 'cart', payment_status: 'pending' },
            { payment_status: 'late', updated_at: new Date() },
            { new: true, session }
          ).exec()
        : await Order.findOneAndUpdate(
            { _id: order._id, order_status: 'cart', payment_status: 'pending' },
            { order_status: 'placed', payment_status: 'success', placed_at: new Date(), updated_at: new Date() },
            { new: true, session }
          ).exec();

      if (!transition) {
        return {
          handled: true,
          duplicate: false,
          order_id: (order._id as Types.ObjectId).toString(),
          order_status: order.order_status,
          payment_status: order.payment_status
        };
      }

      if (cutoffPassed) {
        await Refund.create([{
          order_id: (order._id as Types.ObjectId).toString(),
          order_item_id: null,
          amount: order.total_amount,
          reason: 'payment_after_cutoff',
          status: 'pending',
          initiated_by: null
        }], { session });
      }

      await AuditLog.create([{
        order_id: (order._id as Types.ObjectId).toString(),
        actor_id: null,
        action: cutoffPassed ? 'payment.late' : 'payment.success',
        details: {
          gateway: 'razorpay',
          gateway_order_id: gatewayOrderId,
          gateway_txn_id: gatewayTxnId,
          payment_event_at: paymentEventDate.toISOString(),
          order_status: transition.order_status,
          payment_status: transition.payment_status
        }
      }], { session });

      return {
        handled: true,
        duplicate: false,
        order_id: (order._id as Types.ObjectId).toString(),
        order_status: transition.order_status,
        payment_status: transition.payment_status
      };
    });
  },

  async handleRazorpayRefundWebhook(rawBody: string | undefined, signature: string | undefined) {
    if (!rawBody) {
      throw new BadRequestError('Missing refund webhook payload');
    }

    verifyRazorpaySignature(rawBody, signature);
    const webhook = parseWebhook(rawBody) as {
      event?: string;
      payload?: {
        refund?: {
          entity?: {
            id?: string;
            order_id?: string;
            payment_id?: string;
            status?: string;
            amount?: number;
          };
        };
      };
    };

    if (webhook.event !== 'refund.processed' && webhook.event !== 'refund.failed') {
      return {
        handled: false,
        ignored: true,
        event: webhook.event ?? null
      };
    }

    const refundEntity = webhook.payload?.refund?.entity;
    const gatewayRefundId = refundEntity?.id;
    if (!gatewayRefundId) {
      throw new BadRequestError('Refund webhook is missing gateway refund id');
    }

    return withTransaction(async (session: ClientSession) => {
      const refund = await Refund.findOne({ gateway_refund_id: gatewayRefundId }).session(session).exec();
      if (!refund) {
        throw new NotFoundError('Refund not found for gateway refund id');
      }

      const targetStatus = webhook.event === 'refund.processed' ? 'processed' : 'failed';
      if (refund.status === targetStatus) {
        return {
          handled: true,
          duplicate: true,
          gateway_refund_id: gatewayRefundId
        };
      }

      const result = await Refund.findByIdAndUpdate(
        refund._id,
        {
          status: targetStatus,
          ...(targetStatus === 'processed' || targetStatus === 'failed' ? { processed_at: new Date() } : {})
        },
        { new: true, session }
      ).exec();

      if (result) {
        await AuditLog.create([{
          order_id: (refund.order_id as Types.ObjectId).toString() ?? null,
          actor_id: null,
          action: targetStatus === 'processed' ? 'refund.processed' : 'refund.failed',
          details: {
            refund_id: (refund._id as Types.ObjectId).toString(),
            gateway_refund_id: gatewayRefundId,
            status: targetStatus
          }
        }], { session });
      }

      return {
        handled: true,
        duplicate: false,
        gateway_refund_id: gatewayRefundId,
        status: targetStatus
      };
    });
  }
};