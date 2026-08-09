import adminApi from "../../apis/adminApi";
import type { Banner } from "../../types/admin.types";

class BannerService {
  list() {
    return adminApi.get<{ success: boolean; data: Banner[] }>("/banners");
  }

  create(body: Record<string, unknown>) {
    return adminApi.post("/banners", body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/banners/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/banners/${id}`);
  }
}

export default new BannerService();
