import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ExtraCard from '../../../components/ExtraCard';
import ExtrasServiceCards from '../../../components/ExtrasServiceCards';
import { extrasProducts, extrasStores } from '../../../data/extrasCatalog';

const storeButtonClass =
  'group flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-3 text-left transition-colors hover:border-primary hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-4 sm:py-3.5';

const ExtrasSections = () => {
  const featured = extrasProducts.filter((p) => p.featured && p.available);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:pt-6">
        <ExtrasServiceCards />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex flex-col items-center gap-2 text-center sm:mb-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-fg sm:text-xl">
            Campus stores
          </h2>
          <p className="font-sans text-xs text-muted sm:text-sm">
            Everything else you need, delivered with tonight&apos;s batch.
          </p>
          <Link
            to="/extras"
            className="font-sans text-xs font-semibold text-primary hover:opacity-80"
          >
            View all
          </Link>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {extrasStores.map((store) => (
            <Link
              key={store.id}
              to={`/extras?store=${store.id}`}
              className={storeButtonClass}
            >
              <span className="min-w-0">
                <span
                  className="mb-2 block h-1 w-8 rounded-full"
                  style={{ backgroundColor: store.accent }}
                />
                <span className="block font-display text-sm font-semibold text-fg">
                  {store.name}
                </span>
                <span className="mt-0.5 block font-sans text-[11px] text-muted">
                  {store.category}
                </span>
              </span>
              <FiChevronRight
                className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <h2 className="mb-4 text-center font-display text-lg font-bold uppercase tracking-tight text-fg sm:text-xl">
          Featured extras
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ExtraCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
};

export default ExtrasSections;
