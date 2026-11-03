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


// ========================================
// Multer 設定
// ========================================

const upload = multer({

  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },

  fileFilter: (req, file, callback) => {

    if (!ALLOWED_TYPES.includes(file.mimetype)) {

      return callback(
        new Error(
          "只支援 JPG、PNG 或 WebP 圖片"
        )
      );
    }

    callback(null, true);
  }
});


// ========================================
// POST /api/repairs
// ========================================

router.post(
  "/",

  upload.array("images", MAX_FILES),

  async (req, res, next) => {

    try {

      const {
        equipmentCategory,
        equipmentNumber,
        equipmentName,
        location,
        description,
        reporterId,
        reporterName
      } = req.body;


      // ==========================
      // 必填欄位檢查
      // ==========================

      if (!equipmentCategory?.trim()) {

        return res.status(400).json({
          success: false,
          message: "請填寫設備類別"
        });
      }


      if (!equipmentName?.trim()) {

        return res.status(400).json({
          success: false,
          message: "請填寫設備名稱"
        });
      }


      if (!location?.trim()) {

        return res.status(400).json({
          success: false,
          message: "請填寫所在位置"
        });
      }


      if (!description?.trim()) {

        return res.status(400).json({
          success: false,
          message: "請填寫故障描述"
        });
      }


      // ==========================
      // Render Log
      // ==========================

      console.log(
        "===== New Repair Request ====="
      );

      console.log({
        reporterId,
        reporterName,
        equipmentCategory,
        equipmentNumber,
        equipmentName,
        location,
        description
      });


      console.log(
        "Images:",
        (req.files || []).map(
          (file) => ({
            name: file.originalname,
            type: file.mimetype,
            size: file.size
          })
        )
      );


      // ==========================
      // 測試案件編號
      // ==========================
      // 下一階段改成
      // kintone Record Number

      const ticketNumber =
        `TEST-${Date.now()}`;


      return res.status(201).json({

        success: true,

        ticketNumber,

        message:
          "報修資料已成功接收",

        receivedImages:
          req.files?.length || 0

      });


    } catch (error) {

      next(error);
    }
  }
);


module.exports = router;
