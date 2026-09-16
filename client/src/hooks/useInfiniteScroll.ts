import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  totalItems: number;
  initialCount?: number;
  step?: number;
  resetKey?: unknown;
}

export function useInfiniteScroll({
  totalItems,
  initialCount = 16,
  step = 12,
  resetKey,
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialCount, Math.max(0, totalItems))
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when filters, query, or resetKey changes
  useEffect(() => {
    setVisibleCount(Math.min(initialCount, Math.max(0, totalItems)));
    setIsLoadingMore(false);
  }, [resetKey, initialCount, totalItems]);

  const hasMore = visibleCount < totalItems;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    // Subtle microtask/timeout to allow smooth frame render
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + step, totalItems));
      setIsLoadingMore(false);
    }, 150);
  }, [hasMore, isLoadingMore, step, totalItems]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  return {
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
  };
}
