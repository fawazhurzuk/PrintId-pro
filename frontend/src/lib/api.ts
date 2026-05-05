import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  register: (data: Record<string, string>) => api.post("/auth/register/institution", data),
  me: () => api.get("/auth/me"),
};

export const institutionAPI = {
  list: (params?: Record<string, string>) => api.get("/institutions", { params }),
  get: (id: string) => api.get(`/institutions/${id}`),
  create: (data: Record<string, string>) => api.post("/institutions", data),
  update: (id: string, data: Record<string, string>) => api.put(`/institutions/${id}`, data),
  uploadLogo: (id: string, formData: FormData) =>
    api.post(`/institutions/${id}/logo`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  uploadSignature: (id: string, formData: FormData) =>
    api.post(`/institutions/${id}/signature`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  addMember: (id: string, data: Record<string, string>) => api.post(`/institutions/${id}/members`, data),
  getMembers: (id: string) => api.get(`/institutions/${id}/members`),
};

export const studentAPI = {
  list: (params?: Record<string, string>) => api.get("/students", { params }),
  get: (id: string) => api.get(`/students/${id}`),
  create: (data: Record<string, unknown>) => api.post("/students", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  uploadPhoto: (id: string, formData: FormData) =>
    api.post(`/students/${id}/photo`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  submit: (id: string) => api.put(`/students/${id}/submit`),
  bulkSubmit: (studentIds: string[]) => api.put("/students/bulk/submit", { studentIds }),
  review: (id: string, notes?: string) => api.put(`/students/${id}/review`, { notes }),
  bulkReview: (studentIds: string[]) => api.put("/students/bulk/review", { studentIds }),
  finalize: (studentIds: string[], templateOrientation?: string) =>
    api.post("/students/finalize", { studentIds, templateOrientation }),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const batchAPI = {
  list: (params?: Record<string, string>) => api.get("/batches", { params }),
  get: (id: string) => api.get(`/batches/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/batches/${id}/status`, { status }),
  exportCSV: (id: string) => api.get(`/batches/${id}/export/csv`, { responseType: "blob" }),
  exportZip: (id: string) => api.get(`/batches/${id}/export/zip`, { responseType: "blob" }),
};

export const templateAPI = {
  list: (params?: Record<string, string>) => api.get("/templates", { params }),
  get: (id: string) => api.get(`/templates/${id}`),
  create: (data: Record<string, unknown>) => api.post("/templates", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

export const designAPI = {
  list: (params?: Record<string, string>) => api.get("/designs", { params }),
  upload: (formData: FormData) =>
    api.post("/designs", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/designs/${id}`),
};

export const notificationAPI = {
  list: (params?: Record<string, string>) => api.get("/notifications", { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export const dashboardAPI = {
  admin: () => api.get("/dashboard/admin"),
  institution: () => api.get("/dashboard/institution"),
};
