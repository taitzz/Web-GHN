import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faFileInvoice,
  faChartLine,
  faStore,
  faUsers,
  faTruck,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Sidebar.css";

const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);

  const toggleOrderMenu = () => {
    setIsOrderMenuOpen(!isOrderMenuOpen);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có muốn đăng xuất không?");
    if (confirmLogout) {
      localStorage.removeItem("authToken"); // Xóa token khi đăng xuất
      setIsAuthenticated(false); // Cập nhật trạng thái đăng xuất
      navigate("/");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <FontAwesomeIcon icon={faBars} className="sidebar__icon" />
        <span>Vận chuyển Yepp</span>
        <hr className="bottom-divider" />
      </div>
      <div className="sidebar__profile">
        <img
          src="https://placehold.co/50x50"
          alt="User avatar"
          className="sidebar__avatar"
        />
        <div>
          <div className="sidebar__name">Nhất Nguyễn</div>
          <div className="sidebar__role">Chủ cửa hàng</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        <div onClick={toggleOrderMenu} className="sidebar__nav-item">
          <FontAwesomeIcon icon={faFileInvoice} className="sidebar__icon" />
          Quản Lý Đơn Hàng
        </div>
        {isOrderMenuOpen && (
          <div className="sidebar__submenu">
            <div className="sidebar__submenu-item">Quản Lý Đơn</div>
            <div className="sidebar__submenu-item">Quản Lý Chữ Từ</div>
          </div>
        )}
        <div className="sidebar__nav-item">
          <FontAwesomeIcon icon={faChartLine} className="sidebar__icon" />
          Báo Cáo - Live
        </div>
        <div className="sidebar__nav-item">
          <FontAwesomeIcon icon={faStore} className="sidebar__icon" />
          Quản Lý Cửa Hàng
        </div>
        <div className="sidebar__nav-item">
          <FontAwesomeIcon icon={faUsers} className="sidebar__icon" />
          Phân Quyền
        </div>
        <div className="sidebar__nav-item">
          <FontAwesomeIcon icon={faTruck} className="sidebar__icon" />
          Vận Đơn & Tiện Ích
        </div>
        <div className="sidebar__nav-item" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="sidebar__icon" />
          Đăng Xuất
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
