const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const { poolPromise } = require('../config/db'); // Đảm bảo đã kết nối DB

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

        // Kiểm tra tài khoản hoặc email đã tồn tại chưa
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username OR Email = @username');
        
        if (result.recordset.length > 0) {
            return res.status(400).json({ message: 'Tài khoản hoặc email đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Chuyển đổi ngày sinh sang định dạng YYYY-MM-DD
        const formattedBirthDate = new Date(birthDate).toISOString().split("T")[0];

        // Lưu thông tin người dùng vào CSDL
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

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        console.error('Lỗi khi đăng ký người dùng: ', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// API: Đăng nhập người dùng
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username OR Email = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Tài khoản không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Nếu đăng nhập thành công
        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: {
                id: user.UserID,
                fullName: user.FullName,
                username: user.Username,
                email: user.Email,
                birthDate: user.BirthDate
            }
        });
    } catch (err) {
        console.error('Lỗi khi đăng nhập người dùng: ', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//API : Lấy thông tin người dùng
router.get('/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//API : Xóa người dùng theo ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
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

// API: Lấy thông tin người dùng (chỉ lấy FullName)
router.get('/profile', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Giả sử bạn đã xác thực người dùng thông qua token JWT, và có thông tin userID từ middleware
        const userId = req.user.id;

        const result = await pool.request()
            .input('userId', sql.Int, userId) // Lấy userId từ thông tin đã xác thực
            .query('SELECT FullName FROM Users WHERE UserID = @userId');
        
        if (result.recordset.length > 0) {
            res.status(200).json({ fullName: result.recordset[0].FullName });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
    } catch (err) {
        console.error('Lỗi lấy thông tin người dùng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API gửi OTP nếu Username & Email hợp lệ
router.post("/forgot-password", async (req, res) => {
    const { username, email } = req.body;

    try {
        const pool = await sql.connect();
        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .query("SELECT Email FROM Users WHERE Username = @username");

        if (!result.recordset.length || result.recordset[0].Email !== email) {
            return res.status(400).json({ message: "Tài khoản hoặc email không đúng!" });
        }

        // Tạo OTP 6 số ngẫu nhiên
        const otp = crypto.randomInt(100000, 999999).toString();

        // Lưu OTP vào SQL Server
        await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("otp", sql.NVarChar, otp)
            .query("UPDATE Users SET OTP = @otp WHERE Username = @username");

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
            to: email.Email,
            subject: "Mã OTP để đặt lại mật khẩu",
            text: `Mã OTP của bạn là: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });

    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(500).json({ message: "Lỗi server, thử lại sau!" });
    }
});

// API Đổi mật khẩu bằng OTP
router.post("/reset-password", async (req, res) => {
    const { username, otp, newPassword } = req.body;

    try {
        const pool = await sql.connect();
        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .query("SELECT OTP FROM Users WHERE Username = @username");

        if (!result.recordset.length || result.recordset[0].OTP !== otp) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ!" });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu và xóa OTP
        await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("hashedPassword", sql.NVarChar, hashedPassword)
            .query("UPDATE Users SET Password = @hashedPassword, OTP = NULL WHERE Username = @username");

        res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công!" });

    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        res.status(500).json({ message: "Lỗi server, thử lại sau!" });
    }
});

module.exports = router;
