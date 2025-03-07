import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/StatusTabs.css";

const StatusTabs = () => {
  const navigate = useNavigate();
  const { status } = useParams(); // Lấy trạng thái từ URL để giữ tab active
  const [orderCounts, setOrderCounts] = useState({
    draft: 0,
    waiting: 0,
    delivering: 0,
    delivered: 0,
    retry: 0,
    completed: 0,
    cancelled: 0,
    lost: 0,
  });

  useEffect(() => {
    fetchOrderCounts();
  }, []);

  const fetchOrderCounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders/count");
      setOrderCounts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy số lượng đơn hàng:", error);
    }
  };

  const tabs = [
    { key: "draft", label: "Đơn Nháp", count: orderCounts.draft },
    { key: "waiting", label: "Chờ Bàn Giao", count: orderCounts.waiting },
    { key: "delivering", label: "Đang Giao Hàng", count: orderCounts.delivering },
    { key: "delivered", label: "Đã Giao Hàng", count: orderCounts.delivered },
    { key: "retry", label: "Giao Lại", count: orderCounts.retry },
    { key: "completed", label: "Hoàn Tất", count: orderCounts.completed },
    { key: "cancelled", label: "Hủy Hàng", count: orderCounts.cancelled },
    { key: "lost", label: "Thất Lạc - Hư Hỏng", count: orderCounts.lost },
  ];

  return (
    <div className="status-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={status === tab.key ? "active" : ""} // Giữ active theo URL
          onClick={() => {
            if (status !== tab.key) { // Chỉ điều hướng nếu chưa ở trạng thái đó
              navigate(`/admin/orders/${tab.key}`);
            }
          }}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};

export default StatusTabs;
