import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json({ error: "shop_id is required" }, { status: 400 });
    }

    // Call live FoodChow API for shop subscription / plan details
    const planDetailsUrl = `https://www.foodchow.com/api/FoodChowWD/GetPlanDetails?id=${encodeURIComponent(shopId)}`;
    const pointPlanUrl = `https://www.foodchow.com/api/FoodChowWD/GetPointPlanDetailscurrent?shop_id=${encodeURIComponent(shopId)}`;

    const [planRes, pointRes] = await Promise.allSettled([
      fetch(planDetailsUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
      fetch(pointPlanUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
    ]);

    let planData: any = null;
    let pointData: any = null;

    if (planRes.status === "fulfilled" && planRes.value.ok) {
      try {
        planData = await planRes.value.json();
      } catch {}
    }

    if (pointRes.status === "fulfilled" && pointRes.value.ok) {
      try {
        pointData = await pointRes.value.json();
      } catch {}
    }

    // Return combined or prioritized data
    return NextResponse.json({
      planDetails: planData,
      pointPlan: pointData,
      // Default to planData if present, else pointData
      ...(planData || pointData || {}),
    });
  } catch (error) {
    console.error("Live my-plan route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live plan" },
      { status: 500 }
    );
  }
}
