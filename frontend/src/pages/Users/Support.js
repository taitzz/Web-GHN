import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaRegClock } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../assets/styles/Support.css';
import prohibitedGoodsImage from '../../assets/images/danh-muc-hang-ghn-khong-nhan-van-chuyen.webp';

const Support = () => {
    return (
        <div className="support-container">
            {/* Bao gồm phần Header */}
            <Header />

            <div className="support-content">
                <h1 className="support-title">DỊCH VỤ HỖ TRỢ</h1>

                {/* Phần Giới thiệu */}
                <section className="intro">
                    <h2>Giới thiệu dịch vụ giao hàng nhanh</h2>
                    <p>Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng, an toàn và hiệu quả. Chúng tôi cam kết giao hàng đúng hẹn với chất lượng hàng hóa luôn được đảm bảo. Tìm hiểu thêm về các dịch vụ của chúng tôi ngay dưới đây!</p>
                </section>

                {/* Phần Hàng Hoá Cấm Nhận Chuyển */}
                <section className="prohibited-goods">
                    <h2>HÀNG HOÁ GHN KHÔNG NHẬN CHUYỂN</h2>
                    <div className="prohibited-image">
                        <img src={prohibitedGoodsImage} alt="Hàng hóa cấm vận chuyển" />
                    </div>
                    <p className="prohibited-note">Dưới đây là danh sách các loại hàng hóa mà chúng tôi không nhận chuyển. Vui lòng tham khảo để tránh vi phạm quy định của dịch vụ.</p>
                    <ul className="prohibited-list">
                        <li>Vũ khí, đạn dược, vật liệu nổ</li>
                        <li>Sản phẩm dễ cháy nổ (gas, dầu, xăng, thuốc súng)</li>
                        <li>Hàng hóa nguy hiểm, chất độc hại, hóa chất độc</li>
                        <li>Động vật hoang dã, các loài động vật bị cấm vận chuyển</li>
                        <li>Sản phẩm thực phẩm dễ hư hỏng mà không có chế độ bảo quản thích hợp</li>
                        <li>Hàng giả, hàng nhái, hàng xâm phạm bản quyền</li>
                        <li>Thuốc lá, rượu, các sản phẩm bị kiểm soát</li>
                        <li>Sản phẩm dễ gây ô nhiễm hoặc rò rỉ ra ngoài</li>
                    </ul>
                </section>

                {/* Phần FAQ */}
                <section className="faq">
                    <h2>Câu Hỏi Thường Gặp (FAQ)</h2>
                    <ul>
                        <li><strong>Thời gian giao hàng nhanh nhất là bao lâu?</strong> - Chúng tôi cung cấp dịch vụ giao hàng trong vòng 1-2 ngày tùy vào địa điểm giao nhận.</li>
                        <li><strong>Tôi có thể theo dõi đơn hàng như thế nào?</strong> - Bạn có thể theo dõi đơn hàng qua hệ thống của chúng tôi hoặc nhận thông báo qua email/SMS khi đơn hàng được giao.</li>
                        <li><strong>Chi phí vận chuyển được tính như thế nào?</strong> - Chi phí vận chuyển phụ thuộc vào trọng lượng và kích thước của đơn hàng, cùng với khoảng cách từ điểm gửi đến điểm nhận.</li>
                        <li><strong>Làm sao để thay đổi thông tin đơn hàng?</strong> - Nếu bạn cần thay đổi thông tin, vui lòng liên hệ với chúng tôi ngay lập tức qua số điện thoại hỗ trợ hoặc email.</li>
                    </ul>
                </section>

                {/* Phần Hướng dẫn sử dụng dịch vụ */}
                <section className="guides">
                    <h2>Hướng dẫn sử dụng dịch vụ</h2>
                    <p>Để sử dụng dịch vụ giao hàng của chúng tôi, bạn cần đăng ký tài khoản và tạo đơn hàng. Sau khi đơn hàng được tạo, bạn có thể theo dõi trạng thái đơn hàng ngay trên hệ thống của chúng tôi. Chúng tôi sẽ gửi thông báo đến bạn qua email/SMS khi đơn hàng được giao.</p>
                </section>

                {/* Chính sách bảo mật */}
                <section className="policies">
                    <h2>Chính sách bảo mật và quyền lợi khách hàng</h2>
                    <p>
                        1. CHÍNH SÁCH BẢO MẬT VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN này (“Chính Sách”) được cập nhật nhằm tuân thủ Nghị Định 13/2023/NĐ-CP và các quy định pháp luật khác có liên quan. Chính Sách mô tả cách thức Công Ty Cổ Phần Dịch Vụ Giao Hàng Nhanh (“GHN” hay “chúng tôi”) sử dụng Dữ Liệu Cá Nhân (được định nghĩa sau đây) của người sử dụng Các Dịch Vụ hoặc của người truy cập vào Các Nền Tảng của chúng tôi, bao gồm nhưng không giới hạn:
                    </p>
                    <ul>
                        <li>(a) Người gửi hàng: Bao gồm cả nhân viên của người gửi hoặc cá nhân gửi một lô hàng;</li>
                        <li>(b) Người nhận lô hàng: Bất kỳ cá nhân nào nhận lô hàng;</li>
                        <li>(c) Những người thể hiện sự quan tâm đến chúng tôi và Các Dịch Vụ của chúng tôi;</li>
                        <li>(d) Đối tác kinh doanh: Đối tác kinh doanh, bao gồm cả nhân viên của họ;</li>
                        <li>(e) Ứng viên tuyển dụng: Những cá nhân nộp đơn xin việc tới chúng tôi.</li>
                    </ul>
                    <p>(tất cả các đối tượng trên được gọi là “bạn”)</p>
                    <p>
                        2. Thông qua quá trình bạn sử dụng Các Nền Tảng và/hoặc Các Dịch Vụ, chúng tôi sẽ thu thập, sử dụng, tiết lộ, lưu trữ và/hoặc xử lý dữ liệu, bao gồm cả Dữ Liệu Cá Nhân của bạn.
                    </p>
                    <p>
                        Trong Chính Sách này, “(Các) Nền Tảng” có nghĩa là tất cả các ứng dụng và website của GHN hay bên thứ ba có tích hợp các ứng dụng và website của GHN (bao gồm phiên bản website và phiên bản điện thoại), và “(Các) Dịch Vụ” có nghĩa là tất cả các sản phẩm, thông tin, chức năng và dịch vụ do GHN cung cấp tại từng thời điểm trên Các Nền Tảng.
                    </p>
                </section>
                {/* Phần Liên hệ với chúng tôi */}
                <section className="contact">
                    <h2>Liên hệ với chúng tôi</h2>
                    <div className="contact-info">
                        <div className="contact-item">
                            <FaPhoneAlt className="contact-icon" />
                            <p className="contact-text">Số điện thoại hỗ trợ: <a href="tel:+19001234">1900-1234</a></p>
                        </div>
                        <div className="contact-item">
                            <FaEnvelope className="contact-icon" />
                            <p className="contact-text">Email hỗ trợ: <a href="mailto:support@ghn.com">support@ghn.com</a></p>
                        </div>
                        <div className="contact-item">
                            <FaRegClock className="contact-icon" />
                            <p className="contact-text">Giờ làm việc: Thứ 2 - Thứ 6, 8:00 AM - 6:00 PM</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bao gồm phần Footer */}
            <Footer />
        </div>
    );
};

export default Support;
