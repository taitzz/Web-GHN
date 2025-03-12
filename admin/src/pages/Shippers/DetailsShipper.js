import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../../styles/DetailsShipper.css"; // Import CSS

const API_URL = "http://localhost:5000/api/shipper";

const DetailsShipper = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axios.get(`${API_URL}/approved-shippers`);
                console.log("🚀 API Response:", res.data);
                setEmployees(res.data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
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

    // Lọc nhân viên theo tìm kiếm (theo tên, email, số CCCD hoặc GPLX)
    const filteredEmployees = employees.filter(
        (employee) =>
            employee.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.CCCD.includes(searchTerm) ||
            employee.DriverLicense.includes(searchTerm)
    );

    // Xóa nhân viên
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            try {
                await axios.delete(`${API_URL}/delete/${id}`);
                setEmployees(employees.filter(employee => employee.ShipperID !== id));
            } catch (err) {
                console.error("❌ Lỗi khi xóa nhân viên:", err);
            }
        }
    };

    return (
        <div className="app">
            <div className="app__container">
                <Sidebar />
                <div className="main">
                    <TopBar />
                    <div className="details-shipper-container">
                        <h2 className="title">Danh sách Nhân Viên</h2>

                        {/* Ô tìm kiếm */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhân viên theo tên, email, CCCD hoặc GPLX"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {filteredEmployees.length === 0 ? (
                            <p className="text-center text-gray-500">Không tìm thấy nhân viên nào.</p>
                        ) : (
                            <div className="info-list">
                                {filteredEmployees.map((employee) => (
                                    <ul key={employee.ShipperID} className="shipper-card">
                                        <li>
                                            <strong>Họ và Tên:</strong> <span>{employee.FullName}</span>
                                        </li>
                                        <li>
                                            <strong>Ngày Sinh:</strong> <span>{formatDate(employee.BirthDate)}</span>
                                        </li>
                                        <li>
                                            <strong>Số CCCD:</strong> <span>{employee.CCCD}</span>
                                        </li>
                                        <li>
                                            <strong>Số Điện Thoại:</strong> <span>{employee.Phone}</span>
                                        </li>
                                        <li>
                                            <strong>Email:</strong> <span>{employee.Email}</span>
                                        </li>
                                        <li>
                                            <strong>Địa Chỉ Thường Trú:</strong> <span>{employee.PermanentAddress}</span>
                                        </li>
                                        <li>
                                            <strong>Địa Chỉ Hiện Tại:</strong> <span>{employee.CurrentAddress}</span>
                                        </li>                            
                                        <li>
                                            <strong>Giấy Phép Lái Xe:</strong> <span>{employee.DriverLicense}</span>
                                        </li>
                                        <li>
                                            <strong>Tên tài Khoản:</strong> <span>{employee.EmployeeID}</span>
                                        </li> 
                                        <li>
                                            <strong>Mật khẩu:</strong> <span>{employee.Password}</span>
                                        </li>                                
                                        <li>
                                            <button className="delete-button" onClick={() => handleDelete(employee.ShipperID)}>Xóa Nhân Viên</button>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsShipper;
