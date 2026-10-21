"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/restaurantimgae.html → React.
 *
 * Static markup rendered; all inline <script> behaviour (image choose, custom
 * crop-box drag/resize, zoom, apply crop, delete modal) ported into one
 * useEffect. Inline onclick handlers (setAspect/applyZoom/applyCrop/
 * closeCropModal) are wired by id / element order via addEventListener.
 * Sidebar/header markup and the dropdown helpers (which targeted shell-only
 * elements) are dropped.
 */
interface CropState {
  x: number;
  y: number;
  w: number;
  h: number;
  imgW: number;
  imgH: number;
  ratio: number;
  zoom: number;
}

export default function RestaurantImgaePage() {
  useEffect(() => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    const btnChooseImage = document.getElementById("btnChooseImage");
    const btnDelete = document.getElementById("btnDelete") as HTMLButtonElement | null;
    const imagePreview = document.getElementById(
      "imagePreview",
    ) as HTMLImageElement | null;
    const placeholderText = document.getElementById("placeholderText");
    const deleteModal = document.getElementById("deleteModal");
    const btnCancel = document.getElementById("btnCancel");
    const btnConfirmDelete = document.getElementById("btnConfirmDelete");
    const cropOverlay = document.getElementById("cropOverlay");
    const cropImg = document.getElementById("cropImg") as HTMLImageElement | null;
    const cropWrapper = document.getElementById("cropWrapper");
    const cropBoxInitial = document.getElementById("cropBox");
    const zoomSlider = document.getElementById("zoomSlider") as HTMLInputElement | null;
    const cropCanvas = document.getElementById("cropCanvas") as HTMLCanvasElement | null;

    let originalImageSrc = "";
    const cs: CropState = {
      x: 40,
      y: 30,
      w: 200,
      h: 133,
      imgW: 0,
      imgH: 0,
      ratio: 1.5,
      zoom: 1,
    };

    const closeCropModal = (): void => cropOverlay?.classList.remove("open");

    const renderBox = (): void => {
      const b = document.getElementById("cropBox");
      if (b)
        b.style.cssText = `left:${cs.x}px;top:${cs.y}px;width:${cs.w}px;height:${cs.h}px`;
    };

    const resetBox = (): void => {
      const w = cs.imgW * 0.7;
      const h = cs.ratio > 0 ? w / cs.ratio : cs.imgH * 0.7;
      cs.x = (cs.imgW - w) / 2;
      cs.y = (cs.imgH - h) / 2;
      cs.w = w;
      cs.h = h;
      renderBox();
    };

    const initDrag = (): void => {
      const box = document.getElementById("cropBox");
      if (!box) return;
      let drag = false;
      let resize = false;
      let dir = "";
      let sx = 0;
      let sy = 0;
      let ox = 0;
      let oy = 0;
      let ow = 0;
      let oh = 0;
      const newBox = box.cloneNode(true) as HTMLElement;
      box.parentNode?.replaceChild(newBox, box);
      newBox.addEventListener("mousedown", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("ch")) {
          resize = true;
          dir = target.dataset.dir ?? "";
        } else {
          drag = true;
        }
        sx = e.clientX;
        sy = e.clientY;
        ox = cs.x;
        oy = cs.y;
        ow = cs.w;
        oh = cs.h;
        e.preventDefault();
      });
      const onMove = (e: MouseEvent): void => {
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
      const onUp = (): void => {
        drag = false;
        resize = false;
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      cleanups.push(() => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      });
    };

    const cleanups: Array<() => void> = [];

    const openCropModal = (src: string): void => {
      if (!cropImg) return;
      cropImg.src = src;
      cropImg.onload = () => {
        if (!cropWrapper) return;
        cs.imgW = cropWrapper.offsetWidth;
        cs.imgH = cropWrapper.offsetHeight;
        resetBox();
        initDrag();
      };
      cropOverlay?.classList.add("open");
      if (zoomSlider) zoomSlider.value = "100";
      if (cropImg) cropImg.style.transform = "scale(1)";
    };

    const setAspect = (btn: HTMLElement, r: number): void => {
      document
        .querySelectorAll("#pg-setup-restaurantimgae .asp-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cs.ratio = r;
      resetBox();
    };

    const applyZoom = (v: string): void => {
      cs.zoom = Number(v) / 100;
      if (cropImg) cropImg.style.transform = `scale(${cs.zoom})`;
    };

    const applyCrop = (): void => {
      if (!cropImg || !cropWrapper || !cropCanvas || !imagePreview) return;
      const sx2 = cropImg.naturalWidth / cropWrapper.offsetWidth;
      const sy2 = cropImg.naturalHeight / cropWrapper.offsetHeight;
      cropCanvas.width = cs.w * sx2;
      cropCanvas.height = cs.h * sy2;
      cropCanvas
        .getContext("2d")
        ?.drawImage(
          cropImg,
          cs.x * sx2,
          cs.y * sy2,
          cs.w * sx2,
          cs.h * sy2,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height,
        );
      const src = cropCanvas.toDataURL("image/jpeg", 0.92);
      imagePreview.src = src;
      imagePreview.style.display = "block";
      if (placeholderText) placeholderText.style.display = "none";
      const placeholder = document.getElementById("placeholder");
      if (placeholder) {
        placeholder.style.background = "transparent";
        placeholder.style.border = "none";
      }
      if (btnChooseImage) (btnChooseImage as HTMLElement).style.display = "none";
      if (btnDelete) btnDelete.style.display = "block";
      closeCropModal();
    };

    // ── Wire handlers ──
    const onChoose = (): void => fileInput?.click();
    btnChooseImage?.addEventListener("click", onChoose);

    const onFileChange = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        if (file.size > 1 * 1024 * 1024) {
          alert("You can select only files up to 1MB file size..!!!");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          originalImageSrc = String(e.target?.result ?? "");
          openCropModal(originalImageSrc);
        };
        reader.readAsDataURL(file);
      }
      target.value = "";
    };
    fileInput?.addEventListener("change", onFileChange);

    const onDelete = (): void => {
      if (deleteModal) deleteModal.style.display = "flex";
    };
    btnDelete?.addEventListener("click", onDelete);

    const onCancelDelete = (): void => {
      if (deleteModal) deleteModal.style.display = "none";
    };
    btnCancel?.addEventListener("click", onCancelDelete);

    const onConfirmDelete = (): void => {
      if (imagePreview) {
        imagePreview.src = "#";
        imagePreview.style.display = "none";
      }
      if (placeholderText) placeholderText.style.display = "block";
      const placeholder = document.getElementById("placeholder");
      if (placeholder) {
        placeholder.style.background = "";
        placeholder.style.border = "";
      }
      if (btnChooseImage) (btnChooseImage as HTMLElement).style.display = "block";
      if (btnDelete) btnDelete.style.display = "none";
      if (fileInput) fileInput.value = "";
      originalImageSrc = "";
      if (deleteModal) deleteModal.style.display = "none";
    };
    btnConfirmDelete?.addEventListener("click", onConfirmDelete);

    // Crop close buttons (head ✕ and Cancel).
    const cropCloseButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "#pg-setup-restaurantimgae .crop-head button, #pg-setup-restaurantimgae .btn-cancel-crop",
      ),
    );
    cropCloseButtons.forEach((b) => b.addEventListener("click", closeCropModal));

    // Aspect buttons (in original markup order: 3:2, 1:1, 16:9, Free).
    const aspectRatios = [1.5, 1, 1.778, 0];
    const aspBtns = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "#pg-setup-restaurantimgae .asp-btn",
      ),
    );
    const aspHandlers = aspBtns.map((btn, idx) => {
      const fn = (): void => setAspect(btn, aspectRatios[idx]);
      btn.addEventListener("click", fn);
      return fn;
    });

    const onZoom = (e: Event): void => applyZoom((e.target as HTMLInputElement).value);
    zoomSlider?.addEventListener("input", onZoom);

    const applyBtn = document.querySelector<HTMLButtonElement>(
      "#pg-setup-restaurantimgae .btn-apply",
    );
    applyBtn?.addEventListener("click", applyCrop);

    // Restore the unused-ref guard: ensure cropBoxInitial is referenced.
    void cropBoxInitial;

    return () => {
      btnChooseImage?.removeEventListener("click", onChoose);
      fileInput?.removeEventListener("change", onFileChange);
      btnDelete?.removeEventListener("click", onDelete);
      btnCancel?.removeEventListener("click", onCancelDelete);
      btnConfirmDelete?.removeEventListener("click", onConfirmDelete);
      cropCloseButtons.forEach((b) =>
        b.removeEventListener("click", closeCropModal),
      );
      aspBtns.forEach((btn, idx) =>
        btn.removeEventListener("click", aspHandlers[idx]),
      );
      zoomSlider?.removeEventListener("input", onZoom);
      applyBtn?.removeEventListener("click", applyCrop);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div id="pg-setup-restaurantimgae">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="content-card">
              <div className="report-header">
                <h1 className="report-title typ-page-heading" style={{ margin: 0 }}>Restaurant Image</h1>
                <div className="report-header-actions">
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

              <div className="image-upload-wrapper">
                <div className="image-placeholder" id="placeholder">
                  <img
                    id="imagePreview"
                    src="#"
                    alt="Restaurant Image"
                    style={{ display: "none" }}
                  />
                  <span id="placeholderText" style={{ color: "#666" }}>
                    <img
                      src="/images/no-food-image.png"
                      height="300"
                      width="300"
                      alt="No Image"
                    />
                  </span>
                </div>

                <input
                  type="file"
                  id="fileInput"
                  accept=".gif, .png, .jpeg, .jpg"
                  style={{ display: "none" }}
                />

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn-choose-image" id="btnChooseImage">
                    CHOOSE IMAGE
                  </button>
                  <button className="btn-delete-image" id="btnDelete">
                    DELETE IMAGE
                  </button>
                </div>

                <div style={{ marginTop: "5px" }}>
                  <p className="image-helper-text">
                    **Images should be 600x400 for best view
                  </p>
                  <p className="image-helper-text">
                    You can select only (.gif, .png, .jpeg, .jpg) format files up to
                    1MB file size..!!!
                  </p>
                </div>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="deleteModal">
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
            <button className="btn-modal btn-modal-cancel" id="btnCancel">
              Cancel
            </button>
            <button className="btn-modal btn-modal-confirm" id="btnConfirmDelete">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>

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
                <div className="ch tl" data-dir="tl" />
                <div className="ch tr" data-dir="tr" />
                <div className="ch bl" data-dir="bl" />
                <div className="ch br" data-dir="br" />
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
            <button className="btn-cancel-crop">Cancel</button>
            <button className="btn-apply">Apply Crop</button>
          </div>
        </div>
      </div>
      <canvas id="cropCanvas" />
    </div>
  );
}
