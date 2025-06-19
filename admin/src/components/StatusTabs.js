import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/StatusTabs.module.css";
import Swal from "sweetalert2";

// Hàm định dạng ngày (trích xuất thủ công từ chuỗi ISO)
const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "Ngày không hợp lệ";
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

// Hàm định dạng ngày và giờ (trích xuất thủ công từ chuỗi ISO)
const formatDateTime = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "Thời gian không hợp lệ";
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");
    const time = timePart.split(":");
    const hours = time[0].padStart(2, "0");
    const minutes = time[1].padStart(2, "0");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year} ${hours}:${minutes}`;
};

const StatusTabs = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("pending");
    const [orders, setOrders] = useState([]);
    const [cancelRequests, setCancelRequests] = useState([]);
    const [hasAvailableShippers, setHasAvailableShippers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        pending: 0,
        approved: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0,
        cancelRequests: 0,
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveCancelModal, setShowApproveCancelModal] = useState(false);
    const [showRejectCancelModal, setShowRejectCancelModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const tabs = [
        { key: "pending", label: "Chờ Duyệt", filter: { status: "Pending" } },
        { key: "approved", label: "Đã Duyệt", filter: { status: "Approved" } },
        { key: "shipping", label: "Vận Chuyển", filter: { status: "Shipping" } },
        { key: "completed", label: "Hoàn Thành", filter: { status: "Completed" } },
        { key: "cancelled", label: "Bị Hủy", filter: { status: "Cancelled" } },
        { key: "cancelRequests", label: "Yêu Cầu Hủy", filter: { type: "cancelRequests" } },
    ];

    const fetchOrders = async (status) => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
            const response = await axios.get("http://localhost:5000/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` },
                params: { status },
            });
            return response.data;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            throw new Error(error.response?.data?.message || "Không thể tải danh sách đơn hàng!");
        }
    };

    const fetchCancelRequests = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
            const response = await axios.get("http://localhost:5000/api/admin/orders/cancel-requests", {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: "Pending" },
            });
            return response.data;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            throw new Error(error.response?.data?.message || "Không thể tải danh sách yêu cầu hủy!");
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
            const response = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            throw new Error(error.response?.data?.message || "Không thể tải chi tiết đơn hàng!");
        }
    };

    const fetchOrderCounts = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
            const response = await axios.get("http://localhost:5000/api/admin/orders/counts", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const cancelRequestsResponse = await axios.get("http://localhost:5000/api/admin/orders/cancel-requests", {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: "Pending" },
            });
            const cancelRequestsCount = cancelRequestsResponse.data.length;
            const normalizedCounts = {};
            Object.keys(response.data).forEach((key) => {
                normalizedCounts[key.toLowerCase()] = response.data[key];
            });
            normalizedCounts.cancelRequests = cancelRequestsCount;
            return normalizedCounts;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            throw new Error(error.response?.data?.message || "Không thể tải số lượng đơn hàng!");
        }
    };

    const fetchAvailableShippersCount = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Chưa đăng nhập, vui lòng đăng nhập lại!");
            const response = await axios.get("http://localhost:5000/api/admin/shippers/available/count", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const count = response.data.count;
            setHasAvailableShippers(count > 0);
            return count;
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            setHasAvailableShippers(false);
            return 0;
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const countsData = await fetchOrderCounts();
            setCounts(countsData);

            if (activeTab === "cancelRequests") {
                const cancelRequestsData = await fetchCancelRequests();
                setCancelRequests(cancelRequestsData);
                setOrders([]);
            } else {
                const status = tabs.find((tab) => tab.key === activeTab).filter.status;
                const ordersData = await fetchOrders(status);
                setOrders(ordersData);
                setCancelRequests([]);
            }

            await fetchAvailableShippersCount();
        } catch (err) {
            await Swal.fire({
                title: "Lỗi!",
                text: err.message || "Không thể tải dữ liệu!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const viewOrderDetails = async (order) => {
        try {
            const orderDetails = await fetchOrderDetails(order.OrderID);
            setSelectedOrder(orderDetails);
            setShowDetailModal(true);
        } catch (err) {
            await Swal.fire({
                title: "Lỗi!",
                text: err.message || "Không thể tải chi tiết đơn hàng!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const handleApproveClick = (order) => {
        setSelectedOrder(order);
        setShowApproveModal(true);
    };

    const approveOrder = async () => {
        if (!selectedOrder) return;
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.patch(
                `http://localhost:5000/api/admin/orders/${selectedOrder.OrderID}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowApproveModal(false);
            refreshData();
            await Swal.fire({
                title: "Thành công!",
                text: response.data.shipperAssigned
                    ? `Đơn hàng đã được phê duyệt và gán shipper (ID: ${response.data.shipperId})!`
                    : "Đơn hàng đã được phê duyệt nhưng không có shipper phù hợp!",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/login");
            }
            await Swal.fire({
                title: "Lỗi!",
                text: err.response?.data?.message || "Duyệt đơn hàng thất bại!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const handleRejectClick = (order) => {
        setSelectedOrder(order);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const rejectOrder = async () => {
        if (!selectedOrder || !rejectReason) return;
        try {
            const token = localStorage.getItem("adminToken");
            await axios.patch(
                `http://localhost:5000/api/admin/orders/${selectedOrder.OrderID}/reject`,
                { reason: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowRejectModal(false);
            refreshData();
            await Swal.fire({
                title: "Thành công!",
                text: "Đơn hàng đã bị từ chối!",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            await Swal.fire({
                title: "Lỗi!",
                text: err.response?.data?.message || "Từ chối đơn hàng thất bại!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const handleAssignShipperClick = (order) => {
        setSelectedOrder(order);
        assignShipper(order.OrderID);
    };

    const assignShipper = async (orderId) => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.patch(
                `http://localhost:5000/api/admin/orders/assign-shippers`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refreshData();
            await Swal.fire({
                title: "Thành công!",
                text: response.data.assignedCount > 0
                    ? `Đã gán shipper cho ${response.data.assignedCount} đơn hàng!`
                    : "Không có shipper phù hợp để gán!",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            await Swal.fire({
                title: "Lỗi!",
                text: err.response?.data?.message || "Gán shipper thất bại!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const handleApproveCancelClick = (request) => {
        setSelectedRequest(request);
        setShowApproveCancelModal(true);
    };

    const approveCancelRequest = async () => {
        if (!selectedRequest) return;
        try {
            const token = localStorage.getItem("adminToken");
            await axios.post(
                `http://localhost:5000/api/admin/orders/cancel-requests/${selectedRequest.RequestID}/approve`,
                { orderId: selectedRequest.OrderID },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowApproveCancelModal(false);
            refreshData();
            await Swal.fire({
                title: "Thành công!",
                text: "Hoàn tiền thành công! Người dùng đã được thông báo.",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            await Swal.fire({
                title: "Lỗi!",
                text: err.response?.data?.message || "Hoàn tiền thất bại!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const handleRejectCancelClick = (request) => {
        setSelectedRequest(request);
        setShowRejectCancelModal(true);
    };

    const rejectCancelRequest = async () => {
        if (!selectedRequest) return;
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.post(
                `http://localhost:5000/api/admin/orders/cancel-requests/${selectedRequest.RequestID}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowRejectCancelModal(false);
            refreshData();
            await Swal.fire({
                title: "Thành công!",
                text: response.data.message || "Yêu cầu hủy đã bị từ chối! Đơn hàng tiếp tục quy trình.",
                icon: "success",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "OK",
            });
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("adminToken");
                navigate("/");
            }
            await Swal.fire({
                title: "Lỗi!",
                text: err.response?.data?.message || "Từ chối yêu cầu hủy thất bại!",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    const fetchShipperDetails = async (shipperId) => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
            const response = await axios.get(`http://localhost:5000/api/shipper/shipper-details/${shipperId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Không thể tải chi tiết shipper!");
        }
    };

    const viewShipperDetails = async (shipperId) => {
        try {
            const shipperDetails = await fetchShipperDetails(shipperId);
            Swal.fire({
                title: `Chi tiết shipper #${shipperId}`,
                html: `
                    <p><strong>Họ và tên:</strong> ${shipperDetails.fullName || "N/A"}</p>
                    <p><strong>Số điện thoại:</strong> ${shipperDetails.phoneNumber || "N/A"}</p>
                    <p><strong>Email:</strong> ${shipperDetails.email || "N/A"}</p>
                    <p><strong>Cơ sở làm việc:</strong> ${shipperDetails.workAreas || "N/A"}</p>                    
                `,
                icon: "info",
                confirmButtonColor: "#ff6200",
                confirmButtonText: "Đóng",
            });
        } catch (err) {
            Swal.fire({
                title: "Lỗi!",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.tabButton} ${activeTab === tab.key ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} {loading ? "(...)" : `(${counts[tab.key] || 0})`}
                    </button>
                ))}
            </div>
            {loading ? (
                <p className={styles.loading}>Đang tải...</p>
            ) : activeTab === "cancelRequests" ? (
                cancelRequests.length > 0 ? (
                    <table className={styles.orderTable}>
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Mã Đơn</th>
                                <th>Người Gửi</th>
                                <th>Người Nhận</th>
                                <th>Chi Phí</th>
                                <th>Lý Do Hủy</th>
                                <th>Ngày Yêu Cầu</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cancelRequests.map((request) => (
                                <tr key={request.RequestID}>
                                    <td>{request.RequestID}</td>
                                    <td>{request.OrderID}</td>
                                    <td>{request.SenderName}</td>
                                    <td>{request.ReceiverName}</td>
                                    <td>
                                        {request.TotalCost != null && !isNaN(request.TotalCost)
                                            ? `${request.TotalCost.toLocaleString()} VNĐ`
                                            : "N/A"}
                                    </td>
                                    <td>{request.CancelReason}</td>
                                    <td>{formatDate(request.CreatedDate)}</td>
                                    <td>
                                        <button
                                            className={styles.detailButton}
                                            onClick={() => viewOrderDetails(request)}
                                        >
                                            Xem chi tiết
                                        </button>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleApproveCancelClick(request)}
                                        >
                                            Hoàn tiền
                                        </button>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleRejectCancelClick(request)}
                                        >
                                            Từ chối
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.noData}>Không có yêu cầu hủy nào.</p>
                )
            ) : orders.length > 0 ? (
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th>Mã Đơn</th>
                            <th>Người Gửi</th>
                            <th>Người Nhận</th>
                            <th>Chi Phí</th>
                            <th>Ngày Tạo</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.OrderID}>
                                <td>{order.OrderID}</td>
                                <td>{order.SenderName}</td>
                                <td>{order.ReceiverName}</td>
                                <td>
                                    {order.TotalCost != null && !isNaN(order.TotalCost)
                                        ? `${order.TotalCost.toLocaleString()} VNĐ`
                                        : "N/A"}
                                </td>
                                <td>{formatDate(order.CreatedDate)}</td>
                                <td>
                                    <button
                                        className={styles.detailButton}
                                        onClick={() => viewOrderDetails(order)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {order.Status === "Pending" && (
                                        <>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleApproveClick(order)}
                                            >
                                                Phê duyệt
                                            </button>
                                            {order.PaymentBy === "Receiver" && (
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => handleRejectClick(order)}
                                                >
                                                    Từ chối
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {order.Status === "Approved" && (
                                        <>
                                            {order.ShipperID ? (
                                                <button
                                                    className={styles.detailButton}
                                                    onClick={() => viewShipperDetails(order.ShipperID)}
                                                >
                                                    Thông tin Shipper
                                                </button>
                                            ) : (
                                                <>
                                                    <span className={styles.noShipper}>Không có shipper phù hợp</span>
                                                    <button
                                                        className={styles.actionButton}
                                                        onClick={() => handleAssignShipperClick(order)}
                                                    >
                                                        Gán Shipper
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {order.Status === "Shipping" && (
                                        <button
                                            className={styles.detailButton}
                                            onClick={() => viewShipperDetails(order.ShipperID)}
                                        >
                                            Thông tin Shipper
                                        </button>
                                    )}
                                    {order.Status === "Cancelled" && (
                                        <span>Lý do hủy: {order.CancelReason || "Chưa có lý do"}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className={styles.noData}>Không có đơn hàng nào trong trạng thái này.</p>
            )}

            {/* Modal chi tiết đơn hàng */}
            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Chi tiết đơn hàng #{selectedOrder.OrderID}</h2>
                        <div className={styles.orderDetails}>
                            <p><strong>Mã đơn hàng:</strong> {selectedOrder.OrderID}</p>
                            <p><strong>Người dùng:</strong> {selectedOrder.UserName || "N/A"} (ID: {selectedOrder.UserID})</p>
                            <p><strong>Người gửi:</strong> {selectedOrder.SenderName}</p>
                            <p><strong>Số điện thoại người gửi:</strong> {selectedOrder.SenderPhone}</p>
                            <p><strong>Địa chỉ người gửi:</strong> {selectedOrder.SenderAddress}</p>
                            <p><strong>Người nhận:</strong> {selectedOrder.ReceiverName}</p>
                            <p><strong>Số điện thoại người nhận:</strong> {selectedOrder.ReceiverPhone}</p>
                            <p><strong>Địa chỉ người nhận:</strong> {selectedOrder.ReceiverAddress}</p>
                            <p><strong>Tên hàng hóa:</strong> {selectedOrder.ItemName}</p>
                            <p><strong>Khối lượng:</strong> {selectedOrder.Weight} kg</p>
                            <p><strong>Thể tích:</strong> {selectedOrder.Volume || "N/A"} m³</p>
                            <p><strong>Khoảng cách:</strong> {selectedOrder.Distance || "N/A"} km</p>
                            <p><strong>Loại giao hàng:</strong> {selectedOrder.DeliveryType}</p>
                            <p>
                                <strong>Tổng chi phí:</strong>{" "}
                                {selectedOrder.TotalCost != null && !isNaN(selectedOrder.TotalCost)
                                    ? `${selectedOrder.TotalCost.toLocaleString()} VNĐ`
                                    : "N/A"}
                            </p>
                            <p><strong>Ghi chú:</strong> {selectedOrder.Notes}</p>
                            <p><strong>Thanh toán bởi:</strong> {selectedOrder.PaymentBy || "N/A"}</p>
                            <p><strong>Trạng thái thanh toán:</strong> {selectedOrder.PaymentStatus || "N/A"}</p>
                            <p><strong>Shipper:</strong> {selectedOrder.ShipperName || "Chưa gán"} (ID: {selectedOrder.ShipperID || "N/A"})</p>
                            <p><strong>Trạng thái:</strong> {selectedOrder.Status}</p>
                            <p><strong>Ngày tạo:</strong> {formatDateTime(selectedOrder.CreatedDate)}</p>
                            {selectedOrder.CancelReason && (
                                <p><strong>Lý do hủy:</strong> {selectedOrder.CancelReason}</p>
                            )}
                            {selectedOrder.Reason && (
                                <p><strong>Lý do yêu cầu hủy:</strong> {selectedOrder.Reason}</p>
                            )}
                            {selectedOrder.BankAccount && (
                                <p><strong>Số tài khoản:</strong> {selectedOrder.BankAccount}</p>
                            )}
                            {selectedOrder.BankName && (
                                <p><strong>Ngân hàng:</strong> {selectedOrder.BankName}</p>
                            )}
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setShowDetailModal(false)}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Modal xác nhận phê duyệt đơn hàng */}
            {showApproveModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Xác nhận phê duyệt đơn hàng #{selectedOrder.OrderID}</h2>
                        <p>Bạn có muốn duyệt đơn hàng này không? Hệ thống sẽ tự động gán shipper nếu có.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.confirmButton}
                                onClick={approveOrder}
                            >
                                Xác nhận
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowApproveModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal từ chối đơn hàng */}
            {showRejectModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Từ chối đơn hàng #{selectedOrder.OrderID}</h2>
                        <p>Vui lòng nhập lý do từ chối:</p>
                        <div className={styles.formGroup}>
                            <label>Lý do từ chối:</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối (bắt buộc)"
                                className={styles.textarea}
                                required
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.confirmButton}
                                onClick={rejectOrder}
                                disabled={!rejectReason}
                            >
                                Xác nhận
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowRejectModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận hoàn tiền yêu cầu hủy */}
            {showApproveCancelModal && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Xác nhận hoàn tiền yêu cầu hủy #{selectedRequest.RequestID}</h2>
                        <p>Bạn có muốn hoàn tiền cho đơn hàng #{selectedRequest.OrderID} không?</p>
                        <p><strong>Lý do hủy:</strong> {selectedRequest.CancelReason}</p>
                        <p><strong>Số tài khoản:</strong> {selectedRequest.BankAccount || "N/A"}</p>
                        <p><strong>Ngân hàng:</strong> {selectedRequest.BankName || "N/A"}</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.confirmButton}
                                onClick={approveCancelRequest}
                            >
                                Hoàn tiền thành công
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowApproveCancelModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận từ chối yêu cầu hủy */}
            {showRejectCancelModal && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Từ chối yêu cầu hủy #{selectedRequest.RequestID}</h2>
                        <p>Bạn có muốn từ chối yêu cầu hủy đơn hàng #{selectedRequest.OrderID} không?</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.confirmButton}
                                onClick={rejectCancelRequest}
                            >
                                Xác nhận
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowRejectCancelModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusTabs;