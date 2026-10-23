"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { restaurantService, setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { toast } from "@/components/shared/Toast";
import Swal from "sweetalert2";
import "./page.css";

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
  const [logo, setLogo] = useState<string>("");
  const logoRef = useRef<string>("");
  const [websiteName, setWebsiteName] = useState<string>("");
  const infoRef = useRef<any>(null);
  const [, setLoading] = useState<boolean>(true);

  // Modals & Cropper state
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [zoomMin, setZoomMin] = useState<number>(0.5);
  const [isSavingLogo, setIsSavingLogo] = useState<boolean>(false);
  const [isSavingWebsite, setIsSavingWebsite] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropperInstanceRef = useRef<CropperInstance | null>(null);

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
          console.error("Shop ID not found in session.");
          return;
        }

        const info = await restaurantService.getRestaurantInformation(
          Number(sessionShopId),
        );
        if (info) {
          infoRef.current = info;
          setWebsiteName(info.domain_name || info.subdomain || "");
          if (info.shoplogo) {
            setLogo(info.shoplogo);
            logoRef.current = info.shoplogo;
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  // Initialize Cropper when crop modal opens and image is loaded
  useEffect(() => {
    if (isCropOpen && selectedImageSrc && cropImageRef.current && window.Cropper) {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
      }

      cropperInstanceRef.current = new window.Cropper(cropImageRef.current, {
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
        ready() {
          if (cropperInstanceRef.current) {
            const minScale =
              cropperInstanceRef.current.getData().scaleX ?? 0.5;
            setZoomMin(minScale);
            setZoomValue(1);
          }
        },
      });
    }

    return () => {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
    };
  }, [isCropOpen, selectedImageSrc]);

  const handleTriggerFileExplorer = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImageSrc(String(event.target?.result ?? ""));
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setZoomValue(val);
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.zoomTo(val);
    }
  };

  const handleCloseCrop = () => {
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
      cropperInstanceRef.current = null;
    }
    setIsCropOpen(false);
    setSelectedImageSrc("");
  };

  // Direct Crop & Upload — immediately uploads to live API without any secondary save button
  const handleCropAndUpload = async () => {
    if (!cropperInstanceRef.current) return;

    try {
      setIsSavingLogo(true);
      const croppedCanvas = cropperInstanceRef.current.getCroppedCanvas({
        width: 400,
        height: 250,
      });

      const base64 = croppedCanvas
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, "");

      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) {
        toast.error("Shop ID not found in session.");
        return;
      }

      const response = await restaurantService.updateShopLogo({
        shop_id: String(sessionShopId),
        new_logo: base64,
        old_logo_name: logoRef.current,
      });

      if (response?.success || response?.status === 200 || !response?.error) {
        const info = await restaurantService.getRestaurantInformation(
          Number(sessionShopId),
        );
        if (info?.shoplogo) {
          setLogo(info.shoplogo);
          logoRef.current = info.shoplogo;
        } else {
          setLogo(`data:image/png;base64,${base64}`);
        }

        handleCloseCrop();
        toast.success("Logo Saved", "Restaurant logo saved successfully.");
      } else {
        toast.error("Save Failed", response?.message || "Failed to save logo.");
      }
    } catch (err: any) {
      console.error("Direct upload failed:", err);
      toast.error("Save Failed", err?.response?.data?.message || "Failed to update restaurant logo.");
    } finally {
      setIsSavingLogo(false);
    }
  };

  // Direct Delete — immediately deletes logo via API upon confirmation
  const handleConfirmDelete = async () => {
    try {
      setIsSavingLogo(true);
      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) return;

      await restaurantService.updateShopLogo({
        shop_id: String(sessionShopId),
        new_logo: "",
        old_logo_name: logoRef.current,
      });

      setLogo("");
      logoRef.current = "";
      setIsDeleteOpen(false);

      toast.success("Logo Deleted", "The restaurant logo has been deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete logo:", err);
      toast.error("Delete Failed", "Failed to delete restaurant logo.");
    } finally {
      setIsSavingLogo(false);
    }
  };

  // Website Name Save
  const handleSaveWebsiteName = async () => {
    try {
      setIsSavingWebsite(true);
      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) return;

      await setupService.updateShopProfile({
        shop_id: String(sessionShopId),
        shop_name: infoRef.current?.shop_name || "",
        email_id: infoRef.current?.email_id || "",
        mobileno: infoRef.current?.mobileno || "",
        CountryCode: infoRef.current?.CountryCode || "",
        timezone: infoRef.current?.timezone || "",
        subdomain: websiteName.trim(),
        shoplogo: logoRef.current || "",
        business_type_id: infoRef.current?.business_type_id || 0,
        cuisine_type: infoRef.current?.cuisine_type || "",
        shop_type: infoRef.current?.shop_type || "",
        insta_url: infoRef.current?.insta_url || "",
      });

      sessionStorage.setItem("subdomain", websiteName.trim());
      sessionStorage.setItem("subdomain_for", String(sessionShopId));

      toast.success("Website Updated", "Website name has been updated successfully.");
    } catch (err: any) {
      console.error("Failed to save website name:", err);
      toast.error("Update Failed", err?.response?.data?.message || "Failed to update website name.");
    } finally {
      setIsSavingWebsite(false);
    }
  };

  const handleHelpClick = () => {
    Swal.fire({
      title: "How to set up Restaurant Logo",
      html: `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
          <iframe 
            src="https://player.vimeo.com/video/1075943601?autoplay=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
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
  };

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

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".gif,.png,.jpeg,.jpg"
        style={{ display: "none" }}
      />

      <div className="app-layout-container">
        <main className="main-workspace-content">
          <div className="page-wrapper">
            <div className="dashboard-card">
              {/* Header Bar */}
              <div className="card-header-bar">
                <h1 className="header-page-title">Restaurant Logo</h1>

                <div className="header-actions-group">
                  <button
                    type="button"
                    className="btn-help"
                    onClick={handleHelpClick}
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

                  {!logo && (
                    <button
                      type="button"
                      className="btn-live-action"
                      onClick={handleTriggerFileExplorer}
                    >
                      <i className="fas fa-plus" />
                      <span>ADD NEW RESTAURANT LOGO</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Body */}
              <div className="logo-card-body">
                {/* Logo Display Box */}
                <div
                  className="logo-preview-box"
                  onClick={!logo ? handleTriggerFileExplorer : undefined}
                >
                  {logo ? (
                    <>
                      <img
                        src={logoUrl}
                        alt="Restaurant Logo"
                        className="preview-logo-img"
                      />
                      <button
                        type="button"
                        className="btn-delete-logo-badge"
                        title="Delete Logo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteOpen(true);
                        }}
                      >
                        <i className="fas fa-times" />
                      </button>
                    </>
                  ) : (
                    <div className="placeholder-add-logo">
                      <span>Add</span>
                      <span>Logo</span>
                    </div>
                  )}
                </div>

                {/* Sub-logo section: Remove Logo button when logo exists, or dimension text when empty */}
                {logo ? (
                  <button
                    type="button"
                    className="btn-remove-logo"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Remove Logo
                  </button>
                ) : (
                  <div className="dimension-notice-red">
                    **Images should be 400x250**
                  </div>
                )}

                {/* Website Name Field */}
                <div className="website-name-form-group">
                  <label className="website-name-label">Website Name</label>
                  <input
                    type="text"
                    className="website-name-input"
                    value={websiteName}
                    placeholder="www.cospace.com"
                    onChange={(e) => setWebsiteName(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn-save-website"
                    disabled={isSavingWebsite}
                    onClick={handleSaveWebsiteName}
                  >
                    {isSavingWebsite ? "SAVING..." : "SAVE"}
                  </button>
                </div>
              </div>
            </div>

            {/* Step Wizard Footer */}
            <WizardFooter />
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <div className="modal-icon-circle">
              <div className="modal-icon-inner" />
            </div>
            <div className="modal-text">
              Are you sure that you want to delete this Image?
            </div>
            <div className="modal-buttons-group">
              <button
                type="button"
                className="btn-modal btn-modal-cancel"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSavingLogo}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-yes"
                onClick={handleConfirmDelete}
                disabled={isSavingLogo}
              >
                {isSavingLogo ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop & Direct Upload Modal */}
      {isCropOpen && (
        <div className="modal-overlay active">
          <div className="crop-popup-card">
            <div className="crop-title">Upload &amp; Crop Image</div>
            <div className="crop-workspace-split">
              <div className="crop-canvas-viewport">
                <img
                  ref={cropImageRef}
                  src={selectedImageSrc}
                  alt="Source Image Preview"
                />
              </div>

              <div className="crop-controls-sidebar">
                <div className="crop-zoom-slider-container">
                  <input
                    type="range"
                    className="crop-zoom-slider-input"
                    min={zoomMin}
                    max={3}
                    step={0.01}
                    value={zoomValue}
                    onChange={handleZoom}
                  />
                </div>

                <div className="crop-action-buttons-group">
                  <button
                    type="button"
                    className="btn-crop-submit"
                    disabled={isSavingLogo}
                    onClick={handleCropAndUpload}
                  >
                    {isSavingLogo ? "UPLOADING..." : "CROP & UPLOAD IMAGE"}
                  </button>
                  <button
                    type="button"
                    className="btn-crop-close"
                    disabled={isSavingLogo}
                    onClick={handleCloseCrop}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
