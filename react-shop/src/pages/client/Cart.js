import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🧩 Popup xác nhận
const PopupConfirm = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "30px 40px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        width: "400px",
        maxWidth: "90%",
      }}>
        <h3 style={{
          fontSize: "1.3rem",
          color: "#1e3a8a",
          marginBottom: "20px",
          fontWeight: "700"
        }}>{message}</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onConfirm}
          >
            ✅ Xóa
          </button>
          <button
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1e40af)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onCancel}
          >
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmPopup, setConfirmPopup] = useState({ visible: false, itemId: null, all: false });
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Khi user đăng nhập → tự động load giỏ hàng
  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi tải giỏ hàng:", error);
      toast.error("❌ Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xóa sản phẩm
  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      setCart({
        ...cart,
        items: cart.items.filter((item) => item.cartItemId !== itemId),
      });
      toast.success("🗑️ Đã xóa sản phẩm!");
    } catch (error) {
      console.error("❌ Lỗi khi xóa sản phẩm:", error);
      toast.error("❌ Không thể xóa sản phẩm!");
    }
  };

  // ✅ Xóa tất cả
  const clearCart = async () => {
    try {
      await cartAPI.clearAll();
      setCart({ ...cart, items: [] });
      toast.success("🧹 Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      console.error("❌ Lỗi khi xóa tất cả:", error);
      toast.error("❌ Không thể xóa tất cả sản phẩm!");
    }
  };

  // ✅ Cập nhật số lượng (optimistic update)
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      setConfirmPopup({ visible: true, itemId, all: false });
      return;
    }

    try {
      setCart({
        ...cart,
        items: cart.items.map((item) =>
          item.cartItemId === itemId ? { ...item, quantity: newQuantity } : item
        ),
      });
      await cartAPI.updateItemQuantity(itemId, newQuantity);
      toast.info("🔄 Đã cập nhật số lượng!");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật số lượng:", error);
      toast.error("❌ Không thể cập nhật số lượng!");
      fetchCart();
    }
  };

  // ✅ Thanh toán
  const handleCheckout = () => {
    if (!cart || !cart.items?.length) {
      toast.warning("🛒 Giỏ hàng trống, không thể thanh toán!");
      return;
    }

    toast.success("🚀 Chuyển đến trang thanh toán!", {
      autoClose: 1000,
      onClose: () => navigate("/order"),
    });
  };

  if (!user)
    return <div style={{ textAlign: "center", marginTop: 100 }}>⚠️ Vui lòng đăng nhập để xem giỏ hàng</div>;
  if (loading)
    return <div style={{ textAlign: "center", marginTop: 100 }}>⏳ Đang tải giỏ hàng...</div>;
  if (!cart || !cart.items?.length)
    return <div style={{ textAlign: "center", marginTop: 100 }}>🛍️ Giỏ hàng của bạn đang trống</div>;

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "30px 50px",
      background: "linear-gradient(135deg, #f8fbff, #f0f7ff)",
      minHeight: "100vh",
    },
    title: {
      textAlign: "center",
      background: "linear-gradient(135deg, #1e40af, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: "2.4rem",
      fontWeight: 700,
      marginBottom: "30px",
    },
    clearBtn: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
      marginBottom: "20px",
      display: "block",
      marginLeft: "auto",
    },
    cartItems: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "900px",
      margin: "0 auto",
    },
    cartItem: {
      background: "linear-gradient(145deg, #ffffff, #f8fafc)",
      borderRadius: "14px",
      padding: "20px 24px",
      boxShadow: "0 4px 15px rgba(30, 64, 175, 0.08)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.3s ease",
    },
    total: {
      textAlign: "right",
      maxWidth: "900px",
      margin: "40px auto 0",
      background: "linear-gradient(145deg, #ffffff, #f8fafc)",
      padding: "24px 32px",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(30, 64, 175, 0.1)",
    },
    checkoutBtn: {
      background: "linear-gradient(135deg, #1e40af, #3b82f6)",
      color: "#fff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 style={styles.title}>🛒 Giỏ hàng của bạn</h1>

      {/* 🧹 Nút xóa tất cả */}
      <button
        style={styles.clearBtn}
        onClick={() => setConfirmPopup({ visible: true, itemId: null, all: true })}
      >
        🧹 Xóa tất cả
      </button>

      <div style={styles.cartItems}>
        {cart.items.map((item) => (
          <div key={item.cartItemId} style={styles.cartItem}>
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a" }}>
                {item.productName}
              </h3>
              <p>💰 {(item.unitPrice || 0).toLocaleString("vi-VN")} ₫</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                Số lượng:{" "}
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>−</button>
                <span style={{ margin: "0 8px" }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>＋</button>
              </div>
            </div>

            <button
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => setConfirmPopup({ visible: true, itemId: item.cartItemId, all: false })}
            >
              🗑️ Xóa
            </button>
          </div>
        ))}
      </div>

      <div style={styles.total}>
        <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1e3a8a" }}>
          Tổng cộng:{" "}
          {cart.items
            .reduce(
              (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
              0
            )
            .toLocaleString("vi-VN")}{" "}
          ₫
        </p>
        <button style={styles.checkoutBtn} onClick={handleCheckout}>
          💳 Thanh toán ngay
        </button>
      </div>

      {/* Popup xác nhận */}
      {confirmPopup.visible && (
        <PopupConfirm
          message={
            confirmPopup.all
              ? "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?"
              : "Bạn có chắc chắn muốn xóa sản phẩm này?"
          }
          onConfirm={() => {
            confirmPopup.all
              ? clearCart()
              : removeItem(confirmPopup.itemId);
            setConfirmPopup({ visible: false, itemId: null, all: false });
          }}
          onCancel={() => setConfirmPopup({ visible: false, itemId: null, all: false })}
        />
      )}
    </div>
  );
};

export default Cart;
