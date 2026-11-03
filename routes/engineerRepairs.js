const express = require("express");

const {
  getAssignedRepairs,
  updateRepairProgress,
  downloadRepairPhoto
} = require(
  "../services/engineerService"
);


const router = express.Router();


// ========================================
// GET /api/engineer-repairs
// 查詢目前工程師負責的案件
// ========================================

router.get(
  "/",

  async (req, res, next) => {

    try {

      const lineworksUserId =
        req.query.userId;


      if (!lineworksUserId) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "缺少 LINE WORKS User ID"
          });
      }


      const repairs =
        await getAssignedRepairs(
          lineworksUserId
        );


      return res.json({

        success: true,

        count:
          repairs.length,

        repairs
      });


    } catch (error) {

      if (error.response?.data) {

        console.error(
          "kintone engineer query error:",
          error.response.data
        );

      } else {

        console.error(
          "Engineer query error:",
          error
        );
      }


      next(error);
    }
  }
);


// ========================================
// PUT /api/engineer-repairs/:recordId
// 更新維修進度
// ========================================

router.put(
  "/:recordId",

  express.json(),

  async (req, res, next) => {

    try {

      const recordId =
        req.params.recordId;


      const {
        userId,
        status,
        expectedCompletionDate,
        actualCompletionDate,
        maintenanceResult
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


      if (!status) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "請選擇處理狀態"
          });
      }


      const result =
        await updateRepairProgress({

          recordId,

          lineworksUserId:
            userId,

          status,

          expectedCompletionDate,

          actualCompletionDate,

          maintenanceResult
        });


      return res.json({

        success: true,

        message:
          "維修進度已更新",

        ...result
      });


    } catch (error) {

      if (error.response?.data) {

        console.error(
          "kintone update error:",
          error.response.data
        );

      } else {

        console.error(
          "Engineer update error:",
          error
        );
      }


      if (error.statusCode) {

        return res
          .status(error.statusCode)
          .json({
            success: false,
            message:
              error.message
          });
      }


      next(error);
    }
  }
);
// ========================================
// GET /api/engineer-repairs/photo
// 顯示 kintone 故障照片
// ========================================

router.get(
  "/photo",

  async (req, res, next) => {

    try {

      const fileKey =
        req.query.fileKey;


      if (!fileKey) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "缺少圖片 File Key"
          });
      }


      const file =
        await downloadRepairPhoto(
          fileKey
        );


      res.setHeader(
        "Content-Type",
        file.contentType
      );


      res.setHeader(
        "Cache-Control",
        "private, max-age=300"
      );


      return res.send(
        file.data
      );


    } catch (error) {

      console.error(
        "Download repair photo error:",
        error.response?.data ||
        error
      );


      next(error);
    }
  }
);

module.exports = router;
