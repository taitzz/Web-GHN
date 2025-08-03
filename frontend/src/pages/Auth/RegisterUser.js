import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../assets/styles/RegisterUser.module.css";
import ghn from "../../assets/images/ghn.png";
import bg from "../../assets/images/bg.png";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

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
    // (Giữ nguyên logic validateForm như code gốc)
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else {
      const cleanedName = formData.fullName.trim().replace(/\s+/g, ' ');
      const nameParts = cleanedName.split(' ');
      const vietnameseNameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
      if (!vietnameseNameRegex.test(cleanedName)) {
        newErrors.fullName = "Họ và tên không hợp lệ, chỉ chứa chữ cái tiếng Việt và khoảng trắng";
      } else if (nameParts.length < 2) {
        newErrors.fullName = "Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ)";
      } else if (nameParts.some(part => part.length < 2)) {
        newErrors.fullName = "Mỗi phần của họ và tên phải có ít nhất 2 ký tự (ví dụ: Nguyễn Văn An)";
      } else if (cleanedName.length < 5 || cleanedName.length > 50) {
        newErrors.fullName = "Họ và tên phải từ 5 đến 50 ký tự";
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên tài khoản";
    } else if (formData.username.length < 5) {
      newErrors.username = "Tên tài khoản phải có ít nhất 5 ký tự";
    } else if (/[^a-zA-Z0-9]/.test(formData.username)) {
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

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    } else if (formData.address.length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    } else if (!(/[^a-zA-Z0-9\s,.-àáạảãăắằẳẵâấầẩẫđèéẹẻẽêếềểễêịỉĩịòóọỏõôốồổỗơớờởỡơùúụủũưứừửữưỳýỵỷỹ]/i).test(formData.address)) {
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

  const handleRegister = async () => {
    try {
      const usernameResponse = await axios.post("http://localhost:5000/api/users/check-username", { username: formData.username });
      if (usernameResponse.data.exists) {
        setErrors({ ...errors, username: "Tên tài khoản đã tồn tại" });
        return;
      }

      if (!validateForm()) {
        console.log("Form không hợp lệ, không gửi request:", errors);
        return;
      }

      const response = await axios.post("http://localhost:5000/api/users/register", formData);
      console.log("Đăng ký thành công:", response.data);

      // Hiển thị thông báo thành công với SweetAlert2
      Swal.fire({
        title: 'Đăng ký thành công!',
        text: 'Bạn có thể đăng nhập ngay.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      navigate("/login");
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      // Hiển thị thông báo lỗi với SweetAlert2
      Swal.fire({
        title: 'Đăng ký thất bại!',
        text: error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại",
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.left}>
        <div className={styles.backgroundLeft}>
          <img src={bg} className={styles.normal} alt="background" />
          <div className={styles.contentNote}>
            <div className={styles.logo}>
              <img src={ghn} className={styles.logoGhn} alt="ghn" />
            </div>
            <div className={styles.leftRow2}>
              THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG
              <br />
              TỐT NHẤT TỪ TRƯỚC ĐẾN NAY
            </div>
            <div className={styles.leftRow3}>Nhanh hơn, rẻ hơn và thông minh hơn</div>
          </div>
          <div className={styles.backdrop}></div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formContainer}>
          <div className={styles.titleLogin}>
            <h2>TẠO TÀI KHOẢN GHN</h2>
            <p>GHN luôn đồng hành cùng bạn.</p>
          </div>
          <div className={styles.registerForm}>
            <div className={styles.row6}>
              <div className={styles.formGroup}>
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.fullName ? styles.error : ""}`}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Tên tài khoản</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.username ? styles.error : ""}`}
                  placeholder="Tên tài khoản"
                />
                {errors.username && <p className={styles.errorText}>{errors.username}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.birthDate ? styles.error : ""}`}
                />
                {errors.birthDate && <p className={styles.errorText}>{errors.birthDate}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.email ? styles.error : ""}`}
                  placeholder="Nhập Email"
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.phone ? styles.error : ""}`}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.address ? styles.error : ""}`}
                  placeholder="Nhập địa chỉ"
                />
                {errors.address && <p className={styles.errorText}>{errors.address}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.password ? styles.error : ""}`}
                  placeholder="Mật khẩu phải tối thiểu 8 ký tự (Bao gồm chữ hoa, thường và số)"
                />
                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Nhập lại mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.inputField} ${errors.confirmPassword ? styles.error : ""}`}
                  placeholder="Mật khẩu phải tối thiểu 8 ký tự (Bao gồm chữ hoa, thường và số)"
                />
                {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
              </div>
            </div>

            <button className={styles.button} onClick={handleRegister}>
              Đăng ký
            </button>
            <div className={styles.loginRow3}>
              <label>Đã có tài khoản?</label>
              <Link to="/login" className={styles.registerLink}>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
