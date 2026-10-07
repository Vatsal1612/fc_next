"use client";

import { useEffect, useState, useRef } from "react";
import { setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/gallery.html → React.
 *
 * Static markup rendered; the inline <script> (open/close add panel, custom
 * crop-box drag/resize, zoom, apply crop → insert tile, delete tile) ported into
 * one useEffect. Per-item delete buttons (existing + dynamically created) use
 * event delegation on the grid. The external sidebar-loader.js is dropped.
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

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const hasLoaded = useRef(false);
  const uploadImage = async (
    base64img: string,
    fileName: string
  ) => {
    try {
      const shopId = sessionStorage.getItem("shop_id");

      if (!shopId) {
        console.error("Shop ID not found.");
        return;
      }

      const payload = {
        shop_id: shopId,
        device_type: "1",
        imageflag: "2",
        user_type: "4",
        photo_count: "1",
        photo_0: base64img,
        user_type_id: shopId,
        caption: fileName,
      };

      console.log("Upload Payload:", payload);
      const response = await setupService.uploadGalleryImage(payload);
      console.log("Upload Response:", response);

    } catch (err) {
      console.error("Upload Error:", err);
    }
  }
  const loadGalleryImages = async () => {
    try {
      const shopId = sessionStorage.getItem("shop_id");
      const response = await setupService.getGalleryImages(Number(shopId));

      const galleryImages = JSON.parse(response.data);

      setImages(galleryImages);

    } catch (error) {
      console.error("Error loading gallery images:", error);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadGalleryImages();
    }
    const galleryCard = document.getElementById("galleryCard");
    const addPanel = document.getElementById("addPanel");
    const galleryGrid = document.getElementById("galleryGrid");
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    const cropOverlay = document.getElementById("cropOverlay");
    const cropImg = document.getElementById("cropImg") as HTMLImageElement | null;
    const cropWrapper = document.getElementById("cropWrapper");
    const zoomSlider = document.getElementById("zoomSlider") as HTMLInputElement | null;
    const cropCanvas = document.getElementById("cropCanvas") as HTMLCanvasElement | null;

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
    const cleanups: Array<() => void> = [];

    const openAddPanel = (): void => {
      if (galleryCard) galleryCard.style.display = "none";
      if (addPanel) addPanel.style.display = "block";
    };
    const closeAddPanel = (): void => {
      if (addPanel) addPanel.style.display = "none";
      if (galleryCard) galleryCard.style.display = "block";
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
        .querySelectorAll("#pg-setup-gallery .asp-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cs.ratio = r;
      resetBox();
    };

    const applyZoom = (v: string): void => {
      cs.zoom = Number(v) / 100;
      if (cropImg) cropImg.style.transform = `scale(${cs.zoom})`;
    };

    const applyCrop = async (): Promise<void> => {
      if (!cropImg || !cropWrapper || !cropCanvas || !galleryGrid) return;
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
      await uploadImage(src.split(",")[1], "main.jpg");
      await loadGalleryImages();
      // const tile = galleryGrid.querySelector(".add-tile");
      // const item = document.createElement("div");
      // item.className = "gallery-item";
      // item.innerHTML = `<img src="${src}" alt="gallery"><button class="del-btn">✕</button>`;
      // galleryGrid.insertBefore(item, tile);
      closeCropModal();
      closeAddPanel();
    };

    const onFileSelected = async (e: Event): Promise<void> => {
      const target = e.target as HTMLInputElement;
      const f = target.files?.[0];
      if (!f) return;

      if (f.size > 3 * 1024 * 1024) {
        alert("Max 3 MB");
        return;
      }
      const r = new FileReader();
      r.onload = (ev) => openCropModal(String(ev.target?.result ?? ""));
      r.readAsDataURL(f);
      target.value = "";
    };

    // ── Wire handlers ──
    const addTile = document.querySelector<HTMLElement>("#pg-setup-gallery .add-tile");
    addTile?.addEventListener("click", openAddPanel);

    const closeAddBtn = document.getElementById("addPanelCloseBtn");
    closeAddBtn?.addEventListener("click", closeAddPanel);

    const uploadZone = document.querySelector<HTMLElement>(
      "#pg-setup-gallery .upload-zone",
    );
    const onUploadZone = (): void => fileInput?.click();
    uploadZone?.addEventListener("click", onUploadZone);

    const clickToUpload = document.getElementById("clickToUploadBtn");
    const onClickToUpload = (e: Event): void => {
      e.stopPropagation();
      fileInput?.click();
    };
    clickToUpload?.addEventListener("click", onClickToUpload);

    fileInput?.addEventListener("change", onFileSelected);

    // Delegate delete buttons (existing + dynamically added).
    const onGridClick = (e: Event): void => {
      const btn = (e.target as HTMLElement).closest(".del-btn");
      if (btn) btn.closest(".gallery-item")?.remove();
    };
    galleryGrid?.addEventListener("click", onGridClick);

    // Crop close buttons (head ✕ and Cancel).
    const cropCloseButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "#pg-setup-gallery .crop-head button, #pg-setup-gallery .btn-cancel",
      ),
    );
    cropCloseButtons.forEach((b) => b.addEventListener("click", closeCropModal));

    // Aspect buttons (order: 3:2, 1:1, 16:9, Free).
    const aspectRatios = [1.5, 1, 1.778, 0];
    const aspBtns = Array.from(
      document.querySelectorAll<HTMLButtonElement>("#pg-setup-gallery .asp-btn"),
    );
    const aspHandlers = aspBtns.map((btn, idx) => {
      const fn = (): void => setAspect(btn, aspectRatios[idx]);
      btn.addEventListener("click", fn);
      return fn;
    });

    const onZoom = (e: Event): void => applyZoom((e.target as HTMLInputElement).value);
    zoomSlider?.addEventListener("input", onZoom);

    const applyBtn = document.querySelector<HTMLButtonElement>(
      "#pg-setup-gallery .btn-apply",
    );
    applyBtn?.addEventListener("click", applyCrop);

    return () => {
      addTile?.removeEventListener("click", openAddPanel);
      closeAddBtn?.removeEventListener("click", closeAddPanel);
      uploadZone?.removeEventListener("click", onUploadZone);
      clickToUpload?.removeEventListener("click", onClickToUpload);
      fileInput?.removeEventListener("change", onFileSelected);
      galleryGrid?.removeEventListener("click", onGridClick);
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
    <div id="pg-setup-gallery">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* ══ APP CONTAINER (sidebar + main) ══ */}
      <div className="app-container">
        {/* ══ MAIN CONTENT (gallery + nav) ══ */}
        <div className="main">
          {/* PAGE CONTENT */}
          <div className="page-content">
            {/* Gallery card */}
            <div className="page-card" id="galleryCard">
              <div className="card-title-row">
                <div className="typ-page-heading card-title">
                  Slider Images{" "}
                  <span style={{ color: "#6b7280", fontWeight: 500, fontSize: "14px" }}>
                    [For APP Only]
                  </span>
                </div>
              </div>

              <div className="gallery-grid" id="galleryGrid">
                {images.map((item: any) => (
                  <div className="gallery-item" key={item.gallery_id}>
                    <img
                      src={`https://admin.foodchow.com/GalleryImages/${sessionStorage.getItem("shop_id")}/${item.gallery_image}`}
                      alt="gallery"
                      onError={(e) => console.log("Image failed:", e.currentTarget.src)}
                    />
                    <button className="del-btn">✕</button>
                  </div>
                ))}
                <div className="add-tile">
                  <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Photo</span>
                </div>
              </div>
            </div>

            {/* Inline Add Panel */}
            <div className="page-card" id="addPanel" style={{ display: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  Add New Slider Images
                </div>
                <button
                  id="addPanelCloseBtn"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "22px",
                    cursor: "pointer",
                    color: "#6b7280",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="upload-zone">
                <svg viewBox="0 0 24 24">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                </svg>
                <button className="up-btn" id="clickToUploadBtn">
                  CLICK TO UPLOAD
                </button>
              </div>
              <div className="file-note">
                **Images should be 600x400 for best view in menu image..
                <br />
                You can select only (.gif, .png, .jpeg, .jpg) format files upto 3MB
                file size..!!!
              </div>
              <input type="file" id="fileInput" accept=".gif,.png,.jpeg,.jpg" />
            </div>

            <WizardFooter />
          </div>
          {/* end .page-content */}
        </div>
      </div>

      {/* ══ CROP MODAL ══ */}
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
            <button className="btn-cancel">Cancel</button>
            <button className="btn-apply">Apply Crop</button>
          </div>
        </div>
      </div>
      <canvas id="cropCanvas" />
    </div>
  );
}
