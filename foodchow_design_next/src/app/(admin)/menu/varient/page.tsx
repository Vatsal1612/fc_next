"use client";

import { useEffect, useState } from "react";
import { menuService, type MenuVariant } from "@/api/services/menu.service";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import "./page.css";

export default function VarientPage() {
  const SHOP_ID = useShopId();

  const [variants, setVariants] = useState<MenuVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {

    console.log("API call started");
    menuService
      .variantsByShop(SHOP_ID)
      .then((data) => {
        console.log("API response:", data);


        setVariants(data);
      })
      .catch((err) => {
        console.log("API error:", err);
        setError(err.message);
      })
      .finally(() => {
        console.log("API completed");

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const cleanups: Array<() => void> = [];


    let searchQuery = "";
    let deleteTargetId: number | null = null;

    const listCard = document.getElementById("list-card");
    const addVariantCard = document.getElementById("add-variant-card");
    const editVariantCard = document.getElementById("edit-variant-card");
    const deleteModal = document.getElementById("delete-modal");
    const btnAddNewVariant = document.getElementById("btn-add-new-variant");
    const btnCancelAdd = document.getElementById("btn-cancel-add");
    const btnCancelEdit = document.getElementById("btn-cancel-edit");
    const btnDeleteCancel = document.getElementById("btn-delete-cancel");
    const btnDeleteConfirm = document.getElementById("btn-delete-confirm");
    const btnAddMoreFields = document.getElementById("btn-add-more-fields");
    const variantInputsContainer = document.getElementById("variant-inputs-container");
    const addVariantForm = document.getElementById(
      "add-variant-form"
    ) as HTMLFormElement | null;
    const editVariantForm = document.getElementById(
      "edit-variant-form"
    ) as HTMLFormElement | null;
    const editVariantIdInput = document.getElementById(
      "edit-variant-id"
    ) as HTMLInputElement | null;
    const editVariantNameInput = document.getElementById(
      "edit-variant-name-input"
    ) as HTMLInputElement | null;
    const editVariantLabel = document.getElementById("edit-variant-label");
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement | null;
    const btnListView = document.getElementById("btn-list-view");
    const btnGridView = document.getElementById("btn-grid-view");
    const variantsListContainer = document.getElementById("variants-list-container");

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderVariants() {
      console.log("renderVariants called");

      console.log("variants state =", variants);

      const container = document.getElementById("variants-list-container");
      const counterText = document.getElementById("counter-text");
      if (!container || !counterText) return;
      const filtered = variants.filter((v) =>
        v.size_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      counterText.textContent = `Showing ${filtered.length} of ${variants.length} variants`;

      if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 32px 0;">No variants found matching your query.</div>`;
        return;
      }

      container.innerHTML = filtered
        .map(
          (v) => `
        <div class="variant-list-item ${selectedVariantId === v.id ? "selected active" : ""}" data-variant-id="${v.id}">
          <span class="variant-name">${escapeHtml(v.size_name)}</span>
          <div class="actions-cell">
            <button class="action-circle action-edit" data-edit-id="${v.id}" title="Edit Variant">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-circle action-delete" data-delete-id="${v.id}" title="Delete Variant">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }

    function deleteVariant(id: number) {
      const variant = variants.find((v) => v.id === id);
      if (!variant) return;
      deleteTargetId = id;
      const typeEl = document.getElementById("delete-modal-type");
      if (typeEl)
        typeEl.textContent = "Item Size";

      // typeEl.textContent = variant.type === "Volume" ? "Item Volume" : "Item Size";
      if (deleteModal) deleteModal.style.display = "flex";
    }

    function editVariant(id: number) {
      const variant = variants.find((v) => v.id === id);
      if (!variant) return;
      if (editVariantIdInput) editVariantIdInput.value = String(variant.id);
      if (editVariantNameInput) editVariantNameInput.value = variant.size_name;
      const formTitle = document.querySelector(
        "#edit-variant-card .form-title"
      ) as HTMLElement | null;
      //  if (editVariantLabel) {
      //     editVariantLabel.innerHTML =
      //       `Size Name <span class="required-asterisk">*</span>`;
      //   }

      //   if (formTitle) {
      //     formTitle.textContent = "Edit Item Size";
      //   }
      //   else {
      //     if (editVariantLabel)
      //       editVariantLabel.innerHTML = `Size Name <span class="required-asterisk">*</span>`;
      //     if (formTitle) formTitle.textContent = "Edit Item Size";
      //   }
      if (editVariantLabel) {
        editVariantLabel.innerHTML =
          `Size Name <span class="required-asterisk">*</span>`;
      }

      if (formTitle) {
        formTitle.textContent = "Edit Item Size";
      }
      if (listCard) listCard.style.display = "none";
      if (editVariantCard) editVariantCard.style.display = "block";
    }

    // Event delegation for dynamically created edit/delete buttons
    if (variantsListContainer) {
      const onContainerClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const editBtn = target.closest("[data-edit-id]") as HTMLElement | null;
        if (editBtn) {
          editVariant(Number(editBtn.dataset.editId));
          return;
        }
        const delBtn = target.closest("[data-delete-id]") as HTMLElement | null;
        if (delBtn) {
          deleteVariant(Number(delBtn.dataset.deleteId));
          return;
        }
        const itemEl = target.closest(".variant-list-item") as HTMLElement | null;
        if (itemEl && itemEl.dataset.variantId) {
          setSelectedVariantId(Number(itemEl.dataset.variantId));
        }
      };
      variantsListContainer.addEventListener("click", onContainerClick);
      cleanups.push(() =>
        variantsListContainer.removeEventListener("click", onContainerClick)
      );
    }

    if (btnListView && btnGridView && variantsListContainer) {
      const onList = () => {
        btnListView.classList.add("active");
        btnGridView.classList.remove("active");
        variantsListContainer.classList.add("list-view-active");
      };
      const onGrid = () => {
        btnGridView.classList.add("active");
        btnListView.classList.remove("active");
        variantsListContainer.classList.remove("list-view-active");
      };
      btnListView.addEventListener("click", onList);
      btnGridView.addEventListener("click", onGrid);
      cleanups.push(() => btnListView.removeEventListener("click", onList));
      cleanups.push(() => btnGridView.removeEventListener("click", onGrid));
    }

    // if (btnDeleteConfirm && deleteModal) {
    //   const onConfirm = async () => {
    //     if (deleteTargetId !== null) {
    //       // variants = variants.filter((v) => v.id !== deleteTargetId);
    //       setVariants((prev) =>
    //         prev.filter((v) => v.id !== deleteTargetId)
    //       );
    //       deleteTargetId = null;
    //       renderVariants();
    //     }
    //     deleteModal.style.display = "none";
    //   };
    //   btnDeleteConfirm.addEventListener("click", onConfirm);
    //   cleanups.push(() => btnDeleteConfirm.removeEventListener("click", onConfirm));
    // }

    if (btnDeleteConfirm && deleteModal) {

      const onConfirm = async () => {

        if (deleteTargetId === null) return;

        try {

          // call delete API
          await menuService.deleteVariant(deleteTargetId);

          // refresh list
          const data = await menuService.variantsByShop(SHOP_ID);

          setVariants(data);

          deleteTargetId = null;

          deleteModal.style.display = "none";

        } catch (error) {

          console.log("Delete failed", error);

        }
      };

      btnDeleteConfirm.addEventListener("click", onConfirm);

      cleanups.push(() =>
        btnDeleteConfirm.removeEventListener("click", onConfirm)
      );
    }


    if (btnDeleteCancel && deleteModal) {
      const onCancel = () => {
        deleteTargetId = null;
        deleteModal.style.display = "none";
      };
      btnDeleteCancel.addEventListener("click", onCancel);
      cleanups.push(() => btnDeleteCancel.removeEventListener("click", onCancel));
    }

    if (deleteModal) {
      const onModalClick = (e: MouseEvent) => {
        if (e.target === deleteModal) {
          deleteTargetId = null;
          deleteModal.style.display = "none";
        }
      };
      deleteModal.addEventListener("click", onModalClick);
      cleanups.push(() => deleteModal.removeEventListener("click", onModalClick));
    }

    if (btnCancelEdit && editVariantCard && listCard) {
      const onCancelEdit = () => {
        editVariantCard.style.display = "none";
        listCard.style.display = "block";
      };
      btnCancelEdit.addEventListener("click", onCancelEdit);
      cleanups.push(() => btnCancelEdit.removeEventListener("click", onCancelEdit));
    }

    // if (editVariantForm) {
    //   const onEditSubmit = (e: Event) => {
    //     e.preventDefault();
    //     const id = parseInt(editVariantIdInput?.value ?? "", 10);
    //     const newName = editVariantNameInput?.value.trim() ?? "";
    //     if (newName) {
    //       const variant = variants.find((v) => v.id === id);
    //       if (variant) {
    //         variant.size_name = newName;
    //         // variant.type = /[0-9]|gm|ml|kg|ltr/i.test(newName) ? "Volume" : "Size";
    //         setVariants((prev) =>
    //           prev.map((v) =>
    //             v.id === id
    //               ? { ...v, size_name: newName }
    //               : v
    //           )
    //         );
    //       }
    //     }
    //     renderVariants();
    //     if (editVariantCard) editVariantCard.style.display = "none";
    //     if (listCard) listCard.style.display = "block";
    //   };
    //   editVariantForm.addEventListener("submit", onEditSubmit);
    //   cleanups.push(() => editVariantForm.removeEventListener("submit", onEditSubmit));
    // }

    if (editVariantForm) {

      const onEditSubmit = async (e: Event) => {

        e.preventDefault();

        const id = parseInt(
          editVariantIdInput?.value ?? "",
          10
        );

        const newName =
          editVariantNameInput?.value.trim() ?? "";

        if (!newName) return;

        const alreadyExists = variants.some(
          (v) =>
            v.id !== id && // exclude the current variant
            v.size_name.toLowerCase().trim() ===
            newName.toLowerCase().trim()
        );

        if (alreadyExists) {
          await Swal.fire({
            icon: "warning",
            title: "Duplicate Variant",
            text: `"${newName}" already exists in the variant list.`,
            confirmButtonText: "OK",
          });

          return;
        }
        try {

          await menuService.updateVariant({
            Size_Id: id,
            Size_Name: newName,
            Update_Date: new Date().toISOString().split("T")[0],
          });

          // Refresh data
          const data = await menuService.variantsByShop(
            SHOP_ID
          );

          setVariants(data);

          if (editVariantCard) {
            editVariantCard.style.display = "none";
          }

          if (listCard) {
            listCard.style.display = "block";
          }

        } catch (error) {

          console.log(
            "Update Variant Error:",
            error
          );

        }
      };

      editVariantForm.addEventListener(
        "submit",
        onEditSubmit
      );

      cleanups.push(() =>
        editVariantForm.removeEventListener(
          "submit",
          onEditSubmit
        )
      );
    }


    function resetAddForm() {
      addVariantForm?.reset();
      if (variantInputsContainer)
        variantInputsContainer.innerHTML = `
        <div class="form-field">
          <label class="form-label">Variant Name <span class="required-asterisk">*</span></label>
          <div class="input-row">
            <input type="text" class="variant-name-input" placeholder="e.g. large" required>
          </div>
        </div>
      `;
    }

    if (btnAddNewVariant && listCard && addVariantCard) {
      const onAddNew = () => {
        listCard.style.display = "none";
        addVariantCard.style.display = "block";
        resetAddForm();
      };
      btnAddNewVariant.addEventListener("click", onAddNew);
      cleanups.push(() => btnAddNewVariant.removeEventListener("click", onAddNew));
    }

    if (btnCancelAdd && addVariantCard && listCard) {
      const onCancelAdd = () => {
        addVariantCard.style.display = "none";
        listCard.style.display = "block";
      };
      btnCancelAdd.addEventListener("click", onCancelAdd);
      cleanups.push(() => btnCancelAdd.removeEventListener("click", onCancelAdd));
    }

    if (btnAddMoreFields && variantInputsContainer) {
      const onAddMore = () => {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "form-field";
        fieldDiv.innerHTML = `
        <label class="form-label">Variant Name <span class="required-asterisk">*</span></label>
        <div class="input-row">
          <input type="text" class="variant-name-input" placeholder="e.g. large" required>
          <button type="button" class="btn-remove-field" title="Remove field">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      `;
        variantInputsContainer.appendChild(fieldDiv);
        fieldDiv
          .querySelector(".btn-remove-field")
          ?.addEventListener("click", () => fieldDiv.remove());
      };
      btnAddMoreFields.addEventListener("click", onAddMore);
      cleanups.push(() => btnAddMoreFields.removeEventListener("click", onAddMore));
    }

    if (addVariantForm && variantInputsContainer) {
      const onAddSubmit = async (e: Event) => {
        e.preventDefault();
        const inputs = variantInputsContainer.querySelectorAll<HTMLInputElement>(
          ".variant-name-input"
        );

        console.log("Current variants", variants);

        console.log(
          variants.map(v => v.size_name)
        );

        let lastAddedName = "";
        let lastResponse: any = null;

        try {
          for (const input of inputs) {
            const name = input.value.trim();

            if (!name) continue;
            // Check duplicate variant
            const alreadyExists = variants.some(
              (v) => v.size_name.toLowerCase() === name.toLowerCase()
            );

            if (alreadyExists) {
              await Swal.fire({
                icon: "warning",
                title: "Duplicate Variant",
                text: `"${name}" already exists in the variant list.`,
                confirmButtonText: "OK",
              });

              return;
            }
            const response = await menuService.addVariant({
              id: 0,
              shop_id: SHOP_ID,
              size_name: name,
              status: 1,
            });
            console.log("addVariant response:", response);
            lastAddedName = name;
            lastResponse = response;
          }

          // refresh list
          const data = await menuService.variantsByShop(SHOP_ID);

          setVariants(data);

          // Identify newly created variant ID dynamically
          let createdVariantId: number | null = null;

          if (typeof lastResponse?.data === "number") {
            createdVariantId = lastResponse.data;
          } else if (lastResponse?.data?.id) {
            createdVariantId = Number(lastResponse.data.id);
          } else if (lastResponse?.data?.Size_Id) {
            createdVariantId = Number(lastResponse.data.Size_Id);
          } else if (lastResponse?.id) {
            createdVariantId = Number(lastResponse.id);
          }

          if (!createdVariantId || !data.some((v) => v.id === createdVariantId)) {
            if (lastAddedName) {
              const match = data.find(
                (v) => v.size_name.toLowerCase().trim() === lastAddedName.toLowerCase().trim()
              );
              if (match) {
                createdVariantId = match.id;
              }
            }

            if (!createdVariantId) {
              const previousIds = new Set(variants.map((v) => v.id));
              const newlyAdded = data.find((v) => !previousIds.has(v.id));
              if (newlyAdded) {
                createdVariantId = newlyAdded.id;
              }
            }
          }

          if (createdVariantId !== null) {
            console.log("Highlighting newly created variant ID:", createdVariantId);
            setSelectedVariantId(createdVariantId);

            setTimeout(() => {
              const el = document.querySelector(`[data-variant-id="${createdVariantId}"]`);
              el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
          }

          if (addVariantCard)
            addVariantCard.style.display = "none";

          if (listCard)
            listCard.style.display = "block";
        } catch (error) {
          console.log(error);
        }
      };
      addVariantForm.addEventListener("submit", onAddSubmit);
      cleanups.push(() => addVariantForm.removeEventListener("submit", onAddSubmit));
    }

    if (searchInput) {
      const onSearch = (e: Event) => {
        searchQuery = (e.target as HTMLInputElement).value;
        renderVariants();
      };
      searchInput.addEventListener("input", onSearch);
      cleanups.push(() => searchInput.removeEventListener("input", onSearch));
    }

    renderVariants();

    return () => cleanups.forEach((fn) => fn());
  }, [variants, selectedVariantId]);

  return (
    <div id="pg-menu-varient">
      {/* App Container */}
      <div className="app-container">
        {/* Main Content */}
        <div className="main-content">
          <div className="app-workspace">
            <div className="workspace-scrollable-body">
              {loading && (
                <div style={{ padding: "12px 0", color: "var(--muted)", fontSize: "14px", fontWeight: 500 }}>
                  Loading variants...
                </div>
              )}
              {!loading && error && (
                <div style={{ padding: "12px 0", color: "#e53e3e", fontSize: "14px", fontWeight: 500 }}>
                  {error}
                </div>
              )}
              <main className="content-card" id="list-card">
                <div className="card-header">
                  <div className="title-block">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Variants</h1>
                  </div>
                  <div className="header-actions">
                    <button className="btn btn-primary" id="btn-add-new-variant">
                      + ADD NEW VARIANT
                    </button>
                    <button className="btn-help">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      HELP
                    </button>
                  </div>
                </div>

                <div className="toolbar-row">
                  <div className="toolbar-left">
                    <div className="search-wrapper">
                      <svg
                        className="search-icon"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        id="search-input"
                        className="search-input"
                        placeholder="Search variants by name..."
                      />
                    </div>
                  </div>
                  <div className="toolbar-right">
                    <span className="counter-text" id="counter-text">
                      Showing 18 of 18 variants
                    </span>
                    <div className="view-switcher-box">
                      <button className="view-btn" title="List View" id="btn-list-view">
                        <svg viewBox="0 0 24 24">
                          <path d="M4 14h16v-2H4v2zm0 4h16v-2H4v2zM4 10h16V8H4v2zm0-6v2h16V4H4z" />
                        </svg>
                      </button>
                      <button
                        className="view-btn active"
                        title="Grid View"
                        id="btn-grid-view"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M4 11h5V5H4v6zm0 8h5v-6H4v6zm7 0h5v-6h-5v6zm7 0h5v-6h-5v6zm-7-8h5V5h-5v6zm7 0h5V5h-5v6z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="variants-grid" id="variants-list-container"></div>
              </main>

              <main className="content-card" id="add-variant-card" style={{ display: "none" }}>
                <div className="card-header-simple">
                  <h1 className="form-title">Add New Variant</h1>
                  <span className="form-subtitle">( Large, Medium, Small, Half, Full )</span>
                </div>
                <form id="add-variant-form">
                  <div id="variant-inputs-container">
                    <div className="form-field">
                      <label className="form-label">
                        Variant Name <span className="required-asterisk">*</span>
                      </label>
                      <div className="input-row">
                        <input
                          type="text"
                          className="variant-name-input"
                          placeholder="e.g. large"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button type="button" className="btn-add-more" id="btn-add-more-fields">
                    ADD MORE
                  </button>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      ADD
                    </button>
                    <button type="button" className="btn btn-cancel" id="btn-cancel-add">
                      CANCEL
                    </button>
                  </div>
                </form>
              </main>

              <main
                className="content-card"
                id="edit-variant-card"
                style={{ display: "none" }}
              >
                <div className="card-header-simple">
                  <h1 className="form-title">Edit Item Size</h1>
                </div>
                <form id="edit-variant-form">
                  <input type="hidden" id="edit-variant-id" />
                  <div className="form-field">
                    <label className="form-label" id="edit-variant-label">
                      Size Name <span className="required-asterisk">*</span>
                    </label>
                    <div className="input-row" style={{ maxWidth: "100%" }}>
                      <input
                        type="text"
                        id="edit-variant-name-input"
                        className="variant-name-input"
                        placeholder="e.g. small"
                        required
                        style={{ maxWidth: "100%" }}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      UPDATE
                    </button>
                    <button type="button" className="btn btn-cancel" id="btn-cancel-edit">
                      CANCEL
                    </button>
                  </div>
                </form>
              </main>

              <div className="modal-backdrop" id="delete-modal" style={{ display: "none" }}>
                <div className="modal-card">
                  <div className="warning-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="none">
                      <circle cx="12" cy="12" r="10" stroke="#fdbb75" strokeWidth="1.5" />
                      <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="13"
                        stroke="#fdbb75"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="16.5" r="1" fill="#fdbb75" />
                    </svg>
                  </div>
                  <h2 className="modal-text">
                    Are you sure that you want to delete this{" "}
                    <span id="delete-modal-type">Item Size</span>?
                  </h2>
                  <div className="modal-buttons">
                    <button className="btn-modal btn-modal-cancel" id="btn-delete-cancel">
                      Cancel
                    </button>
                    <button className="btn-modal btn-modal-yes" id="btn-delete-confirm">
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              <WizardFooter />
            </div>
          </div>
        </div>
      </div>
      {/* end .app-container */}
    </div>
  );
}