import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ShipperLogin from "../pages/Auth/ShipperLogin";
import ShipperRegister from "../pages/Auth/ShipperRegister"; 
import ShipperRequirements from "../pages/Info/ShipperRequirements";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shipper-login" element={<ShipperLogin />} />
      <Route path="/shipper-register" element={<ShipperRegister />} /> 
      <Route path="/shipper-requirements" element={<ShipperRequirements />} />
      <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}
