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
      { label: "Order Setting", icon: "fas fa-cogs", href: "/orders/ordersetting" },
      { label: "Category Mapper", icon: "fas fa-exchange-alt", href: "/orders/category-mapper" },
      { label: "Ordering Widget", icon: "fas fa-puzzle-piece", href: "/orders/ordering-widget" },
      { label: "Widget Setting", icon: "fas fa-sliders-h", href: "/orders/widget-setting" },
      { label: "Payment Gateway", icon: "far fa-credit-card", href: "/orders/payment-gateway" },
      { label: "Delivery Integration", icon: "fas fa-motorcycle", href: "/orders/delivery-integration" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "fas fa-bullhorn",
    items: [
      { label: "Coupon", icon: "fas fa-ticket-alt", href: "/marketing/coupon" },
      { label: "Marketing Material", icon: "fas fa-ad", href: "/marketing/marketing-material" },
      { label: "WhatsApp Marketing", icon: "fab fa-whatsapp", href: "/marketing/whatsapp-marketing" },
      { label: "Whatsapp Notification", icon: "fab fa-whatsapp", href: "/marketing/whatsapp-notification-setting" },
      { label: "QR Binding", icon: "fas fa-qrcode", href: "/marketing/qr-binding" },
      { label: "Real Time Offer", icon: "fas fa-bolt", href: "/marketing/real-time-offer" },
    ],
  },
  {
    key: "report",
    label: "Report",
    icon: "fas fa-chart-bar",
    items: [
      { label: "Total Sales", icon: "fas fa-chart-line", href: "/reports/total-sales" },
      { label: "Sales by items", icon: "fas fa-hamburger", href: "/reports/salesby-item" },
      { label: "Sales by categories", icon: "fas fa-tags", href: "/reports/salesby-category" },
      { label: "Sales by trading session", icon: "fas fa-clock", href: "/reports/sales-by-trading-session" },
      { label: "Sales by hour", icon: "fas fa-hourglass-half", href: "/reports/sales-by-hour" },
      { label: "Daily Closing Report", icon: "fas fa-file-invoice", href: "/reports/daily-closing-report" },
      { label: "Weighted average transaction", icon: "fas fa-balance-scale", href: "/reports/weighted-average-transaction" },
      { label: "Top selling items", icon: "fas fa-star", href: "/reports/top-selling-items" },
      { label: "Customer List", icon: "fas fa-users", href: "/reports/customer-list" },
      { label: "Customer By Revenue", icon: "fas fa-hand-holding-usd", href: "/reports/customerbyrevenue" },
      { label: "Comparison By Week", icon: "fas fa-calendar-week", href: "/reports/comparisionweek" },
      { label: "Comparison By Month", icon: "fas fa-calendar-alt", href: "/reports/comparisonbymonth" },
      { label: "Comparison By Year", icon: "fas fa-calendar", href: "/reports/comparisionbyyear" },
      { label: "Comparison By Product", icon: "fas fa-box", href: "/reports/comparison-by-product" },
      { label: "Refund Details", icon: "fas fa-undo", href: "/reports/refund-history" },
      { label: "Pos End Day", icon: "fas fa-cash-register", href: "/reports/pos-end-day" },
      { label: "Sales By Pos User", icon: "fas fa-user-tag", href: "/reports/sales-by-pos-user" },
      { label: "Pos Total Sales Reports", icon: "fas fa-receipt", href: "/reports/pos-total-sales-report" },
      { label: "Ingredients Reports", icon: "fas fa-carrot", href: "/reports/ingredients-reports" },
      { label: "Tax Summary", icon: "fas fa-file-alt", href: "/reports/tax-summary" },
      { label: "Incomplete Payment", icon: "fas fa-exclamation-circle", href: "/reports/incomplete-payment" },
      { label: "Decline Order", icon: "fas fa-times-circle", href: "/reports/declined-order" },
      { label: "Sales By Order Method", icon: "fas fa-shopping-cart", href: "/reports/sales-by-order-method-report" },
      { label: "Online Order Report", icon: "fas fa-laptop", href: "/reports/online-order-report" },
      { label: "Sales By Item Variants", icon: "fas fa-sitemap", href: "/reports/sales-by-item-size-reports" },
      { label: "TotalStripeConnectReport", icon: "fab fa-stripe-s", href: "/reports/total-stripe-connect" },
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
