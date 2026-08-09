import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { campuses } from '../../data/mockData';

export type CatalogMode = 'food' | 'extras';
export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'gcs-ui';

interface PersistedUi {
  catalogMode?: CatalogMode;
  selectedCampusId?: string;
  theme?: ThemeMode;
}

function loadPersisted(): PersistedUi {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedUi;
  } catch {
    return {};
  }
}

function persist(state: UiState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        catalogMode: state.catalogMode,
        selectedCampusId: state.selectedCampusId,
        theme: state.theme,
      })
    );
  } catch {
    /* ignore */
  }
}

const persisted = typeof window !== 'undefined' ? loadPersisted() : {};

interface UiState {
  filterDrawerOpen: boolean;
  headerSearchOpen: boolean;
  catalogMode: CatalogMode;
  selectedCampusId: string;
  theme: ThemeMode;
}

const initialState: UiState = {
  filterDrawerOpen: false,
  headerSearchOpen: false,
  catalogMode: persisted.catalogMode === 'extras' ? 'extras' : 'food',
  selectedCampusId:
    persisted.selectedCampusId &&
    campuses.some((c) => c.id === persisted.selectedCampusId)
      ? persisted.selectedCampusId
      : campuses[0]?.id ?? 'campus-nims',
  theme: persisted.theme === 'light' ? 'light' : 'dark',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openFilterDrawer(state) {
      state.filterDrawerOpen = true;
    },
    closeFilterDrawer(state) {
      state.filterDrawerOpen = false;
    },
    setFilterDrawerOpen(state, action: PayloadAction<boolean>) {
      state.filterDrawerOpen = action.payload;
    },
    setHeaderSearchOpen(state, action: PayloadAction<boolean>) {
      state.headerSearchOpen = action.payload;
    },
    toggleHeaderSearch(state) {
      state.headerSearchOpen = !state.headerSearchOpen;
    },
    setCatalogMode(state, action: PayloadAction<CatalogMode>) {
      state.catalogMode = action.payload;
      persist(state);
    },
    setSelectedCampusId(state, action: PayloadAction<string>) {
      state.selectedCampusId = action.payload;
      persist(state);
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      persist(state);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      persist(state);
    },
  },
});

export const {
  openFilterDrawer,
  closeFilterDrawer,
  setFilterDrawerOpen,
  setHeaderSearchOpen,
  toggleHeaderSearch,
  setCatalogMode,
  setSelectedCampusId,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

export const selectFilterDrawerOpen = (state: { ui: UiState }) =>
  state.ui.filterDrawerOpen;
export const selectHeaderSearchOpen = (state: { ui: UiState }) =>
  state.ui.headerSearchOpen;
export const selectCatalogMode = (state: { ui: UiState }) =>
  state.ui.catalogMode;
export const selectSelectedCampusId = (state: { ui: UiState }) =>
  state.ui.selectedCampusId;
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;

export default uiSlice.reducer;
