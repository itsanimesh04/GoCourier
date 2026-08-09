import { Payment } from '../../models/payment.model';
import { Refund } from '../../models/refund.model';
import { Order } from '../../models/order.model';
import { NotFoundError } from '../../utils/errors';

export class AdminPaymentService {
  async list(query: {
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.created_at = {};
      if (query.from) (filter.created_at as Record<string, Date>).$gte = new Date(query.from);
      if (query.to) (filter.created_at as Record<string, Date>).$lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Payment.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      Payment.countDocuments(filter)
    ]);

    return {
      items: docs.map((doc) => ({
        id: doc._id.toString(),
        order_id: doc.order_id.toString(),
        gateway: doc.gateway,
        gateway_order_id: doc.gateway_order_id,
        gateway_txn_id: doc.gateway_txn_id,
        amount: doc.amount,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })),
      total,
      page,
      limit
    };
  }

  async getById(id: string) {
    const doc = await Payment.findById(id).exec();
    if (!doc) throw new NotFoundError('Payment not found');

    const [order, refunds] = await Promise.all([
      Order.findById(doc.order_id).exec(),
      Refund.find({ order_id: doc.order_id }).exec()
    ]);

    return {
      id: doc._id.toString(),
      order_id: doc.order_id.toString(),
      gateway: doc.gateway,
      gateway_order_id: doc.gateway_order_id,
      gateway_txn_id: doc.gateway_txn_id,
      amount: doc.amount,
      status: doc.status,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      order: order
        ? {
            id: order._id.toString(),
            order_status: order.order_status,
            payment_status: order.payment_status,
            total_amount: order.total_amount
          }
        : null,
      refunds: refunds.map((r) => ({
        id: r._id.toString(),
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        gateway_refund_id: r.gateway_refund_id,
        created_at: r.created_at
      }))
    };
  }

  async listRefunds(query: { status?: string; page?: number; limit?: number } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Refund.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      Refund.countDocuments(filter)
    ]);

    return {
      items: docs.map((r) => ({
        id: r._id.toString(),
        order_id: r.order_id.toString(),
        order_item_id: r.order_item_id?.toString() ?? null,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        gateway_refund_id: r.gateway_refund_id,
        created_at: r.created_at
      })),
      total,
      page,
      limit
    };
  }
}

export const adminPaymentService = new AdminPaymentService();
