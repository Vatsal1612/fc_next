"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils";
import styles from "./shell.module.css";

const VIEW_OPTIONS = ["View", "Webpage", "Order Online Page"] as const;

interface HeaderProps {
  onToggleSidebar: () => void;
}

/**
 * Top header bar. Mirrors index.html exactly: brand + hamburger, headset button,
 * View dropdown, HELP button and My Profile button. The original inline JS
 * (toggleDropdown / selectViewOption / openHelpModal) is reimplemented as React
 * state to avoid direct DOM manipulation and hydration issues.
 */
export function Header({ onToggleSidebar }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string>("View");

  // Close the dropdown on any outside click (matches the original window click handler).
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [dropdownOpen]);

  const openHelpModal = () => {
    window.alert("Help & Support");
  };

  return (
    <header className={styles.header} suppressHydrationWarning>
      <div className={styles.headerLeft} suppressHydrationWarning>
        <div className={styles.brand} suppressHydrationWarning>
          <button className={styles.hamburger} onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <i className="fas fa-bars" />
          </button>
          ADMIN
        </div>
      </div>
      <div className={styles.headerRight} style={{ gap: "12px" }} suppressHydrationWarning>
        <button className={styles.btnSolid}>
          <i className="fas fa-headset" />
        </button>

        <div className={styles.topbarDropdown}>
          <button
            className={styles.btnOutlineTeal}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((open) => !open);
            }}
          >
            <span>{selectedView}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: "11px" }} />
          </button>
          <div className={cn(styles.dropdownMenu, dropdownOpen && styles.show)}>
            {VIEW_OPTIONS.map((option) => (
              <a
                key={option}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedView(option);
                  setDropdownOpen(false);
                }}
              >
                {option}
              </a>
            ))}
          </div>
        </div>

        <button className="btn-common-help" onClick={openHelpModal}>
          <i className="far fa-question-circle" /> HELP
        </button>

        <button className={styles.btnSolid}>
          <i className="far fa-user-circle" />
          My Profile
        </button>
      </div>
    </header>
  );
}
