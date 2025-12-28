

import React, { useEffect, useState } from "react";
import { productsAPI, categoriesAPI, cartAPI } from "../../api";
import { bannerAPI } from "../../api/banner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/client/home.css";
import { wishlistAPI } from "../../api/wishlist";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const CLOUDINARY_CLOUD_NAME = "disykfco9";

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // 🧩 Load favorites từ localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('productFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 🧩 Hàm xử lý ảnh sản phẩm (đồng bộ với ProductManagement)
  const processProductImages = (product) => {
    // Nếu product có images array
    if (product.images && product.images.length > 0) {
      const processedImages = product.images.map(img => {
        // Nếu imageUrl đã là URL đầy đủ Cloudinary thì giữ nguyên
        if (img.imageUrl && img.imageUrl.includes('cloudinary.com')) {
          return img;
        }
        // Nếu imageUrl chỉ là public_id (không có http)
        else if (img.imageUrl && !img.imageUrl.startsWith('http')) {
          // Tạo URL Cloudinary đầy đủ từ public_id
          const fullImageUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${img.imageUrl}`;
          return { ...img, imageUrl: fullImageUrl };
        }
        // Nếu imageUrl là URL từ server local
        else if (img.imageUrl && img.imageUrl.startsWith('http')) {
          return img;
        }
        // Nếu không có imageUrl hợp lệ
        return {
          ...img,
          imageUrl: "/images/default-product.jpg"
        };
      });
      return { ...product, images: processedImages };
    }
    
    // 🆕 Nếu product có imageUrl cũ (từ ProductManagement)
    if (product.imageUrl) {
      let processedImageUrl = product.imageUrl;
      
      if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
        // Giữ nguyên URL Cloudinary đầy đủ
        processedImageUrl = product.imageUrl;
      } else if (product.imageUrl && !product.imageUrl.startsWith('http')) {
        // Tạo URL Cloudinary đầy đủ từ public_id
        processedImageUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.imageUrl}`;
      }
      
      return {
        ...product,
        images: [{
          imageUrl: processedImageUrl,
          id: 'main',
          isPrimary: true
        }]
      };
    }
    
    // Nếu product không có images hoặc imageUrl
    return {
      ...product,
      images: [{
        imageUrl: "/images/default-product.jpg",
        id: 'default',
        isPrimary: true
      }]
    };
  };

  // 🧩 Gọi song song dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, productsRes, categoriesRes] = await Promise.all([
          bannerAPI.getAll(),
          productsAPI.getAll(),
          categoriesAPI.getAll(),
        ]);
        setBanners(bannerRes.data);
        
        // ✅ Extract array từ response API
        const productsData = productsRes.data._embedded?.productResponseDTOList || 
                           productsRes.data.content || 
                           productsRes.data || 
                           [];
        
        // 🔥 Xử lý hiển thị ảnh sản phẩm
        const processedProducts = productsData.map(processProductImages);
        
        setProducts(processedProducts);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        setProducts([]);
        setBanners([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🧩 Hiệu ứng tự động chuyển banner
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  // 🧩 Lọc theo danh mục
  useEffect(() => {
    const fetchByCategory = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll(
          selectedCategory ? { categoryId: selectedCategory } : {}
        );
        
        const filteredProducts = res.data._embedded?.productResponseDTOList || 
                               res.data.content || 
                               res.data || 
                               [];
        
        // Xử lý ảnh tương tự
        const processedProducts = filteredProducts.map(processProductImages);
        
        setProducts(processedProducts);
      } catch (error) {
        console.error("❌ Lỗi khi lọc sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) fetchByCategory();
  }, [selectedCategory, categories]);

  // 🖼 Component hiển thị ảnh an toàn
  const SafeImage = ({ src, alt, className, fallback = "💎" }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
      console.log(`❌ Lỗi tải ảnh: ${src}`);
      setHasError(true);
      setImgSrc("/images/default-product.jpg");
    };

    if (hasError || !imgSrc) {
      return (
        <div className={`image-fallback ${className}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          fontSize: '24px',
          width: '100%',
          height: '200px',
          borderRadius: '8px'
        }}>
          <span>{fallback}</span>
        </div>
      );
    }

    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
      />
    );
  };

  // 🆕 Hàm lấy ảnh đầu tiên từ sản phẩm (đồng bộ với ProductManagement)
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].imageUrl;
    }
    return "/images/default-product.jpg";
  };

  // ❤️ Toggle favorite
const toggleFavorite = async (product) => {
  try {
    const variantId = product.variants?.[0]?.id;

    if (!variantId) {
      toast.error("❌ Sản phẩm chưa có biến thể!");
      return;
    }

    const newFavorites = new Set(favorites);

    // Nếu đã thích → XÓA
    if (newFavorites.has(variantId)) {
      await wishlistAPI.removeFromWishlist(variantId);
      newFavorites.delete(variantId);
      toast.info("💔 Đã xóa khỏi yêu thích!");
    }

    // Nếu chưa thích → THÊM
    else {
      await wishlistAPI.addToWishlist(variantId);
      newFavorites.add(variantId);
      toast.success("💖 Đã thêm vào yêu thích!");
    }

    setFavorites(newFavorites);
    localStorage.setItem("productFavorites", JSON.stringify([...newFavorites]));

  } catch (error) {
    console.error("❌ Lỗi wishlist:", error);
    toast.error("❌ Không thể cập nhật danh sách yêu thích!");
  }
};


  // 🎯 Xem chi tiết sản phẩm
  const viewProductDetail = (productId) => {
    window.location.href = `/products/${productId}`;
  };

  // 🛒 Thêm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      const variantId = product.variants?.[0]?.id;
      if (!variantId) {
        toast.error("⚠️ Sản phẩm chưa có biến thể!");
        return;
      }

      toast.info("🛒 Đang thêm vào giỏ hàng...");
      
      const payload = { 
        productVariantId: variantId, 
        quantity: 1 
      };
      
      await cartAPI.addItemToCart(payload);
      toast.success("✅ Đã thêm vào giỏ hàng!");
      
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      let errorMessage = "Không thể thêm vào giỏ hàng!";
      if (error.response?.status === 401) {
        errorMessage = "Vui lòng đăng nhập để thêm vào giỏ hàng!";
      }
      toast.error(`❌ ${errorMessage}`);
    }
  };

  if (loading) return <div className="loading-container">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="home-container">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* 🖼 Banner */}
      {banners.length > 0 && (
        <div className="banner-container">
          {banners.map((banner, index) => (
            <a key={banner.id} href={banner.target_url || "#"} className="banner-link">
              
            </a>
          ))}
          <div className="banner-text">
            <div className="banner-title">{banners[currentBanner]?.title || ''}</div>
            <div className="banner-subtitle">{banners[currentBanner]?.subtitle || ''}</div>
          </div>
          <div className="banner-indicators">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>
      )}

      <h1 className="main-heading">💎 Chào mừng bạn đến với Jewelry Shop</h1>

      {/* 📦 Danh mục */}
      <div className="section">
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <div className="category-scroll-container">
          <div className="category-scroll-inner">
            <div
              className={`category-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💍 Sản phẩm */}
      <div className="section">
        <h2 className="section-title">
          {selectedCategory
            ? `Sản phẩm thuộc danh mục ${
                categories.find((c) => c.id === selectedCategory)?.name || ""
              }`
            : "Tất cả sản phẩm nổi bật"}
        </h2>
        <div className="products-list">
          {!products || products.length === 0 ? (
            <p className="no-products">Không có sản phẩm nào.</p>
          ) : (
            products.slice(0, 8).map((product) => (
              <div key={product.id} className="product-card">
                <button 
                  className={`favorite-btn ${favorites.has(product.variants?.[0]?.id)
                  ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product)}
                >
                  <span className="heart-icon">
                    {favorites.has(product.variants?.[0]?.id) ? '❤' : '🤍'}
                  </span>
                </button>

                <div className="category-badge">
                  {product.categoryName || 'Jewelry'}
                </div>

                {/* 🖼 Ảnh sản phẩm - SỬ DỤNG SAFEIMAGE */}
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <SafeImage 
                      src={getProductImage(product)} 
                      alt={product.name}
                      className="product-image"
                      fallback="💎"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <span>💎</span>
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">
                    {product.description && product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  
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
                        `${product.basePrice?.toLocaleString("vi-VN")} ₫`
                      )}
                    </p>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="view-detail-btn"
                      onClick={() => viewProductDetail(product.id)}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      🛒 Thêm giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;