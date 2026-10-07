"use client";

import { useState, useEffect } from "react";
import { AddItemPayload, menuService, type MenuCategory } from "@/api/services/menu.service";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";

import "./page.css";

export default function ItemsPage() {

  const SHOP_ID = useShopId();
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg] = useState("1");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuCategory[]>([]);
  // const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await menuService.getItems(SHOP_ID);
        setItems(data);
        console.log("Items:", data);
      } catch (error) {
        console.error(error);
      }
    };

    loadItems();
  }, []);

  const totalItems = items.reduce(
    (total, category) => total + (category.item_list?.length ?? 0),
    0
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await menuService.categoriesByShop(SHOP_ID);
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  //Add item
  const handleAddItem = async () => {
    try {
      const payload: AddItemPayload = {
        Cate_Id: String(categoryId),
        Item_Name: itemName,
        Description: description,
        Is_Veg: String(isVeg),
        unit: "",
        price: String(price),
        non_Veg_Type: "0",
        Shop_Id: String(SHOP_ID),
        is_manage_stock: 0,
        sold_out_flag: 0,
        barcode: "",
        open_price: 0,
      };

      console.log("Payload:", payload);


      const response = await menuService.addItem(payload);

      console.log("Item Added:", response);

      alert("Item added successfully");

      // Clear form
      setItemName("");
      setDescription("");
      setPrice("");
      setCategoryId("");

    } catch (error: any) {
      console.error("API Error:", error);
      console.log(
        "Validation Errors:",
        error?.response?.data?.errors
      );
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);
      }

      alert("Failed to add item");
    }
  };

  // Delete item
  const handleDelete = async (itemId: number) => {
    const result = await Swal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await menuService.deleteItem(itemId, SHOP_ID);

      if (response.success) {
        Swal.fire("Deleted!", "Item deleted successfully.", "success");

        const data = await menuService.getItems(SHOP_ID);
        setItems(data);
      }
    } catch (error) {
      Swal.fire("Error", "Unable to delete item.", "error");
    }
  };

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
        alert("File size must be under 3MB.");
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
        uploadCropOverlay?.classList.remove("open");
        currentAddImgBtn = null;
        return;
      }
      if (
        !ucmPreviewImg ||
        !ucmPreviewImg.src ||
        ucmPreviewImg.style.display === "none"
      ) {
        alert("Please choose an image first.");
        return;
      }
      if (currentAddImgBtn) {
        const row = (currentAddImgBtn as HTMLElement).closest("tr");
        if (row) {
          const placeholderDiv =
            row.querySelector<HTMLElement>(".placeholder-img");
          if (placeholderDiv)
            placeholderDiv.innerHTML = `<img src="${ucmPreviewImg.src}" style="width:52px;height:52px;object-fit:cover;border-radius:4px;">`;
        }
      } else {
        const formThumb = document.querySelector<HTMLElement>(
          "#pg-menu-items .uploader-thumbnail-frame"
        );
        if (formThumb)
          formThumb.innerHTML = `<img src="${ucmPreviewImg.src}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">`;
      }
      uploadCropOverlay?.classList.remove("open");
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
    const submitNewItemFormBtn = document.getElementById("submitNewItemFormBtn");

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

    const submitNewHandler = () => {
      addNewItemFormView?.classList.remove("active-view");
      mainDirectoryView?.classList.add("active-view");
      setTimeout(updateScrollbar, 50);
    };
    submitNewItemFormBtn?.addEventListener("click", submitNewHandler);

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
      const rows = mainItemsTable.querySelectorAll<HTMLElement>("tbody tr");
      quickEditTableBody.innerHTML = "";
      rows.forEach((row, index) => {
        const itemName =
          row.querySelector<HTMLElement>(".item-name")?.innerText ?? "";
        const priceValue =
          row
            .querySelector<HTMLElement>(".item-price")
            ?.innerText.replace(/[^0-9]/g, "") ?? "";
        quickEditTableBody.insertAdjacentHTML(
          "beforeend",
          `
                <tr>
                    <td>${index + 1}</td>
                    <td class="edit-item-name">${itemName}</td>
                    <td class="edit-item-size">No Size Available</td>
                    <td><input type="number" class="table-input item-price-input" value="${priceValue}"></td>
                    <td><input type="number" class="table-input" value="0"></td>
                    <td>
                        <div class="dropdown-container">
                            <div class="dropdown-trigger"><span>Select Unit</span><i class="fa-solid fa-caret-down"></i></div>
                            <div class="dropdown-menu">
                                <div class="dropdown-item">Select Unit</div>
                                <div class="dropdown-item">KiloGram</div>
                                <div class="dropdown-item">Gram</div>
                                <div class="dropdown-item">Pound</div>
                                <div class="dropdown-item">Ounce</div>
                                <div class="dropdown-item active-selection">Min. Order</div>
                            </div>
                        </div>
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

    const saveQuickHandler = () => {
      if (confirmUpdateModal) confirmUpdateModal.style.display = "flex";
    };
    saveQuickChangesBtn?.addEventListener("click", saveQuickHandler);

    const confirmCancelHandler = () => {
      if (confirmUpdateModal) confirmUpdateModal.style.display = "none";
    };
    confirmCancelBtn?.addEventListener("click", confirmCancelHandler);

    const confirmYesHandler = () => {
      if (!quickEditTableBody || !mainItemsTable) return;
      const editInputs = quickEditTableBody.querySelectorAll<HTMLInputElement>(
        ".item-price-input"
      );
      const mainRows = mainItemsTable.querySelectorAll<HTMLElement>("tbody tr");
      editInputs.forEach((input, index) => {
        const priceCell = mainRows[index]?.querySelector<HTMLElement>(
          ".item-price"
        );
        if (priceCell) priceCell.innerText = `Rs.${input.value || 0}`;
      });
      if (confirmUpdateModal) confirmUpdateModal.style.display = "none";
      if (quickEditModal) quickEditModal.style.display = "none";
    };
    confirmYesBtn?.addEventListener("click", confirmYesHandler);

    // ===== EDIT ITEM PANEL =====
    const editItemFormView = document.getElementById("editItemFormView");
    const cancelEditItemFormBtn = document.getElementById(
      "cancelEditItemFormBtn"
    );
    const updateItemFormBtn = document.getElementById("updateItemFormBtn");
    const editUploadImageBtn = document.getElementById("editUploadImageBtn");
    let currentEditRow: HTMLElement | null = null;

    const editClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest<HTMLElement>(".btn-edit");
      if (!editBtn) return;
      currentEditRow = editBtn.closest("tr");
      if (!currentEditRow) return;
      const itemName =
        currentEditRow.querySelector<HTMLElement>(".item-name")?.innerText ?? "";
      const priceValue =
        currentEditRow
          .querySelector<HTMLElement>(".item-price")
          ?.innerText.replace(/[^0-9]/g, "") ?? "";
      const isActive =
        currentEditRow.querySelector<HTMLInputElement>(".switch input")
          ?.checked ?? false;
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
      if (editItemDescInput) editItemDescInput.value = "";
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

    const updateItemHandler = () => {
      if (!currentEditRow) return;
      const newName =
        (
          document.getElementById("editItemNameInput") as HTMLInputElement | null
        )?.value.trim() ?? "";
      const newPrice =
        (
          document.getElementById(
            "editItemPriceInput"
          ) as HTMLInputElement | null
        )?.value.trim() ?? "";
      const nameCell = currentEditRow.querySelector<HTMLElement>(".item-name");
      const priceCell = currentEditRow.querySelector<HTMLElement>(".item-price");
      if (newName && nameCell) nameCell.innerText = newName;
      if (newPrice && priceCell) priceCell.innerText = `Rs.${newPrice}`;
      const isNowActive =
        document
          .getElementById("editStatusActiveBtn")
          ?.classList.contains("active-segment") ?? false;
      const switchInput = currentEditRow.querySelector<HTMLInputElement>(
        ".switch input"
      );
      if (switchInput) switchInput.checked = isNowActive;
      const editThumb = document.getElementById("editThumbFrame");
      const newImg = editThumb?.querySelector<HTMLImageElement>("img");
      if (newImg) {
        const placeholderDiv =
          currentEditRow.querySelector<HTMLElement>(".placeholder-img");
        if (placeholderDiv)
          placeholderDiv.innerHTML = `<img src="${newImg.src}" style="width:52px;height:52px;object-fit:cover;border-radius:4px;">`;
      }
      editItemFormView?.classList.remove("active-view");
      mainDirectoryView?.classList.add("active-view");
      setTimeout(updateScrollbar, 50);
    };
    updateItemFormBtn?.addEventListener("click", updateItemHandler);

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
      if (
        containVariantCheckbox?.checked
      ) {
        singlePriceSection!.style.display = "none";
        variantSection!.style.display = "block";
      } else {
        singlePriceSection!.style.display = "block";
        variantSection!.style.display = "none";
      }
    };

    const variantRowsContainer =
      document.getElementById("variantRows");

    const addVariantRow = () => {
      if (!variantRowsContainer) return;

      const row = document.createElement("div");

      row.className = "variant-row";

      row.style.display = "grid";
      row.style.gridTemplateColumns = "1fr 1fr auto auto";
      row.style.gap = "15px";
      row.style.alignItems = "center";
      row.style.marginBottom = "15px";

      row.innerHTML = `
          <div>
            <label>Price</label>
            <div class="price-input-wrapper">
              <span class="price-prefix-badge">Rs.</span>
              <input type="text" class="form-input variant-price" />
            </div>
          </div>

          <div>
            <label>Item Variant</label>
            <select class="form-input variant-select">
              <option value="">Select Item Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Regular">Regular</option>
            </select>
          </div>

          <button
            type="button"
            class="circle-action-btn add-variant-btn"
          >
            <i class="fa-solid fa-plus"></i>
          </button>

          <button
            type="button"
            class="circle-action-btn delete-variant-btn"
            style="background:#222;color:#fff;"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
      `;

      variantRowsContainer.appendChild(row);
    };

    const variantClickHandler = (e: Event) => {
      const target = e.target as HTMLElement;

      const addBtn = target.closest(".add-variant-btn");
      const deleteBtn = target.closest(".delete-variant-btn");

      if (addBtn) {
        addVariantRow();
      }

      if (deleteBtn) {
        const row = deleteBtn.closest(".variant-row");

        if (
          row &&
          document.querySelectorAll(".variant-row").length > 1
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
      ?.addEventListener("click", addVariantRow);



    // ===== CUSTOMIZATION =====
    const addCustomizationCheckbox =
      document.getElementById(
        "addCustomizationCheckbox"
      ) as HTMLInputElement | null;

    const customizationSection =
      document.getElementById("customizationSection");

    const handleCustomizationToggle = () => {
      if (addCustomizationCheckbox?.checked) {
        customizationSection!.style.display = "block";
      } else {
        customizationSection!.style.display = "none";
      }
    };

    addCustomizationCheckbox?.addEventListener(
      "change",
      handleCustomizationToggle
    );

    // ===== SEARCH & FILTER =====
    const searchInput = document.getElementById(
      "search"
    ) as HTMLInputElement | null;
    const categoryFilterSelect = document.getElementById(
      "categoryFilterSelect"
    ) as HTMLSelectElement | null;
    const showingEntriesText = document.getElementById("showingEntriesText");

    function applyFilters() {
      if (!searchInput || !categoryFilterSelect || !mainItemsTable) return;
      const searchTerm = searchInput.value.trim().toLowerCase();
      const selectedCategory = categoryFilterSelect.value;
      const allRows = mainItemsTable.querySelectorAll<HTMLElement>("tbody tr");
      let visibleCount = 0;
      allRows.forEach((row) => {
        const itemNameEl = row.querySelector<HTMLElement>(".item-name");
        const itemName = itemNameEl ? itemNameEl.innerText.toLowerCase() : "";
        const rowCategory = row.getAttribute("data-category") || "";
        const matchesSearch =
          searchTerm === "" || itemName.includes(searchTerm);
        const matchesCategory =
          selectedCategory === "all" || rowCategory === selectedCategory;
        if (matchesSearch && matchesCategory) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });
      const totalRows = allRows.length;
      if (showingEntriesText)
        showingEntriesText.textContent =
          visibleCount === 0
            ? "No entries found"
            : `Showing 1 to ${visibleCount} of ${totalRows} entries`;
      setTimeout(updateScrollbar, 50);
    }

    searchInput?.addEventListener("input", applyFilters);
    categoryFilterSelect?.addEventListener("change", applyFilters);

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
      submitNewItemFormBtn?.removeEventListener("click", submitNewHandler);
      segmentedCleanups.forEach((fn) => fn());
      document.removeEventListener("click", closeDropdownsHandler);
      openQuickEditBtn?.removeEventListener("click", openQuickEditHandler);
      cancelQuickChangesBtn?.removeEventListener("click", cancelQuickHandler);
      saveQuickChangesBtn?.removeEventListener("click", saveQuickHandler);
      confirmCancelBtn?.removeEventListener("click", confirmCancelHandler);
      confirmYesBtn?.removeEventListener("click", confirmYesHandler);
      document.removeEventListener("click", editClickHandler);
      cancelEditItemFormBtn?.removeEventListener("click", cancelEditHandler);
      updateItemFormBtn?.removeEventListener("click", updateItemHandler);
      editUploadImageBtn?.removeEventListener("click", editUploadHandler);
      searchInput?.removeEventListener("input", applyFilters);
      categoryFilterSelect?.removeEventListener("change", applyFilters);
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
                  defaultValue="all"
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
                <button className="btn btn-help">
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
                    <input type="text" id="search" placeholder="Search items..." />
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
                      {items.map((category) =>
                        category.item_list?.map((item: any) => (
                          <tr key={item.item_Id}>
                            <td>{item.item_Name}</td>
                            <td>Rs. {item.price}</td>

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
                                <button className="circle-action-btn btn-delete" title="Delete"
                                  onClick={() => handleDelete(item.item_Id)}>
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
                                <input
                                  type="checkbox"
                                  checked={item.status === 1}
                                  readOnly
                                />
                                <span className="slider"></span>
                              </label>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <div id="showingEntriesText">
                    Showing {totalItems > 0 ? 1 : 0} to {totalItems} of {totalItems} entries

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
                  <div className="form-group">
                    <label className="form-label">
                      Item Name<span className="required-star">*</span>
                    </label>
                    {/* <input type="text" className="form-input" /> */}
                    <input
                      type="text"
                      className="form-input"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Item Description</label>
                    {/* <textarea className="form-input form-textarea" defaultValue=""></textarea> */}
                    <textarea
                      className="form-input form-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
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
                      <span className="price-prefix-badge">Rs.</span>
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

                      <div
                        className="variant-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr auto auto",
                          gap: "15px",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <label>Price</label>
                          <div className="price-input-wrapper">
                            <span className="price-prefix-badge">Rs.</span>
                            <input type="text" className="form-input variant-price" />
                          </div>
                        </div>

                        <div>
                          <label>Item Variant</label>
                          <select className="form-input variant-select">
                            <option value="">Select Item Size</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                            <option value="Regular">Regular</option>
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
                    style={{ marginBottom: "12px" }}
                  >
                    <input type="checkbox" id="containsChoices" />
                    Do this Item contains Choices?
                  </label>

                  <label className="checkbox-container-label">
                    <input type="checkbox" id="containsExtras" />
                    Do this Item contains Extras?
                  </label>
                </div>

                <h3>Menu List : *</h3>
                <label className="checkbox-option-item">
                  <input type="checkbox" /> Breakfast
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" /> Dinnermenu
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" /> Lunch Menu
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" /> Extra
                </label>
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
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <div className="price-input-wrapper">
                      <span className="price-prefix-badge">Rs.</span>
                      <input type="text" className="form-input" id="editItemPriceInput" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-container-label">
                      <input type="checkbox" id="editContainSize" /> Contain Size
                    </label>
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
                <h3>Menu List : *</h3>
                <label className="checkbox-option-item">
                  <input type="checkbox" className="edit-menu-check" value="Breakfast" /> Breakfast
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" className="edit-menu-check" value="Dinnermenu" /> Dinnermenu
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" className="edit-menu-check" value="Lunch Menu" /> Lunch Menu
                </label>
                <label className="checkbox-option-item">
                  <input type="checkbox" className="edit-menu-check" value="Extra" /> Extra
                </label>
              </div>
              <div className="action-footer-row">
                <button className="btn btn-form-add" id="updateItemFormBtn">
                  UPDATE
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
                  <th>Item Price (Rs.)</th>
                  <th>Weight</th>
                  <th>Unit</th>
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
