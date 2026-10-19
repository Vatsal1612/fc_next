import { NextRequest, NextResponse } from "next/server";
import { getLiveSessionCookie } from "@/lib/session-cookie";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const currencyIdParam = searchParams.get("currencyId") || searchParams.get("currency_id");
    const currency = searchParams.get("currency") || "INR";
    const isINR =
      currencyIdParam === "1" ||
      currency === "1" ||
      currency === "Rs." ||
      currency === "INR" ||
      currency === "₹";

    const sessionCurrency = isINR ? "Rs." : "$";
    const cookieHeader = await getLiveSessionCookie(sessionCurrency);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const response = await fetch(
      `https://admin.foodchow.com/Marketplace/GetAddOns?currency=${encodeURIComponent(sessionCurrency)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`AddOns API returned status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("ADD-ONS API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch add-ons",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}