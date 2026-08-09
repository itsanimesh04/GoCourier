import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import categoryService from "@/services/admin/category.service";
import type { Category } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      toast.success(editing ? "Category updated" : "Category created");
      await load();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryService.remove(id);
      toast.success("Category deleted");
      await load();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Homepage food category tiles"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="overflow-hidden pt-0">
            <div className="h-36 bg-muted">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <CardContent className="flex items-center justify-between gap-2 pt-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">Order {c.sort_order}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                  Edit
                </Button>
                <Button variant="outline" size="icon" onClick={() => void remove(c.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sort order</Label>
            <Input
              type="number"
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
          <Button className="w-full" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
