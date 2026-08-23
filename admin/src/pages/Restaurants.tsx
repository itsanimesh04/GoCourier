import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import restaurantService from "@/services/admin/restaurant.service";
import type { Restaurant } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emptyForm = {
  name: "",
  cuisine: "",
  rating: 4.2,
  address: "",
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
};

const Restaurants = () => {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await restaurantService.list();
    setItems(r.data.data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      address: r.address ?? "",
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
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: Number(form.rating) || 0,
        distance_km: Number(form.distance_km) || 0,
        eta_minutes: Number(form.eta_minutes) || 0,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) await restaurantService.update(editing.id, payload);
      else await restaurantService.create(payload);
      setOpen(false);
      toast.success(editing ? "Restaurant updated" : "Restaurant created");
      await load();
    } catch {
      toast.error("Failed to save restaurant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        subtitle="Restaurant catalog"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add restaurant
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
                  <TableHead className="hidden sm:table-cell">Cuisine</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{r.cuisine || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.is_open ? "secondary" : "outline"}>
                        {r.is_open ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_active ? "secondary" : "destructive"}>
                        {r.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit restaurant" : "Add restaurant"}
        wide
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Image</Label>
            <ImageUpload
              folder="restaurants"
              imageUrl={form.image_url}
              imageKey={form.image_key}
              onChange={({ url, key }) =>
                setForm((f) => ({ ...f, image_url: url, image_key: key }))
              }
            />
          </div>
          {(
            [
              ["name", "Name"],
              ["cuisine", "Cuisine"],
              ["address", "Address"],
              ["rating", "Rating (0–5)"],
              ["tags", "Tags (comma separated)"],
              ["open_time", "Open time"],
              ["close_time", "Close time"],
              ["commission_rate", "Commission"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
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
          <Button
            className="sm:col-span-2"
            onClick={() => void save()}
            disabled={saving || !form.name.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Restaurants;
