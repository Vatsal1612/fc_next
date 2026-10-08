"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { restaurantService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import Swal from "sweetalert2";
import "./page.css";

/**
 * setup/restaurantlogo.html → React.
 *
 * Static markup rendered; the inline <script> logic (dynamic remove/upload
 * state, delete-confirm modal, inline upload panel, CropperJS crop & upload)
 * ported into one useEffect wired with addEventListener. CropperJS is a
 * page-specific CDN lib: its stylesheet is linked in JSX (React hoists it) and
 * the library is loaded with next/script (afterInteractive), then read off
 * window inside the effect. The DOMContentLoaded sidebar/dropdown helpers (which
 * targeted shell-only elements) are dropped.
 */

// Minimal structural type for the global CropperJS constructor (avoids `any`).
interface CropperInstance {
  destroy(): void;
  getData(): { scaleX?: number };
  zoomTo(ratio: number): void;
  getCroppedCanvas(opts: { width: number; height: number }): HTMLCanvasElement;
}
interface CropperOptions {
  aspectRatio?: number;
  viewMode?: number;
  dragMode?: string;
  autoCropArea?: number;
  restore?: boolean;
  guides?: boolean;
  center?: boolean;
  highlight?: boolean;
  cropBoxMovable?: boolean;
  cropBoxResizable?: boolean;
  toggleDragModeOnDblclick?: boolean;
  ready?: () => void;
}
type CropperConstructor = new (
  el: HTMLImageElement,
  opts: CropperOptions,
) => CropperInstance;
declare global {
  interface Window {
    Cropper?: CropperConstructor;
  }
}

export default function RestaurantLogoPage() {
  const [logo, setLogo] = useState("");
  const logoRef = useRef("");
  const pendingActionRef = useRef<string | null>(null);
  const [, setLoading] = useState(true);

  const logoUrl = logo.startsWith("data:image")
    ? logo
    : logo
      ? `https://admin.foodchow.com/LogoImages/${logo}`
      : "";

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const sessionShopId = sessionStorage.getItem("shop_id");
        if (!sessionShopId) {
          console.error("Shop ID not found.");
          return;
        }
        const info = await restaurantService.getRestaurantInformation(Number(sessionShopId));
        console.log(info);

        // if (info?.shoplogo) {
        //   setLogo(info.shoplogo);
        // }
        if (info?.shoplogo) {
          setLogo(info.shoplogo);
          logoRef.current = info.shoplogo;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();

    const globalOverlay = document.getElementById("global-modal-overlay");
    const deleteBox = document.getElementById("popup-confirm-delete");
    const inlineUploadPanel = document.getElementById("inline-upload-panel");
    const cropPanelBox = document.getElementById("popup-crop-panel");
    const dynamicActionBtn = document.getElementById("dynamic-action-btn");
    const triggerBadge = document.getElementById("trigger-remove-badge");
    const cancelModalBtn = document.getElementById("btn-modal-cancel");
    const yesModalBtn = document.getElementById("btn-modal-yes");
    const closeInlinePanelBtn = document.getElementById("btn-popup-close");
    const btnTriggerFileExplorer = document.getElementById(
      "btn-trigger-file-explorer",
    );
    const logoFileInput = document.getElementById(
      "logo-file-input",
    ) as HTMLInputElement | null;
    const cropZoomSlider = document.getElementById(
      "crop-zoom-slider",
    ) as HTMLInputElement | null;
    const cropImageRenderNode = document.getElementById(
      "crop-image-render-node",
    ) as HTMLImageElement | null;
    const btnCropAndUpload = document.getElementById("btn-crop-and-upload");
    const btnCropCancel = document.getElementById("btn-crop-cancel");
    const logoClickableZone = document.getElementById("logo-clickable-zone");
    const logoSvgAsset = document.getElementById("logo-svg-asset");
    const uploadPlaceholder = document.getElementById("upload-placeholder");
    const warningSpecText = document.getElementById("warning-spec-text");
    const uploadNewBtn = document.getElementById("btn-upload-new");

    let dynamicStateWithLogo = true;
    let cropperInstance: CropperInstance | null = null;

    const openDeleteConfirmation = (): void => {
      globalOverlay?.classList.add("active");
      if (deleteBox) deleteBox.style.display = "block";
      if (cropPanelBox) cropPanelBox.style.display = "none";
    };
    const toggleInlineUploadPanel = (): void => {
      if (inlineUploadPanel)
        inlineUploadPanel.style.display =
          inlineUploadPanel.style.display === "block" ? "none" : "block";
    };
    const openCropEngineSuite = (): void => {
      globalOverlay?.classList.add("active");
      if (deleteBox) deleteBox.style.display = "none";
      if (cropPanelBox) cropPanelBox.style.display = "block";
    };
    const closeAllModals = (): void => {
      globalOverlay?.classList.remove("active");
      setTimeout(() => {
        if (deleteBox) deleteBox.style.display = "none";
        if (cropPanelBox) cropPanelBox.style.display = "none";
        if (cropperInstance) {
          cropperInstance.destroy();
          cropperInstance = null;
        }
      }, 200);
    };

    const onDynamicAction = (): void => {
      if (dynamicStateWithLogo) openDeleteConfirmation();
      else toggleInlineUploadPanel();
    };
    const onTriggerBadge = (e: Event): void => {
      e.stopPropagation();
      openDeleteConfirmation();
    };
    const onZoneClick = (): void => {
      if (!dynamicStateWithLogo) toggleInlineUploadPanel();
    };
    const onCloseInline = (): void => {
      if (inlineUploadPanel) inlineUploadPanel.style.display = "none";
    };
    const onTriggerExplorer = (): void => logoFileInput?.click();
    const onUploadNew = (): void => logoFileInput?.click();

    const onFileChange = function (this: HTMLInputElement): void {
      if (this.files && this.files[0]) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          if (inlineUploadPanel) inlineUploadPanel.style.display = "none";
          if (cropImageRenderNode)
            cropImageRenderNode.src = String(e.target?.result ?? "");
          openCropEngineSuite();
          if (window.Cropper && cropImageRenderNode) {
            cropperInstance = new window.Cropper(cropImageRenderNode, {
              aspectRatio: 400 / 250,
              viewMode: 1,
              dragMode: "move",
              autoCropArea: 1,
              restore: false,
              guides: false,
              center: true,
              highlight: false,
              cropBoxMovable: false,
              cropBoxResizable: false,
              toggleDragModeOnDblclick: false,
              ready: () => {
                if (cropZoomSlider && cropperInstance) {
                  cropZoomSlider.min = String(
                    cropperInstance.getData().scaleX ?? 0.5,
                  );
                  cropZoomSlider.max = "3";
                  cropZoomSlider.value = "1";
                }
              },
            });
          }
        };
        fileReader.readAsDataURL(this.files[0]);
      }
    };

    const onZoom = (e: Event): void => {
      if (cropperInstance)
        cropperInstance.zoomTo(Number((e.target as HTMLInputElement).value));
    };

    const onYes = async (): Promise<void> => {
      pendingActionRef.current = "";
      setLogo("");
      
      Swal.fire({ icon: "info", title: "Logo Removed", text: "Click 'Save Changes' to update the restaurant logo.", confirmButtonColor: "#00a896" });

      dynamicStateWithLogo = false;
      closeAllModals();
      logoClickableZone?.classList.add("empty-state");
      if (logoSvgAsset) logoSvgAsset.style.display = "none";
      if (triggerBadge) triggerBadge.style.display = "none";
      const dynamicCroppedImg = logoClickableZone?.querySelector(
        ".uploaded-cropped-logo",
      );
      dynamicCroppedImg?.remove();
      if (uploadPlaceholder) uploadPlaceholder.style.display = "flex";
      if (warningSpecText) warningSpecText.style.display = "flex";
      if (dynamicActionBtn)
        dynamicActionBtn.innerHTML =
          '<i class="fas fa-upload" style="font-size:12px;"></i> Upload New Logo';
    };
    const onCropAndUpload = async (): Promise<void> => {
      if (!cropperInstance) return;

      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: 400,
        height: 250,
      });

      const base64 = croppedCanvas
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, "");

      pendingActionRef.current = base64;
      setLogo(`data:image/png;base64,${base64}`);

      if (logoFileInput) {
        logoFileInput.value = "";
      }

      closeAllModals();

      Swal.fire({ icon: "info", title: "Image Cropped", text: "Click 'Save Changes' to update the restaurant logo.", confirmButtonColor: "#00a896" });
    };

    dynamicActionBtn?.addEventListener("click", onDynamicAction);
    triggerBadge?.addEventListener("click", onTriggerBadge);
    logoClickableZone?.addEventListener("click", onZoneClick);
    cancelModalBtn?.addEventListener("click", closeAllModals);
    btnCropCancel?.addEventListener("click", closeAllModals);
    closeInlinePanelBtn?.addEventListener("click", onCloseInline);
    btnTriggerFileExplorer?.addEventListener("click", onTriggerExplorer);
    uploadNewBtn?.addEventListener("click", onUploadNew);
    logoFileInput?.addEventListener("change", onFileChange);
    cropZoomSlider?.addEventListener("input", onZoom);
    yesModalBtn?.addEventListener("click", onYes);
    btnCropAndUpload?.addEventListener("click", onCropAndUpload);

    return () => {
      dynamicActionBtn?.removeEventListener("click", onDynamicAction);
      triggerBadge?.removeEventListener("click", onTriggerBadge);
      logoClickableZone?.removeEventListener("click", onZoneClick);
      cancelModalBtn?.removeEventListener("click", closeAllModals);
      btnCropCancel?.removeEventListener("click", closeAllModals);
      closeInlinePanelBtn?.removeEventListener("click", onCloseInline);
      btnTriggerFileExplorer?.removeEventListener("click", onTriggerExplorer);
      uploadNewBtn?.removeEventListener("click", onUploadNew);
      logoFileInput?.removeEventListener("change", onFileChange);
      cropZoomSlider?.removeEventListener("input", onZoom);
      yesModalBtn?.removeEventListener("click", onYes);
      btnCropAndUpload?.removeEventListener("click", onCropAndUpload);
      if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
      }
    };
  }, []);

  return (
    <div id="pg-setup-restaurantlogo">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"
        strategy="afterInteractive"
      />

      <input
        type="file"
        id="logo-file-input"
        accept=".gif,.png,.jpeg,.jpg"
        style={{ display: "none" }}
      />

      <div className="app-layout-container">
        <main className="main-workspace-content">
          <div className="page-wrapper">
            <div className="dashboard-card">
              {/* Card Title Bar */}
              <div
                className="page-title-bar"
                style={{ padding: "24px 32px 0", marginBottom: 0 }}
              >
                <div>
                  <h1 className="typ-page-heading" style={{ color: "var(--ink)", margin: 0 }}>
                    Restaurant Logo
                  </h1>
                </div>
                <button 
                  className="btn-help"
                  onClick={() => {
                    Swal.fire({
                      title: "How to set up Restaurant Logo",
                      html: `
                        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
                          <iframe 
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                          </iframe>
                        </div>
                        <p style="margin-top: 15px; font-size: 14px; color: #475569;">
                          Follow these steps to upload and position your restaurant's logo perfectly.
                        </p>
                      `,
                      width: 700,
                      showCloseButton: true,
                      showConfirmButton: false,
                    });
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Help
                </button>
              </div>

              {/* Logo Section */}
              <div className="card-section">
                <div className="logo-section-layout">
                  <div className="logo-left-col">
                    <div className="logo-col-label">Current Logo</div>
                    <div className="logo-display-frame" id="logo-clickable-zone" style={{ border: logo ? "none" : "" }}>
                      <button
                        className="badge-dismiss-trigger"
                        id="trigger-remove-badge"
                        title="Remove logo"
                        style={{ display: logo ? "block" : "none" }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      {logo ? (
                        <img
                          src={logoUrl}
                          alt="Restaurant Logo"
                          className="vector-logo-asset"
                        />
                      ) : null}
                      <div className="upload-placeholder-ui" id="upload-placeholder" style={{ display: logo ? "none" : "flex" }}>
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#c8d8e8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <div className="placeholder-text">Click to upload logo</div>
                        <div className="placeholder-sub">PNG, JPG, GIF up to 3MB</div>
                      </div>
                    </div>
                    <div className="logo-spec-tag">
                      <i className="fas fa-ruler-combined" style={{ fontSize: "11px" }} />
                      Recommended: 400 × 250 px
                    </div>
                    <div className="dimension-warning-text" id="warning-spec-text">
                      <i className="fas fa-exclamation-triangle" />
                      Image should be 400×250 px for best results
                    </div>
                    <div className="logo-action-row">
                      <button
                        className="action-button-base btn-action-primary"
                        id="dynamic-action-btn"
                      >
                        <i className="fas fa-trash-alt" style={{ fontSize: "12px" }} />
                        Remove Logo
                      </button>
                      <button
                        className="action-button-base"
                        id="btn-upload-new"
                        style={{ background: "#f1f5f9", color: "#475569", border: "none" }}
                      >
                        <i className="fas fa-upload" style={{ fontSize: "12px" }} />
                        Upload New
                      </button>
                    </div>
                    <div className="inline-upload-panel" id="inline-upload-panel">
                      <div className="popup-header-row">
                        <div className="popup-title-text">Add New Restaurant Logo</div>
                        <button className="popup-close-icon-btn" id="btn-popup-close">
                          ×
                        </button>
                      </div>
                      <div className="popup-alert-message-box">
                        Only .gif, .png, .jpeg, .jpg — max 3MB
                      </div>
                      <div className="popup-center-action-row">
                        <button
                          className="btn-click-to-upload"
                          id="btn-trigger-file-explorer"
                        >
                          CLICK TO UPLOAD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Section */}
              <div className="save-section">
                <div className="save-hint">
                  <i
                    className="fas fa-info-circle"
                    style={{ color: "#b0c4d8", fontSize: "14px" }}
                  />
                  Click Save Changes to update the restaurant logo
                </div>
                <button
                  className="action-button-base btn-action-primary"
                  style={{ padding: "12px 32px", fontSize: "14px" }}
                  onClick={async () => {
                    if (pendingActionRef.current === null) {
                      Swal.fire({ icon: "info", title: "No Changes", text: "You haven't made any changes to the logo.", confirmButtonColor: "#00a896" });
                      return;
                    }
                    try {
                      const sessionShopId = sessionStorage.getItem("shop_id");
                      if (!sessionShopId) return;

                      const response = await restaurantService.updateShopLogo({
                        shop_id: String(sessionShopId),
                        new_logo: pendingActionRef.current,
                        old_logo_name: logoRef.current,
                      });

                      if (response.success) {
                        const wasRemove = pendingActionRef.current === "";
                        pendingActionRef.current = null;
                        
                        const info = await restaurantService.getRestaurantInformation(Number(sessionShopId));
                        if (info?.shoplogo) {
                          setLogo(info.shoplogo);
                          logoRef.current = info.shoplogo;
                        } else if (wasRemove) {
                          setLogo("");
                          logoRef.current = "";
                        }
                        
                        Swal.fire({
                          icon: "success",
                          title: "Saved Successfully!",
                          text: "Your restaurant logo has been saved and is now live.",
                          confirmButtonColor: "#00a896",
                        });
                      } else {
                        Swal.fire({ icon: "error", title: "Error", text: response.message || "Failed to save logo.", confirmButtonColor: "#00a896" });
                      }
                    } catch (err) {
                      console.error(err);
                      Swal.fire({ icon: "error", title: "Error", text: "Failed to save logo.", confirmButtonColor: "#00a896" });
                    }
                  }}
                >
                  <i className="fas fa-save" style={{ fontSize: "13px" }} />
                  Save Changes
                </button>
              </div>
            </div>

            <WizardFooter />
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      <div className="modal-overlay" id="global-modal-overlay">
        <div className="modal-box" id="popup-confirm-delete" style={{ display: "none" }}>
          <div className="modal-icon-circle">
            <div className="modal-icon-inner" />
          </div>
          <div className="modal-text">
            Are you sure that you want to delete this Image?
          </div>
          <div className="modal-buttons-group">
            <button className="btn-modal btn-modal-cancel" id="btn-modal-cancel">
              Cancel
            </button>
            <button className="btn-modal btn-modal-yes" id="btn-modal-yes">
              Yes
            </button>
          </div>
        </div>
        <div className="crop-popup-card" id="popup-crop-panel" style={{ display: "none" }}>
          <div className="crop-title">Upload &amp; Crop Image</div>
          <div className="crop-workspace-split">
            <div className="crop-canvas-viewport">
              <img id="crop-image-render-node" alt="Source Image Preview" />
            </div>
            <div className="crop-controls-sidebar">
              <div className="crop-zoom-slider-container">
                <input
                  type="range"
                  className="crop-zoom-slider-input"
                  id="crop-zoom-slider"
                  min="0"
                  max="3"
                  step="0.01"
                  defaultValue="1"
                />
              </div>
              <div className="crop-action-buttons-group">
                <button className="btn-crop-submit" id="btn-crop-and-upload">
                  CROP &amp; UPLOAD IMAGE
                </button>
                <button className="btn-crop-close" id="btn-crop-cancel">
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
