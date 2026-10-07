// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/sales_by_order_method_report.html → React.
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

// type ReportRow = {
//   date: string;
//   dineIn: number;
//   delivery: number;
//   takeAway: number;
// };

// export default function SalesByOrderMethodReportPage() {
//   useEffect(() => {
//     // ── SAMPLE DATA per month-year key ──
//     const reportData: Record<string, ReportRow[]> = {
//       "6-2026": [
//         { date: "01-06-2026", dineIn: 0.0, delivery: 0.0, takeAway: 54.0 },
//         { date: "02-06-2026", dineIn: 22.0, delivery: 0.0, takeAway: 128.0 },
//         { date: "03-06-2026", dineIn: 0.0, delivery: 85.0, takeAway: 0.0 },
//         { date: "04-06-2026", dineIn: 150.0, delivery: 0.0, takeAway: 220.0 },
//         { date: "05-06-2026", dineIn: 0.0, delivery: 340.0, takeAway: 0.0 },
//       ],
//       "5-2026": [
//         { date: "10-05-2026", dineIn: 180.0, delivery: 95.0, takeAway: 310.0 },
//         { date: "15-05-2026", dineIn: 0.0, delivery: 210.0, takeAway: 85.0 },
//         { date: "20-05-2026", dineIn: 250.0, delivery: 0.0, takeAway: 175.0 },
//         { date: "25-05-2026", dineIn: 90.0, delivery: 145.0, takeAway: 0.0 },
//         { date: "31-05-2026", dineIn: 320.0, delivery: 0.0, takeAway: 260.0 },
//       ],
//       "4-2026": [
//         { date: "05-04-2026", dineIn: 420.0, delivery: 180.0, takeAway: 95.0 },
//         { date: "12-04-2026", dineIn: 110.0, delivery: 0.0, takeAway: 330.0 },
//         { date: "20-04-2026", dineIn: 0.0, delivery: 260.0, takeAway: 140.0 },
//       ],
//     };

//     const fmt = (val: number): string => val.toFixed(2);

//     const setText = (id: string, text: string): void => {
//       const el = document.getElementById(id);
//       if (el) el.textContent = text;
//     };

//     const getSelectValue = (id: string): string =>
//       (document.getElementById(id) as HTMLSelectElement | null)?.value ?? "";

//     function updateReportBase(): void {
//       const month = getSelectValue("sel-month");
//       const year = getSelectValue("sel-year");
//       const key = month + "-" + year;
//       const rows = reportData[key] || [];

//       const tbody = document.getElementById("table-body");
//       if (!tbody) return;

//       let totDineIn = 0,
//         totDelivery = 0,
//         totTakeAway = 0;

//       if (rows.length === 0) {
//         tbody.innerHTML = `
//                 <tr>
//                     <td colspan="5" class="no-data">
//                         No Data Available
//                     </td>
//                 </tr>
//             `;

//         // Reset totals
//         setText("sum-dinein", "Rs. 0.00");
//         setText("sum-delivery", "Rs. 0.00");
//         setText("sum-takeaway", "Rs. 0.00");
//         setText("sum-grand", "Rs. 0.00");

//         setText("foot-dinein", "0.00");
//         setText("foot-delivery", "0.00");
//         setText("foot-takeaway", "0.00");
//         setText("foot-total", "0.00");

//         return;
//       } else {
//         tbody.innerHTML = rows
//           .map((r) => {
//             const total = r.dineIn + r.delivery + r.takeAway;
//             totDineIn += r.dineIn;
//             totDelivery += r.delivery;
//             totTakeAway += r.takeAway;
//             return `<tr>
//                     <td>${r.date}</td>
//                     <td>${fmt(r.dineIn)}</td>
//                     <td>${fmt(r.delivery)}</td>
//                     <td>${fmt(r.takeAway)}</td>
//                     <td>${fmt(total)}</td>
//                 </tr>`;
//           })
//           .join("");
//       }

//       const grand = totDineIn + totDelivery + totTakeAway;

//       // Update summary
//       setText("sum-dinein", "Rs. " + fmt(totDineIn));
//       setText("sum-delivery", "Rs. " + fmt(totDelivery));
//       setText("sum-takeaway", "Rs. " + fmt(totTakeAway));
//       setText("sum-grand", "Rs. " + fmt(grand));

//       // Update footer totals
//       setText("foot-dinein", fmt(totDineIn));
//       setText("foot-delivery", fmt(totDelivery));
//       setText("foot-takeaway", fmt(totTakeAway));
//       setText("foot-total", fmt(grand));
//     }

//     // ── EXPORT TO EXCEL ──
//     const exportToExcel = (): void => {
//       const month = getSelectValue("sel-month");
//       const year = getSelectValue("sel-year");
//       const key = month + "-" + year;
//       const rows = reportData[key] || [];
//       const sel = document.getElementById("sel-month") as HTMLSelectElement | null;
//       const monthName = sel ? sel.options[sel.selectedIndex].text : "";

//       const XLSX = window.XLSX;
//       if (!XLSX) return;

//       let totDineIn = 0,
//         totDelivery = 0,
//         totTakeAway = 0;

//       const wsData: unknown[][] = [
//         ["Total Sales by Order Method Report"],
//         ["Month: " + monthName + " " + year],
//         [],
//         [
//           "Date",
//           "Dine In (Rs.)",
//           "Home Delivery (Rs.)",
//           "Take Away (Rs.)",
//           "Total (Rs.)",
//         ],
//       ];

//       rows.forEach((r) => {
//         const total = r.dineIn + r.delivery + r.takeAway;
//         totDineIn += r.dineIn;
//         totDelivery += r.delivery;
//         totTakeAway += r.takeAway;
//         wsData.push([
//           r.date,
//           r.dineIn.toFixed(2),
//           r.delivery.toFixed(2),
//           r.takeAway.toFixed(2),
//           total.toFixed(2),
//         ]);
//       });

//       const grand = totDineIn + totDelivery + totTakeAway;
//       wsData.push([]);
//       wsData.push([
//         "Total",
//         totDineIn.toFixed(2),
//         totDelivery.toFixed(2),
//         totTakeAway.toFixed(2),
//         grand.toFixed(2),
//       ]);
//       wsData.push([]);
//       wsData.push(["Summary"]);
//       wsData.push(["Total Dine In Sales", "Rs. " + totDineIn.toFixed(2)]);
//       wsData.push(["Total Home Delivery Sales", "Rs. " + totDelivery.toFixed(2)]);
//       wsData.push(["Total Take Away Sales", "Rs. " + totTakeAway.toFixed(2)]);
//       wsData.push(["Grand Total Sales", "Rs. " + grand.toFixed(2)]);

//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);

//       ws["!cols"] = [
//         { wch: 16 },
//         { wch: 16 },
//         { wch: 22 },
//         { wch: 18 },
//         { wch: 14 },
//       ];

//       XLSX.utils.book_append_sheet(wb, ws, "Sales By Order Method");

//       const today = new Date();
//       const dateStr =
//         today.getFullYear() +
//         "-" +
//         String(today.getMonth() + 1).padStart(2, "0") +
//         "-" +
//         String(today.getDate()).padStart(2, "0");

//       XLSX.writeFile(
//         wb,
//         "Sales_By_Order_Method_" + monthName + "_" + year + "_" + dateStr + ".xlsx"
//       );
//     };

//     // ── STEP NAVIGATION (Month Navigator) ──
//     const months = [
//       { val: "1", label: "January" },
//       { val: "2", label: "February" },
//       { val: "3", label: "March" },
//       { val: "4", label: "April" },
//       { val: "5", label: "May" },
//       { val: "6", label: "June" },
//       { val: "7", label: "July" },
//       { val: "8", label: "August" },
//       { val: "9", label: "September" },
//       { val: "10", label: "October" },
//       { val: "11", label: "November" },
//       { val: "12", label: "December" },
//     ];
//     const totalMonthSteps = months.length;

//     const getCurrentMonthStep = (): number => {
//       const val = getSelectValue("sel-month");
//       return months.findIndex((m) => m.val === val);
//     };

//     const updateStepBadge = (): void => {
//       const idx = getCurrentMonthStep();
//       setText("stepValue", idx + 1 + "/" + totalMonthSteps);
//     };

//     // updateReport patched to also refresh step badge (matches original)
//     const updateReport = (): void => {
//       updateReportBase();
//       updateStepBadge();
//     };

//     const navigateMonth = (dir: number): void => {
//       let idx = getCurrentMonthStep();
//       idx = Math.max(0, Math.min(totalMonthSteps - 1, idx + dir));
//       const sel = document.getElementById("sel-month") as HTMLSelectElement | null;
//       if (sel) sel.value = months[idx].val;
//       updateStepBadge();
//       updateReport();
//     };

//     // ── Wire listeners (formerly inline on* attributes) ──
//     const selMonth = document.getElementById("sel-month");
//     const selYear = document.getElementById("sel-year");
//     const onChange = (): void => updateReport();
//     selMonth?.addEventListener("change", onChange);
//     selYear?.addEventListener("change", onChange);

//     const exportBtn = document.querySelector<HTMLButtonElement>(".btn-export");
//     exportBtn?.addEventListener("click", exportToExcel);

//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const onPrev = (): void => navigateMonth(-1);
//     const onNext = (): void => navigateMonth(1);
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     // ── Initial render ──
//     updateReport();
//     updateStepBadge();

//     return () => {
//       selMonth?.removeEventListener("change", onChange);
//       selYear?.removeEventListener("change", onChange);
//       exportBtn?.removeEventListener("click", exportToExcel);
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-sales-by-order-method-report">
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       {/* ── HEADER ── */}

//       {/* ── APP CONTAINER ── */}
//       <div className="app-container">
//         {/* Outer Sidebar */}

//         {/* Inner Sidebar */}

//         {/* ── MAIN CONTENT ── */}
//         <div className="main-content">
//           <div className="report-card">
//             {/* <div class="report-title">Total Sales by Order Method Reports</div> */}
//             <div className="report-header">
//               <div className="typ-page-heading report-title">
//                 Total Sales by Order Method Reports
//               </div>

//               <button className="action-btn action-btn-help">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10"></circle>
//                   <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
//                   <line x1="12" y1="17" x2="12.01" y2="17"></line>
//                 </svg>
//                 HELP
//               </button>
//             </div>
//             {/* Controls Row */}
//             <div className="controls-row">
//               <div className="controls-left">
//                 <div className="filter-group">
//                   <label>Select Month:</label>
//                   <select id="sel-month" defaultValue="6">
//                     <option value="1">January</option>
//                     <option value="2">February</option>
//                     <option value="3">March</option>
//                     <option value="4">April</option>
//                     <option value="5">May</option>
//                     <option value="6">June</option>
//                     <option value="7">July</option>
//                     <option value="8">August</option>
//                     <option value="9">September</option>
//                     <option value="10">October</option>
//                     <option value="11">November</option>
//                     <option value="12">December</option>
//                   </select>
//                 </div>
//                 <div className="filter-group">
//                   <label>Select Year:</label>
//                   <select id="sel-year" defaultValue="2026">
//                     <option value="2024">2024</option>
//                     <option value="2025">2025</option>
//                     <option value="2026">2026</option>
//                   </select>
//                 </div>
//               </div>
//               <button className="btn-export">
//                 <i className="fas fa-file-excel"></i> Export to Excel
//               </button>
//             </div>

//             {/* Summary Card */}
//             <div className="summary-card">
//               <div className="summary-title">Total Monthly Sales</div>
//               <div className="summary-row">
//                 <span className="summary-label">Total Dine In Sales:</span>
//                 <span className="summary-value" id="sum-dinein">
//                   Rs. 0.00
//                 </span>
//               </div>
//               <div className="summary-row">
//                 <span className="summary-label">Total Home Delivery Sales:</span>
//                 <span className="summary-value" id="sum-delivery">
//                   Rs. 0.00
//                 </span>
//               </div>
//               <div className="summary-row">
//                 <span className="summary-label">Total Take Away Sales:</span>
//                 <span className="summary-value" id="sum-takeaway">
//                   Rs. 0.00
//                 </span>
//               </div>
//               <div className="summary-row grand">
//                 <span className="summary-label grand">Grand Total Sales:</span>
//                 <span className="summary-value grand" id="sum-grand">
//                   Rs. 0.00
//                 </span>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="table-wrapper">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Dine In (Rs.)</th>
//                     <th>Home Delivery (Rs.)</th>
//                     <th>Take Away (Rs.)</th>
//                     <th>Total (Rs.)</th>
//                   </tr>
//                 </thead>
//                 <tbody id="table-body"></tbody>
//                 <tfoot>
//                   <tr className="totals-row">
//                     <td>
//                       <strong>Total</strong>
//                     </td>
//                     <td id="foot-dinein">0.00</td>
//                     <td id="foot-delivery">0.00</td>
//                     <td id="foot-takeaway">0.00</td>
//                     <td id="foot-total">0.00</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>
//           {/* Step Navigation */}
//           <div className="step-nav">
//             <button className="nav-btn" id="prevBtn">
//               <i className="fas fa-chevron-left"></i> PREVIOUS
//             </button>
//             <div className="step-badge">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 1/12
//               </span>
//             </div>
//             <button className="nav-btn" id="nextBtn">
//               NEXT <i className="fas fa-chevron-right"></i>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  type OrderMethodRecord,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

declare global {
  interface Window {
    XLSX?: {
      utils: {
        book_new(): unknown;
        aoa_to_sheet(data: unknown[][]): { [k: string]: unknown };
        book_append_sheet(
          wb: unknown,
          ws: { [k: string]: unknown },
          name: string,
        ): void;
      };
      writeFile(wb: unknown, name: string): void;
    };
  }
}

type ReportRow = {
  date: string;
  dineIn: number;
  delivery: number;
  takeAway: number;
};

const MONTHS = [
  { val: "1", label: "January" },
  { val: "2", label: "February" },
  { val: "3", label: "March" },
  { val: "4", label: "April" },
  { val: "5", label: "May" },
  { val: "6", label: "June" },
  { val: "7", label: "July" },
  { val: "8", label: "August" },
  { val: "9", label: "September" },
  { val: "10", label: "October" },
  { val: "11", label: "November" },
  { val: "12", label: "December" },
];

const fmt = (val: number): string => val.toFixed(2);

// API dates come back as WCF-style "/Date(1784053800000)/" strings.
function parseWcfDate(value: string): Date {
  const match = /\/Date\((\d+)\)\//.exec(value);
  const ms = match ? parseInt(match[1], 10) : Date.now();
  return new Date(ms);
}

function formatDateDMY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function mapToRows(records: OrderMethodRecord[]): ReportRow[] {
  return records.map((r) => ({
    date: formatDateDMY(parseWcfDate(r.order_date.Value)),
    dineIn: r.Dine_In ?? 0,
    delivery: r.Home_Delivery ?? 0,
    takeAway: r.Take_Away ?? 0,
  }));
}

export default function SalesByOrderMethodReportPage() {
  const shopId = useShopId();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchReport = useCallback(async (m: string, y: string) => {
    setLoading(true);
    setError(null);
    setPageNumber(1);
    try {
      const paddedMonth = m.padStart(2, "0");
      const records = await reportsService.getOrderMethodMonthly(
        shopId,
        paddedMonth,
        y,
      );
      setRows(mapToRows(records));
    } catch (err) {
      console.error("Failed to fetch sales by order method report:", err);
      setError("Failed to load report data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(month, year);
  }, [month, year, fetchReport]);

  const totDineIn = rows.reduce((sum, r) => sum + r.dineIn, 0);
  const totDelivery = rows.reduce((sum, r) => sum + r.delivery, 0);
  const totTakeAway = rows.reduce((sum, r) => sum + r.takeAway, 0);
  const grandTotal = totDineIn + totDelivery + totTakeAway;

  const currentStepIndex = MONTHS.findIndex((m) => m.val === month);

  const navigateMonth = (dir: number): void => {
    const idx = Math.max(
      0,
      Math.min(MONTHS.length - 1, currentStepIndex + dir),
    );
    setMonth(MONTHS[idx].val);
  };

  const exportToExcel = (): void => {
    const XLSX = window.XLSX;
    if (!XLSX) return;

    const monthName = MONTHS.find((m) => m.val === month)?.label ?? "";

    const wsData: unknown[][] = [
      ["Total Sales by Order Method Report"],
      ["Month: " + monthName + " " + year],
      [],
      [
        "Date",
        "Dine In (Rs.)",
        "Home Delivery (Rs.)",
        "Take Away (Rs.)",
        "Total (Rs.)",
      ],
    ];

    rows.forEach((r) => {
      const total = r.dineIn + r.delivery + r.takeAway;
      wsData.push([
        r.date,
        r.dineIn.toFixed(2),
        r.delivery.toFixed(2),
        r.takeAway.toFixed(2),
        total.toFixed(2),
      ]);
    });

    wsData.push([]);
    wsData.push([
      "Total",
      totDineIn.toFixed(2),
      totDelivery.toFixed(2),
      totTakeAway.toFixed(2),
      grandTotal.toFixed(2),
    ]);
    wsData.push([]);
    wsData.push(["Summary"]);
    wsData.push(["Total Dine In Sales", "Rs. " + totDineIn.toFixed(2)]);
    wsData.push(["Total Home Delivery Sales", "Rs. " + totDelivery.toFixed(2)]);
    wsData.push(["Total Take Away Sales", "Rs. " + totTakeAway.toFixed(2)]);
    wsData.push(["Grand Total Sales", "Rs. " + grandTotal.toFixed(2)]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sales By Order Method");

    const today = new Date();
    const dateStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    XLSX.writeFile(
      wb,
      "Sales_By_Order_Method_" +
        monthName +
        "_" +
        year +
        "_" +
        dateStr +
        ".xlsx",
    );
  };

  return (
    <div id="pg-reports-sales-by-order-method-report">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      

      <div className="app-container">
        <div className="main-content">
          <div className="report-card">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>
                Total Sales by Order Method Reports
              </h1>

              <button className="action-btn action-btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                HELP
              </button>
            </div>

            {/* Controls Row */}
            <div className="controls-row">
              <div className="controls-left">
                <div className="filter-group">
                  <label>Select Month:</label>
                  <select
                    id="sel-month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.val} value={m.val}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Select Year:</label>
                  <select
                    id="sel-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn-export" onClick={exportToExcel}>
                <i className="fas fa-file-excel"></i> Export to Excel
              </button>
            </div>

            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-title">Total Monthly Sales</div>
              <div className="summary-row">
                <span className="summary-label">Total Dine In Sales:</span>
                <span className="summary-value" id="sum-dinein">
                  Rs. {fmt(totDineIn)}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">
                  Total Home Delivery Sales:
                </span>
                <span className="summary-value" id="sum-delivery">
                  Rs. {fmt(totDelivery)}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Take Away Sales:</span>
                <span className="summary-value" id="sum-takeaway">
                  Rs. {fmt(totTakeAway)}
                </span>
              </div>
              <div className="summary-row grand">
                <span className="summary-label grand">Grand Total Sales:</span>
                <span className="summary-value grand" id="sum-grand">
                  Rs. {fmt(grandTotal)}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Dine In (Rs.)</th>
                    <th>Home Delivery (Rs.)</th>
                    <th>Take Away (Rs.)</th>
                    <th>Total (Rs.)</th>
                  </tr>
                </thead>
                <tbody id="table-body">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="no-data">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? ( 
                    <tr>
                      <td colSpan={5} className="no-data">
                        {error}
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const startIndex = (pageNumber - 1) * pageSize;
                      const paginatedRows = rows.slice(startIndex, startIndex + pageSize);
                      return paginatedRows.map((r, i) => {
                        const total = r.dineIn + r.delivery + r.takeAway;
                        return (
                          <tr key={i}>
                            <td>{r.date}</td>
                            <td>{fmt(r.dineIn)}</td>
                            <td>{fmt(r.delivery)}</td>
                            <td>{fmt(r.takeAway)}</td>
                            <td>{fmt(total)}</td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
              {rows.length > 0 && (
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
                    Showing {(pageNumber - 1) * pageSize + 1} to {Math.min(pageNumber * pageSize, rows.length)} of {rows.length} entries
                  </div>
                  <ReportPagination
                    currentPage={pageNumber}
                    totalPages={Math.ceil(rows.length / pageSize)}
                    onPageChange={(page) => setPageNumber(page)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="step-nav">
            <button
              className="nav-btn"
              id="prevBtn"
              onClick={() => navigateMonth(-1)}
            >
              <i className="fas fa-chevron-left"></i> PREVIOUS
            </button>
            <div className="step-badge">
              <span className="step-label">STEP</span>
              <span className="step-value" id="stepValue">
                {currentStepIndex + 1}/{MONTHS.length}
              </span>
            </div>
            <button
              className="nav-btn"
              id="nextBtn"
              onClick={() => navigateMonth(1)}
            >
              NEXT <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
