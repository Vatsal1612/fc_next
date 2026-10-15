"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  menuService,
  type AddShopMenuPayload,
  type TimingPayload,
  type MenuItemPayload,
  type AdditionalMenuCategory,
} from "@/api/services/menu.service";
import { useShopId } from "@/utils/shop";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "../page.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddNewAdditionalMenuPage() {
  const router = useRouter();
  const SHOP_ID = useShopId();
  const [categories, setCategories] = useState<AdditionalMenuCategory[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemPayload[]>([]);
  const [timings, setTimings] = useState<TimingPayload[]>(
    DAYS.map((day) => ({
      shop_id: SHOP_ID ? SHOP_ID.toString() : "",
      menu_id: 0,
      days_name: day,
      open_time: "10:00 AM",
      close_time: "10:00 PM",
      close_day: 0,
      is_24hours: 0,
    }))
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (SHOP_ID) {
      setTimings((prev) =>
        prev.map((t) => ({ ...t, shop_id: SHOP_ID.toString() }))
      );
      menuService
        .getItemsForMenuType(SHOP_ID)
        .then((result) => {
          if (result?.CategoryList) {
            setCategories(result.CategoryList);
          }
        })
        .catch((err) => console.error("Failed to load categories:", err));
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
            menu_id: "0",
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
          menu_id: "0",
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

  const handleSaveMenu = async () => {
    try {
      setSaving(true);
      const payload: AddShopMenuPayload = {
        id: "",
        menu_name: menuName.trim(),
        description: "",
        shop_id: SHOP_ID.toString(),
        status: "1",
        IsItemUpdated: 1,
        menuItemList: menuItems,
        timingList: timings,
      };

      const response = await menuService.addShopMenu(payload);

      if (response.response_code === "1") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Your Menu has been added successfully!",
        });
        router.push("/menu/additional-menu");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add menu.",
        });
      }
    } catch (err: any) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong while saving menu.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="pg-menu-additional-menu">
      <div className="app-container" style={{ height: "auto", minHeight: "100%" }}>
        <div className="main" style={{ width: "100%" }}>
          <div className="content-area" style={{ width: "100%", padding: "1.5rem" }}>
            <div id="update-shop-menu-form-view" style={{ display: "block", width: "100%" }}>
              <div className="content-card">
                <div className="page-header">
                  <div className="page-title">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>
                      Add New Shop Menu
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
                      if (!menuName.trim()) {
                        Swal.fire({
                          icon: "warning",
                          title: "Required",
                          text: "Please enter a menu name first.",
                        });
                        return;
                      }
                      setCurrentStep(2);
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
                        Menu Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. Breakfast Menu"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: "13.5px", marginBottom: "4px" }}>
                        Restaurant Timings <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="time-schedule-grid">
                        {DAYS.map((day) => {
                          const timing = timings.find(
                            (t) => (t.days_name ?? "").toLowerCase() === day.toLowerCase()
                          );

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
                                  <input
                                    type="radio"
                                    name={`${day}-time`}
                                    checked={
                                      timing?.close_day !== 1 && timing?.is_24hours !== 1
                                    }
                                    onChange={() => {
                                      updateTiming(day, "close_day", 0);
                                      updateTiming(day, "is_24hours", 0);
                                    }}
                                  />
                                  Custom
                                </label>
                              </div>

                              <div className="time-inputs-wrap">
                                <input
                                  type="text"
                                  className="time-select-input"
                                  placeholder="10:00 AM"
                                  disabled={
                                    timing?.close_day === 1 || timing?.is_24hours === 1
                                  }
                                  value={timing?.open_time || ""}
                                  onChange={(e) =>
                                    updateTiming(day, "open_time", e.target.value)
                                  }
                                />
                                <span className="time-span-txt">To</span>
                                <input
                                  type="text"
                                  className="time-select-input"
                                  placeholder="10:00 PM"
                                  disabled={
                                    timing?.close_day === 1 || timing?.is_24hours === 1
                                  }
                                  value={timing?.close_time || ""}
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
                      style={{ border: "none", paddingTop: "20px" }}
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
                        onClick={() => router.push("/menu/additional-menu")}
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
                      <span id="target-menu-label-text">{menuName || "New Menu"}</span>
                    </h2>

                    <div className="step2-action-bar">
                      <button
                        type="button"
                        className="btn-toggle-all"
                        onClick={handleExpandAll}
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        className="btn-toggle-all"
                        onClick={handleCollapseAll}
                      >
                        Collapse All
                      </button>
                    </div>

                    <div className="accordion-stack">
                      {categories.map((category) => {
                        const isOpen = !!openCategories[category.CategryId];
                        const isCatChecked = isCategorySelected(category);

                        return (
                          <div
                            className={`accordion-wrapper ${isOpen ? "open" : ""}`}
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
                                    checked={isCatChecked}
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
                                {category.ItemListWidget &&
                                category.ItemListWidget.length > 0 ? (
                                  category.ItemListWidget.map((item: any) => {
                                    const checked = isItemSelected(item.ItemId);

                                    return (
                                      <div
                                        className="inner-item-card"
                                        key={item.ItemId}
                                      >
                                        <div className="inner-item-left">
                                          <label className="check-label-item">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() =>
                                                toggleItem(category, item)
                                              }
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
                                    );
                                  })
                                ) : (
                                  <p
                                    style={{
                                      padding: "10px",
                                      color: "var(--text-secondary)",
                                      fontSize: "13.5px",
                                    }}
                                  >
                                    No items in this category.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                        disabled={saving}
                        onClick={handleSaveMenu}
                      >
                        {saving ? "Saving..." : "Save Menu Configuration"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
