import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json({ error: "shop_id is required" }, { status: 400 });
    }

    // Call live FoodChow API for plan details
    const planDetailsUrl = `https://www.foodchow.com/api/FoodChowWD/GetPlanDetails?id=${encodeURIComponent(shopId)}`;

    const res = await fetch(planDetailsUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `API error with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Live my-plan route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live plan" },
      { status: 500 }
    );
  }
}
