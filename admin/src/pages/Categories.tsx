import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import categoryService from "../services/admin/category.service";
import type { Category } from "../types/admin.types";

const Categories = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    sort_order: 0,
    is_active: true,
    image_url: null as string | null,
    image_key: null as string | null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await categoryService.list();
    setItems(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      sort_order: items.length,
      is_active: true,
      image_url: null,
      image_key: null,
    });
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      sort_order: c.sort_order,
      is_active: c.is_active,
      image_url: c.image_url,
      image_key: c.image_key,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await categoryService.update(editing.id, form);
      else await categoryService.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await categoryService.remove(id);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Homepage food category tiles"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Add category
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="admin-card overflow-hidden">
            <div className="h-36 bg-[#0f172a]">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Order {c.sort_order}</p>
              </div>
              <div className="flex gap-2">
                <button className="admin-btn admin-btn-ghost !py-1.5" onClick={() => openEdit(c)}>
                  Edit
                </button>
                <button
                  className="admin-btn admin-btn-ghost !py-1.5 text-red-400"
                  onClick={() => remove(c.id)}
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
        title={editing ? "Edit category" : "Add category"}
      >
        <div className="space-y-3">
          <ImageUpload
            folder="categories"
            imageUrl={form.image_url}
            imageKey={form.image_key}
            onChange={({ url, key }) => setForm((f) => ({ ...f, image_url: url, image_key: key }))}
          />
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
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

export default Categories;
