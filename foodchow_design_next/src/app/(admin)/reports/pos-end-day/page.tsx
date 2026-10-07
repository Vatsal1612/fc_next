// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/pos-end-day.html → React.
//  * Pixel-perfect mechanical port. Inline <script> ported into one useEffect
//  * wiring behaviour via addEventListener (no hydration mismatch). The shell
//  * provides header/sidebar, so only the original body content is rendered.
//  */
// type SummaryData = {
//   total_sales: string;
//   total_orders: number;
//   cash: string;
//   card: string;
//   online: string;
//   refund: string;
// };
// type RowData = {
//   time: string;
//   order_id: string;
//   customer: string;
//   payment: string;
//   order_type: string;
//   amount: string;
//   status: string;
// };
// type DayRecord = { summary: SummaryData; rows: RowData[] };

// export default function PosEndDayPage() {
//   useEffect(() => {
//     // Static demo data keyed by date
//     const staticData: Record<string, DayRecord> = {
//       "2026-06-13": {
//         summary: {
//           total_sales: "₹4,850.00",
//           total_orders: 12,
//           cash: "₹2,200.00",
//           card: "₹1,650.00",
//           online: "₹1,000.00",
//           refund: "₹0.00",
//         },
//         rows: [
//           {
//             time: "09:15 AM",
//             order_id: "99005010",
//             customer: "Rahul Shah",
//             payment: "Cash",
//             order_type: "Dine In",
//             amount: "₹450.00",
//             status: "Completed",
//           },
//           {
//             time: "10:30 AM",
//             order_id: "99005021",
//             customer: "Meena Patel",
//             payment: "Card",
//             order_type: "Take Away",
//             amount: "₹320.00",
//             status: "Completed",
//           },
//           {
//             time: "11:00 AM",
//             order_id: "99005033",
//             customer: "Kiran Dave",
//             payment: "Online",
//             order_type: "Delivery",
//             amount: "₹550.00",
//             status: "Completed",
//           },
//           {
//             time: "12:15 PM",
//             order_id: "99005044",
//             customer: "Suresh Joshi",
//             payment: "Cash",
//             order_type: "Dine In",
//             amount: "₹780.00",
//             status: "Completed",
//           },
//           {
//             time: "01:45 PM",
//             order_id: "99005055",
//             customer: "Priya Desai",
//             payment: "Card",
//             order_type: "Take Away",
//             amount: "₹230.00",
//             status: "Completed",
//           },
//           {
//             time: "02:30 PM",
//             order_id: "99005066",
//             customer: "Amit Trivedi",
//             payment: "Cash",
//             order_type: "Dine In",
//             amount: "₹670.00",
//             status: "Completed",
//           },
//           {
//             time: "03:00 PM",
//             order_id: "99005077",
//             customer: "Neha Kapoor",
//             payment: "Online",
//             order_type: "Delivery",
//             amount: "₹450.00",
//             status: "Completed",
//           },
//           {
//             time: "04:20 PM",
//             order_id: "99005088",
//             customer: "Vijay Mehta",
//             payment: "Cash",
//             order_type: "Dine In",
//             amount: "₹300.00",
//             status: "Completed",
//           },
//           {
//             time: "05:45 PM",
//             order_id: "99005090",
//             customer: "Anjali Singh",
//             payment: "Card",
//             order_type: "Take Away",
//             amount: "₹410.00",
//             status: "Completed",
//           },
//           {
//             time: "07:10 PM",
//             order_id: "99005092",
//             customer: "Deepak Nair",
//             payment: "Cash",
//             order_type: "Dine In",
//             amount: "₹280.00",
//             status: "Completed",
//           },
//           {
//             time: "08:30 PM",
//             order_id: "99005093",
//             customer: "Ritu Sharma",
//             payment: "Online",
//             order_type: "Delivery",
//             amount: "₹210.00",
//             status: "Completed",
//           },
//           {
//             time: "09:00 PM",
//             order_id: "99005094",
//             customer: "Pratik Chauhan",
//             payment: "Cash",
//             order_type: "Take Away",
//             amount: "₹200.00",
//             status: "Completed",
//           },
//         ],
//       },
//     };

//     const getData = (): void => {
//       const date =
//         (document.getElementById("reportDate") as HTMLInputElement | null)
//           ?.value ?? "";
//       const area = document.getElementById("result-area");
//       if (!area) return;

//       if (!date) {
//         alert("Please select a date");
//         return;
//       }

//       // Check for static data match (show data for 2026-06-13, else no record)
//       const record = staticData[date];

//       if (!record) {
//         area.innerHTML = '<p class="no-record">No Record Found</p>';
//         return;
//       }

//       const s = record.summary;
//       area.innerHTML = `
//             <div class="result-section">
//                 <div class="summary-cards">
//                     <div class="summary-card">
//                         <div class="s-label">Total Sales</div>
//                         <div class="s-value">${s.total_sales}</div>
//                     </div>
//                     <div class="summary-card">
//                         <div class="s-label">Total Orders</div>
//                         <div class="s-value">${s.total_orders}</div>
//                     </div>
//                     <div class="summary-card">
//                         <div class="s-label">Cash</div>
//                         <div class="s-value">${s.cash}</div>
//                     </div>
//                     <div class="summary-card">
//                         <div class="s-label">Card</div>
//                         <div class="s-value">${s.card}</div>
//                     </div>
//                     <div class="summary-card">
//                         <div class="s-label">Online</div>
//                         <div class="s-value">${s.online}</div>
//                     </div>
//                     <div class="summary-card">
//                         <div class="s-label">Refund</div>
//                         <div class="s-value">${s.refund}</div>
//                     </div>
//                 </div>

//                 <p class="section-title">Description</p>
//                 <div class="table-wrapper">
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Time</th>
//                                 <th>Order ID</th>
//                                 <th>Customer Name</th>
//                                 <th>Payment Method</th>
//                                 <th>Order Type</th>
//                                 <th>Amount (Rs.)</th>
//                                 <th>Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${record.rows
//                               .map(
//                                 (r) => `
//                             <tr>
//                                 <td style="color:var(--text-light);font-size:12.5px;">${r.time}</td>
//                                 <td><span class="order-pill">${r.order_id}</span></td>
//                                 <td style="font-weight:600;">${r.customer}</td>
//                                 <td><span class="${r.payment === "Cash" ? "pay-cash" : r.payment === "Card" ? "pay-card" : "pay-online"}">${r.payment}</span></td>
//                                 <td><span class="type-pill">${r.order_type}</span></td>
//                                 <td class="amount-cell">${r.amount}</td>
//                                 <td><span class="status-done"><i class="fas fa-check" style="font-size:10px;"></i>${r.status}</span></td>
//                             </tr>`
//                               )
//                               .join("")}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         `;
//     };

//     // HELP modal open / close
//     const helpModal = document.getElementById("helpModal");
//     const helpBtn = document.getElementById("openHelpBtn");
//     const helpCloseBtn = document.getElementById("helpModalClose");
//     const onHelpOpen = (): void => helpModal?.classList.add("show");
//     const onHelpClose = (): void => helpModal?.classList.remove("show");
//     helpBtn?.addEventListener("click", onHelpOpen);
//     helpCloseBtn?.addEventListener("click", onHelpClose);

//     // GET DATA
//     const getDataBtn = document.getElementById("getDataBtn");
//     getDataBtn?.addEventListener("click", getData);

//     // Sidebar toggle (menu / submenu) — kept for parity with the source
//     const menuItems = Array.from(
//       document.querySelectorAll<HTMLElement>(".menu-item")
//     );
//     const menuHandlers = menuItems.map((item) => {
//       const handler = function (this: HTMLElement): void {
//         document
//           .querySelectorAll(".menu-item")
//           .forEach((m) => m.classList.remove("active"));
//         this.classList.add("active");
//         document
//           .querySelectorAll(".submenu-group")
//           .forEach((g) => g.classList.remove("active"));
//         const targetId = this.getAttribute("data-target");
//         if (targetId) {
//           const t = document.getElementById(targetId);
//           if (t) {
//             t.classList.add("active");
//             const first = t.querySelector(".submenu-item");
//             if (first) {
//               document
//                 .querySelectorAll(".submenu-item")
//                 .forEach((sub) => sub.classList.remove("active"));
//               first.classList.add("active");
//             }
//           }
//         }
//       };
//       item.addEventListener("click", handler);
//       return { item, handler };
//     });

//     const submenuItems = Array.from(
//       document.querySelectorAll<HTMLElement>(".submenu-item")
//     );
//     const submenuHandlers = submenuItems.map((item) => {
//       const handler = function (this: HTMLElement, e: Event): void {
//         e.preventDefault();
//         document
//           .querySelectorAll(".submenu-item")
//           .forEach((sub) => sub.classList.remove("active"));
//         this.classList.add("active");
//       };
//       item.addEventListener("click", handler);
//       return { item, handler };
//     });

//     // Step footer
//     let currentStep = 15;
//     const totalSteps = 26;
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     const onPrev = (): void => {
//       if (currentStep > 1) {
//         currentStep--;
//         const sv = document.getElementById("stepValue");
//         if (sv) sv.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     const onNext = (): void => {
//       if (currentStep < totalSteps) {
//         currentStep++;
//         const sv = document.getElementById("stepValue");
//         if (sv) sv.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     // Default the date input to today
//     const reportDate = document.getElementById(
//       "reportDate"
//     ) as HTMLInputElement | null;
//     if (reportDate) reportDate.value = new Date().toISOString().split("T")[0];

//     // Close header dropdowns on document click
//     const closeDropdowns = (): void => {
//       document
//         .querySelectorAll(".dropdown-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", closeDropdowns);

//     return () => {
//       helpBtn?.removeEventListener("click", onHelpOpen);
//       helpCloseBtn?.removeEventListener("click", onHelpClose);
//       getDataBtn?.removeEventListener("click", getData);
//       menuHandlers.forEach(({ item, handler }) =>
//         item.removeEventListener("click", handler)
//       );
//       submenuHandlers.forEach(({ item, handler }) =>
//         item.removeEventListener("click", handler)
//       );
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//       document.removeEventListener("click", closeDropdowns);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-pos-end-day">
//       {/* APP CONTAINER */}
//       <div className="app-container">
//         {/* MAIN CONTENT */}
//         <div className="main-content">
//           <div className="page-card">
//             <div className="page-header">
//               <h2 className="typ-page-heading page-title">End Day Report</h2>
//               <button className="btn-help" id="openHelpBtn">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10"></circle>
//                   <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
//                   <line x1="12" y1="17" x2="12.01" y2="17"></line>
//                 </svg>
//                 HELP
//               </button>
//             </div>

//             {/* Filters */}
//             <div className="filter-row">
//               <div className="filter-group">
//                 <label>Select User</label>
//                 <select id="userSelect" defaultValue="admin_user">
//                   <option value="admin_user">admin user</option>
//                   <option value="sujal_barvaliya">Sujal Barvaliya</option>
//                   <option value="pratik_chauhan1">pratik chauhan</option>
//                   <option value="demo_testing">Demo testing</option>
//                   <option value="pratik_chauhan2">Pratik chauhan</option>
//                   <option value="tester_demo">tester demo</option>
//                   <option value="sahil_pathan">Sahil Pathan</option>
//                   <option value="xyz_xyz">xyz xyz</option>
//                   <option value="yash_doctor1">Yash Doctor</option>
//                   <option value="yash_doctor2">Yash Doctor</option>
//                   <option value="yash_doctor3">Yash Doctor</option>
//                   <option value="yash_doctor4">yash doctor</option>
//                   <option value="yash_doctor5">Yash Doctor</option>
//                   <option value="y_d">y d</option>
//                   <option value="test1_test2">test1 test2</option>
//                   <option value="kevin_testing">kevin testing</option>
//                   <option value="yash_doctor_cashier">Yash Doctor cashier</option>
//                   <option value="yash_doctor_waiter">Yash Doctor waiter</option>
//                   <option value="hello_ptl">hello ptl</option>
//                   <option value="abc_afd">abc afd</option>
//                   <option value="abhshek_gamit">Abhshek Gamit</option>
//                   <option value="gammit_abhi">Gammit Abhi</option>
//                   <option value="akki_gamit">Akki Gamit</option>
//                   <option value="abhishek_gamit">Abhishek Gamit</option>
//                   <option value="nikunj_prajapati">nikunj prajapati</option>
//                   <option value="driver1_driver2">Driver 1 Driver 2</option>
//                   <option value="gami_abi">gami abi</option>
//                 </select>
//               </div>
//               <div className="filter-group">
//                 <label>Select Date</label>
//                 <input type="date" id="reportDate" />
//               </div>
//               <button className="btn-get-data" id="getDataBtn">
//                 GET DATA
//               </button>
//             </div>

//             {/* Result Area */}
//             <div id="result-area"></div>
//           </div>
//           <div className="step-footer">
//             <button className="btn-prev" id="prevBtn">
//               <i className="fas fa-chevron-left"></i> PREVIOUS
//             </button>
//             <div className="step-indicator">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 15/26
//               </span>
//             </div>
//             <button className="btn-next" id="nextBtn">
//               NEXT <i className="fas fa-chevron-right"></i>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* HELP MODAL */}
//       <div className="modal-overlay" id="helpModal">
//         <div className="modal-box">
//           <button className="modal-close" id="helpModalClose">
//             ✕
//           </button>
//           <iframe
//             src="https://www.youtube.com/embed/dQw4w9WgXcQ"
//             allowFullScreen
//           ></iframe>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import "./page.css";
import { reportsService, PosUser } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

export default function PosEndDayPage() {
    const shopId = useShopId();
    const [users, setUsers] = useState<PosUser[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [noData, setNoData] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await reportsService.fetchPosUsers(shopId);
                setUsers(data || []);
                
                // Select admin user by default or first user
                const adminUser = data?.find(
                    (u: any) => u.name.toLowerCase() === "admin user"
                );
                setSelectedUser(adminUser ? adminUser.user_name : data[0]?.user_name || "");
            } catch (err) {
                console.error("Error fetching POS users:", err);
            }
        };
        fetchUsers();
    }, [shopId]);

    // Get data function
    const getData = async () => {
        if (!selectedUser) {
            alert("Please select a user");
            return;
        }

        if (!selectedDate) {
            alert("Please select a date");
            return;
        }

        setLoading(true);
        setNoData(false);
        setReportData(null);
        setPageNumber(1);

        try {
            const result = await reportsService.fetchPosEndDayReport(
                shopId,
                selectedUser,
                selectedDate,
                pageNumber,
                pageSize
            );

            console.log("Report response:", result);

            // Check if we have data
            if (!result || (Array.isArray(result) && result.length === 0) || (result.items && Array.isArray(result.items) && result.items.length === 0)) {
                setNoData(true);
            } else {
                setReportData(result);
            }
        } catch (err) {
            console.error("Error fetching POS end day report:", err);
            setNoData(true);
        } finally {
            setLoading(false);
        }
    };

    // Render the report
    const renderReport = () => {
        if (loading) {
            return <p className="no-record" style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;
        }

        if (noData) {
            return <p className="no-record" style={{ textAlign: "center", padding: "40px" }}>No Record Found</p>;
        }

        if (!reportData) {
            return null;
        }

        // If the data is an array, display it as a table
        if (Array.isArray(reportData)) {
            const totalRecords = reportData.length;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const startIndex = (pageNumber - 1) * pageSize;
            const paginatedRows = reportData.slice(startIndex, startIndex + pageSize);
            const endIndex = Math.min(startIndex + pageSize, totalRecords);

            return (
                <div className="result-section">
                    <h2 className="section-title">Description</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(reportData[0] || {}).map((key) => (
                                        <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.map((row: any, index: number) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value: any, i: number) => (
                                            <td key={i}>{String(value ?? "")}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px' }}>
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
                </div>
            );
        }

        // If the data is an object with summary and rows
        if (reportData.summary && reportData.rows) {
            const s = reportData.summary;
            const rowsArray = reportData.rows || [];
            const totalRecords = rowsArray.length;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const startIndex = (pageNumber - 1) * pageSize;
            const paginatedRows = rowsArray.slice(startIndex, startIndex + pageSize);
            const endIndex = Math.min(startIndex + pageSize, totalRecords);

            return (
                <div className="result-section">
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="s-label">Total Sales</div>
                            <div className="s-value">{s.total_sales || "₹0.00"}</div>
                        </div>
                        <div className="summary-card">
                            <div className="s-label">Total Orders</div>
                            <div className="s-value">{s.total_orders || 0}</div>
                        </div>
                        <div className="summary-card">
                            <div className="s-label">Cash</div>
                            <div className="s-value">{s.cash || "₹0.00"}</div>
                        </div>
                        <div className="summary-card">
                            <div className="s-label">Card</div>
                            <div className="s-value">{s.card || "₹0.00"}</div>
                        </div>
                        <div className="summary-card">
                            <div className="s-label">Online</div>
                            <div className="s-value">{s.online || "₹0.00"}</div>
                        </div>
                        <div className="summary-card">
                            <div className="s-label">Refund</div>
                            <div className="s-value">{s.refund || "₹0.00"}</div>
                        </div>
                    </div>

                    <h2 className="section-title">Description</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Order ID</th>
                                    <th>Customer Name</th>
                                    <th>Payment Method</th>
                                    <th>Order Type</th>
                                    <th>Amount (Rs.)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.map((r: any, index: number) => (
                                    <tr key={index}>
                                        <td style={{ color: "var(--text-light)", fontSize: "12.5px" }}>{r.time}</td>
                                        <td><span className="order-pill">{r.order_id}</span></td>
                                        <td style={{ fontWeight: "600" }}>{r.customer}</td>
                                        <td>
                                            <span className={
                                                r.payment === "Cash" ? "pay-cash" :
                                                    r.payment === "Card" ? "pay-card" :
                                                        "pay-online"
                                            }>
                                                {r.payment}
                                            </span>
                                        </td>
                                        <td><span className="type-pill">{r.order_type}</span></td>
                                        <td className="amount-cell">{r.amount}</td>
                                        <td>
                                            <span className="status-done">
                                                <i className="fas fa-check" style={{ fontSize: "10px" }}></i>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px' }}>
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
                </div>
            );
        }

        // If the data matches the new API format (items array)
        if (reportData.items && Array.isArray(reportData.items)) {
            const items = reportData.items;
            const totalRecords = reportData.totalRecords || items.length;
            const currentPage = reportData.currentPage || pageNumber;
            const totalPages = reportData.totalPages || Math.ceil(totalRecords / pageSize);

            return (
                <div className="result-section">
                    {reportData.summary && (
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="s-label">Total Sales</div>
                                <div className="s-value">{reportData.summary.total_sales || reportData.totalAmount || "₹0.00"}</div>
                            </div>
                            <div className="summary-card">
                                <div className="s-label">Total Orders</div>
                                <div className="s-value">{reportData.summary.total_orders || totalRecords || 0}</div>
                            </div>
                            <div className="summary-card">
                                <div className="s-label">Cash</div>
                                <div className="s-value">{reportData.summary.cash || "₹0.00"}</div>
                            </div>
                            <div className="summary-card">
                                <div className="s-label">Card</div>
                                <div className="s-value">{reportData.summary.card || "₹0.00"}</div>
                            </div>
                            <div className="summary-card">
                                <div className="s-label">Online</div>
                                <div className="s-value">{reportData.summary.online || "₹0.00"}</div>
                            </div>
                            <div className="summary-card">
                                <div className="s-label">Refund</div>
                                <div className="s-value">{reportData.summary.refund || "₹0.00"}</div>
                            </div>
                        </div>
                    )}

                    <h2 className="section-title">Description</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {items.length > 0 && Object.keys(items[0]).map((key) => (
                                        <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((r: any, index: number) => (
                                    <tr key={index}>
                                        {Object.values(r).map((value: any, i: number) => (
                                            <td key={i}>{String(value ?? "")}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px' }}>
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
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
                        </div>
                        <ReportPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setPageNumber(page)}
                        />
                    </div>
                </div>
            );
        }

        // Fallback: display as JSON
        return (
            <div className="result-section">
                <h2 className="section-title">Description</h2>
                <div className="table-wrapper">
                    <pre style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
                        {JSON.stringify(reportData, null, 2)}
                    </pre>
                </div>
            </div>
        );
    };

    // Wire up event listeners
    useEffect(() => {
        const getDataBtn = document.getElementById("getDataBtn");
        const userSelect = document.getElementById("userSelect") as HTMLSelectElement | null;
        const dateInput = document.getElementById("reportDate") as HTMLInputElement | null;

        const handleUserChange = () => {
            if (userSelect) setSelectedUser(userSelect.value);
        };

        const handleDateChange = () => {
            if (dateInput) setSelectedDate(dateInput.value);
        };

        getDataBtn?.addEventListener("click", getData);
        userSelect?.addEventListener("change", handleUserChange);
        dateInput?.addEventListener("change", handleDateChange);

        // HELP modal
        const helpModal = document.getElementById("helpModal");
        const helpBtn = document.getElementById("openHelpBtn");
        const helpCloseBtn = document.getElementById("helpModalClose");

        const onHelpOpen = (): void => helpModal?.classList.add("show");
        const onHelpClose = (): void => helpModal?.classList.remove("show");

        helpBtn?.addEventListener("click", onHelpOpen);
        helpCloseBtn?.addEventListener("click", onHelpClose);

        // Step footer
        let currentStep = 15;
        const totalSteps = 26;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const stepValue = document.getElementById("stepValue");

        const onPrev = (): void => {
            if (currentStep > 1) {
                currentStep--;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        const onNext = (): void => {
            if (currentStep < totalSteps) {
                currentStep++;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        prevBtn?.addEventListener("click", onPrev);
        nextBtn?.addEventListener("click", onNext);

        // Close dropdowns
        const closeDropdowns = (): void => {
            document.querySelectorAll(".dropdown-menu").forEach((m) => m.classList.remove("show"));
        };
        document.addEventListener("click", closeDropdowns);

        return () => {
            getDataBtn?.removeEventListener("click", getData);
            userSelect?.removeEventListener("change", handleUserChange);
            dateInput?.removeEventListener("change", handleDateChange);
            helpBtn?.removeEventListener("click", onHelpOpen);
            helpCloseBtn?.removeEventListener("click", onHelpClose);
            prevBtn?.removeEventListener("click", onPrev);
            nextBtn?.removeEventListener("click", onNext);
            document.removeEventListener("click", closeDropdowns);
        };
    }, [selectedUser, selectedDate]);

    return (
        <div id="pg-reports-pos-end-day">
            <div className="app-container">
                <div className="main-content">
                    <div className="page-card">
                        <div className="page-header">
                            <h1 className="page-title">End Day Report</h1>
                            <button className="btn-help" id="openHelpBtn">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                HELP
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Select User</label>
                                <select
                                    id="userSelect"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                >
                                    {users.map((user) => (
                                        <option key={user.user_name} value={user.user_name}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Select Date</label>
                                <input
                                    type="date"
                                    id="reportDate"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <button className="btn-get-data" id="getDataBtn">
                                GET DATA
                            </button>
                        </div>

                        {/* Result Area */}
                        <div id="result-area">
                            {renderReport()}
                        </div>
                    </div>
                    <div className="step-footer">
                        <button className="btn-prev" id="prevBtn">
                            <i className="fas fa-chevron-left"></i> PREVIOUS
                        </button>
                        <div className="step-indicator">
                            <span className="step-label">STEP</span>
                            <span className="step-value" id="stepValue">15/26</span>
                        </div>
                        <button className="btn-next" id="nextBtn">
                            NEXT <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* HELP MODAL */}
            <div className="modal-overlay" id="helpModal">
                <div className="modal-box">
                    <button className="modal-close" id="helpModalClose">✕</button>
                    <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}