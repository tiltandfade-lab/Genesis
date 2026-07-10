/* Verify PLACE-GEN ADDENDUM §7 unit 8 (Archetype -> dressing map) — build/gen-place-skins.py
   -> data/place-skins.js: SCENE_DRESSING_BY_ARCHETYPE, SCENE_DRESSING_DEFAULT, SURFACE_TAG_BASES,
   sceneDressingForPlace(realmId, archetypeKey).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-place-skins.mjs). The
   dressing consts are top-level `const` in data/place-skins.js — a lexical binding, never a
   `window` property even under jsdom's runScripts:"dangerously" — so this file appends same-scope
   accessor FUNCTION declarations (those DO attach to window) rather than reading the consts
   directly off `win`.

   Covers the task brief:
     (a) all 24 spine keys resolve a dressing object with defined surface+light and a props array
         (no undefined anywhere) — swept across all 3 authored realms.
     (b) Watering-hole (key 2) in frontier resolves >= 2 named props from the frontier pool.
     (c) missing-name discipline: a fixture propName that matches nothing is skipped silently (the
         array is shorter, never a hole/throw).
     (d) regen determinism: running the generator twice produces a byte-identical data/place-skins.js.
     (e) mutation: stub realmPropsFor to always return [] -> (b) goes red, (a) still passes (props
         array is empty but the shape — surface+light defined, props:[] — never holes).

   RED-FIRST (b): sceneDressingForPlace does not exist on the unmodified pre-unit-8 tree, so this
   check is captured failing against a stash of the pre-generator state before the unit landed, then
   again green after. See the task report for both console tails.

   Run:  node dev/verify-place-dressing.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

function boot(sourceText) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + sourceText
    + "\nfunction __dressingByArchetype(){return SCENE_DRESSING_BY_ARCHETYPE;}"
    + "\nfunction __dressingDefault(){return SCENE_DRESSING_DEFAULT;}"
    + "\nfunction __surfaceTagBases(){return SURFACE_TAG_BASES;}"
    + "\nfunction __placeSpine(){return PLACE_SPINE;}"
    + "\nfunction __realmIds(){return REALM_IDS;}"
    + "\nfunction __sceneDressingForPlace(realmId, key){return sceneDressingForPlace(realmId, key);}"
    + "\nfunction __stubEmptyProps(){ realmPropsFor = function(){ return []; }; }"
    + "\nfunction __ghostNameProbe(realmId, key){"
    + "  var orig = SCENE_DRESSING_BY_ARCHETYPE[String(key)];"
    + "  var clean = sceneDressingForPlace(realmId, key);"
    + "  SCENE_DRESSING_BY_ARCHETYPE[String(key)] = Object.assign({}, orig,"
    + "    {propNames: orig.propNames.concat(['Definitely Not A Real Prop Name'])});"
    + "  var ghosted = sceneDressingForPlace(realmId, key);"
    + "  SCENE_DRESSING_BY_ARCHETYPE[String(key)] = orig;"
    + "  return {clean: clean, ghosted: ghosted};"
    + "}");
  return win;
}

let win = boot(src);
const DRESSING = win.__dressingByArchetype();
const SPINE = win.__placeSpine();
const REALM_IDS = win.__realmIds();
const AUTHORED_REALMS = ["frontier", "chrome", "gloom"];

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

console.log("PLACE-DRESSING verify (ADDENDUM §7 unit 8)\n");

// (a) all 24 spine keys resolve a defined dressing shape in every authored realm.
console.log("(a) all 24 spine keys resolve {props[],surface,light} with no undefined, x3 realms");
let allDefined = true, badDetail = "";
for (const realmId of AUTHORED_REALMS) {
  for (const row of SPINE) {
    const d = win.__sceneDressingForPlace(realmId, row.key);
    const ok = d && Array.isArray(d.props) && d.surface !== undefined && d.light !== undefined
      && d.surface !== null && typeof d.light === "string" && d.light.length > 0;
    if (!ok) { allDefined = false; badDetail = `${realmId}/key ${row.key}: ${JSON.stringify(d)}`; break; }
  }
  if (!allDefined) break;
}
check("all 24 keys x 3 realms resolve a fully-defined dressing object", allDefined, badDetail);

// (b) Watering-hole (key 2) in frontier resolves >= 2 named props.
console.log("\n(b) Watering-hole (key 2) in frontier resolves >= 2 named props");
const wateringHole = win.__sceneDressingForPlace("frontier", 2);
check("frontier Watering-hole props.length >= 2", wateringHole.props.length >= 2,
  `got ${wateringHole.props.length}: ${JSON.stringify(wateringHole.props.map((p) => p.name))}`);
check("every resolved prop carries a real name+model (came from realmPropsFor, not invented)",
  wateringHole.props.every((p) => typeof p.name === "string" && typeof p.model === "string"),
  JSON.stringify(wateringHole.props));

// (c) missing-name discipline: an unmatched propName is skipped, not a hole/throw.
console.log("\n(c) a propName with no pool match is skipped silently (array shorter, never a hole)");
const ghostProbe = win.__ghostNameProbe("frontier", 2);
check("a fixture 'Definitely Not A Real Prop Name' resolves to no crash and no null entry",
  ghostProbe.ghosted.props.every((p) => p != null) &&
  !ghostProbe.ghosted.props.some((p) => p.name === "Definitely Not A Real Prop Name"),
  JSON.stringify(ghostProbe.ghosted.props.map((p) => p && p.name)));
check("resolved count == real names only (ghost name silently dropped, not counted)",
  ghostProbe.ghosted.props.length === ghostProbe.clean.props.length,
  `ghost-run ${ghostProbe.ghosted.props.length} vs clean-run ${ghostProbe.clean.props.length}`);

// (d) regen determinism: running the generator twice is byte-identical.
console.log("\n(d) regen determinism — running gen-place-skins.py twice is byte-identical");
import { execFileSync } from "node:child_process";
const before = read("data/place-skins.js");
execFileSync("python3", ["build/gen-place-skins.py"], { cwd: ROOT });
const after1 = read("data/place-skins.js");
execFileSync("python3", ["build/gen-place-skins.py"], { cwd: ROOT });
const after2 = read("data/place-skins.js");
check("re-running the generator does not change output vs. the committed artifact", before === after1,
  "diff vs committed artifact (unexpected — generator should be pure)");
check("two consecutive regens are byte-identical", after1 === after2, "generator is non-deterministic");

// (e) mutation: stub realmPropsFor to [] -> (b) fails, (a) still passes (never a hole).
console.log("\n(e) MUTATION — stub realmPropsFor() to always return [] (proves (b) is a real check)");
let win3 = boot(src);
win3.__stubEmptyProps();
const mutatedWateringHole = win3.__sceneDressingForPlace("frontier", 2);
check("MUTATION: with an empty prop pool, Watering-hole resolves 0 props (>= 2 check would now fail)",
  mutatedWateringHole.props.length === 0,
  `expected 0, got ${mutatedWateringHole.props.length} — (b)'s assertion is not exercising the real code path`);
let mutatedAllDefined = true;
for (const row of SPINE) {
  const d = win3.__sceneDressingForPlace("frontier", row.key);
  if (!(d && Array.isArray(d.props) && d.surface !== undefined && d.light !== undefined)) { mutatedAllDefined = false; break; }
}
check("MUTATION: (a)'s shape guarantee still holds even with an empty prop pool (never a hole)",
  mutatedAllDefined, "a stubbed-empty prop pool broke the always-defined shape contract");

// (f) PLACE-PARTS-WAVE Wave A — the P1 anchor props are row-wired and registry-live (THE WIRING
// LAW: these checks drive the production sceneDressingForPlace path, never a hand-fed prop key).
// RED-FIRST: proven failing on the pre-wiring tree (all 7 red), green after the wiring commit.
console.log("\n(f) PLACE-PARTS-WAVE Wave A anchors — row-wired + registry-live");
// WHOLE_OBJECT_REGISTRY lives in an ES-module boundary file (src/ui/theater-figures.js, NOT in the
// classic loadOrder this harness evals) — so registry-liveness is checked by parsing the registry
// keys out of the file text, the same discipline build/gen-realm-props.py's real_part_names() uses.
const registryTxt = read("src/ui/theater-figures.js");
const REGISTRY_KEYS = new Set([...registryTxt.matchAll(/"((?:prop|light|class):[a-z0-9-]+)"\s*:\s*\{/g)].map((m) => m[1]));
const registryHas = (k) => REGISTRY_KEYS.has(k);
const modelsAt = (realmId, key) =>
  win.__sceneDressingForPlace(realmId, key).props.map((p) => p.model).filter(Boolean);
check("f1. frontier Watering-hole (2) carries prop:counter-run (the Long Bar repoint off table-slab)",
  modelsAt("frontier", 2).includes("prop:counter-run"), JSON.stringify(modelsAt("frontier", 2)));
check("f2. frontier Market (3) carries prop:stall-frame + prop:shop-counter",
  modelsAt("frontier", 3).includes("prop:stall-frame") && modelsAt("frontier", 3).includes("prop:shop-counter"),
  JSON.stringify(modelsAt("frontier", 3)));
check("f3. frontier Hall-of-law (5) carries prop:judge-bench + prop:cell-bars",
  modelsAt("frontier", 5).includes("prop:judge-bench") && modelsAt("frontier", 5).includes("prop:cell-bars"),
  JSON.stringify(modelsAt("frontier", 5)));
check("f4. frontier Threshold (13) carries prop:gate-checkpoint (a controlled crossing, not scenery)",
  modelsAt("frontier", 13).includes("prop:gate-checkpoint"), JSON.stringify(modelsAt("frontier", 13)));
check("f5. gloom Works (21) carries prop:standpipe (the named-ADD anchor, Blood-Slick-Altar precedent)",
  modelsAt("gloom", 21).includes("prop:standpipe"), JSON.stringify(modelsAt("gloom", 21)));
let unregistered = [];
for (const realmId of AUTHORED_REALMS) for (const row of SPINE) {
  for (const m of modelsAt(realmId, row.key)) {
    if (m.startsWith("prop:") && !registryHas(m)) unregistered.push(`${realmId}/${row.key}:${m}`);
  }
}
check("f6. every prop: model the dressing map emits (24 keys x 3 realms) is registry-live", unregistered.length === 0,
  JSON.stringify(unregistered));
check("f7. prop:doorframe is registry-live (rim-exit consumer pending — registry entry must exist now)",
  registryHas("prop:doorframe"), "prop:doorframe missing from WHOLE_OBJECT_REGISTRY");

// (g) PLACE-PARTS-WAVE Wave B — the P2 pieces are row-wired + registry-live (same discipline as
// (f); RED-FIRST: proven failing on the pre-wiring tree, green after the Wave B wiring commit).
console.log("\n(g) PLACE-PARTS-WAVE Wave B pieces — row-wired + registry-live");
check("g1. frontier Workshop (9) carries prop:forge-hearth (the craft anchor)",
  modelsAt("frontier", 9).includes("prop:forge-hearth"), JSON.stringify(modelsAt("frontier", 9)));
check("g2. frontier Storehouse (10) carries prop:stock-rack",
  modelsAt("frontier", 10).includes("prop:stock-rack"), JSON.stringify(modelsAt("frontier", 10)));
check("g3. frontier Commons (22) carries prop:bandstand (the town-green centerpiece)",
  modelsAt("frontier", 22).includes("prop:bandstand"), JSON.stringify(modelsAt("frontier", 22)));
check("g4. frontier Works (21) carries prop:mill-wheel; chrome Works carries prop:power-junction (realm variants)",
  modelsAt("frontier", 21).includes("prop:mill-wheel") && modelsAt("chrome", 21).includes("prop:power-junction"),
  JSON.stringify({ frontier: modelsAt("frontier", 21), chrome: modelsAt("chrome", 21) }));
check("g5. frontier Wild-margin (20) carries prop:rail-fence; chrome carries prop:chainlink-fence (turf grammar)",
  modelsAt("frontier", 20).includes("prop:rail-fence") && modelsAt("chrome", 20).includes("prop:chainlink-fence"),
  JSON.stringify({ frontier: modelsAt("frontier", 20), chrome: modelsAt("chrome", 20) }));
check("g6. chrome Threshold (13) carries prop:turnstile-bank (the subway-platform reskin)",
  modelsAt("chrome", 13).includes("prop:turnstile-bank"), JSON.stringify(modelsAt("chrome", 13)));

// (h) PLACE-PARTS-WAVE Wave C — the P3 pieces (RED-FIRST: proven failing pre-wiring, green after).
// The careening frame gets a registry-liveness check only — High-Seas has no authored skin/rows yet
// (PLACE-ASSET-QUEUE Part 1c: its row lands with the high-seas skin backfill).
console.log("\n(h) PLACE-PARTS-WAVE Wave C pieces");
check("h1. frontier Shrine (6) carries prop:pew-row (the ambient worship row)",
  modelsAt("frontier", 6).includes("prop:pew-row"), JSON.stringify(modelsAt("frontier", 6)));
check("h2. frontier Storehouse (10) carries prop:loading-dock",
  modelsAt("frontier", 10).includes("prop:loading-dock"), JSON.stringify(modelsAt("frontier", 10)));
check("h3. prop:careening-frame is registry-live (row lands with the high-seas skin backfill)",
  registryHas("prop:careening-frame"), "prop:careening-frame missing from WHOLE_OBJECT_REGISTRY");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
