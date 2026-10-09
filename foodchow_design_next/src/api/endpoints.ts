/**
 * Centralised endpoint definitions. Keep all backend route strings here so the
 * services stay declarative and routes are easy to audit/change.
 */


export const ENDPOINTS = {
  auth: {
    // login: "/auth/login",
    // login: "/auth/login",
    login: "/UserMaster/AdminUserPOSLogin",
    logout: "/auth/logout",
    refresh: "/auth/refresh-token",
    me: "/auth/me",
  },
  users: {
    list: "/users",
    byId: (id: string | number) => `/users/${id}`,
  },
  common: {
    countries: "/common/countries",
    currencies: "/common/currencies",
    timezones: "/common/timezones",
  },
  menu: {
    categoriesByShop: "/MenuMaster/GetCategoryShopWiseSubcategories",
    extrasByShop: "/BulkEdit/GetExtraWithOptionWithSoldOut",

    getPlanDetails: "/Marketplace/GetPlanDetails",

    //extra category endpoints
    addExtraCategory: "/MenuMaster/AddExtraCategory",
    updateExtraCategory: "/MenuMaster/AddExtraCategory",
    deleteExtraCategory: "/MenuMaster/DeleteExtraCategory",

    //extra item endpoints
    addExtraItem: "/MenuMaster/AddExtraCategoryItem",
    deleteExtraItem: "/MenuMaster/DeleteExtraCategoryItem",
    changeExtraItemStatus: "/MenuMaster/ChangeStoreItemExtraCategoryOptionStatus",
    changeCategoryStatus: "/MenuMaster/ChangeStoreItemExtraCategoryStatus", // For categories (if same endpoint)
    updateExtraItem: "/MenuMaster/UpdateExtraOption",



    //item code
    getItemNames: "/FoodChowRMS/GetItemName",
    getItemCodeTypeSetting: "/FoodChowWD/GetItemCodeTypeSetting",
    updateItemCode: "/FoodChowRMS/UpdateItemCode",

    // Tax
    getAllTax: "/TaxMaster/GetAllStoreTax",
    saveStoreTax: "/TaxMaster/SaveStoreTax",
    checkTaxApply: "/FoodChowWD/checktaxisapply",
    deleteStoreTax: "/TaxMaster/DeleteStoreTax",
    getTaxType: "/FoodChowWD/GetIncludingExcludingTax",
    getIncludingExcludingTax: "/FoodChowWD/GetIncludingExcludingTax",


    //apply tax
    getItemListWithSize: "/FoodChowWD/GetItemListWithSize",
    applyTaxOnAllItems: "/FoodChowWD/USP_AddTaxAllItemWithTaxID",
    addTaxAllItemWithTaxID: "/FoodChowWD/USP_AddTaxAllItemWithTaxID",
    removeTaxOnAllItems: "/FoodChowWD/USP_DeleteTaxAllItemWithTaxID",
    deleteTaxAllItemWithTaxID: "/FoodChowWD/USP_DeleteTaxAllItemWithTaxID",
    applyTaxToSingleItem: "/TaxMaster/AddTaxWithTaxID",
    removeTaxFromSingleItem: "/TaxMaster/DeleteTaxDetailsWithSize",
    getTaxDetailsWithSize: "/FoodChowWD/GetTaxDetailsWithSize",

    //choice
    getChoices: "/BulkEdit/GetChoicesWithOptionWithSoldOut",
    addChoice: "/MenuMaster/AddChoices",
    deleteChoice: "/MenuMaster/DeleteChoices",
    deleteChoiceOption: "/MenuMaster/DeleteChoiceOptionById",
    updateChoiceName: "/MenuMaster/UpdateChoiceName",
    changeChoiceStatus: "/MenuMaster/ChangeStoreItemChoiceNameStatus",
    addChoiceOption: "/MenuMaster/AddChoicesOption",


    variantsByShop: "/MenuMaster/GetVariantList",
    addUpdateVariant: "/MenuMaster/AddUpdateVariant",
    deleteVariant: "/MenuMaster/DeleteVariant",
    addItem: "/MenuMaster/QuickAddStoreItemWithStock",
    getItems: "/MenuMaster/GetItemDetailsByShopIdMasterWithSoldOUtNew",
    deleteItem: "/MenuMaster/DeleteStoreItem",

    // Store Category CRUD
    addStoreCategory: "/MenuMaster/AddStoreCategory",
    deleteCategory: "/MenuMaster/DeleteCategory",
    changeStoreCategoryStatus: "/MenuMaster/ChangeStoreCategoryStatus",

    // Store Item CRUD
    editStoreItem: "/MenuMaster/EditStoreItem",
    changeStoreItemStatus: "/MenuMaster/ChangeStoreItemStatus",

    // Additional Menu
    getAllShopMenuType: "/FoodChowWD/GetAllShopMenuTypeWD",
    getItemsForMenuType: "/FoodChowWD/GetItemsForMenuTypeWD",
    getShopMenuHeaderDetails: "/FoodChowWD/GetShopMenuHeaderDetailsWD",
    getShopCustomMenuTimings: "/FoodChowWD/GetShopCustomMenuTimings",
    addShopMenuType: "/FoodChowWD/AddShopMenuTypeWD",
    updateShopMenuType: "/FoodChowWD/UpdateShopMenuTypeWD",
    deleteShopMenuType: "/FoodChowWD/DeleteShopMenuTypeWD",
    enableMenuForPosOrOnline: "/FoodChowWD/EnableMenuForPosOrOnline",
    addMenuLanguage: "/FoodChowWD/AddMenuLanguage",

    //Item Deal
    addItemDeal: "/FoodChowRMS/AddDealWD",
    getAllItemDeal: "/FoodChowRMS/GetAllDealsByShopIDWD",

    //Menu Language
    getSupportedLanguageList: "/FoodChowWD/GetSupportedLanguageList",
    getAllLanguage: "/FoodChowRMS/GetAllLanguage",
  },

  orders: {
    fetchMenuTypes: "/FoodChowWD/GetAllShopMenuTypeWD",
    fetchOrderingMethods: "/FoodChowWD/GetOrderingMethods",
    fetchPaymentMethods: "/FoodChowWD/GetPaymentMethods",
    fetchSelectedPaymentMethods: "/FoodChowWD/GetShopPaymentMethodFromOrderMethod",
    fetchOrderMethodStatus: "/FoodChowWD/GetOrderMethodForShopAndMenu",
    fetchUserOptionDetails: "/FoodChowWD/getUserOptionDetails",
    fetchOnlineOrderStatus: "/DashboardMaster/GetStoreOrderOnlineStatus",
    fetchMissedOrderTiming: "/WidgetMaster/GetMissedOrderTiming",
    assignPaymentMethod: "/FoodChowWD/AssignPaymentMethodToShop",
    deAssignPaymentMethod: "/FoodChowWD/DeAssignPaymentMethodToShop",
    updateOrderMethodFlag: "/FoodChowWD/InsertDefaultEntryForShopOrderMethod",
    updateUserOption: "/FoodChowWD/MakeUserDetailsOptional",
    setOnlineOrderStatus: "/DashboardMaster/UpdateStoreOrderOnlineStatus",
    setMissedOrderTime: "/WidgetMaster/UpdateMissedOrderTiming",
    updateDeliveryMethod: "/WidgetMaster/UpdateShopDeliveryOption",

    // Widget Settings

    getWidgetSettings: "/FoodChowWD/GetWidgetSetting",
    updateWidgetSettings: "/FoodChowWD/UpdateWidgetSettingsWeb",
    updateColorPickerWidgetSettings: "/FoodChowWD/UpdateColorPickerWidgetSetting",
    getLalaMoveMarket: "/Delivery/GetLalaMoveMarket",
    getLalaMoveWD: "/Delivery/GetlalamoveWD",
    saveLalaMoveData: "/Delivery/SaveLalaMoveData",
    getPorterDetailWD: "/Delivery/GetPorterdetaildsWD",
    savePorterData: "/Delivery/SavePorterData",
  },

  reports: {
    weightedAverageToday:
      "/FoodChowRMS/WeightedAverageTransactionByToday",

    weightedAverageMonthly:
      "/FoodChowRMS/WeightedAverageTransactionByMonth",
    customerList: "/SalesReports/Get_CRM_Report",
    crmRevenueReport: "/SalesReports/CRM_Report_By_Orders",
    weekComparison: "/FoodChowRMS/WeekWiseComparision",
    topSellingToday: "/FoodChowRMS/TopSellingItemsByToday",
    topSellingDayWise: "/FoodChowRMS/TopSellingItemsByDayWise",
    topSellingWeek: "/FoodChowRMS/TopSellingItemsByWeek",
    topSellingMonth: "/FoodChowRMS/TopSellingItemsByMonth",
    topSellingYear: "/FoodChowRMS/TopSellingItemsByYear",
    tradingSessionToday: "/SalesReports/SalesByTradingSessionByToday",
    tradingSessionDayWise: "/SalesReports/SalesByTradingSessionByDayWise",
    tradingSessionWeek: "/SalesReports/SalesByTradingSessionByWeek",
    tradingSessionMonth: "/SalesReports/SalesByTradingSessionByMonth",
    tradingSessionYear: "/SalesReports/SalesByTradingSessionByYear",
    salesByHour: "/FoodChowRMS/SalesByHours",
    posUsers: "/FoodChowRMS/GetPosUserName",
    posEndDayReport: "/SalesReports/PosEndDayReport",
    salesByPosUserToday: "/FoodChowRMS/SalesByPosUserByToday",
    salesByPosUserWeek: "/FoodChowRMS/salesByPosUserByWeek",
    salesByPosUserMonth: "/FoodChowRMS/salesByPosUserByMonth",
    salesByPosUserYear: "/FoodChowRMS/salesByPosUserByYear",
    salesByPosUserDateWise: "/FoodChowRMS/salesByPosUserByDateWise",
    taxSummaryToday: "/FoodChowRMS/TotalSalesTaxToday",
    taxSummaryWeekly: "/FoodChowRMS/TotalSalesTaxWeekly",
    taxSummaryMonthly: "/FoodChowRMS/TotalSalesTaxmonthly",
    taxSummaryYearly: "/FoodChowRMS/TotalSalesTaxyearly",
    taxSummaryDateWise: "/FoodChowRMS/TotalSalesTaxDateWise",
    declinedOrderToday: "/FoodChowRMS/TotaldeclinedOrderToday",
    declinedOrderWeekly: "/FoodChowRMS/TotaldeclinedOrderWeekly",
    declinedOrderMonthly: "/FoodChowRMS/TotaldeclinedOrdermonthly",
    declinedOrderYearly: "/FoodChowRMS/TotaldeclinedOrderyearly",
    declinedOrderDateWise: "/FoodChowRMS/TotaldeclinedOrderDateWise",
    orderItemDetails: "/FoodChowRMS/GetOrderItemDetails",
    salesByItemSizeToday: "/FoodChowRMS/SalesByItemSizeToday",
    salesByItemSizeWeekly: "/FoodChowRMS/SalesByItemSizeWeekly",
    salesByItemSizeMonthly: "/FoodChowRMS/SalesByItemSizeMonthly",
    salesByItemSizeYearly: "/FoodChowRMS/SalesByItemSizeyearly",
    salesByItemSizeDateWise: "/FoodChowRMS/SalesByItemSizeDateWise",



    // Today
    todaySales: "/FoodChowRMS/TotalSalesByToday",
    todaySummary: "/FoodChowRMS/TotalSalesByTodayTotal",

    // Week
    weekSales: "/FoodChowRMS/TotalSalesByWeek",
    weekSummary: "/FoodChowRMS/TotalSalesByWeekTotal",

    // Month
    monthSales: "/FoodChowRMS/TotalSalesByMonth",
    monthSummary: "/FoodChowRMS/TotalSalesByMonthTotal",

    // Year
    yearSales: "/FoodChowRMS/TotalSalesByYear",
    yearSummary: "/FoodChowRMS/TotalSalesByYearTotal",

    // Custom Date
    // Custom Date
    customSales: "/FoodChowRMS/TotalSalesByDateWise",
    customSummary: "/FoodChowRMS/TotalSalesByDateWiseTotal",

    // Order Details
    orderItems: "/FoodChowRMS/GetOrderItemDetails",
    invoiceDetails: "/FoodChowRMS/getOrderDetailsByOderId",
    invoiceItemList: "/FoodChowWD/getOrderedItemList",

    monthWiseComparison: "/FoodChowRMS/MonthWiseComparision",
    today: "/FoodChowWD/RefundHistoryOfToday",
    week: "/FoodChowWD/RefundHistoryOfWeek",
    month: "/FoodChowWD/RefundHistoryByMonth",
    year: "/FoodChowWD/RefundHistoryByYear",
    custom: "/FoodChowWD/RefundHistoryByDateWise",
    refundToday: "/SalesReports/RefundHistoryOfToday",
    refundWeek: "/SalesReports/RefundHistoryOfWeek",
    refundMonth: "/SalesReports/RefundHistoryByMonth",
    refundYear: "/SalesReports/RefundHistoryByYear",
    refundCustom: "/SalesReports/RefundHistoryByDateWise",
    // Ingredients
    ingredientsToday: "/FoodChowRMS/TotalSalesByIngredientsToday",
    ingredientsWeek: "/FoodChowRMS/TotalSalesByIngredientsWeek",
    ingredientsMonth: "/FoodChowRMS/TotalSalesByIngredientsMonth",
    ingredientsYear: "/FoodChowRMS/TotalSalesByIngredientsYear",
    ingredientsCustom: "/FoodChowRMS/TotalSalesByIngredientsDateWise",
    // Sales by Order Method (Dine In / Home Delivery / Take Away)
    orderMethodMonthly: "/FoodChowRMS/TotalSalesByOrderMethodMonthly",
    // Online Order Report (Completed Online Payments)
    onlineOrderToday: "/FoodChowRMS/TotalCompleteOnlinePaymentByToday",
    onlineOrderWeek: "/FoodChowRMS/TotalCompleteOnlinePaymentByWeek",
    onlineOrderMonth: "/FoodChowRMS/TotalCompleteOnlinePaymentByMonth",
    onlineOrderYear: "/FoodChowRMS/TotalCompleteOnlinePaymentByYear",
    onlineOrderCustom: "/FoodChowRMS/TotalCompleteOnlinePaymentByDateWise",



    topSellingItemsToday: "/SalesReports/TopSellingItemsByToday",
    topSellingItemsDayWise: "/SalesReports/TopSellingItemsByDaywise",
    topSellingItemsWeek: "/SalesReports/TopSellingItemsByWeek",
    topSellingItemsMonth: "/SalesReports/TopSellingItemsByMonth",
    topSellingItemsYear: "/SalesReports/TopSellingItemsByYear",
    salesByItemsToday: "/SalesReports/SalesByItemsByToday",
    salesByItemsDayWise: "/SalesReports/SalesByItemsByDayWise",
    salesByItemsWeek: "/SalesReports/SalesByItemsByWeek",
    salesByItemsMonth: "/SalesReports/SalesByItemsByMonth",
    salesByItemsYear: "/SalesReports/SalesByItemsByYear",
    totalSalesDateWise: "/SalesReports/TotalSalesByDateWise",
    salesByCategoryToday: "/SalesReports/SalesByCategoryByToday",
    salesByCategoryDayWise: "/SalesReports/SalesByCategoryByDaywise",
    salesByCategoryWeek: "/SalesReports/SalesByCategoryByWeek",
    salesByCategoryMonth: "/SalesReports/SalesByCategoryByMonth",
    salesByCategoryYear: "/SalesReports/SalesByCategoryByyear",

    dailyClosingReport:
      "/SalesReports/DailyClosingReport",

    dailyClosingReportByPayment:
      "/SalesReports/DailyclosingReportByPayment",

    dailyClosingReportByMonth:
      "/SalesReports/DailyClosingReportByMonth",

    dailyClosingReportByPaymentMonth:
      "/SalesReports/DailyclosingReportByPaymentMonth",

    dailyClosingReportByDate:
      "/SalesReports/DailyClosingReportByDate",

    dailyClosingReportByPaymentDate:
      "/SalesReports/DailyclosingReportByPaymentDate",

    yearWiseComparison:
      "/FoodChowRMS/YearWiseComparision",

    productWiseComparisonToday:
      "/FoodChowRMS/ProductWiseComparisonByToday",

    productWiseComparisonWeek:
      "/FoodChowRMS/ProductWiseComparisonByWeek",

    productWiseComparisonMonth:
      "/FoodChowRMS/ProductWiseComparisonByMonth",

    productWiseComparisonYear:
      "/FoodChowRMS/ProductWiseComparisonByYear",

    posTotalSalesToday:
      "/FoodChowRMS/PosTotalsalesToday",

    posTotalSalesWeek: "/FoodChowRMS/PosTotalsalesWeekly",

    posTotalSalesMonth: "/FoodChowRMS/PosTotalsalesmonthly",

    posTotalSalesYear: "/FoodChowRMS/PosTotalsalesyearly",

    posTotalSalesDateWise: "/FoodChowRMS/PosTotalsalesDateWise",

    incompletePaymentToday:
      "/FoodChowRMS/IncompletePaymentByToday",

    incompletePaymentWeek:
      "/FoodChowRMS/IncompletePaymentByWeek",


    incompletePaymentMonth:
      "/FoodChowRMS/IncompletePaymentByMonth",
    incompletePaymentYear:
      "/FoodChowRMS/IncompletePaymentByYear",

    incompletePaymentDateWise:
      "/FoodChowRMS/IncompletePaymentByDateWise",

    totalOnlinePaymentToday:
      "/FoodChowRMS/StipeConnectTransToday",

    totalOnlinePaymentWeekly:
      "/FoodChowRMS/StipeConnectTransWeekly",

    totalOnlinePaymentMonth:
      "/FoodChowRMS/StipeConnectTransMonthly",

    totalOnlinePaymentYear:
      "/FoodChowRMS/StipeConnectTransyearly",

    totalOnlinePaymentDateWise:
      "/FoodChowRMS/StipeConnectTransDateWise",
    voidOrdersToday:
      "/SalesReports/VoidOrdersByToday",
    voidOrdersWeek:
      "/SalesReports/VoidOrdersByWeek",
    voidOrdersMonth:
      "/SalesReports/VoidOrdersByMonth",
    voidOrdersYear:
      "/SalesReports/VoidOrdersByYear",
    voidOrdersDateWise:
      "/SalesReports/VoidOrdersByDateWise",
    salesByPosUserTodaySalesReport:
      "/SalesReports/SalesByPosUserByToday",
    salesByPosUserWeekSalesReport:
      "/SalesReports/SalesByPosUserByWeek",
    salesByPosUserMonthSalesReport:
      "/SalesReports/SalesByPosUserByMonth",
    salesByPosUserYearSalesReport:
      "/SalesReports/SalesByPosUserByYear",
    salesByPosUserDateWiseSalesReport:
      "/SalesReports/SalesByPosUserByDateWise",
    taxSummaryTodaySalesReport:
      "/SalesReports/TotalSalesTaxToday",
    taxSummaryWeeklySalesReport:
      "/SalesReports/TotalSalesTaxWeekly",
    taxSummaryMonthlySalesReport:
      "/SalesReports/TotalSalesTaxmonthly",
    taxSummaryYearlySalesReport:
      "/SalesReports/TotalSalesTaxYearly",
    taxSummaryDateWiseSalesReport:
      "/SalesReports/TotalSalesTaxDateWise",
    salesByItemSizeTodaySalesReport:
      "/SalesReports/SalesByItemSizeToday",
    salesByItemSizeDateWiseSalesReport:
      "/SalesReports/SalesByItemSizeDateWise",
    salesByItemSizeWeeklySalesReport:
      "/SalesReports/SalesByItemSizeWeekly",
    salesByItemSizeMonthlySalesReport:
      "/SalesReports/SalesByItemSizeMonthly",
    salesByItemSizeYearlySalesReport:
      "/SalesReports/SalesByItemSizeYearly",
  },


  setup: {
    getRestaurantInformation: "/RestaurantProfile/GetRestaurantInformation",
    updateShopLogo: "/RestaurantProfile/UpdateShopLogo",
    getShopTypesAndCuisine: "/RestaurantProfile/GetShopTypesAndCuisine",
    // getRestaurantInformation:
    //   "/RestaurantProfile/GetRestaurantInformation",

    saveOwnerInformation:
      "/RestaurantProfile/SaveOwnerInformation",

    updateShopProfile:
      "/RestaurantProfile/UpdateShopProfile",

    getRestaurantAddress:
      "/RestaurantProfile/GetRestaurantAddress",

    updateShopAddress:
      "/RestaurantProfile/UpdateShopAddress",

    getGalleryImages:
      "/FoodChowRMS/GetImagesByShopWD",

    getFoodGallery: "/FoodGallery/GetFoodgallery",
    addToFoodGallery: "/FoodGallery/AddToFoodGallery",
    deleteGalleryPhoto: "/FoodGallery/DeleteGalleryPhoto",

    //Delivery 
    getAllDeliveryZone: "/zone/get",
    addDeliveryZone: "/zone/select-zone",
    updateDeliveryZone: "/zone/update-zone",

    //Timings
    getRestaurantTimings: "/RestaurantProfile/GetShopTimings",
    updateRestaurantTimings: "/RestaurantProfile/UpdateShopTimings",

    // Facility
    getFacilityList: "/Facilities/GetFacilityList",
    getShopFacilities: "/RestaurantProfile/GetShopFacilities",
    addShopFacilitiesRequest: "/RestaurantProfile/AddShopFacilitiesRequest",
    addShopFacilities: "/RestaurantProfile/AddShopFacilities",
    deleteShopFacilities: "/RestaurantProfile/DeleteShopFacilities",
  },




  marketing: {
    getCoupons: "/FoodChowWD/GetCouponByShopIDWDForPos",
    addCoupon: "/foodchowwd/AddCouponWDForPos",
    updateCoupon: "/foodchowwd/updateCouponWDForPos",
    deleteCoupon: "/FoodChowWD/DeleteCouponWD",
    updateCouponStatus: "/FoodChowWD/UpdateCouponStatusWD",
  },
} as const;



