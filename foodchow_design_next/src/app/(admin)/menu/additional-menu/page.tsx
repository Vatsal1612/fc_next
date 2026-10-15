"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { menuService, type AddShopMenuPayload, type ShopMenuType, type TimingPayload, type MenuItemPayload, type AdditionalMenuCategory } from "@/api/services/menu.service";
import { useShopId } from "@/utils/shop";
import "./page.css";

const QR_SVG = (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M7 17h.01M17 7h.01M7 7h.01" />
  </svg>
);

const EDIT_SVG = (
  <svg viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const VIEW_SVG = (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DELETE_SVG = (
  <svg viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);


const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdditionalMenuPage() {
  const SHOP_ID = useShopId();
  const [menus, setMenus] = useState<ShopMenuType[]>([]);
  const [categories, setCategories] = useState<AdditionalMenuCategory[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemPayload[]>([]);
  const [timings, setTimings] = useState<TimingPayload[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [qrModalMenu, setQrModalMenu] = useState<ShopMenuType | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

  const loadMenus = async () => {
    if (!SHOP_ID) return;
    try {
      const response = await menuService.getAllShopMenuType(SHOP_ID);
      setMenus(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load menus:", error);
    }
  };

  const loadCategories = async () => {
    if (!SHOP_ID) return;
    try {
      const result = await menuService.getItemsForMenuType(SHOP_ID);
      if (result?.CategoryList) {
        setCategories(result.CategoryList);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    if (SHOP_ID) {
      loadMenus();
      loadCategories();
    }
  }, [SHOP_ID]);

  const handleExpandAll = () => {
    const allOpen: Record<number, boolean> = {};
    categories.forEach((cat) => {
      allOpen[cat.CategryId] = true;
    });
    setOpenCategories(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenCategories({});
  };

  const toggleCategory = (catId: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCancel = () => {
    setEditingMenuId(null);
    setMenuName("");
    setMenuItems([]);
    setCurrentStep(1);
    setViewMode("list");
  };

  const handleSaveMenu = async () => {
    try {
      console.log("editingMenuId =", editingMenuId);

      console.log("Menu Items");
      console.log(menuItems);

      console.log("Timings");
      console.log(timings);

      const payload: AddShopMenuPayload = {
        id: editingMenuId ? editingMenuId.toString() : "",
        menu_name: menuName.trim(),
        description: "",
        shop_id: SHOP_ID.toString(),
        status: "1",
        IsItemUpdated: 1,
        menuItemList: menuItems,
        timingList: timings,
      };

      console.log("Payload");
      console.log(JSON.stringify(payload, null, 2));

      // console.log("Update Payload:", payload);
      console.log("========= UPDATE PAYLOAD =========");
      console.log(JSON.stringify(payload, null, 2));

      const response = editingMenuId
        ? await menuService.updateShopMenu(payload)
        : await menuService.addShopMenu(payload);

      if (response.response_code === "1") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Your Menu has been saved successfully!",
        });

        setEditingMenuId(null);
        setMenuName("");
        setMenuItems([]);
        setTimings(
          DAYS.map(day => ({
            shop_id: SHOP_ID.toString(),
            menu_id: 0,
            days_name: day,
            open_time: "",
            close_time: "",
            close_day: 0,
            is_24hours: 1,
          }))
        );

        await loadMenus();
        setViewMode("list");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to save menu.",
        });
      }
    } catch (err: any) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong while saving menu.",
      });
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      const response = await menuService.deleteShopMenu(menuId);
      if (response.response_code === "1") {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.message || "Menu deleted successfully.",
        });
        await loadMenus();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to delete menu.",
        });
      }
    } catch (error: any) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to delete menu",
      });
    }
  };

  const handleEditMenu = async (menu: ShopMenuType) => {
    setEditingMenuId(menu.id);
    setMenuName(menu.menu_name);
    setCurrentStep(1);
    setViewMode("form");

    try {
      const items = await menuService.getItemsForSelectedMenu(
        SHOP_ID,
        menu.id
      );
      const timingsRes = await menuService.getShopCustomMenuTimings(
        menu.id
      );
      setMenuItems(Array.isArray(items) ? items : []);
      setTimings(Array.isArray(timingsRes) ? timingsRes : []);
    } catch (err) {
      console.error("Failed to load menu details:", err);
    }
  };

  const router = useRouter();

  const handleOpenAddMenu = () => {
    router.push("/menu/additional-menu/add");
  };

  const isItemSelected = (itemId: number) => {
    return menuItems.some((mi) => String(mi.item_id) === String(itemId));
  };

  const toggleItem = (category: AdditionalMenuCategory, item: any) => {
    setMenuItems((prev) => {
      const exists = prev.some((mi) => String(mi.item_id) === String(item.ItemId));
      if (exists) {
        return prev.filter((mi) => String(mi.item_id) !== String(item.ItemId));
      } else {
        const p = String(item.Price ?? 0);
        return [
          ...prev,
          {
            shop_id: String(SHOP_ID),
            menu_id: editingMenuId ? String(editingMenuId) : "0",
            category_id: String(category.CategryId),
            item_id: String(item.ItemId),
            size_id: 0,
            Price: p,
            TotalPrice: p,
            itemTaxList: "",
          },
        ];
      }
    });
  };

  const isCategorySelected = (category: AdditionalMenuCategory) => {
    if (!category.ItemListWidget || category.ItemListWidget.length === 0) return false;
    return category.ItemListWidget.every((item) =>
      menuItems.some((mi) => String(mi.item_id) === String(item.ItemId))
    );
  };

  const toggleCategorySelect = (category: AdditionalMenuCategory) => {
    const allSelected = isCategorySelected(category);
    if (allSelected) {
      const itemIds = new Set(category.ItemListWidget.map((i) => String(i.ItemId)));
      setMenuItems((prev) => prev.filter((mi) => !itemIds.has(String(mi.item_id))));
    } else {
      const newItems = (category.ItemListWidget || [])
        .filter((item) => !menuItems.some((mi) => String(mi.item_id) === String(item.ItemId)))
        .map((item) => ({
          shop_id: String(SHOP_ID),
          menu_id: editingMenuId ? String(editingMenuId) : "0",
          category_id: String(category.CategryId),
          item_id: String(item.ItemId),
          size_id: 0,
          Price: String(item.Price ?? 0),
          TotalPrice: String(item.Price ?? 0),
          itemTaxList: "",
        }));
      setMenuItems((prev) => [...prev, ...newItems]);
    }
  };


  const handleMenuStatusChange = async (
    menuId: number,
    menuType: "online" | "pos",
    checked: boolean
  ) => {
    try {

      const status = checked ? 1 : 0;
      const apiType = menuType === "online" ? "oo" : "pos";

      console.log("Updating menu status:", {
        menuId,
        menuType,
        apiType,
        status,
        SHOP_ID,
      });

      // Optimistically update UI immediately
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? {
                ...menu,
                ...(menuType === "online"
                  ? { for_online: status }
                  : { for_pos: status }),
              }
            : menu
        )
      );

      const response = await menuService.updateMenuStatus(
        menuId,
        apiType,
        status,
        SHOP_ID
      );

      console.log("updateMenuStatus response:", response);

      const isSuccess =
        response?.response_code === "1" ||
        response?.status === 200 ||
        response?.message === "SUCCESS" ||
        response?.data === "Menu Updated successfully !";

      if (isSuccess) {
        const typeLabel = menuType === "online" ? "Online Order" : "POS";
        const stateLabel = checked ? "enabled" : "disabled";
        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: response.data || response.message || `${typeLabel} ${stateLabel} successfully!`,
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        // Revert on failure
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId
              ? {
                  ...menu,
                  ...(menuType === "online"
                    ? { for_online: checked ? 0 : 1 }
                    : { for_pos: checked ? 0 : 1 }),
                }
              : menu
          )
        );
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.message || "Failed to update menu status",
        });
      }
    } catch (err: any) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Failed to update menu status",
      });
    }
  };

  const updateTiming = (
    day: string,
    field: keyof TimingPayload,
    value: any
  ) => {
    setTimings((prev) =>
      prev.map((t) =>
        (t.days_name ?? "").toLowerCase() === day.toLowerCase()
          ? {
            ...t,
            [field]: value,
          }
          : t
      )
    );
  };

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ── Sidebar nav (kept faithfully; sidebar markup is rendered by shell, so
    //    these selectors may match nothing but the handlers are harmless) ──
    const menuItems = document.querySelectorAll<HTMLElement>(".menu-item");
    const submenuGroups =
      document.querySelectorAll<HTMLElement>(".submenu-group");

    menuItems.forEach((item) => {
      const handler = function (this: HTMLElement) {
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
                .querySelectorAll<HTMLElement>(".submenu-item")
                .forEach((s) => s.classList.remove("active"));
              firstSubItem.classList.add("active");
            }
          }
        }
      };
      item.addEventListener("click", handler);
      cleanups.push(() => item.removeEventListener("click", handler));
    });

    const submenuItems =
      document.querySelectorAll<HTMLElement>(".submenu-item");
    submenuItems.forEach((item) => {
      const handler = function (this: HTMLElement) {
        document
          .querySelectorAll<HTMLElement>(".submenu-item")
          .forEach((s) => s.classList.remove("active"));
        this.classList.add("active");
      };
      item.addEventListener("click", handler);
      cleanups.push(() => item.removeEventListener("click", handler));
    });

    // ── Dropdown handling ──
    const onWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".topbar-dropdown") &&
        !target.closest(".additional-menu-dropdown")
      ) {
        document
          .querySelectorAll<HTMLElement>(".dropdown-menu")
          .forEach((menu) => menu.classList.remove("show"));
      }
    };
    window.addEventListener("click", onWindowClick);
    cleanups.push(() => window.removeEventListener("click", onWindowClick));

    // ── View switching / wizard logic ──
    const listView = document.getElementById("shop-menu-list-view");
    const addFormView = document.getElementById("add-shop-menu-form-view");
    const updateFormView = document.getElementById(
      "update-shop-menu-form-view"
    );

    const step1Content = document.getElementById("wizard-step-1-content");
    const step2Content = document.getElementById("wizard-step-2-content");
    const stepNode1 = document.getElementById("step-node-1");
    const stepNode2 = document.getElementById("step-node-2");
    const openAddBtn = document.getElementById("open-add-menu-btn");
    const cancelFormBtn = document.getElementById("cancel-menu-btn");

    const cancelUpdateBtn = document.getElementById("cancel-update-btn");
    const submitUpdateBtn = document.getElementById("submit-update-btn");
    const backToStep1Btn = document.getElementById("back-to-step1-btn");

    const modal = document.getElementById("delete-confirmation-modal");
    const modalCancel = document.getElementById("modal-cancel-btn");
    const modalConfirm = document.getElementById("modal-confirm-btn");

    const taxModalOverlay = document.getElementById("select-tax-modal-view");
    const taxCloseTrigger = document.getElementById("tax-close-trigger");
    const taxApplyTrigger = document.getElementById("tax-apply-trigger");
    const netPriceDisplay = document.getElementById("modal-net-price-display");
    const finalPriceDisplay = document.getElementById(
      "modal-final-price-display"
    );
    const taxCheckboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="tax-item-choice"]'
    );

    let rowToDelete: HTMLElement | null = null;

    function showList() {
      if (addFormView) addFormView.style.display = "none";
      if (updateFormView) updateFormView.style.display = "none";
      if (listView) listView.style.display = "flex";
    }

    function goToStep1() {
      if (step2Content) step2Content.style.display = "none";
      if (step1Content) step1Content.style.display = "block";
      if (stepNode1) stepNode1.className = "w-step active";
      if (stepNode2) stepNode2.className = "w-step upcoming";
    }

    function goToStep2() {
      if (step1Content) step1Content.style.display = "none";
      if (step2Content) step2Content.style.display = "block";
      if (stepNode1) stepNode1.className = "w-step active";
      if (stepNode2) stepNode2.className = "w-step active";
    }

    // const onOpenAdd = () => {
    //   if (listView) listView.style.display = "none";
    //   if (addFormView) addFormView.style.display = "block";
    // };


    const onOpenAdd = () => {

      setEditingMenuId(null);

      setMenuName("");

      setMenuItems([]);

      setTimings(
        DAYS.map(day => ({
          shop_id: SHOP_ID.toString(),
          menu_id: 0,
          days_name: day,
          open_time: "",
          close_time: "",
          close_day: 0,
          is_24hours: 0,
        }))
      );

      goToStep1();

      if (listView) listView.style.display = "none";

      if (updateFormView)
        updateFormView.style.display = "block";
    };

    const onCancelForm = () => showList();
    const onCancelUpdate = () => showList();
    const onSubmitUpdate = () => goToStep2();
    const onBackToStep1 = () => goToStep1();

    if (openAddBtn) {
      openAddBtn.addEventListener("click", onOpenAdd);
      cleanups.push(() => openAddBtn.removeEventListener("click", onOpenAdd));
    }
    if (cancelFormBtn) {
      cancelFormBtn.addEventListener("click", onCancelForm);
      cleanups.push(() =>
        cancelFormBtn.removeEventListener("click", onCancelForm)
      );
    }

    if (cancelUpdateBtn) {
      cancelUpdateBtn.addEventListener("click", onCancelUpdate);
      cleanups.push(() =>
        cancelUpdateBtn.removeEventListener("click", onCancelUpdate)
      );
    }
    if (submitUpdateBtn) {
      submitUpdateBtn.addEventListener("click", onSubmitUpdate);
      cleanups.push(() =>
        submitUpdateBtn.removeEventListener("click", onSubmitUpdate)
      );
    }
    if (backToStep1Btn) {
      backToStep1Btn.addEventListener("click", onBackToStep1);
      cleanups.push(() =>
        backToStep1Btn.removeEventListener("click", onBackToStep1)
      );
    }
    // if (finishUpdateBtn) {
    //   finishUpdateBtn.addEventListener("click", onFinishUpdate);
    //   cleanups.push(() =>
    //     finishUpdateBtn.removeEventListener("click", onFinishUpdate)
    //   );
    // }

    // document.querySelectorAll<HTMLElement>(".icon-btn.edit").forEach((button) => {
    //   const handler = function (this: HTMLElement) {
    //     const row = this.closest(".menu-table-row");
    //     const currentMenuName =
    //       row?.querySelector(".col-menu-name")?.textContent?.trim() ?? "";
    //     showUpdateForm(currentMenuName);
    //   };
    //   button.addEventListener("click", handler);
    //   cleanups.push(() => button.removeEventListener("click", handler));
    // });

    document
      .querySelectorAll<HTMLElement>(".icon-btn.delete")
      .forEach((button) => {
        const handler = function (this: HTMLElement) {
          rowToDelete = this.closest(".menu-table-row");
          if (modal) modal.style.display = "flex";
        };
        button.addEventListener("click", handler);
        cleanups.push(() => button.removeEventListener("click", handler));
      });

    if (modalCancel) {
      const handler = () => {
        if (modal) modal.style.display = "none";
        rowToDelete = null;
      };
      modalCancel.addEventListener("click", handler);
      cleanups.push(() => modalCancel.removeEventListener("click", handler));
    }

    if (modalConfirm) {
      const handler = () => {
        if (rowToDelete) {
          rowToDelete.style.opacity = "0";
          const node = rowToDelete;
          setTimeout(() => {
            node.remove();
            rowToDelete = null;
          }, 150);
        }
        if (modal) modal.style.display = "none";
      };
      modalConfirm.addEventListener("click", handler);
      cleanups.push(() => modalConfirm.removeEventListener("click", handler));
    }

    document.querySelectorAll<HTMLElement>(".accordion-row").forEach((row) => {
      const handler = function (this: HTMLElement, e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.closest('input[type="checkbox"]')) {
          return;
        }
        const wrapper = this.closest(".accordion-wrapper");
        if (wrapper) {
          wrapper.classList.toggle("open");
        }
      };
      row.addEventListener("click", handler);
      cleanups.push(() => row.removeEventListener("click", handler));
    });

    const globalExpandBtn = document.getElementById("global-expand-btn");
    const globalCollapseBtn = document.getElementById("global-collapse-btn");

    if (globalExpandBtn) {
      const handler = () => {
        document
          .querySelectorAll<HTMLElement>(".accordion-wrapper")
          .forEach((wrapper) => wrapper.classList.add("open"));
      };
      globalExpandBtn.addEventListener("click", handler);
      cleanups.push(() => globalExpandBtn.removeEventListener("click", handler));
    }

    if (globalCollapseBtn) {
      const handler = () => {
        document
          .querySelectorAll<HTMLElement>(".accordion-wrapper")
          .forEach((wrapper) => wrapper.classList.remove("open"));
      };
      globalCollapseBtn.addEventListener("click", handler);
      cleanups.push(() =>
        globalCollapseBtn.removeEventListener("click", handler)
      );
    }

    function calculateTotalTaxedPrice() {
      const baseValue = parseFloat(netPriceDisplay?.textContent ?? "") || 0;
      let combinedTaxPercentage = 0;

      taxCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          combinedTaxPercentage += parseFloat(checkbox.value) || 0;
        }
      });

      const finalCalculatedAmount =
        baseValue + baseValue * (combinedTaxPercentage / 100);
      if (finalPriceDisplay)
        finalPriceDisplay.textContent = finalCalculatedAmount.toFixed(2);
    }

    taxCheckboxes.forEach((box) => {
      box.addEventListener("change", calculateTotalTaxedPrice);
      cleanups.push(() =>
        box.removeEventListener("change", calculateTotalTaxedPrice)
      );
    });

    document
      .querySelectorAll<HTMLElement>(".btn-select-tax")
      .forEach((btn) => {
        const handler = function (this: HTMLElement) {
          const parentCard = this.closest(".inner-item-card");
          const activePriceInputField =
            parentCard?.querySelector<HTMLInputElement>(".item-price-field");

          const entryPrice = parseFloat(activePriceInputField?.value ?? "") || 0;

          if (netPriceDisplay)
            netPriceDisplay.textContent = entryPrice.toFixed(2);
          if (finalPriceDisplay)
            finalPriceDisplay.textContent = entryPrice.toFixed(2);

          taxCheckboxes.forEach((box) => (box.checked = false));

          if (taxModalOverlay) {
            taxModalOverlay.style.display = "flex";
          }
        };
        btn.addEventListener("click", handler);
        cleanups.push(() => btn.removeEventListener("click", handler));
      });

    if (taxCloseTrigger) {
      const handler = () => {
        if (taxModalOverlay) taxModalOverlay.style.display = "none";
      };
      taxCloseTrigger.addEventListener("click", handler);
      cleanups.push(() => taxCloseTrigger.removeEventListener("click", handler));
    }

    if (taxApplyTrigger) {
      const handler = () => {
        if (taxModalOverlay) taxModalOverlay.style.display = "none";
      };
      taxApplyTrigger.addEventListener("click", handler);
      cleanups.push(() => taxApplyTrigger.removeEventListener("click", handler));
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div id="pg-menu-additional-menu">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="app-container">
        {/* Main Content Area */}
        <div className="main">
          <div className="content-area">
            <div id="shop-menu-list-view" style={{ display: viewMode === "list" ? "block" : "none" }}>
              <div className="content-card">
                <div className="page-header">
                  <div className="typ-page-heading page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Shop Menu</h1>
                  </div>
                  <div className="header-actions">
                    <button
                      className="btn-action-primary"
                      id="open-add-menu-btn"
                      onClick={handleOpenAddMenu}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="3"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      ADD NEW MENU
                    </button>
                    <button
                      className="btn-help"
                      onClick={() => window.open("https://vimeo.com/1075945406", "_blank")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2.5"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      HELP
                    </button>
                  </div>
                </div>

                <div className="menu-table-wrapper">
                  <div className="menu-table-header">
                    <div className="col-left">Menu Name</div>
                    <div>Download QR Code</div>
                    <div className="col-left" style={{ paddingLeft: "12px" }}>
                      Menu Available For
                    </div>
                    <div>Action Controls</div>
                  </div>

                  <div className="menu-table-body">
                    {menus.map((menu) => (
                      <div className="menu-table-row" key={menu.id}>
                        <div className="col-menu-name">
                          {menu.menu_name}
                        </div>

                        <div className="action-center-wrap">
                          <button
                            className="qr-code-trigger"
                            title="Download QR Code"
                            onClick={() => setQrModalMenu(menu)}
                          >
                            {QR_SVG}
                          </button>
                        </div>

                        <div className="availability-stack">
                          <label className="check-label-item">
                            <input
                              type="checkbox"
                              checked={menu.for_online === 1}
                              onChange={(e) =>
                                handleMenuStatusChange(
                                  menu.id,
                                  "online",
                                  e.target.checked
                                )
                              }
                            />
                            Online Order
                          </label>

                          <label className="check-label-item">
                            <input
                              type="checkbox"
                              checked={menu.for_pos === 1}
                              onChange={(e) =>
                                handleMenuStatusChange(
                                  menu.id,
                                  "pos",
                                  e.target.checked
                                )
                              }
                            />
                            POS
                          </label>
                        </div>

                        <div className="action-center-wrap">
                          <button className="icon-btn edit"
                            title="Edit Menu"
                            onClick={() => handleEditMenu(menu)}
                          >
                            {EDIT_SVG}
                          </button>

                          <button
                            className="icon-btn view"
                            title="View Menu"
                            onClick={() => {
                              if (menu.menu_url) {
                                window.open(menu.menu_url, "_blank");
                              } else {
                                window.open(`https://foodchow.com/menu/${SHOP_ID}/${menu.id}`, "_blank");
                              }
                            }}
                          >
                            {VIEW_SVG}
                          </button>

                          <button className="icon-btn delete"
                            title="Delete Menu"
                            onClick={() => {
                              setDeleteMenuId(menu.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            {DELETE_SVG}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <WizardFooter />
            </div>

            <div id="update-shop-menu-form-view" style={{ display: viewMode === "form" ? "block" : "none" }}>
              <div className="content-card">
                <div className="page-header">
                  <div className="page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>
                      {editingMenuId ? "Update New Shop Menu" : "Add New Shop Menu"}
                    </h1>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        marginTop: "4px",
                      }}
                    >
                      (Breakfast, Lunch, Dinner, Catering etc.)
                    </p>
                  </div>
                </div>

                <div className="wizard-steps">
                  <div
                    className={`w-step ${currentStep === 1 ? "active" : "complete"}`}
                    id="step-node-1"
                    onClick={() => setCurrentStep(1)}
                    style={{ cursor: "pointer" }}
                  >
                    1
                  </div>
                  <div
                    className={`w-step ${currentStep === 2 ? "active" : "upcoming"}`}
                    id="step-node-2"
                    onClick={() => {
                      if (menuName.trim()) setCurrentStep(2);
                    }}
                    style={{ cursor: menuName.trim() ? "pointer" : "default" }}
                  >
                    2
                  </div>
                </div>

                <div id="wizard-step-1-content" style={{ display: currentStep === 1 ? "block" : "none" }}>
                  <div className="inner-form-card">
                    <h2>Menu Information</h2>

                    <div
                      className="form-group"
                      style={{ maxWidth: "450px", marginBottom: "24px" }}
                    >
                      <label style={{ fontSize: "13.5px" }}>
                        Menu Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        id="update-menu-name-input"
                        className="form-input-field"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label
                        style={{ fontSize: "13.5px", marginBottom: "4px" }}
                      >
                        Menu Display Time <span>*</span>
                      </label>

                      {/* <div className="time-schedule-grid">
                        {DAYS.map((day) => {
                          const key = day.toLowerCase();
                          return (
                            <div className="schedule-row" key={day}>
                              <div className="check-label-item">
                                <input type="checkbox" defaultChecked />
                              </div>
                              <div className="day-lbl">{day} :</div>
                              <div className="radio-options-group">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name={`${key}-time`}
                                    value="close"
                                  />{" "}
                                  Close
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name={`${key}-time`}
                                    value="24hrs"
                                  />{" "}
                                  24 Hrs
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name={`${key}-time`}
                                    value="timings"
                                    defaultChecked
                                  />{" "}
                                  Timings
                                </label>
                              </div>
                              <div className="time-inputs-wrap">
                                <input
                                  type="text"
                                  className="time-select-input"
                                  defaultValue="12:00 PM"
                                />
                                <span className="time-span-txt">To</span>
                                <input
                                  type="text"
                                  className="time-select-input"
                                  defaultValue="07:00 am"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div> */}

                      <div className="time-schedule-grid">
                        {DAYS.map((day) => {
                          console.log("timings state =", timings);
                          console.log("Array?", Array.isArray(timings));
                          console.log("typeof", typeof timings);
                          const timing = timings.find(
                            (t) => (t.days_name ?? "").toLowerCase() === day.toLowerCase()
                          );
                          console.log(day, timing);

                          return (
                            <div className="schedule-row" key={day}>
                              <div className="check-label-item">
                                <input
                                  type="checkbox"
                                  checked={timing?.close_day !== 1}
                                  readOnly
                                />
                              </div>

                              <div className="day-lbl">{day} :</div>

                              <div className="radio-options-group">
                                <label className="radio-label">
                                  {/* <input
                                    type="radio"
                                    checked={timing?.close_day === 1}
                                    readOnly
                                  /> */}

                                  <input
                                    type="radio"
                                    name={`${day}-time`}
                                    checked={timing?.close_day === 1}
                                    onChange={() => {
                                      updateTiming(day, "close_day", 1);
                                      updateTiming(day, "is_24hours", 0);
                                    }}
                                  />
                                  Close
                                </label>

                                <label className="radio-label">
                                  {/* <input
                                    type="radio"
                                    checked={timing?.is_24hours === 1}
                                    readOnly
                                  /> */}
                                  <input
                                    type="radio"
                                    name={`${day}-time`}
                                    checked={timing?.is_24hours === 1}
                                    onChange={() => {
                                      updateTiming(day, "close_day", 0);
                                      updateTiming(day, "is_24hours", 1);
                                    }}
                                  />
                                  24 Hrs
                                </label>

                                <label className="radio-label">
                                  {/* <input
                                    type="radio"
                                    checked={
                                      timing?.close_day !== 1 &&
                                      timing?.is_24hours !== 1
                                    }
                                    readOnly
                                  /> */}
                                  <input
                                    type="radio"
                                    name={`${day}-time`}
                                    checked={
                                      timing?.close_day !== 1 &&
                                      timing?.is_24hours !== 1
                                    }
                                    onChange={() => {
                                      updateTiming(day, "close_day", 0);
                                      updateTiming(day, "is_24hours", 0);
                                    }}
                                  />
                                  Timings
                                </label>
                              </div>

                              <div className="time-inputs-wrap">
                                {/* <input
                                  type="text"
                                  className="time-select-input"
                                  value={timing?.open_time ?? ""}
                                  
                                /> */}
                                <input
                                  type="text"
                                  className="time-select-input"
                                  value={timing?.open_time ?? ""}
                                  onChange={(e) =>
                                    updateTiming(day, "open_time", e.target.value)
                                  }
                                />

                                <span className="time-span-txt">To</span>

                                {/* <input
                                  type="text"
                                  className="time-select-input"
                                  value={timing?.close_time ?? ""}
                                  
                                /> */}
                                <input
                                  type="text"
                                  className="time-select-input"
                                  value={timing?.close_time ?? ""}
                                  onChange={(e) =>
                                    updateTiming(day, "close_time", e.target.value)
                                  }
                                />

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="status-toggle-wrap">
                      <span className="status-lbl">Status</span>
                      <div className="radio-options-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="menu-active-status"
                            value="active"
                            defaultChecked
                          />{" "}
                          Active
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="menu-active-status"
                            value="deactive"
                          />{" "}
                          De-Active
                        </label>
                      </div>
                    </div>

                    <div
                      className="form-actions-row"
                      style={{ border: "none", paddingTop: 0 }}
                    >
                      <button
                        className="btn-wizard-next"
                        id="submit-update-btn"
                        type="button"
                        style={{ padding: "10px 24px", fontSize: "13.5px" }}
                        onClick={async () => {
                          if (!menuName.trim()) {
                            await Swal.fire({
                              icon: "warning",
                              title: "Required",
                              text: "Please enter a menu name.",
                            });
                            return;
                          }
                          setCurrentStep(2);
                        }}
                      >
                        NEXT
                      </button>
                      <button
                        className="btn-form btn-form-cancel"
                        id="cancel-update-btn"
                        type="button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div id="wizard-step-2-content" style={{ display: currentStep === 2 ? "block" : "none" }}>
                  <div className="inner-form-card">
                    <h2 className="section-subtitle-step2">
                      Set Items For Menu:{" "}
                      <span id="target-menu-label-text">{menuName || "Menu"}</span>
                    </h2>

                    <div className="step2-action-bar">
                      <button
                        type="button"
                        className="btn-toggle-all"
                        id="global-expand-btn"
                        onClick={handleExpandAll}
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        className="btn-toggle-all"
                        id="global-collapse-btn"
                        onClick={handleCollapseAll}
                      >
                        Collapse All
                      </button>
                    </div>

                    {/*  <div className="accordion-stack">
                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" defaultChecked />
                            </label>
                            <span className="accordion-title">Pasta</span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <div className="inner-item-card">
                              <div className="inner-item-left">
                                <label className="check-label-item">
                                  <input type="checkbox" defaultChecked />
                                </label>
                                <span className="inner-item-title">
                                  Red Sauce Pasta
                                </span>
                              </div>
                              <div className="inner-item-right">
                                <div className="price-info-wrap">
                                  <span>Price :</span>
                                  <input
                                    type="text"
                                    className="item-price-field"
                                    defaultValue="190"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn-select-tax"
                                >
                                  Select Tax
                                </button>
                              </div>
                            </div>
                            <div className="inner-item-card">
                              <div className="inner-item-left">
                                <label className="check-label-item">
                                  <input type="checkbox" defaultChecked />
                                </label>
                                <span className="inner-item-title">
                                  White Sauce Pasta
                                </span>
                              </div>
                              <div className="inner-item-right">
                                <div className="price-info-wrap">
                                  <span>Price :</span>
                                  <input
                                    type="text"
                                    className="item-price-field"
                                    defaultValue="200"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn-select-tax"
                                >
                                  Select Tax
                                </button>
                              </div>
                            </div>
                            <div className="inner-item-card">
                              <div className="inner-item-left">
                                <label className="check-label-item">
                                  <input type="checkbox" defaultChecked />
                                </label>
                                <span className="inner-item-title">
                                  Mix Sauce Pasta
                                </span>
                              </div>
                              <div className="inner-item-right">
                                <div className="price-info-wrap">
                                  <span>Price :</span>
                                  <input
                                    type="text"
                                    className="item-price-field"
                                    defaultValue="210"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn-select-tax"
                                >
                                  Select Tax
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" defaultChecked />
                            </label>
                            <span className="accordion-title">Sandwiches</span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <div className="inner-item-card">
                              <div className="inner-item-left">
                                <label className="check-label-item">
                                  <input type="checkbox" defaultChecked />
                                </label>
                                <span className="inner-item-title">
                                  Club Grilled Sandwich
                                </span>
                              </div>
                              <div className="inner-item-right">
                                <div className="price-info-wrap">
                                  <span>Price :</span>
                                  <input
                                    type="text"
                                    className="item-price-field"
                                    defaultValue="150"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn-select-tax"
                                >
                                  Select Tax
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">
                              Startere Vegetariene / Veg Starters
                            </span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <div className="inner-item-card">
                              <div className="inner-item-left">
                                <label className="check-label-item">
                                  <input type="checkbox" />
                                </label>
                                <span className="inner-item-title">
                                  Paneer Tikka Raw
                                </span>
                              </div>
                              <div className="inner-item-right">
                                <div className="price-info-wrap">
                                  <span>Price :</span>
                                  <input
                                    type="text"
                                    className="item-price-field"
                                    defaultValue="240"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn-select-tax"
                                >
                                  Select Tax
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">
                              Startere Nevegetariene / Non Veg Starters
                            </span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <p
                              style={{
                                padding: "10px",
                                color: "var(--text-secondary)",
                                fontSize: "13.5px",
                              }}
                            >
                              No menu item entries setup inside this target
                              category filter layer configuration context mapping
                              context rule container.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">
                              Startere Din Peste
                            </span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <p
                              style={{
                                padding: "10px",
                                color: "var(--text-secondary)",
                                fontSize: "13.5px",
                              }}
                            >
                              No entries configured context panel layout structure
                              matrix block.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">
                              Fel Principal Vegetarian
                            </span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <p
                              style={{
                                padding: "10px",
                                color: "var(--text-secondary)",
                                fontSize: "13.5px",
                              }}
                            >
                              No menu item elements mapped completely inside
                              system container structure.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">
                              Preparate Din Peste Si Fructe De Mare
                            </span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <p
                              style={{
                                padding: "10px",
                                color: "var(--text-secondary)",
                                fontSize: "13.5px",
                              }}
                            >
                              No configuration asset maps matching category
                              criteria rules setup yet context block elements.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-wrapper">
                        <div className="accordion-row">
                          <div className="accordion-left">
                            <label className="check-label-item">
                              <input type="checkbox" />
                            </label>
                            <span className="accordion-title">Indo Chinese</span>
                          </div>
                          <div className="accordion-chevron">
                            <svg viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <div className="accordion-panel">
                          <div className="inner-items-container">
                            <p
                              style={{
                                padding: "10px",
                                color: "var(--text-secondary)",
                                fontSize: "13.5px",
                              }}
                            >
                              No database mapped index structure context criteria
                              setup records generated here.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
*/}

                    <div className="accordion-stack">
                      {categories.map((category) => (
                        <div
                          className={`accordion-wrapper ${openCategories[category.CategryId] ? "open" : ""}`}
                          key={category.CategryId}
                        >
                          <div
                            className="accordion-row"
                            onClick={() => toggleCategory(category.CategryId)}
                            style={{ cursor: "pointer" }}
                          >
                            <div
                              className="accordion-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <label className="check-label-item">
                                <input
                                  type="checkbox"
                                  checked={isCategorySelected(category)}
                                  onChange={() => toggleCategorySelect(category)}
                                />
                              </label>

                              <span className="accordion-title">
                                {category.CategryName}
                              </span>
                            </div>

                            <div className="accordion-chevron">
                              <svg viewBox="0 0 24 24">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>

                          <div className="accordion-panel">
                            <div className="inner-items-container">
                              {category.ItemListWidget?.map((item: any) => (
                                <div className="inner-item-card" key={item.ItemId}>
                                  <div className="inner-item-left">
                                    <label className="check-label-item">
                                      <input
                                        type="checkbox"
                                        checked={isItemSelected(item.ItemId)}
                                        onChange={() => toggleItem(category, item)}
                                      />
                                    </label>

                                    <span className="inner-item-title">
                                      {item.ItemName}
                                    </span>
                                  </div>

                                  <div className="inner-item-right">
                                    <div className="price-info-wrap">
                                      <span>Price :</span>
                                      <input
                                        type="text"
                                        className="item-price-field"
                                        value={item.Price ?? ""}
                                        readOnly
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>


                    <div
                      className="form-actions-row"
                      style={{ border: "none", marginTop: "24px" }}
                    >
                      <button
                        className="btn-wizard-prev"
                        id="back-to-step1-btn"
                        type="button"
                        style={{ padding: "10px 20px", fontSize: "13px" }}
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </button>
                      <button
                        className="btn-form btn-form-save"
                        id="finish-update-btn"
                        type="button"
                        onClick={handleSaveMenu}
                      >
                        Save Menu Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay"
        style={{ display: showDeleteModal ? "flex" : "none" }}

        id="delete-confirmation-modal">
        <div className="modal-box">
          <div className="modal-icon">
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
          </div>
          <div className="modal-title">
            Are you sure that you want to delete this Menu structure record
            configuration completely?
          </div>
          <div className="modal-actions">
            <button className="btn-modal btn-modal-cancel" id="modal-cancel-btn"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteMenuId(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn-modal btn-modal-confirm"
              id="modal-confirm-btn"
              onClick={async () => {
                if (deleteMenuId !== null) {
                  await handleDeleteMenu(deleteMenuId);
                }

                setShowDeleteModal(false);
                setDeleteMenuId(null);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="select-tax-modal-view">
        <div className="tax-modal-box">
          <div className="tax-modal-header">
            <h2>Select Tax</h2>
            <button
              type="button"
              className="tax-modal-close-btn"
              id="tax-close-trigger"
            >
              &times;
            </button>
          </div>

          <div className="tax-modal-subtitle">Select Custom Tax</div>

          <div className="tax-options-stack">
            <label className="tax-checkbox-label">
              <input type="checkbox" name="tax-item-choice" value="5" /> GST (5
              %)
            </label>
            <label className="tax-checkbox-label">
              <input type="checkbox" name="tax-item-choice" value="2.5" /> KGST
              (2.5 %)
            </label>
            <label className="tax-checkbox-label">
              <input type="checkbox" name="tax-item-choice" value="2.5" /> IGST
              (2.5 %)
            </label>
          </div>

          <div className="tax-modal-footer">
            <div className="tax-pricing-summary">
              <div className="tax-price-row">
                <span>Net Price (Rs.)</span>
                <span>:</span>
                <span
                  className="tax-price-value"
                  id="modal-net-price-display"
                >
                  0.00
                </span>
              </div>
              <div className="tax-price-row">
                <span>Final Price (Rs.)</span>
                <span>:</span>
                <span
                  className="tax-price-value"
                  id="modal-final-price-display"
                >
                  0.00
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-tax-apply"
              id="tax-apply-trigger"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalMenu && (
        <div
          className="modal-overlay"
          style={{ display: "flex" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setQrModalMenu(null);
          }}
        >
          <div className="modal-box" style={{ maxWidth: "400px", padding: "28px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#00a896" }}>
              {qrModalMenu.menu_name}
            </h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
              Scan this QR code to view this menu online
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  qrModalMenu.menu_url || `https://foodchow.com/menu/${SHOP_ID}/${qrModalMenu.id}`
                )}`}
                alt="QR Code"
                style={{ width: "200px", height: "200px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                  qrModalMenu.menu_url || `https://foodchow.com/menu/${SHOP_ID}/${qrModalMenu.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modal btn-modal-confirm"
                style={{ backgroundColor: "#00a896", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Download QR
              </a>
              <button
                type="button"
                className="btn-modal btn-modal-cancel"
                onClick={() => setQrModalMenu(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
