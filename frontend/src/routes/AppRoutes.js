import { Routes, Route } from "react-router-dom";
import LoginUser from "../pages/Auth/LoginUser";
import RegisterUser from "../pages/Auth/RegisterUser";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Dashboard from "../pages/Users/Dashboard";
import NotificationPage from "../pages/Users/NotificationPage";  
import PrivateRoute from "./PrivateRoute"; 

export default function AppRoutes() {
  return (
    <Routes>
      {/* Các trang công khai */}
      <Route path="/" element={<LoginUser />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Các trang yêu cầu đăng nhập */}
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />  {/* Thêm route thông báo */}

      {/* Trang lỗi 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}
