import React from "react";
import Sidebar from "../../components/Sidebar";
import StatusTabs from "../../components/StatusTabs";
import styles from "../../styles/Orders.module.css";

const Orders = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(true);

    return (
        <div className={styles.container}>
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className={styles.main}>
            
                <div className={styles.content}>
                    <h2>Quản Lý Đơn Hàng</h2>
                    <StatusTabs />
                </div>
            </div>
        </div>
    );
};

export default Orders;