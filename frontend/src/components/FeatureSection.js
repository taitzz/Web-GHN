import React from "react";
import "../assets/styles/FeatureSection.css";
import { FaTrophy, FaMapMarkedAlt, FaShippingFast, FaMobileAlt } from "react-icons/fa"; 

const features = [
    { icon: <FaTrophy />, title: "Top công ty giao nhận hàng đầu VN" },
    { icon: <FaMapMarkedAlt />, title: "Mạng lưới phủ sóng 100% 63 tỉnh thành" },
    { icon: <FaShippingFast />, title: "Giao hàng nhanh, Tỷ lệ hoàn hàng thấp" },
    { icon: <FaMobileAlt />, title: "Hệ thống quản lý trực tuyến 24/7" },
];

const FeatureSection = () => {
    return (
        <div className="feature-section">
            {features.map((feature, index) => (
                <div key={index} className="feature-item">
                    <div className="feature-icon">{feature.icon}</div>
                    <p className="feature-title">{feature.title}</p>
                </div>
            ))}
        </div>
    );
};

export default FeatureSection;
