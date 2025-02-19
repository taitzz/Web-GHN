import React from "react";
import "../styles/MainContent.css";
import img1 from '../assets/images/3d_avatar_10.png';

const MainContent = () => (
    <div className="main-content">
        <div>Chưa có đơn hàng nào được tạo!</div>
        <a href="#">Tạo đơn hàng ngay</a>
        <img src={img1} alt="Illustration" />        
    </div>
);

export default MainContent;
