import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ghnLogo from "../../assets/images/ghn.png";
import shipperImage from "../../assets/images/shipper.jpg";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import styles from "./ShipperLogin.module.css";

export default function ShipperLogin() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setErrorMessage(""); // Xóa thông báo lỗi trước khi thử đăng nhập

            const response = await axios.post("http://localhost:5000/api/shipper/login", {
                employeeId,
                password,
            });

            // API trả về token và thông tin shipper nếu đăng nhập thành công
            const { token, shipper } = response.data;

            // Lưu token và thông tin shipper vào localStorage
            localStorage.setItem("shipperToken", token);
            localStorage.setItem("shipperId", shipper.id);
            localStorage.setItem("shipperName", shipper.fullName);

            // Hiển thị thông báo thành công
            Swal.fire({
                title: 'Đăng nhập thành công!',
                text: `Chào mừng ${shipper.fullName}`,
                icon: 'success',
                confirmButtonText: 'OK',
            });

            // Chuyển hướng tới dashboard
            navigate("/shipper-dashboard");
        } catch (err) {
            console.error("[ShipperLogin] Lỗi:", err);

            // Hiển thị thông báo lỗi nếu có
            Swal.fire({
                title: 'Lỗi!',
                text: err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
                icon: 'error',
                confirmButtonText: 'OK',
            });

            setErrorMessage(
                err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại."
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.backHome}>
                    <Link to="/" className={styles.backHomeButton}>
                        ⬅ Quay lại Trang Chủ
                    </Link>
                </div>

                <div className={styles.image}>
                    <img src={shipperImage} alt="Shipper" />
                </div>

                <div className={styles.form}>
                    <img src={ghnLogo} alt="GHN Logo" className={styles.ghnLogo} />
                    <h2 className={styles.loginTitle}>Đăng nhập Shipper</h2>

                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                    <div className={styles.inputGroup}>
                        <label>Mã nhân viên</label>
                        <input
                            type="text"
                            placeholder="Nhập mã nhân viên"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
                        <label>Mật khẩu</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            👁
                        </button>
                    </div>

                    <button className={styles.loginButton} onClick={handleLogin}>
                        Đăng nhập
                    </button>

                    <div className={styles.authGuide}>
                        Bạn muốn trở thành nhân viên?{" "}
                        <Link to="/shipper-register" className={styles.registerLink}>
                            Đăng kí ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
