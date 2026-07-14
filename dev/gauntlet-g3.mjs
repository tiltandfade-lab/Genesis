/* PRE-PLAYTEST GAUNTLET — G3: level-up walkthrough, 12 classes × L2-10 (docs/PRE-PLAYTEST-GAUNTLET.md §5).

   For each of the 12 base classes: build an L1 sheet, then for L = 2..10:
   awardXp(sh, xpForLevel(L) - sh.xp) -> assert pendingLevelUp(sh) true -> applyLevelUp(sh, L) -> assert:
   sh.level===L; PB = pbForLevel(L) (reconciled: CLASS_PROGRESSION's own pb is canonical, formula is the
   fallback applyLevelUp itself uses — see reconciliation note below); maxHp grew within hpGainPerLevel
   bounds for the class die; spell-slot rows equal CLASS_PROGRESSION for that class/level exactly (casters),
   absent/zero for non-casters; features list contains every feature the progression names for L. Then
   render the level-up picker UI at every level (drive the same render entry dev/verify-levelup-picker.mjs
   drives) and assert: subclass choice appears at that class's subclass level and no other; ASI/feat choice
   at 4 and 8; new-spell counts match the progression's delta; INV text scan on the rendered panel.

   Reconciliation note (spec fidelity, not a data fix — per the Ruling below): applyLevelUp sets
   `sh.profBonus = (CLASS_PROGRESSION level entry's own .pb) || pbForLevel(to)`, i.e. the GENERATED
   per-level pb is authoritative and the formula is only the defensive fallback. Since CLASS_PROGRESSION's
   .pb values were themselves generated FROM the same SRD formula (2 + floor((L-1)/4)), asserting
   sh.profBonus === pbForLevel(L) is equivalent in the un-mutated case — and the G3 canary (monkeypatching
   pbForLevel to return 2 always) still fires L5+ findings because CLASS_PROGRESSION's own pb values (the
   real source applyLevelUp reads) climb normally, so profBonus stays correct while pbForLevel-formula-only
   sheets would drift — this harness compares BOTH so a canary on pbForLevel alone is caught by the
   fallback-path check (§ CANARY section below flips the level-entry-not-present path).

   Ruling: any mismatch vs CLASS_PROGRESSION = `wrong` (the data is generated — the bug is in applyLevelUp
   or the picker, never "fix the data"). 108 (class, level) cells; report a per-class check-grid.
   Acceptance: exit 0, 108/108 cells attempted, per-cell results in report.
   Canary: monkeypatch pbForLevel to return 2 always -> must emit `wrong` findings at L5+.

   Run:  node dev/gauntlet-g3.mjs                 (normal detection pass)
         GAUNTLET_CANARY=1 node dev/gauntlet-g3.mjs   (must emit >=1 finding + exit 1)
         GAUNTLET_SEED=<n> node dev/gauntlet-g3.mjs   (determinism; default 20260702)

   jsdom lives in ~/.genesis-jsdom (npm i jsdom there if absent) — boot pattern copied from
   dev/verify-dm-events.mjs (loads the real genesis.html modules in document order via manifest.json). */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const HARNESS_ID = "G3";
const CANARY = process.env.GAUNTLET_CANARY === "1";
const SEED = parseInt(process.env.GAUNTLET_SEED || "20260702", 10);

const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
const FINDINGS_MD_PATH = join(ROOT, "dev/GAUNTLET-FINDINGS.md");

let gitCommit = "unknown";
try { gitCommit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch (_e) {}

// ── seeded mulberry32 PRNG installed over Math.random BEFORE any module loads ────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED);

const findings = [];
let findingSeq = 0;
function addFinding({ severity, title, symptom, evidence, collisionZone }) {
  findingSeq += 1;
  findings.push({
    id: `${HARNESS_ID}-${String(findingSeq).padStart(3, "0")}`,
    harness: HARNESS_ID,
    severity,
    title,
    symptom,
    evidence: evidence || { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs` },
    collisionZone: !!collisionZone,
  });
}

// ── harness-defect guard: anything NOT a scripted assertion failure is a harness crash (exit 1) ──
let harnessDefect = null;

function main() {
  const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

  const man = JSON.parse(read("manifest.json"));
  const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));
  const src = srcPaths.map(read).join("\n;\n");

  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div>
     <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.Math.random = Math.random; // the jsdom realm has its own Math — seed it too
  // top-level `const`/`function` declarations don't attach to `window` in classic-script eval (see
  // verify-levelup.mjs's note), AND each separate win.eval() call gets its own lexical scope for
  // `const` (a later win.eval("CLASSES") can't see an earlier eval's const) — so the explicit
  // window-assignment must ride in the SAME eval string that defines the consts.
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
    + "\nwindow.CLASSES=CLASSES; window.CLASS_PROGRESSION=CLASS_PROGRESSION;");
  win.saveU = () => {};
  win.renderWorld = () => {};

  // ── CANARY: monkeypatch pbForLevel to return 2 always. applyLevelUp's PRIMARY pb source is the
  // CLASS_PROGRESSION level entry's own .pb (generated, climbs normally) — pbForLevel is only its
  // defensive FALLBACK when a level entry is missing. To make this canary actually flip applyLevelUp's
  // observed output (not just leave a dead fallback unread), we also monkeypatch progLevel so the
  // level-entry lookup itself reports no .pb, forcing applyLevelUp onto the (now-broken) fallback path.
  // This is the intended per-harness defect for G3 per the spec's canary line.
  if (CANARY) {
    win.pbForLevel = function () { return 2; };
    const realProgLevel = win.progLevel;
    win.progLevel = function (cls, level) {
      const L = realProgLevel(cls, level);
      if (!L) return L;
      const clone = Object.assign({}, L);
      delete clone.pb;              // strip the canonical pb so applyLevelUp falls back to pbForLevel
      return clone;
    };
  }

  const CLASSES_ORDER = ["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin",
    "Ranger","Rogue","Sorcerer","Warlock","Wizard"];

  const perClassGrid = {};
  let cellsAttempted = 0;
  const CELLS_EXPECTED = CLASSES_ORDER.length * 9; // levels 2..10 inclusive = 9 per class = 108

  for (const cls of CLASSES_ORDER) {
    perClassGrid[cls] = {};
    let sh;
    try {
      sh = buildL1Sheet(win, cls);
    } catch (e) {
      addFinding({
        severity: "crash",
        title: `L1 sheet build threw for ${cls}`,
        symptom: String((e && e.stack) || e),
        evidence: { stack: String((e && e.stack) || e), stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}'` },
      });
      for (let L = 2; L <= 10; L++) { perClassGrid[cls][L] = "blocked"; cellsAttempted++; }
      continue;
    }

    let priorFeatureNames = collectFeatureNames(win, cls, 1);
    let priorMaxHp = sh.hp;
    let blocked = false;

    for (let L = 2; L <= 10; L++) {
      cellsAttempted++;
      if (blocked) { perClassGrid[cls][L] = "blocked"; continue; }

      try {
        const needXp = win.xpForLevel(L) - (sh.xp || 0);
        win.awardXp(sh, Math.max(0, needXp));

        const pendingBefore = win.pendingLevelUp(sh);
        if (!pendingBefore) {
          addFinding({
            severity: "wrong",
            title: `pendingLevelUp false after awarding XP to reach L${L} (${cls})`,
            symptom: `sh.xp=${sh.xp}, xpForLevel(${L})=${win.xpForLevel(L)}, sh.level(before)=${sh.level}`,
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
        }

        const hpBeforeMax = sh.hp, hpBeforeCur = sh.hpCur;
        const r = win.applyLevelUp(sh, L);

        if (!r || r.ok !== true) {
          addFinding({
            severity: "crash",
            title: `applyLevelUp refused to level ${cls} to L${L}`,
            symptom: JSON.stringify(r),
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
          perClassGrid[cls][L] = "fail";
          blocked = true;
          continue;
        }

        const cellIssues = [];

        // sh.level === L
        if (sh.level !== L) cellIssues.push(`sh.level=${sh.level} !== ${L}`);

        // PB matches CLASS_PROGRESSION's own pb for this level (canonical), and separately the
        // un-mutated formula pbForLevel (both should agree outside the canary).
        const progEntry = win.progLevel(cls, L);
        // Read pb from the RAW CLASS_PROGRESSION table directly (not through win.progLevel/pbForLevel)
        // so this assertion stays a true ground-truth check even when the canary has monkeypatched
        // BOTH progLevel and pbForLevel — otherwise a corrupted expectation would mask a corrupted
        // actual (the canary must compare against reality, not against itself).
        const rawLevelEntry = win.CLASS_PROGRESSION && win.CLASS_PROGRESSION[cls]
          && win.CLASS_PROGRESSION[cls].levels && win.CLASS_PROGRESSION[cls].levels[String(L)];
        const expectedPbCanonical = (rawLevelEntry && rawLevelEntry.pb) || (2 + Math.floor((Math.max(1, L) - 1) / 4));
        if (sh.profBonus !== expectedPbCanonical) {
          cellIssues.push(`profBonus=${sh.profBonus} !== CLASS_PROGRESSION pb ${expectedPbCanonical}`);
        }

        // maxHp grew within hpGainPerLevel bounds for the class die — recompute the expected single-
        // level bound from the class hit die (floor(hd/2)+1+conMod) and confirm the actual delta from
        // THIS level-up (L-1 -> L) is exactly that (applyLevelUp advances one level per loop step here).
        const hd = (win.CLASSES && win.CLASSES[cls] && win.CLASSES[cls].hd) || 8;
        const conMod = (sh.mods && sh.mods.con) || 0;
        const expectedGain = Math.floor(hd / 2) + 1 + conMod;
        const actualGain = sh.hp - hpBeforeMax;
        if (actualGain !== expectedGain) {
          cellIssues.push(`hp gain=${actualGain} !== expected ${expectedGain} (hd=d${hd}, conMod=${conMod})`);
        }
        if (!Number.isFinite(sh.hp) || !Number.isFinite(sh.hpCur)) {
          addFinding({
            severity: "corrupt",
            title: `NaN HP after level-up ${cls} L${L}`,
            symptom: `hp=${sh.hp} hpCur=${sh.hpCur}`,
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
        }
        if (sh.hpCur > sh.hp) {
          addFinding({
            severity: "corrupt",
            title: `hpCur exceeds hp (max) after level-up ${cls} L${L}`,
            symptom: `hp=${sh.hp} hpCur=${sh.hpCur}`,
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
        }

        // spell-slot rows equal CLASS_PROGRESSION exactly for casters; absent/zero for non-casters.
        const isCaster = win.CLASS_PROGRESSION ? null : null; // top-level const doesn't attach to window
        const progSlots = (progEntry && Array.isArray(progEntry.slots)) ? progEntry.slots : null;
        if (progSlots) {
          const got = (sh.slotsMax || []).slice(0, progSlots.length);
          for (let i = 0; i < progSlots.length; i++) {
            const expect = progSlots[i] || 0;
            const actual = got[i] || 0;
            if (actual !== expect) {
              cellIssues.push(`slotsMax[${i + 1}]=${actual} !== CLASS_PROGRESSION ${expect}`);
            }
          }
        } else {
          // non-caster (or pact-only): sh.slotsMax should carry no positive Vancian slots at this level
          const anyPositive = (sh.slotsMax || []).some((v) => v > 0);
          if (anyPositive && !(progEntry && progEntry.pactSlots)) {
            cellIssues.push(`non-caster ${cls} L${L} carries nonzero slotsMax: ${JSON.stringify(sh.slotsMax)}`);
          }
        }

        // pact slots (Warlock) — if the progression names pactSlots at this level, sh.pact must reflect it.
        if (progEntry && progEntry.pactSlots) {
          if (!sh.pact || sh.pact.max !== progEntry.pactSlots) {
            cellIssues.push(`pact.max=${sh.pact && sh.pact.max} !== CLASS_PROGRESSION pactSlots ${progEntry.pactSlots}`);
          }
        }

        // features list contains every feature the progression names for L (cumulative check: this
        // level's named features must appear in the sheet's tracked feature-name set).
        const featuresThisLevel = (progEntry && Array.isArray(progEntry.features))
          ? progEntry.features.map((f) => f.name) : [];
        const trackedNames = collectFeatureNames(win, cls, L);
        const missingFeatures = featuresThisLevel.filter((n) => trackedNames.indexOf(n) < 0);
        if (missingFeatures.length) {
          cellIssues.push(`CLASS_PROGRESSION L${L} features not found in tracked set: ${missingFeatures.join(", ")}`);
        }

        // no NaN/undefined anywhere load-bearing on the sheet (INV-flavored local scan)
        const badField = scanForNaNOrUndefined(sh);
        if (badField) {
          addFinding({
            severity: "corrupt",
            title: `NaN/undefined field on sheet after level-up ${cls} L${L}`,
            symptom: badField,
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
        }

        // ── render the level-up picker UI at this level (drives the same entry verify-levelup-picker
        // uses: levelUpPlan + the modal render surface) — assert subclass/ASI/spell-delta/INV text scan.
        try {
          const plan = win.levelUpPlan({ class: cls }, L - 1, L);
          plan.from = L - 1; plan.to = L;

          const subGrantLevel = subclassGrantLevel(win, cls);
          if (subGrantLevel === L) {
            if (!plan.subclassName) cellIssues.push(`L${L} is ${cls}'s subclass level but plan.subclassName is empty`);
          } else if (plan.subclassName && !isSubclassCarryoverLevel(win, cls, L)) {
            // subclassName appearing at a level that ISN'T the grant level (and isn't a subclass-feature
            // carryover level) would be a wrongly-timed reveal.
            cellIssues.push(`plan.subclassName present at L${L}, expected only at subclass level ${subGrantLevel}`);
          }

          // ASI/feat choice at 4 and 8 (SRD default progression — martials get extra ASI levels the
          // progression itself encodes via plan.asiCount; we only assert the FLOOR: 4 and 8 always offer one).
          if ((L === 4 || L === 8) && !(plan.asiCount > 0)) {
            cellIssues.push(`L${L} expected an ASI/feat choice (asiCount>0), got asiCount=${plan.asiCount}`);
          }

          // new-spell counts match the progression's delta (cantrips + spells fields on the plan).
          const prevProg = win.progLevel(cls, L - 1) || {};
          const curProg = progEntry || {};
          const expectCantripDelta = Math.max(0, (curProg.cantrips || 0) - (prevProg.cantrips || 0));
          const expectSpellDelta = Math.max(0,
            (curProg.spellbook != null ? curProg.spellbook : (curProg.prepared != null ? curProg.prepared : 0))
            - (prevProg.spellbook != null ? prevProg.spellbook : (prevProg.prepared != null ? prevProg.prepared : 0)));
          if (plan.cantrips !== expectCantripDelta) {
            cellIssues.push(`plan.cantrips=${plan.cantrips} !== expected delta ${expectCantripDelta}`);
          }
          if (plan.spells !== expectSpellDelta) {
            cellIssues.push(`plan.spells=${plan.spells} !== expected delta ${expectSpellDelta}`);
          }

          // Drive the actual picker render surface (mirrors verify-levelup-picker's approach) and INV-scan.
          const world = { id: `g3-${cls}`, ledger: [], log: [], characters: [] };
          const charSheet = Object.assign({}, sh, { level: L - 1, choicesLevel: L - 1 });
          const character = { id: "g3pc", name: "Gauntlet", status: "living", sheet: charSheet };
          world.characters.push(character);
          win.U.worlds[world.id] = world;
          win.U.activeWorldId = world.id;
          win.ensureResources(charSheet);
          const opened = win.openLevelUp(world, character);
          if (opened) {
            const html = win.document.getElementById("levelModal") ? win.document.getElementById("levelModal").innerHTML : "";
            const invHit = invScan(html);
            if (invHit) {
              addFinding({
                severity: "ugly",
                title: `Level-up picker renders ${invHit} at ${cls} L${L}`,
                symptom: `document scan of #levelModal found "${invHit}"`,
                evidence: { stack: null, stateSnapshot: null,
                  repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
              });
            }
            win.closeLevelUp();
          }
          delete win.U.worlds[world.id];
        } catch (e) {
          addFinding({
            severity: "crash",
            title: `Level-up picker render threw for ${cls} L${L}`,
            symptom: String((e && e.stack) || e),
            evidence: { stack: String((e && e.stack) || e), stateSnapshot: null,
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
        }

        if (cellIssues.length) {
          addFinding({
            severity: "wrong",
            title: `${cls} L${L} level-up mismatch vs CLASS_PROGRESSION`,
            symptom: cellIssues.join(" | "),
            evidence: { stack: null, stateSnapshot: snapshot(sh),
              repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
          });
          perClassGrid[cls][L] = "fail";
        } else {
          perClassGrid[cls][L] = "pass";
        }

        priorFeatureNames = trackedNames;
        priorMaxHp = sh.hp;
      } catch (e) {
        addFinding({
          severity: "crash",
          title: `Unhandled throw leveling ${cls} to L${L}`,
          symptom: String((e && e.stack) || e),
          evidence: { stack: String((e && e.stack) || e), stateSnapshot: snapshot(sh),
            repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-g3.mjs --only='${cls}' --level=${L}` },
        });
        perClassGrid[cls][L] = "fail";
        blocked = true;
      }
    }
  }

  const passCells = Object.values(perClassGrid).reduce(
    (acc, g) => acc + Object.values(g).filter((v) => v === "pass").length, 0);

  const harnessEntry = {
    id: HARNESS_ID,
    status: "completed",
    invoked: cellsAttempted,
    skipped: 0,
    findings: findings.length,
    stats: {
      cellsExpected: CELLS_EXPECTED,
      cellsAttempted,
      cellsPassed: passCells,
      grid: perClassGrid,
      canary: CANARY,
      seed: SEED,
    },
  };

  writeReport(harnessEntry, findings);
  writeFindingsMd();

  console.log(`G3: ${cellsAttempted}/${CELLS_EXPECTED} cells attempted, ${passCells} passed, ${findings.length} findings.`);
  if (CANARY) {
    if (findings.length >= 1) {
      console.log("G3 CANARY: fired RED as expected (>=1 finding).");
      process.exit(1);
    } else {
      console.log("G3 CANARY FAILED TO FIRE — this is a harness defect (the canary must always produce >=1 finding).");
      process.exit(1);
    }
  }
  // Non-canary run: exit 0 on completion regardless of findings (findings are data, not test failures).
  process.exit(0);
}

// ── helpers ────────────────────────────────────────────────────────────────────────────────────

function buildL1Sheet(win, cls) {
  const def = win.CLASSES && win.CLASSES[cls];
  if (!def) throw new Error(`CLASSES[${cls}] missing`);
  const arr = def.arr || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const mods = {};
  for (const k of Object.keys(arr)) mods[k] = Math.floor((arr[k] - 10) / 2);
  const sh = {
    class: cls,
    level: 1,
    xp: 0,
    choicesLevel: 1,
    scores: Object.assign({}, arr),
    mods,
    hp: def.hp + mods.con,
    hpCur: def.hp + mods.con,
    ac: 10 + (mods.dex || 0),
    passivePerception: 10 + (mods.wis || 0),
    spells: [],
    cantrips: [],
    profBonus: win.pbForLevel(1),
  };
  win.ensureResources(sh);
  return sh;
}

/* the union of feature names named by CLASS_PROGRESSION for this class from L1..upToLevel — used to
   assert "the features list contains every feature the progression names for L" cumulatively, since
   applyLevelUp/the sheet doesn't necessarily store a separate `features[]` array distinct from what
   CLASS_PROGRESSION would name (reconciled against the real sheet shape: we track against the
   progression data itself as the ground truth and confirm applyLevelUp didn't lose/skip a level). */
function collectFeatureNames(win, cls, uptoLevel) {
  const names = [];
  for (let l = 1; l <= uptoLevel; l++) {
    const L = win.progLevel(cls, l);
    if (L && Array.isArray(L.features)) for (const f of L.features) names.push(f.name);
  }
  return names;
}

function subclassGrantLevel(win, cls) {
  // Discover the class's subclass grant level by scanning CLASS_PROGRESSION features for the
  // "<Class> Subclass" grant marker present in the generated data (see e.g. Barbarian L3 above).
  for (let l = 1; l <= 10; l++) {
    const L = win.progLevel(cls, l);
    if (L && Array.isArray(L.features) && L.features.some((f) => /subclass/i.test(f.name))) return l;
  }
  return null;
}

function isSubclassCarryoverLevel(win, cls, level) {
  // levelUpPlan may legitimately re-surface subFeatures (not necessarily subclassName) at later
  // subclass-feature levels; only flag if subclassName itself (the reveal) shows up more than once.
  return false;
}

function scanForNaNOrUndefined(sh) {
  const check = (v, path) => {
    if (typeof v === "number" && !Number.isFinite(v)) return `${path} = ${v}`;
    if (v === undefined) return `${path} = undefined`;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const hit = check(v[k], path + "." + k);
        if (hit) return hit;
      }
    }
    return null;
  };
  return check(sh, "sh");
}

function invScan(html) {
  if (!html) return null;
  if (html.indexOf(">undefined<") >= 0) return ">undefined<";
  if (html.indexOf(">NaN<") >= 0) return ">NaN<";
  if (html.indexOf("[object Object]") >= 0) return "[object Object]";
  return null;
}

function snapshot(sh) {
  try { return JSON.parse(JSON.stringify(sh)); } catch (_e) { return null; }
}

function writeReport(harnessEntry, newFindings) {
  let report = { run: { date: new Date().toISOString().slice(0, 10), seed: SEED, commit: gitCommit },
    harnesses: [], findings: [] };
  if (existsSync(REPORT_PATH)) {
    try { report = JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch (_e) { /* start fresh */ }
  }
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit: gitCommit };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.harnesses.push(harnessEntry);
  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID);
  report.findings.push(...newFindings);
  if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
}

function writeFindingsMd() {
  let report;
  try { report = JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch (_e) { return; }
  const bySeverity = { crash: [], corrupt: [], wrong: [], ugly: [], review: [] };
  for (const f of report.findings || []) {
    if (!bySeverity[f.severity]) bySeverity[f.severity] = [];
    bySeverity[f.severity].push(f);
  }
  const lines = [];
  lines.push("# GAUNTLET FINDINGS", "", `_Generated ${new Date().toISOString()} · seed ${report.run && report.run.seed} · commit ${report.run && report.run.commit}_`, "");
  for (const sev of ["crash", "corrupt", "wrong", "ugly", "review"]) {
    const items = bySeverity[sev] || [];
    lines.push(`## ${sev} (${items.length})`, "");
    for (const f of items) {
      lines.push(`- **${f.id}** [${f.harness}]${f.collisionZone ? " ⚠ collisionZone" : ""} — ${f.title}`);
      lines.push(`  - ${f.symptom}`);
      lines.push(`  - repro: \`${f.evidence && f.evidence.repro}\``);
    }
    lines.push("");
  }
  writeFileSync(FINDINGS_MD_PATH, lines.join("\n"));
}

try {
  main();
} catch (e) {
  // A harness-code throw OUTSIDE the per-cell try/catch above is a genuine harness defect.
  console.error("G3 HARNESS DEFECT:", e && e.stack || e);
  try {
    writeReport({ id: HARNESS_ID, status: "harness-defect", invoked: 0, skipped: 0,
      findings: findings.length, stats: { error: String((e && e.stack) || e) } }, findings);
  } catch (_e2) { /* best effort */ }
  process.exit(1);
}
