// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import "./page.css";

// /**
//  * reports/customer-list.html → React.
//  *
//  * The original page rendered the customer rows from JS on load; here the default
//  * rows are rendered as static JSX (no hydration mismatch) and the data array is
//  * mirrored in the effect so the Excel export keeps working. The sidebar/dropdown/
//  * submenu scripts targeted shell-provided elements not present in this page body,
//  * so only the export + step-nav behaviour (whose targets exist here) is wired.
//  */

// /** Minimal typed surface of the parts of the xlsx (XLSX) global we use. */
// interface XlsxLike {
//   utils: {
//     book_new: () => unknown;
//     aoa_to_sheet: (data: unknown[][]) => {
//       "!cols"?: { wch: number }[];
//       "!merges"?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
//     };
//     book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
//   };
//   writeFile: (wb: unknown, filename: string) => void;
// }

// export default function CustomerListPage() {
//   useEffect(() => {
//     /* ── Table data ── */
//     const customers = [
//       { sr: 1, name: "Dhruv Raiyani", mobile: "8200043708" },
//       { sr: 2, name: "Guest", mobile: "7689546799" },
//       { sr: 3, name: "Jigar DORIWALA", mobile: "7016997342" },
//       { sr: 4, name: "Painter Alhaj", mobile: "9737215041" },
//       { sr: 5, name: "Pratik Chauhan", mobile: "9825794210" },
//       { sr: 6, name: "Sahil Pathan", mobile: "7874443558" },
//       { sr: 7, name: "User8 8", mobile: "9874563210" },
//     ];

//     /* ── Export ── */
//     const exportToExcel = (): void => {
//       const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
//       if (!XLSX) return;
//       const wsData: unknown[][] = [
//         ["Customer List Report"],
//         [],
//         ["Sr No.", "Customer Name", "Mobile No."],
//         ...customers.map((c) => [c.sr, c.name, c.mobile]),
//       ];
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       ws["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 18 }];
//       ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
//       XLSX.utils.book_append_sheet(wb, ws, "Customer List");
//       XLSX.writeFile(wb, "customer_list.xlsx");
//     };

//     /* ── Step nav ── */
//     let currentStep = 8;
//     const totalSteps = 25;
//     const stepValue = document.getElementById("stepValue");
//     const goPrev = (): void => {
//       if (currentStep > 1) {
//         currentStep--;
//         if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };
//     const goNext = (): void => {
//       if (currentStep < totalSteps) {
//         currentStep++;
//         if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
//       }
//     };

//     const exportBtn = document.getElementById("exportExcelBtn");
//     const prevBtn = document.getElementById("prevBtn");
//     const nextBtn = document.getElementById("nextBtn");
//     exportBtn?.addEventListener("click", exportToExcel);
//     prevBtn?.addEventListener("click", goPrev);
//     nextBtn?.addEventListener("click", goNext);

//     return () => {
//       exportBtn?.removeEventListener("click", exportToExcel);
//       prevBtn?.removeEventListener("click", goPrev);
//       nextBtn?.removeEventListener("click", goNext);
//     };
//   }, []);

//   return (
//     <div id="pg-reports-customer-list">
//       <link
//         rel="preconnect"
//         href="https://fonts.googleapis.com"
//       />
//       <link
//         rel="preconnect"
//         href="https://fonts.gstatic.com"
//         crossOrigin=""
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
//         rel="stylesheet"
//       />
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
//         strategy="afterInteractive"
//       />

//       <div className="layout">
//         {/* ── MAIN ── */}
//         <div className="main">
//           <div className="content-area">
//             <div className="card">
//               <div className="card-actions">
//                 <button className="btn-help">
//                   <svg viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10" />
//                     <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                     <line x1="12" y1="17" x2="12.01" y2="17" />
//                   </svg>
//                   HELP
//                 </button>
//               </div>

//               <div className="typ-page-heading card-title">CRM Report</div>

//               <div className="results-header">
//                 <div className="results-title">Detail Report</div>
//                 <button className="btn-action" id="exportExcelBtn">
//                   <svg viewBox="0 0 24 24">
//                     <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
//                     <polyline points="7 10 12 15 17 10" />
//                     <line x1="12" y1="15" x2="12" y2="3" />
//                   </svg>
//                   EXPORT TO EXCEL
//                 </button>
//               </div>

//               <div className="table-card">
//                 <div className="table-card-header">
//                   <span>All Customers</span>
//                 </div>
//                 <div className="table-wrap">
//                   <table className="data-table" id="customerTable">
//                     <thead>
//                       <tr>
//                         <th>Sr No.</th>
//                         <th>Customer Name</th>
//                         <th>Mobile No.</th>
//                       </tr>
//                     </thead>
//                     <tbody id="customerTbody">
//                       <tr>
//                         <td>1</td>
//                         <td>Dhruv Raiyani</td>
//                         <td>8200043708</td>
//                       </tr>
//                       <tr>
//                         <td>2</td>
//                         <td>Guest</td>
//                         <td>7689546799</td>
//                       </tr>
//                       <tr>
//                         <td>3</td>
//                         <td>Jigar DORIWALA</td>
//                         <td>7016997342</td>
//                       </tr>
//                       <tr>
//                         <td>4</td>
//                         <td>Painter Alhaj</td>
//                         <td>9737215041</td>
//                       </tr>
//                       <tr>
//                         <td>5</td>
//                         <td>Pratik Chauhan</td>
//                         <td>9825794210</td>
//                       </tr>
//                       <tr>
//                         <td>6</td>
//                         <td>Sahil Pathan</td>
//                         <td>7874443558</td>
//                       </tr>
//                       <tr>
//                         <td>7</td>
//                         <td>User8 8</td>
//                         <td>9874563210</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             {/* Step footer */}
//             <div className="step-footer">
//               <button className="btn-prev" id="prevBtn">
//                 <i className="fas fa-chevron-left" /> PREVIOUS
//               </button>
//               <div className="step-indicator">
//                 <span className="step-label">STEP</span>
//                 <span className="step-value" id="stepValue">
//                   8/25
//                 </span>
//               </div>
//               <button className="btn-next" id="nextBtn">
//                 NEXT <i className="fas fa-chevron-right" />
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
import Script from "next/script";
import "./page.css";
import { reportsService } from "@/api/services/report.service";
import { useShopId } from "@/utils/shop";

/** Minimal typed surface of the parts of the xlsx (XLSX) global we use. */
interface XlsxLike {
  utils: {
    book_new: () => unknown;
    aoa_to_sheet: (data: unknown[][]) => {
      "!cols"?: { wch: number }[];
      "!merges"?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
    };
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
  };
  writeFile: (wb: unknown, filename: string) => void;
}

// Define the customer type
interface Customer {
  user_name: string;
  mobile_number: string;
}

export default function CustomerListPage() {
  const shopId = useShopId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch customers on mount and page change
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!shopId) return;
      try {
        setLoading(true);

        const data = await reportsService.fetchCustomerList(
          shopId,
          pageNumber,
          pageSize
        );

        console.log("Fetched customers:", data);

        if (data) {
          setCustomers(data.records || []);
          setTotalRecords(data.totalRecords || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          setCustomers([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomers([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [shopId, pageNumber, pageSize]);

  const handlePaginationClick = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageNumber(newPage);
  };

  /* ── Export ── */
  const exportToExcel = (): void => {
    if (!customers || customers.length === 0) {
      alert("No customers to export.");
      return;
    }

    const XLSX = (window as unknown as { XLSX?: XlsxLike }).XLSX;
    if (!XLSX) {
      alert("Excel library not loaded yet.");
      return;
    }

    const wsData: unknown[][] = [
      ["Customer List Report"],
      [],
      ["Sr No.", "Customer Name", "Mobile No."],
      ...customers.map((c, index) => [index + 1, c.user_name || "N/A", c.mobile_number || "N/A"]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 18 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Customer List");
    XLSX.writeFile(wb, "customer_list.xlsx");
  };

  /* ── Step nav ── */
  useEffect(() => {
    let currentStep = 8;
    const totalSteps = 25;
    const stepValue = document.getElementById("stepValue");
    const goPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    const goNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };

    const exportBtn = document.getElementById("exportExcelBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    exportBtn?.addEventListener("click", exportToExcel);
    prevBtn?.addEventListener("click", goPrev);
    nextBtn?.addEventListener("click", goNext);

    // Help button
    const helpBtn = document.querySelector(".btn-help");
    const onHelp = (): void => {
      alert("Help & Support - Customer List");
    };
    helpBtn?.addEventListener("click", onHelp);

    return () => {
      exportBtn?.removeEventListener("click", exportToExcel);
      prevBtn?.removeEventListener("click", goPrev);
      nextBtn?.removeEventListener("click", goNext);
      helpBtn?.removeEventListener("click", onHelp);
    };
  }, [customers]);

  return (
    <div id="pg-reports-customer-list">
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Unbounded:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />

      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-actions">
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              <div className="card-title">CRM Report</div>

              <div className="results-header">
                <div className="results-title">Detail Report</div>
                <button className="btn-action" id="exportExcelBtn">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  EXPORT TO EXCEL
                </button>
              </div>

              <div className="table-card">
                <div className="table-card-header">
                  <span>All Customers</span>
                  {loading && <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}>Loading...</span>}
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sr No.</th>
                        <th>Customer Name</th>
                        <th>Mobile No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                            Loading customers...
                          </td>
                        </tr>
                      ) : customers.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                            No customers found
                          </td>
                        </tr>
                      ) : (
                        customers.map((customer, index) => (
                          <tr key={index}>
                            <td>{(pageNumber - 1) * pageSize + index + 1}</td>
                            <td>{customer.user_name || "N/A"}</td>
                            <td>{customer.mobile_number || "N/A"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-container">
                  <div>
                    Showing{" "}
                    {totalRecords === 0
                      ? 0
                      : (pageNumber - 1) * pageSize + 1}{" "}
                    to{" "}
                    {Math.min(pageNumber * pageSize, totalRecords)}{" "}
                    of {totalRecords} entries
                  </div>

                  <ul className="pagination-list">
                    <li className="pagination-item">
                      <button
                        onClick={() => handlePaginationClick(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                      >
                        &laquo; Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`pagination-item ${
                            page === pageNumber ? "active" : ""
                          }`}
                        >
                          <button onClick={() => handlePaginationClick(page)}>
                            {page}
                          </button>
                        </li>
                      )
                    )}

                    <li className="pagination-item">
                      <button
                        onClick={() => handlePaginationClick(pageNumber + 1)}
                        disabled={pageNumber >= totalPages || totalPages === 0}
                      >
                        Next &raquo;
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step footer */}
            <div className="step-footer">
              <button className="btn-prev" id="prevBtn">
                <i className="fas fa-chevron-left" /> PREVIOUS
              </button>
              <div className="step-indicator">
                <span className="step-label">STEP</span>
                <span className="step-value" id="stepValue">
                  8/25
                </span>
              </div>
              <button className="btn-next" id="nextBtn">
                NEXT <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}