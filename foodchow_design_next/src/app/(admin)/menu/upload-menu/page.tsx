"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

export default function UploadMenuPage() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    function openHelpModal() {
      alert("Help & Support");
    }

    // Close dropdowns on any window click
    const onWindowClick = () =>
      document
        .querySelectorAll<HTMLElement>(".dropdown-menu")
        .forEach((m) => m.classList.remove("show"));
    window.addEventListener("click", onWindowClick);
    cleanups.push(() => window.removeEventListener("click", onWindowClick));

    // Sidebar nav toggle (sidebar markup is supplied by the shell, so these
    // selectors may match nothing; the handlers are kept faithfully).
    const sideMenuItems =
      document.querySelectorAll<HTMLElement>(".sidebar .nav-item");
    const subGroups =
      document.querySelectorAll<HTMLElement>(".submenu-group");
    sideMenuItems.forEach((item) => {
      const handler = function (this: HTMLElement) {
        sideMenuItems.forEach((m) => m.classList.remove("active"));
        this.classList.add("active");
        subGroups.forEach((g) => g.classList.remove("active"));
        const target = this.getAttribute("data-target");
        if (target) {
          const t = document.getElementById(target);
          if (t) {
            t.classList.add("active");
            const first = t.querySelector<HTMLElement>(".submenu-item");
            if (first) {
              document
                .querySelectorAll<HTMLElement>(".submenu-item")
                .forEach((s) => s.classList.remove("active"));
              first.classList.add("active");
            }
          }
        }
      };
      item.addEventListener("click", handler);
      cleanups.push(() => item.removeEventListener("click", handler));
    });

    document
      .querySelectorAll<HTMLElement>(".submenu-item")
      .forEach((item) => {
        const handler = function (this: HTMLElement, e: MouseEvent) {
          e.preventDefault();
          document
            .querySelectorAll<HTMLElement>(".submenu-item")
            .forEach((s) => s.classList.remove("active"));
          this.classList.add("active");
        };
        item.addEventListener("click", handler);
        cleanups.push(() => item.removeEventListener("click", handler));
      });

    // Screen toggles
    function showUpload() {
      document.getElementById("screen-choose")?.classList.add("hidden");
      document.getElementById("screen-upload")?.classList.remove("hidden");
    }
    function showChoose() {
      document.getElementById("screen-upload")?.classList.add("hidden");
      document.getElementById("screen-choose")?.classList.remove("hidden");
    }
    function updateFileName(input: HTMLInputElement) {
      const fileName = document.getElementById("fileName");
      if (fileName) {
        fileName.textContent =
          input.files && input.files.length
            ? input.files[0].name
            : "No file chosen";
      }
    }

    // Wire help buttons (onclick="openHelpModal()")
    const helpBtns =
      document.querySelectorAll<HTMLButtonElement>(".btn-help-new");
    helpBtns.forEach((b) => b.addEventListener("click", openHelpModal));
    cleanups.push(() =>
      helpBtns.forEach((b) => b.removeEventListener("click", openHelpModal))
    );

    // WITH EXCEL → showUpload()
    const withExcelBtn = document.getElementById("with-excel-btn");
    const onWithExcel = () => showUpload();
    if (withExcelBtn) {
      withExcelBtn.addEventListener("click", onWithExcel);
      cleanups.push(() =>
        withExcelBtn.removeEventListener("click", onWithExcel)
      );
    }

    // ← Back → showChoose()
    const backBtn = document.getElementById("back-to-choose-btn");
    const onBack = () => showChoose();
    if (backBtn) {
      backBtn.addEventListener("click", onBack);
      cleanups.push(() => backBtn.removeEventListener("click", onBack));
    }

    // File input change → updateFileName(this)
    const excelFile = document.getElementById(
      "excelFile"
    ) as HTMLInputElement | null;
    const onFileChange = function (this: HTMLInputElement) {
      updateFileName(this);
    };
    if (excelFile) {
      excelFile.addEventListener("change", onFileChange);
      cleanups.push(() =>
        excelFile.removeEventListener("change", onFileChange)
      );
    }

    // Step nav
    let currentStep = 10;
    const totalSteps = 25;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const stepValue = document.getElementById("stepValue");

    const onPrev = () => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue)
          stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = () => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue)
          stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    if (prevBtn) {
      prevBtn.addEventListener("click", onPrev);
      cleanups.push(() => prevBtn.removeEventListener("click", onPrev));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", onNext);
      cleanups.push(() => nextBtn.removeEventListener("click", onNext));
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

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
                  <button className="btn btn-primary" id="with-excel-btn">
                    WITH EXCEL
                  </button>
                  <button className="btn btn-secondary">MANUALLY</button>
                </div>
              </div>
            </div>

            {/* SCREEN 2: Upload Menus */}
            <div id="screen-upload" className="card hidden">
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
                <button className="btn btn-primary">DOWNLOAD SAMPLE</button>
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
                  <span className="file-name" id="fileName">
                    No file chosen
                  </span>
                  <input type="file" id="excelFile" accept=".xls,.xlsx" />
                </div>
              </div>
              <div className="note-text">
                Note:-** Import .xls or .xlsx file only.
                <br />
                ** Item Price must be greater than zero.
              </div>
              <div className="actions-row">
                <button className="btn btn-primary">UPLOAD &amp; SAVE</button>
                <button className="btn btn-ghost" id="back-to-choose-btn">
                  ← Back
                </button>
              </div>
            </div>

            <WizardFooter />
          </div>
          {/* /content-area */}
        </div>
        {/* /main */}
      </div>
      {/* /layout */}
    </div>
  );
}
