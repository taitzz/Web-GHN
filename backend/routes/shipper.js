const express = require("express");
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const { getPendingShippers, approveShipper, deleteShipper, insertShipper } = require("../models/shipperModel");
const { poolPromise } = require("../config/db");
const nodemailer = require("nodemailer");

const router = express.Router();

// API: Lấy danh sách shipper chờ duyệt
router.get("/shipper-requests", async (req, res) => {
    try {
        const shippers = await getPendingShippers();
        res.json(shippers);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Lấy thông tin chi tiết shipper (có CCCD & GPLX)
router.get("/shipper-details/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM Shipper WHERE ShipperID = @id");

        const shipper = result.recordset[0];
        if (!shipper) {
            return res.status(404).json({ message: "Shipper không tồn tại!" });
        }

        res.json(shipper);
    } catch (err) {
        console.error("❌ Lỗi khi lấy chi tiết shipper:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Đăng ký shipper (có CCCD & GPLX)
router.post("/register", async (req, res) => {
    const { fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense } = req.body;

    if (!fullName || !birthDate || !permanentAddress || !currentAddress || !phoneNumber || !email || !cccd || !driverLicense) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }

    // Kiểm tra CCCD (12 số)
    if (!/^\d{12}$/.test(cccd)) {
        return res.status(400).json({ message: "Số CCCD phải có đúng 12 chữ số." });
    }

    // Kiểm tra GPLX (12 số)
    if (!/^\d{12}$/.test(driverLicense)) {
        return res.status(400).json({ message: "Số giấy phép lái xe phải có đúng 12 chữ số." });
    }

    try {
        await insertShipper(fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense);
        res.status(201).json({ message: "Đăng kí thành công!Chờ duyệt từ chủ cửa hàng." });
    } catch (err) {
        console.error("❌ Lỗi khi đăng ký shipper:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Đăng nhập shipper
router.post("/login", async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        // Kiểm tra mã nhân viên trong database
        const pool = await poolPromise;
        const result = await pool.request()
            .input("employeeId", sql.NVarChar, employeeId)
            .query("SELECT * FROM Shipper WHERE EmployeeID = @employeeId");

        const shipper = result.recordset[0]; // Lấy shipper đầu tiên

        if (!shipper) {
            return res.status(400).json({ success: false, message: "Tài khoản không tồn tại" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, shipper.Password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Sai mật khẩu" });
        }

        // Nếu đăng nhập thành công
        res.json({ success: true, message: "Đăng nhập thành công" });
    } catch (err) {
        console.error("Lỗi khi đăng nhập:", err);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// API: Xóa shipper khỏi database
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID không hợp lệ" });
    }

    try {
        await deleteShipper(id);
        res.json({ message: "Shipper đã bị xóa khỏi database!" });
    } catch (err) {
        console.error("❌ Lỗi khi xóa shipper:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Duyệt shipper & Gửi email (có CCCD & GPLX)
router.put("/approve/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM Shipper WHERE ShipperID = @id");

        const shipper = result.recordset[0];
        if (!shipper) {
            return res.status(400).json({ message: "Shipper không tồn tại!" });
        }

        const employeeID = `SP${String(shipper.ShipperID).padStart(4, '0')}`;
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        await approveShipper(id, employeeID, hashedPassword);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "taivu1602@gmail.com",
                pass: "vhfx zwol vgsw usqr",
            },
        });

        const mailOptions = {
            from: "taivu1602@gmail.com",
            to: shipper.Email,
            subject: "Đăng ký thành công - GIAO HÀNG NHANH",
            text: `Chào mừng bạn đến với GIAO HÀNG NHANH!\n\n` +
                  `- Tài khoản: ${employeeID}\n` +
                  `- Mật khẩu: ${generatedPassword}\n` +                
                  `⚠️ Lưu ý: Không cung cấp thông tin này cho bất kỳ ai.\n` +
                  `Cảm ơn bạn đã tham gia! 🚀`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Lỗi khi gửi email:", err);
                return res.status(500).json({ message: "Lỗi khi gửi email" });
            }
            console.log("Email đã được gửi:", info.response);
        });

        res.json({ message: "Shipper đã được duyệt và thông tin tài khoản đã được gửi qua email" });
    } catch (err) {
        console.error("❌ Lỗi khi duyệt shipper:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Lấy danh sách shipper đã duyệt (có CCCD & GPLX)
router.get("/approved-shippers", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Shipper WHERE Status = 'Approved'");

        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách shipper đã duyệt:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;
