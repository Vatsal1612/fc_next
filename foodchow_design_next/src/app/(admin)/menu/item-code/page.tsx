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
  const saveChanges = async () => {
    // Check for duplicate item codes
    // const codes = items
    //   .map((item) => item.item_code?.trim())
    //   .filter((code) => code !== "");

    // const duplicateCode = codes.find(
    //   (code, index) => codes.indexOf(code) !== index
    // );

    // if (duplicateCode) {
    //   await Swal.fire({
    //     icon: "error",
    //     title: "Duplicate Item Found!",
    //     text: `Item code "${duplicateCode}" is already assigned to another item.`,
    //   });

    //   return;
    // }

    const codeMap = new Map<string, string>();

    for (const item of items) {
      const code = item.item_code?.trim();

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
      await Promise.all(
        items.map((item) =>
          menuService.updateItemCode(
            SHOP_ID,
            item.item_id,
            item.item_code ?? ""
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
  // ============================================



  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    const helpModal = document.getElementById("helpModal");
    // const toast = document.getElementById("toast");
    const helpBtn = document.getElementById("openHelpBtn");
    const closeBtns = document.querySelectorAll<HTMLButtonElement>(
      "[data-close-help]"
    );
    const searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement | null;

    // let toastTimer: ReturnType<typeof setTimeout>;

    function openHelpModal() {
      if (!helpModal) return;
      helpModal.style.display = "flex";
      setTimeout(() => helpModal.classList.add("show"), 10);
    }

    function closeHelpModal() {
      if (!helpModal) return;
      helpModal.classList.remove("show");
      setTimeout(() => (helpModal.style.display = "none"), 200);
    }

    function filterItems(query: string) {
      const rows = document.querySelectorAll<HTMLTableRowElement>(
        "#items-body tr"
      );
      const q = query.toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const name = row.cells[0]?.textContent?.toLowerCase() || "";
        const codeBadge = row.querySelector<HTMLElement>(".code-display-badge");
        const code = codeBadge ? (codeBadge.textContent || "").toLowerCase() : "";
        const match = name.includes(q) || code.includes(q);
        row.style.display = match ? "" : "none";
        if (match) visible++;
      });
      const itemCount = document.getElementById("item-count");
      if (itemCount) {
        itemCount.textContent =
          visible + " item" + (visible !== 1 ? "s" : "");
      }
    }

    const onSearch = (e: Event) =>
      filterItems((e.target as HTMLInputElement).value);

    helpBtn?.addEventListener("click", openHelpModal);
    // saveBtn?.addEventListener("click", saveChanges);
    searchInput?.addEventListener("input", onSearch);
    closeBtns.forEach((b) => b.addEventListener("click", closeHelpModal));

    return () => {
      // clearTimeout(toastTimer);
      helpBtn?.removeEventListener("click", openHelpModal);
      // saveBtn?.removeEventListener("click", saveChanges);
      searchInput?.removeEventListener("input", onSearch);
      closeBtns.forEach((b) => b.removeEventListener("click", closeHelpModal));
    };
  }, []);

  return (
    <div id="pg-menu-item-code">
      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="card">
              <div className="card-header">
                <h1 className="card-title typ-page-heading" style={{ margin: 0 }}>Item Code</h1>
                <button className="btn-help" id="openHelpBtn">
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
                      // readOnly
                      onChange={() => setItemCodeType(0)}
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
                      // readOnly
                      onChange={() => setItemCodeType(1)}
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
                  />
                </div>

                <span className="item-count" id="item-count">
                  {items.length} items
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
                    ) : (
                      items.map((item) => (
                        <tr key={item.item_id}>
                          <td>{item.item_name}</td>
                          <td>
                            {/* <span className="code-display-badge">
                              {item.item_code ?? "NULL"}
                            </span> */}
                            <input
                              className="code-input"
                              type="text"
                              value={item.item_code ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;

                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.item_id === item.item_id
                                      ? { ...i, item_code: value }
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

      <div className="modal-overlay" id="helpModal">
        <div className="modal-container">
          <div className="modal-title-bar">
            <h3>Item Code Help Guide</h3>
            <button className="modal-close-btn" data-close-help>
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
              data-close-help
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
