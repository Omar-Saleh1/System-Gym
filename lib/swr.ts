import useSWR, { SWRConfiguration, mutate, preload } from 'swr';
import api from './axios';

// Global SWR fetcher using configured Axios instance
export const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

// Global default options for ultra-smooth SPA experience
export const swrOptions: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,      // Don't refetch on tab switch unless manually refreshed
  revalidateIfStale: true,       // Show cached data instantly while refreshing in background
  dedupingInterval: 5000,        // Deduplicate requests within 5 seconds
  keepPreviousData: true,        // Prevent empty screens during background refetches
  errorRetryCount: 2,
};

/**
 * Custom hook for cached data with instant 0ms return from memory
 */
export function useFastQuery<T = any>(
  key: string | null | (() => string | null),
  options?: SWRConfiguration<T>
) {
  return useSWR<T>(key, fetcher, {
    ...swrOptions,
    ...options,
  });
}

/**
 * Prefetch an endpoint into cache (used for hover on links)
 */
export const prefetchData = (url: string) => {
  if (typeof window !== 'undefined' && url) {
    preload(url, fetcher);
  }
};

/**
 * Invalidate or refresh cache by exact key or regex pattern
 */
export const invalidateData = (keyOrPattern: string | RegExp) => {
  if (typeof keyOrPattern === 'string') {
    mutate(keyOrPattern);
  } else {
    mutate(
      (key) => typeof key === 'string' && keyOrPattern.test(key),
      undefined,
      { revalidate: true }
    );
  }
};

export { mutate, preload };
