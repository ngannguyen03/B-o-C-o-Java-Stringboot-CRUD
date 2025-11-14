import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productsAPI, cartAPI, wishlistAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  // ✅ Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
        if (response.data.variants?.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        toast.error("Không tải được thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ Thêm vào giỏ hàng
  const addToCart = async () => {
    if (!user) {
      toast.error("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    try {
      await cartAPI.addItemToCart({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      });
      toast.success("✅ Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      toast.error("Không thể thêm vào giỏ hàng!");
    }
  };

  // ✅ Thêm vào wishlist
  const addToWishlist = async () => {
    if (!user) {
      toast.error("⚠️ Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    try {
      await wishlistAPI.addToWishlist(selectedVariant.id);
      toast.success("💖 Đã thêm vào danh sách yêu thích!");
    } catch (error) {
      console.error("❌ Error adding to wishlist:", error);
      toast.error("Không thể thêm vào danh sách yêu thích!");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontSize: "1.2rem" }}>
        ⏳ Đang tải sản phẩm...
      </div>
    );

  if (!product)
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontSize: "1.2rem" }}>
        ⚠️ Không tìm thấy sản phẩm
      </div>
    );

  // 🎨 Giao diện tone trắng - kem - đen
  const styles = {
    container: {
      fontFamily: "'Segoe UI', sans-serif",
      padding: "40px",
      maxWidth: "1000px",
      margin: "0 auto",
      background: "linear-gradient(135deg, #fdfcfb, #f5f5f0)",
      borderRadius: "16px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    },
    image: {
      width: "100%",
      maxHeight: "450px",
      borderRadius: "12px",
      objectFit: "cover",
      marginBottom: "25px",
    },
    name: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#222",
      marginBottom: "10px",
    },
    desc: { fontSize: "1.05rem", color: "#444", marginBottom: "20px" },
    price: { fontSize: "1.4rem", fontWeight: "600", color: "#111" },
    variantCard: {
      background: "#fff",
      borderRadius: "10px",
      padding: "10px 16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      marginBottom: "10px",
      cursor: "pointer",
      transition: "transform 0.2s",
    },
    activeVariant: { border: "2px solid #111", transform: "scale(1.02)" },
    qtyBox: {
      marginTop: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    qtyInput: {
      width: "70px",
      padding: "5px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      textAlign: "center",
    },
    buttons: {
      display: "flex",
      gap: "15px",
      marginTop: "25px",
    },
    btn: {
      background: "#111",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    wishlistBtn: {
      background: "#d1bfa7",
      color: "#111",
    },
  };

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div style={styles.container}>
      <Toaster position="top-center" />
      <img
        src={product.images?.[0]?.imageUrl}
        alt={product.name}
        style={styles.image}
      />
      <h2 style={styles.name}>{product.name}</h2>
      <p style={styles.desc}>{product.description}</p>

      {/* 💰 Giá hiển thị thông minh */}
      <h3 style={styles.price}>
        💰 Giá:{" "}
        {product.discountPrice && product.discountPrice < product.basePrice ? (
          <>
            <span
              style={{
                textDecoration: "line-through",
                color: "#999",
                marginRight: "8px",
              }}
            >
              {formatPrice(product.basePrice)}
            </span>
            <span style={{ color: "#d9534f", fontWeight: "700" }}>
              {formatPrice(product.discountPrice)}
            </span>
            <span
              style={{
                background: "#ff4d4f",
                color: "#fff",
                borderRadius: "6px",
                padding: "3px 6px",
                marginLeft: "10px",
                fontSize: "0.9rem",
              }}
            >
              -
              {Math.round(
                ((product.basePrice - product.discountPrice) /
                  product.basePrice) *
                  100
              )}
              %
            </span>
          </>
        ) : (
          <span>{formatPrice(product.basePrice)}</span>
        )}
      </h3>

      <h4 style={{ marginTop: "30px", color: "#111" }}>Phân loại sản phẩm:</h4>
      {product.variants?.map((variant) => (
        <div
          key={variant.id}
          style={{
            ...styles.variantCard,
            ...(selectedVariant?.id === variant.id ? styles.activeVariant : {}),
          }}
          onClick={() => setSelectedVariant(variant)}
        >
          <p>
            <strong>Size:</strong> {variant.size || "N/A"} |{" "}
            <strong>Chất liệu:</strong> {variant.material || "N/A"}
          </p>
          <p>
            💎 Giá:{" "}
            <strong>
              {variant.price
                ? formatPrice(variant.price)
                : formatPrice(product.discountPrice ?? product.basePrice)}
            </strong>
          </p>
        </div>
      ))}

      <div style={styles.qtyBox}>
        <label htmlFor="qty">Số lượng:</label>
        <input
          type="number"
          id="qty"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={styles.qtyInput}
        />
      </div>

      <div style={styles.buttons}>
        <button
          style={styles.btn}
          onClick={addToCart}
          onMouseEnter={(e) => (e.target.style.background = "#333")}
          onMouseLeave={(e) => (e.target.style.background = "#111")}
        >
          🛒 Thêm vào giỏ hàng
        </button>

        <button
          style={{ ...styles.btn, ...styles.wishlistBtn }}
          onClick={addToWishlist}
          onMouseEnter={(e) => (e.target.style.background = "#bca98a")}
          onMouseLeave={(e) => (e.target.style.background = "#d1bfa7")}
        >
          💖 Thêm yêu thích
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
