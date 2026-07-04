/* Verify P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.3/§4/§7) — src/ui/theater-figures.js, the
   creatureId/class/prop/light -> builder registry that puts the whole-object figure/prop roster
   (dev/model-qa/creatures/, 73 modules / 77 exported builders) into the live theater renderer.
   PURE LAYER: theater-figures.js carries no bare "three" import (Node-importable directly, same
   discipline as dev/verify-model-parts.mjs for theater-parts.js) — every creature module it reaches
   IS reachable from Node too (probe-lib.js's own header: "the SAME module loads in the browser AND
   in Node"), so this harness needs no jsdom/browser stub for checks 1-3/6/8/9's own theater-data
   half. theater-boot.js's GL-side geometry/material factory (wholeObjectGeometryFor/
   wholeObjectMaterialsFor) is NOT exercised here — it's an ES-module boundary file excluded from
   this jsdom-free harness by design (CLAUDE.md; the PSX pixel-level parity + capture-gate checks
   4/5/10/11 are the browser-side gates for that half, dev/model-qa/capture.mjs conventions).

   RED-FIRST CHECKS (per the spec's build-ladder note — each was run red before/without the code and
   the failing output captured; see the orchestrator report for the red-output transcript):
     1. Registry integrity — every bestiary-keyed WHOLE_OBJECT_REGISTRY entry and every NEAREST_SUB
        value resolves to a real data/bestiary.js id and a real exported builder function.
        Completeness asserts against the REAL 77 exported builders (R3), not the informal "82."
     2. Builder contract — per entry: resetGeom(); build(); getBuffers() yields POS.length%9===0,
        POS.length===COL.length, CHAN.length===POS.length/9, tri count in [120,2600], bbox
        min.y in [-0.01,0.08], every CHAN byte < CHANNEL_KEYS.length.
     3. Resolution chain — resolveWholeObject: exact hit -> NEAREST_SUB (one hop) -> null, all three
        paths asserted.
     9. theaterUnitsFrom stamps lowercased `className` on pc/ally units; foes carry none; an absent
        class -> null (never throws).
   Also (non-RED-FIRST, still asserted every run):
     - manifest/genesis.html wiring: ui.theater-figures registered, its <script type="module"> tag
       exists before theater-boot's own tag.
   MUTATION-TEST REGRESSION (§7.1, all shown RED then restored — see M1/M2/M3 below; M4/M5 are
   browser-side, proven in the capture-gate transcript):
     M1 — registry entry removed ("wolf" deleted in-memory) -> resolveWholeObject("wolf") is null.
     M2 — a broken module entry (fn -> non-existent export) -> loadWholeObjectBuilders settles
          without rejecting; that entry stays unresolved; every OTHER entry still loads.
     M3 — verify-model-grammar's own override mutation (re-run here as a coherence check that this
          unit didn't touch the underlying recipe/override seam).

   Run:  node dev/verify-theater-figures.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const FIGURES_URL = pathToFileURL(join(ROOT, "src/ui/theater-figures.js")).href;

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const Figures = await import(FIGURES_URL);
const { WHOLE_OBJECT_REGISTRY, NEAREST_SUB, resolveWholeObject, loadWholeObjectBuilders } = Figures;

// ============================================================================
// ground truth: the real bestiary ids + the real 77 exported builders (R3 reconciliation)
// ============================================================================
const bestiaryText = read("data/bestiary.js");
const BESTIARY_IDS = new Set([...bestiaryText.matchAll(/"id": "([^"]+)"/g)].map(m => m[1]));

const CREATURES_DIR = join(ROOT, "dev/model-qa/creatures");
const { readdirSync } = await import("node:fs");
const creatureFiles = readdirSync(CREATURES_DIR).filter(f => f.endsWith(".js"));
let REAL_BUILDER_COUNT = 0;
for(const f of creatureFiles){
  const src = readFileSync(join(CREATURES_DIR, f), "utf-8");
  REAL_BUILDER_COUNT += (src.match(/export function build[A-Za-z]+/g) || []).length;
}

console.log("=== ground truth ===");
check("data/bestiary.js has 510 ids (ground truth for registry-integrity checks)", BESTIARY_IDS.size === 510, BESTIARY_IDS.size);
check("dev/model-qa/creatures/ has 73 module files", creatureFiles.length === 73, creatureFiles.length);
console.log("  (i) real exported builder count (R3 reconciliation vs the informal \"82\" INDEX.md accounting):", REAL_BUILDER_COUNT);
check("R3: registry-completeness ground truth is the REAL exported builder count (77), not a phantom 82",
  REAL_BUILDER_COUNT === 77, REAL_BUILDER_COUNT);

// ============================================================================
// 1. [RED-FIRST] Registry integrity
// ============================================================================
console.log("\n=== 1. [RED-FIRST] registry integrity ===");
{
  const bestiaryKeyed = Object.keys(WHOLE_OBJECT_REGISTRY).filter(k =>
    !k.startsWith("class:") && !k.startsWith("prop:") && !k.startsWith("light:"));
  check("at least one bestiary-keyed registry entry exists (red on the empty table before authoring)",
    bestiaryKeyed.length > 0, bestiaryKeyed.length);
  const badBestiaryKeys = bestiaryKeyed.filter(k => !BESTIARY_IDS.has(k));
  check("every bestiary-keyed registry entry is a REAL data/bestiary.js id",
    badBestiaryKeys.length === 0, JSON.stringify(badBestiaryKeys));

  const classKeyed = Object.keys(WHOLE_OBJECT_REGISTRY).filter(k => k.startsWith("class:"));
  const CLASSES_12 = ["fighter","barbarian","paladin","ranger","rogue","monk","cleric","druid","wizard","sorcerer","warlock","bard"];
  check("all 12 SRD base classes have a class: registry entry",
    CLASSES_12.every(c => classKeyed.includes("class:" + c)),
    JSON.stringify(CLASSES_12.filter(c => !classKeyed.includes("class:" + c))));

  const badSubValues = Object.entries(NEAREST_SUB).filter(([k, v]) => !WHOLE_OBJECT_REGISTRY[v]);
  check("every NEAREST_SUB value resolves to a REAL registry key",
    badSubValues.length === 0, JSON.stringify(badSubValues));
  const badSubKeys = Object.keys(NEAREST_SUB).filter(k => !BESTIARY_IDS.has(k));
  check("every NEAREST_SUB key is itself a REAL bestiary id (an alias FROM a real creature)",
    badSubKeys.length === 0, JSON.stringify(badSubKeys));
  const overlap = Object.keys(NEAREST_SUB).filter(k => WHOLE_OBJECT_REGISTRY[k]);
  check("no NEAREST_SUB key duplicates a direct registry entry (would be dead/confusing aliasing)",
    overlap.length === 0, JSON.stringify(overlap));
}

// ============================================================================
// builder loading (needed by checks 2/3/6/8) — every registry module's real export resolved
// ============================================================================
await new Promise((resolve) => loadWholeObjectBuilders(resolve));
const unresolvedAfterLoad = Object.entries(WHOLE_OBJECT_REGISTRY).filter(([k, e]) => typeof e.build !== "function");
check("every registered entry resolves a real callable builder after loadWholeObjectBuilders settles",
  unresolvedAfterLoad.length === 0, JSON.stringify(unresolvedAfterLoad.map(([k]) => k)));

// ============================================================================
// 2. [RED-FIRST] Builder contract (per entry)
// ============================================================================
console.log("\n=== 2. [RED-FIRST] builder contract (resetGeom/build/getBuffers per entry) ===");
{
  const probeLib = await import(pathToFileURL(join(ROOT, "dev/model-qa/probe-lib.js")).href);
  check("probe-lib.js exports a CHAN-carrying getBuffers (red until the CHAN buffer unit landed)",
    typeof probeLib.resetGeom === "function" && typeof probeLib.getBuffers === "function", "");

  let shapeOk = true, triCountOk = true, chanOk = true;
  let shapeBad = "", triCountBad = "", chanBad = "";
  const bboxViolations = [];
  const seenKeys = new Set();
  let checkedCount = 0;
  for(const [key, entry] of Object.entries(WHOLE_OBJECT_REGISTRY)){
    if(typeof entry.build !== "function") continue; // already flagged above
    // dedupe by (module,fn) so a shared-module entry (prop-pillar.js's 2 exports, prop-light.js's 3)
    // isn't asserted 3x redundantly against the SAME geometry a sibling key already checked — still
    // covers every DISTINCT builder function at least once.
    const dedupeKey = entry.module + "#" + entry.fn;
    if(seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);
    checkedCount++;

    probeLib.resetGeom();
    try { entry.build(); } catch(e){ shapeOk = false; shapeBad += key + " threw: " + e.message + "; "; continue; }
    const { POS, COL, CHAN } = probeLib.getBuffers();
    const triCount = POS.length / 9;
    const okShape = POS.length % 9 === 0 && POS.length === COL.length && CHAN.length === triCount;
    if(!okShape){ shapeOk = false; shapeBad += key + " shape mismatch: POS=" + POS.length + " COL=" + COL.length + " CHAN=" + CHAN.length + "; "; }
    const okTriCount = triCount >= 120 && triCount <= 2600;
    if(!okTriCount){ triCountOk = false; triCountBad += key + " tri count " + triCount + "; "; }
    let minY = Infinity;
    for(let i = 1; i < POS.length; i += 3){ if(POS[i] < minY) minY = POS[i]; }
    // Spec §7 check 2's literal bound is [-0.01, 0.08]. GROUND TRUTH DEVIATION (flagged for the
    // director's ledger, CLAUDE.md "read the actual files before claiming a gap"): 10 of the 77 real
    // shipped/QA'd builders sink their lowest vertex slightly below -0.01 (a foot/paw/claw wedge
    // resting a hair under the nominal ground plane — imperceptible at render scale, and these are
    // the SAME modules dev/model-qa/sheets/INDEX.md already certifies "82 total pieces; every one
    // passed QA"). The check below asserts the LITERAL spec bound (never silently loosened) and
    // reports every violation by name rather than short-circuiting on the first, so the true scope of
    // the gap is visible rather than papered over.
    const okBBoxY = minY >= -0.01 && minY <= 0.08;
    if(!okBBoxY) bboxViolations.push(key + " minY=" + minY.toFixed(5));
    const okChan = Array.from(CHAN).every(b => b < 12); // CHANNEL_KEYS.length in probe-lib.js
    if(!okChan){ chanOk = false; chanBad += key + " a CHAN byte >= CHANNEL_KEYS.length; "; }
  }
  check("every distinct builder (" + checkedCount + " checked) has a well-formed buffer shape (POS%9===0, POS.length===COL.length, CHAN.length===triCount)",
    shapeOk, shapeBad);
  check("every distinct builder's tri count is in [120,2600]", triCountOk, triCountBad);
  check("every distinct builder's bbox min.y is in the spec's literal [-0.01,0.08] (SEE DEVIATION NOTE below if red)",
    bboxViolations.length === 0, bboxViolations.length + " of " + checkedCount + " violate: " + bboxViolations.join(", "));
  check("every distinct builder's CHAN bytes are all < CHANNEL_KEYS.length", chanOk, chanBad);
}

// ============================================================================
// 3. [RED-FIRST] Resolution chain
// ============================================================================
console.log("\n=== 3. [RED-FIRST] resolution chain (exact -> NEAREST_SUB -> null) ===");
{
  check("exact hit: resolveWholeObject(\"wolf\") resolves the direct registry entry",
    resolveWholeObject("wolf") === WHOLE_OBJECT_REGISTRY["wolf"], "");
  const subKey = Object.keys(NEAREST_SUB)[0];
  const subTarget = NEAREST_SUB[subKey];
  check("NEAREST_SUB hop: resolveWholeObject(\"" + subKey + "\") resolves through to \"" + subTarget + "\"'s entry",
    resolveWholeObject(subKey) === WHOLE_OBJECT_REGISTRY[subTarget], "");
  check("null path: an unknown key resolves to null (never throws)",
    resolveWholeObject("definitely-not-a-real-creature-slug") === null, "");
  check("null path: a falsy key resolves to null (never throws)",
    resolveWholeObject(null) === null && resolveWholeObject(undefined) === null && resolveWholeObject("") === null, "");
}

// ============================================================================
// 4. PSX parity (byte-level) — the shared tunables theater-boot.js and ps1-sheet.html both carry
// ============================================================================
console.log("\n=== 4. PSX parity (byte-level, text-scan) ===");
{
  const bootSrc = read("src/ui/theater-boot.js");
  const sheetSrc = read("dev/model-qa/ps1-sheet.html");
  const bootDither = bootSrc.match(/PSX_DITHER_AMPLITUDE\s*=\s*([\d.]+)/);
  const sheetDither = sheetSrc.match(/PSX_DITHER_AMPLITUDE\s*=\s*([\d.]+)/);
  check("PSX_DITHER_AMPLITUDE identical (engine vs sheet)", bootDither && sheetDither && bootDither[1] === sheetDither[1],
    JSON.stringify([bootDither && bootDither[1], sheetDither && sheetDither[1]]));
  const bootSnap = bootSrc.match(/PSX_VERTEX_SNAP_GRID\s*=\s*(\d+)/);
  const sheetSnap = sheetSrc.match(/PSX_VERTEX_SNAP_GRID\s*=\s*(\d+)/);
  check("PSX_VERTEX_SNAP_GRID identical (engine vs sheet)", bootSnap && sheetSnap && bootSnap[1] === sheetSnap[1],
    JSON.stringify([bootSnap && bootSnap[1], sheetSnap && sheetSnap[1]]));
  check("engine's default PSX_RES_SCALE is the literal 1/3 (matches the sheet's unqueried default)",
    /const PSX_RES_SCALE = 1 \/ 3;/.test(bootSrc), "");
  check("engine's wholeObjectMaterialsFor carries the SAME Phong pairs as ps1-sheet's figureScene (46/0x8a8f94 metal, 95/0xbfdbe8 glass)",
    /shininess:\s*46,\s*specular:\s*0x8a8f94/.test(bootSrc) && /shininess:\s*95,\s*specular:\s*0xbfdbe8/.test(bootSrc), "");
}

// ============================================================================
// wiring: manifest.json + genesis.html script-tag order
// ============================================================================
console.log("\n=== wiring: manifest.json + genesis.html ===");
{
  const manifest = JSON.parse(read("manifest.json"));
  const entry = manifest.modules.find(m => m.id === "ui.theater-figures");
  check("manifest.json registers ui.theater-figures", !!entry, "");
  check("ui.theater-figures is type:\"module\"", entry && entry.type === "module", entry && entry.type);
  check("ui.theater-figures path matches src/ui/theater-figures.js", entry && entry.path === "src/ui/theater-figures.js", entry && entry.path);

  const html = read("genesis.html");
  const figuresTagIdx = html.indexOf('<script type="module" src="src/ui/theater-figures.js">');
  const bootTagIdx = html.indexOf('<script type="module" src="src/ui/theater-boot.js">');
  check("genesis.html has the theater-figures.js module script tag", figuresTagIdx >= 0, figuresTagIdx);
  check("theater-figures.js's tag loads BEFORE theater-boot.js's own tag (§4 step 2)",
    figuresTagIdx >= 0 && bootTagIdx >= 0 && figuresTagIdx < bootTagIdx,
    "figures@" + figuresTagIdx + " boot@" + bootTagIdx);
}

// ============================================================================
// 9. [RED-FIRST] theater-data.js className stamp
// ============================================================================
console.log("\n=== 9. [RED-FIRST] theater-data.js className stamp ===");
{
  const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
  const { createRequire } = await import("node:module");
  const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
  const manifest = JSON.parse(read("manifest.json"));
  const moduleTypedPaths = new Set(manifest.modules.filter(m => m.type === "module").map(m => m.path));
  const moduleSrc = manifest.loadOrder
    .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
    .map(read).join("\n;\n");
  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + read("tables.js") + "\n;\n" + moduleSrc);

  const combatPc = {
    pc: { band: "melee", lane: "C" },
    pcRef: { class: "Wizard", creatureType: "humanoid" },
    allies: [{ id: "ally1", class: "Cleric", band: "near", lane: "L", creatureType: "humanoid" }],
    foes: [{ fid: "f1", band: "melee", lane: "R", statId: "wolf", name: "Wolf" }]
  };
  const result = win.theaterUnitsFrom(combatPc);
  const pcUnit = result.units.find(u => u.kind === "pc");
  const allyUnit = result.units.find(u => u.kind === "ally");
  const foeUnit = result.units.find(u => u.kind === "foe");
  check("pc unit carries lowercased className (\"Wizard\" -> \"wizard\")", pcUnit && pcUnit.className === "wizard", pcUnit && pcUnit.className);
  check("ally unit carries lowercased className (\"Cleric\" -> \"cleric\")", allyUnit && allyUnit.className === "cleric", allyUnit && allyUnit.className);
  check("foe unit carries NO className field (undefined)", foeUnit && foeUnit.className === undefined, foeUnit && foeUnit.className);

  const combatNoClass = { pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" } };
  const result2 = win.theaterUnitsFrom(combatNoClass);
  const pcUnit2 = result2.units.find(u => u.kind === "pc");
  check("an absent pcRef.class -> className is null (never throws)", pcUnit2 && pcUnit2.className === null, pcUnit2 && pcUnit2.className);
}

// ============================================================================
// §7.1 mutation-test regression checks (M1-M3; M4/M5 are browser-side, see the capture-gate transcript)
// ============================================================================
console.log("\n=== §7.1 mutations ===");
{
  // M1 — registry entry removed (in-memory delete) -> null -> fall-through (theater-boot's own
  // cuboid chain is the thing that "still renders" — this harness only proves the RESOLUTION side).
  const savedWolf = WHOLE_OBJECT_REGISTRY.wolf;
  delete WHOLE_OBJECT_REGISTRY.wolf;
  const redNull = resolveWholeObject("wolf");
  check("M1 RED: wolf entry deleted -> resolveWholeObject(\"wolf\") is null", redNull === null, redNull);
  WHOLE_OBJECT_REGISTRY.wolf = savedWolf;
  check("M1 GREEN (restored): resolveWholeObject(\"wolf\") resolves again", resolveWholeObject("wolf") === savedWolf, "");

  // M2 — a broken module entry (fn -> a non-existent export name) -> loadWholeObjectBuilders settles
  // without rejecting; that entry stays unresolved; every OTHER entry still loads.
  const savedFn = WHOLE_OBJECT_REGISTRY.wolf.fn;
  WHOLE_OBJECT_REGISTRY.wolf.fn = "buildTotallyNotARealExport";
  delete WHOLE_OBJECT_REGISTRY.wolf.build;
  let settledOk = false, rejected = false;
  await new Promise((resolve) => {
    loadWholeObjectBuilders(() => { settledOk = true; resolve(); });
  }).catch(() => { rejected = true; });
  check("M2 RED: a broken fn name settles without rejecting the batch", settledOk && !rejected, JSON.stringify({ settledOk, rejected }));
  check("M2 RED: the broken entry itself stays unresolved (no build fn)", typeof WHOLE_OBJECT_REGISTRY.wolf.build !== "function", "");
  check("M2 RED: every OTHER entry still loaded a real builder",
    typeof WHOLE_OBJECT_REGISTRY["hill-giant"].build === "function",
    typeof WHOLE_OBJECT_REGISTRY["hill-giant"].build);
  WHOLE_OBJECT_REGISTRY.wolf.fn = savedFn;
  delete WHOLE_OBJECT_REGISTRY.wolf.build;
  await new Promise((resolve) => loadWholeObjectBuilders(resolve));
  check("M2 GREEN (restored): wolf resolves a real builder again", typeof WHOLE_OBJECT_REGISTRY.wolf.build === "function", "");
}

// M3 — re-run verify-model-grammar's own override mutation as a coherence check (this unit must not
// have disturbed the cuboid-recipe chain underneath P1'). Delegated to that harness's own process
// (kept as its own file per its unit's ownership) — noted here, run for real in §7 check 7's sweep.
console.log("\n  (i) M3 (override-seam mutation) is verify-model-grammar.mjs's own mutation test — run in the §7 check 7 sweep, not duplicated here.");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
