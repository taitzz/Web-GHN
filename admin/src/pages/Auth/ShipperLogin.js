import { useState } from "react";
import { Link } from "react-router-dom";
import ghnLogo from "../../assets/images/ghn.png";
import shipperImage from "../../assets/images/shipper.jpg";
import "./ShipperLogin.css"; // Import file CSS

export default function ShipperLogin() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        console.log("Shipper logged in:", employeeId);
        // Xử lý đăng nhập shipper ở đây
    };

    return (
        <div className="shipper-container">
            <div className="shipper-login-box">
                {/* Nút quay lại Trang Chủ nằm bên trong shipper-login-box */}
                <div className="back-home">
                    <Link to="/" className="back-home-button">
                        ⬅ Quay lại Trang Chủ
                    </Link>
                </div>

                {/* Hình ảnh shipper */}
                <div className="shipper-image">
                    <img src={shipperImage} alt="Shipper" />
                </div>

                {/* Form đăng nhập */}
                <div className="shipper-form">
                    <img src={ghnLogo} alt="GHN Logo" className="ghn-logo" />
                    <h2 className="login-title">Đăng nhập Shipper</h2>

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
