import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../assets/styles/Notifications.module.css";
import axios from "axios";

const Notifications = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    console.error("Không có token!");
                    return;
                }
                const response = await axios.get("http://localhost:5000/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = Array.isArray(response.data) ? response.data : [];
                setOrders(data);
            } catch (err) {
                console.error("Lỗi lấy danh sách đơn hàng:", err);
                setOrders([]);
            }
        };
        fetchOrders();
    }, []);

    const fetchOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedOrder(response.data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết đơn hàng:", err);
            setSelectedOrder(null);
        }
    };

    const filteredOrders =
        activeTab === "all"
            ? orders
            : orders.filter((order) => order.Status.toLowerCase() === activeTab);

    const openDetails = (order) => fetchOrderDetails(order.OrderID);
    const closeDetails = () => setSelectedOrder(null);

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.content}>
                <div className={styles.tabBar}>
                    <button
                        className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả ({orders.length})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "pending" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ giao hàng ({orders.filter((o) => o.Status === "Pending").length})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "shipping" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        Vận chuyển ({orders.filter((o) => o.Status === "Shipping").length})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "completed" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Hoàn thành ({orders.filter((o) => o.Status === "Completed").length})
                    </button>
                </div>

                <div className={styles.notificationList}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.OrderID} className={styles.notificationCard}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.orderId}>Mã đơn: {order.OrderID}</span>
                                    <span className={styles.date}>{order.CreatedDate}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <p className={styles.message}>
                                        Đơn hàng {order.Status === "Pending" ? "đang chờ xử lý" : order.Status === "Shipping" ? "đang vận chuyển" : "đã hoàn thành"}.
                                    </p>
                                    <p className={styles.details}>
                                        Từ: {order.SenderName} - Đến: {order.ReceiverName}
                                    </p>
                                    <button className={styles.detailsButton} onClick={() => openDetails(order)}>
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyMessage}>Không có thông báo nào trong mục này.</p>
                    )}
                </div>

                {selectedOrder && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>Chi tiết đơn hàng: {selectedOrder.OrderID}</h3>

                            {/* Thông tin người gửi và người nhận */}
                            <div className={styles.section}>
                                <h4>Thông tin người gửi và người nhận</h4>
                                <div className={styles.sectionContent}>
                                    <div className={styles.subSection}>
                                        <p><strong>Người gửi:</strong> {selectedOrder.SenderName}</p>
                                        <p><strong>Số điện thoại gửi:</strong> {selectedOrder.SenderPhone || "Không có"}</p>
                                        <p><strong>Địa chỉ gửi:</strong> {selectedOrder.SenderAddress}</p>
                                    </div>
                                    <div className={styles.subSection}>
                                        <p><strong>Người nhận:</strong> {selectedOrder.ReceiverName}</p>
                                        <p><strong>Số điện thoại nhận:</strong> {selectedOrder.ReceiverPhone || "Không có"}</p>
                                        <p><strong>Địa chỉ nhận:</strong> {selectedOrder.ReceiverAddress}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin đơn hàng */}
                            <div className={styles.section}>
                                <h4>Thông tin đơn hàng</h4>
                                <div className={styles.sectionContent}>
                                    <p><strong>Tên hàng hóa:</strong> {selectedOrder.ItemName || "Không có"}</p>
                                    <p><strong>Trọng lượng tổng:</strong> {selectedOrder.Weight} kg</p>
                                    <p><strong>Thể tích tổng:</strong> {selectedOrder.Volume} cm³</p>
                                    <p><strong>Khoảng cách:</strong> {selectedOrder.Distance} km</p>
                                    <p><strong>Loại giao hàng:</strong> {selectedOrder.DeliveryType}</p>
                                    <p><strong>Tổng chi phí:</strong> {selectedOrder.TotalCost.toLocaleString()} VNĐ</p>       
                                    <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.CreatedDate).toLocaleString()}</p>
                                </div>
                            </div>

                            <button className={styles.closeButton} onClick={closeDetails}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Notifications;