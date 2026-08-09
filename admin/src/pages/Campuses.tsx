import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import campusService from "@/services/admin/campus.service";
import type { Campus } from "@/types/admin.types";
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
      const payload = { ...form, state: form.state || null };
      if (editing) await campusService.update(editing.id, payload);
      else await campusService.create(payload);
      setOpen(false);
      toast.success(editing ? "Campus updated" : "Campus created");
      await load();
    } catch {
      toast.error("Failed to save campus");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campuses"
        subtitle="Batch cutoff and hostel delivery timing"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add campus
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
                  <TableHead>City</TableHead>
                  <TableHead>Cutoff</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      {c.city}
                      {c.state ? `, ${c.state}` : ""}
                    </TableCell>
                    <TableCell>{c.cutoff_time}</TableCell>
                    <TableCell>{c.delivery_time}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "secondary" : "destructive"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
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
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
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
          <Button className="w-full" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Campuses;
