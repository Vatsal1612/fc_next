"use client";

import { useEffect, useState, useRef } from "react";
import { menuService } from "@/api/services/menu.service";
// @ts-ignore
import "./page.css";


const Check = () => (
    <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function PricingPlanPage() {
    const [plan, setPlan] = useState<any>(null);
    const [litePlan, setLitePlan] = useState<any>(null);
    const [premiumPlan, setPremiumPlan] = useState<any>(null);
    const [onlineMonthlyPlan, setOnlineMonthlyPlan] = useState<any>(null);
    const [onlineGrowthPlan, setOnlineGrowthPlan] = useState<any>(null);
    const [onlineYearlyPlan, setOnlineYearlyPlan] = useState<any>(null);
    const [commissionPlan, setCommissionPlan] = useState<any>(null);

    const [addOns, setAddOns] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);
    const [currency, setCurrency] = useState("Rs.");
    const [displayCurrency, setDisplayCurrency] = useState("Rs.");
    const lastCurrency = useRef<string | null>(null);
    const displayCurrencyRef = useRef(displayCurrency);

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null || price === "") {
            return "";
        }

        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice)) {
            return "";
        }

        return numericPrice.toLocaleString(
            displayCurrency === "Rs." ? "en-IN" : "en-US",
            {
                minimumFractionDigits: displayCurrency === "$" ? 2 : 0,
                maximumFractionDigits: displayCurrency === "$" ? 2 : 0,
            }
        );
    };
    const isIndianCurrency = displayCurrency === "Rs." || displayCurrency === "INR" || displayCurrency === "₹";
    const currencySymbol = isIndianCurrency ? "₹" : "$";

    const displayPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null || price === "") {
            return "";
        }

        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice)) {
            return "";
        }

        return `${currencySymbol}${numericPrice.toLocaleString(
            isIndianCurrency ? "en-IN" : "en-US",
            {
                minimumFractionDigits: !isIndianCurrency ? 2 : 0,
                maximumFractionDigits: !isIndianCurrency ? 2 : 0,
            }
        )}`;
    };

    const toggleBilling = (): void => {
        setIsYearly((prev) => !prev);
    };

    const getPricing = (planData: any) => {
        if (!planData?.Pricing || !Array.isArray(planData.Pricing)) {
            return undefined;
        }

        const requiredCycle = isYearly ? "YEAR" : "MONTH";

        return (
            planData.Pricing.find(
                (pricing: any) =>
                    pricing.BillingCycle === requiredCycle
            ) || planData.Pricing[0]
        );
    };
    const handleCreateSubscription = async (selectedPlan: any) => {
        try {

            const shopId = Number(sessionStorage.getItem("shop_id"));

            if (!shopId) {
                console.error("Shop ID not found in session");
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
                currency: displayCurrency === "Rs." ? "INR" : "USD",
                shopId: shopId,
            });

            console.log("SUBSCRIPTION CREATED:", response);
        } catch (error) {
            console.error("CREATE SUBSCRIPTION ERROR:", error);
        }
    };

    useEffect(() => {
        if (lastCurrency.current === currency) return;

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

                console.log("CURRENCY:", currency);
                console.log("PLAN 1:", growthPlan);
                console.log("PLAN 2:", litePlanResponse);
                console.log("PLAN 3:", premiumPlanResponse);
                console.log("PLAN 4:", onlineMonthlyResponse);
                console.log("PLAN 5:", onlineGrowthResponse);
                console.log("PLAN 6:", onlineYearlyResponse);
                console.log("PLAN 7:", commissionResponse);
                console.log("ADDONS:", addonResponse);

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

                setDisplayCurrency(currency);
                displayCurrencyRef.current = currency;
            } catch (error) {
                console.error("PLAN API ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPlan();
    }, [currency]);
    useEffect(() => {
        const panels: Record<string, string> = {
            growth: "panel-growth",
            pos: "panel-pos",
            online: "panel-online",
            addons: "panel-addons",
        };

        function switchTab(btn: HTMLElement, key: string): void {
            document
                .querySelectorAll<HTMLElement>(".tab")
                .forEach((t) => t.classList.remove("active"));

            btn.classList.add("active");

            Object.values(panels).forEach((id) => {
                const el = document.getElementById(id);

                if (el) {
                    el.style.display = "none";
                }
            });

            const target = document.getElementById(panels[key]);

            if (target) {
                target.style.display = "block";
            }
        }

        function switchOOTab(btn: HTMLElement, key: string): void {
            document
                .querySelectorAll<HTMLElement>(".oo-subtab")
                .forEach((t) => t.classList.remove("active"));

            btn.classList.add("active");

            const fixed = document.getElementById("oo-fixed");
            const commission = document.getElementById("oo-commission");

            if (fixed) {
                fixed.style.display = key === "fixed" ? "block" : "none";
            }

            if (commission) {
                commission.style.display =
                    key === "commission" ? "block" : "none";
            }
        }

        const cartItems: Record<string, string> = {};

        function toggleAddon(
            btn: HTMLButtonElement,
            name: string,
            price: string
        ): void {
            if (cartItems[name]) {
                delete cartItems[name];

                btn.textContent = "Select Add-on";
                btn.classList.remove("selected");
                btn.style.background = "#fff";
                btn.style.color = "var(--primary)";
                btn.style.border = "1.5px solid var(--primary)";
            } else {
                cartItems[name] = price;

                btn.textContent = "✕ Cancel / Remove";
                btn.classList.add("selected");
                btn.style.background = "#fff0f0";
                btn.style.color = "#e53e3e";
                btn.style.border = "1.5px solid #fecaca";
            }

            renderCart();
        }

        function escapeHtml(str: string): string {
            if (!str) return "";
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function renderCart(): void {
            const keys = Object.keys(cartItems);

            const emptyEl = document.getElementById("ao-cart-empty");
            const itemsEl = document.getElementById("ao-cart-items");
            const subtotalEl = document.getElementById("ao-subtotal");
            const totalEl = document.getElementById("ao-total");
            const payBtn = document.getElementById("ao-pay-btn");

            if (
                !emptyEl ||
                !itemsEl ||
                !subtotalEl ||
                !totalEl ||
                !payBtn
            ) {
                return;
            }

            // No add-ons selected
            if (keys.length === 0) {
                emptyEl.style.display = "block";
                itemsEl.style.display = "none";

                const zeroPrice =
                    displayCurrency === "$" ? "$0.00" : "₹0";

                subtotalEl.textContent = zeroPrice;
                totalEl.textContent = zeroPrice;
                payBtn.textContent = `Proceed to pay (${zeroPrice})`;

                return;
            }

            // Add-ons selected
            emptyEl.style.display = "none";
            itemsEl.style.display = "block";

            let total = 0;
            let html = "";

            keys.forEach((name) => {
                const priceStr = cartItems[name];

                /*
                 * Remove currency symbols and commas before
                 * converting the price into a number.
                 */
                const num = Number(
                    priceStr.replace(/[₹$,\s]/g, "")
                );

                if (!Number.isNaN(num)) {
                    total += num;
                }

                html += `
            <div
                class="ao-cart-item"
                style="
                    padding-bottom:10px;
                    margin-bottom:10px;
                    border-bottom:1px solid #f0f0f0;
                "
            >
                <span
                    class="name"
                    style="
                        font-size:13px;
                        font-weight:600;
                        color:#1e2535;
                    "
                >
                    ${escapeHtml(name)}
                </span>

                <span
                    class="price"
                    style="
                        font-size:13px;
                        font-weight:700;
                        color:#1e2535;
                        white-space:nowrap;
                    "
                >
                    ${priceStr}
                </span>
            </div>
        `;
            });

            itemsEl.innerHTML = html;

            /*
             * Format total according to selected currency.
             */
            const formattedTotal = total.toLocaleString(
                displayCurrency === "Rs." ? "en-IN" : "en-US",
                {
                    minimumFractionDigits:
                        displayCurrency === "$" ? 2 : 0,

                    maximumFractionDigits:
                        displayCurrency === "$" ? 2 : 0,
                }
            );

            const totalWithCurrency =
                `${currencySymbol}${formattedTotal}`;

            subtotalEl.textContent = totalWithCurrency;
            totalEl.textContent = totalWithCurrency;

            payBtn.textContent =
                `Proceed to pay (${totalWithCurrency})`;
        }

        // Main tabs
        const tabHandlers: Array<{
            el: HTMLElement;
            fn: () => void;
        }> = [];

        const tabKeys = [
            "growth",
            "pos",
            "online",
            "addons",
        ];

        document
            .querySelectorAll<HTMLElement>(".tab-bar .tab")
            .forEach((btn, i) => {
                const fn = () => switchTab(btn, tabKeys[i]);

                btn.addEventListener("click", fn);

                tabHandlers.push({
                    el: btn,
                    fn,
                });
            });

        // Billing toggle
        const billingToggle =
            document.getElementById("billingToggle");

        const onToggle = () => toggleBilling();

        billingToggle?.addEventListener(
            "click",
            onToggle
        );

        // Online ordering subtabs
        const ooHandlers: Array<{
            el: HTMLElement;
            fn: () => void;
        }> = [];

        const ooKeys = [
            "fixed",
            "commission",
        ];

        document
            .querySelectorAll<HTMLElement>(".oo-subtab")
            .forEach((btn, i) => {
                const fn = () =>
                    switchOOTab(btn, ooKeys[i]);

                btn.addEventListener("click", fn);

                ooHandlers.push({
                    el: btn,
                    fn,
                });
            });


        // Add-on buttons
        const aoGrid =
            document.querySelector<HTMLElement>(".ao-grid");

        const onAoClick = (e: Event) => {
            const target = e.target as HTMLElement | null;

            const btn =
                target?.closest<HTMLButtonElement>(
                    ".ao-select-btn"
                );

            if (!btn || !aoGrid?.contains(btn)) {
                return;
            }

            const name =
                btn.getAttribute("data-name") || "";

            const price =
                btn.getAttribute("data-price") || "";

            toggleAddon(btn, name, price);
        };

        aoGrid?.addEventListener(
            "click",
            onAoClick
        );

        return () => {
            tabHandlers.forEach(({ el, fn }) => {
                el.removeEventListener("click", fn);
            });

            billingToggle?.removeEventListener(
                "click",
                onToggle
            );

            ooHandlers.forEach(({ el, fn }) => {
                el.removeEventListener("click", fn);
            });


            aoGrid?.removeEventListener(
                "click",
                onAoClick
            );
        };
    }, []);
    return (
        <div id="pg-menu-pricing-plan">

            {/* <button
      type="button"
      onClick={handleCreateSubscription}
    >
      Test Create Subscription
    </button> */}
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />

            <div className="app-container">
                {/* MAIN */}
                <div className="main">
                    {/* PAGE CONTENT */}
                    <div className="page-content">
                        <div style={{ marginBottom: "15px" }}>

                        </div>
                        {/* TABS */}
                        <div className="tab-bar">

                            <button className="tab active">Growth Plan</button>
                            <button className="tab">POS (Point of Sale)</button>
                            <button className="tab">Online Ordering</button>
                            <button className="tab">Add-ons</button>
                        </div>

                        {/* GROWTH PLAN PANEL */}
                        <div id="panel-growth" className="plan-wrapper">
                            <div className="plan-heading">
                                <h2>Everything You Get in the Growth Package</h2>
                                <p>A complete, done-for-you system to maximize revenue.</p>
                            </div>

                            <div className="outer-card">
                                {/* Price Card */}
                                <div className="price-card">
                                    <div className="plan-name">{plan?.Name}</div>
                                    <div className="price-row">
                                        <span className="old-price">
                                            {currencySymbol}
                                            {formatPrice(getPricing(plan)?.OriginalPrice)}
                                        </span>

                                        <span className="new-price">
                                            {getPricing(plan)?.Price !== undefined &&
                                                `${currencySymbol}${formatPrice(
                                                    getPricing(plan)?.Price
                                                )}`}
                                        </span>

                                        <span className="per-year">
                                            / {getPricing(plan)?.BillingCycle === "YEAR"
                                                ? "year"
                                                : "month"}
                                        </span>
                                    </div>
                                    <div className="all-features">All Features In One Plan</div>
                                </div>

                                {/* Core Features */}

                                <div id="features-list">
                                    {plan?.Features
                                        ?.filter((feature: any) => feature.IsIncluded)
                                        .map((feature: any) => (
                                            <div className="feature-row" key={feature.Id}>
                                                <div className="feature-icon">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}
                                </div>


                                {/* FREE Add-ons */}
                                <div className="addons-header">
                                    <span>Get FREE Powerful Add-ons</span>
                                    <span className="valued">Valued</span>
                                </div>

                                {addOns.map((addon, index) => (
                                    <div
                                        className="addon-row"
                                        key={`${addon.Id}-${addon.Price}-${index}`}
                                    >
                                        <div className="addon-icon">
                                            <svg viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                        </div>

                                        <span className="addon-name">
                                            {addon.Name}
                                        </span>

                                        <span className="addon-price">
                                            {currencySymbol}
                                            {Number(addon.Price).toLocaleString(
                                                displayCurrency === "Rs." ? "en-IN" : "en-US",
                                                {
                                                    minimumFractionDigits: displayCurrency === "$" ? 2 : 0,
                                                    maximumFractionDigits: displayCurrency === "$" ? 2 : 0,
                                                }
                                            )}
                                            {addon.BillingCycle
                                                ? ` / ${addon.BillingCycle.toLowerCase()}`
                                                : ""}
                                        </span>
                                    </div>
                                ))}





                                {/* Total + Buy */}
                                <div className="totals-card">
                                    <div className="total-bar red">
                                        Total Value: {displayPrice(onlineGrowthPlan?.TotalValue)}
                                    </div>
                                    <div className="total-bar green">
                                        Save ₹{onlineGrowthPlan?.TotalSavings?.toLocaleString("en-IN")}
                                    </div>
                                    <button
                                        className="buy-btn"
                                        onClick={() => handleCreateSubscription(onlineGrowthPlan)}
                                    >
                                        {onlineGrowthPlan?.CTAText}
                                    </button>
                                </div>
                            </div>
                            {/* end outer-card */}
                        </div>
                        {/* end growth panel */}

                        {/* POS TAB PANEL */}
                        <div
                            id="panel-pos"
                            className="pos-wrapper"
                            style={{ display: "none" }}
                        >
                            <p className="pos-desc">
                                Run your restaurant from a single screen — billing, KOT, tables,
                                and reports — with the option to add online ordering and channels
                                later.
                            </p>

                            {/* Monthly / Yearly Toggle */}
                            <div className="billing-toggle-row">
                                <span className="toggle-label">Monthly</span>
                                <div className="toggle-track" id="billingToggle">
                                    <div className="toggle-thumb" style={{ left: "3px" }}></div>
                                </div>
                                <span className="toggle-label">Yearly</span>
                                <span className="save-badge">Save 40%</span>
                            </div>

                            {/* Two plan cards */}
                            <div className="pos-cards">
                                {/* LITE */}
                                <div className="pos-card">
                                    <div className="pos-plan-name">
                                        {litePlan?.Name}
                                    </div>

                                    <div className="pos-plan-desc">
                                        {litePlan?.Subtitle}
                                    </div>

                                    <div className="pos-price">
                                        {currencySymbol}
                                        {formatPrice(getPricing(litePlan)?.Price)}

                                        <span>
                                            / {getPricing(litePlan)?.BillingCycle === "YEAR"
                                                ? "Year"
                                                : "Month"}
                                        </span>
                                    </div>
                                    <button className="pos-buy-btn" onClick={() => handleCreateSubscription(litePlan)}>
                                        {litePlan?.CTAText}
                                    </button>

                                    {/* Features */}
                                    {litePlan?.Features
                                        ?.sort((a: any, b: any) => a.DisplayOrder - b.DisplayOrder)
                                        .reduce((sections: any[], feature: any) => {
                                            const section = sections.find(
                                                (s) => s.title === feature.ExtraInfo
                                            );

                                            if (section) {
                                                section.features.push(feature);
                                            } else {
                                                sections.push({
                                                    title: feature.ExtraInfo,
                                                    features: [feature],
                                                });
                                            }

                                            return sections;
                                        }, [])
                                        .map((section: any) => (
                                            <div key={section.title}>
                                                <div className="feat-section-title">
                                                    {section.title}
                                                </div>

                                                {section.features.map((feature: any) => (
                                                    <div className="feat-item" key={feature.Id}>
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
                                <div className="pos-card premium">
                                    <div className="recommended-badge">Recommended</div>
                                    <div className="pos-plan-name">
                                        {premiumPlan?.Name}
                                    </div>
                                    <div className="pos-plan-desc">
                                        {premiumPlan?.Subtitle}
                                    </div>
                                    <div className="pos-price">
                                        {currencySymbol}
                                        {formatPrice(getPricing(premiumPlan)?.Price)}

                                        <span>
                                            / {getPricing(premiumPlan)?.BillingCycle === "YEAR"
                                                ? "Year"
                                                : "Month"}
                                        </span>
                                    </div>
                                    <button className="pos-buy-btn premium-btn" onClick={() => handleCreateSubscription(premiumPlan)}>
                                        {premiumPlan?.CTAText}
                                        {console.log("PREMIUM FEATURES:", premiumPlan?.Features)}
                                    </button>


                                    <div className="feat-section-title">
                                        Everything In Lite, plus
                                    </div>

                                    {premiumPlan?.Features
                                        ?.filter((feature: any) => feature.IsIncluded)
                                        .map((feature: any) => (
                                            <div className="feat-item" key={feature.Id}>
                                                <div className="feat-check">
                                                    <Check />
                                                </div>

                                                {feature.Name}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {/* end pos-cards */}
                        </div>
                        {/* end panel-pos */}

                        {/* ONLINE ORDERING TAB PANEL */}
                        <div
                            id="panel-online"
                            className="oo-wrapper"
                            style={{ display: "none" }}
                        >
                            {/* Fixed / Commission sub-tabs */}
                            <div className="oo-subtab-row">
                                <button className="oo-subtab active">Fixed Plan</button>
                                <button className="oo-subtab">Commission Plan</button>
                            </div>

                            {/* Fixed Plan content */}
                            <div id="oo-fixed">
                                <div className="oo-cards">
                                    {/* COL 1: Online Monthly Plan */}
                                    <div className="oo-col">
                                        <div className="oo-plan-name">
                                            {onlineMonthlyPlan?.Name}
                                        </div>
                                        <div className="oo-price-plain">
                                            {onlineMonthlyPlan?.BillingText}
                                        </div>
                                        <div className="oo-desc">
                                            {onlineMonthlyPlan?.Subtitle}
                                        </div>
                                        <button className="oo-get-btn">
                                            {onlineMonthlyPlan?.CTAText}
                                        </button>
                                        {onlineMonthlyPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id}>
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
                                        <OOAddons addOns={addOns} />
                                    </div>

                                    {/* COL 2: Growth Plan (featured) */}
                                    <div className="oo-col featured">
                                        <div className="oo-badge orange">{onlineGrowthPlan?.BadgeText}</div>
                                        <button className="oo-growth-btn">
                                            {onlineGrowthPlan?.Name}
                                        </button>
                                        <div style={{ marginBottom: "4px" }}>
                                            <span className="oo-new-price">
                                                {displayPrice(getPricing(onlineGrowthPlan)?.Price)}
                                            </span>{" "}

                                            <span className="oo-per">
                                                / {getPricing(onlineGrowthPlan)?.BillingCycle === "YEAR"
                                                    ? "year"
                                                    : "month"}
                                            </span>
                                        </div>
                                        <div className="oo-save">
                                            Save {displayPrice(onlineGrowthPlan?.TotalSavings)}
                                        </div>
                                        <div className="oo-all-feat">
                                            {onlineGrowthPlan?.Subtitle}
                                        </div>
                                        <button className="oo-buy-btn">
                                            {onlineGrowthPlan?.CTAText}
                                        </button>

                                        {onlineGrowthPlan?.Features
                                            ?.filter((feature: any) => feature.IsIncluded)
                                            ?.sort((a: any, b: any) => a.DisplayOrder - b.DisplayOrder)
                                            ?.map((feature: any) => (
                                                <div className="oo-feat" key={feature.Id}>
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
                                        {addOns.map((addon, index) => (
                                            <div
                                                className="oo-addon-row teal-row"
                                                key={`${addon.Id}-${addon.Price}-${index}`}
                                            >
                                                <div className="oo-addon-icon">
                                                    <span>+</span>
                                                </div>

                                                <span className="oo-addon-name">
                                                    {addon.Name}
                                                </span>

                                                <span className="oo-addon-price">
                                                    {displayPrice(addon.Price)}
                                                    {addon.BillingCycle
                                                        ? ` / ${addon.BillingCycle.toLowerCase()}`
                                                        : ""}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="oo-total-block">
                                            <div className="oo-total-red">
                                                <span>TOTAL VALUE:</span>
                                                <span>
                                                    {displayPrice(onlineGrowthPlan?.TotalValue)}
                                                </span>
                                            </div>
                                            <div className="oo-total-green">
                                                <p>You save with Growth Plan</p>
                                                <div className="big-save">
                                                    {displayPrice(onlineGrowthPlan?.TotalSavings)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 3: Online Yearly Plan */}
                                    <div className="oo-col">
                                        <div className="oo-badge teal">
                                            {onlineYearlyPlan?.HighlightText}
                                        </div>
                                        <div className="oo-plan-name">
                                            {onlineYearlyPlan?.Name}
                                        </div>
                                        <div className="oo-price-plain">
                                            {onlineYearlyPlan?.BillingText}
                                        </div>
                                        <div className="oo-desc">
                                            {onlineYearlyPlan?.Subtitle}
                                        </div>
                                        <button className="oo-get-btn">
                                            {onlineYearlyPlan?.CTAText}
                                        </button>

                                        {onlineYearlyPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id}>
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
                                        <OOAddons addOns={addOns} />
                                    </div>
                                </div>
                                {/* end oo-cards */}
                            </div>
                            {/* end oo-fixed */}

                            {/* Commission Plan - Single Card */}
                            <div id="oo-commission" style={{ display: "none" }}>
                                <div
                                    style={{
                                        maxWidth: "400px",
                                        margin: "0 auto",
                                        paddingTop: "20px",
                                    }}
                                >
                                    <div className="oo-col" style={{ borderRadius: "16px" }}>
                                        <div className="oo-badge teal">
                                            {commissionPlan?.HighlightText}
                                        </div>
                                        <div className="oo-plan-name">
                                            {commissionPlan?.Name}
                                        </div>
                                        <div className="oo-price-plain">
                                            {commissionPlan?.BillingText}
                                        </div>
                                        <div className="oo-desc">
                                            {commissionPlan?.Subtitle}
                                        </div>
                                        <button className="oo-get-btn">
                                            {commissionPlan?.CTAText}
                                        </button>

                                        {commissionPlan?.Features?.map((feature: any) => (
                                            <div className="oo-feat" key={feature.Id}>
                                                <div className="oo-check green">
                                                    <Check />
                                                </div>
                                                {feature.Name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end panel-online */}

                        {/* ADD-ONS TAB PANEL */}
                        <div id="panel-addons" style={{ display: "none" }}>
                            <div className="ao-layout">
                                {/* Add-on Cards Grid */}
                                <div className="ao-grid-wrap">
                                    <div className="ao-grid">
                                        {addOns?.map((addon, index) => (
                                            addon ? (
                                            <div className="ao-card" key={addon.Id || index}>
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
                                                            {displayCurrency === "Rs." || displayCurrency === "INR" || displayCurrency === "₹" ? "₹" : "$"}
                                                            {Number(addon.Price).toLocaleString(
                                                                displayCurrency === "Rs." ? "en-IN" : "en-US",
                                                                {
                                                                    minimumFractionDigits: displayCurrency === "$" ? 2 : 0,
                                                                    maximumFractionDigits: displayCurrency === "$" ? 2 : 0,
                                                                }
                                                            )}
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
                                                        {addon.Description}
                                                    </div>
                                                </div>
                                                <button
                                                    className="ao-select-btn"
                                                    data-name={addon.Name}
                                                    data-price={addon.Price}
                                                >
                                                    Select Add-on
                                                </button>
                                            </div>
                                            ) : null
                                        ))}
                                    </div>
                                    {/* end ao-grid */}
                                </div>
                                {/* end ao-grid-wrap */}

                                {/* Cart Summary */}
                                <div className="ao-cart">
                                    <div className="ao-cart-title">Cart Summary</div>
                                    <div id="ao-cart-empty" className="ao-cart-empty">
                                        No add-ons selected
                                    </div>
                                    <div
                                        id="ao-cart-items"
                                        className="ao-cart-items"
                                        style={{ display: "none" }}
                                    ></div>
                                    <div className="ao-subtotal-row">
                                        <span>Subtotal</span>
                                        <span id="ao-subtotal">₹ 0.00</span>
                                    </div>
                                    <div className="ao-total-row">
                                        <span>Total</span>
                                        <span id="ao-total">₹ 0.00</span>
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
                                    <button className="ao-pay-btn" id="ao-pay-btn">
                                        Proceed to pay (₹ 0.00)
                                    </button>
                                    <div className="ao-card-icon">
                                        <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
                                            <rect width="40" height="26" rx="4" fill="#1a3c8f" />
                                            <rect
                                                x="0"
                                                y="8"
                                                width="40"
                                                height="8"
                                                fill="#fff"
                                                opacity=".15"
                                            />
                                            <rect
                                                x="4"
                                                y="16"
                                                width="12"
                                                height="4"
                                                rx="1"
                                                fill="#ffd700"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {/* end ao-layout */}
                        </div>
                        {/* end panel-addons */}
                    </div>
                    {/* end page-content */}
                </div>
                {/* end main */}
            </div>
            {/* end app-container */}
        </div>
    );
}

function OOAddons({
    teal = false,
    addOns,
}: {
    teal?: boolean;
    addOns: any[];
}) {
    const cls = "oo-addon-row" + (teal ? " teal-row" : "");
    const formatPrice = (addon: any) => {
        if (!addon) return "";

        if (addon.Price !== undefined && addon.Price !== null) {
            return `₹${Number(addon.Price).toLocaleString("en-IN")}`;
        }

        return "";
    };
        return (
        <>
            {addOns?.map((addon, index) => (
                addon ? (
                <div className={cls} key={addon.Id || index}>
                    <div className="oo-addon-icon">
                        <svg viewBox="0 0 24 24">
                            <line x1="19" y1="5" x2="5" y2="19" />
                            <circle cx="6.5" cy="6.5" r="2.5" />
                            <circle cx="17.5" cy="17.5" r="2.5" />
                        </svg>
                    </div>
                    <span className="oo-addon-name">
                        {addon.Name}
                    </span>
                    <span className="oo-addon-price">
                        {formatPrice(addon)}
                    </span>
                </div>
                ) : null
            ))}
        </>
    );
}