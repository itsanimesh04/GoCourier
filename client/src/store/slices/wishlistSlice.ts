import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const WISHLIST_KEY = 'gcs-wishlist';

interface WishlistState {
  foodIds: string[];
  restaurantIds: string[];
}

function loadWishlist(): WishlistState {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw) return JSON.parse(raw) as WishlistState;
  } catch {
    /* ignore */
  }
  return { foodIds: [], restaurantIds: [] };
}

function persist(state: WishlistState) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(state));
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: loadWishlist(),
  reducers: {
    toggleFoodWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.foodIds.includes(id)) {
        state.foodIds = state.foodIds.filter((x) => x !== id);
      } else {
        state.foodIds.push(id);
      }
      persist(state);
    },
    toggleRestaurantWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.restaurantIds.includes(id)) {
        state.restaurantIds = state.restaurantIds.filter((x) => x !== id);
      } else {
        state.restaurantIds.push(id);
      }
      persist(state);
    },
  },
});

export const { toggleFoodWishlist, toggleRestaurantWishlist } = wishlistSlice.actions;

export const selectFoodWishlist = (state: { wishlist: WishlistState }) => state.wishlist.foodIds;
export const selectRestaurantWishlist = (state: { wishlist: WishlistState }) =>
  state.wishlist.restaurantIds;
export const selectIsFoodWishlisted = (id: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.foodIds.includes(id);
export const selectIsRestaurantWishlisted =
  (id: string) => (state: { wishlist: WishlistState }) =>
    state.wishlist.restaurantIds.includes(id);

export default wishlistSlice.reducer;
