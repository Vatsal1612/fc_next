export interface ReportStep {
  step: number;
  title: string;
  path: string;
  internal?: string;
}

export const REPORT_STEPS: ReportStep[] = [
  { step: 1, title: "Total Sales", path: "/reports/TotalSales", internal: "/reports/total-sales" },
  { step: 2, title: "Sales By Item", path: "/reports/SalesByItem", internal: "/reports/salesby-item" },
  { step: 3, title: "Sales By Category", path: "/reports/SalesByCategory", internal: "/reports/salesby-category" },
  { step: 4, title: "Sales By Trading Sessions", path: "/reports/SalesByTradingSessions", internal: "/reports/sales-by-trading-session" },
  { step: 5, title: "Sales By Hour", path: "/reports/SalesByHour", internal: "/reports/sales-by-hour" },
  { step: 6, title: "Daily Closing Report", path: "/reports/DailyClosingReport", internal: "/reports/daily-closing-report" },
  { step: 7, title: "Weighted Average Transaction", path: "/reports/WeightedAverageTransaction", internal: "/reports/weighted-average-transaction" },
  { step: 8, title: "Top Selling Items", path: "/reports/TopSellingItems", internal: "/reports/top-selling-items" },
  { step: 9, title: "Customer List", path: "/reports/CustomerList", internal: "/reports/customer-list" },
  { step: 10, title: "Customer By Revenue", path: "/reports/CustomerByRevenue", internal: "/reports/customerbyrevenue" },
  { step: 11, title: "Comparison By Week", path: "/reports/ComparisonByWeek", internal: "/reports/comparisionweek" },
  { step: 12, title: "Comparison By Month", path: "/reports/ComparisonByMonth", internal: "/reports/comparisonbymonth" },
  { step: 13, title: "Comparison By Year", path: "/reports/ComparisonByYear", internal: "/reports/comparisionbyyear" },
  { step: 14, title: "Comparison By Product", path: "/reports/ComparisonByProduct", internal: "/reports/comparison-by-product" },
  { step: 15, title: "Refund Details", path: "/reports/RefundHistory", internal: "/reports/refund-history" },
  { step: 16, title: "Sales By Pos User", path: "/reports/SalesByPosUser", internal: "/reports/sales-by-pos-user" },
  { step: 17, title: "Pos Total Sales Reports", path: "/reports/PosTotalSalesReport", internal: "/reports/pos-total-sales-report" },
  { step: 18, title: "Ingredients Reports", path: "/reports/IngredientsReports", internal: "/reports/ingredients-reports" },
  { step: 19, title: "Tax Summary", path: "/reports/TaxSummary", internal: "/reports/tax-summary" },
  { step: 20, title: "Incomplete Payment", path: "/reports/IncompletePayment", internal: "/reports/incomplete-payment" },
  { step: 21, title: "Decline Order", path: "/reports/DeclinedOrder", internal: "/reports/declined-order" },
  { step: 22, title: "Sales By Order Method", path: "/reports/SalesByOrderMethodReport", internal: "/reports/sales-by-order-method-report" },
  { step: 23, title: "Online Order Report", path: "/reports/OnlineOrderReport", internal: "/reports/online-order-report" },
  { step: 24, title: "Sales By Item Variants", path: "/reports/SalesByItemSizeReports", internal: "/reports/sales-by-item-size-reports" },
  { step: 25, title: "Total Stripe Connect", path: "/reports/TotalStripeConnect", internal: "/reports/total-stripe-connect" },
];

export function getReportStepInfo(
  pathname: string,
  currentStepOverride?: number,
  totalStepsOverride?: number
) {
  const clean = (pathname || "").replace(/\/$/, "");
  const parts = clean.split("/").filter(Boolean);
  const adminModules = ["reports", "orders", "marketing", "menu", "setup"];
  const subpath =
    parts.length > 0 && !adminModules.includes(parts[0].toLowerCase())
      ? "/" + parts.slice(1).join("/")
      : clean;

  const lower = subpath.toLowerCase();

  // Alias for PosEndDay (maps between RefundHistory and PosTotalSalesReport)
  if (lower === "/reports/posendday" || lower === "/reports/pos-end-day") {
    return {
      currentIndex: 15,
      currentStep: { step: 16, title: "Pos End Day", path: "/reports/PosEndDay", internal: "/reports/pos-end-day" },
      stepNumber: 16,
      totalSteps: totalStepsOverride ?? 25,
      prevStep: REPORT_STEPS[14], // RefundHistory
      nextStep: REPORT_STEPS[16], // PosTotalSalesReport
    };
  }

  let index = -1;
  if (currentStepOverride !== undefined && currentStepOverride >= 1 && currentStepOverride <= REPORT_STEPS.length) {
    index = currentStepOverride - 1;
  } else {
    index = REPORT_STEPS.findIndex(
      (s) => s.path.toLowerCase() === lower || s.internal?.toLowerCase() === lower
    );
  }

  const stepNumber = currentStepOverride ?? (index >= 0 ? REPORT_STEPS[index].step : 1);
  const totalSteps = totalStepsOverride ?? 25;

  const prevStep = index > 0 ? REPORT_STEPS[index - 1] : null;
  const nextStep = index >= 0 && index < REPORT_STEPS.length - 1 ? REPORT_STEPS[index + 1] : null;

  return {
    currentIndex: index,
    currentStep: index >= 0 ? REPORT_STEPS[index] : null,
    stepNumber,
    totalSteps,
    prevStep,
    nextStep,
  };
}
