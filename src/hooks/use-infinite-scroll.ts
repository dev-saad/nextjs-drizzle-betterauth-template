import { useCallback, useRef, useState } from "react";

interface UseInfiniteScrollOptions<T> {
 fetchData: (
  page: number,
 ) => Promise<{ data: T[]; total?: number } | T[] | undefined | null>;
 initialData?: T[];
 initialTotal?: number;
 limit?: number;
 defaultLoading?: boolean;
 onSuccess?: () => void;
 onError?: (error: any) => void;
}

export function useInfiniteScroll<T>({
 fetchData,
 initialData = [],
 initialTotal = 0,
 limit = 20,
 defaultLoading = false,
}: UseInfiniteScrollOptions<T>) {
 const [data, setData] = useState<T[]>(initialData);
 const [isLoading, setIsLoading] = useState(defaultLoading);
 const [hasMore, setHasMore] = useState(true);
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState<number>(initialTotal);
 const [error, setError] = useState<any>(null);

 const observerInstance = useRef<IntersectionObserver | null>(null);

 const loadMore = useCallback(
  async (resetPage: boolean = false) => {
   // Prevent fetching if already loading and not resetting
   // But allow resetting even if loading (to cancel/override?) - simplicity first:
   if (isLoading && !resetPage) return;

   setIsLoading(true);
   setError(null);

   const currentPage = resetPage ? 1 : page;

   try {
    const newData = await fetchData(currentPage);

    let items: T[] = [];
    let totalCount = 0;

    if (newData && !Array.isArray(newData) && "data" in newData) {
     items = newData.data;
     totalCount = newData.total || 0;
    } else if (Array.isArray(newData)) {
     items = newData;
     // If returning just array, we can't really update total reliably unless we assume something,
     // but better to keep previous total or 0.
    }

    if (totalCount > 0) setTotal(totalCount);

    if (resetPage) {
     setData(items);
     setPage(2);
     setHasMore(items.length >= limit);
    } else {
     setData((prev) => [...prev, ...items]);
     setPage((prev) => prev + 1);
     setHasMore(items.length >= limit);
    }
   } catch (err) {
    setError(err);
    console.error("Infinite scroll fetch error:", err);
   } finally {
    setIsLoading(false);
   }
  },
  [fetchData, page, limit, isLoading],
 );

 const reset = useCallback(() => {
  setPage(1);
  setHasMore(true);
  // Directly calling loadMore(true) here might rely on stale 'fetchData' if it's not memoized by consumer.
  // However, if we put loadMore in dependency array, we need to be careful.
  // Better pattern: Consumer calls reset(), which triggers loadMore(true).
  loadMore(true);
 }, [loadMore]);

 const observerRef = useCallback(
  (node: HTMLDivElement | null) => {
   if (isLoading) return;

   if (observerInstance.current) {
    observerInstance.current.disconnect();
   }

   if (!node || !hasMore) return;

   observerInstance.current = new IntersectionObserver(
    (entries) => {
     if (entries[0].isIntersecting && !isLoading && hasMore) {
      loadMore();
     }
    },
    { threshold: 0.1 },
   );

   observerInstance.current.observe(node);
  },
  [hasMore, isLoading, loadMore],
 );

 return {
  data,
  total,
  isLoading,
  error,
  hasMore,
  observerRef,
  reset,
  setData, // Expose setter if manual mutation is needed
 };
}
