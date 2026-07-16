/* Verify VQ2-RESPEC.md S5 -- THE FLIP (src/ui/theater-boot.js: FACETED_FLIP_ENABLED,
   spriteAssetPathFor, spriteTextureFor's cache-key law).

   Same subprocess-per-instance discipline as dev/verify-theater-sprites.mjs (its own header
   explains why: loadWholeObjectBuilders() races a stale callback against a second same-process
   jsdom instance) -- every scenario below that loads theater-boot.js gets its OWN Node subprocess.

   Checks:
     1. RED-FIRST -- the PRE-S5 source (git HEAD, the S4 merge tip) hard-builds the legacy path with
        NO reference to runtimeAdmitted/candidateAsset at all: proven by text absence, not a live
        resolution (the pre-S5 spriteTextureFor took a bare slug, not an entry, so there is nothing
        to resolve against).
     2. GREEN -- the real (post-S5) source resolves a "candidate"-admitted entry's candidateAsset
        when FACETED_FLIP_ENABLED is true (its shipped default); a "legacy"-admitted entry (or one
        with no candidateAsset at all -- the wolf/skeleton protection-set shape) resolves legacyAsset;
        a registry-less entry (neither field) falls back to the literal pre-S3 convention.
     3. Kill switch -- a subprocess loaded from a MUTATED source (FACETED_FLIP_ENABLED forced false,
        text-substitution -- the same "one flag" a hand edit would flip) resolves the SAME
        "candidate"-admitted entry to its legacyAsset instead: the retreat path, proven live.
     4. Cache-key law -- spriteTextureFor, called for the SAME slug twice with two DIFFERENT resolved
        paths (a legacy-admitted entry then a candidate-admitted entry, or vice versa), never serves
        the first path's cached texture for the second path: the cache entry is evicted and a fresh
        pending load starts against the NEW path.
     5. Generator retreat (build/gen-sprite-registry.py) -- run WITHOUT --admit-faceted regenerates
        an all-"legacy" registry regardless of the currently-committed admission state; WITH the flag
        regenerates the 252 real "candidate" admissions. Both runs restore the committed (--admit-
        faceted) state afterward so the working tree is left as this unit wants it committed.

   Run: node dev/verify-s5-faceted-flip.mjs (needs the same node_modules/three + node_modules/jsdom
   shims dev/verify-theater-sprites.mjs bootstraps -- run that harness first, or let this one's own
   ensureThreeShim/ensureJsdomShim below create them). */
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
// Bootstrap shims (idempotent -- same convention as dev/verify-theater-sprites.mjs).
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");

function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "bw3-post-suite";
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
  writeFileSync(versionFile, shimVersion + "\n");
  console.log("(bootstrap) wrote node_modules/three vendor shim (" + shimVersion + ")");
}

function ensureJsdomShim(){
  const target = join(ROOT, "node_modules", "jsdom");
  if(existsSync(join(target, "package.json")) || existsSync(target)) return;
  const real = join(JSDOM_HOME, "node_modules", "jsdom");
  if(!existsSync(join(real, "package.json"))){
    throw new Error(`jsdom not found at ${real} -- run "npm i jsdom" in ${JSDOM_HOME} first (CLAUDE.md convention)`);
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
// 1. RED-FIRST -- the pre-S5 source (git HEAD == the S4 merge tip this branch forked from) never
//    consulted an entry's admission fields at all: spriteTextureFor took a bare slug and hard-built
//    "assets/sprites/" + slug + ".png" unconditionally. Proven by TEXT ABSENCE (there is no live
//    "resolution" to run against a function that never existed pre-S5) -- the honest RED-FIRST shape
//    for a unit that ADDS a resolution tier rather than fixing a wrong one.
// ============================================================================
console.log("=== RED-FIRST: pre-S5 source never resolves through admission fields ===");
// Pinned to the S4 merge SHA (this branch's fork point, docs/VQ2-RESPEC.md S1-S4), NOT "HEAD" --
// HEAD moves forward once this unit's own commits land on the branch, which would make OLD_SOURCE
// == NEW_SOURCE and silently defang this whole RED-FIRST block.
const PRE_S5_REF = "9f8e9ead";
const OLD_SOURCE = execFileSync("git", ["show", `${PRE_S5_REF}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8" });
check("RED: pre-S5 (" + PRE_S5_REF + ") has NO spriteAssetPathFor resolver at all",
  !OLD_SOURCE.includes("function spriteAssetPathFor("), "spriteAssetPathFor already present pre-S5?");
// (theater-boot.js already used the BARE WORD "runtimeAdmitted" pre-S5 for an unrelated concept --
// group.userData.runtimeAdmitted, an interior-prop mount flag -- so the file-wide text check has to
// be scoped to spriteTextureFor's own body, not the whole file, to mean anything.)
const oldFnStart = OLD_SOURCE.indexOf("function spriteTextureFor(");
const oldFnBody = OLD_SOURCE.slice(oldFnStart, OLD_SOURCE.indexOf("\n}\n", oldFnStart));
check("RED: pre-S5 (" + PRE_S5_REF + ")'s spriteTextureFor takes a bare `slug`, hard-builds the legacy literal unconditionally, and never reads .candidateAsset/.runtimeAdmitted",
  oldFnStart >= 0 && OLD_SOURCE.slice(oldFnStart, oldFnStart + 40).includes("(slug){")
    && oldFnBody.includes('"assets/sprites/" + slug + ".png"')
    && !oldFnBody.includes("candidateAsset") && !oldFnBody.includes(".runtimeAdmitted"),
  "expected a bare-slug spriteTextureFor with the hard literal and no admission-field reads in its body");

const NEW_SOURCE = read("src/ui/theater-boot.js");
check("GREEN re-proof: the real file now defines spriteAssetPathFor",
  NEW_SOURCE.includes("function spriteAssetPathFor(entry){"));
check("GREEN re-proof: spriteAssetPathFor's candidate branch gates on FACETED_FLIP_ENABLED + runtimeAdmitted + candidateAsset (all three)",
  /FACETED_FLIP_ENABLED\s*&&\s*entry\.runtimeAdmitted\s*===\s*"candidate"\s*&&\s*entry\.candidateAsset/.test(NEW_SOURCE));

// ============================================================================
// Subprocess runner -- same one-shot pattern as dev/verify-theater-sprites.mjs's runScenario.
// ============================================================================
const RUNNER_SRC = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";

const bootPath = process.argv[2];

const dom = new JSDOM(
  \`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`,
  { runScripts: "dangerously", url: "http://localhost/" }
);
global.window = dom.window;
global.document = dom.window.document;
global.SPRITE_REGISTRY = {};
global.window.SPRITE_REGISTRY = {};

function fakeTexture(tag){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, _tag: tag }; }

const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;

  const legacyEntry = {
    slug: "spr-fantasy-giant-rat", runtimeAdmitted: "legacy",
    legacyAsset: "assets/sprites/spr-fantasy-giant-rat.png",
    candidateAsset: "assets/sprites-faceted/spr-fantasy-giant-rat.png",
  };
  const candidateEntry = {
    slug: "spr-fantasy-giant-rat", runtimeAdmitted: "candidate",
    legacyAsset: "assets/sprites/spr-fantasy-giant-rat.png",
    candidateAsset: "assets/sprites-faceted/spr-fantasy-giant-rat.png",
  };
  // wolf/skeleton protection-set shape: no candidate ever cut for this slug.
  const noCandidateEntry = {
    slug: "spr-fantasy-dire-wolf", runtimeAdmitted: "legacy",
    legacyAsset: "assets/sprites/spr-fantasy-dire-wolf.png", candidateAsset: null,
  };
  const bareEntry = { slug: "spr-fantasy-unknown-thing" }; // no admission fields at all

  result.pathCandidateAdmitted = T._spriteAssetPathForTest(candidateEntry);
  result.pathLegacyAdmitted = T._spriteAssetPathForTest(legacyEntry);
  result.pathNoCandidate = T._spriteAssetPathForTest(noCandidateEntry);
  result.pathBareFallback = T._spriteAssetPathForTest(bareEntry);
  result.facetedFlipEnabled = T.facetedFlip;

  // --- cache-key law ---
  // (i) first request for this slug -- legacy admission. Cache miss -> pending, src recorded.
  const missA = T._spriteTextureForTest(legacyEntry);
  result.missA = missA; // expect null (pending, no real network/image load under jsdom)
  result.srcAfterA = T._spriteTextureSrcCache["spr-fantasy-giant-rat"];
  // simulate the async load actually completing (the "stub texture loader" convention).
  T._spriteTextureCache["spr-fantasy-giant-rat"] = fakeTexture("legacy");
  const hitA = T._spriteTextureForTest(legacyEntry); // same entry, same resolved path -> real cache hit
  result.hitA = hitA && hitA._tag;

  // (ii) SAME slug, now candidate-admitted -- resolved path changes under the same slug key.
  const missB = T._spriteTextureForTest(candidateEntry);
  result.missB = missB; // MUST be null -- never the stale legacy texture served under the new path
  result.srcAfterB = T._spriteTextureSrcCache["spr-fantasy-giant-rat"];
  result.cacheClearedAfterB = T._spriteTextureCache["spr-fantasy-giant-rat"] === "pending";
  T._spriteTextureCache["spr-fantasy-giant-rat"] = fakeTexture("candidate");
  const hitB = T._spriteTextureForTest(candidateEntry);
  result.hitB = hitB && hitB._tag;

  // (iii) flip BACK to legacy -- must invalidate again, never re-serve the candidate texture.
  const missC = T._spriteTextureForTest(legacyEntry);
  result.missC = missC;
  result.srcAfterC = T._spriteTextureSrcCache["spr-fantasy-giant-rat"];

  // (iv) an UNRELATED slug pre-seeded directly in the cache (the test-harness "stub texture loader"
  // convention, dev/verify-theater-sprites.mjs) must still hit on its FIRST read -- SPRITE_TEXTURE_SRC
  // has no prior record for it, so first-touch must not evict a fixture-seeded cache entry.
  T._spriteTextureCache["spr-preseeded-fixture"] = fakeTexture("preseeded");
  const preseededHit = T._spriteTextureForTest({ slug: "spr-preseeded-fixture", runtimeAdmitted: "legacy", legacyAsset: "assets/sprites/spr-preseeded-fixture.png" });
  result.preseededHit = preseededHit && preseededHit._tag;

  result.ok = true;
} catch(e){
  result.error = String((e && e.stack) || e);
}
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function runScenario(bootSourceText){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bootPath = join(ROOT, "src", "ui", `.verify-s5-boot-${tag}.mjs`);
  const runnerPath = join(ROOT, "dev", `.verify-s5-runner-${tag}.mjs`);
  writeFileSync(bootPath, bootSourceText);
  writeFileSync(runnerPath, RUNNER_SRC);
  try {
    const out = execFileSync("node", [runnerPath, bootPath], { cwd: ROOT, encoding: "utf-8", timeout: 30000 });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(bootPath, { force: true });
    rmSync(runnerPath, { force: true });
  }
}

// ============================================================================
// 2. GREEN -- the real, unmutated source, flip ON (its shipped default).
// ============================================================================
console.log("\n=== GREEN: real theater-boot.js, FACETED_FLIP_ENABLED=true (default) ===");
const green = runScenario(NEW_SOURCE);
if(!green.ok){
  fail++;
  console.log("  ✗ GREEN scenario threw:", green.error);
} else {
  check("flip ON, runtimeAdmitted:\"candidate\" -> resolves candidateAsset (assets/sprites-faceted/...)",
    green.pathCandidateAdmitted === "assets/sprites-faceted/spr-fantasy-giant-rat.png",
    `got ${green.pathCandidateAdmitted}`);
  check("flip ON, runtimeAdmitted:\"legacy\" -> still resolves legacyAsset (admission gate, not just the flip)",
    green.pathLegacyAdmitted === "assets/sprites/spr-fantasy-giant-rat.png",
    `got ${green.pathLegacyAdmitted}`);
  check("wolf/skeleton protection-set shape (candidateAsset:null) -> resolves legacyAsset regardless of the flip",
    green.pathNoCandidate === "assets/sprites/spr-fantasy-dire-wolf.png",
    `got ${green.pathNoCandidate}`);
  check("registry-less entry (no legacyAsset/candidateAsset at all) -> the pre-S3 literal fallback",
    green.pathBareFallback === "assets/sprites/spr-fantasy-unknown-thing.png",
    `got ${green.pathBareFallback}`);
  check("window.Theater.facetedFlip reads true (the shipped default)", green.facetedFlipEnabled === true);

  console.log("\n  -- cache-key law --");
  check("(i) first request (legacy): cache miss returns null (async load pending)", green.missA === null);
  check("(i) src recorded for the legacy path", green.srcAfterA === "assets/sprites/spr-fantasy-giant-rat.png");
  check("(i) repeat request, same resolved path: real cache hit (the stub-loaded legacy texture)", green.hitA === "legacy");
  check("(ii) SAME slug, path changed to candidate: NEVER serves the stale legacy texture", green.missB === null, `missB=${JSON.stringify(green.missB)}`);
  check("(ii) the stale cache entry was evicted (back to \"pending\"), not silently kept", green.cacheClearedAfterB === true);
  check("(ii) src updated to the candidate path", green.srcAfterB === "assets/sprites-faceted/spr-fantasy-giant-rat.png");
  check("(ii) repeat request, same (candidate) resolved path: real cache hit (the stub-loaded candidate texture)", green.hitB === "candidate");
  check("(iii) flip back to legacy: NEVER serves the stale candidate texture", green.missC === null, `missC=${JSON.stringify(green.missC)}`);
  check("(iii) src updated back to the legacy path", green.srcAfterC === "assets/sprites/spr-fantasy-giant-rat.png");
  check("(iv) a slug pre-seeded directly in the cache (no prior src record) still hits on its FIRST read",
    green.preseededHit === "preseeded", `preseededHit=${JSON.stringify(green.preseededHit)}`);
}

// ============================================================================
// 3. Kill switch -- mutate the source (FACETED_FLIP_ENABLED true -> false, the one-flag hand edit)
//    and prove EVERY resolution forces legacy, regardless of what the registry's runtimeAdmitted says.
// ============================================================================
console.log("\n=== Kill switch: FACETED_FLIP_ENABLED mutated to false ===");
const KILLED_LINE_OLD = "const FACETED_FLIP_ENABLED = true;";
const KILLED_LINE_NEW = "const FACETED_FLIP_ENABLED = false;";
check("sanity: the const declaration is present verbatim in the real source (so the mutation below actually bites)",
  NEW_SOURCE.includes(KILLED_LINE_OLD));
const KILLED_SOURCE = NEW_SOURCE.replace(KILLED_LINE_OLD, KILLED_LINE_NEW);
check("sanity: the mutation actually changed the source text", KILLED_SOURCE !== NEW_SOURCE);

const killed = runScenario(KILLED_SOURCE);
if(!killed.ok){
  fail++;
  console.log("  ✗ killed scenario threw:", killed.error);
} else {
  check("window.Theater.facetedFlip reads false under the mutation", killed.facetedFlipEnabled === false);
  check("KILL SWITCH: a \"candidate\"-admitted entry now resolves legacyAsset, NOT candidateAsset",
    killed.pathCandidateAdmitted === "assets/sprites/spr-fantasy-giant-rat.png",
    `got ${killed.pathCandidateAdmitted} (expected the legacy path)`);
  check("KILL SWITCH: the wolf/skeleton protection-set shape is unaffected either way (still legacy)",
    killed.pathNoCandidate === "assets/sprites/spr-fantasy-dire-wolf.png");
}

// ============================================================================
// 4. Generator retreat -- build/gen-sprite-registry.py --admit-faceted is re-derivable IN BOTH
//    DIRECTIONS. FIXTURE RE-TUNED 2026-07-15 (Adam's PIXEL-FIRST ruling, DESIGN.md 2026-07-15 late:
//    "for now we stick with the pixel art style"): the COMMITTED state is now all-"legacy" (0
//    candidates) -- the faceted corpus is the RESERVE, not the live set. The mechanics under test
//    are unchanged (both regen directions still proven); only which state is committed flipped.
//    Restores the committed (all-legacy) state afterward.
// ============================================================================
console.log("\n=== Generator retreat: build/gen-sprite-registry.py --admit-faceted is re-derivable ===");
{
  const REG = join(ROOT, "data", "sprite-registry.js");
  const before = readFileSync(REG, "utf-8");
  const beforeCandidateCount = (before.match(/runtimeAdmitted:"candidate"/g) || []).length;
  check("sanity: the committed registry is the PIXEL-FIRST state (0 candidate admissions; faceted = reserve)",
    beforeCandidateCount === 0, `got ${beforeCandidateCount}`);

  execFileSync("python3", ["build/gen-sprite-registry.py", "--admit-faceted"], { cwd: ROOT, encoding: "utf-8" });
  const withFlag = readFileSync(REG, "utf-8");
  const withFlagCandidateCount = (withFlag.match(/runtimeAdmitted:"candidate"/g) || []).length;
  check("re-admit: regenerating WITH --admit-faceted admits the full 252-candidate reserve (the forward path stays healthy)",
    withFlagCandidateCount === 252, `got ${withFlagCandidateCount}`);

  execFileSync("python3", ["build/gen-sprite-registry.py"], { cwd: ROOT, encoding: "utf-8" });
  const withoutFlag = readFileSync(REG, "utf-8");
  const withoutFlagCandidateCount = (withoutFlag.match(/runtimeAdmitted:"candidate"/g) || []).length;
  check("RETREAT: regenerating WITHOUT --admit-faceted returns the registry to all-\"legacy\" (0 candidates)",
    withoutFlagCandidateCount === 0, `got ${withoutFlagCandidateCount}`);
  check("retreat run is byte-identical to the committed pixel-first state (deterministic regen)",
    withoutFlag === before, "regenerated bytes differ from the committed file");

  // ==========================================================================
  // 5. Guise audit (VQ2-RESPEC.md S5 item 4) -- persisted guise.forms[].spriteSlug values
  //    (src/engine/place-projection.js:44's wspApplyEntityGuise, `visual.slug = form.spriteSlug`)
  //    reference a SPRITE_REGISTRY key directly, bypassing spriteEntryFor's bestiary-id/name-join
  //    tiers entirely. The flip must NEVER rename or remove a slug KEY -- only swap which asset path
  //    that key's entry resolves to (spriteAssetPathFor). Proven here mechanically: the SET of slug
  //    keys the generator emits is identical whether --admit-faceted is passed or not (the flag only
  //    ever touches the runtimeAdmitted field's VALUE on already-existing keys), so any persisted
  //    guise slug that resolved before this unit landed still resolves, unchanged, after it.
  // ==========================================================================
  const slugKeyRe = /^ "([^"]+)": \{/gm;
  const keysOf = (src) => new Set(Array.from(src.matchAll(slugKeyRe), (m) => m[1]));
  const keysBefore = keysOf(before);
  const keysWithoutFlag = keysOf(withoutFlag);
  check("sanity: slug-key extraction actually found entries (regex didn't silently match zero)",
    keysBefore.size > 4000, `got ${keysBefore.size} keys`);
  const onlyInBefore = [...keysBefore].filter((k) => !keysWithoutFlag.has(k));
  const onlyInWithoutFlag = [...keysWithoutFlag].filter((k) => !keysBefore.has(k));
  check("GUISE AUDIT: the flip never adds, removes, or renames a slug key -- --admit-faceted and its "
    + "absence emit the IDENTICAL key set (only runtimeAdmitted's per-key VALUE differs)",
    keysBefore.size === keysWithoutFlag.size && onlyInBefore.length === 0 && onlyInWithoutFlag.length === 0,
    `${keysBefore.size} vs ${keysWithoutFlag.size} keys; onlyInBefore=${onlyInBefore.length} onlyInWithoutFlag=${onlyInWithoutFlag.length}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
