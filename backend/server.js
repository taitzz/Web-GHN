const express = require("express");
const cors = require("cors");
require("dotenv").config();

const shipperRoutes = require("./routes/shipper");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const { authenticateToken, restrictTo } = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use("/api/shipper", shipperRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", authenticateToken, restrictTo("user", "shipper"), orderRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "❌ Route không tồn tại!" });
});

app.use((err, req, res, next) => {
    console.error(`❌ Lỗi server [${new Date().toISOString()}]:`, err.stack);
    res.status(500).json({ message: "Lỗi server nội bộ!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});