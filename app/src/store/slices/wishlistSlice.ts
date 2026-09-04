import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { saveJSON } from '../../lib/persist';

const WISHLIST_KEY = 'gcs-wishlist';

interface WishlistState {
  foodIds: string[];
  restaurantIds: string[];
}

const initialState: WishlistState = { foodIds: [], restaurantIds: [] };

function persist(state: WishlistState) {
  saveJSON(WISHLIST_KEY, state);
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist(_state, action: PayloadAction<WishlistState>) {
      return {
        foodIds: action.payload.foodIds ?? [],
        restaurantIds: action.payload.restaurantIds ?? [],
      };
    },
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

export const { hydrateWishlist, toggleFoodWishlist, toggleRestaurantWishlist } = wishlistSlice.actions;

export const selectFoodWishlist = (state: { wishlist: WishlistState }) => state.wishlist.foodIds;
export const selectRestaurantWishlist = (state: { wishlist: WishlistState }) =>
  state.wishlist.restaurantIds;
export const selectIsFoodWishlisted = (id: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.foodIds.includes(id);
export const selectIsRestaurantWishlisted = (id: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.restaurantIds.includes(id);

export default wishlistSlice.reducer;
