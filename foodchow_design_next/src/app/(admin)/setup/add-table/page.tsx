"use client";

import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/add-table.html → React.
 * Static page (only script was the external sidebar-loader.js, which is dropped —
 * the shell renders the sidebar). No useEffect needed.
 */
export default function AddTablePage() {
  return (
    <div id="pg-setup-add-table">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <h1 className="typ-page-heading page-title">Download Our POS App to Manage Tables</h1>

              <div className="hero-container">
                <div className="devices-illustration">
                  <img
                    src="/images/POSdevice.png"
                    alt="POS App Devices"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>

                <div className="download-buttons">
                  <a href="#" className="store-btn">
                    <i
                      className="fab fa-google-play"
                      style={{
                        background:
                          "-webkit-linear-gradient(#4285f4, #34a853, #fbbc05, #ea4335)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    />
                    <div className="btn-text">
                      <span className="btn-small">GET IT ON</span>
                      <span className="btn-large">Google Play</span>
                    </div>
                  </a>

                  <a href="#" className="store-btn">
                    <i className="fab fa-apple" />
                    <div className="btn-text">
                      <span className="btn-small">Download on the</span>
                      <span className="btn-large">App Store</span>
                    </div>
                  </a>

                  <button className="windows-btn">Windows</button>
                </div>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
