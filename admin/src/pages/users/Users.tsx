import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import userService from "../../services/admin/user.service";
import type { AdminUser } from "../../types/admin.types";

const Users = () => {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const load = async () => {
    const res = await userService.list({
      search: search || undefined,
      role: role || undefined,
    });
    setItems(res.data.data.items);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load().catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search, role]);

  const toggleActive = async (u: AdminUser) => {
    await userService.update(u.id, { is_active: !u.is_active });
    await load();
  };

  return (
    <div>
      <PageHeader title="Users" subtitle="Students and staff accounts" />

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="admin-input max-w-sm"
          placeholder="Search name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input max-w-xs" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="ops">Ops</option>
          <option value="admin">Admin</option>
          <option value="delivery_agent">Delivery</option>
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name || "—"}</td>
                <td>
                  <div className="text-sm">{u.email || "—"}</div>
                  <div className="text-xs text-(--text-muted)">{u.phone || ""}</div>
                </td>
                <td>
                  <span className="badge badge-blue">{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? "badge-green" : "badge-red"}`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-btn admin-btn-ghost py-1.5!"
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
