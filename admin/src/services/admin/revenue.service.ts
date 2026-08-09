import adminApi from "../../apis/adminApi";
import type { RevenueSummary } from "../../types/admin.types";

class RevenueService {
  summary(params?: { from?: string; to?: string; campus_id?: string }) {
    return adminApi.get<{ success: boolean; data: RevenueSummary }>("/revenue/summary", {
      params,
    });
  }
}

export default new RevenueService();
