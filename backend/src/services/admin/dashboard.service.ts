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

export class DashboardService {
  async getStats() {
    const todayStart = startOfTodayIST();

    const [
      ordersToday,
      gmvTodayAgg,
      activeUsers,
      openBatches,
      totalRestaurants,
      availableMenuItems,
      recentOrders
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
        .exec()
    ]);

    const restaurantIds = [...new Set(recentOrders.map((o) => o.restaurant_id.toString()))];
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).exec();
    const restaurantMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

    return {
      orders_today: ordersToday,
      gmv_today: Number(gmvTodayAgg[0]?.gmv ?? 0).toFixed(2),
      active_users: activeUsers,
      open_batches: openBatches,
      active_restaurants: totalRestaurants,
      available_menu_items: availableMenuItems,
      recent_orders: recentOrders.map((o) => ({
        id: o._id.toString(),
        restaurant_name: restaurantMap.get(o.restaurant_id.toString()) ?? null,
        order_status: o.order_status,
        payment_status: o.payment_status,
        total_amount: o.total_amount,
        placed_at: o.placed_at
      }))
    };
  }
}

export const dashboardService = new DashboardService();
