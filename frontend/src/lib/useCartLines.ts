import { useAppState } from '../state/AppState';
import type { CartItem, MenuItem } from './types';

export function useCartLines() {
  const { cartItems, menuItems, restaurants } = useAppState();
  const lines = cartItems
    .map((cartItem) => {
      const item = menuItems.find((entry) => entry.id === cartItem.menuItemId);
      return item ? { cartItem, item } : null;
    })
    .filter(Boolean) as Array<{ cartItem: CartItem; item: MenuItem }>;
  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.cartItem.quantity, 0);
  const fee = lines.length ? 20 : 0;
  const restaurant = restaurants.find((entry) => entry.id === lines[0]?.cartItem.restaurantId);
  return {
    lines,
    subtotal,
    fee,
    total: subtotal + fee,
    restaurant,
    count: lines.length
  };
}
