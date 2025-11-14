import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AIChatBox from "../components/AIChatBox"; // 🧠 Chat AI tích hợp
import "../styles/footer.css";

const ClientLayout = () => {
  return (
    <div className="client-layout">
      {/* 🧭 Thanh điều hướng */}
      <Navbar />

      {/* 📄 Nội dung trang chính */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* 📦 Chân trang */}
      <Footer />

      {/* 💬 Hộp Chat AI — luôn xuất hiện ở góc phải dưới */}
      <AIChatBox />
    </div>
  );
};

export default ClientLayout;
