import Sidebar from "../../components/SideBar";
import Topbar from "../../components/TopBar";
import Home from "../../pages/Users/Home"; 
import "../../assets/styles/Dashboard.css";

export default function Dashboard() {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard__content">
                <Topbar />
                <div className="dashboard__main">
                    <Home />
                </div>
            </div>
        </div>
    );
}
