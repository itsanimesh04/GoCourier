import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import catalogService from '../../services/catalog.service';
import type { AppConfig, Banner, Campus, ExtraProduct, FoodCategory, MenuItem, Restaurant } from '../../utils/types';

interface CatalogState {
  campuses: Campus[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  extras: ExtraProduct[];
  banners: Banner[];
  categories: FoodCategory[];
  config: AppConfig | null;
  status: 'idle' | 'loading' | 'ready';
}

const initialState: CatalogState = {
  campuses: [],
  restaurants: [],
  menuItems: [],
  extras: [],
  banners: [],
  categories: [],
  config: null,
  status: 'idle',
};

export const loadCatalog = createAsyncThunk(
  'catalog/load',
  async (campusId: string | undefined) => {
    const [campuses, banners, categories, config, restaurants] = await Promise.all([
      catalogService.campuses(),
      catalogService.banners(),
      catalogService.categories(),
      catalogService.config(),
      catalogService.restaurants(),
    ]);

    const selected = campusId && campuses.some((c) => c.id === campusId) ? campusId : campuses[0]?.id;
    const extras = selected ? await catalogService.extras(selected) : [];
    const menus = await Promise.all(
      restaurants.map((r) => catalogService.menu(r.id).catch(() => ({ items: [] as MenuItem[] })))
    );
    const menuItems = menus.flatMap((menu) => menu.items);

    return {
      campuses,
      banners,
      categories: categories.map((c) => ({ id: c.id, name: c.name, imageUrl: c.image_url ?? '' })),
      config,
      restaurants,
      extras,
      menuItems,
      selectedCampusId: selected ?? '',
    };
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { catalog: CatalogState };
      // Skip if already loading to prevent duplicate concurrent fetches
      if (state.catalog.status === 'loading') return false;
      return true;
    },
  }
);

function sameIdOrder<T extends { id: string }>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

/** Keep array/item refs stable when ids/order match; swap only changed items. */
function mergeByIdOrder<T extends { id: string }>(prev: T[], next: T[]): T[] {
  if (sameIdOrder(prev, next)) {
    let changed = false;
    const merged = prev.map((item, i) => {
      const candidate = next[i];
      if (item === candidate) return item;
      // Shallow field compare — new ref only when something actually changed
      const prevKeys = Object.keys(item) as (keyof T)[];
      const nextKeys = Object.keys(candidate) as (keyof T)[];
      if (prevKeys.length !== nextKeys.length) {
        changed = true;
        return candidate;
      }
      for (const key of prevKeys) {
        if (item[key] !== candidate[key]) {
          changed = true;
          return candidate;
        }
      }
      return item;
    });
    return changed ? merged : prev;
  }
  return next;
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCatalog.fulfilled, (state, action) => {
        state.status = 'ready';
        const {
          campuses,
          banners,
          categories,
          config,
          restaurants,
          extras,
          menuItems,
        } = action.payload;

        state.campuses = mergeByIdOrder(state.campuses, campuses);
        state.banners = mergeByIdOrder(state.banners, banners);
        state.categories = mergeByIdOrder(state.categories, categories);
        state.config = config;
        state.restaurants = mergeByIdOrder(state.restaurants, restaurants);
        state.extras = mergeByIdOrder(state.extras, extras);
        state.menuItems = mergeByIdOrder(state.menuItems, menuItems);
      })
      .addCase(loadCatalog.rejected, (state) => {
        state.status = 'ready';
      });
  },
});

export const selectCampuses = (state: { catalog: CatalogState }) => state.catalog.campuses;
export const selectRestaurants = (state: { catalog: CatalogState }) => state.catalog.restaurants;
export const selectMenuItems = (state: { catalog: CatalogState }) => state.catalog.menuItems;
export const selectExtras = (state: { catalog: CatalogState }) => state.catalog.extras;
export const selectBanners = (state: { catalog: CatalogState }) => state.catalog.banners;
export const selectFoodCategories = (state: { catalog: CatalogState }) => state.catalog.categories;
export const selectAppConfig = (state: { catalog: CatalogState }) => state.catalog.config;
export const selectCatalogStatus = (state: { catalog: CatalogState }) => state.catalog.status;

// Memoized factory selector — same restaurantId returns the same selector reference.
const _restaurantByIdSelectors = new Map<string, (state: { catalog: CatalogState }) => Restaurant | undefined>();
export const selectRestaurantById = (id: string) => {
  let sel = _restaurantByIdSelectors.get(id);
  if (!sel) {
    sel = (state: { catalog: CatalogState }) => state.catalog.restaurants.find((r) => r.id === id);
    _restaurantByIdSelectors.set(id, sel);
  }
  return sel;
};

export default catalogSlice.reducer;

