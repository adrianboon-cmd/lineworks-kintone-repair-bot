const express = require("express");

const {
  sendTextMessage
} = require(
  "../services/lineworksBotService"
);


const router =
  express.Router();


// ========================================
// 共用：取得欄位值
// ========================================

function getFieldValue(
  record,
  fieldCode,
  defaultValue = ""
) {

  return (
    record?.[fieldCode]?.value ??
    defaultValue
  );
}


// ========================================
// 共用：日期格式
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
// 指派工程師通知：給工程師
// ========================================

function buildEngineerAssignmentMessage(
  repair
) {

  const lines = [

    "🔧 新維修任務",

    "",

    `案件編號：#${repair.recordId}`,

    `設備類別：${repair.equipmentCategory || "未設定"}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `報修人：${repair.applicant || "未設定"}`,

    `申請日期：${formatDate(
      repair.applicationDate
    )}`,

    `目前狀態：${repair.status || "已指派工程師"}`,

    "",

    "故障描述：",

    repair.description ||
      "未填寫",

    "",

    "請進入「設備報修系統 → 維修任務」查看並處理案件。"
  ];


  return lines.join("\n");
}


// ========================================
// 指派工程師通知：給報修人
// ========================================

function buildReporterAssignmentMessage(
  repair
) {

  const lines = [

    "👨‍🔧 維修工程師已指派",

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `維修人員：${repair.engineerNames || "已指派"}`,

    `目前狀態：${repair.status || "已指派工程師"}`,

    "",

    "您可以進入「設備報修系統 → 案件查詢」查看最新進度。"
  ];


  return lines.join("\n");
}


// ========================================
// 維修中通知：給報修人
// ========================================

function buildInProgressMessage(
  repair
) {

  const lines = [

    "🧰 報修案件進度更新",

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `維修人員：${repair.engineerNames || "未設定"}`,

    `目前狀態：維修中`
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
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      "維修進度：",

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    "您可以進入「設備報修系統 → 案件查詢」查看最新進度。"
  );


  return lines.join("\n");
}


// ========================================
// 無法維修通知：給報修人
// ========================================

function buildUnableToRepairMessage(
  repair
) {

  const lines = [

    "⚠️ 報修案件狀態更新",

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `維修人員：${repair.engineerNames || "未設定"}`,

    "目前狀態：無法維修"
  ];


  if (
    repair.maintenanceResult
  ) {

    lines.push(

      "",

      "處理說明：",

      repair.maintenanceResult
    );
  }


  lines.push(

    "",

    "請進入「設備報修系統 → 案件查詢」查看案件詳情。"
  );


  return lines.join("\n");
}


// ========================================
// 已完成通知：給報修人
// ========================================

function buildCompletedMessage(
  repair
) {

  const lines = [

    "✅ 報修案件已完成",

    "",

    `案件編號：#${repair.recordId}`,

    `設備名稱：${repair.equipmentName || "未設定"}`,

    `設備編號：${repair.equipmentNumber || "未填寫"}`,

    `所在位置：${repair.location || "未設定"}`,

    `維修人員：${repair.engineerNames || "未設定"}`,

    "處理狀態：已完成"
  ];


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

      "維修結果：",

      repair.maintenanceResult
    );

  } else {

    lines.push(

      "",

      "維修結果：未填寫"
    );
  }


  lines.push(

    "",

    "您可以進入「設備報修系統 → 案件查詢」查看完整紀錄。"
  );


  return lines.join("\n");
}


// ========================================
// 通知 LINE WORKS 使用者
// ========================================

async function sendNotification(
  userId,
  message,
  target,
  recordId
) {

  if (!userId) {

    return {
      success: false,
      skipped: true,
      target,
      reason:
        "缺少 LINE WORKS User ID"
    };
  }


  try {

    await sendTextMessage(
      userId,
      message
    );


    console.log(
      "kintone webhook notification sent:",
      {
        recordId,
        target,
        userId
      }
    );


    return {
      success: true,
      target
    };


  } catch (error) {

    console.error(
      "kintone webhook notification failed:",
      {
        recordId,
        target,
        userId,
        message:
          error.message
      }
    );


    return {
      success: false,
      target,
      error:
        error.message
    };
  }
}


// ========================================
// POST /api/kintone-webhook
// ========================================

router.post(
  "/",

  express.json({
    limit:
      "2mb"
  }),

  async (
    req,
    res
  ) => {

    // ====================================
    // 驗證 Webhook Secret
    // ====================================

    const expectedSecret =
      process.env
        .KINTONE_WEBHOOK_SECRET;


    const suppliedSecret =
      req.query.secret;


    if (!expectedSecret) {

      return res
        .status(503)
        .json({
          success: false,
          message:
            "KINTONE_WEBHOOK_SECRET 尚未設定"
        });
    }


    if (
      suppliedSecret !==
      expectedSecret
    ) {

      return res
        .status(401)
        .json({
          success: false,
          message:
            "Webhook 驗證失敗"
        });
    }


    try {

      const webhook =
        req.body || {};


      const record =
        webhook.record;


      if (!record) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Webhook 缺少 record 資料"
          });
      }


      const webhookType =
        webhook.type || "";


      const supportedTypes = [

        "ADD_RECORD",

        "UPDATE_RECORD",

        "UPDATE_STATUS"
      ];


      if (
        webhookType &&
        !supportedTypes.includes(
          webhookType
        )
      ) {

        return res.json({
          success: true,
          skipped: true,
          reason:
            `不處理 Webhook 類型：${webhookType}`
        });
      }


      // ==================================
      // 整理案件資料
      // ==================================

      const maintenanceStaff =
        getFieldValue(
          record,
          "maintenance_staff",
          []
        );


      const engineerNames =
        maintenanceStaff
          .map(
            (user) =>
              user.name
          )
          .filter(Boolean)
          .join("、");


      const repair = {

        recordId:
          record.$id?.value ||
          webhook.id ||
          "",

        applicant:
          getFieldValue(
            record,
            "申請人"
          ),

        reporterLineworksUserId:
          getFieldValue(
            record,
            "lineworks_user_id"
          ),

        applicationDate:
          getFieldValue(
            record,
            "application_date"
          ),

        equipmentCategory:
          getFieldValue(
            record,
            "equipment_category"
          ),

        equipmentNumber:
          getFieldValue(
            record,
            "equipment_number"
          ),

        equipmentName:
          getFieldValue(
            record,
            "equipment_name"
          ),

        location:
          getFieldValue(
            record,
            "location"
          ),

        description:
          getFieldValue(
            record,
            "fault_description"
          ),

        status:
          getFieldValue(
            record,
            "處理狀態"
          ),

        engineerLineworksUserId:
          getFieldValue(
            record,
            "maintenance_lineworks_user_id"
          ),

        engineerNames,

        expectedCompletionDate:
          getFieldValue(
            record,
            "expected_completion_date"
          ),

        actualCompletionDate:
          getFieldValue(
            record,
            "actual_completion_date"
          ),

        maintenanceResult:
          getFieldValue(
            record,
            "maintenance_result"
          )
      };


      console.log(
        "kintone webhook received:",
        {
          webhookType,
          recordId:
            repair.recordId,
          status:
            repair.status,
          reporterUserId:
            repair
              .reporterLineworksUserId,
          engineerUserId:
            repair
              .engineerLineworksUserId
        }
      );


      // ==================================
      // 通知結果
      // ==================================

      const notifications = [];


      // ==================================
      // 待分派工程師處理
      // ==================================

      if (
        repair.status ===
        "待分派工程師處理"
      ) {

        /*
          若維修人員已經被選取，
          但狀態尚未改成已指派工程師，
          仍通知工程師。
        */

        if (
          repair
            .engineerLineworksUserId
        ) {

          notifications.push(

            await sendNotification(

              repair
                .engineerLineworksUserId,

              buildEngineerAssignmentMessage(
                repair
              ),

              "engineer",

              repair.recordId
            )
          );


          if (
            repair
              .reporterLineworksUserId &&
            repair
              .reporterLineworksUserId !==
            repair
              .engineerLineworksUserId
          ) {

            notifications.push(

              await sendNotification(

                repair
                  .reporterLineworksUserId,

                buildReporterAssignmentMessage(
                  repair
                ),

                "reporter",

                repair.recordId
              )
            );
          }


          return res.json({
            success: true,
            message:
              "工程師指派通知已處理",
            recordId:
              repair.recordId,
            status:
              repair.status,
            notifications
          });
        }


        return res.json({
          success: true,
          skipped: true,
          reason:
            "案件尚未指派工程師"
        });
      }


      // ==================================
      // 已指派工程師
      // ==================================

      if (
        repair.status ===
        "已指派工程師"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .engineerLineworksUserId,

            buildEngineerAssignmentMessage(
              repair
            ),

            "engineer",

            repair.recordId
          )
        );


        if (
          repair
            .reporterLineworksUserId !==
          repair
            .engineerLineworksUserId
        ) {

          notifications.push(

            await sendNotification(

              repair
                .reporterLineworksUserId,

              buildReporterAssignmentMessage(
                repair
              ),

              "reporter",

              repair.recordId
            )
          );
        }


        return res.json({
          success: true,
          message:
            "工程師指派通知已處理",
          recordId:
            repair.recordId,
          status:
            repair.status,
          notifications
        });
      }


      // ==================================
      // 維修中
      // ==================================

      if (
        repair.status ===
        "維修中"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildInProgressMessage(
              repair
            ),

            "reporter",

            repair.recordId
          )
        );


        return res.json({
          success: true,
          message:
            "維修進度通知已處理",
          recordId:
            repair.recordId,
          status:
            repair.status,
          notifications
        });
      }


      // ==================================
      // 無法維修
      // ==================================

      if (
        repair.status ===
        "無法維修"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildUnableToRepairMessage(
              repair
            ),

            "reporter",

            repair.recordId
          )
        );


        return res.json({
          success: true,
          message:
            "無法維修通知已處理",
          recordId:
            repair.recordId,
          status:
            repair.status,
          notifications
        });
      }


      // ==================================
      // 已完成
      // ==================================

      if (
        repair.status ===
        "已完成"
      ) {

        notifications.push(

          await sendNotification(

            repair
              .reporterLineworksUserId,

            buildCompletedMessage(
              repair
            ),

            "reporter",

            repair.recordId
          )
        );


        return res.json({
          success: true,
          message:
            "案件完成通知已處理",
          recordId:
            repair.recordId,
          status:
            repair.status,
          notifications
        });
      }


      // ==================================
      // 不支援的狀態
      // ==================================

      return res.json({
        success: true,
        skipped: true,
        reason:
          `目前狀態「${repair.status}」未設定 Bot 通知`
      });


    } catch (error) {

      console.error(
        "kintone webhook error:",
        error.response?.data ||
        error
      );


      return res.json({
        success: false,
        message:
          error.message ||
          "Webhook 處理失敗"
      });
    }
  }
);


module.exports =
  router;
