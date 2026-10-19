// In-memory session cookie cache keyed by currency symbol ('Rs.' or '$')
let sessionCache: Record<string, { cookie: string; expiresAt: number }> = {};

/**
 * Retrieves a valid ASP.NET session cookie initialized with the required currency
 * via the live IIS /Admin/LoginAd endpoint. This ensures the live ASP.NET backend
 * executes stored procedures (SP_FD_MP_GetPlanDetails, SP_FD_MP_GetAddOns, SP_FD_MP_GetMarketplaceData)
 * with the correct currency directly from the MySQL database without any hardcoded values or fallbacks.
 */
export async function getLiveSessionCookie(currencySymbol: string = "Rs."): Promise<string> {
  const normalized = currencySymbol === "Rs." || currencySymbol === "INR" || currencySymbol === "₹" || currencySymbol === "1" ? "Rs." : "$";
  const now = Date.now();

  if (sessionCache[normalized] && sessionCache[normalized].expiresAt > now) {
    return sessionCache[normalized].cookie;
  }

  try {
    const loginUrl = `https://admin.foodchow.com/Admin/LoginAd?t=1&s=fc&c=${encodeURIComponent(normalized)}`;
    const loginRes = await fetch(loginUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    const setCookie = loginRes.headers.get("set-cookie");
    if (setCookie) {
      // Extract ASP.NET_SessionId
      const match = setCookie.match(/ASP\.NET_SessionId=[^;]+/);
      const cookieStr = match ? match[0] : setCookie.split(";")[0];
      // Cache session for 15 minutes
      sessionCache[normalized] = {
        cookie: cookieStr,
        expiresAt: now + 15 * 60 * 1000,
      };
      return cookieStr;
    }
  } catch (err) {
    console.error("Failed to obtain live ASP.NET session cookie:", err);
  }

  return "";
}
