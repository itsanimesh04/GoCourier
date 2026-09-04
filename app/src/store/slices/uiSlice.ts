import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { saveJSON } from '../../lib/persist';

export type CatalogMode = 'food' | 'extras';
export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'gcs-ui';

interface PersistedUi {
  catalogMode?: CatalogMode;
  selectedCampusId?: string;
  theme?: ThemeMode;
}

interface UiState {
  hydrated: boolean;
  filterDrawerOpen: boolean;
  headerSearchOpen: boolean;
  catalogMode: CatalogMode;
  selectedCampusId: string;
  theme: ThemeMode;
}

const initialState: UiState = {
  hydrated: false,
  filterDrawerOpen: false,
  headerSearchOpen: false,
  catalogMode: 'food',
  selectedCampusId: '',
  theme: 'dark',
};

function persist(state: UiState) {
  saveJSON(STORAGE_KEY, {
    catalogMode: state.catalogMode,
    selectedCampusId: state.selectedCampusId,
    theme: state.theme,
  } satisfies PersistedUi);
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    hydrateUi(state, action: PayloadAction<PersistedUi>) {
      if (action.payload.catalogMode === 'extras' || action.payload.catalogMode === 'food') {
        state.catalogMode = action.payload.catalogMode;
      }
      if (action.payload.selectedCampusId) state.selectedCampusId = action.payload.selectedCampusId;
      if (action.payload.theme === 'light' || action.payload.theme === 'dark') {
        state.theme = action.payload.theme;
      }
      state.hydrated = true;
    },
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
      if (state.selectedCampusId === action.payload) return;
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
  hydrateUi,
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

export const selectFilterDrawerOpen = (state: { ui: UiState }) => state.ui.filterDrawerOpen;
export const selectHeaderSearchOpen = (state: { ui: UiState }) => state.ui.headerSearchOpen;
export const selectCatalogMode = (state: { ui: UiState }) => state.ui.catalogMode;
export const selectSelectedCampusId = (state: { ui: UiState }) => state.ui.selectedCampusId;
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectUiHydrated = (state: { ui: UiState }) => state.ui.hydrated;

export default uiSlice.reducer;
