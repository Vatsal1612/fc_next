import { adminFoodchowClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export interface Coupon {
  id: number;
  shop_id: number;
  type: string;
  description: string;
  applyon: number;
  couponcode: string;
  discount_in: number;
  discount: number;
  availability: number;
  status: number;
  min_order_amount: string;
  auto_apply: number;
  specific_to: number;
  order_method: string;
  category_list: string | null;
}

interface CouponApiResponse {
  message: string;
  data: string;
  count: string;
  response_code: string;
}

export interface CouponItem {
  category_id: number;
  item_id: number;
}

export interface AddCouponPayload {
  id: number;
  shop_id: string;
  type: string;
  description: string;
  applyon: number;
  couponcode: string;
  expires: string;
  discount_in: number;
  discount: string;
  availability: number;
  status: number;
  min_order_amount: string;
  auto_apply: number;
  specific: number;
  is_online: number;
  order_method: string;
  items: CouponItem[] | null;
}

export const marketingService = {
  async getCoupons(shopId: number): Promise<Coupon[]> {
    const { data } = await adminFoodchowClient.get<CouponApiResponse>(
      ENDPOINTS.marketing.getCoupons,
      { params: { Shop_Id: shopId } }
    );
    return data.data ? JSON.parse(data.data) : [];
  },

  async addCoupon(payload: AddCouponPayload) {
    const { data } = await adminFoodchowClient.post<{ response_code: string; message: string }>(
      ENDPOINTS.marketing.addCoupon,
      payload
    );
    return data;
  },

  async updateCoupon(payload: AddCouponPayload) {
    const { data } = await adminFoodchowClient.post<{ response_code: string; message: string }>(
      ENDPOINTS.marketing.updateCoupon,
      payload
    );
    return data;
  },

  async deleteCoupon(shopId: number, couponId: number) {
    const { data } = await adminFoodchowClient.get<{ response_code: string; message: string }>(
      ENDPOINTS.marketing.deleteCoupon,
      { params: { Shop_id: shopId, Id: couponId } }
    );
    return data;
  },

  async updateCouponStatus(couponId: number, shopId: number, status: number) {
    const { data } = await adminFoodchowClient.get<{ response_code: string; message: string }>(
      ENDPOINTS.marketing.updateCouponStatus,
      { params: { Id: couponId, Shop_Id: shopId, Status: status } }
    );
    return data;
  },
};