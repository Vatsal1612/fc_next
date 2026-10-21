export interface WizardStep {
  step: number;
  title: string;
  path: string;
  category: "setup" | "menu" | "orders" | "marketing";
}

export const WIZARD_STEPS: WizardStep[] = [
  // Setup (Steps 1-10)
  { step: 1, title: "My Profile", path: "/setup/my-profile", category: "setup" },
  { step: 2, title: "Restaurant Logo", path: "/setup/restaurantlogo", category: "setup" },
  { step: 3, title: "Restaurant Images", path: "/setup/restaurantimgae", category: "setup" },
  { step: 4, title: "Timings", path: "/setup/timmings", category: "setup" },
  { step: 5, title: "Delivery Settings", path: "/setup/delivery", category: "setup" },
  { step: 6, title: "Add Table", path: "/setup/add-table", category: "setup" },
  { step: 7, title: "Gallery", path: "/setup/gallery", category: "setup" },
  { step: 8, title: "Ambience", path: "/setup/ambience", category: "setup" },
  { step: 9, title: "Facility", path: "/setup/facility", category: "setup" },
  { step: 10, title: "Add Custom Domain", path: "/setup/add-custom-domain", category: "setup" },

  // Menu (Steps 11-23)
  { step: 11, title: "Category", path: "/menu/category", category: "menu" },
  { step: 12, title: "Items", path: "/menu/items", category: "menu" },
  { step: 13, title: "Item Code", path: "/menu/item-code", category: "menu" },
  { step: 14, title: "Variant", path: "/menu/varient", category: "menu" },
  { step: 15, title: "Choice", path: "/menu/choice", category: "menu" },
  { step: 16, title: "Extra", path: "/menu/extra", category: "menu" },
  { step: 17, title: "Tax", path: "/menu/tax", category: "menu" },
  { step: 18, title: "Item Deals", path: "/menu/item-deals", category: "menu" },
  { step: 19, title: "Additional Menu", path: "/menu/additional-menu", category: "menu" },
  { step: 20, title: "Upload Menu", path: "/menu/upload-menu", category: "menu" },
  { step: 21, title: "Menu Language", path: "/menu/menu-language-page", category: "menu" },
  { step: 22, title: "Pricing Plan", path: "/menu/pricing-plan", category: "menu" },
  { step: 23, title: "My Plan", path: "/menu/my-plan", category: "menu" },

  // Orders (Steps 24-29)
  { step: 24, title: "Order Setting", path: "/orders/OrderSetting", category: "orders" },
  { step: 25, title: "Category Mapper", path: "/orders/CategoryMapper", category: "orders" },
  { step: 26, title: "Ordering Widget", path: "/orders/OrderingWidget", category: "orders" },
  { step: 27, title: "Widget Setting", path: "/orders/WidgetSetting", category: "orders" },
  { step: 28, title: "Payment Gateway", path: "/orders/PaymentGateway", category: "orders" },
  { step: 29, title: "Delivery Integration", path: "/orders/DeliveryIntegration", category: "orders" },

  // Marketing (Steps 30-35)
  { step: 30, title: "Coupon", path: "/marketing/Coupon", category: "marketing" },
  { step: 31, title: "Marketing Material", path: "/marketing/MarketingMaterial", category: "marketing" },
  { step: 32, title: "WhatsApp Marketing", path: "/marketing/WhatsAppMarketing", category: "marketing" },
  { step: 33, title: "WhatsApp Notification Setting", path: "/marketing/WhatsappNotificationSetting", category: "marketing" },
  { step: 34, title: "QR Binding", path: "/marketing/QrBinding", category: "marketing" },
  { step: 35, title: "Real Time Offer", path: "/marketing/RealTimeOffer", category: "marketing" },
];

export function getStepInfo(pathname: string) {
  const clean = (pathname || "").replace(/\/$/, "");
  // Match either exact path or path after stripping restaurant prefix
  const parts = clean.split("/").filter(Boolean);
  const adminModules = ["reports", "orders", "marketing", "menu", "setup"];
  const subpath = parts.length > 0 && !adminModules.includes(parts[0].toLowerCase())
    ? "/" + parts.slice(1).join("/")
    : clean;

  const normalized = subpath.toLowerCase();
  const index = WIZARD_STEPS.findIndex((s) => s.path.toLowerCase() === normalized);

  if (index === -1) {
    return {
      currentIndex: -1,
      currentStep: null,
      prevStep: null,
      nextStep: null,
      totalSteps: WIZARD_STEPS.length,
    };
  }

  return {
    currentIndex: index,
    currentStep: WIZARD_STEPS[index],
    prevStep: index > 0 ? WIZARD_STEPS[index - 1] : null,
    nextStep: index < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[index + 1] : null,
    totalSteps: WIZARD_STEPS.length,
  };
}
