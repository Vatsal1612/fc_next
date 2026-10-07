// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/sales-by-hour.html → React.
//  *
//  * - Original markup rendered verbatim inside the scoping wrapper
//  *   `#pg-reports-sales-by-hour` (class→className, style objects, ids kept,
//  *   inline on* handlers removed).
//  * - All inline <script> logic is ported into one useEffect: hour-option
//  *   generation, getData() (table render), exportExcel() (CSV download — no
//  *   XLSX library is used), step nav, toast, and the on-load default
//  *   (set today's date + run getData). Listeners are removed on cleanup.
//  * - The results section default state ("No Record Found", visible) is rendered
//  *   statically so the first paint matches what the page shows on load (today's
//  *   date is not in the demo dataset). The effect re-runs getData with the real
//  *   today's date.
//  * - External sidebar-loader.js is dropped — the shell renders the sidebar.
//  */
// export default function SalesByHourPage() {
//   useEffect(() => {
//     interface DemoRow {
//       hour_interval: string;
//       item_name: string;
//       total_quantity: number;
//       total_amount: string;
//     }

//     /* ── Outer sidebar switching ── */
//     const menuItems =
//       document.querySelectorAll<HTMLElement>(".menu-item");
//     const submenuGroups =
//       document.querySelectorAll<HTMLElement>(".submenu-group");

//     const menuItemHandlers: Array<[HTMLElement, () => void]> = [];
//     menuItems.forEach((item) => {
//       const handler = (): void => {
//         menuItems.forEach((m) => m.classList.remove("active"));
//         item.classList.add("active");
//         submenuGroups.forEach((g) => g.classList.remove("active"));
//         const targetId = item.getAttribute("data-target");
//         if (targetId) {
//           const targetMenu = document.getElementById(targetId);
//           if (targetMenu) {
//             targetMenu.classList.add("active");
//             const firstSubItem =
//               targetMenu.querySelector<HTMLElement>(".submenu-item");
//             if (firstSubItem) {
//               document
//                 .querySelectorAll<HTMLElement>(".submenu-item")
//                 .forEach((s) => s.classList.remove("active"));
//               firstSubItem.classList.add("active");
//             }
//           }
//         }
//       };
//       item.addEventListener("click", handler);
//       menuItemHandlers.push([item, handler]);
//     });

//     const submenuItems =
//       document.querySelectorAll<HTMLElement>(".submenu-item");
//     const submenuHandlers: Array<[HTMLElement, (e: Event) => void]> = [];
//     submenuItems.forEach((item) => {
//       const handler = (e: Event): void => {
//         e.preventDefault();
//         document
//           .querySelectorAll<HTMLElement>(".submenu-item")
//           .forEach((s) => s.classList.remove("active"));
//         item.classList.add("active");
//       };
//       item.addEventListener("click", handler);
//       submenuHandlers.push([item, handler]);
//     });

//     /* ── Header dropdowns ── */
//     const closeDropdowns = (): void => {
//       document
//         .querySelectorAll<HTMLElement>(".dropdown-menu-hdr")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", closeDropdowns);

//     /* ── Generate hour options ── */
//     const formatHour = (h: number): string => {
//       const ampm = h >= 12 ? "PM" : "AM";
//       const hr = h % 12 === 0 ? 12 : h % 12;
//       return `${hr} ${ampm}`;
//     };
//     const hourSelect =
//       document.getElementById("filterHour") as HTMLSelectElement | null;
//     if (hourSelect) {
//       for (let i = 0; i < 24; i++) {
//         const opt = document.createElement("option");
//         opt.value = String(i);
//         opt.textContent = `${formatHour(i)} - ${formatHour((i + 1) % 24)}`;
//         hourSelect.appendChild(opt);
//       }
//     }

//     /* ── Static demo data ── */
//     const DEMO_DATA: DemoRow[] = [
//       {
//         hour_interval: "12 PM - 1 PM",
//         item_name: "Paneer Tikka",
//         total_quantity: 14,
//         total_amount: "2380.00",
//       },
//       {
//         hour_interval: "12 PM - 1 PM",
//         item_name: "Veg Biryani",
//         total_quantity: 9,
//         total_amount: "1710.00",
//       },
//       {
//         hour_interval: "12 PM - 1 PM",
//         item_name: "Butter Naan",
//         total_quantity: 22,
//         total_amount: "770.00",
//       },
//       {
//         hour_interval: "12 PM - 1 PM",
//         item_name: "Mango Lassi",
//         total_quantity: 17,
//         total_amount: "1020.00",
//       },
//       {
//         hour_interval: "12 PM - 1 PM",
//         item_name: "Gulab Jamun (2 pcs)",
//         total_quantity: 11,
//         total_amount: "550.00",
//       },
//     ];
//     const DATA_DATES = ["2026-06-13", "2026-06-14", "2026-06-15"];

//     /* ── Get Data ── */
//     const getData = (): void => {
//       const dateInput =
//         document.getElementById("filterDate") as HTMLInputElement | null;
//       const date = dateInput?.value;
//       const section = document.getElementById("resultsSection");
//       const wrap = document.getElementById("tableWrap");
//       const title = document.getElementById("resultsTitle");
//       if (!section || !wrap || !title) return;

//       if (!date) {
//         showToast("Please select a date & hour", true);
//         return;
//       }

//       section.style.display = "block";
//       const data = DATA_DATES.includes(date) ? DEMO_DATA : [];

//       if (!data.length) {
//         title.style.display = "none";
//         wrap.style.border = "none";
//         wrap.innerHTML = '<p class="no-record">No Record Found</p>';
//         return;
//       }

//       title.style.display = "block";
//       wrap.style.border = "";
//       let rows = "";
//       data.forEach((item) => {
//         rows += `<tr>
//                 <td><span class="hour-pill">${item.hour_interval}</span></td>
//                 <td style="font-weight:600;">${item.item_name}</td>
//                 <td><span class="qty-pill">${item.total_quantity}</span></td>
//                 <td class="amount-cell">₹ ${Number(item.total_amount).toFixed(2)}</td>
//             </tr>`;
//       });

//       wrap.innerHTML = `
//             <table class="report-table">
//                 <thead>
//                     <tr>
//                         <th>Hour Interval</th>
//                         <th>Item Name</th>
//                         <th>Quantity</th>
//                         <th>Total Amount (Rs.)</th>
//                     </tr>
//                 </thead>
//                 <tbody>${rows}</tbody>
//             </table>`;
//     };

//     /* ── Export to Excel ── */
//     const exportExcel = (): void => {
//       const dateInput =
//         document.getElementById("filterDate") as HTMLInputElement | null;
//       const date = dateInput?.value;
//       const data = date && DATA_DATES.includes(date) ? DEMO_DATA : [];
//       if (!data.length) {
//         showToast("No data to export", true);
//         return;
//       }

//       const headers = [
//         "Sr No",
//         "Hour Interval",
//         "Item Name",
//         "Quantity",
//         "Total Amount",
//       ];
//       const csvRows = [headers.join(",")];
//       data.forEach((item, i) => {
//         csvRows.push(
//           [
//             i + 1,
//             `"${item.hour_interval}"`,
//             `"${item.item_name}"`,
//             item.total_quantity,
//             Number(item.total_amount).toFixed(2),
//           ].join(","),
//         );
//       });

//       const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "Sales_By_Hour.csv";
//       a.click();
//       URL.revokeObjectURL(url);
//       showToast("Export downloaded successfully!");
//     };

//     /* ── Toast ── */
//     const showToast = (msg: string, isErr = false): void => {
//       const t = document.getElementById("toast");
//       if (!t) return;
//       t.textContent = msg;
//       t.style.background = isErr ? "#ef4444" : "#00a896";
//       t.className = "toast show";
//       setTimeout(() => {
//         t.className = "toast";
//       }, 3000);
//     };

//     /* ── Wire filter buttons (replaces inline onclick) ── */
//     const getDataBtn =
//       document.querySelector<HTMLButtonElement>(".btn-getdata");
//     getDataBtn?.addEventListener("click", getData);
//     const exportBtn =
//       document.querySelector<HTMLButtonElement>(".btn-export");
//     exportBtn?.addEventListener("click", exportExcel);

//     /* ── Step nav ── */
//     let currentStep = 4;
//     const totalSteps = 26;
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const stepValue = document.getElementById("stepValue");
//     const prevHandler = (): void => {
//       if (currentStep > 1) {
//         currentStep--;
//         if (stepValue)
//           stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     const nextHandler = (): void => {
//       if (currentStep < totalSteps) {
//         currentStep++;
//         if (stepValue)
//           stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     prevBtn?.addEventListener("click", prevHandler);
//     nextBtn?.addEventListener("click", nextHandler);

//     /* ── Set today's date by default and load data ── */
//     const today = new Date().toISOString().split("T")[0];
//     const filterDate =
//       document.getElementById("filterDate") as HTMLInputElement | null;
//     if (filterDate) filterDate.value = today;
//     getData();

//     return () => {
//       menuItemHandlers.forEach(([el, h]) =>
//         el.removeEventListener("click", h),
//       );
//       submenuHandlers.forEach(([el, h]) =>
//         el.removeEventListener("click", h),
//       );
//       document.removeEventListener("click", closeDropdowns);
//       getDataBtn?.removeEventListener("click", getData);
//       exportBtn?.removeEventListener("click", exportExcel);
//       prevBtn?.removeEventListener("click", prevHandler);
//       nextBtn?.removeEventListener("click", nextHandler);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-sales-by-hour">
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />

//       {/* ══ APP CONTAINER ══ */}
//       <div className="app-container">
//         {/* ══ MAIN CONTENT: Sales by Hour ══ */}
//         <div className="main-content">
//           <div className="card">
//             {/* Report title + Help */}
//             <div className="report-header">
//               <h2 className="typ-page-heading report-title">Sales by hour</h2>
//               <button className="btn-help-hdr">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10" />
//                   <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
//                   <line x1="12" y1="17" x2="12.01" y2="17" />
//                 </svg>
//                 HELP
//               </button>
//             </div>

//             {/* Tab pill */}
//             <div className="tab-pill">Hour Interval</div>

//             {/* Filters */}
//             <div className="filter-row">
//               <div className="filter-group">
//                 <label className="filter-label">Date :</label>
//                 <input type="date" id="filterDate" className="filter-input" />
//               </div>
//               <div className="filter-group">
//                 <label className="filter-label">Hour :</label>
//                 <select id="filterHour" className="filter-input">
//                   {/* populated by JS */}
//                 </select>
//               </div>
//               <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
//                 <button className="btn-getdata">GETDATA</button>
//                 <button className="btn-export">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#ffffff"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>
//             </div>

//             {/* Results — default load state: visible section, no record */}
//             <div
//               className="results-section"
//               id="resultsSection"
//               style={{ display: "block" }}
//             >
//               <h3
//                 className="results-title"
//                 id="resultsTitle"
//                 style={{ display: "none" }}
//               >
//                 Description
//               </h3>
//               <div
//                 id="tableWrap"
//                 className="report-table-wrap"
//                 style={{ border: "none" }}
//               >
//                 <p className="no-record">No Record Found</p>
//               </div>
//             </div>
//           </div>
//           <div className="step-footer">
//             <button className="btn-prev" id="prevBtn">
//               <i className="fas fa-chevron-left" /> PREVIOUS
//             </button>
//             <div className="step-indicator">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 4/26
//               </span>
//             </div>
//             <button className="btn-next" id="nextBtn">
//               NEXT <i className="fas fa-chevron-right" />
//             </button>
//           </div>
//         </div>
//         {/* /main-content */}
//       </div>
//       {/* /app-container */}

//       {/* Toast */}
//       <div className="toast" id="toast" />
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import "./page.css";
import { reportsService, SalesByHour } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

interface DisplayRow {
    hour_interval: string;
    item_name: string;
    total_quantity: number;
    total_amount: number;
}

export default function SalesByHourPage() {
    const shopId = useShopId();
    const [data, setData] = useState<DisplayRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedHour, setSelectedHour] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Generate hour options
    const formatHour = (h: number): string => {
        const ampm = h >= 12 ? "PM" : "AM";
        const hr = h % 12 === 0 ? 12 : h % 12;
        return `${hr} ${ampm}`;
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        value: String(i),
        label: `${formatHour(i)} - ${formatHour((i + 1) % 24)}`
    }));

    // Transform API data to display format
    const transformData = (items: SalesByHour[]): DisplayRow[] => {
        return items.map((item) => ({
            hour_interval: item.hour_interval,
            item_name: item.item_name,
            total_quantity: item.total_quantity,
            total_amount: item.total_amount,
        }));
    };

    // Get data function
    const getData = async () => {
        if (!selectedDate) {
            showToast("Please select a date", true);
            return;
        }

        // Parse hour from selected hour (e.g., "12" -> from_time=12, to_time=13)
        const hour = parseInt(selectedHour);
        if (isNaN(hour)) {
            showToast("Please select an hour", true);
            return;
        }

        try {
            setLoading(true);
            setPageNumber(1);
            const fromTime = String(hour);
            const toTime = String(hour + 1);
            const response = await reportsService.fetchSalesByHour(
                shopId,
                selectedDate,
                fromTime,
                toTime
            );
            setData(transformData(response));
        } catch (err: any) {
            console.error("Error fetching sales by hour:", err);
            setData([]);
            if (err.response?.status === 404) {
                showToast("API endpoint not found. Please contact support.", true);
            } else {
                showToast("Error fetching data", true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Export to CSV
    const exportExcel = (): void => {
        if (!data || data.length === 0) {
            showToast("No data to export", true);
            return;
        }

        const headers = [
            "Sr No",
            "Hour Interval",
            "Item Name",
            "Quantity",
            "Total Amount",
        ];
        const csvRows = [headers.join(",")];
        data.forEach((item, i) => {
            csvRows.push(
                [
                    i + 1,
                    `"${item.hour_interval}"`,
                    `"${item.item_name}"`,
                    item.total_quantity,
                    item.total_amount.toFixed(2),
                ].join(",")
            );
        });

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Sales_By_Hour_${selectedDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Export downloaded successfully!");
    };

    // Toast
    const showToast = (msg: string, isErr = false): void => {
        const t = document.getElementById("toast");
        if (!t) return;
        t.textContent = msg;
        t.style.background = isErr ? "#ef4444" : "#00a896";
        t.className = "toast show";
        setTimeout(() => {
            t.className = "toast";
        }, 3000);
    };

    // Set today's date by default
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        const dateInput = document.getElementById("filterDate") as HTMLInputElement | null;
        if (dateInput) dateInput.value = today;

        // Set default hour to current hour
        const currentHour = new Date().getHours();
        setSelectedHour(String(currentHour));
        const hourSelect = document.getElementById("filterHour") as HTMLSelectElement | null;
        if (hourSelect) hourSelect.value = String(currentHour);
    }, []);

    // Wire up event listeners
    useEffect(() => {
        const getDataBtn = document.querySelector<HTMLButtonElement>(".btn-getdata");
        const exportBtn = document.querySelector<HTMLButtonElement>(".btn-export");
        const dateInput = document.getElementById("filterDate") as HTMLInputElement | null;
        const hourSelect = document.getElementById("filterHour") as HTMLSelectElement | null;

        const handleDateChange = () => {
            if (dateInput) setSelectedDate(dateInput.value);
        };

        const handleHourChange = () => {
            if (hourSelect) setSelectedHour(hourSelect.value);
        };

        dateInput?.addEventListener("change", handleDateChange);
        hourSelect?.addEventListener("change", handleHourChange);
        getDataBtn?.addEventListener("click", getData);
        exportBtn?.addEventListener("click", exportExcel);

        // Help button
        const helpBtn = document.querySelector<HTMLButtonElement>(".btn-help-hdr");
        helpBtn?.addEventListener("click", () => {
            showToast("Help & Support - Sales by Hour");
        });

        // Step navigation
        let currentStep = 4;
        const totalSteps = 26;
        const stepValue = document.getElementById("stepValue");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        const prevHandler = (): void => {
            if (currentStep > 1) {
                currentStep--;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };
        const nextHandler = (): void => {
            if (currentStep < totalSteps) {
                currentStep++;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        prevBtn?.addEventListener("click", prevHandler);
        nextBtn?.addEventListener("click", nextHandler);

        return () => {
            dateInput?.removeEventListener("change", handleDateChange);
            hourSelect?.removeEventListener("change", handleHourChange);
            getDataBtn?.removeEventListener("click", getData);
            exportBtn?.removeEventListener("click", exportExcel);
            helpBtn?.removeEventListener("click", () => { });
            prevBtn?.removeEventListener("click", prevHandler);
            nextBtn?.removeEventListener("click", nextHandler);
        };
    }, [selectedDate, selectedHour, data]);

    return (
        <div id="pg-reports-sales-by-hour">
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div className="app-container">
                <div className="main-content">
                    <div className="card">
                        {/* Report title + Help */}
                        <div className="report-header">
                            <h1 className="report-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Sales by hour</h1>
                            <button className="btn-help-hdr">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                HELP
                            </button>
                        </div>

                        {/* Tab pill */}
                        <div className="tab-pill">Hour Interval</div>

                        {/* Filters */}
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Date :</label>
                                <input type="date" id="filterDate" className="filter-input" />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Hour :</label>
                                <select id="filterHour" className="filter-input">
                                    {hourOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                                <button className="btn-getdata">GETDATA</button>
                                <button className="btn-export">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    EXPORT TO EXCEL
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div
                            className="results-section"
                            id="resultsSection"
                            style={{ display: "block" }}
                        >
                            <h3
                                className="results-title"
                                id="resultsTitle"
                                style={{ display: data.length > 0 ? "block" : "none" }}
                            >
                                Description
                            </h3>
                            <div id="tableWrap" className="report-table-wrap">
                                {loading ? (
                                    <p className="no-record" style={{ textAlign: "center", padding: "40px" }}>
                                        Loading data...
                                    </p>
                                ) : data.length === 0 ? (
                                    <p className="no-record">No Record Found</p>
                                ) : (
                                    <>
                                        {(() => {
                                            const totalRecords = data.length;
                                            const totalPages = Math.ceil(totalRecords / pageSize);
                                            const startIndex = (pageNumber - 1) * pageSize;
                                            const paginatedRows = data.slice(startIndex, startIndex + pageSize);
                                            const endIndex = Math.min(startIndex + pageSize, totalRecords);

                                            return (
                                                <>
                                                    <table className="report-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Hour Interval</th>
                                                                <th>Item Name</th>
                                                                <th>Quantity</th>
                                                                <th>Total Amount (Rs.)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedRows.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <span className="hour-pill">{item.hour_interval}</span>
                                                                    </td>
                                                                    <td style={{ fontWeight: "600" }}>{item.item_name}</td>
                                                                    <td>
                                                                        <span className="qty-pill">{item.total_quantity}</span>
                                                                    </td>
                                                                    <td className="amount-cell">
                                                                        ₹ {item.total_amount.toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px', marginTop: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '13px', color: '#64748b' }}>Show</span>
                                                            <select
                                                                value={pageSize}
                                                                onChange={(e) => {
                                                                    setPageSize(Number(e.target.value));
                                                                    setPageNumber(1);
                                                                }}
                                                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                                            >
                                                                <option value={10}>10</option>
                                                                <option value={20}>20</option>
                                                                <option value={50}>50</option>
                                                            </select>
                                                            <span style={{ fontSize: '13px', color: '#64748b' }}>entries</span>
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                            Showing {startIndex + 1} to {endIndex} of {totalRecords} entries
                                                        </div>
                                                        <ReportPagination
                                                            currentPage={pageNumber}
                                                            totalPages={totalPages}
                                                            onPageChange={(page) => setPageNumber(page)}
                                                        />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="step-footer">
                        <button className="btn-prev" id="prevBtn">
                            <i className="fas fa-chevron-left" /> PREVIOUS
                        </button>
                        <div className="step-indicator">
                            <span className="step-label">STEP</span>
                            <span className="step-value" id="stepValue">4/26</span>
                        </div>
                        <button className="btn-next" id="nextBtn">
                            NEXT <i className="fas fa-chevron-right" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="toast" id="toast" />
        </div>
    );
}