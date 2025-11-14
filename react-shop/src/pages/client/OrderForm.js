import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI, ordersAPI, addressesAPI } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/client/order-page.css";

export default function OrderForm() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // 🧾 Dữ liệu đơn hàng
  const [formData, setFormData] = useState({
    shippingAddressId: "",
    paymentMethod: "COD",
    notes: "",
    discountCode: "",
  });

  // 🚚 Tính tổng tiền
  const [shippingFee, setShippingFee] = useState(30000);
  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    district: "",
    ward: "",
  });

  // 🛒 Load giỏ hàng + địa chỉ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          cartAPI.getCart(),
          addressesAPI.getAll(),
        ]);
        setCart(cartRes.data);
        setAddresses(addrRes.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        toast.error("❌ Không thể tải dữ liệu đơn hàng!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🧮 Tính toán tổng tiền mỗi khi giỏ hàng hoặc mã giảm giá thay đổi
  useEffect(() => {
    if (!cart?.items) return;

    const total = cart.items.reduce(
      (sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 0),
      0
    );
    setSubTotal(total);

    let discount = 0;
    if (formData.discountCode.trim().toUpperCase() === "SALE10") {
      discount = total * 0.1;
    } else if (formData.discountCode.trim().toUpperCase() === "VIP20") {
      discount = total * 0.2;
    }

    setDiscountAmount(discount);
    setFinalTotal(total - discount + shippingFee);
  }, [cart, formData.discountCode, shippingFee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // ➕ Thêm địa chỉ mới
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressesAPI.create(newAddress);
      toast.success("✅ Thêm địa chỉ thành công!");
      setAddresses((prev) => [...prev, res.data]);
      setFormData({ ...formData, shippingAddressId: res.data.id });
      setShowAddressForm(false);
      setNewAddress({
        fullName: "",
        phoneNumber: "",
        streetAddress: "",
        city: "",
        district: "",
        ward: "",
      });
    } catch (err) {
      console.error("❌ Lỗi khi thêm địa chỉ:", err);
      toast.error("❌ Không thể thêm địa chỉ mới!");
    }
  };

  // 🧾 Xác nhận đặt hàng
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart || !cart.items?.length) {
      toast.warning("⚠️ Giỏ hàng trống!");
      return;
    }
    if (!formData.shippingAddressId) {
      toast.warning("⚠️ Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    try {
      const res = await ordersAPI.createOrder({
        shippingAddressId: Number(formData.shippingAddressId),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        discountCode: formData.discountCode || null, // ✅ gửi lên backend
      });

      toast.success(
        <div>
          🎉 <strong>Đặt hàng thành công!</strong>
          <div style={{ fontSize: "14px", marginTop: "4px" }}>
            Đang chuyển đến chi tiết đơn hàng...
          </div>
        </div>,
        {
          onClose: () => navigate(`/order/${res.data.id}`),
          autoClose: 2000,
        }
      );
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      toast.error("❌ Không thể tạo đơn hàng!");
    }
  };

  if (loading) return <p className="loading">⏳ Đang tải dữ liệu...</p>;

  if (!cart || !cart.items?.length)
    return (
      <div className="empty-cart">
        🛍️ Giỏ hàng của bạn đang trống.{" "}
        <button onClick={() => navigate("/products")}>Mua ngay</button>
      </div>
    );

  return (
    <div className="order-page">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="order-container">
        {/* ===== FORM ĐẶT HÀNG ===== */}
        <div className="order-form">
          <h2>🧾 Thông tin thanh toán</h2>
          <form onSubmit={handleSubmit}>
            {/* Địa chỉ giao hàng */}
            <div className="form-group">
              <label>Địa chỉ giao hàng *</label>
              <div className="address-select">
                <select
                  name="shippingAddressId"
                  value={formData.shippingAddressId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn địa chỉ của bạn --</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.fullName} - {addr.phoneNumber} ({addr.streetAddress})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => setShowAddressForm(true)}
                >
                  ➕ Thêm mới
                </button>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="form-group">
              <label>Phương thức thanh toán</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                <option value="CREDIT_CARD">Thẻ tín dụng</option>
              </select>
            </div>

            {/* Mã giảm giá */}
            <div className="form-group">
              <label>Mã giảm giá</label>
              <input
                type="text"
                name="discountCode"
                placeholder="Nhập mã giảm giá (VD: SALE10)"
                value={formData.discountCode}
                onChange={handleChange}
              />
            </div>

            {/* Ghi chú */}
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ví dụ: Giao trong giờ hành chính..."
              />
            </div>

            <button type="submit" className="btn-submit">
              XÁC NHẬN ĐẶT HÀNG 💳
            </button>
          </form>
        </div>

        {/* ===== TÓM TẮT ĐƠN HÀNG ===== */}
        <div className="order-summary">
          <h3>🛍️ Tóm tắt đơn hàng</h3>

          {cart.items.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="product-icon">
                <span className="icon">💎</span>
              </div>

              <div className="product-details">
                <h4>{item.productName}</h4>

                <div className="product-meta">
                  <span className="quantity">
                    Số lượng: <strong>{item.quantity}</strong>
                  </span>
                  <span className="price">
                    Đơn giá:{" "}
                    <strong>
                      {(item.unitPrice ?? 0).toLocaleString("vi-VN")}₫
                    </strong>
                  </span>
                </div>

                <div className="item-total">
                  Thành tiền:{" "}
                  <strong>
                    {(
                      (item.unitPrice ?? 0) * (item.quantity ?? 0)
                    ).toLocaleString("vi-VN")}
                    ₫
                  </strong>
                </div>
              </div>
            </div>
          ))}

          {/* ✅ Tổng cộng */}
          <div className="summary-total">
            <p>Tổng phụ: {subTotal.toLocaleString("vi-VN")}₫</p>
            <p>Giảm giá: -{discountAmount.toLocaleString("vi-VN")}₫</p>
            <p>Phí vận chuyển: {shippingFee.toLocaleString("vi-VN")}₫</p>
            <hr />
            <h4>
              Tổng thanh toán:{" "}
              <span className="final-total">
                {finalTotal.toLocaleString("vi-VN")}₫
              </span>
            </h4>
          </div>
        </div>
      </div>

      {/* ===== POPUP THÊM ĐỊA CHỈ ===== */}
      {showAddressForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Thêm địa chỉ mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddressForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddAddress}>
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                value={newAddress.fullName}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={newAddress.phoneNumber}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="Địa chỉ (số nhà, đường...)"
                value={newAddress.streetAddress}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="ward"
                placeholder="Phường/Xã"
                value={newAddress.ward}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="district"
                placeholder="Quận/Huyện"
                value={newAddress.district}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="city"
                placeholder="Tỉnh/Thành phố"
                value={newAddress.city}
                onChange={handleNewAddressChange}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-save">
                  💾 Lưu địa chỉ
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddressForm(false)}
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
