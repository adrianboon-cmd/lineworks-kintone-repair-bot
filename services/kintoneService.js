const axios = require("axios");
const FormData = require("form-data");

const KINTONE_BASE_URL = process.env.KINTONE_BASE_URL;
const KINTONE_APP_ID = process.env.KINTONE_APP_ID;
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN;


// ========================================
// 檢查環境變數
// ========================================

function checkConfig() {
  if (
    !KINTONE_BASE_URL ||
    !KINTONE_APP_ID ||
    !KINTONE_API_TOKEN
  ) {
    throw new Error(
      "kintone 環境變數尚未設定完整"
    );
  }
}


// ========================================
// 上傳單一圖片到 kintone
// ========================================

async function uploadFile(file) {

  checkConfig();

  const form = new FormData();

  form.append(
    "file",
    file.buffer,
    {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size
    }
  );

  const response = await axios.post(
    `${KINTONE_BASE_URL}/k/v1/file.json`,
    form,
    {
      headers: {
        "X-Cybozu-API-Token":
          KINTONE_API_TOKEN,

        ...form.getHeaders()
      },

      maxBodyLength: Infinity
    }
  );

  return response.data.fileKey;
}


// ========================================
// 建立報修案件
// ========================================

async function createRepair(
  repairData,
  files = []
) {

  checkConfig();

  // ------------------------------
  // 1. 上傳所有照片
  // ------------------------------

  const uploadedFiles = [];

  for (const file of files) {

    const fileKey =
      await uploadFile(file);

    uploadedFiles.push({
      fileKey: fileKey
    });
  }


  // ------------------------------
  // 2. 當天日期
  // ------------------------------

  const applicationDate =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(new Date());


  // ------------------------------
  // 3. kintone Record
  // ------------------------------

const record = {

  "申請人": {
    value:
      repairData.reporterName ||
      ""
  },

  lineworks_user_id: {
    value:
      repairData.reporterId ||
      ""
  },

  application_date: {
    value: applicationDate
  },

  equipment_category: {
    value:
      repairData.equipmentCategory
  },

  equipment_number: {
    value:
      repairData.equipmentNumber || ""
  },

  equipment_name: {
    value:
      repairData.equipmentName
  },

  location: {
    value:
      repairData.location
  },

  fault_description: {
    value:
      repairData.description
  },

  fault_photo: {
    value: uploadedFiles
  },

  "處理狀態": {
    value: "待分派工程師處理"
  }
};

  // ------------------------------
  // 4. 建立 kintone Record
  // ------------------------------

  const response = await axios.post(

    `${KINTONE_BASE_URL}/k/v1/record.json`,

    {
      app: Number(KINTONE_APP_ID),
      record: record
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


  // kintone Add Record API
  // 回傳 id / revision

  return {
    recordId: response.data.id,
    revision: response.data.revision
  };
}

// ========================================
// 查詢目前使用者報修的案件
// ========================================

async function getMyRepairs(lineworksUserId) {

  checkConfig();

  if (!lineworksUserId) {
    throw new Error(
      "缺少 LINE WORKS User ID"
    );
  }


  // 防止 query 特殊字元造成問題
  const safeUserId =
    lineworksUserId
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');


  // kintone Query
  // 只抓目前 LINE WORKS 使用者建立的案件
  const query =
    `lineworks_user_id = "${safeUserId}" ` +
    `order by application_date desc, $id desc`;


  const response = await axios.get(
    `${KINTONE_BASE_URL}/k/v1/records.json`,
    {
      headers: {
        "X-Cybozu-API-Token":
          KINTONE_API_TOKEN
      },

      params: {
        app: Number(KINTONE_APP_ID),
        query: query,

        fields: [
          "$id",
          "$revision",
          "application_date",
          "equipment_category",
          "equipment_number",
          "equipment_name",
          "location",
          "fault_description",
          "fault_photo",
          "處理狀態",
          "maintenance_staff",
          "expected_completion_date",
          "actual_completion_date",
          "maintenance_result",
          "lineworks_user_id"
        ]
      }
    }
  );


  // ======================================
  // 整理成前端比較好使用的格式
  // ======================================

  const repairs =
    response.data.records.map(
      (record) => {

        return {

          recordId:
            record.$id?.value || "",

          applicationDate:
            record.application_date?.value ||
            "",

          equipmentCategory:
            record.equipment_category?.value ||
            "",

          equipmentNumber:
            record.equipment_number?.value ||
            "",

          equipmentName:
            record.equipment_name?.value ||
            "",

          location:
            record.location?.value ||
            "",

          description:
            record.fault_description?.value ||
            "",

          status:
            record["處理狀態"]?.value ||
            "",

          maintenanceStaff:
            (
              record.maintenance_staff?.value ||
              []
            ).map(
              (user) => ({
                code: user.code,
                name: user.name
              })
            ),

          expectedCompletionDate:
            record
              .expected_completion_date
              ?.value || "",

          actualCompletionDate:
            record
              .actual_completion_date
              ?.value || "",

          maintenanceResult:
            record
              .maintenance_result
              ?.value || "",

          photoCount:
            record.fault_photo?.value
              ?.length || 0
        };
      }
    );


  return repairs;
}

module.exports = {
  createRepair,
  getMyRepairs
};
