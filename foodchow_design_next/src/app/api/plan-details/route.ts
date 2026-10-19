import { NextRequest, NextResponse } from "next/server";
import { getLiveSessionCookie } from "@/lib/session-cookie";

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

    return NextResponse.json(data, {
      status: response.status,
    });
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