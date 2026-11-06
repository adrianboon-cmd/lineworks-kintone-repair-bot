window.appJsStarted = true;


// ========================================
// 基本設定
// ========================================

const WOFF_ID =
  "9JL2mUAWcP-q0Qx-vEpTNg";

const MAX_FILES = 3;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ========================================
// i18n
// ========================================

const i18n =
  window.RepairI18n;


function t(
  key,
  fallback = ""
) {

  if (
    i18n &&
    typeof i18n.t === "function"
  ) {

    return i18n.t(
      key,
      fallback
    );
  }


  return fallback || key;
}


function currentLanguage() {

  if (
    i18n &&
    typeof i18n.getLanguage ===
      "function"
  ) {

    return i18n.getLanguage();
  }


  return "zh-TW";
}


function translatedStatus(
  status
) {

  if (
    i18n &&
    typeof i18n.translateStatus ===
      "function"
  ) {

    return i18n.translateStatus(
      status
    );
  }


  return status || "";
}


// ========================================
// 動態翻譯
// ========================================

const DYNAMIC_TEXT = {

  "zh-TW": {

    unnamedEquipment:
      "未命名設備",

    statusNotSet:
      "狀態未設定",

    notAssigned:
      "尚未指派",

    applicant:
      "報修人",

    equipmentInfo:
      "設備資訊",

    faultInfo:
      "故障資訊",

    maintenanceInfo:
      "維修資訊",

    applicationInfo:
      "申請資訊",

    maintenanceTask:
      "維修案件",

    searching:
      "查詢中...",

    loginChecking:
      "LINE WORKS 登入確認中...",

    loginUnavailable:
      "無法取得登入資訊",

    userInfoUnavailable:
      "尚未取得 LINE WORKS 使用者資訊",

    engineerIdentityUnavailable:
      "無法確認 LINE WORKS 工程師身分",

    repairSubmitFailed:
      "報修資料送出失敗",

    repairFailed:
      "報修失敗",

    repairQueryFailed:
      "案件查詢失敗",

    engineerQueryFailed:
      "維修任務查詢失敗",

    progressUpdateFailed:
      "維修進度更新失敗",

    updateFailed:
      "更新失敗",

    updateSuccess:
      "維修進度已更新",

    recordNotFound:
      "找不到案件資料",

    engineerRecordNotFound:
      "找不到維修案件資料",

    recordIdNotFound:
      "找不到案件編號",

    selectStatus:
      "請選擇處理狀態",

    completedResultRequired:
      "案件設為已完成時，請填寫維修結果",

    selectEquipmentCategory:
      "請選擇設備類別",

    enterEquipmentName:
      "請填寫設備名稱",

    selectLocation:
      "請選擇所在位置",

    enterDescription:
      "請填寫故障描述",

    maximumPhotos:
      "最多只能上傳 3 張圖片",

    unsupportedImage:
      "不支援圖片格式",

    supportedImageTypes:
      "請使用 JPG、PNG 或 WebP",

    imageTooLarge:
      "超過 10 MB",

    serverResponseError:
      "伺服器回傳格式錯誤",

    repairSuccess:
      "報修成功！",

    photoAlt:
      "故障照片",

    maintenanceResultEmpty:
      "尚無維修結果",

    lineWorksInitTimeout:
      "LINE WORKS 登入初始化逾時。",

    reopenFromLineWorks:
      "請關閉此頁面後，重新從 LINE WORKS 開啟報修系統。",

    woffSdkUnavailable:
      "WOFF SDK 尚未載入",

    userIdUnavailable:
      "無法取得 LINE WORKS User ID",

    userNameUnavailable:
      "無法取得 LINE WORKS 使用者名稱",

    userInfoFailed:
      "LINE WORKS 使用者資訊取得失敗",

    errorCode:
      "錯誤代碼",

    errorMessage:
      "錯誤訊息"
  },


  "ja-JP": {

    unnamedEquipment:
      "名称未設定の設備",

    statusNotSet:
      "ステータス未設定",

    notAssigned:
      "未割当",

    applicant:
      "申請者",

    equipmentInfo:
      "設備情報",

    faultInfo:
      "故障情報",

    maintenanceInfo:
      "修理情報",

    applicationInfo:
      "申請情報",

    maintenanceTask:
      "修理案件",

    searching:
      "検索中...",

    loginChecking:
      "LINE WORKSログイン確認中...",

    loginUnavailable:
      "ログイン情報を取得できません",

    userInfoUnavailable:
      "LINE WORKSユーザー情報を取得できません",

    engineerIdentityUnavailable:
      "LINE WORKS上の担当者を確認できません",

    repairSubmitFailed:
      "修理依頼の送信に失敗しました",

    repairFailed:
      "修理依頼に失敗しました",

    repairQueryFailed:
      "案件の取得に失敗しました",

    engineerQueryFailed:
      "修理タスクの取得に失敗しました",

    progressUpdateFailed:
      "修理状況の更新に失敗しました",

    updateFailed:
      "更新に失敗しました",

    updateSuccess:
      "修理状況を更新しました",

    recordNotFound:
      "案件データが見つかりません",

    engineerRecordNotFound:
      "修理案件データが見つかりません",

    recordIdNotFound:
      "案件番号が見つかりません",

    selectStatus:
      "対応状況を選択してください",

    completedResultRequired:
      "対応完了にする場合は、対応結果を入力してください",

    selectEquipmentCategory:
      "設備カテゴリーを選択してください",

    enterEquipmentName:
      "設備名を入力してください",

    selectLocation:
      "設置場所を選択してください",

    enterDescription:
      "故障内容を入力してください",

    maximumPhotos:
      "写真は最大3枚までアップロードできます",

    unsupportedImage:
      "対応していない画像形式です",

    supportedImageTypes:
      "JPG、PNG、WebPを使用してください",

    imageTooLarge:
      "が10MBを超えています",

    serverResponseError:
      "サーバーの応答形式が正しくありません",

    repairSuccess:
      "修理依頼を受け付けました。",

    photoAlt:
      "故障写真",

    maintenanceResultEmpty:
      "対応結果はまだありません",

    lineWorksInitTimeout:
      "LINE WORKSの初期化がタイムアウトしました。",

    reopenFromLineWorks:
      "この画面を閉じ、LINE WORKSからもう一度開いてください。",

    woffSdkUnavailable:
      "WOFF SDKが読み込まれていません",

    userIdUnavailable:
      "LINE WORKS User IDを取得できません",

    userNameUnavailable:
      "LINE WORKSユーザー名を取得できません",

    userInfoFailed:
      "LINE WORKSユーザー情報の取得に失敗しました",

    errorCode:
      "エラーコード",

    errorMessage:
      "エラーメッセージ"
  },


  "en-US": {

    unnamedEquipment:
      "Unnamed Equipment",

    statusNotSet:
      "Status Not Set",

    notAssigned:
      "Not Assigned",

    applicant:
      "Applicant",

    equipmentInfo:
      "Equipment Information",

    faultInfo:
      "Fault Information",

    maintenanceInfo:
      "Maintenance Information",

    applicationInfo:
      "Request Information",

    maintenanceTask:
      "Repair Case",

    searching:
      "Searching...",

    loginChecking:
      "Confirming LINE WORKS login...",

    loginUnavailable:
      "Unable to retrieve login information",

    userInfoUnavailable:
      "LINE WORKS user information is unavailable",

    engineerIdentityUnavailable:
      "Unable to verify the LINE WORKS engineer",

    repairSubmitFailed:
      "Failed to submit the repair request",

    repairFailed:
      "Repair request failed",

    repairQueryFailed:
      "Failed to load repair cases",

    engineerQueryFailed:
      "Failed to load repair tasks",

    progressUpdateFailed:
      "Failed to update repair progress",

    updateFailed:
      "Update failed",

    updateSuccess:
      "Repair progress updated",

    recordNotFound:
      "Case data not found",

    engineerRecordNotFound:
      "Repair case data not found",

    recordIdNotFound:
      "Case number not found",

    selectStatus:
      "Select a status",

    completedResultRequired:
      "Enter the maintenance result before marking the case as completed",

    selectEquipmentCategory:
      "Select an equipment category",

    enterEquipmentName:
      "Enter the equipment name",

    selectLocation:
      "Select a location",

    enterDescription:
      "Enter the fault description",

    maximumPhotos:
      "A maximum of 3 photos can be uploaded",

    unsupportedImage:
      "Unsupported image format",

    supportedImageTypes:
      "Use JPG, PNG, or WebP",

    imageTooLarge:
      "exceeds 10 MB",

    serverResponseError:
      "Invalid server response format",

    repairSuccess:
      "Repair request submitted successfully.",

    photoAlt:
      "Fault Photo",

    maintenanceResultEmpty:
      "No maintenance result is available",

    lineWorksInitTimeout:
      "LINE WORKS initialization timed out.",

    reopenFromLineWorks:
      "Close this page and reopen the repair system from LINE WORKS.",

    woffSdkUnavailable:
      "WOFF SDK is not loaded",

    userIdUnavailable:
      "Unable to retrieve LINE WORKS User ID",

    userNameUnavailable:
      "Unable to retrieve the LINE WORKS user name",

    userInfoFailed:
      "Failed to retrieve LINE WORKS user information",

    errorCode:
      "Error Code",

    errorMessage:
      "Error Message"
  }
};


function dt(
  key
) {

  const language =
    currentLanguage();


  return (
    DYNAMIC_TEXT[
      language
    ]?.[key] ||
    DYNAMIC_TEXT[
      "zh-TW"
    ]?.[key] ||
    key
  );
}


// ========================================
// 選項顯示翻譯
// 底層 value 保持中文
// ========================================

const OPTION_TRANSLATIONS = {

  "zh-TW": {

    equipmentCategories: {
      "辦公設備": "辦公設備",
      "電腦及資訊設備": "電腦及資訊設備",
      "網路及通訊設備": "網路及通訊設備",
      "生產設備": "生產設備",
      "空調及機電設備": "空調及機電設備",
      "門禁及監控設備": "門禁及監控設備",
      "其他": "其他"
    },

    locations: {
      "總公司 6F 辦公室":
        "總公司 6F 辦公室",
      "總公司 7F 辦公室":
        "總公司 7F 辦公室",
      "總公司 公共區域":
        "總公司 公共區域",
      "桃園廠 產線 A":
        "桃園廠 產線 A",
      "桃園廠 產線 B":
        "桃園廠 產線 B",
      "桃園廠 倉庫":
        "桃園廠 倉庫",
      "桃園廠 辦公室":
        "桃園廠 辦公室",
      "其他":
        "其他位置"
    }
  },


  "ja-JP": {

    equipmentCategories: {
      "辦公設備": "オフィス機器",
      "電腦及資訊設備": "PC・情報機器",
      "網路及通訊設備": "ネットワーク・通信機器",
      "生產設備": "生産設備",
      "空調及機電設備": "空調・電気設備",
      "門禁及監控設備": "入退室・監視設備",
      "其他": "その他"
    },

    locations: {
      "總公司 6F 辦公室":
        "本社 6F オフィス",
      "總公司 7F 辦公室":
        "本社 7F オフィス",
      "總公司 公共區域":
        "本社 共用エリア",
      "桃園廠 產線 A":
        "桃園工場 ラインA",
      "桃園廠 產線 B":
        "桃園工場 ラインB",
      "桃園廠 倉庫":
        "桃園工場 倉庫",
      "桃園廠 辦公室":
        "桃園工場 オフィス",
      "其他":
        "その他の場所"
    }
  },


  "en-US": {

    equipmentCategories: {
      "辦公設備": "Office Equipment",
      "電腦及資訊設備":
        "Computers and IT Equipment",
      "網路及通訊設備":
        "Network and Communication Equipment",
      "生產設備": "Production Equipment",
      "空調及機電設備":
        "HVAC and Electrical Equipment",
      "門禁及監控設備":
        "Access Control and Surveillance",
      "其他": "Other"
    },

    locations: {
      "總公司 6F 辦公室":
        "Head Office 6F",
      "總公司 7F 辦公室":
        "Head Office 7F",
      "總公司 公共區域":
        "Head Office Common Area",
      "桃園廠 產線 A":
        "Taoyuan Factory Line A",
      "桃園廠 產線 B":
        "Taoyuan Factory Line B",
      "桃園廠 倉庫":
        "Taoyuan Factory Warehouse",
      "桃園廠 辦公室":
        "Taoyuan Factory Office",
      "其他":
        "Other Location"
    }
  }
};


function translateStoredValue(
  group,
  value
) {

  const language =
    currentLanguage();


  return (
    OPTION_TRANSLATIONS[
      language
    ]?.[group]?.[value] ||
    value ||
    ""
  );
}


// ========================================
// DOM：LINE WORKS 使用者
// ========================================

const userLoading =
  document.getElementById(
    "userLoading"
  );

const userInfo =
  document.getElementById(
    "userInfo"
  );

const userError =
  document.getElementById(
    "userError"
  );

const displayUserName =
  document.getElementById(
    "displayUserName"
  );

const navigation =
  document.getElementById(
    "navigation"
  );


// ========================================
// DOM：三個頁籤
// ========================================

const createViewButton =
  document.getElementById(
    "createViewButton"
  );

const myRepairsViewButton =
  document.getElementById(
    "myRepairsViewButton"
  );

const engineerViewButton =
  document.getElementById(
    "engineerViewButton"
  );

const createRepairView =
  document.getElementById(
    "createRepairView"
  );

const myRepairsView =
  document.getElementById(
    "myRepairsView"
  );

const engineerView =
  document.getElementById(
    "engineerView"
  );


// ========================================
// DOM：建立報修
// ========================================

const repairForm =
  document.getElementById(
    "repairForm"
  );

const imageInput =
  document.getElementById(
    "images"
  );

const imagePreview =
  document.getElementById(
    "imagePreview"
  );

const submitButton =
  document.getElementById(
    "submitButton"
  );

const equipmentCategorySelect =
  document.getElementById(
    "equipmentCategory"
  );

const locationSelect =
  document.getElementById(
    "location"
  );


// ========================================
// DOM：我的案件
// ========================================

const refreshRepairsButton =
  document.getElementById(
    "refreshRepairsButton"
  );

const repairsLoading =
  document.getElementById(
    "repairsLoading"
  );

const repairsError =
  document.getElementById(
    "repairsError"
  );

const repairsEmpty =
  document.getElementById(
    "repairsEmpty"
  );

const repairsList =
  document.getElementById(
    "repairsList"
  );

const repairDetailModal =
  document.getElementById(
    "repairDetailModal"
  );

const repairDetailContent =
  document.getElementById(
    "repairDetailContent"
  );

const detailTitle =
  document.getElementById(
    "detailTitle"
  );

const closeDetailButton =
  document.getElementById(
    "closeDetailButton"
  );


// ========================================
// DOM：工程師維修任務
// ========================================

const refreshEngineerButton =
  document.getElementById(
    "refreshEngineerButton"
  );

const engineerLoading =
  document.getElementById(
    "engineerLoading"
  );

const engineerError =
  document.getElementById(
    "engineerError"
  );

const engineerEmpty =
  document.getElementById(
    "engineerEmpty"
  );

const engineerRepairsList =
  document.getElementById(
    "engineerRepairsList"
  );

const engineerUpdateModal =
  document.getElementById(
    "engineerUpdateModal"
  );

const engineerModalTitle =
  document.getElementById(
    "engineerModalTitle"
  );

const engineerCaseSummary =
  document.getElementById(
    "engineerCaseSummary"
  );

const engineerUpdateForm =
  document.getElementById(
    "engineerUpdateForm"
  );

const engineerRecordId =
  document.getElementById(
    "engineerRecordId"
  );

const engineerStatus =
  document.getElementById(
    "engineerStatus"
  );

const engineerExpectedDate =
  document.getElementById(
    "engineerExpectedDate"
  );

const engineerActualDate =
  document.getElementById(
    "engineerActualDate"
  );

const engineerResult =
  document.getElementById(
    "engineerResult"
  );

const engineerUpdateButton =
  document.getElementById(
    "engineerUpdateButton"
  );

const closeEngineerModalButton =
  document.getElementById(
    "closeEngineerModalButton"
  );


// ========================================
// 應用程式狀態
// ========================================

let currentUser = null;

let currentRepairs = [];

let repairsLoaded = false;

let engineerRepairs = [];

let engineerRepairsLoaded = false;


// ========================================
// HTML 安全處理
// ========================================

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ========================================
// 日期顯示
// ========================================

function formatDate(value) {

  if (!value) {

    return t(
      "common.notSet",
      "未設定"
    );
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
// 台北日期
// ========================================

function getTaipeiDate() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Asia/Taipei",

      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit"
    }
  ).format(
    new Date()
  );
}


// ========================================
// 案件狀態樣式
// ========================================

function getStatusClass(status) {

  const statusMap = {

    "待分派工程師處理":
      "status-waiting",

    "已指派工程師":
      "status-assigned",

    "維修中":
      "status-progress",

    "無法維修":
      "status-unrepairable",

    "已完成":
      "status-completed"
  };


  return (
    statusMap[status] ||
    "status-default"
  );
}


// ========================================
// 案件詳情列
// ========================================

function detailRow(
  label,
  value
) {

  return `
    <div class="detail-row">

      <span>
        ${escapeHtml(label)}
      </span>

      <strong>
        ${escapeHtml(
          value ||
          t(
            "common.notEntered",
            "未填寫"
          )
        )}
      </strong>

    </div>
  `;
}


// ========================================
// API JSON
// ========================================

async function readJsonResponse(
  response
) {

  try {

    return await response.json();

  } catch {

    throw new Error(
      dt(
        "serverResponseError"
      )
    );
  }
}


// ========================================
// 更新選項顯示
// ========================================

function translateSelectOptions() {

  if (
    equipmentCategorySelect
  ) {

    Array
      .from(
        equipmentCategorySelect.options
      )
      .forEach(
        (option) => {

          if (!option.value) {

            option.textContent =
              t(
                "repairForm.selectEquipmentCategory",
                option.textContent
              );

            return;
          }


          option.textContent =
            translateStoredValue(
              "equipmentCategories",
              option.value
            );
        }
      );
  }


  if (
    locationSelect
  ) {

    Array
      .from(
        locationSelect.options
      )
      .forEach(
        (option) => {

          if (!option.value) {

            option.textContent =
              t(
                "repairForm.selectLocation",
                option.textContent
              );

            return;
          }


          option.textContent =
            translateStoredValue(
              "locations",
              option.value
            );
        }
      );
  }
}


// ========================================
// WOFF 初始化
// ========================================

async function initializeWOFF() {

  if (
    i18n &&
    typeof i18n.applyTranslations ===
      "function"
  ) {

    i18n.applyTranslations();
  }


  translateSelectOptions();


  userLoading.textContent =
    t(
      "common.loading",
      "載入中..."
    );


  submitButton.textContent =
    dt(
      "loginChecking"
    );


  const timeoutId =
    setTimeout(
      () => {

        if (!currentUser) {

          userLoading.style.display =
            "none";

          userError.style.display =
            "block";

          userError.innerHTML =
            `${escapeHtml(
              dt(
                "lineWorksInitTimeout"
              )
            )}<br>` +
            escapeHtml(
              dt(
                "reopenFromLineWorks"
              )
            );
        }

      },
      10000
    );


  try {

    if (
      typeof woff ===
      "undefined"
    ) {

      throw new Error(
        dt(
          "woffSdkUnavailable"
        )
      );
    }


    await woff.init({
      woffId:
        WOFF_ID
    });


    const profile =
      await woff.getProfile();


    const userId =
      profile.userId ||
      profile.id ||
      "";


    const userName =
      profile.displayName ||
      profile.userName ||
      profile.name ||
      "";


    if (!userId) {

      throw new Error(
        dt(
          "userIdUnavailable"
        )
      );
    }


    if (!userName) {

      throw new Error(
        dt(
          "userNameUnavailable"
        )
      );
    }


    currentUser = {
      userId,
      userName
    };


    clearTimeout(
      timeoutId
    );


    displayUserName.textContent =
      currentUser.userName;


    userLoading.style.display =
      "none";

    userError.style.display =
      "none";

    userInfo.style.display =
      "block";

    navigation.style.display =
      "grid";


    submitButton.disabled =
      false;

    submitButton.textContent =
      t(
        "repairForm.submit",
        "送出報修"
      );


    openRequestedView();


  } catch (error) {

    clearTimeout(
      timeoutId
    );


    console.error(
      "WOFF initialization error:",
      error
    );


    currentUser = null;


    userLoading.style.display =
      "none";

    userInfo.style.display =
      "none";

    navigation.style.display =
      "none";

    userError.style.display =
      "block";


    const errorCode =
      error?.code ||
      error?.error ||
      "UNKNOWN";


    const errorMessage =
      error?.message ||
      String(error);


    userError.innerHTML =
      `${escapeHtml(
        dt(
          "userInfoFailed"
        )
      )}<br><br>` +
      `${escapeHtml(
        dt(
          "errorCode"
        )
      )}：${escapeHtml(
        errorCode
      )}<br>` +
      `${escapeHtml(
        dt(
          "errorMessage"
        )
      )}：${escapeHtml(
        errorMessage
      )}`;


    submitButton.disabled =
      true;

    submitButton.textContent =
      dt(
        "loginUnavailable"
      );
  }
}


// ========================================
// 開啟網址指定 View
// ========================================

function openRequestedView() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const requestedView =
    params.get("view");


  if (
    requestedView ===
    "my-repairs"
  ) {

    showMyRepairsView();

    return;
  }


  if (
    requestedView ===
    "engineer"
  ) {

    showEngineerView();

    return;
  }


  showCreateRepairView();
}


// ========================================
// 更新 View URL
// ========================================

function updateViewParameter(view) {

  const url =
    new URL(
      window.location.href
    );


  if (
    view === "create"
  ) {

    url.searchParams.delete(
      "view"
    );

  } else {

    url.searchParams.set(
      "view",
      view
    );
  }


  window.history.replaceState(
    {},
    "",
    url
  );
}


// ========================================
// 顯示：我要報修
// ========================================

function showCreateRepairView() {

  createRepairView.style.display =
    "block";

  myRepairsView.style.display =
    "none";

  engineerView.style.display =
    "none";


  createViewButton.classList.add(
    "active"
  );

  myRepairsViewButton.classList.remove(
    "active"
  );

  engineerViewButton.classList.remove(
    "active"
  );


  updateViewParameter(
    "create"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ========================================
// 顯示：我的案件
// ========================================

function showMyRepairsView() {

  createRepairView.style.display =
    "none";

  myRepairsView.style.display =
    "block";

  engineerView.style.display =
    "none";


  createViewButton.classList.remove(
    "active"
  );

  myRepairsViewButton.classList.add(
    "active"
  );

  engineerViewButton.classList.remove(
    "active"
  );


  updateViewParameter(
    "my-repairs"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (!repairsLoaded) {

    loadMyRepairs();
  }
}


// ========================================
// 顯示：維修任務
// ========================================

function showEngineerView() {

  createRepairView.style.display =
    "none";

  myRepairsView.style.display =
    "none";

  engineerView.style.display =
    "block";


  createViewButton.classList.remove(
    "active"
  );

  myRepairsViewButton.classList.remove(
    "active"
  );

  engineerViewButton.classList.add(
    "active"
  );


  updateViewParameter(
    "engineer"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (
    !engineerRepairsLoaded
  ) {

    loadEngineerRepairs();
  }
}


// ========================================
// 頁籤事件
// ========================================

createViewButton.addEventListener(
  "click",
  showCreateRepairView
);


myRepairsViewButton.addEventListener(
  "click",
  showMyRepairsView
);


engineerViewButton.addEventListener(
  "click",
  showEngineerView
);


// ========================================
// 圖片選擇與預覽
// ========================================

imageInput.addEventListener(
  "change",

  () => {

    imagePreview.innerHTML =
      "";


    const files =
      Array.from(
        imageInput.files
      );


    if (
      files.length >
      MAX_FILES
    ) {

      alert(
        dt(
          "maximumPhotos"
        )
      );

      imageInput.value =
        "";

      return;
    }


    for (
      const file of files
    ) {

      if (
        !ALLOWED_TYPES.includes(
          file.type
        )
      ) {

        alert(
          `${dt(
            "unsupportedImage"
          )}：${file.name}\n` +
          dt(
            "supportedImageTypes"
          )
        );

        imageInput.value =
          "";

        imagePreview.innerHTML =
          "";

        return;
      }


      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        alert(
          `${file.name} ${dt(
            "imageTooLarge"
          )}`
        );

        imageInput.value =
          "";

        imagePreview.innerHTML =
          "";

        return;
      }


      const image =
        document.createElement(
          "img"
        );


      const imageUrl =
        URL.createObjectURL(
          file
        );


      image.src =
        imageUrl;

      image.alt =
        file.name;

      image.className =
        "preview-image";


      image.onload =
        () => {

          URL.revokeObjectURL(
            imageUrl
          );
        };


      imagePreview.appendChild(
        image
      );
    }
  }
);


// ========================================
// 送出報修
// ========================================

repairForm.addEventListener(
  "submit",

  async (event) => {

    event.preventDefault();


    if (!currentUser) {

      alert(
        dt(
          "userInfoUnavailable"
        )
      );

      return;
    }


    const equipmentCategory =
      equipmentCategorySelect
        .value
        .trim();


    const equipmentName =
      document
        .getElementById(
          "equipmentName"
        )
        .value
        .trim();


    const location =
      locationSelect
        .value
        .trim();


    const description =
      document
        .getElementById(
          "description"
        )
        .value
        .trim();


    if (!equipmentCategory) {

      alert(
        dt(
          "selectEquipmentCategory"
        )
      );

      return;
    }


    if (!equipmentName) {

      alert(
        dt(
          "enterEquipmentName"
        )
      );

      return;
    }


    if (!location) {

      alert(
        dt(
          "selectLocation"
        )
      );

      return;
    }


    if (!description) {

      alert(
        dt(
          "enterDescription"
        )
      );

      return;
    }


    const files =
      Array.from(
        imageInput.files
      );


    if (
      files.length >
      MAX_FILES
    ) {

      alert(
        dt(
          "maximumPhotos"
        )
      );

      return;
    }


    submitButton.disabled =
      true;

    submitButton.textContent =
      t(
        "repairForm.submitting",
        "送出中..."
      );


    try {

      const formData =
        new FormData(
          repairForm
        );


      formData.append(
        "reporterId",
        currentUser.userId
      );


      formData.append(
        "reporterName",
        currentUser.userName
      );


      formData.append(
        "language",
        currentLanguage()
      );


      const response =
        await fetch(
          "/api/repairs",
          {
            method:
              "POST",

            body:
              formData
          }
        );


      const result =
        await readJsonResponse(
          response
        );


      if (!response.ok) {

        throw new Error(
          result.message ||
          dt(
            "repairSubmitFailed"
          )
        );
      }


      alert(
        `${t(
          "repairForm.success",
          dt(
            "repairSuccess"
          )
        )}\n` +
        `${t(
          "repairForm.ticketNumber",
          "案件編號"
        )}：${result.ticketNumber}`
      );


      repairForm.reset();

      imagePreview.innerHTML =
        "";

      translateSelectOptions();

      repairsLoaded =
        false;


      showMyRepairsView();


    } catch (error) {

      console.error(
        "Repair submit error:",
        error
      );


      alert(
        `${dt(
          "repairFailed"
        )}：${error.message}`
      );


    } finally {

      submitButton.disabled =
        false;

      submitButton.textContent =
        t(
          "repairForm.submit",
          "送出報修"
        );
    }
  }
);


// ========================================
// 查詢我的報修案件
// ========================================

async function loadMyRepairs() {

  if (!currentUser) {

    showRepairsError(
      dt(
        "userInfoUnavailable"
      )
    );

    return;
  }


  repairsLoading.style.display =
    "block";

  repairsError.style.display =
    "none";

  repairsEmpty.style.display =
    "none";

  repairsList.innerHTML =
    "";

  refreshRepairsButton.disabled =
    true;

  refreshRepairsButton.textContent =
    dt(
      "searching"
    );


  try {

    const userId =
      encodeURIComponent(
        currentUser.userId
      );


    const response =
      await fetch(
        `/api/repairs/my?userId=${userId}`
      );


    const result =
      await readJsonResponse(
        response
      );


    if (!response.ok) {

      throw new Error(
        result.message ||
        dt(
          "repairQueryFailed"
        )
      );
    }


    currentRepairs =
      result.repairs ||
      [];


    repairsLoaded =
      true;


    if (
      currentRepairs.length ===
      0
    ) {

      repairsEmpty.style.display =
        "block";

      return;
    }


    renderMyRepairs(
      currentRepairs
    );


  } catch (error) {

    console.error(
      "Load repairs error:",
      error
    );


    showRepairsError(
      `${dt(
        "repairQueryFailed"
      )}：${error.message}`
    );


  } finally {

    repairsLoading.style.display =
      "none";

    refreshRepairsButton.disabled =
      false;

    refreshRepairsButton.innerHTML =
      `↻ ${escapeHtml(
        t(
          "common.refresh",
          "重新整理"
        )
      )}`;
  }
}


// ========================================
// 我的案件錯誤
// ========================================

function showRepairsError(
  message
) {

  repairsError.textContent =
    message;

  repairsError.style.display =
    "block";

  repairsLoading.style.display =
    "none";

  repairsEmpty.style.display =
    "none";
}


// ========================================
// 顯示我的案件
// ========================================

function renderMyRepairs(
  repairs
) {

  repairsList.innerHTML =
    "";


  repairs.forEach(
    (repair) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "repair-card";


      const statusClass =
        getStatusClass(
          repair.status
        );


      const staffNames =
        (
          repair.maintenanceStaff ||
          []
        )
          .map(
            (staff) =>
              staff.name
          )
          .filter(Boolean)
          .join("、");


      card.innerHTML = `

        <div class="repair-card-header">

          <div>

            <div class="record-number">

              ${escapeHtml(
                t(
                  "fields.caseNumber",
                  "案件編號"
                )
              )}
              #${escapeHtml(
                repair.recordId
              )}

            </div>

            <h3>
              ${escapeHtml(
                repair.equipmentName ||
                dt(
                  "unnamedEquipment"
                )
              )}
            </h3>

          </div>

          <span class="status-badge ${statusClass}">

            ${escapeHtml(
              repair.status
                ? translatedStatus(
                    repair.status
                  )
                : dt(
                    "statusNotSet"
                  )
            )}

          </span>

        </div>


        <div class="repair-card-body">

          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.equipmentNumber",
                  "設備編號"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                repair.equipmentNumber ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.location",
                  "所在位置"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                translateStoredValue(
                  "locations",
                  repair.location
                ) ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.applicationDate",
                  "申請日期"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                formatDate(
                  repair.applicationDate
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.maintenanceStaff",
                  "維修人員"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                staffNames ||
                dt(
                  "notAssigned"
                )
              )}
            </strong>

          </div>

        </div>


        <button
          class="detail-button"
          type="button"
          data-record-id="${escapeHtml(
            repair.recordId
          )}"
        >

          ${escapeHtml(
            t(
              "myRepairs.detail",
              "查看案件詳情"
            )
          )}

        </button>
      `;


      const detailButton =
        card.querySelector(
          ".detail-button"
        );


      detailButton.addEventListener(
        "click",
        () => {

          showRepairDetail(
            repair.recordId
          );
        }
      );


      repairsList.appendChild(
        card
      );
    }
  );
}


// ========================================
// 顯示我的案件詳情
// ========================================

function showRepairDetail(
  recordId
) {

  const repair =
    currentRepairs.find(
      (item) =>
        String(item.recordId) ===
        String(recordId)
    );


  if (!repair) {

    alert(
      dt(
        "recordNotFound"
      )
    );

    return;
  }


  const staffNames =
    (
      repair.maintenanceStaff ||
      []
    )
      .map(
        (staff) =>
          staff.name
      )
      .filter(Boolean)
      .join("、");


  const statusClass =
    getStatusClass(
      repair.status
    );


  const photoHtml =
    (
      repair.photos ||
      []
    )
      .map(
        (
          photo,
          index
        ) => {

          const photoUrl =
            "/api/engineer-repairs/photo" +
            "?fileKey=" +
            encodeURIComponent(
              photo.fileKey
            );


          return `
            <button
              class="repair-photo-button"
              type="button"
              data-photo-url="${escapeHtml(
                photoUrl
              )}"
            >

              <img
                class="repair-photo"
                src="${escapeHtml(
                  photoUrl
                )}"
                alt="${escapeHtml(
                  dt(
                    "photoAlt"
                  )
                )} ${index + 1}"
                loading="lazy"
              >

            </button>
          `;
        }
      )
      .join("");


  detailTitle.textContent =
    `${t(
      "fields.caseNumber",
      "案件編號"
    )} #${repair.recordId}`;


  repairDetailContent.innerHTML = `

    <div class="detail-status">

      <span class="status-badge ${statusClass}">
        ${escapeHtml(
          repair.status
            ? translatedStatus(
                repair.status
              )
            : dt(
                "statusNotSet"
              )
        )}
      </span>

    </div>


    <div class="detail-section">

      <h3>
        ${escapeHtml(
          dt(
            "equipmentInfo"
          )
        )}
      </h3>

      ${detailRow(
        t(
          "fields.equipmentCategory",
          "設備類別"
        ),
        translateStoredValue(
          "equipmentCategories",
          repair.equipmentCategory
        )
      )}

      ${detailRow(
        t(
          "fields.equipmentNumber",
          "設備編號"
        ),
        repair.equipmentNumber
      )}

      ${detailRow(
        t(
          "fields.equipmentName",
          "設備名稱"
        ),
        repair.equipmentName
      )}

      ${detailRow(
        t(
          "fields.location",
          "所在位置"
        ),
        translateStoredValue(
          "locations",
          repair.location
        )
      )}

    </div>


    <div class="detail-section">

      <h3>
        ${escapeHtml(
          dt(
            "faultInfo"
          )
        )}
      </h3>

      <div class="detail-text">
        ${escapeHtml(
          repair.description ||
          t(
            "common.notEntered",
            "未填寫"
          )
        )}
      </div>

      <div class="detail-label">
        ${escapeHtml(
          t(
            "common.repairPhotos",
            "故障照片"
          )
        )}
      </div>

      ${
        photoHtml
          ? `
            <div class="repair-photo-grid">
              ${photoHtml}
            </div>
          `
          : `
            <div class="no-photo">
              ${escapeHtml(
                t(
                  "common.noPhoto",
                  "本案件沒有故障照片"
                )
              )}
            </div>
          `
      }

    </div>


    <div class="detail-section">

      <h3>
        ${escapeHtml(
          dt(
            "maintenanceInfo"
          )
        )}
      </h3>

      ${detailRow(
        t(
          "fields.maintenanceStaff",
          "維修人員"
        ),
        staffNames ||
        dt(
          "notAssigned"
        )
      )}

      ${detailRow(
        t(
          "fields.expectedCompletionDate",
          "預計完成日期"
        ),
        formatDate(
          repair.expectedCompletionDate
        )
      )}

      ${detailRow(
        t(
          "fields.actualCompletionDate",
          "實際完成日期"
        ),
        formatDate(
          repair.actualCompletionDate
        )
      )}

      <div class="detail-label">
        ${escapeHtml(
          t(
            "fields.maintenanceResult",
            "維修結果"
          )
        )}
      </div>

      <div class="detail-text">
        ${escapeHtml(
          repair.maintenanceResult ||
          dt(
            "maintenanceResultEmpty"
          )
        )}
      </div>

    </div>


    <div class="detail-section">

      <h3>
        ${escapeHtml(
          dt(
            "applicationInfo"
          )
        )}
      </h3>

      ${detailRow(
        t(
          "fields.applicationDate",
          "申請日期"
        ),
        formatDate(
          repair.applicationDate
        )
      )}

    </div>
  `;


  repairDetailContent
    .querySelectorAll(
      ".repair-photo-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            window.open(
              button.dataset.photoUrl,
              "_blank"
            );
          }
        );
      }
    );


  repairDetailModal.style.display =
    "flex";

  document.body.classList.add(
    "modal-open"
  );
}


// ========================================
// 關閉案件詳情
// ========================================

function closeRepairDetail() {

  repairDetailModal.style.display =
    "none";

  document.body.classList.remove(
    "modal-open"
  );
}


closeDetailButton.addEventListener(
  "click",
  closeRepairDetail
);


repairDetailModal
  .querySelector(
    ".modal-overlay"
  )
  .addEventListener(
    "click",
    closeRepairDetail
  );


refreshRepairsButton.addEventListener(
  "click",
  () => {

    repairsLoaded =
      false;

    loadMyRepairs();
  }
);


// ========================================
// 查詢工程師維修任務
// ========================================

async function loadEngineerRepairs() {

  if (!currentUser) {

    showEngineerError(
      dt(
        "userInfoUnavailable"
      )
    );

    return;
  }


  engineerLoading.style.display =
    "block";

  engineerError.style.display =
    "none";

  engineerEmpty.style.display =
    "none";

  engineerRepairsList.innerHTML =
    "";

  refreshEngineerButton.disabled =
    true;

  refreshEngineerButton.textContent =
    dt(
      "searching"
    );


  try {

    const userId =
      encodeURIComponent(
        currentUser.userId
      );


    const response =
      await fetch(
        `/api/engineer-repairs?userId=${userId}`
      );


    const result =
      await readJsonResponse(
        response
      );


    if (!response.ok) {

      throw new Error(
        result.message ||
        dt(
          "engineerQueryFailed"
        )
      );
    }


    engineerRepairs =
      result.repairs ||
      [];


    engineerRepairsLoaded =
      true;


    if (
      engineerRepairs.length ===
      0
    ) {

      engineerEmpty.style.display =
        "block";

      return;
    }


    renderEngineerRepairs(
      engineerRepairs
    );


  } catch (error) {

    console.error(
      "Load engineer repairs error:",
      error
    );


    showEngineerError(
      `${dt(
        "engineerQueryFailed"
      )}：${error.message}`
    );


  } finally {

    engineerLoading.style.display =
      "none";

    refreshEngineerButton.disabled =
      false;

    refreshEngineerButton.innerHTML =
      `↻ ${escapeHtml(
        t(
          "common.refresh",
          "重新整理"
        )
      )}`;
  }
}


// ========================================
// 工程師任務錯誤
// ========================================

function showEngineerError(
  message
) {

  engineerError.textContent =
    message;

  engineerError.style.display =
    "block";

  engineerLoading.style.display =
    "none";

  engineerEmpty.style.display =
    "none";
}


// ========================================
// 顯示工程師案件
// ========================================

function renderEngineerRepairs(
  repairs
) {

  engineerRepairsList.innerHTML =
    "";


  repairs.forEach(
    (repair) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "repair-card engineer-card";


      const statusClass =
        getStatusClass(
          repair.status
        );


      card.innerHTML = `

        <div class="repair-card-header">

          <div>

            <div class="record-number">

              ${escapeHtml(
                dt(
                  "maintenanceTask"
                )
              )}
              #${escapeHtml(
                repair.recordId
              )}

            </div>

            <h3>
              ${escapeHtml(
                repair.equipmentName ||
                dt(
                  "unnamedEquipment"
                )
              )}
            </h3>

          </div>

          <span class="status-badge ${statusClass}">
            ${escapeHtml(
              repair.status
                ? translatedStatus(
                    repair.status
                  )
                : dt(
                    "statusNotSet"
                  )
            )}
          </span>

        </div>


        <div class="repair-card-body">

          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                dt(
                  "applicant"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                repair.applicant ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.location",
                  "所在位置"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                translateStoredValue(
                  "locations",
                  repair.location
                ) ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.equipmentNumber",
                  "設備編號"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                repair.equipmentNumber ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </strong>

          </div>


          <div class="repair-info-row">

            <span>
              ${escapeHtml(
                t(
                  "fields.applicationDate",
                  "申請日期"
                )
              )}
            </span>

            <strong>
              ${escapeHtml(
                formatDate(
                  repair.applicationDate
                )
              )}
            </strong>

          </div>


          <div class="engineer-description">

            <span>
              ${escapeHtml(
                t(
                  "fields.description",
                  "故障描述"
                )
              )}
            </span>

            <p>
              ${escapeHtml(
                repair.description ||
                t(
                  "common.notEntered",
                  "未填寫"
                )
              )}
            </p>

          </div>

        </div>


        <button
          class="detail-button engineer-update-open-button"
          type="button"
          data-record-id="${escapeHtml(
            repair.recordId
          )}"
        >

          ${escapeHtml(
            t(
              "engineer.detail",
              "查看並更新維修進度"
            )
          )}

        </button>
      `;


      const updateButton =
        card.querySelector(
          ".engineer-update-open-button"
        );


      updateButton.addEventListener(
        "click",
        () => {

          openEngineerUpdate(
            repair.recordId
          );
        }
      );


      engineerRepairsList.appendChild(
        card
      );
    }
  );
}


// ========================================
// 開啟工程師更新畫面
// ========================================

function openEngineerUpdate(
  recordId
) {

  const repair =
    engineerRepairs.find(
      (item) =>
        String(item.recordId) ===
        String(recordId)
    );


  if (!repair) {

    alert(
      dt(
        "engineerRecordNotFound"
      )
    );

    return;
  }


  engineerModalTitle.textContent =
    `${dt(
      "maintenanceTask"
    )} #${repair.recordId}`;


  engineerRecordId.value =
    repair.recordId;


  const allowedStatuses = [
    "已指派工程師",
    "維修中",
    "無法維修",
    "已完成"
  ];


  engineerStatus.value =
    allowedStatuses.includes(
      repair.status
    )
      ? repair.status
      : "已指派工程師";


  engineerExpectedDate.value =
    repair.expectedCompletionDate ||
    "";


  engineerActualDate.value =
    repair.actualCompletionDate ||
    "";


  engineerResult.value =
    repair.maintenanceResult ||
    "";


  const photoHtml =
    (
      repair.photos ||
      []
    )
      .map(
        (
          photo,
          index
        ) => {

          const photoUrl =
            "/api/engineer-repairs/photo" +
            "?fileKey=" +
            encodeURIComponent(
              photo.fileKey
            );


          return `
            <button
              class="repair-photo-button"
              type="button"
              data-photo-url="${escapeHtml(
                photoUrl
              )}"
            >

              <img
                class="repair-photo"
                src="${escapeHtml(
                  photoUrl
                )}"
                alt="${escapeHtml(
                  dt(
                    "photoAlt"
                  )
                )} ${index + 1}"
                loading="lazy"
              >

            </button>
          `;
        }
      )
      .join("");


  engineerCaseSummary.innerHTML = `

    <div class="engineer-case-summary">

      ${detailRow(
        t(
          "fields.equipmentName",
          "設備名稱"
        ),
        repair.equipmentName
      )}

      ${detailRow(
        t(
          "fields.equipmentNumber",
          "設備編號"
        ),
        repair.equipmentNumber
      )}

      ${detailRow(
        t(
          "fields.location",
          "所在位置"
        ),
        translateStoredValue(
          "locations",
          repair.location
        )
      )}

      ${detailRow(
        dt(
          "applicant"
        ),
        repair.applicant
      )}

      <div class="detail-label">
        ${escapeHtml(
          t(
            "fields.description",
            "故障描述"
          )
        )}
      </div>

      <div class="detail-text">
        ${escapeHtml(
          repair.description ||
          t(
            "common.notEntered",
            "未填寫"
          )
        )}
      </div>

      <div class="detail-label">
        ${escapeHtml(
          t(
            "common.repairPhotos",
            "故障照片"
          )
        )}
      </div>

      ${
        photoHtml
          ? `
            <div class="repair-photo-grid">
              ${photoHtml}
            </div>
          `
          : `
            <div class="no-photo">
              ${escapeHtml(
                t(
                  "common.noPhoto",
                  "本案件沒有故障照片"
                )
              )}
            </div>
          `
      }

    </div>
  `;


  engineerCaseSummary
    .querySelectorAll(
      ".repair-photo-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            window.open(
              button.dataset.photoUrl,
              "_blank"
            );
          }
        );
      }
    );


  engineerUpdateModal.style.display =
    "flex";


  document.body.classList.add(
    "modal-open"
  );
}


// ========================================
// 關閉工程師更新畫面
// ========================================

function closeEngineerUpdate() {

  engineerUpdateModal.style.display =
    "none";

  document.body.classList.remove(
    "modal-open"
  );

  engineerUpdateForm.reset();
}


closeEngineerModalButton
  .addEventListener(
    "click",
    closeEngineerUpdate
  );


engineerUpdateModal
  .querySelector(
    ".modal-overlay"
  )
  .addEventListener(
    "click",
    closeEngineerUpdate
  );


// ========================================
// 工程師更新維修進度
// ========================================

engineerUpdateForm.addEventListener(
  "submit",

  async (event) => {

    event.preventDefault();


    if (!currentUser) {

      alert(
        dt(
          "engineerIdentityUnavailable"
        )
      );

      return;
    }


    const recordId =
      engineerRecordId.value;


    const status =
      engineerStatus.value;


    const maintenanceResult =
      engineerResult
        .value
        .trim();


    if (!recordId) {

      alert(
        dt(
          "recordIdNotFound"
        )
      );

      return;
    }


    if (!status) {

      alert(
        dt(
          "selectStatus"
        )
      );

      return;
    }


    if (
      status === "已完成" &&
      !maintenanceResult
    ) {

      alert(
        dt(
          "completedResultRequired"
        )
      );

      return;
    }


    engineerUpdateButton.disabled =
      true;

    engineerUpdateButton.textContent =
      t(
        "engineer.updating",
        "更新中..."
      );


    try {

      const response =
        await fetch(
          `/api/engineer-repairs/${encodeURIComponent(
            recordId
          )}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                userId:
                  currentUser.userId,

                language:
                  currentLanguage(),

                status,

                expectedCompletionDate:
                  engineerExpectedDate.value,

                actualCompletionDate:
                  engineerActualDate.value,

                maintenanceResult
              })
          }
        );


      const result =
        await readJsonResponse(
          response
        );


      if (!response.ok) {

        throw new Error(
          result.message ||
          dt(
            "progressUpdateFailed"
          )
        );
      }


      alert(
        `${t(
          "fields.caseNumber",
          "案件編號"
        )} #${recordId}\n` +
        dt(
          "updateSuccess"
        )
      );


      closeEngineerUpdate();


      engineerRepairsLoaded =
        false;

      repairsLoaded =
        false;


      await loadEngineerRepairs();


    } catch (error) {

      console.error(
        "Update repair error:",
        error
      );


      alert(
        `${dt(
          "updateFailed"
        )}：${error.message}`
      );


    } finally {

      engineerUpdateButton.disabled =
        false;

      engineerUpdateButton.textContent =
        t(
          "engineer.update",
          "更新維修進度"
        );
    }
  }
);


// ========================================
// 已完成時自動填入日期
// ========================================

engineerStatus.addEventListener(
  "change",

  () => {

    if (
      engineerStatus.value ===
        "已完成" &&
      !engineerActualDate.value
    ) {

      engineerActualDate.value =
        getTaipeiDate();
    }
  }
);


// ========================================
// 重新整理工程師任務
// ========================================

refreshEngineerButton.addEventListener(
  "click",

  () => {

    engineerRepairsLoaded =
      false;

    loadEngineerRepairs();
  }
);


// ========================================
// 啟動 WOFF
// ========================================

window.addEventListener(
  "load",
  initializeWOFF
);
