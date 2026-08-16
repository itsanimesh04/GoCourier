import { useEffect, useMemo, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import FilterDrawer from '../components/FilterDrawer';
import FoodCard from '../components/FoodCard';
import ResturantCard from '../components/ResturantCard';
import { filterMenuItems, filterRestaurants } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { openFilterDrawer, setCatalogMode } from '../store/slices/uiSlice';
import { DEFAULT_FOOD_FILTERS, type FoodFilters } from '../utils/types';

function filtersFromParams(params: URLSearchParams): FoodFilters {
  const diet = params.get('diet');
  const priceTo = params.get('priceTo');
  return {
    ...DEFAULT_FOOD_FILTERS,
    query: params.get('q') ?? '',
    cuisine: params.get('cuisine'),
    diet: diet === 'veg' || diet === 'non_veg' ? diet : 'all',
    priceTo: priceTo ? Number(priceTo) : DEFAULT_FOOD_FILTERS.priceTo,
  };
}

const FoodListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const [filters, setFilters] = useState<FoodFilters>(() =>
    filtersFromParams(searchParams)
  );

  useEffect(() => {
    dispatch(setCatalogMode('food'));
  }, [dispatch]);

  const urlKey = searchParams.toString();
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [urlKey, searchParams]);

  const foods = useMemo(() => filterMenuItems(menuItems, filters), [filters, menuItems]);
  const restoList = useMemo(
    () => filterRestaurants(restaurants, filters),
    [filters, restaurants]
  );

  const applyFilters = (next: FoodFilters) => {
    setFilters(next);
    const params = new URLSearchParams();
    if (next.query) params.set('q', next.query);
    if (next.cuisine) params.set('cuisine', next.cuisine);
    if (next.diet !== 'all') params.set('diet', next.diet);
    if (next.priceTo !== DEFAULT_FOOD_FILTERS.priceTo) {
      params.set('priceTo', String(next.priceTo));
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
            All Food
          </h1>
          <p className="mt-1 font-sans text-sm text-muted">
            {filters.query
              ? `Results for “${filters.query}”`
              : filters.cuisine
                ? filters.cuisine
                : 'Browse campus favourites'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(openFilterDrawer())}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-fg hover:border-primary hover:text-primary"
        >
          <FiSliders size={16} />
          Filter
        </button>
      </div>

      {restoList.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase text-fg sm:text-xl">Restaurants</h2>
            <Link to="/food" className="font-sans text-sm uppercase text-primary">
              {restoList.length} nearby
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {restoList.slice(0, 4).map((r) => (
              <ResturantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold uppercase text-fg sm:text-xl">
          Dishes · {foods.length}
        </h2>
        {foods.length === 0 ? (
          <p className="py-16 text-center font-sans text-sm font-semibold text-muted">
            No dishes match your filters
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {foods.map((item) => (
              <FoodCard key={item.id} menuItem={item} />
            ))}
          </div>
        )}
      </section>

      <FilterDrawer value={filters} onApply={applyFilters} showRating />
    </div>
  );
};

export default FoodListingPage;
