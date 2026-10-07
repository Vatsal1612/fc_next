// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/tax-summary.html → React.
//  * Pixel-perfect mechanical port. Inline <script> ported into one useEffect
//  * wiring behaviour via addEventListener (no hydration mismatch). The shell
//  * provides header/sidebar, so only the original body content is rendered.
//  * XLSX export: the SheetJS lib is loaded via next/script and accessed through a
//  * typed window global inside the export handler.
//  */

// type WorkBook = unknown;
// type WorkSheet = { [k: string]: unknown };

// declare global {
//   interface Window {
//     XLSX?: {
//       utils: {
//         book_new(): WorkBook;
//         aoa_to_sheet(data: unknown[][]): WorkSheet;
//         book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
//       };
//       writeFile(wb: WorkBook, name: string): void;
//     };
//   }
// }

// type Tab = "today" | "weekly" | "monthly" | "yearly" | "datewise";
// type TaxRow = { taxName: string; amount: number };

// export default function TaxSummaryPage() {
//   useEffect(() => {
//     // ── MOCK DATA ──
//     const mockData: {
//       today: TaxRow[];
//       weekly: TaxRow[];
//       monthly: Record<string, TaxRow[]>;
//       yearly: Record<string, TaxRow[]>;
//       datewise: Record<string, TaxRow[]>;
//     } = {
//       today: [
//         { taxName: "IGST", amount: 120.5 },
//         { taxName: "CGST", amount: 80.25 },
//         { taxName: "SGST", amount: 80.25 },
//       ],

//       weekly: [
//         { taxName: "IGST", amount: 950.75 },
//         { taxName: "CGST", amount: 620.4 },
//         { taxName: "SGST", amount: 620.4 },
//       ],

//       monthly: {
//         "5-2026": [
//           { taxName: "IGST", amount: 300.65 },
//           { taxName: "KGST", amount: 300.65 },
//         ],

//         "6-2026": [
//           { taxName: "IGST", amount: 1500.75 },
//           { taxName: "CGST", amount: 950.4 },
//           { taxName: "SGST", amount: 950.4 },
//         ],
//       },

//       yearly: {
//         "2026": [
//           { taxName: "IGST", amount: 4500.65 },
//           { taxName: "CGST", amount: 2800.5 },
//           { taxName: "SGST", amount: 2800.5 },
//         ],

//         "2025": [
//           { taxName: "IGST", amount: 3500.25 },
//           { taxName: "CGST", amount: 2100.15 },
//           { taxName: "SGST", amount: 2100.15 },
//         ],
//       },

//       datewise: {
//         "2026-05-14_2026-06-06": [
//           { taxName: "IGST", amount: 1800.5 },
//           { taxName: "CGST", amount: 1100.25 },
//           { taxName: "SGST", amount: 1100.25 },
//         ],
//       },
//     };
//     const currentData: Record<string, TaxRow[]> = {};

//     const calcTotal = (rows: TaxRow[]): number =>
//       rows.reduce((s, r) => s + r.amount, 0);

//     const renderResults = (
//       tab: string,
//       rows: TaxRow[] | undefined,
//       exportBtnId: string | null
//     ): void => {
//       const container = document.getElementById("results-" + tab);
//       if (!container) return;
//       const exportBtn = exportBtnId
//         ? (document.getElementById(exportBtnId) as HTMLElement | null)
//         : null;
//       currentData[tab] = rows || [];

//       if (!rows || rows.length === 0) {
//         container.innerHTML = `
//                     <div class="total-tax-bar">
//                         <span class="total-tax-label">Total Tax Amount:</span>
//                         <span class="total-tax-amount">Rs. 0.00</span>
//                     </div>
//                     <div class="table-card">
//                         <div class="table-card-header"><span>Tax Summary</span></div>
//                         <div class="table-responsive-box">
//                             <table class="data-table">
//                                 <thead><tr><th>Tax Name</th><th>Total Sales Tax Amount(Rs.)</th></tr></thead>
//                                 <tbody><tr><td colspan="2" class="no-record-cell">No data available</td></tr></tbody>
//                             </table>
//                         </div>
//                         <div class="table-footer"><div class="table-info">Showing 0 to 0 of 0 entries</div></div>
//                     </div>`;
//         if (exportBtn) exportBtn.style.display = "none";
//         return;
//       }

//       if (exportBtn) exportBtn.style.display = "inline-flex";
//       const total = calcTotal(rows);
//       const bodyRows = rows
//         .map(
//           (r) =>
//             `<tr><td>${r.taxName}</td><td>${Number(r.amount).toFixed(
//               2
//             )}</td></tr>`
//         )
//         .join("");

//       container.innerHTML = `
//                 <div class="total-tax-bar">
//                     <span class="total-tax-label">Total Tax Amount:</span>
//                     <span class="total-tax-amount">Rs. ${total.toFixed(2)}</span>
//                 </div>
//                 <div class="results-section">
//                     <div class="table-card">
//                         <div class="table-card-header"><span>Tax Summary</span></div>
//                         <div class="table-responsive-box">
//                             <table class="data-table">
//                                 <thead><tr><th>Tax Name</th><th>Total Sales Tax Amount(Rs.)</th></tr></thead>
//                                 <tbody>${bodyRows}</tbody>
//                             </table>
//                         </div>
//                         <div class="table-footer"><div class="table-info">Showing 1 to ${rows.length} of ${rows.length} entries</div></div>
//                     </div>
//                 </div>`;
//     };

//     const getData = (tab: Tab): void => {
//       if (tab === "today") {
//         renderResults("today", mockData.today, null);
//       } else if (tab === "weekly") {
//         renderResults("weekly", mockData.weekly, null);
//       } else if (tab === "monthly") {
//         const m = (
//           document.getElementById("select-month") as HTMLSelectElement | null
//         )?.value;
//         const y = (
//           document.getElementById(
//             "select-month-year"
//           ) as HTMLSelectElement | null
//         )?.value;
//         const rows = mockData.monthly[m + "-" + y] || [];
//         renderResults("monthly", rows, "btn-export-monthly");
//       } else if (tab === "yearly") {
//         const y = (
//           document.getElementById("select-year") as HTMLSelectElement | null
//         )?.value;
//         const rows = (y ? mockData.yearly[y] : undefined) || [];
//         renderResults("yearly", rows, "btn-export-yearly");
//       } else if (tab === "datewise") {
//         const from = (
//           document.getElementById("input-from-date") as HTMLInputElement | null
//         )?.value;
//         const to = (
//           document.getElementById("input-to-date") as HTMLInputElement | null
//         )?.value;
//         const key = from + "_" + to;
//         const rows = mockData.datewise[key] || [];
//         renderResults("datewise", rows, "btn-export-datewise");
//       }
//     };

//     const exportToExcel = (tab: Tab): void => {
//       const rows = currentData[tab];
//       if (!rows || rows.length === 0) {
//         alert("No records to export.");
//         return;
//       }
//       const XLSX = window.XLSX;
//       if (!XLSX) return;
//       const total = calcTotal(rows);
//       const headers = ["Tax Name", "Total Sales Tax Amount (Rs.)"];
//       const wsData: unknown[][] = [
//         ["Tax Summary Report"],
//         [],
//         headers,
//         ...rows.map((r) => [r.taxName, parseFloat(Number(r.amount).toFixed(2))]),
//         [],
//         ["Total", parseFloat(total.toFixed(2))],
//       ];
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       (ws as { [k: string]: unknown })["!cols"] = [{ wch: 22 }, { wch: 30 }];
//       (ws as { [k: string]: unknown })["!merges"] = [
//         { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
//       ];
//       XLSX.utils.book_append_sheet(wb, ws, "Tax Summary");
//       XLSX.writeFile(wb, "tax_summary_" + tab + ".xlsx");
//     };

//     const switchTab = (tab: Tab): void => {
//       document
//         .querySelectorAll(".tab-btn")
//         .forEach((b) => b.classList.remove("active"));
//       document
//         .querySelectorAll(".tab-panel")
//         .forEach((p) => p.classList.remove("active"));
//       document.getElementById("tab-" + tab)?.classList.add("active");
//       document.getElementById("panel-" + tab)?.classList.add("active");
//     };

//     // ── Tab buttons (formerly inline onclick=switchTab) ──
//     const tabOrder: Tab[] = ["today", "weekly", "monthly", "yearly", "datewise"];
//     const tabHandlers = tabOrder.map((tab) => {
//       const btn = document.getElementById("tab-" + tab);
//       const handler = (): void => switchTab(tab);
//       btn?.addEventListener("click", handler);
//       return { btn, handler };
//     });

//     // ── GET DATA / APPLY buttons (formerly inline onclick=getData) ──
//     // Wire via the .btn-action buttons that are NOT export buttons (export are id'd).
//     const getDataBindings: { tab: Tab; btn: HTMLButtonElement | null }[] = [];
//     document
//       .querySelectorAll<HTMLButtonElement>("#panel-monthly .btn-action")
//       .forEach((b) => {
//         if (!b.id) getDataBindings.push({ tab: "monthly", btn: b });
//       });
//     document
//       .querySelectorAll<HTMLButtonElement>("#panel-yearly .btn-action")
//       .forEach((b) => {
//         if (!b.id) getDataBindings.push({ tab: "yearly", btn: b });
//       });
//     document
//       .querySelectorAll<HTMLButtonElement>("#panel-datewise .btn-action")
//       .forEach((b) => {
//         if (!b.id) getDataBindings.push({ tab: "datewise", btn: b });
//       });
//     const getDataHandlers = getDataBindings.map(({ tab, btn }) => {
//       const handler = (): void => getData(tab);
//       btn?.addEventListener("click", handler);
//       return { btn, handler };
//     });

//     // ── Export buttons (formerly inline onclick=exportToExcel) ──
//     const exportBindings: { tab: Tab; id: string }[] = [
//       { tab: "monthly", id: "btn-export-monthly" },
//       { tab: "yearly", id: "btn-export-yearly" },
//       { tab: "datewise", id: "btn-export-datewise" },
//     ];
//     const exportHandlers = exportBindings.map(({ tab, id }) => {
//       const btn = document.getElementById(id);
//       const handler = (): void => exportToExcel(tab);
//       btn?.addEventListener("click", handler);
//       return { btn, handler };
//     });

//     // ── Dropdown — close on document click ──
//     const closeDropdowns = (): void => {
//       document
//         .querySelectorAll(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     window.addEventListener("click", closeDropdowns);

//     // ── Help button ──
//     const helpBtnCard = document.getElementById("helpBtnCard");
//     const onHelp = (): void => alert("Help & Support - Tax Summary");
//     helpBtnCard?.addEventListener("click", onHelp);

//     // ── Step nav ──
//     let currentStep = 19;
//     const totalSteps = 25;
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const onPrev = (): void => {
//       if (currentStep > 1) {
//         currentStep--;
//         const sv = document.getElementById("stepValue");
//         if (sv) sv.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     const onNext = (): void => {
//       if (currentStep < totalSteps) {
//         currentStep++;
//         const sv = document.getElementById("stepValue");
//         if (sv) sv.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     // ── Init (formerly DOMContentLoaded) ──
//     const currentYear = 2026;
//     ["select-month-year", "select-year"].forEach((id) => {
//       const el = document.getElementById(id) as HTMLSelectElement | null;
//       if (!el) return;
//       for (let y = currentYear; y >= 2017; y--) {
//         const opt = document.createElement("option");
//         opt.value = String(y);
//         opt.textContent = String(y);
//         if (y === currentYear) opt.selected = true;
//         el.appendChild(opt);
//       }
//     });
//     const selMonth = document.getElementById(
//       "select-month"
//     ) as HTMLSelectElement | null;
//     if (selMonth) selMonth.value = String(new Date().getMonth() + 1);
//     // Set date wise defaults
//     const today = new Date();
//     const monthAgo = new Date();
//     monthAgo.setDate(monthAgo.getDate() - 23);
//     const inputTo = document.getElementById(
//       "input-to-date"
//     ) as HTMLInputElement | null;
//     if (inputTo) inputTo.value = today.toISOString().split("T")[0];
//     const inputFrom = document.getElementById(
//       "input-from-date"
//     ) as HTMLInputElement | null;
//     if (inputFrom) inputFrom.value = "2026-05-14";

//     // Auto-load today and weekly
//     getData("today");
//     getData("weekly");

//     return () => {
//       tabHandlers.forEach(({ btn, handler }) =>
//         btn?.removeEventListener("click", handler)
//       );
//       getDataHandlers.forEach(({ btn, handler }) =>
//         btn?.removeEventListener("click", handler)
//       );
//       exportHandlers.forEach(({ btn, handler }) =>
//         btn?.removeEventListener("click", handler)
//       );
//       window.removeEventListener("click", closeDropdowns);
//       helpBtnCard?.removeEventListener("click", onHelp);
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-tax-summary">
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       <div className="layout">
//         {/* OUTER SIDEBAR */}

//         {/* INNER SIDEBAR */}

//         {/* MAIN CONTENT */}
//         <div className="main">
//           <div className="content-area">
//             <div className="card">
//               <div className="card-actions">
//                 <button className="btn-help-new" id="helpBtnCard">
//                   <svg viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10"></circle>
//                     <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
//                     <line x1="12" y1="17" x2="12.01" y2="17"></line>
//                   </svg>
//                   HELP
//                 </button>
//                 {/* <button class="btn-help-new" id="helpBtnCard"><i class="far fa-question-circle"></i> HELP</button> */}
//               </div>
//               <div className="typ-page-heading card-title">Total Sales Tax Summary Reports</div>
//               <div className="card-sub">
//                 View tax breakdown across different time periods
//               </div>

//               {/* TABS */}
//               <div className="tab-row">
//                 <button className="tab-btn active" id="tab-today">
//                   Today
//                 </button>
//                 <button className="tab-btn" id="tab-weekly">
//                   Weekly
//                 </button>
//                 <button className="tab-btn" id="tab-monthly">
//                   Monthly
//                 </button>
//                 <button className="tab-btn" id="tab-yearly">
//                   Yearly
//                 </button>
//                 <button className="tab-btn" id="tab-datewise">
//                   Date Wise
//                 </button>
//               </div>

//               {/* TODAY */}
//               <div className="tab-panel active" id="panel-today">
//                 <div id="results-today"></div>
//               </div>

//               {/* WEEKLY */}
//               <div className="tab-panel" id="panel-weekly">
//                 <div id="results-weekly"></div>
//               </div>

//               {/* MONTHLY */}
//               <div className="tab-panel" id="panel-monthly">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Select Month :</label>
//                     <select className="filter-select" id="select-month">
//                       <option value="1">January</option>
//                       <option value="2">February</option>
//                       <option value="3">March</option>
//                       <option value="4">April</option>
//                       <option value="5">May</option>
//                       <option value="6">June</option>
//                       <option value="7">July</option>
//                       <option value="8">August</option>
//                       <option value="9">September</option>
//                       <option value="10">October</option>
//                       <option value="11">November</option>
//                       <option value="12">December</option>
//                     </select>
//                   </div>
//                   <div className="filter-group">
//                     <label className="filter-label">Select Year :</label>
//                     <select
//                       className="filter-select"
//                       id="select-month-year"
//                     ></select>
//                   </div>
//                   <button className="btn-action">GET DATA</button>
//                   <button
//                     className="btn-action"
//                     id="btn-export-monthly"
//                     style={{ display: "none" }}
//                   >
//                     <svg viewBox="0 0 24 24">
//                       <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
//                       <polyline points="7 10 12 15 17 10"></polyline>
//                       <line x1="12" y1="15" x2="12" y2="3"></line>
//                     </svg>
//                     EXPORT TO EXCEL
//                   </button>
//                 </div>
//                 <div id="results-monthly"></div>
//               </div>

//               {/* YEARLY */}
//               <div className="tab-panel" id="panel-yearly">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Select Year :</label>
//                     <select className="filter-select" id="select-year"></select>
//                   </div>
//                   <button className="btn-action">GET DATA</button>
//                   <button
//                     className="btn-action"
//                     id="btn-export-yearly"
//                     style={{ display: "none" }}
//                   >
//                     <svg viewBox="0 0 24 24">
//                       <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
//                       <polyline points="7 10 12 15 17 10"></polyline>
//                       <line x1="12" y1="15" x2="12" y2="3"></line>
//                     </svg>
//                     EXPORT TO EXCEL
//                   </button>
//                 </div>
//                 <div id="results-yearly"></div>
//               </div>

//               {/* DATE WISE */}
//               <div className="tab-panel" id="panel-datewise">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">From Date:</label>
//                     <input
//                       type="date"
//                       className="filter-input"
//                       id="input-from-date"
//                     />
//                   </div>
//                   <div className="filter-group">
//                     <label className="filter-label">To Date:</label>
//                     <input
//                       type="date"
//                       className="filter-input"
//                       id="input-to-date"
//                     />
//                   </div>
//                   <button className="btn-action">APPLY</button>
//                   <button
//                     className="btn-action"
//                     id="btn-export-datewise"
//                     style={{ display: "none" }}
//                   >
//                     <svg viewBox="0 0 24 24">
//                       <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
//                       <polyline points="7 10 12 15 17 10"></polyline>
//                       <line x1="12" y1="15" x2="12" y2="3"></line>
//                     </svg>
//                     EXPORT TO EXCEL
//                   </button>
//                 </div>
//                 <div id="results-datewise"></div>
//               </div>
//             </div>

//             {/* STEP FOOTER */}
//             <div className="step-footer">
//               <button className="btn-prev" id="prevBtn">
//                 <i className="fas fa-chevron-left"></i> PREVIOUS
//               </button>
//               <div className="step-indicator">
//                 <span className="step-label">STEP</span>
//                 <span className="step-value" id="stepValue">
//                   19/25
//                 </span>
//               </div>
//               <button className="btn-next" id="nextBtn">
//                 NEXT <i className="fas fa-chevron-right"></i>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService, TaxSummaryItem } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

type Tab = "today" | "weekly" | "monthly" | "yearly" | "datewise";
type TaxRow = { taxName: string; amount: number };

export default function TaxSummaryPage() {
    const shopId = useShopId();
    const [activeTab, setActiveTab] = useState<Tab>("today");
    const [data, setData] = useState<TaxRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [serverTotalRecords, setServerTotalRecords] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(1);

    const lastFetched = useRef<{ tab: string; shopId: number | null; page: number }>({ tab: "", shopId: null, page: 0 });

    // Fetch data on initial mount or when user clicks GET DATA / APPLY
    useEffect(() => {
        if (!shopId) return;
        if (lastFetched.current.tab === activeTab && lastFetched.current.shopId === shopId && lastFetched.current.page === pageNumber) return;
        
        if (activeTab === "today" || activeTab === "weekly") {
            lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
            fetchData(activeTab);
        }
    }, [shopId, activeTab, pageNumber]);

    // Format tax data from API
    const formatTaxData = (items: TaxSummaryItem[]): TaxRow[] => {
        if (!items || items.length === 0) return [];

        return items.map((item) => ({
            taxName: item.taxName || item.tax_name || item.name || item.TaxName || item.tax_type || item.TaxType || "Unknown Tax",
            amount: typeof item.amount === 'number' ? item.amount : typeof item.total_amount === 'number' ? item.total_amount : typeof item.totalAmount === 'number' ? item.totalAmount : typeof item.Amount === 'number' ? item.Amount : typeof item.TotalAmount === 'number' ? item.TotalAmount : parseFloat(String(item.amount || item.total_amount || item.totalAmount || item.Amount || item.TotalAmount || 0)),
        }));
    };

    // Calculate total
    const calculateTotal = (rows: TaxRow[]): number => {
        return rows.reduce((sum, r) => sum + r.amount, 0);
    };

    // Fetch data based on tab
    const fetchData = async (tab: Tab) => {
        if (!shopId) return;

        setLoading(true);
        setData([]);
        setTotal(0);

        try {
            if (tab === "today") {
                const res = await reportsService.getTaxSummaryToday(shopId, pageNumber, pageSize);
                const formattedData = formatTaxData(res.items);
                setData(formattedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                setTotal(calculateTotal(formattedData));
            } else if (tab === "weekly") {
                const res = await reportsService.getTaxSummaryWeekly(shopId, pageNumber, pageSize);
                const formattedData = formatTaxData(res.items);
                setData(formattedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                setTotal(calculateTotal(formattedData));
            } else if (tab === "monthly") {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const monthVal = (document.getElementById("select-month") as HTMLSelectElement)?.value || String(currentMonth);
                const yearVal = (document.getElementById("select-month-year") as HTMLSelectElement)?.value || String(currentYear);
                const res = await reportsService.getTaxSummaryMonthly(shopId, monthVal, yearVal, pageNumber, pageSize);
                const formattedData = formatTaxData(res.items);
                setData(formattedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                setTotal(calculateTotal(formattedData));
            } else if (tab === "yearly") {
                const currentYear = new Date().getFullYear();
                const yearVal = (document.getElementById("select-year") as HTMLSelectElement)?.value || String(currentYear);
                const res = await reportsService.getTaxSummaryYearly(shopId, yearVal, pageNumber, pageSize);
                const formattedData = formatTaxData(res.items);
                setData(formattedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                setTotal(calculateTotal(formattedData));
            } else if (tab === "datewise") {
                const today = new Date().toISOString().split("T")[0];
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const fromDate = (document.getElementById("input-from-date") as HTMLInputElement)?.value || thirtyDaysAgo.toISOString().split("T")[0];
                const toDate = (document.getElementById("input-to-date") as HTMLInputElement)?.value || today;
                const res = await reportsService.getTaxSummaryDateWise(shopId, fromDate, toDate, pageNumber, pageSize);
                const formattedData = formatTaxData(res.items);
                setData(formattedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                setTotal(calculateTotal(formattedData));
            }
        } catch (err) {
            console.error(`Error fetching ${tab} tax data:`, err);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!data || data.length === 0) {
            alert("No records to export.");
            return;
        }

        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("Excel library not loaded yet.");
            return;
        }

        const headers = ["Tax Name", "Total Sales Tax Amount (Rs.)"];
        const wsData: any[][] = [
            ["Tax Summary Report"],
            [],
            headers,
            ...data.map((r) => [r.taxName, parseFloat(r.amount.toFixed(2))]),
            [],
            ["Total", parseFloat(total.toFixed(2))],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!cols"] = [{ wch: 22 }, { wch: 30 }];
        ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
        XLSX.utils.book_append_sheet(wb, ws, "Tax Summary");
        XLSX.writeFile(wb, `tax_summary_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Render results
    const renderResults = () => {
        if (loading) {
            return (
                <div className="table-card">
                    <div className="table-card-header"><span>Tax Summary</span></div>
                    <div className="table-responsive-box">
                        <table className="data-table">
                            <thead><tr><th>Tax Name</th><th>Total Sales Tax Amount(Rs.)</th></tr></thead>
                            <tbody><tr><td colSpan={2} className="no-record-cell">Loading...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <>
                    <div className="total-tax-bar">
                        <span className="total-tax-label">Total Tax Amount:</span>
                        <span className="total-tax-amount">Rs. 0.00</span>
                    </div>
                    <div className="table-card">
                        <div className="table-card-header"><span>Tax Summary</span></div>
                        <div className="table-responsive-box">
                            <table className="data-table">
                                <thead><tr><th>Tax Name</th><th>Total Sales Tax Amount(Rs.)</th></tr></thead>
                                <tbody><tr><td colSpan={2} className="no-record-cell">No data available</td></tr></tbody>
                            </table>
                        </div>
                        <div className="table-footer"><div className="table-info">Showing 0 to 0 of 0 entries</div></div>
                    </div>
                </>
            );
        }

        const isServerPaginated = true;
        const totalRecords = isServerPaginated ? serverTotalRecords : data.length;
        const totalPages = isServerPaginated ? serverTotalPages : Math.max(1, Math.ceil(totalRecords / pageSize));
        const startIndex = (pageNumber - 1) * pageSize;
        const paginatedData = isServerPaginated ? data : data.slice(startIndex, startIndex + pageSize);
        const endIndex = isServerPaginated ? Math.min(pageNumber * pageSize, totalRecords) : Math.min(startIndex + pageSize, totalRecords);

        return (
            <>
                <div className="total-tax-bar">
                    <span className="total-tax-label">Total Tax Amount:</span>
                    <span className="total-tax-amount">Rs. {total.toFixed(2)}</span>
                </div>
                <div className="table-card">
                    <div className="table-card-header"><span>Tax Summary</span></div>
                    <div className="table-responsive-box">
                        <table className="data-table">
                            <thead><tr><th>Tax Name</th><th>Total Sales Tax Amount(Rs.)</th></tr></thead>
                            <tbody>
                                {paginatedData.map((r, index) => (
                                    <tr key={index}>
                                        <td>{r.taxName}</td>
                                        <td>{r.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>entries</span>
                        </div>
                        <div className="table-info">
                            Showing {startIndex + 1} to {endIndex} of {totalRecords} entries
                        </div>
                        <ReportPagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={(page) => setPageNumber(page)}
                        />
                    </div>
                </div>
            </>
        );
    };

    // Switch tab
    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        setPageNumber(1);
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
        document.getElementById(`tab-${tab}`)?.classList.add("active");
        document.getElementById(`panel-${tab}`)?.classList.add("active");
    };

    // Populate year dropdowns
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        ["select-month-year", "select-year"].forEach((id) => {
            const el = document.getElementById(id) as HTMLSelectElement | null;
            if (!el) return;
            el.innerHTML = "";
            for (let y = currentYear; y >= currentYear - 9; y--) {
                const opt = document.createElement("option");
                opt.value = String(y);
                opt.textContent = String(y);
                if (y === currentYear) opt.selected = true;
                el.appendChild(opt);
            }
        });

        // Set current month
        const selMonth = document.getElementById("select-month") as HTMLSelectElement | null;
        if (selMonth) selMonth.value = String(new Date().getMonth() + 1);

        // Set date wise defaults
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const inputTo = document.getElementById("input-to-date") as HTMLInputElement | null;
        if (inputTo) inputTo.value = today.toISOString().split("T")[0];
        const inputFrom = document.getElementById("input-from-date") as HTMLInputElement | null;
        if (inputFrom) inputFrom.value = monthAgo.toISOString().split("T")[0];
    }, []);

    // Wire up event listeners
    useEffect(() => {
        // Tab buttons
        const tabOrder: Tab[] = ["today", "weekly", "monthly", "yearly", "datewise"];
        const tabHandlers = tabOrder.map((tab) => {
            const btn = document.getElementById(`tab-${tab}`);
            const handler = () => switchTab(tab);
            btn?.addEventListener("click", handler);
            return { btn, handler };
        });

        // Get data buttons for monthly, yearly, datewise
        const getDataButtons = document.querySelectorAll("#panel-monthly .btn-action, #panel-yearly .btn-action, #panel-datewise .btn-action");
        const getDataHandlers: Array<{ btn: Element; handler: () => void }> = [];
        getDataButtons.forEach((btn) => {
            const handler = () => {
                // Determine which tab this button belongs to
                const panel = btn.closest(".tab-panel");
                const tab = panel?.id.replace("panel-", "") as Tab;
                if (tab) {
                    setPageNumber(1);
                    fetchData(tab);
                }
            };
            btn.addEventListener("click", handler);
            getDataHandlers.push({ btn, handler });
        });

        // Export buttons
        const exportHandlers: Array<{ btn: HTMLElement | null; handler: () => void }> = [];
        ["btn-export-monthly", "btn-export-yearly", "btn-export-datewise"].forEach((id) => {
            const btn = document.getElementById(id);
            const handler = exportToExcel;
            btn?.addEventListener("click", handler);
            exportHandlers.push({ btn, handler });
        });

        // Help button
        const helpBtnCard = document.getElementById("helpBtnCard");
        const onHelp = () => alert("Help & Support - Tax Summary");
        helpBtnCard?.addEventListener("click", onHelp);

        // Step nav
        let currentStep = 19;
        const totalSteps = 25;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const stepValue = document.getElementById("stepValue");

        const onPrev = () => {
            if (currentStep > 1) {
                currentStep--;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        const onNext = () => {
            if (currentStep < totalSteps) {
                currentStep++;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        prevBtn?.addEventListener("click", onPrev);
        nextBtn?.addEventListener("click", onNext);

        // Close dropdowns
        const closeDropdowns = () => {
            document.querySelectorAll(".dropdown-menu").forEach((m) => m.classList.remove("show"));
        };
        window.addEventListener("click", closeDropdowns);

        return () => {
            tabHandlers.forEach(({ btn, handler }) => btn?.removeEventListener("click", handler));
            getDataHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
            exportHandlers.forEach(({ btn, handler }) => btn?.removeEventListener("click", handler));
            helpBtnCard?.removeEventListener("click", onHelp);
            prevBtn?.removeEventListener("click", onPrev);
            nextBtn?.removeEventListener("click", onNext);
            window.removeEventListener("click", closeDropdowns);
        };
    }, [data, total]);

    return (
        <div id="pg-reports-tax-summary">
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
                strategy="afterInteractive"
            />

            <div className="layout">
                <div className="main">
                    <div className="content-area">
                        <div className="card">
                            <div className="card-actions">
                                <button className="btn-help-new" id="helpBtnCard">
                                    <svg viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    HELP
                                </button>
                            </div>
                            <div className="card-title">Total Sales Tax Summary Reports</div>
                            <div className="card-sub">
                                View tax breakdown across different time periods
                            </div>

                            {/* TABS */}
                            <div className="tab-row" style={{ display: "flex", alignItems: "center" }}>
                                <button className="tab-btn active" id="tab-today">Today</button>
                                <button className="tab-btn" id="tab-weekly">Weekly</button>
                                <button className="tab-btn" id="tab-monthly">Monthly</button>
                                <button className="tab-btn" id="tab-yearly">Yearly</button>
                                <button className="tab-btn" id="tab-datewise">Date Wise</button>
                                {activeTab !== "today" && activeTab !== "weekly" && (
                                    <button className="btn-action" onClick={() => fetchData(activeTab)} style={{ marginLeft: "auto" }}>GET DATA</button>
                                )}
                            </div>

                            {/* TODAY */}
                            <div className="tab-panel active" id="panel-today">
                                <div id="results-today">{renderResults()}</div>
                            </div>

                            {/* WEEKLY */}
                            <div className="tab-panel" id="panel-weekly">
                                <div id="results-weekly">{renderResults()}</div>
                            </div>

                            {/* MONTHLY */}
                            <div className="tab-panel" id="panel-monthly">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label className="filter-label">Select Month :</label>
                                        <select className="filter-select" id="select-month">
                                            <option value="1">January</option>
                                            <option value="2">February</option>
                                            <option value="3">March</option>
                                            <option value="4">April</option>
                                            <option value="5">May</option>
                                            <option value="6">June</option>
                                            <option value="7">July</option>
                                            <option value="8">August</option>
                                            <option value="9">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                    </div>
                                    <div className="filter-group">
                                        <label className="filter-label">Select Year :</label>
                                        <select className="filter-select" id="select-month-year"></select>
                                    </div>
                                    <button className="btn-action">GET DATA</button>
                                    <button className="btn-action" id="btn-export-monthly">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        EXPORT TO EXCEL
                                    </button>
                                </div>
                                <div id="results-monthly">{renderResults()}</div>
                            </div>

                            {/* YEARLY */}
                            <div className="tab-panel" id="panel-yearly">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label className="filter-label">Select Year :</label>
                                        <select className="filter-select" id="select-year"></select>
                                    </div>
                                    <button className="btn-action">GET DATA</button>
                                    <button className="btn-action" id="btn-export-yearly">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        EXPORT TO EXCEL
                                    </button>
                                </div>
                                <div id="results-yearly">{renderResults()}</div>
                            </div>

                            {/* DATE WISE */}
                            <div className="tab-panel" id="panel-datewise">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label className="filter-label">From Date:</label>
                                        <input type="date" className="filter-input" id="input-from-date" />
                                    </div>
                                    <div className="filter-group">
                                        <label className="filter-label">To Date:</label>
                                        <input type="date" className="filter-input" id="input-to-date" />
                                    </div>
                                    <button className="btn-action">APPLY</button>
                                    <button className="btn-action" id="btn-export-datewise">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        EXPORT TO EXCEL
                                    </button>
                                </div>
                                <div id="results-datewise">{renderResults()}</div>
                            </div>
                        </div>

                        {/* STEP FOOTER */}
                        <div className="step-footer">
                            <button className="btn-prev" id="prevBtn">
                                <i className="fas fa-chevron-left"></i> PREVIOUS
                            </button>
                            <div className="step-indicator">
                                <span className="step-label">STEP</span>
                                <span className="step-value" id="stepValue">19/25</span>
                            </div>
                            <button className="btn-next" id="nextBtn">
                                NEXT <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}