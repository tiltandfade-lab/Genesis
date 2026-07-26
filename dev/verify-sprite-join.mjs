/* Verify VQ2-RESPEC.md S4 Part A (ledger P0 #1, "Giant Rat renders as a robed humanoid") — the
   miscast-join fix in src/ui/theater-boot.js's spriteEntryFor: a TIER 1 exact-match lookup against
   the generator-built SPRITE_BY_BESTIARY_ID index (build/gen-sprite-registry.py's S4 Part A),
   falling back to the pre-S4 TIER 2 normalized-display-name linear scan only on a TIER 1 miss.

   Same process-isolation discipline as dev/verify-theater-sprites.mjs (see that file's own header
   for the full "why a fresh Node subprocess per scenario" rationale — theater-boot.js kicks off an
   async loadWholeObjectBuilders() sweep at module-import time whose completion callback reads the
   bare global `window` later; two instances sharing one process race that callback against a
   reassigned global). This harness borrows that file's three.js/jsdom vendor shims verbatim (same
   bootstrap functions) since spriteEntryFor's own logic needs neither THREE nor the DOM, but
   *importing* theater-boot.js at all still runs the whole module body, including the `three` import.

   Checks:
     a. COLLISION FIXTURE — two bestiary ids that normalize to the SAME key ("giant-rat" and
        "giantrat" both -> "giantrat" under normalizeSpriteKey) each resolve to THEIR OWN registry
        slug via SPRITE_BY_BESTIARY_ID's exact-key map, not whichever entry the linear name-scan
        happens to hit first.
     b. RED-FIRST for (a): with TIER 1 stubbed out (forcing straight to the TIER 2 name scan), the
        SAME collision fixture is proven to resolve BOTH ids to the identical (first-in-registry-
        order) slug — the exact wrong-identity bug class ledger P0 #1 names — before the real,
        unmutated file is proven to resolve them correctly in a separate scenario.
     c. PRODUCTION — against the REAL data/sprite-registry.js (not a fixture): the Giant Rat
        bestiary id ("giant-rat") resolves to slug "spr-fantasy-giant-rat", a `kind:"monster"`
        entry — not any humanoid-kind entry (the historical miscast).
     d. TIER 2 still resolves a same-name entry that has NO id-map hit (an id map miss falls
        through to the old scan, never a broken lookup) — and the fallback counter increments only
        on that path.
     e. An id the map points at whose entry is NOT `status:"cut"` (or is `verdict:"fail"`) falls
        through to TIER 2 as a real miss, exactly like every other resolution tier in this file.
     f. CR-1 item 4 — the TIER 2 console.warn de-dupe: a slug that repeatedly falls through to
        TIER 2 within the same session climbs SPRITE_JOIN_NAME_FALLBACK_COUNT on every hit, but
        console.warn only fires (and the warned-Set only grows) on the FIRST hit for that slug.
     g. CR-1 item 2 — the SPRITE_BY_BESTIARY_ID collision tie-break, driven DIRECTLY against
        build/gen-sprite-registry.py's build_bestiary_id_map (not through theater-boot.js at
        all): a synthetic multi-way collision proves the qaStatus-candidate > verdict-pass >
        alphabetical-last-resort preference order, including the within-tier alphabetical
        tie-break when two entries share the same winning tier.

   Run:  node dev/verify-sprite-join.mjs   (jsdom + real vendored three.js, per-env in
         ~/.genesis-jsdom — see CLAUDE.md; also needs node_modules/three + node_modules/jsdom shims
         at the repo root, created by this script if absent — same bootstrap as
         dev/verify-theater-sprites.mjs). */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// Bootstrap shims — identical to dev/verify-theater-sprites.mjs's own (kept in sync by hand; both
// units need the same three/jsdom vendor re-export surface to import theater-boot.js under Node).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "cp1-env-ao"; // visual-correction Checkpoint 1: +GTAOPass (+GTAOShader/PoissonDenoiseShader/SimplexNoise re-exports; lockstep across all shim writers sharing node_modules/three)
  const versionFile = join(base, ".shim-version");
  if(existsSync(join(base, "package.json")) && existsSync(versionFile) && readFileSync(versionFile, "utf-8").trim() === shimVersion) return;
  mkdirSync(loaderDir, { recursive: true });
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(base, "package.json"),
    JSON.stringify({ name: "three", version: "0.0.0-vendor-shim", type: "module", main: "./three.module.js" }, null, 2));
  writeFileSync(join(base, "three.module.js"), `export * from "../../vendor/three/three.module.js";\n`);
  writeFileSync(join(loaderDir, "GLTFLoader.js"), `export * from "../../../../vendor/three/addons/loaders/GLTFLoader.js";\n`);
  writeFileSync(join(postDir, "EffectComposer.js"), `export * from "../../../../vendor/three/addons/postprocessing/EffectComposer.js";\n`);
  writeFileSync(join(postDir, "RenderPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/RenderPass.js";\n`);
  writeFileSync(join(postDir, "ShaderPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/ShaderPass.js";\n`);
  writeFileSync(join(postDir, "UnrealBloomPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/UnrealBloomPass.js";\n`);
  writeFileSync(join(postDir, "OutputPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/OutputPass.js";\n`);
  writeFileSync(join(postDir, "GTAOPass.js"), `export * from "../../../../vendor/three/addons/postprocessing/GTAOPass.js";\n`);
  const shaderDir = join(base, "addons", "shaders");
  const mathDir = join(base, "addons", "math");
  mkdirSync(shaderDir, { recursive: true });
  mkdirSync(mathDir, { recursive: true });
  writeFileSync(join(shaderDir, "GTAOShader.js"), `export * from "../../../../vendor/three/addons/shaders/GTAOShader.js";\n`);
  writeFileSync(join(shaderDir, "PoissonDenoiseShader.js"), `export * from "../../../../vendor/three/addons/shaders/PoissonDenoiseShader.js";\n`);
  writeFileSync(join(mathDir, "SimplexNoise.js"), `export * from "../../../../vendor/three/addons/math/SimplexNoise.js";\n`);
  writeFileSync(versionFile, shimVersion + "\n");
  console.log("(bootstrap) wrote node_modules/three vendor shim (" + shimVersion + ")");
}

function ensureJsdomShim(){
  const target = join(ROOT, "node_modules", "jsdom");
  if(existsSync(join(target, "package.json")) || existsSync(target)) return;
  const real = join(JSDOM_HOME, "node_modules", "jsdom");
  if(!existsSync(join(real, "package.json"))){
    throw new Error(`jsdom not found at ${real} — run "npm i jsdom" in ${JSDOM_HOME} first (CLAUDE.md convention)`);
  }
  mkdirSync(join(ROOT, "node_modules"), { recursive: true });
  try {
    symlinkSync(real, target, "dir");
    console.log("(bootstrap) symlinked node_modules/jsdom -> " + real);
  } catch(e){
    mkdirSync(target, { recursive: true });
    const pkg = JSON.parse(readFileSync(join(real, "package.json"), "utf-8"));
    writeFileSync(join(target, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { main: join(real, pkg.main || "lib/api.js") }), null, 2));
    console.log("(bootstrap) wrote node_modules/jsdom re-export shim -> " + real);
  }
}

ensureThreeShim();
ensureJsdomShim();

// ============================================================================
// COLLISION FIXTURE — two bestiary ids ("giant-rat", "giantrat") that normalize to the identical
// key under normalizeSpriteKey, each with its OWN registry entry. Under the pre-S4 name-only scan
// these are INDISTINGUISHABLE (both queries produce wantKey="giantrat"); the id map disambiguates
// by exact key. "spr-fantasy-giant-rat" (the smaller creature, Small) is placed FIRST in the
// registry so the RED scenario's "always returns the first match" failure mode is unambiguous.
// ============================================================================
const FIXTURE_REGISTRY = {
  "spr-fantasy-giant-rat": { realm: "fantasy", kind: "monster", name: "Giant Rat", size: "Small", status: "cut" },
  "spr-fantasy-giant-rat-variant": { realm: "fantasy", kind: "monster", name: "Giant Rat", size: "Large", status: "cut" },
  // (d): a cut entry with NO id-map hit at all — the id map only ever knows about ids the
  // generator actually joined; this one exercises the pure TIER 2 fallback path.
  "spr-fantasy-town-guard": { realm: "fantasy", kind: "npc", name: "Town Guard", size: "Medium", status: "cut" },
  // (e): an id IS mapped to this slug, but it's not cut yet — TIER 1 must treat that as a miss
  // and fall through to TIER 2 (which also can't resolve it — no name collision here), not throw.
  "spr-fantasy-shy-ghoul": { realm: "fantasy", kind: "monster", name: "Shy Ghoul", size: "Medium", status: "pending" },
  // (f) CR-1 item 4 — a TIER-2-only entry (no id-map hit), used fresh (never queried elsewhere
  // in this fixture) so the de-dupe proof's "first hit warns, repeat hits don't" claim isn't
  // muddied by an earlier call to the same slug.
  "spr-fantasy-market-vendor": { realm: "fantasy", kind: "npc", name: "Market Vendor", size: "Medium", status: "cut" },
};
const FIXTURE_ID_MAP = {
  "giant-rat": "spr-fantasy-giant-rat",
  "giantrat": "spr-fantasy-giant-rat-variant",
  "shy-ghoul": "spr-fantasy-shy-ghoul",
};

const RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const bootPath = process.argv[2];
const mode = process.argv[3]; // "fixture" | "production"
const fixtureRegistry = process.argv[4] ? JSON.parse(process.argv[4]) : null;
const fixtureIdMap = process.argv[5] ? JSON.parse(process.argv[5]) : null;
const realRegistryPath = process.argv[6] || null;

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
// Light-recipe classic globals (2026-07-25, split B5 re-gate): theater-boot's eval builds
// LIGHT_PROFILES/LIGHT_TUNABLES from the shared src/engine/light-recipes.js registry (CL-R1 merge)
// — the production page loads it as a classic script first. Same stubs as bw2-2/bw2-1b/s5-flip.
global.LIGHT_RECIPE_REGISTRY = {};
global.lightRecipeLegacyProfile = (value) => value;
global.lightRecipeDeepClone = (value) => JSON.parse(JSON.stringify(value));
global.lightRecipeDeepFreeze = (value) => value;
global.LIGHT_LAB_COMPILED_SETTINGS = { stageAmbientFloor: 0.42, gradeExposureFloor: 0.006, bloomThreshold: 0.68, bloomStrength: 1.15, gradeTintScale: 0.45, gradeTintMax: 0.12, celestialArc: {}, spriteEmissiveFloor: 0.05, sceneAmbient: 0.13, lightRenderGain: 4.5 };
global.document = dom.window.document;

if(mode === "fixture"){
  global.SPRITE_REGISTRY = fixtureRegistry;
  global.window.SPRITE_REGISTRY = fixtureRegistry;
  global.SPRITE_BY_BESTIARY_ID = fixtureIdMap;
  global.window.SPRITE_BY_BESTIARY_ID = fixtureIdMap;
} else {
  // PRODUCTION mode: evaluate the REAL generated data/sprite-registry.js text (a classic-script
  // "const SPRITE_REGISTRY={...}; const SPRITE_BY_BESTIARY_ID={...};" pair, no module exports) in
  // an IIFE that hands both consts back — same discipline every other verify-*.mjs harness uses
  // for classic-script data files (never re-derive the shape by hand, read the real generated file).
  const src = readFileSync(realRegistryPath, "utf-8");
  const real = new Function(src + "\\nreturn { SPRITE_REGISTRY, SPRITE_BY_BESTIARY_ID };")();
  global.SPRITE_REGISTRY = real.SPRITE_REGISTRY;
  global.window.SPRITE_REGISTRY = real.SPRITE_REGISTRY;
  global.SPRITE_BY_BESTIARY_ID = real.SPRITE_BY_BESTIARY_ID;
  global.window.SPRITE_BY_BESTIARY_ID = real.SPRITE_BY_BESTIARY_ID;
}

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;

  if(mode === "fixture"){
    const giantRat = T._spriteEntryForTest("giant-rat");
    const giantRatVariant = T._spriteEntryForTest("giantrat");
    result.giantRatSlug = giantRat && giantRat.slug;
    result.giantRatSize = giantRat && giantRat.size;
    result.giantRatVariantSlug = giantRatVariant && giantRatVariant.slug;
    result.giantRatVariantSize = giantRatVariant && giantRatVariant.size;

    const beforeCount = T._spriteJoinNameFallbackCountForTest();
    const townGuard = T._spriteEntryForTest("town-guard"); // no id-map entry — TIER 2 only
    result.townGuardSlug = townGuard && townGuard.slug;
    result.fallbackIncrementedOnTier2Hit = T._spriteJoinNameFallbackCountForTest() > beforeCount;

    const pendingViaId = T._spriteEntryForTest("shy-ghoul"); // id-mapped but status:"pending"
    result.pendingViaIdResolved = !!pendingViaId; // must be null — falls through, no cut art

    const missEntirely = T._spriteEntryForTest("no-such-creature-anywhere");
    result.missEntirelyResolved = !!missEntirely; // must be null

    // (f) CR-1 item 4 — de-dupe: three TIER-2 hits on a FRESH slug (never queried above), spied
    // via a console.warn override. Counter must climb by 3; the warned-Set and the actual
    // console.warn call count must each grow by exactly 1 (first hit only).
    let warnCalls = 0;
    const origWarn = console.warn;
    console.warn = function(){ warnCalls++; return origWarn.apply(console, arguments); };
    const dedupeCountBefore = T._spriteJoinNameFallbackCountForTest();
    const dedupeWarnedSizeBefore = T._spriteJoinNameFallbackWarnedSizeForTest();
    T._spriteEntryForTest("market-vendor");
    T._spriteEntryForTest("market-vendor");
    T._spriteEntryForTest("market-vendor");
    console.warn = origWarn;
    result.dedupeCountDelta = T._spriteJoinNameFallbackCountForTest() - dedupeCountBefore;
    result.dedupeWarnedSizeDelta = T._spriteJoinNameFallbackWarnedSizeForTest() - dedupeWarnedSizeBefore;
    result.dedupeWarnCalls = warnCalls;
  } else {
    const giantRat = T._spriteEntryForTest("giant-rat");
    result.prodGiantRatSlug = giantRat && giantRat.slug;
    result.prodGiantRatKind = giantRat && giantRat.kind;
    result.prodGiantRatStatus = giantRat && giantRat.status;
  }

  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runScenario(bootSourceText, mode, extraArgs){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-sprite-join-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-sprite-join-runner-${tag}.mjs`);
  writeFileSync(bootPath, bootSourceText);
  writeFileSync(runnerPath, RUNNER_SRC);
  try {
    const args = [runnerPath, bootPath, mode, ...extraArgs];
    const out = execFileSync("node", args, { cwd: ROOT, encoding: "utf-8", timeout: 30000 });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(bootPath, { force: true });
    rmSync(runnerPath, { force: true });
  }
}

const REAL_SOURCE = read("src/ui/theater-boot.js");

// The TIER 1 guard block this harness stubs out for RED-FIRST — verbatim from the real source, so
// a drift in theater-boot.js's own wording fails this setup loudly instead of silently no-op'ing.
const TIER1_GUARD = `if(typeof SPRITE_BY_BESTIARY_ID !== "undefined" && SPRITE_BY_BESTIARY_ID){`;
const TIER1_STUBBED = `if(false && typeof SPRITE_BY_BESTIARY_ID !== "undefined" && SPRITE_BY_BESTIARY_ID){`;

console.log("=== S4 (a)/(d)/(e) collision + fallback fixture (GREEN — real theater-boot.js) ===");
const green = runScenario(REAL_SOURCE, "fixture", [JSON.stringify(FIXTURE_REGISTRY), JSON.stringify(FIXTURE_ID_MAP)]);
if(!green.ok){
  fail++;
  console.log("  ✗ GREEN scenario threw:", green.error);
} else {
  check("(a) recipeSlug 'giant-rat' resolves to ITS OWN slug (spr-fantasy-giant-rat, Small)",
    green.giantRatSlug === "spr-fantasy-giant-rat" && green.giantRatSize === "Small",
    `slug=${green.giantRatSlug} size=${green.giantRatSize}`);
  check("(a) recipeSlug 'giantrat' (colliding normalized key) resolves to ITS OWN, DIFFERENT slug (spr-fantasy-giant-rat-variant, Large)",
    green.giantRatVariantSlug === "spr-fantasy-giant-rat-variant" && green.giantRatVariantSize === "Large",
    `slug=${green.giantRatVariantSlug} size=${green.giantRatVariantSize}`);
  check("(d) an id with no id-map entry still resolves via the TIER 2 name scan",
    green.townGuardSlug === "spr-fantasy-town-guard", `slug=${green.townGuardSlug}`);
  check("(d) the TIER 2 fallback counter increments when TIER 2 is the one that resolved a match",
    green.fallbackIncrementedOnTier2Hit === true, `fallbackIncrementedOnTier2Hit=${green.fallbackIncrementedOnTier2Hit}`);
  check("(e) an id-mapped slug that is NOT status:\"cut\" falls through (never wrongly resolves)",
    green.pendingViaIdResolved === false, `pendingViaIdResolved=${green.pendingViaIdResolved}`);
  check("no match at any tier returns null (never throws, never guesses)",
    green.missEntirelyResolved === false, `missEntirelyResolved=${green.missEntirelyResolved}`);
  check("(f) CR-1 item 4: fallback counter climbs on EVERY repeat TIER-2 hit (3 calls -> +3)",
    green.dedupeCountDelta === 3, `dedupeCountDelta=${green.dedupeCountDelta}`);
  check("(f) CR-1 item 4: warned-Set grows only on the FIRST hit for that slug (3 calls -> +1)",
    green.dedupeWarnedSizeDelta === 1, `dedupeWarnedSizeDelta=${green.dedupeWarnedSizeDelta}`);
  check("(f) CR-1 item 4: console.warn itself fires only once across the 3 repeat calls",
    green.dedupeWarnCalls === 1, `dedupeWarnCalls=${green.dedupeWarnCalls}`);
}

console.log("=== S4 (b) RED-FIRST: TIER 1 stubbed out — the pre-S4 collision bug reproduced ===");
if(!REAL_SOURCE.includes(TIER1_GUARD)){
  fail++;
  console.log("  ✗ RED-FIRST setup: TIER 1 guard line not found verbatim in theater-boot.js — cannot stub it");
} else {
  const buggySource = REAL_SOURCE.replace(TIER1_GUARD, TIER1_STUBBED);
  const red = runScenario(buggySource, "fixture", [JSON.stringify(FIXTURE_REGISTRY), JSON.stringify(FIXTURE_ID_MAP)]);
  if(!red.ok){
    fail++;
    console.log("  ✗ RED scenario threw (expected to run, just to render WRONG):", red.error);
  } else {
    console.log(`  RED run result (expected to be WRONG — TIER 1 is stubbed out): giantRatSlug=${red.giantRatSlug} giantRatVariantSlug=${red.giantRatVariantSlug}`);
    check("(b) RED: with TIER 1 disabled, BOTH colliding ids resolve to the SAME (first-in-registry-order) slug — the old bug",
      red.giantRatSlug === red.giantRatVariantSlug && red.giantRatVariantSlug === "spr-fantasy-giant-rat",
      `expected both === "spr-fantasy-giant-rat" (the wrong-for-one-of-them identity) — got giantRatSlug=${red.giantRatSlug} giantRatVariantSlug=${red.giantRatVariantSlug}`);
    check("(b) RED: recipeSlug 'giantrat' therefore WRONGLY resolves to the Small giant-rat's own slug instead of its own Large-variant slug",
      red.giantRatVariantSlug !== "spr-fantasy-giant-rat-variant",
      `expected giantRatVariantSlug != "spr-fantasy-giant-rat-variant" (proving the miscast) — got ${red.giantRatVariantSlug}`);
  }
}

console.log("(b) GREEN re-proof: the real, unmutated file resolves both ids to their own distinct slugs (already captured above)");
check("(b) GREEN re-proof", green.ok && green.giantRatSlug !== green.giantRatVariantSlug,
  `giantRatSlug=${green.ok && green.giantRatSlug} giantRatVariantSlug=${green.ok && green.giantRatVariantSlug}`);

console.log("=== S4 (c) PRODUCTION — the real data/sprite-registry.js, real Giant Rat bestiary id ===");
const prod = runScenario(REAL_SOURCE, "production", ["", "", join(ROOT, "data", "sprite-registry.js")]);
if(!prod.ok){
  fail++;
  console.log("  ✗ PRODUCTION scenario threw:", prod.error);
} else {
  check("(c) recipeSlug 'giant-rat' resolves to slug 'spr-fantasy-giant-rat' against the REAL registry",
    prod.prodGiantRatSlug === "spr-fantasy-giant-rat", `slug=${prod.prodGiantRatSlug}`);
  check("(c) the resolved entry is kind:\"monster\" (not a humanoid-kind entry — the historical miscast)",
    prod.prodGiantRatKind === "monster", `kind=${prod.prodGiantRatKind}`);
  check("(c) the resolved entry is status:\"cut\" (real art, not a pending placeholder)",
    prod.prodGiantRatStatus === "cut", `status=${prod.prodGiantRatStatus}`);
}

console.log("=== (g) CR-1 item 2 — build_bestiary_id_map driven DIRECTLY (not through theater-boot.js) ===");
{
  // Four synthetic bestiary ids, each a multi-slug collision exercising one rung of the
  // qaStatus-candidate > verdict-pass > alphabetical-last-resort ladder:
  //   creature-a: a candidate beats a verdict:"pass" beats a plain entry (all three tiers present).
  //   creature-b: no candidate present — verdict:"pass" beats a plain entry (alphabetically-first
  //               "spr-aaa-*" loses to "spr-zzz-passed", proving tier beats alphabetical order).
  //   creature-c: neither marker present on either slug — falls all the way to the alphabetical
  //               last resort ("spr-aaa-none" beats "spr-zzz-none").
  //   creature-d: TWO candidates collide — proves the alphabetical tie-break also applies WITHIN
  //               a tier, not just as the final fallback.
  const pyScript = [
    "import importlib.util, json",
    `spec = importlib.util.spec_from_file_location("gen_mod", ${JSON.stringify(join(ROOT, "build", "gen-sprite-registry.py"))})`,
    "mod = importlib.util.module_from_spec(spec)",
    "spec.loader.exec_module(mod)",
    "entries = {",
    '  "spr-bbb-candidate": {"frame": "creature-a", "status": "cut", "qaStatus": mod.QA_STATUS_CANDIDATE},',
    '  "spr-mmm-passed":    {"frame": "creature-a", "status": "cut", "verdict": "pass"},',
    '  "spr-aaa-first":     {"frame": "creature-a", "status": "cut"},',
    '  "spr-zzz-passed":    {"frame": "creature-b", "status": "cut", "verdict": "pass"},',
    '  "spr-aaa-second":    {"frame": "creature-b", "status": "cut"},',
    '  "spr-zzz-none":      {"frame": "creature-c", "status": "cut"},',
    '  "spr-aaa-none":      {"frame": "creature-c", "status": "cut"},',
    '  "spr-zzz-candidate": {"frame": "creature-d", "status": "cut", "qaStatus": mod.QA_STATUS_CANDIDATE},',
    '  "spr-aaa-candidate": {"frame": "creature-d", "status": "cut", "qaStatus": mod.QA_STATUS_CANDIDATE},',
    "}",
    "by_id, collisions = mod.build_bestiary_id_map(entries)",
    'print(json.dumps({"by_id": by_id, "collisions": collisions}))',
  ].join("\n");
  const out = execFileSync("python3", ["-c", pyScript], { cwd: ROOT, encoding: "utf-8" });
  const g = JSON.parse(out.trim().split("\n").pop());

  check("(g) qaStatus-candidate beats verdict-pass beats a plain entry (creature-a -> spr-bbb-candidate)",
    g.by_id["creature-a"] === "spr-bbb-candidate", `got ${g.by_id["creature-a"]}`);
  check("(g) with no candidate present, verdict-pass beats alphabetical order (creature-b -> spr-zzz-passed, NOT spr-aaa-second)",
    g.by_id["creature-b"] === "spr-zzz-passed", `got ${g.by_id["creature-b"]}`);
  check("(g) with neither marker present, alphabetical is the last-resort tie-break (creature-c -> spr-aaa-none)",
    g.by_id["creature-c"] === "spr-aaa-none", `got ${g.by_id["creature-c"]}`);
  check("(g) two same-tier candidates still resolve via the alphabetical tie-break WITHIN the tier (creature-d -> spr-aaa-candidate)",
    g.by_id["creature-d"] === "spr-aaa-candidate", `got ${g.by_id["creature-d"]}`);

  const expectedCollisionCount = 2 /* creature-a: 3 slugs, 1 winner */ + 1 /* creature-b */ + 1 /* creature-c */ + 1 /* creature-d */;
  check("(g) every loser in every group is reported as a collision, none silently dropped",
    g.collisions.length === expectedCollisionCount,
    `expected ${expectedCollisionCount} collision(s), got ${g.collisions.length}: ${JSON.stringify(g.collisions)}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
