import Skeleton from './Skeleton';

export const ExtraCardSkeleton = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-2">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="flex flex-1 flex-col items-center p-2 text-center sm:p-2.5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="mt-1.5 h-4 w-28 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-20 rounded" />
        <Skeleton className="mt-2 h-4 w-14 rounded-md" />
      </div>

      <div className="mt-auto px-2 pb-2 sm:px-2.5 sm:pb-2.5">
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </div>
  );
};

export default ExtraCardSkeleton;
