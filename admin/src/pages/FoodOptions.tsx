import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import optionSetService, { type OptionSet } from "@/services/admin/optionSet.service";
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

type FormChoice = {
  id?: string;
  name: string;
  sort_order: number;
};

type FormState = {
  name: string;
  is_active: boolean;
  sort_order: number;
  choices: FormChoice[];
};

const emptyChoice = (sort = 0): FormChoice => ({
  name: "",
  sort_order: sort,
});

const emptyForm = (): FormState => ({
  name: "",
  is_active: true,
  sort_order: 0,
  choices: [emptyChoice(0), emptyChoice(1)],
});

const FoodOptions = () => {
  const [items, setItems] = useState<OptionSet[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OptionSet | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await optionSetService.list();
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

  const openEdit = (set: OptionSet) => {
    setEditing(set);
    setForm({
      name: set.name,
      is_active: set.is_active,
      sort_order: set.sort_order,
      choices:
        set.choices.length > 0
          ? set.choices.map((choice, i) => ({
              id: choice.id,
              name: choice.name,
              sort_order: choice.sort_order ?? i,
            }))
          : [emptyChoice(0)],
    });
    setOpen(true);
  };

  const save = async () => {
    const choices = form.choices
      .map((choice, index) => ({
        ...(choice.id ? { id: choice.id } : {}),
        name: choice.name.trim(),
        sort_order: choice.sort_order ?? index,
      }))
      .filter((choice) => choice.name.length > 0);

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (choices.length === 0) {
      toast.error("Add at least one choice");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
        choices,
      };
      if (editing) {
        await optionSetService.update(editing.id, payload);
      } else {
        await optionSetService.create(payload);
      }
      setOpen(false);
      toast.success(editing ? "Option set updated" : "Option set created");
      await load();
    } catch {
      toast.error("Failed to save option set");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (set: OptionSet) => {
    if (!window.confirm(`Delete option set "${set.name}"?`)) return;
    try {
      await optionSetService.remove(set.id);
      toast.success("Option set deleted");
      await load();
    } catch {
      toast.error("Failed to delete option set");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.choices.some((choice) => choice.name.toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food Options"
        subtitle="Reusable size/portion choices (Half, Full, Regular…). Prices are set per menu item."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add option set
          </Button>
        }
      />

      <div className="w-full max-w-xs">
        <Input
          placeholder="Search options…"
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
                  <TableHead>Choices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-36" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.choices.map((choice) => (
                          <Badge key={choice.id} variant="secondary">
                            {choice.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "secondary" : "destructive"}>
                        {item.is_active ? "Active" : "Off"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void remove(item)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No option sets yet. Create ones like Portion (Half / Full / Quarter) or Pizza
                      Size (Regular / Medium / Large).
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
        title={editing ? "Edit option set" : "Add option set"}
        wide
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Portion Size"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Choices</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    choices: [...f.choices, emptyChoice(f.choices.length)],
                  }))
                }
              >
                <Plus className="size-3.5" /> Add choice
              </Button>
            </div>
            <div className="space-y-2">
              {form.choices.map((choice, index) => (
                <div key={choice.id ?? `new-${index}`} className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Half"
                    value={choice.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        choices: f.choices.map((c, i) =>
                          i === index ? { ...c, name: e.target.value } : c
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={form.choices.length <= 1}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        choices: f.choices.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Labels only here. Attach this set on a menu item to set prices per food.
            </p>
          </div>

          <Button className="w-full" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FoodOptions;
