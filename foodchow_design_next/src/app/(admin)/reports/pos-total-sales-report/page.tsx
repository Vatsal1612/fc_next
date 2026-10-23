"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Script from "next/script";
import { reportsService } from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";
import "./page.css";

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

type Period = "today" | "weekly" | "monthly" | "yearly" | "datewise";
type Row = { method: string; orders: number; amount: number };

export default function PosTotalSalesReportPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const shopId = useShopId();
  const [period, setPeriod] = useState<Period>("today");
  const [rows, setRows] = useState<Row[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  const currentYearNum = new Date().getFullYear();
  const currentYearStr = String(currentYearNum);
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYearNum - i);

  // Month & Year states
  const [selMonth, setSelMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selYearM, setSelYearM] = useState<string>(currentYearStr);
  const [selYearY, setSelYearY] = useState<string>(currentYearStr);

  // Date Wise states
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // In-memory cache for fast instant filter switching
  const cacheRef = useRef<Map<string, { rows: Row[]; totalAmount: number; totalOrders: number }>>(new Map());

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateFrom(today);
    setDateTo(today);
  }, []);

  const handleTabChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setPageNumber(1);
    setRows([]);
    setTotalAmount(0);
    setTotalOrders(0);
    if (newPeriod === "today" || newPeriod === "weekly") {
      setHasSearched(true);
      loadPeriodData(newPeriod);
    } else {
      setHasSearched(false);
    }
  };

  const loadPeriodData = useCallback(async (selectedPeriod: Period) => {
    setPageNumber(1);

    const cacheKey = `${selectedPeriod}_${shopId}_${selMonth}_${selYearM}_${selYearY}_${dateFrom}_${dateTo}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setRows(cached.rows);
      setTotalAmount(cached.totalAmount);
      setTotalOrders(cached.totalOrders);
      return;
    }

    setLoading(true);
    try {
      let result: any[] = [];
      if (selectedPeriod === "today") {
        result = await reportsService.getPosTotalSalesToday(shopId);
      } else if (selectedPeriod === "weekly") {
        result = await reportsService.getPosTotalSalesWeek(shopId);
      } else if (selectedPeriod === "monthly") {
        result = await reportsService.getPosTotalSalesMonth(shopId, selMonth, selYearM);
      } else if (selectedPeriod === "yearly") {
        result = await reportsService.getPosTotalSalesYear(shopId, selYearY);
      } else if (selectedPeriod === "datewise") {
        result = await reportsService.getPosTotalSalesDateWise(shopId, dateFrom, dateTo);
      }

      if (Array.isArray(result) && result.length > 0) {
        const formattedRows: Row[] = result.map((item) => ({
          method: item.delivery_method_name || item.delivery_method || item.method || "Unknown",
          orders: item.total_orders || item.orders || 0,
          amount: item.total_amount || item.amount || 0,
        }));

        const tAmt = formattedRows.reduce((sum, item) => sum + item.amount, 0);
        const tOrd = formattedRows.reduce((sum, item) => sum + item.orders, 0);

        setRows(formattedRows);
        setTotalAmount(tAmt);
        setTotalOrders(tOrd);

        cacheRef.current.set(cacheKey, {
          rows: formattedRows,
          totalAmount: tAmt,
          totalOrders: tOrd,
        });
      } else {
        setRows([]);
        setTotalAmount(0);
        setTotalOrders(0);
        cacheRef.current.set(cacheKey, {
          rows: [],
          totalAmount: 0,
          totalOrders: 0,
        });
      }
    } catch (err) {
      console.error(`Error loading POS total sales for ${selectedPeriod}:`, err);
      setRows([]);
      setTotalAmount(0);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  }, [shopId, selMonth, selYearM, selYearY, dateFrom, dateTo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (shopId && (period === "today" || period === "weekly")) {
      loadPeriodData(period);
    }
  }, [shopId, period]);

  const exportExcel = (): void => {
    if (!rows.length) {
      alert("No data available to export");
      return;
    }
    const XLSX = window.XLSX;
    if (!XLSX) return;
    const label = period.charAt(0).toUpperCase() + period.slice(1);
    const wb = XLSX.utils.book_new();
    const wsData: unknown[][] = [
      [`POS Total Sales Reports — ${label}`],
      [],
      ["Delivery Method", "Total Orders", `Total Sales Amount (${currencySymbol})`],
      ...rows.map((r) => [
        r.method,
        r.orders,
        parseFloat(r.amount.toFixed(2)),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    (ws as { [k: string]: unknown })["!cols"] = [
      { wch: 22 },
      { wch: 16 },
      { wch: 26 },
    ];
    (ws as { [k: string]: unknown })["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "POS Sales Report");
    XLSX.writeFile(wb, `pos_total_sales_${period}.xlsx`);
  };

  const totalRecords = rows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <div id="pg-reports-pos-total-sales-report">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-top-row">
                <div className="typ-page-heading card-title">POS Total Sales Reports</div>
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              {/* Filter tabs row */}
              <div className="filter-row">
                <button
                  className={`period-btn ${period === "today" ? "active" : ""}`}
                  onClick={() => handleTabChange("today")}
                >
                  Today
                </button>
                <button
                  className={`period-btn ${period === "weekly" ? "active" : ""}`}
                  onClick={() => handleTabChange("weekly")}
                >
                  This Week
                </button>
                <button
                  className={`period-btn ${period === "monthly" ? "active" : ""}`}
                  onClick={() => handleTabChange("monthly")}
                >
                  Month Wise
                </button>
                <button
                  className={`period-btn ${period === "yearly" ? "active" : ""}`}
                  onClick={() => handleTabChange("yearly")}
                >
                  Year Wise
                </button>
                <button
                  className={`period-btn ${period === "datewise" ? "active" : ""}`}
                  onClick={() => handleTabChange("datewise")}
                >
                  Custom
                </button>
              </div>

              {/* Action buttons for Today and Weekly */}
              {(period === "today" || period === "weekly") && (
                <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                  <button className="btn-action btn-export" onClick={exportExcel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    EXPORT TO EXCEL
                  </button>
                </div>
              )}

            {/* Monthly filters */}
            {period === "monthly" && (
              <div className="date-controls visible" id="ctrl-monthly" style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "16px" }}>
                <div className="filter-group">
                  <label className="filter-label">Select Month :</label>
                  <select
                    className="filter-select"
                    value={selMonth}
                    onChange={(e) => setSelMonth(e.target.value)}
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
                    value={selYearM}
                    onChange={(e) => setSelYearM(e.target.value)}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn-apply" onClick={() => { setHasSearched(true); loadPeriodData("monthly"); }}>GET DATA</button>
                <button className="btn-action btn-export" onClick={exportExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {/* Yearly filters */}
            {period === "yearly" && (
              <div className="date-controls visible" id="ctrl-yearly" style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "16px" }}>
                <div className="filter-group">
                  <label className="filter-label">Select Year :</label>
                  <select
                    className="filter-select"
                    value={selYearY}
                    onChange={(e) => setSelYearY(e.target.value)}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn-apply" onClick={() => { setHasSearched(true); loadPeriodData("yearly"); }}>GET DATA</button>
                <button className="btn-action btn-export" onClick={exportExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {/* Date Wise filters */}
            {period === "datewise" && (
              <div className="date-controls visible" id="ctrl-datewise" style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "16px" }}>
                <div className="filter-group">
                  <label className="filter-label">From Date:</label>
                  <input
                    type="date"
                    className="filter-date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">To Date:</label>
                  <input
                    type="date"
                    className="filter-date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <button className="btn-apply" onClick={() => { setHasSearched(true); loadPeriodData("datewise"); }}>GET DATA</button>
                <button className="btn-action btn-export" onClick={exportExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {/* Results Section - only shown when searched or auto-loaded */}
            {(period === "today" || period === "weekly" || hasSearched) && (
              <div className="results-section" style={{ display: "block" }}>
                {/* Summary */}
                <div className="summary-stats">
                  <div className="stat-line">
                    Total Sales Amount: Rs. <span>{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="stat-line">
                    Total Orders: <span>{totalOrders}</span>
                  </div>
                </div>

                {/* Table */}
                <div className="table-card">
                  <div className="table-card-header">
                    <span>Sales Breakdown</span>
                  </div>
                  <ReportTableState loading={loading} hasData={paginatedRows.length > 0} columns={3}>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Delivery Method</th>
                            <th>Total Orders</th>
                            <th>Total Sales Amount ({currencySymbol})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                                Loading data...
                              </td>
                            </tr>
                          ) : paginatedRows.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                                No Records Found
                              </td>
                            </tr>
                          ) : (
                            paginatedRows.map((r, i) => (
                              <tr key={i}>
                                <td>{r.method}</td>
                                <td>{r.orders}</td>
                                <td>{r.amount.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      <ReportTableFooter
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        totalRecords={totalRecords}
                        pageSize={pageSize}
                        onPageChange={(page) => setPageNumber(page)}
                        onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
                      />
                    </div>
                  </ReportTableState>
                </div>
              </div>
            )}
          </div>

          {/* STEP FOOTER */}
          <ReportStepFooter currentStepOverride={17} totalStepsOverride={25} />
        </div>
      </div>
    </div>
  </div>
);
}
