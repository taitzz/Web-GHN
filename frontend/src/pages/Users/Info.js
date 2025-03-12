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
                    <table>
                        <thead>
                            <tr>
                                <th>Loại dịch vụ</th>
                                <th>Giá (VND)</th>
                                <th>Thời gian giao hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Giao hàng tiêu chuẩn</td>
                                <td>15,500</td>
                                <td>2 - 3 ngày</td>
                            </tr>
                            <tr>
                                <td>Giao hàng nhanh</td>
                                <td>30,000</td>
                                <td>1 ngày</td>
                            </tr>
                            <tr>
                                <td>Giao hàng siêu tốc</td>
                                <td>50,000</td>
                                <td>Trong ngày</td>
                            </tr>
                            <tr>
                                <td>Giao hàng quốc tế</td>
                                <td>100,000</td>
                                <td>5 - 7 ngày</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="note">(*) Giá trên chưa bao gồm thuế và các phí phát sinh khác.</p>
                </section>
            </div>

            {/* Bao gồm phần Footer */}
            <Footer />
        </div>
    );
};

export default Info;
