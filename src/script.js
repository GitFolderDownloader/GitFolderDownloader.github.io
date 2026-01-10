const API_BASE = "https://api.github.com/repos",
  RAW_BASE = "https://raw.githubusercontent.com",
  THEME_DEFAULTS = {
    light: "#923d3dff",
    dark: "#b46363ff",
    amoled: "#81308bff",
    dracula: "#bd93f9ff",
    cyberpunk: "#00f3ff",
    forest: "#4ade80ff",
    sunset: "#f15f79ff",
    monokai: "#a6e22eff",
  },
  state = {
    token: localStorage.getItem("gh_token") || "",
    theme: localStorage.getItem("theme") || "forest",
    accentColor: localStorage.getItem("accent") || "#4ade80",
    accentIsCustom: false,
    forceZip: "true" === localStorage.getItem("force_zip"),
    isDownloading: !1,
    controller: null,
  },
  dom = {
    input: document.getElementById("repo-url"),
    filenameInput: document.getElementById("custom-filename"),
    startInput: document.getElementById("start-limit"),
    maxInput: document.getElementById("max-limit"),
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
dom.inputsStartMax = [dom.startInput, dom.maxInput];

function init() {
  (dom.tokenInput.value = state.token),
    (dom.forceZipInput.checked = state.forceZip),
    dom.themeSelect && (dom.themeSelect.value = state.theme),
    applyThemeClass(state.theme),
    state.accentIsCustom =
    localStorage.getItem("accent_custom") !== null
      ? localStorage.getItem("accent_custom") === "true"
      : state.accentColor !== THEME_DEFAULTS[state.theme];
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
    dom.startInput.addEventListener("input", updateUrlParam),
    dom.maxInput.addEventListener("input", updateUrlParam),
    dom.filenameInput.addEventListener("input", updateUrlParam),

    dom.inputsStartMax.forEach(input => {
      input.addEventListener("wheel", e => {
        e.preventDefault();     
        input.focus();         
        const step = Number(input.step) || 1;
        const min = input.min !== "" ? Number(input.min) : -Infinity;
        const max = input.max !== "" ? Number(input.max) : Infinity;

        let value = Number(input.value) || 0;
        value += e.deltaY < 0 ? step : -step;

        input.value = Math.min(max, Math.max(min, value));
        updateUrlParam();     
      });
    });

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
dom.forceZipInput.addEventListener("change", () => {
  state.forceZip = dom.forceZipInput.checked;
  localStorage.setItem("force_zip", state.forceZip);
});

    dom.themeBtn.addEventListener("click", () => {
      const t = Object.keys(THEME_DEFAULTS),
        e = (t.indexOf(state.theme) + 1) % t.length;
      changeTheme(t[e]);
    }),
    dom.accentInput.addEventListener("input", (t) => {
      (state.accentColor = t.target.value),
      state.accentIsCustom = true;
        applyAccentColor(state.accentColor),
        localStorage.setItem("accent", state.accentColor);
    });
}


function changeTheme(t) {
  state.theme = t;
  dom.themeSelect.value = t;
  applyThemeClass(t);

  const themeDefault = THEME_DEFAULTS[t];
  state.accentColor = themeDefault;
  applyAccentColor(themeDefault);
  state.accentIsCustom = false;
  localStorage.setItem("theme", state.theme);
  localStorage.setItem("accent", state.accentColor);
  localStorage.setItem("accent_custom", "false");
}

function applyThemeClass(t) {
  (document.body.className = ""),
    "light" !== t && document.body.classList.add(`theme-${t}`);
}





function applyAccentColor(t) {
  let inputColor = t.length === 9 ? t.slice(0, 7) : t;

  document.documentElement.style.setProperty("--accent", t, "important");
  document.body.style.setProperty("--accent", t, "important");

  dom.accentInput.value = inputColor;
}


function resetAccentToThemeDefault() {
  const themeDefault = THEME_DEFAULTS[state.theme];
  state.accentIsCustom = false;
  state.accentColor = themeDefault;
  applyAccentColor(themeDefault);

  localStorage.setItem("accent", state.accentColor);
  localStorage.setItem("accent_custom", "false");
}

const resetAccentBtn = document.getElementById("reset-accent-btn");
resetAccentBtn.addEventListener("click", resetAccentToThemeDefault);

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

    const params = new URLSearchParams(query);
    const st = params.get("st");
    const mx = params.get("mx");
    const nm = params.get("name");

    if (st) dom.startInput.value = st;
    if (mx) dom.maxInput.value = mx;
    if (nm) dom.filenameInput.value = nm;

    if (urlPart.startsWith("=")) urlPart = urlPart.substring(1);

    let repoUrl = urlPart.split("&")[0];

    if (repoUrl.startsWith("url=")) repoUrl = repoUrl.substring(4);

    repoUrl = decodeURIComponent(repoUrl);

    if (
      repoUrl &&
      (repoUrl.includes("github.com") || repoUrl.match(/^[\w-]+\/[\w-]+/))
    ) {
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

  let params = `?=${t}`;
  const start = dom.startInput.value.trim();
  const end = dom.maxInput.value.trim();
  const filename = dom.filenameInput.value.trim();

  if (start) params += `&st=${start}`;
  if (end) params += `&mx=${end}`;
  if (filename) params += `&name=${encodeURIComponent(filename)}`;

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
    allBlobs = n.tree.filter(
      (e) => "blob" === e.type && ("" === t.path || e.path.startsWith(o))
    );

  if (0 === allBlobs.length) throw new Error("No files found.");

  let startIndex = parseInt(dom.startInput.value) || 0;
  let endIndex = parseInt(dom.maxInput.value) || allBlobs.length;

  if (startIndex < 0) startIndex = 0;
  if (endIndex > allBlobs.length) endIndex = allBlobs.length;
  if (startIndex >= endIndex) {
    startIndex = 0;
    endIndex = allBlobs.length;
  }

  const a = allBlobs.slice(startIndex, endIndex);

  dom.fileCount.textContent = `Downloading ${a.length} files (${startIndex}-${endIndex} of ${allBlobs.length})`;
  renderPreview(a);

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
        } catch (t) { }
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
    (n.innerHTML = `<i class="ri-${"success" === e ? "check" : "error-warning"
      }-fill"></i> ${t}`),
    document.getElementById("toast-container").appendChild(n),
    setTimeout(() => n.remove(), 3e3);
}

init();
