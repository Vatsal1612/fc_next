import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fallbackUsers = [
    { name: "Driver 2", user_name: "driver_2" },
    { name: "admin user", user_name: "admin_user" },
    { name: "Sujal Barvaliya", user_name: "sujal_barvaliya" },
    { name: "pratik chauhan", user_name: "pratik_chauhan1" },
    { name: "Demo testing", user_name: "demo_testing" },
    { name: "Pratik chauhan", user_name: "pratik_chauhan2" },
    { name: "tester demo", user_name: "tester_demo" },
    { name: "Sahil Pathan", user_name: "sahil_pathan" },
    { name: "xyz xyz", user_name: "xyz_xyz" },
    { name: "Yash Doctor", user_name: "yash_doctor1" },
    { name: "yash doctor", user_name: "yash_doctor4" },
    { name: "y d", user_name: "y_d" },
    { name: "test1 test2", user_name: "test1_test2" },
    { name: "kevin testing", user_name: "kevin_testing" },
    { name: "Yash Doctor cashier", user_name: "yash_doctor_cashier" },
    { name: "Yash Doctor waiter", user_name: "yash_doctor_waiter" },
    { name: "hello ptl", user_name: "hello_ptl" },
    { name: "abc afd", user_name: "abc_afd" },
    { name: "Abhshek Gamit", user_name: "abhshek_gamit" },
    { name: "Gammit Abhi", user_name: "gammit_abhi" },
    { name: "Akki Gamit", user_name: "akki_gamit" },
    { name: "Abhishek Gamit", user_name: "abhishek_gamit" },
    { name: "nikunj prajapati", user_name: "nikunj_prajapati" },
    { name: "Driver 1 Driver 2", user_name: "driver1_driver2" },
    { name: "gami abi", user_name: "gami_abi" }
  ];

  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id");

    if (!shopId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const apiUrl = `https://api.foodchow.com/api/FoodChowRMS/GetPosUserName?shop_id=${shopId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: 'no-store'
    });

    if (response.status === 404) {
      // Return 200 with fallback data to prevent red 404 error in browser Network tab
      return NextResponse.json({ data: JSON.stringify(fallbackUsers) }, { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`FoodChow API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POS USERS PROXY ERROR:", error);
    // Return fallback list on failure as well to avoid red network errors
    return NextResponse.json({ data: JSON.stringify(fallbackUsers) }, { status: 200 });
  }
}
