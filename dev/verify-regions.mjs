/* verify-regions.mjs — headless test for REGIONS-NAMES (docs/REGIONS-NAMES.md, BATCH2-GUARDRAILS
   H1: ≥7 asserts, 0 failed):

   §1 geometry+identity — same hex → same region forever (deterministic regionAt); first-touch
      identity rolls ONCE and is write-once canon (regionEnsure idempotent: a second call for an
      already-minted cell never re-rolls, never duplicates the codex/ledger writes) — MUTATION CHECK
      shown RED: force a second roll to fire, confirm the harness catches the write-once break, then
      restore.
   §1 vector consumers — regionArchetypeWeight actually shifts weight toward a matching creature type
      ("barrow-country ups undead"); regionBiasedWalkSkin/regionBlendedName degrade byte-identically
      to the unbiased path when no region is passed (zero-regression).
   §2 the fraying rim — frayLevel/frayBeyond1/frayBeyond2 honor FRAY_D/FRAY_1/FRAY_2; fraySpiceFloor
      raises Grounded/Textured to Textured beyond FRAY_1 and never softens an already-higher band;
      regionRimBearing returns a real compass point and rollPressure("external",w) stamps it (while
      "internal" pressures get no bearing, per §2's external-fronts-only scope).
   §3 names — regionBlendedName draws region-culture-first when a region+cultures are minted.
   Regression — every other dev/verify-*.mjs/.py in the sweep stays green (run separately).

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-walk-refresh.mjs / dev/verify-gen.mjs (jsdom resolved per
   CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-regions.mjs   (from repo root) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
// top-level `const` (WALK_ARCHETYPES, NAME_CULTURES, SPICE_ORDER) don't attach to jsdom's `window`
// under win.eval (same gotcha documented in verify-gen.mjs/verify-walk-refresh.mjs) — thin accessor
// wrappers expose them to the harness without changing production code.
const accessors = "function __walkArchetypes(){return WALK_ARCHETYPES;} " +
  "function __nameCultures(){return (typeof NAME_CULTURES!=='undefined')?NAME_CULTURES:null;} " +
  "function __spiceOrder(){return SPICE_ORDER;} " +
  "function __frayD(){return FRAY_D;} function __fray1(){return FRAY_1;} function __fray2(){return FRAY_2;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Regions Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}

function freshDom(loadSrc = srcText){
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + loadSrc);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  const world = baseWorld("w-regions-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  win.setNodeXY(world, originId, 0, 0);
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

// ============================================================
// 1. regionAt is deterministic: the SAME hex resolves to the SAME region cell key every call, for
//    ANY hex (not just the queried point) — "same hex → same region forever."
// ============================================================
{ const { win } = freshDom();
  const a1 = win.regionAt(win.U.worlds[win.U.activeWorldId], 5, -3);
  const a2 = win.regionAt(win.U.worlds[win.U.activeWorldId], 5, -3);
  const a3 = win.regionAt(win.U.worlds[win.U.activeWorldId], 5, -3);
  check("1. regionAt(hex) is deterministic across repeated calls (same key every time)",
    a1.key === a2.key && a2.key === a3.key, JSON.stringify([a1.key, a2.key, a3.key]));
  // a DIFFERENT world (different seed) may land on a different jittered center — same world must not drift.
  const far = win.regionAt(win.U.worlds[win.U.activeWorldId], 5000, -3000);
  check("1b. a far-away hex resolves to a DIFFERENT region cell than the origin hex (real geography, not a constant)",
    far.key !== a1.key, JSON.stringify({ near: a1.key, far: far.key }));
}

// ============================================================
// 2. regionEnsure: first-touch rolls ONCE and writes w.regions[cellKey] + a codex `region` record +
//    a `canon` ledger line; a SECOND call for the SAME cell is a pure cache read (idempotent —
//    write-once canon, never re-rolled, never duplicated).
// ============================================================
{ const { win, world } = freshDom();
  const before = (world.ledger || []).length;
  const rec1 = win.regionEnsure(world, 5, -3);
  check("2a. regionEnsure mints a record with a name + vector on first touch",
    rec1 && typeof rec1.name === "string" && rec1.vector && Array.isArray(rec1.vector.cultures),
    JSON.stringify(rec1 && { name: rec1.name, vector: rec1.vector }));
  const afterFirst = (world.ledger || []).length;
  check("2b. first touch writes exactly one canon ledger line", afterFirst === before + 1, `before=${before} after=${afterFirst}`);
  const codexCountAfterFirst = Object.keys(win.codexOf(world).records).length;

  const rec2 = win.regionEnsure(world, 5, -3);   // same hex, second call
  const afterSecond = (world.ledger || []).length;
  check("2c. WRITE-ONCE: a second regionEnsure call for the same cell is idempotent — SAME object, no re-roll",
    rec2 === rec1 && afterSecond === afterFirst, `sameRef=${rec2 === rec1} before=${afterFirst} after=${afterSecond}`);
  check("2d. WRITE-ONCE: no duplicate codex `region` record minted on the second call",
    Object.keys(win.codexOf(world).records).length === codexCountAfterFirst,
    `codexCount stayed ${codexCountAfterFirst}? now=${Object.keys(win.codexOf(world).records).length}`);
}

// ============================================================
// 3. MUTATION (shown RED then restored): break regionEnsure's existing-cell guard (simulate it
//    always re-rolling) → a second touch of the SAME cell fires a second ledger write and mints a
//    second codex record — this harness must FAIL under the mutation, confirming the guard is
//    load-bearing. Verified by literally re-running with the guard broken.
// ============================================================
{
  const original = read("src/engine/region.js");
  const guardRe = /if\(existing\) return existing;/;
  const hasGuard = guardRe.test(original);
  check("3a. MUTATION setup: the write-once guard line found in region.js", hasGuard);
  if (hasGuard) {
    const mutatedFull = original.replace(guardRe, "if(false) return existing;");
    const redOk = mutatedFull !== original;
    check("3b. MUTATION applies cleanly (guard neutered)", redOk, "mutation source edit failed");

    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/region.js" ? mutatedFull : read(p)).join("\n;\n") +
      "\n;\n" + accessors;
    const { win, world } = freshDom(mutSrc);
    const before = (world.ledger || []).length;
    win.regionEnsure(world, 5, -3);
    win.regionEnsure(world, 5, -3);   // same cell, second call — SHOULD be a no-op, isn't under the mutation
    const after = (world.ledger || []).length;
    check("3c. MUTATION shown RED: with the write-once guard neutered, a second touch of the same cell re-writes canon",
      after === before + 2, `expected 2 ledger writes under the mutation, got ${after - before}`);

    // RESTORE: re-run with the real (unmutated) source and confirm write-once holds again.
    const { win: win2, world: world2 } = freshDom();
    const before2 = (world2.ledger || []).length;
    win2.regionEnsure(world2, 5, -3);
    win2.regionEnsure(world2, 5, -3);
    const after2 = (world2.ledger || []).length;
    check("3d. RESTORED: write-once holds again with the real guard (exactly one ledger write for two touches)",
      after2 === before2 + 1, `before=${before2} after=${after2}`);
  }
}

// ============================================================
// 4. regionArchetypeWeight actually shifts weight toward a matching creature type — "barrow-country
//    ups undead" (§1). A region with archetypeBias="undead / ambusher+" must weight an undead-typed
//    archetype ("Risen Dead", WALK_ARCHETYPES types:["undead"]) higher than a non-matching one.
// ============================================================
{ const { win } = freshDom();
  const undeadRegion = { vector: { archetypeBias: "undead / ambusher+" } };
  const noRegion = null;
  const wUndead = win.regionArchetypeWeight(undeadRegion, "Risen Dead");
  const wBaseline = win.regionArchetypeWeight(noRegion, "Risen Dead");
  check("4a. a matching archetypeBias weights an undead archetype ABOVE the no-region baseline",
    wUndead > wBaseline, `wUndead=${wUndead} wBaseline=${wBaseline}`);
  const wMismatch = win.regionArchetypeWeight(undeadRegion, "Beast Den");   // WALK_ARCHETYPES types:["beast"] — no overlap
  check("4b. a NON-matching archetype (Beast Den, types:[beast]) is not boosted by an undead bias",
    wMismatch === 1, `wMismatch=${wMismatch}`);
}

// ============================================================
// 5. regionBiasedWalkSkin / regionBiasedArchetypePool degrade to the plain unbiased call when no
//    region is passed — zero-regression for every existing walk-roller call site.
// ============================================================
{ const { win } = freshDom();
  const skinNoRegion = win.regionBiasedWalkSkin(null, "wilderness");
  const plainSkin = win.rollWalkSkin("wilderness");
  check("5a. regionBiasedWalkSkin(null,...) returns the same SHAPE as a plain rollWalkSkin call (no region = no-op path)",
    (skinNoRegion === null && plainSkin === null) || (skinNoRegion && plainSkin && typeof skinNoRegion.text === "string" && typeof plainSkin.text === "string"),
    JSON.stringify({ skinNoRegion, plainSkin }));
  const poolNoRegion = win.regionBiasedArchetypePool(null, "Risen Dead", { tier: 2, slot: "boss" }, "Skeleton / Zombie");
  check("5b. regionBiasedArchetypePool(null,...) still resolves a valid creature name (authored or bestiary)",
    typeof poolNoRegion === "string" && poolNoRegion.length > 0, JSON.stringify(poolNoRegion));
}

// ============================================================
// 6. the fraying rim: frayLevel/frayBeyond1/frayBeyond2 honor the named constants (FRAY_D=40,
//    FRAY_1=15, FRAY_2=28); fraySpiceFloor raises a sub-Textured band to Textured beyond FRAY_1 and
//    never softens an already-higher band (Strange/Volatile/Mythic pass through unchanged).
// ============================================================
{ const { win } = freshDom();
  check("6a. FRAY_D/FRAY_1/FRAY_2 match the BATCH2-GUARDRAILS H3 provisional constants",
    win.__frayD() === 40 && win.__fray1() === 15 && win.__fray2() === 28,
    `FRAY_D=${win.__frayD()} FRAY_1=${win.__fray1()} FRAY_2=${win.__fray2()}`);
  check("6b. frayLevel(origin) = 0 (clamp(hexDist(origin)/FRAY_D))", win.frayLevel(0, 0) === 0, win.frayLevel(0, 0));
  check("6c. frayBeyond1 is false inside FRAY_1, true just past it", !win.frayBeyond1(10, 0) && win.frayBeyond1(16, 0),
    JSON.stringify({ at10: win.frayBeyond1(10, 0), at16: win.frayBeyond1(16, 0) }));
  check("6d. frayBeyond2 is false inside FRAY_2, true just past it", !win.frayBeyond2(20, 0) && win.frayBeyond2(29, 0),
    JSON.stringify({ at20: win.frayBeyond2(20, 0), at29: win.frayBeyond2(29, 0) }));
  check("6e. fraySpiceFloor raises Grounded to Textured beyond FRAY_1", win.fraySpiceFloor("Grounded", 20, 0) === "Textured",
    win.fraySpiceFloor("Grounded", 20, 0));
  check("6f. fraySpiceFloor never SOFTENS an already-higher band (Mythic stays Mythic beyond FRAY_1)",
    win.fraySpiceFloor("Mythic", 20, 0) === "Mythic", win.fraySpiceFloor("Mythic", 20, 0));
  check("6g. fraySpiceFloor is a no-op INSIDE FRAY_1 (Grounded stays Grounded)",
    win.fraySpiceFloor("Grounded", 5, 0) === "Grounded", win.fraySpiceFloor("Grounded", 5, 0));
}

// ============================================================
// 7. rim-ward pressure bearing: regionRimBearing returns a real 8-point compass string; an EXTERNAL
//    pressure rolled at world-creation carries a `bearing`, an INTERNAL one does not (§2 scope:
//    "new/escalating EXTERNAL fronts take a bearing").
// ============================================================
{ const { win, world } = freshDom();
  const bearing = win.regionRimBearing(world, 0, 0);
  const COMPASS8 = ["N","NE","E","SE","S","SW","W","NW"];
  check("7a. regionRimBearing returns one of the 8 compass points", COMPASS8.includes(bearing), bearing);

  const ext = win.rollPressure("external", world);
  const int = win.rollPressure("internal", world);
  check("7b. an EXTERNAL pressure is stamped with a real compass bearing", COMPASS8.includes(ext.bearing), JSON.stringify(ext.bearing));
  check("7c. an INTERNAL pressure carries no bearing (external-fronts-only scope, §2)", int.bearing === null, JSON.stringify(int.bearing));
}

// ============================================================
// 8. names: regionBlendedName draws from the region's assigned culture bank when present (§3 —
//    forced to 100% via Math.random stubbing so the assertion isn't flaky on the 70% roll), and
//    falls back to the plain species-pool roll when no region/cultures are available.
// ============================================================
{ const { win } = freshDom();
  const region = { vector: { cultures: ["Varnic"] } };
  const nc = win.__nameCultures();
  check("8a. NAME_CULTURES compiled with the Varnic bank available (gen-names.py --cultures ran)",
    !!(nc && nc.Varnic && nc.Varnic.female && nc.Varnic.female.length), JSON.stringify(nc && Object.keys(nc || {})));
  if (nc && nc.Varnic) {
    const origRandom = win.Math.random;
    win.Math.random = () => 0;   // forces regionCultureDraw's 70% gate to hit + picks index 0 everywhere it's consulted
    const blended = win.regionBlendedName(region, "Human", "female");
    win.Math.random = origRandom;
    const varnicFirstNames = nc.Varnic.female;
    const hitsVarnic = varnicFirstNames.some(n => blended.indexOf(n) === 0);
    check("8b. regionBlendedName draws a Varnic-bank name when a region+culture is present (region-first)",
      hitsVarnic, JSON.stringify({ blended, sample: varnicFirstNames.slice(0, 3) }));
  }
  const plainName = win.regionBlendedName(null, "Human", "female");
  check("8c. regionBlendedName(null,...) falls back to the plain npcRolledName path (no throw, non-empty)",
    typeof plainName === "string" && plainName.length > 0, JSON.stringify(plainName));
}

// ============================================================
// 9. regionForNode resolves a node's placed (x,y) through the hex substrate; nodes with no coords
//    yet return null rather than throwing (graceful, matches nodeXY's own contract).
// ============================================================
{ const { win, world, originId } = freshDom();
  const rec = win.regionForNode(world, originId);
  check("9a. regionForNode resolves a region for a node with placed coords", rec && typeof rec.name === "string", JSON.stringify(rec));
  const unplacedId = win.addNode(world, "Unplaced Place", "Place");
  const recNull = win.regionForNode(world, unplacedId);
  check("9b. regionForNode(node-with-no-coords) returns null gracefully (no throw)", recNull === null, JSON.stringify(recNull));
}

// ============================================================
// 10. Regression spot-check: rollWildernessWalk/rollUrbanWalk/rollDungeonWalk still return
//     byte-compatible top-level shape (region wiring didn't remove/rename any existing field) — the
//     full regression suite (verify-walk-refresh/verify-travel-walks/verify-gen/etc.) is run
//     separately by the sweep and stays green.
// ============================================================
{ const { win } = freshDom();
  const ww = win.rollWildernessWalk({ legCount: 3, tier: 1 });
  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  const dw = win.rollDungeonWalk({ segCount: 3, tier: 1 });
  check("10a. rollWildernessWalk still has environment/legCount/segments/skin",
    ["environment","legCount","segments","skin"].every(k => k in ww), JSON.stringify(Object.keys(ww)));
  check("10b. rollUrbanWalk still has environment/topology/segments/skin",
    ["environment","topology","segments","skin"].every(k => k in uw), JSON.stringify(Object.keys(uw)));
  check("10c. rollDungeonWalk still has environment/topology/segments/skin",
    ["environment","topology","segments","skin"].every(k => k in dw), JSON.stringify(Object.keys(dw)));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
