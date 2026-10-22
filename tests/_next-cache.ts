// Import before anything that loads next/cache. Outside Next, its storage
// modules bind a stub AsyncLocalStorage at load time and unstable_cache throws
// an invariant before running its callback, so a test would never reach fetch.
import { AsyncLocalStorage } from "node:async_hooks";

type Entry = { value: unknown; isStale: false };
export const cacheStore = new Map<string, Entry>();

Object.assign(globalThis, {
  AsyncLocalStorage,
  __incrementalCache: {
    isOnDemandRevalidate: false,
    generateSimpleCacheKey: async (key: string) => key,
    get: async (key: string) => cacheStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      cacheStore.set(key, { value, isStale: false });
    },
  },
});
