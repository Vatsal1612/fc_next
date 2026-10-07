"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

interface Category {
  id: string;
  name: string;
}
interface Section {
  id: string;
  name: string;
  mappedCategoryIds: string[];
}

/**
 * orders/category-mapper.html → React.
 *
 * The original page builds both the left categories list and the right sections
 * list dynamically in JS (innerHTML / createElement) with HTML5 drag-and-drop.
 * That logic is ported verbatim into one useEffect; the JSX renders only the
 * static shell (search bar, empty containers, modals, footer) so there is no
 * hydration mismatch. Inline handlers on generated nodes are recreated with
 * ondragstart/ondrop/onclick on the created elements exactly as the source did.
 */
export default function CategoryMapperPage() {
  useEffect(() => {
    const root = document.getElementById("pg-orders-category-mapper");
    if (!root) return;

    const categories: Category[] = [
      { id: "cat-1", name: "Maggi" },
      { id: "cat-2", name: "Dessert" },
      { id: "cat-3", name: "burger" },
      { id: "cat-4", name: "Chaat" },
      { id: "cat-5", name: "Bread" },
      { id: "cat-6", name: "South Indian" },
      { id: "cat-7", name: "Fast Food" },
      { id: "cat-8", name: "Beverage" },
      { id: "cat-9", name: "dosa" },
    ];

    let sections: Section[] = [
      { id: "sec-1", name: "Starters", mappedCategoryIds: ["cat-8", "cat-4", "cat-5"] },
      { id: "sec-2", name: "Main Course", mappedCategoryIds: ["cat-1", "cat-3", "cat-9"] },
      { id: "sec-3", name: "Sweet Station", mappedCategoryIds: ["cat-2"] },
    ];

    // ── Toast Controller ──
    let toastTimeout: ReturnType<typeof setTimeout> | undefined;
    const showToast = (message: string): void => {
      const toast = document.getElementById("toast");
      const toastText = document.getElementById("toastText");
      if (!toast || !toastText) return;
      toastText.textContent = message;
      toast.classList.add("show");
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
    };

    // ── Modal Helpers ──
    const openHelpModal = (): void => {
      const modal = document.getElementById("helpModal");
      if (!modal) return;
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show"), 10);
    };
    const closeHelpModal = (): void => {
      const modal = document.getElementById("helpModal");
      if (!modal) return;
      modal.classList.remove("show");
      setTimeout(() => (modal.style.display = "none"), 200);
    };
    const openSectionModal = (): void => {
      const modal = document.getElementById("sectionFormModal");
      if (!modal) return;
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show"), 10);
    };
    const closeSectionModal = (): void => {
      const modal = document.getElementById("sectionFormModal");
      if (!modal) return;
      modal.classList.remove("show");
      setTimeout(() => (modal.style.display = "none"), 200);
    };

    const openAddSectionModal = (): void => {
      const title = document.getElementById("modalTitle");
      const idField = document.getElementById("formSectionId") as HTMLInputElement | null;
      const nameField = document.getElementById("sectionName") as HTMLInputElement | null;
      if (title) title.textContent = "Add Outlet Section";
      if (idField) idField.value = "";
      if (nameField) nameField.value = "";
      openSectionModal();
    };

    const openEditSectionModal = (sectionId: string): void => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;
      const title = document.getElementById("modalTitle");
      const idField = document.getElementById("formSectionId") as HTMLInputElement | null;
      const nameField = document.getElementById("sectionName") as HTMLInputElement | null;
      if (title) title.textContent = "Rename Outlet Section";
      if (idField) idField.value = section.id;
      if (nameField) nameField.value = section.name;
      openSectionModal();
    };

    // ── Render Categories List (Left Panel) ──
    const escapeHtml = (str: string): string => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const renderCategoriesList = (): void => {
      const container = document.getElementById("categoriesListContainer");
      const searchInput = document.getElementById("categorySearch") as HTMLInputElement | null;
      if (!container) return;
      const searchVal = (searchInput?.value ?? "").toLowerCase().trim();

      const filtered = categories.filter((c) => c.name.toLowerCase().includes(searchVal));
      container.innerHTML = "";

      if (filtered.length === 0) {
        container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-weight: 500; font-size: 13.5px;">
        No categories match your search.
      </div>
    `;
        return;
      }

      filtered.forEach((cat) => {
        const item = document.createElement("div");
        item.className = "draggable-item";
        item.setAttribute("draggable", "true");

        item.ondragstart = (e: DragEvent) => {
          e.dataTransfer?.setData("text/plain", cat.id);
          item.classList.add("dragging");
        };
        item.ondragend = () => {
          item.classList.remove("dragging");
        };

        item.innerHTML = `
      <span class="drag-handle"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line></svg></span>
      <span class="draggable-item-text">${escapeHtml(cat.name)}</span>
    `;

        container.appendChild(item);
      });
    };

    // ── Render Sections List (Right Panel) ──
    const renderSectionsList = (): void => {
      const container = document.getElementById("sectionsContainer");
      if (!container) return;
      container.innerHTML = "";

      if (sections.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText =
          "text-align: center; padding: 4rem 2rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);";
        empty.innerHTML = `
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">No outlet sections built</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 1.25rem;">Create kitchen queues, beverage counters, or specialty stations to map item categories.</p>
        <button class="btn-action btn-brand btn-add-section">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Section
        </button>
    `;
        empty.querySelector(".btn-add-section")?.addEventListener("click", openAddSectionModal);
        container.appendChild(empty);
        return;
      }

      sections.forEach((sec) => {
        const card = document.createElement("div");
        card.className = "section-card";

        const headerRow = document.createElement("div");
        headerRow.className = "section-card-header";

        const titleSpan = document.createElement("span");
        titleSpan.className = "section-card-title";
        titleSpan.textContent = sec.name;

        const controlsDiv = document.createElement("div");
        controlsDiv.className = "section-controls";

        const btnEdit = document.createElement("button");
        btnEdit.className = "btn-icon edit";
        btnEdit.title = "Edit Section";
        btnEdit.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
        btnEdit.onclick = () => openEditSectionModal(sec.id);

        const btnDelete = document.createElement("button");
        btnDelete.className = "btn-icon delete";
        btnDelete.title = "Delete Section";
        btnDelete.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
        btnDelete.onclick = () => deleteSection(sec.id);

        controlsDiv.appendChild(btnEdit);
        controlsDiv.appendChild(btnDelete);

        headerRow.appendChild(titleSpan);
        headerRow.appendChild(controlsDiv);
        card.appendChild(headerRow);

        const dropZone = document.createElement("div");
        dropZone.className = "drop-zone";

        dropZone.ondragover = (e: DragEvent) => {
          e.preventDefault();
          dropZone.classList.add("dragover");
        };
        dropZone.ondragleave = () => {
          dropZone.classList.remove("dragover");
        };
        dropZone.ondrop = (e: DragEvent) => {
          e.preventDefault();
          dropZone.classList.remove("dragover");
          const catId = e.dataTransfer?.getData("text/plain") ?? "";
          mapCategoryToSection(catId, sec.id);
        };

        if (sec.mappedCategoryIds.length === 0) {
          dropZone.innerHTML = `<span class="drop-zone-placeholder">Drag Items Here</span>`;
        } else {
          const zoneLbl = document.createElement("span");
          zoneLbl.className = "drop-zone-placeholder";
          zoneLbl.textContent = "Drag Items Here";
          zoneLbl.style.marginBottom = "6px";
          dropZone.appendChild(zoneLbl);

          sec.mappedCategoryIds.forEach((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (cat) {
              const mappedEl = document.createElement("div");
              mappedEl.className = "mapped-item";
              mappedEl.innerHTML = `
            <span class="mapped-item-text">${escapeHtml(cat.name)}</span>
            <button class="btn-remove-mapped">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          `;
              mappedEl
                .querySelector(".btn-remove-mapped")
                ?.addEventListener("click", () => unmapCategory(catId, sec.id));
              dropZone.appendChild(mappedEl);
            }
          });
        }

        card.appendChild(dropZone);
        container.appendChild(card);
      });
    };

    function mapCategoryToSection(catId: string, sectionId: string): void {
      const section = sections.find((s) => s.id === sectionId);
      const category = categories.find((c) => c.id === catId);
      if (section && category) {
        if (section.mappedCategoryIds.includes(catId)) {
          showToast(`Category "${category.name}" is already mapped inside "${section.name}"`);
          return;
        }
        section.mappedCategoryIds.push(catId);
        showToast(`"${category.name}" successfully mapped to "${section.name}"`);
        renderSectionsList();
      }
    }

    function unmapCategory(catId: string, sectionId: string): void {
      const section = sections.find((s) => s.id === sectionId);
      const category = categories.find((c) => c.id === catId);
      if (section && category) {
        section.mappedCategoryIds = section.mappedCategoryIds.filter((id) => id !== catId);
        showToast(`Un-mapped "${category.name}" from "${section.name}"`);
        renderSectionsList();
      }
    }

    function deleteSection(sectionId: string): void {
      const section = sections.find((s) => s.id === sectionId);
      if (section && confirm(`Are you sure you want to delete the section "${section.name}"?`)) {
        sections = sections.filter((s) => s.id !== sectionId);
        showToast(`Section "${section.name}" deleted`);
        renderSectionsList();
      }
    }

    const filterCategories = (): void => renderCategoriesList();

    const handleSectionFormSubmit = (e: Event): void => {
      e.preventDefault();
      const idField = document.getElementById("formSectionId") as HTMLInputElement | null;
      const nameField = document.getElementById("sectionName") as HTMLInputElement | null;
      const id = idField?.value ?? "";
      const name = (nameField?.value ?? "").trim();

      if (!name) {
        showToast("Please specify a valid section name");
        return;
      }

      if (id) {
        const idx = sections.findIndex((s) => s.id === id);
        if (idx > -1) {
          sections[idx].name = name;
          showToast(`Section renamed to "${name}"`);
        }
      } else {
        const newId = `sec-${Date.now()}`;
        sections.push({ id: newId, name, mappedCategoryIds: [] });
        showToast(`Section "${name}" created successfully!`);
      }

      closeSectionModal();
      renderSectionsList();
    };

    const handleNextStep = (e: Event): void => {
      e.preventDefault();
      showToast("Category Mapping configuration saved! Next Step...");
    };

    // ── Wire static (non-generated) handlers ──
    const searchInput = document.getElementById("categorySearch");
    const searchBtn = root.querySelector<HTMLButtonElement>(".btn-search-icon");
    const addSectionBtn = root.querySelector<HTMLButtonElement>(".sections-actions-bar .btn-add-section");
    const helpBtn = root.querySelector<HTMLButtonElement>(".btn-help-common");
    const nextBtn = root.querySelector<HTMLAnchorElement>(".btn-navigation-next");
    const sectionForm = document.getElementById("sectionForm");
    const sectionCancelBtns = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "#sectionFormModal .modal-close-btn, #sectionFormModal .btn-modal-cancel",
      ),
    );
    const helpCloseBtns = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "#helpModal .modal-close-btn, #helpModal .btn-modal-cancel",
      ),
    );

    searchInput?.addEventListener("input", filterCategories);
    searchBtn?.addEventListener("click", filterCategories);
    addSectionBtn?.addEventListener("click", openAddSectionModal);
    helpBtn?.addEventListener("click", openHelpModal);
    nextBtn?.addEventListener("click", handleNextStep);
    sectionForm?.addEventListener("submit", handleSectionFormSubmit);
    sectionCancelBtns.forEach((b) => b.addEventListener("click", closeSectionModal));
    helpCloseBtns.forEach((b) => b.addEventListener("click", closeHelpModal));

    // ── Initialization ──
    renderCategoriesList();
    renderSectionsList();

    return () => {
      searchInput?.removeEventListener("input", filterCategories);
      searchBtn?.removeEventListener("click", filterCategories);
      addSectionBtn?.removeEventListener("click", openAddSectionModal);
      helpBtn?.removeEventListener("click", openHelpModal);
      nextBtn?.removeEventListener("click", handleNextStep);
      sectionForm?.removeEventListener("submit", handleSectionFormSubmit);
      sectionCancelBtns.forEach((b) => b.removeEventListener("click", closeSectionModal));
      helpCloseBtns.forEach((b) => b.removeEventListener("click", closeHelpModal));
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, []);

  return (
    <div id="pg-orders-category-mapper">
      <div className="layout">
        {/* Main Content Layout */}
        <div className="main">
          {/* Content Area */}
          <div className="content-area">
            {/* Split panel layout */}
            <div className="split-container">
              {/* Left: Categories List */}
              <div className="categories-card">
                <h2 className="typ-page-heading card-title">Categories List</h2>

                {/* Search Bar */}
                <div className="search-wrap">
                  <div className="search-input-group">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="search-input-field"
                      id="categorySearch"
                      placeholder="Search categories..."
                    />
                  </div>
                  <button className="btn-search-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Categories draggable list (populated by JS) */}
                <div className="categories-list-scroll" id="categoriesListContainer" />
              </div>

              {/* Right: Sections mapping panel */}
              <div className="sections-column">
                {/* Top Section Actions */}
                <div className="sections-actions-bar">
                  <button className="btn-action btn-brand btn-add-section">
                    <svg viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Section
                  </button>

                  <button className="btn-action btn-help btn-help-common">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    HELP
                  </button>
                </div>

                {/* Scrollable Sections List (populated by JS) */}
                <div className="sections-list-scroll" id="sectionsContainer" />
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* Section Form Modal (Add / Edit) */}
      <div className="modal-overlay" id="sectionFormModal">
        <div className="modal-container">
          <div className="modal-title-bar">
            <h3 id="modalTitle">Add Outlet Section</h3>
            <button className="modal-close-btn">
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form id="sectionForm">
            <input type="hidden" id="formSectionId" />

            <div className="modal-body-content">
              <div className="form-group">
                <label className="input-label" htmlFor="sectionName">
                  Section Name
                </label>
                <input
                  type="text"
                  id="sectionName"
                  className="input-field"
                  placeholder="e.g. Starters, Main Course, Dessert Station"
                  required
                />
              </div>
            </div>

            <div className="modal-footer-bar">
              <button className="btn-action btn-cancel btn-modal-cancel" type="button">
                Cancel
              </button>
              <button className="btn-action btn-save btn-modal-submit" type="submit" id="formSubmitBtn">
                Save Section
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Modal Overlay */}
      <div className="modal-overlay" id="helpModal">
        <div className="modal-container">
          <div className="modal-title-bar">
            <h3>Category Mapper Guide</h3>
            <button className="modal-close-btn">
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="modal-body-content">
            <div className="help-list">
              <div className="help-item">
                <strong>Category Mapping:</strong> Organize menu item categories into restaurant outlet
                sections (e.g. mapping Pizza and Maggi into the Main Course kitchen queue, or Beverages to
                the Bar counter).
              </div>
              <div className="help-item">
                <strong>Draggable Categories:</strong> Press and hold a category item on the left list,
                drag it over to any section&apos;s drop area on the right, and release to map it.
              </div>
              <div className="help-item">
                <strong>Removing Categories:</strong> Click the small red trash icon next to a category
                within any section card to un-map it.
              </div>
              <div className="help-item">
                <strong>Section Management:</strong> Use &quot;+ Add Section&quot; to build custom
                kitchens, counters, or stations. Use Edit to rename sections, and Delete to remove them
                entirely.
              </div>
            </div>
          </div>
          <div className="modal-footer-bar">
            <button className="btn-action btn-cancel btn-modal-cancel" type="button">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Toast Box */}
      <div className="toast-box" id="toast">
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toastText">Changes saved successfully</span>
      </div>
    </div>
  );
}
