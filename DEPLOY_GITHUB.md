# 部署到 GitHub Pages

這是完整靜態網站，無需 API 金鑰、後端或 npm install。`dist/` 包含可直接發布的 HTML、CSS、JavaScript 與 Leaflet。使用相對資源路徑，可部署在 GitHub Pages 的 repository 子路徑。

## 1. 建立 repository 並上傳

在 GitHub 建立 repository，例如 `maritime-test-planner`。將解壓縮後 `maritime-test-planner` 資料夾內的所有內容放在 repository 根目錄，包括 `.github/workflows/pages.yml`。不要只上傳 ZIP 或多包一層資料夾。

建議使用 GitHub Desktop：Add local repository → 選此資料夾 → 若尚無 Git repository，選 Create a repository here → Commit → Publish repository。確認主分支名稱為 `main`。

若使用 Git CLI，在此資料夾執行（將網址替換成自己的 repository）：

```powershell
git init -b main
git add .
git commit -m "Initial maritime test planner"
git remote add origin https://github.com/YOUR_USERNAME/maritime-test-planner.git
git push -u origin main
```

## 2. 啟用 Pages

1. Repository → Settings → Pages。
2. Build and deployment → Source 選 **GitHub Actions**。
3. Repository → Actions → **Deploy to GitHub Pages** → Run workflow → main。
4. 工作流程成功後，從部署結果或 Settings → Pages 開啟網站。
5. 後續 push 到 main 會先執行檢查，再自動發布 `dist/`。

預設網站格式為 `https://YOUR_USERNAME.github.io/maritime-test-planner/`。實際網址以 GitHub 部署結果為準。

GitHub Free 可對公開 repository 使用 Pages；私人 repository 的 Pages 可用性取決於方案。這份靜態版不含 Sites 的登入與存取控制；請依 GitHub 的網站可見性設定處理分享範圍。

## 3. 本機使用

已安裝 Python 的 Windows 電腦可在 PowerShell 執行：

```powershell
.\start-local.ps1
```

或跨平台使用：

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

在瀏覽器開啟 `http://localhost:8000`。不要直接雙擊 index.html，因為程式使用 JavaScript ES modules。

## 4. 搬移既有航線

瀏覽器儲存依網站來源隔離。請先在舊 Sites 網站按「儲存 JSON」，再於 GitHub Pages 網站按「開啟專案」匯入。此套件不包含你瀏覽器內的私人航線資料。

## 5. 測試及維護

安裝 Node.js 22 或更新版後執行：

```sh
npm test
```

幾何與時間測試、出發時間搜尋測試均不需額外套件。GitHub Actions 使用 runner 內建 Node.js。

地圖仍需連線至 NLSC、Esri 或 OpenStreetMap。若底圖服務載入失敗，可切換底圖。套件未內嵌地圖影像。

## 官方文件

https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
