/* THEATER OCCLUSION — the BW2-1b OCCLUSION LAW + STAGE-A A4 DYNAMIC OCCLUSION v2 + the CLIP MARGIN
   LAW: the sightline geometry, the per-instance cutaway masks, the ankle-stub/ghost split, the fade
   classification with its bearing hysteresis, and the sprite-vs-prism clip nudge — extracted VERBATIM
   from src/ui/theater-boot.js in split step B6 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: everything that decides WHAT IS IN THE WAY and WHAT TO DO ABOUT IT. The pure segment-vs-
   AABB primitive (itrSegmentIntersectsAabb); the per-standee sightline targets (itrPieceSightPoints);
   the per-instance cutaway masks for pillars/walls (itrPillarCutawayMask) and for furniture
   (itrFurnitureOcclusionBoxFor / itrFurnitureOcclusionMask); the ankle-height deriver and its S-1 alias
   (ITR_PILLAR_STUB_FRAC / ITR_OCCLUSION_STEM_HEIGHT_U / itrPillarStubHeight / itrOcclusionAnkleHeight);
   the whole A4 tunable set (ITR_OCCLUSION_UPPER_OPACITY + its GHOST_OPACITY back-compat alias,
   FADE_IN_MS, FADE_OUT_MS, RECLASSIFY_HYSTERESIS_DEG, STUB_DARKEN, STUB_MIN_HEIGHT); the camera-bearing
   math and the pure hysteresis decision (itrOcclusionBearingDeg / itrOcclusionBearingDeltaDeg /
   itrOcclusionNextCommitted); the STATEFUL classifier that owns S.occlusionFadeState and retargets the
   per-instance opacity tween (itrOcclusionClassify) with its id production (itrOcclusionIdFor); the
   stub/ghost splitter (itrSplitOccluderForAnkleGhost); and the CLIP MARGIN LAW's own pure geometry
   (itrClosestPointOnAabbXZ / itrCircleAabbPushXZ / itrNearbyPrismBoxes / itrClipNudgeFor /
   itrPointInAnyBox / itrBlockerNudgeCell / CLIP_NUDGE_MAX_FRAC / CLIP_DRESSING_EPSILON).

   NO THREE. Censused: not one moved line constructs or touches a THREE object — every `THREE.` string
   left in this file is prose inside a comment. That is the property the monolith's own headers already
   claimed for this family ("Pure geometry (no THREE) so it's independently testable in a jsdom-only
   harness with NO live WebGL renderer needed") and the split preserves it exactly: there is no
   `import * as THREE` here.

   SCHEDULER LAW (the brief's §Protected contracts): itrOcclusionClassify's opacity tween rides the
   SHARED S.tweens / tickTweens channel (theater-verbs.js) exactly as it did in the monolith — the SAME
   channel MF-1's camera-pose glide and every verb/effect tween already use, never a second hand-rolled
   rAF loop. This module owns no requestAnimationFrame call of its own (censused: zero), and it does not
   touch the practical FLICKER loop (theater-lighting.js), the MOTE loop (theater-motes.js) or the root's
   dirty-frame loop. Nothing was unified; nothing was re-cadenced. `startTweenLoop` is still the root's
   one entry point and arrives through ctx.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B5 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via occlusionInit(ctx) into the module-local mirrors
   below, so every moved body keeps its bare identifiers. It DOES read and write the live theater state
   record — S.occlusionFadeState (the persistent id -> {blocking,opacity,materials,everClassified,fading}
   Map) and S.tweens — so the root also calls occlusionSyncState(S) at BOTH `S = createTheaterState()`
   reassignment sites, beside the existing clayRoomSyncState / lightLabSyncState / postSyncState /
   lightingSyncState / motesSyncState / cameraSyncState calls. Censused: S.occlusionClassifyBearingDeg
   and S.__occlusionFadeBoardRef are NOT touched by any body here — they are read/written only by
   setInteriorBoard's own per-rebuild hold decision, mount()'s reset and the root's occlusion-fade
   diagnostic, all of which stayed in theater-boot.js.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT: it imports mf1EaseOutCubic + mf1Lerp DIRECTLY from its
   sibling src/ui/theater-camera.js (itrOcclusionClassify's fade tween reuses the MF-1 easing verbatim —
   the monolith's own "the SAME discipline placeCameraTweened keeps for the camera" note) rather than
   taking them through ctx — a one-way leaf->leaf edge, censused acyclic (theater-camera.js reads
   NOTHING from this file; the only occlusion names left in its bodies are prose in comments). Identical
   specifier spelling to theater-boot.js's own import of that file, so both resolve to the ONE cached
   module instance. That edge is why this file's <script type="module"> tag follows theater-camera.js's
   in genesis.html.

   `furnitureFor` stays a BARE GLOBAL reference, exactly as in the monolith: it is declared by the
   classic <script> src/ui/theater-interior.js (and republished as window.furnitureFor there), not by
   theater-boot.js, so a free-variable lookup here resolves through the identical global path it always
   did. No ctx entry, no import, no behaviour change.

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     ITR_OCCLUSION_FADE_DISABLED_FOR_TEST — a mutable root `let` that window.Theater.
       _setOcclusionFadeDisabledForTest flips live (dev/verify-occlusion-fade.mjs's RED-FIRST proof).
       CENSUSED: not one body in this file reads it — its four production readers are setInteriorBoard's
       own wall/door/pillar/furniture occlusion gates, plus the setter and the occlusion-fade diagnostic,
       ALL of which stayed in the root. So unlike B2-B5's flag law it needs NO ctx accessor at all; it
       simply stayed put with its own header prose (the same shape B5's ITR_LIGHT_EMITTER_NUB_ENABLED
       took). That is why this file has ZERO accessor lines.
     itrBuildOcclusionGhostMeshes / itrBuildOcclusionGhostPillarMeshes — the two ghost MESH builders.
       They carry no occlusion law at all: each is a thin per-instance wrapper over
       interiorBuildInstancedMesh / interiorBuildPillarMeshes (the interior realizer's own THREE
       InstancedMesh machinery, which is B9's scope), and they live beside those builders in the root.
       Moving them would have dragged the whole instanced-mesh family through this module's ctx and
       broken the "no THREE" property above.
     itrScaleHexValue — the shared per-instance colour scaler (ITR_ROOM_SHELL_RISER_DARKEN /
       ITR_SCENE_DOORFRAME_VALUE / ITR_EMISSIVE_ALBEDO_LIFT and a dozen other root sites use it).
     interiorFloorTopAt (the derived floor-top law) and interiorStandeeContactY (the BW2-2 contact law)
       — both read by a dozen non-occlusion root sites.
     spriteEntryFor (the sprite-registry join), HUMAN_TRUE_HEIGHT (the true-scale reference), markDirty
       (the root's dirty-frame scheduler entry point) and startTweenLoop (the shared tween loop starter).
     window.Theater._occlusionLawForTest and window.Theater._clipMarginLawForTest — the two published
       LAW OBJECTS stay assembled in theater-boot.js's own publish block, unmoved, still listing the
       same keys in the same order. Every value in them is now an IMPORTED binding of the function
       declared here, so the published object keeps the identical shape AND the identical function
       identities (dev/verify-bw2-1b-occlusion.mjs reads law.itrPieceSightPoints / law.itrOcclusionClassify
       (via the live render) / law.itrOcclusionAnkleHeight straight through it; dev/verify-occlusion-fade.mjs
       reads law.itrSegmentIntersectsAabb / law.itrOcclusionNextCommitted / law.itrOcclusionBearingDeltaDeg
       and the A4 consts). Because nothing published moved into this module, this file needs NO
       PublishSeams function.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the three
   `split B6` chunk-boundary notes marking where a root-owned declaration was left behind, and the
   trailing `export {...}` block. Not one other byte inside a moved declaration changed — there is not a
   single accessor swap in this file. */
// split B6: the sibling camera module (leaf->leaf, one-way — see this file's header). Identical
// specifier spelling to theater-boot.js's own import of the same file, so both resolve to the ONE
// cached module instance and the easing used by the fade tween IS the easing the camera glide uses.
import { mf1EaseOutCubic, mf1Lerp } from "./theater-camera.js";

// ---- root-capability mirrors (wired once by occlusionInit; S re-synced by occlusionSyncState) ----
let S;
let HUMAN_TRUE_HEIGHT, interiorFloorTopAt, interiorStandeeContactY, itrScaleHexValue, markDirty,
    spriteEntryFor, startTweenLoop;

export function occlusionInit(ctx){
  ({ HUMAN_TRUE_HEIGHT,
    interiorFloorTopAt,
    interiorStandeeContactY,
    itrScaleHexValue,
    markDirty,
    spriteEntryFor,
    startTweenLoop } = ctx);
  S = ctx.S;
}
export function occlusionSyncState(nextS){ S = nextS; }

// ─── BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 1 — DYNAMIC CUTAWAY for interior columns/
// pillar prisms. The CUTAWAY WALLS treatment above (study card v4) only ever touched WALL instances;
// a pillar sitting between the camera and a standee was never adjusted at all — "loop-03's knight
// behind a pillar," the law the mock itself keeps (ui-sketches/mock-frames/mock-01-gloom-combat.png:
// no prism ever eats a character). Pure geometry (no THREE) so it's independently testable in a
// jsdom-only harness with NO live WebGL renderer needed — same "PART A pure math / PART B live-Chrome
// integration" split dev/verify-bw2-2-floor-contact.mjs's own header already establishes for this
// file's sealed ES-module boundary.

// standard slab-method ray-SEGMENT (p0->p1, t clamped to [0,1] — a bounded segment, never an
// infinite ray, since a pillar standing BEHIND the standee from the camera's view must never cut
// away) vs axis-aligned-box intersection test. A near-zero-length segment on one axis degrades to a
// point-containment check on that axis rather than dividing by ~0.
function itrSegmentIntersectsAabb(p0, p1, boxMin, boxMax){
  let tmin = 0, tmax = 1;
  const axes = ["x", "y", "z"];
  for(let i = 0; i < axes.length; i++){
    const ax = axes[i];
    const d = p1[ax] - p0[ax];
    if(Math.abs(d) < 1e-9){
      if(p0[ax] < boxMin[ax] || p0[ax] > boxMax[ax]) return false;
      continue;
    }
    let t1 = (boxMin[ax] - p0[ax]) / d, t2 = (boxMax[ax] - p0[ax]) / d;
    if(t1 > t2){ const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) return false;
  }
  return true;
}

// one approximate torso/head sightline TARGET per mounted standee — the SAME true-scale height
// resolution interiorFitMaxHeightFor (above) already uses (spriteEntryFor's own scaleTrue, or a
// piece's own scaleVsHuman override), computed independently of texture load state
// (interiorSpriteBillboard's real geometry isn't built until interiorBuildPieces runs, LATER in
// setInteriorBoard than this — see that call's own position below) so this never waits on an async
// texture round-trip. Falls back to a scaleTrue of 1 (HUMAN_TRUE_HEIGHT) for an unresolved slug, same
// total-function/never-throw discipline every other resolution in this file keeps.
function itrPieceSightPoints(pieces, cx, cz, floorTopMap){
  const pts = [];
  (pieces || []).forEach((p) => {
    if(!p || !p.slug) return;
    const base = (typeof spriteEntryFor === "function") ? spriteEntryFor(p.slug) : null;
    const scaleTrue = (base && typeof base.scaleTrue === "number" && base.scaleTrue > 0) ? base.scaleTrue
      : (typeof p.scaleVsHuman === "number" && p.scaleVsHuman > 0) ? p.scaleVsHuman : 1;
    const height = HUMAN_TRUE_HEIGHT * scaleTrue;
    const cellX = p.cellX || 0, cellY = p.cellY || 0;
    const floorTop = interiorFloorTopAt(floorTopMap, cellX, cellY);
    const contactY = interiorStandeeContactY(floorTop);
    // torso/head midpoint of the standee's own real height — ONE representative point per standee
    // (not its whole vertical extent) keeps this an O(pillars*pieces) check; a pillar tall enough to
    // clip a torso-height sightline reads as "in the way" regardless of whether it also clips the
    // feet or the crown of the head.
    pts.push({ x: cellX - (cx || 0), y: contactY + height * 0.5, z: cellY - (cz || 0) });
  });
  return pts;
}

// per-pillar-instance boolean mask: true where ANY sight point's segment (real camera world position
// -> that standee's own torso point) enters the pillar's own world-space box — the SAME box
// interiorBuildInstancedMesh actually renders (position=(inst.x-cx, sy/2-0.5, inst.z-cz), half-
// extents (sx/2,sy/2,sz/2), that function's own header note), so a flagged instance is provably the
// thing the camera would actually see occluding the standee, not an approximation of it.
// DOORFRAME-OCCLUSION FIX: `centerY` now folds in `inst.yBase` (default 0, so every pre-existing
// zero-yBase caller — every wall instance, and a non-tapered pillar shaft — computes the byte-identical
// box it always did). Before this fix, centerY was hardcoded to `sy/2-0.5` — correct ONLY for a yBase-0
// instance; ANY instance with a real yBase (a tapered pillar's own CAP, per THE COLUMN-CAP COLLISION
// comment above itrOcclusionIdFor — and now BW2-5's doorframe ARCH-HEADER prisms, which stack yBase
// at/above the door's own height) was tested against a box floating near the FLOOR instead of its true
// position near the ceiling, so a real near-ceiling occluder could never be flagged (or could be
// wrongly flagged against an unrelated low sightline). Matches interiorBuildInstancedMesh's own
// `y = yBase + sy/2 - 0.5` placement formula exactly — this is the SAME box that function renders, not
// an approximation of it, now true for every yBase too.
function itrPillarCutawayMask(pillarList, cameraPos, sightPoints, cx, cz){
  const list = pillarList || [];
  if(!cameraPos || !sightPoints || !sightPoints.length) return list.map(() => false);
  return list.map((inst) => {
    const halfX = Math.max(0.01, (inst.sx || 1)) / 2;
    const halfY = Math.max(0.01, (inst.sy || 1)) / 2;
    const halfZ = Math.max(0.01, (inst.sz || 1)) / 2;
    const centerX = (inst.x || 0) - (cx || 0), centerZ = (inst.z || 0) - (cz || 0);
    const yBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
    const centerY = yBase + (inst.sy || 1) / 2 - 0.5;
    const boxMin = { x: centerX - halfX, y: centerY - halfY, z: centerZ - halfZ };
    const boxMax = { x: centerX + halfX, y: centerY + halfY, z: centerZ + halfZ };
    return sightPoints.some((pt) => itrSegmentIntersectsAabb(cameraPos, pt, boxMin, boxMax));
  });
}

// STAGE-A A4 — furniture's own occlusion AABB: unlike a wall/pillar instance (one box, sx/sy/sz off the
// instance itself), a furniture piece is a multi-prism assembly (furnitureFor(kind,realm).prisms,
// theater-interior.js — a pure-data recipe, no THREE) mounted at floorTop. This unions every prism's own
// local box into ONE world-space AABB for the sightline test — deliberately a single whole-piece box
// (never per-prism), matching "the blocking INSTANCE" (STAGE-A A4's own wording) being the whole
// furniture placement, not one drawer/leg/shelf-board of it. Returns null for a slug-less/unresolvable
// entry (never throws). Pure geometry, no THREE — testable the same jsdom-only way itrSegmentIntersectsAabb
// itself is.
function itrFurnitureOcclusionBoxFor(entry, cx, cz, floorTopMap){
  if(!entry || !entry.slug) return null;
  const recipe = furnitureFor(entry.kind, entry.realmId);
  const prisms = (recipe && recipe.prisms) || [];
  if(!prisms.length) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  prisms.forEach((p) => {
    const hx = Math.max(0.01, p.sx || 0) / 2, hy = Math.max(0.01, p.sy || 0) / 2, hz = Math.max(0.01, p.sz || 0) / 2;
    const pcx = p.dx || 0, pcy = (p.yBase || 0) + hy, pcz = p.dz || 0;
    minX = Math.min(minX, pcx - hx); maxX = Math.max(maxX, pcx + hx);
    minY = Math.min(minY, pcy - hy); maxY = Math.max(maxY, pcy + hy);
    minZ = Math.min(minZ, pcz - hz); maxZ = Math.max(maxZ, pcz + hz);
  });
  const floorTop = interiorFloorTopAt(floorTopMap, entry.x || 0, entry.y || 0);
  const worldX = (entry.x || 0) - (cx || 0), worldZ = (entry.y || 0) - (cz || 0);
  return {
    min: { x: worldX + minX, y: floorTop + minY, z: worldZ + minZ },
    max: { x: worldX + maxX, y: floorTop + maxY, z: worldZ + maxZ }
  };
}
// per-furniture-entry boolean mask, same "does ANY sight point's camera->torso segment enter this
// instance's own box" contract as itrPillarCutawayMask above, generalized to the unioned furniture AABB
// itrFurnitureOcclusionBoxFor derives (rather than a flat sx/sy/sz instance field).
function itrFurnitureOcclusionMask(furniture, cx, cz, floorTopMap, cameraPos, sightPoints){
  const list = furniture || [];
  if(!cameraPos || !sightPoints || !sightPoints.length) return list.map(() => false);
  return list.map((entry) => {
    const box = itrFurnitureOcclusionBoxFor(entry, cx, cz, floorTopMap);
    if(!box) return false;
    return sightPoints.some((pt) => itrSegmentIntersectsAabb(cameraPos, pt, box.min, box.max));
  });
}

// stub height for a flagged occluder (pillar OR wall, docs/DIEGETIC-LIGHT.md unit S-1) — was "~0.3
// wall height, the parapet grammar" (BW2-1b item 1, a KNEE cut); Adam's live steer on S-1 (2026-07-11)
// lowered this to a genuine ANKLE: the old 0.3 frac (0.72 world units at the 2.4 wallHeightBase
// default) never actually cleared a torso-height sight point (itrPieceSightPoints' own contactY +
// height*0.5 — at HUMAN_TRUE_HEIGHT=1.1/scaleTrue=1 that's contactY+0.55, well above the old stub's
// own box-top of ~0.22) — the exact bug Adam's report named ("columns and walls still obscure
// figures"). 0.12 (~0.29 world units at the 2.4 default) sits low enough to clear any realistic
// standee's torso point. Taken against the BOARD's own nominal wall height (data.wallHeightBase — the
// un-scaled base a scale-domain-tall room's own pillars/walls are still multiples of, itrWallScale's
// own convention in theater-interior.js), never an instance's OWN (possibly already-scaled) height —
// so a titanic lair's occluder stubs to the SAME absolute ankle height a human-scale room's would. The
// 2.4 fallback mirrors theater-interior.js's own ITR_WALL_HEIGHT_BASE (not window-exported — same "two
// independent constants declaring the same number" mirroring convention src/engine/place-dressing.js's
// own DP_CAM_YAW_OFFSET_DEG keeps against this file's CAM_YAW_OFFSET_DEG) for a caller (or synthetic
// test fixture) that omits data.wallHeightBase entirely. Name kept (itrPillarStubHeight/
// ITR_PILLAR_STUB_FRAC) for the existing BW2-1b harness's own test seam — see itrOcclusionAnkleHeight
// alias below, used by the (now shared) wall+pillar S-1 fade path.
// STAGE-A A4 (docs/STAGE-A.md §A4, 2026-07-12): the solid ankle STEM height is now a flat absolute
// world-unit constant inside the spec's own 0.12-0.25u band, superseding the wallHeightBase*
// ITR_PILLAR_STUB_FRAC fraction this comment block above described (0.288u at the 2.4 nominal base —
// just OUTSIDE the new band). The old fraction's whole rationale was "stub to the SAME absolute ankle
// height regardless of scale domain" — but wallHeightBase itself already stays ~2.4 (the board's own
// UNSCALED nominal wall height) across every scale domain, so a flat constant achieves the identical
// practical effect with a cleaner number inside the tighter A4 band. ITR_PILLAR_STUB_FRAC/
// wallHeightBase are kept as function-signature/name fossils for the existing harness seam; the
// returned height no longer actually depends on either.
const ITR_PILLAR_STUB_FRAC = 0.12;
// Adam's 2026-07-26 cutaway ruling: an occluding wall remains legible as an exact one-foot stub.
// One world unit is five feet, so every dynamic wall/pillar split retains 0.2u of solid geometry.
const ITR_OCCLUSION_STEM_HEIGHT_U = 0.2;
function itrPillarStubHeight(wallHeightBase){
  return ITR_OCCLUSION_STEM_HEIGHT_U;
}
// S-1 alias — the SAME ankle-height deriver, named for its wider (wall+pillar) role in the occlusion
// fade path below (itrPillarStubHeight kept as the historical/tested name the BW2-1b harness seam
// already exposes).
const itrOcclusionAnkleHeight = itrPillarStubHeight;

// split B6: ITR_OCCLUSION_FADE_DISABLED_FOR_TEST (the RED-FIRST harness gate) stayed in
// theater-boot.js — a mutable root `let` its window.Theater seam flips live, and censused to have NO
// reader in this file (its four production readers are setInteriorBoard's own occlusion gates), so it
// needs no ctx accessor here. See this file's header.

// ═══ STAGE-A A4 — DYNAMIC OCCLUSION v2 (docs/STAGE-A.md §A4; docs/WALK-NATIVE-A.md A4) ═══════════
// Upgrades S-1's flat-opacity ghost (one shared opacity for every ghost of a kind, no animation, no
// hold before re-classifying) along three axes:
//  (1) UPPER OPACITY — a named const inside the spec's 0.05-0.10 band (was a flat 0.2, Adam's original
//      "~5%" P-3 demo call). Still low enough the figure behind reads clearly; still high enough the
//      column/wall reads as "there, not gone".
//  (2) PER-INSTANCE TWEEN — each blocking instance gets its OWN opacity, animated on the shared
//      S.tweens/tickTweens channel (theater-verbs.js — the SAME channel MF-1's camera-pose glide and
//      every verb/effect tween already rides; never a second hand-rolled rAF loop), persisted across
//      setInteriorBoard rebuilds in S.occlusionFadeState (Map: id -> {blocking, opacity, materials}).
//      A re-classify mid-fade INTERRUPTS/RETARGETS from wherever the opacity actually is right now
//      (the SAME discipline placeCameraTweened's own preFit snapshot keeps for the camera) rather than
//      snapping or restarting. `materials` is an array (length 1 for a wall/pillar's single ghost
//      material, length N for a furniture piece's per-prism materials) — the tween mutates every live
//      material directly each tick; no geometry rebuild is needed between setInteriorBoard calls.
//  (3) RECLASSIFY HYSTERESIS — a blocker's COMMITTED state only re-evaluates when the camera's own
//      bearing has moved at least ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG since the last FREE
//      (non-held) classification pass; a smaller move reuses the prior commit outright, so two
//      rebuilds whose composed camera drifted a fraction of a degree (theater-shot.js's composeShot
//      re-picking a marginally different candidate round to round) never flicker an occluder in/out.
// Blockers ALSO now include tall furniture (data.furniture, BW2-5's own "furniture-class blocker
// volumes") alongside the wall/pillar instance lists S-1 originally tested — see the ShotPlan-gated
// occlusionFurnitureOn read at this unit's setInteriorBoard call site (STAGE-A A4: "blockers come from
// ShotPlan.occlusionTargets, not only original piece cells").
const ITR_OCCLUSION_UPPER_OPACITY = 0.08;          // 0.05-0.10 band (was flat ITR_OCCLUSION_GHOST_OPACITY=0.2)
const ITR_OCCLUSION_GHOST_OPACITY = ITR_OCCLUSION_UPPER_OPACITY; // back-compat alias — old name, new value
const ITR_OCCLUSION_FADE_IN_MS = 150;              // 120-180ms band — fades THROUGH quickly
const ITR_OCCLUSION_FADE_OUT_MS = 220;             // 180-260ms band — restores to opaque more slowly
const ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG = 3; // 2-4deg band
// ANKLE-STUB BLOOM FIX (found live re-gating dev/verify-occlusion-fade.mjs's own GREEN check, flagged
// as a pre-existing defect in that harness's own A4-1 comment above — confirmed pre-existing on master
// 46289a45 via git-stash bisection, not an A4 regression). The harness comment's own inherited guess
// ("a bloom/no-shadow-ghost interaction") pointed at the GHOST; live-toggling the REAL mesh objects in
// a real Chrome render (not just theory) proved that guess wrong and found the ACTUAL seed:
//   - Hiding the ghost mesh entirely (Object3D.visible=false, not material.visible — materials don't
//     have that flag) barely moves the sampled color (194 -> 199, if anything WORSE) — the ghost is not
//     the seed.
//   - Hiding the SOLID ANKLE STUB (itrSplitOccluderForAnkleGhost's `stub` — the ordinary, fully-opaque,
//     non-ghost portion below the ankle cut) drops the sample straight back to baseline (dist ~0.03).
// Root cause: the stub is NEW geometry — before any cut, this exact (x,z,y<ankleH) volume was the lower
// half of a TALL box's SIDE walls, never a visible top face (buried inside the solid box, y up to 2.4).
// Cutting the box down to ankleH (0.18) EXPOSES a large, previously-nonexistent horizontal TOP FACE at
// floor level. This file's torchlit LIGHT_PROFILES point is decay:0 (a flat, NON-attenuating intensity
// — see applyLightProfile's own header) with no renderer.toneMapping set anywhere in this file (plain
// clamp, no asymptotic rolloff) — so a favorably-angled face (high N·L to the point light) can carry a
// raw linear value many multiples over 1.0, comfortably clearing BLOOM_THRESHOLD (0.68, linear, pre-
// OutputPass — see the SELECTIVE BLOOM dials above) regardless of alpha. The TALL box's own visible
// faces at a normal/elevated camera angle are mostly SIDE walls (shallower N·L, under threshold, this
// harness's own RED-state sample reads a moderate 69/255); the SHORT stub, viewed from the same
// elevated "beat" camera A4's own beat-fit convention uses, exposes far more of its TOP face instead —
// the newly-uncovered surface that actually trips bloom (confirmed: darkening the stub's own color
// removes the spike; the ghost's own material color was independently confirmed inert to this, per the
// bullets above). Root-cause candidates considered (see this unit's own report for the full empirical
// trail): (a) tone-map/cap the light model globally — rejected as far outside this defect's scope (a
// lighting-pipeline change, not an occlusion-fade one, with a much larger blast radius); (b) exempt the
// stub from bloom via a new per-object mask — rejected, no such mechanism exists anywhere in this file
// (SELECTIVE BLOOM is one global threshold) and inventing one is a bigger change than this needs; (c)
// darken JUST the stub's own per-instance color, scoped to itrSplitOccluderForAnkleGhost's own `stub`
// descriptor — the minimal, correct fix: the stub only ever exists as the truncated remainder of an
// occluding instance (never a normal free-standing wall/pillar), so darkening it can't mismatch any
// other visible geometry in the room; it directly targets the newly-exposed surface that is the actual
// bloom seed, using the SAME itrScaleHexValue per-instance-color convention ITR_ROOM_SHELL_RISER_DARKEN
// already uses one section up (applied to the FIELD `itrSplitOccluderForAnkleGhost` already computes
// per-instance, not a material/lighting-pipeline change).
const ITR_OCCLUSION_STUB_DARKEN = 0.05;
// THE "sy:0 IS UNSET" FOOTGUN — see itrSplitOccluderForAnkleGhost's own header where this is used: a
// tiny, deliberately-nonzero (truthy) floor for a fully-ghosted instance's own stub height, so it never
// collides with interiorBuildInstancedMesh's `inst.sy || 1` "unset -> unit box" fallback. Well under
// that function's own separate `Math.max(0.01, ...)` render-scale floor, which clamps it the rest of
// the way to a negligible sliver — this constant only needs to stay nonzero, not any particular size.
const ITR_OCCLUSION_STUB_MIN_HEIGHT = 1e-4;

// camera BEARING (degrees, world-origin-relative — a cheap, deterministic "has the camera meaningfully
// moved" proxy; pure math, no THREE) — the angle setInteriorBoard's own occlusionCameraPos sits at
// around the world origin. Two consecutive builds' bearings differing by less than the hysteresis band
// above hold the prior classification; a real rotate()-scale move (90 degrees) always exceeds it.
function itrOcclusionBearingDeg(camPos){
  if(!camPos) return null;
  return (Math.atan2(camPos.x, camPos.z) * 180) / Math.PI;
}
// shortest unsigned distance between two bearings, wrapped to [0,180] — never the naive difference
// (which would misjudge e.g. 179 vs -179 as a huge move when it's actually a 2-degree one).
function itrOcclusionBearingDeltaDeg(a, b){
  if(a == null || b == null) return Infinity;
  let d = Math.abs(a - b) % 360;
  if(d > 180) d = 360 - d;
  return d;
}
// itrOcclusionNextCommitted — the PURE hysteresis decision (no S.*, no THREE): given this rebuild's raw
// geometric test result, the previously-committed state, and whether this id has ever been classified
// before, decide the next committed state. `holdPrior` (this rebuild's camera-bearing hold flag)
// freezes an ALREADY-SEEN id's commitment regardless of the raw result; a brand-new id (never
// classified before) always takes the raw result fresh — there is no prior commitment to hold onto.
// Exposed on _occlusionLawForTest so a harness can prove the hysteresis decision directly without
// needing a live camera to produce a genuinely small bearing delta (the product's own camera only ever
// moves in discrete 90-degree rotate() steps or full ShotPlan re-composes today — see this unit's own
// report for why the PURE math is the more direct proof surface here).
function itrOcclusionNextCommitted(rawBlocking, priorCommitted, everClassified, holdPrior){
  if(holdPrior && everClassified) return !!priorCommitted;
  return !!rawBlocking;
}
// itrOcclusionClassify(id, rawBlocking, holdPrior) — the STATEFUL half: looks up/creates this id's
// persistent fade-state entry (S.occlusionFadeState, reset only on a fresh mount() or a genuinely NEW
// board object — see setInteriorBoard's own board-ref check), applies itrOcclusionNextCommitted, and on
// a genuine flip (re)targets an opacity tween on the shared S.tweens channel — cancelling (never
// stacking) any prior tween already live for this SAME id first, the same "retarget, not stack"
// discipline placeCameraTweened keeps for the camera-pose tween. Returns the live entry ({blocking,
// opacity, materials}) so the caller can decide whether to render this instance split (stub+ghost) THIS
// build — `fading` (blocking, OR still easing back up from a fade-out) is the RENDER-time question;
// `blocking` alone is only the CLASSIFICATION question.
function itrOcclusionClassify(id, rawBlocking, holdPrior){
  if(!S.occlusionFadeState) S.occlusionFadeState = new Map();
  let entry = S.occlusionFadeState.get(id);
  const everClassified = !!(entry && entry.everClassified);
  if(!entry){
    entry = { blocking: false, opacity: 1, materials: null, everClassified: false };
    S.occlusionFadeState.set(id, entry);
  }
  const committed = itrOcclusionNextCommitted(rawBlocking, entry.blocking, everClassified, holdPrior);
  entry.everClassified = true;
  if(committed !== entry.blocking){
    entry.blocking = committed;
    const target = committed ? ITR_OCCLUSION_UPPER_OPACITY : 1;
    const dur = committed ? ITR_OCCLUSION_FADE_IN_MS : ITR_OCCLUSION_FADE_OUT_MS;
    if(!S.tweens) S.tweens = [];
    S.tweens = S.tweens.filter((tw) => !(tw && tw.isOcclusionFadeTween && tw.occlusionId === id)); // retarget, never stack
    const startOpacity = entry.opacity;
    const tw = {
      start: Date.now(), dur, isOcclusionFadeTween: true, occlusionId: id,
      update: (t) => {
        const v = mf1Lerp(startOpacity, target, mf1EaseOutCubic(t));
        entry.opacity = v;
        (entry.materials || []).forEach((m) => { if(m) m.opacity = v; });
      },
      onDone: () => {
        entry.opacity = target;
        (entry.materials || []).forEach((m) => { if(m) m.opacity = target; });
      }
    };
    S.tweens.push(tw);
    if(typeof markDirty === "function") markDirty();
    startTweenLoop();
  }
  entry.fading = entry.blocking || entry.opacity < 1 - 1e-3;
  return entry;
}
// STAGE-A A4 — the EXACT id string production classification uses (position-rounded, PLUS `yBase` —
// see below for why). `yBase` defaults 0 so every 2-arg caller (furniture, which never stacks two
// entries at one cell) keeps its pre-existing id shape untouched.
//
// THE COLUMN-CAP COLLISION (found live testing this unit against a real generated dungeon): BW2-5's
// THE COLUMN DEMOTION stacks a "tapered" column's decorative CAP as a SEPARATE pillar-list instance at
// the SAME (x,z) as its own shaft (yBase=0 for the shaft, yBase=wallHeightBase for the cap — two real,
// independent occluder instances at one cell, not one). An id keyed on (kind,x,z) ALONE aliases them
// onto the SAME S.occlusionFadeState entry; since itrBuildOcclusionGhostPillarMeshes builds+assigns
// `entry.materials` once per instance IN ORDER, the shaft's own ghost mesh's material reference gets
// silently OVERWRITTEN by the cap's (built second) — the live tween then only ever mutates the CAP's
// material, leaving the SHAFT's ghost material frozen at its build-time opacity (1, pre-tick) forever:
// visually indistinguishable from fully opaque, defeating the fade for exactly the instance actually on
// the sightline. Reproduced via dev/battle-gate/capture-occlusion-real.mjs's real-dungeon ON/OFF/CONTACT
// capture (ON read pixel-identical to OFF on a genuine tapered-column room) before this fix; verified
// fixed after (see this unit's own report for the exact before/after numbers). `yBase` (rounded the
// same way x/z already are) discriminates the shaft from the cap without needing to know BW2-5's own
// column-family internals — any two same-cell stacked prisms (a future doorframe-header family too)
// get their own independent entries the same way.
function itrOcclusionIdFor(kind, x, z, yBase){
  const yb = (typeof yBase === "number") ? yBase : 0;
  return kind + ":" + (Math.round((x || 0) * 1000) / 1000) + "," + (Math.round((z || 0) * 1000) / 1000) + ":" + (Math.round(yb * 1000) / 1000);
}
// ROOM-SHELL COMPILER (docs/ROOM-SHELL-COMPILER.md): default ON, reversible — the SAME
// "let + window.Theater._set*ForTest setter" convention ITR_OCCLUSION_FADE_DISABLED_FOR_TEST just
// above already established for a live/harness A-B toggle. ON: the active room's floor/wall/riser
// come from compileRoomShell(...) (a continuous compiled shell) instead of the per-cell
// interiorBuildInstancedMesh floor/wall pass below. OFF: byte-identical to pre-this-unit rendering —
// the documented escape hatch during migration (ROOM-SHELL-COMPILER.md's own "keep the old path
// behind a diagnostic flag" instruction, mirroring A1's ITR_ACTIVE_ROOM_ONLY reversibility).

// split B6: the ROOM-SHELL COMPILER block that sat between itrOcclusionIdFor and
// itrSplitOccluderForAnkleGhost in the monolith (ITR_ROOM_SHELL + its rootGet/SetRoomShell accessors,
// ROOM_SHELL_POLYGON_KERNEL_FLAG, ITR_ROOM_SHELL_UV_DENSITY, ITR_ROOM_SHELL_RISER_DARKEN) stayed in
// theater-boot.js — shell compilation, not occlusion law.

// splits ONE occluding instance into its own SOLID ankle-height STUB (rendered in the normal opaque
// mesh, unchanged material/shadow behavior — byte-identical to a non-occluding instance except for its
// shorter sy) + a translucent GHOST spanning from the ankle up to the instance's own full original
// height (rendered in a separate ITR_OCCLUSION_GHOST_OPACITY overlay mesh, its own draw call — only
// built at all when at least one instance of that kind is actually occluding this frame). Preserves
// any pre-existing yBase (a stacked doorframe-header prism's own base offset, BW2-5) rather than
// assuming 0, so the stub/ghost pair is contiguous at whatever height the instance actually starts at.
function itrSplitOccluderForAnkleGhost(inst, ankleH){
  const origYBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
  const fullH = inst.sy || 1;
  const instTop = origYBase + fullH;
  // ABSOLUTE-ANKLE-BAND FIX (DOORFRAME OCCLUSION, found live re-gating dev/verify-bw2-1b-occlusion.mjs
  // --with-render checks 31/32/35): the solid "ankle" band is an ABSOLUTE world-Y range [0, ankleH] —
  // the true floor up to the true ankle height — NEVER relative to THIS instance's own local origin.
  // The pre-fix version measured `ankleH` from the instance's own y=0 regardless of where that instance
  // actually sat (`stubH = Math.min(fullH, ankleH)`), which is correct ONLY for a yBase=0 instance
  // (every wall, a pillar's own shaft). A stacked prism whose ENTIRE span already sits ABOVE the true
  // ankle band — a tapered pillar's own CAP (yBase=wallHeightBase, THE COLUMN-CAP COLLISION comment
  // above itrOcclusionIdFor) or a doorframe's BW2-5 arch-header prisms (yBase near the door's own top,
  // each prism itself only 0.16-0.22 tall — SHORTER than a typical ankleH) — has NO overlap with [0,
  // ankleH] at all. The old math still measured the cut from THAT prism's own y=0, so a short prism
  // whose own height was comparable to or under ankleH kept MOST OR ALL of itself as an opaque "stub"
  // (min(0.16, 0.18) = 0.16 — the WHOLE prism), defeating the fade for exactly the case this fix wires
  // in: a real THREE.Raycaster kept hitting the arch-header "stub" (still tagged plain "doorframe", not
  // "-ghost") even after occlusion classify correctly flagged it as blocking. Clamping the cut to the
  // instance's own [origYBase, instTop] range (stubTop, below) means a prism entirely above the band
  // reduces to a near-zero stub (rendered as InstancedMesh's own existing Math.max(0.01,...) scale
  // floor — negligible, never literally zero-scale) and hands its ENTIRE height to the ghost — no other
  // caller's math changes: for any yBase=0 instance, stubTop=min(instTop,ankleH) is exactly the old
  // `Math.min(fullH, ankleH)` result, byte-identical.
  const stubTop = Math.min(instTop, Math.max(origYBase, ankleH));
  const trueStubH = Math.max(0, stubTop - origYBase);
  // THE "sy:0 IS UNSET" FOOTGUN (found live re-gating checks 31/32/35 a SECOND time, after the
  // ABSOLUTE-ANKLE-BAND fix above still didn't clear them): interiorBuildInstancedMesh's own matrix
  // math reads `inst.sy || 1` for BOTH the box's scale AND its Y position -- a deliberate "an instance
  // that never set sy at all defaults to a unit box" convention every OTHER caller in this file relies
  // on. But `trueStubH` above can be EXACTLY 0 (a prism entirely above the ankle band, the archStep2
  // case) -- and 0 is JS-falsy, so `0 || 1` silently becomes 1: the "fully ghosted, no stub" instance
  // rendered as a FULL 1-WORLD-UNIT solid box instead of vanishing, still very much on the sightline
  // (confirmed live: the raycast kept hitting the exact same instance, at a shifted distance, after the
  // band fix alone). A tiny nonzero floor (ITR_OCCLUSION_STUB_MIN_HEIGHT, truthy, so `sy || 1` reads it
  // literally) sidesteps the footgun without changing interiorBuildInstancedMesh's own shared contract --
  // that function's EXISTING `Math.max(0.01, ...)` scale floor then clamps this sliver to its own
  // already-negligible render minimum, same as any other tiny instance.
  const stubH = trueStubH > 1e-6 ? trueStubH : ITR_OCCLUSION_STUB_MIN_HEIGHT;
  // ANKLE-STUB BLOOM FIX (see ITR_OCCLUSION_STUB_DARKEN's own header, above this file's A4 tunables):
  // the stub's own per-instance color is darkened here — this is the ONLY place a stub descriptor gets
  // built, so every occlusion-fade caller (wall/pillar/round-pillar/furniture/doorframe) is covered
  // without touching any shared material/lighting code. The pre-cut instance's OWN color is left
  // untouched on `inst` itself (only the derived `stub` descriptor is darkened) — a non-occluding
  // instance, or the SAME instance before/after it's classified blocking, always renders at its normal
  // authored color.
  const stub = Object.assign({}, inst, { yBase: origYBase, sy: stubH, color: itrScaleHexValue(inst.color || "#ffffff", ITR_OCCLUSION_STUB_DARKEN) });
  const ghostH = instTop - stubTop;
  const ghost = ghostH > 1e-6 ? Object.assign({}, inst, { yBase: stubTop, sy: ghostH }) : null;
  return { stub, ghost };
}
// ─── ADDENDUM (Adam, mid-flight on BW2-1b) — THE CLIP MARGIN LAW: "the sprites shouldn't clip
// through geometry." A standee's own quad footprint must not intersect a neighboring prism's
// (wall/pillar/doorframe) XZ bounds — a WIDE sprite standing hard against a wall/pillar pokes its own
// silhouette through the geometry (the treant-against-the-wall bug, loop-03). Modeled as a circle
// (radius = the sprite's own rendered half-width — a conservative, direction-agnostic footprint,
// since a camera-facing billboard's silhouette sweeps differently depending on view yaw) vs. each
// nearby prism's axis-aligned box; any overlap NUDGES the standee's own MOUNT POSITION away from the
// offending prism (never the geometry, never cell ownership/combat-grid occupancy — a pure visual
// offset), clamped to CLIP_NUDGE_MAX_FRAC (0.3, "<=30% of a cell" per the GRID LAW's 1-cell=1-world-
// unit convention) of total push magnitude; a push that would need MORE than that to fully resolve
// logs a qa: sprite-oversize console warning and applies the CLAMPED nudge instead (never teleports
// the standee off its own cell). Pure geometry (no THREE) — same jsdom-testable-without-a-renderer
// discipline this unit's own itrPillarCutawayMask family (above) already established.

// nearest point on an axis-aligned box to (px,pz), clamped per-axis — the standard closest-point
// primitive every circle-vs-AABB test builds on.
function itrClosestPointOnAabbXZ(px, pz, box){
  return { x: Math.max(box.minX, Math.min(px, box.maxX)), z: Math.max(box.minZ, Math.min(pz, box.maxZ)) };
}
// circle (center px,pz, radius r) vs one AABB — the push vector that would move the CIRCLE's center
// just clear of the box, or null when there's no overlap at all. A center exactly inside/on the box
// (dist===0, the fully-degenerate case) falls back to pushing away from the box's OWN center instead
// — an arbitrary but fully deterministic direction; never reached by any real mount (a standee's own
// cell is never a wall/pillar cell to begin with), a defensive floor rather than a path any fixture
// below actually exercises.
function itrCircleAabbPushXZ(px, pz, radius, box){
  const closest = itrClosestPointOnAabbXZ(px, pz, box);
  let dx = px - closest.x, dz = pz - closest.z;
  let dist = Math.hypot(dx, dz);
  if(dist >= radius) return null;
  if(dist < 1e-6){
    const boxCx = (box.minX + box.maxX) / 2, boxCz = (box.minZ + box.maxZ) / 2;
    dx = px - boxCx; dz = pz - boxCz;
    dist = Math.hypot(dx, dz);
    if(dist < 1e-6){ dx = 0; dz = 1; dist = 1; }
  }
  const overlap = radius - dist;
  return { x: (dx / dist) * overlap, z: (dz / dist) * overlap };
}
// prism boxes (RAW, pre-cx/cz-shift cell space — the SAME space every wall/pillar/doorframe instance
// list already uses) gathered off one or more instance lists, restricted to instances within `reach`
// cells of (cellX,cellY) — a cheap spatial prefilter, since a standee/card's own footprint never
// reaches across an entire large plan.
function itrNearbyPrismBoxes(instanceLists, cellX, cellY, reach){
  const boxes = [];
  (instanceLists || []).forEach((list) => {
    (list || []).forEach((inst) => {
      if(!inst) return;
      if(Math.abs((inst.x || 0) - cellX) > reach || Math.abs((inst.z || 0) - cellY) > reach) return;
      const halfX = Math.max(0.01, (inst.sx || 1)) / 2, halfZ = Math.max(0.01, (inst.sz || 1)) / 2;
      boxes.push({
        minX: (inst.x || 0) - halfX, maxX: (inst.x || 0) + halfX,
        minZ: (inst.z || 0) - halfZ, maxZ: (inst.z || 0) + halfZ
      });
    });
  });
  return boxes;
}
const CLIP_NUDGE_MAX_FRAC = 0.3;      // "<=30% of a cell" (GRID LAW: 1 cell = 1 world unit)
// itrClipNudgeFor(cellX, cellY, radius, instanceLists, opts) -> {x,z,magnitude,rawMagnitude,clamped}
// sums the push vector from EVERY overlapping nearby prism (never just the first hit), then clamps
// the TOTAL magnitude to opts.maxMag (default CLIP_NUDGE_MAX_FRAC) — opts.reach overrides the spatial
// prefilter radius (defaults to radius+1, generous enough for any real sprite/card footprint).
function itrClipNudgeFor(cellX, cellY, radius, instanceLists, opts){
  opts = opts || {};
  const reach = opts.reach != null ? opts.reach : radius + 1;
  const maxMag = opts.maxMag != null ? opts.maxMag : CLIP_NUDGE_MAX_FRAC;
  const boxes = itrNearbyPrismBoxes(instanceLists, cellX, cellY, reach);
  let pushX = 0, pushZ = 0;
  boxes.forEach((box) => {
    const push = itrCircleAabbPushXZ(cellX, cellY, radius, box);
    if(push){ pushX += push.x; pushZ += push.z; }
  });
  const rawMagnitude = Math.hypot(pushX, pushZ);
  if(rawMagnitude < 1e-9) return { x: 0, z: 0, magnitude: 0, rawMagnitude: 0, clamped: false };
  if(rawMagnitude <= maxMag) return { x: pushX, z: pushZ, magnitude: rawMagnitude, rawMagnitude, clamped: false };
  const scale = maxMag / rawMagnitude;
  return { x: pushX * scale, z: pushZ * scale, magnitude: maxMag, rawMagnitude, clamped: true };
}
// BW2-4b item 7c — BLOCKER-CELL EXCLUSION. A piece whose own cell sits ON a pillar/doorframe prism
// (the loop-05 wolf-on-a-pillar) reads as standing on top of the column, because its floor-contact
// samples the FLOOR top of that cell while the prism rises through it. itrClipNudgeFor only pushes a
// WIDE sprite off geometry it OVERLAPS — a piece centered dead-on a 1x1 pillar cell can still land
// inside it. This picks the nearest cell whose center is clear of every blocker box (BFS ring, ties
// broken deterministically by ring order then dx/dz), so piece placement excludes blocker cells
// outright. blockerLists = the pillar+doorframe prism lists (walls excluded — the clip nudge and the
// room's own perimeter already keep pieces off wall cells). Returns the ORIGINAL cell when it's clear.
function itrPointInAnyBox(x, z, boxes){
  for(let i = 0; i < boxes.length; i++){
    const b = boxes[i];
    if(x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ) return true;
  }
  return false;
}
function itrBlockerNudgeCell(cellX, cellY, blockerLists){
  const boxes = itrNearbyPrismBoxes(blockerLists, cellX, cellY, 4);
  if(!boxes.length || !itrPointInAnyBox(cellX, cellY, boxes)) return { x: cellX, y: cellY };
  for(let ring = 1; ring <= 4; ring++){
    let best = null;
    for(let dy = -ring; dy <= ring; dy++){
      for(let dx = -ring; dx <= ring; dx++){
        if(Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue; // ring shell only
        const nx = cellX + dx, ny = cellY + dy;
        if(itrPointInAnyBox(nx, ny, boxes)) continue;
        const d = dx * dx + dy * dy;
        if(!best || d < best.d || (d === best.d && (dy < best.dy || (dy === best.dy && dx < best.dx)))){
          best = { x: nx, y: ny, d, dx, dy };
        }
      }
    }
    if(best) return { x: best.x, y: best.y };
  }
  return { x: cellX, y: cellY }; // fully boxed-in (degenerate) — keep the original rather than fling far
}
// a large dressing card gets a tiny extra epsilon folded into its own footprint radius before the
// SAME itrClipNudgeFor call — "may TOUCH the wall plane (that's the point) but not pass through it":
// unlike a standee (which should clear the geometry entirely, clamp-and-warn on failure), a large
// card is INTENDED to sit flush against a wall — this only stops it clipping THROUGH, with no
// magnitude cap/warning (a card's own placement is already wall-adjacent by construction, dpAdjacentToWall,
// so the overlap here is always small).
const CLIP_DRESSING_EPSILON = 0.02;

// split B6: F1_COMBAT_CAM_CLAMP_FRAC / f1ClampCamFit followed the clip-margin block in the monolith and
// moved to src/ui/theater-camera.js with the rest of the fit family.

export {
  itrSegmentIntersectsAabb, itrPieceSightPoints, itrPillarCutawayMask,
  itrFurnitureOcclusionBoxFor, itrFurnitureOcclusionMask,
  ITR_PILLAR_STUB_FRAC, ITR_OCCLUSION_STEM_HEIGHT_U, itrPillarStubHeight, itrOcclusionAnkleHeight,
  ITR_OCCLUSION_UPPER_OPACITY, ITR_OCCLUSION_GHOST_OPACITY,
  ITR_OCCLUSION_FADE_IN_MS, ITR_OCCLUSION_FADE_OUT_MS, ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG,
  ITR_OCCLUSION_STUB_DARKEN, ITR_OCCLUSION_STUB_MIN_HEIGHT,
  itrOcclusionBearingDeg, itrOcclusionBearingDeltaDeg, itrOcclusionNextCommitted,
  itrOcclusionClassify, itrOcclusionIdFor, itrSplitOccluderForAnkleGhost,
  itrClosestPointOnAabbXZ, itrCircleAabbPushXZ, itrNearbyPrismBoxes, itrClipNudgeFor,
  itrPointInAnyBox, itrBlockerNudgeCell, CLIP_NUDGE_MAX_FRAC, CLIP_DRESSING_EPSILON
};
