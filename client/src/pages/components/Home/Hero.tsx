import { useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch, BiStar, BiX } from 'react-icons/bi';
import { FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CampusBatchCard from '../../../components/CampusBatchCard';
import CatalogModeTabs from '../../../components/CatalogModeTabs';
import HeroBannerRotator from '../../../components/HeroBannerRotator';
import SearchDropdown, { flattenSearchResults, type FlattenedSearchItem } from '../../../components/SearchDropdown';
import catalogService from '../../../services/catalog.service';
import { useAppSelector } from '../../../store';
import {
  selectExtras,
  selectFoodCategories,
  selectMenuItems,
  selectRestaurants,
} from '../../../store/slices/catalogSlice';
import { selectCatalogMode } from '../../../store/slices/uiSlice';
import type { SearchResults } from '../../../utils/types';

const extrasCategoryMeta: Record<string, string> = {
  Stationery:
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80',
  Snacks:
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  Drinks:
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
  'Personal Care':
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
  Accessories:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

const emptyResults: SearchResults = {
  restaurants: [],
  dishes: [],
  categories: [],
  extras: [],
};

const Hero = () => {
  const navigate = useNavigate();
  const catalogMode = useAppSelector(selectCatalogMode);
  const isExtras = catalogMode === 'extras';

  // State
  const [activeTab, setActiveTab] = useState<'restaurants' | 'categories'>('restaurants');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>(emptyResults);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Redux data
  const apiCategories = useAppSelector(selectFoodCategories);
  const restaurants = useAppSelector(selectRestaurants);
  const menuItems = useAppSelector(selectMenuItems);
  const extras = useAppSelector(selectExtras);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debouncing query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Query server (with fallback to client memory) when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(emptyResults);
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    catalogService
      .search(debouncedQuery, isExtras ? 'extras' : 'food')
      .then((results) => {
        if (isSubscribed) {
          setSearchResults(results);
          setIsDropdownOpen(true);
          setActiveIndex(-1);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isSubscribed) return;
        // Fallback to local store data
        const q = debouncedQuery.toLowerCase();
        const matchedRestaurants = isExtras
          ? []
          : restaurants
              .filter(
                (r) =>
                  r.name.toLowerCase().includes(q) ||
                  r.cuisine.toLowerCase().includes(q) ||
                  r.address.toLowerCase().includes(q)
              )
              .slice(0, 5)
              .map((r) => ({
                id: r.id,
                name: r.name,
                cuisine: r.cuisine,
                rating: r.rating,
                imageUrl: r.imageUrl,
                address: r.address,
                distanceKm: r.distanceKm,
                etaMinutes: r.etaMinutes,
                isOpen: r.isOpen,
              }));

        const matchedDishes = isExtras
          ? []
          : menuItems
              .filter(
                (m) =>
                  m.name.toLowerCase().includes(q) ||
                  m.description.toLowerCase().includes(q)
              )
              .slice(0, 6)
              .map((m) => {
                const rest = restaurants.find((r) => r.id === m.restaurantId);
                return {
                  id: m.id,
                  restaurantId: m.restaurantId,
                  restaurantName: rest?.name || 'Partner Kitchen',
                  name: m.name,
                  description: m.description,
                  price: m.price,
                  originalPrice: m.originalPrice ?? null,
                  rating: m.rating,
                  isVeg: m.isVeg,
                  imageUrl: m.imageUrl,
                };
              });

        const matchedCategories = (isExtras ? extrasCats : apiCategories.map((c) => c.name))
          .filter((name) => name.toLowerCase().includes(q))
          .slice(0, 4)
          .map((name) => {
            const cat = apiCategories.find((c) => c.name.toLowerCase() === name.toLowerCase());
            return {
              id: cat?.id || name,
              name,
              imageUrl: cat?.imageUrl || extrasCategoryMeta[name] || null,
            };
          });

        const matchedExtras = isExtras
          ? extras
              .filter(
                (e) =>
                  e.name.toLowerCase().includes(q) ||
                  e.category.toLowerCase().includes(q)
              )
              .slice(0, 6)
              .map((e) => ({
                id: e.id,
                name: e.name,
                category: e.category,
                price: e.price,
                imageUrl: e.imageUrl,
              }))
          : [];

        setSearchResults({
          restaurants: matchedRestaurants,
          dishes: matchedDishes,
          categories: matchedCategories,
          extras: matchedExtras,
        });
        setIsDropdownOpen(true);
        setActiveIndex(-1);
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedQuery, isExtras, restaurants, menuItems, apiCategories, extras]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const extrasCats = useMemo(
    () => [...new Set(extras.map((item) => item.category).filter(Boolean))],
    [extras]
  );

  const categories = isExtras
    ? extrasCats.map((name) => ({
        id: name,
        name,
        imageUrl:
          extras.find((item) => item.category === name)?.imageUrl ||
          extrasCategoryMeta[name] ||
          extrasCategoryMeta.Stationery,
      }))
    : apiCategories;

  const flatItems = useMemo(
    () => flattenSearchResults(searchResults, query, isExtras),
    [searchResults, query, isExtras]
  );

  const handleSelectItem = (item: FlattenedSearchItem) => {
    setIsDropdownOpen(false);
    switch (item.type) {
      case 'restaurant':
        navigate(`/food/restaurants/${item.data.id}`);
        break;
      case 'dish':
        navigate(`/food/foods/${item.data.id}`);
        break;
      case 'category':
        navigate(
          isExtras
            ? `/extras?category=${encodeURIComponent(item.data.name)}`
            : `/food?q=${encodeURIComponent(item.data.name)}`
        );
        break;
      case 'extra':
        navigate(`/extras?q=${encodeURIComponent(item.data.name)}`);
        break;
      case 'view_all': {
        const base = isExtras ? '/extras' : '/food';
        navigate(`${base}?q=${encodeURIComponent(item.query)}`);
        break;
      }
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    if (activeIndex >= 0 && activeIndex < flatItems.length) {
      handleSelectItem(flatItems[activeIndex]);
      return;
    }
    const q = query.trim();
    const base = isExtras ? '/extras' : '/food';
    navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const featuredRestaurants = useMemo(() => restaurants.slice(0, 4), [restaurants]);

  return (
    <section id="home-hero" className="w-full py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex justify-center sm:mb-6">
          <CatalogModeTabs />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-stretch lg:text-left">
            <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-tight text-fg sm:text-2xl">
              {isExtras ? 'Search extras' : 'Search your food'}
            </h2>

            {/* Search Bar Form with live dropdown */}
            <div ref={searchContainerRef} className="relative mb-4 w-full max-w-md sm:mb-5 lg:max-w-lg">
              <form onSubmit={submit} className="relative w-full">
                {loading ? (
                  <FiLoader
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary"
                    size={18}
                  />
                ) : (
                  <BiSearch
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    size={18}
                  />
                )}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (query.trim().length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isExtras
                      ? 'Search stationery, snacks…'
                      : 'Search restaurants, dishes…'
                  }
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-24 font-sans text-sm text-fg placeholder:text-muted transition-colors focus:border-primary focus:outline-none sm:pr-32"
                  aria-label={isExtras ? 'Search extras' : 'Search food'}
                  aria-autocomplete="list"
                  aria-expanded={isDropdownOpen}
                />

                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchResults(emptyResults);
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-18 top-1/2 -translate-y-1/2 text-muted hover:text-fg sm:right-22"
                    aria-label="Clear search"
                  >
                    <BiX size={20} />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90 sm:px-4"
                >
                  Search
                </button>
              </form>

              {/* Autocomplete suggestions dropdown */}
              <SearchDropdown
                results={searchResults}
                query={debouncedQuery || query}
                loading={loading}
                isOpen={isDropdownOpen}
                activeIndex={activeIndex}
                onSelectItem={handleSelectItem}
                isExtras={isExtras}
              />
            </div>

            {/* 2 Tabs: Restaurants & Categories directly below search bar */}
            <div className="mb-4 flex items-center justify-center lg:justify-start">
              <div
                role="tablist"
                aria-label="Home content tabs"
                className="inline-flex rounded-xl border border-border bg-surface-2 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-restaurants"
                  aria-selected={activeTab === 'restaurants'}
                  aria-controls="panel-restaurants"
                  onClick={() => setActiveTab('restaurants')}
                  className={`rounded-lg px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeTab === 'restaurants'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  Restaurants
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-categories"
                  aria-selected={activeTab === 'categories'}
                  aria-controls="panel-categories"
                  onClick={() => setActiveTab('categories')}
                  className={`rounded-lg px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeTab === 'categories'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>

            {/* Tab 1: Restaurants Panel */}
            {activeTab === 'restaurants' && (
              <div id="panel-restaurants" role="tabpanel" aria-labelledby="tab-restaurants" className="w-full">
                {featuredRestaurants.length === 0 ? (
                  <p className="py-6 font-sans text-xs text-muted">
                    No restaurants available yet. Check back soon!
                  </p>
                ) : (
                  <>
                    <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                      {featuredRestaurants.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => navigate(`/food/restaurants/${r.id}`)}
                          className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-all duration-200 hover:border-primary hover:shadow-md"
                        >
                          <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-2">
                            <img
                              src={r.imageUrl}
                              alt={r.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            <span
                              className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase tracking-wider ${
                                r.isOpen ? 'bg-fg text-bg' : 'bg-surface-2 text-muted'
                              }`}
                            >
                              {r.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-2">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="truncate font-display text-[11px] font-bold uppercase text-fg sm:text-xs">
                                {r.name}
                              </h3>
                              {r.rating > 0 && (
                                <span className="flex shrink-0 items-center gap-0.5 font-sans text-[10px] font-semibold text-amber-500">
                                  <BiStar size={10} className="fill-amber-500" />
                                  {r.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate font-sans text-[10px] text-muted">
                              {r.cuisine || 'Partner Kitchen'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-2.5 flex justify-center lg:justify-start">
                      <button
                        type="button"
                        onClick={() => navigate('/food')}
                        className="inline-flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary transition-opacity hover:opacity-80"
                      >
                        View all {restaurants.length} restaurants →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 2: Categories Panel */}
            {activeTab === 'categories' && (
              <div id="panel-categories" role="tabpanel" aria-labelledby="tab-categories" className="w-full">
                <div className="grid w-full grid-cols-4 gap-2 sm:gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          isExtras
                            ? `/extras?category=${encodeURIComponent(cat.name)}`
                            : `/food?q=${encodeURIComponent(cat.name)}`
                        )
                      }
                      className="group flex w-full flex-col items-center gap-1.5 text-center transition-opacity hover:opacity-80"
                    >
                      <div className="relative aspect-square w-full max-w-22 overflow-hidden rounded-xl border border-border bg-surface-2 transition-transform duration-200 group-hover:scale-105 sm:max-w-none">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="w-full shrink-0 font-display text-[10px] font-semibold uppercase leading-tight tracking-tight text-fg sm:text-xs">
                        {cat.name}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-col gap-3 lg:mx-0 lg:max-w-none">
            <CampusBatchCard />
            <HeroBannerRotator />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
