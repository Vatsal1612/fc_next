/**
 * reportCache.ts
 *
 * Lightweight two-tier cache for report API responses:
 *   Tier 1 — in-memory Map  (survives SPA navigations, sub-ms reads)
 *   Tier 2 — sessionStorage  (survives hard-reloads within the same tab)
 *
 * Strategy: stale-while-revalidate
 *   • Return cached data immediately if present (even if stale).
 *   • Revalidate in the background when the entry is older than TTL.
 *   • Callers get data instantly on repeat visits; fresh data follows shortly.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number; // timestamp of when data was stored
}

// Tier-1: in-memory (fastest, cleared on full page refresh)
const memCache = new Map<string, CacheEntry<unknown>>();

/** Build a stable cache key from a name + params object. */
export function cacheKey(name: string, params: Record<string, unknown>): string {
  return `rc:${name}:${JSON.stringify(params)}`;
}

/** Read from memory → then sessionStorage. Returns null if not found. */
function read<T>(key: string): CacheEntry<T> | null {
  // Tier-1
  const mem = memCache.get(key) as CacheEntry<T> | undefined;
  if (mem) return mem;

  // Tier-2
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const entry = JSON.parse(raw) as CacheEntry<T>;
      // Warm tier-1 from tier-2
      memCache.set(key, entry as CacheEntry<unknown>);
      return entry;
    }
  } catch {
    // sessionStorage unavailable or JSON parse error — ignore
  }
  return null;
}

/** Write to both tiers. */
function write<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, ts: Date.now() };
  memCache.set(key, entry as CacheEntry<unknown>);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — mem-only is fine
  }
}

/** Remove a specific key from both tiers. */
export function invalidate(key: string): void {
  memCache.delete(key);
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

/** Remove all report cache entries (keys starting with "rc:"). */
export function invalidateAll(): void {
  memCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("rc:"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch { /* ignore */ }
}

/**
 * Fetch with stale-while-revalidate caching.
 *
 * @param key       - Unique cache key (use `cacheKey()` helper)
 * @param fetcher   - Async function that returns fresh data
 * @param onData    - Called immediately with cached data (if any) AND with fresh data
 * @param ttlMs     - How long before data is considered stale (default 5 min)
 * @returns Promise that resolves when fresh data has been fetched and stored.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  onData: (data: T, isStale: boolean) => void,
  ttlMs: number = CACHE_TTL_MS
): Promise<void> {
  const entry = read<T>(key);

  if (entry) {
    // Serve cached data immediately (instant render)
    onData(entry.data, true);

    const age = Date.now() - entry.ts;
    if (age < ttlMs) {
      // Data is fresh — no revalidation needed
      return;
    }
    // Data is stale — revalidate silently in background
  }

  // Fetch fresh data
  try {
    const fresh = await fetcher();
    write(key, fresh);
    onData(fresh, false);
  } catch (err) {
    // If we already served stale data, swallow the error silently
    if (!entry) throw err;
    console.warn("[reportCache] background revalidation failed:", err);
  }
}
