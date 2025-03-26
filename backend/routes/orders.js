const express = require("express");
const { authenticateToken, isUser, isAdmin } = require("../middleware/auth");
const OrderController = require("../controllers/OrderController");
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

// Lấy danh sách đơn hàng (cho user)
router.get("/", authenticateToken, isUser, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[GET /orders] Yêu cầu từ UserID: ${req.user.UserID}`);
    OrderController.getOrders(req, res, next);
});

// Lấy chi tiết đơn hàng (cho user)
router.get("/:orderId", authenticateToken, isUser, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[GET /orders/${req.params.orderId}] Yêu cầu từ UserID: ${req.user.UserID}`);
    OrderController.getOrderById(req, res, next);
});

// Tạo đơn hàng (cho user)
router.post("/create", authenticateToken, isUser, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[POST /orders/create] Yêu cầu từ UserID: ${req.user.UserID}, Dữ liệu:`, req.body);
    OrderController.createOrder(req, res, next);
});

// Hủy đơn hàng (cho user)
router.delete("/:orderId", authenticateToken, isUser, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[DELETE /orders/${req.params.orderId}] Yêu cầu từ UserID: ${req.user.UserID}, Dữ liệu:`, req.body);
    OrderController.cancelOrder(req, res, next);
});

// Lấy danh sách yêu cầu hủy đơn hàng (cho admin)
router.get("/cancel-requests", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[GET /orders/cancel-requests] Yêu cầu từ AdminID: ${req.user.UserID}`);
    OrderController.getCancelRequests(req, res, next);
});

// Phê duyệt yêu cầu hủy đơn hàng (cho admin)
router.post("/cancel-requests/:requestId/approve", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[POST /orders/cancel-requests/${req.params.requestId}/approve] Yêu cầu từ AdminID: ${req.user.UserID}, Dữ liệu:`, req.body);
    OrderController.approveCancelRequest(req, res, next);
});

// Từ chối yêu cầu hủy đơn hàng (cho admin)
router.post("/cancel-requests/:requestId/reject", authenticateToken, isAdmin, async (req, res, next) => {
    if (!(await checkDatabaseConnection())) {
        return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
    }
    console.log(`[POST /orders/cancel-requests/${req.params.requestId}/reject] Yêu cầu từ AdminID: ${req.user.UserID}`);
    OrderController.rejectCancelRequest(req, res, next);
});

module.exports = router;