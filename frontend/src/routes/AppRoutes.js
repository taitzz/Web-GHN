import { Routes, Route } from "react-router-dom";
import LoginUser from "../pages/Auth/LoginUser";
import RegisterUser from "../pages/Auth/RegisterUser";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import NotificationPage from "../pages/Users/NotificationPage";  
import PrivateRoute from "./PrivateRoute"; 
import Home from "../pages/Users/Home";
import About from "../pages/Users/About";
import Support from "../pages/Users/Support";
import  Info from "../pages/Users/Info";
import Services from '../pages/Users/Services';
import CreateOrder from '../pages/Users/CreateOrder';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Các trang công khai */}
      <Route path="/" element={<LoginUser />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Các trang yêu cầu đăng nhập */}
      <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
      <Route path="/info" element={<PrivateRoute><Info /></PrivateRoute>} />
      <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
      <Route path="/create-order" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />

      {/* Trang lỗi 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}
