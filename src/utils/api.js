const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Debug: Log the API base URL
console.log('API Base URL:', API_BASE_URL);

// Helper function to get auth token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Debug: Log the API URL being called
  console.log('API Call:', `${API_BASE_URL}${endpoint}`);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      await response.text(); // Consume text but don't assign to unused var
      throw new Error(`Server returned non-JSON response. ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Show specific error messages for authentication issues
      if (response.status === 401) {
        throw new Error("Please log in to submit a complaint");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to perform this action");
      } else if (response.status === 400) {
        throw new Error(data.message || "Invalid request. Please check your input");
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    if (error.message.includes("non-JSON")) {
      throw new Error("Backend server may not be running or endpoint not found");
    }

    // Log more details for debugging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - backend may be unreachable');
      throw new Error("Cannot connect to backend server. Please check if the server is running.");
    }

    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  }),

  login: (credentials) => apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  }),

  getProfile: () => apiCall("/auth/profile")
};

// Complaint API
export const complaintAPI = {
  create: (complaintData) => apiCall("/complaints", {
    method: "POST",
    body: JSON.stringify(complaintData)
  }),

  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/complaints${queryParams ? `?${queryParams}` : ""}`);
  },

  getById: (id) => apiCall(`/complaints/${id}`),

  getStatistics: () => apiCall("/complaints/stats/overview"),

  getTechnicianStats: () => apiCall("/complaints/stats/technician"),

  getTechnicians: () => apiCall("/complaints/technicians/list"),

  updateStatus: (id, statusData) => apiCall(`/complaints/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(statusData)
  }),

  assign: (id, technicianId) => apiCall(`/complaints/${id}/assign`, {
    method: "PUT",
    body: JSON.stringify({ technicianId })
  }),

  assignMultiple: (id, technicianIds) => apiCall(`/complaints/${id}/assign-multiple`, {
    method: "POST",
    body: JSON.stringify({ technicianIds })
  }),

  selectTechnician: (id, technicianId) => apiCall(`/complaints/${id}/select-technician`, {
    method: "POST",
    body: JSON.stringify({ technicianId })
  }),

  submitQuotation: (id, quotationData) => apiCall(`/complaints/${id}/submit-quotation`, {
    method: "POST",
    body: JSON.stringify(quotationData)
  }),

  acceptQuotation: (id, quotationId) => apiCall(`/complaints/${id}/accept-quotation`, {
    method: "POST",
    body: JSON.stringify({ quotationId })
  }),

  submitProgressUpdate: (id, data) => apiCall(`/complaints/${id}/progress-update`, {
    method: "POST",
    body: JSON.stringify(data)
  }),

  verifyProgressUpdate: (id, data) => apiCall(`/complaints/${id}/verify-progress`, {
    method: "POST",
    body: JSON.stringify(data)
  })
};

export default apiCall;

