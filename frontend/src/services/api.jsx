import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Gig APIs
export const gigAPI = {
  create: (data) => api.post('/gigs', data),
  getAll: (params) => api.get('/gigs', { params }),
  getOne: (id) => api.get(`/gigs/${id}`),
  matchWorkers: (id) => api.get(`/gigs/${id}/match`),
  formGroup: (id, data) => api.post(`/gigs/${id}/form-group`, data),
  respond: (id, status) => api.put(`/gigs/${id}/respond`, { status }),
  complete: (id) => api.put(`/gigs/${id}/complete`),
  getEmergencyPrice: (data) => api.post('/gigs/emergency-price', data)
};

// Worker APIs
export const workerAPI = {
  getAll: (params) => api.get('/workers', { params }),
  getOne: (id) => api.get(`/workers/${id}`),
  getMyGigs: () => api.get('/workers/me/gigs'),
  getMyTokens: () => api.get('/workers/me/tokens'),
  getMyStats: () => api.get('/workers/me/stats'),
  getBadges: () => api.get('/workers/badges'),
  verify: (id) => api.put(`/workers/${id}/verify`)
};

// AI APIs
export const aiAPI = {
  getPrice: (data) => api.post('/ai/price', data),
  recommend: (gigId) => api.post('/ai/recommend', { gigId }),
  autoGroup: (gigId, groupSize) => api.post('/ai/auto-group', { gigId, groupSize })
};

// Token APIs
export const tokenAPI = {
  getHistory: () => api.get('/tokens/history'),
  redeem: (amount, purpose) => api.post('/tokens/redeem', { amount, purpose })
};

// Group APIs
export const groupAPI = {
  getOne: (id) => api.get(`/groups/${id}`),
  sendMessage: (id, message) => api.post(`/groups/${id}/chat`, { message }),
  getMyGroups: () => api.get('/groups/me/all')
};

// Payment APIs
export const paymentAPI = {
  createIntent: (gigId, amount) => api.post('/payments/create-intent', { gigId, amount }),
  confirm: (gigId, paymentIntentId) => api.post('/payments/confirm', { gigId, paymentIntentId }),
  release: (gigId) => api.post('/payments/release', { gigId })
};