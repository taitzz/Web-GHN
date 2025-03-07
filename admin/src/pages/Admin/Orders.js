import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Orders.css";

const Orders = () => {
  const { status } = useParams(); // Lấy trạng thái từ URL
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrdersByStatus();
  }, [status]);

  const fetchOrdersByStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders?status=${status}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };

  return (
    <div className="orders-container">
      <h3>Danh sách đơn hàng - {status.replace("-", " ").toUpperCase()}</h3>

      {orders.length === 0 ? (
        <p>Không có đơn hàng nào trong trạng thái này.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <p><strong>Mã đơn:</strong> {order.id}</p>
              <p><strong>Khách hàng:</strong> {order.customerName}</p>
              <p><strong>Ngày đặt hàng:</strong> {order.orderDate}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
