/* GENESIS MODULE — src/ui/reference-shelf.js — the opening-screen Reference Shelf framework.
   Spec: docs/REFERENCE-SHELF.md (unit S1). Classic <script>, shared global scope (NOT an ES module —
   ES-module reference apps like the Monster Manual register into this from their OWN <script type="module">
   tag; this file itself stays classic so renderStart()/showTab() reach it as plain globals).

   Owns exactly: REFERENCE_APPS, referenceShelfRegister, referenceShelfOpen, referenceShelfClose,
   referenceShelfSectionHTML.

   Registry entry shape: { id, label, icon, order, mount(container), teardown(container) }.
   Adding an app = one referenceShelfRegister() call — no launcher/shell change (docs/REFERENCE-SHELF.md
   "Expansion" acceptance bar).

   THE REGISTRATION-TIMING LAW (docs/REFERENCE-SHELF.md, "executor trap"): ES-module reference apps
   (Monster Manual, Wiki) execute AFTER the inline showTab('start') boot call in genesis.html — the
   FIRST renderStart() paint predates their registration. So referenceShelfRegister(), after pushing
   the entry, re-invokes renderStart() whenever #panel-start is the currently active panel — late
   registrants appear in the Reference section with zero shell edits and no tab switch required. */

var REFERENCE_APPS = [];

// the single currently-mounted app (for teardown-before-switch + the shell's own bookkeeping)
var _refShelfActive = null;      // {id, entry}
var _refShelfLastFocus = null;   // element to restore focus to on close

function referenceShelfRegister(entry) {
  REFERENCE_APPS.push(entry);
  REFERENCE_APPS.sort((a, b) => (a.order || 0) - (b.order || 0));
  // the registration-timing law: if the start panel is already live, repaint it so a late
  // (post-boot, ES-module) registrant's button appears without requiring a tab switch.
  if (typeof document !== "undefined") {
    const panel = document.getElementById("panel-start");
    if (panel && panel.classList && panel.classList.contains("active") && typeof renderStart === "function") {
      renderStart();
    }
  }
  return entry;
}

function referenceShelfSectionHTML() {
  if (!REFERENCE_APPS.length) return "";
  const buttons = REFERENCE_APPS.map(app =>
    `<button class="btn ghost sm refshelf-btn" onclick="referenceShelfOpen('${app.id}')">${app.icon ? app.icon + " " : ""}${app.label}</button>`
  ).join("");
  return `<div class="refshelf-section" role="group" aria-label="Reference">
    <div class="refshelf-label">Reference</div>
    <div class="refshelf-buttons">${buttons}</div>
  </div>`;
}

function _refShelfFocusables(host) {
  if (!host) return [];
  return Array.prototype.slice.call(
    host.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
  ).filter(el => el.offsetParent !== null || host.contains(el));
}

function _refShelfKeydown(ev) {
  const shell = document.getElementById("refShelf");
  if (!shell || shell.hidden) return;
  if (ev.key === "Escape") {
    ev.preventDefault();
    referenceShelfClose();
    return;
  }
  if (ev.key === "Tab") {
    // focus trap: keep Tab/Shift+Tab cycling inside the shell while it's open
    const focusables = _refShelfFocusables(shell);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault(); last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault(); first.focus();
    }
  }
}

function referenceShelfOpen(id) {
  const entry = REFERENCE_APPS.find(a => a.id === id);
  if (!entry) return;
  const shell = document.getElementById("refShelf");
  if (!shell) return;
  const body = document.getElementById("refShelfBody");
  const title = document.getElementById("refShelfTitle");

  // exactly one app mounted at a time — tear down whatever's live before mounting the new one
  if (_refShelfActive && _refShelfActive.entry && typeof _refShelfActive.entry.teardown === "function") {
    _refShelfActive.entry.teardown(body);
  }
  if (body) body.innerHTML = "";

  _refShelfLastFocus = (typeof document !== "undefined") ? document.activeElement : null;
  if (title) title.textContent = entry.label;
  shell.hidden = false;
  shell.classList.add("show");
  document.addEventListener("keydown", _refShelfKeydown, true);

  if (typeof entry.mount === "function") entry.mount(body);
  _refShelfActive = { id, entry };

  // focus trap: first focusable element in the shell (falls back to the shell itself)
  const focusables = _refShelfFocusables(shell);
  if (focusables.length) focusables[0].focus();
  else if (shell.focus) shell.focus();
}

function referenceShelfClose() {
  const shell = document.getElementById("refShelf");
  if (!shell || shell.hidden) return;
  const body = document.getElementById("refShelfBody");
  if (_refShelfActive && _refShelfActive.entry && typeof _refShelfActive.entry.teardown === "function") {
    _refShelfActive.entry.teardown(body);
  }
  _refShelfActive = null;
  if (body) body.innerHTML = "";
  shell.hidden = true;
  shell.classList.remove("show");
  document.removeEventListener("keydown", _refShelfKeydown, true);
  if (_refShelfLastFocus && typeof _refShelfLastFocus.focus === "function") _refShelfLastFocus.focus();
  _refShelfLastFocus = null;
}
