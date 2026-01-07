const API_BASE = "https://api.github.com/repos";
const RAW_BASE = "https://raw.githubusercontent.com";

const config = {
    token: localStorage.getItem("gh_token") || "",
    controller: new AbortController()
};

const ui = {
    card: document.getElementById("card"),
    title: document.getElementById("status-title"),
    text: document.getElementById("status-text"),
    progressContainer: document.getElementById("progress-container"),
    bar: document.getElementById("bar")
};

(function init() {
    const params = new URLSearchParams(window.location.search);
    
    let url = params.get("url") || params.get(""); 
    const customName = params.get("name");
    
    // --- NEW: Parse Limit Parameters ---
    // We use undefined if not present, so we can handle defaults later
    const startLimit = params.has("st") ? parseInt(params.get("st")) : null;
    const maxLimit = params.has("mx") ? parseInt(params.get("mx")) : null;

    if (!url) {
        const search = window.location.search.substring(1); 
        // Logic to extract URL if it's the first param without a key
        // Note: This might need adjustment if params like &st= are first, 
        // but assuming url is usually first or named "url="
        if(search.startsWith("=")) url = search.substring(1);
        else if(!search.includes("url=") && search.includes("&")) {
             // Handle case: ?github.com/user/repo&st=50
             url = search.split("&")[0];
        }
    }

    if (!url) return setError("Missing URL", "Please provide a GitHub link.");

    url = decodeURIComponent(url);
    if (!url.startsWith("http")) {
        if(url.startsWith("github.com")) url = "https://" + url;
        else url = "https://github.com/" + url;
    }

    // Pass limits to startDownload
    startDownload(url, customName, startLimit, maxLimit);
})();

async function startDownload(url, saveName, startLimit, maxLimit) {
    try {
        const parsed = parseGitHubUrl(url);
        if (!parsed) throw new Error("Invalid GitHub URL");

        ui.title.innerText = "Resolving...";
        ui.text.innerText = "Checking repository details";

        if (parsed.type === "root") {
            const r = await fetchAPI(`/${parsed.user}/${parsed.repo}`);
            parsed.branch = r.default_branch;
        }

        if (parsed.type === "blob") {
            await processSingleFile(parsed, saveName);
        } else {
            // Pass limits to processFolder
            await processFolder(parsed, saveName, startLimit, maxLimit);
        }

        handleSuccess();

    } catch (err) {
        setError("Error", err.message);
    }
}

function handleSuccess() {
    ui.card.classList.add("state-success");
    ui.title.innerText = "Downloaded";
    ui.bar.style.width = "100%";
    
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get("return");

    setTimeout(() => {
        if (returnUrl && returnUrl.startsWith("http")) {
            ui.text.innerText = "Returning...";
            window.location.href = returnUrl;
        } 
        else if (window.history.length > 1 && document.referrer) {
            ui.text.innerText = "Returning to page...";
            window.history.back();
        } 
        else {
            ui.text.innerText = "Closing tab...";
            window.close();
            try { window.opener = null; window.open("", "_self"); window.close(); } catch (e) {}

            setTimeout(() => {
                if (!window.closed) {
                    ui.text.innerText = "Download complete. You can close this tab.";
                    if (document.referrer) {
                        ui.text.innerText = "Returning...";
                        window.location.href = document.referrer;
                    }
                }
            }, 500);
        }
    }, 1500);
}

async function processFolder(parsed, customName, startOpt, maxOpt) {
    ui.title.innerText = "Fetching files...";
    const data = await fetchAPI(`/${parsed.user}/${parsed.repo}/git/trees/${parsed.branch}?recursive=1`);
    const targetPath = parsed.path ? parsed.path + "/" : "";
    
    // Get ALL valid blobs first
    const allFiles = data.tree.filter(f => f.type === "blob" && (parsed.path === "" || f.path.startsWith(targetPath)));

    if (!allFiles.length) throw new Error("Folder is empty");

    // --- NEW: Slicing Logic ---
    let start = startOpt !== null ? startOpt : 0;
    let end = maxOpt !== null ? maxOpt : allFiles.length;

    // Validation to prevent crashes
    if (start < 0) start = 0;
    if (end > allFiles.length) end = allFiles.length;
    if (start >= end) {
        // Fallback: if user sets Start > End, just download everything or reset Start
        start = 0; 
        end = allFiles.length;
    }

    // Slice the files array
    const filesToDownload = allFiles.slice(start, end);
    const totalToDownload = filesToDownload.length;

    if (totalToDownload === 0) throw new Error("No files in selected range");

    ui.title.innerText = `Downloading (${start}-${end})...`;
    ui.text.innerText = `Preparing ${totalToDownload} files...`;
    // --------------------------

    const zip = new JSZip();
    let count = 0;
    const CHUNK = 5;

    for (let i = 0; i < totalToDownload; i += CHUNK) {
        await Promise.all(filesToDownload.slice(i, i + CHUNK).map(async f => {
            try {
                const content = await fetchContent(parsed, f);
                const zipPath = parsed.path ? f.path.substring(parsed.path.length + 1) : f.path;
                zip.file(zipPath, content);
                count++;
                updateProgress(count, totalToDownload);
            } catch (e) {}
        }));
    }

    ui.title.innerText = "Zipping...";
    const content = await zip.generateAsync({type:"blob"});
    
    let fileName = customName || (parsed.path.split("/").pop() || parsed.repo);
    if (!fileName.toLowerCase().endsWith(".zip")) fileName += ".zip";
    saveAs(content, fileName);
}

async function processSingleFile(parsed, customName) {
    ui.title.innerText = "Downloading file...";
    ui.bar.style.width = "50%";
    const content = await fetchContent(parsed, { path: parsed.path });
    
    let fileName = customName || parsed.path.split("/").pop();
    if (customName && !fileName.includes(".")) {
        const ext = parsed.path.split("/").pop().split(".").pop();
        if(ext) fileName += "." + ext;
    }
    saveAs(new Blob([content]), fileName);
}

async function fetchAPI(endpoint) {
    const headers = config.token ? { "Authorization": `token ${config.token}` } : {};
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) throw new Error((await res.json()).message || "Repo not found");
    return res.json();
}

async function fetchContent(parsed, fileObj) {
    if (config.token) {
        const res = await fetchAPI(`/${parsed.user}/${parsed.repo}/contents/${fileObj.path}?ref=${parsed.branch}`);
        return base64ToBlob(res.content);
    } else {
        const res = await fetch(`${RAW_BASE}/${parsed.user}/${parsed.repo}/${parsed.branch}/${fileObj.path}`);
        if (!res.ok) throw new Error("Network Error");
        return res.blob();
    }
}

function parseGitHubUrl(url) {
    try {
        const u = new URL(url);
        if (u.hostname !== "github.com") return null;
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length < 2) return null;
        return { user: parts[0], repo: parts[1], type: parts[2] || "root", branch: parts[3] || "main", path: parts.slice(4).join("/") };
    } catch { return null; }
}

function base64ToBlob(b64) {
    const bin = atob(b64.replace(/\n/g, ''));
    const arr = new Uint8Array(bin.length);
    for (let i=0; i<bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr]);
}

function updateProgress(curr, total) {
    const pct = (curr / total) * 100;
    ui.bar.style.width = `${pct}%`;
    ui.text.innerText = `${curr} / ${total}`;
}

function setError(title, msg) {
    ui.card.classList.add("state-error");
    ui.title.innerText = title;
    ui.text.innerText = msg;
    ui.progressContainer.style.display = "none";
}