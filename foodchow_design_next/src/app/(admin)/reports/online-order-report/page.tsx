"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  reportsService,
  type SalesRecord,
} from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";
import "./page.css";

type Order = {
  date: string;
  orderId: string;
  customer: string;
  mobile: string;
  orderType: string;
  payment: string;
  status: string;
  amount: number;
  tax: number;
  charge: number;
  delivery: number;
};

export default function OnlineOrderReportPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "monthly" | "yearly" | "datewise">("today");
  const [records, setRecords] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<string>("01");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [fromDate, setFromDate] = useState<string>("2026-06-30");
  const [toDate, setToDate] = useState<string>("2026-07-16");

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const pad = (n: number): string => String(n).padStart(2, "0");

  const mapRecord = (r: SalesRecord): Order => {
    const td = r.trans_date;
    const date = td ? `${pad(td.Day)}-${pad(td.Month)}-${td.Year}` : "";
    return {
      date,
      orderId: r.pos_order_id || r.order_id,
      customer: r.name,
      mobile: r.mobile_no,
      orderType: r.delivery_method_name,
      payment: r.payment_method,
      status: r.o_status,
      amount: Number(r.total_amount ?? 0),
      tax: Number(r.total_tax ?? r.tax_amount ?? 0),
      charge: Number(r.charges ?? 0),
      delivery: Number(r.delivery_charge ?? 0),
    };
  };

  const fetchToday = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const list = await reportsService.getOnlineOrderToday(shopId);
      setRecords(list.map(mapRecord));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeek = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const list = await reportsService.getOnlineOrderWeek(shopId);
      setRecords(list.map(mapRecord));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonth = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const list = await reportsService.getOnlineOrderMonth(
        shopId,
        pad(Number(selectedMonth)),
        selectedMonthYear
      );
      setRecords(list.map(mapRecord));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchYear = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const list = await reportsService.getOnlineOrderYear(shopId, selectedYear);
      setRecords(list.map(mapRecord));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatewise = async () => {
    if (!fromDate || !toDate) return;
    try {
      setLoading(true);
      setPageNumber(1);
      const list = await reportsService.getOnlineOrderCustom(shopId, fromDate, toDate);
      setRecords(list.map(mapRecord));
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
      fetchToday();
    }
  }, [shopId]);

  const handleTabChange = (
    tab: "today" | "weekly" | "monthly" | "yearly" | "datewise"
  ) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setPageNumber(1);
    setRecords([]);
    if (tab === "today") {
      fetchToday();
    } else if (tab === "weekly") {
      fetchWeek();
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

  const totalAmount = records
    .reduce((sum, r) => sum + r.amount, 0)
    .toFixed(2);

  const exportToExcel = (): void => {
    if (!records || records.length === 0) {
      alert("No data available to export");
      return;
    }

    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      return;
    }

    const headers = [
      "Date",
      "Order ID",
      "Customer Name",
      "Mobile No",
      "Order Type",
      "Payment Method",
      "Order Status",
      `Total Amount (${currencySymbol})`,
      `Tax (${currencySymbol})`,
      `Charge (${currencySymbol})`,
      `Delivery Charge (${currencySymbol})`
    ];

    const rows = records.map((r) => [
      r.date || "-",
      r.orderId || "-",
      r.customer || "-",
      r.mobile || "-",
      r.orderType || "-",
      r.payment || "-",
      r.status || "-",
      parseFloat(r.amount.toFixed(2)) || 0,
      parseFloat(r.tax.toFixed(2)) || 0,
      parseFloat(r.charge.toFixed(2)) || 0,
      parseFloat(r.delivery.toFixed(2)) || 0,
    ]);

    const reportTitle = `Online Order Report — ${activeTab.toUpperCase()}`;
    const wsData: any[][] = [
      [reportTitle],
      [`Exported On: ${new Date().toLocaleString()}`],
      [],
      headers,
      ...rows,
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 }
    ];

    const fileName = `online_order_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.utils.book_append_sheet(wb, ws, "Online Orders");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div id="pg-reports-online-order-report">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="app-container">
        <div className="main-content">
          <div className="report-card">
            <div className="report-header">
              <div className="typ-page-heading report-title">Online Order Reports</div>
            </div>

            <div className="tabs-bar">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => handleTabChange("today")}
                >
                  Today
                </button>
                <button
                  className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => handleTabChange("weekly")}
                >
                  This Week
                </button>
                <button
                  className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
                  onClick={() => handleTabChange("monthly")}
                >
                  Month Wise
                </button>
                <button
                  className={`tab-btn ${activeTab === "yearly" ? "active" : ""}`}
                  onClick={() => handleTabChange("yearly")}
                >
                  Year Wise
                </button>
                <button
                  className={`tab-btn ${activeTab === "datewise" ? "active" : ""}`}
                  onClick={() => handleTabChange("datewise")}
                >
                  Custom
                </button>
              </div>

              {(activeTab === "today" || activeTab === "weekly") && (
                <button
                  className="btn-action btn-export"
                  onClick={() => exportToExcel()}
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
              <div className="filter-row show">
                <div className="filter-group">
                  <label>Select Month:</label>
                  <select
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
                  <label>Select Year:</label>
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
                <button className="btn-apply" onClick={fetchMonth}>
                  GET DATA
                </button>
                <button className="btn-action btn-export" onClick={() => exportToExcel()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {activeTab === "yearly" && (
              <div className="filter-row show">
                <div className="filter-group">
                  <label>Select Year:</label>
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
                <button className="btn-apply" onClick={fetchYear}>
                  GET DATA
                </button>
                <button className="btn-action btn-export" onClick={() => exportToExcel()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {activeTab === "datewise" && (
              <div className="filter-row show">
                <div className="filter-group">
                  <label>From Date:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>To Date:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <button className="btn-apply" onClick={fetchDatewise}>
                  GET DATA
                </button>
                <button className="btn-action btn-export" onClick={() => exportToExcel()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>
            )}

            {(activeTab === "today" || activeTab === "weekly" || hasSearched) && (
              <div className="results-section" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", marginTop: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#0aa89e" }}>Description</div>
                </div>
              <div className="total-label">
                Total Online Amount: Rs. {totalAmount}
              </div>

              <ReportTableState loading={loading} hasData={paginatedRecords.length > 0} columns={11}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Mobile No</th>
                        <th>Order Type</th>
                        <th>Payment Method</th>
                        <th>Order Status</th>
                        <th>Total Amount ({currencySymbol})</th>
                        <th>Tax ({currencySymbol})</th>
                        <th>Charge ({currencySymbol})</th>
                        <th>Delivery Charge ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={11} style={{ textAlign: "center", padding: "40px" }}>
                            Loading data...
                          </td>
                        </tr>
                      ) : paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                            No Records Found
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((r, idx) => (
                          <tr key={idx}>
                            <td>{r.date}</td>
                            <td>
                              <span className="order-id-badge">{r.orderId}</span>
                            </td>
                            <td>{r.customer}</td>
                            <td>{r.mobile}</td>
                            <td>{r.orderType}</td>
                            <td>
                              <span className={`badge badge-${(r.payment || "").toLowerCase()}`}>
                                {r.payment || "—"}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${(r.status || "").toLowerCase()}`}>
                                {r.status || "—"}
                              </span>
                            </td>
                            <td>
                              <strong>Rs. {r.amount.toFixed(2)}</strong>
                            </td>
                            <td>Rs. {r.tax.toFixed(2)}</td>
                            <td>Rs. {r.charge.toFixed(2)}</td>
                            <td>Rs. {r.delivery.toFixed(2)}</td>
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

          <ReportStepFooter currentStepOverride={23} totalStepsOverride={25} />
        </div>
      </div>
    </div>
  );
}