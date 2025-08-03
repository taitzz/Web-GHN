import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/ForgotPassword.module.css"; 
import bg from "../../assets/images/shipper_icon.jpg";
import { FaArrowLeft } from 'react-icons/fa';
import Swal from "sweetalert2"; // Import SweetAlert2

export default function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    const handleSubmitEmail = async () => {
        if (!username || !email) {
            setError("Vui lòng nhập tên tài khoản và email!");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Email không hợp lệ!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/users/forgot-password", { username, email });
            if (response.status === 200) {
                setIsOtpSent(true);
                setError("");
                setTimer(60);
                Swal.fire({
                    title: 'Mã OTP đã được gửi!',
                    text: 'Vui lòng kiểm tra email của bạn để nhận mã OTP.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || "Có lỗi xảy ra!");
            Swal.fire({
                title: 'Có lỗi xảy ra!',
                text: error.response?.data?.message || "Vui lòng thử lại.",
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const handleSubmitOtp = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            setError("Vui lòng nhập mã OTP, mật khẩu mới và xác nhận mật khẩu.");
            return;
        }

        if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(newPassword)) {
            setError("Mật khẩu mới không hợp lệ. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/users/reset-password", { username, otp, newPassword });
            if (response.status === 200) {
                setSuccessMessage("Mật khẩu đã được thay đổi thành công!");
                setError("");
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Mật khẩu của bạn đã được thay đổi.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || "Mã OTP không hợp lệ.");
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || "Vui lòng kiểm tra lại mã OTP.",
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOtpChange = (e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
        setOtp(value);
    };

    return (
        <div className={styles.forgotPasswordContainer}>
            <div className={styles.left}>
                <div className={styles.backgroundLeft}>
                    <img src={bg} className={styles.normal} alt="background" />
                    <div className={styles.contentNote}>
                        <div className={styles.leftRow2}>
                            THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG
                            <br />
                            TỐT NHẤT TỪ TRƯỚC ĐẾN NAY
                        </div>
                        <div className={styles.leftRow3}>
                            Nhanh hơn, rẻ hơn và thông minh hơn
                        </div>
                    </div>
                    <div className={styles.backdrop}></div>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.formContainer}>
                    <div className={styles.titleForgotpassword}>
                        <h2>BẠN ĐÃ QUÊN MẬT KHẨU?</h2>
                        <p>GHN rất tiếc vì sự cố này và sẵn sàng hỗ trợ!</p>
                    </div>

                    {successMessage ? (
                        <div className={styles.successMessage}>
                            <p>{successMessage}</p>
                            <p>Đang chuyển hướng đến trang đăng nhập...</p>
                        </div>
                    ) : isOtpSent ? (
                        <div>
                            <p>Nhập mã OTP đã được gửi đến email của bạn:</p>
                            <input
                                type="text"
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength="6"
                                className={styles.otpInput}
                            />

                            <p>Nhập mật khẩu mới:</p>
                            <div className={styles.passwordInput}>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <p>Nhập lại mật khẩu:</p>
                            <div className={styles.passwordInput}>
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <button onClick={handleSubmitOtp} className={styles.button}>Đổi mật khẩu</button>
                        </div>
                    ) : (
                        <div>
                            <p>Nhập tên tài khoản và email của bạn:</p>
                            <input
                                type="text"
                                placeholder="Tên tài khoản"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                            />
                            <input
                                type="email"
                                placeholder="Email đã đăng kí trước đó"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                            <button
                                onClick={handleSubmitEmail}
                                disabled={timer > 0}
                                className={styles.button}
                            >
                                {timer > 0 ? `Gửi lại OTP sau ${timer}s` : "Gửi OTP"}
                            </button>
                        </div>
                    )}
                    {error && <p className={styles.errorText}>{error}</p>}

                    <div className={styles.backToLogin} onClick={() => navigate("/login")}>
                        <FaArrowLeft className={styles.backIcon} />
                        <span>Quay lại trang </span>
                        <span className={styles.loginText}>Đăng nhập</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
