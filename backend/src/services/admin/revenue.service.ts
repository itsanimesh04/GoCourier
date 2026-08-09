import { Order } from '../../models/order.model';
import { Refund } from '../../models/refund.model';

export class RevenueService {
  async summary(query: { from?: string; to?: string; campus_id?: string } = {}) {
    const match: Record<string, unknown> = {
      order_status: { $nin: ['cart', 'cancelled'] },
      payment_status: { $in: ['success', 'partially_refunded', 'refunded'] }
    };
    if (query.campus_id) match.campus_id = query.campus_id;
    if (query.from || query.to) {
      match.placed_at = {};
      if (query.from) (match.placed_at as Record<string, Date>).$gte = new Date(query.from);
      if (query.to) (match.placed_at as Record<string, Date>).$lte = new Date(query.to);
    }

    const [orderAgg, refundAgg, byDay, byCampus] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            gmv: { $sum: { $toDouble: '$total_amount' } },
            fees: { $sum: { $toDouble: '$fee' } },
            subtotal: { $sum: { $toDouble: '$subtotal' } },
            order_count: { $sum: 1 }
          }
        }
      ]),
      Refund.aggregate([
        {
          $match: {
            status: { $in: ['processed', 'initiated'] },
            ...(query.from || query.to
              ? {
                  created_at: {
                    ...(query.from ? { $gte: new Date(query.from) } : {}),
                    ...(query.to ? { $lte: new Date(query.to) } : {})
                  }
                }
              : {})
          }
        },
        {
          $group: {
            _id: null,
            refunds: { $sum: { $toDouble: '$amount' } },
            refund_count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$placed_at', timezone: 'Asia/Kolkata' }
            },
            gmv: { $sum: { $toDouble: '$total_amount' } },
            order_count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 60 }
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$campus_id',
            gmv: { $sum: { $toDouble: '$total_amount' } },
            order_count: { $sum: 1 }
          }
        },
        { $sort: { gmv: -1 } }
      ])
    ]);

    const totals = orderAgg[0] ?? { gmv: 0, fees: 0, subtotal: 0, order_count: 0 };
    const refunds = refundAgg[0] ?? { refunds: 0, refund_count: 0 };

    return {
      gmv: Number(totals.gmv ?? 0).toFixed(2),
      fees: Number(totals.fees ?? 0).toFixed(2),
      subtotal: Number(totals.subtotal ?? 0).toFixed(2),
      refunds: Number(refunds.refunds ?? 0).toFixed(2),
      net_revenue: (Number(totals.gmv ?? 0) - Number(refunds.refunds ?? 0)).toFixed(2),
      order_count: totals.order_count ?? 0,
      refund_count: refunds.refund_count ?? 0,
      by_day: byDay.map((row) => ({
        date: row._id,
        gmv: Number(row.gmv ?? 0).toFixed(2),
        order_count: row.order_count
      })),
      by_campus: byCampus.map((row) => ({
        campus_id: row._id?.toString() ?? null,
        gmv: Number(row.gmv ?? 0).toFixed(2),
        order_count: row.order_count
      }))
    };
  }
}

export const revenueService = new RevenueService();
