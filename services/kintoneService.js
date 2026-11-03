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
        "測試員工"
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


module.exports = {
  createRepair
};
