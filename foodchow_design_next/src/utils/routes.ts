/**
 * Route aliases mapping legacy FoodChow admin URLs to internal Next.js routes,
 * and vice-versa, with PascalCase (UpperCamelCase) route support for Orders,
 * Marketing, and Reports modules.
 */

export const INTERNAL_TO_PASCAL: Record<string, string> = {
  // Orders
  "/orders/ordersetting": "/orders/OrderSetting",
  "/orders/category-mapper": "/orders/CategoryMapper",
  "/orders/ordering-widget": "/orders/OrderingWidget",
  "/orders/widget-setting": "/orders/WidgetSetting",
  "/orders/payment-gateway": "/orders/PaymentGateway",
  "/orders/delivery-integration": "/orders/DeliveryIntegration",

  // Marketing
  "/marketing/coupon": "/marketing/Coupon",
  "/marketing/marketing-material": "/marketing/MarketingMaterial",
  "/marketing/whatsapp-marketing": "/marketing/WhatsAppMarketing",
  "/marketing/whatsapp-notification-setting": "/marketing/WhatsappNotificationSetting",
  "/marketing/qr-binding": "/marketing/QrBinding",
  "/marketing/real-time-offer": "/marketing/RealTimeOffer",

  // Reports
  "/reports/total-sales": "/reports/TotalSales",
  "/reports/salesby-item": "/reports/SalesByItem",
  "/reports/salesby-category": "/reports/SalesByCategory",
  "/reports/sales-by-trading-session": "/reports/SalesByTradingSessions",
  "/reports/sales-by-hour": "/reports/SalesByHour",
  "/reports/daily-closing-report": "/reports/DailyClosingReport",
  "/reports/weighted-average-transaction": "/reports/WeightedAverageTransaction",
  "/reports/top-selling-items": "/reports/TopSellingItems",
  "/reports/customer-list": "/reports/CustomerList",
  "/reports/customerbyrevenue": "/reports/CustomerByRevenue",
  "/reports/comparisionweek": "/reports/ComparisonByWeek",
  "/reports/comparisonbymonth": "/reports/ComparisonByMonth",
  "/reports/comparisionbyyear": "/reports/ComparisonByYear",
  "/reports/comparison-by-product": "/reports/ComparisonByProduct",
  "/reports/refund-history": "/reports/RefundHistory",
  "/reports/pos-end-day": "/reports/PosEndDay",
  "/reports/sales-by-pos-user": "/reports/SalesByPosUser",
  "/reports/pos-total-sales-report": "/reports/PosTotalSalesReport",
  "/reports/ingredients-reports": "/reports/IngredientsReports",
  "/reports/tax-summary": "/reports/TaxSummary",
  "/reports/incomplete-payment": "/reports/IncompletePayment",
  "/reports/declined-order": "/reports/DeclinedOrder",
  "/reports/sales-by-order-method-report": "/reports/SalesByOrderMethodReport",
  "/reports/online-order-report": "/reports/OnlineOrderReport",
  "/reports/sales-by-item-size-reports": "/reports/SalesByItemSizeReports",
  "/reports/total-stripe-connect": "/reports/TotalStripeConnect",
};

// Derived automatically from INTERNAL_TO_PASCAL without duplicate manual entries
export const PASCAL_TO_INTERNAL: Record<string, string> = Object.entries(INTERNAL_TO_PASCAL).reduce(
  (acc, [internalRoute, pascalRoute]) => {
    acc[pascalRoute.toLowerCase()] = internalRoute;
    return acc;
  },
  {} as Record<string, string>
);

export const LEGACY_TO_PASCAL: Record<string, string> = {
  // Legacy aliases
  stripe: "/orders/PaymentGateway",
  marketingmaterial: "/marketing/MarketingMaterial",
  "marketingmaterial/marketingmaterial": "/marketing/MarketingMaterial",
  realtimeoffers: "/marketing/RealTimeOffer",
  whatsappnotification: "/marketing/WhatsappNotificationSetting",
  totalsales: "/reports/TotalSales",
  declinedorder: "/reports/DeclinedOrder",
  "reports/declinedorder": "/reports/DeclinedOrder",
  "reports/declined-order": "/reports/DeclinedOrder",
  salesbytradingsessions: "/reports/SalesByTradingSessions",
  "sales-by-trading-session": "/reports/SalesByTradingSessions",
  "reports/sales-by-trading-session": "/reports/SalesByTradingSessions",
  "reports/salesbytradingsessions": "/reports/SalesByTradingSessions",
};

/**
 * Get internal physical Next.js route for a given path (after stripping restaurant slug)
 */
export function resolveInternalRoute(subpath: string): string | null {
  const clean = subpath.replace(/^\/+|\/+$/g, "");
  const lower = "/" + clean.toLowerCase();

  // 1. Check PascalCase lookup
  if (PASCAL_TO_INTERNAL[lower]) {
    return PASCAL_TO_INTERNAL[lower];
  }

  // 2. Check legacy alias lookup
  const cleanKey = clean.toLowerCase();
  if (LEGACY_TO_PASCAL[cleanKey]) {
    const pascal = LEGACY_TO_PASCAL[cleanKey];
    return PASCAL_TO_INTERNAL[pascal.toLowerCase()] ?? pascal;
  }

  // 3. Check if subpath is already an admin module route
  const adminModules = ["reports", "orders", "marketing", "menu", "setup"];
  const firstSegment = clean.split("/")[0].toLowerCase();
  if (adminModules.includes(firstSegment)) {
    return `/${clean}`;
  }

  return null;
}

/**
 * Convert an internal link into a restaurant-prefixed URL
 */
export function getRestaurantNavHref(internalHref: string, subdomain: string = "foodchowdemoindia"): string {
  if (!internalHref || internalHref === "#") return "#";
  const sub = subdomain.trim() || "foodchowdemoindia";

  const clean = internalHref.startsWith("/") ? internalHref : `/${internalHref}`;
  return `/${sub}${clean}`;
}

/**
 * Normalize browser pathname back to canonical navigation href for active tab highlighting
 */
export function getNormalizedPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";

  const first = parts[0].toLowerCase();
  const adminModules = ["reports", "orders", "marketing", "menu", "setup", "login"];

  let subpath = "";
  if (!adminModules.includes(first)) {
    subpath = "/" + parts.slice(1).join("/");
  } else {
    subpath = "/" + parts.join("/");
  }

  // Check if this matches an INTERNAL_TO_PASCAL route
  const lower = subpath.toLowerCase();
  for (const [internalKey, pascalVal] of Object.entries(INTERNAL_TO_PASCAL)) {
    if (lower === internalKey.toLowerCase() || lower === pascalVal.toLowerCase()) {
      return pascalVal;
    }
  }

  return subpath;
}
