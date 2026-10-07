"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";
import { orderService } from "@/api/services/order.service";

/**
 * orders/widget-setting.html → React.
 * Inline <script> ported into one useEffect: mobile→otp checkbox gating,
 * color picker / hex sync with live preview, and SUBMIT button feedback.
 */
export default function WidgetSettingPage() {
  const [widgetSettings, setWidgetSettings] = useState<any>(null);
  const [colorHex, setColorHex] = useState("#000000");
  const [colorSaving, setColorSaving] = useState(false);
  const [colorError, setColorError] = useState("");
  const handleWidgetSettingUpdate = async (
    status: number,
    flag: number
  ) => {
    try {
      const shopId = Number(sessionStorage.getItem("shop_id"));

      if (!shopId) {
        console.error("Shop ID not found");
        return;
      }

      const response = await orderService.updateWidgetSettings(
        shopId,
        status,
        flag
      );

      console.log("Widget Setting Updated:", response);

      setWidgetSettings((prev: any) => ({
        ...prev,
        email_required: status,
      }));

    } catch (error) {
      console.error("Error updating widget setting:", error);
    }
  };
  const handleColorUpdate = async () => {
    // Validate HEX before API call
    if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
      setColorError("Please enter a valid HEX color.");
      return;
    }

    setColorError("");

    try {
      const shopId = Number(sessionStorage.getItem("shop_id"));

      if (!shopId) {
        console.error("Shop ID not found");
        return;
      }

      setColorSaving(true);

      const response =
        await orderService.updateColorPickerWidgetSetting(
          shopId,
          colorHex
        );

      console.log("Color Picker Updated:", response);

      setWidgetSettings((prev: any) => ({
        ...prev,
        color_picker: colorHex,
      }));

    } catch (error) {
      console.error("Error updating color picker:", error);
    } finally {
      setColorSaving(false);
    }
  };
  useEffect(() => {
    const mobileChk = document.getElementById("chk-mobile") as HTMLInputElement | null;
    const otpChk = document.getElementById("chk-otp") as HTMLInputElement | null;


    const onMobileChange = (): void => {
      if (!otpChk || !mobileChk) return;
      otpChk.disabled = !mobileChk.checked;
      if (!mobileChk.checked) otpChk.checked = false;
    };
    mobileChk?.addEventListener("change", onMobileChange);


    let submitTimer: ReturnType<typeof setTimeout> | undefined;
    const fetchWidgetSettings = async () => {
      try {
        const shopId = Number(sessionStorage.getItem("shop_id"));

        if (!shopId) {
          console.error("Shop ID not found");
          return;
        }

        const response = await orderService.fetchWidgetSettings(shopId);

        console.log("Widget Settings:", response);

        setWidgetSettings(response);

        if (response?.color_picker) {
          setColorHex(response.color_picker);
        }
      } catch (error) {
        console.error("Error fetching widget settings:", error);
      }
    };

    fetchWidgetSettings();
    return () => {
      mobileChk?.removeEventListener("change", onMobileChange);
      if (submitTimer) clearTimeout(submitTimer);
    };

  }, []);

  return (
    <div id="pg-orders-widget-setting">
      <div className="app-container">
        <div className="main">
          <div className="page-content">
            {/* CARD 1: Ordering Widget Setting */}
            <div className="page-card">
              <div className="card-title-row">
                <div className="typ-page-heading card-title">Ordering Widget Setting</div>
                <button className="action-btn action-btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              <div className="option-block" style={{ marginBottom: "12px" }}>
                <div className="option-row">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    id="chk-mobile"
                    checked={true}
                    disabled
                    readOnly
                  />
                  <label htmlFor="chk-mobile" className="option-label">
                    Do you want Customer mobile no. field in Customer ordering page?
                  </label>
                </div>
                <div className="option-row sub">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    id="chk-otp"
                    disabled={widgetSettings?.mobile_required !== 1}
                  />
                  <label htmlFor="chk-otp" className="option-label" style={{ color: "#a0aec0" }}>
                    Do you want Otp verified customer?
                    <span className="option-note">Please Contact us for this feature.</span>
                  </label>
                </div>
              </div>

              <div className="option-block">
                <div className="option-row">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    id="chk-email"
                    checked={widgetSettings?.email_required === 1}
                    onChange={(e) =>
                      handleWidgetSettingUpdate(
                        e.target.checked ? 1 : 0,
                        1
                      )
                    }
                  />
                  <label htmlFor="chk-email" className="option-label">
                    Do you want Customer Email Id field in Customer ordering page?
                  </label>
                </div>
              </div>
            </div>

            {/* CARD 2: Custom Color */}
            <div className="page-card">
              <div className="color-section-title">Choose a custom color for your widget page</div>
              <div className="color-label">Select Color</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      className="color-swatch"
                      id="colorPicker"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(colorHex)
                          ? colorHex
                          : "#000000"
                      }
                      onChange={(e) => {
                        setColorHex(e.target.value);
                        setColorError("");
                      }}
                    />

                    <input
                      type="text"
                      className="color-hex"
                      id="colorHex"
                      value={colorHex}
                      maxLength={7}
                      placeholder="#000000"
                      onChange={(e) => {
                        const value = e.target.value;

                        setColorHex(value);

                        if (!value) {
                          setColorError("Please enter a color.");
                        } else if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
                          setColorError("Please enter a valid HEX color.");
                        } else {
                          setColorError("");
                        }
                      }}
                    />
                  </div>

                  {colorError && (
                    <div className="color-error">
                      {colorError}
                    </div>
                  )}
                </div>
                <button
                  className="submit-btn"
                  id="widgetSubmitBtn"
                  onClick={handleColorUpdate}
                  disabled={colorSaving}
                >
                  {colorSaving ? "SAVING..." : "SUBMIT"}
                </button>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}