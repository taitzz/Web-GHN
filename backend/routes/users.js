const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const authMiddleware = require("../middleware/auth");
const { poolPromise } = require('../config/db'); 

const router = express.Router();

// API: Đăng ký người dùng
router.post('/register', async (req, res) => {
    const { fullName, email, phone, address, username, password, confirmPassword, birthDate } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !phone || !address || !username || !password || !confirmPassword || !birthDate) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu không khớp' });
    }

    // Kiểm tra định dạng ngày sinh
    if (isNaN(Date.parse(birthDate))) {
        return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
    }

    try {
        const pool = await poolPromise;

        // ✅ Kiểm tra Email đã tồn tại chưa
        const checkEmail = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT Email FROM Users WHERE Email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại! Vui lòng sử dụng email khác.' });
        }

        // ✅ Kiểm tra Username đã tồn tại chưa
        const checkUsername = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT Username FROM Users WHERE Username = @username');

        if (checkUsername.recordset.length > 0) {
            return res.status(400).json({ message: 'Tên tài khoản đã tồn tại! Vui lòng chọn tên khác.' });
        }

        // ✅ Kiểm tra số điện thoại đã tồn tại chưa
        const checkPhone = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .query('SELECT Phone FROM Users WHERE Phone = @phone');

        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ message: 'Số điện thoại đã tồn tại! Vui lòng nhập số khác.' });
        }

        // **Mã hóa mật khẩu**
        const hashedPassword = await bcrypt.hash(password, 10);

        // **Chuyển đổi ngày sinh sang định dạng YYYY-MM-DD**
        const formattedBirthDate = new Date(birthDate).toISOString().split("T")[0];

        // ✅ Thêm người dùng mới vào CSDL
        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('birthDate', sql.Date, formattedBirthDate)
            .query(`
                INSERT INTO Users (FullName, Email, Phone, Address, Username, Password, BirthDate)
                VALUES (@fullName, @email, @phone, @address, @username, @password, @birthDate)
            `);

        res.status(201).json({ message: '🎉 Đăng ký thành công!' });

    } catch (err) {
        console.error('❌ Lỗi khi đăng ký người dùng:', err);
        res.status(500).json({ message: 'Lỗi server! Vui lòng thử lại sau.' });
    }
});

// API: Đăng nhập người dùng
const jwt = require("jsonwebtoken");

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserID, FullName, Password, Email FROM Users WHERE Username = @username OR Email = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Đăng nhập thất bại, tài khoản hoặc mật khẩu không đúng!' });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // ✅ Tạo Token JWT với UserID thay vì id
        const token = jwt.sign(
            { UserID: user.UserID, fullName: user.FullName },
            process.env.JWT_SECRET
        );  

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,  
            user: {
                id: user.UserID,
                fullName: user.FullName,
                email: user.Email
            }
        });

    } catch (err) {
        console.error('❌ Lỗi khi đăng nhập người dùng:', err);
        res.status(500).json({ message: 'Lỗi server!' });
    }
});

// API kiểm tra tên tài khoản đã tồn tại chưa
router.post('/check-username', async (req, res) => {
    const { username } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserID FROM Users WHERE Username = @username');

        if (result.recordset.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (err) {
        console.error('❌ Lỗi kiểm tra tên tài khoản:', err);
        res.status(500).json({ message: 'Lỗi server!' });
    }
});

// API: Lấy danh sách người dùng (Chỉ Admin hoặc Người có quyền)
router.get('/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT UserID, FullName, Email, Phone, Address, Username, BirthDate FROM Users
        `);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ Lỗi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//API : Lấy thông tin người dùng
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const userId = req.user.id; 
        console.log("🔍 UserID từ token:", userId);

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT FullName FROM Users WHERE UserID = @userId');

        console.log("📢 Kết quả truy vấn:", result.recordset);

        if (result.recordset.length > 0) {
            res.status(200).json({ fullName: result.recordset[0].FullName });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
    } catch (err) {
        console.error("❌ Lỗi lấy thông tin người dùng:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

//API : Xóa người dùng theo ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await poolPromise; 
        let result = await pool
            .request()
            .input("UserID", sql.Int, id)
            .query("DELETE FROM Users WHERE UserID = @UserID");

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: "Người dùng đã bị xóa." });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
    } catch (err) {
        console.error("❌ Lỗi khi xóa người dùng:", err);
        res.status(500).json({ message: "Lỗi server." });
    }
});

// API gửi OTP nếu Username & Email hợp lệ
router.post("/forgot-password", async (req, res) => {
    const { username, email } = req.body;

    try {
        const pool = await poolPromise; 

        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .query("SELECT Email FROM Users WHERE Username = @username");

        if (!result.recordset.length || result.recordset[0].Email !== email) {
            return res.status(400).json({ message: "Tài khoản hoặc email không đúng!" });
        }

        // Tạo OTP 6 số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu OTP và thời gian hết hạn vào CSDL (thời gian hết hạn là 10 phút)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);  // Thời gian hết hạn 10 phút

        await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("otp", sql.NVarChar, otp)
            .input("otpExpires", sql.DateTime, otpExpires)
            .query("UPDATE Users SET OTP = @otp, OtpExpires = @otpExpires WHERE Username = @username");

        // Cấu hình gửi email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "taivu1602@gmail.com", 
                pass: "vhfx zwol vgsw usqr", 
            },
        });

        const mailOptions = {
            from: "taivu1602@gmail.com", 
            to: email,
            subject: "Mã OTP để đặt lại mật khẩu",
            text: `Mã OTP để lấy mật khẩu của bạn là: ${otp}`,
        };

        // Gửi email chứa mã OTP
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });

    } catch (error) {
        console.error("❌ Lỗi gửi OTP:", error);
        res.status(500).json({ message: "Lỗi server, thử lại sau!" });
    }
});

//API : Đổi mật khẩu
router.post("/reset-password", async (req, res) => {
    const { username, otp, newPassword } = req.body;

    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .query("SELECT OTP, OtpExpires FROM Users WHERE Username = @username");

        if (!result.recordset.length) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        const user = result.recordset[0];

        // Kiểm tra OTP và thời gian hết hạn
        if (user.OTP !== otp || new Date() > new Date(user.OtpExpires)) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu trong database và xóa OTP cùng với thời gian hết hạn
        await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("hashedPassword", sql.NVarChar, hashedPassword)
            .query("UPDATE Users SET Password = @hashedPassword, OTP = NULL, OtpExpires = NULL WHERE Username = @username");

        res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công!" });

    } catch (error) {
        console.error("❌ Lỗi đổi mật khẩu:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
    }
});

module.exports = router;
