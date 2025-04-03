import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("authToken"); // Kiểm tra token trong localStorage

  return isAuthenticated ? children : <Navigate to="/login" />; // Nếu đã đăng nhập, hiển thị nội dung của children, nếu không chuyển hướng về trang đăng nhập
};

export default PrivateRoute;
