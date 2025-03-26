import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import ghn from '../../assets/images/ghn.png';
import bg from '../../assets/images/bg.png';
import axios from 'axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 11) return 'Chào ngày mới! Cùng chốt nhiều đơn hôm nay nhé.';
            else if (hour >= 19 && hour <= 23) return 'Buổi tối an lành bên gia đình bạn nhé! Gác công việc lại nào.';
            else return 'Chúc bạn một ngày tốt lành!';
        };
        setGreeting(getGreeting());
    }, []);

    const handleLogin = async () => {
        let newErrors = {};
        setLoginError('');
        setLoading(true);

        if (!username.trim()) newErrors.username = 'Vui lòng nhập tài khoản';
        if (!password.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                console.log('Sending request to:', 'http://localhost:5000/api/admin/login');
                console.log('Request body:', { username, password });

                const response = await axios.post('http://localhost:5000/api/admin/login', { username, password }, {
                    timeout: 5000,
                });

                console.log('Response:', response.data);

                if (response.status === 200 && response.data.token) {
                    const { token, user } = response.data;
                    localStorage.setItem('adminToken', token);
                    console.log('✅ Token saved:', token);
                    alert('🎉 Đăng nhập thành công!');
                    navigate('/dashboard', { replace: true });
                } else {
                    setLoginError('Không có token trong phản hồi!');
                    console.error('No token in response:', response.data);
                }
            } catch (error) {
                console.error('❌ Login error:', error.message, error.response?.data);
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 401) {
                        setLoginError('⚠️ ' + (error.response.data.message || 'Thông tin đăng nhập không hợp lệ!'));
                    } else {
                        setLoginError(`❌ Lỗi server: ${error.response.status}`);
                    }
                } else if (error.request) {
                    setLoginError('❌ Không kết nối được đến server, kiểm tra backend!');
                } else {
                    setLoginError('❌ Lỗi không xác định: ' + error.message);
                }
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="left">
                <div className="background-left">
                    <img src={bg} className="normal" alt="background" />
                    <div className="content-note">
                        <div className="logo"><img src={ghn} className="logo-ghn" alt="ghn" /></div>
                        <div className="left-row2">THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG<br />TỐT NHẤT TỪ TRƯỚC ĐẾN NAY</div>
                        <div className="left-row3">Nhanh hơn, rẻ hơn và thông minh hơn</div>
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
                                        className={`input-field ${errors.username ? 'error' : ''}`}
                                        placeholder="Nhập username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {errors.username && <p className="error-text">{errors.username}</p>}
                                </div>
                                <div className="form-group">
                                    <div className="form-group-pw">
                                        <label className="form-group-text">Mật khẩu</label>
                                    </div>
                                    <div className="password-container">
                                        <input
                                            type="password"
                                            className={`input-field ${errors.password ? 'error' : ''}`}
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    {errors.password && <p className="error-text">{errors.password}</p>}
                                </div>
                                <button className="button" onClick={handleLogin} disabled={loading}>
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                                {loginError && <p className="error-text login-error">{loginError}</p>}
                                <div className="login-row3">
                                    <span className="text-normal">Nhân sự GHN bấm </span>
                                    <Link to="/shipper-login" className="text-highlight">vào đây</Link>
                                    <span className="text-normal"> để đăng nhập</span>
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