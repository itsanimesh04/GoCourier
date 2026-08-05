import type { ClientSession, Types } from 'mongoose';
import { Batch, type IBatch } from '../models/batch.model';
import { Order, type IOrder } from '../models/order.model';
import { OrderItem, type IOrderItem } from '../models/order-item.model';
import { Refund, type IRefund } from '../models/refund.model';
import { ProcurementTask, type IProcurementTask } from '../models/procurement-task.model';
import { AuditLog } from '../models/audit-log.model';

export interface BatchSummaryRow {
  batch_id: string;
  campus: string;
  total_orders: number;
}

export interface BatchRestaurantRow {
  restaurant_id: string;
  name: string;
}

export interface BatchItemRow {
  menu_item_name: string;
  total_quantity: number;
}

export interface ProcurementTaskRow {
  id: string;
  batch_id: string;
  restaurant_id: string;
  status: string;
  external_order_ref: string | null;
  actual_cost: string | null;
  platform: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_status: string;
  price_snapshot: string;
  quantity: number;
  refund_amount: string | null;
}

export interface RefundRow {
  id: string;
  order_id: string;
  order_item_id: string | null;
  amount: string;
  reason: string;
  status: string;
  gateway_refund_id: string | null;
  initiated_by: string | null;
  created_at: Date;
  processed_at: Date | null;
}

function toProcurementTaskRow(doc: IProcurementTask): ProcurementTaskRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    batch_id: (doc.batch_id as Types.ObjectId).toString(),
    restaurant_id: (doc.restaurant_id as Types.ObjectId).toString(),
    status: doc.status,
    external_order_ref: doc.external_order_ref,
    actual_cost: doc.actual_cost,
    platform: doc.platform
  };
}

function toOrderItemRow(doc: IOrderItem): OrderItemRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    order_id: (doc.order_id as Types.ObjectId).toString(),
    item_status: doc.item_status,
    price_snapshot: doc.price_snapshot,
    quantity: doc.quantity,
    refund_amount: doc.refund_amount
  };
}

function toRefundRow(doc: IRefund): RefundRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    order_id: (doc.order_id as Types.ObjectId).toString(),
    order_item_id: doc.order_item_id ? (doc.order_item_id as Types.ObjectId).toString() : null,
    amount: doc.amount,
    reason: doc.reason,
    status: doc.status,
    gateway_refund_id: doc.gateway_refund_id,
    initiated_by: doc.initiated_by,
    created_at: doc.created_at,
    processed_at: doc.processed_at
  };
}

export const opsRepository = {
  async findBatchSummaryById(batchId: string): Promise<BatchSummaryRow | null> {
    const doc = await Batch.findById(batchId)
      .populate('campus_id', 'name')
      .exec();

    if (!doc) return null;

    const orderCount = await Order.countDocuments({
      batch_id: (doc._id as Types.ObjectId).toString(),
      order_status: { $ne: 'cancelled' }
    });

    const populated = doc as unknown as IBatch & { campus_id: { name: string } };
    return {
      batch_id: (doc._id as Types.ObjectId).toString(),
      campus: populated.campus_id?.name ?? '',
      total_orders: orderCount
    };
  },

  async findBatchRestaurants(batchId: string): Promise<BatchRestaurantRow[]> {
    const orders = await Order.distinct('restaurant_id', {
      batch_id: batchId,
      order_status: { $ne: 'cancelled' }
    }).exec();

    const tasks = await ProcurementTask.distinct('restaurant_id', { batch_id: batchId }).exec();

    const allRestaurantIds = [...new Set([...orders, ...tasks])];
    
    return allRestaurantIds.map(id => ({
      restaurant_id: (id as Types.ObjectId).toString(),
      name: '' // Would need to populate restaurant name
    }));
  },

  async findRestaurantItemsForBatch(batchId: string, restaurantId: string): Promise<BatchItemRow[]> {
    const items = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.batch_id': batchId,
          'order.restaurant_id': restaurantId,
          'order.order_status': { $ne: 'cancelled' },
          item_status: { $in: ['pending', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: '$item_name_snap',
          total_quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return items.map(item => ({
      menu_item_name: item._id,
      total_quantity: item.total_quantity
    }));
  },

  async findProcurementTask(batchId: string, restaurantId: string): Promise<ProcurementTaskRow | null> {
    const doc = await ProcurementTask.findOne({
      batch_id: batchId,
      restaurant_id: restaurantId
    }).exec() as IProcurementTask | null;

    return doc ? toProcurementTaskRow(doc) : null;
  },

  async findProcurementTaskByIdForUpdate(session: ClientSession, taskId: string): Promise<ProcurementTaskRow | null> {
    const doc = await ProcurementTask.findById(taskId)
      .session(session)
      .exec() as IProcurementTask | null;

    return doc ? toProcurementTaskRow(doc) : null;
  },

  async updateProcurementTask(
    session: ClientSession,
    taskId: string,
    data: { external_order_ref: string | null; actual_cost: string | null; platform: string | null; status: string }
  ): Promise<{ rowCount: number; task: ProcurementTaskRow | null }> {
    const doc = await ProcurementTask.findByIdAndUpdate(
      taskId,
      {
        external_order_ref: data.external_order_ref,
        actual_cost: data.actual_cost,
        platform: data.platform,
        status: data.status
      },
      { new: true, session }
    ).exec() as IProcurementTask | null;

    return {
      rowCount: doc ? 1 : 0,
      task: doc ? toProcurementTaskRow(doc) : null
    };
  },

  async findOrderItemByIdForUpdate(session: ClientSession, orderItemId: string): Promise<OrderItemRow | null> {
    const doc = await OrderItem.findById(orderItemId)
      .session(session)
      .exec() as IOrderItem | null;

    return doc ? toOrderItemRow(doc) : null;
  },

  async updateOrderItemStatus(
    session: ClientSession,
    orderItemId: string,
    status: string,
    refundAmount?: string
  ): Promise<{ rowCount: number; item: OrderItemRow | null }> {
    const updateData: Record<string, unknown> = { item_status: status };
    if (refundAmount !== undefined) {
      updateData.refund_amount = refundAmount;
    }

    const doc = await OrderItem.findByIdAndUpdate(
      orderItemId,
      updateData,
      { new: true, session }
    ).exec() as IOrderItem | null;

    return {
      rowCount: doc ? 1 : 0,
      item: doc ? toOrderItemRow(doc) : null
    };
  },

  async insertRefund(
    session: ClientSession,
    data: { order_id: string; order_item_id: string | null; amount: string; reason: string; status: string; initiated_by: string | null; gateway_refund_id?: string | null }
  ): Promise<RefundRow> {
    const doc = await Refund.create([{
      order_id: data.order_id,
      order_item_id: data.order_item_id ?? null,
      amount: data.amount,
      reason: data.reason,
      status: data.status,
      initiated_by: data.initiated_by,
      gateway_refund_id: data.gateway_refund_id ?? null
    }], { session });

    return toRefundRow(doc[0]);
  },

  async findRefunds(status?: string): Promise<RefundRow[]> {
    const query = status ? { status } : {};
    const docs = await Refund.find(query).sort({ created_at: 1 }).exec() as IRefund[];
    return docs.map(toRefundRow);
  },

  async findRefundByIdForUpdate(session: ClientSession, refundId: string): Promise<RefundRow | null> {
    const doc = await Refund.findById(refundId)
      .session(session)
      .exec() as IRefund | null;

    return doc ? toRefundRow(doc) : null;
  },

  async findRefundByGatewayRefundIdForUpdate(session: ClientSession, gatewayRefundId: string): Promise<RefundRow | null> {
    const doc = await Refund.findOne({ gateway_refund_id: gatewayRefundId })
      .session(session)
      .exec() as IRefund | null;

    return doc ? toRefundRow(doc) : null;
  },

  async updateRefundStatus(
    session: ClientSession,
    refundId: string,
    status: string,
    gatewayRefundId?: string | null
  ): Promise<{ rowCount: number; refund: RefundRow | null }> {
    const updateData: Record<string, unknown> = {
      status,
      ...(gatewayRefundId !== undefined && { gateway_refund_id: gatewayRefundId ?? null }),
      ...(status === 'processed' || status === 'failed' ? { processed_at: new Date() } : {})
    };

    const doc = await Refund.findByIdAndUpdate(
      refundId,
      updateData,
      { new: true, session }
    ).exec() as IRefund | null;

    return {
      rowCount: doc ? 1 : 0,
      refund: doc ? toRefundRow(doc) : null
    };
  }
};