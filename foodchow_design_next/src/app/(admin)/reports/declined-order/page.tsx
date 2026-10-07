// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/declined_order.html → React.
//  * Pixel-perfect mechanical port. Inline <script> ported into one useEffect that
//  * wires behaviour via addEventListener / event delegation (no hydration
//  * mismatch). The shell provides header/sidebar, so only the original body
//  * content is rendered. XLSX export: the SheetJS lib is loaded via next/script
//  * and accessed through a typed window global inside the export handler.
//  */

// type WorkBook = unknown;
// type WorkSheet = { [k: string]: unknown };

// declare global {
//   interface Window {
//     XLSX?: {
//       utils: {
//         book_new(): WorkBook;
//         aoa_to_sheet(data: unknown[][]): WorkSheet;
//         book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
//       };
//       writeFile(wb: WorkBook, name: string): void;
//     };
//   }
// }

// type Item = { name: string; qty: number };
// type OrderRow = {
//   date: string;
//   orderId: string;
//   customer: string;
//   mobile: string;
//   payment: string;
//   orderType: string;
//   amount: string;
//   tax: string;
//   discount: string;
//   delivery: string;
//   reason: string;
//   items: Item[];
// };
// type TabKey = "today" | "weekly" | "monthly" | "yearly" | "datewise";

// export default function DeclinedOrderPage() {
//   useEffect(() => {
//     // ── DATA ──
//     const tabData: Record<TabKey, OrderRow[]> = {
//       today: [
//         {
//           date: "05-06-2026",
//           orderId: "ORD-1041",
//           customer: "Rahul Sharma",
//           mobile: "9876543210",
//           payment: "Online",
//           orderType: "Delivery",
//           amount: "Rs. 480.00",
//           tax: "Rs. 23.00",
//           discount: "Rs. 0.00",
//           delivery: "Rs. 40.00",
//           reason: "Item unavailable",
//           items: [
//             { name: "Paneer Sandwich", qty: 1 },
//             { name: "Cold Coffee", qty: 2 },
//           ],
//         },
//         {
//           date: "05-06-2026",
//           orderId: "ORD-1042",
//           customer: "Priya Patel",
//           mobile: "9123456780",
//           payment: "COD",
//           orderType: "Takeaway",
//           amount: "Rs. 320.00",
//           tax: "Rs. 15.00",
//           discount: "Rs. 20.00",
//           delivery: "Rs. 0.00",
//           reason: "Restaurant closed",
//           items: [
//             { name: "Veg Burger", qty: 2 },
//             { name: "French Fries", qty: 1 },
//           ],
//         },
//       ],
//       weekly: [
//         {
//           date: "03-06-2026",
//           orderId: "ORD-1031",
//           customer: "Suresh Kumar",
//           mobile: "9871234560",
//           payment: "Online",
//           orderType: "Delivery",
//           amount: "Rs. 560.00",
//           tax: "Rs. 27.00",
//           discount: "Rs. 50.00",
//           delivery: "Rs. 40.00",
//           reason: "Wrong order placed",
//           items: [
//             { name: "Pizza", qty: 1 },
//             { name: "Cold Drink", qty: 2 },
//           ],
//         },
//       ],
//       monthly: [
//         {
//           date: "10-06-2026",
//           orderId: "ORD-1010",
//           customer: "Kavita Singh",
//           mobile: "9812345670",
//           payment: "Online",
//           orderType: "Delivery",
//           amount: "Rs. 720.00",
//           tax: "Rs. 34.00",
//           discount: "Rs. 0.00",
//           delivery: "Rs. 60.00",
//           reason: "Late delivery request",
//           items: [
//             { name: "Paneer Pizza", qty: 1 },
//             { name: "Garlic Bread", qty: 2 },
//           ],
//         },
//         {
//           date: "18-06-2026",
//           orderId: "ORD-1021",
//           customer: "Ravi Joshi",
//           mobile: "9634521870",
//           payment: "Card",
//           orderType: "Dine-in",
//           amount: "Rs. 350.00",
//           tax: "Rs. 17.00",
//           discount: "Rs. 30.00",
//           delivery: "Rs. 0.00",
//           reason: "Kitchen busy",
//           items: [
//             { name: "Pasta", qty: 1 },
//             { name: "Cold Drink", qty: 2 },
//           ],
//         },
//       ],
//       yearly: [
//         {
//           date: "15-02-2026",
//           orderId: "ORD-0245",
//           customer: "Amit Tiwari",
//           mobile: "9811223344",
//           payment: "Online",
//           orderType: "Delivery",
//           amount: "Rs. 890.00",
//           tax: "Rs. 43.00",
//           discount: "Rs. 100.00",
//           delivery: "Rs. 40.00",
//           reason: "Wrong address",
//           items: [
//             { name: "Family Pizza", qty: 1 },
//             { name: "Garlic Bread", qty: 2 },
//           ],
//         },
//       ],
//       datewise: [
//         {
//           date: "01-06-2026",
//           orderId: "ORD-1002",
//           customer: "Harsh Shah",
//           mobile: "9654321098",
//           payment: "Online",
//           orderType: "Delivery",
//           amount: "Rs. 350.00",
//           tax: "Rs. 17.00",
//           discount: "Rs. 0.00",
//           delivery: "Rs. 40.00",
//           reason: "Out of stock",
//           items: [
//             { name: "Veg Burger", qty: 1 },
//             { name: "Cold Coffee", qty: 1 },
//           ],
//         },
//       ],
//     };

//     const totals: Record<TabKey, string> = {
//       today: "Rs. 1,250.00",
//       weekly: "Rs. 1,330.00",
//       monthly: "Rs. 1,250.00",
//       yearly: "Rs. 2,040.00",
//       datewise: "Rs. 1,250.00",
//     };

//     let currentTab: TabKey = "today";

//     // ── STEP NAVIGATION ──
//     const tabKeys: TabKey[] = [
//       "today",
//       "weekly",
//       "monthly",
//       "yearly",
//       "datewise",
//     ];
//     const totalSteps = tabKeys.length;
//     let currentStep = 0;

//     // ── RENDER TABLE ──
//     const renderTable = (tab: TabKey): void => {
//       const tbody = document.getElementById("table-body");
//       if (!tbody) return;
//       const rows = tabData[tab];
//       if (!rows || rows.length === 0) {
//         tbody.innerHTML = `<tr><td colspan="12" class="no-data">No Data Available</td></tr>`;
//         return;
//       }
//       tbody.innerHTML = rows
//         .map(
//           (r, index) => `
//             <tr>
//                 <td>${r.date}</td>
//                 <td><span class="order-id-badge">${r.orderId}</span></td>
//                 <td>${r.customer}</td>
//                 <td>${r.mobile}</td>
//                 <td>
//                     <span class="badge ${
//                       r.payment === "COD" ? "badge-cod" : "badge-online"
//                     }">
//                         ${r.payment}
//                     </span>
//                 </td>
//                 <td>${r.orderType}</td>
//                 <td><strong>${r.amount}</strong></td>
//                 <td>${r.tax}</td>
//                 <td>${r.discount}</td>
//                 <td>${r.delivery}</td>
//                 <td><span class="badge badge-declined">${r.reason}</span></td>
//                 <td>
//                     <button class="items-btn" data-tab="${tab}" data-index="${index}">ITEMS</button>
//                 </td>
//             </tr>
//         `
//         )
//         .join("");
//     };

//     // ── SWITCH TAB ──
//     const switchTab = (tab: TabKey, btnEl: HTMLElement | null): void => {
//       currentTab = tab;
//       currentStep = tabKeys.indexOf(tab);
//       const stepValue = document.getElementById("stepValue");
//       if (stepValue)
//         stepValue.textContent = currentStep + 1 + "/" + totalSteps;

//       document
//         .querySelectorAll(".tab-btn")
//         .forEach((b) => b.classList.remove("active"));
//       if (btnEl) btnEl.classList.add("active");

//       ["filter-monthly", "filter-yearly", "filter-datewise"].forEach((id) =>
//         document.getElementById(id)?.classList.remove("show")
//       );
//       if (tab === "monthly")
//         document.getElementById("filter-monthly")?.classList.add("show");
//       if (tab === "yearly")
//         document.getElementById("filter-yearly")?.classList.add("show");
//       if (tab === "datewise")
//         document.getElementById("filter-datewise")?.classList.add("show");

//       const label = document.getElementById("total-amount-label");
//       if (label) label.textContent = "Total Amount: " + totals[tab];
//       renderTable(tab);
//     };

//     const navigateStep = (dir: number): void => {
//       currentStep = Math.max(0, Math.min(totalSteps - 1, currentStep + dir));
//       const tab = tabKeys[currentStep];
//       const tabBtns =
//         document.querySelectorAll<HTMLElement>(".tab-btn");
//       switchTab(tab, tabBtns[currentStep] ?? null);
//     };

//     // ── MODAL ──
//     const showItems = (tab: TabKey, index: number): void => {
//       if (!tabData[tab] || !tabData[tab][index] || !tabData[tab][index].items) {
//         console.error("Invalid order data", tab, index);
//         return;
//       }
//       const order = tabData[tab][index];
//       const modalTitle = document.getElementById("modalTitle");
//       if (modalTitle)
//         modalTitle.textContent = "Order Details — " + order.orderId;
//       const itemsTableBody = document.getElementById("itemsTableBody");
//       if (itemsTableBody)
//         itemsTableBody.innerHTML = order.items
//           .map(
//             (item) => `
//             <tr>
//                 <td>${item.name}</td>
//                 <td>${item.qty}</td>
//             </tr>
//         `
//           )
//           .join("");
//       document.getElementById("itemsModal")?.classList.add("open");
//     };

//     const closeModal = (): void => {
//       document.getElementById("itemsModal")?.classList.remove("open");
//     };

//     // ── EXPORT TO EXCEL ──
//     const exportToExcel = (): void => {
//       const XLSX = window.XLSX;
//       if (!XLSX) return;
//       const rows = tabData[currentTab];
//       const wsData: unknown[][] = [
//         [
//           "Date",
//           "Order ID",
//           "Customer Name",
//           "Mobile No",
//           "Payment Method",
//           "Order Type",
//           "Total Amount",
//           "Total Tax (Rs.)",
//           "Total Discount (Rs.)",
//           "Delivery Charge",
//           "Reason",
//         ],
//       ];
//       rows.forEach((r) => {
//         wsData.push([
//           r.date,
//           r.orderId,
//           r.customer,
//           r.mobile,
//           r.payment,
//           r.orderType,
//           r.amount,
//           r.tax,
//           r.discount,
//           r.delivery,
//           r.reason,
//         ]);
//       });
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       (ws as { [k: string]: unknown })["!cols"] = [
//         { wch: 14 },
//         { wch: 12 },
//         { wch: 20 },
//         { wch: 14 },
//         { wch: 16 },
//         { wch: 12 },
//         { wch: 16 },
//         { wch: 16 },
//         { wch: 20 },
//         { wch: 16 },
//         { wch: 24 },
//       ];
//       XLSX.utils.book_append_sheet(wb, ws, "Declined Orders");
//       const today = new Date();
//       const dateStr =
//         today.getFullYear() +
//         "-" +
//         String(today.getMonth() + 1).padStart(2, "0") +
//         "-" +
//         String(today.getDate()).padStart(2, "0");
//       XLSX.writeFile(
//         wb,
//         "Declined_Orders_" + currentTab + "_" + dateStr + ".xlsx"
//       );
//     };

//     // ── Tab buttons (formerly inline onclick=switchTab) ──
//     const tabBtns = Array.from(
//       document.querySelectorAll<HTMLButtonElement>(".tab-btn")
//     );
//     const tabHandlers = tabBtns.map((btn, i) => {
//       const handler = (): void => switchTab(tabKeys[i], btn);
//       btn.addEventListener("click", handler);
//       return { btn, handler };
//     });

//     // ── Export button (formerly inline onclick=exportToExcel) ──
//     const exportBtn = document.querySelector<HTMLButtonElement>(".btn-export");
//     exportBtn?.addEventListener("click", exportToExcel);

//     // ── Step nav (formerly inline onclick=navigateStep) ──
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const onPrev = (): void => navigateStep(-1);
//     const onNext = (): void => navigateStep(1);
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     // ── ITEMS button — event delegation on the table body (dynamic rows) ──
//     const tableBody = document.getElementById("table-body");
//     const onTableClick = (e: Event): void => {
//       const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
//         ".items-btn"
//       );
//       if (!btn) return;
//       const tab = btn.getAttribute("data-tab") as TabKey | null;
//       const index = btn.getAttribute("data-index");
//       if (tab && index !== null) showItems(tab, parseInt(index, 10));
//     };
//     tableBody?.addEventListener("click", onTableClick);

//     // ── Close button (formerly inline onclick=closeModal) ──
//     const closeBtn = document.querySelector<HTMLButtonElement>(".close-btn");
//     closeBtn?.addEventListener("click", closeModal);

//     // Close modal on backdrop click
//     const itemsModal = document.getElementById("itemsModal");
//     const onModalClick = (e: MouseEvent): void => {
//       if (e.target === itemsModal) closeModal();
//     };
//     itemsModal?.addEventListener("click", onModalClick);

//     // Close modal on Escape key
//     const onKeydown = (e: KeyboardEvent): void => {
//       if (e.key === "Escape") closeModal();
//     };
//     document.addEventListener("keydown", onKeydown);

//     // ── HEADER DROPDOWN — close on document click ──
//     const closeDropdowns = (): void => {
//       document
//         .querySelectorAll(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", closeDropdowns);

//     // ── init (was DOMContentLoaded) ──
//     renderTable("today");

//     return () => {
//       tabHandlers.forEach(({ btn, handler }) =>
//         btn.removeEventListener("click", handler)
//       );
//       exportBtn?.removeEventListener("click", exportToExcel);
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//       tableBody?.removeEventListener("click", onTableClick);
//       closeBtn?.removeEventListener("click", closeModal);
//       itemsModal?.removeEventListener("click", onModalClick);
//       document.removeEventListener("keydown", onKeydown);
//       document.removeEventListener("click", closeDropdowns);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-declined-order">
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       {/* ── HEADER ── */}

//       {/* ── APP CONTAINER ── */}
//       <div className="app-container">
//         {/* Outer Sidebar */}

//         {/* Inner Sidebar */}

//         {/* ── MAIN CONTENT ── */}
//         <div className="main-content">
//           <div className="report-card">
//             {/* <div class="report-title">Total Declined Order Reports</div>
//              <div style="display:flex;align-items:center;gap:10px;">
//                <button class="action-btn action-btn-help">
//                                 <svg viewBox="0 0 24 24">
//                                     <circle cx="12" cy="12" r="10"></circle>
//                                     <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
//                                     <line x1="12" y1="17" x2="12.01" y2="17"></line>
//                                 </svg>
//                                 HELP

//             </div> */}

//             <div className="report-header">
//               <div className="typ-page-heading report-title">Total Declined Order Reports</div>

//               <button className="action-btn action-btn-help">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10" />
//                   <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
//                   <line x1="12" y1="17" x2="12.01" y2="17" />
//                 </svg>
//                 HELP
//               </button>
//             </div>
//             {/* Tabs bar */}
//             <div className="tabs-bar">
//               <div className="tabs">
//                 <button className="tab-btn active">Today</button>
//                 <button className="tab-btn">Weekly</button>
//                 <button className="tab-btn">Monthly</button>
//                 <button className="tab-btn">Yearly</button>
//                 <button className="tab-btn">Date Wise</button>
//               </div>
//               <button className="btn-export">
//                 <i className="fas fa-file-excel"></i> Export to Excel
//               </button>
//             </div>

//             {/* Monthly filter */}
//             <div className="filter-row" id="filter-monthly">
//               <div className="filter-group">
//                 <label>Select Month</label>
//                 <select id="monthly-month" defaultValue="6">
//                   <option value="1">January</option>
//                   <option value="2">February</option>
//                   <option value="3">March</option>
//                   <option value="4">April</option>
//                   <option value="5">May</option>
//                   <option value="6">June</option>
//                   <option value="7">July</option>
//                   <option value="8">August</option>
//                   <option value="9">September</option>
//                   <option value="10">October</option>
//                   <option value="11">November</option>
//                   <option value="12">December</option>
//                 </select>
//               </div>
//               <div className="filter-group">
//                 <label>Select Year</label>
//                 <select id="monthly-year" defaultValue="2026">
//                   <option value="2024">2024</option>
//                   <option value="2025">2025</option>
//                   <option value="2026">2026</option>
//                 </select>
//               </div>
//               <button className="btn-apply">APPLY</button>
//             </div>

//             {/* Yearly filter */}
//             <div className="filter-row" id="filter-yearly">
//               <div className="filter-group">
//                 <label>Select Year</label>
//                 <select id="yearly-year" defaultValue="2026">
//                   <option value="2024">2024</option>
//                   <option value="2025">2025</option>
//                   <option value="2026">2026</option>
//                 </select>
//               </div>
//               <button className="btn-apply">APPLY</button>
//             </div>

//             {/* Date Wise filter */}
//             <div className="filter-row" id="filter-datewise">
//               <div className="filter-group">
//                 <label>From Date:</label>
//                 <input type="date" id="from-date" defaultValue="2026-05-31" />
//               </div>
//               <div className="filter-group">
//                 <label>To Date:</label>
//                 <input type="date" id="to-date" defaultValue="2026-06-05" />
//               </div>
//               <button className="btn-apply">APPLY</button>
//             </div>

//             {/* Total Amount */}
//             <div className="total-amount" id="total-amount-label">
//               Total Amount: Rs. 1,250.00
//             </div>

//             {/* Table */}
//             <div className="table-wrapper">
//               <table id="report-table">
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Order ID</th>
//                     <th>Customer Name</th>
//                     <th>Mobile No</th>
//                     <th>Payment Method</th>
//                     <th>Order Type</th>
//                     <th>Total Amount</th>
//                     <th>Total tax (Rs.)</th>
//                     <th>Total Discount (Rs.)</th>
//                     <th>Delivery Charge</th>
//                     <th>Reason</th>
//                     <th>Details</th>
//                   </tr>
//                 </thead>
//                 <tbody id="table-body"></tbody>
//               </table>
//             </div>
//           </div>

//           {/* Step Navigation */}
//           <div className="step-nav">
//             <button className="nav-btn" id="prevBtn">
//               <i className="fas fa-chevron-left"></i> PREVIOUS
//             </button>
//             <div className="step-badge">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 1/5
//               </span>
//             </div>
//             <button className="nav-btn" id="nextBtn">
//               NEXT <i className="fas fa-chevron-right"></i>
//             </button>
//           </div>
//         </div>

//         {/* ── MODAL ── */}
//         <div id="itemsModal" className="modal">
//           <div className="modal-content">
//             <button className="close-btn">×</button>
//             <h2 id="modalTitle">Order Details</h2>
//             <table className="modal-table">
//               <thead>
//                 <tr>
//                   <th>Item Name</th>
//                   <th>Quantity</th>
//                 </tr>
//               </thead>
//               <tbody id="itemsTableBody"></tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import "./page.css";
import { reportsService, VoidOrder, OrderItemDetail } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

type TabKey = "today" | "weekly" | "monthly" | "yearly" | "datewise";

interface DisplayOrder {
    date: string;
    orderId: string;
    customer: string;
    mobile: string;
    payment: string;
    orderType: string;
    amount: string;
    tax: string;
    discount: string;
    delivery: string;
    reason: string;
    fullAmount: number;
}

export default function DeclinedOrderPage() {
    const shopId = useShopId();
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [data, setData] = useState<DisplayOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [serverTotalRecords, setServerTotalRecords] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("");

    const isServerPaginated = true;
    const totalRecords = isServerPaginated ? serverTotalRecords : data.length;
    const totalPages = isServerPaginated ? serverTotalPages : Math.max(1, Math.ceil(data.length / pageSize));
    const displayedData = isServerPaginated ? data : data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    // Fetch data automatically for tabs without apply buttons (today, weekly)
    // and whenever pagination or payment method changes.
    useEffect(() => {
        if (shopId) {
            if (activeTab === "today" || activeTab === "weekly") {
                fetchData(activeTab);
            }
        }
    }, [shopId, activeTab, pageNumber, pageSize, paymentMethod]);

    // Format date from API
    const formatDate = (item: any): string => {
        if (!item) return "-";
        if (item.trans_date) {
            const d = item.trans_date;
            if (typeof d === "object") {
                const day = d.Day ?? d.day;
                const month = d.Month ?? d.month;
                const year = d.Year ?? d.year;
                if (day !== undefined && month !== undefined && year !== undefined) {
                    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
                }
                if (d.Value || d.value) {
                    const dt = new Date(d.Value || d.value);
                    if (!isNaN(dt.getTime())) {
                        return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
                    }
                }
            } else if (typeof d === "string") {
                return d;
            }
        }
        return "-";
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return `Rs. ${amount.toFixed(2)}`;
    };

    // Transform Void Order API items to display format
    const transformVoidOrders = (items: VoidOrder[]): DisplayOrder[] => {
        if (!items || items.length === 0) return [];

        return items.map((item) => {
            const amountNum = item.total_amount ?? item.full_amount ?? 0;
            const taxNum = item.total_tax ?? 0;
            const discountNum = item.discount ?? 0;

            return {
                date: formatDate(item),
                orderId: item.order_id || item.pos_order_id || "-",
                customer: item.name || "Guest",
                mobile: item.mobile_no || "-",
                payment: item.payment_method || "-",
                orderType: item.delivery_method_name || item.order_type || "-",
                amount: formatCurrency(amountNum),
                tax: formatCurrency(taxNum),
                discount: formatCurrency(discountNum),
                delivery: "Rs. 0.00",
                reason: item.declined_reason || item.reason || "No reason provided",
                fullAmount: amountNum,
            };
        });
    };

    // Calculate total amount
    const calculateTotal = (items: DisplayOrder[]): number => {
        return items.reduce((sum, item) => sum + item.fullAmount, 0);
    };

    // Fetch data based on tab
    const fetchData = async (tab: TabKey) => {
        if (!shopId) return;
        setLoading(true);
        setData([]);
        setTotalAmount(0);

        try {
            if (tab === "today") {
                const res = await reportsService.getVoidOrdersByToday(shopId, pageNumber, pageSize);
                const transformed = transformVoidOrders(res.items);
                setData(transformed);
                setTotalAmount(calculateTotal(transformed));
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
            } else if (tab === "weekly") {
                const res = await reportsService.getVoidOrdersByWeek(shopId, paymentMethod, pageNumber, pageSize);
                const transformed = transformVoidOrders(res.items);
                setData(transformed);
                setTotalAmount(calculateTotal(transformed));
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
            } else if (tab === "monthly") {
                const monthVal = (document.getElementById("monthly-month") as HTMLSelectElement)?.value || String(new Date().getMonth() + 1);
                const yearVal = (document.getElementById("monthly-year") as HTMLSelectElement)?.value || String(new Date().getFullYear());
                const res = await reportsService.getVoidOrdersByMonth(shopId, monthVal, yearVal, pageNumber, pageSize);
                const transformed = transformVoidOrders(res.items);
                setData(transformed);
                setTotalAmount(calculateTotal(transformed));
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
            } else if (tab === "yearly") {
                const yearVal = (document.getElementById("yearly-year") as HTMLSelectElement)?.value || String(new Date().getFullYear());
                const res = await reportsService.getVoidOrdersByYear(shopId, yearVal, pageNumber, pageSize);
                const transformed = transformVoidOrders(res.items);
                setData(transformed);
                setTotalAmount(calculateTotal(transformed));
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
            } else if (tab === "datewise") {
                const fromDate = (document.getElementById("from-date") as HTMLInputElement)?.value || "";
                const toDate = (document.getElementById("to-date") as HTMLInputElement)?.value || "";
                const res = await reportsService.getVoidOrdersByDateWise(shopId, fromDate, toDate, pageNumber, pageSize);
                const transformed = transformVoidOrders(res.items);
                setData(transformed);
                setTotalAmount(calculateTotal(transformed));
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
            }
        } catch (err) {
            console.error(`Error fetching ${tab} declined orders:`, err);
            setData([]);
            setTotalAmount(0);
            setServerTotalRecords(0);
            setServerTotalPages(1);
        } finally {
            setLoading(false);
        }
    };


    // Switch tab
    const switchTab = (tab: TabKey, btnEl: HTMLElement | null) => {
        setActiveTab(tab);
        setPageNumber(1);
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        if (btnEl) btnEl.classList.add("active");

        // Show/hide filters
        ["filter-weekly", "filter-monthly", "filter-yearly", "filter-datewise"].forEach((id) => {
            document.getElementById(id)?.classList.remove("show");
        });
        if (tab === "weekly") document.getElementById("filter-weekly")?.classList.add("show");
        if (tab === "monthly") document.getElementById("filter-monthly")?.classList.add("show");
        if (tab === "yearly") document.getElementById("filter-yearly")?.classList.add("show");
        if (tab === "datewise") document.getElementById("filter-datewise")?.classList.add("show");

        // Update total label
        const label = document.getElementById("total-amount-label");
        if (label) {
            const total = calculateTotal(data);
            label.textContent = `Total Amount: Rs. ${total.toFixed(2)}`;
        }
    };

    // Show order details modal with items
    const showOrderDetails = async (order: DisplayOrder) => {
        setSelectedOrder(order);
        setOrderItems([]);
        setItemsLoading(true);

        // Open modal
        document.getElementById("itemsModal")?.classList.add("open");

        try {
            // Fetch order items
            const items = await reportsService.fetchOrderItemDetails(order.orderId);
            setOrderItems(items);
        } catch (err) {
            console.error("Error fetching order items:", err);
            setOrderItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    // Close modal
    const closeModal = () => {
        setSelectedOrder(null);
        setOrderItems([]);
        document.getElementById("itemsModal")?.classList.remove("open");
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!data || data.length === 0) {
            alert("No records to export.");
            return;
        }

        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("Excel library not loaded yet.");
            return;
        }

        const wsData: any[][] = [
            ["Date", "Order ID", "Customer Name", "Mobile No", "Payment Method", "Order Type", "Total Amount", "Total Tax (Rs.)", "Total Discount (Rs.)", "Delivery Charge", "Reason"],
        ];

        data.forEach((r) => {
            wsData.push([
                r.date,
                r.orderId,
                r.customer,
                r.mobile,
                r.payment,
                r.orderType,
                r.amount,
                r.tax,
                r.discount,
                r.delivery,
                r.reason,
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!cols"] = [
            { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 14 },
            { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
            { wch: 20 }, { wch: 16 }, { wch: 24 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, "Declined Orders");
        const dateStr = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `Declined_Orders_${activeTab}_${dateStr}.xlsx`);
    };

    // Render table
    const renderTable = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={12} className="no-data">Loading...</td>
                </tr>
            );
        }

        if (!displayedData || displayedData.length === 0) {
            return (
                <tr>
                    <td colSpan={12} className="no-data">No Data Available</td>
                </tr>
            );
        }

        return displayedData.map((row, index) => (
            <tr key={index}>
                <td>{row.date}</td>
                <td><span className="order-id-badge">{row.orderId}</span></td>
                <td>{row.customer}</td>
                <td>{row.mobile}</td>
                <td>
                    <span className={`badge ${row.payment === "COD" ? "badge-cod" : "badge-online"}`}>
                        {row.payment}
                    </span>
                </td>
                <td>{row.orderType}</td>
                <td><strong>{row.amount}</strong></td>
                <td>{row.tax}</td>
                <td>{row.discount}</td>
                <td>{row.delivery}</td>
                <td><span className="badge badge-declined">{row.reason}</span></td>
                <td>
                    <button className="items-btn" onClick={() => showOrderDetails(row)}>
                        ITEMS
                    </button>
                </td>
            </tr>
        ));
    };

    // Populate year dropdowns
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const populateYears = (selectId: string) => {
            const el = document.getElementById(selectId) as HTMLSelectElement | null;
            if (!el) return;
            el.innerHTML = "";
            for (let y = currentYear; y >= currentYear - 9; y--) {
                const opt = document.createElement("option");
                opt.value = String(y);
                opt.textContent = String(y);
                if (y === currentYear) opt.selected = true;
                el.appendChild(opt);
            }
        };

        populateYears("monthly-year");
        populateYears("yearly-year");

        // Set date defaults
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const fromDate = document.getElementById("from-date") as HTMLInputElement | null;
        const toDate = document.getElementById("to-date") as HTMLInputElement | null;
        if (fromDate) fromDate.value = monthAgo.toISOString().split("T")[0];
        if (toDate) toDate.value = today.toISOString().split("T")[0];

        // Set current month
        const monthSelect = document.getElementById("monthly-month") as HTMLSelectElement | null;
        if (monthSelect) monthSelect.value = String(today.getMonth() + 1);
    }, []);

    // Wire up event listeners
    useEffect(() => {
        // Tab buttons
        const tabKeys: TabKey[] = ["today", "weekly", "monthly", "yearly", "datewise"];
        const tabBtns = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
        const tabHandlers: Array<{ btn: HTMLButtonElement; handler: () => void }> = [];

        tabBtns.forEach((btn, i) => {
            const handler = () => switchTab(tabKeys[i], btn);
            btn.addEventListener("click", handler);
            tabHandlers.push({ btn, handler });
        });

        // Apply buttons for filters
        const applyButtons = document.querySelectorAll(".btn-apply");
        const applyHandlers: Array<{ btn: Element; handler: () => void }> = [];
        applyButtons.forEach((btn) => {
            const handler = () => {
                const panel = btn.closest(".filter-row");
                let tab: TabKey = "monthly";
                if (panel?.id === "filter-monthly") tab = "monthly";
                else if (panel?.id === "filter-yearly") tab = "yearly";
                else if (panel?.id === "filter-datewise") tab = "datewise";
                setPageNumber(1);
                fetchData(tab);
            };
            btn.addEventListener("click", handler);
            applyHandlers.push({ btn, handler });
        });

        // Export button
        const exportBtn = document.querySelector<HTMLButtonElement>(".btn-export");
        exportBtn?.addEventListener("click", exportToExcel);

        // Modal close
        const closeBtn = document.querySelector<HTMLButtonElement>(".close-btn");
        closeBtn?.addEventListener("click", closeModal);

        const itemsModal = document.getElementById("itemsModal");
        const onModalClick = (e: MouseEvent) => {
            if (e.target === itemsModal) closeModal();
        };
        itemsModal?.addEventListener("click", onModalClick);

        // Step nav
        let currentStep = 0;
        const totalSteps = 5;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const stepValue = document.getElementById("stepValue");

        const navigateStep = (dir: number) => {
            currentStep = Math.max(0, Math.min(totalSteps - 1, currentStep + dir));
            const tab = tabKeys[currentStep];
            if (stepValue) stepValue.textContent = `${currentStep + 1}/${totalSteps}`;
            const tabBtnsList = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
            switchTab(tab, tabBtnsList[currentStep]);
        };

        prevBtn?.addEventListener("click", () => navigateStep(-1));
        nextBtn?.addEventListener("click", () => navigateStep(1));

        // Help button
        const helpBtn = document.querySelector(".action-btn-help");
        helpBtn?.addEventListener("click", () => {
            alert("Help & Support - Declined Orders");
        });

        return () => {
            tabHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
            applyHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
            exportBtn?.removeEventListener("click", exportToExcel);
            closeBtn?.removeEventListener("click", closeModal);
            itemsModal?.removeEventListener("click", onModalClick);
            prevBtn?.removeEventListener("click", () => { });
            nextBtn?.removeEventListener("click", () => { });
            helpBtn?.removeEventListener("click", () => { });
        };
    }, [data]);

    return (
        <div id="pg-reports-declined-order">
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
                strategy="afterInteractive"
            />

            <div className="app-container">
                <div className="main-content">
                    <div className="report-card">
                        <div className="report-header">
                            <div className="report-title">Total Declined Order Reports {totalAmount > 0 ? `(Total: Rs. ${totalAmount.toFixed(2)})` : ""}</div>
                            <button className="action-btn action-btn-help">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                HELP
                            </button>
                        </div>

                        {/* Tabs bar */}
                        <div className="tabs-bar">
                            <div className="tabs">
                                <button className="tab-btn active">Today</button>
                                <button className="tab-btn">Weekly</button>
                                <button className="tab-btn">Monthly</button>
                                <button className="tab-btn">Yearly</button>
                                <button className="tab-btn">Date Wise</button>
                            </div>
                            <button className="btn-export">
                                <i className="fas fa-file-excel"></i> Export to Excel
                            </button>
                        </div>

                        {/* Weekly filter */}
                        <div className="filter-row" id="filter-weekly">
                            <div className="filter-group">
                                <label>Payment Method</label>
                                <select
                                    id="weekly-payment-method"
                                    value={paymentMethod}
                                    onChange={(e) => {
                                        setPaymentMethod(e.target.value);
                                        setPageNumber(1);
                                    }}
                                >
                                    <option value="">All</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Online">Online</option>
                                    <option value="COD">COD</option>
                                </select>
                            </div>
                        </div>

                        {/* Monthly filter */}
                        <div className="filter-row" id="filter-monthly">
                            <div className="filter-group">
                                <label>Select Month</label>
                                <select id="monthly-month" defaultValue="6">
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
                                <label>Select Year</label>
                                <select id="monthly-year"></select>
                            </div>
                            <button className="btn-apply">APPLY</button>
                        </div>

                        {/* Yearly filter */}
                        <div className="filter-row" id="filter-yearly">
                            <div className="filter-group">
                                <label>Select Year</label>
                                <select id="yearly-year"></select>
                            </div>
                            <button className="btn-apply">APPLY</button>
                        </div>

                        {/* Date Wise filter */}
                        <div className="filter-row" id="filter-datewise">
                            <div className="filter-group">
                                <label>From Date:</label>
                                <input type="date" id="from-date" />
                            </div>
                            <div className="filter-group">
                                <label>To Date:</label>
                                <input type="date" id="to-date" />
                            </div>
                            <button className="btn-apply">APPLY</button>
                        </div>

                        {/* Total Amount & Pagination Header Controls */}
                        <div className="total-amount" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span id="total-amount-label">Total Amount: Rs. 0.00</span>
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

                        {/* Table */}
                        <div className="table-wrapper">
                            <table id="report-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Order ID</th>
                                        <th>Customer Name</th>
                                        <th>Mobile No</th>
                                        <th>Payment Method</th>
                                        <th>Order Type</th>
                                        <th>Total Amount</th>
                                        <th>Total tax (Rs.)</th>
                                        <th>Total Discount (Rs.)</th>
                                        <th>Delivery Charge</th>
                                        <th>Reason</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody id="table-body">
                                    {renderTable()}
                                </tbody>
                            </table>
                        </div>

                        <ReportPagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={(page) => setPageNumber(page)}
                            disabled={loading}
                        />
                    </div>

                    {/* Step Navigation */}
                    <div className="step-nav">
                        <button className="nav-btn" id="prevBtn">
                            <i className="fas fa-chevron-left"></i> PREVIOUS
                        </button>
                        <div className="step-badge">
                            <span className="step-label">STEP</span>
                            <span className="step-value" id="stepValue">1/5</span>
                        </div>
                        <button className="nav-btn" id="nextBtn">
                            NEXT <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* Modal */}
                <div id="itemsModal" className="modal">
                    <div className="modal-content">
                        <button className="close-btn">×</button>
                        <h3 id="modalTitle">Order Details - {selectedOrder?.orderId || ""}</h3>

                        {/* {selectedOrder && (
                            <div className="order-info">
                                <p><strong>Customer:</strong> {selectedOrder.customer}</p>
                                <p><strong>Mobile:</strong> {selectedOrder.mobile}</p>
                                <p><strong>Payment:</strong> {selectedOrder.payment}</p>
                                <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
                                <p><strong>Amount:</strong> {selectedOrder.amount}</p>
                                <p><strong>Reason:</strong> {selectedOrder.reason}</p>
                            </div>
                        )} */}

                        <h3>Items</h3>
                        {itemsLoading ? (
                            <p>Loading items...</p>
                        ) : orderItems.length > 0 ? (
                            <table className="modal-table">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Quantity</th>
                                        {/* <th>Single Price</th>
                                        <th>Total Amount</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.item_name}</td>
                                            <td>{item.quantity}</td>
                                            {/* <td>Rs. {item.single_price.toFixed(2)}</td>
                                            <td>Rs. {item.total_amount.toFixed(2)}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No items found for this order.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}