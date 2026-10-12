"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { orderService } from "@/api/services/order.service";
import "./page.css";

/**
 * setup/add-table page with onboarding Table Reservation ask step.
 * Once completed by the user, it persists and will not be visible again.
 */
export default function AddTablePage() {
  const [shopId, setShopId] = useState<number>(0);
  const [isAsked, setIsAsked] = useState<boolean>(true); // default true to prevent layout shift
  const [acceptReservation, setAcceptReservation] = useState<boolean>(true);
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

  const handleSaveReservation = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      if (shopId > 0) {
        // Flag 3 updates table_reservation_status in widget settings
        await orderService.updateWidgetSettings(shopId, enabled ? 1 : 0, 3);
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
    setIsAsked(false);
  };

  if (!isClientLoaded) {
    return null;
  }

  return (
    <div id="pg-setup-add-table">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            {!isAsked ? (
              /* ── SCREEN 1: Table Reservation Ask Screen (Shown once until answered) ── */
              <div className="card table-reservation-ask-card">
                <div className="ask-header">
                  <div className="ask-pill-badge">
                    <i className="fa-solid fa-utensils"></i> TABLE RESERVATION
                  </div>
                  <h1 className="typ-page-heading ask-title">
                    Do you accept Table Reservations?
                  </h1>
                  <p className="ask-subtitle">
                    Allow your customers to reserve a table online in advance directly from your FoodChow restaurant website and ordering widget.
                  </p>
                </div>

                <div className="reservation-options-grid">
                  {/* Option 1: Yes */}
                  <div
                    className={`reservation-option-card ${acceptReservation ? "active" : ""}`}
                    onClick={() => setAcceptReservation(true)}
                  >
                    <div className="option-radio-indicator">
                      <div className="radio-inner" />
                    </div>
                    <div className="option-content">
                      <div className="option-title-row">
                        <span className="option-title">Yes, I accept Table Reservations</span>
                        <span className="option-badge-recommended">Recommended</span>
                      </div>
                      <p className="option-desc">
                        Enable online table booking on your website. Diners can select party size, date, and reservation time.
                      </p>
                      <ul className="option-features">
                        <li><i className="fa-solid fa-check"></i> Online bookings direct to POS & Admin</li>
                        <li><i className="fa-solid fa-check"></i> Real-time notifications for new bookings</li>
                        <li><i className="fa-solid fa-check"></i> Maximize dine-in seating & reduce wait times</li>
                      </ul>
                    </div>
                  </div>

                  {/* Option 2: No */}
                  <div
                    className={`reservation-option-card ${!acceptReservation ? "active" : ""}`}
                    onClick={() => setAcceptReservation(false)}
                  >
                    <div className="option-radio-indicator">
                      <div className="radio-inner" />
                    </div>
                    <div className="option-content">
                      <div className="option-title-row">
                        <span className="option-title">No, Delivery & Takeaway Only</span>
                      </div>
                      <p className="option-desc">
                        Skip table reservations for now. Diners will only be able to place takeaway and delivery orders.
                      </p>
                      <ul className="option-features dim">
                        <li><i className="fa-solid fa-info-circle"></i> You can turn this on anytime in Order Settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ask-actions">
                  <button
                    className="btn-continue"
                    disabled={isSaving}
                    onClick={() => handleSaveReservation(acceptReservation)}
                  >
                    {isSaving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        Save & Continue <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                  <button
                    className="btn-skip"
                    disabled={isSaving}
                    onClick={() => handleSaveReservation(false)}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            ) : (
              /* ── SCREEN 2: Add Table POS Download Screen (Default once asked) ── */
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
                    <span>Table Reservation preference configured.</span>
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
