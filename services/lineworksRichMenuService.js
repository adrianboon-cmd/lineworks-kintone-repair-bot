const axios = require("axios");
const fs = require("fs");
const path = require("path");

const {
  getAccessToken
} = require(
  "./lineworksBotService"
);


// ========================================
// 基本設定
// ========================================

const API_BASE_URL =
  "https://www.worksapis.com/v1.0";

const BOT_ID =
  process.env.LINEWORKS_BOT_ID;

const WOFF_URL =
  process.env.LINEWORKS_WOFF_URL;

const RICHMENU_IMAGE_PATH =
  path.join(
    __dirname,
    "../assets/repair-richmenu.png"
  );


// ========================================
// 設定檢查
// ========================================

function checkConfig() {

  const missing = [];


  if (!BOT_ID) {

    missing.push(
      "LINEWORKS_BOT_ID"
    );
  }


  if (!WOFF_URL) {

    missing.push(
      "LINEWORKS_WOFF_URL"
    );
  }


  if (missing.length > 0) {

    throw new Error(
      `缺少環境變數：${missing.join(", ")}`
    );
  }


  if (
    !fs.existsSync(
      RICHMENU_IMAGE_PATH
    )
  ) {

    throw new Error(
      "找不到 assets/repair-richmenu.png"
    );
  }
}


// ========================================
// 檢查圖片
// ========================================

function getImageInformation() {

  checkConfig();


  const stats =
    fs.statSync(
      RICHMENU_IMAGE_PATH
    );


  const maximumSize =
    1024 * 1024;


  if (
    stats.size >
    maximumSize
  ) {

    throw new Error(
      "Rich Menu 圖片超過 1 MB，請壓縮 PNG 後重新上傳"
    );
  }


  return {

    fileName:
      "repair-richmenu.png",

    fileSize:
      stats.size,

    filePath:
      RICHMENU_IMAGE_PATH
  };
}


// ========================================
// 共用 Authorization Header
// ========================================

async function getAuthorizationHeaders() {

  const accessToken =
    await getAccessToken();


  return {

    Authorization:
      `Bearer ${accessToken}`
  };
}


// ========================================
// 1. 取得圖片 Upload URL 與 fileId
// ========================================

async function createImageUploadResource() {

  const image =
    getImageInformation();


  const headers =
    await getAuthorizationHeaders();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const response =
    await axios.post(

      `${API_BASE_URL}/bots/` +
      `${encodedBotId}/attachments`,

      {
        fileName:
          image.fileName
      },

      {
        headers: {

          ...headers,

          "Content-Type":
            "application/json"
        },

        timeout:
          15000
      }
    );


  const fileId =
    response.data.fileId;


  const uploadUrl =
    response.data.uploadUrl;


  if (
    !fileId ||
    !uploadUrl
  ) {

    throw new Error(
      "LINE WORKS 未回傳 Rich Menu 圖片的 fileId 或 uploadUrl"
    );
  }


  console.log(
    "Rich Menu upload resource created:",
    {
      fileId,
      fileSize:
        image.fileSize
    }
  );


  return {

    ...image,

    fileId,

    uploadUrl
  };
}


// ========================================
// 2. 將 PNG 上傳至 LINE WORKS Storage
// ========================================

async function uploadRichMenuImage() {

  const uploadResource =
    await createImageUploadResource();


  const imageBuffer =
    fs.readFileSync(
      uploadResource.filePath
    );


  /*
    uploadUrl 是 LINE WORKS 回傳的一次性 URL。
    這裡直接把 PNG binary 上傳至 Storage。
  */

  await axios.put(

    uploadResource.uploadUrl,

    imageBuffer,

    {
      headers: {

        "Content-Type":
          "image/png",

        "Content-Length":
          imageBuffer.length
      },

      maxBodyLength:
        Infinity,

      timeout:
        30000
    }
  );


  console.log(
    "Rich Menu image uploaded:",
    {
      fileId:
        uploadResource.fileId,

      fileSize:
        uploadResource.fileSize
    }
  );


  return {

    fileId:
      uploadResource.fileId,

    fileSize:
      uploadResource.fileSize
  };
}


// ========================================
// 建立三個功能 URL
// ========================================

function getActionUrls() {

  checkConfig();


  /*
    若 WOFF URL 原本已有 query string，
    使用 URL API 可安全加入 view 參數。
  */

  const createUrl =
    new URL(
      WOFF_URL
    );


  createUrl.searchParams.delete(
    "view"
  );


  const myRepairsUrl =
    new URL(
      WOFF_URL
    );


  myRepairsUrl.searchParams.set(
    "view",
    "my-repairs"
  );


  const engineerUrl =
    new URL(
      WOFF_URL
    );


  engineerUrl.searchParams.set(
    "view",
    "engineer"
  );


  return {

    create:
      createUrl.toString(),

    myRepairs:
      myRepairsUrl.toString(),

    engineer:
      engineerUrl.toString()
  };
}


// ========================================
// 3. 建立 Rich Menu
// ========================================

async function createRichMenu() {

  checkConfig();


  const urls =
    getActionUrls();


  const headers =
    await getAuthorizationHeaders();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const richMenuBody = {

    richmenuName:
      "設備報修系統",

    size: {

      width:
        2500,

      height:
        843
    },

    areas: [

      {
        bounds: {

          x:
            0,

          y:
            0,

          width:
            833,

          height:
            843
        },

        action: {

          type:
            "uri",

          label:
            "我要報修",

          uri:
            urls.create
        }
      },

      {
        bounds: {

          x:
            833,

          y:
            0,

          width:
            834,

          height:
            843
        },

        action: {

          type:
            "uri",

          label:
            "案件查詢",

          uri:
            urls.myRepairs
        }
      },

      {
        bounds: {

          x:
            1667,

          y:
            0,

          width:
            833,

          height:
            843
        },

        action: {

          type:
            "uri",

          label:
            "維修任務",

          uri:
            urls.engineer
        }
      }
    ]
  };


  const response =
    await axios.post(

      `${API_BASE_URL}/bots/` +
      `${encodedBotId}/richmenus`,

      richMenuBody,

      {
        headers: {

          ...headers,

          "Content-Type":
            "application/json"
        },

        timeout:
          15000
      }
    );


  const richmenuId =
    response.data.richmenuId;


  if (!richmenuId) {

    throw new Error(
      "LINE WORKS 未回傳 richmenuId"
    );
  }


  console.log(
    "LINE WORKS Rich Menu created:",
    {
      richmenuId,
      urls
    }
  );


  return {

    richmenuId,

    urls
  };
}


// ========================================
// 4. 將 fileId 套用至 Rich Menu
// ========================================

async function setRichMenuImage(
  richmenuId,
  fileId
) {

  const headers =
    await getAuthorizationHeaders();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const encodedRichmenuId =
    encodeURIComponent(
      richmenuId
    );


  await axios.post(

    `${API_BASE_URL}/bots/` +
    `${encodedBotId}/richmenus/` +
    `${encodedRichmenuId}/image`,

    {
      fileId
    },

    {
      headers: {

        ...headers,

        "Content-Type":
          "application/json"
      },

      timeout:
        15000
    }
  );


  console.log(
    "Rich Menu image assigned:",
    {
      richmenuId,
      fileId
    }
  );


  return {
    success: true
  };
}


// ========================================
// 5. 設為 Default Rich Menu
// ========================================

async function setDefaultRichMenu(
  richmenuId
) {

  const headers =
    await getAuthorizationHeaders();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const encodedRichmenuId =
    encodeURIComponent(
      richmenuId
    );


  const response =
    await axios.post(

      `${API_BASE_URL}/bots/` +
      `${encodedBotId}/richmenus/` +
      `${encodedRichmenuId}/set-default`,

      null,

      {
        headers,

        timeout:
          15000
      }
    );


  console.log(
    "Default Rich Menu set:",
    {
      botId:
        BOT_ID,

      richmenuId
    }
  );


  return {

    botId:
      response.data?.botId ||
      BOT_ID,

    defaultRichmenuId:
      response.data
        ?.defaultRichmenuId ||
      richmenuId
  };
}


// ========================================
// 完整 Rich Menu Setup
// ========================================

async function setupRepairRichMenu() {

  checkConfig();


  console.log(
    "Starting LINE WORKS Rich Menu setup..."
  );


  /*
    官方流程：

    1. Upload bot content
    2. Create rich menu
    3. Set rich menu image
    4. Set default rich menu
  */


  const uploadedImage =
    await uploadRichMenuImage();


  const createdRichMenu =
    await createRichMenu();


  await setRichMenuImage(

    createdRichMenu.richmenuId,

    uploadedImage.fileId
  );


  const defaultResult =
    await setDefaultRichMenu(
      createdRichMenu.richmenuId
    );


  const result = {

    success:
      true,

    richmenuId:
      createdRichMenu.richmenuId,

    fileId:
      uploadedImage.fileId,

    imageSize:
      uploadedImage.fileSize,

    urls:
      createdRichMenu.urls,

    defaultRichmenuId:
      defaultResult.defaultRichmenuId
  };


  console.log(
    "LINE WORKS Rich Menu setup completed:",
    result
  );


  return result;
}


// ========================================
// 匯出
// ========================================

module.exports = {

  setupRepairRichMenu
};
