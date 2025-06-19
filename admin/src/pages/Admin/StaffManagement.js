import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ShipperRequests from "../Shippers/ShipperRequests"; 
import DetailsShipper from "../Shippers/DetailsShipper";  
import styles from "../../styles/StaffManagement.module.css";

const StaffManagement = ({ setIsAuthenticated }) => {
    const [activeTab, setActiveTab] = useState("requests");

    return (
        <div className={styles.container}>
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className={styles.mainContent}>
                <div className={styles.statusTab}>
                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tabButton} ${activeTab === "requests" ? styles.active : ""}`}
                            onClick={() => setActiveTab("requests")}
                        >
                            Yêu Cầu Nhân Viên
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "list" ? styles.active : ""}`}
                            onClick={() => setActiveTab("list")}
                        >
                            Danh Sách Nhân Viên
                        </button>
                    </div>
                    <div className={styles.tabContent}>
                        {activeTab === "requests" && <ShipperRequests />}
                        {activeTab === "list" && <DetailsShipper />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;