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
// 8d-8h. DEAD-STATE (2026-07-03, Adam's ruling) — the `obliterated` flag is carried through unchanged,
// same pass-through discipline as `down`/`fled` (check 8 above), for all three unit kinds (pc/ally/
// foe). A corpse (down:true, obliterated:false/absent) and an obliteration (down:true, obliterated:
// true) must both survive theaterUnitsFrom untouched — this is the pure-data half of the dead-state
// feature; the render-time meaning (corpse desaturation vs. no-figure+scorch-marker) lives in
// theater-boot.js, out of this file's scope.
// ============================================================================
{
  const win = freshWin();
  const grid = win.cmZoneGrid("40' x 60'");
  const combat = {
    grid,
    pc: { band: "melee", lane: "C", down: true, obliterated: true }, pcRef: { creatureType: "humanoid" },
    allies: [{ id: "a1", band: "melee", lane: "C", creatureType: "humanoid", down: true, obliterated: true }],
    foes: [
      { fid: "f1", band: "near", lane: "C", creatureType: "beast", down: true, fled: false, obliterated: true },
      { fid: "f2", band: "near", lane: "L", creatureType: "beast", down: true, fled: false } // corpse: down, NOT obliterated
    ]
  };
  const units = win.theaterUnitsFrom(combat).units;
  check("8d. an obliterated PC carries obliterated:true onto its unit", units.find(u => u.id === "pc").obliterated === true, JSON.stringify(units.find(u => u.id === "pc")));
  check("8e. an obliterated ally carries obliterated:true onto its unit", units.find(u => u.id === "a1").obliterated === true, JSON.stringify(units.find(u => u.id === "a1")));
  check("8f. an obliterated foe carries obliterated:true onto its unit", units.find(u => u.id === "f1").obliterated === true, JSON.stringify(units.find(u => u.id === "f1")));
  check("8g. a plain corpse (down:true, no obliterated field) carries obliterated:false — the DEFAULT terminal state stays the corpse, not vaporization",
    units.find(u => u.id === "f2").down === true && units.find(u => u.id === "f2").obliterated === false,
    JSON.stringify(units.find(u => u.id === "f2")));
}
{
  // 8h. MUTATION-STYLE proof this field is actually load-bearing (not vacuously true from JS truthy
  // coercion of an absent field reading as undefined-not-false): absent `obliterated` on every unit
  // kind resolves to the literal boolean false, never undefined — a caller doing `u.obliterated ===
  // true` (theater-boot.js's own setUnits check) must get a clean negative, not an ambiguous undefined.
  const win = freshWin();
  const grid = win.cmZoneGrid("40' x 60'");
  const combat = {
    grid,
    pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" },
    allies: [{ id: "a1", band: "melee", lane: "C", creatureType: "humanoid" }],
    foes: [{ fid: "f1", band: "near", lane: "C", creatureType: "beast" }]
  };
  const units = win.theaterUnitsFrom(combat).units;
  check("8h. obliterated defaults to the literal boolean false (never undefined) for pc/ally/foe alike",
    units.every(u => u.obliterated === false), JSON.stringify(units.map(u => ({ id: u.id, obliterated: u.obliterated }))));
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
  const REQUIRED_FIELDS = ["top", "side", "altTop", "water", "scorch", "prop", "voidTint", "accent", "elevTint"];
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

// ============================================================================
// 13. G9 TUNE 1/2 (docs/PRE-PLAYTEST-GAUNTLET.md §10b) — legibility calibration, directly-asserted
//     constants. Red-first against the PRE-tune values (top lum ~0.23-0.34, top/altTop lum delta
//     ~0.03, elevated tiles = palette.accent, THEATER_STEP = 0.5) — these checks fail on that build
//     and pass on the tuned one; they do not weaken any structural check above.
// ============================================================================
{
  const win = freshWin();
  const table = win.__theaterEnvPalette();
  const ENVS = ["dungeon", "urban", "wilderness", "breach"];

  const hex2rgb = (h) => {
    h = String(h).replace("#", "");
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  };
  const luminance = (hex) => {
    const [r, g, b] = hex2rgb(hex).map(c => c / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // 13a. tile TOP luminance was lifted — every env's `top` must now clear a floor well above the
  // pre-tune dungeon value (0.257, the worst offender) so this fails red against the untuned palette.
  ENVS.forEach(envKey => {
    const lum = luminance(table[envKey].top);
    check(`13a. ${envKey}: top luminance cleared the pre-tune floor (>0.30, was <=0.34 pre-tune, dungeon was 0.257)`,
      lum > 0.30, lum.toFixed(3));
  });

  // 13b. altTop pushed FURTHER from top — the checker delta must be plainly visible (pre-tune delta
  // was ~0.03-0.04 across all 4 envs, invisible after dither; tuned delta targets >0.10).
  ENVS.forEach(envKey => {
    const delta = Math.abs(luminance(table[envKey].top) - luminance(table[envKey].altTop));
    check(`13b. ${envKey}: top/altTop luminance delta is plainly visible (>0.10, was ~0.03-0.04 pre-tune)`,
      delta > 0.10, delta.toFixed(3));
  });

  // 13c. elevTint exists, is distinct from accent (accent is hazard-reserved, never elevation), and is
  // LIGHTER than this env's own top (elevation reads as "brighter ground", not a same-or-darker swap).
  ENVS.forEach(envKey => {
    const p = table[envKey];
    check(`13c. ${envKey}: elevTint is distinct from accent (elevation must not borrow the hazard color)`,
      p.elevTint !== p.accent, `${p.elevTint} vs accent ${p.accent}`);
    check(`13c. ${envKey}: elevTint is lighter than this env's top (reads as height, not a tint swap)`,
      luminance(p.elevTint) > luminance(p.top), `elevTint lum ${luminance(p.elevTint).toFixed(3)} vs top lum ${luminance(p.top).toFixed(3)}`);
  });

  // 13d. an elevated zone's tiles actually carry elevTint end-to-end (not just a table-shape check —
  // theaterBoardFrom must read the new field), and it differs from the old accent-based color.
  const scene = { elevZones: ["far:C"], hazards: [], hazardZones: [], cover: {}, zoneCover: {}, exits: [] };
  const board = win.theaterBoardFrom({ dims: "100' x 60' irregular" }, scene, { env: "dungeon" });
  const raised = board.tiles.filter(t => t.zone === "far:C");
  check("13d. an elevated tile's tint IS this env's elevTint (not accent)",
    raised.length > 0 && raised.every(t => t.tint === table.dungeon.elevTint), raised[0] && raised[0].tint);
  check("13d. an elevated tile's tint is NOT this env's accent (the pre-tune hazard-red behavior)",
    raised.every(t => t.tint !== table.dungeon.accent), JSON.stringify([...new Set(raised.map(t => t.tint))]));

  // 13e. THEATER_STEP doubled (0.5 -> 1.0): an elevated zone's tile height must reflect the new step,
  // asserted via the accessor pattern (win.eval can't reach a bare top-level const, so read it off the
  // actual tile height the elevated patch produced — h === THEATER_STEP by construction).
  check("13e. elevation height step doubled — a raised tile's h is 1.0 (was 0.5 pre-tune)",
    raised.every(t => t.h === 1.0), JSON.stringify([...new Set(raised.map(t => t.h))]));
}

// ============================================================================
// 16. MODEL-GRAMMAR G4 (docs/MODEL-GRAMMAR.md §4's "walk-feature props derive the same way"; dev/
//     model-coverage-report.md class-(b)/(c)) — feature/hazard TEXT fixtures -> the RIGHT prop part.
//     (Numbered 16, not 14/15 — this file's own §7/§14/§15 numbers are already reused more than once
//     by earlier PASS-2 units; picking the next never-used number avoids adding a third collision.)
//     Red-first against the pre-G4 build: theaterBoardFrom's cover-zone entries never carried `part`/
//     `partParams` at all (props were always the generic "kind:cover" box) — every `.part === "..."`
//     assertion below is a hard fail on that build and a hard pass on this one; no assertion here
//     could pass by accident against the old shape. All fixtures use "100' x 60' irregular" (the
//     file's own established 4-band x 3-lane fixture dims — see check 1c/2/4 above) so every one of
//     melee/near/far/out x L/C/R is a real zone, avoiding an out-of-grid false negative.
// ============================================================================
{
  const win = freshWin();
  const DIMS = "100' x 60' irregular"; // 4 bands x 3 lanes — every zone below is real in this grid

  // 16a. a collapsed-cart feature -> the `cart` part (with the "collapsed" text driving a non-zero
  // tilt param — proves the text-dependent params branch, not just the part NAME match).
  {
    const segment = { dims: DIMS, feature: { name: "a collapsed cart", flavor: "wheels shattered, contents spilled" } };
    const scene = { cover: { "melee:C": true }, hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: [] };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "melee:C");
    check("16a. a \"collapsed cart\" feature resolves this zone's prop to part:\"cart\"",
      !!prop && prop.part === "cart", prop && JSON.stringify(prop));
    check("16a. the \"collapsed\" text drives a non-zero tilt param on the cart",
      !!prop && prop.partParams && prop.partParams.tilt > 0, prop && JSON.stringify(prop.partParams));
  }

  // 16b. a shrine feature -> the `shrine-block` part.
  {
    const segment = { dims: DIMS, feature: { name: "a quietly maintained shrine", flavor: "fresh offerings, no dust" } };
    const scene = { cover: { "near:L": true }, hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: [] };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "near:L");
    check("16b. a \"shrine\" feature resolves this zone's prop to part:\"shrine-block\"",
      !!prop && prop.part === "shrine-block", prop && JSON.stringify(prop));
  }

  // 16c. a statue feature -> the `statue-figure` part (checked ahead of the broader standing-stone/
  // pillar family in the keyword table, per theater-data.js's own "statue checked BEFORE pillar" note).
  {
    const segment = { dims: DIMS, feature: { name: "a weathered statue", flavor: "a robed figure, one arm broken off" } };
    const scene = { cover: { "far:R": true }, hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: [] };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "far:R");
    check("16c. a \"statue\" feature resolves this zone's prop to part:\"statue-figure\"",
      !!prop && prop.part === "statue-figure", prop && JSON.stringify(prop));
  }

  // 16d. an UNKNOWN feature (no keyword-table hit at all) -> falls through to the generic fallback:
  // no `part`/`partParams` on the prop entry at all (byte-identical to the pre-G4 shape), NOT a thrown
  // error and NOT a guessed part. This is the "never worse than today" floor the whole derivation sits on.
  {
    const segment = { dims: DIMS, feature: { name: "an unplaceable numinous wrongness", flavor: "the walls hum a color with no name" } };
    const scene = { cover: { "out:C": true }, hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: [] };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "out:C");
    check("16d. an unknown/unmatched feature leaves the prop with NO `part` (falls through to the generic cover column)",
      !!prop && prop.part === undefined && prop.partParams === undefined, prop && JSON.stringify(prop));
    check("16d. the fallback prop entry still carries the pre-G4 shape (kind/zone/x/z/level)",
      !!prop && prop.kind === "cover" && typeof prop.x === "number" && typeof prop.z === "number", prop && JSON.stringify(prop));
  }

  // 16e. precedence: a zone's OWN narrated cover text wins over the room-wide feature text (more
  // specific beats less specific) — the zone's cover string names a table, the room feature names a
  // shrine; the zone must resolve to table-slab, not shrine-block.
  {
    const segment = { dims: DIMS, feature: { name: "a quietly maintained shrine", flavor: "" } };
    const scene = { cover: { "melee:L": "an overturned table" }, hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: [] };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "melee:L");
    check("16e. a zone's own cover text (\"table\") wins over the room-wide feature text (\"shrine\")",
      !!prop && prop.part === "table-slab", prop && JSON.stringify(prop));
  }

  // 16f. a hazard kind naming a prop noun resolves that zone's prop too (hazard text is in the same
  // precedence pool as cover/feature text, just lower priority than the zone's own cover string).
  {
    const segment = { dims: DIMS, feature: { name: "", flavor: "" } };
    const scene = {
      cover: { "near:C": true },
      hazardZones: [{ zone: "near:C", kind: "a web-choked passage", revealed: true }],
      hazards: [], elevZones: [], zoneCover: {}, exits: []
    };
    const board = win.theaterBoardFrom(segment, scene);
    const prop = board.props.find(p => p.zone === "near:C");
    check("16f. a hazard kind naming \"web\" resolves this zone's prop to part:\"web-mass\"",
      !!prop && prop.part === "web-mass", prop && JSON.stringify(prop));
  }

  // 16g. theaterPropForText is reachable directly (the classic-script global check-manifest.py's
  // owns-list now names) and degrades cleanly on empty/non-string input rather than throwing.
  check("16g. theaterPropForText is a classic-script global in the real load chain",
    typeof win.theaterPropForText === "function");
  check("16g. theaterPropForText(null) returns null rather than throwing", win.theaterPropForText(null) === null);
  check("16g. theaterPropForText(\"\") returns null rather than throwing", win.theaterPropForText("") === null);
}

// ============================================================================
// 17. THEATER-ZOOM-SPREAD — crowd fixture: 5 foes sharing ONE band (not just one zone) must not blob.
//     G9 note: "5 foes in one band overlap into a blob." theaterWithinZoneOffset's ring only spread
//     occupants of the SAME zone (band:lane) — a full band still funnels every lane's foes onto a
//     shared 3-tile-wide column with no cross-lane awareness, and the pre-widen ring's max radius
//     (0.7 tiles) sat multiple 1.5-scale figures (FIGURE_SCALE) close enough to visually overlap.
//     This fixture stacks 5 foes in the SAME zone (near:C) — the worst case the ring must cover alone
//     — and asserts every pairwise XZ distance clears a floor big enough that two FIGURE_SCALE=1.5
//     figures (each ~0.3-0.4 tile-radius at that scale) don't visually intersect. Red-first against
//     the pre-widen 9-slot ring (max radius 0.7, several slots within a floor-breaking distance of
//     each other for 5 simultaneous occupants).
// ============================================================================
{
  const win = freshWin();
  const grid = win.cmZoneGrid("40' x 60'");
  const combat = {
    grid,
    pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" },
    allies: [],
    foes: [
      { fid: "f1", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f2", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f3", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f4", band: "near", lane: "C", creatureType: "beast" },
      { fid: "f5", band: "near", lane: "C", creatureType: "beast" }
    ]
  };
  const units = win.theaterUnitsFrom(combat).units;
  const foes = units.filter(u => u.kind === "foe");
  check("17a. all 5 foes placed", foes.length === 5, foes.length);

  // pairwise XZ distance floor: two FIGURE_SCALE=1.5 fallback figures need >= ~0.9 tile separation
  // between centers to read as visually distinct rather than a blob (figure footprint is roughly
  // 0.3-0.4 tile radius at that scale, so center-to-center must clear ~2x that plus a hair of margin).
  const FLOOR = 0.9;
  let minDist = Infinity;
  const pairs = [];
  for (let i = 0; i < foes.length; i++) {
    for (let j = i + 1; j < foes.length; j++) {
      const dx = foes[i].x - foes[j].x, dz = foes[i].z - foes[j].z;
      const d = Math.sqrt(dx * dx + dz * dz);
      pairs.push({ a: foes[i].id, b: foes[j].id, d: +d.toFixed(3) });
      if (d < minDist) minDist = d;
    }
  }
  check("17b. every pairwise XZ distance among 5 same-zone foes clears the no-blob floor (>= " + FLOOR + " tiles)",
    minDist >= FLOOR, `min pairwise distance ${minDist.toFixed(3)} — pairs: ${JSON.stringify(pairs)}`);

  // 17c. determinism holds under the widened/lane-spill offset math too — same discipline as check 6a.
  const u2 = win.theaterUnitsFrom(combat).units.filter(u => u.kind === "foe");
  const pos1 = foes.map(u => u.x + "," + u.z).join("|");
  const pos2 = u2.map(u => u.x + "," + u.z).join("|");
  check("17c. the 5-foe crowd spread is deterministic across two independent calls", pos1 === pos2, `${pos1}  vs  ${pos2}`);
}

// ============================================================================
// 18. FLOOR-TEXTURES.md §5.1 — theaterFloorMaterial + board tile.material stamping.
// ============================================================================
{
  const win = freshWin();
  const FLOOR_KEYS = new Set([
    "flagstone", "cobble", "cracked-earth", "cave-rock", "grass", "leaf-litter",
    "sand", "snow-ice", "mud", "scree", "plank", "ash"
  ]);

  // 18a. dungeon fixture (no keyword hit) -> a valid §1 key (the seeded env-default pool).
  const dungeonSeg = { id: "d1", areaType: "chamber", scene: "quiet", sensory: "" };
  const dungeonMat = win.theaterFloorMaterial(dungeonSeg, "dungeon");
  check("18a. theaterFloorMaterial returns a valid §1 key for a dungeon fixture", FLOOR_KEYS.has(dungeonMat), dungeonMat);

  // 18b. urban fixture (no keyword hit) -> a valid §1 key (the seeded env-default pool).
  const urbanSeg = { id: "u1", description: "a quiet square", dressing: { text: "" } };
  const urbanMat = win.theaterFloorMaterial(urbanSeg, "urban");
  check("18b. theaterFloorMaterial returns a valid §1 key for an urban fixture", FLOOR_KEYS.has(urbanMat), urbanMat);

  // 18c. wilderness fixture with a biome (no keyword hit) -> the biome map's exact material.
  const wildSeg = { id: "w1", biome: "Desert", biomeDesc: "" };
  const wildMat = win.theaterFloorMaterial(wildSeg, "wilderness");
  check("18c. wilderness Desert biome (no keyword hit) -> sand", wildMat === "sand", wildMat);

  const wildSeg2 = { id: "w2", biome: "Swamp", biomeDesc: "" };
  const wildMat2 = win.theaterFloorMaterial(wildSeg2, "wilderness");
  check("18c2. wilderness Swamp biome (no keyword hit) -> mud", wildMat2 === "mud", wildMat2);

  // 18d. wilderness fixture whose footing text NAMES a material keyword -> the keyword wins over the
  // biome map (§2 rule 1 outranks rule 2).
  const sandFooting = win.theaterFloorMaterial({ id: "w3", biome: "Grassland", footing: "a wide dune of loose sand" }, "wilderness");
  check("18d. footing text naming \"sand\"/\"dune\" -> sand (beats the Grassland biome default)", sandFooting === "sand", sandFooting);

  const snowFooting = win.theaterFloorMaterial({ id: "w4", biome: "Grassland", footing: "deep snow underfoot" }, "wilderness");
  check("18d2. footing text naming \"snow\" -> snow-ice (beats the Grassland biome default)", snowFooting === "snow-ice", snowFooting);

  const mudFooting = win.theaterFloorMaterial({ id: "w5", biome: "Grassland", footing: { text: "thick mud sucks at every step" } }, "wilderness");
  check("18d3. footing as an OBJECT {text} naming \"mud\" -> mud (beats the Grassland biome default)", mudFooting === "mud", mudFooting);

  // 18e. determinism: same segment id -> same seeded env-default pick every call.
  const dungeonMat2 = win.theaterFloorMaterial(dungeonSeg, "dungeon");
  check("18e. theaterFloorMaterial is deterministic (same segment id -> same pick both calls)", dungeonMat === dungeonMat2, `${dungeonMat} vs ${dungeonMat2}`);

  // 18f. board tiles carry `material` on floor/elevated only — null on hazard/water.
  const scene = {
    elevZones: ["melee:C"],
    hazardZones: [{ zone: "near:C", kind: "a flooded pit" }, { zone: "near:R", kind: "scorched ground" }]  // both zones in-grid (a 40'x60' room is a 2-band melee/near grid — far:C does not exist)
  };
  const board = win.theaterBoardFrom({ id: "b1", dims: "40' x 60'", areaType: "hall" }, scene, { env: "dungeon" });
  const byZoneKind = {};
  board.tiles.forEach(t => { byZoneKind[t.zone] = byZoneKind[t.zone] || t.kind; });
  const floorTiles = board.tiles.filter(t => t.kind === "floor");
  const elevatedTiles = board.tiles.filter(t => t.kind === "elevated");
  const hazardTiles = board.tiles.filter(t => t.kind === "hazard");
  const waterTiles = board.tiles.filter(t => t.kind === "water");
  check("18f1. board has at least one floor, elevated, hazard, and water tile in this fixture",
    floorTiles.length > 0 && elevatedTiles.length > 0 && hazardTiles.length > 0 && waterTiles.length > 0,
    `floor=${floorTiles.length} elevated=${elevatedTiles.length} hazard=${hazardTiles.length} water=${waterTiles.length}`);
  check("18f2. every FLOOR tile carries a valid §1 material key",
    floorTiles.every(t => FLOOR_KEYS.has(t.material)), JSON.stringify(floorTiles.slice(0,2).map(t=>t.material)));
  check("18f3. every ELEVATED tile carries a valid §1 material key",
    elevatedTiles.every(t => FLOOR_KEYS.has(t.material)), JSON.stringify(elevatedTiles.slice(0,2).map(t=>t.material)));
  check("18f4. every HAZARD tile carries material === null", hazardTiles.every(t => t.material === null), JSON.stringify(hazardTiles.map(t=>t.material)));
  check("18f5. every WATER tile carries material === null", waterTiles.every(t => t.material === null), JSON.stringify(waterTiles.map(t=>t.material)));
  check("18f6. board.floorMaterial is a valid §1 key (the room-wide computed value)", FLOOR_KEYS.has(board.floorMaterial), board.floorMaterial);
  check("18f7. all floor/elevated tiles in ONE room share the SAME material (room-wide, not per-zone)",
    floorTiles.concat(elevatedTiles).every(t => t.material === board.floorMaterial), "mismatch found");

  // 18g. never throws on a partial/missing segment.
  let threw = false;
  try { win.theaterFloorMaterial(null, "dungeon"); win.theaterFloorMaterial({}, undefined); win.theaterFloorMaterial(undefined, "nonexistent-env"); }
  catch(e){ threw = true; }
  check("18g. theaterFloorMaterial never throws on null/partial/unknown-env input", !threw);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
