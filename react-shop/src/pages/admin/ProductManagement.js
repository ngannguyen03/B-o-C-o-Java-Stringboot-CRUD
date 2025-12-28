




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/product-management.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 🆕 State cho upload ảnh
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // 🆕 Sử dụng searchParams và outlet context
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: layoutSearch } = useOutletContext();

  // 🆕 Lấy filter từ URL
  const searchTerm = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // 🆕 State cho validation
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    basePrice: "",
    discountPrice: "",
    categoryId: "",
    skuPrefix: ""
  });

  const [fieldStatus, setFieldStatus] = useState({
    name: "",
    basePrice: "",
    discountPrice: "",
    categoryId: "",
    skuPrefix: ""
  });

  // 🆕 State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    discountPrice: "",
    categoryId: "",
    skuPrefix: "",
    isActive: true,
    imageUrl: "" // 🆕 Thêm imageUrl vào form
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const API = "http://localhost:8080/api/admin";
  const CLOUDINARY_CLOUD_NAME = "disykfco9";

  // 🆕 Hàm upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    const cloudName = 'disykfco9';
    const uploadPreset = 'ngan_unsigned_preset';

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error('Upload ảnh thất bại: ' + text);
      }

      const data = await res.json();
      return data.secure_url; // URL ảnh từ Cloudinary
    } catch (error) {
      console.error('Lỗi upload:', error);
      throw error;
    }
  };

  // 🆕 Hàm xử lý hiển thị ảnh (giống Home)
  const getImageUrl = (product) => {
    // Nếu product có images array (giống Home)
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.imageUrl && firstImage.imageUrl.includes('cloudinary.com')) {
        return firstImage.imageUrl;
      } else if (firstImage.imageUrl && !firstImage.imageUrl.startsWith('http')) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${firstImage.imageUrl}`;
      } else if (firstImage.imageUrl && firstImage.imageUrl.startsWith('http')) {
        return firstImage.imageUrl;
      }
    }

    // Nếu product có imageUrl cũ
    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      return product.imageUrl;
    } else if (product.imageUrl && !product.imageUrl.startsWith('http')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.imageUrl}`;
    } else if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }

    // Fallback
    return "/images/default-product.jpg";
  };

  // 🔹 Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Tên sản phẩm không được để trống";
    if (name.length < 2) return "Tên sản phẩm phải có ít nhất 2 ký tự";
    if (name.length > 100) return "Tên sản phẩm không được vượt quá 100 ký tự";
    return "";
  };

  const validateBasePrice = (price) => {
    if (!price) return "Giá gốc không được để trống";
    if (isNaN(price) || Number(price) < 0) return "Giá gốc phải là số dương";
    if (Number(price) > 1000000000) return "Giá gốc quá lớn";
    return "";
  };

  const validateDiscountPrice = (price, basePrice) => {
    if (price && (isNaN(price) || Number(price) < 0)) return "Giá khuyến mãi phải là số dương";
    if (price && Number(price) > Number(basePrice)) return "Giá khuyến mãi không được lớn hơn giá gốc";
    return "";
  };

  const validateCategory = (categoryId) => {
    if (!categoryId) return "Vui lòng chọn danh mục";
    return "";
  };

  const validateSkuPrefix = (sku) => {
    if (sku && !/^[A-Z0-9]{2,10}$/.test(sku)) return "Mã SKU phải gồm 2-10 ký tự viết hoa và số";
    return "";
  };

  // 🔹 Real-time validation
  const validateField = (name, value) => {
    let error = "";
    let status = "";

    switch (name) {
      case "name":
        error = validateName(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "basePrice":
        error = validateBasePrice(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "discountPrice":
        error = validateDiscountPrice(value, form.basePrice);
        status = error ? "error" : value ? "success" : "";
        break;
      case "categoryId":
        error = validateCategory(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "skuPrefix":
        error = validateSkuPrefix(value);
        status = error ? "error" : value ? "success" : "";
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setFieldStatus(prev => ({
      ...prev,
      [name]: status
    }));
  };

  // 🔹 Hàm cập nhật URL parameters
  const updateURLParams = (updates) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    setSearchParams(newSearchParams);
  };

  // 🔹 Hàm xử lý filter
  const handleFilter = (type, value) => {
    updateURLParams({ [type]: value, page: "1" });
  };

  // 🔹 Hàm xóa tất cả filter
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    setSearchParams(params);
  };

  // 🔹 Load danh sách sản phẩm & danh mục
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 🔹 Lọc sản phẩm khi products hoặc filter thay đổi
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // 🔹 Cập nhật displayed products và current page
  useEffect(() => {
    updateDisplayedProducts();
  }, [filteredProducts, currentPage]);


  // 🔹 Xử lý search từ layout
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (layoutSearch && layoutSearch.trim() !== "") {
      newParams.set("search", layoutSearch.trim());
      newParams.set("page", "1");
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  }, [layoutSearch]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);

      const res = await axios.get(`${API}/products?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
      toast.error("❌ Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh mục:", err);
      toast.error("❌ Không thể tải danh sách danh mục!");
    }
  };

  // 🔹 Lọc sản phẩm client-side theo tất cả điều kiện
  const filterProducts = () => {
    let filtered = [...products];

    // 1️⃣ Lọc theo search term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.skuPrefix?.toLowerCase().includes(lower)
      );
    }

    // 2️⃣ Lọc theo danh mục
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (p) => String(p.categoryId) === String(categoryFilter)
      );
    }

    // 3️⃣ Lọc theo trạng thái
    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => p.isActive === false);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // 🆕 Cập nhật sản phẩm hiển thị theo trang hiện tại
  const updateDisplayedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  // 🆕 Tính toán số trang
  const getTotalPages = () => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  };

  // 🆕 Chuyển trang
  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };


  // 🆕 Chuyển đến trang trước
  const goToPreviousPage = () =>
  currentPage > 1 && setCurrentPage(currentPage - 1);

  // 🆕 Chuyển đến trang tiếp theo
 const goToNextPage = () =>
  currentPage < getTotalPages() && setCurrentPage(currentPage + 1);

  // 🆕 Tạo danh sách các trang để hiển thị
  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pageNumbers;
  };

  // 🧩 Xử lý input thay đổi với validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // 🆕 Real-time validation
    validateField(name, newValue);
  };

  // 🆕 Xử lý chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  };

  // 🆕 Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm(prev => ({ ...prev, imageUrl: "" }));
  };

  // 🔹 Mở popup form
  const openForm = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name,
        description: product.description || "",
        basePrice: product.basePrice,
        discountPrice: product.discountPrice || "",
        categoryId: product.categoryId || "",
        skuPrefix: product.skuPrefix || "",
        isActive: product.isActive === true || product.isActive === 1,
        imageUrl: product.imageUrl || "" // 🆕 Thêm imageUrl
      });

      // 🆕 Set preview ảnh nếu có
      setImagePreview(product.imageUrl || "");
      setImageFile(null);

      // 🆕 Reset validation khi mở form chỉnh sửa
      setValidationErrors({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
      setFieldStatus({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        description: "",
        basePrice: "",
        discountPrice: "",
        categoryId: "",
        skuPrefix: "",
        isActive: true,
        imageUrl: "" // 🆕 Reset imageUrl
      });
      setImageFile(null);
      setImagePreview("");
      setValidationErrors({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
      setFieldStatus({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
    }
    setShowForm(true);
  };

  // 🔹 Đóng popup form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      basePrice: "",
      discountPrice: "",
      categoryId: "",
      skuPrefix: "",
      isActive: true,
      imageUrl: "" // 🆕 Reset imageUrl
    });
    setImageFile(null);
    setImagePreview("");
    setValidationErrors({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
    setFieldStatus({ name: "", basePrice: "", discountPrice: "", categoryId: "", skuPrefix: "" });
  };

  // 🔹 Validate toàn bộ form trước khi submit
  const validateForm = () => {
    const errors = {
      name: validateName(form.name),
      basePrice: validateBasePrice(form.basePrice),
      discountPrice: validateDiscountPrice(form.discountPrice, form.basePrice),
      categoryId: validateCategory(form.categoryId),
      skuPrefix: validateSkuPrefix(form.skuPrefix)
    };

    setValidationErrors(errors);

    const status = {
      name: errors.name ? "error" : form.name ? "success" : "",
      basePrice: errors.basePrice ? "error" : form.basePrice ? "success" : "",
      discountPrice: errors.discountPrice ? "error" : form.discountPrice ? "success" : "",
      categoryId: errors.categoryId ? "error" : form.categoryId ? "success" : "",
      skuPrefix: errors.skuPrefix ? "error" : form.skuPrefix ? "success" : ""
    };
    setFieldStatus(status);

    return !errors.name && !errors.basePrice && !errors.discountPrice && !errors.categoryId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧩 Validate form trước khi gửi
    if (!validateForm()) {
      toast.error(
        <div>
          <div>❌ <strong>Vui lòng kiểm tra lại thông tin!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Có lỗi validation trong form sản phẩm.
          </div>
        </div>
      );
      return;
    }

    try {
      setUploadingImage(true);

      let imageUrl = form.imageUrl;

      // 🆕 Upload ảnh mới nếu có
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
          toast.success("📸 Ảnh sản phẩm đã được tải lên Cloudinary!");
        } catch (uploadError) {
          console.error("❌ Lỗi upload ảnh:", uploadError);
          toast.warning("⚠️ Lưu sản phẩm thành công nhưng upload ảnh thất bại.");
        }
      }

      // 🆕 Chuẩn bị dữ liệu gửi lên server
      const submitData = {
        ...form,
        imageUrl: imageUrl || null
      };

      if (editingId) {
        // ✏️ Cập nhật sản phẩm
        await axios.put(`${API}/products/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(
          <div>
            <div>✅ <strong>Cập nhật sản phẩm thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Sản phẩm "{form.name}" đã được cập nhật.
            </div>
          </div>
        );
      } else {
        // 🆕 Thêm mới sản phẩm
        await axios.post(`${API}/products`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(
          <div>
            <div>✅ <strong>Thêm sản phẩm thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Sản phẩm "{form.name}" đã được thêm vào hệ thống.
            </div>
          </div>
        );
      }

      // 🔄 Làm mới giao diện
      closeForm();
      fetchProducts();
    } catch (err) {
      console.error("⚠️ Lỗi khi lưu sản phẩm:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể lưu sản phẩm!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Vui lòng thử lại."}
          </div>
        </div>
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) return;

    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(
        <div>
          <div>🗑️ <strong>Xóa sản phẩm thành công!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Sản phẩm "{name}" đã được xóa.
          </div>
        </div>
      );
      fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể xóa sản phẩm!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Sản phẩm có thể đang được sử dụng."}
          </div>
        </div>
      );
    }
  };

  // 🆕 Hàm lấy class validation
  const getValidationClass = (fieldName) => {
    const status = fieldStatus[fieldName];
    if (!status) return "";
    return `input-${status} validation-pulse`;
  };

  if (loading) return <div className="loading">⏳ Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="product-management dark-mode">
      {/* 🎯 Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h2 className="page-title">💎 Quản lý sản phẩm</h2>

      {/* 🔍 Hiển thị active filters */}
      {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
        <div className="active-filters">
          <span>Bộ lọc đang áp dụng:</span>
          {searchTerm && (
            <span className="filter-tag">
              Tìm kiếm: "{searchTerm}"
              <button onClick={() => handleFilter('search', '')}>×</button>
            </span>
          )}
          {categoryFilter !== "all" && (
            <span className="filter-tag">
              Danh mục: {categories.find(cat => cat.id == categoryFilter)?.name}
              <button onClick={() => handleFilter('category', 'all')}>×</button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="filter-tag">
              Trạng thái: {statusFilter === 'active' ? 'Đang bán' : 'Ngừng bán'}
              <button onClick={() => handleFilter('status', 'all')}>×</button>
            </span>
          )}
          <button onClick={clearAllFilters} className="clear-all-btn">
            Xóa tất cả
          </button>
        </div>
      )}

      {/* 🔍 Bộ lọc và nút thêm mới */}
      <div className="product-header">
        <div className="filter-section">
          <div className="filter-group">
            <label>Danh mục:</label>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilter('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          <div className="filter-stats">
            Hiển thị {filteredProducts.length} sản phẩm
            {searchTerm && ` cho "${searchTerm}"`}
          </div>
        </div>

        <button
          className="add-btn primary"
          onClick={() => openForm()}
        >
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {/* 📋 BẢNG DANH SÁCH - CẬP NHẬT HIỂN THỊ ẢNH */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Mã SKU</th>
            <th>Giá gốc</th>
            <th>Giá KM</th>
            <th>Danh mục</th>
            <th>Hoạt động</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((p) => {
              const category = categories.find((c) => c.id === p.categoryId);
              const imageUrl = getImageUrl(p); // 🆕 Sử dụng hàm xử lý ảnh mới

              return (
                <tr key={p.id}>
                  <td className="image-cell">
                    {imageUrl && imageUrl !== "/images/default-product.jpg" ? (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = "/images/default-product.jpg";
                        }}
                      />
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </td>
                  <td>{p.id}</td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                        {p.description.length > 50
                          ? `${p.description.substring(0, 50)}...`
                          : p.description}
                      </div>
                    )}
                  </td>
                  <td>{p.skuPrefix || "—"}</td>
                  <td className="price-cell">{p.basePrice?.toLocaleString("vi-VN")} ₫</td>
                  <td className="price-cell">
                    {p.discountPrice
                      ? `${p.discountPrice.toLocaleString("vi-VN")} ₫`
                      : "—"}
                  </td>
                  <td>{category ? category.name : "—"}</td>
                  <td>
                    <span className={p.isActive ? "status-active" : "status-inactive"}>
                      {p.isActive ? "✅" : "❌"}
                    </span>
                  </td>
                  <td className="date-cell">
                    {p.createdAt
                      ? new Date(p.createdAt.replace(" ", "T")).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="date-cell">
                    {p.updatedAt
                      ? new Date(p.updatedAt.replace(" ", "T")).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => openForm(p)}
                        title="Sửa sản phẩm"
                      >
                        ✏️
                      </button>

                      <button
                        className="action-btn variant"
                        onClick={() => navigate(`/admin/products/${p.id}/variants`)}
                        title="Quản lý biến thể"
                      >
                        ⚙️
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Xóa sản phẩm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="no-data">
                {products.length === 0
                  ? "Không có sản phẩm nào trong hệ thống."
                  : "Không tìm thấy sản phẩm phù hợp với bộ lọc."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination - HIỂN THỊ KHI CÓ ÍT NHẤT 1 SẢN PHẨM */}
      {filteredProducts.length > 0 && (
        <div className="product-pagination-container">
          <div className="product-pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title="Trang trước"
            >
              ←
            </button>

            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' ? goToPage(pageNum) : null}
                className={pageNum === currentPage ? 'active' : ''}
                disabled={pageNum === '...'}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === getTotalPages()}
              title="Trang tiếp"
            >
              →
            </button>
          </div>

          <div className="cate-pagination-info">
            Hiển thị {displayedProducts.length} trong tổng số {filteredProducts.length} sản phẩm
            - Trang {currentPage} / {getTotalPages()}
          </div>
        </div>
      )}

      {/* 🪟 Popup Form với Validation và Upload Ảnh - GIỮ NGUYÊN */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm mới"}</h3>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleSubmit} className="product-form product-validation">
                {/* Tên sản phẩm */}
                <div className="form-group required">
                  <label>Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nhập tên sản phẩm"
                    value={form.name}
                    onChange={handleChange}
                    className={getValidationClass('name')}
                    required
                  />
                  {validationErrors.name && (
                    <span className="validation-message error">
                      ❌ {validationErrors.name}
                    </span>
                  )}
                  {!validationErrors.name && form.name && (
                    <span className="validation-message success">
                      ✅ Tên sản phẩm hợp lệ
                    </span>
                  )}
                </div>

                {/* Mã SKU */}
                <div className="form-group">
                  <label>Mã SKU</label>
                  <input
                    type="text"
                    name="skuPrefix"
                    placeholder="Nhập mã SKU (VD: NKCV, NCTV...)"
                    value={form.skuPrefix}
                    onChange={handleChange}
                    className={getValidationClass('skuPrefix')}
                  />
                  {validationErrors.skuPrefix && (
                    <span className="validation-message error">
                      ❌ {validationErrors.skuPrefix}
                    </span>
                  )}
                  {!validationErrors.skuPrefix && form.skuPrefix && (
                    <span className="validation-message success">
                      ✅ Mã SKU hợp lệ
                    </span>
                  )}
                </div>

                {/* Giá gốc và Giá khuyến mãi */}
                <div className="form-row">
                  <div className="form-group required">
                    <label>Giá gốc</label>
                    <input
                      type="number"
                      name="basePrice"
                      placeholder="Nhập giá gốc"
                      value={form.basePrice}
                      onChange={handleChange}
                      className={getValidationClass('basePrice')}
                      required
                    />
                    {validationErrors.basePrice && (
                      <span className="validation-message error">
                        ❌ {validationErrors.basePrice}
                      </span>
                    )}
                    {!validationErrors.basePrice && form.basePrice && (
                      <span className="validation-message success">
                        ✅ Giá gốc hợp lệ
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Giá khuyến mãi</label>
                    <input
                      type="number"
                      name="discountPrice"
                      placeholder="Nhập giá khuyến mãi"
                      value={form.discountPrice}
                      onChange={handleChange}
                      className={getValidationClass('discountPrice')}
                    />
                    {validationErrors.discountPrice && (
                      <span className="validation-message error">
                        ❌ {validationErrors.discountPrice}
                      </span>
                    )}
                    {!validationErrors.discountPrice && form.discountPrice && (
                      <span className="validation-message success">
                        ✅ Giá khuyến mãi hợp lệ
                      </span>
                    )}
                  </div>
                </div>

                {/* Danh mục và Trạng thái */}
                <div className="form-row">
                  <div className="form-group required">
                    <label>Danh mục</label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className={getValidationClass('categoryId')}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.categoryId && (
                      <span className="validation-message error">
                        ❌ {validationErrors.categoryId}
                      </span>
                    )}
                    {!validationErrors.categoryId && form.categoryId && (
                      <span className="validation-message success">
                        ✅ Đã chọn danh mục
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Sản phẩm đang hoạt động
                    </label>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="form-group">
                  <label>Mô tả sản phẩm</label>
                  <textarea
                    name="description"
                    placeholder="Nhập mô tả sản phẩm..."
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  ></textarea>
                </div>

                {/* 🆕 PHẦN UPLOAD ẢNH - GIỮ NGUYÊN */}
                <div className="form-group">
                  <label>Ảnh sản phẩm</label>

                  {/* Input upload file */}
                  <div className="image-upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                    />
                    <div className="image-upload-hint">
                      📸 Chọn ảnh từ máy tính (PNG, JPG, JPEG - tối đa 5MB)
                    </div>
                  </div>

                  {/* Hoặc nhập URL */}
                  <div className="image-url-section">
                    <label>Hoặc nhập URL ảnh:</label>
                    <input
                      type="text"
                      name="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={form.imageUrl}
                      onChange={handleChange}
                      className="image-url-input"
                    />
                  </div>

                  {/* Preview ảnh */}
                  {(imagePreview || form.imageUrl) && (
                    <div className="image-preview-section">
                      <label>Xem trước ảnh:</label>
                      <div className="image-preview">
                        <img
                          src={imagePreview || form.imageUrl}
                          alt="Preview"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                          title="Xóa ảnh"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="action-btn save"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>⏳ Đang xử lý...</>
                    ) : editingId ? (
                      "💾 Cập nhật"
                    ) : (
                      "➕ Thêm mới"
                    )}
                  </button>
                  <button type="button" className="action-btn cancel" onClick={closeForm}>
                    ❌ Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;