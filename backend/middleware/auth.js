const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("📢 Authorization Header nhận được:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("⚠️ Không có token, tiếp tục mà không xác thực!");
        req.user = null; // Không có user
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("✅ Token hợp lệ, user:", decoded);
    } catch (err) {
        console.error("❌ Token không hợp lệ:", err);
        req.user = null; // Không chặn request nếu token sai
    }

    next(); // Tiếp tục xử lý request
};
