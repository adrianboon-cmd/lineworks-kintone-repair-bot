const axios = require("axios");
const jwt = require("jsonwebtoken");


// ========================================
// LINE WORKS 設定
// ========================================

const CLIENT_ID =
  process.env.LINEWORKS_CLIENT_ID;

const CLIENT_SECRET =
  process.env.LINEWORKS_CLIENT_SECRET;

const SERVICE_ACCOUNT =
  process.env.LINEWORKS_SERVICE_ACCOUNT;

const PRIVATE_KEY =
  process.env.LINEWORKS_PRIVATE_KEY;

const BOT_ID =
  process.env.LINEWORKS_BOT_ID;


const TOKEN_URL =
  "https://auth.worksmobile.com/oauth2/v2.0/token";

const API_BASE_URL =
  "https://www.worksapis.com/v1.0";


// ========================================
// Access Token Cache
// ========================================

let cachedAccessToken = null;

let cachedTokenExpiresAt = 0;


// ========================================
// 檢查設定
// ========================================

function checkConfig() {

  const missing = [];


  if (!CLIENT_ID) {
    missing.push(
      "LINEWORKS_CLIENT_ID"
    );
  }


  if (!CLIENT_SECRET) {
    missing.push(
      "LINEWORKS_CLIENT_SECRET"
    );
  }


  if (!SERVICE_ACCOUNT) {
    missing.push(
      "LINEWORKS_SERVICE_ACCOUNT"
    );
  }


  if (!PRIVATE_KEY) {
    missing.push(
      "LINEWORKS_PRIVATE_KEY"
    );
  }


  if (!BOT_ID) {
    missing.push(
      "LINEWORKS_BOT_ID"
    );
  }


  if (missing.length > 0) {

    throw new Error(
      `缺少 LINE WORKS 環境變數：${missing.join(", ")}`
    );
  }
}


// ========================================
// 整理 Private Key
// ========================================

function getNormalizedPrivateKey() {

  checkConfig();


  /*
    支援兩種 Render 寫法：

    1. 真正換行：

    -----BEGIN PRIVATE KEY-----
    ...
    -----END PRIVATE KEY-----

    2. 使用文字 \n：

    -----BEGIN PRIVATE KEY-----\n...\n
    -----END PRIVATE KEY-----
  */

  return PRIVATE_KEY
    .replace(/\\n/g, "\n")
    .trim();
}


// ========================================
// 建立 Service Account JWT
// ========================================

function createServiceAccountJwt() {

  const currentTime =
    Math.floor(
      Date.now() / 1000
    );


  const payload = {

    iss:
      CLIENT_ID,

    sub:
      SERVICE_ACCOUNT,

    iat:
      currentTime,

    exp:
      currentTime + 3600
  };


  return jwt.sign(

    payload,

    getNormalizedPrivateKey(),

    {
      algorithm: "RS256"
    }
  );
}


// ========================================
// 取得 LINE WORKS Access Token
// ========================================

async function getAccessToken() {

  checkConfig();


  // Token 還有至少 60 秒有效期時直接沿用
  if (
    cachedAccessToken &&
    Date.now() <
      cachedTokenExpiresAt - 60000
  ) {

    return cachedAccessToken;
  }


  const assertion =
    createServiceAccountJwt();


  const form =
    new URLSearchParams();


  form.append(
    "assertion",
    assertion
  );


  form.append(
    "grant_type",
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  );


  form.append(
    "client_id",
    CLIENT_ID
  );


  form.append(
    "client_secret",
    CLIENT_SECRET
  );


  form.append(
    "scope",
    "bot.message"
  );


  try {

    const response =
      await axios.post(

        TOKEN_URL,

        form.toString(),

        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          timeout:
            15000
        }
      );


    const accessToken =
      response.data.access_token;


    if (!accessToken) {

      throw new Error(
        "LINE WORKS 未回傳 Access Token"
      );
    }


    const expiresIn =
      Number(
        response.data.expires_in ||
        3600
      );


    cachedAccessToken =
      accessToken;


    cachedTokenExpiresAt =
      Date.now() +
      expiresIn * 1000;


    console.log(
      "LINE WORKS Access Token acquired"
    );


    return accessToken;


  } catch (error) {

    console.error(
      "LINE WORKS token error:",
      error.response?.data ||
      error.message
    );


    const errorMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.message;


    throw new Error(
      `LINE WORKS Access Token 取得失敗：${errorMessage}`
    );
  }
}


// ========================================
// 傳送純文字訊息給使用者
// ========================================

async function sendTextMessage(
  userId,
  text
) {

  checkConfig();


  if (!userId) {

    throw new Error(
      "缺少 LINE WORKS User ID"
    );
  }


  if (
    !text ||
    !String(text).trim()
  ) {

    throw new Error(
      "Bot 訊息不可為空白"
    );
  }


  const accessToken =
    await getAccessToken();


  const encodedBotId =
    encodeURIComponent(
      BOT_ID
    );


  const encodedUserId =
    encodeURIComponent(
      userId
    );


  const url =
    `${API_BASE_URL}/bots/` +
    `${encodedBotId}/users/` +
    `${encodedUserId}/messages`;


  try {

    const response =
      await axios.post(

        url,

        {
          content: {
            type:
              "text",

            text:
              String(text)
          }
        },

        {
          headers: {

            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json"
          },

          timeout:
            15000
        }
      );


    console.log(
      "LINE WORKS Bot message sent:",
      {
        botId:
          BOT_ID,

        userId,

        status:
          response.status
      }
    );


    return {
      success: true,
      status: response.status
    };


  } catch (error) {

    console.error(
      "LINE WORKS Bot send error:",
      error.response?.data ||
      error.message
    );


    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error_description ||
      error.response?.data?.code ||
      error.message;


    throw new Error(
      `LINE WORKS Bot 訊息發送失敗：${errorMessage}`
    );
  }
}


// ========================================
// 匯出
// ========================================

module.exports = {
  getAccessToken,
  sendTextMessage
};
