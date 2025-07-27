import { apiClient } from "@/helper/commonHelper";

// Get all vendors with optional filters
export const getAllVendors = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.cuisine) queryParams.append('cuisine', filters.cuisine);
  if (filters.minRating) queryParams.append('minRating', filters.minRating);
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const url = `/normalUser/vendors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get(url);
};

// Check if user has already submitted feedback for a vendor
export const checkUserFeedback = async (vendorId) => {
  return apiClient.get(`/normalUser/feedback/${vendorId}`);
};

// Add feedback for a vendor
export const addFeedback = async (vendorId, comment, rating, images = []) => {
  const formData = new FormData();
  formData.append('vendorId', vendorId);
  formData.append('comment', comment);
  formData.append('rating', rating);
  
  // Add images if provided
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      formData.append('images', image);
    });
  }
  
  return apiClient.post('/normalUser/feedback', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Rate a vendor
export const rateVendor = async (vendorId, rating) => {
  return apiClient.post('/normalUser/rate', {
    vendorId,
    rating
  });
};

// Get user profile
export const getUserProfile = async () => {
  return apiClient.get('/normalUser/profile');
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  // Handle image upload if present
  if (profileData.image && profileData.image instanceof File) {
    const formData = new FormData();
    formData.append('name', profileData.name || '');
    formData.append('phone', profileData.phone || '');
    formData.append('image', profileData.image);
    
    return apiClient.put('/normalUser/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  return apiClient.put('/normalUser/profile', profileData);
}; 

// Get vendor by ID
export const getVendorById = async (vendorId) => {
  return apiClient.get(`/normalUser/vendors/${vendorId}`);
};

// Get feedback for a vendor
export const getVendorFeedback = async (vendorId, page = 1, limit = 10) => {
  return apiClient.get(
    `/normalUser/vendors/${vendorId}/feedback?page=${page}&limit=${limit}`
  );
};

// Get user feedback history
export const getUserFeedbackHistory = async (page = 1, limit = 10) => {
  return apiClient.get(`/normalUser/feedback/history?page=${page}&limit=${limit}`);
};