import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import ghn from "../../assets/images/ghn.png";
import bg from "../../assets/images/bg.png";

export default function Register() {
  const [formData, setFormData] = useState({
    purpose: "",
    scale: "",
    phone: "",
    password: "",
    username: "",
    bank: "",
    email: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== "agreeTerms") {
        newErrors[key] = "Vui lòng nhập thông tin";
      }
    });

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Đăng ký thành công!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="register-container">
      {/* Bên trái: Logo và slogan */}
      <div className="left">
        <div className="background-left">
          <img src={bg} className="normal" alt="background" />
          <div className="content-note">
            <div className="logo">
              <img src={ghn} className="logo-ghn" alt="ghn" />
            </div>
            <div className="left-row2">
              THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG
              <br />
              TỐT NHẤT TỪ TRƯỚC ĐẾN NAY
            </div>
            <div className="left-row3">Nhanh hơn, rẻ hơn và thông minh hơn</div>
          </div>
          <div className="backdrop"></div>
        </div>
      </div>

      {/* Bên phải: Form đăng ký */}
      <div className="right">
        <div className="form-container">
          <div className="title-login">
            <h2>TẠO TÀI KHOẢN GHN</h2>
            <p>GHN luôn đồng hành cùng bạn.</p>
          </div>
          <div className="register-form">
            <div className="row">              
              <div className="row-6">
                {/* Cột 1 */}
                <div className="row-6-left">
                  <div className="form-group">
                    <label>Mục đích sử dụng</label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={`input-field ${errors.purpose ? "error" : ""}`}
                      placeholder="Vui lòng chọn mục đích sử dụng"
                    />
                    {errors.purpose && <p className="error-text">{errors.purpose}</p>}
                  </div>

                  <div className="form-group">
                    <label>Quy mô vận chuyển</label>
                    <input
                      type="text"
                      name="scale"
                      value={formData.scale}
                      onChange={handleChange}
                      className={`input-field ${errors.scale ? "error" : ""}`}
                      placeholder="Chọn qui mô vận chuyển"
                    />
                    {errors.scale && <p className="error-text">{errors.scale}</p>}
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field ${errors.phone ? "error" : ""}`}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field ${errors.password ? "error" : ""}`}
                      placeholder="Mật khẩu phải tối thiểu 8 ký tự( Bao gồm chữ hoa , chữ thường , số , ký tự đặc biệt. Không chứa tên , số điện thoại hoặc 'GHN')"
                    />
                    {errors.password && <p className="error-text">{errors.password}</p>}
                  </div>
                </div>
                <div className="row-6-right">
                  <div className="form-group">
                    <label>Tên tài khoản</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`input-field ${errors.username ? "error" : ""}`}
                      placeholder="Tên tài khoản"
                    />
                    {errors.username && <p className="error-text">{errors.username}</p>}
                  </div>

                  <div className="form-group">
                    <label>Ngân hàng</label>
                    <input
                      type="text"
                      name="bank"
                      value={formData.bank}
                      onChange={handleChange}
                      className={`input-field ${errors.bank ? "error" : ""}`}
                      placeholder="Tên ngân hàng"
                    />
                    {errors.bank && <p className="error-text">{errors.bank}</p>}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field ${errors.email ? "error" : ""}`}
                      placeholder="Nhập Email"
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label>Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field ${errors.confirmPassword ? "error" : ""}`}
                      placeholder="Mật khẩu phải tối thiểu 8 ký tự( Bao gồm chữ hoa , chữ thường , số , ký tự đặc biệt. Không chứa tên , số điện thoại hoặc 'GHN')"
                    />
                    {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>             
            </div>
            <div className="checkbox">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label>
                Tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách bảo mật, bảo vệ dữ liệu
                cá nhân của Giao Hàng Nhanh.
              </label>
              {errors.agreeTerms && <p className="error-text">{errors.agreeTerms}</p>}
            </div>

            <button className="button" onClick={handleRegister} disabled={!formData.agreeTerms}>
              Đăng ký
            </button>
            <div className="login-row3">
              <label>Đã có tài khoản?</label>
              <Link to="/" className="register-link">
                <span>Đăng nhập</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
