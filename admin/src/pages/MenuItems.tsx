import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import menuItemService from "@/services/admin/menuItem.service";
import addonService, { type Addon } from "@/services/admin/addon.service";
import restaurantService from "@/services/admin/restaurant.service";
import categoryService from "@/services/admin/category.service";
import type { Category, MenuItem, Restaurant } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const MenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    restaurant_id: "",
    category_id: "none",
    name: "",
    description: "",
    price: "0.00",
    original_price: "",
    rating: 4.2,
    is_veg: true,
    is_available: true,
    sort_order: 0,
    image_url: null as string | null,
    image_key: null as string | null,
    addon_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [m, r, c, a] = await Promise.all([
      menuItemService.list(
        restaurantFilter !== "all" ? { restaurant_id: restaurantFilter } : undefined
      ),
      restaurantService.list(),
      categoryService.list(),
      addonService.list(),
    ]);
    setItems(m.data.data);
    setRestaurants(r.data.data);
    setCategories(c.data.data);
    setAddons(a.data.data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [restaurantFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      restaurant_id: restaurantFilter !== "all" ? restaurantFilter : restaurants[0]?.id || "",
      category_id: "none",
      name: "",
      description: "",
      price: "0.00",
      original_price: "",
      rating: 4.2,
      is_veg: true,
      is_available: true,
      sort_order: 0,
      image_url: null,
      image_key: null,
      addon_ids: [],
    });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      restaurant_id: item.restaurant_id,
      category_id: item.category_id ?? "none",
      name: item.name,
      description: item.description,
      price: item.price,
      original_price: item.original_price ?? "",
      rating: item.rating ?? 4.2,
      is_veg: item.is_veg ?? true,
      is_available: item.is_available,
      sort_order: item.sort_order,
      image_url: item.image_url,
      image_key: item.image_key,
      addon_ids: item.addon_ids ?? [],
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        original_price: form.original_price || null,
        rating: Number(form.rating) || 0,
        is_veg: form.is_veg,
        is_available: form.is_available,
        category_id: form.category_id === "none" ? null : form.category_id,
        sort_order: Number(form.sort_order) || 0,
        image_url: form.image_url,
        image_key: form.image_key,
        addon_ids: form.addon_ids,
      };
      if (editing) {
        await menuItemService.update(editing.id, {
          ...payload,
          restaurant_id: form.restaurant_id,
        });
      } else {
        await menuItemService.create(form.restaurant_id, payload);
      }
      setOpen(false);
      toast.success(editing ? "Item updated" : "Item created");
      await load();
    } catch {
      toast.error("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const restaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name ?? id.slice(-6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Items"
        subtitle="Food catalog for restaurants"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add item
          </Button>
        }
      />

      <div className="max-w-xs">
        <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All restaurants</SelectItem>
            {restaurants.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Restaurant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Veg</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {restaurantName(item.restaurant_id)}
                    </TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.is_veg ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_available ? "secondary" : "destructive"}>
                        {item.is_available ? "Available" : "Off"}
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit menu item" : "Add menu item"}
        wide
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload
              folder="menu-items"
              imageUrl={form.image_url}
              imageKey={form.image_key}
              onChange={({ url, key }) =>
                setForm((f) => ({ ...f, image_url: url, image_key: key }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Restaurant</Label>
            <Select
              value={form.restaurant_id || undefined}
              onValueChange={(v) => setForm((f) => ({ ...f, restaurant_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Original price</Label>
            <Input
              value={form.original_price}
              onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rating (0–5)</Label>
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_veg}
              onChange={(e) => setForm((f) => ({ ...f, is_veg: e.target.checked }))}
            />
            Veg
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
            />
            Available
          </label>
          <div className="sm:col-span-2 space-y-2">
            <Label>Add-ons</Label>
            <div className="flex flex-wrap gap-2">
              {addons.map((addon) => {
                const checked = form.addon_ids.includes(addon.id);
                return (
                  <label key={addon.id} className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          addon_ids: checked
                            ? f.addon_ids.filter((id) => id !== addon.id)
                            : [...f.addon_ids, addon.id],
                        }))
                      }
                    />
                    {addon.name} (₹{addon.price})
                  </label>
                );
              })}
              {addons.length === 0 && (
                <p className="text-xs text-muted-foreground">No add-ons yet. Create them via API or add later.</p>
              )}
            </div>
          </div>
          <Button
            className="sm:col-span-2"
            onClick={() => void save()}
            disabled={saving || !form.restaurant_id}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;
