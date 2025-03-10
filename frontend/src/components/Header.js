import React, { useState } from "react";
import { Link } from "react-router-dom";  // Thêm Link từ react-router-dom
import "../assets/styles/Header.css";
import { FaSearch, FaSignOutAlt, FaPlus } from "react-icons/fa";
import logo from "../assets/images/ghn.png"; 

const Header = () => {
    const [activeTab, setActiveTab] = useState("home");

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("fullName");
        }
    };

    return (
        <div className="header">
            {/* Bên trái: Logo */}
            <div className="header-left">
                <img src={logo} alt="GHN Logo" className="header__logo" />
            </div>

            {/* Ở giữa: Menu điều hướng */}
            <nav className="header-middle">
                <Link to="/home" className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>
                    Trang Chủ
                </Link>
                <Link to="/services" className={`nav-item ${activeTab === "services" ? "active" : ""}`} onClick={() => setActiveTab("services")}>
                    Dịch Vụ
                </Link>
                <Link to="/about" className={`nav-item ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>
                    Giới Thiệu
                </Link>
                <Link to="/support" className={`nav-item ${activeTab === "support" ? "active" : ""}`} onClick={() => setActiveTab("support")}>
                    Hỗ Trợ
                </Link>
                <Link to="/info" className={`nav-item ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
                    Thông Tin
                </Link>
            </nav>

            {/* Bên phải: Tạo đơn hàng - Tìm kiếm - Đăng xuất */}
            <div className="header-right">
                {/* Nút tạo đơn hàng */}
                <button className="header__button" onClick={() => setActiveTab("createOrder")}>
                    <FaPlus className="icon" /> Tạo đơn hàng
                </button>

                {/* Thanh tìm kiếm */}
                <div className="header__search-container">
                    <input type="text" className="header__search" placeholder="Nhập mã đơn hàng bạn cần tra cứu..." />
                    <FaSearch className="search-icon" />
                </div>

                {/* Nút Đăng Xuất */}
                <button className="header__logout" onClick={handleLogout}>
                    <FaSignOutAlt className="icon" /> Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Header;
