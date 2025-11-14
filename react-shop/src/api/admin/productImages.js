import api from '../client';

export const adminProductImagesAPI = {
  getByProduct: (productId) => api.get(`/admin/products/${productId}/images`),
  upload: (productId, imageData) => api.post(`/admin/products/${productId}/images`, imageData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (productId, imageId) => api.delete(`/admin/products/${productId}/images/${imageId}`),
};

export default adminProductImagesAPI;
