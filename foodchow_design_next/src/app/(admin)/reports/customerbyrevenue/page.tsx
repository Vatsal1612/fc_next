// "use client";

// import { useEffect } from "react";
// import "./page.css";

// /**
//  * reports/customerbyrevenue.html → React.
//  *
//  * The original page rendered the table rows from JS on load (`render(data)` into
//  * an empty <tbody>). Here the default rows are rendered as static JSX so the
//  * initial markup matches what the HTML showed on load (no hydration mismatch).
//  * The data array and the render/filter/export logic are mirrored in the effect
//  * so the live search filtering, footer count and CSV export keep working.
//  *
//  * The sidebar/header/dropdown scripts in the source targeted shell-provided
//  * elements that are not part of this page body, so only the behaviour whose
//  * targets exist here (search filter, export, step-nav) is wired.
//  */

// interface RevRow {
//   sr: number;
//   name: string;
//   mobile: string;
//   revenue: number;
// }

// export default function CustomerbyrevenuePage() {
//   useEffect(() => {
//     /* ── CRM Table ── */
//     const data: RevRow[] = [
//       { sr: 1, name: "User8 8", mobile: "9874563210", revenue: 8258.15 },
//       { sr: 2, name: "Pratik Chauhan", mobile: "9825794210", revenue: 3511.48 },
//       { sr: 3, name: "Painter Alhaj", mobile: "9737215041", revenue: 2942.0 },
//       { sr: 4, name: "Guest", mobile: "—", revenue: 1025.5 },
//       { sr: 5, name: "Sahil Pathan", mobile: "7874443558", revenue: 310.0 },
//       { sr: 6, name: "Jigar Doriwala", mobile: "7016997342", revenue: 220.0 },
//     ];

//     function initials(name: string): string {
//       return name
//         .split(" ")
//         .map((w) => w[0])
//         .join("")
//         .toUpperCase()
//         .slice(0, 2);
//     }
//     function badge(r: number): string {
//       if (r >= 3000) return '<span class="badge high">High</span>';
//       if (r >= 500) return '<span class="badge mid">Mid</span>';
//       return '<span class="badge low">Low</span>';
//     }
//     function fmt(n: number): string {
//       return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
//     }

//     const tableBody = document.getElementById("tableBody");
//     const footerCount = document.getElementById("footerCount");
//     const searchInput = document.getElementById(
//       "searchInput",
//     ) as HTMLInputElement | null;

//     function render(rows: RevRow[]): void {
//       if (tableBody) {
//         tableBody.innerHTML = rows
//           .map(
//             (d) => `
//         <tr>
//           <td>${d.sr}</td>
//           <td><div class="name-cell"><span class="avatar">${initials(d.name)}</span><span class="name-text">${d.name}</span></div></td>
//           <td style="color:var(--text-secondary)">${d.mobile}</td>
//           <td><div class="rev-cell">
//             ${badge(d.revenue)} ₹${fmt(d.revenue)}
//           </div></td>
//         </tr>`,
//           )
//           .join("");
//       }
//       if (footerCount) {
//         footerCount.textContent = `Showing ${rows.length} of ${data.length} records`;
//       }
//     }

//     function filterTable(): void {
//       const q = (searchInput?.value ?? "").toLowerCase();
//       render(
//         data.filter(
//           (d) =>
//             d.name.toLowerCase().includes(q) || d.mobile.includes(q),
//         ),
//       );
//     }

//     function exportToExcel(): void {
//       const rows: (string | number)[][] = [
//         ["Sr. No.", "Customer Name", "Mobile No.", "Revenue (Rs.)"],
//         ...data.map((d) => [d.sr, d.name, d.mobile, d.revenue]),
//       ];
//       const csv = rows.map((r) => r.join(",")).join("\n");
//       const blob = new Blob([csv], { type: "text/csv" });
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(blob);
//       a.download = "crm_report_revenue.csv";
//       a.click();
//     }

//     function onPrev(): void {
//       alert("Previous step");
//     }
//     function onNext(): void {
//       alert("Next step");
//     }

//     const exportBtn = document.getElementById("exportBtn");
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");

//     searchInput?.addEventListener("input", filterTable);
//     exportBtn?.addEventListener("click", exportToExcel);
//     prevBtn?.addEventListener("click", onPrev);
//     nextBtn?.addEventListener("click", onNext);

//     return () => {
//       searchInput?.removeEventListener("input", filterTable);
//       exportBtn?.removeEventListener("click", exportToExcel);
//       prevBtn?.removeEventListener("click", onPrev);
//       nextBtn?.removeEventListener("click", onNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-customerbyrevenue">
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
//           <div className="crm-card">
//             <div className="topbar">
//               <div>
//                 <div className="typ-page-heading title">CRM report by revenue</div>
//                 <div className="subtitle">Sorted by highest revenue</div>
//               </div>
//               <div className="actions">
//                 <div className="search-bar">
//                   <i className="ti ti-search" />
//                   <input
//                     type="text"
//                     id="searchInput"
//                     placeholder="Search customers…"
//                   />
//                 </div>
//                 <button className="btn-export" id="exportBtn">
//                   <i className="ti ti-download" />
//                   Export to Excel
//                 </button>
//               </div>
//             </div>

//             <table>
//               <thead>
//                 <tr>
//                   <th>Sr. no.</th>
//                   <th>Customer name</th>
//                   <th>Mobile no.</th>
//                   <th style={{ textAlign: "right" }}>Revenue (₹)</th>
//                 </tr>
//               </thead>
//               <tbody id="tableBody">
//                 <tr>
//                   <td>1</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">U8</span>
//                       <span className="name-text">User8 8</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>9874563210</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge high">High</span> ₹8,258.15
//                     </div>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>2</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">PC</span>
//                       <span className="name-text">Pratik Chauhan</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>9825794210</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge high">High</span> ₹3,511.48
//                     </div>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>3</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">PA</span>
//                       <span className="name-text">Painter Alhaj</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>9737215041</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge mid">Mid</span> ₹2,942.00
//                     </div>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>4</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">G</span>
//                       <span className="name-text">Guest</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>—</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge mid">Mid</span> ₹1,025.50
//                     </div>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>5</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">SP</span>
//                       <span className="name-text">Sahil Pathan</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>7874443558</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge low">Low</span> ₹310.00
//                     </div>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>6</td>
//                   <td>
//                     <div className="name-cell">
//                       <span className="avatar">JD</span>
//                       <span className="name-text">Jigar Doriwala</span>
//                     </div>
//                   </td>
//                   <td style={{ color: "var(--text-secondary)" }}>7016997342</td>
//                   <td>
//                     <div className="rev-cell">
//                       <span className="badge low">Low</span> ₹220.00
//                     </div>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>

//             <div className="footer">
//               <span>
//                 <span className="footer-dot" />
//                 <span id="footerCount">Showing 6 of 6 records</span>
//               </span>
//               <span>Last updated: today</span>
//             </div>

//             <div className="step-nav">
//               <button className="btn-nav" id="prevBtn">
//                 <i className="fas fa-arrow-left" /> Previous
//               </button>
//               <span className="step-pill">
//                 Step <strong>&nbsp;6.2 / 26</strong>
//               </span>
//               <button className="btn-nav" id="nextBtn">
//                 Next <i className="fas fa-arrow-right" />
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
import { reportsService, CRMRevenueCustomer } from "@/api/services/report.service";
import ReportPagination from "@/components/shared/ReportPagination";

import { useShopId } from "@/utils/shop";

export default function CustomerbyrevenuePage() {
  const shopId = useShopId();
  const [customers, setCustomers] = useState<CRMRevenueCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CRMRevenueCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalRecords = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const displayedCustomers = filteredCustomers.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!shopId) return;
      try {
        setLoading(true);
        const res = await reportsService.fetchCRMRevenueReport(shopId, pageNumber, pageSize);
        console.log("Fetched CRM revenue data:", res);
        
        const list = res?.records || [];
        const sortedData = [...list].sort((a, b) => b.total_amount - a.total_amount);
        setCustomers(sortedData);
        setFilteredCustomers(sortedData);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomers([]);
        setFilteredCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [shopId, pageNumber, pageSize]);

  // Filter customers when search term changes
  useEffect(() => {
    setPageNumber(1);
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.mobile_no.includes(query)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Helper functions
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBadge = (revenue: number): string => {
    if (revenue >= 3000) return "high";
    if (revenue >= 500) return "mid";
    return "low";
  };

  const getBadgeLabel = (revenue: number): string => {
    if (revenue >= 3000) return "High";
    if (revenue >= 500) return "Mid";
    return "Low";
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  };

  // Export to CSV
  const exportToExcel = (): void => {
    if (!customers || customers.length === 0) {
      alert("No records to export.");
      return;
    }

    const rows: (string | number)[][] = [
      ["Sr. No.", "Order ID", "Customer Name", "Mobile No.", "Revenue (Rs.)"],
      ...customers.map((d, index) => [
        index + 1,
        d.order_id,
        d.name,
        d.mobile_no,
        d.total_amount,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crm_report_revenue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Step navigation
  useEffect(() => {
    let currentStep = 6;
    const totalSteps = 26;
    const stepPill = document.querySelector(".step-pill strong");

    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepPill) {
          stepPill.textContent = ` ${currentStep}.2 / ${totalSteps}`;
        }
      }
    };

    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepPill) {
          stepPill.textContent = ` ${currentStep}.2 / ${totalSteps}`;
        }
      }
    };

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const exportBtn = document.getElementById("exportBtn");
    const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;

    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);
    exportBtn?.addEventListener("click", exportToExcel);
    
    // Search handler
    const handleSearch = (): void => {
      if (searchInput) {
        setSearchTerm(searchInput.value);
      }
    };
    searchInput?.addEventListener("input", handleSearch);

    return () => {
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      exportBtn?.removeEventListener("click", exportToExcel);
      searchInput?.removeEventListener("input", handleSearch);
    };
  }, [customers]);

  return (
    <div id="pg-reports-customerbyrevenue">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
      />

      <div className="app-container">
        <div className="main-content">
          <div className="crm-card">
            <div className="topbar">
              <div>
                <div className="title">CRM report by revenue</div>
                <div className="subtitle">Sorted by highest revenue</div>
              </div>
              <div className="actions" style={{ gap: "12px" }}>
                <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", display: "flex", alignItems: "center", gap: "6px" }}>
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
                </div>
                <div className="search-bar">
                  <i className="ti ti-search" />
                  <input
                    type="text"
                    id="searchInput"
                    placeholder="Search customers…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-export" id="exportBtn">
                  <i className="ti ti-download" />
                  Export to Excel
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sr. no.</th>
                  <th>Customer name</th>
                  <th>Mobile no.</th>
                  <th style={{ textAlign: "right" }}>Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      Loading customers...
                    </td>
                  </tr>
                ) : displayedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      {searchTerm ? "No customers found matching your search" : "No customers found"}
                    </td>
                  </tr>
                ) : (
                  displayedCustomers.map((customer, index) => {
                    const revenue = customer.total_amount;
                    const badgeClass = getBadge(revenue);
                    const badgeLabel = getBadgeLabel(revenue);
                    const initials = getInitials(customer.name);
                    
                    return (
                      <tr key={customer.order_id}>
                        <td>{(pageNumber - 1) * pageSize + index + 1}</td>
                        <td>
                          <div className="name-cell">
                            <span className="avatar">{initials}</span>
                            <span className="name-text">{customer.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {customer.mobile_no || "—"}
                        </td>
                        <td>
                          <div className="rev-cell">
                            <span className={`badge ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                            ₹{formatCurrency(revenue)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="footer">
              <span>
                <span className="footer-dot" />
                <span id="footerCount">
                  Showing {totalRecords > 0 ? (pageNumber - 1) * pageSize + 1 : 0} - {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} records
                </span>
              </span>
              <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
            </div>

            <ReportPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(page) => setPageNumber(page)}
              disabled={loading}
            />

            <div className="step-nav">
              <button className="btn-nav" id="prevBtn">
                <i className="fas fa-arrow-left" /> Previous
              </button>
              <span className="step-pill">
                Step <strong>&nbsp;6.2 / 26</strong>
              </span>
              <button className="btn-nav" id="nextBtn">
                Next <i className="fas fa-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}