import mongoose from 'mongoose';
import { Category } from '../../models/category.model';
import { ExtraProduct } from '../../models/extra-product.model';
import { MenuItem } from '../../models/menu-item.model';
import { Restaurant } from '../../models/restaurant.model';

export interface SearchRestaurantResult {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image_url: string | null;
  address: string;
  distance_km: number;
  eta_minutes: number;
  is_open: boolean;
}

export interface SearchDishResult {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  rating: number;
  is_veg: boolean | null;
  image_url: string | null;
}

export interface SearchCategoryResult {
  id: string;
  name: string;
  image_url: string | null;
}

export interface SearchExtraResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
}

export interface SearchResultsResponse {
  restaurants: SearchRestaurantResult[];
  dishes: SearchDishResult[];
  categories: SearchCategoryResult[];
  extras: SearchExtraResult[];
}

export const customerSearchService = {
  async search(query: string, mode?: 'food' | 'extras', campusId?: string): Promise<SearchResultsResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { restaurants: [], dishes: [], categories: [], extras: [] };
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');

    const campusFilter = campusId && mongoose.isValidObjectId(campusId)
      ? { campus_id: new mongoose.Types.ObjectId(campusId) }
      : {};

    const restaurantPromise = mode === 'extras'
      ? Promise.resolve([])
      : Restaurant.find({
          is_active: true,
          ...campusFilter,
          $or: [
            { name: { $regex: pattern } },
            { cuisine: { $regex: pattern } },
            { tags: { $in: [pattern] } }
          ]
        })
          .sort({ manual_priority: -1, rating: -1 })
          .limit(6)
          .exec();

    const categoryPromise = Category.find({
      is_active: true,
      name: { $regex: pattern }
    })
      .sort({ sort_order: 1 })
      .limit(6)
      .exec();

    const extrasPromise = ExtraProduct.find({
      is_active: true,
      ...campusFilter,
      $or: [
        { name: { $regex: pattern } },
        { category: { $regex: pattern } }
      ]
    })
      .sort({ sort_order: 1 })
      .limit(6)
      .exec();

    const dishPromise = mode === 'extras'
      ? Promise.resolve([])
      : MenuItem.find({
          is_available: true,
          $or: [
            { name: { $regex: pattern } },
            { description: { $regex: pattern } }
          ]
        })
          .sort({ rating: -1 })
          .limit(12)
          .exec();

    const [restaurantDocs, categoryDocs, extrasDocs, rawDishes] = await Promise.all([
      restaurantPromise,
      categoryPromise,
      extrasPromise,
      dishPromise
    ]);

    // For dishes, filter to ensure restaurant is active (and matches campus if provided)
    const restaurantIds = [
      ...new Set(rawDishes.map((d) => d.restaurant_id.toString()))
    ];
    const dishRestaurants = restaurantIds.length > 0
      ? await Restaurant.find({
          _id: { $in: restaurantIds },
          is_active: true,
          ...campusFilter
        }).select('_id name').exec()
      : [];

    const activeRestaurantMap = new Map(
      dishRestaurants.map((r) => [r._id.toString(), r.name])
    );

    const validDishes: SearchDishResult[] = [];
    for (const d of rawDishes) {
      const restName = activeRestaurantMap.get(d.restaurant_id.toString());
      if (restName) {
        validDishes.push({
          id: d._id.toString(),
          restaurant_id: d.restaurant_id.toString(),
          restaurant_name: restName,
          name: d.name,
          description: d.description || '',
          price: Number(d.price) || 0,
          original_price: d.original_price ? Number(d.original_price) : null,
          rating: d.rating || 0,
          is_veg: d.is_veg,
          image_url: d.image_url
        });
        if (validDishes.length >= 8) break;
      }
    }

    const mappedRestaurants: SearchRestaurantResult[] = restaurantDocs.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      cuisine: r.cuisine || '',
      rating: r.rating || 0,
      image_url: r.image_url,
      address: r.address || '',
      distance_km: r.distance_km || 0,
      eta_minutes: r.eta_minutes || 0,
      is_open: r.is_open
    }));

    const mappedCategories: SearchCategoryResult[] = categoryDocs.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      image_url: c.image_url
    }));

    const mappedExtras: SearchExtraResult[] = extrasDocs.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      category: e.category,
      price: Number(e.price) || 0,
      image_url: e.image_url
    }));

    return {
      restaurants: mappedRestaurants,
      dishes: validDishes,
      categories: mappedCategories,
      extras: mappedExtras
    };
  }
};
