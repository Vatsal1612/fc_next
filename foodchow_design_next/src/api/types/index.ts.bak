// /**
//  * Shared API types. Designed for an ASP.NET Core backend that returns a
//  * consistent envelope. Adjust the shape to match the real API contract.
//  */
// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
//   statusCode: number;
// }

// export interface ApiError {
//   message: string;
//   statusCode: number;
//   errors?: Record<string, string[]>;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   pageNumber: number;
//   pageSize: number;
//   totalCount: number;
//   totalPages: number;
// }

// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn: number;
// }

// export interface RefreshTokenRequest {
//   refreshToken: string;
// }


/**
 * Shared API types. Designed for an ASP.NET Core backend that returns a
 * consistent envelope. Adjust the shape to match the real API contract.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface LoginResponse {
  success: boolean;
  data: {
    shop_id: number;
    token?: string;
    jwt?: string;
  }[];
  message: string;
  responseCode: number;
  result: any;
  token?: string;
  jwt?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}