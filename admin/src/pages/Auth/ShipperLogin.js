import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ghnLogo from "../../assets/images/ghn.png";
import shipperImage from "../../assets/images/shipper.jpg";
import axios from "axios";
import "./ShipperLogin.css"; // Import file CSS

export default function ShipperLogin() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/shipper/login", {
                employeeId,
                password
            });
            
            // Nếu login thành công, chuyển đến trang dashboard hoặc trang chính của shipper
            if (response.data.success) {
                // Lưu thông tin shipper vào localStorage hoặc trạng thái của ứng dụng
                localStorage.setItem("shipperId", employeeId);
                navigate("/shipper-dashboard"); // Chuyển hướng tới dashboard hoặc trang cần thiết
            } else {
                setErrorMessage("Sai tài khoản hoặc mật khẩu.");
            }
        } catch (err) {
            console.error("Lỗi khi đăng nhập:", err);
            setErrorMessage("Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="shipper-container">
            <div className="shipper-login-box">
                <div className="back-home">
                    <Link to="/" className="back-home-button">
                        ⬅ Quay lại Trang Chủ
                    </Link>
                </div>

                <div className="shipper-image">
                    <img src={shipperImage} alt="Shipper" />
                </div>

                <div className="shipper-form">
                    <img src={ghnLogo} alt="GHN Logo" className="ghn-logo" />
                    <h2 className="login-title">Đăng nhập Shipper</h2>

                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Hiển thị lỗi */}

                    <div className="input-group">
                        <label>Mã nhân viên</label>
                        <input
                            type="text"
                            placeholder="Nhập mã nhân viên"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                        />
                    </div>

                    <div className="input-group password-group">
                        <label>Mật khẩu</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            👁
                        </button>
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <button className="login-button" onClick={handleLogin}>
                        Đăng nhập
                    </button>

                    <div className="auth-guide">
                        Bạn muốn trở thành nhân viên?{" "}
                        <Link to="/shipper-register" className="register-link">
                            Đăng kí ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
