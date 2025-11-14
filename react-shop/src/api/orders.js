import api from "./client";

export const ordersAPI = {
  // ✅ Tạo đơn hàng mới
  createOrder: (orderData) => api.post("/orders", orderData),

  // ✅ Lấy danh sách đơn hàng (user hiện tại)
  getOrderHistory: () => api.get("/orders"),

  // ✅ Lấy chi tiết đơn hàng theo ID
  getById: (id) => api.get(`/orders/${id}`),

  // ✅ (Dành cho admin) Lấy toàn bộ đơn hàng
  getAll: () => api.get("/orders"),
};

export default ordersAPI;
