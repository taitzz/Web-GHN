import React from "react";
import "../assets/styles/Footer.css";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Cột 1 - Giới thiệu công ty */}
        <div className="footer-column">
          <h3 className="footer-title">CÔNG TY CỔ PHẦN DỊCH VỤ GIAO HÀNG NHANH</h3>
          <p>
            Công ty giao nhận đầu tiên tại Việt Nam được thành lập với sứ mệnh phục vụ nhu cầu vận chuyển chuyên nghiệp
            của các đối tác Thương mại điện tử trên toàn quốc.
          </p>
          <p>
            Giấy CNĐKDN số 0311907295 do Sở Kế Hoạch và Đầu Tư TP HCM cấp lần đầu ngày 02/08/2012, cấp thay đổi lần thứ
            20: ngày 25/06/2024.
          </p>
          <p>
            Văn bản xác nhận thông báo hoạt động bưu chính số 2438/XN-BTTTT do Bộ Thông tin và Truyền thông cấp lần đầu
            ngày 01/02/2013.
          </p>
        </div>

        {/* Cột 2 - Về GHN */}
        <div className="footer-column">
          <h3 className="footer-title">VỀ GHN</h3>
          <ul>
            <li>Giới thiệu GHN</li>
            <li>Hệ thống bưu cục</li>
            <li>Công Nghệ</li>
            <li>GHN Xu</li>
            <li>Cơ hội việc làm</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        {/* Cột 3 - Thông tin dịch vụ */}
        <div className="footer-column">
          <h3 className="footer-title">THÔNG TIN DỊCH VỤ</h3>
          <ul>
            <li>Bảng giá</li>
            <li>Dịch vụ giao hàng</li>
            <li>Quy trình gửi hàng</li>
            <li>Khai báo giá trị hàng hóa</li>
            <li>Hàng hóa không vận chuyển</li>
            <li>Câu hỏi thường gặp</li>
          </ul>
        </div>

        {/* Cột 4 - Chính sách & hỗ trợ */}
        <div className="footer-column">
          <h3 className="footer-title">THÔNG TIN</h3>
          <ul>
            <li>Chính sách bồi thường</li>
            <li>Quy định về khiếu nại</li>
            <li>Điều khoản sử dụng</li>
            <li>Tin tức GHN</li>
            <li>Khuyến mãi</li>
            <li>Kiến thức giao hàng</li>
            <li>Tip bán hàng</li>
            <li>Chiến binh GHN</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
      </div>

      {/* Dòng địa chỉ & liên hệ */}
      <div className="footer-contact">
        <p>
          <FaMapMarkerAlt className="footer-icon" />{" "}
          <strong>Trụ sở chính:</strong> 405/15 Xô Viết Nghệ Tĩnh, Phường 24, Quận Bình Thạnh, TP HCM
        </p>
        <p>
          <FaEnvelope className="footer-icon" /> <strong>Email:</strong> cskh@ghn.vn
        </p>
        <p>
          <FaPhone className="footer-icon" /> <strong>Hotline:</strong> 1900 636677
        </p>
      </div>
    </footer>
  );
};

export default Footer;
