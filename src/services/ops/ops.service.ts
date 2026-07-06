import { orderRepository } from '../../repositories/order.repository';
import { opsRepository } from '../../repositories/ops.repository';
import { paymentRepository } from '../../repositories/payment.repository';
import { razorpayGatewayService } from '../payment/razorpayGateway.service';
import { ConflictError, NotFoundError } from '../../utils/errors';

export const opsService = {
  async getBatchDetail(batchId: string) {
    const summary = await opsRepository.findBatchSummaryById(batchId);
    if (!summary) {
      throw new NotFoundError('Batch not found');
    }

    const restaurants = await opsRepository.findBatchRestaurants(batchId);
    const restaurantDetails = await Promise.all(
      restaurants.map(async (r) => {
        const items = await opsRepository.findRestaurantItemsForBatch(batchId, r.restaurant_id);
        const task = await opsRepository.findProcurementTask(batchId, r.restaurant_id);
        return {
          restaurant_id: r.restaurant_id,
          name: r.name,
          items: items.map((i) => ({
            menu_item_name: i.menu_item_name,
            total_quantity: i.total_quantity
          })),
          procurement_task: task
            ? {
                status: task.status,
                external_order_ref: task.external_order_ref ?? null,
                actual_cost: task.actual_cost != null ? String(task.actual_cost) : null
              }
            : {
                status: 'pending',
                external_order_ref: null,
                actual_cost: null
              }
        };
      })
    );

    return {
      batch_id: summary.batch_id,
      campus: summary.campus,
      total_orders: summary.total_orders,
      restaurants: restaurantDetails
    };
  },

  async updateProcurementTask(
    taskId: string,
    input: { external_order_ref?: string | null; actual_cost?: string | number | null; platform?: string | null; status: string },
    actorId: string
  ) {
    return orderRepository.withTransaction(async (client) => {
      const task = await opsRepository.findProcurementTaskByIdForUpdate(client, taskId);
      if (!task) {
        throw new NotFoundError('Procurement task not found');
      }

      const external_order_ref = input.external_order_ref !== undefined ? (input.external_order_ref ?? null) : task.external_order_ref;
      const actual_cost = input.actual_cost !== undefined ? (input.actual_cost != null ? String(input.actual_cost) : null) : task.actual_cost;
      const platform = input.platform !== undefined ? (input.platform ?? null) : task.platform;

      const result = await opsRepository.updateProcurementTask(client, taskId, {
        external_order_ref,
        actual_cost,
        platform,
        status: input.status
      });

      if (result.rowCount > 0 && result.task) {
        await orderRepository.insertAudit(client, {
          order_id: null,
          actor_id: actorId,
          action: 'procurement_task.updated',
          details: {
            task_id: taskId,
            batch_id: task.batch_id,
            restaurant_id: task.restaurant_id,
            external_order_ref,
            actual_cost,
            platform,
            status: input.status
          }
        });
        return result.task;
      }

      return task;
    });
  },

  async markOrderItemConfirmed(orderItemId: string, actorId: string) {
    return orderRepository.withTransaction(async (client) => {
      const item = await opsRepository.findOrderItemByIdForUpdate(client, orderItemId);
      if (!item) {
        throw new NotFoundError('Order item not found');
      }

      if (item.item_status === 'confirmed') {
        return item;
      }

      if (item.item_status !== 'pending') {
        throw new ConflictError('Item cannot be confirmed from its current state');
      }

      const result = await opsRepository.updateOrderItemStatus(client, orderItemId, 'confirmed');
      if (result.rowCount > 0 && result.item) {
        await orderRepository.insertAudit(client, {
          order_id: item.order_id,
          actor_id: actorId,
          action: 'order_item.confirmed',
          details: { order_item_id: orderItemId }
        });
        return result.item;
      }

      return item;
    });
  },

  async markOrderItemUnavailable(orderItemId: string, reason: string, actorId: string) {
    return orderRepository.withTransaction(async (client) => {
      const item = await opsRepository.findOrderItemByIdForUpdate(client, orderItemId);
      if (!item) {
        throw new NotFoundError('Order item not found');
      }

      if (item.item_status === 'unavailable') {
        return item;
      }

      if (item.item_status !== 'pending' && item.item_status !== 'confirmed') {
        throw new ConflictError('Item cannot be marked unavailable from its current state');
      }

      const refundAmount = (Number(item.price_snapshot) * item.quantity).toFixed(2);
      const result = await opsRepository.updateOrderItemStatus(client, orderItemId, 'unavailable', refundAmount);
      const updatedItem = result.item ?? item;

      const refund = await opsRepository.insertRefund(client, {
        order_id: item.order_id,
        order_item_id: orderItemId,
        amount: refundAmount,
        reason,
        status: 'pending',
        initiated_by: actorId
      });

      await orderRepository.insertAudit(client, {
        order_id: item.order_id,
        actor_id: actorId,
        action: 'order_item.unavailable',
        details: { order_item_id: orderItemId, reason, refund_amount: refundAmount }
      });

      await orderRepository.insertAudit(client, {
        order_id: item.order_id,
        actor_id: actorId,
        action: 'refund.created',
        details: {
          refund_id: refund.id,
          order_id: item.order_id,
          order_item_id: orderItemId,
          amount: refundAmount,
          reason,
          status: 'pending'
        }
      });

      return { item: updatedItem, refund };
    });
  },

  async listRefunds(status?: string) {
    return opsRepository.findRefunds(status);
  },

  async initiateRefund(refundId: string, actorId: string) {
    return orderRepository.withTransaction(async (client) => {
      const refund = await opsRepository.findRefundByIdForUpdate(client, refundId);
      if (!refund) {
        throw new NotFoundError('Refund not found');
      }

      if (refund.status === 'initiated' || refund.status === 'processed') {
        return refund;
      }

      if (refund.status !== 'pending') {
        throw new ConflictError('Refund is not in pending state');
      }

      const payment = await paymentRepository.findCapturedPaymentForOrder(client, refund.order_id);
      const paymentId = payment?.gateway_txn_id ?? payment?.gateway_order_id;
      if (!payment || !paymentId) {
        throw new ConflictError('No captured payment found for this order');
      }

      const amountSubunits = Math.round(Number(refund.amount) * 100);
      const gwRefund = await razorpayGatewayService.createRefund({
        paymentId,
        amountSubunits,
        notes: {
          order_id: refund.order_id,
          refund_id: refund.id
        }
      });

      const result = await opsRepository.updateRefundStatus(client, refundId, 'initiated', gwRefund.id);
      const updatedRefund = result.refund ?? refund;

      if (result.rowCount > 0) {
        await orderRepository.insertAudit(client, {
          order_id: refund.order_id,
          actor_id: actorId,
          action: 'refund.initiated',
          details: {
            refund_id: refundId,
            gateway_refund_id: gwRefund.id,
            amount: refund.amount
          }
        });
      }

      return updatedRefund;
    });
  }
};
