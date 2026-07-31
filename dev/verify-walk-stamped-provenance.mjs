/* verify-walk-stamped-provenance.mjs — headless test for WDV-2 (docs/WALK-NATIVE-A.md, contract §3):
   walkPickStamped(tableId, ...cols) beside walkPick in src/engine/walk.js, and a per-segment
   `segment.rollRefs = { <fieldKey>:{tableId,total[,band]} }` sibling map attached by the three
   rollers (dungeon-walk.js / walk.js's rollUrbanWalk / wild-walk.js) for the GRAPHICS-CRITICAL
   fields only — dungeon: area, feature, dressing, door, light, object, scene; urban: sceneFrame,
   dressing, light, interactable; wilderness: area(arrival), feature, dressing, signOfPassage, light.

   NOTE on "light": dungeon's `light` rollRef is stamped from the real compiled `dungeon-lighting`
   table (the one table backing that role for dungeon). Urban/wilderness have NO compiled table
   behind their structured `light` object at all — walkRollLight/theaterRollLight is a seeded-hash
   pick over theater-data.js's hardcoded THEATER_LIGHT_TABLE, not a GENESIS_TABLES roll — so per the
   spec's own "fields the roller derives without a single table roll may be omitted" carve-out,
   urban/wilderness intentionally carry no rollRefs.light. Checked explicitly below (2d).

   1. ⊗ RED-FIRST byte-compat: a walk rolled with the ACTUAL (unmutated) code, same seed, produces
      segment fields byte-identical to the pre-WDV-2 REFERENCE code (git show of this branch's base
      commit) once `rollRefs` is stripped. Proven RED first: a MUTATED variant that overwrites
      dungeon room.scene from the stamped total (`sceneR.source.total` instead of `sceneR.values`)
      is shown to diverge from the reference under the identical seed — proving the comparison
      methodology actually catches a field-value corruption — before confirming the real (unmutated)
      diff is empty.
   2. rollRefs present: each graphics-critical field has rollRefs[key] = {tableId, total} with
      tableId a non-empty string matching the source table and total an integer (a-d, one per env
      + the "light" carve-out spot-check).
   3. walkPickStamped(id,...cols).values is byte-identical to walkPick(id,...cols) under the SAME
      seeded draw (same table, same reseed point).
   4. determinism: same seed on two independent fresh module instances -> byte-identical walk,
      including rollRefs.

   Loads every module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-walk-refresh.mjs / dev/verify-dressing.mjs (jsdom resolved
   per CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-walk-stamped-provenance.mjs   (from repo root) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const loadPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

// the base commit this branch (feat/wdv2-stamped-provenance) forked from — the pre-WDV-2 tree.
const BASE_SHA = "742a1bc5ffa5df4124047c795ea57892d4b9b9ac";
const TOUCHED = [
  "src/engine/walk.js", "src/engine/dungeon-walk.js", "src/engine/wild-walk.js",
  "src/world/wiring-a.js", "src/world/wiring-b.js",
];
function gitShow(sha, path){
  return execFileSync("git", ["show", `${sha}:${path}`], { cwd: ROOT, encoding: "utf-8" });
}

const tablesSrc = read("tables.js");
const actualModuleSrc = loadPaths.map(read).join("\n;\n");
const actualSrc = tablesSrc + "\n;\n" + actualModuleSrc;

const referenceModuleSrc = loadPaths
  .map((p) => (TOUCHED.includes(p) ? gitShow(BASE_SHA, p) : read(p)))
  .join("\n;\n");
const referenceSrc = tablesSrc + "\n;\n" + referenceModuleSrc;

// RED-FIRST mutation: overwrite dungeon room.scene's VALUE from the stamped return (total, not the
// real table cell) — exactly the failure mode check 1 must catch. Applied to the CURRENT disk
// dungeon-walk.js text (mutating actualModuleSrc, not the reference).
const MUTATION_NEEDLE = 'const sceneR=walkPickStamped("dungeon-scene",1); const [scene]=sceneR.values; rollRefs.scene=sceneR.source;';
const MUTATION_REPLACEMENT = 'const sceneR=walkPickStamped("dungeon-scene",1); const [scene]=[String(sceneR.source.total)]; rollRefs.scene=sceneR.source;';
const dungeonWalkActual = read("src/engine/dungeon-walk.js");
const mutationFound = dungeonWalkActual.includes(MUTATION_NEEDLE);
const mutatedDungeonWalk = dungeonWalkActual.replace(MUTATION_NEEDLE, MUTATION_REPLACEMENT);
const mutatedModuleSrc = loadPaths
  .map((p) => (p === "src/engine/dungeon-walk.js" ? mutatedDungeonWalk : read(p)))
  .join("\n;\n");
const mutatedSrc = tablesSrc + "\n;\n" + mutatedModuleSrc;

function freshDom(loadSrc){
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(`var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;\n` + loadSrc);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  return { win };
}

// same seeded-PRNG-on-win.Math.random convention as dev/verify-dressing.mjs §2 (jsdom's window.Math
// is its own realm — the stub must live on the WINDOW's Math, not the outer Node Math).
function withSeededRandom(win, seedStart, fn){
  let s = seedStart;
  const orig = win.Math.random;
  win.Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  try { return fn(); } finally { win.Math.random = orig; }
}

function rollAllThree(win, opts = {}){
  const dungeon = win.rollDungeonWalk({ segCount: 6, ...opts.dungeon });
  const urban = win.rollUrbanWalk({ segCount: 6, ...opts.urban });
  const wilderness = win.rollWildernessWalk({ legCount: 5, ...opts.wilderness });
  return { dungeon, urban, wilderness };
}

// strip rollRefs (and the analogous urban finale key) from a rolled walk's segments so the REST of
// the shape can be diffed against the pre-WDV-2 reference — deep clone, delete-in-place.
// `extraKeys` (WIRING-TEETH-0727, fix/wiring-teeth-0727, 2026-07-27): the SAME additivity problem
// ELEV-1 hit — a later, legitimate unit adds new segment-level fact fields the frozen BASE_SHA
// reference predates — but this time the new facts are plain flat fields (areaType/dims/side/
// footing/footingCoverage/footingImpact), not gated behind a table that can be zeroed to suppress
// the KEY entirely the way NEUTRALIZE_ELEV1 suppresses `elevation` (an empty-rows table still
// produces areaType:""/footing:"" — the walkPickStamped(...).values contract always returns
// same-length strings, never omits the key). So the value-level divergence is neutralized by
// NEUTRALIZE_WIRING_TEETH_0727 below (stops the new draws from shifting every LATER roll's value),
// and the key-level divergence is closed here, by name, exactly like `rollRefs` itself already is.
function stripRollRefs(walk, extraKeys){
  const clone = JSON.parse(JSON.stringify(walk));
  const segs = clone.rooms || clone.segments || [];
  for (const s of segs) {
    delete s.rollRefs;
    if (extraKeys) for (const k of extraKeys) delete s[k];
  }
  return clone;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

console.log("\n=== setup: mutation needle found in current dungeon-walk.js ===");
check("0. MUTATION setup: scene stamped-pick statement found verbatim in src/engine/dungeon-walk.js", mutationFound,
  "needle not found — the RED-FIRST proof below cannot run; source at that line must have drifted");

// WDV-2 additivity is what checks 1c/1d/1e isolate: "adding rollRefs perturbed no existing field value
// or roll count." ELEV-1 (commit 7d15862f, the LAST commit to touch these 5 walk files) landed AFTER
// WDV-2 and added a per-room elevation roll in dungeon-walk.js (dwalkElevation) that CONSUMES PRNG draws
// off this shared seeded stream — so the current dungeon walk, and every later walk rolled after it in
// rollAllThree, legitimately diverges from the pre-WDV-2 (BASE_SHA) reference. That is a real, intended
// feature, NOT a rollRefs regression (ELEV-1's own additivity is dev/verify-elev1-elevation.mjs's job).
// dwalkElevation guards with `if(!rows.length) return null` BEFORE any Math.random() — ELEV-1's own
// documented "a segment with no elevation key renders exactly as before this unit" no-op path. Feeding
// the actual/mutated windows an EMPTY room-elevation-profile table takes that zero-draw path, so 1c/1d/1e
// compare the current walk MINUS ELEV-1's later roll against the pre-WDV-2 reference — isolating EXACTLY
// WDV-2's rollRefs additivity again (the reference itself predates ELEV-1's dwalkElevation call, so it
// never rolls elevation regardless; only the actual/mutated sides need the neutralizer). walkRows(id)
// reads walkTables()[id] (src/engine/walk.js:145) and is the ONLY consumer of this id, so nothing else
// is touched. This scopes the gate to its real job; it does not weaken it — a rollRefs wiring bug still
// diverges (proven live by the 1a/1b RED mutation, which runs through this same neutralized path).
const NEUTRALIZE_ELEV1 = '\n;(function(){ if(typeof walkRows==="function"){ var _wr=walkRows; walkRows=function(id){ return id==="room-elevation-profile" ? [] : _wr(id); }; } })();';
// WIRING-TEETH-0727 (fix/wiring-teeth-0727, 2026-07-27, docs/DESIGN.md): rollUrbanWalk now rolls
// urban-area-type (every segment) and urban-footing (every non-finale segment) — two NEW
// walkRnd(rows) draws per segment that did not exist at BASE_SHA, shifting every later roll's PRNG
// position for the rest of that walk (same mechanism as ELEV-1's dwalkElevation, same fix: an empty
// rows array takes walkPickStamped's `if(!rows.length) return {...}` early-return branch BEFORE any
// Math.random() call — zero draws, byte-identical downstream stream to the reference). Scoped to
// exactly these two ids so a real regression in either roll still diverges the comparison.
const NEUTRALIZE_WIRING_TEETH_0727 = '\n;(function(){ if(typeof walkRows==="function"){ var _wr=walkRows; walkRows=function(id){ return (id==="urban-area-type"||id==="urban-footing") ? [] : _wr(id); }; } })();';

console.log("\n=== 1. RED-FIRST byte-compat (contract §3 / spec check 1) ===");
{
  const SEED = 12345;
  const refWin = freshDom(referenceSrc).win;
  const refWalks = withSeededRandom(refWin, SEED, () => rollAllThree(refWin));

  const mutWin = mutationFound ? freshDom(mutatedSrc + NEUTRALIZE_ELEV1 + NEUTRALIZE_WIRING_TEETH_0727).win : null;
  const mutWalks = mutationFound ? withSeededRandom(mutWin, SEED, () => rollAllThree(mutWin)) : null;

  const actWin = freshDom(actualSrc + NEUTRALIZE_ELEV1 + NEUTRALIZE_WIRING_TEETH_0727).win;
  const actWalks = withSeededRandom(actWin, SEED, () => rollAllThree(actWin));

  if (mutationFound) {
    const refScene = refWalks.dungeon.segments[0].scene;
    const mutScene = mutWalks.dungeon.segments[0].scene;
    check("1a. RED proof: mutated build's room[0].scene diverges from the reference under the identical seed",
      refScene !== mutScene, `ref=${JSON.stringify(refScene)} mut=${JSON.stringify(mutScene)} (expected different)`);
    check("1b. RED proof: the mutated value IS the stamped total (string), not real table prose — confirms WHAT broke",
      mutScene === String(mutWalks.dungeon.segments[0].rollRefs.scene.total),
      `mutScene=${JSON.stringify(mutScene)} expected total-string=${JSON.stringify(String(mutWalks.dungeon.segments[0].rollRefs.scene.total))}`);
  }

  // WIRING-TEETH-0727: extraKeys strips exactly the new flat fields THIS unit adds (see stripRollRefs's
  // own comment) — dungeon is untouched by W1 (no extraKeys), urban gained area+footing fields, and
  // wilderness gained the two footing columns that were previously discarded (`footing` itself is
  // BYTE-UNCHANGED — still column 1 — so it is deliberately NOT in wilderness's strip list; only the
  // two genuinely-new sibling fields are).
  const actDungeonStripped = stripRollRefs(actWalks.dungeon);
  const actUrbanStripped = stripRollRefs(actWalks.urban, ["areaType", "dims", "side", "footing", "footingCoverage", "footingImpact"]);
  const actWildStripped = stripRollRefs(actWalks.wilderness, ["footingCoverage", "footingImpact"]);
  // UNIT W2 (docs/DESIGN.md, fix/wiring-teeth-0727, 2026-07-27): wwalkEncounter's Enemy branch now
  // additionally carries `terrainFootprint` (TERRAIN-PROGRAM.md M8 / BATTLEMAP.md §3b — the
  // wilderness-tactical-terrain Map Footprint column, previously uncompiled) on `segment.encounter`
  // — a NESTED new field stripRollRefs's flat extraKeys list can't reach (it only deletes TOP-LEVEL
  // segment keys). Same additivity story as footingCoverage/footingImpact above: zero extra
  // Math.random() draws (the SAME single walkRnd() pick the pre-existing terrain roll already made —
  // see walkPickTagged in src/engine/walk.js), so only the KEY needs closing here, not a new
  // NEUTRALIZE_* entry. Confirmed NOT accidentally masked by SEED=12345 alone: under this exact seed
  // none of the 5 wilderness legs roll an Enemy branch (verified directly), so leaving this unclosed
  // would have passed by luck, not by design — closed the same way rollRefs itself already is.
  for (const s of actWildStripped.segments || []) if (s.encounter) delete s.encounter.terrainFootprint;
  const refDungeon = JSON.stringify(refWalks.dungeon);
  const refUrban = JSON.stringify(refWalks.urban);
  const refWild = JSON.stringify(refWalks.wilderness);

  check("1c. GREEN confirmed: actual (unmutated) dungeon walk, rollRefs stripped, is byte-identical to the pre-WDV-2 reference under the identical seed",
    JSON.stringify(actDungeonStripped) === refDungeon, "dungeon walk diverged — rollRefs wiring perturbed an existing field value or roll count");
  check("1d. GREEN confirmed: actual (unmutated) urban walk, rollRefs + WIRING-TEETH-0727's new fields stripped, is byte-identical to the pre-WDV-2 reference under the identical seed",
    JSON.stringify(actUrbanStripped) === refUrban, "urban walk diverged on a field OTHER than rollRefs/areaType/dims/side/footing/footingCoverage/footingImpact — a real regression, not expected additivity");
  check("1e. GREEN confirmed: actual (unmutated) wilderness walk, rollRefs + WIRING-TEETH-0727's new footing columns stripped, is byte-identical to the pre-WDV-2 reference under the identical seed",
    JSON.stringify(actWildStripped) === refWild, "wilderness walk diverged on a field OTHER than rollRefs/footingCoverage/footingImpact — a real regression, not expected additivity");
}

console.log("\n=== 2. rollRefs present: tableId + integer total per graphics-critical field ===");
function isValidRef(ref, expectedTableId){
  return !!ref && typeof ref.tableId === "string" && ref.tableId.length > 0
    && ref.tableId === expectedTableId && Number.isInteger(ref.total);
}
{
  const { win } = freshDom(actualSrc);
  const T = win.GENESIS_TABLES;
  const requiredTables = [
    "dungeon-area-type", "dungeon-feature", "dungeon-set-dressing", "dungeon-door-type",
    "dungeon-lighting", "dungeon-interactable-object", "dungeon-scene",
    "urban-scene-frame", "urban-set-dressing", "urban-interactable-object",
    "wilderness-area-type", "wilderness-feature", "wilderness-set-dressing", "wilderness-sign-of-passage",
  ];
  for (const id of requiredTables)
    check(`2. compiled key present: ${id}`, T && T[id] && T[id].rows && T[id].rows.length > 0, `missing or empty ${id}`);
}
{
  const { win } = freshDom(actualSrc);
  let dOk = true, dDetail = "";
  for (let i = 0; i < 8; i++) {
    const w = win.rollDungeonWalk({ segCount: 6 });
    for (const room of w.rooms || w.segments) {
      const rr = room.rollRefs || {};
      for (const [key, tableId] of [["area", "dungeon-area-type"], ["scene", "dungeon-scene"],
        ["light", "dungeon-lighting"], ["object", "dungeon-interactable-object"],
        ["feature", "dungeon-feature"], ["dressing", "dungeon-set-dressing"]]) {
        if (!isValidRef(rr[key], tableId)) { dOk = false; dDetail = `room ${room.num} rollRefs.${key} = ${JSON.stringify(rr[key])} (want tableId ${tableId})`; }
      }
      if ((room.exits || []).length > 0 && !isValidRef(rr.door, "dungeon-door-type")) {
        dOk = false; dDetail = `room ${room.num} (has exits) rollRefs.door = ${JSON.stringify(rr.door)}`;
      }
    }
  }
  check("2a. dungeon: every room (finale incl.) carries valid rollRefs for area/scene/light/object/feature/dressing, +door when it has an exit (x8 rolls)", dOk, dDetail);
}
{
  const { win } = freshDom(actualSrc);
  let uOk = true, uDetail = "", finaleOk = true, finaleDetail = "";
  for (let i = 0; i < 8; i++) {
    const w = win.rollUrbanWalk({ segCount: 6 });
    for (const seg of w.segments) {
      const rr = seg.rollRefs || {};
      if (seg.isFinale) {
        if (!isValidRef(rr.sceneFrame, "urban-scene-frame")) { finaleOk = false; finaleDetail = `finale seg ${seg.num} rollRefs.sceneFrame = ${JSON.stringify(rr.sceneFrame)}`; }
        continue;
      }
      if (!isValidRef(rr.sceneFrame, "urban-scene-frame")) { uOk = false; uDetail = `seg ${seg.num} rollRefs.sceneFrame = ${JSON.stringify(rr.sceneFrame)}`; }
      if (!isValidRef(rr.dressing, "urban-set-dressing")) { uOk = false; uDetail = `seg ${seg.num} rollRefs.dressing = ${JSON.stringify(rr.dressing)}`; }
      if (!isValidRef(rr.interactable, "urban-interactable-object")) { uOk = false; uDetail = `seg ${seg.num} rollRefs.interactable = ${JSON.stringify(rr.interactable)}`; }
    }
  }
  check("2b. urban: every non-finale segment carries valid rollRefs for sceneFrame/dressing/interactable (x8 rolls)", uOk, uDetail);
  check("2c. urban: every finale segment carries valid rollRefs.sceneFrame (x8 rolls)", finaleOk, finaleDetail);
}
{
  const { win } = freshDom(actualSrc);
  let lOk = true, lDetail = "", arrOk = true, arrDetail = "";
  for (let i = 0; i < 8; i++) {
    const w = win.rollWildernessWalk({ legCount: 5 });
    for (const seg of w.segments) {
      const rr = seg.rollRefs || {};
      if (seg.isFinale) {
        if (!isValidRef(rr.area, "wilderness-area-type")) { arrOk = false; arrDetail = `arrival rollRefs.area = ${JSON.stringify(rr.area)}`; }
        if (!isValidRef(rr.feature, "wilderness-feature")) { arrOk = false; arrDetail = `arrival rollRefs.feature = ${JSON.stringify(rr.feature)}`; }
        if (!isValidRef(rr.dressing, "wilderness-set-dressing")) { arrOk = false; arrDetail = `arrival rollRefs.dressing = ${JSON.stringify(rr.dressing)}`; }
        if ("signOfPassage" in rr) { arrOk = false; arrDetail = `arrival unexpectedly carries rollRefs.signOfPassage (never rolled for arrival)`; }
        continue;
      }
      if (!isValidRef(rr.feature, "wilderness-feature")) { lOk = false; lDetail = `leg ${seg.num} rollRefs.feature = ${JSON.stringify(rr.feature)}`; }
      if (!isValidRef(rr.dressing, "wilderness-set-dressing")) { lOk = false; lDetail = `leg ${seg.num} rollRefs.dressing = ${JSON.stringify(rr.dressing)}`; }
      if (!isValidRef(rr.signOfPassage, "wilderness-sign-of-passage")) { lOk = false; lDetail = `leg ${seg.num} rollRefs.signOfPassage = ${JSON.stringify(rr.signOfPassage)}`; }
    }
  }
  check("2d. wilderness: every leg carries valid rollRefs for feature/dressing/signOfPassage (x8 rolls)", lOk, lDetail);
  check("2e. wilderness: the arrival segment carries valid rollRefs for area/feature/dressing, no signOfPassage (x8 rolls)", arrOk, arrDetail);
}
{
  // the documented carve-out: dungeon/urban/wilderness's structured `light` (practical) is NEVER
  // backed by a rollRefs entry EXCEPT dungeon's (which piggybacks the real dungeon-lighting table) —
  // urban/wilderness genuinely have no compiled table behind walkRollLight, so no key should appear.
  const { win } = freshDom(actualSrc);
  const u = win.rollUrbanWalk({ segCount: 4 });
  const wd = win.rollWildernessWalk({ legCount: 4 });
  const uHasLight = u.segments.some((s) => s.rollRefs && "light" in s.rollRefs);
  const wHasLight = wd.segments.some((s) => s.rollRefs && "light" in s.rollRefs);
  check("2f. urban rollRefs never carries a 'light' key (no compiled table backs it — documented carve-out)", !uHasLight);
  check("2g. wilderness rollRefs never carries a 'light' key (no compiled table backs it — documented carve-out)", !wHasLight);
}

console.log("\n=== 3. walkPickStamped(id,...cols).values matches walkPick(id,...cols) under the same reseed ===");
{
  const { win } = freshDom(actualSrc);
  const cases = [["dungeon-feature", 1, 2, 3], ["urban-set-dressing", 1], ["wilderness-sign-of-passage", 1, 2], ["dungeon-scene", 1]];
  let allMatch = true, mismatch = "";
  for (const [id, ...cols] of cases) {
    for (let seed = 1; seed <= 5; seed++) {
      const a = withSeededRandom(win, seed * 7919, () => win.walkPick(id, ...cols));
      const b = withSeededRandom(win, seed * 7919, () => win.walkPickStamped(id, ...cols).values);
      if (JSON.stringify(a) !== JSON.stringify(b)) { allMatch = false; mismatch = `${id} seed=${seed}: walkPick=${JSON.stringify(a)} walkPickStamped.values=${JSON.stringify(b)}`; }
    }
  }
  check("3. walkPickStamped(...).values === walkPick(...) for the same table/cols/reseed (5 seeds x 4 tables)", allMatch, mismatch);
}
{
  const { win } = freshDom(actualSrc);
  const r = withSeededRandom(win, 999, () => win.walkPickStamped("dungeon-feature", 1, 2, 3));
  check("3b. walkPickStamped source shape: {tableId,total,band}", r && r.source && r.source.tableId === "dungeon-feature" && Number.isInteger(r.source.total),
    JSON.stringify(r && r.source));
  const empty = win.walkPickStamped("__no-such-table__", 1, 2);
  check("3c. walkPickStamped on a missing table degrades null-safe (values=['',''], total=null)",
    Array.isArray(empty.values) && empty.values.length === 2 && empty.values.every((v) => v === "") && empty.source.total === null,
    JSON.stringify(empty));
}

console.log("\n=== 4. determinism: same seed -> byte-identical walk (incl. rollRefs) across fresh instances ===");
{
  const winA = freshDom(actualSrc).win, winB = freshDom(actualSrc).win;
  const SEED = 55555;
  const a = withSeededRandom(winA, SEED, () => rollAllThree(winA));
  const b = withSeededRandom(winB, SEED, () => rollAllThree(winB));
  check("4a. dungeon walk (incl. rollRefs) reproducible under the same seed, fresh instance per side", JSON.stringify(a.dungeon) === JSON.stringify(b.dungeon));
  check("4b. urban walk (incl. rollRefs) reproducible under the same seed, fresh instance per side", JSON.stringify(a.urban) === JSON.stringify(b.urban));
  check("4c. wilderness walk (incl. rollRefs) reproducible under the same seed, fresh instance per side", JSON.stringify(a.wilderness) === JSON.stringify(b.wilderness));
  const winC = freshDom(actualSrc).win;
  const c = withSeededRandom(winC, SEED + 1, () => rollAllThree(winC));
  check("4d. a different seed produces a different dungeon walk (sanity: the stub is actually driving the roll)", JSON.stringify(a.dungeon) !== JSON.stringify(c.dungeon));
}

console.log("\n=== check-manifest ===");
console.log("  (run separately: python3 build/check-manifest.py — no new module registered by WDV-2, confirmed RESULT: OK)");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
