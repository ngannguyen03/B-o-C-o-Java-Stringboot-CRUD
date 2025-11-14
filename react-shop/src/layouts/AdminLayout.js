import React, { useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaSearch,
  FaFileExcel,
} from "react-icons/fa";
import "../styles/admin/admin-layout.css";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = search.trim();

    // Nếu trống thì xóa param search
    const searchParams = new URLSearchParams(location.search);
    if (trimmed) {
      searchParams.set("search", trimmed);
      searchParams.set("page", "1"); // reset về trang 1 khi tìm
    } else {
      searchParams.delete("search");
    }

    navigate(`${location.pathname}?${searchParams.toString()}`);
    setSearch("");
  };

  // 🆕 Hiển thị search cho cả Products và Categories
  const showSearchBar =
    location.pathname === "/admin/products" ||
    location.pathname === "/admin/categories";

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>💎 Admin Panel</h2>
          <p>{user?.username || "Administrator"}</p>
        </div>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className="nav-link">
                <FaTachometerAlt /> <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className="nav-link">
                <FaUsers /> <span>Danh mục</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/products" className="nav-link">
                <FaBox /> <span>Sản phẩm</span>
              </NavLink>
            </li>
            <li>
              {/* 🆕 THÊM MENU QUẢN LÝ EXCEL */}
              <NavLink to="/admin/excel" className="nav-link">
                <FaFileExcel /> <span>Quản lý Excel</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" className="nav-link">
                <FaShoppingCart /> <span>Đơn hàng</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className="nav-link">
                <FaUsers /> <span>Người dùng</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-welcome">
              <h1>Xin chào, {user?.username || "Admin"}</h1>
              <span>Quản trị hệ thống Jewelry Shop</span>
            </div>

            {/* 🆕 Thanh tìm kiếm - hiển thị ở Products & Categories */}
            {showSearchBar && (
              <form className="admin-search-form" onSubmit={handleSearch}>
                <div className="admin-search-container">
                  <FaSearch className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder={
                      location.pathname === "/admin/products"
                        ? "Tìm kiếm sản phẩm theo tên, mô tả..."
                        : "Tìm kiếm danh mục theo tên, mô tả..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
                <button type="submit" className="admin-search-btn">
                  Tìm kiếm
                </button>
              </form>
            )}
          </div>
        </header>

        <section className="admin-content">
          {/* Truyền search xuống các trang con */}
          <Outlet context={{ search }} />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;