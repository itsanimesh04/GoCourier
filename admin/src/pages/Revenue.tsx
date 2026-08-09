import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import revenueService from "../services/admin/revenue.service";
import type { RevenueSummary } from "../types/admin.types";

const Revenue = () => {
  const [data, setData] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    revenueService
      .summary()
      .then((res) => setData(res.data.data))
      .catch(() => setData(null));
  }, []);

  const maxGmv = Math.max(
    1,
    ...(data?.by_day ?? []).map((d) => Number(d.gmv) || 0)
  );

  return (
    <div>
      <PageHeader title="Revenue" subtitle="GMV, fees, refunds, and daily trends" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          ["GMV", data?.gmv],
          ["Fees", data?.fees],
          ["Refunds", data?.refunds],
          ["Net", data?.net_revenue],
        ].map(([label, value]) => (
          <div key={label as string} className="admin-card p-5">
            <p className="text-sm text-[var(--text-muted)] mb-2">{label}</p>
            <p className="text-2xl font-bold">₹{value ?? "0.00"}</p>
          </div>
        ))}
      </div>

      <div className="admin-card p-5 mb-6">
        <h3 className="font-semibold mb-4">Daily GMV</h3>
        <div className="flex items-end gap-2 h-48">
          {(data?.by_day ?? []).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No revenue data yet</p>
          ) : (
            data?.by_day.map((day) => {
              const h = (Number(day.gmv) / maxGmv) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <div
                    className="w-full rounded-t-md bg-[var(--primary)]"
                    style={{ height: `${Math.max(4, h)}%` }}
                    title={`₹${day.gmv}`}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] truncate w-full text-center">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold">By campus</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Campus</th>
              <th>Orders</th>
              <th>GMV</th>
            </tr>
          </thead>
          <tbody>
            {(data?.by_campus ?? []).map((row) => (
              <tr key={row.campus_id ?? "none"}>
                <td className="font-mono text-xs">{row.campus_id?.slice(-8) ?? "—"}</td>
                <td>{row.order_count}</td>
                <td>₹{row.gmv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Revenue;
