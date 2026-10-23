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

    // extra category endpoints
    addExtraCategory: "/MenuMaster/AddExtraCategory",
    updateExtraCategory: "/MenuMaster/AddExtraCategory",
    deleteExtraCategory: "/MenuMaster/DeleteExtraCategory",

    // extra item endpoints
    addExtraItem: "/MenuMaster/AddExtraCategoryItem",
    deleteExtraItem: "/MenuMaster/DeleteExtraCategoryItem",
    changeExtraItemStatus: "/MenuMaster/ChangeStoreItemExtraCategoryOptionStatus",
    changeCategoryStatus: "/MenuMaster/ChangeStoreItemExtraCategoryStatus", // For categories (if same endpoint)
    updateExtraItem: "/MenuMaster/UpdateExtraOption",

    // item code
    getItemNames: "/FoodChowRMS/GetItemName",
    getItemCodeTypeSetting: "/FoodChowWD/GetItemCodeTypeSetting",
    saveItemCodeTypeSetting: "/FoodChowRMS/ItemCodeTypeSetting",
    updateItemCode: "/FoodChowRMS/UpdateItemCode",
    changeItemPosition: "/FoodItem/ChangeItemPosition",
    changeCategoryPosition: "/FoodCategory/ChangeCategoryPosition",

    // Tax
    getAllTax: "/TaxMaster/GetAllStoreTax",
    saveStoreTax: "/TaxMaster/SaveStoreTax",
    checkTaxApply: "/FoodChowWD/checktaxisapply",
    deleteStoreTax: "/TaxMaster/DeleteStoreTax",
    getTaxType: "/FoodChowWD/GetIncludingExcludingTax",
    getIncludingExcludingTax: "/FoodChowWD/GetIncludingExcludingTax",

    // apply tax
    getItemListWithSize: "/FoodChowWD/GetItemListWithSize",
    applyTaxOnAllItems: "/FoodChowWD/USP_AddTaxAllItemWithTaxID",
    addTaxAllItemWithTaxID: "/FoodChowWD/USP_AddTaxAllItemWithTaxID",
    removeTaxOnAllItems: "/FoodChowWD/USP_DeleteTaxAllItemWithTaxID",
    deleteTaxAllItemWithTaxID: "/FoodChowWD/USP_DeleteTaxAllItemWithTaxID",
    applyTaxToSingleItem: "/TaxMaster/AddTaxWithTaxID",
    removeTaxFromSingleItem: "/TaxMaster/DeleteTaxDetailsWithSize",
    getTaxDetailsWithSize: "/FoodChowWD/GetTaxDetailsWithSize",

    // choice
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
    assignVariantToItem: "/MenuMaster/AssignVariantToItem",
    getItems: "/MenuMaster/GetItemDetailsByShopIdMasterWithSoldOUtNew",
    deleteItem: "/MenuMaster/DeleteStoreItem",

    // Store Category CRUD
    addStoreCategory: "/MenuMaster/AddStoreCategory",
    categoryImageUpload: "/MenuMaster/CategoryImageUpload",
    deleteCategory: "/MenuMaster/DeleteCategory",
    changeStoreCategoryStatus: "/MenuMaster/ChangeStoreCategoryStatus",

    // Store Item CRUD
    editStoreItem: "/MenuMaster/EditStoreItem",
    itemImageUpload: "/MenuMaster/ItemImageUpload",
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

    // Item Deal
    addItemDeal: "/FoodChowRMS/AddDealWD",
    getAllItemDeal: "/FoodChowRMS/GetAllDealsByShopIDWD",

    // Menu Language
    getSupportedLanguageList: "/FoodChowWD/GetSupportedLanguageList",
    getAllLanguage: "/FoodChowRMS/GetAllLanguage",
    getSupportedLanguageForShop: "/FoodChowWD/GetSupportedLanguageForShop",
    saveLanguageForShop: "/FoodChowWD/SaveLanguageForShop",
    deleteLanguageForShop: "/FoodChowWD/DeleteLanguageForShop",
    setDefaultLanguageforShop: "/FoodChowWD/SetDefaultLanguageforShop",

    // Upload Menu Excel
    uploadMenuExcel: "/MenuMaster/UploadMenuExcel",
    downloadSampleMenuExcel: "/MenuMaster/DownloadSampleMenuExcel",
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

    // CRM Reports
    customerList: "/SalesReports/Get_CRM_Report",
    crmRevenueReport: "/SalesReports/CRM_Report_By_Orders",

    // Week & Month Comparisons
    weekComparison: "/SalesReportsWithoutPagination/WeekWiseComparision",
    monthWiseComparison: "/SalesReportsWithoutPagination/MonthWiseComparision",
    yearWiseComparison: "/FoodChowRMS/YearWiseComparision",

    // Product Wise Comparison
    productWiseComparisonToday: "/SalesReportsWithoutPagination/ProductWiseComparisionByToday",
    productWiseComparisonWeek: "/SalesReportsWithoutPagination/ProductWiseComparisionByWeek",
    productWiseComparisonMonth: "/SalesReportsWithoutPagination/ProductWiseComparisionByMonth",
    productWiseComparisonYear: "/FoodChowRMS/ProductWiseComparisonByYear",

    // Top Selling Items
    topSellingItemsToday: "/SalesReportsWithoutPagination/TopSellingItemsByToday",
    topSellingItemsWeek: "/SalesReportsWithoutPagination/TopSellingItemsByWeek",
    topSellingItemsDayWise: "/SalesReportsWithoutPagination/TopSellingItemsByDayWise",
    topSellingItemsMonth: "/SalesReportsWithoutPagination/TopSellingItemsByMonth",
    topSellingItemsYear: "/SalesReports/TopSellingItemsByYear",
    topSellingToday: "/SalesReportsWithoutPagination/TopSellingItemsByToday",
    topSellingDayWise: "/SalesReportsWithoutPagination/TopSellingItemsByDayWise",
    topSellingWeek: "/SalesReportsWithoutPagination/TopSellingItemsByWeek",
    topSellingMonth: "/SalesReportsWithoutPagination/TopSellingItemsByMonth",
    topSellingYear: "/FoodChowRMS/TopSellingItemsByYear",

    // Sales By Trading Session
    tradingSessionToday: "/SalesReportsWithoutPagination/SalesByTradingSessionByToday",
    tradingSessionWeek: "/SalesReportsWithoutPagination/SalesByTradingSessionByWeek",
    tradingSessionDayWise: "/SalesReportsWithoutPagination/SalesByTradingSessionByDayWise",
    tradingSessionMonth: "/SalesReportsWithoutPagination/SalesByTradingSessionByMonth",
    tradingSessionYear: "/SalesReports/SalesByTradingSessionByYear",

    // POS Users
    salesByHour: "/FoodChowRMS/SalesByHours",
    posUsers: "/FoodChowRMS/GetPosUserName",
    posEndDayReport: "/SalesReportsWithoutPagination/PosEndDayReport",
    salesByPosUserToday: "/SalesReportsWithoutPagination/SalesByPosUserByToday",
    salesByPosUserWeek: "/SalesReportsWithoutPagination/SalesByPosUserByWeek",
    salesByPosUserMonth: "/SalesReportsWithoutPagination/SalesByPosUserByMonth",
    salesByPosUserDateWise: "/SalesReportsWithoutPagination/SalesByPosUserByDateWise",
    salesByPosUserTodaySalesReport: "/SalesReportsWithoutPagination/SalesByPosUserByToday",
    salesByPosUserWeekSalesReport: "/SalesReportsWithoutPagination/SalesByPosUserByWeek",
    salesByPosUserMonthSalesReport: "/SalesReportsWithoutPagination/SalesByPosUserByMonth",
    salesByPosUserDateWiseSalesReport: "/SalesReportsWithoutPagination/SalesByPosUserByDateWise",
    salesByPosUserYear: "/FoodChowRMS/salesByPosUserByYear",
    salesByPosUserYearSalesReport: "/SalesReports/SalesByPosUserByYear",

    // Total Sales Tax
    taxSummaryToday: "/SalesReportsWithoutPagination/TotalSalesTaxToday",
    taxSummaryWeekly: "/SalesReportsWithoutPagination/TotalSalesTaxWeekly",
    taxSummaryMonthly: "/SalesReportsWithoutPagination/TotalSalesTaxmonthly",
    taxSummaryDateWise: "/SalesReportsWithoutPagination/TotalSalesTaxDateWise",
    taxSummaryTodaySalesReport: "/SalesReportsWithoutPagination/TotalSalesTaxToday",
    taxSummaryWeeklySalesReport: "/SalesReportsWithoutPagination/TotalSalesTaxWeekly",
    taxSummaryMonthlySalesReport: "/SalesReportsWithoutPagination/TotalSalesTaxmonthly",
    taxSummaryDateWiseSalesReport: "/SalesReportsWithoutPagination/TotalSalesTaxDateWise",
    taxSummaryYearly: "/FoodChowRMS/TotalSalesTaxyearly",
    taxSummaryYearlySalesReport: "/SalesReports/TotalSalesTaxYearly",

    // Declined / Void Orders
    declinedOrderToday: "/SalesReportsWithoutPagination/VoidOrdersByToday",
    declinedOrderWeekly: "/SalesReportsWithoutPagination/VoidOrdersByWeek",
    declinedOrderMonthly: "/SalesReportsWithoutPagination/VoidOrdersByMonth",
    declinedOrderDateWise: "/SalesReportsWithoutPagination/VoidOrdersByDateWise",
    declinedOrderYearly: "/FoodChowRMS/TotaldeclinedOrderyearly",
    voidOrdersToday: "/SalesReportsWithoutPagination/VoidOrdersByToday",
    voidOrdersWeek: "/SalesReportsWithoutPagination/VoidOrdersByWeek",
    voidOrdersMonth: "/SalesReportsWithoutPagination/VoidOrdersByMonth",
    voidOrdersDateWise: "/SalesReportsWithoutPagination/VoidOrdersByDateWise",
    voidOrdersYear: "/SalesReports/VoidOrdersByYear",

    // Expense Transactions
    getAllExpenseTransToday: "/SalesReportsWithoutPagination/GetAllExpenseTransToday",
    getAllExpenseTransWeekly: "/SalesReportsWithoutPagination/GetAllExpenseTransWeekly",
    getAllExpenseTransMonthly: "/SalesReportsWithoutPagination/GetAllExpenseTransmonthly",
    getAllExpenseTransDateWise: "/SalesReportsWithoutPagination/GetAllExpenseTransDateWise",

    // Refund History
    refundToday: "/SalesReportsWithoutPagination/RefundHistoryOfToday",
    refundWeek: "/SalesReportsWithoutPagination/RefundHistoryOfWeek",
    refundMonth: "/SalesReportsWithoutPagination/RefundHistoryByMonth",
    refundCustom: "/SalesReportsWithoutPagination/RefundHistoryByDateWise",
    today: "/SalesReportsWithoutPagination/RefundHistoryOfToday",
    week: "/SalesReportsWithoutPagination/RefundHistoryOfWeek",
    month: "/SalesReportsWithoutPagination/RefundHistoryByMonth",
    custom: "/SalesReportsWithoutPagination/RefundHistoryByDateWise",
    refundYear: "/SalesReports/RefundHistoryByYear",
    year: "/FoodChowWD/RefundHistoryByYear",

    // Discount Orders
    discountOrdersToday: "/SalesReportsWithoutPagination/DiscountOrdersByToday",
    discountOrdersWeek: "/SalesReportsWithoutPagination/DiscountOrdersByWeek",
    discountOrdersMonth: "/SalesReportsWithoutPagination/DiscountOrdersByMonth",
    discountOrdersDateWise: "/SalesReportsWithoutPagination/DiscountOrdersByDateWise",

    // Razorpay Orders
    razorpayOrdersToday: "/SalesReportsWithoutPagination/RazorpayOrdersByToday",
    razorpayOrdersWeek: "/SalesReportsWithoutPagination/RazorpayOrdersByWeek",
    razorpayOrdersMonth: "/SalesReportsWithoutPagination/RazorpayOrdersByMonth",
    razorpayOrdersDateWise: "/SalesReportsWithoutPagination/RazorpayOrdersByDateWise",

    // Ingredients
    ingredientsToday: "/SalesReportsWithoutPagination/TotalSalesOfIngredientsByToday",
    ingredientsWeek: "/SalesReportsWithoutPagination/TotalSalesOfIngredientsByWeek",
    ingredientsMonth: "/SalesReportsWithoutPagination/TotalSalesOfIngredientsByMonth",
    ingredientsCustom: "/SalesReportsWithoutPagination/TotalSalesOfIngredientsByDateWise",
    ingredientsYear: "/SalesReports/TotalSalesOfIngredientsByYear",

    // Sales by Items
    salesByItemsToday: "/SalesReportsWithoutPagination/SalesByItemsByToday",
    salesByItemsWeek: "/SalesReportsWithoutPagination/SalesByItemsByWeek",
    salesByItemsDayWise: "/SalesReportsWithoutPagination/SalesByItemsByDayWise",
    salesByItemsMonth: "/SalesReportsWithoutPagination/SalesByItemsByMonth",
    salesByItemsYear: "/SalesReports/SalesByItemsByYear",

    // Sales by Item Size
    salesByItemSizeToday: "/SalesReportsWithoutPagination/SalesByItemSizeToday",
    salesByItemSizeWeekly: "/SalesReportsWithoutPagination/SalesByItemSizeWeekly",
    salesByItemSizeMonthly: "/SalesReportsWithoutPagination/SalesByItemSizeMonthly",
    salesByItemSizeDateWise: "/SalesReportsWithoutPagination/SalesByItemSizeDateWise",
    salesByItemSizeTodaySalesReport: "/SalesReportsWithoutPagination/SalesByItemSizeToday",
    salesByItemSizeWeeklySalesReport: "/SalesReportsWithoutPagination/SalesByItemSizeWeekly",
    salesByItemSizeMonthlySalesReport: "/SalesReportsWithoutPagination/SalesByItemSizeMonthly",
    salesByItemSizeDateWiseSalesReport: "/SalesReportsWithoutPagination/SalesByItemSizeDateWise",
    salesByItemSizeYearly: "/FoodChowRMS/SalesByItemSizeyearly",
    salesByItemSizeYearlySalesReport: "/SalesReports/SalesByItemSizeYearly",

    // Total Sales
    totalSalesToday: "/SalesReports/TotalSalesByToday",
    totalSalesWeek: "/SalesReports/TotalSalesByWeek",
    totalSalesMonth: "/SalesReports/TotalSalesByMonth",
    totalSalesDateWise: "/SalesReports/TotalSalesByDateWise",
    totalSalesYear: "/SalesReports/TotalSalesByYear",

    // Total Sales (Export to Excel - Without Pagination)
    totalSalesTodayWithoutPagination: "/SalesReportsWithoutPagination/TotalSalesByToday",
    totalSalesWeekWithoutPagination: "/SalesReportsWithoutPagination/TotalSalesByWeek",
    totalSalesMonthWithoutPagination: "/SalesReportsWithoutPagination/TotalSalesByMonth",
    totalSalesDateWiseWithoutPagination: "/SalesReportsWithoutPagination/TotalSalesByDateWise",

    todaySales: "/FoodChowRMS/TotalSalesByToday",
    todaySummary: "/FoodChowRMS/TotalSalesByTodayTotal",
    weekSales: "/FoodChowRMS/TotalSalesByWeek",
    weekSummary: "/FoodChowRMS/TotalSalesByWeekTotal",
    monthSales: "/FoodChowRMS/TotalSalesByMonth",
    monthSummary: "/FoodChowRMS/TotalSalesByMonthTotal",
    yearSales: "/FoodChowRMS/TotalSalesByYear",
    yearSummary: "/FoodChowRMS/TotalSalesByYearTotal",
    customSales: "/FoodChowRMS/TotalSalesByDateWise",
    customSummary: "/FoodChowRMS/TotalSalesByDateWiseTotal",

    // Sales by Category
    salesByCategoryToday: "/SalesReportsWithoutPagination/SalesByCategoryByToday",
    salesByCategoryWeek: "/SalesReportsWithoutPagination/SalesByCategoryByWeek",
    salesByCategoryDayWise: "/SalesReportsWithoutPagination/SalesByCategoryByDayWise",
    salesByCategoryMonth: "/SalesReportsWithoutPagination/SalesByCategoryByMonth",
    salesByCategoryYear: "/SalesReports/SalesByCategoryByyear",

    // Daily Closing Report
    dailyClosingReport: "/SalesReportsWithoutPagination/DailyClosingReport",
    dailyClosingReportByDate: "/SalesReportsWithoutPagination/DailyClosingReportByDate",
    dailyClosingReportByMonth: "/SalesReportsWithoutPagination/DailyClosingReportByMonth",
    dailyClosingReportByPayment: "/SalesReportsWithoutPagination/DailyclosingReportByPayment",
    dailyClosingReportByPaymentDate: "/SalesReportsWithoutPagination/DailyclosingReportByPaymentDate",
    dailyClosingReportByPaymentMonth: "/SalesReportsWithoutPagination/DailyclosingReportByPaymentMonth",

    // Order Details & Invoices
    orderItemDetails: "/FoodChowRMS/GetOrderItemDetails",
    orderItems: "/FoodChowRMS/GetOrderItemDetails",
    invoiceDetails: "/FoodChowRMS/getOrderDetailsByOderId",
    invoiceItemList: "/FoodChowWD/getOrderedItemList",

    // Additional Reports
    orderMethodMonthly: "/FoodChowRMS/TotalSalesByOrderMethodMonthly",
    onlineOrderToday: "/FoodChowRMS/TotalCompleteOnlinePaymentByToday",
    onlineOrderWeek: "/FoodChowRMS/TotalCompleteOnlinePaymentByWeek",
    onlineOrderMonth: "/FoodChowRMS/TotalCompleteOnlinePaymentByMonth",
    onlineOrderYear: "/FoodChowRMS/TotalCompleteOnlinePaymentByYear",
    onlineOrderCustom: "/FoodChowRMS/TotalCompleteOnlinePaymentByDateWise",
    posTotalSalesToday: "/FoodChowRMS/PosTotalsalesToday",
    posTotalSalesWeek: "/FoodChowRMS/PosTotalsalesWeekly",
    posTotalSalesMonth: "/FoodChowRMS/PosTotalsalesmonthly",
    posTotalSalesYear: "/FoodChowRMS/PosTotalsalesyearly",
    posTotalSalesDateWise: "/FoodChowRMS/PosTotalsalesDateWise",
    incompletePaymentToday: "/FoodChowRMS/IncompletePaymentByToday",
    incompletePaymentWeek: "/FoodChowRMS/IncompletePaymentByWeek",
    incompletePaymentMonth: "/FoodChowRMS/IncompletePaymentByMonth",
    incompletePaymentYear: "/FoodChowRMS/IncompletePaymentByYear",
    incompletePaymentDateWise: "/FoodChowRMS/IncompletePaymentByDateWise",
    totalOnlinePaymentToday: "/FoodChowRMS/StipeConnectTransToday",
    totalOnlinePaymentWeekly: "/FoodChowRMS/StipeConnectTransWeekly",
    totalOnlinePaymentMonth: "/FoodChowRMS/StipeConnectTransMonthly",
    totalOnlinePaymentYear: "/FoodChowRMS/StipeConnectTransyearly",
    totalOnlinePaymentDateWise: "/FoodChowRMS/StipeConnectTransDateWise",
  },


  setup: {
    getRestaurantInformation: "/RestaurantProfile/GetRestaurantInformation",
    updateShopLogo: "/RestaurantProfile/UpdateShopLogo",
    getShopTypesAndCuisine: "/RestaurantProfile/GetShopTypesAndCuisine",
    saveOwnerInformation: "/RestaurantProfile/SaveOwnerInformation",
    updateShopProfile: "/RestaurantProfile/UpdateShopProfile",
    getRestaurantAddress: "/RestaurantProfile/GetRestaurantAddress",
    updateShopAddress: "/RestaurantProfile/UpdateShopAddress",
    getGalleryImages: "/FoodChowRMS/GetImagesByShopWD",

    getFoodGallery: "/FoodGallery/GetFoodgallery",
    addToFoodGallery: "/FoodGallery/AddToFoodGallery",
    deleteGalleryPhoto: "/FoodGallery/DeleteGalleryPhoto",

    getShopOverview: "/ShopOverview/GetShopOverview",
    saveShopOverview: "/ShopOverview/SaveShopOverview",
    uploadShopOverviewImage: "/ShopOverview/UploadShopOverviewImage",
    uploadRestaurantImageRMS: "/OfferMaster/UploadRestaurantImageRMS",
    deleteShopOverviewImage: "/FoodChowWD/DeleteShopOverviewImageByShopId",

    // Delivery 
    getAllDeliveryZone: "/zone/get",
    addDeliveryZone: "/zone/select-zone",
    updateDeliveryZone: "/zone/update-zone",
    deleteDeliveryZone: (zoneId: string | number) => `/zone/delete/${zoneId}`,
    getDeliverySettingsForShop: "/FoodChowWD/GetDeliverySettingsForShop",
    updateDeliverySettingsForShop: "/FoodChowWD/UpdateDeliverySettingsForShop",
    getCustomDeliveryLocation: "/FoodChowWD/GetCustomDeliveryLocation",
    addCustomDeliveryLocation: "/FoodChowWD/AddCustomDeliveryLocation",
    updateCustomDeliveryLocation: "/FoodChowWD/UpdateCustomDeliveryLocation",
    deleteCustomDeliveryLocation: "/FoodChowWD/DeleteCustomDeliveryLocation",
    changeCustomDeliveryLocationStatus: "/FoodChowWD/ChangeCustomDeliveryLocationStatus",

    // Timings
    getRestaurantTimings: "/RestaurantProfile/GetShopTimings",
    updateRestaurantTimings: "/RestaurantProfile/UpdateShopTimings",

    // Facility
    getFacilityList: "/Facilities/GetFacilityList",
    getShopFacilities: "/RestaurantProfile/GetShopFacilities",
    addShopFacilitiesRequest: "/RestaurantProfile/AddShopFacilitiesRequest",
    addShopFacilities: "/RestaurantProfile/AddShopFacilities",
    deleteShopFacilities: "/RestaurantProfile/DeleteShopFacilities",

    // Support
    addSupportTicket: "/UserMaster/AddShopSupportTicket",

    // Custom Domain
    saveCustomDomain: "/RestaurantProfile/SaveCustomDomain",

    // Shop Invoices
    getShopInvoices: "/Marketplace/GetShopInvoiceList",
    getFoodchowPricingPlanPurchases: "/MenuMaster/GetFoodchowPricingPlanPurchases",
  },




  marketing: {
    getCoupons: "/FoodChowWD/GetCouponByShopIDWDForPos",
    addCoupon: "/foodchowwd/AddCouponWDForPos",
    updateCoupon: "/foodchowwd/updateCouponWDForPos",
    deleteCoupon: "/FoodChowWD/DeleteCouponWD",
    updateCouponStatus: "/FoodChowWD/UpdateCouponStatusWD",
  },
} as const;



