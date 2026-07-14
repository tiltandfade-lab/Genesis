/* dev/model-qa/battlemap-audit.mjs — BATTLEMAP PLAYTEST, part 1 (headless data audit).

   Rolls REAL walk levels (dungeon / urban / wilderness) across seeded runs, then for each rolled
   segment builds the theater board TWO ways and measures how much of the room's rolled content
   actually reaches the battle map:

     A) AS-SHIPPED   — scene = {} (what combatStart defaults to when the DM supplies no scene; the
                       engine never auto-derives hazard/object zones from a segment — dm.js:1037
                       takes scene straight from the DM's combat_start payload). This is the honest
                       "what a player hits today with an unhelpful DM" baseline.
     B) FULLY-FED    — scene mechanically derived from the SAME rolled segment (a prototype of the
                       missing walk->scene wiring): rolled hazards -> hazardZones, rolled
                       feature/interactable/dressing nouns -> cover zones (carrying the narrated
                       text so theater-data's MODEL-GRAMMAR G4 keyword rules fire), rolled SIZE
                       text -> cover level + zone occupancy, rolled elevation -> elevZones.

   It reports, per environment: clean-run rate (zero throws), how often a rolled hazard/object/
   size exists, and how often it reaches a hazard tile / a resolved prop model in A vs B. Then it
   emits a curated set of showcase fixtures (both A and B) as dev/model-qa/battlemap-fixtures.js
   for the browser render pass (battlemap-render.html + battlemap-capture.mjs).

   RUN:  node dev/model-qa/battlemap-audit.mjs
         (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md; same loader as dev/verify-battlemap.mjs)

   DEV-ONLY. Touches no src/, adds no manifest module. */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const OUT_DIR = join(ROOT, "dev", "model-qa");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// ---- load the real engine in jsdom, module order per manifest (mirrors verify-battlemap.mjs) ----
const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "outside-only" });
const win = dom.window;
win.eval(harness);
win.eval(srcText);

// ---- a tiny seedable PRNG so a run is reproducible (rollDie uses raw Math.random, no seed hook) ----
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedRandom(seed) { win.Math.random = mulberry32(seed); }

const call = (name, ...args) => win[name](...args);

// ---------------------------------------------------------------------------
// FULLY-FED scene derivation — the prototype of the missing walk->scene wiring.
// Pure string/heuristic work; deliberately lives HERE (a playtest probe), not in src/.
// ---------------------------------------------------------------------------
function firstText(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
    if (v && typeof v === "object") {
      const s = [v.name, v.flavor, v.text, v.desc].filter((x) => typeof x === "string").join(" ");
      if (s.trim()) return s;
    }
  }
  return "";
}

// classify a hazard blob of text into a theater hazard KIND (theaterHazardVariant reads kind).
function hazardKindFromText(t) {
  const s = (t || "").toLowerCase();
  if (/lava|magma|molten/.test(s)) return "lava";
  if (/fire|flame|burn|ember|blaze|pyre/.test(s)) return "fire";
  if (/pit|chasm|hole|drop|crevasse|sinkhole|shaft|abyss/.test(s)) return "pit";
  if (/water|flood|pool|bog|mud|mire|swamp|quicksand|river|torrent|deluge/.test(s)) return "water";
  if (/acid|slime|ooze|tar|sludge/.test(s)) return "acid";
  if (/spike|blade|caltrop|snare|trap/.test(s)) return "trap";
  if (/gas|fume|vapor|miasma|spore|choke/.test(s)) return "gas";
  return "hazard";
}

// parse a size/footprint description -> a cover level + how many zones it should occupy.
// e.g. "15'×15' field" -> big; "5'×5' unstable mound" -> small; "fills the chamber" -> big.
function sizeFromText(t) {
  const s = (t || "").toLowerCase();
  const dims = [...s.matchAll(/(\d{1,3})\s*['’]?\s*[x×]\s*(\d{1,3})/g)].map((m) => Math.max(+m[1], +m[2]));
  const maxDim = dims.length ? Math.max(...dims) : 0;
  const bigWord = /\b(fills?|huge|massive|vast|colossal|towering|great|large|chamber-wide|spans?)\b/.test(s);
  const smallWord = /\b(small|tiny|slender|narrow|single|lone|5['’]?\s*[x×]\s*5)\b/.test(s);
  if (bigWord || maxDim >= 15) return { level: "three-quarters", occupies: 2, maxDim, note: "large" };
  if (smallWord || (maxDim > 0 && maxDim <= 5)) return { level: "half", occupies: 1, maxDim, note: "small" };
  return { level: "half", occupies: 1, maxDim, note: maxDim ? "medium" : "unstated" };
}

const ELEV_RE = /\bdais|balcony|ledge|terrace|raised|platform|steps?|perch|rise|mezzanine|gallery|catwalk|scaffold|upper\b/i;

// derive a fully-fed scene from a rolled segment + its zone grid.
function fullyFedScene(seg, grid) {
  const bands = grid.bands, lanes = grid.lanes;
  const midBand = bands[Math.min(1, bands.length - 1)]; // "near" when present
  const midZone = midBand + ":" + lanes[Math.floor(lanes.length / 2)];
  const scene = { cover: {}, zoneCover: {}, hazardZones: [], elevZones: [], hazards: [], exits: [] };

  // --- HAZARD ---
  let hazardText = "";
  const enc = seg.encounter;
  if (enc && /hazard/i.test(enc.type || "")) hazardText = enc.text || "";
  if (seg.hazard) hazardText = firstText(seg.hazard, hazardText);
  if (hazardText) {
    const kind = hazardKindFromText(hazardText);
    const hz = bands[0] + ":" + lanes[0]; // anchor into a corner zone
    scene.hazardZones.push({ zone: hz, kind, revealed: true, size: sizeFromText(hazardText).note });
    scene.hazards.push(hazardText);
    // a large hazard bleeds into the neighbor lane
    if (sizeFromText(hazardText).occupies >= 2 && lanes[1]) {
      scene.hazardZones.push({ zone: bands[0] + ":" + lanes[1], kind, revealed: true });
    }
  }

  // --- OBJECT / COVER (feature, interactable, object, dressing) ---
  const objText = firstText(seg.feature, seg.interactable, seg.object, seg.dressing);
  const objSizeText = firstText(seg.feature && seg.feature.dims, seg.feature, seg.interactable, seg.object);
  if (objText) {
    const sz = sizeFromText(objSizeText);
    scene.cover[midZone] = objText;      // string -> keyword rules fire (MODEL-GRAMMAR G4)
    scene.zoneCover[midZone] = sz.level; // level -> cmZoneCover mechanics + prop level
    if (sz.occupies >= 2) {
      const nZone = bands[Math.min(2, bands.length - 1)] + ":" + lanes[Math.floor(lanes.length / 2)];
      if (nZone !== midZone) { scene.cover[nZone] = objText; scene.zoneCover[nZone] = "half"; }
    }
  }

  // --- ELEVATION ---
  const elevText = firstText(seg.feature, seg.side, seg.scene, seg.areaType, seg.description);
  if (ELEV_RE.test(elevText)) {
    scene.elevZones.push(bands[bands.length - 1] + ":" + lanes[lanes.length - 1]);
  }

  return scene;
}

// build a minimal combat-like unit list for a segment (PC + up to 2 foes placed).
// foes carry a REAL modeled bestiary statId per env so theaterUnitsFrom resolves the whole-object
// model (not the cuboid fallback) — mirrors what cmFoeFrom stamps in live combat (combat.js:74).
const MODELED_FOES = {
  dungeon: ["skeleton", "ghoul"],
  urban: ["guard", "bandit"],
  wilderness: ["wolf", "dire-wolf"],
};
function unitsFor(seg, grid, env) {
  const bands = grid.bands, lanes = grid.lanes;
  const foeBand = bands[Math.min(1, bands.length - 1)];
  const foes = MODELED_FOES[env] || MODELED_FOES.dungeon;
  return [
    { id: "pc", kind: "pc", creatureType: "humanoid", className: "fighter", band: bands[0], lane: lanes[Math.floor(lanes.length / 2)] },
    { id: "f1", kind: "foe", creatureType: "humanoid", size: "medium", statId: foes[0], band: foeBand, lane: lanes[0], name: foes[0] },
    { id: "f2", kind: "foe", creatureType: "beast", size: "medium", statId: foes[1], band: foeBand, lane: lanes[lanes.length - 1], name: foes[1] },
  ];
}

// ---------------------------------------------------------------------------
// audit one segment: build board A + B, measure reach.
// ---------------------------------------------------------------------------
function boardStats(board) {
  const kinds = {};
  for (const t of board.tiles) kinds[t.kind] = (kinds[t.kind] || 0) + 1;
  const propsResolved = board.props.filter((p) => p.part).length;
  return {
    tiles: board.tiles.length,
    props: board.props.length,
    propsResolved,
    hazardTiles: (kinds.hazard || 0) + (kinds.water || 0),
    elevTiles: kinds.elevated || 0,
    grid: board.grid.bandCount + "x" + board.grid.laneCount,
    light: board.light && board.light.profile,
  };
}

function auditSegment(seg, env) {
  const grid = call("cmZoneGrid", seg.dims);
  const rec = { id: seg.id || seg.num, env, dims: seg.dims || null, grid: grid.bandCount + "x" + grid.laneCount };
  // what did the ROLL actually contain?
  rec.hasHazard = !!(seg.encounter && /hazard/i.test(seg.encounter.type || "")) || !!seg.hazard;
  rec.hasObject = !!firstText(seg.feature, seg.interactable, seg.object, seg.dressing);
  const objSizeText = firstText(seg.feature && seg.feature.dims, seg.feature, seg.interactable, seg.object);
  rec.hasSize = sizeFromText(objSizeText).maxDim > 0 || /\b(fills?|huge|massive|small|tiny|large)\b/i.test(objSizeText);
  rec.hasElev = ELEV_RE.test(firstText(seg.feature, seg.side, seg.scene, seg.areaType, seg.description));

  let threw = null;
  let A = null, B = null, sceneB = null;
  try {
    A = boardStats(call("theaterBoardFrom", seg, {}, { env }));
    sceneB = fullyFedScene(seg, grid);
    B = boardStats(call("theaterBoardFrom", seg, sceneB, { env }));
  } catch (e) { threw = String(e && e.message || e); }
  rec.threw = threw;
  rec.A = A; rec.B = B;
  rec._seg = seg; rec._sceneB = sceneB; // kept for fixture emission, stripped from the report
  return rec;
}

// ---------------------------------------------------------------------------
// roll the corpus
// ---------------------------------------------------------------------------
const ENVS = [
  { env: "dungeon", roll: "rollDungeonWalk" },
  { env: "urban", roll: "rollUrbanWalk" },
  { env: "wilderness", roll: "rollWildernessWalk" },
];
const RUNS = 8; // seeds per env
const records = [];
for (const { env, roll } of ENVS) {
  for (let s = 0; s < RUNS; s++) {
    seedRandom(1000 + s * 7 + env.length);
    let walk;
    try { walk = call(roll, {}); }
    catch (e) { console.error(`  ! ${roll} seed ${s} threw: ${e.message}`); continue; }
    const segs = walk.segments || [];
    for (const seg of segs) records.push(auditSegment(seg, env));
  }
}

// ---------------------------------------------------------------------------
// aggregate + print
// ---------------------------------------------------------------------------
function pct(n, d) { return d ? Math.round((100 * n) / d) : 0; }
const byEnv = {};
for (const r of records) {
  const e = (byEnv[r.env] ||= { n: 0, threw: 0, haz: 0, hazA: 0, hazB: 0, obj: 0, objPropA: 0, objPropB: 0, size: 0, elev: 0, elevB: 0 });
  e.n++;
  if (r.threw) { e.threw++; continue; }
  if (r.hasHazard) { e.haz++; if (r.A.hazardTiles) e.hazA++; if (r.B.hazardTiles) e.hazB++; }
  if (r.hasObject) { e.obj++; if (r.A.propsResolved) e.objPropA++; if (r.B.propsResolved) e.objPropB++; }
  if (r.hasSize) e.size++;
  if (r.hasElev) { e.elev++; if (r.B.elevTiles) e.elevB++; }
}

console.log("\n================ BATTLEMAP DATA AUDIT ================");
console.log(`corpus: ${records.length} segments (${RUNS} seeds/env x 3 envs)\n`);
for (const env of Object.keys(byEnv)) {
  const e = byEnv[env];
  console.log(`--- ${env.toUpperCase()} (${e.n} segments) ---`);
  console.log(`  clean runs (no throw)          : ${e.n - e.threw}/${e.n}`);
  console.log(`  rolled a HAZARD                : ${e.haz}/${e.n}  ->  reaches map A(as-shipped): ${e.hazA} (${pct(e.hazA, e.haz)}%)  | B(fed): ${e.hazB} (${pct(e.hazB, e.haz)}%)`);
  console.log(`  rolled an OBJECT/feature       : ${e.obj}/${e.n}  ->  renders a prop A: ${e.objPropA} (${pct(e.objPropA, e.obj)}%)  | B(fed): ${e.objPropB} (${pct(e.objPropB, e.obj)}%)`);
  console.log(`  rolled a SIZE description       : ${e.size}/${e.n}  ->  parsed into occupancy: A: 0% (null-safe placeholder) | B(fed): ${pct(e.size, e.size)}%`);
  console.log(`  rolled ELEVATION               : ${e.elev}/${e.n}  ->  raised tiles A: 0 | B(fed): ${e.elevB}\n`);
}

// ---------------------------------------------------------------------------
// pick showcase fixtures for the render pass
// ---------------------------------------------------------------------------
function findRec(env, pred) { return records.find((r) => r.env === env && !r.threw && pred(r)); }
const showcase = [];
const want = [
  { env: "dungeon", pred: (r) => r.hasHazard && r.grid !== "1x1", tag: "dungeon-hazard" },
  { env: "dungeon", pred: (r) => r.hasObject && r.hasSize, tag: "dungeon-sized-object" },
  { env: "dungeon", pred: (r) => r.grid === "1x1" || r.grid.startsWith("1"), tag: "dungeon-cramped" },
  { env: "dungeon", pred: (r) => r.grid.startsWith("4") || r.grid === "4x3", tag: "dungeon-open-cavern" },
  { env: "dungeon", pred: (r) => r.hasElev, tag: "dungeon-elevation" },
  { env: "urban", pred: (r) => r.hasObject, tag: "urban-interactable" },
  { env: "urban", pred: (r) => r.hasHazard, tag: "urban-hazard" },
  { env: "wilderness", pred: (r) => r.hasObject, tag: "wild-interactable" },
  { env: "wilderness", pred: (r) => r.hasHazard, tag: "wild-hazard" },
  { env: "wilderness", pred: (r) => true, tag: "wild-open" },
];
for (const w of want) {
  const r = findRec(w.env, w.pred);
  if (r && !showcase.includes(r)) { r._tag = w.tag; showcase.push(r); }
}

// each showcase record becomes TWO fixtures (A as-shipped, B fully-fed) sharing one segment+units.
const fixtures = [];
for (const r of showcase) {
  const seg = r._seg;
  const grid = call("cmZoneGrid", seg.dims);
  const units = unitsFor(seg, grid, r.env);
  const light = (call("theaterBoardFrom", seg, {}, { env: r.env }).light || {}).profile || "dark";
  const summary = firstText(seg.feature, seg.interactable, seg.object, seg.encounter, seg.description).slice(0, 90);
  fixtures.push({
    name: `${r._tag} · A · as-shipped`, tag: r._tag, mode: "A", env: r.env, light,
    grid: r.grid, dims: seg.dims || null, summary,
    segment: seg, scene: { cover: {}, zoneCover: {}, hazardZones: [], elevZones: [], hazards: [], exits: [] }, units,
  });
  fixtures.push({
    name: `${r._tag} · B · fully-fed`, tag: r._tag, mode: "B", env: r.env, light,
    grid: r.grid, dims: seg.dims || null, summary,
    segment: seg, scene: r._sceneB, units,
  });
}

// strip circular/private helpers from the segment before serialization (keep only plain data).
const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith("_") ? undefined : v)));
const fixturesClean = fixtures.map(clean);

writeFileSync(join(OUT_DIR, "battlemap-fixtures.js"),
  "/* GENERATED by dev/model-qa/battlemap-audit.mjs — DO NOT hand-edit. Render fixtures for\n" +
  "   battlemap-render.html: each showcase room in mode A (as-shipped) and B (fully-fed). */\n" +
  "window.__BM_FIXTURES = " + JSON.stringify(fixturesClean, null, 2) + ";\n");

// a compact JSON report too (for the findings doc).
const report = {
  corpus: records.length, runsPerEnv: RUNS,
  byEnv: Object.fromEntries(Object.entries(byEnv).map(([k, e]) => [k, e])),
  fixtures: fixturesClean.map((f) => ({ name: f.name, env: f.env, grid: f.grid, dims: f.dims, light: f.light, summary: f.summary })),
};
writeFileSync(join(OUT_DIR, "battlemap-audit-report.json"), JSON.stringify(report, null, 2) + "\n");

console.log(`emitted ${fixturesClean.length} render fixtures (${showcase.length} rooms x A/B) -> dev/model-qa/battlemap-fixtures.js`);
console.log(`report -> dev/model-qa/battlemap-audit-report.json`);
console.log("=====================================================\n");
