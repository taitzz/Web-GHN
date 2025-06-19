const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Order = require("../models/Orders");
const Shipper = require("../models/Shipper");

class AdminController {
    // Đăng nhập admin
    static async login(req, res) {
        console.log("Request tới /api/admin/login:", req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
        }

        try {
            console.log("Kết nối database...");
            const admin = await Admin.getAdminByUsername(username);
            if (!admin) {
                console.log(`Không tìm thấy admin với username: ${username}`);
                return res.status(400).json({ message: "Tài khoản không tồn tại!" });
            }

            console.log("So sánh mật khẩu...");
            const isMatch = await bcrypt.compare(password, admin.Password);
            if (!isMatch) {
                console.log(`Mật khẩu không khớp cho username: ${username}`);
                return res.status(400).json({ message: "Mật khẩu không đúng!" });
            }

            console.log("Tạo token...");
            const token = jwt.sign(
                { AdminID: admin.AdminID, role: "admin" },
                process.env.JWT_SECRET || "your_jwt_secret"
            );

            console.log(`Đã đăng nhập admin: ${username}, AdminID: ${admin.AdminID}, Token: ${token}`);
            res.status(200).json({
                message: "Đăng nhập thành công",
                token,
                user: { id: admin.AdminID, role: "admin" },
            });
        } catch (err) {
            console.error("❌ Lỗi khi đăng nhập admin:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    // Lấy danh sách đơn hàng
    static async getOrders(req, res) {
        try {
            const { status } = req.query;
            const orders = await Order.getOrdersByStatus(status);
            console.log(`[GET /admin/orders] Truy vấn với status: ${status || "tất cả"}`);
            console.log(`[GET /admin/orders] Kết quả: `, orders);
            res.json(orders);
        } catch (err) {
            console.error("[GET /admin/orders] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng!" });
        }
    }

    // Lấy chi tiết đơn hàng theo orderId
    static async getOrderById(req, res) {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }

            const order = await Order.getOrderByIdForAdmin(orderId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            console.log(`[GET /admin/orders/${orderId}] Đã lấy chi tiết đơn hàng OrderID: ${orderId}`);
            res.json(order);
        } catch (err) {
            console.error(`[GET /admin/orders/${req.params.orderId}] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng!" });
        }
    }

    // Đếm số lượng đơn hàng theo trạng thái
    static async getOrderCounts(req, res) {
        try {
            const counts = await Order.getOrderCounts();
            console.log(`[GET /admin/orders/counts] Kết quả: `, counts);
            res.json(counts);
        } catch (err) {
            console.error("[GET /admin/orders/counts] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi đếm đơn hàng!" });
        }
    }

    // Duyệt đơn hàng (Pending → Approved, tự động gán shipper)
    static async approveOrder(req, res) {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }

            const orderStatus = await Order.checkOrderStatus(orderId);
            if (!orderStatus) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            if (orderStatus.Status !== "Pending") {
                return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt!" });
            }

            // Lấy thông tin đơn hàng để lấy tỉnh/thành phố người gửi
            const order = await Order.getOrderByIdForAdmin(orderId);
            const senderProvince = order.SenderAddress.split(",").pop().trim();

            // Tìm shipper khả dụng ở tỉnh/thành phố của người gửi
            const shipper = await Order.findAvailableShipperByProvince(senderProvince);
            let shipperId = null;

            if (shipper) {
                shipperId = shipper.ShipperID;

                // Gán shipper cho đơn hàng
                await Order.assignShipper(orderId, shipperId);

                // Tạo ShipperAssignment để gửi thông báo cho shipper
                await Order.createShipperAssignment(orderId, shipperId);

                // Cập nhật trạng thái shipper thành không khả dụng
                await Shipper.updateShipperAvailability(shipperId, false);

                // Nếu có shipper, chuyển trạng thái sang Shipping
                await Order.updateOrderStatus(orderId, "Shipping");
            } else {
                // Nếu không có shipper, chỉ chuyển trạng thái sang Approved
                await Order.updateOrderStatus(orderId, "Approved");
            }

            console.log(`[PATCH /admin/orders/${orderId}/approve] Đã duyệt đơn hàng OrderID: ${orderId}, ShipperID: ${shipperId || "Không có shipper phù hợp"}`);
            res.status(200).json({
                message: shipperId
                    ? "Duyệt đơn hàng và gán shipper thành công!"
                    : "Duyệt đơn hàng thành công, nhưng không có shipper phù hợp!",
                shipperAssigned: !!shipperId,
                shipperId: shipperId,
            });
        } catch (err) {
            console.error(`[PATCH /admin/orders/${req.params.orderId}/approve] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi duyệt đơn hàng!" });
        }
    }

    // Gán shipper cho các đơn hàng Approved chưa có shipper
    static async assignShipperToApprovedOrders(req, res) {
        try {
            const orders = await Order.getApprovedOrdersWithoutShipper();
            if (!orders || orders.length === 0) {
                return res.status(200).json({ message: "Không có đơn hàng nào cần gán shipper!" });
            }

            let assignedCount = 0;

            for (const order of orders) {
                const senderProvince = order.SenderAddress.split(",").pop().trim();
                const shipper = await Order.findAvailableShipperByProvince(senderProvince);

                if (shipper) {
                    const shipperId = shipper.ShipperID;

                    // Gán shipper cho đơn hàng
                    await Order.assignShipper(order.OrderID, shipperId);

                    // Tạo ShipperAssignment
                    await Order.createShipperAssignment(order.OrderID, shipperId);

                    // Cập nhật trạng thái shipper
                    await Shipper.updateShipperAvailability(shipperId, false);

                    // Cập nhật trạng thái đơn hàng thành Shipping
                    await Order.updateOrderStatus(order.OrderID, "Shipping");

                    assignedCount++;
                    console.log(`[PATCH /admin/orders/assign-shippers] Đã gán ShipperID: ${shipperId} cho OrderID: ${order.OrderID}`);
                }
            }

            res.status(200).json({
                message: `Đã gán shipper cho ${assignedCount} đơn hàng thành công!`,
                assignedCount,
            });
        } catch (err) {
            console.error(`[PATCH /admin/orders/assign-shippers] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi gán shipper!" });
        }
    }

    // Từ chối đơn hàng
    static async rejectOrder(req, res) {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            const { reason } = req.body;
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }
            if (!reason) {
                return res.status(400).json({ message: "Vui lòng cung cấp lý do từ chối!" });
            }

            const order = await Order.getOrderByIdForAdmin(orderId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            if (order.Status !== "Pending") {
                return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt!" });
            }

            await Order.rejectOrder(orderId, reason);
            console.log(`[PATCH /admin/orders/${orderId}/reject] Đã từ chối đơn hàng OrderID: ${orderId}, Lý do: ${reason}`);
            res.status(200).json({ message: "Đơn hàng đã bị từ chối thành công!" });
        } catch (err) {
            console.error(`[PATCH /admin/orders/${req.params.orderId}/reject] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi từ chối đơn hàng!" });
        }
    }

    // Lấy danh sách yêu cầu hủy đơn hàng
    static async getCancelRequests(req, res) {
        try {
            const status = req.query.status || "Pending";
            const requests = await Order.getCancelRequests(status);
            console.log(`[GET /admin/orders/cancel-requests] Truy vấn với status: ${status}, Kết quả: ${requests.length} yêu cầu`);
            res.status(200).json(requests);
        } catch (err) {
            console.error("[GET /admin/orders/cancel-requests] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu cầu hủy!" });
        }
    }

    // Phê duyệt yêu cầu hủy đơn hàng
    static async approveCancelRequest(req, res) {
        try {
            const requestId = parseInt(req.params.requestId, 10);
            const { orderId } = req.body;
            if (isNaN(requestId) || !orderId) {
                return res.status(400).json({ message: "RequestID hoặc OrderID không hợp lệ!" });
            }

            const order = await Order.getOrderByIdForAdmin(orderId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            const cancelRequest = await Order.getCancelRequestByOrderId(orderId);
            if (!cancelRequest || cancelRequest.Status !== "Pending") {
                return res.status(400).json({ message: "Yêu cầu hủy không tồn tại hoặc đã được xử lý!" });
            }

            await Order.approveCancelRequest(requestId, orderId);
            console.log(`[POST /admin/orders/cancel-requests/${requestId}/approve] Đã phê duyệt yêu cầu hủy RequestID: ${requestId} cho OrderID: ${orderId}`);
            res.status(200).json({ message: "Phê duyệt yêu cầu hủy thành công!" });
        } catch (err) {
            console.error(`[POST /admin/orders/cancel-requests/${req.params.requestId}/approve] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi phê duyệt yêu cầu hủy!" });
        }
    }

    // Từ chối yêu cầu hủy đơn hàng
    static async rejectCancelRequest(req, res) {
        try {
            const requestId = parseInt(req.params.requestId, 10);
            if (isNaN(requestId)) {
                return res.status(400).json({ message: "RequestID không hợp lệ!" });
            }
    
            const cancelRequest = await Order.getCancelRequestByRequestId(requestId);
            if (!cancelRequest || cancelRequest.Status !== "Pending") {
                return res.status(400).json({ message: "Yêu cầu hủy không tồn tại hoặc đã được xử lý!" });
            }
    
            await Order.rejectCancelRequest(requestId);
            console.log(`[POST /admin/orders/cancel-requests/${requestId}/reject] Đã từ chối yêu cầu hủy RequestID: ${requestId}`);
            res.status(200).json({ message: "Từ chối yêu cầu hủy thành công!" });
        } catch (err) {
            console.error(`[POST /admin/orders/cancel-requests/${req.params.requestId}/reject] Lỗi:`, { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi từ chối yêu cầu hủy!" });
        }
    }
}

module.exports = AdminController;