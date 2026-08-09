import adminApi from "../../apis/adminApi";
import type { Restaurant } from "../../types/admin.types";

class RestaurantService {
  list(params?: { campus_id?: string; search?: string; is_active?: boolean }) {
    return adminApi.get<{ success: boolean; data: Restaurant[] }>("/restaurants", { params });
  }

  create(body: Record<string, unknown>) {
    return adminApi.post("/restaurants", body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/restaurants/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/restaurants/${id}`);
  }
}

export default new RestaurantService();
