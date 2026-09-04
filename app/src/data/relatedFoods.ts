import type { MenuItem } from '../utils/types';

export function getRelatedFoods(item: MenuItem, catalog: MenuItem[], limit = 8): MenuItem[] {
  const others = catalog.filter((m) => m.id !== item.id);
  const byCategory = item.category ? others.filter((m) => m.category === item.category) : [];
  const byRestaurant = others.filter(
    (m) => m.restaurantId === item.restaurantId && !byCategory.some((c) => c.id === m.id)
  );
  return [...byCategory, ...byRestaurant].slice(0, limit);
}
