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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
