const sql = require("mssql");
const poolPromise = require("../config/db").poolPromise;

class Shipper {
    // Lấy danh sách shipper chờ duyệt
    static async getPendingShippers() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    ShipperID AS id, 
                    FullName AS fullName, 
                    BirthDate AS birthDate,
                    PermanentAddress AS permanentAddress, 
                    CurrentAddress AS currentAddress,
                    Phone AS phoneNumber,
                    Email AS email, 
                    CCCD AS cccd,
                    DriverLicense AS driverLicense,
                    Status AS status
                FROM Shipper WHERE Status = 'Pending'
            `);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách shipper:", error);
            throw error;
        }
    }

    // Thêm shipper mới vào database (có CCCD và giấy phép lái xe)
    static async insertShipper(fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("FullName", sql.NVarChar, fullName)
                .input("BirthDate", sql.Date, birthDate)
                .input("PermanentAddress", sql.NVarChar, permanentAddress)
                .input("CurrentAddress", sql.NVarChar, currentAddress)
                .input("Phone", sql.NVarChar, phoneNumber)
                .input("Email", sql.NVarChar, email)
                .input("CCCD", sql.NVarChar, cccd)
                .input("DriverLicense", sql.NVarChar, driverLicense)
                .input("Status", sql.NVarChar, "Pending")  // Mặc định trạng thái là "Pending"
                .query(`
                INSERT INTO Shipper (FullName, BirthDate, PermanentAddress, CurrentAddress, Phone, Email, CCCD, DriverLicense, Status)
                VALUES (@FullName, @BirthDate, @PermanentAddress, @CurrentAddress, @Phone, @Email, @CCCD, @DriverLicense, @Status)
            `);
            console.log("✅ Dữ liệu shipper đã được lưu vào database");
        } catch (error) {
            console.error("❌ Lỗi khi lưu shipper vào database:", error);
            throw error;
        }
    }

    // Duyệt shipper và cập nhật thông tin tài khoản
    static async approveShipper(id, employeeID, hashedPassword) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("id", sql.Int, id)
                .input("employeeID", sql.NVarChar, employeeID)
                .input("hashedPassword", sql.NVarChar, hashedPassword)
                .query(`
                UPDATE Shipper
                SET Status = 'Approved', EmployeeID = @employeeID, Password = @hashedPassword
                WHERE ShipperID = @id
            `);
        } catch (error) {
            console.error("❌ Lỗi khi duyệt shipper:", error);
            throw error;
        }
    }

    // Từ chối shipper
    static async rejectShipper(id) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("id", sql.Int, id)
                .query("UPDATE Shipper SET Status = 'Rejected' WHERE ShipperID = @id");
        } catch (error) {
            console.error("❌ Lỗi khi từ chối shipper:", error);
            throw error;
        }
    }

    // Xóa shipper khỏi database
    static async deleteShipper(id) {
        try {
            console.log("Đang xóa shipper với ID:", id);
            const pool = await poolPromise;
            await pool.request()
                .input("id", sql.Int, id)
                .query("DELETE FROM Shipper WHERE ShipperID = @id");

            console.log("✅ Xóa shipper thành công");
        } catch (error) {
            console.error("❌ Lỗi khi xóa shipper:", error);
            throw error;
        }
    }
}

module.exports = Shipper;
