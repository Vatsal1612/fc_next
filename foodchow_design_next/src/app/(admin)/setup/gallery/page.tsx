"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { toast } from "@/components/shared/Toast";
import { getShopId } from "@/utils/shop";
import Swal from "sweetalert2";
import "./page.css";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [zoomValue, setZoomValue] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropperInstanceRef = useRef<any>(null);

  const shopId = typeof window !== "undefined" ? getShopId() : null;

  // 1. Load gallery images from live API
  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const currentShopId = getShopId();
      if (!currentShopId) {
        setLoading(false);
        return;
      }

      const response = await setupService.getGalleryImages(Number(currentShopId));
      const rawData = response?.data;
      let galleryImages: any[] = [];
      if (typeof rawData === "string" && rawData.trim()) {
        try {
          galleryImages = JSON.parse(rawData);
        } catch {
          galleryImages = [];
        }
      } else if (Array.isArray(rawData)) {
        galleryImages = rawData;
      }

      setImages(Array.isArray(galleryImages) ? galleryImages : []);
    } catch (error) {
      console.error("Error loading gallery images:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  // 2. Initialize Cropper when modal opens (600x400 aspect ratio matching live)
  useEffect(() => {
    const cropperClass = typeof window !== "undefined" ? (window as any).Cropper : null;
    if (isCropModalOpen && selectedImageSrc && cropImageRef.current && cropperClass) {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
      }

      cropperInstanceRef.current = new cropperClass(cropImageRef.current, {
        aspectRatio: 600 / 400, // 3:2 matching live Croppie viewport
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 0.95,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
          setZoomValue(1);
        },
      });
    }

    return () => {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
    };
  }, [isCropModalOpen, selectedImageSrc]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({
        title: "File Too Large",
        text: "Please select an image file under 3MB.",
        icon: "warning",
        confirmButtonColor: "#0aa89e",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Zoom change
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoomValue(newZoom);
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.zoomTo(newZoom);
    }
  };

  // 3. Crop & Upload Image (matches live workflow)
  const handleCropAndUpload = async () => {
    if (!cropperInstanceRef.current) return;

    try {
      setIsUploading(true);
      const currentShopId = getShopId();
      if (!currentShopId) {
        toast.error("Shop ID not found in session.");
        return;
      }

      const croppedCanvas = cropperInstanceRef.current.getCroppedCanvas({
        width: 600,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const base64Data = croppedCanvas
        .toDataURL("image/jpeg", 0.92)
        .replace(/^data:image\/[a-z]+;base64,/, "");

      const payload = {
        shop_id: currentShopId,
        device_type: "1",
        imageflag: "2", // 2 = Gallery slider image
        user_type: "1", // 1 = Restaurant Admin
        photo_count: "1",
        photo_0: base64Data,
        user_type_id: currentShopId,
        caption: `gallery_${Date.now()}.jpg`,
      };

      const res = await setupService.uploadGalleryImage(payload);
      if (res && res.response_code === 0) {
        throw new Error(res.message || "Failed to upload image");
      }

      await loadGalleryImages();
      toast.success("Success", "Gallery Images have been uploaded successfully...!!!");
      setIsCropModalOpen(false);
      setShowAddPanel(false);
    } catch (err: any) {
      console.error("Gallery upload error:", err);
      toast.error("Upload Failed", err?.message || "Failed to upload gallery image.");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Delete Single Image with SweetAlert (matches live)
  const handleDeleteImage = async (galleryId: number) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this gallery Image?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      cancelButtonColor: "#8e9ba8",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await setupService.deleteGalleryPhoto(galleryId);
        toast.success("Deleted", "Your Gallery Image has been deleted Successfully...!!!");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } catch (err: any) {
        console.error("Failed to delete gallery image:", err);
        toast.error("Delete Failed", "Failed to delete gallery image.");
      }
    }
  };


  // Video Help modal (matches live Vimeo link)
  const handleHelpClick = () => {
    Swal.fire({
      title: "How to set up Photo Gallery",
      html: `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
          <iframe 
            src="https://player.vimeo.com/video/1075943416?autoplay=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #475569;">
          Follow these steps to upload and organize photo gallery slider images for your restaurant.
        </p>
      `,
      width: 700,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  return (
    <div id="pg-setup-gallery">
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

      <div className="app-container">
        <div className="main">
          <div className="page-content">

            {/* ═══ VIEW 1: GALLERY LIST (DEFAULT) ═══ */}
            {!showAddPanel && (
              <div className="page-card" id="galleryCard">
                <div className="card-head">
                  <header>Photo Gallery</header>
                  <div className="tools">
                    <button
                      type="button"
                      className="btn btn-default-light add-new-facility btnaddgallery"
                      onClick={() => setShowAddPanel(true)}
                    >
                      <i className="fa fa-plus"></i> <b>Add New Image</b>
                    </button>

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

                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="loading-state">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Loading gallery images...</span>
                    </div>
                  ) : images.length > 0 ? (
                    <div className="gallery-grid">
                      {images.map((item: any) => {
                        const imgId = item.gallery_id || item.galleryid;
                        const imgName = item.gallery_image || item.gallery_Image;
                        const imgSrc = `https://admin.foodchow.com/GalleryImages/${shopId}/${imgName}`;

                        return (
                          <div className="gallery-item-card" key={imgId}>
                            <div
                              className="gallery-item-img"
                              style={{ backgroundImage: `url(${imgSrc})` }}
                            >
                              <img
                                src={imgSrc}
                                alt="Gallery photo"
                                style={{ display: "none" }}
                                onError={(e) => {
                                  const parent = (e.currentTarget.parentElement) as HTMLElement;
                                  if (parent) {
                                    parent.style.backgroundImage = "none";
                                    parent.style.backgroundColor = "#e2e8f0";
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btndelete img-cross"
                              title="Delete Image"
                              onClick={() => handleDeleteImage(Number(imgId))}
                            >
                              <i className="fa fa-times-circle" aria-hidden="true"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-gallery-state">
                      <div className="empty-icon-wrap">
                        <i className="fa-regular fa-images"></i>
                      </div>
                      <h3>No Gallery Photo</h3>
                      <p>Start adding photos to showcase your restaurant dishes and ambiance.</p>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ VIEW 2: ADD PHOTO GALLERY PANEL ═══ */}
            {showAddPanel && (
              <div className="page-card" id="addPanel">
                <div className="card-head">
                  <header>Add Photo Gallery</header>
                  <div className="tools">
                    <button
                      type="button"
                      className="btn-close-panel"
                      onClick={() => setShowAddPanel(false)}
                      title="Close"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div
                    className="upload-area"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon-box">
                      <i className="fa fa-cloud-arrow-up" aria-hidden="true"></i>
                    </div>
                    <label className="drop-img-btn" onClick={(e) => e.stopPropagation()}>
                      Click To Upload
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="Upload_Image"
                        id="Upload_Image"
                        className="drop-img-input"
                        accept=".png,.jpg,.jpeg,.gif,.PNG,.JPG,.JPEG,.GIF"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <div className="upload-notice-box">
                    <p className="notice-bold">**Images should be 600x400 for best view in web site..</p>
                    <p className="notice-light">Can Select Only .png, .jpg, .jpeg, .gif, .PNG, .JPG, .JPEG, .GIF (Max: 3MB)</p>
                  </div>
                </div>
              </div>
            )}

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* ═══ LIVE-STYLE CROP MODAL (600x400 Viewport) ═══ */}
      {isCropModalOpen && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-box">
            <div className="crop-modal-header">
              <h3 className="modal-title">Upload &amp; Crop Image</h3>
              <button
                type="button"
                className="crop-modal-close"
                onClick={() => !isUploading && setIsCropModalOpen(false)}
                disabled={isUploading}
              >
                &times;
              </button>
            </div>

            <div className="crop-modal-body">
              <div className="crop-container-wrapper">
                <div className="crop-image-area">
                  <img
                    ref={cropImageRef}
                    src={selectedImageSrc}
                    alt="To Crop"
                    style={{ maxWidth: "100%", maxHeight: "420px", display: "block" }}
                  />
                </div>

                <div className="crop-zoom-bar">
                  <i className="fa-solid fa-magnifying-glass-minus"></i>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.05"
                    value={zoomValue}
                    onChange={handleZoomChange}
                    className="zoom-slider"
                  />
                  <i className="fa-solid fa-magnifying-glass-plus"></i>
                </div>
              </div>

              <div className="crop-actions-sidebar">
                <div className="crop-info-card">
                  <h4>Crop Guidelines</h4>
                  <p>Ratio: <strong>600 × 400</strong> (3:2)</p>
                  <p>Move or drag the crop box to center your photo cleanly.</p>
                </div>

                <button
                  type="button"
                  className="btn-crop-upload"
                  id="text-change"
                  onClick={handleCropAndUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Image Uploading.....</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-crop-simple"></i>
                      <span>Crop &amp; Upload Image</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-crop-cancel"
                  onClick={() => setIsCropModalOpen(false)}
                  disabled={isUploading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
