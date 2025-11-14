import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/client/order-history.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 📦 Load danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getOrderHistory();
      console.log("📜 Order history:", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Gọi khi user login hoặc tab refocus
  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);

    // 👇 Reload lại khi quay lại tab
    const handleFocus = () => {
      if (user) fetchOrders();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  if (!user)
    return <div className="order-empty">⚠️ Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;

  if (loading)
    return <div className="order-loading">⏳ Đang tải danh sách đơn hàng...</div>;

  if (!orders.length)
    return <div className="order-empty">🛍️ Bạn chưa có đơn hàng nào.</div>;

  // 🎯 Lấy giá trị an toàn
  const getValue = (order, keyList) => {
    for (const key of keyList) {
      const val = order[key];
      if (val !== undefined && val !== null) return val;
    }
    return 0;
  };

  // ✅ Hàm render label trạng thái đúng theo backend
  const renderStatus = (status) => {
    switch (status) {
      case "PENDING":
        return { text: " Chờ xử lý", class: "pending" };
      case "PROCESSING":
        return { text: " Đang xử lý", class: "processing" };
      case "SHIPPED":
        return { text: " Đang giao", class: "shipped" };
      case "DELIVERED":
        return { text: " Hoàn tất", class: "delivered" };
      case "CANCELLED":
        return { text: " Đã hủy", class: "cancelled" };
      default:
        return { text: status || "Không xác định", class: "pending" };
    }
  };

  return (
    <div className="order-history-page">
      <h1 className="order-title">🧾 Lịch sử đơn hàng của bạn</h1>

      <div className="order-list">
        {orders.map((order) => {
          const total = getValue(order, ["totalAmount", "subTotal", "finalTotal"]);
          const discount = getValue(order, ["discountAmount", "discount"]);
          const final = getValue(order, ["finalTotal", "finalAmount", "totalAmount"]);
          const { text, class: statusClass } = renderStatus(order.status);

          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Đơn hàng #{order.id}</h3>
                <span className={`status-tag ${statusClass}`}>{text}</span>
              </div>

              <div className="order-body">
                <p>
                  <strong>📅 Ngày đặt:</strong>{" "}
                  {new Date(order.orderDate).toLocaleString("vi-VN")}
                </p>

                <p>
                  <strong>📊 Tạm tính:</strong>{" "}
                  {total.toLocaleString("vi-VN")}₫
                </p>

                <p>
                  <strong>🎁 Giảm giá:</strong>{" "}
                  -{discount.toLocaleString("vi-VN")}₫
                </p>

                <p>
                  <strong>💎 Thành tiền:</strong>{" "}
                  {final.toLocaleString("vi-VN")}₫
                </p>
              </div>

              <div className="order-footer">
                <button
                  className="btn-detail"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  🔍 Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
