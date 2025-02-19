import React, { useState } from "react";
import "../styles/StatusTabs.css";

const StatusTabs = () => {
  // State để lưu nút đang được chọn
  const [activeTab, setActiveTab] = useState(null);

  // Danh sách các nút
  const tabs = [
    "Đơn Nháp 0",
    "Chờ Bàn Giao 0",
    "Đang Giao Hàng 0",
    "Đã Giao Hàng 0",
    "Giao Lại 0",
    "Hoàn Tất 0",
    "Hủy Hàng 0",
    "Thất Lạc - Hư Hỏng 0",
  ];

  return (
    <div className="status-tabs">
      {tabs.map((tab, index) => (
        <button
          key={index}
          // Thêm class "active" nếu nút này đang được chọn
          className={activeTab === index ? "active" : ""}
          onClick={() => setActiveTab(index)} // Cập nhật trạng thái khi nhấn
        >
          {tab}
        </button>
      ))}
      
    </div>
  );
};

export default StatusTabs;
