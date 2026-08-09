import adminApi from "../../apis/adminApi";
import type { Category } from "../../types/admin.types";

class CategoryService {
  list() {
    return adminApi.get<{ success: boolean; data: Category[] }>("/categories");
  }

  create(body: Record<string, unknown>) {
    return adminApi.post("/categories", body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/categories/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/categories/${id}`);
  }
}

export default new CategoryService();
