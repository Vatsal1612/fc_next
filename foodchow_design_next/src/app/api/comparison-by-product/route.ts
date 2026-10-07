import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id");
    const pageNumber = searchParams.get("pageNumber");
    const pageSize = searchParams.get("pageSize");
    const period = searchParams.get("period"); // today, week, month, year

    if (!shopId || !period) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let endpoint = "";
    if (period === "today") endpoint = "/FoodChowRMS/ProductWiseComparisonByToday";
    else if (period === "week") endpoint = "/FoodChowRMS/ProductWiseComparisonByWeek";
    else if (period === "month") endpoint = "/FoodChowRMS/ProductWiseComparisonByMonth";
    else if (period === "year") endpoint = "/FoodChowRMS/ProductWiseComparisonByYear";

    const apiUrl = `https://api.foodchow.com/api${endpoint}?shop_id=${shopId}&pageNumber=${pageNumber || 1}&pageSize=${pageSize || 10}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: 'no-store'
    });

    if (response.status === 404) {
      // Return 200 with empty array to prevent red 404 error in browser Network tab
      return NextResponse.json({ data: "[]" }, { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("COMPARISON BY PRODUCT PROXY ERROR:", error);
    // Return empty array on failure as well to avoid red network errors
    return NextResponse.json({ data: "[]" }, { status: 200 });
  }
}
