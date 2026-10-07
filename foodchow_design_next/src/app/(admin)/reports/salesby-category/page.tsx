"use client";

import { useEffect, useState, useRef } from "react";
import "./page.css";
import {
  reportsService,
  SalesByCategory,
} from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

/**
 * reports/salesby-category.html → React.
 */
export default function SalesbyCategoryPage() {
  const shopId = useShopId();

  const [categorySales, setCategorySales] = useState<SalesByCategory[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(() =>
    String(new Date().getFullYear())
  );
  const [activeTab, setActiveTab] = useState<string>("today");
  const lastFetched = useRef<{ tab: string; shopId: number | null; page: number }>({ tab: "", shopId: null, page: 0 });

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  const [serverTotalRecords, setServerTotalRecords] = useState(0);
  const totalRecords = serverTotalRecords || categorySales.length;
  const totalPages = Math.max(serverTotalPages, Math.ceil(totalRecords / pageSize) || 1);

  const displayedSales = categorySales;

  useEffect(() => {
    if (!shopId) return;
    if (
      lastFetched.current.tab === activeTab &&
      lastFetched.current.shopId === shopId &&
      lastFetched.current.page === pageNumber
    ) {
      return;
    }

    if (activeTab === "today" || activeTab === "this-week") {
      lastFetched.current = { tab: activeTab, shopId, page: pageNumber };
      triggerFilterDataFetch(activeTab);
    }
  }, [shopId, activeTab, pageNumber]);

  async function triggerFilterDataFetch(type: string) {
    if (type === "today") {
      try {
        const res = await reportsService.getTodaySalesByCategory(shopId, pageNumber, pageSize);
        setCategorySales(res?.items || []);
        if (res?.totalRecords) setServerTotalRecords(res.totalRecords);
        if (res?.totalPages) setServerTotalPages(res.totalPages);
      } catch (err) {
        console.log(err);
        setCategorySales([]);
      }
      return;
    }

    if (type === "day-wise") {
      if (!selectedDate) {
        alert("Please select date");
        return;
      }
      try {
        const res = await reportsService.getDayWiseSalesByCategory(
          shopId,
          selectedDate,
          pageNumber,
          pageSize
        );
        setCategorySales(res?.items || []);
        if (res?.totalRecords) setServerTotalRecords(res.totalRecords);
        if (res?.totalPages) setServerTotalPages(res.totalPages);
      } catch (err) {
        console.log(err);
        setCategorySales([]);
      }
    }

    if (type === "this-week") {
      try {
        const res = await reportsService.getWeekSalesByCategory(shopId, 1, pageSize);
        setCategorySales(res?.items || []);
        if (res?.totalRecords) setServerTotalRecords(res.totalRecords);
        if (res?.totalPages) setServerTotalPages(res.totalPages);
      } catch (err) {
        console.log(err);
        setCategorySales([]);
      }
    }

    if (type === "month") {
      if (!selectedMonth || !selectedYear) {
        alert("Please select Month and Year");
        return;
      }
      try {
        const res = await reportsService.getMonthSalesByCategory(
          shopId,
          selectedMonth,
          selectedYear,
          1,
          pageSize
        );
        setCategorySales(res?.items || []);
        if (res?.totalRecords) setServerTotalRecords(res.totalRecords);
        if (res?.totalPages) setServerTotalPages(res.totalPages);
      } catch (err) {
        console.log(err);
        setCategorySales([]);
      }
    }

    if (type === "year") {
      if (!selectedYear) {
        alert("Please select Year");
        return;
      }
      try {
        const res = await reportsService.getYearSalesByCategory(
          shopId,
          selectedYear,
          1,
          pageSize
        );
        setCategorySales(res?.items || []);
        if (res?.totalRecords) setServerTotalRecords(res.totalRecords);
        if (res?.totalPages) setServerTotalPages(res.totalPages);
      } catch (err) {
        console.log(err);
        setCategorySales([]);
      }
    }
  }

  useEffect(() => {
    const switchFilterView = (
      filterKey: string,
      buttonElement: HTMLElement | null
    ): void => {
      if (activeTab !== filterKey) {
        setPageNumber(1);
        setActiveTab(filterKey);
      }
      document
        .querySelectorAll(".btn-sales-filter")
        .forEach((btn) => btn.classList.remove("active"));
      if (buttonElement) buttonElement.classList.add("active");

      const todayPanel = document.getElementById("today-panel");
      const dayPanel = document.getElementById("day-wise-panel");
      const weekPanel = document.getElementById("this-week-panel");
      const monthPanel = document.getElementById("month-wise-panel");
      const yearPanel = document.getElementById("year-wise-panel");

      if (todayPanel) todayPanel.style.display = "none";
      if (dayPanel) dayPanel.style.display = "none";
      if (weekPanel) weekPanel.style.display = "none";
      if (monthPanel) monthPanel.style.display = "none";
      if (yearPanel) yearPanel.style.display = "none";

      if (filterKey === "today") {
        if (todayPanel) todayPanel.style.display = "none";
      } else if (filterKey === "day-wise") {
        setCategorySales([]);
        if (dayPanel) dayPanel.style.display = "flex";
      } else if (filterKey === "this-week") {
        setCategorySales([]);
        if (weekPanel) weekPanel.style.display = "none";
        triggerFilterDataFetch("this-week");
      } else if (filterKey === "month") {
        setCategorySales([]);
        if (monthPanel) monthPanel.style.display = "flex";
      } else if (filterKey === "year") {
        setCategorySales([]);
        if (yearPanel) yearPanel.style.display = "flex";
      }
    };

    const filterButtons =
      document.querySelectorAll<HTMLButtonElement>(".btn-sales-filter");
    const filterKeys = ["today", "day-wise", "this-week", "month", "year"];
    const filterHandlers: Array<[HTMLButtonElement, () => void]> = [];
    filterButtons.forEach((btn, index) => {
      const key = filterKeys[index];
      const handler = (): void => switchFilterView(key, btn);
      btn.addEventListener("click", handler);
      filterHandlers.push([btn, handler]);
    });

    const exportClickHandler = (e: MouseEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".dynamic-export-btn")) {
        window.alert("Exporting to Excel...");
      }
    };
    document.addEventListener("click", exportClickHandler);

    return () => {
      filterHandlers.forEach(([btn, handler]) =>
        btn.removeEventListener("click", handler)
      );
      document.removeEventListener("click", exportClickHandler);
    };
  }, []);

  return (
    <div id="pg-reports-salesby-category">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <div className="app-container">
        <main className="main-content">
          <div className="content-card">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Sales by Categories</h1>
              <div className="report-header-actions">
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
            </div>

            <div className="filter-row-container">
              <div className="filter-tabs">
                <button className="btn-sales-filter active">Today</button>
                <button className="btn-sales-filter">Day Wise</button>
                <button className="btn-sales-filter">This Week</button>
                <button className="btn-sales-filter">Month Wise</button>
                <button className="btn-sales-filter">Year Wise</button>
              </div>

              <button className="btn-action-teal btn-export-excel dynamic-export-btn">
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

            <div
              id="today-panel"
              className="sub-filter-panel"
              style={{ display: "none", marginTop: "24px", marginBottom: "32px" }}
            ></div>

            <div id="day-wise-panel" className="sub-filter-panel">
              <div className="input-group">
                <label>Date :</label>
                <input type="date" className="input-control" value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <button className="btn-action-teal"
                onClick={() => triggerFilterDataFetch("day-wise")}
              >GET DATA</button>
            </div>

            <div
              id="this-week-panel"
              className="sub-filter-panel"
              style={{ marginTop: "24px", marginBottom: "32px" }}
            ></div>

            <div id="month-wise-panel" className="sub-filter-panel">
              <div className="input-group">
                <label>Select Month :</label>
                <select className="input-control"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}>
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
                <select className="input-control"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-action-teal"
                onClick={() => triggerFilterDataFetch("month")}>
                GET DATA
              </button>
            </div>

            <div id="year-wise-panel" className="sub-filter-panel">
              <div className="input-group">
                <label>Select Year :</label>
                <select className="input-control" value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-action-teal"
                onClick={() => triggerFilterDataFetch("year")}>
                GET DATA
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "17px", color: "var(--text-dark)", margin: 0, fontWeight: 700 }}>
                Details
              </h3>
              <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Show</span>
                <select
                  className="input-control"
                  style={{ width: "auto", padding: "2px 6px", fontSize: "13px" }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
                {totalRecords > 0 && (
                  <span style={{ marginLeft: "8px" }}>
                    ({(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords})
                  </span>
                )}
              </div>
            </div>

            <div className="items-table-wrapper">
              <table className="items-table">
                <thead id="table-header-root">
                  <tr>
                    <th style={{ width: "20%" }}>Date</th>
                    <th style={{ width: "30%" }}>Category Name</th>
                    <th style={{ width: "25%" }}>Quantity</th>
                    <th style={{ width: "25%" }}>Total Amount (Rs.)</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedSales.length > 0 ? (
                    displayedSales.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.trans_date ? `${item.trans_date.Day}/${item.trans_date.Month}/${item.trans_date.Year}` : "-"}
                        </td>
                        <td>{item.cate_name}</td>
                        <td>{item.total_quantity}</td>
                        <td>{item.total_amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          fontWeight: 600,
                        }}
                      >
                        No Record Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <ReportPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(page) => setPageNumber(page)}
            />
          </div>

          <div className="wizard-navigation-footer">
            <button className="btn-wizard-prev">
              <i className="fas fa-chevron-left" /> PREVIOUS
            </button>
            <button className="btn-wizard-next">
              NEXT <i className="fas fa-chevron-right" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}