// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/top-selling-items.html → React.
//  *
//  * The original page renders all result tables via JS (innerHTML) on
//  * DOMContentLoaded: getData('today'), getData('week'), getData('daywise').
//  * To avoid a hydration mismatch the deterministic default tables (Today and
//  * This Week) are rendered as static JSX matching renderResults() output. The
//  * Day-Wise / Month / Year panels are hidden on load and their content (which
//  * depends on `new Date()` and dynamically-built year <option>s) is generated
//  * inside the effect, exactly like the original DOMContentLoaded handler.
//  *
//  * The XLSX export uses the cdnjs xlsx library, loaded via next/script and
//  * referenced through a minimal typed interface (no `any`).
//  */

// interface XlsxWorkSheet {
//   "!cols"?: Array<{ wch: number }>;
//   "!merges"?: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>;
// }

// interface XlsxWorkBook {
//   [key: string]: unknown;
// }

// type SheetCell = string | number;

// interface XlsxLike {
//   utils: {
//     book_new(): XlsxWorkBook;
//     aoa_to_sheet(data: SheetCell[][]): XlsxWorkSheet;
//     book_append_sheet(wb: XlsxWorkBook, ws: XlsxWorkSheet, name: string): void;
//   };
//   writeFile(wb: XlsxWorkBook, filename: string): void;
// }

// interface ResultRow {
//   date?: string;
//   itemName: string;
//   qty: number;
//   amount: number;
// }

// interface ColDef {
//   key: keyof ResultRow;
//   label: string;
//   align: string;
// }

// export default function TopSellingItemsPage() {
//   useEffect(() => {
//     const mockData: {
//       today: ResultRow[];
//       week: ResultRow[];
//       daywise: Record<string, ResultRow[]>;
//       month: Record<string, ResultRow[]>;
//       year: Record<string, ResultRow[]>;
//     } = {
//       today: [
//         { date: "3/6/2026", itemName: "Margherita Pizza", qty: 1, amount: 220.0 },
//         { date: "3/6/2026", itemName: "PALAK PANEER (250 g)", qty: 1, amount: 38.0 },
//         { date: "3/6/2026", itemName: "JULIE KEBAB (250 g)", qty: 1, amount: 44.0 },
//         { date: "3/6/2026", itemName: "HARA BHARA KEBAB (220g)", qty: 1, amount: 36.0 },
//       ],
//       week: [
//         { itemName: "Lychee Arora", qty: 7, amount: 2450.0 },
//         { itemName: "Mushroom Masala", qty: 5, amount: 1475.0 },
//         { itemName: "mustard burger", qty: 5, amount: 500.0 },
//         { itemName: "Shabnam Curry", qty: 5, amount: 1250.0 },
//         { itemName: "Gobhi Matar Masala Cold", qty: 5, amount: 2500.0 },
//         { itemName: "Satay Chicken", qty: 4, amount: 50.0 },
//       ],
//       daywise: {
//         "2026-06-02": [
//           { date: "2/6/2026", itemName: "Paneer Butter Masala", qty: 2, amount: 350.0 },
//           { date: "2/6/2026", itemName: "Garlic Naan", qty: 4, amount: 180.0 },
//           { date: "2/6/2026", itemName: "Veg Biryani", qty: 1, amount: 170.0 },
//         ],
//         "2026-06-01": [
//           { date: "1/6/2026", itemName: "Margherita Pizza", qty: 3, amount: 660.0 },
//           { date: "1/6/2026", itemName: "Masala Dosa", qty: 2, amount: 220.0 },
//         ],
//       },
//       month: {
//         "5-2026": [
//           { itemName: "Lychee Arora", qty: 7, amount: 2450.0 },
//           { itemName: "Mushroom Masala", qty: 5, amount: 1475.0 },
//           { itemName: "mustard burger", qty: 5, amount: 500.0 },
//           { itemName: "Shabnam Curry", qty: 5, amount: 1250.0 },
//           { itemName: "Gobhi Matar Masala Cold", qty: 5, amount: 2500.0 },
//           { itemName: "Satay Chicken", qty: 4, amount: 50.0 },
//           { itemName: "Paneer Butter Masala", qty: 4, amount: 700.0 },
//           { itemName: "Veg Biryani", qty: 3, amount: 510.0 },
//         ],
//         "6-2026": [
//           { itemName: "Margherita Pizza", qty: 18, amount: 3960.0 },
//           { itemName: "PALAK PANEER (250 g)", qty: 12, amount: 456.0 },
//           { itemName: "JULIE KEBAB (250 g)", qty: 9, amount: 396.0 },
//           { itemName: "Veg Biryani", qty: 10, amount: 1700.0 },
//         ],
//       },
//       year: {
//         "2026": [
//           { itemName: "Lychee Arora", qty: 42, amount: 14700.0 },
//           { itemName: "Mushroom Masala", qty: 38, amount: 11210.0 },
//           { itemName: "mustard burger", qty: 35, amount: 3500.0 },
//           { itemName: "Shabnam Curry", qty: 30, amount: 7500.0 },
//           { itemName: "Gobhi Matar Masala Cold", qty: 28, amount: 14000.0 },
//           { itemName: "Satay Chicken", qty: 22, amount: 275.0 },
//           { itemName: "Paneer Butter Masala", qty: 20, amount: 3500.0 },
//         ],
//         "2025": [
//           { itemName: "Paneer Butter Masala", qty: 120, amount: 21000.0 },
//           { itemName: "Margherita Pizza", qty: 105, amount: 23100.0 },
//           { itemName: "Garlic Naan", qty: 180, amount: 8100.0 },
//         ],
//       },
//     };

//     const currentData: Record<string, ResultRow[]> = {};
//     const COLS_WITH_DATE: ColDef[] = [
//       { key: "date", label: "Date", align: "left" },
//       { key: "itemName", label: "Item Name", align: "center" },
//       { key: "qty", label: "Quantity", align: "center" },
//       { key: "amount", label: "Total Amount (Rs.)", align: "center" },
//     ];
//     const COLS_NO_DATE: ColDef[] = [
//       { key: "itemName", label: "Item Name", align: "left" },
//       { key: "qty", label: "Quantity", align: "center" },
//       { key: "amount", label: "Total Amount (Rs.)", align: "center" },
//     ];

//     const renderResults = (
//       tab: string,
//       rows: ResultRow[],
//       cols: ColDef[],
//       showExport: boolean,
//     ): void => {
//       const container = document.getElementById("results-" + tab);
//       if (!container) return;
//       currentData[tab] = rows || [];
//       const headerCells = cols.map((c) => `<th>${c.label}</th>`).join("");
//       let bodyRows: string;
//       if (!rows || rows.length === 0) {
//         bodyRows = `<tr><td colspan="${cols.length}" class="no-record">No Record Found</td></tr>`;
//       } else {
//         bodyRows = rows
//           .map(
//             (r) =>
//               `<tr>${cols
//                 .map(
//                   (c) =>
//                     `<td>${
//                       c.key === "amount"
//                         ? Number(r[c.key]).toFixed(2)
//                         : r[c.key]
//                     }</td>`,
//                 )
//                 .join("")}</tr>`,
//           )
//           .join("");
//       }
//       const exportBtn = showExport
//         ? `<button class="btn-action" data-export="${tab}"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>EXPORT TO EXCEL</button>`
//         : "";
//       container.innerHTML = `<div class="results-section"><div class="results-header"><div class="results-title">Description</div>${exportBtn}</div><div class="table-card"><div class="table-card-header"><span>Top Selling Items</span></div><div class="table-wrap"><table class="data-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div></div></div>`;
//     };

//     const getData = (tab: string): void => {
//       if (tab === "today")
//         renderResults("today", mockData.today, COLS_WITH_DATE, true);
//       else if (tab === "week")
//         renderResults("week", mockData.week, COLS_NO_DATE, true);
//       else if (tab === "daywise") {
//         const date = (
//           document.getElementById("input-daywise-date") as HTMLInputElement | null
//         )?.value;
//         const rows = date ? mockData.daywise[date] || [] : [];
//         renderResults("daywise", rows, COLS_WITH_DATE, true);
//       } else if (tab === "month") {
//         const m = (
//           document.getElementById("select-month") as HTMLSelectElement | null
//         )?.value;
//         const y = (
//           document.getElementById("select-month-year") as HTMLSelectElement | null
//         )?.value;
//         const rows = mockData.month[m + "-" + y] || [];
//         renderResults("month", rows, COLS_NO_DATE, true);
//       } else if (tab === "year") {
//         const y = (
//           document.getElementById("select-year") as HTMLSelectElement | null
//         )?.value;
//         const rows = (y && mockData.year[y]) || [];
//         renderResults("year", rows, COLS_NO_DATE, true);
//       }
//     };

//     const exportToExcel = (tab: string): void => {
//       const rows = currentData[tab];
//       if (!rows || rows.length === 0) {
//         alert("No records to export.");
//         return;
//       }
//       const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
//       if (!XLSX) return;
//       const hasDate = tab === "today" || tab === "daywise";
//       const headers = hasDate
//         ? ["Date", "Item Name", "Quantity", "Total Amount (Rs.)"]
//         : ["Item Name", "Quantity", "Total Amount (Rs.)"];
//       const wsData: SheetCell[][] = [
//         ["Top Selling Items Report"],
//         [],
//         headers,
//         ...rows.map((r) =>
//           hasDate
//             ? [
//                 r.date ?? "",
//                 r.itemName,
//                 r.qty,
//                 parseFloat(Number(r.amount).toFixed(2)),
//               ]
//             : [r.itemName, r.qty, parseFloat(Number(r.amount).toFixed(2))],
//         ),
//       ];
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       ws["!cols"] = [{ wch: 14 }, { wch: 42 }, { wch: 12 }, { wch: 22 }];
//       ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
//       XLSX.utils.book_append_sheet(wb, ws, "Top Selling Items");
//       XLSX.writeFile(wb, "top_selling_items_" + tab + ".xlsx");
//     };

//     const switchTab = (tab: string): void => {
//       document
//         .querySelectorAll(".tab-btn")
//         .forEach((b) => b.classList.remove("active"));
//       document
//         .querySelectorAll(".tab-panel")
//         .forEach((p) => p.classList.remove("active"));
//       document.getElementById("tab-" + tab)?.classList.add("active");
//       document.getElementById("panel-" + tab)?.classList.add("active");
//     };

//     // ── Wire tab buttons (replaces inline onclick="switchTab('...')") ──
//     const tabs = ["today", "daywise", "week", "month", "year"];
//     const tabHandlers: Array<[HTMLElement | null, () => void]> = tabs.map(
//       (t) => [document.getElementById("tab-" + t), () => switchTab(t)],
//     );
//     tabHandlers.forEach(([el, fn]) => el?.addEventListener("click", fn));

//     // ── Wire GET DATA buttons (replaces inline onclick="getData('...')") ──
//     const getDataHandlers: Array<[HTMLElement | null, () => void]> = [
//       ["daywise", "btn-getdata-daywise"],
//       ["month", "btn-getdata-month"],
//       ["year", "btn-getdata-year"],
//     ].map(([tab, id]) => [document.getElementById(id), () => getData(tab)]);
//     getDataHandlers.forEach(([el, fn]) => el?.addEventListener("click", fn));

//     // ── Delegate EXPORT TO EXCEL buttons (rendered into innerHTML) ──
//     const content = document.querySelector(".content-area");
//     const exportDelegate = (e: Event): void => {
//       const btn = (e.target as HTMLElement).closest(
//         "[data-export]",
//       ) as HTMLElement | null;
//       if (btn) exportToExcel(btn.getAttribute("data-export") || "");
//     };
//     content?.addEventListener("click", exportDelegate);

//     // ── Help button ──
//     const helpBtnCard = document.getElementById("helpBtnCard");
//     const onHelp = () => alert("Help & Support - Top Selling Items");
//     helpBtnCard?.addEventListener("click", onHelp);

//     // ── Close dropdowns on outside click (matches original) ──
//     const closeDropdowns = () =>
//       document
//         .querySelectorAll(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     window.addEventListener("click", closeDropdowns);

//     // ── Sidebar nav (no-op in shell context, but ported verbatim) ──
//     const sideMenuItems = document.querySelectorAll<HTMLElement>(
//       ".sidebar .nav-item",
//     );
//     const subGroups = document.querySelectorAll<HTMLElement>(".submenu-group");
//     const sideHandlers: Array<[HTMLElement, () => void]> = [];
//     sideMenuItems.forEach((item) => {
//       const fn = () => {
//         sideMenuItems.forEach((m) => m.classList.remove("active"));
//         item.classList.add("active");
//         subGroups.forEach((g) => g.classList.remove("active"));
//         const target = item.getAttribute("data-target");
//         if (target) document.getElementById(target)?.classList.add("active");
//       };
//       item.addEventListener("click", fn);
//       sideHandlers.push([item, fn]);
//     });
//     document
//       .querySelectorAll(".submenu-item")
//       .forEach((s) => s.classList.remove("active"));
//     const topSellingItem = Array.from(
//       document.querySelectorAll<HTMLElement>(".submenu-item"),
//     ).find((el) => el.textContent?.trim() === "Top selling items");
//     topSellingItem?.classList.add("active");

//     // ── Step footer prev/next ──
//     let currentStep = 6;
//     const totalSteps = 25;
//     const stepValue = document.getElementById("stepValue");
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const onPrev = () => {
//       if (currentStep > 1) {
//         currentStep--;
//         if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     const onNext = () => {
//       if (currentStep < totalSteps) {
//         currentStep++;
//         if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     // ── DOMContentLoaded equivalent (runs once after mount) ──
//     const currentYear = new Date().getFullYear();
//     (["select-month-year", "select-year"] as const).forEach((id) => {
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

//     const todayIso = new Date().toISOString().split("T")[0];
//     const dateInput = document.getElementById(
//       "input-daywise-date",
//     ) as HTMLInputElement | null;
//     if (dateInput) dateInput.value = todayIso;

//     mockData.daywise[todayIso] = [
//       {
//         date: new Date().toLocaleDateString("en-GB"),
//         itemName: "Paneer Butter Masala",
//         qty: 2,
//         amount: 350.0,
//       },
//       {
//         date: new Date().toLocaleDateString("en-GB"),
//         itemName: "Garlic Naan",
//         qty: 4,
//         amount: 180.0,
//       },
//       {
//         date: new Date().toLocaleDateString("en-GB"),
//         itemName: "Veg Biryani",
//         qty: 1,
//         amount: 170.0,
//       },
//     ];

//     const monthSelect = document.getElementById(
//       "select-month",
//     ) as HTMLSelectElement | null;
//     if (monthSelect) monthSelect.value = String(new Date().getMonth() + 1);

//     getData("today");
//     getData("week");
//     getData("daywise");

//     return () => {
//       tabHandlers.forEach(([el, fn]) => el?.removeEventListener("click", fn));
//       getDataHandlers.forEach(([el, fn]) => el?.removeEventListener("click", fn));
//       content?.removeEventListener("click", exportDelegate);
//       helpBtnCard?.removeEventListener("click", onHelp);
//       window.removeEventListener("click", closeDropdowns);
//       sideHandlers.forEach(([el, fn]) => el.removeEventListener("click", fn));
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-top-selling-items">
//       {/* Hoisted CDN assets (React 19 hoists <link>; xlsx via next/script). */}
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
//         rel="stylesheet"
//       />
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       <div className="layout">
//         <div className="main">
//           <div className="content-area">
//             <div className="card">
//               <div className="card-actions">
//                 {/* <button class="btn-help-new" id="helpBtnCard"><i class="far fa-question-circle"></i> HELP</button> */}
//                 <button className="btn-help" id="helpBtnCard">
//                   <svg viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10" />
//                     <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                     <line x1="12" y1="17" x2="12.01" y2="17" />
//                   </svg>
//                   HELP
//                 </button>
//               </div>
//               <div className="typ-page-heading card-title">Top selling items</div>
//               <div className="card-sub">
//                 View best-selling items across different time periods
//               </div>

//               <div className="tab-row">
//                 <button className="tab-btn active" id="tab-today">
//                   Today
//                 </button>
//                 <button className="tab-btn" id="tab-daywise">
//                   Day Wise
//                 </button>
//                 <button className="tab-btn" id="tab-week">
//                   This Week
//                 </button>
//                 <button className="tab-btn" id="tab-month">
//                   Month Wise
//                 </button>
//                 <button className="tab-btn" id="tab-year">
//                   Year Wise
//                 </button>
//               </div>

//               <div className="tab-panel active" id="panel-today">
//                 {/* Default state rendered statically (matches getData('today')). */}
//                 <div id="results-today">
//                   <div className="results-section">
//                     <div className="results-header">
//                       <div className="results-title">Description</div>
//                       <button className="btn-action" data-export="today">
//                         <svg viewBox="0 0 24 24">
//                           <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
//                           <polyline points="7 10 12 15 17 10" />
//                           <line x1="12" y1="15" x2="12" y2="3" />
//                         </svg>
//                         EXPORT TO EXCEL
//                       </button>
//                     </div>
//                     <div className="table-card">
//                       <div className="table-card-header">
//                         <span>Top Selling Items</span>
//                       </div>
//                       <div className="table-wrap">
//                         <table className="data-table">
//                           <thead>
//                             <tr>
//                               <th>Date</th>
//                               <th>Item Name</th>
//                               <th>Quantity</th>
//                               <th>Total Amount (Rs.)</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td>3/6/2026</td>
//                               <td>Margherita Pizza</td>
//                               <td>1</td>
//                               <td>220.00</td>
//                             </tr>
//                             <tr>
//                               <td>3/6/2026</td>
//                               <td>PALAK PANEER (250 g)</td>
//                               <td>1</td>
//                               <td>38.00</td>
//                             </tr>
//                             <tr>
//                               <td>3/6/2026</td>
//                               <td>JULIE KEBAB (250 g)</td>
//                               <td>1</td>
//                               <td>44.00</td>
//                             </tr>
//                             <tr>
//                               <td>3/6/2026</td>
//                               <td>HARA BHARA KEBAB (220g)</td>
//                               <td>1</td>
//                               <td>36.00</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="tab-panel" id="panel-daywise">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Date :</label>
//                     <input
//                       type="date"
//                       className="filter-input"
//                       id="input-daywise-date"
//                     />
//                   </div>
//                   <button className="btn-action" id="btn-getdata-daywise">
//                     GET DATA
//                   </button>
//                 </div>
//                 <div id="results-daywise" />
//               </div>

//               <div className="tab-panel" id="panel-week">
//                 {/* Default state rendered statically (matches getData('week')). */}
//                 <div id="results-week">
//                   <div className="results-section">
//                     <div className="results-header">
//                       <div className="results-title">Description</div>
//                       <button className="btn-action" data-export="week">
//                         <svg viewBox="0 0 24 24">
//                           <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
//                           <polyline points="7 10 12 15 17 10" />
//                           <line x1="12" y1="15" x2="12" y2="3" />
//                         </svg>
//                         EXPORT TO EXCEL
//                       </button>
//                     </div>
//                     <div className="table-card">
//                       <div className="table-card-header">
//                         <span>Top Selling Items</span>
//                       </div>
//                       <div className="table-wrap">
//                         <table className="data-table">
//                           <thead>
//                             <tr>
//                               <th>Item Name</th>
//                               <th>Quantity</th>
//                               <th>Total Amount (Rs.)</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td>Lychee Arora</td>
//                               <td>7</td>
//                               <td>2450.00</td>
//                             </tr>
//                             <tr>
//                               <td>Mushroom Masala</td>
//                               <td>5</td>
//                               <td>1475.00</td>
//                             </tr>
//                             <tr>
//                               <td>mustard burger</td>
//                               <td>5</td>
//                               <td>500.00</td>
//                             </tr>
//                             <tr>
//                               <td>Shabnam Curry</td>
//                               <td>5</td>
//                               <td>1250.00</td>
//                             </tr>
//                             <tr>
//                               <td>Gobhi Matar Masala Cold</td>
//                               <td>5</td>
//                               <td>2500.00</td>
//                             </tr>
//                             <tr>
//                               <td>Satay Chicken</td>
//                               <td>4</td>
//                               <td>50.00</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="tab-panel" id="panel-month">
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
//                     <select className="filter-select" id="select-month-year" />
//                   </div>
//                   <button className="btn-action" id="btn-getdata-month">
//                     GETDATA
//                   </button>
//                 </div>
//                 <div id="results-month" />
//               </div>

//               <div className="tab-panel" id="panel-year">
//                 <div className="filter-row">
//                   <div className="filter-group">
//                     <label className="filter-label">Select Year :</label>
//                     <select className="filter-select" id="select-year" />
//                   </div>
//                   <button className="btn-action" id="btn-getdata-year">
//                     GETDATA
//                   </button>
//                 </div>
//                 <div id="results-year" />
//               </div>
//             </div>

//             {/* STEP FOOTER - inside content-area so it scrolls with content */}
//             <div className="step-footer">
//               <button className="btn-prev" id="prevBtn">
//                 <i className="fas fa-chevron-left" /> PREVIOUS
//               </button>
//               <div className="step-indicator">
//                 <span className="step-label">STEP</span>
//                 <span className="step-value" id="stepValue">
//                   6/25
//                 </span>
//               </div>
//               <button className="btn-next" id="nextBtn">
//                 NEXT <i className="fas fa-chevron-right" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService, TopSellingItem } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

interface XlsxWorkSheet {
  "!cols"?: Array<{ wch: number }>;
  "!merges"?: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>;
}

interface XlsxWorkBook {
  [key: string]: unknown;
}

type SheetCell = string | number;

interface XlsxLike {
  utils: {
    book_new(): XlsxWorkBook;
    aoa_to_sheet(data: SheetCell[][]): XlsxWorkSheet;
    book_append_sheet(wb: XlsxWorkBook, ws: XlsxWorkSheet, name: string): void;
  };
  writeFile(wb: XlsxWorkBook, filename: string): void;
}

interface DisplayItem {
  date: string;
  itemName: string;
  qty: number;
  amount: number;
}

export default function TopSellingItemsPage() {
  const shopId = useShopId();
  const lastFetchParamsRef = useRef<string>("");

  // State for each tab's data
  const [todayData, setTodayData] = useState<DisplayItem[]>([]);
  const [weekData, setWeekData] = useState<DisplayItem[]>([]);
  const [daywiseData, setDaywiseData] = useState<DisplayItem[]>([]);
  const [monthData, setMonthData] = useState<DisplayItem[]>([]);
  const [yearData, setYearData] = useState<DisplayItem[]>([]);

  // Server-side pagination state for Today, Daywise & Week
  const [todayTotalRecords, setTodayTotalRecords] = useState<number>(0);
  const [todayTotalPages, setTodayTotalPages] = useState<number>(1);
  const [errorToday, setErrorToday] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [daywiseTotalRecords, setDaywiseTotalRecords] = useState<number>(0);
  const [daywiseTotalPages, setDaywiseTotalPages] = useState<number>(1);
  const [errorDaywise, setErrorDaywise] = useState<string | null>(null);

  const [weekTotalRecords, setWeekTotalRecords] = useState<number>(0);
  const [weekTotalPages, setWeekTotalPages] = useState<number>(1);
  const [errorWeek, setErrorWeek] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1));
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => String(new Date().getFullYear()));
  const [monthTotalRecords, setMonthTotalRecords] = useState<number>(0);
  const [monthTotalPages, setMonthTotalPages] = useState<number>(1);
  const [errorMonth, setErrorMonth] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));
  const [yearTotalRecords, setYearTotalRecords] = useState<number>(0);
  const [yearTotalPages, setYearTotalPages] = useState<number>(1);
  const [errorYear, setErrorYear] = useState<string | null>(null);

  // Loading states
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingDaywise, setLoadingDaywise] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);

  // Current active tab
  const [activeTab, setActiveTab] = useState("today");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getActiveData = (): DisplayItem[] => {
    switch (activeTab) {
      case "today": return todayData;
      case "daywise": return daywiseData;
      case "week": return weekData;
      case "month": return monthData;
      case "year": return yearData;
      default: return todayData;
    }
  };

  const getActiveLoading = (): boolean => {
    switch (activeTab) {
      case "today": return loadingToday;
      case "daywise": return loadingDaywise;
      case "week": return loadingWeek;
      case "month": return loadingMonth;
      case "year": return loadingYear;
      default: return false;
    }
  };

  const activeRecords = getActiveData();
  const totalRecords = activeTab === "today"
    ? todayTotalRecords
    : activeTab === "daywise"
      ? daywiseTotalRecords
      : activeTab === "week"
        ? weekTotalRecords
        : activeTab === "month"
          ? monthTotalRecords
          : activeTab === "year"
            ? yearTotalRecords
            : activeRecords.length;

  const totalPages = activeTab === "today"
    ? todayTotalPages
    : activeTab === "daywise"
      ? daywiseTotalPages
      : activeTab === "week"
        ? weekTotalPages
        : activeTab === "month"
          ? monthTotalPages
          : activeTab === "year"
            ? yearTotalPages
            : Math.max(1, Math.ceil(activeRecords.length / pageSize));

  const displayedRecords = activeTab === "today"
    ? todayData
    : activeTab === "daywise"
      ? daywiseData
      : activeTab === "week"
        ? weekData
        : activeTab === "month"
          ? monthData
          : activeTab === "year"
            ? yearData
            : activeRecords.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  // Helper to format date
  const formatDate = (transDate: any): string => {
    if (!transDate) return "-";
    const day = transDate.day ?? transDate.Day;
    const month = transDate.month ?? transDate.Month;
    const year = transDate.year ?? transDate.Year;
    if (day !== undefined && month !== undefined && year !== undefined) {
      return `${day}/${month}/${year}`;
    }
    if (transDate.value || transDate.Value) {
      const val = transDate.value || transDate.Value;
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      }
    }
    if (typeof transDate === "string") {
      const d = new Date(transDate);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      }
    }
    return "-";
  };

  // Helper to transform API data to display format
  const transformData = (items: TopSellingItem[]): DisplayItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      date: formatDate(item.trans_date || item.transDate || item.date || item.Trans_Date),
      itemName: item.item_name || item.itemName || item.Item_Name || "-",
      qty: item.total_quantity ?? item.quantity ?? item.qty ?? item.Quantity ?? 0,
      amount: Number(item.total_amount ?? item.amount ?? item.Amount ?? 0),
    }));
  };

  // Fetch Today's Top Selling Items from server with pagination & deduplication
  useEffect(() => {
    if (activeTab !== "today") return;

    const currentKey = `${shopId}-${pageNumber}-${pageSize}-today`;
    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    let isSubscribed = true;

    const fetchTodayData = async () => {
      try {
        setLoadingToday(true);
        setErrorToday(null);
        const res = await reportsService.getTodayTopSellingItems(
          shopId,
          pageNumber,
          pageSize
        );

        if (isSubscribed) {
          setTodayData(transformData(res.items));
          setTodayTotalRecords(res.totalRecords);
          setTodayTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching today's top selling items:", err);
          setErrorToday("Failed to fetch top selling items.");
          setTodayData([]);
          setTodayTotalRecords(0);
          setTodayTotalPages(1);
        }
      } finally {
        if (isSubscribed) {
          setLoadingToday(false);
        }
      }
    };

    fetchTodayData();

    return () => {
      isSubscribed = false;
    };
  }, [shopId, pageNumber, pageSize, activeTab]);

  // Fetch Daywise Top Selling Items from server with pagination & deduplication
  useEffect(() => {
    if (activeTab !== "daywise") return;
    if (!selectedDate) return;

    const currentKey = `${shopId}-${selectedDate}-${pageNumber}-${pageSize}-daywise`;
    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    let isSubscribed = true;

    const fetchDaywiseData = async () => {
      try {
        setLoadingDaywise(true);
        setErrorDaywise(null);
        const res = await reportsService.getDayWiseTopSellingItems(
          shopId,
          selectedDate,
          pageNumber,
          pageSize
        );

        if (isSubscribed) {
          setDaywiseData(transformData(res.items));
          setDaywiseTotalRecords(res.totalRecords);
          setDaywiseTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching daywise top selling items:", err);
          setErrorDaywise("Failed to fetch daywise top selling items.");
          setDaywiseData([]);
          setDaywiseTotalRecords(0);
          setDaywiseTotalPages(1);
        }
      } finally {
        if (isSubscribed) {
          setLoadingDaywise(false);
        }
      }
    };

    fetchDaywiseData();

    return () => {
      isSubscribed = false;
    };
  }, [shopId, selectedDate, pageNumber, pageSize, activeTab]);

  // Fetch Week Top Selling Items from server with pagination & deduplication
  useEffect(() => {
    if (activeTab !== "week") return;

    const currentKey = `${shopId}-${pageNumber}-${pageSize}-week`;
    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    let isSubscribed = true;

    const fetchWeekData = async () => {
      try {
        setLoadingWeek(true);
        setErrorWeek(null);
        const res = await reportsService.getWeekTopSellingItems(
          shopId,
          pageNumber,
          pageSize
        );

        if (isSubscribed) {
          setWeekData(transformData(res.items));
          setWeekTotalRecords(res.totalRecords);
          setWeekTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching week's top selling items:", err);
          setErrorWeek("Failed to fetch week's top selling items.");
          setWeekData([]);
          setWeekTotalRecords(0);
          setWeekTotalPages(1);
        }
      } finally {
        if (isSubscribed) {
          setLoadingWeek(false);
        }
      }
    };

    fetchWeekData();

    return () => {
      isSubscribed = false;
    };
  }, [shopId, pageNumber, pageSize, activeTab]);

  // Fetch Month Top Selling Items from server with pagination & deduplication
  useEffect(() => {
    if (activeTab !== "month") return;
    if (!selectedMonth || !selectedMonthYear) return;

    const currentKey = `${shopId}-${selectedMonth}-${selectedMonthYear}-${pageNumber}-${pageSize}-month`;
    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    let isSubscribed = true;

    const fetchMonthData = async () => {
      try {
        setLoadingMonth(true);
        setErrorMonth(null);
        const res = await reportsService.getMonthTopSellingItems(
          shopId,
          selectedMonth,
          selectedMonthYear,
          pageNumber,
          pageSize
        );

        if (isSubscribed) {
          setMonthData(transformData(res.items));
          setMonthTotalRecords(res.totalRecords);
          setMonthTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching month's top selling items:", err);
          setErrorMonth("Failed to fetch month's top selling items.");
          setMonthData([]);
          setMonthTotalRecords(0);
          setMonthTotalPages(1);
        }
      } finally {
        if (isSubscribed) {
          setLoadingMonth(false);
        }
      }
    };

    fetchMonthData();

    return () => {
      isSubscribed = false;
    };
  }, [shopId, selectedMonth, selectedMonthYear, pageNumber, pageSize, activeTab]);





  // Fetch Year Top Selling Items from server with pagination & deduplication
  useEffect(() => {
    if (activeTab !== "year") return;
    if (!selectedYear) return;

    const currentKey = `${shopId}-${selectedYear}-${pageNumber}-${pageSize}-year`;
    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    let isSubscribed = true;

    const fetchYearData = async () => {
      try {
        setLoadingYear(true);
        setErrorYear(null);
        const res = await reportsService.getYearTopSellingItems(
          shopId,
          selectedYear,
          pageNumber,
          pageSize
        );

        if (isSubscribed) {
          setYearData(transformData(res.items));
          setYearTotalRecords(res.totalRecords);
          setYearTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching year's top selling items:", err);
          setErrorYear("Failed to fetch year's top selling items.");
          setYearData([]);
          setYearTotalRecords(0);
          setYearTotalPages(1);
        }
      } finally {
        if (isSubscribed) {
          setLoadingYear(false);
        }
      }
    };

    fetchYearData();

    return () => {
      isSubscribed = false;
    };
  }, [shopId, selectedYear, pageNumber, pageSize, activeTab]);

  // Export to Excel
  const exportToExcel = (data: DisplayItem[], tab: string): void => {
    if (!data || data.length === 0) {
      alert("No records to export.");
      return;
    }

    const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
    if (!XLSX) return;

    const hasDate = tab === "today" || tab === "daywise";
    const headers = hasDate
      ? ["Date", "Item Name", "Quantity", "Total Amount (Rs.)"]
      : ["Item Name", "Quantity", "Total Amount (Rs.)"];

    const wsData: SheetCell[][] = [
      ["Top Selling Items Report"],
      [],
      headers,
      ...data.map((r) =>
        hasDate
          ? [r.date, r.itemName, r.qty, parseFloat(r.amount.toFixed(2))]
          : [r.itemName, r.qty, parseFloat(r.amount.toFixed(2))]
      ),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 14 }, { wch: 42 }, { wch: 12 }, { wch: 22 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Top Selling Items");
    XLSX.writeFile(wb, `top_selling_items_${tab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Render table function
  const renderTable = (data: DisplayItem[], hasDate: boolean, loading: boolean, errMessage?: string | null) => {
    if (loading) {
      return (
        <tr>
          <td colSpan={hasDate ? 4 : 3} style={{ textAlign: "center", padding: "40px" }}>
            <i className="fas fa-spinner fa-spin me-2" /> Loading data...
          </td>
        </tr>
      );
    }

    if (errMessage) {
      return (
        <tr>
          <td colSpan={hasDate ? 4 : 3} style={{ textAlign: "center", padding: "40px", color: "#dc3545" }}>
            {errMessage}
          </td>
        </tr>
      );
    }

    if (!data || data.length === 0) {
      return (
        <tr>
          <td colSpan={hasDate ? 4 : 3} style={{ textAlign: "center", padding: "40px" }}>
            No records found
          </td>
        </tr>
      );
    }

    return data.map((item, index) => (
      <tr key={index}>
        {hasDate && <td>{item.date}</td>}
        <td>{item.itemName}</td>
        <td>{item.qty}</td>
        <td>{item.amount.toFixed(2)}</td>
      </tr>
    ));
  };

  // Switch tab
  const switchTab = (tab: string) => {
    lastFetchParamsRef.current = "";
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
    const yearSelects = ["select-month-year", "select-year"];
    yearSelects.forEach((id) => {
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

    // Set today's date
    const dateInput = document.getElementById("input-daywise-date") as HTMLInputElement | null;
    if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Set current month
    const monthSelect = document.getElementById("select-month") as HTMLSelectElement | null;
    if (monthSelect) {
      monthSelect.value = String(new Date().getMonth() + 1);
    }
  }, []);

  // Wire up event listeners
  useEffect(() => {
    // Tab buttons
    const tabs = ["today", "daywise", "week", "month", "year"];
    const tabHandlers: Array<[HTMLElement | null, () => void]> = tabs.map((t) => [
      document.getElementById(`tab-${t}`),
      () => switchTab(t),
    ]);
    tabHandlers.forEach(([el, fn]) => el?.addEventListener("click", fn));

    // Get data buttons
    const daywiseBtn = document.getElementById("btn-getdata-daywise");
    const monthBtn = document.getElementById("btn-getdata-month");
    const yearBtn = document.getElementById("btn-getdata-year");

    daywiseBtn?.addEventListener("click", () => {
      const dateInput = document.getElementById("input-daywise-date") as HTMLInputElement | null;
      const dateVal = dateInput?.value || selectedDate;
      if (dateVal) {
        setSelectedDate(dateVal);
        setPageNumber(1);
        lastFetchParamsRef.current = "";
      }
    });

    monthBtn?.addEventListener("click", () => {
      const monthSelect = document.getElementById("select-month") as HTMLSelectElement | null;
      const yearSelect = document.getElementById("select-month-year") as HTMLSelectElement | null;
      const mVal = monthSelect?.value || selectedMonth;
      const yVal = yearSelect?.value || selectedMonthYear;
      if (mVal && yVal) {
        setSelectedMonth(mVal);
        setSelectedMonthYear(yVal);
        setPageNumber(1);
        lastFetchParamsRef.current = "";
      }
    });

    yearBtn?.addEventListener("click", () => {
      const yearSelect = document.getElementById("select-year") as HTMLSelectElement | null;
      const yVal = yearSelect?.value || selectedYear;
      if (yVal) {
        setSelectedYear(yVal);
        setPageNumber(1);
        lastFetchParamsRef.current = "";
      }
    });

    // Export buttons - event delegation
    const content = document.querySelector(".content-area");
    const exportDelegate = (e: Event): void => {
      const btn = (e.target as HTMLElement).closest("[data-export]") as HTMLElement | null;
      if (btn) {
        const tab = btn.getAttribute("data-export") || "";
        const dataMap: Record<string, DisplayItem[]> = {
          today: todayData,
          week: weekData,
          daywise: daywiseData,
          month: monthData,
          year: yearData,
        };
        exportToExcel(dataMap[tab] || [], tab);
      }
    };
    content?.addEventListener("click", exportDelegate);

    // Help button
    const helpBtn = document.getElementById("helpBtnCard");
    helpBtn?.addEventListener("click", () => alert("Help & Support - Top Selling Items"));

    // Step navigation
    let currentStep = 6;
    const totalSteps = 25;
    const stepValue = document.getElementById("stepValue");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

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

    return () => {
      tabHandlers.forEach(([el, fn]) => el?.removeEventListener("click", fn));
      daywiseBtn?.removeEventListener("click", () => { });
      monthBtn?.removeEventListener("click", () => { });
      yearBtn?.removeEventListener("click", () => { });
      content?.removeEventListener("click", exportDelegate);
      helpBtn?.removeEventListener("click", () => { });
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, [todayData, weekData, daywiseData, monthData, yearData]);

  return (
    <div id="pg-reports-top-selling-items">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-actions">
                <button className="btn-help" id="helpBtnCard">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
              <div className="card-title">Top selling items</div>
              <div className="card-sub">
                View best-selling items across different time periods
              </div>

              <div className="tab-row">
                <button className="tab-btn active" id="tab-today">Today</button>
                <button className="tab-btn" id="tab-daywise">Day Wise</button>
                <button className="tab-btn" id="tab-week">This Week</button>
                <button className="tab-btn" id="tab-month">Month Wise</button>
                <button className="tab-btn" id="tab-year">Year Wise</button>
              </div>

              {/* Today Panel */}
              <div className="tab-panel active" id="panel-today">
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    <button className="btn-action" data-export="today">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  <div className="table-card">
                    <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Top Selling Items</span>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Show</span>
                        <select
                          className="input-control"
                          style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                        {totalRecords > 0 && (
                          <span style={{ marginLeft: "8px" }}>
                            ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Total Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderTable(displayedRecords, true, getActiveLoading(), activeTab === "today" ? errorToday : null)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page)}
                  disabled={getActiveLoading()}
                />
              </div>

              {/* Day Wise Panel */}
              <div className="tab-panel" id="panel-daywise">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Date :</label>
                    <input
                      type="date"
                      className="filter-input"
                      id="input-daywise-date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setPageNumber(1);
                      }}
                    />
                  </div>
                  <button
                    className="btn-action"
                    id="btn-getdata-daywise"
                    onClick={() => {
                      if (!selectedDate) return;
                      setPageNumber(1);
                      lastFetchParamsRef.current = "";
                    }}
                  >
                    GET DATA
                  </button>
                </div>
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    <button className="btn-action" data-export="daywise">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  <div className="table-card">
                    <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Top Selling Items</span>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Show</span>
                        <select
                          className="input-control"
                          style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                        {totalRecords > 0 && (
                          <span style={{ marginLeft: "8px" }}>
                            ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Total Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderTable(displayedRecords, true, getActiveLoading(), activeTab === "today" ? errorToday : activeTab === "daywise" ? errorDaywise : null)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page)}
                  disabled={getActiveLoading()}
                />
              </div>

              {/* Week Panel */}
              <div className="tab-panel" id="panel-week">
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    <button className="btn-action" data-export="week">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  <div className="table-card">
                    <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Top Selling Items</span>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Show</span>
                        <select
                          className="input-control"
                          style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                        {totalRecords > 0 && (
                          <span style={{ marginLeft: "8px" }}>
                            ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Total Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderTable(displayedRecords, false, getActiveLoading(), activeTab === "today" ? errorToday : activeTab === "daywise" ? errorDaywise : activeTab === "week" ? errorWeek : null)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page)}
                  disabled={getActiveLoading()}
                />
              </div>

              {/* Month Panel */}
              <div className="tab-panel" id="panel-month">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Select Month :</label>
                    <select
                      className="filter-select"
                      id="select-month"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setPageNumber(1);
                        lastFetchParamsRef.current = "";
                      }}
                    >
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
                      value={selectedMonthYear}
                      onChange={(e) => {
                        setSelectedMonthYear(e.target.value);
                        setPageNumber(1);
                        lastFetchParamsRef.current = "";
                      }}
                    />
                  </div>
                  <button
                    className="btn-action"
                    id="btn-getdata-month"
                    onClick={() => {
                      const mSelect = document.getElementById("select-month") as HTMLSelectElement | null;
                      const ySelect = document.getElementById("select-month-year") as HTMLSelectElement | null;
                      if (mSelect) setSelectedMonth(mSelect.value);
                      if (ySelect) setSelectedMonthYear(ySelect.value);
                      setPageNumber(1);
                      lastFetchParamsRef.current = "";
                    }}
                  >
                    GETDATA
                  </button>
                </div>
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    <button className="btn-action" data-export="month">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  <div className="table-card">
                    <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Top Selling Items</span>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Show</span>
                        <select
                          className="input-control"
                          style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                        {totalRecords > 0 && (
                          <span style={{ marginLeft: "8px" }}>
                            ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Total Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderTable(displayedRecords, false, getActiveLoading(), activeTab === "today" ? errorToday : activeTab === "daywise" ? errorDaywise : activeTab === "week" ? errorWeek : activeTab === "month" ? errorMonth : null)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page)}
                  disabled={getActiveLoading()}
                />
              </div>

              {/* Year Panel */}
              <div className="tab-panel" id="panel-year">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Select Year :</label>
                    <select
                      className="filter-select"
                      id="select-year"
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setPageNumber(1);
                        lastFetchParamsRef.current = "";
                      }}
                    />
                  </div>
                  <button
                    className="btn-action"
                    id="btn-getdata-year"
                    onClick={() => {
                      const ySelect = document.getElementById("select-year") as HTMLSelectElement | null;
                      if (ySelect) setSelectedYear(ySelect.value);
                      setPageNumber(1);
                      lastFetchParamsRef.current = "";
                    }}
                  >
                    GETDATA
                  </button>
                </div>
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    <button className="btn-action" data-export="year">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  <div className="table-card">
                    <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Top Selling Items</span>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Show</span>
                        <select
                          className="input-control"
                          style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                        {totalRecords > 0 && (
                          <span style={{ marginLeft: "8px" }}>
                            ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Total Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderTable(displayedRecords, false, getActiveLoading(), activeTab === "today" ? errorToday : activeTab === "daywise" ? errorDaywise : activeTab === "week" ? errorWeek : activeTab === "month" ? errorMonth : activeTab === "year" ? errorYear : null)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page)}
                  disabled={getActiveLoading()}
                />
              </div>
            </div>

            {/* STEP FOOTER */}
            <div className="step-footer">
              <button className="btn-prev" id="prevBtn">
                <i className="fas fa-chevron-left" /> PREVIOUS
              </button>
              <div className="step-indicator">
                <span className="step-label">STEP</span>
                <span className="step-value" id="stepValue">6/25</span>
              </div>
              <button className="btn-next" id="nextBtn">
                NEXT <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}