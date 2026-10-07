"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

export default function MyPlanPage() {
    useEffect(() => {
        interface InvoiceItem {
            desc: string;
            detail: string;
            qty: number;
            amount: number;
        }
        interface InvoiceEntry {
            number: string;
            date: string;
            plan: string;
            items: InvoiceItem[];
        }

        const onWindowClick = () =>
            document
                .querySelectorAll<HTMLElement>(".dropdown-menu")
                .forEach((m) => m.classList.remove("show"));
        window.addEventListener("click", onWindowClick);

        const helpBtn = document.getElementById("helpBtn");
        const onHelp = () => alert("Help & Support - My Plan");
        helpBtn?.addEventListener("click", onHelp);

        const supportTicketBtn = document.getElementById("supportTicketBtn");
        const onSupport = () => alert("Create support ticket");
        supportTicketBtn?.addEventListener("click", onSupport);

        function handleCancel(): void {
            if (confirm("Cancel Lite (MONTH) plan?")) alert("Cancellation requested.");
        }

        const invoiceData: Record<string, InvoiceEntry> = {
            lifetime: {
                number: "#FC-2026-0001",
                date: "03 Jun 2026",
                plan: "Commission Plan (LIFETIME)",
                items: [
                    {
                        desc: "Commission Plan — Lifetime Access",
                        detail: "One-time payment · No renewal",
                        qty: 1,
                        amount: 299.0,
                    },
                ],
            },
            monthly: {
                number: "#FC-2026-0002",
                date: "03 Jun 2026",
                plan: "Lite (MONTH)",
                items: [
                    {
                        desc: "Lite Plan — Monthly Subscription",
                        detail: "Billing period: 03 Jun 2026 – 03 Jul 2026",
                        qty: 1,
                        amount: 19.0,
                    },
                ],
            },
        };

        function escapeHtml(str: string): string {
            if (!str) return "";
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function openInvoice(type: string): void {
            const d = invoiceData[type];
            if (!d) return;
            const num = document.getElementById("inv-number");
            const date = document.getElementById("inv-date");
            const planName = document.getElementById("inv-plan-name");
            if (num) num.textContent = d.number;
            if (date) date.textContent = d.date;
            if (planName) planName.textContent = d.plan;
            let rows = "",
                subtotal = 0;
            d.items.forEach((i) => {
                subtotal += i.amount * i.qty;
                rows += `<tr><td><div class="item-name">${escapeHtml(i.desc)}</div><div class="item-desc">${escapeHtml(i.detail)}</div></td><td style="text-align:center">${i.qty}</td><td style="text-align:right">$${(
                    i.amount * i.qty
                ).toFixed(2)}</td></tr>`;
            });
            const items = document.getElementById("inv-items");
            const subtotalEl = document.getElementById("inv-subtotal");
            const totalEl = document.getElementById("inv-total");
            if (items) items.innerHTML = rows;
            if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
            if (totalEl) totalEl.textContent = "$" + subtotal.toFixed(2);
            document.getElementById("invoiceModal")?.classList.add("show");
            document.body.style.overflow = "hidden";
        }

        function closeInvoice(): void {
            document.getElementById("invoiceModal")?.classList.remove("show");
            document.body.style.overflow = "";
        }

        function downloadInvoice(): void {
            alert("PDF download would be triggered here.");
        }

        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeInvoice();
        };
        document.addEventListener("keydown", onKeydown);

        // Wire invoice modal overlay click
        const invoiceModal = document.getElementById("invoiceModal");
        const onOverlayClick = (e: MouseEvent) => {
            if (e.target === invoiceModal) closeInvoice();
        };
        invoiceModal?.addEventListener("click", onOverlayClick);

        // Wire close / print / download
        const closeBtn = document.getElementById("invoiceCloseBtn");
        const onClose = () => closeInvoice();
        closeBtn?.addEventListener("click", onClose);

        const printBtn = document.getElementById("invoicePrintBtn");
        const onPrint = () => window.print();
        printBtn?.addEventListener("click", onPrint);

        const downloadBtn = document.getElementById("invoiceDownloadBtn");
        const onDownload = () => downloadInvoice();
        downloadBtn?.addEventListener("click", onDownload);

        // Wire invoice open links
        const invLifetime = document.getElementById("inv-link-lifetime");
        const onInvLifetime = (e: Event) => {
            e.preventDefault();
            openInvoice("lifetime");
        };
        invLifetime?.addEventListener("click", onInvLifetime);

        const invMonthly = document.getElementById("inv-link-monthly");
        const onInvMonthly = (e: Event) => {
            e.preventDefault();
            openInvoice("monthly");
        };
        invMonthly?.addEventListener("click", onInvMonthly);

        // Wire cancel button
        const cancelBtn = document.getElementById("cancelBtn");
        const onCancel = () => handleCancel();
        cancelBtn?.addEventListener("click", onCancel);

        // sidebar active & submenu active for My Plan
        const sideItems = document.querySelectorAll<HTMLElement>(".sidebar .nav-item");
        const subGroups = document.querySelectorAll<HTMLElement>(".submenu-group");
        const sideHandlers: Array<{ el: HTMLElement; fn: () => void }> = [];
        sideItems.forEach((item) => {
            const fn = function (this: HTMLElement) {
                sideItems.forEach((m) => m.classList.remove("active"));
                item.classList.add("active");
                subGroups.forEach((g) => g.classList.remove("active"));
                const target = item.getAttribute("data-target");
                if (target) document.getElementById(target)?.classList.add("active");
            };
            item.addEventListener("click", fn);
            sideHandlers.push({ el: item, fn });
        });
        // ensure my plan submenu is active by default
        document
            .querySelectorAll<HTMLElement>(".submenu-item")
            .forEach((s) => s.classList.remove("active"));
        document.getElementById("myPlanSubmenu")?.classList.add("active");

        // step nav
        let currentStep = 6;
        const totalSteps = 25;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const stepValue = document.getElementById("stepValue");
        const onPrev = () => {
            if (currentStep > 1) {
                currentStep--;
                if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
            }
        };
        const onNext = () => {
            if (currentStep < totalSteps) {
                currentStep++;
                if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
            }
        };
        prevBtn?.addEventListener("click", onPrev);
        nextBtn?.addEventListener("click", onNext);

        return () => {
            window.removeEventListener("click", onWindowClick);
            helpBtn?.removeEventListener("click", onHelp);
            supportTicketBtn?.removeEventListener("click", onSupport);
            document.removeEventListener("keydown", onKeydown);
            invoiceModal?.removeEventListener("click", onOverlayClick);
            closeBtn?.removeEventListener("click", onClose);
            printBtn?.removeEventListener("click", onPrint);
            downloadBtn?.removeEventListener("click", onDownload);
            invLifetime?.removeEventListener("click", onInvLifetime);
            invMonthly?.removeEventListener("click", onInvMonthly);
            cancelBtn?.removeEventListener("click", onCancel);
            sideHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
            prevBtn?.removeEventListener("click", onPrev);
            nextBtn?.removeEventListener("click", onNext);
        };
    }, []);

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
                                <div className="plan-card">
                                    <div className="plan-card-left">
                                        <div className="plan-name-row">
                                            <span className="plan-name">
                                                Commission Plan (LIFETIME)
                                            </span>
                                            <span className="plan-badge active">ACTIVE</span>
                                        </div>
                                        <div className="plan-meta">Purchase Date: 03 Jun 2026</div>
                                        <div className="plan-renewal">
                                            Lifetime Access • No Renewal Needed
                                        </div>
                                    </div>
                                    <div className="plan-card-actions">
                                        <a href="#" className="btn-invoice" id="inv-link-lifetime">
                                            <svg viewBox="0 0 24 24">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                <polyline points="10 9 9 9 8 9" />
                                            </svg>
                                            Invoice
                                        </a>
                                        <a href="#" className="btn-manage">
                                            Manage Plan
                                        </a>
                                    </div>
                                </div>
                                <div className="plan-card">
                                    <div className="plan-card-left">
                                        <div className="plan-name-row">
                                            <span className="plan-name">Lite (MONTH)</span>
                                            <span className="plan-badge active">ACTIVE</span>
                                        </div>
                                        <div className="plan-meta">Purchase Date: 03 Jun 2026</div>
                                        <div className="plan-renewal">
                                            Your plan will renew on 03 Jul 2026
                                        </div>
                                    </div>
                                    <div className="plan-card-actions">
                                        <a href="#" className="btn-invoice" id="inv-link-monthly">
                                            <svg viewBox="0 0 24 24">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                <polyline points="10 9 9 9 8 9" />
                                            </svg>
                                            Invoice
                                        </a>
                                        <button className="btn-cancel" id="cancelBtn">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    fill="#fee2e2"
                                                    stroke="#ef4444"
                                                    strokeWidth="1.5"
                                                />
                                                <line
                                                    x1="15"
                                                    y1="9"
                                                    x2="9"
                                                    y2="15"
                                                    stroke="#ef4444"
                                                    strokeWidth="2"
                                                />
                                                <line
                                                    x1="9"
                                                    y1="9"
                                                    x2="15"
                                                    y2="15"
                                                    stroke="#ef4444"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                            Cancel
                                        </button>
                                        <a href="#" className="btn-manage">
                                            Manage Plan
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <WizardFooter />
                    </div>
                </div>
            </div>

            <div className="modal-overlay" id="invoiceModal">
                <div className="invoice-modal" id="invoiceModalBox">
                    <button className="invoice-close-btn" id="invoiceCloseBtn">
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
                                #FC-2026-0001
                            </div>
                        </div>
                    </div>
                    <div className="invoice-body">
                        <div className="invoice-meta-row">
                            <div>
                                <div className="invoice-meta-title">Billed To</div>
                                <div className="invoice-meta-value">Dimpal Patel</div>
                                <div style={{ fontSize: "12px" }}>owner@myrestaurant.com</div>
                            </div>
                            <div>
                                <div className="invoice-meta-title">Invoice Date</div>
                                <div className="invoice-meta-value" id="inv-date">
                                    03 Jun 2026
                                </div>
                            </div>
                        </div>
                        <div className="invoice-meta-row">
                            <div>
                                <div className="invoice-meta-title">Plan</div>
                                <div className="invoice-meta-value teal" id="inv-plan-name">
                                    —
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
                            <tbody id="inv-items"></tbody>
                        </table>
                        <div className="invoice-totals">
                            <div className="invoice-total-row">
                                <span>Subtotal</span>
                                <span id="inv-subtotal">$0.00</span>
                            </div>
                            <div className="invoice-total-row">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="invoice-grand-total">
                                <span>Total Paid</span>
                                <span id="inv-total">$0.00</span>
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
                        <button className="btn-print" id="invoicePrintBtn">
                            <svg viewBox="0 0 24 24">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print
                        </button>
                        <button className="btn-download" id="invoiceDownloadBtn">
                            <svg viewBox="0 0 24 24">
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
