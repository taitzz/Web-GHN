import { useState } from "react";
import { Link } from "react-router-dom";
import ghnLogo from "../../assets/images/ghn.png";
import "./ShipperRegister.css"; // Import file CSS

export default function ShipperRegister() {
    const [formData, setFormData] = useState({
        fullName: "",
        birthDate: "",
        permanentAddress: "",
        currentAddress: "",
        phoneNumber: "",
        email: "",
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

    const handleSubmit = (e) => {
        e.preventDefault();
        let newError = {};

        if (!formData.fullName) newError.fullName = "Vui lòng nhập họ và tên";
        if (!formData.birthDate) newError.birthDate = "Vui lòng chọn ngày sinh";
        if (!formData.permanentAddress) newError.permanentAddress = "Vui lòng nhập địa chỉ thường trú";
        if (!formData.currentAddress) newError.currentAddress = "Vui lòng nhập địa chỉ hiện tại";
        if (!formData.phoneNumber) newError.phoneNumber = "Vui lòng nhập số điện thoại";
        if (!formData.email) newError.email = "Vui lòng nhập email";

        setError(newError);

        if (Object.keys(newError).length === 0) {
            console.log("Thông tin đăng ký shipper:", formData);
            alert("Đăng ký thành công! Thông tin của bạn sẽ được gửi đến admin để kiểm duyệt.");
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
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Nhập họ và tên"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        {error.fullName && <p className="error-text">{error.fullName}</p>}
                    </div>

                    <div className="input-group">
                        <label>Ngày sinh</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                        />
                        {error.birthDate && <p className="error-text">{error.birthDate}</p>}
                    </div>

                    <div className="input-group">
                        <label>Địa chỉ thường trú</label>
                        <input
                            type="text"
                            name="permanentAddress"
                            placeholder="Nhập địa chỉ thường trú"
                            value={formData.permanentAddress}
                            onChange={handleChange}
                        />
                        {error.permanentAddress && <p className="error-text">{error.permanentAddress}</p>}
                    </div>

                    <div className="input-group">
                        <label>Địa chỉ hiện tại</label>
                        <input
                            type="text"
                            name="currentAddress"
                            placeholder="Nhập địa chỉ hiện tại"
                            value={formData.currentAddress}
                            onChange={handleChange}
                        />
                        {error.currentAddress && <p className="error-text">{error.currentAddress}</p>}
                    </div>

                    <div className="input-group">
                        <label>Số điện thoại</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Nhập số điện thoại"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        {error.phoneNumber && <p className="error-text">{error.phoneNumber}</p>}
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Nhập email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {error.email && <p className="error-text">{error.email}</p>}
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="agreed"
                            checked={formData.agreed}
                            onChange={handleChange}
                        />
                        <label htmlFor="terms">
                            Tôi đồng ý với <Link to="/shipper-requirements" className="terms-link">yêu cầu</Link> của công ty đưa ra.
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={!formData.agreed}
                    >
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
