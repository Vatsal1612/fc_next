"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  WeightedAverageTransaction,
} from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";

export default function WeightedAverageTransactionPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<"today" | "monthly">("today");
  const [todayData, setTodayData] = useState<WeightedAverageTransaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<WeightedAverageTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearchedMonthly, setHasSearchedMonthly] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const loadToday = async () => {
    try {
      setLoading(true);
      const data = await reportsService.fetchTodayWeightedAverage(shopId);
      setTodayData(data);
    } catch (err) {
      console.error(err);
      setTodayData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthly = async () => {
    setHasSearchedMonthly(true);
    try {
      setLoading(true);
      const data = await reportsService.fetchMonthlyWeightedAverage(
        shopId,
        selectedMonth.padStart(2, "0"),
        Number(selectedYear)
      );
      setMonthlyData(data);
    } catch (err) {
      console.error(err);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const lastFetched = useRef<{ tab: string; shopId: number | null }>({ tab: "", shopId: null });

  useEffect(() => {
    if (!shopId) return;
    if (lastFetched.current.tab === activeTab && lastFetched.current.shopId === shopId) return;

    if (activeTab === "today") {
      lastFetched.current = { tab: activeTab, shopId };
      loadToday();
    }
  }, [shopId, activeTab]);

  const currentRows = activeTab === "today" ? todayData : monthlyData;
  const totalRecords = currentRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedRows = currentRows.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const exportToExcel = () => {
    if (!currentRows || currentRows.length === 0) {
      alert("No data available to export");
      return;
    }

    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      return;
    }

    const headers = [
      "Order Type",
      "Total Order Count",
      `Total Amount (${currencySymbol})`,
      `Weighted Average Transaction (${currencySymbol})`,
    ];

    const rows = currentRows.map((r) => {
      const orderType =
        r.delivery_method_name ||
        (r as any).Delivery_Method_Name ||
        (r as any).delivery_method ||
        "-";
      const totalOrders =
        r.total_orders ?? (r as any).Total_Orders ?? 0;
      const totalAmount = Number(
        r.total_amount ?? (r as any).Total_Amount ?? 0
      );
      const weightedAvg = Number(
        r.weighted_average_transaction ??
        (r as any).Weighted_Average_Transaction ??
        (r as any).weighted_average ??
        0
      );
      return [
        orderType,
        totalOrders,
        parseFloat(totalAmount.toFixed(2)),
        parseFloat(weightedAvg.toFixed(2)),
      ];
    });

    const reportTitle = `Weighted Average Transaction — ${activeTab === "today" ? "TODAY" : "MONTHLY"}`;
    const wsData = [
      [reportTitle],
      [`Exported On: ${new Date().toLocaleString()}`],
      [],
      headers,
      ...rows,
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, ws, "Weighted Avg Transaction");
    XLSX.writeFile(
      wb,
      `weighted_average_transaction_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleTabChange = (tab: "today" | "monthly") => {
    setActiveTab(tab);
    setHasSearchedMonthly(false);
    setPageNumber(1);
  };

  return (
    <div id="pg-reports-weighted-average-transaction">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="typ-page-heading card-title">Weighted average transaction</div>
              <div className="card-sub">
                View average transaction value by order type
              </div>

              <div className="tab-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                    onClick={() => handleTabChange("today")}
                  >
                    Average Transaction of Today
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
                    onClick={() => handleTabChange("monthly")}
                  >
                    Average Transaction by Monthly
                  </button>
                </div>

                {activeTab === "today" && (
                  <button
                    className="btn-action"
                    onClick={exportToExcel}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    EXPORT TO EXCEL
                  </button>
                )}
              </div>

              {activeTab === "monthly" && (
                <div className="filter-row" style={{ marginTop: "16px", display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
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
                    <label className="filter-label">Select Year:</label>
                    <select
                      className="filter-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn-action"
                    onClick={() => {
                      setPageNumber(1);
                      loadMonthly();
                    }}
                  >
                    GET DATA
                  </button>
                  <button
                    className="btn-action"
                    onClick={exportToExcel}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    EXPORT TO EXCEL
                  </button>
                </div>
              )}

              <div
                className="results-section"
                style={{
                  display: activeTab === "today" ? "block" : hasSearchedMonthly ? "block" : "none",
                  marginTop: "20px",
                }}
              >
                <div className="table-card">
                  <div className="table-card-header">
                    <span>
                      {activeTab === "today"
                        ? "Today's Transactions"
                        : "Monthly Transactions"}
                    </span>
                  </div>
                  <ReportTableState loading={loading} hasData={paginatedRows.length > 0} columns={4}>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order Type</th>
                            <th>Total Order Count</th>
                            <th>Total Amount ({currencySymbol})</th>
                            <th>Weighted average transaction ({currencySymbol})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                                Loading data...
                              </td>
                            </tr>
                          ) : paginatedRows.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                                No Records Found
                              </td>
                            </tr>
                          ) : (
                            paginatedRows.map((r, idx) => {
                              const orderType =
                                r.delivery_method_name ||
                                (r as any).Delivery_Method_Name ||
                                (r as any).delivery_method ||
                                "-";
                              const totalOrders =
                                r.total_orders ?? (r as any).Total_Orders ?? 0;
                              const totalAmount = Number(
                                r.total_amount ?? (r as any).Total_Amount ?? 0
                              );
                              const weightedAvg = Number(
                                r.weighted_average_transaction ??
                                (r as any).Weighted_Average_Transaction ??
                                (r as any).weighted_average ??
                                0
                              );
                              return (
                                <tr key={idx}>
                                  <td>{orderType}</td>
                                  <td>{totalOrders}</td>
                                  <td>{totalAmount.toFixed(2)}</td>
                                  <td>{weightedAvg.toFixed(2)}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    <ReportTableFooter
                      currentPage={pageNumber}
                      totalPages={totalPages}
                      totalRecords={totalRecords}
                      pageSize={pageSize}
                      onPageChange={(page) => setPageNumber(page)}
                      onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
                      disabled={loading}
                    />
                  </ReportTableState>
                </div>
              </div>
            </div>

            <ReportStepFooter currentStepOverride={7} totalStepsOverride={25} />
          </div>
        </div>
      </div>
    </div>
  );
}

