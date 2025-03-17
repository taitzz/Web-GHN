import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/RegisterUser.css";
import ghn from "../../assets/images/ghn.png";
import bg from "../../assets/images/bg.png";
import axios from "axios";

export default function RegisterUser() {
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";  // Kiểm tra nếu không nhập tên
    } else if (/[^a-zA-Zàáạảãăắằẳẵâấầẩẫđèéẹẻẽêếềểễêịỉĩịòóọỏõôốồổỗơớờởỡơùúụủũưứừửữưỳýỵỷỹ\s]/i.test(formData.fullName)) {
      // Kiểm tra tên có ký tự không hợp lệ (chỉ cho phép chữ cái có dấu và khoảng trắng)
      newErrors.fullName = "Họ và tên không hợp lệ, chỉ chứa chữ cái có dấu và khoảng trắng";
    } else if (formData.fullName.split(' ').length < 2) {
      // Kiểm tra nếu họ và tên không đầy đủ (ít nhất 2 từ)
      newErrors.fullName = "Vui lòng nhập đầy đủ họ và tên";
    }
    // Kiểm tra tên tài khoản
    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên tài khoản";
    } else if (formData.username.length < 5) {
      newErrors.username = "Tên tài khoản phải có ít nhất 5 ký tự";
    } else if (/[^a-zA-Z0-9]/.test(formData.username)) {  // Kiểm tra không chứa dấu
      newErrors.username = "Tên tài khoản không được chứa dấu hoặc ký tự đặc biệt";
    }
    if (!formData.birthDate) newErrors.birthDate = "Vui lòng chọn ngày sinh";

    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên tài khoản";
    // Kiểm tra địa chỉ
    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";  // Kiểm tra nếu địa chỉ trống
  } else if (formData.address.length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";  // Kiểm tra độ dài địa chỉ
  } else if (!(/[^a-zA-Z0-9\s,.-àáạảãăắằẳẵâấầẩẫđèéẹẻẽêếềểễêịỉĩịòóọỏõôốồổỗơớờởỡơùúụủũưứừửữưỳýỵỷỹ]/i).test(formData.address)) { 
      // Kiểm tra nếu có ký tự đặc biệt không hợp lệ
      newErrors.address = "Địa chỉ không hợp lệ. Vui lòng nhập địa chỉ hợp lệ";
  }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Ngày không hợp lệ";  // Nếu không hợp lệ, trả về thông báo lỗi

    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleRegister = async () => {
    try {
      // Kiểm tra tên tài khoản đã tồn tại trong cơ sở dữ liệu
      const usernameResponse = await axios.post("http://localhost:5000/api/users/check-username", { username: formData.username });
      if (usernameResponse.data.exists) {
        setErrors({ ...errors, username: "Tên tài khoản đã tồn tại" });
        return;
      }
      if (!validateForm()) return;
      const response = await axios.post("http://localhost:5000/api/users/register", formData);
      console.log("Đăng ký thành công:", response.data);

      // Hiển thị thông báo thành công
      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");

      // Điều hướng đến trang đăng nhập
      navigate("/");
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại");
    }
  };

  return (
    <div className="register-container">
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

      <div className="right">
        <div className="form-container">
          <div className="title-login">
            <h2>TẠO TÀI KHOẢN GHN</h2>
            <p>GHN luôn đồng hành cùng bạn.</p>
          </div>
          <div className="register-form">
            <div className="row">
              <div className="row-6">
                <div className="row-6-left">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`input-field ${errors.fullName ? "error" : ""}`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                  </div>

                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={`input-field ${errors.birthDate ? "error" : ""}`}
                    />
                    {errors.birthDate && <p className="error-text">{errors.birthDate}</p>}
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
                      placeholder="Mật khẩu phải tối thiểu 8 ký tự (Bao gồm chữ hoa , thường và số)"
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
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`input-field ${errors.address ? "error" : ""}`}
                      placeholder="Nhập địa chỉ"
                    />
                    {errors.address && <p className="error-text">{errors.address}</p>}
                  </div>

                  <div className="form-group">
                    <label>Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field ${errors.confirmPassword ? "error" : ""}`}
                      placeholder="Mật khẩu phải tối thiểu 8 ký tự (Bao gồm chữ hoa , thường và số)"
                    />
                    {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button className="button" onClick={handleRegister}>
              Đăng ký
            </button>
            <div className="login-row3">
              <label>Đã có tài khoản?</label>
              <Link to="/" className="register-link">
                <span>Đăng nhập ngay</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
