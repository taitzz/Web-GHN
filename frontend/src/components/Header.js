import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaSearch, FaSignOutAlt, FaShoppingCart, FaBell } from "react-icons/fa"; // Thêm FaBell cho icon thông báo
import logo from "../assets/images/ghn.png";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("fullName");
            navigate("/");
        }
    };

    useEffect(() => {
        const currentPath = location.pathname.split("/")[1];
        setActiveTab(currentPath || "home");
    }, [location]);

    const [activeTab, setActiveTab] = useState("home");

    // Giả lập số lượng thông báo (có thể thay bằng dữ liệu thực từ API sau)
    const [notificationCount, setNotificationCount] = useState(3); // Ví dụ: 3 thông báo

    return (
        <div className="header">
            {/* Bên trái: Logo */}
            <div className="header-left">
                <img src={logo} alt="GHN Logo" className="header__logo" />
            </div>

            {/* Ở giữa: Menu điều hướng */}
            <nav className="header-middle">
                <Link to="/home" className={`nav-item ${activeTab === "home" ? "active" : ""}`}>
                    Trang Chủ
                </Link>
                <Link to="/services" className={`nav-item ${activeTab === "services" ? "active" : ""}`}>
                    Dịch Vụ
                </Link>
                <Link to="/about" className={`nav-item ${activeTab === "about" ? "active" : ""}`}>
                    Giới Thiệu
                </Link>
                <Link to="/support" className={`nav-item ${activeTab === "support" ? "active" : ""}`}>
                    Hỗ Trợ
                </Link>
                <Link to="/info" className={`nav-item ${activeTab === "info" ? "active" : ""}`}>
                    Thông Tin
                </Link>
            </nav>

            {/* Bên phải: Tạo đơn hàng - Thông báo - Tìm kiếm - Đăng xuất */}
            <div className="header-right">
                {/* Nút tạo đơn hàng */}
                <Link to="/create-order" className="header__button">
                    <FaShoppingCart className="icon" /> Tạo đơn hàng
                </Link>

                {/* Icon thông báo */}
                <Link to="/notifications" className="header__notification">
                    <FaBell className="icon" />
                    {notificationCount > 0 && (
                        <span className="notification-badge">{notificationCount}</span>
                    )}
                </Link>

                {/* Thanh tìm kiếm */}
                <div className="header__search-container">
                    <input
                        type="text"
                        className="header__search"
                        placeholder="Nhập mã đơn hàng bạn cần tra cứu..."
                    />
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