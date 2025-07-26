import { apiClient } from "@/helper/commonHelper";

export const registerUser = async (formData) => {
  const data = new FormData();
  
  // Append text fields
  data.append('name', formData.name);
  data.append('phone', formData.phone);
  data.append('pin', formData.pin);
  data.append('role', formData.role);
  
  // Append image if exists
  if (formData.image) {
    data.append('image', formData.image);
  }

  return apiClient.post('/users/create', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const loginUser = async (credentials) => {
  return apiClient.post('/users/login', credentials);
};