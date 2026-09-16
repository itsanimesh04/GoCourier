import FoodCard from '../../../components/FoodCard';
import { FoodCardSkeleton } from '../../../components/skeletons';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { useAppSelector } from '../../../store';
import { selectCatalogStatus, selectMenuItems } from '../../../store/slices/catalogSlice';
import Section5 from './Section5';

const HomeFoodGrid = () => {
  const menuItems = useAppSelector(selectMenuItems);
  const status = useAppSelector(selectCatalogStatus);
  const mid = Math.ceil(menuItems.length / 2);
  const firstHalf = menuItems.slice(0, mid);
  const secondHalf = menuItems.slice(mid);

  const { visibleCount, hasMore, isLoadingMore, sentinelRef } = useInfiniteScroll({
    totalItems: secondHalf.length,
    initialCount: 12,
    step: 12,
    resetKey: menuItems.length,
  });

  const displayedSecondHalf = secondHalf.slice(0, visibleCount);

  if (status === 'loading' && menuItems.length === 0) {
    return (
      <section className="w-full py-6 sm:py-8 min-h-[850px]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 text-center sm:mb-5">
            <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
              All campus food
            </h2>
            <p className="mt-1 font-sans text-xs text-muted sm:text-sm">
              Loading fresh dishes from partner kitchens…
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="my-8 sm:my-10 mx-auto max-w-7xl px-4">
          <div className="h-44 sm:h-56 w-full rounded-2xl bg-surface-2 animate-pulse" />
        </div>

        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <FoodCardSkeleton key={`second-${i}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (menuItems.length === 0) {
    return (
      <section className="w-full min-h-[400px] flex items-center justify-center py-10 text-center font-sans text-sm text-muted">
        No dishes yet for this campus. Add restaurants and menu items in admin.
      </section>
    );
  }

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 text-center sm:mb-5">
          <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
            All campus food
          </h2>
          <p className="mt-1 font-sans text-xs text-muted sm:text-sm">
            {menuItems.length} dishes from partner kitchens — order before cutoff
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {firstHalf.map((item) => (
            <FoodCard key={item.id} menuItem={item} />
          ))}
        </div>
      </div>

      <div className="my-8 sm:my-10">
        <Section5 />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {displayedSecondHalf.map((item) => (
            <FoodCard key={item.id} menuItem={item} />
          ))}
        </div>

        {/* Infinite scroll sentinel and bottom loading indicator */}
        {hasMore && (
          <div ref={sentinelRef} className="py-8 flex justify-center items-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                Loading more dishes…
              </div>
            ) : (
              <div className="h-6 w-full" />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFoodGrid;
