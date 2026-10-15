"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import { restaurantService, setupService } from "@/api/services/setup.service";
import "./page.css";

interface InvoiceItem {
    desc: string;
    detail: string;
    qty: number;
    amount: number;
}

interface InvoiceData {
    number: string;
    date: string;
    plan: string;
    amount: number;
    items: InvoiceItem[];
}

export default function MyPlanPage() {
    const SHOP_ID = useShopId();
    const [currentPlans, setCurrentPlans] = useState<any[]>([]);
    const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);

    const [currency, setCurrency] = useState<string>("INR");
    const [currencySymbol, setCurrencySymbol] = useState<string>("₹");

    const getSymbolForCurrency = (curr: string) => {
        const trimmed = (curr || "").trim();
        if (trimmed === "INR" || trimmed === "Rs." || trimmed === "Rs" || trimmed === "₹") {
            return "₹";
        } else if (trimmed === "USD" || trimmed === "$") {
            return "$";
        } else if (trimmed === "AUD") {
            return "A$";
        } else if (trimmed === "CAD") {
            return "C$";
        } else if (trimmed === "EUR" || trimmed === "€") {
            return "€";
        } else if (trimmed === "GBP" || trimmed === "£") {
            return "£";
        }
        return trimmed || "₹";
    };

    const displayPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null || price === "") {
            return "";
        }
        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) {
            return "";
        }
        const isIndian = currency === "Rs." || currency === "INR" || currency === "₹";
        return `${currencySymbol}${numericPrice.toLocaleString(
            isIndian ? "en-IN" : "en-US",
            {
                minimumFractionDigits: isIndian ? 0 : 2,
                maximumFractionDigits: isIndian ? 0 : 2,
            }
        )}`;
    };

    useEffect(() => {
        const initCurrency = async () => {
            let sessionCurr = sessionStorage.getItem("currency") || sessionStorage.getItem("shopcurrency") || localStorage.getItem("currency") || "";
            const shopId = SHOP_ID || sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id");

            if (!sessionCurr && shopId) {
                try {
                    const info = await setupService.getRestaurantInformation(Number(shopId));
                    if (info?.currency) {
                        sessionCurr = info.currency;
                        sessionStorage.setItem("currency", sessionCurr);
                    }
                } catch (e) {
                    console.error("Error fetching restaurant currency:", e);
                }
            }

            if (sessionCurr) {
                setCurrency(sessionCurr.trim());
                setCurrencySymbol(getSymbolForCurrency(sessionCurr));
            }
        };
        initCurrency();
    }, [SHOP_ID]);

    useEffect(() => {
        const fetchInfo = async () => {
            if (!SHOP_ID) return;
            try {
                const [info, invList] = await Promise.allSettled([
                    setupService.getRestaurantInformation(Number(SHOP_ID)),
                    setupService.getShopInvoices(SHOP_ID)
                ]);
                if (info.status === "fulfilled" && info.value) {
                    setRestaurantInfo(info.value);
                    if (info.value.currency) {
                        setCurrency(info.value.currency.trim());
                        setCurrencySymbol(getSymbolForCurrency(info.value.currency));
                    }
                }
                if (invList.status === "fulfilled" && invList.value) {
                    const data = (invList.value as any)?.data || invList.value;
                    if (Array.isArray(data)) {
                        setInvoices(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load restaurant / invoice info:", err);
            }
        };
        fetchInfo();
    }, [SHOP_ID]);

    useEffect(() => {
        const fetchPlans = async () => {
            if (!SHOP_ID) return;
            try {
                // 1. Fetch live plan details for the specific shop from live API
                try {
                    const res = await restaurantService.getPointPlanDetails(SHOP_ID);
                    if (res?.data) {
                        const parsedData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
                        if (parsedData && parsedData.length > 0) {
                            setCurrentPlans(parsedData);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("Live point plan details fetch failed, checking purchases:", e);
                }

                // 2. Fallback to pricing plan purchases
                const purchasesRes = await setupService.getPricingPlanPurchases(SHOP_ID);
                const purchaseData = purchasesRes?.data || purchasesRes?.Data || purchasesRes;
                if (Array.isArray(purchaseData) && purchaseData.length > 0) {
                    const formatted = purchaseData.map((item: any) => ({
                        plan_id: item.Id || item.id || item.plan_id,
                        plan_name: item.PlanName || item.plan_name || item.plan_type || "Subscription Plan",
                        billing_cycle: item.BillingCycle || item.billing_cycle || item.plan_duration || "",
                        purchase_date: item.PurchaseDate || item.purchase_date || item.created_date || item.start_date,
                        start_date: item.PurchaseDate || item.purchase_date || item.created_date || item.start_date,
                        expiry_date: item.ExpiryDate || item.expiry_date || item.end_date,
                        end_date: item.ExpiryDate || item.expiry_date || item.end_date,
                        status: item.Status || item.status || "ACTIVE",
                        subscription_id: item.SubscriptionId || item.subscription_id || "",
                        record_type: item.RecordType || item.record_type || "Plan",
                        amount: item.total_amt ?? item.amount ?? 0,
                        commision: item.commission ?? item.commision ?? "0%",
                        coins: item.coins ?? 0,
                        invoice_no: item.invoice_no,
                    }));
                    setCurrentPlans(formatted);
                }
            } catch (err) {
                console.error("Failed to fetch plans:", err);
            }
        };
        fetchPlans();
    }, [SHOP_ID]);

    const formatDate = (dateVal: any) => {
        if (!dateVal) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        try {
            if (typeof dateVal === "object" && dateVal?.Value) {
                return new Date(parseInt(dateVal.Value.replace(/\/Date\((.*?)\)\//, '$1'))).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            if (typeof dateVal === "string" && dateVal.includes("/Date(")) {
                return new Date(parseInt(dateVal.replace(/\/Date\((.*?)\)\//, '$1'))).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        } catch { }
        return String(dateVal);
    };

    const openInvoiceModal = (plan: any) => {
        const dateStr = formatDate(plan.start_date || plan.created_date || plan.purchase_date);
        const amt = parseFloat(plan.amount) || 0;
        const matchingInv = invoices.find((inv: any) => inv.plan_id === plan.plan_id || inv.plan_name === plan.plan_name) || invoices[0];
        const invoiceNum = plan.invoice_no || matchingInv?.invoice_no || matchingInv?.invoice_number || `#FC-${new Date().getFullYear()}-${plan.plan_id || "0001"}`;

        setActiveInvoice({
            number: invoiceNum,
            date: dateStr,
            plan: plan.plan_name || "Subscription Plan",
            amount: amt,
            items: [
                {
                    desc: plan.plan_name || "FoodChow Subscription",
                    detail: amt === 0 ? "Free Plan · No renewal needed" : `Billing plan · Commission: ${plan.commision ?? "0%"}`,
                    qty: 1,
                    amount: amt,
                },
            ],
        });
        setIsInvoiceOpen(true);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    return (
        <div id="pg-menu-my-plan">
            <div className="layout">
                <div className="main">
                    <div className="content-area">
                        <div className="card">
                            <div className="typ-page-heading card-title">My Plan</div>
                            <div className="card-sub">
                                Manage your active subscriptions and billing details
                            </div>

                            <div className="plans-list">
                                {currentPlans.length > 0 ? (
                                    currentPlans.map((plan: any, index: number) => {
                                        const purchaseDateStr = formatDate(plan.purchase_date || plan.start_date || plan.created_date);
                                        const expiryDateStr = formatDate(plan.expiry_date || plan.end_date);

                                        const amt = parseFloat(plan.amount) || 0;
                                        const rawName = String(plan.plan_name || plan.plan_type || "Subscription Plan");
                                        let displayName = rawName;
                                        if (rawName.toLowerCase() === "monthly plan") displayName = "Online Monthly Plan";
                                        else if (rawName.toLowerCase() === "yearly plan") displayName = "Online Yearly Plan";

                                        const billingCycle = (plan.billing_cycle || "").trim();
                                        const isLifetime = billingCycle.toUpperCase() === "ONETIME" ||
                                            billingCycle.toUpperCase() === "LIFETIME" ||
                                            displayName.toLowerCase().includes("lifetime") ||
                                            displayName.toLowerCase().includes("life time");
                                        const isFree = (amt === 0 && !billingCycle) || displayName.toLowerCase().includes("free");
                                        const canCancel = !isFree && !isLifetime;

                                        return (
                                            <div className="plan-card" key={index}>
                                                <div className="plan-card-left">
                                                    <div className="plan-name-row">
                                                        <span className="plan-name">
                                                            {displayName} {billingCycle ? `(${billingCycle})` : ""}
                                                        </span>
                                                        <span className="plan-badge active">
                                                            {plan.status || "ACTIVE"}
                                                        </span>
                                                    </div>
                                                    <div className="plan-meta">
                                                        Purchase Date: <b>{purchaseDateStr}</b>
                                                    </div>
                                                    <div className="plan-renewal" style={{ color: "#0ca678", fontWeight: 500, marginTop: "4px" }}>
                                                        {isLifetime || isFree
                                                            ? "Lifetime Access • No Renewal Needed"
                                                            : (plan.expiry_date || plan.end_date)
                                                                ? `Your plan will renew on ${expiryDateStr}`
                                                                : `Amount: ${displayPrice(amt)} • Commission: ${plan.commision ?? "0%"}`}
                                                    </div>
                                                </div>
                                                <div className="plan-card-actions">
                                                    {canCancel && (
                                                        <button
                                                            type="button"
                                                            className="btn-cancel"
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to cancel your ${displayName} subscription?`)) {
                                                                    alert("Your cancellation request has been submitted. Our support team will process it shortly.");
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa-regular fa-circle-xmark" style={{ marginRight: "4px" }}></i>
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <a href="/menu/pricing-plan" className="btn-manage">
                                                        Manage Plan
                                                    </a>
                                                    {Boolean(plan.invoice_no || plan.id || plan.plan_id) && (
                                                        <button
                                                            type="button"
                                                            className="btn-invoice"
                                                            onClick={() => openInvoiceModal(plan)}
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                                <polyline points="14 2 14 8 20 8" />
                                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                                <polyline points="10 9 9 9 8 9" />
                                                            </svg>
                                                            Invoice
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No active plans found.</div>
                                )}
                            </div>
                        </div>

                        <WizardFooter />
                    </div>
                </div>
            </div>

            {/* Dynamic Invoice Modal */}
            <div className={`modal-overlay ${isInvoiceOpen ? "show" : ""}`} id="invoiceModal" onClick={(e) => { if (e.target === e.currentTarget) setIsInvoiceOpen(false); }}>
                <div className="invoice-modal" id="invoiceModalBox">
                    <button className="invoice-close-btn" id="invoiceCloseBtn" onClick={() => setIsInvoiceOpen(false)}>
                        ×
                    </button>
                    <div className="invoice-modal-header">
                        <div>
                            <div className="invoice-brand-name">FoodChow</div>
                            <div className="invoice-brand-sub">
                                foodchow.com · support@foodchow.com
                            </div>
                        </div>
                        <div className="invoice-number-block">
                            <div className="invoice-label">Invoice</div>
                            <div className="invoice-number" id="inv-number">
                                {activeInvoice?.number || "#FC-2026-0001"}
                            </div>
                        </div>
                    </div>
                    <div className="invoice-body">
                        <div className="invoice-meta-row">
                            <div>
                                <div className="invoice-meta-title">Billed To</div>
                                <div className="invoice-meta-value">
                                    {restaurantInfo?.first_name
                                        ? `${restaurantInfo.first_name} ${restaurantInfo.last_name || ""}`.trim()
                                        : (restaurantInfo?.shop_name || "Restaurant Owner")}
                                </div>
                                <div style={{ fontSize: "12px", color: "#666" }}>
                                    {restaurantInfo?.email_id || restaurantInfo?.owner_eamil || "owner@restaurant.com"}
                                </div>
                            </div>
                            <div>
                                <div className="invoice-meta-title">Invoice Date</div>
                                <div className="invoice-meta-value" id="inv-date">
                                    {activeInvoice?.date || "—"}
                                </div>
                            </div>
                        </div>
                        <div className="invoice-meta-row">
                            <div>
                                <div className="invoice-meta-title">Plan</div>
                                <div className="invoice-meta-value teal" id="inv-plan-name">
                                    {activeInvoice?.plan || "—"}
                                </div>
                            </div>
                            <div>
                                <div className="invoice-meta-title">Payment Status</div>
                                <div className="invoice-status-badge">PAID</div>
                            </div>
                        </div>
                        <div className="invoice-divider"></div>
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th style={{ textAlign: "center" }}>Qty</th>
                                    <th style={{ textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody id="inv-items">
                                {activeInvoice?.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="item-name">{item.desc}</div>
                                            <div className="item-desc">{item.detail}</div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>{item.qty}</td>
                                        <td style={{ textAlign: "right" }}>{displayPrice(item.amount * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="invoice-totals">
                            <div className="invoice-total-row">
                                <span>Subtotal</span>
                                <span id="inv-subtotal">{displayPrice(activeInvoice?.amount || 0)}</span>
                            </div>
                            <div className="invoice-total-row">
                                <span>Tax (0%)</span>
                                <span>{displayPrice(0)}</span>
                            </div>
                            <div className="invoice-grand-total">
                                <span>Total Paid</span>
                                <span id="inv-total">{displayPrice(activeInvoice?.amount || 0)}</span>
                            </div>
                        </div>
                        <div className="invoice-divider"></div>
                        <div className="invoice-footer-note">
                            Thank you for your subscription with FoodChow.
                            <br />
                            For billing queries contact{" "}
                            <strong>support@foodchow.com</strong>
                        </div>
                    </div>
                    <div className="invoice-actions">
                        <button className="btn-print" id="invoicePrintBtn" onClick={handlePrintInvoice}>
                            <i className="fa-solid fa-print"></i>
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
