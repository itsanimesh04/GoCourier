import { useEffect, useState } from "react";
import { FiRefreshCw, FiShoppingBag, FiUsers, FiLayers, FiMapPin } from "react-icons/fi";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import PageHeader from "../components/PageHeader";
import dashboardService from "../services/admin/dashboard.service";
import type { DashboardStats } from "../types/admin.types";

const Home = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Orders today",
      value: stats?.orders_today ?? 0,
      icon: <FiShoppingBag />,
    },
    {
      title: "GMV today",
      value: `₹${stats?.gmv_today ?? "0.00"}`,
      icon: <RiMoneyRupeeCircleLine />,
    },
    {
      title: "Active students",
      value: stats?.active_users ?? 0,
      icon: <FiUsers />,
    },
    {
      title: "Open batches",
      value: stats?.open_batches ?? 0,
      icon: <FiLayers />,
    },
    {
      title: "Restaurants",
      value: stats?.active_restaurants ?? 0,
      icon: <FiMapPin />,
    },
    {
      title: "Menu items",
      value: stats?.available_menu_items ?? 0,
      icon: <FiShoppingBag />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live snapshot of GoCourier operations"
        actions={
          <button onClick={fetchStats} className="admin-btn admin-btn-ghost" disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={14} />
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="admin-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-muted)]">{card.title}</span>
              <span className="text-[var(--primary)]">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold">{loading ? "…" : card.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold">Recent orders</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Restaurant</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recent_orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-[var(--text-muted)]">
                  No recent orders
                </td>
              </tr>
            ) : (
              stats?.recent_orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id.slice(-8)}</td>
                  <td>{o.restaurant_name ?? "—"}</td>
                  <td>
                    <span className="badge badge-blue">{o.order_status}</span>
                  </td>
                  <td>
                    <span className="badge badge-green">{o.payment_status}</span>
                  </td>
                  <td>₹{o.total_amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
