const express = require("express");
const multer = require("multer");

const {
  createRepair,
  getMyRepairs
} = require(
  "../services/kintoneService"
);

const {
  sendTextMessage
} = require(
  "../services/lineworksBotService"
);


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
    fileSize:
      MAX_FILE_SIZE,

    files:
      MAX_FILES
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


    callback(
      null,
      true
    );
  }
});


// ========================================
// Bot 報修成功通知
// ========================================

async function notifyRepairCreated({
  reporterId,
  reporterName,
  recordId,
  equipmentCategory,
  equipmentNumber,
  equipmentName,
  location
}) {

  if (!reporterId) {

    console.warn(
      "Repair Bot notification skipped: missing reporterId"
    );

    return {
      success: false,
      skipped: true
    };
  }


  const messageLines = [

    "🔧 報修案件已建立",

    "",

    `案件編號：#${recordId}`,

    `報修人：${reporterName || "未設定"}`,

    `設備類別：${equipmentCategory || "未設定"}`,

    `設備名稱：${equipmentName || "未設定"}`,

    `設備編號：${equipmentNumber || "未填寫"}`,

    `所在位置：${location || "未設定"}`,

    "目前狀態：待分派工程師處理",

    "",

    "您的報修已成功受理。",

    "您可以進入「設備報修系統」查看最新處理進度。"
  ];


  const message =
    messageLines.join("\n");


  try {

    await sendTextMessage(
      reporterId,
      message
    );


    console.log(
      "Repair created Bot notification sent:",
      {
        recordId,
        reporterId
      }
    );


    return {
      success: true
    };


  } catch (error) {

    /*
      很重要：
      kintone 案件已成功建立時，
      Bot 發送失敗不應讓整個報修 API 回傳失敗。
    */

    console.error(
      "Repair created Bot notification failed:",
      {
        recordId,
        reporterId,
        message:
          error.message
      }
    );


    return {
      success: false,
      error:
        error.message
    };
  }
}


// ========================================
// POST /api/repairs
// 建立報修案件
// ========================================

router.post(
  "/",

  upload.array(
    "images",
    MAX_FILES
  ),

  async (
    req,
    res,
    next
  ) => {

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


      // ====================================
      // 必填欄位檢查
      // ====================================

      if (
        !equipmentCategory?.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請選擇設備類別"
          });
      }


      if (
        !equipmentName?.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫設備名稱"
          });
      }


      if (
        !location?.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請選擇所在位置"
          });
      }


      if (
        !description?.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請填寫故障描述"
          });
      }


      if (
        !reporterId?.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "無法取得 LINE WORKS 使用者資訊"
          });
      }


      // ====================================
      // 整理輸入資料
      // ====================================

      const repairData = {

        reporterId:
          reporterId.trim(),

        reporterName:
          reporterName?.trim() ||
          "",

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
      };


      // ====================================
      // 建立 kintone 案件
      // ====================================

      const result =
        await createRepair(

          repairData,

          req.files || []
        );


      console.log(
        "kintone repair created:",
        result
      );


      // ====================================
      // Bot 留下案件建立紀錄
      // ====================================

      const notification =
        await notifyRepairCreated({

          reporterId:
            repairData.reporterId,

          reporterName:
            repairData.reporterName,

          recordId:
            result.recordId,

          equipmentCategory:
            repairData.equipmentCategory,

          equipmentNumber:
            repairData.equipmentNumber,

          equipmentName:
            repairData.equipmentName,

          location:
            repairData.location
        });


      // ====================================
      // 回傳 WOFF
      // ====================================

      return res
        .status(201)
        .json({

          success: true,

          ticketNumber:
            result.recordId,

          recordId:
            result.recordId,

          message:
            "報修案件已建立",

          botNotificationSent:
            notification.success
        });


    } catch (error) {

      if (
        error.response?.data
      ) {

        console.error(
          "kintone repair API error:",
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


// ========================================
// GET /api/repairs/my
// 查詢目前使用者建立的案件
// ========================================

router.get(
  "/my",

  async (
    req,
    res,
    next
  ) => {

    try {

      const lineworksUserId =
        req.query.userId;


      if (!lineworksUserId) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "缺少 LINE WORKS User ID"
          });
      }


      const repairs =
        await getMyRepairs(
          lineworksUserId
        );


      return res.json({

        success: true,

        count:
          repairs.length,

        repairs
      });


    } catch (error) {

      if (
        error.response?.data
      ) {

        console.error(
          "kintone query error:",
          error.response.data
        );

      } else {

        console.error(
          "Get repairs error:",
          error
        );
      }


      next(error);
    }
  }
);


module.exports = router;
