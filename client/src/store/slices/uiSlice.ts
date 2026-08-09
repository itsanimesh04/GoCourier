import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  filterDrawerOpen: boolean;
  headerSearchOpen: boolean;
}

const initialState: UiState = {
  filterDrawerOpen: false,
  headerSearchOpen: false,
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
  },
});

export const {
  openFilterDrawer,
  closeFilterDrawer,
  setFilterDrawerOpen,
  setHeaderSearchOpen,
  toggleHeaderSearch,
} = uiSlice.actions;

export const selectFilterDrawerOpen = (state: { ui: UiState }) => state.ui.filterDrawerOpen;
export const selectHeaderSearchOpen = (state: { ui: UiState }) => state.ui.headerSearchOpen;

export default uiSlice.reducer;
