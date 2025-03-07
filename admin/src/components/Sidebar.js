import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileInvoice, faChartLine, faStore, faUsers, faUserFriends,
    faTruck, faSignOutAlt, faUserCheck, faUserCog, faChevronDown, faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/ghn.png";
import avt from "../assets/images/logo.png";
import "../styles/Sidebar.css";

const Sidebar = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
    const [isPermissionMenuOpen, setIsPermissionMenuOpen] = useState(false);
    const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("");

    // Theo dõi location.pathname để cập nhật active item
    useEffect(() => {
        if (location.pathname.startsWith("/admin/orders")) {
            setIsOrderMenuOpen(true);
            setActiveItem("manageOrders");
        } else if (location.pathname.startsWith("/admin/reports")) {
            setActiveItem("report");
        } else if (location.pathname.startsWith("/admin/users")) {
            setIsStoreMenuOpen(true);
            setActiveItem("userList");
        } else if (location.pathname.startsWith("/Shippers/ShipperRequests")) {
            setIsPermissionMenuOpen(true);
            setActiveItem("shipperRequests");
        } else if (location.pathname.startsWith("/Shippers/DetailsShipper")) {
            setIsPermissionMenuOpen(true);
            setActiveItem("detailsShipper");
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
                {/* Quản Lý Đơn Hàng */}
                <div
                    onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
                    className={`sidebar__nav-item has-submenu ${isOrderMenuOpen ? "active" : ""}`}
                >
                    <div className="sidebar__nav-item-content">
                        <FontAwesomeIcon icon={faFileInvoice} className="sidebar__icon" />
                        Quản Lý Đơn Hàng
                    </div>
                    <FontAwesomeIcon icon={isOrderMenuOpen ? faChevronUp : faChevronDown} className="sidebar__chevron" />
                </div>
                {isOrderMenuOpen && (
                    <div className="sidebar__submenu">
                        <div
                            className={`sidebar__submenu-item ${activeItem === "manageOrders" ? "active" : ""}`}
                            onClick={() => handleNavigate("/admin/orders/draft")}
                        >
                            Quản Lý Đơn
                        </div>
                        <div
                            className={`sidebar__submenu-item ${activeItem === "manageDocuments" ? "active" : ""}`}
                            onClick={() => handleNavigate("/admin/orders/documents")}
                        >
                            Quản Lý Chứng Từ
                        </div>
                    </div>
                )}

                {/* Báo Cáo */}
                <div
                    onClick={() => handleNavigate("/admin/reports")}
                    className={`sidebar__nav-item ${activeItem === "report" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faChartLine} className="sidebar__icon" />
                    Báo Cáo - Live
                </div>
                
                {/* Quản Lý Cửa Hàng */}
                <div
                    onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
                    className={`sidebar__nav-item has-submenu ${isStoreMenuOpen ? "active" : ""}`}
                >
                    <div className="sidebar__nav-item-content">
                        <FontAwesomeIcon icon={faStore} className="sidebar__icon" />
                        Quản Lý Cửa Hàng
                    </div>
                    <FontAwesomeIcon icon={isStoreMenuOpen ? faChevronUp : faChevronDown} className="sidebar__chevron" />
                </div>
                {isStoreMenuOpen && (
                    <div className="sidebar__submenu">
                        <div
                            className={`sidebar__submenu-item ${activeItem === "userList" ? "active" : ""}`}
                            onClick={() => handleNavigate("/admin/users")}
                        >
                            <FontAwesomeIcon icon={faUserFriends} className="sidebar__icon" />
                            Danh Sách Người Dùng
                        </div>
                    </div>
                )}

                {/* Quản lý nhân viên */}
                <div
                    onClick={() => setIsPermissionMenuOpen(!isPermissionMenuOpen)}
                    className={`sidebar__nav-item has-submenu ${isPermissionMenuOpen ? "active" : ""}`}
                >
                    <div className="sidebar__nav-item-content">
                        <FontAwesomeIcon icon={faUsers} className="sidebar__icon" />
                        Quản lí nhân viên
                    </div>
                    <FontAwesomeIcon icon={isPermissionMenuOpen ? faChevronUp : faChevronDown} className="sidebar__chevron" />
                </div>
                {isPermissionMenuOpen && (
                    <div className="sidebar__submenu">
                        <div
                            className={`sidebar__submenu-item ${activeItem === "shipperRequests" ? "active" : ""}`}
                            onClick={() => handleNavigate("/Shippers/ShipperRequests")}
                        >
                            <FontAwesomeIcon icon={faUserCheck} className="sidebar__icon" />
                            Yêu Cầu Nhân Viên
                        </div>
                        <div
                            className={`sidebar__submenu-item ${activeItem === "detailsShipper" ? "active" : ""}`}
                            onClick={() => handleNavigate("/Shippers/DetailsShipper")}
                        >
                            <FontAwesomeIcon icon={faUserCog} className="sidebar__icon" />
                            Danh Sách Nhân Viên
                        </div>
                    </div>
                )}

                {/* Vận Đơn & Tiện Ích */}
                <div
                    onClick={() => handleNavigate("/admin/delivery")}
                    className={`sidebar__nav-item ${activeItem === "delivery" ? "active" : ""}`}
                >
                    <FontAwesomeIcon icon={faTruck} className="sidebar__icon" />
                    Vận Đơn & Tiện Ích
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
