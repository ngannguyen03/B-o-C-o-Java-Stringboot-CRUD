import api from "../client";

export const adminOrdersAPI = {
  // ✅ Lấy toàn bộ đơn hàng
  getAllOrders: () => api.get("/admin/orders"),

  // ✅ Lấy chi tiết đơn hàng theo ID
  getOrderById: (id) => api.get(`/admin/orders/${id}`),

  // ✅ Cập nhật trạng thái (đúng method PATCH)
  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
};

export default adminOrdersAPI;
