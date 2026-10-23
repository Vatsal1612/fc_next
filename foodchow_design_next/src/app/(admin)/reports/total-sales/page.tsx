"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import {
  reportsService,
  type TotalSalesDateWiseItem,
} from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";
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
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "month-wise" | "year-wise" | "custom">("today");
  const [records, setRecords] = useState<TableRow[]>([]);
  const [metrics, setMetrics] = useState({ salesAmount: "0.00", orderCount: 0, taxAmount: "0.00" });
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    String(new Date().getMonth() + 1)
  );
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
  const [hasSearched, setHasSearched] = useState(false);
  const [exporting, setExporting] = useState<boolean>(false);

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

  const mapRecords = (list: (TotalSalesDateWiseItem | any)[]): TableRow[] =>
    list.map((item) => ({
      date: formatTransDate(item.trans_date),
      id: String(item.pos_order_id || item.order_id || ""),
      orderId: String(item.order_id || ""),
      status: item.o_status || item.order_status || "",
      name: item.name || "",
      phone: item.mobile_no || "",
      payment: item.payment_method || "",
      type: item.delivery_method_name || "",
      split: item.split_payment_method ?? "",
      amount: String(item.total_amount ?? item.full_amount ?? 0),
      tax: String(item.total_tax ?? item.tax_amount ?? 0),
      charge: String(item.charges ?? 0),
      discount: String(item.discount ?? 0),
    }));

  const loadTodaySales = async (targetPage = pageNumber, targetSize = pageSize) => {
    if (!shopId) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;
    try {
      setLoading(true);
      const response = await reportsService.getTotalSalesByToday(shopId, targetPage, targetSize);
      if (latestRequestRef.current !== requestId) return;

      const items = response.items || [];
      const formatted = mapRecords(items);
      setRecords(formatted);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages || (response.totalRecords > 0 ? Math.ceil(response.totalRecords / targetSize) : 0));

      const salesTot = (typeof response.totalAmount === "number" && response.totalAmount > 0)
        ? response.totalAmount
        : items.reduce((acc, item: any) => acc + Number(item.total_amount ?? item.full_amount ?? 0), 0);
      const taxTot = items.reduce((acc, item: any) => acc + Number(item.total_tax ?? item.tax_amount ?? 0), 0);
      setMetrics({
        salesAmount: salesTot.toFixed(2),
        orderCount: response.totalRecords || items.length,
        taxAmount: taxTot.toFixed(2),
      });
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      console.error(err);
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

  const loadWeekSales = async (targetPage = pageNumber, targetSize = pageSize) => {
    if (!shopId) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;
    try {
      setLoading(true);
      const response = await reportsService.getTotalSalesByWeek(shopId, "cash", targetPage, targetSize);
      if (latestRequestRef.current !== requestId) return;

      const items = response.items || [];
      const formatted = mapRecords(items);
      setRecords(formatted);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages || (response.totalRecords > 0 ? Math.ceil(response.totalRecords / targetSize) : 0));

      const salesTot = (typeof response.totalAmount === "number" && response.totalAmount > 0)
        ? response.totalAmount
        : items.reduce((acc, item: any) => acc + Number(item.total_amount ?? item.full_amount ?? 0), 0);
      const taxTot = items.reduce((acc, item: any) => acc + Number(item.total_tax ?? item.tax_amount ?? 0), 0);
      setMetrics({
        salesAmount: salesTot.toFixed(2),
        orderCount: response.totalRecords || items.length,
        taxAmount: taxTot.toFixed(2),
      });
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      console.error(err);
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

  const loadMonthSales = async (targetPage = pageNumber, targetSize = pageSize) => {
    if (!shopId || !selectedMonth || !selectedMonthYear) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;
    try {
      setLoading(true);
      const response = await reportsService.getTotalSalesByMonth(shopId, selectedMonth, selectedMonthYear, targetPage, targetSize);
      if (latestRequestRef.current !== requestId) return;

      const items = response.items || [];
      const formatted = mapRecords(items);
      setRecords(formatted);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages || (response.totalRecords > 0 ? Math.ceil(response.totalRecords / targetSize) : 0));

      const salesTot = (typeof response.totalAmount === "number" && response.totalAmount > 0)
        ? response.totalAmount
        : items.reduce((acc, item: any) => acc + Number(item.total_amount ?? item.full_amount ?? 0), 0);
      const taxTot = items.reduce((acc, item: any) => acc + Number(item.total_tax ?? item.tax_amount ?? 0), 0);
      setMetrics({
        salesAmount: salesTot.toFixed(2),
        orderCount: response.totalRecords || items.length,
        taxAmount: taxTot.toFixed(2),
      });
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      console.error(err);
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

  const loadYearSales = async (targetPage = pageNumber, targetSize = pageSize) => {
    if (!shopId || !selectedYear) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;
    try {
      setLoading(true);
      const response = await reportsService.getTotalSalesByYear(shopId, selectedYear, targetPage, targetSize);
      if (latestRequestRef.current !== requestId) return;

      const items = response.items || [];
      const formatted = mapRecords(items);
      setRecords(formatted);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages || (response.totalRecords > 0 ? Math.ceil(response.totalRecords / targetSize) : 0));

      const salesTot = (typeof response.totalAmount === "number" && response.totalAmount > 0)
        ? response.totalAmount
        : items.reduce((acc, item: any) => acc + Number(item.total_amount ?? item.full_amount ?? 0), 0);
      const taxTot = items.reduce((acc, item: any) => acc + Number(item.total_tax ?? item.tax_amount ?? 0), 0);
      setMetrics({
        salesAmount: salesTot.toFixed(2),
        orderCount: response.totalRecords || items.length,
        taxAmount: taxTot.toFixed(2),
      });
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      console.error(err);
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
      const formattedRows: TableRow[] = mapRecords(items);

      setRecords(formattedRows);
      setServerTotalRecords(response.totalRecords);
      setServerTotalPages(response.totalPages || (response.totalRecords > 0 ? Math.ceil(response.totalRecords / targetSize) : 0));

      const salesTot = (typeof response.totalAmount === "number" && response.totalAmount > 0)
        ? response.totalAmount
        : items.reduce(
          (acc, item: any) => acc + Number(item.total_amount ?? item.full_amount ?? 0),
          0
        );
      const taxTot = items.reduce(
        (acc, item: any) => acc + Number(item.total_tax ?? item.tax_amount ?? 0),
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

  const exportToExcel = async () => {
    if (exporting) return;
    if (!shopId) return;

    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert("Excel export library is loading, please try again.");
      return;
    }

    setExporting(true);
    try {
      let rawItems: any[] = [];

      if (activeTab === "today") {
        rawItems = await reportsService.getExportTotalSalesByToday(shopId);
      } else if (activeTab === "this-week") {
        rawItems = await reportsService.getExportTotalSalesByWeek(shopId);
      } else if (activeTab === "month-wise") {
        rawItems = await reportsService.getExportTotalSalesByMonth(shopId, selectedMonth, selectedMonthYear);
      } else if (activeTab === "year-wise") {
        const res = await reportsService.getTotalSalesByYear(shopId, selectedYear, 1, serverTotalRecords > 0 ? serverTotalRecords : 100);
        rawItems = res.items || [];
      } else if (activeTab === "custom") {
        rawItems = await reportsService.getExportTotalSalesByDateWise(shopId, customFrom, customTo);
      }

      if (!rawItems || rawItems.length === 0) {
        alert("No data available to export");
        return;
      }

      const allRecords = mapRecords(rawItems);

      const headers = [
        "Date",
        "Order ID",
        "Status",
        "Customer Name",
        "Mobile No",
        "Payment Method",
        "Order Type",
        "Split Payment",
        `Total Amount (${currencySymbol})`,
        `Total Tax (${currencySymbol})`,
        `Total Charge (${currencySymbol})`,
        `Total Discount (${currencySymbol})`
      ];

      const rows = allRecords.map((r) => [
        r.date || "-",
        r.orderId || r.id || "-",
        r.status || "-",
        r.name || "-",
        r.phone || "-",
        r.payment || "-",
        r.type || "-",
        r.split || "-",
        parseFloat(r.amount || "0") || 0,
        parseFloat(r.tax || "0") || 0,
        parseFloat(r.charge || "0") || 0,
        parseFloat(r.discount || "0") || 0,
      ]);

      const totalSalesAmount = allRecords.reduce((acc, r) => acc + (parseFloat(r.amount || "0") || 0), 0);
      const totalTaxAmount = allRecords.reduce((acc, r) => acc + (parseFloat(r.tax || "0") || 0), 0);

      const reportTitle = `Total Sales Report — ${activeTab.toUpperCase()}`;
      const wsData: any[][] = [
        [reportTitle],
        [`Exported On: ${new Date().toLocaleString()}`],
        [],
        headers,
        ...rows,
        [],
        [
          "Total",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          totalSalesAmount,
          totalTaxAmount,
          "",
          ""
        ]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 }
      ];

      const fileName = `total_sales_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.utils.book_append_sheet(wb, ws, "Total Sales");
      XLSX.writeFile(wb, fileName);
    } catch (err: any) {
      console.error("Export to Excel error:", err);
      alert("Failed to export data to Excel. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const lastFetched = useRef<{ tab: string; shopId: number | null }>({ tab: "", shopId: null });

  useEffect(() => {
    if (!shopId) return;

    if (lastFetched.current.tab === activeTab && lastFetched.current.shopId === shopId) {
      return;
    }
    lastFetched.current = { tab: activeTab, shopId };

    if (activeTab === "today") {
      loadTodaySales(1, pageSize);
    } else if (activeTab === "this-week") {
      loadWeekSales(1, pageSize);
    }
  }, [shopId, activeTab]);

  const handleTabChange = (
    tab: "today" | "this-week" | "month-wise" | "year-wise" | "custom"
  ) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setPageNumber(1);
    setRecords([]);
    setServerTotalRecords(0);
    setServerTotalPages(0);
    setMetrics({ salesAmount: "0.00", orderCount: 0, taxAmount: "0.00" });

    if (tab === "today") {
      setHasSearched(true);
      lastFetched.current = { tab, shopId };
      loadTodaySales(1, pageSize);
    } else if (tab === "this-week") {
      setHasSearched(true);
      lastFetched.current = { tab, shopId };
      loadWeekSales(1, pageSize);
    } else {
      setHasSearched(false);
      lastFetched.current = { tab, shopId };
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    if (activeTab === "today") {
      loadTodaySales(newPage, pageSize);
    } else if (activeTab === "this-week") {
      loadWeekSales(newPage, pageSize);
    } else if (activeTab === "month-wise") {
      loadMonthSales(newPage, pageSize);
    } else if (activeTab === "year-wise") {
      loadYearSales(newPage, pageSize);
    } else if (activeTab === "custom") {
      loadCustomSales(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
    if (activeTab === "today") {
      loadTodaySales(1, newSize);
    } else if (activeTab === "this-week") {
      loadWeekSales(1, newSize);
    } else if (activeTab === "month-wise") {
      loadMonthSales(1, newSize);
    } else if (activeTab === "year-wise") {
      loadYearSales(1, newSize);
    } else if (activeTab === "custom") {
      loadCustomSales(1, newSize);
    }
  };

  const totalRecords = serverTotalRecords;
  const totalPages = serverTotalPages || (totalRecords > 0 ? Math.ceil(totalRecords / pageSize) : 1);
  const paginatedRecords = records;
  const shouldShowResults = activeTab === "today" || activeTab === "this-week" || hasSearched;

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

            {activeTab === "month-wise" && (
              <div className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
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
                <button
                  className="btn-action-teal"
                  onClick={() => {
                    setHasSearched(true);
                    setPageNumber(1);
                    loadMonthSales(1, pageSize);
                  }}
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

            {activeTab === "year-wise" && (
              <div className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
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
                <button
                  className="btn-action-teal"
                  onClick={() => {
                    setHasSearched(true);
                    setPageNumber(1);
                    loadYearSales(1, pageSize);
                  }}
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

            {activeTab === "custom" && (
              <div className="sub-filter-panel" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
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
                <button
                  className="btn-action-teal"
                  onClick={() => {
                    setHasSearched(true);
                    setPageNumber(1);
                    loadCustomSales(1, pageSize);
                  }}
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

            {shouldShowResults && (
              <>
                <div id="metrics-container" className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-chart-line" /></div>
                    <div className="metric-info"><h4>Total Sales</h4><p>{currencySymbol} {metrics.salesAmount}</p></div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-shopping-cart" /></div>
                    <div className="metric-info"><h4>Total Order Count</h4><p>{metrics.orderCount}</p></div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-file-invoice-dollar" /></div>
                    <div className="metric-info"><h4>Total Tax Amount</h4><p>{currencySymbol} {metrics.taxAmount}</p></div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0" }}>
                  <h3 style={{ fontSize: "17px", color: "#0aa89e", margin: 0, fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                    Description
                  </h3>
                </div>

                <ReportTableState loading={loading} hasData={paginatedRecords.length > 0} columns={12}>
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
                          <th>Total Amount ({currencySymbol})</th>
                          <th>Total tax ({currencySymbol})</th>
                          <th>Total Charge ({currencySymbol})</th>
                          <th>Total Discount ({currencySymbol})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={12} style={{ textAlign: "center", padding: "40px" }}>
                              Loading data...
                            </td>
                          </tr>
                        ) : paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                              No Records Found
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

                  <ReportTableFooter
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPageChange={(page) => handlePageChange(page)}
                    onPageSizeChange={(size) => handlePageSizeChange(size)}
                    disabled={loading}
                  />
                </ReportTableState>
              </>
            )}
          </div>
          <ReportStepFooter currentStepOverride={1} totalStepsOverride={25} />
        </main>
      </div>
    </div>
  );
}

