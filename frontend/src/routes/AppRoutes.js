import { Routes, Route } from "react-router-dom";
import LoginUser from "../pages/Auth/LoginUser";
import RegisterUser from "../pages/Auth/RegisterUser";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Notifications from "../pages/Users/Notifications";  
import PrivateRoute from "./PrivateRoute"; 
import Home from "../pages/Users/Home";
import About from "../pages/Users/About";
import Support from "../pages/Users/Support";
import Info from "../pages/Users/Info";
import Services from '../pages/Users/Services';
import CreateOrder from '../pages/Users/CreateOrder';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Các trang công khai */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginUser />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
      <Route path="/info" element={<Info />} />
      <Route path="/services" element={<Services />} />

      {/* Các trang yêu cầu đăng nhập */}
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/create-order" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
      <Route path="/create-order/:orderId" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />

      {/* Trang lỗi 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}