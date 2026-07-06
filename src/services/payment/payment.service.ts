import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { env } from '../../config/env';
import { orderRepository, type OrderRow, type OrderWithCutoffRow } from '../../repositories/order.repository';
import { paymentRepository, type PaymentRow } from '../../repositories/payment.repository';
import { opsRepository } from '../../repositories/ops.repository';
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

interface PaymentInitiationSnapshot {
  dropPoint: string;
  itemCount: number;
  totalAmount: string;
}

export function verifyRazorpaySignature(rawBody: string, signature: string | undefined) {
  if (!signature) {
    throw new UnauthorizedError('Missing payment webhook signature');
  }

  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
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

function formatExistingSession(payment: PaymentRow) {
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

async function assertPaymentInitiationReady(order: OrderWithCutoffRow): Promise<PaymentInitiationSnapshot> {
  if (order.order_status !== 'cart' || order.payment_status !== 'pending') {
    throw new ConflictError('Order is not awaiting payment');
  }

  if (!order.drop_point || order.drop_point.trim() === '') {
    throw new BadRequestError('Drop point is required before payment');
  }

  const itemCount = await orderRepository.countItemsForOrder(order.id);

  if (itemCount === 0) {
    throw new BadRequestError('Order has no items');
  }

  if (isCutoffPassed(order.cutoff_time)) {
    throw new ConflictError('Campus cutoff time has passed; payment cannot be initiated');
  }

  return {
    dropPoint: order.drop_point,
    itemCount,
    totalAmount: order.total_amount
  };
}

function assertLockedOrderMatchesSnapshot(
  order: OrderWithCutoffRow,
  snapshot: PaymentInitiationSnapshot,
  itemCount: number
) {
  if (
    order.drop_point !== snapshot.dropPoint ||
    order.total_amount !== snapshot.totalAmount ||
    itemCount !== snapshot.itemCount
  ) {
    throw new ConflictError('Order changed while payment was being initiated; please retry');
  }
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

function assertWebhookAmountMatchesPayment(paymentEntity: RazorpayPaymentEntity | undefined, payment: PaymentRow) {
  if (paymentEntity?.amount !== decimalToSubunits(payment.amount)) {
    throw new BadRequestError('Captured payment webhook amount does not match payment session');
  }
}

async function insertPendingRefund(
  client: PoolClient,
  order: Pick<OrderRow, 'id' | 'total_amount'>,
  data: { reason: 'payment_after_cutoff' | 'payment_after_cutoff_race'; gatewayOrderId: string; gatewayTxnId: string }
) {
  await orderRepository.insertFullOrderRefund(client, {
    order_id: order.id,
    amount: order.total_amount,
    reason: data.reason,
    initiated_by: null
  });

  await orderRepository.insertAudit(client, {
    order_id: order.id,
    actor_id: null,
    action: 'refund.created',
    details: {
      status: 'pending',
      reason: data.reason,
      amount: order.total_amount,
      order_item_id: null,
      gateway: 'razorpay',
      gateway_order_id: data.gatewayOrderId,
      gateway_txn_id: data.gatewayTxnId
    }
  });
}

export const paymentService = {
  async initiateRazorpayPayment(studentId: string, orderId: string) {
    const order = await orderRepository.findAwaitingPaymentForStudent(orderId, studentId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const snapshot = await assertPaymentInitiationReady(order);

    const existingSession = await paymentRepository.findPendingRazorpaySessionForOrder(order.id);

    if (existingSession) {
      return formatExistingSession(existingSession);
    }

    const amountSubunits = decimalToSubunits(order.total_amount);
    const gatewayOrder = await razorpayGatewayService.createOrder({
      amountSubunits,
      receipt: order.id,
      notes: {
        internal_order_id: order.id,
        campus_id: order.campus_id,
        student_id: studentId
      }
    });

    return orderRepository.withTransaction(async (client) => {
      const lockedOrder = await orderRepository.findAwaitingPaymentForStudentForUpdate(client, orderId, studentId);

      if (!lockedOrder) {
        throw new NotFoundError('Order not found');
      }

      if (lockedOrder.order_status !== 'cart' || lockedOrder.payment_status !== 'pending') {
        throw new ConflictError('Order is not awaiting payment');
      }

      if (isCutoffPassed(lockedOrder.cutoff_time)) {
        throw new ConflictError('Campus cutoff time has passed; payment cannot be initiated');
      }

      const lockedItemCount = await orderRepository.countItems(client, lockedOrder.id);
      assertLockedOrderMatchesSnapshot(lockedOrder, snapshot, lockedItemCount);

      const payment = await paymentRepository.createRazorpaySessionIfAbsent(client, {
        order_id: lockedOrder.id,
        gateway_order_id: gatewayOrder.id,
        amount: lockedOrder.total_amount
      });

      if (!payment) {
        const racedSession = await paymentRepository.findPendingRazorpaySessionForOrderForUpdate(client, lockedOrder.id);

        if (!racedSession) {
          throw new ConflictError('Payment session was created by another request but could not be loaded');
        }

        return formatExistingSession(racedSession);
      }

      await orderRepository.insertAudit(client, {
        order_id: lockedOrder.id,
        actor_id: studentId,
        action: 'payment.session_created',
        details: {
          gateway: 'razorpay',
          gateway_order_id: payment.gateway_order_id,
          amount: payment.amount
        }
      });

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

    return orderRepository.withTransaction(async (client) => {
      const duplicate = await paymentRepository.findRazorpayTxnForUpdate(client, gatewayTxnId);

      if (duplicate) {
        assertWebhookAmountMatchesPayment(paymentEntity, duplicate);

        return {
          handled: true,
          duplicate: true,
          gateway_txn_id: gatewayTxnId
        };
      }

      const payment = await paymentRepository.findRazorpaySessionByGatewayOrderIdForUpdate(client, gatewayOrderId);

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

      const order = await orderRepository.findByIdWithCutoffForUpdate(client, payment.order_id);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      await paymentRepository.markRazorpayPaymentCaptured(client, payment.id, {
        gateway_txn_id: gatewayTxnId,
        webhook_payload: webhook
      });

      const cutoffPassed = isCutoffPassed(order.cutoff_time, paymentEventDate);
      const transition = cutoffPassed
        ? await orderRepository.markPaymentLate(client, order.id)
        : await orderRepository.markPaymentSuccess(client, order.id);

      if (transition.rowCount === 0 || !transition.order) {
        const currentOrder = await orderRepository.findByIdWithCutoffForUpdate(client, order.id);

        if (!currentOrder) {
          throw new NotFoundError('Order not found');
        }

        if (currentOrder.order_status === 'locked' && !cutoffPassed) {
          await orderRepository.insertAudit(client, {
            order_id: currentOrder.id,
            actor_id: null,
            action: 'payment.success_near_miss_locked',
            details: {
              gateway: 'razorpay',
              gateway_order_id: gatewayOrderId,
              gateway_txn_id: gatewayTxnId,
              payment_event_at: paymentEventDate.toISOString(),
              order_status: currentOrder.order_status,
              payment_status: currentOrder.payment_status,
              batch_id: currentOrder.batch_id
            }
          });

          if (env.NODE_ENV !== 'test') {
            console.warn('payment.success_near_miss_locked', {
              order_id: currentOrder.id,
              gateway_order_id: gatewayOrderId,
              gateway_txn_id: gatewayTxnId,
              payment_event_at: paymentEventDate.toISOString(),
              batch_id: currentOrder.batch_id
            });
          }

          return {
            handled: true,
            duplicate: false,
            order_id: currentOrder.id,
            order_status: currentOrder.order_status,
            payment_status: currentOrder.payment_status
          };
        }

        if (currentOrder.order_status === 'locked' && cutoffPassed) {
          await insertPendingRefund(client, currentOrder, {
            reason: 'payment_after_cutoff_race',
            gatewayOrderId,
            gatewayTxnId
          });

          return {
            handled: true,
            duplicate: false,
            order_id: currentOrder.id,
            order_status: currentOrder.order_status,
            payment_status: currentOrder.payment_status,
            refund_status: 'pending'
          };
        }

        throw new ConflictError('Order is no longer awaiting payment', {
          order_id: currentOrder.id,
          order_status: currentOrder.order_status,
          payment_status: currentOrder.payment_status
        });
      }

      if (cutoffPassed) {
        await insertPendingRefund(client, transition.order, {
          reason: 'payment_after_cutoff',
          gatewayOrderId,
          gatewayTxnId
        });
      }

      await orderRepository.insertAudit(client, {
        order_id: order.id,
        actor_id: null,
        action: cutoffPassed ? 'payment.late' : 'payment.success',
        details: {
          gateway: 'razorpay',
          gateway_order_id: gatewayOrderId,
          gateway_txn_id: gatewayTxnId,
          payment_event_at: paymentEventDate.toISOString(),
          order_status: transition.order.order_status,
          payment_status: transition.order.payment_status
        }
      });

      return {
        handled: true,
        duplicate: false,
        order_id: order.id,
        order_status: transition.order.order_status,
        payment_status: transition.order.payment_status
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

    return orderRepository.withTransaction(async (client) => {
      const refund = await opsRepository.findRefundByGatewayRefundIdForUpdate(client, gatewayRefundId);
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

      const result = await opsRepository.updateRefundStatus(client, refund.id, targetStatus);
      if (result.rowCount > 0) {
        await orderRepository.insertAudit(client, {
          order_id: refund.order_id,
          actor_id: null,
          action: targetStatus === 'processed' ? 'refund.processed' : 'refund.failed',
          details: {
            refund_id: refund.id,
            gateway_refund_id: gatewayRefundId,
            status: targetStatus
          }
        });
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

