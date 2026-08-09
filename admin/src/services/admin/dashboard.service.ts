import adminApi from "../../apis/adminApi";
import type { DashboardStats } from "../../types/admin.types";

class DashboardService {
  getStats() {
    return adminApi.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats");
  }
}

export default new DashboardService();
