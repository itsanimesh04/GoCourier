import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import restaurantService from "../services/admin/restaurant.service";
import campusService from "../services/admin/campus.service";
import type { Campus, Restaurant } from "../types/admin.types";

const Restaurants = () => {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusFilter, setCampusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({
    campus_id: "",
    name: "",
    cuisine: "",
    rating: 4.2,
    distance_km: 1,
    eta_minutes: 30,
    tags: "",
    image_url: null as string | null,
    image_key: null as string | null,
    open_time: "10:00",
    close_time: "22:00",
    is_open: true,
    is_active: true,
    commission_rate: "0.00",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [r, c] = await Promise.all([
      restaurantService.list(campusFilter ? { campus_id: campusFilter } : undefined),
      campusService.list(),
    ]);
    setItems(r.data.data);
    setCampuses(c.data.data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [campusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      campus_id: campuses[0]?.id ?? "",
      name: "",
      cuisine: "",
      rating: 4.2,
      distance_km: 1,
      eta_minutes: 30,
      tags: "",
      image_url: null,
      image_key: null,
      open_time: "10:00",
      close_time: "22:00",
      is_open: true,
      is_active: true,
      commission_rate: "0.00",
    });
    setOpen(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({
      campus_id: r.campus_id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      distance_km: r.distance_km,
      eta_minutes: r.eta_minutes,
      tags: r.tags?.join(", ") ?? "",
      image_url: r.image_url,
      image_key: r.image_key,
      open_time: r.open_time?.slice(0, 5) ?? "10:00",
      close_time: r.close_time?.slice(0, 5) ?? "22:00",
      is_open: r.is_open,
      is_active: r.is_active,
      commission_rate: r.commission_rate,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) await restaurantService.update(editing.id, payload);
      else await restaurantService.create(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const campusName = (id: string) => campuses.find((c) => c.id === id)?.name ?? id.slice(-6);

  return (
    <div>
      <PageHeader
        title="Restaurants"
        subtitle="Campus-linked restaurant catalog"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Add restaurant
          </button>
        }
      />

      <div className="mb-4">
        <select
          className="admin-input max-w-xs"
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value)}
        >
          <option value="">All campuses</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Campus</th>
              <th>Cuisine</th>
              <th>Open</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.name}</td>
                <td>{campusName(r.campus_id)}</td>
                <td>{r.cuisine || "—"}</td>
                <td>
                  <span className={`badge ${r.is_open ? "badge-green" : "badge-yellow"}`}>
                    {r.is_open ? "Open" : "Closed"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${r.is_active ? "badge-green" : "badge-red"}`}>
                    {r.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-ghost !py-1.5" onClick={() => openEdit(r)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit restaurant" : "Add restaurant"}
        wide
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Image</label>
            <ImageUpload
              folder="restaurants"
              imageUrl={form.image_url}
              imageKey={form.image_key}
              onChange={({ url, key }) =>
                setForm((f) => ({ ...f, image_url: url, image_key: key }))
              }
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Campus</label>
            <select
              className="admin-input"
              value={form.campus_id}
              onChange={(e) => setForm((f) => ({ ...f, campus_id: e.target.value }))}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {(
            [
              ["name", "Name"],
              ["cuisine", "Cuisine"],
              ["tags", "Tags (comma separated)"],
              ["open_time", "Open time"],
              ["close_time", "Close time"],
              ["commission_rate", "Commission"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">{label}</label>
              <input
                className="admin-input"
                value={String(form[key])}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_open}
              onChange={(e) => setForm((f) => ({ ...f, is_open: e.target.checked }))}
            />
            Open now
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <button
            className="admin-btn admin-btn-primary col-span-2"
            onClick={save}
            disabled={saving || !form.campus_id}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Restaurants;
