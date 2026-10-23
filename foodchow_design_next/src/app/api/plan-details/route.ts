import { NextRequest, NextResponse } from "next/server";
import { getLiveSessionCookie } from "@/lib/session-cookie";

interface CachedPlanResponse {
  data: any;
  status: number;
  expiresAt: number;
}

// In-memory server cache for plan pricing details (persisted on globalThis across dev module re-evaluations)
const planCache: Map<string, CachedPlanResponse> =
  (globalThis as any).__planCache ??
  ((globalThis as any).__planCache = new Map<string, CachedPlanResponse>());

const inFlightRequests: Map<string, Promise<{ data: any; status: number }>> =
  (globalThis as any).__inFlightPlanRequests ??
  ((globalThis as any).__inFlightPlanRequests = new Map());

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const planId = searchParams.get("planId") || "1";
    const currency = searchParams.get("currency") || "INR";
    const currencyId = searchParams.get("currency_id") || searchParams.get("currencyId");

    const isINR =
      currencyId === "1" ||
      currency === "1" ||
      currency === "Rs." ||
      currency === "INR" ||
      currency === "₹";

    const sessionCurrency = isINR ? "Rs." : "$";
    const cacheKey = `${planId}_${sessionCurrency}`;
    const now = Date.now();

    // 1. Check in-memory server cache
    const cached = planCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        status: cached.status,
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Deduplicate in-flight requests for the same plan & currency
    let fetchPromise = inFlightRequests.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const cookieHeader = await getLiveSessionCookie(sessionCurrency);
        const apiUrl = `https://admin.foodchow.com/Marketplace/GetPlanDetails?planId=${encodeURIComponent(
          planId
        )}&currency=${encodeURIComponent(sessionCurrency)}`;

        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (cookieHeader) {
          headers["Cookie"] = cookieHeader;
        }

        const response = await fetch(apiUrl, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`FoodChow API returned status ${response.status}`);
        }

        const data = await response.json();
        return { data, status: response.status };
      })();

      inFlightRequests.set(cacheKey, fetchPromise);
    }

    try {
      const { data, status } = await fetchPromise;

      // Cache valid plan details
      if (data && (data.Status || data.Result || status === 200)) {
        planCache.set(cacheKey, {
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
      inFlightRequests.delete(cacheKey);
    }
  } catch (error) {
    console.error("PLAN DETAILS API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch plan details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}