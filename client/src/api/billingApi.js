import apiClient from "./apiClient";

export const getBillingUsage = async () => {
  const response = await apiClient.get("/billing/usage");
  return response.data;
};