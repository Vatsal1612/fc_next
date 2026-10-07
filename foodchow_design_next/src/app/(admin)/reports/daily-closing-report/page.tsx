"use client";

import { useEffect, useState, useRef } from "react";
import "./page.css";
import { reportsService } from "@/api/services/report.service";
import { useShopId, getShopId } from "@/utils/shop";
import ReportPagination from "@/components/shared/ReportPagination";


// ── Actual API shape ──
interface DailyClosingItem {
  delivery_method_name: string;
  total_amount: number;
  total_orders: number;
}

interface DailyClosingResponse {
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  totalAmount?: number;
  dateformat?: string;
  items?: DailyClosingItem[];
}

function ReportResultsView({
  reportData,
  onPageChange,
}: {
  reportData: DailyClosingResponse | null;
  onPageChange?: (page: number) => void;
}) {
  const items = reportData?.items ?? [];
  if (!reportData || items.length === 0) {
    return <p className="no-record">No Record Found</p>;
  }

  const grandTotal = items.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const grandOrders = items.reduce((sum, row) => sum + (row.total_orders ?? 0), 0);

  return (
    <div className="daily-reports-list">
      {/* Summary banner */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          background: "#f0faf9",
          padding: "12px 18px",
          borderRadius: "8px",
          border: "1px solid #B6E5E2",
          marginBottom: "16px",
          fontSize: "14px",
          color: "#333333",
        }}
      >
        <span><strong>Total Records:</strong> {reportData.totalRecords ?? items.length}</span>
        <span><strong>Total Amount:</strong> {grandTotal.toFixed(2)}</span>
        <span><strong>Total Orders:</strong> {grandOrders}</span>
        {reportData.dateformat && <span><strong>Date Format:</strong> {reportData.dateformat}</span>}
      </div>

      {/* Data table */}
      <div className="table-wrap">
        <div
          style={{
            padding: "10px 16px",
            background: "#f0faf9",
            borderBottom: "1px solid #B6E5E2",
            fontWeight: 700,
            color: "#088c83",
            fontSize: "12px",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          SALES BY DELIVERY METHOD
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>DELIVERY METHOD</th>
              <th>TOTAL AMOUNT</th>
              <th>TOTAL ORDERS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td>{row.delivery_method_name || "-"}</td>
                <td>{(row.total_amount ?? 0).toFixed(2)}</td>
                <td>{row.total_orders ?? 0}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: "#f0faf9" }}>
              <td style={{ fontWeight: 700, textAlign: "left", paddingLeft: "24px" }}>Grand Total</td>
              <td style={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</td>
              <td style={{ fontWeight: 700 }}>{grandOrders}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination with margin spacing */}
      <div style={{ marginTop: "24px", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
        <ReportPagination
          currentPage={reportData.currentPage ?? 1}
          totalPages={reportData.totalPages ?? 1}
          totalRecords={reportData.totalRecords ?? items.length}
          pageSize={reportData.pageSize ?? 10}
          onPageChange={onPageChange || (() => { })}
        />
      </div>
    </div>
  );
}


function MonthlyReportView({
  reportData,
  onPageChange,
}: {
  reportData: DailyClosingResponse | null;
  onPageChange?: (page: number) => void;
}) {
  const items = reportData?.items ?? [];
  if (!reportData || items.length === 0) {
    return <p className="no-record">No Record Found</p>;
  }

  const grandTotal = items.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const grandOrders = items.reduce((sum, row) => sum + (row.total_orders ?? 0), 0);

  return (
    <div className="monthly-report-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary banner */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          background: "#f0faf9",
          padding: "12px 18px",
          borderRadius: "8px",
          border: "1px solid #B6E5E2",
          fontSize: "14px",
          color: "#333333",
        }}
      >
        <span><strong>Total Records:</strong> {reportData.totalRecords ?? items.length}</span>
        <span><strong>Total Amount:</strong> {grandTotal.toFixed(2)}</span>
        <span><strong>Total Orders:</strong> {grandOrders}</span>
      </div>

      {/* Data table */}
      <div className="table-wrap">
        <div
          style={{
            padding: "10px 16px",
            background: "#f0faf9",
            borderBottom: "1px solid #B6E5E2",
            fontWeight: 700,
            color: "#088c83",
            fontSize: "12px",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          MONTHLY SALES BY DELIVERY METHOD
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>DELIVERY METHOD</th>
              <th>TOTAL AMOUNT</th>
              <th>TOTAL ORDERS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td>{row.delivery_method_name || "-"}</td>
                <td>{(row.total_amount ?? 0).toFixed(2)}</td>
                <td>{row.total_orders ?? 0}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: "#f0faf9" }}>
              <td style={{ fontWeight: 700, textAlign: "left", paddingLeft: "24px" }}>Grand Total</td>
              <td style={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</td>
              <td style={{ fontWeight: 700 }}>{grandOrders}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination with margin spacing */}
      <div style={{ marginTop: "24px", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
        <ReportPagination
          currentPage={reportData.currentPage ?? 1}
          totalPages={reportData.totalPages ?? 1}
          totalRecords={reportData.totalRecords ?? items.length}
          pageSize={reportData.pageSize ?? 10}
          onPageChange={onPageChange || (() => { })}
        />
      </div>
    </div>
  );
}

export default function DailyClosingReportPage() {
  const shopId = useShopId();
  const [dailyReportData, setDailyReportData] = useState<DailyClosingResponse | null>(null);
  const [monthlyReportData, setMonthlyReportData] = useState<DailyClosingResponse | null>(null);
  const [customReportData, setCustomReportData] = useState<DailyClosingResponse | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );

  const monthlyReportRef = useRef(monthlyReportData);
  monthlyReportRef.current = monthlyReportData;

  const dailyReportRef = useRef(dailyReportData);
  dailyReportRef.current = dailyReportData;

  const selectedMonthRef = useRef(selectedMonth);
  selectedMonthRef.current = selectedMonth;

  const selectedYearRef = useRef(selectedYear);
  selectedYearRef.current = selectedYear;

  const latestMonthRequestRef = useRef<string>("");

  // Extract the standard DailyClosingResponse shape from any API response wrapper
  const extractReportData = (res: any): DailyClosingResponse | null => {
    if (!res) return null;
    // res is already data.data from service — could be the object directly
    if (res && typeof res === "object" && Array.isArray(res.items)) return res as DailyClosingResponse;
    // fallback: try nested data
    if (res?.data && Array.isArray(res.data?.items)) return res.data as DailyClosingResponse;
    if (Array.isArray(res)) return { items: res, totalRecords: res.length };
    return null;
  };

  const loadDailyReport = async (date: string) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    try {
      const res = await reportsService.getDailyClosingReport(Number(activeShopId), date, 1, 10);
      setDailyReportData(extractReportData(res));
      const resultsEl = document.getElementById("results-day");
      if (resultsEl) resultsEl.style.display = "block";
    } catch (error) {
      console.log(error);
      setDailyReportData(null);
      const resultsEl = document.getElementById("results-day");
      if (resultsEl) resultsEl.style.display = "block";
    }
  };

  const loadMonthReport = async (month: string, year: string) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    const formattedMonth = String(month).padStart(2, "0");
    const requestId = `${activeShopId}-${formattedMonth}-${year}-${Date.now()}`;
    latestMonthRequestRef.current = requestId;

    setMonthlyReportData(null);

    try {
      const res = await reportsService.getDailyClosingReportByMonth(Number(activeShopId), formattedMonth, year, 1, 10);
      if (latestMonthRequestRef.current === requestId) {
        setMonthlyReportData(extractReportData(res));
        const resultsEl = document.getElementById("results-month");
        if (resultsEl) resultsEl.style.display = "block";
      } else {
        console.log(`Stale Monthly Report response ignored for ${formattedMonth}/${year}`);
      }
    } catch (error) {
      console.log(error);
      if (latestMonthRequestRef.current === requestId) {
        setMonthlyReportData(null);
        const resultsEl = document.getElementById("results-month");
        if (resultsEl) resultsEl.style.display = "block";
      }
    }
  };

  const loadCustomReport = async (startDate: string, endDate: string) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    try {
      const res = await reportsService.getDailyClosingReportByDate(Number(activeShopId), startDate, endDate, 1, 10);
      setCustomReportData(extractReportData(res));
      const resultsEl = document.getElementById("results-custom");
      if (resultsEl) resultsEl.style.display = "block";
    } catch (error) {
      console.log(error);
      setCustomReportData(null);
      const resultsEl = document.getElementById("results-custom");
      if (resultsEl) resultsEl.style.display = "block";
    }
  };

  useEffect(() => {
    type Tab = "day" | "month" | "custom";

    /* ── Toast ── */
    const showToast = (msg: string, isErr = false): void => {
      const t = document.getElementById("toast");
      if (!t) return;
      t.textContent = msg;
      t.style.background = isErr ? "#ef4444" : "#00a896";
      t.className = "toast show";
      window.setTimeout(() => {
        t.className = "toast";
      }, 3000);
    };

    /* ── Tab switch ── */
    const switchTab = (tab: Tab, btn: HTMLElement): void => {
      document
        .querySelectorAll<HTMLElement>(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll<HTMLElement>(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + tab)?.classList.add("active");
    };

    /* ── Get Data ── */
    const getData = (tab: Tab): void => {
      if (tab === "day") {
        const date =
          (document.getElementById("dayDate") as HTMLInputElement | null)
            ?.value ?? "";

        if (!date) {
          showToast("Please select a date", true);
          return;
        }

        loadDailyReport(date);
        return;
      }
      if (tab === "month") {
        const monthEl = document.getElementById("monthMonth") as HTMLSelectElement | null;
        const yearEl = document.getElementById("monthYear") as HTMLSelectElement | null;
        const m = monthEl?.value || selectedMonthRef.current || "";
        const y = yearEl?.value || selectedYearRef.current || "";

        if (!m || !y) {
          showToast("Please select month and year", true);
          return;
        }

        loadMonthReport(m, y);
        return;
      }
      if (tab === "custom") {
        const from =
          (document.getElementById("customFrom") as HTMLInputElement)?.value ?? "";

        const to =
          (document.getElementById("customTo") as HTMLInputElement)?.value ?? "";

        if (!from || !to) {
          showToast("Please select both dates", true);
          return;
        }

        if (from > to) {
          showToast("From date must be before To date", true);
          return;
        }

        loadCustomReport(from, to);
        return;
      }
    };

    /* ── Export CSV ── */
    const exportCSV = (tab: Tab): void => {
      if (tab === "month") {
        const currentData = monthlyReportRef.current;
        if (!currentData || !currentData.items?.length) {
          showToast("No data to export", true);
          return;
        }
        const rows: (string | number)[][] = [];
        rows.push(["Delivery Method", "Total Amount", "Total Orders"]);
        (currentData.items || []).forEach((row) =>
          rows.push([row.delivery_method_name || "-", row.total_amount ?? 0, row.total_orders ?? 0])
        );
        const grandTotal = (currentData.items || []).reduce((s, r) => s + (r.total_amount ?? 0), 0);
        const grandOrders = (currentData.items || []).reduce((s, r) => s + (r.total_orders ?? 0), 0);
        rows.push(["Grand Total", grandTotal.toFixed(2), grandOrders]);

        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DailyClosingReport_Month.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Export downloaded successfully!");
        return;
      }

      // day / custom tab
      const currentData = tab === "custom"
        ? (window as any).__customReportData
        : dailyReportRef.current;

      if (!currentData || !currentData.items?.length) {
        showToast("No data to export", true);
        return;
      }
      const rows: (string | number)[][] = [];
      rows.push(["Delivery Method", "Total Amount", "Total Orders"]);
      (currentData.items || []).forEach((row: DailyClosingItem) =>
        rows.push([row.delivery_method_name || "-", row.total_amount ?? 0, row.total_orders ?? 0])
      );
      const grandTotal = (currentData.items || []).reduce((s: number, r: DailyClosingItem) => s + (r.total_amount ?? 0), 0);
      const grandOrders = (currentData.items || []).reduce((s: number, r: DailyClosingItem) => s + (r.total_orders ?? 0), 0);
      rows.push(["Grand Total", grandTotal.toFixed(2), grandOrders]);

      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DailyClosingReport_${tab}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded successfully!");
    };

    /* ── Header dropdowns ── */
    const closeAllDropdowns = (): void => {
      document
        .querySelectorAll<HTMLElement>(".hdr-dropdown-menu")
        .forEach((m) => m.classList.remove("show"));
    };
    document.addEventListener("click", closeAllDropdowns);

    /* ── Wire tab buttons ── */
    const tabButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".tabs-row .tab-btn")
    );
    const tabNames: Tab[] = ["day", "month", "custom"];
    const tabHandlers: Array<() => void> = [];
    tabButtons.forEach((btn, idx) => {
      const tab = tabNames[idx];
      const handler = () => switchTab(tab, btn);
      tabHandlers[idx] = handler;
      btn.addEventListener("click", handler);
    });

    /* ── Wire GET DATA / EXPORT buttons ── */
    const wired: Array<[HTMLElement, string, EventListener]> = [];
    const wire = (
      el: HTMLElement | null,
      type: string,
      fn: EventListener
    ): void => {
      if (!el) return;
      el.addEventListener(type, fn);
      wired.push([el, type, fn]);
    };

    (["day", "month", "custom"] as Tab[]).forEach((tab) => {
      const panel = document.getElementById("tab-" + tab);
      if (!panel) return;
      const getBtn = panel.querySelector<HTMLButtonElement>(".btn-getdata");
      const expBtn = panel.querySelector<HTMLButtonElement>(".btn-export");
      wire(getBtn, "click", () => getData(tab));
      wire(expBtn, "click", () => exportCSV(tab));
    });

    /* ── Set today's date by default ── */
    const today = new Date().toISOString().split("T")[0];
    const dayDate = document.getElementById("dayDate") as HTMLInputElement | null;
    if (dayDate && !dayDate.value) dayDate.value = today;
    const customFrom = document.getElementById(
      "customFrom"
    ) as HTMLInputElement | null;
    if (customFrom && !customFrom.value) customFrom.value = today;
    const customTo = document.getElementById(
      "customTo"
    ) as HTMLInputElement | null;
    if (customTo && !customTo.value) customTo.value = today;

    /* ── Step nav ── */
    let currentStep = 6;
    const totalSteps = 26;
    const stepValue = document.getElementById("stepValue");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      document.removeEventListener("click", closeAllDropdowns);
      tabButtons.forEach((btn, idx) =>
        btn.removeEventListener("click", tabHandlers[idx])
      );
      wired.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, []);

  return (
    <div id="pg-reports-daily-closing-report">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ══ APP CONTAINER ══ */}
      <div className="app-container">
        {/* ══ MAIN CONTENT: Daily Closing Report ══ */}
        <div className="main-content">
          <div className="card">
            {/* Title + Help */}
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Daily Closing Report</h1>
              <button className="btn-help-hdr">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>

            {/* Tab buttons */}
            <div className="tabs-row">
              <button className="tab-btn active">Day Wise</button>
              <button className="tab-btn">Month Wise</button>
              <button className="tab-btn">Custom</button>
            </div>

            {/* DAY WISE */}
            <div className="tab-panel active" id="tab-day">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Select Date :</label>
                  <input type="date" id="dayDate" className="filter-input" />
                </div>
                <button className="btn-getdata">GET DATA</button>
                <button className="btn-export">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
              <div className="results-section" id="results-day">
                <ReportResultsView reportData={dailyReportData} />
              </div>
            </div>

            {/* MONTH WISE */}
            <div className="tab-panel" id="tab-month">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Month :</label>
                  <select
                    id="monthMonth"
                    className="filter-input"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">Select Month</option>
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
                  <label className="filter-label">Year :</label>
                  <select
                    id="monthYear"
                    className="filter-input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn-getdata">GET DATA</button>
                <button className="btn-export">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

              <div className="results-section" id="results-month">
                <MonthlyReportView reportData={monthlyReportData} />
              </div>
            </div>

            {/* CUSTOM */}
            <div className="tab-panel" id="tab-custom">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">From Date :</label>
                  <input type="date" id="customFrom" className="filter-input" />
                </div>
                <div className="filter-group">
                  <label className="filter-label">To Date :</label>
                  <input type="date" id="customTo" className="filter-input" />
                </div>
                <button className="btn-getdata">GET DATA</button>
                <button className="btn-export">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

              <div className="results-section" id="results-custom">
                <ReportResultsView reportData={customReportData} />
              </div>
            </div>
          </div>

          <div className="step-footer">
            <button className="btn-prev" id="prevBtn">
              <i className="fas fa-chevron-left" /> PREVIOUS
            </button>
            <div className="step-indicator">
              <span className="step-label">STEP</span>
              <span className="step-value" id="stepValue">
                6/26
              </span>
            </div>
            <button className="btn-next" id="nextBtn">
              NEXT <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="toast" id="toast"></div>
    </div>
  );
}