import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id");
    const posUser = searchParams.get("posUser");
    const openDate = searchParams.get("open_date");
    const pageNumber = searchParams.get("pageNumber") || "1";
    const pageSize = searchParams.get("pageSize") || "10";

    if (!shopId || !posUser || !openDate) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const apiUrl = `https://api.foodchow.com/api/SalesReports/PosEndDayReport?shop_id=${shopId}&posUser=${encodeURIComponent(posUser)}&open_date=${openDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: 'no-store'
    });

    if (response.status === 404) {
      // Return 200 with empty data to prevent red 404 error in browser Network tab
      return NextResponse.json({ data: "[]" }, { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POS END DAY PROXY ERROR:", error);
    // Return empty array on failure as well to avoid red network errors
    return NextResponse.json({ data: "[]" }, { status: 200 });
  }
}
