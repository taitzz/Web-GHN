import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatusTabs from "../../components/StatusTabs";
import MainContent from "../../components/MainContent";
import Orders from "./Orders"; // Trang hiển thị danh sách đơn hàng
import ShipperRequests from "../Shippers/ShipperRequests";
import DetailsShipper from "../Shippers/DetailsShipper";
import "../../styles/Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setIsAuthenticated(false);
            navigate("/");  // Nếu không có token thì điều hướng đến trang login
        } else {
            setIsLoading(false);
        }
    }, [navigate]);

    if (isLoading) return null;

    return (
        <div className="app">
            <div className="app__container">
                <Sidebar setIsAuthenticated={setIsAuthenticated} />
                <div className="main">
                    <TopBar />
                    <StatusTabs /> {/* Luôn hiển thị StatusTabs để điều hướng giữa các trạng thái đơn hàng */}

                    {/* Điều hướng nội dung chính */}
                    <Routes>
                        <Route path="/" element={<MainContent />} />
                        <Route path="/admin/orders/:status" element={<Orders />} />
                        <Route path="/Shippers/ShipperRequests" element={<ShipperRequests />} />
                        <Route path="/Shippers/DetailsShipper" element={<DetailsShipper />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
