"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/ambience.html → React.
 *
 * Static markup rendered; the inline <script> (custom crop-box drag/resize,
 * zoom, apply crop, add tile → file picker, delete tile) is ported into one
 * useEffect. Per-item delete buttons (including dynamically added ones) use
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

export default function AmbiencePage() {
  const [images, setImages] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ambience_images");
    if (saved) {
      setImages(JSON.parse(saved));
    } else {
      setImages([
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      ]);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("ambience_images", JSON.stringify(images));
    }
  }, [images, mounted]);

  useEffect(() => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    const addTile = document.querySelector<HTMLElement>(
      "#pg-setup-ambience .add-tile",
    );
    const galleryGrid = document.getElementById("galleryGrid");
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
        .querySelectorAll("#pg-setup-ambience .asp-btn")
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
      closeCropModal();

      Swal.fire({
        title: "Uploading Image...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      setTimeout(() => {
        setImages((prev) => [...prev, src]);
        Swal.fire({
          icon: "success",
          title: "Saved Successfully!",
          text: "Ambience image added successfully.",
          confirmButtonColor: "#00a896",
        });
      }, 800);
    };

    const onFileSelected = (e: Event): void => {
      const target = e.target as HTMLInputElement;
      const f = target.files?.[0];
      if (!f) return;
      if (f.size > 3 * 1024 * 1024) {
        Swal.fire("Error", "Maximum file size is 3 MB", "error");
        return;
      }
      const r = new FileReader();
      r.onload = (ev) => openCropModal(String(ev.target?.result ?? ""));
      r.readAsDataURL(f);
      target.value = "";
    };

    // ── Wire handlers ──
    const onAddTile = (): void => fileInput?.click();
    addTile?.addEventListener("click", onAddTile);
    fileInput?.addEventListener("change", onFileSelected);

    // Delegate delete buttons (existing + dynamically added).
    const onGridClick = (e: Event): void => {
      const btn = (e.target as HTMLElement).closest(".del-btn");
      if (btn) {
        const indexStr = btn.getAttribute("data-index");
        if (indexStr === null) return;
        const index = parseInt(indexStr, 10);

        Swal.fire({
          title: "Remove Image?",
          text: "Are you sure you want to remove this ambience image?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e63946",
          cancelButtonColor: "#8e9ba8",
          confirmButtonText: "Yes, remove it",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Removing...",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });
            setTimeout(() => {
              setImages((prev) => prev.filter((_, i) => i !== index));
              Swal.fire({
                icon: "success",
                title: "Removed!",
                text: "Image has been removed successfully.",
                confirmButtonColor: "#00a896",
              });
            }, 600);
          }
        });
      }
    };
    galleryGrid?.addEventListener("click", onGridClick);

    // Crop close buttons (head ✕ and Cancel).
    const cropCloseButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "#pg-setup-ambience .crop-head button, #pg-setup-ambience .btn-cancel",
      ),
    );
    cropCloseButtons.forEach((b) => b.addEventListener("click", closeCropModal));

    // Aspect buttons (order: 3:2, 1:1, 16:9, Free).
    const aspectRatios = [1.5, 1, 1.778, 0];
    const aspBtns = Array.from(
      document.querySelectorAll<HTMLButtonElement>("#pg-setup-ambience .asp-btn"),
    );
    const aspHandlers = aspBtns.map((btn, idx) => {
      const fn = (): void => setAspect(btn, aspectRatios[idx]);
      btn.addEventListener("click", fn);
      return fn;
    });

    const onZoom = (e: Event): void => applyZoom((e.target as HTMLInputElement).value);
    zoomSlider?.addEventListener("input", onZoom);

    const applyBtn = document.querySelector<HTMLButtonElement>(
      "#pg-setup-ambience .btn-apply",
    );
    applyBtn?.addEventListener("click", applyCrop);

    return () => {
      addTile?.removeEventListener("click", onAddTile);
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
    <div id="pg-setup-ambience">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* ══ APP CONTAINER ══ */}
      <div className="app-container">
        {/* ══ MAIN ══ */}
        <div className="main">
          {/* PAGE CONTENT */}
          <div className="page-content">
            {/* Gallery card */}
            <div className="page-card" id="galleryCard">
              <div className="card-title-row">
                <div className="typ-page-heading card-title">
                  Ambience Images{" "}
                  <span
                    style={{ color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}
                  >
                    [For APP Only]
                  </span>
                </div>
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              <div className="slider-row" id="galleryGrid">
                {mounted &&
                  images.map((src, i) => (
                    <div className="gallery-item" key={i}>
                      <img src={src} alt="ambience" />
                      <button className="del-btn" data-index={i}>
                        ✕
                      </button>
                    </div>
                  ))}
                {/* Add Photo tile */}
                <div className="add-tile">
                  <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Photo</span>
                </div>
              </div>
              <input
                type="file"
                id="fileInput"
                accept=".gif,.png,.jpeg,.jpg"
                style={{ display: "none" }}
              />
            </div>

            <WizardFooter />
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
            <button className="btn-cancel">Cancel</button>
            <button className="btn-apply">Apply Crop</button>
          </div>
        </div>
      </div>
      <canvas id="cropCanvas" />
    </div>
  );
}
