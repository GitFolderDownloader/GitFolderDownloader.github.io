##  Git Folder Downloader Download Button (UserScript)

A **GitHub UI enhancement UserScript** that adds context-aware download buttons to GitHub repositories, folders, and files using the **Git Folder Downloader API**.

Works with:

* ScriptRunner
* Tampermonkey
* Violentmonkey
* And many others

---

## ✨ Features

### 🎯 Smart context detection

| Location        | Button Label        |
| --------------- | ------------------- |
| Repository Code Button Menu |  **Download Repo** |
| Folder More Option Menu     | **Download Folder** |
| File  More Option Menu        | **Download**        |

---

### 🧠 Smart name detection

* Auto-detects:

  * Repository name → `owner-repo`
  * Folder name → `folder-name`
  * File name → `file.ext`
* Pre-fills the name in popup
* Fully editable by user

---

### 🪟 Custom popup

* GitHub-styled modal
* Cancel / Download actions
* ESC key support
* Click-safe (no accidental downloads)

---

### 🎨 Auto GitHub theme detection

* Matches **Light** and  **Dark** GitHub themes
* Uses GitHub CSS variables for native look
* Updates automatically when theme changes

---

### ⚡ Technical highlights

* Fully client-side
* No external libraries
* SPA-safe (GitHub Turbo / PJAX supported)
* No duplicate buttons
* Injects button at **top of menus**
* Zero interference with GitHub functionality

---

## 🔗 Download URL format

```
https://GitFolderDownloader.github.io/api/?url=<GITHUB_URL>&name=<CUSTOM_NAME>
```

Example:

```
https://GitFolderDownloader.github.io/api/?url=https://github.com/user/repo/tree/main/src&name=src
```

---

## 📦 Installation

### ScriptRunner

1. Create a new script
2. Paste the UserScript code
3. Enable the script
4. Visit GitHub

### Tampermonkey / Violentmonkey

1. Create a new UserScript
2. Paste the code
3. Save
4. Open GitHub

---

## 🛡 Permissions

* Runs only on:

  ```
  https://github.com/*
  ```
* No tracking
* No analytics
* No data collection

---




---

## 🤝 Contributing

Pull requests and ideas are welcome.
If GitHub UI changes, updates may be required to selectors.

---

## 📜 License

GPL 3 License – free to use, modify, and distribute.

---

## ⭐ Credits

* **[Git Folder Downloader](https://GitFolderDownloader.github.io/wiki/)**
* **[MicroResearch Corporation](https://MicroResearch-Corporation.github.io)**
* **[Pro Bandey](https://Pro-Bandey.github.io)**
