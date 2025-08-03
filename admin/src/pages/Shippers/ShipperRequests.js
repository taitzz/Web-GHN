import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Thư viện react-select
import styles from "../../styles/ShipperRequests.module.css";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/shipper";
const PROVINCES_API_URL = "https://provinces.open-api.vn/api/p/"; // API lấy danh sách tỉnh/thành phố

const ShipperRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [provinces, setProvinces] = useState([]); // Danh sách tỉnh/thành phố
    const [newShipper, setNewShipper] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        permanentAddress: "",
        currentAddress: "",
        cccd: "",
        driverLicense: "",
        workAreas: "",
    });

    useEffect(() => {
        fetchRequests();
        fetchProvinces();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/shipper-requests`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
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

    const fetchProvinces = async () => {
        try {
            const response = await axios.get(PROVINCES_API_URL);
            const provinceOptions = response.data.map((province) => ({
                value: province.name,
                label: province.name,
            }));
            setProvinces(provinceOptions);
        } catch (err) {
            console.error("❌ Lỗi khi tải danh sách tỉnh/thành phố:", err);
            Swal.fire("Lỗi!", "Không thể tải danh sách tỉnh/thành phố.", "error");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return "Ngày không hợp lệ";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleAddShipper = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/create-and-approve`, newShipper, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            await Swal.fire({
                title: "Thành công!",
                text: "Shipper đã được thêm, duyệt và email thông báo đã được gửi!",
                icon: "success",
                confirmButtonColor: "#ff6200",
            });
            setShowAddForm(false);
            setNewShipper({
                fullName: "",
                email: "",
                phoneNumber: "",
                birthDate: "",
                permanentAddress: "",
                currentAddress: "",
                cccd: "",
                driverLicense: "",
                workAreas: "",
            });
            fetchRequests();
        } catch (err) {
            console.error("Lỗi khi thêm shipper:", err);
            Swal.fire("Lỗi!", err.response?.data?.message || "Không thể thêm shipper, vui lòng thử lại.", "error");
        }
    };

    const handleApprove = async (id) => {
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
                const response = await axios.put(`${API_URL}/approve/${id}`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                await Swal.fire("Thành công!", response.data.message || "Shipper đã được duyệt!", "success");
                setRequests((prev) => prev.filter((request) => request.ShipperID !== id));
            } catch (err) {
                Swal.fire("Lỗi!", "Có lỗi xảy ra khi duyệt shipper.", "error");
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Xác nhận xóa shipper",
            text: "Bạn có chắc chắn muốn xóa shipper này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4d4f",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/delete/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                await Swal.fire("Thành công!", "Shipper đã bị xóa!", "success");
                setRequests((prev) => prev.filter((request) => request.ShipperID !== id));
            } catch (err) {
                Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa.", "error");
            }
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/shipper-details/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
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
            Swal.fire("Lỗi!", "Có lỗi xảy ra khi lấy thông tin chi tiết.", "error");
        }
    };

    const handleCloseDetails = () => {
        setSelectedShipper(null);
    };

    const handleWorkAreasChange = (selectedOption) => {
        const workAreas = selectedOption ? selectedOption.value : "";
        setNewShipper({ ...newShipper, workAreas });
    };

    const pendingShipperCount = requests.length;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Danh sách Shipper Chờ Duyệt{" "}
                <span className={styles.pendingCount}>{pendingShipperCount}</span>
            </h2>
            <button className={styles.btnAdd} onClick={() => setShowAddForm(true)}>
                Thêm Shipper Mới
            </button>

            {showAddForm && (
                <div className={styles.addFormModal}>
                    <button className={styles.btnClose} onClick={() => setShowAddForm(false)}>X</button>
                    <h3>Thêm Shipper Mới</h3>
                    <form onSubmit={handleAddShipper}>
                        <input
                            type="text"
                            placeholder="Họ và Tên"
                            value={newShipper.fullName}
                            onChange={(e) => setNewShipper({ ...newShipper, fullName: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newShipper.email}
                            onChange={(e) => setNewShipper({ ...newShipper, email: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số Điện Thoại"
                            value={newShipper.phoneNumber}
                            onChange={(e) => setNewShipper({ ...newShipper, phoneNumber: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            value={newShipper.birthDate}
                            onChange={(e) => setNewShipper({ ...newShipper, birthDate: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Địa Chỉ Thường Trú"
                            value={newShipper.permanentAddress}
                            onChange={(e) => setNewShipper({ ...newShipper, permanentAddress: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Địa Chỉ Hiện Tại"
                            value={newShipper.currentAddress}
                            onChange={(e) => setNewShipper({ ...newShipper, currentAddress: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số CCCD"
                            value={newShipper.cccd}
                            onChange={(e) => setNewShipper({ ...newShipper, cccd: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Giấy Phép Lái Xe"
                            value={newShipper.driverLicense}
                            onChange={(e) => setNewShipper({ ...newShipper, driverLicense: e.target.value })}
                            required
                        />
                        <Select
                            options={provinces}
                            onChange={handleWorkAreasChange}
                            placeholder="Chọn cơ sở làm việc..."
                            className={styles.selectWorkAreas}
                            value={provinces.find((option) => option.value === newShipper.workAreas) || null}
                            required
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.btnSubmit}>Thêm và Duyệt</button>
                            <button type="button" className={styles.btnCancel} onClick={() => setShowAddForm(false)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

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
                                        <td className={request.Status === "Pending" ? styles.statusPending : styles.statusApproved}>
                                            {request.Status === "Pending" ? "Chờ Duyệt" : "Đã Duyệt"}
                                        </td>
                                        <td>
                                            {request.Status === "Pending" && (
                                                <button onClick={() => handleApprove(request.ShipperID)} className={styles.btnApprove}>
                                                    Duyệt
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(request.ShipperID)} className={styles.btnDelete}>
                                                Xóa
                                            </button>
                                            <button onClick={() => handleViewDetails(request.ShipperID)} className={styles.btnDetails}>
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
                    <button onClick={handleCloseDetails} className={styles.btnClose}>X</button>
                    <h3>Thông tin chi tiết shipper</h3>
                    <ul>
                        <li><strong>Họ và Tên:</strong> {selectedShipper.FullName}</li>
                        <li><strong>Ngày Sinh:</strong> {formatDate(selectedShipper.BirthDate)}</li>
                        <li><strong>Số CCCD:</strong> {selectedShipper.CCCD}</li>
                        <li><strong>Email:</strong> {selectedShipper.Email}</li>
                        <li><strong>Số Điện Thoại:</strong> {selectedShipper.PhoneNumber}</li>
                        <li><strong>Giấy Phép Lái Xe:</strong> {selectedShipper.DriverLicense}</li>
                        <li><strong>Địa Chỉ Thường Trú:</strong> {selectedShipper.PermanentAddress}</li>
                        <li><strong>Địa Chỉ Hiện Tại:</strong> {selectedShipper.CurrentAddress}</li>
                        <li><strong>Cơ sở làm việc:</strong> {selectedShipper.WorkAreas}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ShipperRequests;