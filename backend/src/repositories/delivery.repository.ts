import type { ClientSession, Types } from 'mongoose';
import { Batch, type IBatch } from '../models/batch.model';
import { Order, type IOrder } from '../models/order.model';
import { OrderItem, type IOrderItem } from '../models/order-item.model';
import { DeliveryAttempt, type IDeliveryAttempt } from '../models/delivery-attempt.model';

export interface DeliveryBatchRow {
  batch_id: string;
  campus_id: string;
  campus: string;
  service_date: string;
  batch_status: string;
  total_orders: number;
}

export interface BatchDetailRow {
  id: string;
  campus_id: string;
  service_date: string;
  batch_status: string;
  delivery_agent_id: string | null;
}

export interface DeliveryOrderRow {
  id: string;
  drop_point: string;
  order_status: string;
  student_name: string;
  phone: string;
}

export interface DeliveryOrderItemRow {
  name: string;
  quantity: number;
  item_status: string;
}

export interface DeliveryAttemptRow {
  id: string;
  order_id: string;
  batch_id: string;
  agent_id: string;
  result: string;
  proof_type: string | null;
  proof_value: string | null;
  not_delivered_reason: string | null;
  attempted_at: Date;
}

export interface OrderWithStudentRow {
  _id: Types.ObjectId;
  student_phone: string;
  student_name: string;
  drop_point: string | null;
  order_status: string;
  batch_id: Types.ObjectId | null;
  campus_id: Types.ObjectId;
  restaurant_id: Types.ObjectId;
}

function toBatchDetailRow(doc: IBatch): BatchDetailRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    campus_id: (doc.campus_id as Types.ObjectId).toString(),
    service_date: doc.service_date,
    batch_status: doc.batch_status,
    delivery_agent_id: doc.delivery_agent_id ? (doc.delivery_agent_id as Types.ObjectId).toString() : null
  };
}

function toDeliveryOrderRow(doc: { _id: Types.ObjectId; drop_point: string | null; order_status: string; student_name: string; phone: string }): DeliveryOrderRow {
  return {
    id: doc._id.toString(),
    drop_point: doc.drop_point ?? 'Default Drop Point',
    order_status: doc.order_status,
    student_name: doc.student_name ?? '',
    phone: doc.phone ?? ''
  };
}

function toDeliveryOrderItemRow(doc: IOrderItem): DeliveryOrderItemRow {
  return {
    name: doc.item_name_snap,
    quantity: doc.quantity,
    item_status: doc.item_status
  };
}

function toDeliveryAttemptRow(doc: IDeliveryAttempt): DeliveryAttemptRow {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    order_id: (doc.order_id as Types.ObjectId).toString(),
    batch_id: (doc.batch_id as Types.ObjectId).toString(),
    agent_id: (doc.agent_id as Types.ObjectId).toString(),
    result: doc.result,
    proof_type: doc.proof_type,
    proof_value: doc.proof_value,
    not_delivered_reason: doc.not_delivered_reason,
    attempted_at: doc.attempted_at
  };
}

export const deliveryRepository = {
  async findMyBatches(agentId: string, dateStr?: string): Promise<DeliveryBatchRow[]> {
    const dateCondition = dateStr 
      ? { service_date: dateStr } 
      : { service_date: new Date().toISOString().split('T')[0] };

    const docs = await Batch.find({
      $or: [
        { delivery_agent_id: agentId },
        { delivery_agent_id: null }
      ],
      ...dateCondition
    })
      .populate('campus_id', 'name')
      .sort({ created_at: -1 })
      .exec() as unknown as (IBatch & { campus_id: { name: string } })[];

    return await Promise.all(docs.map(async doc => {
      const orderCount = await Order.countDocuments({
        batch_id: (doc._id as Types.ObjectId).toString(),
        order_status: { $ne: 'cancelled' }
      });

      return {
        batch_id: (doc._id as Types.ObjectId).toString(),
        campus_id: (doc.campus_id as Types.ObjectId).toString(),
        campus: doc.campus_id?.name ?? '',
        service_date: doc.service_date,
        batch_status: doc.batch_status,
        total_orders: orderCount
      };
    }));
  },

  async findBatchById(batchId: string): Promise<BatchDetailRow | null> {
    const doc = await Batch.findById(batchId).exec() as IBatch | null;
    return doc ? toBatchDetailRow(doc) : null;
  },

  async findBatchByIdForUpdate(session: ClientSession, batchId: string): Promise<BatchDetailRow | null> {
    const doc = await Batch.findById(batchId)
      .session(session)
      .exec() as IBatch | null;

    return doc ? toBatchDetailRow(doc) : null;
  },

  async findOrdersForBatch(batchId: string): Promise<DeliveryOrderRow[]> {
    const docs = await Order.find({
      batch_id: batchId,
      order_status: { $ne: 'cancelled' }
    })
      .populate('student_id', 'name phone')
      .sort({ created_at: 1 })
      .exec() as unknown as (IOrder & { student_id: { name: string; phone: string } })[];

    return docs.map(doc => ({
      id: (doc._id as Types.ObjectId).toString(),
      drop_point: doc.drop_point ?? 'Default Drop Point',
      order_status: doc.order_status,
      student_name: doc.student_id?.name ?? '',
      phone: doc.student_id?.phone ?? ''
    }));
  },

  async findOrderItemsForOrder(orderId: string): Promise<DeliveryOrderItemRow[]> {
    const docs = await OrderItem.find({ order_id: orderId })
      .sort({ item_name_snap: 1 })
      .exec() as IOrderItem[];

    return docs.map(toDeliveryOrderItemRow);
  },

  async updateBatchStatus(
    session: ClientSession,
    batchId: string,
    status: string,
    agentId?: string
  ): Promise<{ rowCount: number; batch: BatchDetailRow | null }> {
    const updateData: Record<string, unknown> = { batch_status: status };
    
    if (agentId) {
      updateData.delivery_agent_id = agentId;
    }

    const doc = await Batch.findOneAndUpdate(
      { _id: batchId, batch_status: { $ne: status } },
      updateData,
      { new: true, session }
    ).exec() as IBatch | null;

    return {
      rowCount: doc ? 1 : 0,
      batch: doc ? toBatchDetailRow(doc) : null
    };
  },

  async updateOrdersInBatchToOutForDelivery(session: ClientSession, batchId: string): Promise<IOrder[]> {
    await Order.updateMany(
      { batch_id: batchId, order_status: { $in: ['locked', 'procuring', 'confirmed'] } },
      { order_status: 'out_for_delivery', updated_at: new Date() },
      { session }
    );

    return Order.find({ batch_id: batchId }).session(session).exec() as Promise<IOrder[]>;
  },

  async findOrderByIdForUpdate(session: ClientSession, orderId: string): Promise<OrderWithStudentRow | null> {
    const doc = await Order.findById(orderId)
      .populate('student_id', 'phone name')
      .session(session)
      .exec();

    if (!doc) return null;

    const populated = doc as unknown as IOrder & { student_id: { phone: string; name: string } };
    return {
      ...doc,
      student_phone: populated.student_id?.phone ?? '',
      student_name: populated.student_id?.name ?? ''
    };
  },

  async findLatestOtpForPhone(_session: ClientSession, _phone: string): Promise<string | null> {
    return null; // Simplified
  },

  async updateOrderStatus(
    session: ClientSession,
    orderId: string,
    status: string
  ): Promise<{ rowCount: number; order: IOrder | null }> {
    const doc = await Order.findOneAndUpdate(
      { _id: orderId, order_status: { $ne: status } },
      { order_status: status, updated_at: new Date() },
      { new: true, session }
    ).exec() as IOrder | null;

    return {
      rowCount: doc ? 1 : 0,
      order: doc
    };
  },

  async insertDeliveryAttempt(
    session: ClientSession,
    data: { order_id: string; batch_id: string; agent_id: string; result: string; proof_type?: string | null; proof_value?: string | null; not_delivered_reason?: string | null }
  ): Promise<DeliveryAttemptRow> {
    const doc = await DeliveryAttempt.create([{
      order_id: data.order_id,
      batch_id: data.batch_id,
      agent_id: data.agent_id,
      result: data.result as 'delivered' | 'not_delivered',
      proof_type: data.proof_type ?? null,
      proof_value: data.proof_value ?? null,
      not_delivered_reason: data.not_delivered_reason ?? null,
      attempted_at: new Date()
    }], { session });

    return toDeliveryAttemptRow(doc[0]);
  },

  async findExistingAttempt(session: ClientSession, orderId: string, resultStatus: string): Promise<DeliveryAttemptRow | null> {
    const doc = await DeliveryAttempt.findOne({
      order_id: orderId,
      result: resultStatus as 'delivered' | 'not_delivered'
    })
      .sort({ attempted_at: -1 })
      .limit(1)
      .session(session)
      .exec() as IDeliveryAttempt | null;

    return doc ? toDeliveryAttemptRow(doc) : null;
  }
};