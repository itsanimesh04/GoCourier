import Skeleton from './Skeleton';
import FoodCardSkeleton from './FoodCardSkeleton';

export const RestaurantPageSkeleton = () => {
  return (
    <div>
      {/* Hero Skeleton */}
      <div className="relative min-h-[260px] overflow-hidden bg-surface-2 sm:min-h-[320px] md:min-h-[380px]">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl p-4 sm:p-8 md:p-10">
          <Skeleton className="mb-3 h-5 w-16 rounded-md" />
          <Skeleton className="h-8 w-48 rounded-lg sm:h-10 sm:w-72" />
          <Skeleton className="mt-2 h-4 w-32 rounded-md" />
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Dishes Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPageSkeleton;
