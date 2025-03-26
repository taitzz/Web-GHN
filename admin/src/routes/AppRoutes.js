import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import ShipperLogin from "../pages/Auth/ShipperLogin";
import ShipperRegister from "../pages/Auth/ShipperRegister";
import ShipperRequirements from "../pages/Info/ShipperRequirements";
import Dashboard from "../pages/Admin/Dashboard";
import ShipperRequests from "../pages/Shippers/ShipperRequests";
import DetailsShipper from "../pages/Shippers/DetailsShipper";
import ShipperDashboard from "../pages/Shippers/ShipperDashboard";
import Orders from "../pages/Admin/Orders";
import StaffManagement from "../pages/Admin/StaffManagement";
import UserList from "../pages/Admin/UserList";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/shipper-login" element={<ShipperLogin />} />
            <Route path="/shipper-register" element={<ShipperRegister />} />
            <Route path="/shipper-requirements" element={<ShipperRequirements />} />
            <Route
                path="/dashboard/*" // Thêm /* để khớp với các sub-route
                element={
                    <PrivateRoute role="admin">
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/staff-management"
                element={
                    <PrivateRoute role="admin">
                        <StaffManagement />
                    </PrivateRoute>
                }
            />
            <Route
                path="/shippers/shipper-requests"
                element={
                    <PrivateRoute role="admin">
                        <ShipperRequests />
                    </PrivateRoute>
                }
            />
            <Route
                path="/shippers/details-shipper"
                element={
                    <PrivateRoute role="admin">
                        <DetailsShipper />
                    </PrivateRoute>
                }
            />
            <Route
                path="/shipper-dashboard"
                element={
                    <PrivateRoute role="shipper">
                        <ShipperDashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <PrivateRoute role="admin">
                        <Orders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <PrivateRoute role="admin">
                        <UserList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/delivery"
                element={
                    <PrivateRoute role="admin">
                        <Orders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/finance"
                element={
                    <PrivateRoute role="admin">
                        <Orders />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}