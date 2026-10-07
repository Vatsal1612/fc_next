import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export interface LookupItem {
  id: number;
  name: string;
  code: string;
}

/** Common lookup service (countries, currencies, timezones, etc.). */
export const commonService = {
  async countries(): Promise<LookupItem[]> {
    const { data } = await apiClient.get<LookupItem[]>(
      ENDPOINTS.common.countries
    );
    return data;
  },
  async currencies(): Promise<LookupItem[]> {
    const { data } = await apiClient.get<LookupItem[]>(
      ENDPOINTS.common.currencies
    );
    return data;
  },
  async timezones(): Promise<LookupItem[]> {
    const { data } = await apiClient.get<LookupItem[]>(
      ENDPOINTS.common.timezones
    );
    return data;
  },
};
