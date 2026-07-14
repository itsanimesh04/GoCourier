import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialOrder, menuItems as mockMenuItems, restaurants as mockRestaurants } from '../data/mockData';
import type { MenuItem, Order, Restaurant } from '../lib/types';
import { apiClient, apiEnabled } from '../lib/api';
import { useAuth } from './AuthContext';

export interface OrderContextValue {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  loadRestaurants: (query?: string, signal?: AbortSignal) => Promise<void>;
  loadMenu: (restaurantId: string) => Promise<void>;
  refreshOrder: (orderId: string) => Promise<void>;
  setDropPoint: (value: string) => void;
  createOrder: () => Promise<string>;
  confirmPayment: (orderId?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { token, selectedCampus } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [order, setOrder] = useState<Order>(initialOrder);

  const value = useMemo<OrderContextValue>(
    () => ({
      restaurants,
      menuItems,
      order,
      setOrder,
      loadRestaurants: async (query = '', signal?: AbortSignal) => {
        if (!apiEnabled || !token || !selectedCampus.id) {
          return;
        }
        try {
          const apiRestaurants = await apiClient.listRestaurants(token, selectedCampus.id, query);
          if (!signal?.aborted) {
            setRestaurants(apiRestaurants);
          }
        } catch (error) {
          if (signal?.aborted) {
            return;
          }
          throw error;
        }
      },
      loadMenu: async (restaurantId) => {
        if (!apiEnabled || !token) {
          return;
        }
        const menu = await apiClient.getMenu(token, restaurantId);
        setRestaurants((current) => {
          const exists = current.some((restaurant) => restaurant.id === menu.restaurant.id);
          return exists ? current.map((restaurant) => (restaurant.id === menu.restaurant.id ? menu.restaurant : restaurant)) : [...current, menu.restaurant];
        });
        setMenuItems((current) => {
          const others = current.filter((item) => item.restaurantId !== restaurantId);
          return [...others, ...menu.items];
        });
      },
      refreshOrder: async (orderId) => {
        if (!apiEnabled || !token) {
          return;
        }
        const apiOrder = await apiClient.getOrder(token, orderId);
        setOrder(apiOrder);
      },
      setDropPoint: (dropPoint) => {
        setOrder((current) => ({ ...current, dropPoint }));
      },
      createOrder: async () => {
        if (!apiEnabled || !token) {
          return order.id;
        }
        const result = await apiClient.createOrder(token, order.dropPoint);
        setOrder((current) => ({
          ...current,
          id: result.order_id,
          displayId: `GC-${result.order_id.slice(0, 5).toUpperCase()}`,
          totalAmount: Number(result.total_amount)
        }));
        return result.order_id;
      },
      confirmPayment: async (orderId) => {
        if (apiEnabled && token && orderId) {
          await apiClient.pay(token, orderId);
          await apiClient.getOrder(token, orderId).then(setOrder).catch(() => undefined);
          return;
        }
        setOrder((current) => ({
          ...current,
          orderStatus: 'procuring',
          paymentStatus: 'success'
        }));
      }
    }),
    [menuItems, order, restaurants, selectedCampus.id, token]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used inside OrderProvider');
  }
  return context;
}
