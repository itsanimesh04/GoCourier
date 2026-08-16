import adminApi from "../../apis/adminApi";

export interface Addon {
  id: string;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_active: boolean;
}

class AddonService {
  list() {
    return adminApi.get<{ success: boolean; data: Addon[] }>("/addons");
  }

  create(body: Record<string, unknown>) {
    return adminApi.post("/addons", body);
  }
}

export default new AddonService();
