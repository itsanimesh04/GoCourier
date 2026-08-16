import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CatalogModeTabs from '../components/CatalogModeTabs';
import ExtraCard from '../components/ExtraCard';
import ExtrasServiceCards from '../components/ExtrasServiceCards';
import { useAppDispatch, useAppSelector } from '../store';
import { selectExtras } from '../store/slices/catalogSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';

const ExtrasListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const extras = useAppSelector(selectExtras);
  const query = searchParams.get('q') ?? '';
  const storeParam = searchParams.get('store');
  const categoryParam = searchParams.get('category');
  const categories = ['All', ...[...new Set(extras.map((p) => p.category))]];
  const [category, setCategory] = useState(categoryParam && categories.includes(categoryParam) ? categoryParam : 'All');

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  const stores = useMemo(
    () => [...new Set(extras.map((p) => p.storeName))],
    [extras]
  );

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return extras.filter((p) => {
      if (storeParam && p.storeName !== storeParam) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q)
      );
    });
  }, [category, extras, query, storeParam]);

  const selectStore = (storeName: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (storeName) params.set('store', storeName);
    else params.delete('store');
    setSearchParams(params, { replace: true });
  };

  const selectCategory = (next: string) => {
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
            {query ? `Results for “${query}”` : 'Stationery, snacks, and essentials for hostel life'}
          </p>
        </div>
        <CatalogModeTabs navigateOnChange />
      </div>

      <div className="mb-8">
        <ExtrasServiceCards />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
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

      {stores.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-lg font-semibold uppercase text-fg sm:text-xl">
            Stores
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stores.map((store) => {
              const active = storeParam === store;
              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => selectStore(active ? null : store)}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-left font-display text-sm font-semibold',
                    active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                  )}
                >
                  {store}
                </button>
              );
            })}
          </div>
        </section>
      )}

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
