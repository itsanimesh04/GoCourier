import { useMemo, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import FilterDrawer from '../components/FilterDrawer';
import {
  filterMenuItems,
  getMenuByRestaurant,
  groupByCategory,
} from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { openFilterDrawer } from '../store/slices/uiSlice';
import {
  selectIsRestaurantWishlisted,
  toggleRestaurantWishlist,
} from '../store/slices/wishlistSlice';
import { DEFAULT_FOOD_FILTERS, type FoodFilters } from '../utils/types';
import RestaurantHero from './components/Resturant/RestaurantHero';
import RestaurantMenu from './components/Resturant/RestaurantMenu';

const ResturantPage = () => {
  const { id = '' } = useParams();
  const restaurants = useAppSelector(selectRestaurants);
  const menuItems = useAppSelector(selectMenuItems);
  const restaurant = restaurants.find((r) => r.id === id);
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(id));
  const [filters, setFilters] = useState<FoodFilters>(DEFAULT_FOOD_FILTERS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allItems = useMemo(
    () => (restaurant ? getMenuByRestaurant(menuItems, restaurant.id) : []),
    [restaurant, menuItems]
  );

  const filtered = useMemo(
    () => filterMenuItems(allItems, filters),
    [allItems, filters]
  );

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
          Restaurant not found
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block font-sans text-sm font-semibold text-primary underline"
        >
          Browse food
        </Link>
      </div>
    );
  }

  return (
    <div>
      <RestaurantHero
        restaurant={restaurant}
        wishlisted={wishlisted}
        onToggleWishlist={() => dispatch(toggleRestaurantWishlist(restaurant.id))}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-sm uppercase tracking-wide text-muted">
            {filtered.length} items
          </p>
          <button
            type="button"
            onClick={() => dispatch(openFilterDrawer())}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-fg hover:border-primary hover:text-primary"
          >
            <FiSliders size={16} />
            Filter
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center font-sans text-sm font-semibold text-muted">
            No items match your filters
          </p>
        ) : (
          <RestaurantMenu
            grouped={grouped}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        )}
      </div>

      <FilterDrawer value={filters} onApply={setFilters} />
    </div>
  );
};

export default ResturantPage;
