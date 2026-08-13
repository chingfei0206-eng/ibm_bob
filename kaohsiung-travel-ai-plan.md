# 高雄旅遊 AI 行程規劃 MVP — 計畫文件

## Top-Level Overview

打造一個高雄市旅遊客製化行程規劃網站的 MVP，使用者透過簡單的表單輸入旅遊條件，由 **Agnes AI（agnes-2.5-flash）** AI 產生客製化行程，並整合大眾交通 Mock 時刻表與 Google Maps 導航連結，讓整個行程可以實際展示給評審或投資人。

**技術架構：**
- 前端框架：Next.js (React) — App Router、TypeScript
- UI：Tailwind CSS + shadcn/ui
- AI 行程：Agnes AI API（OpenAI 相容介面，模型：`agnes-2.5-flash`）搭配 `openai` npm 套件
- 地圖導航：Google Maps URL Scheme（點擊跳轉）
- 交通時刻：Mock JSON 資料（預留真實 API 介面）
- 語系：繁體中文為主介面（暫不做多語系切換）
- 部署：本地開發（`npm run dev`），架構預留 Vercel 部署能力

**Agnes AI 關鍵資訊：**
- Base URL：`https://apihub.agnes-ai.com/v1`
- 認證：`Authorization: Bearer YOUR_API_KEY`（標準 Bearer Token）
- SDK：`openai` npm 套件（設定 `baseURL` 與 `apiKey` 即可使用）
- 可用模型：`agnes-2.5-flash`、`agnes-25-pro`、`agnes-20-flash`
- API Key 取得：登入 [Agnes AI Console](https://platform.agnes-ai.com) → API Key 管理頁面 → 建立並複製
- 免費額度：提供免費 API credits，適合開發與 Demo 使用

**非目標（MVP 不做）：**
- 真實交通 API 串接
- 使用者登入 / 儲存行程
- 付費功能
- 後台管理介面
- 多語系切換（暫不實作）

**專案位置：** `kaohsiung-travel-ai/`（建立於工作區根目錄）

---

## 子任務列表

---

### 子任務 1 — 專案初始化與基礎架構建置

- **Status:** `[ ] pending`

**Intent**
建立 Next.js 專案骨架，設定 Tailwind CSS、shadcn/ui，確保開發環境可正常運行，為後續功能開發打好基礎。

**Expected Outcomes**
- 專案可在本地 `npm run dev` 啟動（預設 localhost:3000）
- Tailwind CSS 樣式生效
- shadcn/ui 元件可正常引用
- 資料夾結構符合架構規劃

**Todo List**
1. 在工作區根目錄使用 `create-next-app` 建立 `kaohsiung-travel-ai` 專案（TypeScript、App Router、Tailwind CSS）
2. 安裝並初始化 shadcn/ui（`npx shadcn@latest init`）
3. 安裝所需 shadcn/ui 元件：`button`、`checkbox`、`input`、`select`、`textarea`、`card`、`badge`、`skeleton`
4. 安裝 OpenAI SDK：`npm install openai`
5. 建立資料夾結構：`/app`、`/components/form`、`/components/itinerary`、`/lib`、`/data`
6. 建立 `.env.local`，加入 `AGNES_API_KEY=` 佔位符（從 Agnes AI Console 取得）
7. 驗證 `npm run dev` 可正常啟動，首頁顯示預設畫面

**Relevant Context**
- 無現有程式碼，全新專案
- 工作區位置：`kaohsiung-travel-ai/`
- Agnes AI API Key 取得：https://platform.agnes-ai.com → API Key 管理頁 → 建立

---

### 子任務 2 — 使用者輸入表單介面

- **Status:** `[ ] pending`

**Intent**
打造使用者填寫旅遊條件的表單頁面，收集所有規劃行程所需的輸入資訊，UI 需清晰易用，適合行動裝置。

**Expected Outcomes**
- 表單包含所有必要欄位並可正常提交
- 表單在手機與桌機皆有良好顯示（RWD）
- 提交後資料可被正確讀取並傳遞給行程結果頁

**Todo List**
1. 建立首頁 `/app/page.tsx` 作為表單入口，加入 Hero 區塊（標題「高雄旅遊 AI 行程規劃」、副標、背景以高雄港灣色調）
2. 實作「喜好主題」多選元件（港灣文青、歷史文化、美食探索、親子樂園、自然生態）使用 shadcn/ui `Checkbox`
3. 實作「人數」輸入（大人 / 小孩各幾位）使用 shadcn/ui `Input`
4. 實作「交通方式」選擇（大眾運輸、開車、步行、混合）使用 shadcn/ui `Select`
5. 實作「天數」選擇（1–7 天）使用 shadcn/ui `Select`
6. 實作「備註」自由文字輸入（例如：素食、無障礙）使用 shadcn/ui `Textarea`
7. 加入表單驗證（必填欄位：至少選一個主題、天數）
8. 「開始規劃 ✈️」送出按鈕，送出後以 query string 方式將表單資料傳遞至 `/itinerary` 頁面

**Relevant Context**
- 使用 React `useState` 管理表單狀態（避免引入額外依賴）
- 配色：海洋藍 `#0077B6`、珊瑚橘 `#F4845F`、淺沙白 `#FAF3E0`
- 表單資料透過 `URLSearchParams` 編碼後以 `router.push` 導向行程頁

---

### 子任務 3 — Agnes AI 行程產生 API

- **Status:** `[ ] pending`

**Intent**
建立後端 API Route，接收使用者輸入的條件，組成 Prompt 透過 Agnes AI API（OpenAI 相容介面）呼叫 AI 模型，產生結構化的高雄旅遊行程 JSON。

**Expected Outcomes**
- `/api/generate-itinerary` API Route 可正常接收 POST 請求並回傳行程資料
- 回傳格式為結構化 JSON（包含每日行程、景點資訊、交通建議）
- Prompt 設計能產生符合條件的高雄在地行程（繁體中文）
- 異常時回傳清楚的錯誤訊息

**Todo List**
1. 建立 `/app/api/generate-itinerary/route.ts`
2. 使用 `openai` SDK 初始化 client，設定：
   ```ts
   import OpenAI from "openai";
   const client = new OpenAI({
     baseURL: "https://apihub.agnes-ai.com/v1",
     apiKey: process.env.AGNES_API_KEY,
   });
   ```
3. 設計繁體中文 Prompt 模板，將使用者輸入（喜好主題、大人數、小孩數、交通方式、天數、備註）組入
4. 要求模型以純 JSON 回傳（system prompt 指定），不含 Markdown code fence，定義 JSON Schema：
   ```
   {
     "days": [
       {
         "day": 1,
         "title": "第一天標題",
         "spots": [
           {
             "name": "景點名稱",
             "address": "地址",
             "description": "簡介",
             "lat": 22.63,
             "lng": 120.30,
             "duration": "1.5 小時"
           }
         ],
         "transits": [
           {
             "from": "起點景點名",
             "to": "終點景點名",
             "transport_type": "MRT | 輕軌 | 公車 | 步行 | 開車",
             "duration": "15 分鐘"
           }
         ]
       }
     ]
   }
   ```
5. 使用 `client.chat.completions.create({ model: "agnes-2.5-flash", messages: [...] })` 呼叫並解析回傳內容為 JSON（使用 `JSON.parse`，若解析失敗回傳 500）
6. 加入基本錯誤處理：`AGNES_API_KEY` 缺失、API 回應格式異常

**Relevant Context**
- 環境變數：`AGNES_API_KEY`（存於 `.env.local`）
- Agnes AI base URL：`https://apihub.agnes-ai.com/v1`
- 使用標準 `openai` npm 套件，僅需覆寫 `baseURL`
- 回傳 JSON 結構需與子任務 4、5 對齊

---

### 子任務 4 — 行程結果頁面顯示

- **Status:** `[ ] pending`

**Intent**
將 AI 產生的行程以清晰的視覺方式呈現，讓使用者可以一眼看懂每天的行程安排，並看到每個景點的基本資訊。

**Expected Outcomes**
- 行程結果頁 `/app/itinerary/page.tsx` 可正常顯示
- 依天數分區塊顯示行程（Day 1、Day 2…）
- 每個景點顯示：名稱、描述、預估停留時間
- 顯示 loading skeleton 狀態（等待 AI 回應時）
- 行動裝置顯示正常

**Todo List**
1. 建立 `/app/itinerary/page.tsx`（Client Component），從 query string 讀取表單參數
2. 頁面載入時呼叫 `POST /api/generate-itinerary`，管理 `loading`、`error`、`data` 狀態
3. 實作 `DayCard` 元件（`/components/itinerary/DayCard.tsx`）：顯示「第 N 天」標題與當日景點清單
4. 實作 `SpotCard` 元件（`/components/itinerary/SpotCard.tsx`）：顯示景點名稱、描述、預估停留時間、導航按鈕
5. 實作 `TransitSegment` 元件（`/components/itinerary/TransitSegment.tsx`）：交通方式 icon + 時間 + 查看路線按鈕
6. 實作 loading skeleton：使用 shadcn/ui `Skeleton` 元件，顯示卡片佔位動畫
7. 加入「重新規劃」按鈕，導回首頁表單

**Relevant Context**
- 元件放於 `/components/itinerary/`
- 資料結構來自子任務 3 定義的 JSON Schema
- 使用 Next.js `useSearchParams()` 讀取 query string

---

### 子任務 5 — Mock 大眾交通時刻表整合

- **Status:** `[ ] pending`

**Intent**
在行程表中加入高雄大眾交通的 Mock 時刻資料，讓每段景點間的移動有具體的班次時間可以參考，展示時更真實可信。

**Expected Outcomes**
- 行程中每段交通顯示建議搭乘時間與班次
- Mock 資料結構預留真實 API 介面，未來可直接替換
- 支援高雄 MRT、輕軌、公車三種交通類型

**Todo List**
1. 在 `/data/mock-transit.ts` 建立 Mock 時刻表資料，定義 `TransitSchedule` 介面：
   - `route`: 路線名稱（如「高雄 MRT 紅線」）
   - `from`: 起站
   - `to`: 訖站
   - `type`: `"MRT" | "輕軌" | "公車"`
   - `departures`: 建議出發時間陣列（如 `["09:00", "09:15", "09:30"]`）
2. 填入常見高雄景點間路線的 Mock 資料（美麗島 ↔ 鹽埕埔、鹽埕埔 ↔ 西子灣、中央公園 ↔ 駁二等）
3. 建立查詢函式 `getTransitSchedule(from: string, to: string, type: string)` 回傳最近班次
4. 在 `TransitSegment` 元件中呼叫 `getTransitSchedule`，顯示建議搭乘時刻（若無 Mock 資料則顯示「請參考 Google Maps」）

**Relevant Context**
- 檔案位置：`/data/mock-transit.ts`
- 整合至子任務 4 的 `TransitSegment` 元件

---

### 子任務 6 — Google Maps 導航功能整合

- **Status:** `[ ] pending`

**Intent**
在每個景點與每段交通旁加入 Google Maps 導航連結，使用者點擊後直接跳轉至 Google Maps，零成本實作且 Demo 效果佳。

**Expected Outcomes**
- 每個景點卡片有「📍 導航」按鈕，點擊後新分頁開啟 Google Maps
- 目的地預填正確（景點名稱或地址）
- 行動裝置點擊可觸發 Google Maps App
- 交通段落有「🗺️ 查看路線」按鈕，顯示起訖點路線

**Todo List**
1. 建立工具函式於 `/lib/maps.ts`：
   - `buildGoogleMapsSearchUrl(destination: string)` → `https://www.google.com/maps/search/?api=1&query=<地點>`
   - `buildGoogleMapsDirectionUrl(origin: string, destination: string, mode: string)` → `https://www.google.com/maps/dir/?api=1&origin=<起點>&destination=<終點>&travelmode=transit`
2. 在 `SpotCard` 元件加入「📍 導航」按鈕，呼叫 `buildGoogleMapsSearchUrl`（傳入景點名稱 + 地址）
3. 在 `TransitSegment` 元件加入「🗺️ 查看路線」按鈕，呼叫 `buildGoogleMapsDirectionUrl`（from → to，交通方式對應 travelmode）

**Relevant Context**
- 工具函式位置：`/lib/maps.ts`
- Google Maps travelmode 對應：MRT/輕軌/公車 → `transit`、開車 → `driving`、步行 → `walking`

---

### 子任務 7 — 整體 UI 美化與完工確認

- **Status:** `[ ] pending`

**Intent**
整合所有功能後，進行整體視覺調整，確保 MVP 在 Demo 時呈現專業、一致的高雄在地風格，行動裝置體驗流暢。

**Expected Outcomes**
- 整體配色與高雄城市意象一致（海洋藍、港灣色調）
- 首頁 Hero 區塊視覺吸引人
- 所有頁面 RWD 在手機、平板、桌機皆正常
- `npm run build` 無 TypeScript 錯誤與警告

**Todo List**
1. 在 `tailwind.config.ts` 設定自訂色彩 token：`ocean-blue: #0077B6`、`coral-orange: #F4845F`、`sand-white: #FAF3E0`
2. 調整首頁 Hero 區塊：大標題、副標、高雄城市描述文字，背景漸層使用自訂色彩
3. 為所有卡片元件加入 hover 效果與圓角陰影，提升質感
4. 確認所有頁面 RWD 在手機（375px）、平板（768px）、桌機（1280px）皆正常
5. 執行 `npm run build` 確認 TypeScript 無錯誤
6. 確認表單 → AI 生成 → 行程顯示 → Google Maps 導航完整流程正常

**Relevant Context**
- 配色：`#0077B6`（海洋藍）、`#F4845F`（珊瑚橘）、`#FAF3E0`（淺沙白）
- 整合所有前面子任務的元件

---

## 架構總覽

```
kaohsiung-travel-ai/
├── app/
│   ├── page.tsx                        # 首頁（Hero + 輸入表單）
│   ├── itinerary/
│   │   └── page.tsx                    # 行程結果頁
│   └── api/
│       └── generate-itinerary/
│           └── route.ts                # Agnes AI API Route
├── components/
│   ├── form/                           # 表單元件（如 ThemeCheckboxGroup）
│   └── itinerary/
│       ├── DayCard.tsx                 # 每日行程卡片
│       ├── SpotCard.tsx                # 景點卡片（含導航按鈕）
│       └── TransitSegment.tsx          # 交通段落（含時刻 + 路線按鈕）
├── data/
│   └── mock-transit.ts                 # Mock 交通時刻資料
├── lib/
│   └── maps.ts                         # Google Maps URL 工具函式
├── .env.local                          # GITHUB_TOKEN=
└── tailwind.config.ts                  # 自訂色彩 token
```

## 關鍵技術決策

| 原始規劃 | MVP 實際採用 | 原因 |
|---|---|---|
| OpenAI GPT-4o | Agnes AI（agnes-2.5-flash） | 依使用者指定，提供免費 credits |
| `OPENAI_API_KEY` | `AGNES_API_KEY` | 對應 Agnes AI API Key |
| `@google/generative-ai` | `openai` npm 套件（覆寫 baseURL） | Agnes AI 為 OpenAI 相容介面 |
| 部署至 Vercel | 本地開發為主 | 依使用者指定 |
