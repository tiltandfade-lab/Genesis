/* dev/gauntlet-g4.mjs — PRE-PLAYTEST GAUNTLET harness G4: companion states (docs/PRE-PLAYTEST-GAUNTLET.md §6).

   Sidekick + hireling lifecycle driven through the REAL functions (src/world/companions.js), asserting
   the global invariant set INV (§2) at each staged state, and appending findings to dev/gauntlet-report.json
   per the §2 report contract. NEW FILE ONLY — never edits src/, data/, manifest.json, genesis.html, or any
   existing dev/verify-*.mjs (docs/PRE-PLAYTEST-GAUNTLET.md §1 ground rules).

   Exit-code semantics (§0): exit 0 when the harness RAN TO COMPLETION — findings are DATA in the report,
   not test failures. Exit 1 ONLY on a harness defect (boot failure, unhandled harness-code throw, report
   unwritable). GAUNTLET_CANARY=1 injects the ONE named defect (companionChargeWages skipping the gold
   floor, per §6's canary line) and MUST emit >=1 finding + exit 1.

   Determinism: a seeded mulberry32 PRNG replaces Math.random BEFORE any module loads (seed from
   GAUNTLET_SEED, default 20260702 — §0).

   Boot pattern: copy of dev/verify-dm-events.mjs (loads the real genesis.html module set, in manifest
   load order, into one jsdom global scope — the "const-via-eval" convention, CLAUDE.md "headless test").

   Run:   node dev/gauntlet-g4.mjs
   Canary: GAUNTLET_CANARY=1 node dev/gauntlet-g4.mjs   (must emit >=1 finding, exit 1)
   Repro of a single finding: see each finding's evidence.repro line in the report. */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const HARNESS_ID = "G4";

// ── determinism: seeded mulberry32 over Math.random, BEFORE any module loads (§0) ──
const SEED = Number(process.env.GAUNTLET_SEED) || 20260702;
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED);

const CANARY = process.env.GAUNTLET_CANARY === "1";

// ── report accumulation (§2 contract) ──
const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
function loadReport(){
  if(existsSync(REPORT_PATH)){
    try { return JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch(e) { /* fall through to fresh */ }
  }
  return { run: {}, harnesses: [], findings: [] };
}
function gitShortRev(){
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch(e) { return null; }
}
const report = loadReport();
report.run = { date: new Date().toISOString().slice(0,10), seed: SEED, commit: gitShortRev() };

const findings = [];
let findingSeq = 0;
function nextId(){ findingSeq += 1; return `${HARNESS_ID}-${String(findingSeq).padStart(3,"0")}`; }
function addFinding(f){
  const finding = Object.assign({ id: nextId(), harness: HARNESS_ID, collisionZone: false }, f);
  findings.push(finding);
  return finding;
}

// ── global invariant set INV (§2) ──
function checkInv(w, label){
  const problems = [];
  const pc = (w.characters||[]).find(c => c.status === "living");
  if(pc && pc.sheet){
    const hp = pc.sheet.hpCur != null ? pc.sheet.hpCur : pc.sheet.hp;
    const maxHp = pc.sheet.hp != null && typeof pc.sheet.hp === "number" ? pc.sheet.hp : null;
    if(typeof hp === "number" && !Number.isFinite(hp)) problems.push(`pc hp not finite (${hp})`);
    if(maxHp != null && typeof hp === "number" && hp > maxHp) problems.push(`pc hp (${hp}) > maxHp (${maxHp})`);
    const gold = pc.sheet.gold;
    if(typeof gold === "number" && (!Number.isFinite(gold) || gold < 0)) problems.push(`pc gold invalid (${gold})`);
    if(pc.sheet.inventory && !Array.isArray(pc.sheet.inventory)) problems.push("pc inventory not an Array");
    if(Array.isArray(pc.sheet.inventory) && pc.sheet.inventory.some(x => x == null)) problems.push("pc inventory has null/undefined entries");
  }
  if(w.clock && typeof w.clock.day === "number" && w.clock.day < 0) problems.push("world clock day negative");
  try { JSON.stringify(w); } catch(e) { problems.push("JSON.stringify(w) failed: " + e.message); }
  return { ok: problems.length === 0, problems, label };
}
function scanHtmlInv(html, label){
  const problems = [];
  if(/>undefined</.test(html)) problems.push(">undefined< in rendered HTML");
  if(/>NaN</.test(html)) problems.push(">NaN< in rendered HTML");
  if(/\[object Object\]/.test(html)) problems.push("[object Object] in rendered HTML");
  return { ok: problems.length === 0, problems, label };
}

// ── boot (copy of dev/verify-dm-events.mjs's pattern) ──
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
let harnessDefect = null;

let win = null;
let invoked = 0, findingCount = 0, statesStaged = [];

try {
  JSDOM = createRequire(join(JSDOM_HOME, "package.json"))("jsdom").JSDOM;

  const man = JSON.parse(read("manifest.json"));
  let moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

  // CANARY injection: the §6-named defect — patch companionChargeWages to skip the gold floor.
  // Applied as a textual source patch BEFORE eval so it behaves exactly like a real regression
  // (not a post-hoc monkeypatch of a working function).
  if(CANARY){
    const needle = "const charge = Math.min(have, due);";
    if(!moduleSrc.includes(needle)){
      throw new Error("GAUNTLET_CANARY=1: could not locate companionChargeWages gold-floor line to patch — source has drifted from the harness's canary hook");
    }
    // the §6-named defect: "skip the gold floor" — charge the full due amount regardless of what
    // the PC actually has available, instead of clamping at `have`.
    const broken = "const charge = due; /* GAUNTLET_CANARY: gold floor skipped */";
    moduleSrc = moduleSrc.replace(needle, broken);
  }

  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  win = dom.window;
  win.eval(harness + "\n" + moduleSrc);

  // reinstall the seeded PRNG inside the jsdom realm too (its own global Math is separate from ours)
  win.Math.random = mulberry32(SEED);

  const need = ["companionsOf","hireCompanion","dismissCompanion","companionChargeWages",
    "companionAdjustLoyalty","companionClampLoyalty","companionDesert","companionHeroicStandAvailable",
    "companionConsumeHeroicStand","promoteSidekick","companionSidekickLevelWith","renderWorld"];
  const missing = need.filter(n => typeof win[n] === "undefined");
  if(missing.length){
    addFinding({
      severity: "crash",
      title: `required companion/render globals missing after full module load: ${missing.join(", ")}`,
      symptom: "one or more expected globals are undefined post-boot; G4 cannot exercise the companion lifecycle",
      evidence: { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs` },
    });
  }

  // ── fixture world (mirrors dev/verify-companions.mjs's freshWorld) ──
  function freshWorld(o){
    o = o || {};
    const w = {
      id: "gw-comp", name: "Gauntlet Companion World",
      characters: [{ id:"pc1", status:"living", name:"Ren", headline:"a wanderer", spark:"a wanderer", pronouns:"they",
        sheet: { species:"Human", class:"Fighter", background:"Soldier", level: o.level||3,
                 gold: o.gold!=null?o.gold:100, hp: 20, hpCur: 20, ac: 15,
                 profBonus: 2, scores:{}, mods:{}, saveProfs:[], skillProfs:[], inventory:[] } }],
      gazetteer: [], log: [], ledger: [], clock: { day: 10, min: 480 }, session: 1,
      map: { nodes:{}, edges:[] }, currentNodeId: null, factions: [],
      revealed: { powers:1, map:1, ledger:1, gaz:1 }, dmlog: [],
    };
    const originId = win.addNode(w, "Camp", "Place");
    w.currentNodeId = originId;
    w.startNodeId = originId;
    win.U.worlds[w.id] = w;
    win.U.activeWorldId = w.id;
    win.GS.dm = { turnId:null, pending:false, poll:null, rollReq:null, ask:null };
    win.GS.combat = null;
    return { w, originId };
  }
  function mintNpc(w, name, provenance){
    return win.codexAdd(w, { kind:"npc", name, provenance: provenance||"rolled", status:{ at: w.currentNodeId } });
  }
  function safeInvoke(label, fn){
    invoked += 1;
    try {
      fn();
      return true;
    } catch(e) {
      addFinding({
        severity: "crash",
        title: `unhandled throw during "${label}"`,
        symptom: e && e.message ? e.message : String(e),
        evidence: { stack: e && e.stack ? e.stack : null, stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: ${label}` },
      });
      return false;
    }
  }

  // ── State 1: hire a rolled hireling; renderWorld() names the companion ──
  {
    const { w } = freshWorld({});
    let hireR = null;
    safeInvoke("hireCompanion (rolled)", () => {
      const npc = mintNpc(w, "Gauntlet Porter", "rolled");
      hireR = win.hireCompanion(w, { codexId: npc.id, role: "porter" });
    });
    if(hireR && hireR.ok !== true){
      addFinding({
        severity: "wrong",
        title: "hireCompanion refused a rolled NPC (expected ok:true)",
        symptom: JSON.stringify(hireR),
        evidence: { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: hireCompanion (rolled)` },
      });
    }
    let html = "";
    safeInvoke("renderWorld with hireling present", () => { html = win.renderWorld(); });
    const nameScan = scanHtmlInv(html, "renderWorld post-hire");
    if(!nameScan.ok){
      addFinding({ severity: "ugly", title: "renderWorld() output carries an INV-scan violation with a hireling present",
        symptom: nameScan.problems.join("; "), evidence: { stack: null, stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: renderWorld with hireling present` } });
    }
    if(html && !/Gauntlet Porter/.test(html)){
      addFinding({ severity: "review", title: "renderWorld() output does not name the hired companion",
        symptom: "expected 'Gauntlet Porter' to appear somewhere in the rendered sidebar/panel HTML; not found",
        evidence: { stack: null, stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: renderWorld with hireling present` } });
    }
    const inv = checkInv(w, "post-hire");
    if(!inv.ok) addFinding({ severity: "corrupt", title: "INV violated after hireCompanion",
      symptom: inv.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: post-hire INV` } });
    statesStaged.push("hire-rolled-hireling");
  }

  // ── State 2: promote a sidekick; companionSidekickLevelWith tracks PC level at 1/5/10 ──
  {
    const { w } = freshWorld({ level: 1 });
    safeInvoke("promoteSidekick", () => {
      const npc = mintNpc(w, "Gauntlet Sidekick", "rolled");
      win.promoteSidekick(w, { codexId: npc.id, className: "Warrior", cr: 0.25 });
    });
    [1, 5, 10].forEach(lvl => {
      safeInvoke(`companionSidekickLevelWith(${lvl})`, () => { win.companionSidekickLevelWith(w, lvl); });
      const C = win.companionsOf(w);
      if(C.sidekick && C.sidekick.level !== lvl){
        addFinding({ severity: "wrong", title: `sidekick level did not track PC level ${lvl}`,
          symptom: `expected sidekick.level === ${lvl}, got ${C.sidekick ? C.sidekick.level : "no sidekick"}`,
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: companionSidekickLevelWith(${lvl})` } });
      }
    });
    const inv = checkInv(w, "post-sidekick-level");
    if(!inv.ok) addFinding({ severity: "corrupt", title: "INV violated after sidekick leveling",
      symptom: inv.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: post-sidekick-level INV` } });
    statesStaged.push("promote-sidekick-level-tracking");
  }

  // ── State 3: wages — gold decreases by rate × days, never below 0 (canary target) ──
  {
    const { w } = freshWorld({ gold: 5 });
    let before = null, after = null, wageRecords = null;
    safeInvoke("companionChargeWages", () => {
      const npc = mintNpc(w, "Gauntlet Blade", "rolled");
      win.hireCompanion(w, { codexId: npc.id, role: "blade" }); // 2gp/day
      const pc = w.characters[0];
      before = pc.sheet.gold;
      wageRecords = win.companionChargeWages(w, 3, pc); // 3 days * 2gp = 6gp due, only 5gp available
      after = pc.sheet.gold;
    });
    if(after != null){
      if(after < 0){
        addFinding({
          severity: "corrupt",
          title: "companionChargeWages drove PC gold negative",
          symptom: `gold went ${before} -> ${after} (3 days at 2gp/day = 6gp due, only ${before}gp available; must clamp at 0, not go negative)`,
          evidence: { stack: null, stateSnapshot: JSON.stringify({ before, after }),
            repro: `GAUNTLET_SEED=${SEED} GAUNTLET_CANARY=1 node dev/gauntlet-g4.mjs   # stage: companionChargeWages gold floor` },
        });
      }
    }
    // the gold-floor contract lives in what companionChargeWages ATTEMPTS to charge, not only in the
    // final (downstream-clamped) gold value — assert the reported `charged` amount per hireling never
    // exceeds what the PC actually had available at charge time (the §6-named defect: "skip the gold
    // floor" means charging the FULL due amount instead of min(have,due), which this catches even when
    // applyEvent's own item_changed clamp happens to absorb the overcharge before it reaches sheet.gold).
    if(Array.isArray(wageRecords)){
      wageRecords.forEach(rec => {
        if(rec.charged > before){
          addFinding({
            severity: "corrupt",
            title: "companionChargeWages charged more gold than the PC had available (gold floor skipped)",
            symptom: `hirelingId=${rec.hirelingId} due=${rec.due} charged=${rec.charged} but only ${before}gp was available — the floor (min(have,due)) was not applied`,
            evidence: { stack: null, stateSnapshot: JSON.stringify({ before, wageRecords }),
              repro: `GAUNTLET_SEED=${SEED} GAUNTLET_CANARY=1 node dev/gauntlet-g4.mjs   # stage: companionChargeWages gold floor` },
          });
        }
      });
    }
    const inv = checkInv(w, "post-wages");
    if(!inv.ok) addFinding({ severity: "corrupt", title: "INV violated after companionChargeWages",
      symptom: inv.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: post-wages INV` } });
    statesStaged.push("wages-gold-floor");
  }

  // ── State 4: loyalty ladder — both clamps hold (companionClampLoyalty bounds) ──
  {
    const { w } = freshWorld({});
    let h = null;
    safeInvoke("loyalty clamp ladder", () => {
      const npc = mintNpc(w, "Gauntlet Steady", "rolled");
      win.hireCompanion(w, { codexId: npc.id, role: "skilled" });
      h = win.companionsOf(w).hirelings[0];
      win.companionAdjustLoyalty(w, h, 999, "gauntlet stress: overflow high");
    });
    if(h){
      const C = win.companionsOf(w);
      const stillPresent = C.hirelings.some(x => x.id === h.id);
      if(stillPresent){
        const hAfter = C.hirelings.find(x => x.id === h.id);
        if(hAfter.loyalty > 6 || hAfter.loyalty < 0){
          addFinding({ severity: "corrupt", title: "companionAdjustLoyalty upper clamp did not hold",
            symptom: `loyalty=${hAfter.loyalty} (expected clamp within [0,6])`,
            evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: loyalty clamp ladder (high)` } });
        }
      }
    }
    // lower clamp: an extreme negative delta should desert cleanly (loyalty never negative before removal)
    safeInvoke("loyalty clamp ladder (low)", () => {
      const npc2 = mintNpc(w, "Gauntlet Waverer", "rolled");
      win.hireCompanion(w, { codexId: npc2.id, role: "porter" });
      const h2 = win.companionsOf(w).hirelings.find(x => x.name === "Gauntlet Waverer");
      win.companionAdjustLoyalty(w, h2, -999, "gauntlet stress: overflow low");
    });
    const inv = checkInv(w, "post-loyalty-ladder");
    if(!inv.ok) addFinding({ severity: "corrupt", title: "INV violated after loyalty clamp stress",
      symptom: inv.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: post-loyalty-ladder INV` } });
    statesStaged.push("loyalty-clamp-ladder");
  }

  // ── State 5: combat presence — companion hp -> 0 -> desertion/heroic-stand path; UI reflects it ──
  {
    const { w } = freshWorld({});
    safeInvoke("combat presence + heroic stand + desertion", () => {
      const npc = mintNpc(w, "Gauntlet Combat Hireling", "rolled");
      win.hireCompanion(w, { codexId: npc.id, role: "blade" });
      const h = win.companionsOf(w).hirelings[0];
      h.loyalty = 6;
      // heroic stand available at loyalty 6
      const available = win.companionHeroicStandAvailable(h);
      if(!available){
        addFinding({ severity: "wrong", title: "companionHeroicStandAvailable false at loyalty 6",
          symptom: `hireling.loyalty=${h.loyalty}, companionHeroicStandAvailable returned false`,
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: heroic stand available` } });
      }
      const consumed = win.companionConsumeHeroicStand(h);
      if(!consumed){
        addFinding({ severity: "wrong", title: "companionConsumeHeroicStand failed at loyalty 6 with heroicStandUsed unset",
          symptom: JSON.stringify(h), evidence: { stack:null, stateSnapshot:null,
            repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: heroic stand consume` } });
      }
      // stage combat tracker presence per verify-combat-tracker's pattern (GS.combat active)
      win.GS.combat = { active:true, round:1, side:"pc", first:"pc", pc:{ band:"melee" }, foes:[], scene:{} };
      let html = "";
      if(typeof win.combatPanel === "function"){
        html = win.combatPanel(w, w.characters[0]);
        const scan = scanHtmlInv(html, "combatPanel with companion present");
        if(!scan.ok){
          addFinding({ severity: "ugly", title: "combatPanel() INV-scan violation with companion present",
            symptom: scan.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: combatPanel with companion present` } });
        }
      }
      win.GS.combat = null;
      // desertion path: drive loyalty to 0 to force companionDesert
      win.companionAdjustLoyalty(w, h, -6, "gauntlet: driven to 0");
      const stillHired = win.companionsOf(w).hirelings.some(x => x.id === h.id);
      if(stillHired){
        addFinding({ severity: "wrong", title: "hireling remained on the roster after loyalty hit 0 (desertion path did not fire)",
          symptom: JSON.stringify(win.companionsOf(w).hirelings),
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: desertion path` } });
      }
    });
    const inv = checkInv(w, "post-combat-presence");
    if(!inv.ok) addFinding({ severity: "corrupt", title: "INV violated after combat-presence + desertion staging",
      symptom: inv.problems.join("; "), evidence: { stack:null, stateSnapshot:null,
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: post-combat-presence INV` } });
    statesStaged.push("combat-presence-heroic-stand-desertion");
  }

  // ── State 6: dismissCompanion clears the panel ──
  {
    const { w } = freshWorld({});
    safeInvoke("dismissCompanion clears panel", () => {
      const npc = mintNpc(w, "Gauntlet Dismissed", "rolled");
      win.hireCompanion(w, { codexId: npc.id, role: "porter" });
      const h = win.companionsOf(w).hirelings[0];
      win.dismissCompanion(w, h.id);
      const stillPresent = win.companionsOf(w).hirelings.some(x => x.id === h.id);
      if(stillPresent){
        addFinding({ severity: "wrong", title: "dismissCompanion did not remove the hireling from the roster",
          symptom: JSON.stringify(win.companionsOf(w).hirelings),
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: dismissCompanion clears panel` } });
      }
      if(typeof win.renderWorld === "function"){
        const html = win.renderWorld();
        if(/Gauntlet Dismissed/.test(html)){
          addFinding({ severity: "ugly", title: "renderWorld() still shows a dismissed companion",
            symptom: "'Gauntlet Dismissed' found in post-dismiss render",
            evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: dismissCompanion clears panel` } });
        }
      }
    });
    statesStaged.push("dismiss-clears-panel");
  }

  // ── State 7: save/load round-trip with a companion active (G6's helper not yet built — inline minimal round-trip) ──
  {
    const { w } = freshWorld({});
    safeInvoke("save/load round-trip with companion active", () => {
      const npc = mintNpc(w, "Gauntlet Persisted", "rolled");
      win.hireCompanion(w, { codexId: npc.id, role: "skilled" });
      const npc2 = mintNpc(w, "Gauntlet Persisted Sidekick", "rolled");
      win.promoteSidekick(w, { codexId: npc2.id, className: "Expert", cr: 0.25 });
      const before = JSON.stringify(win.U);
      const serialized = JSON.stringify(win.U);
      const reloaded = JSON.parse(serialized);
      const after = JSON.stringify(reloaded);
      if(before !== after){
        addFinding({ severity: "corrupt", title: "companion state not byte-stable across a JSON round-trip",
          symptom: "JSON.stringify(U) before/after a parse round-trip differ with a hireling + sidekick active",
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: save/load round-trip with companion` } });
      }
      const rw = reloaded.worlds[w.id];
      if(!rw || !rw.companions || rw.companions.hirelings.length !== 1 || !rw.companions.sidekickId){
        addFinding({ severity: "corrupt", title: "companion roster lost across round-trip",
          symptom: JSON.stringify(rw && rw.companions),
          evidence: { stack:null, stateSnapshot:null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g4.mjs   # stage: save/load round-trip with companion` } });
      }
    });
    statesStaged.push("save-load-roundtrip-with-companion");
  }

} catch(e) {
  harnessDefect = e;
}

// ── finalize report ──
findingCount = findings.length;
const status = harnessDefect ? "harness-defect" : "completed";

// remove any prior G4 entry (latest run wins, per §2: "the report accretes across harness runs (keyed
// by harness id, latest run wins)")
report.harnesses = (report.harnesses || []).filter(h => h.id !== HARNESS_ID);
report.harnesses.push({
  id: HARNESS_ID,
  status,
  invoked,
  skipped: 0,
  findings: findingCount,
  stats: { statesStaged, canary: CANARY, harnessDefect: harnessDefect ? String(harnessDefect.message || harnessDefect) : null },
});
report.findings = (report.findings || []).filter(f => f.harness !== HARNESS_ID).concat(findings);

if(!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`\nG4 companion states: invoked=${invoked} findings=${findingCount} states=${statesStaged.length} canary=${CANARY}`);
if(harnessDefect){
  console.log("HARNESS DEFECT:", harnessDefect.message || harnessDefect);
  console.log(harnessDefect.stack || "");
}
findings.forEach(f => console.log(`  [${f.severity}] ${f.id} — ${f.title}`));

// exit-code semantics (§0): exit 0 when the harness ran to completion; exit 1 ONLY on a harness defect.
// The canary is special-cased by the spec ("must emit >=1 finding + exit 1") — a canary run that
// successfully demonstrates the injected defect is treated as the expected RED signal.
if(harnessDefect){
  process.exit(1);
} else if(CANARY){
  process.exit(findingCount > 0 ? 1 : (() => {
    console.log("CANARY FAILED TO FIRE: no findings emitted with GAUNTLET_CANARY=1 — the detector caught nothing.");
    return 1;
  })());
} else {
  process.exit(0);
}
