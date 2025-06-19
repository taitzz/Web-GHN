const sql = require("mssql");
const { poolPromise } = require("../config/db");

// Kiểm tra poolPromise
if (!poolPromise) {
    throw new Error("poolPromise is not defined in config/db.js. Please check the import path or config/db.js file.");
}

class Order {
    // Lấy danh sách đơn hàng theo UserID
    static async getOrdersByUserId(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT OrderID, SenderName, ReceiverName, CreatedDate, Status, PaymentBy, PaymentStatus, CancelReason , ShipperID
                    FROM Orders
                    WHERE UserID = @UserID
                    ORDER BY CreatedDate DESC
                `);
            console.log(`[Order.getOrdersByUserId] Lấy danh sách đơn hàng cho UserID: ${userId}, Kết quả: ${result.recordset.length} đơn hàng`);
            return result.recordset || [];
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng theo UserID:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy chi tiết đơn hàng theo OrderID và UserID
    static async getOrderById(orderId, userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT OrderID, SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
                           Weight, Volume, Distance, DeliveryType, ISNULL(TotalCost, 0) AS TotalCost, Notes, Status, CreatedDate, ItemName,
                           PaymentBy, PaymentStatus, CancelReason, ShipperID
                    FROM Orders
                    WHERE OrderID = @OrderID AND UserID = @UserID
                `);
            console.log(`[Order.getOrderById] Lấy chi tiết đơn hàng OrderID: ${orderId} cho UserID: ${userId}, Kết quả: ${result.recordset[0] ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Tạo đơn hàng mới
    static async createOrder(userId, orderData) {
        const {
            SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
            Weight, Volume, Distance, DeliveryType, TotalCost, ItemName, PaymentBy, PaymentStatus, Notes
        } = orderData;

        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .input("SenderName", sql.NVarChar, SenderName)
                .input("SenderPhone", sql.NVarChar, SenderPhone || null)
                .input("SenderAddress", sql.NVarChar, SenderAddress)
                .input("ReceiverName", sql.NVarChar, ReceiverName)
                .input("ReceiverPhone", sql.NVarChar, ReceiverPhone || null)
                .input("ReceiverAddress", sql.NVarChar, ReceiverAddress)
                .input("Weight", sql.Decimal(10, 2), parseFloat(Weight))
                .input("Volume", sql.Decimal(15, 2), Volume ? parseFloat(Volume) : null)
                .input("Distance", sql.Decimal(10, 2), Distance ? parseFloat(Distance) : null)
                .input("DeliveryType", sql.NVarChar, DeliveryType || "standard")
                .input("TotalCost", sql.Decimal(15, 2), parseFloat(TotalCost) || 0)
                .input("ItemName", sql.NVarChar, ItemName || null)
                .input("PaymentBy", sql.NVarChar, PaymentBy || "Sender")
                .input("PaymentStatus", sql.NVarChar, PaymentStatus || "Pending")
                .input("Status", sql.NVarChar, "Pending")
                .input("Notes", sql.NVarChar, Notes || null)
                .query(`
                INSERT INTO Orders (UserID, SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
                                   Weight, Volume, Distance, DeliveryType, TotalCost, ItemName, PaymentBy, PaymentStatus, Status, CreatedDate, Notes)
                VALUES (@UserID, @SenderName, @SenderPhone, @SenderAddress, @ReceiverName, @ReceiverPhone, @ReceiverAddress,
                        @Weight, @Volume, @Distance, @DeliveryType, @TotalCost, @ItemName, @PaymentBy, @PaymentStatus, @Status, GETDATE(), @Notes);
                SELECT SCOPE_IDENTITY() AS OrderID;
            `);
            const orderId = result.recordset[0].OrderID;
            console.log(`[Order.createOrder] Đã tạo đơn hàng mới OrderID: ${orderId} cho UserID: ${userId}`);
            return orderId;
        } catch (error) {
            console.error("❌ Lỗi khi tạo đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Kiểm tra trạng thái đơn hàng (dành cho user)
    static async checkOrderStatus(orderId, userId = null) {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT Status
                FROM Orders
                WHERE OrderID = @OrderID
            `;
            if (userId) {
                query += " AND UserID = @UserID";
            }
            const request = pool.request().input("OrderID", sql.Int, orderId);
            if (userId) {
                request.input("UserID", sql.Int, userId);
            }
            const result = await request.query(query);
            console.log(`[Order.checkOrderStatus] Kiểm tra trạng thái đơn hàng OrderID: ${orderId}${userId ? ` cho UserID: ${userId}` : ""}, Kết quả: ${result.recordset[0] ? result.recordset[0].Status : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra trạng thái đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Hủy đơn hàng
    static async cancelOrder(orderId, userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("UserID", sql.Int, userId)
                .query(`
                    UPDATE Orders
                    SET Status = 'Cancelled', CancelReason = N'Huỷ bởi người dùng'
                    WHERE OrderID = @OrderID AND UserID = @UserID
                `);
            console.log(`[Order.cancelOrder] Đã hủy đơn hàng OrderID: ${orderId} bởi UserID: ${userId}, Rows affected: ${result.rowsAffected}`);
        } catch (error) {
            console.error("❌ Lỗi khi hủy đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy danh sách đơn hàng theo trạng thái (dành cho admin)
    static async getOrdersByStatus(status) {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT 
                    o.OrderID, o.UserID, o.SenderName, o.ReceiverName, o.SenderPhone, o.ReceiverPhone,
                    o.SenderAddress, o.ReceiverAddress, o.ItemName, o.Weight, o.Volume, o.Distance,
                    o.DeliveryType, o.Status, o.CreatedDate, o.Notes, 
                    ISNULL(o.TotalCost, 0) AS TotalCost,
                    o.PaymentBy, o.PaymentStatus, o.ShipperID, o.CancelReason,
                    s.FullName AS ShipperName
                FROM Orders o
                LEFT JOIN Shipper s ON o.ShipperID = s.ShipperID
            `;
            const request = pool.request();

            if (status) {
                query += ` WHERE o.Status = @Status`;
                request.input("Status", sql.NVarChar, status);
            }

            query += ` ORDER BY o.CreatedDate DESC`;
            const result = await request.query(query);
            console.log(`[Order.getOrdersByStatus] Lấy danh sách đơn hàng với trạng thái: ${status || "tất cả"}, Kết quả: ${result.recordset.length} đơn hàng`);
            return result.recordset || [];
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng theo trạng thái:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy chi tiết đơn hàng theo OrderID (dành cho admin)
    static async getOrderByIdForAdmin(orderId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .query(`
                    SELECT 
                        o.OrderID, o.UserID, o.SenderName, o.SenderPhone, o.SenderAddress,
                        o.ReceiverName, o.ReceiverPhone, o.ReceiverAddress, o.ItemName,
                        o.Weight, o.Volume, o.Distance, o.DeliveryType, o.Status, o.Notes, 
                        o.CreatedDate, ISNULL(o.TotalCost, 0) AS TotalCost,
                        o.PaymentBy, o.PaymentStatus, o.ShipperID, o.CancelReason,
                        u.Username AS UserName,
                        s.FullName AS ShipperName
                    FROM Orders o
                    LEFT JOIN Users u ON o.UserID = u.UserID
                    LEFT JOIN Shipper s ON o.ShipperID = s.ShipperID
                    WHERE o.OrderID = @OrderID
                `);
            console.log(`[Order.getOrderByIdForAdmin] Lấy chi tiết đơn hàng OrderID: ${orderId}, Kết quả: ${result.recordset[0] ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy chi tiết đơn hàng (admin):", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy danh sách đơn hàng Approved chưa có shipper
    static async getApprovedOrdersWithoutShipper() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT OrderID, SenderAddress
                FROM Orders
                WHERE Status = 'Approved' AND ShipperID IS NULL
            `);
            console.log(`[Order.getApprovedOrdersWithoutShipper] Tìm thấy ${result.recordset.length} đơn hàng Approved chưa có shipper`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng Approved chưa có shipper:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Đếm số lượng đơn hàng theo trạng thái (dành cho admin)
    static async getOrderCounts() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    (SELECT COUNT(*) FROM Orders WHERE Status = 'Pending') AS pending,
                    (SELECT COUNT(*) FROM Orders WHERE Status = 'Approved') AS approved,
                    (SELECT COUNT(*) FROM Orders WHERE Status = 'Shipping') AS shipping,
                    (SELECT COUNT(*) FROM Orders WHERE Status = 'Completed') AS completed,
                    (SELECT COUNT(*) FROM Orders WHERE Status = 'Cancelled') AS cancelled
            `);
            console.log(`[Order.getOrderCounts] Đếm số lượng đơn hàng theo trạng thái:`, result.recordset[0]);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi đếm số lượng đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Kiểm tra trạng thái đơn hàng (dành cho admin, không cần UserID)
    static async checkOrderStatus(orderId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .query(`
                    SELECT Status
                    FROM Orders
                    WHERE OrderID = @OrderID
                `);
            console.log(`[Order.checkOrderStatus] Kiểm tra trạng thái đơn hàng OrderID: ${orderId}, Kết quả: ${result.recordset[0] ? result.recordset[0].Status : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra trạng thái đơn hàng (admin):", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Tìm shipper khả dụng theo tỉnh/thành phố
    static async findAvailableShipperByProvince(province) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("Province", sql.NVarChar, province)
                .query(`
                    SELECT TOP 1 ShipperID, FullName
                    FROM Shipper
                    WHERE IsAvailable = 1 
                    AND Status = 'Approved'
                    AND WorkAreas LIKE '%' + @Province + '%'
                `);
            console.log(`[Order.findAvailableShipperByProvince] Tìm shipper tại ${province}: ${result.recordset[0] ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0] || null;
        } catch (error) {
            console.error("❌ Lỗi khi tìm shipper khả dụng:", error);
            throw error;
        }
    }

    // Cập nhật trạng thái đơn hàng
    static async updateOrderStatus(orderId, targetStatus) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("Status", sql.NVarChar, targetStatus)
                .query("UPDATE Orders SET Status = @Status WHERE OrderID = @OrderID");
            console.log(`[Order.updateOrderStatus] Đã cập nhật trạng thái đơn hàng OrderID: ${orderId} thành ${targetStatus}`);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Gán shipper cho đơn hàng
    static async assignShipper(orderId, shipperId) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("ShipperID", sql.Int, shipperId)
                .query(`
                    UPDATE Orders 
                    SET ShipperID = @ShipperID 
                    WHERE OrderID = @OrderID
                `);
            console.log(`[Order.assignShipper] Đã gán shipper ShipperID: ${shipperId} cho đơn hàng OrderID: ${orderId}`);
        } catch (error) {
            console.error("❌ Lỗi khi gán shipper:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Tạo bản ghi gán đơn hàng cho shipper
    static async createShipperAssignment(orderId, shipperId) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("ShipperID", sql.Int, shipperId)
                .input("Status", sql.NVarChar, "Pending")
                .query(`
                    INSERT INTO ShipperAssignment (OrderID, ShipperID, Status, CreatedAt)
                    VALUES (@OrderID, @ShipperID, @Status, GETDATE())
                `);
            console.log(`[Order.createShipperAssignment] Đã tạo bản ghi gán OrderID: ${orderId} cho ShipperID: ${shipperId}`);
        } catch (error) {
            console.error("❌ Lỗi khi tạo bản ghi gán đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Gán shipper cho các đơn hàng chưa có shipper tại một tỉnh
    static async assignShipperToPendingOrders(province) {
        try {
            const pool = await poolPromise;

            // Tìm shipper khả dụng
            const shipper = await Order.findAvailableShipperByProvince(province);
            if (!shipper) {
                console.log(`[Order.assignShipperToPendingOrders] Không có shipper khả dụng tại ${province}`);
                return;
            }

            // Tìm và gán shipper cho đơn hàng chưa có shipper ở trạng thái Approved
            const result = await pool
                .request()
                .input("Province", sql.NVarChar, province)
                .input("ShipperID", sql.Int, shipper.ShipperID)
                .query(`
                UPDATE TOP (1) Orders
                SET ShipperID = @ShipperID
                WHERE Status = 'Approved'
                AND ShipperID IS NULL
                AND SenderAddress LIKE '%' + @Province + '%'
            `);

            if (result.rowsAffected[0] > 0) {
                // Tạo bản ghi ShipperAssignment
                await Order.createShipperAssignment(result.rowsAffected[0].OrderID, shipper.ShipperID);
                // Cập nhật trạng thái shipper thành không khả dụng
                await Shipper.updateShipperAvailability(shipper.ShipperID, false);
                console.log(`[Order.assignShipperToPendingOrders] Đã gán ShipperID ${shipper.ShipperID} cho một đơn hàng tại ${province}`);
            } else {
                console.log(`[Order.assignShipperToPendingOrders] Không tìm thấy đơn hàng cần gán tại ${province}`);
            }
        } catch (error) {
            console.error("❌ Lỗi khi gán shipper cho đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Từ chối đơn hàng (dành cho admin)
    static async rejectOrder(orderId, reason) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("Reason", sql.NVarChar, reason)
                .query(`
                    UPDATE Orders
                    SET Status = 'Cancelled', CancelReason = @Reason
                    WHERE OrderID = @OrderID
                `);
            console.log(`[Order.rejectOrder] Đã từ chối đơn hàng OrderID: ${orderId}, Lý do: ${reason}, Rows affected: ${result.rowsAffected}`);
        } catch (error) {
            console.error("❌ Lỗi khi từ chối đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Kiểm tra shipper (dành cho admin)
    static async checkShipper(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("ShipperID", sql.Int, shipperId)
                .query(`
                    SELECT ShipperID, FullName
                    FROM Shipper
                    WHERE ShipperID = @ShipperID AND IsAvailable = 1
                `);
            console.log(`[Order.checkShipper] Kiểm tra shipper ShipperID: ${shipperId}, Kết quả: ${result.recordset[0] ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra shipper:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Thêm yêu cầu hủy đơn hàng
    static async createCancelRequest(orderId, userId, cancelReason, bankAccount, bankName) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .input("UserID", sql.Int, userId)
                .input("CancelReason", sql.NVarChar, cancelReason)
                .input("BankAccount", sql.NVarChar, bankAccount)
                .input("BankName", sql.NVarChar, bankName)
                .query(`
                    INSERT INTO CancelRequests (OrderID, UserID, CancelReason, BankAccount, BankName, Status, CreatedDate)
                    OUTPUT INSERTED.RequestID
                    VALUES (@OrderID, @UserID, @CancelReason, @BankAccount, @BankName, 'Pending', GETDATE())
                `);
            console.log(`[Order.createCancelRequest] Tạo yêu cầu hủy cho OrderID: ${orderId}, UserID: ${userId}, RequestID: ${result.recordset[0].RequestID}`);
            return result.recordset[0].RequestID;
        } catch (error) {
            console.error("❌ Lỗi khi tạo yêu cầu hủy đơn hàng:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Kiểm tra xem đơn hàng đã có yêu cầu hủy chưa
    static async getCancelRequestByOrderId(orderId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .query(`
                    SELECT * FROM CancelRequests
                    WHERE OrderID = @OrderID
                `);
            console.log(`[Order.getCancelRequestByOrderId] Kiểm tra yêu cầu hủy cho OrderID: ${orderId}, Kết quả: ${result.recordset.length > 0 ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0] || null;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra yêu cầu hủy:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    static async getCancelRequestByRequestId(requestId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("RequestID", sql.Int, requestId)
                .query(`
                    SELECT * FROM CancelRequests
                    WHERE RequestID = @RequestID
                `);
            console.log(`[Order.getCancelRequestByRequestId] Kiểm tra yêu cầu hủy cho RequestID: ${requestId}, Kết quả: ${result.recordset.length > 0 ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0] || null;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra yêu cầu hủy bằng RequestID:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy danh sách yêu cầu hủy đơn hàng (dành cho admin)
    static async getCancelRequests(status = "Pending") {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("Status", sql.NVarChar, status)
                .query(`
                    SELECT cr.RequestID, cr.OrderID, cr.UserID, cr.CancelReason, cr.BankAccount, cr.BankName, cr.Status, cr.CreatedDate,
                           o.SenderName, o.ReceiverName, o.TotalCost, u.Username
                    FROM CancelRequests cr
                    JOIN Orders o ON cr.OrderID = o.OrderID
                    JOIN Users u ON cr.UserID = u.UserID
                    WHERE cr.Status = @Status
                    ORDER BY cr.CreatedDate DESC
                `);
            console.log(`[Order.getCancelRequests] Lấy danh sách yêu cầu hủy với trạng thái: ${status}, Kết quả: ${result.recordset.length} yêu cầu`);
            return result.recordset || [];
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách yêu cầu hủy:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Phê duyệt yêu cầu hủy đơn hàng (dành cho admin)
    static async approveCancelRequest(requestId, orderId) {
        try {
            const pool = await poolPromise;
            // Cập nhật trạng thái yêu cầu hủy
            await pool
                .request()
                .input("RequestID", sql.Int, requestId)
                .query(`
                    UPDATE CancelRequests
                    SET Status = 'Approved'
                    WHERE RequestID = @RequestID
                `);

            // Cập nhật trạng thái đơn hàng và PaymentStatus
            await pool
                .request()
                .input("OrderID", sql.Int, orderId)
                .query(`
                    UPDATE Orders
                    SET Status = 'Cancelled', PaymentStatus = 'Refunded', CancelReason = 'Hủy bởi admin sau khi phê duyệt yêu cầu'
                    WHERE OrderID = @OrderID
                `);

            console.log(`[Order.approveCancelRequest] Đã phê duyệt yêu cầu hủy RequestID: ${requestId} cho OrderID: ${orderId}`);
        } catch (error) {
            console.error("❌ Lỗi khi phê duyệt yêu cầu hủy:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Từ chối yêu cầu hủy đơn hàng (dành cho admin)
    static async rejectCancelRequest(requestId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("RequestID", sql.Int, requestId)
                .query(`
                    UPDATE CancelRequests
                    SET Status = 'Rejected'
                    WHERE RequestID = @RequestID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error(`Không tìm thấy yêu cầu hủy với RequestID: ${requestId}`);
            }
            console.log(`[Order.rejectCancelRequest] Đã từ chối yêu cầu hủy RequestID: ${requestId}`);
        } catch (error) {
            console.error("❌ Lỗi khi từ chối yêu cầu hủy:", { message: error.message, stack: error.stack });
            throw error;
        }
    }
}

module.exports = Order;