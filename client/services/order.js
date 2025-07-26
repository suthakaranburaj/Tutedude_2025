import { apiClient } from "@/helper/commonHelper";

// Create a new order
export const createOrder = async (payload) => {
  const response = await apiClient.post("/order", payload);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (payload) => {
  const response = await apiClient.put(`/order/${payload.id}`, { status: payload.status });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await apiClient.get(`/order/${orderId}`);
  return response.data;
};

// Get vendor orders
export const getVendorOrders = async (queryParams = {}) => {
  const response = await apiClient.get("/order/vendor", {
    params: queryParams,
  });
  return response.data;
};

// Get supplier orders
export const getSupplierOrders = async (queryParams = {}) => {
  const response = await apiClient.get("/order/supplier", {
    params: queryParams,
  });
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await apiClient.put(`/order/${orderId}/cancel`);
  return response.data;
};
