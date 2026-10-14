# AUDIT: FoodChow Redesign vs Live .NET Admin Parity

**Audit Date**: October 2026  
**Live Application**: `https://admin.foodchow.com/food-demo/Admin`  
**Redesign Codebase**: `Admin/Admin/fc_next/foodchow_design_next`  
**API Baseline**: Live FoodChow API (`api.foodchow.com` / `admin.foodchow.com`)

---

## 1. Feature Parity Matrix (Post-Fix Status)

| Area / Feature | On Live Admin (.NET) | In Redesign (Next.js) | Status | Notes & Resolutions Applied |
|---|---|---|---|---|
| **1. Pricing Plan Page** | Displays plans (Growth, POS Lite/Premium, Online Ordering Fixed/Commission, Add-ons) with currency from session `Session["shopcurrency"]`. Prices dynamically formatted according to shop currency (e.g. ₹ vs $ vs A$ etc.). Real subscription creation checkout flow. | `/menu/pricing-plan` fetches from `menuService.getPlanDetails(id, currency)` and `getAddOns(currency)`. | **Match** | Connected to session storage currency keys (`shopcurrency` / `currency`). Cart totals, add-ons, plan pricing, and checkout button reflect dynamic session currency. |
| **2. My Plan Page** | Displays current restaurant subscription plan, active status, plan type, start/end dates, charge amount with currency, invoice link, cancel/upgrade triggers. | `/menu/my-plan` fetches subscription info from `setupService.getRestaurantInformation` and invoices. | **Match** | Uses active session currency helper with auto-recovery from restaurant profile if storage key is unset. Currency amounts formatted cleanly without hardcoded symbols. |
| **3. Menu: Items List, Sizes, Edit/Create** | Categorized food item listing with pagination, search, status toggle, variant sizes with distinct price inputs. Taxes applied display inclusive item price when tax is configured. | `/menu/items` lists items with `ReportPagination`, search, filter, edit modal, quick edit modal, and image upload. | **Match** | 1. Removed all hardcoded `"Rs."` / `"₹"` strings and integrated `useSessionCurrency`.<br>2. Variant size prices in Quick Edit, Add Item, and Edit Item modals are editable and individually persist to `updateStoreItem` with `FoodItemSizeList`.<br>3. Responsive layout and modal overflow constraints resolved. |
| **4. Menu Language** | Select Single vs Dual language menu. Primary and secondary language dropdowns populated from live API `GetSupportedLanguages` and `GetAllLanguage`. Saves to `AddEditLanguage`. | `/menu/menu-language-page` implemented with dual/single toggle and language dropdowns. | **Match** | Connected to live API endpoints with save confirmation. |
| **5. Additional Menu** | Create multiple menu types (e.g., Breakfast, Lunch, Dinner, Drinks) with day/time schedules and item mappings. QR code generator modal. | `/menu/additional-menu` implemented with full 2-step wizard, expand/collapse categories, time pickers, and QR code view. | **Match** | Connected to live API `GetAllShopMenuType`, `GetItemsForMenuType`, `AddShopMenuType`. |
| **6. Menu Upload** | Option 1: Manual entry. Option 2: Excel upload. Download sample Excel sheet (`SampleMenu.xlsx`), upload file, validate, submit to server endpoint. | `/menu/upload-menu` implemented with choose mode (Manual / Excel) and upload form with `downloadSampleMenuExcel` and `uploadMenuExcel`. | **Match** | Auto-retrieves shop ID using `getShopId()`. Validates file selection, provides animated SweetAlert feedback on success and failure, and redirects to `/menu/items` upon successful upload. |
| **7. Item Codes** | Auto-sequences unassigned item codes with sequential numbers (+1 per item) as visual display without saving to DB. Only updates DB when user clicks "SAVE". Duplicate check. Supports Numeric (0) & Alphanumeric (1). | `/menu/item-code` displays unassigned item codes in client memory sequence (`idx + 1` or `max + 1`). | **Match** | API is NOT called until the user explicitly clicks "SAVE". Preserves manual edits and guards against duplicates. Uses `ReportPagination` with entries per page selector. |
| **8. Taxes (Tax & Apply Tax)** | Tax creation (Inclusive vs Exclusive, Tax Rate %). Apply Tax page (`/FoodShopTax` or `/ApplyTax`) maps taxes to products/sizes. Displays item prices with tax. Currency comes from `Session["shopcurrency"]`. | `/menu/tax` and `/menu/apply-tax`. | **Match** | Replaced hardcoded currency symbols with dynamic session currency in live preview boxes, without-tax/with-tax product columns, and applied tax breakdown tags. |
| **9. Pagination System** | Standardized pagination with page size selector (10, 25, 50, 100), total count text "Showing X to Y of Z entries", Next/Prev, and numbered sliding page window. | Reusable `ReportPagination` component with identical styling. | **Match** | Unified across `/menu/items`, `/menu/item-code`, `/menu/category`, and `/menu/extra` with `pageSizeOptions={[10, 25, 50, 100]}` and dynamic page size selection. |

---

## 2. Screens with Unified Pagination
1. **`/menu/items`**: Uses `ReportPagination` with page size selector (10, 25, 50, 100) and page jump navigation.
2. **`/menu/item-code`**: Uses `ReportPagination` with page size selector (10, 25, 50, 100) and entry count tracking.
3. **`/menu/category`**: Uses `ReportPagination` with page size selector (10, 25, 50, 100) and dynamic `pageSize` state.
4. **`/menu/extra`**: Uses `ReportPagination` with page size selector (10, 25, 50, 100).
5. **`/menu/tax`**: Uses `ReportPagination` across Table and Grid views with page size selector (10, 25, 50, 100) and responsive page navigation.

---

## 3. Implementation Verification & Test Cases Summary

- **Session Currency Test**:
  - Tested with `shopcurrency = USD`, `AUD`, `EUR`, `GBP`, `INR` / `Rs.`. Verified helper formats numbers with proper locale formatting (`en-IN` for INR, `en-US` for others) and correct symbol. Fallback loads restaurant details via `setupService.getRestaurantInformation`.
- **Item Codes Sequencing Test**:
  - No item codes present: Prefills `1, 2, 3, ...` in display inputs without triggering network PUT/POST calls.
  - Partial item codes present: Continues from `max(code) + 1` for blank items; preserves manual user inputs; blocks duplicate submissions.
  - Click "SAVE": Submits assigned codes payload to `menuService.updateItemCode`.
- **Item Size Prices & Taxes Test**:
  - Size prices are individually editable in both the Quick Edit grid and the item edit modal.
  - Save operation persists all size entries into `FoodItemSizeList` with validation for non-negative numerical values.
  - All currency badges dynamically reflect active currency symbol.
- **Menu Upload Flow Test**:
  - Validates missing file and missing shop ID gracefully.
  - Downloads sample `SampleMenu.xlsx` blob cleanly.
  - Successful upload displays confirmation dialog and smoothly navigates to `/menu/items`.
- **TypeScript & Build Verification**:
  - `npx tsc --noEmit` exits with code 0 (clean compilation with zero errors).
