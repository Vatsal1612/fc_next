/**
 * Navigation tree for the admin shell (outer icon sidebar + inner submenu).
 * Transcribed verbatim from the original index.html — same labels, same Font
 * Awesome icon classes, same order. Route slugs are the original HTML file name
 * lowercased with underscores converted to hyphens.
 */
export interface NavItem {
  label: string;
  icon: string;
  href: string; // "#" means non-navigating (placeholder)
}

export interface NavSection {
  key: string;
  label: string;
  icon: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "setup",
    label: "Setup",
    icon: "fas fa-desktop",
    items: [
      { label: "My Profile", icon: "far fa-user-circle", href: "/setup/my-profile" },
      { label: "Restaurant Logo", icon: "fas fa-image", href: "/setup/restaurantlogo" },
      { label: "Restaurant Images", icon: "far fa-images", href: "/setup/restaurantimgae" },
      { label: "Restaurant Timings", icon: "far fa-clock", href: "/setup/timmings" },
      { label: "Delivery Settings", icon: "fas fa-truck", href: "/setup/delivery" },
      { label: "Add Table", icon: "fas fa-chair", href: "/setup/add-table" },
      { label: "Gallery", icon: "far fa-image", href: "/setup/gallery" },
      { label: "Ambience", icon: "fas fa-couch", href: "/setup/ambience" },
      { label: "Facilities", icon: "fas fa-wifi", href: "/setup/facility" },
      { label: "Add Custom Domain", icon: "fas fa-globe", href: "/setup/add-custom-domain" },
    ],
  },
  {
    key: "menu",
    label: "Menu",
    icon: "fas fa-list",
    items: [
      { label: "Categories", icon: "fas fa-tags", href: "/menu/category" },
      { label: "Items", icon: "fas fa-utensils", href: "/menu/items" },
      { label: "Item Code", icon: "fas fa-barcode", href: "/menu/item-code" },
      { label: "Variants", icon: "fas fa-code-branch", href: "/menu/varient" },
      { label: "Choices", icon: "fas fa-check-square", href: "/menu/choice" },
      { label: "Extras", icon: "fas fa-plus-circle", href: "/menu/extra" },
      { label: "Taxes", icon: "fas fa-file-invoice-dollar", href: "/menu/tax" },
      { label: "Item Deals", icon: "fas fa-tag", href: "/menu/item-deals" },
      { label: "Additional Menu", icon: "fas fa-plus", href: "/menu/additional-menu" },
      { label: "Upload Menus", icon: "fas fa-upload", href: "/menu/upload-menu" },
      { label: "Menu Language", icon: "fas fa-language", href: "/menu/menu-language-page" },
      { label: "Pricing Plan", icon: "fas fa-dollar-sign", href: "/menu/pricing-plan" },
      { label: "My Plan", icon: "far fa-calendar-alt", href: "/menu/my-plan" },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    icon: "fas fa-clipboard-list",
    items: [
      { label: "Order Setting", icon: "fas fa-cogs", href: "/orders/OrderSetting" },
      { label: "Category Mapper", icon: "fas fa-exchange-alt", href: "/orders/CategoryMapper" },
      { label: "Ordering Widget", icon: "fas fa-puzzle-piece", href: "/orders/OrderingWidget" },
      { label: "Widget Setting", icon: "fas fa-sliders-h", href: "/orders/WidgetSetting" },
      { label: "Payment Gateway", icon: "far fa-credit-card", href: "/orders/PaymentGateway" },
      { label: "Delivery Integration", icon: "fas fa-motorcycle", href: "/orders/DeliveryIntegration" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "fas fa-bullhorn",
    items: [
      { label: "Coupon", icon: "fas fa-ticket-alt", href: "/marketing/Coupon" },
      { label: "Marketing Material", icon: "fas fa-ad", href: "/marketing/MarketingMaterial" },
      { label: "WhatsApp Marketing", icon: "fab fa-whatsapp", href: "/marketing/WhatsAppMarketing" },
      { label: "Whatsapp Notification", icon: "fab fa-whatsapp", href: "/marketing/WhatsappNotificationSetting" },
      { label: "QR Binding", icon: "fas fa-qrcode", href: "/marketing/QrBinding" },
      { label: "Real Time Offer", icon: "fas fa-bolt", href: "/marketing/RealTimeOffer" },
    ],
  },
  {
    key: "report",
    label: "Report",
    icon: "fas fa-chart-bar",
    items: [
      { label: "Total Sales", icon: "fas fa-chart-line", href: "/reports/TotalSales" },
      { label: "Sales by items", icon: "fas fa-hamburger", href: "/reports/SalesByItem" },
      { label: "Sales by categories", icon: "fas fa-tags", href: "/reports/SalesByCategory" },
      { label: "Sales by trading session", icon: "fas fa-clock", href: "/reports/SalesByTradingSessions" },
      { label: "Sales by hour", icon: "fas fa-hourglass-half", href: "/reports/SalesByHour" },
      { label: "Daily Closing Report", icon: "fas fa-file-invoice", href: "/reports/DailyClosingReport" },
      { label: "Weighted average transaction", icon: "fas fa-balance-scale", href: "/reports/WeightedAverageTransaction" },
      { label: "Top selling items", icon: "fas fa-star", href: "/reports/TopSellingItems" },
      { label: "Customer List", icon: "fas fa-users", href: "/reports/CustomerList" },
      { label: "Customer By Revenue", icon: "fas fa-hand-holding-usd", href: "/reports/CustomerByRevenue" },
      { label: "Comparison By Week", icon: "fas fa-calendar-week", href: "/reports/ComparisonByWeek" },
      { label: "Comparison By Month", icon: "fas fa-calendar-alt", href: "/reports/ComparisonByMonth" },
      { label: "Comparison By Year", icon: "fas fa-calendar", href: "/reports/ComparisonByYear" },
      { label: "Comparison By Product", icon: "fas fa-box", href: "/reports/ComparisonByProduct" },
      { label: "Refund Details", icon: "fas fa-undo", href: "/reports/RefundHistory" },
      { label: "Pos End Day", icon: "fas fa-cash-register", href: "/reports/PosEndDay" },
      { label: "Sales By Pos User", icon: "fas fa-user-tag", href: "/reports/SalesByPosUser" },
      { label: "Pos Total Sales Reports", icon: "fas fa-receipt", href: "/reports/PosTotalSalesReport" },
      { label: "Ingredients Reports", icon: "fas fa-carrot", href: "/reports/IngredientsReports" },
      { label: "Tax Summary", icon: "fas fa-file-alt", href: "/reports/TaxSummary" },
      { label: "Incomplete Payment", icon: "fas fa-exclamation-circle", href: "/reports/IncompletePayment" },
      { label: "Decline Order", icon: "fas fa-times-circle", href: "/reports/DeclinedOrder" },
      { label: "Sales By Order Method", icon: "fas fa-shopping-cart", href: "/reports/SalesByOrderMethodReport" },
      { label: "Online Order Report", icon: "fas fa-laptop", href: "/reports/OnlineOrderReport" },
      { label: "Sales By Item Variants", icon: "fas fa-sitemap", href: "/reports/SalesByItemSizeReports" },
      { label: "TotalStripeConnectReport", icon: "fab fa-stripe-s", href: "/reports/TotalStripeConnect" },
    ],
  },
  {
    key: "support",
    label: "Support",
    icon: "fas fa-headset",
    items: [
      { label: "Help Center", icon: "fas fa-life-ring", href: "#" },
      { label: "Contact Support", icon: "fas fa-envelope", href: "#" },
      { label: "Documentation", icon: "fas fa-book", href: "#" },
    ],
  },
];
