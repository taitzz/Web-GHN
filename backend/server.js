const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Vẫn cần jwt nếu dùng trong các route khác
require("dotenv").config();

console.log("✅ Đã tải `.env`. PORT =", process.env.PORT);

const shipperRoutes = require("./routes/shipper");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const authMiddleware = require("./middleware/auth"); // Import middleware từ auth.js

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Routes
app.use("/api/shipper", shipperRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", authMiddleware, orderRoutes); // Sử dụng authMiddleware từ auth.js

// Route test
app.get("/dashboard", (req, res) => {
    res.json({ message: "🚀 Welcome to the Dashboard!" });
});

// Middleware lỗi 404
app.use((req, res, next) => {
    res.status(404).json({ message: "❌ Route không tồn tại!" });
});

// Middleware lỗi 500
app.use((err, req, res, next) => {
    console.error("❌ Lỗi server:", err.stack);
    res.status(500).json({ message: "Lỗi server nội bộ!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));