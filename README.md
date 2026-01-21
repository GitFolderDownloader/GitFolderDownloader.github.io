# Git Folder Downloader 🚀

A powerful, pixel-perfect, single-page web application to download files or folders from GitHub repositories. It supports public URLs, private repositories (via Token), and requires **no server**.

## ✨ Features

- **Download Sub-folders**: Download any specific folder from a repo as a ZIP.
- **Client-Side Only**: Works 100% in the browser (GitHub Pages / Vercel compatible).
- **Smart Routing**: Share links like `mysite.com/#/github.com/user/repo` to auto-start downloads.
- **Private Repo Support**: Enter a Personal Access Token (stored locally) to access private files.
- **Partial Downloads**: Download large repositories in steps (e.g., files 0-100) to avoid browser limits.
- **Beautiful UI**: Smooth animations, file previews, and progress bars.
- **Theming**: 8 Themes including Dracula, Cyberpunk, AMOLED, and more.

## 🔗 How to Use Smart Links

To share a direct download link with a friend, simply add the GitHub URL after the hash (`?=`):

### Direct
> [https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages](https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages)

### With Name
> [https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages&name=react-core](https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages&name=react-core)

### Partial / Range Download
If a repository is too large, you can limit the number of files to download using `&st` (Start) and `&mx` (Max).
> [https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages&st=50&mx=150](https://GitFolderDownloader.github.io/?=https://github.com/facebook/react/tree/main/packages&st=50&mx=150)

*   `&st=50`: Start downloading from the 50th file.
*   `&mx=150`: Stop downloading at the 150th file.

When the user visits this link, the app will:
1. Parse the URL.
2. Auto-fill the input and limit fields.
3. Immediately start fetching and zipping files **50 to 150**.

## 🔑 Private Repositories

1. Generate a GitHub Token (Settings > Developer Settings > Personal Access Tokens).
2. Scopes needed: `repo` (for private) or just public access.
3. Open Git Folder Downloader > Click Gear Icon (⚙️).
4. Paste token. It is saved in your browser's LocalStorage and never sent to any 3rd party server.

---
## 🔗 API

To embed a direct download link within your website/page, simply use this pattern. The API also supports the `&st` and `&mx` parameters.

### Embed as a link
```html
<!-- Download all files -->
<a href="https://GitFolderDownloader.github.io/api/?=https://github.com/facebook/react/tree/main/packages&name=react-core">Download Core</a>

<!-- Download files 0 to 100 only -->
<a href="https://GitFolderDownloader.github.io/api/?=https://github.com/facebook/react/tree/main/packages&name=react-core&st=0&mx=100">Download Part 1</a>
```

### Use via JavaScript
```javascript
function triggerDownload() {
    const repo = "https://github.com/facebook/react/tree/main/packages";
    
    // Optional: Add limits for large folders
    const params = "&st=0&mx=200"; 
    
    const apiUrl = `https://git-zip-pro.vercel.app/api/?url=${repo}${params}`;
 
    window.open(apiUrl, '_blank');
}
```

---

## 📜 Userscript

Git Folder Downloader also provides a **GitHub-integrated userscript** that adds a native-looking **Download button directly inside GitHub menus**.

### ✨ What the Userscript Does

* Injects a **“Download Repo / Folder / File”** action into GitHub’s context menus
* Automatically detects:
  * **Repository menu** → shows **Download Repo**
  * **Folder menu** → shows **Download Folder**
  * **File menu** → shows **Download**
* Opens a **GitHub-themed custom popup** to set an optional download name
* Auto-fills the popup with the current repo / folder / file name
* Fully matches GitHub light & dark themes
* Uses the official **Git Folder Downloader API** under the hood

### 🧩 Supported Script Runners

* Tampermonkey
* Violentmonkey
* ScriptRunner (Chromium-based extensions)
* Other userscript-compatible extensions

### 🛠️ How to Install

1. Install a userscript manager (Tampermonkey / ScriptRunner).
2. Create a **new userscript**.
3. Paste the provided [GitFolderDownloader userscript](https://GitFolderDownloader.github.io/script/GitFolderDownloader-download-button-user.js) code or direct link in url bar.
4. Save and enable the script.
5. Visit any GitHub repository, folder, or file.
6. Open the GitHub menu → click **Download Repo / Folder / Download**.

> No configuration required. Works instantly on GitHub pages.

---

## 🧩 Browser Extension

The Git Folder Downloader userscript can also be packaged as a **lightweight browser extension** using ScriptRunner-style extensions.

## [Download Now](https://GitFolderDownloader.github.io/api/?=https://github.com/GitFolderDownloader/GitFolderDownloader.github.io/tree/main/extension&name=Extension)

### 🚀 Extension Capabilities

* Zero background services
* No permissions beyond GitHub pages
* Runs fully client-side
* Injects UI only when GitHub menus are detected
* SPA-safe (works with GitHub Turbo / PJAX navigation)

### 📦 Extension Use Cases

* Personal daily GitHub usage
* Developers frequently downloading subfolders
* Lightweight alternative to full GitHub downloader extensions
* No tracking, no analytics, no servers

### 🔐 Privacy

* No data is collected
* No GitHub tokens are accessed by the script
* Downloads are handled entirely by **Git Folder Downloader API** in a new tab

---

## 🤝 Contributing

Feel free to open issues or submit PRs. The code is written in JS/CSS for maximum simplicity and performance.
