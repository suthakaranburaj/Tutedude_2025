import axios from 'axios';
import { apiClient } from "@/helper/commonHelper";
const API_BASE_URL = 'http://localhost:8003/api';


export const getVendorDashboard = async () => {
  const response = await apiClient.get("/vendor/getDashboard");
  return response.data;
};


export const getVendorProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vendor/profile`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch vendor profile');
  }
};

export const updateVendorProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/vendor/profile`, profileData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update vendor profile');
  }
};