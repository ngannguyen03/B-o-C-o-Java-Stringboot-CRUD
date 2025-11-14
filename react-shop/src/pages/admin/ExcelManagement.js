import React, { useState } from 'react';
import { FaDownload, FaUpload, FaCloudDownloadAlt, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin/excel-management.css';

const API_BASE_URL = 'http://localhost:8080';

const ExcelManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const { user, logout } = useAuth();

  // ✅ Kiểm tra token và quyền ADMIN
  const validateToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      setAlertType('error');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      if (isExpired) {
        setMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setAlertType('error');
        logout();
        return false;
      }

      const roles = payload.roles || [];
      const isAdmin = Array.isArray(roles)
        ? roles.some(r =>
          typeof r === 'string'
            ? r === 'ROLE_ADMIN'
            : r.name === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN'
        )
        : false;

      if (!isAdmin) {
        setMessage('Bạn không có quyền ADMIN để truy cập tính năng này.');
        setAlertType('error');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token parse error:', error);
      setMessage('Token không hợp lệ. Vui lòng đăng nhập lại.');
      setAlertType('error');
      return false;
    }
  };

  // ✅ Hàm lấy headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // 📤 Export Excel
  const handleExport = async () => {
    if (!validateToken()) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/excel/export-products`, {
        responseType: 'blob',
        headers: getAuthHeaders(),
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh-sach-san-pham-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('Xuất file Excel thành công!');
      setAlertType('success');
    } catch (error) {
      console.error('Export error:', error);
      let errorMessage = 'Lỗi khi xuất file Excel';

      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        logout();
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền ADMIN để thực hiện thao tác này';
      } else if (error.response?.status === 404) {
        errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage(errorMessage);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  // 📥 Import Excel
  const handleImport = async (event) => {
    console.log('📂 handleImport triggered');

    if (!validateToken()) return;

    const file = event.target.files[0];
    if (!file) {
      console.warn('⚠️ No file selected');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      setAlertType('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
      setAlertType('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/api/admin/excel/import-products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ bỏ Content-Type để Axios tự set boundary
        },
      });

      console.log('✅ Import response:', response);
      setMessage(response.data.message || 'Import thành công!');
      setAlertType('success');
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      let errorMessage = 'Lỗi khi import file';

      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        logout();
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền ADMIN để thực hiện thao tác này';
      } else if (error.response?.status === 404) {
        errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage(errorMessage);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  // 📄 Download Template
  const downloadTemplate = async () => {
    if (!validateToken()) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/excel/download-template`, {
        responseType: 'blob',
        headers: getAuthHeaders(),
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template-san-pham.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('Tải template thành công!');
      setAlertType('success');
    } catch (error) {
      console.error('Template download error:', error);
      let errorMessage = 'Lỗi khi tải template';

      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        logout();
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền ADMIN để thực hiện thao tác này';
      } else if (error.response?.status === 404) {
        errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage(errorMessage);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  // 👤 Hiển thị thông tin user
  const renderUserInfo = () => {
    if (!user) return null;

    const roleNames = Array.isArray(user.roles)
      ? user.roles.map(r => (typeof r === 'string' ? r : r.name)).join(', ')
      : 'Không có role';

    const isAdmin = Array.isArray(user.roles)
      ? user.roles.some(r => (typeof r === 'string' ? r === 'ROLE_ADMIN' : r.name === 'ROLE_ADMIN'))
      : false;

    return (
      <div className="user-info-card">
        <div className="user-info-header">
          <FaExclamationTriangle className="info-icon" />
          <span>Thông tin xác thực</span>
        </div>
        <div className="user-info-content">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {roleNames}</p>
          <p><strong>Quyền cần:</strong> ROLE_ADMIN</p>
          {isAdmin ? (
            <p className="status-success">✅ Bạn có quyền truy cập</p>
          ) : (
            <p className="status-error">❌ Bạn không có quyền ADMIN</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="excel-management">
      <div className="excel-container">
        <div className="excel-header">
          <h1 className="excel-title">📊 Quản lý Excel</h1>
          <p className="excel-subtitle">Xuất/nhập dữ liệu sản phẩm từ file Excel</p>
        </div>

        {message && (
          <div className={`alert alert-${alertType}`}>
            {message}
            <button className="alert-close" onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {renderUserInfo()}

        {/* Các chức năng */}
        <div className="excel-cards">
          {/* Export */}
          <div className="excel-card export-card">
            <div className="excel-card-body">
              <div className="card-icon export-icon"><FaDownload size={32} /></div>
              <h3 className="card-title">Export sản phẩm</h3>
              <p className="card-description">
                Tải xuống toàn bộ danh sách sản phẩm hiện có dưới dạng file Excel để xem, chỉnh sửa hoặc sao lưu.
              </p>
              <button
                className="excel-btn export-btn"
                onClick={handleExport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaDownload className="btn-icon" />Export Excel
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="excel-card import-card">
            <div className="excel-card-body">
              <div className="card-icon import-icon"><FaUpload size={32} /></div>
              <h3 className="card-title">Import sản phẩm</h3>
              <p className="card-description">
                Tải lên file Excel để thêm sản phẩm mới hoặc cập nhật thông tin sản phẩm hiện có.
              </p>

              {/* ✅ input ẩn để chọn file */}
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleImport}
              />

              {/* ✅ nút kích hoạt input */}
              <button
                type="button"
                className="excel-btn import-btn"
                onClick={() => {
                  console.log('📁 Click import button');
                  document.getElementById('excel-file-input').click();
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaUpload className="btn-icon" />Chọn File Excel
                  </>
                )}
              </button>
            </div>
          </div>


          {/* Template */}
          <div className="excel-card template-card">
            <div className="excel-card-body">
              <div className="card-icon template-icon"><FaCloudDownloadAlt size={32} /></div>
              <h3 className="card-title">Template mẫu</h3>
              <p className="card-description">
                Tải về file template mẫu với đầy đủ cấu trúc cột để nhập dữ liệu sản phẩm chuẩn xác.
              </p>
              <button className="excel-btn template-btn" onClick={downloadTemplate} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaCloudDownloadAlt className="btn-icon" />Tải Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="instruction-card">
          <div className="instruction-body">
            <h2 className="instruction-title">📝 Hướng dẫn sử dụng</h2>
            <p>💡 Sử dụng Export để tải danh sách, chỉnh sửa, rồi Import lại để cập nhật hàng loạt.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelManagement;
