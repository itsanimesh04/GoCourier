import adminApi from "../../apis/adminApi";
import type { AdminUser, Paginated } from "../../types/admin.types";

class UserService {
  list(params?: { search?: string; role?: string; is_active?: boolean }) {
    return adminApi.get<{ success: boolean; data: Paginated<AdminUser> }>("/users", { params });
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/users/${id}`, body);
  }
}

export default new UserService();
