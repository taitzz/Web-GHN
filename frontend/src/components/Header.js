import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaSearch, FaSignOutAlt, FaShoppingCart, FaBell } from "react-icons/fa";
import logo from "../assets/images/ghn.png";
import axios from "axios";
import Swal from "sweetalert2";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("home");
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Kiểm tra trạng thái đăng nhập
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
    }, []);

    // Lấy số lượng thông báo (chỉ khi đã đăng nhập)
    useEffect(() => {
        const fetchNotificationCount = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setNotificationCount(0);
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = Array.isArray(response.data) ? response.data : [];
                const count = data.filter((order) => order.Status === "Pending").length;
                setNotificationCount(count);
            } catch (err) {
                console.error("Lỗi lấy số lượng thông báo:", err);
                setNotificationCount(0);
            }
        };

        if (isLoggedIn) {
            fetchNotificationCount();
        }
    }, [isLoggedIn]);

    // Cập nhật activeTab dựa trên URL
    useEffect(() => {
        const currentPath = location.pathname.split("/")[1];
        setActiveTab(currentPath || "home");
    }, [location]);

    const handleLogout = () => {
        Swal.fire({
            title: "Bạn có chắc chắn muốn đăng xuất?",
            text: "Bạn sẽ phải đăng nhập lại để tiếp tục sử dụng hệ thống.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đăng xuất",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("fullName");
                setIsLoggedIn(false);
                navigate("/login"); // Về trang chủ sau khi đăng xuất
                Swal.fire("Đã đăng xuất", "Bạn đã đăng xuất thành công", "success");
            }
        });
    };

    const handleRestrictedClick = (e, path) => {
        if (!isLoggedIn) {
            e.preventDefault();
            Swal.fire({
                icon: "warning",
                title: "Yêu cầu đăng nhập",
                text: "Vui lòng đăng nhập để sử dụng tính năng này!",
                confirmButtonText: "Đăng nhập",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        }
    };

    return (
        <div className="header">
            {/* Bên trái: Logo */}
            <div className="header-left">
                <Link to="/">
                    <img src={logo} alt="GHN Logo" className="header__logo" />
                </Link>
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

            {/* Bên phải: Tạo đơn hàng - Thông báo - Tìm kiếm - Đăng nhập/Đăng ký hoặc Đăng xuất */}
            <div className="header-right">
                {/* Nút tạo đơn hàng */}
                <Link
                    to="/create-order"
                    className="header__button"
                    onClick={(e) => handleRestrictedClick(e, "/create-order")}
                >
                    <FaShoppingCart className="icon" /> Tạo đơn ngay
                </Link>

                {/* Icon thông báo */}
                {isLoggedIn ? (
                    <Link to="/notifications" className="header__notification">
                        <FaBell className="icon" />
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </Link>
                ) : (
                    <div
                        className="header__notification"
                        onClick={(e) => handleRestrictedClick(e, "/notifications")}
                    >
                        <FaBell className="icon" />
                    </div>
                )}

                {/* Thanh tìm kiếm */}
                <div className="header__search-container">
                    <input
                        type="text"
                        className="header__search"
                        placeholder="Nhập mã đơn hàng bạn cần tra cứu..."
                    />
                    <FaSearch className="search-icon" />
                </div>

                {/* Đăng nhập/Đăng ký hoặc Đăng xuất */}
                {isLoggedIn ? (
                    <button className="header__logout" onClick={handleLogout}>
                        <FaSignOutAlt className="icon" /> Đăng xuất
                    </button>
                ) : (
                    <Link to="/login" className="header__auth-link">
                        Đăng nhập / Đăng ký
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;