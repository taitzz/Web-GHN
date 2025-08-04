const express = require("express");
const cors = require("cors");
const promClient = require("prom-client");

require("dotenv").config();

const shipperRoutes = require("./routes/shipper");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const { authenticateToken, restrictTo } = require("./middleware/auth");

const app = express();

// Thu thập metrics mặc định của Node.js (CPU, memory, event loop, v.v.)
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Tạo metrics tùy chỉnh
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
});

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);

// Middleware để ghi log và thu thập metrics
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Bắt đầu đo thời gian phản hồi
    const start = process.hrtime();
    
    // Ghi lại metrics khi response hoàn tất
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;
        const status = res.statusCode.toString();
        
        // Ghi lại số lượng request
        httpRequestCounter.inc({ method: req.method, path: req.path, status });
        
        // Ghi lại thời gian phản hồi
        httpRequestDuration.observe({ method: req.method, path: req.path, status }, durationInSeconds);
    });
    
    next();
});

// Endpoint để Prometheus thu thập metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
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