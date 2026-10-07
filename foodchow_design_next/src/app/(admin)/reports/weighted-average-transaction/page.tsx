"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  WeightedAverageTransaction,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

export default function WeightedAverageTransactionPage() {
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<"today" | "monthly">("today");
  const [todayData, setTodayData] = useState<WeightedAverageTransaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<WeightedAverageTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleTabChange = (tab: "today" | "monthly") => {
    setActiveTab(tab);
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

              <div className="tab-row">
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

              {activeTab === "monthly" && (
                <div className="filter-row" style={{ marginTop: "16px" }}>
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
                </div>
              )}

              <div className="results-section" style={{ marginTop: "20px" }}>
                <div className="table-card">
                  <div className="table-card-header">
                    <span>
                      {activeTab === "today"
                        ? "Today's Transactions"
                        : "Monthly Transactions"}
                    </span>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order Type</th>
                          <th>Total Order Count</th>
                          <th>Total Amount</th>
                          <th>Weighted average transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                              Loading...
                            </td>
                          </tr>
                        ) : paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                              No Record Found
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
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageNumber(1);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span style={{ fontSize: "14px", color: "#666" }}>entries</span>
                </div>

                <ReportPagination
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  totalRecords={totalRecords}
                  pageSize={pageSize}
                  onPageChange={(page) => setPageNumber(page)}
                />
              </div>
            </div>

            <div className="step-footer">
              <button className="btn-prev" id="prevBtn">
                <i className="fas fa-chevron-left" /> PREVIOUS
              </button>
              <div className="step-indicator">
                <span className="step-label">STEP</span>
                <span className="step-value" id="stepValue">
                  6/25
                </span>
              </div>
              <button className="btn-next" id="nextBtn">
                NEXT <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

