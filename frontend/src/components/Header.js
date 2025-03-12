import React, { useState, useEffect } from "react";
import { Link, useLocation , useNavigate } from "react-router-dom";  // Thêm useLocation từ react-router-dom
import "../assets/styles/Header.css";
import { FaSearch, FaSignOutAlt, FaPlus } from "react-icons/fa";
import logo from "../assets/images/ghn.png"; 

const Header = () => {
    const location = useLocation();  // Lấy location hiện tại từ react-router-dom
    const navigate = useNavigate(); // Khởi tạo useNavigate hook

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("fullName");
            navigate("/");
        }
    };

    // Cập nhật activeTab khi thay đổi đường dẫn
    useEffect(() => {
        // Lấy tên của đường dẫn hiện tại để cập nhật activeTab
        const currentPath = location.pathname.split("/")[1];
        setActiveTab(currentPath || "home");  // Set mặc định là 'home' nếu không có đường dẫn
    }, [location]);  // Cập nhật lại mỗi khi location thay đổi

    const [activeTab, setActiveTab] = useState("home");

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

            {/* Bên phải: Tạo đơn hàng - Tìm kiếm - Đăng xuất */}
            <div className="header-right">
                {/* Nút tạo đơn hàng */}
                <Link to="/create-order" className="header__button">
                    <FaPlus className="icon" /> Tạo đơn hàng
                </Link>

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
