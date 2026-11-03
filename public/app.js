const WOFF_ID =
  "9JL2mUAWcP-q0Qx-vEpTNg";


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


const MAX_FILES = 3;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ========================================
// LINE WORKS 使用者
// ========================================

let currentUser = null;


// ========================================
// WOFF 初始化
// ========================================

async function initializeWOFF() {

  try {

    console.log("Starting WOFF initialization...");


    // ------------------------------------
    // 1. 初始化 WOFF
    // ------------------------------------

    await woff.init({
      woffId: WOFF_ID
    });


    console.log(
      "WOFF initialized successfully"
    );


    // ------------------------------------
    // 2. 顯示執行環境
    // ------------------------------------

    console.log(
      "Is in LINE WORKS client:",
      woff.isInClient()
    );


    // ------------------------------------
    // 3. 取得登入使用者 Profile
    // ------------------------------------

    const profile =
      await woff.getProfile();


    console.log(
      "LINE WORKS profile:",
      profile
    );


    // ------------------------------------
    // 4. 整理使用者資料
    // ------------------------------------

    /*
      WOFF Profile 回傳欄位會依環境與版本而異。

      我們優先使用：
      userId
      displayName

      並保留 fallback。
    */

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


    // ------------------------------------
    // 5. 更新畫面
    // ------------------------------------

    displayUserName.textContent =
      currentUser.userName;


    userLoading.style.display =
      "none";

    userError.style.display =
      "none";

    userInfo.style.display =
      "block";


    // ------------------------------------
    // 6. 開放報修按鈕
    // ------------------------------------

    submitButton.disabled =
      false;

    submitButton.textContent =
      "送出報修";


    console.log(
      "Current LINE WORKS user:",
      currentUser
    );


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

    userError.style.display =
      "block";


    userError.textContent =
      "LINE WORKS 使用者資訊取得失敗，請從 LINE WORKS 開啟此報修頁面。";


    submitButton.disabled =
      true;

    submitButton.textContent =
      "無法取得登入資訊";
  }
}


// ========================================
// 頁面完成載入後初始化 WOFF
// ========================================

window.addEventListener(
  "load",
  initializeWOFF
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


    // ------------------------------------
    // 最多 3 張
    // ------------------------------------

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


    // ------------------------------------
    // 圖片檢查
    // ------------------------------------

    for (
      const file of files
    ) {


      // 格式
      if (
        !ALLOWED_TYPES.includes(
          file.type
        )
      ) {

        alert(
          `不支援圖片格式：${file.name}\n請使用 JPG、PNG 或 WebP`
        );

        imageInput.value = "";

        imagePreview.innerHTML =
          "";

        return;
      }


      // 大小
      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        alert(
          `圖片 ${file.name} 超過 10 MB`
        );

        imageInput.value = "";

        imagePreview.innerHTML =
          "";

        return;
      }


      // --------------------------------
      // 預覽
      // --------------------------------

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
// 報修表單送出
// ========================================

repairForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // ====================================
    // LINE WORKS 登入檢查
    // ====================================

    if (!currentUser) {

      alert(
        "尚未取得 LINE WORKS 使用者資訊，請重新從 LINE WORKS 開啟報修頁面。"
      );

      return;
    }


    // ====================================
    // 表單欄位
    // ====================================

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


    // ====================================
    // 必填欄位檢查
    // ====================================

    if (!equipmentCategory) {

      alert(
        "請填寫設備類別"
      );

      return;
    }


    if (!equipmentName) {

      alert(
        "請填寫設備名稱"
      );

      return;
    }


    if (!location) {

      alert(
        "請填寫所在位置"
      );

      return;
    }


    if (!description) {

      alert(
        "請填寫故障描述"
      );

      return;
    }


    // ====================================
    // 圖片數量再次確認
    // ====================================

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


    // ====================================
    // 鎖定按鈕
    // ====================================

    submitButton.disabled =
      true;

    submitButton.textContent =
      "送出中...";


    try {


      // ==================================
      // 建立 FormData
      // ==================================

      const formData =
        new FormData(
          repairForm
        );


      // ==================================
      // LINE WORKS 使用者
      // ==================================

      formData.append(
        "reporterId",
        currentUser.userId
      );


      formData.append(
        "reporterName",
        currentUser.userName
      );


      console.log(
        "Submitting repair as:",
        currentUser
      );


      // ==================================
      // 呼叫 Render API
      // ==================================

      const response =
        await fetch(
          "/api/repairs",
          {
            method: "POST",
            body: formData
          }
        );


      let result;


      try {

        result =
          await response.json();

      } catch {

        throw new Error(
          "伺服器回傳格式錯誤"
        );
      }


      if (!response.ok) {

        throw new Error(
          result.message ||
          "報修資料送出失敗"
        );
      }


      // ==================================
      // 成功
      // ==================================

      alert(
        `報修成功！\n案件編號：${result.ticketNumber}`
      );


      // 清空表單
      repairForm.reset();


      // 清空圖片
      imagePreview.innerHTML =
        "";


      // LINE WORKS 使用者保持登入
      displayUserName.textContent =
        currentUser.userName;


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
