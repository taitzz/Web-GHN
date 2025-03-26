import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt, faFileInvoice, faStore, faUsers, faUserFriends,
    faTruck, faSignOutAlt, faMoneyBillWave, faChevronDown, faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/ghn.png";
import avt from "../assets/images/logo.png";
import "../styles/Sidebar.css";

const Sidebar = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
    const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("");

    useEffect(() => {
        if (location.pathname === "/admin/dashboard") {
            setActiveItem("dashboard");
        } else if (location.pathname.startsWith("/admin/orders")) {
            setActiveItem("manageOrders");
        } else if (location.pathname.startsWith("/admin/users")) {
            setIsStoreMenuOpen(true);
            setActiveItem("userList");
        } else if (location.pathname.startsWith("/admin/staff-management")) {
            setActiveItem("staffManagement");
        } else if (location.pathname.startsWith("/admin/delivery")) {
            setActiveItem("delivery");
        } else if (location.pathname.startsWith("/admin/finance")) {
            setIsFinanceMenuOpen(true);
            setActiveItem("finance");
        } else {
            setActiveItem("");
        }
    }, [location.pathname]);

    const handleLogout = () => {
        if (window.confirm("Bạn có muốn đăng xuất không?")) {
            localStorage.removeItem("authToken");
            if (typeof setIsAuthenticated === "function") {
                setIsAuthenticated(false);
            }
            navigate("/");
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <img src={logo} alt="Logo" className="sidebar__logo" />
            </div>
            <div className="sidebar__profile">
                <img src={avt} alt="User avatar" className="sidebar__avatar" />
                <div>
                    <div className="sidebar__name">Nhất Nguyễn</div>
                    <div className="sidebar__role">Chủ cửa hàng</div>
                </div>
            </div>
            <nav className="sidebar__nav">
                {/* Trang Tổng Quan */}
                <div
                    onClick={() => handleNavigate("/admin/dashboard")}
                    className={`sidebar__nav-item ${activeItem === "dashboard" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faTachometerAlt} className="sidebar__icon" />
                    Trang Tổng Quan
                </div>

                {/* Quản Lý Đơn Hàng */}
                <div
                    onClick={() => handleNavigate("/admin/orders")}
                    className={`sidebar__nav-item ${activeItem === "manageOrders" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faFileInvoice} className="sidebar__icon" />
                    Quản Lý Đơn Hàng
                </div>

                {/* Quản Lý Cửa Hàng */}
                <div
                    onClick={() => handleNavigate("/admin/users")}
                    className={`sidebar__nav-item ${activeItem === "userList" ? "active" : ""}`} 
                >
                    <FontAwesomeIcon icon={faStore} className="sidebar__icon" /> 
                    Quản Lý Khách Hàng
                </div>

                {/* Quản Lý Nhân Viên */}
                <div
                    onClick={() => handleNavigate("/admin/staff-management")}
                    className={`sidebar__nav-item ${activeItem === "staffManagement" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faUsers} className="sidebar__icon" />
                    Quản Lý Nhân Viên
                </div>
            
                {/* Đăng Xuất */}
                <div className="sidebar__nav-item logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="sidebar__icon" />
                    Đăng Xuất
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;