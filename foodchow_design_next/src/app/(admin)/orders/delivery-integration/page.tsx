"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import Swal from "sweetalert2";
import {
  orderService,
  LalamoveMarketItem,
  SaveLalamovePayload,
  SavePorterPayload,
} from "@/api/services/order.service";
import "./page.css";

/**
 * orders/delivery-integration.html → React.
 * Inline <script> ported into one useEffect: partner select switching,
 * auto/manual delivery-process notice updates, and step-footer navigation.
 * The shell-owned sidebar nav + dropdown logic is dropped.
 */
function parseDeliveryProcess(detail: any): "auto" | "manual" {
  if (!detail) return "auto";
  const raw =
    detail.delivery_process ??
    detail.deliveryProcess ??
    detail.DeliveryProcess ??
    detail.delivery_process_lala ??
    detail.process ??
    "";
  const str = String(raw).trim().toLowerCase();
  return str === "1" || str === "manual" ? "manual" : "auto";
}

export default function DeliveryIntegrationPage() {
  const [shopId, setShopId] = useState<number>(0);
  const [lalamoveCountries, setLalamoveCountries] = useState<LalamoveMarketItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [deliveryProcess, setDeliveryProcess] = useState<string>("auto");
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [porterApiKey, setPorterApiKey] = useState<string>("");
  const [porterDeliveryProcess, setPorterDeliveryProcess] = useState<string>("auto");
  const [isLoadingPorterDetail, setIsLoadingPorterDetail] = useState<boolean>(false);
  const [porterDetailError, setPorterDetailError] = useState<string | null>(null);
  const [isSavingPorter, setIsSavingPorter] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<string>("lalamove");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedShopId = sessionStorage.getItem("shop_id") || localStorage.getItem("shop_id");
      if (storedShopId) {
        setShopId(Number(storedShopId));
      }
    }
  }, []);

  useEffect(() => {
    async function loadLalamoveCountries() {
      try {
        setIsLoadingCountries(true);
        setCountriesError(null);
        const countries = await orderService.getLalaMoveMarket();
        setLalamoveCountries(countries);
      } catch (err: any) {
        console.error("Failed to fetch Lalamove countries:", err);
        setCountriesError(err.message || "Failed to load countries");
      } finally {
        setIsLoadingCountries(false);
      }
    }
    loadLalamoveCountries();
  }, []);

  useEffect(() => {
    if (!shopId) return;

    async function loadLalamoveDetail() {
      try {
        setIsLoadingDetail(true);
        setDetailError(null);
        const detail = await orderService.getLalamoveDetail(shopId);

        if (detail) {
          const countryVal = String(detail.country ?? detail.Country ?? "").trim();
          const keyVal = String(detail.api_key ?? detail.apiKey ?? detail.ApiKey ?? "").trim();
          const secretVal = String(detail.api_secret ?? detail.apiSecret ?? detail.ApiSecret ?? "").trim();
          const processVal = parseDeliveryProcess(detail);

          if (countryVal) setSelectedCountry(countryVal);
          if (keyVal) setApiKey(keyVal);
          if (secretVal) setApiSecret(secretVal);
          setDeliveryProcess(processVal);
        }
      } catch (err: any) {
        console.error("Failed to load Lalamove detail for shop:", shopId, err);
        setDetailError(err.message || "Failed to load Lalamove details.");
      } finally {
        setIsLoadingDetail(false);
      }
    }

    loadLalamoveDetail();
  }, [shopId]);

  const handleSaveLalamove = async (): Promise<void> => {
    if (!shopId) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Invalid Shop ID. Please log in or select a shop." });
      return;
    }

    if (!selectedCountry) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Please select a Country." });
      return;
    }

    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "API Key is required." });
      return;
    }

    const trimmedApiSecret = apiSecret.trim();
    if (!trimmedApiSecret) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "API Secret is required." });
      return;
    }

    const payload: SaveLalamovePayload = {
      ApiKey: trimmedApiKey,
      ApiSecret: trimmedApiSecret,
      country: selectedCountry,
      shopId: shopId,
      t1: "LalaMove",
      delivery_process_lala: deliveryProcess === "manual" ? "1" : "0",
      lalamovebaseurl: "https://rest.lalamove.com",
    };

    try {
      setIsSaving(true);
      const res = await orderService.saveLalamoveData(payload);

      const isSuccess = Boolean(
        res && (
          res.status === true ||
          String(res.response_code) === "1" ||
          (typeof res.message === "string" && (
            res.message.toLowerCase().includes("success") ||
            res.message.toLowerCase().includes("saved") ||
            res.message.toLowerCase().includes("updated")
          ))
        )
      );

      if (isSuccess) {
        const successMsg = res?.message || "Lalamove details saved successfully!";
        await Swal.fire({
          icon: "success",
          title: "Saved Successfully",
          text: successMsg,
          timer: 2000,
          showConfirmButton: false,
        });

        // Refetch Lalamove details so UI reflects updated data
        const updatedDetail = await orderService.getLalamoveDetail(shopId);
        if (updatedDetail) {
          const countryVal = String(updatedDetail.country ?? updatedDetail.Country ?? "").trim();
          const keyVal = String(updatedDetail.api_key ?? updatedDetail.apiKey ?? updatedDetail.ApiKey ?? "").trim();
          const secretVal = String(updatedDetail.api_secret ?? updatedDetail.apiSecret ?? updatedDetail.ApiSecret ?? "").trim();
          const processVal = parseDeliveryProcess(updatedDetail);

          if (countryVal) setSelectedCountry(countryVal);
          if (keyVal) setApiKey(keyVal);
          if (secretVal) setApiSecret(secretVal);
          setDeliveryProcess(processVal);
        }
      } else {
        const errorMsg = res?.message || "Failed to save Lalamove details.";
        Swal.fire({ icon: "error", title: "Save Failed", text: errorMsg });
      }
    } catch (err: any) {
      const errorText = err?.message || "An error occurred while saving Lalamove details.";
      Swal.fire({ icon: "error", title: "Error", text: errorText });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!shopId) return;

    async function loadPorterDetail() {
      try {
        setIsLoadingPorterDetail(true);
        setPorterDetailError(null);
        const detail = await orderService.getPorterDetail(shopId);

        if (detail) {
          const keyVal = String(detail.api_key ?? detail.apiKey ?? detail.ApiKey ?? "").trim();
          const processVal = parseDeliveryProcess(detail);

          if (keyVal) setPorterApiKey(keyVal);
          setPorterDeliveryProcess(processVal);
        }
      } catch (err: any) {
        console.error("Failed to load Porter detail for shop:", shopId, err);
        setPorterDetailError(err.message || "Failed to load Porter details.");
      } finally {
        setIsLoadingPorterDetail(false);
      }
    }

    loadPorterDetail();
  }, [shopId]);

  const handleSavePorter = async (): Promise<void> => {
    if (!shopId) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Invalid Shop ID. Please log in or select a shop." });
      return;
    }

    const trimmedApiKey = porterApiKey.trim();
    if (!trimmedApiKey) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Porter API Key is required." });
      return;
    }

    const payload: SavePorterPayload = {
      ApiKey: trimmedApiKey,
      shopId: shopId,
      t1: "Porter",
      delivery_process: porterDeliveryProcess === "manual" ? "1" : "0",
      porterbaseurl: "https://pfe-apigw.porter.in",
    };

    try {
      setIsSavingPorter(true);
      const res = await orderService.savePorterData(payload);

      const isSuccess = Boolean(
        res && (
          res.status === true ||
          String(res.response_code) === "1" ||
          (typeof res.message === "string" && (
            res.message.toLowerCase().includes("success") ||
            res.message.toLowerCase().includes("saved") ||
            res.message.toLowerCase().includes("updated")
          ))
        )
      );

      if (isSuccess) {
        const successMsg = res?.message || "Porter details saved successfully!";
        await Swal.fire({
          icon: "success",
          title: "Saved Successfully",
          text: successMsg,
          timer: 2000,
          showConfirmButton: false,
        });

        // Refetch Porter detail to refresh UI state dynamically
        const updatedDetail = await orderService.getPorterDetail(shopId);
        if (updatedDetail) {
          const keyVal = String(updatedDetail.api_key ?? updatedDetail.apiKey ?? updatedDetail.ApiKey ?? "").trim();
          const processVal = parseDeliveryProcess(updatedDetail);

          if (keyVal) setPorterApiKey(keyVal);
          setPorterDeliveryProcess(processVal);
        }
      } else {
        const errorMsg = res?.message || "Failed to save Porter details.";
        Swal.fire({ icon: "error", title: "Save Failed", text: errorMsg });
      }
    } catch (err: any) {
      const errorText = err?.message || "An error occurred while saving Porter details.";
      Swal.fire({ icon: "error", title: "Error", text: errorText });
    } finally {
      setIsSavingPorter(false);
    }
  };

  useEffect(() => {
    const root = document.getElementById("pg-orders-delivery-integration");
    if (!root) return;

    const lalaPanel = document.getElementById("panel-lalamove");
    const porterPanel = document.getElementById("panel-porter");

    const switchIntegrationPartner = (): void => {
      lalaPanel?.classList.remove("active-panel");
      porterPanel?.classList.remove("active-panel");
      if (selectedPartner === "porter") {
        porterPanel?.classList.add("active-panel");
      } else {
        lalaPanel?.classList.add("active-panel");
      }
    };
    switchIntegrationPartner();

    const updateNotice = (partner: "lalamove" | "porter"): void => {
      const checked = root.querySelector<HTMLInputElement>(
        `input[name="${partner}_process"]:checked`,
      );
      const noticeEl = document.getElementById(`${partner}-notice`);
      if (!checked || !noticeEl) return;
      const nameFormatted = partner === "lalamove" ? "LalaMove" : "Porter";
      noticeEl.textContent =
        checked.value === "auto"
          ? `${nameFormatted} order will place once you accept the order`
          : `You will have to manually assign orders to ${nameFormatted}`;
    };

    const lalaRadios = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="lalamove_process"]'),
    );
    const porterRadios = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="porter_process"]'),
    );
    const onLala = (): void => updateNotice("lalamove");
    const onPorter = (): void => updateNotice("porter");
    lalaRadios.forEach((r) => r.addEventListener("change", onLala));
    porterRadios.forEach((r) => r.addEventListener("change", onPorter));

    // Step nav
    let currentStep = 14;
    const totalSteps = 25;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const stepValue = document.getElementById("stepValue");
    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      lalaRadios.forEach((r) => r.removeEventListener("change", onLala));
      porterRadios.forEach((r) => r.removeEventListener("change", onPorter));
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, [selectedPartner]);

  return (
    <div id="pg-orders-delivery-integration">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="di-top-row">
                <div className="di-header-area">
                  <h2 className="typ-page-heading">Delivery Integration</h2>
                  <div className="di-select-wrapper">
                    <select 
                      className="di-select" 
                      id="deliveryPartnerSelect" 
                      value={selectedPartner}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                    >
                      <option value="select">Select</option>
                      <option value="lalamove">LalaMove</option>
                      <option value="porter">Porter</option>
                    </select>
                  </div>
                </div>
                <button className="btn-help-card">
                  <i className="far fa-question-circle" />
                  HELP
                </button>
              </div>

              <div id="panel-lalamove" className="integration-panel active-panel">
                <div className="di-panel-header">Lalamove Credentials</div>
                <div className="di-form-wrapper">
                  <div className="di-form-group">
                    <label>
                      Country<span>*</span>
                    </label>
                    <select
                      className="di-form-select"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      disabled={isLoadingCountries}
                    >
                      <option value="">
                        {isLoadingCountries
                          ? "-- Loading Countries... --"
                          : countriesError
                            ? "-- Error Loading Countries --"
                            : lalamoveCountries.length === 0
                              ? "-- No Countries Available --"
                              : "-- Select Country --"}
                      </option>
                      {lalamoveCountries.map((item) => (
                        <option key={item.country} value={item.country}>
                          {item.country}
                        </option>
                      ))}
                    </select>
                    {countriesError && (
                      <span
                        className="error-text"
                        style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px", display: "block" }}
                      >
                        {countriesError}
                      </span>
                    )}
                  </div>
                  <div className="di-form-group">
                    <label>
                      Api Key<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="di-input"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={isLoadingDetail ? "Loading API key..." : "Enter Api Key"}
                      disabled={isLoadingDetail}
                    />
                  </div>
                  <div className="di-form-group">
                    <label>
                      Api Secret<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="di-input"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder={isLoadingDetail ? "Loading API secret..." : "Enter Api Secret"}
                      disabled={isLoadingDetail}
                    />
                  </div>
                  <div className="di-form-group">
                    <label>
                      Delivery Process<span>*</span>
                    </label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="lalamove_process"
                          value="auto"
                          checked={deliveryProcess === "auto"}
                          onChange={() => setDeliveryProcess("auto")}
                          disabled={isLoadingDetail}
                        />{" "}
                        Auto
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="lalamove_process"
                          value="manual"
                          checked={deliveryProcess === "manual"}
                          onChange={() => setDeliveryProcess("manual")}
                          disabled={isLoadingDetail}
                        />{" "}
                        Manual
                      </label>
                    </div>
                    {detailError && (
                      <span
                        className="error-text"
                        style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px", display: "block" }}
                      >
                        {detailError}
                      </span>
                    )}
                    <div id="lalamove-notice" className="di-process-notice">
                      {deliveryProcess === "auto"
                        ? "LalaMove order will place once you accept the order"
                        : "You will have to manually assign orders to LalaMove"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-validate"
                    onClick={handleSaveLalamove}
                    disabled={isSaving || isLoadingDetail || isLoadingCountries}
                  >
                    {isSaving ? "Saving..." : "Validate Lalamove Integration"}
                  </button>
                </div>
              </div>

              <div id="panel-porter" className="integration-panel">
                <div className="di-panel-header">Porter Credentials</div>
                <div className="di-form-wrapper">
                  <div className="di-form-group">
                    <label>
                      Api Key<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="di-input"
                      value={porterApiKey}
                      onChange={(e) => setPorterApiKey(e.target.value)}
                      placeholder={isLoadingPorterDetail ? "Loading API key..." : "Enter Api Key"}
                      disabled={isLoadingPorterDetail || isSavingPorter}
                    />
                  </div>
                  <div className="di-form-group">
                    <label>
                      Delivery Process<span>*</span>
                    </label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="porter_process"
                          value="auto"
                          checked={porterDeliveryProcess === "auto"}
                          onChange={() => setPorterDeliveryProcess("auto")}
                          disabled={isLoadingPorterDetail || isSavingPorter}
                        />{" "}
                        Auto
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="porter_process"
                          value="manual"
                          checked={porterDeliveryProcess === "manual"}
                          onChange={() => setPorterDeliveryProcess("manual")}
                          disabled={isLoadingPorterDetail || isSavingPorter}
                        />{" "}
                        Manual
                      </label>
                    </div>
                    {porterDetailError && (
                      <span
                        className="error-text"
                        style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px", display: "block" }}
                      >
                        {porterDetailError}
                      </span>
                    )}
                    <div id="porter-notice" className="di-process-notice">
                      {porterDeliveryProcess === "auto"
                        ? "Porter order will place once you accept the order"
                        : "You will have to manually assign orders to Porter"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-validate"
                    onClick={handleSavePorter}
                    disabled={isSavingPorter || isLoadingPorterDetail}
                  >
                    {isSavingPorter ? "Saving..." : "Validate Porter Integration"}
                  </button>
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
