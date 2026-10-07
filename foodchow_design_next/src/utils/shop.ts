import { useState, useEffect } from "react";

/**
 * Reads the current shop ID from sessionStorage or localStorage.
 * Returns 0 if not set or invalid (no hardcoded fallback).
 */
export function getShopId(defaultShopId = 0): number {
  if (typeof window === "undefined") return defaultShopId;
  try {
    const stored =
      sessionStorage.getItem("shop_id") ||
      localStorage.getItem("shop_id") ||
      sessionStorage.getItem("shopId") ||
      localStorage.getItem("shopId");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading shop_id from storage:", error);
  }
  return defaultShopId;
}

/**
 * Sets the shop ID in sessionStorage and localStorage and dispatches a change event
 * so all active components update dynamically.
 */
export function setShopId(newShopId: number | string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("shop_id", String(newShopId));
    localStorage.setItem("shop_id", String(newShopId));
    window.dispatchEvent(new Event("shop_id_changed"));
  }
}

/**
 * Custom hook that listens to sessionStorage/localStorage changes (cross-tab via 'storage'
 * and same-tab via 'shop_id_changed' / 'focus') and returns the active shop ID dynamically.
 */
export function useShopId(defaultShopId = 0): number {
  const [shopId, setShopIdState] = useState<number>(() => getShopId(defaultShopId));

  useEffect(() => {
    const updateShopId = () => {
      const current = getShopId(defaultShopId);
      setShopIdState((prev) => (prev !== current ? current : prev));
    };

    // Initial check
    updateShopId();

    window.addEventListener("storage", updateShopId);
    window.addEventListener("shop_id_changed", updateShopId);
    window.addEventListener("focus", updateShopId);

    return () => {
      window.removeEventListener("storage", updateShopId);
      window.removeEventListener("shop_id_changed", updateShopId);
      window.removeEventListener("focus", updateShopId);
    };
  }, [defaultShopId]);

  return shopId;
}

/**
 * Inspects a real FoodChow API response to determine success or failure
 * without assuming any single rigid response property name.
 */
export function isApiSuccess(response: any): boolean {
  if (!response) return false;

  // Direct boolean success flags
  if (response.success === true || response.status === true) return true;

  // Standard response codes (1 or 200)
  if (
    response.response_code === "1" ||
    response.response_code === 1 ||
    response.responseCode === 1 ||
    response.responseCode === 200
  ) {
    return true;
  }

  // String response checking
  if (typeof response === "string") {
    const lower = response.toLowerCase();
    if (lower.includes("success") || lower.includes("applied") || lower.includes("true")) {
      return true;
    }
  }

  // Message field checks
  if (typeof response.message === "string") {
    const msg = response.message.toLowerCase();
    if (
      msg.includes("success") ||
      msg.includes("applied") ||
      msg.includes("updated") ||
      msg.includes("added")
    ) {
      return true;
    }
  }

  // Fallback: If no explicit failure indicator (false / "0" / 0) is returned
  if (
    response.success !== false &&
    response.status !== false &&
    response.response_code !== "0" &&
    response.responseCode !== 0
  ) {
    return true;
  }

  return false;
}
