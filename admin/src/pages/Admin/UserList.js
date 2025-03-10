import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../../styles/UserList.css"; // Import CSS

const API_URL = "http://localhost:5000/api/users";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
                
                if (!token) {
                    setError("Bạn chưa đăng nhập!");
                    return;
                }

                const res = await axios.get(`${API_URL}/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token lên API
                    },
                });

                console.log("🚀 API Response:", res.data);
                setUsers(res.data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
                setError(err.response?.data?.message || "Lỗi server!");
            }
        };
        fetchUsers();
    }, []);

    // Chuyển đổi ngày sinh về định dạng dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return "Ngày không hợp lệ";
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    // Lọc người dùng theo tìm kiếm (theo tên, email, số điện thoại)
    const filteredUsers = users.filter(
        (user) =>
            user.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.Phone.includes(searchTerm)
    );

    // Xóa người dùng
    const deleteUser = async (userID) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            try {
                await axios.delete(`${API_URL}/${userID}`);
                setUsers(users.filter((user) => user.UserID !== userID));
                console.log("✅ Đã xóa người dùng!");
            } catch (err) {
                console.error("❌ Lỗi khi xóa người dùng:", err);
            }
        }
    };

    return (
        <div className="app">
            <div className="app__container">
                <Sidebar />
                <div className="main">
                    <TopBar />
                    <div className="user-list-container">
                        <h2 className="title">Danh sách Người Dùng</h2>

                        {/* Hiển thị tổng số người dùng */}
                        <p className="total-users">Tổng số người dùng: {filteredUsers.length}</p>

                        {/* Ô tìm kiếm */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng theo tên, email hoặc số điện thoại"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {filteredUsers.length === 0 ? (
                            <p className="text-center text-gray-500">Không tìm thấy người dùng nào.</p>
                        ) : (
                            <div className="info-list">
                                {filteredUsers.map((user) => (
                                    <ul key={user.UserID} className="user-card">
                                        <li><strong>Họ và Tên:</strong> <span>{user.FullName}</span></li>
                                        <li><strong>Ngày Sinh:</strong> <span>{formatDate(user.BirthDate)}</span></li>
                                        <li><strong>Email:</strong> <span>{user.Email}</span></li>
                                        <li><strong>Số Điện Thoại:</strong> <span>{user.Phone}</span></li>
                                        <li><strong>Địa Chỉ:</strong> <span>{user.Address}</span></li>
                                        <li><strong>Tài khoản:</strong><span>{user.Username}</span></li>                                        
                                        {/* Nút Xóa tài khoản */}
                                        <li>
                                            <button className="delete-btn" onClick={() => deleteUser(user.UserID)}>
                                                Xóa tài khoản
                                            </button>
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

export default UserList;
