import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../assets/styles/About.css';

// Import ảnh từ thư mục assets/images
import adImage from '../../assets/images/img5.webp';
import storyImage from '../../assets/images/img6.webp';
import partner1Logo from '../../assets/images/logo_client1_compact.webp';
import partner2Logo from '../../assets/images/logo_client2_compact.webp';
import partner3Logo from '../../assets/images/logo_client3_compact.webp';
import partner4Logo from '../../assets/images/logo_client4_compact.webp';
import partner5Logo from '../../assets/images/logo_client5_compact.webp';
import partner6Logo from '../../assets/images/logo_client6_compact.webp';
import partner7Logo from '../../assets/images/logo_client7_compact.webp';
import partner8Logo from '../../assets/images/logo_client8_compact.webp';
import partner9Logo from '../../assets/images/logo_client9_compact.webp';
import partner10Logo from '../../assets/images/logo_client10_compact.webp';
import partner11Logo from '../../assets/images/logo_client11_compact.webp';
import partner12Logo from '../../assets/images/logo_client12_compact.webp';
import service1Image from '../../assets/images/img7.webp';
import service2Image from '../../assets/images/img8.jpg';
import service3Image from '../../assets/images/img9.jpg';

const About = () => {
  return (
    <div className="about-container">
      <Header />

      {/* Phần quảng cáo */}
      <div className="advertisement">
        <img src={adImage} alt="Advertisement" className="ad-image" />
      </div>

      {/* Câu chuyện GHN */}
      <div className="section">
        <h2 className="section-title">CÂU CHUYỆN GHN</h2>
        <h3 className="section-subtitle">10 năm đồng hành cùng E-Commerce Việt Nam</h3>
        <p className="section-text">
          GHN (Giao Hàng Nhanh) - Công ty giao nhận đầu tiên tại Việt Nam được thành lập năm 2012, với sứ mệnh phục vụ nhu cầu vận chuyển chuyên nghiệp của các đối tác Thương mại điện tử trên toàn quốc. GHN cam kết mang đến cho khách hàng những trải nghiệm dịch vụ giao nhận nhanh, an toàn, hiệu quả giúp người bán hàng bán được nhiều hơn, người mua hàng hài lòng hơn.
        </p>
        <div className="section-image">
          <img src={storyImage} alt="Câu chuyện GHN" className="story-image" />
        </div>
      </div>

      {/* Thành tích nổi bật */}
      <div className="section">
        <h2 className="section-title">THÀNH TÍCH NỔI BẬT</h2>
        <p className="section-text">
          GHN luôn dành trọn tâm huyết để mang đến những dịch vụ giao nhận xuất sắc nhất. Niềm đam mê chất lượng đã giúp GHN đạt được những thành tích đáng kinh ngạc trong suốt 10 năm qua:
        </p>
        <ul className="achievement-list">
          <li> Có thể lên đến 20.000.000 đơn hàng được giao thành công mỗi tháng</li>
          <li> Hơn 100.000 shop online và doanh nghiệp đã tin dùng</li>
          <li> Đối tác chiến lược của Tiki, Shopee, Lazada, Sendo</li>
          <li> Mạng lưới giao nhận phủ sóng 100% 63 tỉnh thành</li>
          <li> Đạt tốc độ xử lý 500.000 đơn hàng/ngày</li>
        </ul>
      </div>

      {/* Đối tác của GHN */}
      <div className="section">
        <h2 className="section-title">ĐỐI TÁC CỦA GHN</h2>
        <p className="section-text2">
        Hơn 100.000 khách hàng đã tin dùng dịch vụ
        </p>
        <div className="partner-logos">
          <div className="partner-row">
            <img src={partner1Logo} alt="Partner 1" className="partner-logo" />
            <img src={partner2Logo} alt="Partner 2" className="partner-logo" />
            <img src={partner3Logo} alt="Partner 3" className="partner-logo" />
            <img src={partner4Logo} alt="Partner 4" className="partner-logo" />
            <img src={partner5Logo} alt="Partner 5" className="partner-logo" />
            <img src={partner6Logo} alt="Partner 6" className="partner-logo" />
          </div>
          <div className="partner-row">
            <img src={partner7Logo} alt="Partner 7" className="partner-logo" />
            <img src={partner8Logo} alt="Partner 8" className="partner-logo" />
            <img src={partner9Logo} alt="Partner 9" className="partner-logo" />
            <img src={partner10Logo} alt="Partner 10" className="partner-logo" />
            <img src={partner11Logo} alt="Partner 11" className="partner-logo" />
            <img src={partner12Logo} alt="Partner 12" className="partner-logo" />
          </div>
        </div>
      </div>

      {/* Khác biệt dịch vụ */}
      <div className="section">
        <h2 className="section-title">KHÁC BIỆT DỊCH VỤ</h2>
        <p className="section-text2">
        Giao nhận chuyên nghiệp cho E-commerce
        </p>
        <div className="service-differences">
          <div className="service-item">
            <img src={service1Image} alt="Dịch vụ 1" className="service-image" />
            <p className="service-caption">Đa dạng dịch vụ</p>
            <p className='service-caption-note'>Giao hàng thương mại điện tử, Vận tải cho doanh nghiệp, Kho bãi và xử lý hàng hóa</p>
          </div>
          <div className="service-item">
            <img src={service2Image} alt="Dịch vụ 2" className="service-image" />
            <p className="service-caption">Hệ thống Auto-Sorting</p>
            <p className='service-caption-note'>Tự hào sở hữu 2 hệ thống phân loại hàng tự động 100% đầu tiên tại Việt Nam</p>
          </div>
          <div className="service-item">
            <img src={service3Image} alt="Dịch vụ 3" className="service-image" />
            <p className="service-caption">Chính sách ưu đãi hấp dẫn</p>
            <p className='service-caption-note'>Miễn phí Lấy hàng tận nơi, Miễn phí Thu hộ, Miễn phí Giao lại, Hoàn đến 6% khi nạp GHN Xu</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
