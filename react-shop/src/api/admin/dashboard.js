import api from '../client';

export const adminDashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
};

export default adminDashboardAPI;
