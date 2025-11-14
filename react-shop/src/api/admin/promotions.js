import api from '../client';

export const adminPromotionsAPI = {
  getAll: () => api.get('/admin/promotions'),
  create: (promotionData) => api.post('/admin/promotions', promotionData),
  update: (id, promotionData) => api.put(`/admin/promotions/${id}`, promotionData),
  delete: (id) => api.delete(`/admin/promotions/${id}`),
};

export default adminPromotionsAPI;
