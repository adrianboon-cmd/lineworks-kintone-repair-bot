const express = require("express");

const {
  sendTextMessage
} = require(
  "../services/lineworksBotService"
);


const router =
  express.Router();


// ========================================
// POST /api/bot-test/send
// ========================================

router.post(
  "/send",

  express.json(),

  async (req, res, next) => {

    try {

      const suppliedTestKey =
        req.get(
          "X-Bot-Test-Key"
        );


      const expectedTestKey =
        process.env.BOT_TEST_KEY;


      if (!expectedTestKey) {

        return res
          .status(503)
          .json({
            success: false,
            message:
              "BOT_TEST_KEY 尚未設定"
          });
      }


      if (
        suppliedTestKey !==
        expectedTestKey
      ) {

        return res
          .status(401)
          .json({
            success: false,
            message:
              "Bot 測試驗證失敗"
          });
      }


      const {
        userId,
        message
      } = req.body;


      if (!userId) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "缺少 LINE WORKS User ID"
          });
      }


      const text =
        message ||
        [
          "🔧 設備報修助手測試",
          "",
          "LINE WORKS Bot 訊息發送成功。",
          "",
          "這是一則系統測試訊息。"
        ].join("\n");


      const result =
        await sendTextMessage(
          userId,
          text
        );


      return res.json({

        success: true,

        message:
          "Bot 測試訊息已送出",

        result
      });


    } catch (error) {

      console.error(
        "Bot test error:",
        error
      );


      next(error);
    }
  }
);


module.exports = router;
