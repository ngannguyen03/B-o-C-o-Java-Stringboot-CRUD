import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section">
          <h3 className="footer-brand">
            <span className="brand-icon">💎</span>
            Jewelry Store
          </h3>
          <p className="footer-description">
            Khám phá bộ sưu tập trang sức tinh xảo, sang trọng và đẳng cấp. 
            Mang đến vẻ đẹp hoàn hảo cho phong cách của bạn.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              📘
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              📷
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              🐦
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              📺
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Liên kết nhanh</h4>
          <ul className="footer-links">
            <li><a href="/products">🛍️ Sản phẩm</a></li>
            <li><a href="/about">ℹ️ Về chúng tôi</a></li>
            <li><a href="/contact">📞 Liên hệ</a></li>
            <li><a href="/faq">❓ FAQ</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h4 className="footer-title">Hỗ trợ khách hàng</h4>
          <ul className="footer-links">
            <li><a href="/shipping">🚚 Chính sách giao hàng</a></li>
            <li><a href="/returns">🔄 Đổi trả</a></li>
            <li><a href="/warranty">🔒 Bảo hành</a></li>
            <li><a href="/size-guide">📏 Hướng dẫn chọn size</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-title">Liên hệ</h4>
          <div className="contact-info">
            <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
            <p>📞 0900 123 456</p>
            <p>✉️ contact@jewelry.com</p>
            <p>🕒 8:00 - 22:00 (T2 - CN)</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; 2024 Jewelry Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Chính sách bảo mật</a>
            <a href="/terms">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;