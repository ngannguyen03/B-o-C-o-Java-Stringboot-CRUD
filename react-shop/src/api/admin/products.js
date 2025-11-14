import api from "../client";

const adminProductsAPI = {
  // ✅ Lấy danh sách tất cả sản phẩm (Admin)
  getAll: () => api.get("/admin/products"),

  // ✅ Tạo sản phẩm mới
  create: (productData) => api.post("/admin/products", productData),

  // ✅ Cập nhật sản phẩm
  update: (id, productData) => api.put(`/admin/products/${id}`, productData),

  // ✅ Xóa sản phẩm
  delete: (id) => api.delete(`/admin/products/${id}`),
};

export default adminProductsAPI;
