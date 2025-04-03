import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import styles from "../../styles/DetailsShipper.module.css"; // Import CSS Module

const API_URL = "http://localhost:5000/api/shipper";

const DetailsShipper = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/approved-shippers`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                console.log("🚀 API Response:", res.data);
                // Log chi tiết giá trị IsAvailable của từng shipper
                res.data.forEach((employee, index) => {
                    console.log(
                        `Shipper ${index + 1}: IsAvailable =`,
                        employee.IsAvailable,
                        `| Type:`,
                        typeof employee.IsAvailable
                    );
                });
                setEmployees(res.data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // Chuyển đổi ngày sinh về định dạng dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) {
            return "Ngày không hợp lệ";
        }
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Hàm xử lý WorkAreas để hiển thị
    const formatWorkAreas = (workAreas) => {
        let workAreasDisplay = "Chưa có thông tin";
        if (workAreas) {
            try {
                if (typeof workAreas === "string") {
                    try {
                        const parsedWorkAreas = JSON.parse(workAreas);
                        if (Array.isArray(parsedWorkAreas)) {
                            workAreasDisplay = parsedWorkAreas.join(", ");
                        } else {
                            workAreasDisplay = workAreas;
                        }
                    } catch (err) {
                        workAreasDisplay = workAreas;
                    }
                } else if (Array.isArray(workAreas)) {
                    workAreasDisplay = workAreas.join(", ");
                } else {
                    workAreasDisplay = String(workAreas);
                }
            } catch (err) {
                console.error("Lỗi khi xử lý WorkAreas:", err);
                workAreasDisplay = "Dữ liệu không hợp lệ";
            }
        }
        return workAreasDisplay;
    };

    // Lọc nhân viên theo tìm kiếm (theo tên, email, số CCCD hoặc GPLX)
    const filteredEmployees = employees.filter(
        (employee) =>
            employee.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.CCCD.includes(searchTerm) ||
            employee.DriverLicense.includes(searchTerm)
    );

    // Xóa nhân viên
    const handleDelete = async (id, isAvailable) => {
        // Chuyển đổi isAvailable thành số nếu nó là chuỗi
        const isAvailableNumber = Number(isAvailable);

        // Kiểm tra nếu shipper đang giao hàng (IsAvailable = 0)
        if (isAvailableNumber === 0) {
            await Swal.fire({
                title: "Lỗi!",
                text: "Không thể xóa shipper đang giao hàng.",
                icon: "error",
                confirmButtonColor: "#ff4d4d",
                confirmButtonText: "Đóng",
            });
            return; // Dừng hàm, không thực hiện xóa
        }

        // Nếu shipper không đang giao hàng, tiếp tục hiển thị xác nhận xóa
        const result = await Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn có muốn xóa nhân viên này không? Hành động này không thể hoàn tác!",
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
                console.error("❌ Lỗi khi xóa nhân viên:", err);
                Swal.fire("Lỗi!", "Không thể xóa nhân viên!", "error");
            }
        }
    };

    // Xem chi tiết nhân viên
    const handleViewDetails = (employee) => {
        const workAreasDisplay = formatWorkAreas(employee.WorkAreas);

        Swal.fire({
            title: "Thông tin chi tiết nhân viên",
            html: `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-family: Arial, sans-serif;
                ">
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Họ và Tên:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.FullName}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Ngày Sinh:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${formatDate(employee.BirthDate)}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Số CCCD:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.CCCD}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Số Điện Thoại:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.PhoneNumber || employee.Phone}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Email:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.Email}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Địa Chỉ Thường Trú:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.PermanentAddress}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Địa Chỉ Hiện Tại:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.CurrentAddress}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Giấy Phép Lái Xe:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.DriverLicense}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Tên Tài Khoản:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.EmployeeID}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Mật Khẩu:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${employee.Password}</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 0;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        <span style="
                            font-weight: 600;
                            color: #333;
                            width: 180px;
                            flex-shrink: 0;
                            font-size: 14px;
                        ">Cơ Sở Làm Việc:</span>
                        <span style="
                            color: #555;
                            font-size: 14px;
                            word-break: break-word;
                            margin-left: 5px;
                        ">${workAreasDisplay}</span>
                    </div>
                </div>
            `,
            confirmButtonText: "Đóng",
            confirmButtonColor: "#ff6200",
            width: "700px",
            customClass: {
                popup: "custom-modal",
                title: "custom-modal-title",
                htmlContainer: "custom-modal-content",
                confirmButton: "custom-modal-button",
            },
        });
    };

    return (
        <div className={styles.container}>
            {/* Ô tìm kiếm */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên theo tên, email, CCCD hoặc GPLX"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className={styles.textCenter}>
                    <p>Đang tải...</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <p className={styles.textCenter}>Không tìm thấy nhân viên nào.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.shipperTable}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ Tên</th>
                                <th>Số ĐT</th>
                                <th>Email</th>
                                <th>Cơ Sở</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee, index) => {
                                // Chuyển đổi IsAvailable thành số nếu nó là chuỗi
                                const isAvailable = Number(employee.IsAvailable);

                                return (
                                    <tr key={employee.ShipperID}>
                                        <td>{index + 1}</td>
                                        <td>{employee.FullName}</td>
                                        <td>{employee.PhoneNumber || employee.Phone}</td>
                                        <td>{employee.Email}</td>
                                        <td>{formatWorkAreas(employee.WorkAreas)}</td>
                                        <td
                                            className={
                                                isAvailable === 1
                                                    ? styles.statusIdle
                                                    : styles.statusDelivering
                                            }
                                        >
                                            {isAvailable === 1
                                                ? "Rảnh"
                                                : isAvailable === 0
                                                ? "Giao hàng"
                                                : "Không xác định"}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => handleViewDetails(employee)}
                                            >
                                                Xem chi tiết
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() =>
                                                    handleDelete(employee.ShipperID, employee.IsAvailable)
                                                }
                                            >
                                                Xóa tài khoản
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DetailsShipper;