/** Role-based access control roles. Extend to match the backend's claims. */
export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** App route paths, grouped by section. Single source of truth for navigation. */
export const ROUTES = {
  setup: {
    myProfile: "/setup/my-profile",
    restaurantLogo: "/setup/restaurant-logo",
    restaurantImages: "/setup/restaurant-images",
    timings: "/setup/timings",
    delivery: "/setup/delivery",
    addTable: "/setup/add-table",
    gallery: "/setup/gallery",
    ambience: "/setup/ambience",
    facility: "/setup/facility",
    addCustomDomain: "/setup/add-custom-domain",
  },
} as const;
