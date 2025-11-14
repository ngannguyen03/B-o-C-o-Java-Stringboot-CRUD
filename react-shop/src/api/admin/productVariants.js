import api from '../client';

export const adminProductVariantsAPI = {
  getByProduct: (productId) => api.get(`/admin/products/${productId}/variants`),
  create: (productId, variantData) => api.post(`/admin/products/${productId}/variants`, variantData),
  update: (productId, variantId, variantData) => api.put(`/admin/products/${productId}/variants/${variantId}`, variantData),
  delete: (productId, variantId) => api.delete(`/admin/products/${productId}/variants/${variantId}`),
};

export default adminProductVariantsAPI;
