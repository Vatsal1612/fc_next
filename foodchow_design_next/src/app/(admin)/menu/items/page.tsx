"use client";

import { useState, useEffect, useRef } from "react";
import {
  AddItemPayload,
  menuService,
  type EditStoreItemPayload,
  type MenuCategory,
  type MenuVariant,
  type ShopMenuType,
  type MenuChoice,
  type ExtraCategory,
} from "@/api/services/menu.service";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import ReportPagination from "@/components/shared/ReportPagination";
import { useSessionCurrency } from "@/hooks/useSessionCurrency";

import "./page.css";

function ItemThumbnail({
  src,
  alt,
  rawImg,
}: {
  src: string;
  alt: string;
  rawImg: string | null | undefined;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  if (!rawImg || hasError) {
    return (
      <div className="placeholder-img">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <i className="fa-solid fa-concierge-bell"></i>
          <span>No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="placeholder-img">
      <img
        src={currentSrc}
        style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4 }}
        alt={alt}
        onError={() => {
          const cleanName = String(rawImg || "")
            .replace(/^https?:\/\/[^\/]+\/(FoodItemImages\/)?/, "")
            .replace(/^\//, "");

          if (currentSrc.includes("admin.foodchow.com") && cleanName) {
            setCurrentSrc(`https://www.foodchow.com/FoodItemImages/${cleanName}`);
          } else {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}

export default function ItemsPage() {

  const SHOP_ID = useShopId();
  const sessionCurrency = useSessionCurrency();
  const currencySymbol = sessionCurrency.symbol || "₹";
  const currencySymbolRef = useRef(currencySymbol);
  useEffect(() => {
    currencySymbolRef.current = currencySymbol;
  }, [currencySymbol]);
  const [itemName, setItemName] = useState("");
  const [secondaryItemName, setSecondaryItemName] = useState("");
  const [description, setDescription] = useState("");
  const [secondaryDescription, setSecondaryDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg] = useState("1");
  const [secondaryLanguageName, setSecondaryLanguageName] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const categoriesRef = useRef<MenuCategory[]>([]);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  const [menuTypes, setMenuTypes] = useState<ShopMenuType[]>([]);
  const [variants, setVariants] = useState<MenuVariant[]>([]);
  const variantsRef = useRef(variants);
  useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);
  const [choices, setChoices] = useState<MenuChoice[]>([]);
  const choicesRef = useRef(choices);
  useEffect(() => {
    choicesRef.current = choices;
  }, [choices]);
  const [extras, setExtras] = useState<ExtraCategory[]>([]);
  const extrasRef = useRef(extras);
  useEffect(() => {
    extrasRef.current = extras;
  }, [extras]);
  const [items, setItems] = useState<MenuCategory[]>([]);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Edit item state
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editCateId, setEditCateId] = useState<number>(0);
  const [editItemImage, setEditItemImage] = useState<string>("");
  const [editBase64Image, setEditBase64Image] = useState<string>("");
  const [updatingItem, setUpdatingItem] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<number | null>(null);

  // Drag and drop state
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  // Pagination and filtering state
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filterCategoryId, setFilterCategoryId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Ref so the useEffect crop logic can push the cropped base64 back to React state
  const setEditBase64ImageRef = useRef(setEditBase64Image);
  useEffect(() => {
    setEditBase64ImageRef.current = setEditBase64Image;
  }, []);

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char] ?? char);

  const getItemSizeList = (item: Record<string, unknown> | null | undefined): Record<string, unknown>[] => {
    const list =
      item?.FoodItemSizeList ??
      item?.foodItemSizeList ??
      item?.fooditemSizeList ??
      item?.ItemSizeList ??
      item?.item_size_list ??
      [];
    return Array.isArray(list)
      ? list.filter((size): size is Record<string, unknown> => typeof size === "object" && size !== null)
      : [];
  };

  const getItemSizePrice = (size: Record<string, unknown>, fallbackPrice?: unknown) => {
    const candidates = [
      size.item_price,
      size.Item_Price,
      size.price,
      size.Price,
      size.net_price,
      size.Net_Price,
      size.Net_Prices,
      size.final_amount,
      size.Final_Amount,
      size.Total_Price,
      size.total_price,
    ];
    const populatedPrice = candidates.find(
      (value) => value !== null && value !== undefined && value !== "" && Number(value) !== 0
    );
    if (populatedPrice !== undefined) return populatedPrice;
    if (fallbackPrice !== undefined && fallbackPrice !== null && fallbackPrice !== "" && Number(fallbackPrice) !== 0) {
      return fallbackPrice;
    }
    return candidates.find((value) => value !== null && value !== undefined && value !== "") ?? 0;
  };

  const loadItems = async () => {
    if (!SHOP_ID) return;
    try {
      const [itemResult, priceResult] = await Promise.allSettled([
        menuService.getItems(SHOP_ID),
        menuService.getItemListWithSize(SHOP_ID),
      ]);

      if (itemResult.status === "rejected") {
        throw itemResult.reason;
      }

      const authoritativePrices =
        priceResult.status === "fulfilled" ? priceResult.value : [];
      if (priceResult.status === "rejected") {
        console.error("Failed to load item variant prices:", priceResult.reason);
      }

      const data = itemResult.value.map((category) => ({
        ...category,
        item_list: (category.item_list ?? []).map((item) => {
          const itemId = String(item.item_Id ?? item.Item_Id ?? item.item_id ?? item.id ?? "");
          const existingSizes = getItemSizeList(item);
          const itemPrices = authoritativePrices.filter(
            (priceRow) => String(priceRow.item_id ?? "").trim() === itemId.trim()
          );

          if (itemPrices.length === 0 && existingSizes.length === 0) return item;

          // Merge authoritative prices with existing sizes without wiping non-zero variant prices
          const baseSizes = itemPrices.length > 0 ? itemPrices : existingSizes;
          const mergedSizes = baseSizes.map((row: any) => {
            const rowSizeId = row.item_size_id ?? row.size_id ?? row.Size_Id ?? row.id;
            const rowSizeName = String(row.size_name ?? row.Size_Name ?? "").trim().toLowerCase();

            const matchingExisting = existingSizes.find((es: any) => {
              const esId = es.item_size_id ?? es.size_id ?? es.Size_Id ?? es.id;
              const esName = String(es.size_name ?? es.Size_Name ?? "").trim().toLowerCase();
              return (rowSizeId && String(esId) === String(rowSizeId)) || (rowSizeName && esName === rowSizeName);
            });

            const candidatePrice =
              (row.item_price !== undefined && row.item_price !== null && !isNaN(Number(row.item_price)))
                ? row.item_price
                : (row.price !== undefined && row.price !== null && !isNaN(Number(row.price)))
                ? row.price
                : (matchingExisting && getItemSizePrice(matchingExisting) !== undefined)
                ? getItemSizePrice(matchingExisting)
                : (item.price ?? item.Price ?? 0);

            return {
              ...(matchingExisting ?? {}),
              ...row,
              size_name: row.size_name ?? matchingExisting?.size_name ?? matchingExisting?.Size_Name ?? "Size",
              item_size_id: rowSizeId,
              Size_Id: rowSizeId,
              size_id: rowSizeId,
              item_price: candidatePrice,
              price: candidatePrice,
              Price: candidatePrice,
              Net_Price: candidatePrice,
            };
          });

          return {
            ...item,
            FoodItemSizeList: mergedSizes,
          };
        }),
      }));

      setItems(data);
      console.log("Items loaded successfully:", data);
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const readVariantPrices = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const rows = Array.from(container.querySelectorAll<HTMLElement>(".variant-row"));
    const sizes: Array<{ Size_Id: number; Price: string }> = [];
    const seenSizeIds = new Set<number>();

    for (const row of rows) {
      const select = row.querySelector<HTMLSelectElement>(".variant-select");
      let sizeId = Number(select?.value);
      if (!Number.isInteger(sizeId) || sizeId <= 0) {
        const text = select?.selectedOptions?.[0]?.text?.trim().toLowerCase();
        if (text) {
          const matched = variantsRef.current.find(
            (v) => v.size_name.trim().toLowerCase() === text
          );
          if (matched) sizeId = Number(matched.id);
        }
      }

      const priceInput = row.querySelector<HTMLInputElement>(".variant-price");
      const priceValue = priceInput?.value.trim() ?? "";
      const parsedPrice = Number(priceValue);

      if (!Number.isInteger(sizeId) || sizeId <= 0) {
        Swal.fire("Select a variant", "Choose a size for every variant row.", "warning");
        return null;
      }
      if (!priceValue || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        Swal.fire("Enter a valid price", "Each variant must have a price of zero or more.", "warning");
        priceInput?.focus();
        return null;
      }
      if (seenSizeIds.has(sizeId)) {
        Swal.fire("Duplicate variant", "Each item size can only be added once.", "warning");
        return null;
      }

      seenSizeIds.add(sizeId);
      sizes.push({ Size_Id: sizeId, Price: priceValue });
    }

    if (sizes.length === 0) {
      Swal.fire("Add a variant", "Add at least one size and price.", "warning");
      return null;
    }

    return sizes;
  };

  const loadItemsRef = useRef(loadItems);
  useEffect(() => {
    loadItemsRef.current = loadItems;
  });

  // Drag and Drop handlers for position reordering
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, itemId: number) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(itemId));
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetItemId: number) => {
    e.preventDefault();
    const sourceIdStr = e.dataTransfer.getData("text/plain");
    const sourceItemId = Number(sourceIdStr);

    if (!sourceItemId || sourceItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    // Find which category both items belong to
    let targetCategory: MenuCategory | null = null;
    for (const cat of items) {
      const hasSource = cat.item_list?.some((it: any) => it.item_Id === sourceItemId);
      const hasTarget = cat.item_list?.some((it: any) => it.item_Id === targetItemId);
      if (hasSource && hasTarget) {
        targetCategory = cat;
        break;
      }
    }

    if (!targetCategory || !targetCategory.item_list) {
      setDraggedItemId(null);
      return;
    }

    const currentList = [...targetCategory.item_list];
    const sourceIdx = currentList.findIndex((it: any) => it.item_Id === sourceItemId);
    const targetIdx = currentList.findIndex((it: any) => it.item_Id === targetItemId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedItemId(null);
      return;
    }

    const [movedItem] = currentList.splice(sourceIdx, 1);
    currentList.splice(targetIdx, 0, movedItem);

    // Optimistically update React state
    setItems((prev) =>
      prev.map((c) => (c.id === targetCategory!.id ? { ...c, item_list: currentList } : c))
    );
    setDraggedItemId(null);

    // Prepare item_id and pos_id arrays for backend
    const itemIds = currentList.map((it: any) => it.item_Id);
    const posIds = currentList.map((_, idx) => idx + 1);

    try {
      await menuService.changeItemPosition(itemIds, posIds);
      Swal.fire({
        icon: "success",
        title: "Position Updated",
        text: "Item position reordered successfully.",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      console.error("Failed to update item position:", err);
      // Reload on failure
      loadItems();
    }
  };

  const getImageUrl = (img: string | null | undefined) => {
    if (!img || img === "null" || img === "undefined") return "";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `https://admin.foodchow.com${img}`;
    return `https://admin.foodchow.com/FoodItemImages/${img}`;
  };

  useEffect(() => {
    const loadCategoriesAndMenus = async () => {
      try {
        const effectiveShopId =
          SHOP_ID ||
          (typeof window !== "undefined"
            ? Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id") || 0)
            : 0) ||
          7895;

        const [cats, menus, itemVariants, itemChoices, itemExtras, shopLangs] = await Promise.allSettled([
          menuService.categoriesByShop(effectiveShopId),
          menuService.getAllShopMenuType(effectiveShopId),
          menuService.variantsByShop(effectiveShopId),
          menuService.getChoices(effectiveShopId),
          menuService.extrasByShop(effectiveShopId),
          menuService.getAllLanguage(effectiveShopId),
        ]);
        if (cats.status === "fulfilled") {
          setCategories(cats.value);
        }
        if (menus.status === "fulfilled" && menus.value) {
          setMenuTypes(menus.value);
        }
        if (shopLangs.status === "fulfilled" && Array.isArray(shopLangs.value) && shopLangs.value.length > 0) {
          const l = shopLangs.value[0];
          if (l.Secondary_language && l.secondary_language_name) {
            setSecondaryLanguageName(l.secondary_language_name);
          }
        }
        if (itemVariants.status === "fulfilled") {
          const raw = itemVariants.value ?? [];
          const normalized = raw
            .map((v: any) => ({
              ...v,
              id: Number(v.id ?? v.Size_Id ?? v.size_id ?? 0),
              size_name: String(v.size_name ?? v.Size_Name ?? "").trim(),
              shop_id: Number(v.shop_id ?? v.Shop_Id ?? effectiveShopId ?? 0),
              status: Number(v.status ?? v.Status ?? 1),
            }))
            .filter((v: any) => v.id > 0 && v.size_name);
          setVariants(normalized);
        } else {
          console.error("Failed to load item variants:", itemVariants.reason);
        }
        if (itemChoices.status === "fulfilled") {
          setChoices(itemChoices.value ?? []);
        } else {
          console.error("Failed to load choices:", itemChoices.reason);
        }
        if (itemExtras.status === "fulfilled") {
          setExtras(itemExtras.value ?? []);
        } else {
          console.error("Failed to load extras:", itemExtras.reason);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const effectiveShopId =
      SHOP_ID ||
      (typeof window !== "undefined"
        ? Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id") || 0)
        : 0);

    if (effectiveShopId) {
      loadItems();
      loadCategoriesAndMenus();
    }
  }, [SHOP_ID]);

  //Add item
  const handleAddItem = async () => {
    try {
      const hasVariants =
        (document.getElementById("containVariantCheckbox") as HTMLInputElement | null)?.checked ?? false;
      const itemSizes = hasVariants ? readVariantPrices("variantRows") : undefined;
      if (hasVariants && !itemSizes) return;

      const addCustomization =
        (document.getElementById("addCustomizationCheckbox") as HTMLInputElement | null)?.checked ?? false;
      const containsChoices =
        addCustomization &&
        ((document.getElementById("containsChoices") as HTMLInputElement | null)?.checked ?? false);
      const containsExtras =
        addCustomization &&
        ((document.getElementById("containsExtras") as HTMLInputElement | null)?.checked ?? false);

      const selectedChoiceCheckboxes = containsChoices
        ? Array.from(document.querySelectorAll<HTMLInputElement>("#choicesContainer .choice-item-checkbox:checked"))
        : [];
      const choiceListPayload = selectedChoiceCheckboxes
        .map((cb) => ({ preference_id: Number(cb.dataset.preferenceId) }))
        .filter((c) => c.preference_id > 0);

      const selectedExtraCheckboxes = containsExtras
        ? Array.from(document.querySelectorAll<HTMLInputElement>("#extrasContainer .extra-item-checkbox:checked"))
        : [];
      const extraListPayload = selectedExtraCheckboxes
        .map((cb) => ({ custom_cat_id: Number(cb.dataset.customCatId) }))
        .filter((e) => e.custom_cat_id > 0);

      const payload: AddItemPayload = {
        Cate_Id: String(categoryId),
        Item_Name: itemName,
        Description: description,
        Is_Veg: String(isVeg),
        unit: "",
        price: hasVariants ? itemSizes?.[0]?.Price ?? "0" : String(price),
        non_Veg_Type: "0",
        Shop_Id: String(SHOP_ID),
        is_manage_stock: 0,
        sold_out_flag: 0,
        barcode: "",
        open_price: 0,
        ...(hasVariants
          ? { is_size_available: 1, FoodItemSizeList: itemSizes ?? [] }
          : { is_size_available: 0 }),
        is_choice: containsChoices && choiceListPayload.length > 0 ? 1 : (containsChoices ? 1 : 0),
        ChoiceList: choiceListPayload,
        is_extra: containsExtras && extraListPayload.length > 0 ? 1 : (containsExtras ? 1 : 0),
        ExtraList: extraListPayload,
      };

      console.log("Payload:", payload);

      const response = await menuService.addItem(payload);

      console.log("Item Added:", response);

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Item added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // Clear form
      setItemName("");
      setSecondaryItemName("");
      setDescription("");
      setSecondaryDescription("");
      setPrice("");
      setCategoryId("");
      const variantCheckbox = document.getElementById("containVariantCheckbox") as HTMLInputElement | null;
      const variantRows = document.getElementById("variantRows");
      if (variantCheckbox) variantCheckbox.checked = false;
      if (variantRows) variantRows.innerHTML = "";
      document.getElementById("singlePriceSection")?.setAttribute("style", "display: block;");
      document.getElementById("variantSection")?.setAttribute("style", "display: none; margin-top: 15px;");

      const customizationCheckbox = document.getElementById("addCustomizationCheckbox") as HTMLInputElement | null;
      if (customizationCheckbox) customizationCheckbox.checked = false;
      const customizationSection = document.getElementById("customizationSection");
      if (customizationSection) customizationSection.style.display = "none";
      const choicesCb = document.getElementById("containsChoices") as HTMLInputElement | null;
      if (choicesCb) choicesCb.checked = false;
      const choicesContainer = document.getElementById("choicesContainer");
      if (choicesContainer) choicesContainer.style.display = "none";
      document.querySelectorAll<HTMLInputElement>("#choicesContainer .choice-item-checkbox").forEach((cb) => {
        cb.checked = false;
      });

      const extrasCb = document.getElementById("containsExtras") as HTMLInputElement | null;
      if (extrasCb) extrasCb.checked = false;
      const extrasContainer = document.getElementById("extrasContainer");
      if (extrasContainer) extrasContainer.style.display = "none";
      document.querySelectorAll<HTMLInputElement>("#extrasContainer .extra-item-checkbox").forEach((cb) => {
        cb.checked = false;
      });

      await loadItems();
      // Return to main list view
      document.getElementById("addNewItemFormView")?.classList.remove("active-view");
      document.getElementById("mainDirectoryView")?.classList.add("active-view");

    } catch (error: any) {
      console.error("API Error:", error);
      Swal.fire("Error", "Failed to add item. Please try again.", "error");
    }
  };

  // Delete item
  const handleDelete = async (itemId: number) => {
    const numericItemId = Number(itemId);
    if (!numericItemId || isNaN(numericItemId)) return;

    // Identify the specific item and its category for clear user confirmation
    let itemToDelete: any = null;
    let categoryName = "";
    for (const cat of items) {
      const match = (cat.item_list ?? []).find((it: any) => {
        const id = it?.item_Id ?? it?.Item_Id ?? it?.item_id ?? it?.id;
        return Number(id) === numericItemId;
      });
      if (match) {
        itemToDelete = match;
        categoryName = cat.cate_name;
        break;
      }
    }

    const itemName = itemToDelete?.item_Name ?? itemToDelete?.Item_Name ?? "Item";

    const result = await Swal.fire({
      title: "Delete Item?",
      text: `Are you sure you want to delete "${itemName}"${categoryName ? ` from ${categoryName}` : ""}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    // Optimistic update: remove the item from state immediately
    setItems((prev) =>
      prev.map((cat) => ({
        ...cat,
        item_list: (cat.item_list ?? []).filter(
          (it: any) => {
            const id = it?.item_Id ?? it?.Item_Id ?? it?.item_id ?? it?.id;
            return Number(id) !== numericItemId;
          }
        ),
      }))
    );

    try {
      const targetShopId =
        SHOP_ID ||
        itemToDelete?.shop_Id ||
        itemToDelete?.Shop_Id ||
        (typeof window !== "undefined"
          ? Number(sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id") || 0)
          : 0) ||
        7895;

      const response = await menuService.deleteItem(numericItemId, targetShopId);

      const isSuccess =
        response?.success === true ||
        response?.Success === true ||
        response?.ResponseCode === 1 ||
        response?.responseCode === 1 ||
        (typeof response?.message === "string" && response.message.toLowerCase().includes("deleted"));

      if (isSuccess) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `"${itemName}" deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        // Keep the optimistic update — do NOT reload from server immediately,
        // as the API may return the item again before the delete is fully persisted.
        // The item is already removed from state above.
      } else {
        // Rollback the optimistic update on failure
        await loadItems();
        Swal.fire("Error", response?.message ?? "Unable to delete item.", "error");
      }
    } catch (error) {
      // Rollback the optimistic update on error
      await loadItems();
      Swal.fire("Error", "Unable to delete item.", "error");
    }
  };

  // Update item via API
  async function handleUpdateItem() {
    if (editItemId === null) return;
    const newName =
      (document.getElementById("editItemNameInput") as HTMLInputElement | null)?.value.trim() ?? "";
    const newDesc =
      (document.getElementById("editItemDescInput") as HTMLTextAreaElement | null)?.value.trim() ?? "";
    const isVegActive =
      document.getElementById("editTypeVegBtn")?.classList.contains("active-segment") ?? true;

    if (!newName) {
      Swal.fire("Warning", "Item name is required.", "warning");
      return;
    }

    const hasVariants =
      (document.getElementById("editContainVariantCheckbox") as HTMLInputElement | null)?.checked ?? false;
    const itemSizes = hasVariants ? readVariantPrices("editVariantRows") : undefined;
    if (hasVariants && !itemSizes) return;
    const editPrice =
      (document.getElementById("editItemPriceInput") as HTMLInputElement | null)?.value.trim() ?? "";
    if (!hasVariants && (!editPrice || !Number.isFinite(Number(editPrice)) || Number(editPrice) < 0)) {
      Swal.fire("Warning", "Enter a valid item price.", "warning");
      return;
    }

    setUpdatingItem(true);
    try {
      const generatedImageName = editBase64Image
        ? `${SHOP_ID}_${Date.now()}_item.jpg`
        : editItemImage;

      const editAddCustomization =
        (document.getElementById("editAddCustomization") as HTMLInputElement | null)?.checked ?? false;
      const editContainsChoices =
        editAddCustomization &&
        ((document.getElementById("editContainsChoices") as HTMLInputElement | null)?.checked ?? false);
      const editContainsExtras =
        editAddCustomization &&
        ((document.getElementById("editContainsExtras") as HTMLInputElement | null)?.checked ?? false);

      const selectedEditChoiceCbs = editContainsChoices
        ? Array.from(document.querySelectorAll<HTMLInputElement>("#editChoicesContainer .edit-choice-item-checkbox:checked"))
        : [];
      const choiceListPayload = selectedEditChoiceCbs
        .map((cb) => ({ preference_id: Number(cb.dataset.preferenceId) }))
        .filter((c) => c.preference_id > 0);

      const selectedEditExtraCbs = editContainsExtras
        ? Array.from(document.querySelectorAll<HTMLInputElement>("#editExtrasContainer .edit-extra-item-checkbox:checked"))
        : [];
      const extraListPayload = selectedEditExtraCbs
        .map((cb) => ({ custom_cat_id: Number(cb.dataset.customCatId) }))
        .filter((e) => e.custom_cat_id > 0);

      const response = await menuService.editStoreItem({
        Item_Id: editItemId,
        Cate_Id: editCateId,
        Item_Name: newName,
        Description: newDesc,
        Is_Veg: isVegActive ? 1 : 0,
        barcode: "",
        base64Image: editBase64Image,
        Item_Image: generatedImageName,
        price: hasVariants ? itemSizes?.[0]?.Price ?? "0" : editPrice,
        is_size_available: hasVariants ? 1 : 0,
        FoodItemSizeList: hasVariants ? (itemSizes ?? []) : [],
        is_choice: editContainsChoices && choiceListPayload.length > 0 ? 1 : (editContainsChoices ? 1 : 0),
        ChoiceList: choiceListPayload,
        is_extra: editContainsExtras && extraListPayload.length > 0 ? 1 : (editContainsExtras ? 1 : 0),
        ExtraList: extraListPayload,
      });

      if (response && response.success === false) {
        const errorMsg = response.message || "Failed to update item on the server.";
        if (errorMsg.includes("FK_size_id") || errorMsg.includes("food_deal_item")) {
          Swal.fire({
            icon: "warning",
            title: "Item Linked to Deal",
            text: "This item's variant is currently used in an active Item Deal. You cannot alter its variant sizes while it is attached to a deal.",
          });
        } else {
          Swal.fire("Error", errorMsg, "error");
        }
        return;
      }

      // Refresh items from API so the table shows updated data
      await loadItems();
      // Switch back to list view
      document.getElementById("editItemFormView")?.classList.remove("active-view");
      document.getElementById("mainDirectoryView")?.classList.add("active-view");
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Item updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to update item. Please try again.", "error");
    } finally {
      setUpdatingItem(false);
    }
  }

  // Toggle item active/inactive
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
              it.item_Id === itemId ? { ...it, status: newStatus } : it
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
                it.item_Id === itemId ? { ...it, status: currentStatus } : it
              ),
            }
            : c
        )
      );
      Swal.fire("Error", "Failed to update item status.", "error");
    } finally {
      setTogglingItemId(null);
    }
  }

  useEffect(() => {
    // ===== HEADER DROPDOWN (global close) =====
    const closeHeaderDropdowns = () => {
      document
        .querySelectorAll<HTMLElement>("#pg-menu-items .header-dropdown-menu")
        .forEach((m) => m.classList.remove("show"));
    };
    document.addEventListener("click", closeHeaderDropdowns);

    // ===== SIDEBAR NAVIGATION =====
    const menuItems = document.querySelectorAll<HTMLElement>(
      "#pg-menu-items .menu-item"
    );
    const submenuGroups = document.querySelectorAll<HTMLElement>(
      "#pg-menu-items .submenu-group"
    );



    const menuItemHandler = function (this: HTMLElement) {
      menuItems.forEach((m) => m.classList.remove("active"));
      this.classList.add("active");
      submenuGroups.forEach((g) => g.classList.remove("active"));
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        const targetMenu = document.getElementById(targetId);
        if (targetMenu) {
          targetMenu.classList.add("active");
          const firstSubItem =
            targetMenu.querySelector<HTMLElement>(".submenu-item");
          if (firstSubItem) {
            document
              .querySelectorAll<HTMLElement>("#pg-menu-items .submenu-item")
              .forEach((s) => s.classList.remove("active"));
            firstSubItem.classList.add("active");
          }
        }
      }
    };
    menuItems.forEach((item) => item.addEventListener("click", menuItemHandler));

    const submenuItems = document.querySelectorAll<HTMLElement>(
      "#pg-menu-items .submenu-item"
    );
    const submenuItemHandler = function (this: HTMLElement, e: Event) {
      e.preventDefault();
      document
        .querySelectorAll<HTMLElement>("#pg-menu-items .submenu-item")
        .forEach((s) => s.classList.remove("active"));
      this.classList.add("active");
    };
    submenuItems.forEach((item) =>
      item.addEventListener("click", submenuItemHandler)
    );

    // ===== TABLE SCROLLBAR =====
    const container = document.getElementById("tableContainer");
    const track = document.getElementById("scrollTrack");
    const thumb = document.getElementById("scrollThumb");
    const leftBtn = document.getElementById("scrollLeftBtn");
    const rightBtn = document.getElementById("scrollRightBtn");

    let isDragging = false;
    let startX = 0;
    let startLeft = 0;

    function updateScrollbar() {
      if (!container || !track || !thumb) return;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      if (scrollWidth <= clientWidth) {
        thumb.style.width = "100%";
        thumb.style.left = "0px";
        return;
      }
      const thumbWidth = Math.max(
        (clientWidth / scrollWidth) * track.clientWidth,
        60
      );
      thumb.style.width = `${thumbWidth}px`;
      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft = track.clientWidth - thumbWidth;
      const thumbLeft = (container.scrollLeft / maxScrollLeft) * maxThumbLeft;
      thumb.style.left = `${thumbLeft}px`;
    }

    const thumbMouseDown = (e: MouseEvent) => {
      if (!thumb) return;
      isDragging = true;
      startX = e.clientX;
      startLeft = parseInt(window.getComputedStyle(thumb).left, 10) || 0;
      document.body.style.userSelect = "none";
    };
    thumb?.addEventListener("mousedown", thumbMouseDown);

    const docMouseMove = (e: MouseEvent) => {
      if (!isDragging || !track || !thumb || !container) return;
      const deltaX = e.clientX - startX;
      const maxThumbLeft = track.clientWidth - thumb.clientWidth;
      const newThumbLeft = Math.max(
        0,
        Math.min(startLeft + deltaX, maxThumbLeft)
      );
      thumb.style.left = `${newThumbLeft}px`;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      container.scrollLeft = (newThumbLeft / maxThumbLeft) * maxScrollLeft;
    };
    document.addEventListener("mousemove", docMouseMove);

    const docMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = "auto";
    };
    document.addEventListener("mouseup", docMouseUp);

    const trackClick = (e: MouseEvent) => {
      if (!track || !thumb || !container) return;
      if (e.target === thumb) return;
      const clickX = e.offsetX;
      const maxThumbLeft = track.clientWidth - thumb.clientWidth;
      const targetThumbLeft = Math.max(
        0,
        Math.min(clickX - thumb.clientWidth / 2, maxThumbLeft)
      );
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      container.scrollLeft = (targetThumbLeft / maxScrollLeft) * maxScrollLeft;
    };
    track?.addEventListener("click", trackClick);

    const leftBtnClick = () =>
      container?.scrollBy({ left: -150, behavior: "smooth" });
    const rightBtnClick = () =>
      container?.scrollBy({ left: 150, behavior: "smooth" });
    leftBtn?.addEventListener("click", leftBtnClick);
    rightBtn?.addEventListener("click", rightBtnClick);

    // ===== UPLOAD & CROP MODAL =====
    const uploadCropOverlay = document.getElementById("uploadCropOverlay");
    const ucmCloseBtn = document.getElementById("ucmCloseBtn");
    const ucmChooseFileBtn = document.getElementById("ucmChooseFileBtn");
    const ucmFileInput = document.getElementById(
      "ucmFileInput"
    ) as HTMLInputElement | null;
    const ucmPreviewImg = document.getElementById(
      "ucmPreviewImg"
    ) as HTMLImageElement | null;
    const ucmPlaceholder = document.getElementById("ucmPlaceholder");
    const ucmZoomSlider = document.getElementById(
      "ucmZoomSlider"
    ) as HTMLInputElement | null;
    const ucmCropUploadBtn = document.getElementById("ucmCropUploadBtn");

    let currentAddImgBtn: HTMLElement | "edit-form" | null = null;

    function openUploadCropModal(triggerBtn: HTMLElement | null) {
      currentAddImgBtn = triggerBtn || null;
      if (ucmPreviewImg) {
        ucmPreviewImg.style.display = "none";
        ucmPreviewImg.src = "";
      }
      if (ucmPlaceholder) ucmPlaceholder.style.display = "flex";
      if (ucmZoomSlider) ucmZoomSlider.value = "0";
      if (ucmFileInput) ucmFileInput.value = "";
      uploadCropOverlay?.classList.add("open");
    }

    const docClickAddImg = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const addImgBtn = target.closest<HTMLElement>(".btn-add-img");
      if (addImgBtn) openUploadCropModal(addImgBtn);
    };
    document.addEventListener("click", docClickAddImg);

    const formUploadBtn = document.querySelector<HTMLElement>(
      "#pg-menu-items .btn-upload-action"
    );
    const formUploadBtnHandler = () => openUploadCropModal(null);
    formUploadBtn?.addEventListener("click", formUploadBtnHandler);

    const ucmCloseHandler = () => uploadCropOverlay?.classList.remove("open");
    ucmCloseBtn?.addEventListener("click", ucmCloseHandler);

    const overlayClickHandler = (e: MouseEvent) => {
      if (e.target === uploadCropOverlay)
        uploadCropOverlay?.classList.remove("open");
    };
    uploadCropOverlay?.addEventListener("click", overlayClickHandler);

    const chooseFileHandler = () => ucmFileInput?.click();
    ucmChooseFileBtn?.addEventListener("click", chooseFileHandler);

    const fileChangeHandler = () => {
      const file = ucmFileInput?.files?.[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
        Swal.fire("Warning", "File size must be under 3MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (!ucmPreviewImg) return;
        ucmPreviewImg.src = ev.target?.result as string;
        ucmPreviewImg.style.display = "block";
        if (ucmPlaceholder) ucmPlaceholder.style.display = "none";
        if (ucmZoomSlider) ucmZoomSlider.value = "0";
        ucmPreviewImg.style.transform = "scale(1)";
      };
      reader.readAsDataURL(file);
    };
    ucmFileInput?.addEventListener("change", fileChangeHandler);

    const zoomInputHandler = () => {
      if (!ucmZoomSlider || !ucmPreviewImg) return;
      const scale = 1 + (Number(ucmZoomSlider.value) / 100) * 1.5;
      ucmPreviewImg.style.transform = `scale(${scale})`;
    };
    ucmZoomSlider?.addEventListener("input", zoomInputHandler);

    const cropUploadHandler = () => {
      if (currentAddImgBtn === "edit-form") {
        if (
          !ucmPreviewImg ||
          !ucmPreviewImg.src ||
          ucmPreviewImg.style.display === "none"
        )
          return;
        const editThumb = document.getElementById("editThumbFrame");
        if (editThumb)
          editThumb.innerHTML = `<img src="${ucmPreviewImg.src}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`;
        // Bridge base64 to React state (strip data URI prefix)
        setEditBase64ImageRef.current(
          ucmPreviewImg.src.replace(/^data:image\/[a-z]+;base64,/, "")
        );
        uploadCropOverlay?.classList.remove("open");
        currentAddImgBtn = null;
        return;
      }
      if (
        !ucmPreviewImg ||
        !ucmPreviewImg.src ||
        ucmPreviewImg.style.display === "none"
      ) {
        Swal.fire("Warning", "Please choose an image first.", "warning");
        return;
      }
      if (currentAddImgBtn) {
        const row = (currentAddImgBtn as HTMLElement).closest("tr");
        if (row) {
          const placeholderDiv =
            row.querySelector<HTMLElement>(".placeholder-img");
          if (placeholderDiv)
            placeholderDiv.innerHTML = `<img src="${ucmPreviewImg.src}" style="width:52px;height:52px;object-fit:cover;border-radius:4px;">`;

          const rowItemId = Number(row.dataset.itemId || "0");
          const rowCateId = Number(row.dataset.cateId || "0");
          const rowItemName = row.querySelector<HTMLElement>(".item-name")?.innerText || "";
          const pureBase64 = ucmPreviewImg.src.replace(/^data:image\/[a-z]+;base64,/, "");
          const generatedName = `${SHOP_ID}_${Date.now()}_item.jpg`;

          if (rowItemId) {
            menuService.editStoreItem({
              Item_Id: rowItemId,
              Cate_Id: rowCateId,
              Item_Name: rowItemName,
              Description: "",
              Is_Veg: 1,
              barcode: "",
              base64Image: pureBase64,
              Item_Image: generatedName,
            }).then(() => {
              loadItemsRef.current();
            }).catch((err) => {
              console.error("Failed to upload item image:", err);
            });
          }
        }
      } else {
        const formThumb = document.querySelector<HTMLElement>(
          "#pg-menu-items .uploader-thumbnail-frame"
        );
        if (formThumb)
          formThumb.innerHTML = `<img src="${ucmPreviewImg.src}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">`;
      }
      uploadCropOverlay?.classList.remove("open");
      currentAddImgBtn = null;
    };
    ucmCropUploadBtn?.addEventListener("click", cropUploadHandler);

    container?.addEventListener("scroll", updateScrollbar);
    window.addEventListener("resize", updateScrollbar);
    const scrollbarTimeout = setTimeout(updateScrollbar, 100);

    // ===== VIEW NAVIGATION =====
    const headerAddNewItemBtn = document.getElementById("headerAddNewItemBtn");
    const mainDirectoryView = document.getElementById("mainDirectoryView");
    const addNewItemFormView = document.getElementById("addNewItemFormView");
    const cancelNewItemFormBtn = document.getElementById("cancelNewItemFormBtn");

    const headerAddHandler = () => {
      mainDirectoryView?.classList.remove("active-view");
      addNewItemFormView?.classList.add("active-view");
    };
    headerAddNewItemBtn?.addEventListener("click", headerAddHandler);

    const cancelNewHandler = () => {
      addNewItemFormView?.classList.remove("active-view");
      mainDirectoryView?.classList.add("active-view");
      setTimeout(updateScrollbar, 50);
    };
    cancelNewItemFormBtn?.addEventListener("click", cancelNewHandler);

    const segmentedCleanups: Array<() => void> = [];
    function setupSegmentedGroup(activeBtnId: string, deactiveBtnId: string) {
      const aBtn = document.getElementById(activeBtnId);
      const dBtn = document.getElementById(deactiveBtnId);
      if (!aBtn || !dBtn) return;
      const aHandler = () => {
        dBtn.classList.remove("active-segment");
        aBtn.classList.add("active-segment");
      };
      const dHandler = () => {
        aBtn.classList.remove("active-segment");
        dBtn.classList.add("active-segment");
      };
      aBtn.addEventListener("click", aHandler);
      dBtn.addEventListener("click", dHandler);
      segmentedCleanups.push(() => {
        aBtn.removeEventListener("click", aHandler);
        dBtn.removeEventListener("click", dHandler);
      });
    }
    setupSegmentedGroup("statusActiveBtn", "statusDeactiveBtn");
    setupSegmentedGroup("typeVegBtn", "typeNonVegBtn");

    // ===== QUICK EDIT =====
    const openQuickEditBtn = document.getElementById("openQuickEditBtn");
    const quickEditModal = document.getElementById("quickEditModal");
    const cancelQuickChangesBtn = document.getElementById(
      "cancelQuickChangesBtn"
    );
    const saveQuickChangesBtn = document.getElementById("saveQuickChangesBtn");
    const quickEditTableBody = document.getElementById("quickEditTableBody");
    const mainItemsTable = document.getElementById("mainItemsTable");
    const confirmUpdateModal = document.getElementById("confirmUpdateModal");
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");
    const confirmYesBtn = document.getElementById("confirmYesBtn");

    const closeDropdownsHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        document
          .querySelectorAll<HTMLElement>("#pg-menu-items .dropdown-menu")
          .forEach((menu) => menu.classList.remove("show"));
      }
    };
    document.addEventListener("click", closeDropdownsHandler);

    function initCustomDropdowns() {
      if (!quickEditTableBody) return;
      const containers =
        quickEditTableBody.querySelectorAll<HTMLElement>(".dropdown-container");
      containers.forEach((box) => {
        const trigger = box.querySelector<HTMLElement>(".dropdown-trigger");
        const menu = box.querySelector<HTMLElement>(".dropdown-menu");
        const items = box.querySelectorAll<HTMLElement>(".dropdown-item");
        const textNode = trigger?.querySelector<HTMLElement>("span");
        if (!trigger || !menu) return;
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          document
            .querySelectorAll<HTMLElement>("#pg-menu-items .dropdown-menu")
            .forEach((m) => {
              if (m !== menu) m.classList.remove("show");
            });
          menu.classList.toggle("show");
        });
        items.forEach((item) => {
          item.addEventListener("click", () => {
            items.forEach((i) => i.classList.remove("active-selection"));
            item.classList.add("active-selection");
            if (textNode) textNode.innerText = item.innerText;
            menu.classList.remove("show");
          });
        });
      });
    }

    const openQuickEditHandler = () => {
      if (!mainItemsTable || !quickEditTableBody || !quickEditModal) return;
      quickEditTableBody.innerHTML = "";
      const allItems = itemsRef.current.flatMap((c) => c.item_list || []);
      const rows = mainItemsTable.querySelectorAll<HTMLElement>("tbody tr");

      rows.forEach((row, index) => {
        const itemId = Number(row.dataset.itemId);
        const item = allItems.find((i: any) => {
          const id = i?.item_Id ?? i?.Item_Id ?? i?.item_id ?? i?.id;
          return String(id) === String(itemId);
        });
        const itemName = row.querySelector<HTMLElement>(".item-name")?.innerText ?? "";

        let sizesHtml = "";
        let inputsHtml = "";

        const sizesList = getItemSizeList(item);
        const hasSizes = sizesList.length > 0;

        if (hasSizes) {
          sizesList.forEach((size: any) => {
            const sName = String(size.size_name ?? size.Size_Name ?? size.Size_name ?? "Size");
            const rawSizeId = size.Size_Id ?? size.size_id ?? size.sizeId ?? size.id;
            const matchedVariant = variantsRef.current.find((variant) => {
              const vId = variant.id ?? (variant as any).Size_Id ?? (variant as any).size_id;
              return (rawSizeId != null && String(vId) === String(rawSizeId)) ||
                variant.size_name.trim().toLowerCase() === sName.trim().toLowerCase();
            });
            const sizeId = matchedVariant?.id ?? rawSizeId ?? "";
            const sPrice = getItemSizePrice(size, item?.price ?? item?.Price);
            sizesHtml += `<div style="margin-bottom: 6px;">${escapeHtml(sName)}</div>`;
            inputsHtml += `<input type="number" min="0" step="0.01" class="table-input item-price-input" data-is-variant="true" data-size-id="${escapeHtml(String(sizeId))}" style="margin-bottom: 6px;" value="${escapeHtml(String(sPrice))}">`;
          });
        } else {
          const priceValue = row.querySelector<HTMLElement>(".item-price")?.innerText.replace(/[^\d.]/g, "") ?? "0";
          sizesHtml = "No Size Available";
          inputsHtml += `<input type="number" min="0" step="0.01" class="table-input item-price-input" value="${escapeHtml(priceValue)}">`;
        }

        quickEditTableBody.insertAdjacentHTML(
          "beforeend",
          `
                <tr data-item-id="${itemId}" data-cate-id="${row.dataset.cateId ?? ""}">
                    <td>${index + 1}</td>
                    <td class="edit-item-name" style="width: 250px;">
                        <textarea class="form-input" style="resize: none; height: 40px; margin-bottom: 5px; width: 100%; border-radius: 6px; border: 1px solid darkgray;">${escapeHtml(itemName)}</textarea>
                        <textarea class="form-input" style="resize: none; height: 50px; width: 100%; border-radius: 6px; border: 1px solid darkgray;" placeholder="Description"></textarea>
                    </td>
                    <td class="edit-item-size" style="vertical-align: top; padding-top: 15px; font-weight: bold;">${sizesHtml}</td>
                    <td style="vertical-align: top; padding-top: 10px;"><div style="display: flex; flex-direction: column;">${inputsHtml}</div></td>
                    <td style="vertical-align: top; padding-top: 10px;">
                        <div style="display: flex; flex-direction: column;">
                           ${sizesHtml === "No Size Available" ? `<input type="text" class="table-input" value="0" style="margin-bottom:6px;">` : item.FoodItemSizeList?.map((s: any) => `<input type="text" class="table-input" value="${s.Weight ?? 0}" style="margin-bottom:6px;">`).join('') || `<input type="text" class="table-input" value="0">`}
                        </div>
                    </td>
                    <td style="vertical-align: top; padding-top: 10px;">
                        <div class="dropdown-container">
                            <div class="dropdown-trigger"><span>Select Unit</span><i class="fa-solid fa-caret-down"></i></div>
                            <div class="dropdown-menu">
                                <div class="dropdown-item">Select Unit</div>
                                <div class="dropdown-item">KiloGram</div>
                                <div class="dropdown-item">Gram</div>
                                <div class="dropdown-item">Pound</div>
                                <div class="dropdown-item">Ounce</div>
                            </div>
                        </div>
                    </td>
                    <td style="vertical-align: top; padding-top: 10px;">
                        <input type="number" class="table-input" placeholder="Min Qty" value="1">
                    </td>
                </tr>`
        );
      });
      initCustomDropdowns();
      quickEditModal.style.display = "flex";
    };
    openQuickEditBtn?.addEventListener("click", openQuickEditHandler);

    const cancelQuickHandler = () => {
      if (quickEditModal) quickEditModal.style.display = "none";
    };
    cancelQuickChangesBtn?.addEventListener("click", cancelQuickHandler);

    // Edit Item Variant toggles
    const editContainVariantCheckbox = document.getElementById(
      "editContainVariantCheckbox"
    ) as HTMLInputElement | null;
    const editVariantSection = document.getElementById("editVariantSection");
    const editSinglePriceSection = document.getElementById("editSinglePriceSection");

    const handleEditVariantToggle = () => {
      if (editContainVariantCheckbox?.checked) {
        if (variantsRef.current.length === 0) {
          editContainVariantCheckbox.checked = false;
          Swal.fire("No variants available", "Create item sizes on the Variants page before adding a variant-priced item.", "info");
          return;
        }
        editVariantSection!.style.display = "block";
        editSinglePriceSection!.style.display = "none";
        const rowsContainer = document.getElementById("editVariantRows");
        if (rowsContainer && rowsContainer.children.length === 0) {
          addVariantRow("editVariantRows");
        }
      } else {
        editVariantSection!.style.display = "none";
        editSinglePriceSection!.style.display = "block";
      }
    };

    editContainVariantCheckbox?.addEventListener("change", handleEditVariantToggle);

    const saveQuickHandler = () => {
      if (confirmUpdateModal) confirmUpdateModal.style.display = "flex";
    };
    saveQuickChangesBtn?.addEventListener("click", saveQuickHandler);

    const confirmCancelHandler = () => {
      if (confirmUpdateModal) confirmUpdateModal.style.display = "none";
    };
    confirmCancelBtn?.addEventListener("click", confirmCancelHandler);

    const confirmYesHandler = async () => {
      if (!quickEditTableBody || !mainItemsTable) return;

      const editRows = quickEditTableBody.querySelectorAll<HTMLElement>("tr");
      const allItems = itemsRef.current.flatMap((category) => category.item_list || []);
      const payloads: EditStoreItemPayload[] = [];

      for (const editRow of Array.from(editRows)) {
        const itemId = Number(editRow.dataset.itemId);
        const item = allItems.find((candidate) => {
          const id = candidate?.item_Id ?? candidate?.Item_Id ?? candidate?.item_id ?? candidate?.id;
          return String(id) === String(itemId);
        });
        const inputs = Array.from(editRow.querySelectorAll<HTMLInputElement>(".item-price-input"));
        if (!item || inputs.length === 0) {
          await Swal.fire("Unable to save prices", "An item or price field is missing. Reload the page and try again.", "error");
          return;
        }

        if (inputs.some((input) => {
          const value = input.value.trim();
          return !value || !Number.isFinite(Number(value)) || Number(value) < 0;
        })) {
          await Swal.fire("Enter valid prices", "Prices must be zero or greater.", "warning");
          return;
        }

        const hasVariants = inputs.some((input) => input.dataset.isVariant === "true");
        const itemSizes: Array<{ Size_Id: number; Price: string }> = [];
        if (hasVariants) {
          for (const input of inputs) {
            let sizeId = Number(input.dataset.sizeId);
            if (!Number.isInteger(sizeId) || sizeId <= 0) {
              const matched = variantsRef.current[0];
              if (matched) sizeId = Number(matched.id);
            }
            if (!Number.isInteger(sizeId) || sizeId <= 0) {
              await Swal.fire("Unable to save variant prices", "An item size is not linked to a valid variant.", "error");
              return;
            }
            itemSizes.push({ Size_Id: sizeId, Price: input.value.trim() });
          }
        }

        payloads.push({
          Item_Id: itemId,
          Cate_Id: Number(item.cate_Id ?? item.Cate_Id ?? editRow.dataset.cateId ?? 0),
          Item_Name: String(item.item_Name ?? item.Item_Name ?? ""),
          Description: String(item.description ?? item.Description ?? ""),
          Is_Veg: Number(item.is_veg ?? item.Is_Veg ?? 1),
          barcode: String(item.barcode ?? ""),
          base64Image: "",
          Item_Image: String(item.item_Image ?? item.Item_Image ?? ""),
          price: hasVariants ? itemSizes[0]?.Price ?? "0" : inputs[0].value.trim(),
          is_size_available: hasVariants ? 1 : 0,
          FoodItemSizeList: itemSizes,
        });
      }

      if (payloads.length === 0) {
        await Swal.fire("No items to update", "There are no item prices to save.", "info");
        return;
      }

      try {
        const results = await Promise.allSettled(
          payloads.map((payload) => menuService.editStoreItem(payload))
        );
        const failedCount = results.filter((result) => result.status === "rejected").length;
        if (failedCount > 0) {
          await loadItems();
          await Swal.fire("Prices not fully saved", `${failedCount} item update(s) failed. Successfully saved items have been reloaded.`, "error");
          return;
        }

        await loadItems();
        if (confirmUpdateModal) confirmUpdateModal.style.display = "none";
        if (quickEditModal) quickEditModal.style.display = "none";
        await Swal.fire({
          icon: "success",
          title: "Prices updated",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to save item prices:", error);
        await Swal.fire("Error", "Failed to save item prices. Please try again.", "error");
      }
    };
    confirmYesBtn?.addEventListener("click", confirmYesHandler);

    // ===== EDIT ITEM PANEL =====
    const editItemFormView = document.getElementById("editItemFormView");
    const cancelEditItemFormBtn = document.getElementById(
      "cancelEditItemFormBtn"
    );
    const editUploadImageBtn = document.getElementById("editUploadImageBtn");
    let currentEditRow: HTMLElement | null = null;

    const editClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest<HTMLElement>(".btn-edit");
      if (!editBtn) return;
      currentEditRow = editBtn.closest("tr");
      if (!currentEditRow) return;

      // Capture data attributes for React state
      const itemId = Number(currentEditRow.dataset.itemId ?? "0");
      const cateId = Number(currentEditRow.dataset.cateId ?? "0");
      const itemImage = currentEditRow.dataset.itemImage ?? "";

      const itemToEdit = itemsRef.current
        .flatMap((c) => c.item_list || [])
        .find((i: any) => {
          const id = i?.item_Id ?? i?.Item_Id ?? i?.item_id ?? i?.id;
          return String(id) === String(itemId);
        });

      const rawItemName = String(
        itemToEdit?.item_Name ?? itemToEdit?.Item_Name ?? ""
      ).replace(/Choices\s*\(\d+\)|Extras\s*\(\d+\)/gi, "").trim();

      const itemName =
        rawItemName ||
        (currentEditRow.querySelector<HTMLElement>(".item-name-text")?.innerText ||
          currentEditRow.querySelector<HTMLElement>(".item-name")?.innerText || "").trim();

      const itemDesc = String(itemToEdit?.description ?? itemToEdit?.Description ?? "");

      const priceValue =
        currentEditRow
          .querySelector<HTMLElement>(".item-price")
          ?.innerText.replace(/[^\d.]/g, "") ?? "";
      const isActive =
        currentEditRow.querySelector<HTMLInputElement>(".switch input")
          ?.checked ?? false;

      setEditItemId(itemId);
      setEditCateId(cateId);
      setEditItemImage(itemImage);
      setEditBase64Image(""); // clear any previous crop

      const editItemNameInput = document.getElementById(
        "editItemNameInput"
      ) as HTMLInputElement | null;
      const editItemPriceInput = document.getElementById(
        "editItemPriceInput"
      ) as HTMLInputElement | null;
      const editItemDescInput = document.getElementById(
        "editItemDescInput"
      ) as HTMLTextAreaElement | null;
      if (editItemNameInput) editItemNameInput.value = itemName;
      if (editItemPriceInput) editItemPriceInput.value = priceValue;
      if (editItemDescInput) editItemDescInput.value = itemDesc;
      const activeBtn = document.getElementById("editStatusActiveBtn");
      const deactiveBtn = document.getElementById("editStatusDeactiveBtn");
      if (isActive) {
        activeBtn?.classList.add("active-segment");
        deactiveBtn?.classList.remove("active-segment");
      } else {
        activeBtn?.classList.remove("active-segment");
        deactiveBtn?.classList.add("active-segment");
      }
      const existingImg = currentEditRow.querySelector<HTMLImageElement>(
        ".placeholder-img img"
      );
      const editThumb = document.getElementById("editThumbFrame");
      if (editThumb) {
        if (existingImg)
          editThumb.innerHTML = `<img src="${existingImg.src}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`;
        else
          editThumb.innerHTML = `<i class="fa-solid fa-concierge-bell" style="font-size:32px;"></i><span style="font-size:9px;">No Image</span>`;
      }

      // Populate Categories dynamically (use ref to avoid stale closure)
      const editCategoryInput = document.getElementById("editCategoryInput") as HTMLSelectElement | null;
      if (editCategoryInput) {
        editCategoryInput.innerHTML = '<option value="">Select Category</option>';
        categoriesRef.current.forEach(cat => {
          const option = document.createElement("option");
          option.value = String(cat.id);
          option.textContent = cat.cate_name;
          if (String(cat.id) === String(cateId)) {
            option.selected = true;
          }
          editCategoryInput.appendChild(option);
        });
        if (cateId) {
          editCategoryInput.value = String(cateId);
        }
      }

      // Populate Sizes dynamically if they exist
      const sizesList = getItemSizeList(itemToEdit);
      const isSizeAvailable = sizesList.length > 0 || Number(itemToEdit?.is_size_available) === 1;

      const editContainVariantCheckbox = document.getElementById("editContainVariantCheckbox") as HTMLInputElement | null;
      const editVariantRowsContainer = document.getElementById("editVariantRows");
      const editVariantSection = document.getElementById("editVariantSection");
      const editSinglePriceSection = document.getElementById("editSinglePriceSection");

      if (editContainVariantCheckbox && editVariantRowsContainer) {
        if (isSizeAvailable && sizesList.length > 0) {
          editContainVariantCheckbox.checked = true;
          if (editVariantSection) editVariantSection.style.display = "block";
          if (editSinglePriceSection) editSinglePriceSection.style.display = "none";

          editVariantRowsContainer.innerHTML = sizesList.map((size: any) => {
            const sizeName = String(size.size_name ?? size.Size_Name ?? size.Size_name ?? size.name ?? "");
            const rawSizeId = size.size_id ?? size.Size_Id ?? size.sizeId ?? size.id;
            const matchedVariant = variantsRef.current.find(
              (variant) => {
                const vId = variant.id ?? (variant as any).Size_Id ?? (variant as any).size_id;
                return (rawSizeId != null && String(vId) === String(rawSizeId)) ||
                  variant.size_name.trim().toLowerCase() === sizeName.trim().toLowerCase();
              }
            );
            const selectedSizeId = matchedVariant?.id ?? rawSizeId ?? "";
            const price = getItemSizePrice(size, itemToEdit?.price ?? itemToEdit?.Price);
            let hasSelectedOption = false;
            let variantOptions = variantsRef.current.map((variant) => {
              const vId = variant.id ?? (variant as any).Size_Id ?? (variant as any).size_id;
              const isSelected = String(vId) === String(selectedSizeId);
              if (isSelected) hasSelectedOption = true;
              return `
              <option value="${vId}" ${isSelected ? "selected" : ""}>${escapeHtml(variant.size_name)}</option>
            `;
            }).join("");

            if (!hasSelectedOption && (selectedSizeId || sizeName)) {
              variantOptions = `<option value="${selectedSizeId || ""}" selected>${escapeHtml(sizeName || "Size")}</option>` + variantOptions;
            }

            return `
            <div class="variant-row">
              <div>
                <label>Price</label>
                <div class="price-input-wrapper">
                  <span class="price-prefix-badge">${escapeHtml(currencySymbolRef.current)}</span>
                  <input type="number" class="form-input variant-price" min="0" step="0.01" value="${escapeHtml(String(price))}" />
                </div>
              </div>
              <div>
                <label>Item Variant</label>
                <select class="form-input variant-select" required>
                  <option value="">Select item size</option>
                  ${variantOptions}
                </select>
              </div>
              <button type="button" class="circle-action-btn add-variant-btn" aria-label="Add variant"><i class="fa-solid fa-plus"></i></button>
              <button type="button" class="circle-action-btn delete-variant-btn" aria-label="Remove variant"><i class="fa-solid fa-trash"></i></button>
            </div>
          `;
          }).join("");
        } else {
          editContainVariantCheckbox.checked = false;
          if (editVariantSection) editVariantSection.style.display = "none";
          if (editSinglePriceSection) editSinglePriceSection.style.display = "block";
          editVariantRowsContainer.innerHTML = "";
        }
      }

      // Prefill Customizations (Choices & Extras)
      const editAddCustomization = document.getElementById("editAddCustomization") as HTMLInputElement | null;
      const editCustomizationSection = document.getElementById("editCustomizationSection");
      const editContainsChoices = document.getElementById("editContainsChoices") as HTMLInputElement | null;
      const editChoicesContainer = document.getElementById("editChoicesContainer");
      const editContainsExtras = document.getElementById("editContainsExtras") as HTMLInputElement | null;
      const editExtrasContainer = document.getElementById("editExtrasContainer");

      const itemChoicesList = (
        itemToEdit?.foodItemChoicesList ??
        itemToEdit?.FoodItemChoicesList ??
        itemToEdit?.ChoiceList ??
        itemToEdit?.choice_list ??
        itemToEdit?.Choice_List ??
        []
      ) as any[];

      const itemExtrasList = (
        itemToEdit?.foodItemExtraList ??
        itemToEdit?.FoodItemExtraList ??
        itemToEdit?.ExtraList ??
        itemToEdit?.extra_list ??
        itemToEdit?.Extra_List ??
        itemToEdit?.extraCategoryList ??
        []
      ) as any[];

      const attachedChoiceIds = new Set<number>();
      itemChoicesList.forEach((c: any) => {
        const pid = Number(c?.preference_id ?? c?.Preference_Id ?? c?.id ?? 0);
        if (pid > 0) attachedChoiceIds.add(pid);
      });

      const attachedExtraIds = new Set<number>();
      itemExtrasList.forEach((e: any) => {
        const cid = Number(e?.custom_cat_id ?? e?.Custom_Cat_Id ?? e?.id ?? 0);
        if (cid > 0) attachedExtraIds.add(cid);
      });

      const hasChoices =
        Number(itemToEdit?.is_choice) === 1 ||
        Number(itemToEdit?.is_Preference) === 1 ||
        attachedChoiceIds.size > 0;

      const hasExtras =
        Number(itemToEdit?.is_extra) === 1 ||
        Number(itemToEdit?.is_Custom) === 1 ||
        attachedExtraIds.size > 0;

      const hasCustomization = hasChoices || hasExtras;

      if (editAddCustomization && editCustomizationSection) {
        editAddCustomization.checked = hasCustomization;
        editCustomizationSection.style.display = hasCustomization ? "block" : "none";
      }

      if (editContainsChoices) {
        editContainsChoices.checked = hasChoices;
      }
      if (editChoicesContainer) {
        editChoicesContainer.style.display = hasChoices ? "block" : "none";
      }
      document.querySelectorAll<HTMLInputElement>("#editChoicesContainer .edit-choice-item-checkbox").forEach((cb) => {
        const pid = Number(cb.dataset.preferenceId);
        cb.checked = attachedChoiceIds.has(pid);
      });

      if (editContainsExtras) {
        editContainsExtras.checked = hasExtras;
      }
      if (editExtrasContainer) {
        editExtrasContainer.style.display = hasExtras ? "block" : "none";
      }
      document.querySelectorAll<HTMLInputElement>("#editExtrasContainer .edit-extra-item-checkbox").forEach((cb) => {
        const cid = Number(cb.dataset.customCatId);
        cb.checked = attachedExtraIds.has(cid);
      });

      mainDirectoryView?.classList.remove("active-view");
      addNewItemFormView?.classList.remove("active-view");
      editItemFormView?.classList.add("active-view");
    };
    document.addEventListener("click", editClickHandler);

    const cancelEditHandler = () => {
      editItemFormView?.classList.remove("active-view");
      mainDirectoryView?.classList.add("active-view");
      setTimeout(updateScrollbar, 50);
    };
    cancelEditItemFormBtn?.addEventListener("click", cancelEditHandler);

    const editUploadHandler = () => {
      currentAddImgBtn = "edit-form";
      if (ucmPreviewImg) {
        ucmPreviewImg.style.display = "none";
        ucmPreviewImg.src = "";
      }
      if (ucmPlaceholder) ucmPlaceholder.style.display = "flex";
      if (ucmZoomSlider) ucmZoomSlider.value = "0";
      if (ucmFileInput) ucmFileInput.value = "";
      uploadCropOverlay?.classList.add("open");
    };
    editUploadImageBtn?.addEventListener("click", editUploadHandler);

    setupSegmentedGroup("editStatusActiveBtn", "editStatusDeactiveBtn");
    setupSegmentedGroup("editTypeVegBtn", "editTypeNonVegBtn");

    // ===== CONTAIN VARIANT =====

    const containVariantCheckbox =
      document.getElementById(
        "containVariantCheckbox"
      ) as HTMLInputElement | null;

    const singlePriceSection =
      document.getElementById("singlePriceSection");

    const variantSection =
      document.getElementById("variantSection");

    const handleVariantToggle = () => {
      if (containVariantCheckbox?.checked) {
        if (variantsRef.current.length === 0) {
          containVariantCheckbox.checked = false;
          Swal.fire("No variants available", "Create item sizes on the Variants page before adding a variant-priced item.", "info");
          return;
        }
        singlePriceSection!.style.display = "none";
        variantSection!.style.display = "block";
        const rowsContainer = document.getElementById("variantRows");
        if (rowsContainer && rowsContainer.children.length === 0) {
          addVariantRow("variantRows");
        }
      } else {
        singlePriceSection!.style.display = "block";
        variantSection!.style.display = "none";
      }
    };

    function addVariantRow(containerId: string = "variantRows") {
      const container = document.getElementById(containerId);
      if (!container) return;

      const options = variantsRef.current
        .map((variant) => {
          const vId = variant.id ?? (variant as any).Size_Id ?? (variant as any).size_id;
          return `<option value="${vId}">${escapeHtml(variant.size_name)}</option>`;
        })
        .join("");
      const row = document.createElement("div");

      row.className = "variant-row";

      row.innerHTML = `
          <div>
            <label>Price</label>
            <div class="price-input-wrapper">
              <span class="price-prefix-badge">${escapeHtml(currencySymbolRef.current)}</span>
              <input type="number" class="form-input variant-price" min="0" step="0.01" required />
            </div>
          </div>

          <div>
            <label>Item Variant</label>
            <select class="form-input variant-select" required>
              <option value="">Select item size</option>
              ${options}
            </select>
          </div>

          <button
            type="button"
            class="circle-action-btn add-variant-btn"
            aria-label="Add variant"
          >
            <i class="fa-solid fa-plus"></i>
          </button>

          <button
            type="button"
            class="circle-action-btn delete-variant-btn"
            aria-label="Remove variant"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
      `;

      container.appendChild(row);
    };

    const variantClickHandler = (e: Event) => {
      const target = e.target as HTMLElement;

      const addBtn = target.closest(".add-variant-btn");
      const deleteBtn = target.closest(".delete-variant-btn");

      if (addBtn) {
        const isEditForm = addBtn.closest("#editVariantSection");
        addVariantRow(isEditForm ? "editVariantRows" : "variantRows");
      }

      if (deleteBtn) {
        const row = deleteBtn.closest(".variant-row");
        const container = deleteBtn.closest("#variantRows, #editVariantRows");

        if (
          row &&
          container && container.querySelectorAll(".variant-row").length > 1
        ) {
          row.remove();
        }
      }
    };

    document.addEventListener(
      "click",
      variantClickHandler
    );

    containVariantCheckbox?.addEventListener(
      "change",
      handleVariantToggle
    );

    document
      .getElementById("addVariantBtn")
      ?.addEventListener("click", () => addVariantRow());

    // ===== CUSTOMIZATION =====
    const addCustomizationCheckbox =
      document.getElementById(
        "addCustomizationCheckbox"
      ) as HTMLInputElement | null;
    const customizationSection =
      document.getElementById("customizationSection");
    const containsChoices = document.getElementById("containsChoices") as HTMLInputElement | null;
    const choicesContainer = document.getElementById("choicesContainer");
    const containsExtras = document.getElementById("containsExtras") as HTMLInputElement | null;
    const extrasContainer = document.getElementById("extrasContainer");

    const handleCustomizationToggle = () => {
      if (customizationSection) {
        customizationSection.style.display = addCustomizationCheckbox?.checked ? "block" : "none";
      }
    };

    const handleChoicesToggle = () => {
      if (choicesContainer) {
        choicesContainer.style.display = containsChoices?.checked ? "block" : "none";
      }
    };

    const handleExtrasToggle = () => {
      if (extrasContainer) {
        extrasContainer.style.display = containsExtras?.checked ? "block" : "none";
      }
    };

    addCustomizationCheckbox?.addEventListener(
      "change",
      handleCustomizationToggle
    );
    containsChoices?.addEventListener("change", handleChoicesToggle);
    containsExtras?.addEventListener("change", handleExtrasToggle);

    // Edit Customization
    const editAddCustomization =
      document.getElementById("editAddCustomization") as HTMLInputElement | null;
    const editCustomizationSection =
      document.getElementById("editCustomizationSection");
    const editContainsChoices = document.getElementById("editContainsChoices") as HTMLInputElement | null;
    const editChoicesContainer = document.getElementById("editChoicesContainer");
    const editContainsExtras = document.getElementById("editContainsExtras") as HTMLInputElement | null;
    const editExtrasContainer = document.getElementById("editExtrasContainer");

    const handleEditCustomizationToggle = () => {
      if (editCustomizationSection) {
        editCustomizationSection.style.display = editAddCustomization?.checked ? "block" : "none";
      }
    };

    const handleEditChoicesToggle = () => {
      if (editChoicesContainer) {
        editChoicesContainer.style.display = editContainsChoices?.checked ? "block" : "none";
      }
    };

    const handleEditExtrasToggle = () => {
      if (editExtrasContainer) {
        editExtrasContainer.style.display = editContainsExtras?.checked ? "block" : "none";
      }
    };

    editAddCustomization?.addEventListener("change", handleEditCustomizationToggle);
    editContainsChoices?.addEventListener("change", handleEditChoicesToggle);
    editContainsExtras?.addEventListener("change", handleEditExtrasToggle);

    // Search is handled via React state (searchTerm)

    // ===== CLEANUP =====
    return () => {
      document.removeEventListener("click", closeHeaderDropdowns);
      menuItems.forEach((item) =>
        item.removeEventListener("click", menuItemHandler)
      );
      submenuItems.forEach((item) =>
        item.removeEventListener("click", submenuItemHandler)
      );

      // Varient checkbox
      containVariantCheckbox?.removeEventListener(
        "change",
        handleVariantToggle
      );

      addCustomizationCheckbox?.removeEventListener(
        "change",
        handleCustomizationToggle
      );
      containsChoices?.removeEventListener("change", handleChoicesToggle);
      containsExtras?.removeEventListener("change", handleExtrasToggle);
      editAddCustomization?.removeEventListener("change", handleEditCustomizationToggle);
      editContainsChoices?.removeEventListener("change", handleEditChoicesToggle);
      editContainsExtras?.removeEventListener("change", handleEditExtrasToggle);

      thumb?.removeEventListener("mousedown", thumbMouseDown);
      document.removeEventListener("mousemove", docMouseMove);
      document.removeEventListener("mouseup", docMouseUp);
      track?.removeEventListener("click", trackClick);
      leftBtn?.removeEventListener("click", leftBtnClick);
      rightBtn?.removeEventListener("click", rightBtnClick);
      document.removeEventListener("click", docClickAddImg);
      formUploadBtn?.removeEventListener("click", formUploadBtnHandler);
      ucmCloseBtn?.removeEventListener("click", ucmCloseHandler);
      uploadCropOverlay?.removeEventListener("click", overlayClickHandler);
      ucmChooseFileBtn?.removeEventListener("click", chooseFileHandler);
      ucmFileInput?.removeEventListener("change", fileChangeHandler);
      ucmZoomSlider?.removeEventListener("input", zoomInputHandler);
      ucmCropUploadBtn?.removeEventListener("click", cropUploadHandler);
      container?.removeEventListener("scroll", updateScrollbar);
      window.removeEventListener("resize", updateScrollbar);
      clearTimeout(scrollbarTimeout);
      headerAddNewItemBtn?.removeEventListener("click", headerAddHandler);
      cancelNewItemFormBtn?.removeEventListener("click", cancelNewHandler);
      segmentedCleanups.forEach((fn) => fn());
      document.removeEventListener("click", closeDropdownsHandler);
      openQuickEditBtn?.removeEventListener("click", openQuickEditHandler);
      cancelQuickChangesBtn?.removeEventListener("click", cancelQuickHandler);
      saveQuickChangesBtn?.removeEventListener("click", saveQuickHandler);
      confirmCancelBtn?.removeEventListener("click", confirmCancelHandler);
      confirmYesBtn?.removeEventListener("click", confirmYesHandler);
      document.removeEventListener("click", editClickHandler);
      cancelEditItemFormBtn?.removeEventListener("click", cancelEditHandler);
      editUploadImageBtn?.removeEventListener("click", editUploadHandler);
      document.removeEventListener(
        "click",
        variantClickHandler
      );
    };
  }, []);

  return (
    <div id="pg-menu-items">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* ===== APP CONTAINER ===== */}
      <div className="app-container">
        {/* ===== MAIN CONTENT ===== */}
        <div className="main-content">
          <div className="container">
            <div className="header-bar">
              <div className="header-left">
                <h1 className="typ-page-heading" style={{ margin: 0 }}>Items</h1>
                {/* <select className="category-select" id="categoryFilterSelect" defaultValue="all">
                  <option value="all">ALL CATEGORIES</option>
                  <option value="pasta">PASTA</option>
                  <option value="pizza">PIZZA</option>
                  <option value="drinks">DRINKS</option>
                </select> */}
                <select
                  className="category-select"
                  id="categoryFilterSelect"
                  value={filterCategoryId}
                  onChange={(e) => {
                    setFilterCategoryId(e.target.value);
                    setPage(1); // Reset to page 1 on filter change
                  }}
                >
                  <option value="all">ALL CATEGORIES</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.cate_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="header-right">
                <button className="btn" id="headerAddNewItemBtn">
                  <i className="fa-solid fa-plus"></i> Add New Item
                </button>
                <button className="btn btn-help" onClick={() => window.open('https://vimeo.com/1075943647', '_blank')}>
                  <i className="fa-regular fa-circle-question"></i> Help
                </button>
              </div>
            </div>

            {/* Main Directory View */}
            <div className="view-section active-view" id="mainDirectoryView">
              <button className="btn btn-quick-edit" id="openQuickEditBtn">
                Quick Edit
              </button>

              <div className="table-section">
                <div className="table-top-actions">
                  <span className="table-top-title">All Items</span>
                  <div className="search-box-container">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="table-responsive" id="tableContainer">
                  <table id="mainItemsTable">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Item Name</th>
                        <th>Item Price</th>
                        <th>Image</th>
                        <th>Add Image</th>
                        <th>Action</th>
                        <th>Active/DeActive</th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      <tr data-category="pasta">
                        <td>
                          <div className="drag-handle">
                            <i className="fa-solid fa-bars"></i>
                          </div>
                        </td>
                        <td className="item-name">Red Sauce Pasta</td>
                        <td className="item-price">Rs.190</td>
                        <td>
                          <div className="placeholder-img">
                            <i className="fa-solid fa-concierge-bell"></i>
                            <span>No Image</span>
                          </div>
                        </td>
                        <td>
                          <button className="circle-action-btn btn-add-img">
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="circle-action-btn btn-edit" title="Edit">
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button className="circle-action-btn btn-delete" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </td>
                      </tr>
                      <tr data-category="pasta">
                        <td>
                          <div className="drag-handle">
                            <i className="fa-solid fa-bars"></i>
                          </div>
                        </td>
                        <td className="item-name">White Sauce Pasta</td>
                        <td className="item-price">Rs.200</td>
                        <td>
                          <div className="placeholder-img">
                            <i className="fa-solid fa-concierge-bell"></i>
                            <span>No Image</span>
                          </div>
                        </td>
                        <td>
                          <button className="circle-action-btn btn-add-img">
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="circle-action-btn btn-edit" title="Edit">
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button className="circle-action-btn btn-delete" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </td>
                      </tr>
                      <tr data-category="pasta">
                        <td>
                          <div className="drag-handle">
                            <i className="fa-solid fa-bars"></i>
                          </div>
                        </td>
                        <td className="item-name">Mix Sauce Pasta</td>
                        <td className="item-price">Rs.210</td>
                        <td>
                          <div className="placeholder-img">
                            <i className="fa-solid fa-concierge-bell"></i>
                            <span>No Image</span>
                          </div>
                        </td>
                        <td>
                          <button className="circle-action-btn btn-add-img">
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="circle-action-btn btn-edit" title="Edit">
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button className="circle-action-btn btn-delete" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </td>
                      </tr>
                      <tr data-category="pasta">
                        <td>
                          <div className="drag-handle">
                            <i className="fa-solid fa-bars"></i>
                          </div>
                        </td>
                        <td className="item-name">Cheesy Pasta</td>
                        <td className="item-price">Rs.220</td>
                        <td>
                          <div className="placeholder-img">
                            <i className="fa-solid fa-concierge-bell"></i>
                            <span>No Image</span>
                          </div>
                        </td>
                        <td>
                          <button className="circle-action-btn btn-add-img">
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="circle-action-btn btn-edit" title="Edit">
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button className="circle-action-btn btn-delete" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </td>
                      </tr>
                    </tbody> */}
                    <tbody>
                      {(() => {
                        const filteredCategories = filterCategoryId === "all"
                          ? items
                          : items.filter(c => String(c.id) === filterCategoryId);

                        const normalizedSearch = searchTerm.trim().toLowerCase();

                        const allItems = filteredCategories
                          .flatMap((category) =>
                            (category.item_list || []).map((item: any) => ({ ...item, _category: category }))
                          )
                          .filter((item: any) => {
                            if (!normalizedSearch) return true;
                            const name = String(item.item_Name ?? item.Item_Name ?? "").toLowerCase();
                            return name.includes(normalizedSearch);
                          });

                        if (allItems.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                No items found
                              </td>
                            </tr>
                          );
                        }

                        const pageStart = (page - 1) * pageSize;
                        const visibleItems = allItems.slice(pageStart, pageStart + pageSize);

                        return visibleItems.map((item: any, itemIdx: number) => {
                          const category = item._category;
                          const stableKey = item.item_Id ? `${item.item_Id}-${itemIdx}` : `item-${itemIdx}`;
                          return (
                            <tr
                              key={stableKey}
                              data-item-id={item.item_Id}
                              data-cate-id={category.id}
                              data-item-image={getImageUrl(item.item_Image ?? item.Item_Image)}
                              data-category={String(category.id)}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, item.item_Id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, item.item_Id)}
                              onDragEnd={() => setDraggedItemId(null)}
                              style={{
                                opacity: draggedItemId === item.item_Id ? 0.4 : 1,
                                cursor: "default",
                                transition: "opacity 0.2s ease",
                              }}
                            >
                              <td>
                                <div className="drag-handle" style={{ cursor: "grab" }} title="Drag to reorder position">
                                  <i className="fa-solid fa-bars"></i>
                                </div>
                              </td>
                              <td className="item-name">
                                <span className="item-name-text" style={{ fontWeight: 600 }}>
                                  {String(item.item_Name ?? item.Item_Name ?? "").replace(/Choices\s*\(\d+\)|Extras\s*\(\d+\)/gi, "").trim()}
                                </span>
                                {(() => {
                                  const rawChoiceList = (item.foodItemChoicesList ?? item.FoodItemChoicesList ?? item.ChoiceList ?? []) as any[];
                                  const rawExtraList = (item.foodItemExtraList ?? item.FoodItemExtraList ?? item.ExtraList ?? []) as any[];
                                  const hasChoices = Number(item.is_choice) === 1 || rawChoiceList.length > 0;
                                  const hasExtras = Number(item.is_extra) === 1 || rawExtraList.length > 0;
                                  if (!hasChoices && !hasExtras) return null;
                                  return (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                      {hasChoices && (
                                        <span style={{ fontSize: "10px", padding: "1px 6px", background: "#e0f2fe", color: "#0369a1", borderRadius: "4px", fontWeight: 500 }}>
                                          Choices {rawChoiceList.length > 0 ? `(${rawChoiceList.length})` : ""}
                                        </span>
                                      )}
                                      {hasExtras && (
                                        <span style={{ fontSize: "10px", padding: "1px 6px", background: "#fef3c7", color: "#92400e", borderRadius: "4px", fontWeight: 500 }}>
                                          Extras {rawExtraList.length > 0 ? `(${rawExtraList.length})` : ""}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="item-price">
                                {(() => {
                                  const sizeList = getItemSizeList(item);
                                  const itemFallbackPrice = item.price ?? item.Price ?? item.net_price ?? item.Net_Price ?? 0;

                                  if (sizeList.length > 0) {
                                    return (
                                      <div className="item-variant-price-list">
                                        {sizeList.map((size, idx: number) => (
                                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "#f8f9fa", padding: "4px 8px", borderRadius: "4px", fontSize: "13px" }}>
                                            <span style={{ fontWeight: 500 }}>{String(size.size_name ?? size.Size_Name ?? size.Size_name ?? size.name ?? "Size")}</span>
                                            <span>{currencySymbol}{String(getItemSizePrice(size, itemFallbackPrice))}</span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }

                                  return <span>{currencySymbol}{itemFallbackPrice}</span>;
                                })()}
                              </td>

                              <td>
                                <ItemThumbnail
                                  src={getImageUrl(item.item_Image ?? item.Item_Image ?? item.image ?? item.item_image)}
                                  alt={item.item_Name ?? item.Item_Name ?? "Item"}
                                  rawImg={item.item_Image ?? item.Item_Image ?? item.image ?? item.item_image}
                                />
                              </td>

                              <td>
                                <button className="circle-action-btn btn-add-img">
                                  <i className="fa-solid fa-plus"></i>
                                </button>
                              </td>

                              <td>
                                <div className="action-cell">
                                  <button className="circle-action-btn btn-edit" title="Edit Item">
                                    <i className="fa-regular fa-pen-to-square"></i>
                                  </button>
                                  <button
                                    className="circle-action-btn btn-delete"
                                    title="Delete Item"
                                    onClick={() => handleDelete(Number(item.item_Id ?? item.Item_Id ?? item.item_id ?? item.id))}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                      <path d="M10 11v6" />
                                      <path d="M14 11v6" />
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                  </button>
                                </div>
                              </td>

                              <td>
                                <label
                                  className="switch"
                                  title={item.status === 1 ? "DeActivate Item" : "Activate Item"}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.status === 1}
                                    disabled={togglingItemId === item.item_Id}
                                    onChange={() => handleToggleItem(item.item_Id, item.status, category)}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", minHeight: "50px", width: "100%" }}>
                  <div id="showingEntriesText" style={{ width: "100%" }}>
                    {(() => {
                      const filteredCategories = filterCategoryId === "all"
                        ? items
                        : items.filter(c => String(c.id) === filterCategoryId);

                      const normalizedSearch = searchTerm.trim().toLowerCase();

                      const allItems = filteredCategories
                        .flatMap((c) => c.item_list || [])
                        .filter((item: any) => {
                          if (!normalizedSearch) return true;
                          const name = String(item.item_Name ?? item.Item_Name ?? "").toLowerCase();
                          return name.includes(normalizedSearch);
                        });

                      const totalItems = allItems.length;
                      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

                      return (
                        <ReportPagination
                          currentPage={page}
                          totalPages={totalPages}
                          totalRecords={totalItems}
                          pageSize={pageSize}
                          onPageChange={(p) => setPage(p)}
                          onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                          }}
                        />
                      );
                    })()}
                  </div>
                  <div className="custom-scrollbar-container">
                    <span className="scrollbar-arrow" id="scrollLeftBtn">
                      <i className="fa-solid fa-caret-left"></i>
                    </span>
                    <div className="custom-scrollbar-track" id="scrollTrack">
                      <div className="custom-scrollbar-thumb" id="scrollThumb"></div>
                    </div>
                    <span className="scrollbar-arrow" id="scrollRightBtn">
                      <i className="fa-solid fa-caret-right"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Item Form */}
            <div className="view-section add-item-panel" id="addNewItemFormView">
              <h2>Add New Item</h2>
              <div className="form-layout-wrapper">
                <div className="form-fields-column">
                  <div className="form-group">
                    <label className="form-label">
                      Category<span className="required-star">*</span>
                    </label>

                    <select
                      className="form-input"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select Category</option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.cate_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {secondaryLanguageName ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name (English)<span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name ({secondaryLanguageName})<span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={secondaryItemName}
                          onChange={(e) => setSecondaryItemName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description (English)</label>
                        <textarea
                          className="form-input form-textarea"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description ({secondaryLanguageName})</label>
                        <textarea
                          className="form-input form-textarea"
                          value={secondaryDescription}
                          onChange={(e) => setSecondaryDescription(e.target.value)}
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name<span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description</label>
                        <textarea
                          className="form-input form-textarea"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label className="form-label">
                      Sold By<span className="required-star">*</span>
                    </label>
                    <div className="soldby-row">
                      <label className="radio-option">
                        <input type="radio" name="soldby" value="each" defaultChecked /> Each
                      </label>
                      <label className="radio-option">
                        <input type="radio" name="soldby" value="weight" /> Weight
                      </label>
                    </div>
                  </div>
                  {/* <div className="form-group">
                    <label className="form-label">Price</label>
                    <div className="price-input-wrapper">
                      <span className="price-prefix-badge">Rs.</span>
                      <input type="text" className="form-input" />
                    </div>
                  </div>*/}
                  <div className="form-group" id="singlePriceSection">
                    <label className="form-label">Price</label>
                    <div className="price-input-wrapper">
                      <span className="price-prefix-badge">{currencySymbol}</span>
                      {/* <input type="text" className="form-input" /> */}
                      <input
                        type="text"
                        className="form-input"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* <div className="form-group">
                    <label className="checkbox-container-label">
                      <input type="checkbox" /> Contain Variant
                    </label>
                  </div> */}
                  <div className="form-group">
                    <label className="checkbox-container-label">
                      <input type="checkbox" id="containVariantCheckbox" />
                      Contain Variant
                    </label>
                  </div>
                  <div
                    id="variantSection"
                    style={{ display: "none", marginTop: "15px" }}
                  >
                    <div id="variantRows">

                      <div className="variant-row">
                        <div>
                          <label>Price</label>
                          <div className="price-input-wrapper">
                            <span className="price-prefix-badge">{currencySymbol}</span>
                            <input type="number" className="form-input variant-price" min="0" step="0.01" required />
                          </div>
                        </div>

                        <div>
                          <label>Item Variant</label>
                          <select className="form-input variant-select" required>
                            <option value="">Select item size</option>
                            {variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>{variant.size_name}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          id="addVariantBtn"
                          className="circle-action-btn"
                          style={{ marginTop: "25px" }}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>

                        <button
                          type="button"
                          className="circle-action-btn delete-variant-btn"
                          style={{
                            marginTop: "25px",
                            background: "#222",
                            color: "#fff",
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="image-upload-column">
                  <label className="form-label">Choose Image</label>
                  <div className="uploader-box-frame">
                    <div className="uploader-thumbnail-frame">
                      <i className="fa-solid fa-concierge-bell"></i>
                      <span>No Image</span>
                    </div>
                    <button className="btn-upload-action">Upload Image</button>
                  </div>
                  <div className="upload-info-note">
                    Image Should Be 600 * 600 For Best View In Gallery Image. You Can Select Only (.gif, .png, .jpeg, .jpg) Format Files Upto 3MB File Size !
                  </div>
                </div>
              </div>
              <div className="segmented-row-blocks">
                <div className="segmented-block">
                  <label className="form-label">
                    Item Status<span className="required-star">*</span>
                  </label>
                  <div className="segmented-group-btn">
                    <button className="segment-btn-choice active-segment" id="statusActiveBtn">
                      Active
                    </button>
                    <button className="segment-btn-choice" id="statusDeactiveBtn">
                      Deactive
                    </button>
                  </div>
                  <label className="checkbox-container-label" style={{ marginTop: "10px" }}>
                    <input type="checkbox" /> Contain Alchohol
                  </label>
                </div>
                <div className="segmented-block">
                  <label className="form-label">
                    Type<span className="required-star">*</span>
                  </label>
                  <div className="segmented-group-btn">
                    <button className="segment-btn-choice active-segment" id="typeVegBtn">
                      Veg
                    </button>
                    <button className="segment-btn-choice" id="typeNonVegBtn">
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>
              <div className="menu-list-stack">
                {/* <label className="checkbox-container-label" style={{ marginBottom: "5px" }}>
                  <input type="checkbox" /> Add More Customization
                </label> */}
                <label className="checkbox-container-label" style={{ marginBottom: "5px" }}>
                  <input
                    type="checkbox"
                    id="addCustomizationCheckbox"
                  />
                  Add More Customization
                </label>
                <div
                  id="customizationSection"
                  style={{
                    display: "none",
                    marginTop: "15px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <label
                    className="checkbox-container-label"
                    style={{ marginBottom: "8px", fontWeight: 600 }}
                  >
                    <input type="checkbox" id="containsChoices" />
                    Do this Item contains Choices?
                  </label>
                  <div
                    id="choicesContainer"
                    style={{
                      display: "none",
                      marginBottom: "16px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Select Choices
                    </div>
                    {choices.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                        {choices.map((choice) => (
                          <div
                            key={choice.preference_id}
                            style={{
                              padding: "10px",
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="choice-item-checkbox"
                                data-preference-id={choice.preference_id}
                                id={`choice-${choice.preference_id}`}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary-teal)", cursor: "pointer" }}
                              />
                              <span>{choice.preference_name}</span>
                              {choice.is_mandatory === 1 && (
                                <span style={{ fontSize: "10px", padding: "1px 5px", background: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontWeight: 500 }}>
                                  Required
                                </span>
                              )}
                            </label>
                            {choice.choice_options_list && choice.choice_options_list.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "24px" }}>
                                {choice.choice_options_list.map((opt) => (
                                  <span
                                    key={opt.preference_option_id}
                                    style={{
                                      fontSize: "11px",
                                      padding: "2px 7px",
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {opt.option_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                        No choices configured for this shop.
                      </div>
                    )}
                  </div>

                  <label
                    className="checkbox-container-label"
                    style={{ marginBottom: "8px", fontWeight: 600 }}
                  >
                    <input type="checkbox" id="containsExtras" />
                    Do this Item contains Extras?
                  </label>
                  <div
                    id="extrasContainer"
                    style={{
                      display: "none",
                      marginBottom: "8px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Select Extras
                    </div>
                    {extras.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                        {extras.map((extra) => (
                          <div
                            key={extra.custom_cat_id}
                            style={{
                              padding: "10px",
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="extra-item-checkbox"
                                data-custom-cat-id={extra.custom_cat_id}
                                id={`extra-${extra.custom_cat_id}`}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary-teal)", cursor: "pointer" }}
                              />
                              <span>{extra.custom_cat_name}</span>
                            </label>
                            {extra.extraCategoryOptionList && extra.extraCategoryOptionList.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "24px" }}>
                                {extra.extraCategoryOptionList.map((opt) => (
                                  <span
                                    key={opt.ingredient_id}
                                    style={{
                                      fontSize: "11px",
                                      padding: "2px 7px",
                                      background: "#ecfdf5",
                                      color: "#065f46",
                                      borderRadius: "10px",
                                      border: "1px solid #a7f3d0",
                                    }}
                                  >
                                    {opt.ingredient_name}
                                    {opt.price > 0 ? ` (${currencySymbol}${opt.price})` : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                        No extras configured for this shop.
                      </div>
                    )}
                  </div>
                </div>

                <h3>Menu List : *</h3>
                {menuTypes.length > 0 ? (
                  menuTypes.map((mt) => (
                    <label key={mt.id} className="checkbox-option-item">
                      <input type="checkbox" value={mt.id} defaultChecked /> {mt.menu_name}
                    </label>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "#888" }}>Main Menu</span>
                )}
              </div>
              <div className="action-footer-row">
                {/* <button className="btn btn-form-add" id="submitNewItemFormBtn">
                  ADD
                </button> */}
                <button
                  className="btn btn-form-add"
                  id="submitNewItemFormBtn"
                  onClick={handleAddItem}
                >
                  ADD
                </button>
                <button className="btn btn-form-cancel" id="cancelNewItemFormBtn">
                  CANCEL
                </button>
              </div>
            </div>

            {/* Edit Item Form */}
            <div className="view-section add-item-panel" id="editItemFormView">
              <h2>Edit Item</h2>
              <div className="form-layout-wrapper">
                <div className="form-fields-column">
                  <div className="form-group">
                    <label className="form-label">
                      Category<span className="required-star">*</span>
                    </label>
                    <select className="form-input" id="editCategoryInput" defaultValue="PASTA">
                      <option value="PASTA">PASTA</option>
                      <option value="PIZZA">PIZZA</option>
                      <option value="DRINKS">DRINKS</option>
                    </select>
                  </div>
                  {secondaryLanguageName ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name (English)<span className="required-star">*</span>
                        </label>
                        <input type="text" className="form-input" id="editItemNameInput" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name ({secondaryLanguageName})<span className="required-star">*</span>
                        </label>
                        <input type="text" className="form-input" id="editSecondaryItemNameInput" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description (English)</label>
                        <textarea
                          className="form-input form-textarea"
                          id="editItemDescInput"
                          defaultValue=""
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description ({secondaryLanguageName})</label>
                        <textarea
                          className="form-input form-textarea"
                          id="editSecondaryItemDescInput"
                          defaultValue=""
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          Item Name<span className="required-star">*</span>
                        </label>
                        <input type="text" className="form-input" id="editItemNameInput" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Description</label>
                        <textarea
                          className="form-input form-textarea"
                          id="editItemDescInput"
                          defaultValue=""
                        ></textarea>
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label className="form-label">
                      Sold By<span className="required-star">*</span>
                    </label>
                    <div className="soldby-row">
                      <label className="radio-option">
                        <input type="radio" name="editSoldby" value="each" defaultChecked /> Each
                      </label>
                      <label className="radio-option">
                        <input type="radio" name="editSoldby" value="weight" /> Weight
                      </label>
                    </div>
                  </div>
                  <div className="form-group" id="editSinglePriceSection">
                    <label className="form-label">Price</label>
                    <div className="price-input-wrapper">
                      <span className="price-prefix-badge">{currencySymbol}</span>
                      <input type="text" className="form-input" id="editItemPriceInput" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-container-label">
                      <input type="checkbox" id="editContainVariantCheckbox" /> Contain Variant
                    </label>
                  </div>
                  <div
                    id="editVariantSection"
                    style={{ display: "none", marginTop: "15px" }}
                  >
                    <div id="editVariantRows">
                      {/* Dynamic rows will be injected here via JS */}
                    </div>
                  </div>
                  <div className="segmented-block" style={{ marginTop: "4px" }}>
                    <label className="form-label">
                      Item Status<span className="required-star">*</span>
                    </label>
                    <div className="segmented-group-btn">
                      <button className="segment-btn-choice active-segment" id="editStatusActiveBtn">
                        Active
                      </button>
                      <button className="segment-btn-choice" id="editStatusDeactiveBtn">
                        Deactive
                      </button>
                    </div>
                    <label className="checkbox-container-label" style={{ marginTop: "10px" }}>
                      <input type="checkbox" id="editContainAlcohol" /> Contain Alchohol
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "420px" }}>
                  <div style={{ border: "1.5px dashed #ccc", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", background: "#fafafa" }}>
                    <div className="uploader-thumbnail-frame edit-thumb" id="editThumbFrame" style={{ width: "80px", height: "80px", borderRadius: "8px" }}>
                      <i className="fa-solid fa-concierge-bell" style={{ fontSize: "32px" }}></i>
                      <span style={{ fontSize: "9px" }}>No Image</span>
                    </div>
                    <button className="btn-upload-action" id="editUploadImageBtn">
                      Upload Image
                    </button>
                  </div>
                  <div className="segmented-block">
                    <label className="form-label">
                      Type<span className="required-star">*</span>
                    </label>
                    <div className="segmented-group-btn">
                      <button className="segment-btn-choice active-segment" id="editTypeVegBtn">
                        Veg
                      </button>
                      <button className="segment-btn-choice" id="editTypeNonVegBtn">
                        Non-Veg
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="menu-list-stack">
                <label className="checkbox-container-label" style={{ marginBottom: "5px" }}>
                  <input type="checkbox" id="editAddCustomization" /> Add More Customization
                </label>
                <div
                  id="editCustomizationSection"
                  style={{
                    display: "none",
                    marginTop: "15px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <label
                    className="checkbox-container-label"
                    style={{ marginBottom: "8px", fontWeight: 600 }}
                  >
                    <input type="checkbox" id="editContainsChoices" />
                    Do this Item contains Choices?
                  </label>
                  <div
                    id="editChoicesContainer"
                    style={{
                      display: "none",
                      marginBottom: "16px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Select Choices
                    </div>
                    {choices.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                        {choices.map((choice) => (
                          <div
                            key={choice.preference_id}
                            style={{
                              padding: "10px",
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="edit-choice-item-checkbox"
                                data-preference-id={choice.preference_id}
                                id={`edit-choice-${choice.preference_id}`}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary-teal)", cursor: "pointer" }}
                              />
                              <span>{choice.preference_name}</span>
                              {choice.is_mandatory === 1 && (
                                <span style={{ fontSize: "10px", padding: "1px 5px", background: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontWeight: 500 }}>
                                  Required
                                </span>
                              )}
                            </label>
                            {choice.choice_options_list && choice.choice_options_list.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "24px" }}>
                                {choice.choice_options_list.map((opt) => (
                                  <span
                                    key={opt.preference_option_id}
                                    style={{
                                      fontSize: "11px",
                                      padding: "2px 7px",
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {opt.option_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                        No choices configured for this shop.
                      </div>
                    )}
                  </div>

                  <label
                    className="checkbox-container-label"
                    style={{ marginBottom: "8px", fontWeight: 600 }}
                  >
                    <input type="checkbox" id="editContainsExtras" />
                    Do this Item contains Extras?
                  </label>
                  <div
                    id="editExtrasContainer"
                    style={{
                      display: "none",
                      marginBottom: "8px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Select Extras
                    </div>
                    {extras.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                        {extras.map((extra) => (
                          <div
                            key={extra.custom_cat_id}
                            style={{
                              padding: "10px",
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="edit-extra-item-checkbox"
                                data-custom-cat-id={extra.custom_cat_id}
                                id={`edit-extra-${extra.custom_cat_id}`}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary-teal)", cursor: "pointer" }}
                              />
                              <span>{extra.custom_cat_name}</span>
                            </label>
                            {extra.extraCategoryOptionList && extra.extraCategoryOptionList.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "24px" }}>
                                {extra.extraCategoryOptionList.map((opt) => (
                                  <span
                                    key={opt.ingredient_id}
                                    style={{
                                      fontSize: "11px",
                                      padding: "2px 7px",
                                      background: "#ecfdf5",
                                      color: "#065f46",
                                      borderRadius: "10px",
                                      border: "1px solid #a7f3d0",
                                    }}
                                  >
                                    {opt.ingredient_name}
                                    {opt.price > 0 ? ` (${currencySymbol}${opt.price})` : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                        No extras configured for this shop.
                      </div>
                    )}
                  </div>
                </div>
                <h3>Menu List : *</h3>
                {menuTypes.length > 0 ? (
                  menuTypes.map((mt) => (
                    <label key={mt.id} className="checkbox-option-item">
                      <input type="checkbox" className="edit-menu-check" value={mt.id} defaultChecked /> {mt.menu_name}
                    </label>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "#888" }}>Main Menu</span>
                )}
              </div>
              <div className="action-footer-row">
                <button
                  className="btn btn-form-add"
                  id="updateItemFormBtn"
                  onClick={handleUpdateItem}
                  disabled={updatingItem}
                >
                  {updatingItem ? "SAVING…" : "UPDATE"}
                </button>
                <button className="btn btn-form-cancel" id="cancelEditItemFormBtn">
                  CANCEL
                </button>
              </div>
            </div>


          </div>
          {/* /.container */}

          <WizardFooter />
        </div>
        {/* /.main-content */}
      </div>
      {/* /.app-container */}

      {/* Upload & Crop Image Modal */}
      <div className="upload-crop-overlay" id="uploadCropOverlay">
        <div className="upload-crop-modal">
          <div className="ucm-header">
            <h3>Upload &amp; Crop Image</h3>
            <button className="ucm-close-btn" id="ucmCloseBtn">
              &times;
            </button>
          </div>
          <div className="ucm-body">
            <div className="ucm-choose-row">
              <button className="ucm-choose-btn" id="ucmChooseFileBtn">
                Choose File
              </button>
              <input
                type="file"
                id="ucmFileInput"
                accept=".gif,.png,.jpeg,.jpg"
                style={{ display: "none" }}
              />
            </div>
            <p className="ucm-info-text">
              Image Should Be 600 * 600 For Best View. You Can Select Only (.gif, .png, .jpeg, .jpg) Format Files Upto 3MB File Size !
            </p>
            <div className="ucm-preview-area" id="ucmPreviewArea">
              <div className="ucm-preview-placeholder" id="ucmPlaceholder">
                <i className="fa-solid fa-image"></i>
                No image selected
              </div>
              <img id="ucmPreviewImg" alt="Preview" />
            </div>
            <div className="ucm-slider-row">
              <i className="fa-solid fa-magnifying-glass-minus"></i>
              <input
                type="range"
                className="ucm-zoom-slider"
                id="ucmZoomSlider"
                min="0"
                max="100"
                defaultValue="0"
              />
              <i className="fa-solid fa-magnifying-glass-plus"></i>
            </div>
            <button className="ucm-crop-upload-btn" id="ucmCropUploadBtn">
              Crop &amp; Upload Image
            </button>
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <div className="modal-overlay" id="quickEditModal">
        <div className="quick-edit-container">
          <div className="quick-edit-header">
            <h2>Quick Edit</h2>
            <div className="category-dropdown">
              <select name="category" defaultValue="PASTA">
                <option value="PASTA">PASTA</option>
                <option value="PIZZA">PIZZA</option>
                <option value="DRINKS">DRINKS</option>
              </select>
            </div>
          </div>
          <div className="quick-edit-table-wrapper">
            <table className="quick-edit-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item Name</th>
                  <th>Item Size</th>
                  <th>Item Price ({currencySymbol})</th>
                  <th>Weight</th>
                  <th>Unit</th>
                  <th>Min. Order Qty</th>
                </tr>
              </thead>
              <tbody id="quickEditTableBody"></tbody>
            </table>
          </div>
          <div className="quick-edit-actions">
            <button className="btn btn-save" id="saveQuickChangesBtn">
              SAVE CHANGES
            </button>
            <button className="btn btn-cancel" id="cancelQuickChangesBtn">
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Update Modal */}
      <div className="confirm-overlay" id="confirmUpdateModal">
        <div className="confirm-box">
          <div className="confirm-icon-container">
            <div className="confirm-icon">!</div>
          </div>
          <div className="confirm-message">Are you sure you want to Update Items?</div>
          <div className="confirm-actions">
            <button className="btn-confirm-cancel" id="confirmCancelBtn">
              Cancel
            </button>
            <button className="btn-confirm-yes" id="confirmYesBtn">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
