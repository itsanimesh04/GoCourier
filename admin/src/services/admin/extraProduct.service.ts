import adminApi from "../../apis/adminApi";

export interface ExtraProduct {
  id: string;
  campus_id: string | null;
  name: string;
  unit: string;
  price: string;
  category: string;
  store_name: string;
  image_url: string | null;
  image_key: string | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
}

class ExtraProductService {
  list(params?: { campus_id?: string; search?: string; available?: boolean }) {
    return adminApi.get<{ success: boolean; data: ExtraProduct[] }>("/extras-products", { params });
  }

  create(body: Record<string, unknown>) {
    return adminApi.post("/extras-products", body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch(`/extras-products/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/extras-products/${id}`);
  }
}

export default new ExtraProductService();
