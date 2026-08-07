import React, { type ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { OrderProvider, useOrder } from './OrderContext';
import type { Campus, CartItem, MenuItem, Order, Restaurant, User } from '../lib/types';
import type { PendingSwitch } from './CartContext';

export interface AppStateValue {
  token: string | null;
  user: User | null;
  userName: string;
  setUserName: (name: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  phone: string;
  setPhone: (phone: string) => void;
  campuses: Campus[];
  selectedCampus: Campus;
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  cartItems: CartItem[];
  order: Order;
  pendingSwitch: PendingSwitch | null;
  setPendingSwitch: (value: PendingSwitch | null) => void;
  signup: (input: {
    name: string;
    password: string;
    email?: string;
    phone?: string;
  }) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  selectCampus: (campusId: string) => Promise<void>;
  logout: () => Promise<void>;
  loadRestaurants: (query?: string, signal?: AbortSignal) => Promise<void>;
  loadMenu: (restaurantId: string) => Promise<void>;
  refreshOrder: (orderId: string) => Promise<void>;
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCartAndSwitch: () => void;
  setDropPoint: (value: string) => void;
  createOrder: () => Promise<string>;
  confirmPayment: (orderId?: string) => Promise<void>;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>{children}</CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export function useAppState(): AppStateValue {
  const auth = useAuth();
  const orderCtx = useOrder();
  const cart = useCart();

  return React.useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      userName: auth.userName,
      setUserName: auth.setUserName,
      isAuthenticated: auth.isAuthenticated,
      setIsAuthenticated: auth.setIsAuthenticated,
      logout: auth.logout,
      phone: auth.phone,
      setPhone: auth.setPhone,
      campuses: auth.campuses,
      selectedCampus: auth.selectedCampus,
      restaurants: orderCtx.restaurants,
      menuItems: orderCtx.menuItems,
      cartItems: cart.cartItems,
      order: orderCtx.order,
      pendingSwitch: cart.pendingSwitch,
      setPendingSwitch: cart.setPendingSwitch,
      signup: auth.signup,
      login: auth.login,
      selectCampus: auth.selectCampus,
      loadRestaurants: orderCtx.loadRestaurants,
      loadMenu: orderCtx.loadMenu,
      refreshOrder: orderCtx.refreshOrder,
      addItem: (itemId: string) => cart.addItem(itemId, orderCtx.menuItems),
      removeItem: cart.removeItem,
      clearCartAndSwitch: () => cart.clearCartAndSwitch(orderCtx.menuItems),
      setDropPoint: orderCtx.setDropPoint,
      createOrder: orderCtx.createOrder,
      confirmPayment: orderCtx.confirmPayment
    }),
    [auth, cart, orderCtx]
  );
}
