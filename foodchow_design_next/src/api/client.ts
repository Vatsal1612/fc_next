import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "@/lib/token";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiError, AuthTokens } from "@/api/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5001/api";

// const FOODCHOW_BASE_URL =
//   process.env.NEXT_PUBLIC_FOODCHOW_API_URL ?? "https://api.foodchow.com/api";
const FOODCHOW_BASE_URL =
  process.env.NEXT_PUBLIC_FOODCHOW_API_URL ?? "https://api.foodchow.com/api";

const FOODCHOW_REPORTS_BASE_URL =
  process.env.NEXT_PUBLIC_FOODCHOW_REPORTS_API_URL ??
  "https://api.foodchow.com/api";

const FOODCHOW_WD_BASE_URL =
  process.env.NEXT_PUBLIC_FOODCHOW_WD_API_URL ??
  "https://admin.foodchow.com/api";
/** Pre-configured Axios instance shared by every service. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});



//tax 
export const adminFoodchowClient = axios.create({
  baseURL: "https://admin.foodchow.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Axios instance for the public FoodChow API (api.foodchow.com).
 * No auth interceptors — these endpoints are public.
 */
export const foodchowClient: AxiosInstance = axios.create({
  baseURL: FOODCHOW_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export const foodchowRMSClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_FOODCHOW_RMS_API_URL ??
    "https://api.foodchow.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});



export const foodchowWDClient: AxiosInstance = axios.create({
  baseURL: FOODCHOW_WD_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

export const foodchowReportsClient: AxiosInstance = axios.create({
  baseURL: FOODCHOW_REPORTS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

/* ── Request interceptor: attach JWT bearer token ── */
const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const authInterceptorError = (error: AxiosError) => Promise.reject(error);

apiClient.interceptors.request.use(authInterceptor, authInterceptorError);
adminFoodchowClient.interceptors.request.use(authInterceptor, authInterceptorError);
foodchowClient.interceptors.request.use(authInterceptor, authInterceptorError);
foodchowRMSClient.interceptors.request.use(authInterceptor, authInterceptorError);
foodchowWDClient.interceptors.request.use(authInterceptor, authInterceptorError);
foodchowReportsClient.interceptors.request.use(authInterceptor, authInterceptorError);

/* ── Response interceptor: normalise errors + refresh-token flow ── */
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null): void => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Attempt a single silent refresh on 401.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clear();
        return Promise.reject(normaliseError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(normaliseError(error));
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post<AuthTokens>(
          `${BASE_URL}${ENDPOINTS.auth.refresh}`,
          { refreshToken }
        );
        tokenStorage.setAccessToken(data.accessToken);
        tokenStorage.setRefreshToken(data.refreshToken);
        flushQueue(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(null);
        tokenStorage.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normaliseError(error));
  }
);

/** Convert an AxiosError into the app's normalised ApiError shape. */
export function normaliseError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return {
      message: error.response.data.message ?? error.message,
      statusCode: error.response.status,
      errors: error.response.data.errors,
    };
  }
  return {
    message: error.message || "Network error",
    statusCode: error.response?.status ?? 0,
  };
}
