"use client";

import { useEffect, useState } from "react";
import {
  menuService,
  type MenuLanguage,
  type SupportedLanguage,
  type SupportedLanguageForShop,
  type AddMenuLanguagePayload,
} from "@/api/services/menu.service";
import { useShopId } from "@/utils/shop";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

export default function MenuLanguagePage() {
  const shopId = useShopId();

  // Top Tabs: "menuLanguage" (Screens 1, 2, 3) vs "supportedLanguages" (Screen 4)
  const [activeMainTab, setActiveMainTab] = useState<"menuLanguage" | "supportedLanguages">("menuLanguage");

  // Loading states
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [loadingLanguages, setLoadingLanguages] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  // Existing configured language setting (from GetAllLanguage)
  const [currentConfig, setCurrentConfig] = useState<MenuLanguage | null>(null);

  // Edit Mode state (if false -> Screen 3: Read-only summary card; if true -> Screen 1 or Screen 2: Edit form)
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Sub-tab when editing: "single" (Screen 1) vs "dual" (Screen 2)
  const [editLangType, setEditLangType] = useState<"single" | "dual">("single");

  // Form Fields - Single Language (Screen 1)
  const [singleLangCode, setSingleLangCode] = useState<string>("en");
  const [singleMenuDirection, setSingleMenuDirection] = useState<number>(1); // 0: RTL, 1: LTR

  // Form Fields - Dual Language (Screen 2)
  const [dualPrimaryLangName, setDualPrimaryLangName] = useState<string>("English");
  const [dualSecondaryLangCode, setDualSecondaryLangCode] = useState<string>("");
  const [dualDisplayMenu, setDualDisplayMenu] = useState<number>(2); // 0: Primary Only, 1: Secondary Only, 2: Both
  const [dualMenuDirection, setDualMenuDirection] = useState<number>(1); // 0: RTL, 1: LTR

  // Master language lists
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([]);
  const [supportedLanguagesForShop, setSupportedLanguagesForShop] = useState<SupportedLanguageForShop[]>([]);

  // 1. Fetch Current Menu Language Config
  const loadMenuLanguageConfig = async () => {
    if (!shopId) return;
    try {
      setLoadingConfig(true);
      const res = await menuService.getAllLanguage(shopId);
      if (Array.isArray(res) && res.length > 0) {
        const conf = res[0];
        setCurrentConfig(conf);

        const isDual = Number(conf.type_of_menu) === 1;
        setEditLangType(isDual ? "dual" : "single");

        // Sync initial form states
        if (conf.language_code) {
          setSingleLangCode(conf.language_code);
          setDualSecondaryLangCode(conf.language_code);
        }
        setSingleMenuDirection(Number(conf.MenuDirection ?? 1));
        setDualMenuDirection(Number(conf.MenuDirection ?? 1));
        setDualDisplayMenu(Number(conf.Display_menu ?? 2));
        setDualPrimaryLangName(conf.primary_language_name || "English");

        // If configuration exists, start in View Mode (Screen 3)
        setIsEditing(false);
      } else {
        // No configuration yet, start in Edit mode (Screen 1)
        setCurrentConfig(null);
        setIsEditing(true);
        setEditLangType("single");
      }
    } catch (err) {
      console.error("Failed to load menu language settings:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // 2. Fetch Supported Language Master List & Shop Supported Languages
  const loadLanguagesData = async () => {
    if (!shopId) return;
    try {
      setLoadingLanguages(true);
      const [masterList, shopLangList] = await Promise.all([
        menuService.getSupportedLanguages(),
        menuService.getSupportedLanguageForShop(shopId),
      ]);

      setAvailableLanguages(Array.isArray(masterList) ? masterList : []);
      setSupportedLanguagesForShop(Array.isArray(shopLangList) ? shopLangList : []);

      if (Array.isArray(masterList) && masterList.length > 0) {
        if (!dualSecondaryLangCode) {
          setDualSecondaryLangCode(masterList[0].lang_code_short || "en");
        }
        if (!singleLangCode) {
          setSingleLangCode(masterList[0].lang_code_short || "en");
        }
      }
    } catch (err) {
      console.error("Failed to load languages:", err);
    } finally {
      setLoadingLanguages(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      loadMenuLanguageConfig();
      loadLanguagesData();
    }
  }, [shopId]);

  // Handle Save Single Language (Screen 1)
  const handleSaveSingleLanguage = async () => {
    if (!shopId) return;
    const selectedLang = availableLanguages.find(
      (l) => l.lang_code_short === singleLangCode || l.lang_code === singleLangCode
    );
    const langName = selectedLang ? selectedLang.lang_name : "English";

    const payload: AddMenuLanguagePayload = {
      id: currentConfig?.id ?? 0,
      shop_id: shopId,
      primary_language: langName,
      secondary_language: "",
      display_menu: 0,
      menu_direction: singleMenuDirection,
      secondary_language_name: "",
      type_of_menu: 0,
      language_code: singleLangCode,
      primary_language_name: langName,
    };

    try {
      setSaving(true);
      const res = await menuService.addMenuLanguage(payload);
      if (res === "SUCCESS" || res?.response_code === "1" || res?.message === "Success" || res?.Status) {
        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Single Menu Language saved successfully!",
          showConfirmButton: false,
          timer: 2000,
        });
        await loadMenuLanguageConfig();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof res === "string" ? res : res?.message || "Failed to save menu language.",
        });
      }
    } catch (err: any) {
      console.error("Save error:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Dual Language (Screen 2)
  const handleSaveDualLanguage = async () => {
    if (!shopId) return;
    const selectedSecondary = availableLanguages.find(
      (l) => l.lang_code_short === dualSecondaryLangCode || l.lang_code === dualSecondaryLangCode
    );
    const secondaryLangName = selectedSecondary ? selectedSecondary.lang_name : dualSecondaryLangCode;

    const payload: AddMenuLanguagePayload = {
      id: currentConfig?.id ?? 0,
      shop_id: shopId,
      primary_language: "En-US",
      secondary_language: "En-AR",
      display_menu: dualDisplayMenu,
      menu_direction: dualMenuDirection,
      secondary_language_name: secondaryLangName,
      type_of_menu: 1,
      language_code: dualSecondaryLangCode,
      primary_language_name: dualPrimaryLangName,
    };

    try {
      setSaving(true);
      const res = await menuService.addMenuLanguage(payload);
      if (res === "SUCCESS" || res?.response_code === "1" || res?.message === "Success" || res?.Status) {
        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Dual Menu Language saved successfully!",
          showConfirmButton: false,
          timer: 2000,
        });
        await loadMenuLanguageConfig();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof res === "string" ? res : res?.message || "Failed to save menu language.",
        });
      }
    } catch (err: any) {
      console.error("Save error:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Supported Languages Grid Handlers (Screen 4)
  const handleToggleLanguage = async (lang: SupportedLanguageForShop) => {
    if (!shopId) return;
    if (lang.is_default_language === "1") {
      Swal.fire({
        icon: "info",
        title: "Default Language",
        text: "The default language cannot be removed. Set another language as default first.",
      });
      return;
    }

    const isChecked = lang.entry_exists === "true";
    setActionInProgressId(lang.id);

    try {
      if (!isChecked) {
        const res = await menuService.saveLanguageForShop(shopId, lang.id);
        if (res.response_code === "1" || res.status === 200 || !res.response_code) {
          setSupportedLanguagesForShop((prev) =>
            prev.map((l) => (l.id === lang.id ? { ...l, entry_exists: "true" } : l))
          );
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `${lang.lang_name} enabled successfully!`,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message || "Failed to enable language.",
          });
        }
      } else {
        const res = await menuService.deleteLanguageForShop(shopId, lang.id);
        if (res.response_code === "1" || res.status === 200 || !res.response_code) {
          setSupportedLanguagesForShop((prev) =>
            prev.map((l) => (l.id === lang.id ? { ...l, entry_exists: "false" } : l))
          );
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `${lang.lang_name} disabled successfully!`,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message || "Failed to disable language.",
          });
        }
      }
    } catch (err: any) {
      console.error("Error toggling language:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Operation failed.",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSetDefault = async (lang: SupportedLanguageForShop) => {
    if (!shopId) return;
    setActionInProgressId(lang.id);

    try {
      const res = await menuService.setDefaultLanguageForShop(shopId, lang.id);
      if (res.response_code === "1" || res.status === 200 || !res.response_code) {
        setSupportedLanguagesForShop((prev) =>
          prev.map((l) => ({
            ...l,
            is_default_language: l.id === lang.id ? "1" : "0",
            entry_exists: l.id === lang.id ? "true" : l.entry_exists,
          }))
        );

        localStorage.setItem("selected_language", lang.lang_code);
        localStorage.setItem("selected_language_name", lang.lang_name);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `${lang.lang_name} set as default language!`,
          showConfirmButton: false,
          timer: 2500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message || "Failed to set default language.",
        });
      }
    } catch (err: any) {
      console.error("Error setting default language:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Failed to set default language.",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // Helper text for Display Menu value
  const getDisplayMenuText = (val: number) => {
    if (val === 0) return "Primary Language Only";
    if (val === 1) return "Secondary Language Only";
    return "Display Both Language";
  };

  return (
    <div id="pg-menu-menu-language-page">
      <div className="app-container" style={{ width: "100%", height: "auto", minHeight: "100%" }}>
        <div className="main-content" style={{ width: "100%", padding: "1.5rem" }}>

          {/* Top Tabs: Menu Language vs Supported Languages */}
          <div className="menu-lang-tabs">
            <button
              type="button"
              className={`menu-lang-tab-btn ${activeMainTab === "menuLanguage" ? "active" : ""}`}
              onClick={() => setActiveMainTab("menuLanguage")}
            >
              Menu Language
            </button>
            <button
              type="button"
              className={`menu-lang-tab-btn ${activeMainTab === "supportedLanguages" ? "active" : ""}`}
              onClick={() => setActiveMainTab("supportedLanguages")}
            >
              Supported Languages
            </button>
          </div>

          {/* TAB 1: MENU LANGUAGE (Screens 1, 2, 3) */}
          {activeMainTab === "menuLanguage" && (
            <div className="supprtd_card">
              <div className="header-row-flex">
                <div className="supported_title">
                  <h1>Menu Language</h1>
                </div>
                <button
                  type="button"
                  className="btn-help-top"
                  onClick={() => window.open("https://vimeo.com/1075943186", "_blank")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  HELP
                </button>
              </div>

              {loadingConfig ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  Loading menu language settings...
                </div>
              ) : !isEditing && currentConfig ? (
                /* SCREEN 3: READ-ONLY DISPLAY CARD */
                <div>
                  <div className="view-mode-title">
                    {Number(currentConfig.type_of_menu) === 1
                      ? "Dual Menu Language"
                      : "Single Menu Language"}
                  </div>

                  {Number(currentConfig.type_of_menu) === 1 ? (
                    /* Dual Language Read-only view */
                    <div>
                      <div className="view-details-grid">
                        <div className="view-detail-card">
                          <div className="label">Primary Language</div>
                          <div className="value">{currentConfig.primary_language_name || "English"}</div>
                        </div>
                        <div className="view-detail-card">
                          <div className="label">Secondary Language</div>
                          <div className="value">{currentConfig.secondary_language_name || "Gujarati"}</div>
                        </div>
                        <div className="view-detail-card">
                          <div className="label">Display Menu</div>
                          <div className="value">{getDisplayMenuText(Number(currentConfig.Display_menu))}</div>
                        </div>
                        <div className="view-detail-card">
                          <div className="label">Menu Direction</div>
                          <div className="value">
                            {Number(currentConfig.MenuDirection) === 0 ? "Right To Left" : "Left To Right"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Language Read-only view */
                    <div>
                      <div className="view-details-grid">
                        <div className="view-detail-card">
                          <div className="label">Primary Language</div>
                          <div className="value">{currentConfig.primary_language_name || "English"}</div>
                        </div>
                        <div className="view-detail-card">
                          <div className="label">Menu Direction</div>
                          <div className="value">
                            {Number(currentConfig.MenuDirection) === 0 ? "Right To Left" : "Left To Right"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="btn-action-row">
                    <button
                      type="button"
                      className="btn-primary-teal"
                      onClick={() => setIsEditing(true)}
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              ) : (
                /* SCREENS 1 & 2: EDIT FORMS */
                <div>
                  {/* Sub-tab Pill: Single vs Dual Language */}
                  <div className="lang-type-toggle">
                    <button
                      type="button"
                      className={`lang-type-btn ${editLangType === "single" ? "active" : ""}`}
                      onClick={() => setEditLangType("single")}
                    >
                      Single Language
                    </button>
                    <button
                      type="button"
                      className={`lang-type-btn ${editLangType === "dual" ? "active" : ""}`}
                      onClick={() => setEditLangType("dual")}
                    >
                      Dual Language
                    </button>
                  </div>

                  {/* SCREEN 1: Single Language Form */}
                  {editLangType === "single" && (
                    <div>
                      <div className="form-group-custom">
                        <label className="form-label-custom">Menu Language</label>
                        <select
                          className="form-select-custom"
                          value={singleLangCode}
                          onChange={(e) => setSingleLangCode(e.target.value)}
                        >
                          {availableLanguages.map((l) => (
                            <option key={l.id} value={l.lang_code_short || l.lang_code}>
                              {l.lang_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group-custom">
                        <label className="form-label-custom">Menu Direction</label>
                        <div className="radio-group-horizontal">
                          <label className="custom-radio-label">
                            <input
                              type="radio"
                              name="single_direction"
                              checked={singleMenuDirection === 0}
                              onChange={() => setSingleMenuDirection(0)}
                            />
                            Right to Left
                          </label>
                          <label className="custom-radio-label">
                            <input
                              type="radio"
                              name="single_direction"
                              checked={singleMenuDirection === 1}
                              onChange={() => setSingleMenuDirection(1)}
                            />
                            Left to Right
                          </label>
                        </div>
                      </div>

                      <div className="btn-action-row">
                        <button
                          type="button"
                          className="btn-primary-teal"
                          disabled={saving}
                          onClick={handleSaveSingleLanguage}
                        >
                          {saving ? "SAVING..." : "SAVE"}
                        </button>
                        {currentConfig && (
                          <button
                            type="button"
                            className="btn-cancel-gray"
                            disabled={saving}
                            onClick={() => setIsEditing(false)}
                          >
                            CANCEL
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: Dual Language Form */}
                  {editLangType === "dual" && (
                    <div>
                      <div className="dual-lang-row">
                        <div className="dual-lang-col form-group-custom">
                          <label className="form-label-custom">Primary Language</label>
                          <input
                            type="text"
                            className="form-input-custom"
                            value={dualPrimaryLangName}
                            disabled
                          />
                        </div>

                        <div className="dual-lang-col form-group-custom">
                          <label className="form-label-custom">Secondary Language</label>
                          <select
                            className="form-select-custom"
                            value={dualSecondaryLangCode}
                            onChange={(e) => setDualSecondaryLangCode(e.target.value)}
                          >
                            {availableLanguages.map((l) => (
                              <option key={l.id} value={l.lang_code_short || l.lang_code}>
                                {l.lang_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="radio-section-grid">
                        <div className="form-group-custom">
                          <label className="form-label-custom">Display Menu</label>
                          <div className="radio-group-vertical">
                            <label className="custom-radio-label">
                              <input
                                type="radio"
                                name="display_menu"
                                checked={dualDisplayMenu === 0}
                                onChange={() => setDualDisplayMenu(0)}
                              />
                              Primary Language Only
                            </label>
                            <label className="custom-radio-label">
                              <input
                                type="radio"
                                name="display_menu"
                                checked={dualDisplayMenu === 1}
                                onChange={() => setDualDisplayMenu(1)}
                              />
                              Secondary Language Only
                            </label>
                            <label className="custom-radio-label">
                              <input
                                type="radio"
                                name="display_menu"
                                checked={dualDisplayMenu === 2}
                                onChange={() => setDualDisplayMenu(2)}
                              />
                              Both(Primary Language and Secondary Language)
                            </label>
                          </div>
                        </div>

                        <div className="form-group-custom">
                          <label className="form-label-custom">Menu Direction</label>
                          <div className="radio-group-vertical">
                            <label className="custom-radio-label">
                              <input
                                type="radio"
                                name="dual_direction"
                                checked={dualMenuDirection === 0}
                                onChange={() => setDualMenuDirection(0)}
                              />
                              Right to Left
                            </label>
                            <label className="custom-radio-label">
                              <input
                                type="radio"
                                name="dual_direction"
                                checked={dualMenuDirection === 1}
                                onChange={() => setDualMenuDirection(1)}
                              />
                              Left to Right
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="btn-action-row">
                        <button
                          type="button"
                          className="btn-primary-teal"
                          disabled={saving}
                          onClick={handleSaveDualLanguage}
                        >
                          {saving ? "SAVING..." : "SAVE"}
                        </button>
                        {currentConfig && (
                          <button
                            type="button"
                            className="btn-cancel-gray"
                            disabled={saving}
                            onClick={() => setIsEditing(false)}
                          >
                            CANCEL
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPPORTED LANGUAGES (Screen 4) */}
          {activeMainTab === "supportedLanguages" && (
            <div className="supprtd_card">
              <div className="supported_title">
                <h1 className="typ-page-heading" style={{ margin: 0, marginBottom: "20px" }}>
                  Languages
                </h1>
              </div>

              <div className="language_main">
                <div className="language_main_fi">
                  <div className="language_content">
                    <div className="lang_content_title">
                      <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Change Languages</h2>
                    </div>
                  </div>
                </div>

                <div className="language_main_sec">
                  {loadingLanguages ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                      Loading languages...
                    </div>
                  ) : supportedLanguagesForShop.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                      No languages available.
                    </div>
                  ) : (
                    <div className="supported_languages_grid">
                      {supportedLanguagesForShop.map((x) => {
                        const isDefault = x.is_default_language === "1";
                        const isChecked = x.entry_exists === "true" || isDefault;
                        const busy = actionInProgressId === x.id;

                        return (
                          <div className="select_lan_main" key={x.id}>
                            <div className="selece_lan">
                              <label className="select_lan_checkbox_label">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDefault || busy}
                                  onChange={() => handleToggleLanguage(x)}
                                />
                                <span className="checkbox_custom_mark"></span>
                              </label>
                              <div className="select_lan_con">
                                <p>{x.lang_name}</p>
                              </div>
                            </div>

                            <div className="lan_action_right">
                              {isDefault ? (
                                <div className="checkbox_click_btn">
                                  <span className="default_badge">DEFAULT</span>
                                </div>
                              ) : isChecked ? (
                                <div className="set_default_btn_wrap">
                                  <button
                                    type="button"
                                    className="btn_set_default"
                                    disabled={busy}
                                    onClick={() => handleSetDefault(x)}
                                  >
                                    {busy ? "..." : "Set as Default"}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <WizardFooter />
        </div>
      </div>
    </div>
  );
}
