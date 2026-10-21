import { NextResponse, type NextRequest } from "next/server";
import { PASCAL_TO_INTERNAL, INTERNAL_TO_PASCAL, LEGACY_TO_PASCAL } from "./utils/routes";

const ADMIN_MODULES = new Set(["reports", "orders", "marketing", "menu", "setup"]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignore static assets, api routes, next internal files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname === "/favicon.ico" ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.next();
  }

  const first = segments[0].toLowerCase();

  // If first segment is NOT an admin module, it is the restaurant slug (e.g. foodchowdemoindia)
  const isRestaurantPrefix = !ADMIN_MODULES.has(first);
  const restaurantSlug = isRestaurantPrefix ? segments[0] : "";
  const subSegments = isRestaurantPrefix ? segments.slice(1) : segments;

  if (isRestaurantPrefix && subSegments.length === 0) {
    // Restaurant root: /:restaurant -> rewrite to /setup/my-profile
    const url = new URL("/setup/my-profile" + search, request.url);
    return NextResponse.rewrite(url);
  }

  const subpath = "/" + subSegments.join("/");
  const subpathLower = subpath.toLowerCase();
  const cleanKey = subSegments.join("/").toLowerCase();

  // 1. Check legacy aliases that should REDIRECT to PascalCase
  if (LEGACY_TO_PASCAL[cleanKey]) {
    const targetPascal = LEGACY_TO_PASCAL[cleanKey];
    if (subpath !== targetPascal) {
      const targetUrl = (isRestaurantPrefix ? `/${restaurantSlug}` : "") + targetPascal + search;
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
  }

  // 2. Check if this is an internal kebab-case route that has a PascalCase equivalent
  // If user enters kebab-case (e.g. /foodchowdemoindia/reports/total-sales or /reports/total-sales)
  // redirect them to PascalCase (/foodchowdemoindia/reports/TotalSales or /reports/TotalSales)
  if (INTERNAL_TO_PASCAL[subpathLower] && subpath !== INTERNAL_TO_PASCAL[subpathLower]) {
    const targetPascal = INTERNAL_TO_PASCAL[subpathLower];
    const targetUrl = (isRestaurantPrefix ? `/${restaurantSlug}` : "") + targetPascal + search;
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 3. Check if the subpath is a PascalCase route (e.g. /reports/TotalSales)
  // Rewrite it to the physical internal route (e.g. /reports/total-sales)
  if (PASCAL_TO_INTERNAL[subpathLower]) {
    const physicalRoute = PASCAL_TO_INTERNAL[subpathLower] + search;
    return NextResponse.rewrite(new URL(physicalRoute, request.url));
  }

  // 4. If restaurant prefixed and standard module, rewrite /:restaurant/module/... to /module/...
  if (isRestaurantPrefix && subSegments.length > 0 && ADMIN_MODULES.has(subSegments[0].toLowerCase())) {
    const target = subpath + search;
    return NextResponse.rewrite(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

