import api from "./client";

const cartAPI = {
  // ✅ Lấy giỏ hàng hiện tại (dựa trên token đăng nhập)
  getCart: () => api.get("/cart"),

  // ✅ Lấy giỏ hàng theo userId (chỉ khi cần)
  getCartByUserId: (userId) => api.get(`/cart/user/${userId}`),

  // ✅ Thêm sản phẩm vào giỏ hàng
  addItemToCart: (data) => api.post("/cart/items", data),

  // ✅ Xóa 1 sản phẩm khỏi giỏ hàng
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),

 // ✅ Cập nhật số lượng sản phẩm (chuẩn với backend mới)
updateItemQuantity: (itemId, quantity) =>
  api.patch(`/cart/items/${itemId}?quantity=${quantity}`),


  // ✅ Xóa toàn bộ giỏ hàng (thêm mới)
  clearAll: () => api.delete("/cart/clear"),
};

export default cartAPI;
