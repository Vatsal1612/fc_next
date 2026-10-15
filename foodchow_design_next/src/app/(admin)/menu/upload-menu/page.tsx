"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { menuService } from "@/api/services/menu.service";
import { getShopId } from "@/utils/shop";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

export default function UploadMenuPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"choose" | "upload">("choose");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = async () => {
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = "/SampleMenu.xlsx";
      link.setAttribute("download", "SampleMenu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download sample:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to download sample file. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an Excel (.xls / .xlsx) file to upload.",
      });
      return;
    }
    const shopId = getShopId();
    if (!shopId) {
      Swal.fire({
        icon: "error",
        title: "Shop Not Found",
        text: "Shop ID not found. Please log in again.",
      });
      return;
    }
    setUploading(true);
    try {
      await menuService.uploadMenuExcel(String(shopId), selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Menu uploaded successfully! Redirecting to items...",
        timer: 2000,
        showConfirmButton: true,
      });
      router.push("/menu/items");
    } catch (err: any) {
      console.error("Failed to upload menu:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.message || "Failed to upload menu. Please verify file format and try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="pg-menu-upload-menu">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="layout">
        <div className="main">
          <div className="content-area">
            {/* SCREEN 1: Choose method */}
            {screen === "choose" && (
              <div id="screen-choose">
                <div className="card">
                  <div className="card-actions">
                    <button className="btn-help-new">
                      <i className="far fa-question-circle"></i> HELP
                    </button>
                  </div>
                  <h1 className="card-title typ-page-heading" style={{ margin: 0 }}>Upload Excel</h1>
                  <div className="card-sub">
                    Do you want to upload your menu with an excel sheet or enter it
                    manually item wise?
                  </div>
                  <div className="actions-row">
                    <button className="btn btn-primary" onClick={() => setScreen("upload")}>
                      WITH EXCEL
                    </button>
                    <button className="btn btn-secondary">MANUALLY</button>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Upload Menus */}
            {screen === "upload" && (
              <div id="screen-upload" className="card">
                <div className="card-actions">
                  <button className="btn-help-new">
                    <i className="far fa-question-circle"></i> HELP
                  </button>
                </div>
                <h1 className="card-title typ-page-heading" style={{ margin: 0, marginBottom: "20px" }}>
                  Upload Menus
                </h1>
                <div className="step-badge">Step 1:</div>
                <div className="info-box">
                  <p>
                    Ensure that your file is formatted properly.
                    <br />
                    Please review the sample file to be sure that your file is
                    formatted properly.
                  </p>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleDownloadSample}
                    disabled={downloading}
                  >
                    {downloading ? "DOWNLOADING..." : "DOWNLOAD SAMPLE"}
                  </button>
                </div>
                <div className="step-badge">Step 2:</div>
                <div className="upload-box">
                  <div className="upload-label">
                    Select &amp; Upload Excel sheet<span>*</span>
                  </div>
                  <div className="file-row">
                    <label className="file-choose" htmlFor="excelFile">
                      Choose File
                    </label>
                    <span className="file-name">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                    <input
                      type="file"
                      id="excelFile"
                      accept=".xls,.xlsx"
                      ref={fileInputRef}
                      onChange={(e) => {
                        setSelectedFile(e.target.files?.[0] || null);
                      }}
                    />
                  </div>
                </div>
                <div className="note-text">
                  Note:-** Import .xls or .xlsx file only.
                  <br />
                  ** Item Price must be greater than zero.
                </div>
                <div className="actions-row">
                  <button
                    className="btn btn-primary"
                    onClick={handleUploadAndSave}
                    disabled={uploading}
                  >
                    {uploading ? "UPLOADING..." : "UPLOAD & SAVE"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setScreen("choose")}>
                    ← Back
                  </button>
                </div>
              </div>
            )}

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
