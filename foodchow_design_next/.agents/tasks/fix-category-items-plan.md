# Implementation Plan: Fix Category & Items Pages

## Confirmed Endpoint Reference (from MenuMasterController.cs)

| Action                    | Method | Path                                         | Key Params / Body Fields                                                           |
|---------------------------|--------|----------------------------------------------|------------------------------------------------------------------------------------|
| Add / Edit Category       | POST   | `/MenuMaster/AddStoreCategory`               | `{ id, shop_id, cate_name, cate_image, description, parent_id }`                  |
| Delete Category           | GET    | `/MenuMaster/DeleteCategory`                 | `?CateID={id}`                                                                     |
| Change Category Status    | GET    | `/MenuMaster/ChangeStoreCategoryStatus`      | `?cate_id={id}&status={0\|1}`                                                      |
| Edit Item                 | POST   | `/MenuMaster/EditStoreItem`                  | `{ Item_Id, Cate_Id, Item_Name, Description, Is_Veg, barcode, base64Image, Item_Image }` |
| Change Item Status        | GET    | `/MenuMaster/ChangeStoreItemStatus`          | `?ItemId={id}&status={0\|1}`                                                       |
| Delete Item               | GET    | `/MenuMaster/DeleteStoreItem`                | `?ItemId={id}&shop_id={shopId}` ← already wired                                   |

> **Note:** The existing `changeCategoryStatus` in `menu.service.ts` calls
> `ChangeStoreItemExtraCategoryStatus` with `extra_category_id` — that is for
> **extras categories**, not store categories. New distinct methods must be
> created for the three store-category endpoints above.

---

## Step 1 — Add new endpoints to `endpoints.ts`

**What:** Add five new keys under `menu` in `ENDPOINTS`.

**File:** `src/api/endpoints.ts`

Add inside the `menu` block (after `deleteItem`):

```ts
// Store Category CRUD
addStoreCategory:   "/MenuMaster/AddStoreCategory",
deleteCategory:     "/MenuMaster/DeleteCategory",
changeStoreCategoryStatus: "/MenuMaster/ChangeStoreCategoryStatus",

// Store Item CRUD
editStoreItem:      "/MenuMaster/EditStoreItem",
changeStoreItemStatus: "/MenuMaster/ChangeStoreItemStatus",
```

**Verify:** Run `npx tsc --noEmit` from
`c:\Users\Tenacious Techies\Desktop\vnew\Admin\fc_next\foodchow_design_next`
— zero type errors.

---

## Step 2 — Add new service methods to `menu.service.ts`

**What:** Add three category-related methods and two item-related methods to `menuService`.

**File:** `src/api/services/menu.service.ts`

### 2a — Add the `AddStoreCategoryPayload` interface (near other category types, after `MenuCategory`):

```ts
export interface AddStoreCategoryPayload {
  id: number;           // 0 = insert, >0 = update
  shop_id: number;
  cate_name: string;
  cate_image: string;   // base64 string or existing URL, empty string = no image
  description: string;
  parent_id: number;
}
```

### 2b — Add the `EditStoreItemPayload` interface (near `AddItemPayload`):

```ts
export interface EditStoreItemPayload {
  Item_Id: number;
  Cate_Id: number;
  Item_Name: string;
  Description: string;
  Is_Veg: number;
  barcode: string;
  base64Image: string;  // base64 without data URI prefix, or empty string
  Item_Image: string;   // existing image filename/path (used when base64Image is empty)
}
```

### 2c — Add service methods inside `menuService` (after the existing `deleteItem` method):

```ts
/** Add a new store category (id=0) or update an existing one (id>0) */
async addStoreCategory(payload: AddStoreCategoryPayload): Promise<any> {
  const { data } = await foodchowClient.post(
    ENDPOINTS.menu.addStoreCategory,
    payload
  );
  return data;
},

/** Delete a store category by id */
async deleteCategory(cateId: number): Promise<any> {
  const { data } = await foodchowClient.get(
    ENDPOINTS.menu.deleteCategory,
    { params: { CateID: cateId } }
  );
  return data;
},

/** Activate (status=1) or deactivate (status=0) a store category */
async changeStoreCategoryStatus(cateId: number, status: number): Promise<any> {
  const { data } = await foodchowClient.get(
    ENDPOINTS.menu.changeStoreCategoryStatus,
    { params: { cate_id: cateId, status } }
  );
  return data;
},

/** Edit an existing store item */
async editStoreItem(payload: EditStoreItemPayload): Promise<any> {
  const { data } = await foodchowClient.post(
    ENDPOINTS.menu.editStoreItem,
    payload
  );
  return data;
},

/** Activate (status=1) or deactivate (status=0) a store item */
async changeStoreItemStatus(itemId: number, status: number): Promise<any> {
  const { data } = await foodchowClient.get(
    ENDPOINTS.menu.changeStoreItemStatus,
    { params: { ItemId: itemId, status } }
  );
  return data;
},
```

**Verify:** `npx tsc --noEmit` — zero type errors.

---

## Step 3 — Rewrite the Category page (`page.tsx`) — pure React state

**What:** Replace all DOM-manipulation–based edit/delete/toggle handlers inside the big `useEffect` with React state + handlers, and convert both modals from `classList.add('open')` to controlled rendering. The crop-modal drag logic stays in the `useEffect` but is bridged to React state via a ref.

**File:** `src/app/(admin)/menu/category/page.tsx`

### 3a — Add React state variables (after existing `page` state)

```tsx
// Edit modal state
const [editOpen, setEditOpen] = useState(false);
const [editCategory, setEditCategory] = useState<{
  id: number;
  cate_name: string;
  cate_image: string;
  status: number;
} | null>(null);
const [catName, setCatName] = useState("");
const [catStatus, setCatStatus] = useState<"active" | "deactive">("active");
const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
const [saving, setSaving] = useState(false);

// Delete modal state
const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
const [deleting, setDeleting] = useState(false);

// Ref so the useEffect crop logic can push the cropped base64 back to React state
const setEditImagePreviewRef = useRef(setEditImagePreview);
useEffect(() => { setEditImagePreviewRef.current = setEditImagePreview; }, [setEditImagePreview]);
```

### 3b — Add React handlers (before the JSX `return`)

```tsx
// Open edit modal — pre-fills from the clicked category object
function handleEdit(cat: MenuCategory) {
  setEditCategory({ id: cat.id, cate_name: cat.cate_name, cate_image: cat.cate_image, status: cat.status });
  setCatName(cat.cate_name);
  setCatStatus(cat.status === 1 ? "active" : "deactive");
  setEditImagePreview(cat.cate_image || null);
  setEditOpen(true);
}

// Save changes — POST /MenuMaster/AddStoreCategory
async function handleSave() {
  if (!editCategory) return;
  const trimmedName = catName.trim();
  if (!trimmedName) {
    alert("Category name is required.");
    return;
  }
  setSaving(true);
  try {
    await menuService.addStoreCategory({
      id: editCategory.id,
      shop_id: SHOP_ID,
      cate_name: trimmedName,
      cate_image: editImagePreview ?? "",
      description: "",
      parent_id: 0,
    });
    // Update the category in local state so the table reflects the change immediately
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editCategory.id
          ? { ...c, cate_name: trimmedName, cate_image: editImagePreview ?? "", status: catStatus === "active" ? 1 : 0 }
          : c
      )
    );
    setEditOpen(false);
  } catch {
    alert("Failed to save category. Please try again.");
  } finally {
    setSaving(false);
  }
}

// Open delete confirmation modal
function handleDelete(cat: MenuCategory) {
  setDeleteTarget(cat);
  setDeleteOpen(true);
}

// Confirm delete — GET /MenuMaster/DeleteCategory?CateID={id}
async function handleConfirmDelete() {
  if (!deleteTarget) return;
  setDeleting(true);
  try {
    const res = await menuService.deleteCategory(deleteTarget.id);
    if (res?.message === "Item Available In This Category") {
      alert("Cannot delete: this category has items. Remove items first.");
      setDeleteOpen(false);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteOpen(false);
  } catch {
    alert("Failed to delete category. Please try again.");
  } finally {
    setDeleting(false);
  }
}

// Toggle active/inactive — GET /MenuMaster/ChangeStoreCategoryStatus?cate_id={id}&status={0|1}
async function handleToggle(cat: MenuCategory) {
  const newStatus = cat.status === 1 ? 0 : 1;
  // Optimistically update UI
  setCategories((prev) =>
    prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
  );
  try {
    await menuService.changeStoreCategoryStatus(cat.id, newStatus);
  } catch {
    // Roll back on failure
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, status: cat.status } : c))
    );
    alert("Failed to update status.");
  }
}
```

### 3c — Bridge crop modal to React state

Inside the `useEffect`, after the `applyCrop()` function sets `prev.src = src`:

```ts
// After: if (prev) { prev.src = src; prev.style.display = "block"; }
setEditImagePreviewRef.current(src);
```

This ensures the cropped base64 is captured into `editImagePreview` state so `handleSave()` can read it.

### 3d — Remove DOM-manipulation handlers from the `useEffect`

Remove these handlers and their `addEventListener` / `removeEventListener` pairs from the `useEffect`:
- `openEditModal` function and `onTableClick` delegation (`.edit-btn`, `.delete-btn`)
- `openDeleteModal` function
- `onSave` handler and its `saveCatBtn` listener
- `onConfirmDelete` handler and its `confirmDeleteBtn` listener
- The toggle switch handler inside `onTableClick`

Keep in the `useEffect`:
- `onSearch` (search input filter)
- `onSelectAll`, `onDeleteAll` (bulk selection)
- `onOpenAdd` (opens the Add modal — still DOM-controlled for the "add new" flow, or convert separately)
- Crop modal drag/resize and `applyCrop` logic
- Keyboard `Escape` handler (update it to also call `setEditOpen(false)` and `setDeleteOpen(false)`)

> **Decision:** The "Add New Category" button keeps its current `useEffect`-based
> modal open logic for now (it calls `menuService.addStoreCategory` with `id: 0`
> via a new onSave path). If the team wants it fully React-controlled that is a
> follow-up task; it is out of scope here since the user's bug reports are all
> about editing, deleting, toggling, and category names not updating.

### 3e — Update JSX table rows

Replace the static button/toggle JSX inside `pagedCategories.map(...)`:

```tsx
{/* Edit button */}
<button
  className="icon-btn edit-btn"
  title="Edit Category"
  onClick={() => handleEdit(cat)}
>
  {/* ...existing svg... */}
</button>

{/* Delete button */}
<button
  className="icon-btn delete-btn"
  title="Delete Category"
  onClick={() => handleDelete(cat)}
>
  {/* ...existing svg... */}
</button>

{/* Toggle — controlled, with title tooltip */}
<label
  className="toggle-switch"
  title={cat.status === 1 ? "DeActivate Category" : "Activate Category"}
>
  <input
    type="checkbox"
    checked={cat.status === 1}
    onChange={() => handleToggle(cat)}
  />
  <span className="slider"></span>
</label>
```

### 3f — Convert the Edit modal to React-controlled

Replace:
```tsx
<div className="modal-overlay" id="catModal">
```
with:
```tsx
<div className={`modal-overlay${editOpen ? " open" : ""}`} id="catModal">
```

Inside the modal:
- Replace `<input className="form-input" type="text" id="catNameInput" ...>` with a controlled input:
  ```tsx
  <input
    className="form-input"
    type="text"
    id="catNameInput"
    value={catName}
    onChange={(e) => setCatName(e.target.value)}
    placeholder="e.g. Italian, Mexican, Thai..."
  />
  ```
- Replace static radio buttons with controlled ones:
  ```tsx
  <input type="radio" name="catStatus" value="active"
    checked={catStatus === "active"}
    onChange={() => setCatStatus("active")} /> Active
  <input type="radio" name="catStatus" value="deactive"
    checked={catStatus === "deactive"}
    onChange={() => setCatStatus("deactive")} /> De-Active
  ```
- Add a "Delete Image" button in the image section (renders only when `editImagePreview` is not null):
  ```tsx
  {editImagePreview && (
    <button
      type="button"
      className="btn-cancel-modal"
      style={{ marginTop: 8 }}
      onClick={() => { setEditImagePreview(null); }}
    >
      DELETE IMAGE
    </button>
  )}
  ```
- The `<img id="previewImg">` inside `#imgPreview` must also show `editImagePreview` when set:
  ```tsx
  <img
    id="previewImg"
    alt="preview"
    src={editImagePreview ?? ""}
    style={{ display: editImagePreview ? "block" : "none" }}
  />
  ```
- Wire the Save button's `onClick` to `handleSave` and show the saving state:
  ```tsx
  <button className="btn-add" id="saveCatBtn" onClick={handleSave} disabled={saving}>
    {saving ? "SAVING…" : editCategory ? "SAVE" : "ADD"}
  </button>
  ```
- Wire the close/cancel buttons to `setEditOpen(false)`:
  ```tsx
  <button className="modal-close" id="modalClose" onClick={() => setEditOpen(false)}>
  <button className="btn-cancel-modal" id="cancelBtn" onClick={() => setEditOpen(false)}>
  ```
- Wire backdrop click: `onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}`

### 3g — Convert the Delete modal to React-controlled

Replace:
```tsx
<div className="modal-overlay" id="deleteModal">
```
with:
```tsx
<div className={`modal-overlay${deleteOpen ? " open" : ""}`} id="deleteModal">
```

Update the message paragraph:
```tsx
<p id="deleteModalMsg">
  Are you sure you want to delete "{deleteTarget?.cate_name}"? This action cannot be undone.
</p>
```

Wire buttons:
```tsx
<button className="btn-del-confirm" onClick={handleConfirmDelete} disabled={deleting}>
  {deleting ? "DELETING…" : "DELETE"}
</button>
<button className="btn-cancel-modal" onClick={() => setDeleteOpen(false)}>
  CANCEL
</button>
```

**Verify:** `npx tsc --noEmit` — zero type errors. Then open the page in the
browser, open the network tab, click Edit on a category, change the name, click
Save — confirm the `POST /MenuMaster/AddStoreCategory` call fires with the
correct body and the table row name updates without a page reload. Click Delete —
confirm `GET /MenuMaster/DeleteCategory?CateID=…` fires. Click the toggle —
confirm `GET /MenuMaster/ChangeStoreCategoryStatus?cate_id=…&status=…` fires.

---

## Step 4 — Fix the Items page (`items/page.tsx`) — wire Edit API + status toggle + tooltips

### 4a — Add React state for the edit form

Currently the edit form is entirely DOM-driven. Add the following React state
variables (after existing state declarations):

```tsx
// Edit item state
const [editItemId, setEditItemId] = useState<number | null>(null);
const [editCateId, setEditCateId] = useState<number>(0);
const [editItemImage, setEditItemImage] = useState<string>("");       // existing filename
const [editBase64Image, setEditBase64Image] = useState<string>("");   // new cropped base64
const [updatingItem, setUpdatingItem] = useState(false);
const [togglingItemId, setTogglingItemId] = useState<number | null>(null);

// Ref so the useEffect crop logic can push the cropped base64 back to React
const setEditBase64ImageRef = useRef(setEditBase64Image);
useEffect(() => { setEditBase64ImageRef.current = setEditBase64Image; }, [setEditBase64Image]);
```

### 4b — Bridge the upload/crop modal to React state

Inside the `useEffect`, in the `cropUploadHandler` when `currentAddImgBtn === "edit-form"`:

```ts
// After setting editThumbFrame innerHTML, also push the base64 to React:
setEditBase64ImageRef.current(ucmPreviewImg.src.replace(/^data:image\/[a-z]+;base64,/, ""));
```

### 4c — Populate edit state when opening the edit panel

Inside `editClickHandler`, after setting the DOM input values, read the row's
data attributes to capture `itemId`, `cateId`, and `itemImage`:

```ts
const itemId = Number(currentEditRow.dataset.itemId ?? "0");
const cateId = Number(currentEditRow.dataset.cateId ?? "0");
const itemImage = currentEditRow.dataset.itemImage ?? "";
setEditItemId(itemId);
setEditCateId(cateId);
setEditItemImage(itemImage);
setEditBase64Image("");  // clear any previous crop
```

This requires table rows to have these data attributes — see step 4f.

### 4d — Replace the DOM-only `updateItemHandler` with an API-calling handler

Replace the existing `updateItemHandler` function in the `useEffect` with a
React-aware version. Remove the `updateItemFormBtn` event listener from the
`useEffect` and add a `handleUpdateItem` function before the JSX `return`:

```tsx
async function handleUpdateItem() {
  if (editItemId === null) return;
  const newName = (document.getElementById("editItemNameInput") as HTMLInputElement | null)?.value.trim() ?? "";
  const newDesc = (document.getElementById("editItemDescInput") as HTMLTextAreaElement | null)?.value.trim() ?? "";
  const isVegActive = document.getElementById("editTypeVegBtn")?.classList.contains("active-segment") ?? true;

  if (!newName) {
    alert("Item name is required.");
    return;
  }

  setUpdatingItem(true);
  try {
    await menuService.editStoreItem({
      Item_Id: editItemId,
      Cate_Id: editCateId,
      Item_Name: newName,
      Description: newDesc,
      Is_Veg: isVegActive ? 1 : 0,
      barcode: "",
      base64Image: editBase64Image,
      Item_Image: editItemImage,
    });
    // Refresh items from API so the table shows updated data
    const data = await menuService.getItems(SHOP_ID);
    setItems(data);
    // Switch back to list view (DOM toggle)
    document.getElementById("editItemFormView")?.classList.remove("active-view");
    document.getElementById("mainDirectoryView")?.classList.add("active-view");
  } catch {
    alert("Failed to update item. Please try again.");
  } finally {
    setUpdatingItem(false);
  }
}
```

Wire this to the button in JSX (step 4e).

### 4e — JSX changes for the items table rows and edit button

The `updateItemFormBtn` button (rendered in JSX) must call `handleUpdateItem`:

```tsx
<button
  id="updateItemFormBtn"
  onClick={handleUpdateItem}
  disabled={updatingItem}
>
  {updatingItem ? "SAVING…" : "UPDATE ITEM"}
</button>
```

### 4f — Add data attributes and class names to item table rows

The current item rows rendered in `items.map(...)` are missing `data-item-id`,
`data-cate-id`, `data-item-image` attributes needed by `editClickHandler`, and
`item-name` / `item-price` class names needed by the search/filter `useEffect`.

Find the JSX for the items table rows (the inner map over `category.item_list`)
and update every `<tr>` and its cells:

```tsx
<tr
  key={item.Item_Id}
  data-item-id={item.Item_Id}
  data-cate-id={item.Cate_Id}
  data-item-image={item.Item_Image ?? ""}
  data-category={category.cate_name}
>
  {/* image cell */}
  <td>
    <div className="placeholder-img">
      {item.Item_Image
        ? <img src={item.Item_Image} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4 }} />
        : null}
    </div>
  </td>
  {/* name cell — class name required by quickEdit and search */}
  <td><span className="item-name">{item.Item_Name}</span></td>
  {/* price cell */}
  <td><span className="item-price">Rs.{item.price ?? 0}</span></td>
  {/* action cell */}
  <td>
    <button className="btn-edit" title="Edit Item">Edit</button>
    <button
      title="Delete Item"
      onClick={() => handleDelete(item.Item_Id)}
    >Delete</button>
    <label
      className="switch"
      title={item.Status === 1 ? "DeActivate Item" : "Activate Item"}
    >
      <input
        type="checkbox"
        checked={item.Status === 1}
        disabled={togglingItemId === item.Item_Id}
        onChange={() => handleToggleItem(item.Item_Id, item.Status, category)}
      />
      <span></span>
    </label>
  </td>
</tr>
```

> Note: `item.Status` (capital S) matches the `ItemModelDTO` field `Status` as
> returned by `GetItemDetailsByShopIdMasterWithSoldOUtNew`.

### 4g — Add `handleToggleItem` handler (before the JSX `return`)

```tsx
async function handleToggleItem(itemId: number, currentStatus: number, category: MenuCategory) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  setTogglingItemId(itemId);
  // Optimistic update
  setItems((prev) =>
    prev.map((c) =>
      c.id === category.id
        ? {
            ...c,
            item_list: c.item_list?.map((it: any) =>
              it.Item_Id === itemId ? { ...it, Status: newStatus } : it
            ),
          }
        : c
    )
  );
  try {
    await menuService.changeStoreItemStatus(itemId, newStatus);
  } catch {
    // Rollback
    setItems((prev) =>
      prev.map((c) =>
        c.id === category.id
          ? {
              ...c,
              item_list: c.item_list?.map((it: any) =>
                it.Item_Id === itemId ? { ...it, Status: currentStatus } : it
              ),
            }
          : c
      )
    );
    alert("Failed to update item status.");
  } finally {
    setTogglingItemId(null);
  }
}
```

**Verify:** `npx tsc --noEmit` — zero type errors. Open the items page, click
Edit on an item, change the name, click Update Item — confirm
`POST /MenuMaster/EditStoreItem` fires with the correct JSON body and the table
refreshes. Click the status toggle — confirm
`GET /MenuMaster/ChangeStoreItemStatus?ItemId=…&status=…` fires and the toggle
reflects the new state.

---

## Step 5 — Add hover tooltips (category page `title` attributes)

**What:** Confirm the `title` attributes are present on the edit/delete buttons
and the toggle label for the category page. This was done inline in step 3e
above (`title="Edit Category"`, `title="Delete Category"`, dynamic
`title={cat.status === 1 ? "DeActivate Category" : "Activate Category"}`).

For the items page, confirm or add:
- Edit button: `title="Edit Item"` — already present in DOM-built markup; add it
  to the React-rendered button in step 4f.
- Delete button: `title="Delete Item"` — same.
- Toggle label: `title={item.Status === 1 ? "DeActivate Item" : "Activate Item"}`
  — added in step 4f.

No separate CSS changes are needed — browser native tooltips from `title`
attributes work without additional styling.

**Verify:** Hover over the Edit, Delete, and Toggle for any category or item and
confirm the tooltip text appears.

---

## Step 6 — Final build check

**What:** Run the full Next.js build to ensure no compile errors across both pages.

**File:** No file changes.

**Verify:**
```
cd "c:\Users\Tenacious Techies\Desktop\vnew\Admin\fc_next\foodchow_design_next"
npx next build
```
Build must complete with zero errors (warnings about image optimisation are
acceptable).

---

## Summary of all files changed

| File                                                        | Changes                                                      |
|-------------------------------------------------------------|--------------------------------------------------------------|
| `src/api/endpoints.ts`                                      | +5 endpoint keys                                             |
| `src/api/services/menu.service.ts`                          | +2 interfaces, +5 service methods                            |
| `src/app/(admin)/menu/category/page.tsx`                    | +7 state vars, +4 handlers, crop bridge, controlled modals, updated JSX |
| `src/app/(admin)/menu/items/page.tsx`                       | +5 state vars, +2 handlers, crop bridge, data attributes on rows, controlled Update button |
