// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/sales-by-item-size-reports.html → React.
//  * Pixel-perfect mechanical port. Inline <script> ported into one useEffect
//  * wiring behaviour via addEventListener (no hydration mismatch). The shell
//  * provides header/sidebar, so only the original body content is rendered.
//  */
// type ReportRow = { name: string; qty: number; amount: number };

// export default function SalesByItemSizeReportsPage() {
//   useEffect(() => {
//     // ── Sample data per tab ──
//     const tabData: Record<string, ReportRow[] | null> = {
//       today: [
//         { name: "Paneer Butter Masala (Half)", qty: 4, amount: 760.0 },
//         { name: "Dal Tadka (Full)", qty: 2, amount: 340.0 },
//       ],
//       weekly: [
//         { name: "Chicken Biryani (Regular)", qty: 18, amount: 4500.0 },
//         { name: "Veg Burger (Small)", qty: 12, amount: 1440.0 },
//       ],
//       monthly: null, // shown after applying filter
//       yearly: null,
//       datewise: null,
//     };

//     const monthlyData: ReportRow[] = [
//       { name: "Butter Naan (Single)", qty: 55, amount: 2750.0 },
//       { name: "Paneer Tikka (Half)", qty: 30, amount: 5100.0 },
//     ];
//     const yearlyData: ReportRow[] = [
//       { name: "Masala Dosa (Regular)", qty: 320, amount: 51200.0 },
//       { name: "Chole Bhature (Full Plate)", qty: 210, amount: 37800.0 },
//     ];
//     const datewiseData: ReportRow[] = [
//       { name: "Veg Thali (Full)", qty: 8, amount: 2400.0 },
//       { name: "Lassi (Large)", qty: 15, amount: 1125.0 },
//     ];

//     let currentTab = "today";

//     // ── Populate year dropdowns ──
//     const populateYears = (selectId: string): void => {
//       const sel = document.getElementById(selectId) as HTMLSelectElement | null;
//       if (!sel) return;
//       sel.innerHTML = '<option value="">-- Select Year --</option>';
//       const current = new Date().getFullYear();
//       for (let y = current; y >= current - 5; y--) {
//         const opt = document.createElement("option");
//         opt.value = String(y);
//         opt.textContent = String(y);
//         sel.appendChild(opt);
//       }
//     };
//     populateYears("yearSelect");
//     populateYears("monthYearSelect");

//     // ── Set today's date as default for datewise ──
//     const today = new Date();
//     const pad = (n: number): string => String(n).padStart(2, "0");
//     const fromDate = document.getElementById(
//       "fromDate"
//     ) as HTMLInputElement | null;
//     if (fromDate) {
//       fromDate.value = `${today.getFullYear()}-${pad(
//         today.getMonth() + 1
//       )}-${pad(today.getDate())}`;
//     }

//     const renderTable = (rows: ReportRow[]): void => {
//       const tbody = document.getElementById("reportTableBody");
//       const tfoot = document.getElementById(
//         "reportTableFoot"
//       ) as HTMLElement | null;
//       const totalLabel = document.getElementById("totalAmountLabel");
//       if (!tbody || !tfoot) return;
//       tbody.innerHTML = "";

//       if (!rows || rows.length === 0) {
//         tbody.innerHTML =
//           '<tr class="no-data-row"><td colspan="3">No data available</td></tr>';
//         tfoot.style.display = "none";
//         if (totalLabel) totalLabel.textContent = "Total Amount: Rs. 0.00";
//         return;
//       }

//       let totalQty = 0;
//       let totalAmt = 0;
//       rows.forEach((r) => {
//         totalQty += r.qty;
//         totalAmt += r.amount;
//         const tr = document.createElement("tr");
//         tr.innerHTML = `
//                 <td>${r.name}</td>
//                 <td>${r.qty}</td>
//                 <td>Rs. ${r.amount.toFixed(2)}</td>
//             `;
//         tbody.appendChild(tr);
//       });

//       const footQty = document.getElementById("footQty");
//       const footAmt = document.getElementById("footAmt");
//       if (footQty) footQty.textContent = String(totalQty);
//       if (footAmt) footAmt.textContent = `Rs. ${totalAmt.toFixed(2)}`;
//       tfoot.style.display = "";
//       if (totalLabel)
//         totalLabel.textContent = `Total Amount: Rs. ${totalAmt.toFixed(2)}`;
//     };

//     // ── Switch Tab ──
//     const switchTab = (tab: string, btn: HTMLElement): void => {
//       currentTab = tab;
//       document
//         .querySelectorAll(".tab-btn")
//         .forEach((b) => b.classList.remove("active"));
//       btn.classList.add("active");

//       // Show/hide filters
//       document
//         .querySelectorAll(".filter-panel")
//         .forEach((p) => p.classList.remove("active"));
//       document.getElementById("filter-" + tab)?.classList.add("active");

//       // Render table
//       const data = tabData[tab];
//       if (data !== null && data !== undefined) {
//         renderTable(data);
//       } else {
//         // Show empty until filter applied
//         renderTable([]);
//       }
//     };

//     const applyFilter = (tab: string): void => {
//       let data: ReportRow[] = [];
//       if (tab === "monthly") {
//         const m = (
//           document.getElementById("monthSelect") as HTMLSelectElement | null
//         )?.value;
//         const y = (
//           document.getElementById("monthYearSelect") as HTMLSelectElement | null
//         )?.value;
//         if (m && y) data = monthlyData;
//       } else if (tab === "yearly") {
//         const y = (
//           document.getElementById("yearSelect") as HTMLSelectElement | null
//         )?.value;
//         if (y) data = yearlyData;
//       } else if (tab === "datewise") {
//         const d = (
//           document.getElementById("fromDate") as HTMLInputElement | null
//         )?.value;
//         if (d) data = datewiseData;
//       }
//       renderTable(data);
//     };

//     // ── Export to Excel (CSV download) ──
//     const exportToExcel = (): void => {
//       const tbody = document.getElementById("reportTableBody");
//       if (!tbody) return;
//       const rows = tbody.querySelectorAll("tr:not(.no-data-row)");

//       if (rows.length === 0) {
//         alert("No data available to export.");
//         return;
//       }

//       const tabLabel =
//         currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
//       let csv = "Item Name,Quantity,Total Amount (Rs.)\n";

//       rows.forEach((row) => {
//         const cells = row.querySelectorAll("td");
//         const itemName = (cells[0].textContent ?? "").replace(/,/g, ";");
//         const qty = (cells[1].textContent ?? "").trim();
//         const amount = (cells[2].textContent ?? "").trim();
//         csv += `"${itemName}",${qty},"${amount}"\n`;
//       });

//       // Add totals row
//       const footQty = document.getElementById("footQty")?.textContent ?? "";
//       const footAmt = document.getElementById("footAmt")?.textContent ?? "";
//       csv += `"Total",${footQty},"${footAmt}"\n`;

//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `Sales_By_Item_Size_${tabLabel}_Report.csv`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     };

//     // ── Wire tab buttons (was inline onclick="switchTab(...)") ──
//     const tabConfig: Array<{ tab: string; index: number }> = [
//       { tab: "today", index: 0 },
//       { tab: "weekly", index: 1 },
//       { tab: "monthly", index: 2 },
//       { tab: "yearly", index: 3 },
//       { tab: "datewise", index: 4 },
//     ];
//     const tabBtns = Array.from(
//       document.querySelectorAll<HTMLButtonElement>(".tab-bar .tab-btn")
//     );
//     const tabHandlers = tabConfig
//       .map(({ tab, index }) => {
//         const btn = tabBtns[index];
//         if (!btn) return null;
//         const handler = (): void => switchTab(tab, btn);
//         btn.addEventListener("click", handler);
//         return { btn, handler };
//       })
//       .filter(
//         (h): h is { btn: HTMLButtonElement; handler: () => void } => h !== null
//       );

//     // ── Wire apply buttons (was inline onclick="applyFilter(...)") ──
//     const applyMap: Array<{ id: string; tab: string }> = [
//       { id: "filter-monthly", tab: "monthly" },
//       { id: "filter-yearly", tab: "yearly" },
//       { id: "filter-datewise", tab: "datewise" },
//     ];
//     const applyHandlers = applyMap
//       .map(({ id, tab }) => {
//         const btn = document
//           .getElementById(id)
//           ?.querySelector<HTMLButtonElement>(".apply-btn");
//         if (!btn) return null;
//         const handler = (): void => applyFilter(tab);
//         btn.addEventListener("click", handler);
//         return { btn, handler };
//       })
//       .filter(
//         (h): h is { btn: HTMLButtonElement; handler: () => void } => h !== null
//       );

//     // ── Wire export button (was inline onclick="exportToExcel()") ──
//     const exportBtn = document.querySelector<HTMLButtonElement>(
//       ".tab-bar .export-btn"
//     );
//     if (exportBtn) exportBtn.addEventListener("click", exportToExcel);

//     // ── Initial render ──
//     renderTable(tabData.today ?? []);
//     document.getElementById("filter-today")?.classList.add("active"); // no-op (empty panel)

//     return () => {
//       tabHandlers.forEach(({ btn, handler }) =>
//         btn.removeEventListener("click", handler)
//       );
//       applyHandlers.forEach(({ btn, handler }) =>
//         btn.removeEventListener("click", handler)
//       );
//       if (exportBtn) exportBtn.removeEventListener("click", exportToExcel);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-sales-by-item-size-reports">
//       {/* Main Content */}
//       <div className="main-content">
//         <div className="report-card">
//           {/* <div className="typ-page-heading report-title">Sales By Item Size Reports</div> */}
//           <div className="report-header">
//             <div className="report-title">Sales By Item Size Reports</div>

//             <button className="action-btn action-btn-help">
//               <svg viewBox="0 0 24 24">
//                 <circle cx="12" cy="12" r="10" />
//                 <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
//                 <line x1="12" y1="17" x2="12.01" y2="17" />
//               </svg>
//               HELP
//             </button>
//           </div>
//           {/* Tab Bar */}
//           <div className="tab-bar">
//             <button className="tab-btn active">Today</button>
//             <button className="tab-btn">Weekly</button>
//             <button className="tab-btn">Monthly</button>
//             <button className="tab-btn">Yearly</button>
//             <button className="tab-btn">Date Wise</button>
//             <button className="export-btn">
//               <i className="fas fa-file-excel"></i> Export to Excel
//             </button>
//           </div>

//           {/* Filter: Today (no filter needed) */}
//           <div className="filter-panel" id="filter-today"></div>

//           {/* Filter: Weekly (no filter needed) */}
//           <div className="filter-panel" id="filter-weekly"></div>

//           {/* Filter: Monthly */}
//           <div className="filter-panel" id="filter-monthly">
//             <div className="filter-group">
//               <label className="filter-label">Select Month</label>
//               <select className="filter-select" id="monthSelect" defaultValue="">
//                 <option value="">-- Select Month --</option>
//                 <option value="1">January</option>
//                 <option value="2">February</option>
//                 <option value="3">March</option>
//                 <option value="4">April</option>
//                 <option value="5">May</option>
//                 <option value="6">June</option>
//                 <option value="7">July</option>
//                 <option value="8">August</option>
//                 <option value="9">September</option>
//                 <option value="10">October</option>
//                 <option value="11">November</option>
//                 <option value="12">December</option>
//               </select>
//             </div>
//             <div className="filter-group">
//               <label className="filter-label">Select Year</label>
//               <select className="filter-select" id="monthYearSelect"></select>
//             </div>
//             <button className="apply-btn">APPLY</button>
//           </div>

//           {/* Filter: Yearly */}
//           <div className="filter-panel" id="filter-yearly">
//             <div className="filter-group">
//               <label className="filter-label">Select Year</label>
//               <select className="filter-select" id="yearSelect"></select>
//             </div>
//             <button className="apply-btn">APPLY</button>
//           </div>

//           {/* Filter: Date Wise */}
//           <div className="filter-panel" id="filter-datewise">
//             <div className="filter-group">
//               <label className="filter-label">From Date</label>
//               <input type="date" className="filter-input" id="fromDate" />
//             </div>
//             <button className="apply-btn">APPLY</button>
//           </div>

//           {/* Total Amount */}
//           <div className="total-amount" id="totalAmountLabel">
//             Total Amount: Rs. 0.00
//           </div>

//           {/* Table */}
//           <div className="table-wrapper-outer">
//             <table className="report-table">
//               <thead>
//                 <tr>
//                   <th style={{ textAlign: "left" }}>Item Name</th>
//                   <th>Quantity</th>
//                   <th>Total Amount (Rs.)</th>
//                 </tr>
//               </thead>
//               <tbody id="reportTableBody">{/* Filled by JS */}</tbody>
//               <tfoot id="reportTableFoot" style={{ display: "none" }}>
//                 <tr>
//                   <td>Total</td>
//                   <td id="footQty">0</td>
//                   <td id="footAmt">Rs. 0.00</td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import "./page.css";
import { reportsService, SalesByItemSize } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

type TabKey = "today" | "weekly" | "monthly" | "yearly" | "datewise";

interface ReportRow {
    name: string;
    qty: number;
    amount: number;
}

export default function SalesByItemSizeReportsPage() {
    const shopId = useShopId();
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [data, setData] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalQty, setTotalQty] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [serverTotalRecords, setServerTotalRecords] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        const pad = (n: number): string => String(n).padStart(2, "0");
        return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    });

    // Fetch data automatically for tabs without apply buttons (today, weekly)
    // and whenever pagination changes.
    useEffect(() => {
        if (shopId) {
            if (activeTab === "today" || activeTab === "weekly") {
                fetchData(activeTab);
            }
        }
    }, [shopId, activeTab, pageNumber, pageSize]);

    // Transform API data to display format
    const transformData = (items: SalesByItemSize[]): ReportRow[] => {
        if (!items || items.length === 0) return [];

        return items.map((item) => ({
            name: item.item_name || item.name || item.ItemName || item.Item_Name || "Unknown Item",
            qty: typeof item.total_quantity === 'number' ? item.total_quantity : typeof item.quantity === 'number' ? item.quantity : typeof item.Quantity === 'number' ? item.Quantity : typeof item.TotalQuantity === 'number' ? item.TotalQuantity : parseInt(String(item.total_quantity || item.quantity || item.Quantity || item.TotalQuantity || 0)),
            amount: typeof item.total_amount === 'number' ? item.total_amount : typeof item.amount === 'number' ? item.amount : typeof item.Amount === 'number' ? item.Amount : typeof item.TotalAmount === 'number' ? item.TotalAmount : parseFloat(String(item.total_amount || item.amount || item.Amount || item.TotalAmount || 0)),
        }));
    };

    // Calculate totals
    const calculateTotals = (rows: ReportRow[]) => {
        let qty = 0;
        let amount = 0;
        rows.forEach((r) => {
            qty += r.qty;
            amount += r.amount;
        });
        setTotalQty(qty);
        setTotalAmount(amount);
    };

    // Fetch data based on tab
    const fetchData = async (tab: TabKey) => {
        if (!shopId) return;

        setLoading(true);
        setData([]);
        setTotalQty(0);
        setTotalAmount(0);

        try {
            if (tab === "today") {
                const res = await reportsService.getSalesByItemSizeToday(shopId, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                calculateTotals(transformedData);
            } else if (tab === "weekly") {
                const res = await reportsService.getSalesByItemSizeWeekly(shopId, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                calculateTotals(transformedData);
            } else if (tab === "monthly") {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const month = (document.getElementById("monthSelect") as HTMLSelectElement)?.value || String(currentMonth);
                const year = (document.getElementById("monthYearSelect") as HTMLSelectElement)?.value || String(currentYear);
                if (month && year) {
                    const res = await reportsService.getSalesByItemSizeMonthly(shopId, month, year, pageNumber, pageSize);
                    const transformedData = transformData(res.items);
                    setData(transformedData);
                    setServerTotalRecords(res.totalRecords);
                    setServerTotalPages(res.totalPages || 1);
                    calculateTotals(transformedData);
                }
            } else if (tab === "yearly") {
                const currentYear = new Date().getFullYear();
                const yearVal = (document.getElementById("yearSelect") as HTMLSelectElement)?.value || String(currentYear);
                if (yearVal) {
                    const res = await reportsService.getSalesByItemSizeYearly(shopId, yearVal, pageNumber, pageSize);
                    const transformedData = transformData(res.items);
                    setData(transformedData);
                    setServerTotalRecords(res.totalRecords);
                    setServerTotalPages(res.totalPages || 1);
                    calculateTotals(transformedData);
                }
            } else if (tab === "datewise") {
                const dateVal = selectedDate || (document.getElementById("fromDate") as HTMLInputElement)?.value || new Date().toISOString().split("T")[0];
                if (dateVal) {
                    const res = await reportsService.getSalesByItemSizeDateWise(shopId, dateVal, pageNumber, pageSize);
                    const transformedData = transformData(res.items);
                    setData(transformedData);
                    setServerTotalRecords(res.totalRecords);
                    setServerTotalPages(res.totalPages || 1);
                    calculateTotals(transformedData);
                }
            }
        } catch (err) {
            console.error(`Error fetching ${tab} sales by item size:`, err);
            setData([]);
            setTotalQty(0);
            setTotalAmount(0);
            setServerTotalRecords(0);
            setServerTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Switch tab
    const switchTab = (tab: TabKey, btn: HTMLElement) => {
        setActiveTab(tab);
        setPageNumber(1);
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Show/hide filters
        document.querySelectorAll(".filter-panel").forEach((p) => p.classList.remove("active"));
        document.getElementById(`filter-${tab}`)?.classList.add("active");
    };

    // Export to Excel (CSV)
    const exportToExcel = () => {
        if (!data || data.length === 0) {
            alert("No data available to export.");
            return;
        }

        let csv = "Item Name,Quantity,Total Amount (Rs.)\n";

        data.forEach((row) => {
            const itemName = row.name.replace(/,/g, ";");
            csv += `"${itemName}",${row.qty},"${row.amount.toFixed(2)}"\n`;
        });

        // Add totals row
        csv += `"Total",${totalQty},"${totalAmount.toFixed(2)}"\n`;

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const tabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
        a.download = `Sales_By_Item_Size_${tabLabel}_Report.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Populate year dropdowns
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const populateYears = (selectId: string) => {
            const sel = document.getElementById(selectId) as HTMLSelectElement | null;
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Select Year --</option>';
            for (let y = currentYear; y >= currentYear - 9; y--) {
                const opt = document.createElement("option");
                opt.value = String(y);
                opt.textContent = String(y);
                sel.appendChild(opt);
            }
        };
        populateYears("yearSelect");
        populateYears("monthYearSelect");
    }, []);

    // Wire up event listeners
    useEffect(() => {
        // Tab buttons
        const tabConfig: Array<{ tab: TabKey; index: number }> = [
            { tab: "today", index: 0 },
            { tab: "weekly", index: 1 },
            { tab: "monthly", index: 2 },
            { tab: "yearly", index: 3 },
            { tab: "datewise", index: 4 },
        ];
        const tabBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(".tab-bar .tab-btn"));
        const tabHandlers: Array<{ btn: HTMLButtonElement; handler: () => void }> = [];

        tabConfig.forEach(({ tab, index }) => {
            const btn = tabBtns[index];
            if (!btn) return;
            const handler = () => switchTab(tab, btn);
            btn.addEventListener("click", handler);
            tabHandlers.push({ btn, handler });
        });

        // Apply buttons for filters
        const applyMap: Array<{ id: string; tab: TabKey }> = [
            { id: "filter-monthly", tab: "monthly" },
            { id: "filter-yearly", tab: "yearly" },
            { id: "filter-datewise", tab: "datewise" },
        ];
        const applyHandlers: Array<{ btn: HTMLButtonElement; handler: () => void }> = [];

        applyMap.forEach(({ id, tab }) => {
            const btn = document.getElementById(id)?.querySelector<HTMLButtonElement>(".apply-btn");
            if (!btn) return;
            const handler = () => {
                setPageNumber(1);
                fetchData(tab);
            };
            btn.addEventListener("click", handler);
            applyHandlers.push({ btn, handler });
        });

        // Export button
        const exportBtn = document.querySelector<HTMLButtonElement>(".tab-bar .export-btn");
        exportBtn?.addEventListener("click", exportToExcel);

        // Help button
        const helpBtn = document.querySelector(".action-btn-help");
        helpBtn?.addEventListener("click", () => {
            alert("Help & Support - Sales by Item Size Reports");
        });

        return () => {
            tabHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
            applyHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
            exportBtn?.removeEventListener("click", exportToExcel);
            helpBtn?.removeEventListener("click", () => { });
        };
    }, [data, totalQty, totalAmount]);

    return (
        <div id="pg-reports-sales-by-item-size-reports">
            <div className="main-content">
                <div className="report-card">
                    <div className="report-header">
                        <div className="report-title">Sales By Item Size Reports</div>
                        <button className="action-btn action-btn-help">
                            <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            HELP
                        </button>
                    </div>

                    {/* Tab Bar */}
                    <div className="tab-bar">
                        <button className="tab-btn active">Today</button>
                        <button className="tab-btn">Weekly</button>
                        <button className="tab-btn">Monthly</button>
                        <button className="tab-btn">Yearly</button>
                        <button className="tab-btn">Date Wise</button>
                        <button className="export-btn" style={{ marginLeft: "auto" }}>
                            <i className="fas fa-file-excel"></i> Export to Excel
                        </button>
                    </div>

                    {/* Filter: Today (no filter needed) */}
                    <div className="filter-panel" id="filter-today"></div>

                    {/* Filter: Weekly (no filter needed) */}
                    <div className="filter-panel" id="filter-weekly"></div>

                    {/* Filter: Monthly */}
                    <div className="filter-panel" id="filter-monthly">
                        <div className="filter-group">
                            <label className="filter-label">Select Month</label>
                            <select className="filter-select" id="monthSelect" defaultValue="">
                                <option value="">-- Select Month --</option>
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
                        <div className="filter-group">
                            <label className="filter-label">Select Year</label>
                            <select className="filter-select" id="monthYearSelect"></select>
                        </div>
                        <button className="apply-btn">APPLY</button>
                    </div>

                    {/* Filter: Yearly */}
                    <div className="filter-panel" id="filter-yearly">
                        <div className="filter-group">
                            <label className="filter-label">Select Year</label>
                            <select className="filter-select" id="yearSelect"></select>
                        </div>
                        <button className="apply-btn">APPLY</button>
                    </div>

                    {/* Filter: Date Wise */}
                    <div className="filter-panel" id="filter-datewise">
                        <div className="filter-group">
                            <label className="filter-label">From Date</label>
                            <input
                                type="date"
                                className="filter-input"
                                id="fromDate"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </div>
                        <button className="apply-btn">APPLY</button>
                    </div>

                    {/* Total Amount */}
                    <div className="total-amount" id="totalAmountLabel">
                        Total Amount: Rs. {totalAmount.toFixed(2)}
                    </div>

                    {/* Table */}
                    <div className="table-wrapper-outer">
                        {(() => {
                            const isServerPaginated = true;
                            const totalRecords = isServerPaginated ? serverTotalRecords : data.length;
                            const totalPages = isServerPaginated ? serverTotalPages : Math.max(1, Math.ceil(totalRecords / pageSize));
                            const startIndex = (pageNumber - 1) * pageSize;
                            const paginatedData = isServerPaginated ? data : data.slice(startIndex, startIndex + pageSize);
                            const endIndex = isServerPaginated ? Math.min(startIndex + data.length, totalRecords) : Math.min(startIndex + pageSize, totalRecords);

                            return (
                                <>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: "left" }}>Item Name</th>
                                                <th>Quantity</th>
                                                <th>Total Amount (Rs.)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="reportTableBody">
                                            {loading ? (
                                                <tr className="no-data-row">
                                                    <td colSpan={3}>Loading...</td>
                                                </tr>
                                            ) : data.length === 0 ? (
                                                <tr className="no-data-row">
                                                    <td colSpan={3}>No data available</td>
                                                </tr>
                                            ) : (
                                                paginatedData.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.name}</td>
                                                        <td>{row.qty}</td>
                                                        <td>Rs. {row.amount.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot id="reportTableFoot" style={{ display: data.length > 0 ? "" : "none" }}>
                                            <tr>
                                                <td><strong>Total</strong></td>
                                                <td><strong>{totalQty}</strong></td>
                                                <td><strong>Rs. {totalAmount.toFixed(2)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    {data.length > 0 && (
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
                                                Showing {totalRecords === 0 ? 0 : startIndex + 1} to {endIndex} of {totalRecords} entries
                                            </div>
                                            <ReportPagination
                                                currentPage={pageNumber}
                                                totalPages={totalPages}
                                                onPageChange={(page) => setPageNumber(page)}
                                            />
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}