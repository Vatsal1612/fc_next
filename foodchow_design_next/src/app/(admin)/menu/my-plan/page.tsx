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
        const fetchPoints = async () => {
            if (!SHOP_ID) return;
            try {
                const res = await restaurantService.getPointPlanDetails(SHOP_ID);
                if (res?.data) {
                    const parsedData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
                    if (parsedData && parsedData.length > 0) {
                        setCurrentPlans(parsedData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch points:", err);
            }
        };
        fetchPoints();
    }, [SHOP_ID]);

    const openInvoiceModal = (plan: any) => {
        const dateStr = plan.start_date?.Value
            ? new Date(parseInt(plan.start_date.Value.replace(/\/Date\((.*?)\)\//, '$1'))).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const amt = parseFloat(plan.amount) || 0;
        const matchingInv = invoices.find((inv: any) => inv.plan_id === plan.plan_id || inv.plan_name === plan.plan_name) || invoices[0];
        const invoiceNum = matchingInv?.invoice_no || matchingInv?.invoice_number || `#FC-${new Date().getFullYear()}-${plan.plan_id || "0001"}`;

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

    const handleDownloadInvoice = () => {
        window.print();
    };

    return (
        <div id="pg-menu-my-plan">
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />

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
                                        const dateStr = plan.start_date?.Value
                                            ? new Date(parseInt(plan.start_date.Value.replace(/\/Date\((.*?)\)\//, '$1'))).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : "Unknown";

                                        return (
                                            <div className="plan-card" key={index}>
                                                <div className="plan-card-left">
                                                    <div className="plan-name-row">
                                                        <span className="plan-name">
                                                            {plan.plan_name || "Unknown Plan"}
                                                        </span>
                                                        <span className="plan-badge active">ACTIVE</span>
                                                    </div>
                                                    <div className="plan-meta">Purchase Date: {dateStr}</div>
                                                    <div className="plan-renewal" style={{ color: "green", fontWeight: 500 }}>
                                                        {plan.amount === 0 || plan.amount === "0" || !plan.amount ? "Free Plan • No Renewal Needed" : `Amount: ${plan.amount} • Commission: ${plan.commision}`}
                                                    </div>
                                                </div>
                                                <div className="plan-card-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <a href="/menu/pricing-plan" className="btn-primary" style={{ backgroundColor: "#00a896", border: "none", color: "white", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", textDecoration: "none" }}>
                                                        Manage Plan
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="btn-invoice"
                                                        onClick={() => openInvoiceModal(plan)}
                                                        style={{ background: "none", border: "1px solid #ccc", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                            <line x1="16" y1="13" x2="8" y2="13" />
                                                            <line x1="16" y1="17" x2="8" y2="17" />
                                                            <polyline points="10 9 9 9 8 9" />
                                                        </svg>
                                                        Invoice
                                                    </button>
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
                                        <td style={{ textAlign: "right" }}>${(item.amount * item.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="invoice-totals">
                            <div className="invoice-total-row">
                                <span>Subtotal</span>
                                <span id="inv-subtotal">${(activeInvoice?.amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="invoice-total-row">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="invoice-grand-total">
                                <span>Total Paid</span>
                                <span id="inv-total">${(activeInvoice?.amount || 0).toFixed(2)}</span>
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
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print
                        </button>
                        <button className="btn-download" id="invoiceDownloadBtn" onClick={handleDownloadInvoice}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
