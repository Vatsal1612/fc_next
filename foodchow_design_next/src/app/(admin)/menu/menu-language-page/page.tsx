"use client";

import { useEffect, useState } from "react";
import { menuService, type SupportedLanguage, type MenuLanguage } from "@/api/services/menu.service";
import { getShopId } from "@/utils/shop";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

export default function MenuLanguagePagePage() {
    const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
    const [savedSettings, setSavedSettings] = useState<MenuLanguage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPrimaryLanguage, setSelectedPrimaryLanguage] = useState<string>("");
    const [selectedSecondaryLanguage, setSelectedSecondaryLanguage] = useState<string>("");

    const loadLanguages = async () => {
        try {
            setLoading(true);
            setError(null);
            const activeShopId = getShopId();

            const [supportedLanguages, shopLanguages] = await Promise.all([
                menuService.getSupportedLanguages(),
                menuService.getAllLanguage(activeShopId),
            ]);

            console.log("Supported Languages:", supportedLanguages);
            console.log("Shop Languages for shopId", activeShopId, ":", shopLanguages);

            setLanguages(supportedLanguages);

            if (shopLanguages && shopLanguages.length > 0) {
                const saved = shopLanguages[0];
                setSavedSettings(saved);

                const primary = saved.primary_language_name || saved.Primary_language || (supportedLanguages[0]?.lang_name ?? "");
                const secondary = saved.secondary_language_name || saved.Secondary_language || (supportedLanguages[1]?.lang_name ?? supportedLanguages[0]?.lang_name ?? "");

                setSelectedPrimaryLanguage(primary);
                setSelectedSecondaryLanguage(secondary);
            } else if (supportedLanguages.length > 0) {
                setSavedSettings(null);
                setSelectedPrimaryLanguage(supportedLanguages[0].lang_name);
                setSelectedSecondaryLanguage(supportedLanguages[1]?.lang_name ?? supportedLanguages[0].lang_name);
            }
        } catch (err: any) {
            console.error("Language API Error:", err);
            setError(err?.message || "Failed to load language settings.");
        } finally {
            setLoading(false);
        }
    };

    const refreshSavedSettings = async () => {
        try {
            const activeShopId = getShopId();
            const shopLanguages = await menuService.getAllLanguage(activeShopId);
            if (shopLanguages && shopLanguages.length > 0) {
                const saved = shopLanguages[0];
                setSavedSettings(saved);

                const primary = saved.primary_language_name || saved.Primary_language || "";
                const secondary = saved.secondary_language_name || saved.Secondary_language || "";
                if (primary) setSelectedPrimaryLanguage(primary);
                if (secondary) setSelectedSecondaryLanguage(secondary);
            }
        } catch (err) {
            console.error("Failed to refresh saved language settings:", err);
        }
    };

    const handleSave = async (e?: React.MouseEvent | Event) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("=== SAVE BUTTON CLICKED ===");

        try {
            setLoading(true);
            const activeShopId = getShopId();

            const tabDual = document.getElementById("tab-dual");
            const isDual = tabDual?.classList.contains("active") || savedSettings?.type_of_menu === 2;
            const isSingle = !isDual;
            const type_of_menu = isSingle ? 1 : 2;

            const sLangBtnText = document.getElementById("btn-s-lang-text")?.textContent?.trim();
            const primaryName = sLangBtnText || selectedPrimaryLanguage || (languages[0]?.lang_name ?? "");
            const primaryObj = languages.find(
                (l) => l.lang_name.toLowerCase() === primaryName.toLowerCase()
            );

            const primary_language = primaryObj?.lang_name || primaryName;
            const primary_language_name = primaryObj?.lang_name || primaryName;
            const language_code = primaryObj?.lang_code || "";

            let secondary_language = "";
            let secondary_language_name = "";

            if (!isSingle) {
                const dSecBtnText = document.getElementById("btn-d-sec-text")?.textContent?.trim();
                const secondaryName = dSecBtnText || selectedSecondaryLanguage || (languages[1]?.lang_name ?? languages[0]?.lang_name ?? "");
                const secondaryObj = languages.find(
                    (l) => l.lang_name.toLowerCase() === secondaryName.toLowerCase()
                );
                secondary_language = secondaryObj?.lang_name || secondaryName;
                secondary_language_name = secondaryObj?.lang_name || secondaryName;
            }

            let menu_direction = 0;
            if (isSingle) {
                const dirInput = document.querySelector<HTMLInputElement>(
                    'input[name="s-dir"]:checked'
                );
                menu_direction = dirInput?.value === "rtl" ? 1 : 0;
            } else {
                const dir2Input = document.querySelector<HTMLInputElement>(
                    'input[name="d-dir"]:checked'
                );
                menu_direction = dir2Input?.value === "rtl" ? 1 : 0;
            }

            let display_menu = 1;
            if (!isSingle) {
                const displayInput = document.querySelector<HTMLInputElement>(
                    'input[name="d-display"]:checked'
                );
                const displayVal = displayInput?.value || "both";
                if (displayVal === "primary") display_menu = 1;
                else if (displayVal === "secondary") display_menu = 2;
                else display_menu = 3;
            }

            const payload = {
                id: savedSettings?.id ?? 0,
                shop_id: activeShopId,
                primary_language,
                secondary_language,
                display_menu,
                menu_direction,
                secondary_language_name,
                type_of_menu,
                language_code,
                primary_language_name,
            };

            console.log("AddMenuLanguage Payload:", payload);

            const response = await menuService.addMenuLanguage(payload);
            console.log("AddMenuLanguage Response:", response);

            if (
                response?.status === true ||
                response?.messageType === 1 ||
                response?.data === "SUCCESS" ||
                response?.result === "SUCCESS" ||
                response?.message === "Success"
            ) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response?.message || "Menu language saved successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                });

                await refreshSavedSettings();

                document.getElementById("edit-state")?.classList.add("hidden");
                if (isSingle) {
                    document.getElementById("view-single")?.classList.remove("hidden");
                    document.getElementById("view-dual")?.classList.add("hidden");
                } else {
                    document.getElementById("view-single")?.classList.add("hidden");
                    document.getElementById("view-dual")?.classList.remove("hidden");
                }
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response?.message || "Failed to save menu language settings.",
                });
            }
        } catch (err: any) {
            console.error("Save Menu Language Error:", err);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.message || "An unexpected error occurred while saving.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLanguages();
    }, []);

    useEffect(() => {
        const LANGS = languages.map((lang) => ({
            id: lang.id,
            name: lang.lang_name,
            code: lang.lang_code,
            codeShort: lang.lang_code_short,
        }));

        const initialLang = languages.length > 0 ? languages[0].lang_name : "";

        const selected: Record<string, string> = {
            "drop-s-lang": selectedPrimaryLanguage || initialLang,
            "drop-d-sec": selectedSecondaryLanguage || initialLang,
        };
        let currentMode = savedSettings?.type_of_menu === 2 ? "dual" : "single";

        function escapeHtml(str: string): string {
            if (!str) return "";
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function buildDropdown(dropId: string): void {
            const drop = document.getElementById(dropId);
            if (!drop) return;
            drop.innerHTML = "";

            if (LANGS.length === 0) {
                const emptyDiv = document.createElement("div");
                emptyDiv.className = "flag-option disabled";
                emptyDiv.style.padding = "10px 14px";
                emptyDiv.style.color = "var(--text-muted)";
                emptyDiv.style.fontSize = "13px";
                emptyDiv.innerHTML = "<span>No languages available</span>";
                drop.appendChild(emptyDiv);
                return;
            }

            LANGS.forEach((lang) => {
                const div = document.createElement("div");
                div.className =
                    "flag-option" + (selected[dropId] === lang.name ? " selected" : "");
                div.setAttribute("data-lang-id", String(lang.id));
                div.setAttribute("data-lang-code", lang.code || "");
                div.setAttribute("data-lang-code-short", lang.codeShort || "");

                div.innerHTML =
                    '<span>' +
                    escapeHtml(lang.name) +
                    "</span>" +
                    (selected[dropId] === lang.name
                        ? '<svg class="check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'
                        : "");
                div.addEventListener("click", function () {
                    pickLang(dropId, lang.name);
                });
                drop.appendChild(div);
            });
        }

        function toggleDropdown(dropId: string, btnId: string): void {
            buildDropdown(dropId);
            const drop = document.getElementById(dropId);
            const btn = document.getElementById(btnId);
            if (!drop || !btn) return;
            const isOpen = drop.classList.contains("open");
            closeAllLangDropdowns();
            if (!isOpen) {
                drop.classList.add("open");
                btn.classList.add("open");
            }
        }

        function closeAllLangDropdowns(): void {
            document
                .querySelectorAll<HTMLElement>(".flag-dropdown")
                .forEach((d) => d.classList.remove("open"));
            document
                .querySelectorAll<HTMLElement>(".flag-select-btn")
                .forEach((b) => b.classList.remove("open"));
        }

        function pickLang(dropId: string, name: string): void {
            selected[dropId] = name;

            if (dropId === "drop-s-lang") {
                // Single Language dropdown
                const t = document.getElementById("btn-s-lang-text");
                if (t) {
                    t.textContent = name;
                }

                // Update Primary Language card
                const primaryText = document.getElementById("vs-primary");
                if (primaryText) {
                    primaryText.textContent = name;
                }

                // Update Dual Language → Primary Language
                const dualPrimaryText = document.getElementById("vd-primary");
                if (dualPrimaryText) {
                    dualPrimaryText.textContent = name;
                }

                setSelectedPrimaryLanguage(name);
            } else {
                // Dual Language → Secondary Language
                const t = document.getElementById("btn-d-sec-text");
                if (t) {
                    t.textContent = name;
                }

                // Update Dual Language → Secondary Language card
                const secondaryText = document.getElementById("vd-secondary");
                if (secondaryText) {
                    secondaryText.textContent = name;
                }

                setSelectedSecondaryLanguage(name);
            }

            closeAllLangDropdowns();
        }

        function showEdit(): void {
            document.getElementById("view-single")?.classList.add("hidden");
            document.getElementById("view-dual")?.classList.add("hidden");
            document.getElementById("edit-state")?.classList.remove("hidden");

            const isRtl = savedSettings?.MenuDirection === 1;
            const sDirRtl = document.querySelector<HTMLInputElement>('input[name="s-dir"][value="rtl"]');
            const sDirLtr = document.querySelector<HTMLInputElement>('input[name="s-dir"][value="ltr"]');
            if (sDirRtl && sDirLtr) {
                sDirRtl.checked = isRtl;
                sDirLtr.checked = !isRtl;
            }

            const dDirRtl = document.querySelector<HTMLInputElement>('input[name="d-dir"][value="rtl"]');
            const dDirLtr = document.querySelector<HTMLInputElement>('input[name="d-dir"][value="ltr"]');
            if (dDirRtl && dDirLtr) {
                dDirRtl.checked = isRtl;
                dDirLtr.checked = !isRtl;
            }

            const dispVal = savedSettings?.Display_menu;
            const dDispPrimary = document.querySelector<HTMLInputElement>('input[name="d-display"][value="primary"]');
            const dDispSecondary = document.querySelector<HTMLInputElement>('input[name="d-display"][value="secondary"]');
            const dDispBoth = document.querySelector<HTMLInputElement>('input[name="d-display"][value="both"]');

            if (dDispPrimary && dDispSecondary && dDispBoth) {
                dDispPrimary.checked = dispVal === 1;
                dDispSecondary.checked = dispVal === 2;
                dDispBoth.checked = dispVal !== 1 && dispVal !== 2;
            }
        }

        function cancelEdit(): void {
            document.getElementById("edit-state")?.classList.add("hidden");
            if (currentMode === "single") {
                document.getElementById("view-single")?.classList.remove("hidden");
                document.getElementById("view-dual")?.classList.add("hidden");
            } else {
                document.getElementById("view-single")?.classList.add("hidden");
                document.getElementById("view-dual")?.classList.remove("hidden");
            }
        }

        function switchTab(tab: string): void {
            currentMode = tab;
            const isSingle = tab === "single";
            document.getElementById("tab-single")?.classList.toggle("active", isSingle);
            document.getElementById("tab-dual")?.classList.toggle("active", !isSingle);
            document
                .getElementById("panel-single")
                ?.classList.toggle("hidden", !isSingle);
            document
                .getElementById("panel-dual")
                ?.classList.toggle("hidden", isSingle);
        }


        // ── Outer sidebar switching ──
        const menuItems = document.querySelectorAll<HTMLElement>(".menu-item");
        const submenuGroups = document.querySelectorAll<HTMLElement>(".submenu-group");
        const menuItemHandlers: Array<{ el: HTMLElement; fn: () => void }> = [];
        menuItems.forEach((item) => {
            const fn = function (this: HTMLElement) {
                menuItems.forEach((m) => m.classList.remove("active"));
                item.classList.add("active");
                submenuGroups.forEach((g) => g.classList.remove("active"));
                const targetId = item.getAttribute("data-target");
                if (targetId) {
                    const targetMenu = document.getElementById(targetId);
                    if (targetMenu) {
                        targetMenu.classList.add("active");
                        const firstSubItem =
                            targetMenu.querySelector<HTMLElement>(".submenu-item");
                        if (firstSubItem) {
                            document
                                .querySelectorAll<HTMLElement>(".submenu-item")
                                .forEach((s) => s.classList.remove("active"));
                            firstSubItem.classList.add("active");
                        }
                    }
                }
            };
            item.addEventListener("click", fn);
            menuItemHandlers.push({ el: item, fn });
        });

        const subItemHandlers: Array<{ el: HTMLElement; fn: (e: Event) => void }> = [];
        document.querySelectorAll<HTMLElement>(".submenu-item").forEach((item) => {
            const fn = function (this: HTMLElement, e: Event) {
                e.preventDefault();
                document
                    .querySelectorAll<HTMLElement>(".submenu-item")
                    .forEach((s) => s.classList.remove("active"));
                item.classList.add("active");
            };
            item.addEventListener("click", fn);
            subItemHandlers.push({ el: item, fn });
        });

        // ── Header view dropdown ──
        const onDocClickHeader = function () {
            document.getElementById("headerViewDropdown")?.classList.remove("show");
        };
        document.addEventListener("click", onDocClickHeader);

        // ── Language dropdown outside-click ──
        const onDocClickLang = function (e: MouseEvent) {
            const target = e.target as HTMLElement | null;
            if (!target?.closest(".flag-select-wrap")) closeAllLangDropdowns();
        };
        document.addEventListener("click", onDocClickLang);

        // Wire flag-select buttons
        const btnSLang = document.getElementById("btn-s-lang");
        const onBtnSLang = () => toggleDropdown("drop-s-lang", "btn-s-lang");
        btnSLang?.addEventListener("click", onBtnSLang);

        const btnDSec = document.getElementById("btn-d-sec");
        const onBtnDSec = () => toggleDropdown("drop-d-sec", "btn-d-sec");
        btnDSec?.addEventListener("click", onBtnDSec);

        // Wire EDIT buttons
        const editBtns = document.querySelectorAll<HTMLElement>(".js-edit-btn");
        const onEdit = () => showEdit();
        editBtns.forEach((b) => b.addEventListener("click", onEdit));

        // Wire tabs
        const tabSingle = document.getElementById("tab-single");
        const onTabSingle = () => switchTab("single");
        tabSingle?.addEventListener("click", onTabSingle);
        const tabDual = document.getElementById("tab-dual");
        const onTabDual = () => switchTab("dual");
        tabDual?.addEventListener("click", onTabDual);

        // Wire save / cancel
        const saveBtn = document.getElementById("btn-save");
        const onSave = (e: Event) => { handleSave(e); };
        saveBtn?.addEventListener("click", onSave);
        const cancelBtn = document.getElementById("btn-cancel-edit");
        const onCancel = () => cancelEdit();
        cancelBtn?.addEventListener("click", onCancel);

        return () => {
            menuItemHandlers.forEach(({ el, fn }) =>
                el.removeEventListener("click", fn)
            );
            subItemHandlers.forEach(({ el, fn }) =>
                el.removeEventListener("click", fn)
            );
            document.removeEventListener("click", onDocClickHeader);
            document.removeEventListener("click", onDocClickLang);
            btnSLang?.removeEventListener("click", onBtnSLang);
            btnDSec?.removeEventListener("click", onBtnDSec);
            editBtns.forEach((b) => b.removeEventListener("click", onEdit));
            tabSingle?.removeEventListener("click", onTabSingle);
            tabDual?.removeEventListener("click", onTabDual);
            saveBtn?.removeEventListener("click", onSave);
            cancelBtn?.removeEventListener("click", onCancel);
        };
    }, [languages, selectedPrimaryLanguage, selectedSecondaryLanguage, savedSettings]);

    const primaryLangDisplay = selectedPrimaryLanguage || savedSettings?.primary_language_name || savedSettings?.Primary_language || (languages[0]?.lang_name ?? "");
    const secondaryLangDisplay = selectedSecondaryLanguage || savedSettings?.secondary_language_name || savedSettings?.Secondary_language || (languages[1]?.lang_name ?? languages[0]?.lang_name ?? "");

    const isDualMode = savedSettings?.type_of_menu === 2;

    const displayMenuTextMap: Record<number, string> = {
        1: "Primary Language Only",
        2: "Secondary Language Only",
        3: "Display Both Language",
    };

    const displayMenuText = displayMenuTextMap[savedSettings?.Display_menu ?? 3] ?? "Display Both Language";
    const directionText = savedSettings?.MenuDirection === 1 ? "Right To Left" : "Left To Right";

    return (
        <div id="pg-menu-menu-language-page">
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />

            {/* App Container */}
            <div className="app-container">
                {/* Main Content: Menu Language Page */}
                <div className="main-content">
                    {loading && (
                        <div style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>
                            Loading menu languages...
                        </div>
                    )}
                    {!loading && error && (
                        <div style={{ padding: "16px 24px", color: "#e53e3e", fontSize: "14px", fontWeight: 500 }}>
                            {error}
                        </div>
                    )}
                    {/* VIEW: SINGLE */}
                    <div id="view-single" className={`section-card ${isDualMode ? "hidden" : ""}`}>
                        <div className="section-card-header">
                            <div>
                                <h1 className="typ-page-heading" style={{ margin: 0 }}>Menu Language</h1>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--text-secondary)",
                                        marginTop: "4px",
                                    }}
                                >
                                    Single Menu Language
                                </div>
                            </div>
                            <button className="btn-help">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                HELP
                            </button>
                        </div>
                        <div className="lang-row">
                            <div className="lang-card">
                                <div className="lc-label">Primary Language</div>
                                <div className="lc-value">
                                    <span id="vs-primary">{primaryLangDisplay}</span>
                                </div>
                            </div>
                            <div className="lang-card">
                                <div className="lc-label">Menu Direction</div>
                                <div className="lc-value" id="vs-direction">
                                    {directionText}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary js-edit-btn">EDIT</button>
                    </div>
                    {/* VIEW: DUAL */}
                    <div id="view-dual" className={`section-card ${isDualMode ? "" : "hidden"}`}>
                        <div className="section-card-header">
                            <div>
                                <h1 className="typ-page-heading" style={{ margin: 0 }}>Menu Language</h1>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--text-secondary)",
                                        marginTop: "4px",
                                    }}
                                >
                                    Dual Menu Language
                                </div>
                            </div>
                            <button className="help-btn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                </svg>
                                HELP
                            </button>
                        </div>
                        <div className="lang-row">
                            <div className="lang-card">
                                <div className="lc-label">Primary Language</div>
                                <div className="lc-value">
                                    <span id="vd-primary">{primaryLangDisplay}</span>
                                </div>
                            </div>
                            <div className="lang-card">
                                <div className="lc-label">Secondary Language</div>
                                <div className="lc-value">
                                    <span id="vd-secondary">{secondaryLangDisplay}</span>
                                </div>
                            </div>
                            <div className="lang-card">
                                <div className="lc-label">Display Menu</div>
                                <div className="lc-value" id="vd-display">
                                    {displayMenuText}
                                </div>
                            </div>
                            <div className="lang-card">
                                <div className="lc-label">Menu Direction</div>
                                <div className="lc-value" id="vd-direction">
                                    {directionText}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary js-edit-btn">EDIT</button>
                    </div>

                    {/* EDIT STATE */}
                    <div id="edit-state" className="section-card hidden">
                        <div className="section-card-header">
                            <h1 className="typ-page-heading" style={{ margin: 0 }}>Menu Language</h1>
                            <button className="help-btn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                </svg>
                                HELP
                            </button>
                        </div>

                        <div className="tab-row">
                            <button className={`tab ${!isDualMode ? "active" : ""}`} id="tab-single">
                                Single Language
                            </button>
                            <button className={`tab ${isDualMode ? "active" : ""}`} id="tab-dual">
                                Dual Language
                            </button>
                        </div>

                        {/* SINGLE PANEL */}
                        <div id="panel-single" className={isDualMode ? "hidden" : ""}>
                            <div className="field">
                                <label>Menu Language</label>
                                <div className="flag-select-wrap">
                                    <div className="flag-select-btn" id="btn-s-lang">
                                        <span id="btn-s-lang-text">{primaryLangDisplay}</span>
                                        <svg className="chevron" viewBox="0 0 24 24">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    <div className="flag-dropdown" id="drop-s-lang"></div>
                                </div>
                            </div>
                            <div className="field">
                                <label>Menu Direction</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input type="radio" name="s-dir" value="rtl" defaultChecked={savedSettings?.MenuDirection === 1} /> Right To
                                        Left
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="s-dir"
                                            value="ltr"
                                            defaultChecked={savedSettings?.MenuDirection !== 1}
                                        />{" "}
                                        Left To Right
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* DUAL PANEL */}
                        <div id="panel-dual" className={isDualMode ? "" : "hidden"}>
                            <div className="dual-lang-row">
                                <div className="field" style={{ flex: 1 }}>
                                    <label>Primary Language</label>

                                    <div className="primary-lang-display">
                                        {primaryLangDisplay}
                                    </div>
                                </div>
                                <div className="field" style={{ flex: 1 }}>
                                    <label>Secondary Language</label>
                                    <div className="flag-select-wrap">
                                        <div className="flag-select-btn" id="btn-d-sec">
                                            <span id="btn-d-sec-text">{secondaryLangDisplay}</span>
                                            <svg className="chevron" viewBox="0 0 24 24">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                        <div className="flag-dropdown" id="drop-d-sec"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="dual-bottom-row">
                                <div className="field" style={{ flex: 1 }}>
                                    <label>Display Menu</label>
                                    <div className="radio-group col">
                                        <label className="radio-label">
                                            <input type="radio" name="d-display" value="primary" defaultChecked={savedSettings?.Display_menu === 1} />{" "}
                                            Primary Language Only
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="d-display"
                                                value="secondary"
                                                defaultChecked={savedSettings?.Display_menu === 2}
                                            />{" "}
                                            Secondary Language Only
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="d-display"
                                                value="both"
                                                defaultChecked={savedSettings?.Display_menu !== 1 && savedSettings?.Display_menu !== 2}
                                            />{" "}
                                            Both(Primary Language and Secondary Language)
                                        </label>
                                    </div>
                                </div>
                                <div className="field" style={{ flex: 1 }}>
                                    <label>Menu Direction</label>
                                    <div className="radio-group col">
                                        <label className="radio-label">
                                            <input type="radio" name="d-dir" value="rtl" defaultChecked={savedSettings?.MenuDirection === 1} /> Right To
                                            Left
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="d-dir"
                                                value="ltr"
                                                defaultChecked={savedSettings?.MenuDirection !== 1}
                                            />{" "}
                                            Left To Right
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="btn-row">
                            <button className="btn btn-primary" id="btn-save" onClick={handleSave}>
                                SAVE
                            </button>
                            <button className="btn btn-cancel" id="btn-cancel-edit">
                                CANCEL
                            </button>
                        </div>
                    </div>
                    <WizardFooter />
                </div>
                {/* /main-content */}
            </div>
            {/* /app-container */}
        </div>
    );
}
