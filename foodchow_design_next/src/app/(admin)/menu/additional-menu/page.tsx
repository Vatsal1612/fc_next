"use client";

import { useEffect, useState } from "react";
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
  const [menus, setMenus] = useState<ShopMenuType[]>([]);
  // const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categories, setCategories] = useState<AdditionalMenuCategory[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemPayload[]>([]);
  const [timings, setTimings] = useState<TimingPayload[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadMenus();
    loadCategories();
    console.log("Current step:", currentStep);
  }, [currentStep]);
  const SHOP_ID = useShopId();

  const loadMenus = async () => {
    try {
      const response = await menuService.getAllShopMenuType(SHOP_ID);
      console.log(
        "Updated Menu",
        response.find((m) => m.id === 737)
      );
      console.log("Menu List:", response);
      setMenus(response);
    } catch (error) {
      console.error("Failed to load menus:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const menus = await menuService.getAllShopMenuType(SHOP_ID);
      setMenus(menus);

      const result = await menuService.getItemsForMenuType(SHOP_ID);

      // result = { CategoryList: [...], SelectedCategoryList: null }
      setCategories(result.CategoryList);
    };

    loadData();
  }, []);


  const loadCategories = async () => {
    const result = await menuService.getItemsForMenuType(SHOP_ID);

    setCategories(result.CategoryList);
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
        alert(response.message);

        setEditingMenuId(null);
        setMenuName("");
        setMenuItems([]);
        // setTimings([]);
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

        const listView = document.getElementById("shop-menu-list-view");
        const updateView = document.getElementById("update-shop-menu-form-view");
        const addView = document.getElementById("add-shop-menu-form-view");

        if (updateView) updateView.style.display = "none";
        if (addView) addView.style.display = "none";
        if (listView) listView.style.display = "flex";
      } else {
        alert(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };



  const handleDeleteMenu = async (menuId: number) => {
    try {
      const response = await menuService.deleteShopMenu(menuId);

      console.log(response);

      if (response.response_code === "1") {
        alert(response.message);

        await loadMenus();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete menu");
    }
  };


  const handleEditMenu = async (menu: ShopMenuType) => {
    setEditingMenuId(menu.id);
    setMenuName(menu.menu_name);
    setCurrentStep(1);

    // Load this menu's own data
    const items = await menuService.getItemsForSelectedMenu(
      SHOP_ID,
      menu.id
    );

    const timings = await menuService.getShopCustomMenuTimings(
      menu.id
    );
    console.log("Timings:", timings);
    console.log("Is Array:", Array.isArray(timings));
    console.log("Type:", typeof timings);


    setMenuItems(items);
    // setTimings(timings);
    setTimings(Array.isArray(timings) ? timings : []);

    const listView = document.getElementById("shop-menu-list-view");
    const updateView = document.getElementById("update-shop-menu-form-view");

    if (listView) listView.style.display = "none";
    if (updateView) updateView.style.display = "block";
  };


  const handleMenuStatusChange = async (
    menuId: number,
    menuType: "online" | "pos",
    checked: boolean
  ) => {
    try {

      const status = checked ? 1 : 0;


      console.log({
        menuId,
        menuType,
        status,
        SHOP_ID,
      });
      const response = await menuService.updateMenuStatus(
        menuId,
        menuType,
        checked ? 1 : 0,
        SHOP_ID
      );

      if (response.response_code === "1") {
        // update UI immediately
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId
              ? {
                ...menu,
                ...(menuType === "online"
                  ? { for_online: checked ? 1 : 0 }
                  : { for_pos: checked ? 1 : 0 }),
              }
              : menu
          )
        );
      } else {
        alert(response.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update menu status");
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
            <div id="shop-menu-list-view">
              <div className="content-card">
                <div className="page-header">
                  <div className="typ-page-heading page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Shop Menu</h1>
                  </div>
                  <div className="header-actions">
                    <button className="btn-action-primary" id="open-add-menu-btn">
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
                    <button className="btn-help">
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
                            title="Download System Vector QR Asset"
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
                            onClick={() => handleEditMenu(menu)}
                          >
                            {EDIT_SVG}
                          </button>

                          <button className="icon-btn view">
                            {VIEW_SVG}
                          </button>

                          <button className="icon-btn delete"
                            // onClick={() => handleDeleteMenu(menu.id)}
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

            <div id="add-shop-menu-form-view" style={{ display: "none" }}>
              <div className="content-card">
                <div className="page-header">
                  <div className="page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Add New Shop Menu</h1>
                  </div>
                </div>
                <div className="form-container">
                  <div className="form-group">
                    <label>
                      Menu Name<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Late Night Platters"
                      value={menuName}

                      onChange={(e) => {
                        console.log("Typing:", e.target.value);

                        setMenuName(e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-actions-row">
                    <button
                      className="btn-form btn-form-save"
                      id="save-menu-btn"
                      type="button"
                      // onClick={handleAddMenu}
                      onClick={handleSaveMenu}
                    >
                      Save Menu Configuration
                    </button>
                    <button
                      className="btn-form btn-form-cancel"
                      id="cancel-menu-btn"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="update-shop-menu-form-view" style={{ display: "none" }}>
              <div className="content-card">
                <div className="page-header">
                  <div className="page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Update New Shop Menu</h1>
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
                  <div className="w-step active" id="step-node-1">
                    1
                  </div>
                  <div className="w-step upcoming" id="step-node-2">
                    2
                  </div>
                </div>

                <div id="wizard-step-1-content">
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
                      >
                        NEXT
                      </button>
                      <button
                        className="btn-form btn-form-cancel"
                        id="cancel-update-btn"
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div id="wizard-step-2-content" style={{ display: "none" }}>
                  <div className="inner-form-card">
                    <h2 className="section-subtitle-step2">
                      Set Items For Menu:{" "}
                      <span id="target-menu-label-text">Breakfast</span>
                    </h2>

                    <div className="step2-action-bar">
                      <button
                        type="button"
                        className="btn-toggle-all"
                        id="global-expand-btn"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        className="btn-toggle-all"
                        id="global-collapse-btn"
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
                        <div className="accordion-wrapper" key={category.CategryId}>
                          <div className="accordion-row">
                            <div className="accordion-left">
                              <label className="check-label-item">
                                <input type="checkbox" />
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
                                      <input type="checkbox" />
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

                                    <button
                                      type="button"
                                      className="btn-select-tax"
                                    >
                                      Select Tax
                                    </button>

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
                      >
                        Back
                      </button>
                      <button
                        className="btn-form btn-form-save"
                        id="finish-update-btn"
                        type="button"
                        onClick={() => {
                          console.log("BUTTON CLICKED");
                          alert("clicked");
                          handleSaveMenu();
                        }}
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
    </div>
  );
}
