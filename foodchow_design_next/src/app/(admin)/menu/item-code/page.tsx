"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import "./page.css";
import {
  menuService,
  type ItemCodeItem,
} from "@/api/services/menu.service";
import Swal from "sweetalert2";
export default function ItemCodePage() {
  const SHOP_ID = useShopId();

  const [items, setItems] = useState<ItemCodeItem[]>([]);
  const [itemCodeType, setItemCodeType] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [itemResponse, typeResponse] = await Promise.all([
        menuService.getItemNames(SHOP_ID),
        menuService.getItemCodeTypeSetting(SHOP_ID),
      ]);

      setItems(itemResponse);
      setItemCodeType(typeResponse.item_code_type);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD HERE =================
  // const saveChanges = async () => {
  //   try {
  //     await Promise.all(
  //       items.map((item) =>
  //         menuService.updateItemCode(
  //           SHOP_ID,
  //           item.item_id,
  //           item.item_code ?? ""
  //         )
  //       )
  //     );

  //     // const toast = document.getElementById("toast");

  //     // if (toast) {
  //     //   toast.classList.add("show");

  //     //   setTimeout(() => {
  //     //     toast.classList.remove("show");
  //     //   }, 2800);
  //     // }

  //     await Swal.fire({
  //       // toast: true,
  //       // position: "top-end",
  //       // icon: "success",
  //       // title: "Item codes saved successfully",
  //       // showConfirmButton: false,
  //       // timer: 2500,
  //       // timerProgressBar: true,
  //       icon: "success",
  //       title: "Success!",
  //       text: "Item codes saved successfully.",
  //       timer: 2000,
  //       showConfirmButton: false,
  //     });
  //     await loadData();
  //   } catch (err) {
  //     console.error(err);
  //     // alert("Failed to save item codes.");
  //     await Swal.fire({
  //       icon: "error",
  //       title: "Failed!",
  //       text: "Failed to save item codes.",
  //     });
  //   }
  // };
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleTypeChange = async (newType: number) => {
    setItemCodeType(newType);
    try {
      await menuService.saveItemCodeTypeSetting(SHOP_ID, newType);
    } catch (e) {
      console.error("Failed to update item code type setting:", e);
    }
  };

  const saveChanges = async () => {
    // 1. If numeric type is selected, validate that all entered codes are purely numeric
    if (itemCodeType === 0) {
      for (const item of items) {
        const code = item.item_code ? String(item.item_code).trim() : "";
        if (code !== "" && !/^\d+$/.test(code)) {
          await Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please enter numeric values only.",
          });
          return;
        }
      }
    }

    // 2. Check for duplicate item codes
    const codeMap = new Map<string, string>();

    for (const item of items) {
      const code = item.item_code ? String(item.item_code).trim() : "";

      if (!code) continue;

      if (codeMap.has(code)) {
        await Swal.fire({
          icon: "error",
          title: "Duplicate Item Found!",
          text: `Item code "${code}" is already used by "${codeMap.get(code)}".`,
        });
        await loadData(); // Reload data to reset any changes

        return;
      }

      codeMap.set(code, item.item_name);
    }

    try {
      // Save item code type setting (Numeric = 0, AlphaNumeric = 1)
      await menuService.saveItemCodeTypeSetting(SHOP_ID, itemCodeType);

      // Save item codes
      await Promise.all(
        items.map((item) =>
          menuService.updateItemCode(
            SHOP_ID,
            item.item_id,
            item.item_code ? String(item.item_code).trim() : ""
          )
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Item codes saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      await loadData();
    } catch (err) {
      console.error(err);

      await Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Failed to save item codes.",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div id="pg-menu-item-code">
      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="card">
              <div className="card-header">
                <h1 className="card-title typ-page-heading" style={{ margin: 0 }}>Item Code</h1>
                <button className="btn-help" id="openHelpBtn" onClick={() => window.open('https://vimeo.com/1075945406', '_blank')}>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              <div className="toolbar-container">
                <div className="radio-group">
                  <div className="radio-opt">
                    <input
                      type="radio"
                      name="codetype"
                      id="r-numeric"
                      value="numeric"
                      checked={itemCodeType === 0}
                      onChange={() => handleTypeChange(0)}
                    />
                    <label htmlFor="r-numeric">
                      <span className="radio-dot"></span> Numeric
                    </label>
                  </div>
                  <div className="radio-opt">
                    <input
                      type="radio"
                      name="codetype"
                      id="r-alpha"
                      value="alpha"
                      checked={itemCodeType === 1}
                      onChange={() => handleTypeChange(1)}
                    />
                    <label htmlFor="r-alpha">
                      <span className="radio-dot"></span> AlphaNumeric
                    </label>
                  </div>
                </div>

                <div className="search-wrap">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search items"
                    id="searchInput"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <span className="item-count" id="item-count">
                  {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                </span>

                <button className="btn-action btn-save" id="saveBtn" onClick={saveChanges}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  SAVE
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>  
                    </tr>
                  </thead>
                  <tbody id="items-body">
                    {loading ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center", padding: "24px" }}>
                          Loading items...
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                          No matching items found.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.item_id}>
                          <td>{item.item_name}</td>
                          <td>
                            <input
                              className="code-input"
                              type="text"
                              value={item.item_code ?? ""}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                let validValue = rawValue;

                                if (itemCodeType === 0) {
                                  validValue = rawValue.replace(/[^0-9]/g, "");
                                } else {
                                  validValue = rawValue.replace(/[^a-zA-Z0-9]/g, "");
                                }

                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.item_id === item.item_id
                                      ? { ...i, item_code: validValue }
                                      : i
                                  )
                                );
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${isHelpOpen ? "show" : ""}`} id="helpModal" style={{ display: isHelpOpen ? "flex" : "none" }}>
        <div className="modal-container">
          <div className="modal-title-bar">
            <h3>Item Code Help Guide</h3>
            <button className="modal-close-btn" type="button" onClick={() => setIsHelpOpen(false)}>
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="modal-body-content">
            <div className="help-list">
              <div className="help-item">
                <strong>What is Item Code?</strong> An item code is a unique
                identifier (numeric or alphanumeric) assigned to each menu item
                for faster POS entry and indexing.
              </div>
              <div className="help-item">
                <strong>Auto-generation/Manual:</strong> You can toggle between
                numeric and alphanumeric code systems depending on your store&apos;s
                configuration.
              </div>
              <div className="help-item">
                <strong>POS Sync:</strong> Save your changes to immediately sync
                item codes with all connected POS registers and active menus.
              </div>
            </div>
          </div>
          <div className="modal-footer-bar">
            <button
              className="btn-action btn-cancel"
              type="button"
              onClick={() => setIsHelpOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* <div className="toast" id="toast">
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Changes saved successfully
      </div> */}
    </div>
  );
}
