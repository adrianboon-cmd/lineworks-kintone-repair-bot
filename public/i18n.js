(function () {
  "use strict";


  // ========================================
  // 語系設定
  // ========================================

  const SUPPORTED_LANGUAGES = [
    "zh-TW",
    "ja-JP",
    "en-US"
  ];


  const DEFAULT_LANGUAGE =
    "zh-TW";


  // ========================================
  // 翻譯內容
  // ========================================

  const TRANSLATIONS = {

    // ======================================
    // 繁體中文
    // ======================================

    "zh-TW": {

      app: {
        title: "設備報修",
        subtitle: "LINE WORKS × kintone"
      },


      common: {
        applicant: "申請人",
        loading: "載入中...",
        refresh: "重新整理",
        close: "關閉",
        notSet: "未設定",
        notEntered: "未填寫",
        noPhoto: "本案件沒有故障照片",
        repairPhotos: "故障照片"
      },


      navigation: {
        createRepair: "我要報修",
        myRepairs: "案件查詢",
        engineerTasks: "維修任務"
      },


      repairForm: {
        heading: "建立報修",
        description: "請填寫設備故障資訊",

        equipmentCategory: "設備類別",
        selectEquipmentCategory: "請選擇設備類別",

        equipmentNumber: "設備編號",
        equipmentNumberPlaceholder: "例如：MFP-001",

        equipmentName: "設備名稱",
        equipmentNamePlaceholder: "例如：Apeos C3570",

        location: "所在位置",
        selectLocation: "請選擇設備所在位置",

        faultDescription: "故障描述",
        faultDescriptionPlaceholder:
          "請描述故障狀況，例如：列印時持續卡紙",

        faultPhoto: "故障照片",
        photoNote: "最多 3 張，每張最大 10 MB",

        submit: "送出報修",
        submitting: "送出中...",

        success: "報修成功！",
        ticketNumber: "案件編號"
      },


      locations: {
        headOffice: "總公司",
        taoyuanFactory: "桃園廠",
        otherGroup: "其他"
      },


      myRepairs: {
        heading: "我的報修案件",
        description: "查詢您所提出的設備報修",
        loading: "正在查詢報修案件...",
        empty: "目前沒有報修案件",
        emptyDescription:
          "若設備發生問題，可以點選「我要報修」建立案件。",
        detail: "查看案件詳情",
        caseDetail: "案件詳情"
      },


      engineer: {
        heading: "我的維修任務",
        description: "查看並更新指派給您的維修案件",
        loading: "正在查詢維修任務...",
        empty: "目前沒有指派給您的維修案件",
        emptyDescription:
          "kintone 指派案件後，任務會顯示在這裡。",
        detail: "查看並更新維修進度",
        update: "更新維修進度",
        updating: "更新中...",
        maintenanceProgress: "維修進度／維修結果",
        resultPlaceholder:
          "例如：已完成初步檢查，等待更換零件"
      },


      fields: {
        caseNumber: "案件編號",
        applicationDate: "申請日期",
        equipmentCategory: "設備類別",
        equipmentNumber: "設備編號",
        equipmentName: "設備名稱",
        location: "所在位置",
        description: "故障描述",
        status: "處理狀態",
        maintenanceStaff: "維修人員",
        expectedCompletionDate: "預計完成日期",
        actualCompletionDate: "實際完成日期",
        maintenanceResult: "維修結果"
      },


      status: {
        waitingAssignment: "待分派工程師處理",
        assigned: "已指派工程師",
        inProgress: "維修中",
        unrepairable: "無法維修",
        completed: "已完成"
      }
    },


    // ======================================
    // 日本語
    // ======================================

    "ja-JP": {

      app: {
        title: "設備修理受付",
        subtitle: "LINE WORKS × kintone"
      },


      common: {
        applicant: "申請者",
        loading: "読み込み中...",
        refresh: "更新",
        close: "閉じる",
        notSet: "未設定",
        notEntered: "未入力",
        noPhoto: "故障写真はありません",
        repairPhotos: "故障写真"
      },


      navigation: {
        createRepair: "修理を依頼",
        myRepairs: "案件照会",
        engineerTasks: "修理タスク"
      },


      repairForm: {
        heading: "修理依頼を登録",
        description: "設備の故障情報を入力してください",

        equipmentCategory: "設備カテゴリー",
        selectEquipmentCategory:
          "設備カテゴリーを選択してください",

        equipmentNumber: "設備番号",
        equipmentNumberPlaceholder: "例：MFP-001",

        equipmentName: "設備名",
        equipmentNamePlaceholder: "例：Apeos C3570",

        location: "設置場所",
        selectLocation:
          "設備の設置場所を選択してください",

        faultDescription: "故障内容",
        faultDescriptionPlaceholder:
          "故障状況を入力してください",

        faultPhoto: "故障写真",
        photoNote: "最大3枚、1枚あたり10MBまで",

        submit: "修理を依頼",
        submitting: "送信中...",

        success: "修理依頼を受け付けました。",
        ticketNumber: "案件番号"
      },


      locations: {
        headOffice: "本社",
        taoyuanFactory: "桃園工場",
        otherGroup: "その他"
      },


      myRepairs: {
        heading: "自分の修理案件",
        description: "登録した修理案件を確認できます",
        loading: "修理案件を取得しています...",
        empty: "修理案件はありません",
        emptyDescription:
          "設備に問題がある場合は「修理を依頼」から登録してください。",
        detail: "案件詳細を確認",
        caseDetail: "案件詳細"
      },


      engineer: {
        heading: "自分の修理タスク",
        description:
          "担当する修理案件を確認・更新できます",
        loading: "修理タスクを取得しています...",
        empty: "担当する修理案件はありません",
        emptyDescription:
          "kintoneで案件が割り当てられると、ここに表示されます。",
        detail: "修理状況を確認・更新",
        update: "修理状況を更新",
        updating: "更新中...",
        maintenanceProgress: "修理状況／対応結果",
        resultPlaceholder:
          "例：初期確認完了、部品交換待ち"
      },


      fields: {
        caseNumber: "案件番号",
        applicationDate: "申請日",
        equipmentCategory: "設備カテゴリー",
        equipmentNumber: "設備番号",
        equipmentName: "設備名",
        location: "設置場所",
        description: "故障内容",
        status: "対応状況",
        maintenanceStaff: "修理担当者",
        expectedCompletionDate: "完了予定日",
        actualCompletionDate: "完了日",
        maintenanceResult: "対応結果"
      },


      status: {
        waitingAssignment: "担当者割当待ち",
        assigned: "担当者割当済み",
        inProgress: "対応中",
        unrepairable: "修理不可",
        completed: "対応完了"
      }
    },


    // ======================================
    // English
    // ======================================

    "en-US": {

      app: {
        title: "Equipment Repair",
        subtitle: "LINE WORKS × kintone"
      },


      common: {
        applicant: "Applicant",
        loading: "Loading...",
        refresh: "Refresh",
        close: "Close",
        notSet: "Not set",
        notEntered: "Not entered",
        noPhoto: "No fault photos are attached",
        repairPhotos: "Fault Photos"
      },


      navigation: {
        createRepair: "Request Repair",
        myRepairs: "My Cases",
        engineerTasks: "Repair Tasks"
      },


      repairForm: {
        heading: "Create Repair Request",
        description:
          "Enter the equipment fault details",

        equipmentCategory: "Equipment Category",
        selectEquipmentCategory:
          "Select an equipment category",

        equipmentNumber: "Equipment Number",
        equipmentNumberPlaceholder: "Example: MFP-001",

        equipmentName: "Equipment Name",
        equipmentNamePlaceholder:
          "Example: Apeos C3570",

        location: "Location",
        selectLocation:
          "Select the equipment location",

        faultDescription: "Fault Description",
        faultDescriptionPlaceholder:
          "Describe the equipment fault",

        faultPhoto: "Fault Photos",
        photoNote:
          "Up to 3 photos, maximum 10 MB each",

        submit: "Submit Repair Request",
        submitting: "Submitting...",

        success:
          "Repair request submitted successfully.",
        ticketNumber: "Case Number"
      },


      locations: {
        headOffice: "Head Office",
        taoyuanFactory: "Taoyuan Factory",
        otherGroup: "Other"
      },


      myRepairs: {
        heading: "My Repair Cases",
        description:
          "View the equipment repair cases you submitted",
        loading: "Loading repair cases...",
        empty: "No repair cases found",
        emptyDescription:
          "Select “Request Repair” to create a new case.",
        detail: "View Case Details",
        caseDetail: "Case Details"
      },


      engineer: {
        heading: "My Repair Tasks",
        description:
          "View and update repair cases assigned to you",
        loading: "Loading repair tasks...",
        empty: "No repair cases are assigned to you",
        emptyDescription:
          "Assigned repair cases will appear here.",
        detail: "View and Update Progress",
        update: "Update Repair Progress",
        updating: "Updating...",
        maintenanceProgress: "Repair Progress / Result",
        resultPlaceholder:
          "Example: Initial inspection completed, waiting for replacement parts"
      },


      fields: {
        caseNumber: "Case Number",
        applicationDate: "Request Date",
        equipmentCategory: "Equipment Category",
        equipmentNumber: "Equipment Number",
        equipmentName: "Equipment Name",
        location: "Location",
        description: "Fault Description",
        status: "Status",
        maintenanceStaff: "Maintenance Engineer",
        expectedCompletionDate:
          "Expected Completion Date",
        actualCompletionDate:
          "Actual Completion Date",
        maintenanceResult: "Maintenance Result"
      },


      status: {
        waitingAssignment:
          "Waiting for Engineer Assignment",
        assigned: "Engineer Assigned",
        inProgress: "In Progress",
        unrepairable: "Unable to Repair",
        completed: "Completed"
      }
    }
  };


  // ========================================
  // 語言正規化
  // ========================================

  function normalizeLanguage(
    language
  ) {

    const value =
      String(
        language || ""
      ).toLowerCase();


    if (
      value.startsWith("ja")
    ) {

      return "ja-JP";
    }


    if (
      value.startsWith("en")
    ) {

      return "en-US";
    }


    if (
      value.startsWith("zh")
    ) {

      return "zh-TW";
    }


    return DEFAULT_LANGUAGE;
  }


  // ========================================
  // 取得目前語言
  // ========================================

  function getCurrentLanguage() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const urlLanguage =
      params.get("lang");


    if (
      SUPPORTED_LANGUAGES.includes(
        urlLanguage
      )
    ) {

      localStorage.setItem(
        "repairAppLanguage",
        urlLanguage
      );


      return urlLanguage;
    }


    const savedLanguage =
      localStorage.getItem(
        "repairAppLanguage"
      );


    if (
      SUPPORTED_LANGUAGES.includes(
        savedLanguage
      )
    ) {

      return savedLanguage;
    }


    return normalizeLanguage(
      navigator.language
    );
  }


  // ========================================
  // 翻譯
  // ========================================

  function translate(
    key,
    fallback = ""
  ) {

    const language =
      getCurrentLanguage();


    const parts =
      key.split(".");


    let value =
      TRANSLATIONS[
        language
      ];


    for (
      const part of parts
    ) {

      value =
        value?.[part];


      if (
        value === undefined
      ) {

        break;
      }
    }


    if (
      typeof value === "string"
    ) {

      return value;
    }


    return fallback || key;
  }


  // ========================================
  // 設定語言
  // ========================================

  function setLanguage(
    language
  ) {

    const normalized =
      normalizeLanguage(
        language
      );


    localStorage.setItem(
      "repairAppLanguage",
      normalized
    );


    const url =
      new URL(
        window.location.href
      );


    url.searchParams.set(
      "lang",
      normalized
    );


    window.location.href =
      url.toString();
  }


  // ========================================
  // 狀態翻譯
  //
  // kintone 底層仍保存中文值
  // ========================================

  function translateStatus(
    status
  ) {

    const statusKeyMap = {

      "待分派工程師處理":
        "waitingAssignment",

      "已指派工程師":
        "assigned",

      "維修中":
        "inProgress",

      "無法維修":
        "unrepairable",

      "已完成":
        "completed"
    };


    const statusKey =
      statusKeyMap[
        status
      ];


    if (!statusKey) {

      return status || "";
    }


    return translate(
      `status.${statusKey}`,
      status
    );
  }


  // ========================================
  // 套用 HTML data-i18n
  // ========================================

  function applyTranslations() {

    const language =
      getCurrentLanguage();


    document.documentElement.lang =
      language;


    // 普通文字

    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach(
        (element) => {

          const key =
            element.getAttribute(
              "data-i18n"
            );


          element.textContent =
            translate(
              key,
              element.textContent
            );
        }
      );


    // Placeholder

    document
      .querySelectorAll(
        "[data-i18n-placeholder]"
      )
      .forEach(
        (element) => {

          const key =
            element.getAttribute(
              "data-i18n-placeholder"
            );


          element.placeholder =
            translate(
              key,
              element.placeholder
            );
        }
      );


    // aria-label

    document
      .querySelectorAll(
        "[data-i18n-aria-label]"
      )
      .forEach(
        (element) => {

          const key =
            element.getAttribute(
              "data-i18n-aria-label"
            );


          element.setAttribute(
            "aria-label",
            translate(
              key,
              element.getAttribute(
                "aria-label"
              )
            )
          );
        }
      );


    // optgroup label

    document
      .querySelectorAll(
        "[data-i18n-label]"
      )
      .forEach(
        (element) => {

          const key =
            element.getAttribute(
              "data-i18n-label"
            );


          element.label =
            translate(
              key,
              element.label
            );
        }
      );


    // 工程師狀態選項

    document
      .querySelectorAll(
        "[data-status-key]"
      )
      .forEach(
        (element) => {

          const statusKey =
            element.getAttribute(
              "data-status-key"
            );


          element.textContent =
            translate(
              `status.${statusKey}`,
              element.textContent
            );
        }
      );


    // 語言選單

    const languageSelect =
      document.getElementById(
        "languageSelect"
      );


    if (languageSelect) {

      languageSelect.value =
        language;
    }


    // Browser Title

    document.title =
      translate(
        "app.title",
        "設備報修"
      );
  }


  // ========================================
  // 對外提供
  // ========================================

  window.RepairI18n = {

    supportedLanguages:
      SUPPORTED_LANGUAGES,

    defaultLanguage:
      DEFAULT_LANGUAGE,

    translations:
      TRANSLATIONS,

    getLanguage:
      getCurrentLanguage,

    setLanguage,

    t:
      translate,

    translateStatus,

    applyTranslations
  };


  // ========================================
  // DOM Ready 後先套用靜態翻譯
  // ========================================

  document.addEventListener(
    "DOMContentLoaded",

    () => {

      applyTranslations();


      const languageSelect =
        document.getElementById(
          "languageSelect"
        );


      if (
        languageSelect
      ) {

        languageSelect.addEventListener(
          "change",

          (event) => {

            setLanguage(
              event.target.value
            );
          }
        );
      }
    }
  );

})();
