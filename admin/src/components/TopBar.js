
import React from "react";
import { FaSearch } from "react-icons/fa"; 
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
    </div>
);

export default TopBar;
