const express =
  require("express");

const {
  setupRepairRichMenu
} = require(
  "../services/lineworksRichMenuService"
);


const router =
  express.Router();


// ========================================
// POST /api/richmenu/setup
// ========================================

router.post(
  "/setup",

  async (
    req,
    res,
    next
  ) => {

    try {

      const suppliedKey =
        req.get(
          "X-RichMenu-Setup-Key"
        );


      const expectedKey =
        process.env
          .RICHMENU_SETUP_KEY;


      if (!expectedKey) {

        return res
          .status(503)
          .json({

            success:
              false,

            message:
              "RICHMENU_SETUP_KEY 尚未設定"
          });
      }


      if (
        suppliedKey !==
        expectedKey
      ) {

        return res
          .status(401)
          .json({

            success:
              false,

            message:
              "Rich Menu Setup 驗證失敗"
          });
      }


      const result =
        await setupRepairRichMenu();


      return res
        .status(201)
        .json({

          success:
            true,

          message:
            "LINE WORKS Rich Menu 已建立並設為預設選單",

          result
        });


    } catch (error) {

      console.error(
        "Rich Menu setup error:",
        error.response?.data ||
        error
      );


      next(error);
    }
  }
);


module.exports =
  router;
