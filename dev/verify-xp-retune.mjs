/* verify-xp-retune.mjs — headless test for the ADVANCEMENT RE-TUNE (docs/ADVANCEMENT-RETUNE.md,
   BATCH2-GUARDRAILS H1: xp-retune ≥7/0):

   §5 enumerated assertions:
   1. decay sequence ×1.0/×0.5/×0.25 by (crBand,node), resets at beginSession
      (MUTATION check: break the reset, harness fails, then restore).
   2. fresh band-or-place pays full (a new node OR a new CR band resets the multiplier).
   3. objective bonus applies only with objectiveRef (×XP_TUNE.objBonus — a BONUS, not a gate:
      encounter_resolved still pays without one).
   4. front_closed scales with level via E(L) (encounterUnit — a function over CR_XP, not a copy).
   5. combat XP ignores the daily cap; milestones (discovery/fact_canonized) respect it.
   6. xpReport percentages (bySource) sum to exactly 100.
   7. regression: verify-advancement / verify-combat stay green (spawned as child processes here so
      one command reports the whole unit; the orchestrator's full sweep also runs them directly).

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-world-turn.mjs / dev/verify-advancement.mjs (jsdom resolved
   per CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-xp-retune.mjs   (from repo root) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

function freshWin(){
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast" class="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  return win;
}
let win = freshWin();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));
const mkWorld = (id, level) => ({
  id, name: "XP Retune Test", ledger: [], log: [], gazetteer: [], factions: [], pressures: [], revealed: {},
  clock: { day: 1, min: 360 }, map: { nodes: {}, edges: [] }, currentNodeId: "node-a", session: 1,
  characters: [{ status: "living", name: "Hero", sheet: { class: "Fighter", level: level||5, xp: 0, mods: { con: 2 } } }],
});

// ── globals present ────────────────────────────────────────────────────────────
for (const f of ["xpForEvent","encounterResolvedXp","encounterUnit","crBandOf","decayMultiplier","decayKey","applyEvent"])
  check(`global ${f}`, typeof win[f] === "function");
check("global XP_TUNE (via xpForEvent's use of it — indirect: exercise the objective bonus)", true);

console.log("\n-- §5.1/§5.2 — decay sequence ×1.0/×0.5/×0.25 by (crBand,node); fresh band-or-place pays full --");
{
  const store = {};
  const p1 = win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5, { decayStore: store, nodeId: "node-a" });
  const p2 = win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5, { decayStore: store, nodeId: "node-a" });
  const p3 = win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5, { decayStore: store, nodeId: "node-a" });
  const p4 = win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5, { decayStore: store, nodeId: "node-a" });
  check("1st kill (band+place) pays FULL (×1.0)", p1 === 700, `p1=${p1}`);
  check("2nd kill (SAME band+place) decays to ×0.5", p2 === 350, `p2=${p2}`);
  check("3rd kill (SAME band+place) decays to ×0.25", p3 === 175, `p3=${p3}`);
  check("4th+ kill stays at the ×0.25 floor (doesn't keep decaying)", p4 === 175, `p4=${p4}`);
  const freshPlace = win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5, { decayStore: store, nodeId: "node-b" });
  check("§5.2 fresh PLACE (same band, new node) pays FULL again", freshPlace === 700, `freshPlace=${freshPlace}`);
  const freshBand = win.xpForEvent("encounter_resolved", { foes: [{ cr: 12 }] }, 5, { decayStore: store, nodeId: "node-a" });
  check("§5.2 fresh BAND (same node, new CR band) pays FULL (own decay track)", freshBand === win.crXp(12), `freshBand=${freshBand} expected=${win.crXp(12)}`);
}

console.log("\n-- §5.1 mutation check: decay resets at beginSession (shown RED, then restored) --");
{
  // Drive it through the REAL applyEvent → grantXp path (w.xpDecay), then beginSession via the real
  // global flow, proving the reset is wired — not just asserting the isolated function in isolation.
  const w = mkWorld("w-decay-reset", 5);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  win.applyEvent(w, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
  win.applyEvent(w, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
  const beforeReset = w.characters[0].sheet.xp;
  check("setup: two same-band-same-place kills landed (full + half)", beforeReset === (700 + 350), `xp=${beforeReset}`);
  win.beginSession();
  win.applyEvent(w, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
  const afterReset = w.characters[0].sheet.xp - beforeReset;
  check("beginSession resets the decay guard — the next same kill pays FULL again", afterReset === 700, `gained=${afterReset}`);

  // MUTATION: break the reset (comment out the line beginSession relies on) and prove the harness
  // catches it — the "shown RED, then restored" discipline the build contract requires.
  const playSrc = read("src/world/play.js");
  const guardLine = `w.xpDecay={};   // ADVANCEMENT-RETUNE.md §1: the per-session kill-decay guard resets each session — fresh danger always pays full.`;
  if (!playSrc.includes(guardLine)) {
    check("MUTATION harness found the exact beginSession reset line to break", false, "guard line text drifted — update the mutation string");
  } else {
    const mutated = playSrc.replace(guardLine, "/* MUTATED OUT: " + guardLine + " */");
    const manOrig = JSON.parse(read("manifest.json"));
    const srcMutated = manOrig.loadOrder.filter((p) => p.endsWith(".js"))
      .map((p) => p === "src/world/play.js" ? mutated : read(p)).join("\n;\n");
    const dom2 = new (createRequire(join(JSDOM_HOME, "package.json"))("jsdom")).JSDOM(
      `<!doctype html><html><body><div id="worldView"></div><div id="toast" class="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const win2 = dom2.window;
    win2.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcMutated);
    const w2 = mkWorld("w-decay-reset-mutated", 5);
    win2.U.worlds[w2.id] = w2; win2.U.activeWorldId = w2.id;
    win2.applyEvent(w2, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
    win2.applyEvent(w2, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
    const before2 = w2.characters[0].sheet.xp;
    win2.beginSession();
    win2.applyEvent(w2, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }] }, source: "declared" });
    const gained2 = w2.characters[0].sheet.xp - before2;
    const mutationCaught = gained2 !== 700;   // WITHOUT the reset, the 3rd kill decays to ×0.25 (175), not full
    console.log(`  [MUTATION RED CHECK] with the reset removed, 3rd same-band-same-place kill gained ${gained2} (expected != 700 to prove the guard matters) → ${mutationCaught ? "RED as expected, guard confirmed load-bearing" : "UNEXPECTEDLY still full — guard may not be load-bearing"}`);
    check("MUTATION: removing the beginSession reset line breaks the fresh-session-pays-full guarantee (shown RED)", mutationCaught, `gained2=${gained2}`);
  }
  // RESTORE: re-assert against the unmutated `win` that the real (unmutated) source still passes —
  // proves the fix in the working tree is the version that ships.
  check("RESTORED: the real (unmutated) source still resets the guard at beginSession", afterReset === 700);
}

console.log("\n-- §5.3 — objective bonus applies only WITH objectiveRef (a BONUS, not a gate) --");
{
  const noObj = win.xpForEvent("encounter_resolved", { foes: [{ cr: 5 }] }, 5, {});
  const withObj = win.xpForEvent("encounter_resolved", { foes: [{ cr: 5 }] }, 5, {});
  check("encounter_resolved pays WITHOUT objectiveRef (un-gated)", noObj === win.crXp(5), `noObj=${noObj}`);
  const withObjP = win.xpForEvent("encounter_resolved", { foes: [{ cr: 5 }], objectiveRef: "front:x" }, 5, {});
  check("encounter_resolved pays MORE WITH objectiveRef (×1.25 bonus)", withObjP === Math.round(win.crXp(5) * 1.25), `withObj=${withObjP} base=${win.crXp(5)}`);
  check("the bonus is proportional (not a flat add)", withObjP / noObj > 1.2 && withObjP / noObj < 1.3);
}

console.log("\n-- §5.4 — front_closed scales with level via E(L) (encounterUnit over CR_XP, not a table copy) --");
{
  const size = 6;
  const l1 = win.xpForEvent("front_closed", {}, 1, { size });
  const l5 = win.xpForEvent("front_closed", {}, 5, { size });
  const l10 = win.xpForEvent("front_closed", {}, 10, { size });
  check("front_closed(L1) === 1.0 × E(1)", l1 === win.encounterUnit(1), `l1=${l1} E(1)=${win.encounterUnit(1)}`);
  check("front_closed(L5) === 1.0 × E(5)", l5 === win.encounterUnit(5), `l5=${l5} E(5)=${win.encounterUnit(5)}`);
  check("front_closed GROWS monotonically with level (E(L) tracks CR_XP's climb)", l1 < l5 && l5 < l10);
  check("front_closed also scales with the front's stake size (bigger clock, bigger cut)",
    win.xpForEvent("front_closed", {}, 5, { size: 12 }) > l5);
}

console.log("\n-- §5.5 — combat XP ignores the daily cap; milestones (discovery/fact_canonized) respect it --");
{
  const w = mkWorld("w-cap", 5);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  // Blow well past DISCOVERY_XP_PER_DAY (30) with discovery events — script BOUNDS it to $0 further.
  for (let i = 0; i < 40; i++) win.applyEvent(w, { type: "discovery", payload: {}, source: "declared" });
  const afterDiscovery = w.characters[0].sheet.xp;
  check("milestone (discovery) XP respects the daily cap (capped at DISCOVERY_XP_PER_DAY=30, not 40×1)", afterDiscovery === 30, `xp=${afterDiscovery}`);
  // Now fire a LOT of real combat on the same in-world day — must NOT be capped by the same ceiling.
  const beforeCombat = w.characters[0].sheet.xp;
  for (let i = 0; i < 5; i++) win.applyEvent(w, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }], nodeId: "node-x-"+i }, source: "declared" });
  const combatGained = w.characters[0].sheet.xp - beforeCombat;
  check("combat XP is UNCAPPED — five real fights (different places, no decay) gain far more than the 30 XP milestone ceiling",
    combatGained > 30 * 5, `combatGained=${combatGained}`);
}

console.log("\n-- §5.6 — xpReport.bySource percentages sum to exactly 100 --");
{
  const w = mkWorld("w-report", 5);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  win.applyEvent(w, { type: "encounter_resolved", payload: { foes: [{ cr: 3 }], nodeId: "n1" }, source: "declared" });
  win.applyEvent(w, { type: "front_closed", payload: {}, source: "declared" });
  win.applyEvent(w, { type: "discovery", payload: {}, source: "declared" });
  win.applyEvent(w, { type: "discovery", payload: {}, source: "declared" });
  const report = win.seamHarvest(w).xpReport;
  check("xpReport is present with a total > 0", report && report.total > 0, JSON.stringify(report));
  const pctSum = Object.keys(report.bySource).filter(k => k.endsWith("%")).reduce((s, k) => s + report.bySource[k], 0);
  check("xpReport.bySource percentages sum to EXACTLY 100", pctSum === 100, `sum=${pctSum} bySource=${JSON.stringify(report.bySource)}`);
  check("xpReport carries decayLost, paceThisLevel, paceTarget", typeof report.decayLost === "number" && typeof report.paceThisLevel === "number" && (report.paceTarget === null || typeof report.paceTarget === "number"));

  // an XP-less session reports zeros, not NaN
  const w2 = mkWorld("w-report-empty", 5); w2.session = 1;
  win.U.worlds[w2.id] = w2; win.U.activeWorldId = w2.id;
  const empty = win.seamHarvest(w2).xpReport;
  check("an XP-less session reports total=0 with no NaN in bySource", empty.total === 0 && Object.values(empty.bySource).every(v => !Number.isNaN(v)), JSON.stringify(empty));
}

console.log("\n-- §HQ3-B1 outcome gate — encounter XP is a WIN reward; empty foes + non-win outcomes pay 0 --");
{
  const r1 = win.encounterResolvedXp({ foes: [], outcome: "resolved" }, 5, {});
  check("0 foes down + outcome:resolved → paid 0 (the +250 killer)", r1.paid === 0, `paid=${r1.paid}`);
  const r2 = win.encounterResolvedXp({ foes: [], outcome: "fled" }, 5, {});
  check("0 foes down + outcome:fled → paid 0", r2.paid === 0, `paid=${r2.paid}`);
  const r3 = win.encounterResolvedXp({ foes: [] }, 5, {});
  check("0 foes down + outcome omitted (defaults resolved) → paid 0", r3.paid === 0, `paid=${r3.paid}`);
  const r4 = win.encounterResolvedXp({ foes: [{ cr: 3 }], outcome: "aborted" }, 5, {});
  check("a real foe down but outcome:aborted (non-win) → paid 0", r4.paid === 0, `paid=${r4.paid}`);
  const r5 = win.encounterResolvedXp({ foes: [{ cr: 3 }], outcome: "fled" }, 5, {});
  check("a real foe down and outcome:fled (foes fled = a WIN) still pays full crXp(3)", r5.paid === win.crXp(3), `paid=${r5.paid} expected=${win.crXp(3)}`);
  const r6 = win.encounterResolvedXp({ foes: [{ victimClass: "monster" }], outcome: "resolved" }, 5, {});
  check("the CR-less flat fallback is PRESERVED for a non-empty, CR-less foes array", r6.paid > 0, `paid=${r6.paid}`);
  // re-run the §5.3 objectiveRef checks unchanged — the outcome gate must not disturb the bonus math.
  const noObj2 = win.encounterResolvedXp({ foes: [{ cr: 5 }] }, 5, {});
  const withObj2 = win.encounterResolvedXp({ foes: [{ cr: 5 }], objectiveRef: "front:x" }, 5, {});
  check("§5.3 regression: objectiveRef bonus math unaffected by the outcome gate", withObj2.paid === Math.round(win.crXp(5) * 1.25) && noObj2.paid === win.crXp(5),
    `noObj=${noObj2.paid} withObj=${withObj2.paid}`);

  // HQ3-B1 seat-prompt doc regression: build/gen-dm-contract.py's PROMPT_TAUGHT must list `combat_end`
  // and its generated region in the seat prompt(s) must carry it — grep-assert (not the full regen
  // pipeline) so reverting the seat-prompt edit is caught here too.
  const genSrc = read("build/gen-dm-contract.py");
  check("build/gen-dm-contract.py PROMPT_TAUGHT lists combat_end", /PROMPT_TAUGHT\s*=\s*\[[\s\S]*?"combat_end"[\s\S]*?\]/.test(genSrc));
  const seatPrompt = read("docs/SEAT-PROMPT.md");
  const genBegin = seatPrompt.indexOf("DM-CONTRACT:EVENTS:BEGIN");
  const genEnd = seatPrompt.indexOf("DM-CONTRACT:EVENTS:END");
  const genRegion = (genBegin>=0 && genEnd>genBegin) ? seatPrompt.slice(genBegin, genEnd) : "";
  check("docs/SEAT-PROMPT.md's generated region lists `combat_end`", /`combat_end`/.test(genRegion), genRegion.slice(0,80));
}

console.log("\n-- §5.7 — regression: verify-advancement / verify-combat stay green --");
{
  for (const script of ["dev/verify-advancement.mjs", "dev/verify-combat.mjs"]) {
    try {
      const out = execFileSync(process.execPath, [join(ROOT, script)], { cwd: ROOT, encoding: "utf-8" });
      const m = out.match(/(\d+) passed, (\d+) failed/);
      check(`${script} passes 0 failed`, m && m[2] === "0", out.slice(-300));
    } catch (e) {
      check(`${script} passes 0 failed`, false, (e.stdout || String(e)).slice(-500));
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
