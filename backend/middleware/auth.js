const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("📢 Authorization Header nhận được:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("⚠️ Không có token hoặc header không đúng định dạng!");
        return res.status(401).json({ message: "❌ Không có token, truy cập bị từ chối!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("✅ Token hợp lệ, user:", decoded);
        next();
    } catch (err) {
        console.error("❌ Token không hợp lệ:", err);
        return res.status(403).json({ message: "❌ Token không hợp lệ!" });
    }
};