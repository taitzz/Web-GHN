const express = require("express");
const { authenticateToken, isAdmin, isShipper } = require("../middleware/auth");
const ShipperController = require("../controllers/shipperController");
const router = express.Router();

// === Public Routes (Không yêu cầu xác thực) 
router.post("/check-email", ShipperController.checkEmail);
router.post("/register", ShipperController.register);
router.post("/login", ShipperController.login);

// === Shipper Routes (Yêu cầu đăng nhập shipper) 
router.get("/profile", authenticateToken, isShipper, ShipperController.getProfile);
router.get("/name", authenticateToken, isShipper, ShipperController.getShipperName);
router.get("/assignments", authenticateToken, isShipper, ShipperController.getAssignments);
router.get("/shipping-orders", authenticateToken, isShipper, ShipperController.getShippingOrders);
router.get("/completed-orders", authenticateToken, isShipper, ShipperController.getCompletedOrders);
router.get("/orders/:orderId", authenticateToken, isShipper, ShipperController.getOrderDetails);
router.post("/respond-assignment", authenticateToken, isShipper, ShipperController.respondToAssignment);
router.post("/start-shipping", authenticateToken, isShipper, ShipperController.startShipping);
router.post("/complete-order", authenticateToken, isShipper, ShipperController.completeOrder);
router.post("/confirm-payment", authenticateToken, isShipper, ShipperController.confirmPayment);

// === User Routes (Yêu cầu đăng nhập, không cần admin hoặc shipper) ===
router.get("/shipper-details/:shipperId", authenticateToken, ShipperController.getShipperDetails);

// === Admin Routes (Yêu cầu admin) ===
router.post("/create-and-approve", authenticateToken, isAdmin, ShipperController.createAndApproveShipper);
router.get("/shipper-requests", authenticateToken, isAdmin, ShipperController.getPendingShippers);
router.get("/approved-shippers", authenticateToken, isAdmin, ShipperController.getApprovedShippers);
router.get("/available", authenticateToken, isAdmin, ShipperController.getAvailableShippers);
router.get("/shipper-details/:id", authenticateToken, isAdmin, ShipperController.getShipperById);
router.put("/update/:id", authenticateToken, isAdmin, ShipperController.updateShipper);
router.put("/approve/:id", authenticateToken, isAdmin, ShipperController.approveShipper);
router.put("/reject/:id", authenticateToken, isAdmin, ShipperController.rejectShipper);
router.delete("/delete/:id", authenticateToken, isAdmin, ShipperController.deleteShipper);

module.exports = router;