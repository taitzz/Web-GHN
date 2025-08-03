import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "../../styles/UserList.module.css";
import Swal from "sweetalert2";
import { userApi } from "../../api"; // ✅ Import API từ file api.js

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("adminToken");
                if (!token) {
                    await Swal.fire({
                        title: "Lỗi!",
                        text: "Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.",
                        icon: "error",
                        confirmButtonColor: "#ff4d4d",
                        confirmButtonText: "Đóng",
                    });
                    return;
                }

                const data = await userApi.getAll(token); // ✅ Sử dụng hàm từ api.js
                console.log("🚀 API Response:", data);
                setUsers(data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
                await Swal.fire({
                    title: "Lỗi!",
                    text: err.response?.data?.message || "Không thể tải danh sách người dùng!",
                    icon: "error",
                    confirmButtonColor: "#ff4d4d",
                    confirmButtonText: "Đóng",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "Không có thông tin";
        const date = new Date(dateString);
        if (isNaN(date)) return "Ngày không hợp lệ";
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    const filteredUsers = users.filter(
        (user) =>
            (user.FullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.Email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.Phone || "").includes(searchTerm)
    );

    const deleteUser = async (userID) => {
        const result = await Swal.fire({
            title: "Xác nhận xóa người dùng",
            text: "Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4d4d",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("adminToken");
                await userApi.delete(userID, token); // ✅ Dùng API từ file api.js
                setUsers(users.filter((user) => user.UserID !== userID));
                console.log("✅ Đã xóa người dùng!");
                await Swal.fire({
                    title: "Thành công!",
                    text: "Người dùng đã bị xóa!",
                    icon: "success",
                    confirmButtonColor: "#ff6200",
                    confirmButtonText: "OK",
                });
            } catch (err) {
                console.error("❌ Lỗi khi xóa người dùng:", err);
                const errorMessage = err.response?.data?.message || "Xóa người dùng thất bại!";
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

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="app">
            <div className="app__container">
                <Sidebar />
                <div className="main">
                    <div className={styles.container}>
                        <div className={styles.headerContainer}>
                            <p className={styles.totalUsers}>Tổng số người dùng: {filteredUsers.length}</p>
                        </div>

                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng theo tên, email hoặc số điện thoại"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <p className={`${styles.textCenter} ${styles.textGray500}`}>Đang tải...</p>
                        ) : filteredUsers.length === 0 ? (
                            <p className={`${styles.textCenter} ${styles.textGray500}`}>Không tìm thấy người dùng nào.</p>
                        ) : (
                            <>
                                <div className={styles.tableContainer}>
                                    <table className={styles.userTable}>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Họ và Tên</th>
                                                <th>Ngày Sinh</th>
                                                <th>Email</th>
                                                <th>SĐT</th>
                                                <th>Địa Chỉ</th>
                                                <th>Tài khoản</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map((user, index) => (
                                                <tr key={user.UserID}>
                                                    <td>{indexOfFirstUser + index + 1}</td>
                                                    <td>{user.FullName || "Không có thông tin"}</td>
                                                    <td>{formatDate(user.BirthDate)}</td>
                                                    <td>{user.Email || "Không có thông tin"}</td>
                                                    <td>{user.Phone || "Không có thông tin"}</td>
                                                    <td>{user.Address || "Không có thông tin"}</td>
                                                    <td>{user.Username || "Không có thông tin"}</td>
                                                    <td>
                                                        <button className={styles.deleteBtn} onClick={() => deleteUser(user.UserID)}>
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </button>
                                        <span>Trang {currentPage} / {totalPages}</span>
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
