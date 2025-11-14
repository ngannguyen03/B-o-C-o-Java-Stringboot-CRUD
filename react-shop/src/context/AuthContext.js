import React, { createContext, useState, useEffect, useContext } from "react";
import authAPI from "../api/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Giữ trạng thái user và giỏ hàng khi reload
  useEffect(() => {
    console.log("🔄 [AuthProvider] Khôi phục session từ localStorage...");
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      console.log("✅ [AuthProvider] Tìm thấy user & token → khôi phục phiên");
      setUser(JSON.parse(storedUser));
      const savedCart = localStorage.getItem("cartId");
      if (savedCart) setCartId(savedCart);
    } else {
      console.warn("⚠️ [AuthProvider] Không có session lưu trong localStorage.");
    }

    setLoading(false);
  }, []);

  // ✅ Hàm đăng nhập
  const login = async (credentials) => {
    try {
      console.log("🚀 [AuthContext] Đang gửi yêu cầu đăng nhập...");
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response.data;

      console.log("=== ✅ LOGIN SUCCESS ===");
      console.log("👤 Username:", credentials.username);
      console.log("🔑 Password:", "*".repeat(credentials.password.length));
      console.log("🎭 Role (raw):", userData?.roles || userData?.role);
      console.log("========================");

      // ✅ Lưu token & user
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // ✅ Gọi API lấy hoặc tạo giỏ hàng (backend luôn tạo cart khi user chưa có)
      console.log("🛒 [AuthContext] Đang lấy hoặc tạo giỏ hàng cho user:", userData.id);
      const cartRes = await axios.get(
        `http://localhost:8080/api/cart/user/${userData.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (cartRes.data?.id) {
        localStorage.setItem("cartId", cartRes.data.id);
        setCartId(cartRes.data.id);
        console.log("✅ [AuthContext] Cart ID:", cartRes.data.id);
      } else {
        console.warn("⚠️ [AuthContext] Không tìm thấy hoặc tạo được giỏ hàng.");
      }

      // ✅ Chuẩn hóa danh sách role
      const rawRoles = Array.isArray(userData.roles)
        ? userData.roles
        : userData.roles
        ? [userData.roles]
        : [userData.role];

      const roles = rawRoles.map((r) => (typeof r === "string" ? r : r.name));

      console.log("🎭 [AuthContext] Roles chuẩn hóa:", roles);
      console.log("🎯 [AuthContext] Kiểm tra ROLE_ADMIN:", roles.includes("ROLE_ADMIN"));

      // ✅ Điều hướng theo vai trò
      if (roles.includes("ROLE_ADMIN")) {
        console.log("✅ [AuthContext] Admin detected → chuyển hướng /admin/dashboard");
        setTimeout(() => navigate("/admin/dashboard"), 150); // ⏳ đảm bảo localStorage sync xong
      } else {
        console.log("👤 [AuthContext] User thường → chuyển hướng /");
        navigate("/");
      }

      return userData;
    } catch (error) {
      console.error("❌ [AuthContext] Login failed:", error);
      throw error;
    }
  };

  // ✅ Hàm đăng ký
  const register = async (userData) => {
    try {
      console.log("🧾 [AuthContext] Đang đăng ký user mới...");
      const response = await authAPI.register(userData);
      console.log("✅ [AuthContext] Register success:", response.data);
      return response;
    } catch (error) {
      console.error("❌ [AuthContext] Register error:", error);
      throw error;
    }
  };

  // ✅ Đăng xuất
  const logout = async () => {
    try {
      console.log("🚪 [AuthContext] Đăng xuất...");
      await authAPI.logout({
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.error("⚠️ [AuthContext] Logout API error:", error);
    } finally {
      // Xóa toàn bộ thông tin
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("cartId");
      setUser(null);
      setCartId(null);
      console.log("✅ [AuthContext] Đã xóa toàn bộ session → /login");
      navigate("/login");
    }
  };

  // ✅ Làm mới token khi hết hạn
  const refreshToken = async () => {
    try {
      console.log("♻️ [AuthContext] Đang refresh token...");
      const response = await authAPI.refreshToken({
        refreshToken: localStorage.getItem("refreshToken"),
      });
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      console.log("✅ [AuthContext] Token mới:", accessToken);
      return accessToken;
    } catch (error) {
      console.error("❌ [AuthContext] Refresh token failed:", error);
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cartId,
        login,
        register,
        logout,
        refreshToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
