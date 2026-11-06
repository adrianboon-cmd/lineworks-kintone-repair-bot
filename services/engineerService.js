const axios =
  require("axios");


// ========================================
// kintone 設定
// ========================================

const KINTONE_BASE_URL =
  process.env.KINTONE_BASE_URL;

const KINTONE_APP_ID =
  process.env.KINTONE_APP_ID;

const KINTONE_API_TOKEN =
  process.env.KINTONE_API_TOKEN;


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


// ========================================
// 通知語言正規化
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
// 環境變數檢查
// ========================================

function checkConfig() {

  const missing = [];


  if (!KINTONE_BASE_URL) {

    missing.push(
      "KINTONE_BASE_URL"
    );
  }


  if (!KINTONE_APP_ID) {

    missing.push(
      "KINTONE_APP_ID"
    );
  }


  if (!KINTONE_API_TOKEN) {

    missing.push(
      "KINTONE_API_TOKEN"
    );
  }


  if (
    missing.length > 0
  ) {

    throw new Error(
      `缺少 kintone 環境變數：${missing.join(", ")}`
    );
  }
}


// ========================================
// Query 安全處理
// ========================================

function escapeQueryValue(
  value
) {

  return String(
    value
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /"/g,
      '\\"'
    );
}


// ========================================
// 台北日期
// ========================================

function getTaipeiDate() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Asia/Taipei",

      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit"
    }
  ).format(
    new Date()
  );
}


// ========================================
// 整理 kintone 案件資料
// ========================================

function formatRepair(
  record
) {

  const photos =
    (
      record
        .fault_photo
        ?.value ||
      []
    ).map(
      (file) => ({

        fileKey:
          file.fileKey,

        name:
          file.name,

        contentType:
          file.contentType,

        size:
          file.size
      })
    );


  return {

    recordId:
      record.$id?.value ||
      "",


    revision:
      record.$revision?.value ||
      "",


    notificationLanguage:
      normalizeLanguage(
        record
          .notification_language
          ?.value
      ),


    applicant:
      record["申請人"]?.value ||
      "",


    reporterLineworksUserId:
      record
        .lineworks_user_id
        ?.value ||
      "",


    applicationDate:
      record
        .application_date
        ?.value ||
      "",


    equipmentCategory:
      record
        .equipment_category
        ?.value ||
      "",


    equipmentNumber:
      record
        .equipment_number
        ?.value ||
      "",


    equipmentName:
      record
        .equipment_name
        ?.value ||
      "",


    location:
      record.location?.value ||
      "",


    description:
      record
        .fault_description
        ?.value ||
      "",


    status:
      record["處理狀態"]?.value ||
      "",


    maintenanceStaff:
      (
        record
          .maintenance_staff
          ?.value ||
        []
      ).map(
        (user) => ({

          code:
            user.code,

          name:
            user.name
        })
      ),


    maintenanceLineworksUserId:
      record
        .maintenance_lineworks_user_id
        ?.value ||
      "",


    expectedCompletionDate:
      record
        .expected_completion_date
        ?.value ||
      "",


    actualCompletionDate:
      record
        .actual_completion_date
        ?.value ||
      "",


    maintenanceResult:
      record
        .maintenance_result
        ?.value ||
      "",


    photos,


    photoCount:
      photos.length
  };
}


// ========================================
// 查詢目前工程師負責的案件
// ========================================

async function getAssignedRepairs(
  lineworksUserId
) {

  checkConfig();


  if (!lineworksUserId) {

    throw new Error(
      "缺少 LINE WORKS User ID"
    );
  }


  const safeUserId =
    escapeQueryValue(
      lineworksUserId
    );


  const query =
    `maintenance_lineworks_user_id = "${safeUserId}" ` +
    `order by application_date desc, $id desc`;


  const response =
    await axios.get(

      `${KINTONE_BASE_URL}/k/v1/records.json`,

      {
        headers: {

          "X-Cybozu-API-Token":
            KINTONE_API_TOKEN
        },

        params: {

          app:
            Number(
              KINTONE_APP_ID
            ),

          query,

          fields: [

            "$id",
            "$revision",

            "申請人",
            "lineworks_user_id",
            "notification_language",

            "application_date",

            "equipment_category",
            "equipment_number",
            "equipment_name",

            "location",

            "fault_description",
            "fault_photo",

            "處理狀態",

            "maintenance_staff",
            "maintenance_lineworks_user_id",

            "expected_completion_date",
            "actual_completion_date",

            "maintenance_result"
          ]
        }
      }
    );


  return response
    .data
    .records
    .map(
      formatRepair
    );
}


// ========================================
// 取得單一案件
// ========================================

async function getRepairById(
  recordId
) {

  checkConfig();


  if (!recordId) {

    throw new Error(
      "缺少案件編號"
    );
  }


  const response =
    await axios.get(

      `${KINTONE_BASE_URL}/k/v1/record.json`,

      {
        headers: {

          "X-Cybozu-API-Token":
            KINTONE_API_TOKEN
        },

        params: {

          app:
            Number(
              KINTONE_APP_ID
            ),

          id:
            Number(
              recordId
            )
        }
      }
    );


  return formatRepair(
    response.data.record
  );
}


// ========================================
// 更新工程師維修進度
// ========================================

async function updateRepairProgress({
  recordId,
  lineworksUserId,
  language,
  status,
  expectedCompletionDate,
  actualCompletionDate,
  maintenanceResult
}) {

  checkConfig();


  if (!recordId) {

    throw new Error(
      "缺少案件編號"
    );
  }


  if (!lineworksUserId) {

    throw new Error(
      "缺少 LINE WORKS User ID"
    );
  }


  const allowedStatuses = [

    "已指派工程師",

    "維修中",

    "無法維修",

    "已完成"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "處理狀態不正確"
    );
  }


  // ======================================
  // 取得更新前案件
  // ======================================

  const existingRepair =
    await getRepairById(
      recordId
    );


  // ======================================
  // 驗證案件是否屬於目前工程師
  // ======================================

  if (
    existingRepair
      .maintenanceLineworksUserId !==
    lineworksUserId
  ) {

    const error =
      new Error(
        "此案件未指派給目前登入的工程師"
      );


    error.statusCode =
      403;


    throw error;
  }


  // ======================================
  // 案件通知語言
  //
  // 以 kintone 案件語言為優先。
  // 舊案件沒有語言時才使用 WOFF 語言。
  // ======================================

  const storedLanguage =
    existingRepair
      .notificationLanguage;


  const notificationLanguage =
    normalizeLanguage(
      storedLanguage ||
      language
    );


  // ======================================
  // 完成日期
  // ======================================

  let finalActualCompletionDate =
    actualCompletionDate ||
    "";


  if (
    status === "已完成" &&
    !finalActualCompletionDate
  ) {

    finalActualCompletionDate =
      getTaipeiDate();
  }


  // ======================================
  // 更新欄位
  // ======================================

  const record = {

    "處理狀態": {
      value:
        status
    },


    notification_language: {
      value:
        notificationLanguage
    },


    expected_completion_date: {
      value:
        expectedCompletionDate ||
        null
    },


    actual_completion_date: {
      value:
        finalActualCompletionDate ||
        null
    },


    maintenance_result: {
      value:
        maintenanceResult ||
        ""
    }
  };


  const updateResponse =
    await axios.put(

      `${KINTONE_BASE_URL}/k/v1/record.json`,

      {
        app:
          Number(
            KINTONE_APP_ID
          ),

        id:
          Number(
            recordId
          ),

        record
      },

      {
        headers: {

          "X-Cybozu-API-Token":
            KINTONE_API_TOKEN,

          "Content-Type":
            "application/json"
        }
      }
    );


  // ======================================
  // 通知用工程師名稱
  // ======================================

  const engineerNames =
    (
      existingRepair
        .maintenanceStaff ||
      []
    )
      .map(
        (user) =>
          user.name
      )
      .filter(
        Boolean
      )
      .join("、");


  // ======================================
  // 回傳通知需要的完整資料
  // ======================================

  return {

    recordId:
      String(
        recordId
      ),


    revision:
      updateResponse
        .data
        .revision,


    notificationLanguage,


    previousStatus:
      existingRepair.status,


    status,


    applicant:
      existingRepair.applicant,


    reporterLineworksUserId:
      existingRepair
        .reporterLineworksUserId,


    engineerLineworksUserId:
      lineworksUserId,


    engineerNames,


    applicationDate:
      existingRepair
        .applicationDate,


    equipmentCategory:
      existingRepair
        .equipmentCategory,


    equipmentNumber:
      existingRepair
        .equipmentNumber,


    equipmentName:
      existingRepair
        .equipmentName,


    location:
      existingRepair.location,


    description:
      existingRepair.description,


    expectedCompletionDate:
      expectedCompletionDate ||
      "",


    actualCompletionDate:
      finalActualCompletionDate,


    maintenanceResult:
      maintenanceResult ||
      ""
  };
}


// ========================================
// 下載 kintone 附件
// ========================================

async function downloadRepairPhoto(
  fileKey
) {

  checkConfig();


  if (!fileKey) {

    throw new Error(
      "缺少圖片 File Key"
    );
  }


  const response =
    await axios.get(

      `${KINTONE_BASE_URL}/k/v1/file.json`,

      {
        headers: {

          "X-Cybozu-API-Token":
            KINTONE_API_TOKEN
        },

        params: {
          fileKey
        },

        responseType:
          "arraybuffer"
      }
    );


  return {

    data:
      response.data,

    contentType:
      response.headers[
        "content-type"
      ] ||
      "application/octet-stream"
  };
}


// ========================================
// 匯出
// ========================================

module.exports = {

  getAssignedRepairs,

  getRepairById,

  updateRepairProgress,

  downloadRepairPhoto
};
