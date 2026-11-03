const WOFF_ID =
  "9JL2mUAWcP-q0Qx-vEpTNg";


// ========================================
// DOM
// ========================================

const repairForm =
  document.getElementById("repairForm");

const imageInput =
  document.getElementById("images");

const imagePreview =
  document.getElementById("imagePreview");

const submitButton =
  document.getElementById("submitButton");

const userLoading =
  document.getElementById("userLoading");

const userInfo =
  document.getElementById("userInfo");

const userError =
  document.getElementById("userError");

const displayUserName =
  document.getElementById("displayUserName");

const navigation =
  document.getElementById("navigation");

const createViewButton =
  document.getElementById("createViewButton");

const myRepairsViewButton =
  document.getElementById("myRepairsViewButton");

const createRepairView =
  document.getElementById("createRepairView");

const myRepairsView =
  document.getElementById("myRepairsView");

const refreshRepairsButton =
  document.getElementById("refreshRepairsButton");

const repairsLoading =
  document.getElementById("repairsLoading");

const repairsError =
  document.getElementById("repairsError");

const repairsEmpty =
  document.getElementById("repairsEmpty");

const repairsList =
  document.getElementById("repairsList");

const repairDetailModal =
  document.getElementById("repairDetailModal");

const repairDetailContent =
  document.getElementById("repairDetailContent");

const detailTitle =
  document.getElementById("detailTitle");

const closeDetailButton =
  document.getElementById("closeDetailButton");

// ========================================
// 工程師任務 DOM
// ========================================

const engineerViewButton =
  document.getElementById(
    "engineerViewButton"
  );

const engineerView =
  document.getElementById(
    "engineerView"
  );

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
// 圖片限制
// ========================================

const MAX_FILES = 3;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ========================================
// 狀態
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

  return String(value ?? "")
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
    return "未設定";
  }

  const parts =
    String(value).split("-");

  if (parts.length !== 3) {
    return value;
  }

  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}


// ========================================
// 狀態樣式
// ========================================

function getStatusClass(status) {

  const statusMap = {
    "待分派工程師處理": "status-waiting",
    "已指派工程師": "status-assigned",
    "維修中": "status-progress",
    "無法維修": "status-unrepairable",
    "已完成": "status-completed"
  };

  return (
    statusMap[status] ||
    "status-default"
  );
}


// ========================================
// WOFF 初始化
// ========================================

async function initializeWOFF() {

  try {

    await woff.init({
      woffId: WOFF_ID,
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
        "無法取得 LINE WORKS 使用者 ID"
      );
    }


    if (!userName) {

      throw new Error(
        "無法取得 LINE WORKS 使用者名稱"
      );
    }


    currentUser = {
      userId,
      userName
    };


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
      "送出報修";


    // 根據 URL 的 view 參數切換功能
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

} else if (
  requestedView ===
  "engineer"
) {

  showEngineerView();

} else {

  showCreateRepairView();
}


  } catch (error) {

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
      `LINE WORKS 使用者資訊取得失敗<br>` +
      `Error Code：${escapeHtml(errorCode)}<br>` +
      `Error Message：${escapeHtml(errorMessage)}`;


    submitButton.disabled =
      true;

    submitButton.textContent =
      "無法取得登入資訊";
  }
}


// ========================================
// 顯示建立報修
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

  engineerViewButton.classList.remove(
  "active"
);
    
  );


  updateViewParameter("create");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ========================================
// 顯示我的案件
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
// 更新網址 view 參數
// ========================================

function updateViewParameter(view) {

  const url =
    new URL(
      window.location.href
    );


  if (view === "create") {

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
// 功能切換按鈕
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
// 圖片選擇及預覽
// ========================================

imageInput.addEventListener(
  "change",
  () => {

    imagePreview.innerHTML = "";

    const files =
      Array.from(
        imageInput.files
      );


    if (
      files.length >
      MAX_FILES
    ) {

      alert(
        `最多只能上傳 ${MAX_FILES} 張圖片`
      );

      imageInput.value = "";

      return;
    }


    for (const file of files) {

      if (
        !ALLOWED_TYPES.includes(
          file.type
        )
      ) {

        alert(
          `不支援圖片格式：${file.name}\n` +
          "請使用 JPG、PNG 或 WebP"
        );

        imageInput.value = "";

        imagePreview.innerHTML = "";

        return;
      }


      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        alert(
          `圖片 ${file.name} 超過 10 MB`
        );

        imageInput.value = "";

        imagePreview.innerHTML = "";

        return;
      }


      const img =
        document.createElement(
          "img"
        );

      const imageUrl =
        URL.createObjectURL(
          file
        );


      img.src =
        imageUrl;

      img.alt =
        file.name;

      img.className =
        "preview-image";


      img.onload = () => {

        URL.revokeObjectURL(
          imageUrl
        );
      };


      imagePreview.appendChild(
        img
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
        "尚未取得 LINE WORKS 使用者資訊，請重新開啟報修頁面。"
      );

      return;
    }


    const equipmentCategory =
      document
        .getElementById(
          "equipmentCategory"
        )
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
      document
        .getElementById(
          "location"
        )
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

      alert("請填寫設備類別");

      return;
    }


    if (!equipmentName) {

      alert("請填寫設備名稱");

      return;
    }


    if (!location) {

      alert("請填寫所在位置");

      return;
    }


    if (!description) {

      alert("請填寫故障描述");

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
        `最多只能上傳 ${MAX_FILES} 張圖片`
      );

      return;
    }


    submitButton.disabled =
      true;

    submitButton.textContent =
      "送出中...";


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


      const response =
        await fetch(
          "/api/repairs",
          {
            method: "POST",
            body: formData
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "報修資料送出失敗"
        );
      }


      alert(
        `報修成功！\n案件編號：${result.ticketNumber}`
      );


      repairForm.reset();

      imagePreview.innerHTML = "";

      repairsLoaded = false;


      // 報修成功後直接顯示案件清單
      showMyRepairsView();
// ========================================
// 顯示工程師維修任務
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


  if (!engineerRepairsLoaded) {

    loadEngineerRepairs();
  }
}

    } catch (error) {

      console.error(
        "Repair submit error:",
        error
      );


      alert(
        `報修失敗：${error.message}`
      );


    } finally {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "送出報修";
    }
  }
);


// ========================================
// 查詢我的報修案件
// ========================================

async function loadMyRepairs() {

  if (!currentUser) {

    showRepairsError(
      "尚未取得 LINE WORKS 使用者資訊"
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
    "查詢中...";


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
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "無法取得報修案件"
      );
    }


    currentRepairs =
      result.repairs || [];


    repairsLoaded = true;


    if (
      currentRepairs.length === 0
    ) {

      repairsEmpty.style.display =
        "block";

      return;
    }


    renderRepairs(
      currentRepairs
    );


  } catch (error) {

    console.error(
      "Load repairs error:",
      error
    );


    showRepairsError(
      `案件查詢失敗：${error.message}`
    );


  } finally {

    repairsLoading.style.display =
      "none";

    refreshRepairsButton.disabled =
      false;

    refreshRepairsButton.textContent =
      "↻ 重新整理";
  }
}


// ========================================
// 顯示查詢錯誤
// ========================================

function showRepairsError(message) {

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
// 顯示案件卡片
// ========================================

function renderRepairs(repairs) {

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
              案件 #${escapeHtml(repair.recordId)}
            </div>

            <h3>
              ${escapeHtml(repair.equipmentName || "未命名設備")}
            </h3>
          </div>

          <span class="status-badge ${statusClass}">
            ${escapeHtml(repair.status || "狀態未設定")}
          </span>

        </div>

        <div class="repair-card-body">

          <div class="repair-info-row">
            <span>設備編號</span>
            <strong>
              ${escapeHtml(repair.equipmentNumber || "未填寫")}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>所在位置</span>
            <strong>
              ${escapeHtml(repair.location || "未填寫")}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>申請日期</span>
            <strong>
              ${escapeHtml(formatDate(repair.applicationDate))}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>維修人員</span>
            <strong>
              ${escapeHtml(staffNames || "尚未指派")}
            </strong>
          </div>

        </div>

        <button
          class="detail-button"
          type="button"
          data-record-id="${escapeHtml(repair.recordId)}"
        >
          查看案件詳情
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
// 顯示案件詳情
// ========================================

function showRepairDetail(recordId) {

  const repair =
    currentRepairs.find(
      (item) =>
        String(item.recordId) ===
        String(recordId)
    );


  if (!repair) {

    alert("找不到案件資料");

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


  detailTitle.textContent =
    `案件 #${repair.recordId}`;


  repairDetailContent.innerHTML = `

    <div class="detail-status">

      <span class="status-badge ${statusClass}">
        ${escapeHtml(repair.status || "狀態未設定")}
      </span>

    </div>


    <div class="detail-section">

      <h3>設備資訊</h3>

      ${detailRow(
        "設備類別",
        repair.equipmentCategory
      )}

      ${detailRow(
        "設備編號",
        repair.equipmentNumber
      )}

      ${detailRow(
        "設備名稱",
        repair.equipmentName
      )}

      ${detailRow(
        "所在位置",
        repair.location
      )}

    </div>


    <div class="detail-section">

      <h3>故障資訊</h3>

      <div class="detail-text">
        ${escapeHtml(repair.description || "未填寫")}
      </div>

      <div class="photo-count">
        故障照片：${escapeHtml(repair.photoCount || 0)} 張
      </div>

    </div>


    <div class="detail-section">

      <h3>維修資訊</h3>

      ${detailRow(
        "維修人員",
        staffNames || "尚未指派"
      )}

      ${detailRow(
        "預計完成日期",
        formatDate(
          repair.expectedCompletionDate
        )
      )}

      ${detailRow(
        "實際完成日期",
        formatDate(
          repair.actualCompletionDate
        )
      )}

      <div class="detail-label">
        維修結果
      </div>

      <div class="detail-text">
        ${escapeHtml(repair.maintenanceResult || "尚無維修結果")}
      </div>

    </div>


    <div class="detail-section">

      <h3>申請資訊</h3>

      ${detailRow(
        "申請日期",
        formatDate(
          repair.applicationDate
        )
      )}

    </div>
  `;


  repairDetailModal.style.display =
    "flex";

  document.body.classList.add(
    "modal-open"
  );
}


// ========================================
// 案件詳情單列
// ========================================

function detailRow(label, value) {

  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>
        ${escapeHtml(value || "未填寫")}
      </strong>
    </div>
  `;
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
  .querySelector(".modal-overlay")
  .addEventListener(
    "click",
    closeRepairDetail
  );


// ========================================
// 重新整理案件
// ========================================

refreshRepairsButton.addEventListener(
  "click",
  () => {

    repairsLoaded = false;

    loadMyRepairs();
  }
);
// ========================================
// 查詢工程師維修任務
// ========================================

async function loadEngineerRepairs() {

  if (!currentUser) {

    showEngineerError(
      "尚未取得 LINE WORKS 使用者資訊"
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
    "查詢中...";


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
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "無法取得維修任務"
      );
    }


    engineerRepairs =
      result.repairs || [];


    engineerRepairsLoaded =
      true;


    if (
      engineerRepairs.length === 0
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
      `維修任務查詢失敗：${error.message}`
    );


  } finally {

    engineerLoading.style.display =
      "none";

    refreshEngineerButton.disabled =
      false;

    refreshEngineerButton.textContent =
      "↻ 重新整理";
  }
}


// ========================================
// 顯示工程師查詢錯誤
// ========================================

function showEngineerError(message) {

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
// 顯示工程師案件卡片
// ========================================

function renderEngineerRepairs(repairs) {

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
              維修案件 #${escapeHtml(repair.recordId)}
            </div>

            <h3>
              ${escapeHtml(repair.equipmentName || "未命名設備")}
            </h3>

          </div>

          <span class="status-badge ${statusClass}">
            ${escapeHtml(repair.status || "狀態未設定")}
          </span>

        </div>


        <div class="repair-card-body">

          <div class="repair-info-row">
            <span>報修人</span>

            <strong>
              ${escapeHtml(repair.applicant || "未填寫")}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>所在位置</span>

            <strong>
              ${escapeHtml(repair.location || "未填寫")}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>設備編號</span>

            <strong>
              ${escapeHtml(repair.equipmentNumber || "未填寫")}
            </strong>
          </div>

          <div class="repair-info-row">
            <span>申請日期</span>

            <strong>
              ${escapeHtml(formatDate(repair.applicationDate))}
            </strong>
          </div>

          <div class="engineer-description">

            <span>
              故障描述
            </span>

            <p>
              ${escapeHtml(repair.description || "未填寫")}
            </p>

          </div>

        </div>


        <button
          class="detail-button engineer-update-open-button"
          type="button"
          data-record-id="${escapeHtml(repair.recordId)}"
        >
          查看並更新維修進度
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
// 開啟工程師更新視窗
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
      "找不到維修案件資料"
    );

    return;
  }


  engineerModalTitle.textContent =
    `維修案件 #${repair.recordId}`;


  engineerRecordId.value =
    repair.recordId;


  engineerStatus.value =
    repair.status === "待分派工程師處理"
      ? "已指派工程師"
      : repair.status;


  engineerExpectedDate.value =
    repair.expectedCompletionDate ||
    "";


  engineerActualDate.value =
    repair.actualCompletionDate ||
    "";


  engineerResult.value =
    repair.maintenanceResult ||
    "";


  engineerCaseSummary.innerHTML = `

    <div class="engineer-case-summary">

      <div class="detail-row">
        <span>設備名稱</span>

        <strong>
          ${escapeHtml(repair.equipmentName || "未填寫")}
        </strong>
      </div>

      <div class="detail-row">
        <span>設備編號</span>

        <strong>
          ${escapeHtml(repair.equipmentNumber || "未填寫")}
        </strong>
      </div>

      <div class="detail-row">
        <span>所在位置</span>

        <strong>
          ${escapeHtml(repair.location || "未填寫")}
        </strong>
      </div>

      <div class="detail-row">
        <span>報修人</span>

        <strong>
          ${escapeHtml(repair.applicant || "未填寫")}
        </strong>
      </div>

      <div class="detail-label">
        故障描述
      </div>

      <div class="detail-text">
        ${escapeHtml(repair.description || "未填寫")}
      </div>

      <div class="photo-count">
        故障照片：${escapeHtml(repair.photoCount || 0)} 張
      </div>

    </div>
  `;


  engineerUpdateModal.style.display =
    "flex";


  document.body.classList.add(
    "modal-open"
  );
}


// ========================================
// 關閉工程師更新視窗
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
        "無法確認 LINE WORKS 工程師身分"
      );

      return;
    }


    const recordId =
      engineerRecordId.value;


    const status =
      engineerStatus.value;


    const maintenanceResult =
      engineerResult.value.trim();


    if (!recordId) {

      alert(
        "找不到案件編號"
      );

      return;
    }


    if (!status) {

      alert(
        "請選擇處理狀態"
      );

      return;
    }


    if (
      status === "已完成" &&
      !maintenanceResult
    ) {

      alert(
        "案件設為已完成時，請填寫維修結果"
      );

      return;
    }


    engineerUpdateButton.disabled =
      true;

    engineerUpdateButton.textContent =
      "更新中...";


    try {

      const response =
        await fetch(
          `/api/engineer-repairs/${encodeURIComponent(recordId)}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              userId:
                currentUser.userId,

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
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "維修進度更新失敗"
        );
      }


      alert(
        `案件 #${recordId}\n維修進度已更新`
      );


      closeEngineerUpdate();


      engineerRepairsLoaded =
        false;


      repairsLoaded =
        false;


      await loadEngineerRepairs();


    } catch (error) {

      console.error(
        "Update engineer repair error:",
        error
      );


      alert(
        `更新失敗：${error.message}`
      );


    } finally {

      engineerUpdateButton.disabled =
        false;

      engineerUpdateButton.textContent =
        "更新維修進度";
    }
  }
);


// ========================================
// 工程師狀態切換
// ========================================

engineerStatus.addEventListener(
  "change",
  () => {

    if (
      engineerStatus.value ===
      "已完成"
    ) {

      if (
        !engineerActualDate.value
      ) {

        const today =
          new Intl.DateTimeFormat(
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


        engineerActualDate.value =
          today;
      }
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
