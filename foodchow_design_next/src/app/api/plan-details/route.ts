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

    // Always get original INR data from FoodChow API
   const apiUrl = `https://admin.foodchow.com/Marketplace/GetPlanDetails?planId=${encodeURIComponent(
  planId
)}&currency=Rs.`;

console.log("CALLING FOODCHOW API:", apiUrl);

const response = await fetch(apiUrl, 
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

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

    // ---------------------------------------
    // INR → USD conversion
    // ---------------------------------------

    if (currency === "$" && data?.Result) {
      const INR_TO_USD = 0.0117;

      // Pricing
      if (Array.isArray(data.Result.Pricing)) {
        data.Result.Pricing = data.Result.Pricing.map(
          (pricing: any) => ({
            ...pricing,

            Price:
              pricing.Price !== null &&
              pricing.Price !== undefined
                ? Number(pricing.Price) * INR_TO_USD
                : pricing.Price,

            OriginalPrice:
              pricing.OriginalPrice !== null &&
              pricing.OriginalPrice !== undefined
                ? Number(pricing.OriginalPrice) * INR_TO_USD
                : pricing.OriginalPrice,
          })
        );
      }

      // Total Value
      if (
        data.Result.TotalValue !== null &&
        data.Result.TotalValue !== undefined
      ) {
        data.Result.TotalValue =
          Number(data.Result.TotalValue) * INR_TO_USD;
      }

      // Total Savings
      if (
        data.Result.TotalSavings !== null &&
        data.Result.TotalSavings !== undefined
      ) {
        data.Result.TotalSavings =
          Number(data.Result.TotalSavings) * INR_TO_USD;
      }

      // Billing text
      if (typeof data.Result.BillingText === "string") {
        data.Result.BillingText =
          data.Result.BillingText
            .replace(/₹/g, "")
            .replace(/Rs\./gi, "")
            .replace(/Rs/gi, "");

        const pricing = data.Result.Pricing?.[0];

        if (pricing?.Price !== undefined) {
          data.Result.BillingText =
            `$${Number(pricing.Price).toFixed(2)} / ${
              pricing.BillingCycle === "YEAR"
                ? "Year"
                : "Month"
            }`;
        }
      }

      // Header / footer / other text
      if (typeof data.Result.Guarantee?.Description === "string") {
        data.Result.Guarantee.Description =
          data.Result.Guarantee.Description.replace(
            /Rs\.?\s?/gi,
            "$"
          );
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