import axios from 'axios';

// In dev: Vite proxy forwards /api → localhost:5000
// In production: VITE_API_URL = https://your-render-backend.onrender.com
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_user');
      window.location.href = '/login/student';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Subjects ──────────────────────────────────────────────────────────
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  remove: (id) => api.delete(`/subjects/${id}`),
  assignTeacher: (id, data) => api.put(`/subjects/${id}/assign-teacher`, data),
  enrollStudent: (id, data) => api.put(`/subjects/${id}/enroll`, data),
  unenrollStudent: (id, data) => api.put(`/subjects/${id}/unenroll`, data),
};

// ── Assignments ───────────────────────────────────────────────────────
export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getOne: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, d) => api.put(`/assignments/${id}`, d),
  remove: (id) => api.delete(`/assignments/${id}`),
};

// ── Submissions ───────────────────────────────────────────────────────
export const submissionAPI = {
  submit: (formData) => api.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMy: () => api.get('/submissions/my'),
  getAll: (params) => api.get('/submissions', { params }),
  getOne: (id) => api.get(`/submissions/${id}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  bulkDownload: (aId) => api.get(`/submissions/download/${aId}`, { responseType: 'blob' }),
};

// ── Users ─────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, d) => api.put(`/users/${id}`, d),
  remove: (id) => api.delete(`/users/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsAPI = {
  getEco: () => api.get('/analytics/eco'),
};
