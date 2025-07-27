import axios from "axios";

// Async error handler for backend
const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
};

// Read cookie by name (optional if you still use cookies)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// Handle API response
const handleRequest = async (axiosCall) => {
  try {
    const response = await axiosCall();
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Request failed",
    };
  }
};

// Base URL from env
const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get Authorization Header from localStorage
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("Token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// API Client
export const apiClient = {
  get: async (url, headers = {}) =>
    handleRequest(() =>
      axios.get(`${base_url}${url}`, {
        headers: {
          ...headers,
          ...getAuthHeader(),
        },
        withCredentials: true,
      })
    ),

  post: async (url, data, headers = {}) => {
    if (data instanceof FormData) {
      delete headers["Content-Type"];
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return handleRequest(() =>
      axios.post(`${base_url}${url}`, data, {
        headers: {
          ...headers,
          ...getAuthHeader(),
        },
        withCredentials: true,
      })
    );
  },

  put: async (url, data, headers = {}) => {
    if (data instanceof FormData) {
      delete headers["Content-Type"];
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return handleRequest(() =>
      axios.put(`${base_url}${url}`, data, {
        headers: {
          ...headers,
          ...getAuthHeader(),
        },
        withCredentials: true,
      })
    );
  },

  delete: async (url, headers = {}) =>
    handleRequest(() =>
      axios.delete(`${base_url}${url}`, {
        headers: {
          ...headers,
          ...getAuthHeader(),
        },
        withCredentials: true,
      })
    ),
};

// Export utils
export { asyncHandler, getCookie };
