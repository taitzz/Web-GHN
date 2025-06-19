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
import Swal from "sweetalert2"; // Import SweetAlert2

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

    const handleLogout = async () => {
        // Hiển thị thông báo xác nhận đăng xuất bằng SweetAlert2
        const result = await Swal.fire({
            title: "Bạn có muốn đăng xuất không?",
            text: "Bạn sẽ được chuyển hướng về trang đăng nhập.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4d4d",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Đăng xuất",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            // Xóa token và thực hiện đăng xuất
            localStorage.removeItem("authToken");
            if (typeof setIsAuthenticated === "function") {
                setIsAuthenticated(false);
            }

            // Hiển thị thông báo đăng xuất thành công
            await Swal.fire({
                title: "Thành công!",
                text: "Bạn đã đăng xuất thành công.",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });

            // Chuyển hướng về trang đăng nhập
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