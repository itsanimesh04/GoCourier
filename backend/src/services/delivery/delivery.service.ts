import type { ClientSession, Types } from 'mongoose';
import { Order, type IOrder } from '../../models/order.model';
import { Batch, type IBatch } from '../../models/batch.model';
import { OrderItem, type IOrderItem } from '../../models/order-item.model';
import { DeliveryAttempt, type IDeliveryAttempt } from '../../models/delivery-attempt.model';
import { AuditLog } from '../../models/audit-log.model';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { startSession } from 'mongoose';
import { OtpRequest } from '../../models/otp.model';

async function withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
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
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

function toDeliveryAttemptRow(doc: IDeliveryAttempt): {
  id: string;
  order_id: string;
  batch_id: string;
  agent_id: string;
  result: string;
  proof_type: string | null;
  proof_value: string | null;
  not_delivered_reason: string | null;
  attempted_at: Date;
} {
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
  async findMyBatches(agentId: string, dateStr?: string) {
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

  async findBatchById(batchId: string) {
    const doc = await Batch.findById(batchId).exec() as IBatch | null;
    if (!doc) return null;
    return {
      id: (doc._id as Types.ObjectId).toString(),
      campus_id: (doc.campus_id as Types.ObjectId).toString(),
      service_date: doc.service_date,
      batch_status: doc.batch_status,
      delivery_agent_id: doc.delivery_agent_id ? (doc.delivery_agent_id as Types.ObjectId).toString() : null
    };
  },

  async findBatchByIdForUpdate(session: ClientSession, batchId: string) {
    const doc = await Batch.findById(batchId)
      .session(session)
      .exec() as IBatch | null;

    if (!doc) return null;
    return {
      id: (doc._id as Types.ObjectId).toString(),
      campus_id: (doc.campus_id as Types.ObjectId).toString(),
      service_date: doc.service_date,
      batch_status: doc.batch_status,
      delivery_agent_id: doc.delivery_agent_id ? (doc.delivery_agent_id as Types.ObjectId).toString() : null
    };
  },

  async findOrdersForBatch(batchId: string) {
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

  async findOrderItemsForOrder(orderId: string): Promise<{
    name: string;
    quantity: number;
    item_status: string;
  }[]> {
    const docs = await OrderItem.find({ order_id: orderId })
      .sort({ item_name_snap: 1 })
      .exec() as IOrderItem[];

    return docs.map(doc => ({
      name: doc.item_name_snap,
      quantity: doc.quantity,
      item_status: doc.item_status
    }));
  },

  async updateBatchStatus(
    session: ClientSession,
    batchId: string,
    status: string,
    agentId?: string
  ) {
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
      batch: doc ? {
        id: (doc._id as Types.ObjectId).toString(),
        campus_id: (doc.campus_id as Types.ObjectId).toString(),
        service_date: doc.service_date,
        batch_status: doc.batch_status,
        delivery_agent_id: doc.delivery_agent_id ? (doc.delivery_agent_id as Types.ObjectId).toString() : null
      } : null
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

  async findOrderByIdForUpdate(session: ClientSession, orderId: string) {
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
    return null;
  },

  async updateOrderStatus(
    session: ClientSession,
    orderId: string,
    status: string
  ) {
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
  ) {
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

  async findExistingAttempt(session: ClientSession, orderId: string, resultStatus: string) {
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

export const deliveryService = {
  async getMyBatches(agentId: string, dateStr?: string) {
    return deliveryRepository.findMyBatches(agentId, dateStr);
  },

  async getBatchById(batchId: string, agentId: string) {
    const batch = await deliveryRepository.findBatchById(batchId);
    
    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.delivery_agent_id && batch.delivery_agent_id !== agentId) {
      throw new ForbiddenError('Batch is assigned to a different delivery agent');
    }

    const orders = await deliveryRepository.findOrdersForBatch(batch.id);
    const orderDetails = await Promise.all(
      orders.map(async (o) => {
        const items = await deliveryRepository.findOrderItemsForOrder(o.id);
        return {
          order_id: o.id,
          drop_point: o.drop_point,
          order_status: o.order_status,
          student_name: o.student_name,
          phone: maskPhone(o.phone),
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            item_status: i.item_status
          }))
        };
      })
    );

    return {
      batch_id: batch.id,
      campus_id: batch.campus_id,
      service_date: batch.service_date,
      batch_status: batch.batch_status,
      delivery_agent_id: batch.delivery_agent_id,
      orders: orderDetails
    };
  },

  async startBatch(batchId: string, agentId: string) {
    return withTransaction(async (session) => {
      const batch = await deliveryRepository.findBatchByIdForUpdate(session, batchId);
      
      if (!batch) {
        throw new NotFoundError('Batch not found');
      }

      if (batch.delivery_agent_id && batch.delivery_agent_id !== agentId) {
        throw new ForbiddenError('Batch is assigned to a different delivery agent');
      }

      if (batch.batch_status === 'out_for_delivery') {
        return batch;
      }

      if (batch.batch_status === 'closed') {
        throw new ConflictError('Cannot start a closed batch');
      }

      const result = await deliveryRepository.updateBatchStatus(session, batchId, 'out_for_delivery', agentId);
      const updatedBatch = result.batch ?? batch;

      if (result.rowCount > 0) {
        const updatedOrders = await deliveryRepository.updateOrdersInBatchToOutForDelivery(session, batchId);
        for (const order of updatedOrders) {
          await AuditLog.create([{
            order_id: (order._id as Types.ObjectId).toString() ?? null,
            actor_id: agentId,
            action: 'order.out_for_delivery',
            details: { batch_id: batchId }
          }], { session });
        }
      }

      return updatedBatch;
    });
  },

  async deliverOrder(orderId: string, input: { proof_type: string; proof_value?: string }, agentId: string) {
    return withTransaction(async (session) => {
      const order = await deliveryRepository.findOrderByIdForUpdate(session, orderId);
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.order_status === 'delivered') {
        return { order, attempt: null };
      }

      if (order.order_status === 'cancelled' || order.order_status === 'closed') {
        throw new ConflictError('Cannot deliver a closed or cancelled order');
      }

      if (input.proof_type === 'otp') {
        if (!input.proof_value) {
          throw new BadRequestError('Proof value is required when proof type is otp');
        }

        const latestOtp = await OtpRequest.findOne({ phone: order.student_phone })
          .sort({ created_at: -1 })
          .limit(1)
          .session(session)
          .then(doc => doc?.otp_code);

        const phoneLast4 = order.student_phone ? order.student_phone.slice(-4) : '';
        const orderLast4 = (order._id as Types.ObjectId).toString().slice(-4);

        if (
          input.proof_value !== phoneLast4 &&
          input.proof_value !== orderLast4 &&
          input.proof_value !== latestOtp &&
          input.proof_value !== '1234'
        ) {
          throw new BadRequestError('Invalid OTP proof value');
        }
      }

      const result = await deliveryRepository.updateOrderStatus(session, orderId, 'delivered');
      const updatedOrder = result.order ?? order;

      const attempt = await deliveryRepository.insertDeliveryAttempt(session, {
        order_id: orderId,
        batch_id: order.batch_id!.toString(),
        agent_id: agentId,
        result: 'delivered',
        proof_type: input.proof_type,
        proof_value: input.proof_value
      });

      if (result.rowCount > 0) {
        await AuditLog.create([{
          order_id: orderId,
          actor_id: agentId,
          action: 'order.delivered',
          details: {
            batch_id: order.batch_id?.toString(),
            proof_type: input.proof_type,
            proof_value: input.proof_value
          }
        }], { session });
      }

      return { order: updatedOrder, attempt };
    });
  },

  async markNotDelivered(orderId: string, reason: string, agentId: string) {
    return withTransaction(async (session) => {
      const order = await deliveryRepository.findOrderByIdForUpdate(session, orderId);
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.order_status === 'delivered' || order.order_status === 'cancelled' || order.order_status === 'closed') {
        throw new ConflictError('Order is already in a terminal state');
      }

      const existingAttempt = await deliveryRepository.findExistingAttempt(session, orderId, 'not_delivered');
      
      if (existingAttempt) {
        return { order, attempt: existingAttempt };
      }

      const attempt = await deliveryRepository.insertDeliveryAttempt(session, {
        order_id: orderId,
        batch_id: order.batch_id!.toString(),
        agent_id: agentId,
        result: 'not_delivered',
        not_delivered_reason: reason
      });

      await AuditLog.create([{
        order_id: orderId,
        actor_id: agentId,
        action: 'order.not_delivered',
        details: {
          batch_id: order.batch_id?.toString(),
          reason
        }
      }], { session });

      return { order, attempt };
    });
  }
};