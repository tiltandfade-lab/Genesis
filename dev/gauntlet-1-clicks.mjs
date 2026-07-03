/* GAUNTLET G1 — the click-everything sweep (docs/PRE-PLAYTEST-GAUNTLET.md §3)
   Wiring rot detector: every inline onclick in every reachable state, invoked, guarded.

   Boots the full app (real genesis.html module set, real load order) into jsdom, over 8 state
   contexts (extended 2026-07-02 — the original 3 landed only 40 unique handlers against the spec's
   ≥150 floor because they never staged guided-creation/combat/dice/level-up/bardo states; see
   dev/gauntlet-report.json G1 finding "coverage" + the 9 cgChoose review findings this extension
   converts into real invocations):
     (a) fresh boot, no world
     (b) a mid-session fixture world (one living PC)
     (c) fixture world with a shop open (GS.shop-equivalent: open_shop event, dev test-shop path)
     (d) guided-creation mid-flow (GS.CGEN/GS.BARDO genuinely live — every bardo step type walked)
     (e) combat tracker mid-fight (GS.combat staged directly)
     (f) dice overlay mid-roll (diceOverlay(), self-mounted to document.body)
     (g) level-up picker — caster (Wizard) + martial (Fighter) branches
     (h) death saves + the bardo passage (killCharacter → openBardo → renderBardoPassage)
   For (a)/(b)/(c): iterate showTab(id) over every tab id present in the DOM's outer tab bar, render,
   then collect every [onclick] element on the page and invoke its handler in two passes — pass A
   stubs confirm()/prompt() to decline (nothing destructive fires), pass B accepts them against a
   throwaway world copy. (d)-(h) stage their target state directly (mirrors gauntlet-g8.mjs's stager)
   then run the same collect→invoke→restore sweep via the shared sweepDoc() helper. State is
   snapshotted and restored around every single invocation so handlers can't contaminate each other.

   Severity ruling (spec §3):
     - ReferenceError: <fn> is not defined  → always `ugly` (wiring rot), in every context.
     - Any other throw → `ugly` only if it throws in ALL applicable contexts; a throw only where
       required state is absent (e.g. an in-session-only handler at the start screen) → `review`.

   Exit code: 0 when the sweep RAN TO COMPLETION (findings are data, not test failures).
   Exit 1 ONLY on a harness defect (boot failure, unhandled harness-code throw, report unwritable).

   Canary (GAUNTLET_CANARY=1): injects <button onclick="gauntletNoSuchFn()"> into the DOM before the
   sweep. gauntletNoSuchFn is never defined anywhere → must be caught as a ReferenceError → exactly
   the `ugly` "wiring rot" case → ≥1 finding, and the harness exits 1 (canary-injected defect,
   confirming the detector fires red before it's trusted green).

   Run:   node dev/gauntlet-1-clicks.mjs
   Canary: GAUNTLET_CANARY=1 node dev/gauntlet-1-clicks.mjs
   Determinism: GAUNTLET_SEED (default 20260702) seeds a mulberry32 PRNG installed over Math.random
   BEFORE any module loads.
   jsdom: JSDOM_HOME (default ~/.genesis-jsdom) must contain node_modules/jsdom. Boot pattern copied
   from dev/verify-dm-events.mjs (loads every module in real manifest.json load order, one eval, so
   classic-script top-level const/function share scope). */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const HARNESS_ID = "G1";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const SEED = Number(process.env.GAUNTLET_SEED || 20260702);
const CANARY = process.env.GAUNTLET_CANARY === "1";

// ---------- mulberry32, determinism (spec §0) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
try {
  ({ JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom"));
} catch (e) {
  harnessDefect(`jsdom not found at ${JSDOM_HOME} — npm i jsdom there first (CLAUDE.md "headless test"). ${e.message}`);
}

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harnessGlobals = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

let commit = "unknown";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

// ---------- report accumulation (spec §2) ----------
const findings = [];
let findingSeq = 0;
function addFinding({ severity, title, symptom, context, handlerSrc, stack, collisionZone }) {
  findingSeq += 1;
  findings.push({
    id: `G1-${String(findingSeq).padStart(3, "0")}`,
    harness: HARNESS_ID,
    severity,
    title,
    symptom,
    evidence: {
      stack: stack || null,
      context,
      handlerSrc: handlerSrc ? handlerSrc.slice(0, 300) : null,
      repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-1-clicks.mjs${context ? ` # context=${context}` : ""}`,
    },
    ...(collisionZone ? { collisionZone: true } : {}),
  });
}

// COLLISION ZONE (spec §1): a parallel session owns these files — findings attributable to them
// are flagged, never fixed. Detect by checking whether the throwing handler's stack (or, short of a
// stack, the handler source) mentions functions/symbols owned by those files.
const COLLISION_FILES = ["src/world/gap-wiring.js", "src/engine/combat.js", "manifest.json"];
function isCollisionZone(stack, handlerSrc) {
  const hay = `${stack || ""}\n${handlerSrc || ""}`;
  return COLLISION_FILES.some((f) => hay.includes(f));
}

function harnessDefect(msg) {
  console.error(`[G1 HARNESS DEFECT] ${msg}`);
  writeReport({ status: "harness-defect", error: msg });
  process.exit(1);
}

// ---------- report writer (spec §2, accretes across harness runs) ----------
const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
function writeReport(extra = {}) {
  let report = { run: { date: new Date().toISOString().slice(0, 10), seed: SEED, commit }, harnesses: [], findings: [] };
  if (existsSync(REPORT_PATH)) {
    try { report = JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch { /* start fresh if corrupt */ }
  }
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID);
  report.harnesses.push({
    id: HARNESS_ID,
    status: extra.status || "completed",
    invoked: extra.invoked ?? 0,
    skipped: extra.skipped ?? 0,
    findings: findings.length,
    stats: extra.stats || {},
    canary: CANARY ? { injected: true, fired: findings.length > 0 } : undefined,
    ...( extra.error ? { error: extra.error } : {} ),
  });
  report.findings.push(...findings);
  const dir = dirname(REPORT_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  writeFindingsMd(report);
}

function writeFindingsMd(report) {
  const bySeverity = { crash: [], corrupt: [], wrong: [], ugly: [], review: [] };
  for (const f of report.findings) (bySeverity[f.severity] || (bySeverity[f.severity] = [])).push(f);
  const lines = [
    `# GAUNTLET-FINDINGS.md`,
    ``,
    `Auto-generated from dev/gauntlet-report.json. Do not hand-edit.`,
    ``,
    `Run: ${report.run.date} · seed ${report.run.seed} · commit ${report.run.commit}`,
    ``,
  ];
  for (const sev of ["crash", "corrupt", "wrong", "ugly", "review"]) {
    const items = bySeverity[sev] || [];
    lines.push(`## ${sev} (${items.length})`, "");
    for (const f of items) {
      lines.push(`- **${f.id}** [${f.harness}] ${f.title}${f.collisionZone ? " ⚠ collisionZone" : ""}`);
      if (f.symptom) lines.push(`  - ${f.symptom}`);
      if (f.evidence && f.evidence.repro) lines.push(`  - repro: \`${f.evidence.repro}\``);
    }
    lines.push("");
  }
  writeFileSync(join(ROOT, "dev/GAUNTLET-FINDINGS.md"), lines.join("\n"));
}

// ---------- jsdom boot ----------
function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.Math.random = mulberry32(SEED);
  win.eval(harnessGlobals + "\n" + src);
  // stub confirm/prompt globally; pass B overrides confirm per-invocation
  win.confirm = () => false;
  win.prompt = () => null;
  win.alert = () => {};
  // jsdom has no fetch; the app's real handlers call it to reach the DM bridge (dev/dm-bridge.py),
  // which this offline sweep must never touch (hard constraint: never run verify-bridge.py / touch
  // .dm/). Stub a rejecting fetch so bridge-calling handlers exercise their real code path up to the
  // network call and fail gracefully via their own .catch()/.then() handling, instead of the sweep
  // reporting a false "fetch is not defined" wiring-rot finding that's really a harness-environment gap.
  win.fetch = () => Promise.reject(new Error("gauntlet: fetch stubbed — no live bridge in this sweep"));
  // jsdom has no Clipboard API; real handlers (handToDM's navigator.clipboard.writeText) fall back to
  // fallbackCopy() on rejection in the browser — stub the same reject-and-fallback shape here so the
  // sweep exercises the real handler instead of flagging an environment gap as a false wiring finding.
  if (!win.navigator.clipboard) {
    Object.defineProperty(win.navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("gauntlet: clipboard stubbed")) },
      configurable: true,
    });
  }
  // jsdom has no requestAnimationFrame/matchMedia (browser-only) — diceOverlay (src/ui/dice.js) and
  // the level-up picker both reach for one or the other. ENVIRONMENT shims only (same shape
  // dev/gauntlet-g8.mjs's stager already uses for these exact panels): synchronous rAF + a
  // "no motion preference" matchMedia stub, so the new staged contexts below (dice overlay,
  // level-up picker) mount deterministically instead of the sweep reporting a false
  // "requestAnimationFrame is not defined" wiring finding that's really an environment gap.
  if (typeof win.requestAnimationFrame !== "function") win.requestAnimationFrame = (cb) => win.setTimeout(cb, 0);
  if (typeof win.matchMedia !== "function") win.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  return win;
}

// build the actual outer app chrome (rail + panel sections) genesis.html defines inline, since the
// full genesis.html body isn't loaded verbatim by this boot pattern (only its <script> modules are —
// same limitation dev/verify-dm-events.mjs and dev/verify-in-session-ui.mjs both work within).
// runContext() re-mounts this at the top of every context, so the CANARY injection lives HERE (not
// as a one-off appendChild before the first context) — otherwise the re-mount wipes it before the
// sweep ever collects onclicks and the canary silently never fires.
function mountAppChrome(win) {
  const body = win.document.body;
  const canaryHtml = CANARY ? `<button id="gauntletCanaryBtn" onclick="gauntletNoSuchFn()">canary</button>` : "";
  body.innerHTML = `
    ${canaryHtml}
    <div id="tbHere"></div>
    <div class="wrap">
      <aside class="rail">
        <button id="tab-universe" class="active" onclick="showTab('universe')">Universe</button>
        <button id="tab-world" onclick="showTab('world')">World</button>
        <button id="tab-oracle" onclick="showTab('oracle')">Oracle</button>
      </aside>
      <main class="stagecol">
        <section id="panel-start" class="panel active"><div id="startView"></div></section>
        <section id="panel-universe" class="panel"><div id="shelf" class="shelf"></div></section>
        <section id="panel-genesis" class="panel"><div id="stages"></div></section>
        <section id="panel-charge" class="panel"><div id="chargeBody"></div></section>
        <section id="panel-world" class="panel"><div id="worldView"></div></section>
        <section id="panel-oracle" class="panel"><div id="oracleView"></div></section>
        <section id="panel-bardo" class="panel"><div id="bardoView"></div></section>
      </main>
    </div>
    <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
    <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
    <input type="file" id="importUniverseInput" accept=".json,application/json" style="display:none">
    <div id="toast" class="toast"></div>`;
}

function tabIdsFromRail(win) {
  return [...win.document.querySelectorAll(".rail button[onclick]")].map((b) => {
    const m = /showTab\('([^']+)'\)/.exec(b.getAttribute("onclick") || "");
    return m ? m[1] : null;
  }).filter(Boolean);
}

// ---------- fixture world builder (pattern shared with verify-in-session-ui.mjs) ----------
function makeWorld(win) {
  const world = {
    id: "w-gauntlet", name: "The Gauntlet Testing Ground",
    seed: { master: { name: "Test Shrine", desc: "a place for asserting DOM" },
            smell: { name: "dust" }, sound: { name: "silence" }, arch: { name: "grey stone" },
            taboo: { name: "None", desc: "none" }, myth: { name: "None", desc: "none" },
            // handToDM() (src/world/handoff.js) reads seed.pressure/seed.faction directly — real
            // world-genesis (STAGES, data/creation-flow.js) always populates both; omitting them here
            // was a fixture gap that made a real handler falsely look broken.
            pressure: { name: "Test Pressure", desc: "a looming test deadline" },
            faction: { name: "Test Faction", desc: "a faction that exists for assertions" } },
    characters: [{ id: "c1", status: "living", name: "Gauntlet Test PC", headline: "a test soul", spark: "a test soul", pronouns: "they",
      sheet: {
        species: "Human", class: "Fighter", background: "Soldier", level: 3, xp: 900,
        hp: 28, hpCur: 20, ac: 16, tempHp: 0,
        profBonus: 2, scores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        mods: { str: 3, dex: 1, con: 2, int: 0, wis: 0, cha: 0 },
        saveProfs: ["str", "con"], skillProfs: ["Athletics", "Perception"],
        passivePerception: 12, hitDie: "d10", gold: 50,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id: "i1", name: "Longsword", conditions: [] }, { id: "i2", name: "Shield", conditions: [] }],
        equipped: {},
      },
    }],
    gazetteer: [], log: [], ledger: [], clock: { day: 3, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = "sheet"; win.GS.actionsTab = "actions";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  return world;
}

// ---------- deep snapshot / restore (handlers must not contaminate each other) ----------
function snapshot(win) {
  return {
    U: JSON.parse(JSON.stringify(win.U)),
    GS: JSON.parse(JSON.stringify(win.GS, (k, v) => (typeof v === "function" ? undefined : v))),
  };
}
function restore(win, snap) {
  win.U = JSON.parse(JSON.stringify(snap.U));
  // GS carries some function fields (poll timers etc) in real use; here it's plain data — deep-merge over defaults.
  const restored = JSON.parse(JSON.stringify(snap.GS));
  Object.keys(win.GS).forEach((k) => delete win.GS[k]);
  Object.assign(win.GS, restored);
}

// ---------- collect onclick elements across the whole document (or a scoped host) ----------
function collectOnclicks(win, hostSelector) {
  const root = hostSelector ? win.document.querySelector(hostSelector) : win.document;
  return root ? [...root.querySelectorAll("[onclick]")] : [];
}

// ---------- invoke one handler, catching + classifying ----------
function invokeHandler(win, el, context, resultsSet) {
  const src = el.getAttribute("onclick") || "";
  if (!src.trim()) return;
  const fakeEvent = { target: el, preventDefault() {}, stopPropagation() {} };
  let threw = null;
  try {
    win.eval(`(function(event){ ${src} \n})`)(fakeEvent);
  } catch (e) {
    threw = e;
  }
  resultsSet.push({ src, context, threw });
}

// in-session side panels opened via openPanel(name) (src/world/render.js gameRail) — swept only when
// the 'world' tab is active and a world/character exist, widening coverage beyond the bare Story view.
// "combat" added (G1 staging extension, docs/PRE-PLAYTEST-GAUNTLET.md floor fix): contexts (d)/(e)
// below set GS.combat before the world tab renders, so the existing per-context panel sweep picks up
// the combat-tracker's onclicks in the SAME pass as character/actions/map/powers, no separate loop needed.
const IN_SESSION_PANELS = ["character", "actions", "map", "powers", "combat"];

// ---------- main sweep ----------
function runContext(win, contextLabel, { destructive }) {
  mountAppChrome(win);
  win.confirm = destructive ? () => true : () => false;
  win.prompt = () => null;

  const tabIds = tabIdsFromRail(win);
  const invocations = [];

  for (const tabId of tabIds) {
    try { win.showTab(tabId); } catch (e) {
      addFinding({
        severity: /is not defined/.test(String(e)) ? "ugly" : "review",
        title: `showTab('${tabId}') threw in context ${contextLabel}`,
        symptom: String(e && e.message || e),
        context: contextLabel,
        stack: e && e.stack,
        collisionZone: isCollisionZone(e && e.stack, ""),
      });
      continue;
    }
    // also force-render the world/oracle views if the tab render didn't already (belt+suspenders —
    // showTab already dispatches per-tab renders per src/ui/chrome.js, but guard for future drift)
    const before = snapshot(win);
    const els = collectOnclicks(win);
    for (const el of els) {
      const snap = snapshot(win);
      invokeHandler(win, el, `${contextLabel}/tab=${tabId}`, invocations);
      restore(win, snap);
    }
    restore(win, before);

    // world tab: also sweep every in-session side panel (Character/Actions/Map/Powers) — each opens
    // a different onclick set (panelTabBar sub-tabs, item buttons, etc.) that the bare Story view
    // (gamePanel:null) never surfaces.
    if (tabId === "world" && win.activeWorld && win.activeWorld()) {
      for (const panelName of IN_SESSION_PANELS) {
        const panelBefore = snapshot(win);
        try {
          win.GS.gamePanel = panelName;
          win.renderWorld();
        } catch (e) {
          addFinding({
            severity: /is not defined/.test(String(e)) ? "ugly" : "review",
            title: `openPanel('${panelName}') render threw in context ${contextLabel}`,
            symptom: String(e && e.message || e),
            context: `${contextLabel}/panel=${panelName}`,
            stack: e && e.stack,
            collisionZone: isCollisionZone(e && e.stack, ""),
          });
          restore(win, panelBefore);
          continue;
        }
        const panelEls = collectOnclicks(win);
        for (const el of panelEls) {
          const snap = snapshot(win);
          invokeHandler(win, el, `${contextLabel}/tab=world/panel=${panelName}`, invocations);
          restore(win, snap);
        }
        restore(win, panelBefore);
      }
    }
  }

  return invocations;
}

// ---------- G1 STAGING EXTENSION (docs/PRE-PLAYTEST-GAUNTLET.md floor fix) ----------
// The original 3 contexts (a/b/c) only ever tab-switch + open the 4 basic side panels — they never
// stage GS.CGEN/GS.BARDO (guided creation), the combat tracker mid-fight, the dice overlay, the
// level-up picker, or any bardo/death/rebirth state, so every onclick reachable ONLY from inside
// those states was invisible to the sweep (the 9 cgChoose review findings + the sub-150 floor miss
// both trace to this one gap). sweepDoc(win, ...) is runContext's per-tab inner loop lifted out so a
// staged context can reuse the exact same collect→snapshot→invoke→restore discipline (spec §3
// rulings) without needing a tab to already be showing the state — the staged contexts below drive
// GS/DOM into the state directly (mirrors gauntlet-g8.mjs's stager pattern), then hand the resulting
// document to this sweep.
function sweepDoc(win, contextLabel, invocations, hostSelector, rerender) {
  const before = snapshot(win);
  // Index into a FRESH collectOnclicks() call every iteration (not one static array up front): a
  // working handler invoked mid-sweep can legitimately re-render its whole host (openPanel() always
  // replaces #worldView's entire subtree on a panel switch, same as it does in real play) — a static
  // snapshot of elements taken before that would hand later iterations detached DOM nodes, which
  // reads as a false "throws in every context" finding even though the handler never actually broke
  // (see gauntlet-report.json history: openPanel('character') mid-combat-tracker-sweep detached the
  // other 17 combat onclicks this exact way before this fix). `rerender` (when the caller supplies
  // one) re-establishes the state-matching DOM after restore() rewinds U/GS, so index i+1 always
  // reads the CURRENT live tree for this context rather than a stale pre-mutation one.
  let n = collectOnclicks(win, hostSelector).length;
  for (let i = 0; i < n; i++) {
    const els = collectOnclicks(win, hostSelector);
    if (i >= els.length) break; // a prior handler shrank the host's onclick count — nothing left to invoke
    const el = els[i];
    const snap = snapshot(win);
    invokeHandler(win, el, contextLabel, invocations);
    restore(win, snap);
    if (typeof rerender === "function") { try { rerender(); } catch (_) { /* best-effort re-render; a failure here surfaces as a mismatch on the NEXT iteration's own collect, not silently */ } }
  }
  restore(win, before);
  if (typeof rerender === "function") { try { rerender(); } catch (_) {} }
}

// (d) guided-creation mid-flow (GS.CGEN/GS.BARDO via startBardo) — sweeps EVERY bardo step type
// (choose/scores/skills/equipment/tools/languages/spells/feat/life/hometown/world/found) since each
// renders a materially different onclick set. This is what converts the 9 "review — guided-creation
// state absent" G1 findings into real invocations: cgChoose('species',...) etc. are only reachable
// with GS.BARDO genuinely live, which none of a/b/c ever established.
function stageGuidedCreation(win, contextLabel, invocations, destructive) {
  win.confirm = destructive ? () => true : () => false;
  win.U.worlds = {}; win.U.activeWorldId = null;
  win.startBardo(); // builds GS.CGEN/GS.BARDO, showTab('bardo'), renderBardo() — real entry point (src/creator/bardo.js)
  const seq = win.GS.BARDO.seq;
  // sweep the threshold card (i=0) first, then walk bardoBegin() onward through every seq step —
  // each step's onclicks (choose chips / 🎲 auto-fill / roll dice / toggle skill / etc.) differ by
  // step type, so re-render + re-collect at every index rather than trusting one snapshot to cover all.
  sweepDoc(win, `${contextLabel}/bardo-step=threshold`, invocations, "#bardoView", () => win.renderBardo());
  win.bardoBegin();
  for (let i = 0; i < seq.length && i < 40; i++) { // watchdog: buildBardoSeq() is bounded (~20-30 steps); 40 is generous headroom
    win.GS.BARDO.i = i;
    try { win.renderBardo(); } catch (e) {
      addFinding({
        severity: /is not defined/.test(String(e)) ? "ugly" : "review",
        title: `renderBardo() threw staging bardo step ${i} (${(seq[i] && seq[i].t) || "?"}) in context ${contextLabel}`,
        symptom: String((e && e.message) || e), context: contextLabel, stack: e && e.stack,
        collisionZone: isCollisionZone(e && e.stack, ""),
      });
      continue;
    }
    // scoped to #bardoView (not the whole document): the persistent rail chrome (showTab/newWorld/…)
    // is already fully covered by contexts a/b/c's tab iteration, and sharing a sweep pass with this
    // step-specific content risks a navigation handler (newWorld() rebuilds GS.BARDO from scratch)
    // detaching every element collected after it in the SAME pass — a snapshot-collection artifact,
    // not a real wiring defect (see sweepDoc's header comment).
    sweepDoc(win, `${contextLabel}/bardo-step=${(seq[i] && seq[i].t) || i}`, invocations, "#bardoView", () => { win.GS.BARDO.i = i; win.renderBardo(); });
    // auto-fill this step so the NEXT index's render reflects a step that's actually completable
    // (mirrors a player always taking "🎲 choose for me") — best-effort; a step this doesn't know
    // how to auto-fill just renders with nothing chosen, which is still a legitimate state to sweep.
    autoFillBardoStep(win, seq[i]);
  }
}

// best-effort "choose for me" for every bardo step type (src/creator/bardo.js step tour, §5 read).
// Not exhaustive of every life-event sub-branch (This Is Your Life can splice in extra steps at
// runtime) — anything unhandled here just leaves that step's choice unmade, which the sweep still
// stages+invokes; it only means bardoAdvance() may re-visit the same step next loop, which the i-cap
// watchdog above already bounds.
function autoFillBardoStep(win, step) {
  if (!step) return;
  try {
    if (step.t === "choose") { if (!win.GS.CGEN[step.field]) { const src = step.field === "species" ? win.SPECIES : step.field === "class" ? win.CLASSES : win.BACKGROUNDS; const k = Object.keys(src || {})[0]; if (k) win.cgChoose(step.field, k); } }
    else if (step.t === "scores") { while (win.GS.CGEN.scoreRolls.length < 6) win.bardoRollScore(); if (!win.GS.CGEN.assigned) win.bardoAssign("best"); }
    else if (step.t === "skills") win.cgSkillAuto();
    else if (step.t === "equipment") win.cgKitAuto();
    else if (step.t === "tools") win.cgToolsAuto();
    else if (step.t === "languages") win.cgLangAuto();
    else if (step.t === "spells") win.cgSpellsAuto();
    else if (step.t === "feat") win.cgFeatAuto();
    else if (step.t === "life") { if (!win.GS.CGEN.lifeQ) return; if (!win.GS.CGEN.lifeLog[win.GS.CGEN.lifeI]) win.bardoLifeRoll(); }
    else if (step.t === "hometown") { if (!win.GS.BARDO.rolled[step.key]) win.bardoRollHometown(); }
    else if (step.t === "world") { if (!win.GS.BARDO.rolled[step.key]) win.bardoRollWorld(); }
  } catch (e) { /* best-effort auto-fill; a failure here is caught by the NEXT step's own sweepDoc/renderBardo call */ }
}

// (e) combat tracker mid-fight, staged directly (not via IN_SESSION_PANELS, which needs an already-
// live world+panel context) — mirrors gauntlet-g8.mjs's "combat tracker mid-fight" stage.
function stageCombatTracker(win, world, contextLabel, invocations, destructive) {
  win.confirm = destructive ? () => true : () => false;
  win.GS.combat = {
    active: true, round: 2, side: "pc", first: "pc",
    pc: { band: "melee" },
    foes: [{ id: "f1", name: "Gauntlet Stage Foe", band: "melee", hp: 5, maxHp: 10 }],
    scene: { cover: {}, hazards: [], exits: [] },
  };
  win.openPanel(null); win.openPanel("combat");
  sweepDoc(win, contextLabel, invocations, "#worldView", () => { win.GS.gamePanel = "combat"; win.renderWorld(); });
  win.GS.combat = null;
}

// (f) dice overlay mid-roll — self-mounts to document.body (src/ui/dice.js), needs the rAF/matchMedia
// shims freshWin() now installs.
function stageDiceOverlay(win, contextLabel, invocations, destructive) {
  win.confirm = destructive ? () => true : () => false;
  try {
    win.diceOverlay({ title: "Perception check", resultLine: "14 total", dice: [{ sides: 20, result: 14 }] });
  } catch (e) {
    addFinding({
      severity: /is not defined/.test(String(e)) ? "ugly" : "review",
      title: `diceOverlay() threw staging the dice overlay in context ${contextLabel}`,
      symptom: String((e && e.message) || e), context: contextLabel, stack: e && e.stack,
      collisionZone: isCollisionZone(e && e.stack, ""),
    });
    return;
  }
  sweepDoc(win, contextLabel, invocations, "#diceOverlay");
}

// (g) level-up picker — caster (Wizard, hits the spell-pick branch) and martial (Fighter, hits the
// pure-ASI branch), mirrors gauntlet-g8.mjs's caster/martial split so both interactive spans are swept.
function stageLevelUpPicker(win, world, className, contextLabel, invocations, destructive) {
  win.confirm = destructive ? () => true : () => false;
  const c = world.characters[0];
  const savedSheet = JSON.parse(JSON.stringify(c.sheet));
  c.sheet.class = className;
  c.sheet.level = 2; c.sheet.choicesLevel = 2;
  c.sheet.level = 4; // owed picks 2→4 crosses every class's L4 ASI span (+ a caster spell-pick span for Wizard)
  let opened = false;
  try { opened = win.openLevelUp(world, c); } catch (e) {
    addFinding({
      severity: /is not defined/.test(String(e)) ? "ugly" : "review",
      title: `openLevelUp() threw staging the level-up picker (${className}) in context ${contextLabel}`,
      symptom: String((e && e.message) || e), context: contextLabel, stack: e && e.stack,
      collisionZone: isCollisionZone(e && e.stack, ""),
    });
    c.sheet = savedSheet;
    return;
  }
  if (opened) sweepDoc(win, contextLabel, invocations, "#levelBody", () => win.renderLevelUp());
  win.GS.LEVELUP = null;
  c.sheet = savedSheet;
}

// (h) bardo/death states: death-saves pips + the bardo passage (death/rebirth). killCharacter() calls
// window.prompt (stubbed null→"parts unknown" fallback, matches freshWin's global prompt stub), then
// openBardo→runBardo→renderBardoPassage populates #bardoBody with the passage's onclicks (closeBardo
// etc.) — the "bardo passage (death/rebirth)" state G8 stages but G1 never swept.
function stageDeathAndBardoPassage(win, world, contextLabel, invocations, destructive) {
  win.confirm = destructive ? () => true : () => false;
  const c = world.characters[0];
  // death saves pips, staged into a real host so the sweep can find any onclicks the pips carry
  try {
    win.startDeathSaves(c.sheet);
    const rerenderPips = () => { win.document.getElementById("worldView").innerHTML = win.cmDeathSavePips(c.sheet); };
    rerenderPips();
    sweepDoc(win, `${contextLabel}/death-saves`, invocations, "#worldView", rerenderPips);
  } catch (e) {
    addFinding({
      severity: /is not defined/.test(String(e)) ? "ugly" : "review",
      title: `death-saves staging threw in context ${contextLabel}`,
      symptom: String((e && e.message) || e), context: `${contextLabel}/death-saves`, stack: e && e.stack,
      collisionZone: isCollisionZone(e && e.stack, ""),
    });
  }
  // the bardo passage — drive killCharacter() for real (it stamps fallen + calls openBardo, which
  // renders #bardoBody + shows #bardoModal), then sweep the passage's onclicks.
  try {
    win.killCharacter(c.id);
    sweepDoc(win, `${contextLabel}/bardo-passage`, invocations, "#bardoBody");
  } catch (e) {
    addFinding({
      severity: /is not defined/.test(String(e)) ? "ugly" : "review",
      title: `killCharacter()/bardo passage threw in context ${contextLabel}`,
      symptom: String((e && e.message) || e), context: `${contextLabel}/bardo-passage`, stack: e && e.stack,
      collisionZone: isCollisionZone(e && e.stack, ""),
    });
  }
}

function classifyInvocations(invocations) {
  // group by handler source so we know, per handler, which contexts it was tried in and whether it
  // threw a ReferenceError (always ugly) vs some other error (ugly only if it fails EVERYWHERE it
  // was reachable; otherwise review, noting the context where required state was absent).
  const byHandler = new Map();
  for (const inv of invocations) {
    if (!byHandler.has(inv.src)) byHandler.set(inv.src, []);
    byHandler.get(inv.src).push(inv);
  }
  let handlersInvoked = 0;
  for (const [src, invs] of byHandler) {
    handlersInvoked += 1;
    const refErrors = invs.filter((i) => i.threw && /is not defined/.test(String(i.threw.message || i.threw)));
    if (refErrors.length > 0) {
      const e = refErrors[0].threw;
      // Use the identifier the engine itself names in the ReferenceError message ("<x> is not
      // defined") — NOT the handler's leading token, which is often a harmless prelude
      // (closeMenu();realCulprit()) and would mislabel the finding.
      const msg = String(e && e.message || e);
      const idMatch = /^([\w$.]+) is not defined$/.exec(msg);
      const missingId = idMatch ? idMatch[1] : extractFnName(src);
      addFinding({
        severity: "ugly",
        title: `Dead handler — ${missingId} is not defined (from: ${truncate(src)})`,
        symptom: msg,
        context: refErrors.map((r) => r.context).join(", "),
        handlerSrc: src,
        stack: e && e.stack,
        collisionZone: isCollisionZone(e && e.stack, src),
      });
      continue;
    }
    const throwing = invs.filter((i) => i.threw);
    if (throwing.length > 0 && throwing.length === invs.length) {
      const e = throwing[0].threw;
      const msg = String(e && e.message || e);
      // Spec ruling (§3): "a throw only where required state is absent → review, with the context
      // noted" — not ugly. These onclick sources belong to the guided-creation flow (GS.CGEN/
      // GS.BARDO) and only reach the DOM as stale leftovers from an earlier same-pass mutating call
      // (e.g. newWorld() populates GS.CGEN, then restore() resets it); the sweep's 3 contexts never
      // establish that flow as genuinely active, so this is a required-state gap in the sweep's
      // coverage, not a wiring defect in the handler itself.
      const isCreationFlowHandler = /^cgChoose\(|^cgSkill|^cgKit|^bardo[A-Z]/.test(src.trim());
      const isNullPropertyOnAbsentState = /Cannot (set|read) propert(y|ies) of (null|undefined)/.test(msg);
      if (isCreationFlowHandler && isNullPropertyOnAbsentState) {
        addFinding({
          severity: "review",
          title: `Handler requires guided-creation state absent in this sweep's contexts — ${truncate(src)}`,
          symptom: `${msg} — reachable only via GS.CGEN/GS.BARDO, which none of G1's 3 state contexts establish as live (spec §3 ruling: required-state-absent throws are review, not ugly)`,
          context: throwing.map((r) => r.context).join(", "),
          handlerSrc: src,
          stack: e && e.stack,
          collisionZone: isCollisionZone(e && e.stack, src),
        });
        continue;
      }
      addFinding({
        severity: "ugly",
        title: `Handler throws in every applicable context — ${truncate(src)}`,
        symptom: msg,
        context: throwing.map((r) => r.context).join(", "),
        handlerSrc: src,
        stack: e && e.stack,
        collisionZone: isCollisionZone(e && e.stack, src),
      });
    } else if (throwing.length > 0) {
      const e = throwing[0].threw;
      addFinding({
        severity: "review",
        title: `Handler throws in some contexts (state-dependent?) — ${truncate(src)}`,
        symptom: String(e && e.message || e),
        context: throwing.map((r) => r.context).join(", "),
        handlerSrc: src,
        stack: e && e.stack,
        collisionZone: isCollisionZone(e && e.stack, src),
      });
    }
  }
  return handlersInvoked;
}

function extractFnName(src) {
  const m = /^\s*([a-zA-Z_$][\w$]*)\s*\(/.exec(src);
  return m ? m[1] : truncate(src);
}
function truncate(s, n = 60) { return s.length > n ? s.slice(0, n) + "…" : s; }

// ---------- run ----------
let handlersInvokedTotal = 0;
let contextsRun = 0;
const contextInvocations = [];

try {
  // (a) fresh boot, no world
  {
    const win = freshWin();
    mountAppChrome(win);   // CANARY (if set) is injected by mountAppChrome itself — see its header comment
    win.migrateAll();
    win.showTab("start");
    contextsRun += 1;
    const invs = runContext(win, "fresh-boot", { destructive: false });
    contextInvocations.push(...invs);
    // pass B on same context: nothing destructive to distinguish at fresh-boot (no world), but keep
    // symmetry with (b)/(c) by re-running with confirm=true too.
    const invsB = runContext(win, "fresh-boot", { destructive: true });
    contextInvocations.push(...invsB);
  }

  // (b) mid-session fixture world
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    contextsRun += 1;
    const invsA = runContext(win, "mid-session", { destructive: false });
    contextInvocations.push(...invsA);
    const invsB = runContext(win, "mid-session-destructive", { destructive: true });
    contextInvocations.push(...invsB);
  }

  // (c) fixture world with a shop open (dev test-shop path, mirrors the "Open test shop" menu item)
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    const shopResult = win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
    if (!shopResult || !shopResult.ok) {
      addFinding({
        severity: "review",
        title: "G1 setup: open_shop event failed to open the dev test-shop context",
        symptom: JSON.stringify(shopResult),
        context: "shop-open-setup",
      });
    } else {
      win.GS.gamePanel = "shop";
    }
    contextsRun += 1;
    const invsA = runContext(win, "shop-open", { destructive: false });
    contextInvocations.push(...invsA);
    const invsB = runContext(win, "shop-open-destructive", { destructive: true });
    contextInvocations.push(...invsB);
  }

  // (d) guided-creation mid-flow — GS.CGEN/GS.BARDO genuinely live (docs/PRE-PLAYTEST-GAUNTLET.md
  // floor fix: this is what turns the 9 cgChoose "review" findings into real invocations).
  {
    const win = freshWin();
    mountAppChrome(win);
    contextsRun += 1;
    stageGuidedCreation(win, "guided-creation", contextInvocations, false);
  }
  {
    const win = freshWin();
    mountAppChrome(win);
    stageGuidedCreation(win, "guided-creation-destructive", contextInvocations, true);
  }

  // (e) combat tracker mid-fight, staged directly
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    contextsRun += 1;
    stageCombatTracker(win, world, "combat-tracker", contextInvocations, false);
  }
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    stageCombatTracker(win, world, "combat-tracker-destructive", contextInvocations, true);
  }

  // (f) dice overlay mid-roll
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    contextsRun += 1;
    stageDiceOverlay(win, "dice-overlay", contextInvocations, false);
  }

  // (g) level-up picker — caster (Wizard) + martial (Fighter)
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    contextsRun += 1;
    stageLevelUpPicker(win, world, "Wizard", "level-up-picker-caster", contextInvocations, false);
  }
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    stageLevelUpPicker(win, world, "Fighter", "level-up-picker-martial", contextInvocations, false);
  }
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    stageLevelUpPicker(win, world, "Wizard", "level-up-picker-caster-destructive", contextInvocations, true);
  }

  // (h) bardo/death states: death-saves pips + bardo passage
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    contextsRun += 1;
    stageDeathAndBardoPassage(win, world, "death-and-bardo-passage", contextInvocations, false);
  }
  {
    const win = freshWin();
    mountAppChrome(win);
    const world = makeWorld(win);
    win.showTab("world");
    stageDeathAndBardoPassage(win, world, "death-and-bardo-passage-destructive", contextInvocations, true);
  }

  handlersInvokedTotal = classifyInvocations(contextInvocations);

  if (handlersInvokedTotal < 150) {
    addFinding({
      severity: "review",
      title: `Sweep coverage below expected floor: ${handlersInvokedTotal} unique handlers invoked (expected ≥150)`,
      symptom: "The sweep may have missed states that expose more onclick handlers (see spec §3 acceptance).",
      context: "coverage",
    });
  }

  const stats = {
    contexts: contextsRun,
    handlersInvoked: handlersInvokedTotal,
    totalInvocations: contextInvocations.length,
  };

  writeReport({ status: "completed", invoked: handlersInvokedTotal, skipped: 0, stats });

  console.log(`\nG1 click sweep: ${contextsRun} contexts, ${handlersInvokedTotal} unique handlers, ${contextInvocations.length} total invocations.`);
  console.log(`Findings: ${findings.length} (${findings.map((f) => f.severity).join(", ") || "none"})`);
  if (CANARY) {
    if (findings.length > 0) {
      console.log("CANARY FIRED — ≥1 finding emitted as expected. Exiting 1 (canary run).");
      process.exit(1);
    } else {
      harnessDefect("CANARY DID NOT FIRE — gauntletNoSuchFn() should have produced ≥1 ugly finding. Detector is not trustworthy.");
    }
  } else {
    process.exit(0);
  }
} catch (e) {
  harnessDefect(`Unhandled throw in harness code: ${e && e.stack || e}`);
}
