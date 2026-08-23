import type { ClientSession } from 'mongoose';
import { ExtraProduct } from '../../models/extra-product.model';
import { FoodAddon } from '../../models/food-addon.model';
import { MenuItem } from '../../models/menu-item.model';
import { adminConfigService } from '../admin/config.service';
import { orderRepository, type CartHeaderRow, type CartItemDetailRow, type OrderItemInsert } from '../../repositories/order.repository';
import { paymentRepository } from '../../repositories/payment.repository';
import { restaurantRepository } from '../../repositories/restaurant.repository';
import { decimalToSubunits, subunitsToDecimal } from '../../utils/money';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors';

export type CartItemKind = 'food' | 'extra' | 'custom_request' | 'parcel';

export interface CartItemInput {
  item_kind: CartItemKind;
  quantity: number;
  menu_item_id?: string;
  extras_product_id?: string;
  addon_ids?: string[];
  note?: string | null;
  image_url?: string | null;
  pickup_point?: string | null;
  drop_point?: string | null;
  size?: string | null;
}

export interface CreateCartInput {
  restaurant_id?: string | null;
  items: CartItemInput[];
  force_replace?: boolean;
}

function requireSelectedCampus(campusId: string | null) {
  if (!campusId) {
    throw new BadRequestError('Campus must be selected');
  }
  return campusId;
}

function inferOrderKind(items: CartItemInput[]): 'food' | 'extras' | 'mixed' | 'parcel' | 'custom' {
  const kinds = new Set(items.map((item) => item.item_kind));
  if (kinds.size === 1) {
    const only = [...kinds][0];
    if (only === 'food') return 'food';
    if (only === 'parcel') return 'parcel';
    if (only === 'custom_request') return 'custom';
    return 'extras';
  }
  if (kinds.has('food')) return 'mixed';
  return 'extras';
}

function formatCart(header: CartHeaderRow, items: CartItemDetailRow[]) {
  return {
    id: header.id,
    order_kind: header.order_kind,
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
    restaurant: header.restaurant_id
      ? {
          id: header.restaurant_id,
          name: header.restaurant_name
        }
      : null,
    items: items.map((item) => ({
      id: item.id,
      item_kind: item.item_kind,
      menu_item_id: item.menu_item_id,
      extras_product_id: item.extras_product_id,
      name: item.item_name_snap,
      price: item.price_snapshot,
      quantity: item.quantity,
      line_total: subunitsToDecimal(decimalToSubunits(item.price_snapshot) * item.quantity),
      is_veg: item.is_veg,
      is_available: item.is_available,
      note: item.note,
      image_url: item.image_url,
      addon_snapshot: item.addon_snapshot,
      pickup_point: item.pickup_point,
      drop_point: item.drop_point,
      size: item.size
    })),
    subtotal: header.subtotal,
    fee: header.fee,
    total_amount: header.total_amount
  };
}

async function resolveCartItems(
  restaurantId: string | null,
  campusId: string,
  items: CartItemInput[],
  config: { delivery_fee: string; custom_request_fee: string; parcel_fee: string }
): Promise<{ orderItems: OrderItemInsert[]; subtotalCents: number; fee: string; orderKind: ReturnType<typeof inferOrderKind> }> {
  const foodItems = items.filter((item) => item.item_kind === 'food');
  if (foodItems.length > 0 && !restaurantId) {
    throw new BadRequestError('restaurant_id is required when cart includes food');
  }

  let subtotalCents = 0;
  const orderItems: OrderItemInsert[] = [];

  for (const item of items) {
    if (item.item_kind === 'food') {
      const menuItem = await MenuItem.findOne({
        _id: item.menu_item_id,
        restaurant_id: restaurantId,
        is_available: true
      }).exec();

      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      const allowedAddonIds = new Set(
        ((menuItem.addon_ids ?? []) as import('mongoose').Types.ObjectId[]).map((addonId) => addonId.toString())
      );
      const requestedAddonIds = item.addon_ids ?? [];
      if (requestedAddonIds.some((id) => !allowedAddonIds.has(id))) {
        throw new BadRequestError('Addon is not available for this menu item');
      }

      const addons = requestedAddonIds.length
        ? await FoodAddon.find({ _id: { $in: requestedAddonIds }, is_active: true }).exec()
        : [];

      if (addons.length !== requestedAddonIds.length) {
        throw new NotFoundError('Addon not found');
      }

      const addonSnapshot = addons.map((addon) => ({
        id: addon._id.toString(),
        name: addon.name,
        price: addon.price
      }));

      const unitCents =
        decimalToSubunits(menuItem.price) +
        addonSnapshot.reduce((sum, addon) => sum + decimalToSubunits(addon.price), 0);

      subtotalCents += unitCents * item.quantity;
      orderItems.push({
        item_kind: 'food',
        menu_item_id: menuItem._id.toString(),
        extras_product_id: null,
        item_name_snap:
          addonSnapshot.length > 0
            ? `${menuItem.name} (+${addonSnapshot.map((addon) => addon.name).join(', ')})`
            : menuItem.name,
        price_snapshot: subunitsToDecimal(unitCents),
        quantity: item.quantity,
        note: item.note ?? null,
        image_url: menuItem.image_url,
        addon_snapshot: addonSnapshot,
        pickup_point: null,
        drop_point: null,
        size: null
      });
      continue;
    }

    if (item.item_kind === 'extra') {
      const product = await ExtraProduct.findOne({
        _id: item.extras_product_id,
        available: true,
        $or: [{ campus_id: campusId }, { campus_id: null }]
      }).exec();

      if (!product) {
        throw new NotFoundError('Extra product not found');
      }

      subtotalCents += decimalToSubunits(product.price) * item.quantity;
      orderItems.push({
        item_kind: 'extra',
        menu_item_id: null,
        extras_product_id: product._id.toString(),
        item_name_snap: product.name,
        price_snapshot: product.price,
        quantity: item.quantity,
        note: item.note ?? null,
        image_url: product.image_url,
        addon_snapshot: [],
        pickup_point: null,
        drop_point: null,
        size: null
      });
      continue;
    }

    if (item.item_kind === 'custom_request') {
      subtotalCents += decimalToSubunits(config.custom_request_fee) * item.quantity;
      orderItems.push({
        item_kind: 'custom_request',
        menu_item_id: null,
        extras_product_id: null,
        item_name_snap: 'Custom request',
        price_snapshot: config.custom_request_fee,
        quantity: item.quantity,
        note: item.note ?? null,
        image_url: item.image_url ?? null,
        addon_snapshot: [],
        pickup_point: null,
        drop_point: null,
        size: null
      });
      continue;
    }

    if (!item.pickup_point?.trim() || !item.drop_point?.trim()) {
      throw new BadRequestError('Parcel pickup and drop points are required');
    }

    subtotalCents += decimalToSubunits(config.parcel_fee) * item.quantity;
    orderItems.push({
      item_kind: 'parcel',
      menu_item_id: null,
      extras_product_id: null,
      item_name_snap: 'Parcel pickup & drop',
      price_snapshot: config.parcel_fee,
      quantity: item.quantity,
      note: item.note ?? null,
      image_url: item.image_url ?? null,
      addon_snapshot: [],
      pickup_point: item.pickup_point,
      drop_point: item.drop_point,
      size: item.size ?? 'Small'
    });
  }

  const hasFood = items.some((item) => item.item_kind === 'food');
  const fee = hasFood ? config.delivery_fee : '0.00';
  return {
    orderItems,
    subtotalCents,
    fee,
    orderKind: inferOrderKind(items)
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

  async createOrReplaceCart(studentId: string, studentCampusId: string | null, data: CreateCartInput) {
    const campusId = requireSelectedCampus(studentCampusId);
    const restaurantId = data.restaurant_id ?? null;

    if (restaurantId) {
      const restaurant = await restaurantRepository.findActiveById(restaurantId);
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }
    }

    if (data.items.length === 0) {
      await orderRepository.withTransaction(async (session) => {
        const existingCart = await orderRepository.findOpenCartForStudent(studentId);
        if (!existingCart) return;
        const existingSession = await paymentRepository.findPendingRazorpaySessionForOrder(existingCart.id);
        if (existingSession) {
          throw new ConflictError('Payment has already been initiated for this cart');
        }
        await orderRepository.replaceCartItems(session, existingCart.id, []);
        await orderRepository.updateCartTotals(session, existingCart.id, {
          subtotal: '0.00',
          fee: '0.00',
          total_amount: '0.00',
          restaurant_id: null,
          order_kind: 'extras'
        });
      });
      return cartService.getCart(studentId);
    }

    const config = await adminConfigService.get();
    const resolved = await resolveCartItems(restaurantId, campusId, data.items, config);
    const subtotal = subunitsToDecimal(resolved.subtotalCents);
    const totalAmount = subunitsToDecimal(resolved.subtotalCents + decimalToSubunits(resolved.fee));

    await orderRepository.withTransaction(async (session: ClientSession) => {
      const existingCart = await orderRepository.findOpenCartForStudent(studentId);

      if (!existingCart) {
        const cart = await orderRepository.createCart(session, {
          student_id: studentId,
          campus_id: campusId,
          restaurant_id: restaurantId,
          order_kind: resolved.orderKind,
          subtotal,
          fee: resolved.fee,
          total_amount: totalAmount
        });

        await orderRepository.replaceCartItems(session, cart.id, resolved.orderItems);
        await orderRepository.insertAudit(session, {
          order_id: cart.id,
          actor_id: studentId,
          action: 'cart.created',
          details: { restaurant_id: restaurantId, item_count: resolved.orderItems.length }
        });
        return;
      }

      const switchingRestaurant =
        Boolean(restaurantId) &&
        Boolean(existingCart.restaurant_id) &&
        existingCart.restaurant_id !== restaurantId;

      if (switchingRestaurant && !data.force_replace) {
        throw new ConflictError('clear cart to switch restaurants');
      }

      const existingSession = await paymentRepository.findPendingRazorpaySessionForOrder(existingCart.id);
      if (existingSession) {
        throw new ConflictError('Payment has already been initiated for this cart');
      }

      await orderRepository.updateCartTotals(session, existingCart.id, {
        subtotal,
        fee: resolved.fee,
        total_amount: totalAmount,
        restaurant_id: restaurantId,
        order_kind: resolved.orderKind
      });
      await orderRepository.replaceCartItems(session, existingCart.id, resolved.orderItems);
      await orderRepository.insertAudit(session, {
        order_id: existingCart.id,
        actor_id: studentId,
        action: switchingRestaurant ? 'cart.switched' : 'cart.updated',
        details: { restaurant_id: restaurantId, item_count: resolved.orderItems.length }
      });
    });

    return cartService.getCart(studentId);
  }
};
