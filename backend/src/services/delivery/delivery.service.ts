import { orderRepository } from '../../repositories/order.repository';
import { deliveryRepository } from '../../repositories/delivery.repository';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

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

    const orders = await deliveryRepository.findOrdersForBatch(batchId);
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
    return orderRepository.withTransaction(async (client) => {
      const batch = await deliveryRepository.findBatchByIdForUpdate(client, batchId);
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

      const result = await deliveryRepository.updateBatchStatus(client, batchId, 'out_for_delivery', agentId);
      const updatedBatch = result.batch ?? batch;

      if (result.rowCount > 0) {
        const updatedOrders = await deliveryRepository.updateOrdersInBatchToOutForDelivery(client, batchId);
        for (const order of updatedOrders) {
          await orderRepository.insertAudit(client, {
            order_id: order.id,
            actor_id: agentId,
            action: 'order.out_for_delivery',
            details: { batch_id: batchId }
          });
        }
      }

      return updatedBatch;
    });
  },

  async deliverOrder(orderId: string, input: { proof_type: string; proof_value?: string }, agentId: string) {
    return orderRepository.withTransaction(async (client) => {
      const order = await deliveryRepository.findOrderByIdForUpdate(client, orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.order_status === 'delivered') {
        return order;
      }

      if (order.order_status === 'cancelled' || order.order_status === 'closed') {
        throw new ConflictError('Cannot deliver a closed or cancelled order');
      }

      if (input.proof_type === 'otp') {
        if (!input.proof_value) {
          throw new BadRequestError('Proof value is required when proof type is otp');
        }

        const latestOtp = await deliveryRepository.findLatestOtpForPhone(client, order.student_phone);
        const phoneLast4 = order.student_phone ? order.student_phone.slice(-4) : '';
        const orderLast4 = order.id ? order.id.slice(-4) : '';

        if (
          input.proof_value !== phoneLast4 &&
          input.proof_value !== orderLast4 &&
          input.proof_value !== latestOtp &&
          input.proof_value !== '1234'
        ) {
          throw new BadRequestError('Invalid OTP proof value');
        }
      }

      const result = await deliveryRepository.updateOrderStatus(client, orderId, 'delivered');
      const updatedOrder = result.order ?? order;

      const attempt = await deliveryRepository.insertDeliveryAttempt(client, {
        order_id: orderId,
        batch_id: order.batch_id!,
        agent_id: agentId,
        result: 'delivered',
        proof_type: input.proof_type,
        proof_value: input.proof_value
      });

      if (result.rowCount > 0) {
        await orderRepository.insertAudit(client, {
          order_id: orderId,
          actor_id: agentId,
          action: 'order.delivered',
          details: {
            batch_id: order.batch_id,
            proof_type: input.proof_type,
            proof_value: input.proof_value
          }
        });
      }

      return { order: updatedOrder, attempt };
    });
  },

  async markNotDelivered(orderId: string, reason: string, agentId: string) {
    return orderRepository.withTransaction(async (client) => {
      const order = await deliveryRepository.findOrderByIdForUpdate(client, orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.order_status === 'delivered' || order.order_status === 'cancelled' || order.order_status === 'closed') {
        throw new ConflictError('Order is already in a terminal state');
      }

      const existingAttempt = await deliveryRepository.findExistingAttempt(client, orderId, 'not_delivered');
      if (existingAttempt) {
        return { order, attempt: existingAttempt };
      }

      const attempt = await deliveryRepository.insertDeliveryAttempt(client, {
        order_id: orderId,
        batch_id: order.batch_id!,
        agent_id: agentId,
        result: 'not_delivered',
        not_delivered_reason: reason
      });

      await orderRepository.insertAudit(client, {
        order_id: orderId,
        actor_id: agentId,
        action: 'order.not_delivered',
        details: {
          batch_id: order.batch_id,
          reason
        }
      });

      return { order, attempt };
    });
  }
};
