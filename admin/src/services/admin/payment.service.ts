import adminApi from "../../apis/adminApi";
import type { Paginated, PaymentRow } from "../../types/admin.types";

class PaymentService {
  list(params?: Record<string, string | undefined>) {
    return adminApi.get<{ success: boolean; data: Paginated<PaymentRow> }>("/payments", {
      params,
    });
  }
}

export default new PaymentService();
