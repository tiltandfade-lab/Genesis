/* Verify the REFERENCE-SHELF.md unit S1 framework — the opening-screen reference-app launcher.
   Spec: docs/REFERENCE-SHELF.md (S1) — src/ui/reference-shelf.js.

   Loads EVERY module in manifest load order into one jsdom global scope (the const-via-eval
   convention from dev/verify-dm-events.mjs — classic-script top-level const/function share scope
   only inside one eval). Then:
     1. referenceShelfSectionHTML() renders a button per registered app; the section appears in
        renderStart()'s #startView output.
     2. referenceShelfOpen(id) mounts that app into #refShelf (calls mount, unhides the overlay);
        referenceShelfClose() calls teardown + hides it; opening a second app tears down the first.
     3. RED-FIRST — the expand proof: registering a THIRD stub app AFTER the initial renderStart()
        paint must make it appear in the start view with zero shell edits (the registration-timing
        law). Proven by literally stashing the re-render line and re-running to watch it go red.
     4. ARIA/keyboard: #refShelf carries role="dialog" aria-modal="true"; Esc closes; a focus trap
        keeps Tab/Shift+Tab inside the shell while open (first focusable is focused on open).

   Run:  node dev/verify-reference-shelf.mjs
   (jsdom is installed per-environment in a scratch dir — see CLAUDE.md "headless test".
    Override the dir with JSDOM_HOME=/path/to/dir containing node_modules/jsdom.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// every module, in real load order (classic <script> tags only — module-type entries like
// ui.theater-boot load via their own <script type="module"> tag and aren't part of this scope)
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const html = `<!doctype html><html><body>
  <section id="panel-start" class="panel active"><div id="startView"></div></section>
  <div id="refShelf" role="dialog" aria-modal="true" aria-labelledby="refShelfTitle" hidden>
    <div class="refshelf-shell">
      <div class="refshelf-head">
        <button onclick="referenceShelfClose()">↩ Shelf</button>
        <div id="refShelfTitle"></div>
        <button onclick="referenceShelfClose()" aria-label="Close">✕</button>
      </div>
      <div id="refShelfBody"></div>
    </div>
  </div>
</body></html>`;

function freshDom() {
  const dom = new JSDOM(html, { runScripts: "dangerously" });
  const win = dom.window;
  win.eval(harness + "\n" + src);
  return { dom, win };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. section rendering — register 2 stubs, assert renderStart() shows both
// ============================================================================
{
  const { win } = freshDom();
  const mountLog = [];
  const teardownLog = [];

  const stubA = {
    id: "stub-a", label: "Stub App A", icon: "✦", order: 1,
    mount(container) { mountLog.push("a"); if (container) container.innerHTML = "<div id=\"stubA\">A body</div>"; },
    teardown() { teardownLog.push("a"); },
  };
  const stubB = {
    id: "stub-b", label: "Stub App B", icon: "✦", order: 2,
    mount(container) { mountLog.push("b"); if (container) container.innerHTML = "<div id=\"stubB\">B body</div>"; },
    teardown() { teardownLog.push("b"); },
  };
  win.referenceShelfRegister(stubA);
  win.referenceShelfRegister(stubB);

  check("all four globals present after full load",
    ["REFERENCE_APPS", "referenceShelfRegister", "referenceShelfOpen", "referenceShelfClose", "referenceShelfSectionHTML"]
      .every((n) => typeof win[n] !== "undefined"));

  const sectionHtml = win.referenceShelfSectionHTML();
  check("referenceShelfSectionHTML() returns a button per registered app",
    sectionHtml.includes("Stub App A") && sectionHtml.includes("Stub App B"),
    sectionHtml);

  win.renderStart();
  const startHtml = win.document.getElementById("startView").innerHTML;
  check("the Reference section appears inside renderStart()'s #startView output",
    startHtml.includes("Stub App A") && startHtml.includes("Stub App B") && startHtml.includes("Reference"),
    startHtml);

  // ==========================================================================
  // 2. open/mount/close/teardown lifecycle + switch-tears-down-previous
  // ==========================================================================
  win.referenceShelfOpen("stub-a");
  check("referenceShelfOpen mounts the app (mount called)", mountLog.join(",") === "a", mountLog.join(","));
  check("referenceShelfOpen unhides the overlay", win.document.getElementById("refShelf").hidden === false);
  check("the mounted app's markup is in #refShelfBody",
    win.document.getElementById("refShelfBody").innerHTML.includes("A body"));

  win.referenceShelfOpen("stub-b");
  check("opening a second app tears down the first before mounting the new one",
    teardownLog.join(",") === "a" && mountLog.join(",") === "a,b",
    `teardown=${teardownLog.join(",")} mount=${mountLog.join(",")}`);
  check("the shell now shows the second app's markup",
    win.document.getElementById("refShelfBody").innerHTML.includes("B body"));

  win.referenceShelfClose();
  check("referenceShelfClose calls the active app's teardown",
    teardownLog.join(",") === "a,b", teardownLog.join(","));
  check("referenceShelfClose hides the overlay", win.document.getElementById("refShelf").hidden === true);
  check("referenceShelfClose empties the body container",
    win.document.getElementById("refShelfBody").innerHTML.trim() === "");
}

// ============================================================================
// 3. RED-FIRST — the expand proof: register a THIRD stub app AFTER the initial
//    renderStart() paint; it must appear with ZERO shell edits (the registration-
//    timing law: referenceShelfRegister re-invokes renderStart() when #panel-start
//    is active).
// ============================================================================
{
  const { win } = freshDom();
  win.renderStart(); // the "boot" paint — predates any registration, exactly like genesis.html's flow

  const preHtml = win.document.getElementById("startView").innerHTML;
  check("pre-registration: the start view does not yet mention the late stub",
    !preHtml.includes("Late Stub"), preHtml);

  const stubLate = {
    id: "stub-late", label: "Late Stub", icon: "✦", order: 3,
    mount(container) { if (container) container.innerHTML = "<div id=\"stubLate\">Late body</div>"; },
    teardown() {},
  };
  win.referenceShelfRegister(stubLate); // registered POST-BOOT — no code after this touches the DOM

  const postHtml = win.document.getElementById("startView").innerHTML;
  check("⊗ RED-FIRST: a post-boot registrant appears in the start view with zero shell edits (the registration-timing law)",
    postHtml.includes("Late Stub"), postHtml);
}

// ============================================================================
// 4. ARIA / keyboard: role="dialog" aria-modal="true"; Esc closes; focus trap
// ============================================================================
{
  const { win } = freshDom();
  const shell = win.document.getElementById("refShelf");
  check('#refShelf has role="dialog"', shell.getAttribute("role") === "dialog");
  check('#refShelf has aria-modal="true"', shell.getAttribute("aria-modal") === "true");

  const stub = {
    id: "stub-aria", label: "ARIA Stub", icon: "✦", order: 1,
    mount(container) {
      if (container) container.innerHTML = '<button id="firstFocusable">First</button><button id="secondFocusable">Second</button>';
    },
    teardown() {},
  };
  win.referenceShelfRegister(stub);
  win.referenceShelfOpen("stub-aria");

  // the real shell markup carries its own head buttons (↩ Shelf / ✕) BEFORE the app-mounted body —
  // those are the actual first/last focusables in DOM order, not the stub's own buttons.
  const focusablesOnOpen = win._refShelfFocusables(shell);
  const domFirstOnOpen = focusablesOnOpen[0];
  check("focus trap: the first focusable element inside the shell is focused on open",
    win.document.activeElement === domFirstOnOpen,
    win.document.activeElement ? (win.document.activeElement.id || win.document.activeElement.textContent) : "(none)");

  // Esc closes
  const escEvent = new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  win.document.dispatchEvent(escEvent);
  check("Esc closes the shell", shell.hidden === true);

  // re-open to verify the focus-trap keydown handler is actually wired (not just present in source).
  // referenceShelfOpen remounts the app (fresh DOM nodes for the body), so re-query focusables AFTER
  // reopening rather than reusing element refs captured before the remount (those are now detached).
  win.referenceShelfOpen("stub-aria");
  const focusablesReopened = win._refShelfFocusables(shell);
  const domFirst = focusablesReopened[0], domLast = focusablesReopened[focusablesReopened.length - 1];
  const tabEvent = new win.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  let defaultPrevented = false;
  // focus the LAST focusable in the shell, then Tab forward — the trap should wrap to the first
  domLast.focus();
  const originalPD = tabEvent.preventDefault.bind(tabEvent);
  tabEvent.preventDefault = () => { defaultPrevented = true; originalPD(); };
  win.document.dispatchEvent(tabEvent);
  check("focus-trap handler exists and wraps Tab from the last focusable back to the first",
    defaultPrevented && win.document.activeElement === domFirst,
    `defaultPrevented=${defaultPrevented} activeId=${win.document.activeElement ? (win.document.activeElement.id || win.document.activeElement.textContent) : "(none)"}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
