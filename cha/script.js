const urlInput = document.getElementById("githubUrl");
const tokenInput = document.getElementById("tokenInput");
const zipToggle = document.getElementById("zipToggle");
const preview = document.getElementById("preview");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const themeSelect = document.getElementById("themeSelect");
const accentPicker = document.getElementById("accentPicker");

const THEMES = ["dark", "light", "dracula", "github", "vscode", "ocean"];
THEMES.forEach(t => {
  const o = document.createElement("option");
  o.value = t;
  o.textContent = t;
  themeSelect.appendChild(o);
});

function applyTheme() {
  document.documentElement.dataset.theme = themeSelect.value;
  document.documentElement.style.setProperty("--accent", accentPicker.value);
  localStorage.setItem("theme", themeSelect.value);
  localStorage.setItem("accent", accentPicker.value);
}

themeSelect.onchange = applyTheme;
accentPicker.oninput = applyTheme;

themeSelect.value = localStorage.getItem("theme") || "dark";
accentPicker.value = localStorage.getItem("accent") || "#58a6ff";
applyTheme();

tokenInput.value = localStorage.getItem("token") || "";
tokenInput.oninput = () => localStorage.setItem("token", tokenInput.value);

function parseGitHubUrl(url) {
  const m = url.match(/github\.com\/([^\/]+)\/([^\/]+)(\/(tree|blob)\/([^\/]+)(\/.*)?)?/);
  if (!m) throw "Invalid GitHub URL";
  return {
    owner: m[1],
    repo: m[2],
    branch: m[5] || "main",
    path: m[6]?.replace(/^\/+/, "") || ""
  };
}

async function api(url) {
  const headers = {};
  if (tokenInput.value) headers.Authorization = `token ${tokenInput.value}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw r.status === 404 ? "Repo not found" :
               r.status === 403 ? "Rate limit or private repo" :
               "Network error";
  return r.json();
}

async function fetchRepoTree(info) {
  progressText.textContent = "Fetching repository tree…";
  const tree = await api(`https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${info.branch}?recursive=1`);
  return tree.tree.filter(f => f.path.startsWith(info.path));
}

async function downloadFolderAsZip(files, info) {
  progressText.textContent = "Zipping files…";
  const zip = new JSZip();
  let i = 0;
  for (const f of files) {
    if (f.type !== "blob") continue;
    const raw = await fetch(`https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${f.path}`);
    zip.file(f.path.replace(info.path, ""), await raw.blob());
    progressFill.style.width = (++i / files.length * 100) + "%";
  }
  saveAs(await zip.generateAsync({ type: "blob" }),
    `${info.repo}-${info.path.replace(/\//g, "_")}.zip`);
}

async function downloadFile(info) {
  const url = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${info.path}`;
  saveAs(await fetch(url).then(r => r.blob()), info.path.split("/").pop());
}

document.getElementById("downloadBtn").onclick = async () => {
  try {
    progressFill.style.width = "0%";
    const info = parseGitHubUrl(urlInput.value);
    localStorage.setItem("lastUrl", urlInput.value);

    const files = await fetchRepoTree(info);
    preview.innerHTML = files.map(f => `📄 ${f.path}`).join("<br>");

    if (files.length === 1 && files[0].type === "blob" && !zipToggle.checked) {
      await downloadFile(info);
    } else {
      await downloadFolderAsZip(files, info);
    }

    progressText.textContent = "Done";
  } catch (e) {
    alert(e);
  }
};

urlInput.value = new URLSearchParams(location.search).get("url")
  || localStorage.getItem("lastUrl") || "";

document.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("downloadBtn").click();
});
