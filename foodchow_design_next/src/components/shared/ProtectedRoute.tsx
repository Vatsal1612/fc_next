// "use client";

// import { useEffect, type ReactNode } from "react";
// import { useRouter } from "next/navigation";
// import { tokenStorage } from "@/lib/token";
// import type { Role } from "@/constants";

// interface ProtectedRouteProps {
//   children: ReactNode;
//   /** Optional list of roles allowed to view the route. */
//   allowedRoles?: Role[];
//   /** Current user's role; wire from useAuth() once auth is live. */
//   userRole?: Role;
//   redirectTo?: string;
// }

// /**
//  * Client-side route guard (structure/example only). Replace the token check
//  * with the real session source when authentication is implemented.
//  */
// export function ProtectedRoute({
//   children,
//   allowedRoles,
//   userRole,
//   redirectTo = "/login",
// }: ProtectedRouteProps) {
//   const router = useRouter();

//   useEffect(() => {
//     const hasToken = !!tokenStorage.getAccessToken();
//     const roleAllowed =
//       !allowedRoles || (userRole ? allowedRoles.includes(userRole) : false);

//     if (!hasToken || !roleAllowed) {
//       router.replace(redirectTo);
//     }
//   }, [allowedRoles, userRole, redirectTo, router]);

//   return <>{children}</>;
// }



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;

  return <>{children}</>;
}