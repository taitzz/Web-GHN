import { Link } from "react-router-dom";

export default function ShipperRequirements() {
    const styles = {
        container: {
            maxWidth: "600px",
            margin: "50px auto",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
        },
        title: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#ff6600",
        },
        list: {
            textAlign: "left",
            paddingLeft: "20px",
            lineHeight: "1.8",
        },
        linkContainer: {
            marginTop: "20px",
        },
        link: {
            color: "#ff6600",
            fontWeight: "bold",
            textDecoration: "none",
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Yêu Cầu Đối Với Shipper</h1>
            <ul style={styles.list}>
                <li>✅ Có phương tiện cá nhân (xe máy, xe đạp điện, v.v.).</li>
                <li>✅ Có điện thoại thông minh để sử dụng ứng dụng giao hàng.</li>
                <li>✅ Trung thực, trách nhiệm, có ý thức bảo quản hàng hóa.</li>
                <li>✅ Giao hàng đúng thời gian và đảm bảo chất lượng dịch vụ.</li>
                <li>✅ Chấp hành các quy định của công ty về giao hàng.</li>
                <li>✅ Tôn trọng khách hàng, giao tiếp lịch sự.</li>
            </ul>
            <div style={styles.linkContainer}>
                <Link to="/shipper-register" style={styles.link}>
                    Quay lại đăng ký
                </Link>
            </div>
        </div>
    );
}
