import api from '../client';

export const adminCategoriesAPI = {
  getAll: () => api.get('/admin/categories'),
  create: (categoryData) => api.post('/admin/categories', categoryData),
  update: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export default adminCategoriesAPI;
