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

const MAXIMUM_IMAGE_SIZE =
  1024 * 1024;


// ========================================
// Rich Menu 語系設定
// ========================================

const RICHMENU_CONFIGS = {

  "zh-TW": {

    language:
      "zh-TW",

    lineworksLanguage:
      "zh_TW",

    richmenuName:
      "設備報修系統 ZH",

    imageFileName:
      "repair-richmenu-zh.png",

    imagePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-zh.png"
      ),

    labels: {
      create:
        "我要報修",

      myRepairs:
        "案件查詢",

      engineer:
        "維修任務"
    }
  },


  "ja-JP": {

    language:
      "ja-JP",

    lineworksLanguage:
      "ja_JP",

    richmenuName:
      "設備修理システム JA",

    imageFileName:
      "repair-richmenu-ja.png",

    imagePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-ja.png"
      ),

    labels: {
      create:
        "修理を依頼",

      myRepairs:
        "案件照会",

      engineer:
        "修理タスク"
    }
  },


  "en-US": {

    language:
      "en-US",

    lineworksLanguage:
      "en_US",

    richmenuName:
      "Equipment Repair System EN",

    imageFileName:
      "repair-richmenu-en.png",

    imagePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-en.png"
      ),

    labels: {
      create:
        "Request Repair",

      myRepairs:
        "My Cases",

      engineer:
        "Repair Tasks"
    }
  }
};


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


  if (
    missing.length > 0
  ) {

    throw new Error(
      `缺少環境變數：${missing.join(", ")}`
    );
  }


  Object
    .values(
      RICHMENU_CONFIGS
    )
    .forEach(
      (config) => {

        if (
          !fs.existsSync(
            config.imagePath
          )
        ) {

          throw new Error(
            `找不到 assets/${config.imageFileName}`
          );
        }


        const stats =
          fs.statSync(
            config.imagePath
          );


        if (
          stats.size <= 0
        ) {

          throw new Error(
            `${config.imageFileName} 圖片內容為空`
          );
        }


        if (
          stats.size >
          MAXIMUM_IMAGE_SIZE
        ) {

          throw new Error(
            `${config.imageFileName} 超過 1 MB`
          );
        }
      }
    );
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
// 取得圖片資訊
// ========================================

function getImageInformation(
  language
) {

  const config =
    RICHMENU_CONFIGS[
      language
    ];


  if (!config) {

    throw new Error(
      `不支援 Rich Menu 語系：${language}`
    );
  }


  const stats =
    fs.statSync(
      config.imagePath
    );


  return {

    fileName:
      config.imageFileName,

    filePath:
      config.imagePath,

    fileSize:
      stats.size
  };
}


// ========================================
// 建立各語系 WOFF URL
// ========================================

function getActionUrls(
  language
) {

  const createUrl =
    new URL(
      WOFF_URL
    );


  createUrl.searchParams.delete(
    "view"
  );

  createUrl.searchParams.set(
    "lang",
    language
  );


  const myRepairsUrl =
    new URL(
      WOFF_URL
    );


  myRepairsUrl.searchParams.set(
    "view",
    "my-repairs"
  );

  myRepairsUrl.searchParams.set(
    "lang",
    language
  );


  const engineerUrl =
    new URL(
      WOFF_URL
    );


  engineerUrl.searchParams.set(
    "view",
    "engineer"
  );

  engineerUrl.searchParams.set(
    "lang",
    language
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
// Desktop 多語 Label
// ========================================

function createI18nLabels(
  actionKey
) {

  return [

    {
      language:
        "zh_TW",

      label:
        RICHMENU_CONFIGS[
          "zh-TW"
        ].labels[
          actionKey
        ]
    },

    {
      language:
        "ja_JP",

      label:
        RICHMENU_CONFIGS[
          "ja-JP"
        ].labels[
          actionKey
        ]
    },

    {
      language:
        "en_US",

      label:
        RICHMENU_CONFIGS[
          "en-US"
        ].labels[
          actionKey
        ]
    }
  ];
}


// ========================================
// 建立 Storage Upload Resource
// ========================================

async function createImageUploadResource(
  language
) {

  const image =
    getImageInformation(
      language
    );


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
        `LINE WORKS 未回傳 ${language} 圖片的 fileId 或 uploadUrl`
      );
    }


    console.log(
      "Rich Menu upload resource created:",
      {
        language,
        fileId,
        fileName:
          image.fileName,
        fileSize:
          image.fileSize
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
        language,

        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message
      }
    );


    throw error;
  }
}


// ========================================
// 上傳 Rich Menu 圖片
// ========================================

async function uploadRichMenuImage(
  language
) {

  const uploadResource =
    await createImageUploadResource(
      language
    );


  const imageBuffer =
    fs.readFileSync(
      uploadResource.filePath
    );


  const accessToken =
    await getAccessToken();


  const form =
    new FormData();


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
        language,

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

      language,

      fileId:
        uploadedFileId,

      fileSize:
        uploadResource.fileSize,

      fileName:
        uploadResource.fileName
    };


  } catch (error) {

    console.error(
      "Rich Menu image upload failed:",
      {
        language,

        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message
      }
    );


    throw error;
  }
}


// ========================================
// 建立一個語系 Rich Menu
// ========================================

async function createRichMenu(
  language
) {

  const config =
    RICHMENU_CONFIGS[
      language
    ];


  if (!config) {

    throw new Error(
      `不支援 Rich Menu 語系：${language}`
    );
  }


  const urls =
    getActionUrls(
      language
    );


  const headers =
    await getAuthorizationHeaders();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const richMenuBody = {

    richmenuName:
      config.richmenuName,

    size: {

      width:
        2500,

      height:
        843
    },

    areas: [

      // ==================================
      // 我要報修
      // ==================================

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
            config.labels.create,

          i18nLabels:
            createI18nLabels(
              "create"
            ),

          uri:
            urls.create
        }
      },


      // ==================================
      // 案件查詢
      // ==================================

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
            config.labels.myRepairs,

          i18nLabels:
            createI18nLabels(
              "myRepairs"
            ),

          uri:
            urls.myRepairs
        }
      },


      // ==================================
      // 維修任務
      // ==================================

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
            config.labels.engineer,

          i18nLabels:
            createI18nLabels(
              "engineer"
            ),

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
        `LINE WORKS 未回傳 ${language} richmenuId`
      );
    }


    console.log(
      "LINE WORKS Rich Menu created:",
      {
        language,
        richmenuId,
        richmenuName:
          config.richmenuName,
        urls
      }
    );


    return {

      language,

      richmenuId,

      richmenuName:
        config.richmenuName,

      urls
    };


  } catch (error) {

    console.error(
      "Create Rich Menu failed:",
      {
        language,

        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message
      }
    );


    throw error;
  }
}


// ========================================
// 將圖片套用至 Rich Menu
// ========================================

async function setRichMenuImage(
  richmenuId,
  fileId,
  language
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
        language,
        richmenuId,
        fileId,
        status:
          response.status
      }
    );


    return {
      success:
        true
    };


  } catch (error) {

    console.error(
      "Set Rich Menu image failed:",
      {
        language,

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
// 設為 Bot Default Rich Menu
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
}


// ========================================
// 指定 User Custom Rich Menu
// ========================================

async function setUserRichMenu(
  userId,
  language
) {

  checkConfig();


  if (!userId) {

    throw new Error(
      "缺少 LINE WORKS User ID"
    );
  }


  const config =
    RICHMENU_CONFIGS[
      language
    ];


  if (
    !config?.richmenuId
  ) {

    throw new Error(
      `${language} richmenuId 尚未設定`
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
      config.richmenuId
    );


  const encodedUserId =
    encodeURIComponent(
      userId
    );


  await axios.post(

    `${API_BASE_URL}/bots/` +
    `${encodedBotId}/richmenus/` +
    `${encodedRichmenuId}/users/` +
    `${encodedUserId}`,

    null,

    {
      headers,

      timeout:
        15000
    }
  );


  return {

    success:
      true,

    userId,

    language,

    richmenuId:
      config.richmenuId
  };
}


// ========================================
// 建立單一語系 Rich Menu
// ========================================

async function setupLanguageRichMenu(
  language
) {

  const uploadedImage =
    await uploadRichMenuImage(
      language
    );


  const createdRichMenu =
    await createRichMenu(
      language
    );


  await setRichMenuImage(

    createdRichMenu.richmenuId,

    uploadedImage.fileId,

    language
  );


  return {

    language,

    richmenuId:
      createdRichMenu.richmenuId,

    richmenuName:
      createdRichMenu.richmenuName,

    fileId:
      uploadedImage.fileId,

    imageSize:
      uploadedImage.fileSize,

    imageFileName:
      uploadedImage.fileName,

    urls:
      createdRichMenu.urls
  };
}


// ========================================
// 完整三語系 Rich Menu Setup
// ========================================

async function setupRepairRichMenu() {

  checkConfig();


  console.log(
    "Starting multilingual LINE WORKS Rich Menu setup..."
  );


  // ======================================
  // 1. 建立繁中 Rich Menu
  // ======================================

  const zhRichMenu =
    await setupLanguageRichMenu(
      "zh-TW"
    );


  // ======================================
  // 2. 建立日文 Rich Menu
  // ======================================

  const jaRichMenu =
    await setupLanguageRichMenu(
      "ja-JP"
    );


  // ======================================
  // 3. 建立英文 Rich Menu
  // ======================================

  const enRichMenu =
    await setupLanguageRichMenu(
      "en-US"
    );


  // ======================================
  // 4. 中文設成 Default
  // ======================================

  const defaultResult =
    await setDefaultRichMenu(
      zhRichMenu.richmenuId
    );


  // ======================================
  // 5. 記錄 Rich Menu ID
  // ======================================

  RICHMENU_CONFIGS[
    "zh-TW"
  ].richmenuId =
    zhRichMenu.richmenuId;


  RICHMENU_CONFIGS[
    "ja-JP"
  ].richmenuId =
    jaRichMenu.richmenuId;


  RICHMENU_CONFIGS[
    "en-US"
  ].richmenuId =
    enRichMenu.richmenuId;


  const result = {

    success:
      true,

    defaultLanguage:
      "zh-TW",

    defaultRichmenuId:
      defaultResult.defaultRichmenuId,

    richmenus: {

      "zh-TW":
        zhRichMenu,

      "ja-JP":
        jaRichMenu,

      "en-US":
        enRichMenu
    }
  };


  console.log(
    "Multilingual LINE WORKS Rich Menu setup completed:",
    result
  );


  return result;
}


// ========================================
// 匯出
// ========================================

module.exports = {

  setupRepairRichMenu,

  setUserRichMenu
};
