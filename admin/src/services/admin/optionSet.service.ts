import adminApi from "../../apis/adminApi";

export interface OptionChoice {
  id: string;
  name: string;
  sort_order: number;
}

export interface OptionSet {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  choices: OptionChoice[];
  created_at?: string;
  updated_at?: string;
}

class OptionSetService {
  list() {
    return adminApi.get<{ success: boolean; data: OptionSet[] }>("/option-sets");
  }

  get(id: string) {
    return adminApi.get<{ success: boolean; data: OptionSet }>(`/option-sets/${id}`);
  }

  create(body: Record<string, unknown>) {
    return adminApi.post<{ success: boolean; data: OptionSet }>("/option-sets", body);
  }

  update(id: string, body: Record<string, unknown>) {
    return adminApi.patch<{ success: boolean; data: OptionSet }>(`/option-sets/${id}`, body);
  }

  remove(id: string) {
    return adminApi.delete(`/option-sets/${id}`);
  }
}

export default new OptionSetService();
