import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../assets/styles/LoginUser.module.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import bg from "../../assets/images/shipper_icon.jpg";
import axios from "axios";
import Swal from "sweetalert2"; 

export default function LoginUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState("");
    const [greeting, setGreeting] = useState("");
    const [loading, setLoading] = useState(false);
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
        setLoading(true);

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
                    const { token } = response.data;
                    localStorage.setItem("authToken", token);
                    
                    // Hiển thị thông báo thành công với SweetAlert2
                    Swal.fire({
                        title: 'Đăng nhập thành công!',
                        text: 'Chào mừng bạn đến với hệ thống.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });

                    navigate("/home");
                }
            } catch (error) {
                console.error("❌ Lỗi đăng nhập:", error.response ? error.response.data : error.message);

                // Hiển thị thông báo lỗi với SweetAlert2
                Swal.fire({
                    title: 'Đăng nhập thất bại!',
                    text: error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
                    icon: 'error',
                    confirmButtonText: 'OK',
                });

                if (error.response?.status === 400) {
                    if (error.response?.data?.message === "Tài khoản của bạn đã bị xóa.") {
                        setLoginError("⚠️ Tài khoản của bạn đã bị xóa.");
                    } else {
                        setLoginError("⚠️ " + error.response.data.message);
                    }
                } else {
                    setLoginError("❌ Đăng nhập thất bại, vui lòng thử lại!");
                }
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
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
                    <div className={styles.titleLogin}>
                        <h2>Đăng nhập</h2>
                        <p>{greeting}</p>
                    </div>
                    <div className={styles.loginForm}>
                        <div className={styles.row6}>
                            <div className={styles.formGroup}>
                                <label className={styles.formGroupText}>Tài khoản</label>
                                <input
                                    type="text"
                                    className={`${styles.inputField} ${errors.username ? styles.error : ""}`}
                                    placeholder="Nhập số điện thoại/email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.formGroupPw}>
                                    <label className={styles.formGroupText}>Mật khẩu</label>
                                    <div className={styles.linkContainer}>
                                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                                    </div>
                                </div>

                                <div className={styles.passwordContainer}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`${styles.inputField} ${errors.password ? styles.error : ""}`}
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye}
                                        className={styles.togglePasswordIcon}
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                            </div>

                            <button
                                className={styles.button}
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                            {loginError && <p className={`${styles.errorText} ${styles.loginError}`}>{loginError}</p>}
                            <div className={styles.loginRow3}>
                                <span className={styles.textNormal}>Chưa có tài khoản? </span>
                                <Link to="/register" className={styles.textHighlight}>
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
