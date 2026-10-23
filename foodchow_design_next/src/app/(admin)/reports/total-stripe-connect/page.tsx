"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService } from "@/api/services/report.service";
import ReportTableFooter from "@/components/shared/ReportTableFooter";
import ReportTableState from "@/components/shared/ReportTableState";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import { useShopId } from "@/utils/shop";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";

type SalesRecord = {
  date: string;
  id: string;
  amount: string;
  platformfee: string;
  commission: string;
  status: string;
  shopamount: string;
  stripecharge: string;
};

export default function TotalStripeConnectPage() {
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const shopId = useShopId();
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [salesAmount, setSalesAmount] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "monthly" | "yearly" | "custom">("today");
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [fromDate, setFromDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const loadMonthData = async (month: string, year: string) => {
    try {
      setPageNumber(1);
      setLoading(true);
      const response = await reportsService.getTotalOnlinePaymentMonth(
        shopId,
        month,
        year
      );

      const recs: SalesRecord[] = response.map(item => ({
        date: `${item.created_date.Day}/${item.created_date.Month}/${item.created_date.Year}`,
        id: item.order_id,
        amount: item.amount.toString(),
        platformfee: item.platform_fee,
        commission: item.foodchowcommision,
        status: item.status,
        shopamount: item.shop_received_amount,
        stripecharge: item.stripe_fees,
      }));

      setSalesAmount(response.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2));
      setRecords(recs);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
      setSalesAmount("0.00");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadYearData = async (year: string) => {
    try {
      setPageNumber(1);
      setLoading(true);
      const response = await reportsService.getTotalOnlinePaymentYear(
        shopId,
        year
      );

      const recs: SalesRecord[] = response.map(item => ({
        date: `${item.created_date.Day}/${item.created_date.Month}/${item.created_date.Year}`,
        id: item.order_id,
        amount: item.amount.toString(),
        platformfee: item.platform_fee,
        commission: item.foodchowcommision,
        status: item.status,
        shopamount: item.shop_received_amount,
        stripecharge: item.stripe_fees,
      }));

      setSalesAmount(response.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2));
      setRecords(recs);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
      setSalesAmount("0.00");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDateWiseData = async (from: string, to: string) => {
    try {
      setPageNumber(1);
      setLoading(true);
      const response = await reportsService.getTotalOnlinePaymentDateWise(
        shopId,
        from,
        to
      );

      const recs: SalesRecord[] = response.map(item => ({
        date: `${item.created_date.Day}/${item.created_date.Month}/${item.created_date.Year}`,
        id: item.order_id,
        amount: item.amount.toString(),
        platformfee: item.platform_fee,
        commission: item.foodchowcommision,
        status: item.status,
        shopamount: item.shop_received_amount,
        stripecharge: item.stripe_fees,
      }));

      setSalesAmount(response.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2));
      setRecords(recs);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
      setSalesAmount("0.00");
    } finally {
      setLoading(false);
    }
  };

  //   today: {
  //     titleText: "Total Online Amount",
  //     salesAmount: "543.00",
  //     records: [
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "4312137", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "32671391", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //     ],
  //   },
  //   weekly: {
  //     records: [
  //       { date: "7/6/2026", id: "59594044", amount: "237.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "223.19", stripecharge: "7.81" },
  //       { date: "7/6/2026", id: "34514593", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.02" },
  //       { date: "8/6/2026", id: "85759114", amount: "194.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "181.29", stripecharge: "7.11" },
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "4312137", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "32671391", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //     ],
  //   },
  //   "monthly-sample": {
  //     salesAmount: "2,357.00",
  //     records: [
  //       { date: "1/6/2026", id: "59629935", amount: "191.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "179.42", stripecharge: "6.38" },
  //       { date: "2/6/2026", id: "83483003", amount: "214.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "200.60", stripecharge: "7.80" },
  //       { date: "3/6/2026", id: "85759114", amount: "194.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "181.29", stripecharge: "7.11" },
  //       { date: "4/6/2026", id: "70200871", amount: "259.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "244.22", stripecharge: "9.38" },
  //       { date: "5/6/2026", id: "32017821", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "6/6/2026", id: "70307018", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //       { date: "7/6/2026", id: "59594044", amount: "237.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "223.19", stripecharge: "7.81" },
  //       { date: "7/6/2026", id: "34514593", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.02" },
  //       { date: "8/6/2026", id: "85759114", amount: "194.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "181.29", stripecharge: "7.11" },
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "4312137", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "32671391", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //     ],
  //   },
  //   "yearly-sample": {
  //     salesAmount: "2,357.00",
  //     records: [
  //       { date: "1/6/2026", id: "59629935", amount: "191.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "179.42", stripecharge: "6.38" },
  //       { date: "2/6/2026", id: "83483003", amount: "214.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "200.60", stripecharge: "7.80" },
  //       { date: "3/6/2026", id: "85759114", amount: "194.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "181.29", stripecharge: "7.11" },
  //       { date: "4/6/2026", id: "70200871", amount: "259.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "244.22", stripecharge: "9.38" },
  //       { date: "5/6/2026", id: "32017821", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "6/6/2026", id: "70307018", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //       { date: "7/6/2026", id: "59594044", amount: "237.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "223.19", stripecharge: "7.81" },
  //       { date: "7/6/2026", id: "34514593", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.02" },
  //       { date: "8/6/2026", id: "85759114", amount: "194.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "181.29", stripecharge: "7.11" },
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "4312137", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "32671391", amount: "183.00", platformfee: "1.00", commission: "0.00", status: "succeeded", shopamount: "175.00", stripecharge: "6.71" },
  //     ],
  //   },
  //   "custom-sample": {
  //     salesAmount: "360.00",
  //     records: [
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //       { date: "9/6/2026", id: "26284703", amount: "180.00", platformfee: "1.00", commission: "5.00", status: "succeeded", shopamount: "168.00", stripecharge: "6.00" },
  //     ],
  //   },
  // };

  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedRecords = records.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const loadTodayData = async () => {
    try {
      setPageNumber(1);
      setLoading(true);
      const response = await reportsService.getTotalOnlinePaymentToday(shopId);

      const recs: SalesRecord[] = response.map((item) => ({
        date: `${item.created_date.Day}/${item.created_date.Month}/${item.created_date.Year}`,
        id: item.order_id,
        amount: item.amount.toString(),
        platformfee: item.platform_fee,
        commission: item.foodchowcommision,
        status: item.status,
        shopamount: item.shop_received_amount,
        stripecharge: item.stripe_fees,
      }));

      setSalesAmount(
        response.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)
      );
      setRecords(recs);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
      setSalesAmount("0.00");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekData = async () => {
    try {
      setPageNumber(1);
      setLoading(true);
      const response = await reportsService.getTotalOnlinePaymentWeekly(shopId);

      const recs: SalesRecord[] = response.map((item) => ({
        date: `${item.created_date.Day}/${item.created_date.Month}/${item.created_date.Year}`,
        id: item.order_id,
        amount: item.amount.toString(),
        platformfee: item.platform_fee,
        commission: item.foodchowcommision,
        status: item.status,
        shopamount: item.shop_received_amount,
        stripecharge: item.stripe_fees,
      }));

      setSalesAmount(
        response.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)
      );
      setRecords(recs);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
      setSalesAmount("0.00");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const applyMonthFilter = () => {
    if (selectedMonth && selectedMonthYear) {
      loadMonthData(selectedMonth, selectedMonthYear);
    }
  };

  const applyYearlyFilter = () => {
    if (selectedYear) {
      loadYearData(selectedYear);
    }
  };

  const applyDateFilter = () => {
    if (fromDate && toDate) {
      loadDateWiseData(fromDate, toDate);
    }
  };

  const exportToExcel = () => {
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
      `Amount (${currencySymbol})`,
      `Platform Fee (${currencySymbol})`,
      `Commission (${currencySymbol})`,
      "Status",
      `Shop Received Amount (${currencySymbol})`,
      `Stripe Charge (${currencySymbol})`,
    ];

    const wsData = [
      ["Total Online Payment Reports"],
      [],
      headers,
      ...records.map((r) => [
        r.date,
        r.id,
        r.amount,
        r.platformfee,
        r.commission,
        r.status,
        r.shopamount,
        r.stripecharge,
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Stripe Connect");
    XLSX.writeFile(wb, `Total_Online_Payment_Report.xlsx`);
  };

  useEffect(() => {
    if (shopId) {
      loadTodayData();
    }
  }, [shopId]);

  return (
    <div id="pg-reports-total-stripe-connect">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      <div className="app-container">
        <main className="main-content">
          <div className="content-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 className="typ-page-heading"
                style={{
                  color: "var(--text-dark)",
                }}
              >
                Total Online Payment Reports
              </h2>
            </div>

            <div className="filter-row-container">
              <div className="filter-tabs">
                <button
                  className={`btn-sales-filter ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => {
                    if (activeTab === "today") return;
                    setActiveTab("today");
                    setRecords([]);
                    loadTodayData();
                  }}
                >
                  Today
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => {
                    if (activeTab === "weekly") return;
                    setActiveTab("weekly");
                    setRecords([]);
                    loadWeekData();
                  }}
                >
                  This Week
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "monthly" ? "active" : ""}`}
                  onClick={() => {
                    if (activeTab === "monthly") return;
                    setActiveTab("monthly");
                    setRecords([]);
                    setSalesAmount("0.00");
                    setHasSearched(false);
                  }}
                >
                  Month Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "yearly" ? "active" : ""}`}
                  onClick={() => {
                    if (activeTab === "yearly") return;
                    setActiveTab("yearly");
                    setRecords([]);
                    setSalesAmount("0.00");
                    setHasSearched(false);
                  }}
                >
                  Year Wise
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "custom" ? "active" : ""}`}
                  onClick={() => {
                    if (activeTab === "custom") return;
                    setActiveTab("custom");
                    setRecords([]);
                    setSalesAmount("0.00");
                    setHasSearched(false);
                  }}
                >
                  Custom
                </button>
              </div>

              {(activeTab === "today" || activeTab === "weekly") && (
                <button
                  className="btn-action btn-export"
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

            <div id="month-filter-panel" className="sub-filter-panel" style={{ display: (activeTab as string) === "monthly" ? "flex" : "none" }}>
              <div className="input-group">
                <label>Select Month :</label>
                <select
                  id="select-month"
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
                  id="select-year"
                  className="input-control"
                  value={selectedMonthYear}
                  onChange={(e) => setSelectedMonthYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-action-teal" onClick={applyMonthFilter}>
                GET DATA
              </button>
              <button className="btn-action btn-export" onClick={exportToExcel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                EXPORT TO EXCEL
              </button>
            </div>

            <div id="year-filter-panel" className="sub-filter-panel" style={{ display: (activeTab as string) === "yearly" ? "flex" : "none" }}>
              <div className="input-group">
                <label>Select Year :</label>
                <select
                  id="select-year-yearly"
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
              <button className="btn-action-teal" onClick={applyYearlyFilter}>
                GET DATA
              </button>
              <button className="btn-action btn-export" onClick={exportToExcel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                EXPORT TO EXCEL
              </button>
            </div>

            <div id="custom-filter-panel" className="sub-filter-panel" style={{ display: (activeTab as string) === "custom" ? "flex" : "none" }}>
              <div className="input-group">
                <label>From</label>
                <input
                  type="date"
                  className="input-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>To</label>
                <input
                  type="date"
                  className="input-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <button className="btn-action-teal" onClick={applyDateFilter}>
                GET DATA
              </button>
              <button className="btn-action btn-export" onClick={exportToExcel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px", marginRight: "6px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                EXPORT TO EXCEL
              </button>
            </div>

            {(activeTab === "today" || activeTab === "weekly" || hasSearched) && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0" }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      color: "#0aa89e",
                      margin: 0,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Description (Total: {currencySymbol}{salesAmount})
                  </h3>
                </div>

                <ReportTableState loading={loading} hasData={paginatedRecords.length > 0} columns={8}>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order ID</th>
                          <th>Amount ({currencySymbol})</th>
                          <th>Platform Fee ({currencySymbol})</th>
                          <th>Commission ({currencySymbol})</th>
                          <th>Status</th>
                          <th>Shop Received Amount ({currencySymbol})</th>
                          <th>Stripe Charge ({currencySymbol})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                              No Records Found
                            </td>
                          </tr>
                        ) : (
                          paginatedRecords.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.date}</td>
                              <td>{row.id}</td>
                              <td>{row.amount}</td>
                              <td>{row.platformfee}</td>
                              <td>{row.commission}</td>
                              <td>{row.status}</td>
                              <td>{row.shopamount}</td>
                              <td>{row.stripecharge}</td>
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
                    disabled={loading}
                  />
                </ReportTableState>
              </>
            )}
          </div>
          <ReportStepFooter currentStepOverride={25} totalStepsOverride={25} />
        </main>
      </div>
    </div>
  );
}

