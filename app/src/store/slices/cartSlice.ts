import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import { apiErrorMessage, isConflictError } from '../../apis/clientApi';
import axios from 'axios';
import cartApi, { lineToCartApiItem } from '../../services/cart.service';
import { lineUnitTotal } from '../../data/selectors';
import { notifyUnauthorized } from '../../lib/authRedirect';
import type { CartLineItem, Order, SelectedAddon, SelectedOption } from '../../utils/types';

interface CartState {
  items: CartLineItem[];
  orders: Order[];
  lastPlacedOrderId: string | null;
  fee: number;
  status: 'idle' | 'loading';
  error: string | null;
}

const initialState: CartState = {
  items: [],
  orders: [],
  lastPlacedOrderId: null,
  fee: 0,
  status: 'idle',
  error: null,
};

function makeFoodCartKey(
  menuItemId: string,
  addons: SelectedAddon[],
  optionId?: string | null
): string {
  const addonIds = [...addons.map((a) => a.id)].sort().join(',');
  return `food:${menuItemId}:${optionId ?? ''}:${addonIds}`;
}

function mapServerCart(
  data: {
    fee?: string;
    restaurant?: { id: string } | null;
    items?: {
      id: string;
      item_kind?: string;
      menu_item_id?: string | null;
      extras_product_id?: string | null;
      name: string;
      price: string;
      quantity: number;
      note?: string | null;
      image_url?: string | null;
      addon_snapshot?: { id: string; name: string; price: string }[];
      option_snapshot?: { choice_id: string; name: string; price: string } | null;
      pickup_point?: string | null;
      drop_point?: string | null;
      size?: string | null;
    }[];
  } | null
): { items: CartLineItem[]; fee: number } {
  if (!data) return { items: [], fee: 0 };
  const restaurantId = data.restaurant?.id;
  return {
    fee: Number(data.fee ?? 0),
    items: (data.items ?? []).map((item) => {
      const addons = (item.addon_snapshot ?? []).map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price),
      }));
      const selectedOption = item.option_snapshot
        ? {
            id: item.option_snapshot.choice_id,
            name: item.option_snapshot.name,
            price: Number(item.option_snapshot.price),
          }
        : undefined;
      const kind = item.item_kind === 'food' ? 'food' : 'extra';
      const extrasProductId =
        item.item_kind === 'custom_request'
          ? 'custom-request'
          : item.item_kind === 'parcel'
            ? 'parcel-pickup'
            : item.extras_product_id ?? undefined;
      const cartKey =
        kind === 'food' && item.menu_item_id
          ? makeFoodCartKey(item.menu_item_id, addons, selectedOption?.id)
          : `extra:${extrasProductId ?? item.id}`;
      const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
      return {
        cartKey,
        kind,
        itemKind: (item.item_kind as CartLineItem['itemKind']) ?? 'food',
        menuItemId: item.menu_item_id ?? undefined,
        extrasProductId,
        restaurantId: kind === 'food' ? restaurantId : undefined,
        name: item.name,
        imageUrl: item.image_url ?? '',
        unitPrice: Number(item.price) - addonTotal,
        quantity: item.quantity,
        selectedAddons: addons,
        selectedOption,
        note: item.note ?? undefined,
        pickupPoint: item.pickup_point ?? undefined,
        dropPoint: item.drop_point ?? undefined,
        size: item.size ?? undefined,
      } satisfies CartLineItem;
    }),
  };
}

function confirmReplaceCart(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Replace cart?',
      'Your cart has items from another restaurant. Replace the cart?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Replace', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

async function postItems(items: CartLineItem[], force = false) {
  const food = items.find((item) => item.kind === 'food');
  try {
    const res = await cartApi.save({
      restaurant_id: food?.restaurantId ?? null,
      items: items.map(lineToCartApiItem),
      force_replace: force,
    });
    return mapServerCart(res.data.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      notifyUnauthorized('/cart');
    }
    if (isConflictError(error) && !force) {
      const replace = await confirmReplaceCart();
      if (replace) {
        const res = await cartApi.save({
          restaurant_id: food?.restaurantId ?? null,
          items: items.map(lineToCartApiItem),
          force_replace: true,
        });
        return mapServerCart(res.data.data);
      }
    }
    throw error;
  }
}

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await cartApi.get();
  return mapServerCart(res.data.data);
});

export const addFoodItem = createAsyncThunk(
  'cart/addFood',
  async (
    payload: {
      menuItemId: string;
      restaurantId: string;
      name: string;
      imageUrl: string;
      unitPrice: number;
      quantity: number;
      selectedAddons: SelectedAddon[];
      selectedOption?: SelectedOption;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    const cartKey = makeFoodCartKey(
      payload.menuItemId,
      payload.selectedAddons,
      payload.selectedOption?.id
    );
    const existing = state.cart.items.find((item) => item.cartKey === cartKey);
    const next = existing
      ? state.cart.items.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + payload.quantity } : item
        )
      : [
          ...state.cart.items,
          {
            cartKey,
            kind: 'food' as const,
            itemKind: 'food' as const,
            menuItemId: payload.menuItemId,
            restaurantId: payload.restaurantId,
            name: payload.name,
            imageUrl: payload.imageUrl,
            unitPrice: payload.unitPrice,
            quantity: payload.quantity,
            selectedAddons: payload.selectedAddons,
            selectedOption: payload.selectedOption,
          },
        ];
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const addExtra = createAsyncThunk(
  'cart/addExtra',
  async (
    payload: {
      extrasProductId: string;
      name: string;
      imageUrl: string;
      unitPrice: number;
      quantity?: number;
      note?: string;
      itemKind?: CartLineItem['itemKind'];
      pickupPoint?: string;
      dropPoint?: string;
      size?: string;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    const unique = Boolean(payload.note);
    const cartKey = unique
      ? `extra:${payload.extrasProductId}:${Date.now()}`
      : `extra:${payload.extrasProductId}`;
    const existing = unique ? undefined : state.cart.items.find((item) => item.cartKey === cartKey);
    const line: CartLineItem = {
      cartKey,
      kind: 'extra',
      itemKind:
        payload.itemKind ??
        (payload.extrasProductId === 'custom-request'
          ? 'custom_request'
          : payload.extrasProductId === 'parcel-pickup'
            ? 'parcel'
            : 'extra'),
      extrasProductId: payload.extrasProductId,
      name: payload.name,
      imageUrl: payload.imageUrl,
      unitPrice: payload.unitPrice,
      quantity: payload.quantity ?? 1,
      selectedAddons: [],
      note: payload.note,
      pickupPoint: payload.pickupPoint,
      dropPoint: payload.dropPoint,
      size: payload.size,
    };
    const next = existing
      ? state.cart.items.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + (payload.quantity ?? 1) } : item
        )
      : [...state.cart.items, line];
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/remove',
  async (cartKey: string, { getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    const next = state.cart.items.filter((item) => item.cartKey !== cartKey);
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const updateQty = createAsyncThunk(
  'cart/qty',
  async (payload: { cartKey: string; quantity: number }, { getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    const next =
      payload.quantity <= 0
        ? state.cart.items.filter((item) => item.cartKey !== payload.cartKey)
        : state.cart.items.map((item) =>
            item.cartKey === payload.cartKey ? { ...item, quantity: payload.quantity } : item
          );
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const setItemAddons = createAsyncThunk(
  'cart/addons',
  async (
    payload: {
      cartKey: string;
      selectedAddons: SelectedAddon[];
      selectedOption?: SelectedOption;
      unitPrice?: number;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    const next = state.cart.items.map((item) =>
      item.cartKey === payload.cartKey
        ? {
            ...item,
            selectedAddons: payload.selectedAddons,
            selectedOption: payload.selectedOption ?? item.selectedOption,
            unitPrice: payload.unitPrice ?? item.unitPrice,
            cartKey: item.menuItemId
              ? makeFoodCartKey(
                  item.menuItemId,
                  payload.selectedAddons,
                  (payload.selectedOption ?? item.selectedOption)?.id
                )
              : item.cartKey,
          }
        : item
    );
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const decrementFoodItem = createAsyncThunk(
  'cart/decrementFood',
  async (menuItemId: string, { getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    const lines = state.cart.items.filter((item) => item.kind === 'food' && item.menuItemId === menuItemId);
    if (lines.length === 0) return { items: state.cart.items, fee: state.cart.fee };
    const target = lines.find((item) => item.selectedAddons.length === 0) ?? lines[lines.length - 1];
    const next =
      target.quantity <= 1
        ? state.cart.items.filter((item) => item.cartKey !== target.cartKey)
        : state.cart.items.map((item) =>
            item.cartKey === target.cartKey ? { ...item, quantity: item.quantity - 1 } : item
          );
    try {
      return await postItems(next);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearLastPlaced(state) {
      state.lastPlacedOrderId = null;
    },
    setLastPlacedOrderId(state, action: PayloadAction<string | null>) {
      state.lastPlacedOrderId = action.payload;
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    clearCartLocal(state) {
      state.items = [];
      state.fee = 0;
    },
  },
  extraReducers: (builder) => {
    const apply = (
      state: CartState,
      action: { payload: { items: CartLineItem[]; fee: number } | undefined }
    ) => {
      if (!action.payload) return;
      state.items = action.payload.items;
      state.fee = action.payload.fee;
      state.error = null;
      state.status = 'idle';
    };
    const fail = (state: CartState, action: { payload?: unknown }) => {
      state.status = 'idle';
      state.error = typeof action.payload === 'string' ? action.payload : 'Cart update failed';
    };
    builder
      .addCase(fetchCart.fulfilled, apply)
      .addCase(addFoodItem.fulfilled, apply)
      .addCase(addExtra.fulfilled, apply)
      .addCase(removeItem.fulfilled, apply)
      .addCase(updateQty.fulfilled, apply)
      .addCase(setItemAddons.fulfilled, apply)
      .addCase(decrementFoodItem.fulfilled, apply)
      .addCase(addFoodItem.rejected, fail)
      .addCase(addExtra.rejected, fail)
      .addCase(removeItem.rejected, fail)
      .addCase(updateQty.rejected, fail);
  },
});

export const { clearLastPlaced, setLastPlacedOrderId, setOrders, clearCartLocal } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectMenuItemQty = (menuItemId: string) => (state: { cart: CartState }) =>
  state.cart.items
    .filter((i) => i.kind === 'food' && i.menuItemId === menuItemId)
    .reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + lineUnitTotal(i.unitPrice, i.selectedAddons) * i.quantity, 0);
export const selectDeliveryFee = (state: { cart: CartState }) => state.cart.fee;
export const selectOrders = (state: { cart: CartState }) => state.cart.orders;
export const selectLastPlacedOrderId = (state: { cart: CartState }) => state.cart.lastPlacedOrderId;

export default cartSlice.reducer;
