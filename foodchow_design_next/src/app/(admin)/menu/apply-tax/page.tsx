// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { menuService } from "@/api/services/menu.service";
// import "./page.css";

// interface Product {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   priceWithTax?: number;
//   taxApplied?: boolean;
// }

// export default function ApplyTaxPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const taxId = searchParams.get("taxId");
//   const [taxName, setTaxName] = useState<string>("");
//   const [taxPercentage, setTaxPercentage] = useState<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [products, setProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     // Get tax details if taxId is provided
//     if (taxId) {
//       fetchTaxDetails(parseInt(taxId));
//     } else {
//       setLoading(false);
//     }
//   }, [taxId]);

//   const fetchTaxDetails = async (id: number) => {
//     try {
//       const SHOP_ID = 3161;
//       const response = await menuService.getTaxes(SHOP_ID);
//       const tax = response.find(t => t.food_shop_tax_id === id);
//       if (tax) {
//         setTaxName(tax.tax_name);
//         setTaxPercentage(tax.tax_percentage);
//       }
//     } catch (error) {
//       console.error("Error fetching tax details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const SHOP_ID = 3161;
//     const TAX_ID = taxId ? parseInt(taxId) : 0;

//     let sampleProducts: Product[] = [];
//     let productSearchQuery = "";
//     let toastTimeout: ReturnType<typeof setTimeout>;

//     function escapeHtml(str: string): string {
//       return str
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");
//     }

//     // async function loadProducts() {
//     //   try {
//     //     const response = await menuService.getItemListWithSize(SHOP_ID);
//     //     sampleProducts = response.map((item) => ({
//     //       id: item.item_size_id || item.item_id,
//     //       name: item.size_name
//     //         ? `${item.item_name} (${item.size_name})`
//     //         : item.item_name,
//     //       category: item.size_name ?? "Default",
//     //       price: item.item_price,
//     //       priceWithTax: item.item_price,
//     //       taxApplied: false,
//     //     }));
//     //     setProducts(sampleProducts);
//     //     renderProductList();
//     //   } catch (error) {
//     //     console.error(error);
//     //   }
//     // }

//     // In the loadProducts function, update the API call:
//     async function loadProducts() {
//       try {
//         // Get the tax type from the tax data (1 = Inclusive, 0 = Exclusive)
//         const taxType = taxPercentage ? 1 : 0; // You'll need to get the actual tax_type from your tax data

//         // Pass taxId and taxType to the API
//         const response = await menuService.getItemListWithSize(SHOP_ID, TAX_ID, taxType);

//         // Check if response is an array or has item_list property
//         let items = [];
//         if (Array.isArray(response)) {
//           items = response;
//         } else if (response && typeof response === 'object' && response.item_list) {
//           items = response.item_list;
//         } else {
//           items = response || [];
//         }

//         sampleProducts = items.map((item) => ({
//           id: item.item_size_id || item.item_id,
//           name: item.size_name
//             ? `${item.item_name} (${item.size_name})`
//             : item.item_name,
//           category: item.size_name ?? "Default",
//           price: item.item_price || 0,
//           priceWithTax: item.item_price || 0,
//           taxApplied: false,
//         }));
//         setProducts(sampleProducts);
//         renderProductList();
//       } catch (error) {
//         console.error("Error loading products:", error);
//         showToast("Failed to load products. Please try again.");
//       }
//     }

//     function calculatePriceWithTax(price: number, taxPercentage: number): number {
//       return price + (price * taxPercentage / 100);
//     }

//     function renderProductList() {
//       const list = document.getElementById("productModalList");
//       if (!list) return;
//       const query = productSearchQuery.toLowerCase();
//       const filtered = sampleProducts.filter(
//         (p) =>
//           p.name.toLowerCase().includes(query) ||
//           p.category.toLowerCase().includes(query)
//       );

//       if (filtered.length === 0) {
//         list.innerHTML = `<div class="product-empty-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2rem;color:var(--text-muted);gap:8px;">
//           <svg viewBox="0 0 24 24" style="width:40px;height:40px;opacity:0.4;" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
//           <p style="font-size:14px;font-weight:500;margin:0;">No products match your search.</p>
//         </div>`;
//         return;
//       }

//       list.innerHTML = filtered
//         .map((product) => {
//           const checked = product.taxApplied || false;
//           const priceWithoutTax = product.price;
//           const priceWithTax = checked ? calculatePriceWithTax(product.price, taxPercentage) : product.price;

//           return `<div class="product-item${checked ? " selected" : ""}" data-product-id="${product.id}" style="display:flex;align-items:center;gap:12px;padding:12px 1.75rem;cursor:pointer;border-bottom:1px solid #f1f5f9;${checked ? "background:#f0fdfa;" : ""}">
//             <input type="checkbox" class="custom-checkbox" ${checked ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--teal);flex-shrink:0;">
//             <div class="product-item-info" style="flex:1;min-width:0;">
//               <div class="product-item-name" style="font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(product.name)}</div>
//               <div class="product-item-meta" style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(product.category)}</div>
//             </div>
//             <div style="display:flex;align-items:center;gap:16px;flex-shrink:0;">
//               <div style="text-align:right;">
//                 <div style="font-size:11px;color:var(--text-muted);font-weight:500;">Without Tax</div>
//                 <span style="font-size:13px;font-weight:600;color:var(--text-secondary);font-family:var(--font-mono);">₹${priceWithoutTax.toFixed(2)}</span>
//               </div>
//               <div style="text-align:right;">
//                 <div style="font-size:11px;color:var(--text-muted);font-weight:500;">With Tax</div>
//                 <span style="font-size:14px;font-weight:700;color:${checked ? 'var(--teal-dark)' : 'var(--text-muted)'};font-family:var(--font-mono);">₹${priceWithTax.toFixed(2)}</span>
//               </div>
//               ${checked ? `<div style="text-align:right;min-width:70px;">
//                 <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${escapeHtml(taxName)}</div>
//                 <span style="font-size:12px;font-weight:600;color:var(--teal);font-family:var(--font-mono);">₹${(priceWithTax - priceWithoutTax).toFixed(2)}</span>
//               </div>` : ''}
//             </div>
//           </div>`;
//         })
//         .join("");
//     }

//     async function toggleProductTax(productId: number, rowEl: HTMLElement) {
//       const product = sampleProducts.find(p => p.id === productId);
//       if (!product) return;

//       const checkbox = rowEl.querySelector<HTMLInputElement>('input[type=checkbox]');
//       const isCurrentlyChecked = checkbox?.checked || false;
//       const newTaxState = !isCurrentlyChecked;

//       try {
//         if (newTaxState) {
//           // Apply tax to this product
//           await menuService.applyTaxOnAllItems(SHOP_ID, TAX_ID);
//           product.taxApplied = true;
//           product.priceWithTax = calculatePriceWithTax(product.price, taxPercentage);
//           rowEl.classList.add("selected");
//           rowEl.style.background = "#f0fdfa";
//           if (checkbox) checkbox.checked = true;
//           showToast(`${taxName} applied to "${product.name}"`);
//         } else {
//           // Remove tax from this product
//           await menuService.removeTaxOnAllItems(SHOP_ID, TAX_ID);
//           product.taxApplied = false;
//           product.priceWithTax = product.price;
//           rowEl.classList.remove("selected");
//           rowEl.style.background = "";
//           if (checkbox) checkbox.checked = false;
//           showToast(`${taxName} removed from "${product.name}"`);
//         }

//         // Update the product in the products state
//         setProducts([...sampleProducts]);
//         renderProductList();
//         updateProductModalCounts();

//         // Update select all checkbox
//         updateSelectAllState();
//       } catch (err) {
//         console.error("Error toggling tax:", err);
//         showToast("Failed to update tax. Please try again.");
//         // Revert checkbox state
//         if (checkbox) checkbox.checked = isCurrentlyChecked;
//       }
//     }

//     function updateSelectAllState() {
//       const selectAll = document.getElementById("selectAllProducts") as HTMLInputElement | null;
//       if (!selectAll) return;
//       const allChecked = sampleProducts.every(p => p.taxApplied);
//       const someChecked = sampleProducts.some(p => p.taxApplied);
//       selectAll.checked = allChecked;
//       selectAll.indeterminate = !allChecked && someChecked;
//     }

//     function toggleSelectAll(checkbox: HTMLInputElement) {
//       const query = productSearchQuery.toLowerCase();
//       const filtered = sampleProducts.filter(
//         (p) =>
//           p.name.toLowerCase().includes(query) ||
//           p.category.toLowerCase().includes(query)
//       );

//       const shouldApply = checkbox.checked;

//       filtered.forEach(async (product) => {
//         try {
//           if (shouldApply) {
//             await menuService.applyTaxOnAllItems(SHOP_ID, TAX_ID);
//             product.taxApplied = true;
//             product.priceWithTax = calculatePriceWithTax(product.price, taxPercentage);
//           } else {
//             await menuService.removeTaxOnAllItems(SHOP_ID, TAX_ID);
//             product.taxApplied = false;
//             product.priceWithTax = product.price;
//           }
//         } catch (err) {
//           console.error("Error in bulk tax update:", err);
//         }
//       });

//       setProducts([...sampleProducts]);
//       renderProductList();
//       updateProductModalCounts();
//       showToast(shouldApply ? `Applied ${taxName} to all products` : `Removed ${taxName} from all products`);
//     }

//     function filterProducts() {
//       const input = document.getElementById(
//         "productSearchInput"
//       ) as HTMLInputElement | null;
//       productSearchQuery = input ? input.value.trim() : "";
//       renderProductList();
//     }

//     async function applyAllProducts() {
//       try {
//         await menuService.applyTaxOnAllItems(SHOP_ID, TAX_ID);
//         sampleProducts.forEach((p) => {
//           p.taxApplied = true;
//           p.priceWithTax = calculatePriceWithTax(p.price, taxPercentage);
//         });
//         setProducts([...sampleProducts]);
//         renderProductList();
//         updateProductModalCounts();
//         updateSelectAllState();
//         showToast(`${taxName} applied to all products.`);
//       } catch (err) {
//         console.error(err);
//         showToast("Failed to apply tax.");
//       }
//     }

//     async function removeAllProducts() {
//       try {
//         await menuService.removeTaxOnAllItems(SHOP_ID, TAX_ID);
//         sampleProducts.forEach((p) => {
//           p.taxApplied = false;
//           p.priceWithTax = p.price;
//         });
//         setProducts([...sampleProducts]);
//         renderProductList();
//         updateProductModalCounts();
//         updateSelectAllState();
//         showToast(`${taxName} removed from all products.`);
//       } catch (err) {
//         console.error(err);
//         showToast("Failed to remove tax.");
//       }
//     }

//     function updateProductModalCounts() {
//       const count = sampleProducts.filter(p => p.taxApplied).length;
//       const selCount = document.getElementById("productSelectedCount");
//       const footerCount = document.getElementById("footerSelectedCount");
//       if (selCount) selCount.textContent = `${count} selected`;
//       if (footerCount) footerCount.textContent = String(count);
//     }

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

//     // ── Wire listeners ──
//     const searchInput = document.getElementById(
//       "productSearchInput"
//     ) as HTMLInputElement | null;
//     const selectAllCb = document.getElementById(
//       "selectAllProducts"
//     ) as HTMLInputElement | null;
//     const applyAllBtn = document.getElementById("applyAllBtn");
//     const removeAllBtn = document.getElementById("removeAllBtn");
//     const helpBtn = document.getElementById("helpBtn");
//     const cancelBtn = document.getElementById("cancelBtn");
//     const closeHelpBtns = document.querySelectorAll<HTMLButtonElement>(
//       "[data-close-help]"
//     );
//     const productList = document.getElementById("productModalList");

//     const onSelectAllChange = (e: Event) =>
//       toggleSelectAll(e.target as HTMLInputElement);

//     // Delegated handling for product rows / checkboxes
//     const onListClick = (e: Event) => {
//       const targetEl = e.target as HTMLElement;
//       const row = targetEl.closest<HTMLElement>(".product-item");
//       if (!row) return;
//       const productId = parseInt(row.getAttribute("data-product-id") || "0");
//       if (targetEl.matches('input[type=checkbox]')) {
//         e.stopPropagation();
//       }
//       toggleProductTax(productId, row);
//     };

//     searchInput?.addEventListener("input", filterProducts);
//     selectAllCb?.addEventListener("change", onSelectAllChange);
//     applyAllBtn?.addEventListener("click", applyAllProducts);
//     removeAllBtn?.addEventListener("click", removeAllProducts);
//     helpBtn?.addEventListener("click", openHelpModal);
//     cancelBtn?.addEventListener("click", () => {
//       router.push("/menu/tax");
//     });
//     closeHelpBtns.forEach((b) => b.addEventListener("click", closeHelpModal));
//     productList?.addEventListener("click", onListClick);

//     // Close dropdowns when clicking outside
//     const onWindowClick = (e: MouseEvent) => {
//       if (!(e.target as HTMLElement).closest(".topbar-dropdown")) {
//         document
//           .querySelectorAll<HTMLElement>(".dropdown-menu")
//           .forEach((menu) => menu.classList.remove("show"));
//       }
//     };
//     window.addEventListener("click", onWindowClick);

//     // Initial render
//     loadProducts();

//     return () => {
//       clearTimeout(toastTimeout);
//       searchInput?.removeEventListener("input", filterProducts);
//       selectAllCb?.removeEventListener("change", onSelectAllChange);
//       applyAllBtn?.removeEventListener("click", applyAllProducts);
//       removeAllBtn?.removeEventListener("click", removeAllProducts);
//       helpBtn?.removeEventListener("click", openHelpModal);
//       closeHelpBtns.forEach((b) =>
//         b.removeEventListener("click", closeHelpModal)
//       );
//       productList?.removeEventListener("click", onListClick);
//       window.removeEventListener("click", onWindowClick);
//     };
//   }, [taxId, router, taxName, taxPercentage]);

//   // Loading state
//   if (loading) {
//     return (
//       <div id="pg-menu-apply-tax">
//         <div className="app-container">
//           <div className="content-area">
//             <div style={{ textAlign: "center", padding: "50px" }}>
//               <div className="spinner"></div>
//               <p>Loading tax details...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Update the title to show the tax name
//   const pageTitle = taxName ? `Apply Tax: ${taxName}` : "Apply Tax to Products";

//   return (
//     <div id="pg-menu-apply-tax">
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
//         {/* Main Content */}
//         <div className="main-content">
//           <div className="content-area">
//             {/* Apply Tax Card */}
//             <div className="apply-card">
//               <div
//                 className="apply-header"
//                 style={{
//                   background: "#fafbfe",
//                   borderBottom: "1px solid var(--border)",
//                   padding: "1.5rem 1.75rem",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <div className="product-modal-title-group">
//                   <span
//                     className="typ-page-heading apply-title"
//                     style={{
//                       //                       //                       color: "var(--text-primary)",
//                     }}
//                   >
//                     {pageTitle}
//                   </span>
//                   <span
//                     className="product-modal-subtitle"
//                     id="applyTaxModalSubtitle"
//                     style={{
//                       fontSize: "13px",
//                       color: "var(--text-secondary)",
//                       fontWeight: 500,
//                     }}
//                   >
//                     Toggle checkbox to apply/remove tax from products
//                   </span>
//                 </div>
//                 <button className="btn-help" id="helpBtn">
//                   <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
//                     <circle cx="12" cy="12" r="10" />
//                     <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
//                     <line x1="12" y1="17" x2="12.01" y2="17" />
//                   </svg>
//                   HELP
//                 </button>
//               </div>

//               <div
//                 className="product-modal-toolbar"
//                 style={{
//                   padding: "1rem 1.75rem",
//                   borderBottom: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <div
//                   className="product-search-wrap"
//                   style={{
//                     flex: 1,
//                     minWidth: "200px",
//                     position: "relative",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <svg
//                     viewBox="0 0 24 24"
//                     style={{
//                       position: "absolute",
//                       left: "12px",
//                       width: "15px",
//                       height: "15px",
//                       stroke: "var(--text-muted)",
//                       fill: "none",
//                       strokeWidth: 2.2,
//                       pointerEvents: "none",
//                     }}
//                   >
//                     <circle cx="11" cy="11" r="8" />
//                     <line x1="21" y1="21" x2="16.65" y2="16.65" />
//                   </svg>
//                   <input
//                     type="text"
//                     className="product-search-input"
//                     id="productSearchInput"
//                     placeholder="Search products..."
//                     style={{
//                       width: "100%",
//                       padding: "9px 12px 9px 36px",
//                       border: "1.5px solid var(--border)",
//                       borderRadius: "var(--radius-sm)",
//                       fontSize: "13.5px",
//                       fontFamily: "var(--font)",
//                       color: "var(--text-primary)",
//                       background: "var(--bg)",
//                       outline: "none",
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="product-modal-bulk-actions"
//                   style={{ display: "flex", alignItems: "center", gap: "6px" }}
//                 >
//                   <button
//                     className="btn-bulk btn-bulk-apply"
//                     id="applyAllBtn"
//                     style={{
//                       padding: "8px 14px",
//                       borderRadius: "var(--radius-sm)",
//                       fontSize: "12.5px",
//                       fontWeight: 700,
//                       fontFamily: "var(--font)",
//                       cursor: "pointer",
//                       border: "1.5px solid var(--teal)",
//                       background: "var(--teal-light)",
//                       color: "var(--teal-dark)",
//                     }}
//                   >
//                     <svg
//                       viewBox="0 0 24 24"
//                       style={{
//                         width: "12px",
//                         height: "12px",
//                         display: "inline",
//                         stroke: "currentColor",
//                         fill: "none",
//                         strokeWidth: 2.5,
//                         strokeLinecap: "round",
//                         verticalAlign: "middle",
//                         marginRight: "4px",
//                       }}
//                     >
//                       <polyline points="20 6 9 17 4 12" />
//                     </svg>
//                     Apply All
//                   </button>
//                   <button
//                     className="btn-bulk btn-bulk-remove"
//                     id="removeAllBtn"
//                     style={{
//                       padding: "8px 14px",
//                       borderRadius: "var(--radius-sm)",
//                       fontSize: "12.5px",
//                       fontWeight: 700,
//                       fontFamily: "var(--font)",
//                       cursor: "pointer",
//                       border: "1.5px solid #fca5a5",
//                       background: "#fef2f2",
//                       color: "#dc2626",
//                     }}
//                   >
//                     <svg
//                       viewBox="0 0 24 24"
//                       style={{
//                         width: "12px",
//                         height: "12px",
//                         display: "inline",
//                         stroke: "currentColor",
//                         fill: "none",
//                         strokeWidth: 2.5,
//                         strokeLinecap: "round",
//                         verticalAlign: "middle",
//                         marginRight: "4px",
//                       }}
//                     >
//                       <line x1="18" y1="6" x2="6" y2="18" />
//                       <line x1="6" y1="6" x2="18" y2="18" />
//                     </svg>
//                     Remove All
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className="product-modal-selectall"
//                 style={{
//                   padding: "0.6rem 1.75rem",
//                   borderBottom: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                   background: "#f8fafc",
//                 }}
//               >
//                 <label
//                   style={{
//                     fontSize: "13.5px",
//                     fontWeight: 700,
//                     color: "var(--text-secondary)",
//                     cursor: "pointer",
//                     userSelect: "none",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                   }}
//                 >
//                   <input
//                     type="checkbox"
//                     className="custom-checkbox"
//                     id="selectAllProducts"
//                     style={{
//                       width: "18px",
//                       height: "18px",
//                       cursor: "pointer",
//                       accentColor: "var(--teal)",
//                     }}
//                   />
//                   Select All Products
//                 </label>
//                 <span
//                   className="product-modal-count"
//                   id="productSelectedCount"
//                   style={{
//                     marginLeft: "auto",
//                     fontSize: "12.5px",
//                     fontWeight: 600,
//                     color: "var(--text-muted)",
//                   }}
//                 >
//                   0 selected
//                 </span>
//               </div>

//               <div
//                 className="product-modal-list"
//                 id="productModalList"
//                 style={{
//                   maxHeight: "500px",
//                   overflowY: "auto",
//                   padding: "0.5rem 0",
//                 }}
//               >
//                 {/* Rendered by JS */}
//               </div>

//               <div
//                 className="product-modal-footer"
//                 style={{
//                   padding: "1.1rem 1.75rem",
//                   borderTop: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: "1rem",
//                   background: "#fafbfe",
//                 }}
//               >
//                 <span
//                   className="product-modal-footer-info"
//                   style={{
//                     fontSize: "13px",
//                     color: "var(--text-secondary)",
//                     fontWeight: 500,
//                   }}
//                 >
//                   <strong
//                     id="footerSelectedCount"
//                     style={{ color: "var(--teal-dark)", fontWeight: 800 }}
//                   >
//                     0
//                   </strong>{" "}
//                   product(s) with {taxName || "tax"} applied
//                 </span>
//                 <div
//                   className="product-modal-footer-actions"
//                   style={{ display: "flex", alignItems: "center", gap: "8px" }}
//                 >
//                   <button
//                     className="btn-action btn-cancel"
//                     id="cancelBtn"
//                     style={{
//                       padding: "10px 20px",
//                       border: "1.5px solid var(--border-strong)",
//                       background: "#fff",
//                       borderRadius: "var(--radius-md)",
//                       color: "var(--text-secondary)",
//                       fontSize: "13.5px",
//                       fontWeight: 600,
//                       cursor: "pointer",
//                     }}
//                   >
//                     Back
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Row */}
//             <div className="nav-row">
//               <button
//                 className="btn-navigation btn-navigation-prev"
//                 onClick={() => router.push("/menu/tax")}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   padding: "10px 20px",
//                   background: "transparent",
//                   border: "1.5px solid var(--border)",
//                   borderRadius: "var(--radius-md)",
//                   color: "var(--text-secondary)",
//                   fontSize: "13px",
//                   fontWeight: 600,
//                   cursor: "pointer",
//                   textDecoration: "none",
//                   transition: "all 0.2s",
//                 }}
//               >
//                 <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
//                   <polyline points="15 18 9 12 15 6" />
//                 </svg>
//                 PREVIOUS
//               </button>

//               <div className="step-badge" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//                 <span
//                   style={{
//                     fontSize: "11px",
//                     textTransform: "uppercase",
//                     color: "var(--text-muted)",
//                     fontWeight: 700,
//                     marginBottom: "2px",
//                   }}
//                 >
//                   Step
//                 </span>
//                 <span
//                   style={{
//                     fontSize: "16px",
//                     fontWeight: 800,
//                     color: "var(--teal)",
//                   }}
//                 >
//                   6/25
//                 </span>
//               </div>

//               <button
//                 className="btn-navigation btn-navigation-next"
//                 onClick={() => router.push("/menu/item-deals")}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   padding: "10px 20px",
//                   background: "var(--teal)",
//                   border: "none",
//                   borderRadius: "var(--radius-md)",
//                   color: "#fff",
//                   fontSize: "13px",
//                   fontWeight: 600,
//                   cursor: "pointer",
//                   textDecoration: "none",
//                   transition: "all 0.2s",
//                 }}
//               >
//                 NEXT
//                 <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
//                   <polyline points="9 18 15 12 9 6" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Help Modal Overlay */}
//       <div className="modal-overlay" id="helpModal" style={{ display: "none" }}>
//         <div className="modal-container">
//           <div className="modal-title-bar">
//             <h3>Apply Tax Help Guide</h3>
//             <button className="modal-close-btn" data-close-help>
//               <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </button>
//           </div>
//           <div className="modal-body-content">
//             <div
//               className="help-list"
//               style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//             >
//               <div
//                 className="help-item"
//                 style={{
//                   fontSize: "14.5px",
//                   lineHeight: 1.6,
//                   color: "var(--text-secondary)",
//                   background: "#f8fafc",
//                   padding: "14px",
//                   borderRadius: "var(--radius-md)",
//                   border: "1px solid var(--border)",
//                 }}
//               >
//                 <strong>Apply Tax to Products:</strong> Toggle the checkbox next to any product to instantly apply or remove the tax.
//               </div>
//               <div
//                 className="help-item"
//                 style={{
//                   fontSize: "14.5px",
//                   lineHeight: 1.6,
//                   color: "var(--text-secondary)",
//                   background: "#f8fafc",
//                   padding: "14px",
//                   borderRadius: "var(--radius-md)",
//                   border: "1px solid var(--border)",
//                 }}
//               >
//                 <strong>Bulk Actions:</strong> Use <strong>Apply All</strong> to apply tax to all products, or <strong>Remove All</strong> to remove tax from all products.
//               </div>
//               <div
//                 className="help-item"
//                 style={{
//                   fontSize: "14.5px",
//                   lineHeight: 1.6,
//                   color: "var(--text-secondary)",
//                   background: "#f8fafc",
//                   padding: "14px",
//                   borderRadius: "var(--radius-md)",
//                   border: "1px solid var(--border)",
//                 }}
//               >
//                 <strong>Price Display:</strong> When tax is applied, you'll see the price without tax, price with tax, and the tax amount for each product.
//               </div>
//             </div>
//           </div>
//           <div
//             className="modal-footer-bar"
//             style={{
//               padding: "1.25rem 1.75rem",
//               borderTop: "1px solid var(--border)",
//               background: "#f8fafc",
//               display: "flex",
//               justifyContent: "flex-end",
//               gap: "12px",
//             }}
//           >
//             <button
//               className="btn-action btn-cancel btn-modal-cancel"
//               type="button"
//               data-close-help
//               style={{
//                 padding: "10px 20px",
//                 border: "1.5px solid var(--border-strong)",
//                 background: "#fff",
//                 borderRadius: "var(--radius-md)",
//                 color: "var(--text-secondary)",
//                 fontSize: "13.5px",
//                 fontWeight: 600,
//                 cursor: "pointer",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Toast Box */}
//       <div className="toast-box" id="toast" style={{ display: "none" }}>
//         <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2.5 }}>
//           <polyline points="20 6 9 17 4 12" />
//         </svg>
//         <span id="toastText">Changes saved successfully</span>
//       </div>
//     </div>
//   );
// }
















// ##############
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { menuService } from "@/api/services/menu.service";
import { getShopId, useShopId, isApiSuccess } from "@/utils/shop";
import "./page.css";

interface Product {
  id: number;           // This is the item_id
  item_size_id: number; // This is the specific size ID
  name: string;
  category: string;
  price: number;
  priceWithTax?: number;
  taxApplied?: boolean;

  taxList?: {
    tax_name: string;
    tax_amount: number;
    tax_perc: number;
    tax_type: number;
  }[] | null;
}

export default function ApplyTaxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taxId = searchParams.get("taxId");
  const shopId = useShopId();
  const [taxName, setTaxName] = useState<string>("");
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [taxType, setTaxType] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [, setProducts] = useState<Product[]>([]);

  const fetchTaxDetails = useCallback(async (id: number) => {
    try {
      const currentShopId = getShopId();
      const response = await menuService.getTaxes(currentShopId);

      const tax = response.find(t => t.food_shop_tax_id === id);
      if (tax) {
        setTaxName(tax.tax_name);
        setTaxPercentage(tax.tax_percentage);
        setTaxType(tax.tax_type);
      }
    } catch (error) {
      console.error("Error fetching tax details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taxId) {
      fetchTaxDetails(parseInt(taxId, 10));
    } else {
      setLoading(false);
    }
  }, [taxId, shopId, fetchTaxDetails]);

  useEffect(() => {
    const TAX_ID = taxId ? parseInt(taxId, 10) : 0;

    let sampleProducts: Product[] = [];
    let productSearchQuery = "";
    let toastTimeout: ReturnType<typeof setTimeout>;

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    async function loadProducts() {
      try {
        const activeShopId = getShopId();
        const response = await menuService.getItemListWithSize(activeShopId, TAX_ID, taxType);

        const items = response;
        sampleProducts = items.map((item: any) => ({
          id: item.item_id || 0,
          item_size_id: item.item_size_id || 0,
          name: item.size_name && item.size_name.trim() !== ''
            ? `${item.item_name} (${item.size_name})`
            : item.item_name,
          category: item.size_name && item.size_name.trim() !== '' ? item.size_name : "Default",
          price: item.item_price || 0,
          priceWithTax: item.item_price || 0,
          taxApplied: item.is_tax || false,
          taxList: item.tax_list
        }));

        setProducts(sampleProducts);
        renderProductList();
        updateProductModalCounts();
        updateSelectAllState();
      } catch (error) {
        console.error("Error loading products:", error);
        showToast("Failed to load products. Please try again.");
      }
    }

    function calculatePriceWithTax(price: number, taxPercentage: number): number {
      return price + (price * taxPercentage / 100);
    }

    function renderProductList() {
      const list = document.getElementById("productModalList");
      if (!list) return;
      const query = productSearchQuery.toLowerCase();
      const filtered = sampleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        list.innerHTML = `<div class="product-empty-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2rem;color:var(--text-muted);gap:8px;">
          <svg viewBox="0 0 24 24" style="width:40px;height:40px;opacity:0.4;" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p style="font-size:14px;font-weight:500;margin:0;">No products match your search.</p>
        </div>`;
        return;
      }

      list.innerHTML = filtered
        .map((product) => {
          const checked = product.taxApplied || false;
          const appliedTaxes = product.taxList || [];
          const priceWithoutTax = product.price;
          const priceWithTax = checked ? calculatePriceWithTax(product.price, taxPercentage) : product.price;

          return `<div class="product-item${checked ? " selected" : ""}" data-product-id="${product.id}" data-item-size-id="${product.item_size_id}" style="display:flex;align-items:center;gap:12px;padding:12px 1.75rem;cursor:pointer;border-bottom:1px solid #f1f5f9;${checked ? "background:#f0fdfa;" : ""}">
            <input type="checkbox" class="custom-checkbox" ${checked ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--teal);flex-shrink:0;">
            <div class="product-item-info" style="flex:1;min-width:0;">
              <div class="product-item-name" style="font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(product.name)}</div>
              <div class="product-item-meta" style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(product.category)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-shrink:0;">
              <div style="text-align:right;">
                <div style="font-size:11px;color:var(--text-muted);font-weight:500;">Without Tax</div>
                <span style="font-size:13px;font-weight:600;color:var(--text-secondary);font-family:var(--font-mono);">₹${priceWithoutTax.toFixed(2)}</span>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px;color:var(--text-muted);font-weight:500;">With Tax</div>
                <span style="font-size:14px;font-weight:700;color:${checked ? 'var(--teal-dark)' : 'var(--text-muted)'};font-family:var(--font-mono);">₹${priceWithTax.toFixed(2)}</span>
              </div>
              ${appliedTaxes.length ? `
              <div style="
                  display:flex;
                  flex-direction:column;
                  gap:4px;
                  min-width:110px;
                  text-align:right;
              ">
              ${appliedTaxes
                .map(
                  (tax) => `
                  <div>
                      <div style="
                          font-size:11px;
                          color:var(--text-muted);
                          font-weight:500;
                      ">
                          ${escapeHtml(tax.tax_name)} (${tax.tax_perc}%)
                      </div>

                      <div style="
                          font-size:12px;
                          font-weight:700;
                          color:var(--teal);
                      ">
                          ₹${tax.tax_amount.toFixed(2)}
                      </div>
                  </div>
              `
                )
                .join("")}
                </div>
              `
              : ""}
            </div>
          </div>`;
        })
        .join("");
    }

    async function toggleProductTax(productId: number, itemSizeId: number, rowEl: HTMLElement) {
      const product = sampleProducts.find(p => p.id === productId && p.item_size_id === itemSizeId);
      if (!product) return;

      const checkbox = rowEl.querySelector<HTMLInputElement>('input[type=checkbox]');
      const isCurrentlyApplied = product.taxApplied || false;
      const newTaxState = !isCurrentlyApplied;
      const activeShopId = getShopId();

      try {
        // Fetch current tax details for this specific item and size dynamically
        const actualSizeId = itemSizeId || 0;
        await menuService.getTaxDetailsWithSize(productId, actualSizeId);

        if (newTaxState) {
          await menuService.applyTaxToSingleItem(
            activeShopId,
            productId,
            itemSizeId,
            TAX_ID
          );
          product.taxApplied = true;
          product.priceWithTax = calculatePriceWithTax(product.price, taxPercentage);
          rowEl.classList.add("selected");
          rowEl.style.background = "#f0fdfa";
          if (checkbox) checkbox.checked = true;
          showToast(`${taxName} applied to "${product.name}"`);
        } else {
          await menuService.removeTaxFromSingleItem(
            activeShopId,
            productId,
            itemSizeId,
            TAX_ID
          );
          product.taxApplied = false;
          product.priceWithTax = product.price;
          rowEl.classList.remove("selected");
          rowEl.style.background = "";
          if (checkbox) checkbox.checked = false;
          showToast(`${taxName} removed from "${product.name}"`);
        }

        await loadProducts();
      } catch (err) {
        console.error("Error toggling tax:", err);
        showToast("Failed to update tax. Please try again.");
        if (checkbox) checkbox.checked = isCurrentlyApplied;
      }
    }

    function updateSelectAllState() {
      const selectAll = document.getElementById("selectAllProducts") as HTMLInputElement | null;
      if (!selectAll) return;
      const allChecked = sampleProducts.every(p => p.taxApplied);
      const someChecked = sampleProducts.some(p => p.taxApplied);
      selectAll.checked = allChecked;
      selectAll.indeterminate = !allChecked && someChecked;
    }

    function toggleSelectAll(checkbox: HTMLInputElement) {
      const shouldApply = checkbox.checked;

      if (shouldApply) {
        applyAllProducts();
      } else {
        removeAllProducts();
      }
    }

    function filterProducts() {
      const input = document.getElementById(
        "productSearchInput"
      ) as HTMLInputElement | null;
      productSearchQuery = input ? input.value.trim() : "";
      renderProductList();
    }

    async function applyAllProducts() {
      try {
        const activeShopId = getShopId();
        const response = await menuService.addTaxAllItemWithTaxID(activeShopId, TAX_ID);

        if (isApiSuccess(response)) {
          sampleProducts.forEach((p) => {
            p.taxApplied = true;
            p.priceWithTax = calculatePriceWithTax(p.price, taxPercentage);
          });
          showToast(response?.message || `${taxName || 'Tax'} applied to all products successfully.`);
        } else {
          showToast(response?.message || "Failed to apply tax to all products.");
        }

        await loadProducts();
      } catch (err: any) {
        console.error("Error calling USP_AddTaxAllItemWithTaxID:", err);
        showToast(err?.message || "Failed to apply tax.");
      }
    }

    async function removeAllProducts() {
      try {
        const activeShopId = getShopId();
        const response = await menuService.deleteTaxAllItemWithTaxID(activeShopId, TAX_ID);
        if (isApiSuccess(response)) {
          sampleProducts.forEach((p) => {
            p.taxApplied = false;
            p.priceWithTax = p.price;
          });
          showToast(response?.message || `${taxName || 'Tax'} removed from all products successfully.`);
        } else {
          showToast(response?.message || "Failed to remove tax from all products.");
        }

        await loadProducts();
      } catch (err: any) {
        console.error("Error calling USP_DeleteTaxAllItemWithTaxID:", err);
        showToast(err?.message || "Failed to remove tax.");
      }
    }

    function updateProductModalCounts() {
      const count = sampleProducts.filter(p => p.taxApplied).length;
      const selCount = document.getElementById("productSelectedCount");
      const footerCount = document.getElementById("footerSelectedCount");
      if (selCount) selCount.textContent = `${count} selected`;
      if (footerCount) footerCount.textContent = String(count);
    }

    function openHelpModal() {
      const modal = document.getElementById("helpModal");
      if (!modal) return;
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show"), 10);
    }

    function closeHelpModal() {
      const modal = document.getElementById("helpModal");
      if (!modal) return;
      modal.classList.remove("show");
      setTimeout(() => (modal.style.display = "none"), 200);
    }

    function showToast(message: string) {
      const toast = document.getElementById("toast");
      const toastText = document.getElementById("toastText");
      if (!toast || !toastText) return;
      toastText.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
    }

    // ── Wire listeners ──
    const searchInput = document.getElementById(
      "productSearchInput"
    ) as HTMLInputElement | null;
    const selectAllCb = document.getElementById(
      "selectAllProducts"
    ) as HTMLInputElement | null;
    const applyAllBtn = document.getElementById("applyAllBtn");
    const removeAllBtn = document.getElementById("removeAllBtn");
    const helpBtn = document.getElementById("helpBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const closeHelpBtns = document.querySelectorAll<HTMLButtonElement>(
      "[data-close-help]"
    );
    const productList = document.getElementById("productModalList");

    const onSelectAllChange = (e: Event) =>
      toggleSelectAll(e.target as HTMLInputElement);

    const onListClick = (e: Event) => {
      const targetEl = e.target as HTMLElement;
      const row = targetEl.closest<HTMLElement>(".product-item");
      if (!row) return;
      const productId = parseInt(row.getAttribute("data-product-id") || "0");
      const itemSizeId = parseInt(row.getAttribute("data-item-size-id") || "0");

      // If clicking on the checkbox itself, let it handle normally
      // But we still need to toggle the tax
      if (targetEl.matches('input[type=checkbox]')) {
        e.stopPropagation();
        // The checkbox will toggle visually, but we need to control the state
        // The toggleProductTax will handle the actual tax apply/remove
      }
      toggleProductTax(productId, itemSizeId, row);
    };
    searchInput?.addEventListener("input", filterProducts);
    selectAllCb?.addEventListener("change", onSelectAllChange);
    applyAllBtn?.addEventListener("click", applyAllProducts);
    removeAllBtn?.addEventListener("click", removeAllProducts);
    helpBtn?.addEventListener("click", openHelpModal);
    cancelBtn?.addEventListener("click", () => {
      router.push("/menu/tax");
    });
    closeHelpBtns.forEach((b) => b.addEventListener("click", closeHelpModal));
    productList?.addEventListener("click", onListClick);

    const onWindowClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".topbar-dropdown")) {
        document
          .querySelectorAll<HTMLElement>(".dropdown-menu")
          .forEach((menu) => menu.classList.remove("show"));
      }
    };
    window.addEventListener("click", onWindowClick);

    loadProducts();

    return () => {
      clearTimeout(toastTimeout);
      searchInput?.removeEventListener("input", filterProducts);
      selectAllCb?.removeEventListener("change", onSelectAllChange);
      applyAllBtn?.removeEventListener("click", applyAllProducts);
      removeAllBtn?.removeEventListener("click", removeAllProducts);
      helpBtn?.removeEventListener("click", openHelpModal);
      closeHelpBtns.forEach((b) =>
        b.removeEventListener("click", closeHelpModal)
      );
      productList?.removeEventListener("click", onListClick);
      window.removeEventListener("click", onWindowClick);
    };
  }, [taxId, shopId, router]);

  // Loading state
  // if (loading) {
  //   return (
  //     <div id="pg-menu-apply-tax">
  //       <div className="app-container">
  //         <div className="content-area">
  //           <div style={{ textAlign: "center", padding: "50px" }}>
  //             <div className="spinner"></div>
  //             <p>Loading tax details...</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const pageTitle = taxName ? `Apply Tax: ${taxName}` : "Apply Tax to Products";

  return (
    <div id="pg-menu-apply-tax">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner"></div>
          <p>Loading tax details...</p>
        </div>
      )}

      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="apply-card">
              <div
                className="apply-header"
                style={{
                  background: "#fafbfe",
                  borderBottom: "1px solid var(--border)",
                  padding: "1.5rem 1.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="product-modal-title-group">
                  <h1
                    className="apply-title typ-page-heading"
                    style={{ margin: 0 }}
                  >
                    {pageTitle}
                  </h1>
                  <span
                    className="product-modal-subtitle"
                    id="applyTaxModalSubtitle"
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Toggle checkbox to apply/remove tax from products
                  </span>
                </div>
                <button className="btn-help" id="helpBtn">
                  <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              <div
                className="product-modal-toolbar"
                style={{
                  padding: "1rem 1.75rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  className="product-search-wrap"
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      position: "absolute",
                      left: "12px",
                      width: "15px",
                      height: "15px",
                      stroke: "var(--text-muted)",
                      fill: "none",
                      strokeWidth: 2.2,
                      pointerEvents: "none",
                    }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="product-search-input"
                    id="productSearchInput"
                    placeholder="Search products..."
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 36px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "13.5px",
                      fontFamily: "var(--font)",
                      color: "var(--text-primary)",
                      background: "var(--bg)",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  className="product-modal-bulk-actions"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <button
                    className="btn-bulk btn-bulk-apply"
                    id="applyAllBtn"
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      fontFamily: "var(--font)",
                      cursor: "pointer",
                      border: "1.5px solid var(--teal)",
                      background: "var(--teal-light)",
                      color: "var(--teal-dark)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "12px",
                        height: "12px",
                        display: "inline",
                        stroke: "currentColor",
                        fill: "none",
                        strokeWidth: 2.5,
                        strokeLinecap: "round",
                        verticalAlign: "middle",
                        marginRight: "4px",
                      }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Apply All
                  </button>
                  <button
                    className="btn-bulk btn-bulk-remove"
                    id="removeAllBtn"
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      fontFamily: "var(--font)",
                      cursor: "pointer",
                      border: "1.5px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#dc2626",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "12px",
                        height: "12px",
                        display: "inline",
                        stroke: "currentColor",
                        fill: "none",
                        strokeWidth: 2.5,
                        strokeLinecap: "round",
                        verticalAlign: "middle",
                        marginRight: "4px",
                      }}
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Remove All
                  </button>
                </div>
              </div>

              <div
                className="product-modal-selectall"
                style={{
                  padding: "0.6rem 1.75rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#f8fafc",
                }}
              >
                <label
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    id="selectAllProducts"
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "var(--teal)",
                    }}
                  />
                  Select All Products
                </label>
                <span
                  className="product-modal-count"
                  id="productSelectedCount"
                  style={{
                    marginLeft: "auto",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  0 selected
                </span>
              </div>

              <div
                className="product-modal-list"
                id="productModalList"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  padding: "0.5rem 0",
                }}
              >
                {/* Rendered by JS */}
              </div>

              <div
                className="product-modal-footer"
                style={{
                  padding: "1.1rem 1.75rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  background: "#fafbfe",
                }}
              >
                <span
                  className="product-modal-footer-info"
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  <strong
                    id="footerSelectedCount"
                    style={{ color: "var(--teal-dark)", fontWeight: 800 }}
                  >
                    0
                  </strong>{" "}
                  product(s) with {taxName || "tax"} applied
                </span>
                <div
                  className="product-modal-footer-actions"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    className="btn-action btn-cancel"
                    id="cancelBtn"
                    style={{
                      padding: "10px 20px",
                      border: "1.5px solid var(--border-strong)",
                      background: "#fff",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-secondary)",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            <div className="nav-row">
              <button
                className="btn-navigation btn-navigation-prev"
                onClick={() => router.push("/menu/tax")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                PREVIOUS
              </button>

              <div className="step-badge" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    marginBottom: "2px",
                  }}
                >
                  Step
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--teal)",
                  }}
                >
                  6/25
                </span>
              </div>

              <button
                className="btn-navigation btn-navigation-next"
                onClick={() => router.push("/menu/item-deals")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background: "var(--teal)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                NEXT
                <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="helpModal" style={{ display: "none" }}>
        <div className="modal-container">
          <div className="modal-title-bar">
            <h3>Apply Tax Help Guide</h3>
            <button className="modal-close-btn" data-close-help>
              <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="modal-body-content">
            <div
              className="help-list"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                className="help-item"
                style={{
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Apply Tax to Products:</strong> Toggle the checkbox next to any product to instantly apply or remove the tax.
              </div>
              <div
                className="help-item"
                style={{
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Bulk Actions:</strong> Use <strong>Apply All</strong> to apply tax to all products, or <strong>Remove All</strong> to remove tax from all products.
              </div>
              <div
                className="help-item"
                style={{
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Price Display:</strong> When tax is applied, you'll see the price without tax, price with tax, and the tax amount for each product.
              </div>
            </div>
          </div>
          <div
            className="modal-footer-bar"
            style={{
              padding: "1.25rem 1.75rem",
              borderTop: "1px solid var(--border)",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              className="btn-action btn-cancel btn-modal-cancel"
              type="button"
              data-close-help
              style={{
                padding: "10px 20px",
                border: "1.5px solid var(--border-strong)",
                background: "#fff",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="toast-box" id="toast" style={{ display: "none" }}>
        <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "none", stroke: "currentColor", strokeWidth: 2.5 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toastText">Changes saved successfully</span>
      </div>
    </div>
  );
}