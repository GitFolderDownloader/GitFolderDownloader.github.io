
# DownGD Api

A minimalistic, Material Design 3 enabled web tool to download specific folders or files from GitHub repositories as ZIPs. Works strictly client-side.

## 🚀 Live Demo & API
Access the main tool here: [https://DownGD.github.io/](https://DownGD.github.io/)

Access the API here: [https://DownGD.github.io/api/](https://DownGD.github.io/api/)

---

## 🛠️ API Documentation (Headless Mode)

DownGD Api includes a powerful "Headless API" page (`api.html`). This allows you to trigger downloads programmatically or via direct links without interacting with the main UI.

### 1. Base URL
```
https://DownGD.github.io/api/
```

### 2. Parameters

| Parameter  | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `url` | **Yes** | The full GitHub URL to the folder or file. | `https://github.com/user/repo/tree/main/src` |
| `filename` | No | Custom name for the downloaded file (auto-adds extension). | `my-backup` |
| `token` | No | GitHub Personal Access Token (for private repos). | `ghp_xxxxxxxx` |

### 3. Usage Examples

#### A. Basic Folder Download
Download the `packages` folder from the React repo:
```
https://DownGD.github.io/api/?url=https://github.com/facebook/react/tree/main/packages
```

#### B. Download with Custom Name
Download the folder but save it as `react-core.zip`:
```
https://DownGD.github.io/api/?url=https://github.com/facebook/react/tree/main/packages&filename=react-core
```

#### C. Short Syntax (Legacy Support)
You can also use the hash or `?=` syntax:
```
https://DownGD.github.io/api/?=https://github.com/facebook/react/tree/main/packages
```

### 4. Integration Example (JavaScript)
You can use an `iframe` or `window.open` to trigger downloads from your own website:

```javascript
function triggerDownload() {
    const repo = "https://github.com/facebook/react/tree/main/packages";
    const apiUrl = `https://git-zip-pro.vercel.app/api/?url=${repo}`;
 
    window.open(apiUrl, '_blank');
}
```

---


## 🔒 Privacy & Tokens
*   **No Server:** All logic runs in your browser.
*   **Tokens:** If you enter a GitHub Token, it is saved to `localStorage` on your device only. It is never sent to us.



## 📝 License

Open Source. GNU GENERAL PUBLIC LICENSE Version 3
