import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import bannerService from "../services/admin/banner.service";
import type { Banner } from "../types/admin.types";

const Banners = () => {
  const [items, setItems] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    cta_label: "",
    cta_href: "",
    sort_order: 0,
    is_active: true,
    image_url: null as string | null,
    image_key: null as string | null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await bannerService.list();
    setItems(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      subtitle: "",
      cta_label: "Order now",
      cta_href: "/food",
      sort_order: items.length,
      is_active: true,
      image_url: null,
      image_key: null,
    });
    setOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      cta_label: b.cta_label,
      cta_href: b.cta_href,
      sort_order: b.sort_order,
      is_active: b.is_active,
      image_url: b.image_url,
      image_key: b.image_key,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await bannerService.update(editing.id, form);
      else await bannerService.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await bannerService.remove(id);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="Hero rotator on the client homepage"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Add banner
          </button>
        }
      />

      <div className="space-y-4">
        {items.map((b) => (
          <div key={b.id} className="admin-card flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-64 h-40 bg-[#0f172a] shrink-0">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="p-5 flex-1 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">{b.title}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{b.subtitle}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  CTA: {b.cta_label || "—"} → {b.cta_href || "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="admin-btn admin-btn-ghost !py-1.5" onClick={() => openEdit(b)}>
                  Edit
                </button>
                <button
                  className="admin-btn admin-btn-ghost !py-1.5 text-red-400"
                  onClick={() => remove(b.id)}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit banner" : "Add banner"}
        wide
      >
        <div className="space-y-3">
          <ImageUpload
            folder="banners"
            imageUrl={form.image_url}
            imageKey={form.image_key}
            onChange={({ url, key }) => setForm((f) => ({ ...f, image_url: url, image_key: key }))}
          />
          {(
            [
              ["title", "Title"],
              ["subtitle", "Subtitle"],
              ["cta_label", "CTA label"],
              ["cta_href", "CTA href"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">{label}</label>
              <input
                className="admin-input"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Sort order</label>
            <input
              type="number"
              className="admin-input"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
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

export default Banners;
