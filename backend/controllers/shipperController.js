const Shipper = require("../models/shipperModel");

exports.getPendingShippers = async (req, res) => {
    try {
        const shippers = await Shipper.getPendingShippers();
        res.json(shippers);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.approveShipper = async (req, res) => {
    try {
        await Shipper.approveShipper(req.params.id);
        res.json({ message: "Shipper đã được duyệt" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi duyệt shipper", error });
    }
};

exports.rejectShipper = async (req, res) => {
    try {
        await Shipper.rejectShipper(req.params.id);
        res.json({ message: "Shipper đã bị từ chối" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi từ chối shipper", error });
    }
};
