import clientApi from '../apis/clientApi';
import type { SearchResults } from '../utils/types';
import { mapBanner, mapCampus, mapConfig, mapExtra, mapMenuItem, mapRestaurant } from './mappers';

class CatalogService {
  async campuses() {
    const res = await clientApi.get('/campuses');
    return (res.data.data as Parameters<typeof mapCampus>[0][]).map(mapCampus);
  }

  async restaurants(q?: string) {
    const res = await clientApi.get('/restaurants', { params: q ? { q } : undefined });
    return (res.data.data as Parameters<typeof mapRestaurant>[0][]).map(mapRestaurant);
  }

  async restaurant(id: string) {
    const res = await clientApi.get(`/restaurants/${id}`);
    return mapRestaurant(res.data.data);
  }

  async menu(restaurantId: string) {
    const res = await clientApi.get(`/restaurants/${restaurantId}/menu`);
    return {
      restaurant: mapRestaurant(res.data.data.restaurant),
      items: (res.data.data.items as Parameters<typeof mapMenuItem>[0][]).map(mapMenuItem),
    };
  }

  async menuItem(id: string) {
    const res = await clientApi.get(`/menu-items/${id}`);
    return {
      restaurant: mapRestaurant(res.data.data.restaurant),
      item: mapMenuItem(res.data.data.item),
    };
  }

  async banners() {
    const res = await clientApi.get('/banners');
    return (res.data.data as Parameters<typeof mapBanner>[0][]).map(mapBanner);
  }

  async categories() {
    const res = await clientApi.get('/categories');
    return res.data.data as { id: string; name: string; image_url: string | null }[];
  }

  async extras(campusId?: string) {
    const res = await clientApi.get('/extras-products', { params: campusId ? { campus_id: campusId } : undefined });
    return (res.data.data as Parameters<typeof mapExtra>[0][]).map(mapExtra);
  }

  async config() {
    const res = await clientApi.get('/config');
    return mapConfig(res.data.data);
  }

  async search(q: string, mode?: 'food' | 'extras', campusId?: string): Promise<SearchResults> {
    const res = await clientApi.get('/search', {
      params: {
        q,
        mode: mode || undefined,
        campus_id: campusId || undefined,
      },
    });
    const d = res.data.data;
    return {
      restaurants: (d.restaurants || []).map((r: {
        id: string;
        name: string;
        cuisine: string;
        rating: number;
        image_url: string | null;
        address: string;
        distance_km: number;
        eta_minutes: number;
        is_open: boolean;
      }) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        rating: r.rating,
        imageUrl: r.image_url,
        address: r.address,
        distanceKm: r.distance_km,
        etaMinutes: r.eta_minutes,
        isOpen: r.is_open,
      })),
      dishes: (d.dishes || []).map((dish: {
        id: string;
        restaurant_id: string;
        restaurant_name: string;
        name: string;
        description: string;
        price: number;
        original_price: number | null;
        rating: number;
        is_veg: boolean | null;
        image_url: string | null;
      }) => ({
        id: dish.id,
        restaurantId: dish.restaurant_id,
        restaurantName: dish.restaurant_name,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        originalPrice: dish.original_price,
        rating: dish.rating,
        isVeg: dish.is_veg,
        imageUrl: dish.image_url,
      })),
      categories: (d.categories || []).map((c: { id: string; name: string; image_url: string | null }) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.image_url,
      })),
      extras: (d.extras || []).map((e: {
        id: string;
        name: string;
        category: string;
        price: number;
        image_url: string | null;
      }) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        price: e.price,
        imageUrl: e.image_url,
      })),
    };
  }
}

export default new CatalogService();

