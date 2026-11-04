# LINE WORKS × kintone Equipment Repair Management System

LINE WORKS × kintone 設備報修與維修管理系統。

本專案讓企業內部員工直接透過 LINE WORKS 完成：

- 建立設備報修
- 上傳故障照片
- 查詢自己的報修案件
- 工程師查詢被指派的維修任務
- 工程師更新維修進度與結果
- kintone 管理完整案件資料
- LINE WORKS Bot 自動發送案件通知
- Rich Menu 快速進入主要功能


# 1. 系統架構

LINE WORKS
│
├── Bot
│   ├── Rich Menu
│   ├── 報修建立通知
│   ├── 工程師指派通知
│   ├── 維修進度通知
│   └── 完成通知
│
├── WOFF
│   ├── 我要報修
│   ├── 案件查詢
│   └── 維修任務
│
▼
Render
Node.js + Express
│
├── LINE WORKS API
├── WOFF SDK
├── kintone REST API
└── kintone Webhook
│
▼
kintone
│
├── 報修案件
├── 故障照片
├── 維修人員
├── 處理狀態
└── 維修結果


# 2. 使用技術

Frontend:
- HTML
- CSS
- JavaScript

Backend:
- Node.js
- Express.js

API:
- Axios
- LINE WORKS Bot API
- LINE WORKS WOFF
- kintone REST API
- kintone Webhook

File Upload:
- Multer
- FormData

Authentication:
- LINE WORKS Service Account
- JWT

Hosting:
- Render

Source Control:
- GitHub


# 3. 主要功能

## 3.1 我要報修

WOFF 自動取得：

LINE WORKS User ID
LINE WORKS Display Name

員工填寫：

設備類別
設備編號
設備名稱
所在位置
故障描述
故障照片

圖片格式：

JPG
PNG
WebP

圖片限制：

最多 3 張
每張最多 10 MB

流程：

LINE WORKS WOFF
→ Render
→ kintone File API
→ 取得 fileKey
→ kintone Record API
→ 建立報修案件
→ LINE WORKS Bot 通知報修人


## 3.2 案件查詢

使用：

lineworks_user_id

判斷目前登入者的案件。

使用者可以查看：

案件編號
設備類別
設備編號
設備名稱
所在位置
故障描述
故障照片
處理狀態
維修人員
預計完成日期
實際完成日期
維修結果


## 3.3 維修任務

工程師使用：

maintenance_lineworks_user_id

查詢被指派的案件。

工程師可以：

查看設備資料
查看故障描述
查看故障照片
更新處理狀態
設定預計完成日期
設定實際完成日期
填寫維修進度
填寫維修結果

目前案件狀態：

待分派工程師處理
已指派工程師
維修中
無法維修
已完成


# 4. LINE WORKS Rich Menu

Rich Menu 共三個按鈕：

1. 我要報修
2. 案件查詢
3. 維修任務

圖片：

assets/repair-richmenu.png

尺寸：

2500 × 843 px

點擊區域：

我要報修
x = 0
y = 0
width = 833
height = 843

案件查詢
x = 833
y = 0
width = 834
height = 843

維修任務
x = 1667
y = 0
width = 833
height = 843

URL：

我要報修
→ WOFF_URL

案件查詢
→ WOFF_URL?view=my-repairs

維修任務
→ WOFF_URL?view=engineer


# 5. Project Structure

lineworks-kintone-repair-bot/

assets/
  repair-richmenu.png

public/
  index.html
  app.js
  style.css

routes/
  repairs.js
  engineerRepairs.js
  kintoneWebhook.js

services/
  kintoneService.js
  engineerService.js
  lineworksBotService.js
  lineworksRichMenuService.js

package.json
server.js
.env.example
.gitignore
README.md


# 6. kintone 報修 App

App Name:

報修申請單

必要欄位：

記錄編號
系統 RECORD_NUMBER

申請人
Field Code:
申請人

LINE WORKS User ID
Field Code:
lineworks_user_id

申請日期
Field Code:
application_date

設備類別
Field Code:
equipment_category

設備編號
Field Code:
equipment_number

設備名稱
Field Code:
equipment_name

所在位置
Field Code:
location

故障描述
Field Code:
fault_description

故障照片
Field Code:
fault_photo

處理狀態
Field Code:
處理狀態

維修人員
Field Code:
maintenance_staff

維修工程師 LINE WORKS User ID
Field Code:
maintenance_lineworks_user_id

預計完成日期
Field Code:
expected_completion_date

實際完成日期
Field Code:
actual_completion_date

維修結果記錄
Field Code:
maintenance_result


# 7. kintone 處理狀態

狀態文字必須與程式完全一致：

待分派工程師處理
已指派工程師
維修中
無法維修
已完成


# 8. Engineer Master App

App Name:

維修工程師對照表

開發環境目前 App ID:

1369

其他環境部署時請修改成該環境實際 App ID。

欄位：

維修工程師
Field Code:
engineer_user
Type:
USER_SELECT

LINE WORKS User ID
Field Code:
lineworks_user_id

啟用狀態
Field Code:
active_status

備註
Field Code:
notes

啟用狀態：

啟用
停用


# 9. Engineer Mapping

報修 App 安裝：

engineer-mapping.js

流程：

管理者選擇 maintenance_staff
→ 取得 kintone User Code
→ 查詢 Engineer Master
→ 找到 engineer_user
→ 取得 lineworks_user_id
→ 自動寫入 maintenance_lineworks_user_id

因此管理者不需要手動輸入工程師 LINE WORKS User ID。


# 10. LINE WORKS Client App

LINE WORKS Developer Console 建立 Client App。

建議名稱：

Kintone Repair Bot

啟用：

Service Account

需要的 OAuth Scope 依實際環境設定，例如：

openid
user.profile.read
user.read
bot
bot.read
bot.message


# 11. LINE WORKS WOFF

建立 WOFF App。

名稱：

報修申請單

Endpoint：

https://YOUR-RENDER-SERVICE.onrender.com/

Size:

Full

WOFF 前端初始化：

woff.init()

使用：

woff.getProfile()

取得：

profile.userId
profile.displayName

profile.userId 會存入 kintone：

lineworks_user_id


# 12. LINE WORKS Bot

Bot 名稱範例：

設備報修助手 With Kintone

設定流程：

Developer Console 建立 Bot
→ LINE WORKS Admin 加入 Domain
→ 設定使用者範圍
→ Bot API 傳送訊息


# 13. Bot 通知流程

## 建立報修

報修完成後：

🔧 報修案件已建立

內容包含：

案件編號
設備類別
設備名稱
設備編號
所在位置
目前狀態


## 指派工程師

kintone 管理者設定：

maintenance_staff

Engineer Master 自動設定：

maintenance_lineworks_user_id

kintone Webhook 呼叫 Render。

工程師收到：

🔧 新維修任務

報修人收到：

👨‍🔧 維修工程師已指派


## 維修中

報修人收到：

🧰 報修案件進度更新


## 無法維修

報修人收到：

⚠️ 報修案件狀態更新


## 已完成

報修人收到：

✅ 報修案件已完成

通知內容包含：

案件編號
設備資訊
維修人員
實際完成日期
維修結果


# 14. kintone Webhook

Endpoint:

https://YOUR-RENDER-SERVICE.onrender.com/api/kintone-webhook?secret=YOUR_SECRET

Webhook 建議啟用：

編輯記錄
流程管理狀態更新

Render Environment：

KINTONE_WEBHOOK_SECRET

請勿將 Secret 放進 GitHub。


# 15. Render Environment Variables

必要設定：

KINTONE_BASE_URL=
KINTONE_APP_ID=
KINTONE_API_TOKEN=

LINEWORKS_CLIENT_ID=
LINEWORKS_CLIENT_SECRET=
LINEWORKS_SERVICE_ACCOUNT=
LINEWORKS_PRIVATE_KEY=
LINEWORKS_BOT_ID=
LINEWORKS_WOFF_URL=

KINTONE_WEBHOOK_SECRET=


# 16. 不可上傳到 GitHub 的資訊

禁止 Commit：

KINTONE_API_TOKEN
LINEWORKS_CLIENT_SECRET
LINEWORKS_PRIVATE_KEY
KINTONE_WEBHOOK_SECRET
LINE WORKS Access Token
Temporary Setup Key
.env


# 17. .gitignore

至少包含：

node_modules/
.env
*.key


# 18. Local Development

Clone：

git clone https://github.com/adrianboon-cmd/lineworks-kintone-repair-bot.git

進入專案：

cd lineworks-kintone-repair-bot

安裝：

npm install

啟動：

npm start

Local URL：

http://localhost:3000

Health Check：

http://localhost:3000/api/health

正常結果：

{
  "success": true,
  "message": "LINE WORKS x kintone Repair Bot is running"
}


# 19. Render Deployment

Render：

New
→ Web Service
→ Connect GitHub Repository

設定：

Language:
Node

Branch:
main

Build Command:
npm install

Start Command:
npm start

Root Directory:
留空

正常 Deploy Log：

Running 'node server.js'
Server running on port 10000


# 20. API Endpoints

建立報修：

POST /api/repairs

我的案件：

GET /api/repairs/my?userId={LINE_WORKS_USER_ID}

工程師維修任務：

GET /api/engineer-repairs?userId={LINE_WORKS_USER_ID}

更新維修進度：

PUT /api/engineer-repairs/{recordId}

Example Body:

{
  "userId": "LINE_WORKS_USER_ID",
  "status": "維修中",
  "expectedCompletionDate": "2026-11-06",
  "actualCompletionDate": "",
  "maintenanceResult": "已完成初步檢查"
}

kintone Webhook：

POST /api/kintone-webhook?secret={KINTONE_WEBHOOK_SECRET}


# 21. User Mapping

報修人：

LINE WORKS profile.userId
→ lineworks_user_id

工程師：

kintone maintenance_staff
→ Engineer Master
→ lineworks_user_id
→ maintenance_lineworks_user_id

維修任務查詢：

maintenance_lineworks_user_id
=
目前登入 WOFF User ID


# 22. Test Checklist

建立報修：

□ WOFF 正常取得登入者
□ 設備類別正常
□ 所在位置正常
□ 故障描述正常
□ 圖片正常上傳
□ kintone 正常建立案件
□ lineworks_user_id 正常
□ Bot 建案通知正常

案件查詢：

□ 只看到自己的案件
□ 可以查看案件詳情
□ 可以查看故障照片
□ 可以看到維修狀態
□ 可以看到維修結果

工程師指派：

□ maintenance_staff 可選擇工程師
□ maintenance_lineworks_user_id 自動帶入
□ 工程師收到 Bot 新任務
□ 報修人收到指派通知

工程師維修：

□ 工程師看到自己的案件
□ 可以查看故障照片
□ 可以設定維修中
□ 可以設定預計完成日期
□ 可以寫維修紀錄
□ kintone 正常更新

案件完成：

□ 狀態可以設定已完成
□ 實際完成日期正常
□ 維修結果正常
□ 報修人收到完成通知


# 23. Troubleshooting

## Render Deploy Failed

查看 Logs：

SyntaxError
ReferenceError
MODULE_NOT_FOUND

正常：

Server running on port 10000


## WOFF 一直停在取得使用者資訊

確認：

WOFF SDK
WOFF ID
Endpoint URL
woff.init()

目前專案使用：

WOFF SDK 3.7.1


## 我的案件沒有資料

確認：

lineworks_user_id

必須等於：

WOFF currentUser.userId


## 工程師看不到案件

確認：

maintenance_lineworks_user_id

必須等於：

工程師 WOFF currentUser.userId


## Engineer Mapping 無法自動帶入

確認 Master：

engineer_user
lineworks_user_id
active_status = 啟用

確認報修 App：

maintenance_staff
maintenance_lineworks_user_id


## Webhook 失敗

錯誤：

https://https://YOUR-RENDER-SERVICE...

是不正確的。

正確：

https://YOUR-RENDER-SERVICE.onrender.com/api/kintone-webhook?secret=YOUR_SECRET

並確認：

Render KINTONE_WEBHOOK_SECRET

必須與：

Webhook URL secret

完全一致。


## Bot 沒有通知

確認：

LINEWORKS_BOT_ID
bot.message Scope
Service Account
Private Key
Bot 已加入 Domain
使用者在 Bot 使用範圍內


# 24. Production Security

目前版本為 V1.0 Demo / MVP。

正式 Production 建議增加：

Server-side WOFF Identity Verification
Webhook Duplicate Prevention
Photo Authorization
API Rate Limiting
Audit Log
Error Monitoring
Structured Logging

目前部分 API 使用：

?userId=

由前端傳入 User ID。

正式 Production 建議改為：

WOFF Token
→ Render 驗證
→ Server 取得登入 User ID
→ Server-side Authorization


# 25. 新環境複製 Checklist

□ Clone / Fork GitHub Repository
□ 建立 kintone 報修 App
□ 建立 Engineer Master
□ 建立所有 Field Code
□ 安裝 engineer-mapping.js
□ 建立 kintone API Token
□ 建立 LINE WORKS Client App
□ 啟用 Service Account
□ 建立 Private Key
□ 設定 OAuth Scope
□ 建立 WOFF
□ 建立 Bot
□ LINE WORKS Admin 加入 Bot
□ 建立 Rich Menu
□ 建立 Render Web Service
□ 設定 Environment Variables
□ 設定 kintone Webhook
□ 測試報修
□ 測試照片
□ 測試案件查詢
□ 測試工程師指派
□ 測試維修任務
□ 測試 Bot 通知
□ 測試案件完成


# 26. Current Version

Version:

V1.0

Completed:

✅ LINE WORKS WOFF
✅ LINE WORKS User Authentication
✅ Equipment Repair Form
✅ Photo Upload
✅ kintone Record Creation
✅ My Repair Cases
✅ Repair Photo Preview
✅ Engineer Task List
✅ Engineer Progress Update
✅ Engineer Master Mapping
✅ LINE WORKS Bot
✅ Bot Status Notifications
✅ kintone Webhook
✅ LINE WORKS Rich Menu
✅ GitHub → Render Auto Deploy


# 27. Future Enhancements

V2 可考慮：

Webhook 防重複通知
Bot Deep Link Button
自動工程師派工
逾期案件通知
SLA 管理
設備 Master
QR Code 掃描報修
設備維修履歷
零件管理
維修 Dashboard
故障類型統計
預防性維護
AI 故障排除建議


# Maintainer Notes

修改系統時：

1. 不要把 Secret Commit 到 GitHub。
2. kintone Field Code 不要任意修改。
3. 修改重要功能前先 Commit。
4. WOFF 必須從 LINE WORKS 內測試。
5. Webhook 修改後必須重新測試。
6. 正式上線前使用報修人與工程師兩種帳號完整驗收。
7. 若 Deploy 失敗，優先查看 Render Logs。
8. 保留已知可正常運作的 GitHub Commit，方便快速復原。


# License

Internal / Demo Use.

正式導入客戶環境前，請另外確認：

資訊安全
個資處理
API 權限
客戶企業政策
LINE WORKS 授權
kintone 授權
Render Hosting Policy
