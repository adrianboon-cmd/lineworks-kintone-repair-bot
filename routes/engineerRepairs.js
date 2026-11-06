const express =
  require("express");

const {
  getAssignedRepairs,
  updateRepairProgress,
  downloadRepairPhoto
} = require(
  "../services/engineerService"
);

const {
  sendTextMessage
} = require(
  "../services/lineworksBotService"
);


const router =
  express.Router();


// ========================================
// 語系設定
// ========================================

const SUPPORTED_LANGUAGES = [
  "zh-TW",
  "ja-JP",
  "en-US"
];


const DEFAULT_LANGUAGE =
  process.env.APP_DEFAULT_LANGUAGE ||
  "zh-TW";


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
// 日期顯示
// ========================================

function formatDate(
  value,
  language
) {

  if (!value) {

    return (
      normalizeLanguage(
        language
      ) === "en-US"
        ? "Not set"
        : "未設定"
    );
  }


  const parts =
    String(value).split("-");


  if (
    parts.length !== 3
  ) {

    return String(value);
  }


  return (
    `${parts[0]}/` +
    `${parts[1]}/` +
    `${parts[2]}`
  );
}


// ========================================
// 所在位置翻譯
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
// 狀態翻譯
// ========================================

const STATUS_TRANSLATIONS = {

  "zh-TW": {

    "待分派工程師處理":
      "待分派工程師處理",

    "已指派工程師":
      "已指派工程師",

    "維修中":
      "維修中",

    "無法維修":
      "無法維修",

    "已完成":
      "已完成"
  },


  "ja-JP": {

    "待分派工程師處理":
      "担当者割当待ち",

    "已指派工程師":
      "担当者割当済み",

    "維修中":
      "対応中",

    "無法維修":
      "修理不可",

    "已完成":
      "対応完了"
  },


  "en-US": {

    "待分派工程師處理":
      "Waiting for Engineer Assignment",

    "已指派工程師":
      "Engineer Assigned",

    "維修中":
      "In Progress",

    "無法維修":
      "Unable to Repair",

    "已完成":
      "Completed"
  }
};


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


function translateStatus(
  language,
  value
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    STATUS_TRANSLATIONS[
      normalizedLanguage
    ]?.[value] ||
    value ||
    ""
  );
}


// ========================================
// Bot 訊息字典
// ========================================

const MESSAGES = {

  // ======================================
  // 繁體中文
  // ======================================

  "zh-TW": {

    notSet:
      "未設定",

    notEntered:
      "未填寫",

    caseNumber:
      "案件編號",

    equipmentName:
      "設備名稱",

    equipmentNumber:
      "設備編號",

    location:
      "所在位置",

    status:
      "處理狀態",

    maintenanceStaff:
      "維修人員",

    expectedCompletionDate:
      "預計完成日期",

    actualCompletionDate:
      "實際完成日期",

    maintenanceResult:
      "維修進度／結果",

    engineerResult:
      "本次維修紀錄",

    progressTitle:
      "🧰 報修案件進度更新",

    completedTitle:
      "✅ 報修案件已完成",

    unableTitle:
      "⚠️ 報修案件狀態更新",

    engineerTitle:
      "🧰 維修紀錄已更新",

    reporterFooter:
      "您可以進入「設備報修系統 → 案件查詢」查看案件詳情。",

    engineerFooter:
      "本次更新已成功寫入 kintone。",

    missingUserId:
      "缺少 LINE WORKS User ID",

    missingFileKey:
      "缺少圖片 File Key",

    selectStatus:
      "請選擇處理狀態",

    updateSuccess:
      "維修進度已更新"
  },


  // ======================================
  // 日本語
  // ======================================

  "ja-JP": {

    notSet:
      "未設定",

    notEntered:
      "未入力",

    caseNumber:
      "案件番号",

    equipmentName:
      "設備名",

    equipmentNumber:
      "設備番号",

    location:
      "設置場所",

    status:
      "対応状況",

    maintenanceStaff:
      "修理担当者",

    expectedCompletionDate:
      "完了予定日",

    actualCompletionDate:
      "完了日",

    maintenanceResult:
      "対応状況／結果",

    engineerResult:
      "今回の対応記録",

    progressTitle:
      "🧰 修理案件の進捗更新",

    completedTitle:
      "✅ 修理案件が完了しました",

    unableTitle:
      "⚠️ 修理案件のステータス更新",

    engineerTitle:
      "🧰 修理記録を更新しました",

    reporterFooter:
      "「設備修理システム → 案件照会」から案件詳細を確認できます。",

    engineerFooter:
      "今回の更新内容は kintone に保存されました。",

    missingUserId:
      "LINE WORKS User IDがありません",

    missingFileKey:
      "画像のFile Keyがありません",

    selectStatus:
      "対応状況を選択してください",

    updateSuccess:
      "修理状況を更新しました"
  },


  // ======================================
  // English
  // ======================================

  "en-US": {

    notSet:
      "Not set",

    notEntered:
      "Not entered",

    caseNumber:
      "Case Number",

    equipmentName:
      "Equipment Name",

    equipmentNumber:
      "Equipment Number",

    location:
      "Location",

    status:
      "Status",

    maintenanceStaff:
      "Maintenance Engineer",

    expectedCompletionDate:
      "Expected Completion Date",

    actualCompletionDate:
      "Actual Completion Date",

    maintenanceResult:
      "Repair Progress / Result",

    engineerResult:
      "Maintenance Update",

    progressTitle:
      "🧰 Repair Case Progress Updated",

    completedTitle:
      "✅ Repair Case Completed",

    unableTitle:
      "⚠️ Repair Case Status Updated",

    engineerTitle:
      "🧰 Maintenance Record Updated",

    reporterFooter:
      "Open “Equipment Repair System → My Cases” to view the case details.",

    engineerFooter:
      "This update has been saved to kintone.",

    missingUserId:
      "LINE WORKS User ID is missing",

    missingFileKey:
      "Image File Key is missing",

    selectStatus:
      "Select a status",

    updateSuccess:
      "Repair progress updated"
  }
};


// ========================================
// 取得語系訊息
// ========================================

function getMessages(
  language
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    MESSAGES[
      normalizedLanguage
    ] ||
    MESSAGES[
      "zh-TW"
    ]
  );
}


// ========================================
// 建立報修人通知
// ========================================

function buildReporterMessage(
  repair
) {

  const language =
    normalizeLanguage(
      repair.notificationLanguage
    );


  const messages =
    getMessages(
      language
    );


  const isCompleted =
    repair.status ===
    "已完成";


  const isUnrepairable =
    repair.status ===
    "無法維修";


  let title =
    messages.progressTitle;


  if (
    isCompleted
  ) {

    title =
      messages.completedTitle;

  } else if (
    isUnrepairable
  ) {

    title =
      messages.unableTitle;
  }


  const lines = [

    title,

    "",

    `${messages.caseNumber}：#${repair.recordId}`,

    `${messages.equipmentName}：${
      repair.equipmentName ||
      messages.notSet
    }`,

    `${messages.equipmentNumber}：${
      repair.equipmentNumber ||
      messages.notEntered
    }`,

    `${messages.location}：${
      translateLocation(
        language,
        repair.location
      ) ||
      messages.notSet
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        repair.status
      ) ||
      messages.notSet
    }`,

    `${messages.maintenanceStaff}：${
      repair.engineerNames ||
      messages.notSet
    }`
  ];


  if (
    repair.expectedCompletionDate
  ) {

    lines.push(

      `${messages.expectedCompletionDate}：${
        formatDate(
          repair.expectedCompletionDate,
          language
        )
      }`
    );
  }


  if (
    repair.actualCompletionDate
  ) {

    lines.push(

      `${messages.actualCompletionDate}：${
        formatDate(
          repair.actualCompletionDate,
          language
        )
      }`
    );
  }


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      `${messages.maintenanceResult}：`,

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    messages.reporterFooter
  );


  return lines.join(
    "\n"
  );
}


// ========================================
// 建立工程師操作紀錄
// ========================================

function buildEngineerMessage(
  repair
) {

  const language =
    normalizeLanguage(
      repair.notificationLanguage
    );


  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.engineerTitle,

    "",

    `${messages.caseNumber}：#${repair.recordId}`,

    `${messages.equipmentName}：${
      repair.equipmentName ||
      messages.notSet
    }`,

    `${messages.equipmentNumber}：${
      repair.equipmentNumber ||
      messages.notEntered
    }`,

    `${messages.location}：${
      translateLocation(
        language,
        repair.location
      ) ||
      messages.notSet
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        repair.status
      ) ||
      messages.notSet
    }`
  ];


  if (
    repair.expectedCompletionDate
  ) {

    lines.push(

      `${messages.expectedCompletionDate}：${
        formatDate(
          repair.expectedCompletionDate,
          language
        )
      }`
    );
  }


  if (
    repair.actualCompletionDate
  ) {

    lines.push(

      `${messages.actualCompletionDate}：${
        formatDate(
          repair.actualCompletionDate,
          language
        )
      }`
    );
  }


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      `${messages.engineerResult}：`,

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    messages.engineerFooter
  );


  return lines.join(
    "\n"
  );
}


// ========================================
// 發送工程師更新通知
// ========================================

async function notifyRepairUpdated(
  repair
) {

  const notificationResults = {

    reporterNotificationSent:
      false,

    engineerNotificationSent:
      false,

    language:
      normalizeLanguage(
        repair.notificationLanguage
      ),

    errors:
      []
  };


  const reporterUserId =
    repair
      .reporterLineworksUserId;


  const engineerUserId =
    repair
      .engineerLineworksUserId;


  // ======================================
  // 通知報修人
  // ======================================

  if (
    reporterUserId
  ) {

    try {

      await sendTextMessage(

        reporterUserId,

        buildReporterMessage(
          repair
        )
      );


      notificationResults
        .reporterNotificationSent =
        true;


      console.log(
        "Reporter progress notification sent:",
        {
          recordId:
            repair.recordId,

          reporterUserId,

          language:
            repair.notificationLanguage
        }
      );


    } catch (error) {

      console.error(
        "Reporter progress notification failed:",
        {
          recordId:
            repair.recordId,

          reporterUserId,

          language:
            repair.notificationLanguage,

          message:
            error.message
        }
      );


      notificationResults
        .errors
        .push({

          target:
            "reporter",

          message:
            error.message
        });
    }
  }


  // ======================================
  // 通知工程師
  // ======================================

  if (
    engineerUserId &&
    engineerUserId !==
      reporterUserId
  ) {

    try {

      await sendTextMessage(

        engineerUserId,

        buildEngineerMessage(
          repair
        )
      );


      notificationResults
        .engineerNotificationSent =
        true;


      console.log(
        "Engineer update notification sent:",
        {
          recordId:
            repair.recordId,

          engineerUserId,

          language:
            repair.notificationLanguage
        }
      );


    } catch (error) {

      console.error(
        "Engineer update notification failed:",
        {
          recordId:
            repair.recordId,

          engineerUserId,

          language:
            repair.notificationLanguage,

          message:
            error.message
        }
      );


      notificationResults
        .errors
        .push({

          target:
            "engineer",

          message:
            error.message
        });
    }


  } else if (
    engineerUserId &&
    engineerUserId ===
      reporterUserId
  ) {

    notificationResults
      .engineerNotificationSent =
      true;


    console.log(
      "Engineer notification skipped because reporter and engineer are the same user:",
      {
        recordId:
          repair.recordId,

        userId:
          engineerUserId
      }
    );


  } else {

    console.warn(
      "Engineer notification skipped: missing engineer LINE WORKS User ID",
      {
        recordId:
          repair.recordId
      }
    );
  }


  return notificationResults;
}


// ========================================
// GET /api/engineer-repairs
// 查詢目前工程師負責案件
// ========================================

router.get(
  "/",

  async (
    req,
    res,
    next
  ) => {

    try {

      const lineworksUserId =
        req.query.userId;


      const requestLanguage =
        normalizeLanguage(
          req.query.language
        );


      const messages =
        getMessages(
          requestLanguage
        );


      if (
        !lineworksUserId
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              messages
                .missingUserId
          });
      }


      const repairs =
        await getAssignedRepairs(
          lineworksUserId
        );


      return res.json({

        success:
          true,

        count:
          repairs.length,

        repairs
      });


    } catch (error) {

      console.error(
        "Engineer repair query error:",
        error.response?.data ||
        error
      );


      next(error);
    }
  }
);


// ========================================
// GET /api/engineer-repairs/photo
// 顯示 kintone 故障照片
// ========================================

router.get(
  "/photo",

  async (
    req,
    res,
    next
  ) => {

    try {

      const fileKey =
        req.query.fileKey;


      const language =
        normalizeLanguage(
          req.query.language
        );


      const messages =
        getMessages(
          language
        );


      if (!fileKey) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              messages
                .missingFileKey
          });
      }


      const file =
        await downloadRepairPhoto(
          fileKey
        );


      res.setHeader(

        "Content-Type",

        file.contentType
      );


      res.setHeader(

        "Cache-Control",

        "private, max-age=300"
      );


      return res.send(
        file.data
      );


    } catch (error) {

      console.error(
        "Download repair photo error:",
        error.response?.data ||
        error
      );


      next(error);
    }
  }
);


// ========================================
// PUT /api/engineer-repairs/:recordId
// 更新維修進度
// ========================================

router.put(
  "/:recordId",

  express.json(),

  async (
    req,
    res,
    next
  ) => {

    try {

      const recordId =
        req.params.recordId;


      const {

        userId,

        language,

        status,

        expectedCompletionDate,

        actualCompletionDate,

        maintenanceResult

      } = req.body;


      const requestLanguage =
        normalizeLanguage(
          language
        );


      const requestMessages =
        getMessages(
          requestLanguage
        );


      if (!userId) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              requestMessages
                .missingUserId
          });
      }


      if (!status) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              requestMessages
                .selectStatus
          });
      }


      // ==================================
      // 更新 kintone
      // ==================================

      const result =
        await updateRepairProgress({

          recordId,

          lineworksUserId:
            userId,

          language:
            requestLanguage,

          status,

          expectedCompletionDate,

          actualCompletionDate,

          maintenanceResult
        });


      console.log(
        "Engineer repair updated:",
        {
          recordId:
            result.recordId,

          status:
            result.status,

          language:
            result
              .notificationLanguage
        }
      );


      // ==================================
      // Bot 雙向通知
      // ==================================

      const notifications =
        await notifyRepairUpdated(
          result
        );


      // ==================================
      // 回傳語言以案件本身為準
      // ==================================

      const resultMessages =
        getMessages(
          result
            .notificationLanguage
        );


      return res.json({

        success:
          true,

        message:
          resultMessages
            .updateSuccess,

        recordId:
          result.recordId,

        revision:
          result.revision,

        notificationLanguage:
          result
            .notificationLanguage,

        status:
          result.status,

        actualCompletionDate:
          result
            .actualCompletionDate,

        notifications
      });


    } catch (error) {

      console.error(
        "Engineer update error:",
        error.response?.data ||
        error
      );


      if (
        error.statusCode
      ) {

        return res
          .status(
            error.statusCode
          )
          .json({

            success:
              false,

            message:
              error.message
          });
      }


      next(error);
    }
  }
);


module.exports =
  router;
