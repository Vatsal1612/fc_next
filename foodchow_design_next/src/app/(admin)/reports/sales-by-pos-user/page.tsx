// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/sales-by-pos-user.html → React.
//  * Pixel-perfect mechanical port. All inline <script> logic moved into one
//  * useEffect; dynamic markup (second-row filters / result tables) is rendered via
//  * innerHTML exactly as the original did, with the former inline onclick handlers
//  * wired through event delegation on stable parents. The shell provides
//  * header/sidebar, so only the original body content is rendered.
//  */

// type Row = {
//   date: string;
//   order_id: string;
//   customer: string;
//   mobile: string;
//   payment: string;
//   split: string;
//   type: string;
//   amount: string;
// };

// type MonthRecord = { label: string; count: string; rows: Row[] };

// type StaticData = {
//   today: never[];
//   week: { type: string }[];
//   month: Record<string, MonthRecord>;
//   year: Record<string, MonthRecord>;
//   custom: Record<string, never>;
// };

// export default function SalesByPosUserPage() {
//   useEffect(() => {
//     /* ── STATIC DATA ── */
//     const staticData: StaticData = {
//       today: [], // No record found
//       week: [
//         // Show export button + no record
//         { type: "norecord" },
//       ],
//       month: {
//         // key = "MM-YYYY"
//         "06-2026": {
//           label: "ReTotal Sales = 902.00",
//           count: "Total Orders Of This Month = 4",
//           rows: [
//             {
//               date: "4/6/2026",
//               order_id: "POS67-010",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//             {
//               date: "4/6/2026",
//               order_id: "POS67-009",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Google Pay",
//               split: "-",
//               type: "Dine In",
//               amount: "242.00",
//             },
//             {
//               date: "4/6/2026",
//               order_id: "POS67-008",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Others",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//             {
//               date: "3/6/2026",
//               order_id: "POS67-007",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//           ],
//         },
//       },
//       year: {
//         2026: {
//           label: "Total Sales = 5325.40",
//           count: "Total Order Count = 15",
//           rows: [
//             {
//               date: "28/5/2026",
//               order_id: "POS53-002",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Take Away",
//               amount: "464.50",
//             },
//             {
//               date: "28/5/2026",
//               order_id: "POS76-002",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "23.50",
//             },
//             {
//               date: "28/5/2026",
//               order_id: "POS53-001",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Dine In",
//               amount: "792.50",
//             },
//             {
//               date: "3/6/2026",
//               order_id: "POS67-007",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//             {
//               date: "28/5/2026",
//               order_id: "POS53-006",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Take Away",
//               amount: "261.50",
//             },
//             {
//               date: "4/6/2026",
//               order_id: "POS67-008",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Others",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//             {
//               date: "4/6/2026",
//               order_id: "POS67-009",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Google Pay",
//               split: "-",
//               type: "Dine In",
//               amount: "242.00",
//             },
//             {
//               date: "4/6/2026",
//               order_id: "POS67-010",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "220.00",
//             },
//             {
//               date: "22/5/2026",
//               order_id: "POS53-003",
//               customer: "Rahul",
//               mobile: "9825794210",
//               payment: "Cash",
//               split: "-",
//               type: "Dine In",
//               amount: "450.00",
//             },
//             {
//               date: "22/5/2026",
//               order_id: "POS53-004",
//               customer: "Meena",
//               mobile: "-",
//               payment: "Card",
//               split: "-",
//               type: "Take Away",
//               amount: "320.00",
//             },
//             {
//               date: "22/5/2026",
//               order_id: "POS53-005",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Delivery",
//               amount: "550.00",
//             },
//             {
//               date: "15/5/2026",
//               order_id: "POS53-007",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Take Away",
//               amount: "280.00",
//             },
//             {
//               date: "15/5/2026",
//               order_id: "POS53-008",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Dine In",
//               amount: "300.00",
//             },
//             {
//               date: "10/5/2026",
//               order_id: "POS53-009",
//               customer: "",
//               mobile: "-",
//               payment: "Online",
//               split: "-",
//               type: "Delivery",
//               amount: "210.00",
//             },
//             {
//               date: "5/5/2026",
//               order_id: "POS53-010",
//               customer: "Guest",
//               mobile: "-",
//               payment: "Cash",
//               split: "-",
//               type: "Take Away",
//               amount: "170.90",
//             },
//           ],
//         },
//       },
//       custom: {}, // No record found for any custom range
//     };

//     let activeTab = "";

//     function setTab(tab: string): void {
//       activeTab = tab;
//       // Update button styles
//       ["today", "week", "month", "year", "custom"].forEach((t) => {
//         const btn = document.getElementById("tab-" + t);
//         btn?.classList.toggle("active", t === tab);
//       });
//       renderSecondRow();
//       renderResult(null); // clear result
//     }

//     function renderSecondRow(): void {
//       const row = document.getElementById("second-row");
//       if (!row) return;

//       if (activeTab === "today") {
//         row.style.display = "none";
//         row.innerHTML = "";
//         const ra = document.getElementById("result-area");
//         if (ra) ra.innerHTML = '<p class="no-record">No Record Found</p>';
//         return;
//       }

//       if (activeTab === "week") {
//         row.style.display = "flex";
//         row.innerHTML = `
//           <button class="btn-teal" data-action="export">
//              <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#fff"
//                 stroke-width="2.5"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               >
//                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                 <polyline points="7 10 12 15 17 10" />
//                 <line x1="12" y1="15" x2="12" y2="3" />
//               </svg> EXPORT TO EXCEL
//           </button>`;
//         const ra = document.getElementById("result-area");
//         if (ra) ra.innerHTML = '<p class="no-record">No Record Found</p>';
//         return;
//       }

//       if (activeTab === "month") {
//         row.style.display = "flex";
//         row.innerHTML = `
//           <div class="filter-group">
//               <label>Select Month :</label>
//               <select id="selMonth">
//                   <option value="01">January</option><option value="02">February</option>
//                   <option value="03">March</option><option value="04">April</option>
//                   <option value="05">May</option><option value="06" selected>June</option>
//                   <option value="07">July</option><option value="08">August</option>
//                   <option value="09">September</option><option value="10">October</option>
//                   <option value="11">November</option><option value="12">December</option>
//               </select>
//           </div>
//           <div class="filter-group">
//               <label>Select Year :</label>
//               <select id="selYear">
//                   ${[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => `<option value="${y}"${y === 2026 ? " selected" : ""}>${y}</option>`).join("")}
//               </select>
//           </div>
//           <button class="btn-teal" data-action="getMonthData">GETDATA</button>
//           <button class="btn-teal" data-action="export">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#fff"
//                 stroke-width="2.5"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               >
//                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                 <polyline points="7 10 12 15 17 10" />
//                 <line x1="12" y1="15" x2="12" y2="3" />
//               </svg>EXPORT TO EXCEL
//           </button>`;
//         renderResult(null);
//         return;
//       }

//       if (activeTab === "year") {
//         row.style.display = "flex";
//         row.innerHTML = `
//           <div class="filter-group">
//               <label>Select Year :</label>
//               <select id="selYearOnly">
//                   ${[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => `<option value="${y}"${y === 2026 ? " selected" : ""}>${y}</option>`).join("")}
//               </select>
//           </div>
//           <button class="btn-teal" data-action="getYearData">GETDATA</button>
//           <button class="btn-teal" data-action="export">
//             <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#fff"
//                 stroke-width="2.5"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               >
//                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                 <polyline points="7 10 12 15 17 10" />
//                 <line x1="12" y1="15" x2="12" y2="3" />
//               </svg> EXPORT TO EXCEL
//           </button>`;
//         renderResult(null);
//         return;
//       }

//       if (activeTab === "custom") {
//         row.style.display = "flex";

//         const today = new Date().toISOString().split("T")[0];

//         row.innerHTML = `
//       <div class="filter-group">
//           <label>From</label>
//           <input type="date" id="fromDate" value="${today}">
//       </div>

//       <div class="filter-group">
//           <label>To</label>
//           <input type="date" id="toDate" value="${today}">
//       </div>

//       <button class="btn-teal" data-action="getCustomData">
//           GETDATA
//       </button>

//       <button class="btn-teal" data-action="export">
//           <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="#fff"
//               stroke-width="2.5"
//               stroke-linecap="round"
//               stroke-linejoin="round"
//           >
//               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//               <polyline points="7 10 12 15 17 10"/>
//               <line x1="12" y1="15" x2="12" y2="3"/>
//           </svg>
//           EXPORT TO EXCEL
//       </button>
//   `;
//         renderResult(null);
//         return;
//       }
//     }

//     function getMonthData(): void {
//       const m = (document.getElementById("selMonth") as HTMLSelectElement | null)
//         ?.value;
//       const y = (document.getElementById("selYear") as HTMLSelectElement | null)
//         ?.value;
//       const key = m + "-" + y;
//       const record = staticData.month[key];
//       if (record) {
//         renderTable(record.label, record.count, record.rows);
//       } else {
//         const ra = document.getElementById("result-area");
//         if (ra) ra.innerHTML = '<p class="no-record">No Record Found</p>';
//       }
//     }

//     function getYearData(): void {
//       const y = (
//         document.getElementById("selYearOnly") as HTMLSelectElement | null
//       )?.value;
//       const record = y ? staticData.year[y] : undefined;
//       if (record) {
//         renderTable(record.label, record.count, record.rows);
//       } else {
//         const ra = document.getElementById("result-area");
//         if (ra) ra.innerHTML = '<p class="no-record">No Record Found</p>';
//       }
//     }

//     function getCustomData(): void {
//       const from = (
//         document.getElementById("fromDate") as HTMLInputElement | null
//       )?.value;
//       const to = (document.getElementById("toDate") as HTMLInputElement | null)
//         ?.value;
//       if (!from || !to) {
//         alert("Please select both dates");
//         return;
//       }
//       const ra = document.getElementById("result-area");
//       if (ra) ra.innerHTML = '<p class="no-record">No Record Found</p>';
//     }

//     function renderResult(tab: string | null): void {
//       const area = document.getElementById("result-area");
//       if (!area) return;

//       if (!tab) {
//         area.innerHTML = `
//           <div class="no-record-wrap">
//               <p class="no-record">No Record Found</p>
//           </div>
//       `;
//         return;
//       }

//       if (tab === "today" || tab === "week") {
//         area.innerHTML = `
//           <div class="no-record-wrap">
//               <p class="no-record">No Record Found</p>
//           </div>
//       `;
//       }
//     }

//     function renderTable(
//       summaryLabel: string,
//       countLabel: string,
//       rows: Row[]
//     ): void {
//       const area = document.getElementById("result-area");
//       if (!area) return;
//       area.innerHTML = `
//       <div class="summary">
//           <p>${summaryLabel}</p>
//           <p>${countLabel}</p>
//       </div>
//       <p class="section-title">Description</p>
//       <div class="tbl-wrap">
//           <table>
//               <thead>
//                   <tr>
//                       <th>Date</th>
//                       <th>Order ID</th>
//                       <th>Customer Name</th>
//                       <th>Mobile No</th>
//                       <th>Payment Method</th>
//                       <th>Split Payment</th>
//                       <th>Order Type</th>
//                       <th>Total Amount (Rs.)</th>
//                   </tr>
//               </thead>
//               <tbody>
//                   ${rows
//                     .map(
//                       (r) => `
//                   <tr>
//                       <td style="color:var(--muted);font-size:12.5px;">${r.date}</td>
//                       <td><span class="order-pill">${r.order_id} <a href="#" class="pos-link">pos</a></span></td>
//                       <td style="font-weight:600;">${r.customer}</td>
//                       <td style="color:var(--muted);">${r.mobile}</td>
//                       <td><span class="${r.payment === "Cash" ? "pay-cash" : r.payment === "Card" ? "pay-card" : r.payment === "Online" ? "pay-online" : "pay-split"}">${r.payment}</span></td>
//                       <td><span class="${r.split && r.split !== "-" ? "pay-split" : ""}" style="${!r.split || r.split === "-" ? "color:var(--muted);" : ""}">${r.split || "-"}</span></td>
//                       <td><span class="type-pill">${r.type}</span></td>
//                       <td class="amount-cell">${r.amount}</td>
//                   </tr>`
//                     )
//                     .join("")}
//               </tbody>
//           </table>
//       </div>`;
//     }

//     // Event delegation for dynamically-created second-row buttons that used to
//     // carry inline onclick handlers.
//     const secondRow = document.getElementById("second-row");
//     const onSecondRowClick = (e: MouseEvent): void => {
//       const target = e.target as HTMLElement | null;
//       const btn = target?.closest<HTMLElement>("[data-action]");
//       if (!btn) return;
//       const action = btn.dataset.action;
//       if (action === "export") {
//         alert("Export feature ready for API integration");
//       } else if (action === "getMonthData") {
//         getMonthData();
//       } else if (action === "getYearData") {
//         getYearData();
//       } else if (action === "getCustomData") {
//         getCustomData();
//       }
//     };
//     secondRow?.addEventListener("click", onSecondRowClick);

//     // Tab buttons
//     const tabIds = ["today", "week", "month", "year", "custom"] as const;
//     const tabHandlers = tabIds.map((t) => {
//       const btn = document.getElementById("tab-" + t);
//       const handler = (): void => setTab(t);
//       btn?.addEventListener("click", handler);
//       return { btn, handler };
//     });

//     /* ── SIDEBAR ── */
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
//           .querySelectorAll(".sub-group")
//           .forEach((g) => g.classList.remove("active"));
//         const targetId = this.dataset.target;
//         const t = targetId ? document.getElementById(targetId) : null;
//         if (t) {
//           t.classList.add("active");
//           const first = t.querySelector(".sub-item");
//           if (first) {
//             document
//               .querySelectorAll(".sub-item")
//               .forEach((s) => s.classList.remove("active"));
//             first.classList.add("active");
//           }
//         }
//       };
//       item.addEventListener("click", handler);
//       return { item, handler };
//     });

//     const subItems = Array.from(
//       document.querySelectorAll<HTMLElement>(".sub-item")
//     );
//     const subHandlers = subItems.map((item) => {
//       const handler = function (this: HTMLElement, e: Event): void {
//         e.preventDefault();
//         document
//           .querySelectorAll(".sub-item")
//           .forEach((s) => s.classList.remove("active"));
//         this.classList.add("active");
//       };
//       item.addEventListener("click", handler);
//       return { item, handler };
//     });

//     // Init default tab LAST so DOM is fully ready
//     setTab("today");

//     // Step footer
//     let currentStep = 16;
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

//     // Close header dropdowns on document click
//     const closeDropdowns = (): void => {
//       document
//         .querySelectorAll(".dd-menu")
//         .forEach((m) => m.classList.remove("show"));
//     };
//     document.addEventListener("click", closeDropdowns);

//     // Help modal open/close
//     const helpBtn = document.getElementById("helpBtn");
//     const onHelp = (): void => {
//       document.getElementById("helpModal")?.classList.add("show");
//     };
//     helpBtn?.addEventListener("click", onHelp);

//     const modalCloseBtn = document.getElementById("helpModalClose");
//     const onModalClose = (): void => {
//       document.getElementById("helpModal")?.classList.remove("show");
//     };
//     modalCloseBtn?.addEventListener("click", onModalClose);

//     return () => {
//       secondRow?.removeEventListener("click", onSecondRowClick);
//       tabHandlers.forEach(({ btn, handler }) =>
//         btn?.removeEventListener("click", handler)
//       );
//       menuHandlers.forEach(({ item, handler }) =>
//         item.removeEventListener("click", handler)
//       );
//       subHandlers.forEach(({ item, handler }) =>
//         item.removeEventListener("click", handler)
//       );
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//       document.removeEventListener("click", closeDropdowns);
//       helpBtn?.removeEventListener("click", onHelp);
//       modalCloseBtn?.removeEventListener("click", onModalClose);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-sales-by-pos-user">
//       {/* APP */}
//       <div className="app">
//         {/* MAIN */}
//         <div className="main">
//           <div className="page-card">
//             <div className="page-header">
//               <h2 className="typ-page-heading page-title">Total Sales</h2>
//               <button className="btn-help" id="helpBtn">
//                 <svg viewBox="0 0 24 24">
//                   <circle cx="12" cy="12" r="10" />
//                   <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                   <line x1="12" y1="17" x2="12.01" y2="17" />
//                 </svg>
//                 HELP
//               </button>
//             </div>

//             {/* Top Row: user dropdown + tabs */}
//             <div className="top-row">
//               <select className="user-select" id="userSelect" defaultValue="admin_user">
//                 <option value="admin_user">admin user</option>
//                 <option value="sujal">Sujal Barvaliya</option>
//                 <option value="pratik1">pratik chauhan</option>
//                 <option value="demo_testing">Demo testing</option>
//                 <option value="pratik2">Pratik chauhan</option>
//                 <option value="tester_demo">tester demo</option>
//                 <option value="sahil">Sahil Pathan</option>
//                 <option value="xyz">xyz xyz</option>
//                 <option value="yash1">Yash Doctor</option>
//                 <option value="yash2">Yash Doctor</option>
//                 <option value="yash3">Yash Doctor</option>
//                 <option value="yash4">yash doctor</option>
//                 <option value="yash5">Yash Doctor</option>
//                 <option value="yd">y d</option>
//                 <option value="test12">test1 test2</option>
//                 <option value="kevin">kevin testing</option>
//                 <option value="yash_cashier">Yash Doctor cashier</option>
//                 <option value="yash_waiter">Yash Doctor waiter</option>
//                 <option value="hello_ptl">hello ptl</option>
//                 <option value="abc_afd">abc afd</option>
//                 <option value="abhshek">Abhshek Gamit</option>
//                 <option value="gammit">Gammit Abhi</option>
//                 <option value="akki">Akki Gamit</option>
//                 <option value="abhishek">Abhishek Gamit</option>
//                 <option value="nikunj">nikunj prajapati</option>
//                 <option value="driver12">Driver 1 Driver 2</option>
//                 <option value="gami_abi">gami abi</option>
//               </select>
//               <button className="tab-btn active" id="tab-today">
//                 Today
//               </button>
//               <button className="tab-btn" id="tab-week">
//                 This Week
//               </button>
//               <button className="tab-btn" id="tab-month">
//                 Month Wise
//               </button>
//               <button className="tab-btn" id="tab-year">
//                 Year Wise
//               </button>
//               <button className="tab-btn" id="tab-custom">
//                 Custom
//               </button>
//             </div>

//             {/* Second Row: dynamic filters */}
//             <div id="second-row" className="second-row" style={{ display: "none" }}></div>

//             {/* Result */}
//             <div className="result-area" id="result-area"></div>
//           </div>
//           <div className="step-footer">
//             <button className="btn-prev" id="prevBtn">
//               <i className="fas fa-chevron-left"></i> PREVIOUS
//             </button>
//             <div className="step-indicator">
//               <span className="step-label">STEP</span>
//               <span className="step-value" id="stepValue">
//                 16/26
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
import { reportsService, PosUser, SalesByPosUser } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";
import { useShopId } from "@/utils/shop";

interface RowData {
    date: string;
    order_id: string;
    customer: string;
    mobile: string;
    payment: string;
    split: string;
    type: string;
    amount: string;
}

export default function SalesByPosUserPage() {
    const shopId = useShopId();
    const [users, setUsers] = useState<PosUser[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [activeTab, setActiveTab] = useState("today");
    const [reportData, setReportData] = useState<RowData[]>([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<{ label: string; count: string } | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [serverTotalRecords, setServerTotalRecords] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(1);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await reportsService.fetchPosUsers(shopId);
                setUsers(data || []);
                // Select admin user by default
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

    // Fetch data automatically for tabs without secondary filters (today, week)
    // and whenever pagination changes.
    useEffect(() => {
        if (selectedUser && shopId) {
            if (activeTab === "today" || activeTab === "week") {
                fetchData(activeTab);
            }
        }
    }, [shopId, selectedUser, activeTab, pageNumber, pageSize]);



    // Transform API data to display format
    // const transformData = (data: SalesByPosUser[]): RowData[] => {
    //     return data.map((item) => ({
    //         date: item.date || formatDate(item.trans_date?.Value) || "",
    //         order_id: item.order_id || "",
    //         customer: item.customer || "",
    //         mobile: item.mobile || "-",
    //         payment: item.payment || "",
    //         split: item.split || "-",
    //         type: item.type || "",
    //         amount: typeof item.amount === 'number' ? item.amount.toFixed(2) : String(item.amount || "0.00"),
    //     }));
    // };

    // Transform API data to display format
    const transformData = (data: SalesByPosUser[]): RowData[] => {
        return data.map((item) => ({
            date: item.trans_date
                ? `${item.trans_date.Day}/${item.trans_date.Month}/${item.trans_date.Year}`
                : "-",
            order_id: item.pos_order_id || "",
            customer: item.name || "Guest",
            mobile: item.mobile_no || "-",
            payment: item.payment_method || "",
            split: item.split_payment_method || "-",
            type: item.delivery_method_name || "",
            amount: item.total_amount ? item.total_amount.toFixed(2) : "0.00",
        }));
    };
    // Calculate summary
    const calculateSummary = (data: RowData[], totalCount?: number): { label: string; count: string } => {
        const totalAmount = data.reduce((sum, row) => sum + parseFloat(row.amount || "0"), 0);
        return {
            label: `Total Sales = ${totalAmount.toFixed(2)}`,
            count: `Total Orders = ${totalCount ?? data.length}`,
        };
    };

    // Fetch data based on tab
    const fetchData = async (tab: string) => {
        if (!selectedUser || !shopId) return;

        setLoading(true);
        setReportData([]);
        setSummary(null);

        try {
            if (tab === "today") {
                const res = await reportsService.getSalesByPosUserToday(shopId, selectedUser, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setReportData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                if (transformedData.length > 0) {
                    setSummary(calculateSummary(transformedData, res.totalRecords));
                }
            } else if (tab === "week") {
                const res = await reportsService.getSalesByPosUserWeek(shopId, selectedUser, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setReportData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                if (transformedData.length > 0) {
                    setSummary(calculateSummary(transformedData, res.totalRecords));
                }
            } else if (tab === "month") {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const monthVal = (document.getElementById("selMonth") as HTMLSelectElement)?.value || String(currentMonth).padStart(2, "0");
                const yearVal = (document.getElementById("selYear") as HTMLSelectElement)?.value || String(currentYear);
                const res = await reportsService.getSalesByPosUserMonth(shopId, monthVal, yearVal, selectedUser, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setReportData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                if (transformedData.length > 0) {
                    setSummary(calculateSummary(transformedData, res.totalRecords));
                }
            } else if (tab === "year") {
                const currentYear = new Date().getFullYear();
                const yearVal = (document.getElementById("selYearOnly") as HTMLSelectElement)?.value || String(currentYear);
                const res = await reportsService.getSalesByPosUserYear(shopId, yearVal, selectedUser, pageNumber, pageSize);
                const transformedData = transformData(res.items);
                setReportData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                if (transformedData.length > 0) {
                    setSummary(calculateSummary(transformedData, res.totalRecords));
                }
            } else if (tab === "custom") {
                const today = new Date().toISOString().split("T")[0];
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const fromDate = (document.getElementById("fromDate") as HTMLInputElement)?.value || thirtyDaysAgo.toISOString().split("T")[0];
                const toDate = (document.getElementById("toDate") as HTMLInputElement)?.value || today;

                const res = await reportsService.getSalesByPosUserDateWise(
                    shopId,
                    fromDate,
                    toDate,
                    selectedUser,
                    pageNumber,
                    pageSize
                );
                const transformedData = transformData(res.items);
                setReportData(transformedData);
                setServerTotalRecords(res.totalRecords);
                setServerTotalPages(res.totalPages || 1);
                if (transformedData.length > 0) {
                    setSummary(calculateSummary(transformedData, res.totalRecords));
                }
            }
        } catch (err) {
            console.error(`Error fetching ${tab} data:`, err);
            setReportData([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle custom date range fetch
    const fetchCustomData = async () => {
        const fromDate = (document.getElementById("fromDate") as HTMLInputElement)?.value;
        const toDate = (document.getElementById("toDate") as HTMLInputElement)?.value;

        if (!fromDate || !toDate) {
            alert("Please select both dates");
            return;
        }

        if (!selectedUser) {
            alert("Please select a user");
            return;
        }

        setPageNumber(1);
        fetchData("custom");
    };

    // Switch tab
    const switchTab = (tab: string) => {
        setActiveTab(tab);
        setPageNumber(1);
        // Update button styles
        ["today", "week", "month", "year", "custom"].forEach((t) => {
            const btn = document.getElementById(`tab-${t}`);
            btn?.classList.toggle("active", t === tab);
        });
    };

    // Export to CSV
    const exportToCSV = () => {
        if (!reportData || reportData.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ["Date", "Order ID", "Customer Name", "Mobile No", "Payment Method", "Split Payment", "Order Type", "Total Amount (Rs.)"];
        const rows = reportData.map((row) => [
            row.date,
            row.order_id,
            row.customer,
            row.mobile,
            row.payment,
            row.split,
            row.type,
            row.amount,
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales_by_pos_user_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render the report table
    const renderTable = () => {
        if (loading) {
            return (
                <div className="no-record-wrap">
                    <p className="no-record">Loading data...</p>
                </div>
            );
        }

        if (!reportData || reportData.length === 0) {
            return (
                <div className="no-record-wrap">
                    <p className="no-record">No Record Found</p>
                </div>
            );
        }

        const isServerPaginated = true;
        const totalRecords = isServerPaginated ? serverTotalRecords : reportData.length;
        const totalPages = isServerPaginated ? serverTotalPages : Math.max(1, Math.ceil(totalRecords / pageSize));
        const startIndex = (pageNumber - 1) * pageSize;
        const paginatedRows = isServerPaginated ? reportData : reportData.slice(startIndex, startIndex + pageSize);
        const endIndex = isServerPaginated ? Math.min(pageNumber * pageSize, totalRecords) : Math.min(startIndex + pageSize, totalRecords);

        return (
            <>
                {summary && (
                    <div className="summary">
                        <p>{summary.label}</p>
                        <p>{summary.count}</p>
                    </div>
                )}
                <h2 className="section-title">Description</h2>
                <div className="tbl-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Mobile No</th>
                                <th>Payment Method</th>
                                <th>Split Payment</th>
                                <th>Order Type</th>
                                <th>Total Amount (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ color: "var(--muted)", fontSize: "12.5px" }}>{row.date}</td>
                                    <td>
                                        <span className="order-pill">
                                            {row.order_id} <a href="#" className="pos-link">pos</a>
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: "600" }}>{row.customer || "Guest"}</td>
                                    <td style={{ color: "var(--muted)" }}>{row.mobile}</td>
                                    <td>
                                        <span className={
                                            row.payment === "Cash" ? "pay-cash" :
                                                row.payment === "Card" ? "pay-card" :
                                                    row.payment === "Online" ? "pay-online" :
                                                        "pay-split"
                                        }>
                                            {row.payment || "-"}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--muted)" }}>{row.split}</td>
                                    <td><span className="type-pill">{row.type || "-"}</span></td>
                                    <td className="amount-cell">₹{row.amount}</td>
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
                </div>
            </>
        );
    };

    // Render second row (filters) based on active tab
    const renderSecondRow = () => {
        if (activeTab === "today") {
            return null;
        }

        if (activeTab === "week") {
            return (
                <div className="second-row" style={{ display: "flex" }}>
                    <button className="btn-teal" onClick={exportToCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        EXPORT TO EXCEL
                    </button>
                </div>
            );
        }

        if (activeTab === "month") {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const months = [
                { value: "01", label: "January" },
                { value: "02", label: "February" },
                { value: "03", label: "March" },
                { value: "04", label: "April" },
                { value: "05", label: "May" },
                { value: "06", label: "June" },
                { value: "07", label: "July" },
                { value: "08", label: "August" },
                { value: "09", label: "September" },
                { value: "10", label: "October" },
                { value: "11", label: "November" },
                { value: "12", label: "December" },
            ];
            const years = [];
            for (let y = currentYear; y >= currentYear - 9; y--) {
                years.push(y);
            }

            return (
                <div className="second-row" style={{ display: "flex" }}>
                    <div className="filter-group">
                        <label>Select Month :</label>
                        <select id="selMonth" defaultValue={String(currentMonth).padStart(2, "0")}>
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Select Year :</label>
                        <select id="selYear" defaultValue={currentYear}>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn-teal" onClick={() => {
                        setPageNumber(1);
                        fetchData("month");
                    }}>GETDATA</button>
                    <button className="btn-teal" onClick={exportToCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        EXPORT TO EXCEL
                    </button>
                </div>
            );
        }

        if (activeTab === "year") {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let y = currentYear; y >= currentYear - 9; y--) {
                years.push(y);
            }

            return (
                <div className="second-row" style={{ display: "flex" }}>
                    <div className="filter-group">
                        <label>Select Year :</label>
                        <select id="selYearOnly" defaultValue={currentYear}>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn-teal" onClick={() => {
                        setPageNumber(1);
                        fetchData("year");
                    }}>GETDATA</button>
                    <button className="btn-teal" onClick={exportToCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        EXPORT TO EXCEL
                    </button>
                </div>
            );
        }

        if (activeTab === "custom") {
            const today = new Date().toISOString().split("T")[0];
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return (
                <div className="second-row" style={{ display: "flex" }}>
                    <div className="filter-group">
                        <label>From</label>
                        <input type="date" id="fromDate" defaultValue={thirtyDaysAgo.toISOString().split("T")[0]} />
                    </div>
                    <div className="filter-group">
                        <label>To</label>
                        <input type="date" id="toDate" defaultValue={today} />
                    </div>
                    <button className="btn-teal" onClick={fetchCustomData}>GETDATA</button>
                    <button className="btn-teal" onClick={exportToCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        EXPORT TO EXCEL
                    </button>
                </div>
            );
        }

        return null;
    };

    // Wire up event listeners
    useEffect(() => {
        // Tab buttons
        const tabIds = ["today", "week", "month", "year", "custom"];
        const tabHandlers = tabIds.map((t) => {
            const btn = document.getElementById(`tab-${t}`);
            const handler = () => switchTab(t);
            btn?.addEventListener("click", handler);
            return { btn, handler };
        });

        // Help button
        const helpBtn = document.getElementById("helpBtn");
        const onHelp = () => {
            document.getElementById("helpModal")?.classList.add("show");
        };
        helpBtn?.addEventListener("click", onHelp);

        const modalCloseBtn = document.getElementById("helpModalClose");
        const onModalClose = () => {
            document.getElementById("helpModal")?.classList.remove("show");
        };
        modalCloseBtn?.addEventListener("click", onModalClose);

        // Step footer
        let currentStep = 16;
        const totalSteps = 26;
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const stepValue = document.getElementById("stepValue");

        const onPrev = () => {
            if (currentStep > 1) {
                currentStep--;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        const onNext = () => {
            if (currentStep < totalSteps) {
                currentStep++;
                if (stepValue) stepValue.textContent = `${currentStep}/${totalSteps}`;
            }
        };

        prevBtn?.addEventListener("click", onPrev);
        nextBtn?.addEventListener("click", onNext);

        return () => {
            tabHandlers.forEach(({ btn, handler }) => btn?.removeEventListener("click", handler));
            helpBtn?.removeEventListener("click", onHelp);
            modalCloseBtn?.removeEventListener("click", onModalClose);
            prevBtn?.removeEventListener("click", onPrev);
            nextBtn?.removeEventListener("click", onNext);
        };
    }, []);

    return (
        <div id="pg-reports-sales-by-pos-user">
            <div className="app">
                <div className="main">
                    <div className="page-card">
                        <div className="page-header">
                            <h1 className="page-title typ-page-heading" style={{ margin: 0, marginBottom: "15px" }}>Total Sales</h1>
                            <button className="btn-help" id="helpBtn">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                HELP
                            </button>
                        </div>

                        {/* Top Row: user dropdown + tabs */}
                        <div className="top-row">
                            <select
                                className="user-select"
                                id="userSelect"
                                value={selectedUser}
                                onChange={(e) => {
                                    setSelectedUser(e.target.value);
                                    setPageNumber(1);
                                }}
                            >
                                {users.map((user) => (
                                    <option key={user.user_name} value={user.user_name}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <button className="tab-btn active" id="tab-today">Today</button>
                            <button className="tab-btn" id="tab-week">This Week</button>
                            <button className="tab-btn" id="tab-month">Month Wise</button>
                            <button className="tab-btn" id="tab-year">Year Wise</button>
                            <button className="tab-btn" id="tab-custom">Custom</button>
                        </div>

                        {/* Second Row: dynamic filters */}
                        {renderSecondRow()}

                        {/* Result */}
                        <div className="result-area" id="result-area">
                            {renderTable()}
                        </div>
                    </div>
                    <div className="step-footer">
                        <button className="btn-prev" id="prevBtn">
                            <i className="fas fa-chevron-left"></i> PREVIOUS
                        </button>
                        <div className="step-indicator">
                            <span className="step-label">STEP</span>
                            <span className="step-value" id="stepValue">16/26</span>
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