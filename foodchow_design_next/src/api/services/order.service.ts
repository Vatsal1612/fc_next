import { foodchowClient, foodchowWDClient } from "@/api/client";
import { ENDPOINTS } from "../endpoints";

export interface MenuType {
    id: number;
    menu_name: string;
    shop_id: number;
    order_online: number;
    for_online: number;
    for_pos: number;
}

export interface OrderingMethod {
    id: number;
    delivery_method_name: string;
}

export interface PaymentMethod {
    id: number;
    method_name: string;
}

export interface SelectedPaymentMethod {
    payment_method_id: number;
    payment_method: string;
}


export interface OrderMethodStatus {
    id: number;
    menu_id: number;
    shop_id: number;
    order_method_id: number;

    method_status: number;
    preorder_status: number;
    order_approval: number;

    prep_time: string | null;

    custom_notes: string | null;

    email_notify: number;
    other_email: string | null;
    other_email_verify: number;

    token_enable: number;
    token_start_from: number;

    email_notify_customer: number;

    custom_label_method: string | null;

    order_method_charge_label: string | null;
    order_method_charge_amount: string | null;

    min_order_amount: string | null;
}

export interface UserOptionDetails {
    id: number;

    first_name: string;
    last_name: string;
    email: string;
    phone_no: string;

    shop_id: string;
}

export interface OnlineOrderStatus {
    id: number;
    shop_id: number;
    b_hours_settings: number;
    online_ordering: number; // 1 = ON, 0 = OFF
    pre_order: number;
    shop_delivery_option: string;
}

export interface MissedOrderTiming {
    missed_order_min: string;
}

export interface WidgetSettings {
    id: number;
    shop_id: number;
    email_required: number;
    email_compulsary: number;
    color_picker: string;
    email_verified: number;
    otp_verified: number;
    widget_setting: string | null;
    website_color: string;
    missed_order_min: string;
    table_reservation_status: number;
    shop_delivery_option: string;
    category_view: number;
    title: string | null;
    description: string | null;
}

export interface LalamoveMarketItem {
    country: string;
}

export interface LalamoveMarketResponse {
    $id?: string;
    result?: LalamoveMarketItem[];
    message?: string;
    messageType?: number;
    status?: boolean;
}

export interface LalamoveDetailItem {
    id?: number;
    shop_id?: number | string;
    ShopId?: number | string;
    country?: string;
    Country?: string;
    api_key?: string;
    apiKey?: string;
    ApiKey?: string;
    api_secret?: string;
    apiSecret?: string;
    ApiSecret?: string;
    delivery_process?: string;
    DeliveryProcess?: string;
    process?: string;
    [key: string]: any;
}

export interface LalamoveDetailResponse {
    $id?: string;
    result?: LalamoveDetailItem[] | LalamoveDetailItem | string;
    data?: LalamoveDetailItem[] | LalamoveDetailItem | string;
    message?: string;
    messageType?: number;
    status?: boolean;
}

export interface SaveLalamovePayload {
    ApiKey: string;
    ApiSecret: string;
    country: string;
    shopId: number;
    t1: string;
    delivery_process_lala: string;
    lalamovebaseurl: string;
}

export interface SaveLalamoveResponse {
    $id?: string;
    message?: string;
    messageType?: number;
    status?: boolean;
    response_code?: string;
    data?: any;
}

export interface PorterDetailItem {
    id?: number;
    shop_id?: number | string;
    ShopId?: number | string;
    api_key?: string;
    apiKey?: string;
    ApiKey?: string;
    delivery_process?: string;
    DeliveryProcess?: string;
    process?: string;
    [key: string]: any;
}

export interface PorterDetailResponse {
    $id?: string;
    result?: PorterDetailItem[] | PorterDetailItem | string;
    data?: PorterDetailItem[] | PorterDetailItem | string;
    message?: string;
    messageType?: number;
    status?: boolean;
}

export interface SavePorterPayload {
    ApiKey: string;
    shopId: number;
    t1: string;
    delivery_process: string;
    porterbaseurl: string;
}

export interface SavePorterResponse {
    $id?: string;
    message?: string;
    messageType?: number;
    status?: boolean;
    response_code?: string;
    data?: any;
}

export const orderService = {
    async fetchMenuTypes(shopId: number): Promise<MenuType[]> {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.fetchMenuTypes,
            {
                params: {
                    ShopId: shopId,
                },
            }
        );

        console.log("Menu Types API:", data);

        console.log(data);

        if (typeof data.data === "string") {
            const menus = JSON.parse(data.data);

            console.log(menus);
            return JSON.parse(data.data);
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },
    async fetchOrderingMethods(): Promise<OrderingMethod[]> {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.fetchOrderingMethods
        );

        console.log("Ordering Methods API:", data);

        if (typeof data.data === "string") {
            return JSON.parse(data.data);
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchPaymentMethods(): Promise<PaymentMethod[]> {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.fetchPaymentMethods
        );

        console.log("Payment Methods API:", data);

        if (typeof data.data === "string") {
            return JSON.parse(data.data);
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    // async fetchSelectedPaymentMethods(
    //     shopId: number,
    //     orderMethodId: number,
    //     menuId: number
    // ): Promise<SelectedPaymentMethod[]> {

    //     const { data } = await foodchowRMSClient.get(
    //         ENDPOINTS.orders.fetchSelectedPaymentMethods,
    //         {
    //             params: {
    //                 shop_id: shopId,
    //                 order_method_id: orderMethodId,
    //                 menu_id: menuId,
    //             },
    //         }
    //     );

    //     console.log("Selected Payment API:", data);

    //     console.log("fetchSelectedPaymentMethods response:", data);
    //     console.log("data.data =", data.data);
    //     if (typeof data.data === "string") {
    //         return JSON.parse(data.data);
    //     }

    //     if (Array.isArray(data.data)) {
    //         return data.data;
    //     }

    //     return [];
    // },
    // async fetchOrderMethodStatus(
    //     shopId: number,
    //     orderMethodId: number,
    //     menuId: number
    // ): Promise<OrderMethodStatus | null> {

    //     const { data } = await foodchowRMSClient.get(
    //         ENDPOINTS.orders.fetchOrderMethodStatus,
    //         {
    //             params: {
    //                 shop_id: shopId,
    //                 order_method_id: orderMethodId,
    //                 menu_id: menuId,
    //             },
    //         }
    //     );

    //     console.log("Order Method Status API:", data);

    //     // let result = [];
    //     let result: OrderMethodStatus[] = [];

    //     console.log("fetchOrderMethodStatus response:", data);
    //     console.log("data.data =", data.data);
    //     if (typeof data.data === "string") {
    //         result = JSON.parse(data.data);
    //     } else if (Array.isArray(data.data)) {
    //         result = data.data;
    //     }

    //     return result.length > 0 ? result[0] : null;
    // },

    // Update fetchSelectedPaymentMethods
    async fetchSelectedPaymentMethods(
        shopId: number,
        orderMethodId: number,
        menuId: number
    ): Promise<SelectedPaymentMethod[]> {
        try {
            const { data } = await foodchowWDClient.get(
                ENDPOINTS.orders.fetchSelectedPaymentMethods,
                {
                    params: {
                        shop_id: shopId,
                        order_method_id: orderMethodId,
                        menu_id: menuId,
                    },
                }
            );

            console.log("Selected Payment API:", data);

            // Check if data.data exists and is not empty
            if (!data || !data.data) {
                console.log("No payment methods found for this menu/method combination");
                return [];
            }

            // If data.data is a string, try to parse it
            if (typeof data.data === "string") {
                // Check if string is empty or just whitespace
                if (!data.data.trim()) {
                    console.log("Empty string response");
                    return [];
                }

                try {
                    return JSON.parse(data.data);
                } catch (parseError) {
                    console.error("Failed to parse payment methods JSON:", parseError);
                    return [];
                }
            }

            if (Array.isArray(data.data)) {
                return data.data;
            }

            return [];
        } catch (error) {
            console.error("Error fetching selected payment methods:", error);
            return [];
        }
    },

    // Update fetchOrderMethodStatus
    async fetchOrderMethodStatus(
        shopId: number,
        orderMethodId: number,
        menuId: number
    ): Promise<OrderMethodStatus | null> {
        try {
            const { data } = await foodchowWDClient.get(
                ENDPOINTS.orders.fetchOrderMethodStatus,
                {
                    params: {
                        shop_id: shopId,
                        order_method_id: orderMethodId,
                        menu_id: menuId,
                    },
                }
            );

            console.log("Order Method Status API:", data);

            // Check if data.data exists and is not empty
            if (!data || !data.data) {
                console.log("No order method status found for this menu/method combination");
                return null;
            }

            let result: OrderMethodStatus[] = [];

            if (typeof data.data === "string") {
                // Check if string is empty or just whitespace
                if (!data.data.trim()) {
                    console.log("Empty string response for order method status");
                    return null;
                }

                try {
                    result = JSON.parse(data.data);
                } catch (parseError) {
                    console.error("Failed to parse order method status JSON:", parseError);
                    return null;
                }
            } else if (Array.isArray(data.data)) {
                result = data.data;
            }

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Error fetching order method status:", error);
            return null;
        }
    },
    async fetchUserOptionDetails(
        shopId: number
    ): Promise<UserOptionDetails | null> {

        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.fetchUserOptionDetails,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("User Option Details API:", data);

        // let result = [];
        let result: UserOptionDetails[] = [];

        if (typeof data.data === "string") {
            result = JSON.parse(data.data);
        } else if (Array.isArray(data.data)) {
            result = data.data;
        }

        return result.length > 0 ? result[0] : null;
    },
    async fetchOnlineOrderStatus(
        shopId: number
    ): Promise<OnlineOrderStatus | null> {

        const { data } = await foodchowClient.get(
            ENDPOINTS.orders.fetchOnlineOrderStatus,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Online Order Status API:", data);

        let result: OnlineOrderStatus[] = [];

        if (typeof data.data === "string") {
            result = JSON.parse(data.data);
        } else if (Array.isArray(data.data)) {
            result = data.data;
        }

        return result.length > 0 ? result[0] : null;
    },

    async fetchMissedOrderTiming(
        shopId: number
    ): Promise<MissedOrderTiming | null> {

        const { data } = await foodchowClient.get(
            ENDPOINTS.orders.fetchMissedOrderTiming,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Missed Order Timing API:", data);

        let result: MissedOrderTiming[] = [];

        if (typeof data.data === "string") {
            result = JSON.parse(data.data);
        } else if (Array.isArray(data.data)) {
            result = data.data;
        }

        return result.length > 0 ? result[0] : null;
    },
    async assignPaymentMethod(
        shopId: number,
        orderMethodId: number,
        paymentMethodId: number,
        menuId: number
    ) {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.assignPaymentMethod,
            {
                params: {
                    shop_id: shopId,
                    order_method_id: orderMethodId,
                    payment_method_id: paymentMethodId,
                    menu_id: menuId,
                },
            }
        );

        console.log("Assign Payment Method:", data);

        return data;
    },

    async deAssignPaymentMethod(
        shopId: number,
        orderMethodId: number,
        paymentMethodId: number,
        menuId: number
    ) {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.deAssignPaymentMethod,
            {
                params: {
                    shop_id: shopId,
                    order_method_id: orderMethodId,
                    payment_method_id: paymentMethodId,
                    menu_id: menuId,
                },
            }
        );

        console.log("DeAssign Payment Method:", data);

        return data;
    },
    // In order.service.ts - Update the updateOrderMethodFlag function
    async updateOrderMethodFlag(
        shopId: number,
        orderMethodId: number,
        menuId: number,
        value: string | number,
        flag: string
    ) {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.updateOrderMethodFlag,
            {
                params: {
                    shop_id: shopId,
                    order_method_id: orderMethodId,
                    method_status: value,
                    menu_id: menuId,
                    flag: flag,
                },
            }
        );

        console.log("Update Order Method Flag:", data);
        return data;
    },
    async updateUserOption(
        shopId: number,
        id: "f_name" | "l_name" | "phone_no",
        checked: boolean
    ) {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.updateUserOption,
            {
                params: {
                    shop_id: shopId,
                    id,
                    is_checked: checked ? 1 : 0,
                },
            }
        );

        console.log("Update User Option", data);

        return data;
    },
    async setOnlineOrderStatus(
        shopId: number,
        checked: boolean
    ) {
        const { data } = await foodchowClient.get(
            ENDPOINTS.orders.setOnlineOrderStatus,
            {
                params: {
                    shop_id: shopId,
                    status: checked ? 1 : 0,
                },
            }
        );

        console.log("Online Order Status", data);

        return data;
    },
    async setMissedOrderTime(
        shopId: number,
        timing: number
    ) {
        const { data } = await foodchowClient.get(
            ENDPOINTS.orders.setMissedOrderTime,
            {
                params: {
                    shop_id: shopId,
                    timing,
                },
            }
        );

        console.log("Missed Order Time", data);

        return data;
    },
    async updateDeliveryMethod(
        shopId: number,
        option: string
    ) {
        const { data } = await foodchowClient.get(
            ENDPOINTS.orders.updateDeliveryMethod,
            {
                params: {
                    shop_id: shopId,
                    shop_delivery_option: option,
                },
            }
        );

        console.log("Delivery Method", data);

        return data;
    },

    // Widget Settings
    async fetchWidgetSettings(
        shopId: number
    ): Promise<WidgetSettings | null> {

        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.getWidgetSettings,
            {
                params: {
                    shpid: shopId,
                },
            }
        );

        console.log("Widget Settings API:", data);

        let result: WidgetSettings[] = [];

        if (typeof data.data === "string") {
            result = JSON.parse(data.data);
        } else if (Array.isArray(data.data)) {
            result = data.data;
        }

        return result.length > 0 ? result[0] : null;
    },

    async updateWidgetSettings(
        shopId: number,
        status: number,
        flag: number
    ) {
        const { data } = await foodchowWDClient.get(
            ENDPOINTS.orders.updateWidgetSettings,
            {
                params: {
                    shop_id: shopId,
                    status,
                    flag,
                },
            }
        );

        return data;
    },

    async updateColorPickerWidgetSetting(
        shopId: number,
        colorPicker: string
    ) {
        const { data } = await foodchowWDClient.post(
            ENDPOINTS.orders.updateColorPickerWidgetSettings,
            {
                shop_id: shopId,
                color_picker: colorPicker,
            }
        );

        return data;
    },

    async getLalaMoveMarket(): Promise<LalamoveMarketItem[]> {
        const { data } = await foodchowWDClient.get<LalamoveMarketResponse>(
            ENDPOINTS.orders.getLalaMoveMarket
        );

        if (data && Array.isArray(data.result)) {
            return data.result;
        }

        return [];
    },

    async getLalamoveDetail(shopId: number): Promise<LalamoveDetailItem | null> {
        const { data } = await foodchowWDClient.get<LalamoveDetailResponse>(
            ENDPOINTS.orders.getLalaMoveWD,
            {
                params: {
                    ShopId: shopId,
                },
            }
        );

        console.log("Lalamove Detail API response:", data);

        let list: LalamoveDetailItem[] = [];

        if (data) {
            const rawResult = data.result ?? data.data;
            if (typeof rawResult === "string" && rawResult.trim()) {
                try {
                    list = JSON.parse(rawResult);
                } catch (e) {
                    console.error("Failed to parse Lalamove details JSON:", e);
                }
            } else if (Array.isArray(rawResult)) {
                list = rawResult;
            } else if (rawResult && typeof rawResult === "object") {
                return rawResult as LalamoveDetailItem;
            }
        }

        return list.length > 0 ? list[0] : null;
    },

    async saveLalamoveData(payload: SaveLalamovePayload): Promise<SaveLalamoveResponse> {
        const { data } = await foodchowWDClient.post<SaveLalamoveResponse>(
            ENDPOINTS.orders.saveLalaMoveData,
            payload
        );
        return data;
    },

    async getPorterDetail(shopId: number): Promise<PorterDetailItem | null> {
        const { data } = await foodchowWDClient.get<PorterDetailResponse>(
            ENDPOINTS.orders.getPorterDetailWD,
            {
                params: {
                    ShopId: shopId,
                },
            }
        );

        console.log("Porter Detail API response:", data);

        let list: PorterDetailItem[] = [];

        if (data) {
            const rawResult = data.result ?? data.data;
            if (typeof rawResult === "string" && rawResult.trim()) {
                try {
                    list = JSON.parse(rawResult);
                } catch (e) {
                    console.error("Failed to parse Porter details JSON:", e);
                }
            } else if (Array.isArray(rawResult)) {
                list = rawResult;
            } else if (rawResult && typeof rawResult === "object") {
                return rawResult as PorterDetailItem;
            }
        }

        return list.length > 0 ? list[0] : null;
    },

    async savePorterData(payload: SavePorterPayload): Promise<SavePorterResponse> {
        const { data } = await foodchowWDClient.post<SavePorterResponse>(
            ENDPOINTS.orders.savePorterData,
            payload
        );
        return data;
    },
};