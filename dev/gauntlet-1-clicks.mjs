/* GAUNTLET G1 — the click-everything sweep (docs/PRE-PLAYTEST-GAUNTLET.md §3)
   Wiring rot detector: every inline onclick in every reachable state, invoked, guarded.

   Boots the full app (real genesis.html module set, real load order) into jsdom, three times over
   for 3 state contexts:
     (a) fresh boot, no world
     (b) a mid-session fixture world (one living PC)
     (c) fixture world with a shop open (GS.shop-equivalent: open_shop event, dev test-shop path)
   For each context: iterate showTab(id) over every tab id present in the DOM's outer tab bar,
   render, then collect every [onclick] element on the page and invoke its handler in two passes —
   pass A stubs confirm()/prompt() to decline (nothing destructive fires), pass B accepts them
   against a throwaway world copy. State is snapshotted and restored around every single invocation
   so handlers can't contaminate each other.

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

// ---------- collect onclick elements across the whole document ----------
function collectOnclicks(win) {
  return [...win.document.querySelectorAll("[onclick]")];
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
const IN_SESSION_PANELS = ["character", "actions", "map", "powers"];

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
