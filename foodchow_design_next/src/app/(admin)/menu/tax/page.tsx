// "use client";

// import { useEffect } from "react";
// import "./page.css";

// interface Tax {
//   id: number;
//   name: string;
//   rate: number;
//   type: string;
//   applied: boolean;
//   appliedProducts?: number[];
// }

// export default function TaxPage() {
//   useEffect(() => {
//     // --- State Management ---
//     let taxes: Tax[] = [
//       { id: 1, name: "gst", rate: 10, type: "Inclusive", applied: true },
//       { id: 2, name: "CGST", rate: 10, type: "Exclusive", applied: false },
//     ];

//     let currentFilterType = "All";
//     let currentSearchQuery = "";
//     let currentViewMode = "table"; // 'table' or 'grid'

//     let toastTimeout: ReturnType<typeof setTimeout>;

//     function escapeHtml(str: string): string {
//       return str
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");
//     }

//     // --- Toast Controller ---
//     function showToast(message: string) {
//       const toast = document.getElementById("toast");
//       const toastText = document.getElementById("toastText");
//       if (!toast || !toastText) return;
//       toastText.textContent = message;
//       toast.classList.add("show");
//       clearTimeout(toastTimeout);
//       toastTimeout = setTimeout(() => {
//         toast.classList.remove("show");
//       }, 2800);
//     }

//     // --- Modal Helper Functions ---
//     function openTaxModal() {
//       const modalTitle = document.getElementById("modalTitle");
//       const taxRowId = document.getElementById("taxRowId") as HTMLInputElement | null;
//       const taxForm = document.getElementById("taxForm") as HTMLFormElement | null;
//       const taxRateSlider = document.getElementById("taxRateSlider") as HTMLInputElement | null;
//       const taxRate = document.getElementById("taxRate") as HTMLInputElement | null;
//       const taxApplied = document.getElementById("taxApplied") as HTMLInputElement | null;
//       const btnSubmit = document.getElementById("btnSubmit");

//       if (modalTitle) modalTitle.textContent = "Add New Tax";
//       if (taxRowId) taxRowId.value = "";
//       taxForm?.reset();
//       if (taxRateSlider) taxRateSlider.value = "10";
//       if (taxRate) taxRate.value = "10";
//       if (taxApplied) taxApplied.checked = true;
//       if (btnSubmit) btnSubmit.textContent = "Save Tax";

//       updateLivePreview();

//       const modal = document.getElementById("taxModal");
//       if (!modal) return;
//       modal.style.display = "flex";
//       setTimeout(() => modal.classList.add("show"), 10);
//     }

//     function closeTaxModal() {
//       const modal = document.getElementById("taxModal");
//       if (!modal) return;
//       modal.classList.remove("show");
//       setTimeout(() => (modal.style.display = "none"), 200);
//     }

//     // --- Help Modal Helpers ---
//     function openHelpModal() {
//       const modal = document.getElementById("helpModal");
//       if (!modal) return;
//       modal.style.display = "flex";
//       setTimeout(() => modal.classList.add("show"), 10);
//     }

//     function closeHelpModal() {
//       const modal = document.getElementById("helpModal");
//       if (!modal) return;
//       modal.classList.remove("show");
//       setTimeout(() => (modal.style.display = "none"), 200);
//     }

//     function setViewMode(mode: string) {
//       currentViewMode = mode;
//       document
//         .getElementById("viewBtnTable")
//         ?.classList.toggle("active", mode === "table");
//       document
//         .getElementById("viewBtnGrid")
//         ?.classList.toggle("active", mode === "grid");
//       renderTaxes();
//     }

//     // --- Render Table & Card Layout ---
//     function renderTaxes() {
//       const tbody = document.getElementById("taxesTableBody");
//       const gridContainer = document.getElementById("taxGridContainer");
//       if (!tbody || !gridContainer) return;
//       tbody.innerHTML = "";
//       gridContainer.innerHTML = "";

//       // Filter taxes based on state
//       const filtered = taxes.filter((tax) => {
//         const matchesType =
//           currentFilterType === "All" || tax.type === currentFilterType;
//         const matchesSearch =
//           tax.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
//           tax.rate.toString().includes(currentSearchQuery);
//         return matchesType && matchesSearch;
//       });

//       // Update showing counter
//       const resultsCount = document.getElementById("resultsCount");
//       if (resultsCount) {
//         resultsCount.textContent = `Showing ${filtered.length} of ${taxes.length} taxes`;
//       }

//       // Toggle empty state
//       const emptyState = document.getElementById("emptyState");
//       const tableWrap = document.querySelector<HTMLElement>(".table-wrap");

//       if (filtered.length === 0) {
//         if (emptyState) emptyState.style.display = "flex";
//         if (tableWrap) tableWrap.style.display = "none";
//         gridContainer.style.display = "none";
//       } else {
//         if (emptyState) emptyState.style.display = "none";

//         if (currentViewMode === "table") {
//           if (tableWrap) tableWrap.style.display = "block";
//           gridContainer.style.display = "none";

//           filtered.forEach((tax, idx) => {
//             const badgeClass =
//               tax.type === "Inclusive" ? "badge-inclusive" : "badge-exclusive";
//             const typeText =
//               tax.type === "Inclusive" ? "Inclusive" : "Exclusive";
//             const appliedCount = tax.appliedProducts
//               ? tax.appliedProducts.length
//               : 0;
//             const isApplied = appliedCount > 0;

//             const tr = document.createElement("tr");
//             tr.setAttribute("data-id", String(tax.id));
//             tr.innerHTML = `
//           <td>${idx + 1}</td>
//           <td class="tax-name-cell">${escapeHtml(tax.name)}</td>
//           <td>
//             <span class="rate-text-val">${tax.rate}%</span>
//           </td>
//           <td><span class="tax-badge ${badgeClass}"><span class="pulse-dot"></span>${typeText}</span></td>
//           <td style="text-align: center;">
//             ${
//               isApplied
//                 ? `<span class="tax-status-badge tax-status-applied">
//                   <svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><polyline points="20 6 9 17 4 12"/></svg>
//                   Applied (${appliedCount})
//                 </span>`
//                 : `<span class="tax-status-badge tax-status-not-applied">
//                   <svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//                   Not Applied
//                 </span>`
//             }
//           </td>
//           <td style="text-align: center;">
//             <button class="btn-apply-tax" data-action="apply-tax">
//               <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
//               Apply Tax
//             </button>
//           </td>
//           <td>
//             <div class="action-wrap" style="justify-content: center;">
//               <button class="btn-action-sq btn-sq-edit" data-action="edit" data-tax-id="${tax.id}" title="Edit Tax">
//                 <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
//               </button>
//               <button class="btn-action-sq btn-sq-delete" data-action="delete" data-tax-id="${tax.id}" title="Delete Tax">
//                 <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
//               </button>
//             </div>
//           </td>
//         `;
//             tbody.appendChild(tr);
//           });
//         } else {
//           if (tableWrap) tableWrap.style.display = "none";
//           gridContainer.style.display = "grid";

//           filtered.forEach((tax, idx) => {
//             const badgeClass =
//               tax.type === "Inclusive" ? "badge-inclusive" : "badge-exclusive";
//             const typeText =
//               tax.type === "Inclusive" ? "Inclusive" : "Exclusive";
//             const appliedCount = tax.appliedProducts
//               ? tax.appliedProducts.length
//               : 0;
//             const isApplied = appliedCount > 0;

//             const card = document.createElement("div");
//             card.className = "tax-grid-card";
//             card.setAttribute("data-id", String(tax.id));
//             card.innerHTML = `
//           <div class="grid-card-header">
//             <span class="grid-card-title">${escapeHtml(tax.name)}</span>
//             <span class="tax-badge ${badgeClass}"><span class="pulse-dot"></span>${typeText}</span>
//           </div>
//           <span class="grid-card-rate-label">Tax Rate</span>
//           <span class="grid-card-rate-value">${tax.rate}%</span>

//           <div style="margin-bottom: 1rem;">
//             ${
//               isApplied
//                 ? `<span class="tax-status-badge tax-status-applied" style="font-size:12.5px; padding: 6px 12px;">
//                   <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><polyline points="20 6 9 17 4 12"/></svg>
//                   Applied to ${appliedCount} product(s)
//                 </span>`
//                 : `<span class="tax-status-badge tax-status-not-applied" style="font-size:12.5px; padding: 6px 12px;">
//                   <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//                   Not Applied
//                 </span>`
//             }
//           </div>

//           <button class="btn-apply-tax" style="width:100%; margin-bottom: 1.25rem;" data-action="apply-tax">
//             <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
//             Apply Tax to Products
//           </button>

//           <div class="grid-card-footer">
//             <span class="results-badge"># ${idx + 1}</span>
//             <div class="grid-card-actions">
//               <button class="btn-action-sq btn-sq-edit" data-action="edit" data-tax-id="${tax.id}" title="Edit Tax">
//                 <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
//               </button>
//               <button class="btn-action-sq btn-sq-delete" data-action="delete" data-tax-id="${tax.id}" title="Delete Tax">
//                 <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
//               </button>
//             </div>
//           </div>
//         `;
//             gridContainer.appendChild(card);
//           });
//         }
//       }

//       updateMetrics();
//     }

//     function updateMetrics() {
//       // Update total count
//       const totalTaxesEl = document.getElementById("statTotalTaxes");
//       if (totalTaxesEl) totalTaxesEl.textContent = String(taxes.length);

//       // Update average rate
//       const avgRateEl = document.getElementById("statAvgRate");
//       if (avgRateEl) {
//         if (taxes.length === 0) {
//           avgRateEl.textContent = "0.00%";
//         } else {
//           const totalRate = taxes.reduce((sum, tax) => sum + tax.rate, 0);
//           const avg = totalRate / taxes.length;
//           avgRateEl.textContent = `${avg.toFixed(2)}%`;
//         }
//       }

//       // Update type distribution
//       const typeDistEl = document.getElementById("statTypeDistribution");
//       if (typeDistEl) {
//         const inclusiveCount = taxes.filter((t) => t.type === "Inclusive").length;
//         const exclusiveCount = taxes.filter((t) => t.type === "Exclusive").length;
//         typeDistEl.textContent = `${inclusiveCount} Inc / ${exclusiveCount} Exc`;
//       }

//       // Update applied count metrics
//       const appliedCountEl = document.getElementById("statAppliedCount");
//       const appliedDistEl = document.getElementById("statAppliedDistribution");
//       const totalAppliedRateEl = document.getElementById("statTotalAppliedRate");

//       const appliedTaxes = taxes.filter((t) => t.applied);
//       const activeCount = appliedTaxes.length;
//       const inactiveCount = taxes.length - activeCount;
//       const totalAppliedRate = appliedTaxes.reduce(
//         (sum, tax) => sum + tax.rate,
//         0
//       );

//       if (appliedCountEl) {
//         appliedCountEl.textContent = `${activeCount} Active`;
//       }
//       if (appliedDistEl) {
//         appliedDistEl.textContent = `${inactiveCount} Suspended`;
//       }
//       if (totalAppliedRateEl) {
//         totalAppliedRateEl.textContent = `${totalAppliedRate.toFixed(2)}%`;
//       }
//     }

//     // --- Search and Filter handlers ---
//     function handleSearchFilter() {
//       const input = document.getElementById(
//         "taxSearchInput"
//       ) as HTMLInputElement | null;
//       currentSearchQuery = input ? input.value.trim() : "";
//       renderTaxes();
//     }

//     function setTaxTypeFilter(type: string) {
//       currentFilterType = type;

//       // Update active pill button state
//       document.querySelectorAll<HTMLElement>(".filter-pill").forEach((btn) => {
//         if (btn.getAttribute("data-type") === type) {
//           btn.classList.add("active");
//         } else {
//           btn.classList.remove("active");
//         }
//       });

//       renderTaxes();
//     }

//     // --- Save Tax operation ---
//     function saveTax(e: Event) {
//       e.preventDefault();

//       const idVal = (document.getElementById("taxRowId") as HTMLInputElement).value;
//       const name = (document.getElementById("taxName") as HTMLInputElement).value.trim();
//       const rate =
//         parseFloat((document.getElementById("taxRate") as HTMLInputElement).value) || 0;
//       const type = (document.getElementById("taxType") as HTMLSelectElement).value;
//       const applied = (document.getElementById("taxApplied") as HTMLInputElement).checked;

//       if (idVal) {
//         // Edit existing tax
//         const id = parseInt(idVal);
//         const taxIndex = taxes.findIndex((t) => t.id === id);
//         if (taxIndex > -1) {
//           taxes[taxIndex] = { id, name, rate, type, applied };
//           showToast(`Tax "${name}" updated successfully`);
//         }
//       } else {
//         // Add new tax
//         const newId =
//           taxes.length > 0 ? Math.max(...taxes.map((t) => t.id)) + 1 : 1;
//         taxes.push({ id: newId, name, rate, type, applied });
//         showToast(`Tax "${name}" created successfully`);
//       }

//       closeTaxModal();
//       renderTaxes();
//     }

//     // --- Edit Tax trigger ---
//     function editTax(id: number) {
//       const tax = taxes.find((t) => t.id === id);
//       if (!tax) return;

//       (document.getElementById("taxRowId") as HTMLInputElement).value = String(tax.id);
//       (document.getElementById("taxName") as HTMLInputElement).value = tax.name;
//       (document.getElementById("taxRate") as HTMLInputElement).value = String(tax.rate);
//       (document.getElementById("taxRateSlider") as HTMLInputElement).value = String(
//         Math.min(Math.max(tax.rate, 0), 50)
//       );
//       (document.getElementById("taxType") as HTMLSelectElement).value = tax.type;
//       (document.getElementById("taxApplied") as HTMLInputElement).checked =
//         tax.applied || false;

//       const modalTitle = document.getElementById("modalTitle");
//       const btnSubmit = document.getElementById("btnSubmit");
//       if (modalTitle) modalTitle.textContent = "Edit Tax Detail";
//       if (btnSubmit) btnSubmit.textContent = "Update Tax";

//       updateLivePreview();

//       const modal = document.getElementById("taxModal");
//       if (!modal) return;
//       modal.style.display = "flex";
//       setTimeout(() => modal.classList.add("show"), 10);
//     }

//     // --- Delete Tax trigger ---
//     function deleteTax(id: number) {
//       const tax = taxes.find((t) => t.id === id);
//       if (!tax) return;

//       if (confirm(`Are you sure you want to delete the tax "${tax.name}"?`)) {
//         // Find row in table or grid to animate its removal
//         const row = document.querySelector<HTMLElement>(`tr[data-id="${id}"]`);
//         const card = document.querySelector<HTMLElement>(
//           `.tax-grid-card[data-id="${id}"]`
//         );
//         if (row) {
//           row.style.opacity = "0";
//           row.style.transform = "scale(0.95)";
//         }
//         if (card) {
//           card.style.opacity = "0";
//           card.style.transform = "scale(0.95)";
//         }

//         setTimeout(() => {
//           taxes = taxes.filter((t) => t.id !== id);
//           renderTaxes();
//           showToast(`Tax "${tax.name}" deleted successfully`);
//         }, 200);
//       }
//     }

//     // --- Modal Rate Slider and Calculator sync ---
//     function syncRateInput(val: string, target: string) {
//       const numInput = document.getElementById("taxRate") as HTMLInputElement;
//       const slider = document.getElementById("taxRateSlider") as HTMLInputElement;
//       const numericVal = parseFloat(val) || 0;

//       if (target === "slider") {
//         slider.value = String(Math.min(Math.max(numericVal, 0), 50));
//       } else {
//         numInput.value = String(numericVal);
//       }

//       updateLivePreview();
//     }

//     function updateLivePreview() {
//       const rate =
//         parseFloat((document.getElementById("taxRate") as HTMLInputElement).value) || 0;
//       const type = (document.getElementById("taxType") as HTMLSelectElement).value;

//       const previewTaxNameLabel = document.getElementById("previewTaxNameLabel");
//       const previewBaseVal = document.getElementById("previewBaseVal");
//       const previewTaxAmtVal = document.getElementById("previewTaxAmtVal");
//       const previewTotalVal = document.getElementById("previewTotalVal");
//       if (
//         !previewTaxNameLabel ||
//         !previewBaseVal ||
//         !previewTaxAmtVal ||
//         !previewTotalVal
//       )
//         return;

//       previewTaxNameLabel.textContent = `Tax amount (${rate.toFixed(2)}% ${type}):`;

//       if (type === "Inclusive") {
//         const total = 100;
//         const base = total / (1 + rate / 100);
//         const taxAmt = total - base;

//         previewBaseVal.textContent = `$${base.toFixed(2)}`;
//         previewTaxAmtVal.textContent = `$${taxAmt.toFixed(2)}`;
//         previewTotalVal.textContent = `$${total.toFixed(2)}`;
//       } else {
//         const base = 100;
//         const taxAmt = base * (rate / 100);
//         const total = base + taxAmt;

//         previewBaseVal.textContent = `$${base.toFixed(2)}`;
//         previewTaxAmtVal.textContent = `$${taxAmt.toFixed(2)}`;
//         previewTotalVal.textContent = `$${total.toFixed(2)}`;
//       }
//     }

//     // ── Wire static element listeners ──
//     const addTaxBtn = document.getElementById("addTaxBtn");
//     const helpBtn = document.getElementById("helpBtn");
//     const taxSearchInput = document.getElementById(
//       "taxSearchInput"
//     ) as HTMLInputElement | null;
//     const viewBtnTable = document.getElementById("viewBtnTable");
//     const viewBtnGrid = document.getElementById("viewBtnGrid");
//     const taxForm = document.getElementById("taxForm") as HTMLFormElement | null;
//     const taxRateSlider = document.getElementById(
//       "taxRateSlider"
//     ) as HTMLInputElement | null;
//     const taxRateInput = document.getElementById(
//       "taxRate"
//     ) as HTMLInputElement | null;
//     const taxNameInput = document.getElementById(
//       "taxName"
//     ) as HTMLInputElement | null;
//     const taxTypeSelect = document.getElementById(
//       "taxType"
//     ) as HTMLSelectElement | null;
//     const filterPills = document.querySelectorAll<HTMLButtonElement>(".filter-pill");
//     const closeTaxBtns = document.querySelectorAll<HTMLButtonElement>(
//       "[data-close-tax]"
//     );
//     const closeHelpBtns = document.querySelectorAll<HTMLButtonElement>(
//       "[data-close-help]"
//     );
//     const emptyAddBtn = document.getElementById("emptyAddBtn");

//     const onSliderInput = (e: Event) =>
//       syncRateInput((e.target as HTMLInputElement).value, "number");
//     const onRateInput = (e: Event) =>
//       syncRateInput((e.target as HTMLInputElement).value, "slider");
//     const onPillClick = (e: Event) => {
//       const pill = e.currentTarget as HTMLElement;
//       setTaxTypeFilter(pill.getAttribute("data-type") || "All");
//     };

//     addTaxBtn?.addEventListener("click", openTaxModal);
//     emptyAddBtn?.addEventListener("click", openTaxModal);
//     helpBtn?.addEventListener("click", openHelpModal);
//     taxSearchInput?.addEventListener("input", handleSearchFilter);
//     viewBtnTable?.addEventListener("click", () => setViewMode("table"));
//     viewBtnGrid?.addEventListener("click", () => setViewMode("grid"));
//     taxForm?.addEventListener("submit", saveTax);
//     taxRateSlider?.addEventListener("input", onSliderInput);
//     taxRateInput?.addEventListener("input", onRateInput);
//     taxNameInput?.addEventListener("input", updateLivePreview);
//     taxTypeSelect?.addEventListener("change", updateLivePreview);
//     filterPills.forEach((p) => p.addEventListener("click", onPillClick));
//     closeTaxBtns.forEach((b) => b.addEventListener("click", closeTaxModal));
//     closeHelpBtns.forEach((b) => b.addEventListener("click", closeHelpModal));

//     // Delegated handler for dynamically-created table/grid action buttons
//     const onTableClick = (e: Event) => {
//       const target = (e.target as HTMLElement).closest<HTMLElement>(
//         "[data-action]"
//       );
//       if (!target) return;
//       const action = target.getAttribute("data-action");
//       if (action === "apply-tax") {
//         window.location.href = "/menu/apply-tax";
//       } else if (action === "edit") {
//         editTax(parseInt(target.getAttribute("data-tax-id") || "0"));
//       } else if (action === "delete") {
//         deleteTax(parseInt(target.getAttribute("data-tax-id") || "0"));
//       }
//     };
//     const tbodyEl = document.getElementById("taxesTableBody");
//     const gridEl = document.getElementById("taxGridContainer");
//     tbodyEl?.addEventListener("click", onTableClick);
//     gridEl?.addEventListener("click", onTableClick);

//     // Initial render
//     renderTaxes();

//     return () => {
//       clearTimeout(toastTimeout);
//       addTaxBtn?.removeEventListener("click", openTaxModal);
//       emptyAddBtn?.removeEventListener("click", openTaxModal);
//       helpBtn?.removeEventListener("click", openHelpModal);
//       taxSearchInput?.removeEventListener("input", handleSearchFilter);
//       taxForm?.removeEventListener("submit", saveTax);
//       taxRateSlider?.removeEventListener("input", onSliderInput);
//       taxRateInput?.removeEventListener("input", onRateInput);
//       taxNameInput?.removeEventListener("input", updateLivePreview);
//       taxTypeSelect?.removeEventListener("change", updateLivePreview);
//       filterPills.forEach((p) => p.removeEventListener("click", onPillClick));
//       closeTaxBtns.forEach((b) => b.removeEventListener("click", closeTaxModal));
//       closeHelpBtns.forEach((b) =>
//         b.removeEventListener("click", closeHelpModal)
//       );
//       tbodyEl?.removeEventListener("click", onTableClick);
//       gridEl?.removeEventListener("click", onTableClick);
//     };
//   }, []);

//   return (
//     <div id="pg-menu-tax">
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />

//       {/* App Container */}
//       <div className="app-container">
//         {/* Content Area */}
//         <div className="content-area">
//           {/* Taxes Table Card */}
//           <div className="taxes-card">
//             <div className="taxes-header">
//               <h2 className="typ-page-heading taxes-title">Taxes</h2>
//               <div
//                 className="taxes-actions"
//                 style={{ display: "flex", gap: "12px", alignItems: "center" }}
//               >
//                 <button className="btn-action btn-brand btn-add-tax" id="addTaxBtn">
//                   <svg viewBox="0 0 24 24">
//                     <line x1="12" y1="5" x2="12" y2="19" />
//                     <line x1="5" y1="12" x2="19" y2="12" />
//                   </svg>
//                   ADD NEW TAX
//                 </button>
//                 <button className="btn-help" id="helpBtn">
//                   <svg viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10" />
//                     <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                     <line x1="12" y1="17" x2="12.01" y2="17" />
//                   </svg>
//                   HELP
//                 </button>
//               </div>
//             </div>

//             {/* Interactive Toolbar */}
//             <div className="taxes-toolbar">
//               <div className="toolbar-left">
//                 <div className="search-filter-bar">
//                   <div className="search-icon-wrap">
//                     <svg viewBox="0 0 24 24">
//                       <circle cx="11" cy="11" r="8" />
//                       <line x1="21" y1="21" x2="16.65" y2="16.65" />
//                     </svg>
//                   </div>
//                   <input
//                     type="text"
//                     id="taxSearchInput"
//                     className="search-input"
//                     placeholder="Search taxes by name or rate..."
//                   />
//                   <div className="bar-divider"></div>
//                   <div className="filter-pills">
//                     <button className="filter-pill active" data-type="All">
//                       All
//                     </button>
//                     <button className="filter-pill" data-type="Inclusive">
//                       Inclusive
//                     </button>
//                     <button className="filter-pill" data-type="Exclusive">
//                       Exclusive
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               <div className="toolbar-right">
//                 <span className="results-badge" id="resultsCount">
//                   Showing 2 of 2 taxes
//                 </span>
//                 <div className="view-switcher">
//                   <button
//                     className="view-btn active"
//                     id="viewBtnTable"
//                     title="Table View"
//                   >
//                     <svg viewBox="0 0 24 24">
//                       <path d="M3 9h18M3 15h18M3 21h18M3 3h18" />
//                     </svg>
//                   </button>
//                   <button
//                     className="view-btn"
//                     id="viewBtnGrid"
//                     title="Card Grid View"
//                   >
//                     <svg viewBox="0 0 24 24">
//                       <rect x="3" y="3" width="7" height="7" />
//                       <rect x="14" y="3" width="7" height="7" />
//                       <rect x="14" y="14" width="7" height="7" />
//                       <rect x="3" y="14" width="7" height="7" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="table-wrap">
//               <table className="taxes-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: "100px" }}>Sr. No.</th>
//                     <th>Name Of The Tax</th>
//                     <th>Tax (%)</th>
//                     <th>Tax Type</th>
//                     <th style={{ width: "130px", textAlign: "center" }}>
//                       Status
//                     </th>
//                     <th style={{ width: "160px", textAlign: "center" }}>
//                       Apply Tax
//                     </th>
//                     <th style={{ width: "140px", textAlign: "center" }}>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody id="taxesTableBody"></tbody>
//               </table>
//             </div>

//             {/* Card Grid View Container */}
//             <div
//               id="taxGridContainer"
//               className="tax-grid-layout"
//               style={{ display: "none" }}
//             ></div>

//             {/* Empty State Container */}
//             <div className="empty-state-card" id="emptyState">
//               <svg
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <circle cx="12" cy="12" r="10" />
//                 <path d="M8 12h8" />
//                 <path d="M12 8v8" />
//               </svg>
//               <h3 className="empty-state-title">No taxes found</h3>
//               <p className="empty-state-desc">
//                 Get started by creating a new tax or adjusting your search
//                 filters.
//               </p>
//               <button className="btn-empty-action" id="emptyAddBtn">
//                 <svg
//                   viewBox="0 0 24 24"
//                   style={{
//                     width: "14px",
//                     height: "14px",
//                     fill: "none",
//                     stroke: "#fff",
//                     strokeWidth: 2.5,
//                     display: "inline",
//                   }}
//                 >
//                   <line x1="12" y1="5" x2="12" y2="19" />
//                   <line x1="5" y1="12" x2="19" y2="12" />
//                 </svg>
//                 ADD NEW TAX
//               </button>
//             </div>
//           </div>

//           {/* Navigation Row */}
//           <div className="nav-row">
//             <a className="btn-navigation btn-navigation-prev" href="item-code.html">
//               <svg viewBox="0 0 24 24">
//                 <polyline points="15 18 9 12 15 6" />
//               </svg>
//               PREVIOUS
//             </a>

//             <div className="step-badge">
//               <span
//                 style={{
//                   fontSize: "11px",
//                   textTransform: "uppercase",
//                   color: "var(--text-muted)",
//                   fontWeight: 700,
//                   marginBottom: "2px",
//                 }}
//               >
//                 Step
//               </span>
//               <span
//                 style={{
//                   fontSize: "16px",
//                   fontWeight: 800,
//                   color: "var(--teal)",
//                 }}
//               >
//                 6/25
//               </span>
//             </div>

//             <a
//               className="btn-navigation btn-navigation-next"
//               href="item-deals.html"
//             >
//               NEXT
//               <svg viewBox="0 0 24 24">
//                 <polyline points="9 18 15 12 9 6" />
//               </svg>
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Tax Modal Overlay */}
//       <div className="modal-overlay" id="taxModal">
//         <div className="modal-container">
//           <div className="modal-title-bar">
//             <h3 id="modalTitle">Add New Tax</h3>
//             <button className="modal-close-btn" data-close-tax>
//               <svg viewBox="0 0 24 24">
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </button>
//           </div>
//           <form id="taxForm">
//             <input type="hidden" id="taxRowId" />
//             <div className="modal-body-content">
//               <div className="form-group">
//                 <label className="input-label" htmlFor="taxName">
//                   Name Of The Tax
//                 </label>
//                 <input
//                   className="input-field"
//                   type="text"
//                   id="taxName"
//                   required
//                   placeholder="e.g. VAT, SGST"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="input-label" htmlFor="taxRate">
//                   Tax (%)
//                 </label>
//                 <div className="slider-container">
//                   <input
//                     type="range"
//                     id="taxRateSlider"
//                     className="rate-slider"
//                     min="0"
//                     max="50"
//                     step="0.5"
//                     defaultValue="10"
//                   />
//                   <input
//                     className="input-field rate-input-box"
//                     type="number"
//                     id="taxRate"
//                     required
//                     min="0"
//                     max="100"
//                     step="0.1"
//                     defaultValue="10"
//                     placeholder="10"
//                   />
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label className="input-label" htmlFor="taxType">
//                   Tax Type
//                 </label>
//                 <select
//                   className="input-field"
//                   id="taxType"
//                   style={{ height: "44px" }}
//                   defaultValue="Inclusive"
//                 >
//                   <option value="Inclusive">Inclusive</option>
//                   <option value="Exclusive">Exclusive</option>
//                 </select>
//               </div>
//               <div
//                 className="form-group"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                   marginTop: "1.5rem",
//                   marginBottom: "1.5rem",
//                 }}
//               >
//                 <input
//                   type="checkbox"
//                   id="taxApplied"
//                   style={{
//                     width: "18px",
//                     height: "18px",
//                     cursor: "pointer",
//                     accentColor: "var(--teal)",
//                   }}
//                 />
//                 <label
//                   className="input-label"
//                   htmlFor="taxApplied"
//                   style={{
//                     marginBottom: 0,
//                     cursor: "pointer",
//                     textTransform: "none",
//                     letterSpacing: "normal",
//                     fontSize: "14.5px",
//                   }}
//                 >
//                   Apply this tax immediately
//                 </label>
//               </div>
//               <div className="calc-preview-box">
//                 <div className="calc-preview-title">
//                   Live Calculation Preview (Base $100)
//                 </div>
//                 <div className="calc-row">
//                   <span>Base price of item:</span>
//                   <span className="calc-value" id="previewBaseVal">
//                     $100.00
//                   </span>
//                 </div>
//                 <div className="calc-row">
//                   <span id="previewTaxNameLabel">
//                     Tax amount (10.00% Inclusive):
//                   </span>
//                   <span className="calc-value" id="previewTaxAmtVal">
//                     $9.09
//                   </span>
//                 </div>
//                 <div className="calc-row">
//                   <span>Customer total:</span>
//                   <span className="calc-value" id="previewTotalVal">
//                     $100.00
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer-bar">
//               <button
//                 className="btn-action btn-cancel btn-modal-cancel"
//                 type="button"
//                 data-close-tax
//               >
//                 Cancel
//               </button>
//               <button
//                 className="btn-action btn-save btn-modal-submit"
//                 type="submit"
//                 id="btnSubmit"
//               >
//                 Save Tax
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Help Modal Overlay */}
//       <div className="modal-overlay" id="helpModal">
//         <div className="modal-container">
//           <div className="modal-title-bar">
//             <h3>Tax Page Help Guide</h3>
//             <button className="modal-close-btn" data-close-help>
//               <svg viewBox="0 0 24 24">
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </button>
//           </div>
//           <div className="modal-body-content">
//             <div className="help-list">
//               <div className="help-item">
//                 <strong>Inclusive:</strong> The sales tax is already included in
//                 the retail price of the items. The customer pays the list price,
//                 and the tax is computed backwards from that total.
//               </div>
//               <div className="help-item">
//                 <strong>Exclusive:</strong> The sales tax is calculated and added
//                 on top of the list price of the items at checkout. The customer
//                 pays the list price plus the tax amount.
//               </div>
//               <div className="help-item">
//                 <strong>Applying/Deactivating Tax:</strong> Toggle the premium
//                 switch inside the &quot;Apply Tax&quot; column or grid card to
//                 activate or deactivate a tax in real-time. Active taxes are
//                 highlighted in teal (&quot;Applied&quot;) and their rates are
//                 combined in the &quot;Total Applied Rate&quot; stat.
//               </div>
//               <div className="help-item">
//                 <strong>Actions:</strong> You can define new taxes using the{" "}
//                 <strong>Add New Tax</strong> button. Rows can be updated using
//                 the blue edit button (
//                 <svg
//                   viewBox="0 0 24 24"
//                   style={{
//                     width: "12px",
//                     height: "12px",
//                     display: "inline",
//                     stroke: "#3b82f6",
//                     fill: "none",
//                     strokeWidth: 2.5,
//                   }}
//                 >
//                   <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
//                   <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                 </svg>
//                 ) or deleted using the red delete button.
//               </div>
//             </div>
//           </div>
//           <div className="modal-footer-bar">
//             <button
//               className="btn-action btn-cancel btn-modal-cancel"
//               type="button"
//               data-close-help
//               style={{ borderColor: "var(--border-strong)" }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Toast Box */}
//       <div className="toast-box" id="toast">
//         <svg viewBox="0 0 24 24">
//           <polyline points="20 6 9 17 4 12" />
//         </svg>
//         <span id="toastText">Changes saved successfully</span>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";
import { menuService } from "@/api/services/menu.service";
import { getShopId, useShopId } from "@/utils/shop";
import Swal from "sweetalert2";

// Types
interface Tax {
  id: number;
  name: string;
  rate: number;
  type: "Inclusive" | "Exclusive";
  taxType: number; // 1 = Inclusive, 0 = Exclusive
  applied: boolean;
}

interface FormData {
  name: string;
  rate: number;
  type: "Inclusive" | "Exclusive";
  applied: boolean;
}

export default function TaxPage() {
  // State
  const router = useRouter();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedTaxType, setAppliedTaxType] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<
    "All" | "Inclusive" | "Exclusive"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const shopId = useShopId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setIsHelpModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    rate: 10,
    type: "Inclusive",
    applied: true,
  });

  // Toast helper
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  }, []);

  // Fetch taxes
  const fetchTaxes = useCallback(async () => {
    try {
      setLoading(true);
      const activeShopId = getShopId();
      const response = await menuService.getTaxes(activeShopId);
      console.log(response);
      const mapTax = (item: any): Tax => ({
        id: item.food_shop_tax_id,
        name: item.tax_name,
        rate: item.tax_percentage,
        type: item.tax_type === 1 ? "Inclusive" : "Exclusive",
        taxType: item.tax_type,
        applied: item.is_active === true,
      });

      setTaxes(response.map(mapTax));
    } catch (err) {
      console.error("Error fetching taxes:", err);
      showToastMessage("Failed to load taxes");
    } finally {
      setLoading(false);
    }
  }, [showToastMessage]);

  const fetchAppliedTaxType = useCallback(async () => {
    try {
      const activeShopId = getShopId();
      const response = await menuService.getIncludingExcludingTax(activeShopId);

      let result: any[] = [];

      if (response?.data) {
        result =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
      } else if (Array.isArray(response)) {
        result = response;
      } else if (typeof response === "string") {
        try {
          result = JSON.parse(response);
        } catch (e) {
          result = [];
        }
      }

      console.log("GetIncludingExcludingTax Result:", result);

      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0];
        const type = firstItem.tax_type !== undefined ? firstItem.tax_type : firstItem.Tax_Type;
        setAppliedTaxType(type !== undefined ? Number(type) : null);
      } else {
        setAppliedTaxType(null);
      }
    } catch (err) {
      console.error("Error fetching GetIncludingExcludingTax:", err);
      setAppliedTaxType(null);
    }
  }, []);

  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
      const matchesType = filterType === "All" || tax.type === filterType;
      const matchesSearch =
        tax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tax.rate.toString().includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [taxes, filterType, searchQuery]);

  useEffect(() => {
    fetchTaxes();
    fetchAppliedTaxType();
  }, [fetchTaxes, fetchAppliedTaxType, shopId]);

  // Live preview calculation
  const previewCalculation = useMemo(() => {
    const rate = formData.rate || 0;
    const type = formData.type || "Inclusive";

    if (type === "Inclusive") {
      const total = 100;
      const base = total / (1 + rate / 100);
      const taxAmt = total - base;
      return {
        base,
        taxAmt,
        total,
        label: `Tax amount (${rate.toFixed(2)}% Inclusive):`,
      };
    } else {
      const base = 100;
      const taxAmt = base * (rate / 100);
      const total = base + taxAmt;
      return {
        base,
        taxAmt,
        total,
        label: `Tax amount (${rate.toFixed(2)}% Exclusive):`,
      };
    }
  }, [formData.rate, formData.type]);

  // Modal handlers
  const openTaxModal = useCallback((tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        applied: tax.applied,
      });
    } else {
      setEditingTax(null);
      setFormData({
        name: "",
        rate: 10,
        type: "Inclusive",
        applied: true,
      });
    }
    setIsModalOpen(true);
  }, []);

  const closeTaxModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTax(null);
  }, []);

  // Save tax
  // const handleSaveTax = useCallback(
  //   async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();

  //     try {
  //       setLoading(true);

  //       const payload = {
  //         shop_Id: shopId,
  //         tax_Name: formData.name.trim(),
  //         tax_type: formData.type === "Inclusive" ? 1 : 0,
  //         tax_Percentage: formData.rate,
  //         food_Shop_Tax_Id: editingTax?.id || 0,
  //         food_Country_Tax_Id: "",
  //         food_tax_name_lang: "ABC",
  //         is_Active: formData.applied,
  //       };

  //       await menuService.saveStoreTax(payload);
  //       await fetchTaxes();

  //       showToastMessage(
  //         editingTax
  //           ? `Tax "${formData.name}" updated successfully`
  //           : `Tax "${formData.name}" created successfully`,
  //       );

  //       closeTaxModal();
  //     } catch (error) {
  //       console.error("Error saving tax:", error);
  //       await Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: "Failed to save tax. Please try again.",
  //         confirmButtonColor: "#3085d6",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [shopId, formData, editingTax, fetchTaxes, closeTaxModal, showToastMessage],
  // );

  // Save tax
  const handleSaveTax = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const taxName = formData.name.trim();

      // Name validation
      if (!taxName) {
        await Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Please enter tax name.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      if (taxName.length < 2) {
        await Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Tax name must be at least 2 characters.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Rate validation
      if (formData.rate <= 0 || formData.rate > 100) {
        await Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Tax percentage must be between 0 and 100.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Duplicate validation
      const duplicateTax = taxes.find(
        (tax) =>
          tax.name.toLowerCase() === taxName.toLowerCase() &&
          tax.id !== editingTax?.id
      );

      if (duplicateTax) {
        await Swal.fire({
          icon: "warning",
          title: "Duplicate Tax",
          text: `"${taxName}" already exists.`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      try {
        setLoading(true);

        const payload = {
          shop_Id: getShopId(),
          tax_Name: taxName,
          tax_type: editingTax
            ? editingTax.taxType // Use existing tax type for edit
            : formData.type === "Inclusive"
              ? 1
              : 0,
          tax_Percentage: formData.rate,
          food_Shop_Tax_Id: editingTax?.id || 0,
          food_Country_Tax_Id: "",
          food_tax_name_lang: "ABC",
          is_Active: formData.applied,
        };

        await menuService.saveStoreTax(payload);
        await fetchTaxes();
        closeTaxModal();

        await Swal.fire({
          icon: "success",
          title: editingTax ? "Updated!" : "Added!",
          text: editingTax
            ? "Tax updated successfully."
            : "Tax added successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ||
            "Something went wrong while saving tax.",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, taxes, editingTax, fetchTaxes, closeTaxModal, shopId]
  );
  // Delete tax
  const handleDeleteTax = useCallback(
    async (tax: Tax) => {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: `Do you want to delete the tax "${tax.name}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          setLoading(true);
          const activeShopId = getShopId();

          // 1. First remove tax from all items using USP_DeleteTaxAllItemWithTaxID
          try {
            await menuService.deleteTaxAllItemWithTaxID(activeShopId, tax.id);
          } catch (err) {
            console.warn("USP_DeleteTaxAllItemWithTaxID call prior to deleteStoreTax:", err);
          }

          // 2. Then delete store tax record using DeleteStoreTax
          const response = await menuService.deleteStoreTax(tax.id);

          await fetchTaxes();
          await fetchAppliedTaxType();

          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response?.message || `Tax "${tax.name}" has been deleted successfully.`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error: any) {
        console.error("Error deleting tax:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to delete tax. Please try again.",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    },
    [fetchTaxes, fetchAppliedTaxType]
  );


  // Handle apply tax: navigate to apply-tax page for selected tax
  const handleApplyTax = useCallback(
    (taxId: number) => {
      router.push(`/menu/apply-tax?taxId=${taxId}`);
    },
    [router]
  );

  // Render helpers
  const renderStatusBadge = useCallback((applied: boolean) => {
    if (applied) {
      return (
        <span className="tax-status-badge tax-status-applied">
          <svg
            viewBox="0 0 24 24"
            style={{
              width: "11px",
              height: "11px",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 3,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Applied
        </span>
      );
    }
    return (
      <span className="tax-status-badge tax-status-not-applied">
        <svg
          viewBox="0 0 24 24"
          style={{
            width: "11px",
            height: "11px",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 3,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Not Applied
      </span>
    );
  }, []);

  const renderTypeBadge = useCallback((type: "Inclusive" | "Exclusive") => {
    const badgeClass =
      type === "Inclusive" ? "badge-inclusive" : "badge-exclusive";
    return (
      <span className={`tax-badge ${badgeClass}`}>
        <span className="pulse-dot"></span>
        {type}
      </span>
    );
  }, []);

  // Initial fetch
  // useEffect(() => {
  //   fetchTaxes();
  // }, [fetchTaxes]);

  useEffect(() => {
    fetchTaxes();
    // fetchTaxType();
    fetchAppliedTaxType();
  }, [fetchTaxes, fetchAppliedTaxType]);


  useEffect(() => {
    const handleFocus = () => {
      fetchAppliedTaxType();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchAppliedTaxType]);




  return (
    <div id="pg-menu-tax">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="app-container">
        <div className="content-area">
          {/* Taxes Table Card */}
          <div className="taxes-card">
            <div className="taxes-header">
              <h2 className="taxes-title typ-page-heading" style={{ margin: 0 }}>Taxes</h2>
              <div
                className="taxes-actions"
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <button
                  className="btn-action btn-brand btn-add-tax"
                  onClick={() => openTaxModal()}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: "14px",
                      height: "14px",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 2.5,
                    }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  ADD NEW TAX
                </button>
                <button
                  className="btn-help"
                  onClick={() => setIsHelpModalOpen(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: "16px",
                      height: "16px",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
            </div>

            {/* Interactive Toolbar */}
            <div className="taxes-toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <div className="search-icon-wrap">
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "16px",
                        height: "16px",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                      }}
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search taxes by name or rate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-pills-wrap">
                  {(["All", "Inclusive", "Exclusive"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        className={`filter-pill ${filterType === type ? "active" : ""}`}
                        onClick={() => setFilterType(type)}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="toolbar-right">
                <span className="results-badge">
                  Showing {filteredTaxes.length} of {taxes.length} taxes
                </span>
                <div className="view-switcher">
                  <button
                    className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                    onClick={() => setViewMode("table")}
                    title="Table View"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "16px",
                        height: "16px",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                      }}
                    >
                      <path d="M3 9h18M3 15h18M3 21h18M3 3h18" />
                    </svg>
                  </button>
                  <button
                    className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Card Grid View"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "16px",
                        height: "16px",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                      }}
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Table View */}
            {viewMode === "table" && (
              <div className="table-wrap">
                {filteredTaxes.length === 0 ? (
                  <div className="empty-state-card">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                    <h3 className="empty-state-title">No taxes found</h3>
                    <p className="empty-state-desc">
                      Get started by creating a new tax or adjusting your search
                      filters.
                    </p>
                    <button
                      className="btn-empty-action"
                      onClick={() => openTaxModal()}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: "14px",
                          height: "14px",
                          fill: "none",
                          stroke: "#fff",
                          strokeWidth: 2.5,
                        }}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      ADD NEW TAX
                    </button>
                  </div>
                ) : (
                  <table className="taxes-table">
                    <thead>
                      <tr>
                        <th style={{ width: "100px" }}>Sr. No.</th>
                        <th>Name Of The Tax</th>
                        <th>Tax (%)</th>
                        <th>Tax Type</th>
                        <th style={{ width: "130px", textAlign: "center" }}>
                          Status
                        </th>
                        <th style={{ width: "160px", textAlign: "center" }}>
                          Apply Tax
                        </th>
                        <th style={{ width: "140px", textAlign: "center" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTaxes.map((tax, index) => {
                        // console.log("appliedTaxType =", appliedTaxType);
                        console.log("tax =", tax.name, tax.type);
                        console.log({
                          taxName: tax.name,
                          taxType: tax.taxType,
                          appliedTaxType,
                          disable:
                            appliedTaxType !== null &&
                            appliedTaxType !== tax.taxType,
                        });
                        const disableApply =
                          appliedTaxType !== null &&
                          appliedTaxType !== tax.taxType;

                        return (

                          <tr key={tax.id}>
                            <td>{index + 1}</td>
                            <td className="tax-name-cell">{tax.name}</td>
                            <td>
                              <span className="rate-text-val">{tax.rate}%</span>
                            </td>
                            <td>{renderTypeBadge(tax.type)}</td>
                            <td style={{ textAlign: "center" }}>
                              {renderStatusBadge(tax.applied)}
                            </td>
                            <td style={{ textAlign: "center" }}>


                              <button
                                className="btn-apply-tax"
                                disabled={disableApply}
                                onClick={() => handleApplyTax(tax.id)}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: 2.5,
                                  }}
                                >
                                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Apply Tax
                              </button>
                            </td>
                            <td>
                              <div
                                className="action-wrap"
                                style={{ justifyContent: "center" }}
                              >
                                <button
                                  className="btn-action-sq btn-sq-edit"
                                  onClick={() => openTaxModal(tax)}
                                  title="Edit Tax"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      fill: "none",
                                      stroke: "currentColor",
                                      strokeWidth: 2,
                                    }}
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  className="btn-action-sq btn-sq-delete"
                                  onClick={() => handleDeleteTax(tax)}
                                  title="Delete Tax"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      fill: "none",
                                      stroke: "currentColor",
                                      strokeWidth: 2,
                                    }}
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="tax-grid-layout">
                {filteredTaxes.length === 0 ? (
                  <div
                    className="empty-state-card"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                    <h3 className="empty-state-title">No taxes found</h3>
                    <p className="empty-state-desc">
                      Get started by creating a new tax or adjusting your search
                      filters.
                    </p>
                    <button
                      className="btn-empty-action"
                      onClick={() => openTaxModal()}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: "14px",
                          height: "14px",
                          fill: "none",
                          stroke: "#fff",
                          strokeWidth: 2.5,
                        }}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      ADD NEW TAX
                    </button>
                  </div>
                ) : (
                  filteredTaxes.map((tax, index) => {
                    // console.log("appliedTaxType =", appliedTaxType);
                    console.log("tax =", tax.name, tax.type);
                    console.log({
                      taxName: tax.name,
                      taxType: tax.taxType,
                      appliedTaxType,
                      disable:
                        appliedTaxType !== null &&
                        appliedTaxType !== tax.taxType,
                    });
                    const disableApply =
                      appliedTaxType !== null &&
                      appliedTaxType !== tax.taxType;

                    return (
                      <div key={tax.id} className="tax-grid-card">
                        <div className="grid-card-header">
                          <span className="grid-card-title">{tax.name}</span>
                          {renderTypeBadge(tax.type)}
                        </div>
                        <span className="grid-card-rate-label">Tax Rate</span>
                        <span className="grid-card-rate-value">{tax.rate}%</span>

                        <div style={{ marginBottom: "1rem" }}>
                          {renderStatusBadge(tax.applied)}
                        </div>

                        <button
                          className="btn-apply-tax"
                          style={{ width: "100%", marginBottom: "1.25rem" }}
                          disabled={disableApply}
                          onClick={() => handleApplyTax(tax.id)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            style={{
                              width: "14px",
                              height: "14px",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: 2.5,
                            }}
                          >
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Apply Tax to Products
                        </button>

                        <div className="grid-card-footer">
                          <span className="results-badge"># {index + 1}</span>
                          <div className="grid-card-actions">
                            <button
                              className="btn-action-sq btn-sq-edit"
                              onClick={() => openTaxModal(tax)}
                              title="Edit Tax"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: 2,
                                }}
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="btn-action-sq btn-sq-delete"
                              onClick={() => handleDeleteTax(tax)}
                              title="Delete Tax"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: 2,
                                }}
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <WizardFooter />
        </div>
      </div>

      {/* Add/Edit Tax Modal */}
      {isModalOpen && (
        <div className="modal-overlay show" style={{ display: "flex" }}>
          <div className="modal-container">
            <div className="modal-title-bar">
              <h3>{editingTax ? "Edit Tax Detail" : "Add New Tax"}</h3>
              <button className="modal-close-btn" onClick={closeTaxModal}>
                <svg
                  viewBox="0 0 24 24"
                  style={{
                    width: "16px",
                    height: "16px",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                  }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveTax}>
              <div className="modal-body-content">
                <div className="form-group">
                  <label className="input-label" htmlFor="taxName">
                    Name Of The Tax
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    id="taxName"
                    required
                    placeholder="e.g. VAT, SGST"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="input-label" htmlFor="taxRate">
                    Tax (%)
                  </label>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="rate-slider"
                      min="0"
                      max="50"
                      step="0.5"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <input
                      className="input-field rate-input-box"
                      type="number"
                      id="taxRate"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
                {/*<div className="form-group">
                  <label className="input-label" htmlFor="taxType">
                    Tax Type
                  </label>

                  <select
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => {
                      console.log("Selected Value:", e.target.value);

                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as "Inclusive" | "Exclusive",
                      }));
                    }}
                  >
                    <option value="Inclusive">Inclusive</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                </div>*/}
                {/* Show Tax Type only while adding a new tax */}
                {!editingTax && (
                  <div className="form-group">
                    <label className="input-label" htmlFor="taxType">
                      Tax Type
                    </label>
                    <select
                      id="taxType"
                      className="input-field"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as "Inclusive" | "Exclusive",
                        }))
                      }
                    >
                      <option value="Inclusive">Inclusive</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>
                )}
                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    id="taxApplied"
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "var(--teal)",
                    }}
                    checked={formData.applied}
                    onChange={(e) =>
                      setFormData({ ...formData, applied: e.target.checked })
                    }
                  />
                  <label
                    className="input-label"
                    htmlFor="taxApplied"
                    style={{
                      marginBottom: 0,
                      cursor: "pointer",
                      textTransform: "none",
                      letterSpacing: "normal",
                      fontSize: "14.5px",
                    }}
                  >
                    Apply this tax immediately
                  </label>
                </div>
                <div className="calc-preview-box">
                  <div className="calc-preview-title">
                    Live Calculation Preview (Base $100)
                  </div>
                  <div className="calc-row">
                    <span>Base price of item:</span>
                    <span className="calc-value">
                      ${previewCalculation.base.toFixed(2)}
                    </span>
                  </div>
                  <div className="calc-row">
                    <span>{previewCalculation.label}</span>
                    <span className="calc-value">
                      ${previewCalculation.taxAmt.toFixed(2)}
                    </span>
                  </div>
                  <div className="calc-row">
                    <span>Customer total:</span>
                    <span className="calc-value">
                      ${previewCalculation.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer-bar">
                <button
                  className="btn-action btn-cancel btn-modal-cancel"
                  type="button"
                  onClick={closeTaxModal}
                >
                  Cancel
                </button>
                <button
                  className="btn-action btn-save btn-modal-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingTax
                      ? "Update Tax"
                      : "Save Tax"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Toast Box */}
      {showToast && (
        <div className="toast-box show">
          <svg
            viewBox="0 0 24 24"
            style={{
              width: "16px",
              height: "16px",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2.5,
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}