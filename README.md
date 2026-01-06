# DownGD 2.O 🚀

A powerful, pixel-perfect, single-page web application to download files or folders from GitHub repositories. It supports public URLs, private repositories (via Token), and requires **no server**.

## ✨ Features

- **Download Sub-folders**: Download any specific folder from a repo as a ZIP.
- **Client-Side Only**: Works 100% in the browser (GitHub Pages / Vercel compatible).
- **Smart Routing**: Share links like `mysite.com/#/github.com/user/repo` to auto-start downloads.
- **Private Repo Support**: Enter a Personal Access Token (stored locally) to access private files.
- **Beautiful UI**: Smooth animations, file previews, and 2.Ogress bars.
- **Theming**: 8 Themes including Dracula, Cyberpunk, AMOLED, and more.

## 🛠️ Installation / Deployment

Since this requires no build step, deployment is instant.

### Option 1: GitHub Pages (Recommended)
1. Fork this repository (or create a new one).
2. Upload `index.html`, `style.css`, `script.js`, and `wiki.html`.
3. Go to **Settings > Pages**.
4. Select `main` branch and click **Save**.
5. Your site is live!

### Option 2: Local Use
1. Download the files.
2. Open `index.html` in Chrome/Edge/Firefox.
3. *Note: LocalStorage features work, but some browsers restrict clipboard access on local files.*

## 🔗 How to Use Smart Links

To share a direct download link with a friend, simply add the GitHub URL after the hash (`#`):

`https://your-site.github.io/#/github.com/facebook/react/tree/main/packages`

When the user visits this link, the app will:
1. Parse the URL.
2. Auto-fill the input.
3. Immediately start fetching and zipping the folder.

## 🔑 Private Repositories

1. Generate a GitHub Token (Settings > Developer Settings > Personal Access Tokens).
2. Scopes needed: `repo` (for private) or just public access.
3. Open DownGD 2.O > Click Gear Icon (⚙️).
4. Paste token. It is saved in your browser's LocalStorage and never sent to any 3rd party server.

## 🤝 Contributing

Feel free to open issues or submit PRs. The code is written in vanilla JS/CSS for maximum simplicity and performance.
