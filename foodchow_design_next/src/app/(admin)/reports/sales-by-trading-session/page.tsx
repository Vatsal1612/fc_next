// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/sales-by-trading-session.html → React.
//  *
//  * Mechanical port. Markup wrapped in #pg-reports-sales-by-trading-session
//  * (CSS scope). The original inline <script> is ported verbatim into one
//  * useEffect wired with addEventListener + cleanup. The "Today Sales" tab is
//  * auto-loaded on page open (getData runs for the default tab), so its default
//  * results table is rendered statically to avoid a hydration mismatch; the
//  * effect's getData() re-renders identical markup.
//  */

// interface SessionRow {
//   date?: string;
//   session: string;
//   orders: number;
//   amount: string;
// }

// export default function SalesByTradingSessionPage() {
//   useEffect(() => {
//     /* ── Static demo data per tab ── */
//     const STATIC: Record<string, SessionRow[]> = {
//       today: [
//         { date: "3/6/2026", session: "Breakfast", orders: 5, amount: "875.00" },
//         { date: "3/6/2026", session: "Lunch", orders: 12, amount: "2340.00" },
//         { date: "3/6/2026", session: "Dinner", orders: 8, amount: "1680.00" },
//         { date: "3/6/2026", session: "Other", orders: 2, amount: "348.00" },
//       ],
//       daywise: [
//         { date: "1/6/2026", session: "Lunch", orders: 9, amount: "1710.00" },
//         { date: "1/6/2026", session: "Dinner", orders: 6, amount: "1140.00" },
//         { date: "1/6/2026", session: "Other", orders: 1, amount: "175.00" },
//       ],
//       week: [
//         { session: "Breakfast", orders: 18, amount: "3150.00" },
//         { session: "Lunch", orders: 54, amount: "10260.00" },
//         { session: "Dinner", orders: 41, amount: "8610.00" },
//         { session: "Other", orders: 7, amount: "1225.00" },
//       ],
//       month: [
//         { date: "May 2026", session: "Breakfast", orders: 72, amount: "12600.00" },
//         { date: "May 2026", session: "Lunch", orders: 195, amount: "37050.00" },
//         { date: "May 2026", session: "Dinner", orders: 160, amount: "33600.00" },
//         { date: "May 2026", session: "Other", orders: 28, amount: "4900.00" },
//       ],
//       year: [
//         { session: "Breakfast", orders: 860, amount: "150500.00" },
//         { session: "Lunch", orders: 2340, amount: "444600.00" },
//         { session: "Dinner", orders: 1920, amount: "403200.00" },
//         { session: "Other", orders: 335, amount: "58625.00" },
//       ],
//     };

//     let activeTab = "today";
//     let currentData: SessionRow[] = [];

//     /* ── Populate year dropdowns ── */
//     (function () {
//       const curYear = new Date().getFullYear();
//       ["m-year", "y-year"].forEach((id) => {
//         const sel = document.getElementById(id) as HTMLSelectElement | null;
//         if (!sel) return;
//         if (sel.options.length > 0) return;
//         for (let y = curYear; y >= curYear - 9; y--) {
//           const o = document.createElement("option");
//           o.value = String(y);
//           o.textContent = String(y);
//           sel.appendChild(o);
//         }
//       });
//     })();

//     /* ── Switch tab ── */
//     function switchTab(tab: string, btn: HTMLElement): void {
//       activeTab = tab;

//       // update tab buttons
//       document
//         .querySelectorAll<HTMLElement>(".tab-btn")
//         .forEach((b) => b.classList.remove("active"));
//       btn.classList.add("active");

//       // hide all filter panels
//       ["today", "daywise", "week", "month", "year"].forEach((t) => {
//         const panel = document.getElementById("filter-" + t);
//         if (panel) panel.style.display = "none";
//       });
//       const cur = document.getElementById("filter-" + tab);
//       if (cur) cur.style.display = "block";

//       // clear results
//       hideResults();

//       // auto-load for today & week
//       if (tab === "today" || tab === "week") {
//         getData();
//       }
//     }

//     /* ── Get data ── */
//     function getData(): void {
//       currentData = STATIC[activeTab] || [];

//       const section = document.getElementById("resultsSection");
//       const titleDiv = document.getElementById("resultsTitle");
//       const wrap = document.getElementById("tableWrap");
//       const exportTop = document.getElementById("exportTopRow");

//       if (!section || !titleDiv || !wrap || !exportTop) return;

//       section.style.display = "block";

//       // For today & week: show export button top-right
//       exportTop.style.display =
//         activeTab === "today" || activeTab === "week" ? "flex" : "none";

//       if (!currentData.length) {
//         titleDiv.style.display = "none";
//         wrap.innerHTML = '<p class="no-record">No Record Found</p>';
//         return;
//       }

//       titleDiv.style.display = "block";

//       // Build columns based on tab
//       const hasDate =
//         activeTab === "today" ||
//         activeTab === "daywise" ||
//         activeTab === "month";

//       const headerCols = hasDate
//         ? "<th>Date</th><th>Session</th><th>Total Orders</th><th>Total Amount (Rs.)</th>"
//         : "<th>Session</th><th>Total Orders</th><th>Total Amount (Rs.)</th>";

//       let rows = "";
//       currentData.forEach((item) => {
//         if (hasDate) {
//           rows += `<tr>

//                         <td class="date-col">${item.date}</td>
//                         <td><span class="session-pill">${item.session}</span></td>
//                         <td>${item.orders}</td>
//                         <td class="amount-col">₹ ${Number(item.amount).toFixed(2)}</td>
//                     </tr>`;
//         } else {
//           rows += `<tr>

//                         <td><span class="session-pill">${item.session}</span></td>
//                         <td>${item.orders}</td>
//                         <td class="amount-col">₹ ${Number(item.amount).toFixed(2)}</td>
//                     </tr>`;
//         }
//       });

//       wrap.innerHTML = `
//             <div class="report-table-wrap">
//                 <table class="report-table">
//                     <thead><tr>${headerCols}</tr></thead>
//                     <tbody>${rows}</tbody>
//                 </table>
//             </div>`;
//     }

//     /* ── Hide results ── */
//     function hideResults(): void {
//       const section = document.getElementById("resultsSection");
//       const titleDiv = document.getElementById("resultsTitle");
//       const exportTop = document.getElementById("exportTopRow");
//       const wrap = document.getElementById("tableWrap");
//       if (section) section.style.display = "none";
//       if (titleDiv) titleDiv.style.display = "none";
//       if (exportTop) exportTop.style.display = "none";
//       if (wrap) wrap.innerHTML = "";
//       currentData = [];
//     }

//     /* ── Export CSV ── */
//     function exportCSV(): void {
//       if (!currentData.length) {
//         toast("No data to export", true);
//         return;
//       }

//       const hasDate =
//         activeTab === "today" ||
//         activeTab === "daywise" ||
//         activeTab === "month";
//       const headers = hasDate
//         ? ["Sr No", "Date", "Sessions", "Total Order Count", "Total Amount (Rs.)"]
//         : ["Sr No", "Sessions", "Total Order Count", "Total Amount (Rs.)"];

//       const rows = [headers.join(",")];
//       currentData.forEach((item, i) => {
//         const row = hasDate
//           ? [
//               i + 1,
//               `"${item.date}"`,
//               `"${item.session}"`,
//               item.orders,
//               Number(item.amount).toFixed(2),
//             ]
//           : [
//               i + 1,
//               `"${item.session}"`,
//               item.orders,
//               Number(item.amount).toFixed(2),
//             ];
//         rows.push(row.join(","));
//       });

//       const blob = new Blob([rows.join("\n")], { type: "text/csv" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "Sales_By_Session.csv";
//       a.click();
//       URL.revokeObjectURL(url);
//       toast("Export downloaded successfully!");
//     }

//     /* ── Open help modal ── */
//     function openHelpModal(): void {
//       toast("Help modal opened!");
//     }

//     /* ── Toast ── */
//     let toastTimer: ReturnType<typeof setTimeout> | undefined;
//     function toast(msg: string, isErr = false): void {
//       const t = document.getElementById("toast");
//       if (!t) return;
//       t.textContent = msg;
//       t.style.background = isErr ? "#ef4444" : "#00a896";
//       t.className = "toast show";
//       toastTimer = setTimeout(() => {
//         t.className = "toast";
//       }, 3000);
//     }

//     // ── Wire handlers (replaces the original inline on* attributes) ──
//     const cleanups: Array<() => void> = [];

//     const helpBtn = document.querySelector<HTMLButtonElement>(".btn-help");
//     if (helpBtn) {
//       const h = (): void => openHelpModal();
//       helpBtn.addEventListener("click", h);
//       cleanups.push(() => helpBtn.removeEventListener("click", h));
//     }

//     // Tab buttons → switchTab(tab, this) by index/label order
//     const tabConfig: Array<[number, string]> = [
//       [0, "today"],
//       [1, "daywise"],
//       [2, "week"],
//       [3, "month"],
//       [4, "year"],
//     ];
//     const tabBtns = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
//     tabConfig.forEach(([idx, tab]) => {
//       const btn = tabBtns[idx];
//       if (!btn) return;
//       const h = (): void => switchTab(tab, btn);
//       btn.addEventListener("click", h);
//       cleanups.push(() => btn.removeEventListener("click", h));
//     });

//     // GETDATA + EXPORT buttons (delegation on document-level — they appear in
//     // multiple static filter panels and the results export-top row)
//     const onGetData = (e: Event): void => {
//       const target = (e.target as HTMLElement)?.closest(".btn-getdata");
//       if (target) getData();
//     };
//     const onExport = (e: Event): void => {
//       const target = (e.target as HTMLElement)?.closest(".btn-export");
//       if (target) exportCSV();
//     };
//     document.addEventListener("click", onGetData);
//     document.addEventListener("click", onExport);
//     cleanups.push(() => document.removeEventListener("click", onGetData));
//     cleanups.push(() => document.removeEventListener("click", onExport));

//     // Close any dropdown on document click
//     const onDocClick = (): void => {
//       document
//         .querySelectorAll<HTMLElement>(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", onDocClick);
//     cleanups.push(() => document.removeEventListener("click", onDocClick));

//     // Step nav
//     let currentStep = 4;
//     const totalSteps = 26;
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const stepValue = document.getElementById("stepValue");
//     if (prevBtn) {
//       const h = (): void => {
//         if (currentStep > 1) {
//           currentStep--;
//           if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//         }
//       };
//       prevBtn.addEventListener("click", h);
//       cleanups.push(() => prevBtn.removeEventListener("click", h));
//     }
//     if (nextBtn) {
//       const h = (): void => {
//         if (currentStep < totalSteps) {
//           currentStep++;
//           if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//         }
//       };
//       nextBtn.addEventListener("click", h);
//       cleanups.push(() => nextBtn.removeEventListener("click", h));
//     }

//     // Set today's date in Day Wise
//     const dayDate = document.getElementById("dw-date") as HTMLInputElement | null;
//     if (dayDate) {
//       dayDate.value = new Date().toISOString().split("T")[0];
//     }

//     // Auto-load Today Sales data on page open
//     getData();

//     return () => {
//       if (toastTimer) clearTimeout(toastTimer);
//       cleanups.forEach((fn) => fn());
//     };
//   }, []);

//   return (
//     <div id="pg-reports-sales-by-trading-session">
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />

//       {/* App Container */}
//       <div className="app-container">
//         {/* Main Content */}
//         <div className="main-content">
//           <div className="card">
//             {/* Title + Help */}
//             <div className="report-header">
//               <h2 className="typ-page-heading report-title">Sales by trading session</h2>
//               <button className="btn-help">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10" />
//                   <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                   <line x1="12" y1="17" x2="12.01" y2="17" />
//                 </svg>
//                 HELP
//               </button>
//             </div>

//             {/* Tabs */}
//             <div className="tabs-row">
//               <button className="tab-btn active">Today Sales</button>
//               <button className="tab-btn">Day Wise</button>
//               <button className="tab-btn">This Week</button>
//               <button className="tab-btn">Month Wise Sale</button>
//               <button className="tab-btn">Year Wise</button>
//             </div>

//             {/* TODAY filter area */}
//             <div id="filter-today"></div>

//             {/* DAY WISE filter area */}
//             <div id="filter-daywise" style={{ display: "none" }}>
//               <div className="filter-row">
//                 <div className="filter-group">
//                   <label className="filter-label">Date :</label>
//                   <input type="date" id="dw-date" className="filter-input" />
//                 </div>
//                 <button className="btn-getdata">GETDATA</button>
//                 <button className="btn-export">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>
//             </div>

//             {/* THIS WEEK filter area */}
//             <div id="filter-week" style={{ display: "none" }}></div>

//             {/* MONTH WISE filter area */}
//             <div id="filter-month" style={{ display: "none" }}>
//               <div className="filter-row">
//                 <div className="filter-group">
//                   <label className="filter-label">Select Month :</label>
//                   <select id="m-month" className="filter-input" defaultValue="01">
//                     <option value="01">January</option>
//                     <option value="02">February</option>
//                     <option value="03">March</option>
//                     <option value="04">April</option>
//                     <option value="05">May</option>
//                     <option value="06">June</option>
//                     <option value="07">July</option>
//                     <option value="08">August</option>
//                     <option value="09">September</option>
//                     <option value="10">October</option>
//                     <option value="11">November</option>
//                     <option value="12">December</option>
//                   </select>
//                 </div>
//                 <div className="filter-group">
//                   <label className="filter-label">Select Year:</label>
//                   <select id="m-year" className="filter-input"></select>
//                 </div>
//                 <button className="btn-getdata">GETDATA</button>
//                 <button className="btn-export">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>
//             </div>

//             {/* YEAR WISE filter area */}
//             <div id="filter-year" style={{ display: "none" }}>
//               <div className="filter-row">
//                 <div className="filter-group">
//                   <label className="filter-label">Select Year :</label>
//                   <select id="y-year" className="filter-input"></select>
//                 </div>
//                 <button className="btn-getdata">GETDATA</button>
//                 <button className="btn-export">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>
//             </div>

//             {/* Results — default state is the auto-loaded "Today Sales" table */}
//             <div
//               id="resultsSection"
//               style={{ display: "block", marginTop: "4px" }}
//             >
//               {/* Export top-right for Today & This Week */}
//               <div
//                 id="exportTopRow"
//                 className="export-toprow"
//                 style={{ display: "flex" }}
//               >
//                 <button className="btn-export">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>
//               <div id="resultsTitle" style={{ display: "block" }}>
//                 <h3 className="results-title">Description</h3>
//               </div>
//               <div id="tableWrap">
//                 <div className="report-table-wrap">
//                   <table className="report-table">
//                     <thead>
//                       <tr>
//                         <th>Date</th>
//                         <th>Session</th>
//                         <th>Total Orders</th>
//                         <th>Total Amount (Rs.)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td className="date-col">3/6/2026</td>
//                         <td>
//                           <span className="session-pill">Breakfast</span>
//                         </td>
//                         <td>5</td>
//                         <td className="amount-col">₹ 875.00</td>
//                       </tr>
//                       <tr>
//                         <td className="date-col">3/6/2026</td>
//                         <td>
//                           <span className="session-pill">Lunch</span>
//                         </td>
//                         <td>12</td>
//                         <td className="amount-col">₹ 2340.00</td>
//                       </tr>
//                       <tr>
//                         <td className="date-col">3/6/2026</td>
//                         <td>
//                           <span className="session-pill">Dinner</span>
//                         </td>
//                         <td>8</td>
//                         <td className="amount-col">₹ 1680.00</td>
//                       </tr>
//                       <tr>
//                         <td className="date-col">3/6/2026</td>
//                         <td>
//                           <span className="session-pill">Other</span>
//                         </td>
//                         <td>2</td>
//                         <td className="amount-col">₹ 348.00</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="step-footer">
//             <button className="btn-prev" id="prevBtn">
//               <i className="fas fa-chevron-left" /> PREVIOUS
//             </button>
//             <div className="step-indicator">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 4/26
//               </span>
//             </div>
//             <button className="btn-next" id="nextBtn">
//               NEXT <i className="fas fa-chevron-right" />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="toast" id="toast"></div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
import "./page.css";
import { reportsService, TradingSession } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

interface DisplayRow {
  date: string;
  session: string;
  orders: number;
  amount: number;
}

export default function SalesByTradingSessionPage() {
  const shopId = useShopId();

  // State for each tab's data
  const [todayData, setTodayData] = useState<DisplayRow[]>([]);
  const [weekData, setWeekData] = useState<DisplayRow[]>([]);
  const [daywiseData, setDaywiseData] = useState<DisplayRow[]>([]);
  const [monthData, setMonthData] = useState<DisplayRow[]>([]);
  const [yearData, setYearData] = useState<DisplayRow[]>([]);

  // Loading states
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingDaywise, setLoadingDaywise] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);

  // Current active tab & pagination
  const [activeTab, setActiveTab] = useState("today");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helper to format date
  const formatDate = (item: TradingSession): string => {
    if (item.trans_date) {
      const d = item.trans_date;
      return `${d.Day}/${d.Month}/${d.Year}`;
    }
    return "";
  };

  // Helper to transform API data to display format
  const transformData = (items: TradingSession[]): DisplayRow[] => {
    return items.map((item) => ({
      date: formatDate(item),
      session: item.trading_session,
      orders: item.total_quantity,
      amount: item.total_amount,
    }));
  };

  // Fetch today's data
  const fetchToday = async (page = 1) => {
    if (!shopId) return;
    try {
      setLoadingToday(true);
      const res = await reportsService.fetchTradingSessionToday(shopId, page, 10);
      setTodayData(transformData(res.records));
    } catch (err) {
      console.error("Error fetching today's trading session data:", err);
      setTodayData([]);
    } finally {
      setLoadingToday(false);
    }
  };

  // Fetch week data
  const fetchWeek = async (page = 1) => {
    if (!shopId) return;
    try {
      setLoadingWeek(true);
      const res = await reportsService.fetchTradingSessionWeek(shopId, page, 10);
      setWeekData(transformData(res.records));
    } catch (err) {
      console.error("Error fetching week's trading session data:", err);
      setWeekData([]);
    } finally {
      setLoadingWeek(false);
    }
  };

  const lastFetched = useRef<{ tab: string; shopId: number | null; page: number }>({ tab: "", shopId: null, page: 0 });

  useEffect(() => {
    if (!shopId) return;
    if (lastFetched.current.tab === activeTab && lastFetched.current.shopId === shopId && lastFetched.current.page === pageNumber) return;

    if (activeTab === "today") {
      lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
      fetchToday(pageNumber);
    } else if (activeTab === "week") {
      lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
      fetchWeek(pageNumber);
    }
  }, [shopId, activeTab, pageNumber]);

  // Fetch daywise data
  const fetchDaywise = async (date: string, page = 1) => {
    if (!date) return;
    try {
      setLoadingDaywise(true);
      setPageNumber(1);
      const res = await reportsService.fetchTradingSessionDayWise(shopId, date, page, 10);
      setDaywiseData(transformData(res.records));
    } catch (err) {
      console.error("Error fetching daywise trading session data:", err);
      setDaywiseData([]);
    } finally {
      setLoadingDaywise(false);
    }
  };

  // Fetch month data
  const fetchMonth = async (month: string, year: number, page = 1) => {
    if (!month || !year) return;
    try {
      setLoadingMonth(true);
      setPageNumber(1);
      const res = await reportsService.fetchTradingSessionMonth(shopId, month, year, page, 10);
      setMonthData(transformData(res.records));
    } catch (err) {
      console.error("Error fetching month's trading session data:", err);
      setMonthData([]);
    } finally {
      setLoadingMonth(false);
    }
  };

  // Fetch year data
  const fetchYear = async (year: number, page = 1) => {
    if (!year) return;
    try {
      setLoadingYear(true);
      setPageNumber(1);
      const res = await reportsService.fetchTradingSessionYear(shopId, year, page, 10);
      setYearData(transformData(res.records));
    } catch (err) {
      console.error("Error fetching year's trading session data:", err);
      setYearData([]);
    } finally {
      setLoadingYear(false);
    }
  };

  // Export CSV
  const exportCSV = (data: DisplayRow[], tab: string): void => {
    if (!data || data.length === 0) {
      alert("No records to export.");
      return;
    }

    const hasDate = tab === "today" || tab === "daywise" || tab === "month";
    const headers = hasDate
      ? ["Sr No", "Date", "Sessions", "Total Order Count", "Total Amount (Rs.)"]
      : ["Sr No", "Sessions", "Total Order Count", "Total Amount (Rs.)"];

    const rows = [headers.join(",")];
    data.forEach((item, i) => {
      const row = hasDate
        ? [
          i + 1,
          `"${item.date}"`,
          `"${item.session}"`,
          item.orders,
          item.amount.toFixed(2),
        ]
        : [
          i + 1,
          `"${item.session}"`,
          item.orders,
          item.amount.toFixed(2),
        ];
      rows.push(row.join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sales_By_Session_${tab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render table function
  const renderTable = (data: DisplayRow[], hasDate: boolean, loading: boolean) => {
    if (loading) {
      return (
        <tr>
          <td colSpan={hasDate ? 4 : 3} style={{ textAlign: "center", padding: "40px" }}>
            Loading data...
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
        {hasDate && <td className="date-col">{item.date}</td>}
        <td><span className="session-pill">{item.session}</span></td>
        <td>{item.orders}</td>
        <td className="amount-col">₹ {item.amount.toFixed(2)}</td>
      </tr>
    ));
  };

  // Switch tab
  const switchTab = (tab: string, btn: HTMLElement) => {
    setActiveTab(tab);
    setPageNumber(1);

    if (tab === "today") {
      fetchToday();
    } else if (tab === "week") {
      fetchWeek();
    }

    // Update tab buttons
    document.querySelectorAll<HTMLElement>(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Hide all filter panels
    ["today", "daywise", "week", "month", "year"].forEach((t) => {
      const panel = document.getElementById(`filter-${t}`);
      if (panel) panel.style.display = "none";
    });
    const cur = document.getElementById(`filter-${tab}`);
    if (cur) cur.style.display = "block";

    // Show/hide export top row
    const exportTop = document.getElementById("exportTopRow");
    if (exportTop) {
      exportTop.style.display = tab === "today" || tab === "week" ? "flex" : "none";
    }
  };

  // Populate year dropdowns
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    ["m-year", "y-year"].forEach((id) => {
      const sel = document.getElementById(id) as HTMLSelectElement | null;
      if (!sel) return;
      sel.innerHTML = "";
      for (let y = currentYear; y >= currentYear - 9; y--) {
        const o = document.createElement("option");
        o.value = String(y);
        o.textContent = String(y);
        sel.appendChild(o);
      }
    });

    // Set today's date
    const dayDate = document.getElementById("dw-date") as HTMLInputElement | null;
    if (dayDate) {
      dayDate.value = new Date().toISOString().split("T")[0];
    }

    // Set current month
    const monthSelect = document.getElementById("m-month") as HTMLSelectElement | null;
    if (monthSelect) {
      monthSelect.value = String(new Date().getMonth() + 1).padStart(2, "0");
    }
  }, []);

  // Wire up event listeners
  useEffect(() => {
    // Tab buttons
    const tabConfig: Array<[number, string]> = [
      [0, "today"],
      [1, "daywise"],
      [2, "week"],
      [3, "month"],
      [4, "year"],
    ];
    const tabBtns = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
    const tabHandlers: Array<[HTMLElement, () => void]> = [];

    tabConfig.forEach(([idx, tab]) => {
      const btn = tabBtns[idx];
      if (!btn) return;
      const handler = (): void => switchTab(tab, btn);
      btn.addEventListener("click", handler);
      tabHandlers.push([btn, handler]);
    });

    // Get data buttons
    const daywiseBtn = document.getElementById("dw-getdata");
    const monthBtn = document.getElementById("m-getdata");
    const yearBtn = document.getElementById("y-getdata");

    const onDaywiseClick = () => {
      const dateInput = document.getElementById("dw-date") as HTMLInputElement | null;
      if (dateInput && dateInput.value) {
        fetchDaywise(dateInput.value);
      }
    };

    const onMonthClick = () => {
      const monthSelect = document.getElementById("m-month") as HTMLSelectElement | null;
      const yearSelect = document.getElementById("m-year") as HTMLSelectElement | null;
      if (monthSelect && yearSelect) {
        fetchMonth(monthSelect.value, parseInt(yearSelect.value));
      }
    };

    const onYearClick = () => {
      const yearSelect = document.getElementById("y-year") as HTMLSelectElement | null;
      if (yearSelect) {
        fetchYear(parseInt(yearSelect.value));
      }
    };

    daywiseBtn?.addEventListener("click", onDaywiseClick);
    monthBtn?.addEventListener("click", onMonthClick);
    yearBtn?.addEventListener("click", onYearClick);

    // Export buttons - event delegation
    const exportHandler = (e: Event): void => {
      const target = (e.target as HTMLElement)?.closest(".btn-export");
      if (!target) return;

      const dataMap: Record<string, DisplayRow[]> = {
        today: todayData,
        week: weekData,
        daywise: daywiseData,
        month: monthData,
        year: yearData,
      };
      const tab = activeTab;
      exportCSV(dataMap[tab] || [], tab);
    };
    document.addEventListener("click", exportHandler);

    // Help button
    const helpBtn = document.querySelector<HTMLButtonElement>(".btn-help");
    const onHelpClick = () => {
      alert("Help & Support - Sales by Trading Session");
    };
    helpBtn?.addEventListener("click", onHelpClick);

    // Step navigation
    let currentStep = 4;
    const totalSteps = 26;
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
      tabHandlers.forEach(([el, fn]) => el.removeEventListener("click", fn));
      daywiseBtn?.removeEventListener("click", onDaywiseClick);
      monthBtn?.removeEventListener("click", onMonthClick);
      yearBtn?.removeEventListener("click", onYearClick);
      document.removeEventListener("click", exportHandler);
      helpBtn?.removeEventListener("click", onHelpClick);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, [todayData, weekData, daywiseData, monthData, yearData, activeTab]);

  // Determine if current tab has date column
  const hasDate = activeTab === "today" || activeTab === "daywise" || activeTab === "month";

  // Get current data based on active tab
  const getCurrentData = (): DisplayRow[] => {
    const dataMap: Record<string, DisplayRow[]> = {
      today: todayData,
      week: weekData,
      daywise: daywiseData,
      month: monthData,
      year: yearData,
    };
    return dataMap[activeTab] || [];
  };

  const getLoading = (): boolean => {
    const loadingMap: Record<string, boolean> = {
      today: loadingToday,
      week: loadingWeek,
      daywise: loadingDaywise,
      month: loadingMonth,
      year: loadingYear,
    };
    return loadingMap[activeTab] || false;
  };

  const currentData = getCurrentData();
  const isLoading = getLoading();

  return (
    <div id="pg-reports-sales-by-trading-session">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="app-container">
        <div className="main-content">
          <div className="card">
            {/* Title + Help */}
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Sales by trading session</h1>
              <button className="btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs-row">
              <button className="tab-btn active">Today Sales</button>
              <button className="tab-btn">Day Wise</button>
              <button className="tab-btn">This Week</button>
              <button className="tab-btn">Month Wise Sale</button>
              <button className="tab-btn">Year Wise</button>
            </div>

            {/* TODAY filter area */}
            <div id="filter-today"></div>

            {/* DAY WISE filter area */}
            <div id="filter-daywise" style={{ display: "none" }}>
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Date :</label>
                  <input type="date" id="dw-date" className="filter-input" />
                </div>
                <button className="btn-getdata" id="dw-getdata">GETDATA</button>
                <button className="btn-export">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            </div>

            {/* THIS WEEK filter area */}
            <div id="filter-week" style={{ display: "none" }}></div>

            {/* MONTH WISE filter area */}
            <div id="filter-month" style={{ display: "none" }}>
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Select Month :</label>
                  <select id="m-month" className="filter-input" defaultValue="01">
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Select Year:</label>
                  <select id="m-year" className="filter-input"></select>
                </div>
                <button className="btn-getdata" id="m-getdata">GETDATA</button>
                <button className="btn-export">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            </div>

            {/* YEAR WISE filter area */}
            <div id="filter-year" style={{ display: "none" }}>
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Select Year :</label>
                  <select id="y-year" className="filter-input"></select>
                </div>
                <button className="btn-getdata" id="y-getdata">GETDATA</button>
                <button className="btn-export">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            </div>

            {/* Results */}
            <div id="resultsSection" style={{ display: "block", marginTop: "4px" }}>
              {/* Export top-right for Today & This Week */}
              <div id="exportTopRow" className="export-toprow" style={{ display: "flex" }}>
                <button className="btn-export">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
              <div id="resultsTitle" style={{ display: "block" }}>
                <h3 className="results-title">Description</h3>
              </div>
              <div id="tableWrap">
                <div className="report-table-wrap">
                  {(() => {
                    const totalRecords = currentData.length;


                    const [serverTotalPages] = useState(1);

                    const totalPages = Math.max(serverTotalPages, Math.ceil((totalRecords || 0) / pageSize) || 1);
                    const startIndex = (pageNumber - 1) * pageSize;
                    const paginatedRows = currentData.slice(startIndex, startIndex + pageSize);
                    const endIndex = Math.min(startIndex + pageSize, totalRecords);

                    return (
                      <>
                        <table className="report-table">
                          <thead>
                            <tr>
                              {hasDate && <th>Date</th>}
                              <th>Session</th>
                              <th>Total Orders</th>
                              <th>Total Amount (Rs.)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {renderTable(paginatedRows, hasDate, isLoading)}
                          </tbody>
                        </table>
                        {currentData.length > 0 && !isLoading && (
                          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px', marginTop: '12px' }}>
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
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              Showing {startIndex + 1} to {endIndex} of {totalRecords} entries
                            </div>
                            <ReportPagination
                              currentPage={pageNumber}
                              totalPages={totalPages}
                              onPageChange={(page) => setPageNumber(page)}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="step-footer">
            <button className="btn-prev" id="prevBtn">
              <i className="fas fa-chevron-left" /> PREVIOUS
            </button>
            <div className="step-indicator">
              <span className="step-label">STEP</span>
              <span className="step-value" id="stepValue">4/26</span>
            </div>
            <button className="btn-next" id="nextBtn">
              NEXT <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}