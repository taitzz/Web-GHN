const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token!" });

    jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ!" });
        req.user = user;
        next();
    });
};

// Kiểm tra quyền truy cập cho nhiều vai trò
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập vào tài nguyên này!" });
        }
        next();
    };
};

// Kiểm tra vai trò admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập!" });
    }
    next();
};

// Kiểm tra vai trò user
const isUser = (req, res, next) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({ message: "Chỉ người dùng mới có quyền truy cập!" });
    }
    next();
};

// Kiểm tra vai trò shipper
const isShipper = (req, res, next) => {
    if (!req.user || req.user.role !== "shipper") {
        return res.status(403).json({ message: "Chỉ shipper mới có quyền truy cập!" });
    }
    next();
};

module.exports = { authenticateToken, isAdmin, isUser, isShipper, restrictTo };