"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService, TaxSummaryItem } from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
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

type Tab = "today" | "weekly" | "monthly" | "yearly" | "datewise";
type TaxRow = { taxName: string; amount: number };

export default function TaxSummaryPage() {
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [data, setData] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverTotalRecords, setServerTotalRecords] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  // Form filter states
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(String(now.getFullYear()));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  
  const defaultToDate = now.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const defaultFromDate = thirtyDaysAgo.toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(defaultFromDate);
  const [toDate, setToDate] = useState<string>(defaultToDate);

  // Format tax data from API
  const formatTaxData = (items: TaxSummaryItem[]): TaxRow[] => {
    if (!items || items.length === 0) return [];

    return items.map((item) => ({
      taxName:
        item.taxName ||
        item.tax_name ||
        item.name ||
        item.TaxName ||
        item.tax_type ||
        item.TaxType ||
        "Unknown Tax",
      amount:
        typeof item.amount === "number"
          ? item.amount
          : typeof item.total_amount === "number"
          ? item.total_amount
          : typeof item.totalAmount === "number"
          ? item.totalAmount
          : typeof item.Amount === "number"
          ? item.Amount
          : typeof item.TotalAmount === "number"
          ? item.TotalAmount
          : parseFloat(
              String(
                item.amount ||
                  item.total_amount ||
                  item.totalAmount ||
                  item.Amount ||
                  item.TotalAmount ||
                  0
              )
            ),
    }));
  };

  const calculateTotal = (rows: TaxRow[]): number => {
    return rows.reduce((sum, r) => sum + r.amount, 0);
  };

  // Fetch data based on tab
  const fetchData = useCallback(
    async (tab: Tab, page = pageNumber, size = pageSize) => {
      if (!shopId) return;

      setHasSearched(true);
      setLoading(true);
      setData([]);
      setTotal(0);

      try {
        if (tab === "today") {
          const res = await reportsService.getTaxSummaryToday(shopId, page, size);
          const formattedData = formatTaxData(res.items);
          setData(formattedData);
          setServerTotalRecords(res.totalRecords);
          setServerTotalPages(res.totalPages || 1);
          setTotal(calculateTotal(formattedData));
        } else if (tab === "weekly") {
          const res = await reportsService.getTaxSummaryWeekly(shopId, page, size);
          const formattedData = formatTaxData(res.items);
          setData(formattedData);
          setServerTotalRecords(res.totalRecords);
          setServerTotalPages(res.totalPages || 1);
          setTotal(calculateTotal(formattedData));
        } else if (tab === "monthly") {
          const res = await reportsService.getTaxSummaryMonthly(
            shopId,
            selectedMonth,
            selectedMonthYear,
            page,
            size
          );
          const formattedData = formatTaxData(res.items);
          setData(formattedData);
          setServerTotalRecords(res.totalRecords);
          setServerTotalPages(res.totalPages || 1);
          setTotal(calculateTotal(formattedData));
        } else if (tab === "yearly") {
          const res = await reportsService.getTaxSummaryYearly(
            shopId,
            selectedYear,
            page,
            size
          );
          const formattedData = formatTaxData(res.items);
          setData(formattedData);
          setServerTotalRecords(res.totalRecords);
          setServerTotalPages(res.totalPages || 1);
          setTotal(calculateTotal(formattedData));
        } else if (tab === "datewise") {
          const res = await reportsService.getTaxSummaryDateWise(
            shopId,
            fromDate,
            toDate,
            page,
            size
          );
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
    },
    [
      shopId,
      pageNumber,
      pageSize,
      selectedMonth,
      selectedMonthYear,
      selectedYear,
      fromDate,
      toDate,
    ]
  );

  // Auto-fetch for Today & Weekly tabs when shopId or tab changes
  useEffect(() => {
    if (!shopId) return;
    if (activeTab === "today" || activeTab === "weekly") {
      fetchData(activeTab, pageNumber, pageSize);
    }
  }, [shopId, activeTab, pageNumber, pageSize, fetchData]);

  // Export to Excel
  const exportToExcel = (tab?: Tab) => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
    if (!XLSX) {
      return;
    }

    const tabToExport = tab || activeTab;
    const headers = ["Tax Name", "Total Sales Tax Amount (Rs.)"];
    const wsData: SheetCell[][] = [
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
    XLSX.writeFile(
      wb,
      `tax_summary_${tabToExport}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Switch tab
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setPageNumber(1);
    if (tab === "today" || tab === "weekly") {
      setHasSearched(true);
    } else {
      setHasSearched(false);
      setData([]);
      setTotal(0);
    }
  };

  // Available years list
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  // Render results
  const renderResults = () => {
    const totalRecords = serverTotalRecords;
    const totalPages = serverTotalPages || Math.max(1, Math.ceil(totalRecords / pageSize));

    return (
      <ReportTableState loading={loading} hasData={data.length > 0} columns={2}>
        <div className="total-tax-bar">
          <span className="total-tax-label">Total Tax Amount:</span>
          <span className="total-tax-amount">Rs. {total.toFixed(2)}</span>
        </div>
        <div className="table-card">
          <div className="table-card-header">
            <span>Tax Summary</span>
          </div>
          <div className="table-responsive-box">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tax Name</th>
                  <th>Total Sales Tax Amount(Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="report-no-records"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  data.map((r, index) => (
                    <tr key={index}>
                      <td>{r.taxName}</td>
                      <td>{r.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <ReportTableFooter
              currentPage={pageNumber}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={(page) => setPageNumber(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageNumber(1);
              }}
            />
          )}
        </div>
      </ReportTableState>
    );
  };

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
                <button
                  type="button"
                  className="btn-help-new"
                  onClick={() => alert("Help & Support - Tax Summary")}
                >
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
              <div
                className="tab-row"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => switchTab("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => switchTab("weekly")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
                  onClick={() => switchTab("monthly")}
                >
                  Month Wise
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "yearly" ? "active" : ""}`}
                  onClick={() => switchTab("yearly")}
                >
                  Year Wise
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "datewise" ? "active" : ""}`}
                  onClick={() => switchTab("datewise")}
                >
                  Custom
                </button>
              </div>

              {/* TODAY */}
              {activeTab === "today" && (
                <div className="tab-panel active" id="panel-today">
                  <div className="results-section">
                    <div className="results-header">
                      <div className="results-title">Description</div>
                      <button
                        type="button"
                        className="btn-action btn-export"
                        id="btn-export-today"
                        onClick={() => exportToExcel("today")}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          style={{
                            width: "18px",
                            height: "18px",
                            marginRight: "6px",
                          }}
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        EXPORT TO EXCEL
                      </button>
                    </div>
                    <div id="results-today">{renderResults()}</div>
                  </div>
                </div>
              )}

              {/* WEEKLY */}
              {activeTab === "weekly" && (
                <div className="tab-panel active" id="panel-weekly">
                  <div className="results-section">
                    <div className="results-header">
                      <div className="results-title">Description</div>
                      <button
                        type="button"
                        className="btn-action btn-export"
                        id="btn-export-weekly"
                        onClick={() => exportToExcel("weekly")}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          style={{
                            width: "18px",
                            height: "18px",
                            marginRight: "6px",
                          }}
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        EXPORT TO EXCEL
                      </button>
                    </div>
                    <div id="results-weekly">{renderResults()}</div>
                  </div>
                </div>
              )}

              {/* MONTHLY */}
              {activeTab === "monthly" && (
                <div className="tab-panel active" id="panel-monthly">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">Select Month :</label>
                      <select
                        className="filter-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
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
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => {
                        setPageNumber(1);
                        fetchData("monthly", 1, pageSize);
                      }}
                    >
                      GET DATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("monthly")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        style={{
                          width: "18px",
                          height: "18px",
                          marginRight: "6px",
                        }}
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div id="results-monthly" className="results-section">
                      {renderResults()}
                    </div>
                  )}
                </div>
              )}

              {/* YEARLY */}
              {activeTab === "yearly" && (
                <div className="tab-panel active" id="panel-yearly">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">Select Year :</label>
                      <select
                        className="filter-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => {
                        setPageNumber(1);
                        fetchData("yearly", 1, pageSize);
                      }}
                    >
                      GET DATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("yearly")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        style={{
                          width: "18px",
                          height: "18px",
                          marginRight: "6px",
                        }}
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div id="results-yearly" className="results-section">
                      {renderResults()}
                    </div>
                  )}
                </div>
              )}

              {/* DATE WISE */}
              {activeTab === "datewise" && (
                <div className="tab-panel active" id="panel-datewise">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">From Date:</label>
                      <input
                        type="date"
                        className="filter-input"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">To Date:</label>
                      <input
                        type="date"
                        className="filter-input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => {
                        setPageNumber(1);
                        fetchData("datewise", 1, pageSize);
                      }}
                    >
                      GET DATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("datewise")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        style={{
                          width: "18px",
                          height: "18px",
                          marginRight: "6px",
                        }}
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div id="results-datewise" className="results-section">
                      {renderResults()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP FOOTER */}
            <ReportStepFooter currentStepOverride={19} totalStepsOverride={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
