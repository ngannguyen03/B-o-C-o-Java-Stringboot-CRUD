import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/user-management.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 🆕 State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 🆕 State cho validation
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ""
  });

  const [fieldStatus, setFieldStatus] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ""
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ["USER"],
    enabled: true,
  });

  const token = localStorage.getItem("accessToken");
  const API = "http://localhost:8080/api/admin";

  // 🔹 Validation functions
  const validateUsername = (username) => {
    if (!username.trim()) return "Tên đăng nhập không được để trống";
    if (username.length < 3) return "Tên đăng nhập phải có ít nhất 3 ký tự";
    if (username.length > 50) return "Tên đăng nhập không được vượt quá 50 ký tự";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
    return "";
  };

  const validatePassword = (password) => {
    if (!editingId && !password) return "Mật khẩu không được để trống";
    if (password && password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return "";
  };

  const validatePhoneNumber = (phone) => {
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) return "Số điện thoại không hợp lệ";
    return "";
  };

  const validateRoles = (roles) => {
    if (!roles || roles.length === 0) return "Vui lòng chọn ít nhất một vai trò";
    return "";
  };

  // 🔹 Real-time validation
  const validateField = (name, value) => {
    let error = "";
    let status = "";

    switch (name) {
      case "username":
        error = validateUsername(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "email":
        error = validateEmail(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "password":
        error = validatePassword(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        status = error ? "error" : value ? "success" : "";
        break;
      case "roles":
        error = validateRoles(value);
        status = error ? "error" : value && value.length > 0 ? "success" : "";
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Cập nhật người dùng hiển thị theo trang hiện tại
  useEffect(() => {
    updateDisplayedUsers();
  }, [users, currentPage]);

  // 🧩 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách người dùng:", err);
      toast.error("❌ Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Cập nhật người dùng hiển thị
  const updateDisplayedUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedUsers(users.slice(startIndex, endIndex));
  };

  // 🆕 Tính toán số trang
  const getTotalPages = () => {
    return Math.ceil(users.length / itemsPerPage);
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

  // 🧩 Xử lý input thay đổi với validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "checkbox") {
      if (name === "enabled") {
        newValue = checked;
      } else if (name.startsWith("role_")) {
        // Giữ đúng định dạng "ROLE_USER" / "ROLE_ADMIN"
        const roleName = "ROLE_" + name.replace("role_", "");
        const currentRoles = [...form.roles];

        if (checked) {
          if (!currentRoles.includes(roleName)) currentRoles.push(roleName);
        } else {
          const index = currentRoles.indexOf(roleName);
          if (index > -1) currentRoles.splice(index, 1);
        }

        newValue = currentRoles;
      }

    }

    if (type === "select-multiple") {
      newValue = Array.from(e.target.selectedOptions, option => option.value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // 🆕 Real-time validation
    validateField(name, newValue);
  };

  // 🔹 Mở popup form
  const openForm = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "", // Không hiển thị mật khẩu cũ
        phoneNumber: user.phoneNumber || "",
        roles: user.roles.map(role =>
          role.name.startsWith("ROLE_") ? role.name : "ROLE_" + role.name
        ) || ["ROLE_USER"],
        enabled: user.enabled === true || user.enabled === 1,
      });
    } else {
      setEditingId(null);
      setForm({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        roles: ["ROLE_USER"],   // ✅ sửa chỗ này
        enabled: true,
      });
    }


    // Reset validation
    setValidationErrors({ username: "", email: "", password: "", phoneNumber: "", roles: "" });
    setFieldStatus({ username: "", email: "", password: "", phoneNumber: "", roles: "" });
    setShowForm(true);
  };

  // 🔹 Đóng popup form
 const closeForm = () => {
  setShowForm(false);
  setEditingId(null);
  setForm({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ["ROLE_USER"],   // ✅ FIX CHUẨN
    enabled: true,
  });

  setValidationErrors({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ""
  });

  setFieldStatus({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    roles: ""
  });
};


  // 🔹 Validate toàn bộ form trước khi submit
  const validateForm = () => {
    const errors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      phoneNumber: validatePhoneNumber(form.phoneNumber),
      roles: validateRoles(form.roles)
    };

    setValidationErrors(errors);

    const status = {
      username: errors.username ? "error" : form.username ? "success" : "",
      email: errors.email ? "error" : form.email ? "success" : "",
      password: errors.password ? "error" : form.password ? "success" : "",
      phoneNumber: errors.phoneNumber ? "error" : form.phoneNumber ? "success" : "",
      roles: errors.roles ? "error" : form.roles && form.roles.length > 0 ? "success" : ""
    };
    setFieldStatus(status);

    return !errors.username && !errors.email && !errors.password && !errors.roles;
  };

  // 💾 Thêm / Cập nhật người dùng
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🆕 Validate form trước khi submit
    if (!validateForm()) {
      toast.error(
        <div>
          <div>❌ <strong>Vui lòng kiểm tra lại thông tin!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Có lỗi validation trong form người dùng.
          </div>
        </div>
      );
      return;
    }

    try {
      const submitData = { ...form };

      // Nếu đang chỉnh sửa và không thay đổi mật khẩu, gửi null
      if (editingId && !submitData.password) {
        delete submitData.password;
      }

      if (editingId) {
        await axios.put(`${API}/users/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(
          <div>
            <div>✅ <strong>Cập nhật người dùng thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Người dùng "{form.username}" đã được cập nhật.
            </div>
          </div>
        );
      } else {
        await axios.post(`${API}/users`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(
          <div>
            <div>✅ <strong>Thêm người dùng thành công!</strong></div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Người dùng "{form.username}" đã được thêm vào hệ thống.
            </div>
          </div>
        );
      }

      closeForm();
      fetchUsers();
    } catch (err) {
      console.error("⚠️ Lỗi khi lưu người dùng:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể lưu người dùng!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Tên đăng nhập hoặc email có thể đã tồn tại."}
          </div>
        </div>
      );
    }
  };

  // 🔄 Khóa / Mở khóa tài khoản
  const toggleUserStatus = async (userId, currentStatus, username) => {
    const newStatus = !currentStatus;
    const actionLabel = newStatus ? "Mở khóa" : "Khóa";

    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} tài khoản "${username}" không?`))
      return;

    try {
      await axios.put(
        `${API}/users/${userId}`,
        { enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🟢 Cập nhật ngay trên giao diện
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, enabled: newStatus } : u
        )
      );

      toast.success(
        <div>
          <div>✅ <strong>{actionLabel} tài khoản thành công!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Tài khoản "{username}" đã được {actionLabel.toLowerCase()}.
          </div>
        </div>
      );
    } catch (err) {
      console.error("⚠️ Lỗi khi thay đổi trạng thái user:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể thay đổi trạng thái!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Vui lòng thử lại."}
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

  if (loading) return <div className="loading">⏳ Đang tải dữ liệu người dùng...</div>;

  return (
    <div className="user-management dark-mode">
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

      <h2 className="page-title">👥 Quản lý người dùng</h2>

      {/* 🔍 Header với nút thêm mới */}
      <div className="user-header">
        <div className="user-stats">
          Tổng số người dùng: <strong>{users.length}</strong>
        </div>

        <button
          className="add-btn primary"
          onClick={() => openForm()}
        >
          ➕ Thêm người dùng mới
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.length > 0 ? (
            displayedUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  <strong>{u.username}</strong>
                </td>
                <td>{u.email}</td>
                <td>{u.phoneNumber || "—"}</td>
                <td>
                  <span className="roles-badge">
                    {u.roles.map((r) => r.name).join(", ")}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${u.enabled ? "active" : "inactive"
                      }`}
                  >
                    {u.enabled ? "✅ Hoạt động" : "❌ Bị khóa"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => openForm(u)}
                      title="Sửa người dùng"
                    >
                      ✏️
                    </button>
                    <button
                      className={`action-btn ${u.enabled ? "deactivate" : "activate"}`}
                      onClick={() => toggleUserStatus(u.id, u.enabled, u.username)}
                      title={u.enabled ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      {u.enabled ? "🔒" : "🔓"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                {users.length === 0
                  ? "Không có người dùng nào trong hệ thống."
                  : "Không tìm thấy người dùng phù hợp."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination - HIỂN THỊ KHI CÓ ÍT NHẤT 1 NGƯỜI DÙNG */}
      {users.length > 0 && (
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
            Hiển thị {displayedUsers.length} trong tổng số {users.length} người dùng
            - Trang {currentPage} / {getTotalPages()}
          </div>
        </div>
      )}

      {/* 🪟 Popup Form với Validation */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "✏️ Chỉnh sửa người dùng" : "➕ Thêm người dùng mới"}</h3>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleSubmit} className="user-form user-validation">
                {/* Tên đăng nhập */}
                <div className="form-group required">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={form.username}
                    onChange={handleChange}
                    className={getValidationClass('username')}
                    required
                    disabled={editingId} // Không cho sửa username khi edit
                  />
                  {validationErrors.username && (
                    <span className="validation-message error">
                      ❌ {validationErrors.username}
                    </span>
                  )}
                  {!validationErrors.username && form.username && (
                    <span className="validation-message success">
                      ✅ Tên đăng nhập hợp lệ
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group required">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    value={form.email}
                    onChange={handleChange}
                    className={getValidationClass('email')}
                    required
                  />
                  {validationErrors.email && (
                    <span className="validation-message error">
                      ❌ {validationErrors.email}
                    </span>
                  )}
                  {!validationErrors.email && form.email && (
                    <span className="validation-message success">
                      ✅ Email hợp lệ
                    </span>
                  )}
                </div>

                {/* Mật khẩu */}
                <div className="form-group required">
                  <label>Mật khẩu {editingId && "(để trống nếu không thay đổi)"}</label>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingId ? "Nhập mật khẩu mới (không bắt buộc)" : "Nhập mật khẩu"}
                    value={form.password}
                    onChange={handleChange}
                    className={getValidationClass('password')}
                    required={!editingId}
                  />
                  {validationErrors.password && (
                    <span className="validation-message error">
                      ❌ {validationErrors.password}
                    </span>
                  )}
                  {!validationErrors.password && form.password && (
                    <span className="validation-message success">
                      ✅ Mật khẩu hợp lệ
                    </span>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Nhập số điện thoại"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className={getValidationClass('phoneNumber')}
                  />
                  {validationErrors.phoneNumber && (
                    <span className="validation-message error">
                      ❌ {validationErrors.phoneNumber}
                    </span>
                  )}
                  {!validationErrors.phoneNumber && form.phoneNumber && (
                    <span className="validation-message success">
                      ✅ Số điện thoại hợp lệ
                    </span>
                  )}
                </div>

                {/* Vai trò */}
                <div className="form-group required">
                  <label>Vai trò</label>
                  <div className="roles-checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="role_USER"
                        checked={form.roles.includes("ROLE_USER")}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      ROLE_USER
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="role_ADMIN"
                        checked={form.roles.includes("ROLE_ADMIN")}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      ROLE_ADMIN
                    </label>

                  </div>
                  {validationErrors.roles && (
                    <span className="validation-message error">
                      ❌ {validationErrors.roles}
                    </span>
                  )}
                  {!validationErrors.roles && form.roles.length > 0 && (
                    <span className="validation-message success">
                      ✅ Đã chọn {form.roles.length} vai trò
                    </span>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={form.enabled}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Tài khoản đang hoạt động
                  </label>
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
};

export default UserManagement;