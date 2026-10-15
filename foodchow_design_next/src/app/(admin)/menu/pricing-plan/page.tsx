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
    const [activeTab, setActiveTab] = useState<"growth" | "pos" | "online" | "addons">("growth");
    const [onlineSubTab, setOnlineSubTab] = useState<"fixed" | "commission">("fixed");
    const [isYearly, setIsYearly] = useState(false);
    const [kdsYearly, setKdsYearly] = useState(true);

    const [plan, setPlan] = useState<any>(null);
    const [litePlan, setLitePlan] = useState<any>(null);
    const [premiumPlan, setPremiumPlan] = useState<any>(null);
    const [onlineMonthlyPlan, setOnlineMonthlyPlan] = useState<any>(null);
    const [onlineGrowthPlan, setOnlineGrowthPlan] = useState<any>(null);
    const [onlineYearlyPlan, setOnlineYearlyPlan] = useState<any>(null);
    const [commissionPlan, setCommissionPlan] = useState<any>(null);

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

    const toggleBilling = (): void => {
        setIsYearly((prev) => !prev);
    };

    // Official Pricing Logic matching SQL and live MVC
    const getPricing = (planData: any) => {
        if (!planData) return undefined;

        // Growth Plan (Ids 1, 5)
        if (planData.Id === 1 || planData.Id === 5 || planData.Name === "Growth Plan" || planData.Name === "Restaurant Growth Package") {
            if (isIndian) {
                return {
                    Price: 25000,
                    OriginalPrice: 47925,
                    BillingCycle: "YEAR",
                };
            } else {
                return {
                    Price: 600,
                    OriginalPrice: 1200,
                    BillingCycle: "YEAR",
                };
            }
        }

        // POS Lite (Id 2)
        if (planData.Id === 2 || planData.Name === "Lite" || planData.Name === "POS Lite") {
            const cycle = isYearly ? "YEAR" : "MONTH";
            if (isIndian) {
                return {
                    Price: isYearly ? 2500 : 350,
                    OriginalPrice: isYearly ? 4200 : 350,
                    BillingCycle: cycle,
                };
            } else {
                return {
                    Price: isYearly ? 99 : 10,
                    OriginalPrice: isYearly ? 120 : 10,
                    BillingCycle: cycle,
                };
            }
        }

        // POS Premium (Id 3)
        if (planData.Id === 3 || planData.Name === "Premium" || planData.Name === "POS Premium") {
            const cycle = isYearly ? "YEAR" : "MONTH";
            if (isIndian) {
                return {
                    Price: isYearly ? 5475 : 590,
                    OriginalPrice: isYearly ? 7080 : 590,
                    BillingCycle: cycle,
                };
            } else {
                return {
                    Price: isYearly ? 300 : 30,
                    OriginalPrice: isYearly ? 360 : 30,
                    BillingCycle: cycle,
                };
            }
        }

        // Online Monthly (Id 4)
        if (planData.Id === 4) {
            return {
                Price: isIndian ? 1100 : 30,
                OriginalPrice: isIndian ? 1100 : 30,
                BillingCycle: "MONTH",
            };
        }

        // Online Yearly (Id 6)
        if (planData.Id === 6) {
            return {
                Price: isIndian ? 9999 : 300,
                OriginalPrice: isIndian ? 13200 : 360,
                BillingCycle: "YEAR",
            };
        }

        // Commission Plan (Id 7)
        if (planData.Id === 7) {
            return {
                Price: isIndian ? 5475 : 75,
                OriginalPrice: isIndian ? 5475 : 75,
                BillingCycle: "ONETIME",
            };
        }

        // Fallback to API array if available
        if (Array.isArray(planData.Pricing) && planData.Pricing.length > 0) {
            const requiredCycle = isYearly ? "YEAR" : "MONTH";
            return (
                planData.Pricing.find((pricing: any) => pricing.BillingCycle === requiredCycle) ||
                planData.Pricing[0]
            );
        }

        return undefined;
    };

    // Subscriptions check
    const isGrowthActive = activeSubscriptions.some((sub: any) => {
        const sName = String(sub.PlanName || sub.plan_name || "").toLowerCase();
        const status = String(sub.Status || sub.status || "").toUpperCase();
        return status === "ACTIVE" && (sName.includes("growth") || sub.Id === 1 || sub.plan_id === 1 || sub.Id === 5 || sub.plan_id === 5);
    });

    const isPlanActive = (planId: number, planName?: string) => {
        return activeSubscriptions.some((sub: any) => {
            const status = String(sub.Status || sub.status || "").toUpperCase();
            if (status !== "ACTIVE") return false;
            if (Number(sub.Id || sub.plan_id) === planId) return true;
            if (planName && String(sub.PlanName || sub.plan_name || "").toLowerCase() === planName.toLowerCase()) return true;
            return false;
        });
    };

    const handleCreateSubscription = async (selectedPlan: any) => {
        try {
            const shopId = Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id"));

            if (!shopId) {
                console.error("Shop ID not found in session");
                alert("Please log in to your restaurant to subscribe.");
                return;
            }

            const activePricing = getPricing(selectedPlan);

            const response = await menuService.createSubscription({
                amount: activePricing?.Price || 0,
                oneTimeAmount: 0,
                addonIds: "",
                planId: selectedPlan?.Id || 1,
                billingCycle: activePricing?.BillingCycle || "YEAR",
                planName: selectedPlan?.Name || "Growth Plan",
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

    // Load Plan Details and Addons from API
    useEffect(() => {
        if (lastCurrency.current === currency && plan) return;
        lastCurrency.current = currency;

        const loadPlan = async () => {
            try {
                setLoading(true);

                const [
                    growthPlan,
                    litePlanResponse,
                    premiumPlanResponse,
                    onlineMonthlyResponse,
                    onlineGrowthResponse,
                    onlineYearlyResponse,
                    commissionResponse,
                    addonResponse,
                ] = await Promise.all([
                    menuService.getPlanDetails(1, currency),
                    menuService.getPlanDetails(2, currency),
                    menuService.getPlanDetails(3, currency),
                    menuService.getPlanDetails(4, currency),
                    menuService.getPlanDetails(5, currency),
                    menuService.getPlanDetails(6, currency),
                    menuService.getPlanDetails(7, currency),
                    menuService.getAddOns(currency),
                ]);

                setPlan(growthPlan);
                setLitePlan(litePlanResponse);
                setPremiumPlan(premiumPlanResponse);
                setOnlineMonthlyPlan(onlineMonthlyResponse);
                setOnlineGrowthPlan(onlineGrowthResponse);
                setOnlineYearlyPlan(onlineYearlyResponse);
                setCommissionPlan(commissionResponse);

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

        loadPlan();
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

    // Group Add-ons by Id (matching MVC groupedAddons logic) so multiple cycle options don't duplicate cards
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
        const isKDS = name.toUpperCase().includes("KDS");
        const selectedCycle = isKDS ? (kdsYearly ? "YEAR" : "MONTH") : (addon.BillingCycle || "YEAR");

        let matchedPricing = addon.pricingOptions?.find(
            (opt: any) => String(opt.cycle).toUpperCase() === selectedCycle.toUpperCase()
        ) || addon.pricingOptions?.[0];

        let price = matchedPricing?.price ?? (addon.Price != null ? Number(addon.Price) : 0);

        // Fallback pricing if API didn't provide specific value
        if (!price || price === 0) {
            if (isKDS) {
                price = isIndian ? (kdsYearly ? 5475 : 600) : (kdsYearly ? 150 : 20);
            } else if (name.toUpperCase().includes("WHATSAPP")) {
                price = isIndian ? 5475 : 300;
            } else if (name.toUpperCase().includes("TABLE RESERVATION") || name.toUpperCase().includes("RESERVATION")) {
                price = isIndian ? 4999 : 99;
            } else if (name.toUpperCase().includes("HAPPY HOUR")) {
                price = isIndian ? 12000 : 250;
            } else if (name.toUpperCase().includes("BIO LINK") || name.toUpperCase().includes("BIOLINK")) {
                price = isIndian ? 2500 : 49;
            } else if (name.toUpperCase().includes("ADDITIONAL MENU")) {
                price = isIndian ? 12000 : 100;
            } else if (name.toUpperCase().includes("SNAP")) {
                price = isIndian ? 5000 : 100;
            }
        }

        return {
            ...addon,
            Id: id,
            Name: name,
            Price: price,
            BillingCycle: selectedCycle,
        };
    });

    const growthPricing = getPricing(plan);
    const litePricing = getPricing(litePlan);
    const premiumPricing = getPricing(premiumPlan);
    const onlineMonthlyPricing = getPricing(onlineMonthlyPlan);
    const onlineYearlyPricing = getPricing(onlineYearlyPlan);
    const commissionPricing = getPricing(commissionPlan);

    const growthTotalValue = isIndian ? 47925 : 1200;
    const growthTotalSavings = isIndian ? 22925 : 600;

    return (
        <div id="pg-menu-pricing-plan">
            <div className="page-content" style={{ padding: "20px 24px" }}>
                {/* TABS */}
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

                {/* ═══ TAB 1: GROWTH PLAN PANEL ═══ */}
                {activeTab === "growth" && (
                    <div id="panel-growth" className="plan-wrapper">
                        <div className="plan-heading">
                            <h2>Everything You Get in the Growth Package</h2>
                            <p>A complete, done-for-you system to maximize revenue.</p>
                        </div>

                        <div className="outer-card">
                            {/* Price Card */}
                            <div className="price-card">
                                <div className="plan-name">{plan?.Name || "Growth Plan"}</div>
                                <div className="price-row">
                                    {growthPricing?.OriginalPrice && (
                                        <span className="old-price">
                                            {currencySymbol}
                                            {formatPrice(growthPricing.OriginalPrice)}
                                        </span>
                                    )}
                                    <span className="new-price">
                                        {currencySymbol}
                                        {formatPrice(growthPricing?.Price)}
                                    </span>
                                    <span className="per-year">
                                        / {growthPricing?.BillingCycle === "YEAR" ? "year" : "month"}
                                    </span>
                                </div>
                                <div className="all-features">All Features In One Plan</div>
                            </div>

                            {/* Core Features */}
                            <div id="features-list">
                                {plan?.Features?.filter((f: any) => f.IsIncluded !== false)?.map((feature: any) => (
                                    <div className="feature-row" key={feature.Id || feature.Name}>
                                        <div className="feature-icon">
                                            <Check />
                                        </div>
                                        {feature.Name}
                                    </div>
                                ))}
                            </div>

                            {/* FREE Add-ons Header */}
                            <div className="addons-header">
                                <span>Get FREE Powerful Add-ons</span>
                                <span className="valued">Valued</span>
                            </div>

                            {normalizedAddons.map((addon, index) => (
                                <div className="addon-row" key={`${addon.Id}-${index}`}>
                                    <div className="addon-icon">
                                        <svg viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    </div>
                                    <span className="addon-name">{addon.Name}</span>
                                    <span className="addon-price">
                                        {currencySymbol}
                                        {formatPrice(addon.Price)}
                                        {addon.BillingCycle ? ` / ${addon.BillingCycle.toLowerCase()}` : ""}
                                    </span>
                                </div>
                            ))}

                            {/* Total + Buy */}
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
                                        style={{ background: "#f1f3f5", color: "#0ca678", border: "1px solid #c3fae8", cursor: "default" }}
                                    >
                                        ✓ Currently Active Plan
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="buy-btn"
                                        onClick={() => handleCreateSubscription(plan || { Id: 1, Name: "Growth Plan" })}
                                    >
                                        Buy Growth Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ TAB 2: POS TAB PANEL ═══ */}
                {activeTab === "pos" && (
                    <div id="panel-pos" className="pos-wrapper">
                        <p className="pos-desc">
                            Run your restaurant from a single screen — billing, KOT, tables, and reports — with the option to add online ordering and channels later.
                        </p>

                        {/* Monthly / Yearly Toggle */}
                        <div className="billing-toggle-row">
                            <span
                                className={`toggle-label ${!isYearly ? "active" : ""}`}
                                style={{ fontWeight: !isYearly ? 700 : 500, color: !isYearly ? "var(--primary)" : "#6b7280", cursor: "pointer" }}
                                onClick={() => setIsYearly(false)}
                            >
                                Monthly
                            </span>
                            <div className={`toggle-track ${!isYearly ? "monthly" : ""}`} onClick={toggleBilling}>
                                <div
                                    className="toggle-thumb"
                                    style={{ left: isYearly ? "23px" : "3px", transition: "left .2s" }}
                                ></div>
                            </div>
                            <span
                                className={`toggle-label ${isYearly ? "active" : ""}`}
                                style={{ fontWeight: isYearly ? 700 : 500, color: isYearly ? "var(--primary)" : "#6b7280", cursor: "pointer" }}
                                onClick={() => setIsYearly(true)}
                            >
                                Yearly
                            </span>
                            <span className="save-badge">Save 40%</span>
                        </div>

                        {/* Two plan cards */}
                        <div className="pos-cards">
                            {/* LITE */}
                            <div className={`pos-card ${isPlanActive(2, "Lite") ? "purchased" : ""}`}>
                                <div className="pos-plan-name">{litePlan?.Name || "Lite"}</div>
                                <div className="pos-plan-desc">
                                    {litePlan?.Subtitle || "Everything a single-outlet restaurant needs to start billing today."}
                                </div>
                                <div className="pos-price">
                                    {currencySymbol}
                                    {formatPrice(litePricing?.Price)}
                                    <span> / {isYearly ? "Year" : "Month"}</span>
                                </div>

                                {isGrowthActive ? (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        style={{ background: "#f1f3f5", color: "#868e96", cursor: "not-allowed" }}
                                        title="Included in Growth Plan"
                                    >
                                        INCLUDED IN GROWTH PLAN
                                    </button>
                                ) : isPlanActive(2, "Lite") ? (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        style={{ background: "#e6fcf5", color: "#0ca678", borderColor: "#63e6be" }}
                                    >
                                        ✓ Currently Active
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        onClick={() => handleCreateSubscription(litePlan || { Id: 2, Name: "POS Lite" })}
                                    >
                                        {litePlan?.CTAText || "Buy Lite Plan"}
                                    </button>
                                )}

                                {/* Features */}
                                {litePlan?.Features?.reduce((sections: any[], feature: any) => {
                                    const section = sections.find((s) => s.title === feature.ExtraInfo);
                                    if (section) {
                                        section.features.push(feature);
                                    } else {
                                        sections.push({
                                            title: feature.ExtraInfo || "Features",
                                            features: [feature],
                                        });
                                    }
                                    return sections;
                                }, []).map((section: any, idx: number) => (
                                    <div key={idx}>
                                        <div className="feat-section-title">{section.title}</div>
                                        {section.features.map((feature: any) => (
                                            <div className="feat-item" key={feature.Id || feature.Name}>
                                                <div className="feat-check">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* PREMIUM */}
                            <div className={`pos-card premium ${isPlanActive(3, "Premium") ? "purchased" : ""}`}>
                                <div className="recommended-badge">Recommended</div>
                                <div className="pos-plan-name">{premiumPlan?.Name || "Premium"}</div>
                                <div className="pos-plan-desc">
                                    {premiumPlan?.Subtitle || "For growing restaurants ready to take dine-in, takeaway, and online — all in one place."}
                                </div>
                                <div className="pos-price">
                                    {currencySymbol}
                                    {formatPrice(premiumPricing?.Price)}
                                    <span> / {isYearly ? "Year" : "Month"}</span>
                                </div>

                                {isGrowthActive ? (
                                    <button
                                        type="button"
                                        className="pos-buy-btn"
                                        style={{ background: "#f1f3f5", color: "#868e96", cursor: "not-allowed" }}
                                        title="Included in Growth Plan"
                                    >
                                        INCLUDED IN GROWTH PLAN
                                    </button>
                                ) : isPlanActive(3, "Premium") ? (
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
                                        onClick={() => handleCreateSubscription(premiumPlan || { Id: 3, Name: "POS Premium" })}
                                    >
                                        {premiumPlan?.CTAText || "Get Premium Plan"}
                                    </button>
                                )}

                                <div className="feat-section-title">Everything In Lite, plus</div>

                                {premiumPlan?.Features?.filter((f: any) => f.IsIncluded !== false)?.map((feature: any) => (
                                    <div className="feat-item" key={feature.Id || feature.Name}>
                                        <div className="feat-check">
                                            <Check />
                                        </div>
                                        {feature.Name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ TAB 3: ONLINE ORDERING TAB PANEL ═══ */}
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

                        {/* Fixed Plan content */}
                        {onlineSubTab === "fixed" && (
                            <div id="oo-fixed">
                                <div className="oo-cards">
                                    {/* COL 1: Online Monthly Plan */}
                                    <div className="oo-col">
                                        <div className="oo-plan-name">{onlineMonthlyPlan?.Name || "Monthly Plan"}</div>
                                        <div className="oo-price-plain">
                                            {currencySymbol}{formatPrice(onlineMonthlyPricing?.Price)} / month
                                        </div>
                                        <div className="oo-desc">{onlineMonthlyPlan?.Subtitle}</div>
                                        {isGrowthActive ? (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                style={{ background: "#f1f3f5", color: "#868e96", cursor: "not-allowed" }}
                                                title="Included in Growth Plan"
                                            >
                                                INCLUDED IN GROWTH PLAN
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                onClick={() => handleCreateSubscription(onlineMonthlyPlan || { Id: 4, Name: "Online Monthly Plan" })}
                                            >
                                                {onlineMonthlyPlan?.CTAText || "Get Started"}
                                            </button>
                                        )}

                                        {onlineMonthlyPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id || feature.Name}>
                                                <div className="oo-check green">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}

                                        <div className="oo-addons-header">
                                            <span>FREE Powerful Add-ons</span>
                                            <span>Valued</span>
                                        </div>
                                        <OOAddons addOns={normalizedAddons} currencySymbol={currencySymbol} />
                                    </div>

                                    {/* COL 2: Growth Plan (featured) */}
                                    <div className="oo-col featured">
                                        <div className="oo-badge orange">{onlineGrowthPlan?.BadgeText || "MOST RECOMMENDED"}</div>
                                        <button type="button" className="oo-growth-btn">
                                            {onlineGrowthPlan?.Name || "Growth Plan"}
                                        </button>
                                        <div style={{ marginBottom: "4px" }}>
                                            <span className="oo-new-price">
                                                {currencySymbol}{formatPrice(growthPricing?.Price)}
                                            </span>{" "}
                                            <span className="oo-per">/ year</span>
                                        </div>
                                        <div className="oo-save">Save {currencySymbol}{formatPrice(growthTotalSavings)}</div>
                                        <div className="oo-all-feat">{onlineGrowthPlan?.Subtitle || "All Features In One Plan"}</div>
                                        {isGrowthActive ? (
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
                                                onClick={() => handleCreateSubscription(onlineGrowthPlan || { Id: 1, Name: "Growth Plan" })}
                                            >
                                                {onlineGrowthPlan?.CTAText || "Buy Growth Plan"}
                                            </button>
                                        )}

                                        {onlineGrowthPlan?.Features?.filter((f: any) => f.IsIncluded !== false)?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id || feature.Name}>
                                                <div className="oo-check green">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}

                                        <div
                                            className="oo-addons-header"
                                            style={{
                                                background: "var(--primary)",
                                                color: "#fff",
                                                padding: "10px 12px",
                                                borderRadius: "7px",
                                                marginTop: "14px",
                                            }}
                                        >
                                            <span>Get FREE Powerful Add-ons</span>
                                            <span>Valued</span>
                                        </div>
                                        {normalizedAddons.map((addon, index) => (
                                            <div className="oo-addon-row teal-row" key={`${addon.Id}-${index}`}>
                                                <div className="oo-addon-icon">
                                                    <span>+</span>
                                                </div>
                                                <span className="oo-addon-name">{addon.Name}</span>
                                                <span className="oo-addon-price">
                                                    {currencySymbol}{formatPrice(addon.Price)}
                                                    {addon.BillingCycle ? ` / ${addon.BillingCycle.toLowerCase()}` : ""}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="oo-total-block">
                                            <div className="oo-total-red">
                                                <span>TOTAL VALUE:</span>
                                                <span>{currencySymbol}{formatPrice(growthTotalValue)}</span>
                                            </div>
                                            <div className="oo-total-green">
                                                <p>You save with Growth Plan</p>
                                                <div className="big-save">{currencySymbol}{formatPrice(growthTotalSavings)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 3: Online Yearly Plan */}
                                    <div className="oo-col">
                                        <div className="oo-badge teal">{onlineYearlyPlan?.HighlightText || "BEST VALUE"}</div>
                                        <div className="oo-plan-name">{onlineYearlyPlan?.Name || "Yearly Plan"}</div>
                                        <div className="oo-price-plain">
                                            {currencySymbol}{formatPrice(onlineYearlyPricing?.Price)} / year
                                        </div>
                                        <div className="oo-desc">{onlineYearlyPlan?.Subtitle}</div>
                                        {isGrowthActive ? (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                style={{ background: "#f1f3f5", color: "#868e96", cursor: "not-allowed" }}
                                                title="Included in Growth Plan"
                                            >
                                                INCLUDED IN GROWTH PLAN
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                onClick={() => handleCreateSubscription(onlineYearlyPlan || { Id: 6, Name: "Online Yearly Plan" })}
                                            >
                                                {onlineYearlyPlan?.CTAText || "Get Started"}
                                            </button>
                                        )}

                                        {onlineYearlyPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id || feature.Name}>
                                                <div className="oo-check green">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}

                                        <div className="oo-addons-header">
                                            <span>FREE Powerful Add-ons</span>
                                            <span>Valued</span>
                                        </div>
                                        <OOAddons addOns={normalizedAddons} currencySymbol={currencySymbol} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Commission Plan content */}
                        {onlineSubTab === "commission" && (
                            <div id="oo-commission">
                                <div style={{ maxWidth: "440px", margin: "0 auto", paddingTop: "20px" }}>
                                    <div className="oo-col" style={{ borderRadius: "16px" }}>
                                        <div className="oo-badge teal">{commissionPlan?.HighlightText || "ZERO RISK"}</div>
                                        <div className="oo-plan-name">{commissionPlan?.Name || "Commission Plan"}</div>
                                        <div className="oo-price-plain">
                                            {currencySymbol}{formatPrice(commissionPricing?.Price)} One-time
                                        </div>
                                        <div className="oo-desc">{commissionPlan?.Subtitle}</div>
                                        {isGrowthActive ? (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                style={{ background: "#f1f3f5", color: "#868e96", cursor: "not-allowed" }}
                                                title="Included in Growth Plan"
                                            >
                                                INCLUDED IN GROWTH PLAN
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                onClick={() => handleCreateSubscription(commissionPlan || { Id: 7, Name: "Commission Plan" })}
                                            >
                                                {commissionPlan?.CTAText || "Get Started"}
                                            </button>
                                        )}

                                        {commissionPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id || feature.Name}>
                                                <div className="oo-check green">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ TAB 4: ADD-ONS TAB PANEL ═══ */}
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
                                                        {/* KDS Monthly / Yearly toggle */}
                                                        {isKDS && (
                                                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setKdsYearly(false)}
                                                                    style={{
                                                                        padding: "2px 8px",
                                                                        borderRadius: "4px",
                                                                        border: "1px solid var(--primary)",
                                                                        background: !kdsYearly ? "var(--primary)" : "#fff",
                                                                        color: !kdsYearly ? "#fff" : "var(--primary)",
                                                                        fontSize: "11px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    Monthly
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setKdsYearly(true)}
                                                                    style={{
                                                                        padding: "2px 8px",
                                                                        borderRadius: "4px",
                                                                        border: "1px solid var(--primary)",
                                                                        background: kdsYearly ? "var(--primary)" : "#fff",
                                                                        color: kdsYearly ? "#fff" : "var(--primary)",
                                                                        fontSize: "11px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    Yearly
                                                                </button>
                                                            </div>
                                                        )}
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

function OOAddons({
    teal = false,
    addOns,
    currencySymbol = "₹",
}: {
    teal?: boolean;
    addOns: any[];
    currencySymbol?: string;
}) {
    const cls = "oo-addon-row" + (teal ? " teal-row" : "");
    const formatPrice = (addon: any) => {
        if (!addon) return "";
        if (addon.Price !== undefined && addon.Price !== null) {
            return `${currencySymbol}${Number(addon.Price).toLocaleString()}`;
        }
        return "";
    };
    return (
        <>
            {addOns?.map((addon, index) => (
                addon ? (
                    <div className={cls} key={`oo-addon-${addon.Id ?? "item"}-${index}`}>
                        <div className="oo-addon-icon">
                            <svg viewBox="0 0 24 24">
                                <line x1="19" y1="5" x2="5" y2="19" />
                                <circle cx="6.5" cy="6.5" r="2.5" />
                                <circle cx="17.5" cy="17.5" r="2.5" />
                            </svg>
                        </div>
                        <span className="oo-addon-name">{addon.Name}</span>
                        <span className="oo-addon-price">{formatPrice(addon)}</span>
                    </div>
                ) : null
            ))}
        </>
    );
}