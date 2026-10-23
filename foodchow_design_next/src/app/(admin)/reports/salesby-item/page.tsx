"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  SalesByItem,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";



// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SalesbyItemPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const shopId = useShopId();
  const lastFetchParamsRef = useRef<string>("");

  const [todaySales, setTodaySales] = useState<SalesByItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return String(new Date().getMonth() + 1).padStart(2, "0");
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return String(new Date().getFullYear());
  });

  // Dynamic Pagination State
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("today");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // Format date helper supporting all trans_date structures
  const formatDate = (transDate: any): string => {
    if (!transDate) return "-";
    const day = transDate.day ?? transDate.Day;
    const month = transDate.month ?? transDate.Month;
    const year = transDate.year ?? transDate.Year;
    if (day !== undefined && month !== undefined && year !== undefined) {
      return `${day}/${month}/${year}`;
    }
    if (transDate.value) {
      const d = new Date(transDate.value);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      }
    }
    return "-";
  };

  async function triggerFilterDataFetch(type: string): Promise<void> {
    setHasSearched(true);
    if (type === "day-wise") {
      if (!selectedDate) {
        alert("Please select a date.");
        return;
      }

      setLoading(true);
      setError(null);
      const targetPage = 1;
      setPageNumber(targetPage);
      const reqKey = `${shopId}-${selectedDate}-${targetPage}-${pageSize}-day-wise`;
      lastFetchParamsRef.current = reqKey;
      try {
        const res = await reportsService.getDayWiseSalesByItems(
          shopId,
          selectedDate,
          targetPage,
          pageSize
        );
        setTodaySales(res.items);
        setTotalRecords(res.totalRecords);
        setTotalPages(res.totalPages || 1);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load day-wise sales data.");
      } finally {
        setLoading(false);
      }
    }

    if (type === "month") {
      if (!selectedMonth || !selectedYear) {
        alert("Please select month and year.");
        return;
      }
      setLoading(true);
      setError(null);
      const targetPage = 1;
      setPageNumber(targetPage);
      const reqKey = `${shopId}-${selectedMonth}-${selectedYear}-${targetPage}-${pageSize}-month`;
      lastFetchParamsRef.current = reqKey;
      try {
        const res = await reportsService.getMonthSalesByItems(
          shopId,
          selectedMonth,
          selectedYear,
          targetPage,
          pageSize
        );
        setTodaySales(res.items);
        setTotalRecords(res.totalRecords);
        setTotalPages(res.totalPages || 1);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load monthly sales data.");
      } finally {
        setLoading(false);
      }
    }

    if (type === "year") {
      if (!selectedYear) {
        alert("Please select a year.");
        return;
      }
      setLoading(true);
      setError(null);
      const targetPage = 1;
      setPageNumber(targetPage);
      const reqKey = `${shopId}-${selectedYear}-${targetPage}-${pageSize}-year`;
      lastFetchParamsRef.current = reqKey;
      try {
        const res = await reportsService.getYearSalesByItems(
          shopId,
          selectedYear,
          targetPage,
          pageSize
        );
        setTodaySales(res.items);
        setTotalRecords(res.totalRecords);
        setTotalPages(res.totalPages || 1);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load yearly sales data.");
      } finally {
        setLoading(false);
      }
    }
  }

  // Dynamic API call for Sales By Items (Today, Day-Wise, This Week, Month-Wise & Year-Wise)
  const loadData = async () => {
    if (!shopId) return;
    if (activeTab === "day-wise" && !selectedDate) return;
    if (activeTab === "month" && (!selectedMonth || !selectedYear)) return;
    if (activeTab === "year" && !selectedYear) return;

    const currentKey =
      activeTab === "today"
        ? `${shopId}-${pageNumber}-${pageSize}-today`
        : activeTab === "day-wise"
          ? `${shopId}-${selectedDate}-${pageNumber}-${pageSize}-day-wise`
          : activeTab === "this-week"
            ? `${shopId}-${pageNumber}-${pageSize}-this-week`
            : activeTab === "month"
              ? `${shopId}-${selectedMonth}-${selectedYear}-${pageNumber}-${pageSize}-month`
              : `${shopId}-${selectedYear}-${pageNumber}-${pageSize}-year`;

    if (lastFetchParamsRef.current === currentKey) {
      return;
    }
    lastFetchParamsRef.current = currentKey;

    setLoading(true);
    setError(null);
    try {
      let res;
      if (activeTab === "today") {
        res = await reportsService.getTodaySalesByItems(
          shopId,
          pageNumber,
          pageSize
        );
      } else if (activeTab === "day-wise") {
        res = await reportsService.getDayWiseSalesByItems(
          shopId,
          selectedDate,
          pageNumber,
          pageSize
        );
      } else if (activeTab === "this-week") {
        res = await reportsService.getWeekSalesByItems(
          shopId,
          pageNumber,
          pageSize
        );
      } else if (activeTab === "month") {
        res = await reportsService.getMonthSalesByItems(
          shopId,
          selectedMonth,
          selectedYear,
          pageNumber,
          pageSize
        );
      } else {
        res = await reportsService.getYearSalesByItems(
          shopId,
          selectedYear,
          pageNumber,
          pageSize
        );
      }

      setTodaySales(res.items);
      setTotalRecords(res.totalRecords);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error(`API Error loading Sales By Items - ${activeTab}:`, err);
      setError(`Failed to fetch Sales By Items for ${activeTab}.`);
      setTodaySales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "today" || activeTab === "this-week") {
      loadData();
    }
  }, [shopId, activeTab, pageNumber, pageSize]);

  const handleTabClick = (filterKey: string) => {
    lastFetchParamsRef.current = "";
    setActiveTab(filterKey);
    setPageNumber(1);
    setTodaySales([]);
    setError(null);

    // Hide all sub-filter panels
    ["day-wise-panel", "month-wise-panel", "year-wise-panel"].forEach((id) => {
      const panel = document.getElementById(id);
      if (panel) panel.style.display = "none";
    });

    if (filterKey === "day-wise") {
      setHasSearched(false);
      const p = document.getElementById("day-wise-panel");
      if (p) p.style.display = "flex";
    } else if (filterKey === "month") {
      setHasSearched(false);
      const p = document.getElementById("month-wise-panel");
      if (p) p.style.display = "flex";
    } else if (filterKey === "year") {
      setHasSearched(false);
      const p = document.getElementById("year-wise-panel");
      if (p) p.style.display = "flex";
    } else {
      setHasSearched(true);
    }
  };

  const exportToExcel = async () => {
    if (exporting) return;
    if (!shopId) {
      alert("Shop ID not available");
      return;
    }

    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert("Excel export library is loading, please try again.");
      return;
    }

    setExporting(true);
    try {
      let exportItems: SalesByItem[] = [];

      if (activeTab === "today") {
        exportItems = await reportsService.getExportSalesByItemsToday(shopId);
      } else if (activeTab === "this-week") {
        exportItems = await reportsService.getExportSalesByItemsWeek(shopId);
      } else if (activeTab === "day-wise") {
        if (!selectedDate) {
          alert("Please select a date.");
          setExporting(false);
          return;
        }
        exportItems = await reportsService.getExportSalesByItemsDayWise(shopId, selectedDate);
      } else if (activeTab === "month") {
        if (!selectedMonth || !selectedYear) {
          alert("Please select month and year.");
          setExporting(false);
          return;
        }
        exportItems = await reportsService.getExportSalesByItemsMonth(shopId, selectedMonth, selectedYear);
      } else if (activeTab === "year") {
        if (!selectedYear) {
          alert("Please select a year.");
          setExporting(false);
          return;
        }
        const res = await reportsService.getYearSalesByItems(shopId, selectedYear, 1, totalRecords > 0 ? totalRecords : 100);
        exportItems = res.items || [];
      }

      if (!exportItems || exportItems.length === 0) {
        alert("No data available to export");
        return;
      }

      const totalQuantity = exportItems.reduce(
        (sum, item) => sum + Number(item.total_quantity || 0),
        0
      );
      const totalAmount = exportItems.reduce(
        (sum, item) => sum + Number(item.total_amount || 0),
        0
      );

      const headers = ["Date", "Item Name", "Quantity", `Total Amount (${currencySymbol})`];
      const rows = exportItems.map((item) => [
        formatDate(item.trans_date),
        item.item_name || "-",
        Number(item.total_quantity || 0),
        Number(item.total_amount || 0),
      ]);

      const footerRow = [
        "TOTAL",
        "",
        Number(totalQuantity.toFixed(2)),
        Number(totalAmount.toFixed(2)),
      ];

      const reportTitle = `Sales By Items — ${activeTab.toUpperCase()}`;
      const wsData = [
        [reportTitle],
        [`Exported On: ${new Date().toLocaleString()}`],
        [`Total Records: ${exportItems.length}`],
        [],
        headers,
        ...rows,
        [],
        footerRow,
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 18 }, { wch: 32 }, { wch: 15 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, "Sales By Items");
      XLSX.writeFile(wb, `sales_by_items_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err: any) {
      console.error("Export to Excel error:", err);
      alert("Failed to export data to Excel. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div id="pg-reports-salesby-item">
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

      <div className="app-container">
        <main className="main-content">
          <div className="content-card">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Sales by Items</h1>
              <button className="btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>

            <div className="filter-row-container">
              <div className="filter-tabs">
                <button
                  className={`btn-sales-filter ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => handleTabClick("today")}
                >
                  Today
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "day-wise" ? "active" : ""}`}
                  onClick={() => handleTabClick("day-wise")}
                >
                  Day Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "this-week" ? "active" : ""}`}
                  onClick={() => handleTabClick("this-week")}
                >
                  This Week
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "month" ? "active" : ""}`}
                  onClick={() => handleTabClick("month")}
                >
                  Month Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "year" ? "active" : ""}`}
                  onClick={() => handleTabClick("year")}
                >
                  Year Wise
                </button>
              </div>

              {(activeTab === "today" || activeTab === "this-week") && (
                <button
                  className="btn-action"
                  onClick={exportToExcel}
                  disabled={loading || exporting}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {exporting ? "EXPORTING..." : "EXPORT TO EXCEL"}
                </button>
              )}
            </div>

            {activeTab === "day-wise" && (
              <div id="day-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    className="input-control"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setPageNumber(1);
                    }}
                  />
                </div>
                <button
                  className="btn-action-teal"
                  onClick={() => {
                    if (!selectedDate) {
                      alert("Please select a date.");
                      return;
                    }
                    triggerFilterDataFetch("day-wise");
                  }}
                >
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel} disabled={loading || exporting}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {exporting ? "EXPORTING..." : "EXPORT TO EXCEL"}
                </button>
              </div>
            )}

            {activeTab === "month" && (
              <div id="month-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Select Month:</label>
                  <select
                    className="input-control"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setPageNumber(1);
                    }}
                  >
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
                <div className="input-group">
                  <label>Select Year:</label>
                  <select
                    className="input-control"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setPageNumber(1);
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-action-teal"
                  onClick={() => triggerFilterDataFetch("month")}
                >
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel} disabled={loading || exporting}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {exporting ? "EXPORTING..." : "EXPORT TO EXCEL"}
                </button>
              </div>
            )}

            {activeTab === "year" && (
              <div id="year-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Select Year:</label>
                  <select
                    className="input-control"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setPageNumber(1);
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-action-teal"
                  onClick={() => triggerFilterDataFetch("year")}
                >
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel} disabled={loading || exporting}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {exporting ? "EXPORTING..." : "EXPORT TO EXCEL"}
                </button>
              </div>
            )}

            {(activeTab === "today" || activeTab === "this-week" || hasSearched) && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", marginTop: "10px" }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      color: "#0aa89e",
                      margin: 0,
                      fontWeight: 700,
                    }}
                  >
                    Description
                  </h3>
                </div>

                {(() => {
                  const isServerPaginated = activeTab === "year" && todaySales.length <= pageSize && totalRecords > todaySales.length;
                  const totalCount = isServerPaginated ? totalRecords : todaySales.length;
                  const calculatedTotalPages = isServerPaginated ? totalPages : Math.max(1, Math.ceil(totalCount / pageSize));
                  const paginatedItems = isServerPaginated
                    ? todaySales
                    : todaySales.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

                  return (
                    <ReportTableState
                      loading={loading}
                      hasData={!error && todaySales.length > 0}
                      emptyMessage={error || "No Record Found"}
                      columns={4}
                    >
                      <div className="items-table-wrapper">
                        <table className="items-table">
                          <thead id="table-header-root">
                            <tr>
                              <th>Date</th>
                              <th>Item Name</th>
                              <th>Quantity</th>
                              <th>Total Amount ({currencySymbol})</th>
                            </tr>
                          </thead>
                          <tbody id="table-body-root">
                            {loading ? (
                              <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                                  Loading data...
                                </td>
                              </tr>
                            ) : paginatedItems.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                                  No Records Found
                                </td>
                              </tr>
                            ) : (
                              paginatedItems.map((item, index) => (
                                <tr key={index}>
                                  <td>{formatDate(item.trans_date)}</td>
                                  <td>{item.item_name || "-"}</td>
                                  <td>{item.total_quantity ?? 0}</td>
                                  <td>{item.total_amount ?? 0}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <ReportTableFooter
                        currentPage={pageNumber}
                        totalPages={calculatedTotalPages}
                        totalRecords={totalCount}
                        pageSize={pageSize}
                        onPageChange={(page) => setPageNumber(page)}
                        onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
                        disabled={loading}
                      />
                    </ReportTableState>
                  );
                })()}
              </>
            )}
          </div>

          <ReportStepFooter currentStepOverride={2} totalStepsOverride={25} />
        </main>
      </div>
    </div>
  );
}

