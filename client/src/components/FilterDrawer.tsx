import { useEffect, useState, type ReactNode } from 'react';
import { FiChevronUp, FiX } from 'react-icons/fi';
import { selectFoodCategories, selectMenuItems } from '../store/slices/catalogSlice';
import { getAllCategories } from '../data/selectors';
import { closeFilterDrawer, selectFilterDrawerOpen } from '../store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { DEFAULT_FOOD_FILTERS, type FoodFilters } from '../utils/types';
import { cn } from '../utils/utils';

interface FilterDrawerProps {
  value: FoodFilters;
  onApply: (filters: FoodFilters) => void;
  showRating?: boolean;
  maxPrice?: number;
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-display text-base font-semibold uppercase tracking-wide text-fg">{title}</span>
        <FiChevronUp
          className={cn('h-4 w-4 text-muted transition-transform', !open && 'rotate-180')}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

const RadioRow = ({
  label,
  checked,
  onSelect,
  struck,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  struck?: boolean;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full items-center gap-3 py-1.5 text-left"
  >
    <span
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full border border-fg',
        checked && 'bg-fg'
      )}
    >
      {checked && <span className="h-1.5 w-1.5 rounded-full bg-bg" />}
    </span>
    <span
      className={cn(
        'font-display text-sm font-semibold uppercase tracking-wide text-fg',
        struck && 'text-muted line-through'
      )}
    >
      {label}
    </span>
  </button>
);

const FilterDrawer = ({
  value,
  onApply,
  showRating = false,
  maxPrice = 750,
}: FilterDrawerProps) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectFilterDrawerOpen);
  const [draft, setDraft] = useState<FoodFilters>(value);
  const [sections, setSections] = useState({
    availability: true,
    price: true,
    diet: true,
    category: true,
    rating: true,
  });
  const menuItems = useAppSelector(selectMenuItems);
  const foodCategories = useAppSelector(selectFoodCategories);
  const categories =
    foodCategories.length > 0 ? foodCategories.map((c) => c.name) : getAllCategories(menuItems);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeFilterDrawer());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dispatch]);

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  const toggleCategory = (cat: string) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(cat)
        ? d.categories.filter((c) => c !== cat)
        : [...d.categories, cat],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-black/60"
        onClick={() => dispatch(closeFilterDrawer())}
      />
      <aside className="relative flex h-full w-full max-w-full flex-col bg-surface shadow-xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-fg sm:text-2xl">Filter</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dispatch(closeFilterDrawer())}
            className="rounded-xl p-1 text-fg hover:opacity-70"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <AccordionSection
            title="Availability"
            open={sections.availability}
            onToggle={() => toggleSection('availability')}
          >
            <RadioRow
              label="All"
              checked={draft.availability === 'all'}
              onSelect={() => setDraft((d) => ({ ...d, availability: 'all' }))}
            />
            <RadioRow
              label="In Stock"
              checked={draft.availability === 'in_stock'}
              onSelect={() => setDraft((d) => ({ ...d, availability: 'in_stock' }))}
            />
            <RadioRow
              label="Out of Stock"
              checked={draft.availability === 'out_of_stock'}
              onSelect={() => setDraft((d) => ({ ...d, availability: 'out_of_stock' }))}
              struck
            />
          </AccordionSection>

          <AccordionSection
            title="Price"
            open={sections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="mb-3 px-1">
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={draft.priceTo}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    priceTo: Math.max(d.priceFrom, Number(e.target.value)),
                  }))
                }
                className="w-full accent-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block font-sans text-xs uppercase text-muted">From</span>
                <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 py-2 font-display text-base font-semibold text-fg">
                  <span className="mr-1 text-muted">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={draft.priceTo}
                    value={draft.priceFrom}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        priceFrom: Math.min(Number(e.target.value) || 0, d.priceTo),
                      }))
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block font-sans text-xs uppercase text-muted">To</span>
                <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 py-2 font-display text-base font-semibold text-fg">
                  <span className="mr-1 text-muted">₹</span>
                  <input
                    type="number"
                    min={draft.priceFrom}
                    max={maxPrice}
                    value={draft.priceTo}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        priceTo: Math.max(Number(e.target.value) || 0, d.priceFrom),
                      }))
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </label>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Dietary"
            open={sections.diet}
            onToggle={() => toggleSection('diet')}
          >
            <RadioRow
              label="All"
              checked={draft.diet === 'all'}
              onSelect={() => setDraft((d) => ({ ...d, diet: 'all' }))}
            />
            <RadioRow
              label="Veg"
              checked={draft.diet === 'veg'}
              onSelect={() => setDraft((d) => ({ ...d, diet: 'veg' }))}
            />
            <RadioRow
              label="Non-Veg"
              checked={draft.diet === 'non_veg'}
              onSelect={() => setDraft((d) => ({ ...d, diet: 'non_veg' }))}
            />
          </AccordionSection>

          <AccordionSection
            title="Category"
            open={sections.category}
            onToggle={() => toggleSection('category')}
          >
            {categories.map((cat) => (
              <RadioRow
                key={cat}
                label={cat}
                checked={draft.categories.includes(cat)}
                onSelect={() => toggleCategory(cat)}
              />
            ))}
          </AccordionSection>

          {showRating && (
            <AccordionSection
              title="Rating"
              open={sections.rating}
              onToggle={() => toggleSection('rating')}
            >
              {[null, 4.5, 4.0, 3.5].map((rating) => (
                <RadioRow
                  key={String(rating)}
                  label={rating == null ? 'All' : `${rating}+ Stars`}
                  checked={draft.minRating === rating}
                  onSelect={() => setDraft((d) => ({ ...d, minRating: rating }))}
                />
              ))}
            </AccordionSection>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...DEFAULT_FOOD_FILTERS,
                  query: value.query,
                  cuisine: value.cuisine,
                  priceTo: maxPrice,
                })
              }
              className="flex-1 rounded-xl border border-border py-2.5 font-display text-base font-semibold uppercase tracking-wide text-fg hover:bg-surface-2"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                dispatch(closeFilterDrawer());
              }}
              className="flex-2 rounded-xl bg-primary py-2.5 font-display text-base font-semibold uppercase tracking-wide text-on-primary hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default FilterDrawer;
