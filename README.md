# Chris Zhang — Personal Dossier

張家銘的個人網站。「機密檔案夾／活版印刷」紙張擬物風格，純 HTML / CSS / JS，可以直接放上 GitHub Pages。

## 資料夾結構

```
index.html          主頁面（個人資料、作品寫在這裡）
css/style.css       樣式
js/main.js          互動：便利貼、貼文列表、捲動效果
review/reviews.js   ← 評價資料（新增評價改這個檔）
post/posts.js       ← 貼文資料（新增貼文改這個檔）
honor/honors.js     ← 榮譽資料（新增榮譽改這個檔）
img/                圖片
  avatar.jpg        大頭照（自己放，建議直式 4:5）
  works/            作品截圖：zhangai.png / pacman.png / better-cd.png / levelflask.png
  posts/            貼文圖片
```

## 新增評價

打開 `review/reviews.js`，複製一個 `{ ... }` 區塊、改內容：

```js
{ name: "王小明", role: "雲科大資管 同學", text: "評價內容…", date: "2026-11", color: "blue" },
```

顏色可用 `yellow` `pink` `green` `blue` `orange` `purple` 或任何 CSS 色碼。

## 新增榮譽

打開 `honor/honors.js`，複製一個 `{ ... }` 區塊、改內容：

```js
{ title: "1st Place — Software Design", event: "National Skills Competition", year: "2023", link: "" },
```

第一項會直接顯示在個人檔案；有兩項以上會出現「▸ +N MORE」箭頭，點開看全部。

## 新增貼文

1. 把圖片放進 `img/posts/`
2. 打開 `post/posts.js`，加一個區塊：

```js
{
  title: "貼文標題",
  link: "https://www.linkedin.com/posts/...",
  image: "img/posts/my-photo.jpg",
  date: "2026-11-01",
  tag: "LinkedIn",
  summary: "一兩句摘要"
},
```

貼文會依日期自動排序，最新一篇會變成大頭條；超過 7 篇會出現「看更多」按鈕。

## 圖片缺少時

- 大頭照沒放：自動使用 GitHub 頭像
- 作品截圖沒放：自動使用 GitHub 產生的 repo 預覽圖
- 其他圖片讀不到：顯示斜線紙張佔位框

## 部署到 GitHub Pages

1. 建立 repo（想用 `https://iampihi.github.io/` 就把 repo 命名為 `IAmPiHi.github.io`）
2. 把這個資料夾所有檔案 push 上去
3. repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`
4. 要用自己的網域 `chriszhang.net`：在 Pages 設定填 Custom domain，並在 DNS 加上 GitHub Pages 的 A／CNAME 記錄

## 本機預覽

直接雙擊 `index.html` 就能看（資料是用 `<script>` 載入，不需要伺服器）。
