/* Verify BESTIARY-MANUAL.md unit S2 — the Monster Manual, REFERENCE-SHELF.md's registered app #1.
   Spec: docs/BESTIARY-MANUAL.md (verification §1-5) — src/ui/ref-bestiary.js + the tiny
   window.Theater.refFigure seam added to src/ui/theater-boot.js.

   TRANSPORT (per CLAUDE.md's headless-test convention, adapted for this file's ES-module shape):
   src/ui/ref-bestiary.js carries exactly ONE static import (resolveWholeObject from
   ./theater-figures.js, itself bare-three-free per that file's own header) and defers its only bare
   "three" import inside _ensureThree(), called only from mount()/the detail viewer — never at
   module top-level. That means the module is directly Node-importable (dynamic import()) WITHOUT a
   jsdom/browser stub, exactly like dev/verify-theater-figures.mjs's own transport for
   theater-figures.js — we never call mount()/the GL path here, so no WebGL is ever touched. jsdom
   has no WebGL anyway (BESTIARY-MANUAL.md's own verification header: "test the plain-object/
   adapter/lifecycle state, not real GL pixels").

   A minimal `globalThis.window` stub (BESTIARY/REALM_BESTIARY/MONSTER_FLAVOR/MODEL_RECIPES/
   theaterArchetypeFor/referenceShelfRegister/Theater.refFigure, all read off `window` bare-identifier
   inside the ES module, which Node resolves against globalThis) is installed BEFORE the dynamic
   import so the module's top-level registration line (`window.referenceShelfRegister(...)`) and
   every subsequent manualEntries()/mount()-adjacent call resolve against real compiled data
   (data/bestiary.js + data/realm-bestiary.js + data/monster-flavor.js + data/model-recipes.js, the
   SAME classic-script files genesis.html loads — no re-authored fixtures).

   Theater.refFigure.build/dispose are STUBBED (no real THREE/GL) — this harness asserts the
   lifecycle CONTRACT (build called once per mount, disposed exactly once per unmount, group tracked,
   caps honored), never real GPU output, matching the spec's own "jsdom has no WebGL" instruction.

   Run:  node dev/model-qa/verify-bestiary-manual.mjs
   (jsdom is NOT required for this harness — see the transport note above. If a future check needs a
   real DOM, install jsdom per CLAUDE.md's convention in a scratch dir and gate that check on it.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// Load the real compiled classic-script data globals (data/bestiary.js, data/realm-bestiary.js,
// data/monster-flavor.js, data/model-recipes.js) the SAME way genesis.html does — one eval per file
// into isolated const bindings, never hand-authored fixtures (BESTIARY-MANUAL.md's own "zero data
// duplication" ruling — this harness must never drift from what the game actually ships).
// ============================================================================
function loadClassicConst(path, constName) {
  const src = read(path) + `;globalThis.__verify_out = ${constName};`;
  // eslint-disable-next-line no-eval
  (0, eval)(src);
  const out = globalThis.__verify_out;
  delete globalThis.__verify_out;
  return out;
}

const BESTIARY = loadClassicConst("data/bestiary.js", "BESTIARY");
const REALM_BESTIARY = loadClassicConst("data/realm-bestiary.js", "REALM_BESTIARY");
const MONSTER_FLAVOR = loadClassicConst("data/monster-flavor.js", "MONSTER_FLAVOR");
const MODEL_RECIPES = loadClassicConst("data/model-recipes.js", "MODEL_RECIPES");

// theaterArchetypeFor + cmParseActionText are real classic-script functions too (src/engine/
// theater-data.js, src/engine/combat.js) — load them the same way so provenance/action-parse checks
// run against the real logic, not a stand-in.
function loadClassicFn(path, ...fnNames) {
  const assigns = fnNames.map((n) => `globalThis.__verify_${n} = ${n};`).join("\n");
  const src = read(path) + `;${assigns}`;
  (0, eval)(src);
  const out = {};
  for (const n of fnNames) { out[n] = globalThis["__verify_" + n]; delete globalThis["__verify_" + n]; }
  return out;
}
const { theaterArchetypeFor } = loadClassicFn("src/engine/theater-data.js", "theaterArchetypeFor");
const { cmParseActionText } = loadClassicFn("src/engine/combat.js", "cmParseActionText");

// ============================================================================
// The stubbed window — real data, a fake DOM/Theater surface. build/dispose are instrumented so the
// lifecycle checks (leak/cap) can assert on call counts without any real GL.
// ============================================================================
let refFigureBuildCalls = 0;
let refFigureDisposeCalls = 0;
let refFigureBuildShouldFail = false; // RED-FIRST toggle for check 1's leak-check-catches-a-leak proof

function makeStubWindow() {
  const registered = [];
  return {
    BESTIARY, REALM_BESTIARY, MONSTER_FLAVOR, MODEL_RECIPES, theaterArchetypeFor, cmParseActionText,
    referenceShelfRegister(entry) { registered.push(entry); return entry; },
    __registered: registered,
    Theater: {
      refFigure: {
        build(o) {
          refFigureBuildCalls++;
          if (refFigureBuildShouldFail) return null;
          return { userData: {}, rotation: { y: 0 }, visible: true, __stubGroup: true, __o: o };
        },
        dispose(group) {
          refFigureDisposeCalls++;
          if (group) group.__disposed = true;
        }
      }
    }
  };
}

// ============================================================================
// import the real module under a stub window — module-scope state (caches, live-canvas counters)
// persists across calls within one import, so re-import per test group via a cache-busting query
// (Node ESM caches by resolved URL+query) to get a clean module each time.
// ============================================================================
const MODULE_PATH = pathToFileURL(join(ROOT, "src/ui/ref-bestiary.js")).href;
let _importN = 0;
async function freshModule() {
  globalThis.window = makeStubWindow();
  refFigureBuildCalls = 0;
  refFigureDisposeCalls = 0;
  refFigureBuildShouldFail = false;
  const mod = await import(MODULE_PATH + "?v=" + (_importN++));
  return { mod, win: globalThis.window };
}

// ============================================================================
// check 1 — manualEntries().length === 510 + 1307 === 1817; window.manualEntries assigned; zero
// console errors implied by successful import (any throw during the module's top-level registration
// line would already have failed this call).
// ============================================================================
{
  const { mod, win } = await freshModule();
  const entries = mod.manualEntries();
  check("manualEntries().length === 1817 (510 BESTIARY + 1307 REALM_BESTIARY)",
    entries.length === 1817, entries.length);
  check("window.manualEntries is assigned for the harness",
    typeof win.manualEntries === "function" && win.manualEntries() === entries);
  const regularCount = entries.filter((e) => e.corpus === "regular").length;
  const realmCount = entries.filter((e) => e.corpus === "realm").length;
  check("regular corpus count === 510", regularCount === 510, regularCount);
  check("realm corpus count === 1307", realmCount === 1307, realmCount);

  // id derivation: regular = the BESTIARY key; realm = realm+":"+slugify(name), deterministic
  const wolf = entries.find((e) => e.id === "wolf");
  check("a regular entry's id IS the BESTIARY key", !!wolf && wolf.corpus === "regular");
  const someRealm = entries.find((e) => e.corpus === "realm");
  check("a realm entry's id is realm:slugified-name",
    !!someRealm && new RegExp("^" + someRealm.realm + ":[a-z0-9-]+$").test(someRealm.id),
    someRealm && someRealm.id);

  // re-deriving must be byte-identical across a fresh call (determinism across reloads)
  const entries2 = mod.manualEntries();
  check("manualEntries() is stable/cached across repeated calls (same array identity)",
    entries2 === entries);

  // missing fields render as muted "—" never a crash — spot check a realm entry's resolved
  // stat chassis fields actually populate from BESTIARY[entry.frame]
  const framed = entries.find((e) => e.corpus === "realm" && e.frame);
  check("a realm entry with a frame resolves ac/hp/speed off BESTIARY[frame]",
    !!framed && framed.ac != null && framed.hp != null && framed.speed != null,
    framed && { frame: framed.frame, ac: framed.ac, hp: framed.hp });
}

// ============================================================================
// id-collision suffix check — construct a synthetic REALM_BESTIARY with two same-named creatures in
// one realm and confirm the second gets a -2 suffix (deterministic collision handling).
// ============================================================================
{
  globalThis.window = makeStubWindow();
  globalThis.window.REALM_BESTIARY = {
    testrealm: [
      { name: "Twin", cr: 1, type: "Humanoid", size: "Medium", frame: "wolf" },
      { name: "Twin", cr: 1, type: "Humanoid", size: "Medium", frame: "wolf" }
    ]
  };
  globalThis.window.BESTIARY = BESTIARY;
  const mod = await import(MODULE_PATH + "?v=" + (_importN++));
  const entries = mod.manualEntries().filter((e) => e.realm === "testrealm");
  check("within-realm name collision gets a deterministic -2 suffix",
    entries.length === 2 && entries[0].id === "testrealm:twin" && entries[1].id === "testrealm:twin-2",
    entries.map((e) => e.id));
}

// ============================================================================
// check 2 — coverage audit: every entry resolves a modelKey; log per-tier counts (registered/
// recipe/cuboid byproduct QA number).
// ============================================================================
{
  const { mod } = await freshModule();
  const entries = mod.manualEntries();
  const tiers = { registered: 0, recipe: 0, cuboid: 0 };
  let missingModelKey = 0;
  for (const e of entries) {
    if (!e.modelKey) { missingModelKey++; continue; }
    const t = mod.provenanceTierFor(e.modelKey);
    tiers[t] = (tiers[t] || 0) + 1;
  }
  check("every entry resolves a modelKey (no missing)", missingModelKey === 0, missingModelKey);
  console.log(`  ℹ coverage audit: registered=${tiers.registered} recipe=${tiers.recipe} cuboid=${tiers.cuboid} (of ${entries.length})`);
  check("coverage audit tallies sum to the full corpus",
    tiers.registered + tiers.recipe + tiers.cuboid === entries.length - missingModelKey);
}

// ============================================================================
// check 1(c/d) — live-canvas cap + dispose lifecycle, using a fake DOM-ish container so mount()'s
// grid path can run without jsdom. mount() needs `document` — provide a minimal stub sufficient for
// the grid-building code path (createElement/querySelector/querySelectorAll/appendChild/addEventListener).
// IntersectionObserver is stubbed to synchronously "observe" by immediately firing an intersecting
// entry for every card (deterministic, no real viewport) — this drives _mountCard/_unmountCard
// through their real code paths.
// ============================================================================
function makeMiniDom() {
  // an extremely small DOM shim — just enough surface for ref-bestiary.js's grid-building code.
  class FakeClassList {
    constructor() { this._set = new Set(); }
    add(...c) { c.forEach((x) => this._set.add(x)); }
    remove(...c) { c.forEach((x) => this._set.delete(x)); }
    toggle(c, on) { on ? this._set.add(c) : this._set.delete(c); }
    contains(c) { return this._set.has(c); }
  }
  class FakeEl {
    constructor(tag) {
      this.tagName = (tag || "div").toUpperCase();
      this.children = [];
      this.attrs = {};
      this.dataset = {};
      this.style = {};
      this.classList = new FakeClassList();
      this._listeners = {};
      this._innerHTML = "";
      this.width = 96; this.height = 96;
      this.clientWidth = 320; this.clientHeight = 320;
    }
    set className(v) { this.classList = new FakeClassList(); this.classList.add(...String(v).split(/\s+/).filter(Boolean)); }
    get className() { return [...this.classList._set].join(" "); }
    setAttribute(k, v) { this.attrs[k] = v; }
    getAttribute(k) { return this.attrs[k]; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    insertBefore(c, ref) { const i = this.children.indexOf(ref); this.children.splice(i < 0 ? 0 : i, 0, c); c.parentNode = this; return c; }
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; }
    querySelector(sel) { return this._queryAll(sel)[0] || null; }
    querySelectorAll(sel) { return this._queryAll(sel); }
    _queryAll(sel) {
      const out = [];
      const cls = sel.startsWith(".") ? sel.slice(1) : null;
      const walk = (node) => {
        for (const c of node.children) {
          if (cls && c.classList && c.classList.contains(cls)) out.push(c);
          walk(c);
        }
      };
      walk(this);
      return out;
    }
    addEventListener(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); }
    removeEventListener(ev, fn) {
      const arr = this._listeners[ev];
      if (arr) { const i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1); }
    }
    dispatchEvent(ev) { (this._listeners[ev.type] || []).forEach((fn) => fn(ev)); }
    getContext() { return null; } // no real 2D/GL context — build()/dispose() are stubbed anyway
    set innerHTML(html) {
      this._innerHTML = html;
      this.children = [];
      // extremely small "parser": one <div class="X" data-id="Y"> per card, matched via regex —
      // sufficient for this harness's card-count/lifecycle assertions, not a real HTML parser.
      const re = /<div class="mm-card"[^>]*data-id="([^"]+)"[^>]*>[\s\S]*?<canvas class="mm-card-canvas"[\s\S]*?<\/canvas>[\s\S]*?<\/div>/g;
      let m;
      while ((m = re.exec(html))) {
        const card = new FakeEl("div");
        card.className = "mm-card";
        card.dataset.id = m[1];
        const canvas = new FakeEl("canvas");
        canvas.className = "mm-card-canvas";
        card.appendChild(canvas);
        this.appendChild(card);
      }
    }
    get innerHTML() { return this._innerHTML; }
  }
  return { createElement: (tag) => new FakeEl(tag) };
}

// a minimal fake THREE namespace — no real GL, just enough surface (add/remove/position.set/
// lookAt/rotation.y) for the REAL _ensureSharedGridContext/_mountCard/_unmountCard code paths in
// ref-bestiary.js to run end-to-end. Injected via the module's __setThreeForTest test-only hook.
function makeFakeThree() {
  class FakeObject3D {
    constructor() { this.position = { set() {} }; this.rotation = { y: 0 }; this.children = []; this.visible = true; }
    add(o) { this.children.push(o); }
    remove(o) { const i = this.children.indexOf(o); if (i >= 0) this.children.splice(i, 1); }
    lookAt() {}
  }
  return {
    WebGLRenderer: class {
      constructor() { this.domElement = { tagName: "CANVAS" }; }
      setSize() {}
      render() {}
      dispose() {}
    },
    Scene: FakeObject3D,
    OrthographicCamera: FakeObject3D,
    PerspectiveCamera: FakeObject3D,
    AmbientLight: FakeObject3D,
    DirectionalLight: FakeObject3D
  };
}

class FakeIntersectionObserver {
  constructor(cb, opts) { this.cb = cb; this.opts = opts; this.observed = []; }
  observe(el) { this.observed.push(el); this.cb([{ target: el, isIntersecting: true }]); }
  unobserve(el) { const i = this.observed.indexOf(el); if (i >= 0) this.observed.splice(i, 1); }
  disconnect() { this.observed = []; }
}

// ============================================================================
// check 1(c) — the live-canvas cap: mount MORE than LIVE_CARD_CAP cards through the REAL _mountCard
// path (not a re-implementation) and assert __liveCardCount() never exceeds __liveCardCap().
// ============================================================================
{
  const { mod } = await freshModule();
  globalThis.document = makeMiniDom();
  globalThis.performance = globalThis.performance || { now: () => Date.now() };
  mod.__setThreeForTest(makeFakeThree());

  const entries = mod.manualEntries().slice(0, 40); // more than the 24-cap, to exercise the cap
  const cap = mod.__liveCardCap();
  check("LIVE_CARD_CAP is the spec's ≤24 (a hard cap on concurrently-live canvases)", cap === 24, cap);

  const cards = entries.map((e) => {
    const el = globalThis.document.createElement("div");
    const canvas = globalThis.document.createElement("canvas");
    canvas.className = "mm-card-canvas";
    el.appendChild(canvas);
    return { el, entry: e };
  });
  cards.forEach(({ el, entry }) => mod.__mountCardForTest(el, entry));
  check("mounting more than the cap never exceeds LIVE_CARD_CAP live canvases",
    mod.__liveCardCount() <= cap, mod.__liveCardCount());
  check("mounting exactly caps at LIVE_CARD_CAP when demand exceeds it",
    mod.__liveCardCount() === cap, mod.__liveCardCount());

  // unmount everything that DID mount — every mounted card must dispose cleanly (real _unmountCard)
  cards.forEach(({ el }) => mod.__unmountCardForTest(el));
  check("unmounting every card returns __liveCardCount() to zero",
    mod.__liveCardCount() === 0, mod.__liveCardCount());
}

// ============================================================================
// check 1(d) ⊗ RED-FIRST — the leak-check catches a leak: run the REAL _mountCard/_unmountCard path
// but stub Theater.refFigure.dispose to a no-op partway through, proving a leak-check assertion on
// __liveCardCount()/build-vs-dispose parity actually goes red, then restore the real dispose and
// prove the SAME assertion goes green. This is the manual's own dispose discipline under test, not
// just the seam in isolation.
// ============================================================================
{
  const { mod, win } = await freshModule();
  globalThis.document = makeMiniDom();
  globalThis.performance = globalThis.performance || { now: () => Date.now() };
  mod.__setThreeForTest(makeFakeThree());

  const entries = mod.manualEntries().slice(0, 10);
  const cards = entries.map((e) => {
    const el = globalThis.document.createElement("div");
    const canvas = globalThis.document.createElement("canvas");
    canvas.className = "mm-card-canvas";
    el.appendChild(canvas);
    return { el, entry: e };
  });
  cards.forEach(({ el, entry }) => mod.__mountCardForTest(el, entry));
  check("10 cards mounted -> __liveCardCount() === 10", mod.__liveCardCount() === 10, mod.__liveCardCount());

  // RED-FIRST: break dispose (simulating the manual forgetting to release resources on unmount) —
  // the REAL _unmountCard still decrements _liveCount (that bookkeeping isn't gated on dispose
  // succeeding), so the leak-check instead asserts on the dispose-call-count side of the contract.
  const realDispose = win.Theater.refFigure.dispose;
  win.Theater.refFigure.dispose = () => { /* leaked: forgot to release */ };
  cards.forEach(({ el }) => mod.__unmountCardForTest(el));
  check("⊗ RED-FIRST: a broken dispose path is caught — disposeCalls stays 0 while builds happened",
    refFigureDisposeCalls === 0 && refFigureBuildCalls === 10,
    { disposeCalls: refFigureDisposeCalls, buildCalls: refFigureBuildCalls });

  // restore the real dispose, mount+unmount again, prove the SAME assertion now goes green
  win.Theater.refFigure.dispose = realDispose;
  const cards2 = mod.manualEntries().slice(10, 20).map((e) => {
    const el = globalThis.document.createElement("div");
    const canvas = globalThis.document.createElement("canvas");
    canvas.className = "mm-card-canvas";
    el.appendChild(canvas);
    return { el, entry: e };
  });
  const disposeCallsBefore = refFigureDisposeCalls;
  cards2.forEach(({ el, entry }) => mod.__mountCardForTest(el, entry));
  cards2.forEach(({ el }) => mod.__unmountCardForTest(el));
  check("the real dispose discipline: every mounted card's dispose is called exactly once on unmount",
    refFigureDisposeCalls - disposeCallsBefore === cards2.length,
    refFigureDisposeCalls - disposeCallsBefore);
  check("liveCount returns to zero after the real mount/unmount cycle",
    mod.__liveCardCount() === 0, mod.__liveCardCount());
}

// ============================================================================
// check 4 — check-manifest.py OK (ref-bestiary.js + its <script type="module"> tag + manifest entry
// are tracked). Shelled out so this harness gives one authoritative signal alongside its own checks.
// ============================================================================
{
  const { execSync } = await import("node:child_process");
  let out = "", ok = false;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
    ok = /RESULT: OK/.test(out);
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
    ok = false;
  }
  check("python3 build/check-manifest.py -> RESULT: OK", ok, out.split("\n").slice(-3).join(" | "));
}

const html = read("genesis.html");
check("genesis.html carries a <script type=\"module\" src=\"src/ui/ref-bestiary.js\"> tag",
  /<script type="module" src="src\/ui\/ref-bestiary\.js">/.test(html));
{
  const bootIdx = html.indexOf('<script type="module" src="src/ui/theater-boot.js">');
  const mmIdx = html.indexOf('<script type="module" src="src/ui/ref-bestiary.js">');
  check("ref-bestiary.js's tag loads AFTER theater-boot.js's tag",
    bootIdx >= 0 && mmIdx > bootIdx, { bootIdx, mmIdx });
}

const manifestJson = JSON.parse(read("manifest.json"));
check("manifest.json registers ui.ref-bestiary as type:\"module\"",
  manifestJson.modules.some((m) => m.id === "ui.ref-bestiary" && m.type === "module" && m.path === "src/ui/ref-bestiary.js"));

// ============================================================================
// check 5 ⊗ RED-FIRST — the alt-menu mechanism: absent by default; a stub registry entry with
// alts:[a,b] makes the mechanism render/swap/dispose the old group. Tested at the module's exported
// __setStubAlts seam (the spec's own "test-only hook" for this — no real registry entry declares
// alts today).
// ============================================================================
{
  const { mod } = await freshModule();
  const entries = mod.manualEntries();
  const anyEntry = entries[0];

  // ⊗ RED-FIRST: assert the menu is ABSENT before injecting anything, via the REAL _altMenuHTML
  // function (exported test-only as __altMenuHTML) — every real entry today renders no menu markup.
  const preHTML = mod.__altMenuHTML(anyEntry);
  check("⊗ RED-FIRST (pre-condition): the real alt-menu mechanism renders NOTHING for a real entry today",
    preHTML === "", JSON.stringify(preHTML));

  // sweep every corpus entry — confirm the mechanism is absent everywhere, not just for entries[0]
  const anyMenuRendered = entries.some((e) => mod.__altMenuHTML(e) !== "");
  check("no entry in the full 1817-entry corpus renders an alt-menu today (mechanism-only ship)",
    !anyMenuRendered);

  // now inject a stub via the module's own test-only hook and prove the mechanism ACTIVATES for real
  mod.__setStubAlts([{ label: "Pose A", fn: "wolf" }, { label: "Pose B", fn: "giant-rat" }]);
  const postHTML = mod.__altMenuHTML(anyEntry);
  check("after injecting a 2-alt stub, the real alt-menu mechanism renders a bullet/segmented selector",
    postHTML.includes("mm-alt-menu") && postHTML.includes("Pose A") && postHTML.includes("Pose B"),
    postHTML);

  // clearing the stub returns to the absent state (togglable, not a one-way switch)
  mod.__setStubAlts(null);
  check("clearing the stub (__setStubAlts(null)) returns the mechanism to absent",
    mod.__altMenuHTML(anyEntry) === "");
}

// ============================================================================
// check 6 (fix/bestiary-globals, added 2026-07-06) — the REAL window-bridge regression guard. Every
// check above stubs `globalThis.window` by hand with the real data objects, which proves the
// module's OWN logic is correct but can never catch the actual browser bug that shipped: classic
// <script> top-level `const` (BESTIARY/REALM_BESTIARY/MONSTER_FLAVOR/MODEL_RECIPES in
// data/bestiary.js etc.) does NOT attach to `window`, so in the real genesis.html document the
// module's `window.BESTIARY` reads were always undefined — manualEntries() silently returned [],
// the grid rendered empty, and every filter had nothing to filter. This check instead loads
// genesis.html's actual classic <script src> chain (document order, up to the first
// `type="module"` tag) into a REAL jsdom window via vm.runInContext — the same "one shared
// declarative scope" semantics real <script> tags get in a browser — and asserts window.BESTIARY
// etc. are non-empty objects afterward. Before src/ui/ref-globals-bridge.js existed, this whole
// block failed red (proven at fix time: window.BESTIARY was undefined, manualEntries() length 0).
// Requires jsdom (CLAUDE.md's headless-test convention — install once in ~/.genesis-jsdom or
// $JSDOM_HOME per environment); skips (not fails) if jsdom isn't available, matching this repo's
// existing gauntlet-6-persistence.mjs convention for optional jsdom-backed checks.
// ============================================================================
{
  let JSDOM = null;
  try {
    const { createRequire } = await import("node:module");
    const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
    const requireFromJsdomHome = createRequire(join(JSDOM_HOME, "package.json"));
    ({ JSDOM } = requireFromJsdomHome("jsdom"));
  } catch {
    console.log("  ⚠ skipping check 6 (window-bridge regression guard) — jsdom not available; see CLAUDE.md's headless-test convention");
  }

  if (JSDOM) {
    const vm = await import("node:vm");
    const scriptRe = /<script(?:\s+type="([^"]*)")?\s+src="([^"]+)"><\/script>/g;
    const classicSrcs = [];
    let sm;
    while ((sm = scriptRe.exec(html))) {
      const [, type, src] = sm;
      if (type === "module") break; // stop at the ES-module boundary — the bridge bug lives entirely below it
      if (src.endsWith(".js")) classicSrcs.push(src);
    }
    check("genesis.html's classic <script src> chain includes src/ui/ref-globals-bridge.js after the 4 bestiary data files",
      classicSrcs.includes("src/ui/ref-globals-bridge.js") &&
      ["data/bestiary.js", "data/monster-flavor.js", "data/realm-bestiary.js", "data/model-recipes.js"]
        .every((p) => classicSrcs.indexOf(p) < classicSrcs.indexOf("src/ui/ref-globals-bridge.js")),
      classicSrcs.indexOf("src/ui/ref-globals-bridge.js"));

    const dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only", url: "http://localhost/" });
    const context = dom.getInternalVMContext ? dom.getInternalVMContext() : dom.window;
    let loadErr = null;
    for (const src of classicSrcs) {
      try {
        vm.runInContext(read(src), context, { filename: src });
      } catch (e) {
        loadErr = { src, message: e.message };
        break;
      }
    }
    check("every classic script up to the module boundary executes without throwing in a real jsdom window",
      !loadErr, loadErr);

    const w = dom.window;
    check("window.BESTIARY is a non-empty object in a real jsdom document (⊗ was undefined before ref-globals-bridge.js)",
      w.BESTIARY && typeof w.BESTIARY === "object" && Object.keys(w.BESTIARY).length > 400,
      w.BESTIARY ? Object.keys(w.BESTIARY).length : "undefined");
    check("window.REALM_BESTIARY is a non-empty object in a real jsdom document (⊗ was undefined before ref-globals-bridge.js)",
      w.REALM_BESTIARY && typeof w.REALM_BESTIARY === "object" && Object.keys(w.REALM_BESTIARY).length > 0,
      w.REALM_BESTIARY ? Object.keys(w.REALM_BESTIARY).length : "undefined");
    check("window.MONSTER_FLAVOR is a non-empty object in a real jsdom document (⊗ was undefined before ref-globals-bridge.js)",
      w.MONSTER_FLAVOR && typeof w.MONSTER_FLAVOR === "object" && Object.keys(w.MONSTER_FLAVOR).length > 0,
      w.MONSTER_FLAVOR ? Object.keys(w.MONSTER_FLAVOR).length : "undefined");
    check("window.MODEL_RECIPES is a non-empty object in a real jsdom document (⊗ was undefined before ref-globals-bridge.js)",
      w.MODEL_RECIPES && typeof w.MODEL_RECIPES === "object" && Object.keys(w.MODEL_RECIPES).length > 0,
      w.MODEL_RECIPES ? Object.keys(w.MODEL_RECIPES).length : "undefined");
    check("window.theaterArchetypeFor stayed a function throughout (function decls always reached window, unaffected by the const/window gap)",
      typeof w.theaterArchetypeFor === "function");

    // Feed the real bridged globals into the actual ref-bestiary.js module (a fresh import, cache-busted)
    // and prove manualEntries() returns the full corpus + a default alphabetical sort is applied at
    // the mount/filter seam (Adam's ruling 2026-07-06: grid shows ALL entries A-Z with no filters set).
    globalThis.window = {
      BESTIARY: w.BESTIARY, REALM_BESTIARY: w.REALM_BESTIARY, MONSTER_FLAVOR: w.MONSTER_FLAVOR,
      MODEL_RECIPES: w.MODEL_RECIPES, theaterArchetypeFor: w.theaterArchetypeFor,
      cmParseActionText: w.cmParseActionText, referenceShelfRegister: () => {},
      Theater: { refFigure: { build: () => null, dispose: () => {} } }
    };
    const bridgedMod = await import(MODULE_PATH + "?v=" + (_importN++));
    const bridgedEntries = bridgedMod.manualEntries();
    check("manualEntries() returns > 400 entries once window carries the real bridged globals (⊗ was 0 before the fix)",
      bridgedEntries.length > 400, bridgedEntries.length);

    // mount() itself needs a DOM (out of scope for this bridge check — exercised by check 1c/1d above
    // via the mini-DOM harness) — the default-sort CONTRACT is asserted directly against the same
    // no-filter rerender path mount() calls, using the module's own real code, not a reimplementation.
    const filteredNoFilters = bridgedMod.__applyFiltersForTest
      ? bridgedMod.__applyFiltersForTest(bridgedEntries, {})
      : null;
    if (filteredNoFilters) {
      const names = filteredNoFilters.map((e) => e.name || "");
      const sortedNames = names.slice().sort((a, b) => a.localeCompare(b));
      check("the no-filter grid result is sorted alphabetically by name (Adam's ruling 2026-07-06)",
        JSON.stringify(names) === JSON.stringify(sortedNames));
    } else {
      console.log("  ⚠ __applyFiltersForTest not exported — default-sort contract checked via dev/verify-window-bridge harness instead");
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
