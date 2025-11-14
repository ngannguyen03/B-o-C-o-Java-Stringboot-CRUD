import React, { useEffect, useState } from "react";
import { productsAPI, cartAPI } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useLocation } from "react-router-dom";
import "../../styles/client/product-list.css";

const API_BASE = "http://localhost:8080";

// ===============================
// 🧩 Component con: ProductCard
// ===============================
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const images = product.images || [];
  const isActive = product.isActive ?? product.active ?? false;
  const fallbackImage = `${API_BASE}/images/default-product.jpg`;

  return (
    <div className="product-card">
      {/* ❤️ Nút yêu thích */}
      <button 
        className={`favorite-btn ${isInWishlist ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleWishlist(product);
        }}
      >
        <span className="heart-icon">
          {isInWishlist ? '❤️' : '🤍'}
        </span>
      </button>

      {/* 🏷️ Badge danh mục */}
      {product.categoryName && (
        <div className="category-badge">
          {product.categoryName}
        </div>
      )}

      {/* 🖼 Ảnh sản phẩm */}
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="product-image-container">
          {images.length > 0 ? (
            <img 
              src={images[0].imageUrl.startsWith("http") ? images[0].imageUrl : `${API_BASE}${images[0].imageUrl.startsWith("/") ? "" : "/"}${images[0].imageUrl}`} 
              alt={product.name}
              className="product-image"
              onError={(e) => (e.target.src = fallbackImage)}
            />
          ) : (
            <div className="product-image-placeholder">
              <span>💎</span>
            </div>
          )}
        </div>

        {/* 📝 Thông tin sản phẩm */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description?.length > 60
              ? product.description.slice(0, 60) + "..."
              : product.description || "Không có mô tả"}
          </p>
          
          {/* 💰 Giá */}
          <div className="price-container">
            <p className="price-tag">
              {product.discountPrice ? (
                <>
                  <span className="discount-price">
                    {product.discountPrice?.toLocaleString("vi-VN")} ₫
                  </span>
                  <span className="original-price">
                    {product.basePrice?.toLocaleString("vi-VN")} ₫
                  </span>
                </>
              ) : (
                <span className="normal-price">
                  {product.basePrice?.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>

      {/* 🔘 Nút hành động */}
      <div className="action-buttons">
        <button 
          className={`add-to-cart-btn ${!isActive ? "disabled" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onAddToCart(product);
          }}
          disabled={!isActive}
        >
          {isActive ? "🛒 Thêm giỏ" : "❌ Ngừng KD"}
        </button>
        <Link 
          to={`/products/${product.id}`}
          className="view-detail-btn"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          👁️ Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

// ===============================
// 🧩 Component chính: ProductList
// ===============================
const ProductList = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
  });
  const [wishlist, setWishlist] = useState(new Set());
  const [searchTimeout, setSearchTimeout] = useState(null);

  // 🎯 Đọc query params từ URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const nameParam = searchParams.get('name');
    
    console.log("🔍 Query params từ URL:", { nameParam }); // Debug
    
    if (nameParam && nameParam !== filters.name) {
      setFilters(prev => ({
        ...prev,
        name: nameParam
      }));
      
      // Tự động fetch products với search term sau khi update state
      setTimeout(() => {
        fetchProductsWithName(nameParam);
      }, 100);
    } else {
      // Nếu không có query param, load tất cả sản phẩm
      fetchProducts();
    }
    
    loadWishlist();
  }, [location.search]); // Chạy lại khi URL thay đổi

  // 🧩 Load wishlist từ localStorage
  const loadWishlist = () => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem("productFavorites")) || [];
      setWishlist(new Set(storedFavorites));
    } catch (error) {
      console.error("❌ Lỗi khi tải wishlist:", error);
      setWishlist(new Set());
    }
  };

  // 🎯 Hàm fetch products với name cụ thể (dùng cho query params)
  const fetchProductsWithName = async (searchName) => {
    setLoading(true);
    try {
      const params = { name: searchName.trim() };
      
      console.log("🔍 Fetch với search name:", searchName); // Debug

      const res = await productsAPI.getAll(params);
      
      // ✅ Extract array từ response API
      const productsData = res.data._embedded?.productResponseDTOList || 
                         res.data.content || 
                         res.data || 
                         [];
      
      console.log("📦 Dữ liệu nhận được từ search:", productsData); // Debug
      setProducts(productsData);
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
      toast.error("❌ Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      
      // Xử lý params name
      if (filters.name && filters.name.trim() !== "") {
        params.name = filters.name.trim();
      }
      
      // Xử lý params giá
      if (filters.minPrice && !isNaN(filters.minPrice) && parseInt(filters.minPrice) > 0) {
        params.minPrice = parseInt(filters.minPrice);
      }
      
      if (filters.maxPrice && !isNaN(filters.maxPrice) && parseInt(filters.maxPrice) > 0) {
        params.maxPrice = parseInt(filters.maxPrice);
      }

      console.log("🔍 Params gửi đến API:", params); // Debug

      const res = await productsAPI.getAll(params);
      
      // ✅ Extract array từ response API
      const productsData = res.data._embedded?.productResponseDTOList || 
                         res.data.content || 
                         res.data || 
                         [];
      
      console.log("📦 Dữ liệu nhận được:", productsData); // Debug
      setProducts(productsData);
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
      toast.error("❌ Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Xử lý tìm kiếm tự động với debounce
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Clear timeout cũ nếu có
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Cập nhật state ngay lập tức
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Đặt timeout mới để gọi API sau 500ms
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 500);
    setSearchTimeout(timeout);
  };

  // 🛒 Thêm vào giỏ hàng với database
  const addToCart = async (product) => {
    try {
      const variantId = product.variants?.[0]?.id;
      if (!variantId) {
        toast.error("⚠️ Sản phẩm không có biến thể, không thể thêm vào giỏ hàng!");
        return;
      }

      toast.info(
        <div>
          <div>🛒 <strong>Đang thêm vào giỏ hàng...</strong></div>
          <div style={{ fontSize: "14px", marginTop: "4px" }}>{product.name}</div>
        </div>,
        { position: "top-right", autoClose: 1000 }
      );
      
      const payload = { productVariantId: variantId, quantity: 1 };
      await cartAPI.addItemToCart(payload);

      toast.success(
        <div>
          <div>✅ <strong>Đã thêm vào giỏ hàng!</strong></div>
          <div style={{ fontSize: "14px", marginTop: "4px" }}>{product.name}</div>
          <div style={{ fontSize: "12px", marginTop: "2px", color: "#666" }}>
            Xem trong trang Giỏ hàng
          </div>
        </div>,
        { position: "top-right", autoClose: 3000 }
      );
    } catch (err) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
      
      let errorMessage = "Không thể thêm vào giỏ hàng!";
      if (err.response?.status === 401) {
        errorMessage = "Vui lòng đăng nhập để thêm vào giỏ hàng!";
      } else if (err.response?.status === 404) {
        errorMessage = "Sản phẩm không tồn tại!";
      }
      
      toast.error(
        <div>
          <div>❌ <strong>{errorMessage}</strong></div>
        </div>,
        { position: "top-right", autoClose: 4000 }
      );
    }
  };

  // 💖 Toggle Wishlist với localStorage
  const toggleWishlist = async (product) => {
    try {
      const newWishlist = new Set(wishlist);
      
      if (newWishlist.has(product.id)) {
        // Xóa khỏi wishlist
        newWishlist.delete(product.id);
        
        // Xóa khỏi localStorage wishlist items
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const updatedWishlist = currentWishlist.filter(item => item.id !== product.id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        toast.info(
          <div>
            <div>💔 <strong>Đã xóa khỏi yêu thích!</strong></div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>{product.name}</div>
          </div>,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          }
        );
      } else {
        // Thêm vào wishlist
        newWishlist.add(product.id);
        
        // Thêm vào localStorage wishlist items
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.discountPrice || product.basePrice,
          imageUrl: product.images?.[0]?.imageUrl || "",
          basePrice: product.basePrice,
          discountPrice: product.discountPrice,
          description: product.description,
          categoryName: product.categoryName,
          variants: product.variants || []
        };
        
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const existingItem = currentWishlist.find(item => item.id === product.id);
        if (!existingItem) {
          currentWishlist.push(wishlistItem);
          localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        }
        
        toast.success(
          <div>
            <div>💖 <strong>Đã thêm vào yêu thích!</strong></div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>{product.name}</div>
            <div style={{ fontSize: "12px", marginTop: "2px", color: "#666" }}>
              Xem trong trang Bộ sưu tập
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          }
        );
      }
      
      // Cập nhật state và localStorage cho favorites IDs
      setWishlist(newWishlist);
      localStorage.setItem('productFavorites', JSON.stringify([...newWishlist]));
      
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật yêu thích:", error);
      toast.error(
        <div>
          <div>❌ <strong>Lỗi khi cập nhật yêu thích!</strong></div>
          <div style={{ fontSize: "14px", marginTop: "4px" }}>{product.name}</div>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      minPrice: "",
      maxPrice: "",
    });
    // Clear timeout khi xóa filter
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    // Gọi API ngay lập tức
    fetchProducts();
  };

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  if (loading) return <div className="loading">⏳ Đang tải sản phẩm...</div>;

  return (
    <div className="product-list-page">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <h2 className="page-title">🛍️ Danh sách sản phẩm</h2>

      {/* 🔍 Bộ lọc */}
      <div className="filters">
        <input
          type="text"
          name="name"
          placeholder="🔎 Tìm theo tên..."
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="💰 Giá thấp nhất"
          value={filters.minPrice}
          onChange={handleFilterChange}
          min="0"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="💰 Giá cao nhất"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          min="0"
        />
        <button 
          className="clear-filters-btn"
          onClick={handleClearFilters}
        >
          🗑️ Xóa lọc
        </button>
      </div>

      {/* 📊 Thông tin kết quả */}
      <div className="results-info">
        <span>
          📊 Tìm thấy <strong>{products.length}</strong> sản phẩm
          {filters.name && ` cho từ khóa "${filters.name}"`}
          {(filters.minPrice || filters.maxPrice) && ` trong khoảng giá ${filters.minPrice ? `từ ${parseInt(filters.minPrice).toLocaleString("vi-VN")}₫` : ''} ${filters.maxPrice ? `đến ${parseInt(filters.maxPrice).toLocaleString("vi-VN")}₫` : ''}`}
        </span>
      </div>

      {/* 💎 Danh sách sản phẩm */}
      <div className="products-list">
        {products.length > 0 ? (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isInWishlist={wishlist.has(p.id)}
            />
          ))
        ) : (
          <div className="no-products">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ marginBottom: "12px", color: "#1e293b" }}>Không tìm thấy sản phẩm nào</h3>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
            <button 
              className="back-to-shopping"
              onClick={handleClearFilters}
            >
              ↻ Hiển thị tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;