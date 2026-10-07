// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/ingredients-reports.html → React.
//  * Pixel-perfect mechanical port. Inline <script> ported into one useEffect
//  * wiring behaviour via addEventListener / event delegation (no hydration
//  * mismatch). The shell provides header/sidebar, so only the original body
//  * content is rendered. XLSX export uses SheetJS loaded via next/script and
//  * accessed through a typed window global.
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

// type Tab = "today" | "thisweek" | "monthwise" | "yearwise" | "custom";

// type MockRow = {
//   date: string;
//   orderId: number;
//   status: string;
//   customer: string;
//   mobile: string;
//   payment: string;
//   type: string;
//   amount: number;
//   tax: number;
//   charges: number;
//   discount: number;
// };

// export default function IngredientsReportsPage() {
//   useEffect(() => {
//     // ── MOCK DATA ──
//     const mockRows: MockRow[] = [
//       { date: "01-05-2026 09:10:22", orderId: 10234501, status: "Completed", customer: "Ram", mobile: "9737215041", payment: "Online", type: "Delivery", amount: 310.0, tax: 27.9, charges: 10.0, discount: 0.0 },
//       { date: "01-05-2026 10:45:11", orderId: 10234502, status: "Completed", customer: "Rahul Verma", mobile: "9876543210", payment: "Online", type: "Delivery", amount: 750.0, tax: 67.5, charges: 10.0, discount: 50.0 },
//       { date: "02-05-2026 11:20:33", orderId: 10234503, status: "Completed", customer: "Priya Singh", mobile: "9123456789", payment: "Cash", type: "Dine In", amount: 420.0, tax: 37.8, charges: 0.0, discount: 20.0 },
//       { date: "02-05-2026 13:05:44", orderId: 10234504, status: "Completed", customer: "Amit Kumar", mobile: "9988776655", payment: "Online", type: "Takeaway", amount: 890.0, tax: 80.1, charges: 10.0, discount: 0.0 },
//       { date: "03-05-2026 09:30:00", orderId: 10234505, status: "Completed", customer: "Sneha Patel", mobile: "9012345678", payment: "Card", type: "Dine In", amount: 600.0, tax: 54.0, charges: 0.0, discount: 30.0 },
//       { date: "03-05-2026 14:15:22", orderId: 10234506, status: "Completed", customer: "Ram", mobile: "9737215041", payment: "Online", type: "Delivery", amount: 510.0, tax: 45.9, charges: 10.0, discount: 0.0 },
//       { date: "04-05-2026 10:00:00", orderId: 10234507, status: "Completed", customer: "Vikram Nair", mobile: "9871234560", payment: "Online", type: "Delivery", amount: 230.0, tax: 20.7, charges: 10.0, discount: 0.0 },
//       { date: "04-05-2026 12:40:55", orderId: 10234508, status: "Completed", customer: "Riya Mehta", mobile: "9654321098", payment: "Cash", type: "Takeaway", amount: 780.0, tax: 70.2, charges: 0.0, discount: 0.0 },
//       { date: "05-05-2026 09:55:10", orderId: 10234509, status: "Completed", customer: "Karan Bose", mobile: "9345678901", payment: "Online", type: "Delivery", amount: 460.0, tax: 41.4, charges: 10.0, discount: 25.0 },
//       { date: "05-05-2026 16:20:33", orderId: 10234510, status: "Completed", customer: "Deepa Rao", mobile: "9234567890", payment: "Card", type: "Dine In", amount: 920.0, tax: 82.8, charges: 0.0, discount: 0.0 },
//       { date: "06-05-2026 08:45:00", orderId: 10234511, status: "Completed", customer: "Ram", mobile: "9737215041", payment: "Online", type: "Delivery", amount: 310.0, tax: 27.9, charges: 10.0, discount: 0.0 },
//       { date: "06-05-2026 11:30:15", orderId: 10234512, status: "Completed", customer: "Mohan Das", mobile: "9098765432", payment: "Cash", type: "Takeaway", amount: 340.0, tax: 30.6, charges: 0.0, discount: 0.0 },
//       { date: "07-05-2026 10:10:00", orderId: 10234513, status: "Completed", customer: "Pooja Verma", mobile: "9187654321", payment: "Online", type: "Delivery", amount: 670.0, tax: 60.3, charges: 10.0, discount: 40.0 },
//       { date: "07-05-2026 14:50:22", orderId: 10234514, status: "Completed", customer: "Suresh Pillai", mobile: "9567890123", payment: "Card", type: "Dine In", amount: 850.0, tax: 76.5, charges: 0.0, discount: 0.0 },
//       { date: "08-05-2026 09:00:00", orderId: 10234515, status: "Completed", customer: "Anita Joshi", mobile: "9456789012", payment: "Online", type: "Delivery", amount: 490.0, tax: 44.1, charges: 10.0, discount: 0.0 },
//       { date: "08-05-2026 13:25:44", orderId: 10234516, status: "Completed", customer: "asd asd", mobile: "9874563210", payment: "Online", type: "Delivery", amount: 1480.0, tax: 133.2, charges: 10.0, discount: 0.0 },
//       { date: "09-05-2026 10:30:00", orderId: 10234517, status: "Completed", customer: "Ram", mobile: "9737215041", payment: "Online", type: "Delivery", amount: 510.0, tax: 45.9, charges: 10.0, discount: 0.0 },
//       { date: "09-05-2026 15:00:11", orderId: 10234518, status: "Completed", customer: "Meena Iyer", mobile: "9321654987", payment: "Cash", type: "Takeaway", amount: 390.0, tax: 35.1, charges: 0.0, discount: 15.0 },
//       { date: "10-05-2026 11:05:33", orderId: 10234519, status: "Completed", customer: "Sanjay Gupta", mobile: "9432165870", payment: "Card", type: "Dine In", amount: 720.0, tax: 64.8, charges: 0.0, discount: 0.0 },
//       { date: "10-05-2026 16:40:00", orderId: 10234520, status: "Completed", customer: "Ram", mobile: "9737215041", payment: "Online", type: "Delivery", amount: 310.0, tax: 27.9, charges: 10.0, discount: 0.0 },
//     ];

//     const mockData = {
//       today: mockRows,
//       thisweek: mockRows,
//       monthwise: { "June-2026": mockRows } as Record<string, MockRow[]>,
//       yearwise: { "2026": mockRows } as Record<string, MockRow[]>,
//       custom: {
//         "2026-04-01T15:38_2026-06-08T15:38": mockRows,
//       } as Record<string, MockRow[]>,
//     };

//     const currentData: Record<string, MockRow[]> = {};
//     const PAGE_SIZE = 10;
//     const currentPage: Record<Tab, number> = {
//       today: 1,
//       thisweek: 1,
//       monthwise: 1,
//       yearwise: 1,
//       custom: 1,
//     };

//     const COLS = [
//       { key: "date", label: "Date" },
//       { key: "orderId", label: "OrderID" },
//       { key: "status", label: "Status" },
//       { key: "customer", label: "Customer" },
//       { key: "mobile", label: "Mobile" },
//       { key: "payment", label: "Payment" },
//       { key: "type", label: "Type" },
//       { key: "amount", label: "Amount" },
//       { key: "tax", label: "Tax" },
//       { key: "charges", label: "Charges" },
//       { key: "discount", label: "Discount" },
//     ];

//     const buildTableHTML = (rows: MockRow[], tab: Tab): string => {
//       const page = currentPage[tab];
//       const total = rows.length;
//       const totalPages = Math.ceil(total / PAGE_SIZE);
//       const start = (page - 1) * PAGE_SIZE;
//       const pageRows = rows.slice(start, start + PAGE_SIZE);

//       const headerCells = COLS.map((c) => `<th>${c.label}</th>`).join("");

//       let bodyRows: string;
//       if (total === 0) {
//         bodyRows = `<tr><td colspan="${COLS.length}" class="no-record-cell">No Record Found</td></tr>`;
//       } else {
//         bodyRows = pageRows
//           .map(
//             (r) =>
//               `<tr>
//                 <td>${r.date}</td><td>${r.orderId}</td><td>${r.status}</td>
//                 <td>${r.customer}</td><td>${r.mobile}</td><td>${r.payment}</td>
//                 <td>${r.type}</td><td>${Number(r.amount).toFixed(2)}</td>
//                 <td>${Number(r.tax).toFixed(2)}</td><td>${Number(r.charges).toFixed(2)}</td>
//                 <td>${Number(r.discount).toFixed(2)}</td>
//             </tr>`
//           )
//           .join("");
//       }

//       let footerHTML: string;
//       if (totalPages > 1) {
//         const pageBtns = Array.from({ length: totalPages }, (_, i) => i + 1)
//           .map(
//             (p) =>
//               `<button class="page-btn${p === page ? " active" : ""}" data-action="goToPage" data-tab="${tab}" data-page="${p}">${p}</button>`
//           )
//           .join("");
//         footerHTML = `<div class="table-footer"><div class="table-info">Showing ${start + 1} to ${Math.min(start + PAGE_SIZE, total)} of ${total} entries</div><div class="pagination">${pageBtns}</div></div>`;
//       } else {
//         footerHTML = `<div class="table-footer"><div class="table-info">Showing ${total > 0 ? 1 : 0} to ${total} of ${total} entries</div></div>`;
//       }

//       const exportBtn = `<button class="btn-action" data-action="exportToExcel" data-tab="${tab}"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>EXPORT TO EXCEL</button>`;

//       return `<div class="results-section"><div class="results-header"><div class="results-title">Description</div>${exportBtn}</div><div class="table-card"><div class="table-card-header"><span>Ingredients Usage</span></div><div class="table-wrap"><table class="data-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>${footerHTML}</div></div>`;
//     };

//     const renderResults = (tab: Tab, rows: MockRow[]): void => {
//       const container = document.getElementById("results-" + tab);
//       currentData[tab] = rows || [];
//       if (container) container.innerHTML = buildTableHTML(currentData[tab], tab);
//     };

//     const goToPage = (tab: Tab, page: number): void => {
//       currentPage[tab] = page;
//       const container = document.getElementById("results-" + tab);
//       if (container) container.innerHTML = buildTableHTML(currentData[tab], tab);
//     };

//     const getData = (tab: Tab): void => {
//       currentPage[tab] = 1;
//       if (tab === "today") {
//         renderResults("today", mockData.today);
//       } else if (tab === "thisweek") {
//         renderResults("thisweek", mockData.thisweek);
//       } else if (tab === "monthwise") {
//         const m = (
//           document.getElementById("select-month") as HTMLSelectElement | null
//         )?.value;
//         const y = (
//           document.getElementById(
//             "select-month-year"
//           ) as HTMLSelectElement | null
//         )?.value;
//         renderResults("monthwise", mockData.monthwise[m + "-" + y] || []);
//       } else if (tab === "yearwise") {
//         const y = (
//           document.getElementById("select-year") as HTMLSelectElement | null
//         )?.value;
//         renderResults("yearwise", mockData.yearwise[y ?? ""] || []);
//       } else if (tab === "custom") {
//         const from = (
//           document.getElementById("input-from") as HTMLInputElement | null
//         )?.value;
//         const to = (
//           document.getElementById("input-to") as HTMLInputElement | null
//         )?.value;
//         renderResults("custom", mockData.custom[from + "_" + to] || []);
//       }
//     };

//     const exportToExcel = (tab: Tab): void => {
//       const rows = currentData[tab];
//       if (!rows || rows.length === 0) {
//         alert("No data to export.");
//         return;
//       }
//       const XLSX = window.XLSX;
//       if (!XLSX) return;
//       const headers = [
//         "Date",
//         "OrderID",
//         "Status",
//         "Customer",
//         "Mobile",
//         "Payment",
//         "Type",
//         "Amount",
//         "Tax",
//         "Charges",
//         "Discount",
//       ];
//       const wsData: unknown[][] = [
//         ["Ingredients Report"],
//         [],
//         headers,
//         ...rows.map((r) => [
//           r.date,
//           r.orderId,
//           r.status,
//           r.customer,
//           r.mobile,
//           r.payment,
//           r.type,
//           parseFloat(Number(r.amount).toFixed(2)),
//           parseFloat(Number(r.tax).toFixed(2)),
//           parseFloat(Number(r.charges).toFixed(2)),
//           parseFloat(Number(r.discount).toFixed(2)),
//         ]),
//       ];
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       (ws as { [k: string]: unknown })["!cols"] = headers.map((_, i) => ({
//         wch: i === 0 || i === 3 ? 22 : 14,
//       }));
//       (ws as { [k: string]: unknown })["!merges"] = [
//         { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
//       ];
//       XLSX.utils.book_append_sheet(wb, ws, "Ingredients");
//       XLSX.writeFile(wb, "ingredients_report_" + tab + ".xlsx");
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
//       getData(tab);
//     };

//     // ── Tab buttons (formerly inline onclick=switchTab) ──
//     const tabOrder: Tab[] = [
//       "today",
//       "thisweek",
//       "monthwise",
//       "yearwise",
//       "custom",
//     ];
//     const tabHandlers = tabOrder.map((tab) => {
//       const el = document.getElementById("tab-" + tab);
//       const handler = (): void => switchTab(tab);
//       el?.addEventListener("click", handler);
//       return { el, handler };
//     });

//     // ── GETDATA buttons (formerly inline onclick=getData) — event delegation ──
//     const getDataTabs: Tab[] = ["monthwise", "yearwise", "custom"];
//     const getDataPanels = getDataTabs.map((tab) => {
//       const panel = document.getElementById("panel-" + tab);
//       const handler = (ev: Event): void => {
//         const target = ev.target as HTMLElement | null;
//         const btn = target?.closest<HTMLButtonElement>(".btn-action");
//         // only the static GETDATA button lives directly in the filter-row
//         if (btn && btn.closest(".filter-row")) getData(tab);
//       };
//       panel?.addEventListener("click", handler);
//       return { panel, handler };
//     });

//     // ── Pagination + export buttons inside dynamic results — event delegation ──
//     const resultsHandlers = tabOrder.map((tab) => {
//       const container = document.getElementById("results-" + tab);
//       const handler = (ev: Event): void => {
//         const target = ev.target as HTMLElement | null;
//         const actionEl = target?.closest<HTMLElement>("[data-action]");
//         if (!actionEl) return;
//         const action = actionEl.getAttribute("data-action");
//         if (action === "goToPage") {
//           const t = actionEl.getAttribute("data-tab") as Tab;
//           const p = Number(actionEl.getAttribute("data-page"));
//           goToPage(t, p);
//         } else if (action === "exportToExcel") {
//           const t = actionEl.getAttribute("data-tab") as Tab;
//           exportToExcel(t);
//         }
//       };
//       container?.addEventListener("click", handler);
//       return { container, handler };
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
//     const onHelp = (): void =>
//       alert("Help & Support - Ingredients Reports");
//     helpBtnCard?.addEventListener("click", onHelp);

//     // ── Step nav ──
//     let currentStep = 18;
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

//     // ── Init ──
//     const currentYear = 2026;
//     ["select-month-year", "select-year"].forEach((id) => {
//       const el = document.getElementById(id);
//       if (!el) return;
//       for (let y = currentYear; y >= 2017; y--) {
//         const opt = document.createElement("option");
//         opt.value = String(y);
//         opt.textContent = String(y);
//         if (y === currentYear) opt.selected = true;
//         el.appendChild(opt);
//       }
//     });
//     // default month = current
//     const selMonth = document.getElementById(
//       "select-month"
//     ) as HTMLSelectElement | null;
//     if (selMonth) selMonth.value = "June";
//     // default datetime-local
//     const inputFrom = document.getElementById(
//       "input-from"
//     ) as HTMLInputElement | null;
//     const inputTo = document.getElementById(
//       "input-to"
//     ) as HTMLInputElement | null;
//     if (inputFrom) inputFrom.value = "2026-04-01T15:38";
//     if (inputTo) inputTo.value = "2026-06-08T15:38";

//     getData("today");

//     return () => {
//       tabHandlers.forEach(({ el, handler }) =>
//         el?.removeEventListener("click", handler)
//       );
//       getDataPanels.forEach(({ panel, handler }) =>
//         panel?.removeEventListener("click", handler)
//       );
//       resultsHandlers.forEach(({ container, handler }) =>
//         container?.removeEventListener("click", handler)
//       );
//       window.removeEventListener("click", closeDropdowns);
//       helpBtnCard?.removeEventListener("click", onHelp);
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-ingredients-reports">
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       {/* HEADER */}

//       <div className="layout">
//         {/* OUTER SIDEBAR */}

//         {/* INNER SIDEBAR */}

//         {/* MAIN */}
//         <div className="main">
//           <div className="content-area">
//             <div className="card">
//               <div className="card-actions">
//                 {/* <button class="btn-help-new" id="helpBtnCard"><i class="far fa-question-circle"></i> HELP</button> */}
//                 <button className="btn-help-new" id="helpBtnCard">
//                   <svg viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10"></circle>
//                     <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
//                     <line x1="12" y1="17" x2="12.01" y2="17"></line>
//                   </svg>
//                   HELP
//                 </button>
//               </div>
//               <div className="typ-page-heading card-title">Ingredients Reports</div>
//               <div className="card-sub">
//                 View ingredient usage details across different time periods
//               </div>

//               {/* TABS */}
//               <div className="tab-row">
//                 <button className="tab-btn active" id="tab-today">
//                   Today
//                 </button>
//                 <button className="tab-btn" id="tab-thisweek">
//                   This Week
//                 </button>
//                 <button className="tab-btn" id="tab-monthwise">
//                   Month Wise
//                 </button>
//                 <button className="tab-btn" id="tab-yearwise">
//                   Year Wise
//                 </button>
//                 <button className="tab-btn" id="tab-custom">
//                   Custom
//                 </button>
//               </div>

//               {/* TODAY */}
//               <div className="tab-panel active" id="panel-today">
//                 <div id="results-today"></div>
//               </div>

//               {/* THIS WEEK */}
//               <div className="tab-panel" id="panel-thisweek">
//                 <div id="results-thisweek"></div>
//               </div>

//               {/* MONTH WISE */}
//               <div className="tab-panel" id="panel-monthwise">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Select Month :</label>
//                     <select className="filter-select" id="select-month">
//                       <option>January</option>
//                       <option>February</option>
//                       <option>March</option>
//                       <option>April</option>
//                       <option>May</option>
//                       <option>June</option>
//                       <option>July</option>
//                       <option>August</option>
//                       <option>September</option>
//                       <option>October</option>
//                       <option>November</option>
//                       <option>December</option>
//                     </select>
//                   </div>
//                   <div className="filter-group">
//                     <label className="filter-label">Select Year :</label>
//                     <select
//                       className="filter-select"
//                       id="select-month-year"
//                     ></select>
//                   </div>
//                   <button className="btn-action">GETDATA</button>
//                 </div>
//                 <div id="results-monthwise"></div>
//               </div>

//               {/* YEAR WISE */}
//               <div className="tab-panel" id="panel-yearwise">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Select Year :</label>
//                     <select className="filter-select" id="select-year"></select>
//                   </div>
//                   <button className="btn-action">GETDATA</button>
//                 </div>
//                 <div id="results-yearwise"></div>
//               </div>

//               {/* CUSTOM */}
//               <div className="tab-panel" id="panel-custom">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">From</label>
//                     <input
//                       type="datetime-local"
//                       className="filter-input"
//                       id="input-from"
//                     />
//                   </div>
//                   <div className="filter-group">
//                     <label className="filter-label">To</label>
//                     <input
//                       type="datetime-local"
//                       className="filter-input"
//                       id="input-to"
//                     />
//                   </div>
//                   <button className="btn-action">GET DATA</button>
//                 </div>
//                 <div id="results-custom"></div>
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
//                   18/25
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

import { useEffect } from "react";
import Script from "next/script";
import {
  reportsService,
  type IngredientRecord,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import "./page.css";

/**
 * reports/ingredients-reports.html → React.
 *
 * Fixed version: previously this page rendered hardcoded mock rows and never
 * called the API. It now calls reportsService's ingredient endpoints
 * (Today / Week / Month / Year / Custom), mirroring the pattern used in
 * total-sales/page.tsx — fetch on tab switch / GETDATA click, render a
 * loading state while in flight, and fall back to an empty table + message
 * on error. Table columns now match IngredientRecord (item_name,
 * total_quantity, total_amount) instead of the old sales-shaped mock columns.
 */

type WorkBook = unknown;
type WorkSheet = { [k: string]: unknown };

declare global {
  interface Window {
    XLSX?: {
      utils: {
        book_new(): WorkBook;
        aoa_to_sheet(data: unknown[][]): WorkSheet;
        book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
      };
      writeFile(wb: WorkBook, name: string): void;
    };
  }
}

type Tab = "today" | "thisweek" | "monthwise" | "yearwise" | "custom";

export default function IngredientsReportsPage() {
  const shopId = useShopId();

  useEffect(() => {
    const SHOP_ID = shopId || Number(sessionStorage.getItem("shop_id")) || 0;

    const PAGE_SIZE = 10;

    const currentData: Record<Tab, IngredientRecord[]> = {
      today: [],
      thisweek: [],
      monthwise: [],
      yearwise: [],
      custom: [],
    };
    const currentPage: Record<Tab, number> = {
      today: 1,
      thisweek: 1,
      monthwise: 1,
      yearwise: 1,
      custom: 1,
    };
    // Tracks whether a tab has ever been fetched, so month/year/custom show a
    // "select parameters" placeholder instead of an empty table on first view.
    const hasFetched: Record<Tab, boolean> = {
      today: false,
      thisweek: false,
      monthwise: false,
      yearwise: false,
      custom: false,
    };

    const COLS = [
      { key: "item_name", label: "Item Name" },
      { key: "total_quantity", label: "Total Quantity" },
      { key: "total_amount", label: "Total Amount" },
    ];

    const buildTableHTML = (rows: IngredientRecord[], tab: Tab): string => {
      const page = currentPage[tab];
      const total = rows.length;
      const totalPages = Math.ceil(total / PAGE_SIZE);
      const start = (page - 1) * PAGE_SIZE;
      const pageRows = rows.slice(start, start + PAGE_SIZE);

      const headerCells = COLS.map((c) => `<th>${c.label}</th>`).join("");

      let bodyRows: string;
      if (total === 0) {
        bodyRows = `<tr><td colspan="${COLS.length}" class="no-record-cell">No Record Found</td></tr>`;
      } else {
        bodyRows = pageRows
          .map(
            (r) =>
              `<tr>
                <td>${r.item_name}</td>
                <td>${Number(r.total_quantity ?? 0).toFixed(2)}</td>
                <td>${Number(r.total_amount ?? 0).toFixed(2)}</td>
            </tr>`
          )
          .join("");
      }

      let footerHTML: string;
      if (totalPages > 0) {
        let pageBtns = "";
        const prevBtn = `<button class="page-btn" ${page <= 1 ? "disabled" : ""} data-action="goToPage" data-tab="${tab}" data-page="${page - 1}">&laquo; Back</button>`;

        for (let p = 1; p <= totalPages; p++) {
          if (totalPages > 7) {
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              pageBtns += `<button class="page-btn${p === page ? " active" : ""}" data-action="goToPage" data-tab="${tab}" data-page="${p}">${p}</button>`;
            } else if (p === 2 && page > 3) {
              pageBtns += `<span style="padding: 0 4px; color: #666;">...</span>`;
            } else if (p === totalPages - 1 && page < totalPages - 2) {
              pageBtns += `<span style="padding: 0 4px; color: #666;">...</span>`;
            }
          } else {
            pageBtns += `<button class="page-btn${p === page ? " active" : ""}" data-action="goToPage" data-tab="${tab}" data-page="${p}">${p}</button>`;
          }
        }

        const nextBtn = `<button class="page-btn" ${page >= totalPages ? "disabled" : ""} data-action="goToPage" data-tab="${tab}" data-page="${page + 1}">Next &raquo;</button>`;

        footerHTML = `<div class="table-footer"><div class="table-info">Showing ${total > 0 ? start + 1 : 0} to ${Math.min(start + PAGE_SIZE, total)} of ${total} entries</div><div class="pagination">${prevBtn}${pageBtns}${nextBtn}</div></div>`;
      } else {
        footerHTML = `<div class="table-footer"><div class="table-info">Showing 0 to 0 of 0 entries</div></div>`;
      }

      const exportBtn = `<button class="btn-action" data-action="exportToExcel" data-tab="${tab}"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>EXPORT TO EXCEL</button>`;

      return `<div class="results-section"><div class="results-header"><div class="results-title">Description</div>${exportBtn}</div><div class="table-card"><div class="table-wrap"><table class="data-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>${footerHTML}</div></div>`;
    };

    const buildMessageHTML = (message: string): string =>
      `<div class="results-section"><div class="table-card"><div class="table-wrap"><table class="data-table"><thead><tr>${COLS.map(
        (c) => `<th>${c.label}</th>`
      ).join("")}</tr></thead><tbody><tr><td colspan="${COLS.length}" class="no-record-cell">${message}</td></tr></tbody></table></div></div></div>`;

    const renderLoading = (tab: Tab): void => {
      const container = document.getElementById("results-" + tab);
      if (container) container.innerHTML = buildMessageHTML("Loading...");
    };

    const renderMessage = (tab: Tab, message: string): void => {
      const container = document.getElementById("results-" + tab);
      if (container) container.innerHTML = buildMessageHTML(message);
    };

    const renderResults = (tab: Tab, rows: IngredientRecord[]): void => {
  const container = document.getElementById("results-" + tab);
  // API sometimes returns a blank placeholder row with no item name — drop it.
  const cleanRows = (rows || []).filter(
    (r) => r.item_name && r.item_name.trim() !== ""
  );
  currentData[tab] = cleanRows;
  currentPage[tab] = 1;
  hasFetched[tab] = true;
  if (container) container.innerHTML = buildTableHTML(currentData[tab], tab);
};

    const goToPage = (tab: Tab, page: number): void => {
      currentPage[tab] = page;
      const container = document.getElementById("results-" + tab);
      if (container) container.innerHTML = buildTableHTML(currentData[tab], tab);
    };

    // ── API calls ──
    const loadToday = async (): Promise<void> => {
      renderLoading("today");
      try {
        const rows = await reportsService.getTodayIngredients(SHOP_ID);
        renderResults("today", rows);
      } catch (err) {
        console.error(err);
        currentData.today = [];
        hasFetched.today = true;
        renderMessage("today", "Failed to load today's ingredients.");
      }
    };

    const loadWeek = async (): Promise<void> => {
      renderLoading("thisweek");
      try {
        const rows = await reportsService.getWeekIngredients(SHOP_ID);
        renderResults("thisweek", rows);
      } catch (err) {
        console.error(err);
        currentData.thisweek = [];
        hasFetched.thisweek = true;
        renderMessage("thisweek", "Failed to load this week's ingredients.");
      }
    };

    const loadMonth = async (): Promise<void> => {
      const monthSel = document.getElementById(
        "select-month"
      ) as HTMLSelectElement | null;
      const yearSel = document.getElementById(
        "select-month-year"
      ) as HTMLSelectElement | null;
      const month = monthSel?.value ?? "1";
      const year = yearSel?.value ?? String(new Date().getFullYear());

      renderLoading("monthwise");
      try {
        const rows = await reportsService.getMonthIngredients(
          SHOP_ID,
          month,
          year
        );
        renderResults("monthwise", rows);
      } catch (err) {
        console.error(err);
        currentData.monthwise = [];
        hasFetched.monthwise = true;
        renderMessage("monthwise", "Failed to load month wise ingredients.");
      }
    };

    const loadYear = async (): Promise<void> => {
      const yearSel = document.getElementById(
        "select-year"
      ) as HTMLSelectElement | null;
      const year = yearSel?.value ?? String(new Date().getFullYear());

      renderLoading("yearwise");
      try {
        const rows = await reportsService.getYearIngredients(SHOP_ID, year);
        renderResults("yearwise", rows);
      } catch (err) {
        console.error(err);
        currentData.yearwise = [];
        hasFetched.yearwise = true;
        renderMessage("yearwise", "Failed to load year wise ingredients.");
      }
    };

    const loadCustom = async (): Promise<void> => {
      const fromInput = document.getElementById(
        "input-from"
      ) as HTMLInputElement | null;
      const toInput = document.getElementById(
        "input-to"
      ) as HTMLInputElement | null;
      const startDate = fromInput?.value ?? "";
      const endDate = toInput?.value ?? "";

      if (!startDate || !endDate) {
        currentData.custom = [];
        hasFetched.custom = true;
        renderMessage("custom", "Please select both From and To dates.");
        return;
      }

      renderLoading("custom");
      try {
        const rows = await reportsService.getCustomIngredients(
          SHOP_ID,
          startDate,
          endDate
        );
        renderResults("custom", rows);
      } catch (err) {
        console.error(err);
        currentData.custom = [];
        hasFetched.custom = true;
        renderMessage("custom", "Failed to load custom range ingredients.");
      }
    };

    const getData = (tab: Tab): void => {
      if (tab === "today") loadToday();
      else if (tab === "thisweek") loadWeek();
      else if (tab === "monthwise") loadMonth();
      else if (tab === "yearwise") loadYear();
      else if (tab === "custom") loadCustom();
    };

    const exportToExcel = (tab: Tab): void => {
      const rows = currentData[tab];
      if (!rows || rows.length === 0) {
        alert("No data to export.");
        return;
      }
      const XLSX = window.XLSX;
      if (!XLSX) return;
      const headers = ["Item Name", "Total Quantity", "Total Amount"];
      const wsData: unknown[][] = [
        ["Ingredients Report"],
        [],
        headers,
        ...rows.map((r) => [
          r.item_name,
          parseFloat(Number(r.total_quantity ?? 0).toFixed(2)),
          parseFloat(Number(r.total_amount ?? 0).toFixed(2)),
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      (ws as { [k: string]: unknown })["!cols"] = headers.map((_, i) => ({
        wch: i === 0 ? 28 : 16,
      }));
      (ws as { [k: string]: unknown })["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Ingredients");
      XLSX.writeFile(wb, "ingredients_report_" + tab + ".xlsx");
    };

    const switchTab = (tab: Tab): void => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      document.getElementById("tab-" + tab)?.classList.add("active");
      document.getElementById("panel-" + tab)?.classList.add("active");

      if (tab === "today" || tab === "thisweek") {
        getData(tab);
      } else if (!hasFetched[tab]) {
        renderMessage(tab, "Please select parameters and click GETDATA.");
      }
    };

    // ── Tab buttons ──
    const tabOrder: Tab[] = [
      "today",
      "thisweek",
      "monthwise",
      "yearwise",
      "custom",
    ];
    const tabHandlers = tabOrder.map((tab) => {
      const el = document.getElementById("tab-" + tab);
      const handler = (): void => switchTab(tab);
      el?.addEventListener("click", handler);
      return { el, handler };
    });

    // ── GETDATA buttons (event delegation) ──
    const getDataTabs: Tab[] = ["monthwise", "yearwise", "custom"];
    const getDataPanels = getDataTabs.map((tab) => {
      const panel = document.getElementById("panel-" + tab);
      const handler = (ev: Event): void => {
        const target = ev.target as HTMLElement | null;
        const btn = target?.closest<HTMLButtonElement>(".btn-action");
        if (btn && btn.closest(".filter-row")) getData(tab);
      };
      panel?.addEventListener("click", handler);
      return { panel, handler };
    });

    // ── Pagination + export buttons inside dynamic results (event delegation) ──
    const resultsHandlers = tabOrder.map((tab) => {
      const container = document.getElementById("results-" + tab);
      const handler = (ev: Event): void => {
        const target = ev.target as HTMLElement | null;
        const actionEl = target?.closest<HTMLElement>("[data-action]");
        if (!actionEl) return;
        const action = actionEl.getAttribute("data-action");
        if (action === "goToPage") {
          const t = actionEl.getAttribute("data-tab") as Tab;
          const p = Number(actionEl.getAttribute("data-page"));
          goToPage(t, p);
        } else if (action === "exportToExcel") {
          const t = actionEl.getAttribute("data-tab") as Tab;
          exportToExcel(t);
        }
      };
      container?.addEventListener("click", handler);
      return { container, handler };
    });

    // ── Dropdown — close on document click ──
    const closeDropdowns = (): void => {
      document
        .querySelectorAll(".dropdown-menu")
        .forEach((m) => m.classList.remove("show"));
    };
    window.addEventListener("click", closeDropdowns);

    // ── Help button ──
    const helpBtnCard = document.getElementById("helpBtnCard");
    const onHelp = (): void => alert("Help & Support - Ingredients Reports");
    helpBtnCard?.addEventListener("click", onHelp);

    // ── Step nav ──
    let currentStep = 18;
    const totalSteps = 25;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        const sv = document.getElementById("stepValue");
        if (sv) sv.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        const sv = document.getElementById("stepValue");
        if (sv) sv.textContent = currentStep + "/" + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    // ── Init ──
    const currentYear = new Date().getFullYear();
    ["select-month-year", "select-year"].forEach((id) => {
      const el = document.getElementById(id);
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
    // default month = current month, numeric value (API expects "months" as a number string)
    const selMonth = document.getElementById(
      "select-month"
    ) as HTMLSelectElement | null;
    if (selMonth) selMonth.value = String(new Date().getMonth() + 1);

    // default datetime-local range: last 30 days → today
    const inputFrom = document.getElementById(
      "input-from"
    ) as HTMLInputElement | null;
    const inputTo = document.getElementById(
      "input-to"
    ) as HTMLInputElement | null;
    const pad = (n: number) => String(n).padStart(2, "0");
    const toLocalInput = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    if (inputFrom) inputFrom.value = toLocalInput(monthAgo);
    if (inputTo) inputTo.value = toLocalInput(now);

    // Initial load — Today tab
    getData("today");

    return () => {
      tabHandlers.forEach(({ el, handler }) =>
        el?.removeEventListener("click", handler)
      );
      getDataPanels.forEach(({ panel, handler }) =>
        panel?.removeEventListener("click", handler)
      );
      resultsHandlers.forEach(({ container, handler }) =>
        container?.removeEventListener("click", handler)
      );
      window.removeEventListener("click", closeDropdowns);
      helpBtnCard?.removeEventListener("click", onHelp);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, []);

  return (
    <div id="pg-reports-ingredients-reports">
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
              <div className="card-title">Ingredients Reports</div>
              <div className="card-sub">
                View ingredient usage details across different time periods
              </div>

              {/* TABS */}
              <div className="tab-row">
                <button className="tab-btn active" id="tab-today">
                  Today
                </button>
                <button className="tab-btn" id="tab-thisweek">
                  This Week
                </button>
                <button className="tab-btn" id="tab-monthwise">
                  Month Wise
                </button>
                <button className="tab-btn" id="tab-yearwise">
                  Year Wise
                </button>
                <button className="tab-btn" id="tab-custom">
                  Custom
                </button>
              </div>

              {/* TODAY */}
              <div className="tab-panel active" id="panel-today">
                <div id="results-today"></div>
              </div>

              {/* THIS WEEK */}
              <div className="tab-panel" id="panel-thisweek">
                <div id="results-thisweek"></div>
              </div>

              {/* MONTH WISE */}
              <div className="tab-panel" id="panel-monthwise">
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
                    <select
                      className="filter-select"
                      id="select-month-year"
                    ></select>
                  </div>
                  <button className="btn-action">GETDATA</button>
                </div>
                <div id="results-monthwise"></div>
              </div>

              {/* YEAR WISE */}
              <div className="tab-panel" id="panel-yearwise">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Select Year :</label>
                    <select className="filter-select" id="select-year"></select>
                  </div>
                  <button className="btn-action">GETDATA</button>
                </div>
                <div id="results-yearwise"></div>
              </div>

              {/* CUSTOM */}
              <div className="tab-panel" id="panel-custom">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">From</label>
                    <input
                      type="datetime-local"
                      className="filter-input"
                      id="input-from"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">To</label>
                    <input
                      type="datetime-local"
                      className="filter-input"
                      id="input-to"
                    />
                  </div>
                  <button className="btn-action">GET DATA</button>
                </div>
                <div id="results-custom"></div>
              </div>
            </div>

            {/* STEP FOOTER */}
            <div className="step-footer">
              <button className="btn-prev" id="prevBtn">
                <i className="fas fa-chevron-left"></i> PREVIOUS
              </button>
              <div className="step-indicator">
                <span className="step-label">STEP</span>
                <span className="step-value" id="stepValue">
                  18/25
                </span>
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