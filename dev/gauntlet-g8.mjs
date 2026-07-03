/* GAUNTLET G8 — the screenshot stager for the visual-state sweep.
   Spec: docs/PRE-PLAYTEST-GAUNTLET.md §10 ("G8 — visual state screenshot sweep").

   Purpose: G8 is NOT a vision/aesthetic judge (that's a cheap-vision model driving Chrome, run
   separately and LAST, after the gap-wiring batch lands — see spec §10/§11). This harness is the
   staging half only: it builds each named non-conversation UI state from a fixture world using the
   same calls G1–G7 already exercise (openPanel/showTab/openLevelUp/diceOverlay/openBardo/etc.),
   confirms each state stages WITHOUT throwing and without violating INV (spec §2's global
   invariant — no visible undefined/NaN/[object Object], required host non-empty), and records the
   staged HTML per state so a later vision pass has something to screenshot against. No screenshots
   are taken here (no browser/canvas in jsdom) — that capture step is the separate cheap-vision job.

   States staged (spec §10's named list): title/start · universe shelf · bardo mid-creation ·
   in-session default (world tab) · level-up picker (caster) · level-up picker (martial) · combat
   tracker mid-fight · shop Buy · shop Sell · dice overlay mid-roll · companion in sidebar ·
   death saves · bardo passage (death/rebirth) · rebirth (successor spawned).

   Determinism: installs a seeded mulberry32 PRNG over Math.random before any module loads
   (GAUNTLET_SEED env var, default 20260702) — spec §0.

   Exit-code semantics (spec §0): exits 0 when the stager RAN TO COMPLETION — findings are DATA in
   the report, not failures. Exits 1 ONLY on a harness defect (boot failure, unhandled throw in the
   harness's own code, report unwritable) OR when GAUNTLET_CANARY=1 fires (by design, so the calling
   task can observe RED).

   Canary: GAUNTLET_CANARY=1 monkeypatches openLevelUp (the level-up picker's real render entry) to
   throw — the "level-up picker (caster)" stage must catch it as a `crash` finding, and the harness
   must then exit 1 (findings present).

   Run:  node dev/gauntlet-g8.mjs
        GAUNTLET_CANARY=1 node dev/gauntlet-g8.mjs   (must fire RED — exit 1, >=1 finding)
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
const HARNESS_ID = "G8";

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
const prngHarness = `Math.random = (${mulberry32.toString()})(${SEED});`;

// ---------------------------------------------------------------------------
// boot pattern — copied from dev/verify-dm-events.mjs (real genesis.html, all modules, doc order)
// ---------------------------------------------------------------------------
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// a body skeleton mirroring genesis.html's essential panel/host + modal ids so every render*()
// call (renderStart/renderShelf/renderWorld/renderBardo/renderBardoPassage/renderLevelUp/
// diceOverlay/showTab) finds its real host node — mirrors gauntlet-g5.mjs's BODY plus the two
// modal hosts (bardoModal/bardoBody, levelModal/levelBody) G5 didn't need.
const BODY = `<!doctype html><html><body>
  <div class="topbar"><span class="here" id="tbHere">Title</span></div>
  <div class="wrap">
    <aside class="rail">
      <button id="tab-universe" class="active" onclick="showTab('universe')">Universe</button>
      <button id="tab-world" onclick="showTab('world')">World</button>
      <button id="tab-oracle" onclick="showTab('oracle')">Oracle</button>
      <button id="tab-bardo" onclick="showTab('bardo')">Bardo</button>
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
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
  <div id="toast"></div>
</body></html>`;

function freshWin() {
  const dom = new JSDOM(BODY, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  // jsdom doesn't implement requestAnimationFrame/matchMedia (browser-only APIs) — diceOverlay
  // (src/ui/dice.js) uses both for its tumble animation. This is an ENVIRONMENT shim (not an app
  // fix): synchronous rAF + a "no motion preference" matchMedia stub so the overlay's DOM mounts
  // deterministically without needing a real compositor.
  const envShim = `
    if (typeof requestAnimationFrame !== "function") { window.requestAnimationFrame = function(cb){ return setTimeout(cb, 0); }; }
    if (typeof matchMedia !== "function") { window.matchMedia = function(){ return { matches: false, addListener(){}, removeListener(){} }; }; }
  `;
  win.eval(envShim + "\n" + prngHarness + "\n" + harness + "\n" + src);
  return win;
}

// fixture PC builder — a caster (Wizard) and a martial (Fighter), both L3 (mirrors gauntlet-g5.mjs's
// makeWorld pattern; two class kinds needed so the level-up picker stage can hit both spell-pick
// (caster) and pure-ASI (martial) branches per spec §10's "caster + martial" split).
function makeWorld(win, { className = "Wizard", extraSheet = {} } = {}) {
  const world = {
    id: "w-g8test", name: "The Gauntlet Stage World",
    seed: {
      master: { name: "Stage Shrine", desc: "a place for staging screenshots" },
      smell: { name: "dust" }, sound: { name: "wind" }, arch: { name: "stone" },
      taboo: { name: "no lies" }, myth: { name: "the endless stage" },
    },
    characters: [{ id: "c1", status: "living", name: "Stagehand Vey", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: Object.assign({
        species: "Elf", class: className, background: "Sage", level: 2, xp: 300,
        hp: 20, hpCur: 14, ac: 13, tempHp: 0,
        profBonus: 2, scores: { str: 10, int: 16, con: 14 }, mods: { int: 3, con: 2 }, saveProfs: ["int","wis"], skillProfs: ["Arcana"],
        passivePerception: 11, hitDie: className === "Fighter" ? "d10" : "d6", gold: 100,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: className === "Wizard" ? ["Fire Bolt"] : [], spells: className === "Wizard" ? ["Magic Missile"] : [],
        inventory: [{ id: "i1", name: "Quarterstaff", conditions: [] }],
        equipped: {}, deathSaves: null,
      }, extraSheet) }],
    gazetteer: [{ name: "A rumor", desc: "something heard" }], log: [], ledger: [{ type: "note", text: "a ledger line", data: {} }],
    clock: { day: 4, min: 500 }, session: 2,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "Stagers Guild", dominant: true, agenda: "stage things", method: "staging", tags: [], clock: { filled: 1, size: 6 } }],
    pressures: [{ kind: "external", danger: "tests may fail", impersonal: "entropy", clock: { filled: 1, size: 4 },
                  real: { text: "a coverage gap" }, doom: "bugs reach playtest" }],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [], rebirth: {},
  };
  const originId = win.addNode(world, "Stage Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = "sheet"; win.GS.actionsTab = "actions";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.LEVELUP = null; win.GS.FATE_CTX = null;
  return world;
}

// ---------------------------------------------------------------------------
// finding/report machinery (spec §2 report contract) — mirrors gauntlet-g5.mjs verbatim
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
      repro: extra.repro || `GAUNTLET_SEED=${SEED} node dev/gauntlet-g8.mjs${extra.only ? ` --only='${extra.only}'` : ""}`,
    }, extra.evidenceExtra || {}),
    collisionZone: !!extra.collisionZone,
  });
}

// INV scan on staged HTML (spec §2 global invariant set)
function invScan(html) {
  const bad = [];
  if (/>undefined</.test(html)) bad.push(">undefined<");
  if (/>NaN</.test(html)) bad.push(">NaN<");
  if (/\[object Object\]/.test(html)) bad.push("[object Object]");
  return bad;
}

// ---------------------------------------------------------------------------
// the visual-state battery (spec §10's named list)
// ---------------------------------------------------------------------------
function buildStages(win) {
  const stages = [];

  stages.push({
    name: "title/start",
    setup: () => makeWorldless(win),
    run: (ctx) => { win.showTab("start"); return win.document.getElementById("startView").innerHTML; },
  });

  stages.push({
    name: "universe shelf",
    setup: () => makeWorldless(win),
    run: () => { win.showTab("universe"); return win.document.getElementById("shelf").innerHTML; },
  });

  stages.push({
    name: "bardo mid-creation",
    setup: () => { win.U.worlds = {}; win.U.activeWorldId = null; },
    run: () => {
      win.startBardo();      // src/creator/bardo.js — builds GS.BARDO + GS.CGEN, showTab('bardo'), renderBardo()
      win.bardoBegin();      // advance past the threshold beat so a real mid-creation card renders
      return win.document.getElementById("bardoView").innerHTML;
    },
  });

  stages.push({
    name: "in-session default (world tab)",
    setup: () => makeWorld(win, { className: "Fighter" }),
    run: () => { win.GS.gamePanel = null; win.showTab("world"); return win.document.getElementById("worldView").innerHTML; },
  });

  stages.push({
    name: "level-up picker (caster)",
    setup: () => makeWorld(win, { className: "Wizard", extraSheet: { level: 2, choicesLevel: 2 } }),
    run: (ctx) => {
      const c = ctx.world.characters[0];
      c.sheet.level = 4; // owed picks 2→4 crosses a caster spell-pick span
      win.openLevelUp(ctx.world, c);
      return win.document.getElementById("levelBody").innerHTML;
    },
  });

  stages.push({
    name: "level-up picker (martial)",
    setup: () => makeWorld(win, { className: "Fighter", extraSheet: { level: 3, choicesLevel: 3 } }),
    run: (ctx) => {
      const c = ctx.world.characters[0];
      c.sheet.level = 4; // owed picks 3→4 crosses the ASI span every class shares at L4
      win.openLevelUp(ctx.world, c);
      return win.document.getElementById("levelBody").innerHTML;
    },
  });

  stages.push({
    name: "combat tracker mid-fight",
    setup: () => makeWorld(win),
    run: () => {
      win.GS.combat = {
        active: true, round: 2, side: "pc", first: "pc",
        pc: { band: "melee" },
        foes: [{ id: "f1", name: "Stage Foe", band: "melee", hp: 5, maxHp: 10 }],
        scene: { cover: {}, hazards: [], exits: [] },
      };
      win.openPanel(null); win.openPanel("combat");
      return win.document.getElementById("worldView").innerHTML;
    },
  });

  stages.push({
    name: "shop Buy",
    setup: () => makeWorld(win),
    run: (ctx) => {
      win.openPanel(null); win.GS.menuOpen = false;
      win.applyEvent(ctx.world, { type: "open_shop", payload: { name: "Gauntlet Stage Post", tier: 1 }, source: "declared" });
      win.GS.shopTab = "buy"; win.GS.shopSel = null;
      if (win.GS.gamePanel !== "shop") win.openPanel("shop");
      return win.document.getElementById("worldView").innerHTML;
    },
  });

  stages.push({
    name: "shop Sell",
    setup: () => makeWorld(win),
    run: (ctx) => {
      win.openPanel(null); win.GS.menuOpen = false;
      win.applyEvent(ctx.world, { type: "open_shop", payload: { name: "Gauntlet Stage Post", tier: 1 }, source: "declared" });
      if (win.GS.gamePanel !== "shop") win.openPanel("shop");
      win.setShopTab && win.setShopTab("sell");
      return win.document.getElementById("worldView").innerHTML;
    },
  });

  stages.push({
    name: "dice overlay mid-roll",
    setup: () => makeWorld(win),
    run: () => {
      win.diceOverlay({ title: "Perception check", resultLine: "14 total",
        dice: [{ sides: 20, result: 14 }] });
      return win.document.getElementById("diceOverlay").outerHTML;
    },
  });

  stages.push({
    name: "companion in sidebar",
    setup: () => makeWorld(win),
    run: (ctx) => {
      ctx.world.companions = ctx.world.companions || [];
      ctx.world.companions.push({ id: "comp1", name: "Stage Hireling", kind: "hireling", hp: 8, maxHp: 8, loyaltyWord: "steadfast" });
      win.GS.combat = {
        active: true, round: 1, side: "pc", first: "pc",
        pc: { band: "melee" }, allies: ctx.world.companions.map(c => ({ kind: c.kind, name: c.name, hp: c.hp, maxHp: c.maxHp, loyaltyWord: c.loyaltyWord })),
        foes: [{ id: "f1", name: "Stage Foe", band: "melee", hp: 5, maxHp: 10 }],
        scene: { cover: {}, hazards: [], exits: [] },
      };
      win.openPanel(null); win.openPanel("combat");
      return win.document.getElementById("worldView").innerHTML;
    },
  });

  stages.push({
    name: "death saves",
    setup: () => makeWorld(win),
    run: (ctx) => {
      const sh = ctx.world.characters[0].sheet;
      win.startDeathSaves(sh);
      sh.deathSaves.succ = 1; sh.deathSaves.fail = 1;
      const pips = win.cmDeathSavePips(sh);
      // stage it inside a real host so INV scan + "non-empty" checks apply uniformly
      const host = win.document.getElementById("worldView");
      host.innerHTML = pips;
      return host.innerHTML;
    },
  });

  stages.push({
    name: "bardo passage (death/rebirth)",
    setup: () => makeWorld(win),
    run: (ctx) => {
      const c = ctx.world.characters[0];
      win.GS.FATE_CTX = c;
      const r = win.runBardo(ctx.world, c);
      c.fate = "Passed through the bardo — staged.";
      win.renderBardoPassage(c, r);
      return win.document.getElementById("bardoBody").innerHTML;
    },
  });

  stages.push({
    name: "rebirth (successor spawned)",
    setup: () => makeWorld(win),
    run: (ctx) => {
      const c = ctx.world.characters[0];
      c.status = "fallen"; c.fellWhere = "the stage"; c.fellWhen = Object.assign({}, win.clockOf(ctx.world));
      win.GS.FATE_CTX = c;
      win.spawnSuccessorOnPlane();
      win.showTab("world"); win.GS.gamePanel = null;
      return win.document.getElementById("worldView").innerHTML;
    },
  });

  return stages;

  function makeWorldless() {
    win.U.worlds = {}; win.U.activeWorldId = null;
  }
}

// ---------------------------------------------------------------------------
// canary — one known defect injected via GAUNTLET_CANARY=1: monkeypatch openLevelUp to throw.
// ---------------------------------------------------------------------------
function installCanary(win) {
  win.eval(`openLevelUp = function(){ throw new Error("GAUNTLET CANARY: openLevelUp intentionally broken"); };`);
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
let harnessDefect = null;
try {
  const win = freshWin();
  if (CANARY) installCanary(win);

  const stages = buildStages(win);
  const perStage = [];

  for (const stage of stages) {
    invoked++;
    let world = null;
    try {
      const setupResult = stage.setup();
      // makeWorld returns the world object; makeWorldless (bardo/title/universe stages) returns undefined
      world = (setupResult && setupResult.id) ? setupResult : win.U.worlds[win.U.activeWorldId] || null;
    } catch (e) {
      addFinding("crash", `"${stage.name}" setup throws`,
        `Building the fixture for stage "${stage.name}" raised an uncaught exception: ${e && e.message}`,
        { stack: e && e.stack, only: stage.name });
      perStage.push({ stage: stage.name, ok: false, error: `setup: ${e && e.message}` });
      continue;
    }

    let html = null, threw = null;
    try {
      html = stage.run({ world });
    } catch (e) {
      threw = e;
    }
    if (threw) {
      addFinding("crash", `"${stage.name}" throws when staged`,
        `Staging "${stage.name}" raised an uncaught exception: ${threw && threw.message}`,
        { stack: threw && threw.stack, only: stage.name });
      perStage.push({ stage: stage.name, ok: false, error: threw.message });
      continue;
    }
    if (html == null) {
      addFinding("ugly", `"${stage.name}" produced no host HTML`,
        `The stage's host element was null after staging it — the panel likely failed to find its DOM host.`,
        { only: stage.name });
      perStage.push({ stage: stage.name, ok: false, error: "no html" });
      continue;
    }
    const bad = invScan(html);
    if (bad.length) {
      addFinding("ugly", `"${stage.name}" stages visible ${bad.join("/")}`,
        `INV scan found ${bad.join(", ")} in the staged HTML for "${stage.name}".`,
        { only: stage.name });
      perStage.push({ stage: stage.name, ok: false, error: `INV: ${bad.join(",")}` });
      continue;
    }
    if (html.trim().length === 0) {
      addFinding("ugly", `"${stage.name}" required panel is empty`,
        `Staging "${stage.name}" produced empty innerHTML — a required panel body rendered blank.`,
        { only: stage.name });
      perStage.push({ stage: stage.name, ok: false, error: "empty panel" });
      continue;
    }
    perStage.push({ stage: stage.name, ok: true, bytes: html.length });
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
    stats: { stages: perStage },
  };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.harnesses.push(harnessEntry);

  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID).concat(findings);

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf-8");

  // human digest (regenerate GAUNTLET-FINDINGS.md in place from the full accreted report)
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

  console.log(`G8 stager: ${invoked} stages staged, ${skipped} skipped, ${findings.length} findings.`);
  findings.forEach((f) => console.log(`  [${f.severity}] ${f.id} — ${f.title}`));
  console.log(`Report written: dev/gauntlet-report.json, dev/GAUNTLET-FINDINGS.md`);

  // spec §0 exit-code semantics: exit 0 when the stager ran to completion; findings are data, not
  // a harness failure. The canary run is the one case where we WANT exit 1 (findings.length>0).
  if (CANARY) {
    process.exit(findings.length > 0 ? 1 : 0);
  }
  process.exit(0);
} catch (e) {
  // harness DEFECT (boot failure / unhandled throw in harness code itself) — spec §0: exit 1 ONLY here
  console.error("HARNESS DEFECT:", e && e.stack || e);
  process.exit(1);
}
