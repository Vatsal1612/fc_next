"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  SalesByCategory,
} from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { fetchWithCache, cacheKey } from "@/utils/reportCache";



/**
 * reports/salesby-category.html → React.
 */
export default function SalesbyCategoryPage() {
  const shopId = useShopId();

  const [categorySales, setCategorySales] = useState<SalesByCategory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [activeTab, setActiveTab] = useState<string>("today");
  const lastFetched = useRef<{ tab: string; shopId: number | null; page: number }>({ tab: "", shopId: null, page: 0 });

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  const [serverTotalRecords, setServerTotalRecords] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    if (activeTab === "today" || activeTab === "this-week") {
      if (
        lastFetched.current.tab === activeTab &&
        lastFetched.current.shopId === shopId &&
        lastFetched.current.page === pageNumber
      ) {
        return;
      }
      lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
      triggerFilterDataFetch(activeTab);
    } else if (hasSearched) {
      triggerFilterDataFetch(activeTab);
    }
  }, [shopId, activeTab, pageNumber, hasSearched]);

  async function triggerFilterDataFetch(type: string) {
    if (!shopId) return;

    if (type === "day-wise") {
      if (!selectedDate) {
        alert("Please select date");
        setLoading(false);
        return;
      }
    }

    if (type === "month") {
      if (!selectedMonth || !selectedYear) {
        alert("Please select Month and Year");
        setLoading(false);
        return;
      }
    }

    if (type === "year") {
      if (!selectedYear) {
        alert("Please select Year");
        setLoading(false);
        return;
      }
    }

    setHasSearched(true);
    setLoading(true);

    const applyRes = (res: { items?: SalesByCategory[]; totalRecords?: number; totalPages?: number } | null, isStale: boolean) => {
      setCategorySales(res?.items || []);
      if (res?.totalRecords !== undefined) setServerTotalRecords(res.totalRecords);
      if (res?.totalPages !== undefined) setServerTotalPages(res.totalPages);
      if (!isStale) setLoading(false);
    };

    try {
      if (type === "today") {
        const key = cacheKey("salesByCategory-today", { shopId, pageNumber, pageSize });
        await fetchWithCache(
          key,
          () => reportsService.getTodaySalesByCategory(shopId, pageNumber, pageSize),
          (res, isStale) => applyRes(res, isStale),
        );
      } else if (type === "day-wise") {
        const key = cacheKey("salesByCategory-daywise", { shopId, selectedDate, pageNumber, pageSize });
        await fetchWithCache(
          key,
          () => reportsService.getDayWiseSalesByCategory(shopId, selectedDate, pageNumber, pageSize),
          (res, isStale) => applyRes(res, isStale),
        );
      } else if (type === "this-week") {
        const key = cacheKey("salesByCategory-week", { shopId, pageNumber, pageSize });
        await fetchWithCache(
          key,
          () => reportsService.getWeekSalesByCategory(shopId, pageNumber, pageSize),
          (res, isStale) => applyRes(res, isStale),
        );
      } else if (type === "month") {
        const key = cacheKey("salesByCategory-month", { shopId, selectedMonth, selectedYear, pageNumber, pageSize });
        await fetchWithCache(
          key,
          () => reportsService.getMonthSalesByCategory(shopId, selectedMonth, selectedYear, pageNumber, pageSize),
          (res, isStale) => applyRes(res, isStale),
        );
      } else if (type === "year") {
        const key = cacheKey("salesByCategory-year", { shopId, selectedYear, pageNumber, pageSize });
        await fetchWithCache(
          key,
          () => reportsService.getYearSalesByCategory(shopId, selectedYear, pageNumber, pageSize),
          (res, isStale) => applyRes(res, isStale),
        );
      }
    } catch {
      setCategorySales([]);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPageNumber(1);
    setCategorySales([]);
    setServerTotalRecords(0);
    setServerTotalPages(1);
    setHasSearched(false);
  };

  const shouldShowResults = activeTab === "today" || activeTab === "this-week" || hasSearched;

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
      let exportItems: SalesByCategory[] = [];

      if (activeTab === "today") {
        exportItems = await reportsService.getExportSalesByCategoryToday(shopId);
      } else if (activeTab === "this-week") {
        exportItems = await reportsService.getExportSalesByCategoryWeek(shopId);
      } else if (activeTab === "day-wise") {
        if (!selectedDate) {
          alert("Please select date");
          setExporting(false);
          return;
        }
        exportItems = await reportsService.getExportSalesByCategoryDayWise(shopId, selectedDate);
      } else if (activeTab === "month") {
        if (!selectedMonth || !selectedYear) {
          alert("Please select Month and Year");
          setExporting(false);
          return;
        }
        exportItems = await reportsService.getExportSalesByCategoryMonth(shopId, selectedMonth, selectedYear);
      } else if (activeTab === "year") {
        if (!selectedYear) {
          alert("Please select Year");
          setExporting(false);
          return;
        }
        const res = await reportsService.getYearSalesByCategory(shopId, selectedYear, 1, serverTotalRecords > 0 ? serverTotalRecords : 100);
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

      const headers = ["Date", "Category Name", "Quantity", "Total Amount (Rs.)"];
      const rows = exportItems.map((item) => [
        item.trans_date ? `${item.trans_date.Day}/${item.trans_date.Month}/${item.trans_date.Year}` : "-",
        item.cate_name || "-",
        Number(item.total_quantity || 0),
        Number(item.total_amount || 0),
      ]);

      const footerRow = [
        "TOTAL",
        "",
        Number(totalQuantity.toFixed(2)),
        Number(totalAmount.toFixed(2)),
      ];

      const reportTitle = `Sales By Category — ${activeTab.toUpperCase()}`;
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
      ws["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 15 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, "Sales By Category");
      XLSX.writeFile(wb, `sales_by_category_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err: any) {
      console.error("Export to Excel error:", err);
      alert("Failed to export data to Excel. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div id="pg-reports-salesby-category">
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
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Sales by Categories</h1>
              <div className="report-header-actions">
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
            </div>

            <div className="filter-row-container">
              <div className="filter-tabs">
                <button
                  className={`btn-sales-filter ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => handleTabChange("today")}
                >
                  Today
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "day-wise" ? "active" : ""}`}
                  onClick={() => handleTabChange("day-wise")}
                >
                  Day Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "this-week" ? "active" : ""}`}
                  onClick={() => handleTabChange("this-week")}
                >
                  This Week
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "month" ? "active" : ""}`}
                  onClick={() => handleTabChange("month")}
                >
                  Month Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "year" ? "active" : ""}`}
                  onClick={() => handleTabChange("year")}
                >
                  Year Wise
                </button>
              </div>

              {(activeTab === "today" || activeTab === "this-week") && (
                <div style={{ marginTop: "16px", marginBottom: "8px" }}>
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
                </div>
              )}
            </div>

            {activeTab === "day-wise" && (
              <div id="day-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Date :</label>
                  <input
                    type="date"
                    className="input-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <button
                  className="btn-action-teal"
                  onClick={() => triggerFilterDataFetch("day-wise")}
                >
                  GET DATA
                </button>
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
              </div>
            )}

            {activeTab === "month" && (
              <div id="month-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Select Month :</label>
                  <select
                    className="input-control"
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
                <div className="input-group">
                  <label>Select Year :</label>
                  <select
                    className="input-control"
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
                <button
                  className="btn-action-teal"
                  onClick={() => triggerFilterDataFetch("month")}
                >
                  GET DATA
                </button>
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
              </div>
            )}

            {activeTab === "year" && (
              <div id="year-wise-panel" className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Select Year :</label>
                  <select
                    className="input-control"
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
                <button
                  className="btn-action-teal"
                  onClick={() => triggerFilterDataFetch("year")}
                >
                  GET DATA
                </button>
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
              </div>
            )}

            {/* Results Section */}
            {shouldShowResults && (
              <div className="results-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", marginTop: "10px" }}>
                  <h3 style={{ fontSize: "17px", color: "#0aa89e", margin: 0, fontWeight: 700 }}>
                    Description
                  </h3>
                </div>

                {(() => {
                  const isServerPaginated = activeTab === "year" && categorySales.length <= pageSize && serverTotalRecords > categorySales.length;
                  const totalCount = isServerPaginated ? (serverTotalRecords || categorySales.length) : categorySales.length;
                  const calculatedTotalPages = isServerPaginated ? serverTotalPages : Math.max(1, Math.ceil(totalCount / pageSize));
                  const paginatedCategories = isServerPaginated
                    ? categorySales
                    : categorySales.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

                  return (
                    <ReportTableState loading={loading} hasData={categorySales.length > 0} columns={4}>
                      <div className="items-table-wrapper">
                        <table className="items-table">
                          <thead id="table-header-root">
                            <tr>
                              <th style={{ width: "20%" }}>Date</th>
                              <th style={{ width: "30%" }}>Category Name</th>
                              <th style={{ width: "25%" }}>Quantity</th>
                              <th style={{ width: "25%" }}>Total Amount (Rs.)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                                  Loading data...
                                </td>
                              </tr>
                            ) : paginatedCategories.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                                  No Records Found
                                </td>
                              </tr>
                            ) : (
                              paginatedCategories.map((item: any, index: number) => (
                                <tr key={index}>
                                  <td>
                                    {item.trans_date ? `${item.trans_date.Day}/${item.trans_date.Month}/${item.trans_date.Year}` : "-"}
                                  </td>
                                  <td>{item.cate_name}</td>
                                  <td>{item.total_quantity}</td>
                                  <td>{item.total_amount}</td>
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
                      />
                    </ReportTableState>
                  );
                })()}
              </div>
            )}
          </div>

          <ReportStepFooter currentStepOverride={3} totalStepsOverride={25} />
        </main>
      </div>
    </div>
  );
}

