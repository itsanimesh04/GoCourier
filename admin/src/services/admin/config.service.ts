import adminApi from "../../apis/adminApi";
import type { AppConfig } from "../../types/admin.types";

class ConfigService {
  get() {
    return adminApi.get<{ success: boolean; data: AppConfig }>("/config");
  }

  update(body: Partial<AppConfig>) {
    return adminApi.patch("/config", body);
  }
}

export default new ConfigService();
