import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome, faFileInvoice, faCog, faHeadset, faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/ghn.png";
import "../assets/styles/SideBar.css";

const Sidebar = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState("");

    useEffect(() => {
        if (location.pathname.startsWith("/user/home")) {
            setActiveItem("home");
        } else if (location.pathname.startsWith("/user/orders")) {
            setActiveItem("orders");
        } else if (location.pathname.startsWith("/user/support")) {
            setActiveItem("support");
        } else if (location.pathname.startsWith("/user/settings")) {
            setActiveItem("settings");
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

    const handleNavigate = (path, item) => {
        setActiveItem(item);
        navigate(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <img src={logo} alt="Logo" className="sidebar__logo" />
            </div>
            <div className="sidebar__profile">                
                <div>
                    <div className="sidebar__name"></div>
                </div>
            </div>
            <nav className="sidebar__nav">
                {/* Trang chủ */}
                <div
                    onClick={() => handleNavigate("/user/home", "home")}
                    className={`sidebar__nav-item ${activeItem === "home" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faHome} className="sidebar__icon" />
                    Trang Chủ
                </div>

                {/* Đơn hàng */}
                <div
                    onClick={() => handleNavigate("/user/orders", "orders")}
                    className={`sidebar__nav-item ${activeItem === "orders" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faFileInvoice} className="sidebar__icon" />
                    Đơn Hàng Của Tôi
                </div>

                {/* Hỗ trợ */}
                <div
                    onClick={() => handleNavigate("/user/support", "support")}
                    className={`sidebar__nav-item ${activeItem === "support" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faHeadset} className="sidebar__icon" />
                    Hỗ Trợ Khách Hàng
                </div>

                {/* Cài đặt */}
                <div
                    onClick={() => handleNavigate("/user/settings", "settings")}
                    className={`sidebar__nav-item ${activeItem === "settings" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faCog} className="sidebar__icon" />
                    Cài Đặt
                </div>

                {/* Đăng xuất */}
                <div className="sidebar__nav-item logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="sidebar__icon" />
                    Đăng Xuất
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
