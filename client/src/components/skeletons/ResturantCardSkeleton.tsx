import Skeleton from './Skeleton';

export const ResturantCardSkeleton = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-surface-2">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute left-2 top-2 z-10">
          <Skeleton className="h-4 w-12 rounded-lg bg-surface/90" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-28 rounded-md sm:w-36" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>

        <div className="mt-2">
          <Skeleton className="h-3 w-20 rounded" />
        </div>

        <div className="mt-2 space-y-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ResturantCardSkeleton;
