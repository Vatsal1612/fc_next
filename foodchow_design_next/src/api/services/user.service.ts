import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { PaginatedResponse } from "@/api/types";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

/** User service — example CRUD wiring for the admin users module. */
export const userService = {
  async list(
    pageNumber = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
      ENDPOINTS.users.list,
      { params: { pageNumber, pageSize } }
    );
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<User>(ENDPOINTS.users.byId(id));
    return data;
  },
};
