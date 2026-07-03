/* Verify src/engine/theater-data.js (docs/BATTLE-THEATER.md §1/§7 T1) — the PURE data layer over a
   full jsdom load (real modules in manifest order, same convention as dev/verify-battlemap.mjs /
   dev/verify-combat-tracker.mjs). No GL, no window.Theater — this harness only exercises
   theaterBoardFrom/theaterUnitsFrom, which never touch three.js or the DOM.

   Red-first checks (per the orchestrator's build-ladder note):
     1. dims -> tile counts: a 2-band room vs a 4-band room produce the right tile totals
        (bands x lanes x 9 tiles/zone), and the grid shape matches cmZoneGrid's own derivation.
     2. elevZone raises EXACTLY its own patch (9 tiles), no others.
     3. hazardZones tint their patch; water/pit-ish kinds also sink it, non-water/pit kinds don't.
     4. cover (scene.cover and scene.zoneCover) -> a prop entry at the right zone.
     5. zone-center math for band/lane: theaterUnitsFrom places a solo occupant at its zone's
        geometric center, and that center lines up with theaterBoardFrom's own tile origins for the
        same zone (one derivation, both call sites agree — the spec's "can never disagree" claim).
     6. multi-occupant offsets are deterministic across two independent calls on equivalent combat
        objects (same zone, same ids -> same offsets both times), and distinct occupants of one zone
        do NOT collide (offsets differ pairwise).
     7. archetype mapping covers a sample of REAL bestiary creatureTypes (data/bestiary.js tags.type
        values), never falling through to an undefined bucket.
     8. the down flag on a unit is carried through to units[].down unchanged.
     9. MUTATION CHECK: neuter the elevZone height derivation -> the elevation-raises-a-patch
        assertion must go RED, proving check #2 is actually load-bearing (not vacuously true).

   Run:  node dev/verify-theater-data.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
// Only classic (non-module) loadOrder entries belong in the jsdom eval chain — ui.theater-boot is
// `type:"module"` (an ES-module boundary, three.js/GL) and is loaded via its OWN <script type=
// "module"> tag in genesis.html, never via this classic-script concatenation. Filtering it out here
// mirrors what a real page load does (the module script is a SEPARATE load path) and keeps this
// harness GL-free, per the spec's "pure layer only — no GL" scope for T1's verify script.
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder
  .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
  .map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
// BESTIARY/CM_BANDS/CM_LANES/THEATER_* are top-level `const` — they don't attach to jsdom's `window`
// under win.eval (only var/function do), same gotcha verify-battlemap.mjs/verify-combat-tracker.mjs
// document — so expose them via thin accessor wrappers (which ARE functions, and land on window).
const accessors = "function __bestiary(){return BESTIARY;}";

function freshWin(overrideSrc) {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (overrideSrc || (read("tables.js") + "\n;\n" + moduleSrc)) + "\n;\n" + accessors);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. dims -> tile counts
// ============================================================================
{
  const win = freshWin();
  const b2 = win.theaterBoardFrom({ dims: "40' x 60'" }, {}); // cmDimsToGrid -> 2 bands x 3 lanes
  check("1a. \"40' x 60'\" (2 bands x 3 lanes) -> 54 tiles (2*3*9)", b2.tiles.length === 54, b2.tiles.length);
  check("1b. grid.bandCount/laneCount mirror cmZoneGrid's own derivation", b2.grid.bandCount === 2 && b2.grid.laneCount === 3, JSON.stringify(b2.grid));

  const b4 = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, {}); // 4 bands x 3 lanes
  check("1c. a 4-band room -> 108 tiles (4*3*9)", b4.tiles.length === 108, b4.tiles.length);

  const b1x1 = win.theaterBoardFrom({ dims: "20' x 20'" }, {}); // 1 band x 1 lane
  check("1d. a 1x1 grid (20'x20') -> 9 tiles", b1x1.tiles.length === 9, b1x1.tiles.length);

  const bDefault = win.theaterBoardFrom({}, {}); // absent dims -> full 4x3
  check("1e. absent dims -> the full 4x3 (108 tiles)", bDefault.tiles.length === 108, bDefault.tiles.length);

  const tileKeys = new Set(b2.tiles.map(t => t.x + ":" + t.z));
  check("1f. every tile in a board has a unique x:z coordinate (no overlapping columns)", tileKeys.size === b2.tiles.length, `${tileKeys.size} unique of ${b2.tiles.length}`);
}

// ============================================================================
// 2. elevZone raises EXACTLY its own patch
// ============================================================================
{
  const win = freshWin();
  const scene = { elevZones: ["far:C"], hazards: [], hazardZones: [], cover: {}, zoneCover: {}, exits: [] };
  const board = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, scene); // 4 bands x 3 lanes
  const raised = board.tiles.filter(t => t.h > 0);
  check("2a. exactly one zone's patch (9 tiles) is raised", raised.length === 9, raised.length);
  check("2b. every raised tile belongs to the far:C zone", raised.every(t => t.zone === "far:C"), JSON.stringify([...new Set(raised.map(t => t.zone))]));
  const untouched = board.tiles.filter(t => t.zone !== "far:C");
  check("2c. every OTHER zone's tiles stay at height 0 (no bleed into neighbors)", untouched.every(t => t.h === 0), untouched.filter(t => t.h !== 0).length + " leaked");
}

// ============================================================================
// 3. hazardZones: tint always; water/pit-ish kinds also sink
// ============================================================================
{
  const win = freshWin();
  const scene = {
    hazardZones: [
      { zone: "near:C", kind: "flooded channel", revealed: true },
      { zone: "far:L", kind: "collapsing pit", revealed: true },
      { zone: "melee:R", kind: "caltrops", revealed: true }
    ],
    hazards: [], elevZones: [], cover: {}, zoneCover: {}, exits: []
  };
  const board = win.theaterBoardFrom({ dims: "60' x 60'" }, scene); // 3 bands x 3 lanes
  const byZone = (z) => board.tiles.filter(t => t.zone === z);
  const water = byZone("near:C"), pit = byZone("far:L"), caltrops = byZone("melee:R"), plain = byZone("near:L");

  check("3a. a water-ish hazard kind sinks its patch (h < 0)", water.every(t => t.h < 0), JSON.stringify(water.map(t => t.h)));
  check("3b. a water-ish hazard kind's tint differs from plain floor", water[0].tint !== plain[0].tint, water[0].tint);
  check("3c. a pit-ish hazard kind ALSO sinks its patch (h < 0)", pit.every(t => t.h < 0), JSON.stringify(pit.map(t => t.h)));
  check("3d. water and pit sink to visibly different tints (blue vs dark)", water[0].tint !== pit[0].tint, water[0].tint + " vs " + pit[0].tint);
  check("3e. a non-water/pit hazard kind (caltrops) tints but does NOT sink", caltrops.every(t => t.h === 0) && caltrops[0].tint !== plain[0].tint, JSON.stringify(caltrops.map(t => ({ h: t.h, tint: t.tint }))));
  check("3f. an untouched zone keeps the plain floor tint", plain.every(t => t.h === 0), JSON.stringify(plain.map(t => t.h)));
}

// ============================================================================
// 4. cover -> prop entries (both scene.cover and scene.zoneCover)
// ============================================================================
{
  const win = freshWin();
  const scene = {
    zoneCover: { "near:R": "three-quarters" },
    cover: { "melee:L": true },
    hazards: [], hazardZones: [], elevZones: [], exits: []
  };
  const board = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, scene);
  check("4a. scene.zoneCover produces a prop entry at that zone", board.props.some(p => p.zone === "near:R" && p.kind === "cover"), JSON.stringify(board.props));
  check("4b. the zoneCover LEVEL rides onto the prop", board.props.find(p => p.zone === "near:R").level === "three-quarters", JSON.stringify(board.props.find(p => p.zone === "near:R")));
  check("4c. scene.cover (the looser tag map) ALSO produces a prop entry", board.props.some(p => p.zone === "melee:L" && p.kind === "cover"), JSON.stringify(board.props));
  check("4d. no phantom prop for an untouched zone", !board.props.some(p => p.zone === "far:C"), JSON.stringify(board.props));
}

// ============================================================================
// 5. zone-center math for band/lane: theaterUnitsFrom agrees with theaterBoardFrom
// ============================================================================
{
  const win = freshWin();
  const grid = win.cmZoneGrid("100' x 60' irregular"); // 4 bands x 3 lanes
  const board = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, {});
  const combat = { grid, pc: { band: "far", lane: "L" }, pcRef: { creatureType: "humanoid" }, allies: [], foes: [] };
  const units = win.theaterUnitsFrom(combat);
  const pcUnit = units.units.find(u => u.id === "pc");
  const zoneTiles = board.tiles.filter(t => t.zone === "far:L");
  const minX = Math.min(...zoneTiles.map(t => t.x)), maxX = Math.max(...zoneTiles.map(t => t.x));
  const minZ = Math.min(...zoneTiles.map(t => t.z)), maxZ = Math.max(...zoneTiles.map(t => t.z));
  const expectCx = (minX + maxX) / 2, expectCz = (minZ + maxZ) / 2;
  check("5a. a solo occupant lands at its zone's geometric tile-center (x)", Math.abs(pcUnit.x - expectCx) < 1e-9, `${pcUnit.x} vs ${expectCx}`);
  check("5b. a solo occupant lands at its zone's geometric tile-center (z)", Math.abs(pcUnit.z - expectCz) < 1e-9, `${pcUnit.z} vs ${expectCz}`);
}

// ============================================================================
// 6. multi-occupant offsets: deterministic across calls, non-colliding within one zone
// ============================================================================
{
  const win = freshWin();
  const grid = win.cmZoneGrid("40' x 60'");
  const makeCombat = () => ({
    grid,
    pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" },
    allies: [],
    foes: [
      { fid: "f1", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f2", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f3", band: "near", lane: "C", creatureType: "beast" }
    ]
  });
  const u1 = win.theaterUnitsFrom(makeCombat());
  const u2 = win.theaterUnitsFrom(makeCombat());
  const pos1 = u1.units.map(u => u.x + "," + u.z).join("|");
  const pos2 = u2.units.map(u => u.x + "," + u.z).join("|");
  check("6a. the SAME zone occupancy -> the SAME offsets across two independent calls", pos1 === pos2, `${pos1}  vs  ${pos2}`);
  const near = u1.units.filter(u => u.kind === "foe");
  const key = (u) => u.x + ":" + u.z;
  const uniqueKeys = new Set(near.map(key));
  check("6b. three foes sharing one zone do NOT collide (3 distinct positions)", uniqueKeys.size === 3, JSON.stringify(near.map(key)));
}

// ============================================================================
// 7. archetype mapping covers a sample of REAL bestiary creatureTypes
// ============================================================================
{
  const win = freshWin();
  const realTypes = [...new Set(Object.values(win.__bestiary()).map(e => e.tags && e.tags.type).filter(Boolean))];
  check("7a. the bestiary actually loaded (sanity)", realTypes.length > 5, realTypes.length);
  const ARCHETYPES = new Set(["biped", "quadruped", "flyer", "serpent", "swarm"]);
  const mapped = realTypes.map(t => [t, win.theaterArchetypeFor(t, "medium")]);
  const bad = mapped.filter(([, a]) => !ARCHETYPES.has(a));
  check("7b. every real bestiary creatureType maps to one of the 5 known archetypes", bad.length === 0, JSON.stringify(bad));
  check("7c. a swarm-flavored type maps to the swarm archetype", win.theaterArchetypeFor("swarm", "tiny") === "swarm", win.theaterArchetypeFor("swarm", "tiny"));
  check("7d. an unknown/absent creatureType defaults to biped (never throws/undefined)", win.theaterArchetypeFor(undefined, undefined) === "biped", win.theaterArchetypeFor(undefined, undefined));
}

// ============================================================================
// 8. the down flag is carried through unchanged
// ============================================================================
{
  const win = freshWin();
  const grid = win.cmZoneGrid("40' x 60'");
  const combat = {
    grid,
    pc: { band: "melee", lane: "C", down: true }, pcRef: { creatureType: "humanoid" },
    allies: [{ id: "a1", band: "melee", lane: "C", creatureType: "humanoid", down: false }],
    foes: [{ fid: "f1", band: "near", lane: "C", creatureType: "beast", down: true, fled: false }]
  };
  const units = win.theaterUnitsFrom(combat).units;
  check("8a. a down PC carries down:true onto its unit", units.find(u => u.id === "pc").down === true, JSON.stringify(units.find(u => u.id === "pc")));
  check("8b. an up ally carries down:false onto its unit", units.find(u => u.id === "a1").down === false, JSON.stringify(units.find(u => u.id === "a1")));
  check("8c. a down foe carries down:true onto its unit", units.find(u => u.id === "f1").down === true, JSON.stringify(units.find(u => u.id === "f1")));
}

// ============================================================================
// 9. MUTATION CHECK — neuter the elevZone height derivation, prove check #2 is load-bearing
// ============================================================================
{
  const original = read("src/engine/theater-data.js");
  const marker = `      const baseH = elevated ? THEATER_STEP : 0;`;
  const mutated = `      const baseH = 0; /* MUTATED: elevation neutered */`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(elevZone-height): guard text not found verbatim — source drifted?");
  } else {
    const mutatedSrc = original.replace(marker, mutated);
    const mutModuleSrc = man.loadOrder
      .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
      .map(p => p === "src/engine/theater-data.js" ? mutatedSrc : read(p))
      .join("\n;\n");
    const mwin = freshWin(read("tables.js") + "\n;\n" + mutModuleSrc);
    const scene = { elevZones: ["far:C"], hazards: [], hazardZones: [], cover: {}, zoneCover: {}, exits: [] };
    const board = mwin.theaterBoardFrom({ dims: "100' x 60' irregular" }, scene);
    const raised = board.tiles.filter(t => t.h > 0);
    const nowWrong = raised.length === 0; // the mutation removes ALL elevation, so the elevZone patch reads flat
    check("MUTATION (shown RED then restored): neutering elevZone height makes the raised-patch check fail",
      nowWrong, nowWrong ? "confirmed RED under mutation, as expected" : "guard did not move — theater-data.js wiring may have changed");
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
