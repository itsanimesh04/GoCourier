import { menuItems } from './mockData';
import type { MenuItem } from '../utils/types';

/** Related dishes: same category first, then same restaurant. Cap at `limit`. */
export function getRelatedFoods(item: MenuItem, limit = 8): MenuItem[] {
  const others = menuItems.filter((m) => m.id !== item.id);
  const byCategory = item.category
    ? others.filter((m) => m.category === item.category)
    : [];
  const byRestaurant = others.filter(
    (m) =>
      m.restaurantId === item.restaurantId &&
      !byCategory.some((c) => c.id === m.id)
  );
  return [...byCategory, ...byRestaurant].slice(0, limit);
}
