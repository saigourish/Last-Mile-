import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gourish_token') || localStorage.getItem('antigravity_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauth if not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('gourish_token');
        localStorage.removeItem('gourish_user');
        localStorage.removeItem('antigravity_token');
        localStorage.removeItem('antigravity_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  quickPersona: (persona) => api.post('/auth/quick-persona', { persona }),
};

// Order Services
export const orderService = {
  calculateRate: (params) => api.post('/orders/calculate-rate', params),
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  trackOrder: (trackingNumber) => api.get(`/orders/track/${trackingNumber}`),
  evaluateAntigravity: (orderId) => api.get(`/orders/${orderId}/antigravity-evaluate`),
  evaluateGourish: (orderId) => api.get(`/orders/${orderId}/antigravity-evaluate`),
  autoAssignAgent: (orderId) => api.post(`/orders/${orderId}/auto-assign`),
  manualAssignAgent: (orderId, agentId) => api.post(`/orders/${orderId}/manual-assign`, { agentId }),
  updateStatus: (orderId, data) => api.patch(`/orders/${orderId}/status`, data),
  rescheduleOrder: (orderId, data) => api.post(`/orders/${orderId}/reschedule`, data),
  getOrderLogs: (orderId) => api.get(`/orders/${orderId}/logs`),
};

// Agent Fleet Services
export const agentService = {
  getAgents: () => api.get('/agents'),
  getAgentById: (id) => api.get(`/agents/${id}`),
  updateLocation: (id, coords) => api.patch(`/agents/${id}/location`, coords),
  updateStatus: (id, status) => api.patch(`/agents/${id}/status`, { status }),
};

// Zone Services
export const zoneService = {
  getZones: () => api.get('/zones'),
  lookupZone: (data) => api.post('/zones/lookup', data),
  createZone: (data) => api.post('/zones', data),
  updateZone: (id, data) => api.put(`/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/zones/${id}`),
};

// Rate Card Services
export const rateCardService = {
  getRateCards: (params) => api.get('/rate-cards', { params }),
  createRateCard: (data) => api.post('/rate-cards', data),
  updateRateCard: (id, data) => api.put(`/rate-cards/${id}`, data),
  deleteRateCard: (id) => api.delete(`/rate-cards/${id}`),
};

// Analytics Services
export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
};

// Notification Services
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
