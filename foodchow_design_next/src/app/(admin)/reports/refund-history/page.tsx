"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  reportsService,
  type RefundRecord,
} from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";
import "./page.css";

interface XlsxLike {
  utils: {
    book_new(): unknown;
    aoa_to_sheet(data: unknown[][]): unknown;
    book_append_sheet(wb: unknown, ws: unknown, name: string): void;
  };
  writeFile(wb: unknown, filename: string): void;
}

export default function RefundHistoryPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
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
  const [hasSearched, setHasSearched] = useState<boolean>(false);

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
      setHasSearched(true);
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
      setHasSearched(true);
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
      setHasSearched(true);
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
      setHasSearched(true);
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
      setHasSearched(true);
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
    if (activeTab === tab) return;
    setActiveTab(tab);
    setPageNumber(1);
    setRecords([]);
    if (tab === "today") {
      loadToday();
    } else if (tab === "thisweek") {
      loadWeek();
    } else {
      setHasSearched(false);
    }
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

  const exportToExcel = (): void => {
    if (!records || records.length === 0) {
      alert("No data available to export");
      return;
    }
    const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
    if (!XLSX) return;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let tabLabel: string = activeTab;
    if (activeTab === "monthwise") tabLabel = `Month_${monthNames[parseInt(selectedMonth) - 1]}_${selectedMonthYear}`;
    else if (activeTab === "yearwise") tabLabel = `Year_${selectedYear}`;
    else if (activeTab === "custom") tabLabel = `${fromDate}_to_${toDate}`;
    const headers = ["Date", "Order ID", "Customer Name", "Mobile No", "Payment Method", "Order Type", `Refund Amount (${currencySymbol})`, "Reason"];
    const wsData: unknown[][] = [
      ["Refund History Report"],
      [],
      headers,
      ...records.map((r) => [
        fmtDate(r.trans_date),
        r.order_id,
        r.name,
        r.mobile_no,
        r.payment_method,
        r.delivery_method_name,
        parseFloat(Number(r.refund_amount || 0).toFixed(2)),
        r.reason ?? "",
      ]),
      [],
      ["", "", "", "", "", "", `Total: ${currencySymbol}${totalRefundAmount}`, ""],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Refund History");
    XLSX.writeFile(wb, `refund_history_${tabLabel}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

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

            <div className="tabs-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

              {(activeTab === "today" || activeTab === "thisweek") && (
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
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
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
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
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
                  GET DATA
                </button>
                <button className="btn-action" onClick={exportToExcel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {(activeTab === "today" || activeTab === "thisweek" || hasSearched) && (
              <div
                className="results-section"
                style={{ display: "block" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", marginTop: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#0aa89e" }}>Description</div>
                </div>
              <div className="summary-stats" style={{ margin: "16px 0" }}>
                <div>
                  <p className="stat-line">Total Refund = {currencySymbol}{totalRefundAmount}</p>
                  <p className="stat-line">Total Order Count = {totalRecords}</p>
                </div>
              </div>

              <ReportTableState loading={loading} hasData={paginatedRecords.length > 0} columns={8}>
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
                        <th>Refund Amount ({currencySymbol})</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                            Loading data...
                          </td>
                        </tr>
                      ) : paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                            No Records Found
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
                              {currencySymbol}{Number(r.refund_amount).toFixed(2)}
                            </td>
                            <td>{r.reason ?? ""}</td>
                          </tr>
                        ))
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
                />
              </ReportTableState>
            </div>
            )}
          </div>

          <ReportStepFooter currentStepOverride={15} totalStepsOverride={25} />
        </div>
      </div>
    </div>
  );
}
