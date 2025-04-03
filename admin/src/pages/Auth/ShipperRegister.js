import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import ghnLogo from "../../assets/images/ghn.png";
import styles from "./ShipperRegister.module.css";

const API_URL = "http://localhost:5000/api/shipper";

export default function ShipperRegister() {
    const [formData, setFormData] = useState(() => {
        const savedFormData = localStorage.getItem("shipperRegisterFormData");
        return savedFormData
            ? JSON.parse(savedFormData)
            : {
                fullName: "",
                birthDate: "",
                permanentAddress: "",
                currentAddress: "",
                phoneNumber: "",
                email: "",
                cccd: "",
                driverLicense: "",
                acceptRequirements: false,
                workAreas: "",
            };
    });

    const [provinces, setProvinces] = useState([]);
    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    // Lấy danh sách tỉnh/thành phố từ API
    const fetchProvinces = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://provinces.open-api.vn/api/p/");
            setProvinces(response.data);
            setFilteredProvinces(response.data);
        } catch (err) {
            setError((prev) => ({ ...prev, general: "Không thể tải danh sách tỉnh/thành phố!" }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredProvinces(
                provinces.filter((province) =>
                    province.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProvinces(provinces);
        }
    }, [searchQuery, provinces]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    const handleSelectProvince = (province) => {
        setFormData({
            ...formData,
            workAreas: province.name,
        });
        setSearchQuery("");
        setShowDropdown(false);
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await axios.post(`${API_URL}/check-email`, { email });
            return response.data.exists;
        } catch (err) {
            console.error("❌ Lỗi khi kiểm tra email:", err);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newError = {};

        const vietnameseNameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
        if (!formData.fullName) {
            newError.fullName = "Vui lòng nhập họ và tên";
        } else if (!vietnameseNameRegex.test(formData.fullName)) {
            newError.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng (tiếng Việt)";
        }

        if (!formData.birthDate) newError.birthDate = "Vui lòng chọn ngày sinh";
        if (!formData.permanentAddress) newError.permanentAddress = "Vui lòng nhập địa chỉ thường trú";
        if (!formData.currentAddress) newError.currentAddress = "Vui lòng nhập địa chỉ hiện tại";

        if (!formData.email) {
            newError.email = "Vui lòng nhập email";
        } else {
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                newError.email = "Email đã tồn tại, vui lòng sử dụng email khác";
            }
        }

        if (!formData.cccd) {
            newError.cccd = "Vui lòng nhập số CCCD";
        } else if (!/^\d{12}$/.test(formData.cccd)) {
            newError.cccd = "Số CCCD phải có đúng 12 chữ số";
        }

        if (!formData.phoneNumber) {
            newError.phoneNumber = "Vui lòng nhập số điện thoại";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newError.phoneNumber = "Số điện thoại phải chứa 10 chữ số";
        }

        if (!formData.driverLicense) {
            newError.driverLicense = "Vui lòng nhập số giấy phép lái xe";
        } else if (!/^\d{12}$/.test(formData.driverLicense)) {
            newError.driverLicense = "Số giấy phép lái xe phải có đúng 12 chữ số";
        }

        if (!formData.acceptRequirements) {
            newError.acceptRequirements = "Vui lòng chấp nhận yêu cầu của cửa hàng";
        }

        if (!formData.workAreas) {
            newError.workAreas = "Vui lòng chọn một cơ sở làm việc";
        }

        setError(newError);

        if (Object.keys(newError).length === 0) {
            try {
                const response = await axios.post(`${API_URL}/register`, formData);
                Swal.fire({
                    title: 'Thành công!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                localStorage.removeItem("shipperRegisterFormData");
                navigate("/shipper-login");
            } catch (err) {
                console.error("❌ Lỗi khi đăng ký shipper:", err.response?.data || err.message);
                if (err.response && err.response.data) {
                    const errorMessage = err.response.data.message;
                    if (errorMessage.includes("CCCD")) newError.cccd = errorMessage;
                    else if (errorMessage.includes("Email")) newError.email = errorMessage;
                    else if (errorMessage.includes("PhoneNumber")) newError.phoneNumber = errorMessage;
                    else newError.general = errorMessage;
                } else {
                    newError.general = "Không thể kết nối đến server.";
                }
                setError(newError);
                Swal.fire({
                    title: 'Lỗi!',
                    text: newError.general || 'Không thể kết nối đến server.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerBox}>
                <img src={ghnLogo} alt="GHN Logo" className={styles.ghnLogo} />
                <h2 className={styles.registerTitle}>Đăng ký Shipper</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        {/* Cột 1 */}
                        <div className={styles.inputGroup}>
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Nhập họ và tên"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            {error.fullName && <p className={styles.errorText}>{error.fullName}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                            />
                            {error.birthDate && <p className={styles.errorText}>{error.birthDate}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Nhập số điện thoại"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                            {error.phoneNumber && <p className={styles.errorText}>{error.phoneNumber}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Nhập email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {error.email && <p className={styles.errorText}>{error.email}</p>}
                        </div>

                        {/* Cột 2 */}
                        <div className={styles.inputGroup}>
                            <label>Địa chỉ thường trú</label>
                            <input
                                type="text"
                                name="permanentAddress"
                                placeholder="Nhập địa chỉ thường trú"
                                value={formData.permanentAddress}
                                onChange={handleChange}
                            />
                            {error.permanentAddress && (
                                <p className={styles.errorText}>{error.permanentAddress}</p>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Địa chỉ hiện tại</label>
                            <input
                                type="text"
                                name="currentAddress"
                                placeholder="Nhập địa chỉ hiện tại"
                                value={formData.currentAddress}
                                onChange={handleChange}
                            />
                            {error.currentAddress && (
                                <p className={styles.errorText}>{error.currentAddress}</p>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Số CCCD</label>
                            <input
                                type="text"
                                name="cccd"
                                placeholder="Nhập số CCCD (12 số)"
                                value={formData.cccd}
                                onChange={handleChange}
                            />
                            {error.cccd && <p className={styles.errorText}>{error.cccd}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Số giấy phép lái xe</label>
                            <input
                                type="text"
                                name="driverLicense"
                                placeholder="Nhập số giấy phép lái xe (12 số)"
                                value={formData.driverLicense}
                                onChange={handleChange}
                            />
                            {error.driverLicense && <p className={styles.errorText}>{error.driverLicense}</p>}
                        </div>
                    </div>

                    {/* Mục Cơ sở làm việc */}
                    <div className={styles.inputGroup}>
                        <label>Cơ sở làm việc<span className={styles.required}></span></label>
                        <div className={styles.workAreaContainer}>
                            <div
                                className={`${styles.selectBox} ${showDropdown ? styles.active : ''}`}
                                onClick={toggleDropdown}
                            >
                                <div className={styles.selectedValue}>
                                    {formData.workAreas || "Chọn tỉnh/thành phố"}
                                </div>
                                <span className={`${styles.arrow} ${showDropdown ? styles.arrowUp : ''}`}></span>
                            </div>

                            {showDropdown && (
                                <div className={styles.dropdownMenu}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Tìm kiếm tỉnh/thành phố..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                    <div className={styles.optionsContainer}>
                                        {loading ? (
                                            <div className={styles.loading}>Đang tải...</div>
                                        ) : filteredProvinces.length > 0 ? (
                                            filteredProvinces.map((province) => (
                                                <div
                                                    key={province.code}
                                                    className={`${styles.option} ${formData.workAreas === province.name ? styles.selected : ''
                                                        }`}
                                                    onClick={() => handleSelectProvince(province)}
                                                >
                                                    {province.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.noResults}>Không tìm thấy kết quả</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {error.workAreas && <p className={styles.errorText}>{error.workAreas}</p>}
                    </div>

                    {/* Ô tích "Chấp nhận yêu cầu của cửa hàng" với liên kết đến ShipperRequirement.js */}
                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            name="acceptRequirements"
                            checked={formData.acceptRequirements}
                            onChange={handleChange}
                        />
                        <label>
                            Tôi chấp nhận <Link to="/shipper-requirements">yêu cầu</Link> của cửa hàng
                        </label>
                        {error.acceptRequirements && <p className={styles.errorText}>{error.acceptRequirements}</p>}
                    </div>

                    {/* Nút Đăng ký */}
                    <button
                        type="submit"
                        className={styles.registerButton}
                        disabled={!formData.acceptRequirements || loading}
                    >
                        Đăng ký
                    </button>
                </form>

                <div className={styles.backToLogin}>
                    <Link to="/shipper-login">Quay lại trang đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}
