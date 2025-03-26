// PrivateRoute.js
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
    const shipperToken = localStorage.getItem("shipperToken");
    const adminToken = localStorage.getItem("adminToken");

    console.log("PrivateRoute - shipperToken:", shipperToken ? "Có shipperToken" : "Không có shipperToken");
    console.log("PrivateRoute - adminToken:", adminToken ? "Có adminToken" : "Không có adminToken");
    console.log("PrivateRoute - role:", role);

    if (role === "shipper") {
        if (!shipperToken) {
            return <Navigate to="/shipper-login" />;
        }
        return children;
    }

    if (role === "admin") {
        if (!adminToken) {
            return <Navigate to="/" />;
        }
        return children;
    }

    // Nếu không có role được chỉ định, mặc định yêu cầu adminToken
    if (!adminToken) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;