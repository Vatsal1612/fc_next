import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") || "INR";

    const response = await fetch(
      `https://admin.foodchow.com/Marketplace/GetMarketplaceData?currency=${encodeURIComponent(
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

    if (!response.ok) {
      throw new Error(`Marketplace API returned status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("MARKETPLACE DATA API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch marketplace data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
