"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { reportsService } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";
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
  const shopId = useShopId();
  const [period, setPeriod] = useState<Period>("today");
  const [rows, setRows] = useState<Row[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateFrom(today);
    setDateTo(today);
  }, []);

  const loadPeriodData = useCallback(async (selectedPeriod: Period) => {
    setLoading(true);
    setPageNumber(1);
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

        setRows(formattedRows);
        setTotalAmount(formattedRows.reduce((sum, item) => sum + item.amount, 0));
        setTotalOrders(formattedRows.reduce((sum, item) => sum + item.orders, 0));
      } else {
        setRows([]);
        setTotalAmount(0);
        setTotalOrders(0);
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
      alert("No data to export. Please select a period with data.");
      return;
    }
    const XLSX = window.XLSX;
    if (!XLSX) return;
    const label = period.charAt(0).toUpperCase() + period.slice(1);
    const wb = XLSX.utils.book_new();
    const wsData: unknown[][] = [
      [`POS Total Sales Reports — ${label}`],
      [],
      ["Delivery Method", "Total Orders", "Total Sales Amount (Rs.)"],
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
  const endIndex = Math.min(startIndex + pageSize, totalRecords);

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
                <div className="filter-tabs">
                  <button
                    className={`period-btn ${period === "today" ? "active" : ""}`}
                    onClick={() => { setPeriod("today"); setRows([]); }}
                  >
                    Today
                  </button>
                  <button
                    className={`period-btn ${period === "weekly" ? "active" : ""}`}
                    onClick={() => { setPeriod("weekly"); setRows([]); }}
                  >
                    Weekly
                  </button>
                  <button
                    className={`period-btn ${period === "monthly" ? "active" : ""}`}
                    onClick={() => { setPeriod("monthly"); setRows([]); }}
                  >
                    Monthly
                  </button>
                  <button
                    className={`period-btn ${period === "yearly" ? "active" : ""}`}
                    onClick={() => { setPeriod("yearly"); setRows([]); }}
                  >
                    Yearly
                  </button>
                  <button
                    className={`period-btn ${period === "datewise" ? "active" : ""}`}
                    onClick={() => { setPeriod("datewise"); setRows([]); }}
                  >
                    Date Wise
                  </button>
                </div>
                {/* Top GET DATA button removed to avoid confusion; each section has its own or auto-loads */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {rows.length > 0 && (
                    <button className="btn-export" onClick={exportExcel}>
                      <i className="fas fa-file-excel"></i> Export to Excel
                    </button>
                  )}
                </div>
              </div>

              {/* Monthly filters */}
              {period === "monthly" && (
                <div className="date-controls visible" id="ctrl-monthly">
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
                  <button className="btn-apply" onClick={() => loadPeriodData("monthly")}>GET DATA</button>
                </div>
              )}

              {/* Yearly filters */}
              {period === "yearly" && (
                <div className="date-controls visible" id="ctrl-yearly">
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
                  <button className="btn-apply" onClick={() => loadPeriodData("yearly")}>GET DATA</button>
                </div>
              )}

              {/* Date Wise filters */}
              {period === "datewise" && (
                <div className="date-controls visible" id="ctrl-datewise">
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
                  <button className="btn-apply" onClick={() => loadPeriodData("datewise")}>APPLY</button>
                </div>
              )}

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
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Delivery Method</th>
                        <th>Total Orders</th>
                        <th>Total Sales Amount(Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={3} className="no-data">Loading...</td></tr>
                      ) : paginatedRows.length === 0 ? (
                        <tr className="no-data"><td colSpan={3}>No Record Found</td></tr>
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
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Showing {rows.length === 0 ? 0 : startIndex + 1} to {endIndex} of {totalRecords} entries
                    </div>
                    <ReportPagination
                      currentPage={pageNumber}
                      totalPages={totalPages}
                      onPageChange={(page) => setPageNumber(page)}
                    />
                  </div>
                </div>
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
                  17/25
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