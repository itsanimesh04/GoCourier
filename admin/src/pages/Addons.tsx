import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import addonService, { type AddonGroup } from "@/services/admin/addon.service";
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

type FormAddon = {
  id?: string;
  name: string;
  price: string;
  is_veg: boolean | null;
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
  is_active: boolean;
};

type FormSubGroup = {
  id?: string;
  name: string;
  sort_order: number;
  addons: FormAddon[];
};

type FormState = {
  name: string;
  is_active: boolean;
  sort_order: number;
  subgroups: FormSubGroup[];
};

const emptyAddon = (sort = 0): FormAddon => ({
  name: "",
  price: "0.00",
  is_veg: true,
  image_url: null,
  image_key: null,
  sort_order: sort,
  is_active: true,
});

const emptySubGroup = (sort = 0): FormSubGroup => ({
  name: "",
  sort_order: sort,
  addons: [emptyAddon(0)],
});

const emptyForm = (): FormState => ({
  name: "",
  is_active: true,
  sort_order: 0,
  subgroups: [emptySubGroup(0)],
});

const Addons = () => {
  const [items, setItems] = useState<AddonGroup[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AddonGroup | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await addonService.listGroups();
    setItems(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (group: AddonGroup) => {
    setEditing(group);
    setForm({
      name: group.name,
      is_active: group.is_active,
      sort_order: group.sort_order,
      subgroups:
        group.subgroups.length > 0
          ? group.subgroups.map((sub, i) => ({
              id: sub.id,
              name: sub.name,
              sort_order: sub.sort_order ?? i,
              addons:
                sub.addons.length > 0
                  ? sub.addons.map((a, j) => ({
                      id: a.id,
                      name: a.name,
                      price: a.price,
                      is_veg: a.is_veg,
                      image_url: a.image_url,
                      image_key: a.image_key,
                      sort_order: a.sort_order ?? j,
                      is_active: a.is_active,
                    }))
                  : [emptyAddon(0)],
            }))
          : [emptySubGroup(0)],
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
        subgroups: form.subgroups.map((sub, i) => ({
          ...(sub.id ? { id: sub.id } : {}),
          name: sub.name,
          sort_order: sub.sort_order ?? i,
          addons: sub.addons
            .filter((a) => a.name.trim())
            .map((a, j) => ({
              ...(a.id ? { id: a.id } : {}),
              name: a.name.trim(),
              price: a.price || "0.00",
              is_veg: a.is_veg,
              image_url: a.image_url,
              image_key: a.image_key,
              sort_order: a.sort_order ?? j,
              is_active: a.is_active,
            })),
        })),
      };
      if (editing) await addonService.updateGroup(editing.id, payload);
      else await addonService.createGroup(payload);
      setOpen(false);
      toast.success(editing ? "Addon group updated" : "Addon group created");
      await load();
    } catch {
      toast.error("Failed to save addon group");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this addon group and all its addons?")) return;
    try {
      await addonService.removeGroup(id);
      toast.success("Addon group deleted");
      await load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = items.filter((g) =>
    g.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addons"
        subtitle="Reusable addon groups with sub-groups and items"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add group
          </Button>
        }
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search groups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sub-groups</TableHead>
                  <TableHead>Addons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((group) => {
                  const addonCount = group.subgroups.reduce(
                    (n, s) => n + s.addons.length,
                    0
                  );
                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.subgroups.length}</TableCell>
                      <TableCell>{addonCount}</TableCell>
                      <TableCell>
                        <Badge variant={group.is_active ? "secondary" : "destructive"}>
                          {group.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(group)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void remove(group.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No addon groups yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit addon group" : "Create addon group"}
        xwide
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Group name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Pizza Toppings"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
              />
              Active
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Sub-groups</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    subgroups: [...f.subgroups, emptySubGroup(f.subgroups.length)],
                  }))
                }
              >
                <Plus className="size-3.5" /> Sub-group
              </Button>
            </div>

            {form.subgroups.map((sub, si) => (
              <div
                key={sub.id ?? `new-sub-${si}`}
                className="space-y-3 rounded-xl border border-border p-3"
              >
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1 space-y-1.5">
                    <Label>Sub-group title (optional)</Label>
                    <Input
                      value={sub.name}
                      placeholder="e.g. Non-Veg Toppings Regular"
                      onChange={(e) =>
                        setForm((f) => {
                          const subgroups = [...f.subgroups];
                          subgroups[si] = { ...subgroups[si], name: e.target.value };
                          return { ...f, subgroups };
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={form.subgroups.length <= 1}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        subgroups: f.subgroups.filter((_, i) => i !== si),
                      }))
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {sub.addons.map((addon, ai) => (
                    <div
                      key={addon.id ?? `new-addon-${si}-${ai}`}
                      className="grid grid-cols-1 gap-3 rounded-lg bg-muted/40 p-3 sm:grid-cols-[120px_1fr]"
                    >
                      <ImageUpload
                        folder="addons"
                        aspect="square"
                        imageUrl={addon.image_url}
                        imageKey={addon.image_key}
                        onChange={({ url, key }) =>
                          setForm((f) => {
                            const subgroups = [...f.subgroups];
                            const addons = [...subgroups[si].addons];
                            addons[ai] = {
                              ...addons[ai],
                              image_url: url,
                              image_key: key,
                            };
                            subgroups[si] = { ...subgroups[si], addons };
                            return { ...f, subgroups };
                          })
                        }
                      />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label>Title</Label>
                          <Input
                            value={addon.name}
                            onChange={(e) =>
                              setForm((f) => {
                                const subgroups = [...f.subgroups];
                                const addons = [...subgroups[si].addons];
                                addons[ai] = { ...addons[ai], name: e.target.value };
                                subgroups[si] = { ...subgroups[si], addons };
                                return { ...f, subgroups };
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Price</Label>
                          <Input
                            value={addon.price}
                            onChange={(e) =>
                              setForm((f) => {
                                const subgroups = [...f.subgroups];
                                const addons = [...subgroups[si].addons];
                                addons[ai] = { ...addons[ai], price: e.target.value };
                                subgroups[si] = { ...subgroups[si], addons };
                                return { ...f, subgroups };
                              })
                            }
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={addon.is_veg === true}
                            onChange={(e) =>
                              setForm((f) => {
                                const subgroups = [...f.subgroups];
                                const addons = [...subgroups[si].addons];
                                addons[ai] = {
                                  ...addons[ai],
                                  is_veg: e.target.checked,
                                };
                                subgroups[si] = { ...subgroups[si], addons };
                                return { ...f, subgroups };
                              })
                            }
                          />
                          Veg
                        </label>
                        <div className="sm:col-span-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={sub.addons.length <= 1}
                            onClick={() =>
                              setForm((f) => {
                                const subgroups = [...f.subgroups];
                                subgroups[si] = {
                                  ...subgroups[si],
                                  addons: subgroups[si].addons.filter((_, i) => i !== ai),
                                };
                                return { ...f, subgroups };
                              })
                            }
                          >
                            <Trash2 className="size-3.5" /> Remove addon
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm((f) => {
                        const subgroups = [...f.subgroups];
                        subgroups[si] = {
                          ...subgroups[si],
                          addons: [
                            ...subgroups[si].addons,
                            emptyAddon(subgroups[si].addons.length),
                          ],
                        };
                        return { ...f, subgroups };
                      })
                    }
                  >
                    <Plus className="size-3.5" /> Addon
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save group"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Addons;
