import mongoose from 'mongoose';
import { Category } from '../../models/category.model';
import { FoodAddon } from '../../models/food-addon.model';
import { MenuItem } from '../../models/menu-item.model';
import { OptionSet } from '../../models/option-set.model';
import { Restaurant } from '../../models/restaurant.model';
import { NotFoundError } from '../../utils/errors';
import {
  flattenAddonsFromGroups,
  hydrateAddonGroups
} from '../admin/addon-group.service';

function mapRestaurant(doc: InstanceType<typeof Restaurant>) {
  return {
    id: doc._id.toString(),
    campus_id: doc.campus_id?.toString() ?? null,
    name: doc.name,
    cuisine: doc.cuisine,
    rating: doc.rating,
    address: doc.address,
    distance_km: doc.distance_km,
    eta_minutes: doc.eta_minutes,
    tags: doc.tags,
    image_url: doc.image_url,
    open_time: doc.open_time,
    close_time: doc.close_time,
    is_open: doc.is_open,
    is_active: doc.is_active,
    is_promoted: doc.manual_priority > 0
  };
}

export const customerRestaurantService = {
  async list(query?: string) {
    const trimmed = query?.trim();
    const filter: Record<string, unknown> = { is_active: true };

    if (trimmed) {
      const pattern = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingItemRestaurantIds = await MenuItem.find({
        name: { $regex: pattern, $options: 'i' }
      }).distinct('restaurant_id');

      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { cuisine: { $regex: pattern, $options: 'i' } },
        { _id: { $in: matchingItemRestaurantIds } }
      ];
    }

    const restaurants = await Restaurant.find(filter).sort({ manual_priority: -1, name: 1 }).exec();
    return restaurants.map(mapRestaurant);
  },

  async getById(id: string) {
    const restaurant = await Restaurant.findOne({ _id: id, is_active: true }).exec();
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }
    return mapRestaurant(restaurant);
  },

  async getMenu(restaurantId: string) {
    const restaurant = await Restaurant.findOne({ _id: restaurantId, is_active: true }).exec();

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    const items = await MenuItem.find({ restaurant_id: restaurantId, is_available: true })
      .sort({ sort_order: 1, name: 1 })
      .exec();

    const categoryIds = [
      ...new Set(items.map((item) => item.category_id?.toString()).filter(Boolean))
    ] as string[];

    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }).exec()
      : [];
    const categoryMap = new Map(categories.map((category) => [category._id.toString(), category.name]));

    const allGroupIds = [
      ...new Set(
        items.flatMap((item) =>
          ((item.addon_group_ids ?? []) as mongoose.Types.ObjectId[]).map((id) => id.toString())
        )
      )
    ];
    const hydratedGroups = await hydrateAddonGroups(allGroupIds, true);
    const groupById = new Map(hydratedGroups.map((g) => [g.id, g]));

    const legacyAddonIds = [
      ...new Set(
        items
          .filter((item) => !(item.addon_group_ids ?? []).length)
          .flatMap((item) =>
            ((item.addon_ids ?? []) as mongoose.Types.ObjectId[]).map((id) => id.toString())
          )
      )
    ];
    const legacyDocs = legacyAddonIds.length
      ? await FoodAddon.find({ _id: { $in: legacyAddonIds }, is_active: true }).exec()
      : [];
    const legacyMap = new Map(
      legacyDocs.map((addon) => [
        addon._id.toString(),
        {
          id: addon._id.toString(),
          name: addon.name,
          price: Number(addon.price),
          is_veg: addon.is_veg,
          image_url: addon.image_url
        }
      ])
    );

    const optionSetIds = [
      ...new Set(
        items
          .map((item) => item.option_set_id?.toString())
          .filter((id): id is string => Boolean(id))
      )
    ];
    const optionSets = optionSetIds.length
      ? await OptionSet.find({ _id: { $in: optionSetIds }, is_active: true }).exec()
      : [];
    const optionSetById = new Map(optionSets.map((set) => [set._id.toString(), set]));

    const mappedItems = items.map((item) => {
      const groupIds = ((item.addon_group_ids ?? []) as mongoose.Types.ObjectId[]).map((id) =>
        id.toString()
      );
      let addon_groups: Awaited<ReturnType<typeof hydrateAddonGroups>> = [];
      let addons: ReturnType<typeof flattenAddonsFromGroups> = [];

      if (groupIds.length > 0) {
        addon_groups = groupIds
          .map((id) => groupById.get(id))
          .filter((g): g is NonNullable<typeof g> => Boolean(g));
        addons = flattenAddonsFromGroups(addon_groups);
      } else {
        const ids = ((item.addon_ids ?? []) as mongoose.Types.ObjectId[]).map((id) =>
          id.toString()
        );
        addons = ids
          .map((id) => legacyMap.get(id))
          .filter((a): a is NonNullable<typeof a> => Boolean(a));
        if (addons.length > 0) {
          addon_groups = [
            {
              id: 'legacy',
              name: 'Add-ons',
              is_active: true,
              sort_order: 0,
              created_at: new Date(),
              updated_at: new Date(),
              subgroups: [
                {
                  id: 'legacy-sub',
                  group_id: 'legacy',
                  name: '',
                  sort_order: 0,
                  addons: addons.map((a) => ({
                    id: a.id,
                    subgroup_id: 'legacy-sub',
                    name: a.name,
                    price: String(a.price),
                    is_veg: a.is_veg,
                    image_url: a.image_url,
                    image_key: null,
                    sort_order: 0,
                    is_active: true
                  }))
                }
              ]
            }
          ];
        }
      }

      const optionSetId = item.option_set_id?.toString() ?? null;
      const optionSet = optionSetId ? optionSetById.get(optionSetId) : null;
      const priceByChoice = new Map(
        (item.option_prices ?? []).map((entry: { choice_id: { toString(): string }; price: string }) => [
          entry.choice_id.toString(),
          entry.price
        ])
      );
      const option_set =
        optionSet && optionSet.choices.length > 0
          ? {
              id: optionSet._id.toString(),
              name: optionSet.name,
              choices: [...optionSet.choices]
                .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
                .map((choice) => {
                  const price = priceByChoice.get(choice._id.toString());
                  if (!price) return null;
                  return {
                    id: choice._id.toString(),
                    name: choice.name,
                    price: Number(price)
                  };
                })
                .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
            }
          : null;

      const displayPrice =
        option_set && option_set.choices.length > 0
          ? Math.min(...option_set.choices.map((choice) => choice.price))
          : Number(item.price);

      return {
        id: item._id.toString(),
        restaurant_id: item.restaurant_id.toString(),
        category_id: item.category_id?.toString() ?? null,
        category: item.category_id ? categoryMap.get(item.category_id.toString()) ?? null : null,
        name: item.name,
        description: item.description,
        price: displayPrice,
        original_price: item.original_price ? Number(item.original_price) : null,
        rating: item.rating,
        is_veg: item.is_veg,
        image_url: item.image_url,
        is_available: item.is_available,
        addon_groups,
        addons,
        option_set: option_set && option_set.choices.length > 0 ? option_set : null
      };
    });

    return {
      restaurant: mapRestaurant(restaurant),
      items: mappedItems
    };
  },

  async getMenuItem(id: string) {
    const item = await MenuItem.findById(id).exec();
    if (!item || !item.is_available) {
      throw new NotFoundError('Menu item not found');
    }

    const menu = await this.getMenu(item.restaurant_id.toString());
    const found = menu.items.find((entry) => entry.id === id);
    if (!found) {
      throw new NotFoundError('Menu item not found');
    }

    return { restaurant: menu.restaurant, item: found };
  }
};
