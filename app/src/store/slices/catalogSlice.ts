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

export const loadCatalog = createAsyncThunk('catalog/load', async (campusId: string | undefined) => {
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
});

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
        state.campuses = action.payload.campuses;
        state.banners = action.payload.banners;
        state.categories = action.payload.categories;
        state.config = action.payload.config;
        state.restaurants = action.payload.restaurants;
        state.extras = action.payload.extras;
        state.menuItems = action.payload.menuItems;
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

export default catalogSlice.reducer;
