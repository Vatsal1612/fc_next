import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const planId = searchParams.get("planId") || "1";
    const currency = searchParams.get("currency") || "Rs.";

    console.log("=================================");
    console.log("PLAN DETAILS ROUTE");
    console.log("Plan ID:", planId);
    console.log("Requested Currency:", currency);

    // Pass the session/requested currency directly to FoodChow API
    const apiUrl = `https://admin.foodchow.com/Marketplace/GetPlanDetails?planId=${encodeURIComponent(
      planId
    )}&currency=${encodeURIComponent(currency)}`;

    console.log("CALLING FOODCHOW API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("External API Status:", response.status);

    if (!response.ok) {
      throw new Error(
        `FoodChow API returned status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("========== ORIGINAL FOODCHOW RESPONSE ==========");
console.log(JSON.stringify(data, null, 2));
console.log("ORIGINAL PRICE:", data?.Result?.Pricing?.[0]?.Price);
console.log("ORIGINAL TOTAL VALUE:", data?.Result?.TotalValue);
console.log("ORIGINAL TOTAL SAVINGS:", data?.Result?.TotalSavings);
console.log("=================================================");

    console.log("Original API Response:", data);

    // The live backend API returns the prices in the requested currency directly ($ or Rs.).
    // If not INR and text still has Rs./₹, clean up currency display symbols.
    const isINR = currency === "Rs." || currency === "INR" || currency === "₹";
    const targetSymbol = currency === "AUD" ? "A$" : currency === "CAD" ? "C$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

    if (!isINR && data?.Result) {
      if (typeof data.Result.BillingText === "string") {
        data.Result.BillingText = data.Result.BillingText
          .replace(/₹/g, targetSymbol)
          .replace(/Rs\.\s?/gi, targetSymbol)
          .replace(/Rs\s?/gi, targetSymbol);
      }
      if (typeof data.Result.Guarantee?.Description === "string") {
        data.Result.Guarantee.Description = data.Result.Guarantee.Description
          .replace(/₹/g, targetSymbol)
          .replace(/Rs\.\s?/gi, targetSymbol)
          .replace(/Rs\s?/gi, targetSymbol);
      }
      if (typeof data.Result.Guarantee?.Title === "string") {
        data.Result.Guarantee.Title = data.Result.Guarantee.Title
          .replace(/₹/g, targetSymbol)
          .replace(/Rs\.\s?/gi, targetSymbol)
          .replace(/Rs\s?/gi, targetSymbol);
      }
    }

    console.log("Final Response:", data);
    console.log("=================================");

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("PLAN DETAILS API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch plan details",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}