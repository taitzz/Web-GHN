import React from "react";
import "../assets/styles/VideoAD.css";

const VideoAd = () => {
    return (
        <div className="video-container">
            <h2>GIAO NHANH HƠN 6 TIẾNG</h2>
            <p>GHN giúp bạn giao hàng đến người nhận nhanh hơn 6 tiếng so với các đơn vị vận chuyển khác.</p>
            <video autoPlay muted playsinline loop >
                <source src="https://file.hstatic.net/1000376681/file/1920x900_d8d881b358674809a162eb6b6069ff10.mp4" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
            </video>
        </div>
    );
};

export default VideoAd;
