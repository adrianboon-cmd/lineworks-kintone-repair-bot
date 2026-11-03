const express = require("express");
const multer = require("multer");

const router = express.Router();

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

// 圖片暫存在記憶體
// 後續會直接轉送到 kintone，不寫入 Render 磁碟
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },

  fileFilter: (req, file, callback) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(
        new Error("只支援 JPG、PNG 或 WebP 圖片")
      );
    }

    callback(null, true);
  }
});

// ========================================
// POST /api/repairs
// 建立報修案件
// ========================================

router.post(
  "/",
  upload.array("images", MAX_FILES),

  async (req, res, next) => {
    try {
      const {
        equipmentName,
        equipmentNumber,
        description,
        priority,
        reporterId,
        reporterName
      } = req.body;

      // 必填欄位檢查
      if (!equipmentName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "請填寫設備名稱"
        });
      }

      if (!description?.trim()) {
        return res.status(400).json({
          success: false,
          message: "請填寫故障說明"
        });
      }

      const allowedPriorities = [
        "一般",
        "緊急",
        "設備停機"
      ];

      if (
        priority &&
        !allowedPriorities.includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "緊急程度格式錯誤"
        });
      }

      // 暫時輸出到 Render Log
      // 下一階段會改成送進 kintone
      console.log("===== New Repair Request =====");

      console.log({
        equipmentName,
        equipmentNumber,
        description,
        priority,
        reporterId,
        reporterName
      });

      console.log(
        "Images:",
        (req.files || []).map((file) => ({
          name: file.originalname,
          type: file.mimetype,
          size: file.size
        }))
      );

      // 測試用案件編號
      // 接 kintone 後改用 Record ID
      const ticketNumber =
        `TEST-${Date.now()}`;

      return res.status(201).json({
        success: true,
        ticketNumber,
        message: "報修資料已成功接收",
        receivedImages: req.files?.length || 0
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
