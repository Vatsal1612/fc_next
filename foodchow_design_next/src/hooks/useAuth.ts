// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { authService } from "@/api/services/auth.service";
// import { tokenStorage } from "@/lib/token";
// import type { LoginRequest } from "@/api/types";

// /**
//  * Auth hook (structure/example only). Provides login/logout mutations and the
//  * current user query. Business rules belong in the backend.
//  */
// export function useAuth<TUser = unknown>() {
//   const queryClient = useQueryClient();

//   const userQuery = useQuery({
//     queryKey: ["auth", "me"],
//     queryFn: () => authService.me<TUser>(),
//     enabled: !!tokenStorage.getAccessToken(),
//     retry: false,
//   });

//   const loginMutation = useMutation({
//     mutationFn: (payload: LoginRequest) => authService.login(payload),
//     onSuccess: () => {
//       void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
//     },
//   });

//   const logoutMutation = useMutation({
//     mutationFn: () => authService.logout(),
//     onSuccess: () => {
//       queryClient.clear();
//     },
//   });

//   return {
//     user: userQuery.data,
//     isLoadingUser: userQuery.isLoading,
//     isAuthenticated: !!userQuery.data,
//     login: loginMutation.mutate,
//     isLoggingIn: loginMutation.isPending,
//     logout: logoutMutation.mutate,
//   };
// }


"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/api/services/auth.service";
import type { LoginRequest } from "@/api/types";

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current logged-in user info from localStorage
  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.me(),
    enabled: true,
    retry: false,
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      authService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    isAuthenticated: userQuery.data?.isLoggedIn ?? false,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}