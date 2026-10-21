"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService, IncompletePayment } from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";

type WorkBook = unknown;
type WorkSheet = { [k: string]: unknown };

declare global {
  interface Window {
    XLSX?: {
      utils: {
        book_new(): WorkBook;
        aoa_to_sheet(data: unknown[][]): WorkSheet;
        book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
      };
      writeFile(wb: WorkBook, name: string): void;
    };
  }
}

type Tab = "today" | "weekly" | "monthly" | "yearly" | "datewise";

type DataRow = {
  orderId: number;
  customerName: string;
  mobileNo: string;
  paymentMethod: string;
  totalAmount: number;
  paymentCharge: number;
  date: string;
};

export default function IncompletePaymentPage() {
  const shopId = useShopId();

  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);

  const formatDate = (dateObj: any): string => {
    if (!dateObj) return "";
    if (typeof dateObj === "string") return dateObj;
    if (dateObj.Year !== undefined && dateObj.Month !== undefined && dateObj.Day !== undefined) {
      const dd = String(dateObj.Day).padStart(2, "0");
      const mm = String(dateObj.Month).padStart(2, "0");
      return `${dd}-${mm}-${dateObj.Year}`;
    }
    if (dateObj.Value && typeof dateObj.Value === "string") {
      const match = /\/Date\((\d+)\)\//.exec(dateObj.Value);
      if (match) {
        const d = new Date(parseInt(match[1], 10));
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}-${mm}-${d.getFullYear()}`;
      }
      return dateObj.Value;
    }
    return String(dateObj);
  };

  const mapToDataRow = (item: any): DataRow => ({
    orderId: item.order_id,
    customerName: item.customer_name,
    mobileNo: item.mobile_no,
    paymentMethod: item.payment_method,
    totalAmount: item.total_amount,
    paymentCharge: item.payment_charge,
    date: formatDate(item.trans_date),
  });

  const fetchData = useCallback(async (tabToFetch: Tab = activeTab) => {
    if (!shopId) return;
    setLoading(true);
    setPageNumber(1);
    try {
      let result: IncompletePayment[] = [];
      if (tabToFetch === "today") {
        result = await reportsService.getIncompletePaymentToday(shopId);
      } else if (tabToFetch === "weekly") {
        result = await reportsService.getIncompletePaymentWeek(shopId);
      } else if (tabToFetch === "monthly") {
        result = await reportsService.getIncompletePaymentMonth(shopId, month, year);
      } else if (tabToFetch === "yearly") {
        result = await reportsService.getIncompletePaymentYear(shopId, year);
      } else if (tabToFetch === "datewise") {
        result = await reportsService.getIncompletePaymentDateWise(shopId, dateFrom, dateTo);
      }
      setRows((result || []).map(mapToDataRow));
    } catch (err) {
      console.error("Failed to fetch incomplete payment data:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, activeTab, month, year, dateFrom, dateTo]);

  const [hasSearched, setHasSearched] = useState(false);

  // Fetch automatically for tabs that don't have "GET DATA" button
  useEffect(() => {
    if (shopId && (activeTab === "today" || activeTab === "weekly")) {
      fetchData(activeTab);
    }
  }, [shopId, activeTab, fetchData]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPageNumber(1);
    if (tab === "today" || tab === "weekly") {
      fetchData(tab);
    } else {
      setRows([]);
      setHasSearched(false);
    }
  };

  const exportToExcel = (): void => {
    if (!rows || rows.length === 0) {
      alert("No data available to export");
      return;
    }
    const XLSX = window.XLSX;
    if (!XLSX) return;
    const headers = [
      "Order ID",
      "Customer Name",
      "Mobile No",
      "Payment Method",
      "Total Amount (Rs.)",
      "Payment Charge (Rs.)",
      "Date",
    ];
    const wsData: unknown[][] = [
      ["Incomplete Payment Report"],
      [],
      headers,
      ...rows.map((r) => [
        r.orderId,
        r.customerName,
        r.mobileNo,
        r.paymentMethod,
        parseFloat(Number(r.totalAmount).toFixed(2)),
        parseFloat(Number(r.paymentCharge).toFixed(2)),
        r.date,
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    (ws as { [k: string]: unknown })["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
    ];
    (ws as { [k: string]: unknown })["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Incomplete Payment");
    XLSX.writeFile(wb, `incomplete_payment_${activeTab}.xlsx`);
  };

  const totalAmt = rows.reduce((s, r) => s + r.totalAmount, 0);

  const paginatedRows = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const totalPages = Math.ceil(rows.length / pageSize);

  const yearOptions = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i);

  return (
    <div id="pg-reports-incomplete-payment">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-actions">
                <button className="btn-help-new" onClick={() => alert("Help & Support - Incomplete Payment")}>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
              <div className="typ-page-heading card-title">Total Incomplete Payment Reports</div>
              <div className="card-sub">
                View incomplete payment records across different time periods
              </div>

              {/* TABS */}
              <div className="tab-row">
                {(["today", "weekly", "monthly", "yearly", "datewise"] as Tab[]).map((tab) => {
                  const labels: Record<Tab, string> = {
                    today: "Today",
                    weekly: "This Week",
                    monthly: "Month Wise",
                    yearly: "Year Wise",
                    datewise: "Custom",
                  };
                  return (
                    <button
                      key={tab}
                      className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                      onClick={() => handleTabChange(tab)}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              <div className="tab-panel active">
                {activeTab === "monthly" && (
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">Select Month :</label>
                      <select className="filter-select" value={month} onChange={(e) => setMonth(e.target.value)}>
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
                      <select className="filter-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <button className="btn-action" onClick={() => { setHasSearched(true); fetchData("monthly"); }}>GET DATA</button>
                    <button className="btn-action btn-export" onClick={exportToExcel}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                )}

                {activeTab === "yearly" && (
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">Select Year :</label>
                      <select className="filter-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <button className="btn-action" onClick={() => { setHasSearched(true); fetchData("yearly"); }}>GET DATA</button>
                    <button className="btn-action btn-export" onClick={exportToExcel}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                )}

                {activeTab === "datewise" && (
                  <div className="filter-row">
                    <div className="filter-group">
                      <label className="filter-label">From Date:</label>
                      <input type="date" className="filter-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">To Date:</label>
                      <input type="date" className="filter-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <button className="btn-action" onClick={() => { setHasSearched(true); fetchData("datewise"); }}>GET DATA</button>
                    <button className="btn-action btn-export" onClick={exportToExcel}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      EXPORT TO EXCEL
                    </button>
                  </div>
                )}

                {(activeTab === "today" || activeTab === "weekly" || hasSearched) && (
                  <div
                    className="results-section"
                    style={{ display: "block" }}
                  >
                  <div className="results-header">
                    <div className="results-title">Description</div>
                    {(activeTab === "today" || activeTab === "weekly") && (
                      <button className="btn-action btn-export" onClick={exportToExcel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        EXPORT TO EXCEL
                      </button>
                    )}
                  </div>
                  <div className="total-amount-bar">
                    <span className="total-amount-label">Total Incomplete Amount:</span>
                    <span className="total-amount-value">Rs. {totalAmt.toFixed(2)}</span>
                  </div>

                  <ReportTableState loading={loading} hasData={paginatedRows.length > 0} columns={7}>
                    <div className="table-responsive-box">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Mobile No</th>
                            <th>Payment Method</th>
                            <th>Total Amount (Rs.)</th>
                            <th>Payment Charge (Rs.)</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRows.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                                No Records Found
                              </td>
                            </tr>
                          ) : (
                            paginatedRows.map((r, idx) => (
                              <tr key={idx}>
                                <td>{r.orderId}</td>
                                <td>{r.customerName}</td>
                                <td>{r.mobileNo}</td>
                                <td>{r.paymentMethod}</td>
                                <td>{Number(r.totalAmount).toFixed(2)}</td>
                                <td>{Number(r.paymentCharge).toFixed(2)}</td>
                                <td>{r.date}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <ReportTableFooter
                      currentPage={pageNumber}
                      totalPages={totalPages}
                      totalRecords={rows.length}
                      pageSize={pageSize}
                      onPageChange={(page) => setPageNumber(page)}
                      onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
                      disabled={loading}
                    />
                  </ReportTableState>
                </div>
                )}
              </div>
            </div>

            {/* STEP FOOTER */}
            <ReportStepFooter currentStepOverride={20} totalStepsOverride={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
