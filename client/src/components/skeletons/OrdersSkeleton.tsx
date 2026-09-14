import Skeleton from './Skeleton';

export const OrdersSkeleton = () => {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default OrdersSkeleton;
