import { Order } from '../../models/order.model';
import { OrderItem } from '../../models/order-item.model';
import { Refund } from '../../models/refund.model';
import { ProcurementTask } from '../../models/procurement-task.model';
import { AuditLog } from '../../models/audit-log.model';
import { Payment } from '../../models/payment.model';
import { razorpayGatewayService } from '../payment/razorpayGateway.service';
import { ConflictError, NotFoundError } from '../../utils/errors';
import type { ClientSession } from 'mongoose';
import { startSession } from 'mongoose';

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

export const opsService = {
  async getBatchDetail(batchId: string) {
    const orders = await Order.find({ batch_id: batchId }).populate('restaurant_id', 'name').lean();
    const restaurants = await ProcurementTask.find({ batch_id: batchId }).populate('restaurant_id', 'name').lean();
    
    return {
      batch_id: batchId,
      campus: 'Campus Name',
      total_orders: orders.length,
      restaurants: orders.map((order) => ({
        restaurant_id: order.restaurant_id?.toString(),
        name: (order.restaurant_id as { name?: string })?.name ?? '',
        items: [],
        procurement_task: {
          status: 'pending',
          external_order_ref: null,
          actual_cost: null
        }
      }))
    };
  },

  async updateProcurementTask(
    taskId: string,
    input: { external_order_ref?: string | null; actual_cost?: string | number | null; platform?: string | null; status: string },
    actorId: string
  ) {
    return withTransaction(async (session) => {
      const task = await ProcurementTask.findById(taskId).session(session);
      
      if (!task) {
        throw new NotFoundError('Procurement task not found');
      }

      const result = await ProcurementTask.findByIdAndUpdate(
        taskId,
        {
          external_order_ref: input.external_order_ref,
          actual_cost: input.actual_cost,
          platform: input.platform,
          status: input.status
        },
        { new: true, session }
      );

      if (result) {
        await AuditLog.create([{
          order_id: null,
          actor_id: actorId,
          action: 'procurement_task.updated',
          details: {
            task_id: taskId,
            batch_id: task.batch_id?.toString(),
            restaurant_id: task.restaurant_id?.toString(),
            external_order_ref: input.external_order_ref,
            actual_cost: input.actual_cost,
            platform: input.platform,
            status: input.status
          }
        }], { session });
        return result;
      }

      return task;
    });
  },

  async markOrderItemConfirmed(orderItemId: string, actorId: string) {
    return withTransaction(async (session) => {
      const item = await OrderItem.findById(orderItemId).session(session);
      
      if (!item) {
        throw new NotFoundError('Order item not found');
      }

      if (item.item_status === 'confirmed') {
        return item;
      }

      if (item.item_status !== 'pending') {
        throw new ConflictError('Item cannot be confirmed from its current state');
      }

      const result = await OrderItem.findByIdAndUpdate(
        orderItemId,
        { item_status: 'confirmed' },
        { new: true, session }
      );

      if (result) {
        await AuditLog.create([{
          order_id: item.order_id?.toString() ?? null,
          actor_id: actorId,
          action: 'order_item.confirmed',
          details: { order_item_id: orderItemId }
        }], { session });
        return result;
      }

      return item;
    });
  },

  async markOrderItemUnavailable(orderItemId: string, reason: string, actorId: string) {
    return withTransaction(async (session) => {
      const item = await OrderItem.findById(orderItemId).session(session);
      
      if (!item) {
        throw new NotFoundError('Order item not found');
      }

      if (item.item_status === 'unavailable') {
        return { item, refund: null };
      }

      if (item.item_status !== 'pending' && item.item_status !== 'confirmed') {
        throw new ConflictError('Item cannot be marked unavailable from its current state');
      }

      const refundAmount = (Number(item.price_snapshot) * item.quantity).toFixed(2);
      const updatedItem = await OrderItem.findByIdAndUpdate(
        orderItemId,
        { item_status: 'unavailable', refund_amount: refundAmount },
        { new: true, session }
      );

      const refund = await Refund.create([{
        order_id: item.order_id?.toString() ?? '',
        order_item_id: orderItemId,
        amount: refundAmount,
        reason,
        status: 'pending',
        initiated_by: actorId
      }], { session });

      await AuditLog.create([{
        order_id: item.order_id?.toString() ?? null,
        actor_id: actorId,
        action: 'order_item.unavailable',
        details: { order_item_id: orderItemId, reason, refund_amount: refundAmount }
      }], { session });

      await AuditLog.create([{
        order_id: item.order_id?.toString() ?? null,
        actor_id: actorId,
        action: 'refund.created',
        details: {
          refund_id: refund[0]._id?.toString(),
          order_id: item.order_id?.toString(),
          order_item_id: orderItemId,
          amount: refundAmount,
          reason,
          status: 'pending'
        }
      }], { session });

      return { item: updatedItem, refund: refund[0] };
    });
  },

  async listRefunds(status?: string) {
    const query = status ? { status } : {};
    return Refund.find(query).sort({ created_at: 1 }).exec();
  },

  async initiateRefund(refundId: string, actorId: string) {
    return withTransaction(async (session) => {
      const refund = await Refund.findById(refundId).session(session);
      if (!refund) {
        throw new NotFoundError('Refund not found');
      }

      if (refund.status === 'initiated' || refund.status === 'processed') {
        return refund;
      }

      if (refund.status !== 'pending') {
        throw new ConflictError('Refund is not in pending state');
      }

      const payment = await Payment.findOne({ 
        order_id: refund.order_id,
        status: 'captured'
      }).session(session);

      const paymentId = payment?.gateway_txn_id ?? payment?.gateway_order_id;
      if (!payment || !paymentId) {
        throw new ConflictError('No captured payment found for this order');
      }

      const amountSubunits = Math.round(Number(refund.amount) * 100);
      const gwRefund = await razorpayGatewayService.createRefund({
        paymentId,
        amountSubunits,
        notes: {
          order_id: refund.order_id?.toString(),
          refund_id: refundId
        }
      });

      const updatedRefund = await Refund.findByIdAndUpdate(
        refundId,
        { status: 'initiated', gateway_refund_id: gwRefund.id },
        { new: true, session }
      );

      if (updatedRefund) {
        await AuditLog.create([{
          order_id: refund.order_id?.toString() ?? null,
          actor_id: actorId,
          action: 'refund.initiated',
          details: {
            refund_id: refundId,
            gateway_refund_id: gwRefund.id,
            amount: refund.amount
          }
        }], { session });
      }

      return updatedRefund;
    });
  }
};