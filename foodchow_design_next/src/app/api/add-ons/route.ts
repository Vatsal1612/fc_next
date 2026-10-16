import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const currency = searchParams.get("currency") || "INR";

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

    // In the database FD_MP_AddOnPricing table:
    // CurrencyId = 1 (INR): Happy Hour (12000), POS (5475), Bio Link (2500), WhatsApp (5475), Additional Menu (12000), KDS (5475), Snap Dish (5000), Table Reservation (4999), Audit (12000)
    // CurrencyId = 2 (USD): Happy Hour (250), POS (300), Bio Link (49), WhatsApp (300), Additional Menu (100), KDS (150), Snap Dish (100), Table Reservation (99), Audit (100)
    // The live endpoint defaults to USD (CurrencyId 2). When INR is requested, align prices with CurrencyId = 1 just like plans do with BillingText.
    const isINR = currency === "Rs." || currency === "INR" || currency === "₹";

    if (isINR && Array.isArray(data?.Result)) {
      const inrPrices: Record<number, number> = {
        1: 12000, // Happy Hour
        2: 5475,  // POS Software
        3: 2500,  // Bio Link
        4: 5475,  // WhatsApp Automation
        5: 5475,  // KDS
        6: 12000, // Additional Menu
        7: 5000,  // Snap Dish
        8: 5000, // Customised Digital audit
        9: 4999,  // Table Reservation
      };

      data.Result = data.Result.map((item: any) => {
        const id = item.Id ?? item.id;
        const price = inrPrices[id] !== undefined ? inrPrices[id] : item.Price;
        return {
          ...item,
          Price: price,
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