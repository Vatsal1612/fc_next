"use client";

import { useState, useEffect } from "react";
import "./page.css";
import { reportsService } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

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
  const shopId = useShopId();
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [salesAmount, setSalesAmount] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [activeTab, setActiveTab] = useState<"today" | "weekly">("today");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  useEffect(() => {
    if (shopId) {
      loadTodayData();
    }
  }, [shopId]);

  return (
    <div id="pg-reports-total-stripe-connect">
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
                    setActiveTab("today");
                    loadTodayData();
                  }}
                >
                  Today
                </button>
                <button
                  className={`btn-sales-filter ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("weekly");
                    loadWeekData();
                  }}
                >
                  Weekly
                </button>
              </div>

              <button
                id="default-export-btn"
                className="btn-action-teal btn-export-excel"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                &nbsp;EXPORT TO EXCEL
              </button>
            </div>

            <div id="month-filter-panel" className="sub-filter-panel" style={{ display: "none" }}>
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
            </div>

            <div id="year-filter-panel" className="sub-filter-panel" style={{ display: "none" }}>
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
            </div>

            <div id="custom-filter-panel" className="sub-filter-panel" style={{ display: "none" }}>
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
            </div>

            <h3
              style={{
                fontSize: "17px",
                color: "var(--text-dark)",
                margin: "18px 0",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
              }}
            >
              Description (Total: ${salesAmount})
            </h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Amount (Rs.)</th>
                    <th>Platform Fee (Rs.)</th>
                    <th>Commission (Rs.)</th>
                    <th>Status</th>
                    <th>Shop Received Amount (Rs.)</th>
                    <th>Stripe Charge (Rs.)</th>
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
                        No data found
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

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
        </main>
      </div>
    </div>
  );
}

