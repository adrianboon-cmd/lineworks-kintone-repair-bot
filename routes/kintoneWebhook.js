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
// 共用：日期顯示
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
// 建立工程師指派通知
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
// 建立報修人通知
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
    // Webhook Secret 驗證
    // ====================================

    const expectedSecret =
      process.env
        .KINTONE_WEBHOOK_SECRET;


    const suppliedSecret =
      req.query.secret;


    if (!expectedSecret) {

      console.error(
        "KINTONE_WEBHOOK_SECRET 尚未設定"
      );


      return res
        .status(503)
        .json({
          success: false,
          message:
            "Webhook Secret 尚未設定"
        });
    }


    if (
      suppliedSecret !==
      expectedSecret
    ) {

      console.warn(
        "Invalid kintone webhook secret"
      );


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


      // ==================================
      // Webhook 類型
      // ==================================

      const webhookType =
        webhook.type || "";


      console.log(
        "kintone webhook received:",
        {
          type:
            webhookType,

          appId:
            webhook.app?.id,

          recordId:
            webhook.id ||
            record.$id?.value
        }
      );


      // 只處理新增、編輯、狀態更新
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
            (user) => user.name
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

        engineerNames
      };


      // ==================================
      // 判斷是否已指派工程師
      // ==================================

      if (
        !repair
          .engineerLineworksUserId
      ) {

        console.log(
          "kintone webhook skipped: engineer LINE WORKS User ID is empty",
          {
            recordId:
              repair.recordId
          }
        );


        return res.json({
          success: true,
          skipped: true,
          reason:
            "尚未指派 LINE WORKS 工程師"
        });
      }


      /*
        只有以下狀態發送「新維修任務」：

        待分派工程師處理
        已指派工程師

        如果管理者只選工程師，
        尚未手動修改狀態，
        仍會通知工程師。
      */

      const assignmentStatuses = [

        "待分派工程師處理",

        "已指派工程師"
      ];


      if (
        repair.status &&
        !assignmentStatuses.includes(
          repair.status
        )
      ) {

        return res.json({
          success: true,
          skipped: true,
          reason:
            `目前狀態為「${repair.status}」，不發送工程師指派通知`
        });
      }


      const notifications = {

        engineerNotificationSent:
          false,

        reporterNotificationSent:
          false,

        errors:
          []
      };


      // ==================================
      // 通知工程師
      // ==================================

      try {

        await sendTextMessage(

          repair
            .engineerLineworksUserId,

          buildEngineerAssignmentMessage(
            repair
          )
        );


        notifications
          .engineerNotificationSent =
          true;


        console.log(
          "Engineer assignment notification sent:",
          {
            recordId:
              repair.recordId,

            engineerUserId:
              repair
                .engineerLineworksUserId
          }
        );


      } catch (error) {

        console.error(
          "Engineer assignment notification failed:",
          {
            recordId:
              repair.recordId,

            message:
              error.message
          }
        );


        notifications
          .errors
          .push({
            target:
              "engineer",

            message:
              error.message
          });
      }


      // ==================================
      // 通知報修人
      // ==================================

      if (
        repair
          .reporterLineworksUserId &&
        repair
          .reporterLineworksUserId !==
        repair
          .engineerLineworksUserId
      ) {

        try {

          await sendTextMessage(

            repair
              .reporterLineworksUserId,

            buildReporterAssignmentMessage(
              repair
            )
          );


          notifications
            .reporterNotificationSent =
            true;


          console.log(
            "Reporter assignment notification sent:",
            {
              recordId:
                repair.recordId,

              reporterUserId:
                repair
                  .reporterLineworksUserId
            }
          );


        } catch (error) {

          console.error(
            "Reporter assignment notification failed:",
            {
              recordId:
                repair.recordId,

              message:
                error.message
            }
          );


          notifications
            .errors
            .push({
              target:
                "reporter",

              message:
                error.message
            });
        }

      } else if (
        repair
          .reporterLineworksUserId ===
        repair
          .engineerLineworksUserId
      ) {

        notifications
          .reporterNotificationSent =
          true;


        console.log(
          "Reporter notification skipped because reporter and engineer are the same user:",
          {
            recordId:
              repair.recordId
          }
        );
      }


      // ==================================
      // Webhook 回應
      // ==================================

      return res.json({
        success: true,

        message:
          "kintone 工程師指派通知已處理",

        recordId:
          repair.recordId,

        notifications
      });


    } catch (error) {

      console.error(
        "kintone webhook error:",
        error.response?.data ||
        error
      );


      /*
        回傳 200，避免通知錯誤造成
        kintone 重複傳送 Webhook。
      */

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
