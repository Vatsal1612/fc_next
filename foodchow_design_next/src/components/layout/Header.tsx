"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/utils";
import { restaurantService } from "@/api/services/setup.service";
import styles from "./shell.module.css";

const HELP_VIDEOS: Record<string, string> = {
  "/setup/delivery": "https://vimeo.com/1075943475",
  "/menu/item-code": "https://vimeo.com/1075945406",
  "/menu/category": "https://vimeo.com/1075943159",
  "/setup/my-profile": "https://vimeo.com/1075943230",
  "/setup/restaurant-logo": "https://vimeo.com/1075943601",
  "/setup/category-item-view": "https://vimeo.com/1075945245",
  "/setup/restaurant-image": "https://vimeo.com/1075943416", // FoodGallery
  "/setup/timings": "https://vimeo.com/1075943517", // ShopTimings
  "/setup/payment-gateway": "https://vimeo.com/1075943559", // ShopOverview ? (Maybe)
  "/menu/items": "https://vimeo.com/1075943647", // IngredientItems
};

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
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string>("View");
  const [subdomain, setSubdomain] = useState<string>("");

  // Resolve the logged-in shop's subdomain from the API (using session shop_id).
  useEffect(() => {
    const shopId = sessionStorage.getItem("shop_id");
    if (!shopId) return;

    // Drop legacy per-shop keys (subdomain_<id>) left by earlier builds.
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("subdomain_") && k !== "subdomain_for")
      .forEach((k) => sessionStorage.removeItem(k));

    // Reuse the cached subdomain only if it belongs to the current shop.
    const cached = sessionStorage.getItem("subdomain");
    if (cached && sessionStorage.getItem("subdomain_for") === shopId) {
      setSubdomain(cached);
      return;
    }

    restaurantService
      .getRestaurantInformation(Number(shopId))
      .then((info) => {
        const sub = info?.subdomain?.trim();
        if (sub) {
          sessionStorage.setItem("subdomain", sub);
          sessionStorage.setItem("subdomain_for", shopId);
          setSubdomain(sub);
        }
      })
      .catch((err) => console.error("Failed to load subdomain:", err));
  }, []);

  // Close the dropdown on any outside click (matches the original window click handler).
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [dropdownOpen]);

  const openHelpModal = () => {
    // Find matching video or fallback to the live dashboard help
    const videoUrl = HELP_VIDEOS[pathname] || "https://vimeo.com/1075945406";
    window.open(videoUrl, "_blank");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.brand}>
          <button className={styles.hamburger} onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <i className="fas fa-bars" />
          </button>
          ADMIN
        </div>
      </div>
      <div className={styles.headerRight} style={{ gap: "12px" }}>
        <button className={styles.btnSolid} onClick={() => router.push('/support/ticket')}>
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

                  if (option === "View") return;
                  if (!subdomain) {
                    window.alert("Restaurant subdomain not available yet. Please try again.");
                    return;
                  }

                  if (option === "Webpage") {
                    window.open(`https://www.foodchow.com/${subdomain}`, "_blank");
                  } else if (option === "Order Online Page") {
                    window.open(`https://${subdomain}.foodchow.com/order-online`, "_blank");
                  }
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

        <button className={styles.btnSolid} onClick={() => router.push("/setup/my-profile")}>
          <i className="far fa-user-circle" />
          My Profile
        </button>
      </div>
    </header>
  );
}
