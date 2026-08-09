import adminApi from "../../apis/adminApi";
import type { OrderRow, Paginated } from "../../types/admin.types";

class OrderService {
  list(params?: Record<string, string | undefined>) {
    return adminApi.get<{ success: boolean; data: Paginated<OrderRow> }>("/orders", { params });
  }

  getById(id: string) {
    return adminApi.get(`/orders/${id}`);
  }

  updateStatus(id: string, order_status: string) {
    return adminApi.patch(`/orders/${id}/status`, { order_status });
  }
}

export default new OrderService();
