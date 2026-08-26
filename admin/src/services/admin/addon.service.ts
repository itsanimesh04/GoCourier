import adminApi from "../../apis/adminApi";

export interface AddonItem {
  id: string;
  subgroup_id: string | null;
  name: string;
  price: string;
  is_veg: boolean | null;
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AddonSubGroup {
  id: string;
  group_id: string;
  name: string;
  sort_order: number;
  addons: AddonItem[];
}

export interface AddonGroup {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  subgroups: AddonSubGroup[];
  created_at?: string;
  updated_at?: string;
}

/** @deprecated flat addon list — prefer AddonGroup */
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

  listGroups() {
    return adminApi.get<{ success: boolean; data: AddonGroup[] }>("/addon-groups");
  }

  getGroup(id: string) {
    return adminApi.get<{ success: boolean; data: AddonGroup }>(`/addon-groups/${id}`);
  }

  createGroup(body: Record<string, unknown>) {
    return adminApi.post<{ success: boolean; data: AddonGroup }>("/addon-groups", body);
  }

  updateGroup(id: string, body: Record<string, unknown>) {
    return adminApi.patch<{ success: boolean; data: AddonGroup }>(`/addon-groups/${id}`, body);
  }

  removeGroup(id: string) {
    return adminApi.delete(`/addon-groups/${id}`);
  }
}

export default new AddonService();
