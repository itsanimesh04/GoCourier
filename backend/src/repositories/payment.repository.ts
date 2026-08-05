import type { ClientSession, Types } from 'mongoose';
import { Payment, type IPayment } from '../models/payment.model';

export interface PaymentRow {
  id: string;
  order_id: string;
  gateway: string;
  gateway_order_id: string | null;
  gateway_txn_id: string | null;
  amount: string;
  status: string;
  webhook_payload: unknown;
  created_at: Date;
}

function toPaymentRow(doc: IPayment): PaymentRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    order_id: (doc.order_id as Types.ObjectId).toString(),
    gateway: doc.gateway,
    gateway_order_id: doc.gateway_order_id,
    gateway_txn_id: doc.gateway_txn_id,
    amount: doc.amount,
    status: doc.status,
    webhook_payload: doc.webhook_payload,
    created_at: doc.created_at
  };
}

export const paymentRepository = {
  async findPendingRazorpaySessionForOrder(orderId: string): Promise<PaymentRow | null> {
    const doc = await Payment.findOne({
      order_id: orderId,
      gateway: 'razorpay',
      gateway_order_id: { $ne: null },
      gateway_txn_id: null,
      status: 'created'
    }).sort({ created_at: -1 }).exec();

    return doc ? toPaymentRow(doc) : null;
  },

  async findPendingRazorpaySessionForOrderForUpdate(
    session: ClientSession,
    orderId: string
  ): Promise<PaymentRow | null> {
    const doc = await Payment.findOne({
      order_id: orderId,
      gateway: 'razorpay',
      gateway_order_id: { $ne: null },
      gateway_txn_id: null,
      status: 'created'
    })
      .sort({ created_at: -1 })
      .session(session)
      .exec();

    return doc ? toPaymentRow(doc) : null;
  },

  async createRazorpaySessionIfAbsent(
    session: ClientSession,
    data: { order_id: string; gateway_order_id: string; amount: string }
  ): Promise<PaymentRow | null> {
    // Check if session already exists
    const existing = await Payment.findOne({
      order_id: data.order_id,
      gateway: 'razorpay',
      gateway_order_id: { $ne: null },
      gateway_txn_id: null,
      status: 'created'
    }).session(session).exec();

    if (existing) return null;

    const doc = await Payment.create([{
      order_id: data.order_id,
      gateway: 'razorpay',
      gateway_order_id: data.gateway_order_id,
      amount: data.amount,
      status: 'created'
    }], { session });

    return toPaymentRow(doc[0]);
  },

  async findRazorpayTxnForUpdate(session: ClientSession, gatewayTxnId: string): Promise<PaymentRow | null> {
    const doc = await Payment.findOne({
      gateway: 'razorpay',
      gateway_txn_id: gatewayTxnId
    })
      .session(session)
      .exec();

    return doc ? toPaymentRow(doc) : null;
  },

  async findRazorpaySessionByGatewayOrderIdForUpdate(
    session: ClientSession,
    gatewayOrderId: string
  ): Promise<PaymentRow | null> {
    const doc = await Payment.findOne({
      gateway: 'razorpay',
      gateway_order_id: gatewayOrderId
    })
      .sort({ created_at: -1 })
      .session(session)
      .exec();

    return doc ? toPaymentRow(doc) : null;
  },

  async markRazorpayPaymentCaptured(
    session: ClientSession,
    paymentId: string,
    data: { gateway_txn_id: string; webhook_payload: unknown }
  ): Promise<PaymentRow> {
    const doc = await Payment.findByIdAndUpdate(
      paymentId,
      {
        gateway_txn_id: data.gateway_txn_id,
        status: 'captured',
        webhook_payload: data.webhook_payload
      },
      { new: true, session }
    ).exec()!;

    return toPaymentRow(doc);
  },

  async findCapturedPaymentForOrder(session: ClientSession, orderId: string): Promise<PaymentRow | null> {
    const doc = await Payment.findOne({
      order_id: orderId,
      status: 'captured'
    })
      .sort({ created_at: -1 })
      .session(session)
      .exec();

    return doc ? toPaymentRow(doc) : null;
  }
};