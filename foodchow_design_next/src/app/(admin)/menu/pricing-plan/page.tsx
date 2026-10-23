"use client";

import { useEffect, useState, useRef } from "react";
import { menuService } from "@/api/services/menu.service";
import { setupService } from "@/api/services/setup.service";
import { getCurrencySymbol } from "@/hooks/useSessionCurrency";
// @ts-ignore
import "./page.css";

const Check = () => (
    <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const Cross = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default function PricingPlanPage() {
    // 4 Main Tabs: Growth Plan, POS, Online Ordering, Add-ons
    const [activeTab, setActiveTab] = useState<"growth" | "pos" | "online" | "addons">("growth");
    const [onlineSubTab, setOnlineSubTab] = useState<"fixed" | "commission">("fixed");
    const [isPosYearly, setIsPosYearly] = useState(false);

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

    const [, setMarketplaceBundle] = useState<any>(null); // Id: 999
    const [addOns, setAddOns] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<Array<{ id: number; name: string; price: number; billingCycle: string }>>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
    const [, setLoading] = useState(true);

    // Use database currency / symbol directly from session (replicating MVC's Session["shopcurrency"])
    const [currency, setCurrency] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return (
                sessionStorage.getItem("currency") ||
                localStorage.getItem("currency") ||
                sessionStorage.getItem("shopcurrency") ||
                localStorage.getItem("shopcurrency") ||
                "INR"
            );
        }
        return "INR";
    });

    const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
        if (typeof window !== "undefined") {
            const raw =
                sessionStorage.getItem("shopcurrency") ||
                localStorage.getItem("shopcurrency") ||
                sessionStorage.getItem("currency") ||
                localStorage.getItem("currency") ||
                "INR";
            return getCurrencySymbol(raw);
        }
        return "₹";
    });

    const lastCurrency = useRef<string | null>(null);

    // Resolve currency directly from database via setupService.getRestaurantInformation (USP_GetShopDetailsById)
    useEffect(() => {
        const initCurrency = async () => {
            const shopId = localStorage.getItem("shop_id") || sessionStorage.getItem("shop_id");

            if (shopId) {
                try {
                    const info = await setupService.getRestaurantInformation(Number(shopId));
                    if (info?.currency) {
                        const dbVal = String(info.currency).trim();
                        // In MVC USP_GetShopDetailsByIdPassword / food_shop_settings:
                        const sym = getCurrencySymbol(dbVal);
                        setCurrency(dbVal);
                        setCurrencySymbol(sym);

                        localStorage.setItem("currency", dbVal);
                        localStorage.setItem("shopcurrency", sym);
                        sessionStorage.setItem("currency", dbVal);
                        sessionStorage.setItem("shopcurrency", sym);
                        return;
                    }
                } catch (e) {
                    console.error("Error fetching restaurant currency from database:", e);
                }
            }

            // Fallback to whatever was stored in session
            const stored =
                sessionStorage.getItem("shopcurrency") ||
                localStorage.getItem("shopcurrency") ||
                sessionStorage.getItem("currency") ||
                localStorage.getItem("currency") ||
                "";

            if (stored) {
                const trimmed = stored.trim();
                setCurrency(trimmed);
                setCurrencySymbol(getCurrencySymbol(trimmed));
            }
        };

        initCurrency();

        const handleStorageChange = () => {
            initCurrency();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
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
     * Resolves the correct display price dynamically from the API:
     * - Uses the `Pricing` array returned by GetPlanDetails (e.g. { Price: 350, BillingCycle: "MONTH" }, { Price: 4000, BillingCycle: "YEAR" })
     * - Matches by requested BillingCycle (case-insensitively)
     * - Returns the matched price or first available price from the API response
     */
    const getPlanDisplayPrice = (planData: any, requestedCycle: "YEAR" | "MONTH" = "YEAR"): number => {
        if (!planData) return 0;

        const pricingList = Array.isArray(planData.Pricing)
            ? planData.Pricing
            : Array.isArray(planData.pricing)
                ? planData.pricing
                : [];

        if (pricingList.length > 0) {
            const matched = pricingList.find(
                (p: any) => String(p.BillingCycle || p.billingCycle || "").trim().toUpperCase() === requestedCycle.toUpperCase()
            );
            if (matched && matched.Price != null) {
                return Number(matched.Price);
            }
            if (matched && matched.price != null) {
                return Number(matched.price);
            }
            const first = pricingList[0];
            const firstPrice = first?.Price ?? first?.price;
            if (firstPrice != null) {
                return Number(firstPrice);
            }
        }

        return 0;
    };

    /**
     * Resolves setup fee from fd_mp_planpricing (plan.Pricing array or top-level properties)
     */
    const getPlanSetupFee = (plan: any, defaultFee: number = 0): number => {
        if (!plan) return defaultFee;
        const pricing = Array.isArray(plan.Pricing) ? plan.Pricing[0] : (Array.isArray(plan.pricing) ? plan.pricing[0] : null);
        if (pricing?.SetupFee != null && !Number.isNaN(Number(pricing.SetupFee))) {
            return Number(pricing.SetupFee);
        }
        if (pricing?.setupFee != null && !Number.isNaN(Number(pricing.setupFee))) {
            return Number(pricing.setupFee);
        }
        if (plan.SetupFee != null && !Number.isNaN(Number(plan.SetupFee))) {
            return Number(plan.SetupFee);
        }
        return defaultFee;
    };

    /**
     * Resolves commission percentage, payment gateway fee, and total transaction fee
     * directly from fd_mp_planpricing (plan.Pricing[0] or plan properties)
     */
    const getCommissionInfo = (plan: any, fallbackComm: number) => {
        if (!plan) return null;
        const pricing = Array.isArray(plan.Pricing) ? plan.Pricing[0] : (Array.isArray(plan.pricing) ? plan.pricing[0] : null);

        const rawComm = pricing?.CommissionPercent ?? pricing?.commissionPercent ?? plan.CommissionPercent ?? plan.commissionPercent;
        const rawPgFee = pricing?.PGFeePercent ?? pricing?.pgFeePercent ?? plan.PGFeePercent ?? plan.pgFeePercent;

        const comm = rawComm != null && !Number.isNaN(parseFloat(rawComm)) ? parseFloat(rawComm) : fallbackComm;
        const pgFee = rawPgFee != null && !Number.isNaN(parseFloat(rawPgFee)) ? parseFloat(rawPgFee) : 2.36;
        const total = (comm + pgFee).toFixed(2);
        return {
            comm,
            pgFee,
            total,
        };
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
        if (lastCurrency.current === currency) return;
        lastCurrency.current = currency;

        const loadPlans = async () => {
            const bundleKey = `fc_pricing_bundle_${currency}`;
            let hasCachedData = false;

            // 1. Immediately restore cached plan prices so page loads with zero delay
            if (typeof window !== "undefined") {
                try {
                    const rawCached = sessionStorage.getItem(bundleKey) || localStorage.getItem(bundleKey);
                    if (rawCached) {
                        const cached = JSON.parse(rawCached);
                        if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                            if (cached.p1) setGrowthPlan(cached.p1);
                            if (cached.p2) setPosLitePlan(cached.p2);
                            if (cached.p3) setPosPremiumPlan(cached.p3);
                            if (cached.p7) setOnlineCommissionPlan(cached.p7);
                            if (cached.p999) setMarketplaceBundle(cached.p999);
                            if (cached.p1006) setFixedFreePlan(cached.p1006);
                            if (cached.p1007) setFixedMonthlyPlan(cached.p1007);
                            if (cached.p1008) setFixedYearlyPlan(cached.p1008);
                            if (cached.p1009) setCommFreePlan(cached.p1009);
                            if (cached.p1010) setCommLitePlan(cached.p1010);
                            if (cached.p1011) setCommPremiumPlan(cached.p1011);
                            if (cached.addonsData) setAddOns(cached.addonsData);
                            setLoading(false);
                            hasCachedData = true;
                        }
                    }
                } catch (e) {}
            }

            if (!hasCachedData) {
                setLoading(true);
            }

            try {
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

                if (p1) setGrowthPlan(p1);
                if (p2) setPosLitePlan(p2);
                if (p3) setPosPremiumPlan(p3);
                if (p7) setOnlineCommissionPlan(p7);
                if (p999) setMarketplaceBundle(p999);
                if (p1006) setFixedFreePlan(p1006);
                if (p1007) setFixedMonthlyPlan(p1007);
                if (p1008) setFixedYearlyPlan(p1008);
                if (p1009) setCommFreePlan(p1009);
                if (p1010) setCommLitePlan(p1010);
                if (p1011) setCommPremiumPlan(p1011);

                const addonsData = Array.isArray(addonResponse)
                    ? addonResponse
                    : Array.isArray(addonResponse?.Result)
                        ? addonResponse.Result
                        : Array.isArray(addonResponse?.Result?.AddOns)
                            ? addonResponse.Result.AddOns
                            : Array.isArray(addonResponse?.AddOns)
                                ? addonResponse.AddOns
                                : [];

                if (addonsData.length > 0) setAddOns(addonsData);

                // Cache the loaded plan bundle in storage so subsequent loads are instant
                if (p1 && typeof window !== "undefined") {
                    try {
                        const bundleData = {
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
                            addonsData,
                            timestamp: Date.now(),
                        };
                        sessionStorage.setItem(bundleKey, JSON.stringify(bundleData));
                        localStorage.setItem(bundleKey, JSON.stringify(bundleData));
                    } catch (e) {}
                }
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
    const posLitePrice = getPlanDisplayPrice(posLitePlan, posCycleKey);
    const posPremPrice = getPlanDisplayPrice(posPremiumPlan, posCycleKey);

    // Online Ordering Pricing resolution
    const fixedFreePrice = getPlanDisplayPrice(fixedFreePlan, "YEAR");
    const fixedMonthlyPrice = getPlanDisplayPrice(fixedMonthlyPlan, "MONTH");
    const fixedYearlyPrice = getPlanDisplayPrice(fixedYearlyPlan, "YEAR");
    const commFreePrice = getPlanDisplayPrice(commFreePlan, "YEAR");
    const commLitePrice = getPlanDisplayPrice(commLitePlan, "YEAR");
    const commPremiumPrice = getPlanDisplayPrice(commPremiumPlan, "YEAR");

    // Growth Plan details
    const growthPricing = Array.isArray(growthPlan?.Pricing) ? growthPlan.Pricing[0] : null;
    const growthPrice = getPlanDisplayPrice(growthPlan, "YEAR");
    const growthOriginalPrice = growthPricing?.OriginalPrice != null ? Number(growthPricing.OriginalPrice) : 0;
    const growthTotalValue = isIndian
        ? (growthPlan?.TotalValue || 0)
        : (growthOriginalPrice > 0 ? growthOriginalPrice : growthPrice);
    const growthTotalSavings = isIndian
        ? (growthPlan?.TotalSavings || 0)
        : (growthOriginalPrice > growthPrice ? growthOriginalPrice - growthPrice : 0);

    // Format text for USD/INR currency differences
    const formatFeatureOrGuaranteeText = (text: string | null | undefined): string => {
        if (!text) return "";
        if (isIndian) return text;
        return text
            .replace(/Rs\.?\s?1,00,000/gi, "$1,235")
            .replace(/Rs\.?\s?100,000/gi, "$1,235")
            .replace(/₹\s?1,00,000/gi, "$1,235")
            .replace(/₹\s?100,000/gi, "$1,235")
            .replace(/₹\s?10/gi, "$1")
            .replace(/Rs\.?\s?10/gi, "$1");
    };

    // Helper to render addon icons matching MVC Index.cshtml
    const getAddonIcon = (name: string = "") => {
        const lower = name.toLowerCase();
        if (lower.includes("happy hour")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="5" x2="5" y2="19"></line>
                    <circle cx="6.5" cy="6.5" r="2.5"></circle>
                    <circle cx="17.5" cy="17.5" r="2.5"></circle>
                </svg>
            );
        }
        if (lower.includes("pos")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                    <line x1="8" y1="10" x2="16" y2="10"></line>
                    <line x1="8" y1="14" x2="12" y2="14"></line>
                </svg>
            );
        }
        if (lower.includes("bio link")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            );
        }
        if (lower.includes("whatsapp")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
            );
        }
        if (lower.includes("kds") || lower.includes("kitchen")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
            );
        }
        if (lower.includes("menu")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            );
        }
        if (lower.includes("snap")) {
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            );
        }
        return (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        );
    };

    // Helper to render features for Online Ordering cards exactly matching MVC Index.cshtml (lines 1241-1275)
    const renderOnlineFeatures = (plan: any) => {
        let features = plan?.Features || plan?.features;
        const px = String(plan?.Code || plan?.code || plan?.Name || "").toLowerCase();

        // Exact MVC handling: if the database returns plan.Features, use them.
        // If not populated in the DB yet, MVC Index.cshtml supplies the canonical feature set based on plan code:
        if (!features || !Array.isArray(features) || features.length === 0) {
            if (px.includes("fixed")) {
                features = [
                    { Name: px.includes("free") ? "Orders per month: Up to 25" : "Orders per month: No limit", IsIncluded: true },
                    { Name: "Online payment gateway", IsIncluded: !px.includes("free") },
                    { Name: "Branded ordering page + Google visibility", IsIncluded: true },
                    { Name: "Menu management", IsIncluded: true },
                    { Name: "Table booking", IsIncluded: true },
                    { Name: "Call & directions button", IsIncluded: true },
                    { Name: "Basic reporting", IsIncluded: true },
                    {
                        Name: px.includes("free")
                            ? "Contract: None"
                            : px.includes("yearly")
                            ? "Contract: Billed once a year"
                            : "Contract: Cancel anytime",
                        IsIncluded: true,
                    },
                ];
            } else if (px.includes("comm")) {
                features = [
                    { Name: "Branded ordering page", IsIncluded: true },
                    { Name: "Menu management", IsIncluded: true },
                    { Name: "Basic reporting", IsIncluded: true },
                    { Name: "No setup fee", IsIncluded: true },
                    { Name: "No contract", IsIncluded: true },
                    { Name: "Table reservation", IsIncluded: !px.includes("free") },
                    { Name: "WhatsApp order alerts", IsIncluded: !px.includes("free") },
                    { Name: "Advanced analytics", IsIncluded: px.includes("premium") },
                    { Name: "Priority support", IsIncluded: px.includes("premium") },
                    { Name: "Custom offer module", IsIncluded: px.includes("premium") },
                ];
            }
        }

        if (!features || !Array.isArray(features) || features.length === 0) return null;

        return (
            <div className="oo-features" style={{ marginTop: "14px" }}>
                {features.map((f: any, idx: number) => {
                    const isIncluded = f.IsIncluded !== false && f.is_included !== false;
                    return (
                        <div
                            className="oo-feat"
                            key={`oo-feat-${plan?.Id || px || "plan"}-${f.Id || f.id || idx}`}
                            style={{ color: isIncluded ? undefined : "#aaa" }}
                        >
                            <div className={`oo-check ${isIncluded ? "green" : "red"}`}>
                                {isIncluded ? <Check /> : <Cross />}
                            </div>
                            <span>{formatFeatureOrGuaranteeText(f.Name || f.name)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

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

                            {/* Core Features List (Dynamically from API) */}
                            <div id="features-list">
                                {(growthPlan?.Features || [])
                                    .filter((f: any) => f.IsIncluded !== false && f.is_included !== false)
                                    .map((feature: any) => (
                                        <div className="feature-row" key={feature.Id || feature.FeatureId}>
                                            <div className="feature-icon">
                                                <Check />
                                            </div>
                                            <span>{formatFeatureOrGuaranteeText(feature.Name || feature.name)}</span>
                                        </div>
                                    ))}
                            </div>

                            {/* FREE Add-ons Included in Growth (From Database / MVC layout) */}
                            {normalizedAddons && normalizedAddons.length > 0 && (
                                <div className="growth-addons-section" style={{ marginTop: "20px" }}>
                                    <div className="growth-addons-header" style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "13px", color: "#111", padding: "10px 4px 12px" }}>
                                        <span>Get FREE Powerful Add-ons</span>
                                        <span>Valued</span>
                                    </div>
                                    <div className="growth-addons-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {normalizedAddons.map((addon: any, idx: number) => {
                                            const addonPrice = addon.Price != null ? Number(addon.Price) : 0;
                                            return (
                                                <div
                                                    key={`growth-addon-${addon.Id ?? idx}`}
                                                    style={{
                                                        background: "#3EA696",
                                                        color: "#ffffff",
                                                        padding: "10px 16px",
                                                        borderRadius: "8px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                                    }}
                                                >
                                                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                            {getAddonIcon(addon.Name)}
                                                        </span>
                                                        <span>{addon.Name}</span>
                                                    </span>
                                                    <span style={{ fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>
                                                        {currencySymbol}{formatPrice(addonPrice)} / {addon.BillingCycle ? addon.BillingCycle.toLowerCase() : "year"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Guarantee Card (Matches MVC .growth-guarantee) */}
                            {growthPlan?.Guarantee?.Title && (
                                <div
                                    className="guarantee-card"
                                    style={{
                                        background: "#3BA99C",
                                        color: "#ffffff",
                                        textAlign: "center",
                                        padding: "20px",
                                        borderRadius: "10px",
                                        border: "2px solid #ffffff",
                                        margin: "16px 0",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                                    }}
                                >
                                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 6px 0", color: "#ffffff" }}>
                                        {formatFeatureOrGuaranteeText(growthPlan.Guarantee.Title)}
                                    </h3>
                                    {growthPlan.Guarantee.Description && (
                                        <p style={{ fontSize: "12px", margin: 0, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                                            {formatFeatureOrGuaranteeText(growthPlan.Guarantee.Description)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Total Value & Savings Box (Matches MVC .growth-totals-box) */}
                            <div className="totals-card" style={{ background: "#ffffff", borderRadius: "10px", textAlign: "center", padding: "16px", marginTop: "16px" }}>
                                <div
                                    className="total-bar red"
                                    style={{
                                        background: "#E60012",
                                        color: "#ffffff",
                                        borderRadius: "6px",
                                        padding: "12px",
                                        fontWeight: 800,
                                        fontSize: "14px",
                                        marginBottom: growthTotalSavings > 0 ? "8px" : "12px"
                                    }}
                                >
                                    Total Value: {currencySymbol}{formatPrice(growthTotalValue)}
                                </div>
                                {growthTotalSavings > 0 && (
                                    <div
                                        className="total-bar green"
                                        style={{
                                            background: "#28A745",
                                            color: "#ffffff",
                                            borderRadius: "6px",
                                            padding: "12px",
                                            fontWeight: 800,
                                            fontSize: "14px",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        Save {currencySymbol}{formatPrice(growthTotalSavings)}
                                    </div>
                                )}
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

                                {/* Features by section (Dynamically from API grouped by ExtraInfo) */}
                                {(posLitePlan?.Features || [])
                                    ?.reduce((sections: any[], feature: any) => {
                                        const title = feature.ExtraInfo || feature.extra_info || "Features";
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
                                                <div className="feat-item" key={feature.Id || feature.FeatureId}>
                                                    <div className="feat-check">
                                                        <Check />
                                                    </div>
                                                    <span>{feature.Name || feature.name}</span>
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

                                {/* Features by section (Dynamically from API grouped by ExtraInfo) */}
                                {(posPremiumPlan?.Features || [])
                                    ?.filter((f: any) => f.IsIncluded !== false && f.is_included !== false)
                                    ?.reduce((sections: any[], feature: any) => {
                                        const title = feature.ExtraInfo || feature.extra_info || "Features";
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
                                                <div className="feat-item" key={feature.Id || feature.FeatureId}>
                                                    <div className="feat-check">
                                                        <Check />
                                                    </div>
                                                    <span>{feature.Name || feature.name}</span>
                                                </div>
                                            ))}
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

                                            {renderOnlineFeatures(fixedFreePlan)}
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
                                            {(() => {
                                                const setupFee = getPlanSetupFee(fixedMonthlyPlan, 2999);
                                                return setupFee > 0 ? (
                                                    <div style={{ fontSize: "13px", color: "#444", fontWeight: 700, margin: "6px 0 6px" }}>
                                                        + {currencySymbol}{formatPrice(setupFee)} one-time setup fee
                                                    </div>
                                                ) : null;
                                            })()}
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

                                            {renderOnlineFeatures(fixedMonthlyPlan)}
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
                                            <div className="oo-desc" style={{ marginTop: "6px" }}>{fixedYearlyPlan.Subtitle || "Save up to 50%"}</div>
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

                                            {renderOnlineFeatures(fixedYearlyPlan)}
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
                                            {(() => {
                                                const commInfo = getCommissionInfo(commFreePlan, 8);
                                                return commInfo ? (
                                                    <div style={{ fontSize: "13px", color: "#444", fontWeight: 700, margin: "14px 0 14px", lineHeight: "1.6" }}>
                                                        + {commInfo.comm}% + {commInfo.pgFee}% PG fee
                                                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#777", marginTop: "4px" }}>
                                                            Total transaction fee: {commInfo.total}% per sale
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
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

                                            {renderOnlineFeatures(commFreePlan)}
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
                                            {(() => {
                                                const commInfo = getCommissionInfo(commLitePlan, 5.5);
                                                return commInfo ? (
                                                    <div style={{ fontSize: "13px", color: "#444", fontWeight: 700, margin: "14px 0 14px", lineHeight: "1.6" }}>
                                                        + {commInfo.comm}% + {commInfo.pgFee}% PG fee
                                                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#777", marginTop: "4px" }}>
                                                            Total transaction fee: {commInfo.total}% per sale
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
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

                                            {renderOnlineFeatures(commLitePlan)}
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
                                            {(() => {
                                                const commInfo = getCommissionInfo(commPremiumPlan, 2);
                                                return commInfo ? (
                                                    <div style={{ fontSize: "13px", color: "#444", fontWeight: 700, margin: "14px 0 14px", lineHeight: "1.6" }}>
                                                        + {commInfo.comm}% + {commInfo.pgFee}% PG fee
                                                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#777", marginTop: "4px" }}>
                                                            Total transaction fee: {commInfo.total}% per sale
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
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

                                            {renderOnlineFeatures(commPremiumPlan)}
                                        </div>
                                    )}

                                    {/* 7: Lifetime Commission Plan (if present) */}
                                    {onlineCommissionPlan && !commFreePlan && !commLitePlan && (
                                        <div className={`oo-col ${isPlanActive(7, onlineCommissionPlan?.Name) ? "purchased" : ""}`}>
                                            <div className="oo-badge orange">{onlineCommissionPlan.BadgeText || "ONE-TIME"}</div>
                                            <div className="oo-plan-name">{onlineCommissionPlan.Name || "Commission Plan"}</div>
                                            <div className="oo-price-plain">
                                                {currencySymbol}{formatPrice(getPlanDisplayPrice(onlineCommissionPlan, "YEAR"))}
                                            </div>
                                            {(() => {
                                                const commInfo = getCommissionInfo(onlineCommissionPlan, 2);
                                                return commInfo ? (
                                                    <div style={{ fontSize: "13px", color: "#444", fontWeight: 700, margin: "14px 0 14px", lineHeight: "1.6" }}>
                                                        + {commInfo.comm}% + {commInfo.pgFee}% PG fee
                                                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#777", marginTop: "4px" }}>
                                                            Total transaction fee: {commInfo.total}% per sale
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                            <div className="oo-desc">{onlineCommissionPlan.Subtitle}</div>
                                            <button
                                                type="button"
                                                className="oo-get-btn"
                                                onClick={() => handleCreateSubscription(onlineCommissionPlan)}
                                            >
                                                {onlineCommissionPlan.CTAText || "Get Started"}
                                            </button>
                                            {renderOnlineFeatures(onlineCommissionPlan)}
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
                                                    {Array.isArray(addon.Features) && addon.Features.length > 0 ? (
                                                        addon.Features.map((feat: string, fIdx: number) => (
                                                            <div className="ao-feat-item" key={`ao-feat-${addon.Id}-${fIdx}`}>
                                                                <div className="chk">
                                                                    <Check />
                                                                </div>
                                                                <span>{feat}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="ao-feat-item">
                                                            <div className="chk">
                                                                <Check />
                                                            </div>
                                                            <span>{addon.Description || "Unlock powerful capability for your restaurant"}</span>
                                                        </div>
                                                    )}
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