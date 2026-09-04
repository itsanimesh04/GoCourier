import type { ClientSession } from 'mongoose';
import { orderRepository } from '../../repositories/order.repository';
import { paymentService } from '../payment/payment.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

interface OrderListOptions {
  page: number;
  limit: number;
}

function groupRefundsByItemId(
  refunds: Awaited<ReturnType<typeof orderRepository.findCustomerRefunds>>
) {
  const grouped = new Map<string, typeof refunds>();

  for (const refund of refunds) {
    if (!refund.order_item_id) {
      continue;
    }

    const itemRefunds = grouped.get(refund.order_item_id) ?? [];
    itemRefunds.push(refund);
    grouped.set(refund.order_item_id, itemRefunds);
  }

  return grouped;
}

export const customerOrderService = {
  async createFromCart(studentId: string, dropPoint: string) {
    return orderRepository.withTransaction(async (session: ClientSession) => {
      // For MongoDB, we need to find the cart differently
      // This simplifies the logic
      const cart = await orderRepository.findOpenCartForStudentForUpdate(session, studentId);

      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      const itemCount = await orderRepository.countItems(session, cart.id);

      if (itemCount === 0) {
        throw new BadRequestError('Cart is empty');
      }

      const order = await orderRepository.setDropPoint(session, cart.id, dropPoint);

      await orderRepository.insertAudit(session, {
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
  },

  async getDetail(studentId: string, orderId: string) {
    const order = await orderRepository.findCustomerOrderDetailHeader(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.student_id !== studentId) {
      throw new ForbiddenError('You do not have permission to access this order');
    }

    const [items, refunds, deliveryAttempts] = await Promise.all([
      orderRepository.findCustomerOrderItems(order.id),
      orderRepository.findCustomerRefunds(order.id),
      orderRepository.findCustomerDeliveryAttempts(order.id)
    ]);
    const refundsByItemId = groupRefundsByItemId(refunds);

    return {
      id: order.id,
      order_status: order.order_status,
      payment_status: order.payment_status,
      drop_point: order.drop_point,
      subtotal: order.subtotal,
      fee: order.fee,
      total_amount: order.total_amount,
      placed_at: order.placed_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
      campus: {
        id: order.campus_id,
        name: order.campus_name,
        city: order.campus_city,
        cutoff_time: order.cutoff_time,
        delivery_time: order.delivery_time
      },
      restaurant: {
        id: order.restaurant_id,
        name: order.restaurant_name
      },
      batch: order.batch_id
        ? {
            id: order.batch_id,
            service_date: order.batch_service_date,
            batch_status: order.batch_status,
            delivery_agent_id: order.delivery_agent_id
          }
        : null,
      items: items.map((item) => ({
        id: item.id,
        item_kind: item.item_kind,
        menu_item_id: item.menu_item_id,
        extras_product_id: item.extras_product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        line_total: item.line_total,
        item_status: item.item_status,
        refund_amount: item.refund_amount,
        is_veg: item.is_veg,
        note: item.note,
        image_url: item.image_url,
        addon_snapshot: item.addon_snapshot,
        option_snapshot: item.option_snapshot,
        refunds: refundsByItemId.get(item.id) ?? []
      })),
      refunds,
      delivery_attempts: deliveryAttempts
    };
  },

  async listMine(studentId: string, options: OrderListOptions) {
    const offset = (options.page - 1) * options.limit;
    const [orders, total] = await Promise.all([
      orderRepository.listCustomerOrders(studentId, { limit: options.limit, offset }),
      orderRepository.countCustomerOrders(studentId)
    ]);
    const totalPages = Math.ceil(total / options.limit);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        drop_point: order.drop_point,
        subtotal: order.subtotal,
        fee: order.fee,
        total_amount: order.total_amount,
        placed_at: order.placed_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        latest_activity_at: order.latest_activity_at,
        item_count: order.item_count,
        campus: {
          id: order.campus_id,
          name: order.campus_name,
          city: order.campus_city
        },
        restaurant: {
          id: order.restaurant_id,
          name: order.restaurant_name
        }
      })),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        total_pages: totalPages,
        has_next: options.page < totalPages
      }
    };
  }
};