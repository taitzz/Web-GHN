import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../assets/styles/Services.css";
import bg from "../../assets/images/banner-sv-kho.jpg";
import icon1 from "../../assets/images/kho_advantages1.webp";
import icon2 from "../../assets/images/kho_advantages2.webp";
import icon3 from "../../assets/images/kho_advantages3.webp";

import iconLogin from "../../assets/images/cp_process1_thumb.webp";
import iconOrder from "../../assets/images/cp_process2_thumb.webp";
import iconPickup from "../../assets/images/cp_process3_thumb.webp";
import iconTrack from "../../assets/images/cp_process4_thumb.webp";
import iconDelivery from "../../assets/images/cp_process5_thumb.webp";
import iconCOD from "../../assets/images/cp_process6_thumb.webp";
const Services = () => {
    const [hovered, setHovered] = useState(null);

    const handleHover = (index) => setHovered(index);
    const handleLeave = () => setHovered(null);

    return (
        <div className="services-container">
            {/* Header */}
            <Header />

            {/* Ảnh đại diện */}
            <div className="service-banner">
                <img src={bg} alt="Dịch vụ GHN" className="service-banner-image" />
            </div>

            {/* 3 đoạn văn bản xếp hàng ngang */}
            <div className="service-texts">
                {/* Công nghệ quản lý kho vận hiện đại */}
                <div className="service-item">
                    <div className="service-icon">
                        <img src={icon1} alt="Công nghệ quản lý kho vận hiện đại" />
                    </div>
                    <h2>CÔNG NGHỆ QUẢN LÝ KHO VẬN HIỆN ĐẠI</h2>
                    <p>
                        Hệ thống quản lý thông minh - trực tuyến 24/7 giúp khách hàng dễ dàng kiểm tra tình trạng hàng hóa, giám sát quá trình xử lý nhanh chóng (lấy hàng, đóng gói, bàn giao đơn vị vận chuyển), theo dõi hành trình giao hàng, truy xuất lịch sử giao dịch để quản lý nhập – xuất – tồn kho, hỗ trợ tích hợp API với hệ thống quản lý sẵn có của khách hàng.
                    </p>
                </div>

                {/* Xử lý yêu cầu bán hàng đa kênh */}
                <div className="service-item">
                    <div className="service-icon">
                        <img src={icon2} alt="Xử lý yêu cầu bán hàng đa kênh" />
                    </div>
                    <h2>XỬ LÝ YÊU CẦU BÁN HÀNG ĐA KÊNH</h2>
                    <p>
                        Sở hữu diện tích kho bãi hơn 100.000m2 với cơ sở hạ tầng hiện đại kết hợp cùng mạng lưới 1000 xe tải phủ sóng khắp 63 tỉnh thành, hệ thống quy trình vận hành chuyên nghiệp cho từng đối tượng khách hàng khác nhau, sẵn sàng đáp ứng kịp thời nhu cầu về phát sinh tăng đột biến sản lượng hàng hóa trong mùa cao điểm.
                    </p>
                </div>

                {/* Giải pháp kho vận toàn diện và tối ưu */}
                <div className="service-item">
                    <div className="service-icon">
                        <img src={icon3} alt="Giải pháp kho vận toàn diện và tối ưu" />
                    </div>
                    <h2>GIẢI PHÁP KHO VẬN TOÀN DIỆN VÀ TỐI ƯU</h2>
                    <p>
                        Với đội ngũ quản lý trên 15 năm kinh nghiệm, đội ngũ hơn 10.000 nhân viên, tài xế chuyên nghiệp, GHN mang đến các giải pháp kho vận trọn gói giúp khách hàng giải quyết các vấn đề kho bãi, vận chuyển hàng hóa, tăng trưởng kinh doanh nhanh chóng, tiết kiệm chi phí đầu tư vào cơ sở hạ tầng, xóa bỏ nỗi lo về năng lực vận hành kho bãi.
                    </p>
                </div>
            </div>

            <div className="service-info">
                <h2>THÔNG TIN DỊCH VỤ</h2>
                <p>GHN Fulfillment cung cấp đa dạng các loại dịch vụ kho vận giúp khách hàng có nhiều giải pháp và lựa chọn phù hợp</p>

                <div className="service-options">
                    <div className="service-option">
                        <h3>1.Nhập hàng và lưu trữ, quản lý nhập-xuất-tồn kho</h3>
                    </div>
                    <div className="service-option">
                        <h3>2.Xử lý đơn hàng theo yêu cầu: lấy hàng, đóng gói, bàn giao đơn vị vận chuyển</h3>
                    </div>
                    <div className="service-option">
                        <h3>3.Giao hàng từ kho đến siêu thị, chuỗi cửa hàng, nhà bán lẻ</h3>
                    </div>
                    <div className="service-option">
                        <h3>4.Giao hàng từ kho đến người mua hàng online và thu hộ COD</h3>
                    </div>
                    <div className="service-option">
                        <h3>5.Quản lý đổi trả hàng</h3>
                    </div>
                </div>
            </div>

            <section className="process">
                <h2>QUY TRÌNH GIAO NHẬN</h2>
                <div className="process-bar">
                    {/* Quy trình 1: Đăng nhập */}
                    <div className="process-step" onMouseEnter={() => handleHover(1)} onMouseLeave={handleLeave}>
                        <img src={iconLogin} alt="Đăng nhập" className={`process-icon ${hovered === 1 ? 'rotate' : ''}`} />
                        <h3>Đăng nhập / Đăng ký</h3>
                        <p>Đăng nhập hoặc tạo tài khoản mới trên app GHN hoặc website khachhang.ghn.vn để bắt đầu.</p>
                    </div>

                    {/* Quy trình 2: Tạo đơn hàng */}
                    <div className="process-step" onMouseEnter={() => handleHover(2)} onMouseLeave={handleLeave}>
                        <img src={iconOrder} alt="Tạo đơn hàng" className={`process-icon ${hovered === 2 ? 'rotate' : ''}`} />
                        <h3>Tạo đơn hàng</h3>
                        <p>Tạo đơn hàng trên app GHN Express / website khachhang.ghn.vn, hoặc ghé hệ thống 2000 điểm gửi hàng GHN toàn quốc.</p>
                    </div>

                    {/* Quy trình 3: Lấy hàng */}
                    <div className="process-step" onMouseEnter={() => handleHover(3)} onMouseLeave={handleLeave}>
                        <img src={iconPickup} alt="Lấy hàng" className={`process-icon ${hovered === 3 ? 'rotate' : ''}`} />
                        <h3>Lấy hàng</h3>
                        <p>Bàn giao hàng cần gửi cho tài xế GHN tại địa chỉ người gửi cung cấp.</p>
                    </div>

                    {/* Quy trình 4: Theo dõi tình trạng đơn hàng */}
                    <div className="process-step" onMouseEnter={() => handleHover(4)} onMouseLeave={handleLeave}>
                        <img src={iconTrack} alt="Theo dõi tình trạng đơn hàng" className={`process-icon ${hovered === 4 ? 'rotate' : ''}`} />
                        <h3>Theo dõi tình trạng đơn hàng</h3>
                        <p>Người gửi quản lý và theo dõi tình trạng đơn hàng thông qua app GHN hoặc website khachhang.ghn.vn.</p>
                    </div>

                    {/* Quy trình 5: Giao hàng */}
                    <div className="process-step" onMouseEnter={() => handleHover(5)} onMouseLeave={handleLeave}>
                        <img src={iconDelivery} alt="Giao hàng" className={`process-icon ${hovered === 5 ? 'rotate' : ''}`} />
                        <h3>Giao hàng</h3>
                        <p>GHN giao hàng cho người nhận, thu tiền hộ (COD) theo yêu cầu của người gửi.</p>
                    </div>

                    {/* Quy trình 6: Nhận tiền thu hộ */}
                    <div className="process-step" onMouseEnter={() => handleHover(6)} onMouseLeave={handleLeave}>
                        <img src={iconCOD} alt="Nhận tiền thu hộ" className={`process-icon ${hovered === 6 ? 'rotate' : ''}`} />
                        <h3>Nhận tiền thu hộ</h3>
                        <p>GHN hoàn trả tiền thu hộ cho người gửi thông qua tài khoản ngân hàng xuyên suốt các ngày trong tuần.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Services;
