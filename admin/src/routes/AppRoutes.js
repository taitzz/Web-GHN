import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import ShipperLogin from "../pages/Auth/ShipperLogin";
import ShipperRegister from "../pages/Auth/ShipperRegister"; 
import ShipperRequirements from "../pages/Info/ShipperRequirements";
import Dashboard from "../pages/Admin/Dashboard";
import ShipperRequests from "../pages/Shippers/ShipperRequests";
import DetailsShipper from "../pages/Shippers/DetailsShipper";
import Orders from "../pages/Admin/Orders";
import UserList from "../pages/Admin/UserList";  
import PrivateRoute from "./PrivateRoute"; 

export default function AppRoutes() {
  return (
    <Routes>
      {/* Các trang công khai */}
      <Route path="/" element={<Login />} />
      <Route path="/shipper-login" element={<ShipperLogin />} />
      <Route path="/shipper-register" element={<ShipperRegister />} /> 
      <Route path="/shipper-requirements" element={<ShipperRequirements />} />

      {/* Các trang yêu cầu đăng nhập */}
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/Shippers/ShipperRequests" element={<PrivateRoute><ShipperRequests /></PrivateRoute>} />
      <Route path="/Shippers/DetailsShipper" element={<PrivateRoute><DetailsShipper /></PrivateRoute>} />
      <Route path="/admin/orders/:status" element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute><UserList /></PrivateRoute>} />  {/* Thêm route mới */}

      {/* Trang lỗi 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}
