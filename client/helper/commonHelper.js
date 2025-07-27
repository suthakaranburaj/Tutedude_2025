const getAuthHeader = () => {
  const token =
    typeof window !== "undefined" && localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
