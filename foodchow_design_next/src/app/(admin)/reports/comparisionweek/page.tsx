// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/comparisionweek.html → React.
//  *
//  * Pixel-perfect mechanical port. The original markup is rendered inside a single
//  * `#pg-reports-comparisionweek` wrapper that scopes the page CSS. The original
//  * inline <script> is ported into one useEffect, wiring behaviour with
//  * addEventListener (with cleanup) so there is no hydration mismatch.
//  *
//  * The header/sidebar markup that the original page left empty is dropped — the
//  * admin shell provides those. The dropdown/sidebar-navigation script targets
//  * elements that only exist in the shell, so those listeners are kept but guarded
//  * with optional chaining (they simply no-op on this page, matching the original).
//  */
// export default function ComparisionweekPage() {
//   useEffect(() => {
//     // ── Report actions ──
//     const goToPrev = (): void => {
//       alert("Navigating to previous step");
//     };
//     const goToNext = (): void => {
//       alert("Navigating to next step");
//     };

//     const exportToExcel = (): void => {
//       const rows: string[][] = [
//         ["Details", "Previous Week", "Current Week", "Change"],
//         ["Total Orders", "0", "5", "+5"],
//         ["Total Amount", "0.00", "1030.00", "+100%"],
//       ];
//       const csv = rows
//         .map((r) => r.map((c) => '"' + c + '"').join(","))
//         .join("\n");
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "item_report_weekly.csv";
//       a.click();
//       URL.revokeObjectURL(url);
//     };

//     // ── Close any open dropdown menus when clicking anywhere ──
//     const onDocClick = (): void => {
//       document
//         .querySelectorAll<HTMLElement>(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", onDocClick);

//     // ── Wire report buttons (replaces inline on* handlers) ──
//     const exportBtn = document.querySelector<HTMLButtonElement>(".export-btn");
//     const prevBtn = document.querySelector<HTMLButtonElement>(
//       ".nav-bar .nav-btn:first-child"
//     );
//     const nextBtn = document.querySelector<HTMLButtonElement>(
//       ".nav-bar .nav-btn:last-child"
//     );
//     exportBtn?.addEventListener("click", exportToExcel);
//     prevBtn?.addEventListener("click", goToPrev);
//     nextBtn?.addEventListener("click", goToNext);

//     return () => {
//       document.removeEventListener("click", onDocClick);
//       exportBtn?.removeEventListener("click", exportToExcel);
//       prevBtn?.removeEventListener("click", goToPrev);
//       nextBtn?.removeEventListener("click", goToNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-comparisionweek">
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />
//       <link
//         rel="stylesheet"
//         href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
//       />

//       <div className="app-container">
//         <div className="main-content">
//           <div className="report-wrap">
//             <div className="report-header">
//               <p className="report-title">Item report</p>
//               <button className="help-btn">
//                 <i className="ti ti-help-circle" /> Help
//               </button>
//             </div>

//             <p className="subtitle">Comparison of current week with previous week</p>

//             <button className="export-btn">
//               <i className="ti ti-download" /> Export to Excel
//             </button>

//             <table className="report-table">
//               <thead>
//                 <tr>
//                   <th>Details</th>
//                   <th>Previous week</th>
//                   <th>Current week</th>
//                   <th>Change</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Total orders</td>
//                   <td className="prev-val">0</td>
//                   <td className="curr-val">5</td>
//                   <td>
//                     <span className="change-pill change-up">
//                       <i className="ti ti-arrow-up" style={{ fontSize: "11px" }} /> +5
//                     </span>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>Total amount</td>
//                   <td className="prev-val">₹0.00</td>
//                   <td className="curr-val">₹1,030.00</td>
//                   <td>
//                     <span className="change-pill change-up">
//                       <i className="ti ti-arrow-up" style={{ fontSize: "11px" }} /> +100%
//                     </span>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>

//             <div className="nav-bar">
//               <button className="nav-btn">
//                 <i className="ti ti-arrow-left" /> Previous
//               </button>
//               <button className="nav-btn">
//                 Next <i className="ti ti-arrow-right" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import "./page.css";
import { reportsService, WeekComparison } from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";

export default function ComparisionweekPage() {
  const shopId = useShopId();
  const [comparisonData, setComparisonData] = useState<WeekComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await reportsService.fetchWeekComparison(shopId);
        setComparisonData(data);
      } catch (err) {
        console.error("Error fetching week comparison:", err);
        setComparisonData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  const formatCurrency = (value: number | null | undefined): string => {
    const num = value ?? 0;
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getChangeInfo = (
    current: number | null | undefined,
    previous: number | null | undefined,
    isAmount: boolean
  ) => {
    const curr = current ?? 0;
    const prev = previous ?? 0;

    if (prev === 0) {
      if (curr === 0) {
        return { change: isAmount ? "0%" : "0", isPositive: false, isZero: true };
      }
      return {
        change: isAmount ? "+100%" : `+${curr}`,
        isPositive: true,
        isZero: false,
      };
    }

    const diff = curr - prev;

    if (diff === 0) {
      return { change: isAmount ? "0%" : "0", isPositive: false, isZero: true };
    }

    if (isAmount) {
      const percentChange = (diff / prev) * 100;
      const formattedChange =
        percentChange % 1 === 0
          ? `${percentChange.toFixed(0)}%`
          : `${percentChange.toFixed(1)}%`;

      return {
        change: diff > 0 ? `+${formattedChange}` : formattedChange,
        isPositive: diff > 0,
        isZero: false,
      };
    } else {
      return {
        change: diff > 0 ? `+${diff}` : `${diff}`,
        isPositive: diff > 0,
        isZero: false,
      };
    }
  };

  const exportToExcel = (): void => {
    if (!comparisonData || comparisonData.length === 0) return;
    const rows: string[][] = [
      ["Details", "Previous week", "Current week", "Change"],
      ...comparisonData.map((item) => {
        const isAmount =
          item.data.toLowerCase().includes("amount") ||
          item.data.toLowerCase().includes("total amount");
        const prevValue = isAmount
          ? formatCurrency(item.previous_week)
          : (item.previous_week ?? 0).toString();
        const currValue = isAmount
          ? formatCurrency(item.current_week)
          : (item.current_week ?? 0).toString();
        const changeInfo = getChangeInfo(
          item.current_week,
          item.previous_week,
          isAmount
        );
        return [item.data, prevValue, currValue, changeInfo.change];
      }),
    ];
    const csv = rows
      .map((r) => r.map((c) => '"' + c + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "item_report_weekly.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="pg-reports-comparisionweek">
      <div className="app-container">
        <div className="main-content">
          <div className="report-wrap">
            <div className="report-header">
              <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Item report</h1>
            </div>

            <p className="subtitle">Comparison of current week with previous week</p>

            <button className="export-btn" onClick={exportToExcel}>
              <i className="ti ti-download" /> Export to Excel
            </button>

            <table className="report-table">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Previous week</th>
                  <th>Current week</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      Loading data...
                    </td>
                  </tr>
                ) : comparisonData.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      No comparison data available
                    </td>
                  </tr>
                ) : (
                  comparisonData.map((item, index) => {
                    const isAmount =
                      item.data.toLowerCase().includes("amount") ||
                      item.data.toLowerCase().includes("total amount");
                    const prevValue = isAmount
                      ? formatCurrency(item.previous_week)
                      : (item.previous_week ?? 0).toString();
                    const currValue = isAmount
                      ? formatCurrency(item.current_week)
                      : (item.current_week ?? 0).toString();
                    const changeInfo = getChangeInfo(
                      item.current_week,
                      item.previous_week,
                      isAmount
                    );

                    return (
                      <tr key={index}>
                        <td>{item.data}</td>
                        <td className="prev-val">{prevValue}</td>
                        <td className="curr-val">{currValue}</td>
                        <td>
                          {changeInfo.isZero ? (
                            <span
                              className="change-pill"
                              style={{
                                backgroundColor: "#e2e8f0",
                                color: "#64748b",
                              }}
                            >
                              {changeInfo.change}
                            </span>
                          ) : (
                            <span
                              className={`change-pill ${changeInfo.isPositive ? "change-up" : "change-down"
                                }`}
                            >
                              <i
                                className={`ti ti-arrow-${changeInfo.isPositive ? "up" : "down"
                                  }`}
                                style={{ fontSize: "11px" }}
                              />{" "}
                              {changeInfo.change}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="nav-bar">
              <button className="nav-btn">
                <i className="ti ti-arrow-left" /> Previous
              </button>
              <button className="nav-btn">
                Next <i className="ti ti-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}