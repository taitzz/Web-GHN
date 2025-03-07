import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/LoginUser.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ghn from '../../assets/images/ghn.png';
import bg from '../../assets/images/shipper_icon.jpg';
import axios from 'axios';

export default function LoginUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState("");
    const [greeting, setGreeting] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 11) {
                return "Chào ngày mới! Cùng chốt nhiều đơn hôm nay nhé.";
            } else if (hour >= 19 && hour <= 23) {
                return "Buổi tối an lành bên gia đình bạn nhé! Gác công việc lại nào.";
            } else {
                return "Chúc bạn một ngày tốt lành!";
            }
        };
        setGreeting(getGreeting());
    }, []);

    const handleLogin = async () => {
        let newErrors = {};
        setLoginError(""); 
    
        if (!username.trim()) newErrors.username = "Vui lòng nhập tài khoản";
        if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    
        setErrors(newErrors);
    
        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await axios.post("http://localhost:5000/api/users/login", {
                    username,
                    password,
                });
    
                if (response.status === 200) {
                    console.log("Đăng nhập thành công!");
                    alert("Đăng nhập thành công!");
                    localStorage.setItem("authToken", response.data.token); 
    
                    navigate("/dashboard");
                }
            } catch (error) {
                console.error("Đăng nhập thất bại:", error.response);
                setLoginError(error.response.data.message); 
            }
        }
    };    

    return (
        <div className="login-container">
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
                    <div className="title-login">
                        <h2>Đăng nhập</h2>
                        <p>{greeting}</p>
                    </div>
                    <div className="login-form">
                        <div className="row">
                            <div className="row-3"></div>
                            <div className="row-6">
                                <div className="form-group">
                                    <label className="form-group-text">Tài khoản</label>
                                    <input
                                        type="text"
                                        className={`input-field ${errors.username ? "error" : ""}`}
                                        placeholder="Nhập số điện thoại/email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {errors.username && <p className="error-text">{errors.username}</p>}
                                </div>

                                <div className="form-group">
                                    <div className="form-group-pw">
                                        <label className="form-group-text">Mật khẩu</label>
                                        <div className="link-container">
                                            <a href="/forgot-password">Quên mật khẩu?</a>
                                        </div>
                                    </div>

                                    <div className="password-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`input-field ${errors.password ? "error" : ""}`}
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <FontAwesomeIcon 
                                            icon={showPassword ? faEyeSlash : faEye} 
                                            className="toggle-password-icon"
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </div>
                                    {errors.password && <p className="error-text">{errors.password}</p>}
                                </div>

                                <button className="button" onClick={handleLogin}>
                                    Đăng nhập
                                </button>
                                {loginError && <p className="error-text login-error">{loginError}</p>}
                                <div className="login-row3">
                                    <span className="text-normal">Chưa có tài khoản? </span>
                                    <Link to="/register" className="text-highlight">
                                        Đăng ký ngay
                                    </Link>
                                </div>
                            </div>
                            <div className="row-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
