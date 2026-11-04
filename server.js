require("dotenv").config();

const express = require("express");
const path = require("path");

const repairRoutes =
  require("./routes/repairs");

const engineerRepairRoutes =
  require("./routes/engineerRepairs");

const kintoneWebhookRoutes =
  require("./routes/kintoneWebhook");


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

// 報修 / 我的案件
app.use(
  "/api/repairs",
  repairRoutes
);


// 工程師維修任務
app.use(
  "/api/engineer-repairs",
  engineerRepairRoutes
);


// kintone Webhook
app.use(
  "/api/kintone-webhook",
  kintoneWebhookRoutes
);


// ========================================
// Health Check
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
// API 404
// 必須放在全部 API Routes 後面
// ========================================

app.use(
  "/api",

  (req, res) => {

    res
      .status(404)
      .json({
        success: false,
        message:
          "找不到指定的 API"
      });
  }
);


// ========================================
// Global Error Handler
// ========================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "Server error:",
      err
    );


    const statusCode =
      err.statusCode ||
      400;


    const apiMessage =
      err.response?.data?.message;


    res
      .status(statusCode)
      .json({
        success: false,

        message:
          apiMessage ||
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
