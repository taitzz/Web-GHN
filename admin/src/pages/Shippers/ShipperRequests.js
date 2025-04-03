import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/ShipperRequests.module.css"; // Import CSS Module
import Swal from "sweetalert2"; // Import SweetAlert2

const API_URL = "http://localhost:5000/api/shipper";

const ShipperRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`${API_URL}/shipper-requests`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                console.log("🚀 API Response:", res.data);
                // Ánh xạ dữ liệu để chuẩn hóa tên trường
                const mappedRequests = res.data.map((item) => ({
                    ShipperID: item.id || item.ShipperID,
                    FullName: item.fullName || item.FullName,
                    Email: item.email || item.Email,
                    PhoneNumber: item.phoneNumber || item.PhoneNumber || item.Phone,
                    Status: item.status || item.Status,
                    BirthDate: item.birthDate || item.BirthDate,
                    PermanentAddress: item.permanentAddress || item.PermanentAddress,
                    CurrentAddress: item.currentAddress || item.CurrentAddress,
                    CCCD: item.cccd || item.CCCD,
                    DriverLicense: item.driverLicense || item.DriverLicense,
                    WorkAreas: item.workAreas || item.WorkAreas,
                }));
                setRequests(mappedRequests);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
                setError("Không thể tải danh sách shipper, vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Chuyển đổi ngày sinh về định dạng dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return "Ngày không hợp lệ";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Xử lý duyệt shipper
    const handleApprove = async (id) => {
        // Hiển thị thông báo xác nhận duyệt shipper
        const result = await Swal.fire({
            title: "Xác nhận duyệt shipper",
            text: "Bạn có chắc chắn muốn duyệt shipper này?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Duyệt",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.put(
                    `${API_URL}/approve/${id}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                    }
                );
                // Hiển thị thông báo thành công
                await Swal.fire({
                    title: "Thành công!",
                    text: response.data.message || "Shipper đã được duyệt và email thông báo đã được gửi!",
                    icon: "success",
                    confirmButtonColor: "#ff6200",
                    confirmButtonText: "OK",
                });
                // Loại bỏ shipper khỏi danh sách "Chờ Duyệt"
                setRequests((prevRequests) =>
                    prevRequests.filter((request) => request.ShipperID !== id)
                );
            } catch (err) {
                console.error("Lỗi khi duyệt shipper:", err);
                const errorMessage =
                    err.response?.data?.message || "Có lỗi xảy ra khi duyệt shipper, vui lòng thử lại.";
                // Hiển thị thông báo lỗi
                await Swal.fire({
                    title: "Lỗi!",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonColor: "#ff4d4d",
                    confirmButtonText: "Đóng",
                });
            }
        }
    };

    // Xử lý xóa shipper
    const handleDelete = async (id) => {
        // Hiển thị thông báo xác nhận xóa shipper
        const result = await Swal.fire({
            title: "Xác nhận xóa shipper",
            text: "Bạn có chắc chắn muốn xóa shipper này? Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4d4d",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/delete/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                // Hiển thị thông báo thành công
                await Swal.fire({
                    title: "Thành công!",
                    text: "Shipper đã bị xóa!",
                    icon: "success",
                    confirmButtonColor: "#ff6200",
                    confirmButtonText: "OK",
                });
                // Loại bỏ shipper khỏi danh sách
                setRequests((prevRequests) =>
                    prevRequests.filter((request) => request.ShipperID !== id)
                );
            } catch (err) {
                console.error("Lỗi khi xóa shipper:", err);
                // Hiển thị thông báo lỗi
                await Swal.fire({
                    title: "Lỗi!",
                    text: "Có lỗi xảy ra khi xóa, vui lòng thử lại.",
                    icon: "error",
                    confirmButtonColor: "#ff4d4d",
                    confirmButtonText: "Đóng",
                });
            }
        }
    };

    // Xử lý xem chi tiết shipper
    const handleViewDetails = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/shipper-details/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            console.log("Thông tin chi tiết shipper:", response.data);
            // Ánh xạ dữ liệu chi tiết shipper
            const shipperData = {
                ShipperID: response.data.id || response.data.ShipperID,
                FullName: response.data.fullName || response.data.FullName,
                Email: response.data.email || response.data.Email,
                PhoneNumber: response.data.phoneNumber || response.data.PhoneNumber || response.data.Phone,
                Status: response.data.status || response.data.Status,
                BirthDate: response.data.birthDate || response.data.BirthDate,
                PermanentAddress: response.data.permanentAddress || response.data.PermanentAddress,
                CurrentAddress: response.data.currentAddress || response.data.CurrentAddress,
                CCCD: response.data.cccd || response.data.CCCD,
                DriverLicense: response.data.driverLicense || response.data.DriverLicense,
                WorkAreas: response.data.workAreas || response.data.WorkAreas,
            };
            setSelectedShipper(shipperData);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết shipper:", err);
            // Hiển thị thông báo lỗi
            await Swal.fire({
                title: "Lỗi!",
                text: "Có lỗi xảy ra khi lấy thông tin chi tiết, vui lòng thử lại.",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
        }
    };

    // Xử lý tắt chi tiết shipper
    const handleCloseDetails = () => {
        setSelectedShipper(null);
    };

    // Đếm số shipper đang chờ duyệt
    const pendingShipperCount = requests.length;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Danh sách Shipper Chờ Duyệt{" "}
                <span className={styles.pendingCount}>{pendingShipperCount}</span>
            </h2>
            {loading && <p className={styles.textCenter}>Đang tải...</p>}
            {error && <p className={styles.textCenter} style={{ color: "red" }}>{error}</p>}
            {!loading && requests.length === 0 ? (
                <p className={styles.textCenter}>Không có shipper nào.</p>
            ) : (
                !loading && (
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Họ và Tên</th>
                                    <th>Email</th>
                                    <th>Số Điện Thoại</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.ShipperID}>
                                        <td>{request.FullName}</td>
                                        <td>{request.Email}</td>
                                        <td>{request.PhoneNumber}</td>
                                        <td
                                            className={
                                                request.Status === "Pending"
                                                    ? styles.statusPending
                                                    : styles.statusApproved
                                            }
                                        >
                                            {request.Status === "Pending" ? "Chờ Duyệt" : "Đã Duyệt"}
                                        </td>
                                        <td>
                                            {request.Status === "Pending" && (
                                                <button
                                                    onClick={() => handleApprove(request.ShipperID)}
                                                    className={styles.btnApprove}
                                                >
                                                    Duyệt
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(request.ShipperID)}
                                                className={styles.btnDelete}
                                            >
                                                Xóa
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(request.ShipperID)}
                                                className={styles.btnDetails}
                                            >
                                                Xem Chi Tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {selectedShipper && (
                <div className={styles.shipperDetails}>
                    <button onClick={handleCloseDetails} className={styles.btnClose}>
                        X
                    </button>
                    <h3>Thông tin chi tiết shipper</h3>
                    <ul>
                        <li>
                            <strong>Họ và Tên:</strong> {selectedShipper.FullName}
                        </li>
                        <li>
                            <strong>Ngày Sinh:</strong> {formatDate(selectedShipper.BirthDate)}
                        </li>
                        <li>
                            <strong>Số CCCD:</strong> {selectedShipper.CCCD}
                        </li>
                        <li>
                            <strong>Email:</strong> {selectedShipper.Email}
                        </li>
                        <li>
                            <strong>Số Điện Thoại:</strong> {selectedShipper.PhoneNumber}
                        </li>
                        <li>
                            <strong>Giấy Phép Lái Xe:</strong> {selectedShipper.DriverLicense}
                        </li>
                        <li>
                            <strong>Địa Chỉ Thường Trú:</strong> {selectedShipper.PermanentAddress}
                        </li>
                        <li>
                            <strong>Địa Chỉ Hiện Tại:</strong> {selectedShipper.CurrentAddress}
                        </li>
                        <li>
                            <strong>Cơ sở làm việc:</strong> {selectedShipper.WorkAreas}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ShipperRequests;