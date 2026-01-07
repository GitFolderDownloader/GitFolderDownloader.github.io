// ==UserScript==
// @name         DownGD Download Button
// @namespace    https://downgd.github.io/wiki/
// @version      1.1.0
// @description  Add smart download buttons to GitHub repo, folder, and file menus using DownGD API with optional range parameters
// @author       DownGD
// @match        https://github.com/*
// @icon         https://downgd.github.io/src/icon.svg
// @updateURL    https://downgd.github.io/script/downgd-download-button-user.js
// @downloadURL  https://downgd.github.io/script/downgd-download-button-user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
   
    (() => {
  const n = "downgd-modal";

  function e(e) {
    const linkPadding = e === "repo" ? "revert-layer" : "0";
    
    // Determine context (Repo, Folder, or File)
    const o = (function () {
        const n = location.pathname.split("/").filter(Boolean);
        return 2 === n.length
          ? { type: "repo", name: `${n[0]}-${n[1]}` }
          : n.includes("tree")
          ? { type: "folder", name: n[n.length - 1] }
          : n.includes("blob")
          ? { type: "file", name: n[n.length - 1] }
          : { type: "unknown", name: "github-download" };
      })(),
      t = document.createElement("li");
    
    var r;
    return (
      (t.className = "prc-ActionList-ActionListItem-So4vC"),
      (t.innerHTML = `<a class="prc-ActionList-ActionListContent-KBb8- prc-Link-Link-9ZwDx" role="menuitem" tabindex="-1" data-downgd="${e}" style="padding:${linkPadding};">
        <span class="prc-ActionList-Spacer-4tR2m"></span>
        <span class="prc-ActionList-LeadingVisual-NBr28 prc-ActionList-VisualWrap-bdCsS">
        ${
          ((r = e),
        "repo" === r
          ? '<svg aria-hidden="true" focusable="false" class="octicon octicon-download" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path></svg>'
          : "folder" === r
          ? '<svg style="width: 0;height: 0;"></svg>'
          : '<svg style="width: 0;height: 0;"></svg>')
      }
      </span>
        <span class="prc-ActionList-ActionListSubContent-gKsFp" data-component="ActionList.Item--DividerContainer">
        <span class="prc-ActionList-ItemLabel-81ohH">
        ${
          ((r = e),
        "repo" === r
          ? "Download Repo"
          : "folder" === r
          ? "Download Folder"
          : "Download")
      }
      </span></span></a>`),
      (t.onclick = () => {
        // Modal Logic
        !(function (defaultName, callback) {
          if (document.getElementById(n)) return;
          document.documentElement.dataset.colorMode;
          const t = document.createElement("div");
          (t.id = n),
            (t.innerHTML = `
                <style>  
                #${n} {position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;}
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
                  
                  <label class="dg-label">Name</label>
                  <input id="dg-name" value="${defaultName}" placeholder="File name"/>

                  <div class="dg-row">
                    <div class="dg-col">
                      <label class="dg-label">st (Start)</label>
                      <input id="dg-st" type="number" placeholder="0" />
                    </div>
                    <div class="dg-col">
                       <label class="dg-label">mx (Max)</label>
                       <input id="dg-mx" type="number" placeholder="0" />
                    </div>
                  </div>

                  <div class="dg-actions">
                    <button class="dg-cancel">Cancel</button>
                    <button class="dg-confirm">Download</button>
                  </div>
                </div>
              `),
            document.body.appendChild(t),
            t.querySelector(".modal-overlay").addEventListener("click", () => {
              t.remove();
            }),
            t.querySelector(".dg-cancel").addEventListener("click", () => {
              t.remove();
            }),
            t.querySelector(".dg-confirm").addEventListener("click", () => {
              // Retrieve values
              const nameVal = t.querySelector("#dg-name").value.trim() || defaultName;
              const stVal = t.querySelector("#dg-st").value.trim();
              const mxVal = t.querySelector("#dg-mx").value.trim();
              
              t.remove();
              callback(nameVal, stVal, mxVal);
            }),
            document.addEventListener(
              "keydown",
              (n) => {
                "Escape" === n.key && t.remove();
              },
              { once: !0 }
            );
        })(o.name, (name, st, mx) => {
          // Construct URL
          let finalUrl = `https://downgd.github.io/api/?url=${encodeURIComponent(location.href)}&name=${encodeURIComponent(name)}`;
          
          if(st) finalUrl += `&st=${encodeURIComponent(st)}`;
          if(mx) finalUrl += `&mx=${encodeURIComponent(mx)}`;

          window.open(finalUrl, "_blank");
        });
      }),
      t
    );
  }

  function o() {
    document
      .querySelectorAll("ul.prc-ActionList-ActionList-rPFF2")
      .forEach((n) => {
        const o = (function (n) {
          const e = n.innerText;
          return e.includes("Download ZIP")
            ? "repo"
            : e.includes("Copy path") && !e.includes("Raw file")
            ? "folder"
            : e.includes("Raw file content")
            ? "file"
            : null;
        })(n);
        o &&
          (n.querySelector(`[data-downgd="${o}"]`) ||
            n.insertBefore(e(o), n.firstElementChild));
      });
  }

  new MutationObserver(o).observe(document.body, {
    childList: !0,
    subtree: !0,
  }),
    o();
})();


})();