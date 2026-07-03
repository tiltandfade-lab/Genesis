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
const accessors = "function __bestiary(){return BESTIARY;} function __theaterEnvPalette(){return THEATER_ENV_PALETTE;} function __theaterDefaultEnv(){return THEATER_DEFAULT_ENV;}";

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
  // PASS 2 (2026-07-03): 5 archetype buckets -> 9 (adds giant/ooze/arachnid/amorphous-horror).
  const ARCHETYPES = new Set(["biped", "quadruped", "flyer", "serpent", "swarm", "giant", "ooze", "arachnid", "amorphous-horror"]);
  const mapped = realTypes.map(t => [t, win.theaterArchetypeFor(t, "medium")]);
  const bad = mapped.filter(([, a]) => !ARCHETYPES.has(a));
  check("7b. every real bestiary creatureType maps to one of the 9 known archetypes", bad.length === 0, JSON.stringify(bad));
  check("7c. a swarm-flavored type maps to the swarm archetype", win.theaterArchetypeFor("swarm", "tiny") === "swarm", win.theaterArchetypeFor("swarm", "tiny"));
  check("7d. an unknown/absent creatureType defaults to biped (never throws/undefined)", win.theaterArchetypeFor(undefined, undefined) === "biped", win.theaterArchetypeFor(undefined, undefined));
  check("7e. the ooze type maps to its own ooze archetype (not quadruped)", win.theaterArchetypeFor("ooze", "large") === "ooze", win.theaterArchetypeFor("ooze", "large"));
  check("7f. the giant type maps to its own giant archetype", win.theaterArchetypeFor("giant", "large") === "giant", win.theaterArchetypeFor("giant", "large"));
  check("7g. the aberration type maps to amorphous-horror (no longer biped)", win.theaterArchetypeFor("aberration", "medium") === "amorphous-horror", win.theaterArchetypeFor("aberration", "medium"));
}

// ============================================================================
// 13. PASS 2 — archetype coverage over REAL bestiary rows for each new archetype (red-first: these
//     assert against actual data/bestiary.js entries, not synthetic type/size pairs, so a mapping
//     rule that looks right in isolation but misses/over-fires on the real corpus shows up here).
// ============================================================================
{
  const win = freshWin();
  const B = Object.values(win.__bestiary());
  const arch = (e) => win.theaterArchetypeFor(e.tags && e.tags.type, e.tags && e.tags.size, e.name);

  // giant: the `giant` type always buckets giant (Ettin/Ogre/Troll/Cloud Giant/... — 15 real rows).
  const giantTyped = B.filter(e => e.tags && e.tags.type === "giant");
  check("13a. every real bestiary row tagged type:giant maps to the giant archetype",
    giantTyped.length > 5 && giantTyped.every(e => arch(e) === "giant"),
    JSON.stringify(giantTyped.filter(e => arch(e) !== "giant").map(e => e.name)));

  // giant: huge/gargantuan on an otherwise-biped type also buckets giant (Balor, Colossus, Dracolich,
  // Empyrean, Graveyard/Haunting Revenant — real rows, none of them the `giant` type).
  ["Balor", "Colossus", "Dracolich", "Empyrean", "Graveyard Revenant", "Haunting Revenant"].forEach(nm => {
    const e = B.find(x => x.name === nm);
    check(`13b. huge/gargantuan non-giant-type "${nm}" still buckets giant (size override)`,
      !!e && arch(e) === "giant", e ? `${e.tags.type}:${e.tags.size} -> ${arch(e)}` : "row not found");
  });

  // giant size-override false-positive guard: a huge CELESTIAL ELK / huge fey DIRE WORG are real
  // bestiary rows that would wrongly bucket giant under a naive "huge non-aberration -> giant" rule —
  // the name-keyword guard must keep them quadruped.
  ["Giant Elk", "Dire Worg"].forEach(nm => {
    const e = B.find(x => x.name === nm);
    check(`13c. huge animal-shaped "${nm}" stays quadruped despite huge size (false-positive guard)`,
      !!e && arch(e) === "quadruped", e ? `${e.tags.type}:${e.tags.size} -> ${arch(e)}` : "row not found");
  });

  // ooze: all 6 real ooze-typed rows bucket ooze.
  const oozeTyped = B.filter(e => e.tags && e.tags.type === "ooze");
  check("13d. every real bestiary row tagged type:ooze maps to the ooze archetype",
    oozeTyped.length >= 5 && oozeTyped.every(e => arch(e) === "ooze"),
    JSON.stringify(oozeTyped.map(e => [e.name, arch(e)])));

  // arachnid: name-keyword override fires on the real spider rows, which are NOT a dedicated bestiary
  // type (Giant Spider/Giant Wolf Spider/Spider are beast; Phase Spider is monstrosity) — proving the
  // override actually overrides the base type mapping rather than merely matching an already-correct
  // bucket.
  ["Giant Spider", "Giant Wolf Spider", "Spider", "Phase Spider"].forEach(nm => {
    const e = B.find(x => x.name === nm);
    check(`13e. spider-named "${nm}" buckets arachnid regardless of its base type (${e ? e.tags.type : "?"})`,
      !!e && arch(e) === "arachnid", e ? `${e.tags.type} -> ${arch(e)}` : "row not found");
  });

  // amorphous-horror: aberration-typed rows (minus the spider-keyword override, which has no
  // aberration-typed rows to collide with in this bestiary) bucket amorphous-horror.
  const aberrationTyped = B.filter(e => e.tags && e.tags.type === "aberration");
  check("13f. every real bestiary row tagged type:aberration maps to amorphous-horror",
    aberrationTyped.length > 10 && aberrationTyped.every(e => arch(e) === "amorphous-horror"),
    JSON.stringify(aberrationTyped.filter(e => arch(e) !== "amorphous-horror").map(e => e.name)));
}

// ============================================================================
// 14. PASS 2 — class silhouette mapping (PC/ally figures)
// ============================================================================
{
  const win = freshWin();
  check("14a. Fighter -> martial", win.theaterClassSilhouetteFor("Fighter") === "martial", win.theaterClassSilhouetteFor("Fighter"));
  check("14b. Barbarian -> martial", win.theaterClassSilhouetteFor("Barbarian") === "martial", win.theaterClassSilhouetteFor("Barbarian"));
  check("14c. Ranger -> ranger", win.theaterClassSilhouetteFor("Ranger") === "ranger", win.theaterClassSilhouetteFor("Ranger"));
  check("14d. Rogue -> ranger", win.theaterClassSilhouetteFor("Rogue") === "ranger", win.theaterClassSilhouetteFor("Rogue"));
  check("14e. Wizard -> caster", win.theaterClassSilhouetteFor("Wizard") === "caster", win.theaterClassSilhouetteFor("Wizard"));
  check("14f. Sorcerer -> caster", win.theaterClassSilhouetteFor("Sorcerer") === "caster", win.theaterClassSilhouetteFor("Sorcerer"));
  check("14g. Cleric -> cleric", win.theaterClassSilhouetteFor("Cleric") === "cleric", win.theaterClassSilhouetteFor("Cleric"));
  check("14h. Paladin -> cleric", win.theaterClassSilhouetteFor("Paladin") === "cleric", win.theaterClassSilhouetteFor("Paladin"));
  check("14i. lowercase class name still resolves (case-insensitive)", win.theaterClassSilhouetteFor("wizard") === "caster", win.theaterClassSilhouetteFor("wizard"));
  check("14j. unknown/absent class defaults martial (never throws/undefined)", win.theaterClassSilhouetteFor(undefined) === "martial", win.theaterClassSilhouetteFor(undefined));

  // weapon-from-class: each silhouette implies its signature weapon shape.
  check("14k. martial -> sword weapon", win.theaterWeaponForClass("martial") === "sword", win.theaterWeaponForClass("martial"));
  check("14l. ranger -> bow weapon", win.theaterWeaponForClass("ranger") === "bow", win.theaterWeaponForClass("ranger"));
  check("14m. caster -> staff weapon", win.theaterWeaponForClass("caster") === "staff", win.theaterWeaponForClass("caster"));
  check("14n. cleric -> mace weapon", win.theaterWeaponForClass("cleric") === "mace", win.theaterWeaponForClass("cleric"));

  // end-to-end through theaterUnitsFrom: pcRef.class threads to unit.silhouette/unit.weapon.
  const grid = win.cmZoneGrid("40' x 60'");
  const combat = { grid, pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid", class: "Wizard" }, allies: [], foes: [] };
  const pcUnit = win.theaterUnitsFrom(combat).units.find(u => u.id === "pc");
  check("14o. theaterUnitsFrom threads pcRef.class into unit.silhouette", pcUnit.silhouette === "caster", pcUnit.silhouette);
  check("14p. theaterUnitsFrom derives unit.weapon from the PC's silhouette", pcUnit.weapon === "staff", pcUnit.weapon);
}

// ============================================================================
// 15. PASS 2 — foe weapon-shape keyword detection (name/action-text)
// ============================================================================
{
  const win = freshWin();
  check("15a. a foe named with an obvious weapon word gets the matching shape",
    win.theaterWeaponForFoe("Spear-Thrower", []) === "spear", win.theaterWeaponForFoe("Spear-Thrower", []));
  check("15b. a foe with a weapon-word ACTION (not name) gets the matching shape",
    win.theaterWeaponForFoe("Bandit Enforcer", [{ name: "Mace" }]) === "mace",
    win.theaterWeaponForFoe("Bandit Enforcer", [{ name: "Mace" }]));
  check("15c. earliest-listed weapon-word action wins when a stat block has more than one",
    win.theaterWeaponForFoe("Bandit Courier", [{ name: "Shortsword" }, { name: "Longbow" }]) === "sword",
    win.theaterWeaponForFoe("Bandit Courier", [{ name: "Shortsword" }, { name: "Longbow" }]));
  check("15c2. and a lone bow-only action maps to the bow shape",
    win.theaterWeaponForFoe("Bandit Archer", [{ name: "Longbow" }]) === "bow",
    win.theaterWeaponForFoe("Bandit Archer", [{ name: "Longbow" }]));
  check("15d. no weapon word anywhere -> \"none\" (archetype's bare-limb read, no slab)",
    win.theaterWeaponForFoe("Gibbering Mouther", [{ name: "Bites" }, { name: "Blinding Spittle (Recharge 5-6)" }]) === "none",
    win.theaterWeaponForFoe("Gibbering Mouther", [{ name: "Bites" }, { name: "Blinding Spittle (Recharge 5-6)" }]));
  check("15e. absent/empty actions never throws (degrades to none)",
    win.theaterWeaponForFoe("Nameless Thing", undefined) === "none", win.theaterWeaponForFoe("Nameless Thing", undefined));

  // real bestiary rows, end to end through theaterUnitsFrom's foe path.
  const B = win.__bestiary();
  const grid = win.cmZoneGrid("40' x 60'");
  const bandit = B["bandit-enforcer"] || Object.values(B).find(e => e.name === "Bandit Enforcer");
  check("15f. sanity: Bandit Enforcer exists in the bestiary with a Mace action",
    !!bandit && (bandit.actions || []).some(a => a.name === "Mace"), bandit && bandit.actions && bandit.actions.map(a => a.name));
  if(bandit){
    const combat = { grid, pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" }, allies: [],
      foes: [{ fid: "f1", band: "near", lane: "C", creatureType: "humanoid", name: bandit.name, actions: bandit.actions }] };
    const foeUnit = win.theaterUnitsFrom(combat).units.find(u => u.id === "f1");
    check("15g. theaterUnitsFrom threads a real foe's action text into unit.weapon end-to-end",
      foeUnit.weapon === "mace", foeUnit.weapon);
    check("15h. foe units carry no silhouette field (PC/ally-only concept)",
      foeUnit.silhouette === undefined, foeUnit.silhouette);
  }
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

// ============================================================================
// 10. T1.5 PSX GRIT — env palette table completeness
// ============================================================================
{
  const win = freshWin();
  const REQUIRED_ENVS = ["dungeon", "urban", "wilderness", "breach"];
  const REQUIRED_FIELDS = ["top", "side", "altTop", "water", "scorch", "prop", "voidTint", "accent"];
  const table = win.__theaterEnvPalette();
  check("10a. THEATER_ENV_PALETTE exists and is an object", table && typeof table === "object", typeof table);
  check("10b. all 4 required envs (dungeon/urban/wilderness/breach) are present",
    REQUIRED_ENVS.every(e => !!table[e]), JSON.stringify(Object.keys(table || {})));
  REQUIRED_ENVS.forEach(envKey => {
    const entry = table[envKey] || {};
    const missing = REQUIRED_FIELDS.filter(f => typeof entry[f] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(entry[f]));
    check(`10c. ${envKey} palette has all required fields as valid hex colors`, missing.length === 0, JSON.stringify(missing));
  });
  // low-saturation / earth-mood spot check: top and side must differ (rule 2's contrast), and no env
  // should have two identical hex values across its own top/side/altTop/water/scorch/prop (a copy-paste
  // that silently drops the "each color plays a distinct legibility role" intent).
  REQUIRED_ENVS.forEach(envKey => {
    const entry = table[envKey];
    check(`10d. ${envKey}: top != side (rule 2's contrast requirement)`, entry.top !== entry.side, `${entry.top} vs ${entry.side}`);
    const roleColors = [entry.top, entry.side, entry.altTop, entry.water, entry.scorch, entry.prop];
    const uniqueRoles = new Set(roleColors);
    check(`10e. ${envKey}: top/side/altTop/water/scorch/prop are 6 distinct colors (no accidental dupes)`,
      uniqueRoles.size === roleColors.length, JSON.stringify(roleColors));
  });
  check("10f. theaterPaletteFor(undefined) degrades cleanly to the default env's palette",
    JSON.stringify(win.theaterPaletteFor(undefined)) === JSON.stringify(table[win.__theaterDefaultEnv()]),
    JSON.stringify(win.theaterPaletteFor(undefined)));
  check("10g. theaterPaletteFor('not-a-real-env') degrades cleanly (never throws/undefined)",
    !!win.theaterPaletteFor("not-a-real-env"), win.theaterPaletteFor("not-a-real-env"));
}

// ============================================================================
// 11. T1.5 PSX GRIT — checker alternation actually alternates
// ============================================================================
{
  const win = freshWin();
  const board = win.theaterBoardFrom({ dims: "40' x 60'" }, {}, { env: "dungeon" }); // flat 2x3, no hazards/elev
  const floorTiles = board.tiles.filter(t => t.kind === "floor");
  check("11a. a flat room's tiles are all plain floor (sanity for this check)", floorTiles.length === board.tiles.length, `${floorTiles.length} of ${board.tiles.length}`);
  const altCount = floorTiles.filter(t => t.altTop === true).length;
  const plainCount = floorTiles.filter(t => t.altTop === false).length;
  check("11b. checker alternation actually splits tiles into both buckets (not all-one-value)",
    altCount > 0 && plainCount > 0, `alt=${altCount} plain=${plainCount} of ${floorTiles.length}`);
  // adjacency check: any two tiles differing by exactly 1 in x OR z (not both) must have OPPOSITE
  // altTop — the literal definition of a checkerboard (not just "some are true, some are false").
  const byCoord = {};
  floorTiles.forEach(t => { byCoord[t.x + ":" + t.z] = t; });
  let adjacentPairsChecked = 0, adjacentPairsAlternate = 0;
  floorTiles.forEach(t => {
    const neighbor = byCoord[(t.x + 1) + ":" + t.z];
    if(neighbor){
      adjacentPairsChecked++;
      if(neighbor.altTop !== t.altTop) adjacentPairsAlternate++;
    }
  });
  check("11c. every x-adjacent pair of floor tiles has OPPOSITE altTop (true checkerboard, not stripes/random)",
    adjacentPairsChecked > 0 && adjacentPairsAlternate === adjacentPairsChecked,
    `${adjacentPairsAlternate} of ${adjacentPairsChecked} adjacent pairs alternate`);
  check("11d. the checker pattern is continuous across a zone SEAM (world-coordinate parity, not per-zone reset)",
    (() => {
      // zone seam sits between lane 0's tile x=2 and lane 1's tile x=3 (THEATER_PATCH=3) — those must
      // still alternate, proving the parity is computed in world coords, not reset to 0 per zone.
      const a = byCoord["2:0"], b = byCoord["3:0"];
      return a && b && a.altTop !== b.altTop;
    })(), JSON.stringify({ a: byCoord["2:0"], b: byCoord["3:0"] }));
  // hazard/elevated tiles must NOT carry the checker split — they read as one solid color.
  const scene2 = { elevZones: ["far:C"], hazardZones: [{ zone: "near:C", kind: "flooded", revealed: true }], hazards: [], cover: {}, zoneCover: {}, exits: [] };
  const board2 = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, scene2, { env: "dungeon" });
  const elevTiles = board2.tiles.filter(t => t.zone === "far:C");
  const waterTiles = board2.tiles.filter(t => t.zone === "near:C");
  check("11e. an elevated zone's tiles are all altTop:false (checker doesn't apply — solid accent color)",
    elevTiles.every(t => t.altTop === false), JSON.stringify(elevTiles.map(t => t.altTop)));
  check("11f. a hazard zone's tiles are all altTop:false (checker doesn't apply — solid warning color)",
    waterTiles.every(t => t.altTop === false), JSON.stringify(waterTiles.map(t => t.altTop)));
}

// ============================================================================
// 12. T1.5 PSX GRIT — env threading (opts.env selects the right palette end-to-end)
// ============================================================================
{
  const win = freshWin();
  check("12a. default (no opts) -> env:\"dungeon\" on the returned board", win.theaterBoardFrom({ dims: "40' x 60'" }, {}).env === "dungeon",
    win.theaterBoardFrom({ dims: "40' x 60'" }, {}).env);

  const ENVS = ["dungeon", "urban", "wilderness", "breach"];
  ENVS.forEach(envKey => {
    const board = win.theaterBoardFrom({ dims: "40' x 60'" }, {}, { env: envKey });
    check(`12b. opts.env:"${envKey}" -> board.env echoes it back`, board.env === envKey, board.env);
    const palette = win.theaterPaletteFor(envKey);
    const floorTile = board.tiles.find(t => t.altTop === false);
    const altTile = board.tiles.find(t => t.altTop === true);
    check(`12c. opts.env:"${envKey}" -> plain floor tiles carry THIS env's top color`, floorTile && floorTile.tint === palette.top, floorTile && floorTile.tint);
    check(`12d. opts.env:"${envKey}" -> alt floor tiles carry THIS env's altTop color`, altTile && altTile.tint === palette.altTop, altTile && altTile.tint);
  });

  // cross-env sanity: two different envs must actually produce DIFFERENT tints for the same fixture
  // (proves the env selection is load-bearing, not just echoed back as a label with no visual effect).
  const dTile = win.theaterBoardFrom({ dims: "40' x 60'" }, {}, { env: "dungeon" }).tiles[0];
  const wTile = win.theaterBoardFrom({ dims: "40' x 60'" }, {}, { env: "wilderness" }).tiles[0];
  check("12e. dungeon vs wilderness produce visibly different tile tints for the identical fixture",
    dTile.tint !== wTile.tint, `${dTile.tint} vs ${wTile.tint}`);

  // unknown env degrades to the default rather than throwing or silently going undefined.
  const unknownBoard = win.theaterBoardFrom({ dims: "40' x 60'" }, {}, { env: "not-a-real-env" });
  check("12f. an unknown opts.env degrades to a real tint set (never undefined/throws)",
    typeof unknownBoard.tiles[0].tint === "string", unknownBoard.tiles[0].tint);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
