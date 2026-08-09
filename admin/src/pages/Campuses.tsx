import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import campusService from "../services/admin/campus.service";
import type { Campus } from "../types/admin.types";

const emptyForm = {
  name: "",
  city: "",
  state: "",
  cutoff_time: "21:30",
  delivery_time: "21:45",
  is_active: true,
};

const Campuses = () => {
  const [items, setItems] = useState<Campus[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await campusService.list();
    setItems(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Campus) => {
    setEditing(c);
    setForm({
      name: c.name,
      city: c.city,
      state: c.state ?? "",
      cutoff_time: c.cutoff_time.slice(0, 5),
      delivery_time: c.delivery_time.slice(0, 5),
      is_active: c.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        state: form.state || null,
      };
      if (editing) await campusService.update(editing.id, payload);
      else await campusService.create(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Campuses"
        subtitle="Batch cutoff and hostel delivery timing"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Add campus
          </button>
        }
      />

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Cutoff</th>
              <th>Delivery</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>
                  {c.city}
                  {c.state ? `, ${c.state}` : ""}
                </td>
                <td>{c.cutoff_time}</td>
                <td>{c.delivery_time}</td>
                <td>
                  <span className={`badge ${c.is_active ? "badge-green" : "badge-red"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-ghost py-1.5!" onClick={() => openEdit(c)}>
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
        title={editing ? "Edit campus" : "Add campus"}
      >
        <div className="space-y-3">
          {(
            [
              ["name", "Name"],
              ["city", "City"],
              ["state", "State"],
              ["cutoff_time", "Cutoff (HH:mm)"],
              ["delivery_time", "Delivery (HH:mm)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-(--text-muted) mb-1 block">{label}</label>
              <input
                className="admin-input"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <button className="admin-btn admin-btn-primary w-full" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Campuses;
