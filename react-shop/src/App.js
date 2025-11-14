import React from "react";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// 🧩 Layouts
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";


// 🛍 Pages (Client)
import Home from "./pages/client/Home";
import ProductList from "./pages/client/ProductList";
import ProductDetail from "./pages/client/ProductDetail";
import Cart from "./pages/client/Cart";
import WishList from "./pages/client/WishList";
import OrderHistory from "./pages/client/OrderHistory";
import OrderForm from "./pages/client/OrderForm";
import OrderDetail from "./pages/client/OrderDetail";
import UserProfile from "./pages/client/UserProfile"; // ✅ Trang hồ sơ cá nhân

// 🌐 Pages (Shared)
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";

// ⚙️ Pages (Admin)
import Dashboard from "./pages/admin/Dashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import ProductVariantManagement from "./pages/admin/ProductVariantManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ExcelManagement from './pages/admin/ExcelManagement';

// 🔒 Components
import ProtectedRoute from "./components/ProtectedRoute";

// 🎨 CSS toàn cục
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* =========================== */}
          {/* 🛍 CLIENT LAYOUT */}
          {/* =========================== */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/order/:id" element={<OrderDetail />} />

            {/* ✅ Thêm route hồ sơ cá nhân */}
            <Route path="/profile" element={<UserProfile />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* =========================== */}
          {/* 🧩 ADMIN LAYOUT */}
          {/* =========================== */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route
                path="/admin/products/:productId/variants"
                element={<ProductVariantManagement />}
              />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/excel" element={<ExcelManagement />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
