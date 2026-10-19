import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const currencyIdParam = searchParams.get("currencyId") || searchParams.get("currency_id");
    const currency = searchParams.get("currency") || "INR";
    const isINR = currencyIdParam === "1" || currency === "Rs." || currency === "INR" || currency === "₹";

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

    // When CurrencyId = 1 (INR), map add-ons to their INR pricing from FD_MP_AddOnPricing
    if (isINR && Array.isArray(data?.Result)) {
      const inrAddonPrices: Record<number, number> = {
        1: 12000, // Real-Time Offers / Happy Hour
        2: 5475,  // POS Software
        3: 2500,  // Bio Link
        4: 5475,  // WhatsApp Automation
        5: 5475,  // KDS
        6: 12000, // Additional Menu
        7: 5000,  // Snap Dish
        8: 5000,  // Customised Digital Audit
        9: 4999,  // Table Reservation
      };

      data.Result = data.Result.map((item: any) => {
        const id = item.Id ?? item.id;
        const inrPrice = inrAddonPrices[id];
        return {
          ...item,
          Price: inrPrice !== undefined ? inrPrice : item.Price,
          BillingCycle: item.BillingCycle || "YEAR",
        };
      });
    }

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