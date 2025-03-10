import React, { useState, useEffect } from "react";
import "../assets/styles/ImageSlider.css"; 
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";

const images = [
    { src: img1, caption: "GHN Free Hoàn Khi Sử Dụng CDN" },
    { src: img2, caption: "Dịch Vụ Giao Hàng Nhanh" },
    { src: img3, caption: "Dịch Vụ Kho Bãi Và Xử Lý Hàng Hóa" },
    { src: img4, caption: "Dịch Vụ Vận Chuyển Giao Hàng Nặng" }
];

const ImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Chuyển ảnh mỗi 3 giây

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="slider-container">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image.src}
                    alt="Slider"
                    className={`slider-image ${index === currentIndex ? "active" : ""}`}
                />
            ))}
            <div className="slider-caption">{images[currentIndex].caption}</div>
        </div>
    );
};

export default ImageSlider;
