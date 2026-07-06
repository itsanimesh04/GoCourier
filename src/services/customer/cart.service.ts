import { menuItemRepository, type MenuItemRow } from '../../repositories/menu-item.repository';
import { orderRepository, type CartHeaderRow, type CartItemDetailRow } from '../../repositories/order.repository';
import { paymentRepository } from '../../repositories/payment.repository';
import { restaurantRepository } from '../../repositories/restaurant.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors';

interface CartItemInput {
  menu_item_id: string;
  quantity: number;
}

const zeroFee = '0.00';

function decimalToCents(value: string) {
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
}

function centsToDecimal(cents: number) {
  const absolute = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}

function requireSelectedCampus(campusId: string | null) {
  if (!campusId) {
    throw new BadRequestError('Campus must be selected');
  }

  return campusId;
}

function buildMenuItemMap(menuItems: MenuItemRow[]) {
  return new Map(menuItems.map((item) => [item.id, item]));
}

function formatCart(header: CartHeaderRow, items: CartItemDetailRow[]) {
  return {
    id: header.id,
    order_status: header.order_status,
    payment_status: header.payment_status,
    drop_point: header.drop_point,
    campus: {
      id: header.campus_id,
      name: header.campus_name,
      city: header.campus_city,
      cutoff_time: header.cutoff_time,
      delivery_time: header.delivery_time
    },
    restaurant: {
      id: header.restaurant_id,
      name: header.restaurant_name
    },
    items: items.map((item) => ({
      id: item.id,
      menu_item_id: item.menu_item_id,
      name: item.item_name_snap,
      price: item.price_snapshot,
      quantity: item.quantity,
      line_total: centsToDecimal(decimalToCents(item.price_snapshot) * item.quantity),
      is_veg: item.is_veg,
      is_available: item.is_available
    })),
    subtotal: header.subtotal,
    fee: header.fee,
    total_amount: header.total_amount
  };
}

export const cartService = {
  async getCart(studentId: string) {
    const header = await orderRepository.getCartHeader(studentId);

    if (!header) {
      return null;
    }

    const items = await orderRepository.getCartItems(header.id);
    return formatCart(header, items);
  },

  async createOrReplaceCart(
    studentId: string,
    studentCampusId: string | null,
    data: { restaurant_id: string; items: CartItemInput[] }
  ) {
    const campusId = requireSelectedCampus(studentCampusId);
    const restaurant = await restaurantRepository.findActiveByIdForCampus(data.restaurant_id, campusId);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    await orderRepository.withTransaction(async (client) => {
      // Fetch menu items *inside* the transaction under FOR SHARE locks.
      // This closes the TOCTOU window: a concurrent admin toggle of is_available
      // must wait for this transaction to commit before it can write.
      const menuItems = await menuItemRepository.findByIdsForRestaurantForShare(
        client,
        data.restaurant_id,
        data.items.map((item) => item.menu_item_id)
      );

      if (menuItems.length !== data.items.length) {
        throw new NotFoundError('Menu item not found');
      }

      const unavailableItem = menuItems.find((item) => !item.is_available);

      if (unavailableItem) {
        throw new BadRequestError('Menu item is unavailable');
      }

      const menuItemMap = buildMenuItemMap(menuItems);

      let subtotalCents = 0;
      const orderItems = data.items.map((item) => {
        const menuItem = menuItemMap.get(item.menu_item_id);

        if (!menuItem) {
          throw new NotFoundError('Menu item not found');
        }

        subtotalCents += decimalToCents(menuItem.price) * item.quantity;

        return {
          menu_item_id: menuItem.id,
          item_name_snap: menuItem.name,
          price_snapshot: menuItem.price,
          quantity: item.quantity
        };
      });

      const subtotal = centsToDecimal(subtotalCents);
      const fee = zeroFee;
      const totalAmount = centsToDecimal(subtotalCents + decimalToCents(fee));

      const currentCart = await orderRepository.findOpenCartForStudentForUpdate(client, studentId);

      if (currentCart && currentCart.restaurant_id !== data.restaurant_id) {
        throw new ConflictError('clear cart to switch restaurants');
      }

      if (currentCart) {
        const existingSession = await paymentRepository.findPendingRazorpaySessionForOrderForUpdate(
          client,
          currentCart.id
        );

        if (existingSession) {
          throw new ConflictError('Payment has already been initiated for this cart');
        }
      }

      const cart = currentCart
        ? await orderRepository.updateCartTotals(client, currentCart.id, {
            subtotal,
            fee,
            total_amount: totalAmount
          })
        : await orderRepository.createCart(client, {
            student_id: studentId,
            campus_id: campusId,
            restaurant_id: data.restaurant_id,
            subtotal,
            fee,
            total_amount: totalAmount
          });

      await orderRepository.replaceCartItems(client, cart.id, orderItems);
      await orderRepository.insertAudit(client, {
        order_id: cart.id,
        actor_id: studentId,
        action: currentCart ? 'cart.updated' : 'cart.created',
        details: {
          restaurant_id: data.restaurant_id,
          item_count: orderItems.length,
          subtotal,
          fee,
          total_amount: totalAmount
        }
      });
      await orderRepository.insertAudit(client, {
        order_id: cart.id,
        actor_id: studentId,
        action: 'cart.items_replaced',
        details: {
          items: orderItems.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price_snapshot: item.price_snapshot
          }))
        }
      });
    });

    return cartService.getCart(studentId);
  }
};
