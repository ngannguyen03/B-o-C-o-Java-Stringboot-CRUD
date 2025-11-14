import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOutletContext, useSearchParams } from "react-router-dom";
import "../../styles/admin/category-management.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [parentFilter, setParentFilter] = useState("all");

  // 🆕 Nhận từ khóa tìm kiếm từ AdminLayout
  const { search: layoutSearch } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    description: "",
    parent_id: "",
  });

  const [fieldStatus, setFieldStatus] = useState({
    name: "",
    description: "",
    parent_id: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem("accessToken");

  const validateName = (name) => {
    if (!name.trim()) return "Tên danh mục không được để trống";
    if (name.length < 2) return "Tên danh mục phải có ít nhất 2 ký tự";
    if (name.length > 50) return "Tên danh mục không được vượt quá 50 ký tự";
    if (!/^[a-zA-ZÀ-ỹ0-9\s\-_]+$/.test(name))
      return "Tên danh mục chỉ được chứa chữ cái, số, khoảng trắng, gạch ngang và gạch dưới";
    return "";
  };

  const validateDescription = (description) => {
    if (description.length > 200) return "Mô tả không được vượt quá 200 ký tự";
    return "";
  };

  const validateParentId = (parentId, editingId) => {
    if (parentId && parentId === editingId)
      return "Không thể chọn chính danh mục này làm danh mục cha";
    return "";
  };

  const validateField = (name, value) => {
    let error = "";
    let status = "";

    switch (name) {
      case "name":
        error = validateName(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "description":
        error = validateDescription(value);
        status = error ? "warning" : value ? "success" : "";
        break;
      case "parent_id":
        error = validateParentId(value, editingId);
        status = error ? "error" : value ? "success" : "";
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFieldStatus((prev) => ({
      ...prev,
      [name]: status,
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🆕 Khi người dùng gõ tìm kiếm trong header, cập nhật URL
  useEffect(() => {
    if (layoutSearch !== undefined) {
      const newParams = new URLSearchParams(searchParams);
      if (layoutSearch) newParams.set("search", layoutSearch);
      else newParams.delete("search");
      setSearchParams(newParams);
    }
  }, [layoutSearch]);

  // Lọc danh mục khi categories, parentFilter hoặc searchTerm thay đổi
  useEffect(() => {
    filterCategories();
  }, [categories, parentFilter, searchTerm]);

  useEffect(() => {
    updateDisplayedCategories();
  }, [filteredCategories, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map((c) => ({
        ...c,
        id: Number(c.id),
        parent_id:
          c.parent_id === null ||
          c.parent_id === undefined ||
          c.parent_id === "" ||
          c.parent_id === "null"
            ? null
            : Number(c.parent_id),
      }));

      setCategories(formatted);
    } catch (err) {
      console.error("❌ Lỗi tải danh mục:", err);
      toast.error("❌ Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lọc danh mục theo danh mục cha và search term
  const filterCategories = () => {
    let filtered = categories;

    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo danh mục cha
    if (parentFilter === "root") {
      filtered = filtered.filter((cat) => cat.parent_id === null);
    } else if (parentFilter !== "all") {
      filtered = filtered.filter(
        (cat) => cat.parent_id === Number(parentFilter)
      );
    }

    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams);
    setParentFilter("all");
  };

  const updateDisplayedCategories = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedCategories(filteredCategories.slice(startIndex, endIndex));
  };

  const getTotalPages = () =>
    Math.ceil(filteredCategories.length / itemsPerPage);

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () =>
    currentPage < getTotalPages() && setCurrentPage(currentPage + 1);

  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) pages.push(i);
    else if (currentPage <= 4)
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    else if (currentPage >= totalPages - 3)
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    else
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    return pages;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const openForm = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({
        name: cat.name,
        description: cat.description || "",
        parent_id: cat.parent_id || "",
      });
    } else {
      setEditingId(null);
      setForm({ name: "", description: "", parent_id: "" });
    }
    setShowForm(true);
    setValidationErrors({ name: "", description: "", parent_id: "" });
    setFieldStatus({ name: "", description: "", parent_id: "" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", parent_id: "" });
  };

  const validateForm = () => {
    const errors = {
      name: validateName(form.name),
      description: validateDescription(form.description),
      parent_id: validateParentId(form.parent_id, editingId),
    };
    setValidationErrors(errors);
    setFieldStatus({
      name: errors.name ? "error" : "success",
      description: errors.description ? "warning" : "success",
      parent_id: errors.parent_id ? "error" : "success",
    });
    return !errors.name && !errors.parent_id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("❌ Kiểm tra lại thông tin!");
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:8080/api/admin/categories/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:8080/api/admin/categories", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Thêm danh mục thành công!");
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi lưu danh mục!");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Xóa thành công!");
      fetchCategories();
    } catch (err) {
      toast.error("❌ Không thể xóa danh mục!");
    }
  };

  const getRootCategories = () => categories.filter((c) => c.parent_id === null);

  const getValidationClass = (f) =>
    fieldStatus[f] ? `input-${fieldStatus[f]} validation-pulse` : "";
  const getValidationIcon = (f) =>
    fieldStatus[f] &&
    {
      error: "❌",
      success: "✅",
      warning: "⚠️",
    }[fieldStatus[f]];

  if (loading) return <div className="loading">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="category-management">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="page-title">📂 Quản lý danh mục</h2>

      {/* 🔍 Bộ lọc đang áp dụng */}
      {(searchTerm || parentFilter !== "all") && (
        <div className="active-filters">
          <span>Bộ lọc:</span>
          {searchTerm && (
            <span className="filter-tag">
              Tìm kiếm: "{searchTerm}"{" "}
              <button onClick={clearSearch}>×</button>
            </span>
          )}
          {parentFilter !== "all" && (
            <span className="filter-tag">
              Danh mục cha:{" "}
              {parentFilter === "root"
                ? "Danh mục gốc"
                : categories.find((c) => c.id == parentFilter)?.name}
              <button onClick={() => setParentFilter("all")}>×</button>
            </span>
          )}
          <button onClick={clearAllFilters} className="clear-all-btn">
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Bộ lọc + thêm mới */}
      <div className="category-header">
        <div className="filter-section">
          <div className="filter-group">
            <label>Danh mục cha:</label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="root">Danh mục gốc</option>
              {getRootCategories().map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-stats">
            Hiển thị {filteredCategories.length} danh mục
          </div>
        </div>
        <button className="add-btn primary" onClick={() => openForm()}>
          ➕ Thêm danh mục mới
        </button>
      </div>

      {/* Bảng danh mục */}
      <table className="categories-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Danh mục cha</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {displayedCategories.length > 0 ? (
            displayedCategories.map((cat) => {
              const parent =
                cat.parent_id !== null
                  ? categories.find((p) => Number(p.id) === Number(cat.parent_id))
                  : null;
              return (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>
                    <strong>{cat.name}</strong>
                    {cat.parent_id === null && (
                      <span className="root-badge">Gốc</span>
                    )}
                  </td>
                  <td>{cat.description || "—"}</td>
                  <td>{parent ? parent.name : "—"}</td>
                  <td>
                    {cat.createdAt
                      ? new Date(cat.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    {cat.updatedAt
                      ? new Date(cat.updatedAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => openForm(cat)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(cat.id, cat.name)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                Không tìm thấy danh mục phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="cate-pagination-container">
          <div className="cate-pagination">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              ←
            </button>
            {getPageNumbers().map((page, i) => (
              <button
                key={i}
                onClick={() => typeof page === "number" && goToPage(page)}
                className={page === currentPage ? "active" : ""}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}
            <button
              onClick={goToNextPage}
              disabled={currentPage === getTotalPages()}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa danh mục */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingId ? "✏️ Chỉnh sửa danh mục" : "➕ Thêm danh mục mới"}
              </h3>
              <button className="close-btn" onClick={closeForm}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group required">
                  <label>Tên danh mục</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={getValidationClass("name")}
                    required
                  />
                  {getValidationIcon("name")}
                  {validationErrors.name && (
                    <span className="validation-message error">
                      ❌ {validationErrors.name}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={getValidationClass("description")}
                    rows="3"
                  />
                  {getValidationIcon("description")}
                </div>
                <div className="form-group">
                  <label>Danh mục cha</label>
                  <select
                    name="parent_id"
                    value={form.parent_id}
                    onChange={handleChange}
                    className={getValidationClass("parent_id")}
                  >
                    <option value="">— Danh mục gốc —</option>
                    {getRootCategories()
                      .filter((c) => !editingId || c.id !== editingId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  {getValidationIcon("parent_id")}
                </div>
                <div className="form-actions">
                  <button type="submit" className="action-btn save">
                    {editingId ? "💾 Cập nhật" : "➕ Thêm mới"}
                  </button>
                  <button
                    type="button"
                    className="action-btn cancel"
                    onClick={closeForm}
                  >
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

export default CategoryManagement;
