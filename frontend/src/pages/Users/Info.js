import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../assets/styles/Info.css';
import priceImage from '../../assets/images/ghn-08.webp';

const Info = () => {
    return (
        <div className="info-container">
            {/* Bao gồm phần Header */}
            <Header />

            <div className="info-content">
                <h1 className="info-title">BẢNG GIÁ MỚI SIÊU TIẾT KIỆM - GIÁ CHỈ TỪ 15,5K/ĐƠN</h1>

                {/* Phần ảnh */}
                <div className="info-image">
                    <img src={priceImage} alt="Bảng giá GHN" />
                </div>

                {/* Phần văn bản giới thiệu */}
                <div className="info-text">
                    <p>Kính gửi <span className="highlight-orange">QUÝ KHÁCH HÀNG,</span></p>
                    <p>GHN rất vinh hạnh được trở thành người đồng hành đáng tin cậy cùng Quý Khách Hàng trong suốt thời gian qua.</p>
                    <p>Tiếp tục mang đến cho Quý Khách Hàng những trải nghiệm dịch vụ tận tâm và tốt nhất, đội ngũ GHN chính thức ra mắt bảng giá <span className="highlight-orange">SIÊU TIẾT KIỆM</span> mới.</p>
                    <p>Từ 0h ngày 18/11/2022, GHN chính thức áp dụng bảng giá mới với mức giá siêu tốt dành cho Khách Hàng chưa ký hợp đồng (*).</p>
                </div>

                {/* Phần bảng giá */}
                <section className="price-table">
                    <h2>Bảng giá dịch vụ GHN</h2>
                    <p>Dịch vụ của GHN bao gồm các loại phí sau, được tính dựa trên trọng lượng, kích thước, khoảng cách và hình thức giao hàng:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Loại phí</th>
                                <th>Cách tính</th>
                                <th>Giá tiền</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Phí cơ bản</td>
                                <td>Cố định cho mỗi đơn hàng</td>
                                <td>15,500 VNĐ</td>
                                <td>Áp dụng cho mọi đơn hàng</td>
                            </tr>
                            <tr>
                                <td>Phí giao nhanh</td>
                                <td>Áp dụng nếu chọn "Giao nhanh"</td>
                                <td>20,000 VNĐ</td>
                                <td>Thêm vào phí cơ bản</td>
                            </tr>
                            <tr>
                                <td>Phí trọng lượng</td>
                                <td>
                                    <ul>
                                        <li> 0 - 10kg: 6,000 VNĐ/kg</li>
                                        <li>10 - 20kg: 5,000 VNĐ/kg</li>
                                        <li>20 - 30kg: 4,000 VNĐ/kg</li>
                                        <li>30 - 50kg: 3,000 VNĐ/kg</li>
                                    </ul>
                                </td>
                                <td>Tối đa 150,000 VNĐ</td>
                                <td>Tối đa 50kg, vượt quá sẽ không áp dụng</td>
                            </tr>
                            <tr>
                                <td>Phí kích thước</td>
                                <td>
                                    <ul>
                                        <li>100,000 - 300,000 cm³: 0.08 VNĐ/cm³</li>
                                        <li>300,000 - 500,000 cm³: 0.12 VNĐ/cm³</li>
                                        <li>Trên 500,000 cm³: 0.15 VNĐ/cm³</li>
                                    </ul>
                                </td>
                                <td>Tùy theo thể tích</td>
                                <td>Chỉ áp dụng nếu vượt 100,000 cm³</td>
                            </tr>
                            <tr>
                                <td>Phí khoảng cách</td>
                                <td>
                                    <ul>
                                        <li>0 - 5km: 8,000 VNĐ/km</li>
                                        <li>5 - 10km: 6,000 VNĐ/km</li>
                                        <li>Trên 10km: 5,000 VNĐ/km</li>
                                    </ul>
                                </td>
                                <td>Tùy theo khoảng cách</td>
                                <td>Tính dựa trên khoảng cách giữa điểm gửi và nhận</td>
                            </tr>
                            <tr>
                                <td>Thuế VAT</td>
                                <td>5% tổng phí</td>
                                <td>Tùy theo tổng phí</td>
                                <td>Áp dụng trên tổng các phí trên</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="note">
                        (*) Tổng phí = Phí cơ bản + Phí giao nhanh (nếu có) + Phí trọng lượng + Phí kích thước + Phí khoảng cách + Thuế VAT. Giá trên áp dụng cho khách hàng chưa ký hợp đồng.
                    </p>
                </section>

                {/* Ví dụ minh họa */}
                <section className="price-example">
                    <h2>Ví dụ tính phí</h2>
                    <p>Một đơn hàng Giao thường, trọng lượng 15kg, kích thước 20 x 20 x 25 cm, khoảng cách 7km:</p>
                    <ul>
                        <li>Phí cơ bản: 15,500 VNĐ</li>
                        <li>Phí trọng lượng: (10 x 6,000) + (5 x 5,000) = 60,000 + 25,000 = 85,000 VNĐ</li>
                        <li>Phí kích thước: 20 x 20 x 25 = 10,000 cm³ (dưới 100,000 cm³) = 0 VNĐ</li>
                        <li>Phí khoảng cách: (5 x 8,000) + (2 x 6,000) = 40,000 + 12,000 = 52,000 VNĐ</li>
                        <li>Tổng tạm tính: 15,500 + 85,000 + 0 + 52,000 = 152,500 VNĐ</li>
                        <li>Thuế VAT: 152,500 x 5% = 7,625 VNĐ</li>
                        <li><strong>Tổng phí: 152,500 + 7,625 = 160,125 VNĐ</strong></li>
                    </ul>
                </section>
            </div>

            {/* Bao gồm phần Footer */}
            <Footer />
        </div>
    );
};

export default Info;