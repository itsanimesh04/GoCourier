import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import bannerService from "@/services/admin/banner.service";
import type { Banner } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      toast.success(editing ? "Banner updated" : "Banner created");
      await load();
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await bannerService.remove(id);
      toast.success("Banner deleted");
      await load();
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        subtitle="Hero rotator on the client homepage"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add banner
          </Button>
        }
      />

      <div className="space-y-4">
        {items.map((b) => (
          <Card key={b.id} className="overflow-hidden py-0">
            <div className="flex flex-col md:flex-row">
              <div className="h-40 shrink-0 bg-muted md:w-64">
                {b.image_url ? (
                  <img src={b.image_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <CardContent className="flex flex-1 items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-lg font-semibold">{b.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.subtitle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    CTA: {b.cta_label || "—"} → {b.cta_href || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => void remove(b.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
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
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
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

export default Banners;
