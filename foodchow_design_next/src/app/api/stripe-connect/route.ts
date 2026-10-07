import { NextRequest, NextResponse } from "next/server";

// Use env var (dynamic) with fallback — admin.foodchow.com hosts the FoodChowRMS endpoints
const ADMIN_BASE =
  process.env.NEXT_PUBLIC_FOODCHOW_ADMIN_URL ?? "https://admin.foodchow.com";

const BASE = `${ADMIN_BASE}/api/FoodChowRMS`;

// Maps the ?type= param to the correct FoodChow endpoint
const ENDPOINT_MAP: Record<string, string> = {
  today: "StipeConnectTransToday",
  weekly: "StipeConnectTransWeekly",
  monthly: "StipeConnectTransMonthly",
  yearly: "StipeConnectTransyearly",
  datewise: "StipeConnectTransDateWise",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "today").toLowerCase();

    const endpointName = ENDPOINT_MAP[type];
    if (!endpointName) {
      return NextResponse.json(
        { message: `Unknown type: ${type}` },
        { status: 400 }
      );
    }

    // Build upstream query — forward all params except 'type'
    const upstreamParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "type") upstreamParams.set(key, value);
    });

    const upstreamUrl = `${BASE}/${endpointName}?${upstreamParams.toString()}`;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      // No cache — transaction data must always be fresh
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("STRIPE CONNECT PROXY ERROR:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch stripe connect data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
