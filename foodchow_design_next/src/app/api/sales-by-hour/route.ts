import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id");
    const date = searchParams.get("find_date");
    const fromTime = searchParams.get("from_time");
    const toTime = searchParams.get("to_time");

    if (!shopId || !date || !fromTime || !toTime) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const apiUrl = `https://api.foodchow.com/api/FoodChowRMS/SalesByHours?shop_id=${shopId}&find_date=${date}&from_time=${fromTime}&to_time=${toTime}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      // No caching so the report is always live
      cache: 'no-store'
    });

    if (response.status === 404) {
      // Backend returns 404 when no records are found.
      // We return 200 with an empty array to prevent red 404 errors in the browser's Network tab.
      return NextResponse.json([], { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("SALES BY HOUR PROXY ERROR:", error);
    // Return empty array on failure as well to avoid red network errors
    return NextResponse.json([], { status: 200 });
  }
}
