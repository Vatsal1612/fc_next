"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { setupService } from "@/api/services/setup.service";
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

/**
 * Restaurant Image (ShopOverview) setup page.
 * Matches live admin.foodchow.com/{subdomain}/ShopOverview
 */
export default function RestaurantImgaePage() {
  const [image, setImage] = useState<string>("");
  const imageRef = useRef<string>("");
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [zoomMin, setZoomMin] = useState<number>(0.5);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropperInstanceRef = useRef<CropperInstance | null>(null);

  const fetchRestaurantImage = async () => {
    try {
      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) return;

      const res = await setupService.getShopOverview(Number(sessionShopId));
      const responseData = res?.result || res?.data;
      if (responseData) {
        const parsedData =
          typeof responseData === "string"
            ? JSON.parse(responseData)
            : responseData;
        const imageObj = Array.isArray(parsedData)
          ? parsedData[0]
          : parsedData;
        const imageName = imageObj?.Image || imageObj?.image;

        if (imageName) {
          setImage(imageName);
          imageRef.current = imageName;
        } else {
          setImage("");
          imageRef.current = "";
        }
      }
    } catch (err) {
      console.error("Failed to load restaurant image:", err);
    }
  };

  useEffect(() => {
    fetchRestaurantImage();
  }, []);

  // Initialize Cropper when crop modal opens and image is loaded
  useEffect(() => {
    if (isCropOpen && selectedImageSrc && cropImageRef.current && window.Cropper) {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
      }

      // Live FoodChow ShopOverview Croppie viewport is 600x400 (aspect ratio 3:2 = 1.5)
      cropperInstanceRef.current = new window.Cropper(cropImageRef.current, {
        aspectRatio: 600 / 400,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
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
      if (file.size > 1 * 1024 * 1024) {
        toast.warning("You can select only files up to 1MB file size..!!!");
        e.target.value = "";
        return;
      }

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

  const handleCropAndUpload = async () => {
    if (!cropperInstanceRef.current) return;

    try {
      setIsUploading(true);
      const croppedCanvas = cropperInstanceRef.current.getCroppedCanvas({
        width: 600,
        height: 400,
      });

      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) {
        toast.error("Shop ID not found in session.");
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        croppedCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("Could not process cropped image.");

      await setupService.saveShopOverviewImage(
        Number(sessionShopId),
        blob,
        "restaurant_image.jpg"
      );

      await fetchRestaurantImage();
      handleCloseCrop();

      toast.success("Image Uploaded", "Restaurant image added successfully.");
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      toast.error("Upload Failed", err?.response?.data?.message || "Failed to upload restaurant image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsUploading(true);
      const sessionShopId = sessionStorage.getItem("shop_id");
      if (!sessionShopId) return;

      await setupService.deleteShopOverviewImage(Number(sessionShopId));

      setImage("");
      imageRef.current = "";
      setIsDeleteOpen(false);

      toast.success("Image Deleted", "Your restaurant image has been deleted successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err: any) {
      console.error("Failed to delete restaurant image:", err);
      toast.error("Delete Failed", "Failed to delete restaurant image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleHelpClick = () => {
    Swal.fire({
      title: "How to set up Restaurant Images",
      html: `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
          <iframe 
            src="https://player.vimeo.com/video/1075943559?autoplay=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #475569;">
          Follow these steps to upload and adjust your restaurant images.
        </p>
      `,
      width: 700,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  const sessionShopId =
    typeof window !== "undefined" ? sessionStorage.getItem("shop_id") : "";
  const imageUrl = image
    ? image.startsWith("data:image") || image.startsWith("http")
      ? image
      : sessionShopId
        ? `https://admin.foodchow.com/ShopDescriptionImage/${sessionShopId}/${image}`
        : ""
    : "";

  return (
    <div id="pg-setup-restaurantimgae">
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

      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="content-card">
              <div className="report-header">
                <h1 className="report-title">Restaurant Image</h1>
                <div className="report-header-actions">
                  <button
                    type="button"
                    className="btn-help"
                    onClick={handleHelpClick}
                  >
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Help
                  </button>
                </div>
              </div>

              <div className="image-upload-wrapper">
                {/* Image Display Box */}
                <div
                  className={`overview-image-box ${!imageUrl ? "placeholder-mode" : ""}`}
                  onClick={!imageUrl ? handleTriggerFileExplorer : undefined}
                >
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Restaurant Image"
                        className="preview-restaurant-img"
                      />
                      <button
                        type="button"
                        className="btn-delete-cross-badge"
                        title="Delete Image"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteOpen(true);
                        }}
                      >
                        <i className="fas fa-times" />
                      </button>
                    </>
                  ) : (
                    <div className="placeholder-content">
                      <img
                        src="/images/no-food-image.png"
                        alt="No Image"
                        className="preview-placeholder-img"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-group">
                  {imageUrl ? (
                    <>
                      <button
                        type="button"
                        className="btn-choose-image"
                        onClick={handleTriggerFileExplorer}
                      >
                        CHANGE IMAGE
                      </button>
                      <button
                        type="button"
                        className="btn-delete-image"
                        onClick={() => setIsDeleteOpen(true)}
                      >
                        DELETE IMAGE
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-choose-image"
                      onClick={handleTriggerFileExplorer}
                    >
                      CHOOSE IMAGE
                    </button>
                  )}
                </div>

                {/* Helper text */}
                <div className="helper-text-container">
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

      {/* Delete Confirmation Modal (matches original FoodChow ShopOverview) */}
      {isDeleteOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <div className="modal-title">
              Are you sure that you want to delete this Image?
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal btn-modal-cancel"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-confirm"
                onClick={handleConfirmDelete}
                disabled={isUploading}
              >
                {isUploading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Crop Image Modal (matches original FoodChow ShopOverview #uploadimagemodel) */}
      {isCropOpen && (
        <div className="modal-overlay active">
          <div className="crop-popup-card">
            <div className="crop-title">Upload &amp; Crop Image</div>
            <div className="crop-workspace-split">
              <div className="crop-canvas-viewport">
                <img
                  ref={cropImageRef}
                  src={selectedImageSrc}
                  alt="Crop preview"
                />
              </div>

              <div className="crop-controls-sidebar">
                <div className="crop-zoom-slider-container">
                  <label className="crop-zoom-label">Zoom</label>
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
                    disabled={isUploading}
                    onClick={handleCropAndUpload}
                  >
                    {isUploading ? "UPLOADING..." : "CROP & UPLOAD IMAGE"}
                  </button>
                  <button
                    type="button"
                    className="btn-crop-close"
                    disabled={isUploading}
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
