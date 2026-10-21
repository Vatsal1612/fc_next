"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  reportsService,
  type MonthComparisonItem,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import ReportStepFooter from "@/components/shared/ReportStepFooter";
import "./page.css";

export default function ComparisonbymonthPage() {
  const shopId = useShopId();
  const [rows, setRows] = useState<{ details: string; prev: string; curr: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const fmtNum = (n: number): string =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const fmtRs = (n: number): string =>
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDateParam = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  };

  const loadComparison = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const list: MonthComparisonItem[] = await reportsService.getMonthWiseComparison(
        shopId,
        formatDateParam(viewDate)
      );

      if (!list || list.length === 0) {
        setRows([]);
        return;
      }

      const formatted = list.map((item) => {
        const isAmount = item.data.toLowerCase().includes("amount");
        const prevVal = item.previous_month ?? 0;
        const currVal = item.current_month ?? 0;

        return {
          details: item.data,
          prev: isAmount ? fmtRs(prevVal) : fmtNum(prevVal),
          curr: isAmount ? fmtRs(currVal) : fmtNum(currVal),
        };
      });

      setRows(formatted);
    } catch (err) {
      console.error("MonthWiseComparision failed:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [shopId, viewDate]);

  const mIdx = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const prevDate = new Date(year, mIdx - 1, 1);
  const prevMIdx = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();

  const changeMonth = (dir: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  const exportToExcel = (): void => {
    if (!rows || rows.length === 0) {
      alert("No data available to export");
      return;
    }
    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert("Excel export library is loading, please try again.");
      return;
    }

    const wsData: any[][] = [
      [`Item Report - Comparison of ${monthNames[mIdx]} ${year} with ${monthNames[prevMIdx]} ${prevYear}`],
      [`Exported On: ${new Date().toLocaleString()}`],
      [],
      ["Details", `Previous month (${monthNames[prevMIdx].slice(0, 3)})`, `Current month (${monthNames[mIdx].slice(0, 3)})`],
      ...rows.map((r) => [r.details, r.prev, r.curr]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 25 }, { wch: 22 }, { wch: 22 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Comparison");
    XLSX.writeFile(wb, `item_report_monthly_comparison_${formatDateParam(viewDate)}.xlsx`);
  };

  return (
    <div id="pg-reports-comparisonbymonth">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      <div className="app-container">
        <div className="main-content">
          <div className="report-card">
            <div className="report-header">
              <h1 className="typ-page-heading">Item report</h1>
            </div>
            <p className="subtitle" id="subtitleText">
              Comparison of {monthNames[mIdx]} {year} with {monthNames[prevMIdx]} {prevYear}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "1.4rem" }}>
              <div className="month-nav" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => changeMonth(-1)}
                  title="Previous Month"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}
                >
                  <i className="fas fa-chevron-left" />
                </button>
                <span style={{ fontSize: "14px", fontWeight: "600", minWidth: "140px", textAlign: "center" }}>
                  {monthNames[mIdx]} {year}
                </span>
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => changeMonth(1)}
                  title="Next Month"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}
                >
                  <i className="fas fa-chevron-right" />
                </button>
              </div>

              <button className="btn-action btn-export" onClick={exportToExcel} style={{ margin: 0 }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "18px", height: "18px", marginRight: "6px" }}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                EXPORT TO EXCEL
              </button>
            </div>

            <table id="reportTable">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Previous month ({monthNames[prevMIdx].slice(0, 3)})</th>
                  <th>Current month ({monthNames[mIdx].slice(0, 3)})</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: 24 }}>
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.details}</td>
                      <td>{r.prev}</td>
                      <td>{r.curr}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ReportStepFooter currentStepOverride={12} totalStepsOverride={25} />
        </div>
      </div>
    </div>
  );
}
