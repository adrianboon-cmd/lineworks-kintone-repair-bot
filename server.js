require("dotenv").config();

const express = require("express");
const path = require("path");

const repairRoutes = require("./routes/repairs");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// Frontend
// ==============================

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// ==============================
// API Routes
// ==============================

app.use(
  "/api/repairs",
  repairRoutes
);

// ==============================
// Health Check
// ==============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message:
      "LINE WORKS x kintone Repair Bot is running"
  });
});

// ==============================
// Error Handler
// ==============================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // Multer 上傳限制
  if (err instanceof multer?.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message:
      err.message || "Server error"
  });
});

// ==============================
// Start Server
// ==============================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
