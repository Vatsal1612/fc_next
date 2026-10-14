import { useState, useEffect } from "react";
import { setupService } from "@/api/services/setup.service";
import { getShopId } from "@/utils/shop";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  isLoaded: boolean;
}

export function getCurrencySymbol(curr: string): string {
  const trimmed = (curr || "").trim();
  if (trimmed === "INR" || trimmed === "Rs." || trimmed === "Rs" || trimmed === "₹") {
    return "₹";
  } else if (trimmed === "USD" || trimmed === "$") {
    return "$";
  } else if (trimmed === "AUD") {
    return "A$";
  } else if (trimmed === "CAD") {
    return "C$";
  } else if (trimmed === "EUR" || trimmed === "€") {
    return "€";
  } else if (trimmed === "GBP" || trimmed === "£") {
    return "£";
  }
  return trimmed || "₹";
}

export function formatMoney(
  amount: number | string | null | undefined,
  currencyCodeOrSymbol: string = "INR",
  includeSymbol: boolean = true
): string {
  if (amount === undefined || amount === null || amount === "") {
    return includeSymbol ? `${getCurrencySymbol(currencyCodeOrSymbol)}0.00` : "0.00";
  }

  const num = Number(amount);
  if (isNaN(num)) {
    return includeSymbol ? `${getCurrencySymbol(currencyCodeOrSymbol)}0.00` : "0.00";
  }

  const isIndian =
    currencyCodeOrSymbol === "Rs." ||
    currencyCodeOrSymbol === "INR" ||
    currencyCodeOrSymbol === "₹";

  const formattedNum = num.toLocaleString(isIndian ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol ? `${getCurrencySymbol(currencyCodeOrSymbol)}${formattedNum}` : formattedNum;
}

/**
 * Hook to retrieve active currency from .NET session context
 * (sessionStorage 'shopcurrency', 'currency', or restaurant profile API).
 */
export function useSessionCurrency(): CurrencyInfo & {
  format: (amount: number | string | null | undefined, includeSymbol?: boolean) => string;
} {
  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("shopcurrency") ||
        sessionStorage.getItem("currency") ||
        localStorage.getItem("shopcurrency") ||
        localStorage.getItem("currency") ||
        ""
      );
    }
    return "";
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveCurrency() {
      if (typeof window === "undefined") return;

      let stored =
        sessionStorage.getItem("shopcurrency") ||
        sessionStorage.getItem("currency") ||
        localStorage.getItem("shopcurrency") ||
        localStorage.getItem("currency") ||
        "";

      if (!stored) {
        const shopId = getShopId();
        if (shopId > 0) {
          try {
            const info = await setupService.getRestaurantInformation(shopId);
            if (info?.currency) {
              stored = info.currency;
              sessionStorage.setItem("shopcurrency", stored);
              sessionStorage.setItem("currency", stored);
            }
          } catch (e) {
            console.error("Error retrieving currency from restaurant profile:", e);
          }
        }
      }

      if (isMounted) {
        if (stored) {
          setCurrency(stored.trim());
        }
        setIsLoaded(true);
      }
    }

    resolveCurrency();

    const handleStorageUpdate = () => {
      const current =
        sessionStorage.getItem("shopcurrency") ||
        sessionStorage.getItem("currency") ||
        localStorage.getItem("shopcurrency") ||
        localStorage.getItem("currency") ||
        "";
      if (current) {
        setCurrency(current.trim());
      }
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const activeCode = currency || "INR";
  const activeSymbol = getCurrencySymbol(activeCode);

  return {
    code: activeCode,
    symbol: activeSymbol,
    isLoaded,
    format: (amount, includeSymbol = true) => formatMoney(amount, activeCode, includeSymbol),
  };
}
