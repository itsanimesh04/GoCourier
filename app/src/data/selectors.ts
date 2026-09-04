import type { FoodFilters, MenuItem, Restaurant } from '../utils/types';

export function getRestaurantById(list: Restaurant[], id: string): Restaurant | undefined {
  return list.find((r) => r.id === id);
}

export function getMenuItemById(list: MenuItem[], id: string): MenuItem | undefined {
  return list.find((m) => m.id === id);
}

export function getMenuByRestaurant(list: MenuItem[], restaurantId: string): MenuItem[] {
  return list.filter((m) => m.restaurantId === restaurantId);
}

export function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category ?? 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function getAllCategories(items: MenuItem[]): string[] {
  const set = new Set<string>();
  items.forEach((m) => {
    if (m.category) set.add(m.category);
  });
  return Array.from(set).sort();
}

export function getAllCuisines(restaurants: Restaurant[], items: MenuItem[]): string[] {
  const set = new Set<string>();
  restaurants.forEach((r) => {
    r.cuisine.split(',').forEach((c) => {
      if (c.trim()) set.add(c.trim());
    });
  });
  items.forEach((m) => {
    if (m.category) set.add(m.category);
  });
  return Array.from(set).sort();
}

export function filterMenuItems(
  items: MenuItem[],
  filters: FoodFilters,
  restaurantMap?: Map<string, Restaurant>
): MenuItem[] {
  const q = filters.query.trim().toLowerCase();
  const map = restaurantMap ?? new Map<string, Restaurant>();

  return items.filter((item) => {
    if (filters.availability === 'in_stock' && !item.isAvailable) return false;
    if (filters.availability === 'out_of_stock' && item.isAvailable) return false;
    if (item.price < filters.priceFrom || item.price > filters.priceTo) return false;
    if (filters.diet === 'veg' && !item.isVeg) return false;
    if (filters.diet === 'non_veg' && item.isVeg) return false;
    if (filters.categories.length > 0 && (!item.category || !filters.categories.includes(item.category))) {
      return false;
    }
    if (filters.cuisine) {
      const restaurant = map.get(item.restaurantId);
      const cuisineMatch =
        item.category?.toLowerCase() === filters.cuisine.toLowerCase() ||
        restaurant?.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase());
      if (!cuisineMatch) return false;
    }
    if (filters.minRating != null) {
      if (item.rating < filters.minRating) return false;
    }
    if (q) {
      const hay = `${item.name} ${item.description} ${item.category ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterRestaurants(list: Restaurant[], filters: FoodFilters): Restaurant[] {
  const q = filters.query.trim().toLowerCase();
  return list.filter((r) => {
    if (filters.minRating != null && r.rating < filters.minRating) return false;
    if (filters.cuisine && !r.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())) {
      return false;
    }
    if (q && !`${r.name} ${r.cuisine}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function lineUnitTotal(unitPrice: number, addons: { price: number }[]): number {
  return unitPrice + addons.reduce((sum, a) => sum + a.price, 0);
}
