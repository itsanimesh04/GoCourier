import { useMemo, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import FilterDrawer from '../components/FilterDrawer';
import {
  filterMenuItems,
  getMenuByRestaurant,
  getRestaurantById,
  groupByCategory,
} from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
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
  const restaurant = getRestaurantById(id);
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(id));
  const [filters, setFilters] = useState<FoodFilters>(DEFAULT_FOOD_FILTERS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allItems = useMemo(
    () => (restaurant ? getMenuByRestaurant(restaurant.id) : []),
    [restaurant]
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
        <h1 className="font-bebas text-4xl text-tertiary">Restaurant not found</h1>
        <Link to="/food" className="mt-4 inline-block font-bebas text-xl text-primary underline">
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
          <p className="font-bebas text-xl uppercase tracking-wide text-gray-600">
            {filtered.length} items
          </p>
          <button
            type="button"
            onClick={() => dispatch(openFilterDrawer())}
            className="inline-flex items-center gap-2 border border-tertiary px-4 py-2 font-bebas text-lg uppercase tracking-wide text-tertiary hover:border-primary hover:text-primary"
          >
            <FiSliders size={16} />
            Filter
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center font-bebas text-2xl text-gray-500">
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
