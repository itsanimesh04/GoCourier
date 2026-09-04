import { Order, type OrderStatus } from '../../models/order.model';
import { OrderItem } from '../../models/order-item.model';
import { Restaurant } from '../../models/restaurant.model';
import { User } from '../../models/user.model';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const ALLOWED_STATUS: OrderStatus[] = [
  'placed',
  'locked',
  'procuring',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'closed',
  'cancelled'
];

function mapOrder(doc: InstanceType<typeof Order>) {
  return {
    id: doc._id.toString(),
    student_id: doc.student_id.toString(),
    campus_id: doc.campus_id.toString(),
    restaurant_id: doc.restaurant_id?.toString() ?? null,
    batch_id: doc.batch_id?.toString() ?? null,
    drop_point: doc.drop_point,
    order_kind: doc.order_kind ?? 'food',
    order_status: doc.order_status,
    payment_status: doc.payment_status,
    subtotal: doc.subtotal,
    fee: doc.fee,
    total_amount: doc.total_amount,
    placed_at: doc.placed_at,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class AdminOrderService {
  async list(query: {
    order_status?: OrderStatus;
    payment_status?: string;
    campus_id?: string;
    restaurant_id?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const filter: Record<string, unknown> = {
      order_status: { $ne: 'cart' }
    };
    if (query.order_status) filter.order_status = query.order_status;
    if (query.payment_status) filter.payment_status = query.payment_status;
    if (query.campus_id) filter.campus_id = query.campus_id;
    if (query.restaurant_id) filter.restaurant_id = query.restaurant_id;
    if (query.from || query.to) {
      filter.placed_at = {};
      if (query.from) (filter.placed_at as Record<string, Date>).$gte = new Date(query.from);
      if (query.to) (filter.placed_at as Record<string, Date>).$lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Order.find(filter).sort({ placed_at: -1, created_at: -1 }).skip(skip).limit(limit).exec(),
      Order.countDocuments(filter)
    ]);

    const restaurantIds = [...new Set(docs.map((d) => d.restaurant_id?.toString()).filter(Boolean))] as string[];
    const studentIds = [...new Set(docs.map((d) => d.student_id.toString()))];
    const [restaurants, students] = await Promise.all([
      Restaurant.find({ _id: { $in: restaurantIds } }).exec(),
      User.find({ _id: { $in: studentIds } }).exec()
    ]);
    const restaurantMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));
    const studentMap = new Map(
      students.map((s) => [s._id.toString(), { name: s.name, email: s.email, phone: s.phone }])
    );

    return {
      items: docs.map((doc) => ({
        ...mapOrder(doc),
        restaurant_name: doc.restaurant_id
          ? restaurantMap.get(doc.restaurant_id.toString()) ?? null
          : 'Campus extras',
        student: studentMap.get(doc.student_id.toString()) ?? null
      })),
      total,
      page,
      limit
    };
  }

  async getById(id: string) {
    const doc = await Order.findById(id).exec();
    if (!doc) throw new NotFoundError('Order not found');

    const [items, restaurant, student] = await Promise.all([
      OrderItem.find({ order_id: id }).exec(),
      Restaurant.findById(doc.restaurant_id).exec(),
      User.findById(doc.student_id).exec()
    ]);

    return {
      ...mapOrder(doc),
      restaurant_name: restaurant?.name ?? null,
      student: student
        ? {
            id: student._id.toString(),
            name: student.name,
            email: student.email,
            phone: student.phone
          }
        : null,
      items: items.map((item) => {
        const unit = Number(item.price_snapshot);
        const lineTotal = (Number.isFinite(unit) ? unit : 0) * item.quantity;
        return {
          id: item._id.toString(),
          item_kind: item.item_kind ?? 'food',
          menu_item_id: item.menu_item_id?.toString() ?? null,
          extras_product_id: item.extras_product_id?.toString() ?? null,
          name: item.item_name_snap,
          quantity: item.quantity,
          unit_price: item.price_snapshot,
          line_total: lineTotal.toFixed(2),
          item_status: item.item_status,
          refund_amount: item.refund_amount,
          note: item.note ?? null,
          image_url: item.image_url ?? null,
          addon_snapshot: item.addon_snapshot ?? [],
          option_snapshot: item.option_snapshot ?? null,
          pickup_point: item.pickup_point ?? null,
          drop_point: item.drop_point ?? null,
          size: item.size ?? null
        };
      })
    };
  }

  async updateStatus(id: string, order_status: OrderStatus) {
    if (!ALLOWED_STATUS.includes(order_status)) {
      throw new BadRequestError('Invalid order status');
    }
    const doc = await Order.findByIdAndUpdate(id, { order_status }, { new: true }).exec();
    if (!doc) throw new NotFoundError('Order not found');
    return mapOrder(doc);
  }
}

export const adminOrderService = new AdminOrderService();
