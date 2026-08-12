import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { restaurants, seedOrders, campuses } from '../../data/mockData';
import { lineUnitTotal } from '../../data/selectors';
import type { CartLineItem, Order, SelectedAddon } from '../../utils/types';

const CART_KEY = 'gcs-cart';
const ORDERS_KEY = 'gcs-orders';
const FEE = 20;

function loadCart(): CartLineItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
  } catch {
    return [];
  }
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    /* ignore */
  }
  return [...seedOrders];
}

function persistCart(items: CartLineItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function persistOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function makeFoodCartKey(menuItemId: string, addons: SelectedAddon[]): string {
  const addonIds = [...addons.map((a) => a.id)].sort().join(',');
  return `food:${menuItemId}:${addonIds}`;
}

export interface PlaceOrderPayload {
  campusId: string;
  paymentMethod: string;
}

interface CartState {
  items: CartLineItem[];
  orders: Order[];
  lastPlacedOrderId: string | null;
}

const initialState: CartState = {
  items: loadCart(),
  orders: loadOrders(),
  lastPlacedOrderId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addFoodItem(
      state,
      action: PayloadAction<{
        menuItemId: string;
        restaurantId: string;
        name: string;
        imageUrl: string;
        unitPrice: number;
        quantity: number;
        selectedAddons: SelectedAddon[];
      }>
    ) {
      const { menuItemId, restaurantId, name, imageUrl, unitPrice, quantity, selectedAddons } =
        action.payload;
      const cartKey = makeFoodCartKey(menuItemId, selectedAddons);
      const existing = state.items.find((i) => i.cartKey === cartKey);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          cartKey,
          kind: 'food',
          menuItemId,
          restaurantId,
          name,
          imageUrl,
          unitPrice,
          quantity,
          selectedAddons,
        });
      }
      persistCart(state.items);
    },
    addExtra(
      state,
      action: PayloadAction<{
        extrasProductId: string;
        name: string;
        imageUrl: string;
        unitPrice: number;
        quantity?: number;
        note?: string;
      }>
    ) {
      const {
        extrasProductId,
        name,
        imageUrl,
        unitPrice,
        quantity = 1,
        note,
      } = action.payload;
      // Service requests get unique keys so each submission is its own line
      const cartKey =
        note != null && note.length > 0
          ? `extra:${extrasProductId}:${Date.now()}`
          : `extra:${extrasProductId}`;
      const existing =
        note == null || note.length === 0
          ? state.items.find((i) => i.cartKey === cartKey)
          : undefined;
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          cartKey,
          kind: 'extra',
          extrasProductId,
          name,
          imageUrl,
          unitPrice,
          quantity,
          selectedAddons: [],
          note,
        });
      }
      persistCart(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.cartKey !== action.payload);
      persistCart(state.items);
    },
    updateQty(state, action: PayloadAction<{ cartKey: string; quantity: number }>) {
      const item = state.items.find((i) => i.cartKey === action.payload.cartKey);
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => i.cartKey !== action.payload.cartKey);
      } else {
        item.quantity = action.payload.quantity;
      }
      persistCart(state.items);
    },
    setItemAddons(
      state,
      action: PayloadAction<{ cartKey: string; selectedAddons: SelectedAddon[] }>
    ) {
      const item = state.items.find((i) => i.cartKey === action.payload.cartKey);
      if (!item || item.kind !== 'food' || !item.menuItemId) return;

      const newKey = makeFoodCartKey(item.menuItemId, action.payload.selectedAddons);
      const duplicate = state.items.find(
        (i) => i.cartKey === newKey && i.cartKey !== item.cartKey
      );
      if (duplicate) {
        duplicate.quantity += item.quantity;
        state.items = state.items.filter((i) => i.cartKey !== item.cartKey);
      } else {
        item.selectedAddons = action.payload.selectedAddons;
        item.cartKey = newKey;
      }
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
    placeOrder(state, action: PayloadAction<PlaceOrderPayload>) {
      if (state.items.length === 0) return;

      const subtotal = state.items.reduce(
        (sum, i) => sum + lineUnitTotal(i.unitPrice, i.selectedAddons) * i.quantity,
        0
      );
      const foodItem = state.items.find((i) => i.kind === 'food');
      const restaurant = foodItem?.restaurantId
        ? restaurants.find((r) => r.id === foodItem.restaurantId)
        : undefined;

      const id = `order-${Date.now()}`;
      const displayId = `GC-${Math.floor(10000 + Math.random() * 90000)}`;
      const campus = campuses.find((c) => c.id === action.payload.campusId);
      const order: Order = {
        id,
        displayId,
        restaurantId: restaurant?.id ?? 'mixed',
        restaurantName: restaurant?.name ?? 'Multiple vendors',
        campusId: action.payload.campusId,
        dropPoint: campus ? `${campus.name} — hostel batch drop` : 'Hostel batch drop',
        orderStatus: 'placed',
        paymentStatus: 'success',
        subtotal,
        fee: FEE,
        totalAmount: subtotal + FEE,
        eta: '45 mins',
        placedAt: new Date().toLocaleString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        items: state.items.map((i, idx) => {
          const unit = lineUnitTotal(i.unitPrice, i.selectedAddons);
          return {
            id: `${id}-item-${idx}`,
            menuItemId: i.menuItemId ?? i.extrasProductId ?? i.cartKey,
            name:
              i.selectedAddons.length > 0
                ? `${i.name} (+${i.selectedAddons.map((a) => a.name).join(', ')})`
                : i.name,
            quantity: i.quantity,
            unitPrice: unit,
            lineTotal: unit * i.quantity,
            itemStatus: 'confirmed' as const,
            refundAmount: 0,
          };
        }),
      };

      state.orders = [order, ...state.orders];
      state.lastPlacedOrderId = id;
      state.items = [];
      persistCart(state.items);
      persistOrders(state.orders);
    },
    clearLastPlaced(state) {
      state.lastPlacedOrderId = null;
    },
    /** Decrease qty for a menu item (prefers plain/no-addon line). */
    decrementFoodItem(state, action: PayloadAction<string>) {
      const menuItemId = action.payload;
      const lines = state.items.filter(
        (i) => i.kind === 'food' && i.menuItemId === menuItemId
      );
      if (lines.length === 0) return;
      const target =
        lines.find((i) => i.selectedAddons.length === 0) ?? lines[lines.length - 1];
      if (target.quantity <= 1) {
        state.items = state.items.filter((i) => i.cartKey !== target.cartKey);
      } else {
        target.quantity -= 1;
      }
      persistCart(state.items);
    },
  },
});

export const {
  addFoodItem,
  addExtra,
  removeItem,
  updateQty,
  setItemAddons,
  clearCart,
  placeOrder,
  clearLastPlaced,
  decrementFoodItem,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectMenuItemQty =
  (menuItemId: string) => (state: { cart: CartState }) =>
    state.cart.items
      .filter((i) => i.kind === 'food' && i.menuItemId === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (sum, i) => sum + lineUnitTotal(i.unitPrice, i.selectedAddons) * i.quantity,
    0
  );
export const selectDeliveryFee = (_state?: unknown) => FEE;
export const selectOrders = (state: { cart: CartState }) => state.cart.orders;
export const selectLastPlacedOrderId = (state: { cart: CartState }) =>
  state.cart.lastPlacedOrderId;

export default cartSlice.reducer;
