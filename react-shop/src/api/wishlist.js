import api from './client';

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),

  addToWishlist: (variantId) =>
    api.post(`/wishlist/${variantId}`),

  removeFromWishlist: (variantId) =>
    api.delete(`/wishlist/${variantId}`),
};

export default wishlistAPI;
