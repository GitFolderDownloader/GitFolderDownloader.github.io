// ==UserScript==
// @name         DownGD Download Button
// @namespace    https://downgd.github.io/
// @version      1.0.0
// @description  Add smart download buttons to GitHub repo, folder, and file menus using DownGD API
// @author       DownGD
// @match        https://github.com/*
// @icon         https://downgd.github.io/src/icon.svg
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
  const n = "downgd-modal";

  function e(e) {
    const linkPadding = e === "repo" ? "revert-layer" : "0";

    const o = (() => {
      const n = location.pathname.split("/").filter(Boolean);
      return n.length === 2
        ? { type: "repo", name: `${n[0]}-${n[1]}` }
        : n.includes("tree")
        ? { type: "folder", name: n[n.length - 1] }
        : n.includes("blob")
        ? { type: "file", name: n[n.length - 1] }
        : { type: "unknown", name: "github-download" };
    })();

    const t = document.createElement("li");
    t.className = "prc-ActionList-ActionListItem-So4vC";

    t.innerHTML = `
      <a class="prc-ActionList-ActionListContent-KBb8- prc-Link-Link-9ZwDx"
         role="menuitem"
         tabindex="-1"
         data-downgd="${e}"
         style="padding:${linkPadding};">

        <span class="prc-ActionList-Spacer-4tR2m"></span>

        <span class="prc-ActionList-LeadingVisual-NBr28 prc-ActionList-VisualWrap-bdCsS">
          ${
            e === "repo"
              ? `<svg aria-hidden="true" focusable="false" class="octicon octicon-download"
                  viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path>
                  <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path>
                </svg>`
              : ""
          }
        </span>

        <span class="prc-ActionList-ActionListSubContent-gKsFp">
          <span class="prc-ActionList-ItemLabel-81ohH">
            ${
              e === "repo"
                ? "Download Repo"
                : e === "folder"
                ? "Download Folder"
                : "Download"
            }
          </span>
        </span>
      </a>
    `;

    t.onclick = () => {
      if (document.getElementById(n)) return;

      const m = document.createElement("div");
      m.id = n;
      m.innerHTML = `
        <style>
          #${n}{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center}
          .modal-overlay{position:fixed;inset:0}
          .dg-box{
            background:var(--color-canvas-overlay);
            color:var(--color-fg-default);
            width:340px;padding:16px;
            border-radius:12px;border:1px solid var(--color-border-default);
            box-shadow:var(--shadow-floating-small);
            font-family:system-ui
          }
          .dg-box h3{text-align:center;font-size:18px;margin-bottom:8px}
          .dg-box input{
            width:100%;padding:8px;border-radius:8px;
            border:1px solid var(--color-border-default);
            background:var(--color-canvas-inset)
          }
          .dg-actions{margin-top:16px;display:flex;justify-content:space-around}
          .dg-actions button{padding:6px 14px;border-radius:6px;border:none;cursor:pointer}
          .dg-cancel{background:var(--color-btn-bg)}
          .dg-confirm{background:var(--color-btn-primary-bg);color:var(--color-btn-primary-text)}
        </style>

        <div class="modal-overlay"></div>
        <div class="dg-box">
          <h3>Custom download name</h3>
          <input id="dg-name" value="${o.name}">
          <div class="dg-actions">
            <button class="dg-cancel">Cancel</button>
            <button class="dg-confirm">Download</button>
          </div>
        </div>
      `;

      document.body.appendChild(m);

      m.querySelector(".modal-overlay").onclick =
      m.querySelector(".dg-cancel").onclick = () => m.remove();

      m.querySelector(".dg-confirm").onclick = () => {
        const v = m.querySelector("#dg-name").value.trim() || o.name;
        m.remove();
        window.open(
          `https://downgd.github.io/api/?url=${encodeURIComponent(location.href)}&name=${encodeURIComponent(v)}`,
          "_blank"
        );
      };

      document.addEventListener("keydown", ev => {
        if (ev.key === "Escape") m.remove();
      }, { once: true });
    };

    return t;
  }

  function o() {
    document.querySelectorAll("ul.prc-ActionList-ActionList-rPFF2").forEach(n => {
      const t = n.innerText;
      const r =
        t.includes("Download ZIP") ? "repo" :
        t.includes("Copy path") && !t.includes("Raw file") ? "folder" :
        t.includes("Raw file content") ? "file" : null;

      r && !n.querySelector(`[data-downgd="${r}"]`) &&
        n.insertBefore(e(r), n.firstElementChild);
    });
  }

  new MutationObserver(o).observe(document.body, { childList: true, subtree: true });
  o();
})();
