const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "taivu1602@gmail.com", // Email của admin
        pass: "vhfx zwol vgsw usqr", // App Password (thay bằng App Password bạn vừa tạo)
    },
});

module.exports = transporter;