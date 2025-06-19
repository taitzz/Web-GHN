const jwt = require("jsonwebtoken");
const Shipper = require("../models/Shipper");
const Order = require("../models/Orders");

class ShipperController {
    // Kiểm tra email trùng lặp
    static async checkEmail(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email không được để trống!" });
            }

            const emailExists = await Shipper.checkEmailExists(email);
            console.log(`[ShipperController.checkEmail] Kiểm tra email: ${email}, Kết quả: ${emailExists}`);
            return res.status(200).json({ exists: emailExists });
        } catch (err) {
            console.error("[ShipperController.checkEmail] Lỗi:", { message: err.message, stack: err.stack });
            return res.status(500).json({ message: err.message || "Lỗi server khi kiểm tra email!" });
        }
    }
    
    // Đăng ký shipper
    static async register(req, res) {
        const { fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense, workAreas } = req.body;

        if (!fullName || !birthDate || !permanentAddress || !currentAddress || !phoneNumber || !email || !cccd || !driverLicense) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        if (isNaN(Date.parse(birthDate))) {
            return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
        }

        if (!workAreas || workAreas.length === 0) {
            return res.status(400).json({ message: "Vui lòng chọn cơ sở làm việc" });
        }

        try {
            const existingShipper = await Shipper.getShipperByEmail(email);
            if (existingShipper) {
                return res.status(400).json({ message: "Email đã được sử dụng!" });
            }

            const shipperId = await Shipper.insertShipper(
                fullName,
                new Date(birthDate),
                permanentAddress,
                currentAddress,
                phoneNumber,
                email,
                cccd,
                driverLicense,
                workAreas 
            );

            console.log(`[ShipperController.register] Đã đăng ký shipper: ${email}, ShipperID: ${shipperId}`);
            res.status(201).json({ message: "🎉 Đăng ký thành công, chờ admin duyệt!", shipperId });
        } catch (err) {
            console.error("[ShipperController.register] Lỗi:", { message: err.message, stack: err.stack });
            if (err.message.includes("CCCD")) {
                return res.status(400).json({ message: err.message });
            }
            if (err.message.includes("DriverLicense")) {
                return res.status(400).json({ message: err.message });
            }
            res.status(500).json({ message: err.message || "Lỗi server!" });
        }
    }

    // Thêm shipper cho admin
    static async createAndApproveShipper(req, res) {
        try {
            const {
                fullName,
                birthDate,
                permanentAddress,
                currentAddress,
                phoneNumber,
                email,
                cccd,
                driverLicense,
                workAreas,
            } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!fullName || !birthDate || !permanentAddress || !currentAddress || !phoneNumber || !email || !cccd || !driverLicense) {
                return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
            }

            if (isNaN(Date.parse(birthDate))) {
                return res.status(400).json({ message: "Ngày sinh không hợp lệ!" });
            }

            if (!workAreas) {
                return res.status(400).json({ message: "Vui lòng cung cấp cơ sở làm việc!" });
            }

            // Gọi phương thức insertAndApproveShipper
            const shipperId = await Shipper.insertAndApproveShipper(
                fullName,
                new Date(birthDate),
                permanentAddress,
                currentAddress,
                phoneNumber,
                email,
                cccd,
                driverLicense,
                workAreas
            );

            console.log(`[ShipperController.createAndApproveShipper] Đã tạo và duyệt shipper: ${email}, ShipperID: ${shipperId}`);
            res.status(201).json({
                message: "Shipper đã được thêm, duyệt và email thông báo đã được gửi!",
                shipperId,
            });
        } catch (err) {
            console.error("[ShipperController.createAndApproveShipper] Lỗi:", { message: err.message, stack: err.stack });
            if (err.message.includes("CCCD")) {
                return res.status(400).json({ message: err.message });
            }
            if (err.message.includes("DriverLicense")) {
                return res.status(400).json({ message: err.message });
            }
            if (err.message.includes("Email")) {
                return res.status(400).json({ message: err.message });
            }
            res.status(500).json({ message: err.message || "Lỗi server khi thêm và duyệt shipper!" });
        }
    }

    //Cập nhật shipper cho admin
    static async updateShipper(req, res) {
        try {
            const shipperId = parseInt(req.params.id, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }
    
            const {
                fullName,
                birthDate,
                permanentAddress,
                currentAddress,
                phoneNumber,
                email,
                cccd,
                driverLicense,
                workAreas,
            } = req.body;
    
            console.log("Dữ liệu nhận được:", req.body); // Log để kiểm tra
    
            if (!fullName || !birthDate || !permanentAddress || !currentAddress || !phoneNumber || !email || !cccd || !driverLicense || !workAreas) {
                return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
            }
    
            await Shipper.updateShipper(
                shipperId,
                fullName,
                new Date(birthDate),
                permanentAddress,
                currentAddress,
                phoneNumber,
                email,
                cccd,
                driverLicense,
                workAreas
            );
    
            console.log(`[ShipperController.updateShipper] Đã cập nhật ShipperID: ${shipperId}`);
            res.status(200).json({ message: "Thông tin shipper đã được cập nhật!" });
        } catch (err) {
            console.error("[ShipperController.updateShipper] Lỗi:", err);
            if (err.message.includes("CCCD đã tồn tại")) {
                return res.status(400).json({ message: "CCCD đã tồn tại!" });
            }
            if (err.message.includes("Số giấy phép lái xe đã tồn tại")) {
                return res.status(400).json({ message: "Số giấy phép lái xe đã tồn tại!" });
            }
            if (err.message.includes("Email không hợp lệ")) {
                return res.status(400).json({ message: "Email không hợp lệ!" });
            }
            if (err.message.includes("Shipper không tồn tại")) {
                return res.status(404).json({ message: "Shipper không tồn tại!" });
            }
            res.status(500).json({ message: err.message || "Lỗi server khi cập nhật shipper!" });
        }
    }

    // Đăng nhập shipper
    static async login(req, res) {
        try {
            const { employeeId, password } = req.body;

            if (!employeeId || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            const shipper = await Shipper.getShipperByEmployeeId(employeeId);
            if (!shipper) {
                return res.status(401).json({ message: "Tài khoản không tồn tại!" });
            }

            if (shipper.Status !== "Approved") {
                return res.status(403).json({ message: "Tài khoản chưa được duyệt!" });
            }

            if (shipper.Password !== password) {
                return res.status(401).json({ message: "Mật khẩu không đúng!" });
            }

            const token = jwt.sign(
                { shipperId: shipper.ShipperID, role: "shipper" },
                process.env.JWT_SECRET || "your_jwt_secret",
                { expiresIn: "1h" }
            );

            res.status(200).json({
                message: "Đăng nhập thành công!",
                token,
                shipper: {
                    id: shipper.ShipperID,
                    fullName: shipper.FullName,
                },
            });
        } catch (err) {
            console.error("[ShipperController.login] Lỗi:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi đăng nhập!" });
        }
    }

    // Lấy tên Shipper
    static async getShipperName(req, res) {
        try {
            const shipperId = req.user.shipperId;
            if (!shipperId) {
                return res.status(400).json({ message: "Thiếu shipperId trong token!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            res.status(200).json({ fullName: shipper.FullName });
        } catch (err) {
            console.error("[ShipperController.getShipperName] Lỗi:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi lấy tên shipper!" });
        }
    }

    // Lấy thông tin shipper
    static async getProfile(req, res) {
        try {
            const shipperId = req.user?.shipperId;
            if (!shipperId) {
                return res.status(401).json({ message: "❌ Không tìm thấy ShipperID trong token!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            console.log(`[ShipperController.getProfile] Đã lấy thông tin shipper ShipperID: ${shipperId}`);
            res.status(200).json({
                fullName: shipper.FullName,
                birthDate: shipper.BirthDate,
                permanentAddress: shipper.PermanentAddress,
                currentAddress: shipper.CurrentAddress,
                phoneNumber: shipper.Phone,
                email: shipper.Email,
                cccd: shipper.CCCD,
                driverLicense: shipper.DriverLicense,
                status: shipper.Status,
                employeeId: shipper.EmployeeID,
                workAreas: shipper.WorkAreas,
            });
        } catch (err) {
            console.error("[ShipperController.getProfile] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server!" });
        }
    }

    // Lấy chi tiết đơn hàng cho Shipper
    static async getOrderDetails(req, res) {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            const shipperId = req.user.shipperId;

            if (isNaN(orderId)) {
                return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
            }

            const order = await Order.getOrderByIdForAdmin(orderId);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            if (order.ShipperID !== shipperId) {
                return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này!" });
            }

            res.status(200).json(order);
        } catch (err) {
            console.error("[ShipperController.getOrderDetails] Lỗi:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi lấy chi tiết đơn hàng!" });
        }
    }

    // Lấy danh sách shipper cần duyệt (dành cho admin)
    static async getPendingShippers(req, res) {
        try {
            const pendingShippers = await Shipper.getPendingShippers();
            console.log(`[ShipperController.getPendingShippers] Đã lấy danh sách shipper cần duyệt: ${pendingShippers.length} shipper`);
            res.status(200).json(pendingShippers);
        } catch (err) {
            console.error("[ShipperController.getPendingShippers] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách shipper cần duyệt!" });
        }
    }

    // Lấy danh sách shipper đã duyệt (dành cho admin)
    static async getApprovedShippers(req, res) {
        try {
            const approvedShippers = await Shipper.getApprovedShippers();
            console.log(`[ShipperController.getApprovedShippers] Đã lấy danh sách shipper đã duyệt: ${approvedShippers.length} shipper`);
            res.status(200).json(approvedShippers);
        } catch (err) {
            console.error("[ShipperController.getApprovedShippers] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách shipper đã duyệt!" });
        }
    }

    // Lấy danh sách shipper sẵn sàng (dành cho admin)
    static async getAvailableShippers(req, res) {
        try {
            const availableShippers = await Shipper.getAvailableShippers();
            console.log(`[ShipperController.getAvailableShippers] Đã lấy danh sách shipper sẵn sàng: ${availableShippers.length} shipper`);
            res.status(200).json(availableShippers);
        } catch (err) {
            console.error("[ShipperController.getAvailableShippers] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách shipper sẵn sàng!" });
        }
    }

    // Lấy chi tiết shipper theo ID (dành cho admin)
    static async getShipperById(req, res) {
        try {
            const shipperId = parseInt(req.params.id, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            console.log(`[ShipperController.getShipperById] Đã lấy chi tiết shipper ShipperID: ${shipperId}`);
            res.status(200).json({
                fullName: shipper.FullName,
                birthDate: shipper.BirthDate,
                permanentAddress: shipper.PermanentAddress,
                currentAddress: shipper.CurrentAddress,
                phoneNumber: shipper.Phone,
                email: shipper.Email,
                cccd: shipper.CCCD,
                driverLicense: shipper.DriverLicense,
                status: shipper.Status,
                employeeId: shipper.EmployeeID,
                workAreas: shipper.WorkAreas,
                isVailable: shipper.availableShippers,
            });
        } catch (err) {
            console.error("[ShipperController.getShipperById] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server!" });
        }
    }

    // Duyệt shipper (dành cho admin)
    static async approveShipper(req, res) {
        try {
            const shipperId = parseInt(req.params.id, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            if (shipper.Status !== "Pending") {
                return res.status(400).json({ message: "Shipper không ở trạng thái chờ duyệt!" });
            }

            await Shipper.approveShipper(shipperId);

            console.log(`[ShipperController.approveShipper] Đã duyệt shipper ShipperID: ${shipperId}`);
            res.status(200).json({ message: "Shipper đã được duyệt và email thông báo đã được gửi!" });
        } catch (err) {
            console.error("[ShipperController.approveShipper] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi duyệt shipper!" });
        }
    }

    // Từ chối shipper (dành cho admin)
    static async rejectShipper(req, res) {
        try {
            const shipperId = parseInt(req.params.id, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            if (shipper.Status !== "Pending") {
                return res.status(400).json({ message: "Shipper không ở trạng thái chờ duyệt!" });
            }

            await Shipper.rejectShipper(shipperId);
            console.log(`[ShipperController.rejectShipper] Đã từ chối shipper ShipperID: ${shipperId}`);
            res.status(200).json({ message: "Từ chối shipper thành công!" });
        } catch (err) {
            console.error("[ShipperController.rejectShipper] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi từ chối shipper!" });
        }
    }

    // Xóa shipper (dành cho admin)
    static async deleteShipper(req, res) {
        try {
            const shipperId = parseInt(req.params.id, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }

            const shipper = await Shipper.getShipperById(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            await Shipper.deleteShipper(shipperId);
            console.log(`[ShipperController.deleteShipper] Đã xóa shipper ShipperID: ${shipperId}`);
            res.status(200).json({ message: "Xóa shipper thành công!" });
        } catch (err) {
            console.error("[ShipperController.deleteShipper] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi xóa shipper!" });
        }
    }

    // Lấy danh sách đơn hàng được gán
    static async getAssignments(req, res) {
        try {
            const shipperId = req.user.shipperId;
            const assignments = await Shipper.getAssignments(shipperId);
            console.log(`[ShipperController.getAssignments] Đã lấy danh sách đơn hàng được gán cho ShipperID: ${shipperId}`);
            res.status(200).json(assignments);
        } catch (err) {
            console.error("[ShipperController.getAssignments] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách đơn hàng được gán!" });
        }
    }

    // Lấy danh sách đơn hàng đang vận chuyển
    static async getShippingOrders(req, res) {
        try {
            const shipperId = req.user.shipperId;
            const shippingOrders = await Shipper.getShippingOrders(shipperId);
            console.log(`[ShipperController.getShippingOrders] Đã lấy danh sách đơn hàng đang vận chuyển cho ShipperID: ${shipperId}`);
            res.status(200).json(shippingOrders);
        } catch (err) {
            console.error("[ShipperController.getShippingOrders] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách đơn hàng đang vận chuyển!" });
        }
    }

    // Phản hồi đơn hàng (Đồng ý/Từ chối)
    static async respondToAssignment(req, res) {
        try {
            const { assignmentId, shipperId, response } = req.body;
            if (!assignmentId || !shipperId || !response) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
            }
            if (response !== "Accepted" && response !== "Rejected") {
                return res.status(400).json({ message: "Phản hồi không hợp lệ!" });
            }

            if (req.user.shipperId !== parseInt(shipperId)) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
            }

            await Shipper.respondToAssignment(assignmentId, shipperId, response);
            console.log(`[ShipperController.respondToAssignment] ShipperID: ${shipperId} đã phản hồi AssignmentID: ${assignmentId}`);
            res.status(200).json({ message: "Phản hồi đơn hàng thành công!" });
        } catch (err) {
            console.error("[ShipperController.respondToAssignment] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi phản hồi đơn hàng!" });
        }
    }

    // Bắt đầu vận chuyển đơn hàng
    static async startShipping(req, res) {
        try {
            const { orderId, shipperId } = req.body;
            if (!orderId || !shipperId) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
            }

            if (req.user.shipperId !== parseInt(shipperId)) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
            }

            await Shipper.startShipping(orderId, shipperId);
            console.log(`[ShipperController.startShipping] ShipperID: ${shipperId} đã bắt đầu vận chuyển OrderID: ${orderId}`);
            res.status(200).json({ message: "Bắt đầu vận chuyển đơn hàng thành công!" });
        } catch (err) {
            console.error("[ShipperController.startShipping] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi bắt đầu vận chuyển đơn hàng!" });
        }
    }

    // Xác nhận hoàn thành đơn hàng
    static async completeOrder(req, res) {
        try {
            const { orderId, shipperId } = req.body;
            if (!orderId || !shipperId) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
            }

            if (req.user.shipperId !== parseInt(shipperId)) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
            }

            await Shipper.completeOrder(orderId, shipperId);
            console.log(`[ShipperController.completeOrder] ShipperID: ${shipperId} đã hoàn thành OrderID: ${orderId}`);
            res.status(200).json({ message: "Xác nhận hoàn thành đơn hàng thành công!" });
        } catch (err) {
            console.error("[ShipperController.completeOrder] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi xác nhận hoàn thành đơn hàng!" });
        }
    }

    // Xác nhận thanh toán từ người nhận
    static async confirmPayment(req, res) {
        try {
            const { orderId, shipperId } = req.body;
            if (!orderId || !shipperId) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
            }

            if (req.user.shipperId !== parseInt(shipperId)) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
            }

            await Shipper.confirmPayment(orderId, shipperId);
            console.log(`[ShipperController.confirmPayment] ShipperID: ${shipperId} đã xác nhận thanh toán cho OrderID: ${orderId}`);
            res.status(200).json({ message: "Xác nhận thanh toán thành công!" });
        } catch (err) {
            console.error("[ShipperController.confirmPayment] Lỗi:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: err.message || "Lỗi server khi xác nhận thanh toán!" });
        }
    }

    // Danh sách các đơn đã hoàn thành
    static async getCompletedOrders(req, res) {
        try {
            const shipperId = req.user.shipperId;
            if (!shipperId) {
                return res.status(400).json({ message: "Thiếu shipperId trong token!" });
            }
    
            const completedOrders = await Shipper.getCompletedOrders(shipperId);
            console.log(`[ShipperController.getCompletedOrders] Đã lấy danh sách đơn hàng hoàn thành cho ShipperID: ${shipperId}`);
            res.status(200).json(completedOrders);
        } catch (err) {
            console.error("[ShipperController.getCompletedOrders] Lỗi:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách đơn hàng hoàn thành!" });
        }
    }

    // Lấy chi tiết shipper theo ShipperID
    static async getShipperDetails(req, res) {
        try {
            const shipperId = parseInt(req.params.shipperId, 10);
            if (isNaN(shipperId)) {
                return res.status(400).json({ message: "ShipperID không hợp lệ!" });
            }

            const shipper = await Shipper.getShipperDetails(shipperId);
            if (!shipper) {
                return res.status(404).json({ message: "Không tìm thấy shipper!" });
            }

            console.log(`[GET /shipper/shipper-details/${shipperId}] Tìm thấy shipper:`, shipper);
            res.status(200).json(shipper);
        } catch (err) {
            console.error(`[GET /shipper/shipper-details/${req.params.shipperId}] Lỗi:`, {
                message: err.message,
                stack: err.stack,
            });
            res.status(500).json({ message: "Lỗi server khi lấy thông tin shipper!" });
        }
    }
}

module.exports = ShipperController;