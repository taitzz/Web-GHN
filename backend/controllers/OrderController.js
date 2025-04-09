const Order = require("../models/Orders");
const { poolPromise } = require("../config/db");

class OrderController {
    // Hàm kiểm tra kết nối database
    static async checkDatabaseConnection() {
        try {
            const pool = await poolPromise;
            await pool.request().query("SELECT 1");
            return true;
        } catch (err) {
            console.error("❌ Lỗi kết nối database:", err.message);
            return false;
        }
    }

    // Lấy danh sách đơn hàng (cho user)
    static async getOrders(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const userId = req.user?.UserID;
            if (!userId) {
                return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token!" });
            }

            const orders = await Order.getOrdersByUserId(userId);
            console.log(`Đã lấy danh sách đơn hàng cho UserID: ${userId}, số lượng: ${orders.length}`);
            res.json(orders);
        } catch (err) {
            console.error("❌ Lỗi lấy danh sách đơn hàng (user):", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng!" });
        }
    }

    // Lấy chi tiết đơn hàng (cho user)
    static async getOrderById(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const userId = req.user?.UserID;
            if (!userId) {
                return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token!" });
            }

            const orderId = parseInt(req.params.orderId, 10);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }

            const order = await Order.getOrderById(orderId, userId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            console.log(`Đã lấy chi tiết đơn hàng OrderID: ${orderId} cho UserID: ${userId}`);
            res.json(order);
        } catch (err) {
            console.error("❌ Lỗi lấy chi tiết đơn hàng (user):", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng!" });
        }
    }

    // Tạo đơn hàng (cho user)
    static async createOrder(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const userId = req.user?.UserID;
            if (!userId) {
                return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token!" });
            }

            const {
                SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
                Weight, Volume, Distance, DeliveryType, TotalCost, ItemName, PaymentBy, PaymentStatus, Notes
            } = req.body;

            console.log("Dữ liệu nhận được từ frontend:", req.body); // Debug dữ liệu nhận được

            // Kiểm tra các trường bắt buộc
            if (!SenderName || !SenderAddress || !ReceiverName || !ReceiverAddress || !Weight || !TotalCost) {
                console.log("Các trường thiếu hoặc không hợp lệ:", {
                    SenderName, SenderAddress, ReceiverName, ReceiverAddress, Weight, TotalCost
                });
                return res.status(400).json({ message: "❌ Thiếu thông tin bắt buộc!" });
            }

            const orderData = {
                SenderName,
                SenderPhone,
                SenderAddress,
                ReceiverName,
                ReceiverPhone,
                ReceiverAddress,
                Weight,
                Volume,
                Distance,
                DeliveryType,
                TotalCost,
                ItemName,
                PaymentBy,
                PaymentStatus,
                Notes
            };

            const newOrderId = await Order.createOrder(userId, orderData);
            console.log(`Đã tạo đơn hàng OrderID: ${newOrderId} cho UserID: ${userId}`);
            res.status(201).json({ orderId: newOrderId, message: "✅ Đơn hàng tạo thành công!" });
        } catch (err) {
            console.error("❌ Lỗi tạo đơn hàng (user):", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi tạo đơn hàng!" });
        }
    }

    // Hủy đơn hàng (cho user)
    static async cancelOrder(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const userId = req.user?.UserID;
            if (!userId) {
                return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token!" });
            }

            const orderId = parseInt(req.params.orderId, 10);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }

            const order = await Order.getOrderById(orderId, userId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.Status !== "Pending") {
                return res.status(400).json({ message: "Đơn hàng đã được duyệt, không thể hủy!" });
            }

            // Kiểm tra xem đã có yêu cầu hủy chưa
            const existingRequest = await Order.getCancelRequestByOrderId(orderId);
            if (existingRequest) {
                return res.status(400).json({ message: "Đơn hàng đã có yêu cầu hủy đang chờ xử lý!" });
            }

            // Nếu chưa thanh toán, hủy trực tiếp
            if (order.PaymentStatus !== "Paid") {
                await Order.cancelOrder(orderId, userId);
                console.log(`Đã hủy đơn hàng OrderID: ${orderId} cho UserID: ${userId}`);
                return res.status(200).json({ message: "Đơn hàng đã hủy thành công!" });
            }

            // Nếu đã thanh toán, yêu cầu tạo CancelRequest
            const { cancelReason, bankAccount, bankName } = req.body;
            if (!cancelReason || !bankAccount || !bankName) {
                return res.status(400).json({ message: "Vui lòng cung cấp lý do hủy, số tài khoản và ngân hàng!" });
            }

            await Order.createCancelRequest(orderId, userId, cancelReason, bankAccount, bankName);
            console.log(`Đã tạo yêu cầu hủy cho OrderID: ${orderId} bởi UserID: ${userId}`);
            res.status(200).json({ message: "Yêu cầu hủy đơn hàng đã được gửi, vui lòng chờ admin phê duyệt!" });
        } catch (err) {
            console.error("❌ Lỗi hủy đơn hàng (user):", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi hủy đơn hàng!" });
        }
    }

    // Lấy danh sách yêu cầu hủy đơn hàng (cho admin)
    static async getCancelRequests(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const status = req.query.status || "Pending";
            const requests = await Order.getCancelRequests(status);
            console.log(`Đã lấy danh sách yêu cầu hủy với trạng thái ${status}, số lượng: ${requests.length}`);
            res.status(200).json(requests);
        } catch (err) {
            console.error("[GET /cancel-requests] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu cầu hủy!" });
        }
    }

    // Phê duyệt yêu cầu hủy đơn hàng (cho admin)
    static async approveCancelRequest(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const requestId = parseInt(req.params.requestId, 10);
            const { orderId } = req.body;
            if (isNaN(requestId) || !orderId) {
                return res.status(400).json({ message: "RequestID hoặc OrderID không hợp lệ!" });
            }

            await Order.approveCancelRequest(requestId, orderId);
            console.log(`Đã phê duyệt yêu cầu hủy RequestID: ${requestId} cho OrderID: ${orderId}`);
            res.status(200).json({ message: "Phê duyệt yêu cầu hủy thành công!" });
        } catch (err) {
            console.error(`[POST /cancel-requests/${req.params.requestId}/approve] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi phê duyệt yêu cầu hủy!" });
        }
    }

    // Từ chối yêu cầu hủy đơn hàng (cho admin)
    static async rejectCancelRequest(req, res) {
        try {
            if (!(await OrderController.checkDatabaseConnection())) {
                return res.status(503).json({ message: "❌ Lỗi kết nối database!" });
            }

            const requestId = parseInt(req.params.requestId, 10);
            if (isNaN(requestId)) {
                return res.status(400).json({ message: "RequestID không hợp lệ!" });
            }

            await Order.rejectCancelRequest(requestId);
            console.log(`Đã từ chối yêu cầu hủy RequestID: ${requestId}`);
            res.status(200).json({ message: "Từ chối yêu cầu hủy thành công!" });
        } catch (err) {
            console.error(`[POST /cancel-requests/${req.params.requestId}/reject] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi từ chối yêu cầu hủy!" });
        }
    }
}

module.exports = OrderController;