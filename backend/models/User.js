const sql = require("mssql");
const { poolPromise } = require("../config/db");

class User {
    // Kiểm tra email đã tồn tại
    static async checkEmailExists(email) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("email", sql.NVarChar, email)
                .query("SELECT Email FROM Users WHERE Email = @email");
            return result.recordset.length > 0;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra email:", error);
            throw error;
        }
    }

    // Kiểm tra tên tài khoản đã tồn tại
    static async checkUsernameExists(username) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("username", sql.NVarChar, username)
                .query("SELECT Username FROM Users WHERE Username = @username");
            return result.recordset.length > 0;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra tên tài khoản:", error);
            throw error;
        }
    }

    // Kiểm tra số điện thoại đã tồn tại
    static async checkPhoneExists(phone) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("phone", sql.NVarChar, phone)
                .query("SELECT Phone FROM Users WHERE Phone = @phone");
            return result.recordset.length > 0;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra số điện thoại:", error);
            throw error;
        }
    }

    // Thêm người dùng mới vào database
    static async insertUser(fullName, email, phone, address, username, hashedPassword, birthDate) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("fullName", sql.NVarChar, fullName)
                .input("email", sql.NVarChar, email)
                .input("phone", sql.NVarChar, phone)
                .input("address", sql.NVarChar, address)
                .input("username", sql.NVarChar, username)
                .input("password", sql.NVarChar, hashedPassword)
                .input("birthDate", sql.Date, birthDate)
                .query(`
                    INSERT INTO Users (FullName, Email, Phone, Address, Username, Password, BirthDate)
                    VALUES (@fullName, @email, @phone, @address, @username, @password, @birthDate)
                `);
            console.log(`✅ Đã đăng ký người dùng: ${username}`);
        } catch (error) {
            console.error("❌ Lỗi khi lưu người dùng vào database:", error);
            throw error;
        }
    }

    // Lấy thông tin người dùng theo username hoặc email (dùng cho đăng nhập)
    static async getUserByUsernameOrEmail(username) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("username", sql.NVarChar, username)
                .query(`
                    SELECT UserID, FullName, Password, Email
                    FROM Users
                    WHERE Username = @username OR Email = @username
                `);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin người dùng:", error);
            throw error;
        }
    }

    // Lấy tất cả người dùng
    static async getAllUsers() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
            SELECT 
                UserID, FullName, BirthDate, Email, Phone, Address, Username
            FROM Users
        `);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách người dùng:", error.message);
            throw error;
        }
    }

    // Lấy thông tin người dùng theo UserID (dùng cho profile)
    static async getUserById(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("userId", sql.Int, userId)
                .query(`
                    SELECT FullName
                    FROM Users
                    WHERE UserID = @userId
                `);
            return result.recordset[0]; 
        } catch (error) {
            console.error("❌ Lỗi khi lấy tên người dùng theo ID:", error);
            throw error;
        }
    }

    // Kiểm tra xem người dùng có đơn hàng chưa hoàn thành không
    static async hasIncompleteOrders(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT COUNT(*) AS incompleteOrders
                    FROM Orders
                    WHERE UserID = @UserID
                    AND Status NOT IN ('Completed', 'Cancelled')  -- Coi Cancelled là hoàn thành
                `);
            return result.recordset[0].incompleteOrders > 0;
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra đơn hàng chưa hoàn thành:", error);
            throw error;
        }
    }

    // Xóa người dùng theo UserID
    static async deleteUser(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query("DELETE FROM Users WHERE UserID = @UserID");
            return result.rowsAffected[0];
        } catch (error) {
            console.error("❌ Lỗi khi xóa người dùng:", error);
            throw error;
        }
    }

    // Lấy thông tin người dùng theo username (dùng cho quên mật khẩu)
    static async getUserByUsername(username) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("username", sql.NVarChar, username)
                .query("SELECT Email, OTP, OtpExpires FROM Users WHERE Username = @username");
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin người dùng theo username:", error);
            throw error;
        }
    }

    // Cập nhật OTP và thời gian hết hạn OTP
    static async updateOtp(username, otp, otpExpires) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("username", sql.NVarChar, username)
                .input("otp", sql.NVarChar, otp)
                .input("otpExpires", sql.DateTime, otpExpires)
                .query(`
                    UPDATE Users
                    SET OTP = @otp, OtpExpires = @otpExpires
                    WHERE Username = @username
                `);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật OTP:", error);
            throw error;
        }
    }

    // Đổi mật khẩu và xóa OTP
    static async resetPassword(username, hashedPassword) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("username", sql.NVarChar, username)
                .input("hashedPassword", sql.NVarChar, hashedPassword)
                .query(`
                    UPDATE Users
                    SET Password = @hashedPassword, OTP = NULL, OtpExpires = NULL
                    WHERE Username = @username
                `);
        } catch (error) {
            console.error("❌ Lỗi khi đổi mật khẩu:", error);
            throw error;
        }
    }
}

module.exports = User;