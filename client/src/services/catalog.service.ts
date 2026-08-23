import clientApi from '../apis/clientApi';
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
}

export default new CatalogService();
