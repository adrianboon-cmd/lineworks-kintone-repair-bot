const axios =
  require("axios");

const fs =
  require("fs");

const path =
  require("path");

const FormData =
  require("form-data");

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
// Rich Menu 圖片
// ========================================

const IMAGE_CONFIGS = {

  "zh-TW": {

    lineworksLanguage:
      "zh_TW",

    fileName:
      "repair-richmenu-zh.png",

    filePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-zh.png"
      )
  },


  "ja-JP": {

    lineworksLanguage:
      "ja_JP",

    fileName:
      "repair-richmenu-ja.png",

    filePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-ja.png"
      )
  },


  "en-US": {

    lineworksLanguage:
      "en_US",

    fileName:
      "repair-richmenu-en.png",

    filePath:
      path.join(
        __dirname,
        "../assets/repair-richmenu-en.png"
      )
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
      IMAGE_CONFIGS
    )
    .forEach(
      (config) => {

        if (
          !fs.existsSync(
            config.filePath
          )
        ) {

          throw new Error(
            `找不到 assets/${config.fileName}`
          );
        }


        const stats =
          fs.statSync(
            config.filePath
          );


        if (
          stats.size <= 0
        ) {

          throw new Error(
            `${config.fileName} 圖片內容為空`
          );
        }


        if (
          stats.size >
          MAXIMUM_IMAGE_SIZE
        ) {

          throw new Error(
            `${config.fileName} 超過 1 MB`
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
    IMAGE_CONFIGS[
      language
    ];


  if (!config) {

    throw new Error(
      `不支援 Rich Menu 語系：${language}`
    );
  }


  const stats =
    fs.statSync(
      config.filePath
    );


  return {

    language,

    lineworksLanguage:
      config.lineworksLanguage,

    fileName:
      config.fileName,

    filePath:
      config.filePath,

    fileSize:
      stats.size
  };
}


// ========================================
// WOFF URL
// ========================================

function getActionUrls() {

  checkConfig();


  const createUrl =
    new URL(
      WOFF_URL
    );


  createUrl
    .searchParams
    .delete(
      "view"
    );


  const myRepairsUrl =
    new URL(
      WOFF_URL
    );


  myRepairsUrl
    .searchParams
    .set(
      "view",
      "my-repairs"
    );


  const engineerUrl =
    new URL(
      WOFF_URL
    );


  engineerUrl
    .searchParams
    .set(
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
// 取得 Storage Upload URL
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
      `${language} 圖片未取得 fileId 或 uploadUrl`
    );
  }


  console.log(
    "Rich Menu upload resource created:",
    {

      language,

      fileName:
        image.fileName,

      fileSize:
        image.fileSize,

      fileId
    }
  );


  return {

    ...image,

    fileId,

    uploadUrl
  };
}


// ========================================
// 上傳單一 Rich Menu 圖片
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

      fileName:
        uploadResource.fileName,

      fileSize:
        uploadResource.fileSize,

      fileId:
        uploadedFileId
    }
  );


  return {

    language,

    lineworksLanguage:
      uploadResource
        .lineworksLanguage,

    fileId:
      uploadedFileId,

    fileName:
      uploadResource.fileName,

    fileSize:
      uploadResource.fileSize
  };
}


// ========================================
// 建立 Rich Menu
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
      "LINE WORKS x kintone Equipment Repair",

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
            "我要報修",

          i18nLabels: [

            {

              language:
                "zh_TW",

              label:
                "我要報修"
            },

            {

              language:
                "ja_JP",

              label:
                "修理を依頼"
            },

            {

              language:
                "en_US",

              label:
                "Request Repair"
            }
          ],

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
            "案件查詢",

          i18nLabels: [

            {

              language:
                "zh_TW",

              label:
                "案件查詢"
            },

            {

              language:
                "ja_JP",

              label:
                "案件照会"
            },

            {

              language:
                "en_US",

              label:
                "My Cases"
            }
          ],

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
            "維修任務",

          i18nLabels: [

            {

              language:
                "zh_TW",

              label:
                "維修任務"
            },

            {

              language:
                "ja_JP",

              label:
                "修理タスク"
            },

            {

              language:
                "en_US",

              label:
                "Repair Tasks"
            }
          ],

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
    response.data?.richmenuId;


  if (!richmenuId) {

    throw new Error(
      "LINE WORKS 未回傳 richmenuId"
    );
  }


  console.log(
    "Multilingual Rich Menu created:",
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
// 套用三語系 Rich Menu 圖片
//
// 中文 fileId = Default
// ja_JP = 日文圖片
// en_US = 英文圖片
// zh_TW = 中文圖片
// ========================================

async function setMultilingualRichMenuImage(
  richmenuId,
  images
) {

  if (!richmenuId) {

    throw new Error(
      "缺少 richmenuId"
    );
  }


  const zhImage =
    images["zh-TW"];

  const jaImage =
    images["ja-JP"];

  const enImage =
    images["en-US"];


  if (
    !zhImage?.fileId ||
    !jaImage?.fileId ||
    !enImage?.fileId
  ) {

    throw new Error(
      "Rich Menu 三語系圖片 fileId 不完整"
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


  const body = {

    // Default 圖片
    fileId:
      zhImage.fileId,


    // 多語圖片
    i18nFileIds: [

      {

        language:
          "zh_TW",

        fileId:
          zhImage.fileId
      },

      {

        language:
          "ja_JP",

        fileId:
          jaImage.fileId
      },

      {

        language:
          "en_US",

        fileId:
          enImage.fileId
      }
    ]
  };


  try {

    const response =
      await axios.post(

        `${API_BASE_URL}/bots/` +
        `${encodedBotId}/richmenus/` +
        `${encodedRichmenuId}/image`,

        body,

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
      "Multilingual Rich Menu images assigned:",
      {

        richmenuId,

        zh:
          zhImage.fileId,

        ja:
          jaImage.fileId,

        en:
          enImage.fileId,

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
      "Set multilingual Rich Menu image failed:",
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
// 設為 Default Rich Menu
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

        headers: {

          ...headers,

          "Content-Type":
            "application/json"
        },

        timeout:
          15000
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
    "Starting multilingual Rich Menu setup..."
  );


  // ======================================
  // 1. 上傳中文圖片
  // ======================================

  const zhImage =
    await uploadRichMenuImage(
      "zh-TW"
    );


  // ======================================
  // 2. 上傳日文圖片
  // ======================================

  const jaImage =
    await uploadRichMenuImage(
      "ja-JP"
    );


  // ======================================
  // 3. 上傳英文圖片
  // ======================================

  const enImage =
    await uploadRichMenuImage(
      "en-US"
    );


  const images = {

    "zh-TW":
      zhImage,

    "ja-JP":
      jaImage,

    "en-US":
      enImage
  };


  // ======================================
  // 4. 建立 ONE Rich Menu
  // ======================================

  const createdRichMenu =
    await createRichMenu();


  // ======================================
  // 5. 一次套用三語系圖片
  // ======================================

  await setMultilingualRichMenuImage(

    createdRichMenu.richmenuId,

    images
  );


  // ======================================
  // 6. 設成 Default
  // ======================================

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
      defaultResult
        .defaultRichmenuId,

    images: {

      "zh-TW": {

        fileId:
          zhImage.fileId,

        fileName:
          zhImage.fileName,

        fileSize:
          zhImage.fileSize
      },


      "ja-JP": {

        fileId:
          jaImage.fileId,

        fileName:
          jaImage.fileName,

        fileSize:
          jaImage.fileSize
      },


      "en-US": {

        fileId:
          enImage.fileId,

        fileName:
          enImage.fileName,

        fileSize:
          enImage.fileSize
      }
    },

    urls:
      createdRichMenu.urls
  };


  console.log(
    "Multilingual Rich Menu setup completed:",
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
