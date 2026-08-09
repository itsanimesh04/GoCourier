import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import menuItemService from "../services/admin/menuItem.service";
import restaurantService from "../services/admin/restaurant.service";
import categoryService from "../services/admin/category.service";
import type { Category, MenuItem, Restaurant } from "../types/admin.types";

const MenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    restaurant_id: "",
    category_id: "",
    name: "",
    description: "",
    price: "0.00",
    original_price: "",
    is_veg: true,
    is_available: true,
    sort_order: 0,
    image_url: null as string | null,
    image_key: null as string | null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [m, r, c] = await Promise.all([
      menuItemService.list(restaurantFilter ? { restaurant_id: restaurantFilter } : undefined),
      restaurantService.list(),
      categoryService.list(),
    ]);
    setItems(m.data.data);
    setRestaurants(r.data.data);
    setCategories(c.data.data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [restaurantFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      restaurant_id: restaurantFilter || restaurants[0]?.id || "",
      category_id: "",
      name: "",
      description: "",
      price: "0.00",
      original_price: "",
      is_veg: true,
      is_available: true,
      sort_order: 0,
      image_url: null,
      image_key: null,
    });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      restaurant_id: item.restaurant_id,
      category_id: item.category_id ?? "",
      name: item.name,
      description: item.description,
      price: item.price,
      original_price: item.original_price ?? "",
      is_veg: item.is_veg ?? true,
      is_available: item.is_available,
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
        name: form.name,
        description: form.description,
        price: form.price,
        original_price: form.original_price || null,
        is_veg: form.is_veg,
        is_available: form.is_available,
        category_id: form.category_id || null,
        sort_order: Number(form.sort_order) || 0,
        image_url: form.image_url,
        image_key: form.image_key,
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
      await load();
    } finally {
      setSaving(false);
    }
  };

  const restaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name ?? id.slice(-6);

  return (
    <div>
      <PageHeader
        title="Menu Items"
        subtitle="Food catalog for restaurants"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Add item
          </button>
        }
      />

      <div className="mb-4">
        <select
          className="admin-input max-w-xs"
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
        >
          <option value="">All restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Restaurant</th>
              <th>Price</th>
              <th>Veg</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td>{restaurantName(item.restaurant_id)}</td>
                <td>₹{item.price}</td>
                <td>{item.is_veg ? "Yes" : "No"}</td>
                <td>
                  <span className={`badge ${item.is_available ? "badge-green" : "badge-red"}`}>
                    {item.is_available ? "Available" : "Off"}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-btn admin-btn-ghost py-1.5!"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit menu item" : "Add menu item"}
        wide
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <ImageUpload
              folder="menu-items"
              imageUrl={form.image_url}
              imageKey={form.image_key}
              onChange={({ url, key }) =>
                setForm((f) => ({ ...f, image_url: url, image_key: key }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-(--text-muted) mb-1 block">Restaurant</label>
            <select
              className="admin-input"
              value={form.restaurant_id}
              onChange={(e) => setForm((f) => ({ ...f, restaurant_id: e.target.value }))}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-(--text-muted) mb-1 block">Category</label>
            <select
              className="admin-input"
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-(--text-muted) mb-1 block">Name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-(--text-muted) mb-1 block">Description</label>
            <textarea
              className="admin-input min-h-20"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-(--text-muted) mb-1 block">Price</label>
            <input
              className="admin-input"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-(--text-muted) mb-1 block">Original price</label>
            <input
              className="admin-input"
              value={form.original_price}
              onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
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
          <button
            className="admin-btn admin-btn-primary col-span-2"
            onClick={save}
            disabled={saving || !form.restaurant_id}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;
