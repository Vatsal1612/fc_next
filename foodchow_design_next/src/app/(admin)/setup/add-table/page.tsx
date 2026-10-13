"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { orderService } from "@/api/services/order.service";
import "./page.css";

/**
 * setup/add-table page matching live admin:
 * 1. Initial screen asks:
 *    - "Table Reservation"
 *    - "Do you provide table reservation ?"
 *    - [ YES ]   [ NO ]
 *    - When YES is selected -> displays [ SETUP ]
 *    - When NO is selected  -> displays [ PROCEED ]
 * 2. Once SETUP or PROCEED is clicked:
 *    - Persists completion state (fc_table_reservation_asked_${shopId})
 *    - Won't be visible again on subsequent visits.
 *    - Displays the POS App download screen: "Download Our POS App to Manage Tables"
 */
export default function AddTablePage() {
  const [shopId, setShopId] = useState<number>(0);
  const [isAsked, setIsAsked] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<"yes" | "no" | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClientLoaded, setIsClientLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsClientLoaded(true);
    const rawId = sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id") || "0";
    const parsedShopId = Number(rawId) || 0;
    setShopId(parsedShopId);

    const storageKey = `fc_table_reservation_asked_${parsedShopId}`;
    const alreadyAsked = localStorage.getItem(storageKey);

    // Support ?ask=1 or ?resetAsk=1 to re-trigger for testing if needed
    const params = new URLSearchParams(window.location.search);
    const forceAsk = params.get("ask") === "1" || params.get("resetAsk") === "1";

    if (forceAsk) {
      localStorage.removeItem(storageKey);
      setIsAsked(false);
    } else {
      setIsAsked(alreadyAsked === "true");
    }
  }, []);

  const handleActionClick = async () => {
    if (!selectedChoice) return;
    setIsSaving(true);
    const isYes = selectedChoice === "yes";
    try {
      if (shopId > 0) {
        // Flag 3 updates table_reservation_status in widget settings
        await orderService.updateWidgetSettings(shopId, isYes ? 1 : 0, 3);
      }
    } catch (err) {
      console.warn("Could not sync widget setting to API, persisting locally:", err);
    } finally {
      const storageKey = `fc_table_reservation_asked_${shopId}`;
      localStorage.setItem(storageKey, "true");
      setIsAsked(true);
      setIsSaving(false);
    }
  };

  const handleResetAsk = () => {
    const storageKey = `fc_table_reservation_asked_${shopId}`;
    localStorage.removeItem(storageKey);
    setSelectedChoice(null);
    setIsAsked(false);
  };

  const toggleChoice = (choice: "yes" | "no") => {
    setSelectedChoice((prev) => (prev === choice ? null : choice));
  };

  if (!isClientLoaded) {
    return null;
  }

  return (
    <div id="pg-setup-add-table">
      <div className="app-container">
        <div className="main">
          <div className="page-content">
            {!isAsked ? (
              /* ── SCREEN 1: Live Ask/tableReservation Screen (Matches live admin 1:1) ── */
              <div className="page-card ask-table-card">
                <h2 className="typ-page-heading ask-table-title">Table Reservation</h2>
                <div className="ask-table-question">
                  Do you provide table reservation ?
                </div>

                <div className="ask-choice-buttons">
                  <button
                    type="button"
                    className={`btn-choice-yes ${selectedChoice === "yes" ? "active" : "inactive"}`}
                    onClick={() => toggleChoice("yes")}
                  >
                    YES
                  </button>

                  <button
                    type="button"
                    className={`btn-choice-no ${selectedChoice === "no" ? "active" : "inactive"}`}
                    onClick={() => toggleChoice("no")}
                  >
                    NO
                  </button>
                </div>

                {selectedChoice !== null && (
                  <div className="ask-action-row">
                    {selectedChoice === "yes" ? (
                      <button
                        type="button"
                        className="btn-ask-submit"
                        disabled={isSaving}
                        onClick={handleActionClick}
                      >
                        {isSaving ? "SAVING..." : "SETUP"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-ask-submit"
                        disabled={isSaving}
                        onClick={handleActionClick}
                      >
                        {isSaving ? "SAVING..." : "PROCEED"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── SCREEN 2: Add Table POS Download Screen (Default once completed) ── */
              <div className="page-card pos-manage-card">
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
                    <a
                      href="https://play.google.com/store/apps/details?id=com.tenacioustechies.foodchow.pos&hl=en_IN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn"
                    >
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

                    <a
                      href="https://apps.apple.com/us/app/foodchow-restaurant-pos/id6465174327"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn"
                    >
                      <i className="fab fa-apple" />
                      <div className="btn-text">
                        <span className="btn-small">Download on the</span>
                        <span className="btn-large">App Store</span>
                      </div>
                    </a>

                    <a
                      href="https://www.foodchow.com/windows-pos/foodchow-pos.exe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="windows-btn"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                    >
                      Windows
                    </a>
                  </div>

                  <div className="preference-reset-wrap">
                    <span>Table reservation preference configured.</span>
                    <button type="button" className="btn-reconfigure" onClick={handleResetAsk}>
                      <i className="fa-solid fa-pen-to-square"></i> Change Preference
                    </button>
                  </div>
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
