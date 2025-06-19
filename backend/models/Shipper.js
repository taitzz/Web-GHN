const sql = require("mssql");
const { poolPromise } = require("../config/db");
const transporter = require("../config/emailConfig");
const Order = require("../models/Orders");

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
                FROM Shipper 
                WHERE Status = 'Pending'
            `);
            console.log(`[Shipper.getPendingShippers] Lấy danh sách shipper chờ duyệt: ${result.recordset.length} shipper`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách shipper:", error);
            throw error;
        }
    }

    // Thêm shipper mới vào database 
    static async insertShipper(fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense, workAreas) {
        try {
            if (!fullName || !email || !cccd || !driverLicense) {
                throw new Error("FullName, Email, CCCD và DriverLicense là bắt buộc!");
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Email không hợp lệ!");
            }
    
            const pool = await poolPromise;
    
            const existingCCCD = await pool
                .request()
                .input("CCCD", sql.NVarChar, cccd)
                .query("SELECT * FROM Shipper WHERE CCCD = @CCCD");
            if (existingCCCD.recordset.length > 0) {
                throw new Error("CCCD đã tồn tại!");
            }
    
            const existingDriverLicense = await pool
                .request()
                .input("DriverLicense", sql.NVarChar, driverLicense)
                .query("SELECT * FROM Shipper WHERE DriverLicense = @DriverLicense");
            if (existingDriverLicense.recordset.length > 0) {
                throw new Error("Số giấy phép lái xe đã tồn tại!");
            }
    
            // Lưu WorkAreas dưới dạng chuỗi thuần
            const workAreasPlain = workAreas ? workAreas.trim() : null;
    
            const result = await pool
                .request()
                .input("FullName", sql.NVarChar, fullName)
                .input("BirthDate", sql.Date, birthDate)
                .input("PermanentAddress", sql.NVarChar, permanentAddress)
                .input("CurrentAddress", sql.NVarChar, currentAddress)
                .input("Phone", sql.NVarChar, phoneNumber)
                .input("Email", sql.NVarChar, email)
                .input("CCCD", sql.NVarChar, cccd)
                .input("DriverLicense", sql.NVarChar, driverLicense)
                .input("Status", sql.NVarChar, "Pending")
                .input("WorkAreas", sql.NVarChar(sql.MAX), workAreasPlain)
                .query(`
                    INSERT INTO Shipper (FullName, BirthDate, PermanentAddress, CurrentAddress, Phone, Email, CCCD, DriverLicense, Status, WorkAreas)
                    OUTPUT INSERTED.ShipperID
                    VALUES (@FullName, @BirthDate, @PermanentAddress, @CurrentAddress, @Phone, @Email, @CCCD, @DriverLicense, @Status, @WorkAreas)
                `);
            const shipperId = result.recordset[0].ShipperID;
            console.log(`[Shipper.insertShipper] Đã tạo shipper mới ShipperID: ${shipperId}`);
            return shipperId;
        } catch (error) {
            console.error("❌ Lỗi khi lưu shipper vào database:", error);
            throw error;
        }
    }

    // Duyệt shipper và gửi email thông báo
    static async approveShipper(id) {
        try {
            const pool = await poolPromise;
            // Kiểm tra shipper có tồn tại không
            const shipper = await Shipper.getShipperById(id);
            if (!shipper) {
                throw new Error("Shipper không tồn tại!");
            }
            if (!shipper.Email) {
                throw new Error("Shipper không có email để gửi thông báo!");
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(shipper.Email)) {
                throw new Error("Email của shipper không hợp lệ!");
            }

            // Tạo EmployeeID tự động (SHIPPER + ShipperID)
            const employeeID = `SHIPPER${id}`;
            // Tạo mật khẩu plain text (không mã hóa)
            const password = `shipper${id}123`;

            // Cập nhật thông tin shipper trong database
            const updateResult = await pool.request()
                .input("id", sql.Int, id)
                .input("employeeID", sql.NVarChar, employeeID)
                .input("password", sql.NVarChar, password)
                .query(`
                    UPDATE Shipper
                    SET Status = 'Approved', EmployeeID = @employeeID, Password = @password
                    WHERE ShipperID = @id
                `);
            if (updateResult.rowsAffected[0] === 0) {
                throw new Error("Không thể duyệt shipper!");
            }

            // Gửi email thông báo cho shipper
            try {
                const mailOptions = {
                    from: "taivu1602@gmail.com",
                    to: shipper.Email,
                    subject: "Thông tin tài khoản Shipper của bạn",
                    html: `
                        <h2>Xin chào ${shipper.FullName},</h2>
                        <p>Chúc mừng bạn đã được duyệt làm shipper!</p>
                        <p>Dưới đây là thông tin tài khoản của bạn:</p>
                        <ul>
                            <li><strong>Tài khoản :</strong> ${employeeID}</li>
                            <li><strong>Mật khẩu:</strong> ${password}</li>
                        </ul>
                        <p>Vui lòng đăng nhập và không cung cấp thông tin cho người khác.</p>
                        <p>Trân trọng,<br/>Đội ngũ quản lý</p>
                    `,
                };
                await transporter.sendMail(mailOptions);
                console.log(`[Shipper.approveShipper] Đã gửi email cho ShipperID: ${id}, Email: ${shipper.Email}`);
            } catch (emailError) {
                console.error(`[Shipper.approveShipper] Lỗi khi gửi email cho ShipperID: ${id}:`, emailError);
                // Không throw error để đảm bảo shipper vẫn được duyệt
            }

            console.log(`[Shipper.approveShipper] Đã duyệt ShipperID: ${id}, EmployeeID: ${employeeID}`);
        } catch (error) {
            console.error("❌ Lỗi khi duyệt shipper:", error);
            throw error;
        }
    }

    // Từ chối shipper
    static async rejectShipper(id) {
        try {
            const pool = await poolPromise;
            const shipper = await Shipper.getShipperById(id);
            if (!shipper) {
                throw new Error("Shipper không tồn tại!");
            }
            const result = await pool.request()
                .input("id", sql.Int, id)
                .query("UPDATE Shipper SET Status = 'Rejected' WHERE ShipperID = @id");
            if (result.rowsAffected[0] === 0) {
                throw new Error("Không thể từ chối shipper!");
            }
            console.log(`[Shipper.rejectShipper] Đã từ chối ShipperID: ${id}`);
        } catch (error) {
            console.error("❌ Lỗi khi từ chối shipper:", error);
            throw error;
        }
    }

    // Xóa shipper khỏi database
    static async deleteShipper(id) {
        try {
            const pool = await poolPromise;
            const shipper = await Shipper.getShipperById(id);
            if (!shipper) {
                throw new Error("Shipper không tồn tại!");
            }
            // Kiểm tra xem shipper có đang xử lý đơn hàng không
            const orders = await pool.request()
                .input("ShipperID", sql.Int, id)
                .query("SELECT * FROM Orders WHERE ShipperID = @ShipperID AND Status NOT IN ('Completed', 'Cancelled')");
            if (orders.recordset.length > 0) {
                throw new Error("Shipper đang xử lý đơn hàng, không thể xóa!");
            }

            const result = await pool.request()
                .input("id", sql.Int, id)
                .query("DELETE FROM Shipper WHERE ShipperID = @id");
            if (result.rowsAffected[0] === 0) {
                throw new Error("Không thể xóa shipper!");
            }
            console.log(`[Shipper.deleteShipper] Đã xóa ShipperID: ${id}`);
        } catch (error) {
            console.error("❌ Lỗi khi xóa shipper:", error);
            throw error;
        }
    }

    // Thêm shipper cho admin
    static async insertAndApproveShipper(fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense, workAreas) {
        try {
            if (!fullName || !email || !cccd || !driverLicense) {
                throw new Error("FullName, Email, CCCD và DriverLicense là bắt buộc!");
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Email không hợp lệ!");
            }
    
            const pool = await poolPromise;
    
            const existingCCCD = await pool
                .request()
                .input("CCCD", sql.NVarChar, cccd)
                .query("SELECT * FROM Shipper WHERE CCCD = @CCCD");
            if (existingCCCD.recordset.length > 0) {
                throw new Error("CCCD đã tồn tại!");
            }
    
            const existingDriverLicense = await pool
                .request()
                .input("DriverLicense", sql.NVarChar, driverLicense)
                .query("SELECT * FROM Shipper WHERE DriverLicense = @DriverLicense");
            if (existingDriverLicense.recordset.length > 0) {
                throw new Error("Số giấy phép lái xe đã tồn tại!");
            }
    
            const existingEmail = await pool
                .request()
                .input("Email", sql.NVarChar, email)
                .query("SELECT * FROM Shipper WHERE Email = @Email");
            if (existingEmail.recordset.length > 0) {
                throw new Error("Email đã tồn tại!");
            }
    
            const workAreasPlain = workAreas ? workAreas.trim() : null;
    
            const result = await pool
                .request()
                .input("FullName", sql.NVarChar, fullName)
                .input("BirthDate", sql.Date, birthDate)
                .input("PermanentAddress", sql.NVarChar, permanentAddress)
                .input("CurrentAddress", sql.NVarChar, currentAddress)
                .input("Phone", sql.NVarChar, phoneNumber)
                .input("Email", sql.NVarChar, email)
                .input("CCCD", sql.NVarChar, cccd)
                .input("DriverLicense", sql.NVarChar, driverLicense)
                .input("Status", sql.NVarChar, "Approved")
                .input("WorkAreas", sql.NVarChar(sql.MAX), workAreasPlain)
                .query(`
                    INSERT INTO Shipper (FullName, BirthDate, PermanentAddress, CurrentAddress, Phone, Email, CCCD, DriverLicense, Status, WorkAreas)
                    OUTPUT INSERTED.ShipperID
                    VALUES (@FullName, @BirthDate, @PermanentAddress, @CurrentAddress, @Phone, @Email, @CCCD, @DriverLicense, @Status, @WorkAreas)
                `);
    
            const shipperId = result.recordset[0].ShipperID;
    
            const employeeID = `SHIPPER${shipperId}`;
            const password = `shipper${shipperId}123`;
    
            await pool
                .request()
                .input("ShipperID", sql.Int, shipperId)
                .input("EmployeeID", sql.NVarChar, employeeID)
                .input("Password", sql.NVarChar, password)
                .query(`
                    UPDATE Shipper
                    SET EmployeeID = @EmployeeID, Password = @Password
                    WHERE ShipperID = @ShipperID
                `);
    
            try {
                const mailOptions = {
                    from: "taivu1602@gmail.com",
                    to: email,
                    subject: "Thông tin tài khoản Shipper của bạn",
                    html: `
                        <h2>Xin chào ${fullName},</h2>
                        <p>Chúc mừng bạn đã được duyệt làm shipper!</p>
                        <p>Dưới đây là thông tin tài khoản của bạn:</p>
                        <ul>
                            <li><strong>Tài khoản:</strong> ${employeeID}</li>
                            <li><strong>Mật khẩu:</strong> ${password}</li>
                        </ul>
                        <p>Vui lòng đăng nhập và không cung cấp thông tin cho người khác.</p>
                        <p>Trân trọng,<br/>Đội ngũ quản lý</p>
                    `,
                };
                await transporter.sendMail(mailOptions);
                console.log(`[Shipper.insertAndApproveShipper] Đã gửi email cho ShipperID: ${shipperId}`);
            } catch (emailError) {
                console.error(`[Shipper.insertAndApproveShipper] Lỗi khi gửi email cho ShipperID: ${shipperId}:`, emailError);
            }
    
            // Gán shipper mới cho đơn hàng chưa có shipper
            await Order.assignShipperToPendingOrders(workAreasPlain);
    
            console.log(`[Shipper.insertAndApproveShipper] Đã tạo và duyệt shipper ShipperID: ${shipperId}, EmployeeID: ${employeeID}`);
            return shipperId;
        } catch (error) {
            console.error("❌ Lỗi khi tạo và duyệt shipper:", error);
            throw error;
        }
    }

    // Cập nhật shipper cho admin
    static async updateShipper(id, fullName, birthDate, permanentAddress, currentAddress, phoneNumber, email, cccd, driverLicense, workAreas) {
        try {
            const pool = await poolPromise;
    
            const shipper = await Shipper.getShipperById(id);
            if (!shipper) {
                throw new Error("Shipper không tồn tại!");
            }
    
            if (!fullName || !email || !cccd || !driverLicense) {
                throw new Error("FullName, Email, CCCD và DriverLicense là bắt buộc!");
            }
    
            const cleanedCCCD = cccd.trim();
            const cleanedDriverLicense = driverLicense.trim();
    
            const existingCCCD = await pool
                .request()
                .input("CCCD", sql.NVarChar, cleanedCCCD)
                .input("ShipperID", sql.Int, id)
                .query("SELECT * FROM Shipper WHERE TRIM(CCCD) = @CCCD AND ShipperID != @ShipperID");
            if (existingCCCD.recordset.length > 0) {
                throw new Error("CCCD đã tồn tại!");
            }
    
            const existingDriverLicense = await pool
                .request()
                .input("DriverLicense", sql.NVarChar, cleanedDriverLicense)
                .input("ShipperID", sql.Int, id)
                .query("SELECT * FROM Shipper WHERE TRIM(DriverLicense) = @DriverLicense AND ShipperID != @ShipperID");
            if (existingDriverLicense.recordset.length > 0) {
                throw new Error("Số giấy phép lái xe đã tồn tại!");
            }
    
            // Lưu WorkAreas dưới dạng chuỗi thuần
        const workAreasPlain = workAreas ? workAreas.trim() : null;

        const result = await pool
            .request()
            .input("ShipperID", sql.Int, id)
            .input("FullName", sql.NVarChar, fullName)
            .input("BirthDate", sql.Date, birthDate)
            .input("PermanentAddress", sql.NVarChar, permanentAddress)
            .input("CurrentAddress", sql.NVarChar, currentAddress)
            .input("Phone", sql.NVarChar, phoneNumber)
            .input("Email", sql.NVarChar, email)
            .input("CCCD", sql.NVarChar, cleanedCCCD)
            .input("DriverLicense", sql.NVarChar, cleanedDriverLicense)
            .input("WorkAreas", sql.NVarChar(sql.MAX), workAreasPlain)
            .query(`
                UPDATE Shipper
                SET FullName = @FullName,
                    BirthDate = @BirthDate,
                    PermanentAddress = @PermanentAddress,
                    CurrentAddress = @CurrentAddress,
                    Phone = @Phone,
                    Email = @Email,
                    CCCD = @CCCD,
                    DriverLicense = @DriverLicense,
                    WorkAreas = @WorkAreas
                WHERE ShipperID = @ShipperID
            `);
    
            if (result.rowsAffected[0] === 0) {
                throw new Error("Không thể cập nhật shipper!");
            }
    
            console.log(`[Shipper.updateShipper] Đã cập nhật ShipperID: ${id}`);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật shipper:", error);
            throw error;
        }
    }

    // Lấy chi tiết shipper theo ID
    static async getShipperById(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error("ShipperID không hợp lệ!");
            }
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("id", sql.Int, id)
                .query("SELECT * FROM Shipper WHERE ShipperID = @id");
            if (!result.recordset[0]) {
                throw new Error("Shipper không tồn tại!");
            }
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy chi tiết shipper:", error);
            throw error;
        }
    }

    // Lấy shipper theo EmployeeID (dùng cho đăng nhập)
    static async getShipperByEmployeeId(employeeId) {
        try {
            if (!employeeId) {
                throw new Error("EmployeeID không được để trống!");
            }
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("employeeId", sql.NVarChar, employeeId)
                .query("SELECT * FROM Shipper WHERE EmployeeID = @employeeId");
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy shipper theo EmployeeID:", error);
            throw error;
        }
    }

    // Lấy shipper theo Email (dùng để kiểm tra email đã tồn tại)
    static async getShipperByEmail(email) {
        try {
            if (!email) {
                throw new Error("Email không được để trống!");
            }
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("email", sql.NVarChar, email)
                .query("SELECT * FROM Shipper WHERE Email = @email");
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy shipper theo Email:", error);
            throw error;
        }
    }

    // Kiểm tra email trùng lặp (phương thức mới)
    static async checkEmailExists(email) {
        try {
            if (!email) {
                throw new Error("Email không được để trống!");
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Định dạng email không hợp lệ!");
            }

            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("email", sql.NVarChar, email)
                .query("SELECT * FROM Shipper WHERE Email = @email");

            return result.recordset.length > 0; // Trả về true nếu email đã tồn tại
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra email trùng lặp:", error);
            throw error;
        }
    }

    // Lấy danh sách shipper đã duyệt
    static async getApprovedShippers() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query("SELECT * FROM Shipper WHERE Status = 'Approved'");
            console.log(`[Shipper.getApprovedShippers] Lấy danh sách shipper đã duyệt: ${result.recordset.length} shipper`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách shipper đã duyệt:", error);
            throw error;
        }
    }

    // Lấy danh sách shipper sẵn sàng
    static async getAvailableShippers() {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .query(`
                    SELECT ShipperID, FullName AS Name, Email
                    FROM Shipper
                    WHERE IsAvailable = 1 AND Status = 'Approved'
                `);
            console.log(`[Shipper.getAvailableShippers] Lấy danh sách shipper sẵn sàng: ${result.recordset.length} shipper`);
            return result.recordset || [];
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách shipper sẵn sàng:", error);
            throw error;
        }
    }

    // Cập nhật trạng thái khả dụng của shipper
    static async updateShipperAvailability(shipperId, isAvailable) {
        try {
            const pool = await poolPromise;

            // Lấy WorkAreas trước khi cập nhật
            const workAreasResult = await pool
                .request()
                .input("ShipperID", sql.Int, shipperId)
                .query(`
                    SELECT WorkAreas
                    FROM Shipper
                    WHERE ShipperID = @ShipperID
                `);

            if (workAreasResult.recordset.length === 0) {
                throw new Error("Không tìm thấy shipper!");
            }

            const workAreas = workAreasResult.recordset[0].WorkAreas;

            // Cập nhật trạng thái IsAvailable
            const result = await pool
                .request()
                .input("ShipperID", sql.Int, shipperId)
                .input("IsAvailable", sql.Bit, isAvailable)
                .query(`
                    UPDATE Shipper
                    SET IsAvailable = @IsAvailable
                    WHERE ShipperID = @ShipperID
                `);

            if (result.rowsAffected[0] === 0) {
                throw new Error("Không tìm thấy shipper để cập nhật!");
            }

            // Nếu shipper trở thành khả dụng, gán cho các đơn hàng Approved chưa có shipper
            if (isAvailable) {
                const orders = await Order.getApprovedOrdersWithoutShipper();
                for (const order of orders) {
                    const senderProvince = order.SenderAddress.split(",").pop().trim();
                    if (workAreas.includes(senderProvince)) {
                        await Order.assignShipper(order.OrderID, shipperId);
                        await Order.createShipperAssignment(order.OrderID, shipperId);
                        await Order.updateOrderStatus(order.OrderID, "Shipping");
                        await Shipper.updateShipperAvailability(shipperId, false); // Đặt lại thành không khả dụng
                        console.log(`[Shipper.updateShipperAvailability] Đã gán ShipperID: ${shipperId} cho OrderID: ${order.OrderID}`);
                        break; // Chỉ gán cho một đơn hàng
                    }
                }
            }

            console.log(`[Shipper.updateShipperAvailability] Đã cập nhật trạng thái khả dụng của ShipperID: ${shipperId} thành ${isAvailable}`);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái khả dụng của shipper:", { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy tên Shipper theo Id
    static async getShipperNameById(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('ShipperID', sql.Int, shipperId)
                .query('SELECT FullName FROM Shipper WHERE ShipperID = @ShipperID');
            return result.recordset[0]?.FullName || null;
        } catch (error) {
            console.error('❌ Lỗi khi lấy tên shipper:', { message: error.message, stack: error.stack });
            throw error;
        }
    }

    // Lấy danh sách đơn hàng được gán cho shipper
    static async getAssignments(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    SELECT sa.AssignmentID, sa.OrderID, sa.Status, sa.CreatedAt,
                           o.SenderName, o.ReceiverName, o.TotalCost, o.Status AS OrderStatus
                    FROM ShipperAssignment sa
                    JOIN Orders o ON sa.OrderID = o.OrderID
                    WHERE sa.ShipperID = @ShipperID
                `);
            console.log(`[Shipper.getAssignments] Lấy danh sách đơn hàng được gán cho ShipperID: ${shipperId}, Số lượng: ${result.recordset.length}`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng được gán:", error);
            throw error;
        }
    }

    // Lấy danh sách đơn hàng đang vận chuyển của shipper
    static async getShippingOrders(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    SELECT o.OrderID, o.SenderName, o.ReceiverName, o.TotalCost, o.CreatedDate, o.Status
                    FROM Orders o
                    WHERE o.ShipperID = @ShipperID AND o.Status = 'Shipping'
                `);
            console.log(`[Shipper.getShippingOrders] Lấy danh sách đơn hàng đang vận chuyển cho ShipperID: ${shipperId}, Số lượng: ${result.recordset.length}`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng đang vận chuyển:", error);
            throw error;
        }
    }

    // Phản hồi đơn hàng (Đồng ý/Từ chối)
    static async respondToAssignment(assignmentId, shipperId, response) {
        try {
            const pool = await poolPromise;
            // Cập nhật trạng thái của ShipperAssignment
            const updateAssignment = await pool
                .request()
                .input('AssignmentID', sql.Int, assignmentId)
                .input('ShipperID', sql.Int, shipperId)
                .input('Status', sql.NVarChar, response)
                .query(`
                    UPDATE ShipperAssignment
                    SET Status = @Status
                    WHERE AssignmentID = @AssignmentID AND ShipperID = @ShipperID
                `);
            if (updateAssignment.rowsAffected[0] === 0) {
                throw new Error("Không tìm thấy hoặc không thể cập nhật ShipperAssignment!");
            }

            // Nếu từ chối, cập nhật trạng thái shipper thành khả dụng
            if (response === "Rejected") {
                await Shipper.updateShipperAvailability(shipperId, true);
            }

            console.log(`[Shipper.respondToAssignment] ShipperID: ${shipperId} đã phản hồi AssignmentID: ${assignmentId} với trạng thái: ${response}`);
        } catch (error) {
            console.error("❌ Lỗi khi phản hồi đơn hàng:", error);
            throw error;
        }
    }

    // Xác nhận bắt đầu vận chuyển đơn hàng
    static async startShipping(orderId, shipperId) {
        try {
            const pool = await poolPromise;
            // Kiểm tra trạng thái đơn hàng
            const orderResult = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    SELECT Status
                    FROM Orders
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);
            if (!orderResult.recordset[0]) {
                throw new Error("Không tìm thấy đơn hàng hoặc shipper không được gán cho đơn hàng này!");
            }
            if (orderResult.recordset[0].Status !== "Approved") {
                throw new Error("Đơn hàng không ở trạng thái Approved để bắt đầu vận chuyển!");
            }

            // Cập nhật trạng thái đơn hàng thành Shipping
            await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    UPDATE Orders
                    SET Status = 'Shipping'
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);

            // Cập nhật trạng thái ShipperAssignment
            await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    UPDATE ShipperAssignment
                    SET Status = 'Accepted'
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);

            console.log(`[Shipper.startShipping] ShipperID: ${shipperId} đã bắt đầu vận chuyển OrderID: ${orderId}`);
        } catch (error) {
            console.error("❌ Lỗi khi bắt đầu vận chuyển đơn hàng:", error);
            throw error;
        }
    }

    // Xác nhận thanh toán từ người nhận
    static async confirmPayment(orderId, shipperId) {
        try {
            const pool = await poolPromise;
            // Kiểm tra trạng thái đơn hàng
            const orderResult = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                SELECT Status, PaymentBy, PaymentStatus
                FROM Orders
                WHERE OrderID = @OrderID AND ShipperID = @ShipperID
            `);
            if (!orderResult.recordset[0]) {
                throw new Error("Không tìm thấy đơn hàng hoặc shipper không được gán cho đơn hàng này!");
            }
            const { Status, PaymentBy, PaymentStatus } = orderResult.recordset[0];
            if (Status !== "Shipping") {
                throw new Error("Đơn hàng không ở trạng thái Shipping để xác nhận thanh toán!");
            }
            if (PaymentBy !== "Receiver") {
                throw new Error("Đơn hàng không yêu cầu thanh toán từ người nhận!");
            }
            if (PaymentStatus !== "Pending") {
                throw new Error("Trạng thái thanh toán không phải là Pending!");
            }

            // Cập nhật trạng thái thanh toán
            const updateResult = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                UPDATE Orders
                SET PaymentStatus = 'Paid'
                WHERE OrderID = @OrderID AND ShipperID = @ShipperID
            `);
            if (updateResult.rowsAffected[0] === 0) {
                throw new Error("Không thể cập nhật trạng thái thanh toán!");
            }

            console.log(`[Shipper.confirmPayment] ShipperID: ${shipperId} đã xác nhận thanh toán cho OrderID: ${orderId}`);
        } catch (error) {
            console.error("❌ Lỗi khi xác nhận thanh toán:", error);
            throw error;
        }
    }

    // Xác nhận hoàn thành đơn hàng
    static async completeOrder(orderId, shipperId) {
        try {
            const pool = await poolPromise;
            // Kiểm tra trạng thái đơn hàng
            const orderResult = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    SELECT Status
                    FROM Orders
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);
            if (!orderResult.recordset[0]) {
                throw new Error("Không tìm thấy đơn hàng hoặc shipper không được gán cho đơn hàng này!");
            }
            if (orderResult.recordset[0].Status !== "Shipping") {
                throw new Error("Đơn hàng không ở trạng thái Shipping để hoàn tất!");
            }

            // Cập nhật trạng thái đơn hàng
            const updateOrder = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    UPDATE Orders
                    SET Status = 'Completed'
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);
            if (updateOrder.rowsAffected[0] === 0) {
                throw new Error("Không tìm thấy hoặc không thể cập nhật đơn hàng!");
            }

            // Cập nhật trạng thái ShipperAssignment
            const updateAssignment = await pool
                .request()
                .input('OrderID', sql.Int, orderId)
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    UPDATE ShipperAssignment
                    SET Status = 'Completed'
                    WHERE OrderID = @OrderID AND ShipperID = @ShipperID
                `);
            if (updateAssignment.rowsAffected[0] === 0) {
                throw new Error("Không tìm thấy hoặc không thể cập nhật ShipperAssignment!");
            }

            // Cập nhật trạng thái shipper thành khả dụng
            await Shipper.updateShipperAvailability(shipperId, true);

            console.log(`[Shipper.completeOrder] ShipperID: ${shipperId} đã hoàn thành OrderID: ${orderId}`);
        } catch (error) {
            console.error("❌ Lỗi khi xác nhận hoàn thành đơn hàng:", error);
            throw error;
        }
    }

    // Lấy danh sách đơn hoàn thành
    static async getCompletedOrders(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('ShipperID', sql.Int, shipperId)
                .query(`
                    SELECT 
                        OrderID, SenderName, ReceiverName, TotalCost, CreatedDate, 
                        Status, PaymentBy, PaymentStatus
                    FROM Orders
                    WHERE ShipperID = @ShipperID AND Status = 'Completed'
                `);
            console.log(`[Shipper.getCompletedOrders] Lấy danh sách đơn hàng hoàn thành cho ShipperID: ${shipperId}, Số lượng: ${result.recordset.length}`);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách đơn hàng hoàn thành:", error);
            throw error;
        }
    }

    // Thông tin shipper vận chuyển (người dùng xem)
    static async getShipperDetails(shipperId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("ShipperID", sql.Int, shipperId)
                .query(`
                    SELECT FullName AS fullName, Phone AS phoneNumber , Email AS email , WorkAreas AS workAreas
                    FROM Shipper
                    WHERE ShipperID = @ShipperID
                `);
            if (result.recordset.length === 0) {
                throw new Error("Không tìm thấy shipper!");
            }
            console.log(`[Shipper.getShipperDetails] Tìm thấy shipper với ShipperID: ${shipperId}`);
            return result.recordset[0];
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin shipper:", { message: error.message, stack: error.stack });
            throw error;
        }
    }
}

module.exports = Shipper;