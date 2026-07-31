/* Verify the mirror-map drift guard (Adam's ruling, fix/wiring-teeth-0727, unit W5):
     "THEATER_FLOOR_BIOME_MAP + BIOME_DRESSING in src/engine/theater-data.js are hand-keyed to
     wilderness-biome-type's exact row names (a documented silent-fallback bug class — an unmapped
     row mis-renders silently; it recurred yesterday and was hand-fixed)."

   THE BUG CLASS: a hand-typed JS object/array whose keys are meant to MIRROR another source's
   enumerable names (a compiled Engine table's row-name column, or another hand-authored module's
   own id list) drifts silently the moment that source gains/renames/removes an entry — the map
   just falls through to whatever generic default exists (or, worse, has no default at all and
   corrupts a downstream lookup) with no error, no warning, nothing in CI. theater-data.js's own
   2026-07-2x fix comment on THEATER_FLOOR_BIOME_MAP documents exactly this: two of the ten real
   wilderness-biome-type rows ("Deeplands"/"Underwater") silently fell through to a generic
   fallback tint for an unknown length of time because the map was hand-typed against a STALE
   fallback array (wild-walk.js's WILDERNESS_BIOMES) instead of the real compiled table.

   THIS HARNESS asserts, for every hand-keyed mirror map this session's sweep found (grep sweep:
   theater-data.js, walk-archetypes.js, building-kits.js, plus every top-level const in src/ + data/
   whose name ends in _LABELS, _MAP, _ADJACENCY, or _SLOT_MAP, or contains REALM or TOPOLOG, cross-
   checked against its real source), that EVERY row/key/id of the map's claimed source is present
   as a key — OR, where the file itself documents an intentional partial-coverage default (WALK_ARCHETYPES' "best-effort",
   WILDERNESS_BIOMES' "table not loaded" emergency path), that the DEFAULT ITSELF actually fires
   cleanly rather than just trusting the comment. Never asserts a fixed RNG position — the two
   functional checks (resolveArchetypePool / wwalkBiome) assert SHAPE/membership only, run several
   times, exactly like dev/verify-tiyl-entry.mjs's own "loop until they differ" discipline.

   THE THREE KNOWN MIRRORS (named in the unit brief):
     1. THEATER_FLOOR_BIOME_MAP (src/engine/theater-data.js)  <- wilderness-biome-type
     2. BIOME_DRESSING          (src/engine/theater-data.js)  <- wilderness-biome-type
     3. BUILDING_KIT_REALM_LABELS (data/building-kits.js)     <- BUILDING_KITS' own keys
        (its own in-file comment already states the law this harness mechanizes: "no partial maps
        ... would silently fall back to the Frontier label on a missing key, which is exactly the
        drift this completeness note guards against.")

   OTHER MIRRORS FOUND BY THIS UNIT'S SWEEP (none were previously guarded by any check):
     4. DISTRICT_TYPE_REALM_LABELS (src/world/urban.js) <- urban-district-type. Same exact law as
        #3 by its own cross-reference comment ("same completeness convention as
        BUILDING_KIT_REALM_LABELS").
     5. DWALK_SLOT_MAP (src/engine/dungeon-walk.js) <- dungeon-enemy-composition, and
        WALK_SLOT_MAP (src/engine/walk.js) <- urban-enemy-composition: an unmapped Composition
        name degrades a multi-creature encounter (e.g. "The Elite Pair", 2 mid-tier foes) down to
        a single low-CR creature via the bare `||["low"]` at the call site — silent difficulty
        flattening, not a crash.
     6. The dungeon-topology quartet (src/engine/dungeon-walk.js): DUNGEON_TOPOLOGIES itself
        doubles as the VALIDATION ALLOWLIST for the real `dungeon-topology` roll ("topoName =
        DUNGEON_TOPOLOGIES.indexOf(tn)>=0 ? tn : walkRnd(DUNGEON_TOPOLOGIES)") — a real roll that
        isn't in this hand-typed array gets DISCARDED and replaced with a RANDOM topology, and the
        kept description text then describes the wrong, substituted topology. Downstream,
        DWALK_TOPO_SIZE/DWALK_TOPOLOGY_MIN_SEGS silently mis-tune; DWALK_GRAPH_BUILDERS has NO
        fallback guard at its call site at all (`DWALK_GRAPH_BUILDERS[resolved](segCount)`) — a
        missing key there is a hard crash (`undefined is not a function`), not a silent mis-render.
     7. REALM_ADJACENCY (src/engine/dungeon-walk.js) and ANIMAL_REALM_SKINS
        (data/animal-realm-skins.js), both <- REALM_IDS (data/realms.js's 11-realm founding
        slate). ANIMAL_REALM_SKINS's own comment already claims "all 11 present below" — this
        harness is the first thing that actually checks that claim.
     8. (documented-partial, informational — not a gap) WALK_ARCHETYPES (walk-archetypes.js) <-
        wilderness-enemy-category + dungeon/urban-threat-identity-t1/t2 (5 tables): its own header
        says "Coverage is best-effort ... falls back to authored-pool-only" — this harness reports
        coverage per table and proves the fallback itself works, but does not require totality.
     9. (documented-partial, informational) WILDERNESS_BIOMES (wild-walk.js): a STALE fallback
        array (still carries "Underdark"/"Jungle", the exact words the ENV-2 fix's own comment
        names as retired) only reachable when the compiled table fails to load at all. Reported,
        not blocked on, for the same reason: it's an emergency path, not a live lookup.

   Reviewed and found COMPLIANT (an explicit, working, in-file default already exists — out of
   this harness's registry, no check needed): REALM_MATERIALS/INTERIOR_TILE_KITS (total + a
   defaulting accessor), REALM_TEXTURES/OUTLINE_STYLE_BY_REALM (3-flagship-only BY DESIGN, comment
   says so, accessor returns null and the caller already treats null as "no folded texture/no
   outline"), SETTLEMENT_FACADE_MATERIAL_BY_REALM/TRIM/STREET_PROP_POOL_BY_REALM (named *_DEFAULT
   consts + a defaulting accessor function), REALM_DRESSING (GENERATED, not hand-keyed — out of
   scope by definition), REALM_SURFACES/REALM_PROPS (also GENERATED), DWALK_TOPOLOGY_FALLBACK/
   WALK_TOPOLOGY_FALLBACK (correctly missing only their OWN terminal/smallest topology, which the
   resolve loop's own `||"The Spine"`/`||"The Trail"` already catches — not a gap), URBAN_TOPOLOGIES
   (rolled from CODE, not a compiled table at all — nothing to drift against),
   DRESSING_DENSITY_BY_ROLE / animal-knowledge-scope.js (role-keyed, not table-row-keyed, both
   already default cleanly).

   Run:  node dev/verify-mirror-maps.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

/* THE CONST-VISIBILITY GOTCHA (verified empirically before writing this harness — see this unit's
   report): jsdom's `win.eval(bigString)` is an INDIRECT eval, which per spec runs top-level `var`/
   function-declarations into the global OBJECT (so `win.someFn` works fine afterward — every
   mirror map's OWN accessor functions stay callable post-boot), but top-level `const`/`let` land
   only in the global DECLARATIVE record, which is invisible as a `win.X` property AND invisible to
   a second, separate `eval` call. Since every mirror map in this codebase is declared `const`, the
   only way to read one is from code sharing its ORIGINAL eval-time lexical scope — so the "probe"
   below is appended as the TAIL of the SAME eval() call that defines the app, as one big IIFE whose
   return value (a JSON string) becomes that eval's completion value. Everything the probe reads is
   plain data (Object.keys/array copies); every later FUNCTION call in this file (resolveArchetypePool,
   wwalkBiome, walkRows) uses the normal post-boot `win.fn(...)` path, which the same empirical check
   confirmed works fine (function declarations close over their module's consts regardless of how
   they're later invoked). */
const PROBE_TAIL = `
;(function(){
  function rowNames(tableId){
    var rows = walkRows(tableId);
    var names = rows.map(function(r){ return ((r && r[5]) || [])[0]; })
                     .map(function(s){ return (s || "").trim(); })
                     .filter(Boolean);
    var seen = {}, out = [];
    for (var i = 0; i < names.length; i++) { if (!seen[names[i]]) { seen[names[i]] = true; out.push(names[i]); } }
    return out;
  }
  var out = {};
  out.wildernessBiomeRows = rowNames("wilderness-biome-type");
  out.theaterFloorBiomeMapKeys = Object.keys(THEATER_FLOOR_BIOME_MAP);
  out.biomeDressingKeys = Object.keys(BIOME_DRESSING);

  out.buildingKitTypes = BUILDING_KIT_TYPES.slice();
  out.buildingKitsKeys = Object.keys(BUILDING_KITS);
  out.buildingKitRealmLabelsChromeKeys = Object.keys(BUILDING_KIT_REALM_LABELS.chrome);
  out.buildingKitRealmLabelsGloomKeys = Object.keys(BUILDING_KIT_REALM_LABELS.gloom);

  out.urbanDistrictTypeRows = rowNames("urban-district-type");
  out.districtTypeRealmLabelsChromeKeys = Object.keys(DISTRICT_TYPE_REALM_LABELS.chrome);
  out.districtTypeRealmLabelsGloomKeys = Object.keys(DISTRICT_TYPE_REALM_LABELS.gloom);

  out.dungeonEnemyCompositionRows = rowNames("dungeon-enemy-composition");
  out.dwalkSlotMapKeys = Object.keys(DWALK_SLOT_MAP);
  out.urbanEnemyCompositionRows = rowNames("urban-enemy-composition");
  out.walkSlotMapKeys = Object.keys(WALK_SLOT_MAP);

  out.dungeonTopologyRows = rowNames("dungeon-topology");
  out.dungeonTopologiesArr = DUNGEON_TOPOLOGIES.slice();
  out.dwalkTopoSizeKeys = Object.keys(DWALK_TOPO_SIZE);
  out.dwalkTopologyMinSegsKeys = Object.keys(DWALK_TOPOLOGY_MIN_SEGS);
  out.dwalkGraphBuildersKeys = Object.keys(DWALK_GRAPH_BUILDERS);

  out.realmIds = REALM_IDS.slice();
  out.realmAdjacencyKeys = Object.keys(REALM_ADJACENCY);
  out.animalRealmSkinsKeys = Object.keys(ANIMAL_REALM_SKINS);

  out.walkArchetypesKeys = Object.keys(WALK_ARCHETYPES);
  out.wildernessEnemyCategoryRows = rowNames("wilderness-enemy-category");
  out.dungeonThreatIdentityT1Rows = rowNames("dungeon-threat-identity-t1");
  out.dungeonThreatIdentityT2Rows = rowNames("dungeon-threat-identity-t2");
  out.urbanThreatIdentityT1Rows = rowNames("urban-threat-identity-t1");
  out.urbanThreatIdentityT2Rows = rowNames("urban-threat-identity-t2");

  out.wildernessBiomesArr = WILDERNESS_BIOMES.slice();

  return JSON.stringify(out);
})();
`;

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="bindbar" style="display:none"></div>
       <input id="worldName" value="">
       <div id="stages"></div>
       <div id="worldView"></div>
       <div id="bardoView"></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  const program = read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src + "\n;\n" + PROBE_TAIL;
  const dataJson = win.eval(program);
  win.saveU = () => {};
  win.renderWorld = () => {};
  win.showTab = () => {};
  win.toast = () => {};
  win.fetch = () => Promise.resolve({ ok:false });
  return { win, data: JSON.parse(dataJson) };
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));
const info = (msg) => console.log("    (info)", msg);

const { win, data } = boot();

/* THE CORE ASSERTION this whole harness exists to mechanize: every name in `sourceNames` (a real
   compiled table's row names, or another hand-authored source-of-truth's own id list) must be a
   key of `mapObj`. Reports the missing set by name (never just a count) so a red run tells you
   exactly which row to go add, mirroring the ENV-2 fix's own "Added below, additively" pattern.
   Also reports (informational only, never fails) any map key that ISN'T a current source name —
   dead/stale vocabulary, harmless (never looked up by a live roll) but worth a note since it's
   often the fossil of the exact drift this guard exists to catch on the OTHER side. */
function assertTotalCoverage(label, sourceNames, mapKeys, sourceLabel){
  const keys = new Set(mapKeys || []);
  const missing = sourceNames.filter((n) => !keys.has(n));
  check(`${label}: total coverage of ${sourceLabel} (${sourceNames.length} rows)`,
    missing.length === 0, `missing: ${JSON.stringify(missing)}`);
  const sourceSet = new Set(sourceNames);
  const extra = (mapKeys || []).filter((k) => !sourceSet.has(k));
  if (extra.length) info(`${label}: ${extra.length} key(s) present with no matching ${sourceLabel} row today — ${JSON.stringify(extra)} (dead/stale, not a failure)`);
}

console.log("(1/8) known #1+#2 — theater-data.js's wilderness-biome-type mirrors (the ENV-2 precedent)");
assertTotalCoverage("THEATER_FLOOR_BIOME_MAP", data.wildernessBiomeRows, data.theaterFloorBiomeMapKeys, "wilderness-biome-type");
assertTotalCoverage("BIOME_DRESSING", data.wildernessBiomeRows, data.biomeDressingKeys, "wilderness-biome-type");

console.log("\n(2/8) known #3 — building-kits.js's BUILDING_KIT_REALM_LABELS (BUILDING_KITS' own keys)");
check("BUILDING_KIT_TYPES actually equals Object.keys(BUILDING_KITS) (sanity: the claimed source list is real, not a second hand-typed copy)",
  JSON.stringify([...data.buildingKitTypes].sort()) === JSON.stringify([...data.buildingKitsKeys].sort()),
  `types=${JSON.stringify(data.buildingKitTypes)} keys=${JSON.stringify(data.buildingKitsKeys)}`);
assertTotalCoverage("BUILDING_KIT_REALM_LABELS.chrome", data.buildingKitTypes, data.buildingKitRealmLabelsChromeKeys, "BUILDING_KIT_TYPES");
assertTotalCoverage("BUILDING_KIT_REALM_LABELS.gloom", data.buildingKitTypes, data.buildingKitRealmLabelsGloomKeys, "BUILDING_KIT_TYPES");

console.log("\n(3/8) NEW — src/world/urban.js's DISTRICT_TYPE_REALM_LABELS (urban-district-type; same law as #3, own comment cross-references it)");
assertTotalCoverage("DISTRICT_TYPE_REALM_LABELS.chrome", data.urbanDistrictTypeRows, data.districtTypeRealmLabelsChromeKeys, "urban-district-type");
assertTotalCoverage("DISTRICT_TYPE_REALM_LABELS.gloom", data.urbanDistrictTypeRows, data.districtTypeRealmLabelsGloomKeys, "urban-district-type");

console.log("\n(4/8) NEW — CR-slot composition maps (an unmapped Composition silently flattens to a single low-CR creature)");
assertTotalCoverage("DWALK_SLOT_MAP", data.dungeonEnemyCompositionRows, data.dwalkSlotMapKeys, "dungeon-enemy-composition");
assertTotalCoverage("WALK_SLOT_MAP", data.urbanEnemyCompositionRows, data.walkSlotMapKeys, "urban-enemy-composition");

console.log("\n(5/8) NEW — dungeon-walk.js's topology quartet (dungeon-topology → DUNGEON_TOPOLOGIES → {SIZE,MIN_SEGS,GRAPH_BUILDERS})");
// DUNGEON_TOPOLOGIES doubles as the VALIDATION ALLOWLIST at the roll site (dwalkResolveTopology's
// caller): a REAL roll not in this array gets DISCARDED and replaced with a RANDOM topology pick
// (see this file's header) — worse than a silent fallback, since the kept description text then
// narrates the wrong, substituted topology.
assertTotalCoverage("DUNGEON_TOPOLOGIES (array; doubles as the real-roll validation allowlist)",
  data.dungeonTopologyRows, data.dungeonTopologiesArr, "dungeon-topology");
// downstream of DUNGEON_TOPOLOGIES itself, not the raw table — dwalkResolveTopology only ever
// hands these maps a name already validated against DUNGEON_TOPOLOGIES, so that's each one's real
// direct source (an entry could be genuinely missing here even while the array above is total).
assertTotalCoverage("DWALK_TOPO_SIZE", data.dungeonTopologiesArr, data.dwalkTopoSizeKeys, "DUNGEON_TOPOLOGIES");
assertTotalCoverage("DWALK_TOPOLOGY_MIN_SEGS", data.dungeonTopologiesArr, data.dwalkTopologyMinSegsKeys, "DUNGEON_TOPOLOGIES");
assertTotalCoverage("DWALK_GRAPH_BUILDERS (CRASH-class — `DWALK_GRAPH_BUILDERS[resolved](segCount)` has NO fallback guard at its call site)",
  data.dungeonTopologiesArr, data.dwalkGraphBuildersKeys, "DUNGEON_TOPOLOGIES");

console.log("\n(6/8) NEW — realm-id-keyed mirrors (REALM_IDS, data/realms.js's 11-realm founding slate)");
check("REALM_IDS is the declared 11-realm founding slate (sanity)", Array.isArray(data.realmIds) && data.realmIds.length === 11, JSON.stringify(data.realmIds));
assertTotalCoverage("REALM_ADJACENCY", data.realmIds, data.realmAdjacencyKeys, "REALM_IDS");
assertTotalCoverage("ANIMAL_REALM_SKINS (own comment already claims \"all 11 present below\" — first mechanized check of that claim)", data.realmIds, data.animalRealmSkinsKeys, "REALM_IDS");

console.log("\n(7/8) documented best-effort #1 — walk-archetypes.js's WALK_ARCHETYPES (partial coverage is BY DESIGN — informational, not blocking)");
{
  const sources = [
    ["wilderness-enemy-category", data.wildernessEnemyCategoryRows],
    ["dungeon-threat-identity-t1", data.dungeonThreatIdentityT1Rows],
    ["dungeon-threat-identity-t2", data.dungeonThreatIdentityT2Rows],
    ["urban-threat-identity-t1", data.urbanThreatIdentityT1Rows],
    ["urban-threat-identity-t2", data.urbanThreatIdentityT2Rows],
  ];
  const keys = new Set(data.walkArchetypesKeys);
  for (const [id, names] of sources) {
    const covered = names.filter((n) => keys.has(n));
    info(`WALK_ARCHETYPES vs ${id}: ${covered.length}/${names.length} rows registered`);
  }
  // the DOCUMENTED DEFAULT must actually fire cleanly for a name guaranteed absent from
  // WALK_ARCHETYPES — asserting POOL MEMBERSHIP only, never a fixed draw (resolveArchetypePool's
  // own weighted pick calls Math.random internally); run several times to cross that branch.
  const authoredPoolStr = "Bandit / Thug / Cutthroat";
  const authoredPool = authoredPoolStr.split(/\s*\/\s*/).filter(Boolean);
  let allValid = true, sample = null;
  for (let i = 0; i < 8; i++) {
    const r = win.resolveArchetypePool("__NOT_A_REAL_ARCHETYPE__" + Math.random(), { tier: 1 }, authoredPoolStr);
    sample = r;
    if (typeof r !== "string" || !authoredPool.includes(r)) allValid = false;
  }
  check("resolveArchetypePool's documented fallback (\"an archetype absent from this registry falls back to authored-pool-only\") actually returns an authored-pool member for an unmapped archetype, 8/8 draws",
    allValid, `last sample: ${JSON.stringify(sample)}`);
}

console.log("\n(8/8) documented best-effort #2 — wild-walk.js's WILDERNESS_BIOMES (table-not-loaded emergency path only — informational, not blocking)");
{
  const stale = data.wildernessBiomesArr.filter((b) => !data.wildernessBiomeRows.includes(b));
  const missingFromFallback = data.wildernessBiomeRows.filter((b) => !data.wildernessBiomesArr.includes(b));
  if (stale.length) info(`WILDERNESS_BIOMES carries ${stale.length} name(s) the real wilderness-biome-type table no longer rolls — ${JSON.stringify(stale)} (same retired vocabulary the THEATER_FLOOR_BIOME_MAP fix comment names — harmless only because this array is the table-ABSENT emergency path, never the live lookup)`);
  if (missingFromFallback.length) info(`WILDERNESS_BIOMES is missing ${missingFromFallback.length} real biome(s) — ${JSON.stringify(missingFromFallback)} (if the compiled table is ever unavailable, this degraded roll can never produce them)`);

  // functional proof of wwalkBiome's OWN documented default: `if(!rows.length) return
  // {biome:walkRnd(WILDERNESS_BIOMES), biomeDesc:""}` must still return a usable shape when the
  // table reports zero rows. Stubs walkRows for exactly this call, restores it immediately after;
  // asserts shape only (never which name), run several times.
  const origWalkRows = win.walkRows;
  win.walkRows = () => [];
  let fallbackOk = true, fallbackSample = null;
  for (let i = 0; i < 5; i++) {
    const r = win.wwalkBiome();
    fallbackSample = r;
    if (!r || typeof r.biome !== "string" || !r.biome || r.biomeDesc !== "") fallbackOk = false;
  }
  win.walkRows = origWalkRows;
  check("wwalkBiome's \"table not loaded\" branch still returns a usable {biome,biomeDesc} shape, 5/5 draws",
    fallbackOk, `last sample: ${JSON.stringify(fallbackSample)}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
