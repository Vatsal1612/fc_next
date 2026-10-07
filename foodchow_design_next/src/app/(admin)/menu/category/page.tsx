"use client";

import { useEffect, useState } from "react";
import { menuService, type MenuCategory } from "@/api";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import "./page.css";

const PAGE_SIZE = 10;

export default function CategoryPage() {
  const SHOP_ID = useShopId();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedCategories = categories.slice(pageStart, pageStart + PAGE_SIZE);

  // ── Load categories from the FoodChow API ──
  useEffect(() => {
    let active = true;
    setLoading(true);
    menuService
      .categoriesByShop(SHOP_ID)
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? "Failed to load categories");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let nextId = 3;
    let rowToDelete: HTMLTableRowElement | null = null;
    let editMode = false;
    let editRowEl: HTMLTableRowElement | null = null;

    const root = document.getElementById("pg-menu-category");
    if (!root) return;

    const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
      document.getElementById(id) as T | null;

    const searchInput = $<HTMLInputElement>("searchInput");
    const selectAll = $<HTMLInputElement>("selectAll");
    const deleteAllBtn = $("deleteAllBtn");
    const openAddModal = $("openAddModal");
    const saveCatBtn = $("saveCatBtn");
    const modalClose = $("modalClose");
    const cancelBtn = $("cancelBtn");
    const catModal = $("catModal");
    const deleteModal = $("deleteModal");
    const confirmDeleteBtn = $("confirmDeleteBtn");
    const cancelDeleteBtn = $("cancelDeleteBtn");
    const prevBtn = $("prevBtn");
    const nextBtn = $("nextBtn");
    const fileInput = $<HTMLInputElement>("fileInput");

    function updateFooter() {
      const total = document.querySelectorAll("#catTableBody tr").length;
      const tf = $("tableFooter");
      if (tf) tf.textContent = `Showing 1 to ${total} of ${total} entries`;
    }

    function escapeHtml(str: string): string {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function buildRow(
      id: number,
      name: string,
      imgSrc: string | null,
      isActive: boolean
    ): HTMLTableRowElement {
      const tr = document.createElement("tr");
      tr.dataset.id = String(id);
      tr.innerHTML = `<td><input type="checkbox" class="cb row-cb"></td><td>${imgSrc ? `<img src="${escapeHtml(imgSrc)}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;">` : `<div class="no-img"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z"/><circle cx="12" cy="13" r="3"/></svg><span>No Image</span></div>`}</td><td><span class="cat-name">${escapeHtml(name.toUpperCase())}</span></td><td><div class="act-btns"><button class="icon-btn edit-btn" title="Edit"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="icon-btn delete-btn" title="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button><label class="toggle-switch"><input type="checkbox" ${isActive ? "checked" : ""}><span class="slider"></span></label></div></td>`;
      return tr;
    }

    function resetImgPreview() {
      const prev = $<HTMLImageElement>("previewImg");
      if (prev) {
        prev.src = "";
        prev.style.display = "none";
      }
      const imgPreview = $("imgPreview");
      const svg = imgPreview?.querySelector("svg") as SVGElement | null;
      const span = imgPreview?.querySelector("span") as HTMLElement | null;
      if (svg) svg.style.display = "";
      if (span) span.style.display = "";
    }

    function openEditModal(btn: HTMLElement) {
      editMode = true;
      editRowEl = btn.closest("tr");
      if (!editRowEl) return;
      const name = editRowEl.querySelector(".cat-name")?.textContent ?? "";
      const isActive =
        (editRowEl.querySelector(".toggle-switch input") as HTMLInputElement | null)
          ?.checked ?? false;
      const existingImg = editRowEl.querySelector(
        "td:nth-child(2) img"
      ) as HTMLImageElement | null;
      const modalTitle = $("modalTitle");
      const saveBtn = $("saveCatBtn");
      const catNameInput = $<HTMLInputElement>("catNameInput");
      if (modalTitle) modalTitle.textContent = "Edit Category";
      if (saveBtn) saveBtn.textContent = "SAVE";
      if (catNameInput) catNameInput.value = name;
      if (isActive) {
        const r = root!.querySelector(
          'input[name=catStatus][value=active]'
        ) as HTMLInputElement | null;
        if (r) r.checked = true;
      } else {
        const r = root!.querySelector(
          'input[name=catStatus][value=deactive]'
        ) as HTMLInputElement | null;
        if (r) r.checked = true;
      }
      resetImgPreview();
      if (existingImg) {
        const previewImg = $<HTMLImageElement>("previewImg");
        if (previewImg) {
          previewImg.src = existingImg.src;
          previewImg.style.display = "block";
        }
        const imgPreview = $("imgPreview");
        const svg = imgPreview?.querySelector("svg") as SVGElement | null;
        const span = imgPreview?.querySelector("span") as HTMLElement | null;
        if (svg) svg.style.display = "none";
        if (span) span.style.display = "none";
      }
      catModal?.classList.add("open");
    }

    function openDeleteModal(btn: HTMLElement) {
      rowToDelete = btn.closest("tr");
      const name = rowToDelete?.querySelector(".cat-name")?.textContent ?? "";
      const msg = $("deleteModalMsg");
      if (msg)
        msg.textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
      deleteModal?.classList.add("open");
    }

    function closeModal() {
      catModal?.classList.remove("open");
      resetImgPreview();
      if (fileInput) fileInput.value = "";
    }

    function closeDeleteModal() {
      deleteModal?.classList.remove("open");
      rowToDelete = null;
    }

    // ── Search ──
    const onSearch = function (this: HTMLInputElement) {
      const q = this.value.toLowerCase().trim();
      const rows = document.querySelectorAll<HTMLTableRowElement>("#catTableBody tr");
      let v = 0;
      rows.forEach((r) => {
        const name = r.querySelector(".cat-name")?.textContent?.toLowerCase() || "";
        const show = !q || name.includes(q);
        r.style.display = show ? "" : "none";
        if (show) v++;
      });
      const tf = $("tableFooter");
      if (tf)
        tf.textContent = q
          ? `Showing ${v} of ${rows.length} entries (filtered)`
          : `Showing 1 to ${rows.length} of ${rows.length} entries`;
    };
    searchInput?.addEventListener("input", onSearch);

    const onSelectAll = function (this: HTMLInputElement) {
      document
        .querySelectorAll<HTMLInputElement>(".row-cb")
        .forEach((cb) => (cb.checked = this.checked));
    };
    selectAll?.addEventListener("change", onSelectAll);

    const onDeleteAll = () => {
      const checked = document.querySelectorAll<HTMLInputElement>(".row-cb:checked");
      if (!checked.length) {
        alert("Select at least one row.");
        return;
      }
      checked.forEach((cb) => cb.closest("tr")?.remove());
      updateFooter();
      if (selectAll) selectAll.checked = false;
    };
    deleteAllBtn?.addEventListener("click", onDeleteAll);

    const onOpenAdd = () => {
      editMode = false;
      editRowEl = null;
      const modalTitle = $("modalTitle");
      const saveBtn = $("saveCatBtn");
      const catNameInput = $<HTMLInputElement>("catNameInput");
      if (modalTitle) modalTitle.textContent = "Add New Category";
      if (saveBtn) saveBtn.textContent = "ADD";
      if (catNameInput) catNameInput.value = "";
      const r = root.querySelector(
        'input[name=catStatus][value=active]'
      ) as HTMLInputElement | null;
      if (r) r.checked = true;
      resetImgPreview();
      catModal?.classList.add("open");
      setTimeout(() => $<HTMLInputElement>("catNameInput")?.focus(), 50);
    };
    openAddModal?.addEventListener("click", onOpenAdd);

    const onSave = () => {
      const catNameInput = $<HTMLInputElement>("catNameInput");
      if (!catNameInput) return;
      const name = catNameInput.value.trim();
      if (!name) {
        catNameInput.style.borderColor = "#e53e3e";
        return;
      }
      catNameInput.style.borderColor = "";
      const isActive =
        (root.querySelector(
          'input[name=catStatus]:checked'
        ) as HTMLInputElement | null)?.value === "active";
      const previewImg = $<HTMLImageElement>("previewImg");
      const imgSrc =
        previewImg && previewImg.style.display !== "none" && previewImg.src
          ? previewImg.src
          : null;
      if (editMode && editRowEl) {
        const catName = editRowEl.querySelector(".cat-name");
        if (catName) catName.textContent = name.toUpperCase();
        const toggle = editRowEl.querySelector(
          ".toggle-switch input"
        ) as HTMLInputElement | null;
        if (toggle) toggle.checked = isActive;
        const imgCell = editRowEl.querySelector(
          "td:nth-child(2)"
        ) as HTMLElement | null;
        if (imgCell)
          imgCell.innerHTML = imgSrc
            ? `<img src="${escapeHtml(imgSrc)}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;">`
            : `<div class="no-img"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z"/><circle cx="12" cy="13" r="3"/></svg><span>No Image</span></div>`;
      } else {
        const tr = buildRow(nextId++, name, imgSrc, isActive);
        $("catTableBody")?.appendChild(tr);
      }
      updateFooter();
      closeModal();
    };
    saveCatBtn?.addEventListener("click", onSave);

    modalClose?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    const onCatModalClick = (e: MouseEvent) => {
      if (e.target === catModal) closeModal();
    };
    catModal?.addEventListener("click", onCatModalClick);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        closeDeleteModal();
      }
    };
    document.addEventListener("keydown", onKeydown);

    const onConfirmDelete = () => {
      if (rowToDelete) {
        rowToDelete.remove();
        updateFooter();
      }
      closeDeleteModal();
    };
    confirmDeleteBtn?.addEventListener("click", onConfirmDelete);
    cancelDeleteBtn?.addEventListener("click", closeDeleteModal);
    const onDeleteModalClick = (e: MouseEvent) => {
      if (e.target === deleteModal) closeDeleteModal();
    };
    deleteModal?.addEventListener("click", onDeleteModalClick);

    // ── Event delegation for edit/delete buttons (incl. dynamic rows) ──
    const tableBody = $("catTableBody");
    const onTableClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editB = target.closest(".edit-btn") as HTMLElement | null;
      if (editB) {
        openEditModal(editB);
        return;
      }
      const delB = target.closest(".delete-btn") as HTMLElement | null;
      if (delB) {
        openDeleteModal(delB);
      }
    };
    tableBody?.addEventListener("click", onTableClick);

    // ── Step nav ──
    let currentStep = 6;
    const totalSteps = 25;
    const onPrev = () => {
      if (currentStep > 1) {
        currentStep--;
        const sv = $("stepValue");
        if (sv) sv.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = () => {
      if (currentStep < totalSteps) {
        currentStep++;
        const sv = $("stepValue");
        if (sv) sv.textContent = currentStep + "/" + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    // ── Crop modal logic ──
    const cs = { x: 40, y: 30, w: 200, h: 133, imgW: 0, imgH: 0, ratio: 1.5, zoom: 1 };
    const cropOverlay = $("cropOverlay");

    function openCropModal(src: string) {
      const img = $<HTMLImageElement>("cropImg");
      if (!img) return;
      img.src = src;
      img.onload = () => {
        const w = $("cropWrapper");
        if (w) {
          cs.imgW = w.offsetWidth;
          cs.imgH = w.offsetHeight;
        }
        resetBox();
        initDrag();
      };
      cropOverlay?.classList.add("open");
      const zoomSlider = $<HTMLInputElement>("zoomSlider");
      if (zoomSlider) zoomSlider.value = "100";
      img.style.transform = "scale(1)";
    }

    function closeCropModal() {
      cropOverlay?.classList.remove("open");
      if (fileInput) fileInput.value = "";
    }

    function resetBox() {
      const w = cs.imgW * 0.7;
      const h = cs.ratio > 0 ? w / cs.ratio : cs.imgH * 0.7;
      cs.x = (cs.imgW - w) / 2;
      cs.y = (cs.imgH - h) / 2;
      cs.w = w;
      cs.h = h;
      renderBox();
    }

    function renderBox() {
      const b = $("cropBox");
      if (b) b.style.cssText = `left:${cs.x}px;top:${cs.y}px;width:${cs.w}px;height:${cs.h}px`;
    }

    function setAspect(btn: HTMLElement, r: number) {
      root!.querySelectorAll(".asp-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cs.ratio = r;
      resetBox();
    }

    function applyZoom(v: string) {
      cs.zoom = Number(v) / 100;
      const img = $<HTMLImageElement>("cropImg");
      if (img) img.style.transform = `scale(${cs.zoom})`;
    }

    function initDrag() {
      const box = $("cropBox");
      if (!box || !box.parentNode) return;
      const newBox = box.cloneNode(true) as HTMLElement;
      box.parentNode.replaceChild(newBox, box);
      let drag = false;
      let resize = false;
      let dir = "";
      let sx = 0;
      let sy = 0;
      let ox = 0;
      let oy = 0;
      let ow = 0;
      let oh = 0;
      newBox.addEventListener("mousedown", (e) => {
        const t = e.target as HTMLElement;
        if (t.classList.contains("ch")) {
          resize = true;
          dir = t.dataset.dir ?? "";
        } else drag = true;
        sx = e.clientX;
        sy = e.clientY;
        ox = cs.x;
        oy = cs.y;
        ow = cs.w;
        oh = cs.h;
        e.preventDefault();
      });
      const mm = (e: MouseEvent) => {
        if (!drag && !resize) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (drag) {
          cs.x = Math.max(0, Math.min(ox + dx, cs.imgW - cs.w));
          cs.y = Math.max(0, Math.min(oy + dy, cs.imgH - cs.h));
        } else {
          let w = ow;
          let h = oh;
          let x = ox;
          let y = oy;
          if (dir === "br") {
            w = Math.max(60, ow + dx);
            h = cs.ratio > 0 ? w / cs.ratio : Math.max(40, oh + dy);
          } else if (dir === "tl") {
            w = Math.max(60, ow - dx);
            h = cs.ratio > 0 ? w / cs.ratio : Math.max(40, oh - dy);
            x = ox + (ow - w);
            y = oy + (oh - h);
          } else if (dir === "tr") {
            w = Math.max(60, ow + dx);
            h = cs.ratio > 0 ? w / cs.ratio : Math.max(40, oh - dy);
            y = oy + (oh - h);
          } else if (dir === "bl") {
            w = Math.max(60, ow - dx);
            h = cs.ratio > 0 ? w / cs.ratio : Math.max(40, oh + dy);
            x = ox + (ow - w);
          }
          cs.w = Math.min(w, cs.imgW - x);
          cs.h = Math.min(h, cs.imgH - y);
          cs.x = x;
          cs.y = y;
        }
        renderBox();
      };
      const mu = () => {
        drag = false;
        resize = false;
      };
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
      dragCleanups.push(() => {
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseup", mu);
      });
    }
    const dragCleanups: Array<() => void> = [];

    function applyCrop() {
      const img = $<HTMLImageElement>("cropImg");
      const wrap = $("cropWrapper");
      const canvas = $<HTMLCanvasElement>("cropCanvas");
      if (!img || !wrap || !canvas) return;
      const sx2 = img.naturalWidth / wrap.offsetWidth;
      const sy2 = img.naturalHeight / wrap.offsetHeight;
      canvas.width = cs.w * sx2;
      canvas.height = cs.h * sy2;
      canvas
        .getContext("2d")
        ?.drawImage(
          img,
          cs.x * sx2,
          cs.y * sy2,
          cs.w * sx2,
          cs.h * sy2,
          0,
          0,
          canvas.width,
          canvas.height
        );
      const src = canvas.toDataURL("image/jpeg", 0.92);
      const prev = $<HTMLImageElement>("previewImg");
      if (prev) {
        prev.src = src;
        prev.style.display = "block";
      }
      const imgPreview = $("imgPreview");
      const svg = imgPreview?.querySelector("svg") as SVGElement | null;
      const span = imgPreview?.querySelector("span") as HTMLElement | null;
      if (svg) svg.style.display = "none";
      if (span) span.style.display = "none";
      closeCropModal();
    }

    const onFileChange = function (this: HTMLInputElement, e: Event) {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      if (f.size > 1024 * 1024) {
        alert("Max 1MB image allowed");
        this.value = "";
        return;
      }
      const r = new FileReader();
      r.onload = (ev) => openCropModal(ev.target?.result as string);
      r.readAsDataURL(f);
      this.value = "";
    };
    fileInput?.addEventListener("change", onFileChange);

    const onCropOverlayClick = function (this: HTMLElement, e: MouseEvent) {
      if (e.target === this) closeCropModal();
    };
    cropOverlay?.addEventListener("click", onCropOverlayClick);

    // upload button -> trigger file input
    const uploadBtn = root.querySelector(".upload-btn") as HTMLElement | null;
    const onUploadClick = () => fileInput?.click();
    uploadBtn?.addEventListener("click", onUploadClick);

    // crop head close button
    const cropCloseBtn = root.querySelector(".crop-head button") as HTMLElement | null;
    cropCloseBtn?.addEventListener("click", closeCropModal);

    // aspect buttons
    const aspBtns = Array.from(root.querySelectorAll<HTMLElement>(".asp-btn"));
    const aspRatios = [1.5, 1, 1.778, 0];
    const aspHandlers: Array<() => void> = [];
    aspBtns.forEach((b, i) => {
      const h = () => setAspect(b, aspRatios[i] ?? 0);
      b.addEventListener("click", h);
      aspHandlers.push(h);
    });

    // zoom slider
    const zoomSlider = $<HTMLInputElement>("zoomSlider");
    const onZoom = function (this: HTMLInputElement) {
      applyZoom(this.value);
    };
    zoomSlider?.addEventListener("input", onZoom);

    // crop foot buttons
    const cropCancel = root.querySelector(".btn-crop-cancel") as HTMLElement | null;
    const cropApply = root.querySelector(".btn-crop-apply") as HTMLElement | null;
    cropCancel?.addEventListener("click", closeCropModal);
    cropApply?.addEventListener("click", applyCrop);

    return () => {
      searchInput?.removeEventListener("input", onSearch);
      selectAll?.removeEventListener("change", onSelectAll);
      deleteAllBtn?.removeEventListener("click", onDeleteAll);
      openAddModal?.removeEventListener("click", onOpenAdd);
      saveCatBtn?.removeEventListener("click", onSave);
      modalClose?.removeEventListener("click", closeModal);
      cancelBtn?.removeEventListener("click", closeModal);
      catModal?.removeEventListener("click", onCatModalClick);
      document.removeEventListener("keydown", onKeydown);
      confirmDeleteBtn?.removeEventListener("click", onConfirmDelete);
      cancelDeleteBtn?.removeEventListener("click", closeDeleteModal);
      deleteModal?.removeEventListener("click", onDeleteModalClick);
      tableBody?.removeEventListener("click", onTableClick);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      fileInput?.removeEventListener("change", onFileChange);
      cropOverlay?.removeEventListener("click", onCropOverlayClick);
      uploadBtn?.removeEventListener("click", onUploadClick);
      cropCloseBtn?.removeEventListener("click", closeCropModal);
      aspBtns.forEach((b, i) => b.removeEventListener("click", aspHandlers[i]));
      zoomSlider?.removeEventListener("input", onZoom);
      cropCancel?.removeEventListener("click", closeCropModal);
      cropApply?.removeEventListener("click", applyCrop);
      dragCleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div id="pg-menu-category">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-actions">
                <button className="btn btn-primary" id="openAddModal">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  ADD NEW CATEGORY
                </button>
                <button className="btn-help" id="helpBtnCard" style={{ marginLeft: "0" }}>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
              <div className="typ-page-heading card-title">Category</div>
              <div className="card-sub">( e.g Italian, Mexican, Thai, Chinese, Punjabi )</div>
              <div style={{ marginBottom: "16px" }}>
                <button className="btn btn-primary" id="deleteAllBtn">
                  DELETE ALL
                </button>
              </div>

              {/* ── TABLE (comparison-by-product style) ── */}
              <div className="table-card">
                <div className="table-card-header">
                  <span>All Categories</span>
                  <div className="search-box">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" id="searchInput" placeholder="Search categories…" />
                  </div>
                </div>
                <div className="table-wrap">
                  <table id="catTable">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>
                          <input type="checkbox" className="cb" id="selectAll" />
                        </th>
                        <th>Image</th>
                        <th>Category Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody id="catTableBody">
                      {loading && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>
                            Loading categories…
                          </td>
                        </tr>
                      )}
                      {!loading && error && (
                        <tr>
                          <td
                            colSpan={4}
                            style={{ textAlign: "center", padding: "24px", color: "#e53e3e" }}
                          >
                            {error}
                          </td>
                        </tr>
                      )}
                      {!loading && !error && categories.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>
                            No categories found.
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        !error &&
                        pagedCategories.map((cat) => (
                          <tr key={cat.id} data-id={cat.id}>
                            <td>
                              <input type="checkbox" className="cb row-cb" />
                            </td>
                            <td>
                              {cat.cate_image ? (
                                <img
                                  src={cat.cate_image}
                                  alt={cat.cate_name}
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div className="no-img">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z" />
                                    <circle cx="12" cy="13" r="3" />
                                  </svg>
                                  <span>No Image</span>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="cat-name">
                                {cat.cate_name.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="act-btns">
                                <button className="icon-btn edit-btn" title="Edit">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button className="icon-btn delete-btn" title="Delete">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                </button>
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    defaultChecked={cat.status === 1}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div
                    className="table-footer"
                    id="tableFooter"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      {loading
                        ? "Loading…"
                        : categories.length === 0
                        ? "Showing 0 entries"
                        : `Showing ${pageStart + 1} to ${
                            pageStart + pagedCategories.length
                          } of ${categories.length} entries`}
                    </span>
                    {!loading && !error && categories.length > 0 && (
                      <div className="pagination">
                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                        >
                          Prev
                        </button>
                        <span className="page-info">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* ADD/EDIT Modal */}
      <div className="modal-overlay" id="catModal">
        <div className="modal">
          <button className="modal-close" id="modalClose">
            <svg viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="modal-title" id="modalTitle">
            Add New Category
          </div>
          <input type="hidden" id="editRowId" />
          <div className="form-group">
            <label className="form-label">
              Category Name <span className="req">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="catNameInput"
              placeholder="e.g. Italian, Mexican, Thai..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="catStatus" value="active" defaultChecked /> Active
              </label>
              <label className="radio-label">
                <input type="radio" name="catStatus" value="deactive" /> De-Active
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Choose Image</label>
            <div className="img-upload-row">
              <div className="img-preview" id="imgPreview">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                <span>No image</span>
                <img id="previewImg" alt="preview" />
              </div>
              <div className="img-upload-info">
                <button className="upload-btn" type="button">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  UPLOAD IMAGE
                </button>
                <input
                  type="file"
                  id="fileInput"
                  accept=".gif,.png,.jpeg,.jpg"
                  style={{ display: "none" }}
                />
                <div className="upload-hint">
                  **Images should be 600x400 for best view..
                  <br />
                  Only .gif, .png, .jpeg, .jpg upto 1 MB
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-add" id="saveCatBtn">
              ADD
            </button>
            <button className="btn-cancel-modal" id="cancelBtn">
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* DELETE Modal */}
      <div className="modal-overlay" id="deleteModal">
        <div className="modal del-modal">
          <div className="del-icon">
            <svg viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <h3>Delete Category?</h3>
          <p id="deleteModalMsg">
            Are you sure you want to delete this category? This action cannot be undone.
          </p>
          <div className="del-btns">
            <button className="btn-del-confirm" id="confirmDeleteBtn">
              DELETE
            </button>
            <button className="btn-cancel-modal" id="cancelDeleteBtn">
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* CROP MODAL */}
      <div className="crop-overlay" id="cropOverlay">
        <div className="crop-modal">
          <div className="crop-head">
            <h2>✂️ Crop &amp; Adjust Image</h2>
            <button>✕</button>
          </div>
          <div className="crop-body">
            <div className="crop-wrapper" id="cropWrapper">
              <img id="cropImg" alt="crop" />
              <div className="crop-box" id="cropBox">
                <div className="ch tl" data-dir="tl"></div>
                <div className="ch tr" data-dir="tr"></div>
                <div className="ch bl" data-dir="bl"></div>
                <div className="ch br" data-dir="br"></div>
              </div>
            </div>
            <div className="crop-ctrl">
              <label>Aspect:</label>
              <div className="aspect-btns">
                <button className="asp-btn active">3:2</button>
                <button className="asp-btn">1:1</button>
                <button className="asp-btn">16:9</button>
                <button className="asp-btn">Free</button>
              </div>
              <label style={{ marginLeft: "6px" }}>Zoom:</label>
              <input type="range" id="zoomSlider" min="100" max="300" defaultValue="100" />
            </div>
          </div>
          <div className="crop-foot">
            <button className="btn-crop-cancel">Cancel</button>
            <button className="btn-crop-apply">Apply Crop</button>
          </div>
        </div>
      </div>
      <canvas id="cropCanvas"></canvas>
    </div>
  );
}
