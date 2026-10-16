"use client";

import { useEffect, useState, useRef } from "react";
import { menuService } from "@/api/services/menu.service";
import { setupService } from "@/api/services/setup.service";
// @ts-ignore
import "./page.css";

const Check = () => (
    <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function PricingPlanPage() {
    // 4 Main Tabs: Growth Plan, POS, Online Ordering, Add-ons
    const [activeTab, setActiveTab] = useState<"growth" | "pos" | "online" | "addons">("growth");
    const [onlineSubTab, setOnlineSubTab] = useState<"fixed" | "commission">("fixed");
    const [isPosYearly, setIsPosYearly] = useState(false);
    const [kdsYearly, setKdsYearly] = useState(true);

    // Plans data (Only 4 and 5 are removed; all others 1, 2, 3, 7, 1006-1011, 999 are used)
    const [growthPlan, setGrowthPlan] = useState<any>(null); // Id: 1
    const [posLitePlan, setPosLitePlan] = useState<any>(null); // Id: 2
    const [posPremiumPlan, setPosPremiumPlan] = useState<any>(null); // Id: 3
    const [fixedFreePlan, setFixedFreePlan] = useState<any>(null); // Id: 1006
    const [fixedMonthlyPlan, setFixedMonthlyPlan] = useState<any>(null); // Id: 1007
    const [fixedYearlyPlan, setFixedYearlyPlan] = useState<any>(null); // Id: 1008
    const [commFreePlan, setCommFreePlan] = useState<any>(null); // Id: 1009
    const [commLitePlan, setCommLitePlan] = useState<any>(null); // Id: 1010
    const [commPremiumPlan, setCommPremiumPlan] = useState<any>(null); // Id: 1011
    const [onlineCommissionPlan, setOnlineCommissionPlan] = useState<any>(null); // Id: 7

    const [marketplaceBundle, setMarketplaceBundle] = useState<any>(null); // Id: 999
    const [addOns, setAddOns] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<Array<{ id: number; name: string; price: number; billingCycle: string }>>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
    const [, setLoading] = useState(true);

    const [currency, setCurrency] = useState<string>("Rs.");
    const [currencySymbol, setCurrencySymbol] = useState<string>("₹");
    const lastCurrency = useRef<string | null>(null);

    // Resolve currency from session / restaurant profile
    useEffect(() => {
        const initCurrency = async () => {
            let sessionCurr =
                sessionStorage.getItem("shopcurrency") ||
                sessionStorage.getItem("currency") ||
                localStorage.getItem("shopcurrency") ||
                localStorage.getItem("currency") ||
                "";
            const shopId = sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id");

            if (!sessionCurr && shopId) {
                try {
                    const info = await setupService.getRestaurantInformation(Number(shopId));
                    if (info?.currency) {
                        sessionCurr = info.currency;
                        sessionStorage.setItem("currency", sessionCurr);
                        sessionStorage.setItem("shopcurrency", sessionCurr);
                    }
                } catch (e) {
                    console.error("Error fetching restaurant currency:", e);
                }
            }

            if (sessionCurr) {
                const trimmed = sessionCurr.trim();
                let sym = trimmed;
                if (trimmed === "INR" || trimmed === "Rs." || trimmed === "Rs" || trimmed === "₹") {
                    sym = "₹";
                } else if (trimmed === "USD" || trimmed === "$") {
                    sym = "$";
                } else if (trimmed === "AUD") {
                    sym = "A$";
                } else if (trimmed === "CAD") {
                    sym = "C$";
                } else if (trimmed === "EUR" || trimmed === "€") {
                    sym = "€";
                } else if (trimmed === "GBP" || trimmed === "£") {
                    sym = "£";
                }
                setCurrency(trimmed);
                setCurrencySymbol(sym);
            }
        };
        initCurrency();
    }, []);

    // Load active subscriptions for active plan badges and restrictions
    useEffect(() => {
        const loadSubscriptions = async () => {
            const shopId = sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id");
            if (!shopId) return;
            try {
                const res = await setupService.getPricingPlanPurchases(shopId);
                const list = res?.data || res?.Data || res;
                if (Array.isArray(list)) {
                    setActiveSubscriptions(list);
                }
            } catch (e) {
                console.warn("Could not load active subscriptions for styling:", e);
            }
        };
        loadSubscriptions();
    }, []);

    const isIndian = currency === "Rs." || currency === "INR" || currency === "₹";

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null || price === "") return "";
        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) return "";

        return numericPrice.toLocaleString(isIndian ? "en-IN" : "en-US", {
            minimumFractionDigits: isIndian ? 0 : 2,
            maximumFractionDigits: isIndian ? 0 : 2,
        });
    };

    /**
     * Resolves the correct display price:
     * - In INR: Checks BillingText for formatted currency (e.g. ₹25,000, ₹350, ₹999, etc.)
     * - In USD: Uses the Pricing array Price
     */
    const getPlanDisplayPrice = (planData: any, requestedCycle: "YEAR" | "MONTH" = "YEAR", fallbackPrice: number = 0): number => {
        if (!planData) return fallbackPrice;

        if (isIndian) {
            // For POS, check cycle
            if (planData.Id === 2) {
                return requestedCycle === "YEAR" ? 2500 : 350;
            }
            if (planData.Id === 3) {
                return requestedCycle === "YEAR" ? 5475 : 590;
            }

            // Extract directly from API BillingText (e.g. "₹25,000 / Year", "₹350 / Month", "₹999 / month")
            if (typeof planData.BillingText === "string") {
                const match = planData.BillingText.match(/(?:₹|Rs\.?)\s*([\d,]+)/i);
                if (match && match[1]) {
                    const parsed = Number(match[1].replace(/,/g, ""));
                    if (!Number.isNaN(parsed)) {
                        return parsed;
                    }
                }
            }
        }

        // For USD / foreign currencies, resolve directly from API Pricing array
        if (Array.isArray(planData.Pricing) && planData.Pricing.length > 0) {
            const matched = planData.Pricing.find(
                (p: any) => String(p.BillingCycle).toUpperCase() === requestedCycle.toUpperCase()
            );
            if (matched && matched.Price != null) return Number(matched.Price);
            if (planData.Pricing[0]?.Price != null) return Number(planData.Pricing[0].Price);
        }

        return fallbackPrice;
    };

    // Subscriptions check
    const isPlanActive = (planId: number, planName?: string) => {
        return activeSubscriptions.some((sub: any) => {
            const status = String(sub.Status || sub.status || "").toUpperCase();
            if (status !== "ACTIVE") return false;
            if (Number(sub.Id || sub.plan_id) === planId) return true;
            if (planName && String(sub.PlanName || sub.plan_name || "").toLowerCase() === planName.toLowerCase()) return true;
            return false;
        });
    };

    const isGrowthActive = isPlanActive(1, "Growth Plan") || isPlanActive(1, "Restaurant Growth Package");

    const handleCreateSubscription = async (selectedPlan: any, cycleOverride?: string) => {
        try {
            const shopId = Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id"));

            if (!shopId) {
                console.error("Shop ID not found in session");
                alert("Please log in to your restaurant to subscribe.");
                return;
            }

            const cycle = (cycleOverride || (isPosYearly ? "YEAR" : "MONTH")) as "YEAR" | "MONTH";
            const price = getPlanDisplayPrice(selectedPlan, cycle);

            const response = await menuService.createSubscription({
                amount: price,
                oneTimeAmount: 0,
                addonIds: "",
                planId: selectedPlan?.Id || 1,
                billingCycle: cycle,
                planName: selectedPlan?.Name || "Plan",
                currency: isIndian ? "INR" : currency,
                shopId: shopId,
            });

            console.log("SUBSCRIPTION CREATED:", response);
            alert(`Subscription request for ${selectedPlan?.Name || "Plan"} initiated successfully!`);
        } catch (error) {
            console.error("CREATE SUBSCRIPTION ERROR:", error);
            alert("Failed to initiate subscription. Please try again.");
        }
    };

    // Load All Plan Details (Except 4 and 5) and Addons from API
    useEffect(() => {
        if (lastCurrency.current === currency && growthPlan) return;
        lastCurrency.current = currency;

        const loadPlans = async () => {
            try {
                setLoading(true);

                // Fetch IDs: 1 (Growth), 2 (POS Lite), 3 (POS Premium), 7 (Commission), 999 (Bundle),
                // 1006, 1007, 1008 (Fixed), 1009, 1010, 1011 (Comm).
                // Strictly exclude 4 and 5.
                const [
                    p1,
                    p2,
                    p3,
                    p7,
                    p999,
                    p1006,
                    p1007,
                    p1008,
                    p1009,
                    p1010,
                    p1011,
                    addonResponse,
                ] = await Promise.all([
                    menuService.getPlanDetails(1, currency).catch(() => null),
                    menuService.getPlanDetails(2, currency).catch(() => null),
                    menuService.getPlanDetails(3, currency).catch(() => null),
                    menuService.getPlanDetails(7, currency).catch(() => null),
                    menuService.getPlanDetails(999, currency).catch(() => null),
                    menuService.getPlanDetails(1006, currency).catch(() => null),
                    menuService.getPlanDetails(1007, currency).catch(() => null),
                    menuService.getPlanDetails(1008, currency).catch(() => null),
                    menuService.getPlanDetails(1009, currency).catch(() => null),
                    menuService.getPlanDetails(1010, currency).catch(() => null),
                    menuService.getPlanDetails(1011, currency).catch(() => null),
                    menuService.getAddOns(currency).catch(() => []),
                ]);

                setGrowthPlan(p1);
                setPosLitePlan(p2);
                setPosPremiumPlan(p3);
                setOnlineCommissionPlan(p7);
                setMarketplaceBundle(p999);
                setFixedFreePlan(p1006);
                setFixedMonthlyPlan(p1007);
                setFixedYearlyPlan(p1008);
                setCommFreePlan(p1009);
                setCommLitePlan(p1010);
                setCommPremiumPlan(p1011);

                const addonsData = Array.isArray(addonResponse)
                    ? addonResponse
                    : Array.isArray(addonResponse?.Result)
                        ? addonResponse.Result
                        : Array.isArray(addonResponse?.Result?.AddOns)
                            ? addonResponse.Result.AddOns
                            : Array.isArray(addonResponse?.AddOns)
                                ? addonResponse.AddOns
                                : [];

                setAddOns(addonsData);
            } catch (error) {
                console.error("PLAN API ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPlans();
    }, [currency]);

    // Addons Cart management
    const toggleAddonCart = (id: number, name: string, price: number, cycle: string) => {
        setCartItems((prev) => {
            const exists = prev.some((item) => item.id === id);
            if (exists) {
                return prev.filter((item) => item.id !== id);
            } else {
                return [...prev, { id, name, price, billingCycle: cycle }];
            }
        });
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);

    const handlePayAddons = async () => {
        if (cartItems.length === 0) return;
        try {
            const shopId = Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id"));
            const addonIdsStr = cartItems.map((a) => `${a.id}:${a.price}:${a.billingCycle}`).join(",");
            const planNames = cartItems.map((a) => a.name).join(" + ");

            await menuService.createSubscription({
                amount: cartTotal,
                oneTimeAmount: 0,
                addonIds: addonIdsStr,
                planId: 999,
                billingCycle: "YEAR",
                planName: planNames,
                currency: isIndian ? "INR" : currency,
                shopId: shopId || 1,
            });

            alert(`Order for add-ons placed successfully! Total: ${currencySymbol}${formatPrice(cartTotal)}`);
        } catch (e) {
            console.error("Failed to pay for add-ons:", e);
            alert("Could not process add-on checkout. Please try again.");
        }
    };

    // Group Add-ons by Id so multiple cycle options don't duplicate cards
    const groupedAddons: any[] = [];
    addOns.forEach((a: any) => {
        const id = a.Id ?? a.id;
        let existing = groupedAddons.find((item: any) => (item.Id ?? item.id) === id);
        if (!existing) {
            existing = { ...a, Id: id, pricingOptions: [] };
            groupedAddons.push(existing);
        }
        existing.pricingOptions.push({
            price: a.Price != null ? Number(a.Price) : 0,
            original: a.OriginalPrice != null ? Number(a.OriginalPrice) : 0,
            cycle: a.BillingCycle || a.billingCycle || "YEAR",
        });
    });

    const normalizedAddons = groupedAddons.map((addon: any) => {
        const id = addon.Id;
        const name = addon.Name ?? addon.name ?? "";
        const selectedCycle = addon.BillingCycle || "YEAR";

        let matchedPricing = addon.pricingOptions?.find(
            (opt: any) => String(opt.cycle).toUpperCase() === selectedCycle.toUpperCase()
        ) || addon.pricingOptions?.[0];

        const price = matchedPricing?.price ?? (addon.Price != null ? Number(addon.Price) : 0);

        return {
            ...addon,
            Id: id,
            Name: name,
            Price: price,
            BillingCycle: selectedCycle,
        };
    });

    // POS Pricing resolution
    const posCycleKey = isPosYearly ? "YEAR" : "MONTH";
    const posLitePrice = getPlanDisplayPrice(posLitePlan, posCycleKey, isIndian ? (isPosYearly ? 2500 : 350) : (isPosYearly ? 99 : 10));
    const posPremPrice = getPlanDisplayPrice(posPremiumPlan, posCycleKey, isIndian ? (isPosYearly ? 5475 : 590) : (isPosYearly ? 300 : 30));

    // Online Ordering Pricing resolution
    const fixedFreePrice = getPlanDisplayPrice(fixedFreePlan, "YEAR", 0);
    const fixedMonthlyPrice = getPlanDisplayPrice(fixedMonthlyPlan, "MONTH", isIndian ? 999 : 30);
    const fixedYearlyPrice = getPlanDisplayPrice(fixedYearlyPlan, "YEAR", isIndian ? 9999 : 300);
    const commFreePrice = getPlanDisplayPrice(commFreePlan, "YEAR", 0);
    const commLitePrice = getPlanDisplayPrice(commLitePlan, "YEAR", isIndian ? 5475 : 90);
    const commPremiumPrice = getPlanDisplayPrice(commPremiumPlan, "YEAR", isIndian ? 10900 : 180);

    // Growth Plan details
    const growthPrice = getPlanDisplayPrice(growthPlan, "YEAR", isIndian ? 25000 : 600);
    const growthTotalValue = isIndian ? (growthPlan?.TotalValue || 47925) : 1200;
    const growthTotalSavings = isIndian ? (growthPlan?.TotalSavings || 22925) : 600;

    return (
        <div id="pg-menu-pricing-plan">
            <div className="page-content" style={{ padding: "20px 24px" }}>
                {/* ═══ 4 MAIN TABS (Growth Plan, POS, Online Ordering, Add-ons) ═══ */}
                <div className="tab-bar">
                    <button
                        type="button"
                        className={`tab ${activeTab === "growth" ? "active" : ""}`}
                        onClick={() => setActiveTab("growth")}
                    >
                        Growth Plan
                    </button>
                    <button
                        type="button"
                        className={`tab ${activeTab === "pos" ? "active" : ""}`}
                        onClick={() => setActiveTab("pos")}
                    >
                        POS (Point of Sale)
                    </button>
                    <button
                        type="button"
                        className={`tab ${activeTab === "online" ? "active" : ""}`}
                        onClick={() => setActiveTab("online")}
                    >
                        Online Ordering
                    </button>
                    <button
                        type="button"
                        className={`tab ${activeTab === "addons" ? "active" : ""}`}
                        onClick={() => setActiveTab("addons")}
                    >
                        Add-ons
                    </button>
                </div>

                {/* ═════════════════════════════════════════════════════════
                    TAB 1: GROWTH PLAN PANEL (Plan Id: 1)
                   ═════════════════════════════════════════════════════════ */}
                {activeTab === "growth" && (
                    <div id="panel-growth" className="plan-wrapper">
                        <div className="plan-heading">
                            <h2>Everything You Get in the Growth Package</h2>
                            <p>A complete, done-for-you system to maximize revenue.</p>
                        </div>

                        <div className="outer-card">
                            {/* Dark Green Price Card */}
                            <div className="price-card">
                                <div className="plan-name">{growthPlan?.Name || "Restaurant Growth Package"}</div>
                                <div className="price-row">
                                    <span className="new-price">
                                        {currencySymbol}{formatPrice(growthPrice)}
                                    </span>
                                    <span className="per-year">/ year</span>
                                </div>
                                <div className="all-features">{growthPlan?.Subtitle || "All Features In One Plan"}</div>
                            </div>

                            {/* Core Features List */}
                            <div id="features-list">
                                {(growthPlan?.Features && growthPlan.Features.length > 0
                                    ? growthPlan.Features.filter((f: any) => f.IsIncluded)
                                    : [
                                          { Id: 1, Name: "Take Away / Dine In / Delivery" },
                                          { Id: 2, Name: "Razorpay / Stripe payment gateway" },
                                          { Id: 3, Name: "Online Order + Billing Full app" },
                                          { Id: 4, Name: `${currencySymbol}${isIndian ? "1,00,000" : "1,235"} Free Sales Credit` },
                                          { Id: 5, Name: "Menu customization" },
                                          { Id: 6, Name: "Tax Management" },
                                          { Id: 7, Name: "Promo Code / Coupon" },
                                          { Id: 8, Name: "Multiple Language" },
                                          { Id: 9, Name: "Own Driver/Porter Delivery Integration" },
                                          { Id: 10, Name: "Custom Domain" },
                                          { Id: 11, Name: "Google Local Optimisation" },
                                          { Id: 12, Name: "Google Analytics" },
                                          { Id: 13, Name: "Coaching Session" },
                                          { Id: 14, Name: "250 Orders Guaranteed in 90 Days" },
                                          { Id: 15, Name: "SEO Optimization" },
                                      ]
                                ).map((feature: any) => (
                                    <div className="feature-row" key={feature.Id}>
                                        <div className="feature-icon">
                                            <Check />
                                        </div>
                                        <span>{feature.Name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* FREE Add-ons Included in Growth */}
                            <div className="addons-header">
                                <span>Get FREE Powerful Add-ons</span>
                                <span className="valued">Valued</span>
                            </div>

                            {normalizedAddons.slice(0, 8).map((addon, index) => (
                                <div className="addon-row" key={`${addon.Id}-${addon.Price}-${index}`}>
                                    <div className="addon-icon">
                                        <Check />
                                    </div>
                                    <span className="addon-name">{addon.Name}</span>
                                    <span className="addon-price">
                                        {currencySymbol}{formatPrice(addon.Price)} / year
                                    </span>
                                </div>
                            ))}

                            {/* Guarantee Card */}
                            <div className="guarantee-card">
                                <h3>{growthPlan?.Guarantee?.Title || "Guaranteed 250 Orders in 90 Days"}</h3>
                                <p>
                                    {growthPlan?.Guarantee?.Description ||
                                        `₹${isIndian ? "1,00,000" : "1,235"} in minimum Sales, Orders or walk-in customers within 90 days`}
                                </p>
                            </div>

                            {/* Total Value & Savings Box */}
                            <div className="totals-card">
                                <div className="total-bar red">
                                    Total Value: {currencySymbol}{formatPrice(growthTotalValue)}
                                </div>
                                <div className="total-bar green">
                                    Save {currencySymbol}{formatPrice(growthTotalSavings)}
                                </div>
                                {isGrowthActive ? (
                                    <button
                                        type="button"
                                        className="buy-btn"
                                        style={{ background: "#27ae60", cursor: "default" }}
                                    >
                                        ✓ Currently Active Plan
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="buy-btn"
                                        onClick={() => handleCreateSubscription(growthPlan || { Id: 1, Name: "Growth Plan" }, "YEAR")}
                                    >
                                        {growthPlan?.CTAText || "Buy Growth Plan"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════
                    TAB 2: POS (POINT OF SALE) PANEL (Plans Id: 2 and 3)
                   ═════════════════════════════════════════════════════════ */}
                {activeTab === "pos" && (
                    <div id="panel-pos" className="pos-wrapper">
                        <p className="pos-desc">
                            Run your restaurant from a single screen — billing, KOT, tables, and reports — with the option
                            to add online ordering and channels later.
                        </p>

                        {/* Monthly / Yearly Toggle */}
                        <div className="billing-toggle-row">
                            <span className="toggle-label" style={{ fontWeight: !isPosYearly ? 800 : 500 }}>
                                Monthly
                            </span>
                            <div
                                className={`toggle-track ${!isPosYearly ? "monthly" : ""}`}
                                onClick={() => setIsPosYearly((prev) => !prev)}
                                style={{ cursor: "pointer" }}
                            >
                                <div
                                    className="toggle-thumb"
                                    style={{ left: isPosYearly ? "23px" : "3px" }}
                                ></div>
                            </div>
                            <span className="toggle-label" style={{ fontWeight: isPosYearly ? 800 : 500 }}>
                                Yearly
                            </span>
                            <span className="save-badge">Save 40%</span>
                        </div>

                        {/* Two plan cards: Lite (2) and Premium (3) */}
                        <div className="pos-cards">
                            {/* LITE PLAN (Id: 2) */}
                            <div className={`pos-card ${isPlanActive(2, posLitePlan?.Name) ? "purchased" : ""}`}>
                                <div className="pos-plan-name">{posLitePlan?.Name || "Lite"}</div>
                                <div className="pos-plan-desc">
                                    {posLitePlan?.Subtitle || "Everything a single-outlet restaurant needs to start billing today."}
                                </div>
                                <div className="pos-price">
                                    {currencySymbol}{formatPrice(posLitePrice)}
                                    <span> / {isPosYearly ? "Year" : "Month"}</span>
                                </div>

                                {isPlanActive(2, posLitePlan?.Name) ? (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                    >
                                        ✓ Currently Active
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        onClick={() => handleCreateSubscription(posLitePlan || { Id: 2, Name: "POS Lite" }, posCycleKey)}
                                    >
                                        {posLitePlan?.CTAText || "Buy Lite Plan"}
                                    </button>
                                )}

                                {/* Features by section */}
                                {(posLitePlan?.Features && posLitePlan.Features.length > 0
                                    ? posLitePlan.Features
                                    : [
                                          { Id: 14, Name: "Includes everything in Free plan", ExtraInfo: "Billing & operations" },
                                          { Id: 15, Name: "Custom payment methods (cash, UPI, card)", ExtraInfo: "Billing & operations" },
                                          { Id: 16, Name: "Address customization for delivery", ExtraInfo: "Billing & operations" },
                                          { Id: 17, Name: "Service charges & tax setup", ExtraInfo: "Billing & operations" },
                                          { Id: 18, Name: "Multi-user with role permissions", ExtraInfo: "Billing & operations" },
                                          { Id: 19, Name: "Item notes & item codes", ExtraInfo: "Billing & operations" },
                                          { Id: 20, Name: "Expense tracking & daily reports", ExtraInfo: "Billing & operations" },
                                          { Id: 21, Name: "Printer customization (KOT & receipt)", ExtraInfo: "Setup & customization" },
                                          { Id: 22, Name: "Table reservation", ExtraInfo: "Setup & customization" },
                                          { Id: 23, Name: "Cloud sync across devices", ExtraInfo: "Setup & customization" },
                                      ]
                                )
                                    ?.reduce((sections: any[], feature: any) => {
                                        const title = feature.ExtraInfo || "Features";
                                        const section = sections.find((s) => s.title === title);
                                        if (section) {
                                            section.features.push(feature);
                                        } else {
                                            sections.push({ title, features: [feature] });
                                        }
                                        return sections;
                                    }, [])
                                    .map((section: any) => (
                                        <div key={section.title}>
                                            <div className="feat-section-title">{section.title}</div>
                                            {section.features.map((feature: any) => (
                                                <div className="feat-item" key={feature.Id}>
                                                    <div className="feat-check">
                                                        <Check />
                                                    </div>
                                                    <span>{feature.Name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>

                            {/* PREMIUM PLAN (Id: 3) */}
                            <div className={`pos-card premium ${isPlanActive(3, posPremiumPlan?.Name) ? "purchased" : ""}`}>
                                <div className="recommended-badge">Recommended</div>
                                <div className="pos-plan-name">{posPremiumPlan?.Name || "Premium"}</div>
                                <div className="pos-plan-desc">
                                    {posPremiumPlan?.Subtitle || "For growing restaurants ready to take dine-in, takeaway, and online — all in one place."}
                                </div>
                                <div className="pos-price">
                                    {currencySymbol}{formatPrice(posPremPrice)}
                                    <span> / {isPosYearly ? "Year" : "Month"}</span>
                                </div>

                                {isPlanActive(3, posPremiumPlan?.Name) ? (
                                    <button
                                        type="button"
                                        className="pos-buy-btn premium-btn"
                                        style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                    >
                                        ✓ Currently Active
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="pos-buy-btn premium-btn"
                                        onClick={() => handleCreateSubscription(posPremiumPlan || { Id: 3, Name: "POS Premium" }, posCycleKey)}
                                    >
                                        {posPremiumPlan?.CTAText || "Get Premium Plan"}
                                    </button>
                                )}

                                <div className="feat-section-title">Everything In Lite, plus</div>

                                {(posPremiumPlan?.Features && posPremiumPlan.Features.length > 0
                                    ? posPremiumPlan.Features.filter((f: any) => f.IsIncluded)
                                    : [
                                          { Id: 27, Name: "Meal deals & combo builder" },
                                          { Id: 28, Name: "Split bill & split payment" },
                                          { Id: 29, Name: "Multiple menus (lunch, dinner, party)" },
                                          { Id: 30, Name: "Item-level cost & profit estimates" },
                                          { Id: 34, Name: "Auto-print online orders to KOT" },
                                          { Id: 35, Name: "Online order auto-accept rules" },
                                          { Id: 36, Name: "Coupons & promo codes" },
                                          { Id: 37, Name: "Dine-in QR code (table-side ordering)" },
                                      ]
                                ).map((feature: any) => (
                                    <div className="feat-item" key={feature.Id}>
                                        <div className="feat-check">
                                            <Check />
                                        </div>
                                        <span>{feature.Name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════
                    TAB 3: ONLINE ORDERING TAB PANEL (Plans 1006-1011 & 7)
                   ═════════════════════════════════════════════════════════ */}
                {activeTab === "online" && (
                    <div id="panel-online" className="oo-wrapper">
                        {/* Fixed / Commission sub-tabs */}
                        <div className="oo-subtab-row">
                            <button
                                type="button"
                                className={`oo-subtab ${onlineSubTab === "fixed" ? "active" : ""}`}
                                onClick={() => setOnlineSubTab("fixed")}
                            >
                                Fixed Plan
                            </button>
                            <button
                                type="button"
                                className={`oo-subtab ${onlineSubTab === "commission" ? "active" : ""}`}
                                onClick={() => setOnlineSubTab("commission")}
                            >
                                Commission Plan
                            </button>
                        </div>

                        {/* Fixed Plan content (1006 Free, 1007 Monthly, 1008 Yearly) */}
                        {onlineSubTab === "fixed" && (
                            <div id="oo-fixed">
                                <div className="oo-cards">
                                    {/* 1006: Free Plan */}
                                    {fixedFreePlan && (
                                        <div className={`oo-col ${isPlanActive(1006, fixedFreePlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge teal">{fixedFreePlan.Title || "FREE"}</div>
                                            <div className="oo-plan-name">{fixedFreePlan.Name || "Free Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(fixedFreePrice)} Lifetime
                                            </div>
                                            <div className="oo-desc">{fixedFreePlan.Subtitle || "Basic starter plan"}</div>
                                            {isPlanActive(1006, fixedFreePlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    onClick={() => handleCreateSubscription(fixedFreePlan || { Id: 1006, Name: "Free Plan" })}
                                                >
                                                    {fixedFreePlan.CTAText || "Choose Free"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Orders per month: Up to 25
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Branded ordering page + Google visibility
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Menu management
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Table booking
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Call & directions button
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Basic reporting
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Contract: None
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1007: Monthly Plan */}
                                    {fixedMonthlyPlan && (
                                        <div className={`oo-col ${isPlanActive(1007, fixedMonthlyPlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge orange">{fixedMonthlyPlan.Title || "MONTHLY"}</div>
                                            <div className="oo-plan-name">{fixedMonthlyPlan.Name || "Monthly Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(fixedMonthlyPrice)} / month
                                            </div>
                                            <div className="oo-desc">{fixedMonthlyPlan.Subtitle || "Cancel anytime"}</div>
                                            {isPlanActive(1007, fixedMonthlyPlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    onClick={() => handleCreateSubscription(fixedMonthlyPlan || { Id: 1007, Name: "Monthly Plan" })}
                                                >
                                                    {fixedMonthlyPlan.CTAText || "Buy Now"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Orders per month: No limit
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Online payment gateway
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Branded ordering page + Google visibility
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Menu management
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Table booking
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Basic reporting
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Contract: Cancel anytime
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1008: Yearly Plan */}
                                    {fixedYearlyPlan && (
                                        <div className={`oo-col featured ${isPlanActive(1008, fixedYearlyPlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge teal">{fixedYearlyPlan.BadgeText || fixedYearlyPlan.Title || "RECOMMENDED"}</div>
                                            <div className="oo-plan-name">{fixedYearlyPlan.Name || "Yearly Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(fixedYearlyPrice)} / year
                                            </div>
                                            <div className="oo-desc">{fixedYearlyPlan.Subtitle || "Save up to 50%"}</div>
                                            {isPlanActive(1008, fixedYearlyPlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-buy-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-buy-btn"
                                                    onClick={() => handleCreateSubscription(fixedYearlyPlan || { Id: 1008, Name: "Yearly Plan" })}
                                                >
                                                    {fixedYearlyPlan.CTAText || "Buy Now"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Orders per month: No limit
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Online payment gateway
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Branded ordering page + Google visibility
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Menu management
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Table booking
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Basic reporting
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Contract: Billed once a year (Save 50%)
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Commission Plan content (1009 Free, 1010 Lite, 1011 Premium, and 7 Commission) */}
                        {onlineSubTab === "commission" && (
                            <div id="oo-commission">
                                <div className="oo-cards">
                                    {/* 1009: Free Plan */}
                                    {commFreePlan && (
                                        <div className={`oo-col ${isPlanActive(1009, commFreePlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge teal">{commFreePlan.Title || "FREE"}</div>
                                            <div className="oo-plan-name">{commFreePlan.Name || "Free Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(commFreePrice)} Lifetime
                                            </div>
                                            <div className="oo-desc">{commFreePlan.Subtitle || "Pay as you go"}</div>
                                            {isPlanActive(1009, commFreePlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    onClick={() => handleCreateSubscription(commFreePlan || { Id: 1009, Name: "Free Plan" })}
                                                >
                                                    {commFreePlan.CTAText || "Choose Free"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Branded ordering page
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Menu management
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Basic reporting
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    No setup fee & no contract
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1010: Lite Plan */}
                                    {commLitePlan && (
                                        <div className={`oo-col ${isPlanActive(1010, commLitePlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge orange">{commLitePlan.Title || "LITE"}</div>
                                            <div className="oo-plan-name">{commLitePlan.Name || "Lite Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(commLitePrice)} / year
                                            </div>
                                            <div className="oo-desc">{commLitePlan.Subtitle || "Growing business"}</div>
                                            {isPlanActive(1010, commLitePlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-get-btn"
                                                    onClick={() => handleCreateSubscription(commLitePlan || { Id: 1010, Name: "Lite Plan" })}
                                                >
                                                    {commLitePlan.CTAText || "Choose Lite"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Everything in Free
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Table reservation
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    WhatsApp order alerts
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Low commission per order
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1011: Premium Plan */}
                                    {commPremiumPlan && (
                                        <div className={`oo-col featured ${isPlanActive(1011, commPremiumPlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge teal">{commPremiumPlan.BadgeText || commPremiumPlan.Title || "MOST POPULAR"}</div>
                                            <div className="oo-plan-name">{commPremiumPlan.Name || "Premium Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(commPremiumPrice)} / year
                                            </div>
                                            <div className="oo-desc">{commPremiumPlan.Subtitle || "Most Popular"}</div>
                                            {isPlanActive(1011, commPremiumPlan?.Name) ? (
                                                <button
                                                    type="button"
                                                    className="oo-buy-btn"
                                                    style={{ background: "#e6fcf5", color: "#0ca678", border: "1px solid #63e6be" }}
                                                >
                                                    ✓ Currently Active
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="oo-buy-btn"
                                                    onClick={() => handleCreateSubscription(commPremiumPlan || { Id: 1011, Name: "Premium Plan" })}
                                                >
                                                    {commPremiumPlan.CTAText || "Choose Premium"}
                                                </button>
                                            )}

                                            <div className="oo-features" style={{ marginTop: "14px" }}>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Everything in Lite
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Advanced analytics & reports
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Priority support
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Custom offer module
                                                </div>
                                                <div className="oo-feat">
                                                    <div className="oo-check green"><Check /></div>
                                                    Lowest commission per order
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 7: Lifetime Commission Plan (if present) */}
                                    {onlineCommissionPlan && !commFreePlan && !commLitePlan && (
                                        <div className={`oo-col ${isPlanActive(7, onlineCommissionPlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge orange">{onlineCommissionPlan.BadgeText || "ONE-TIME"}</div>
                                            <div className="oo-plan-name">{onlineCommissionPlan.Name || "Commission Plan"}</div>
                                            <div className="oo-price-plain">{onlineCommissionPlan.BillingText}</div>
                                            <div className="oo-desc">{onlineCommissionPlan.Subtitle}</div>
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                onClick={() => handleCreateSubscription(onlineCommissionPlan)}
                                            >
                                                {onlineCommissionPlan.CTAText || "Get Started"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════
                    TAB 4: ADD-ONS TAB PANEL (with Cart Summary)
                   ═════════════════════════════════════════════════════════ */}
                {activeTab === "addons" && (
                    <div id="panel-addons">
                        <div className="ao-layout">
                            {/* Add-on Cards Grid */}
                            <div className="ao-grid-wrap">
                                <div className="ao-grid">
                                    {normalizedAddons.map((addon, index) => {
                                        const isSelected = cartItems.some((item) => item.id === addon.Id);
                                        const isKDS = addon.Name.toUpperCase().includes("KDS");

                                        return (
                                            <div className="ao-card" key={`ao-card-${addon.Id ?? "item"}-${index}`}>
                                                {addon.BadgeText && (
                                                    <div className="ao-badge-wrap">
                                                        <div className="ao-badge-limited">{addon.BadgeText}</div>
                                                    </div>
                                                )}
                                                <div className="ao-card-header">
                                                    <div className="ao-icon blue">
                                                        <svg viewBox="0 0 24 24">
                                                            <rect x="2" y="3" width="20" height="14" rx="2" />
                                                            <line x1="8" y1="21" x2="16" y2="21" />
                                                            <line x1="12" y1="17" x2="12" y2="21" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="ao-name">{addon.Name}</div>
                                                        <div className="ao-price">
                                                            {currencySymbol}
                                                            {formatPrice(addon.Price)}
                                                            <span>
                                                                {addon.BillingCycle ? ` / ${addon.BillingCycle.toLowerCase()}` : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ao-features">
                                                    <div className="ao-feat-item">
                                                        <div className="chk">
                                                            <Check />
                                                        </div>
                                                        {addon.Description || "Unlock powerful capability for your restaurant"}
                                                    </div>
                                                </div>

                                                {isGrowthActive ? (
                                                    <button
                                                        type="button"
                                                        className="ao-select-btn"
                                                        style={{ background: "#f1f3f5", color: "#868e96", border: "1px solid #dee2e6", cursor: "not-allowed" }}
                                                    >
                                                        INCLUDED IN GROWTH PLAN
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={`ao-select-btn ${isSelected ? "selected" : ""}`}
                                                        style={
                                                            isSelected
                                                                ? { background: "#fff0f0", color: "#e53e3e", border: "1.5px solid #fecaca" }
                                                                : {}
                                                        }
                                                        onClick={() => toggleAddonCart(addon.Id, addon.Name, addon.Price, addon.BillingCycle)}
                                                    >
                                                        {isSelected ? "✕ Cancel / Remove" : "Select Add-on"}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="ao-cart">
                                <div className="ao-cart-title">Cart Summary</div>
                                {cartItems.length === 0 ? (
                                    <div className="ao-cart-empty">No add-ons selected</div>
                                ) : (
                                    <div className="ao-cart-items">
                                        {cartItems.map((item) => (
                                            <div className="ao-cart-item" key={item.id}>
                                                <span className="name">{item.name}</span>
                                                <span className="price">
                                                    {currencySymbol}{formatPrice(item.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="ao-subtotal-row">
                                    <span>Subtotal</span>
                                    <span>{currencySymbol}{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="ao-total-row">
                                    <span>Total</span>
                                    <span>{currencySymbol}{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="ao-trust-row">
                                    <div className="ao-trust-item">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        Money back
                                        <br />
                                        guarantee
                                    </div>
                                    <div className="ao-trust-item">
                                        <svg viewBox="0 0 24 24">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        SSL encrypted
                                        <br />
                                        payment
                                    </div>
                                    <div className="ao-trust-item">
                                        <svg viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Cancel
                                        <br />
                                        anytime
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="ao-pay-btn"
                                    disabled={cartTotal === 0}
                                    style={cartTotal === 0 ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                    onClick={handlePayAddons}
                                >
                                    Proceed to pay ({currencySymbol}{formatPrice(cartTotal)})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}