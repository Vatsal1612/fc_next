import { foodchowRMSClient, adminFoodchowClient, foodchowClient } from "@/api/client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "@/api/types";

export interface NetSalesByVatItem {
    label: string;
    netSales: number;
    percentage: number;
    taxType: number;
}

export interface VatAmountItem {
    label: string;
    vatAmount: number;
    percentage: number;
    taxType: number;
}

export interface FiscalDailyReportItem {
    reportNumber: number;
    reportDate: string;
    salesStartTime: string;
    salesEndTime: string;
    netSalesByVat: NetSalesByVatItem[];
    vatAmount: VatAmountItem[];
    totalVat: number;
    grossSales: number;
    referenceCurrency: string;
}

export interface FiscalDailyReportResponse {
    dailyReports?: FiscalDailyReportItem[];
    [key: string]: any;
}

export interface VatRateItem {
    letter?: string;
    label?: string;
    percentage?: number;
    taxType?: number;
}

export interface SalesSummaryItem {
    label?: string;
    netSales?: number;
    percentage?: number;
    taxType?: number;
}

export interface VatCollectedItem {
    label?: string;
    vatAmount?: number;
    percentage?: number;
    taxType?: number;
}

export interface ReportInformation {
    shopId?: number | string;
    month?: number | string;
    year?: number | string;
    reportGeneratedDateTime?: string;
    periodStart?: string;
}

export interface MonthlyTotals {
    totalNetSales?: number;
    totalVat?: number;
    totalGrossSales?: number;
    referenceCurrency?: string;
}

export interface MonthlyEvents {
    emergencyEvents?: number;
    positioningOperations?: number;
    programmingOperations?: number;
    baseChanges?: number;
    cancellations?: number;
    fiscalInspections?: number;
    memoryModuleWorkPeriods?: number;
    memoryModuleFailures?: number;
}

export interface MonthlySummary {
    totalSales?: number;
    totalVatCollected?: number;
    salesByVatRate?: any[];
    vatExemptSales?: number;
}

export interface FiscalMonthlyReportData {
    reportInformation?: ReportInformation;
    vatRates?: VatRateItem[];
    salesSummary?: SalesSummaryItem[];
    vatCollected?: VatCollectedItem[];
    totals?: MonthlyTotals;
    events?: MonthlyEvents;
    summary?: MonthlySummary;
    [key: string]: any;
}

export interface WeightedAverageTransaction {
    delivery_method_name?: string;
    total_amount?: number;
    total_orders?: number;
    weighted_average_transaction?: number;
    [key: string]: any;
}

export interface Customer {
    user_name: string;
    mobile_number: string;
}

export interface CRMRevenueCustomer {
    order_id: string;
    total_amount: number;
    name: string;
    mobile_no: string;
}

export interface WeekComparison {
    data: string;
    current_week: number | null;
    previous_week: number | null;
}

export interface TopSellingItem {
    trans_date: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;
    };
    item_name: string;
    total_quantity: number;
    total_amount: number;
    weight: number | null;
    unit: string | null;
    [key: string]: any;
}

export interface TopSellingTodayResponse {
    items: TopSellingItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface TopSellingDayWiseResponse {
    items: TopSellingItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface TopSellingWeekResponse {
    items: TopSellingItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface TopSellingMonthResponse {
    items: TopSellingItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface TopSellingYearResponse {
    items: TopSellingItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface TradingSession {
    trading_session: string;
    trans_date?: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;
    };
    year?: number;
    total_quantity: number;
    total_amount: number;
}

export interface SalesByHour {
    hour_interval: string;
    item_name: string;
    total_quantity: number;
    total_amount: number;
    weight: number | null;
    unit: string | null;
}

export interface PosUser {
    name: string;
    user_name: string;
}

export interface PosEndDayReport {
    // Define based on your API response structure
    // You'll need to adjust this based on the actual response format
    [key: string]: any;
}

export interface SalesByPosUser {
    trans_date?: {
        Day: number;
        Month: number;
        Year: number;
        [key: string]: any;
    };
    pos_order_id?: string;
    name?: string;
    mobile_no?: string;
    payment_method?: string;
    split_payment_method?: string;
    delivery_method_name?: string;
    total_amount?: number;
    [key: string]: any;
}

export interface SalesByPosUserResponse {
    items: SalesByPosUser[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface TotalSalesDateWiseItem {
    trans_date?: {
        isValidDateTime?: boolean;
        year?: number;
        month?: number;
        day?: number;
        hour?: number;
        minute?: number;
        second?: number;
        millisecond?: number;
        microsecond?: number;
        isNull?: boolean;
        value?: string;
        [key: string]: any;
    } | string;
    order_id?: string;
    name?: string;
    order_status?: string;
    pos_order_id?: string;
    charges?: number;
    split_payment_method?: string;
    split_payment?: string;
    mobile_no?: string;
    payment_method?: string;
    delivery_method_name?: string;
    total_quantity?: number;
    total_amount?: number;
    total_tax?: number | string;
    discount?: number;
    full_amount?: number;
    [key: string]: any;
}
export interface TotalSalesDateWiseResponse {
    items: TotalSalesDateWiseItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    dateformat?: string;
}
export interface TaxSummaryResponse {
    items: TaxSummaryItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface TaxSummaryItem {
    taxName?: string;
    amount?: number;
    [key: string]: any;
}
export interface DeclinedOrder {
    trans_date?: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;
    };
    order_id: string;
    name: string;
    pos_order_id: string | null;
    order_status: string;
    split_payment_method: string | null;
    split_payment: string | null;
    mobile_no: string;
    payment_method: string;
    delivery_method_name: string;
    total_quantity: number;
    porter_charge: number | null;
    lalamove_charge: number | null;
    total_amount: number;
    total_tax: number | null;
    discount: number;
    full_amount: number;
    declined_reason: string;
    [key: string]: any;
}
export interface OrderItemDetail {
    item_name: string;
    quantity: number;
    single_price: number;
    total_amount: number;
    weight_unit: string | null;
}
export interface SalesByItemSize {
    item_name?: string;
    total_quantity?: number;
    total_amount?: number;
    [key: string]: any;
}

export interface SalesByItemSizeTodayResponse {
    items: SalesByItemSize[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemSizeDateWiseResponse {
    items: SalesByItemSize[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemSizeWeeklyResponse {
    items: SalesByItemSize[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemSizeMonthlyResponse {
    items: SalesByItemSize[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemSizeYearlyResponse {
    items: SalesByItemSize[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    dateformat?: string;
}




interface APIResponse {
    message: string;
    data: string;
    count: string;
    response_code: string;
}

export interface SalesSummary {
    order_id: string;
    total_amount: number;
    tax_amount: number;
}

export interface SalesRecord {
    trans_date: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;

    };

    order_id: string;
    name: string;
    o_status: string;
    charges: number;

    split_payment_method: string | null;
    split_payment: string | null;

    mobile_no: string;

    payment_method: string;
    delivery_method_name: string;

    total_amount: number;
    total_tax: number | null;
    tax_amount?: number;

    discount: number;
    full_amount: number;

    pos_order_id: string | null;
    total_quantity?: number;
    delivery_charge?: number;
}
export interface IngredientRecord {
    item_name: string;
    total_quantity: number;
    total_amount: number;
}

export interface InvoiceDetails {
    trans_date: SalesRecord["trans_date"];
    order_id: string;
    tax_reg_no: string;
    name: string;
    order_paid_status: number;
    discount: number;
    charges: number;
    mobile_no: string;
    payment_method: string;
    delivery_method_name: string;
    shop_name: string;
    shop_email: string;
    shop_address: string;
    shop_area: string;
    shop_city: string;
    shop_state: string;
    shop_country: string;
    total_amount: number;
    pos_order_id: string | null;
}

export interface InvoiceOrderedItem {
    Item_Name: string;
    Item_Size?: string;
    Quantity: number;
    Single_Price: number;
    Amount: number;
}

// export interface InvoiceItemListEntry {
//   Order_Id: string;
//   Total_Amount: number;
//   Payment_Method: string;
//   Trans_Date: string;
//   OrderedItemList: InvoiceOrderedItem[];
// }

export interface InvoiceItemListEntry {
    Order_Id: string;
    Amount?: number;           // subtotal
    Charges?: number;
    Payment_Charges?: number;  // ← this is the "Payment Charges" row
    Total_Amount: number;
    Payment_Method: string;
    Trans_Date: string;
    OrderedItemList: InvoiceOrderedItem[];
}


// getOrderedItemList's payload is nested one level deeper than the other endpoints.

export interface RefundRecord {
    trans_date: SalesRecord["trans_date"];
    order_id: string;
    name: string;
    mobile_no: string;
    payment_method: string;
    delivery_method_name: string;
    refund_amount: number;
    reason: string;
}
export interface MonthComparisonItem {
    data: string;
    current_month: number | null;
    previous_month: number | null;
}
export interface OrderMethodRecord {
    order_date: SalesRecord["trans_date"];
    Dine_In: number;
    Home_Delivery: number;
    Take_Away: number;
    total: number;
}

const parseData = <T>(data: string): T[] => {
    if (!data) return [];

    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
};

function parseResponseData<T>(
    data: any,
    reportName: string
): T[] {

    if (!data) {
        return [];
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (!data.data) {
        return [];
    }

    if (typeof data.data === "string") {
        try {

            if (!data.data.trim()) {
                return [];
            }

            return JSON.parse(data.data);

        } catch (e) {

            console.error(`Error parsing ${reportName}:`, e);
            console.log("Raw API Response:", data.data);

            return [];
        }
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}





export interface PaginatedTradingSessionResult {
    records: TradingSession[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedCustomerResult {
    records: Customer[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedCRMRevenueResult {
    records: CRMRevenueCustomer[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedPosEndDayReportResult {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalAmount: number;
    dateformat: string;
    items: PosEndDayReport[];
}

export interface PaginatedSalesResult {
    records: SalesRecord[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedIngredientsResult {
    records: IngredientRecord[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface PaginatedRefundResult {
    records: RefundRecord[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface ProductWiseComparison {
    item_name: string;
    previous_quantity?: number;
    current_quantity?: number;
    previous_day_quantity?: number;
    current_day_quantity?: number;
    previous_week_quantity?: number;
    current_week_quantity?: number;
    previous_month_quantity?: number;
    current_month_quantity?: number;
    previous_year_quantity?: number;
    current_year_quantity?: number;
}

export interface ProductWiseComparisonPagination {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    dateformat: string;
    items: ProductWiseComparison[];
}

export interface PosTotalSales {
    delivery_method_name: string;
    total_orders: number;
    total_amount: number;
}

export interface IncompletePayment {
    order_id: number;
    customer_name: string;
    mobile_no: string;
    payment_method: string;
    total_amount: number;
    payment_charge: number;
    trans_date: string;
}

export interface OnlinePaymentReport {
    id: number;
    shop_id: string;
    order_id: string;
    charge_id: string;
    amount: number;
    currency: string;
    platform_fee: string;
    foodchowcommision: string;
    status: string;
    shop_account: string;
    shop_transfer_id: string;
    shop_amount: string;
    shop_received_amount: string;
    stripe_fees: string;
    delivery_method: string | null;
    delivery_account: string | null;
    delivery_transfer_id: string | null;
    delivery_amount: string | null;
    balance_trans_id: string;
    payment_method_id: string;

    created_date: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;
    };

    updated_date: {
        TimezoneOffset: number;
        IsValidDateTime: boolean;
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Millisecond: number;
        Microsecond: number;
        IsNull: boolean;
        Value: string;
    };
}
export interface SalesByItem {
    trans_date?: {
        TimezoneOffset?: number;
        IsValidDateTime?: boolean;
        Year?: number;
        Month?: number;
        Day?: number;
        Hour?: number;
        Minute?: number;
        Second?: number;
        Millisecond?: number;
        Microsecond?: number;
        IsNull?: boolean;
        Value?: string;
        isValidDateTime?: boolean;
        year?: number;
        month?: number;
        day?: number;
        hour?: number;
        minute?: number;
        second?: number;
        millisecond?: number;
        microsecond?: number;
        isNull?: boolean;
        value?: string;
        [key: string]: any;
    };

    item_name?: string;
    total_quantity?: number;
    total_amount?: number;
    weight?: string | null;
    unit?: string | null;
    [key: string]: any;
}

export interface SalesByItemTodayResponse {
    items: SalesByItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemDayWiseResponse {
    items: SalesByItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemWeekResponse {
    items: SalesByItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemMonthResponse {
    items: SalesByItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SalesByItemYearResponse {
    items: SalesByItem[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface SalesByCategory {
    trans_date?: {
        TimezoneOffset?: number;
        IsValidDateTime?: boolean;
        Year?: number;
        Month?: number;
        Day?: number;
        Hour?: number;
        Minute?: number;
        Second?: number;
        Millisecond?: number;
        Microsecond?: number;
        IsNull?: boolean;
        Value?: string;
        isValidDateTime?: boolean;
        year?: number;
        month?: number;
        day?: number;
        hour?: number;
        minute?: number;
        second?: number;
        millisecond?: number;
        microsecond?: number;
        isNull?: boolean;
        value?: string;
        [key: string]: any;
    };

    id?: number;
    cate_name?: string;
    year?: number;
    month?: number;
    total_quantity?: number;
    total_amount?: number;
    [key: string]: any;
}
export interface SalesByCategoryPagination {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    dateformat: string;
    items: SalesByCategory[];
}
export interface DailyClosingOrder {
    order_type: string;
    total_order: number;
    total_amount: number;
}

export interface DailyClosingPayment {
    payment_type: string;
    total_amount: number;
}

export interface VoidOrder {
    trans_date?: any;
    order_id?: string;
    name?: string;
    pos_order_id?: string | null;
    order_status?: string;
    split_payment_method?: string | null;
    split_payment?: string | null;
    mobile_no?: string;
    payment_method?: string;
    delivery_method_name?: string;
    total_quantity?: number;
    total_amount?: number;
    total_tax?: number | null;
    discount?: number;
    full_amount?: number;
    declined_reason?: string;
    reason?: string;
    [key: string]: any;
}

export interface VoidOrdersResponse {
    items: VoidOrder[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    dateformat?: string;
}


export interface YearWiseComparison {
    data: string;
    current_year: number | null;
    previous_year: number | null;
}
export const reportsService = {

    async fetchTodayWeightedAverage(
        shopId: number
    ): Promise<WeightedAverageTransaction[]> {

        const { data } = await adminFoodchowClient.get(
            ENDPOINTS.reports.weightedAverageToday,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Today's Weighted Average:", data);

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return parseResponseData<WeightedAverageTransaction>(
            data,
            "Today's Weighted Average"
        );
    },

    async fetchMonthlyWeightedAverage(
        shopId: number,
        month: string,
        year: number
    ): Promise<WeightedAverageTransaction[]> {

        const { data } = await adminFoodchowClient.get(
            ENDPOINTS.reports.weightedAverageMonthly,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year: year,
                },
            }
        );

        console.log("Monthly Weighted Average:", data);

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return parseResponseData<WeightedAverageTransaction>(
            data,
            "Monthly Weighted Average"
        );
    },
    async fetchCustomerList(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedCustomerResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.customerList,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Customer List:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },
    async fetchCRMRevenueReport(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedCRMRevenueResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.crmRevenueReport,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("CRM Revenue Report:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },

    async fetchWeekComparison(
        shopId: number
    ): Promise<WeekComparison[]> {

        const { data } = await adminFoodchowClient.get(
            ENDPOINTS.reports.weekComparison,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Week Comparison:", data);

        if (typeof data?.data === "string") {
            try {
                if (!data.data.trim()) return [];
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing Week Comparison:", e);
                return [];
            }
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data)) {
            return data;
        }

        return parseResponseData<WeekComparison>(data, "Week Comparison");
    },
    async fetchTopSellingToday(
        shopId: number
    ): Promise<TopSellingItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.topSellingToday,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Top Selling Today:", data);

        // if (typeof data.data === "string") {
        //     return JSON.parse(data.data);
        // }

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }

                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing Monthly Weighted Average:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchTopSellingDayWise(
        shopId: number,
        date: string
    ): Promise<TopSellingItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.topSellingDayWise,
            {
                params: {
                    shop_id: shopId,
                    finds_date: date,
                },
            }
        );

        console.log("Top Selling Day Wise:", data);

        // if (typeof data.data === "string") {
        //     return JSON.parse(data.data);
        // }
        if (Array.isArray(data.data)) {
            return data.data;
        }

        // return [];
        return parseResponseData<TopSellingItem>(
            data,
            "Top Selling Day Wise"
        );
    },

    async fetchTopSellingWeek(
        shopId: number
    ): Promise<TopSellingItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.topSellingWeek,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Top Selling Week:", data);

        // if (typeof data.data === "string") {
        //     return JSON.parse(data.data);
        // }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        // return [];
        return parseResponseData<TopSellingItem>(
            data,
            "Top Selling Week"
        );
    },

    async fetchTopSellingMonth(
        shopId: number,
        month: string,
        year: number
    ): Promise<TopSellingItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.topSellingMonth,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year: year,
                },
            }
        );

        console.log("Top Selling Month:", data);

        // if (typeof data.data === "string") {
        //     return JSON.parse(data.data);
        // }


        if (Array.isArray(data.data)) {
            return data.data;
        }

        // return [];
        return parseResponseData<TopSellingItem>(
            data,
            "Top Selling Month"
        );
    },

    async fetchTopSellingYear(
        shopId: number,
        year: number
    ): Promise<TopSellingItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.topSellingYear,
            {
                params: {
                    shop_id: shopId,
                    years: year,
                },
            }
        );

        console.log("Top Selling Year:", data);

        // if (typeof data.data === "string") {
        //     return JSON.parse(data.data);
        // }


        if (Array.isArray(data.data)) {
            return data.data;
        }

        // return [];
        return parseResponseData<TopSellingItem>(
            data,
            "Top Selling Year"
        );
    },
    async fetchTradingSessionToday(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedTradingSessionResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.tradingSessionToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Trading Session Today:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },

    async fetchTradingSessionDayWise(
        shopId: number,
        date: string,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedTradingSessionResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.tradingSessionDayWise,
            {
                params: {
                    shop_id: shopId,
                    find_date: date,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Trading Session Day Wise:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },

    async fetchTradingSessionWeek(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedTradingSessionResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.tradingSessionWeek,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Trading Session Week:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },

    async fetchTradingSessionMonth(
        shopId: number,
        month: string,
        year: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedTradingSessionResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.tradingSessionMonth,
            {
                params: {
                    shop_id: shopId,
                    month: month,
                    year: year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Trading Session Month:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },

    async fetchTradingSessionYear(
        shopId: number,
        year: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedTradingSessionResult> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.tradingSessionYear,
            {
                params: {
                    shop_id: shopId,
                    year: year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Trading Session Year:", data);

        return {
            records: data.data?.items ?? [],
            totalRecords: data.data?.totalRecords ?? 0,
            totalPages: data.data?.totalPages ?? 1,
            currentPage: data.data?.currentPage ?? pageNumber,
            pageSize: data.data?.pageSize ?? pageSize,
        };
    },
    async fetchSalesByHour(
        shopId: number,
        date: string,
        fromTime: string,
        toTime: string
    ): Promise<SalesByHour[]> {
        try {
            const response = await fetch(
                `/api/sales-by-hour?shop_id=${shopId}&find_date=${date}&from_time=${fromTime}&to_time=${toTime}`
            );
            const data = await response.json();

            console.log("Sales By Hour:", data);

            if (Array.isArray(data?.data)) {
                return data.data;
            }
            if (Array.isArray(data)) {
                return data;
            }

            return parseResponseData<SalesByHour>(
                data,
                "Sales By Hour"
            );
        } catch (err: any) {
            console.warn("fetchSalesByHour API call failed:", err?.message || err);
            return [];
        }
    },
    async fetchPosUsers(
        shopId: number
    ): Promise<PosUser[]> {

        const response = await fetch(`/api/pos-users?shop_id=${shopId}`);
        const data = await response.json();

        console.log("POS Users:", data);

        if (typeof data.data === "string") {
            return JSON.parse(data.data);
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchPosEndDayReport(
        shopId: number,
        posUser: string,
        openDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        let data;
        try {
            const response = await fetch(
                `/api/pos-end-day?shop_id=${shopId}&posUser=${encodeURIComponent(posUser)}&open_date=${openDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`
            );
            data = await response.json();
        } catch (error) {
            console.warn("API Error in fetchPosEndDayReport:", error);
            return null;
        }

        console.log("POS End Day Report:", data);

        // Based on your old code, result.data is returned directly
        // and it can be an array or an object
        if (data && data.data) {
            // If data.data is a string, parse it
            if (typeof data.data === "string") {
                try {
                    return JSON.parse(data.data);
                } catch (e) {
                    console.error("Error parsing data:", e);
                    return [];
                }
            }
            // If data.data is already an array or object, return it
            return data.data;
        }

        return [];
    },

    // Update all fetchSalesByPosUser methods with proper error handling

    async fetchSalesByPosUserToday(
        shopId: number,
        posUser: string
    ): Promise<SalesByPosUser[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByPosUserToday,
            {
                params: {
                    shop_id: shopId,
                    posUser: posUser,
                },
            }
        );

        console.log("Sales By POS User Today:", data);

        // Check if data exists

        if (Array.isArray(data.data)) {
            return data.data;
        }

        // return [];
        return parseResponseData<SalesByPosUser>(
            data,
            "Sales By POS User Today"
        );
    },

    async fetchSalesByPosUserWeek(
        shopId: number,
        posUser: string
    ): Promise<SalesByPosUser[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByPosUserWeek,
            {
                params: {
                    shop_id: shopId,
                    posUser: posUser,
                },
            }
        );

        console.log("Sales By POS User Week:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing week data:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByPosUserMonth(
        shopId: number,
        month: string,
        year: number,
        posUser: string
    ): Promise<SalesByPosUser[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByPosUserMonth,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year: year,
                    posUser: posUser,
                },
            }
        );

        console.log("Sales By POS User Month:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing month data:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByPosUserYear(
        shopId: number,
        year: number,
        posUser: string
    ): Promise<SalesByPosUser[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByPosUserYear,
            {
                params: {
                    shop_id: shopId,
                    years: year,
                    posUser: posUser,
                },
            }
        );

        console.log("Sales By POS User Year:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing year data:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByPosUserDateWise(
        shopId: number,
        startDate: string,
        endDate: string,
        posUser: string
    ): Promise<SalesByPosUser[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByPosUserDateWise,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    posUser: posUser,
                },
            }
        );

        console.log("Sales By POS User Date Wise:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing datewise data:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },
    async fetchTaxSummaryToday(
        shopId: number
    ): Promise<TaxSummaryItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.taxSummaryToday,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Tax Summary Today:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing tax summary today:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchTaxSummaryWeekly(
        shopId: number
    ): Promise<TaxSummaryItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.taxSummaryWeekly,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Tax Summary Weekly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing tax summary weekly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchTaxSummaryMonthly(
        shopId: number,
        month: string,
        year: number
    ): Promise<TaxSummaryItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.taxSummaryMonthly,
            {
                params: {
                    shop_id: shopId,
                    month: month,
                    year: year,
                },
            }
        );

        console.log("Tax Summary Monthly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing tax summary monthly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchTaxSummaryYearly(
        shopId: number,
        year: number
    ): Promise<TaxSummaryItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.taxSummaryYearly,
            {
                params: {
                    shop_id: shopId,
                    year: year,
                },
            }
        );

        console.log("Tax Summary Yearly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing tax summary yearly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchTaxSummaryDateWise(
        shopId: number,
        fromDate: string,
        toDate: string
    ): Promise<TaxSummaryItem[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.taxSummaryDateWise,
            {
                params: {
                    shop_id: shopId,
                    from: fromDate,
                    to: toDate,
                },
            }
        );

        console.log("Tax Summary Date Wise:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing tax summary datewise:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchDeclinedOrderToday(
        shopId: number
    ): Promise<DeclinedOrder[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.declinedOrderToday,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Declined Order Today:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing declined order today:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchDeclinedOrderWeekly(
        shopId: number
    ): Promise<DeclinedOrder[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.declinedOrderWeekly,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Declined Order Weekly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing declined order weekly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchDeclinedOrderMonthly(
        shopId: number,
        month: string,
        year: number
    ): Promise<DeclinedOrder[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.declinedOrderMonthly,
            {
                params: {
                    shop_id: shopId,
                    month: month,
                    year: year,
                },
            }
        );

        console.log("Declined Order Monthly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing declined order monthly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchDeclinedOrderYearly(
        shopId: number,
        year: number
    ): Promise<DeclinedOrder[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.declinedOrderYearly,
            {
                params: {
                    shop_id: shopId,
                    year: year,
                },
            }
        );

        console.log("Declined Order Yearly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing declined order yearly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchDeclinedOrderDateWise(
        shopId: number,
        fromDate: string,
        toDate: string
    ): Promise<DeclinedOrder[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.declinedOrderDateWise,
            {
                params: {
                    shop_id: shopId,
                    from: fromDate,
                    to: toDate,
                },
            }
        );

        console.log("Declined Order Date Wise:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing declined order datewise:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },
    async fetchOrderItemDetails(
        orderId: string
    ): Promise<OrderItemDetail[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.orderItemDetails,
            {
                params: {
                    orderid: orderId,
                },
            }
        );

        console.log("Order Item Details:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing order item details:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },
    async fetchSalesByItemSizeToday(
        shopId: number
    ): Promise<SalesByItemSize[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByItemSizeToday,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Sales By Item Size Today:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing sales by item size today:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByItemSizeWeekly(
        shopId: number
    ): Promise<SalesByItemSize[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByItemSizeWeekly,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Sales By Item Size Weekly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing sales by item size weekly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByItemSizeMonthly(
        shopId: number,
        month: string,
        year: number
    ): Promise<SalesByItemSize[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByItemSizeMonthly,
            {
                params: {
                    shop_id: shopId,
                    month: month,
                    year: year,
                },
            }
        );

        console.log("Sales By Item Size Monthly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing sales by item size monthly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByItemSizeYearly(
        shopId: number,
        year: number
    ): Promise<SalesByItemSize[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByItemSizeYearly,
            {
                params: {
                    shop_id: shopId,
                    year: year,
                },
            }
        );

        console.log("Sales By Item Size Yearly:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing sales by item size yearly:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },

    async fetchSalesByItemSizeDateWise(
        shopId: number,
        fromDate: string
    ): Promise<SalesByItemSize[]> {

        const { data } = await foodchowRMSClient.get(
            ENDPOINTS.reports.salesByItemSizeDateWise,
            {
                params: {
                    shop_id: shopId,
                    from: fromDate,
                },
            }
        );

        console.log("Sales By Item Size Date Wise:", data);

        if (!data || !data.data) {
            return [];
        }

        if (typeof data.data === "string") {
            try {
                if (!data.data.trim()) {
                    return [];
                }
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing sales by item size datewise:", e);
                return [];
            }
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    },




    // ---------------- TODAY ----------------

    async getTodaySummary(shopId: number): Promise<SalesSummary[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.todaySummary,
            {
                params: { shop_id: shopId },
            }
        );

        return parseData<SalesSummary>(data.data);
    },

    async getTodaySales(
        shopId: number,
        start = 0,
        end = 10
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.todaySales,
            {
                params: {
                    shop_id: shopId,
                    start,
                    end,
                },
            }
        );

        return parseData<SalesRecord>(data.data);
    },

    // ---------------- WEEK ----------------

    async getWeekSummary(shopId: number): Promise<SalesSummary[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.weekSummary,
            {
                params: { shop_id: shopId },
            }
        );

        return parseData<SalesSummary>(data.data);
    },

    async getWeekSales(
        shopId: number,
        start = 0,
        end = 10
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.weekSales,
            {
                params: {
                    shop_id: shopId,
                    start,
                    end,
                },
            }
        );

        return parseData<SalesRecord>(data.data);
    },

    // ---------------- MONTH ----------------

    async getMonthSummary(
        shopId: number,
        month: string,
        year: string
    ): Promise<SalesSummary[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.monthSummary,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year,
                },
            }
        );

        return parseData<SalesSummary>(data.data);
    },

    async getMonthSales(
        shopId: number,
        month: string,
        year: string,
        start = 0,
        end = 10
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.monthSales,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year,
                    start,
                    end,
                },
            }
        );

        return parseData<SalesRecord>(data.data);
    },

    // ---------------- YEAR ----------------

    async getYearSummary(
        shopId: number,
        year: string
    ): Promise<SalesSummary[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.yearSummary,
            {
                params: {
                    shop_id: shopId,
                    years: year,
                },
            }
        );

        return parseData<SalesSummary>(data.data);
    },

    async getYearSales(
        shopId: number,
        year: string,
        start = 0,
        end = 10
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.yearSales,
            {
                params: {
                    shop_id: shopId,
                    years: year,
                    start,
                    end,
                },
            }
        );

        return parseData<SalesRecord>(data.data);
    },

    // ---------------- CUSTOM DATE ----------------

    async getCustomSummary(
        shopId: number,
        startDate: string,
        endDate: string
    ): Promise<SalesSummary[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.customSummary,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                },
            }
        );

        return parseData<SalesSummary>(data.data);
    },

    async getCustomSales(
        shopId: number,
        startDate: string,
        endDate: string,
        start = 0,
        end = 10
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.customSales,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    start,
                    end,
                },
            }
        );

        return parseData<SalesRecord>(data.data);
    },

    async getTotalSalesByDateWise(
        shopId: number | string,
        startDate: string,
        endDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TotalSalesDateWiseResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.totalSalesDateWise || "/SalesReports/TotalSalesByDateWise",
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );

        const resData = data?.data || data;
        return {
            items: Array.isArray(resData?.items) ? resData.items : [],
            totalRecords: typeof resData?.totalRecords === "number" ? resData.totalRecords : 0,
            totalPages: typeof resData?.totalPages === "number" ? resData.totalPages : 0,
            currentPage: typeof resData?.currentPage === "number" ? resData.currentPage : pageNumber,
            pageSize: typeof resData?.pageSize === "number" ? resData.pageSize : pageSize,
            dateformat: resData?.dateformat,
        };
    },
    // ---------------- ORDER ITEMS (ITEMS modal) ----------------

    async getOrderItemDetails(orderId: string): Promise<OrderItemDetail[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.orderItems,
            {
                params: { orderid: orderId },
            }
        );

        return parseData<OrderItemDetail>(data.data);
    },

    // ---------------- INVOICE (INVOICE modal) ----------------

    async getInvoiceDetails(
        shopId: number,
        orderId: string
    ): Promise<InvoiceDetails[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.invoiceDetails,
            {
                params: { shop_id: shopId, order_id: orderId },
            }
        );

        return parseData<InvoiceDetails>(data.data);
    },
    async getInvoiceItemList(
        shopId: number,
        orderId: string
    ): Promise<InvoiceItemListEntry[]> {
        const response = await adminFoodchowClient.get<any>(
            ENDPOINTS.reports.invoiceItemList,
            {
                params: {
                    ShopId: shopId,
                    order_id: orderId,
                },
            }
        );

        const data = response.data;
        console.log("getOrderedItemList raw response:", data);

        // Handle either casing depending on how the backend / axios client normalizes it.
        const resultBlock = data?.Result ?? data?.result;
        const rawList = resultBlock?.data ?? resultBlock?.Data;

        if (!rawList) {
            console.warn("getOrderedItemList: no data field found in response", data);
            return [];
        }

        return parseData<InvoiceItemListEntry>(rawList);
    },
    async getMonthWiseComparison(
        shopId: number,
        currDate: string
    ): Promise<MonthComparisonItem[]> {
        console.log("currDate =", currDate);

        const { data } = await adminFoodchowClient.get(
            ENDPOINTS.reports.monthWiseComparison,
            {
                params: {
                    shop_id: shopId,
                    curr_date: currDate,
                },
            }
        );

        console.log("Month Comparison API Response =", data);

        if (typeof data?.data === "string") {
            try {
                if (!data.data.trim()) return [];
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing Month Comparison:", e);
                return [];
            }
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data)) {
            return data;
        }

        return parseResponseData<MonthComparisonItem>(data, "Month Comparison");
    },
    async getYearWiseComparison(
        shopId: number
    ): Promise<YearWiseComparison[]> {

        const { data } = await adminFoodchowClient.get(
            ENDPOINTS.reports.yearWiseComparison,
            {
                params: {
                    shop_id: shopId,
                },
            }
        );

        console.log("Year Comparison API Response =", data);

        if (typeof data?.data === "string") {
            try {
                if (!data.data.trim()) return [];
                return JSON.parse(data.data);
            } catch (e) {
                console.error("Error parsing Year Comparison:", e);
                return [];
            }
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data)) {
            return data;
        }

        return parseResponseData<YearWiseComparison>(data, "Year Comparison");
    },
    async getVoidOrdersByToday(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<VoidOrdersResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.voidOrdersToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Void Orders Today API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: VoidOrder[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
            dateformat: responseObj?.dateformat,
        };
    },
    async getVoidOrdersByWeek(
        shopId: number,
        paymentMethod: string = "",
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<VoidOrdersResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.voidOrdersWeek,
            {
                params: {
                    shop_id: shopId,
                    paymentMethod,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Void Orders Week API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: VoidOrder[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
            dateformat: responseObj?.dateformat,
        };
    },
    async getVoidOrdersByMonth(
        shopId: number,
        months: string | number,
        year: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<VoidOrdersResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.voidOrdersMonth,
            {
                params: {
                    shop_id: shopId,
                    months,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Void Orders Month API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: VoidOrder[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
            dateformat: responseObj?.dateformat,
        };
    },
    async getVoidOrdersByYear(
        shopId: number,
        years: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<VoidOrdersResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.voidOrdersYear,
            {
                params: {
                    shop_id: shopId,
                    years,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Void Orders Year API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: VoidOrder[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
            dateformat: responseObj?.dateformat,
        };
    },
    async getVoidOrdersByDateWise(
        shopId: number,
        startDate: string,
        endDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<VoidOrdersResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.voidOrdersDateWise,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Void Orders DateWise API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: VoidOrder[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
            dateformat: responseObj?.dateformat,
        };
    },

    async getTodaySalesByCategory(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByCategoryPagination | null> {
        const { data } = await foodchowClient.get<ApiResponse<any>>(
            ENDPOINTS.reports.salesByCategoryToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );
        if (!data.data || typeof data.data !== "object") {
            return null;
        }
        return data.data;
    },

    async getDayWiseSalesByCategory(
        shopId: number,
        selectedDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByCategoryPagination | null> {
        const { data } = await foodchowClient.get<ApiResponse<any>>(
            ENDPOINTS.reports.salesByCategoryDayWise,
            {
                params: {
                    shop_id: shopId,
                    search_date: selectedDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getWeekSalesByCategory(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByCategoryPagination | null> {
        const { data } = await foodchowClient.get<ApiResponse<any>>(
            ENDPOINTS.reports.salesByCategoryWeek,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );
        if (!data.data || typeof data.data !== "object") {
            return null;
        }
        return data.data;
    },

    async getMonthSalesByCategory(
        shopId: number,
        month: string,
        year: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByCategoryPagination | null> {
        const { data } = await foodchowClient.get<ApiResponse<any>>(
            ENDPOINTS.reports.salesByCategoryMonth,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getYearSalesByCategory(
        shopId: number,
        year: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByCategoryPagination | null> {
        const { data } = await foodchowClient.get<ApiResponse<any>>(
            ENDPOINTS.reports.salesByCategoryYear,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReport(
        shopId: number,
        selectedDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReport,
            {
                params: {
                    shop_id: shopId,
                    find_date: selectedDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReportByPayment(
        shopId: number,
        selectedDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReportByPayment,
            {
                params: {
                    shop_id: shopId,
                    find_date: selectedDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReportByMonth(
        shopId: number,
        month: string,
        year: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReportByMonth,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReportByPaymentMonth(
        shopId: number,
        month: string,
        year: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReportByPaymentMonth,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReportByDate(
        shopId: number,
        startDate: string,
        endDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReportByDate,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getDailyClosingReportByPaymentDate(
        shopId: number,
        startDate: string,
        endDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<any> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.dailyClosingReportByPaymentDate,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        return data.data ?? null;
    },

    async getSalesByPosUserToday(
        shopId: number,
        posUser: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByPosUserResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByPosUserTodaySalesReport,
            {
                params: {
                    shop_id: shopId,
                    pos_user_name: posUser,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By POS User Today API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByPosUser[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getSalesByPosUserWeek(
        shopId: number,
        posUser: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByPosUserResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByPosUserWeekSalesReport,
            {
                params: {
                    shop_id: shopId,
                    pos_user_name: posUser,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By POS User Week API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByPosUser[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getSalesByPosUserMonth(
        shopId: number,
        month: string | number,
        year: string | number,
        posUser: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByPosUserResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByPosUserMonthSalesReport,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pos_user_name: posUser,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By POS User Month API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByPosUser[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getSalesByPosUserYear(
        shopId: number,
        year: string | number,
        posUser: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByPosUserResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByPosUserYearSalesReport,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pos_user_name: posUser,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By POS User Year API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByPosUser[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getSalesByPosUserDateWise(
        shopId: number,
        startDate: string,
        endDate: string,
        posUser: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByPosUserResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByPosUserDateWiseSalesReport,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pos_user_name: posUser,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By POS User DateWise API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByPosUser[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getTaxSummaryToday(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TaxSummaryResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.taxSummaryTodaySalesReport,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Tax Summary Today API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: TaxSummaryItem[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getSalesByItemSizeToday(
        shopId: number | string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByItemSizeTodayResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemSizeTodaySalesReport,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By Item Size Today API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByItemSize[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (typeof responseObj === "string") {
            try {
                const parsed = JSON.parse(responseObj);
                itemsList = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        const totalRecords = typeof responseObj?.totalRecords === "number" ? responseObj.totalRecords : itemsList.length;
        const totalPages = typeof responseObj?.totalPages === "number" ? responseObj.totalPages : (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1);
        const currentPage = typeof responseObj?.currentPage === "number" ? responseObj.currentPage : pageNumber;
        const ps = typeof responseObj?.pageSize === "number" ? responseObj.pageSize : pageSize;

        return {
            items: itemsList,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },
    async getSalesByItemSizeDateWise(
        shopId: number | string,
        date: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByItemSizeDateWiseResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemSizeDateWiseSalesReport,
            {
                params: {
                    shop_id: shopId,
                    date,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By Item Size DateWise API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByItemSize[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (typeof responseObj === "string") {
            try {
                const parsed = JSON.parse(responseObj);
                itemsList = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        const totalRecords = typeof responseObj?.totalRecords === "number" ? responseObj.totalRecords : itemsList.length;
        const totalPages = typeof responseObj?.totalPages === "number" ? responseObj.totalPages : (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1);
        const currentPage = typeof responseObj?.currentPage === "number" ? responseObj.currentPage : pageNumber;
        const ps = typeof responseObj?.pageSize === "number" ? responseObj.pageSize : pageSize;

        return {
            items: itemsList,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },
    async getSalesByItemSizeWeekly(
        shopId: number | string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByItemSizeWeeklyResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemSizeWeeklySalesReport,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By Item Size Weekly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByItemSize[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (typeof responseObj === "string") {
            try {
                const parsed = JSON.parse(responseObj);
                itemsList = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        const totalRecords = typeof responseObj?.totalRecords === "number" ? responseObj.totalRecords : itemsList.length;
        const totalPages = typeof responseObj?.totalPages === "number" ? responseObj.totalPages : (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1);
        const currentPage = typeof responseObj?.currentPage === "number" ? responseObj.currentPage : pageNumber;
        const ps = typeof responseObj?.pageSize === "number" ? responseObj.pageSize : pageSize;

        return {
            items: itemsList,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },
    async getSalesByItemSizeMonthly(
        shopId: number | string,
        month: string | number,
        year: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByItemSizeMonthlyResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemSizeMonthlySalesReport,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By Item Size Monthly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByItemSize[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (typeof responseObj === "string") {
            try {
                const parsed = JSON.parse(responseObj);
                itemsList = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        const totalRecords = typeof responseObj?.totalRecords === "number" ? responseObj.totalRecords : itemsList.length;
        const totalPages = typeof responseObj?.totalPages === "number" ? responseObj.totalPages : (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1);
        const currentPage = typeof responseObj?.currentPage === "number" ? responseObj.currentPage : pageNumber;
        const ps = typeof responseObj?.pageSize === "number" ? responseObj.pageSize : pageSize;

        return {
            items: itemsList,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },
    async getSalesByItemSizeYearly(
        shopId: number | string,
        year: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<SalesByItemSizeYearlyResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemSizeYearlySalesReport,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Sales By Item Size Yearly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: SalesByItemSize[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (typeof responseObj === "string") {
            try {
                const parsed = JSON.parse(responseObj);
                itemsList = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        const totalRecords = typeof responseObj?.totalRecords === "number" ? responseObj.totalRecords : itemsList.length;
        const totalPages = typeof responseObj?.totalPages === "number" ? responseObj.totalPages : (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1);
        const currentPage = typeof responseObj?.currentPage === "number" ? responseObj.currentPage : pageNumber;
        const ps = typeof responseObj?.pageSize === "number" ? responseObj.pageSize : pageSize;

        return {
            items: itemsList,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
            dateformat: responseObj?.dateformat,
        };
    },



    async getTaxSummaryWeekly(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TaxSummaryResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.taxSummaryWeeklySalesReport,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Tax Summary Weekly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: TaxSummaryItem[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },

    async getTaxSummaryMonthly(
        shopId: number,
        month: string | number,
        year: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TaxSummaryResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.taxSummaryMonthlySalesReport,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Tax Summary Monthly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: TaxSummaryItem[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    async getTaxSummaryYearly(
        shopId: number,
        year: string | number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TaxSummaryResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.taxSummaryYearlySalesReport,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Tax Summary Yearly API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: TaxSummaryItem[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },

    async getTaxSummaryDateWise(
        shopId: number,
        startDate: string,
        endDate: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<TaxSummaryResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.taxSummaryDateWiseSalesReport,
            {
                params: {
                    shop_id: shopId,
                    from: startDate,
                    to: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );

        console.log("Tax Summary DateWise API Response:", data);

        const responseObj = data?.data ?? data;
        let itemsList: TaxSummaryItem[] = [];

        if (typeof responseObj?.items === "string") {
            try {
                itemsList = JSON.parse(responseObj.items);
            } catch {
                itemsList = [];
            }
        } else if (Array.isArray(responseObj?.items)) {
            itemsList = responseObj.items;
        } else if (Array.isArray(responseObj)) {
            itemsList = responseObj;
        }

        return {
            items: itemsList,
            totalRecords: responseObj?.totalRecords ?? itemsList.length,
            totalPages: responseObj?.totalPages ?? (itemsList.length > 0 ? Math.ceil(itemsList.length / pageSize) : 1),
            currentPage: responseObj?.currentPage ?? pageNumber,
            pageSize: responseObj?.pageSize ?? pageSize,
        };
    },
    // ---------------- REFUND HISTORY ----------------



    async getTodayRefunds(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedRefundResult> {
        const { data } = await foodchowClient.get<PaginatedRefundResult>(
            ENDPOINTS.reports.refundToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );
        console.log("RefundHistoryOfToday response:", data);
        return data;
    },

    async getWeekRefunds(
        shopId: number,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedRefundResult> {
        const { data } = await foodchowClient.get<PaginatedRefundResult>(
            ENDPOINTS.reports.refundWeek,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );
        console.log("RefundHistoryOfWeek response:", data);
        return data;
    },

    async getMonthRefunds(
        shopId: number,
        month: string,
        year: string,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedRefundResult> {
        const { data } = await foodchowClient.get<PaginatedRefundResult>(
            ENDPOINTS.reports.refundMonth,
            {
                params: {
                    shop_id: shopId,
                    months: month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        console.log("RefundHistoryByMonth response:", data);
        return data;
    },

    async getYearRefunds(
        shopId: number,
        year: string,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedRefundResult> {
        const { data } = await foodchowClient.get<PaginatedRefundResult>(
            ENDPOINTS.reports.refundYear,
            {
                params: {
                    shop_id: shopId,
                    years: year,
                    pageNumber,
                    pageSize,
                },
            }
        );
        console.log("RefundHistoryByYear response:", data);
        return data;
    },

    async getCustomRefunds(
        shopId: number,
        startDate: string,
        endDate: string,
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedRefundResult> {
        const { data } = await foodchowClient.get<PaginatedRefundResult>(
            ENDPOINTS.reports.refundCustom,
            {
                params: {
                    shop_id: shopId,
                    start_date: startDate,
                    end_date: endDate,
                    pageNumber,
                    pageSize,
                },
            }
        );
        console.log("RefundHistoryByDateWise response:", data);
        return data;
    },
    // ---------------- INGREDIENTS ----------------

    async getTodayIngredients(shopId: number): Promise<IngredientRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.ingredientsToday,
            { params: { shop_id: shopId } }
        );
        return parseData<IngredientRecord>(data.data);
    },

    async getWeekIngredients(shopId: number): Promise<IngredientRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.ingredientsWeek,
            { params: { shop_id: shopId } }
        );
        return parseData<IngredientRecord>(data.data);
    },

    async getMonthIngredients(
        shopId: number,
        month: string,
        year: string
    ): Promise<IngredientRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.ingredientsMonth,
            { params: { shop_id: shopId, months: month, year } }
        );
        return parseData<IngredientRecord>(data.data);
    },

    async getYearIngredients(
        shopId: number,
        year: string
    ): Promise<IngredientRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.ingredientsYear,
            { params: { shop_id: shopId, years: year } }
        );
        return parseData<IngredientRecord>(data.data);
    },

    async getCustomIngredients(
        shopId: number,
        startDate: string,
        endDate: string
    ): Promise<IngredientRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.ingredientsCustom,
            { params: { shop_id: shopId, start_date: startDate, end_date: endDate } }
        );
        return parseData<IngredientRecord>(data.data);
    },

    // ---------------- SALES BY ORDER METHOD ----------------
    // GET /FoodChowRMS/TotalSalesByOrderMethodMonthly?shop_id=3161&month=07&year=2026
    async getOrderMethodMonthly(
        shopId: number,
        month: string, // zero-padded, e.g. "07"
        year: string
    ): Promise<OrderMethodRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.orderMethodMonthly,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                },
            }
        );

        return parseData<OrderMethodRecord>(data.data);
    },
    // ---------------- ONLINE ORDER REPORT (Completed Online Payments) ----------------

    async getOnlineOrderToday(shopId: number): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.onlineOrderToday,
            { params: { shop_id: shopId } }
        );
        return parseData<SalesRecord>(data.data);
    },

    async getOnlineOrderWeek(shopId: number): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.onlineOrderWeek,
            { params: { shop_id: shopId } }
        );
        return parseData<SalesRecord>(data.data);
    },

    async getOnlineOrderMonth(
        shopId: number,
        month: string, // zero-padded, e.g. "07"
        year: string
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.onlineOrderMonth,
            { params: { shop_id: shopId, months: month, year } }
        );
        return parseData<SalesRecord>(data.data);
    },

    async getOnlineOrderYear(
        shopId: number,
        year: string
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.onlineOrderYear,
            { params: { shop_id: shopId, years: year } }
        );
        return parseData<SalesRecord>(data.data);
    },

    async getOnlineOrderCustom(
        shopId: number,
        startDate: string,
        endDate: string
    ): Promise<SalesRecord[]> {
        const { data } = await adminFoodchowClient.get<APIResponse>(
            ENDPOINTS.reports.onlineOrderCustom,
            { params: { shop_id: shopId, start_date: startDate, end_date: endDate } }
        );
        return parseData<SalesRecord>(data.data);
    },





    //   async getTodaySalesByItems(shopId: number): Promise<SalesByItem[]> {

    //     const { data } = await foodchowReportsClient.get<ApiResponse<any>>(
    //       ENDPOINTS.reports.totalSalesByToday,
    //       {
    //         params: {
    //           shop_id: shopId,
    //         },
    //       }
    //     );

    //     console.log("Full API Response:", data);
    //     console.log("data.data:", data.data);

    //     if (!data.data) {
    //       return [];
    //     }

    //     try {
    //       const parsed = JSON.parse(data.data);

    //       console.log("Parsed Data:", parsed);

    //       return parsed;
    //     } catch (e) {
    //       console.log("JSON Parse Error:", e);
    //       return [];
    //     }
    //   },



    async getTodayTopSellingItems(
        shopId: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<TopSellingTodayResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.topSellingItemsToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data ?? data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing TopSellingItemsByToday data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : Array.isArray(data)
                    ? data
                    : [];

        const totalRecords =
            typeof resData?.totalRecords === "number"
                ? resData.totalRecords
                : typeof data?.count === "number"
                    ? data.count
                    : typeof data?.count === "string"
                        ? parseInt(data.count, 10) || items.length
                        : items.length;

        const totalPages =
            typeof resData?.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));

        const currentPage =
            typeof resData?.currentPage === "number"
                ? resData.currentPage
                : pageNumber;

        const ps = typeof resData?.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },

    async getDayWiseTopSellingItems(
        shopId: number | string,
        findsDate: string,
        pageNumber: number,
        pageSize: number
    ): Promise<TopSellingDayWiseResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.topSellingItemsDayWise,
            {
                params: {
                    shop_id: shopId,
                    finds_date: findsDate,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data ?? data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing TopSellingItemsByDaywise data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : Array.isArray(data)
                    ? data
                    : [];

        const totalRecords =
            typeof resData?.totalRecords === "number"
                ? resData.totalRecords
                : typeof data?.count === "number"
                    ? data.count
                    : typeof data?.count === "string"
                        ? parseInt(data.count, 10) || items.length
                        : items.length;

        const totalPages =
            typeof resData?.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));

        const currentPage =
            typeof resData?.currentPage === "number"
                ? resData.currentPage
                : pageNumber;

        const ps = typeof resData?.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },

    async getWeekTopSellingItems(
        shopId: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<TopSellingWeekResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.topSellingItemsWeek,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data ?? data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing TopSellingItemsByWeek data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : Array.isArray(data)
                    ? data
                    : [];

        const totalRecords =
            typeof resData?.totalRecords === "number"
                ? resData.totalRecords
                : typeof data?.count === "number"
                    ? data.count
                    : typeof data?.count === "string"
                        ? parseInt(data.count, 10) || items.length
                        : items.length;

        const totalPages =
            typeof resData?.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));

        const currentPage =
            typeof resData?.currentPage === "number"
                ? resData.currentPage
                : pageNumber;

        const ps = typeof resData?.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },

    async getMonthTopSellingItems(
        shopId: number | string,
        month: number | string,
        year: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<TopSellingMonthResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.topSellingItemsMonth,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data ?? data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing TopSellingItemsByMonth data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : Array.isArray(data)
                    ? data
                    : [];

        const totalRecords =
            typeof resData?.totalRecords === "number"
                ? resData.totalRecords
                : typeof data?.count === "number"
                    ? data.count
                    : typeof data?.count === "string"
                        ? parseInt(data.count, 10) || items.length
                        : items.length;

        const totalPages =
            typeof resData?.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));

        const currentPage =
            typeof resData?.currentPage === "number"
                ? resData.currentPage
                : pageNumber;

        const ps = typeof resData?.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },

    async getYearTopSellingItems(
        shopId: number | string,
        year: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<TopSellingYearResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.topSellingItemsYear,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data ?? data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing TopSellingItemsByYear data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : Array.isArray(data)
                    ? data
                    : [];

        const totalRecords =
            typeof resData?.totalRecords === "number"
                ? resData.totalRecords
                : typeof data?.count === "number"
                    ? data.count
                    : typeof data?.count === "string"
                        ? parseInt(data.count, 10) || items.length
                        : items.length;

        const totalPages =
            typeof resData?.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));

        const currentPage =
            typeof resData?.currentPage === "number"
                ? resData.currentPage
                : pageNumber;

        const ps = typeof resData?.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages: totalPages || 1,
            currentPage,
            pageSize: ps,
        };
    },

    async getTodaySalesByItems(
        shopId: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<SalesByItemTodayResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemsToday,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data || !data.data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing SalesByItemsByToday data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : [];
        const totalRecords =
            typeof resData.totalRecords === "number"
                ? resData.totalRecords
                : items.length;
        const totalPages =
            typeof resData.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));
        const currentPage =
            typeof resData.currentPage === "number"
                ? resData.currentPage
                : pageNumber;
        const ps = typeof resData.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages,
            currentPage,
            pageSize: ps,
        };
    },

    async getDayWiseSalesByItems(
        shopId: number | string,
        findDate: string,
        pageNumber: number,
        pageSize: number
    ): Promise<SalesByItemDayWiseResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemsDayWise,
            {
                params: {
                    shop_id: shopId,
                    find_date: findDate,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data || !data.data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing SalesByItemsByDayWise data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : [];
        const totalRecords =
            typeof resData.totalRecords === "number"
                ? resData.totalRecords
                : items.length;
        const totalPages =
            typeof resData.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));
        const currentPage =
            typeof resData.currentPage === "number"
                ? resData.currentPage
                : pageNumber;
        const ps = typeof resData.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages,
            currentPage,
            pageSize: ps,
        };
    },

    async getWeekSalesByItems(
        shopId: number | string,
        pageNumber: number,
        pageSize: number
    ): Promise<SalesByItemWeekResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemsWeek,
            {
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data || !data.data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing SalesByItemsByWeek data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : [];
        const totalRecords =
            typeof resData.totalRecords === "number"
                ? resData.totalRecords
                : items.length;
        const totalPages =
            typeof resData.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));
        const currentPage =
            typeof resData.currentPage === "number"
                ? resData.currentPage
                : pageNumber;
        const ps = typeof resData.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages,
            currentPage,
            pageSize: ps,
        };
    },

    async getMonthSalesByItems(
        shopId: number | string,
        month: string,
        year: string,
        pageNumber: number,
        pageSize: number
    ): Promise<SalesByItemMonthResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemsMonth,
            {
                params: {
                    shop_id: shopId,
                    month,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data || !data.data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing SalesByItemsByMonth data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : [];
        const totalRecords =
            typeof resData.totalRecords === "number"
                ? resData.totalRecords
                : items.length;
        const totalPages =
            typeof resData.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));
        const currentPage =
            typeof resData.currentPage === "number"
                ? resData.currentPage
                : pageNumber;
        const ps = typeof resData.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages,
            currentPage,
            pageSize: ps,
        };
    },

    async getYearSalesByItems(
        shopId: number | string,
        year: string,
        pageNumber: number,
        pageSize: number
    ): Promise<SalesByItemYearResponse> {
        const { data } = await foodchowClient.get(
            ENDPOINTS.reports.salesByItemsYear,
            {
                params: {
                    shop_id: shopId,
                    year,
                    pageNumber,
                    pageSize,
                },
            }
        );

        if (!data || !data.data) {
            return {
                items: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: pageNumber,
                pageSize,
            };
        }

        let resData = data.data;
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            } catch (e) {
                console.error("Error parsing SalesByItemsByYear data:", e);
                return {
                    items: [],
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize,
                };
            }
        }

        const items = Array.isArray(resData.items)
            ? resData.items
            : Array.isArray(resData)
                ? resData
                : [];
        const totalRecords =
            typeof resData.totalRecords === "number"
                ? resData.totalRecords
                : items.length;
        const totalPages =
            typeof resData.totalPages === "number"
                ? resData.totalPages
                : Math.ceil(totalRecords / (pageSize || 10));
        const currentPage =
            typeof resData.currentPage === "number"
                ? resData.currentPage
                : pageNumber;
        const ps = typeof resData.pageSize === "number" ? resData.pageSize : pageSize;

        return {
            items,
            totalRecords,
            totalPages,
            currentPage,
            pageSize: ps,
        };
    },


    async getProductWiseComparisonToday(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<ProductWiseComparison[]> {

        console.log(
            "Final URL:",
            foodchowRMSClient.getUri({
                url: ENDPOINTS.reports.productWiseComparisonToday,
                params: {
                    shop_id: shopId,
                    pageNumber,
                    pageSize,
                },
            })
        );

        let data;
        try {
            const response = await fetch(
                `/api/comparison-by-product?period=today&shop_id=${shopId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
            );
            data = await response.json();
        } catch (error) {
            console.warn("API Error in getProductWiseComparisonToday:", error);
            return [];
        }

        console.log("Product Comparison Today API:", data);

        if (!data.data) {
            return [];
        }

        try {
            // return JSON.parse(data.data);

            const result = JSON.parse(data.data);

            return result.map((item: any) => ({
                item_name: item.item_name,
                previous_quantity: item.previous_day_quantity,
                current_quantity: item.current_day_quantity,
            }));
        } catch (e) {
            console.log(e);
            return [];
        }
    },

    async getProductWiseComparisonWeek(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<ProductWiseComparison[]> {

        let data;
        try {
            const response = await fetch(
                `/api/comparison-by-product?period=week&shop_id=${shopId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
            );
            data = await response.json();
        } catch (error) {
            console.warn("API Error in getProductWiseComparisonWeek:", error);
            return [];
        }

        if (!data.data) return [];

        try {
            // return JSON.parse(data.data);
            const result = JSON.parse(data.data);

            return result.map((item: any) => ({
                item_name: item.item_name,
                previous_quantity: item.previous_week_quantity,
                current_quantity: item.current_week_quantity,
            }));
        } catch {
            return [];
        }
    },

    async getProductWiseComparisonMonth(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<ProductWiseComparison[]> {

        let data;
        try {
            const response = await fetch(
                `/api/comparison-by-product?period=month&shop_id=${shopId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
            );
            data = await response.json();
        } catch (error) {
            console.warn("API Error in getProductWiseComparisonMonth:", error);
            return [];
        }

        if (!data.data) return [];

        try {
            const result = JSON.parse(data.data);

            return result.map((item: any) => ({
                item_name: item.item_name,
                previous_quantity: item.previous_month_quantity,
                current_quantity: item.current_month_quantity,
            }));
        } catch {
            return [];
        }
    },

    async getProductWiseComparisonYear(
        shopId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<ProductWiseComparison[]> {

        let data;
        try {
            const response = await fetch(
                `/api/comparison-by-product?period=year&shop_id=${shopId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
            );
            data = await response.json();
        } catch (error) {
            console.warn("API Error in getProductWiseComparisonYear:", error);
            return [];
        }

        if (!data.data) return [];

        try {
            const result = JSON.parse(data.data);

            return result.map((item: any) => ({
                item_name: item.item_name,
                previous_quantity: item.previous_year_quantity,
                current_quantity: item.current_year_quantity,
            }));
        } catch {
            return [];
        }
    },

    async getPosTotalSalesToday(
        shopId: number
    ): Promise<PosTotalSales[]> {
        try {
            const res = await fetch(`/api/pos-total-sales?type=today&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getPosTotalSalesWeek(
        shopId: number
    ): Promise<PosTotalSales[]> {
        try {
            const res = await fetch(`/api/pos-total-sales?type=weekly&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getPosTotalSalesMonth(
        shopId: number,
        month: string,
        year: string
    ): Promise<PosTotalSales[]> {
        try {
            const res = await fetch(`/api/pos-total-sales?type=monthly&shop_id=${shopId}&month=${month}&year=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getPosTotalSalesYear(
        shopId: number,
        year: string
    ): Promise<PosTotalSales[]> {
        try {
            const res = await fetch(`/api/pos-total-sales?type=yearly&shop_id=${shopId}&year=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getPosTotalSalesDateWise(
        shopId: number,
        startDate: string,
        endDate: string
    ): Promise<PosTotalSales[]> {
        try {
            const res = await fetch(`/api/pos-total-sales?type=datewise&shop_id=${shopId}&start_date=${startDate}&end_date=${endDate}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getIncompletePaymentToday(
        shopId: number
    ): Promise<IncompletePayment[]> {
        try {
            const res = await fetch(`/api/incomplete-payment?type=today&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getIncompletePaymentToday failed:", e);
            return [];
        }
    },

    async getIncompletePaymentWeek(
        shopId: number
    ): Promise<IncompletePayment[]> {
        try {
            const res = await fetch(`/api/incomplete-payment?type=weekly&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getIncompletePaymentWeek failed:", e);
            return [];
        }
    },


    async getIncompletePaymentMonth(
        shopId: number,
        month: string,
        year: string
    ): Promise<IncompletePayment[]> {
        try {
            const res = await fetch(`/api/incomplete-payment?type=monthly&shop_id=${shopId}&months=${month}&year=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getIncompletePaymentMonth failed:", e);
            return [];
        }
    },

    async getIncompletePaymentYear(
        shopId: number,
        year: string
    ): Promise<IncompletePayment[]> {
        try {
            const res = await fetch(`/api/incomplete-payment?type=yearly&shop_id=${shopId}&years=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getIncompletePaymentYear failed:", e);
            return [];
        }
    },


    async getIncompletePaymentDateWise(
        shopId: number,
        startDate: string,
        endDate: string
    ): Promise<IncompletePayment[]> {
        try {
            const res = await fetch(`/api/incomplete-payment?type=datewise&shop_id=${shopId}&start_date=${startDate}&end_date=${endDate}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getIncompletePaymentDateWise failed:", e);
            return [];
        }
    },

    async getTotalOnlinePaymentToday(
        shopId: number
    ): Promise<OnlinePaymentReport[]> {
        try {
            const res = await fetch(`/api/stripe-connect?type=today&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getTotalOnlinePaymentToday failed:", e);
            return [];
        }
    },


    async getTotalOnlinePaymentWeekly(
        shopId: number
    ): Promise<OnlinePaymentReport[]> {
        try {
            const res = await fetch(`/api/stripe-connect?type=weekly&shop_id=${shopId}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getTotalOnlinePaymentWeekly failed:", e);
            return [];
        }
    },

    async getTotalOnlinePaymentMonth(
        shopId: number,
        month: string,
        year: string
    ): Promise<OnlinePaymentReport[]> {
        try {
            const res = await fetch(`/api/stripe-connect?type=monthly&shop_id=${shopId}&month=${month}&year=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getTotalOnlinePaymentMonth failed:", e);
            return [];
        }
    },


    async getTotalOnlinePaymentYear(
        shopId: number,
        year: string
    ): Promise<OnlinePaymentReport[]> {
        try {
            const res = await fetch(`/api/stripe-connect?type=yearly&shop_id=${shopId}&year=${year}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getTotalOnlinePaymentYear failed:", e);
            return [];
        }
    },

    async getTotalOnlinePaymentDateWise(
        shopId: number,
        from: string,
        to: string
    ): Promise<OnlinePaymentReport[]> {
        try {
            const res = await fetch(`/api/stripe-connect?type=datewise&shop_id=${shopId}&from=${from}&to=${to}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.data) return [];
            return JSON.parse(data.data);
        } catch (e) {
            console.warn("getTotalOnlinePaymentDateWise failed:", e);
            return [];
        }
    },

};