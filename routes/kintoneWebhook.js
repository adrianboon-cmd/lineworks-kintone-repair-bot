const express =
  require("express");

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
// 取得 kintone 欄位值
// ========================================

function getFieldValue(
  record,
  fieldCode,
  defaultValue = ""
) {

  return (
    record?.[fieldCode]?.value ??
    defaultValue
  );
}


// ========================================
// 日期格式
// ========================================

function formatDate(
  value,
  language
) {

  if (!value) {

    const emptyDateText = {

      "zh-TW":
        "未設定",

      "ja-JP":
        "未設定",

      "en-US":
        "Not set"
    };


    return (
      emptyDateText[
        normalizeLanguage(
          language
        )
      ] ||
      emptyDateText[
        "zh-TW"
      ]
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
// 設備類別翻譯
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


// ========================================
// 翻譯儲存值
// ========================================

function translateStoredValue(
  translations,
  language,
  value
) {

  const normalizedLanguage =
    normalizeLanguage(
      language
    );


  return (
    translations[
      normalizedLanguage
    ]?.[value] ||
    value ||
    ""
  );
}


function translateEquipmentCategory(
  language,
  value
) {

  return translateStoredValue(
    EQUIPMENT_CATEGORY_TRANSLATIONS,
    language,
    value
  );
}


function translateLocation(
  language,
  value
) {

  return translateStoredValue(
    LOCATION_TRANSLATIONS,
    language,
    value
  );
}


function translateStatus(
  language,
  value
) {

  return translateStoredValue(
    STATUS_TRANSLATIONS,
    language,
    value
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

    assigned:
      "已指派",

    caseNumber:
      "案件編號",

    equipmentCategory:
      "設備類別",

    equipmentName:
      "設備名稱",

    equipmentNumber:
      "設備編號",

    location:
      "所在位置",

    applicant:
      "報修人",

    applicationDate:
      "申請日期",

    status:
      "目前狀態",

    maintenanceStaff:
      "維修人員",

    expectedCompletionDate:
      "預計完成日期",

    actualCompletionDate:
      "實際完成日期",

    faultDescription:
      "故障描述",

    maintenanceProgress:
      "維修進度",

    maintenanceExplanation:
      "處理說明",

    maintenanceResult:
      "維修結果",

    engineerAssignmentTitle:
      "🔧 新維修任務",

    reporterAssignmentTitle:
      "👨‍🔧 維修工程師已指派",

    inProgressTitle:
      "🧰 報修案件進度更新",

    unableTitle:
      "⚠️ 報修案件狀態更新",

    completedTitle:
      "✅ 報修案件已完成",

    engineerAssignmentFooter:
      "請進入「設備報修系統 → 維修任務」查看並處理案件。",

    reporterAssignmentFooter:
      "您可以進入「設備報修系統 → 案件查詢」查看最新進度。",

    inProgressFooter:
      "您可以進入「設備報修系統 → 案件查詢」查看最新進度。",

    unableFooter:
      "請進入「設備報修系統 → 案件查詢」查看案件詳情。",

    completedFooter:
      "您可以進入「設備報修系統 → 案件查詢」查看完整紀錄。"
  },


  // ======================================
  // 日本語
  // ======================================

  "ja-JP": {

    notSet:
      "未設定",

    notEntered:
      "未入力",

    assigned:
      "割当済み",

    caseNumber:
      "案件番号",

    equipmentCategory:
      "設備カテゴリー",

    equipmentName:
      "設備名",

    equipmentNumber:
      "設備番号",

    location:
      "設置場所",

    applicant:
      "申請者",

    applicationDate:
      "申請日",

    status:
      "現在のステータス",

    maintenanceStaff:
      "修理担当者",

    expectedCompletionDate:
      "完了予定日",

    actualCompletionDate:
      "完了日",

    faultDescription:
      "故障内容",

    maintenanceProgress:
      "対応状況",

    maintenanceExplanation:
      "対応内容",

    maintenanceResult:
      "対応結果",

    engineerAssignmentTitle:
      "🔧 新しい修理タスク",

    reporterAssignmentTitle:
      "👨‍🔧 修理担当者が割り当てられました",

    inProgressTitle:
      "🧰 修理案件の進捗更新",

    unableTitle:
      "⚠️ 修理案件のステータス更新",

    completedTitle:
      "✅ 修理案件が完了しました",

    engineerAssignmentFooter:
      "「設備修理システム → 修理タスク」から案件を確認し、対応してください。",

    reporterAssignmentFooter:
      "「設備修理システム → 案件照会」から最新の進捗を確認できます。",

    inProgressFooter:
      "「設備修理システム → 案件照会」から最新の進捗を確認できます。",

    unableFooter:
      "「設備修理システム → 案件照会」から案件詳細を確認してください。",

    completedFooter:
      "「設備修理システム → 案件照会」から対応履歴を確認できます。"
  },


  // ======================================
  // English
  // ======================================

  "en-US": {

    notSet:
      "Not set",

    notEntered:
      "Not entered",

    assigned:
      "Assigned",

    caseNumber:
      "Case Number",

    equipmentCategory:
      "Equipment Category",

    equipmentName:
      "Equipment Name",

    equipmentNumber:
      "Equipment Number",

    location:
      "Location",

    applicant:
      "Applicant",

    applicationDate:
      "Request Date",

    status:
      "Status",

    maintenanceStaff:
      "Maintenance Engineer",

    expectedCompletionDate:
      "Expected Completion Date",

    actualCompletionDate:
      "Actual Completion Date",

    faultDescription:
      "Fault Description",

    maintenanceProgress:
      "Repair Progress",

    maintenanceExplanation:
      "Service Note",

    maintenanceResult:
      "Maintenance Result",

    engineerAssignmentTitle:
      "🔧 New Repair Task",

    reporterAssignmentTitle:
      "👨‍🔧 Maintenance Engineer Assigned",

    inProgressTitle:
      "🧰 Repair Case Progress Updated",

    unableTitle:
      "⚠️ Repair Case Status Updated",

    completedTitle:
      "✅ Repair Case Completed",

    engineerAssignmentFooter:
      "Open “Equipment Repair System → Repair Tasks” to view and process the case.",

    reporterAssignmentFooter:
      "Open “Equipment Repair System → My Cases” to view the latest progress.",

    inProgressFooter:
      "Open “Equipment Repair System → My Cases” to view the latest progress.",

    unableFooter:
      "Open “Equipment Repair System → My Cases” to view the case details.",

    completedFooter:
      "Open “Equipment Repair System → My Cases” to view the complete service history."
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
// 工程師指派通知：工程師
// ========================================

function buildEngineerAssignmentMessage(
  repair
) {

  const language =
    repair.notificationLanguage;

  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.engineerAssignmentTitle,

    "",

    `${messages.caseNumber}：#${repair.recordId}`,

    `${messages.equipmentCategory}：${
      translateEquipmentCategory(
        language,
        repair.equipmentCategory
      ) ||
      messages.notSet
    }`,

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

    `${messages.applicant}：${
      repair.applicant ||
      messages.notSet
    }`,

    `${messages.applicationDate}：${
      formatDate(
        repair.applicationDate,
        language
      )
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        repair.status ||
        "已指派工程師"
      )
    }`,

    "",

    `${messages.faultDescription}：`,

    repair.description ||
      messages.notEntered,

    "",

    messages.engineerAssignmentFooter
  ];


  return lines.join(
    "\n"
  );
}


// ========================================
// 工程師指派通知：報修人
// ========================================

function buildReporterAssignmentMessage(
  repair
) {

  const language =
    repair.notificationLanguage;

  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.reporterAssignmentTitle,

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

    `${messages.maintenanceStaff}：${
      repair.engineerNames ||
      messages.assigned
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        repair.status ||
        "已指派工程師"
      )
    }`,

    "",

    messages.reporterAssignmentFooter
  ];


  return lines.join(
    "\n"
  );
}


// ========================================
// 維修中通知
// ========================================

function buildInProgressMessage(
  repair
) {

  const language =
    repair.notificationLanguage;

  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.inProgressTitle,

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

    `${messages.maintenanceStaff}：${
      repair.engineerNames ||
      messages.notSet
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        "維修中"
      )
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
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      `${messages.maintenanceProgress}：`,

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    messages.inProgressFooter
  );


  return lines.join(
    "\n"
  );
}


// ========================================
// 無法維修通知
// ========================================

function buildUnableToRepairMessage(
  repair
) {

  const language =
    repair.notificationLanguage;

  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.unableTitle,

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

    `${messages.maintenanceStaff}：${
      repair.engineerNames ||
      messages.notSet
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        "無法維修"
      )
    }`
  ];


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      `${messages.maintenanceExplanation}：`,

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    messages.unableFooter
  );


  return lines.join(
    "\n"
  );
}


// ========================================
// 已完成通知
// ========================================

function buildCompletedMessage(
  repair
) {

  const language =
    repair.notificationLanguage;

  const messages =
    getMessages(
      language
    );


  const lines = [

    messages.completedTitle,

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

    `${messages.maintenanceStaff}：${
      repair.engineerNames ||
      messages.notSet
    }`,

    `${messages.status}：${
      translateStatus(
        language,
        "已完成"
      )
    }`
  ];


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


  lines.push(

    "",

    `${messages.maintenanceResult}：`,

    repair.maintenanceResult ||
      messages.notEntered,

    "",

    messages.completedFooter
  );


  return lines.join(
    "\n"
  );
}


// ========================================
// 發送 LINE WORKS 通知
// ========================================

async function sendNotification(
  userId,
  message,
  target,
  recordId,
  language
) {

  if (!userId) {

    return {

      success:
        false,

      skipped:
        true,

      target,

      reason:
        "Missing LINE WORKS User ID"
    };
  }


  try {

    await sendTextMessage(
      userId,
      message
    );


    console.log(
      "kintone webhook notification sent:",
      {
        recordId,
        target,
        userId,
        language
      }
    );


    return {

      success:
        true,

      target
    };


  } catch (error) {

    console.error(
      "kintone webhook notification failed:",
      {
        recordId,
        target,
        userId,
        language,
        message:
          error.message
      }
    );


    return {

      success:
        false,

      target,

      error:
        error.message
    };
  }
}


// ========================================
// 回傳通知處理結果
// ========================================

function sendWebhookResponse(
  res,
  repair,
  message,
  notifications
) {

  return res.json({

    success:
      true,

    message,

    recordId:
      repair.recordId,

    status:
      repair.status,

    language:
      repair.notificationLanguage,

    notifications
  });
}


// ========================================
// POST /api/kintone-webhook
// ========================================

router.post(
  "/",

  express.json({
    limit:
      "2mb"
  }),

  async (
    req,
    res
  ) => {

    const expectedSecret =
      process.env
        .KINTONE_WEBHOOK_SECRET;


    const suppliedSecret =
      req.query.secret;


    if (!expectedSecret) {

      return res
        .status(503)
        .json({

          success:
            false,

          message:
            "KINTONE_WEBHOOK_SECRET 尚未設定"
        });
    }


    if (
      suppliedSecret !==
      expectedSecret
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Webhook 驗證失敗"
        });
    }


    try {

      const webhook =
        req.body ||
        {};


      const record =
        webhook.record;


      if (!record) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Webhook 缺少 record 資料"
          });
      }


      const webhookType =
        webhook.type ||
        "";


      const supportedTypes = [

        "ADD_RECORD",

        "UPDATE_RECORD",

        "UPDATE_STATUS"
      ];


      if (
        webhookType &&
        !supportedTypes.includes(
          webhookType
        )
      ) {

        return res.json({

          success:
            true,

          skipped:
            true,

          reason:
            `不處理 Webhook 類型：${webhookType}`
        });
      }


      // ==================================
      // 維修人員名稱
      // ==================================

      const maintenanceStaff =
        getFieldValue(
          record,
          "maintenance_staff",
          []
        );


      const engineerNames =
        maintenanceStaff
          .map(
            (user) =>
              user.name
          )
          .filter(
            Boolean
          )
          .join("、");


      // ==================================
      // 整理案件資料
      // ==================================

      const repair = {

        recordId:
          record.$id?.value ||
          webhook.id ||
          "",


        notificationLanguage:
          normalizeLanguage(
            getFieldValue(
              record,
              "notification_language"
            )
          ),


        applicant:
          getFieldValue(
            record,
            "申請人"
          ),


        reporterLineworksUserId:
          getFieldValue(
            record,
            "lineworks_user_id"
          ),


        applicationDate:
          getFieldValue(
            record,
            "application_date"
          ),


        equipmentCategory:
          getFieldValue(
            record,
            "equipment_category"
          ),


        equipmentNumber:
          getFieldValue(
            record,
            "equipment_number"
          ),


        equipmentName:
          getFieldValue(
            record,
            "equipment_name"
          ),


        location:
          getFieldValue(
            record,
            "location"
          ),


        description:
          getFieldValue(
            record,
            "fault_description"
          ),


        status:
          getFieldValue(
            record,
            "處理狀態"
          ),


        engineerLineworksUserId:
          getFieldValue(
            record,
            "maintenance_lineworks_user_id"
          ),


        engineerNames,


        expectedCompletionDate:
          getFieldValue(
            record,
            "expected_completion_date"
          ),


        actualCompletionDate:
          getFieldValue(
            record,
            "actual_completion_date"
          ),


        maintenanceResult:
          getFieldValue(
            record,
            "maintenance_result"
          )
      };


      console.log(
        "kintone webhook received:",
        {
          webhookType,
          recordId:
            repair.recordId,
          status:
            repair.status,
          language:
            repair.notificationLanguage,
          reporterUserId:
            repair.reporterLineworksUserId,
          engineerUserId:
            repair.engineerLineworksUserId
        }
      );


      const notifications =
        [];


      // ==================================
      // 待分派工程師處理
      // 但已選擇工程師
      // ==================================

      if (
        repair.status ===
        "待分派工程師處理"
      ) {

        if (
          !repair
            .engineerLineworksUserId
        ) {

          return res.json({

            success:
              true,

            skipped:
              true,

            language:
              repair.notificationLanguage,

            reason:
              "案件尚未指派工程師"
          });
        }


        notifications.push(

          await sendNotification(

            repair
              .engineerLineworksUserId,

            buildEngineerAssignmentMessage(
              repair
            ),

            "engineer",

            repair.recordId,

            repair.notificationLanguage
          )
        );


        if (
          repair
            .reporterLineworksUserId &&
          repair
            .reporterLineworksUserId !==
          repair
            .engineerLineworksUserId
        ) {

          notifications.push(

            await sendNotification(

              repair
                .reporterLineworksUserId,

              buildReporterAssignmentMessage(
                repair
              ),

              "reporter",

              repair.recordId,

              repair.notificationLanguage
            )
          );
        }


        return sendWebhookResponse(

          res,

          repair,

          "Engineer assignment notification processed",

          notifications
        );
      }


      // ==================================
      // 已指派工程師
      // ==================================

      if (
        repair.status ===
        "已指派工程師"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .engineerLineworksUserId,

            buildEngineerAssignmentMessage(
              repair
            ),

            "engineer",

            repair.recordId,

            repair.notificationLanguage
          )
        );


        if (
          repair
            .reporterLineworksUserId &&
          repair
            .reporterLineworksUserId !==
          repair
            .engineerLineworksUserId
        ) {

          notifications.push(

            await sendNotification(

              repair
                .reporterLineworksUserId,

              buildReporterAssignmentMessage(
                repair
              ),

              "reporter",

              repair.recordId,

              repair.notificationLanguage
            )
          );
        }


        return sendWebhookResponse(

          res,

          repair,

          "Engineer assignment notification processed",

          notifications
        );
      }


      // ==================================
      // 維修中
      // ==================================

      if (
        repair.status ===
        "維修中"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildInProgressMessage(
              repair
            ),

            "reporter",

            repair.recordId,

            repair.notificationLanguage
          )
        );


        return sendWebhookResponse(

          res,

          repair,

          "Repair progress notification processed",

          notifications
        );
      }


      // ==================================
      // 無法維修
      // ==================================

      if (
        repair.status ===
        "無法維修"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildUnableToRepairMessage(
              repair
            ),

            "reporter",

            repair.recordId,

            repair.notificationLanguage
          )
        );


        return sendWebhookResponse(

          res,

          repair,

          "Unable-to-repair notification processed",

          notifications
        );
      }


      // ==================================
      // 已完成
      // ==================================

      if (
        repair.status ===
        "已完成"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildCompletedMessage(
              repair
            ),

            "reporter",

            repair.recordId,

            repair.notificationLanguage
          )
        );


        return sendWebhookResponse(

          res,

          repair,

          "Repair completion notification processed",

          notifications
        );
      }


      // ==================================
      // 其他狀態
      // ==================================

      return res.json({

        success:
          true,

        skipped:
          true,

        language:
          repair.notificationLanguage,

        reason:
          `目前狀態「${repair.status}」未設定 Bot 通知`
      });


    } catch (error) {

      console.error(
        "kintone webhook error:",
        error.response?.data ||
        error
      );


      return res.json({

        success:
          false,

        message:
          error.message ||
          "Webhook 處理失敗"
      });
    }
  }
);


module.exports =
  router;
