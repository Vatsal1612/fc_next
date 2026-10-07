/**
 * Lightweight token storage helper. Kept framework-agnostic so it can be
 * swapped for cookies / a secure store later without touching the API layer.
 */
const ACCESS_TOKEN_KEY = "fc_access_token";
const REFRESH_TOKEN_KEY = "fc_refresh_token";

const isBrowser = (): boolean => typeof window !== "undefined";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
