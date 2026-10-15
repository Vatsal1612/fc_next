"use client";

import { useEffect, useState } from "react";
import {
  menuService,
  type SupportedLanguageForShop,
} from "@/api/services/menu.service";
import { useShopId } from "@/utils/shop";
import Swal from "sweetalert2";
import { LanguageIcon } from "./LanguageIcon";
import styles from "./SupportedLanguagesModal.module.css";

interface SupportedLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportedLanguagesModal({
  isOpen,
  onClose,
}: SupportedLanguagesModalProps) {
  const shopId = useShopId();
  const [loading, setLoading] = useState<boolean>(true);
  const [languages, setLanguages] = useState<SupportedLanguageForShop[]>([]);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  const loadShopLanguages = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const res = await menuService.getSupportedLanguageForShop(shopId);
      setLanguages(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load supported languages for shop:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadShopLanguages();
    }
  }, [isOpen, shopId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          setLanguages((prev) =>
            prev.map((l) => (l.id === lang.id ? { ...l, entry_exists: "true" } : l))
          );
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `${lang.lang_name} enabled!`,
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
          setLanguages((prev) =>
            prev.map((l) => (l.id === lang.id ? { ...l, entry_exists: "false" } : l))
          );
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: `${lang.lang_name} disabled!`,
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
        setLanguages((prev) =>
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

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <h2>
              <LanguageIcon size={22} />
              Change Languages
            </h2>
            <p>Select languages supported by your restaurant and set your default language.</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
              Loading supported languages...
            </div>
          ) : languages.length === 0 ? (
            <div className={styles.loadingWrap}>No languages found.</div>
          ) : (
            <div className={styles.languageGrid}>
              {languages.map((lang) => {
                const isDefault = lang.is_default_language === "1";
                const isChecked = lang.entry_exists === "true" || isDefault;
                const busy = actionInProgressId === lang.id;

                return (
                  <div
                    key={lang.id}
                    className={`${styles.languageCard} ${isChecked ? styles.activeCard : ""}`}
                  >
                    <div className={styles.languageInfo}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDefault || busy}
                          onChange={() => handleToggleLanguage(lang)}
                        />
                      </label>
                      <p className={styles.languageName}>{lang.lang_name}</p>
                    </div>

                    <div>
                      {isDefault ? (
                        <span className={styles.defaultBadge}>DEFAULT</span>
                      ) : isChecked ? (
                        <button
                          type="button"
                          className={styles.setDefaultBtn}
                          disabled={busy}
                          onClick={() => handleSetDefault(lang)}
                        >
                          {busy ? "..." : "Set as Default"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
