/* Verify FIGURE-FIDELITY ROUND-2 UNIT 1 — the procedural pixel-skin system (REFERENCE-DIRECTION.md
   L2/L7) in src/ui/theater-boot.js. Registered nowhere (a dev harness, not a manifest module).

   The pixel-skin functions live inside theater-boot.js's SEALED ES-module scope (it `import`s THREE,
   which needs WebGL and won't load headless), so this harness EXTRACTS the pure, self-contained
   helpers from the source text and evals them in a controlled sandbox with a tiny canvas-2D shim
   (real ImageData byte semantics, no `canvas` npm package needed) — exercising the exact source logic
   without booting THREE. That's the honest way to unit-test a texture recipe that would otherwise only
   be reachable through a full WebGL mount.

   RED-FIRST CHECKS (per the unit's brief — "texture determinism, cache-hit behavior, headless
   fallback (no canvas 2D -> vertex-color path, zero throws); show any new check RED first against a
   deliberate mutation, then green"):
     1. Texture DETERMINISM: buildPixelSkinCanvas(color, seed) yields a byte-identical pixel buffer
        across two calls with the same inputs; DIFFERENT (seed) or (color) yields a DIFFERENT buffer
        (proves the seed/color actually drive the texels — not a constant image).
     2. The seeded PRNG (mulberry32) + hash (pixelSkinHash) are deterministic and pure.
     3. CACHE-HIT behavior: a cache keyed by (part:channel:variant:colorHex) returns the SAME object
        on a repeat key and a DIFFERENT object on a new key (mirrors pixelSkinTextureFor's memoization).
     4. HEADLESS FALLBACK: pixelSkinCapable() is false when document/getContext('2d') is absent, and a
        figureMaterialFor-equivalent takes the flat-color path with ZERO throws (the exact pre-Unit-1
        behavior every existing jsdom harness relies on — jsdom's getContext('2d') returns null without
        the canvas package, so this is the real production degrade path, not a synthetic one).
     5. ALBEDO FLOOR: a below-floor color is lifted into [0.26,0.66] luminance preserving hue; an
        in-band color is returned UNCHANGED (byte-identical); a near-black lifts to a neutral floor.
     6. MUTATION proofs: (a) forcing buildPixelSkinCanvas to ignore its seed makes the determinism-
        DIFFERENCE check go RED; (b) an albedo floor that passes dark colors through unchanged fails
        the lift check. Both shown RED then the real code green.

   Run:  node dev/verify-pixel-skin.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const bootSrc = readFileSync(join(ROOT, "src/ui/theater-boot.js"), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ---- extract a named `function NAME(...){ ... }` declaration's full source by brace-matching. ----
function extractFn(src, name){
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if(start < 0) return null;
  let i = src.indexOf("{", start);
  let depth = 0;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0){ return src.slice(start, i + 1); } }
  }
  return null;
}
// extract a `const NAME = <literal>;` (single-line or array literal up to the terminating `];\n` or `;`).
function extractConstArray(src, name){
  const re = new RegExp("const " + name + "\\s*=\\s*\\[[\\s\\S]*?\\];");
  const m = src.match(re);
  return m ? m[0] : null;
}

// pull the pure helpers we need. They form a closed dependency set (each only calls others in this
// list + Math + the injected canvas/document shim), so evaling them together reconstructs the exact
// production logic.
const PURE_FNS = ["pixelSkinHash", "mulberry32", "clamp255", "hexToRGB", "rgbToHex", "scaleRGB",
  "lumaOf", "albedoFloor", "buildPixelSkinCanvas"];
const bayer = extractConstArray(bootSrc, "PIXEL_SKIN_BAYER4");
const texSizeMatch = bootSrc.match(/const PIXEL_SKIN_TEX_SIZE\s*=\s*(\d+)/);
const floorMatch = bootSrc.match(/const ALBEDO_FLOOR_LUM\s*=\s*([\d.]+)/);
const ceilMatch = bootSrc.match(/const ALBEDO_CEIL_LUM\s*=\s*([\d.]+)/);

check("all pure pixel-skin helpers are present in the source", PURE_FNS.every(n => extractFn(bootSrc, n)),
  PURE_FNS.filter(n => !extractFn(bootSrc, n)).join(","));
check("PIXEL_SKIN_BAYER4 + PIXEL_SKIN_TEX_SIZE + ALBEDO_FLOOR/CEIL constants present",
  !!bayer && !!texSizeMatch && !!floorMatch && !!ceilMatch);

// ---- a minimal canvas-2D shim with real ImageData byte semantics (no `canvas` npm pkg). ----
function makeCanvasDoc(){
  return {
    createElement(tag){
      if(tag !== "canvas") throw new Error("shim only makes canvas");
      let W = 0, H = 0;
      return {
        set width(v){ W = v; }, get width(){ return W; },
        set height(v){ H = v; }, get height(){ return H; },
        getContext(type){
          if(type !== "2d") return null;
          return {
            createImageData(w, h){ return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; },
            putImageData(){ /* the shim keeps the ImageData the caller already holds; buildPixelSkinCanvas
                               reads `data` before putImageData, so no readback needed */ }
          };
        }
      };
    }
  };
}

// build the sandbox: eval the pure fns with an injected `document` + `PIXEL_SKIN_TEX_SIZE`/`PIXEL_SKIN_BAYER4`.
function buildSandbox(documentShim, opts){
  opts = opts || {};
  const parts = [];
  parts.push("const PIXEL_SKIN_TEX_SIZE = " + (texSizeMatch ? texSizeMatch[1] : 48) + ";");
  parts.push(bayer);
  parts.push("const ALBEDO_FLOOR_LUM = " + (floorMatch ? floorMatch[1] : 0.26) + ";");
  parts.push("const ALBEDO_CEIL_LUM = " + (ceilMatch ? ceilMatch[1] : 0.66) + ";");
  PURE_FNS.forEach(n => {
    let body = extractFn(bootSrc, n);
    // MUTATION hook: optionally neuter buildPixelSkinCanvas's seed use to prove the determinism-
    // DIFFERENCE check is load-bearing (replace the seeded PRNG with a fixed stream).
    if(opts.mutateIgnoreSeed && n === "buildPixelSkinCanvas"){
      body = body.replace("const rand = mulberry32(seed);", "const rand = mulberry32(12345); /*MUTATED: ignore seed*/");
    }
    parts.push(body);
  });
  // MUTATION hook: an albedo floor that passes everything through unchanged.
  if(opts.mutateAlbedoNoop){
    parts[parts.length - PURE_FNS.length + PURE_FNS.indexOf("albedoFloor")] = "function albedoFloor(hex){ return hex; }";
  }
  parts.push("return { pixelSkinHash, mulberry32, albedoFloor, buildPixelSkinCanvas, lumaOf, hexToRGB };");
  // eslint-disable-next-line no-new-func
  const factory = new Function("document", parts.join("\n"));
  return factory(documentShim);
}

const sandbox = buildSandbox(makeCanvasDoc());

// snapshot the pixel bytes a buildPixelSkinCanvas call produced (it returns the shim canvas; the
// ImageData it filled is not stored on the shim, so re-run the recipe capturing the data directly).
// To read the bytes deterministically we re-derive them the same way the fn does: call it, but our
// shim's createImageData hands back a fresh buffer each call — so instead we intercept by wrapping.
function canvasBytesFor(sb, color, seed){
  let captured = null;
  const doc = {
    createElement(){
      let W = 0, H = 0;
      return {
        set width(v){ W = v; }, get width(){ return W; },
        set height(v){ H = v; }, get height(){ return H; },
        getContext(){
          return {
            createImageData(w, h){ captured = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; return captured; },
            putImageData(){}
          };
        }
      };
    }
  };
  const local = buildSandbox(doc, sb.__opts || {});
  local.buildPixelSkinCanvas(color, seed);
  return captured ? Buffer.from(captured.data.buffer.slice(0)) : null;
}

// ============================================================================
// 1 + 2. texture determinism + the seeded PRNG/hash.
// ============================================================================
console.log("\n=== texture determinism + seeded PRNG ===");
{
  const r1 = sandbox.mulberry32(42), r2 = sandbox.mulberry32(42);
  const s1 = [r1(), r1(), r1()], s2 = [r2(), r2(), r2()];
  check("mulberry32 is deterministic (same seed -> same stream)", JSON.stringify(s1) === JSON.stringify(s2), JSON.stringify({ s1, s2 }));
  const rDiff = sandbox.mulberry32(43);
  check("mulberry32 diverges on a different seed", rDiff() !== s1[0]);
  check("pixelSkinHash is deterministic + non-negative", sandbox.pixelSkinHash("goblin:skin:x") === sandbox.pixelSkinHash("goblin:skin:x") && sandbox.pixelSkinHash("x") >= 0);
  check("pixelSkinHash differs across different keys", sandbox.pixelSkinHash("a") !== sandbox.pixelSkinHash("b"));

  const color = 0x7d7048, seed = sandbox.pixelSkinHash("goblin:skin:x:7d7048");
  const bufA = canvasBytesFor(sandbox, color, seed);
  const bufB = canvasBytesFor(sandbox, color, seed);
  check("buildPixelSkinCanvas produces a non-empty pixel buffer", bufA && bufA.length === 48 * 48 * 4, bufA ? bufA.length : "null");
  check("SAME (color, seed) -> byte-identical texel buffer (determinism)", bufA && bufB && bufA.equals(bufB));
  const bufDiffSeed = canvasBytesFor(sandbox, color, seed + 1);
  check("DIFFERENT seed -> DIFFERENT texel buffer (seed actually drives texels)", bufA && bufDiffSeed && !bufA.equals(bufDiffSeed));
  const bufDiffColor = canvasBytesFor(sandbox, 0xd8cfb8, seed);
  check("DIFFERENT color -> DIFFERENT texel buffer (color actually drives texels)", bufA && bufDiffColor && !bufA.equals(bufDiffColor));

  // MUTATION (RED then GREEN): a buildPixelSkinCanvas that ignores its seed must make the
  // "different seed -> different buffer" check FALSE.
  const mutSandbox = buildSandbox(makeCanvasDoc(), { mutateIgnoreSeed: true }); mutSandbox.__opts = { mutateIgnoreSeed: true };
  const mBufA = canvasBytesFor(mutSandbox, color, seed);
  const mBufDiffSeed = canvasBytesFor(mutSandbox, color, seed + 1);
  check("MUTATION: a seed-ignoring recipe makes the different-seed check RED (proves it's load-bearing)",
    mBufA && mBufDiffSeed && mBufA.equals(mBufDiffSeed), "mutation did NOT collapse the two seeds — check is vacuous");
}

// ============================================================================
// 3. cache-hit behavior (mirrors pixelSkinTextureFor's memoization by key).
// ============================================================================
console.log("\n=== cache-hit behavior ===");
{
  // reconstruct the cache-key + memo shape pixelSkinTextureFor uses: key = skinKey + ":" + colorHex.
  const cache = {};
  let mints = 0;
  const tokenFor = (colorHex, skinKey) => {
    const key = skinKey + ":" + (colorHex >>> 0).toString(16);
    if(cache[key]) return cache[key];
    mints++;
    return (cache[key] = { key, id: mints });
  };
  const t1 = tokenFor(0x7d7048, "torso-biped:skin:goblin|foe");
  const t2 = tokenFor(0x7d7048, "torso-biped:skin:goblin|foe"); // same key -> cache hit
  const t3 = tokenFor(0x7d7048, "torso-biped:skin:hobgoblin|foe"); // new variant -> new mint
  const t4 = tokenFor(0xd8cfb8, "torso-biped:skin:goblin|foe");   // new color -> new mint
  check("a repeat (color, skinKey) returns the SAME cached object (cache hit)", t1 === t2 && mints >= 1);
  check("a new variantKey mints a NEW texture (cache miss)", t3 !== t1);
  check("a new color mints a NEW texture (cache miss)", t4 !== t1);
  check("cache does not mint per call — 3 distinct keys over 4 calls => exactly 3 mints", mints === 3, "mints=" + mints);

  // source-level guard: the real pixelSkinTextureFor keys its cache by skinKey + colorHex, and the
  // real renderPartInto builds skinKey as partName:channel:variantKey — confirm both in the source so
  // a refactor can't silently drop the (part, palette, variant) triple the brief requires.
  check("pixelSkinTextureFor keys its cache by skinKey + colorHex (source guard)",
    /const key = skinKey \+ ":" \+ \(colorHex >>> 0\)\.toString\(16\)/.test(bootSrc));
  check("renderPartInto builds skinKey as partName:channel:variantKey (source guard)",
    /const skinKey = partName \+ ":" \+ channel \+ ":" \+ vKey/.test(bootSrc));
  check("PIXEL_SKIN_CACHE memo object exists (source guard)", /const PIXEL_SKIN_CACHE = \{\};/.test(bootSrc));
}

// ============================================================================
// 4. headless fallback — pixelSkinCapable() false without canvas 2D; flat path, zero throws.
// ============================================================================
console.log("\n=== headless fallback (no canvas 2D -> flat color, zero throws) ===");
{
  // re-derive pixelSkinCapable exactly from source and run it with (a) no document, (b) a document
  // whose getContext('2d') returns null (jsdom's real behavior without the canvas pkg).
  const capFnSrc = extractFn(bootSrc, "pixelSkinCapable");
  check("pixelSkinCapable is present in source", !!capFnSrc);

  function runCapable(documentShim){
    // pixelSkinCapable memoizes into PIXEL_SKIN_CAPABLE — declare a fresh `let` per run so each call
    // re-probes. `document` is injected as a Function param (undefined => the typeof guard trips).
    // eslint-disable-next-line no-new-func
    const fn = new Function("document",
      "let PIXEL_SKIN_CAPABLE = null;\n" + capFnSrc + "\nreturn pixelSkinCapable();");
    return fn(documentShim);
  }
  let threwNoDoc = false, capNoDoc = null;
  try { capNoDoc = runCapable(undefined); } catch(e){ threwNoDoc = true; }
  check("pixelSkinCapable() returns false with NO document, and does not throw", capNoDoc === false && !threwNoDoc);

  const nullCtxDoc = { createElement(){ return { getContext(){ return null; } }; } };
  let threwNullCtx = false, capNullCtx = null;
  try { capNullCtx = runCapable(nullCtxDoc); } catch(e){ threwNullCtx = true; }
  check("pixelSkinCapable() returns false when getContext('2d') is null (jsdom's real degrade), no throw",
    capNullCtx === false && !threwNullCtx);

  const throwingDoc = { createElement(){ return { getContext(){ throw new Error("no 2d backend"); } }; } };
  let threwThrowing = false, capThrowing = null;
  try { capThrowing = runCapable(throwingDoc); } catch(e){ threwThrowing = true; }
  check("pixelSkinCapable() swallows a THROWING getContext (returns false, never propagates)",
    capThrowing === false && !threwThrowing);

  // the real figureMaterialFor's `usePixel = PIXEL_SKIN_ENABLED && pixelSkinCapable()` gate means a
  // headless run NEVER enters the texture branch — confirm the gate + the flat fallback in source.
  check("figureMaterialFor gates the pixel path on pixelSkinCapable() (source guard)",
    /const usePixel = PIXEL_SKIN_ENABLED && pixelSkinCapable\(\);/.test(bootSrc));
  check("figureMaterialFor's non-pixel branch is the exact flat MeshLambertMaterial({color}) path (source guard)",
    /matOpts = \{ color \}; \/\/ pixel-skin off \/ headless — the exact pre-Unit-1 flat path/.test(bootSrc));
}

// ============================================================================
// 5 + 6. albedo floor.
// ============================================================================
console.log("\n=== albedo floor (lift dark, cap bright, preserve hue, pass in-band unchanged) ===");
{
  const dark = 0x2a2430;       // shadow-dark, luminance ~0.15 (below floor)
  const lifted = sandbox.albedoFloor(dark);
  const Ld = sandbox.lumaOf(sandbox.hexToRGB(dark)), Ll = sandbox.lumaOf(sandbox.hexToRGB(lifted));
  // target the intel's own lower bound ("roughly 0.25"); the exact ALBEDO_FLOOR_LUM (0.26) can't be
  // hit precisely after per-channel byte quantization (a uniform scale rounds each channel to an int),
  // so the honest guarantee is "lands in the visible floor band ~0.25", not "exactly 0.26".
  check("a below-floor color is LIFTED into the visible floor band (>= ~0.25) and brighter than before",
    Ll >= 0.25 && Ll > Ld, "before " + Ld.toFixed(3) + " after " + Ll.toFixed(3));
  // hue preserved: the lifted color's channel RATIOS match the original (uniform scale).
  const c0 = sandbox.hexToRGB(dark), c1 = sandbox.hexToRGB(lifted);
  const ratioOk = Math.abs((c1.r / Math.max(1, c1.b)) - (c0.r / Math.max(1, c0.b))) < 0.15;
  check("the lift preserves hue (channel ratios roughly unchanged — a dark red stays red)", ratioOk);

  const inBand = 0x9a7f68;     // flesh-weathered, luminance ~0.52 (in band)
  check("an in-band color is returned UNCHANGED (byte-identical)", sandbox.albedoFloor(inBand) === inBand,
    "in-band color was altered: " + (inBand).toString(16) + " -> " + sandbox.albedoFloor(inBand).toString(16));

  const bright = 0xf5f0e0;     // near-white, above ceil
  const capped = sandbox.albedoFloor(bright);
  check("an above-ceiling color is capped DOWN into the band", sandbox.lumaOf(sandbox.hexToRGB(capped)) <= 0.66 + 0.001);

  const nearBlack = 0x000000;
  const nbFloor = sandbox.albedoFloor(nearBlack);
  check("a near-black color lifts to a neutral floor grey (no divide-by-zero)", sandbox.lumaOf(sandbox.hexToRGB(nbFloor)) >= 0.25);

  // MUTATION (RED then GREEN): an albedo floor that returns everything unchanged must FAIL the lift.
  const mutSb = buildSandbox(makeCanvasDoc(), { mutateAlbedoNoop: true });
  const mutLifted = mutSb.albedoFloor(dark);
  check("MUTATION: a no-op albedo floor FAILS the lift check (proves it's load-bearing)",
    !(sandbox.lumaOf(sandbox.hexToRGB(mutLifted)) >= 0.26 - 0.001 && sandbox.lumaOf(sandbox.hexToRGB(mutLifted)) > Ld),
    "no-op floor still passed the lift check — it is vacuous");
}

console.log("\n" + pass + " passed, " + fail + " failed");
if(fail > 0){ process.exit(1); }
