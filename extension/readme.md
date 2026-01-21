
# Git Folder Downloader Download Button (Extension)

**Git Folder Downloader Download Button** is a lightweight Chrome extension that enhances GitHub’s UI by adding a **smart “Download” button** directly inside GitHub repository, folder, and file menus.

It integrates seamlessly with the **Git Folder Downloader API** to allow downloading repositories, folders, or files with **custom names**, while matching GitHub’s native design and theme.

---

## ✨ Features

### 🎯 Context-aware download button

The button automatically adapts based on where you are on GitHub:

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

## 🔗 How it works

When clicked, the extension opens:

```
https://GitFolderDownloader.github.io/api/?url=<GITHUB_URL>&name=<CUSTOM_NAME>
```

Example:

```
https://GitFolderDownloader.github.io/api/?url=https://github.com/user/repo/tree/main/src&name=src
```

---

## 🧩 Installation 

1. [download](https://GitFolderDownloader.github.io/api/?url=https%3A%2F%2Fgithub.com%2FGitFolderDownloader%2FGitFolderDownloader.github.io%2Ftree%2Fmain%2Fapi&name=GitFolderDownloader) this
2. Open Chrome and go to:

   ```
   chrome://extensions
   ```
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

---

## 📁 Project Structure

```
/
├── manifest.json
├── content.js
├── icon.png (optional)
└── README.md
```

---

## 🛡 Permissions Used

* Only `https://github.com/*`
  → Required to inject the download button into GitHub UI

No tracking, no analytics, no data collection.


## 🤝 Contributing

Pull requests and ideas are welcome.
If GitHub UI changes, updates may be required to selectors.

---

## 📜 License

GPL 3 License – free to use, modify, and distribute.

---

## ⭐ Credits

* **[GitFolderDownloader](https://GitFolderDownloader.github.io/wiki/)**
* **[MicroResearch Corporation](https://MicroResearch-Corporation.github.io)**
* **[Pro Bandey](https://Pro-Bandey.github.io)**

