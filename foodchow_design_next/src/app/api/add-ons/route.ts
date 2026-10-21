import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const currency = searchParams.get("currency") || "Rs.";

    const response = await fetch(
      `https://admin.foodchow.com/Marketplace/GetAddOns?currency=${encodeURIComponent(
        currency
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log("ADD-ONS API STATUS:", response.status);
    console.log("ADD-ONS API RESPONSE:", data);

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