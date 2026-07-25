/* Verify BW2-1b — THE OCCLUSION LAW (docs/BEAUTY-WAVE-2.md unit BW2-1b) + the mid-flight CLIP MARGIN
   addendum ("the sprites shouldn't clip through geometry" — Adam, live). Mock target:
   ui-sketches/mock-frames/mock-01-gloom-combat.png — no prism ever eats a character.

   PART A (checks 1-20, jsdom + vendored THREE subprocess, dev/verify-bw2-2-floor-contact.mjs's own
   established pattern for this sealed ES-module file) — the PURE GEOMETRY, exercised without a live
   WebGLRenderer:
     1-6   segment-vs-AABB (itrSegmentIntersectsAabb) + the per-pillar cutaway mask
           (itrPillarCutawayMask) — RED-FIRST: a full-height pillar sitting on a camera->standee
           sightline DOES intersect (today's bug, reproduced directly); GREEN: the SAME segment
           against the STUBBED box (itrPillarStubHeight) no longer intersects — the stub genuinely
           clears the sightline, not just relabels it.
     10-16 circle-vs-AABB clip-margin push (itrClipNudgeFor) — a standee/card footprint overlapping a
           nearby wall/pillar box nudges away by the exact overlap, clamped to 30% of a cell with a
           qa:sprite-oversize report when the clamp bites, dressing's own wall-face+epsilon variant.

   PART B (checks 30-39, live Chrome + puppeteer-core, dev/verify-interior-camera-frustum.mjs's own
   server/Chrome-boot conventions) — the INTEGRATION proof against the REAL renderer:
     30    RED-FIRST: a hand-built board (no cutaway fix reachable — this proves the OLD, pre-unit
           geometry the same scene would have rendered) — reproduced via the pure PART A math against
           the board's own raw (un-stubbed) pillar instance, since the live mount ALWAYS runs the fix
           (there's no live product toggle to disable it, same discipline BW2-2's own red-first section
           already keeps: the burial arithmetic is re-derived, not a live A/B).
     31    GREEN: a controlled scene (known pillar cell directly on the default camera's sightline to a
           known standee cell) — a real THREE.Raycaster (_interiorRaycastClearForTest) confirms ZERO
           occlusion after the real mount.
     32    100 SEEDED real dungeon combat fits (spatializePlan -> semanticizePlan -> dressPlan ->
           interiorBuildBoard, varying walkId) — zero occluded standees across all of them (raycast
           assert), stub/full-height mix confirmed genuinely varies (not a law that never fires).
     33    stub restores when the sightline clears (move the standee away, rebuild — the SAME pillar's
           own instance list entry reports full height again).
     34    budget unchanged (S.interiorMeshCount + the pillar instance list's own length, both stable
           across occluded vs. clear boards — no second draw call ever added).
     35    determinism (same seed -> byte-identical pillar list + occlusion outcome).
     36    CLIP MARGIN LAW, live: a deliberately oversized/adjacent standee no longer overlaps its
           neighboring wall/pillar box post-mount (quad-AABB overlap check), across the same 100 seeds.

   Run:  node dev/verify-bw2-1b-occlusion.mjs               (PART A only)
         node dev/verify-bw2-1b-occlusion.mjs --with-render (PART A + PART B) */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

// ============================================================================
// shims (verbatim convention, dev/verify-bw2-2-floor-contact.mjs's own ensureThreeShim/ensureJsdomShim)
// ============================================================================
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
function ensureThreeShim(){
  const base = join(ROOT, "node_modules", "three");
  const loaderDir = join(base, "addons", "loaders");
  // BEAUTY-WAVE-3 BW3-0 (THE COMPOSER SEAM) — same shim-completeness fix as dev/verify-dungeon-
  // interior.mjs / dev/verify-theater-sprites.mjs / dev/verify-bw2-2-floor-contact.mjs's own
  // ensureThreeShim: theater-boot.js now also imports EffectComposer/RenderPass/ShaderPass from
  // "three/addons/postprocessing/", which the ORIGINAL early-return (`if package.json exists,
  // return`) would never add on a shim an earlier-running verify-*.mjs already wrote. A version
  // marker forces a re-write when the shim's own contents are stale.
  const postDir = join(base, "addons", "postprocessing");
  const shimVersion = "cp1-env-ao"; // visual-correction Checkpoint 1: +GTAOPass/+GTAOShader/+PoissonDenoiseShader/+SimplexNoise (lockstep across all shim writers sharing node_modules/three)
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
  } catch(e){
    mkdirSync(target, { recursive: true });
    const pkg = JSON.parse(readFileSync(join(real, "package.json"), "utf-8"));
    writeFileSync(join(target, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { main: join(real, pkg.main || "lib/api.js") }), null, 2));
  }
}
ensureThreeShim();
ensureJsdomShim();

const REGISTRY = {
  "bw2-1b-medium": { realm: "gloom", kind: "monster", name: "BW2-1b Medium", size: "Medium", status: "cut", scaleTrue: 1.0, floor: 0 },
  "bw2-1b-large":  { realm: "gloom", kind: "monster", name: "BW2-1b Large",  size: "Large",  status: "cut", scaleTrue: 1.6, floor: 0 },
};

function runScenario(runnerSrc, extraArgs){
  const tag = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const runnerPath = join(ROOT, "dev", `.verify-bw2-1b-runner-${tag}.mjs`);
  writeFileSync(runnerPath, runnerSrc);
  try {
    const out = execFileSync("node", [runnerPath, join(ROOT, "src", "ui", "theater-boot.js"), JSON.stringify(REGISTRY), ...extraArgs], {
      cwd: ROOT, encoding: "utf-8", timeout: 30000,
    });
    const lastLine = out.trim().split("\n").pop();
    return JSON.parse(lastLine);
  } finally {
    rmSync(runnerPath, { force: true });
  }
}

// ============================================================================
// PART A — pure geometry (jsdom import only, no WebGL/GPU needed)
// ============================================================================
const OCCLUSION_RUNNER = `
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
const bootPath = process.argv[2];
const registry = JSON.parse(process.argv[3]);
const dom = new JSDOM(\`<!doctype html><html><body><div id="stage" style="width:400px;height:300px"></div></body></html>\`, { runScripts: "dangerously", url: "http://localhost/" });
global.window = dom.window; global.document = dom.window.document;
global.SPRITE_REGISTRY = registry; global.window.SPRITE_REGISTRY = registry;
function fakeTexture(){ return { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } }; }
const result = { ok: false, error: null };
try {
  await import(pathToFileURL(bootPath).href);
  const T = global.window.Theater;
  const law = T._occlusionLawForTest;
  const floorContact = T._floorContactLawForTest;

  // ── RED-FIRST: camera at (0,3,6) looking toward origin; a FULL-HEIGHT pillar box straddles
  // x in [-0.5,0.5], y in [-0.5,1.9] (sy=2.4, the wall-height-base default), z in [-0.5,0.5] — sitting
  // dead-center on the segment from the camera to a standee at (0, 0.75, -6) (torso height ~0.75 above
  // the floor plane -0.5, well within the pillar's own y-range). This is EXACTLY "loop-03's knight
  // behind a pillar" reproduced as pure numbers — the bug this unit fixes, proven to exist BEFORE any
  // fix logic runs (itrSegmentIntersectsAabb is the same primitive interiorBuildInstancedMesh's own
  // math for the identical box would use).
  const cameraPos = { x: 0, y: 3, z: 6 };
  const standeeTarget = { x: 0, y: 0.75, z: -6 };
  const fullHeightBox = { boxMin: { x: -0.5, y: -0.5, z: -0.5 }, boxMax: { x: 0.5, y: 1.9, z: 0.5 } };
  result.redFirstIntersects = law.itrSegmentIntersectsAabb(cameraPos, standeeTarget, fullHeightBox.boxMin, fullHeightBox.boxMax);

  // GREEN: the SAME pillar, stubbed to itrPillarStubHeight's parapet height (wallHeightBase=2.4) —
  // its own box top drops to (stubH - 0.5) — no longer reaches the standee's torso y=0.75.
  const stubH = law.itrPillarStubHeight(2.4);
  const stubbedBox = { boxMin: { x: -0.5, y: -0.5, z: -0.5 }, boxMax: { x: 0.5, y: stubH - 0.5, z: 0.5 } };
  result.stubHeight = stubH;
  // STAGE-A A4: the live named const itself (ITR_OCCLUSION_STEM_HEIGHT_U), so the harness's own
  // assertion never hardcodes a duplicate number that could silently drift from production.
  result.stemHeightConst = law.ITR_OCCLUSION_STEM_HEIGHT_U;
  result.stubClearsSightline = !law.itrSegmentIntersectsAabb(cameraPos, standeeTarget, stubbedBox.boxMin, stubbedBox.boxMax);

  // itrPillarCutawayMask end-to-end: one pillar instance (raw cell coords x=0,z=0,sy=2.4, matching
  // the full-height box above once mounted with cx=0,cz=0) + one sight point at the standee target —
  // must flag index 0 as occluding.
  const pillarList = [ { x: 0, z: 0, sx: 1, sy: 2.4, sz: 1 } ];
  result.maskFlagsOccluder = law.itrPillarCutawayMask(pillarList, cameraPos, [standeeTarget], 0, 0);

  // negative control: the SAME pillar, but the standee moved far off to the side (x=8) — sightline no
  // longer passes anywhere near the pillar box. The mask must NOT flag it (never a false positive that
  // would stub every pillar in a room regardless of actual occlusion).
  result.maskClearsOffToSide = law.itrPillarCutawayMask(pillarList, cameraPos, [{ x: 8, y: 0.75, z: -6 }], 0, 0);

  // itrPieceSightPoints: resolves a registered slug's real scaleTrue height, degrades a scaleVsHuman
  // override for an unregistered slug, both against a real floorTopMap (BW2-2's own law). Two pieces
  // share EACH cell (a scaleTrue=1.0 baseline alongside the one under test) so the ratio of their own
  // (sightY - contactY) heights can be checked against the expected scale ratio WITHOUT this harness
  // needing to know HUMAN_TRUE_HEIGHT's own numeric value independently.
  const floorTopMap = floorContact.interiorFloorTopMapFrom([ { x: 2, z: 3, sy: 0.2 } ]);
  const pts = law.itrPieceSightPoints([
    { slug: "bw2-1b-large", cellX: 2, cellY: 3 },           // scaleTrue 1.6 (registered)
    { slug: "bw2-1b-medium", cellX: 2, cellY: 3 },          // scaleTrue 1.0 baseline, SAME cell
    { slug: "unregistered-slug", cellX: 5, cellY: 5, scaleVsHuman: 1.4 }, // unregistered -> scaleVsHuman fallback
    { slug: "bw2-1b-medium", cellX: 5, cellY: 5 },          // scaleTrue 1.0 baseline, SAME cell as the unregistered one
  ], 0, 0, floorTopMap);
  result.sightPointCount = pts.length;
  result.contactY23 = floorContact.interiorStandeeContactY(floorContact.interiorFloorTopAt(floorTopMap, 2, 3));
  result.contactY55 = floorContact.interiorStandeeContactY(floorContact.interiorFloorTopAt(floorTopMap, 5, 5));
  result.sightPointLarge = pts[0];
  result.sightPointMediumAt23 = pts[1];
  result.sightPointUnregistered = pts[2];
  result.sightPointMediumAt55 = pts[3];

  // ── CLIP MARGIN LAW pure geometry ──
  const clip = T._clipMarginLawForTest;
  // a standee at (5,5) radius 0.6 (a Large-ish sprite) with a wall cell immediately adjacent at
  // (5.9,5) (sx=1 -> box [5.4,6.4]) — footprint circle [4.4,5.6] on X overlaps the wall box [5.4,6.4]
  // by exactly 0.2 (5.6-5.4). Push must be AWAY from the wall (negative X) with magnitude 0.2.
  const wallBoxList = [ { x: 5.9, z: 5, sx: 1, sy: 2.4, sz: 1 } ];
  const nudge = clip.itrClipNudgeFor(5, 5, 0.6, [wallBoxList]);
  result.clipNudge = nudge;

  // clamp case: a MUCH deeper overlap (radius 2.0 against the same wall) needs a push > 0.3 — must
  // clamp to CLIP_NUDGE_MAX_FRAC and report clamped=true (the qa:sprite-oversize trigger condition).
  const bigNudge = clip.itrClipNudgeFor(5, 5, 2.0, [wallBoxList]);
  result.bigNudge = bigNudge;
  result.CLIP_NUDGE_MAX_FRAC = clip.CLIP_NUDGE_MAX_FRAC;

  // no-overlap case: a standee far from any wall — zero nudge, not even a tiny nonzero jitter.
  const noNudge = clip.itrClipNudgeFor(0, 0, 0.6, [wallBoxList]);
  result.noNudge = noNudge;

  // dressing epsilon variant: a large card (radius 0.8+eps) exactly wall-adjacent (dpAdjacentToWall's
  // own 1-cell convention) — resolves to a small, non-clamped push that leaves eps clearance.
  const cardNudge = clip.itrClipNudgeFor(5, 5, 0.8 + clip.CLIP_DRESSING_EPSILON, [wallBoxList], { maxMag: 1 });
  result.cardNudge = cardNudge;
  result.CLIP_DRESSING_EPSILON = clip.CLIP_DRESSING_EPSILON;

  // interiorBuildPieces/interiorBuildDressing wiring — the nudge actually reaches the mounted position.
  T._spriteTextureCache["bw2-1b-large"] = fakeTexture();
  T._spriteTextureCache["bw2-1b-medium"] = fakeTexture();
  const builtPieces = T._interiorBuildPiecesForTest(
    [ { slug: "bw2-1b-large", cellX: 5, cellY: 5 } ], 0, 0, 2.4, floorTopMap, "#7a6a55", [wallBoxList]
  );
  const mountedFig = builtPieces.group.children.find((g) => g.userData && g.userData.interiorTrueScale);
  result.mountedFigX = mountedFig.position.x;
  result.mountedFigZ = mountedFig.position.z;
  // INTEGRATION-MERGE: the mount composes kilter (BW2-2b) + clip nudge, and production tests the
  // nudge AT the kiltered position — re-derive both through the same production seams (kilter seed =
  // slug+":"+cellX+","+cellY, interiorBuildPieces' own convention).
  result.kilter = T._kilterForTest("bw2-1b-large:5,5");
  result.expectedNudgeForBuiltWidth = clip.itrClipNudgeFor(5 + result.kilter.dx, 5 + result.kilter.dz, mountedFig.userData.interiorWidth * 0.5, [wallBoxList]);

  result.ok = true;
} catch(e){ result.error = String((e && e.stack) || e); }
process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

group('1 — RED-FIRST: a full-height pillar DOES intersect a real camera->standee sightline (reproduces "loop-03\'s knight behind a pillar" as pure numbers, proving the check is load-bearing before trusting any green)');
let A = null;
{
  const r = runScenario(OCCLUSION_RUNNER, []);
  if(!r.ok){ fail++; console.error("  FAIL: PART A scenario threw: " + r.error); }
  else {
    A = r;
    ok(r.redFirstIntersects === true, "full-height pillar box intersects the camera->standee segment (the bug, reproduced)");
  }
}

group("2 — GREEN: the SAME pillar stubbed to itrPillarStubHeight's parapet height no longer intersects — the fix genuinely clears the sightline, not just relabels the instance");
// S-1 UPDATE (docs/DIEGETIC-LIGHT.md; Adam's live steer 2026-07-11): ITR_PILLAR_STUB_FRAC lowered
// 0.3 -> 0.12 (the KNEE -> ANKLE rename in theater-boot.js) because the OLD 0.72 knee never actually
// cleared a realistic torso-height sight point (itrPieceSightPoints' own contactY + height*0.5 sits
// well above 0.72 for a human-scale standee) — this is the exact "columns and walls still obscure
// figures" bug S-1 fixes, not a re-derivation of the same claim under a new number.
// STAGE-A A4 UPDATE (docs/STAGE-A.md §A4, 2026-07-12): itrPillarStubHeight now returns a FLAT
// absolute world-unit constant (ITR_OCCLUSION_STEM_HEIGHT_U, 0.12-0.25u band) instead of
// wallHeightBase*ITR_PILLAR_STUB_FRAC (0.288 — just outside that band) — see theater-boot.js's own
// header comment on that const for why a flat constant is the identical practical effect with a
// cleaner number. This assertion reads the constant LIVE (never a duplicated hardcoded number) so it
// can never drift from production again.
if(A){
  const expectedStub = A.stemHeightConst != null ? A.stemHeightConst : 0.18;
  ok(A.stubClearsSightline === true, `stub height ${A.stubHeight} (ITR_OCCLUSION_STEM_HEIGHT_U, the A4 ankle) clears the sightline that the full-height (sy=2.4) box blocked`);
  ok(Math.abs(A.stubHeight - expectedStub) < 1e-9, `stub height is exactly ITR_OCCLUSION_STEM_HEIGHT_U (read live off production, ${expectedStub}) = ${A.stubHeight}`);
}

group("3 — GREEN: itrPillarCutawayMask flags the real occluding pillar instance, and does NOT flag it against an unrelated sightline (no false-positive stubbing of every pillar in a room)");
if(A){
  ok(Array.isArray(A.maskFlagsOccluder) && A.maskFlagsOccluder[0] === true, "pillar instance flagged true for the standee directly behind it");
  ok(Array.isArray(A.maskClearsOffToSide) && A.maskClearsOffToSide[0] === false, "the SAME pillar instance flagged false once the standee moves off the sightline");
}

group("4 — itrPieceSightPoints resolves real per-piece height (registered scaleTrue, or an unregistered slug's scaleVsHuman override) off the SAME floor-contact law BW2-2 established");
if(A){
  ok(A.sightPointCount === 4, `4 pieces in -> 4 sight points out (${A.sightPointCount})`);
  ok(A.sightPointLarge.x === 2 && A.sightPointLarge.z === 3, "large piece sight point sits at its own cell (2,3) in the cx=0/cz=0 shifted frame");
  ok(A.sightPointUnregistered.x === 5 && A.sightPointUnregistered.z === 5, "unregistered-slug sight point still resolves a position off cellX/cellY");
  // ratio check (independent of HUMAN_TRUE_HEIGHT's own numeric value): registered scaleTrue=1.6
  // large vs. the scaleTrue=1.0 medium baseline AT THE SAME CELL must read exactly 1.6x the torso
  // half-height above the SAME contactY.
  const largeHalfHeight = A.sightPointLarge.y - A.contactY23;
  const mediumHalfHeight23 = A.sightPointMediumAt23.y - A.contactY23;
  ok(mediumHalfHeight23 > 0, `medium baseline half-height above contact (${mediumHalfHeight23}) is positive`);
  ok(Math.abs(largeHalfHeight / mediumHalfHeight23 - 1.6) < 1e-6, `large/medium half-height ratio (${(largeHalfHeight / mediumHalfHeight23).toFixed(4)}) === registered scaleTrue ratio 1.6`);
  // unregistered slug (scaleVsHuman override 1.4) vs. the SAME medium baseline at its own shared cell.
  const unregHalfHeight = A.sightPointUnregistered.y - A.contactY55;
  const mediumHalfHeight55 = A.sightPointMediumAt55.y - A.contactY55;
  ok(mediumHalfHeight55 > 0, `medium baseline half-height above contact (${mediumHalfHeight55}) is positive`);
  ok(Math.abs(unregHalfHeight / mediumHalfHeight55 - 1.4) < 1e-6, `unregistered/medium half-height ratio (${(unregHalfHeight / mediumHalfHeight55).toFixed(4)}) === its own scaleVsHuman fallback 1.4 — never throws/NaNs on an unresolved slug`);
}

group("10 — CLIP MARGIN: circle-vs-AABB push resolves the exact overlap, direction away from the wall");
if(A){
  ok(Math.abs(A.clipNudge.rawMagnitude - 0.2) < 1e-9, `overlap magnitude ${A.clipNudge.rawMagnitude} matches the hand-derived 0.2 (footprint edge 5.6 vs wall face 5.4)`);
  ok(A.clipNudge.x < 0, `push is in -X (away from the wall at +X), got dx=${A.clipNudge.x}`);
  ok(A.clipNudge.clamped === false, "a 0.2 overlap stays under the 0.3 clamp — unclamped");
}

group("11 — CLIP MARGIN: an overlap deep enough to need >30% of a cell clamps to CLIP_NUDGE_MAX_FRAC and reports clamped=true (the qa:sprite-oversize trigger)");
if(A){
  ok(A.bigNudge.rawMagnitude > A.CLIP_NUDGE_MAX_FRAC, `raw overlap (${A.bigNudge.rawMagnitude}) exceeds the 0.3 cap before clamping`);
  ok(Math.abs(A.bigNudge.magnitude - A.CLIP_NUDGE_MAX_FRAC) < 1e-9, `clamped magnitude (${A.bigNudge.magnitude}) === CLIP_NUDGE_MAX_FRAC (${A.CLIP_NUDGE_MAX_FRAC})`);
  ok(A.bigNudge.clamped === true, 'clamped flag set true — the mount-time console.warn("qa: sprite-oversize") path is reachable');
}

group("12 — CLIP MARGIN: no overlap -> zero nudge (never a spurious jitter on a standee that's actually clear)");
if(A){
  ok(A.noNudge.magnitude === 0 && A.noNudge.x === 0 && A.noNudge.z === 0, "zero nudge for a standee far from any prism");
}

group("13 — CLIP MARGIN, dressing epsilon: a large card exactly wall-adjacent resolves a small push that leaves CLIP_DRESSING_EPSILON clearance, never clamped for a construction-legal wall-adjacent placement");
if(A){
  ok(A.cardNudge.magnitude > 0, `card nudge is nonzero (${A.cardNudge.magnitude}) — the card WOULD poke through without it`);
  ok(A.cardNudge.clamped === false, "a legitimately wall-adjacent card's own overlap never needs the 1.0 safety cap");
}

group("14 — WIRING: interiorBuildPieces actually applies the nudge to the mounted standee's position (not just proven in isolation)");
if(A){
  // INTEGRATION-MERGE RESCOPE (red-first: went red when BW2-2b's KILTER landed — the mount is now
  // cell + kilter + nudge, and the nudge itself is tested AT the kiltered position; the 0.04-class
  // delta this check caught was the kilter working, not the nudge failing). The expected position
  // re-derives the same seeded kilter via the production seam.
  const kilt = A.kilter || { dx: 0, dz: 0 };
  const expected = A.expectedNudgeForBuiltWidth;
  ok(Math.abs(A.mountedFigX - (5 + kilt.dx + expected.x)) < 1e-9, `mounted fig X (${A.mountedFigX}) === cellX(5) + kilter.dx (${kilt.dx}) + nudge.x (${expected.x})`);
  ok(Math.abs(A.mountedFigZ - (5 + kilt.dz + expected.z)) < 1e-9, `mounted fig Z (${A.mountedFigZ}) === cellY(5) + kilter.dz (${kilt.dz}) + nudge.z (${expected.z})`);
  ok(expected.x !== 0 || expected.z !== 0, "a Large sprite mounted hard against a wall cell DOES get a nonzero nudge (the fix actually fires end-to-end)");
}

// ============================================================================
// PART B — live Chrome integration (real THREE.Raycaster against the real mounted geometry)
// ============================================================================
async function runRenderChecks(){
  const { createRequire } = await import("node:module");
  const { spawn } = await import("node:child_process");
  const net = await import("node:net");
  const require = createRequire(import.meta.url);
  let puppeteer;
  try {
    puppeteer = require(join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
  } catch(e){
    fail++; console.error("  FAIL: puppeteer-core not available at ~/.genesis-jsdom — cannot run the live-Chrome render checks");
    return;
  }
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function portInUse(port){
    return new Promise((resolve) => {
      const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
      sock.on("error", () => resolve(false));
      sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
    });
  }
  async function probeRoot(port){
    try {
      const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
      if(!r.ok) return false;
      const body = await r.text();
      return body.includes("Genesis");
    } catch(e){ return false; }
  }
  async function startServer(){
    for(const port of PORT_CANDIDATES){
      if(await portInUse(port)){ if(await probeRoot(port)) return { proc: null, port }; continue; }
      const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
      for(let i = 0; i < 40; i++){
        if(await portInUse(port)){ if(await probeRoot(port)) return { proc, port }; break; }
        await sleep(150);
      }
      try { proc.kill("SIGTERM"); } catch(e){}
    }
    throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
  }

  let server = null, browser = null;
  try {
    server = await startServer();
    const BASE = `http://127.0.0.1:${server.port}`;
    const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
    browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
    for(let i = 0; i < 40; i++){
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"));
      if(ready) break;
      await sleep(150);
    }
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    // CAMERA-TWEEN SETTLE (DOORFRAME-OCCLUSION FIX addendum, found live re-gating checks 31/32/35 —
    // dev/verify-occlusion-fade.mjs's own established convention, copied verbatim): BEAUTY-WAVE-4.md
    // MF-1 landed AFTER this harness's own PART B was first authored (this file targets BEAUTY-WAVE-2's
    // BW2-1b) — setInteriorBoard's camera fit now GLIDES (280-350ms) from wherever the camera WAS to
    // the new fit's target, via placeCameraTweened; S.camera.position sits at the START pose (not the
    // fitted END pose) until that tween's own onUpdate ticks settle it. Every check below used to read
    // pillarList/pieces/raycasts SYNCHRONOUSLY, in the SAME page.evaluate as setInteriorBoard itself —
    // meaning every raycast ran against a STALE, pre-tween camera angle, not the one occlusion classify
    // itself used (which correctly reads the settled/target position via its own PREVIEW placeCamera()
    // call, S.occlusionClassifyBearingDeg's own header). Confirmed live (this fix's own report): for a
    // "beat" fit spanning 4 far corners, the stale start pose and the settled target pose are far enough
    // apart that a marginal occluder (a doorframe arch-header prism) reads AS occluding from the stale
    // angle but NOT from the settled one that occlusion classify correctly used to decide it needed no
    // fade at all — the raycast was proving something that was never true of the settled frame the
    // player actually sees. `settleCameraTween` runs after every `setInteriorBoard` call below.
    async function settleCameraTween(){
      await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
    }

    const mounted = await page.evaluate((registry) => {
      const el = document.createElement("div");
      el.style.width = "1200px"; el.style.height = "900px";
      document.body.appendChild(el);
      const ok = !!window.Theater.mount(el);
      // extend the REAL (const-bound, but mutable OBJECT) SPRITE_REGISTRY with synthetic test entries
      // — never touching the thousands of real cut entries already loaded (dev/verify-bw2-2-floor-
      // contact.mjs's own runRenderCheck established this exact convention) — and stub their texture
      // cache entries so interiorSpriteBillboard resolves without a network image round-trip.
      // NOTE: SPRITE_REGISTRY is a bare classic-script global (top-level `const` never attaches to
      // `window`, this codebase's own documented convention — src/ui/theater-interior.js's header),
      // reachable here as a plain identifier because page.evaluate's function body runs in the SAME
      // page global scope theater-boot.js's own bare `SPRITE_REGISTRY` reads already resolve against.
      Object.keys(registry).forEach((slug) => {
        SPRITE_REGISTRY[slug] = registry[slug];
        window.Theater._spriteTextureCache[slug] = { magFilter: null, minFilter: null, generateMipmaps: true, isTexture: true, image: { width: 100, height: 200 } };
      });
      return ok;
    }, {
      "bw2-1b-large": { realm: "gloom", kind: "monster", name: "BW2-1b Large", status: "cut", scaleTrue: 1.6, size: "Large", floor: 0 },
      "bw2-1b-medium": { realm: "gloom", kind: "monster", name: "BW2-1b Medium", status: "cut", scaleTrue: 1.0, size: "Medium", floor: 0 },
    });
    if(!mounted){ fail++; console.error("  FAIL: Theater.mount failed"); return; }

    group("30 — RED-FIRST (re-derivation, live-Chrome numbers): the SAME hand-built full-height-pillar scene PART A already proved intersects, using this LIVE page's own itrSegmentIntersectsAabb — confirms the pure math checked above is the SAME code path the live mount calls (not a fork)");
    const redLive = await page.evaluate(() => {
      const law = window.Theater._occlusionLawForTest;
      const cameraPos = { x: 0, y: 3, z: 6 }, standeeTarget = { x: 0, y: 0.75, z: -6 };
      return law.itrSegmentIntersectsAabb(cameraPos, standeeTarget, { x: -0.5, y: -0.5, z: -0.5 }, { x: 0.5, y: 1.9, z: 0.5 });
    });
    ok(redLive === true, "live-page itrSegmentIntersectsAabb reproduces the same red-first intersection as the subprocess check");

    // controlled scene: a 2-room chain via the real dungeon generators, focused on the first room
    // (guaranteed to earn corner pillars per ITR_PILLAR_MIN_DIM if it's >=6x6 — sized explicitly below
    // via a big enough fixture so at least one room clears that floor), pieces placed at each of the
    // room's 4 corners (the SAME corners a pillar mounts at, per theater-interior.js's own
    // itrBuildKeepGrid corner-pillar loop) — guaranteeing the pre-unit geometry WOULD have a standee
    // sitting close enough to its own room's pillar for at least one seed's default camera yaw to graze
    // it, without hand-fabricating the plan.
    function buildFixture(n){
      const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
      const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
      const adj = {}; ids.forEach((id) => { adj[id] = []; });
      edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
      const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
      while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
      return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
    }

    async function buildSeededScene(seed){
      await page.evaluate((walkId) => {
        function buildFixture(n){
          const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
          const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
          const adj = {}; ids.forEach((id) => { adj[id] = []; });
          edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
          const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
          while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
          return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
        }
        const REALMS = ["gloom", "fantasy", "chrome"];
        const realmId = REALMS[Math.abs(Array.from(walkId).reduce((a, c) => a + c.charCodeAt(0), 0)) % REALMS.length];
        const fixture = buildFixture(16);
        const plan0 = spatializePlan(fixture, "The Spine", { walkId });
        const plan1 = semanticizePlan(plan0, fixture, []);
        // biggest room in this fixture — big enough to clear ITR_PILLAR_MIN_DIM(6) so it actually
        // earns corner pillars (a room too small never has any pillar to test against at all).
        const room = plan1.rooms.reduce((a, b) => (a.w * a.d > b.w * b.d ? a : b));
        const plan2 = dressPlan(plan1, { realmId, walkId });
        const board = interiorBuildBoard(plan2, { realmId, env: "dungeon", focusSegNum: room.segNum, radius: 1 });
        board.lightProfile = "torchlit";
        // 4 pieces at the room's OWN 4 corner cells (one cell in from each edge — the exact cells
        // theater-interior.js's own itrBuildBoard corner-pillar loop plants a pillar at, when the room
        // clears ITR_PILLAR_MIN_DIM) — a mixed roster (one Large, rest Medium) so the CLIP MARGIN sweep
        // (check 36) also gets a wide sprite standing right where a pillar would otherwise be.
        const corners = [
          { x: room.x + 1, y: room.y + 1 }, { x: room.x + room.w - 2, y: room.y + 1 },
          { x: room.x + 1, y: room.y + room.d - 2 }, { x: room.x + room.w - 2, y: room.y + room.d - 2 },
        ];
        const slugs = ["bw2-1b-large", "bw2-1b-medium", "bw2-1b-medium", "bw2-1b-medium"];
        board.pieces = corners.map((c, i) => ({ slug: slugs[i], cellX: c.x, cellY: c.y }));
        board.cameraFit = { mode: "beat", cells: corners.map((c) => ({ x: c.x, y: c.y })) };
        window.Theater.setInteriorBoard(board);
        window.__bw2RoomWD = room.w * room.d; // stashed for the settled read below (see settleCameraTween's own header)
      }, seed);
      // CAMERA-TWEEN SETTLE — see this function's own header above; the camera fit GLIDES, so every
      // read below must happen AFTER it settles, not in the same synchronous evaluate as the fit call.
      await settleCameraTween();
      return await page.evaluate(() => {
        const pillarList = window.Theater._interiorPillarListForTest();
        const pieces = window.Theater.interiorPiecesWorldPositions();
        const raycasts = pieces.map((p) => window.Theater._interiorRaycastClearForTest({ x: p.x, y: p.y + p.height * 0.5, z: p.z }));
        const meshCount = window.Theater.interiorMeshCount();
        // DOORFRAME-OCCLUSION FIX addendum (check 34's own budget comparison): a doorframe (or wall/
        // pillar) ghost overlay is a REAL, intentional extra draw call — built ONLY while at least one
        // instance of that kind is actually occluding a figure THIS frame (S-1 OCCLUSION FADE's own
        // header comment in theater-boot.js) — so "occupied" and "cleared" (zero pieces, zero sight
        // points, guaranteed zero ghosts) legitimately differ by however many ghost KINDS fired, not by
        // zero. Exposed here (never asserted against in THIS group — check 34 below does the arithmetic)
        // so a harness can tell "budget grew because occlusion legitimately fired" apart from "budget
        // grew for no reason".
        const activeGhostKinds = [
          window.Theater._interiorWallGhostListForTest().length > 0,
          window.Theater._interiorPillarGhostListForTest().length > 0,
          window.Theater._interiorDoorGhostListForTest().length > 0,
        ].filter(Boolean).length;
        // quad-AABB overlap check (CLIP MARGIN, check 36): none of the mounted pieces' own footprint
        // circle should still overlap a nearby wall/pillar box post-nudge.
        const clip = window.Theater._clipMarginLawForTest;
        const wallAndPillar = [ pillarList, [] ]; // wallList isn't separately exposed; pillarList alone already exercises the corner-adjacency case this fixture targets
        const overlaps = pieces.map((p) => {
          const push = clip.itrClipNudgeFor(p.x, p.z, p.width * 0.5, wallAndPillar);
          return push.magnitude; // post-mount position re-tested — should already read ~0 (the mount itself applied the resolving nudge)
        });
        return {
          ok: true, roomWD: window.__bw2RoomWD, pillarCount: pillarList.length,
          pillarHeights: pillarList.map((p) => p.sy),
          raycasts, meshCount, pieceCount: pieces.length, overlaps, activeGhostKinds,
        };
      });
    }

    group("31 — GREEN: a controlled real-dungeon scene (pieces at the room's own 4 pillar corners) mounts with ZERO occluded standees (real THREE.Raycaster)");
    const scene0 = await buildSeededScene("bw2-1b-occlusion-seed-0");
    ok(scene0.ok, "scene built + mounted");
    if(scene0.ok){
      ok(scene0.pieceCount === 4, `4 pieces mounted (${scene0.pieceCount})`);
      const occluded = scene0.raycasts.filter((r) => r && r.clear === false);
      ok(occluded.length === 0, `0 of ${scene0.raycasts.length} standees occluded — ${JSON.stringify(occluded)}`);
    }

    group("32 — 100 SEEDED real dungeon combat fits: zero occluded standees across every seed (raycast assert), and the stub law genuinely FIRES on at least some of them (not dead code)");
    let totalOccluded = 0, totalPieces = 0, anyStub = false, anyFullHeight = false;
    const seedResults = [];
    for(let i = 0; i < 100; i++){
      const scene = await buildSeededScene(`bw2-1b-seed-${i}`);
      seedResults.push(scene);
      if(!scene.ok) continue;
      totalPieces += scene.raycasts.length;
      totalOccluded += scene.raycasts.filter((r) => r && r.clear === false).length;
      scene.pillarHeights.forEach((h) => {
        if(h <= 0.72 + 1e-6 && scene.pillarCount) anyStub = true;
        if(h > 0.72 + 1e-6) anyFullHeight = true;
      });
    }
    ok(seedResults.every((s) => s.ok), "all 100 seeded scenes built + mounted without error");
    ok(totalPieces === 400, `all 400 (100 seeds x 4 pieces) standees actually RESOLVED and mounted (${totalPieces}) — a non-vacuous check (an unresolved piece never reaches the raycast at all)`);
    ok(totalOccluded === 0, `0 of ${totalPieces} mounted standees (across 100 seeds) report a raycast occlusion`);
    // NON-ASSERTED seed-set signals (the SELECTIVITY assertion moved to the constructed control in 32b
    // below — see its header for why the old `anyFullHeight` assertion here was UNSOUND for this seed
    // set). Reported for visibility, not gated: across all 100 seeds, columns are RARE (BW2-5 THE
    // COLUMN DEMOTION: <=1 per room, most rooms earn none) so only a handful of seeds carry any pillar.
    console.log(`  stub fired on at least one of 100 seeds: ${anyStub}`);
    console.log(`  any pillar >0.72 across all 100 seeds: ${anyFullHeight} (seed-dependent — NOT the selectivity proof; see 32b)`);

    // ── SELECTIVITY, CONSTRUCTED CONTROL (replaces the old `anyFullHeight` seed-lottery assertion) ──
    // WHY THE OLD ASSERTION WAS UNSOUND FOR THIS SEED SET (diagnosed live via a per-pillar
    // stub-vs-sightline instrumentation sweep over all 100 seeds — this fix's own report): columns are
    // RARE here (BW2-5 THE COLUMN DEMOTION: <=1 per room, most rooms earn none) — only 14 of the 100
    // seeds carry ANY pillar, 18 pillars total. Of those, 14 are genuinely TALL and, under THIS
    // fixture's own geometry (4 standees at the room's 4 corners + a "beat" camera framing all 4, whose
    // sightlines fan across the whole room), EVERY ONE lies on at least one corner sightline — so it
    // correctly stubs. The other 4 are BW2-5 authored-SHORT decorative caps (sy~0.192) that the classify
    // never touches (post-classify height === raw height). The instrumentation confirmed ZERO genuine
    // over-firing: not one pillar that the classify actually CUT (sy -> ankle 0.18) was off every
    // sightline. Net: no tall pillar in this seed set ever stays full, so `anyFullHeight` (which needs a
    // tall pillar to sit OFF every sightline BY LUCK) is a seed lottery that always loses here — it
    // proves nothing about selectivity, it only reflects that these particular rooms all-occlude their
    // rare column. The right proof is DIRECT: put an ON-sightline pillar and an OFF-sightline pillar in
    // the SAME hand-built room and assert the first stubs while the second stays full. (PART A check 3
    // already proves this at the pure-math layer; this is its LIVE-renderer twin, independent of the
    // procedural seed set.)
    group("32b — SELECTIVITY (constructed control): in one hand-built room, an ON-sightline pillar stubs while an OFF-sightline pillar stays FULL height — the law is scoped to real occluders, not indiscriminate (replaces the seed-lottery anyFullHeight)");
    const SEL_FIG = { x: 5, z: 5 };
    // plain 7x7 gloom room + one figure + beat fit on it — the SAME hand-built-board technique
    // dev/verify-occlusion-fade.mjs uses (bypasses the dungeon generator; deterministic geometry).
    await page.evaluate(({ fig }) => {
      const kit = interiorTileKitFor("gloom");
      const W = 7, D = 7, wallH = 2.4;
      const floor = [];
      for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) floor.push({ x, z, sx: 1, sy: 1, sz: 1, color: kit.floorColor });
      const wall = [];
      for (let x = -1; x <= W; x++) { wall.push({ x, z: -1, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); wall.push({ x, z: D, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); }
      for (let z = 0; z < D; z++) { wall.push({ x: -1, z, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); wall.push({ x: W, z, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); }
      const board = {
        kind: "interior3d", env: "dungeon", realmId: "gloom", cellSize: 1, wallHeightBase: wallH,
        tileKit: { floorColor: kit.floorColor, wallColor: kit.wallColor, trimColor: kit.trimColor,
          floorMaterial: kit.floorMaterial, wallMaterial: kit.wallMaterial, trimMaterial: kit.trimMaterial,
          floorGrain: 0, wallGrain: 0, trimGrain: 0, gradeTint: null, gradeStrength: 0, fogWhisper: 0 },
        instances: { floor, wall, doorframe: [], pillar: [] },
        bounds: { minX: -1, maxX: W, minZ: -1, maxZ: D },
        lightProfile: "torchlit",
        pieces: [{ slug: "bw2-1b-medium", cellX: fig.x, cellY: fig.z }],
        cameraFit: { mode: "beat", cells: [{ x: fig.x, y: fig.z }] },
      };
      window.__selBoard = board; // stashed so the pillar-injection replay below mutates THIS exact object
      window.Theater.setInteriorBoard(board);
    }, { fig: SEL_FIG });
    await settleCameraTween();
    const selGeo = await page.evaluate(({ fig }) => {
      const law = window.Theater._occlusionLawForTest;
      const origin = window.Theater.interiorBoardOrigin();
      const floorTopMap = window.Theater._interiorFloorTopMapForTest();
      const sp = law.itrPieceSightPoints([{ slug: "bw2-1b-medium", cellX: fig.x, cellY: fig.z }], origin.cx, origin.cz, floorTopMap);
      return { cam: window.Theater._interiorCameraPositionForTest(), origin, sight: sp[0], ankleH: law.itrOcclusionAnkleHeight(2.4) };
    }, { fig: SEL_FIG });
    ok(!!selGeo.cam && !!selGeo.sight, "constructed control: bare room + figure mounted, real settled camera + sight point resolved");
    // sweep t along the SETTLED camera->figure segment for a box that genuinely intersects — the SAME
    // generous-occluder t-sweep dev/verify-occlusion-fade.mjs uses (the narrow interior FOV's valid
    // occluding window is a thin slice of t near the figure, so a 1.5 half-extent occluder is used).
    const SEL_OCC_HALF = 1.5;
    let selOccPos = null;
    for (let t = 0.999; t >= 0.80; t -= 0.001) {
      const px = selGeo.cam.x + t * (selGeo.sight.x - selGeo.cam.x);
      const pz = selGeo.cam.z + t * (selGeo.sight.z - selGeo.cam.z);
      // eslint-disable-next-line no-await-in-loop
      const hit = await page.evaluate(({ cam, sight, px, pz, half }) => {
        const law = window.Theater._occlusionLawForTest;
        return law.itrSegmentIntersectsAabb(cam, sight, { x: px - half, y: -0.5, z: pz - half }, { x: px + half, y: 1.9, z: pz + half });
      }, { cam: selGeo.cam, sight: selGeo.sight, px, pz, half: SEL_OCC_HALF });
      if (hit) { selOccPos = { x: px, z: pz }; break; }
    }
    ok(selOccPos != null, "constructed control: found an ON-sightline occluder position via the camera->figure t-sweep (the SAME primitive the production mask uses)");
    if(selOccPos){
      const onCell = { x: selOccPos.x + selGeo.origin.cx, z: selOccPos.z + selGeo.origin.cz };
      const ctrlCell = { x: 1, z: 1 }; // far corner, nowhere near the single camera->figure segment
      // inject BOTH pillars onto the SAME stashed board object, then force a rebuild (setInteriorVariant
      // replay — the SAME "mutate instances.pillar in place, null the boardKey, replay S.lastBoard"
      // trick dev/verify-occlusion-fade.mjs uses to guarantee a genuine re-classify).
      const selResult = await page.evaluate(({ onCell, ctrlCell, onSize }) => {
        const board = window.__selBoard;
        board.instances.pillar = [
          { x: onCell.x, z: onCell.z, sx: onSize, sy: 2.4, sz: onSize, color: "#808080" },   // ON a sightline
          { x: ctrlCell.x, z: ctrlCell.z, sx: 1, sy: 2.4, sz: 1, color: "#808080" },          // OFF every sightline
        ];
        window.Theater.setInteriorVariant({});
        const law = window.Theater._occlusionLawForTest;
        const origin = window.Theater.interiorBoardOrigin();
        const floorTopMap = window.Theater._interiorFloorTopMapForTest();
        const cam = window.Theater._interiorCameraPositionForTest();
        const sp = law.itrPieceSightPoints(board.pieces, origin.cx, origin.cz, floorTopMap);
        // SELF-CHECK: independently confirm (via the same itrSegmentIntersectsAabb the mask uses) that
        // the ON pillar really is on a sightline and the CONTROL pillar really is off EVERY sightline —
        // so the assertion below can never be a false pass from a mis-placed control.
        function onSightline(cell, half){
          const cx = origin.cx, cz = origin.cz;
          const boxMin = { x: cell.x - cx - half, y: -0.5, z: cell.z - cz - half };
          const boxMax = { x: cell.x - cx + half, y: 1.9, z: cell.z - cz + half };
          return sp.some((pt) => law.itrSegmentIntersectsAabb(cam, pt, boxMin, boxMax));
        }
        const pillarList = window.Theater._interiorPillarListForTest();
        const onP = pillarList.find((p) => Math.abs(p.x - onCell.x) < 1e-6 && Math.abs(p.z - onCell.z) < 1e-6);
        const ctrlP = pillarList.find((p) => Math.abs(p.x - ctrlCell.x) < 1e-6 && Math.abs(p.z - ctrlCell.z) < 1e-6);
        return {
          onOnSightline: onSightline(onCell, 1.5), ctrlOnSightline: onSightline(ctrlCell, 0.5),
          onSy: onP ? onP.sy : null, ctrlSy: ctrlP ? ctrlP.sy : null,
        };
      }, { onCell, ctrlCell, onSize: SEL_OCC_HALF * 2 });
      await settleCameraTween();
      ok(selResult.onOnSightline === true, `constructed control: the ON pillar's box genuinely lies on a camera->figure sightline (self-checked via itrSegmentIntersectsAabb) — ${selResult.onOnSightline}`);
      ok(selResult.ctrlOnSightline === false, `constructed control: the CONTROL pillar's box lies OFF every sightline (self-checked) — a valid negative control, ${selResult.ctrlOnSightline}`);
      ok(selResult.onSy != null && selResult.onSy <= selGeo.ankleH + 1e-6, `SELECTIVITY: the ON-sightline pillar STUBS to the ankle height (${selGeo.ankleH.toFixed(3)}), got sy=${selResult.onSy}`);
      ok(selResult.ctrlSy != null && Math.abs(selResult.ctrlSy - 2.4) < 1e-6, `SELECTIVITY: the OFF-sightline CONTROL pillar in the SAME room stays FULL height (2.4), got sy=${selResult.ctrlSy} — the law is scoped to real occluders, NOT indiscriminate`);
    }

    group("33 — stub RESTORES when the sightline clears: rebuild the IDENTICAL room (same walkId -> byte-identical plan/pillar order) with the corner pieces removed, and confirm any pillar that WAS stubbed reports full height again");
    const nearScene = await buildSeededScene("bw2-1b-restore-seed");
    // rebuild the SAME room (same walkId, same room-selection logic -> the identical pillar instance
    // list in the identical order) with ZERO pieces mounted — no sightline exists to test against at
    // all, so itrPillarCutawayMask's own short-circuit ("no sight points -> nothing flagged", this
    // file's own header on that function) guarantees every pillar reports its full, un-stubbed height.
    await page.evaluate((walkId) => {
      function buildFixture(n){
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
        const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
        while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
        return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
      }
      const fixture = buildFixture(16);
      const plan1 = semanticizePlan(spatializePlan(fixture, "The Spine", { walkId }), fixture, []);
      const room = plan1.rooms.reduce((a, b) => (a.w * a.d > b.w * b.d ? a : b));
      const board = interiorBuildBoard(plan1, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      board.pieces = []; // nobody mounted at all — no sightline to test against, every pillar clears
      window.Theater.setInteriorBoard(board);
    }, "bw2-1b-restore-seed");
    // CAMERA-TWEEN SETTLE — see buildSeededScene's own header; consistent discipline even though this
    // particular board has zero pieces (so occlusion classify is a no-op regardless of camera angle).
    await settleCameraTween();
    const clearedScene = await page.evaluate(() => {
      return {
        ok: true,
        pillarHeights: window.Theater._interiorPillarListForTest().map((p) => p.sy),
        meshCount: window.Theater.interiorMeshCount(),
        // DOORFRAME-OCCLUSION FIX addendum — see buildSeededScene's own comment: with zero pieces
        // mounted there are zero sight points, so itrPillarCutawayMask/itrOcclusionClassify's own
        // short-circuit guarantees zero ghost kinds ever fire here — asserted below, not just assumed.
        activeGhostKinds: [
          window.Theater._interiorWallGhostListForTest().length > 0,
          window.Theater._interiorPillarGhostListForTest().length > 0,
          window.Theater._interiorDoorGhostListForTest().length > 0,
        ].filter(Boolean).length,
      };
    });
    ok(nearScene.ok && clearedScene.ok, "both the occupied and cleared variants of the same room built");
    if(nearScene.ok && clearedScene.ok){
      ok(clearedScene.pillarHeights.length === nearScene.pillarHeights.length, `same pillar COUNT/order (${clearedScene.pillarHeights.length} vs ${nearScene.pillarHeights.length}) — byte-identical plan, cutaway never adds/removes an instance`);
      const stubbedInNear = nearScene.pillarHeights.map((h, i) => h <= 0.72 + 1e-6 ? i : -1).filter((i) => i >= 0);
      console.log(`  pillars stubbed while occupied: ${stubbedInNear.length} of ${nearScene.pillarHeights.length}`);
      ok(clearedScene.pillarHeights.every((h) => h > 0.72 + 1e-6), `every pillar (including any index stubbed while occupied, indices ${JSON.stringify(stubbedInNear)}) reports full height once no standee is mounted — heights: ${JSON.stringify(clearedScene.pillarHeights)}`);
    }

    group("34 — BUDGET UNCHANGED: S.interiorMeshCount + the pillar instance list's own length are IDENTICAL between the occluded (4-corner) and cleared (0-piece) variants of the same room — cutaway is a per-instance transform edit, never a second draw call (an ACTIVE ghost overlay is the one documented, intentional exception — S-1 OCCLUSION FADE's own header: 'only ever created when at least one instance of that kind is actually occluding a figure this frame' — so the comparison accounts for however many ghost KINDS legitimately fired in the occupied scene, rather than assuming zero)");
    if(nearScene.ok && clearedScene.ok){
      ok(typeof nearScene.meshCount === "number" && nearScene.meshCount > 0, `meshCount is a real positive number (${nearScene.meshCount})`);
      ok(clearedScene.activeGhostKinds === 0, `the CLEARED (0-piece) scene fires ZERO ghost kinds — no pieces means no sight points, so nothing can classify as occluding (${clearedScene.activeGhostKinds})`);
      ok(clearedScene.meshCount === nearScene.meshCount - nearScene.activeGhostKinds, `structural mesh count identical ONCE the occupied scene's own legitimately-active ghost overlays are accounted for (${nearScene.meshCount} occupied [${nearScene.activeGhostKinds} active ghost kind(s)] vs ${clearedScene.meshCount} cleared) — piece count never changes the structural draw-call budget beyond the documented per-kind ghost-overlay exception`);
      ok(clearedScene.pillarHeights.length === nearScene.pillarHeights.length, "pillar instance COUNT identical with/without occlusion firing (asserted again alongside check 33's own count assertion, for the budget claim specifically)");
    }

    group("35 — DETERMINISM: the SAME seed rebuilt twice yields byte-identical pillar heights + occlusion outcome");
    const det1 = await buildSeededScene("bw2-1b-determinism-seed");
    const det2 = await buildSeededScene("bw2-1b-determinism-seed");
    ok(det1.ok && det2.ok, "both determinism-check builds succeeded");
    if(det1.ok && det2.ok){
      ok(JSON.stringify(det1.pillarHeights) === JSON.stringify(det2.pillarHeights), "pillar heights byte-identical across two independent builds of the same seed");
      ok(JSON.stringify(det1.raycasts) === JSON.stringify(det2.raycasts), "raycast outcomes byte-identical across two independent builds of the same seed");
    }

    group("36 — CLIP MARGIN LAW, live: across the SAME 100 seeds, every mounted standee's post-nudge footprint no longer overlaps its nearby pillar boxes (quad-AABB clear)");
    const clipOverlaps = seedResults.filter((s) => s.ok).flatMap((s) => s.overlaps);
    const clipViolations = clipOverlaps.filter((m) => m > 1e-6);
    ok(clipOverlaps.length === 400, `all 400 mounted-standee footprints actually checked (${clipOverlaps.length}) — non-vacuous`);
    ok(clipViolations.length === 0, `0 of ${clipOverlaps.length} mounted-standee footprints still overlap a nearby pillar box after the mount-time nudge (violations: ${clipViolations.length})`);

  } catch(e){
    fail++; console.error("  FAIL: live-Chrome render check threw: " + (e && e.stack || e.message));
  } finally {
    if(browser){ try { await browser.close(); } catch(e){} }
    if(server && server.proc){ try { server.proc.kill("SIGTERM"); } catch(e){} }
  }
}

const withRender = process.argv.includes("--with-render");
if(withRender){
  await runRenderChecks();
} else {
  console.log("\n(skipping checks 30-36 — live-Chrome mount/raycast integration: pass --with-render to boot real headless Chrome + THREE and exercise it)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
