const express = require("express");
const { authenticateToken, isUser , isAdmin} = require("../middleware/auth");
const UserController = require("../controllers/UserController");

const router = express.Router();

// API công khai: Đăng ký người dùng
router.post("/register", UserController.register);

// API công khai: Kiểm tra tên tài khoản
router.post("/check-username", UserController.checkUsername);

// API công khai: Đăng nhập người dùng
router.post("/login", UserController.login);

// API công khai Lấy danh sách người dùng 
router.get("/list", authenticateToken, isAdmin, UserController.getUsers);

// API bảo vệ: Lấy thông tin người dùng
router.get("/profile", authenticateToken, isUser, UserController.getProfile);

// API bảo vệ: Xóa người dùng
router.delete("/:id", authenticateToken, isAdmin, UserController.deleteUser);

// API: Gửi OTP cho quên mật khẩu
router.post("/forgot-password", UserController.forgotPassword);

// API: Đổi mật khẩu bằng OTP
router.post("/reset-password", UserController.resetPassword);

module.exports = router;