import { apiClient } from "@/helper/commonHelper";

// Create or update supplier profile
export const createOrUpdateSupplierProfile = async (payload) => {
  const response = await apiClient.post("/supplier/profile", payload);
  return response.data;
};

// Get supplier profile
export const getSupplierProfile = async () => {
  const response = await apiClient.get("/supplier/profile");
  return response.data;
};

// Add inventory item
export const addInventoryItem = async (payload) => {
  const response = await apiClient.post("/supplier/inventory", payload);
  return response.data;
};

// Update inventory item
export const updateInventoryItem = async (payload) => {
  const response = await apiClient.put("/supplier/inventory", payload);
  return response.data;
};

// Get inventory
export const getInventory = async () => {
  const response = await apiClient.get("/supplier/inventory");
  return response.data;
};

// Update delivery radius
export const updateDeliveryRadius = async (payload) => {
  const response = await apiClient.put("/supplier/delivery-radius", payload);
  return response.data;
};

// Get supplier dashboard stats
export const getSupplierDashboard = async () => {
  const response = await apiClient.get("/supplier/dashboard");
  return response.data;
};

// Get order history
export const getOrderHistory = async () => {
  const response = await apiClient.get("/supplier/orders");
  return response.data;
};

export const getAllSupplier = async () => {
  const response = await apiClient.get("/vendor/allSupplier");

  return response.data;
}

export const createOrder = async (payload) => {
  const response = await apiClient.post("/order", payload);
  return response.data;
}

export const Checkout = async (payload) => {
  const response = await apiClient.post("/order/checkout",payload);
  return response.data;
}

export const Verify = async (payload) => {
  const response = await apiClient.post("/order/verify",payload);
  return response.data;
}