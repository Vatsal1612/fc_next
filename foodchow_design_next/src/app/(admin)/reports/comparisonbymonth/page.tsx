"use client";

import { useEffect, useState } from "react";
import {
  reportsService,
  type MonthComparisonItem,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
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
    if (!rows || rows.length === 0) return;
    const csvRows: string[][] = [
      ["Details", `Previous month (${monthNames[prevMIdx].slice(0, 3)})`, `Current month (${monthNames[mIdx].slice(0, 3)})`],
      ...rows.map((r) => [r.details, r.prev, r.curr]),
    ];
    const csv = csvRows
      .map((r) => r.map((c) => '"' + c + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `month_comparison_${formatDateParam(viewDate)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="pg-reports-comparisonbymonth">
      <div className="app-container">
        <div className="main-content">
          <div className="report-card">
            <div className="report-header">
              <h1 className="typ-page-heading">Item report</h1>
            </div>
            <p className="subtitle" id="subtitleText">
              Comparison of {monthNames[mIdx]} {year} with {monthNames[prevMIdx]} {prevYear}
            </p>

            <button className="btn-export" onClick={exportToExcel}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export to Excel
            </button>

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
                    <td colSpan={3} style={{ textAlign: "center", padding: 24 }}>
                      No Record Found
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
          <div className="footer-nav">
            <button className="btn-nav" onClick={() => changeMonth(-1)}>
              <i className="fas fa-arrow-left" /> Previous
            </button>
            <button className="btn-nav" onClick={() => changeMonth(1)}>
              Next <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}