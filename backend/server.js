const express = require("express");
const cors = require("cors");
require("dotenv").config();

const shipperRoutes = require("./routes/shipper"); //Route cho shipper
const userRoutes = require("./routes/users"); // Route cho người dùng

const app = express();
app.use(express.json());

// Kích hoạt CORS để cho phép admin và frontend người dùng truy cập backend
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:3001"], 
})); 

// Import API routes
app.use("/api/shipper", shipperRoutes);
app.use("/api/users", userRoutes); 

// Route test `/dashboard`
app.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the Dashboard!" });
});

// Chạy backend trên port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
