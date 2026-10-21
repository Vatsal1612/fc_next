"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import {
  reportsService,
  type IngredientRecord,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import "./page.css";

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

type Tab = "today" | "thisweek" | "monthwise" | "yearwise" | "custom";

export default function IngredientsReportsPage() {
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [data, setData] = useState<IngredientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter input states
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(String(now.getFullYear()));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));

  const pad = (n: number) => String(n).padStart(2, "0");
  const toLocalInput = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const [customFrom, setCustomFrom] = useState<string>(toLocalInput(monthAgo));
  const [customTo, setCustomTo] = useState<string>(toLocalInput(now));

  // Available years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  // Clean data helper
  const cleanIngredientRows = (rows: IngredientRecord[]): IngredientRecord[] => {
    return (rows || []).filter(
      (r) =>
        r.item_name &&
        r.item_name.trim() !== "" &&
        (Number(r.total_quantity ?? 0) !== 0 || Number(r.total_amount ?? 0) !== 0)
    );
  };

  // Fetch data function
  const fetchData = useCallback(
    async (tab: Tab) => {
      const activeShop = shopId || Number(sessionStorage.getItem("shop_id")) || 0;
      if (!activeShop) return;

      setHasSearched(true);
      setLoading(true);
      setData([]);

      try {
        let result: IngredientRecord[] = [];
        if (tab === "today") {
          result = await reportsService.getTodayIngredients(activeShop, 1, 500);
        } else if (tab === "thisweek") {
          result = await reportsService.getWeekIngredients(activeShop, 1, 500);
        } else if (tab === "monthwise") {
          result = await reportsService.getMonthIngredients(
            activeShop,
            selectedMonth,
            selectedMonthYear,
            1,
            500
          );
        } else if (tab === "yearwise") {
          result = await reportsService.getYearIngredients(
            activeShop,
            selectedYear,
            1,
            500
          );
        } else if (tab === "custom") {
          if (!customFrom || !customTo) {
            alert("Please select both From and To dates.");
            setLoading(false);
            return;
          }
          result = await reportsService.getCustomIngredients(
            activeShop,
            customFrom,
            customTo,
            1,
            500
          );
        }
        setData(cleanIngredientRows(result));
      } catch (err) {
        console.error(`Error loading ${tab} ingredients:`, err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [shopId, selectedMonth, selectedMonthYear, selectedYear, customFrom, customTo]
  );

  // Auto-fetch for Today and This Week tabs
  useEffect(() => {
    if (!shopId) return;
    if (activeTab === "today" || activeTab === "thisweek") {
      fetchData(activeTab);
    }
  }, [shopId, activeTab, fetchData]);

  // Tab switch handler
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setPageNumber(1);
    if (tab === "today" || tab === "thisweek") {
      setHasSearched(true);
    } else {
      setHasSearched(false);
      setData([]);
    }
  };

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
    const headers = ["Item Name", "Total Quantity", "Total Amount"];
    const wsData: SheetCell[][] = [
      ["Ingredients Report"],
      [],
      headers,
      ...data.map((r) => [
        r.item_name || "",
        parseFloat(Number(r.total_quantity ?? 0).toFixed(2)),
        parseFloat(Number(r.total_amount ?? 0).toFixed(2)),
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Ingredients");
    XLSX.writeFile(
      wb,
      `ingredients_report_${tabToExport}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Client-side pagination
  const totalRecords = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (pageNumber - 1) * pageSize;
  const paginatedRows = data.slice(startIndex, startIndex + pageSize);

  // Render Table / Results
  const renderResults = () => {
    if (loading) {
      return (
        <div className="no-record-wrap">
          <p className="no-record" style={{ textAlign: "center", padding: "40px" }}>
            Loading...
          </p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="table-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Total Quantity</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={3}
                    className="report-no-records"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No Records Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Total Quantity</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r, index) => (
                <tr key={index}>
                  <td>{r.item_name}</td>
                  <td>{Number(r.total_quantity ?? 0).toFixed(2)}</td>
                  <td>{Number(r.total_amount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      </div>
    );
  };

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
                <button
                  type="button"
                  className="btn-help-new"
                  id="helpBtnCard"
                  onClick={() => alert("Help & Support - Ingredients Reports")}
                >
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  HELP
                </button>
              </div>
              <div className="card-title typ-page-heading">Ingredients Reports</div>
              <div className="card-sub">
                View ingredient usage details across different time periods
              </div>

              {/* TABS */}
              <div className="tab-row">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                  id="tab-today"
                  onClick={() => switchTab("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "thisweek" ? "active" : ""}`}
                  id="tab-thisweek"
                  onClick={() => switchTab("thisweek")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "monthwise" ? "active" : ""}`}
                  id="tab-monthwise"
                  onClick={() => switchTab("monthwise")}
                >
                  Month Wise
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "yearwise" ? "active" : ""}`}
                  id="tab-yearwise"
                  onClick={() => switchTab("yearwise")}
                >
                  Year Wise
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
                  id="tab-custom"
                  onClick={() => switchTab("custom")}
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
                        <svg viewBox="0 0 24 24">
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

              {/* THIS WEEK */}
              {activeTab === "thisweek" && (
                <div className="tab-panel active" id="panel-thisweek">
                  <div className="results-section">
                    <div className="results-header">
                      <div className="results-title">Description</div>
                      <button
                        type="button"
                        className="btn-action btn-export"
                        id="btn-export-thisweek"
                        onClick={() => exportToExcel("thisweek")}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        EXPORT TO EXCEL
                      </button>
                    </div>
                    <div id="results-thisweek">{renderResults()}</div>
                  </div>
                </div>
              )}

              {/* MONTH WISE */}
              {activeTab === "monthwise" && (
                <div className="tab-panel active" id="panel-monthwise">
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
                        fetchData("monthwise");
                      }}
                    >
                      GETDATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("monthwise")}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div className="results-section">
                      <div className="results-header">
                        <div className="results-title">Description</div>
                      </div>
                      <div id="results-monthwise">{renderResults()}</div>
                    </div>
                  )}
                </div>
              )}

              {/* YEAR WISE */}
              {activeTab === "yearwise" && (
                <div className="tab-panel active" id="panel-yearwise">
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
                        fetchData("yearwise");
                      }}
                    >
                      GETDATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("yearwise")}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div className="results-section">
                      <div className="results-header">
                        <div className="results-title">Description</div>
                      </div>
                      <div id="results-yearwise">{renderResults()}</div>
                    </div>
                  )}
                </div>
              )}

              {/* CUSTOM */}
              {activeTab === "custom" && (
                <div className="tab-panel active" id="panel-custom">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">From</label>
                      <input
                        type="datetime-local"
                        className="filter-input"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">To</label>
                      <input
                        type="datetime-local"
                        className="filter-input"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => {
                        setPageNumber(1);
                        fetchData("custom");
                      }}
                    >
                      GET DATA
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-export"
                      onClick={() => exportToExcel("custom")}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                  {hasSearched && (
                    <div className="results-section">
                      <div className="results-header">
                        <div className="results-title">Description</div>
                      </div>
                      <div id="results-custom">{renderResults()}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP FOOTER */}
            <ReportStepFooter currentStepOverride={18} totalStepsOverride={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
