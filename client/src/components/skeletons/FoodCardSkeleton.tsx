import Skeleton from './Skeleton';

export const FoodCardSkeleton = () => {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-surface-2">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-sm" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-4 w-3/5 rounded-md" />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>

        <div className="mt-2.5 space-y-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>

        <div className="mt-3">
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </div>

      <div className="mt-auto px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
};

export default FoodCardSkeleton;
