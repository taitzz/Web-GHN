import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const MainLayout = () => {
    return (
        <div>
            <Header />  {/* Header luôn hiển thị trên mọi trang */}
            <main className="main-content">
                <Outlet /> {/* Phần này sẽ chứa nội dung của từng trang */}
            </main>
        </div>
    );
};

export default MainLayout;
