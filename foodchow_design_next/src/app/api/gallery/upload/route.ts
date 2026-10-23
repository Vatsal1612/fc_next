import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shop_id,
      imageflag = "2",
      photo_0,
      caption = "gallery_image.jpg",
      device_type = "1",
      user_type = "1",
      photo_count = "1",
      user_type_id,
    } = body;

    if (!shop_id) {
      return NextResponse.json(
        { response_code: 0, message: "shop_id is required" },
        { status: 400 }
      );
    }

    if (!photo_0) {
      return NextResponse.json(
        { response_code: 0, message: "photo_0 (image base64) is required" },
        { status: 400 }
      );
    }

    // Prepare payload for FoodChow gallery upload endpoint
    const cleanBase64 = String(photo_0).replace(/^data:image\/[a-z]+;base64,/, "");

    const formParams = new URLSearchParams({
      shop_id: String(shop_id),
      device_type: String(device_type),
      imageflag: String(imageflag),
      user_type: String(user_type === "4" ? "1" : (user_type || "1")),
      photo_count: String(photo_count),
      photo_0: cleanBase64,
      user_type_id: String(user_type_id || shop_id),
      caption: String(caption),
    });

    const response = await fetch(
      "https://www.foodchow.com/rms_phpservices/upload_image_flutter.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formParams.toString(),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Gallery upload error in Next.js API route:", error);
    return NextResponse.json(
      { response_code: 0, message: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
