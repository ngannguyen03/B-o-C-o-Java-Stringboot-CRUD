import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adminProductVariantsAPI from "../../api/admin/productVariants";
import "../../styles/admin/product-variant-management.css";

export default function ProductVariantManagement() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [displayedVariants, setDisplayedVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 🆕 State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 🆕 State cho validation
  const [validationErrors, setValidationErrors] = useState({
    size: "",
    material: "",
    priceModifier: "",
    sku: "",
    quantity: ""
  });
  
  const [fieldStatus, setFieldStatus] = useState({
    size: "",
    material: "",
    priceModifier: "",
    sku: "",
    quantity: ""
  });

  const [form, setForm] = useState({
    size: "",
    material: "",
    priceModifier: "",
    sku: "",
    quantity: "",
  });

  // 🔹 Validation functions
  const validateSize = (size) => {
    if (!size.trim()) return "Kích thước không được để trống";
    if (size.length < 1) return "Kích thước phải có ít nhất 1 ký tự";
    if (size.length > 20) return "Kích thước không được vượt quá 20 ký tự";
    return "";
  };

  const validateMaterial = (material) => {
    if (!material.trim()) return "Chất liệu không được để trống";
    if (material.length < 2) return "Chất liệu phải có ít nhất 2 ký tự";
    if (material.length > 50) return "Chất liệu không được vượt quá 50 ký tự";
    return "";
  };

  const validatePriceModifier = (price) => {
    if (price === "" || price === null) return "";
    if (isNaN(price) || Number(price) < 0) return "Phụ giá phải là số dương";
    if (Number(price) > 100000000) return "Phụ giá quá lớn";
    return "";
  };

  const validateSku = (sku) => {
    if (!sku.trim()) return "Mã SKU không được để trống";
    if (sku.length < 3) return "Mã SKU phải có ít nhất 3 ký tự";
    if (sku.length > 50) return "Mã SKU không được vượt quá 50 ký tự";
    if (!/^[A-Z0-9-]+$/.test(sku)) return "Mã SKU chỉ được chứa chữ hoa, số và dấu gạch ngang";
    return "";
  };

  const validateQuantity = (quantity) => {
    if (quantity === "" || quantity === null) return "Số lượng không được để trống";
    if (isNaN(quantity) || Number(quantity) < 0) return "Số lượng phải là số nguyên dương";
    if (Number(quantity) > 100000) return "Số lượng quá lớn";
    if (!Number.isInteger(Number(quantity))) return "Số lượng phải là số nguyên";
    return "";
  };

  // 🔹 Real-time validation
  const validateField = (name, value) => {
    let error = "";
    let status = "";

    switch (name) {
      case "size":
        error = validateSize(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "material":
        error = validateMaterial(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "priceModifier":
        error = validatePriceModifier(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "sku":
        error = validateSku(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "quantity":
        error = validateQuantity(value);
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

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await adminProductVariantsAPI.getByProduct(productId);
      setVariants(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải biến thể:", err);
      toast.error("❌ Không thể tải danh sách biến thể!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  // 🔹 Cập nhật biến thể hiển thị theo trang hiện tại
  useEffect(() => {
    updateDisplayedVariants();
  }, [variants, currentPage]);

  // 🆕 Cập nhật biến thể hiển thị
  const updateDisplayedVariants = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedVariants(variants.slice(startIndex, endIndex));
  };

  // 🆕 Tính toán số trang
  const getTotalPages = () => {
    return Math.ceil(variants.length / itemsPerPage);
  };

  // 🆕 Chuyển trang
  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // 🆕 Chuyển đến trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 🆕 Chuyển đến trang tiếp theo
  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = value;
    
    setForm((prev) => ({ ...prev, [name]: newValue }));
    
    // 🆕 Real-time validation
    validateField(name, newValue);
  };

  // 🔹 Validate toàn bộ form trước khi submit
  const validateForm = () => {
    const errors = {
      size: validateSize(form.size),
      material: validateMaterial(form.material),
      priceModifier: validatePriceModifier(form.priceModifier),
      sku: validateSku(form.sku),
      quantity: validateQuantity(form.quantity)
    };

    setValidationErrors(errors);

    const status = {
      size: errors.size ? "error" : form.size ? "success" : "",
      material: errors.material ? "error" : form.material ? "success" : "",
      priceModifier: errors.priceModifier ? "error" : form.priceModifier ? "success" : "",
      sku: errors.sku ? "error" : form.sku ? "success" : "",
      quantity: errors.quantity ? "error" : form.quantity ? "success" : ""
    };
    setFieldStatus(status);

    return !errors.size && !errors.material && !errors.sku && !errors.quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🆕 Validate form trước khi submit
    if (!validateForm()) {
      toast.error(
        <div>
          <div>❌ <strong>Vui lòng kiểm tra lại thông tin!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Có lỗi validation trong form biến thể.
          </div>
        </div>
      );
      return;
    }

    try {
      const submitData = {
        ...form,
        priceModifier: form.priceModifier ? Number(form.priceModifier) : 0,
        quantity: Number(form.quantity)
      };

      if (editingId) {
        await adminProductVariantsAPI.update(productId, editingId, submitData);
        toast.success(
          <div>
            <div>✅ <strong>Cập nhật biến thể thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Biến thể "{form.size} - {form.material}" đã được cập nhật.
            </div>
          </div>
        );
      } else {
        await adminProductVariantsAPI.create(productId, submitData);
        toast.success(
          <div>
            <div>✅ <strong>Thêm biến thể thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Biến thể "{form.size} - {form.material}" đã được thêm.
            </div>
          </div>
        );
      }
      
      closeForm();
      fetchVariants();
    } catch (err) {
      console.error("⚠️ Lỗi khi lưu biến thể:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể lưu biến thể!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Mã SKU có thể đã tồn tại. Vui lòng thử lại."}
          </div>
        </div>
      );
    }
  };

  // 🔹 Mở form
  const openForm = (variant = null) => {
    if (variant) {
      setEditingId(variant.id);
      setForm({
        size: variant.size || "",
        material: variant.material || "",
        priceModifier: variant.priceModifier || "",
        sku: variant.sku || "",
        quantity: variant.quantity || "",
      });
    } else {
      setEditingId(null);
      setForm({
        size: "",
        material: "",
        priceModifier: "",
        sku: "",
        quantity: "",
      });
    }
    
    // Reset validation
    setValidationErrors({ size: "", material: "", priceModifier: "", sku: "", quantity: "" });
    setFieldStatus({ size: "", material: "", priceModifier: "", sku: "", quantity: "" });
    setShowForm(true);
  };

  // 🔹 Đóng form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      size: "",
      material: "",
      priceModifier: "",
      sku: "",
      quantity: "",
    });
    setValidationErrors({ size: "", material: "", priceModifier: "", sku: "", quantity: "" });
    setFieldStatus({ size: "", material: "", priceModifier: "", sku: "", quantity: "" });
  };

  const handleEdit = (v) => {
    openForm(v);
  };

  const handleDelete = async (id, variantInfo) => {
    if (!window.confirm(`Bạn có chắc muốn xóa biến thể "${variantInfo}" không?`)) return;
    try {
      await adminProductVariantsAPI.delete(productId, id);
      toast.success(
        <div>
          <div>🗑️ <strong>Xóa biến thể thành công!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Biến thể "{variantInfo}" đã được xóa.
          </div>
        </div>
      );
      fetchVariants();
    } catch (err) {
      console.error("❌ Lỗi khi xóa biến thể:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể xóa biến thể!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Biến thể có thể đang được sử dụng trong đơn hàng."}
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

  // 🆕 Quay lại trang quản lý sản phẩm
  const handleBackToProducts = () => {
    navigate("/admin/products");
  };

  if (loading) return <div className="loading">⏳ Đang tải dữ liệu biến thể...</div>;

  return (
    <div className="variant-management dark-mode">
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

      <div className="variant-header">
        <div className="header-info">
          <button 
            className="back-btn"
            onClick={handleBackToProducts}
            title="Quay lại quản lý sản phẩm"
          >
            ← Quay lại
          </button>
          <h2 className="page-title">🔧 Quản lý Biến thể - Sản phẩm #{productId}</h2>
          <div className="variant-stats">
            Tổng số biến thể: <strong>{variants.length}</strong>
          </div>
        </div>
        
        <button 
          className="add-btn primary"
          onClick={() => openForm()}
        >
          ➕ Thêm biến thể mới
        </button>
      </div>

      {/* Bảng danh sách biến thể */}
      <div className="table-container">
        <table className="variants-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kích thước</th>
              <th>Chất liệu</th>
              <th>SKU</th>
              <th>Phụ giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayedVariants.length > 0 ? (
              displayedVariants.map((v) => (
                <tr key={v.id}>
                  <td className="id-cell">{v.id}</td>
                  <td className="size-cell">
                    <strong>{v.size}</strong>
                  </td>
                  <td className="material-cell">{v.material}</td>
                  <td className="sku-cell">
                    <code>{v.sku}</code>
                  </td>
                  <td className="price-cell">
                    {v.priceModifier 
                      ? `${v.priceModifier.toLocaleString("vi-VN")} ₫`
                      : <span className="no-data">—</span>
                    }
                  </td>
                  <td className="quantity-cell">
                    <span className={v.quantity > 0 ? "in-stock" : "out-of-stock"}>
                      {v.quantity}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span className={v.quantity > 0 ? "status-active" : "status-inactive"}>
                      {v.quantity > 0 ? "✅ Còn hàng" : "❌ Hết hàng"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(v)}
                        title="Sửa biến thể"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(v.id, `${v.size} - ${v.material}`)}
                        title="Xóa biến thể"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div className="empty-text">
                      <h3>Chưa có biến thể nào</h3>
                      <p>Hãy thêm biến thể đầu tiên cho sản phẩm này.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination - HIỂN THỊ KHI CÓ ÍT NHẤT 1 BIẾN THỂ */}
      {variants.length > 0 && (
        <div className="cate-pagination-container">
          <div className="cate-pagination">
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
            Hiển thị {displayedVariants.length} trong tổng số {variants.length} biến thể 
            - Trang {currentPage} / {getTotalPages()}
          </div>
        </div>
      )}

      {/* 🪟 Popup Form với Validation */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "✏️ Chỉnh sửa biến thể" : "➕ Thêm biến thể mới"}</h3>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleSubmit} className="variant-form variant-validation">
                <div className="form-row">
                  <div className="form-group required">
                    <label>Kích thước</label>
                    <input
                      type="text"
                      name="size"
                      placeholder="Ví dụ: M, L, 7, 18cm..."
                      value={form.size}
                      onChange={handleChange}
                      className={getValidationClass('size')}
                      required
                    />
                    {validationErrors.size && (
                      <span className="validation-message error">
                        ❌ {validationErrors.size}
                      </span>
                    )}
                    {!validationErrors.size && form.size && (
                      <span className="validation-message success">
                        ✅ Kích thước hợp lệ
                      </span>
                    )}
                  </div>

                  <div className="form-group required">
                    <label>Chất liệu</label>
                    <input
                      type="text"
                      name="material"
                      placeholder="Ví dụ: Vàng 18K, Bạc, Kim cương..."
                      value={form.material}
                      onChange={handleChange}
                      className={getValidationClass('material')}
                      required
                    />
                    {validationErrors.material && (
                      <span className="validation-message error">
                        ❌ {validationErrors.material}
                      </span>
                    )}
                    {!validationErrors.material && form.material && (
                      <span className="validation-message success">
                        ✅ Chất liệu hợp lệ
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group required">
                    <label>Mã SKU</label>
                    <input
                      type="text"
                      name="sku"
                      placeholder="Ví dụ: NKCV-18K-M, NCTV-SILVER-L..."
                      value={form.sku}
                      onChange={handleChange}
                      className={getValidationClass('sku')}
                      required
                    />
                    {validationErrors.sku && (
                      <span className="validation-message error">
                        ❌ {validationErrors.sku}
                      </span>
                    )}
                    {!validationErrors.sku && form.sku && (
                      <span className="validation-message success">
                        ✅ Mã SKU hợp lệ
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phụ giá (₫)</label>
                    <input
                      type="number"
                      name="priceModifier"
                      placeholder="Nhập phụ giá (0 nếu không có)"
                      value={form.priceModifier}
                      onChange={handleChange}
                      className={getValidationClass('priceModifier')}
                      min="0"
                    />
                    {validationErrors.priceModifier && (
                      <span className="validation-message error">
                        ❌ {validationErrors.priceModifier}
                      </span>
                    )}
                    {!validationErrors.priceModifier && form.priceModifier && (
                      <span className="validation-message success">
                        ✅ Phụ giá hợp lệ
                      </span>
                    )}
                  </div>

                  <div className="form-group required">
                    <label>Số lượng tồn kho</label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Nhập số lượng"
                      value={form.quantity}
                      onChange={handleChange}
                      className={getValidationClass('quantity')}
                      required
                      min="0"
                      step="1"
                    />
                    {validationErrors.quantity && (
                      <span className="validation-message error">
                        ❌ {validationErrors.quantity}
                      </span>
                    )}
                    {!validationErrors.quantity && form.quantity && (
                      <span className="validation-message success">
                        ✅ Số lượng hợp lệ
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="action-btn save">
                    {editingId ? "💾 Cập nhật" : "➕ Thêm mới"}
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
}