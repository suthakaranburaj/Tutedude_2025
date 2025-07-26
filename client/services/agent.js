import { apiClient } from "@/helper/commonHelper";

export const getAllInventoryItems = async () => {
  const response = await apiClient.get('/agent/get-all-items');
  return response.data;
};

export const verifyInventoryItem = async (formData) => {
  return apiClient.post('/agent/verify-inventory-item', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};