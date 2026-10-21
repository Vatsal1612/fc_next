"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import "./page.css";
import {
  reportsService,
  YearWiseComparison,
} from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";
import ReportStepFooter from "@/components/shared/ReportStepFooter";

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
    if (!comparisonData || comparisonData.length === 0) {
      alert("No data available to export");
      return;
    }
    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert("Excel export library is loading, please try again.");
      return;
    }

    const wsData: any[][] = [
      ["Item Report - Comparison of Current Year with Previous Year"],
      [`Exported On: ${new Date().toLocaleString()}`],
      [],
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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Yearly Comparison");
    XLSX.writeFile(wb, `item_report_yearly_comparison_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div id="pg-reports-comparisionbyyear">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="report-header">
                <h1 className="report-title typ-page-heading" style={{ margin: 0 }}>Item Report</h1>
                <button
                  className="btn-help"
                  type="button"
                  onClick={() => alert("Help & Support - Item Report (Comparison By Year)")}
                >
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <p className="subtitle" style={{ margin: 0 }}>Comparison of current year with previous year</p>

                <button className="btn-action btn-export" id="exportBtn" style={{ margin: 0 }} onClick={exportToExcel}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "18px", height: "18px", marginRight: "6px" }}
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

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
                        <td colSpan={3} className="report-no-records" style={{ textAlign: "center", padding: "40px" }}>
                          No Records Found
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
            </div>

            <ReportStepFooter currentStepOverride={13} totalStepsOverride={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
