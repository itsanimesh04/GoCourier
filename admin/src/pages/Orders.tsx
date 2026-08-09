import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import orderService from "../services/admin/order.service";
import type { OrderRow } from "../types/admin.types";

const STATUSES = [
  "placed",
  "locked",
  "procuring",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "closed",
  "cancelled",
];

const Orders = () => {
  const [items, setItems] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const load = async () => {
    const res = await orderService.list(
      statusFilter ? { order_status: statusFilter } : undefined
    );
    setItems(res.data.data.items);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, [statusFilter]);

  const openDetail = async (id: string) => {
    const res = await orderService.getById(id);
    setDetail(res.data.data);
    setNewStatus(res.data.data.order_status);
  };

  const updateStatus = async () => {
    if (!detail) return;
    await orderService.updateStatus(detail.id, newStatus);
    setDetail(null);
    await load();
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Search and update order status" />

      <div className="mb-4">
        <select
          className="admin-input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant</th>
              <th>Student</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td className="font-mono text-xs">{o.id.slice(-8)}</td>
                <td>{o.restaurant_name ?? "—"}</td>
                <td>{o.student?.name || o.student?.email || o.student?.phone || "—"}</td>
                <td>
                  <span className="badge badge-blue">{o.order_status}</span>
                </td>
                <td>
                  <span className="badge badge-green">{o.payment_status}</span>
                </td>
                <td>₹{o.total_amount}</td>
                <td>
                  <button
                    className="admin-btn admin-btn-ghost py-1.5!"
                    onClick={() => openDetail(o.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Order detail" wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-(--text-muted)">Restaurant:</span>{" "}
                {detail.restaurant_name}
              </p>
              <p>
                <span className="text-(--text-muted)">Total:</span> ₹{detail.total_amount}
              </p>
              <p>
                <span className="text-(--text-muted)">Drop:</span> {detail.drop_point || "—"}
              </p>
              <p>
                <span className="text-(--text-muted)">Payment:</span> {detail.payment_status}
              </p>
            </div>

            <div>
              <label className="text-xs text-(--text-muted) mb-1 block">Update status</label>
              <div className="flex gap-2">
                <select
                  className="admin-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button className="admin-btn admin-btn-primary" onClick={updateStatus}>
                  Save
                </button>
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(detail.items ?? []).map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unit_price}</td>
                    <td>{item.item_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
