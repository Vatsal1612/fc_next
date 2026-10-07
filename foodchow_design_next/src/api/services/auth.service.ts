// import { apiClient } from "@/api/client";
// import { ENDPOINTS } from "@/api/endpoints";
// import { tokenStorage } from "@/lib/token";
// import type { AuthTokens, LoginRequest } from "@/api/types";

// /**
//  * Authentication service. Structure + examples only — wire real DTOs to the
//  * ASP.NET Core auth controller when integrating.
//  */
// export const authService = {
//   async login(payload: LoginRequest): Promise<AuthTokens> {
//     const { data } = await apiClient.post<AuthTokens>(
//       ENDPOINTS.auth.login,
//       payload
//     );
//     tokenStorage.setAccessToken(data.accessToken);
//     tokenStorage.setRefreshToken(data.refreshToken);
//     return data;
//   },

//   async logout(): Promise<void> {
//     try {
//       await apiClient.post(ENDPOINTS.auth.logout);
//     } finally {
//       tokenStorage.clear();
//     }
//   },

//   async me<TUser>(): Promise<TUser> {
//     const { data } = await apiClient.get<TUser>(ENDPOINTS.auth.me);
//     return data;
//   },
// };



import { foodchowClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { tokenStorage } from "@/lib/token";
import type { LoginRequest, LoginResponse } from "@/api/types";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await foodchowClient.get<LoginResponse>(
      ENDPOINTS.auth.login,
      {
        params: {
          email_id: payload.email,
          pwd: payload.password,
          // device_type: 2,
          // device_id: "1234",
          login_datetime: today,
        },
      }
    );

    console.log("API Response =>", data);

    // Save JWT token if the backend provided it to resolve IDOR
    const token = data.token || data.jwt || (data.result && data.result.token) || (data.data && data.data[0] && data.data[0].token);
    if (token) {
      tokenStorage.setAccessToken(token);
    }

    return data;
  },
  logout() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("shop_id");
    sessionStorage.removeItem("subdomain");
    sessionStorage.removeItem("subdomain_for");
  },
  async me() {
    return {
      isLoggedIn: sessionStorage.getItem("isLoggedIn") === "true",
      shop_id: sessionStorage.getItem("shop_id"),
    };
  },
};