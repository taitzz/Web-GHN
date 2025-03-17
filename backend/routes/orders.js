const express = require("express");
const { sql, poolPromise } = require("../config/db");
const router = express.Router();

// Lấy danh sách đơn hàng
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.UserID;
        if (!userId) {
            return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token. Vui lòng đăng nhập lại!" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("UserID", sql.Int, userId)
            .query(`
                SELECT OrderID, SenderName, ReceiverName, CreatedDate, Status
                FROM Orders
                WHERE UserID = @UserID
                ORDER BY CreatedDate DESC
            `);

        res.json(result.recordset || []);
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng!" });
    }
});

// Lấy chi tiết đơn hàng theo OrderID
router.get("/:orderId", async (req, res) => {
    try {
        const userId = req.user?.UserID;
        if (!userId) {
            return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token. Vui lòng đăng nhập lại!" });
        }

        const orderId = req.params.orderId;
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("OrderID", sql.Int, orderId)
            .input("UserID", sql.Int, userId)
            .query(`
                SELECT OrderID, SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
                       Weight, Volume, Distance, DeliveryType, TotalCost, Status, CreatedDate, ItemName
                FROM Orders
                WHERE OrderID = @OrderID AND UserID = @UserID
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng!" });
    }
});

// Tạo đơn hàng
router.post("/", async (req, res) => {
    try {
        const userId = req.user?.UserID;
        if (!userId) {
            return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token. Vui lòng đăng nhập lại!" });
        }

        const {
            senderName, senderPhone, senderAddress, receiverName, receiverPhone, receiverAddress,
            weight, volume, distance, deliveryType, totalCost, itemName
        } = req.body;

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("UserID", sql.Int, userId)
            .input("SenderName", sql.NVarChar, senderName)
            .input("SenderPhone", sql.NVarChar, senderPhone || null)
            .input("SenderAddress", sql.NVarChar, senderAddress)
            .input("ReceiverName", sql.NVarChar, receiverName)
            .input("ReceiverPhone", sql.NVarChar, receiverPhone || null)
            .input("ReceiverAddress", sql.NVarChar, receiverAddress)
            .input("Weight", sql.Decimal(10, 2), weight)
            .input("Volume", sql.Decimal(15, 2), volume)
            .input("Distance", sql.Decimal(10, 2), distance)
            .input("DeliveryType", sql.NVarChar, deliveryType)
            .input("TotalCost", sql.Decimal(15, 2), totalCost)
            .input("ItemName", sql.NVarChar, itemName || null)
            .query(`
                INSERT INTO Orders (UserID, SenderName, SenderPhone, SenderAddress, ReceiverName, ReceiverPhone, ReceiverAddress,
                                   Weight, Volume, Distance, DeliveryType, TotalCost, ItemName)
                VALUES (@UserID, @SenderName, @SenderPhone, @SenderAddress, @ReceiverName, @ReceiverPhone, @ReceiverAddress,
                        @Weight, @Volume, @Distance, @DeliveryType, @TotalCost, @ItemName);
                SELECT SCOPE_IDENTITY() AS OrderID;
            `);

        res.status(201).json({ orderId: result.recordset[0].OrderID, message: "✅ Đơn hàng đã được tạo thành công!" });
    } catch (err) {
        console.error("❌ Lỗi tạo đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server khi tạo đơn hàng!" });
    }
});

module.exports = router;