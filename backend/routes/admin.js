const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const AdminController = require("../controllers/AdminController");
const Shipper = require("../models/Shipper");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Middleware kiểm tra kết nối database
const checkDatabaseConnection = async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query("SELECT 1");
        console.log("[checkDatabaseConnection] Kết nối database thành công");
        return true;
    } catch (err) {
        console.error("❌ Lỗi kết nối database:", { message: err.message, stack: err.stack });
        return false;
    }
};

// Đăng nhập admin
router.post("/login", async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.login(req, res, next);
});

// Lấy danh sách yêu cầu hủy đơn hàng (cho admin)
router.get("/orders/cancel-requests", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[GET /admin/orders/cancel-requests] Yêu cầu từ AdminID: ${req.user.AdminID}`);
    AdminController.getCancelRequests(req, res, next);
});

// Lấy danh sách đơn hàng
router.get("/orders", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.getOrders(req, res, next);
});

// Đếm số lượng đơn hàng theo trạng thái
router.get("/orders/counts", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.getOrderCounts(req, res, next);
});

// Lấy chi tiết đơn hàng theo orderId
router.get("/orders/:orderId", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.getOrderById(req, res, next);
});

// Duyệt đơn hàng
router.patch("/orders/:orderId/approve", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.approveOrder(req, res, next);
});

// Từ chối đơn hàng
router.patch("/orders/:orderId/reject", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.rejectOrder(req, res, next);
});

// Gán shipper cho một đơn hàng cụ thể
router.patch("/orders/:orderId/assign-shipper", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    AdminController.assignShipper(req, res, next);
});

// Gán shipper cho tất cả đơn hàng Approved chưa có shipper
router.patch("/orders/assign-shippers", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[PATCH /admin/orders/assign-shippers] Yêu cầu từ AdminID: ${req.user.AdminID}`);
    AdminController.assignShipperToApprovedOrders(req, res, next);
});

// Lấy số lượng shipper khả dụng
router.get("/shippers/available/count", authenticateToken, isAdmin, async (req, res) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }

    try {
        const shippers = await Shipper.getAvailableShippers();
        const count = shippers.length;
        console.log(`[GET /admin/shippers/available/count] Số lượng shipper khả dụng: ${count}`);
        res.json({ count });
    } catch (err) {
        console.error("[GET /admin/shippers/available/count] Lỗi:", { message: err.message, stack: err.stack });
        res.status(500).json({ message: "Lỗi server khi lấy số lượng shipper khả dụng!" });
    }
});

// Lấy danh sách shipper khả dụng
router.get("/shippers/available", authenticateToken, isAdmin, async (req, res) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }

    try {
        const shippers = await Shipper.getAvailableShippers();
        console.log(`[GET /admin/shippers/available] Danh sách shipper khả dụng:`, shippers);
        res.json(shippers);
    } catch (err) {
        console.error("[GET /admin/shippers/available] Lỗi:", { message: err.message, stack: err.stack });
        res.status(500).json({ message: "Lỗi server khi lấy danh sách shipper khả dụng!" });
    }
});

// Phê duyệt yêu cầu hủy đơn hàng (cho admin)
router.post("/orders/cancel-requests/:requestId/approve", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[POST /admin/orders/cancel-requests/${req.params.requestId}/approve] Yêu cầu từ AdminID: ${req.user.AdminID}, Dữ liệu:`, req.body);
    AdminController.approveCancelRequest(req, res, next);
});

// Từ chối yêu cầu hủy đơn hàng (cho admin)
router.post("/orders/cancel-requests/:requestId/reject", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[POST /admin/orders/cancel-requests/${req.params.requestId}/reject] Yêu cầu từ AdminID: ${req.user.AdminID}`);
    AdminController.rejectCancelRequest(req, res, next);
});

module.exports = router;