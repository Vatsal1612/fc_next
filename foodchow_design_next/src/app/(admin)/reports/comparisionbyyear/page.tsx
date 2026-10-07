"use client";

import { useEffect, useState } from "react";
import "./page.css";
import {
  reportsService,
  YearWiseComparison,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";

export default function ComparisionbyyearPage() {
  const shopId = useShopId();
  const [comparisonData, setComparisonData] = useState<YearWiseComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!shopId) return;
    const loadComparison = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getYearWiseComparison(shopId);
        setComparisonData(data);
      } catch (error) {
        console.error("Error loading comparison:", error);
        setComparisonData([]);
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [shopId]);

  const formatCurrency = (val: number | null | undefined): string => {
    const num = val ?? 0;
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCount = (val: number | null | undefined): string => {
    const num = val ?? 0;
    return num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const exportToExcel = (): void => {
    if (!comparisonData || comparisonData.length === 0) return;
    const rows: string[][] = [
      ["Details", "Previous Year", "Current Year"],
      ...comparisonData.map((item) => {
        const isAmount = item.data.toLowerCase().includes("amount");
        const prevVal = isAmount
          ? formatCurrency(item.previous_year)
          : formatCount(item.previous_year);
        const currVal = isAmount
          ? formatCurrency(item.current_year)
          : formatCount(item.current_year);
        return [item.data, prevVal, currVal];
      }),
    ];
    const csv = rows
      .map((r) => r.map((c) => '"' + c + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "item_report_yearly.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="pg-reports-comparisionbyyear">
      <div className="app-container">
        <main className="main-content">
          <div className="report-card">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Item Report</h1>
            </div>
            <p className="subtitle">Comparison of current year with previous year</p>

            <button className="export-btn" id="exportBtn" onClick={exportToExcel}>
              <i
                className="ti ti-download"
                style={{ fontSize: "15px", fontWeight: "bold" }}
              />{" "}
              Export to Excel
            </button>

            <div className="table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Previous Year</th>
                    <th>Current Year</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : comparisonData.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                        No Record Found
                      </td>
                    </tr>
                  ) : (
                    comparisonData.map((item, idx) => {
                      const isAmount = item.data.toLowerCase().includes("amount");
                      const prevVal = isAmount
                        ? formatCurrency(item.previous_year)
                        : formatCount(item.previous_year);
                      const currVal = isAmount
                        ? formatCurrency(item.current_year)
                        : formatCount(item.current_year);

                      return (
                        <tr key={idx}>
                          <td>{item.data}</td>
                          <td className="prev-val">{prevVal}</td>
                          <td className="curr-val">{currVal}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="nav-footer">
              <button className="nav-btn">
                <i className="ti ti-arrow-left" style={{ fontSize: "14px" }} /> Previous
              </button>
              <button className="nav-btn">
                Next <i className="ti ti-arrow-right" style={{ fontSize: "14px" }} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}