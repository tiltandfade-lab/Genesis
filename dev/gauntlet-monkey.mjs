/* GAUNTLET MONKEY SESSION (docs/PRE-PLAYTEST-GAUNTLET.md §7's full-flow harness, item 2 of the
   Layer-0 coverage-debt batch — see the calling task).

   Drives a COMPLETE headless session loop for N=12 lives (one per SRD base class), with
   seeded-random action choices at every branch point: new world → full guided-creation (every bardo
   step type walked, the "🎲 choose for me" path taken throughout) → travel walk → forced encounter →
   combat → loot → shop (buy + sell) → rest → level-up (when owed) → loop steps 2-7 until the PC dies
   naturally or a 25-iteration watchdog forces it → death saves → bardo passage → successor spawned
   in the SAME world → save/load round-trip. Any uncaught throw or state-invariant (INV, spec §2)
   violation is a finding — this harness DETECTS ONLY, it fixes nothing (spec §0 rung 1).

   Boot pattern copied from dev/verify-dm-events.mjs (real genesis.html, all modules, real load
   order, one eval so classic-script top-level const/function share scope).

   Determinism: GAUNTLET_SEED (default 20260702) seeds a mulberry32 PRNG installed over Math.random
   BEFORE any module loads. A SECOND, harness-owned mulberry32 stream (seeded from the same value,
   offset by a fixed constant) drives every "seeded-random action choice" this harness itself makes
   (which class goes next is fixed/ordered, but choices WITHIN a life — which shop line to buy, which
   loot to equip, etc — draw from this stream) so a re-run at the same seed reproduces the same life
   exactly, and the two PRNG streams (the app's dice vs the harness's own decisions) never collide.

   Exit-code semantics (spec §0): exit 0 when the harness RAN TO COMPLETION — findings are DATA in
   the report, not test failures. Exit 1 ONLY on a harness defect (boot failure, unhandled harness
   throw, report unwritable) OR the canary run (which deliberately wants to observe RED).

   Canary (GAUNTLET_CANARY=1): monkeypatches awardXp to set sh.xp=NaN (spec §7's own canary spec for
   this exact harness) — must be caught as a `corrupt` INV violation at the first XP-awarding combat
   win, and the harness must then exit 1 (findings present, detector proven to fire red).

   Run:    node dev/gauntlet-monkey.mjs
   Canary: GAUNTLET_CANARY=1 node dev/gauntlet-monkey.mjs
   Repro one class only: node dev/gauntlet-monkey.mjs --only=Wizard
   (jsdom lives in ~/.genesis-jsdom per-environment; JSDOM_HOME overrides the dir.) */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const HARNESS_ID = "MONKEY";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const SEED = Number(process.env.GAUNTLET_SEED || 20260702);
const CANARY = process.env.GAUNTLET_CANARY === "1";
const ONLY = (() => { const a = process.argv.find((x) => x.startsWith("--only=")); return a ? a.slice(7) : null; })();
const LOOP_WATCHDOG = 25; // spec §7 step 8

// ---------- mulberry32, determinism (spec §0) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// the harness's OWN decision stream — separate from the app's Math.random (installed into the jsdom
// window below) so the two never collide; offset constant keeps it deterministic but distinct.
const decide = mulberry32(SEED + 0x51ee7);
const pickOne = (arr) => arr[Math.floor(decide() * arr.length)];

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
try {
  ({ JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom"));
} catch (e) {
  harnessDefect(`jsdom not found at ${JSDOM_HOME} — npm i jsdom there first (CLAUDE.md "headless test"). ${e.message}`);
}

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harnessGlobals = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;
// top-level `const`/`function` in the concatenated module source do NOT attach to `window` in a
// classic-script eval (the "const-via-eval" gotcha, CLAUDE.md "headless test" + gauntlet-2-combat.mjs's
// own bridge for BESTIARY/CLASSES) — bridge the specific consts this harness reads directly off
// `win.*` (SPECIES/BACKGROUNDS for the choose-step auto-fill) back onto window explicitly.
const bridgeTail = `\nwindow.SPECIES=SPECIES; window.BACKGROUNDS=BACKGROUNDS; window.CLASSES=CLASSES;`;

let commit = "unknown";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

// ---------- report accumulation (spec §2) ----------
const findings = [];
let findingSeq = 0;
function addFinding({ severity, title, symptom, evidenceExtra, stack, collisionZone, cls, step }) {
  findingSeq += 1;
  const id = `${HARNESS_ID}-${String(findingSeq).padStart(3, "0")}`;
  findings.push({
    id, harness: HARNESS_ID, severity, title, symptom,
    evidence: Object.assign({
      stack: stack || null,
      stateSnapshot: null,
      repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-monkey.mjs${cls ? ` --only=${cls}` : ""}`,
    }, evidenceExtra || {}),
    ...(collisionZone ? { collisionZone: true } : {}),
  });
  return id;
}
function harnessDefect(msg) {
  console.error(`[MONKEY HARNESS DEFECT] ${msg}`);
  writeReport({ status: "harness-defect", error: msg, invoked: 0, skipped: 0 });
  process.exit(1);
}

const COLLISION_FILES = ["src/world/gap-wiring.js", "src/engine/combat.js", "manifest.json"];
function isCollisionZone(stack) { return COLLISION_FILES.some((f) => (stack || "").includes(f)); }

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
    ...(extra.error ? { error: extra.error } : {}),
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
  const lines = [`# GAUNTLET-FINDINGS.md`, ``, `Auto-generated from dev/gauntlet-report.json. Do not hand-edit.`, ``,
    `Run: ${report.run.date} · seed ${report.run.seed} · commit ${report.run.commit}`, ``];
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

// ---------- INV assertion (spec §2 global invariant set) ----------
function assertInv(win, w, cls, step) {
  const problems = [];
  const c = (w.characters || []).filter((x) => x.status === "living").slice(-1)[0];
  if (c && c.sheet) {
    const sh = c.sheet;
    if (sh.hpCur != null && !Number.isFinite(sh.hpCur)) problems.push(`hpCur not finite (${sh.hpCur})`);
    if (sh.hpCur != null && sh.hp != null && Number.isFinite(sh.hpCur) && Number.isFinite(sh.hp) && sh.hpCur > sh.hp) problems.push(`hpCur (${sh.hpCur}) > max hp (${sh.hp})`);
    if (sh.gold != null && (!Number.isFinite(sh.gold) || sh.gold < 0)) problems.push(`gold not finite/negative (${sh.gold})`);
    if (sh.inventory != null && !Array.isArray(sh.inventory)) problems.push(`inventory is not an Array`);
    if (Array.isArray(sh.inventory) && sh.inventory.some((it) => it == null)) problems.push(`inventory contains a null/undefined entry`);
  }
  if (w.clock && typeof w.__lastClockTotal === "number") {
    const total = w.clock.day * 1440 + w.clock.min;
    if (total < w.__lastClockTotal) problems.push(`world clock decreased (${w.__lastClockTotal} -> ${total})`);
  }
  if (w.clock) w.__lastClockTotal = w.clock.day * 1440 + w.clock.min;
  try { JSON.stringify(w); } catch (e) { problems.push(`JSON.stringify(w) failed: ${e.message}`); }
  if (problems.length) {
    addFinding({
      severity: "corrupt",
      title: `INV violated for ${cls} at step "${step}"`,
      symptom: problems.join("; "),
      cls, step,
    });
  }
  return problems.length === 0;
}

// ---------- jsdom boot ----------
function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body>
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
        <section id="panel-genesis" class="panel"><div id="stages"></div><div id="bindbar" class="bindbar" style="display:none"></div></section>
        <section id="panel-charge" class="panel"><div id="chargeBody"></div></section>
        <section id="panel-world" class="panel"><div id="worldView"></div></section>
        <section id="panel-oracle" class="panel"><div id="oracleView"></div></section>
        <section id="panel-bardo" class="panel"><div id="bardoView"></div></section>
      </main>
    </div>
    <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
    <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
    <input type="file" id="importUniverseInput" accept=".json,application/json" style="display:none">
    <div id="toast" class="toast"></div>
  </body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.Math.random = mulberry32(SEED); // the APP's own dice stream — separate from `decide` above
  win.eval(harnessGlobals + "\n" + src + bridgeTail);
  // CANARY (GAUNTLET_CANARY=1): patch awardXp right after module load, before any game logic runs —
  // matches every other gauntlet harness's "patch right after eval" canary shape. Applied here (not
  // in a wrapper) so every life's fresh window gets it consistently.
  if (CANARY) win.eval(`awardXp = function(sh){ sh.xp = NaN; };`);
  win.confirm = () => true; // the monkey session always accepts destructive confirms (a player playing through)
  win.prompt = () => null;  // killCharacter's "where did you fall" prompt -> null -> "parts unknown" fallback
  win.alert = () => {};
  win.fetch = () => Promise.reject(new Error("gauntlet: fetch stubbed — no live bridge in this headless sweep"));
  if (!win.navigator.clipboard) {
    Object.defineProperty(win.navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("stub")) }, configurable: true });
  }
  if (typeof win.requestAnimationFrame !== "function") win.requestAnimationFrame = (cb) => win.setTimeout(cb, 0);
  if (typeof win.matchMedia !== "function") win.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  return win;
}

// ---------- guided-creation driver: every bardo step type, "always take 🎲 choose for me" ----------
// (the same per-step-type auto-fill table G1's extension uses — see dev/gauntlet-1-clicks.mjs
// autoFillBardoStep; duplicated here rather than imported since these are standalone scripts per
// this repo's harness convention, not an ES module surface).
function driveBardoToCompletion(win, cls, findingsCtx) {
  win.startBardo();
  win.bardoBegin();
  const seq = win.GS.BARDO.seq;
  let i = 0, guard = 0;
  while (i < seq.length - 1 && guard < 200) { // watchdog: seq is bounded (~20-30 steps incl. life-event splices)
    guard += 1;
    const step = win.GS.BARDO.seq[win.GS.BARDO.i]; // re-read seq each loop — life steps can splice new entries in
    autoFillOneStep(win, step, cls);
    win.bardoAdvance();
    i = win.GS.BARDO.i;
  }
  if (guard >= 200) {
    addFinding({ severity: "crash", title: `bardo creation watchdog tripped for ${cls}`, symptom: `200 bardoAdvance() iterations without reaching the final "found" step (seq.length=${seq.length}, ended at i=${win.GS.BARDO.i})`, cls, step: "bardo-creation" });
    return false;
  }
  // final "found" step: name the soul + the world, then bardoWake() -> bindWorld();cgBind() (real mint)
  const nameEl = win.document.getElementById("charName");
  if (nameEl) nameEl.value = `${cls} of the Gauntlet`;
  const worldNameEl = win.document.getElementById("worldName");
  if (worldNameEl) worldNameEl.value = `The ${cls}'s Monkey World`;
  win.bardoWake();
  return true;
}
function autoFillOneStep(win, step, cls) {
  if (!step) return;
  try {
    if (step.t === "choose") {
      if (step.field === "class") { win.cgChoose("class", cls); return; }
      const src = step.field === "species" ? win.SPECIES : win.BACKGROUNDS;
      const keys = Object.keys(src || {});
      if (keys.length) win.cgChoose(step.field, pickOne(keys));
    } else if (step.t === "scores") {
      while (win.GS.CGEN.scoreRolls.length < 6) win.bardoRollScore();
      if (!win.GS.CGEN.assigned) win.bardoAssign("best");
    } else if (step.t === "skills") win.cgSkillAuto();
    else if (step.t === "equipment") win.cgKitAuto();
    else if (step.t === "tools") win.cgToolsAuto();
    else if (step.t === "languages") win.cgLangAuto();
    else if (step.t === "spells") win.cgSpellsAuto();
    else if (step.t === "feat") win.cgFeatAuto();
    else if (step.t === "life") {
      if (!win.GS.CGEN.lifeQ) return; // cgLifeBegin() lazy-inits on first renderBardo(); bardoAdvance alone won't call it
      let guard = 0;
      while (guard < 40 && win.GS.CGEN.lifeI < win.GS.CGEN.lifeQ.length) {
        guard += 1;
        if (!win.GS.CGEN.lifeLog[win.GS.CGEN.lifeI]) win.bardoLifeRoll();
        if (win.GS.CGEN.lifeI >= win.GS.CGEN.lifeQ.length - 1) { win.bardoLifeStepNext(); break; }
        win.bardoLifeStepNext();
      }
    } else if (step.t === "hometown") { if (!win.GS.BARDO.rolled[step.key]) win.bardoRollHometown(); }
    else if (step.t === "world") { if (!win.GS.BARDO.rolled[step.key]) win.bardoRollWorld(); }
  } catch (e) {
    addFinding({ severity: "crash", title: `bardo step "${step.t}" auto-fill threw for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `bardo-${step.t}`, collisionZone: isCollisionZone(e && e.stack) });
  }
}
// the "life" step type owns its OWN sub-loop above (a life event's roll advances lifeI internally,
// not via the outer bardoAdvance()), so driveBardoToCompletion's outer while-loop still needs one
// bardoAdvance() call per "life"-typed seq entry to leave the step once its internal sub-loop is
// done — the sub-loop calls bardoLifeStepNext() itself for i<last, but the OUTER seq index only
// advances via the outer loop's own win.bardoAdvance() call once GS.CGEN.life_done is set.

// ---------- successor (rebirth) creation driver: the SIMPLER "charge sheet" creator ----------
// (rollCharacter -> renderCharge/cgPick/cgRollScores/cgRollLife/cgBind — src/world/play.js +
// src/creator/sheet.js; NOT the bardo, per src/world/fate.js's spawnSuccessorOnPlane -> rollCharacter)
function driveSuccessorCreation(win, cls, findingsCtx) {
  const before = win.GS.CGEN;
  if (!before) { addFinding({ severity: "crash", title: `spawnSuccessorOnPlane left GS.CGEN unset for ${cls}`, symptom: "rollCharacter() should have set GS.CGEN", cls, step: "successor-creation" }); return false; }
  win.cgPick("species", pickOne(Object.keys(win.SPECIES)));
  win.cgPick("class", cls);
  win.cgPick("background", pickOne(Object.keys(win.BACKGROUNDS)));
  if (!win.GS.CGEN.scores) win.cgRollScores();
  try { win.cgRollLife(); } catch (e) {
    addFinding({ severity: "review", title: `cgRollLife() threw during successor creation for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: "successor-life" });
  }
  const nameField = win.document.getElementById("cgName");
  if (nameField) nameField.value = `${cls} the Reborn`;
  win.cgBind();
  return true;
}

// ---------- one full life for one class (spec §7 steps 1-10) ----------
function runLife(cls) {
  const win = freshWin();
  const perStep = [];
  const record = (step, ok, note) => perStep.push({ step, ok, note: note || null });

  // step 1: new world via the world-genesis ritual path + full bardo creation, 🎲-choose-for-me throughout
  try {
    const ok = driveBardoToCompletion(win, cls);
    record("1-new-world-and-creation", ok);
  } catch (e) {
    addFinding({ severity: "crash", title: `step 1 (new world + creation) threw for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: "1-new-world-and-creation", collisionZone: isCollisionZone(e && e.stack) });
    record("1-new-world-and-creation", false, e.message);
    return { cls, perStep, forcedDeath: false, harnessAborted: true };
  }
  let w = win.activeWorld ? win.activeWorld() : (win.U.worlds[win.U.activeWorldId] || null);
  if (!w) {
    addFinding({ severity: "crash", title: `no active world after creation for ${cls}`, symptom: "bardoWake()/bindWorld() should have set U.activeWorldId", cls, step: "1-new-world-and-creation" });
    record("1-new-world-and-creation", false, "no active world");
    return { cls, perStep, forcedDeath: false, harnessAborted: true };
  }
  assertInv(win, w, cls, "1-new-world-and-creation");

  let loopIterations = 0;
  let forcedDeath = false;
  let pc = livingPc(w);

  while (pc && pc.status === "living" && loopIterations < LOOP_WATCHDOG) {
    loopIterations += 1;
    const stepTag = `loop${loopIterations}`;

    // step 2: one travel walk
    try {
      driveTravelWalk(win, w);
      record(`2-travel-walk(${stepTag})`, true);
    } catch (e) {
      addFinding({ severity: "crash", title: `step 2 (travel walk) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `2-travel-walk(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`2-travel-walk(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `2-travel-walk(${stepTag})`);
    pc = livingPc(w); if (!pc || pc.status !== "living") break;

    // step 3: forced encounter -> full combat -> XP on win
    let combatWon = false;
    try {
      combatWon = driveCombat(win, w, pc);
      record(`3-combat(${stepTag})`, true, combatWon ? "won" : (pc.status === "living" ? "no-op (no foe available)" : "PC fell"));
    } catch (e) {
      addFinding({ severity: "crash", title: `step 3 (combat) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `3-combat(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`3-combat(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `3-combat(${stepTag})`);
    pc = livingPc(w); if (!pc || pc.status !== "living") break;

    // step 4: loot — grant a weapon + coins, equip it
    try {
      driveLoot(win, w, pc);
      record(`4-loot(${stepTag})`, true);
    } catch (e) {
      addFinding({ severity: "crash", title: `step 4 (loot) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `4-loot(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`4-loot(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `4-loot(${stepTag})`);
    pc = livingPc(w); if (!pc || pc.status !== "living") break;

    // step 5: shop — buy one affordable line, sell one instance, attempt an unaffordable buy
    try {
      driveShop(win, w, pc, cls);
      record(`5-shop(${stepTag})`, true);
    } catch (e) {
      addFinding({ severity: "crash", title: `step 5 (shop) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `5-shop(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`5-shop(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `5-shop(${stepTag})`);
    pc = livingPc(w); if (!pc || pc.status !== "living") break;

    // step 6: rest — hp/slots restored, clock advances. Drive via the real reachable path,
    // passTime('dawn') (src/world/play.js) — NOT applyEvent({type:"rest"}) directly: passTime is
    // what a player actually clicks, and it's the ONLY place the rest-gated level-up apply
    // (openLevelUp) fires (applyEvent's own "rest" case only recovers HP/slots — it has no
    // level-up logic at all). passTime's OWN kind vocabulary is short|dawn|montage (dawn/montage
    // both map internally to a "long" rest) — that's a DIFFERENT vocabulary from applyEvent's rest
    // case (short|long only); mixing them up here previously fed a bare {type:"rest",kind:"dawn"}
    // straight to applyEvent, which silently downgraded every "dawn" rest to a SHORT rest (its
    // ternary's else-branch) — explaining an earlier run's "hpCur 0 -> 0 forever" symptom. That was
    // this HARNESS calling the wrong entry point, not an app bug.
    try {
      const before = pc.sheet.hpCur;
      win.passTime("dawn");
      record(`6-rest(${stepTag})`, true, `hpCur ${before} -> ${pc.sheet.hpCur}`);
    } catch (e) {
      addFinding({ severity: "crash", title: `step 6 (rest) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `6-rest(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`6-rest(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `6-rest(${stepTag})`);
    pc = livingPc(w); if (!pc || pc.status !== "living") break;

    // step 7: level up when XP crosses a threshold (passTime's rest-gate already applies it; this
    // asserts the mechanical recompute landed cleanly — the interactive picker is DM-narrated in v1
    // per docs/TIER-SCOPE.md, so opening the picker isn't required for the loop to proceed).
    try {
      if (typeof win.pendingLevelUp === "function" && win.pendingLevelUp(pc.sheet)) {
        addFinding({ severity: "review", title: `pendingLevelUp still true after a rest for ${cls} at ${stepTag}`, symptom: `XP ${pc.sheet.xp}, level ${pc.sheet.level} — the rest-gated level-up (docs/ADVANCEMENT.md) should have applied by now`, cls, step: `7-levelup(${stepTag})` });
      }
      record(`7-levelup(${stepTag})`, true, `level ${pc.sheet.level}, xp ${pc.sheet.xp}`);
    } catch (e) {
      addFinding({ severity: "crash", title: `step 7 (level-up check) threw for ${cls} at ${stepTag}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: `7-levelup(${stepTag})`, collisionZone: isCollisionZone(e && e.stack) });
      record(`7-levelup(${stepTag})`, false, e.message);
    }
    assertInv(win, w, cls, `7-levelup(${stepTag})`);
    pc = livingPc(w);
  }

  // step 8: loop 2-7 until death; watchdog forces it
  if (pc && pc.status === "living" && loopIterations >= LOOP_WATCHDOG) {
    forcedDeath = true;
    try { win.killCharacter(pc.id); record("8-forced-death", true, `watchdog tripped at ${LOOP_WATCHDOG} iterations`); }
    catch (e) {
      addFinding({ severity: "crash", title: `forced killCharacter() threw for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: "8-forced-death", collisionZone: isCollisionZone(e && e.stack) });
      record("8-forced-death", false, e.message);
    }
  } else if (!pc || pc.status !== "living") {
    // the PC already fell naturally inside the loop (killCharacter runs from combat/hp_changed's own
    // death path) — openBardo() already fired synchronously from within applyEvent's hp_changed case.
    record("8-death-occurred-naturally", true);
  }
  assertInv(win, w, cls, "8-death-and-bardo-passage");

  // step 9: death saves offered (if the path reached 0 hp rather than instant-death) -> bardo
  // passage renders -> spawnSuccessorOnPlane() -> new PC in the SAME world -> closeBardo()
  try {
    const modal = win.document.getElementById("bardoModal");
    const passageShown = modal && modal.classList.contains("show");
    if (!passageShown) {
      addFinding({ severity: "review", title: `bardo passage modal not shown after death for ${cls}`, symptom: "expected #bardoModal.classList to contain 'show' after killCharacter -> openBardo", cls, step: "9-bardo-passage" });
    }
    const worldsBefore = Object.keys(win.U.worlds).length;
    const charsBefore = w.characters.length;
    win.closeBardo(); // -> spawnSuccessorOnPlane() -> rollCharacter() -> GS.CGEN set, panel-charge shown
    const cls2 = cls; // successor rolls the SAME class this life ran, for a clean per-class report row
    driveSuccessorCreation(win, cls2);
    const worldsAfter = Object.keys(win.U.worlds).length;
    // U.activeWorldId may have moved to a distant region (spawnSuccessorOnPlane's farthestRegion
    // branch) — re-resolve `w` off the CURRENT active world, not the original reference, before
    // asserting the successor landed (docs/DEATH-AND-REBIRTH.md step 6).
    const w2 = win.activeWorld ? win.activeWorld() : win.U.worlds[win.U.activeWorldId];
    const charsAfter = w2 ? w2.characters.length : charsBefore;
    const successorLanded = w2 && w2.characters.some((c) => c.status === "living" && c !== undefined);
    if (!successorLanded) {
      addFinding({ severity: "corrupt", title: `no living successor after rebirth for ${cls}`, symptom: `worlds before/after: ${worldsBefore}/${worldsAfter}; original world's characters ${charsBefore}, target world's characters ${charsAfter}`, cls, step: "9-rebirth" });
    }
    record("9-death-saves-and-rebirth", true, `successorLanded=${!!successorLanded}, worldsOnPlane=${worldsAfter}`);
    if (w2) assertInv(win, w2, cls, "9-rebirth");
  } catch (e) {
    addFinding({ severity: "crash", title: `step 9 (bardo passage / rebirth) threw for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: "9-death-saves-and-rebirth", collisionZone: isCollisionZone(e && e.stack) });
    record("9-death-saves-and-rebirth", false, e.message);
  }

  // step 10: save/load round-trip on the final state
  try {
    const rt = roundTrip(win, cls);
    record("10-save-load-roundtrip", rt.ok, rt.ok ? `${rt.unexplainedDiffs.length} unexplained diffs` : rt.harnessError);
    if (!rt.ok && rt.unexplainedDiffs && rt.unexplainedDiffs.length) {
      addFinding({ severity: "corrupt", title: `save/load round-trip diverged for ${cls}`, symptom: rt.unexplainedDiffs.slice(0, 10).map((d) => `${d.path}: ${JSON.stringify(d.a)} -> ${JSON.stringify(d.b)}`).join(" | "), cls, step: "10-save-load-roundtrip" });
    } else if (rt.harnessError) {
      addFinding({ severity: "corrupt", title: `save/load round-trip failed for ${cls}`, symptom: rt.harnessError, cls, step: "10-save-load-roundtrip" });
    }
  } catch (e) {
    addFinding({ severity: "crash", title: `step 10 (save/load round-trip) threw for ${cls}`, symptom: String(e && e.message || e), stack: e && e.stack, cls, step: "10-save-load-roundtrip", collisionZone: isCollisionZone(e && e.stack) });
    record("10-save-load-roundtrip", false, e.message);
  }

  return { cls, perStep, forcedDeath, harnessAborted: false };
}

function livingPc(w) {
  return (w.characters || []).filter((c) => c.status === "living").slice(-1)[0] || null;
}

// step 2 helper: one travel walk via the real explore() ritual + walkAdvance/walk_complete
function driveTravelWalk(win, w) {
  win.explore("nearby", "Place");
  // prepOf(w).activeWalkId is the live cursor explore() itself set (TRAVEL-WALKS.md §1) — the
  // authoritative pointer to whichever node/walk this call just minted, no need to diff node sets.
  const P = typeof win.prepOf === "function" ? win.prepOf(w) : null;
  const activeWalkId = P && P.activeWalkId;
  if (!activeWalkId) return; // degrade path (no walk engine) already advanced the clock/arrived synchronously — nothing more to drive
  const walk = win.walkOfFrontier(w, activeWalkId);
  if (!walk) return;
  const legs = (walk.segments || []).filter((s) => !s.isFinale);
  for (const seg of legs) win.applyEvent(w, { type: "walk_advance", payload: { toSeg: seg.num } });
  const finale = (walk.segments || []).find((s) => s.isFinale);
  if (finale) win.applyEvent(w, { type: "walk_advance", payload: { toSeg: finale.num } });
  win.applyEvent(w, { type: "walk_complete", payload: {} });
}

// step 3 helper: a level-appropriate CR foe, driven through the SAME pcAttack/resolveAttack loop
// gauntlet-2-combat.mjs's CR-band sims use (spec §7 step 3 explicitly says "reuse G2b's fight loop").
// Returns true if the PC won (and awardXp fired), false if no foe was available or the PC fell.
function driveCombat(win, w, pcChar) {
  const sh = pcChar.sheet;
  const cr = Math.max(0, Math.min(10, Math.round((sh.level || 1) / 2))); // a level-appropriate CR, capped to the T2 ladder
  const template = win.cmPickByCR({ cr });
  if (!template) return false; // bestiary unavailable at this CR — not a finding, just nothing to fight
  const foe = win.cmFoeFrom(template, template.name);
  let rounds = 0;
  const WATCHDOG = 40;
  while (sh.hpCur > 0 && foe.hp > 0 && rounds < WATCHDOG) {
    rounds += 1;
    const pcRes = win.pcAttack(sh, { targetAC: foe.ac });
    if (pcRes && pcRes.hit) foe.hp = Math.max(0, foe.hp - (pcRes.damage || 0));
    if (foe.hp <= 0) break;
    const foeAction = (foe.actions || [])[0];
    if (foeAction && foeAction.dmg) {
      const foeRes = win.resolveAttack({ atkBonus: foeAction.atk || 3, targetAC: sh.ac, dmg: foeAction.dmg });
      if (foeRes && foeRes.hit) {
        win.applyEvent(w, { type: "hp_changed", payload: { delta: -(foeRes.damage || 0) }, source: "detected" });
      }
    }
  }
  if (rounds >= WATCHDOG) {
    addFinding({ severity: "review", title: `combat watchdog (${WATCHDOG} rounds) tripped fighting ${template.name}`, symptom: `PC hp ${sh.hpCur}, foe hp ${foe.hp} — neither side finished the fight`, evidenceExtra: { foe: template.name } });
    return false;
  }
  if (sh.hpCur <= 0) return false; // the PC fell — hp_changed's own death path already routed to killCharacter/openBardo
  if (foe.hp <= 0) {
    const before = sh.xp;
    if (typeof win.awardXp === "function" && typeof win.crXp === "function") win.awardXp(sh, win.crXp(template.cr) || 0);
    if (!Number.isFinite(sh.xp)) {
      addFinding({ severity: "corrupt", title: `awardXp left sh.xp non-finite after beating ${template.name}`, symptom: `xp before=${before}, after=${sh.xp}` });
    }
    win.applyEvent(w, { type: "kill", payload: { victimClass: "monster" }, source: "declared" });
    return true;
  }
  return false;
}

// step 4 helper: loot — grant one weapon + coins via item_changed, equip it. Drops whatever was
// PREVIOUSLY in mainHand first (a real player doesn't carry every sword they've ever found — this
// also keeps the loop from ballooning carry weight past the STR-based hard cap purely as a driver
// artifact, which flooded the report with 25+ duplicate "over-capacity" findings per class before
// this fix; the cap-refusal path itself is still exercised deliberately below, once).
let lootOvercapWarned = false;
function driveLoot(win, w, pcChar) {
  const sh = pcChar.sheet;
  const weapon = pickOne(["Longsword", "Shortsword", "Mace", "Quarterstaff", "Dagger"]);
  const prevMainHandId = sh.equipped && sh.equipped.mainHand;
  const r = win.applyEvent(w, { type: "item_changed", payload: { add: [{ name: weapon }], gold: 15 }, source: "declared" });
  if (!r || !r.ok) {
    // dedup: this can legitimately recur many times across a 25-loop life once carry weight climbs
    // near the cap — one finding per ROOT CAUSE (the refusal reason), not one per occurrence (spec
    // §0's "flood = root cause" rule).
    if (!lootOvercapWarned || (r && r.reason !== "over-capacity")) {
      addFinding({ severity: "review", title: `item_changed loot grant refused (reason: ${r && r.reason})`, symptom: JSON.stringify(r) + " — first occurrence; subsequent same-reason refusals in this run are suppressed as the same root cause" });
      if (r && r.reason === "over-capacity") lootOvercapWarned = true;
    }
    return;
  }
  const inst = (sh.inventory || []).find((it) => it.name === weapon);
  if (inst) {
    win.applyEvent(w, { type: "equip", payload: { itemId: inst.id, slot: "mainHand" }, source: "declared" });
  }
  // drop the OLD mainHand weapon (if any, and if it's not the one we just equipped) — a real player
  // sheds gear rather than hoarding every drop; keeps carry weight bounded across the loop.
  if (prevMainHandId && (!inst || prevMainHandId !== inst.id)) {
    win.applyEvent(w, { type: "item_changed", payload: { removeIds: [prevMainHandId] }, source: "declared" });
  }
  if (typeof win.cmSheetAC === "function") {
    const ac = win.cmSheetAC(sh);
    if (!Number.isFinite(ac)) addFinding({ severity: "corrupt", title: `cmSheetAC non-finite after equipping loot`, symptom: `ac=${ac}` });
  }
  if (typeof win.cmEquippedDamage === "function") {
    try { win.cmEquippedDamage(sh); } catch (e) {
      addFinding({ severity: "crash", title: `cmEquippedDamage threw after equipping loot`, symptom: String(e && e.message || e), stack: e && e.stack });
    }
  }
}

// step 5 helper: shop — buy an affordable line, sell an instance, attempt an unaffordable buy
function driveShop(win, w, pcChar, cls) {
  const sh = pcChar.sheet;
  const r = win.applyEvent(w, { type: "open_shop", payload: { name: `${cls}'s Gauntlet Market`, tier: 1 }, source: "declared" });
  if (!r || !r.ok || !r.shopId) { addFinding({ severity: "review", title: `open_shop refused during monkey session for ${cls}`, symptom: JSON.stringify(r) }); return; }
  const shopId = r.shopId;
  const shop = win.shopOf(w, shopId);
  if (!shop) return;
  // buy one affordable line
  const affordable = (shop.stock || []).filter((l) => { const p = win.itemPrice(l.name); return p && p.gp != null && p.gp <= (sh.gold || 0) && (l.qty || 0) > 0; });
  if (affordable.length) {
    const line = pickOne(affordable);
    const goldBefore = sh.gold, stockBefore = line.qty;
    win.buyItem(shopId, line.name);
    if (sh.gold > goldBefore) addFinding({ severity: "corrupt", title: `buyItem increased gold for ${cls}`, symptom: `gold ${goldBefore} -> ${sh.gold}` });
  }
  // sell one held instance (skip the just-equipped mainHand so combat/loot stays intact for the next loop)
  const sellable = (sh.inventory || []).filter((it) => sh.equipped && it.id !== sh.equipped.mainHand);
  if (sellable.length) {
    const inst = pickOne(sellable);
    const goldBefore = sh.gold;
    win.sellItem(shopId, inst.id);
    if (sh.gold < goldBefore) { /* fine — a broke merchant can refuse/cap; not itself a finding */ }
  }
  // attempt a buy costing more than current gold -> refused via buyRefusalMsg, gold unchanged
  const priciest = (shop.stock || []).map((l) => ({ l, p: win.itemPrice(l.name) })).filter((x) => x.p && x.p.gp != null).sort((a, b) => b.p.gp - a.p.gp)[0];
  if (priciest && priciest.p.gp > (sh.gold || 0) + 100000) {
    const goldBefore = sh.gold;
    win.buyItem(shopId, priciest.l.name);
    if (sh.gold !== goldBefore) addFinding({ severity: "corrupt", title: `an unaffordable buy still charged gold for ${cls}`, symptom: `gold ${goldBefore} -> ${sh.gold} buying ${priciest.l.name} (price ${priciest.p.gp})` });
  } else {
    // ensure at least one over-budget attempt is exercised even on a rich PC: force one with a
    // deliberately absent line name (out-of-stock == the same "refused, unchanged" contract).
    const goldBefore = sh.gold;
    const refused = win.buyItem(shopId, "The Gauntlet's Nonexistent Artifact of Testing");
    if (sh.gold !== goldBefore) addFinding({ severity: "corrupt", title: `buying a nonexistent item still charged gold for ${cls}`, symptom: `gold ${goldBefore} -> ${sh.gold}` });
  }
}

// step 10 helper: saveU -> read localStorage -> fresh jsdom w/ that value preloaded -> loadU/migrateAll
// -> deep-compare (mirrors dev/gauntlet-6-persistence.mjs's roundTrip contract; reimplemented here —
// standalone-script harnesses in this repo don't export/import between each other).
const ALLOWED_DIFF_KEYS = [
  { path: /^worlds\.[^.]+\.region$/, reason: "migrateAll assigns a plane-region slot on load" },
  { path: /^plane$/, reason: "migrateAll stamps U.plane once" },
  // matches BOTH the top-level key (souls absent entirely) AND per-index diffs (souls present but
  // empty pre-migration, e.g. this harness's own U={...,souls:[]} boot fixture) — deepDiff walks
  // arrays element-by-element, so an empty-vs-seeded array surfaces as souls.0, souls.1, … rather
  // than one top-level "souls" diff.
  { path: /^souls(\.\d+)?$/, reason: "migrateAll seeds U.souls[] with CANON_SOULS if absent/empty" },
  { path: /^worlds\.[^.]+\._chronicleMigrated$/, reason: "migrateWorld's chronicle migration stamp" },
  { path: /^worlds\.[^.]+\.characters\.\d+\.sheet\.(choicesLevel|hpCur|slotsMax|slots|pools)$/, reason: "migrateWorld -> ensureResources() backfill" },
  { path: /^worlds\.[^.]+\.codex$/, reason: "migrateWorld -> ensureCodex() backfill" },
  { path: /^worlds\.[^.]+\._codexInit$/, reason: "ensureCodex()'s idempotency stamp" },
  { path: /^worlds\.[^.]+\.__lastClockTotal$/, reason: "this HARNESS's own INV-tracking field (assertInv), not app state" },
  // migrateWorld: `if(!w.shops)w.shops={};` (src/world/state.js) backfills the merchant registry the
  // first time a pre-SHOP-UI world loads — a world that never opened a shop legitimately has no
  // `shops` key pre-migration and gains the empty registry object on load (additive, idempotent).
  { path: /^worlds\.[^.]+\.shops$/, reason: "migrateWorld backfills w.shops={} if absent (docs/SHOP-UI.md §2a)" },
];
function pathAllowed(p) { return ALLOWED_DIFF_KEYS.some((a) => a.path.test(p)); }
function deepDiff(a, b, path, out) {
  path = path || ""; out = out || [];
  if (a === b) return out;
  const aIsObj = a && typeof a === "object", bIsObj = b && typeof b === "object";
  if (!aIsObj || !bIsObj) { out.push({ path, a, b }); return out; }
  if (Array.isArray(a) !== Array.isArray(b)) { out.push({ path, a: Array.isArray(a) ? "[array]" : typeof a, b: Array.isArray(b) ? "[array]" : typeof b }); return out; }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) deepDiff(a[k], b[k], path ? `${path}.${k}` : k, out);
  return out;
}
function roundTrip(win, cls) {
  win.saveU(win.U);
  let ls;
  try { ls = win.localStorage.getItem("genesis-universe-v2"); }
  catch (e) { return { ok: false, harnessError: `localStorage read failed: ${e.message}` }; }
  if (ls == null) return { ok: false, harnessError: "saveU produced no localStorage entry" };
  const win2 = freshWin();
  try { win2.localStorage.setItem("genesis-universe-v2", ls); }
  catch (e) { return { ok: false, harnessError: `preload localStorage.setItem failed: ${e.message}` }; }
  let U2;
  try { U2 = win2.loadU(); win2.U = U2; win2.migrateAll(); }
  catch (e) { return { ok: false, harnessError: `loadU/migrateAll threw: ${e.message}` }; }
  const U1norm = JSON.parse(JSON.stringify(win.U));
  const U2norm = JSON.parse(JSON.stringify(win2.U));
  const diffs = deepDiff(U1norm, U2norm, "", []);
  const unexplained = diffs.filter((d) => !pathAllowed(d.path));
  return { ok: unexplained.length === 0, unexplainedDiffs: unexplained, allowedDiffs: diffs.length - unexplained.length };
}

// ---------- canary (spec §7's own canary: monkeypatch awardXp to set sh.xp=NaN) ----------
function installCanary(win) {
  win.eval(`awardXp = function(sh){ sh.xp = NaN; };`);
}

// ---------- run ----------
// spec §7 names "12 classes" — the 12 SRD base classes (docs/CLASS-PROGRESSION scope).
const ALL_CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
const CLASSES_TO_RUN = ONLY ? ALL_CLASSES.filter((c) => c === ONLY) : ALL_CLASSES;

const perClassResults = [];
let harnessAbortedCount = 0;

try {
  for (const cls of CLASSES_TO_RUN) {
    console.log(`[monkey] running life: ${cls}...`);
    const result = runLife(cls); // freshWin() applies the CANARY patch itself (module-level CANARY flag) when set
    perClassResults.push(result);
    if (result.harnessAborted) harnessAbortedCount += 1;
  }

  const stats = {
    classesRun: perClassResults.map((r) => ({ cls: r.cls, forcedDeath: r.forcedDeath, harnessAborted: r.harnessAborted, steps: r.perStep })),
    livesCompleted: perClassResults.filter((r) => !r.harnessAborted).length,
    livesTotal: perClassResults.length,
  };

  writeReport({ status: "completed", invoked: perClassResults.length, skipped: ALL_CLASSES.length - CLASSES_TO_RUN.length, stats });

  console.log(`\nMONKEY session: ${perClassResults.length}/${CLASSES_TO_RUN.length} lives run, ${harnessAbortedCount} harness-aborted.`);
  console.log(`Findings: ${findings.length} (${findings.map((f) => f.severity).join(", ") || "none"})`);
  if (CANARY) {
    if (findings.length > 0) {
      console.log("CANARY FIRED — ≥1 finding emitted as expected. Exiting 1 (canary run).");
      process.exit(1);
    } else {
      harnessDefect("CANARY DID NOT FIRE — awardXp(sh)->NaN should have produced ≥1 corrupt finding. Detector is not trustworthy.");
    }
  } else {
    process.exit(0);
  }
} catch (e) {
  harnessDefect(`Unhandled throw in harness code: ${e && e.stack || e}`);
}
