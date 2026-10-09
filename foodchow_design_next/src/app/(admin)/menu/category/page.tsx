"use client";

import { useEffect, useRef, useState } from "react";
import { menuService, type MenuCategory } from "@/api";
import { WizardFooter } from "@/components/shared/WizardFooter";
import Swal from "sweetalert2";
import { useShopId, getShopId } from "@/utils/shop";
import "./page.css";

function getCategoryImageUrl(imagePath?: string | null): string | null {
  if (!imagePath || imagePath === "null" || imagePath.trim() === "") return null;
  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }
  return `https://admin.foodchow.com/CategoryImages/${imagePath}`;
}

const PAGE_SIZE = 10;

const showToast = (icon: "success" | "error" | "warning", title: string) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon,
    title,
  });
};

export default function CategoryPage() {
  const SHOP_ID = useShopId();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Edit modal state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{
    id: number;
    cate_name: string;
    cate_image: string;
    status: number;
  } | null>(null);
  const [catName, setCatName] = useState("");
  const [catStatus, setCatStatus] = useState<"active" | "deactive">("active");
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Delete modal state ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Stable ref so the useEffect crop logic can push the cropped base64 back to React state
  const setEditImagePreviewRef = useRef(setEditImagePreview);
  const cropSourceRef = useRef<"add" | "edit">("add");
  useEffect(() => {
    setEditImagePreviewRef.current = setEditImagePreview;
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedCategories = categories.slice(pageStart, pageStart + PAGE_SIZE);

  // ── Load categories from the FoodChow API ──
  useEffect(() => {
    const currentShop = SHOP_ID || getShopId();
    if (!currentShop) return;
    let active = true;
    setLoading(true);
    menuService
      .categoriesByShop(currentShop)
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
  }, [SHOP_ID]);

  // ── React handlers ──

  function handleEdit(cat: MenuCategory) {
    setEditCategory({ id: cat.id, cate_name: cat.cate_name, cate_image: cat.cate_image, status: cat.status });
    setCatName(cat.cate_name);
    setCatStatus(cat.status === 1 ? "active" : "deactive");
    setEditImagePreview(cat.cate_image || null);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editCategory) return;
    const trimmedName = catName.trim();
    if (!trimmedName) {
      showToast("warning", "Category name is required.");
      return;
    }
    const activeShopId = SHOP_ID || getShopId();
    if (!activeShopId) {
      showToast("warning", "Shop ID not found. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      let finalImageName = "";

      // 1. If user selected/cropped a new image (base64)
      if (editImagePreview && editImagePreview.startsWith("data:image/")) {
        const rawBase64 = editImagePreview.replace(/^data:image\/[a-z]+;base64,/, "");
        const uploadRes = await menuService.uploadCategoryImage({
          id: editCategory.id,
          shop_id: activeShopId,
          base64Image: rawBase64,
        });

        if (uploadRes && uploadRes.success === false) {
          throw new Error(uploadRes.message || "Failed to upload category image");
        }
        finalImageName = uploadRes?.data || "";
      } else if (editImagePreview) {
        // Kept existing image filename
        finalImageName = editCategory.cate_image || "";
      } else {
        // Image was cleared / deleted
        finalImageName = "";
      }

      // 2. Update category name and metadata
      const saveRes = await menuService.addStoreCategory({
        id: editCategory.id,
        shop_id: activeShopId,
        cate_name: trimmedName,
        cate_image: finalImageName,
        description: "",
        parent_id: 0,
      });

      if (saveRes && saveRes.success === false) {
        throw new Error(saveRes.message || "Failed to save category name");
      }

      // 3. Update status if changed
      const targetStatus = catStatus === "active" ? 1 : 0;
      if (targetStatus !== editCategory.status) {
        await menuService.changeStoreCategoryStatus(editCategory.id, targetStatus);
      }

      // 4. Reload fresh categories from server
      const refreshed = await menuService.categoriesByShop(activeShopId);
      setCategories(refreshed);
      setEditOpen(false);
      showToast("success", "Category updated successfully");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(cat: MenuCategory) {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await menuService.deleteCategory(deleteTarget.id);
      if (res?.message === "Item Available In This Category") {
        showToast("error", "Cannot delete: this category has items. Remove items first.");
        setDeleteOpen(false);
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
      showToast("success", "Category deleted successfully");
    } catch {
      showToast("error", "Failed to delete category. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(cat: MenuCategory) {
    const newStatus = cat.status === 1 ? 0 : 1;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
    );
    try {
      await menuService.changeStoreCategoryStatus(cat.id, newStatus);
      showToast("success", `Category ${newStatus === 1 ? "activated" : "deactivated"} successfully`);
    } catch {
      // Roll back on failure
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: cat.status } : c))
      );
      showToast("error", "Failed to update status.");
    }
  }

  // ── DOM-manipulation useEffect (search, bulk delete, add new modal, crop) ──
  useEffect(() => {
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
    const addModal = $("addCatModal");
    const prevBtn = $("prevBtn");
    const nextBtn = $("nextBtn");
    const fileInput = $<HTMLInputElement>("fileInput");

    function updateFooter() {
      const total = document.querySelectorAll("#catTableBody tr").length;
      const tf = $("tableFooter");
      if (tf) tf.textContent = `Showing 1 to ${total} of ${total} entries`;
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

    function closeModal() {
      addModal?.classList.remove("open");
      resetImgPreview();
      if (fileInput) fileInput.value = "";
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
        showToast("warning", "Select at least one row.");
        return;
      }
      checked.forEach((cb) => cb.closest("tr")?.remove());
      updateFooter();
      if (selectAll) selectAll.checked = false;
    };
    deleteAllBtn?.addEventListener("click", onDeleteAll);

    const onOpenAdd = () => {
      cropSourceRef.current = "add";
      const modalTitle = $("addModalTitle");
      const catNameInput = $<HTMLInputElement>("addCatNameInput");
      if (modalTitle) modalTitle.textContent = "Add New Category";
      if (catNameInput) catNameInput.value = "";
      const r = root.querySelector(
        'input[name=addCatStatus][value=active]'
      ) as HTMLInputElement | null;
      if (r) r.checked = true;
      resetImgPreview();
      addModal?.classList.add("open");
      setTimeout(() => $<HTMLInputElement>("addCatNameInput")?.focus(), 50);
    };
    openAddModal?.addEventListener("click", onOpenAdd);

    const onSave = async () => {
      const catNameInput = $<HTMLInputElement>("addCatNameInput");
      if (!catNameInput) return;
      const name = catNameInput.value.trim();
      if (!name) {
        catNameInput.style.borderColor = "#e53e3e";
        return;
      }
      catNameInput.style.borderColor = "";
      const isActive =
        (root.querySelector(
          'input[name=addCatStatus]:checked'
        ) as HTMLInputElement | null)?.value === "active";
      const previewImg = $<HTMLImageElement>("previewImg");
      const imgSrc =
        previewImg && previewImg.style.display !== "none" && previewImg.src
          ? previewImg.src
          : null;

      const activeShopId = getShopId();
      if (!activeShopId) {
        showToast("warning", "Shop ID not found");
        return;
      }

      try {
        if (saveCatBtn) saveCatBtn.textContent = "ADDING...";
        const addRes = await menuService.addStoreCategory({
          id: 0,
          shop_id: activeShopId,
          cate_name: name,
          cate_image: "",
          description: "",
          parent_id: 0,
        });

        if (addRes && addRes.success === false) {
          showToast("error", addRes.message || "Failed to add category");
          return;
        }

        const newId = addRes?.data;
        if (newId && imgSrc && imgSrc.startsWith("data:image/")) {
          const rawBase64 = imgSrc.replace(/^data:image\/[a-z]+;base64,/, "");
          await menuService.uploadCategoryImage({
            id: newId,
            shop_id: activeShopId,
            base64Image: rawBase64,
          });
        }

        if (newId && !isActive) {
          await menuService.changeStoreCategoryStatus(newId, 0);
        }

        const refreshed = await menuService.categoriesByShop(activeShopId);
        setCategories(refreshed);
        closeModal();
        showToast("success", "Category added successfully");
      } catch (err: any) {
        showToast("error", err?.message || "Failed to add category");
      } finally {
        if (saveCatBtn) saveCatBtn.textContent = "ADD";
      }
    };
    saveCatBtn?.addEventListener("click", onSave);

    modalClose?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    const onAddModalClick = (e: MouseEvent) => {
      if (e.target === addModal) closeModal();
    };
    addModal?.addEventListener("click", onAddModalClick);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        setEditImagePreviewRef.current(null);
        setEditOpen(false);
        setDeleteOpen(false);
      }
    };
    document.addEventListener("keydown", onKeydown);

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
      if (cropSourceRef.current === "edit") {
        setEditImagePreviewRef.current(src);
      } else {
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
      }
      closeCropModal();
    }

    const onFileChange = function (this: HTMLInputElement, e: Event) {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      if (f.size > 1024 * 1024) {
        showToast("warning", "Max 1MB image allowed");
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
      addModal?.removeEventListener("click", onAddModalClick);
      document.removeEventListener("keydown", onKeydown);
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

              {/* ── TABLE ── */}
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
                              {getCategoryImageUrl(cat.cate_image) ? (
                                <img
                                  src={getCategoryImageUrl(cat.cate_image)!}
                                  alt={cat.cate_name}
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                    const next = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                                    if (next) next.style.display = "inline-flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="no-img"
                                style={{
                                  display: getCategoryImageUrl(cat.cate_image) ? "none" : "inline-flex",
                                }}
                              >
                                <svg viewBox="0 0 24 24">
                                  <path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z" />
                                  <circle cx="12" cy="13" r="3" />
                                </svg>
                                <span>No Image</span>
                              </div>
                            </td>
                            <td>
                              <span className="cat-name">
                                {cat.cate_name.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="act-btns">
                                <button
                                  className="icon-btn edit-btn"
                                  title="Edit Category"
                                  onClick={() => handleEdit(cat)}
                                >
                                  <svg viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  className="icon-btn delete-btn"
                                  title="Delete Category"
                                  onClick={() => handleDelete(cat)}
                                >
                                  <svg viewBox="0 0 24 24">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                </button>
                                <label
                                  className="toggle-switch"
                                  title={cat.status === 1 ? "DeActivate Category" : "Activate Category"}
                                >
                                  <input
                                    type="checkbox"
                                    checked={cat.status === 1}
                                    onChange={() => handleToggle(cat)}
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
                      position: "relative",
                      minHeight: "50px",
                      width: "100%"
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
                      <div className="pagination" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                        >
                          Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            className={`page-btn ${page === pageNum ? "active-page" : ""}`}
                            style={{ background: page === pageNum ? "#222" : "", color: page === pageNum ? "#fff" : "" }}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
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

      {/* ADD NEW Modal (DOM-controlled via useEffect) */}
      <div className="modal-overlay" id="addCatModal">
        <div className="modal">
          <button className="modal-close" id="modalClose">
            <svg viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="modal-title" id="addModalTitle">
            Add New Category
          </div>
          <div className="form-group">
            <label className="form-label">
              Category Name <span className="req">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="addCatNameInput"
              placeholder="e.g. Italian, Mexican, Thai..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="addCatStatus" value="active" defaultChecked /> Active
              </label>
              <label className="radio-label">
                <input type="radio" name="addCatStatus" value="deactive" /> De-Active
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
                <img id="previewImg" alt="preview" style={{ display: "none" }} />
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

      {/* EDIT Modal (React-controlled) */}
      {editOpen && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditOpen(false);
          }}
        >
          <div className="modal">
            <button className="modal-close" onClick={() => setEditOpen(false)}>
              <svg viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="modal-title">Edit Category</div>
            <div className="form-group">
              <label className="form-label">
                Category Name <span className="req">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Italian, Mexican, Thai..."
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="editCatStatus"
                    value="active"
                    checked={catStatus === "active"}
                    onChange={() => setCatStatus("active")}
                  />{" "}
                  Active
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="editCatStatus"
                    value="deactive"
                    checked={catStatus === "deactive"}
                    onChange={() => setCatStatus("deactive")}
                  />{" "}
                  De-Active
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Choose Image</label>
              <div className="img-upload-row">
                <div className="img-preview" id="editImgPreview">
                  {getCategoryImageUrl(editImagePreview) ? (
                    <img
                      src={getCategoryImageUrl(editImagePreview)!}
                      alt="preview"
                      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-2h6l2 2h1a2 2 0 012 2z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>No image</span>
                    </>
                  )}
                </div>
                <div className="img-upload-info">
                  <button
                    className="upload-btn"
                    type="button"
                    onClick={() => {
                      cropSourceRef.current = "edit";
                      document.getElementById("fileInput")?.click();
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    UPLOAD IMAGE
                  </button>
                  {editImagePreview && (
                    <button
                      type="button"
                      className="btn-cancel-modal"
                      style={{ marginTop: 8, fontSize: "0.75rem" }}
                      onClick={() => setEditImagePreview(null)}
                    >
                      DELETE IMAGE
                    </button>
                  )}
                  <div className="upload-hint">
                    Only .gif, .png, .jpeg, .jpg upto 1 MB
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-add"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "SAVING…" : "SAVE"}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => setEditOpen(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE Modal (React-controlled) */}
      {deleteOpen && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteOpen(false);
          }}
        >
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
            <p>
              Are you sure you want to delete &quot;{deleteTarget?.cate_name}&quot;? This action cannot be undone.
            </p>
            <div className="del-btns">
              <button
                className="btn-del-confirm"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "DELETING…" : "DELETE"}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => setDeleteOpen(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

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
