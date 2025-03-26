const sql = require("mssql");
const { poolPromise } = require("../config/db");

class Admin {
    // Lấy thông tin admin theo username (dùng cho đăng nhập)
    static async getAdminByUsername(username) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("Username", sql.NVarChar, username)
                .query("SELECT AdminID, Username, Password FROM Admin WHERE Username = @Username");
            console.log(`[Admin.getAdminByUsername] Lấy thông tin admin Username: ${username}, Kết quả: ${result.recordset[0] ? "Tìm thấy" : "Không tìm thấy"}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin admin:", { message: error.message, stack: error.stack });
            throw error;
        }
    }
}

module.exports = Admin;