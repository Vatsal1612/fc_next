
import { foodchowClient, foodchowWDClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import axios from "axios";

export interface RestaurantInformation {
  shop_id: number | null;
  shop_name: string;
  first_name: string;
  last_name: string;
  email_id: string;
  owner_eamil: string;
  mobileno: string;
  owner_phoneno: string;
  promo_code: string;
  timezone: string;
  subdomain: string;
  shoplogo: string;
  shop_type: string;
  cuisine_type: string;
  business_type_id: string;
  insta_url: string;
}

export interface ShopTypeItem {
  id: number;
  name: string;
}

export interface CuisineTypeItem {
  id: number;
  name: string;
  cuisine_Image?: string;
}

export interface ShopTypesAndCuisine {
  shopTypes: ShopTypeItem[];
  cuisineTypes: CuisineTypeItem[];
}
export interface UpdateShopLogoPayload {
  shop_id: string;
  new_logo: string;
  old_logo_name: string;
}




export interface RestaurantInformation {
  [key: string]: any;
}

export interface RestaurantAddress {
  id: number;
  houseno: string;
  address: string;
  address1: string;
  country: string;
  state: string;
  city: string;
  area: string;
  pincode: string;
  latitude: string;
  longitude: string;
}

export interface SaveOwnerInformationPayload {
  shop_id: string;
  firstName: string;
  lastName: string;
  owner_email: string;
  phoneno: string;
  promo_code: string;
}

export interface UpdateShopProfilePayload {
  shop_id: string;
  shop_name: string;
  email_id: string;
  mobileno: string;
  CountryCode: string;
  timezone: string;
  subdomain: string;
  shoplogo: string;
  business_type_id: number;
  cuisine_type: string;
  shop_type: string;
  insta_url: string;
}

export interface UpdateShopAddressPayload {
  id: number;
  houseno: string;
  address: string;
  address1: string;
  country: string;
  state: string;
  city: string;
  area: string;
  pincode: string;
  latitude: string;
  longitude: string;
}

export interface UpdateShopTimingsPayload {
  shop_id: number;
  partner_id: number;
  lstShopTimings: ShopTimingPayload[];
}

export interface ShopTimingPayload {
  id?: number;
  shop_id?: number;
  days_name: string;
  open_time1: string;
  close_time1: string;
  open_time2: string;
  close_time2: string;
  open_time3: string;
  close_time3: string;
  close_day: number;
  Hrs_Day: number;
  timings: boolean;
}

export const restaurantService = {
  async getRestaurantInformation(
    shopId: number,
  ): Promise<RestaurantInformation | null> {
    const { data } = await foodchowClient.get<
      ApiResponse<RestaurantInformation>
    >(ENDPOINTS.setup.getRestaurantInformation, {
      params: {
        shop_id: shopId,
      },
    });

    return data.data ?? null;
  },
  // async updateShopLogo(payload: UpdateShopLogoPayload) {
  //   const { data } = await foodchowClient.post(
  //     ENDPOINTS.setup.updateShopLogo,
  //     payload
  //   );

  //   return data;
  // },
  async updateShopLogo(payload: UpdateShopLogoPayload) {
    try {
      const { data } = await foodchowClient.post(
        ENDPOINTS.setup.updateShopLogo,
        payload
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Status:", error.response?.status);
        console.log("Validation Errors:", error.response?.data?.errors);
        console.log("Full Response:", error.response?.data);
        console.log(JSON.stringify(error.response?.data.errors, null, 2));
      }

      throw error;
    }
  }
};



export const setupService = {

  /**
   * Restaurant Information
   */
  async getShopTypesAndCuisine(): Promise<ShopTypesAndCuisine> {
    const { data } = await foodchowClient.get<
      ApiResponse<ShopTypesAndCuisine>
    >(ENDPOINTS.setup.getShopTypesAndCuisine);

    return {
      shopTypes: data.data?.shopTypes ?? [],
      cuisineTypes: data.data?.cuisineTypes ?? [],
    };
  },

  async getRestaurantInformation(shopId: number) {
    const { data } = await foodchowClient.get<
      ApiResponse<RestaurantInformation>
    >(
      ENDPOINTS.setup.getRestaurantInformation,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    return data.data;
  },

  /**
   * Restaurant Address
   */
  async getRestaurantAddress(shopId: number): Promise<RestaurantAddress[]> {
    const { data } = await foodchowClient.get<
      ApiResponse<RestaurantAddress[]>
    >(
      ENDPOINTS.setup.getRestaurantAddress,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    return data.data ?? [];
  },

  /**
   * Save Owner Information
   */
  async saveOwnerInformation(
    payload: SaveOwnerInformationPayload
  ) {
    console.log("SaveOwnerInformation Payload");
    console.log(payload);
    try {
      const { data } = await foodchowClient.post(
        ENDPOINTS.setup.saveOwnerInformation,
        payload
      );
      console.log("API Success");
      console.log(data);
      return data;
    } catch (error: any) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log("Validation Errors:", error.response?.data?.errors);
      console.log(error.response?.data?.errors["$.shop_id"]);

      throw error;
    }


  },

  async updateShopProfile(payload: UpdateShopProfilePayload) {

    console.log("UpdateShopProfile Payload");
    console.log(payload);

    try {
      const { data } = await foodchowClient.post(
        ENDPOINTS.setup.updateShopProfile,
        payload
      );

      console.log("Update Success");
      console.log(data);

      return data;

    } catch (error: any) {

      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      // console.log("Errors:", error.response?.data?.errors);
      console.log(JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  /**
   * Update Shop Address
   */
  async updateShopAddress(
    payload: UpdateShopAddressPayload
  ) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.setup.updateShopAddress,
      payload
    );

    return data;
  },

  async getGalleryImages(shopId: number) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.setup.getGalleryImages,
      {
        params: {
          ShopId: shopId,
          ImageFlag: 2,
          LastId: 0,
        },
      }
    );

    return data;
  },

  async uploadGalleryImage(payload: any) {

    const { data } = await axios.post(
      "https://www.foodchow.com/rms_phpservices/upload_image_flutter.php",
      new URLSearchParams(payload)
    );

    return data;
  },

  //Delivery Zone
  async getAllZones(shopId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.getAllDeliveryZone,
      {
        params: {
          shopId,
        },
      }
    );

    console.log("GET ALL ZONES RESPONSE:", data);

    return data;
  },
  async addDileveryZone(payload: {
    shopId: string;
    latArray: string[];
    longArray: string[];
    zone: string;
    shape: string;
    amt: string;
    fees: string;
    col: string;
    deliveryHours: string;
    deliveryMinute: string;
    freeDelivery: string;
    radius: string;
  }) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.setup.addDeliveryZone,
      payload
    );

    console.log("SELECT ZONE RESPONSE:", data);

    return data;
  },
  async updateDeliveryZone(payload: any) {
    const response = await foodchowClient.put(
      ENDPOINTS.setup.updateDeliveryZone,
      payload
    );

    return response.data;
  },

  // Timings 
  async getShopTimings(shopId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.getRestaurantTimings,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    return data;
  },
  async updateShopTimings(payload: UpdateShopTimingsPayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.setup.updateRestaurantTimings,
      payload
    );

    console.log("UPDATE SHOP TIMINGS RESPONSE:", data);

    return data;
  },

  // Facility
  async getFacilityList() {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.setup.getFacilityList
    );

    console.log("GET FACILITY LIST RESPONSE:", data);

    return data;
  },

  async getShopFacilities(shopId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.getShopFacilities,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    console.log("GET SHOP FACILITIES RESPONSE:", data);

    return data;
  },

  async addShopFacilities(shopId: number, facilityId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.addShopFacilities,
      {
        params: {
          shop_id: shopId,
          facility_id: facilityId,
        },
      }
    );

    console.log("ADD SHOP FACILITY RESPONSE:", data);

    return data;
  },

  async deleteShopFacilities(shopId: number, facilityId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.deleteShopFacilities,
      {
        params: {
          shop_id: shopId,
          facility_id: facilityId,
        },
      }
    );

    console.log("DELETE SHOP FACILITY RESPONSE:", data);

    return data;
  },

  async addShopFacilitiesRequest(shopId: number, request: string) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.setup.addShopFacilitiesRequest,
      {
        params: {
          shop_id: shopId,
          request,
        },
      }
    );

    console.log("ADD FACILITY REQUEST RESPONSE:", data);

    return data;
  },




};