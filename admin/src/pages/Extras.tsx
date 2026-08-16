import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import extraProductService, { type ExtraProduct } from "@/services/admin/extraProduct.service";
import campusService from "@/services/admin/campus.service";
import type { Campus } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emptyForm = {
  campus_id: "all",
  name: "",
  unit: "1 pc",
  price: "20.00",
  category: "Snacks",
  store_name: "Campus Cart",
  available: true,
  featured: false,
  sort_order: 0,
  image_url: null as string | null,
  image_key: null as string | null,
};

const Extras = () => {
  const [items, setItems] = useState<ExtraProduct[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExtraProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [extras, campusRes] = await Promise.all([
      extraProductService.list(),
      campusService.list(),
    ]);
    setItems(extras.data.data);
    setCampuses(campusRes.data.data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: ExtraProduct) => {
    setEditing(item);
    setForm({
      campus_id: item.campus_id ?? "all",
      name: item.name,
      unit: item.unit,
      price: item.price,
      category: item.category,
      store_name: item.store_name,
      available: item.available,
      featured: item.featured,
      sort_order: item.sort_order,
      image_url: item.image_url,
      image_key: item.image_key,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        campus_id: form.campus_id === "all" ? null : form.campus_id,
      };
      if (editing) await extraProductService.update(editing.id, payload);
      else await extraProductService.create(payload);
      setOpen(false);
      toast.success(editing ? "Extra updated" : "Extra created");
      await load();
    } catch {
      toast.error("Failed to save extra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Extras"
        subtitle="Campus store products for the student app"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add extra
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.store_name}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      <Badge variant={item.available ? "secondary" : "destructive"}>
                        {item.available ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit extra" : "Add extra"} wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload
              folder="extras"
              imageUrl={form.image_url}
              imageKey={form.image_key}
              onChange={({ url, key }) => setForm((f) => ({ ...f, image_url: url, image_key: key }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Campus</Label>
            <Select value={form.campus_id} onValueChange={(v) => setForm((f) => ({ ...f, campus_id: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campuses</SelectItem>
                {campuses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Store name</Label>
            <Input
              value={form.store_name}
              onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>
          <Button className="sm:col-span-2" onClick={() => void save()} disabled={saving || !form.name}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Extras;
