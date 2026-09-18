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
// Memoized factory selectors — same id always returns the same selector reference,
// preventing unnecessary re-renders in memo'd components like FoodCard.
const _foodWishlistSelectors = new Map<string, (state: { wishlist: WishlistState }) => boolean>();
export const selectIsFoodWishlisted = (id: string) => {
  let sel = _foodWishlistSelectors.get(id);
  if (!sel) {
    sel = (state: { wishlist: WishlistState }) => state.wishlist.foodIds.includes(id);
    _foodWishlistSelectors.set(id, sel);
  }
  return sel;
};

const _restaurantWishlistSelectors = new Map<string, (state: { wishlist: WishlistState }) => boolean>();
export const selectIsRestaurantWishlisted = (id: string) => {
  let sel = _restaurantWishlistSelectors.get(id);
  if (!sel) {
    sel = (state: { wishlist: WishlistState }) => state.wishlist.restaurantIds.includes(id);
    _restaurantWishlistSelectors.set(id, sel);
  }
  return sel;
};

export default wishlistSlice.reducer;
