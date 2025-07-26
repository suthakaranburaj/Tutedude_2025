import { apiClient } from "@/helper/commonHelper";

export const addInventoryItem = async (payload) => {
  const response = await apiClient.post("/supplier/inventory", payload);
  return response.data;
};
