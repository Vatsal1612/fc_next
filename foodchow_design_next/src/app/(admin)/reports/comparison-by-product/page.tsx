"use client";

import "./page.css";
import { useEffect, useState, useRef } from "react";
import {
  reportsService,
  ProductWiseComparison,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

export default function ComparisonByProductPage() {
  const shopId = useShopId();

  const [todayData, setTodayData] = useState<ProductWiseComparison[]>([]);
  const [weekData, setWeekData] = useState<ProductWiseComparison[]>([]);
  const [monthData, setMonthData] = useState<ProductWiseComparison[]>([]);
  const [yearData, setYearData] = useState<ProductWiseComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"today" | "week" | "month" | "year">("today");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const lastFetched = useRef<{ tab: string; shopId: number | null; page: number }>({ tab: "", shopId: null, page: 0 });

  useEffect(() => {
    if (!shopId) return;
    if (
      lastFetched.current.tab === activeTab &&
      lastFetched.current.shopId === shopId &&
      lastFetched.current.page === pageNumber
    ) {
      return;
    }

    lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
    loadActiveTabData();
  }, [shopId, activeTab, pageNumber]);

  const loadActiveTabData = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      if (activeTab === "today") {
        const result = await reportsService.getProductWiseComparisonToday(shopId, pageNumber, pageSize);
        setTodayData(result);
      } else if (activeTab === "week") {
        const result = await reportsService.getProductWiseComparisonWeek(shopId, pageNumber, pageSize);
        setWeekData(result);
      } else if (activeTab === "month") {
        const result = await reportsService.getProductWiseComparisonMonth(shopId, pageNumber, pageSize);
        setMonthData(result);
      } else if (activeTab === "year") {
        const result = await reportsService.getProductWiseComparisonYear(shopId, pageNumber, pageSize);
        setYearData(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tableData =
    activeTab === "today"
      ? todayData
      : activeTab === "week"
        ? weekData
        : activeTab === "month"
          ? monthData
          : yearData;

  const totalRecords = tableData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = tableData.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const getHeaders = () => {
    switch (activeTab) {
      case "today":
        return {
          prev: "Previous Day Quantity",
          curr: "Current Day Quantity",
          desc: "Comparison By Product Of Current Day With Previous Day",
        };
      case "week":
        return {
          prev: "Previous Week Quantity",
          curr: "Current Week Quantity",
          desc: "Comparison By Product Of Current Week With Previous Week",
        };
      case "month":
        return {
          prev: "Previous Month Quantity",
          curr: "Current Month Quantity",
          desc: "Comparison By Product Of Current Month With Previous Month",
        };
      case "year":
        return {
          prev: "Previous Year Quantity",
          curr: "Current Year Quantity",
          desc: "Comparison By Product Of Current Year With Previous Year",
        };
    }
  };

  const headers = getHeaders();

  const handleTabChange = (tab: "today" | "week" | "month" | "year") => {
    setActiveTab(tab);
    setPageNumber(1);
  };

  return (
    <div id="pg-reports-comparison-by-product">
      <div className="app-container">
        <div className="main-content">
          <div className="report-card">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Item Report</h1>
            </div>

            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                onClick={() => handleTabChange("today")}
              >
                Today
              </button>
              <button
                className={`tab-btn ${activeTab === "week" ? "active" : ""}`}
                onClick={() => handleTabChange("week")}
              >
                This Week
              </button>
              <button
                className={`tab-btn ${activeTab === "month" ? "active" : ""}`}
                onClick={() => handleTabChange("month")}
              >
                Month Wise
              </button>
              <button
                className={`tab-btn ${activeTab === "year" ? "active" : ""}`}
                onClick={() => handleTabChange("year")}
              >
                Year Wise
              </button>
            </div>

            <p className="description-title">{headers.desc}</p>

            <button className="btn-export">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              EXPORT TO EXCEL
            </button>

            <div className="table-wrapper">
              <table id="reportTable">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>{headers.prev}</th>
                    <th>{headers.curr}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                        <td>
                          <span
                            className={`qty-pill ${item.previous_quantity === 0 ? "zero" : ""
                              }`}
                          >
                            {item.previous_quantity}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`qty-pill ${item.current_quantity === 0 ? "zero" : ""
                              }`}
                          >
                            {item.current_quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                        No Record Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
              <i className="fas fa-chevron-left"></i> PREVIOUS
            </button>
            <div className="step-indicator">
              <span className="step-label">STEP</span>
              <span className="step-value" id="stepValue">
                13/26
              </span>
            </div>
            <button className="btn-next" id="nextBtn">
              NEXT <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}