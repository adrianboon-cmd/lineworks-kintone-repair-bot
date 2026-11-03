const repairForm = document.getElementById("repairForm");
const imageInput = document.getElementById("images");
const imagePreview = document.getElementById("imagePreview");

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

// ==============================
// 圖片選擇與預覽
// ==============================

imageInput.addEventListener("change", () => {
  imagePreview.innerHTML = "";

  const files = Array.from(imageInput.files);

  if (files.length > MAX_FILES) {
    alert(`最多只能上傳 ${MAX_FILES} 張圖片`);
    imageInput.value = "";
    return;
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`不支援圖片格式：${file.name}\n請使用 JPG、PNG 或 WebP`);
      imageInput.value = "";
      imagePreview.innerHTML = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`圖片 ${file.name} 超過 10 MB`);
      imageInput.value = "";
      imagePreview.innerHTML = "";
      return;
    }

    const img = document.createElement("img");
    const imageUrl = URL.createObjectURL(file);

    img.src = imageUrl;
    img.alt = file.name;
    img.className = "preview-image";

    img.onload = () => {
      URL.revokeObjectURL(imageUrl);
    };

    imagePreview.appendChild(img);
  }
});

// ==============================
// 報修表單送出
// ==============================

repairForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = repairForm.querySelector(
    'button[type="submit"]'
  );

  const equipmentName =
    document.getElementById("equipmentName").value.trim();

  const description =
    document.getElementById("description").value.trim();

  if (!equipmentName) {
    alert("請填寫設備名稱");
    return;
  }

  if (!description) {
    alert("請填寫故障說明");
    return;
  }

  const files = Array.from(imageInput.files);

  if (files.length > MAX_FILES) {
    alert(`最多只能上傳 ${MAX_FILES} 張圖片`);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "送出中...";

  try {
    const formData = new FormData(repairForm);

    // 暫時使用測試使用者
    // 後續接 LINE WORKS WOFF 後會自動取得登入者身分
    formData.append("reporterId", "demo-user");
    formData.append("reporterName", "測試員工");

    const response = await fetch("/api/repairs", {
      method: "POST",
      body: formData
    });

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("伺服器回傳格式錯誤");
    }

    if (!response.ok) {
      throw new Error(
        result.message || "報修資料送出失敗"
      );
    }

    alert(
      `報修成功！\n案件編號：${result.ticketNumber}`
    );

    repairForm.reset();
    imagePreview.innerHTML = "";

  } catch (error) {
    console.error("Repair submit error:", error);

    alert(
      `報修失敗：${error.message}`
    );

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "送出報修";
  }
});
