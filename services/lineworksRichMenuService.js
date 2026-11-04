const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

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
// 檢查 Rich Menu 圖片
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


  if (
    stats.size <= 0
  ) {

    throw new Error(
      "Rich Menu 圖片內容為空"
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
// Authorization Header
// ========================================

async function getAuthorizationHeaders() {

  const accessToken =
    await getAccessToken();


  if (!accessToken) {

    throw new Error(
      "無法取得 LINE WORKS Access Token"
    );
  }


  return {

    Authorization:
      `Bearer ${accessToken}`
  };
}


// ========================================
// 1. 取得 Storage Upload URL 與 fileId
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


  try {

    const response =
      await axios.post(

        `${API_BASE_URL}/bots/` +
        `${encodedBotId}/attachments`,

        {
          fileName:
            image.fileName,

          fileSize:
            image.fileSize
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
      response.data?.fileId;


    const uploadUrl =
      response.data?.uploadUrl;


    if (
      !fileId ||
      !uploadUrl
    ) {

      throw new Error(
        "LINE WORKS 未回傳圖片的 fileId 或 uploadUrl"
      );
    }


    console.log(
      "Rich Menu upload resource created:",
      {
        fileId,
        fileName:
          image.fileName,
        fileSize:
          image.fileSize,
        uploadHost:
          new URL(
            uploadUrl
          ).host
      }
    );


    return {

      ...image,

      fileId,

      uploadUrl
    };


  } catch (error) {

    console.error(
      "Create Rich Menu upload resource failed:",
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,

        url:
          error.config?.url
      }
    );


    throw error;
  }
}


// ========================================
// 2. 上傳 PNG 至 LINE WORKS Storage
// ========================================

async function uploadRichMenuImage() {

  const uploadResource =
    await createImageUploadResource();


  const imageBuffer =
    fs.readFileSync(
      uploadResource.filePath
    );


  const accessToken =
    await getAccessToken();


  const form =
    new FormData();


  /*
    LINE WORKS Storage Upload 必要欄位：

    resourceName
    Filedata
  */

  form.append(
    "resourceName",
    uploadResource.fileName
  );


  form.append(
    "Filedata",
    imageBuffer,
    {
      filename:
        uploadResource.fileName,

      contentType:
        "image/png",

      knownLength:
        imageBuffer.length
    }
  );


  try {

    const response =
      await axios.post(

        uploadResource.uploadUrl,

        form,

        {
          headers: {

            Authorization:
              `Bearer ${accessToken}`,

            ...form.getHeaders()
          },

          maxBodyLength:
            Infinity,

          maxContentLength:
            Infinity,

          timeout:
            30000,

          validateStatus:
            (status) =>
              status >= 200 &&
              status < 300
        }
      );


    const uploadedFileId =
      response.data?.fileId ||
      uploadResource.fileId;


    console.log(
      "Rich Menu image uploaded:",
      {
        fileId:
          uploadedFileId,

        fileName:
          uploadResource.fileName,

        fileSize:
          uploadResource.fileSize,

        status:
          response.status
      }
    );


    return {

      fileId:
        uploadedFileId,

      fileSize:
        uploadResource.fileSize
    };


  } catch (error) {

    console.error(
      "Rich Menu image upload failed:",
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,

        method:
          error.config?.method,

        uploadHost:
          (() => {

            try {

              return new URL(
                uploadResource.uploadUrl
              ).host;

            } catch {

              return "unknown";
            }

          })()
      }
    );


    throw error;
  }
}


// ========================================
// 建立三個 WOFF 功能 URL
// ========================================

function getActionUrls() {

  checkConfig();


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
// 3. 建立三欄 Rich Menu
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

      // ================================
      // 我要報修
      // ================================

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


      // ================================
      // 案件查詢
      // ================================

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


      // ================================
      // 維修任務
      // ================================

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


  try {

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
      response.data?.richmenuId;


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


  } catch (error) {

    console.error(
      "Create Rich Menu failed:",
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,

        url:
          error.config?.url
      }
    );


    throw error;
  }
}


// ========================================
// 4. 將圖片 fileId 套用至 Rich Menu
// ========================================

async function setRichMenuImage(
  richmenuId,
  fileId
) {

  if (!richmenuId) {

    throw new Error(
      "缺少 richmenuId"
    );
  }


  if (!fileId) {

    throw new Error(
      "缺少 Rich Menu 圖片 fileId"
    );
  }


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


  try {

    const response =
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
        fileId,
        status:
          response.status
      }
    );


    return {
      success: true
    };


  } catch (error) {

    console.error(
      "Set Rich Menu image failed:",
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,

        richmenuId,

        fileId
      }
    );


    throw error;
  }
}


// ========================================
// 5. 設為 Bot Default Rich Menu
// ========================================

async function setDefaultRichMenu(
  richmenuId
) {

  if (!richmenuId) {

    throw new Error(
      "缺少 richmenuId"
    );
  }


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


  try {

    const response =
      await axios.post(

        `${API_BASE_URL}/bots/` +
        `${encodedBotId}/richmenus/` +
        `${encodedRichmenuId}/set-default`,

        null,

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


    const defaultRichmenuId =
      response.data?.defaultRichmenuId ||
      richmenuId;


    console.log(
      "Default Rich Menu set:",
      {
        botId:
          BOT_ID,

        richmenuId,

        defaultRichmenuId,

        status:
          response.status
      }
    );


    return {

      botId:
        response.data?.botId ||
        BOT_ID,

      defaultRichmenuId
    };


  } catch (error) {

    console.error(
      "Set Default Rich Menu failed:",
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,

        richmenuId
      }
    );


    throw error;
  }
}


// ========================================
// 完整 Rich Menu Setup
// ========================================

async function setupRepairRichMenu() {

  checkConfig();


  console.log(
    "Starting LINE WORKS Rich Menu setup..."
  );


  // 1. 上傳圖片
  const uploadedImage =
    await uploadRichMenuImage();


  // 2. 建立 Rich Menu
  const createdRichMenu =
    await createRichMenu();


  // 3. 套用圖片
  await setRichMenuImage(

    createdRichMenu.richmenuId,

    uploadedImage.fileId
  );


  // 4. 設成 Default
  const defaultResult =
    await setDefaultRichMenu(
      createdRichMenu.richmenuId
    );


  const result = {

    success:
      true,

    richmenuId:
      createdRichMenu.richmenuId,

    defaultRichmenuId:
      defaultResult.defaultRichmenuId,

    fileId:
      uploadedImage.fileId,

    imageSize:
      uploadedImage.fileSize,

    urls:
      createdRichMenu.urls
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
