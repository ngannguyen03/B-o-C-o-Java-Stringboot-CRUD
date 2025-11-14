import React, { useEffect, useState } from "react";
import { adminOrdersAPI } from "../../api/admin/orders";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/order-management.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load danh sách đơn hàng khi vào trang
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminOrdersAPI.getAllOrders();
      setOrders(response.data.content || response.data || []);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, status) => {
    try {
      await adminOrdersAPI.updateOrderStatus(orderId, status);
      toast.success("✅ Cập nhật trạng thái thành công!");
      fetchOrders(); // reload
    } catch (error) {
      console.error("⚠️ Error updating order status:", error);
      toast.error("❌ Lỗi khi cập nhật trạng thái đơn hàng!");
    }
  };

  if (loading) return <div className="loading">⏳ Đang tải đơn hàng...</div>;

  return (
    <div className="order-management dark-mode">
      <ToastContainer position="top-right" autoClose={2500} />
      <h1 className="page-title">📦 Quản lý đơn hàng</h1>

      {orders.length === 0 ? (
        <p className="empty">Không có đơn hàng nào.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>

                {/* ✅ Hiển thị tên/email */}
                <td>{order.userName || order.userEmail || "Ẩn danh"}</td>

                {/* ✅ Tổng tiền (chuẩn định dạng) */}
                <td>
                  {order.finalTotal?.toLocaleString("vi-VN") ||
                    order.totalAmount?.toLocaleString("vi-VN") ||
                    0}{" "}
                  ₫
                </td>

                {/* ✅ Badge trạng thái */}
                <td>
                  <span className={`status_1 ${order.status?.toLowerCase()}`}>
                    {order.status || "Không xác định"}
                  </span>
                </td>

                {/* ✅ Select cập nhật */}
                <td>
                  <select
                    className="status_1-select"
                    value={order.status || "PENDING"}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPED">Đang giao</option>
                    <option value="DELIVERED">Hoàn tất</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderManagement;
