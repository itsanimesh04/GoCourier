import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import paymentService from "../services/admin/payment.service";
import type { PaymentRow } from "../types/admin.types";

const Payments = () => {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    paymentService
      .list(status ? { status } : undefined)
      .then((res) => setItems(res.data.data.items))
      .catch(() => setItems([]));
  }, [status]);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Gateway payments linked to orders" />

      <div className="mb-4">
        <select
          className="admin-input max-w-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="created">created</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
          <option value="refunded">refunded</option>
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Payment</th>
              <th>Order</th>
              <th>Gateway</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-[var(--text-muted)]">
                  No payments yet
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.id.slice(-8)}</td>
                  <td className="font-mono text-xs">{p.order_id.slice(-8)}</td>
                  <td>{p.gateway}</td>
                  <td>₹{p.amount}</td>
                  <td>
                    <span className="badge badge-blue">{p.status}</span>
                  </td>
                  <td className="text-xs text-[var(--text-muted)]">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
