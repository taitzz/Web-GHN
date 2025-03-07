import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ghnLogo from "../../assets/images/ghn.png";
import "./ShipperRegister.css"; // Import file CSS

const API_URL = "http://localhost:5000/api/shipper"; // Đảm bảo API backend đúng

export default function ShipperRegister() {
    const [formData, setFormData] = useState({
        fullName: "",
        birthDate: "",
        permanentAddress: "",
        currentAddress: "",
        phoneNumber: "",
        email: "",
        cccd: "",
        driverLicense: "",
        agreed: false,
    });

    const [error, setError] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newError = {};
    
        if (!formData.fullName) newError.fullName = "Vui lòng nhập họ và tên";
        if (!formData.birthDate) newError.birthDate = "Vui lòng chọn ngày sinh";
        if (!formData.permanentAddress) newError.permanentAddress = "Vui lòng nhập địa chỉ thường trú";
        if (!formData.currentAddress) newError.currentAddress = "Vui lòng nhập địa chỉ hiện tại";
        if (!formData.phoneNumber) newError.phoneNumber = "Vui lòng nhập số điện thoại";
        if (!formData.email) newError.email = "Vui lòng nhập email";
        
        if (!formData.cccd) {
            newError.cccd = "Vui lòng nhập số CCCD";
        } else if (!/^\d{12}$/.test(formData.cccd)) {
            newError.cccd = "Số CCCD phải có đúng 12 chữ số";
        }
    
        if (!formData.driverLicense) {
            newError.driverLicense = "Vui lòng nhập số giấy phép lái xe";
        } else if (!/^\d{12}$/.test(formData.driverLicense)) {
            newError.driverLicense = "Số giấy phép lái xe phải có đúng 12 chữ số";
        }
    
        setError(newError);
    
        if (Object.keys(newError).length === 0) {
            try {
                const response = await axios.post(`${API_URL}/register`, formData);
                alert(response.data.message);
            } catch (err) {
                console.error("❌ Lỗi khi đăng ký shipper:", err);
    
                if (err.response && err.response.data) {
                    const errorMessage = err.response.data.message;
    
                    // Kiểm tra nếu lỗi liên quan đến UNIQUE KEY
                    if (errorMessage.includes("UNIQUE KEY constraint")) {
                        if (errorMessage.includes("cccd")) {
                            newError.cccd = "Số CCCD đã tồn tại.";
                        }
                        if (errorMessage.includes("email")) {
                            newError.email = "Email đã tồn tại.";
                        }
                        if (errorMessage.includes("phoneNumber")) {
                            newError.phoneNumber = "Số điện thoại đã tồn tại.";
                        }
                    }
                } else {
                    alert("Có lỗi xảy ra, vui lòng thử lại.");
                }
    
                setError(newError);
            }
        }
    };    

    return (
        <div className="register-container">
            <div className="register-box">
                <img src={ghnLogo} alt="GHN Logo" className="ghn-logo" />
                <h2 className="register-title">Đăng ký Shipper</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Họ và tên</label>
                        <input type="text" name="fullName" placeholder="Nhập họ và tên" value={formData.fullName} onChange={handleChange} />
                        {error.fullName && <p className="error-text">{error.fullName}</p>}
                    </div>

                    <div className="input-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                        {error.birthDate && <p className="error-text">{error.birthDate}</p>}
                    </div>

                    <div className="input-group">
                        <label>Địa chỉ thường trú</label>
                        <input type="text" name="permanentAddress" placeholder="Nhập địa chỉ thường trú" value={formData.permanentAddress} onChange={handleChange} />
                        {error.permanentAddress && <p className="error-text">{error.permanentAddress}</p>}
                    </div>

                    <div className="input-group">
                        <label>Địa chỉ hiện tại</label>
                        <input type="text" name="currentAddress" placeholder="Nhập địa chỉ hiện tại" value={formData.currentAddress} onChange={handleChange} />
                        {error.currentAddress && <p className="error-text">{error.currentAddress}</p>}
                    </div>

                    <div className="input-group">
                        <label>Số điện thoại</label>
                        <input type="tel" name="phoneNumber" placeholder="Nhập số điện thoại" value={formData.phoneNumber} onChange={handleChange} />
                        {error.phoneNumber && <p className="error-text">{error.phoneNumber}</p>}
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="Nhập email" value={formData.email} onChange={handleChange} />
                        {error.email && <p className="error-text">{error.email}</p>}
                    </div>

                    <div className="input-group">
                        <label>Số CCCD</label>
                        <input type="text" name="cccd" placeholder="Nhập số CCCD (12 số)" value={formData.cccd} onChange={handleChange} />
                        {error.cccd && <p className="error-text">{error.cccd}</p>}
                    </div>

                    <div className="input-group">
                        <label>Số giấy phép lái xe</label>
                        <input type="text" name="driverLicense" placeholder="Nhập số giấy phép lái xe (12 số)" value={formData.driverLicense} onChange={handleChange} />
                        {error.driverLicense && <p className="error-text">{error.driverLicense}</p>}
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} />
                        <label>
                            Tôi đồng ý với <Link to="/shipper-requirements" className="terms-link">yêu cầu</Link> của công ty.
                        </label>
                    </div>

                    <button type="submit" className="register-button" disabled={!formData.agreed}>
                        Đăng ký
                    </button>
                </form>

                <div className="back-to-login">
                    <Link to="/shipper-login">Quay lại trang đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}
