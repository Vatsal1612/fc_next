"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * marketing/qr-binding.html → React.
 * Static markup is rendered inside #pg-marketing-qr-binding. The inline
 * openUpdateModal / closeUpdateModal / saveUpdateModal handlers are ported into
 * a useEffect and re-wired with addEventListener (the per-row UPDATE buttons
 * carry their qrId / url in data-* attributes). The sidebar-loader.js script is
 * dropped (the shell owns the sidebar).
 */
export default function QrBindingPage() {
  useEffect(() => {
    const modal = document.getElementById("updateQrModal");
    const modalQrId = document.getElementById("modalQrId") as HTMLInputElement | null;
    const modalQrUrl = document.getElementById("modalQrUrl") as HTMLInputElement | null;

    const openUpdateModal = (qrId: string, currentUrl: string): void => {
      if (modalQrId) modalQrId.value = qrId;
      if (modalQrUrl) modalQrUrl.value = currentUrl;
      modal?.classList.add("show");
    };
    const closeUpdateModal = (): void => {
      modal?.classList.remove("show");
    };
    const saveUpdateModal = (): void => {
      window.alert(`QR ID ${modalQrId?.value} successfully updated to:\n${modalQrUrl?.value}`);
      closeUpdateModal();
    };

    // Wire the per-row UPDATE buttons (replaces inline onclick="openUpdateModal(...)").
    const updateBtns = document.querySelectorAll<HTMLButtonElement>(".data-table .btn-update");
    const updateHandlers: Array<[HTMLButtonElement, () => void]> = [];
    updateBtns.forEach((btn) => {
      const fn = () => openUpdateModal(btn.dataset.qrId ?? "", btn.dataset.qrUrl ?? "");
      btn.addEventListener("click", fn);
      updateHandlers.push([btn, fn]);
    });

    const closeBtns = document.querySelectorAll<HTMLElement>(
      "#updateQrModal .modal-close, #updateQrModal .btn-cancel"
    );
    closeBtns.forEach((b) => b.addEventListener("click", closeUpdateModal));

    const saveBtn = document.querySelector<HTMLButtonElement>("#updateQrModal .modal-footer .btn-update");
    saveBtn?.addEventListener("click", saveUpdateModal);

    const onOverlayClick = (e: MouseEvent) => {
      if (e.target === modal) closeUpdateModal();
    };
    modal?.addEventListener("click", onOverlayClick);

    return () => {
      updateHandlers.forEach(([btn, fn]) => btn.removeEventListener("click", fn));
      closeBtns.forEach((b) => b.removeEventListener("click", closeUpdateModal));
      saveBtn?.removeEventListener("click", saveUpdateModal);
      modal?.removeEventListener("click", onOverlayClick);
    };
  }, []);

  return (
    <div id="pg-marketing-qr-binding">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="report-header">
                <h1 className="typ-page-heading report-title">QR Binding</h1>

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
              <div className="card-sub">
                Generate and bind dynamic QR codes to specific URLs for your marketing campaigns.
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">QR Identifier / Title</label>
                  <input type="text" className="form-input" placeholder="e.g. Table 1, Front Door, Flyer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Redirect URL</label>
                  <input type="text" className="form-input" placeholder="https://workspaceco.foodchow.com/" />
                </div>
              </div>
              <button className="btn-primary">
                <i className="fas fa-qrcode" /> GENERATE QR CODE
              </button>
            </div>

            <div className="card" style={{ paddingTop: "32px", minHeight: "300px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "24px",
                  color: "var(--text-dark)",
                  fontFamily: "var(--font)",
                }}
              >
                Dynamic QR Binding
              </h2>

              <div className="table-responsive-box">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>QR Id</th>
                      <th>QR Link</th>
                      <th>Action</th>
                      <th>Redirect</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Y4AVX0</td>
                      <td>
                        <div className="scrollable-link" title="https://workspaceco.foodchow.com/">
                          https://workspaceco.foodchow.com/
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-update"
                          data-qr-id="Y4AVX0"
                          data-qr-url="https://workspaceco.foodchow.com/"
                        >
                          <i className="far fa-edit" /> UPDATE
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-open">
                          <i className="fas fa-external-link-alt" /> OPEN
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>CWBAX39</td>
                      <td>
                        <div className="scrollable-link" title="https://www.foodchow.com/maharajarestaurar">
                          https://www.foodchow.com/maharajarestaurar
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-update"
                          data-qr-id="CWBAX39"
                          data-qr-url="https://www.foodchow.com/maharajarestaurar"
                        >
                          <i className="far fa-edit" /> UPDATE
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-open">
                          <i className="fas fa-external-link-alt" /> OPEN
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <WizardFooter />
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="updateQrModal">
        <div className="modal-container">
          <div className="modal-header">
            <div className="modal-title">Update QR URL</div>
            <button className="modal-close">×</button>
          </div>
          <div className="modal-body">
            <label className="modal-label">QR ID:</label>
            <input type="text" className="modal-input" id="modalQrId" readOnly />

            <label className="modal-label">New URL:</label>
            <input type="text" className="modal-input" id="modalQrUrl" style={{ marginBottom: 0 }} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-cancel">CANCEL</button>
            <button className="btn btn-update">UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
