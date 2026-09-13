import { BiSearch, BiStar, BiStore } from 'react-icons/bi';
import { FiChevronRight, FiLoader } from 'react-icons/fi';
import type { SearchCategoryItem, SearchDishItem, SearchExtraItem, SearchRestaurantItem, SearchResults } from '../utils/types';

export type FlattenedSearchItem =
  | { type: 'restaurant'; data: SearchRestaurantItem }
  | { type: 'dish'; data: SearchDishItem }
  | { type: 'category'; data: SearchCategoryItem }
  | { type: 'extra'; data: SearchExtraItem }
  | { type: 'view_all'; query: string };

interface SearchDropdownProps {
  results: SearchResults;
  query: string;
  loading: boolean;
  isOpen: boolean;
  activeIndex: number;
  onSelectItem: (item: FlattenedSearchItem) => void;
  isExtras?: boolean;
}

export function flattenSearchResults(
  results: SearchResults,
  query: string,
  isExtras?: boolean
): FlattenedSearchItem[] {
  const items: FlattenedSearchItem[] = [];

  if (isExtras) {
    results.extras.forEach((extra) => items.push({ type: 'extra', data: extra }));
    results.categories.forEach((cat) => items.push({ type: 'category', data: cat }));
  } else {
    results.restaurants.forEach((r) => items.push({ type: 'restaurant', data: r }));
    results.dishes.forEach((d) => items.push({ type: 'dish', data: d }));
    results.categories.forEach((c) => items.push({ type: 'category', data: c }));
  }

  if (query.trim().length > 0) {
    items.push({ type: 'view_all', query: query.trim() });
  }

  return items;
}

const SearchDropdown = ({
  results,
  query,
  loading,
  isOpen,
  activeIndex,
  onSelectItem,
  isExtras = false,
}: SearchDropdownProps) => {
  if (!isOpen || !query.trim()) return null;

  const totalResults =
    results.restaurants.length +
    results.dishes.length +
    results.categories.length +
    results.extras.length;

  const flatItems = flattenSearchResults(results, query, isExtras);

  return (
    <div
      role="listbox"
      id="search-dropdown-results"
      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 backdrop-blur-md transition-all"
    >
      {loading && (
        <div className="flex items-center justify-center gap-2 border-b border-border/40 py-2.5 font-sans text-xs text-muted">
          <FiLoader className="animate-spin text-primary" size={14} />
          <span>Searching campus kitchens & menus…</span>
        </div>
      )}

      {!loading && totalResults === 0 && (
        <div className="p-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
            <BiSearch size={20} />
          </div>
          <p className="font-display text-sm font-semibold uppercase text-fg">
            No matches found for “{query}”
          </p>
          <p className="mt-1 font-sans text-xs text-muted">
            Try checking for typos or searching with dish names like Pizza, Biryani, Chai, or Cafe.
          </p>
        </div>
      )}

      {/* Restaurants Section */}
      {!isExtras && results.restaurants.length > 0 && (
        <div className="border-b border-border/40 p-2 sm:p-2.5">
          <div className="px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-muted">
            Restaurants ({results.restaurants.length})
          </div>
          <div className="space-y-1">
            {results.restaurants.map((r) => {
              const itemIdx = flatItems.findIndex((fi) => fi.type === 'restaurant' && fi.data.id === r.id);
              const isSelected = activeIndex === itemIdx;
              return (
                <button
                  key={`resto-${r.id}`}
                  type="button"
                  onClick={() => onSelectItem({ type: 'restaurant', data: r })}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-surface-2'
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:h-11 sm:w-11">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <BiStore size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-display text-xs font-semibold uppercase text-fg sm:text-sm">
                        {r.name}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.2 font-sans text-[9px] font-bold uppercase ${
                          r.isOpen ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-surface-2 text-muted'
                        }`}
                      >
                        {r.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-sans text-[11px] text-muted">
                      <span className="truncate">{r.cuisine || 'Fast Food'}</span>
                      {r.rating > 0 && (
                        <span className="flex shrink-0 items-center gap-0.5 text-amber-500 font-semibold">
                          <BiStar size={11} className="fill-amber-500" />
                          {r.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <FiChevronRight className="shrink-0 text-muted" size={16} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dishes Section */}
      {!isExtras && results.dishes.length > 0 && (
        <div className="border-b border-border/40 p-2 sm:p-2.5">
          <div className="px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-muted">
            Dishes ({results.dishes.length})
          </div>
          <div className="space-y-1">
            {results.dishes.map((dish) => {
              const itemIdx = flatItems.findIndex((fi) => fi.type === 'dish' && fi.data.id === dish.id);
              const isSelected = activeIndex === itemIdx;
              return (
                <button
                  key={`dish-${dish.id}`}
                  type="button"
                  onClick={() => onSelectItem({ type: 'dish', data: dish })}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-surface-2'
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:h-11 sm:w-11">
                    {dish.imageUrl ? (
                      <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted">
                        🍲
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {dish.isVeg != null && (
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                            dish.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 ring-2 ring-red-500/20'
                          }`}
                          title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                      )}
                      <span className="truncate font-display text-xs font-semibold text-fg sm:text-sm">
                        {dish.name}
                      </span>
                    </div>
                    <div className="truncate font-sans text-[11px] text-muted">
                      From {dish.restaurantName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xs font-bold text-fg sm:text-sm">
                      ₹{dish.price}
                    </div>
                    {dish.originalPrice && dish.originalPrice > dish.price && (
                      <div className="font-sans text-[10px] text-muted line-through">
                        ₹{dish.originalPrice}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Extras Products Section */}
      {isExtras && results.extras.length > 0 && (
        <div className="border-b border-border/40 p-2 sm:p-2.5">
          <div className="px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-muted">
            Extras ({results.extras.length})
          </div>
          <div className="space-y-1">
            {results.extras.map((extra) => {
              const itemIdx = flatItems.findIndex((fi) => fi.type === 'extra' && fi.data.id === extra.id);
              const isSelected = activeIndex === itemIdx;
              return (
                <button
                  key={`extra-${extra.id}`}
                  type="button"
                  onClick={() => onSelectItem({ type: 'extra', data: extra })}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-surface-2'
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:h-11 sm:w-11">
                    {extra.imageUrl ? (
                      <img src={extra.imageUrl} alt={extra.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-xs font-semibold text-fg sm:text-sm">
                      {extra.name}
                    </div>
                    <div className="font-sans text-[11px] text-muted">
                      {extra.category}
                    </div>
                  </div>
                  <div className="font-display text-xs font-bold text-fg sm:text-sm">
                    ₹{extra.price}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Section */}
      {results.categories.length > 0 && (
        <div className="border-b border-border/40 p-2 sm:p-2.5">
          <div className="px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-muted">
            Categories ({results.categories.length})
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {results.categories.map((c) => {
              const itemIdx = flatItems.findIndex((fi) => fi.type === 'category' && fi.data.id === c.id);
              const isSelected = activeIndex === itemIdx;
              return (
                <button
                  key={`cat-${c.id}`}
                  type="button"
                  onClick={() => onSelectItem({ type: 'category', data: c })}
                  className={`flex items-center gap-2 rounded-xl p-2 text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-surface-2'
                  }`}
                >
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="truncate font-display text-xs font-medium uppercase tracking-tight text-fg">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Footer Action */}
      {flatItems.some((fi) => fi.type === 'view_all') && (
        <div className="p-2 sm:p-2.5">
          {(() => {
            const itemIdx = flatItems.findIndex((fi) => fi.type === 'view_all');
            const isSelected = activeIndex === itemIdx;
            return (
              <button
                type="button"
                onClick={() => onSelectItem({ type: 'view_all', query: query.trim() })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-2 text-primary hover:bg-primary/10'
                }`}
              >
                <span>See all results for “{query}”</span>
                <FiChevronRight size={16} />
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
