import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CatalogModeTabs from '../components/CatalogModeTabs';
import ExtraCard from '../components/ExtraCard';
import ExtrasServiceCards from '../components/ExtrasServiceCards';
import {
  extrasCategories,
  extrasProducts,
  extrasStores,
  type ExtrasCategory,
} from '../data/extrasCatalog';
import { useAppDispatch } from '../store';
import { setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';

const ExtrasListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const query = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category');
  const [category, setCategory] = useState<ExtrasCategory>(
    extrasCategories.includes(categoryParam as ExtrasCategory)
      ? (categoryParam as ExtrasCategory)
      : 'All'
  );

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  useEffect(() => {
    if (
      categoryParam &&
      extrasCategories.includes(categoryParam as ExtrasCategory)
    ) {
      setCategory(categoryParam as ExtrasCategory);
    }
  }, [categoryParam]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return extrasProducts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      const store = extrasStores.find((s) => s.id === p.storeId);
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (store?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [category, query]);

  const selectCategory = (next: ExtrasCategory) => {
    setCategory(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'All') params.delete('category');
    else params.set('category', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
            Campus extras
          </h1>
          <p className="mt-1 font-sans text-sm text-muted">
            {query
              ? `Results for “${query}”`
              : 'Stationery, snacks, and essentials for hostel life'}
          </p>
        </div>
        <CatalogModeTabs navigateOnChange />
      </div>

      <div className="mb-8">
        <ExtrasServiceCards />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {extrasCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => selectCategory(cat)}
            className={cn(
              'rounded-xl px-3 py-1.5 font-sans text-sm font-medium transition-colors',
              category === cat
                ? 'bg-primary text-on-primary'
                : 'border border-border bg-surface text-muted hover:text-fg'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg font-semibold uppercase text-fg sm:text-xl">
          Stores
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {extrasStores.map((store) => (
            <div
              key={store.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div
                className="mb-3 h-1.5 w-10 rounded-full"
                style={{ backgroundColor: store.accent }}
              />
              <p className="font-display text-base font-semibold text-fg">
                {store.name}
              </p>
              <p className="mt-1 font-sans text-xs text-muted">{store.category}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold uppercase text-fg sm:text-xl">
          Products · {products.length}
        </h2>
        {products.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface p-8 text-center font-sans text-muted">
            No extras match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ExtraCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExtrasListingPage;
