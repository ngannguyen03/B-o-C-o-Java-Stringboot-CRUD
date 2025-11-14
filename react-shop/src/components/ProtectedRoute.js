import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log("🧭 [ProtectedRoute] Kiểm tra quyền truy cập...");
  console.log("👤 user:", user);
  console.log("🔒 allowedRoles:", allowedRoles);

  // ⏳ Đợi AuthProvider khôi phục xong session
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "80px" }}>⏳ Đang tải...</div>;
  }

  // ❌ Nếu chưa đăng nhập
  if (!user) {
    console.warn("⚠️ [ProtectedRoute] Chưa đăng nhập → chuyển về /login");
    return <Navigate to="/login" replace />;
  }

  // ✅ Kiểm tra role
  const roles = (user.roles || [user.role]).map((r) =>
    typeof r === "string" ? r : r.name
  );
  const hasAccess = roles.some((r) => allowedRoles.includes(r));

  if (!hasAccess) {
    console.warn("🚫 [ProtectedRoute] Không có quyền truy cập:", roles);
    return <Navigate to="/" replace />;
  }

  console.log("✅ [ProtectedRoute] Cho phép truy cập:", roles);
  return <Outlet />;
};

export default ProtectedRoute;
