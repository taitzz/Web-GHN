const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class UserController {
    // Đăng ký người dùng
    static async register(req, res) {
        const { fullName, email, phone, address, username, password, confirmPassword, birthDate } = req.body;

        if (!fullName || !email || !phone || !address || !username || !password || !confirmPassword || !birthDate) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }

        if (isNaN(Date.parse(birthDate))) {
            return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
        }

        try {
            const emailExists = await User.checkEmailExists(email);
            if (emailExists) {
                return res.status(400).json({ message: "Email đã tồn tại!" });
            }

            const usernameExists = await User.checkUsernameExists(username);
            if (usernameExists) {
                return res.status(400).json({ message: "Tên tài khoản đã tồn tại!" });
            }

            const phoneExists = await User.checkPhoneExists(phone);
            if (phoneExists) {
                return res.status(400).json({ message: "Số điện thoại đã tồn tại!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const formattedBirthDate = new Date(birthDate).toISOString().split("T")[0];

            await User.insertUser(fullName, email, phone, address, username, hashedPassword, formattedBirthDate);
            res.status(201).json({ message: "🎉 Đăng ký thành công!" });
        } catch (err) {
            console.error("❌ Lỗi khi đăng ký người dùng:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    // Kiểm tra tên tài khoản
    static async checkUsername(req, res) {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên tài khoản!" });
        }

        try {
            const exists = await User.checkUsernameExists(username);
            res.status(200).json({ exists });
        } catch (err) {
            console.error("❌ Lỗi kiểm tra tên tài khoản:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    // Đăng nhập người dùng
    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
        }

        try {
            const user = await User.getUserByUsernameOrEmail(username);
            if (!user) {
                return res.status(400).json({ message: "Đăng nhập thất bại, tài khoản hoặc mật khẩu không đúng!" });
            }

            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không đúng" });
            }

            const token = jwt.sign(
                { UserID: user.UserID, fullName: user.FullName, role: "user" },
                process.env.JWT_SECRET || "your_jwt_secret",
                { expiresIn: "1h" }
            );

            console.log(`Đã đăng nhập người dùng: ${username}, UserID: ${user.UserID}, Token: ${token}`);
            res.status(200).json({
                message: "Đăng nhập thành công",
                token,
                user: { id: user.UserID, fullName: user.FullName, email: user.Email },
            });
        } catch (err) {
            console.error("❌ Lỗi khi đăng nhập người dùng:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    // Lấy danh sách người dùng
    static async getUsers(req, res) {
        try {
            const users = await User.getAllUsers();
            res.status(200).json(users);
        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách người dùng:", err.message);
            res.status(500).json({ message: "Không thể lấy danh sách người dùng!" });
        }
}
    // Lấy tên người dùng
    static async getProfile(req, res) {
        try {
            const userId = req.user?.UserID;
            if (!userId) {
                return res.status(401).json({ message: "❌ Không tìm thấy UserID trong token!" });
            }

            const user = await User.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }

            console.log(`Đã lấy tên người dùng UserID: ${userId}`);
            res.status(200).json({ fullName: user.FullName }); // Chỉ trả về FullName
        } catch (err) {
            console.error("❌ Lỗi lấy tên người dùng:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    // Xóa người dùng
    static async deleteUser(req, res) {
        const { id } = req.params;
    
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: "ID người dùng không hợp lệ!" });
        }
    
        try {
            // Kiểm tra xem người dùng có đơn hàng chưa hoàn thành không
            const hasIncompleteOrders = await User.hasIncompleteOrders(id);
            if (hasIncompleteOrders) {
                return res.status(403).json({
                    message: "Không thể xóa người dùng vì họ có đơn hàng chưa hoàn thành!",
                });
            }
    
            const rowsAffected = await User.deleteUser(id);
            if (rowsAffected === 0) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }
    
            console.log(`Đã xóa người dùng UserID: ${id}`);
            res.status(200).json({ message: "Người dùng đã bị xóa." });
        } catch (err) {
            console.error("❌ Lỗi khi xóa người dùng:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server khi xóa người dùng!" });
        }
    }

    // Gửi OTP cho quên mật khẩu
    static async forgotPassword(req, res) {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: "Vui lòng cung cấp tài khoản và email!" });
        }

        try {
            const user = await User.getUserByUsername(username);
            if (!user || user.Email !== email) {
                return res.status(400).json({ message: "Tài khoản hoặc email không đúng!" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

            await User.updateOtp(username, otp, otpExpires);

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: "taivu1602@gmail.com", pass: "vhfx zwol vgsw usqr" },
            });

            const mailOptions = {
                from: "taivu1602@gmail.com",
                to: email,
                subject: "Mã OTP để đặt lại mật khẩu",
                text: `Mã OTP để lấy lại mật khẩu của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Đã gửi OTP đến ${email} cho username: ${username}`);
            res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });
        } catch (err) {
            console.error("❌ Lỗi gửi OTP:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server, thử lại sau!" });
        }
    }

    // Đổi mật khẩu bằng OTP
    static async resetPassword(req, res) {
        const { username, otp, newPassword } = req.body;

        if (!username || !otp || !newPassword) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
        }

        try {
            const user = await User.getUserByUsername(username);
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" });
            }

            if (user.OTP !== otp || new Date() > new Date(user.OtpExpires)) {
                return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.resetPassword(username, hashedPassword);

            console.log(`Đã đổi mật khẩu cho username: ${username}`);
            res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công!" });
        } catch (err) {
            console.error("❌ Lỗi đổi mật khẩu:", { message: err.message, stack: err.stack });
            res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
        }
    }
}

module.exports = UserController;