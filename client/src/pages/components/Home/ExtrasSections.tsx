import { Link } from 'react-router-dom';
import ExtraCard from '../../../components/ExtraCard';
import ExtrasServiceCards from '../../../components/ExtrasServiceCards';
import { ExtraCardSkeleton, Skeleton } from '../../../components/skeletons';
import { useAppSelector } from '../../../store';
import { selectCatalogStatus, selectExtras } from '../../../store/slices/catalogSlice';

const ExtrasSections = () => {
  const extras = useAppSelector(selectExtras);
  const status = useAppSelector(selectCatalogStatus);
  const featured = extras.filter((p) => p.featured && p.available);
  const stores = [...new Set(extras.map((p) => p.storeName))];

  if (status === 'loading' && extras.length === 0) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:pt-6">
          <ExtrasServiceCards />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-4 text-center">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-fg sm:text-xl">
              Campus stores
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10">
          <h2 className="mb-4 text-center font-display text-lg font-bold uppercase tracking-tight text-fg sm:text-xl">
            Featured extras
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ExtraCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:pt-6">
        <ExtrasServiceCards />
      </section>

      {stores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-4 text-center">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-fg sm:text-xl">
              Campus stores
            </h2>
            <Link to="/extras" className="font-sans text-xs font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stores.map((store) => (
              <Link
                key={store}
                to={`/extras?store=${encodeURIComponent(store)}`}
                className="rounded-xl border border-border bg-surface px-3 py-3 font-display text-sm font-semibold text-fg hover:border-primary"
              >
                {store}
              </Link>
            ))}
          </div>
        </section>
      )}

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
