import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../../styles/ShipperRequests.css"; // Import CSS

const API_URL = "http://localhost:5000/api/shipper";

const ShipperRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await axios.get(`${API_URL}/shipper-requests`);
                console.log("🚀 API Response:", res.data);
                setRequests(res.data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
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
        if (!window.confirm("Bạn có chắc chắn muốn duyệt shipper này?")) return;

        try {
            const response = await axios.put(`${API_URL}/approve/${id}`);
            alert(response.data.message);

            // Cập nhật danh sách shipper ngay lập tức mà không cần gọi lại API
            setRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === id ? { ...request, status: "Approved" } : request
                )
            );
        } catch (err) {
            console.error("Lỗi khi duyệt shipper:", err);
            alert("Có lỗi xảy ra khi duyệt shipper, vui lòng thử lại.");
        }
    };

    // Xử lý xóa shipper
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa shipper này?")) return;

        try {
            await axios.delete(`${API_URL}/delete/${id}`);
            alert("Shipper đã bị xóa!");
            setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
        } catch (err) {
            console.error("Lỗi khi xóa shipper:", err);
            alert("Có lỗi xảy ra khi xóa, vui lòng thử lại.");
        }
    };

    // Xử lý xem chi tiết shipper
    const handleViewDetails = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/shipper-details/${id}`);
            console.log("Thông tin chi tiết shipper:", response.data);
            setSelectedShipper(response.data);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết shipper:", err);
            alert("Có lỗi xảy ra khi lấy thông tin chi tiết, vui lòng thử lại.");
        }
    };

    // Xử lý tắt chi tiết shipper
    const handleCloseDetails = () => {
        setSelectedShipper(null);
    };

    return (
        <div className="app">
            <div className="app__container">
                <Sidebar />
                <div className="main">
                    <TopBar />
                    <div className="requests-container">
                        <h2 className="title">Danh sách Shipper Chờ Duyệt</h2>
                        {requests.length === 0 ? (
                            <p className="text-center text-gray-500">Không có shipper nào.</p>
                        ) : (
                            <div className="table-container">
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
                                            <tr key={request.id}>
                                                <td>{request.fullName}</td>
                                                <td>{request.email}</td>
                                                <td>{request.phoneNumber}</td>
                                                <td
                                                    className={
                                                        request.status === "Pending"
                                                            ? "status-pending"
                                                            : "status-approved"
                                                    }
                                                >
                                                    {request.status === "Pending" ? "Chờ Duyệt" : "Đã Duyệt"}
                                                </td>
                                                <td>
                                                    {request.status === "Pending" && (
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="btn-approve"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(request.id)}
                                                        className="btn-delete"
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDetails(request.id)}
                                                        className="btn-details"
                                                    >
                                                        Xem Chi Tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedShipper && (
                            <div className="shipper-details">
                                <button onClick={handleCloseDetails} className="btn-close">
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
                                        <strong>Số Điện Thoại:</strong> {selectedShipper.Phone}
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
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperRequests;
