"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import {
  reportsService,
  type SalesRecord as ApiSalesRecord,
  type SalesSummary,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";
import "./page.css";

interface TableRow {
  date: string;
  id: string;
  orderId: string;
  status: string;
  name: string;
  phone: string;
  payment: string;
  type: string;
  split: string;
  amount: string;
  tax: string;
  charge: string;
  discount: string;
}

export default function TotalSalesPage() {
  const shopId = useShopId();
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "month-wise" | "year-wise" | "custom">("today");
  const [records, setRecords] = useState<TableRow[]>([]);
  const [metrics, setMetrics] = useState({ salesAmount: "0.00", orderCount: 0, taxAmount: "0.00" });
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [serverTotalRecords, setServerTotalRecords] = useState<number>(0);
  const [serverTotalPages, setServerTotalPages] = useState<number>(0);

  const latestRequestRef = useState<{ current: number }>({ current: 0 })[0];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCustomFrom(today);
    setCustomTo(today);
  }, []);

  const formatTransDate = (trans_date?: any): string => {
    if (!trans_date) return "";
    if (typeof trans_date === "string") return trans_date.replace("T", " ");
    if (trans_date.value) return String(trans_date.value).replace("T", " ");
    const d = trans_date.Day ?? trans_date.day;
    const m = trans_date.Month ?? trans_date.month;
    const y = trans_date.Year ?? trans_date.year;
    const h = trans_date.Hour ?? trans_date.hour ?? 0;
    const min = trans_date.Minute ?? trans_date.minute ?? 0;
    const s = trans_date.Second ?? trans_date.second ?? 0;
    if (d && m && y) {
      return `${d}/${m}/${y} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return "";
  };

  const mapRecords = (list: ApiSalesRecord[]): TableRow[] =>
    list.map((item) => ({
      date: formatTransDate(item.trans_date),
      id: item.pos_order_id || item.order_id,
      orderId: item.order_id,
      status: item.o_status,
      name: item.name,
      phone: item.mobile_no,
      payment: item.payment_method,
      type: item.delivery_method_name,
      split: item.split_payment_method ?? "",
      amount: String(item.total_amount ?? item.full_amount ?? 0),
      tax: String(item.total_tax ?? item.tax_amount ?? 0),
      charge: String(item.charges ?? 0),
      discount: String(item.discount ?? 0),
    }));

  const summarize = (summary: SalesSummary[]) => ({
    salesAmount: summary
      .reduce((sum, x) => sum + Number(x.total_amount || 0), 0)
      .toFixed(2),
    taxAmount: summary
      .reduce((sum, x) => sum + Number(x.tax_amount || 0), 0)
      .toFixed(2),
    orderCount: summary.length,
  });

  const loadTodaySales = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const [summary, list] = await Promise.all([
        reportsService.getTodaySummary(shopId),
        reportsService.getTodaySales(shopId, 0, 100),
      ]);
      setMetrics(summarize(summary));
      setRecords(mapRecords(list));
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekSales = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const [summary, list] = await Promise.all([
        reportsService.getWeekSummary(shopId),
        reportsService.getWeekSales(shopId, 0, 100),
      ]);
      setMetrics(summarize(summary));
      setRecords(mapRecords(list));
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthSales = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const [summary, list] = await Promise.all([
        reportsService.getMonthSummary(shopId, selectedMonth, selectedMonthYear),
        reportsService.getMonthSales(shopId, selectedMonth, selectedMonthYear, 0, 100),
      ]);
      setMetrics(summarize(summary));
      setRecords(mapRecords(list));
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadYearSales = async () => {
    try {
      setLoading(true);
      setPageNumber(1);
      const [summary, list] = await Promise.all([
        reportsService.getYearSummary(shopId, selectedYear),
        reportsService.getYearSales(shopId, selectedYear, 0, 100),
      ]);
      setMetrics(summarize(summary));
      setRecords(mapRecords(list));
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomSales = async (targetPage = pageNumber, targetSize = pageSize) => {
    if (!customFrom || !customTo || !shopId) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;
    setLoading(true);
    try {
      const response = await reportsService.getTotalSalesByDateWise(
        shopId,
        customFrom,
        customTo,
        targetPage,
        targetSize
      );

      if (latestRequestRef.current !== requestId) return;

      const items = response.items || [];
      const formattedRows: TableRow[] = items.map((item) => ({
        date: formatTransDate(item.trans_date),
        id: item.pos_order_id || item.order_id || "",
        orderId: item.order_id || "",
        status: item.order_status || item.o_status || "",
        name: item.name || "",
        phone: item.mobile_no || "",
        payment: item.payment_method || "",
        type: item.delivery_method_name || "",
        split: item.split_payment_method || item.split_payment || "",
        amount: String(item.total_amount ?? item.full_amount ?? 0),
        tax: String(item.total_tax ?? 0),
        charge: String(item.charges ?? 0),
        discount: String(item.discount ?? 0),
      }));

      setRecords(formattedRows);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages);

      const salesTot = items.reduce(
        (acc, item) => acc + Number(item.total_amount ?? item.full_amount ?? 0),
        0
      );
      const taxTot = items.reduce(
        (acc, item) => acc + Number(item.total_tax || 0),
        0
      );
      setMetrics({
        salesAmount: salesTot.toFixed(2),
        orderCount: response.totalRecords || items.length,
        taxAmount: taxTot.toFixed(2),
      });
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      console.error("Error loading datewise sales:", err);
      setRecords([]);
      setServerTotalRecords(0);
      setServerTotalPages(0);
      setMetrics({ salesAmount: "0.00", orderCount: 0, taxAmount: "0.00" });
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const lastFetched = useRef<{ tab: string; shopId: number | null }>({ tab: "", shopId: null });

  useEffect(() => {
    if (!shopId) return;

    // Prevent duplicate calls from React Strict Mode in development
    if (lastFetched.current.tab === activeTab && lastFetched.current.shopId === shopId) {
      return;
    }
    lastFetched.current = { tab: activeTab, shopId };

    if (activeTab === "today") {
      loadTodaySales();
    } else if (activeTab === "this-week") {
      loadWeekSales();
    }
  }, [shopId, activeTab]);

  const handleTabChange = (
    tab: "today" | "this-week" | "month-wise" | "year-wise" | "custom"
  ) => {
    if (activeTab === tab) return; // Prevent clicking the same tab twice
    setActiveTab(tab);
    setPageNumber(1);
    setRecords([]);
    setMetrics({ salesAmount: "0.00", orderCount: 0, taxAmount: "0.00" });
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    if (activeTab === "custom") {
      loadCustomSales(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
    if (activeTab === "custom") {
      loadCustomSales(1, newSize);
    }
  };

  const totalRecords = activeTab === "custom" ? serverTotalRecords : records.length;
  const totalPages = activeTab === "custom" ? serverTotalPages : Math.ceil(records.length / pageSize);
  const paginatedRecords = activeTab === "custom" ? records : records.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  return (
    <div id="pg-reports-total-sales">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="afterInteractive" />

      <div className="app-container">
        <main className="main-content">
          <div className="content-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="typ-page-heading" style={{ color: "var(--text-dark)" }}>Total Sales</h2>
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
                  className={`btn-sales-filter ${activeTab === "this-week" ? "active" : ""}`}
                  onClick={() => handleTabChange("this-week")}
                >
                  This Week
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "month-wise" ? "active" : ""}`}
                  onClick={() => handleTabChange("month-wise")}
                >
                  Month Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "year-wise" ? "active" : ""}`}
                  onClick={() => handleTabChange("year-wise")}
                >
                  Year Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "custom" ? "active" : ""}`}
                  onClick={() => handleTabChange("custom")}
                >
                  Custom
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button id="default-export-btn" className="btn-action-teal btn-export-excel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  &nbsp;EXPORT TO EXCEL
                </button>
              </div>
            </div>

            {activeTab === "month-wise" && (
              <div className="sub-filter-panel" style={{ display: "flex" }}>
                <div className="input-group">
                  <label>Select Month :</label>
                  <select
                    className="input-control"
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
                <div className="input-group">
                  <label>Select Year :</label>
                  <select
                    className="input-control"
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
                <button className="btn-action-teal" onClick={loadMonthSales}>
                  GET DATA
                </button>
              </div>
            )}

            {activeTab === "year-wise" && (
              <div className="sub-filter-panel" style={{ display: "flex" }}>
                <div className="input-group">
                  <label>Select Year :</label>
                  <select
                    className="input-control"
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
                <button className="btn-action-teal" onClick={loadYearSales}>
                  GET DATA
                </button>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="sub-filter-panel" style={{ display: "flex" }}>
                <div className="input-group">
                  <label>From</label>
                  <input
                    type="date"
                    className="input-control"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>To</label>
                  <input
                    type="date"
                    className="input-control"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
                <button className="btn-action-teal" onClick={() => { setPageNumber(1); loadCustomSales(1, pageSize); }}>
                  GET DATA
                </button>
              </div>
            )}

            <div id="metrics-container" className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-chart-line" /></div>
                <div className="metric-info"><h4>Total Sales</h4><p>Rs. {metrics.salesAmount}</p></div>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-shopping-cart" /></div>
                <div className="metric-info"><h4>Total Order Count</h4><p>{metrics.orderCount}</p></div>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-file-invoice-dollar" /></div>
                <div className="metric-info"><h4>Total Tax Amount</h4><p>Rs. {metrics.taxAmount}</p></div>
              </div>
            </div>

            <h3 style={{ fontSize: "17px", color: "var(--text-dark)", margin: "18px 0", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Description
            </h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Customer Name</th>
                    <th>Mobile No</th>
                    <th>Payment Method</th>
                    <th>Order Type</th>
                    <th>Split Payment</th>
                    <th>Total Amount (Rs.)</th>
                    <th>Total tax (Rs.)</th>
                    <th>Total Charge (Rs.)</th>
                    <th>Total Discount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center", padding: "32px" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center", padding: "32px" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.date}</td>
                        <td>{r.id}</td>
                        <td>{r.status}</td>
                        <td>{r.name}</td>
                        <td>{r.phone}</td>
                        <td>{r.payment}</td>
                        <td>{r.type}</td>
                        <td>{r.split}</td>
                        <td>{r.amount}</td>
                        <td>{r.tax}</td>
                        <td>{r.charge}</td>
                        <td>{r.discount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ width: "100%" }}>
              <ReportPagination
                currentPage={pageNumber}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageSizeChange={(size) => handlePageSizeChange(size)}
                onPageChange={(page) => handlePageChange(page)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}