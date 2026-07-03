/* PRE-PLAYTEST GAUNTLET — G2: combat math across the CR ladder (docs/PRE-PLAYTEST-GAUNTLET.md §4).
   Detection-only harness (no fixes). Boots the real genesis.html module set into jsdom (the
   dev/verify-dm-events.mjs pattern), then:
     (a) RESOLVE GAUNTLET — every bestiary entry: resolveCreature/cmFoeFrom/cmRollDamage sanity,
         custom d10 tables roll clean, one full attack exchange, INV holds.
     (b) CR BAND SIMS — Fighter + Wizard PC fixtures at L{1,3,5,7,10} vs cmPickByCR at
         CR{0,1/4,1/2,1,2,3,4,5,6,8,10}, 50 sims/cell, side-based alternation, watchdog 30 rounds.
         Directional sanity gates only (L10 vs CR0 winRate>=0.95, L1 vs CR10 winRate<=0.10) + XP check.

   Exit-code semantics (spec §0): exit 0 when the harness RAN TO COMPLETION — findings are DATA in
   the report, not test failures. Exit 1 ONLY on a harness defect (boot failure, unhandled harness
   throw, report unwritable, or — for the canary run — the canary failing to fire).

   Determinism: mulberry32 seeded from GAUNTLET_SEED (default 20260702) installed over Math.random
   BEFORE any module loads. Every finding's repro line carries the seed.

   Canary (GAUNTLET_CANARY=1): monkeypatches one bestiary entry's hp to "3d8+banana" pre-run —
   must emit >=1 `corrupt` finding and the harness process must exit 1 (spec §4 "Canary").
   NOTE: per §0, normal (non-canary) detection runs always exit 0 on completion; the canary run is
   the one deliberate exception — its job is to prove the detector fires red, so THIS FILE exits 1
   when GAUNTLET_CANARY=1 and the canary finding was captured, and exits 0 (harness defect) if the
   canary FAILED to fire (the detector itself is broken).

   Run:  node dev/gauntlet-2-combat.mjs
        GAUNTLET_SEED=20260702 GAUNTLET_CANARY=1 node dev/gauntlet-2-combat.mjs
        node dev/gauntlet-2-combat.mjs --only='rust monster'   (part (a) repro filter) */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const SEED = parseInt(process.env.GAUNTLET_SEED || "20260702", 10);
const CANARY = process.env.GAUNTLET_CANARY === "1";
const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith("--only="));
  return a ? a.slice("--only=".length) : null;
})();

const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
const FINDINGS_MD_PATH = join(ROOT, "dev/GAUNTLET-FINDINGS.md");
const FIXTURES_DIR = join(ROOT, "dev/fixtures");

// ── seeded PRNG (mulberry32 — same impl dev/verify-digest-diet.mjs uses) ────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── harness-defect guard: this is the ONLY try/catch that maps to a non-canary exit 1 ──────────
let harnessDefect = null;

const findings = [];
let findingSeq = 0;
function nextId() { findingSeq += 1; return `G2-${String(findingSeq).padStart(3, "0")}`; }
function addFinding(f) {
  const id = nextId();
  findings.push(Object.assign({ id, harness: "G2" }, f));
  return id;
}

function repro(extra) {
  const base = `GAUNTLET_SEED=${SEED} node dev/gauntlet-2-combat.mjs`;
  return extra ? `${base} ${extra}` : base;
}

// invariant set INV (spec §2), applied to a combat foe / PC sheet object
function checkInv(obj, label) {
  const problems = [];
  if (obj && "hp" in obj) {
    if (!Number.isFinite(obj.hp)) problems.push(`${label}.hp not finite (${obj.hp})`);
    const max = obj.maxHp != null ? obj.maxHp : obj.hp;
    if (Number.isFinite(obj.hp) && Number.isFinite(max) && obj.hp > max) problems.push(`${label}.hp > max (${obj.hp} > ${max})`);
  }
  return problems;
}

function snapshotWrite(id, data) {
  if (!existsSync(FIXTURES_DIR)) return null;
  const p = join(FIXTURES_DIR, `gauntlet-snap-${id}.json`);
  try { writeFileSync(p, JSON.stringify(data, null, 2)); return `dev/fixtures/gauntlet-snap-${id}.json`; }
  catch { return null; }
}

let gitCommit = "unknown";
try { gitCommit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

// ============================================================================================
// BOOT — real genesis.html module set, jsdom, seeded Math.random installed BEFORE any module load
// ============================================================================================
let win = null;
let bootStats = { invoked: 0, skipped: 0 };
const statsOut = { crBands: [] };

try {
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const harnessGlobals = `var U={worlds:{},activeWorldId:null,revealed:{}}; var GS=(typeof GS!=="undefined")?GS:{};`;
  // top-level `const`/`function` in the concatenated module source do NOT attach to `window` in a
  // classic-script eval (the "const-via-eval" gotcha — see verify-levelup.mjs's comment on this).
  // Bridge the specific symbols this harness reads directly off `win.*` back onto window explicitly.
  const bridge = `\nwindow.BESTIARY=BESTIARY; window.BESTIARY_BY_CR=BESTIARY_BY_CR; window.CLASSES=CLASSES;`;

  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
  win = dom.window;

  // seed BEFORE loading any module (spec §0 determinism) — the modules read Math.random at call
  // time (rollDie), not at load time, but seeding pre-load keeps the contract simple and exact.
  win.Math.random = mulberry32(SEED);

  // ── canary injection (pre-boot): monkeypatch one bestiary entry's hp to a garbage string ──────
  // We inject the canary via a post-load patch (below) since BESTIARY is defined inside the
  // concatenated module source; patching pre-eval would require string surgery on generated data
  // (forbidden — data/bestiary.js is untouchable). Post-load monkeypatch achieves the same defect.
  win.eval(harnessGlobals + "\n" + src + bridge);

  const need = ["resolveCreature", "cmFoeFrom", "cmRollDamage", "cmPickByCR", "resolveAttack", "pcAttack", "crXp", "pbForLevel", "awardXp", "applyLevelUp"];
  const missing = need.filter((n) => typeof win[n] !== "function");
  if (missing.length) throw new Error(`boot failure: missing globals after full load: ${missing.join(", ")}`);
  if (typeof win.BESTIARY === "undefined") throw new Error("boot failure: BESTIARY not defined after full load");

  if (CANARY) {
    const keys = Object.keys(win.BESTIARY);
    if (!keys.length) throw new Error("canary setup failure: BESTIARY is empty");
    const victimKey = keys[0];
    win.BESTIARY[victimKey] = Object.assign({}, win.BESTIARY[victimKey], { hp: "3d8+banana" });
  }
} catch (e) {
  harnessDefect = { stage: "boot", message: e && e.message, stack: e && e.stack };
}

// ============================================================================================
// (a) RESOLVE GAUNTLET — every bestiary entry
// ============================================================================================
function runResolveGauntlet() {
  const bestiary = win.BESTIARY;
  let names = Object.keys(bestiary).map((k) => bestiary[k].name || k);
  if (ONLY) names = names.filter((n) => n === ONLY || win.cmSlug(n) === win.cmSlug(ONLY));

  let invoked = 0, skipped = 0;
  const skippedNames = [];

  // a fixed PC fixture (fresh L3 Fighter-ish sheet) for the one full attack exchange
  const pcFixture = () => ({
    class: "Fighter", level: 3, hp: 28, hpCur: 28, ac: 16, profBonus: 2,
    mods: { str: 3, dex: 2, con: 2, int: 0, wis: 1, cha: 0 },
    equipped: { mainHand: "pc-wpn-1" },
    inventory: [{ id: "pc-wpn-1", name: "Longsword", conditions: [] }],
  });

  for (const name of names) {
    let entry;
    try {
      entry = win.resolveCreature(name);
    } catch (e) {
      addFinding({
        severity: "crash", title: `resolveCreature('${name}') threw`,
        symptom: e && e.message, evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro(`--only='${name}'`) },
      });
      skipped += 1; skippedNames.push(name);
      continue;
    }
    invoked += 1;

    if (!entry || typeof entry !== "object") {
      addFinding({
        severity: "crash", title: `resolveCreature('${name}') did not return an object`,
        symptom: `got ${JSON.stringify(entry)}`, evidence: { stack: null, stateSnapshot: null, repro: repro(`--only='${name}'`) },
      });
      continue;
    }

    if (!Number.isFinite(entry.hp) || entry.hp <= 0) {
      addFinding({
        severity: "corrupt", title: `resolveCreature('${name}') hp not finite/positive`,
        symptom: `hp=${JSON.stringify(entry.hp)}`,
        evidence: { stack: null, stateSnapshot: snapshotWrite(`hp-${win.cmSlug(name)}`, entry), repro: repro(`--only='${name}'`) },
      });
    }
    if (!Number.isFinite(entry.ac) || entry.ac < 5 || entry.ac > 30) {
      addFinding({
        severity: "wrong", title: `resolveCreature('${name}') ac out of sane 5-30 range`,
        symptom: `ac=${JSON.stringify(entry.ac)}`,
        evidence: { stack: null, stateSnapshot: null, repro: repro(`--only='${name}'`) },
      });
    }
    if (entry.cr === undefined) {
      addFinding({
        severity: "wrong", title: `resolveCreature('${name}') cr is undefined`,
        symptom: "entry.cr === undefined", evidence: { stack: null, stateSnapshot: null, repro: repro(`--only='${name}'`) },
      });
    }

    // cmFoeFrom builds without throw (resolveCreature already routes through it, but the spec
    // asks for an explicit build-without-throw assertion against the raw bestiary record)
    const rawId = Object.keys(bestiary).find((k) => bestiary[k].name === name) || win.cmSlug(name);
    const raw = bestiary[rawId] || bestiary[win.cmSlug(name)];
    if (raw) {
      try { win.cmFoeFrom(raw, name); }
      catch (e) {
        addFinding({
          severity: "crash", title: `cmFoeFrom() threw for '${name}'`,
          symptom: e && e.message, evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro(`--only='${name}'`) },
        });
      }
    }

    // attack spec passes cmRollDamage 100x each way, finite results >= 0
    const actions = (entry.actions || []).filter((a) => a && a.dmg);
    for (const act of actions.slice(0, 3)) { // cap per-entry to keep runtime sane across 510 entries
      for (const crit of [false, true]) {
        for (let i = 0; i < 100; i++) {
          let r;
          try { r = win.cmRollDamage(act.dmg, crit); }
          catch (e) {
            addFinding({
              severity: "crash", title: `cmRollDamage threw for '${name}' action '${act.name}'`,
              symptom: e && e.message, evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro(`--only='${name}'`) },
            });
            break;
          }
          if (!Number.isFinite(r.total) || r.total < 0) {
            addFinding({
              severity: "corrupt", title: `cmRollDamage NaN/negative for '${name}' action '${act.name}'`,
              symptom: `total=${JSON.stringify(r.total)} crit=${crit}`,
              evidence: { stack: null, stateSnapshot: snapshotWrite(`dmg-${win.cmSlug(name)}-${win.cmSlug(act.name || "atk")}`, { act, r }), repro: repro(`--only='${name}'`) },
            });
            break; // one NaN is enough to flag the action; don't flood 100x
          }
        }
      }
    }

    // custom d10 tables roll 20x without throw
    for (const tbl of entry.customTables || []) {
      for (let i = 0; i < 20; i++) {
        try {
          if (typeof win.rollOnCustomTable === "function") win.rollOnCustomTable(tbl);
          else if (Array.isArray(tbl.rows)) win.rollDie(tbl.rows.length || 10);
        } catch (e) {
          addFinding({
            severity: "crash", title: `custom d10 table threw for '${name}'`,
            symptom: e && e.message, evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro(`--only='${name}'`) },
          });
          break;
        }
      }
    }

    // one full exchange: resolveAttack foe->PC-fixture, pcAttack PC->foe
    try {
      const pc = pcFixture();
      const foe = win.resolveCreature(name);
      const foeAction = (foe.actions || [])[0];
      if (foeAction && foeAction.dmg) {
        win.resolveAttack({ atkBonus: foeAction.atk || 3, targetAC: pc.ac, dmg: foeAction.dmg });
      }
      win.pcAttack(pc, { targetAC: foe.ac });
      const invProblems = [...checkInv(pc, "pc"), ...checkInv(foe, "foe")];
      if (invProblems.length) {
        addFinding({
          severity: "corrupt", title: `INV violated in full exchange for '${name}'`,
          symptom: invProblems.join("; "),
          evidence: { stack: null, stateSnapshot: snapshotWrite(`inv-${win.cmSlug(name)}`, { pc, foe }), repro: repro(`--only='${name}'`) },
        });
      }
    } catch (e) {
      addFinding({
        severity: "crash", title: `full attack exchange threw for '${name}'`,
        symptom: e && e.message, evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro(`--only='${name}'`) },
      });
    }
  }

  return { invoked, skipped, skippedNames };
}

// ============================================================================================
// (b) CR BAND SIMS
// ============================================================================================
const LEVELS = [1, 3, 5, 7, 10];
const CRS = [0, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 8, 10];
const CLASSES_SIM = ["Fighter", "Wizard"];
const WATCHDOG_ROUNDS = 30;

// build an L1 sheet (mirrors the CLASSES arr + hd pattern verify-levelup.mjs uses for fixtures)
function buildL1Sheet(cls) {
  const base = win.CLASSES[cls];
  const scores = Object.assign({}, base.arr);
  const mods = {};
  for (const k of Object.keys(scores)) mods[k] = win.abilMod(scores[k]);
  const hp = base.hd + mods.con; // SRD L1 max-hd-value + CON
  const sh = {
    class: cls, level: 1, xp: 0, scores, mods, hp, hpCur: hp, ac: 10 + mods.dex, profBonus: 2,
    passivePerception: 10 + (mods.wis || 0), spells: [], cantrips: [],
    equipped: { mainHand: "sim-wpn" },
    inventory: [{ id: "sim-wpn", name: cls === "Wizard" ? "Quarterstaff" : "Longsword", conditions: [] }],
  };
  if (typeof win.ensureResources === "function") win.ensureResources(sh);
  return sh;
}

function leveledSheet(cls, level) {
  const sh = buildL1Sheet(cls);
  if (level > 1) {
    win.awardXp(sh, win.xpForLevel(level) - (sh.xp || 0));
    win.applyLevelUp(sh, level);
  }
  return sh;
}

function runOneSim(pc, foeTemplate) {
  // fresh copies each sim
  const sh = JSON.parse(JSON.stringify(pc));
  sh.hpCur = sh.hp;
  const foe = win.cmFoeFrom(foeTemplate, foeTemplate.name);
  let rounds = 0;
  let watchdogTripped = false;
  while (sh.hpCur > 0 && foe.hp > 0) {
    rounds += 1;
    if (rounds > WATCHDOG_ROUNDS) { watchdogTripped = true; break; }
    // PC attacks foe
    const pcRes = win.pcAttack(sh, { targetAC: foe.ac });
    if (pcRes && pcRes.hit) foe.hp = Math.max(0, foe.hp - pcRes.damage);
    if (foe.hp <= 0) break;
    // foe attacks PC
    const foeAction = (foe.actions || [])[0];
    if (foeAction && foeAction.dmg) {
      const foeRes = win.resolveAttack({ atkBonus: foeAction.atk || 3, targetAC: sh.ac, dmg: foeAction.dmg });
      if (foeRes.hit) sh.hpCur = Math.max(0, sh.hpCur - foeRes.damage);
    }
  }
  return { pcWon: foe.hp <= 0 && sh.hpCur > 0, rounds, hpLost: pc.hp - sh.hpCur, watchdogTripped, foe };
}

function runCrBandSims() {
  let totalSims = 0;
  const cellResults = [];
  for (const cls of CLASSES_SIM) {
    for (const level of LEVELS) {
      const pc = leveledSheet(cls, level);
      for (const cr of CRS) {
        const foeTemplate = win.cmPickByCR({ cr });
        if (!foeTemplate) {
          addFinding({
            severity: "review", title: `cmPickByCR(${cr}) returned nothing`,
            symptom: `no bestiary entries near CR ${cr} — cell skipped`,
            evidence: { stack: null, stateSnapshot: null, repro: repro() },
          });
          continue;
        }
        let wins = 0, roundsSum = 0, hpLostSum = 0, deaths = 0, stalemates = 0;
        for (let i = 0; i < 50; i++) {
          totalSims += 1;
          let res;
          try {
            res = runOneSim(pc, foeTemplate);
          } catch (e) {
            addFinding({
              severity: "crash", title: `CR-band sim threw (class=${cls} L=${level} CR=${cr})`,
              symptom: e && e.message,
              evidence: { stack: e && e.stack, stateSnapshot: null, repro: repro() },
            });
            continue;
          }
          if (res.watchdogTripped) {
            stalemates += 1;
            addFinding({
              severity: "review", title: `30-round stalemate (class=${cls} L=${level} CR=${cr})`,
              symptom: `sim ${i} exceeded ${WATCHDOG_ROUNDS} rounds`,
              evidence: { stack: null, stateSnapshot: null, repro: repro() },
            });
            continue;
          }
          if (res.pcWon) wins += 1; else deaths += 1;
          roundsSum += res.rounds; hpLostSum += Math.max(0, res.hpLost);

          // INV + XP check on a win
          if (res.pcWon) {
            const xp = win.crXp(foeTemplate.cr);
            if (!Number.isFinite(xp) || xp <= 0) {
              addFinding({
                severity: "wrong", title: `crXp(${JSON.stringify(foeTemplate.cr)}) not finite/positive`,
                symptom: `xp=${JSON.stringify(xp)} for foe '${foeTemplate.name}'`,
                evidence: { stack: null, stateSnapshot: null, repro: repro() },
              });
            }
          }
        }
        const n = wins + deaths;
        const winRate = n ? wins / n : null;
        const meanRounds = n ? roundsSum / n : null;
        const meanPcHpLost = n ? hpLostSum / n : null;
        cellResults.push({ class: cls, level, cr, sims: n, winRate, meanRounds, meanPcHpLost, pcDeaths: deaths, stalemates });
      }
    }
  }
  return { totalSims, cellResults };
}

function directionalGates(cellResults) {
  // L10 vs CR0 winRate >= 0.95; L1 vs CR10 winRate <= 0.10 — per spec, per class, "wrong" if inverted
  for (const cls of CLASSES_SIM) {
    const hi = cellResults.find((c) => c.class === cls && c.level === 10 && c.cr === 0);
    if (hi && hi.winRate != null && hi.winRate < 0.95) {
      addFinding({
        severity: "wrong", title: `L10 ${cls} vs CR0 winRate below 0.95 gate`,
        symptom: `winRate=${hi.winRate}`,
        evidence: { stack: null, stateSnapshot: null, repro: repro() },
      });
    }
    const lo = cellResults.find((c) => c.class === cls && c.level === 1 && c.cr === 10);
    if (lo && lo.winRate != null && lo.winRate > 0.10) {
      addFinding({
        severity: "wrong", title: `L1 ${cls} vs CR10 winRate above 0.10 gate`,
        symptom: `winRate=${lo.winRate}`,
        evidence: { stack: null, stateSnapshot: null, repro: repro() },
      });
    }
  }
}

// ============================================================================================
// RUN
// ============================================================================================
let harnessStatus = "completed";
let bestiaryCount = 0;

if (!harnessDefect) {
  try {
    bestiaryCount = Object.keys(win.BESTIARY).length;
    const a = runResolveGauntlet();
    bootStats = { invoked: a.invoked, skipped: a.skipped, skippedNames: a.skippedNames };

    const b = runCrBandSims();
    statsOut.crBands = b.cellResults;
    directionalGates(b.cellResults);
    bootStats.crBandSims = b.totalSims;
  } catch (e) {
    harnessDefect = { stage: "run", message: e && e.message, stack: e && e.stack };
  }
}

// ============================================================================================
// CANARY-EXPECTATION CHECK — only meaningful when GAUNTLET_CANARY=1
// ============================================================================================
let canaryFired = false;
if (CANARY && !harnessDefect) {
  canaryFired = findings.some((f) => f.severity === "corrupt" || f.severity === "crash");
}

// ============================================================================================
// REPORT WRITER (spec §2 contract) — accretes across harness runs, keyed by harness id
// ============================================================================================
function writeReport() {
  let report;
  try {
    report = existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, "utf-8")) : null;
  } catch { report = null; }
  if (!report || typeof report !== "object") {
    report = { run: {}, harnesses: [], findings: [] };
  }
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit: gitCommit };

  const harnessEntry = {
    id: "G2",
    status: harnessDefect ? "harness-defect" : "completed",
    invoked: bootStats.invoked || 0,
    skipped: bootStats.skipped || 0,
    findings: findings.length,
    stats: {
      bestiaryCount,
      crBandSims: bootStats.crBandSims || 0,
      crBands: statsOut.crBands,
      skippedNames: bootStats.skippedNames || [],
    },
  };
  if (harnessDefect) harnessEntry.defect = harnessDefect;
  if (CANARY) harnessEntry.canaryRun = true, harnessEntry.canaryFired = canaryFired;

  // keyed by harness id, latest run wins
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== "G2");
  report.harnesses.push(harnessEntry);

  // findings: drop this harness's prior findings, append fresh ones (latest run wins, same rule)
  report.findings = (report.findings || []).filter((f) => f.harness !== "G2");
  for (const f of findings) {
    // collision-zone tagging: G2 exercises src/engine/combat.js (a listed collision-zone file) —
    // per spec §1, findings ATTRIBUTABLE to that file get flagged, never fixed. G2's own findings
    // are about combat.js / bestiary data behavior by construction, so flag them all here; the
    // Opus triage pass (rung 3) is the actual arbiter of "attributable," but the harness must not
    // silently omit the flag.
    f.collisionZone = true;
    report.findings.push(f);
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // human-digest regenerate (grouped by severity, all harnesses in the report)
  const bySeverity = { crash: [], corrupt: [], wrong: [], ugly: [], review: [] };
  for (const f of report.findings) (bySeverity[f.severity] || (bySeverity[f.severity] = [])).push(f);
  let md = `# GAUNTLET FINDINGS\n\nrun: ${report.run.date} · seed ${report.run.seed} · commit ${report.run.commit}\n\n`;
  for (const sev of ["crash", "corrupt", "wrong", "ugly", "review"]) {
    const list = bySeverity[sev] || [];
    md += `## ${sev} (${list.length})\n\n`;
    for (const f of list) {
      md += `- **${f.id}** [${f.harness}]${f.collisionZone ? " ⚠ collisionZone" : ""} — ${f.title}\n  ${f.symptom || ""}\n  repro: \`${f.evidence && f.evidence.repro}\`\n`;
    }
    md += "\n";
  }
  writeFileSync(FINDINGS_MD_PATH, md);
}

try {
  writeReport();
} catch (e) {
  if (!harnessDefect) harnessDefect = { stage: "report-write", message: e && e.message, stack: e && e.stack };
}

// ============================================================================================
// SUMMARY + EXIT
// ============================================================================================
console.log(`G2 combat gauntlet — seed ${SEED}${CANARY ? " [CANARY]" : ""}`);
if (harnessDefect) {
  console.log(`  ✗ HARNESS DEFECT at stage '${harnessDefect.stage}': ${harnessDefect.message}`);
  console.log(harnessDefect.stack || "");
  process.exit(1);
}
console.log(`  resolve gauntlet: invoked=${bootStats.invoked} skipped=${bootStats.skipped} (of ${bestiaryCount} bestiary entries)`);
console.log(`  CR-band sims: ${bootStats.crBandSims} completed`);
console.log(`  findings: ${findings.length} (${findings.filter((f) => f.severity === "crash").length} crash, ${findings.filter((f) => f.severity === "corrupt").length} corrupt, ${findings.filter((f) => f.severity === "wrong").length} wrong, ${findings.filter((f) => f.severity === "ugly").length} ugly, ${findings.filter((f) => f.severity === "review").length} review)`);
console.log(`  report: dev/gauntlet-report.json`);

if (CANARY) {
  if (canaryFired) {
    console.log("  ✓ CANARY FIRED — detector confirmed red.");
    process.exit(1); // spec §4 canary contract: must exit 1
  } else {
    console.log("  ✗ CANARY DID NOT FIRE — detector is broken (this is itself a harness defect).");
    process.exit(1);
  }
}

process.exit(0); // spec §0: normal completion always exits 0 — findings are data, not test failures
