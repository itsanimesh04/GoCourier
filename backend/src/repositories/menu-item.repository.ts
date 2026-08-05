import { MenuItem, type IMenuItem } from '../models/menu-item.model';
import type { ClientSession } from 'mongoose';

export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_available: boolean;
  created_at: Date;
}

function toMenuItemRow(doc: IMenuItem): MenuItemRow {
  return {
    id: doc._id.toString(),
    restaurant_id: doc.restaurant_id.toString(),
    name: doc.name,
    price: doc.price,
    is_veg: doc.is_veg,
    is_available: doc.is_available,
    created_at: doc.created_at
  };
}

export const menuItemRepository = {
  async findById(id: string): Promise<MenuItemRow | null> {
    const doc = await MenuItem.findById(id).exec();
    return doc ? toMenuItemRow(doc) : null;
  },

  async listByRestaurant(restaurantId: string): Promise<MenuItemRow[]> {
    const docs = await MenuItem.find({ restaurant_id: restaurantId }).sort({ name: 1 }).exec();
    return docs.map(toMenuItemRow);
  },

  async findByIdsForRestaurant(restaurantId: string, ids: string[]): Promise<MenuItemRow[]> {
    const docs = await MenuItem.find({ 
      restaurant_id: restaurantId, 
      _id: { $in: ids } 
    }).sort({ name: 1 }).exec();
    return docs.map(toMenuItemRow);
  },

  /**
   * This method acquires a lock on each matched row.
   * In MongoDB, we use find() with the session for ACID guarantees.
   */
  async findByIdsForRestaurantForShare(
    session: ClientSession,
    restaurantId: string,
    ids: string[]
  ): Promise<MenuItemRow[]> {
    const docs = await MenuItem.find({ 
      restaurant_id: restaurantId, 
      _id: { $in: ids } 
    }).session(session).exec();
    return docs.map(toMenuItemRow);
  },

  async create(data: Partial<MenuItemRow>): Promise<MenuItemRow> {
    const doc = await MenuItem.create({
      restaurant_id: data.restaurant_id,
      name: data.name,
      price: data.price,
      is_veg: data.is_veg ?? null,
      is_available: data.is_available ?? true
    });
    return toMenuItemRow(doc);
  },

  async update(id: string, data: Partial<MenuItemRow>): Promise<MenuItemRow | null> {
    const updateData: Record<string, unknown> = {};
    const columns = ['restaurant_id', 'name', 'price', 'is_veg', 'is_available'];
    for (const column of columns) {
      if (data[column as keyof MenuItemRow] !== undefined) {
        updateData[column] = data[column as keyof MenuItemRow];
      }
    }
    const doc = await MenuItem.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return doc ? toMenuItemRow(doc) : null;
  }
};