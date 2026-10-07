import { NextRequest, NextResponse } from "next/server";

const ADMIN_BASE =
  process.env.NEXT_PUBLIC_FOODCHOW_ADMIN_URL ?? "https://admin.foodchow.com";

const BASE = `${ADMIN_BASE}/api/FoodChowRMS`;

const ENDPOINT_MAP: Record<string, string> = {
  today: "IncompletePaymentByToday",
  weekly: "IncompletePaymentByWeek",
  monthly: "IncompletePaymentByMonth",
  yearly: "IncompletePaymentByYear",
  datewise: "IncompletePaymentByDateWise",
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

    // Forward all params except 'type'
    const upstreamParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "type") upstreamParams.set(key, value);
    });

    const upstreamUrl = `${BASE}/${endpointName}?${upstreamParams.toString()}`;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("INCOMPLETE PAYMENT PROXY ERROR:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch incomplete payment data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
