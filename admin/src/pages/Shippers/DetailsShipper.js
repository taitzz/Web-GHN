import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import styles from "../../styles/DetailsShipper.module.css";

const API_URL = "http://localhost:5000/api/shipper";
const PROVINCES_API_URL = "https://provinces.open-api.vn/api/p/";

const DetailsShipper = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [editShipper, setEditShipper] = useState(null);
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        fetchEmployees();
        fetchProvinces();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/approved-shippers`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            setEmployees(res.data);
        } catch (err) {
            console.error("❌ Lỗi khi tải dữ liệu:", err);
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

    const formatWorkAreas = (workAreas) => {
        if (!workAreas) return "Chưa có thông tin";
        if (typeof workAreas === "string") {
            // Nếu là chuỗi thuần, trả về luôn mà không cần parse
            return workAreas.trim();
        }
        if (Array.isArray(workAreas)) {
            return workAreas.join(", ");
        }
        try {
            // Nếu là JSON, thử parse
            const parsedWorkAreas = JSON.parse(workAreas);
            if (Array.isArray(parsedWorkAreas)) {
                return parsedWorkAreas.join(", ");
            }
            return String(parsedWorkAreas);
        } catch (err) {
            return workAreas; // Nếu parse thất bại, trả về nguyên gốc
        }
    };

    // Cập nhật logic lọc để bao gồm WorkAreas
    const filteredEmployees = employees.filter((employee) => {
        const searchLower = searchTerm.toLowerCase();
        const workAreasText = formatWorkAreas(employee.WorkAreas).toLowerCase();

        return (
            employee.FullName.toLowerCase().includes(searchLower) ||
            employee.Email.toLowerCase().includes(searchLower) ||
            employee.CCCD.includes(searchLower) ||
            employee.DriverLicense.includes(searchLower) ||
            workAreasText.includes(searchLower)
        );
    });

    const handleDelete = async (id, isAvailable) => {
        const isAvailableNumber = Number(isAvailable);
        if (isAvailableNumber === 0) {
            await Swal.fire({
                title: "Lỗi!",
                text: "Không thể xóa shipper đang giao hàng.",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
            return;
        }

        const result = await Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn có muốn xóa nhân viên này không?",
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
                setEmployees(employees.filter((employee) => employee.ShipperID !== id));
                Swal.fire("Đã xóa!", "Nhân viên đã được xóa thành công.", "success");
            } catch (err) {
                Swal.fire("Lỗi!", "Không thể xóa nhân viên!", "error");
            }
        }
    };

    const handleEdit = (employee) => {
        let workAreasValue = employee.WorkAreas || "";
        if (employee.WorkAreas && typeof employee.WorkAreas === "string") {
            try {
                const parsedWorkAreas = JSON.parse(employee.WorkAreas);
                workAreasValue = Array.isArray(parsedWorkAreas) && parsedWorkAreas.length > 0 ? parsedWorkAreas[0] : employee.WorkAreas;
            } catch {
                workAreasValue = employee.WorkAreas; // Chuỗi thuần thì giữ nguyên
            }
        }
        setEditShipper({
            ShipperID: employee.ShipperID,
            fullName: employee.FullName,
            email: employee.Email,
            phoneNumber: employee.PhoneNumber || employee.Phone,
            birthDate: employee.BirthDate.split("T")[0],
            permanentAddress: employee.PermanentAddress,
            currentAddress: employee.CurrentAddress,
            cccd: employee.CCCD,
            driverLicense: employee.DriverLicense,
            workAreas: workAreasValue,
        });
    };

    const handleWorkAreasChange = (selectedOption) => {
        const workAreas = selectedOption ? selectedOption.value : "";
        setEditShipper({ ...editShipper, workAreas });
    };

    const handleUpdateShipper = async (e) => {
        e.preventDefault();
        try {
            console.log("Dữ liệu gửi đi:", editShipper); // Log để kiểm tra
            await axios.put(`${API_URL}/update/${editShipper.ShipperID}`, editShipper, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            await Swal.fire("Thành công!", "Thông tin shipper đã được cập nhật!", "success");
            setEditShipper(null);
            fetchEmployees();
        } catch (err) {
            console.error("Lỗi khi cập nhật:", err);
            Swal.fire("Lỗi!", err.response?.data?.message || "Không thể cập nhật thông tin shipper.", "error");
        }
    };

    const handleViewDetails = (employee) => {
        const workAreasDisplay = formatWorkAreas(employee.WorkAreas);
        Swal.fire({
            title: "Thông tin chi tiết nhân viên",
            html: `
                <div style="display: flex; flex-direction: column; gap: 10px; font-family: Arial, sans-serif;">
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Họ và Tên:</span>
                        <span style="color: #555;">${employee.FullName}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Ngày Sinh:</span>
                        <span style="color: #555;">${formatDate(employee.BirthDate)}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Số CCCD:</span>
                        <span style="color: #555;">${employee.CCCD}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Số Điện Thoại:</span>
                        <span style="color: #555;">${employee.PhoneNumber || employee.Phone || "Không có"}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Email:</span>
                        <span style="color: #555;">${employee.Email}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Địa Chỉ Thường Trú:</span>
                        <span style="color: #555;">${employee.PermanentAddress}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Địa Chỉ Hiện Tại:</span>
                        <span style="color: #555;">${employee.CurrentAddress}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Giấy Phép Lái Xe:</span>
                        <span style="color: #555;">${employee.DriverLicense}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Cơ Sở Làm Việc:</span>
                        <span style="color: #555;">${workAreasDisplay}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Tài Khoản:</span>
                        <span style="color: #555;">${employee.EmployeeID || "Không có"}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px 0;">
                        <span style="font-weight: 600; color: #333; width: 180px;">Mật Khẩu:</span>
                        <span style="color: #555;">${employee.Password || "Không có"}</span>
                    </div>
                </div>
            `,
            confirmButtonText: "Đóng",
            confirmButtonColor: "#ff6200",
            width: "700px",
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, CCCD, GPLX hoặc cơ sở làm việc"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className={styles.textCenter}><p>Đang tải...</p></div>
            ) : filteredEmployees.length === 0 ? (
                <p className={styles.textCenter}>Không tìm thấy nhân viên nào.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.shipperTable}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ&Tên</th>
                                <th>SĐT</th>
                                <th>Email</th>
                                <th>Cơ Sở</th>
                                <th>TT</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee, index) => {
                                const isAvailable = Number(employee.IsAvailable);
                                return (
                                    <tr key={employee.ShipperID}>
                                        <td>{index + 1}</td>
                                        <td>{employee.FullName}</td>
                                        <td>{employee.PhoneNumber || employee.Phone}</td>
                                        <td>{employee.Email}</td>
                                        <td>{formatWorkAreas(employee.WorkAreas)}</td>
                                        <td className={isAvailable === 1 ? styles.statusIdle : styles.statusDelivering}>
                                            {isAvailable === 1 ? "Rảnh" : "Bận"}
                                        </td>
                                        <td>
                                            <button className={styles.viewButton} onClick={() => handleViewDetails(employee)}>
                                                Xem chi tiết
                                            </button>
                                            <button className={styles.editButton} onClick={() => handleEdit(employee)}>
                                                Sửa
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDelete(employee.ShipperID, employee.IsAvailable)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editShipper && (
                <div className={styles.editForm}>
                    <h3>Sửa Thông Tin Shipper</h3>
                    <form onSubmit={handleUpdateShipper}>
                        <input
                            type="text"
                            placeholder="Họ và Tên"
                            value={editShipper.fullName}
                            onChange={(e) => setEditShipper({ ...editShipper, fullName: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={editShipper.email}
                            onChange={(e) => setEditShipper({ ...editShipper, email: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số Điện Thoại"
                            value={editShipper.phoneNumber}
                            onChange={(e) => setEditShipper({ ...editShipper, phoneNumber: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            value={editShipper.birthDate}
                            onChange={(e) => setEditShipper({ ...editShipper, birthDate: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Địa Chỉ Thường Trú"
                            value={editShipper.permanentAddress}
                            onChange={(e) => setEditShipper({ ...editShipper, permanentAddress: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Địa Chỉ Hiện Tại"
                            value={editShipper.currentAddress}
                            onChange={(e) => setEditShipper({ ...editShipper, currentAddress: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số CCCD"
                            value={editShipper.cccd}
                            onChange={(e) => setEditShipper({ ...editShipper, cccd: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Giấy Phép Lái Xe"
                            value={editShipper.driverLicense}
                            onChange={(e) => setEditShipper({ ...editShipper, driverLicense: e.target.value })}
                            required
                        />
                        <Select
                            options={provinces}
                            onChange={handleWorkAreasChange}
                            placeholder="Chọn cơ sở làm việc..."
                            className={styles.selectWorkAreas}
                            value={provinces.find((option) => option.value === editShipper.workAreas) || null}
                            required
                        />
                        <button type="submit" className={styles.btnSubmit}>Cập nhật</button>
                        <button type="button" className={styles.btnCancel} onClick={() => setEditShipper(null)}>Hủy</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DetailsShipper;