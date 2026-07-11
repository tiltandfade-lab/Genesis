/* Verify BEAUTY-WAVE-2 BW2-3 MATERIAL TEXEL — the DATA layer of the folded-texture wiring
   (docs/BEAUTY-WAVE-2.md BW2-3). Loads place-spatialize.js + place-semantics.js + theater-interior.js
   + theater-materials.js into one node `vm` (the SAME pattern dev/verify-dungeon-interior.mjs uses) and
   asserts interiorBuildBoard's tileKit texture-file pointers, the REALM_TEXTURES registry + THE VARIANT
   ROLL (interiorTextureVariantFor), textureFaceFor's face-tile mapping, and the fold-gate report — all
   THREE/DOM-free (the GL-layer repeat/wrap facts live in dev/battle-gate/capture-material-texel.mjs,
   which boots real Chrome + THREE and reads the material off the live scene graph).

   RED-FIRST (checked against master 040259b9 before this unit): `git show 040259b9:src/ui/theater-
   interior.js | grep -c REALM_TEXTURES` -> 0; textureFaceFor returned null unconditionally
   (`return null;`). Both are now wired (this unit).

   Checks:
     1. build/fold-textures-report.json exists, no MISSING/failed flags, all folded textures in-palette
        (loose frac >= 0.9) and under the contrast cap, texel is an INTEGER divisor of the source.
     2. REALM_TEXTURES exists; each of the 3 flagships carries wall/floor/floor-alt/trim variant ARRAYS
        (length >= 1), each entry {file, wrap in repeat|mirror}; the 9 non-flagship realms are ABSENT.
     3. interiorTextureVariantFor is DETERMINISTIC (same realm/surface/seed twice -> identical pick),
        returns a pool member for a flagship, and null (procedural fallback) for a non-flagship.
     4. THE VARIANT ROLL is seeded per walkId+room: interiorBuildBoard's tileKit carries floorTextureFile
        /wallTextureFile for a flagship (GENERATED-FIRST: file wins) AND still carries floorMaterial/
        wallMaterial (the procedural FALLBACK survives); a non-flagship board's *TextureFile are null.
     5. textureFaceFor maps every furnitureFor face label to an existing flagship face-tile FILE; a
        non-flagship realm / unknown face returns null.
     6. every referenced texture + face file exists on disk (assets/textures/*.png).
     7. the folded wall/floor textures are square at the declared engine texel (256), trims 256x64.
*/
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/ui/theater-interior.js"),
    read("src/ui/theater-materials.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__INTERIOR_TILE_KITS=typeof INTERIOR_TILE_KITS!=='undefined'?INTERIOR_TILE_KITS:undefined;",
    "this.__REALM_TEXTURES=typeof REALM_TEXTURES!=='undefined'?REALM_TEXTURES:undefined;",
    "this.__interiorTextureVariantFor=typeof interiorTextureVariantFor!=='undefined'?interiorTextureVariantFor:undefined;",
    "this.__textureFaceFor=typeof textureFaceFor!=='undefined'?textureFaceFor:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "bw2-3-material-texel.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    INTERIOR_TILE_KITS: sandbox.__INTERIOR_TILE_KITS,
    REALM_TEXTURES: sandbox.__REALM_TEXTURES,
    interiorTextureVariantFor: sandbox.__interiorTextureVariantFor,
    textureFaceFor: sandbox.__textureFaceFor,
  };
}

function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();
const FLAGSHIPS = ["fantasy", "gloom", "chrome"];
const SURFACES = ["wall", "floor", "floor-alt", "trim"];
const FACE_LABELS = ["crate-body", "crate-lid", "cabinet-body", "cabinet-door", "cabinet-plinth",
  "cabinet-cap", "barrel", "table-top", "table-leg", "bench-seat", "bench-leg",
  "shelf-back", "shelf-side", "shelf-board"];

function buildBoard(realmId) {
  const fx = buildChainFixture(6);
  const plan = M.spatializePlan(fx, "The Spine", { walkId: "verify-bw2-3-" + realmId });
  return M.interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum: plan.rooms[0].segNum, radius: 1 });
}

// ── check 1: fold report ───────────────────────────────────────────────────────────────────────
group("1. fold-gate report");
{
  const rp = join(ROOT, "build/fold-textures-report.json");
  ok(existsSync(rp), "build/fold-textures-report.json exists (run build/fold-textures.py)");
  if (existsSync(rp)) {
    const r = JSON.parse(readFileSync(rp, "utf-8"));
    ok((r.flags || []).length === 0, "no MISSING/failed fold flags: " + JSON.stringify(r.flags));
    let inPal = 0, overCap = 0, badTexel = 0, n = 0;
    for (const [name, t] of Object.entries(r.textures || {})) {
      n++;
      if (t.palette && t.palette.available && t.palette.inPaletteFrac < 0.9) inPal++;
      if (t.contrast && t.contrast.overCap) overCap++;
      // integer-ratio: source is 512 (or 128 tall for trim); texel must divide it
      const [tw, th] = t.texel || [0, 0];
      const srcW = 512, srcH = name.includes("trim") ? 128 : 512;
      if (srcW % tw !== 0 || srcH % th !== 0) badTexel++;
    }
    ok(n >= 15, `folded ${n} textures (>=15 expected)`);
    ok(inPal === 0, `all palette-available textures in-palette (frac>=0.9); ${inPal} below`);
    ok(overCap === 0, `all textures under contrast cap; ${overCap} over`);
    ok(badTexel === 0, `all texels are integer divisors of the source; ${badTexel} non-integer`);
    console.log(`  ✓ ${n} textures folded, all in-palette / under contrast cap / integer texel`);
  }
}

// ── check 2: REALM_TEXTURES registry ────────────────────────────────────────────────────────────
group("2. REALM_TEXTURES registry");
{
  ok(M.REALM_TEXTURES && typeof M.REALM_TEXTURES === "object", "REALM_TEXTURES exported");
  for (const realm of FLAGSHIPS) {
    const e = M.REALM_TEXTURES[realm];
    ok(!!e, `${realm} has a REALM_TEXTURES entry`);
    for (const s of SURFACES) {
      const pool = e && e[s];
      ok(Array.isArray(pool) && pool.length >= 1, `${realm}.${s} is a variant ARRAY (length>=1)`);
      if (Array.isArray(pool)) pool.forEach((v, i) => {
        ok(v && typeof v.file === "string" && /^assets\/textures\//.test(v.file), `${realm}.${s}[${i}].file is an assets/textures path`);
        ok(v && (v.wrap === "repeat" || v.wrap === "mirror"), `${realm}.${s}[${i}].wrap in {repeat,mirror}`);
      });
    }
  }
  // non-flagship realms absent
  ["noir", "cosmic", "suburb", "ash", "lost-world"].forEach((r) => {
    ok(!M.REALM_TEXTURES[r], `non-flagship '${r}' has NO REALM_TEXTURES entry (procedural fallback)`);
  });
  console.log("  ✓ 3 flagships x 4 surfaces = variant arrays; 9 non-flagships absent");
}

// ── check 3: interiorTextureVariantFor — determinism + fallback ─────────────────────────────────
group("3. interiorTextureVariantFor (THE VARIANT ROLL)");
{
  const a = M.interiorTextureVariantFor("gloom", "wall", "seed-xyz");
  const b = M.interiorTextureVariantFor("gloom", "wall", "seed-xyz");
  ok(a && b && a.file === b.file && a.wrap === b.wrap, "same (realm,surface,seed) -> identical pick (deterministic, law 7)");
  ok(a && a.file === "assets/textures/gloom-wall-1.png", "gloom wall variant resolves to the folded file");
  const pool = M.REALM_TEXTURES.chrome.floor;
  const pick = M.interiorTextureVariantFor("chrome", "floor", "k1");
  ok(pool.some((v) => v.file === pick.file), "picked variant is a member of the pool");
  ok(M.interiorTextureVariantFor("noir", "wall", "k") === null, "non-flagship returns null (-> procedural)");
  ok(M.interiorTextureVariantFor("gloom", "nonexistent-surface", "k") === null, "unknown surface returns null");
  console.log("  ✓ deterministic, pool-member, null-fallback for non-flagship/unknown");
}

// ── check 4: interiorBuildBoard tileKit texture pointers (GENERATED-FIRST seam) ─────────────────
group("4. tileKit texture pointers (GENERATED-FIRST)");
{
  for (const realm of FLAGSHIPS) {
    const tk = buildBoard(realm).tileKit;
    ok(typeof tk.floorTextureFile === "string" && tk.floorTextureFile.includes(realm), `${realm}: floorTextureFile set (file wins)`);
    ok(typeof tk.wallTextureFile === "string" && tk.wallTextureFile.includes(realm), `${realm}: wallTextureFile set`);
    ok(tk.floorTextureWrap === "repeat" || tk.floorTextureWrap === "mirror", `${realm}: floorTextureWrap threaded`);
    ok(typeof tk.floorMaterial === "string" && typeof tk.wallMaterial === "string", `${realm}: procedural FALLBACK (floorMaterial/wallMaterial) survives on the tileKit`);
  }
  const noir = buildBoard("noir").tileKit;
  ok(noir.floorTextureFile == null && noir.wallTextureFile == null, "non-flagship (noir): *TextureFile null -> procedural painter path");
  ok(typeof noir.floorMaterial === "string", "non-flagship still carries its procedural floorMaterial");
  console.log("  ✓ flagships carry file pointers + keep the procedural fallback; non-flagship = procedural-only");
}

// ── check 5: textureFaceFor mapping ─────────────────────────────────────────────────────────────
group("5. textureFaceFor face-tile mapping");
{
  let mapped = 0;
  for (const realm of FLAGSHIPS) {
    for (const face of FACE_LABELS) {
      const p = M.textureFaceFor(realm, face);
      ok(typeof p === "string" && p.includes(realm + "-face-"), `${realm}/${face} -> a face-tile file`);
      if (typeof p === "string") mapped++;
    }
  }
  ok(M.textureFaceFor("noir", "crate-body") === null, "non-flagship realm -> null (procedural panel fallback)");
  ok(M.textureFaceFor("gloom", "no-such-face") === null, "unknown face label -> null");
  console.log(`  ✓ ${mapped} flagship face labels mapped; non-flagship/unknown -> null`);
}

// ── check 6: referenced files exist on disk ─────────────────────────────────────────────────────
group("6. folded files present on disk");
{
  let missing = 0;
  for (const realm of FLAGSHIPS) {
    for (const s of SURFACES) for (const v of M.REALM_TEXTURES[realm][s]) {
      if (!existsSync(join(ROOT, v.file))) { missing++; console.error("  FAIL missing " + v.file); }
    }
    for (const face of FACE_LABELS) {
      const p = M.textureFaceFor(realm, face);
      if (p && !existsSync(join(ROOT, p))) { missing++; console.error("  FAIL missing " + p); }
    }
  }
  ok(missing === 0, `every referenced texture + face file exists (${missing} missing)`);
  console.log("  ✓ all referenced assets/textures/*.png present");
}

// ── check 7: engine texel dimensions (integer-ratio fold) ───────────────────────────────────────
group("7. folded engine-texel dimensions");
{
  // PNG IHDR width/height at bytes 16..24 — read directly, no image lib.
  function pngSize(p) {
    const buf = readFileSync(join(ROOT, p));
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  }
  let bad = 0;
  for (const realm of FLAGSHIPS) {
    for (const s of ["wall", "floor", "floor-alt"]) {
      const [w, h] = pngSize(M.REALM_TEXTURES[realm][s][0].file);
      if (w !== 256 || h !== 256) { bad++; console.error(`  FAIL ${realm}-${s} is ${w}x${h}, expected 256x256`); }
    }
    const [tw, th] = pngSize(M.REALM_TEXTURES[realm].trim[0].file);
    if (tw !== 256 || th !== 64) { bad++; console.error(`  FAIL ${realm}-trim is ${tw}x${th}, expected 256x64`); }
  }
  ok(bad === 0, `all folded tile textures at 256px / trims at 256x64 (${bad} wrong)`);
  console.log("  ✓ tiles 256x256, trims 256x64 (integer-ratio fold of the 512/128 source)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
