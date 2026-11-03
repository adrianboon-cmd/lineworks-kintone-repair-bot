const express = require("express");
const multer = require("multer");

const {
  createRepair
} = require("../services/kintoneService");


const router = express.Router();

const MAX_FILES = 3;
const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ========================================
// Multer
// ========================================

const upload = multer({

  storage:
    multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {

    if (
      !ALLOWED_TYPES.includes(
        file.mimetype
      )
    ) {

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

  upload.array(
    "images",
    MAX_FILES
  ),

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


      // ------------------------------
      // 必填檢查
      // ------------------------------

      if (!equipmentCategory?.trim()) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫設備類別"
          });
      }


      if (!equipmentName?.trim()) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫設備名稱"
          });
      }


      if (!location?.trim()) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫所在位置"
          });
      }


      if (!description?.trim()) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫故障描述"
          });
      }


      // ------------------------------
      // kintone 建立案件
      // ------------------------------

      const result =
        await createRepair(

          {
            reporterId,
            reporterName,

            equipmentCategory:
              equipmentCategory.trim(),

            equipmentNumber:
              equipmentNumber?.trim() ||
              "",

            equipmentName:
              equipmentName.trim(),

            location:
              location.trim(),

            description:
              description.trim()
          },

          req.files || []
        );


      // ------------------------------
      // 成功
      // ------------------------------

      console.log(
        "kintone repair created:",
        result
      );


      return res
        .status(201)
        .json({

          success: true,

          ticketNumber:
            result.recordId,

          recordId:
            result.recordId,

          message:
            "報修案件已建立"

        });


    } catch (error) {

      // 把 kintone 錯誤寫進
      // Render Logs，方便我們 Debug

      if (
        error.response?.data
      ) {

        console.error(
          "kintone API error:",
          error.response.data
        );

      } else {

        console.error(
          "Repair API error:",
          error
        );
      }

      next(error);
    }
  }
);


module.exports = router;
