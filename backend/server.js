const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load biến môi trường từ .env

// Kiểm tra xem `.env` có được tải đúng không
console.log("✅ Đã tải `.env`. PORT =", process.env.PORT);

const shipperRoutes = require("./routes/shipper"); // Route cho shipper
const userRoutes = require("./routes/users"); // Route cho người dùng

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 CORS - Cho phép frontend truy cập backend
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Import API routes
app.use("/api/shipper", shipperRoutes);
app.use("/api/users", userRoutes);

// ✅ Route test `/dashboard`
app.get("/dashboard", (req, res) => {
    res.json({ message: "🚀 Welcome to the Dashboard!" });
});

// ✅ Middleware xử lý lỗi 404
app.use((req, res, next) => {
    res.status(404).json({ message: "❌ Route không tồn tại!" });
});

// ✅ Middleware xử lý lỗi server (500)
app.use((err, req, res, next) => {
    console.error("❌ Lỗi server:", err.stack);
    res.status(500).json({ message: "Lỗi server nội bộ!" });
});

// ✅ Chạy backend trên port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
