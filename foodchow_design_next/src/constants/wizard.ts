import { REPORT_STEPS } from "./reports";

export type WizardModuleKey = "setup" | "menu" | "orders" | "marketing" | "reports";

export interface WizardStep {
  step: number;
  title: string;
  path: string;
  internal?: string;
  aliases?: string[];
  category: WizardModuleKey;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. Setup Module Steps (1 to 10)
// ═════════════════════════════════════════════════════════════════════════════
export const SETUP_STEPS: WizardStep[] = [
  { step: 1, title: "My Profile", path: "/setup/my-profile", category: "setup" },
  { step: 2, title: "Restaurant Logo", path: "/setup/restaurantlogo", internal: "/setup/restaurant-logo", category: "setup" },
  { step: 3, title: "Restaurant Images", path: "/setup/restaurantimgae", internal: "/setup/restaurant-images", category: "setup" },
  { step: 4, title: "Timings", path: "/setup/timmings", internal: "/setup/timings", category: "setup" },
  { step: 5, title: "Delivery Settings", path: "/setup/delivery", category: "setup" },
  { step: 6, title: "Add Table", path: "/setup/add-table", category: "setup" },
  { step: 7, title: "Gallery", path: "/setup/gallery", category: "setup" },
  { step: 8, title: "Ambience", path: "/setup/ambience", category: "setup" },
  { step: 9, title: "Facility", path: "/setup/facility", internal: "/setup/facilities", category: "setup" },
  { step: 10, title: "Add Custom Domain", path: "/setup/add-custom-domain", category: "setup" },
];

// ═════════════════════════════════════════════════════════════════════════════
// 2. Menu Module Steps (1 to 13)
// ═════════════════════════════════════════════════════════════════════════════
export const MENU_STEPS: WizardStep[] = [
  { step: 1, title: "Category", path: "/menu/category", internal: "/menu/categories", category: "menu" },
  { step: 2, title: "Items", path: "/menu/items", category: "menu" },
  { step: 3, title: "Item Code", path: "/menu/item-code", category: "menu" },
  { step: 4, title: "Variant", path: "/menu/varient", internal: "/menu/variant", aliases: ["/menu/variants"], category: "menu" },
  { step: 5, title: "Choice", path: "/menu/choice", internal: "/menu/choices", category: "menu" },
  { step: 6, title: "Extra", path: "/menu/extra", internal: "/menu/extras", category: "menu" },
  { step: 7, title: "Tax", path: "/menu/tax", internal: "/menu/taxes", aliases: ["/menu/apply-tax"], category: "menu" },
  { step: 8, title: "Item Deals", path: "/menu/item-deals", category: "menu" },
  { step: 9, title: "Additional Menu", path: "/menu/additional-menu", aliases: ["/menu/additional-menu/add"], category: "menu" },
  { step: 10, title: "Upload Menu", path: "/menu/upload-menu", internal: "/menu/upload-menus", category: "menu" },
  { step: 11, title: "Menu Language", path: "/menu/menu-language-page", internal: "/menu/menu-language", category: "menu" },
  { step: 12, title: "Pricing Plan", path: "/menu/pricing-plan", category: "menu" },
  { step: 13, title: "My Plan", path: "/menu/my-plan", category: "menu" },
];

// ═════════════════════════════════════════════════════════════════════════════
// 3. Orders Module Steps (1 to 6)
// ═════════════════════════════════════════════════════════════════════════════
export const ORDERS_STEPS: WizardStep[] = [
  { step: 1, title: "Order Setting", path: "/orders/ordersetting", internal: "/orders/OrderSetting", category: "orders" },
  { step: 2, title: "Category Mapper", path: "/orders/category-mapper", internal: "/orders/CategoryMapper", category: "orders" },
  { step: 3, title: "Ordering Widget", path: "/orders/ordering-widget", internal: "/orders/OrderingWidget", category: "orders" },
  { step: 4, title: "Widget Setting", path: "/orders/widget-setting", internal: "/orders/WidgetSetting", category: "orders" },
  { step: 5, title: "Payment Gateway", path: "/orders/payment-gateway", internal: "/orders/PaymentGateway", category: "orders" },
  { step: 6, title: "Delivery Integration", path: "/orders/delivery-integration", internal: "/orders/DeliveryIntegration", category: "orders" },
];

// ═════════════════════════════════════════════════════════════════════════════
// 4. Marketing Module Steps (1 to 6)
// ═════════════════════════════════════════════════════════════════════════════
export const MARKETING_STEPS: WizardStep[] = [
  { step: 1, title: "Coupon", path: "/marketing/coupon", internal: "/marketing/Coupon", category: "marketing" },
  { step: 2, title: "Marketing Material", path: "/marketing/marketing-material", internal: "/marketing/MarketingMaterial", category: "marketing" },
  { step: 3, title: "WhatsApp Marketing", path: "/marketing/whatsapp-marketing", internal: "/marketing/WhatsAppMarketing", category: "marketing" },
  { step: 4, title: "WhatsApp Notification Setting", path: "/marketing/whatsapp-notification-setting", internal: "/marketing/WhatsappNotificationSetting", category: "marketing" },
  { step: 5, title: "QR Binding", path: "/marketing/qr-binding", internal: "/marketing/QrBinding", category: "marketing" },
  { step: 6, title: "Real Time Offer", path: "/marketing/real-time-offer", internal: "/marketing/RealTimeOffer", category: "marketing" },
];

// ═════════════════════════════════════════════════════════════════════════════
// 5. Reports Module Steps (1 to 25)
// ═════════════════════════════════════════════════════════════════════════════
export const REPORTS_MODULE_STEPS: WizardStep[] = REPORT_STEPS.map((r) => ({
  step: r.step,
  title: r.title,
  path: r.path,
  internal: r.internal,
  category: "reports" as const,
}));

export const MODULE_STEPS: Record<WizardModuleKey, WizardStep[]> = {
  setup: SETUP_STEPS,
  menu: MENU_STEPS,
  orders: ORDERS_STEPS,
  marketing: MARKETING_STEPS,
  reports: REPORTS_MODULE_STEPS,
};

// Flattened for backward compatibility
export const WIZARD_STEPS: WizardStep[] = [
  ...SETUP_STEPS,
  ...MENU_STEPS,
  ...ORDERS_STEPS,
  ...MARKETING_STEPS,
];

/**
 * Detect module, subpath (without restaurant subdomain), and subdomain from pathname.
 */
export function detectModule(pathname: string): { module: WizardModuleKey; subpath: string; subdomain: string } {
  const clean = (pathname || "").replace(/\/$/, "");
  const parts = clean.split("/").filter(Boolean);
  const adminModules = ["setup", "menu", "orders", "marketing", "reports", "report"];

  let subdomain = "";
  let subpath = clean;

  if (parts.length > 0) {
    const firstLower = parts[0].toLowerCase();
    if (!adminModules.includes(firstLower)) {
      subdomain = parts[0];
      subpath = "/" + parts.slice(1).join("/");
    }
  }

  const subParts = subpath.split("/").filter(Boolean);
  const firstSub = subParts[0]?.toLowerCase() || "";

  let moduleKey: WizardModuleKey = "setup";
  if (firstSub === "reports" || firstSub === "report") {
    moduleKey = "reports";
  } else if (firstSub === "menu") {
    moduleKey = "menu";
  } else if (firstSub === "orders") {
    moduleKey = "orders";
  } else if (firstSub === "marketing") {
    moduleKey = "marketing";
  } else if (firstSub === "setup") {
    moduleKey = "setup";
  } else {
    // Check if subpath matches any module's steps
    const lower = subpath.toLowerCase();
    for (const [key, steps] of Object.entries(MODULE_STEPS)) {
      if (
        steps.some(
          (s) =>
            s.path.toLowerCase() === lower ||
            s.internal?.toLowerCase() === lower ||
            s.aliases?.some((a) => a.toLowerCase() === lower) ||
            lower.startsWith(s.path.toLowerCase())
        )
      ) {
        moduleKey = key as WizardModuleKey;
        break;
      }
    }
  }

  return { module: moduleKey, subpath, subdomain };
}

/**
 * Get individual step info for the given pathname and module.
 * Each module has its own 1-based step counter, and Previous/Next buttons
 * are strictly individual to that module (disabled on first & last steps).
 */
export function getStepInfo(
  pathname: string,
  currentStepOverride?: number,
  totalStepsOverride?: number,
  moduleOverride?: WizardModuleKey
) {
  const { module: detectedModule, subpath, subdomain } = detectModule(pathname);
  const activeModule = moduleOverride ?? detectedModule;
  const steps = MODULE_STEPS[activeModule] || SETUP_STEPS;
  const lower = subpath.toLowerCase();

  // Special alias for PosEndDay in reports
  if (activeModule === "reports" && (lower === "/reports/posendday" || lower === "/reports/pos-end-day")) {
    return {
      module: activeModule,
      currentIndex: 15,
      currentStep: {
        step: 16,
        title: "Pos End Day",
        path: "/reports/PosEndDay",
        internal: "/reports/pos-end-day",
        category: "reports" as const,
      },
      stepNumber: 16,
      totalSteps: totalStepsOverride ?? 25,
      prevStep: steps[14] ?? null,
      nextStep: steps[16] ?? null,
      subdomain,
    };
  }

  let index = -1;
  if (currentStepOverride !== undefined && currentStepOverride >= 1 && currentStepOverride <= steps.length) {
    index = currentStepOverride - 1;
  } else {
    // 1) Match exact path or internal or aliases
    index = steps.findIndex(
      (s) =>
        s.path.toLowerCase() === lower ||
        s.internal?.toLowerCase() === lower ||
        s.aliases?.some((a) => a.toLowerCase() === lower)
    );

    // 2) If not matched, try prefix match (for subpages like /menu/additional-menu/add)
    if (index === -1) {
      index = steps.findIndex((s) => lower.startsWith(s.path.toLowerCase()));
    }
  }

  const stepNumber = currentStepOverride ?? (index >= 0 ? steps[index].step : 1);
  const totalSteps = totalStepsOverride ?? steps.length;
  const currentStep = index >= 0 ? steps[index] : steps[0] ?? null;

  // Individual Prev/Next navigation strictly within this module!
  const prevStep = index > 0 ? steps[index - 1] : null;
  const nextStep = index >= 0 && index < steps.length - 1 ? steps[index + 1] : null;

  return {
    module: activeModule,
    currentIndex: index,
    currentStep,
    stepNumber,
    totalSteps,
    prevStep,
    nextStep,
    subdomain,
  };
}

export const getModuleStepInfo = getStepInfo;
