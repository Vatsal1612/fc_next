import { NextRequest, NextResponse } from "next/server";

const ADMIN_BASE =
  process.env.NEXT_PUBLIC_FOODCHOW_ADMIN_URL ?? "https://admin.foodchow.com";

const BASE = `${ADMIN_BASE}/api/FoodChowRMS`;

const ENDPOINT_MAP: Record<string, string> = {
  today: "PosTotalsalestoday",
  weekly: "PosTotalsalesweekly",
  monthly: "PosTotalsalesmonthly",
  yearly: "PosTotalsalesyearly",
  datewise: "PosTotalsalesDateWise",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "today").toLowerCase();

    // We map 'datewise' slightly differently since toLowerCase() would make it datewise
    const endpointKey = type === "datewise" ? "datewise" : type;
    const endpointName = ENDPOINT_MAP[endpointKey];

    if (!endpointName) {
      return NextResponse.json(
        { error: "Invalid pos-total-sales type parameter" },
        { status: 400 }
      );
    }

    const shopId = searchParams.get("shop_id");
    if (!shopId) {
      return NextResponse.json(
        { error: "Missing shop_id parameter" },
        { status: 400 }
      );
    }

    const targetUrl = new URL(`${BASE}/${endpointName}`);
    targetUrl.searchParams.set("shop_id", shopId);

    if (type === "monthly") {
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      if (month) targetUrl.searchParams.set("month", month);
      if (year) targetUrl.searchParams.set("year", year);
    } else if (type === "yearly") {
      const year = searchParams.get("year");
      if (year) targetUrl.searchParams.set("year", year);
    } else if (type === "datewise") {
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");
      if (startDate) targetUrl.searchParams.set("start_date", startDate);
      if (endDate) targetUrl.searchParams.set("end_date", endDate);
    }

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { data: null };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch pos total sales data", error: error.message },
      { status: 500 }
    );
  }
}
