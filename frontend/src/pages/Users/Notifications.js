import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../assets/styles/Notifications.module.css";
import axios from "axios";

const Notifications = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankName, setBankName] = useState("");

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("Không có token!");
                return [];
            }
            const response = await axios.get("http://localhost:5000/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = Array.isArray(response.data) ? response.data : [];
            console.log("Dữ liệu từ API:", data);

            const validOrders = data.filter(
                (order) => order.OrderID != null && typeof order.OrderID === "number" && !isNaN(order.OrderID)
            );
            const uniqueOrders = Array.from(new Map(validOrders.map(order => [order.OrderID, order])).values());
            console.log("Dữ liệu sau khi lọc:", uniqueOrders);
            return uniqueOrders;
        } catch (err) {
            console.error("Lỗi lấy danh sách đơn hàng:", err);
            return [];
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            const fetchedOrders = await fetchOrders();
            setOrders(fetchedOrders);
        };
        loadOrders();
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

    const handleCancelRequest = (orderId) => {
        setCancelOrderId(orderId);
        const order = orders.find(o => o.OrderID === orderId);
        if (order && order.PaymentStatus === "Paid") {
            setShowCancelForm(true);
        } else {
            cancelOrder(orderId);
        }
    };

    const cancelOrder = async (orderId, cancelData = {}) => {
        console.log("OrderID đang cố hủy:", orderId);
        console.log("Danh sách orders hiện tại:", orders);

        if (orderId == null || isNaN(Number(orderId))) {
            console.error(`[cancelOrder] OrderID không hợp lệ: ${orderId}`);
            alert("Mã đơn hàng không hợp lệ, không thể hủy!");
            return;
        }

        const orderExists = orders.some(order => order.OrderID === Number(orderId));
        if (!orderExists) {
            console.error(`[cancelOrder] Không tìm thấy đơn hàng với OrderID: ${orderId} trong danh sách orders`);
            alert("Không tìm thấy đơn hàng này, không thể hủy!");
            return;
        }

        const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
        if (!confirmCancel) return;

        try {
            const token = localStorage.getItem("authToken");
            await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: cancelData, // Gửi dữ liệu lý do hủy, số tài khoản, ngân hàng
            });

            const updatedOrders = await fetchOrders();
            setOrders(updatedOrders);
            alert(cancelData.cancelReason ? "Yêu cầu hủy đơn hàng đã được gửi, vui lòng chờ admin phê duyệt!" : "Đơn hàng đã được hủy thành công!");
            setShowCancelForm(false);
            setCancelReason("");
            setBankAccount("");
            setBankName("");
        } catch (err) {
            console.error("Lỗi hủy đơn hàng:", err);
            alert(err.response?.data?.message || "Lỗi khi hủy đơn hàng, vui lòng thử lại!");
        }
    };

    const handleCancelFormSubmit = (e) => {
        e.preventDefault();
        if (!cancelReason || !bankAccount || !bankName) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        const cancelData = {
            cancelReason,
            bankAccount,
            bankName,
        };
        cancelOrder(cancelOrderId, cancelData);
    };

    const closeCancelForm = () => {
        setShowCancelForm(false);
        setCancelReason("");
        setBankAccount("");
        setBankName("");
    };

    const filteredOrders =
        activeTab === "all"
            ? orders.filter((order) => order.Status !== "Cancelled")
            : activeTab === "pending"
            ? orders.filter((order) => order.Status === "Pending" || order.Status === "Approved")
            : orders.filter((order) => order.Status.toLowerCase() === activeTab);

    const openDetails = (order) => fetchOrderDetails(order.OrderID);
    const closeDetails = () => setSelectedOrder(null);

    const allCount = orders.filter((o) => o.Status !== "Cancelled").length;
    const pendingCount = orders.filter((o) => o.Status === "Pending" || o.Status === "Approved").length;
    const shippingCount = orders.filter((o) => o.Status === "Shipping").length;
    const completedCount = orders.filter((o) => o.Status === "Completed").length;
    const cancelledCount = orders.filter((o) => o.Status === "Cancelled").length;

    const getPaymentInfo = (order) => {
        console.log(`OrderID: ${order.OrderID}, PaymentBy: ${order.PaymentBy}, PaymentStatus: ${order.PaymentStatus}`);
        if (!order.PaymentBy || !order.PaymentStatus) {
            return " - Chưa xác định";
        }

        if (order.PaymentBy === "Sender") {
            if (order.PaymentStatus === "Paid") {
                return " - Người gửi thanh toán thành công";
            } else if (order.PaymentStatus === "Pending") {
                return " - Người gửi chưa thanh toán";
            }
        } else if (order.PaymentBy === "Receiver") {
            if (order.PaymentStatus === "Paid") {
                return " - Người nhận thanh toán thành công";
            } else if (order.PaymentStatus === "Pending") {
                return " - Người nhận chưa thanh toán";
            }
        }

        return " - Chưa xác định";
    };

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.content}>
                <div className={styles.tabBar}>
                    <button
                        className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả ({allCount})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "pending" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ giao hàng ({pendingCount})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "shipping" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        Vận chuyển ({shippingCount})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "completed" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Hoàn thành ({completedCount})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "cancelled" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy ({cancelledCount})
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
                                        Đơn hàng {
                                            order.Status === "Pending" ? "đang chờ xử lý" :
                                                order.Status === "Approved" ? "đã được phê duyệt" :
                                                    order.Status === "Shipping" ? "đang vận chuyển" :
                                                        order.Status === "Cancelled" ? "đã bị hủy" :
                                                            "đã hoàn thành"
                                        }.
                                    </p>
                                    <p className={styles.details}>
                                        Từ: {order.SenderName} - Đến: {order.ReceiverName}
                                    </p>
                                    <div className={styles.actionArea}>
                                        <button className={styles.detailsButton} onClick={() => openDetails(order)}>
                                            Xem chi tiết
                                        </button>
                                        {order.Status === "Pending" && (
                                            <button
                                                className={styles.cancelButton}
                                                onClick={() => handleCancelRequest(order.OrderID)}
                                            >
                                                Hủy đơn hàng
                                            </button>
                                        )}
                                        <span className={styles.paymentInfo}>
                                            {getPaymentInfo(order)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyMessage}>Không có thông báo nào trong mục này.</p>
                    )}
                    <p className={styles.note}>
                        <strong>Lưu ý:</strong> Đơn hàng sẽ không hủy được nếu đã được duyệt từ cửa hàng.
                    </p>
                </div>

                {showCancelForm && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>Yêu cầu hủy đơn hàng</h3>
                            <p>Đơn hàng đã được thanh toán. Vui lòng điền thông tin để gửi yêu cầu hủy đến admin.</p>
                            <form onSubmit={handleCancelFormSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Lý do hủy đơn:</label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        required
                                        rows="3"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Số tài khoản:</label>
                                    <input
                                        type="text"
                                        value={bankAccount}
                                        onChange={(e) => setBankAccount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Ngân hàng:</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.submitButton}>
                                        Gửi yêu cầu
                                    </button>
                                    <button type="button" className={styles.closeButton} onClick={closeCancelForm}>
                                        Đóng
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedOrder && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>Chi tiết đơn hàng: {selectedOrder.OrderID}</h3>

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