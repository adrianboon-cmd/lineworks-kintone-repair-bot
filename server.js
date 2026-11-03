require("dotenv").config();

const express = require("express");
const path = require("path");

const repairRoutes =
  require("./routes/repairs");

const engineerRepairRoutes =
  require("./routes/engineerRepairs");

const botTestRoutes =
  require("./routes/botTest");

const app = express();

const PORT =
  process.env.PORT || 3000;


// ========================================
// Frontend
// ========================================

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


// ========================================
// API Routes
// ========================================
app.use(
  "/api/bot-test",
  botTestRoutes
);

// 報修與我的報修案件
app.use(
  "/api/repairs",
  repairRoutes
);


// 工程師維修任務
app.use(
  "/api/engineer-repairs",
  engineerRepairRoutes
);


// ========================================
// Health check
// ========================================

app.get(
  "/api/health",

  (req, res) => {

    res.json({
      success: true,
      message:
        "LINE WORKS x kintone Repair Bot is running"
    });
  }
);


// ========================================
// 404 API
// ========================================

app.use(
  "/api",

  (req, res) => {

    res.status(404).json({
      success: false,
      message:
        "找不到指定的 API"
    });
  }
);


// ========================================
// Global error handler
// ========================================

app.use(
  (err, req, res, next) => {

    console.error(
      "Server error:",
      err
    );


    const statusCode =
      err.statusCode ||
      400;


    const kintoneMessage =
      err.response?.data?.message;


    res
      .status(statusCode)
      .json({
        success: false,
        message:
          kintoneMessage ||
          err.message ||
          "Server error"
      });
  }
);


// ========================================
// Start Server
// ========================================

app.listen(
  PORT,
  "0.0.0.0",

  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);
