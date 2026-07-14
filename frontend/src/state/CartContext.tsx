import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '../lib/types';
import { apiClient, apiEnabled, ApiClientError } from '../lib/api';
import { useAuth } from './AuthContext';

export interface PendingSwitch {
  restaurantId: string;
  itemId: string;
}

export interface CartContextValue {
  cartItems: CartItem[];
  pendingSwitch: PendingSwitch | null;
  setPendingSwitch: (value: PendingSwitch | null) => void;
  addItem: (itemId: string, menuItems: MenuItem[]) => void;
  removeItem: (itemId: string) => void;
  clearCartAndSwitch: (menuItems: MenuItem[]) => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);

  async function saveCart(nextItems: CartItem[], forceReplace = false) {
    if (!apiEnabled || !token || !nextItems.length) {
      return;
    }

    try {
      await apiClient.saveCart(token, nextItems[0].restaurantId, nextItems, forceReplace);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const item = nextItems[nextItems.length - 1];
        setPendingSwitch({ restaurantId: item.restaurantId, itemId: item.menuItemId });
      }
    }
  }

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      pendingSwitch,
      setPendingSwitch,
      setCartItems,
      addItem: (itemId, menuItems) => {
        const item = menuItems.find((entry) => entry.id === itemId);
        if (!item) {
          return;
        }
        setCartItems((current) => {
          const existingRestaurantId = current[0]?.restaurantId;
          if (existingRestaurantId && existingRestaurantId !== item.restaurantId) {
            setPendingSwitch({ restaurantId: item.restaurantId, itemId });
            return current;
          }

          const existing = current.find((cartItem) => cartItem.menuItemId === itemId);
          if (existing) {
            const next = current.map((cartItem) =>
              cartItem.menuItemId === itemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
            void saveCart(next);
            return next;
          }
          const next = [...current, { menuItemId: item.id, restaurantId: item.restaurantId, quantity: 1, unitPrice: item.price }];
          void saveCart(next);
          return next;
        }
        );
      },
      removeItem: (itemId) => {
        setCartItems((current) => {
          const next = current
            .map((cartItem) =>
              cartItem.menuItemId === itemId ? { ...cartItem, quantity: Math.max(0, cartItem.quantity - 1) } : cartItem
            )
            .filter((cartItem) => cartItem.quantity > 0);
          void saveCart(next);
          return next;
        });
      },
      clearCartAndSwitch: (menuItems) => {
        if (!pendingSwitch) {
          return;
        }
        const item = menuItems.find((entry) => entry.id === pendingSwitch.itemId);
        if (!item) {
          setPendingSwitch(null);
          return;
        }
        const next = [{ menuItemId: item.id, restaurantId: item.restaurantId, quantity: 1, unitPrice: item.price }];
        setCartItems(next);
        void saveCart(next, true);
        setPendingSwitch(null);
      }
    }),
    [cartItems, pendingSwitch, token]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
