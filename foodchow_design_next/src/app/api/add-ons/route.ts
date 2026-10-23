import { NextRequest, NextResponse } from "next/server";
import { getLiveSessionCookie } from "@/lib/session-cookie";

interface CachedAddonResponse {
  data: any;
  status: number;
  expiresAt: number;
}

// In-memory server cache for add-ons (persisted on globalThis across dev module re-evaluations)
const addonCache: Map<string, CachedAddonResponse> =
  (globalThis as any).__addonCache ??
  ((globalThis as any).__addonCache = new Map<string, CachedAddonResponse>());

const inFlightAddonRequests: Map<string, Promise<{ data: any; status: number }>> =
  (globalThis as any).__inFlightAddonRequests ??
  ((globalThis as any).__inFlightAddonRequests = new Map());

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const currencyIdParam = searchParams.get("currencyId") || searchParams.get("currency_id");
    const currency = searchParams.get("currency") || "INR";
    const isINR =
      currencyIdParam === "1" ||
      currency === "1" ||
      currency === "Rs." ||
      currency === "INR" ||
      currency === "₹";

    const sessionCurrency = isINR ? "Rs." : "$";
    const cacheKey = `addons_${sessionCurrency}`;
    const now = Date.now();

    // 1. Check in-memory server cache
    const cached = addonCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        status: cached.status,
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Deduplicate in-flight requests
    let fetchPromise = inFlightAddonRequests.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const cookieHeader = await getLiveSessionCookie(sessionCurrency);
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (cookieHeader) {
          headers["Cookie"] = cookieHeader;
        }

        const response = await fetch(
          `https://admin.foodchow.com/Marketplace/GetAddOns?currency=${encodeURIComponent(sessionCurrency)}`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`AddOns API returned status ${response.status}`);
        }

        const data = await response.json();
        return { data, status: response.status };
      })();

      inFlightAddonRequests.set(cacheKey, fetchPromise);
    }

    try {
      const { data, status } = await fetchPromise;
      if (data && status === 200) {
        addonCache.set(cacheKey, {
          data,
          status,
          expiresAt: now + CACHE_TTL_MS,
        });
      }

      return NextResponse.json(data, {
        status,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
        },
      });
    } finally {
      inFlightAddonRequests.delete(cacheKey);
    }
  } catch (error) {
    console.error("ADD-ONS API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch add-ons",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}