import { orderRepository } from '../../repositories/order.repository';
import { paymentService } from '../payment/payment.service';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export const customerOrderService = {
  async createFromCart(studentId: string, dropPoint: string) {
    return orderRepository.withTransaction(async (client) => {
      const cart = await orderRepository.findOpenCartForStudentForUpdate(client, studentId);

      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      const itemCount = await orderRepository.countItems(client, cart.id);

      if (itemCount === 0) {
        throw new BadRequestError('Cart is empty');
      }

      const order = await orderRepository.setDropPoint(client, cart.id, dropPoint);

      await orderRepository.insertAudit(client, {
        order_id: order.id,
        actor_id: studentId,
        action: 'order.awaiting_payment',
        details: {
          drop_point: dropPoint,
          total_amount: order.total_amount
        }
      });

      return {
        order_id: order.id,
        total_amount: order.total_amount
      };
    });
  },

  async initiatePayment(studentId: string, orderId: string) {
    return paymentService.initiateRazorpayPayment(studentId, orderId);
  }
};
