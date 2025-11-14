import React, { useEffect, useState } from "react";
import {
  FaBox,
  FaShoppingCart,
  FaUser,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../../styles/admin/dashboard.css";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: { labels: [], datasets: [] },
    categories: { labels: [], datasets: [] },
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Gọi song song các API hiện có
      const [productRes, orderRes, userRes, dashboardRes] = await Promise.all([
        axios.get("http://localhost:8080/api/admin/products", { headers }),
        axios.get("http://localhost:8080/api/admin/orders", { headers }),
        axios.get("http://localhost:8080/api/admin/users", { headers }),
        axios.get("http://localhost:8080/api/admin/dashboard", { headers }),
      ]);

      const products = Array.isArray(productRes.data)
        ? productRes.data
        : productRes.data.content || [];

      const orders = Array.isArray(orderRes.data)
        ? orderRes.data
        : orderRes.data.content || [];

      const users = Array.isArray(userRes.data)
        ? userRes.data
        : userRes.data.content || [];

      const dashboard = dashboardRes.data || {};

      // ✅ Tính doanh thu
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      // ✅ Cập nhật thống kê
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
      });

      // ✅ Đơn hàng gần đây (giữ nguyên)
      setRecentOrders(orders.slice(-5).reverse());

      // ✅ Biểu đồ doanh thu
      const revenueChart = {
        labels: ["Tổng doanh thu", "Tháng này", "7 ngày gần đây"],
        datasets: [
          {
            label: "Doanh thu (VNĐ)",
            data: [
              dashboard.totalRevenue || totalRevenue,
              dashboard.revenueThisMonth || 0,
              dashboard.revenueLast7Days || 0,
            ],
            backgroundColor: ["#00B4D8", "#0077B6", "#90E0EF"],
            borderColor: "#ADE8F4",
            borderWidth: 1.5,
          },
        ],
      };

      // ✅ Biểu đồ sản phẩm theo danh mục (thay thế phần trạng thái đơn hàng)
      const categoryLabels = Object.keys(dashboard.productsByCategory || {});
      const categoryValues = Object.values(dashboard.productsByCategory || {});

      const categoryChart = {
        labels: categoryLabels,
        datasets: [
          {
            label: "Sản phẩm theo danh mục",
            data: categoryValues,
            backgroundColor: [
              "#4CC9F0",
              "#F72585",
              "#3A0CA3",
              "#7209B7",
              "#B5179E",
              "#4895EF",
              "#560BAD",
            ],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      };

      setChartData({
        revenue: revenueChart,
        categories: categoryChart,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu Dashboard:", error);
    }
  };

  return (
    <div className="dashboard-container dark-mode">
      <h1 className="dashboard-title">👑 BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN</h1>

      {/* Thống kê tổng quan */}
      <div className="stats-grid">
        <div className="stat-card dark">
          <FaBox className="icon" />
          <h3>Sản phẩm</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card dark">
          <FaShoppingCart className="icon" />
          <h3>Đơn hàng</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card dark">
          <FaUser className="icon" />
          <h3>Người dùng</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card dark">
          <FaMoneyBillWave className="icon" />
          <h3>Doanh thu</h3>
          <p>{stats.totalRevenue.toLocaleString()} ₫</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="charts-section">
        <div className="chart-box">
          <h3>📊 Doanh thu</h3>
          {chartData.revenue.datasets?.length ? (
            <Bar data={chartData.revenue} />
          ) : (
            <p className="loading-text">Đang tải dữ liệu...</p>
          )}
        </div>

        <div className="chart-box">
          <h3>🏷️ Sản phẩm theo danh mục</h3>
          {chartData.categories.datasets?.length ? (
            <Bar data={chartData.categories} />
          ) : (
            <p className="loading-text">Đang tải dữ liệu...</p>
          )}
        </div>
      </div>

      {/* Đơn hàng gần đây giữ nguyên */}
      <div className="recent-orders">
        <h3>🧾 Đơn hàng gần đây</h3>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.shippingAddress?.fullName ||
                      order.userName ||
                      order.userEmail ||
                      "Ẩn danh"}
                  </td>
                  <td>
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{order.totalPrice?.toLocaleString()} ₫</td>
                  <td>
                    <span
                      className={`status-badge ${order.status?.toLowerCase()}`}
                    >
                      {order.status || "Không rõ"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Không có đơn hàng nào gần đây.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
