import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/ForgotPassword.css";
import ghn from "../../assets/images/ghn.png";
import bg from "../../assets/images/shipper_icon.jpg";
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");  // OTP sẽ được lưu trữ dưới dạng chuỗi
    const [newPassword, setNewPassword] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    // Hàm xử lý gửi OTP
    const handleSubmitEmail = async () => {
        if (!username || !email) {
            setError("Vui lòng nhập tên tài khoản và email!");
            return;
        }
    
        // Kiểm tra định dạng email hợp lệ
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Email không hợp lệ!");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/api/users/forgot-password", { username, email });
    
            if (response.status === 200) {
                setIsOtpSent(true);
                setError("");
                setTimer(60); // Đặt thời gian chờ 1 phút (60 giây)
            }
        } catch (error) {
            setError(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };    

    // Hàm xử lý gửi mã OTP và mật khẩu mới
    const handleSubmitOtp = async () => {
        if (!otp || !newPassword) {
            setError("Vui lòng nhập mã OTP và mật khẩu mới.");
            return;
        }
    
        // Kiểm tra mật khẩu mới có hợp lệ không (tối thiểu 8 ký tự, chứa chữ hoa, chữ thường, số)
        if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(newPassword)) {
            setError("Mật khẩu mới không hợp lệ. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/api/users/reset-password", { username, otp, newPassword });
    
            if (response.status === 200) {
                setSuccessMessage("Mật khẩu đã được thay đổi thành công!");
                setError("");
    
                // Chuyển về trang đăng nhập sau 3 giây
                setTimeout(() => {
                    navigate("/"); // Điều hướng về trang đăng nhập
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || "Mã OTP không hợp lệ.");
        }
    };    

    // Giảm thời gian chờ mỗi giây
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
    
            // Hủy interval khi component unmount hoặc timer == 0
            return () => clearInterval(interval);
        }
    }, [timer]);    

    // Hàm xử lý thay đổi giá trị OTP
    const handleOtpChange = (e) => {
        const value = e.target.value;

        if (/[^0-9]/.test(value)) return;  // Kiểm tra xem có phải là chữ số không

        setOtp(value);  // Cập nhật toàn bộ giá trị OTP khi người dùng nhập
    };

    return (
        <div className="forgot-password-container">
            <div className="left">
                <div className="background-left">
                    <img src={bg} className="normal" alt="background" />
                    <div className="content-note">                      
                        <div className="left-row2">
                            THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG
                            <br />
                            TỐT NHẤT TỪ TRƯỚC ĐẾN NAY
                        </div>
                        <div className="left-row3">
                            Nhanh hơn, rẻ hơn và thông minh hơn
                        </div>
                    </div>
                    <div className="backdrop"></div>
                </div>
            </div>

            <div className="right">
                <div className="form-container">
                    <div className="title-forgotpassword">
                        <h2>BẠN ĐÃ QUÊN MẬT KHẨU?</h2>
                        <p>GHN rất tiếc vì sự cố này và sẵn sàng hỗ trợ!</p>
                    </div>

                    {successMessage ? (
                        <div className="success-message">
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
                                maxLength="6"  // Giới hạn chiều dài OTP
                                className="otp-input"
                            />

                            <p>Nhập mật khẩu mới:</p>
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <button onClick={handleSubmitOtp}>Đổi mật khẩu</button>
                        </div>
                    ) : (
                        <div>
                            <p>Nhập tên tài khoản và email của bạn:</p>
                            <input
                                type="text"
                                placeholder="Tên tài khoản"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="Email đã đăng kí trước đó"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button onClick={handleSubmitEmail} disabled={timer > 0}>
                                {timer > 0 ? `Gửi lại OTP sau ${timer}s` : "Gửi OTP"}
                            </button>
                        </div>
                    )}
                    {error && <p className="error-text">{error}</p>}

                    <div className="back-to-login" onClick={() => navigate("/")}>
                        <FaArrowLeft className="back-icon" />
                        <span>Quay lại trang </span>
                        <span className="login-text">Đăng nhập</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
