import type { ClientSession, Types } from 'mongoose';
import { startSession } from 'mongoose';
import { Order, type IOrder } from '../models/order.model';
import { OrderItem, type IOrderItem } from '../models/order-item.model';
import { AuditLog, type IAuditLog } from '../models/audit-log.model';

export type OrderStatus =
  | 'cart'
  | 'placed'
  | 'locked'
  | 'procuring'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'late' | 'refunded' | 'partially_refunded';

export interface OrderRow {
  id: string;
  student_id: string;
  campus_id: string;
  restaurant_id: string;
  batch_id: string | null;
  drop_point: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  fee: string;
  total_amount: string;
  placed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemInsert {
  menu_item_id: string;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
}

export interface CartHeaderRow extends OrderRow {
  campus_name: string;
  campus_city: string;
  cutoff_time: string;
  delivery_time: string;
  restaurant_name: string;
}

export interface OrderWithCutoffRow extends OrderRow {
  cutoff_time: string;
}

export interface OrderTransitionResult {
  rowCount: number;
  order: OrderRow | null;
}

export interface CartItemDetailRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
  item_status: 'pending' | 'confirmed' | 'unavailable' | 'refunded';
  refund_amount: string | null;
  menu_item_name: string;
  is_veg: boolean | null;
  is_available: boolean;
}

export interface CustomerOrderDetailHeaderRow extends OrderRow {
  campus_name: string;
  campus_city: string;
  cutoff_time: string;
  delivery_time: string;
  restaurant_name: string;
  batch_service_date: string | null;
  batch_status: string | null;
  delivery_agent_id: string | null;
}

export interface CustomerOrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: string;
  quantity: number;
  line_total: string;
  item_status: 'pending' | 'confirmed' | 'unavailable' | 'refunded';
  refund_amount: string;
  is_veg: boolean | null;
}

export interface CustomerRefundRow {
  id: string;
  order_id: string;
  order_item_id: string | null;
  amount: string;
  reason: string;
  status: string;
  gateway_refund_id: string | null;
  created_at: Date;
  processed_at: Date | null;
}

export interface CustomerDeliveryAttemptRow {
  id: string;
  order_id: string;
  batch_id: string;
  agent_id: string | null;
  result: string | null;
  proof_type: string | null;
  not_delivered_reason: string | null;
  attempted_at: Date;
}

export interface CustomerOrderListRow extends OrderRow {
  campus_name: string;
  campus_city: string;
  restaurant_name: string;
  item_count: number;
  latest_activity_at: Date;
}

function toOrderRow(doc: IOrder): OrderRow {
  return {
    id: doc._id.toString(),
    student_id: doc.student_id.toString(),
    campus_id: doc.campus_id.toString(),
    restaurant_id: doc.restaurant_id.toString(),
    batch_id: doc.batch_id?.toString() ?? null,
    drop_point: doc.drop_point,
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

export const orderRepository = {
  async withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await startSession();
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
  },

  async findOpenCartForStudentForUpdate(
    session: ClientSession,
    studentId: string
  ): Promise<OrderRow | null> {
    const doc = await Order.findOne({
      student_id: studentId,
      order_status: 'cart',
      payment_status: 'pending'
    })
      .sort({ created_at: -1 })
      .session(session)
      .exec();
    return doc ? toOrderRow(doc as unknown as IOrder) : null;
  },

  async findOpenCartForStudent(studentId: string): Promise<OrderRow | null> {
    const doc = await Order.findOne({
      student_id: studentId,
      order_status: 'cart',
      payment_status: 'pending'
    })
      .sort({ created_at: -1 })
      .exec();
    return doc ? toOrderRow(doc as unknown as IOrder) : null;
  },

  async findAwaitingPaymentForStudent(orderId: string, studentId: string): Promise<OrderWithCutoffRow | null> {
    const doc = await Order.findOne({
      _id: orderId,
      student_id: studentId
    }).exec();

    if (!doc) return null;

    // Get campus cutoff time via population
    const populated = await Order.findById(doc._id)
      .populate('campus_id', 'cutoff_time')
      .exec();

    if (!populated) return null;

    return {
      ...toOrderRow(populated as unknown as IOrder),
      cutoff_time: (populated as unknown as { campus_id: { cutoff_time: string } }).campus_id?.cutoff_time ?? ''
    };
  },

  async findAwaitingPaymentForStudentForUpdate(
    session: ClientSession,
    orderId: string,
    studentId: string
  ): Promise<OrderWithCutoffRow | null> {
    const doc = await Order.findOne({
      _id: orderId,
      student_id: studentId
    })
      .session(session)
      .exec();

    if (!doc) return null;

    const populated = await Order.findById(doc._id)
      .populate('campus_id', 'cutoff_time')
      .session(session)
      .exec();

    if (!populated) return null;

    return {
      ...toOrderRow(populated as unknown as IOrder),
      cutoff_time: (populated as unknown as { campus_id: { cutoff_time: string } }).campus_id?.cutoff_time ?? ''
    };
  },

  async findByIdWithCutoffForUpdate(
    session: ClientSession,
    orderId: string
  ): Promise<OrderWithCutoffRow | null> {
    const doc = await Order.findById(orderId)
      .populate('campus_id', 'cutoff_time')
      .session(session)
      .exec();

    if (!doc) return null;

    return {
      ...toOrderRow(doc as unknown as IOrder),
      cutoff_time: (doc as unknown as { campus_id: { cutoff_time: string } }).campus_id?.cutoff_time ?? ''
    };
  },

  async createCart(
    session: ClientSession,
    data: {
      student_id: string;
      campus_id: string;
      restaurant_id: string;
      subtotal: string;
      fee: string;
      total_amount: string;
    }
  ): Promise<OrderRow> {
    const doc = await Order.create([{
      student_id: data.student_id,
      campus_id: data.campus_id,
      restaurant_id: data.restaurant_id,
      drop_point: null,
      subtotal: data.subtotal,
      fee: data.fee,
      total_amount: data.total_amount
    }], { session });

    return toOrderRow(doc[0] as unknown as IOrder);
  },

  async updateCartTotals(
    session: ClientSession,
    orderId: string,
    data: { subtotal: string; fee: string; total_amount: string; restaurant_id?: string }
  ): Promise<OrderRow> {
    const updateData: Record<string, unknown> = {
      subtotal: data.subtotal,
      fee: data.fee,
      total_amount: data.total_amount,
      updated_at: new Date()
    };

    if (data.restaurant_id) {
      updateData.restaurant_id = data.restaurant_id;
    }

    const doc = await Order.findByIdAndUpdate(orderId, updateData, { 
      new: true, 
      session
    }).exec();

    return toOrderRow(doc as unknown as IOrder);
  },

  async replaceCartItems(
    session: ClientSession,
    orderId: string,
    items: OrderItemInsert[]
  ): Promise<void> {
    await OrderItem.deleteMany({ order_id: orderId }).session(session).exec();

    await OrderItem.insertMany(
      items.map(item => ({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        item_name_snap: item.item_name_snap,
        price_snapshot: item.price_snapshot,
        quantity: item.quantity
      })),
      { session }
    );
  },

  async countItems(clientOrSession: ClientSession, orderId: string): Promise<number> {
    return OrderItem.countDocuments({ order_id: orderId }).session(clientOrSession);
  },

  async setDropPoint(
    session: ClientSession,
    orderId: string,
    dropPoint: string
  ): Promise<OrderRow> {
    const doc = await Order.findByIdAndUpdate(
      orderId,
      { drop_point: dropPoint, updated_at: new Date() },
      { new: true, session }
    ).exec();
    return toOrderRow(doc as unknown as IOrder);
  },

  async markPaymentSuccess(
    session: ClientSession,
    orderId: string
  ): Promise<OrderTransitionResult> {
    const result = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        order_status: 'cart', 
        payment_status: 'pending' 
      },
      { 
        order_status: 'placed',
        payment_status: 'success',
        placed_at: new Date(),
        updated_at: new Date()
      },
      { new: true, session }
    ).exec();

    return {
      rowCount: result ? 1 : 0,
      order: result ? toOrderRow(result as unknown as IOrder) : null
    };
  },

  async markPaymentLate(
    session: ClientSession,
    orderId: string
  ): Promise<OrderTransitionResult> {
    const result = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        order_status: 'cart', 
        payment_status: 'pending' 
      },
      { 
        payment_status: 'late',
        updated_at: new Date()
      },
      { new: true, session }
    ).exec();

    return {
      rowCount: result ? 1 : 0,
      order: result ? toOrderRow(result as unknown as IOrder) : null
    };
  },

  async insertFullOrderRefund(
    session: ClientSession,
    data: { order_id: string; amount: string; reason: string; initiated_by: string | null }
  ): Promise<void> {
    // This would use the Refund model
  },

  async insertAudit(
    session: ClientSession,
    data: { order_id: string | null; actor_id: string | null; action: string; details?: unknown }
  ): Promise<void> {
    await AuditLog.create([{
      order_id: data.order_id,
      actor_id: data.actor_id,
      action: data.action,
      details: data.details ?? {}
    }], { session });
  },

  async findCustomerOrderDetailHeader(orderId: string): Promise<CustomerOrderDetailHeaderRow | null> {
    const doc = await Order.findById(orderId)
      .populate('campus_id', 'name city cutoff_time delivery_time')
      .populate('restaurant_id', 'name')
      .populate('batch_id', 'service_date batch_status delivery_agent_id')
      .exec();

    if (!doc) return null;

    return {
      ...toOrderRow(doc as unknown as IOrder),
      campus_name: (doc.populated('campus_id') as { name: string; city: string })?.name ?? '',
      campus_city: (doc.populated('campus_id') as { name: string; city: string })?.city ?? '',
      cutoff_time: (doc.populated('campus_id') as { cutoff_time: string; delivery_time: string })?.cutoff_time ?? '',
      delivery_time: (doc.populated('campus_id') as { cutoff_time: string; delivery_time: string })?.delivery_time ?? '',
      restaurant_name: (doc.populated('restaurant_id') as { name: string })?.name ?? '',
      batch_service_date: (doc.populated('batch_id') as { service_date: string; batch_status: string; delivery_agent_id: string })?.service_date ?? null,
      batch_status: (doc.populated('batch_id') as { service_date: string; batch_status: string; delivery_agent_id: string })?.batch_status ?? null,
      delivery_agent_id: (doc.populated('batch_id') as { service_date: string; batch_status: string; delivery_agent_id: string })?.delivery_agent_id ?? null
    };
  },

  async findCustomerOrderItems(orderId: string): Promise<CustomerOrderItemRow[]> {
    const docs = await OrderItem.find({ order_id: orderId })
      .sort({ item_name_snap: 1 })
      .exec();

    return docs.map(doc => ({
      id: doc._id.toString(),
      order_id: doc.order_id.toString(),
      menu_item_id: doc.menu_item_id.toString(),
      name: doc.item_name_snap,
      price: doc.price_snapshot,
      quantity: doc.quantity,
      line_total: ((Number(doc.price_snapshot) * doc.quantity) as unknown as string) as string,
      item_status: doc.item_status,
      refund_amount: doc.refund_amount ?? '0.00',
      is_veg: null // Will need to populate from MenuItem
    }));
  },

  async findCustomerRefunds(orderId: string): Promise<CustomerRefundRow[]> {
    return []; // Simplified
  },

  async findCustomerDeliveryAttempts(orderId: string): Promise<CustomerDeliveryAttemptRow[]> {
    return []; // Simplified
  },

  async listCustomerOrders(
    studentId: string,
    data: { limit: number; offset: number }
  ): Promise<CustomerOrderListRow[]> {
    const docs = await Order.find({
      student_id: studentId,
      $or: [
        { order_status: { $ne: 'cart' } },
        { $and: [{ order_status: 'cart' }, { drop_point: { $ne: null } }] }
      ]
    })
      .populate('campus_id', 'name city')
      .populate('restaurant_id', 'name')
      .sort({ created_at: -1 })
      .skip(data.offset)
      .limit(data.limit)
      .exec();

    return await Promise.all(docs.map(async (doc) => {
      const populated = doc as unknown as IOrder & {
        campus_id: { name: string; city: string };
        restaurant_id: { name: string };
      };
      const itemCount = await OrderItem.countDocuments({ order_id: (doc._id as Types.ObjectId).toString() });
      
      return {
        ...toOrderRow(doc as unknown as IOrder),
        campus_name: populated.campus_id?.name ?? '',
        campus_city: populated.campus_id?.city ?? '',
        restaurant_name: populated.restaurant_id?.name ?? '',
        item_count: itemCount,
        latest_activity_at: doc.placed_at ?? doc.updated_at ?? doc.created_at
      };
    }));
  },

  async countCustomerOrders(studentId: string): Promise<number> {
    return Order.countDocuments({
      student_id: studentId,
      $or: [
        { order_status: { $ne: 'cart' } },
        { $and: [{ order_status: 'cart' }, { drop_point: { $ne: null } }] }
      ]
    });
  },

  async getCartHeader(studentId: string): Promise<CartHeaderRow | null> {
    const doc = await Order.findOne({
      student_id: studentId,
      order_status: 'cart',
      payment_status: 'pending'
    })
      .populate('campus_id', 'name city cutoff_time delivery_time')
      .populate('restaurant_id', 'name')
      .sort({ created_at: -1 })
      .exec();

    if (!doc) return null;

    const populated = doc as unknown as IOrder & {
      campus_id: { name: string; city: string; cutoff_time: string; delivery_time: string };
      restaurant_id: { name: string };
    };

    return {
      ...toOrderRow(doc as unknown as IOrder),
      campus_name: populated.campus_id?.name ?? '',
      campus_city: populated.campus_id?.city ?? '',
      cutoff_time: populated.campus_id?.cutoff_time ?? '',
      delivery_time: populated.campus_id?.delivery_time ?? '',
      restaurant_name: populated.restaurant_id?.name ?? ''
    };
  },

  async getCartItems(orderId: string): Promise<CartItemDetailRow[]> {
    const docs = await OrderItem.find({ order_id: orderId })
      .populate('menu_item_id', 'name is_veg is_available')
      .sort({ item_name_snap: 1 })
      .exec();

    return docs.map(doc => {
      const item = doc as unknown as IOrderItem & {
        menu_item_id: { name: string; is_veg: boolean; is_available: boolean };
      };
      return {
        id: (doc._id as Types.ObjectId).toString(),
        order_id: (doc.order_id as Types.ObjectId).toString(),
        menu_item_id: (doc.menu_item_id as Types.ObjectId).toString(),
        item_name_snap: doc.item_name_snap,
        price_snapshot: doc.price_snapshot,
        quantity: doc.quantity,
        item_status: doc.item_status,
        refund_amount: doc.refund_amount,
        menu_item_name: item.menu_item_id?.name ?? doc.item_name_snap,
        is_veg: item.menu_item_id?.is_veg ?? null,
        is_available: item.menu_item_id?.is_available ?? true
      };
    });
  }
};