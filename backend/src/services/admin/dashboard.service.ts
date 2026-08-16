import { Order } from '../../models/order.model';
import { User } from '../../models/user.model';
import { Batch } from '../../models/batch.model';
import { Restaurant } from '../../models/restaurant.model';
import { MenuItem } from '../../models/menu-item.model';

function startOfTodayIST() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setHours(0, 0, 0, 0);
  // convert back approximating offset
  const offsetMs = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getTime();
  return new Date(ist.getTime() + offsetMs);
}

function daysAgoIST(days: number) {
  const start = startOfTodayIST();
  start.setDate(start.getDate() - days);
  return start;
}

export class DashboardService {
  async getStats() {
    const todayStart = startOfTodayIST();
    const fourteenDaysAgo = daysAgoIST(13);

    const [
      ordersToday,
      gmvTodayAgg,
      activeUsers,
      openBatches,
      totalRestaurants,
      availableMenuItems,
      recentOrders,
      ordersByStatus,
      ordersLast14Days
    ] = await Promise.all([
      Order.countDocuments({
        order_status: { $ne: 'cart' },
        placed_at: { $gte: todayStart }
      }),
      Order.aggregate([
        {
          $match: {
            order_status: { $nin: ['cart', 'cancelled'] },
            payment_status: { $in: ['success', 'partially_refunded'] },
            placed_at: { $gte: todayStart }
          }
        },
        { $group: { _id: null, gmv: { $sum: { $toDouble: '$total_amount' } } } }
      ]),
      User.countDocuments({ is_active: true, role: 'student' }),
      Batch.countDocuments({ batch_status: { $in: ['pending', 'locked', 'out_for_delivery'] } }),
      Restaurant.countDocuments({ is_active: true }),
      MenuItem.countDocuments({ is_available: true }),
      Order.find({ order_status: { $ne: 'cart' } })
        .sort({ placed_at: -1, created_at: -1 })
        .limit(8)
        .exec(),
      Order.aggregate([
        { $match: { order_status: { $ne: 'cart' } } },
        { $group: { _id: '$order_status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Order.aggregate([
        {
          $match: {
            order_status: { $ne: 'cart' },
            placed_at: { $gte: fourteenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$placed_at', timezone: 'Asia/Kolkata' }
            },
            order_count: { $sum: 1 },
            gmv: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$order_status', 'cancelled'] },
                      { $in: ['$payment_status', ['success', 'partially_refunded']] }
                    ]
                  },
                  { $toDouble: '$total_amount' },
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const restaurantIds = [
      ...new Set(recentOrders.map((o) => o.restaurant_id?.toString()).filter(Boolean))
    ] as string[];
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).exec();
    const restaurantMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

    // Fill missing days in the last 14-day window
    const dayMap = new Map(
      ordersLast14Days.map((row) => [
        row._id as string,
        { order_count: row.order_count as number, gmv: Number(row.gmv ?? 0) }
      ])
    );
    const filledDays: { date: string; order_count: number; gmv: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = daysAgoIST(i);
      const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const row = dayMap.get(key);
      filledDays.push({
        date: key,
        order_count: row?.order_count ?? 0,
        gmv: (row?.gmv ?? 0).toFixed(2)
      });
    }

    return {
      orders_today: ordersToday,
      gmv_today: Number(gmvTodayAgg[0]?.gmv ?? 0).toFixed(2),
      active_users: activeUsers,
      open_batches: openBatches,
      active_restaurants: totalRestaurants,
      available_menu_items: availableMenuItems,
      recent_orders: recentOrders.map((o) => ({
        id: o._id.toString(),
        restaurant_name: o.restaurant_id
          ? restaurantMap.get(o.restaurant_id.toString()) ?? null
          : 'Campus extras',
        order_status: o.order_status,
        payment_status: o.payment_status,
        total_amount: o.total_amount,
        placed_at: o.placed_at
      })),
      orders_by_status: ordersByStatus.map((row) => ({
        status: row._id as string,
        count: row.count as number
      })),
      orders_last_14_days: filledDays
    };
  }
}

export const dashboardService = new DashboardService();
