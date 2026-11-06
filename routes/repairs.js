const express =
  require("express");

const multer =
  require("multer");

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


const router =
  express.Router();


const MAX_FILES =
  3;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ========================================
// 支援語系
// ========================================

const SUPPORTED_LANGUAGES = [
  "zh-TW",
  "ja-JP",
  "en-US"
];


const DEFAULT_LANGUAGE =
  process.env.APP_DEFAULT_LANGUAGE ||
  "zh-TW";


// ========================================
// 語系正規化
// ========================================

function normalizeLanguage(
  language
) {

  const exactLanguage =
    String(
      language || ""
    );


  if (
    SUPPORTED_LANGUAGES.includes(
      exactLanguage
    )
  ) {

    return exactLanguage;
  }


  const value =
    exactLanguage
      .toLowerCase();


  if (
    value.startsWith("ja")
  ) {

    return "ja-JP";
  }


  if (
    value.startsWith("en")
  ) {

    return "en-US";
  }


  if (
    value.startsWith("zh")
  ) {

    return "zh-TW";
  }


  if (
    SUPPORTED_LANGUAGES.includes(
      DEFAULT_LANGUAGE
    )
  ) {

    return DEFAULT_LANGUAGE;
  }


  return "zh-TW";
}


// ========================================
// API 訊息
// ========================================

const API_MESSAGES = {

  "zh-TW": {

    imageType:
      "只支援 JPG、PNG 或 WebP 圖片",

    selectEquipmentCategory:
      "請選擇設備類別",

    enterEquipmentName:
      "請填寫設備名稱",

    selectLocation:
      "請選擇所在位置",

    enterDescription:
      "請填寫故障描述",

    userUnavailable:
      "無法取得 LINE WORKS 使用者資訊",

    created:
      "報修案件已建立",

    missingUserId:
      "缺少 LINE WORKS User ID"
  },


  "ja-JP": {

    imageType:
      "JPG、PNG、WebP形式の画像のみアップロードできます",

    selectEquipmentCategory:
      "設備カテゴリーを選択してください",

    enterEquipmentName:
      "設備名を入力してください",

    selectLocation:
      "設置場所を選択してください",

    enterDescription:
      "故障内容を入力してください",

    userUnavailable:
      "LINE WORKSユーザー情報を取得できません",

    created:
      "修理依頼を受け付けました",

    missingUserId:
      "LINE WORKS User IDがありません"
  },


  "en-US": {

    imageType:
      "Only JPG, PNG, or WebP images are supported",

    selectEquipmentCategory:
      "Select an equipment category",

    enterEquipmentName:
      "Enter the equipment name",

    selectLocation:
      "Select the equipment location",

    enterDescription:
      "Enter the fault description",

    userUnavailable:
      "Unable to retrieve LINE WORKS user information",

    created:
      "Repair request created",

    missingUserId:
      "LINE WORKS User ID is missing"
  }
};


// ========================================
// 取得 API 訊息
// ========================================

function apiMessage(
  language,
  key
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    API_MESSAGES[
      normalizedLanguage
    ]?.[key] ||
    API_MESSAGES[
      "zh-TW"
    ]?.[key] ||
    key
  );
}


// ========================================
// Bot 建案通知
// ========================================

const BOT_MESSAGES = {

  // ======================================
  // 繁體中文
  // ======================================

  "zh-TW": {

    title:
      "🔧 報修案件已建立",

    caseNumber:
      "案件編號",

    applicant:
      "報修人",

    equipmentCategory:
      "設備類別",

    equipmentName:
      "設備名稱",

    equipmentNumber:
      "設備編號",

    location:
      "所在位置",

    status:
      "目前狀態",

    waitingAssignment:
      "待分派工程師處理",

    notSet:
      "未設定",

    notEntered:
      "未填寫",

    accepted:
      "您的報修已成功受理。",

    viewProgress:
      "您可以進入「設備報修系統」查看最新處理進度。"
  },


  // ======================================
  // 日本語
  // ======================================

  "ja-JP": {

    title:
      "🔧 修理依頼を受け付けました",

    caseNumber:
      "案件番号",

    applicant:
      "申請者",

    equipmentCategory:
      "設備カテゴリー",

    equipmentName:
      "設備名",

    equipmentNumber:
      "設備番号",

    location:
      "設置場所",

    status:
      "現在のステータス",

    waitingAssignment:
      "担当者割当待ち",

    notSet:
      "未設定",

    notEntered:
      "未入力",

    accepted:
      "修理依頼を受け付けました。",

    viewProgress:
      "「設備修理システム」から最新の対応状況を確認できます。"
  },


  // ======================================
  // English
  // ======================================

  "en-US": {

    title:
      "🔧 Repair Request Created",

    caseNumber:
      "Case Number",

    applicant:
      "Applicant",

    equipmentCategory:
      "Equipment Category",

    equipmentName:
      "Equipment Name",

    equipmentNumber:
      "Equipment Number",

    location:
      "Location",

    status:
      "Status",

    waitingAssignment:
      "Waiting for Engineer Assignment",

    notSet:
      "Not set",

    notEntered:
      "Not entered",

    accepted:
      "Your repair request has been received.",

    viewProgress:
      "Open the Equipment Repair System to view the latest progress."
  }
};


// ========================================
// 取得 Bot 語系內容
// ========================================

function getBotMessages(
  language
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    BOT_MESSAGES[
      normalizedLanguage
    ] ||
    BOT_MESSAGES[
      "zh-TW"
    ]
  );
}


// ========================================
// Multer
// ========================================

const upload =
  multer({

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

        const language =
          normalizeLanguage(
            req.body?.language
          );


        return callback(
          new Error(
            apiMessage(
              language,
              "imageType"
            )
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
// 建立 Bot 通知文字
// ========================================

function buildRepairCreatedMessage({
  language,
  reporterName,
  recordId,
  equipmentCategory,
  equipmentNumber,
  equipmentName,
  location
}) {

  const messages =
    getBotMessages(
      language
    );


  const messageLines = [

    messages.title,

    "",

    `${messages.caseNumber}：#${recordId}`,

    `${messages.applicant}：${
      reporterName ||
      messages.notSet
    }`,

    `${messages.equipmentCategory}：${
      equipmentCategory ||
      messages.notSet
    }`,

    `${messages.equipmentName}：${
      equipmentName ||
      messages.notSet
    }`,

    `${messages.equipmentNumber}：${
      equipmentNumber ||
      messages.notEntered
    }`,

    `${messages.location}：${
      location ||
      messages.notSet
    }`,

    `${messages.status}：${
      messages.waitingAssignment
    }`,

    "",

    messages.accepted,

    messages.viewProgress
  ];


  return messageLines.join(
    "\n"
  );
}


// ========================================
// Bot 報修成功通知
// ========================================

async function notifyRepairCreated({
  language,
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

      success:
        false,

      skipped:
        true
    };
  }


  const message =
    buildRepairCreatedMessage({

      language,

      reporterName,

      recordId,

      equipmentCategory,

      equipmentNumber,

      equipmentName,

      location
    });


  try {

    await sendTextMessage(
      reporterId,
      message
    );


    console.log(
      "Repair created Bot notification sent:",
      {
        recordId,
        reporterId,
        language
      }
    );


    return {

      success:
        true
    };


  } catch (error) {

    console.error(
      "Repair created Bot notification failed:",
      {
        recordId,
        reporterId,
        language,
        message:
          error.message
      }
    );


    return {

      success:
        false,

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

        reporterName,

        language

      } = req.body;


      const normalizedLanguage =
        normalizeLanguage(
          language
        );


      // ==================================
      // 必填欄位檢查
      // ==================================

      if (
        !equipmentCategory?.trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                normalizedLanguage,
                "selectEquipmentCategory"
              )
          });
      }


      if (
        !equipmentName?.trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                normalizedLanguage,
                "enterEquipmentName"
              )
          });
      }


      if (
        !location?.trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                normalizedLanguage,
                "selectLocation"
              )
          });
      }


      if (
        !description?.trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                normalizedLanguage,
                "enterDescription"
              )
          });
      }


      if (
        !reporterId?.trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                normalizedLanguage,
                "userUnavailable"
              )
          });
      }


      // ==================================
      // 整理輸入資料
      // ==================================

      const repairData = {

        reporterId:
          reporterId.trim(),

        reporterName:
          reporterName?.trim() ||
          "",

        language:
          normalizedLanguage,

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


      // ==================================
      // 建立 kintone 案件
      // ==================================

      const result =
        await createRepair(

          repairData,

          req.files ||
          []
        );


      console.log(
        "kintone repair created:",
        {
          ...result,
          language:
            normalizedLanguage
        }
      );


      // ==================================
      // Bot 建案通知
      // ==================================

      const notification =
        await notifyRepairCreated({

          language:
            normalizedLanguage,

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


      // ==================================
      // 回傳 WOFF
      // ==================================

      return res
        .status(201)
        .json({

          success:
            true,

          ticketNumber:
            result.recordId,

          recordId:
            result.recordId,

          language:
            normalizedLanguage,

          message:
            apiMessage(
              normalizedLanguage,
              "created"
            ),

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


      const language =
        normalizeLanguage(
          req.query.language
        );


      if (!lineworksUserId) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              apiMessage(
                language,
                "missingUserId"
              )
          });
      }


      const repairs =
        await getMyRepairs(
          lineworksUserId
        );


      return res.json({

        success:
          true,

        count:
          repairs.length,

        language,

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


module.exports =
  router;
