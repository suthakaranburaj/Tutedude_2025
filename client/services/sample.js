import { apiClient } from "@/helper/commonHelper";

export const getTrendingProducts = async () => {
  const response = await apiClient.get("/product/trend");
  return response.data;
};

export const add_feedback = (data) => {
  return apiClient.post("/feedback/save", data);
};

export const save_user_service = asyncHandler(async (payload) => {
  return await apiClient.post(`${AUTH}/save`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
});