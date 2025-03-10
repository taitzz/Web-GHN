
import React from "react";
import { FaSearch, FaWeightHanging, FaBalanceScale } from "react-icons/fa"; // Import các icon
import "../styles/TopBar.css";

const TopBar = () => (
    <div className="topbar">
        {/* Ô tìm kiếm */}
        <div className="topbar__search">
            <div className="search-box">
                <FaSearch className="icon-search" />
                <input type="text" placeholder="Nhập SDT - MDH - Tên người nhận" />
            </div>
            <button>Nâng Cao</button>
        </div>

        {/* Các hành động */}
        <div className="topbar__actions">
           
            {/* Nút hàng nhẹ */}
            <button className="btn-light">
                <FaBalanceScale className="icon" /> Hàng Nhẹ {"<"} 20kg
            </button>

            {/* Nút hàng nặng */}
            <button className="btn-heavy">
                <FaWeightHanging className="icon" /> Hàng Nặng {">"} 20kg
            </button>
        </div>
    </div>
);

export default TopBar;
