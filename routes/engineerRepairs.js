const express = require("express");

const {
  getAssignedRepairs,
  updateRepairProgress,
  downloadRepairPhoto
} = require(
  "../services/engineerService"
);

const {
  sendTextMessage
} = require(
  "../services/lineworksBotService"
);


const router =
  express.Router();


// ========================================
// 日期顯示
// ========================================

function formatDate(value) {

  if (!value) {
    return "未設定";
  }


  const parts =
    String(value).split("-");


  if (
    parts.length !== 3
  ) {

    return String(value);
  }


  return (
    `${parts[0]}/` +
    `${parts[1]}/` +
    `${parts[2]}`
  );
}


// ========================================
// 建立報修人通知
// ========================================

function buildReporterMessage(
  repair
) {

  const isCompleted =
    repair.status ===
    "已完成";


  const isUnrepairable =
    repair.status ===
    "無法維修";


  let title =
    "🧰 報修案件進度更新";


  if (isCompleted) {

    title =
      "✅ 報修案件已完成";

  } else if (
    isUnrepairable
  ) {

    title =
      "⚠️ 報修案件狀態更新";
  }


  const lines = [

    title,

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `處理狀態：${repair.status || "未設定"}`,

    `維修人員：${repair.engineerNames || "未設定"}`
  ];


  if (
    repair.expectedCompletionDate
  ) {

    lines.push(

      `預計完成日期：${formatDate(
        repair.expectedCompletionDate
      )}`
    );
  }


  if (
    repair.actualCompletionDate
  ) {

    lines.push(

      `實際完成日期：${formatDate(
        repair.actualCompletionDate
      )}`
    );
  }


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      "維修進度／結果：",

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    "您可以進入「設備報修系統」查看案件詳情。"
  );


  return lines.join("\n");
}


// ========================================
// 建立工程師操作紀錄
// ========================================

function buildEngineerMessage(
  repair
) {

  const lines = [

    "🧰 維修紀錄已更新",

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `處理狀態：${repair.status || "未設定"}`
  ];


  if (
    repair.expectedCompletionDate
  ) {

    lines.push(

      `預計完成日期：${formatDate(
        repair.expectedCompletionDate
      )}`
    );
  }


  if (
    repair.actualCompletionDate
  ) {

    lines.push(

      `實際完成日期：${formatDate(
        repair.actualCompletionDate
      )}`
    );
  }


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      "本次維修紀錄：",

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    "本次更新已成功寫入 kintone。"
  );


  return lines.join("\n");
}


// ========================================
// 發送工程師更新通知
// ========================================

async function notifyRepairUpdated(
  repair
) {

  const notificationResults = {

    reporterNotificationSent:
      false,

    engineerNotificationSent:
      false,

    errors:
      []
  };


  const reporterUserId =
    repair.reporterLineworksUserId;


  const engineerUserId =
    repair.engineerLineworksUserId;


  // ======================================
  // 通知報修人
  // ======================================

  if (reporterUserId) {

    try {

      await sendTextMessage(

        reporterUserId,

        buildReporterMessage(
          repair
        )
      );


      notificationResults
        .reporterNotificationSent =
        true;


      console.log(
        "Reporter progress notification sent:",
        {
          recordId:
            repair.recordId,

          reporterUserId
        }
      );


    } catch (error) {

      console.error(
        "Reporter progress notification failed:",
        {
          recordId:
            repair.recordId,

          reporterUserId,

          message:
            error.message
        }
      );


      notificationResults
        .errors
        .push({
          target:
            "reporter",

          message:
            error.message
        });
    }

  } else {

    console.warn(
      "Reporter notification skipped: missing lineworks_user_id",
      {
        recordId:
          repair.recordId
      }
    );
  }


  // ======================================
  // 通知工程師
  //
  // 如果報修人與工程師是同一個人，
  // 避免同一聊天室連續收到兩則重複訊息。
  // ======================================

  if (
    engineerUserId &&
    engineerUserId !==
      reporterUserId
  ) {

    try {

      await sendTextMessage(

        engineerUserId,

        buildEngineerMessage(
          repair
        )
      );


      notificationResults
        .engineerNotificationSent =
        true;


      console.log(
        "Engineer update notification sent:",
        {
          recordId:
            repair.recordId,

          engineerUserId
        }
      );


    } catch (error) {

      console.error(
        "Engineer update notification failed:",
        {
          recordId:
            repair.recordId,

          engineerUserId,

          message:
            error.message
        }
      );


      notificationResults
        .errors
        .push({
          target:
            "engineer",

          message:
            error.message
        });
    }

  } else if (
    engineerUserId &&
    engineerUserId ===
      reporterUserId
  ) {

    /*
      同一人同時是報修人與工程師時，
      上面的報修人通知已經包含完整結果。
    */

    notificationResults
      .engineerNotificationSent =
      true;


    console.log(
      "Engineer notification skipped because reporter and engineer are the same user:",
      {
        recordId:
          repair.recordId,

        userId:
          engineerUserId
      }
    );

  } else {

    console.warn(
      "Engineer notification skipped: missing engineer LINE WORKS User ID",
      {
        recordId:
          repair.recordId
      }
    );
  }


  return notificationResults;
}


// ========================================
// GET /api/engineer-repairs
// 查詢目前工程師負責的案件
// ========================================

router.get(
  "/",

  async (
    req,
    res,
    next
  ) => {

    try {

      const lineworksUserId =
        req.query.userId;


      if (!lineworksUserId) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "缺少 LINE WORKS User ID"
          });
      }


      const repairs =
        await getAssignedRepairs(
          lineworksUserId
        );


      return res.json({

        success:
          true,

        count:
          repairs.length,

        repairs
      });


    } catch (error) {

      console.error(
        "Engineer repair query error:",
        error.response?.data ||
        error
      );


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

  async (
    req,
    res,
    next
  ) => {

    try {

      const fileKey =
        req.query.fileKey;


      if (!fileKey) {

        return res
          .status(400)
          .json({

            success:
              false,

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


// ========================================
// PUT /api/engineer-repairs/:recordId
// 更新維修進度
// ========================================

router.put(
  "/:recordId",

  express.json(),

  async (
    req,
    res,
    next
  ) => {

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

            success:
              false,

            message:
              "缺少 LINE WORKS User ID"
          });
      }


      if (!status) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "請選擇處理狀態"
          });
      }


      // ====================================
      // 更新 kintone
      // ====================================

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


      console.log(
        "Engineer repair updated:",
        result
      );


      // ====================================
      // Bot 雙向通知
      // ====================================

      const notifications =
        await notifyRepairUpdated(
          result
        );


      // ====================================
      // 即使 Bot 部分通知失敗，
      // kintone 更新仍應回傳成功
      // ====================================

      return res.json({

        success:
          true,

        message:
          "維修進度已更新",

        recordId:
          result.recordId,

        revision:
          result.revision,

        status:
          result.status,

        actualCompletionDate:
          result.actualCompletionDate,

        notifications
      });


    } catch (error) {

      console.error(
        "Engineer update error:",
        error.response?.data ||
        error
      );


      if (
        error.statusCode
      ) {

        return res
          .status(
            error.statusCode
          )
          .json({

            success:
              false,

            message:
              error.message
          });
      }


      next(error);
    }
  }
);


module.exports = router;
