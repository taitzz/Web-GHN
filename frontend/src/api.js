// src/api/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Tạo instance axios với token (nếu có)
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Middleware tự động thêm Authorization nếu có token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // JWT được lưu sau khi đăng nhập
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==============================
// 📦 USER API
// ==============================
export const userApi = {
  register: (data) => axiosInstance.post("/users/register", data),
  checkUsername: (data) => axiosInstance.post("/users/check-username", data),
  login: (data) => axiosInstance.post("/users/login", data),
  getProfile: () => axiosInstance.get("/users/profile"),
  getAll: () => axiosInstance.get("/users/list"),
  delete: (id) => axiosInstance.delete(`/users/${id}`),
  forgotPassword: (data) => axiosInstance.post("/users/forgot-password", data),
  resetPassword: (data) => axiosInstance.post("/users/reset-password", data),
};

// ==============================
// 📦 ORDER API (cho user + admin)
// ==============================
export const orderApi = {
  getAll: () => axiosInstance.get("/orders"),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  create: (data) => axiosInstance.post("/orders/create", data),
  cancel: (id) => axiosInstance.delete(`/orders/${id}`),
  getCancelRequests: () => axiosInstance.get("/orders/cancel-requests"),
  approveCancel: (requestId) => axiosInstance.post(`/orders/cancel-requests/${requestId}/approve`),
  rejectCancel: (requestId) => axiosInstance.post(`/orders/cancel-requests/${requestId}/reject`),
};

// ==============================
// 📦 SHIPPER API (public, shipper, admin)
// ==============================
export const shipperApi = {
  // Public
  checkEmail: (data) => axiosInstance.post("/shipper/check-email", data),
  register: (data) => axiosInstance.post("/shipper/register", data),
  login: (data) => axiosInstance.post("/shipper/login", data),

  // Shipper
  getProfile: () => axiosInstance.get("/shipper/profile"),
  getName: () => axiosInstance.get("/shipper/name"),
  getAssignments: () => axiosInstance.get("/shipper/assignments"),
  getShippingOrders: () => axiosInstance.get("/shipper/shipping-orders"),
  getCompletedOrders: () => axiosInstance.get("/shipper/completed-orders"),
  getOrderDetails: (id) => axiosInstance.get(`/shipper/orders/${id}`),
  respondAssignment: (data) => axiosInstance.post("/shipper/respond-assignment", data),
  startShipping: (data) => axiosInstance.post("/shipper/start-shipping", data),
  completeOrder: (data) => axiosInstance.post("/shipper/complete-order", data),
  confirmPayment: (data) => axiosInstance.post("/shipper/confirm-payment", data),

  // User
  getShipperDetailsByUser: (shipperId) => axiosInstance.get(`/shipper/shipper-details/${shipperId}`),

  // Admin
  createAndApprove: (data) => axiosInstance.post("/shipper/create-and-approve", data),
  getPending: () => axiosInstance.get("/shipper/shipper-requests"),
  getApproved: () => axiosInstance.get("/shipper/approved-shippers"),
  getAvailable: () => axiosInstance.get("/shipper/available"),
  getDetails: (id) => axiosInstance.get(`/shipper/shipper-details/${id}`),
  update: (id, data) => axiosInstance.put(`/shipper/update/${id}`, data),
  approve: (id) => axiosInstance.put(`/shipper/approve/${id}`),
  reject: (id) => axiosInstance.put(`/shipper/reject/${id}`),
  delete: (id) => axiosInstance.delete(`/shipper/delete/${id}`),
};
