"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  reportsService,
  type RefundRecord,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";
import "./page.css";

export default function RefundHistoryPage() {
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<"today" | "thisweek" | "monthwise" | "yearwise" | "custom">("today");
  const [records, setRecords] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<string>("01");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fmtDate = (trans_date?: RefundRecord["trans_date"]): string => {
    if (!trans_date) return "";
    const { Day, Month, Year } = trans_date;
    return `${Day}/${Month}/${Year}`;
  };

  const loadToday = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const res = await reportsService.getTodayRefunds(shopId, 1, pageSize);
      setRecords(res?.records || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWeek = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const res = await reportsService.getWeekRefunds(shopId, 1, pageSize);
      setRecords(res?.records || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonth = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const res = await reportsService.getMonthRefunds(
        shopId,
        selectedMonth,
        selectedMonthYear,
        1,
        pageSize
      );
      setRecords(res?.records || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadYear = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const res = await reportsService.getYearRefunds(shopId, selectedYear, 1, pageSize);
      setRecords(res?.records || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustom = async () => {
    if (!fromDate || !toDate) return;
    try {
      setLoading(true);
      setPageNumber(1);
      const res = await reportsService.getCustomRefunds(shopId, fromDate, toDate, 1, pageSize);
      setRecords(res?.records || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      loadToday();
    }
  }, [shopId]);

  const handleTabChange = (
    tab: "today" | "thisweek" | "monthwise" | "yearwise" | "custom"
  ) => {
    setActiveTab(tab);
    setPageNumber(1);
    if (tab === "today") loadToday();
    else if (tab === "thisweek") loadWeek();
    else setRecords([]);
  };

  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedRecords = records.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const totalRefundAmount = records
    .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0)
    .toFixed(2);

  return (
    <div id="pg-reports-refund-history">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="app-container">
        <div className="main-content">
          <div className="page-card">
            <div className="page-header">
              <h1 className="typ-page-heading page-title">Refund History</h1>
            </div>

            <div className="tabs-row">
              <button
                className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                onClick={() => handleTabChange("today")}
              >
                Today
              </button>
              <button
                className={`tab-btn ${activeTab === "thisweek" ? "active" : ""}`}
                onClick={() => handleTabChange("thisweek")}
              >
                This Week
              </button>
              <button
                className={`tab-btn ${activeTab === "monthwise" ? "active" : ""}`}
                onClick={() => handleTabChange("monthwise")}
              >
                Month Wise
              </button>
              <button
                className={`tab-btn ${activeTab === "yearwise" ? "active" : ""}`}
                onClick={() => handleTabChange("yearwise")}
              >
                Year Wise
              </button>
              <button
                className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
                onClick={() => handleTabChange("custom")}
              >
                Custom
              </button>
            </div>

            {activeTab === "monthwise" && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>Select Month :</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
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
                <div className="filter-group">
                  <label>Select Year :</label>
                  <select
                    value={selectedMonthYear}
                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn-get-data" onClick={loadMonth}>
                  GETDATA
                </button>
              </div>
            )}

            {activeTab === "yearwise" && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>Select Year :</label>
                  <select
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
                <button className="btn-get-data" onClick={loadYear}>
                  GETDATA
                </button>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <button className="btn-get-data" onClick={loadCustom}>
                  GETDATA
                </button>
              </div>
            )}

            <div className="summary-stats" style={{ margin: "16px 0" }}>
              <p className="stat-line">Total Refund = ₹{totalRefundAmount}</p>
              <p className="stat-line">Total Order Count = {totalRecords}</p>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Mobile No</th>
                    <th>Payment Method</th>
                    <th>Order Type</th>
                    <th>Refund Amount</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                        No Record Found
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, idx) => (
                      <tr key={idx}>
                        <td>{fmtDate(r.trans_date)}</td>
                        <td>
                          <span className="order-pill">{r.order_id}</span>
                        </td>
                        <td>{r.name}</td>
                        <td>{r.mobile_no}</td>
                        <td>
                          <span className="method-pill">{r.payment_method}</span>
                        </td>
                        <td>
                          <span className="type-pill">{r.delivery_method_name}</span>
                        </td>
                        <td className="amount-cell">
                          ₹{Number(r.refund_amount).toFixed(2)}
                        </td>
                        <td>{r.reason ?? ""}</td>
                      </tr>
                    ))
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
        </div>
      </div>
    </div>
  );
}