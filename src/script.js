const API_BASE = "https://api.github.com/repos",
  RAW_BASE = "https://raw.githubusercontent.com",
  THEME_DEFAULTS = {
    light: "#2563eb",
    dark: "#2563eb",
    amoled: "#ffffff",
    dracula: "#bd93f9",
    cyberpunk: "#00f3ff",
    forest: "#4ade80",
    sunset: "#f15f79",
    monokai: "#a6e22e",
  },
  state = {
    token: localStorage.getItem("gh_token") || "",
    theme: localStorage.getItem("theme") || "forest",
    accentColor: localStorage.getItem("accent") || "#4ade80",
    forceZip: "true" === localStorage.getItem("force_zip"),
    isDownloading: !1,
    controller: null,
  },
  dom = {
    input: document.getElementById("repo-url"),
    filenameInput: document.getElementById("custom-filename"),
    // --- NEW: Limit Inputs ---
    startInput: document.getElementById("start-limit"),
    maxInput: document.getElementById("max-limit"),
    // -------------------------
    downloadBtn: document.getElementById("download-btn"),
    shareBtn: document.getElementById("share-btn"),
    pasteBtn: document.getElementById("paste-btn"),
    statusCard: document.getElementById("status-card"),
    statusTitle: document.getElementById("status-title"),
    statusText: document.getElementById("status-text"),
    progressBar: document.getElementById("progress-bar"),
    fileCount: document.getElementById("file-count"),
    previewList: document.getElementById("file-preview"),
    settingsBtn: document.getElementById("settings-btn"),
    settingsModal: document.getElementById("settings-modal"),
    closeModalBtns: document.querySelectorAll(".close-modal"),
    tokenInput: document.getElementById("github-token"),
    themeSelect: document.getElementById("theme-select"),
    accentInput: document.getElementById("accent-color"),
    forceZipInput: document.getElementById("force-zip"),
    themeBtn: document.getElementById("theme-btn"),
  };

function init() {
  (dom.tokenInput.value = state.token),
    (dom.forceZipInput.checked = state.forceZip),
    dom.themeSelect && (dom.themeSelect.value = state.theme),
    applyThemeClass(state.theme),
    applyAccentColor(state.accentColor),
    setupEventListeners(),
    checkUrlForRepo();
}

function setupEventListeners() {
  let t;
  dom.downloadBtn.addEventListener("click", () => {
    updateUrlParam(), startProcess();
  }),
    dom.input.addEventListener("keypress", (t) => {
      "Enter" === t.key && (updateUrlParam(), startProcess());
    }),
    dom.input.addEventListener("input", () => {
      clearTimeout(t), (t = setTimeout(updateUrlParam, 800));
    }),
    // Update URL when limits change
    dom.startInput.addEventListener("input", updateUrlParam),
    dom.maxInput.addEventListener("input", updateUrlParam),
    
    dom.pasteBtn.addEventListener("click", async () => {
      try {
        const t = await navigator.clipboard.readText();
        (dom.input.value = t), updateUrlParam(), startProcess();
      } catch (t) {
        showToast("Clipboard denied", "error");
      }
    }),
    dom.shareBtn.addEventListener("click", () => {
      updateUrlParam(),
        navigator.clipboard.writeText(window.location.href),
        showToast("Link copied!", "success");
    }),
    dom.settingsBtn.addEventListener("click", () =>
      dom.settingsModal.classList.remove("hidden")
    ),
    dom.closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dom.settingsModal.classList.add("hidden");
      });
    });

  dom.settingsModal.addEventListener("click", (t) => {
    t.target === dom.settingsModal && dom.settingsModal.classList.add("hidden");
  }),
    document.addEventListener("keydown", (t) => {
      "Escape" === t.key && dom.settingsModal.classList.add("hidden");
    }),
    dom.themeSelect.addEventListener("change", (t) => {
      changeTheme(t.target.value);
    }),
    dom.themeBtn.addEventListener("click", () => {
      const t = Object.keys(THEME_DEFAULTS),
        e = (t.indexOf(state.theme) + 1) % t.length;
      changeTheme(t[e]);
    }),
    dom.accentInput.addEventListener("input", (t) => {
      (state.accentColor = t.target.value),
        applyAccentColor(state.accentColor),
        localStorage.setItem("accent", state.accentColor);
    });
}

function changeTheme(t) {
  (state.theme = t), (dom.themeSelect.value = t), applyThemeClass(t);
  const e = THEME_DEFAULTS[t];
  (state.accentColor = e),
    applyAccentColor(e),
    localStorage.setItem("theme", state.theme),
    localStorage.setItem("accent", state.accentColor);
}

function applyThemeClass(t) {
  (document.body.className = ""),
    "light" !== t && document.body.classList.add(`theme-${t}`);
}

function applyAccentColor(t) {
  document.documentElement.style.setProperty("--primary-color", t),
    (dom.accentInput.value = t);
}

function saveSettings() {
  (state.token = dom.tokenInput.value.trim()),
    (state.forceZip = dom.forceZipInput.checked),
    localStorage.setItem("gh_token", state.token),
    localStorage.setItem("force_zip", state.forceZip),
    showToast("Settings Saved", "success");
}

function checkUrlForRepo() {
  const query = window.location.search;
  if (query.length > 1) {
    let urlPart = query.substring(1);
    
    // --- NEW: Parse Parameters (&st=, &mx=) ---
    const params = new URLSearchParams(query);
    const st = params.get("st");
    const mx = params.get("mx");
    
    if (st) dom.startInput.value = st;
    if (mx) dom.maxInput.value = mx;
    
    // Clean the URL part (remove params to find the repo link)
    if (urlPart.startsWith("=")) urlPart = urlPart.substring(1);
    
    // Handle legacy ?=url format vs new params
    // If the string contains &, split it
    let repoUrl = urlPart.split("&")[0];
    
    if(repoUrl.startsWith("url=")) repoUrl = repoUrl.substring(4);
    
    repoUrl = decodeURIComponent(repoUrl);
    
    if (repoUrl && (repoUrl.includes("github.com") || repoUrl.match(/^[\w-]+\/[\w-]+/))) {
      if (repoUrl.startsWith("http") || repoUrl.startsWith("github.com")) {
        repoUrl.startsWith("github.com") && (repoUrl = "https://" + repoUrl);
      } else {
        repoUrl = "https://github.com/" + repoUrl;
      }
      dom.input.value = repoUrl;
      setTimeout(() => startProcess(), 500);
    }
  }
}

function updateUrlParam() {
  const t = dom.input.value.trim();
  if (!t)
    return void history.replaceState(null, null, window.location.pathname);
    
  // --- NEW: Add parameters to URL ---
  let params = `?=${t}`;
  const start = dom.startInput.value.trim();
  const end = dom.maxInput.value.trim();
  
  if (start) params += `&st=${start}`;
  if (end) params += `&mx=${end}`;
  
  const e = window.location.pathname + params;
  history.replaceState(null, null, e);
}

function parseGitHubUrl(t) {
  try {
    t.startsWith("http") || (t = "https://" + t);
    const e = new URL(t);
    if ("github.com" !== e.hostname) return null;
    const n = e.pathname.split("/").filter(Boolean);
    return n.length < 2
      ? null
      : {
          user: n[0],
          repo: n[1],
          type: n[2] || "root",
          branch: n[3] || "main",
          path: n.slice(4).join("/"),
        };
  } catch {
    return null;
  }
}

async function startProcess() {
  if (state.isDownloading) return;
  const t = parseGitHubUrl(dom.input.value);
  if (!t) return showToast("Invalid GitHub URL", "error");
  (state.isDownloading = !0),
    (state.controller = new AbortController()),
    (dom.downloadBtn.disabled = !0),
    dom.statusCard.classList.remove("hidden"),
    (dom.previewList.innerHTML = ""),
    updateStatus("Fetching info...", 10);
  try {
    if ("root" === t.type) {
      const e = await fetchAPI(`/${t.user}/${t.repo}`);
      t.branch = e.default_branch;
    }
    "blob" === t.type ? await downloadSingleFile(t) : await downloadFolder(t),
      updateStatus("Complete!", 100),
      showToast("Download Finished", "success");
  } catch (t) {
    showToast(t.message, "error"),
      (dom.statusText.textContent = t.message),
      (dom.progressBar.style.backgroundColor = "#ef4444");
  } finally {
    (state.isDownloading = !1), (dom.downloadBtn.disabled = !1);
  }
}

async function downloadFolder(t) {
  updateStatus("Fetching File Tree...");
  const e = `/${t.user}/${t.repo}/git/trees/${t.branch}?recursive=1`,
    n = await fetchAPI(e),
    o = t.path ? t.path + "/" : "",
    // Get all blobs first
    allBlobs = n.tree.filter(
      (e) => "blob" === e.type && ("" === t.path || e.path.startsWith(o))
    );

  if (0 === allBlobs.length) throw new Error("No files found.");

  // --- NEW: Apply Limit Logic ---
  let startIndex = parseInt(dom.startInput.value) || 0;
  let endIndex = parseInt(dom.maxInput.value) || allBlobs.length;

  // Validation
  if(startIndex < 0) startIndex = 0;
  if(endIndex > allBlobs.length) endIndex = allBlobs.length;
  if(startIndex >= endIndex) {
      // Fallback if user messed up inputs
      startIndex = 0;
      endIndex = allBlobs.length;
  }

  // Slice the array based on limits
  const a = allBlobs.slice(startIndex, endIndex);
  
  // Update UI text
  dom.fileCount.textContent = `Downloading ${a.length} files (${startIndex}-${endIndex} of ${allBlobs.length})`;
  renderPreview(a);
  // ------------------------------

  const s = new JSZip();
  let r = 0;
  for (let e = 0; e < a.length; e += 5)
    await Promise.all(
      a.slice(e, e + 5).map(async (e) => {
        try {
          const n = await fetchContent(t, e),
            o = t.path ? e.path.substring(t.path.length + 1) : e.path;
          s.file(o, n),
            r++,
            updateStatus(`Downloading ${r}/${a.length}`, (r / a.length) * 90);
        } catch (t) {}
      })
    );
  updateStatus("Zipping...", 95);
  const i = await s.generateAsync({ type: "blob" });
  let l = dom.filenameInput.value.trim() || t.path.split("/").pop() || t.repo;
  l.toLowerCase().endsWith(".zip") || (l += ".zip"), saveAs(i, l);
}

async function downloadSingleFile(t) {
  const e = t.path.split("/").pop(),
    n = await fetchContent(t, { path: t.path });
  let o = dom.filenameInput.value.trim() || e;
  if (dom.filenameInput.value.trim() && !o.includes(".")) {
    const t = e.split(".").pop();
    t && t !== e && (o += "." + t);
  }
  if (state.forceZip) {
    const t = new JSZip();
    t.file(o, n);
    let e = o.endsWith(".zip") ? o : o + ".zip";
    saveAs(await t.generateAsync({ type: "blob" }), e);
  } else saveAs(new Blob([n]), o);
}

async function fetchAPI(t) {
  const e = state.token ? { Authorization: `token ${state.token}` } : {},
    n = await fetch(`${API_BASE}${t}`, {
      headers: e,
      signal: state.controller.signal,
    });
  if (!n.ok) throw new Error((await n.json()).message || "API Error");
  return n.json();
}

async function fetchContent(t, e) {
  if (state.token) {
    return base64ToBlob(
      (
        await fetchAPI(
          `/${t.user}/${t.repo}/contents/${e.path}?ref=${t.branch}`
        )
      ).content
    );
  }
  {
    const n = await fetch(
      `${RAW_BASE}/${t.user}/${t.repo}/${t.branch}/${e.path}`
    );
    if (!n.ok) throw new Error("Network error");
    return n.blob();
  }
}

function base64ToBlob(t) {
  const e = atob(t.replace(/\n/g, "")),
    n = new Uint8Array(e.length);
  for (let t = 0; t < e.length; t++) n[t] = e.charCodeAt(t);
  return new Blob([n]);
}

function updateStatus(t, e) {
  (dom.statusText.textContent = t),
    e && (dom.progressBar.style.width = `${e}%`);
}

function renderPreview(t) {
  dom.previewList.innerHTML = t
    .slice(0, 50)
    .map(
      (t) =>
        `<div class="file-item"><i class="ri-file-code-line"></i> ${t.path
          .split("/")
          .pop()}</div>`
    )
    .join("");
}

function showToast(t, e) {
  const n = document.createElement("div");
  (n.className = `toast ${e}`),
    (n.innerHTML = `<i class="ri-${
      "success" === e ? "check" : "error-warning"
    }-fill"></i> ${t}`),
    document.getElementById("toast-container").appendChild(n),
    setTimeout(() => n.remove(), 3e3);
}

init();