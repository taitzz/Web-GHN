import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { FaSearch, FaSyncAlt, FaTruck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../styles/ShipperDashboard.module.css";

const ShipperDashboard = () => {
    const [activeTab, setActiveTab] = useState("assignments");
    const [assignments, setAssignments] = useState([]);
    const [shippingOrders, setShippingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingName, setLoadingName] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingShippingOrders, setLoadingShippingOrders] = useState(false);
    const [loadingCompletedOrders, setLoadingCompletedOrders] = useState(false);
    const [error, setError] = useState(null);
    const [shipperName, setShipperName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();

    const itemsPerPage = 5;

    const tabs = [
        { key: "assignments", label: "Đơn hàng được gán" },
        { key: "shipping", label: "Đang vận chuyển" },
        { key: "completed", label: "Đã hoàn thành" },
    ];

    const handleAuthError = () => {
        localStorage.removeItem("shipperToken");
        localStorage.removeItem("shipperId");
        localStorage.removeItem("shipperName");
        navigate("/shipper-login");
    };

    const fetchShipperName = async () => {
        try {
            setLoadingName(true);
            const token = localStorage.getItem("shipperToken");
            if (!token) throw new Error("Không tìm thấy token!");
            const response = await axios.get("http://localhost:5000/api/shipper/name", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShipperName(response.data.fullName);
        } catch (err) {
            console.error("[fetchShipperName] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể tải tên shipper!");
            }
        } finally {
            setLoadingName(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoadingAssignments(true);
            const token = localStorage.getItem("shipperToken");
            if (!token) throw new Error("Không tìm thấy token!");
            const response = await axios.get("http://localhost:5000/api/shipper/assignments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("[fetchAssignments] Dữ liệu từ API:", response.data);
            setAssignments(response.data);
        } catch (err) {
            console.error("[fetchAssignments] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể tải danh sách đơn hàng được gán!");
            }
        } finally {
            setLoadingAssignments(false);
        }
    };

    const fetchShippingOrders = async () => {
        try {
            setLoadingShippingOrders(true);
            const token = localStorage.getItem("shipperToken");
            if (!token) throw new Error("Không tìm thấy token!");
            const response = await axios.get("http://localhost:5000/api/shipper/shipping-orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("[fetchShippingOrders] Dữ liệu từ API:", response.data);
            setShippingOrders(response.data);
        } catch (err) {
            console.error("[fetchShippingOrders] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể tải danh sách đơn hàng đang vận chuyển!");
            }
        } finally {
            setLoadingShippingOrders(false);
        }
    };

    const fetchCompletedOrders = async () => {
        try {
            setLoadingCompletedOrders(true);
            const token = localStorage.getItem("shipperToken");
            if (!token) throw new Error("Không tìm thấy token!");
            const response = await axios.get("http://localhost:5000/api/shipper/completed-orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("[fetchCompletedOrders] Dữ liệu từ API:", response.data);
            setCompletedOrders(response.data);
        } catch (err) {
            console.error("[fetchCompletedOrders] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể tải danh sách đơn hàng đã hoàn thành!");
            }
        } finally {
            setLoadingCompletedOrders(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem("shipperToken");
            if (!token) throw new Error("Không tìm thấy token!");
            const response = await axios.get(`http://localhost:5000/api/shipper/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedOrder(response.data);
            setShowDetailModal(true);
        } catch (err) {
            console.error("[fetchOrderDetails] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể tải chi tiết đơn hàng!");
            }
        }
    };

    const respondToAssignment = async (assignmentId, response) => {
        try {
            const token = localStorage.getItem("shipperToken");
            const shipperId = localStorage.getItem("shipperId");
            if (!token || !shipperId) throw new Error("Không tìm thấy token hoặc shipperId!");
            await axios.post(
                "http://localhost:5000/api/shipper/respond-assignment",
                { assignmentId, shipperId, response },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response === "Accepted" ? "Đã chấp nhận đơn hàng!" : "Đã từ chối đơn hàng!");
            fetchAssignments();
            fetchShippingOrders();
        } catch (err) {
            console.error("[respondToAssignment] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Phản hồi thất bại!");
            }
        }
    };

    const startShipping = async (orderId) => {
        try {
            const token = localStorage.getItem("shipperToken");
            const shipperId = localStorage.getItem("shipperId");
            if (!token || !shipperId) throw new Error("Không tìm thấy token hoặc shipperId!");
            await axios.post(
                "http://localhost:5000/api/shipper/start鲜hipping",
                { orderId, shipperId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã bắt đầu vận chuyển đơn hàng!");
            fetchAssignments();
            fetchShippingOrders();
        } catch (err) {
            console.error("[startShipping] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Không thể bắt đầu vận chuyển!");
            }
        }
    };

    const completeOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("shipperToken");
            const shipperId = localStorage.getItem("shipperId");
            if (!token || !shipperId) throw new Error("Không tìm thấy token hoặc shipperId!");
            await axios.post(
                "http://localhost:5000/api/shipper/complete-order",
                { orderId, shipperId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã xác nhận hoàn thành đơn hàng!");
            fetchShippingOrders();
            fetchCompletedOrders();
        } catch (err) {
            console.error("[completeOrder] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Xác nhận hoàn thành thất bại!");
            }
        }
    };

    const confirmReceiverPayment = async (orderId) => {
        try {
            const token = localStorage.getItem("shipperToken");
            const shipperId = localStorage.getItem("shipperId");
            if (!token || !shipperId) throw new Error("Không tìm thấy token hoặc shipperId!");
            await axios.post(
                "http://localhost:5000/api/shipper/confirm-payment",
                { orderId, shipperId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã xác nhận thanh toán từ người nhận!");
            fetchShippingOrders();
            fetchCompletedOrders();
            setShowDetailModal(false);
        } catch (err) {
            console.error("[confirmReceiverPayment] Lỗi:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                toast.error(err.response?.data?.message || "Xác nhận thanh toán thất bại!");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("shipperToken");
        localStorage.removeItem("shipperId");
        localStorage.removeItem("shipperName");
        navigate("/shipper-login");
    };

    const refreshData = async () => {
        setError(null);
        setCurrentPage(0);
        try {
            await fetchShipperName();
            if (activeTab === "assignments") await fetchAssignments();
            else if (activeTab === "shipping") await fetchShippingOrders();
            else if (activeTab === "completed") await fetchCompletedOrders();
        } catch (err) {
            console.error("[refreshData] Lỗi:", err);
            toast.error(err.message || "Không thể tải dữ liệu!");
        }
    };

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const formatDate = (dateString) => {
        if (!dateString || typeof dateString !== "string") return "Chưa xác định";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Chưa xác định" : date.toLocaleDateString("vi-VN");
    };

    const getPaymentInfo = (order) => {
        const { PaymentBy, PaymentStatus, TotalCost } = order;
        const cost = TotalCost != null && !isNaN(TotalCost) ? `${TotalCost.toLocaleString()} VNĐ` : "N/A";

        if (!PaymentBy || !PaymentStatus) {
            return { text: "Thông tin thanh toán không đầy đủ", requiresAction: false };
        }

        if (PaymentBy === "Sender") {
            return {
                text: PaymentStatus === "Paid" ? `Người gửi đã trả (${cost})` : "Người gửi chưa trả",
                requiresAction: false,
            };
        }

        if (PaymentBy === "Receiver") {
            return {
                text: PaymentStatus === "Paid" ? `Người nhận đã trả (${cost})` : "Người nhận chưa trả",
                requiresAction: PaymentStatus === "Pending" && order.Status === "Shipping",
            };
        }

        return { text: "Thông tin thanh toán không hợp lệ", requiresAction: false };
    };

    const filteredData = useMemo(() => {
        let data = [];
        if (activeTab === "assignments") data = assignments;
        else if (activeTab === "shipping") data = shippingOrders;
        else if (activeTab === "completed") data = completedOrders;

        if (searchTerm) {
            data = data.filter(
                (item) =>
                    item.OrderID.toString().includes(searchTerm) ||
                    (item.SenderName && item.SenderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (item.ReceiverName && item.ReceiverName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return data;
    }, [assignments, shippingOrders, completedOrders, activeTab, searchTerm]);

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
        window.scrollTo(0, 0);
    };

    return (
        <div className={styles.dashboard}>
            <ToastContainer position="top-right" autoClose={3000} />
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>
                    Xin chào, {loadingName ? "Đang tải..." : shipperName || "Shipper"}!
                </h1>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Đăng xuất
                </button>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.tabButton} ${activeTab === tab.key ? styles.activeTab : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, người gửi, người nhận..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button className={styles.refreshButton} onClick={refreshData}>
                        <FaSyncAlt /> Làm mới
                    </button>
                </div>

                {activeTab === "assignments" ? (
                    loadingAssignments ? (
                        <div className={styles.spinner}></div>
                    ) : paginatedData.length > 0 ? (
                        <>
                            <table className={styles.orderTable}>
                                <thead>
                                    <tr>
                                        <th>Mã Gán</th>
                                        <th>Mã Đơn</th>
                                        <th>Người Gửi</th>
                                        <th>Người Nhận</th>
                                        <th>Trạng Thái</th>
                                        <th>Ngày Gán</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((assignment) => (
                                        <tr key={assignment.AssignmentID}>
                                            <td>{assignment.AssignmentID}</td>
                                            <td>{assignment.OrderID}</td>
                                            <td>{assignment.SenderName}</td>
                                            <td>{assignment.ReceiverName}</td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${
                                                        assignment.Status === "Pending"
                                                            ? styles.statusPending
                                                            : assignment.Status === "Accepted"
                                                            ? styles.statusAccepted
                                                            : styles.statusRejected
                                                    }`}
                                                >
                                                    {assignment.Status}
                                                </span>
                                            </td>
                                            <td>{formatDate(assignment.CreatedAt)}</td>
                                            <td className={styles.actionButtons}>
                                                <button
                                                    className={styles.detailButton}
                                                    onClick={() => fetchOrderDetails(assignment.OrderID)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {assignment.Status === "Pending" && (
                                                    <>
                                                        <button
                                                            className={styles.acceptButton}
                                                            onClick={() => respondToAssignment(assignment.AssignmentID, "Accepted")}
                                                        >
                                                            <FaCheckCircle /> Đồng ý
                                                        </button>
                                                        <button
                                                            className={styles.rejectButton}
                                                            onClick={() => respondToAssignment(assignment.AssignmentID, "Rejected")}
                                                        >
                                                            <FaTimesCircle /> Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {assignment.Status === "Accepted" && assignment.OrderStatus === "Approved" && (
                                                    <button
                                                        className={styles.startShippingButton}
                                                        onClick={() => startShipping(assignment.OrderID)}
                                                    >
                                                        <FaTruck /> Bắt đầu vận chuyển
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <ReactPaginate
                                previousLabel={"← Trước"}
                                nextLabel={"Tiếp →"}
                                pageCount={pageCount}
                                onPageChange={handlePageChange}
                                containerClassName={styles.pagination}
                                activeClassName={styles.activePage}
                            />
                        </>
                    ) : (
                        <p className={styles.noData}>Không có đơn hàng nào được gán.</p>
                    )
                ) : activeTab === "shipping" ? (
                    loadingShippingOrders ? (
                        <div className={styles.spinner}></div>
                    ) : paginatedData.length > 0 ? (
                        <>
                            <table className={styles.orderTable}>
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Người Gửi</th>
                                        <th>Người Nhận</th>
                                        <th>Chi Phí</th>
                                        <th>Thanh Toán</th>
                                        <th>Ngày Tạo</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((order) => {
                                        const paymentInfo = getPaymentInfo(order);
                                        return (
                                            <tr key={order.OrderID}>
                                                <td>{order.OrderID}</td>
                                                <td>{order.SenderName}</td>
                                                <td>{order.ReceiverName}</td>
                                                <td>
                                                    {order.TotalCost != null && !isNaN(order.TotalCost)
                                                        ? `${order.TotalCost.toLocaleString()} VNĐ`
                                                        : "N/A"}
                                                </td>
                                                <td>{paymentInfo.text}</td>
                                                <td>{formatDate(order.CreatedDate)}</td>
                                                <td className={styles.actionButtons}>
                                                    <button
                                                        className={styles.detailButton}
                                                        onClick={() => fetchOrderDetails(order.OrderID)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    <button
                                                        className={styles.completeButton}
                                                        onClick={() => completeOrder(order.OrderID)}
                                                    >
                                                        <FaCheckCircle /> Hoàn thành
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <ReactPaginate
                                previousLabel={"← Trước"}
                                nextLabel={"Tiếp →"}
                                pageCount={pageCount}
                                onPageChange={handlePageChange}
                                containerClassName={styles.pagination}
                                activeClassName={styles.activePage}
                            />
                        </>
                    ) : (
                        <p className={styles.noData}>Không có đơn hàng nào đang vận chuyển.</p>
                    )
                ) : activeTab === "completed" ? (
                    loadingCompletedOrders ? (
                        <div className={styles.spinner}></div>
                    ) : paginatedData.length > 0 ? (
                        <>
                            <table className={styles.orderTable}>
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Người Gửi</th>
                                        <th>Người Nhận</th>
                                        <th>Chi Phí</th>
                                        <th>Thanh Toán</th>
                                        <th>Ngày Tạo</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((order) => {
                                        const paymentInfo = getPaymentInfo(order);
                                        return (
                                            <tr key={order.OrderID}>
                                                <td>{order.OrderID}</td>
                                                <td>{order.SenderName}</td>
                                                <td>{order.ReceiverName}</td>
                                                <td>
                                                    {order.TotalCost != null && !isNaN(order.TotalCost)
                                                        ? `${order.TotalCost.toLocaleString()} VNĐ`
                                                        : "N/A"}
                                                </td>
                                                <td>{paymentInfo.text}</td>
                                                <td>{formatDate(order.CreatedDate)}</td>
                                                <td>
                                                    <button
                                                        className={styles.detailButton}
                                                        onClick={() => fetchOrderDetails(order.OrderID)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <ReactPaginate
                                previousLabel={"← Trước"}
                                nextLabel={"Tiếp →"}
                                pageCount={pageCount}
                                onPageChange={handlePageChange}
                                containerClassName={styles.pagination}
                                activeClassName={styles.activePage}
                            />
                        </>
                    ) : (
                        <p className={styles.noData}>Không có đơn hàng nào đã hoàn thành.</p>
                    )
                ) : null}

                {showDetailModal && selectedOrder && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>Chi tiết đơn hàng #{selectedOrder.OrderID}</h2>
                            <div className={styles.orderDetails}>
                                <div className={styles.detailSection}>
                                    <h3>Thông tin người gửi</h3>
                                    <p><strong>Tên:</strong> {selectedOrder.SenderName}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedOrder.SenderPhone}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedOrder.SenderAddress}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h3>Thông tin người nhận</h3>
                                    <p><strong>Tên:</strong> {selectedOrder.ReceiverName}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedOrder.ReceiverPhone}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedOrder.ReceiverAddress}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h3>Thông tin hàng hóa</h3>
                                    <p><strong>Tên hàng hóa:</strong> {selectedOrder.ItemName}</p>
                                    <p><strong>Khối lượng:</strong> {selectedOrder.Weight} kg</p>
                                    <p><strong>Thể tích:</strong> {selectedOrder.Volume || "N/A"} m³</p>
                                    <p><strong>Khoảng cách:</strong> {selectedOrder.Distance || "N/A"} km</p>
                                    <p><strong>Loại giao hàng:</strong> {selectedOrder.DeliveryType}</p>
                                    <p><strong>Ghi chú:</strong> {selectedOrder.Notes || "Không có"}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h3>Thông tin thanh toán</h3>
                                    <p>
                                        <strong>Tổng chi phí:</strong>{" "}
                                        {selectedOrder.TotalCost != null && !isNaN(selectedOrder.TotalCost)
                                            ? `${selectedOrder.TotalCost.toLocaleString()} VNĐ`
                                            : "N/A"}
                                    </p>
                                    <p><strong>Trạng thái:</strong> {getPaymentInfo(selectedOrder).text}</p>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                {selectedOrder.Status === "Approved" && (
                                    <button
                                        className={styles.startShippingButton}
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            startShipping(selectedOrder.OrderID);
                                        }}
                                    >
                                        <FaTruck /> Bắt đầu vận chuyển
                                    </button>
                                )}
                                {selectedOrder.Status === "Shipping" && (
                                    <>
                                        {getPaymentInfo(selectedOrder).requiresAction && (
                                            <button
                                                className={styles.paymentButton}
                                                onClick={() => confirmReceiverPayment(selectedOrder.OrderID)}
                                            >
                                                <FaCheckCircle /> Xác nhận thanh toán
                                            </button>
                                        )}
                                        <button
                                            className={styles.completeButton}
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                completeOrder(selectedOrder.OrderID);
                                            }}
                                        >
                                            <FaCheckCircle /> Hoàn thành
                                        </button>
                                    </>
                                )}
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipperDashboard;