import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSearch,
  FaGem,
  FaHistory,
  FaTrash,
} from "react-icons/fa";
import "../styles/navbar.css";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";

const Navbar = () => {
  const { t } = useTranslation();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef();
  const profileRef = useRef();

  // Load lịch sử
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const newTerm = search.trim();
      const updatedHistory = [
        newTerm,
        ...searchHistory.filter((term) => term !== newTerm),
      ].slice(0, 5);

      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      navigate(`/products?name=${encodeURIComponent(newTerm)}`);
      setSearch("");
      setShowHistory(false);
      setMenuOpen(false);
    }
  };

  const handleSearchFromHistory = (term) => {
    setSearch(term);
    navigate(`/products?name=${encodeURIComponent(term)}`);
    setShowHistory(false);
    setMenuOpen(false);
  };

  const removeSearchItem = (index) => {
    const updated = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <FaGem className="brand-icon" />
          <span className="brand-text">Luxury Jewelry</span>
        </Link>

        {/* SEARCH */}
        <div className="search-container-wrapper" ref={searchRef}>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowHistory(true)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              {t("search")}
            </button>
          </form>

          {/* SEARCH DROPDOWN */}
          {showHistory && searchHistory.length > 0 && (
            <div className="search-history-dropdown">
              <div className="search-history-header">
                <span className="history-title">
                  <FaHistory className="history-icon" />
                  {t("search_history")}
                </span>
                <button className="clear-history-btn" onClick={clearSearchHistory}>
                  <FaTrash />
                </button>
              </div>

              <div className="search-history-list">
                {searchHistory.map((term, index) => (
                  <div key={index} className="search-history-item">
                    <button
                      className="history-term-btn"
                      onClick={() => handleSearchFromHistory(term)}
                    >
                      <FaSearch className="history-search-icon" />
                      <span className="history-term">{term}</span>
                    </button>

                    <button
                      className="remove-history-item"
                      onClick={() => removeSearchItem(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* NAV LINKS */}
        <ul className="nav-links">
          {/* SWITCH LANGUAGE */}
          <li className="nav-link-lang">
            <button onClick={() => i18n.changeLanguage("vi")} className="lang-btn">
              🇻🇳
            </button>
            <button onClick={() => i18n.changeLanguage("en")} className="lang-btn">
              🇺🇸
            </button>
          </li>

          <li>
            <Link to="/" className="nav-link">
              <span className="link-text">{t("home")}</span>
            </Link>
          </li>

          <li>
            <Link to="/products" className="nav-link">
              <span className="link-text">{t("collection")}</span>
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/cart" className="nav-link">
                  <span className="link-text">{t("cart")}</span>
                </Link>
              </li>

              <li>
                <Link to="/orders" className="nav-link">
                  <span className="link-text">{t("orders")}</span>
                </Link>
              </li>

              <li>
                <Link to="/wishlist" className="nav-link">
                  <span className="link-text">{t("wishlist")}</span>
                </Link>
              </li>

              {/* PROFILE */}
              <li className="profile-dropdown" ref={profileRef}>
                <div className="profile-trigger" onClick={toggleProfile}>
                  <FaUserCircle className="avatar-icon" />
                  <span className="user-name">
                    {user.lastName} {user.firstName}
                  </span>
                </div>

                {profileOpen && (
                  <div className="profile-menu">
                    <div className="profile-header">
                      <div className="profile-info">
                        <p className="profile-name">
                          {user.lastName} {user.firstName}
                        </p>
                        <p className="profile-email">{user.email}</p>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button
                        className="profile-btn"
                        onClick={() => {
                          navigate("/profile");
                          setProfileOpen(false);
                        }}
                      >
                        👤 {t("my_profile")}
                      </button>

                      <button className="profile-btn logout" onClick={handleLogout}>
                        🚪 {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">
                  <span className="link-text">{t("login")}</span>
                </Link>
              </li>

              <li>
                <Link to="/register" className="nav-link register-btn">
                  <span className="link-text">{t("register")}</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <h3>{t("menu")}</h3>
        </div>

        <div className="mobile-menu-content">
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">
            🏠 {t("home")}
          </Link>

          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="mobile-link"
          >
            💎 {t("collections")}
          </Link>

          {user ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="mobile-link">
                🛒 {t("cart")}
              </Link>

              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="mobile-link"
              >
                📦 {t("orders")}
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="mobile-link"
              >
                ❤️ {t("wishlist")}
              </Link>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="mobile-link"
              >
                👤 {t("my_profile")}
              </Link>

              <button onClick={handleLogout} className="mobile-logout-btn">
                🚪 {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">
                🔑 {t("login")}
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mobile-link"
              >
                📝 {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;
