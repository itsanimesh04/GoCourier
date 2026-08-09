import adminApi from "../../apis/adminApi";
import type { MenuItem } from "../../types/admin.types";

class MenuItemService {
  list(params?: { restaurant_id?: string; category_id?: string; search?: string }) {
    return adminApi.get<{ success: boolean; data: MenuItem[] }>("/menu-items", { params });
  }

  create(restaurantId: string, body: Record<string, unknown>) {
    return adminApi.post(`/restaurants/${restaurantId}/menu-items`, body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/menu-items/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/menu-items/${id}`);
  }
}

export default new MenuItemService();
