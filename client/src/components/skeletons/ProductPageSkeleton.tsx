import Skeleton from './Skeleton';
import FoodCardSkeleton from './FoodCardSkeleton';

export const ProductPageSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3 w-2 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-2 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        {/* Gallery Image Skeleton */}
        <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface-2">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>

        {/* Product Details Skeleton */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>

          <Skeleton className="h-8 w-4/5 rounded-lg sm:h-9" />
          <Skeleton className="h-4 w-40 rounded" />

          <div className="space-y-2 pt-2">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-5/6 rounded" />
            <Skeleton className="h-3.5 w-4/6 rounded" />
          </div>

          <div className="pt-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
        <Skeleton className="mb-2 h-6 w-36 rounded" />
        <Skeleton className="mb-6 h-4 w-52 rounded" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
