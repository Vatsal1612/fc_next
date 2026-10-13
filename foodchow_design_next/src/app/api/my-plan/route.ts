import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json({ error: "shop_id is required" }, { status: 400 });
    }

    // Call live FoodChow API for shop subscription / point plan
    const liveUrl = `https://www.foodchow.com/api/FoodChowWD/GetPointPlanDetailscurrent?shop_id=${encodeURIComponent(shopId)}`;
    const response = await fetch(liveUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Live API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Live my-plan route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live plan" },
      { status: 500 }
    );
  }
}
