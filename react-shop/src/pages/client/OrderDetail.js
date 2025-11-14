import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/client/order-detail.css";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧾 Lấy chi tiết đơn hàng
  const fetchOrder = async () => {
    try {
      const res = await ordersAPI.getById(id);
      console.log("📦 Order detail:", res.data);
      setOrder(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải đơn hàng:", err);
      toast.error("❌ Không thể tải chi tiết đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // 🔁 Reload khi quay lại tab (phòng khi admin update)
    const handleFocus = () => fetchOrder();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [id]);

  // 🎨 Icon sản phẩm
  const getProductIcon = (productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("nhẫn") || name.includes("ring")) return "💍";
    if (name.includes("dây chuyền") || name.includes("necklace")) return "📿";
    if (name.includes("bông tai") || name.includes("earring")) return "👂";
    if (name.includes("vòng tay") || name.includes("bracelet")) return "📿";
    if (name.includes("kim cương") || name.includes("diamond")) return "💎";
    if (name.includes("vàng") || name.includes("gold")) return "⭐";
    if (name.includes("bạc") || name.includes("silver")) return "⚪";
    return "💎";
  };

  // 🎨 Màu nền random
  const getRandomColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #3b82f6, #1e40af)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #ef4444, #dc2626)",
      "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      "linear-gradient(135deg, #06b6d4, #0891b2)",
    ];
    return colors[index % colors.length];
  };

  if (loading) return <p className="loading">⏳ Đang tải đơn hàng...</p>;
  if (!order) return <p className="error">Không tìm thấy đơn hàng #{id}</p>;

  const address = order.shippingAddress || {};
  const items = order.orderItems ?? order.orderDetails ?? [];
  const subTotal = order.subTotal ?? order.totalAmount ?? 0;
  const discount = order.discountAmount ?? 0;
  const finalTotal = order.finalTotal ?? subTotal - discount;

  const getItemPrice = (item) =>
    item.priceAtPurchase || item.price_at_purchase || item.price || 0;

  // ✅ Map trạng thái đúng enum backend
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return { text: "⏳ Chờ xử lý", class: "pending" };
      case "PROCESSING":
        return { text: "⚙️ Đang xử lý", class: "processing" };
      case "SHIPPED":
        return { text: "🚚 Đang giao hàng", class: "shipped" };
      case "DELIVERED":
        return { text: "✅ Hoàn tất", class: "delivered" };
      case "CANCELLED":
        return { text: "❌ Đã hủy", class: "cancelled" };
      default:
        return { text: status || "Không xác định", class: "pending" };
    }
  };

  const { text: statusText, class: statusClass } = getStatusLabel(order.status);

  return (
    <div className="order-detail-page">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* ===== HEADER ===== */}
      <div className="order-header">
        <h2>🧾 Chi tiết đơn hàng #{order.id}</h2>
        <p>
          Trạng thái: <span className={`status-badge ${statusClass}`}>{statusText}</span>
        </p>
        <p>
          📅 Ngày đặt:{" "}
          {new Date(order.orderDate).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* ===== ĐỊA CHỈ ===== */}
      <div className="address-card">
        <h3>📍 Địa chỉ giao hàng</h3>
        {address.fullName ? (
          <>
            <p><strong>👤 {address.fullName}</strong></p>
            <p>📞 {address.phoneNumber}</p>
            <p>
              🏠 {address.streetAddress}, {address.ward}, {address.district},{" "}
              {address.city}
            </p>
          </>
        ) : (
          <p>Không có địa chỉ giao hàng.</p>
        )}
      </div>

      {/* ===== SẢN PHẨM ===== */}
      <div className="order-items">
        <h3>🛍️ Sản phẩm trong đơn hàng</h3>
        {items.length > 0 ? (
          <div className="items-grid">
            {items.map((item, index) => (
              <div key={index} className="order-item">
                <div
                  className="product-icon-container"
                  style={{ background: getRandomColor(index) }}
                >
                  <span className="product-icon">
                    {getProductIcon(item.productName)}
                  </span>
                </div>

                <div className="order-item-info">
                  <h4>{item.productName}</h4>
                  {item.variantInfo && (
                    <p className="variant-info">📋 {item.variantInfo}</p>
                  )}

                  <div className="item-meta">
                    <span className="quantity">
                      🔢 Số lượng: <strong>{item.quantity}</strong>
                    </span>
                    <span className="price">
                      💰 Giá:{" "}
                      <strong>
                        {getItemPrice(item).toLocaleString("vi-VN")}₫
                      </strong>
                    </span>
                  </div>

                  <div className="item-total">
                    🎯 Thành tiền:{" "}
                    <strong>
                      {(getItemPrice(item) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">📦 Không có sản phẩm trong đơn hàng.</p>
        )}
      </div>

      {/* ===== TỔNG KẾT ===== */}
      <div className="order-summary">
        <h3>💰 Tổng kết đơn hàng</h3>
        <div className="summary-line">
          <span>📊 Tạm tính:</span>
          <strong>{subTotal.toLocaleString("vi-VN")}₫</strong>
        </div>
        {discount > 0 && (
          <div className="summary-line discount">
            <span>🎁 Giảm giá:</span>
            <strong>-{discount.toLocaleString("vi-VN")}₫</strong>
          </div>
        )}
        <div className="summary-line total">
          <span>💎 Tổng cộng:</span>
          <strong>{finalTotal.toLocaleString("vi-VN")}₫</strong>
        </div>
      </div>

      <button className="back-btn" onClick={() => navigate("/orders")}>
        ⬅️ Quay lại danh sách đơn hàng
      </button>
    </div>
  );
}
