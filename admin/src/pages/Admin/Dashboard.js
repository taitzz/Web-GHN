import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Orders from "./Orders"; 
import ShipperRequests from "../Shippers/ShipperRequests";
import DetailsShipper from "../Shippers/DetailsShipper";
import "../../styles/Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            setIsAuthenticated(false);
            navigate("/");  // Nếu không có token thì điều hướng đến trang login
        } else {
            setIsLoading(false);
        }
    }, [navigate]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="app">
            <div className="app__container">
                
                <div className="main">
                                        
                    {/* Điều hướng nội dung chính */}
                    <Routes>
                        <Route path="/" element={<Orders status="pending" />} /> {/* Route mặc định */}
                        <Route path="admin/orders/:status" element={<Orders />} />
                        <Route path="shippers/shipper-requests" element={<ShipperRequests />} />
                        <Route path="shippers/details-shipper" element={<DetailsShipper />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;