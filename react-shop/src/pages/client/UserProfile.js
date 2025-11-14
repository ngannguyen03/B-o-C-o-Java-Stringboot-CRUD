import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/client/user-profile.css";

const API_BASE = "http://localhost:8080/api/users/me";

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  // 🧩 Lấy thông tin user hiện tại
  useEffect(() => {
    if (user) fetchUser();
  }, [user]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin user:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể tải thông tin người dùng!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Vui lòng thử lại sau.
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Cập nhật form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Lưu thông tin user
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
      };

      await axios.put(API_BASE, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        <div>
          <div>✅ <strong>Cập nhật hồ sơ thành công!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Thông tin của bạn đã được lưu.
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      setEditing(false);
      fetchUser();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật user:", err);
      toast.error(
        <div>
          <div>❌ <strong>Không thể lưu thay đổi!</strong></div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {err.response?.data?.message || "Vui lòng thử lại."}
          </div>
        </div>
      );
    }
  };

  // ❌ Hủy chỉnh sửa
  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
    toast.info(
      <div>
        <div>⚠️ <strong>Đã hủy chỉnh sửa</strong></div>
        <div style={{ fontSize: '14px', marginTop: '4px' }}>
          Thông tin chưa được thay đổi.
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
      }
    );
  };

  if (loading) return <div className="loading">⏳ Đang tải hồ sơ...</div>;
  if (!profile) return <div className="error">❌ Không tìm thấy thông tin người dùng.</div>;

  return (
    <div className="profile-container">
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
        style={{
          fontSize: '14px',
        }}
      />

      <h2 className="profile-title">👤 Hồ sơ cá nhân</h2>

      <div className="profile-card">
        <div className="profile-row">
          <label>👤 Tên đăng nhập:</label>
          <input type="text" value={profile.username} disabled />
        </div>

        <div className="profile-row">
          <label>📛 Họ:</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nhập họ của bạn"
          />
        </div>

        <div className="profile-row">
          <label>📛 Tên:</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nhập tên của bạn"
          />
        </div>

        <div className="profile-row">
          <label>📧 Email:</label>
          <input
            type="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="profile-row">
          <label>📞 Số điện thoại:</label>
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="profile-row">
          <label>🟢 Trạng thái:</label>
          <span className={profile.enabled ? "status active" : "status inactive"}>
            {profile.enabled ? "✅ Hoạt động" : "❌ Đã khóa"}
          </span>
        </div>

        <div className="profile-actions">
          {!editing ? (
            <button className="edit-btn" onClick={() => setEditing(true)}>
              ✏️ Chỉnh sửa
            </button>
          ) : (
            <>
              <button className="save-btn" onClick={handleSave}>
                💾 Lưu thay đổi
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                ❌ Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}