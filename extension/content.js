(() => {
  const MODAL_ID = "GitFolderDownloader-modal";

  let __dg_prevOverflow = null;

  function lockBodyScroll() {
    __dg_prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function unlockBodyScroll() {
    document.body.style.overflow = __dg_prevOverflow || "";
  }

  function createMenuItem(kind) {
    const linkPadding = kind === "repo" ? "revert-layer" : "0";

    const ctx = (function () {
      const parts = location.pathname.split("/").filter(Boolean);
      return 2 === parts.length
        ? { type: "repo", name: `${parts[0]}-${parts[1]}` }
        : parts.includes("tree")
          ? { type: "folder", name: parts[parts.length - 1] }
          : parts.includes("blob")
            ? { type: "file", name: parts[parts.length - 1] }
            : { type: "unknown", name: "github-download" };
    })();

    const li = document.createElement("li");
    li.className = "prc-ActionList-ActionListItem-So4vC";
    li.innerHTML = `<a class="prc-ActionList-ActionListContent-KBb8- prc-Link-Link-9ZwDx" role="menuitem" tabindex="-1" data-GitFolderDownloader="${kind}" style="padding:${linkPadding};">
        <span class="prc-ActionList-Spacer-4tR2m"></span>
        <span class="prc-ActionList-LeadingVisual-NBr28 prc-ActionList-VisualWrap-bdCsS">
        ${kind === "repo"
        ? '<svg aria-hidden="true" focusable="false" class="octicon octicon-download" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path></svg>'
        : '<svg style="width: 0;height: 0;"></svg>'
      }
        </span>
        <span class="prc-ActionList-ActionListSubContent-gKsFp" data-component="ActionList.Item--DividerContainer">
        <span class="prc-ActionList-ItemLabel-81ohH">
        ${kind === "repo"
        ? "Download Repo"
        : kind === "folder"
          ? "Download Folder"
          : "Download"
      }
        </span></span></a>`;

    const anchor = li.querySelector("a");
    anchor.addEventListener("pointerdown", (evt) => {
      if (evt.button !== 0) return;

      evt.preventDefault();
      evt.stopPropagation();
      showModalAndOpen(ctx.name, ctx.type);
    });


    return li;
  }

  function showModalAndOpen(defaultName, type = "repo") {
    if (document.getElementById(MODAL_ID)) return;

    const t = document.createElement("div");
    t.id = MODAL_ID;
    t.innerHTML = `
      <style>  
      #${MODAL_ID} {position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;}
      .modal-overlay {display: block; position: fixed; width: -webkit-fill-available; height: -webkit-fill-available;}  
      .dg-box {
        background:var(--overlay-bgColor,var(--color-canvas-overlay));
        color: var(--fgColor-default);
        width: 340px; padding: 16px;
        border-radius: 12px; border: 1px solid var(--color-border-default);
        box-shadow:var(--shadow-floating-small,var(--color-overlay-shadow));
        font-family: system-ui;
        animation:prc-Overlay-overlay-appear-JpFey .2s cubic-bezier(.33,1,.68,1); z-index:10001;  
      }
      .dg-box h3 {
        text-align: center; background-color: initial;
        color: var(--fgColor-default,var(--color-fg-default));
        font-size: 18px; font-weight: 700; margin: 0 auto 10px;
      }
      .dg-label {
        font-size: 12px; font-weight: 600; margin-top: 8px; display: block;
        color: var(--fgColor-default, var(--color-fg-default));
      }
      .dg-box input {
        width: 100%; padding: 8px; margin-top: 4px;
        border-radius: 8px; background: var(--bgColor-disabled);
        border: 1px solid var(--control-borderColor-rest, var(--color-border-default));
        outline: none; color: var(--fgColor-default, var(--color-fg-default));
      }
      .dg-box input:focus { outline: 2px solid var(--color-accent-fg); }
      .dg-row { display: flex; gap: 10px; }
      .dg-col { flex: 1; }
      .dg-actions {
        margin-top: 20px; font-weight: 800; display: flex; justify-content: space-around;
      }
      .dg-actions button {
        padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px;
      }
      .dg-cancel { background: var(--button-default-bgColor-rest); }
      .dg-cancel:hover { background: var(--button-default-bgColor-hover); }
      .dg-confirm {
       background: var(--button-primary-bgColor-rest);
       color:var(--button-primary-fgColor-rest,var(--color-btn-primary-text));
      }
      .dg-confirm:hover { background: var(--button-primary-bgColor-hover); }
      </style>
      <div class="modal-overlay"></div>
      <div class="dg-box">
      <h3>Download Options</h3>
      <label class="dg-label">Set Name</label>
      <input id="dg-name" value="${defaultName}" placeholder="File name"/>


      ${type !== "file"
        ? `
      <h5 style="margin: 10px auto 0;">Set files range</h5>
      <div class="dg-row">
        <div class="dg-col">
            <label class="dg-label">From</label>
            <input id="dg-st" min="0" type="number" placeholder="from 0" />
        </div>
        <div class="dg-col">
            <label class="dg-label">To</label>
            <input id="dg-mx" min="0" type="number" placeholder="to all" />
        </div>
      </div>
      `
        : ""
      }

  <div class="dg-actions">
    <button class="dg-cancel">Cancel</button>
    <button class="dg-confirm">Download</button>
  </div>
</div>

    `;

    document.body.appendChild(t);
    lockBodyScroll();

    //const removeModal = () => t.remove();
    const removeModal = () => {
      unlockBodyScroll();
      t.remove();
    };


    t.querySelector(".modal-overlay").addEventListener("click", removeModal);
    t.querySelector(".dg-cancel").addEventListener("click", removeModal);
    t.querySelector(".dg-confirm").addEventListener("click", () => {
      const nameVal = t.querySelector("#dg-name").value.trim() || defaultName;
      const stVal = type !== "file" ? t.querySelector("#dg-st")?.value.trim() : "";
      const mxVal = type !== "file" ? t.querySelector("#dg-mx")?.value.trim() : "";

      removeModal();

      let finalUrl = `https://GitFolderDownloader.github.io/api/?url=${encodeURIComponent(location.href)}&name=${encodeURIComponent(nameVal)}`;
      if (stVal) finalUrl += `&st=${encodeURIComponent(stVal)}`;
      if (mxVal) finalUrl += `&mx=${encodeURIComponent(mxVal)}`;
      window.open(finalUrl, "_blank");
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") removeModal();
    }, { once: true });
  }

  function injectButtonsIntoMenus() {
    document.querySelectorAll("ul.prc-ActionList-ActionList-rPFF2").forEach((menu) => {
      const kind = (function (menuEl) {
        const text = menuEl.innerText;
        return text.includes("Download ZIP")
          ? "repo"
          : text.includes("Copy path") && !text.includes("Raw file")
            ? "folder"
            : text.includes("Raw file content")
              ? "file"
              : null;
      })(menu);

      if (!kind) return;

      if (menu.querySelector(`[data-GitFolderDownloader="${kind}"]`)) return;

      const item = createMenuItem(kind);
      menu.insertBefore(item, menu.firstElementChild);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d")) return;
    if (/input|textarea/i.test(document.activeElement?.tagName)) return;

    const path = location.pathname.split("/").filter(Boolean);

    const isFolder = path.includes("tree");
    const isFile = path.includes("blob");

    if (!isFolder && !isFile) return;

    e.preventDefault();
    e.stopPropagation();

    const name = path[path.length - 1];
    showModalAndOpen(name, isFile ? "file" : "folder");
  });

  new MutationObserver(injectButtonsIntoMenus).observe(document.body, {
    childList: true,
    subtree: true,
  });
  injectButtonsIntoMenus();
})();
