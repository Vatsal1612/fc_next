import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const amount = formData.get("amount") || "";
    const oneTimeAmount = formData.get("oneTimeAmount") || "0";
    const addonIds = formData.get("addonIds") || "";
    const planId = formData.get("planId") || "";
    const billingCycle = formData.get("billingCycle") || "";
    const planName = formData.get("planName") || "";
    const currency = formData.get("currency") || "INR";
    const shopId = formData.get("shopId") || "";

    const apiFormData = new FormData();

    apiFormData.append("amount", String(amount));
    apiFormData.append("oneTimeAmount", String(oneTimeAmount));
    apiFormData.append("addonIds", String(addonIds));
    apiFormData.append("planId", String(planId));
    apiFormData.append("billingCycle", String(billingCycle));
    apiFormData.append("planName", String(planName));
    apiFormData.append("currency", String(currency));
    apiFormData.append("shopId", String(shopId));

    const response = await fetch(
      "https://admin.foodchow.com/rzp/RazorPayHandler.php?action=CreateSubscription",
      {
        method: "POST",
        body: apiFormData,
        cache: "no-store",
      }
    );

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();



    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}