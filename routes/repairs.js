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
    exactLanguage.toLowerCase();


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
// 設備類別三語翻譯
// ========================================

const EQUIPMENT_CATEGORY_TRANSLATIONS = {

  "zh-TW": {

    "辦公設備":
      "辦公設備",

    "電腦及資訊設備":
      "電腦及資訊設備",

    "網路及通訊設備":
      "網路及通訊設備",

    "生產設備":
      "生產設備",

    "空調及機電設備":
      "空調及機電設備",

    "門禁及監控設備":
      "門禁及監控設備",

    "其他":
      "其他"
  },


  "ja-JP": {

    "辦公設備":
      "オフィス機器",

    "電腦及資訊設備":
      "PC・情報機器",

    "網路及通訊設備":
      "ネットワーク・通信機器",

    "生產設備":
      "生産設備",

    "空調及機電設備":
      "空調・電気設備",

    "門禁及監控設備":
      "入退室・監視設備",

    "其他":
      "その他"
  },


  "en-US": {

    "辦公設備":
      "Office Equipment",

    "電腦及資訊設備":
      "Computers and IT Equipment",

    "網路及通訊設備":
      "Network and Communication Equipment",

    "生產設備":
      "Production Equipment",

    "空調及機電設備":
      "HVAC and Electrical Equipment",

    "門禁及監控設備":
      "Access Control and Surveillance",

    "其他":
      "Other"
  }
};


// ========================================
// 所在位置三語翻譯
// ========================================

const LOCATION_TRANSLATIONS = {

  "zh-TW": {

    "總公司 6F 辦公室":
      "總公司 6F 辦公室",

    "總公司 7F 辦公室":
      "總公司 7F 辦公室",

    "總公司 公共區域":
      "總公司 公共區域",

    "桃園廠 產線 A":
      "桃園廠 產線 A",

    "桃園廠 產線 B":
      "桃園廠 產線 B",

    "桃園廠 倉庫":
      "桃園廠 倉庫",

    "桃園廠 辦公室":
      "桃園廠 辦公室",

    "其他":
      "其他位置"
  },


  "ja-JP": {

    "總公司 6F 辦公室":
      "本社 6F オフィス",

    "總公司 7F 辦公室":
      "本社 7F オフィス",

    "總公司 公共區域":
      "本社 共用エリア",

    "桃園廠 產線 A":
      "桃園工場 ラインA",

    "桃園廠 產線 B":
      "桃園工場 ラインB",

    "桃園廠 倉庫":
      "桃園工場 倉庫",

    "桃園廠 辦公室":
      "桃園工場 オフィス",

    "其他":
      "その他の場所"
  },


  "en-US": {

    "總公司 6F 辦公室":
      "Head Office 6F",

    "總公司 7F 辦公室":
      "Head Office 7F",

    "總公司 公共區域":
      "Head Office Common Area",

    "桃園廠 產線 A":
      "Taoyuan Factory Line A",

    "桃園廠 產線 B":
      "Taoyuan Factory Line B",

    "桃園廠 倉庫":
      "Taoyuan Factory Warehouse",

    "桃園廠 辦公室":
      "Taoyuan Factory Office",

    "其他":
      "Other Location"
  }
};


// ========================================
// 翻譯設備類別
// ========================================

function translateEquipmentCategory(
  language,
  value
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    EQUIPMENT_CATEGORY_TRANSLATIONS[
      normalizedLanguage
    ]?.[value] ||
    value ||
    ""
  );
}


// ========================================
// 翻譯所在位置
// ========================================

function translateLocation(
  language,
  value
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    LOCATION_TRANSLATIONS[
      normalizedLanguage
    ]?.[value] ||
    value ||
    ""
  );
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
// 取得 Bot 語系
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


  const translatedEquipmentCategory =
    translateEquipmentCategory(
      language,
      equipmentCategory
    );


  const translatedLocation =
    translateLocation(
      language,
      location
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
      translatedEquipmentCategory ||
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
      translatedLocation ||
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
      // 必填欄位
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
      // kintone 儲存仍維持原始中文 Value
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
