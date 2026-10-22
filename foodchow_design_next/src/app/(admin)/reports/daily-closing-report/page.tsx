"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService } from "@/api/services/report.service";
import { useShopId, getShopId } from "@/utils/shop";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportStepFooter from "@/components/shared/ReportStepFooter";

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
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: {
  reportData: DailyClosingResponse | null;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const items = reportData?.items ?? [];

  const grandTotal = items.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const grandOrders = items.reduce((sum, row) => sum + (row.total_orders ?? 0), 0);

  return (
    <div className="daily-reports-list">
      {/* Summary banner */}
      {items.length > 0 && (
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
          <span><strong>Total Records:</strong> {reportData?.totalRecords ?? items.length}</span>
          <span><strong>Total Amount:</strong> {grandTotal.toFixed(2)}</span>
          <span><strong>Total Orders:</strong> {grandOrders}</span>
          {reportData?.dateformat && <span><strong>Date Format:</strong> {reportData.dateformat}</span>}
        </div>
      )}

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
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                  No Records Found
                </td>
              </tr>
            ) : (
              items.map((row, i) => (
                <tr key={i}>
                  <td>{row.delivery_method_name || "-"}</td>
                  <td>{(row.total_amount ?? 0).toFixed(2)}</td>
                  <td>{row.total_orders ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700, background: "#f0faf9" }}>
                <td style={{ fontWeight: 700, textAlign: "left", paddingLeft: "24px" }}>Grand Total</td>
                <td style={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</td>
                <td style={{ fontWeight: 700 }}>{grandOrders}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination with margin spacing */}
      {items.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ReportTableFooter
            currentPage={reportData?.currentPage ?? currentPage}
            totalPages={reportData?.totalPages ?? 1}
            totalRecords={reportData?.totalRecords ?? items.length}
            pageSize={pageSize}
            onPageChange={onPageChange || (() => { })}
            onPageSizeChange={onPageSizeChange || (() => { })}
          />
        </div>
      )}
    </div>
  );
}

function MonthlyReportView({
  reportData,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: {
  reportData: DailyClosingResponse | null;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const items = reportData?.items ?? [];

  const grandTotal = items.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const grandOrders = items.reduce((sum, row) => sum + (row.total_orders ?? 0), 0);

  return (
    <div className="monthly-report-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary banner */}
      {items.length > 0 && (
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
          <span><strong>Total Records:</strong> {reportData?.totalRecords ?? items.length}</span>
          <span><strong>Total Amount:</strong> {grandTotal.toFixed(2)}</span>
          <span><strong>Total Orders:</strong> {grandOrders}</span>
        </div>
      )}

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
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                  No Records Found
                </td>
              </tr>
            ) : (
              items.map((row, i) => (
                <tr key={i}>
                  <td>{row.delivery_method_name || "-"}</td>
                  <td>{(row.total_amount ?? 0).toFixed(2)}</td>
                  <td>{row.total_orders ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700, background: "#f0faf9" }}>
                <td style={{ fontWeight: 700, textAlign: "left", paddingLeft: "24px" }}>Grand Total</td>
                <td style={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</td>
                <td style={{ fontWeight: 700 }}>{grandOrders}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination with margin spacing */}
      {items.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ReportTableFooter
            currentPage={reportData?.currentPage ?? currentPage}
            totalPages={reportData?.totalPages ?? 1}
            totalRecords={reportData?.totalRecords ?? items.length}
            pageSize={pageSize}
            onPageChange={onPageChange || (() => { })}
            onPageSizeChange={onPageSizeChange || (() => { })}
          />
        </div>
      )}
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

  const [pageSize, setPageSize] = useState<number>(10);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"day" | "month" | "custom">("day");

  const searchedDayDate = useRef<string>("");
  const searchedMonthData = useRef<{ month: string; year: string }>({ month: "", year: "" });
  const searchedCustomData = useRef<{ from: string; to: string }>({ from: "", to: "" });

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
    let dataObj: any = null;
    if (res && typeof res === "object" && Array.isArray(res.items)) dataObj = { ...res };
    else if (res?.data && Array.isArray(res.data?.items)) dataObj = { ...res.data };
    else if (Array.isArray(res)) dataObj = { items: res, totalRecords: res.length };

    if (!dataObj) return null;

    // Filter out API dummy placeholder rows like { total_records: 0 } or rows with no delivery_method_name
    if (Array.isArray(dataObj.items)) {
      dataObj.items = dataObj.items.filter(
        (it: any) => it && (it.delivery_method_name || it.payment_type || it.payment_method)
      );
    }
    return dataObj as DailyClosingResponse;
  };

  const loadDailyReport = async (date: string, page = 1, size = pageSize) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    searchedDayDate.current = date;
    try {
      const res = await reportsService.getDailyClosingReport(Number(activeShopId), date, page, size);
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

  const loadMonthReport = async (month: string, year: string, page = 1, size = pageSize) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    const formattedMonth = String(month).padStart(2, "0");
    searchedMonthData.current = { month: formattedMonth, year };
    const requestId = `${activeShopId}-${formattedMonth}-${year}-${Date.now()}`;
    latestMonthRequestRef.current = requestId;

    setMonthlyReportData(null);

    try {
      const res = await reportsService.getDailyClosingReportByMonth(Number(activeShopId), formattedMonth, year, page, size);
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

  const loadCustomReport = async (startDate: string, endDate: string, page = 1, size = pageSize) => {
    const activeShopId = getShopId() || shopId;
    if (!activeShopId) {
      console.warn("Daily Closing Report: Dynamic shopId not available yet.");
      return;
    }
    searchedCustomData.current = { from: startDate, to: endDate };
    try {
      const res = await reportsService.getDailyClosingReportByDate(Number(activeShopId), startDate, endDate, page, size);
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

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    if (activeTab === "day" && searchedDayDate.current) {
      loadDailyReport(searchedDayDate.current, newPage, pageSize);
    } else if (activeTab === "month" && searchedMonthData.current.month) {
      loadMonthReport(searchedMonthData.current.month, searchedMonthData.current.year, newPage, pageSize);
    } else if (activeTab === "custom" && searchedCustomData.current.from) {
      loadCustomReport(searchedCustomData.current.from, searchedCustomData.current.to, newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
    if (activeTab === "day" && searchedDayDate.current) {
      loadDailyReport(searchedDayDate.current, 1, newSize);
    } else if (activeTab === "month" && searchedMonthData.current.month) {
      loadMonthReport(searchedMonthData.current.month, searchedMonthData.current.year, 1, newSize);
    } else if (activeTab === "custom" && searchedCustomData.current.from) {
      loadCustomReport(searchedCustomData.current.from, searchedCustomData.current.to, 1, newSize);
    }
  };

  useEffect(() => {
    type Tab = "day" | "month" | "custom";



    /* ── Tab switch ── */
    const switchTab = (tab: Tab, btn: HTMLElement): void => {
      setActiveTab(tab);
      setPageNumber(1);
      document
        .querySelectorAll<HTMLElement>(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll<HTMLElement>(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      // Hide all results sections until GET DATA is clicked on the new tab
      document
        .querySelectorAll<HTMLElement>(".results-section")
        .forEach((r) => (r.style.display = "none"));
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
          alert("Please select a date.");
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
          alert("Please select month and year.");
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
          alert("Please select both dates.");
          return;
        }

        if (from > to) {
          alert("From date must be before To date.");
          return;
        }

        loadCustomReport(from, to);
        return;
      }
    };

    /* ── Export Excel ── */
    const exportCSV = (tab: Tab): void => {
      const XLSX = (window as any).XLSX;
      if (!XLSX) {
        alert("Excel library is loading, please try again.");
        return;
      }

      if (tab === "month") {
        const currentData = monthlyReportRef.current;
        if (!currentData || !currentData.items?.length) {
          alert("No data available to export");
          return;
        }
        const rows: (string | number)[][] = [];
        (currentData.items || []).forEach((row) =>
          rows.push([row.delivery_method_name || "-", Number(row.total_amount ?? 0), Number(row.total_orders ?? 0)])
        );
        const grandTotal = (currentData.items || []).reduce((s, r) => s + (r.total_amount ?? 0), 0);
        const grandOrders = (currentData.items || []).reduce((s, r) => s + (r.total_orders ?? 0), 0);
        rows.push(["Grand Total", parseFloat(grandTotal.toFixed(2)), grandOrders]);

        const headers = ["Delivery Method", "Total Amount (Rs.)", "Total Orders"];
        const wsData = [
          ["Daily Closing Report — Month Wise"],
          [`Exported On: ${new Date().toLocaleString()}`],
          [],
          headers,
          ...rows,
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, ws, "Daily Closing");
        XLSX.writeFile(wb, `DailyClosingReport_Month_${new Date().toISOString().split("T")[0]}.xlsx`);
        return;
      }

      // day / custom tab
      const currentData = tab === "custom"
        ? (window as any).__customReportData
        : dailyReportRef.current;

      if (!currentData || !currentData.items?.length) {
        alert("No data available to export");
        return;
      }
      const rows: (string | number)[][] = [];
      (currentData.items || []).forEach((row: DailyClosingItem) =>
        rows.push([row.delivery_method_name || "-", Number(row.total_amount ?? 0), Number(row.total_orders ?? 0)])
      );
      const grandTotal = (currentData.items || []).reduce((s: number, r: DailyClosingItem) => s + (r.total_amount ?? 0), 0);
      const grandOrders = (currentData.items || []).reduce((s: number, r: DailyClosingItem) => s + (r.total_orders ?? 0), 0);
      rows.push(["Grand Total", parseFloat(grandTotal.toFixed(2)), grandOrders]);

      const headers = ["Delivery Method", "Total Amount (Rs.)", "Total Orders"];
      const wsData = [
        [`Daily Closing Report — ${tab.toUpperCase()}`],
        [`Exported On: ${new Date().toLocaleString()}`],
        [],
        headers,
        ...rows,
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, "Daily Closing");
      XLSX.writeFile(wb, `DailyClosingReport_${tab}_${new Date().toISOString().split("T")[0]}.xlsx`);
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

    return () => {
      document.removeEventListener("click", closeAllDropdowns);
      tabButtons.forEach((btn, idx) =>
        btn.removeEventListener("click", tabHandlers[idx])
      );
      wired.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
    };
  }, []);

  return (
    <div id="pg-reports-daily-closing-report">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
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
                <button className="btn-action btn-export">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
              <div className="results-section" id="results-day">
                <ReportResultsView
                  reportData={dailyReportData}
                  currentPage={pageNumber}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
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
                <button className="btn-action btn-export">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

              <div className="results-section" id="results-month">
                <MonthlyReportView
                  reportData={monthlyReportData}
                  currentPage={pageNumber}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
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
                <button className="btn-action btn-export">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

              <div className="results-section" id="results-custom">
                <ReportResultsView
                  reportData={customReportData}
                  currentPage={pageNumber}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </div>

          <ReportStepFooter currentStepOverride={6} totalStepsOverride={25} />
        </div>
      </div>

    </div>
  );
}
