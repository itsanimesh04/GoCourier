import adminApi from "../../apis/adminApi";
import type { Campus } from "../../types/admin.types";

class CampusService {
  list(params?: { search?: string; is_active?: boolean }) {
    return adminApi.get<{ success: boolean; data: Campus[] }>("/campuses", { params });
  }

  create(body: Partial<Campus>) {
    return adminApi.post("/campuses", body);
  }

  update(id: string, body: Partial<Campus>) {
    return adminApi.patch(`/campuses/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/campuses/${id}`);
  }
}

export default new CampusService();
