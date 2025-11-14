import React, { useEffect, useState, useRef } from "react";
import { cartAPI, wishlistAPI } from "../../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:8080";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🧩 Load wishlist từ database
  useEffect(() => {
    loadWishlistFromDB();
  }, []);

  const loadWishlistFromDB = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      const wishlistItems = response.data || [];

      const formattedWishlist = wishlistItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.basePrice || item.price,
        imageUrl: item.imageUrl || item.images?.[0]?.imageUrl,
        description: item.description,
        variantId: item.variants?.[0]?.id,
        productId: item.id,
        images: item.images || []
      }));

      setWishlist(formattedWishlist);

    } catch (error) {
      console.error("❌ Lỗi khi tải wishlist từ database:", error);
      const stored = localStorage.getItem("wishlist");
      if (stored) setWishlist(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Xóa khỏi wishlist
  const removeFromWishlist = async (variantId) => {
    try {
      await wishlistAPI.removeFromWishlist(variantId);

      // cập nhật FE
      const updated = wishlist.filter(item => item.variantId !== variantId);
      setWishlist(updated);

      // cập nhật localStorage fav
      const savedFavs = JSON.parse(localStorage.getItem("productFavorites") || "[]");
      const newFavs = savedFavs.filter(id => id !== variantId);
      localStorage.setItem("productFavorites", JSON.stringify(newFavs));

      toast.success("🗑 Đã xóa khỏi yêu thích!");

    } catch (error) {
      console.error("❌ Lỗi khi xoá wishlist:", error);
      toast.error("❌ Không thể xoá khỏi yêu thích!");
    }
  };

  // 🛒 Thêm vào giỏ hàng
  const handleAddToCart = async (item) => {
    try {
      const variantId = item.variantId;
      if (!variantId) {
        toast.error("⚠️ Không có biến thể!");
        return;
      }

      toast.info(`🛒 Đang thêm ${item.name}...`, { autoClose: 900 });

      await cartAPI.addItemToCart({
        productVariantId: variantId,
        quantity: 1
      });

      toast.success(`✅ Đã thêm ${item.name} vào giỏ hàng!`);

    } catch (error) {
      console.error("❌ Lỗi thêm vào giỏ:", error);
      toast.error("❌ Không thể thêm vào giỏ hàng!");
    }
  };

  if (loading)
    return (
      <div style={{
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px",
        color: "#4b5563"
      }}>
        ⏳ Đang tải danh sách yêu thích...
      </div>
    );

  if (wishlist.length === 0)
    return (
      <div style={{
        textAlign: "center",
        marginTop: "100px",
        padding: "40px"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>💔</div>
        <h3 style={{
          fontSize: "24px",
          color: "#6b7280",
          marginBottom: "16px"
        }}>
          Danh sách yêu thích trống
        </h3>
        <p style={{
          color: "#9ca3af",
          marginBottom: "30px",
          fontSize: "16px"
        }}>
          Hãy thêm sản phẩm yêu thích từ trang chủ!
        </p>
        <button
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3b82f6, #1e40af)",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
          }}
          onClick={() => navigate("/products")}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          ← Quay lại mua sắm
        </button>
      </div>
    );

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "40px",
          }}
        >
          💖 Danh sách yêu thích
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
            justifyItems: "center",
          }}
        >
          {wishlist.map((item) => (
            <WishlistCard
              key={item.variantId}
              item={item}
              onAddToCart={handleAddToCart}
              onRemove={() => removeFromWishlist(item.variantId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===============================
   🧩 Component con: WishlistCard
   =============================== */
function WishlistCard({ item, onAddToCart, onRemove }) {
  const sliderRef = useRef(null);
  const images = item.images?.length
    ? item.images
    : [{ imageUrl: item.imageUrl || "/images/default-product.jpg" }];

  useEffect(() => {
    if (!sliderRef.current || images.length <= 1) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length;
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        width: "100%",
        maxWidth: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #e2e8f0",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
      }}
    >
      {/* 🖼 Slide ảnh */}
      <div
        ref={sliderRef}
        style={{
          display: "flex",
          overflowX: "hidden",
          scrollBehavior: "smooth",
          width: "100%",
          height: "220px",
          position: "relative",
        }}
      >
        {images.map((img, idx) => {
          const imageUrl = img.imageUrl?.startsWith("http")
            ? img.imageUrl
            : `${API_BASE}${img.imageUrl}`;
          return (
            <img
              key={idx}
              src={imageUrl}
              alt={item.name}
              style={{
                flexShrink: 0,
                width: "100%",
                height: "220px",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />
          );
        })}
      </div>

      {/* 🧾 Nội dung */}
      <div
        style={{
          flex: 1,
          width: "100%",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "#1e293b",
            lineHeight: "1.4"
          }}>
            {item.name}
          </h3>

          {item.description && (
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "12px",
              lineHeight: "1.5"
            }}>
              {item.description.length > 80
                ? `${item.description.substring(0, 80)}...`
                : item.description}
            </p>
          )}

          <p style={{
            fontWeight: "700",
            color: "#16a34a",
            fontSize: "18px",
            margin: "0"
          }}>
            {item.price?.toLocaleString("vi-VN")} ₫
          </p>
        </div>

        {/* 🔘 Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            marginTop: "auto",
          }}
        >
          <button
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onClick={() => onAddToCart(item)}
          >
            🛒 Thêm vào giỏ hàng
          </button>

          <button
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onClick={onRemove}
          >
            🗑 Xóa khỏi yêu thích
          </button>

        </div>
      </div>
    </div>
  );
}
