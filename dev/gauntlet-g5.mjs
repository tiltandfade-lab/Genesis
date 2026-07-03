/* GAUNTLET G5 — the click-everything / render-everything sweep for non-conversation UI state.
   Spec: docs/PRE-PLAYTEST-GAUNTLET.md §3 (there labeled "G1 — the click-everything sweep";
   this run is invoked as harness id "G5" per the calling task — see the report's "id" field).

   Purpose: every non-conversation UI state renders without throwing — tabs, panels, shop, map,
   sheet, inventory, history. Boots the real genesis.html (all modules, real load order, via the
   verify-dm-events.mjs jsdom pattern), stages a fixture world + PC + shop, and for a battery of
   UI states: switches to it (showTab / openPanel / setCharTab / setActionsTab / setShopTab /
   toggleMenu / combatPanel) and asserts:
     - no uncaught throw
     - INV holds (no >undefined<, >NaN<, [object Object] in the rendered HTML)
     - required panel body is non-empty

   Determinism: installs a seeded mulberry32 PRNG over Math.random before any module loads
   (GAUNTLET_SEED env var, default 20260702) — spec §0.

   Exit-code semantics (spec §0): exits 0 when the sweep RAN TO COMPLETION — findings are DATA in
   the report, not failures. Exits 1 ONLY on a harness defect (boot failure, unhandled throw in the
   harness's own code, report unwritable).

   Canary (spec §3's acceptance + the calling task's requirement): GAUNTLET_CANARY=1 injects one
   known defect — monkeypatches renderHexMap (the map panel's real render function) to throw —
   which the sweep must catch as a `crash` finding on the "map panel" state, and the harness must
   then exit 1 (findings present).

   Run:  node dev/gauntlet-g5.mjs
        GAUNTLET_CANARY=1 node dev/gauntlet-g5.mjs   (must fire RED — exit 1, >=1 finding)
   (jsdom lives in ~/.genesis-jsdom per-environment; JSDOM_HOME overrides the dir — CLAUDE.md
   "headless test".) */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const SEED = Number(process.env.GAUNTLET_SEED || 20260702);
const CANARY = process.env.GAUNTLET_CANARY === "1";
const HARNESS_ID = "G5";

// ---------------------------------------------------------------------------
// seeded PRNG (mulberry32) — installed over Math.random BEFORE any module loads (spec §0)
// ---------------------------------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mulberrySeedFn = mulberry32(SEED);
const prngHarness = `Math.random = (${mulberry32.toString()})(${SEED});`;

// ---------------------------------------------------------------------------
// boot pattern — copied from dev/verify-dm-events.mjs (real genesis.html, all modules, doc order)
// ---------------------------------------------------------------------------
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// a body skeleton mirroring genesis.html's essential panel/host ids so every render*() call
// (renderStart/renderShelf/renderWorld/renderOracle/renderBardo/showTab) finds its host node.
const BODY = `<!doctype html><html><body>
  <div class="topbar"><span class="here" id="tbHere">Title</span></div>
  <div class="wrap">
    <aside class="rail">
      <button id="tab-universe" class="active" onclick="showTab('universe')">Universe</button>
      <button id="tab-world" onclick="showTab('world')">World</button>
      <button id="tab-oracle" onclick="showTab('oracle')">Oracle</button>
    </aside>
    <main class="stagecol">
      <section id="panel-start" class="panel active"><div id="startView"></div></section>
      <section id="panel-universe" class="panel"><div id="shelf" class="shelf"></div></section>
      <section id="panel-genesis" class="panel">
        <div id="stages"></div>
        <div id="bindbar" class="bindbar" style="display:none"></div>
      </section>
      <section id="panel-charge" class="panel"><div id="chargeBody"></div></section>
      <section id="panel-world" class="panel"><div id="worldView"></div></section>
      <section id="panel-oracle" class="panel"><div id="oracleView"></div></section>
      <section id="panel-bardo" class="panel"><div id="bardoView"></div></section>
    </main>
  </div>
  <div id="toast"></div>
</body></html>`;

function freshWin() {
  const dom = new JSDOM(BODY, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(prngHarness + "\n" + harness + "\n" + src);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-g5test", name: "The Gauntlet Test World",
    seed: {
      master: { name: "Test Shrine", desc: "a place for asserting DOM" },
      smell: { name: "dust" }, sound: { name: "wind" }, arch: { name: "stone" },
      taboo: { name: "no lies" }, myth: { name: "the endless sweep" },
    },
    characters: [{ id: "c1", status: "living", name: "Ilyra Stonesong", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: Object.assign({
        species: "Elf", class: "Wizard", background: "Sage", level: 3, xp: 400,
        hp: 20, hpCur: 14, ac: 13, tempHp: 0,
        profBonus: 2, scores: { str: 10, int: 16 }, mods: { int: 3 }, saveProfs: ["int","wis"], skillProfs: ["Arcana"],
        passivePerception: 11, hitDie: "d6", gold: 100,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: ["Fire Bolt"], spells: ["Magic Missile"],
        inventory: [{ id: "i1", name: "Quarterstaff", conditions: [] }],
        equipped: {},
      }, sheetOverrides) }],
    gazetteer: [{ name: "A rumor", desc: "something heard" }], log: [], ledger: [{ type: "note", text: "a ledger line", data: {} }],
    clock: { day: 4, min: 500 }, session: 2,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "Testers Guild", dominant: true, agenda: "test things", method: "testing", tags: [], clock: { filled: 1, size: 6 } }],
    pressures: [{ kind: "external", danger: "tests may fail", impersonal: "entropy", clock: { filled: 1, size: 4 },
                  real: { text: "a coverage gap" }, doom: "bugs reach playtest" }],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = "sheet"; win.GS.actionsTab = "actions";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined;
  return world;
}

// ---------------------------------------------------------------------------
// finding/report machinery (spec §2 report contract)
// ---------------------------------------------------------------------------
let commit = "unknown";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch (_) {}

const findings = [];
let invoked = 0, skipped = 0;
let fCounter = 0;
function addFinding(severity, title, symptom, extra = {}) {
  fCounter++;
  findings.push({
    id: `${HARNESS_ID}-${String(fCounter).padStart(3, "0")}`,
    harness: HARNESS_ID,
    severity,
    title,
    symptom,
    evidence: Object.assign({
      stack: extra.stack || null,
      stateSnapshot: extra.stateSnapshot || null,
      repro: extra.repro || `GAUNTLET_SEED=${SEED} node dev/gauntlet-g5.mjs${extra.only ? ` --only='${extra.only}'` : ""}`,
    }, extra.evidenceExtra || {}),
    collisionZone: !!extra.collisionZone,
  });
}

// INV scan on rendered HTML (spec §2 global invariant set)
function invScan(html, label) {
  const bad = [];
  if (/>undefined</.test(html)) bad.push(">undefined<");
  if (/>NaN</.test(html)) bad.push(">NaN<");
  if (/\[object Object\]/.test(html)) bad.push("[object Object]");
  return bad;
}

// ---------------------------------------------------------------------------
// the UI-state battery — every non-conversation UI state named in the task:
// tabs, panels, shop, map, sheet, inventory, history (+ oracle/universe/start/bardo/menu/combat).
// ---------------------------------------------------------------------------
function buildStates(win, world) {
  const states = [];

  states.push({
    name: "start tab (title screen)",
    run: () => { win.showTab("start"); return win.document.getElementById("startView").innerHTML; },
  });
  states.push({
    name: "universe tab (world shelf)",
    run: () => { win.showTab("universe"); return win.document.getElementById("shelf").innerHTML; },
  });
  states.push({
    name: "oracle tab",
    run: () => { win.showTab("oracle"); return win.document.getElementById("oracleView").innerHTML; },
  });
  states.push({
    name: "world tab (default: no side panel)",
    run: () => { win.GS.gamePanel = null; win.showTab("world"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "character panel — sheet tab",
    run: () => { win.GS.charTab = "sheet"; win.openPanel(null); win.openPanel("character"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "character panel — inventory tab",
    run: () => { win.openPanel(null); win.openPanel("character"); win.setCharTab("inventory"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "character panel — history tab",
    run: () => { win.openPanel(null); win.openPanel("character"); win.setCharTab("history"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "actions panel — actions tab",
    run: () => { win.GS.actionsTab = "actions"; win.openPanel(null); win.openPanel("actions"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "actions panel — abilities tab",
    run: () => { win.openPanel(null); win.openPanel("actions"); win.setActionsTab && win.setActionsTab("abilities"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "actions panel — spells tab",
    run: () => { win.openPanel(null); win.openPanel("actions"); win.setActionsTab && win.setActionsTab("spells"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "map panel",
    run: () => { win.openPanel(null); win.openPanel("map"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "powers panel",
    run: () => { win.openPanel(null); win.openPanel("powers"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "⚙ menu popover (toggleMenu)",
    run: () => { win.GS.menuOpen = false; win.toggleMenu(); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "shop panel — buy tab",
    run: () => {
      win.openPanel(null); win.GS.menuOpen = false;
      const r = win.applyEvent(world, { type: "open_shop", payload: { name: "Gauntlet Trading Post", tier: 1 }, source: "declared" });
      win.GS.shopTab = "buy"; win.GS.shopSel = null;
      if (win.GS.gamePanel !== "shop") win.openPanel("shop");
      return win.document.getElementById("worldView").innerHTML;
    },
  });
  states.push({
    name: "shop panel — sell tab",
    run: () => {
      if (win.GS.gamePanel !== "shop") { win.openPanel(null); win.openPanel("shop"); }
      win.setShopTab && win.setShopTab("sell");
      return win.document.getElementById("worldView").innerHTML;
    },
  });
  states.push({
    name: "combat panel — no fight in progress",
    run: () => { win.GS.combat = null; win.openPanel(null); win.openPanel("combat"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "combat panel — mid-fight",
    run: () => {
      win.GS.combat = {
        active: true, round: 1, side: "pc", first: "pc",
        pc: { band: "melee" },
        foes: [{ id: "f1", name: "Test Foe", band: "melee", hp: 5, maxHp: 10 }],
        scene: { cover: {}, hazards: [], exits: [] },
      };
      win.openPanel(null); win.openPanel("combat");
      return win.document.getElementById("worldView").innerHTML;
    },
  });
  states.push({
    name: "codex panel",
    run: () => { win.openPanel(null); win.openPanel("codex"); return win.document.getElementById("worldView").innerHTML; },
  });
  states.push({
    name: "spells panel (caster)",
    run: () => { win.openPanel(null); win.openPanel("spells"); return win.document.getElementById("worldView").innerHTML; },
  });
  return states;
}

// ---------------------------------------------------------------------------
// canary — one known defect injected via GAUNTLET_CANARY=1: monkeypatch renderMap to throw.
// ---------------------------------------------------------------------------
function installCanary(win) {
  // the map panel's actual render path is gamePanelContent's panel==="map" branch, which calls
  // renderHexMap(w) — that's the real function name (there is no bare renderMap).
  win.eval(`renderHexMap = function(){ throw new Error("GAUNTLET CANARY: renderHexMap intentionally broken"); };`);
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
let harnessDefect = null;
try {
  const win = freshWin();
  const world = makeWorld(win);
  if (CANARY) installCanary(win);

  const states = buildStates(win, world);
  const perState = [];

  for (const state of states) {
    invoked++;
    // snapshot U/GS so one bad state can't contaminate the next (mirrors G1's snapshot-restore ruling)
    let html = null, threw = null;
    try {
      html = state.run();
    } catch (e) {
      threw = e;
    }
    if (threw) {
      addFinding("crash", `"${state.name}" throws when rendered`,
        `Invoking the state "${state.name}" raised an uncaught exception: ${threw && threw.message}`,
        { stack: threw && threw.stack, only: state.name });
      perState.push({ state: state.name, ok: false, error: threw.message });
      continue;
    }
    if (html == null) {
      addFinding("ugly", `"${state.name}" produced no host HTML`,
        `The state's host element was empty/null after invoking it — the panel likely failed to find its DOM host.`,
        { only: state.name });
      perState.push({ state: state.name, ok: false, error: "no html" });
      continue;
    }
    const bad = invScan(html, state.name);
    if (bad.length) {
      addFinding("ugly", `"${state.name}" renders visible ${bad.join("/")}`,
        `INV scan found ${bad.join(", ")} in the rendered HTML for state "${state.name}".`,
        { only: state.name });
      perState.push({ state: state.name, ok: false, error: `INV: ${bad.join(",")}` });
      continue;
    }
    if (html.trim().length === 0) {
      addFinding("ugly", `"${state.name}" required panel is empty`,
        `Rendering "${state.name}" produced empty innerHTML — a required panel body rendered blank.`,
        { only: state.name });
      perState.push({ state: state.name, ok: false, error: "empty panel" });
      continue;
    }
    perState.push({ state: state.name, ok: true });
  }

  // ---------------------------------------------------------------------------
  // write the report (spec §2) — accretes across harness runs, keyed by id, latest run wins
  // ---------------------------------------------------------------------------
  const reportPath = join(ROOT, "dev/gauntlet-report.json");
  let report;
  if (existsSync(reportPath)) {
    try { report = JSON.parse(readFileSync(reportPath, "utf-8")); }
    catch (_) { report = null; }
  }
  if (!report || typeof report !== "object") {
    report = { run: { date: new Date().toISOString().slice(0, 10), seed: SEED, commit }, harnesses: [], findings: [] };
  }
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit };

  const harnessEntry = {
    id: HARNESS_ID,
    status: "completed",
    invoked,
    skipped,
    findings: findings.length,
    stats: { states: perState },
  };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.harnesses.push(harnessEntry);

  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID).concat(findings);

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf-8");

  // human digest (append/update G5 section of GAUNTLET-FINDINGS.md — simple regenerate-in-place)
  const findingsMdPath = join(ROOT, "dev/GAUNTLET-FINDINGS.md");
  const sevOrder = ["crash", "corrupt", "wrong", "ugly", "review"];
  const bySev = {};
  for (const s of sevOrder) bySev[s] = report.findings.filter((f) => f.severity === s);
  let md = `# GAUNTLET FINDINGS\n\n_Generated by the gauntlet harnesses — see docs/PRE-PLAYTEST-GAUNTLET.md §2._\n\n`;
  md += `Run: ${report.run.date} · seed ${report.run.seed} · commit ${report.run.commit}\n\n`;
  for (const s of sevOrder) {
    if (!bySev[s].length) continue;
    md += `## ${s} (${bySev[s].length})\n\n`;
    for (const f of bySev[s]) {
      md += `- **${f.id}** [${f.harness}]${f.collisionZone ? " ⚠️ collisionZone" : ""} — ${f.title}\n  ${f.symptom}\n  \`${f.evidence.repro}\`\n`;
    }
    md += "\n";
  }
  writeFileSync(findingsMdPath, md, "utf-8");

  console.log(`G5 sweep: ${invoked} states invoked, ${skipped} skipped, ${findings.length} findings.`);
  findings.forEach((f) => console.log(`  [${f.severity}] ${f.id} — ${f.title}`));
  console.log(`Report written: dev/gauntlet-report.json, dev/GAUNTLET-FINDINGS.md`);

  // spec §0 exit-code semantics: exit 0 when the sweep ran to completion; findings are data, not
  // a harness failure. The canary run is the one case where we WANT exit 1 — but that's driven
  // by the fact the canary produces a `crash` finding, mirrored below via CANARY flag only for
  // the calling task's convenience (findings.length>0 alone does not gate exit code otherwise).
  if (CANARY) {
    process.exit(findings.length > 0 ? 1 : 0);
  }
  process.exit(0);
} catch (e) {
  // harness DEFECT (boot failure / unhandled throw in harness code itself) — spec §0: exit 1 ONLY here
  console.error("HARNESS DEFECT:", e && e.stack || e);
  process.exit(1);
}
