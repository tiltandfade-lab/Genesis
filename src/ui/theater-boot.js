/* GENESIS MODULE — src/ui/theater-boot.js — BATTLE-THEATER T1 (docs/BATTLE-THEATER.md §2/§3/§7)
   + T1.5 PSX GRIT PASS (Adam's 2026-07-03 ruling: gritty PS1 — Vagrant Story surface feel, FFT
   board grammar; kill the clean/cartoon read).
   THE ONE ES-MODULE BOUNDARY FILE in Genesis. Everything else in this app is a classic <script>
   sharing global scope (CLAUDE.md: "ES-module migration is deferred (rides in with the eventual
   graphics engine)") — this file is that one sealed exception, loaded via
   `<script type="module" src="src/ui/theater-boot.js">` + an importmap resolving the bare "three"
   specifier to the vendored `vendor/three/three.module.js` (BATTLE-THEATER.md §2: "Classic scripts
   keep calling plain globals; module scope stays sealed inside the boot file"). It exposes exactly
   one classic-script-reachable surface: `window.Theater`.

   T1 scope (per the orchestrator's scope note on this unit): board render (tile columns, void
   background, orthographic camera + 90°-step rotation, flat Lambert materials, blob-shadow quads)
   + composed-cuboid FALLBACK figures for all five archetypes (biped/quadruped/flyer/serpent/swarm) —
   no glTF pack loading (T2), no verb/animation library beyond mount/setBoard/setUnits/rotate (T3),
   no terrain_change mutation replay (T4). Render-on-demand only: nothing repaints unless setBoard/
   setUnits/rotate/mount is called (SPEED-DOCTRINE hygiene, §2).

   T1.5 adds (this file only — theater-data.js's item-1 palette work is a separate, already-landed
   change this unit consumes): a LOW internal render resolution upscaled hard with CSS pixelation
   (the cheap robust PSX-blur route — no postprocessing chain), NearestFilter on every texture entry
   point, scene fog tuned so the far board edge just softens into the void, a per-env deep-void
   background (reads theaterBoardFrom's `env` field off the board data it's handed), an 80%-fill
   camera fit that's preserved across 90°-step rotation, 1.5x figure scale, VS-leaning (angular,
   longer-limbed, broader-shouldered, per-archetype-distinct) fallback figures, and a texture-hook
   surface (setTextures) that tints a manifest-supplied texture by the palette color instead of
   replacing the flat-color baseline outright.

   window.Theater = {
     mount(el)   -> bool. Creates the renderer/scene/camera inside `el`. Returns false (clean degrade,
                    no throw) if WebGL is unavailable or `el` is falsy — callers must treat a false
                    return as "the theater isn't here," never as an error to surface. Also attempts a
                    silent, best-effort fetch of assets/textures-psx/manifest.json (T1.5 item 4) —
                    a missing/failed fetch degrades to palette-only with no console error surfaced to
                    the caller (a 404 in dev tools is expected/harmless when the parallel asset unit
                    hasn't landed yet).
     setBoard(d) -> void. `d` is a theaterBoardFrom(...)-shaped {tiles,props,grid,env}. Rebuilds the
                    tile mesh + prop columns from scratch (T1 has no incremental diffing — boards are
                    cheap, a whole fight's tile count tops out at 12x9=108 tiles). Re-fits the camera
                    to the new board's bounding box (80% fill) and re-tints the void/fog from `env`.
     setUnits(u) -> void. `u` is a theaterUnitsFrom(...)-shaped {units:[...]}. Rebuilds unit figures
                    (fallback composed-cuboids, VS-proportioned, 1.5x scale x per-size scalar) + their
                    tinted base discs (G5 ROUND-1 ruling 2: a miniatures-style base — ember foe/gold
                    PC/blue ally — REPLACES the old flat black blob-shadow as the hostility signal).
     setTextures(manifest) -> void. `manifest` is a flat {"stone":path, ...} semantic-key map (T1.5
                    item 4). Loads each path via THREE.TextureLoader with NearestFilter/no mipmaps and
                    caches it; the next setBoard/setUnits call tints matched tile kinds by texture
                    instead of flat color. Safe to call before or after mount(); safe to call with an
                    absent/empty manifest (no-op, palette-only stays the baseline).
     rotate()    -> void. Steps the camera 90° around the board's vertical axis (BATTLE-THEATER §1
                    rule 4: "rotatable in 90° steps only"), preserving the current fit/zoom.
     zoom(dir)   -> number|false (THEATER-ZOOM-SPREAD). Steps the ortho camera in (dir>0) or out
                    (dir<0) by ZOOM_STEP_FACTOR (1.25x/step), clamped to [ZOOM_MIN,ZOOM_MAX]=[0.45,2.5]
                    as a multiplier on the board's own auto-fit viewSize. Persists across rotate()/
                    setBoard() re-fits (both re-derive viewSize as fittedViewSize*zoomLevel, never
                    reset zoomLevel itself except on an actual board-size-shape change). Returns the
                    resulting zoomLevel, or false pre-mount / on a zero/non-finite dir (no-op).
     retire()    -> void. Disposes geometries/materials/renderer + detaches the canvas. Safe to call
                    on an unmounted instance (no-op).
     play(verb,opts) -> bool (T3, docs/BATTLE-THEATER.md §4). Plays a named verb tween (advance/
                    withdraw/strike/hurt/down/cast/arc/knockback/sink/burst/flee/absurdity, plus the
                    `fx:<damageType>` addressable elemental bursts) — see src/ui/theater-verbs.js for
                    the full verb table + opts shape per verb. Returns false (no-op) for an unknown
                    verb or before mount(); never throws. Starts a tween-tick rAF loop that stops
                    itself the instant no tween remains live (render-on-demand preserved).
     verbs       -> the frozen THEATER_VERBS array (src/ui/theater-verbs.js) — every verb name play()
                    accepts, re-exported here for classic-script introspection.
   }

   Every method is null-safe pre-mount (calling setBoard/setUnits/rotate before a successful mount()
   is a no-op, not a throw) so a caller can wire these up before the mount gate resolves.

   T3 adds `play(verb, opts)` (docs/BATTLE-THEATER.md §4 — the verb library). ALL verb/tween logic
   lives in src/ui/theater-verbs.js (a SEPARATE module file, imported below) — this file only builds
   the small `ctx` object that module's playVerb/tickTweens need (live THREE handles, unit lookup,
   zone->world resolution reusing this file's OWN board-fit bookkeeping) and drives the tween tick
   loop, kept deliberately thin so parallel units editing this file's figure geometry / palette
   constants don't collide with the verb work (the orchestrator's file-split instruction for this
   wave). Render-on-demand is preserved end to end: play() schedules a frame only while >=1 tween is
   live (tickTweens' own return value gates whether another frame gets scheduled), so an idle theater
   goes back to fully event-driven rendering the instant the last tween completes. */
import * as THREE from "three";
// BATTLE-THEATER T2 (docs/BATTLE-THEATER.md §7): GLTFLoader vendored under vendor/three/addons/ and
// reached via the importmap's `three/addons/` prefix (genesis.html) — the SAME offline/no-CDN law as
// three itself. Imported ONLY here (this file is the one ES-module boundary that already owns THREE);
// theater-figures.js stays THREE-free and receives the parsed scene through dependency injection.
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// BEAUTY-WAVE-3 BW3-0 (docs/BEAUTY-WAVE-3.md, THE COMPOSER SEAM): EffectComposer/RenderPass/
// ShaderPass vendored the SAME way GLTFLoader was (vendor/three/README.md's "T3" entry) — same
// pinned three@0.166.0, same `three/addons/` importmap prefix, same offline/no-CDN law. Imported
// ONLY here for the identical reason GLTFLoader is: this file is the one ES-module boundary that
// already owns THREE. RenderPass/ShaderPass aren't constructed by this unit (it adds zero passes —
// see createTheaterState's own comment on why), but are vendored+imported now so BW3-2/3/6 (the
// DoF/bloom/grade units that mount real passes onto this seam) don't each need their own vendor step.
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// split B4 (2026-07-25): ShaderPass / UnrealBloomPass / OutputPass were dropped from this block —
// their only readers (makeDofPass, makeGradePass, MaskedBloomPass, buildPostSuite) moved to
// src/ui/theater-post.js, which imports all three with these IDENTICAL specifier spellings. This file
// keeps EffectComposer (it constructs S.composer) and RenderPass (the BW3-0 empty-chain cost probe).
// CLAYROOM VISUAL CORRECTION Checkpoint 1 (docs/FABLE-CLAYROOM-VISUAL-CORRECTION-ASSIGNMENT.md):
// GTAOPass — three's maintained ground-truth ambient-occlusion pass, vendored VERBATIM from the SAME
// pinned three@0.166.0 release as every addon above (sha256 prefixes: GTAOPass 980b0367 ·
// GTAOShader 94edb104 · PoissonDenoiseShader 3dab419b · SimplexNoise 9b8d541b). Not a new
// dependency — the composer seam was built expecting later passes to vendor exactly this way (see
// the EffectComposer import note). Wrapped below (EnvironmentAOPass) so the vendored file stays
// byte-identical to upstream while the G-buffer prepass learns this codebase's one non-negotiable
// exclusion rule: transparent / non-depth-writing meshes (sprite billboard cards, contact-shadow
// pools, selection spills, overlay strips, glow discs) must never write occluder rectangles into
// the AO depth/normal buffer.
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { playVerb, tickTweens, THEATER_VERBS, theaterFxFromLedger, standeeVerbForHurt, recoilDirFromPositions } from "./theater-verbs.js";
// GRAPHICS-ENGINE Part II §A: the sibling billboard-standee verb library — see that file's header for
// why it's a separate module from theater-verbs.js (rotation-ownership conflict with
// updateSpriteBillboardYaw, below) and for the ctx-binding contract bindStandeeCtx/playStandeeVerb use.
import {
  playStandeeVerb,
  bindStandeeCtx,
  STANDEE_VERBS,
  // split B8: startIdleBreathe left this list — its ONE reader here was interiorBuildPieces (now
  // src/ui/theater-dressing.js, which imports it from this same module by the identical specifier).
  // Reader census run: every remaining mention in this file is prose in a comment.
  stopIdleBreathe
} from "./standee-verbs.js";
// split B1 (2026-07-25): the Clay Room workbench module — root->leaf import (acyclic; the clay
// module never imports this file — it receives capabilities via clayRoomInit(ctx) at this file's
// end-of-body, the same timing the region's own end-of-file position used to give it).
import {
  mountClayRoom, clayRoomBootSelfMount, clayRoomMaybeAutoMount,
  clayRoomCaptureLightingMatrix, clayRoomDoorProofState, clayRoomLightingPixelMetrics,
  clayRoomLightingSnapshot, clayRoomMaterialBenchSnapshot, clayRoomTrimBenchSnapshot, clayRoomMoodSnapshot,
  clayRoomMovementSession, clayRoomProvenanceAudit,
  clayRoomSetFixture, clayRoomSetLightingRecipe, clayRoomSetMaterialMode, clayRoomSetTrimMode, clayRoomSetMoodLayer,
  clayRoomSetSpriteScaleMode, clayRoomStructureClimbAttempt, clayRoomStructureClimbReset,
  clayRoomStructureClimbSnapshot, clayRoomStructureClimbTargetSet,
  clayRoomStructureFocusProofFamily, clayRoomStructureFocusSpec,
  clayRoomStructureParkActorOnStep,
  clayRoomSetStructureDoorState, clayRoomSetStructureStaged,
  clayRoomSetStructureView, clayRoomSurfaceCensus,
  CLAY_CAM_ZOOM_MIN, CLAY_CAM_ZOOM_MAX, CLAY_ROOM_LIGHTING_BENCH_ID, CLAY_ROOM_LIGHTING_MATRIX_RECIPES,
  CLAY_ROOM_LIGHT_PREVIEW_SEEDS, CLAY_ROOM_LORE_LIGHT_PREVIEWS, CLAY_ROOM_MATERIAL_BENCH_ID,
  CLAY_ROOM_TRIM_BENCH_ID,
  CLAY_ROOM_MOOD_EXAMPLES,
  clayRoomInit, clayRoomSyncState
} from "./theater-clay-room.js";
// split B2 (2026-07-25): the Light Lab module — same root->leaf ctx law as the clay room above.
import {
  mountLightLab, unmountLightLab, lightLabMaybeAutoMount, lightLabShouldEnable,
  lightLabApplyTunables, lightLabUndo, lightLabRedo,
  lightLabInit, lightLabSyncState, lightLabPublishSeams
} from "./theater-light-lab.js";
// split B3 (2026-07-25): the pixel-skin + floor-texture family — same root->leaf ctx law as the two
// modules above (it never imports this file; skinsInit(ctx) at end-of-body hands it the generic color
// helpers + nearestify, which stay root-owned because non-skin subsystems read them too).
// FLOOR_TEXTURE_CACHE is imported as the LIVE Map so disposeAuxCaches keeps its exact end-of-life job.
import {
  skinsInit, albedoFloor, pixelSkinCapable, pixelSkinTextureFor, disposePixelSkinCache,
  buildFloorCanvasTexture, FLOOR_TEXTURE_CACHE
} from "./theater-skins.js";
// split B3 (2026-07-25): the whole-object geometry/material factory + the GLB seam — same root->leaf
// ctx law (wholeObjectInit(ctx) at end-of-body carries applyPsxShaderTweaks, nearestify, the GLTFLoader
// class and probe-lib's resetGeom/getBuffers, so this file stays the one `three/addons/` import site).
import {
  wholeObjectInit, WHOLE_OBJECT_SCALE, WHOLE_OBJECT_YAW, GLB_TARGET_HEIGHT, glbLoadScene,
  wholeObjectKeyFor, wholeObjectGeometryFor, wholeObjectGeometryForGlb, wholeObjectMaterialsFor,
  wholeObjectRetintColorBuffer, disposeWholeObjectCaches
} from "./theater-whole-object.js";
// split B3 (2026-07-25): figureFor's resolution chain + the legacy weaponMeshFor composer. Same
// root->leaf ctx law, but its figureBuildInit(ctx) runs at END-OF-BODY (not up here with the two
// above): this ctx carries top-level `const`s — ARCHETYPE_BUILDERS, WEAPON_PART_KEY — that are still
// in their temporal dead zone at import time, and nothing reaches figureFor/weaponMeshFor before the
// file's last statement anyway. MODEL_PATH_STATS comes back as the LIVE counter the facade publishes.
import {
  figureBuildInit, figureFor, weaponMeshFor, MODEL_PATH_STATS
} from "./theater-figure-build.js";
// split B4 (2026-07-25): the post-processing suite + environment AO — same root->leaf ctx law as the
// modules above, but this one READS AND WRITES the live state record, so postInit(ctx) at end-of-body
// is paired with postSyncState(S) at both `S = createTheaterState()` sites. It is the `three/addons/
// postprocessing` home for its own passes (ShaderPass/UnrealBloomPass/OutputPass/GTAOPass + its own
// RenderPass), which is why those imports left this file's block above.
import {
  // split B6: `updateDofFocus` left THIS list — after B6 its only two call sites in the whole file
  // were placeCameraTweened's per-tick and onDone DoF re-focus, which moved to
  // src/ui/theater-camera.js; that module now imports it straight from theater-post.js (leaf->leaf,
  // identical specifier, same module instance, same function identity). Reader census run: every
  // remaining `updateDofFocus` string in this file is prose inside a comment, so the binding was
  // dead and is trimmed rather than carried.
  postInit, postSyncState, makeGradePass, mountPostSuite, teardownPostSuite,
  syncPostSuiteResolution, updatePostSuiteGrade,
  envAOEnabled, envAOPrepassExcludes,
  ENV_AO_BLEND_INTENSITY, ENV_AO_DENOISE, ENV_AO_ENABLED_DEFAULT, ENV_AO_PARAMS, ENV_AO_RESOLUTION_SCALE
} from "./theater-post.js";
// split B4 (2026-07-25): the three pure scene-graph disposal helpers. No ctx, no init, no state —
// see that file's header. retire()/disposeAuxCaches stay in THIS file (the one end-of-life point).
import { clearGroup } from "./theater-dispose.js";
// split B5 (2026-07-25): the BOARD LIGHTING family + the ENV-1/1B/1c tabletop passes + the two interior
// camera-side lights + the PRACTICAL FLICKER SCHEDULER — same root->leaf ctx law as the modules above.
// It reads AND writes the live state record, so lightingInit(ctx) at end-of-body is paired with
// lightingSyncState(S) at both `S = createTheaterState()` sites. The lighting CONSTS this root still
// owns (STAGE_AMBIENT_FLOOR + the rest of the LIGHT_TUNABLES seed set, ITR_CAMERA_KEY_*,
// SPRITE_CAMERA_FILL_*, gradeColorLocal) stay here and reach that module through its ctx.
// Censused: this list is exactly the lighting surface THIS file still has a live (non-comment) call
// site for. theater-lighting.js also exports TABLETOP_EXTERIOR_LOOK and CELESTIAL_MIN_KEY_HEIGHT —
// both read only inside that module and by theater-practicals.js's own leaf->leaf import — so they
// are deliberately NOT imported here rather than carried as dead bindings.
import {
  LIGHT_PROFILES, LIGHT_DEFAULT_PROFILE, lightProfileFor, applyLightProfile,
  CELESTIAL_ARC, applyCelestialArc,
  updateSpriteCameraFill,
  lightFlickerApplySample, lightFlickerStep,
  startLightFlicker, stopLightFlicker,
  lightingInit, lightingSyncState
} from "./theater-lighting.js";
// split B5 (2026-07-25): the interior PRACTICAL-FIXTURE family (E0 visible practicals, the U3
// shadow-caster budget, the glow disc / light card / emitter nub / light-shaft cone builders and
// interiorBuildLights itself). Same root->leaf ctx law; censused to never read S, so no SyncState. It
// imports four symbols straight from theater-lighting.js (a one-way leaf->leaf edge — see its header).
// The four mutable practical gates stay HERE (three reach it through ctx accessors, the fourth has no
// body reader at all) — see the "INTERIOR PRACTICALS: extracted" note further down.
// Censused: only these two have a live (non-comment) call site left in THIS file —
// interiorBuildLights (setInteriorBoard + two window.Theater seams) and interiorBuildLightCone
// (window.Theater._interiorBuildLightConeForTest). The module's other exports
// (interiorBuildFixtureGroup / interiorBuildGlowDisc / interiorBuildLightCard /
// interiorBuildLightEmitterNub / interiorAssignShadowCasters / ITR_LIGHT_DISTANCE_CAP /
// INTERIOR_SHADOW_CASTER_CAP / INTERIOR_SHADOW_MAP_SIZE) are read only inside that module — the
// root's own mentions of them are prose in comments — so they are deliberately NOT imported here.
import {
  interiorBuildLights, interiorBuildLightCone,
  practicalsInit
} from "./theater-practicals.js";
// split B5 (2026-07-25): VP6's ambient mote field and its OWN drift scheduler — a separate rAF loop
// from the flicker scheduler above and from this file's dirty-frame/tween loops (nothing was unified).
// Same root->leaf ctx law; it reads S, so motesInit(ctx) at end-of-body is paired with motesSyncState(S)
// at both `S = createTheaterState()` sites.
import {
  interiorBuildMotes, stopMoteDrift,
  motesInit, motesSyncState
} from "./theater-motes.js";
// split B6 (2026-07-25): the CAMERA / FIT / SHOT family — the authored angles and margins, the one
// instant fit (placeCamera) and MF-1's glide wrapper, refitTabletopHeightFit's height combiner, the
// BW2-1 room/beat fit resolvers, STAGE-A A3's shot-compose projector and F1's combat-fit clamp. Same
// root->leaf ctx law; it reads AND writes the live state record, so cameraInit(ctx) at end-of-body is
// paired with cameraSyncState(S) at both `S = createTheaterState()` sites. It owns NO scheduler — the
// camera glide still rides the shared S.tweens/tickTweens channel through the startTweenLoop this root
// still owns. FOG_FAR / HUMAN_TRUE_HEIGHT / spriteEntryFor / markDirty / startTweenLoop stay HERE and
// reach it through ctx; it imports updateDofFocus straight from theater-post.js (leaf->leaf).
// Censused: this list is exactly the camera surface THIS file still has a live (non-comment) call site
// for. theater-camera.js also owns CAM_FIT_MARGIN, TABLETOP_CAMERA_HEADROOM, MF1_CAMERA_TWEEN_DUR,
// INTERIOR_ROOM_FIT_PAD, INTERIOR_BEAT_MARGIN_CELLS, shotScratchCamera, shotNumOr and shotCameraAspect
// — all read only inside that module — so they are deliberately NOT imported here rather than carried
// as dead bindings.
import {
  CAM_YAW_OFFSET_DEG, INTERIOR_FIT_HALF_FLOOR,
  mf1EaseOutCubic, mf1Lerp, placeCamera, placeCameraTweened,
  shotProjectFor,
  cameraInit, cameraSyncState
} from "./theater-camera.js";
// split B6 (2026-07-25): the OCCLUSION / CUTAWAY family — BW2-1b's sightline geometry and per-instance
// cutaway masks, STAGE-A A4's fade classifier with its bearing hysteresis, the ankle-stub/ghost
// splitter, and the CLIP MARGIN LAW's nudge helpers. Same root->leaf ctx law; it reads AND writes S
// (S.occlusionFadeState + the shared S.tweens channel), so occlusionInit(ctx) at end-of-body is paired
// with occlusionSyncState(S) at both `S = createTheaterState()` sites. It imports mf1EaseOutCubic +
// mf1Lerp straight from theater-camera.js (a one-way leaf->leaf edge — see its header), which is why
// its <script type="module"> tag follows theater-camera.js's. Censused THREE-free: the two ghost MESH
// builders (itrBuildOcclusionGhostMeshes / itrBuildOcclusionGhostPillarMeshes) and
// ITR_OCCLUSION_FADE_DISABLED_FOR_TEST stay HERE. Censused: this list is the occlusion surface THIS
// file still references live — most of the tail entries exist only because window.Theater's
// _occlusionLawForTest / _clipMarginLawForTest publish blocks below are still assembled in this file,
// which is exactly how those two published objects keep their old shape AND their old function
// identities. ITR_OCCLUSION_STUB_DARKEN, ITR_OCCLUSION_STUB_MIN_HEIGHT and itrPointInAnyBox are read
// only inside that module, so they are deliberately NOT imported here.
import {
  itrSegmentIntersectsAabb, itrPieceSightPoints, itrPillarCutawayMask,
  itrFurnitureOcclusionBoxFor, itrFurnitureOcclusionMask,
  ITR_PILLAR_STUB_FRAC, ITR_OCCLUSION_STEM_HEIGHT_U, itrPillarStubHeight, itrOcclusionAnkleHeight,
  ITR_OCCLUSION_UPPER_OPACITY, ITR_OCCLUSION_GHOST_OPACITY,
  ITR_OCCLUSION_FADE_IN_MS, ITR_OCCLUSION_FADE_OUT_MS, ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG,
  itrOcclusionBearingDeg, itrOcclusionBearingDeltaDeg, itrOcclusionNextCommitted,
  itrOcclusionClassify, itrOcclusionIdFor, itrSplitOccluderForAnkleGhost,
  itrClosestPointOnAabbXZ, itrCircleAabbPushXZ, itrNearbyPrismBoxes, itrClipNudgeFor,
  CLIP_NUDGE_MAX_FRAC, CLIP_DRESSING_EPSILON, // split B8: itrBlockerNudgeCell left this list — its ONE reader here was interiorBuildPieces (now src/ui/theater-dressing.js, which imports it from this same module by the identical specifier). Reader census run: every remaining mention in this file is prose in a comment.
  occlusionInit, occlusionSyncState
} from "./theater-occlusion.js";
// split B7 (2026-07-25): the STANDEE BASE/CONTACT family — CL-R2's visible support plinth and its
// collision resolver, BW2-2's contact line + soft MULTIPLY contact pool, BW2-2b's turn glow. Same
// root->leaf ctx law; it reads AND writes S (S.standeeCollisionAudit/Dirty), so standeeMountInit(ctx)
// at end-of-body is paired with standeeMountSyncState(S) at both `S = createTheaterState()` sites. It
// imports only "three" — no sibling edge at all. THE KILTER (kilterFor/KILTER_*), the FLOOR half of
// the contact law (interiorFloorTopMapFrom/interiorFloorTopAt/ITR_FLOOR_BASE_Y/
// ITR_FLOOR_HEIGHT_FALLBACK — all dev/verify-d4-doors.mjs text-extraction pins) and addWallContactAO
// (dressing-owned by its one caller) stay HERE.
import {
  INTERIOR_BASE_HEIGHT, INTERIOR_BASE_TREAD_DEPTH, INTERIOR_BASE_Y_OFFSET,
  interiorStandeeSupportMetrics, interiorStandeeContactY, buildInteriorBase, setBaseGlow,
  mountedStandeeFigures, resolveMountedStandeeSupportCollisions, syncStandeeContactBlob,
  interiorPoolTexture, interiorPoolMaterial, // split B8: interiorPoolGeoFor left this list — its ONE reader here was addWallContactAO (now src/ui/theater-dressing.js, which imports it from this same module by the identical specifier, so the AO still uses the SAME shared geometry cache). Reader census run.
  INTERIOR_POOL_Y_OFFSET, addInteriorContactBlob,
  standeeMountInit, standeeMountSyncState
} from "./theater-standee-mount.js";
// split B7 (2026-07-25): the SPRITE / BILLBOARD family — the texture cache + async loader, the SRD
// size ladder, the billboard mesh constructor with its STANDEE-WINS-TIES depth-bias shader injection,
// the tabletop + interior TRUE-SCALE wrappers, and the per-render facing pass. Same root->leaf ctx
// law; it reads AND writes S, so spritesInit(ctx) at end-of-body is paired with spritesSyncState(S)
// at both `S = createTheaterState()` sites. It takes CAM_ELEV_DEG/CAM_YAW_OFFSET_DEG from
// theater-camera.js, updateSpriteCameraFill from theater-lighting.js and the standee mount trio from
// theater-standee-mount.js as one-way leaf->leaf edges (see its header), which is why its
// <script type="module"> tag follows all three. FACETED_FLIP_ENABLED, spriteAssetPathFor,
// spriteEntryFor + the registry JOIN, SPRITE_CHANNEL_ENABLED, SPRITE_UNLIT_DEBUG and
// ITR_SPRITE_EMISSIVE_TINT stay HERE — censused, see that file's header for each.
import {
  SPRITE_TEXTURE_CACHE, SPRITE_TEXTURE_SRC, spriteSizeScaleFor, spriteTextureFor,
  SPRITE_DEPTH_BIAS_MATERIALS, spritesSetDepthBiasUnits, spritesGetDepthBiasUnits,
  buildSpriteBillboardMesh, buildSpriteBillboard, interiorSpriteBillboard, updateSpriteBillboardYaw,
  spritesInit, spritesSyncState
} from "./theater-sprites.js";
// split B7 (2026-07-25): the OVERLAY family — VP6's decals + hit-effect cards, VP5's diegetic
// selection ring with MF-4's 300ms slide, VP5's damage floaters and their unit->screen projector.
// Same root->leaf ctx law; it reads AND writes S (S.actingIds/actingRingMeshes/actingGlowBaseMeshes/
// effectTexCache + the shared S.tweens channel), so overlaysInit(ctx) at end-of-body is paired with
// overlaysSyncState(S) at both `S = createTheaterState()` sites. It imports mf1EaseOutCubic/mf1Lerp
// from theater-camera.js and setBaseGlow from theater-standee-mount.js (one-way leaf->leaf edges).
// findUnit (a dev/verify-standee-verbs.mjs text pin) and every facade seam stay HERE.
import {
  INTERIOR_DECAL_Y_OFFSET, interiorBuildDecals, EFFECT_CARD_DUR, effectCardFor, spawnEffectCard,
  setActingUnit, projectUnit, spawnFloater,
  overlaysInit, overlaysSyncState
} from "./theater-overlays.js";
// split B8 (2026-07-25): the INTERIOR MESH / GL-SURFACE family — the two texture channels, the two
// shared geometries, the two pure per-instance colour passes, the one InstancedMesh constructor every
// interior world surface is built by, the pillar profile split and A4's two ghost-mesh builders. Same
// root->leaf ctx law; censused to NEVER read S, so it takes no SyncState — interiorMeshInit(ctx) at
// end-of-body is the whole wiring. applyPsxShaderTweaks / nearestify / textureLoader / markDirty stay
// HERE and reach it through that ctx; materialTexturePixels / MATERIAL_TEXEL_PX stay the bare classic
// globals they always were. Censused: this list is exactly the mesh surface THIS file still has a live
// (non-comment) call site for — interiorFileTexture, interiorUnitBoxGeometry, interiorCylinderGeometry
// and the three caches are read only inside that module (and, for interiorFileTexture, by
// src/ui/theater-dressing.js's own leaf->leaf import), so they are deliberately NOT imported here.
import {
  interiorBuildInstancedMesh,
  interiorMeshInit, interiorMeshFileTexPending
} from "./theater-interior-mesh.js";
// split B8 (2026-07-25): the DRESSING / PROPS family — the dressing texture channel with its async
// real-art settle, the card/extrusion/furniture builders, the wall-hang placement law, BW2-2b's
// wall-contact AO, and the four group builders setInteriorBoard dresses a room with. Same root->leaf
// ctx law; it reads AND writes S, so dressingInit(ctx) at end-of-body is paired with
// dressingSyncState(S) at both `S = createTheaterState()` sites. It imports interiorFileTexture from
// theater-interior-mesh.js, interiorSpriteBillboard from theater-sprites.js, the mount/pool quartet
// from theater-standee-mount.js, the nudge trio from theater-occlusion.js and bindStandeeCtx/
// startIdleBreathe from standee-verbs.js — five one-way leaf->leaf edges (see its header), which is
// why its <script type="module"> tag follows all of theirs. The MF-2 grace glue, spriteEntryFor,
// kilterFor, interiorFloorTopAt, SPRITE_UNLIT_DEBUG and ITR_SPRITE_EMISSIVE_TINT stay HERE — censused,
// see that file's header for each. Censused: this list is exactly the dressing surface THIS file still
// has a live (non-comment) call site for; dressingCardHeight, the caches, the panel/edge-colour
// helpers, WALL_AO_* and the ITR_WALLHANG_* knobs are read only inside that module (the root's
// _wallHangLawForTest seam takes the four law tables it publishes), so nothing else is carried here.
import {
  dressingTextureFor,
  buildFurnitureAssembly,
  ITR_WALL_SIDE_YAW, ITR_WALL_SIDE_NORMAL, ITR_WALLHANG_HEIGHT_FRAC, ITR_WALLHANG_WALL_OFFSET,
  interiorBuildWallProps, addWallContactAO,
  interiorBuildPieces, interiorBuildDressing,
  dressingInit, dressingSyncState
} from "./theater-dressing.js";

// ---- split B9 (2026-07-25): THE TWO SCENE REALIZERS ----
// docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md §"Suggested migration method" item 5: "preserve the flat
// tabletop and interior paths as distinct consumers of shared capabilities. Keep setInteriorBoard
// orchestration readable; do not merely move a single 5,000-line function unchanged and call the split
// complete." src/ui/theater-tabletop.js owns setBoard/setUnits (plus REALM-PROPS-WIRING §3's prop
// footprint family and DEAD-STATE's desaturateGroup); src/ui/theater-interior-realize.js owns
// setInteriorBoard — DECOMPOSED there into seventeen named phase functions over one explicit `pass`
// context, each phase body a verbatim-lifted range of the pre-split function (its header carries the
// phase map) — plus setInteriorVariant, F1's combat grid and interiorLightingIdentityFor. The two are
// PEERS: neither imports the other, and each reaches the shared leaves (camera / lighting / post /
// dressing / standee-mount / sprites / occlusion / interior-mesh / overlays / motes / practicals /
// room-mesh / shot / clay-room) directly with this file's own specifiers. This root keeps mount() /
// reattach() / retire() / rotate() / zoom() / play() and every ctx literal below now hands the
// IMPORTED realizer bindings to the modules that replay through them (dressing's async art settle,
// sprites' texture settle, the Light Lab, the Clay Room) — the same function objects window.Theater
// publishes, so facade identity is unchanged.
import { setBoard, setUnits, tabletopInit, tabletopSyncState } from "./theater-tabletop.js";
import {
  setInteriorBoard, setInteriorVariant, f1BuildCombatGrid,
  interiorRealizeInit, interiorRealizeSyncState,
} from "./theater-interior-realize.js";
// BEAUTY-WAVE-4.md MF-2 (SPAWN/DESPAWN GRACE): the sibling zero-THREE-coupling tween-producer module —
// see that file's own header for why mount/despawn/cascade/room-transition tweens live there instead of
// as closures in this file (unit-testable via a real Node `import`, no jsdom/sandbox needed).
import {
  pushMountGrace, pushDespawnGrace, seededCascadeDelays,
  MOUNT_GRACE_DUR, DESPAWN_GRACE_DUR, DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS,
} from "./spawn-grace.js";
import * as Parts from "./theater-parts.js";
// split B3 (2026-07-25): WHOLE_OBJECT_REGISTRY + NEAREST_SUB dropped from this import — their only
// reader here was _classifyWholeKey, which moved to src/ui/theater-figure-build.js and imports them
// from this same module itself. resolveWholeObject/loadWholeObjectBuilders still have root call sites.
import { resolveWholeObject, loadWholeObjectBuilders } from "./theater-figures.js";
// KS-2 (docs/KENNEY-SOCKET-WAVE.md, "the doorway becomes an assembly"): the KS-1 donor loader —
// loadDonorPiece resolves a normalized Kenney piece (materials rebuilt, sockets on userData.sockets)
// as a fresh THREE.Group clone; socketsByType is the flat-array convenience filter. See this file's
// own KIT_DOOR_TEMPLATE preload (module scope, mirrors loadWholeObjectBuilders/glbLoadScene's own
// preload-then-clone convention just below) and interiorBuildKitDoorMesh (near
// interiorBuildInteractableDoorMesh) for the actual mount.
import { loadDonorPiece, socketsByType } from "./theater-donor.js";
// A1 SOCKET ALGEBRA (docs/CLAYROOM-PROOF-BACKLOG.md § A1, decision-log D1) — 2026-07-27. A socket
// record's seat position lives at `frame.position`, never at a flat `.position`; socketPosition()
// is the ONE accessor a reader uses, so a later frame change (a measured normal, a moved origin)
// cannot silently desync the two kit-door/floor-mount read sites below.
import { socketPosition } from "./theater-socket-algebra.js";
// ROOM-SHELL COMPILER (docs/ROOM-SHELL-COMPILER.md; docs/GRAPHICS-NORTH-STAR.md Stage C unit C4): the
// active room's cells compiled into a CONTINUOUS shell (floor polygon + wall/riser quad-strips) instead
// of the per-cell InstancedMesh box read below — see this file's own ITR_ROOM_SHELL flag + itrBuild*
// call site (setInteriorBoard) for the wire-in. compileRoomShell is the thin THREE assembler; this file
// still owns every material (Stage E's job, not this unit's).
// ---- split B9 (2026-07-25): the C4 ROOM-SHELL COMPILER import is gone from this file. compileRoomShell /
// ROOM_SHELL_TIER_QUANTUM / segmentNormal had exactly one consumer each — setInteriorBoard's shell block —
// which now lives in src/ui/theater-interior-realize.js and imports them there with this same specifier.
// (src/ui/theater-clay-room.js imports the same two directly too; all three resolve to one instance.)
// GRAPHICS-NORTH-STAR.md STAGE A unit A3 (docs/STAGE-A.md; docs/WALK-NATIVE-A.md A3): the pure shot
// planner/compositor theater-shot.js's own header flagged this file as the eventual importer ("A3
// wires the real camera in"). shotPlanFrom/composeShot/defaultCameraCandidates are pure (no THREE, no
// DOM) — this file supplies the one thing they can't own themselves: a real multi-pose projector (see
// shotProjectFor, near interiorCameraFitFor below) and the wiring at setInteriorBoard's fit seam.
// ---- split B9 (2026-07-25): the STAGE-A A3 shot-compose + C4.1b wall-upper-blocking imports are gone from
// this file. shotPlanFrom / composeShot / defaultCameraCandidates / wallUpperBlockingSet /
// wallUpperCameraSideBlockingSet / OCCLUSION_SUBJECT_EYE_HEIGHT were read ONLY inside setInteriorBoard
// (the shot-compose fit and the wall-upper occlusion pass); src/ui/theater-interior-realize.js imports
// them with this same specifier. window.Theater.shotProjectFor is still republished below off
// src/ui/theater-camera.js's own binding (unchanged identity).
// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 3): a STATIC import of probe-lib.js itself —
// every dev/model-qa/creatures/*.js module ALSO imports probe-lib.js by the identical relative
// specifier (resolved from dev/model-qa/, '../probe-lib.js'), which both Node and browsers resolve
// to the exact same cached module instance keyed by resolved URL — so this file's own resetGeom()/
// getBuffers() calls (wholeObjectGeometryFor below) operate on the SAME module-scope POS/COL/CHAN
// buffers a just-invoked creature builder wrote into, exactly like ps1-sheet.html's own figureScene
// convention (resetGeom(); fn(); const {POS,COL,CHAN} = getBuffers();). A static (not dynamic) import
// keeps this synchronously available at module-evaluation time — no promise/timing seam to manage.
import { resetGeom as wholeObjectResetGeom, getBuffers as wholeObjectGetBuffers } from "../../dev/model-qa/probe-lib.js";

/* ---- split B3 (2026-07-25): wire the two pure-resource leaves BEFORE this file's own body runs ----
   The Clay Room / Light Lab inits sit at end-of-body because their ctx carries the live `S` record,
   which does not exist yet up here. These two carry NOTHING but capabilities — hoisted top-level
   function declarations (clamp255/hexToRGB/rgbToHex/scaleRGB/lumaOf/nearestify/applyPsxShaderTweaks)
   and import bindings (GLTFLoader, probe-lib's resetGeom/getBuffers) — all of which are already live
   at module-eval start, so wiring here is legal AND necessary: this file's own top-level
   loadWholeObjectBuilders(..., glbLoadScene) call (below, well before end-of-body) invokes the
   injected loader SYNCHRONOUSLY for every .glb registry entry, which reaches `new GLTFLoader()` inside
   the whole-object module. An end-of-body init would leave that mirror undefined for exactly those
   boot-time loads (proven: it turned dungeon-interior's four scenarios into "GLTFLoader is not a
   constructor" and timed the surface gate out). Wire once, wire first. */
skinsInit({
  clamp255,
  hexToRGB,
  lumaOf,
  nearestify,
  rgbToHex,
  scaleRGB,
});
wholeObjectInit({
  GLTFLoader,
  applyPsxShaderTweaks,
  nearestify,
  wholeObjectGetBuffers,
  wholeObjectResetGeom,
});

/* MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2/§6): the archetype builders below are now THIN
   COMPOSITIONS over src/ui/theater-parts.js's pure part library via renderPartInto/flatTints (added
   just below the addTaperedLimb block — the composition engine the spec's §6 `buildFigureFromParts`
   language refers to; kept as two small named helpers here rather than one function, since this
   file's own material/PSX-shader construction stays centralized in addBox either way). Each build*
   function now calls renderPartInto(group, partFn, params, channelTints, offset) once per part
   instead of its old inline addBox/addTaperedLimb sequence — geometry stays visually equivalent (same
   box literals, now sourced from the part functions' own boxSpec calls, which were themselves lifted
   verbatim from these builders in theater-parts.js's authoring pass) so the PASS-2 visual output (box
   counts ±2, proportions) is unchanged; the preview page's "figures lineup" fixture (dev/theater-
   preview.html, fixture 4) is the visual gate. window.Theater's public surface is untouched — G2
   (recipes) is the unit that will expose anything new. */

/* ============================================================================
   T1.5 tunables. Boolean constants gate the STRETCH items (§ dither / vertex-snap) so a later pass
   (G9) can flip them without touching call sites. BEAUTY-WAVE-2 BW2-0 (Adam 2026-07-10 night,
   mid-flight ruling: "PS1 is retired as a rendering style everywhere") — both default OFF game-wide
   now, tabletop included (previously true on the tabletop path; the interior channel's own
   WORLD_PSX_ENABLED, below, was already ruled off at VP0). Flags stay functional (a future pass can
   still flip either independently) — only the shipped default changed. */
const PSX_DITHER_ENABLED = false;      // stretch: ordered-dither via onBeforeCompile fragment injection
const PSX_VERTEX_SNAP_ENABLED = false; // stretch: clip-space vertex quantization via vertex injection
const PSX_VERTEX_SNAP_GRID = 96;       // clip-space quantization steps per axis (higher = subtler snap)
const PSX_DITHER_AMPLITUDE = 48.0;     // G9 tune 4: Bayer threshold divisor (DITHER_GLSL below) — was
                                        // 32.0 (a 1/32 nudge), which mushed the dark end into murk;
                                        // 48.0 is one notch weaker (~0.67x amplitude): still visibly
                                        // dithered, no longer mud at low luminance.

/* GRAPHICS-ENGINE.md law 2/2b (VP0 — THE TWO-FLAG STUDY CARD, docs/BEAUTY-WAVE.md): the interior/
   diorama render channel (setInteriorBoard/interiorBuildInstancedMesh) gets its own two flags,
   independent of the tabletop's PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED above (the flat combat
   table KEEPS its current look — these never touch it). Fable's pre-ruled VERDICT-SEAT values are
   {persp, world-PSX off}; this unit lands the SWITCH first with defaults that preserve the PRE-VP0
   look (byte-identical render until flipped), then a SEPARATE isolated commit flips the two defaults
   to the ruled values so the flip can be reverted alone if the confirmation card contradicts it.
   WORLD_PSX_ENABLED guards interiorBuildInstancedMesh's world-surface (floor/wall/doorframe/pillar)
   materials ONLY — it ANDs with the tabletop's own PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED (never
   overrides them upward), so flipping it off can only ever REMOVE dither/snap from interior world
   surfaces, never add it where the global flags are off. INTERIOR_CAM_MODE picks the interior
   channel's camera type; the tabletop channel (setBoard) always stays 'ortho' regardless of this
   flag — see setBoard/setInteriorBoard's own S.camera assignment below. */
const WORLD_PSX_ENABLED = false;   // RULED (VERDICT-SEAT, 2026-07-10 night): world-PSX OFF on the interior channel
const INTERIOR_CAM_MODE = "persp"; // 'ortho' | 'persp' — RULED (VERDICT-SEAT, 2026-07-10 night): ~20deg perspective ON
const INTERIOR_CAM_FOV_DEG = 20;   // GRAPHICS-ENGINE law 2b: "gentle perspective ~20° FOV"

// ---- CAMERA / FIT / SHOT: extracted to src/ui/theater-camera.js (split B6, 2026-07-25) ----
// The authored camera angles + margins (CAM_ELEV_DEG, CAM_YAW_OFFSET_DEG, CAM_FIT_MARGIN,
// TABLETOP_CAMERA_HEADROOM, INTERIOR_FIT_HALF_FLOOR), refitTabletopHeightFit's shared "tallest tile vs
// tallest figure" combiner, and the BW4 MF-1 camera-tween dials (MF1_CAMERA_TWEEN_DUR, mf1EaseOutCubic,
// mf1Lerp) moved there VERBATIM alongside placeCamera / placeCameraTweened and the rest of the fit
// family. This root imports the surface it still calls (top import block), passes capabilities via
// cameraInit(ctx) at end-of-body, and re-syncs the live S record via cameraSyncState(S) at both
// `S = createTheaterState()` sites. WORLD_PSX_ENABLED / INTERIOR_CAM_MODE / INTERIOR_CAM_FOV_DEG just
// above stay HERE: they pick the interior channel's camera TYPE, are read only by mount()'s camera
// construction and setInteriorBoard's camera swap, and no body in that module reads either.
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
// G5 ROUND-1 (ruling 2): was the flat black blob-shadow's opacity; the base disc that REPLACES it
// (baseDiscMatFor, near unitTint below) reads at a higher, near-opaque value (0.85) — a miniatures
// base should read solid/present, not translucent like a soft-shadow blob — so this constant now
// documents that specific PSX-clean-disc opacity rather than the old shadow's dimmer 0.35.
const BASE_DISC_OPACITY = 0.85;
const FIGURE_SCALE = 1.5;      // §3 G9 tune: "figure scale ~1.5x current relative to tiles"

// THEATER-ZOOM-SPREAD — Theater.zoom(dir) step math: ortho zoom multiplies the FITTED viewSize by
// ZOOM_STEP_FACTOR per step (dir>0 = zoom IN = smaller viewSize = board looks bigger; dir<0 = zoom
// OUT), clamped to [ZOOM_MIN, ZOOM_MAX] as a multiplier on the board's own auto-fit viewSize (1.0 =
// the default fit, never a fixed absolute size — so the SAME zoom level still fits differently-sized
// boards proportionally). Persists across rotate()/setBoard() re-fits by being reapplied as a multiplier
// AFTER the fit recomputes viewSize from the board's current half-extents (placeCamera's own job),
// rather than stored as an absolute viewSize that would drift out of proportion on a board-size change.
const ZOOM_STEP_FACTOR = 1.25;
// ARENA round 3 (2026-07-04): 0.6 → 0.45 — MANUAL HEADROOM. Round 2 proved the saturation bug class:
// with ZOOM_MIN=0.6, the 3-step readability default below already sat ON the clamp, so the ⊕ zoom-in
// button was dead on arrival (A/B frames pixel-identical). 0.45 gives the player exactly ONE real
// manual zoom-in step past the default (0.512 / 1.25 = 0.4096 → clamps to 0.45) before the floor.
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.5;
// small-board bias: Adam's "still a little too zoomed out" note, plus the observation that a small
// board (<=2 bands) reads even more distant than a large one at the SAME fit fraction (less geometry
// filling the same frame edge-to-edge) — bias the default one zoom step IN (viewSize *= 1/ZOOM_STEP_FACTOR)
// for boards at or under this band count, applied once per setBoard() call (not compounding on repeat
// calls with the same small board — see setBoard's own zoomLevel reset-to-bias logic below).
const SMALL_BOARD_BAND_THRESHOLD = 2;
// U7-lite (Adam 2026-07-03): the default figure-emphasis zoom, in ZOOM_STEP_FACTOR steps IN, applied to
// every board so battle minis read bigger on the stage. ARENA round 3 (2026-07-04): 2 → 3 — the
// READABILITY DEFAULT. 3 steps = viewSize × 1.25^-3 ≈ 0.512, INSIDE the new [0.45, 2.5] range (board
// ~17% tighter than round 2's clamp-pinned 0.6) while still leaving one manual zoom-in step of
// headroom to ZOOM_MIN (see its comment above). Do NOT raise to 4: 1.25^-4 ≈ 0.41 < ZOOM_MIN would
// re-saturate the default against the clamp — the exact round-2 bug class this pair of values fixes.
// (Known nit, pre-existing mechanism: a SMALL board adds smallBoardExtra=1 on top — 4 steps ≈ 0.41,
// which setBoard assigns UNCLAMPED, so small boards default just below ZOOM_MIN and the first manual
// zoom-in clamps UP to 0.45; same class of below-min default small boards already had in round 2.)
const DEFAULT_FIGURE_ZOOM_STEPS = 3;

/* G5 ROUND-1 (ruling 3, the small-figure fix): "a Small-size figure (goblin) renders its weapon
   visibly DETACHED beside it — likely the size scalar applies to the body but not the anchor offset."
   Before this pass NO size scalar existed at all (recipe.size was generated/carried but never read
   anywhere in this file) — every figure rendered at the same uniform FIGURE_SCALE regardless of its
   recipe's own size field, which is a real bug in its own right (a Small goblin should read visibly
   smaller than a Large ogre) and is ALSO the root of the detached-weapon symptom once a size scalar
   gets added carelessly: since renderPartInto composes a weapon module as a CHILD of the same THREE
   .Group its body boxes go into (both under one group-level scale), scaling the WHOLE group by a
   single size factor keeps body+weapon seated together automatically — there is no separate "anchor
   offset" transform that could drift out of sync UNLESS a size scalar were (wrongly) applied only to
   the body's own boxes post-hoc rather than to the group. SIZE_SCALE is applied at the group level
   (setUnits, alongside FIGURE_SCALE) for exactly this reason: one multiply, body and weapon both, by
   construction. */
const SIZE_SCALE = {
  tiny: 0.6, small: 0.82, medium: 1, large: 1.35, huge: 1.7, gargantuan: 2.2
};
function sizeScaleFor(size){
  const s = (size || "medium").toLowerCase();
  return SIZE_SCALE[s] != null ? SIZE_SCALE[s] : 1;
}

// ---- PIXEL SKINS + FLOOR TEXTURES: extracted to src/ui/theater-skins.js (split B3, 2026-07-25) ----
// The procedural pixel-skin system (capability probe, seeded hash/PRNG, the albedo floor, the L18/L19
// texel programs, the bounded-LRU CanvasTexture cache) and the FLOOR-TEXTURES.md floor-material family
// live in their own module now. The generic color helpers just below (clamp255/hexToRGB/rgbToHex/
// hexStrToNum/scaleRGB/lumaOf) STAY here — gradeColorLocal, interiorBaseMaterialsFor and
// itrBrightRealmFillFor use them too — and reach the module (with nearestify) through skinsInit(ctx)
// at end-of-body. PIXEL_SKIN_ENABLED also stays HERE: the window.Theater.pixelSkin setter writes it
// and figureMaterialFor reads it, so an import binding (read-only) or a module-local mirror (stale
// under the setter) would both break the live A/B toggle.
let PIXEL_SKIN_ENABLED = true;         // the dev A/B toggle (window.Theater.pixelSkin mirrors this)

// clamp a channel byte to [0,255].
function clamp255(v){ return v < 0 ? 0 : (v > 255 ? 255 : v | 0); }
// hex color number (e.g. 0x7d7048) -> {r,g,b} bytes. Accepts a THREE color-ish number only (every
// caller passes a resolved numeric channel color); a null/undefined color defaults to a mid grey so
// the texture never throws on a channel that resolved to "use base tint" null upstream (that case is
// already substituted with the real base tint before reaching here, but belt-and-suspenders).
function hexToRGB(hex){
  const n = (typeof hex === "number" && isFinite(hex)) ? (hex & 0xffffff) : 0x808080;
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}
function rgbToHex(r, g, b){ return (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b); }
// GR3 (docs/GRAPHICS-ENGINE.md build unit GR3): src/ui/theater-interior.js's kit colors are authored as
// "#rrggbb" STRINGS (THREE.Color/CanvasTexture callers there accept strings directly), but
// gradeColorLocal's own hexToRGB only accepts a NUMBER (every other caller already has one resolved —
// see hexToRGB's own comment). This is the one small bridge: a string kit color -> the numeric form
// gradeColorLocal needs, so the interior board's void/fog backdrop can route through the SAME grade
// function the flat table already uses (S.realmProfile below) rather than inventing a second grade
// math. Never throws on a malformed/absent string — defaults to mid-grey, same discipline hexToRGB
// itself keeps for a bad numeric input.
function hexStrToNum(str){
  const h = String(str || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return Number.isFinite(n) ? n : 0x808080;
}
// scale an {r,g,b} toward black/white by `f` (f<1 darker, f>1 lighter), clamped.
function scaleRGB(c, f){ return { r: c.r * f, g: c.g * f, b: c.b * f }; }
// Rec.601 luma in [0,1] for an {r,g,b}-bytes color.
function lumaOf(c){ return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) / 255; }

/* reverse map: a part FUNCTION -> its §1 kebab-case registry name, so renderPartInto (which is
   handed a partFn, not a name) can build the pixel-skin cache/seed key without every call site
   passing a name string. Built once off the frozen Parts.PARTS registry. A partFn not in the
   registry (a raw inline box in a builder that doesn't go through PARTS) maps to "" — the skin key
   then leans on the color+variant alone, still deterministic, just not part-name-scoped. */
const PART_NAME_BY_FN = (function(){
  const m = new Map();
  const reg = (Parts && Parts.PARTS) || {};
  Object.keys(reg).forEach(function(name){ m.set(reg[name], name); });
  return m;
})();
function partNameOf(partFn){ return PART_NAME_BY_FN.get(partFn) || ""; }

/* THE MATERIAL FUNNEL. Given a resolved color (numeric hex), an optional opacity (<1 = translucent),
   and a skinKey (partName:variantKey context the caller threads down — see renderPartInto/addBox),
   returns the MeshLambertMaterial for one figure box. When pixel-skin is enabled AND canvas-2D is
   available AND a texture builds, the material carries the procedural CanvasTexture map with a white
   base color (so the baked texel colors pass through 1:1); otherwise it's the EXACT pre-Unit-1 flat
   `new MeshLambertMaterial({color})` path — byte-identical to before this unit for every headless/
   toggled-off caller. PSX shader tweaks (dither/vertex-snap) still apply on top via applyPsxShaderTweaks,
   same as every other material this file builds. Translucent (opacity<1) is honored on both paths
   identically (transparent+depthWrite off), so the ghost/spectral read is unchanged. */
function figureMaterialFor(color, opacity, skinKey, glossy){
  const translucent = opacity != null && opacity < 1;
  // ALBEDO FLOOR (director intel): lift/cap the resolved base color into the visible desaturated band
  // BEFORE it becomes either a pixel-skin texture base or a flat material color, so BOTH render paths
  // get the same guarantee (a figure never resolves to a black column). A numeric color only — a null
  // (channel resolved to "use base tint") is already substituted with a real tint upstream, but guard
  // anyway so albedoFloor never sees a non-number.
  if(typeof color === "number" && isFinite(color)) color = albedoFloor(color);
  // REALM-RENDER-STYLE.md §3/§4: grade the resolved base color through the current board's render
  // profile (S.realmProfile — set once per setBoard call, null pre-mount/pre-setBoard/non-realm room)
  // AFTER the albedo floor so the grade sees the same guaranteed-visible color both the pixel-skin
  // texture and the flat-material fallback below build from — one grade point covers BOTH figure
  // render paths. gradeColorLocal(color, null) is a byte-identical passthrough (regression law: no
  // realms -> byte-identical), so a non-realm fight renders exactly as before this unit.
  if(typeof color === "number" && isFinite(color)) color = gradeColorLocal(color, S.realmProfile);
  const usePixel = PIXEL_SKIN_ENABLED && pixelSkinCapable();
  let matOpts;
  if(usePixel){
    const tex = pixelSkinTextureFor(color, skinKey || ("c:" + (color >>> 0).toString(16)));
    if(tex){
      // white base color so the CanvasTexture's own baked colors show through unmodified (Lambert
      // multiplies map*color); the texture already carries the channel color + shading.
      matOpts = { color: 0xffffff, map: tex };
    } else {
      matOpts = { color }; // texture build failed — flat color, never a missing-material throw
    }
  } else {
    matOpts = { color }; // pixel-skin off / headless — the exact pre-Unit-1 flat path
  }
  if(translucent){ matOpts.transparent = true; matOpts.opacity = opacity; matOpts.depthWrite = false; }
  // SHAPE-WAVE UNIT 5 (L20): a "glossy" figure (the ooze's wet sheen) uses a Phong material with a low
  // shininess + a subtle grey specular — a minor reflective highlight, NOT a mirror. Phong reacts to
  // the same PointLight/DirectionalLight the Lambert figures do (and applyPsxShaderTweaks' <opaque_
  // fragment>/<project_vertex> injections exist in Phong too, so the PSX dither/vertex-snap still apply).
  // Non-glossy figures stay MeshLambertMaterial (byte-identical to before U5). Headless degrade is
  // unchanged — this only swaps the material CLASS, both are pure CPU constructs (no GL context needed).
  if(glossy){
    matOpts.shininess = 24;
    matOpts.specular = 0x3a4a44;   // a muted cool specular (a wet, slimy sheen, not a bright glint)
    return applyPsxShaderTweaks(new THREE.MeshPhongMaterial(matOpts), { figureAO: true });
  }
  return applyPsxShaderTweaks(new THREE.MeshLambertMaterial(matOpts), { figureAO: true });
}

// ---- WHOLE-OBJECT FIGURES/PROPS: extracted to src/ui/theater-whole-object.js (split B3, 2026-07-25) ----
// The P1' whole-object geometry factory + material funnel (the channel->bucket classifier, the grain
// atlas, the quad-UV builder, WHOLE_GEOMETRY_CACHE / WHOLE_MATERIALS_CACHE / WHOLE_GRAIN_TEX and their
// disposeWholeObjectCaches end-of-life, the GLB/GLTFLoader seam, WHOLE_OBJECT_SCALE / WHOLE_OBJECT_YAW
// and wholeObjectKeyFor) lives in its own module now. It never imports this root: wholeObjectInit(ctx)
// at end-of-body hands it applyPsxShaderTweaks + nearestify (the root-owned material/texture funnels),
// the GLTFLoader class (this file stays the ONE `three/addons/` import site) and probe-lib's
// resetGeom/getBuffers (passed as the SAME function references this file imported, so the module-scope
// POS/COL/CHAN buffers a creature builder just wrote into are the very ones the factory reads).
// WHOLE_OBJECT_ENABLED stays HERE behind its window.Theater.wholeObject setter, exactly like
// PIXEL_SKIN_ENABLED. HUMAN_TRUE_HEIGHT stays too: despite sitting inside the GLB const block it is the
// interior channel's true-scale reference (interiorSpriteBillboard / interiorFitMaxHeightFor /
// itrPieceSightPoints read it — nothing in the whole-object module does).

// BEAUTY-WAVE.md VP1: TRUE-SCALE reference height for interior pieces — 5.5ft (the SRD medium-human
// convention the registry's scaleTrue/scaleVsHuman ratios are already computed against) at
// cellSize: 1 world unit = 5ft (DUNGEON-GRAPH.md law 1) => 5.5/5 = 1.1 world units.
const HUMAN_TRUE_HEIGHT = 1.1;

// PSX low-res internal render: the renderer's DRAWING BUFFER is sized to this fraction of the
// canvas's CSS size, then the canvas is stretched back up via CSS with `image-rendering:pixelated`
// (the cheap robust route the spec calls for — "no postprocessing chain"). 1/3 per the build
// note. Adam's 2026-07-04 grit gate briefly landed 0.4, then he HELD the ruling pending a
// zoomed comparison (dev/model-qa/grit-compare/zoom4x-*.png) — reverted to the frozen 1/3
// until he rules; flip here + the ps1-sheet default + the verify-theater-figures pin together.
const PSX_RES_SCALE = 1 / 3;

// fog: near-black, distance-tuned so the far board edge just softens (never fully hides the back
// row — a 12x9 board's farthest tile sits well inside FOG_FAR at the default camera distance).
const FOG_NEAR = 14;
const FOG_FAR = 40;

// This module is a sealed ES-module scope (§2) — it never reads theater-data.js's classic-script
// globals (THEATER_ENV_PALETTE et al). It only ever consumes the PLAIN DATA those functions return
// (setBoard's `data.env`/tile `.tint` fields already carry every color decision) — this local fallback
// is only the pre-setBoard mount-time default before any real board has been handed over, matching
// theater-data.js's own THEATER_DEFAULT_ENV value by convention (kept in sync by naming, not import).
const THEATER_DEFAULT_ENV_FALLBACK = "dungeon";
const VOID_BG = 0x0a0908; // matches theater-data's dungeon palette voidTint — overridden per-env in setBoard

// GRAPHICS-ENGINE.md GR3 LIGHT RIG LAW: the shared soft hemisphere key's own sky/ground/intensity —
// named constants (not inline literals) so mount()'s construction and setInteriorBoard's study-rig
// on/off toggle (S.interiorVariant.rig, dev/battle-gate/capture-interior-study.mjs's rig-on/rig-off
// card) both read the SAME authored default, never two numbers that could drift apart.
const HEMI_SKY = 0xfff1dc, HEMI_GROUND = 0x1b2430, HEMI_INTENSITY_DEFAULT = 0.22;
// BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4, item 1): the INTERIOR tray drops its scene-wide
// fill hard so the torch/lamp PointLights (data.lights) carry the picture — mock-01-gloom-combat.png's
// near-black rims + small hot pools. These override, for the interior channel ONLY, the three flatteners
// applyLightProfile installs: (a) ambient floored to STAGE_AMBIENT_FLOOR (0.65) — far too bright, the
// "even mid-light" the mocks avoid; (b) the shared hemisphere key; (c) the "dark" profile's own
// non-attenuating overhead fill point (intensity 7, decay:0/distance:0 — it floods every floor cell
// evenly and, worse, erases the torch shadows the addendum wants to READ). The flat tabletop channel
// (setBoard) is untouched — STAGE_AMBIENT_FLOOR still governs there. Tuned across the BW2-4 iterate loop.
const ITR_SCENE_AMBIENT = 0.13;      // interior ambient intensity (replaces the 0.65 readability floor here) — BW2-4b: 0.16->0.12 (brightness law: dark-corner floor)
const ITR_SCENE_HEMI = 0.08;         // interior hemisphere key (down from HEMI_INTENSITY_DEFAULT 0.22)
// CL-R2 follow-up — SHADOW FORM FLOOR. Diagnostic recipes used to zero the hemisphere entirely,
// leaving every un-keyed face at one identical flat ambient value: photographically deep, but stair
// treads, risers, and wall turns disappeared into a single shape. Preserve a very low shadowless
// sky/ground bounce so face orientation stays barely readable in darkness. Production dark rooms
// already use ITR_SCENE_HEMI=0.08, so this is a floor for stricter diagnostics, not a brightness
// raise or an environment-material fork.
const ITR_SHADOW_FORM_HEMI_FLOOR = 0.06;
const ITR_SCENE_FILL_SCALE = 0.04;   // multiply the profile's overhead (decay:0, non-attenuating) fill point(s). Tuned 0.20->0.10->0.04: the fill was the LAST flattener — it lit central walls/doorframes bright even after ambient/hemi dropped (round-4 diagnostic: killing ambient+hemi alone left them bright). Standees are UNLIT billboards, so cutting fill near-off darkens the Lambert surfaces (walls/doorframes/floor go dark except in torch pools — the mock look) WITHOUT touching character readability. A whisper stays (not 0) so an edge-on wall never reads as a pure-black hole.
// BW2-4 item 1: the DATA intensity on data.lights (theater-interior.js's itrRoomLights, base
// kit.lightIntensity ~1.0-1.3 x valueScript.focalLight ~1.2 = ~1.5) encodes the RELATIVE per-room value
// hierarchy (verify-scene-direction group 2b pins it, so it must not move). But ~1.5 with the new decay:2
// physical falloff barely reaches the floor 1.4 units below the flame — round-1 READ showed NO torch
// pool. This render-side gain lifts the interior torch/lamp PointLights to a decay-2-appropriate absolute
// brightness (a HOT ~4-5-cell pool) while leaving the harness-checked DATA untouched — the same "data
// carries the relative hierarchy, GL applies the absolute" split the grade rig already keeps. Applied
// per-light before startLightFlicker so the flicker base captures the gained value.
const ITR_LIGHT_RENDER_GAIN = 4.5;
// BW2-4b CITIZENSHIP — THE BRIGHTNESS LAW (Adam mid-flight: "the sprites still render at full
// brightness even in the dark, they shouldn't do that unless they are in a full white light...
// basically outdoor daylight, which does not exist indoors, ever"). Sprites are now LIT
// (MeshLambertMaterial — buildSpriteBillboardMesh) so their rendered brightness TRACKS the scene.
// The interior channel over-lights vertical billboards two ways that had to be dropped for the law:
//   (a) the tabletop key/fill DirectionalLights (mount(): 0.72/0.22, aimed toward the +x/+z quadrant)
//       hit a camera-facing billboard's normal at N·L~0.6 -> ~0.5 of full-bright everywhere, before
//       any torch. Dimmed to a WHISPER for the interior channel (setBoard restores the tabletop
//       values on its own path, mirroring the hemi restore) so the torch PointLights carry the
//       picture and a dark-corner sprite reads dim, per the mock.
//   (b) with (a) dropped, a dark-corner sprite would take only ambient(0.16)+hemi(0.09) — legible but
//       a genuinely dark-albedo creature would crush. ITR_SPRITE_EMISSIVE_FLOOR is an albedo-scaled
//       emissive floor (emissiveMap = the sprite's own texture) — a fixed dim self-illumination
//       (the readability floor: silhouette + key features stay legible), NOT a light, so it never
//       reads as day-lighting. Tuned across the iterate loop against the measured gates:
//       dark corner <=0.40 of full-bright · torch pool ~0.60-0.85 · nowhere indoors >=0.9.
const ITR_SCENE_KEY = 0.05;   // tabletop key DirectionalLight, dimmed for the interior channel (mount default 0.72)
const ITR_SCENE_FILL = 0.02;  // tabletop fill DirectionalLight, dimmed for the interior channel (mount default 0.22)
const ITR_SPRITE_EMISSIVE_FLOOR = 0.12; // sprite readability floor — preserves source color identity without reading full-bright
// CL-R2 follow-up — a neutral, camera-side fill that can affect ONLY sprite faces. The cutout remains
// on layer 0 for all authored room lights and additionally joins this private layer; the SpotLight
// exists only on the private layer, casts no shadow, and keeps a gentle inverse-distance falloff.
// This is the portrait-lighting concession Adam asked for: enough clean face value to keep skin,
// cloth, and metal from turning uniformly rusty in dark rooms, without lifting the room around them.
const SPRITE_CAMERA_FILL_LAYER = 2;
const SPRITE_CAMERA_FILL_AT_TARGET = 0.16;
const SPRITE_CAMERA_FILL_COLOR = 0xfff2df;
// split B5 (2026-07-25): ITR_LIGHT_DISTANCE_CAP (BW2-4b item 1's interior light-range cap) moved to
// src/ui/theater-practicals.js with interiorBuildLights, its only reader. Its neighbours in this block
// (ITR_CAMERA_KEY_*, ITR_SCENE_*, ITR_BRIGHT_*, ITR_EMISSIVE_*, SPRITE_CAMERA_FILL_*) all have
// non-practical readers here and stay.
// BW2-4b item 2 — THE CAMERA-KEY SHADOW: one soft shadow-casting DirectionalLight from the camera's
// general direction (interior only). The value-plunge diagnosis proved billboards can't cast a
// readable shadow off the interior torch POINT lights (edge-on sliver); a broad directional finally
// gives every standee a real cast shadow on the floor. Intensity a whisper so it doesn't re-flatten
// the plunge (it lights vertical billboard normals at N·L~0.6, so even 0.14 adds ~0.08 — kept low).
const ITR_CAMERA_KEY_INTENSITY = 0.10;
// docs/DIEGETIC-LIGHT.md L-2 — DIEGETIC SHADOWS (Adam's ruling 2026-07-11: "shadows react to the
// diegetic sources, not the ambient/fill"). The camera-key light above was built as a workaround for
// point-light shadows reading as an edge-on sliver off a flat billboard (BW2-4b item 2's own diagnosis,
// comment above) — but a camera-aimed shadow is precisely the non-diegetic model the doctrine retires.
// interiorBuildLights (below) already casts real shadows FROM the room's own diegetic point lights
// (interiorAssignShadowCasters caps the nearest few); this flag just stops the camera-key from ALSO
// contributing a shadow, so the diegetic torch/lamp is the only shadow source. Default false = retired.
// Reversible in one line for the re-shoot: flip this literal, or call
// window.Theater.setCameraKeyCastsShadow(true) at runtime (mirrors the L-1 cone gate's own convention).
// The camera-key LIGHT itself (a whisper fill, ITR_CAMERA_KEY_INTENSITY) stays mounted either way — only
// its shadow-casting is gated.
let ITR_CAMERA_KEY_CASTS_SHADOW = false;
// BW2-4b item 6 — THE GLOOM LIFT: gloom's production frames (loop-02) drown vs fantasy's dark-but-
// legible reference register. A realm-scoped ambient bump for gloom ONLY (fantasy is the reference —
// never brightened). Additive to ITR_SCENE_AMBIENT for the gloom realm's interior scene ambient.
const ITR_GLOOM_AMBIENT_LIFT = 0.05;
// docs/DIEGETIC-LIGHT.md L-4 — BRIGHT-REALM HEMISPHERE (fixes the daylit-lost-world-darker-than-a-
// torchlit-crypt inversion Adam caught). daylit/overcast/moonlit are realms whose diegetic source IS
// the sun/moon/overcast sky itself — they should NOT ride the dim single-torch dungeon numbers above
// (ITR_SCENE_AMBIENT/HEMI/KEY/FILL, tuned for a crypt with a torch as its only light). This is the
// SAME rigOn override seam (setInteriorBoard, below) branching on S.lightProfileKey, just with its own
// brighter named constants — never a new HemisphereLight construction (verify-dungeon-interior.mjs
// group 16 pins exactly one HemisphereLight built in mount(); this only re-drives that SAME shared
// S.hemiLight's intensity higher for these three profiles, same mechanism ITR_SCENE_HEMI already uses).
const ITR_BRIGHT_PROFILES = new Set(["daylit", "overcast", "moonlit"]);
// docs/LIGHT-SIGHT-POLISH.md P-1 problem 1 (Adam's re-shoot: suburb daylit "nuclear bomb") — PER-REALM
// BRIGHT FILL. The single global ITR_BRIGHT_SCENE_* block above (now ITR_BRIGHT_REALM_FILL_DEFAULT,
// below) was tuned so lost-world's DARK jungle-shadow albedo (floorColor #3d4a2e/wallColor #2a3320,
// luminance ~0.23) would actually read sunlit — but the SAME numbers, applied to a realm with a much
// lighter kit (suburb floorColor #cfc7a0/wallColor #b8a97e, luminance ~0.72), blow straight past white.
// Fix: key the bright-fill numbers on data.realmId, not just on "is this a bright profile" — an
// explicit, dial-able per-realm table (predictable — Adam retunes ONE realm's row, never a formula)
// wins when present; a realm with no explicit row falls back to a luminance-derived scale of the
// DEFAULT (a brighter kit needs proportionally LESS added fill to reach the same "reads sunlit" result
// a dark kit needs a lot of).
const ITR_BRIGHT_REALM_FILL_DEFAULT = Object.freeze({
  ambient: 1.1, hemi: 0.9, fillScale: 1.0, key: 0.9, fill: 0.55
});
// Explicit per-realm rows — reversible taste values Adam dials directly from the next re-shoot.
// lost-world keeps the ORIGINAL numbers verbatim (L-4's own headline assertion in
// dev/verify-diegetic-light.mjs is pinned to this realm at these exact values — re-run that group
// before retuning this row). suburb/bright-kingdom get a gentler set tuned to their lighter kits (their
// scale below is the same luminance-fallback math, pre-computed and pinned explicit so the numbers are
// dial-able and don't silently drift if the kit's authored floor/wall color ever changes).
const ITR_BRIGHT_REALM_FILL = Object.freeze({
  "lost-world": Object.freeze({ ambient: 1.1, hemi: 0.9, fillScale: 1.0, key: 0.9, fill: 0.55 }),
  suburb: Object.freeze({ ambient: 0.22, hemi: 0.18, fillScale: 1.0, key: 0.18, fill: 0.11 }),
  "bright-kingdom": Object.freeze({ ambient: 0.28, hemi: 0.23, fillScale: 1.0, key: 0.23, fill: 0.14 })
});
// the luminance anchor: lost-world's OWN floor/wall albedo average (Rec.601 luma) — the DEFAULT numbers
// above are authored AT this anchor, so a realm at this exact luminance gets scale=1 (byte-identical to
// the pre-P-1 global numbers); a brighter kit scales its fill down from there. Never recomputed live off
// INTERIOR_TILE_KITS (that table can gain/lose entries) — a fixed named constant, same "reversible taste
// value" discipline as every other number in this file.
const ITR_BRIGHT_FILL_DARK_REF_LUM = 0.23;
const ITR_BRIGHT_FILL_MIN_SCALE = 0.3; // floor: even an extremely bright, unlisted kit still gets SOME added daylight fill, never near-zero
// realmId -> {ambient,hemi,fillScale,key,fill}: the explicit table above wins; otherwise scale
// ITR_BRIGHT_REALM_FILL_DEFAULT down by how much brighter this realm's OWN tileKit (floor/wall albedo
// average) reads than the lost-world anchor. `kit` is the CALLER's already-resolved data.tileKit (the
// same object setInteriorBoard already has in scope as `kit` — never re-derived from a second lookup).
// P-1 TEST-ONLY SEAM (mirrors ITR_LIGHT_CONE_ENABLED's own reversible-flag convention): forces
// itrBrightRealmFillFor to ALWAYS return the single DEFAULT row — the exact pre-P-1 "one global
// bright-fill set applied to every realm alike" behavior — regardless of realmId/kit. Lets a harness
// reproduce the original suburb-blows-out regression on demand (RED-FIRST: prove it really did clip
// under lost-world's own numbers), then clear the flag to prove the real per-realm table fixes it.
let ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST = false;
function itrBrightRealmFillFor(realmId, kit){
  if(ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST) return ITR_BRIGHT_REALM_FILL_DEFAULT;
  const explicit = realmId && ITR_BRIGHT_REALM_FILL[realmId];
  if(explicit) return explicit;
  const floorLum = kit && kit.floorColor ? lumaOf(hexToRGB(hexStrToNum(kit.floorColor))) : ITR_BRIGHT_FILL_DARK_REF_LUM;
  const wallLum = kit && kit.wallColor ? lumaOf(hexToRGB(hexStrToNum(kit.wallColor))) : ITR_BRIGHT_FILL_DARK_REF_LUM;
  const lum = Math.max(0.02, (floorLum + wallLum) / 2);
  const scale = Math.max(ITR_BRIGHT_FILL_MIN_SCALE, Math.min(1, ITR_BRIGHT_FILL_DARK_REF_LUM / lum));
  const d = ITR_BRIGHT_REALM_FILL_DEFAULT;
  return { ambient: d.ambient * scale, hemi: d.hemi * scale, fillScale: d.fillScale, key: d.key * scale, fill: d.fill * scale };
}
// docs/LIGHT-SIGHT-POLISH.md P-1 problem 2 (Adam's re-shoot: cosmic voidlit "invisible") — COSMIC
// EMISSIVE FILL. voidlit isn't in ITR_BRIGHT_PROFILES (it's not daylight), so it fell through to the
// dim single-torch dungeon numbers (ITR_SCENE_*) — tuned for a crypt where a torch carries the room;
// cosmic has no torch, so it read as pure void. Its own distinct legibility path: dim + COOL (voidlit's
// authored ambient/point colors, LIGHT_PROFILES above, are already the purple-violet cosmic hue — this
// only raises their INTENSITY, same "color stays authored, intensity is the dial" discipline the
// STAGE_AMBIENT_FLOOR readability floor already keeps), well under the sunlit ITR_BRIGHT_* numbers so it
// never reads as daylight.
const ITR_EMISSIVE_PROFILES = new Set(["voidlit"]);
const ITR_EMISSIVE_SCENE_AMBIENT = 0.5;    // vs ITR_SCENE_AMBIENT 0.13 / ITR_BRIGHT_REALM_FILL_DEFAULT.ambient 1.1 — meaningfully lit, well under daylight
const ITR_EMISSIVE_SCENE_HEMI = 0.42;      // vs ITR_SCENE_HEMI 0.08 / bright 0.9
const ITR_EMISSIVE_SCENE_FILL_SCALE = 0.7; // vs ITR_SCENE_FILL_SCALE 0.04 — voidlit's own authored purple point carries more of the read than a torch-era whisper would
const ITR_EMISSIVE_SCENE_KEY = 0.3;        // vs ITR_SCENE_KEY 0.05 / bright 0.9 — a faint star-key, well under the sunlit realms
const ITR_EMISSIVE_SCENE_FILL = 0.18;      // vs ITR_SCENE_FILL 0.02 / bright 0.55
// P-1 TEST-ONLY SEAM (same convention as ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST just above): forces
// the emissive branch OFF so voidlit falls back through to the dim single-torch dungeon numbers — the
// exact pre-P-1 "cosmic reads near-black" behavior — letting a harness reproduce that RED baseline on
// demand, then clear the flag to prove the emissive path fixes it.
let ITR_EMISSIVE_FILL_DISABLED_FOR_TEST = false;

// ─── LIGHT-CLOSE unit (2026-07-11, docs/GRAPHICS-NORTH-STAR.md task #16 + Adam's re-shoot feedback:
// suburb "still blows out" / cosmic "near-black") — CLOSE THE LIGHTING LOOP ──────────────────────────
// PART A — BRIGHT-REALM PRACTICAL SUPPRESSION. P-1 (above) already gave daylit/overcast/moonlit their
// own sky hemisphere+fill — the sun/sky IS their diegetic source. But interiorBuildLights (below) still
// mounted the SAME torch/lamp practicals (an additive glow disc, an emitter nub, a real hot-pool
// PointLight) at every light seed regardless of profile, so a sunlit room ALSO carried a blown-out
// torch orb nobody asked for — directive §4.7's "never leave a floating glow disc as the source" cuts
// both ways: a bright/sky-lit realm's ONLY source is the sky, so a torch practical there reads as a
// second, uncredited light (and the point light's own hot pool clips). Gate: flip
// ITR_BRIGHT_SUPPRESS_PRACTICALS to false (or window.Theater.setBrightPracticalsSuppressed(v)) to
// restore torch practicals in bright realms too — reversible, same convention as ITR_LIGHT_CONE_ENABLED.
let ITR_BRIGHT_SUPPRESS_PRACTICALS = true;
// torch/lamp PointLight intensity multiplier when suppressed — 0: the sky hemisphere/fill (P-1, above)
// carries the room alone, never a second light source. A light entry can opt out per-instance via
// `light.forceVisiblePractical` (interiorBuildLights, below) — a future realm declaring a genuinely
// diegetic OUTDOOR local source (a campfire) even under a bright profile; no light sets this today, so
// every bright-profile light suppresses uniformly.
const ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE = 0;

// PART B — COSMIC ALBEDO LIFT. voidlit's own ITR_EMISSIVE_SCENE_* numbers just above already pushed
// cosmic's LIGHT as far as it profitably goes, but rendered value is (light * surface albedo): cosmic's
// AUTHORED tileKit floor/wall albedo (INTERIOR_TILE_KITS.cosmic, src/ui/theater-interior.js —
// floorColor #171b33 / wallColor #10132a, Adam's own regen-v3-sourced palette, never hand-edited here)
// is such a dark navy that even a bright light multiplies down to near-zero — the "plateau" Adam saw.
// A RENDER-TIME fix instead, applied in setInteriorBoard (grep floorColorForRender/wallColorForRender):
// TWO parts, both gated on the emissive/voidlit path only. (1) THE FORMAT FIX — the biggest single gain:
// every non-flagship realm's procedural floor/wall renders as RAW ABSOLUTE per-cell colors (theater-
// interior.js's own itrDarkenHex output) multiplied straight against an ALSO-dark procedural texture —
// two dark numbers multiplied crush toward zero (the plateau). Flagship realms (chrome/gloom/fantasy,
// file-textured) never hit this: their per-cell colors already run through itrNeutralizeInstanceColors,
// re-expressing them as a relative VALUE MULTIPLIER (~0.3-1.2) against the realm's own base tone, so the
// TEXTURE carries the absolute value and the instance color only modulates it. Routing cosmic's floor/
// wall through that SAME neutralization (never touching the from-file branch's own semantics) alone
// measured a >=5x roomMean gain — no lift multiplier needed to prove that part. (2) THE LIFT — a small,
// named, additional brightening on TOP of the format fix: the PROCEDURAL texture painter
// (interiorMaterialTexture) bakes its pixels directly off the baseColorHex it's handed, so lifting THAT
// argument (reusing itrScaleHexValue, the doorframe-darken helper below, factor > 1 here) lifts the
// material itself — scales every channel together so navy stays navy (hue survives, nothing washes
// toward gray/white), never re-applied to the (already-neutralized, ratio-based) instance colors, so the
// two parts never double-compound. Pillars automatically inherit both for free: they already reuse
// wallTex + neutralize their own instance colors against kit.wallColor (BW2-4b item 4), unchanged by
// this unit. Named + dial-able; every other realm's rendering is byte-identical to before this unit.
const ITR_EMISSIVE_ALBEDO_LIFT = 1.2;
// P-1 TEST-ONLY SEAM (same convention as ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST /
// ITR_EMISSIVE_FILL_DISABLED_FOR_TEST, above): forces the albedo lift OFF so cosmic's floor/wall render
// off its RAW authored albedo even on the emissive path — lets a harness isolate the lift's OWN
// contribution (independent of the emissive ambient/hemi/key/fill toggle those two flags already gate)
// and reproduce the pre-lift "plateau" RED baseline on demand, then clear the flag to prove the lift
// fixes it.
let ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST = false;

// BW2-4 item 2 (value plunge) — DOORFRAME value darken, GL-side. Doorframes ship with kit.trimColor
// (the bright accent hue — gloom #6b5878 lum 0.37, gold on others), so a doorway prism renders as a
// BRIGHT vertical (round-3 READ: a lavender block fighting the standees) where the mocks keep doorways
// as DARK arches. This darken must live on the GL side, NOT in the data: the accent-discipline gate
// (verify-scene-direction group 5) reads the DATA doorframe colors and pins them to kit.trimColor / the
// ONE tinted accent per room, so touching the data would trip it. Value-only (a scalar multiply): the
// accent doorframe's hue survives, only its value drops toward wall value.
// BW2-4b item 4: raised 0.25 -> 0.55. BW2-4 plunged doorframes to 0.25 of the bright trim accent when the
// scene was brighter; now that BW2-4b drops the interior ambient/key hard for the BRIGHTNESS LAW, a 0.25
// doorframe (× dim light × its new wallTex) crushed to a pure-black monolith arch (loop-02/05). 0.55 keeps
// a DARK textured stone arch — reading as architecture, not a black hole — still below wall value.
const ITR_SCENE_DOORFRAME_VALUE = 0.70;
function itrScaleHexValue(hex, f){
  const h = String(hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const v = Number.isFinite(n) ? n : 0x888888;
  const g = Math.max(0, f);
  const clamp = (x) => (x < 0 ? 0 : x > 255 ? 255 : Math.round(x));
  const r = clamp(((v >> 16) & 255) * g), gr = clamp(((v >> 8) & 255) * g), b = clamp((v & 255) * g);
  return "#" + [r, gr, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// tile kind -> the manifest's semantic texture key it prefers (theaterBoardFrom's kind vocabulary,
// src/engine/theater-data.js). A kind with no matching manifest entry stays palette-only (the no-
// asset baseline never regresses — §4: "palette-only remains the no-asset baseline").
const TILE_KIND_TEXTURE_KEY = {
  floor: "stone", elevated: "stone", hazard: "scorch", water: "water"
};

const ARCHETYPE_BUILDERS = {
  biped: buildBiped,
  quadruped: buildQuadruped,
  flyer: buildFlyer,
  serpent: buildSerpent,
  swarm: buildSwarm,
  giant: buildGiant,
  ooze: buildOoze,
  arachnid: buildArachnid,
  "amorphous-horror": buildAmorphousHorror
};

/* ============================================================================
   FIGURE-FIDELITY SHAPE-WAVE, UNIT 0 — THE ORIENTATION LAW (REFERENCE-DIRECTION.md L16, Adam
   2026-07-03: "Every figure faces the SAME stage convention. Quadrupeds + the spider currently build
   90° off (wings inherit the wrong axis with them). Correctness fix, global, before any styling.")

   THE DIAGNOSIS. Nothing in this file ever set a figure's yaw (rotation.y) — every figure rendered at
   its part-local default orientation, and the verbs (theater-verbs.js) only ever translate a group
   (position.x/z lerps) or topple it (rotation.z), never rotate it about Y. So a figure's stage-facing
   is ENTIRELY a function of how its base body is authored in part-local space:
     - torso-biped / torso-tapered / torso-biped-huge: roughly Z-symmetric, no long axis — they read
       as a standing figure presenting its front to the dimetric camera. This IS the convention.
     - torso-quad (wolf/dragon/bat): body slab is 0.7 wide on X, snout projects to +X — the long axis
       runs along WORLD X, front at +X. From the FFT/dimetric camera (which at rotationStep 0 looks
       from the +X/+Z corner toward origin, look dir on ground ≈ (-1,0,-1)/√2), that long axis points
       almost straight AT the camera — you see the wolf nose-on/tail-on as a short slab: the "crate on
       legs / flat plank" §7b miss. To read as a wolf it must present a PROFILE.
     - thorax-abdomen (spider): cephalothorax at +X, abdomen at -X — same world-X long axis, same
       end-on read.
     - serpent-coil: segments run along Z (head-end +Z) — a different long axis again, also not the
       biped's convention.
     - wing-slab attaches at the body's `back` anchor and inherits the body's orientation — so a quad
       with wings (the bat) has its wings splayed along the wrong axis too ("stack of planks").

   THE FIX (global correctness, per the ruling — a yaw applied at the whole-figure group level, so a
   body + every anchored module + the (size-scaled) group all turn together, and rotation.z for
   down/prone still composes independently under THREE's Euler XYZ order). The convention is: a figure
   presents its FRONT/PROFILE toward the camera the way a biped already does. For the long-axis bodies
   we rotate the group so the long axis runs across the screen (a profile), not into it (end-on):
     - torso-quad / thorax-abdomen: their long axis is world-X; a -90° yaw (about Y) turns that axis to
       world-Z. Combined with the camera's own +45° dimetric offset, the body then reads as a clean
       three-quarter PROFILE (head/maw and tail both visible, legs reading as a row underneath) instead
       of the nose-on slab. This is the "face the same direction as the biped row" the ruling asks for:
       a quadruped now stands broadside to the viewer exactly as the humanoids stand front-on.
     - serpent-coil: its long axis is world-Z (not X), so it needs a DIFFERENT correction to reach the
       same broadside read — +90° turns its Z long-axis to X, matching what the -90° did for the quads
       (both long axes end up along the SAME screen direction, so a snake and a wolf read broadside the
       same way; without the sign flip a snake would read end-on while a wolf read broadside).
   Bodies with NO long axis (biped family, blob-mass ooze, swarm-scatter, horror-mass) get 0 — they're
   already correct (the biped IS the convention; a blob/swarm/amorphous mass has no "front" to align).
   Tuned by CAPTURE (dev/model-qa/capture.mjs) against Adam's ruling, never by box-math alone.
   ============================================================================ */
const HALF_PI = Math.PI / 2;
// per-BASE-part assembly yaw (radians), applied to the whole figure group. A base absent from this
// table => 0 (no yaw — the biped convention / a body with no long axis). Keyed by the §1 base-part
// name a recipe carries (recipe.base) so it's the single source both the recipe path and the legacy
// archetype path resolve through (the legacy path maps its archetype -> base via ARCHETYPE_BASE_FOR
// below, so the two paths can never disagree on which way a wolf faces).
const BASE_ORIENT_YAW = {
  "torso-quad": -HALF_PI,       // world-X long axis -> broadside profile (wolf/dragon/bat)
  "thorax-abdomen": -HALF_PI,   // world-X long axis -> broadside profile (spider)
  "serpent-coil": HALF_PI       // world-Z long axis -> broadside profile (same screen direction as the quads)
};
function orientYawForBase(baseKey){
  return (baseKey && BASE_ORIENT_YAW[baseKey] != null) ? BASE_ORIENT_YAW[baseKey] : 0;
}
// the legacy archetype-builder path knows its ARCHETYPE, not its base part — map archetype -> the base
// part its builder actually composes (mirrors gen-model-recipes.py's ARCHETYPE_TO_BASE, kept in sync
// by this small table) so orientYawForBase resolves the same yaw for a legacy quadruped figure as for
// a recipe torso-quad one. Only the long-axis archetypes need an entry; every other archetype -> 0.
const ARCHETYPE_ORIENT_BASE = {
  quadruped: "torso-quad", arachnid: "thorax-abdomen", serpent: "serpent-coil"
};
function orientYawForArchetype(archetype){
  return orientYawForBase(ARCHETYPE_ORIENT_BASE[archetype]);
}

/* ============================================================================
   Fallback composed-cuboid figures (BATTLE-THEATER §3: "3-8 boxes each" in T1; PASS 2, 2026-07-03,
   raises that budget — "keep every figure under ~24 boxes" — to afford separated head/torso/pelvis,
   tapered stacked-segment limbs, and slight per-box rotations so a figure reads as a STANCED
   miniature, not a totem of bricks, at a 100px-tall render (§3's explicit test). Deterministic —
   every builder is a pure function of a seed number (from theaterWithinZoneOffset's hash, so a given
   unit id always composes the same figure) plus this pass's new inputs (silhouette, weapon) — no
   Math.random anywhere in this file. Colors are flat per-kind tints (pc/ally/foe distinguished by the
   caller via a group-level material tint, not baked into the geometry here) — T1.5 setUnits also
   applies a texture material when one is loaded for the "prop"-adjacent unit tint key, but the
   geometry/proportions below are untouched by that (textures ride on top of shape).

   PASS 2 additions (9 archetypes total, up from 5): giant (huge biped, massive shoulders, 1.5-2 tile
   read), ooze (low wide stacked-shrinking blob), arachnid (low body + 6-8 angled leg slabs),
   amorphous-horror (asymmetric mass + tentacle slabs) — plus every existing archetype gets a
   de-blocking pass: separated head/torso/pelvis instead of one torso slab, tapered (stacked-shrinking)
   limb segments instead of single uniform boxes, and small deterministic rotations on limb/stance
   boxes (a slight lean, a canted weapon, an asymmetric stance) so nothing stands at rigid attention.
   ============================================================================ */
function seededJitter(seed, i, spread){
  // tiny deterministic pseudo-jitter so repeated boxes in one figure don't look copy-pasted identical;
  // NOT a security/statistical RNG, just a cheap hash -> [-spread, spread] mapper.
  const h = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453);
  return ((h - Math.floor(h)) * 2 - 1) * spread;
}

/* G5 ROUND-1 (ruling 4, translucent): `opacity` is an OPTIONAL 8th arg (undefined/1 = fully opaque,
   the pre-existing default every other caller keeps getting) — a figure-level translucent flag
   (buildFigureFromRecipe, see its own G5 comment) passes ~0.45 down through every box this function
   creates for that figure. transparent/depthWrite only toggle when opacity is actually < 1, so an
   opaque figure's material stays byte-identical to before this ruling (no behavior change for the
   overwhelming majority of figures that never carry `translucent`). */
/* UNIT 1: `skinKey` is an OPTIONAL 13th arg (partName:variantKey context the caller threads for the
   pixel-skin cache/seed — undefined for the handful of raw inline boxes that don't route through a
   part function, e.g. buildFlyer's own body/beak core; those fall back to a color-only skin key, still
   deterministic). Material construction now goes through figureMaterialFor (the one funnel): pixel-skin
   CanvasTexture when capable+enabled, the exact pre-Unit-1 flat-color material otherwise. */
/* ============================================================================
   SHAPE-WAVE UNIT 1 — geometryForSpec: the ONE place a §1 part's `shape` field becomes a THREE
   geometry (theater-parts.js's SHAPE_TRIS names each primitive's tri budget; this builds them, kept in
   EXACT lockstep with that table's segment/detail choices by comment — a change to a segment count here
   MUST update SHAPE_TRIS there, else the tri-budget harness's counts drift from reality). Every
   primitive is sized to the spec's `box:{w,h,d}` bounding size (so the pixel-skin texture sizing +
   the harness's bounding-box reasoning stay valid across all shapes), point-up on +Y, centered at the
   part-local origin — the exact placement convention BoxGeometry already used, so swapping a box for a
   prism never shifts a part. A `null`/absent/"box"/unknown shape => a plain BoxGeometry (the pre-Unit-1
   path, byte-identical for every existing boxSpec call). Deterministic: no randomness, fixed segment
   counts — same spec => same geometry, forever (the determinism guarantee every part already carries). */
function geometryForSpec(shape, w, h, d, sp){
  sp = sp || {};
  switch(shape){
    case "taperedBox": {
      // a box whose +Y face vertices are scaled toward the center by topScale (a frustum read). Build a
      // unit box then scale the top-face verts; cheaper + more predictable than a 4-sided cylinder and
      // keeps the exact 12-tri count SHAPE_TRIS records.
      const g = new THREE.BoxGeometry(w, h, d);
      const ts = sp.topScale != null ? sp.topScale : 0.7;
      const pos = g.attributes.position;
      const halfH = h / 2;
      for(let i = 0; i < pos.count; i++){
        if(pos.getY(i) > halfH - 1e-6){ pos.setX(i, pos.getX(i) * ts); pos.setZ(i, pos.getZ(i) * ts); }
      }
      pos.needsUpdate = true; g.computeVertexNormals();
      return g;
    }
    case "wedge": {
      // a triangular prism (ramp): rectangular base in x/z, sloping up from the low x-edge to the high
      // x-edge over height h. dir flips which x-end is tall. 8 tris (2 triangular caps + 3 quad faces).
      const dir = sp.dir != null ? sp.dir : 1;
      const hw = w / 2, hh = h / 2, hd = d / 2;
      // low edge at x = -hw*dir (y=-hh), high edge at x = +hw*dir (y from -hh..+hh). Two triangular
      // cross-sections at z=±hd, connected.
      const lowX = -hw * dir, highX = hw * dir;
      const v = [
        // z = +hd cap (triangle): low-bottom, high-bottom, high-top
        lowX, -hh, hd,  highX, -hh, hd,  highX, hh, hd,
        // z = -hd cap (triangle)
        lowX, -hh, -hd,  highX, hh, -hd,  highX, -hh, -hd
      ];
      // faces as index triples into the 6 verts above (0-2 = +z cap, 3-5 = -z cap)
      const idx = [
        0, 1, 2,            // +z cap
        3, 4, 5,            // -z cap
        0, 2, 4, 0, 4, 3,   // sloped top face (lowbot+z, hightop+z, hightop-z, lowbot-z)
        0, 3, 5, 0, 5, 1,   // bottom face
        1, 5, 4, 1, 4, 2    // vertical (high) face
      ];
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    }
    case "prism6":
    case "prism8": {
      const sides = shape === "prism8" ? 8 : 6;
      const ts = sp.topScale != null ? sp.topScale : 1;
      // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments). Map w->x-diameter,
      // d->z-diameter (scale the built unit-radius cylinder non-uniformly so a prism can be an
      // elliptical column, matching the box's w!=d freedom). A rotY of +π/sides seats a flat face
      // toward the viewer rather than a vertex edge (reads cleaner at cell scale).
      const g = new THREE.CylinderGeometry(0.5 * ts, 0.5, h, sides);
      g.scale(w, 1, d);
      g.rotateY(Math.PI / sides);
      return g;
    }
    case "lozenge": {
      // a stretched octahedron (faceted diamond). OctahedronGeometry has radius 1 -> scale to half-dims.
      const g = new THREE.OctahedronGeometry(0.5, 0);
      g.scale(w, h, d);
      return g;
    }
    case "coneLow": {
      const dir = sp.dir != null ? sp.dir : 1;
      const g = new THREE.ConeGeometry(0.5, h, 8);
      g.scale(w, 1, d);
      if(dir < 0) g.rotateZ(Math.PI); // point down
      return g;
    }
    case "blobLow": {
      // a low-poly icosphere (detail 0, 20 tris) scaled per box dims (L20's rounded ooze mass).
      const g = new THREE.IcosahedronGeometry(0.5, 0);
      g.scale(w, h, d);
      return g;
    }
    case "loft":
      return buildLoftGeometry(sp);
    default:
      return new THREE.BoxGeometry(w, h, d);
  }
}

/* SHAPE-WAVE (L21) — buildLoftGeometry: skin a spine of cross-section loops into ONE continuous
   triangle mesh with capped ends (theater-parts.js's loftSpec authors the spine + carries its exact
   tri count; this is the render half). Each loop is an ellipse of (rx,rz) with `sides` verts at height
   y, optionally center-offset (x,z). Consecutive loops bridge as a quad strip (2 tris/side); the end
   loops fan-cap unless they're a point (rx=rz=0). All loops use the spec's normalized `sides` (a loop
   authored with fewer sides simply samples the same angle set — its rx/rz still shape it). Point-loops
   (rx=rz=0) collapse to a single apex vertex repeated, so a tapered tip reads as a cone cap, not a
   pinched polygon. Deterministic — pure function of the spine; no randomness, fixed winding. Normals
   computed so Lambert lighting reads the curved skin. Total-function: a malformed/short spine degrades
   to a tiny box so a bad recipe never throws mid-render (matching this file's discipline everywhere). */
function buildLoftGeometry(sp){
  const spine = (sp && sp.spine) || [];
  const sides = (sp && sp.sides) || 6;
  if(spine.length < 2) return new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const positions = [];
  const indices = [];
  // build each loop's ring of vertices (a point-loop emits `sides` copies of its apex so the bridge
  // indexing stays uniform — the degenerate quads there collapse to triangles at the apex, a clean cone).
  const ringStart = [];
  for(let i = 0; i < spine.length; i++){
    const lp = spine[i];
    const cx = lp.x || 0, cz = lp.z || 0, y = lp.y;
    ringStart.push(positions.length / 3);
    for(let s = 0; s < sides; s++){
      const ang = (s / sides) * Math.PI * 2;
      positions.push(cx + Math.cos(ang) * lp.rx, y, cz + Math.sin(ang) * lp.rz);
    }
  }
  // bridge consecutive rings
  for(let i = 0; i < spine.length - 1; i++){
    const a = ringStart[i], b = ringStart[i + 1];
    for(let s = 0; s < sides; s++){
      const s2 = (s + 1) % sides;
      // quad (a+s, a+s2, b+s2, b+s) -> 2 tris, wound for outward normals (CCW seen from outside)
      indices.push(a + s, b + s, a + s2);
      indices.push(a + s2, b + s, b + s2);
    }
  }
  // end caps (skip a point-loop). Fan from vertex 0 of the ring.
  const first = spine[0], last = spine[spine.length - 1];
  if(!(first.rx === 0 && first.rz === 0)){
    const r = ringStart[0];
    for(let s = 1; s < sides - 1; s++){ indices.push(r, r + s + 1, r + s); } // bottom cap (inward-facing winding)
  }
  if(!(last.rx === 0 && last.rz === 0)){
    const r = ringStart[spine.length - 1];
    for(let s = 1; s < sides - 1; s++){ indices.push(r, r + s, r + s + 1); } // top cap
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/* UNIT 1: `shapeSpec` is an OPTIONAL 14th arg — the primitive descriptor {shape, topScale?, sides?,
   dir?} for a non-box part box (threaded by renderPartInto from the spec's own `shape`/params fields).
   Absent (every raw inline addBox call — buildFlyer's core, condition mods, etc.) => a plain box, the
   pre-Unit-1 path byte-identical. */
function addBox(group, w, h, d, x, y, z, color, rotY, rotX, rotZ, opacity, skinKey, shapeSpec, glossy){
  const geo = (shapeSpec && shapeSpec.shape && shapeSpec.shape !== "box")
    ? geometryForSpec(shapeSpec.shape, w, h, d, shapeSpec)
    : new THREE.BoxGeometry(w, h, d);
  const mat = figureMaterialFor(color, opacity, skinKey, glossy);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if(rotY) mesh.rotation.y = rotY;
  if(rotX) mesh.rotation.x = rotX;
  if(rotZ) mesh.rotation.z = rotZ;
  group.add(mesh);
  return mesh;
}

/* a tapered stacked-segment limb: N shrinking boxes stacked bottom-to-top (or top-to-bottom, via
   `dir`), each segment slightly narrower than the last — the "de-block" answer to a single uniform
   leg/arm box (BATTLE-THEATER pass 2: "tapered limbs (stacked shrinking segments)"). `baseW`/`baseD`
   are the widest (root) segment's footprint; `taper` is the per-segment shrink factor (0.8 = each
   segment is 80% of the previous one's width/depth). Returns the total length consumed so callers can
   place the next joint above/below it. `tiltZ`/`tiltX` apply ONE shared small rotation to every
   segment in the limb (a slight outward cant or forward bend), not a per-segment random wobble —
   keeps the limb reading as one coherent angled piece, not a jittery stack. */
function addTaperedLimb(group, segCount, baseW, baseD, segLen, x, yStart, z, color, dir, tiltZ, tiltX){
  dir = dir || 1; // 1 = stack upward from yStart, -1 = stack downward
  let y = yStart;
  let w = baseW, d = baseD;
  const taper = 0.82;
  for(let i = 0; i < segCount; i++){
    const segY = y + (dir * segLen) / 2;
    addBox(group, w, segLen, d, x, segY, z, color, 0, tiltX || 0, tiltZ || 0);
    y += dir * segLen;
    w *= taper; d *= taper;
  }
  return Math.abs(segLen * segCount);
}

/* ============================================================================
   MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2/§6) — buildFigureFromParts: the composition engine
   that turns theater-parts.js's pure {box,pos,rot,taper?,channel} arrays into real THREE meshes,
   reusing THIS file's own addBox (so PSX shader tweaks / material construction stay in exactly one
   place, unchanged). A part's boxes are authored in PART-LOCAL space; `offset`/rot let a caller place
   an attached module at its body's anchor transform (§2) — the archetype builders below pass the
   body's own `.anchors` entries straight through, so a module composes exactly where the body
   contract says it should. `channelTints` maps a part's semantic channel name (skin/armor/weapon/
   accent/glow) to an actual color for THIS figure — archetype builders below pass a single-tint map
   (every channel -> the same figure tint) to stay pixel-identical to the pre-G1 single-tint-per-
   figure baseline; a later recipe/loadout-mirror unit can pass a richer per-channel map without this
   function changing at all. */
/* G5 ROUND-1 (ruling 4): `opacity` is an optional 7th arg, threaded straight through to every
   addBox call this function makes (undefined = fully opaque, unchanged for every existing caller —
   only buildFigureFromRecipe passes a real value, and only for a recipe carrying `translucent`). */
/* UNIT 1: `variantKey` is an OPTIONAL 8th arg — the per-FIGURE context (recipe slug / archetype+seed
   bucket / "pc"/"ally"/"foe" kind) the caller threads so the pixel-skin cache key is
   partName:channel:variantKey (the brief's (part, palette, variant) triple). A caller that omits it
   (every pre-Unit-1 call site until they're updated) gets a stable "" variant — the skin is then keyed
   by part+channel-color alone, which is still fully deterministic and correctly shared across figures
   of the same species; variantKey only SUBDIVIDES the cache further when a caller wants a per-figure
   distinct skin. Kept optional so this is a purely additive thread — no existing call site breaks. */
function renderPartInto(group, partFn, params, channelTints, offset, rotOffset, opacity, variantKey, glossy){
  offset = offset || { x: 0, y: 0, z: 0 };
  rotOffset = rotOffset || { x: 0, y: 0, z: 0 };
  const boxes = partFn(params || {});
  const cosY = Math.cos(rotOffset.y || 0), sinY = Math.sin(rotOffset.y || 0);
  const partName = partNameOf(partFn);
  const vKey = variantKey || "";
  boxes.forEach(function(b){
    // rotate the box's local x/z by the anchor's yaw (rotOffset.y) before translating by offset —
    // matches how a module attaches to a body anchor with its own orientation (§2's `rot` transform).
    // x/z-tilt anchors (rare in this unit's own anchor set) are applied as a straight rotation add,
    // not a full matrix compose — sufficient for the axis-aligned attachments this library uses today.
    const lx = b.pos.x, lz = b.pos.z;
    const rx = lx * cosY - lz * sinY;
    const rz = lx * sinY + lz * cosY;
    const x = rx + offset.x, y = b.pos.y + offset.y, z = rz + offset.z;
    const rotY = (b.rot.y || 0) + (rotOffset.y || 0);
    const rotX = (b.rot.x || 0) + (rotOffset.x || 0);
    const rotZ = (b.rot.z || 0) + (rotOffset.z || 0);
    const channel = b.channel || "skin";
    const color = (channelTints && channelTints[channel] != null) ? channelTints[channel] : (channelTints && channelTints.skin);
    // UNIT 1: the pixel-skin cache/seed key is partName:channel:variantKey — the (part, palette-slot,
    // variant) triple the brief names (the resolved channel COLOR is appended inside figureMaterialFor,
    // so the same part+channel under two different palettes correctly mints two textures). SHAPE-WAVE
    // UNIT 1: a spec carrying a `shape` field (taperedBox/wedge/prism6|8/lozenge/coneLow/blobLow) routes
    // its geometry via geometryForSpec inside addBox — a spec with no shape stays a plain box.
    const skinKey = partName + ":" + channel + ":" + vKey;
    addBox(group, b.box.w, b.box.h, b.box.d, x, y, z, color, rotY, rotX, rotZ, opacity, skinKey,
      b.shape ? b : null, glossy);
  });
}

/* a flat single-tint channel map — every §5 channel resolves to the SAME figure tint, matching the
   pre-G1 baseline (theater-boot.js has never had per-channel coloring; that's a later recipe-unit
   concern, §5's "the theater resolves channels through the active palette stack"). */
function flatTints(tint){
  return { skin: tint, armor: tint, weapon: tint, accent: tint, glow: tint };
}

/* biped: VS-leaning, PASS 2 de-blocked — separate head/torso/pelvis (was one torso slab), tapered
   stacked-segment legs+arms (was a single uniform box per limb), a slight asymmetric stance (weight
   on the left leg, right leg canted) instead of both legs standing dead-straight at attention, and a
   canted weapon-slab off the right hand shaped by `weapon` (§3 CLASS SILHOUETTES/WEAPON SHAPES — see
   weaponMeshFor below). `silhouette` (martial/ranger/caster/cleric, PC/ally only; undefined for foes)
   nudges the stance: caster gets a flared robe-skirt lower body instead of a pelvis box + legs;
   cleric gets a shield slab on the off-hand; ranger gets a lower crouched stance (torso/head dropped,
   knees bent via a sharper leg-segment angle). ~13-16 boxes depending on silhouette/weapon, well
   under the 24-box budget. */
/* MODEL-GRAMMAR G1: thin composition over theater-parts.js — torso-biped (the 4-box head/torso/
   shoulder/pelvis core, within the §1 <=6-box-per-part budget) + 2x leg-tapered (or, for the caster
   silhouette, robe-skirt swaps in for pelvis+legs) + 2x arm-tapered + an optional weapon/shield
   module, anchored at torso-biped's own §2 anchor set. Visually equivalent to the pre-G1 inline
   version (same box literals, now sourced from the part functions, legs/arms split into their own
   reusable limb parts). */
function buildBiped(seed, tint, silhouette, weapon){
  const g = new THREE.Group();
  const crouch = silhouette === "ranger" ? 0.06 : 0; // ranger/rogue: lower stance
  const stanceTilt = 0.05 + seededJitter(seed, 0, 0.02); // slight deterministic weight-shift, per-figure
  const tints = flatTints(tint);
  const anchors = Parts.torsoBiped.anchors;

  if(silhouette === "caster"){
    // caster: head/torso/shoulder-bar ONLY from torso-biped's own boxes (its own core's 4th box is a
    // pelvis — SKIPPED here since robe-skirt supplies its own pelvis/hip box in the exact same
    // position, trading torso-biped's bare pelvis for robe-skirt's flared trapezoid-read lower body,
    // matching the original's exact branch: a caster reads by NOT having leg-gaps).
    const headTorsoShoulder = Parts.torsoBiped({ crouch, stanceTilt }).slice(0, 3);
    headTorsoShoulder.forEach(function(b){
      addBox(g, b.box.w, b.box.h, b.box.d, b.pos.x, b.pos.y, b.pos.z, tints[b.channel] || tint, b.rot.y, b.rot.x, b.rot.z);
    });
    renderPartInto(g, Parts.robeSkirt, { crouch }, tints, { x: 0, y: 0, z: 0 });
  } else {
    renderPartInto(g, Parts.torsoBiped, { crouch, stanceTilt }, tints, { x: 0, y: 0, z: 0 });
    // legs: leg-tapered x2 (source params factored out onto torso-biped.legParams so the exact
    // thigh/shin literals live next to the body they came from, not duplicated at this call site).
    renderPartInto(g, Parts.legTapered, Parts.torsoBiped.legParams(-1, crouch, stanceTilt), tints, { x: 0, y: 0, z: 0 });
    renderPartInto(g, Parts.legTapered, Parts.torsoBiped.legParams(1, crouch, stanceTilt), tints, { x: 0, y: 0, z: 0 });
  }

  // arms: arm-tapered x2 (left/right), anchored at torso-biped's own `shoulders` transform (which is
  // {0,0,0}-offset by convention here — arm-tapered's own params already carry the absolute biped arm
  // position, matching §2's "modules declare which anchor they expect" while staying pixel-identical).
  renderPartInto(g, Parts.armTapered, { side: -1, tiltZ: 0.16, crouch }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, { side: 1, tiltZ: -0.16, crouch }, tints, { x: 0, y: 0, z: 0 });

  const weaponMesh = weaponMeshFor(weapon, tint);
  if(weaponMesh){ weaponMesh.position.y -= crouch; g.add(weaponMesh); }
  if(silhouette === "cleric"){
    // off-hand shield slab: shield-slab's own box already carries the final rotY=0.15 (matching the
    // anchor's own rotation), so only POSITION offsets by the anchor here — passing rotOffset too
    // would double-apply the rotation (shieldSlab's internal ry + the anchor's own ry).
    renderPartInto(g, Parts.shieldSlab, {}, tints, { x: anchors.offHand.pos.x, y: anchors.offHand.pos.y - crouch, z: anchors.offHand.pos.z });
  }
  return g;
}

/* quadruped: low, long-bodied, PASS 2 de-blocked — separate head/snout/neck (was head+snout only),
   tapered 2-segment legs (was single uniform boxes) with the rear haunch pair carrying a sharper
   angle for the "predator crouch" read. ~10 boxes. */
/* MODEL-GRAMMAR G1: torso-quad (body/neck/head/snout core) + 4x leg-tapered (front pair tilts on X,
   rear/haunch pair tilts on Z — see leg-tapered's own params doc). */
function buildQuadruped(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  renderPartInto(g, Parts.torsoQuad, {}, tints, { x: 0, y: 0, z: 0 });
  // UNIT 2: same lofted legs + rear-hock as the recipe path's QUAD_LIMB_LEG_SETS (kept in sync).
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.16, x: 0.28, z: -0.13, yStart: 0.02, tiltX: 0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-left
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.16, x: 0.28, z: 0.13, yStart: 0.02, tiltX: -0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-right
  renderPartInto(g, Parts.legTapered, { baseW: 0.1, segLen: 0.19, x: -0.32, z: -0.14, yStart: 0.02, tiltZ: 0.12, hock: -0.06 }, tints, { x: 0, y: 0, z: 0 });   // rear-left, haunch+hock
  renderPartInto(g, Parts.legTapered, { baseW: 0.1, segLen: 0.19, x: -0.32, z: 0.14, yStart: 0.02, tiltZ: -0.12, hock: -0.06 }, tints, { x: 0, y: 0, z: 0 });   // rear-right, haunch+hock
  return g;
}

/* flyer: slim vertical body, PASS 2 de-blocked — separate head/beak, 2-part swept wings (root+tip,
   each angled a bit more than the last for a real wing-bend instead of one flat slab) + a forked
   tail. ~9 boxes. */
/* MODEL-GRAMMAR G1: the flyer's slim body+head+beak core has NO listed §1 body precedent (the
   inventory's body list is biped/biped-huge/quad/blob/thorax-abdomen/serpent/swarm/horror-mass —
   no dedicated flyer torso), so it stays a small inline core (3 boxes, unchanged from T1/PASS-2)
   while the wings (2x wing-slab) and tail (2x single-segment tail-segments, reproducing the fork
   half exactly via tail-segments' x/yBase/zStart/rz overrides) move to their listed §1 parts. */
function buildFlyer(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  addBox(g, 0.2, 0.3, 0.2, 0, 0.7, 0, tint);                                // body — slim, vertical
  addBox(g, 0.14, 0.14, 0.16, 0, 0.96, 0.08, tint, 0.05);                   // head
  addBox(g, 0.08, 0.06, 0.1, 0, 1.0, 0.2, tint);                            // beak stub
  renderPartInto(g, Parts.wingSlab, { side: -1 }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.wingSlab, { side: 1 }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.tailSegments, { segCount: 1, baseW: 0.06, x: -0.05, yBase: 0.38, zStart: -0.28, rz: 0.18 }, tints, { x: 0, y: 0, z: 0 }); // tail fork left
  renderPartInto(g, Parts.tailSegments, { segCount: 1, baseW: 0.06, x: 0.05, yBase: 0.38, zStart: -0.28, rz: -0.18 }, tints, { x: 0, y: 0, z: 0 }); // tail fork right
  return g;                                                                  // 9 boxes
}

/* MODEL-GRAMMAR G1: serpent-coil, split across TWO calls (segments 0-3, 4-6) to respect the part's
   <=6-box budget — totalSegs=7 keeps the taper/spacing math identical to the pre-split single loop,
   so the two halves read as one continuous coil. Seeded via zSeed/yawSeed arrays (unit-normalized
   [-1,1] hashes — the part itself applies the same 0.02/0.08 spread scale seededJitter used to apply
   internally, per §1's "seeding happens at recipe level" rule: this builder is now the caller that
   owns the seed). */
function buildSerpent(seed, tint){
  const g = new THREE.Group();
  const totalSegs = 7;
  const zSeed = [], yawSeed = [];
  for(let i = 0; i < totalSegs; i++){ zSeed.push(seededJitter(seed, i, 1)); yawSeed.push(seededJitter(seed, i + 30, 1)); }
  const tints = flatTints(tint);
  renderPartInto(g, Parts.serpentCoil, { totalSegs, startIdx: 0, count: 4, zSeed: zSeed.slice(0, 4), yawSeed: yawSeed.slice(0, 4) }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.serpentCoil, { totalSegs, startIdx: 4, count: 3, zSeed: zSeed.slice(4), yawSeed: yawSeed.slice(4) }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                     // 7 boxes
}

/* MODEL-GRAMMAR G1: swarm-scatter, seeded via a `ring` array of {r,s,y,rot} per-element unit-
   normalized hashes, matching buildSwarm's original seededJitter spreads (r:0.06, s:0.03, y:0.1,
   rot:0.4) — swarm-scatter's own boxSpec math re-applies those same spreads. */
/* MODEL-GRAMMAR G1: swarm-scatter, split across TWO calls (elements 0-4, 5-8) to respect the part's
   <=6-box budget — totalN=9 keeps the ring-angle math identical to the pre-split single ring, so the
   two halves land on the SAME shared ring, not two independently-spaced smaller rings. Seeded via a
   `ring` array of {r,s,y,rot} per-element unit-normalized hashes, matching buildSwarm's original
   seededJitter spreads (r:0.06, s:0.03, y:0.1, rot:0.4). */
/* SHAPE-WAVE UNIT 3 (L17): the legacy swarm path now renders ONE irregular member cluster (the split-
   call ring workaround is gone — swarmScatter builds the whole deterministic cluster itself). The
   legacy path has no name to pick a member kind from, so it uses the "generic" member (a small faceted
   speck) — the recipe path (buildFigureFromRecipe) passes a real member kind derived from the swarm's
   name (the generator's swarmMember field). */
function buildSwarm(seed, tint){
  const g = new THREE.Group();
  renderPartInto(g, Parts.swarmScatter, { member: "generic", n: 10 }, flatTints(tint), { x: 0, y: 0, z: 0 });
  return g;
}
/* NEW ARCHETYPE — giant: huge biped, massive shoulders, 1.5-2 tile stand-tall read (Adam: "huge
   biped, 1.5-2 tiles tall, massive shoulders"). Built from the same de-blocked biped vocabulary
   (separate head/torso/pelvis, tapered limbs) but every proportion is scaled up and the shoulder bar
   is dramatically wider/thicker than a biped's — the mass differential IS the archetype, not just a
   uniform scale-up of buildBiped (a giant needs to read distinctly bulkier even next to a scaled biped,
   so shoulder/torso width grows faster than height). No weapon slab by default (a bare massive-fist
   read); a foe-side weapon (club/mace/axe are common giant weapons) still composes via weaponMeshFor
   when the bestiary action text supplies one. ~11 boxes. */
/* MODEL-GRAMMAR G1: torso-biped-huge (head/torso/shoulder/pelvis/legs/arms, all 12 boxes — see that
   part's own header for the exact addTaperedLimb-equivalent leg/arm math). */
/* MODEL-GRAMMAR G1: torso-biped-huge (4-box core) + 2x leg-tapered + 2x arm-tapered, via the body's
   own .legParams/.armParams factories (see theater-parts.js for the exact source literals). */
function buildGiant(seed, tint, silhouette, weapon){
  const g = new THREE.Group();
  const lean = seededJitter(seed, 0, 0.04); // slight deterministic hunch/lean, never dead-upright
  const tints = flatTints(tint);
  renderPartInto(g, Parts.torsoBipedHuge, { lean }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.legTapered, Parts.torsoBipedHuge.legParams(-1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.legTapered, Parts.torsoBipedHuge.legParams(1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, Parts.torsoBipedHuge.armParams(-1), tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.armTapered, Parts.torsoBipedHuge.armParams(1), tints, { x: 0, y: 0, z: 0 });
  // G5 ROUND-1 (ruling 3): seat the giant's weapon at ITS OWN arm anchor (torsoBipedHuge.anchors.
  // mainHand, x=0.5/y=0.42) instead of inheriting biped's smaller-figure default offset — the giant's
  // arm-tapered call sits at a completely different x/y than the biped's, so reusing WEAPON_BASE_OFFSET
  // here was the other half of the "disconnected" read (a correctly-anchored biped weapon would still
  // float beside a giant's actual hand).
  const giantHandOffset = { x: Parts.torsoBipedHuge.anchors.mainHand.pos.x,
    y: Parts.torsoBipedHuge.anchors.mainHand.pos.y, z: Parts.torsoBipedHuge.anchors.mainHand.pos.z };
  const weaponMesh = weaponMeshFor(weapon || "mace", tint, giantHandOffset); // giants default to a blunt weapon read
  if(weaponMesh){ weaponMesh.scale.setScalar(1.4); g.add(weaponMesh); }
  return g;                                                                  // 12 boxes
}

/* NEW ARCHETYPE — ooze: low wide blob, stacked shrinking irregular boxes (Adam: "low wide blob —
   stacked shrinking irregular boxes"). No limbs/head at all — the whole point of an ooze silhouette
   is the ABSENCE of any articulated parts, just a soft-edged (in read, not geometry — still cuboid)
   mound. Each layer is offset slightly off-center (seeded, deterministic) so the stack doesn't read
   as a perfect pyramid — an irregular slump instead. 6 layers. */
/* MODEL-GRAMMAR G1: blob-mass, seeded via a unit-normalized `offsets` array (blob-mass's own boxSpec
   math re-applies the 0.02/0.06/0.3 spreads seededJitter used inline). */
function buildOoze(seed, tint){
  const g = new THREE.Group();
  const layers = 6;
  const offsets = [];
  for(let i = 0; i < layers; i++){ offsets.push(seededJitter(seed, i, 1)); }
  renderPartInto(g, Parts.blobMass, { offsets }, flatTints(tint), { x: 0, y: 0, z: 0 });
  return g;                                                     // 6 boxes
}

/* NEW ARCHETYPE — arachnid: low body + 6-8 angled leg slabs (Adam: "low body + 6-8 angled leg
   slabs"). Two body segments (cephalothorax + abdomen, the real spider-anatomy split — reads more
   "spider" than one blob) and 8 thin angled leg slabs radiating outward, alternating up/down angle
   per side for a scuttling read instead of a symmetric star. ~10 boxes. */
/* MODEL-GRAMMAR G1: thorax-abdomen (body core) + 8x leg-spider (one call per leg, count=4 per side —
   matches the original's legCount/2 split exactly). */
function buildArachnid(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  renderPartInto(g, Parts.thoraxAbdomen, {}, tints, { x: 0, y: 0, z: 0 });
  const legCount = 8;
  for(let i = 0; i < legCount; i++){
    const side = i < legCount / 2 ? 1 : -1;
    const idx = i % (legCount / 2);
    const tiltSeed = seededJitter(seed, i, 1); // unit-normalized; leg-spider re-applies the 0.08 spread
    renderPartInto(g, Parts.legSpider, { side, idx, count: legCount / 2, tiltSeed }, tints, { x: 0, y: 0, z: 0 });
  }
  return g;                                                     // 10 boxes
}

/* NEW ARCHETYPE — amorphous-horror: asymmetric mass + tentacle slabs (Adam: "aberration: asymmetric
   mass + tentacle slabs"). A lumpy asymmetric core (3 overlapping boxes at different sizes/offsets,
   deterministically seeded so no two aberrations look identical) with 4-6 thin tentacle slabs jutting
   at irregular angles — the "wrongness" read comes from the asymmetry itself, not from any single
   exotic shape. ~9 boxes. */
/* MODEL-GRAMMAR G1: horror-mass (asymmetric 3-box core) + drip-tendrils (5-tentacle count, reusing
   the SAME radiating-slab part the FX-attachment category lists — see that part's own header). */
function buildAmorphousHorror(seed, tint){
  const g = new THREE.Group();
  const tints = flatTints(tint);
  const jitter = [];
  for(let i = 0; i < 7; i++){ jitter.push(seededJitter(seed, i, 1)); }
  renderPartInto(g, Parts.horrorMass, { jitter }, tints, { x: 0, y: 0, z: 0 });
  const tentacles = 5;
  const angleSeed = [], lenSeed = [], tiltSeed = [], rollSeed = [];
  for(let i = 0; i < tentacles; i++){
    angleSeed.push(seededJitter(seed, i + 10, 0.6));
    lenSeed.push(seededJitter(seed, i + 20, 0.16));
    tiltSeed.push(seededJitter(seed, i + 30, 0.5));
    rollSeed.push(seededJitter(seed, i + 40, 0.5));
  }
  // angleAxis:"y" matches the original inline loop's rotY=ang placement (addBox's positional order
  // is rotY,rotX,rotZ — the source call passed `ang` first, i.e. into rotY).
  renderPartInto(g, Parts.dripTendrils, {
    count: tentacles, radius: 0.22, yBase: 0.2, baseLen: 0.32, thickness: 0.06, angleAxis: "y",
    angleSeed, lenSeed, tiltSeed, rollSeed
  }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                     // 8 boxes
}

/* §3 WEAPON SHAPES — a small box (or box-pair) attached at the biped/giant's off-hand position, keyed
   by the weapon shape string theater-data.js derives (theaterWeaponForClass / theaterWeaponForFoe):
   sword = a long thin slab, axe = a short pole + a wide wedge-read box, bow = two thin angled slabs
   forming a shallow V (a real curve isn't worth a new geometry type — the angled-pair reads as a bow
   in silhouette per Adam's own fallback note), staff = a tall thin pole + a small tip cube, mace/
   dagger = shorter slab variants sized to their weapon. Returns null for "none"/unrecognized (no mesh
   added — the archetype's bare-limb read stands alone). Position is relative to the figure's own
   local origin (canted off the right/weapon hand, ~0.4 out on x) — callers may re-scale/reposition
   the returned group (buildGiant scales it up for its bigger hands). */
/* MODEL-GRAMMAR G1: weaponMeshFor is now a thin dispatch over the WEAPONS part category (sword-slab/
   axe-wedge/bow-arcs/staff-tipped/spear-pole/dagger-slabs). "mace" has no listed §1 weapon key of its
   own (weaponMeshFor's original vocabulary predates the §1 inventory, which names club-mass instead) —
   kept mapped to club-mass's blunt haft+head read, the closest §1 equivalent (both are "short haft +
   blunt head"), rather than dropping the mace lookup theater-data.js's weapon-word scan still emits.

   G5 ROUND-1 (ruling 3, the grip fix): this function used to offset every weapon at a hardcoded
   {0.42,0.5,0.04} — the SAME shoulder-height point torsoBiped.anchors.mainHand used to sit at before
   this same session's anchor retarget above. Both are now fixed together: this function's default
   offset/cant matches torso-biped's own corrected mainHand anchor so the legacy (non-recipe)
   archetype-builder path and the recipe-driven buildFigureFromRecipe path seat a weapon at the SAME
   hand position — one grip contract, two call sites (kept in sync by hand across this file and
   theater-parts.js's own torsoBiped.anchors — a drift here would desync the two render paths'
   weapon seat again, the exact class of bug this round's own fix addresses).

   G5 ROUND-2 (finding 1 — "the weapons are all still floating"): round 1's y=0.2 sat below this
   body's own pelvis box (bottom edge ~0.55) — see theater-parts.js's torsoBiped.anchors comment
   for the full mechanism. Retargeted to y=0.56 (the hip/pelvis band), matching torso-biped's own
   anchor retarget exactly (WEAPON_BASE_OFFSET must stay byte-identical to torsoBiped.anchors.
   mainHand.pos — this is the "one grip contract, two call sites" invariant this whole comment is
   about). WEAPON_CANT layers a per-weapon-shape rotation on top of that shared base seat (Adam's
   reference notes: "sword ~30-40° forward cant, spear near-vertical with hand at mid-shaft, bow
   held out") — a sword keeps the base anchor's own -0.6rad (~34°) cant, a spear is canted to
   near-vertical (-0.08rad) with its own y nudged up to read as gripped mid-shaft (spear-pole's head
   is well above the haft's midpoint), a bow rotates further forward+out (-1.1rad) so its arcs read
   held-out in front rather than alongside the body. `offset` (caller-supplied) lets buildGiant
   re-seat at its own bigger-armed anchor instead of inheriting biped's smaller-figure coordinates
   (the giant/biped weapon-offset mismatch round 1 also fixed — buildGiant reads
   torsoBipedHuge.anchors.mainHand live, so it inherited round 2's same hip-band retarget there
   automatically, no separate edit needed). */
const WEAPON_PART_KEY = {
  sword: "sword-slab", axe: "axe-wedge", bow: "bow-arcs", staff: "staff-tipped",
  spear: "spear-pole", mace: "club-mass", dagger: "dagger-slabs"
};
/* rz here is a DELTA added on top of each weapon part's OWN baked-in boxSpec rotation (sword-slab
   already carries rz:-0.3, axe-wedge/spear-pole -0.2/-0.15, dagger-slabs -0.35, club-mass -0.25,
   staff-tipped 0, bow-arcs's two boxes are a +/-0.5 V so it has no single "own cant" to add onto) —
   renderPartInto's rotOffset ADDS to a box's own rot.z (line ~245), so the total cant a weapon reads
   at is (part's own rz) + (this delta), not this value alone. Deltas below are tuned so the TOTAL
   lands in Adam's target ranges: sword/dagger/axe/mace -> ~30-40° forward cant (0.52-0.70 rad) total;
   spear/staff -> near-vertical (small total, hand reading mid-shaft via yNudge); bow -> held OUT
   (a stronger forward rotation than a bladed weapon's cant, since bow-arcs' V needs to visibly present
   forward rather than hang alongside the hip the way a sword does). */
const WEAPON_CANT = {
  // sword-slab's own rz=-0.3; delta -0.3 -> total -0.6 (~34°, mid the 30-40° spec range).
  sword: { rz: -0.3, yNudge: 0 },
  // dagger-slabs' own rz=-0.35; delta -0.25 -> total -0.6 (~34°, same family read, shorter blade).
  dagger: { rz: -0.25, yNudge: 0 },
  // axe-wedge's own rz=-0.2; delta -0.35 -> total -0.55 (~31.5°).
  axe: { rz: -0.35, yNudge: 0 },
  // club-mass's own rz=-0.25; delta -0.3 -> total -0.55 (~31.5°).
  mace: { rz: -0.3, yNudge: 0 },
  // spear-pole's own rz=-0.15; delta +0.07 -> total -0.08 (near-vertical). yNudge lifts the anchor so
  // the grip reads at the haft's MID-SHAFT (spear-pole's spearhead sits well above its local origin;
  // gripping near the bottom, per weaponMeshFor's own offset, would read as holding the very butt-end).
  spear: { rz: 0.07, yNudge: 0.14 },
  // staff-tipped's own rz=0 (a plain vertical pole+tip); a small -0.1 delta reads as a relaxed
  // near-vertical hold rather than dead-plumb, matching the spear's own "near-vertical" family.
  staff: { rz: -0.1, yNudge: 0.1 },
  // bow-arcs has no single baked cant (a symmetric +/-0.5 V) — the delta here is the weapon's WHOLE
  // presented rotation (held out in front, arcs facing the target line rather than hanging at the hip).
  bow: { rz: -0.9, yNudge: 0.02 }
};
/* ============================================================================
   CARRY STATES (L14/L15, 2026-07-03, Adam ruling 3): "every weapon class gets a static-piece-sensible
   carry, zero pose system needed." Which carry a weapon takes is a pure function of its PART (+ a
   name/item heavy-2H signal) — no per-figure pose. Five states:
     - held-fist  : 1H melee + versatile (sword/axe/mace/dagger) -> grip through the mainHand fist,
                    canted across the body (the WEAPON_CANT deltas above ARE this state's cant).
     - planted    : spear/staff/polearm -> vertical in the fist, butt near the ground (the classic
                    at-rest guard). The pole parts already stand near-vertical; the carry drops the
                    weapon so its butt reaches toward the floor and keeps it plumb.
     - back-mount : heavy 2H melee (greatsword/greataxe/maul) -> diagonal across the `back` anchor
                    (Adam: "that's how static game pieces work"; a 2H weapon floating near one hand is
                    a REJECTED state).
     - bow-held   : bow -> vertical arc in the fist (bows read iconic held; never back-mount v1).
     - shield     : off-hand -> the shield-slab already seats at the offHand fist/forearm; verified to
                    intersect it, not float (handled by the offHand anchor being the fist center now).
   The router returns {anchor, rz, dpos:{x,y,z}} — `anchor` names WHICH body anchor to attach at
   (mainHand for held/planted/bow, back for back-mount), `rz` the cant delta on the weapon part, `dpos`
   a small position adjustment layered on the anchor (e.g. planted drops the weapon toward the floor).
   held-fist reproduces the pre-L14 WEAPON_CANT behavior exactly (so a sword's cross-body read is
   unchanged); planted/back-mount/bow are the new deliberate carries. ============================================================================ */
// heavy two-handed melee — a name-keyword signal for the recipe side (the PC-mirror side reads the
// item's own two-handed/heavy property instead — see theaterUnitsFrom/pcRecipe). A weapon-part key
// alone can't tell a longsword (versatile, held-fist) from a greatsword (heavy 2H, back-mount) —
// both resolve to "sword-slab" — so the heavy signal is carried alongside the part.
const HEAVY_2H_NAME_RX = /\bgreat(sword|axe|club|maul)?\b|\bmaul\b|\bheavy\b|two-handed|greataxe|greatsword/i;
// weapon-part-key -> its default carry state (before the heavy-2H override promotes a great-weapon to
// back-mount). Poles plant; bows are held; blades/blunt are held-fist.
const WEAPON_CARRY_STATE = {
  "sword-slab": "held-fist", "axe-wedge": "held-fist", "club-mass": "held-fist", "dagger-slabs": "held-fist",
  "spear-pole": "planted", "staff-tipped": "planted",
  "bow-arcs": "bow-held"
};
/* resolve the carry for a weapon module. `partKey` is the §1 weapon part name (e.g. "sword-slab");
   `opts` may carry {heavy:true} (a heavy-2H signal from the recipe name keyword or the PC item's own
   two-handed property). Returns {anchor, rz, dpos} — never throws; an unknown part defaults to a
   held-fist read at the mainHand. cantKeyFor maps a part back to its WEAPON_CANT key (sword-slab ->
   "sword") for the held-fist cant. */
function weaponCarryFor(partKey, opts){
  opts = opts || {};
  let state = WEAPON_CARRY_STATE[partKey] || "held-fist";
  // heavy 2H promotes a held-fist blade/blunt to back-mount (a greatsword rides the back). Poles/bows
  // are NOT promoted — a heavy spear still plants, a bow is still held (per the ruling's own carve-outs).
  if(opts.heavy && state === "held-fist") state = "back-mount";
  const cantKey = WEAPON_PART_TO_CANT_KEY[partKey];
  const cant = (cantKey && WEAPON_CANT[cantKey]) || { rz: -0.6, yNudge: 0 };
  if(state === "held-fist"){
    return { anchor: "mainHand", rz: cant.rz, dpos: { x: 0, y: cant.yNudge, z: 0 } };
  }
  if(state === "planted"){
    // vertical in the fist, butt toward the floor: near-plumb (small rz), and dropped DOWN so the
    // pole's butt reaches below the fist toward the ground (the mainHand fist sits at y~0.58; a pole
    // is ~0.7 tall, so dropping the grip ~0.26 puts the butt near y~0 while the head clears the head).
    // dpos.x nudges the pole's own -x origin (staff-pole/spear-pole author their haft a touch to -x)
    // back onto the fist center so the haft passes THROUGH the fist (intersection, not adjacency).
    return { anchor: "mainHand", rz: 0.04, dpos: { x: 0.04, y: -0.26, z: 0 } };
  }
  if(state === "bow-held"){
    // vertical arc in the fist: the V stands upright (its two limbs form a vertical bow), held at the
    // fist. dpos.x compensates bow-arcs' own -x origin so the arc's mid-grip sits on the fist; z kept
    // small so the arc stays within the fist's z-depth (it must INTERSECT the fist, not float ahead).
    return { anchor: "mainHand", rz: 0.0, dpos: { x: 0.04, y: 0.0, z: 0.0 } };
  }
  // back-mount: diagonal across the back. Attach at `back` (shoulder-blade), cant strongly so the
  // weapon lies diagonally across the spine, raised so a greatsword's hilt clears one shoulder.
  return { anchor: "back", rz: 0.9, dpos: { x: 0, y: 0.35, z: -0.04 } };
}

/* ============================================================================
   MODEL-GRAMMAR G2 §6 — buildFigureFromRecipe(recipe, tint): the recipe-driven figure
   composer. Reuses THIS file's own renderPartInto/flatTints (G1's composition engine —
   the spec's §6 "buildFigureFromParts" is what renderPartInto already is; this function is
   the whole-figure assembly loop ON TOP of it a recipe needs, same relationship figureFor
   has to the fixed archetype builders below). A recipe names a BASE body part + a flat
   modules[] list of {part,anchor,params?} — every module is looked up in the base body's
   OWN §2 .anchors object (Parts.PARTS[recipe.base].anchors) and rendered at that anchor's
   local transform via renderPartInto's existing offset/rotOffset params, exactly the same
   attach mechanism buildBiped/buildGiant already use for their fixed leg/arm/weapon/shield
   placements — a recipe module is just data naming what those hand-written calls used to
   hardcode. An unknown base/module part (should never happen — data/model-recipes.js's
   generator only ever emits real §1 part names, and the §4b shape-hint resolver validates
   DM-authored ones before they reach a recipe) degrades to the biped fallback / a skipped
   module rather than throwing, matching this file's total-function discipline everywhere
   else. §5 channel->tint: channel names resolve through CHANNEL_TINT_FALLBACK (a flat
   placeholder-tier palette per named channel value, e.g. "leather"/"armor"/"fire"/
   "shadow-dark" — §II.0b placeholder art; the real palette-stack resolution (env/realm/
   faction) is a later unit's scope, same as flatTints' own single-tint baseline before it)
   layered UNDER the unit's own kind tint (pc/ally/foe) so a figure still reads its side at
   a glance even when a recipe's channels diverge from "default". Budget: recipes may run
   over the fixed archetypes' informal box counts (§9 Decision 1: "recipes may improve
   figures... but the preview lineup must render clean") — no hard cap enforced here, the
   ≤24-box hero budget is a verify-time check (dev/verify-model-grammar.mjs), not a runtime
   truncation, so a rare over-budget recipe still renders (just heavier), never disappears. */
const CHANNEL_TINT_FALLBACK = {
  default: null,        // null = "use the caller's own base tint" (pc/ally/foe kind color)
  none: null,
  leather: 0x6b5744,
  armor: 0x8a8a92,
  plate: 0xb9bcc4,
  fire: 0xd97a34,
  radiant: 0xe8d9a0,
  frost: 0x9fd2e0,
  poison: 0x7a9e4a,
  crystal: 0xb8a8d8,
  fungal: 0x8fae6e,
  web: 0xd8d2c0,
  "shadow-dark": 0x2a2430,
  "skin-green-grey": 0x7a8a6e,
  // G5 ROUND-1 (ruling 1) — the natural-identity palette family (build/gen-model-recipes.py's
  // PALETTE_BY_TYPE/PALETTE_NAME_RULES resolve to these SAME slot names). Every value deliberately
  // desaturated/muted (docs/BATTLE-THEATER.md §0's Vagrant Story mood — "no candy"), hand-picked to
  // sit in the same low-chroma family the PSX grit pass's own tile/void palette already uses; none of
  // these approach a bright/saturated "toy" hue.
  "flesh-weathered": 0x9a7f68,     // humanoid base skin — a dusty, weathered flesh tone, not pink
  "grave-pallor": 0x8a9088,        // undead base skin — sallow grey-green pallor
  "bone-white": 0xd8cfb8,          // skeleton/skull family — desaturated bone, not bright white
  "sickly-grey-green": 0x6e7a5e,   // zombie/rot family
  "olive-dun": 0x7d7048,           // goblinoid family — olive/dun skin
  "leather-worn": 0x5c4a36,        // worn leather accent (goblinoid gear, humanoid default accent)
  "grey-brown-fur": 0x6b5c4a,      // beast/wolf family fur
  "murky-green": 0x4d5c46,         // ooze/monstrosity family
  "dark-red-black": 0x3a2224,      // fiend/aberration family
  "pale-blue-grey": 0x8a94a0,      // celestial/ghost/spectral family
  "radiant-dim": 0xb8ab84,         // celestial accent — a muted gold-ivory, not a bright glow
  "moss-dim": 0x5e6b4a,            // fey/plant family
  "stone-grey": 0x7a7972,          // construct/elemental/giant family
  "ash-grey": 0x6e6a62              // elemental accent
};
/* G5 ROUND-1 (ruling 1): `kind` gates whether natural per-creature channels (skin/accent) are allowed
   to override the caller's flat kind tint. "PC gold / ally blue KEEP their figure tints (player-side
   clarity beats naturalism there — unchanged)" — so a pc/ally figure (kind !== "foe") skips skin/
   accent channel resolution entirely, staying the flat gold/blue flatTints baseline exactly like
   before this ruling, even if it happens to resolve through a bestiary recipe (a companion/sidekick
   ally with its own statId->recipeSlug). armor/glow/weapon channels are UNCHANGED by this gate (a
   pc/ally still shows leather/plate/fire-glow material reads from its own equipment/conditions — only
   the natural SKIN/ACCENT identity read is what "keep the side tint" is about); `kind` defaulting to
   undefined (a caller that doesn't pass it, e.g. a narrow test harness) is treated as "not foe" — the
   SAFER default (never accidentally paints a figure a wrong natural color when the caller's intent is
   ambiguous; the pre-ruling flat-tint baseline is always a safe fallback). */
const NATURAL_CHANNEL_KEYS = { skin: 1, accent: 1 };
function recipeChannelTints(channels, baseTint, kind){
  const tints = flatTints(baseTint);
  const isFoe = kind === "foe";
  Object.keys(channels || {}).forEach(function(ch){
    if(!isFoe && NATURAL_CHANNEL_KEYS[ch]) return; // pc/ally: skip natural skin/accent, keep side tint
    const val = channels[ch];
    const resolved = (val != null && Object.prototype.hasOwnProperty.call(CHANNEL_TINT_FALLBACK, val))
      ? CHANNEL_TINT_FALLBACK[val] : null;
    if(resolved != null) tints[ch] = resolved;
  });
  return tints;
}

/* G5 ROUND-1 (ruling 3): the inverse of WEAPON_PART_KEY — a recipe module names a PART (e.g.
   "sword-slab"), not a weapon-shape key ("sword"), so buildFigureFromRecipe needs this reverse lookup
   to find the matching WEAPON_CANT delta for a mainHand/offHand module. Built once at module-load time
   off the existing WEAPON_PART_KEY table (single source, no second hand-typed map to drift). */
const WEAPON_PART_TO_CANT_KEY = Object.keys(WEAPON_PART_KEY).reduce(function(acc, k){
  acc[WEAPON_PART_KEY[k]] = k; return acc;
}, {});

/* G5 ROUND-1 (ruling 4): opacity ~0.45 (Adam's own "is there opacity? yes, wire it") for any recipe
   carrying `translucent:true` (ghost/spectre/wraith/spirit/phantom/shadow-keyword creatures, per the
   generator's translucent_for) — depthWrite off (via addBox's own opacity<1 branch) is the standard
   correct-sort-order trick for a translucent object so it doesn't z-fight/occlude wrongly against
   itself or other transparent figures. */
const TRANSLUCENT_OPACITY = 0.45;
// SHAPE-WAVE UNIT 5 (L20): an ooze reads more opaque than a ghost — a wet translucent blob you half-see
// INTO (~0.75-0.8), not a see-through spectre (~0.45). Paired with the glossy (Phong specular) sheen.
const OOZE_OPACITY = 0.78;

/* G5 ROUND-2 (finding 1, the floor-weapon bug): base bodies in the BIPED family (torso-biped /
   torso-biped-huge) export `.legParams(side)` / `.armParams(side)` factories that the LEGACY
   archetype-builder path (buildBiped/buildGiant, above) always calls to draw real leg-tapered/
   arm-tapered limbs — but build/gen-model-recipes.py's derivation rules (§4) never emit a
   leg-tapered or arm-tapered MODULE, so every recipe-driven figure (buildFigureFromRecipe, the
   G2 path every fixture-6 foe + the PC's own pcRecipe actually render through) was a bare torso
   core plus small accessory modules (weapon/head/armor) — NO limbs at all. torsoBiped.anchors.
   mainHand (y=0.2 local) was tuned against the LEGACY path's real forearm (arm-tapered's own
   segment math bottoms out at y~0.14, so y=0.2 sits at the grip, ~30 comments up) — with no
   forearm actually drawn in the recipe path, that same anchor is just a bare point in space well
   BELOW the torso's own pelvis box (pelvis sits at local y~0.62, mainHand at y~0.2), which is
   exactly why a recipe-driven figure's weapon read as lying on the floor beside it rather than
   gripped: there was no arm there to read it as "held," and the figure's own silhouette had
   nothing between the pelvis and the ground either. Fix: render the SAME leg-tapered x2 +
   mainHand/offHand-side arm-tapered geometry the legacy path already draws for these two base
   bodies, so a recipe figure is a COMPLETE silhouette (matching the legacy figure's own limb
   grammar) and the mainHand/offHand anchors seat against a real forearm again, on both paths.
   Every other base (torso-quad/blob-mass/thorax-abdomen/serpent-coil/swarm-scatter/horror-mass)
   is unaffected — none of them carry a mainHand-anchored weapon module in the generated corpus
   today (theater-parts.js's own quad/thorax/blob/serpent/swarm anchors are all "best-effort,
   no true hand" per their own header comments), so this fix is scoped to the family that actually
   has the bug (§9 Decision 6 discipline: fix the real cause, don't touch what isn't broken). */
const BIPED_LIMB_ARM_PARAMS = {
  "torso-biped": function(side){ return { side, tiltZ: side < 0 ? 0.16 : -0.16 }; },
  // UNIT 2: torso-tapered reuses torso-biped's frame verbatim (same shoulder line/anchors) — so it is
  // biped-family for limb-drawing; a martial-humanoid recipe on the V-taper body still grows real
  // arms + legs (else it'd be the "legless plank" bug in a new coat). Same params as torso-biped.
  "torso-tapered": function(side){ return { side, tiltZ: side < 0 ? 0.16 : -0.16 }; },
  "torso-biped-huge": function(side){ return Parts.torsoBipedHuge.armParams(side); }
};
const BIPED_LIMB_LEG_PARAMS = {
  "torso-biped": function(side){ return Parts.torsoBiped.legParams(side, 0, 0.05); },
  "torso-tapered": function(side){ return Parts.torsoBiped.legParams(side, 0, 0.05); },  // UNIT 2 — same frame
  "torso-biped-huge": function(side){ return Parts.torsoBipedHuge.legParams(side); }
};

/* FRAME RETARGET (2026-07-03, director item 5 — the "legless plank" quadruped bug): the recipe path
   (buildFigureFromRecipe) only ever drew legs for the BIPED family (BIPED_LIMB_LEG_PARAMS above) —
   there was no leg-drawing at all for a `torso-quad` base, so every quadruped RECIPE figure (a wolf/
   worg/beast with a real statId -> recipe) rendered as its bare body slab with no legs: the "wolf =
   floating slab" Adam saw. The legacy buildQuadruped path DOES draw 4 legs inline; this table is the
   recipe-path equivalent, the SAME four leg-tapered param sets buildQuadruped uses (front pair splays
   on X, rear haunch pair cants on Z — see theater-parts.js's legTapered params doc). A structural
   attach fix, scoped to the base that actually lacked legs; every other base is unchanged. */
// SHAPE-WAVE UNIT 2 + reference #12: legs are now lofts with a joint loop; REAR legs carry a `hock`
// (the animal Z-bend at the hock — front legs stay straight, four identical posts is the failure mode).
// NOTE the x convention: torso-quad's HEAD is at +x (the snout), so x=0.26 (rear pair, toward the +x
// end) actually sits under the CHEST/FRONT and x=-0.34 under the HAUNCH/REAR — the leg-set naming
// below follows the BODY end each pair sits under (rear = the haunch end = -x). The rear pair gets the
// hock; both pairs keep their paw wedge (foot defaults true — a beast's paws read).
const QUAD_LIMB_LEG_SETS = {
  "torso-quad": [
    { baseW: 0.085, segLen: 0.16, x: 0.28, z: -0.13, yStart: 0.02, tiltX: 0.05 },              // front-left (under chest, +x)
    { baseW: 0.085, segLen: 0.16, x: 0.28, z: 0.13, yStart: 0.02, tiltX: -0.05 },              // front-right
    { baseW: 0.1, segLen: 0.19, x: -0.32, z: -0.14, yStart: 0.02, tiltZ: 0.12, hock: -0.06 },  // rear-left, haunch + hock bend
    { baseW: 0.1, segLen: 0.19, x: -0.32, z: 0.14, yStart: 0.02, tiltZ: -0.12, hock: -0.06 }   // rear-right, haunch + hock bend
  ]
};

function buildFigureFromRecipe(recipe, tint, kind){
  const g = new THREE.Group();
  if(!recipe) return g;
  const baseKey = (recipe.base && Parts.PARTS[recipe.base]) ? recipe.base : "torso-biped";
  const baseFn = Parts.PARTS[baseKey];
  const anchors = baseFn.anchors || {};
  // UNIT 0 (L16, THE ORIENTATION LAW): turn the whole figure to the shared stage-facing convention
  // BEFORE any part composes into it — a long-axis body (quad/spider/serpent) presents a broadside
  // profile to the camera the way a biped presents its front. Set on the group's own rotation.y so a
  // later rotation.z (down/prone, in setUnits/applyConditionMods) composes independently under THREE's
  // Euler XYZ order; wings/modules attached at anchors turn WITH the body (fixing the "wings inherit
  // the wrong axis" half of the ruling for free, since they're children of this same group).
  g.rotation.y = orientYawForBase(baseKey);
  const tints = recipeChannelTints(recipe.channels, tint, kind);
  // SHAPE-WAVE UNIT 5 (L20): the material-variant vocabulary. `recipe.material` is a list that may
  // contain "translucent" (opacity + depthWrite off) and/or "glossy" (a wet specular sheen via a
  // Phong material). `recipe.translucent:true` (the pre-U5 ghost flag) still maps to translucent, so
  // the specter's existing read joins this one code path. An ooze = translucent + glossy (a wet blob);
  // a ghost = translucent only. Both `opacity` and `glossy` thread down through renderPartInto/addBox
  // to figureMaterialFor exactly like opacity already did (headless degrade unchanged — figureMaterialFor
  // guards the Phong path too).
  const materials = recipe.material || (recipe.translucent ? ["translucent"] : []);
  const wantsTranslucent = materials.indexOf("translucent") >= 0 || !!recipe.translucent;
  const glossy = materials.indexOf("glossy") >= 0;
  // an ooze reads MORE opaque than a ghost (a wet blob you can half-see-into, ~0.75; a ghost ~0.45).
  const opacity = wantsTranslucent ? (glossy ? OOZE_OPACITY : TRANSLUCENT_OPACITY) : undefined;

  // G5 ROUND-1 (ruling 5): stance + headScale ride into the base body's own params — torsoBiped is
  // the only §1 body that currently reads them (goblinoid hunch/zombie slouch/rogue crouch are all
  // biped-shaped bestiary rows; a non-biped base silently ignores unknown params, same total-function
  // discipline every part function already has — ARCHETYPE_TO_BASE never maps a goblin/zombie/rogue
  // row to anything but torso-biped today, so this is not a narrower guarantee than the data provides).
  // UNIT 3 (L3): family proportion scalars, applied AT ASSEMBLY. headScale/torsoScale ride into the
  // base body's params; handScale/legScale multiply into the arm/leg params below. A scalar absent =>
  // 1.0 (unchanged). This is the same seam the CR imposing scalar was always meant to use (bulk stays
  // a group-level read via sizeScaleFor's sibling; head/hand/leg/torso are per-part, applied here).
  const sc = recipe.scalars || {};
  const handScale = sc.handScale != null ? sc.handScale : 1;
  const legScale = sc.legScale != null ? sc.legScale : 1;
  const bodyParams = {};
  if(recipe.stance) bodyParams.stance = recipe.stance;
  if(sc.headScale != null) bodyParams.headScale = sc.headScale;
  if(sc.torsoScale != null) bodyParams.torsoScale = sc.torsoScale;
  // SHAPE-WAVE UNIT 3 (L17): a swarm recipe's member kind rides into the swarm body's params so
  // swarmScatter scatters the right mini-creature (rat/winged/crawler). Harmless on any non-swarm base
  // (an unknown param is ignored by every part function, the total-function discipline).
  if(recipe.swarmMember) bodyParams.member = recipe.swarmMember;

  // UNIT 1: the pixel-skin variant key for this whole figure = its recipe slug (or poseSeed) — so a
  // goblin's torso texture is shared by EVERY goblin (one cached canvas per part+channel per species),
  // never per-instance (the cache-explosion the brief warns against). The `kind` is folded in too so a
  // gold PC-side recipe figure and an ember foe-side one of the same slug don't collide (their skin
  // colors differ anyway via recipeChannelTints, but keying them apart keeps the cache honest).
  const vKey = ((recipe.slug || recipe.poseSeed || baseKey) + "|" + (kind || "foe"));

  // the base body itself, at the figure's own local origin (no offset — matches every fixed
  // archetype builder's own convention of drawing its body core at {0,0,0}).
  renderPartInto(g, baseFn, bodyParams, tints, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, opacity, vKey, glossy);

  // G5 ROUND-2 (finding 1 fix): legs + both arms, for biped-family bases only — see this
  // function's own header comment above for why. Legs use torso-biped's plain crouch=0/
  // stanceTilt=0.05 defaults (a recipe figure has no per-figure seededJitter weight-shift the
  // legacy path derives from its own `seed` — a fixed, still-natural default stance) so a
  // recipe figure's legs read as a normal stand, not a copy-pasted mirror of the archetype
  // fallback's own randomized lean.
  const legParamsFor = BIPED_LIMB_LEG_PARAMS[baseKey];
  const armParamsFor = BIPED_LIMB_ARM_PARAMS[baseKey];
  // UNIT 3 (L3): legScale multiplies the leg's own segLen (stumpy goblinoid legs = 0.65x); handScale
  // multiplies the arm's fist (and, gently, its width) so a goblinoid's oversized hands read. Folded
  // into the per-limb param object here so the scalar rides through the SAME leg-tapered/arm-tapered
  // param path the frame uses (no separate transform to drift). A scalar of 1 leaves the base params
  // byte-identical (Object.assign of {} onto the factory's own output).
  const scaleLeg = (p) => (legScale !== 1 ? Object.assign({}, p, { segLen: (p.segLen != null ? p.segLen : 0.26) * legScale }) : p);
  const scaleArm = (p) => (handScale !== 1 ? Object.assign({}, p, { fistScale: 1.3 * handScale }) : p);
  if(legParamsFor){
    renderPartInto(g, Parts.legTapered, scaleLeg(legParamsFor(-1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey, glossy);
    renderPartInto(g, Parts.legTapered, scaleLeg(legParamsFor(1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey, glossy);
  }
  if(armParamsFor){
    renderPartInto(g, Parts.armTapered, scaleArm(armParamsFor(-1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey, glossy);
    renderPartInto(g, Parts.armTapered, scaleArm(armParamsFor(1)), tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey, glossy);
  }
  // FRAME RETARGET (director item 5): quadruped-family bases draw their 4 legs here — the recipe
  // path had NONE before (the "legless plank" wolf). Same leg-tapered sets buildQuadruped draws.
  const quadLegSets = QUAD_LIMB_LEG_SETS[baseKey];
  if(quadLegSets){
    quadLegSets.forEach(function(p){
      renderPartInto(g, Parts.legTapered, p, tints, { x: 0, y: 0, z: 0 }, undefined, opacity, vKey, glossy);
    });
  }

  (recipe.modules || []).forEach(function(m){
    if(!m || !m.part) return;
    const partFn = Parts.PARTS[m.part];
    if(!partFn) return; // unknown part — skip, never throw (§4b's own "unknown -> omitted" discipline,
                          // reapplied here at render time as a defensive second gate)
    // CARRY STATES (L14/L15): a mainHand/offHand module whose part is a KNOWN weapon gets routed through
    // weaponCarryFor, which decides the carry (held-fist / planted / bow-held / back-mount) from the
    // part + a heavy-2H params flag (the generator sets params.heavy on a greatsword/maul name). The
    // carry may RE-ANCHOR the weapon (a back-mount greatsword attaches at `back`, not the hand) and
    // supplies the cant + a small position delta. A non-weapon module (head/armor/wings) keeps its own
    // anchor untouched. This supersedes the pre-L14 flat WEAPON_CANT application: held-fist reproduces
    // that exact cant, and the grip now seats at the FIST CENTER anchor so it intersects the fist box.
    let anchorName = m.anchor;
    let extraRz = 0, dpos = null;
    const isWeaponPart = !!WEAPON_PART_TO_CANT_KEY[m.part] || m.part === "shield-slab";
    if((m.anchor === "mainHand" || m.anchor === "offHand") && WEAPON_PART_TO_CANT_KEY[m.part]){
      const heavy = !!(m.params && m.params.heavy);
      const carry = weaponCarryFor(m.part, { heavy: heavy });
      // off-hand keeps its own hand (a two-weapon off-hand blade stays in the off-fist); only a
      // MAIN-hand weapon can promote to back-mount (a figure back-mounts its primary great-weapon).
      anchorName = (m.anchor === "offHand") ? "offHand" : carry.anchor;
      extraRz = carry.rz;
      dpos = carry.dpos;
    }
    const anchor = anchorName && anchors[anchorName];
    let offset = anchor ? anchor.pos : { x: 0, y: 0, z: 0 };
    let rotOffset = anchor ? anchor.rot : { x: 0, y: 0, z: 0 };
    if(dpos){
      offset = { x: offset.x + (dpos.x || 0), y: offset.y + (dpos.y || 0), z: offset.z + (dpos.z || 0) };
      rotOffset = Object.assign({}, rotOffset, { z: (rotOffset.z || 0) + extraRz });
    }
    renderPartInto(g, partFn, m.params || {}, tints, offset, rotOffset, opacity, vKey, glossy);
  });

  return g;
}

/* recipe lookup: MODEL_RECIPE_OVERRIDES wins by slug (§3, §9 Decision 2), falling through to
   the generated MODEL_RECIPES, falling through to null (no recipe at all — the caller's own
   archetype fallback stays authoritative, §9 Decision 6: "never worse than today"). Both
   globals are classic-script data (data/model-recipe-overrides.js / data/model-recipes.js)
   loaded before this ES module's own <script type="module"> tag executes (module scripts are
   deferred by the HTML spec, so every classic <script> above it has already run) — read
   defensively via typeof so a headless/jsdom harness missing either file degrades to "no
   recipe" instead of a ReferenceError. */
function recipeFor(slug){
  if(!slug) return null;
  if(typeof MODEL_RECIPE_OVERRIDES !== "undefined" && MODEL_RECIPE_OVERRIDES[slug]) return MODEL_RECIPE_OVERRIDES[slug];
  if(typeof MODEL_RECIPES !== "undefined" && MODEL_RECIPES[slug]) return MODEL_RECIPES[slug];
  return null;
}

// P1' gate (§4 step 9): window.Theater.wholeObject accessor (get/set), the exact pixelSkin A/B-
// toggle pattern — default TRUE (shipped-on), flippable at runtime for the capture-gate A/B and as
// a kill switch. Declared here (module scope) so both figureFor/setBoard's read and the public
// accessor at the bottom of this file share the single source of truth.
let WHOLE_OBJECT_ENABLED = true;

// ---- MODEL-PATH INSTRUMENTATION: extracted to src/ui/theater-figure-build.js (split B3, 2026-07-25) ----
// MODEL_PATH_STATS + its two tally helpers moved with figureFor, their only writer. The counter object
// is IMPORTED back here (same live object, not a copy) so window.Theater.stats.modelPaths and
// modelPathReport() below keep publishing the very record figureFor increments.

/* ============================================================================
   SPRITE-TRANSITION T4 (docs/SPRITE-TRANSITION.md) — the theater sprite-billboard channel. Adam's
   2026-07-09 ruling: creatures become 2D sheet-cut sprites (T2 slices them, T3 registers them in
   `data/sprite-registry.js`'s `SPRITE_REGISTRY` global); the three.js stage keeps the trays/props/
   architecture job (untouched by this unit) and gains ONE new figure path — a billboarded plane —
   ahead of the existing whole-object/glb/recipe/cuboid chain. Total-function discipline, same as
   every other figureFor path: a missing registry, an unmatched slug, a pending (not-yet-cut) entry,
   or a failed/not-yet-loaded texture ALL fall through to the existing 3D chain untouched — this
   channel only ever ADDS a resolution, it never blocks one.

   Kill switch: SPRITE_CHANNEL_ENABLED, module-scope, same escape-hatch convention as
   WHOLE_OBJECT_ENABLED just above (window.Theater.spriteChannel accessor at the bottom of this file)
   — default ON, flippable at runtime to force every figure through the 3D chain for an A/B capture.

   Inert until T3 lands: `typeof SPRITE_REGISTRY !== "undefined"` guards every read below, so this
   whole branch is a silent no-op in any tree/harness that hasn't loaded data/sprite-registry.js yet
   (this unit's own dev/verify-theater-sprites.mjs supplies a FIXTURE registry rather than depending
   on T3's branch, per the spec's explicit "do not depend on T3" instruction). */
let SPRITE_CHANNEL_ENABLED = true;

/* VQ2-RESPEC.md Wave S ruling (Adam, 2026-07-15) + DESIGN.md 2026-07-15 — "the one-flag retreat".
   Adam's explicit call: flip the runtime corpus to the faceted candidates now (provisional batch
   admission), keep the v3/legacy corpus untouched as the reserve "in case this direction is a
   failure" — reversible with ONE flag, no data/sprite-registry.js edit required. FACETED_FLIP_ENABLED
   is that flag: true (default, post-gate) lets spriteAssetPathFor prefer a "candidate"-admitted
   entry's candidateAsset; false forces EVERY resolution back to legacyAsset corpus-wide regardless
   of what the registry's runtimeAdmitted field says. The other retreat layer lives in the generator
   (build/gen-sprite-registry.py's --admit-faceted flag — omit it and the registry itself regenerates
   all-"legacy"); this flag is the render-time half, for an instant revert with no regen. */
const FACETED_FLIP_ENABLED = true;

// VQ2-RESPEC.md S5 — resolves the ACTUAL asset path a sprite-registry entry should render with.
// candidateAsset wins only when the flip is on AND the registry itself admits this entry as
// "candidate" AND a candidateAsset path is actually present (three independent gates — any one of
// them false is enough to fall back). legacyAsset is next; the bare literal is the final fallback
// for a registry-less caller or an entry with neither field (byte-identical to the pre-S3 convention).
function spriteAssetPathFor(entry){
  if(!entry) return null;
  if(FACETED_FLIP_ENABLED && entry.runtimeAdmitted === "candidate" && entry.candidateAsset){
    return entry.candidateAsset;
  }
  return entry.legacyAsset || ("assets/sprites/" + entry.slug + ".png");
}

// VQ2-RESPEC.md §3 unit L2 — read-only census helper, mirroring spriteAssetPathFor's OWN gate exactly
// (same three conditions, same order) so the recorded outcome always names whichever corpus the
// figure ACTUALLY resolved against, never a re-derived guess that could drift from the real path.
function _spriteCensusOutcome(entry){
  return (FACETED_FLIP_ENABLED && entry && entry.runtimeAdmitted === "candidate" && entry.candidateAsset)
    ? "sprite-faceted" : "sprite-legacy";
}
// VQ2-RESPEC.md §3 unit L2 — the SAME "interior"|"tabletop"|null vocabulary figureFor's own
// _censusSceneKind local uses (derived there from the interiorMode PARAM, not S.lastBoard, since
// figureFor can be called via refFigure.build with no board mounted at all) — this helper covers
// every OTHER seam call site that only has S.lastBoard to go on (spriteTextureFor/dressingTextureFor
// fire from an async texture-load callback, well outside any single figureFor call's scope), so a
// play-lens census read never has to reconcile two different scene-kind spellings for the same
// literal board ("interior3d" here vs "interior" there).
function _censusBoardSceneKind(){
  if(!S.lastBoard) return null;
  return S.lastBoard.kind === "interior3d" ? "interior" : "tabletop";
}

// ---- THE SPRITE / BILLBOARD FAMILY: extracted to src/ui/theater-sprites.js (split B7, 2026-07-25)
// ---- The slug-keyed texture cache + its resolved-path side table (SPRITE_TEXTURE_CACHE /
// SPRITE_TEXTURE_SRC — still published on window.Theater._spriteTextureCache /
// _spriteTextureSrcCache below as the SAME live objects, via imported bindings), the SRD size ladder,
// the async loader (spriteSrgbTaggingOn/spriteTextureFor), the standee side shell, the one billboard
// mesh constructor with its STANDEE-WINS-TIES depth-bias shader injection (moved BYTE-IDENTICALLY —
// SPRITE_DEPTH_BIAS_UNITS moved WITH it so no accessor could touch the injection closure), and the
// two sizing wrappers (buildSpriteBillboard / interiorSpriteBillboard) live in their own module now.
// It never imports this root: spritesInit(ctx) at end-of-body hands it the capabilities that stay
// here — and, as ACCESSORS never mirrors, the two live root `let`s the facade/board setters write,
// SPRITE_UNLIT_DEBUG and ITR_SPRITE_EMISSIVE_TINT.
//
// STAYING HERE, DELIBERATELY (censused): FACETED_FLIP_ENABLED (its literal is rewritten in THIS
// file's source text by dev/verify-l2-census.mjs and dev/battle-gate/capture-s5-flip-card.mjs),
// spriteAssetPathFor (reads that literal directly, and _spriteCensusOutcome below exists to MIRROR
// its gate — splitting the pair would have put one half behind an accessor and the other on the bare
// literal), and the registry JOIN (spriteEntryFor + normalizeSpriteKey + the TIER-2 fallback
// counters), whose bodies two RED-FIRST harnesses MUTATE inside this file's own source text
// (dev/verify-theater-sprites.mjs, dev/verify-sprite-join.mjs) and which no moved body calls.

// ---- split B8: the DRESSING texture cache (DRESSING_TEXTURE_CACHE) moved to
// src/ui/theater-dressing.js beside dressingTextureFor, the only thing that reads or writes it. ----

// join-key normalizer (docs/SPRITE-TRANSITION.md's own kebab discipline, loosened further for a
// forgiving join): lowercase, strip everything but [a-z0-9] so "Grinning Poppet" and a bestiary
// recipeSlug of "grinning-poppet" (or "grinningPoppet") normalize to the same key.
function normalizeSpriteKey(s){
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// VQ2-RESPEC.md S4 (ledger P0 #1, "Giant Rat renders as a robed humanoid") — a dev-visible tally
// of how often spriteEntryFor had to fall back to the normalized-name scan below because the
// bestiary-id map (SPRITE_BY_BESTIARY_ID) didn't resolve recipeSlug directly. Exposed read-only
// via window.Theater._spriteJoinNameFallbackCountForTest (bottom of this file) — a harness/console
// can watch this climb to confirm the id-map tier is actually doing the work it claims, not just
// silently present.
let SPRITE_JOIN_NAME_FALLBACK_COUNT = 0;
// CR-1 item 4 (2026-07-15 adversarial review): the TIER 2 console.warn below used to fire on
// EVERY fallback hit — a hot path for any creature whose id-map lookup misses, flooding the
// console across a normal session once a handful of slugs are missing an id-map entry. De-duped
// to once per distinct recipeSlug per session via this Set; SPRITE_JOIN_NAME_FALLBACK_COUNT
// itself is NOT de-duped — it still increments on every TIER 2 hit (a harness reads the raw
// tally), only the console.warn call is suppressed on repeat hits for an already-warned slug.
const SPRITE_JOIN_NAME_FALLBACK_WARNED = new Set();

/* T4.1 resolution, extended by S4: recipeSlug is already "the exact bestiary id" (wholeObjectKeyFor's
   own header comment, and src/engine/theater-data.js's own `f.modelKey || f.statId` header comment on
   theaterUnitsFrom). TWO tiers, id map first:

   TIER 1 — SPRITE_BY_BESTIARY_ID[recipeSlug] (build/gen-sprite-registry.py's S4 Part A: a
   deterministic index built at GENERATION time from the SAME realm-bestiary join the generator
   already performs — every cut entry's own bestiary-joined `frame` field, keyed by that id). An
   id is an EXACT key, never normalized — "Giant Rat" the display name and "giant-rat" the bestiary
   id can collide under normalizeSpriteKey (both -> "giantrat"), and two DIFFERENT bestiary ids can
   collide too (e.g. an overlay relabel divorces a slug's display name from its own bestiary id while
   another creature's real name matches the ORIGINAL name) — the id map sidesteps the whole class:
   one id, one slug, no ambiguity. A slug the map points at that isn't (yet) `status:"cut"` or is
   `verdict:"fail"` falls through to TIER 2 exactly like a plain miss, never a broken lookup —
   EXCEPT a fail entry carrying prototypeAdmitted:true (the 2026-07-22 prototype admission,
   dev/model-qa/prototype-admissions.json folded by build/gen-sprite-registry.py): Adam's fail
   ruling stands in the overlay/review queue, but the art renders until the focused full sprite
   review re-rules it (delete that file + regen to restore strict gating).

   TIER 2 — the pre-S4 normalized-name linear scan (unchanged): join recipeSlug against
   SPRITE_REGISTRY's `name` field per the spec's shared-data-shapes section ("cell name <->
   realm-bestiary-draft.json creature name within the same realm"). Only a `status:"cut"` entry ever
   resolves here: a same-name entry that is still `status:"pending"` (not yet sliced) is a real miss
   for THIS function — it returns null and the caller falls through to the existing 3D chain
   untouched, exactly like a whole-object key that doesn't resolve. Every time THIS tier is the one
   that resolves the sprite (the id map missed or wasn't consulted for a real hit), the fallback
   counter above increments and a one-line console.warn tags the mismatch (dev-visible only — no
   user-facing surface) so a `--admit-faceted`-style regen sweep or Adam's own console can see how
   often the weaker join tier is still load-bearing. (The spec's fuller realm/type/size fallback tier
   is NOT implemented in this unit — see the T4 deviation note in the unit's own handoff; the
   exact-name/cut-only tier above is the one every RED-FIRST acceptance check in this unit's spec
   actually exercises.) Never resolved via the `frame` field at render time — `frame` is consumed
   ONLY by the generator, at build time, to construct the id map itself. */
function spriteEntryFor(recipeSlug){
  if(!recipeSlug || typeof SPRITE_REGISTRY === "undefined" || !SPRITE_REGISTRY) return null;

  // TIER 0 — an exact stable sprite id. Production encounter data usually arrives by bestiary id,
  // but retained acceptance fixtures and authoring tools already own the canonical `spr-*` key.
  // Letting that key round-trip directly avoids inventing a fake bestiary alias for a PC or animal.
  const directEntry = SPRITE_REGISTRY[recipeSlug];
  if(directEntry && directEntry.status === "cut"
    && (directEntry.verdict !== "fail" || directEntry.prototypeAdmitted === true)){
    return Object.assign({ slug: recipeSlug }, directEntry);
  }

  // TIER 1 — the deterministic bestiary-id map, exact match, no normalization.
  if(typeof SPRITE_BY_BESTIARY_ID !== "undefined" && SPRITE_BY_BESTIARY_ID){
    const idSlug = SPRITE_BY_BESTIARY_ID[recipeSlug];
    if(idSlug){
      const idEntry = SPRITE_REGISTRY[idSlug];
      if(idEntry && idEntry.status === "cut"
         && (idEntry.verdict !== "fail" || idEntry.prototypeAdmitted === true)){
        return Object.assign({ slug: idSlug }, idEntry);
      }
      // id-mapped slug isn't (yet) render-eligible — falls through to TIER 2 as a real miss,
      // same discipline as every other resolution tier in this file.
    }
  }

  // TIER 2 — the pre-S4 normalized-name linear scan (fallback, logged).
  const wantKey = normalizeSpriteKey(recipeSlug);
  if(!wantKey) return null;
  for(const regKey in SPRITE_REGISTRY){
    const e = SPRITE_REGISTRY[regKey];
    if(!e || !e.name || e.status !== "cut") continue;
    if(e.verdict === "fail" && e.prototypeAdmitted !== true) continue; // review-failed art never renders (unless prototype-admitted) — falls through to the 3D chain
    if(normalizeSpriteKey(e.name) === wantKey){
      SPRITE_JOIN_NAME_FALLBACK_COUNT++;
      // CR-1 item 4 — warn once per distinct recipeSlug per session; the counter above still
      // climbs on every hit regardless.
      if(!SPRITE_JOIN_NAME_FALLBACK_WARNED.has(recipeSlug)){
        SPRITE_JOIN_NAME_FALLBACK_WARNED.add(recipeSlug);
        if(typeof console !== "undefined" && console.warn){
          console.warn("[sprite-join] name-join fallback: recipeSlug '" + recipeSlug + "' -> '" + regKey
            + "' (no SPRITE_BY_BESTIARY_ID hit; fallback count=" + SPRITE_JOIN_NAME_FALLBACK_COUNT + ")");
        }
      }
      return Object.assign({ slug: regKey }, e);
    }
  }
  return null; // no cut entry by that name — a pending-only match (or no match at all) falls through
}

// ---- split B7: the SPRITE-SIZE LADDER + spriteSizeScaleFor moved to src/ui/theater-sprites.js
// (buildSpriteBillboard is their only reader). ----

// ---- split B7: spriteTextureFor + the CL-R1 colour-space flag moved to src/ui/theater-sprites.js. ----

// BW2-4b item 1 — LIT SPRITES debug seam: forces the OLD unlit MeshBasic path so the iterate-loop
// measurement harness can capture a full-bright REFERENCE frame (the 1.0 the BRIGHTNESS LAW measures
// every lit sprite as a ratio of) from the identical scene. No product caller sets it — toggled only
// by window.Theater.__setSpriteUnlitDebug (below), and a re-mount rebuilds sprites under the new flag.
let SPRITE_UNLIT_DEBUG = false;
// ---- split B7: SPRITE_DEPTH_BIAS_UNITS + SPRITE_DEPTH_BIAS_MATERIALS moved to
// src/ui/theater-sprites.js (SHADER-KEY LAW — the injection closure that reads the units had to move
// byte-identically). The facade seam below writes/reads them through that module's accessors, and
// prunes the SAME array object through its imported binding. ----
// BW2-4b item 1 — REALM GRADE on the sprite floor: the emissive readability floor is tinted toward the
// current interior realm's grade (chrome cool, fantasy warm, gloom cold-violet) so a lit standee reads
// the realm even where no nearby torch reaches it (the mock's cool soldiers / warm knights). White (no
// tint) on the flat tabletop and any realm with no authored grade. setInteriorBoard sets it per board;
// setBoard resets it to white. A SUBTLE blend (ITR_SPRITE_TINT_STRENGTH) — never a saturated wash.
let ITR_SPRITE_EMISSIVE_TINT = 0xffffff;
const ITR_SPRITE_TINT_STRENGTH = 0.15;
// ---- split B7: the standee side shell + buildSpriteBillboardMesh + buildSpriteBillboard moved to
// src/ui/theater-sprites.js. ----

// ---- split B7: interiorSpriteBillboard (the VP1 TRUE-SCALE wrapper) moved to
// src/ui/theater-sprites.js. ----

// ---- FIGURE RESOLUTION: extracted to src/ui/theater-figure-build.js (split B3, 2026-07-25) ----
// figureFor (the sprite -> whole-object/glb -> pcRecipe -> bestiary-recipe -> archetype-cuboid
// precedence chain) and the legacy weaponMeshFor composer live in their own module now. It never
// imports this root: figureBuildInit(ctx) at end-of-body hands it the composition capabilities that
// stay here (renderPartInto/flatTints/ARCHETYPE_BUILDERS/buildFigureFromRecipe/recipeFor/
// orientYawForArchetype/WEAPON_PART_KEY/weaponCarryFor), the sprite-channel seams
// (spriteEntryFor/buildSpriteBillboard/interiorSpriteBillboard/_spriteCensusOutcome), and — as
// ACCESSORS, never mirrors — the two live A/B flags the facade's setters write,
// SPRITE_CHANNEL_ENABLED and WHOLE_OBJECT_ENABLED.

/* ============================================================================
   MODEL-GRAMMAR G3 §2 — CONDITIONS AS MODULES, the render half. theaterConditionModsFrom
   (theater-data.js) hands back a pure array of {kind:"rotation",...} / {kind:"attach",...}
   descriptors; this function is the ONE place that turns those into actual THREE side effects,
   mirroring buildFigureFromRecipe's own "data in, boxes out" discipline — a condition mod is just
   one more small attach-at-anchor step, reusing renderPartInto exactly like a recipe module does
   (no new composition machinery). Applies to PC/ally figures AND foes alike (both carry
   conditionMods off theaterUnitsFrom) since the derivation itself doesn't discriminate by kind.
   `anchors` is the figure's OWN base body's anchor set when known (pcRecipe/bestiary-recipe
   figures always resolve one via Parts.PARTS[base].anchors) — for the fixed archetype-builder
   fallback (no recipe at all) this falls back to Parts.torsoBiped.anchors, the modal body every
   archetype's own weapon/shield placement already assumes (weaponMeshFor's own {0.42,0.5,0.04}
   literal below is torso-biped's mainHand anchor by construction), so an attach mod still lands
   somewhere sane even on a non-recipe figure. Rotation mods are applied to the GROUP itself
   (figure.rotation), same as the existing `u.down` 90°-topple convention — a figure can carry
   BOTH (prone rotation + a separately-tracked down pose) since they're independent signals; this
   function only ever touches rotation.z additively via the mod's own angle, never resetting an
   axis another mod/the down-flag already set. */
function applyConditionMods(figure, mods, anchors, tint){
  if(!mods || !mods.length) return;
  const tints = flatTints(tint);
  mods.forEach(function(m){
    if(!m || !m.kind) return;
    if(m.kind === "rotation"){
      const axis = m.axis || "z";
      figure.rotation[axis] = (figure.rotation[axis] || 0) + (m.angle || 0);
    } else if(m.kind === "attach"){
      const partFn = m.part && Parts.PARTS[m.part];
      if(!partFn) return; // unknown part name — never throw, same total-function discipline as buildFigureFromRecipe
      const a = m.anchor && anchors && anchors[m.anchor];
      const offset = a ? a.pos : { x: 0, y: 0, z: 0 };
      const rotOffset = a ? a.rot : { x: 0, y: 0, z: 0 };
      renderPartInto(figure, partFn, {}, tints, offset, rotOffset);
    }
  });
}

function unitTint(kind){
  if(kind === "pc") return 0xc9a24b;      // gold ring lineage — the PC's distinct silhouette (§3)
  if(kind === "ally") return 0x6fa8c9;
  return 0xc94a2e;                        // G9 tune 3: readable ember/oxblood — the old 0x9c5040 sat too
                                           // close in luminance/desaturation to the (now-lifted) dungeon
                                           // tile tops and got lost against the floor; this is far more
                                           // saturated than any palette tile color, so it separates on
                                           // saturation even where luminance ranges overlap
}

// CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "a little bit bolder of a read on the gold rim") — the pc
// disc gets its OWN brighter/more-saturated gold, one clear step up from unitTint's 0xc9a24b (higher
// value + saturation: a richer, more lit-metal gold), independent of unitTint itself. This is a
// RIM-INTENSITY change only (R5's own pre-registered fallback: "the fix is a rim-intensity bump on
// the pc disc, never figure tinting") — unitTint(kind) still feeds figureFor's body-tint path
// unchanged for every kind, including pc, so no figure geometry anywhere shifts color from this.
const PC_DISC_GOLD = 0xe6bb52;
/* G5 ROUND-1 (ruling 2): the base disc's own tint — SAME hex family as unitTint (ember foe / gold PC /
   blue ally) for ally/foe, kept as a separate function (not a direct unitTint() reuse) because the disc
   reads at a different opacity/material than a figure's body boxes (a flat MeshBasicMaterial disc,
   unlit, vs. the figure's MeshLambertMaterial boxes) — the color values matching (for ally/foe) is what
   makes this the SAME signal moved to a new location, not a coincidence two functions happen to agree
   on hex values today. pc is the one deliberate divergence (PC_DISC_GOLD, above). Small per-kind cache
   (3 possible kinds) so setUnits doesn't allocate a fresh material per unit per call. */
const BASE_DISC_MAT_CACHE = {};
function baseDiscMatFor(kind){
  const key = kind || "foe";
  if(!BASE_DISC_MAT_CACHE[key]){
    BASE_DISC_MAT_CACHE[key] = new THREE.MeshBasicMaterial({
      color: key === "pc" ? PC_DISC_GOLD : unitTint(kind), transparent: true, opacity: BASE_DISC_OPACITY, depthWrite: false
    });
  }
  return BASE_DISC_MAT_CACHE[key];
}

/* GROUNDING SHADOWS (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03: "incredibly basic shadows to
   help the eye determine the exact location of things"). A flat, dark, near-opaque quad at ground
   contact — position-grounding, orthogonal to the faction/hostility disc above (G5 ROUND-1's colored
   base disc, unchanged): the blob answers "where exactly does this thing touch the floor," the disc
   answers "whose side is it on." Both coexist per-figure (blob slightly LARGER + darker, seated
   slightly BENEATH the disc — see setUnits' draw order/Y offsets below) and props get one too (they
   never had any grounding mark before this unit — the PSX-clean "no shadow maps, blob quads only" rule
   from §2 was always meant to cover every standing thing on the board, not just units).
   ONE shared near-black material (no per-kind tint — a grounding shadow reads the same color under a
   gold PC or an ember foe, only the disc above it carries the hostility tint) + a small per-scale
   geometry cache, same caching discipline as baseDiscGeoFor in setUnits. */
const GROUNDING_BLOB_MAT = new THREE.MeshBasicMaterial({
  color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false
});
const GROUNDING_BLOB_GEO_CACHE = {};
function groundingBlobGeoFor(radius){
  const key = radius.toFixed(3);
  if(!GROUNDING_BLOB_GEO_CACHE[key]) GROUNDING_BLOB_GEO_CACHE[key] = new THREE.CircleGeometry(radius, 16);
  return GROUNDING_BLOB_GEO_CACHE[key];
}
/* builds + positions one grounding blob quad at (x,z), seated at `y` (below whatever hostility disc or
   figure sits above it — callers pass a slightly lower y than their own disc/base so the blob reads as
   UNDER it, never fighting it for the same plane / z-fighting flicker). `radius` is the blob's own
   size — callers pass something a hair larger than their disc/footprint radius (§3: "blob slightly
   larger, darker, beneath the disc"). Returns the mesh so the caller can add it to whichever group it
   tracks (S.shadowGroup for units, S.propGroup for props — see call sites below). */
function addGroundingBlob(group, x, z, y, radius){
  if(!group) return null;
  const mesh = new THREE.Mesh(groundingBlobGeoFor(radius), GROUNDING_BLOB_MAT);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

// BW2-2 EXPANDED — THE FLOOR CONTACT LAW (Adam's live-play bug report: "that wolf man was halfway in
// the floor"; the orchestrator's beauty-shot evidence, dev/battle-gate/beauty-shot/vp8-loop-02-hurt.png,
// named a burial CLASS — bottom-center waist-deep, right-edge buried to the HEAD, small creatures
// knee-deep, depth varying by creature).
//
// MECHANISM (verified against a real mounted scene, dev/verify-bw2-2-floor-contact.mjs): every interior
// floor tile is an InstancedMesh box whose BOTTOM is pinned to the shared y=-0.5 plane and whose TOP
// grows UPWARD by the tile's own authored thickness `sy` (interiorBuildInstancedMesh's own position
// math, ~700 lines up: position.y = sy/2-0.5, so a box spanning [-0.5, -0.5+sy] puts the TOP at
// sy-0.5 — never at -0.5 itself). theater-interior.js bakes sy per floor cell at ITR_FLOOR_HEIGHT=0.2
// nominal, then VP3's micro-step channel jitters 5-15% of a room's eligible cells by +/-0.04..0.08 —
// so the REAL floor surface sits between y=-0.38 and y=-0.22 (nominal -0.3), never at the hardcoded
// y=-0.5 every piece/unit mount assumed pre-BW2-2. That fixed assumption IS the burial: a standee's
// feet planted at -0.5 sink `sy` world units (0.12-0.28, nominal 0.2) below the tile it's standing on —
// a FIXED ABSOLUTE gap that reads as anywhere from an ankle-dip (on a ~2-unit-tall creature) to fully
// underground (on a ~0.2-0.3-unit-tall creature), exactly the "varying depth by creature" the
// orchestrator's evidence named. Dressing's OLD hardcoded y=-0.4 (its own comment falsely claimed
// parity with pieces' -0.5 convention — it was actually 0.1 units HIGHER, and still 0.1 below the true
// nominal top) split the difference by accident, which is why dressing "looked right" while pieces
// visibly sank — same bug, smaller symptom.
//
// THE LAW: floor top at any (x,z) cell is DERIVED, never hand-tuned — read straight off that cell's own
// floor instance (`sy`), through the EXACT SAME formula the GL layer already uses to place the tile
// (top = sy - 0.5). setInteriorBoard builds one lookup (interiorFloorTopMapFrom) off data.instances.floor
// the moment a board mounts, cached on S.interiorFloorTopMap so setUnits (a later, separate call against
// the same mounted board) can reuse it without rebuilding. Every mount point below — pieces, combat
// units, dressing, decals, contact pools, standee bases, the acting ring — reads through
// interiorFloorTopAt/interiorStandeeContactY: ONE formula, one source of truth, no more per-caller
// hand-nudged magic numbers.
const ITR_FLOOR_BASE_Y = -0.5;            // the one fixed plane every floor tile's BOTTOM sits on (shared with interiorBuildInstancedMesh's own y=sy/2-0.5 math, GR4's skirt convention, etc.) — NOT the floor TOP; see the law above.
const ITR_FLOOR_HEIGHT_FALLBACK = 0.2;    // mirrors theater-interior.js's ITR_FLOOR_HEIGHT default, used ONLY when a cell carries no instance data (this sealed ES-module scope has no import of that const — see the REALM_MATERIALS window-republish note at this file's top; every real floor cell bakes its own `sy`, so this branch is normally dead).
function interiorFloorTopMapFrom(floorInstances){
  const map = new Map();
  (floorInstances || []).forEach((inst) => {
    if(!inst) return;
    const sy = (typeof inst.sy === "number" && Number.isFinite(inst.sy)) ? inst.sy : ITR_FLOOR_HEIGHT_FALLBACK;
    map.set(Math.round(inst.x) + "," + Math.round(inst.z), ITR_FLOOR_BASE_Y + sy);
  });
  return map;
}
function interiorFloorTopAt(floorTopMap, x, z){
  const fallback = ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK;
  if(!floorTopMap) return fallback;
  const v = floorTopMap.get(Math.round(x || 0) + "," + Math.round(z || 0));
  return (typeof v === "number") ? v : fallback;
}

// ---- THE STANDEE BASE/CONTACT FAMILY: extracted to src/ui/theater-standee-mount.js (split B7,
// 2026-07-25) ---- CL-R2's visible support (INTERIOR_BASE_*/interiorTacticalSpanFor/
// interiorStandeeSupportMetrics/interiorBaseGeoFor/interiorBaseMaterialsFor/buildInteriorBase),
// BW2-2's contact line (interiorStandeeContactY), BW2-2b's turn glow (BASE_GLOW_EMISSIVE_HEX/
// setBaseGlow), CL-R2's support-collision resolver (STANDEE_SUPPORT_CLEARANCE/standeeSupport*/
// standeeCollisionSign/mountedStandeeFigures/resolveMountedStandeeSupportCollisions/
// syncStandeeContactBlob) and BW2-2's soft MULTIPLY contact pool (interiorPoolTexture/
// interiorPoolGeoFor/interiorPoolMaterial/INTERIOR_POOL_Y_OFFSET/addInteriorContactBlob) live in
// their own module now. It never imports this root: standeeMountInit(ctx) at end-of-body hands it
// ITR_FLOOR_BASE_Y/ITR_FLOOR_HEIGHT_FALLBACK (verify-d4-doors text pins, unmoved), hashSeed and the
// hexToRGB/rgbToHex/scaleRGB colour helpers. THE KILTER (kilterFor + KILTER_YAW_DEG +
// KILTER_POS_FRAC, another verify-d4-doors text pin) stays HERE, in place, between setBaseGlow's old
// position and the collision family's — the split stepped around it. addWallContactAO stays HERE too
// (dressing/wall-prop-owned by its one caller, interiorBuildWallProps) and reaches
// interiorPoolGeoFor/interiorPoolMaterial as imported bindings, so it shares the SAME geometry cache
// and the SAME single material instance it always did.

// BW2-2b item 4 — THE KILTER (Adam's taste ruling: "a figurine placed on that particular 5x5 tile" —
// minis should read hand-placed, not machine-snapped dead-center on their cell). kilterFor(seedKey)
// returns a tiny per-standee humanization: yaw jitter +/-4deg (applied to the OUTER group's facing yaw,
// updateSpriteBillboardYaw's face() above — so the WHOLE mini, base included, sits a hair off-true) and
// position jitter <=6% of a cell (cellSize=1 world unit, DUNGEON-GRAPH law 1) applied at mount time to
// the standee's own x/z before it's handed to the contact pool (interiorBuildPieces/setUnits, below) —
// visual only, COMBAT-GRID CELL OWNERSHIP is untouched (callers key occupancy off the true cell, never
// off this render-time offset). Deterministic per-standee identity, never Math.random (determinism
// law) — a cheap FNV-ish string hash, the SAME cadence idle-breathe's own seededPhase (standee-verbs.js)
// already established for "this piece's own stable identity, independent of wall-clock". Ideally keyed
// off walkId+slug (the spec's own words) — but trayFrom's interior branch doesn't thread a walkId down
// to this render layer today (src/engine/theater-data.js's own comment: "opts.walkId... which it is
// [absent] here"), so this degrades to the SAME slug+cell/unit-id identity idle-breathe already uses;
// still fully deterministic (the same room re-mounts with the same kilter every time) and re-seeds
// cleanly the moment a real walkId is threaded through, mirroring dressPlan/spatializePlan's own
// documented "walkId falling back to X" idiom (src/engine/place-dressing.js, place-spatialize.js).
const KILTER_YAW_DEG = 4;      // spec: "yaw jitter +/-4deg"
const KILTER_POS_FRAC = 0.06;  // spec: "position jitter <=6% of cell"
function kilterFor(seedKey){
  const s = String(seedKey == null ? "" : seedKey);
  function fnv(salt){
    let h = 2166136261 >>> 0;
    const str = s + salt;
    for(let i = 0; i < str.length; i++){ h = ((h ^ str.charCodeAt(i)) * 16777619) >>> 0; }
    return (h >>> 8) / 16777216; // top 24 bits -> [0,1)
  }
  const u1 = fnv(":kilter-yaw"), u2 = fnv(":kilter-x"), u3 = fnv(":kilter-z");
  return {
    yawDeg: (u1 * 2 - 1) * KILTER_YAW_DEG,
    dx: (u2 * 2 - 1) * KILTER_POS_FRAC,
    dz: (u3 * 2 - 1) * KILTER_POS_FRAC
  };
}



// docs/STAGE-D-WAVE-SPECS.md D4 — DOORS-FIRST render keystone (BEAUTY-WAVE-5.md IA-4, "doors ship
// first"). data.interactables mirrors data.dressing/data.pieces (a plain field the caller sets
// directly on the board object — src/engine/theater-data.js's trayFrom, D2's bindWalkInteractables +
// D3's applyRoomGrammar chain). D4's OWN scope is the door archetype only (BW5's own ruling — every
// other archetype's render rides D5, after Adam's taste gate); a non-door entry or an unplaced
// `reserve:true` entry (Law 5's staging reserve — narration-only, never a phantom mesh) is a
// documented no-op here, never a crash.
//
// EXTRUDE construction class (GRAPHICS-ENGINE.md §H / BW5 IA-4): a real extrusion at the entry's
// authored `extrudeDepth` (D1's registry field) — never a flat quad. The wall APERTURE at every DOOR
// cell is already excluded from the solid wall fill (theater-room-mesh.js's own shell.apertures —
// "door segments — no quad, kept for portal-card alignment"); this unit shapes what fills that
// opening to the rolled door's own silhouette: an "arch"/"gothic"/"pointed"/"ogee"/"vault" keyword in
// the door's rolled name/flavor (itrDoorIsArched) gets an arched top (itrDoorShape's absarc half-
// circle), everything else a plain rectangular leaf — BW5's "arched door -> arched opening, never a
// flat quad" law, scoped honestly to the ONE archetype this wave ships.
//
// STATE (D0 S0-3/Law 6 — "a door swings, never a teleport"): shut/ajar/open read as an increasing
// swing angle about a FIXED VERTICAL AXIS AT ONE JAMB EDGE (docs/STAGE-D-WAVE-SPECS.md D4b ruling 3,
// "a door opens on hinges... that axis usually isn't the center of the door" — retires D4's own
// centerline-pivot simplification, Adam's taste-gate FAIL). The hinge side is picked once per door
// via a deterministic hash off `sourceRef` (itrDoorHingeSign, below) — SEAM: there is still no rolled
// hinge-side fact in D1's interactables registry, so this hash-pick stands in for one until a real
// fact exists; the SAME sourceRef always resolves the SAME side, a different sourceRef may resolve
// the other. The swing is real, continuous, and tween-driven either way, never a snap. Broken tilts
// forward (near-flat, DETACHED+GROUNDED per ruling 2 — never the old ~50deg mid-air diagonal read)
// about its own base edge (itrDoorShape's y=0 floor edge) plus a small KILTER-style deterministic
// jitter (kilterFor, this file's own THE KILTER convention, reused rather than reinvented) so a broken
// door reads as fallen/off-kilter, never randomly per render — and a computed Y-lift (derived from
// the tip angle + extrudeDepth, never a magic sag) keeps its lowest point in true floor contact.
const ITR_DOOR_ARCH_KEYWORDS = Object.freeze(["arch", "gothic", "pointed", "ogee", "vault"]);
function itrDoorIsArched(entry){
  const text = ((entry && entry.name) || "") + " " + ((entry && entry.flavor) || "");
  const low = text.toLowerCase();
  return ITR_DOOR_ARCH_KEYWORDS.some((k) => low.indexOf(k) >= 0);
}
// THE DOOR CONTRACT (Adam, 2026-07-23): the door is an extruded rectangle that SITS IN — i.e.
// FILLS — the doorway. The doorway is the full-cell hole (frame ornament deleted, theater-interior),
// door-height (ITR_DOOR_HEIGHT_FRAC 0.85 × wallHeightBase 2.4 = 2.04) with a plain wall lintel
// above. The leaf fills that hole with a small even clearance; the old 0.9 × 1.9 leaf left a 0.05
// side gap against the retired jamb posts and a 0.14 transom slot the header used to hide.
// KINDERGARTEN PROTOTYPE DOOR (Adam, 2026-07-23): "average door dimensions are 36\" wide by 80\"
// tall... prototype door can be those dimensions." GRID LAW: 1 u = 5 ft = 60 in.
const ITR_DOOR_WIDTH = 0.6;      // 36" / 60
const ITR_DOOR_HEIGHT = 4 / 3;   // 80" / 60 = 1.3333 — fills theater-interior's 0.61 × 1.35 opening
const ITR_DOOR_FALLBACK_DEPTH = 0.32; // D1's own registry value for every realm's door@* rows (data/interactables.js) — used only if extrudeDepth is somehow absent
function itrDoorShape(arched){
  const w = ITR_DOOR_WIDTH, h = ITR_DOOR_HEIGHT;
  const shape = new THREE.Shape();
  const straightH = arched ? h * 0.72 : h;
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2, straightH);
  if(arched){
    shape.absarc(0, straightH, w / 2, Math.PI, 0, true); // the arched top — a real half-circle, never a flat quad
  } else {
    shape.lineTo(w / 2, straightH);
  }
  shape.lineTo(w / 2, 0);
  shape.lineTo(-w / 2, 0);
  return shape;
}
// state -> swing angle about the leaf's own HINGE axis (degrees, docs/STAGE-D-WAVE-SPECS.md D4b
// ruling 3: "ajar≈20-25°, open≈100-110° (swung toward the wall, leaf face visible edge-on to the
// aperture)"). `null` (broken) means "not a swing state" — handled separately below via the
// tip-forward transform.
const ITR_DOOR_SWING_AJAR_DEG = 22;   // ruling 3 range 20-25deg
const ITR_DOOR_SWING_OPEN_DEG = 105;  // ruling 3 range 100-110deg
const ITR_DOOR_SWING_DEG = Object.freeze({ shut: 0, ajar: ITR_DOOR_SWING_AJAR_DEG, open: ITR_DOOR_SWING_OPEN_DEG });
// D4b ruling 2: broken must read as DETACHED and GROUNDED (leaning/flat at the threshold — min-Y in
// floor contact), never the old ~48-62deg mid-air diagonal slab. Base tip 84deg +/- a 6deg KILTER-
// style jitter (kilterFor's own +/-4deg yaw spread * this multiplier) keeps the range 78-90deg —
// capped at <=90 so the grounding-lift formula below (which assumes cos(tip)>=0) stays valid.
const ITR_DOOR_BROKEN_TIP_BASE_DEG = 84;
const ITR_DOOR_BROKEN_TIP_JITTER_MULT = 1.5;
const ITR_DOOR_BROKEN_GROUND_CLEARANCE = 0.01; // a hair above true floor contact — same "just above, never embedded" idiom as INTERIOR_DECAL_Y_OFFSET
function itrDoorBrokenTipRad(sourceRef){
  const k = kilterFor("d4-door-broken:" + (sourceRef || ""));
  return (ITR_DOOR_BROKEN_TIP_BASE_DEG + k.yawDeg * ITR_DOOR_BROKEN_TIP_JITTER_MULT) * Math.PI / 180;
}

// docs/STAGE-D-WAVE-SPECS.md D4c — BROKEN-DOOR VARIANT FAMILY (Adam's design ruling 2026-07-14:
// "Ideally a broken door would have a few states: one just like that, flopped onto the ground;
// another broken into bits; and another broken partially on the hinge — still hanging onto one bit
// of hinge but not the full hinge."). LOCKED ARCHITECTURE: these are three visual VARIANTS within
// the single `broken` CONTRACT state — NOT new states. D0's event contract, D1's registry state
// lists, and dm-contract stay byte-untouched (INTERACTABLE_ARCHETYPE_STATES.door is still
// shut·ajar·open·broken, data/interactables.js unchanged) — the variant is a pure render-layer
// pick, the same class of "no rolled fact exists yet, so this hash-pick stands in for one" seam
// itrDoorHingeSign already documents for hinge SIDE.
//
// itrDoorSeedUnit factors out the ONE inlined FNV-1a hash loop kilterFor/itrDoorHingeSign each
// already carry their own private copy of — D4c needs several independent uniform [0,1) draws per
// door (variant pick, hanging's two angle bands, every shard's placement/size/yaw) and re-inlining
// that same 4-line loop that many times would be pure duplication noise, not a new convention.
// kilterFor and itrDoorHingeSign are left byte-untouched (D4b's already-tested code, not D4c's to
// rewrite) — this is purely additive.
function itrDoorSeedUnit(seedKey){
  const s = String(seedKey == null ? "" : seedKey);
  let h = 2166136261 >>> 0;
  for(let i = 0; i < s.length; i++){ h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0; }
  return (h >>> 8) / 16777216; // top 24 bits -> [0,1)
}
// uniform thirds, deterministic per sourceRef (never Math.random) — the SAME sourceRef always
// resolves the SAME variant; a different sourceRef may resolve any of the other two.
const ITR_DOOR_BROKEN_VARIANTS = Object.freeze(["flopped", "hanging", "shattered"]);
// test-seam override (mirrors GRADE_TONEMAP/window.Theater._setGradeTonemapForTest's own convention,
// below in this file) — null means "use the real hash pick"; a study-card capture or a verify
// harness can pin one variant for a controlled A/B/C frame without needing to brute-force a
// hash-matching sourceRef first.
let ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST = null;
function itrDoorBrokenVariantFor(sourceRef){
  if(ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST) return ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST;
  const u = itrDoorSeedUnit("d4c-broken-variant:" + String(sourceRef == null ? "" : sourceRef));
  const idx = Math.min(ITR_DOOR_BROKEN_VARIANTS.length - 1, Math.floor(u * ITR_DOOR_BROKEN_VARIANTS.length));
  return ITR_DOOR_BROKEN_VARIANTS[idx];
}

// HANGING variant: the leaf stays attached at ONE hinge point, torn off the other — a partial swing
// about the hinge-edge Y axis (the surviving hinge lets it swing partway) PLUS a droop about the
// leaf's own DEPTH axis (Z, the extrudeDepth direction — "roll", top hinge torn so the top corner
// leans out and down: rotating about Z through the leaf's own origin, which sits at y=0 the base of
// the hinge edge, both swings the top corner outward in X and lowers it in Y as the angle grows).
// Named angle bands per the ruling ("~15-30deg" swing, "~18-28deg" roll) — each shard/door draw is
// its own independent itrDoorSeedUnit pull, seeded per sourceRef so it never varies at draw time.
// Leaf.position is left UNTOUCHED (same edgeX/0 rest every swing state already uses) — the surviving
// hinge point (the geometry's own local origin, D4b's hinge-edge invariant) never leaves jamb
// contact, and never lifts off true floor contact either (it sits at the same floor-level y=0 every
// non-lifted state already does).
const ITR_DOOR_HANGING_SWING_MIN_DEG = 15;
const ITR_DOOR_HANGING_SWING_MAX_DEG = 30;
const ITR_DOOR_HANGING_DROOP_MIN_DEG = 18;
const ITR_DOOR_HANGING_DROOP_MAX_DEG = 28;
function itrDoorHangingSwingRad(sourceRef){
  const u = itrDoorSeedUnit("d4c-hanging-swing:" + (sourceRef || ""));
  const deg = ITR_DOOR_HANGING_SWING_MIN_DEG + u * (ITR_DOOR_HANGING_SWING_MAX_DEG - ITR_DOOR_HANGING_SWING_MIN_DEG);
  return deg * Math.PI / 180;
}
function itrDoorHangingDroopRad(sourceRef){
  const u = itrDoorSeedUnit("d4c-hanging-droop:" + (sourceRef || ""));
  const deg = ITR_DOOR_HANGING_DROOP_MIN_DEG + u * (ITR_DOOR_HANGING_DROOP_MAX_DEG - ITR_DOOR_HANGING_DROOP_MIN_DEG);
  return deg * Math.PI / 180;
}

// SHATTERED variant: the leaf mesh is replaced by 3-5 flat seeded shards (no physics — a static
// seeded scatter, the same "deterministic, never Math.random" law every other D4/D4b/D4c pick
// already follows). Shard descriptors are computed in the HINGE GROUP's own local frame (the same
// frame the leaf itself is authored in) so world placement automatically respects the door's own
// corridor-axis orientation (hinge.rotation.y, set by the caller) — no separate east/west branch
// needed here. Shape construction reuses the SAME Shape+ExtrudeGeometry "EXTRUDE construction class"
// (GRAPHICS-ENGINE.md Section H) itrDoorShape/the leaf itself already use — never a new primitive.
const ITR_DOOR_SHATTER_MIN_COUNT = 3;    // ruling: "3-5 seeded flat shards"
const ITR_DOOR_SHATTER_MAX_COUNT = 5;
const ITR_DOOR_SHATTER_CELL = 1.0;       // world units per cell — DUNGEON-GRAPH law 1 cellSize, kilterFor's own header convention
const ITR_DOOR_SHATTER_APRON_CELLS = 1;  // ruling: "within the door cell UNION its 1-cell apron"
const ITR_DOOR_SHATTER_CLEAR_LANE = 0.30; // world units either side of the aperture centerline kept shard-free — "aperture fully open" read honestly, never cluttered
const ITR_DOOR_SHATTER_SIZE_MIN = 0.16;
const ITR_DOOR_SHATTER_SIZE_MAX = 0.30;
const ITR_DOOR_SHATTER_THICKNESS = 0.03; // "flat" shard — a thin extrusion, never a slab
const ITR_DOOR_SHATTER_JITTER_FRAC = 0.6; // per-corner jitter (fraction of half-size) — an irregular quad, never a perfect square
function itrDoorShatterCount(sourceRef){
  const u = itrDoorSeedUnit("d4c-shatter-count:" + (sourceRef || ""));
  const span = ITR_DOOR_SHATTER_MAX_COUNT - ITR_DOOR_SHATTER_MIN_COUNT;
  return ITR_DOOR_SHATTER_MIN_COUNT + Math.min(span, Math.floor(u * (span + 1)));
}
// one descriptor per shard: local (x,z) center, a full seeded yaw, and a seeded size. x is biased
// OUT of the aperture's own clear lane (never blocking the walk-through center); z is biased toward
// the threshold (door cell) rather than spread evenly out to the far apron edge (Math.pow(u,0.6)
// skews the draw low) — "threshold-biased" per the ruling.
function itrDoorShatterShards(sourceRef){
  const count = itrDoorShatterCount(sourceRef);
  const shards = [];
  for(let i = 0; i < count; i++){
    const seedBase = "d4c-shard:" + (sourceRef || "") + ":" + i;
    const uX = itrDoorSeedUnit(seedBase + ":x");
    const uZ = itrDoorSeedUnit(seedBase + ":z");
    const uYaw = itrDoorSeedUnit(seedBase + ":yaw");
    const uSize = itrDoorSeedUnit(seedBase + ":size");
    let x = (uX - 0.5) * ITR_DOOR_SHATTER_CELL;
    if(Math.abs(x) < ITR_DOOR_SHATTER_CLEAR_LANE){
      x = x < 0 ? -ITR_DOOR_SHATTER_CLEAR_LANE : ITR_DOOR_SHATTER_CLEAR_LANE;
    }
    const zSpan = ITR_DOOR_SHATTER_CELL * (1 + ITR_DOOR_SHATTER_APRON_CELLS);
    const z = -ITR_DOOR_SHATTER_CELL / 2 + Math.pow(uZ, 0.6) * zSpan;
    const yawRad = uYaw * Math.PI * 2;
    const size = ITR_DOOR_SHATTER_SIZE_MIN + uSize * (ITR_DOOR_SHATTER_SIZE_MAX - ITR_DOOR_SHATTER_SIZE_MIN);
    shards.push({ x, z, yawRad, size, seedBase });
  }
  return shards;
}
function itrDoorShatterShapeFor(seedBase, size){
  const shape = new THREE.Shape();
  const corners = [{ ax: -0.5, ay: -0.5 }, { ax: 0.5, ay: -0.5 }, { ax: 0.5, ay: 0.5 }, { ax: -0.5, ay: 0.5 }];
  corners.forEach((c, i) => {
    const jx = (itrDoorSeedUnit(seedBase + ":c" + i + ":jx") - 0.5) * ITR_DOOR_SHATTER_JITTER_FRAC;
    const jy = (itrDoorSeedUnit(seedBase + ":c" + i + ":jy") - 0.5) * ITR_DOOR_SHATTER_JITTER_FRAC;
    const px = (c.ax + jx) * size, py = (c.ay + jy) * size;
    if(i === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
  });
  return shape;
}
// GROUNDED, flat: the shape is authored in local XY exactly like the leaf's own shape (itrDoorShape)
// — rotation.x=-PI/2 lays that plane down onto the floor (the extrude depth, formerly the leaf's
// horizontal thickness, becomes the shard's vertical thickness), then rotation.z applies the shard's
// own seeded yaw about what is now the vertical axis (three.js's default intrinsic 'XYZ' Euler order
// applies Z last, about the body's already-rotated frame — so this yaws around true world-up, not
// the original local Z). position.y is the SAME ITR_DOOR_BROKEN_GROUND_CLEARANCE hair-above-floor
// idiom the flopped variant already uses — grounded, never embedded, never floating.
function itrDoorBuildShatterShardMesh(shardDesc, color){
  const shape = itrDoorShatterShapeFor(shardDesc.seedBase, shardDesc.size);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: ITR_DOOR_SHATTER_THICKNESS, bevelEnabled: false, curveSegments: 1 });
  const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData = { isDoorShard: true };
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = shardDesc.yawRad;
  mesh.position.set(shardDesc.x, ITR_DOOR_BROKEN_GROUND_CLEARANCE, shardDesc.z);
  return mesh;
}

// ============================================================================
// KS-2 (docs/KENNEY-SOCKET-WAVE.md) — "THE DOOR IS AN ASSEMBLY". A standard 1-cell door whose kit
// piece FITS the aperture (theater-interior.js's itrKitDoorEligible, stamped onto the board's own
// data.kitDoors — pure placement data, no THREE) mounts the normalized kenney-modular-dungeon-kit/
// gate-door piece: the frame socketed into the wall run + the leaf mounted on the frame's own `hinge`
// socket, INSTEAD of interiorBuildInteractableDoorMesh's prism hinge+leaf below. Stage-D door STATES
// (shut/ajar/open/broken) still drive the SAME leaf-rotation concept (itrKitDoorRestPose reuses
// ITR_DOOR_SWING_DEG, the identical shut:0/ajar:22/open:105 constants the prism path swings by) —
// the D0 event contract is completely unchanged; only the geometry supplier swaps, per the spec's own
// words. `broken` is deliberately SIMPLER than the prism path's D4c flopped/hanging/shattered variant
// family (which assumes an analytically-authored extruded prism leaf with a known thickness/tip
// formula) — real GLTF geometry has no such closed-form tip/lift math available for free, so KS-2
// implements exactly what its own spec text licenses: "broken=leaf removed + debris decal license" —
// the leaf hides; a debris-decal treatment is future work, not required by this unit.
// ============================================================================
// KS-3 (docs/KENNEY-SOCKET-WAVE.md) — GENERIC PER-REALM DONOR TEMPLATE CACHE. Closes KS-2's own
// documented deviation ("a live per-realm grade bridge at PRELOAD time is deferred until KS-3 broadens
// kit adoption past this single structural pilot piece") AND backs the new kit-shell wall/floor pieces
// below — one shared warm-cache mechanism instead of three copies of the same async-preload dance.
//
// donorTemplateFor(pack, slug, realmId, realmProfile) -> {group, floorMountLocal:[x,y,z]} | null.
// Keyed "pack/slug@realmId" (a realm's own live profile is static for a session — data/realms.js's
// REALMS table never changes underfoot — so keying on realmId alone is equivalent to keying on the
// full profile fingerprint, simpler). First call for a given key kicks off the REAL graded load
// (loadDonorPiece with the live realmProfile, theater-donor.js's own documented recipe path — five-band
// albedo through gradeColorLocal + grain + per-realm outline, the SAME material path every other
// admitted kit piece takes) and returns null immediately (never blocks a synchronous render); once the
// load resolves, the SAME "real art/graded template arrives late, re-run the last board" replay
// convention dressingTextureFor already establishes (this file, ~line 8975: `S.boardKey = null;
// setInteriorBoard(S.lastBoard);`) fires so the very next paint upgrades from nothing (or a stale
// realm's leftover template) to the correctly-graded piece — never inventing an already-graded frame.
// floorMountLocal is read ONCE off the freshly-loaded group (never off a later clone's userData, which
// three.js's Object3D.clone only shallow-copies by reference) — the same "read sockets off the ORIGINAL
// loaded group, store plain numbers" discipline kitDoorSplitTemplate below already established for the
// door's own hinge socket.
const DONOR_TEMPLATE_CACHE = {}; // "pack/slug@realmId" -> "pending" | {group, floorMountLocal} | undefined
function donorPieceFloorMountLocal(group){
  const fm = socketsByType(group, "floor-mount")[0];
  return fm ? socketPosition(fm) : [0, 0, 0];
}
function donorTemplateFor(pack, slug, realmId, realmProfile){
  const rid = realmId || "fantasy";
  const key = pack + "/" + slug + "@" + rid;
  const cached = DONOR_TEMPLATE_CACHE[key];
  if(cached && cached !== "pending") return cached;
  if(cached !== "pending"){
    DONOR_TEMPLATE_CACHE[key] = "pending";
    loadDonorPiece(pack, slug, { realmId: rid, realmProfile: realmProfile || null }).then((group) => {
      DONOR_TEMPLATE_CACHE[key] = { group, floorMountLocal: donorPieceFloorMountLocal(group) };
      if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d"){ S.boardKey = null; setInteriorBoard(S.lastBoard); }
    }).catch(() => { delete DONOR_TEMPLATE_CACHE[key]; /* never throws — caller's own prism fallback stands forever for this key */ });
  }
  return null;
}
// test-seam bridge for this cache (window.Theater._donorTemplateReadyForTest) is registered further
// down, alongside every other test-only window.Theater._xyz property — window.Theater itself is a
// single object-literal assignment further down this file (NOT built incrementally), so a property
// added here, before that assignment runs, would be silently wiped out.

// ============================================================================
const KIT_DOOR_PACK = "kenney-modular-dungeon-kit";
const KIT_DOOR_SLUG = "gate-door";
let kitDoorTemplate = null;     // {frameGroup, leafGeometry, leafMaterial, hingeLocal:[x,y,z]} once warm
let kitDoorTemplateReady = false;
// kitDoorSplitTemplate: one-time surgery on a freshly loaded donor piece — pulls the `door-leaf`
// semantic child (theater-donor.js stamps `userData.genesisDonor.semanticPart === "door-leaf"` on it,
// generic across every doorway-frame+door-leaf admitted piece, not a gate-door-specific hack) OUT of
// the frame hierarchy and re-anchors its geometry's own local origin onto the piece's `hinge` socket
// position — mirrors interiorBuildInteractableDoorMesh's own D4b "geo.translate so local origin sits
// at the hinge jamb edge" precedent below, generalized to arbitrary authored GLTF geometry instead of
// a procedurally authored Shape. Without this re-anchor, rotating the leaf node in place would pivot
// about ITS OWN authored local origin (wherever Kenney's modeler put it) rather than the true hinge
// line — the exact "floating/wrong-pivot leaf" failure KS-2's own ledger P0 #3 names. Tags every
// geometry/material `userData.shared = true` (this file's own D7 dispose-skip convention,
// disposeMeshMaybeShared below) since every door instance on a board clones this ONE resolved
// template — never re-fetched, never re-baked per instance.
function kitDoorSplitTemplate(rawGroup){
  const hingeSockets = socketsByType(rawGroup, "hinge");
  if(!hingeSockets.length) return null; // an admitted piece with no hinge socket -> never a kit door, prism fallback
  const hingeLocal = socketPosition(hingeSockets[0]);
  let leafObj = null;
  rawGroup.traverse((obj) => {
    if(leafObj) return;
    const gd = obj.userData && obj.userData.genesisDonor;
    if(gd && gd.semanticPart === "door-leaf") leafObj = obj;
  });
  if(!leafObj || !leafObj.geometry) return null; // no leaf child -> never a kit door, prism fallback
  leafObj.updateMatrix();
  const leafGeometry = leafObj.geometry.clone();
  leafGeometry.applyMatrix4(leafObj.matrix); // bake the leaf's own local transform -> frame-root-local space
  leafGeometry.translate(-hingeLocal[0], -hingeLocal[1], -hingeLocal[2]); // re-anchor: local origin -> the hinge point
  leafGeometry.userData.shared = true;
  const leafMaterial = leafObj.material;
  if(leafMaterial) leafMaterial.userData.shared = true;
  if(leafObj.parent) leafObj.parent.remove(leafObj); // detach — the frame keeps every OTHER child
  rawGroup.traverse((obj) => {
    if(obj.geometry) obj.geometry.userData.shared = true;
    if(obj.material) obj.material.userData.shared = true;
  });
  return { frameGroup: rawGroup, leafGeometry, leafMaterial, hingeLocal };
}
// Preloaded ONCE at module scope, UNGRADED (realmProfile:null — a byte-identical passthrough) —
// mirrors loadWholeObjectBuilders/glbLoadScene's own preload-then-clone convention (this file's
// BATTLE-THEATER T2 header, above) so the per-door SYNCHRONOUS mesh-build path
// (interiorBuildInteractableDoorMesh, below) never awaits a network fetch mid-render: a render that
// runs before ANY template settles simply falls back to the (QF-D1-fixed) prism path for every door —
// same "never blank, never throws, the existing fallback shows until the async resource is warm"
// precedent every other GLB-backed seam in this file already follows. This is now the SAFETY-NET
// fallback template only — kitDoorTemplateFor below prefers a GRADED per-realm template (see the KS-3
// retrofit note just below) the moment one warms, and re-renders to pick it up automatically.
loadDonorPiece(KIT_DOOR_PACK, KIT_DOOR_SLUG, { realmId: "fantasy", realmProfile: null }).then((group) => {
  const split = kitDoorSplitTemplate(group);
  if(split){ kitDoorTemplate = split; kitDoorTemplateReady = true; }
}).catch(() => { /* network/parse failure: kitDoorTemplateReady stays false forever -> prism path always, never throws */ });

// KS-3 RETROFIT (docs/KENNEY-SOCKET-WAVE.md KS-3, "CLOSE" the KS-2 realm-grading-passthrough
// deviation): kitDoorTemplateFor(realmId, realmProfile) prefers the GRADED per-realm template (built
// through donorTemplateFor above — the SAME live gradeColorLocal five-band+grain+outline recipe path
// every other kit piece now takes) the moment it's warm; until then it degrades to the ungraded
// module-scope singleton above (kitDoorTemplate/kitDoorTemplateReady, UNCHANGED — the safety net that
// keeps the door's own "never wait on network" latency behavior intact for the very first render of a
// session). kitDoorSplitTemplate's own leaf/hinge surgery still runs on the graded group — it's a pure
// geometric operation independent of material grading, so re-running it per realm is correct, not
// wasted work (it must re-run: cloning kitDoorTemplate.frameGroup would carry the WRONG realm's
// materials if the split were cached once off the first-ever load).
const kitDoorGradedTemplatesByRealm = {}; // realmId -> {frameGroup, leafGeometry, leafMaterial, hingeLocal} once warm+split
function kitDoorTemplateFor(realmId, realmProfile){
  const rid = realmId || "fantasy";
  if(kitDoorGradedTemplatesByRealm[rid]) return kitDoorGradedTemplatesByRealm[rid];
  const tmpl = donorTemplateFor(KIT_DOOR_PACK, KIT_DOOR_SLUG, rid, realmProfile);
  if(tmpl){
    const split = kitDoorSplitTemplate(tmpl.group.clone(true)); // clone: donorTemplateFor's own cached .group is shared across every future call for this key, never mutated in place
    if(split) kitDoorGradedTemplatesByRealm[rid] = split;
  }
  return kitDoorGradedTemplatesByRealm[rid] || (kitDoorTemplateReady ? kitDoorTemplate : null);
}

// state -> {rotY, visible}: shut/ajar/open reuse the SAME ITR_DOOR_SWING_DEG constants the prism
// path's itrDoorRestPose swings by (0/22/105deg — three distinct angles); broken hides the leaf
// entirely rather than posing a 4th angle (see this section's own header for why). visible:false is
// itself the 4th state's distinct, documented "transform" — literally "removed", per the spec text.
function itrKitDoorRestPose(state){
  if(state === "broken") return { rotY: 0, visible: false };
  const swingDeg = ITR_DOOR_SWING_DEG[state];
  return { rotY: (typeof swingDeg === "number" ? swingDeg : 0) * Math.PI / 180, visible: true };
}
// interiorBuildKitDoorMesh(entry, cx, cz, floorTopMap, widthAxisIsZ, realmId, realmProfile) -> THREE.Group
// | null. Mirrors interiorBuildInteractableDoorMesh's own return shape (userData.leaf set, kind/
// archetype/sourceRef/state/slug tagged) so interiorBuildInteractables' bookkeeping (bySourceRef,
// S.interiorDoorStateBySourceRef) treats a kit door and a prism door identically — userData.kit:true is
// the ONE discriminator the state-transition tween logic below branches on (kit doors get the simpler
// itrKitDoorRestPose tween; everything else about mounting/tracking is shared). Returns null (prism
// fallback, never throws) when NO template (graded or fallback) is warm yet, this entry isn't
// renderable, or (defensively) the template somehow carries no leaf. `realmId`/`realmProfile` (KS-3
// retrofit): threaded through to kitDoorTemplateFor so this door takes the SAME live realm grade every
// other kit piece takes — see that function's own header for the graded-vs-fallback resolution order.
function interiorBuildKitDoorMesh(entry, cx, cz, floorTopMap, widthAxisIsZ, realmId, realmProfile){
  const tmpl = kitDoorTemplateFor(realmId, realmProfile);
  if(!tmpl) return null;
  if(!entry || entry.reserve || entry.x == null || entry.y == null) return null;
  const doorGroup = new THREE.Group();
  const floorTop = interiorFloorTopAt(floorTopMap, entry.x, entry.y);
  doorGroup.position.set((entry.x || 0) - (cx || 0), floorTop, (entry.y || 0) - (cz || 0));
  // BUTT-JOIN CONSISTENCY: the piece's own native WIDTH axis (its butt-join-e/w sockets) mounts flush
  // along whichever world axis widthAxisIsZ names as the aperture's width — the SAME rotation
  // convention the prism leaf's own `ew` neighbor-scan already established (interiorBuildInteractableDoorMesh,
  // below: `hinge.rotation.y = ew ? Math.PI/2 : 0`), so kit and prism doors on the SAME cell would
  // always agree on orientation.
  doorGroup.rotation.y = widthAxisIsZ ? Math.PI / 2 : 0;

  const frame = tmpl.frameGroup.clone(true); // Object3D clone: shares geometry/material refs (userData.shared-tagged above), never re-baked per instance
  doorGroup.add(frame);

  const hingeLocal = tmpl.hingeLocal;
  const hingeGroup = new THREE.Group();
  hingeGroup.position.set(hingeLocal[0], hingeLocal[1], hingeLocal[2]);
  const leaf = new THREE.Mesh(tmpl.leafGeometry, tmpl.leafMaterial);
  leaf.castShadow = true; leaf.receiveShadow = true;
  leaf.userData = { isDoorLeaf: true };
  const pose = itrKitDoorRestPose(entry.state);
  leaf.rotation.y = pose.rotY;
  leaf.visible = pose.visible;
  hingeGroup.add(leaf);
  doorGroup.add(hingeGroup);

  doorGroup.userData = {
    kind: "interactable", archetype: "door", sourceRef: entry.sourceRef, state: entry.state,
    slug: entry.slug, leaf: leaf, kit: true, widthAxisIsZ: widthAxisIsZ,
  };
  return doorGroup;
}

function itrDoorStateColor(state){
  switch(state){
    case "open": return 0x8a6a42;
    case "ajar": return 0x9a7a52;
    case "broken": return 0x4a3a2a;
    default: return 0x6a4a2e; // shut
  }
}
// HINGE SIDE (D4b ruling 3): deterministic per sourceRef — a hash-pick of one jamb, since D1's
// interactables registry carries no rolled hinge-side fact yet (documented SEAM: the moment one
// exists, this resolves it instead of hashing). +1 -> the leaf's local origin (post geo-translate,
// interiorBuildInteractableDoorMesh below) sits at the LEFT jamb (world x=-ITR_DOOR_WIDTH/2 off the
// door cell's own center) and the leaf swings toward +x; -1 -> the RIGHT jamb, swinging toward -x.
// Same FNV-1a seeded-hash convention as kilterFor (never Math.random) — the SAME sourceRef always
// resolves the SAME side; a different sourceRef may resolve the other.
function itrDoorHingeSign(sourceRef){
  const s = "d4b-hinge:" + String(sourceRef == null ? "" : sourceRef);
  let h = 2166136261 >>> 0;
  for(let i = 0; i < s.length; i++){ h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0; }
  const u = (h >>> 8) / 16777216; // top 24 bits -> [0,1)
  return u < 0.5 ? 1 : -1;
}
// one hinge-group-plus-leaf-mesh assembly per placed door entry. `hinge` carries the cell position +
// the corridor-axis orientation (perpendicular to the wall the door interrupts); `leaf` (its one
// child) carries the state pose — swing about Y for shut/ajar/open, tip-forward about X for broken.
// D4b ruling 3: the leaf's GEOMETRY is translated so its own local origin sits at the hinge jamb edge
// (never the shape's centerline), and `leaf.position.x` is offset by that same edge so the physical
// hinge point lands at the correct jamb — rotation.y then genuinely pivots about that fixed jamb
// point (the far edge sweeps; the hinge-edge vertex column never moves), instead of the retired D4
// centerline spin. Returns null for anything this unit doesn't render (reserve entries, missing
// coordinates).
// KS-2 `kitDoorInfo` param: {widthAxisIsZ} when theater-interior.js's data.kitDoors names this exact
// cell as KIT_DOORS_ENABLED-eligible, else null/undefined (squeeze, odd aperture, flag off, or the kit
// piece's neighbor-wall fit test failed — itrKitDoorEligible's own scope). When present AND the kit
// template has finished its async preload (interiorBuildKitDoorMesh returns non-null only then), the
// kit assembly renders INSTEAD of the prism hinge+leaf below — every prism path survives as the
// unconditional fallback (kitDoorInfo absent, or the template still cold) per the wave's own posture.
// ─── DOOR MOUNT OFFSET (Adam, 2026-07-23: "it is not socketed into the wall, it is floating out in
// front of the wall") ────────────────────────────────────────────────────────────────────────────
// Measured cause (census bb probe, dev/clay-captures/door/): the whole door assembly — frame prisms,
// reveal, portal card, leaf — is authored at the door CELL's centre (leaf z −2.0), while the
// room-shell wall system stands at the room BOUNDARY (north wall body centred z −2.61, inner face
// −2.465). Half a cell of daylight between a door and its wall. The instanced wall channel puts
// walls ON cells, so the cell-centre convention was correct there — this is a wall-SYSTEM-dependent
// projection fact, so it is resolved HERE in the renderer, not in the data layer: theater-interior
// emits pure outward edge signs (doorAxes), and this helper turns them into a world offset.
//   along: ITR_DOOR_MOUNT_ALONG_SHELL (cell centre → boundary line, 0.5) plus
//     ITR_DOOR_DEPTH_IN_WALL_DEFAULT (the leaf half-depth minus a 0.02-u face projection) when the
//     shell wall system is active, 0 for the instanced system — plus/overridden by the live tune.
//   tune (GS.doorMountTune, the clay workbench's Door tab): per-axis offsets {along, lateral,
//     vertical}. A RECIPE OVERRIDE consumed at build time — the tuner never drags meshes; it edits
//     these numbers and replays the board, per the Workbench law ("allowed edits become validated
//     table rows, versioned recipes/locks, or renderer invariants").
const ITR_DOOR_MOUNT_ALONG_SHELL = 0.5;
// Adam live-tuned +0.14 on 2026-07-23 and identified the construction error precisely: putting the
// LEAF CENTRE on the wall's inner/front face leaves half of a centred 0.32-u extrusion sticking into
// the room. The construction default is therefore derived, not guessed: sink the centre by half the
// leaf depth, then leave a 0.02-u face projection so its front is NEARLY flush and still readable.
const ITR_DOOR_FRONT_FACE_PROJECTION = 0.02;
const ITR_DOOR_DEPTH_IN_WALL_DEFAULT = ITR_DOOR_FALLBACK_DEPTH / 2 - ITR_DOOR_FRONT_FACE_PROJECTION;
function itrDoorMountFor(axisInfo){
  if(!axisInfo) return null;
  const tune = (typeof GS !== "undefined" && GS && GS.doorMountTune) ? GS.doorMountTune : {};
  const shellOn = (typeof ITR_ROOM_SHELL !== "undefined") ? !!ITR_ROOM_SHELL : false;
  const depthInWall = typeof tune.along === "number"
    ? tune.along : (shellOn ? ITR_DOOR_DEPTH_IN_WALL_DEFAULT : 0);
  const along = (shellOn ? ITR_DOOR_MOUNT_ALONG_SHELL : 0) + depthInWall;
  const lateral = (typeof tune.lateral === "number") ? tune.lateral : 0;
  const dy = (typeof tune.vertical === "number") ? tune.vertical : 0;
  return {
    dx: (axisInfo.edgeSignX || 0) * along + (axisInfo.widthAxisIsZ ? 0 : lateral),
    dz: (axisInfo.edgeSignZ || 0) * along + (axisInfo.widthAxisIsZ ? lateral : 0),
    dy: dy,
  };
}
// "x,z" -> {dx,dz,dy}, recomputed every rebuild from the board's own doorAxes + the live tune, and
// reported on S.doorMountReport so every capture receipt names the applied offsets.
function itrDoorMountMapFrom(doorAxes){
  const map = new Map();
  const report = { shellOn: (typeof ITR_ROOM_SHELL !== "undefined") ? !!ITR_ROOM_SHELL : false,
    alongDefault: ITR_DOOR_MOUNT_ALONG_SHELL + ITR_DOOR_DEPTH_IN_WALL_DEFAULT,
    boundaryAlong: ITR_DOOR_MOUNT_ALONG_SHELL,
    depthInWallDefault: ITR_DOOR_DEPTH_IN_WALL_DEFAULT,
    tune: (typeof GS !== "undefined" && GS && GS.doorMountTune) ? GS.doorMountTune : null,
    perDoor: [] };
  (doorAxes || []).forEach(function(a){
    if(!a) return;
    const m = itrDoorMountFor(a);
    if(!m) return;
    map.set(Math.round(a.x) + "," + Math.round(a.z), m);
    report.perDoor.push({ x: a.x, z: a.z, dx: +m.dx.toFixed(3), dz: +m.dz.toFixed(3), dy: +m.dy.toFixed(3) });
  });
  S.doorMountReport = report;
  return map;
}
// applies a door-mount map to a list of instance rows (doorframe / portal kinds) — always a CLONE,
// never a mutation, so a replayed S.lastBoard can never compound offsets across rebuilds.
function itrApplyDoorMounts(list, mountMap){
  if(!mountMap || !mountMap.size || !list || !list.length) return list;
  return list.map(function(row){
    if(!row) return row;
    const m = mountMap.get(Math.round(row.x) + "," + Math.round(row.z));
    if(!m) return row;
    return Object.assign({}, row, {
      ox: (row.ox || 0) + m.dx, oz: (row.oz || 0) + m.dz,
      yBase: (row.yBase || 0) + m.dy,
    });
  });
}
function interiorBuildInteractableDoorMesh(entry, cx, cz, floorTopMap, kitDoorInfo, realmId, realmProfile, doorAxisInfo){
  if(kitDoorInfo){
    const kitMesh = interiorBuildKitDoorMesh(entry, cx, cz, floorTopMap, kitDoorInfo.widthAxisIsZ, realmId, realmProfile);
    if(kitMesh) return kitMesh;
  }
  if(!entry || entry.reserve || entry.x == null || entry.y == null) return null;
  const extrudeDepth = (typeof entry.extrudeDepth === "number" && entry.extrudeDepth > 0) ? entry.extrudeDepth : ITR_DOOR_FALLBACK_DEPTH;
  const arched = itrDoorIsArched(entry);
  const shape = itrDoorShape(arched);
  // HINGE-EDGE AXIS (D4b ruling 3): itrDoorShape's own footprint is symmetric about x=0 (the
  // centerline) — geo.translate shifts that local origin OFF the centerline and onto whichever jamb
  // edge (x=-w/2 or x=+w/2) itrDoorHingeSign picks for this sourceRef, so the mesh's own local (0,0,0)
  // IS the hinge point. `edgeX` is that jamb's ORIGINAL (pre-translate) x — leaf.position.x is set to
  // it below so the physical hinge still lands at the correct world offset from the door cell's
  // center (unchanged from D4: at rest (rotation=0) the leaf occupies the exact same span as before).
  const hingeSign = itrDoorHingeSign(entry.sourceRef);
  const edgeX = hingeSign > 0 ? -ITR_DOOR_WIDTH / 2 : ITR_DOOR_WIDTH / 2;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: extrudeDepth, bevelEnabled: false, curveSegments: 10 });
  geo.translate(-edgeX, 0, -extrudeDepth / 2); // origin -> hinge jamb edge (x); center the extrusion depth on the aperture plane (z), unchanged
  const mat = new THREE.MeshLambertMaterial({ color: itrDoorStateColor(entry.state), transparent: true, opacity: 1 });
  const leaf = new THREE.Mesh(geo, mat);
  leaf.position.x = edgeX; // re-anchor: the (now hinge-edge) origin sits at the true jamb offset from the cell center
  leaf.castShadow = true; leaf.receiveShadow = true;
  leaf.userData = { isDoorLeaf: true };

  // ORIENTATION (door tranche, 2026-07-23): the board's own doorAxes answer — computed by
  // theater-interior's itrDoorWidthAxisIsZ, the SAME multi-cell wall-run scan that orients the
  // frame — is authoritative when present: widthAxisIsZ means the pierced wall runs along Z, so the
  // leaf (which spans X at rest, jambs offset along ±x) rotates 90° to span Z; a width-along-X door
  // stays unrotated. The old east-west floor-neighbor heuristic remains ONLY as the fallback for a
  // caller that supplies no axes (a bare harness board): it misfires for any door on a room's own
  // edge row — both lateral neighbors are room floor there — which is exactly how the clay
  // fixture's closed leaf mounted perpendicular to its wall.
  const rx = Math.round(entry.x), ry = Math.round(entry.y);
  let leafSpansZ;
  if(doorAxisInfo && typeof doorAxisInfo.widthAxisIsZ === "boolean"){
    leafSpansZ = doorAxisInfo.widthAxisIsZ;
  } else {
    leafSpansZ = !!(floorTopMap && floorTopMap.has((rx - 1) + "," + ry) && floorTopMap.has((rx + 1) + "," + ry));
  }

  const hinge = new THREE.Group();
  const floorTop = interiorFloorTopAt(floorTopMap, entry.x, entry.y);
  // door-mount offset (see itrDoorMountFor above): the leaf mounts where the WALL is, not where the
  // cell centre is — same offset the frame/portal rows get, so the assembly moves as one thing.
  const doorMount = itrDoorMountFor(doorAxisInfo) || { dx: 0, dz: 0, dy: 0 };
  hinge.position.set((entry.x || 0) - (cx || 0) + doorMount.dx, floorTop + doorMount.dy, (entry.y || 0) - (cz || 0) + doorMount.dz);
  hinge.rotation.y = leafSpansZ ? Math.PI / 2 : 0;

  // D4c: rest pose (rotation only) comes from the ONE shared pose function itrDoorRestPose — the
  // tween path (interiorBuildInteractables, below) computes its FROM/TO the same way, so a fresh
  // mount and a tween's settled endpoint are always the identical pose (never two formulas that
  // could drift apart).
  const pose = itrDoorRestPose(entry.state, entry.sourceRef);
  leaf.rotation.x = pose.rotX; leaf.rotation.y = pose.rotY; leaf.rotation.z = pose.rotZ;
  let shards = null;
  if(entry.state === "broken"){
    if(pose.variant === "flopped"){
      // D4b ruling 2: DETACHED + GROUNDED — a near-flat forward tip (itrDoorBrokenTipRad, 78-90deg,
      // KILTER-seeded per sourceRef) about the leaf's own base edge (y=0, unaffected by the hinge-
      // edge x-translate above), with a computed Y-lift so its lowest point sits in true floor
      // contact instead of the old fixed "-0.1 sag" (which is exactly what read as a mid-air
      // diagonal slab). at rotation.x=tipRad, a vertex at local (x, y=0, z=+extrudeDepth/2) maps to
      // world-relative y' = -[extrudeDepth/2]*sin(tipRad) — the leaf's own lowest point pre-lift.
      // Lifting by that exact magnitude (plus a hair of clearance) grounds it precisely, never a
      // magic constant. (D4c: byte-preserved verbatim — this IS the landed D4b pose.)
      leaf.position.y = (extrudeDepth / 2) * Math.sin(pose.rotX) + ITR_DOOR_BROKEN_GROUND_CLEARANCE;
    } else if(pose.variant === "shattered"){
      // the leaf is replaced, not merely posed — hide it (never remove it: the E0-1 fade-compliance
      // pass and the BW4 tween channel below both key off hinge.userData.leaf existing) and mount
      // the seeded shard scatter instead.
      leaf.visible = false;
      shards = itrDoorShatterShards(entry.sourceRef).map((desc) => itrDoorBuildShatterShardMesh(desc, itrDoorStateColor("broken")));
    }
    // hanging: no position/visibility change at all — leaf.position stays at its untouched swing
    // rest (edgeX, 0), the surviving hinge point never leaving jamb contact or true floor contact.
  }

  hinge.add(leaf);
  if(shards) shards.forEach((m) => hinge.add(m));
  hinge.userData = { kind: "interactable", archetype: "door", sourceRef: entry.sourceRef, state: entry.state, slug: entry.slug, leaf: leaf, arched: arched, hingeSign: hingeSign, brokenVariant: pose.variant, shards: shards };
  return hinge;
}
// door-swing tween duration — BW4's own 280-350ms "glide, never snap" band (placeCameraTweened's
// header comment names the same band for the camera-pose glide; this reuses it rather than a new
// magic number for the door channel).
const ITR_DOOR_SWING_TWEEN_MS = 320;
// `entry.state` -> the leaf-local rotation this render channel considers "at rest" for that state —
// the SAME pose interiorBuildInteractableDoorMesh assigns a freshly-built leaf, factored out so the
// diff/tween path (below) can compute a FROM pose and a TO pose on the SAME convention. D4c: returns
// a full {rotX,rotY,rotZ} triple (rather than D4b's single {axis,rad}) since the hanging variant
// needs TWO simultaneous rotation components (a Y swing plus a Z droop) — a single-axis pose shape
// can no longer describe every variant. `variant` is the resolved broken-variant (null for every
// non-broken state) — the ONE place both interiorBuildInteractableDoorMesh's direct-build path and
// interiorBuildInteractables' tween path learn which variant a given sourceRef resolves to, so they
// never disagree.
function itrDoorRestPose(state, sourceRef){
  if(state === "broken"){
    const variant = itrDoorBrokenVariantFor(sourceRef);
    if(variant === "hanging"){
      return { rotX: 0, rotY: itrDoorHangingSwingRad(sourceRef), rotZ: itrDoorHangingDroopRad(sourceRef), variant: variant };
    }
    // flopped AND shattered's TWEEN TARGET share the identical tip-forward rotation — shattered's
    // leaf tweens down exactly like flopped (a plausible "falling apart" motion), and the tween's
    // onDone (interiorBuildInteractables, below) performs the actual leaf-to-shards swap once the
    // fall completes, rather than needing a second, incompatible pose shape for the one variant with
    // no meaningful "at-rest leaf rotation" of its own.
    return { rotX: itrDoorBrokenTipRad(sourceRef), rotY: 0, rotZ: 0, variant: variant };
  }
  const swingDeg = ITR_DOOR_SWING_DEG[state];
  return { rotX: 0, rotY: (typeof swingDeg === "number" ? swingDeg : 0) * Math.PI / 180, rotZ: 0, variant: null };
}
// KS-2: data.kitDoors (theater-interior.js's own pure-data output, an array of {x,z,widthAxisIsZ,...})
// -> a "x,y" -> {widthAxisIsZ} lookup Map, so interiorBuildInteractables can hand each door entry the
// SAME per-cell kit-eligibility info theater-interior.js already computed (never re-derived here —
// this file has no `plan`/`SPATIAL_CELL` grid to re-scan even if it wanted to).
function itrKitDoorMap(kitDoors){
  const m = new Map();
  (kitDoors || []).forEach((k) => { m.set(Math.round(k.x) + "," + Math.round(k.z), { widthAxisIsZ: !!k.widthAxisIsZ }); });
  return m;
}
/* interiorBuildInteractables(interactables, cx, cz, floorTopMap, kitDoors, realmId, realmProfile) ->
   {group, bySourceRef}.
   Builds one door assembly per placed (non-reserve) door entry (D4's own scope — see header above)
   and DIFFS against S.interiorDoorStateBySourceRef (the previous render's per-sourceRef state) so a
   real state_transition (a door's state actually changing between two renders of the SAME sourceRef)
   animates its swing/tip-forward pose via the BW4 tween channel (S.tweens/tickTweens,
   theater-verbs.js) instead of snapping — D0 Law 6, "never a teleport". A brand-new sourceRef (never
   seen before this walk) or an unchanged state mounts directly at its rest pose — only a REAL
   transition earns a tween, mirroring MF-2's own "only a genuinely new arrival plays the mount-in
   grace" discipline. KS-2: `kitDoors` (optional, theater-interior.js's data.kitDoors) is looked up per
   entry via itrKitDoorMap; interiorBuildInteractableDoorMesh decides per-cell whether that resolves to
   an actual kit mesh (template warm + entry valid) or falls back to the prism path. The state-
   transition TWEEN itself branches on `hinge.userData.kit` — a kit door's simpler {rotY,visible} pose
   (itrKitDoorRestPose) vs. the prism door's full D4c {rotX,rotY,rotZ,variant} pose (itrDoorRestPose) —
   so the existing prism tween code below is untouched (wrapped in the else branch, byte-identical).
   KS-3 retrofit: `realmId`/`realmProfile` thread straight through to interiorBuildInteractableDoorMesh
   -> interiorBuildKitDoorMesh -> kitDoorTemplateFor, closing the realm-grading-passthrough deviation. */
function interiorBuildInteractables(interactables, cx, cz, floorTopMap, kitDoors, realmId, realmProfile, doorAxes){
  const group = new THREE.Group();
  const bySourceRef = {};
  const prevStates = S.interiorDoorStateBySourceRef || {};
  const nextStates = {};
  let queuedDoorStateTween = false;
  const kitDoorMap = itrKitDoorMap(kitDoors);
  // door tranche: "x,z" -> {widthAxisIsZ}, same keying convention as itrKitDoorMap just above.
  const doorAxisMap = new Map();
  (doorAxes || []).forEach((a) => { if(a) doorAxisMap.set(Math.round(a.x) + "," + Math.round(a.z), a); });
  (interactables || []).forEach((entry) => {
    if(!entry || entry.archetype !== "door") return; // D4 SCOPE: doors ship first (BW5 IA-4) — other archetypes render in D5
    const kitDoorInfo = entry.x != null && entry.y != null ? kitDoorMap.get(Math.round(entry.x) + "," + Math.round(entry.y)) : null;
    const doorAxisInfo = entry.x != null && entry.y != null ? doorAxisMap.get(Math.round(entry.x) + "," + Math.round(entry.y)) : null;
    const hinge = interiorBuildInteractableDoorMesh(entry, cx, cz, floorTopMap, kitDoorInfo, realmId, realmProfile, doorAxisInfo);
    if(!hinge) return;
    const sourceRef = entry.sourceRef;
    nextStates[sourceRef] = entry.state;
    const prevState = prevStates[sourceRef];
    if(prevState != null && prevState !== entry.state){
      // a REAL state_transition since the last render of this exact door — glide, never snap.
      if(hinge.userData.kit){
        // KIT DOOR — the simpler {rotY,visible} contract (this section's own header above).
        const leaf = hinge.userData.leaf;
        const from = itrKitDoorRestPose(prevState);
        const to = itrKitDoorRestPose(entry.state);
        leaf.rotation.y = from.rotY; leaf.visible = from.visible;
        if(!S.tweens) S.tweens = [];
        S.tweens.push({
          start: Date.now(),
          dur: ITR_DOOR_SWING_TWEEN_MS,
          isDoorStateTween: true,
          doorSourceRef: sourceRef,
          update: (t) => {
            const e = (typeof mf1EaseOutCubic === "function") ? mf1EaseOutCubic(t) : t;
            // only interpolate the swing while the leaf is visible on BOTH ends — a broken (removed)
            // endpoint has no meaningful angle to glide toward/from, so it just pops visibility at
            // onDone (matching the "removed", not "eased away", read the spec text asks for).
            if(from.visible && to.visible) leaf.rotation.y = from.rotY + (to.rotY - from.rotY) * e;
          },
          onDone: () => { leaf.rotation.y = to.rotY; leaf.visible = to.visible; },
        });
        queuedDoorStateTween = true;
      } else {
        // PRISM DOOR — byte-unchanged from pre-KS-2.
        const leaf = hinge.userData.leaf;
        const from = itrDoorRestPose(prevState, sourceRef);
        const to = itrDoorRestPose(entry.state, sourceRef);
        leaf.rotation.x = from.rotX; leaf.rotation.y = from.rotY; leaf.rotation.z = from.rotZ;
        // D4c: if this transition LANDS on the shattered variant, the fresh build above (entry.state
        // is already "broken" by the time interiorBuildInteractableDoorMesh ran) already mounted the
        // TERMINAL shattered visuals (leaf hidden + shards seeded at rest) — undo that here so the
        // tween has an actual leaf to animate falling, then redo it in onDone once the fall completes.
        // itrDoorShatterShards is a pure function of sourceRef, so a live break and a freshly-rendered
        // break still converge on the IDENTICAL final shard scatter either way.
        if(entry.state === "broken" && to.variant === "shattered" && hinge.userData.shards){
          hinge.userData.shards.forEach((m) => hinge.remove(m));
          hinge.userData.shards = null;
          leaf.visible = true;
        }
        if(!S.tweens) S.tweens = [];
        S.tweens.push({
          start: Date.now(),
          dur: ITR_DOOR_SWING_TWEEN_MS,
          isDoorStateTween: true,
          doorSourceRef: sourceRef,
          update: (t) => {
            const e = (typeof mf1EaseOutCubic === "function") ? mf1EaseOutCubic(t) : t;
            // D4c: itrDoorRestPose now returns a full {rotX,rotY,rotZ} triple (never a single {axis,
            // rad}) — every variant (including hanging's simultaneous Y+Z) interpolates the same way,
            // no more axis-family branching needed.
            leaf.rotation.x = from.rotX + (to.rotX - from.rotX) * e;
            leaf.rotation.y = from.rotY + (to.rotY - from.rotY) * e;
            leaf.rotation.z = from.rotZ + (to.rotZ - from.rotZ) * e;
          },
          onDone: () => {
            leaf.rotation.x = to.rotX; leaf.rotation.y = to.rotY; leaf.rotation.z = to.rotZ;
            if(entry.state === "broken" && to.variant === "shattered"){
              leaf.visible = false;
              const shards = itrDoorShatterShards(sourceRef).map((desc) => itrDoorBuildShatterShardMesh(desc, itrDoorStateColor("broken")));
              shards.forEach((m) => hinge.add(m));
              hinge.userData.shards = shards;
            }
            hinge.userData.brokenVariant = (entry.state === "broken") ? to.variant : null;
          }
        });
        queuedDoorStateTween = true;
      }
    }
    hinge.userData.sceneObjectId = sourceRef;
    group.add(hinge);
    bySourceRef[sourceRef] = hinge;
  });
  // A door transition can occur without a camera refit or room fade. It therefore owns its own
  // render-loop kick instead of accidentally depending on another tween channel being present.
  if(queuedDoorStateTween) startTweenLoop();
  S.interiorDoorStateBySourceRef = nextStates;
  group.userData = { bySourceRef: bySourceRef };
  return group;
}

// ============================================================================
// KS-3 (docs/KENNEY-SOCKET-WAVE.md) — "ROOM SHELLS FROM THE KIT". theater-interior.js's
// itrKitShellWallRuns/itrKitShellFloorBlocks decide ELIGIBILITY + placement (pure data — data.
// kitShellWalls:[{x,z,axis,span}], data.kitShellFloors:[{x,z,room}], siblings of data.kitDoors); this
// section owns the actual THREE mesh mount, following the SAME donorTemplateFor per-realm warm-cache
// + "re-anchor a piece's own floor-mount socket onto its group's local origin" discipline
// kitDoorSplitTemplate/interiorBuildKitDoorMesh above already established for the door. Both builders
// return an EMPTY THREE.Group when their input array is empty (KIT_SHELL_ENABLED=false in
// theater-interior.js -> zero entries -> zero geometry added here — the flag's own retreat holds
// end to end) or when the template isn't warm yet (never blocks a render; the claimed prism cells stay
// dark until the next rebuild picks up the warm template via donorTemplateFor's own "re-run the last
// board" replay — a real, if rare, first-render gap, exactly the same class of gap the door's own
// preload-then-clone convention already accepts).
const KIT_WALL_PACK = "kenney-modular-dungeon-kit", KIT_WALL_SLUG = "template-wall";
const KIT_FLOOR_PACK = "kenney-modular-dungeon-kit", KIT_FLOOR_SLUG = "template-floor";
// measured scaledDims[1] (dev/model-foundry/KS1-PROVENANCE.json, template-wall) — the piece's own
// natural post-canonicalScale height. Genesis's own prism wall convention is data.wallHeightBase
// (ITR_WALL_HEIGHT_BASE, theater-interior.js — this ES-module scope keeps its own local mirror rather
// than reaching across the sealed boundary, same convention ITR_WALLHANG_FALLBACK_WALL_HEIGHT already
// keeps a few thousand lines below). The two don't match natively (2.075 vs 2.4) — interiorBuildKitShellWalls
// applies a non-uniform Object3D.scale.y correction (X/Z untouched, so the piece's own 2-world-unit
// module span for butt-joining is never distorted) so a kit wall run and its neighboring prism
// jamb/corner/reveal cells share one consistent wall height, never a visible height seam at the mixed
// shell's own kit<->prism boundary.
const KIT_WALL_NATIVE_HEIGHT = 2.075;
const KIT_WALL_FALLBACK_HEIGHT_BASE = 2; // 10 ft; mirrors ITR_WALL_HEIGHT_BASE
// interiorFloorTopAt's own convention: a baseline (unraised) floor cell's TOP sits at
// ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK (both already defined above in this file) — kit floor
// tiles are v1-scoped to baseline-only cells (itrKitShellFloorBlocks' own header), so that fixed world Y
// is this builder's own constant rather than a per-block floorTopMap lookup (every claimed block's 4
// cells share the identical baseline sy by construction).
const KIT_FLOOR_TOP_Y = ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK;

/* interiorBuildKitShellWalls(wallRuns, cx, cz, realmId, realmProfile, wallHeightBase) -> THREE.Group.
   One donor template-wall clone per run entry, re-anchored so the piece's own `floor-mount` socket
   sits at its holder Group's local origin (mirrors the door's hinge re-anchor, generalized to a
   non-leaf whole-piece placement — see this section's own header), then placed at
   (run.x-cx, ITR_FLOOR_BASE_Y, run.z-cz) with rotation.y = 0 for an axis-'x' run (long axis along
   world X) or Math.PI/2 for axis-'z' (long axis along world Z) — the SAME widthAxisIsZ-style rotation
   convention interiorBuildKitDoorMesh already uses, so a kit wall run and a kit door on the same wall
   plane always agree on orientation. */
function interiorBuildKitShellWalls(wallRuns, cx, cz, realmId, realmProfile, wallHeightBase){
  const group = new THREE.Group();
  if(!wallRuns || !wallRuns.length) return group;
  const tmpl = donorTemplateFor(KIT_WALL_PACK, KIT_WALL_SLUG, realmId, realmProfile);
  if(!tmpl) return group;
  const scaleY = (typeof wallHeightBase === "number" && wallHeightBase > 0 ? wallHeightBase : KIT_WALL_FALLBACK_HEIGHT_BASE) / KIT_WALL_NATIVE_HEIGHT;
  wallRuns.forEach((run) => {
    const piece = tmpl.group.clone(true);
    piece.position.set(-tmpl.floorMountLocal[0], -tmpl.floorMountLocal[1], -tmpl.floorMountLocal[2]);
    piece.traverse((o) => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
    const holder = new THREE.Group();
    holder.add(piece);
    holder.scale.y = scaleY;
    holder.position.set((run.x || 0) - (cx || 0), ITR_FLOOR_BASE_Y, (run.z || 0) - (cz || 0));
    holder.rotation.y = run.axis === "z" ? Math.PI / 2 : 0;
    holder.userData = { interiorKind: "kit-shell-wall", axis: run.axis, span: run.span };
    group.add(holder);
  });
  return group;
}

// KS-3b item 1 (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag, "THE FLOOR CHECKER") — the hard
// per-block CHECKER itself was a Z-fighting bug in the outline-hull step (fixed at the source,
// theater-donor.js's own DONOR_OUTLINE_HULL_EXEMPT_CATEGORIES header carries the full diagnosis), not
// a texture/grading defect — every kit floor block clone shares one identical graded material, so
// with the hull bug gone the floor would read as a perfectly FLAT, uniform tone (no texture at all;
// template-floor.glb carries no TEXCOORD_0 post-normalize, build/normalize-donors.py's own
// strip_materials header — every kit piece's grain sample lands on one constant texel, a real,
// separately-tracked gap, not this unit's to re-bake). Adam's own Wildermyth law text (KS-3b's own
// task text, quoting DESIGN.md) wants "clean blocky with SUBTLE low-frequency variation" — perfectly
// flat reads just as artificial as a hard checker, so each block gets one small, deterministic,
// LOW-AMPLITUDE value multiplier. The multiplier itself is computed in theater-interior.js's own
// itrKitShellFloorBlocks (blk.toneJitter, KIT_FLOOR_TONE_JITTER_AMP/itrKitFloorToneJitter — that
// file's own header carries the full "why pure-data, why not a band swap" rationale) — this is the
// SAME "eligibility+placement is pure data, this file only owns the THREE mesh mount" split KS-3's own
// wallRuns/floorBlocks convention already established a few hundred lines up; never re-derived here.

/* interiorBuildKitShellFloors(floorBlocks, cx, cz, realmId, realmProfile) -> THREE.Group. One donor
   template-floor clone per 2x2 block entry, re-anchored so the piece's own `floor-mount` socket (which
   coincides with its `top-surface` socket for template-floor — both at local (0,0,0), per the admitted
   piece's own KS1-PROVENANCE.json sockets) sits at its holder Group's local origin, then placed at
   world Y = KIT_FLOOR_TOP_Y (the baseline floor's real top plane, matching every prism floor cell's own
   sy=ITR_FLOOR_HEIGHT convention this block's eligibility already guarantees). No rotation needed — the
   piece's footprint is square (2x2 world units on both axes), so axis orientation is a non-issue. Each
   block's mesh gets its OWN cloned material (never mutates donorTemplateFor's shared cached material)
   carrying blk.toneJitter (KS-3b item 1, computed upstream — see this function's own header). */
function interiorBuildKitShellFloors(floorBlocks, cx, cz, realmId, realmProfile){
  const group = new THREE.Group();
  if(!floorBlocks || !floorBlocks.length) return group;
  const tmpl = donorTemplateFor(KIT_FLOOR_PACK, KIT_FLOOR_SLUG, realmId, realmProfile);
  if(!tmpl) return group;
  floorBlocks.forEach((blk) => {
    const piece = tmpl.group.clone(true);
    piece.position.set(-tmpl.floorMountLocal[0], -tmpl.floorMountLocal[1], -tmpl.floorMountLocal[2]);
    const jitter = typeof blk.toneJitter === "number" ? blk.toneJitter : 1;
    piece.traverse((o) => {
      if(o.isMesh){
        o.receiveShadow = true;
        if(o.material){ o.material = o.material.clone(); o.material.color.multiplyScalar(jitter); }
      }
    });
    const holder = new THREE.Group();
    holder.add(piece);
    holder.position.set((blk.x || 0) - (cx || 0), KIT_FLOOR_TOP_Y, (blk.z || 0) - (cz || 0));
    holder.userData = { interiorKind: "kit-shell-floor", room: blk.room, toneJitter: jitter };
    group.add(holder);
  });
  return group;
}

// ---- THE OVERLAY FAMILY: extracted to src/ui/theater-overlays.js (split B7, 2026-07-25) ----
// VP6's visible-history decals (DECAL_KIND_COLOR/decalGeoFor/INTERIOR_DECAL_Y_OFFSET/
// interiorBuildDecals), VP6's hit-effect cards (EFFECT_CARD_DUR/effectRingGeoFor/EFFECT_PROC_COLOR/
// effectCardFor/spawnEffectCard), VP5's diegetic selection ring with MF-4's slide (ACTING_RING_MAT/
// actingRingGeoFor/MF4_RING_SLIDE_DUR/actingRingRadiusFor/actingRingWorldPosFor/setActingUnit) and
// VP5's damage floaters (projectUnit/spawnFloater) live in their own module now. It never imports
// this root: overlaysInit(ctx) at end-of-body hands it findUnit (a verify-standee-verbs text pin,
// unmoved), interiorFloorTopAt (a verify-d4-doors text pin, unmoved), markDirty, nearestify,
// startTweenLoop and textureLoader; it takes setBaseGlow from theater-standee-mount.js and
// mf1EaseOutCubic/mf1Lerp from theater-camera.js as one-way leaf->leaf edges. Every facade seam and
// production call site (play()'s hit/down wiring, setInteriorBoard's decal mount, the
// window.Theater.setActingUnit/projectUnit/spawnFloater publishes) stays HERE, unmoved.




function hashSeed(id){
  let h = 0;
  const s = String(id || "");
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h) % 1000;
}

/* ============================================================================
   The Theater instance. One live instance per mount() call; retire() tears it fully down so a
   fresh mount() can start clean (the caller owns the mount/retire lifecycle, e.g. across panel
   opens/closes — this file never assumes it's mounted exactly once per page load).
   ============================================================================ */
function createTheaterState(){
  return {
    mounted: false, el: null, renderer: null, scene: null, camera: null,
    tileGroup: null, propGroup: null, unitGroup: null, shadowGroup: null, groundFieldReport: null,
    rotationStep: 0, dirty: false, raf: null, resizeHandler: null,
    // T1.5: board-fit tracking (§3 camera fit) — the half-extents (world units) of the LAST board's
    // tile footprint, used both at setBoard time and on every rotate() so the fit survives rotation.
    // boardHalfX/boardHalfZ (G9 camera-yaw fix) are the per-axis halves — needed separately because the
    // fit must be computed against the YAW-ROTATED projected bounding box (§ placeCamera), not just the
    // axis-aligned envelope; boardHalfExtent is kept as the axis-aligned max for back-compat/logging.
    boardHalfExtent: 5, boardHalfX: 5, boardHalfZ: 5, boardCenter: null, boardOrigin: null,
    // P1' WHOLE-OBJECT WIRING (§4 step 8): the last setBoard()/setUnits() payload, replayed once by
    // loadWholeObjectBuilders' onSettled callback (module scope, below) so a board/units render that
    // happened BEFORE the async creature-module imports resolved (showing cuboids, correct — never
    // blank) gets ONE follow-up re-render with whole-object figures once the roster is loaded.
    lastBoard: null, lastUnits: null,
    // THEATER-NEXT §3.1/§3.2 — dirty-key skip: the full-payload JSON.stringify of the last
    // setBoard()/setUnits() call that actually rebuilt GL state. An identical next payload is a no-op
    // (nothing changed, skip the full clearGroup+rebuild); any invalidation site (mount/retire/play/
    // pixelSkin+wholeObject setters/setTextures/the P1' async replay) nulls both so the next sync
    // rebuilds unconditionally.
    boardKey: null, unitsKey: null,
    // REALM-PROPS-WIRING.md §3: zone key ("band:lane") -> true for every zone a Large/Huge realm
    // prop's footprint occupies (recomputed fresh each setBoard call). Empty object pre-mount / on
    // a board with no occupying props — never null, so a caller can always safely read a key off it.
    propOccupiedZones: {},
    // REALM-RENDER-STYLE.md §3/§4: the CURRENT board's resolved render profile ({sat,tint,tintAmt,
    // contrast}), set by setBoard from `data.realms` (the SAME activeRealmsFor(skin,w) value
    // theater-data.js's theaterBoardFrom already used to grade tile tints — see that function's own
    // `realms` field). Read by figureMaterialFor (every figure box color), applyLightProfile (ambient/
    // point light colors), and setBoard's own void-tint grade. Defaults to null pre-mount / pre-setBoard
    // — every grade call site treats null exactly like REALM_RENDER_DEFAULT (a no-op passthrough), so a
    // caller before the first setBoard() sees byte-identical pre-unit colors.
    realmProfile: null,
    // P1' WHOLE-OBJECT WIRING Unit B (§4 Unit B): the current board's resolved lighting-prop anchor
    // ({x,y,z} at the prop's own flame/glow head world position), set by mountLightProp (setBoard) and
    // read by applyLightProfile a few lines later in the SAME setBoard call — null whenever this
    // profile has no registered lighting-prop mapping, the gate is off, or the builder hasn't loaded
    // yet, in which case applyLightProfile's own guard falls through to its pre-Unit-B fractional-
    // position math (byte-identical, §4 Unit B step 3's "never a dark board" guard).
    lightPropAnchor: null,
    // THEATER-ZOOM-SPREAD: zoomLevel is a MULTIPLIER on the auto-fit viewSize (1.0 = default fit,
    // <1 = zoomed in, >1 = zoomed out), applied in placeCamera AFTER the fit recomputes viewSize from
    // the current board's half-extents — see ZOOM_STEP_FACTOR's own header comment for why a
    // multiplier (not a stored absolute viewSize) is what survives setBoard()/rotate() re-fits
    // proportionally. Reset to the small-board-biased default on every setBoard() call (a fresh board
    // gets a fresh bias reading, not the previous board's zoom carried over at the wrong scale).
    zoomLevel: 1,
    zoomBiasBandCount: null, // last band-count shape the small-board bias was computed against (setBoard)
    // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): tallest participant's real world height for the
    // CURRENT board, read by placeCamera's screenHalfHeight term (0 = no correction, the flat
    // tabletop's own permanent value — setBoard resets this every call; only setInteriorBoard computes
    // a real number, from data.pieces' true-scale heights).
    interiorFitMaxHeight: 0,
    // ENV-3b (docs/ENV-EXTERIOR-WAVE.md composition-fix wave) ruling 2 — sibling to interiorFitMaxHeight
    // just above, but for setBoard's own TILE geometry (a settlement's building masses) rather than
    // mounted figures: see setBoard's own reset-and-measure comment + setUnits' fold-in comment for the
    // full mechanism. 0 pre-mount/pre-setBoard, same convention as every other field here.
    boardTallestTileTop: 0,
    // ENV-3b ruling 2 sibling — the last setUnits() call's own tabletopTallestTop, persisted so a LATER
    // setBoard-only replay (no accompanying setUnits) still has a valid figure height on record for
    // refitTabletopHeightFit's combiner. 0 pre-mount/pre-setUnits.
    unitsTallestTop: 0,
    // BEAUTY-WAVE-2.md BW2-1: which channel last mounted a board — setBoard/setInteriorBoard each set
    // this to their own kind. placeCamera's hx/hz degenerate-box FLOOR is smaller for the interior
    // channel (its "beat"/CLOSE-room fits are DESIGNED to be tight — a small room or huddle is the
    // whole point) than the flat tabletop's own floor (untouched: OUT OF SCOPE, that floor's pre-unit
    // value keeps protecting the combat-zone-grid board exactly as before).
    isInteriorBoard: false,
    env: null,           // last board's env key — drives void/fog color
    textures: {},         // semantic key -> loaded+cached THREE.Texture (setTextures)
    psxEnabled: false,    // BEAUTY-WAVE-2 BW2-0 (Adam 2026-07-10 night, mid-flight ruling): PS1 is
                           // RETIRED as a rendering style EVERYWHERE — the shipped default is now
                           // CLEAN (full-res, image-rendering:auto) game-wide, tabletop included.
                           // The T1.5 preview-only toggle (dev/theater-preview.html's "PSX/clean"
                           // button, mount()'s opts.psx escape hatch below) still flips this true for
                           // a dev/nostalgia look — it just no longer starts there.
    // T3 (theater-verbs, §4): fxGroup holds every verb-spawned FX primitive (glyphs, elemental
    // bursts, the absurdity rift) — swept by clearGroup exactly like tiles/props/units on the next
    // setBoard/setUnits/retire, so a verb never leaks geometry across a re-render. tweens is the
    // live tween queue theater-verbs.js's tickTweens owns; tweenRaf is this file's OWN animation-loop
    // handle (separate from the render-on-demand `raf` above — see startTweenLoop/stopTweenLoop).
    fxGroup: null, tweens: [], tweenRaf: null,
    // last board's grid + origin, kept for zoneToWorld (T3): the same {cx,cz} setBoard already
    // computes for centering tiles/units, plus the grid's own band/lane arrays so a "band:lane"
    // string resolves to the identical world coordinates theaterUnitsFrom would place a unit at.
    lastGrid: null,
    // BOARD LIGHTING: ambientLight/pointLights are the LIVE THREE light objects setBoard rebuilds from
    // data.light.profile (see applyLightProfile) — kept off the scene graph groups (tile/prop/unit/etc.
    // groups are swept by clearGroup on every setBoard; lights are their own small set, added directly
    // to S.scene, disposed+removed explicitly by applyLightProfile's own teardown each call rather than
    // routed through clearGroup, since THREE.Light has no geometry/material to dispose). lightProfileKey
    // + flickerRaf drives the smooth flame animation loop. Seeded targets still arrive at irregular,
    // low-frequency intervals, but the real light and visible flame now glide between them on each
    // display frame instead of visibly stepping from one target to the next.
    ambientLight: null, pointLights: [], lightProfileKey: null, flickerRaf: null, flickerTick: 0,
    interiorFlickerTargets: [], interiorLightTargets: [], interiorLightsBuilt: null,
    interiorLightingKey: null, interiorLightingPreservedThisBuild: false,
    keyLight: null, fillLight: null, interiorCameraKey: null,
    spriteCameraFill: null, spriteCameraFillTarget: null,
    clayRoomSelectionGlowSprite: null,
    standeeCollisionDirty: false, standeeCollisionAudit: null,
    hemiLight: null, // GR3: the shared soft hemisphere key, added once at mount() — see mount()'s own comment
    // BEAUTY-WAVE-3 BW3-0 (docs/BEAUTY-WAVE-3.md, THE COMPOSER SEAM): the postprocessing chain, built
    // once at mount() (needs a live renderer) and disposed at retire(). Default ON, but the render
    // call site (renderTheaterFrame, below scheduleRender) only ever calls composer.render() when the
    // chain actually holds >=1 enabled pass — EffectComposer.render() is a NO-OP over an empty `passes`
    // array (it never clears or draws the screen on its own), so routing an empty chain through it
    // would show a blank/stale frame, not a passthrough. Direct renderer.render(scene,camera) IS the
    // empty-chain path, not a fallback of last resort — that's what makes "flag ON, zero passes"
    // byte-identical to the pre-composer render. addPass/removePass (window.Theater surface, below)
    // are the seam BW3-2/3/6 mount their DoF/bloom/grade passes onto later; this unit adds none itself.
    postChainEnabled: true,
    composer: null,
    // BEAUTY-WAVE-3 BW3-2/3/6 (THE POST SUITE — TILT-SHIFT DoF + SELECTIVE BLOOM + FILMIC GRADE):
    // the three effect passes, built lazily the first time an interior board mounts (buildPostSuite)
    // and torn OFF the composer whenever the flat tabletop takes the stage (setBoard) — interior-only,
    // per the spec (the flat tabletop stays pass-free; it dies at UW3). Held here as a small record so
    // mount/teardown route through the window.Theater.addPass/removePass seam rather than mutating
    // composer.passes directly. renderPass is the composer's own scene->buffer pass (the effect passes
    // read its output); it is added/removed alongside the effects so an interior board's chain is
    // [render, dof, bloom, grade] and the tabletop's chain is empty (direct render). postSuiteMounted
    // tracks whether the effect passes are currently attached to S.composer.
    postSuite: null, postSuiteMounted: false, dofFocusDist: 0, dofFocusNdcY: 0,
    // LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — LIGHT-LAB tracking. lightLabMounted/lightLabEls/
    // lightLabReadoutTimer are this session's DOM-panel bookkeeping (torn down by unmountLightLab, or
    // at retire() below); lightLabProfileKey is which LIGHT_PROFILES entry the lab's dropdown currently
    // has selected for editing (independent of S.lightProfileKey, the profile actually RENDERED).
    lightLabMounted: false, lightLabEls: null, lightLabReadoutTimer: null,
    lightLabProfileKey: null, lightLabLightIndex: 0,
    lightLabUndo: [], lightLabRedo: [], lightLabDirty: false,
    // ---- split step 0 (2026-07-25): every S field the file assigns is DECLARED here so the
    // state container reads as a contract. All were previously created by first assignment;
    // null is behavior-identical to undefined for every reader in this file (no strict-null/
    // hasOwnProperty/enumeration reads — audited). Grouped by owning subsystem for the split.
    // split step 0 — cameras / view / camera-facing shot state
    cameraLookTarget: null, clayCamFit: null, clayCamOffset: null, clayCamZoom: null,
    f1PreCombatCamFit: null, lastComposedShot: null, lastComposedShotAttempt: null, lastComposedShotError: null,
    lastShotPlan: null, orthoCamera: null, perspCamera: null, viewSize: null,
    // split step 0 — occlusion / fade
    __occlusionFadeBoardRef: null, occlusionClassifyBearingDeg: null, occlusionFadeState: null,
    // split step 0 — units / acting / tween-adjacent groups
    actingGlowBaseMeshes: null, actingIds: null, actingRingMeshes: null, despawnGroup: null,
    effectTexCache: null, floaterEl: null, knownUnitIds: null, transitionEl: null,
    // split step 0 — lighting / atmosphere extras
    celestialVoidTint: null, moteGroup: null, moteRaf: null,
    // split step 0 — interior build reports / counts / lists
    doorMountReport: null, interiorDecalCount: null, interiorDoorStateBySourceRef: null, interiorDressingCount: null,
    interiorDressingWorldPositions: null, interiorFloorTopMap: null, interiorFurnitureCount: null, interiorGroup: null,
    interiorInteractablesCount: null, interiorInteractablesWorldPositions: null, interiorLastDoorGhostList: null, interiorLastDoorList: null,
    interiorLastFloorList: null, interiorLastKitShellFloors: null, interiorLastKitShellWalls: null, interiorLastPillarGhostList: null,
    interiorLastPillarList: null, interiorLastPortalList: null, interiorLastRoomShell: null, interiorLastWallGhostList: null,
    interiorLastWallList: null, interiorLightConeCount: null, interiorLightCount: null, interiorLightGlowCount: null,
    interiorMeshCount: null, interiorPiecesRequested: null, interiorPiecesResolved: null, interiorPiecesWorldPositions: null,
    interiorShadowCasterCount: null, interiorVariant: null, interiorWallPropsCount: null, interiorWallPropsWorldPositions: null,
    wallOmissionReport: null,
    // split step 0 — clay room (the private clayRoom*/clay* namespace)
    clayGridMesh: null, clayRoomCatalogCollapsed: null, clayRoomCompiled: null, clayRoomDiagnosticActive: null,
    clayRoomEnvAOSyncButton: null, clayRoomFixtureId: null, clayRoomHost: null, clayRoomLightOverlayGroup: null,
    clayRoomLightOverlayModes: null, clayRoomLightReadoutTimer: null, clayRoomLightRecipeId: null, clayRoomLightingBaseline: null,
    clayRoomLightingBenchGroup: null, clayRoomLightingMatrixArtifact: null, clayRoomLightingMatrixOverlay: null, clayRoomLightingProbe: null,
    clayRoomLightingProbeToken: null, clayRoomMatrixCaptureInProgress: null, clayRoomMatrixStatusEl: null, clayRoomMounted: null,
    clayRoomMoodBaseBackground: null, clayRoomMoodGroup: null, clayRoomMoodLayerId: null,
    clayRoomMovementOverlayGroup: null, clayRoomMovementOverlaySummary: null, clayRoomMovementPickMode: null, clayRoomMovementPreviewCell: null,
    clayRoomOverlayEl: null, clayRoomPanelDragCleanup: null, clayRoomPanelResizeHandler: null, clayRoomPixelMetricsCache: null,
    clayRoomPreviewSeed: null, clayRoomProvenanceRoots: null, clayRoomRecord: null, clayRoomRefreshFixtureControls: null,
    clayRoomRefreshLightCatalog: null, clayRoomRefreshLights: null, clayRoomRefreshSprites: null, clayRoomRefreshStructure: null,
    clayRoomRenderedSpriteCanvas: null, clayRoomSelectedId: null, clayRoomSelectedSpriteSlug: null, clayRoomSelectedSpriteView: null,
    clayRoomSelectionHelper: null, clayRoomSelectionProbe: null, clayRoomShowTab: null, clayRoomSourceSprite: null,
    clayRoomSpriteBenchGroup: null, clayRoomSpriteScaleMode: null, clayRoomStructureBenchGroup: null, clayRoomStructureReport: null,
    clayRoomStructureStageLatch: null, clayRoomStructureView: null, clayRoomWorkbenchChrome: null, clayRoomWorkbenchSelect: null,
  };
}

let S = createTheaterState();

function supportsWebGL(){
  try{
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }catch(e){ return false; }
}

function markDirty(){
  S.dirty = true;
  scheduleRender();
}

// ---- SPRITE BILLBOARD FACING: extracted to src/ui/theater-sprites.js (split B7, 2026-07-25) ----
// updateSpriteBillboardYaw (the per-render Y-axis facing pass, its kilter/claySpriteViewYawOffset
// composition, the camera-pitch tilt onto each standee's inner wrap, and the support-collision +
// contact-pool sync tail) lives with the rest of the sprite family now. Its three call sites are
// unchanged and still HERE: scheduleRender's rAF tick (just below), the post-mount pass, and
// window.Theater._updateSpriteBillboardYawForTest.

function scheduleRender(){
  if(!S.mounted || S.raf) return;
  S.raf = requestAnimationFrame(() => {
    S.raf = null;
    if(S.dirty && S.renderer && S.scene && S.camera){
      updateSpriteBillboardYaw();
      renderTheaterFrame();
      S.dirty = false;
    }
  });
}

// BEAUTY-WAVE-3 BW3-0 — THE COMPOSER SEAM's one render call site. Both the render-on-demand loop
// (scheduleRender, above) and the fps harness (measureComposerFps, below near measureRenderFps) draw
// a frame through this SAME function, so a later BW3 unit mounting a real pass changes behavior
// everywhere at once, by construction — no second call site to keep in sync.
// composer.render() only when the chain is ON *and* actually holds >=1 enabled pass; otherwise direct
// renderer.render(scene,camera) — see createTheaterState's own comment for why an empty composer
// would show a blank/stale frame rather than a passthrough if called anyway. This is the exact
// "flag ON, zero passes == byte-identical to pre-composer render" behavior BW3-0 exists to prove.
function renderTheaterFrame(){
  // LL-1: the ENTIRE activation cost when the light-lab is off — one boolean read
  // (lightLabMaybeAutoMount's own short-circuit) at the top of the one render call site. No DOM, no
  // listener, no timer exists until the flag actually flips true (lightLabShouldEnable's own header).
  lightLabMaybeAutoMount();
  // C1A-CLAY-ROOM (docs/C1A-CLAY-ROOM.md D1): the SAME dormant-poll pattern as lightLabMaybeAutoMount
  // just above — one boolean read when off, zero DOM/listeners until ?clayroom=1/GS.clayRoomEnabled
  // actually flips true. See the CLAY-ROOM ADDITIONS block at this file's end for the definition.
  clayRoomMaybeAutoMount();
  if(S.postChainEnabled && S.composer && S.composer.passes && S.composer.passes.length > 0){
    // LL-1 EMISSIVE-MASKED BLOOM: refresh the bloom pass's isolated emitter-only render for THIS frame
    // before the composer consumes it (Pass.render() itself never gets a live scene/camera — see
    // MaskedBloomPass's own header). Gated on the bloom pass actually being mounted+enabled so the
    // flat tabletop (no post suite) and any test harness that disables bloom pay zero extra cost.
    if(S.postSuiteMounted && S.postSuite && S.postSuite.bloom && S.postSuite.bloom.enabled
      && typeof S.postSuite.bloom.updateEmissiveIsolate === "function"){
      S.postSuite.bloom.updateEmissiveIsolate(S.renderer, S.scene, S.camera);
    }
    S.composer.render();
  } else {
    S.renderer.render(S.scene, S.camera);
  }
}

/* ---- BEAUTY-WAVE-3 THE POST SUITE: extracted to src/ui/theater-post.js (split B4, 2026-07-25) ----
   The suite's header, the TILT-SHIFT DoF dials (DOF_FOCUS_HALF/RAMP/MAX_BLUR/STRENGTH) and every pass
   factory + lifecycle function moved there. What remains BELOW in this file is only the part the rest
   of the root shares: the bloom threshold/strength + grade tint seeds LIGHT_TUNABLES is built from,
   BLOOM_LAYER (interiorBuildFixtureGroup stamps it on true emitters), the two mutable test-seam flags
   BLOOM_MASK_DISABLED_FOR_TEST / GRADE_TONEMAP, and GRADE_EXPOSURE_FLOOR. ---- */

// ── SELECTIVE BLOOM dials (BW3-3). UnrealBloomPass is luminance-thresholded: only pixels brighter
// than THRESHOLD contribute, so with a HIGH threshold the effect is emissive-gated in practice — the
// additive flame/cone apexes and chrome glow seams push toward 1.0 and bloom; a torch-LIT albedo
// sprite (readability-floored well under 1.0) stays under threshold and does NOT (the negative
// control). Built at HALF drawing-buffer resolution (RESOLUTION_SCALE) — the mip blur chain is the
// pass's cost; halving it keeps fps clear with all three passes live, standard practice, invisible at
// bloom's soft radius.
// NOTE (round 3): threshold is in the composer's LINEAR space (bloom runs before OutputPass encodes),
// where a lit-albedo sprite reads ~0.2-0.4 and an additive flame/cone/glow-seam pushes toward 1.0 —
// so a mid-high linear threshold is a clean emissive gate (the negative control holds with room).
const BLOOM_THRESHOLD = 0.68;  // linear luminance gate — emissives clear it, lit albedo does not
const BLOOM_STRENGTH = 1.15;   // halo intensity — soft, mock-level (the torch/neon glow, not a flare)
// split B4: BLOOM_RADIUS + BLOOM_RESOLUTION_SCALE moved to src/ui/theater-post.js (buildPostSuite /
// syncPostSuiteResolution were their only readers). BLOOM_THRESHOLD/BLOOM_STRENGTH stay here because
// LIGHT_TUNABLES seeds from them and the render path reads LIGHT_TUNABLES.bloom*, not the bare const.
// LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — EMISSIVE-MASKED BLOOM. The threshold above was the
// ONLY gate WALL-VOLUMES-PRACTICALS.md's E0 shipped ("No bloom mask" — its own Decisions section,
// scoped out because a dim torch-lit crypt never pushed non-emissive albedo near 0.68). The B3 standee
// gallery's daylit lineup broke that assumption for good (ledger #12/13; dev/battle-gate/standee-
// gallery/shots/fantasy-daylit-yaw0.png — the Ogre Zombie standee, and the whole room around it, reads
// as a blown-white smear): under a BRIGHT profile's key+ambient+AgX's own filmic lift, ordinary lit-
// but-non-emissive surfaces cross BLOOM_THRESHOLD on their own, so the threshold alone can no longer
// distinguish "genuinely emitting" from "brightly lit" — bloom re-blows exactly what AgX's shoulder
// just finished compressing back into range. This unit supersedes E0's "no bloom mask" scope-out with
// a real one: MaskedBloomPass (below) restricts its bright-pass EXTRACTION to an isolated render of
// ONLY the objects tagged onto BLOOM_LAYER, so a pixel can seed the bloom halo only if it belongs to a
// mesh actually marked as a true emitter — today, every fixture's own emitter submesh
// (interiorBuildFixtureGroup's `emitter.userData.fixtureEmitter`/`emitter.layers.enable(BLOOM_LAYER)`,
// further down — the SAME tag E0 already stamps on every torch/candle/lantern/brazier flame). THRESHOLD
// still applies inside the isolated render — this is an AND with the mask, not a replacement, so a
// dim/unlit fixture still doesn't bloom. Layer 0 (three's default) stays enabled on every object as
// always; BLOOM_LAYER is purely ADDITIVE onto true emitters, never a visibility change for anything.
const BLOOM_LAYER = 1;
// TEST-ONLY SEAM (same convention as ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST / GRADE_TONEMAP's own
// _setGradeTonemapForTest): forces MaskedBloomPass's bright-pass extraction back to the FULL composited
// frame (readBuffer.texture) instead of the emissive-isolated texture — reproduces the EXACT pre-LL-1
// "threshold-only, no mask" bloom behavior on demand, live, in the SAME running app. Lets a harness
// show the B3 daylit blow-out RED (flag true), then clear the flag and show the SAME fixture GREEN
// under the real mask — a true A/B, not two separately-captured screenshots. Product code never sets
// this; only dev/verify-*.mjs (via window.Theater._setBloomMaskDisabledForTest) does.
let BLOOM_MASK_DISABLED_FOR_TEST = false;

// split B4: the FILMIC GRADE dials header and GRADE_EXPOSURE / GRADE_CONTRAST / GRADE_SATURATION
// moved to src/ui/theater-post.js (makeGradePass's uniform seeds, read nowhere else). The two the
// LIGHT LAB tunes stay HERE with the rest of the LIGHT_TUNABLES seed set:
const GRADE_TINT_SCALE = 0.45; // kit.gradeStrength -> post-wash amount (gentle, avoids double-grade)
const GRADE_TINT_MAX = 0.12;   // hard cap on the tint wash so no realm over-tints the frame
// split B4: GRADE_VIGNETTE / GRADE_VIGNETTE_INNER / GRADE_VIGNETTE_OUTER moved to
// src/ui/theater-post.js — makeGradePass's uniform seeds were their only readers.

// LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1, Stage-E ledger #12: pl-012/013/014/017/022 crush ~half
// the frame to illegible black) — EXPOSURE FLOOR. STAGE_AMBIENT_FLOOR (below, ~L5710) already floors
// the SCENE's own ambient light so nothing is authored pitch-black; the crush ledger evidence shows
// that isn't enough once AgX's log2 encoding gets its hands on the frame — AgX's own AgxMinEv
// (-12.47393, see AGX_TONEMAP_GLSL above) maps very-low-but-nonzero linear values so far down its
// input range that agxDefaultContrastApprox's sigmoid still crushes them to 0 well before midtones
// start responding, which is a property of the CURVE (untouched here — the spec is explicit: "do NOT
// touch makeGradePass's curve"), not a bug in it. The fix lives one step upstream: lift the linear
// frame's floor BEFORE it enters AgXToneMapping, so shadow detail sits inside the curve's responsive
// range to begin with. `max(lin, floor)` is a LIFT, never a cap — it can only brighten a pixel darker
// than the floor, so it can't blow out anything already bright, and it's fully monotonic (the VALUE
// LAW ordering floor<wall<light in pixels survives, same discipline every stage in this pass already
// keeps). Interiors-only per the unit's own scope: wired into FS_AGX alone (below), never FS_NONE —
// FS_NONE is the BYTE-IDENTICAL-to-master literal dev/verify-agx-tonecurve.mjs diffs character-for-
// character; inserting anything into it would break that proof for no benefit (GRADE_TONEMAP="none"
// has no AgX shoulder to feed a floor into anyway). Mutable indirection: LIGHT_TUNABLES.gradeExposureFloor
// (declared after CELESTIAL_ARC, below) is what the render path actually reads; this const is only its
// seed default — see LIGHT_TUNABLES' own header for the byte-identical-when-untouched contract.
// TUNING (live, against dev/verify-diegetic-light.mjs — the sharpest existing near-black regression
// detector in the repo): AgX's shoulder is extremely steep near black — a floor of 0.01-0.035 already
// visibly LIFTS the "genuinely dark far corner"/"dim torchlit crypt" pixels those L-3/L-4/LC-2/P-1b
// gates depend on staying convincingly darker than their lit comparisons (measured live: 0.035 pushed
// L-3's far corner from 0.012->0.196 display luma and blew L-4's daylit:torchlit contrast ratio from
// 6.86 down to 1.14 — RED, not the intended fix). 0.006 is the largest value that still clears every
// one of those gates at their real production margins (verified: 62/63 passed, matching master's own
// baseline exactly — only the pre-existing, unrelated P-1a stale-red remains). Conservative BY DESIGN:
// this default only rescues genuinely near-zero (crushed) pixels; it does not chase the full ledger #12
// "half the frame" claim on its own — LIGHT_TUNABLES.gradeExposureFloor is the live dial (LIGHT-LAB,
// further down) for Adam to push higher if he judges a stronger lift worth the contrast trade-off.
const GRADE_EXPOSURE_FLOOR = 0.006; // linear RGB floor, pre-AgX — see the TUNING note above for why not higher

// P3-3a (docs/PHASE-3-AGX-SPEC.md): the grade above never had a tone-mapping curve — a linear clamp
// (the `clamp(...,0.0,1.0)` in the contrast line below) is the only thing standing between a hot
// highlight and a hard-clipped white, which is what "no renderer.toneMapping set anywhere" (this
// file's own T1 comment, ~theater-boot.js:8032) actually costs: no shoulder, no filmic roll-off.
// GRADE_TONEMAP gates a real curve into the grade pass (NOT renderer.toneMapping — the spec is
// explicit that the tonemap belongs inside the existing grade-pass pipeline, not the renderer, so it
// stays inside the one post-process seam this file already owns).
//   "none" (DEFAULT) -> current look, byte-identical: makeGradePass's fragment shader compiles to
//     the EXACT same source string as before this unit (see the ternary in makeGradePass below) —
//     no branch, no dead code, nothing for the GLSL compiler to even see differently.
//   "agx"  -> compiles in AGX_TONEMAP_GLSL and calls AgXToneMapping(lin) right after the texture read,
//     before the perceptual-space grade math (exposure/contrast/sat/tint/vignette) — "tonemap before
//     grade," matching a standard filmic pipeline's ordering. Adam's taste gate (the A/B in
//     dev/battle-gate/agx/) decides whether this ever becomes the default; this unit only wires it.
// `let`, not `const` — window.Theater._setGradeTonemapForTest (below, mirrors the
// _setRoomShellPolygonKernel test-seam convention) needs to reassign this in-process so an A/B
// capture harness can flip "none"<->"agx" without a source edit between runs. Product code never
// writes this; only the test seam does.
let GRADE_TONEMAP = "agx"; // "none" | "agx" — Adam flipped agx ON 2026-07-14 (A/B ruled "looks awesome"); "none" = the pre-AgX look, seam-settable back via _setGradeTonemapForTest

// ---- THE POST SUITE + ENVIRONMENT AO: extracted to src/ui/theater-post.js (split B4, 2026-07-25) ----
// AGX_TONEMAP_GLSL, makeDofPass, makeGradePass, MaskedBloomPass, envAOPrepassExcludes,
// EnvironmentAOPass, envAOEnabled, makeEnvironmentAOPass, the ENV_AO_* authored settings, and the
// suite's whole lifecycle (buildPostSuite / updateDofFocus / updatePostSuiteGrade /
// syncPostSuiteResolution / mountPostSuite / teardownPostSuite) live in that module now. This root
// imports the surface it still calls (top import block), passes capabilities via postInit(ctx) at
// end-of-body, and re-syncs the live S record via postSyncState(S) at both `S = createTheaterState()`
// sites. GRADE_TONEMAP / BLOOM_MASK_DISABLED_FOR_TEST / BLOOM_LAYER and the LIGHT_TUNABLES seed
// consts stay HERE — see theater-post.js's own header for the full ownership split. Every
// window.Theater post/AO seam (_postSuiteForTest, _setSuitePassEnabledForTest, _environmentAOForTest,
// _aoContactDiagForTest, _envAOPrepassExcludesForTest, _setEnvironmentAOOutputForTest,
// _setGradeTonemapForTest) is still assigned in this file, below, calling in through those imports.

// ---- placeCamera + placeCameraTweened: extracted to src/ui/theater-camera.js (split B6, 2026-07-25) ----
// The T1.5 §3 / G9 / BW2-1 camera fit (both the ortho and perspective branches, the exact-containment
// corner correction, the zoom multiplier applied on top of the auto-fit, and the proportional fog
// re-scale) and BW4 MF-1's interruptible glide wrapper moved there VERBATIM. FOG_FAR, markDirty and
// startTweenLoop stay HERE and reach that module through its ctx; updateDofFocus reaches it as a
// one-way leaf->leaf import from theater-post.js (see theater-camera.js's own header).

// ---- DISPOSAL HELPERS: extracted to src/ui/theater-dispose.js (split B4, 2026-07-25) ----
// disposeMeshMaybeShared / disposeGroupChild / clearGroup moved VERBATIM to their own module (pure —
// no THREE, no S, no root symbol, so no ctx and no init call). This root imports clearGroup +
// disposeGroupChild at the top and every existing call site is unchanged. disposeAuxCaches and
// retire STAY here: they are this file's one true end-of-life point (and dev/verify-theater-verbs.mjs
// text-extracts both from this file's own source).

// ---- BOARD LIGHTING + ATMOSPHERE: extracted to src/ui/theater-lighting.js (split B5, 2026-07-25) ----
// ENV_VOID_TINT/voidTintFor moved there with the rest of the lighting family: LIGHT_PROFILES /
// LIGHT_DEFAULT_PROFILE / lightProfileFor / applyLightProfile, the ENV-1 + ENV-1B + ENV-1c tabletop
// post-passes (TABLETOP_EXTERIOR_LOOK, applyTabletopExteriorLook, voidTintForTabletop, CELESTIAL_ARC +
// the celestial* family, applyTabletopShadowCasters), the two interior camera-side lights
// (mountInteriorCameraKey / mountSpriteCameraFill / updateSpriteCameraFill) and the PRACTICAL FLICKER
// SCHEDULER (lightFlicker* + startLightFlicker's own rAF loop + stopLightFlicker). This root imports
// that surface (top import block), passes capabilities via lightingInit(ctx) at end-of-body, and
// re-syncs the live S record via lightingSyncState(S) at both `S = createTheaterState()` sites.
// ENV_SCORCH_TINT/scorchTintFor just below are a DEAD-STATE marker tint, not a light — they stay here.

/* DEAD-STATE (2026-07-03): the obliteration tile marker reuses theater-data.js's own per-env `scorch`
   tint (the SAME color a hazard tile already uses for a "burn/scorch-mark" read, theater-data.js's own
   header comment) — a small mirrored table, same discipline as ENV_VOID_TINT just above (this module's
   sealed ES-module scope can't import THEATER_ENV_PALETTE, so these are kept in sync with that table's
   `scorch` field by convention/comment, not import). Falls back to the dungeon value for any env this
   table doesn't recognize, matching voidTintFor's own degrade discipline. */
const ENV_SCORCH_TINT = {
  dungeon: 0x3a2418, urban: 0x3f2c1c, wilderness: 0x3a2a16, breach: 0x421f2c
};
function scorchTintFor(env){
  return (env && ENV_SCORCH_TINT[env] !== undefined) ? ENV_SCORCH_TINT[env] : ENV_SCORCH_TINT.dungeon;
}

/* ============================================================================
   REALM-RENDER-STYLE.md §3/§4 — the GL-side half of the shared render-grade seam. data/realms.js owns
   REALM_RENDER_DEFAULT/realmRenderProfile/gradeColor (the single source of truth) AND now does the
   ONLY realm resolution — src/engine/theater-data.js's theaterBoardFrom stamps the resolved profile
   onto `board.renderProfile` (tint pre-converted to a NUMBER there). This module's sealed ES-module
   scope can't read that classic-script const/function directly, so it used to keep its OWN mirrored
   copy of the profile table (a per-realm const map + a local resolver + a local default-profile const)
   — U2 (REVIEW-FIXES-0705.md) DELETED that mirror: "if a data table lives in two places kept in sync
   by convention, that IS the bug" (this exact mirror shipped the lava-red bright-kingdom — a STRING
   tint from data/realms.js's REALMS table hit this file's hexToRGB, which coerces any non-number to
   grey, so figures/lights/void graded toward GREY while tiles — graded in theater-data.js via
   _gradeHexToRGB, which accepts strings — tinted correctly). setBoard now reads `data.renderProfile`
   (the stamp) directly; no local resolution, no local table, nothing to drift.
   gradeColorLocal stays (the sealed module still can't import the classic-global gradeColor) but now
   reads a numeric tint ONLY — the stamp already guarantees that.
   ============================================================================ */
// gradeColorLocal(hex, profile) — the GL-side mirror of data/realms.js's gradeColor: identical
// saturation -> tint -> contrast math, byte-identical output for the identical (hex, profile) input.
// Accepts a numeric 0xrrggbb color (every GL-layer caller already has one via hexToRGB/THREE.Color) and
// returns a numeric 0xrrggbb. A null/absent profile (or one with a null tint) is a no-op passthrough —
// every call site here degrades to byte-identical pre-unit colors when S.realmProfile is null.
function gradeColorLocal(hex, profile){
  if(!profile) return hex;
  const p = profile;
  const rgb = hexToRGB(hex);
  const sat = (typeof p.sat === "number" && isFinite(p.sat)) ? p.sat : 1;
  const tintAmt = (typeof p.tintAmt === "number" && isFinite(p.tintAmt)) ? p.tintAmt : 0;
  const contrast = (typeof p.contrast === "number" && isFinite(p.contrast)) ? p.contrast : 1;

  const grey = lumaOf(rgb) * 255;
  let r = grey + (rgb.r - grey) * sat;
  let g = grey + (rgb.g - grey) * sat;
  let b = grey + (rgb.b - grey) * sat;
  r = clamp255(r); g = clamp255(g); b = clamp255(b);

  if(tintAmt > 0){
    const t = hexToRGB(p.tint);
    const amt = tintAmt < 0 ? 0 : tintAmt;
    r = clamp255(r + (t.r - r) * amt);
    g = clamp255(g + (t.g - g) * amt);
    b = clamp255(b + (t.b - b) * amt);
  }

  r = clamp255(127.5 + (r - 127.5) * contrast);
  g = clamp255(127.5 + (g - 127.5) * contrast);
  b = clamp255(127.5 + (b - 127.5) * contrast);

  return rgbToHex(r, g, b);
}

// split B5: the BOARD LIGHTING header, LIGHT_PROFILES and LIGHT_DEFAULT_PROFILE moved to
// src/ui/theater-lighting.js. STAGE_AMBIENT_FLOOR stays HERE (below) — it is a LIGHT_TUNABLES seed, and
// B2's law plus dev/verify-light-lab.mjs's scrape set both read that seed set out of THIS file's text.
// STAGE ARENA polish (Adam's G2 mandate, 2026-07-04) — readability floor: the board must never render
// unreadably dark whatever the rolled room light. `dark` profile's own ambient (0.38) is the worst
// case; clamped up to this floor in applyLightProfile below. Profile COLOR and point lights stay
// untouched — this only lifts the AMBIENT INTENSITY number, so the floor is uniform across all 9
// profiles (applied inside the one shared function every profile funnels through) without editing
// LIGHT_PROFILES' authored mood values themselves. Round 3: 0.55 → 0.65 — the round-2 gate judged
// the arena still too dim at 0.55 (the near-black void background is unlit BY DESIGN and dilutes the
// canvas mean, so the lit-surface floor carries the whole readability load).
// docs/DIEGETIC-LIGHT.md L-3 (2026-07-11): dropped ~35% alongside the profile values above, same F2
// ruling — "ambient is only enough to make out figures", not a guaranteed-bright floor. 0.65 -> 0.42.
const STAGE_AMBIENT_FLOOR = 0.42; // was 0.65

// split B5: lightProfileFor + applyLightProfile + the whole ENV-1 (TABLETOP_EXTERIOR_LOOK /
// voidTintForTabletop / applyTabletopExteriorLook) and ENV-1c (CELESTIAL_ARC + its consts) block sat
// here in the monolith and moved to src/ui/theater-lighting.js. LIGHT_TUNABLES + LIGHT_LAB_AUTHORED_BASELINE
// (below) stay HERE and reach that module through its ctx, so every LIGHT_TUNABLES.* read over there is
// the same property on the same object the Light Lab writes through.

// ════════════════════════════════════════════════════════════════════════════════════════════════
// LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — LIGHT_TUNABLES: the ONE mutable indirection seam the
// dev-only light-lab (further down, gated behind ?lightlab=1) writes through. "The consts are const"
// (the unit's own instruction) — every named const this table mirrors stays exactly as authored above;
// nothing here ever reassigns one. Every RENDER call site this unit touches (applyLightProfile, the
// celestial-arc functions, makeGradePass's uniforms, buildPostSuite/updatePostSuiteGrade, the sprite
// emissive-floor material builders, the interior brightness-law consumers) was rewired to read the
// matching LIGHT_TUNABLES.* property INSTEAD OF the bare const name — so an untouched LIGHT_TUNABLES
// (its properties are SEEDED, at declaration time below, straight off the same consts) makes every one
// of those call sites read a value byte-identical to what it read before this unit existed. The lab is
// the ONLY writer; product/game code never assigns into this object after this declaration. Scope is
// deliberately the set LL-1 names explicitly — LIGHT_PROFILES' per-profile key(point)/ambient
// color+intensity, CELESTIAL_ARC's timing/desaturation keyframes, STAGE_AMBIENT_FLOOR + the new
// exposure floor, bloom threshold/strength, the per-realm grade-strength scalers, and the three BW2-4b
// "how sprites react to light" consts (readability floor / dark-corner cap / torch-pool band) — not
// every tunable-shaped number in this file.
const LIGHT_TUNABLES = {
  // Per profile, the full bounded recipe is mutable in preview: ambient plus zero-to-four named
  // lights. It is deep-seeded from compiled locks, never a shared reference back into the frozen
  // registry. This replaces LL-1's one-key-only {pointColor,pointIntensity} shortcut.
  profiles: (() => {
    const out = {};
    for(const key in LIGHT_RECIPE_REGISTRY){
      out[key] = lightRecipeDeepClone(LIGHT_RECIPE_REGISTRY[key]);
    }
    return out;
  })(),
  stageAmbientFloor: LIGHT_LAB_COMPILED_SETTINGS.stageAmbientFloor,
  gradeExposureFloor: LIGHT_LAB_COMPILED_SETTINGS.gradeExposureFloor,
  bloomThreshold: LIGHT_LAB_COMPILED_SETTINGS.bloomThreshold,
  bloomStrength: LIGHT_LAB_COMPILED_SETTINGS.bloomStrength,
  gradeTintScale: LIGHT_LAB_COMPILED_SETTINGS.gradeTintScale,
  gradeTintMax: LIGHT_LAB_COMPILED_SETTINGS.gradeTintMax,
  celestialArc: lightRecipeDeepClone(LIGHT_LAB_COMPILED_SETTINGS.celestialArc),
  // BW2-4b "how sprites react to light" — see ITR_SPRITE_EMISSIVE_FLOOR/ITR_SCENE_AMBIENT/
  // ITR_LIGHT_RENDER_GAIN's own declarations (above) for the full brightness-law derivation.
  spriteEmissiveFloor: LIGHT_LAB_COMPILED_SETTINGS.spriteEmissiveFloor,
  sceneAmbient: LIGHT_LAB_COMPILED_SETTINGS.sceneAmbient,
  lightRenderGain: LIGHT_LAB_COMPILED_SETTINGS.lightRenderGain,
};
const LIGHT_LAB_AUTHORED_BASELINE = lightRecipeDeepFreeze(lightRecipeDeepClone(LIGHT_TUNABLES));

// split B5: the celestial helpers (celestialSunDirFor / celestialMoonDirFor / celestialLerpColor /
// celestialDesaturate / celestialArcFor / applyCelestialArc), the ENV-1B tabletop shadow-caster pass,
// the BW2-4b interior camera-key light and the CL-R2 sprite camera fill all moved to
// src/ui/theater-lighting.js. mountLightProp (below) stayed: it reads the whole-object registry, the
// mutable WHOLE_OBJECT_ENABLED gate and addGroundingBlob — heavy non-lighting readers — and calls
// lightProfileFor through the import block up top.

/* P1' WHOLE-OBJECT WIRING Unit B (docs/P1-WIRING.md §4 Unit B steps 1-3) — lighting-prop anchoring.
   dev/model-qa/creatures/prop-light.js's own ENGINE NOTE reserves this for P1' wiring by name: "the
   scene's point lights should SOURCE at these props." mountLightProp(data, cx, cz) is called from
   setBoard AFTER applyLightProfile's board-half-extent bookkeeping is current but BEFORE
   applyLightProfile itself runs (so the anchor is ready the SAME call the light positions itself) —
   see the actual call-site ordering in setBoard below for why this function is invoked first and
   applyLightProfile reads S.lightPropAnchor a moment later.

   Step 1: resolve "light:<profile>" in the whole-object registry. A profile with no mapping (most of
   LIGHT_PROFILES — only torchlit/lamplit/lavalit/magic-glow carry one, per theater-figures.js's
   registry) clears S.lightPropAnchor to null — applyLightProfile's own guard then falls through to
   the byte-identical fractional-position math (§4 step 3's "no registry mapping -> no prop, light
   behavior byte-identical"). The gate off (WHOLE_OBJECT_ENABLED false) is the same no-op.
   The prop's DESIRED position is the profile's own points[0].pos fraction × boardHalfX/Z (the EXACT
   math applyLightProfile already uses for that same point) — then SNAPPED to the nearest real tile
   center in `data.tiles` (deterministic: a plain nearest-distance scan, ties broken by array order,
   never Math.random) so the prop always sits ON a real floor tile, never floating over a gap. "not
   occupied by a unit spawn zone": S.lastUnits (the last setUnits() payload, if any — best-effort;
   setBoard can run before any units exist yet) excludes a tile center within TILE_SIZE of any unit's
   own x/z, preferring the next-nearest tile instead; if EVERY tile is unit-occupied (a tiny 1-tile
   board with a unit standing on it) the nearest tile wins anyway — a prop-on-top-of-a-unit's-own-tile
   is a rare visual nit, never a missing-prop bug.
   Step 2 (the actual mount): builds the whole-object prop group at that snapped position and returns
   {x,y,z} for the FLAME/GLOW head (propX/propZ at ground, propY = entry.flameY * WHOLE_OBJECT_SCALE)
   for applyLightProfile to source its point light at. Builder not yet loaded / geometry throws -> null
   anchor, prop skipped, light keeps its default fractional position (§4 step 3's "never a dark board"
   guard) — the SAME miss-chain every other whole-object call site in this file already follows. */
function mountLightProp(data, cx, cz){
  S.lightPropAnchor = null;
  if(!WHOLE_OBJECT_ENABLED) return;
  const profileKey = (data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE;
  const wKey = "light:" + profileKey;
  const entry = resolveWholeObject(wKey);
  if(!entry || typeof entry.build !== "function") return; // no mapping for this profile, or not loaded yet
  const profile = lightProfileFor(profileKey);
  const p0 = profile.points[0];
  if(!p0) return; // a profile with zero points (e.g. "overcast") has nothing to anchor

  const hx = S.boardHalfX || 4, hz = S.boardHalfZ || 4;
  const desiredX = (p0.pos.x || 0) * hx, desiredZ = (p0.pos.z || 0) * hz;
  const tiles = data.tiles || [];
  if(!tiles.length) return; // no tiles to snap to (an empty/malformed board) — skip the prop cleanly

  const unitPositions = (S.lastUnits && S.lastUnits.units) || [];
  const isUnitOccupied = (wx, wz) => unitPositions.some(u => {
    const ux = (u.x - cx), uz = (u.z - cz);
    return Math.abs(ux - wx) < TILE_SIZE && Math.abs(uz - wz) < TILE_SIZE;
  });

  let best = null, bestDist = Infinity, bestOccupied = null, bestOccupiedDist = Infinity;
  tiles.forEach(t => {
    const wx = t.x - cx, wz = t.z - cz;
    const d = (wx - desiredX) * (wx - desiredX) + (wz - desiredZ) * (wz - desiredZ);
    if(isUnitOccupied(wx, wz)){
      if(d < bestOccupiedDist){ bestOccupiedDist = d; bestOccupied = { x: wx, z: wz }; }
    } else if(d < bestDist){
      bestDist = d; best = { x: wx, z: wz };
    }
  });
  const snapped = best || bestOccupied; // every tile occupied (tiny board) -> the nearest occupied one anyway
  if(!snapped) return;

  const geo = wholeObjectGeometryFor(wKey, false);
  if(!geo) return; // geometry build threw — skip the prop, light keeps its default position
  const mats = wholeObjectMaterialsFor(entry);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mats));
  g.scale.setScalar(WHOLE_OBJECT_SCALE);
  g.position.set(snapped.x, 0, snapped.z);
  S.propGroup.add(g);
  addGroundingBlob(S.propGroup, snapped.x, snapped.z, -0.495, 0.42 * WHOLE_OBJECT_SCALE);

  // Unit B step 2: the flame/glow head world position — entry.flameY is the prop's OWN local-frame
  // height (read directly off prop-light.js's authored geometry, theater-figures.js's registry
  // comment), scaled by the SAME WHOLE_OBJECT_SCALE the prop group itself just applied.
  const flameY = (entry.flameY != null ? entry.flameY : 1.4) * WHOLE_OBJECT_SCALE;
  S.lightPropAnchor = { x: snapped.x, y: flameY, z: snapped.z };
}

// split B5: the FLICKER scheduler (the §2 flicker header, INTERIOR_LIGHT_FLICKER_AMPLITUDE, the
// lightFlicker* pure math, startLightFlicker's own requestAnimationFrame loop and stopLightFlicker)
// moved WHOLE and ALONE to src/ui/theater-lighting.js. It is still its own scheduler — separate from
// the dirty-frame loop, the verb tween loop and the mote loop, exactly as the brief's protected
// contracts require. Nothing was unified. retire() below still calls stopLightFlicker through the
// import block, so there is still ONE true teardown point.

/* §4 texture hooks. TextureLoader is async by nature; loaded textures land in S.textures keyed by
   semantic name and get nearest-filtered the moment they resolve. A failed/missing manifest fetch or
   a failed individual image load is swallowed — palette-only stays correct with zero textures loaded,
   which is exactly the "degrade silently to palette-only if absent" contract. */
const textureLoader = new THREE.TextureLoader();

/* `manifest` is the flat {semanticKey: path} shape (§4's public contract); non-string/falsy entries
   and a reserved "_comment"/"alternates" style metadata key (the real textures-psx manifest carries
   both — see its own top-level fields) are silently skipped rather than attempted as an image load,
   same "never throw, degrade to palette-only for that key" discipline as a failed fetch.
   `baseUrl`, when given, resolves each relative path against it (used by the internal default-fetch
   path below, since the manifest's own paths are relative to assets/textures-psx/manifest.json's own
   location, not the calling page's document base); omitted for the public setTextures() call, whose
   contract is "manifest is a flat semantic-key manifest shape {'stone':path,...}" with paths the
   CALLER is responsible for making page-resolvable (a caller-supplied absolute/page-relative path is
   used as-is, matching how TextureLoader.load already behaves without this wrapper). */
// reserved manifest keys that are metadata, not a semantic-key->path entry — the real textures-psx
// manifest (a parallel unit's own file, outside this unit's control) carries both alongside its
// semantic keys, so this file can't assume "every key is a texture" even though the §4 contract
// describes a "flat {semanticKey:path} manifest shape". "alternates" is an object anyway (fails the
// typeof-string check below on its own) but "_comment" is a plain string and would otherwise be
// attempted as an image path — hence this explicit skip list rather than relying on shape alone.
const TEXTURE_MANIFEST_RESERVED_KEYS = new Set(["_comment", "alternates"]);

function loadTextureManifest(manifest, baseUrl){
  if(!manifest || typeof manifest !== "object") return;
  Object.keys(manifest).forEach(key => {
    if(TEXTURE_MANIFEST_RESERVED_KEYS.has(key)) return;
    const path = manifest[key];
    if(!path || typeof path !== "string") return; // skips non-path metadata (e.g. a nested object)
    if(S.textures[key]) return; // already loaded/loading — setTextures never re-fetches a known key
    let resolved = path;
    if(baseUrl){
      try{ resolved = new URL(path, baseUrl).href; }catch(e){ resolved = path; }
    }
    S.textures[key] = "pending";
    textureLoader.load(
      resolved,
      (tex) => { S.textures[key] = nearestify(tex); markDirty(); },
      undefined,
      () => { delete S.textures[key]; } // load failure -> silently forget the key, palette wins
    );
  });
}

function setTextures(manifest){
  // THEATER-NEXT §3.2 — a texture swap tints tiles on the next setBoard() (its own doc contract);
  // null S.boardKey so that next call isn't skipped as a false-identical payload.
  S.boardKey = null;
  loadTextureManifest(manifest);
}

function fetchDefaultTextureManifest(){
  // best-effort GET of the parallel asset unit's manifest, resolved relative to THIS MODULE's own
  // URL (import.meta.url) rather than the calling page's location — a plain relative fetch() path
  // resolves against the document base, which breaks the moment this module is mounted from a page
  // at a different path depth than genesis.html's repo root (e.g. dev/theater-preview.html sits one
  // level down, so a bare "assets/..." 404s at dev/assets/...). theater-boot.js lives at
  // src/ui/theater-boot.js, so assets/textures-psx/ is two levels up from THIS file regardless of
  // which page imported it. No throw, no console.error on a 404 — that's the expected common case
  // until the textures-psx unit lands (or when a caller sits at yet another path depth).
  try{
    const manifestUrl = new URL("../../assets/textures-psx/manifest.json", import.meta.url).href;
    fetch(manifestUrl, { cache: "no-store" })
      .then(r => (r && r.ok) ? r.json() : null)
      .then(json => { if(json) loadTextureManifest(json, manifestUrl); })
      .catch(() => {});
  }catch(e){ /* fetch unavailable or blocked — palette-only baseline, no surfaced error */ }
}

/* resolves the material(s) for one tile column: a texture (if loaded + kind-mapped) tinted by the
   tile's own palette color, else a procedural floor-material texture (FLOOR-TEXTURES.md §3) when the
   tile carries `t.material`, else the flat-color top/side pair (T1's baseline). Precedence is exactly
   that order — a real manifest-loaded texture always outranks the procedural one (§4/§6 decision 4:
   "a future real-art tileset drops in over the procedural baseline, swap-cheap"); palette-only stays
   the final fallback so the no-asset baseline never regresses. Returns the 6-entry BoxGeometry
   material array (index 2 = +y = top face, §1 rule 2). */
function tileMaterialsFor(t, topColorCache, sideColorCache, colorFor){
  const texKey = TILE_KIND_TEXTURE_KEY[t.kind];
  const tex = texKey && S.textures[texKey];
  const hasTex = tex && tex !== "pending";
  const topColor = colorFor(t.tint || "#4a5a3c", 1.35, topColorCache);
  const sideColor = colorFor(t.tint || "#4a5a3c", 0.6, sideColorCache);
  let topMat;
  if(hasTex){
    topMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ map: tex, color: topColor })); // texture tinted by palette color
  } else if(t.material){
    // t.baseTint (stamped by theaterBoardBuild only on realm-surface floor/elevated tiles) flips the
    // canvas into realm-led mixing — the authored realm color carries the floor, the material recipe
    // contributes pattern + a 12% hue nudge (Adam 2026-07-08: red rock reads red, not stock gray).
    const floorTex = buildFloorCanvasTexture(t.material, t.tint || "#4a5a3c", (t.x || 0) + ":" + (t.z || 0), !!t.baseTint);
    // near-neutral mesh color so the canvas's OWN baked color shows through (material-led or
    // realm-led — either way the hue lives in the texture); tinting by the full palette color here
    // would re-collapse every material back to one hue — the bug this replaces.
    topMat = applyPsxShaderTweaks(floorTex
      ? new THREE.MeshLambertMaterial({ map: floorTex, color: 0xcfcfcf })
      : new THREE.MeshLambertMaterial({ color: topColor })); // buildFloorCanvasTexture failure -> flat color, never throws
  } else {
    topMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color: topColor }));
  }
  // ENV-3 (docs/ENV-EXTERIOR-WAVE.md "The town tray") — ADDITIVE, kind-gated: a settlement building
  // mass (theaterSettlementBoardBuild, theater-data.js — `kind:"building"` did not exist before this
  // unit) textures its SIDE faces from the SAME material canvas the top already uses, so a raised
  // 3x3 patch of building tiles reads as a facade, not a flat-tinted box — the FACED-BOX construction
  // class's "wears existing textures per face" (GRAPHICS-ENGINE.md §H), via the EXISTING procedural
  // material painter (buildFloorCanvasTexture), no new art. Every OTHER kind (floor/elevated/hazard/
  // water) can never satisfy `t.kind==="building"` — this branch is unreachable for them, so their own
  // sideMat stays the exact flat-tinted MeshLambertMaterial below, byte-unchanged.
  let sideMat;
  if(t.kind === "building" && t.material){
    const wallTex = buildFloorCanvasTexture(t.material, t.tint || "#4a5a3c", (t.x || 0) + ":" + (t.z || 0) + ":wall", false);
    sideMat = applyPsxShaderTweaks(wallTex
      ? new THREE.MeshLambertMaterial({ map: wallTex, color: sideColor })
      : new THREE.MeshLambertMaterial({ color: sideColor })); // canvas failure -> flat color, never throws
  } else {
    sideMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color: sideColor })); // sides
                                                                           // stay flat-tinted (§1 rule 2
                                                                           // is a TOP-face trick; texturing
                                                                           // sides too would wash out the
                                                                           // top/side contrast) for every
                                                                           // OTHER tile kind
  }
  return [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
}

/* BEAUTY-WAVE-2 BW2-0 (THE CRISP CHANNEL): sizes the renderer's DRAWING BUFFER. Two modes, chosen by
   S.psxEnabled (module state; false by default everywhere — mount()'s opts.psx escape hatch is the
   only thing that ever flips it true, a dev/nostalgia toggle, never the shipped default):
     - CLEAN (psxEnabled false, the default): drawing buffer = CSS box x min(devicePixelRatio, 2) — a
       normal crisp HiDPI-aware canvas, `image-rendering: auto`. The dpr cap keeps a 3x Retina display
       from tripling the render cost for no visible gain past 2x.
     - RETRO (psxEnabled true, opt-in only): drawing buffer = CSS box x PSX_RES_SCALE (1/3) — the
       original T1.5 low-res-then-CSS-stretch trick, `image-rendering: pixelated`. This is the ONLY
       place that still produces the low-res squeeze; nothing else in the file downsamples the buffer.
   `renderer.setSize(w, h, false)` — the `false` updateStyle arg is the whole trick either way: it
   sizes the drawing buffer to w/h without also writing that size back onto the canvas's CSS box, so
   the CSS block below is what actually controls the on-screen size. */
function applyPsxCanvasSize(renderer, canvas, cssW, cssH){
  const dprCap = Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2);
  const scale = S.psxEnabled ? PSX_RES_SCALE : dprCap;
  const drawW = Math.max(1, Math.round(cssW * scale));
  const drawH = Math.max(1, Math.round(cssH * scale));
  renderer.setSize(drawW, drawH, false);
  // BEAUTY-WAVE-3 BW3-0 — keep the composer's two internal WebGLRenderTargets sized to the SAME
  // drawing-buffer resolution as the renderer itself, on every resize (window resize, PSX-scale
  // toggle) — not just at mount() time. Guarded on S.composer existing: this function also runs once
  // from mount() itself, BEFORE the composer is constructed (mount() sizes the canvas first, then
  // builds the composer off the now-correct renderer.getSize()), so this is a no-op that one time.
  if(S.composer) S.composer.setSize(drawW, drawH);
  // BEAUTY-WAVE-3 THE POST SUITE: keep the DoF aspect uniform, grade resolution, and half-res bloom
  // chain sized to the same drawing buffer on every resize (no-op when no suite is built yet).
  syncPostSuiteResolution();
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.style.imageRendering = S.psxEnabled ? "pixelated" : "auto";
}

/* T1.5 §4 texture hooks: apply NearestFilter + no mipmap smoothing to any texture the moment it
   enters the scene, whatever the entry point (setTextures' loader callback AND any future loader) —
   centralizing this one call keeps "every texture is nearest-filtered" a single source of truth
   instead of a convention every call site has to remember. */
function nearestify(tex){
  if(!tex) return tex;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* ============================================================================
   STRETCH (attempted after the mandatory items were green, per the build order): ordered-dither +
   vertex-snap, both via material.onBeforeCompile fragment/vertex injection, gated behind
   PSX_DITHER_ENABLED / PSX_VERTEX_SNAP_ENABLED so a later pass can flip them independently.
   Applied through ONE shared helper (applyPsxShaderTweaks) so every MeshLambertMaterial this file
   creates (tiles, props, fallback figures) gets both consistently — no call site has to remember.
   ============================================================================ */

/* ordered-dither: a classic 4x4 Bayer matrix, sampled by SCREEN-space pixel coordinate (gl_FragCoord)
   so the dither pattern is stable in screen space (not swimming with the object) — the standard PSX/
   retro dithering trick, applied as a tiny per-channel threshold nudge just before the fragment's
   final opaque output. Injected right before <opaque_fragment> so it dithers the LIT color (post
   lighting), matching how real PSX titles dither the final framebuffer write. */
const DITHER_GLSL = `
  #ifdef PSX_DITHER
  {
    const float bayer4x4[16] = float[16](
      0.0,  8.0,  2.0, 10.0,
      12.0, 4.0, 14.0,  6.0,
      3.0, 11.0,  1.0,  9.0,
      15.0, 7.0, 13.0,  5.0
    );
    int dx = int(mod(gl_FragCoord.x, 4.0));
    int dy = int(mod(gl_FragCoord.y, 4.0));
    float threshold = (bayer4x4[dy * 4 + dx] / 16.0 - 0.5) * (1.0 / ${PSX_DITHER_AMPLITUDE.toFixed(1)});
    outgoingLight += threshold;
  }
  #endif
`;

/* vertex-snap: quantizes the vertex's CLIP-SPACE xy to a coarse grid (relative to w, so it holds
   under perspective/ortho alike) before rasterization — the "wobbling low-poly PSX vertex" look,
   applied AFTER <project_vertex> (which is what actually writes gl_Position) so it snaps the final
   projected position, not an intermediate. */
const VERTEX_SNAP_GLSL = `
  #ifdef PSX_VERTEX_SNAP
  {
    float snapGrid = ${PSX_VERTEX_SNAP_GRID.toFixed(1)};
    vec4 snapped = gl_Position;
    snapped.xy = round((snapped.xy / snapped.w) * snapGrid) / snapGrid * snapped.w;
    gl_Position = snapped;
  }
  #endif
`;

// FIGURINE AO (Adam: "AO on the figurine models, not the floor tiles"): a cheap per-fragment
// darkening toward each model's BASE (object-space y) so figures read occluded/grounded and their
// lower forms recede — the low-poly analog of ambient occlusion, no extra pass, no postprocess.
// Applied ONLY to figure/model materials (figureMaterialFor + the whole-object material funnel);
// tiles never pass figureAO. FIG_AO_FLOOR = darkest multiplier at the base; FIG_AO_RANGE = the
// object-space height over which it lifts back to full light.
const FIG_AO_FLOOR = 0.52, FIG_AO_RANGE = 1.05;
// DUNGEON-GRAPH.md U3 render-quality study card (b/c/e/f variants, dev/battle-gate/capture-interior-
// study.mjs): quantized/banded lighting — floors the lit color to a small number of discrete steps,
// the classic PS1-era "no smooth gradient" read (mirrors DITHER_GLSL's own injection pattern one
// section up, applied at the SAME <opaque_fragment> seam). Study-card-only today (no product caller
// sets opts.banded — window.Theater.setInteriorVariant, added for the study rig, is the only path
// that reaches it) — a deliberately narrow, reversible toggle until Adam's taste-gate picks a look.
const INTERIOR_BANDED_STEPS = 4;
function bandedGlslFor(steps){
  const s = (typeof steps === "number" && steps >= 2 && steps <= 16) ? steps : INTERIOR_BANDED_STEPS;
  return `
  #ifdef INTERIOR_BANDED
  outgoingLight = floor(outgoingLight * ${s.toFixed(1)} + 0.5) / ${s.toFixed(1)};
  #endif
`;
}
const BANDED_GLSL = bandedGlslFor(INTERIOR_BANDED_STEPS);
function applyPsxShaderTweaks(material, opts){
  const figureAO = !!(opts && opts.figureAO);
  const banded = !!(opts && opts.banded);
  // baseAO (Adam, AO card round 2): the contact gradient belongs on the VERTICAL surfaces too —
  // walls/pillars darken at their base and fade up (unit-box local Y, pre-instance-scale, so the
  // gradient rides every prism proportionally). {floor: darkness at the base, range: fraction of
  // local height the fade climbs}.
  const baseAO = opts && opts.baseAO;
  // VP0/GRAPHICS-ENGINE law 2 (docs/BEAUTY-WAVE.md): callers building the interior channel's WORLD
  // surfaces (interiorBuildInstancedMesh's floor/wall/doorframe/pillar materials — the only call
  // site that passes this) tag opts.worldSurface. The dither/snap flags become the AND of the global
  // stretch flags with WORLD_PSX_ENABLED for those materials only — every other call site (tabletop
  // tiles/props/figures) reads PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED exactly as before, untouched.
  const worldSurface = !!(opts && opts.worldSurface);
  // CL-R3 cast-shadow contact registration. THREE's automatic shadow-side rule writes the BACK
  // faces of ordinary front-sided materials into the shadow map. That is a useful generic acne
  // guard, but on thick modular architecture it moves the caster depth behind the visible plane:
  // two genuinely flush/interpenetrating blocks then acquire a bright PCF fringe at their contact.
  // Solid world surfaces cast from their visible/front faces instead. The celestial recipes carry
  // the small negative depth bias that this requires to avoid front-face self-shadow striping.
  // Figures, sprites, emitters, and translucent overlays do not opt into worldSurface and retain
  // THREE's normal automatic rule.
  if(worldSurface) material.shadowSide = THREE.FrontSide;
  // worldPsxOverride (study-rig ONLY — dev/battle-gate/capture-two-flag-card.mjs's world-PSX on/off
  // cells): interiorBuildInstancedMesh threads S.interiorVariant.worldPsx through here so the card
  // can sweep both states of the flag in one page load without touching the module const. No product
  // caller ever sets this — it degrades to the module default WORLD_PSX_ENABLED everywhere else.
  const worldPsxOn = (opts && typeof opts.worldPsxOverride === "boolean") ? opts.worldPsxOverride : WORLD_PSX_ENABLED;
  const ditherOn = PSX_DITHER_ENABLED && (!worldSurface || worldPsxOn);
  const snapOn = PSX_VERTEX_SNAP_ENABLED && (!worldSurface || worldPsxOn);
  // worldSurface materials always fall through to the userData tagging at the bottom (even with
  // world-PSX off and no other tweak active) — psxApplied/psxWorldSurface record "this is a WORLD
  // surface material" (the sprite-purity distinction dev/verify-dungeon-interior.mjs's harness checks),
  // which must stay stable regardless of WORLD_PSX_ENABLED's current value, or a two-flag-card cell
  // with world-PSX off would look mis-tagged as if it never passed through this function at all.
  if(!ditherOn && !snapOn && !figureAO && !banded && !baseAO && !worldSurface) return material;
  const priorHook = material.onBeforeCompile;
  // three.js caches compiled programs keyed (in part) on onBeforeCompile.toString() — every call
  // here shares the SAME closure text, so materials whose injected CONSTANTS differ (aoFactor,
  // bandedSteps) would silently reuse the first-compiled program (the AO-ladder-looks-identical
  // bug). An explicit per-options cache key forces a distinct program per variant.
  material.customProgramCacheKey = function(){
    return "psx:" + JSON.stringify({ f: figureAO, b: banded, s: opts && opts.bandedSteps || 0,
      a: baseAO ? [baseAO.floor, baseAO.range] : 0, d: ditherOn, v: snapOn });
  };
  material.onBeforeCompile = (shader, renderer) => {
    if(typeof priorHook === "function") priorHook(shader, renderer);
    if(banded){
      shader.fragmentShader = "#define INTERIOR_BANDED\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        bandedGlslFor(opts && opts.bandedSteps) + "\n  #include <opaque_fragment>"
      );
    }
    if(figureAO){
      shader.vertexShader = "varying float vFigY;\n" + shader.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n  vFigY = position.y;"
      );
      shader.fragmentShader = "varying float vFigY;\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        "  outgoingLight *= mix(" + FIG_AO_FLOOR.toFixed(2) + ", 1.0, clamp(vFigY / " + FIG_AO_RANGE.toFixed(2) + ", 0.0, 1.0));\n  #include <opaque_fragment>"
      );
    }
    if(baseAO){
      const aoFloor = (typeof baseAO.floor === "number" ? baseAO.floor : 0.45).toFixed(2);
      const aoRange = (typeof baseAO.range === "number" ? baseAO.range : 0.45).toFixed(2);
      shader.vertexShader = "varying float vBaseY;\n" + shader.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n  vBaseY = position.y + 0.5;"
      );
      shader.fragmentShader = "varying float vBaseY;\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        "  outgoingLight *= mix(" + aoFloor + ", 1.0, clamp(vBaseY / " + aoRange + ", 0.0, 1.0));\n  #include <opaque_fragment>"
      );
    }
    if(ditherOn){
      shader.fragmentShader = "#define PSX_DITHER\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        DITHER_GLSL + "\n  #include <opaque_fragment>"
      );
    }
    if(snapOn){
      shader.vertexShader = "#define PSX_VERTEX_SNAP\n" + shader.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n  " + VERTEX_SNAP_GLSL
      );
    }
  };
  // three.js keys its program cache partly on a hash of onBeforeCompile.toString() — since every
  // material here gets the SAME injected function body (only priorHook differs, and none of this
  // file's materials set one), they naturally share one compiled program. No extra cache-key work
  // needed for T1.5's usage (a future per-material custom hook would need shader.customProgramCacheKey).
  // figureAO materials inject a DIFFERENT shader body than tiles, but the onBeforeCompile.toString()
  // is identical (only the captured `figureAO` closure var differs) — so give them a distinct cache
  // key or three would share one program between AO and non-AO materials (the wrong one wins).
  // both figureAO and banded inject shader text that isn't reflected in onBeforeCompile.toString()
  // (only the captured boolean's VALUE differs, not the source text) — three's cache keying by that
  // string would otherwise share ONE compiled program across e.g. a banded and a non-banded material,
  // silently applying the wrong one. Distinct keys per active flag combo, same discipline figureAO
  // already established.
  if(figureAO || banded){
    material.customProgramCacheKey = () => "psx|" + (figureAO ? "figAO" : "") + (banded ? "banded" : "")
      + (ditherOn ? "d" : "") + (snapOn ? "v" : "");
  }
  // TESTABILITY flags only (no runtime behavior reads them) — pairs with buildSpriteBillboard's
  // userData.psxExempt so dev/verify-dungeon-interior.mjs's sprite-purity check can assert wall/tile
  // materials actually got the PSX onBeforeCompile injection while billboard materials never do.
  // psxWorldDither/psxWorldSnap record the RESOLVED per-material flags (post worldSurface gating) so
  // a harness can assert "world-PSX off" actually dropped the injection on interior world materials
  // without needing to re-derive the WORLD_PSX_ENABLED/PSX_*_ENABLED AND logic itself.
  material.userData.psxApplied = true;
  material.userData.psxWorldSurface = worldSurface;
  material.userData.shadowContactMode = worldSurface ? "front-face" : "automatic";
  material.userData.psxDitherResolved = ditherOn;
  material.userData.psxSnapResolved = snapOn;
  return material;
}

function mount(el, opts){
  if(!el || !supportsWebGL()) return false;
  retire(); // idempotent: a re-mount tears down any prior instance first
  const priorTextures = S.textures; // T1.5: setTextures may be called before mount() — preserve any
                                     // already-loaded/loading cache across the retire()->fresh-state reset.
  S = createTheaterState();
  clayRoomSyncState(S); // split B1: the clay module mirrors the live state record
  lightLabSyncState(S); // split B2: same law for the lab
  postSyncState(S);     // split B4: same law for the post suite (it reads AND writes S.postSuite*)
  lightingSyncState(S); // split B5: same law for the lighting family + the flicker scheduler
  motesSyncState(S);    // split B5: same law for the mote field + its own drift scheduler
  cameraSyncState(S);   // split B6: same law for the camera/fit/shot family (it reads AND writes S)
  occlusionSyncState(S);// split B6: same law for the occlusion fade state (S.occlusionFadeState + S.tweens)
  standeeMountSyncState(S); // split B7: same law for the standee base/contact family (S.standeeCollision*)
  spritesSyncState(S);  // split B7: same law for the sprite/billboard family (replay + the facing pass)
  overlaysSyncState(S); // split B7: same law for the overlay family (rings/effects/floaters + S.tweens)
  dressingSyncState(S); // split B8: same law for the dressing/props family (the async real-art replay reads S.mounted/S.lastBoard)
  tabletopSyncState(S);        // split B9: same law for the flat tabletop realizer (setBoard/setUnits read AND write S)
  interiorRealizeSyncState(S); // split B9: same law for the interior realizer (every phase reads AND writes S)
  if(priorTextures) S.textures = priorTextures;
  // BEAUTY-WAVE-2 BW2-0: default is now CLEAN (S.psxEnabled false, createTheaterState's own default),
  // so the escape hatch is symmetric — `opts.psx === true` is the dev/nostalgia toggle that turns the
  // retro low-res buffer ON; `opts.psx === false` is a no-op today (kept so any existing caller that
  // still explicitly passes `psx:false` degrades to the identical byte-for-byte clean behavior it
  // already got, never a silent regression to worry about at either call site).
  if(opts && typeof opts.psx === "boolean") S.psxEnabled = opts.psx;

  const width = el.clientWidth || 480;
  const height = el.clientHeight || Math.round(width * (9 / 16));

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  // antialias OFF: PSX authenticity (T1's antialias:true fought the low-res/pixelated read) — the
  // low internal resolution + pixelated upscale IS the texture, smoothing it defeats the point.
  renderer.setClearColor(VOID_BG, 1);
  // ENV-1B (2026-07-14): §2's old "no shadow maps — blob quads only" ruling is RETIRED. It was a
  // 2026-07-07 pre-alpha placeholder decision, never an Adam ruling — his actual north star
  // (docs/DESIGN.md, 2026-07-10) calls for "soft real lighting + cast shadows" on every channel, AO
  // staying off specifically BECAUSE "real shadows carry contact darkness." The interior channel has
  // carried real shadow-mapping since DUNGEON-GRAPH.md U3 (setInteriorBoard, ~line 9185); this default
  // now matches it so the tabletop/exterior channel (setBoard) gets the same treatment. Type left at
  // three's default (PCFShadowMap) — neither channel has ever set renderer.shadowMap.type, so this is
  // a byte-identical shadow FILTER across both, only the on/off flag changes. Blob quads (below) stay:
  // they are the AO-substitute contact-darkness grounding Adam's own ruling calls for, orthogonal to a
  // real cast shadow, not a competing "no shadow maps" holdover.
  renderer.shadowMap.enabled = true;
  // CL-R3 contact diagnosis: make the chosen sharp filter explicit. PCFSoft widened the erroneous
  // contact fringe into a glow and Basic preserved hard stair-step aliasing; ordinary PCF at the
  // celestial profiles' 2048 lock was the bounded setting that reduced the quantization fringe
  // without erasing cast-shadow structure.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  el.innerHTML = "";
  el.appendChild(renderer.domElement);
  applyPsxCanvasSize(renderer, renderer.domElement, width, height);

  // BEAUTY-WAVE VP5 (docs/BEAUTY-WAVE.md §VP5, item 3) — a persistent DOM overlay for damage
  // floaters, sibling to the canvas inside the SAME host `el` so it re-parents alongside it via
  // reattach() below (the host's innerHTML gets replaced wholesale on every combat re-render —
  // see reattach()'s own header comment — so this div must survive the same way the canvas does,
  // not be re-created from a template string that would restart/duplicate an in-flight fade).
  const floaterEl = document.createElement("div");
  floaterEl.className = "theater-floater-layer";
  floaterEl.setAttribute("aria-hidden", "true"); // decorative only — the prose twin carries the words
  el.appendChild(floaterEl);
  S.floaterEl = floaterEl;

  // BEAUTY-WAVE-4.md MF-2 item 4 (ROOM TRANSITION CROSSFADE) — a persistent screen-space overlay,
  // sibling to the canvas/floaterEl (same re-parent-on-reattach discipline as VP5's floaterEl just
  // above — see reattach()'s own header). Opacity-only, starts fully transparent; setInteriorBoard's
  // real board swap snaps it opaque BEFORE the synchronous rebuild and fades it back out AFTER (see
  // that function's own MF-2 comment for why a single-threaded rebuild needs the opaque snap rather
  // than a tweened fade-in).
  const transitionEl = document.createElement("div");
  transitionEl.className = "theater-transition-layer";
  transitionEl.setAttribute("aria-hidden", "true");
  el.appendChild(transitionEl);
  S.transitionEl = transitionEl;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(VOID_BG);
  // §2 item: scene fog, near void-black, distance-tuned by placeCamera() (proportional to the fitted
  // camera distance) so the far board edge just softens rather than hard-clipping into the void.
  scene.fog = new THREE.Fog(VOID_BG, FOG_NEAR, FOG_FAR);

  const aspect = width / Math.max(1, height);
  const viewSize = 10;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 100
  );
  // VP0/GRAPHICS-ENGINE law 2b (docs/BEAUTY-WAVE.md): a SECOND camera, PerspectiveCamera at
  // INTERIOR_CAM_FOV_DEG (~20°), built alongside the ortho one at mount() so the interior channel
  // can flip to it (INTERIOR_CAM_MODE) without ever touching the tabletop's own camera object — the
  // tabletop channel (setBoard) always assigns S.camera = S.orthoCamera regardless of this flag; only
  // setInteriorBoard reads INTERIOR_CAM_MODE. placeCamera() below branches on S.camera.isPerspectiveCamera
  // (three.js's own type flag) rather than a separate mode variable, so whichever camera object is
  // currently assigned to S.camera is always the one placeCamera fits/positions.
  const perspCamera = new THREE.PerspectiveCamera(INTERIOR_CAM_FOV_DEG, aspect, 0.1, 100);

  // BOARD LIGHTING: the key DirectionalLight stays a soft, fixed fill (keeps every Lambert face from
  // going fully flat/unlit on the shadowed side of a box — it's not the profile's job to replace basic
  // 3D modeling, only to color/mood the scene) — dimmer than the T1 baseline (0.55 -> 0.3) now that the
  // per-profile ambient+points below carry most of the mood. ambient/points themselves are NOT created
  // here — applyLightProfile (called once below with the mount-time default, and again on every
  // setBoard) owns their full lifecycle so mount() and setBoard() never duplicate that bookkeeping.
  // SHAPE-WAVE UNIT 4: the key fill was 0.3 — too dim to let the new per-material texel programs (bone/
  // plate/scale/fur, L18) READ; a skeleton's bone-white albedo rendered near-black on any face angled
  // off the key, so "the skeleton must read bone" failed purely to under-exposure. Raised to 0.72 (a
  // neutral white fill, NOT a per-profile mood light — it only guarantees a figure's own albedo/material
  // is visible, the per-profile ambient/points still own the SCENE color/mood). Positioned toward the
  // default camera's +x/+z quadrant so the faces the camera sees are the lit ones.
  const key = new THREE.DirectionalLight(0xffffff, 0.72);
  key.position.set(5, 9, 7);
  scene.add(key);
  S.keyLight = key;
  // a soft opposite FILL so the shadowed side never crushes to pure black (the material programs read
  // on the shadowed faces too, just dimmer) — low intensity, from the anti-key direction.
  const fill = new THREE.DirectionalLight(0xffffff, 0.22);
  fill.position.set(-4, 4, -5);
  scene.add(fill);
  S.fillLight = fill;

  // GRAPHICS-ENGINE.md GR3 LIGHT RIG LAW ("one soft key — hemisphere or low-intensity directional,
  // subtle warm/cool split"): a single soft HemisphereLight, added ONCE here at mount() so BOTH render
  // channels (the flat standing table via setBoard, the volumetric interior tray via setInteriorBoard)
  // share the identical rig by construction — neither board-building function ever touches it, so
  // there is no per-channel wiring to drift out of parity (GR3's own "tabletop parity pass" ruling).
  // Warm-sky/cool-ground split, LOW intensity by design — the scene's own torches/lamps (interior
  // PointLights, applyLightProfile's ambient+points on the table) stay the actual drama; this only
  // keeps the unlit side of a Lambert face from reading pure-black. THREE.HemisphereLight can never
  // cast a shadow (no .castShadow on this light type at all) — adding it here is incapable of
  // reopening the "no shadow maps" tabletop ruling (§2) by itself, by construction, not by convention.
  const hemi = new THREE.HemisphereLight(HEMI_SKY, HEMI_GROUND, HEMI_INTENSITY_DEFAULT);
  scene.add(hemi);
  S.hemiLight = hemi;

  const tileGroup = new THREE.Group();
  const propGroup = new THREE.Group();
  const unitGroup = new THREE.Group();
  const shadowGroup = new THREE.Group();
  const fxGroup = new THREE.Group();     // T3: verb/FX primitives (theater-verbs.js), swept like any other group
  // DUNGEON-GRAPH.md U3: the volumetric interior board's own group (InstancedMesh floor/wall/doorframe/
  // pillar) — a peer to tileGroup, never reused for it (materially different geometry shape, see
  // setInteriorBoard's own header comment). Swept independently so a combat board (setBoard) and an
  // interior tray (setInteriorBoard) never leave each other's meshes on stage.
  const interiorGroup = new THREE.Group();
  scene.add(tileGroup, propGroup, shadowGroup, unitGroup, fxGroup, interiorGroup);

  S.mounted = true;
  S.el = el;
  S.renderer = renderer;
  S.scene = scene;
  S.camera = camera;
  S.orthoCamera = camera;
  S.perspCamera = perspCamera;
  // BEAUTY-WAVE-3 BW3-0 — THE COMPOSER SEAM: built after the renderer's real drawing-buffer size is
  // set (applyPsxCanvasSize, above) so EffectComposer's own constructor (which reads
  // renderer.getSize() to size its two internal WebGLRenderTargets) matches the actual resolution
  // from frame 1, not a stale default. Zero passes added here — renderTheaterFrame (below
  // scheduleRender) falls back to direct rendering until BW3-2/3/6 add a real pass.
  S.composer = new EffectComposer(renderer);
  S.tileGroup = tileGroup;
  S.propGroup = propGroup;
  S.unitGroup = unitGroup;
  S.shadowGroup = shadowGroup;
  S.fxGroup = fxGroup;
  S.interiorGroup = interiorGroup;
  S.interiorMeshCount = 0;
  S.interiorDressingCount = 0;
  S.interiorDressingWorldPositions = [];
  // D4 — per-sourceRef door state from the PREVIOUS render, reset on a fresh mount() same as
  // S.occlusionFadeState below (a brand-new session must never inherit a stale sourceRef's state).
  S.interiorDoorStateBySourceRef = {};
  S.tweens = [];
  // STAGE-A A4 — persistent occlusion-fade bookkeeping (id -> {blocking,opacity,materials}) + the
  // camera-bearing hysteresis anchor, both reset on a fresh mount() the same way S.tweens is just
  // above; setInteriorBoard's own board-ref check (below) additionally resets these on a genuinely NEW
  // board object, so a same-object rebuild (rotate()/zoom/variant replay) correctly PRESERVES them.
  S.occlusionFadeState = new Map();
  S.occlusionClassifyBearingDeg = null;
  S.__occlusionFadeBoardRef = null;
  S.rotationStep = 0;
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.env = THEATER_DEFAULT_ENV_FALLBACK;
  applyLightProfile(LIGHT_DEFAULT_PROFILE); // mount-time baseline; setBoard re-applies from real board.light

  placeCamera();

  S.resizeHandler = () => {
    if(!S.mounted || !S.el || !S.renderer || !S.camera) return;
    const w = S.el.clientWidth || width;
    const h = S.el.clientHeight || height;
    applyPsxCanvasSize(S.renderer, S.renderer.domElement, w, h);
    placeCamera(); // recomputes left/right from the new aspect at the current fit's viewSize
    markDirty();
  };
  window.addEventListener("resize", S.resizeHandler);

  // §4: best-effort, silent-degrade fetch of the parallel textures unit's manifest. Never blocks
  // mount()'s synchronous return, never throws into the caller, never surfaces a console error for
  // the expected-common case (the manifest doesn't exist yet / a different unit hasn't landed it).
  fetchDefaultTextureManifest();

  markDirty();
  return true;
}

// ---- THE FLAT TABLETOP REALIZER: extracted to src/ui/theater-tabletop.js (split B9, 2026-07-25) ----
// setBoard (the combat/settlement tile-column tray) moved there VERBATIM, together with
// REALM-PROPS-WIRING.md §3's prop footprint family (PROP_FOOTPRINT_BY_SIZE / PROP_FOOTPRINT_DEFAULT /
// propFootprint / propSpanZones — censused: setBoard is their ONLY reader) and, further down,
// desaturateGroup + setUnits. Same root->leaf ctx law; it reads AND writes S, so tabletopInit(ctx) at
// end-of-body is paired with tabletopSyncState(S) at both `S = createTheaterState()` sites.
// WHAT STAYS HERE, and why: mountLightProp (its own P1' whole-object registry wiring + a
// dev/verify-theater-light-props.mjs text pin), tileMaterialsFor / addGroundingBlob / baseDiscMatFor /
// unitTint / applyConditionMods / flatTints / renderPartInto / recipeFor / sizeScaleFor / hashSeed /
// scorchTintFor / gradeColorLocal / applyPsxShaderTweaks / interiorFloorTopAt / kilterFor (all shared
// with the interior channel and/or pinned by RED-FIRST text extractions), drainTweens / startTweenLoop /
// markDirty / buildTheaterCtx (the root's own schedulers and ctx factory), and the MF-2 SPAWN/DESPAWN
// GRACE GLUE (mfArtMaterialsOf / mfSetMaterialsOpacity / mfMountGraceFor / mfDespawnGraceFor /
// mfCascadeMount) — B8's ruling, re-censused this step and UPHELD: the family has two consumers,
// setUnits (there) and theater-dressing.js's cascade (through this file's own ctx), so moving it would
// have made the interior dressing channel import the tabletop realizer, and would have broken
// dev/verify-mf2-spawn-grace.mjs's B1a-c/B2 extractions, which read all five out of THIS file's text.
// The tabletop ctx carries the step's only two accessors on that side: the mutable root `let`s
// WHOLE_OBJECT_ENABLED (read) and ITR_SPRITE_EMISSIVE_TINT (written back to white by setBoard).

// ---- THE INTERIOR MESH / GL-SURFACE FAMILY: extracted to src/ui/theater-interior-mesh.js (split B8,
// 2026-07-25) ---- DUNGEON-GRAPH.md U3 / GR1's whole GL layer moved there VERBATIM: the GR1 procedural
// material CanvasTexture baker (interiorMaterialTexture + its cache), the BW2-3 folded-file loader
// (interiorFileTexture + INTERIOR_FILE_TEX_PENDING + the §2b per-surface repeat resolver
// interiorSurfaceFileTexture and ITR_WALL_COURSE_REPEAT), the two shared geometries
// (interiorUnitBoxGeometry / interiorCylinderGeometry), the two pure per-instance colour passes
// (interiorApplyAODarkening / itrNeutralizeInstanceColors), interiorBuildInstancedMesh itself with
// GR4's skirt band and the S-1 ghost-opacity path, BW2-5's interiorBuildPillarMeshes profile split, and
// STAGE-A A4's two per-instance ghost mesh builders (itrBuildOcclusionGhostMeshes /
// itrBuildOcclusionGhostPillarMeshes — B6 left them here for exactly this step). Same root->leaf ctx
// law; censused to never read S, so it takes NO SyncState. materialTexturePixels/MATERIAL_TEXEL_PX
// stay the bare classic-script globals (src/ui/theater-materials.js) they always were, resolved the
// identical way. applyPsxShaderTweaks / nearestify / textureLoader / markDirty stay HERE and reach it
// through interiorMeshInit(ctx) at end-of-body.
// WHAT STAYS HERE, and why: the ROOM SHELL (ITR_ROOM_SHELL + rootGet/SetRoomShell,
// ROOM_SHELL_POLYGON_KERNEL_FLAG, ITR_ROOM_SHELL_UV_DENSITY, ITR_ROOM_SHELL_RISER_DARKEN and the whole
// compileRoomShell consumer wiring) — censused: there is no standalone builder function to move, every
// line of it lives INSIDE setInteriorBoard's own body, and the flag is live-read/written by the Clay
// Room through the root accessors. The SKIRT is likewise not a function: it is the "skirt" shadowKind
// string setInteriorBoard passes to interiorBuildInstancedMesh, whose skirtBand branch moved with it.
// interiorAssignShadowCasters is not here at all — split B5 moved it to src/ui/theater-practicals.js.

/* window.Theater.setInteriorBoard(data) — DUNGEON-GRAPH.md U3's tray-render entry point for a
   src/ui/theater-interior.js `interiorBuildBoard(plan, opts)` output ({kind:"interior3d", env, realmId,
   wallHeightBase, fog, tileKit, instances:{floor,wall,doorframe,pillar}, bounds, meta}). Peer to
   setBoard (above), not a wrapper over it — an interior board's geometry (real-height wall PRISMS via
   InstancedMesh) is a materially different shape than the combat tile-column grid, so this owns its own
   group (S.interiorGroup) and its own camera-fit/fog bookkeeping, while reusing setBoard's proven
   conventions (dirty-key skip, clearGroup, placeCamera, applyLightProfile) wherever the shape lines up.
   Clears S.tileGroup/S.propGroup too (and setBoard, above, clears S.interiorGroup) so switching between
   a combat board and a standing-table interior tray never leaves the OTHER render's meshes on stage. */

// ---- INTERIOR PRACTICALS: extracted to src/ui/theater-practicals.js (split B5, 2026-07-25) ----
// The E0 visible-practical rig moved there whole: INTERIOR_SHADOW_CASTER_CAP / INTERIOR_SHADOW_MAP_SIZE /
// interiorAssignShadowCasters, the light-card + glow-disc + emitter-nub + light-cone builders and their
// authored consts, the ITR_FIXTURE_* fixture family, interiorEnvLightHalfExtent /
// interiorNearestWallMountSlot / interiorResolveFixturePlacement, and interiorBuildLights itself. This
// root imports that surface (top import block) and passes capabilities via practicalsInit(ctx) at
// end-of-body; that module never reads S, so it takes no SyncState.
// WHAT STAYS HERE, and why: the practical GATES — the three mutable `let`s immediately below, plus
// ITR_BRIGHT_SUPPRESS_PRACTICALS, which keeps its place further up in the LIGHT-CLOSE block. Each is
// reassigned at runtime by its own window.Theater seam (setGlowDiscDiagnosticForTest /
// setLightEmitterNubEnabled / setLightConeEnabled / setBrightPracticalsSuppressed), so an import
// binding (read-only) or a copied mirror (goes stale the instant a harness flips one) would both be
// wrong. Three of the four are read LIVE by moved bodies through ctx accessors;
// ITR_LIGHT_EMITTER_NUB_ENABLED is read only by its own getter/setter pair and needs no accessor.
// E0 — VISIBLE PRACTICALS (docs/WALL-VOLUMES-PRACTICALS.md): every light now resolves a real physical
// FIXTURE (interiorBuildFixtureGroup, below) whose own emitter submesh is the visible source — the
// floating additive disc this function builds is retired from the production path. Kept ONLY for a
// future diagnostic capture, gated behind this flag (default OFF, reversible at runtime via
// window.Theater.setGlowDiscDiagnosticForTest, same convention as ITR_LIGHT_CONE_ENABLED). glowCount
// stays 0 in production either way (interiorBuildLights below never increments it when this is false).
let ITR_GLOW_DISC_DIAGNOSTIC = false;

// docs/LIGHT-SIGHT-POLISH.md P-1 problem 3 (Adam's re-shoot: "the glow disc floats with no source" —
// the cone is gone (ITR_LIGHT_CONE_ENABLED default false) and only chrome/gloom/fantasy carry a real
// INTERIOR_LIGHT_CARD dressing card, so every OTHER realm's additive glow disc hung in mid-air with no
// visible origin object). Every light with no card now additionally mounts a tiny self-lit EMITTER NUB —
// a small sconce/brazier stub, tinted to the light's own color, standing at floor level under the glow
// — so the source always reads as an OBJECT, not bare air. Needs no per-realm art (a plain low-poly
// stub, same MeshBasicMaterial/psxExempt family as the glow disc/cone), so it covers every realm
// automatically, present or future. Reversible: flip ITR_LIGHT_EMITTER_NUB_ENABLED (mirrors the L-1 cone
// gate's own convention) or call window.Theater.setLightEmitterNubEnabled(v) at runtime.
let ITR_LIGHT_EMITTER_NUB_ENABLED = true;

// docs/DIEGETIC-LIGHT.md L-1 — CONE GATE (Adam's ruling 2026-07-11, fork F1): the volumetric god-ray
// cone reads as a magic beam, not a diegetic point light's real falloff — "remove the cone behind a
// reversible flag... keep only the emissive flame/glow marker + the point light's real falloff."
// Defaults OFF. interiorBuildLightCone itself is UNTOUCHED (still callable, still under test via
// window.Theater._interiorBuildLightConeForTest) — only its MOUNT call site in interiorBuildLights
// (below) is gated. Reversible in one line for the re-shoot: flip this literal, or call
// window.Theater.setLightConeEnabled(true) at runtime.
let ITR_LIGHT_CONE_ENABLED = false;

// ---- AMBIENT MOTES: extracted to src/ui/theater-motes.js (split B5, 2026-07-25) ----
// VP6 item 3's whole mote family — moteHash32/moteRng, interiorMoteKindFor, MOTE_TINT, moteSoftTexture,
// interiorBuildMotes — and its OWN drift scheduler (startMoteDrift's requestAnimationFrame chain +
// stopMoteDrift's cancel) moved there intact. It stays a SEPARATE scheduler from the flicker loop (now
// in src/ui/theater-lighting.js) and from this file's dirty-frame/tween loops; nothing was unified.
// This root imports that surface (top import block), passes capabilities via motesInit(ctx) at
// end-of-body, and re-syncs the live S record via motesSyncState(S) at both `S = createTheaterState()`
// sites. retire() below still calls stopMoteDrift through the import block.

/* ============================================================================
   BEAUTY-WAVE-4.md MF-2 — SPAWN/DESPAWN GRACE, the production wiring half. The actual tween MATH lives
   in src/ui/spawn-grace.js (pushMountGrace/pushDespawnGrace/seededCascadeDelays, imported above) — this
   section is just the "collect the real THREE handles + call it" glue theater-boot.js's own figures
   need, mirroring how buildTheaterCtx()/bindStandeeCtx() are the same kind of glue for theater-verbs.js/
   standee-verbs.js.
   ============================================================================ */

// mfArtMaterialsOf(group) — every fadeable material under `group`, EXCLUDING any mesh tagged
// userData.standeeBase (buildInteriorBase's own tag) — the plinth is never faded by mount/despawn
// grace at all; that's the entire mechanism behind "base at full opacity from t=0" (mount) / "the base
// lifts LAST" (despawn) — the caller just never routes the base's material into this collection.
function mfArtMaterialsOf(group){
  const mats = [];
  if(!group) return mats;
  group.traverse(function(n){
    if(!n.material) return;
    if(n.userData && n.userData.standeeBase) return;
    const list = Array.isArray(n.material) ? n.material : [n.material];
    list.forEach(function(m){ if(m && mats.indexOf(m) < 0) mats.push(m); });
  });
  return mats;
}
function mfSetMaterialsOpacity(mats, v){
  mats.forEach(function(m){
    if(!m.transparent) m.transparent = true;
    m.opacity = v;
  });
}
// mfMountGraceFor(ctx, group, delayMs?) — MF-2 item 1 (+ item 3's per-piece cascade entry when a
// caller passes a staggered delayMs). `group`'s CURRENT scale is captured as the resting scale (every
// other scale-affecting line in this file — figScale/sizeScaleFor/interiorSpriteFig's figScale=1 —
// has already run by the time a caller invokes this, right after group.add(figure)/group.add(g)), so
// this never needs to know WHICH figure family it's grazing.
function mfMountGraceFor(ctx, group, delayMs){
  const mats = mfArtMaterialsOf(group);
  if(!mats.length) return false;
  const baseScale = group.scale.x || 1;
  const ok = pushMountGrace(ctx, {
    delayMs: delayMs || 0,
    setArtOpacity: function(v){ mfSetMaterialsOpacity(mats, v); },
    setScaleMul: function(mul){ group.scale.setScalar(baseScale * mul); }
  });
  if(ok) startTweenLoop(); // this file's own tween-tick rAF loop — every tween producer kicks it explicitly
  return ok;
}
// mfDespawnGraceFor(ctx, group, onLifted) — MF-2 item 2. Fades ONLY the art materials (the base, if
// any, is excluded by mfArtMaterialsOf above and stays fully visible for the whole 200ms); `onLifted`
// fires strictly after the fade completes — THE BASE LIFTS LAST, since the caller's onLifted is where
// the whole assembly (base included) actually leaves the scene (see setUnits' despawn-diff call site).
function mfDespawnGraceFor(ctx, group, onLifted){
  const mats = mfArtMaterialsOf(group);
  const ok = pushDespawnGrace(ctx, {
    setArtOpacity: function(v){ mfSetMaterialsOpacity(mats, v); },
    onLifted: onLifted
  });
  if(ok) startTweenLoop();
  return ok;
}
// mfCascadeMount(ctx, entries, keyFor) — MF-2 item 3. `entries` is the array of {group,...} records a
// caller already built (dressing cards / furniture assemblies / room pieces); `keyFor(entry)` resolves
// each one's stable identity string (the SAME slug+cell identity kilterFor/idle-breathe already key
// off). Computes the SEEDED stagger once across the whole set (never per-entry, so ranks reflect the
// full room) and fires one mfMountGraceFor per entry at its own delay.
function mfCascadeMount(ctx, entries, keyFor){
  if(!entries || !entries.length) return;
  const keys = entries.map(keyFor);
  const delays = seededCascadeDelays(keys, DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS);
  entries.forEach(function(entry, i){ mfMountGraceFor(ctx, entry.group, delays[i]); });
}

// ---- THE DRESSING / PROPS FAMILY: extracted to src/ui/theater-dressing.js (split B8, 2026-07-25) ----
// GR2 §D's dressing system and its siblings moved there VERBATIM: the dressing texture channel
// (DRESSING_TEXTURE_CACHE + dressingPlaceholderTexture + dressingTextureFor's async real-art settle and
// its S.mounted-guarded setInteriorBoard/setBoard replay), CARD_SIZE_BY_KIND + dressingCardHeight +
// buildDressingCard, BW2-5's furniture channel (the panel texture cache, proceduralPanelTexture,
// furniturePanelMaterial, buildFurnitureAssembly, interiorBuildFurniture), THE PROP PERSPECTIVE LAW
// (itrPropEdgeColorFor + its cache, ITR_WALL_SIDE_YAW/NORMAL, the P-2 ITR_WALLHANG_* knobs,
// buildExtrusionProp, interiorBuildWallProps), BW2-2b's WALL-CONTACT AO (WALL_AO_SCALE /
// WALL_AO_Z_OFFSET / addWallContactAO — B7's standee-mount header censused it dressing-owned and left
// it for this step), plus interiorBuildPieces and interiorBuildDressing themselves. Same root->leaf ctx
// law; it reads AND writes S, so dressingInit(ctx) at end-of-body is paired with dressingSyncState(S)
// at both `S = createTheaterState()` sites. spriteEntryFor, kilterFor, interiorFloorTopAt (all
// dev/verify-d4-doors.mjs / RED-FIRST text-extraction pins), buildTheaterCtx, _censusBoardSceneKind,
// setBoard, setInteriorBoard, applyPsxShaderTweaks, nearestify, textureLoader, LIGHT_TUNABLES and the
// MF-2 grace glue stay HERE and reach it through that ctx; SPRITE_UNLIT_DEBUG and
// ITR_SPRITE_EMISSIVE_TINT stay HERE as mutable root `let`s read live through two ctx accessors (the
// step's only four accessor swaps, in buildDressingCard and buildExtrusionProp). theaterCensusRecord /
// furnitureFor / INTERIOR_TILE_KITS / textureFaceFor stay bare classic-script globals.
// WHAT STAYS HERE: the MF-2 SPAWN/DESPAWN GRACE GLUE just above (mfArtMaterialsOf /
// mfSetMaterialsOpacity / mfMountGraceFor / mfDespawnGraceFor / mfCascadeMount) — censused: setUnits
// calls mfMountGraceFor and mfDespawnGraceFor directly, so the family is figure-grace glue shared by
// the combat-figure channel and the dressing channel, not dressing-owned. The three cascade call sites
// in the moved builders reach mfCascadeMount through the ctx above.
// ---- THE BEAT CAMERA + THE SHOT COMPOSE WIRING: extracted to src/ui/theater-camera.js (split B6) ----
// BW2-1's interiorCameraFitFor / interiorFitMaxHeightFor (with INTERIOR_ROOM_FIT_PAD and
// INTERIOR_BEAT_MARGIN_CELLS) and STAGE-A A3's whole shot-compose wiring (ITR_SHOT_COMPOSE, the scratch
// projector — shotScratchCamera / shotNumOr / shotCameraAspect / shotProjectFor / shotProjectTwoArg —
// plus fitFromComposedShot and the superseded fitFromComposedCameraWideForTest seam) moved there
// VERBATIM. HUMAN_TRUE_HEIGHT and spriteEntryFor stay HERE and reach that module through its ctx;
// window.Theater.shotProjectFor is still republished from this file's own publish block below, now off
// the imported binding (same function identity).

// ---- THE OCCLUSION LAW: extracted to src/ui/theater-occlusion.js (split B6, 2026-07-25) ----
// BW2-1b's segment-vs-AABB primitive (itrSegmentIntersectsAabb), the per-standee sightline targets
// (itrPieceSightPoints), the pillar and furniture cutaway masks (itrPillarCutawayMask /
// itrFurnitureOcclusionBoxFor / itrFurnitureOcclusionMask) and the ankle-height deriver + its S-1 alias
// (ITR_PILLAR_STUB_FRAC / ITR_OCCLUSION_STEM_HEIGHT_U / itrPillarStubHeight / itrOcclusionAnkleHeight)
// moved there VERBATIM, together with STAGE-A A4's fade classifier and the CLIP MARGIN LAW further
// down. That module is censused THREE-free and takes occlusionInit(ctx) + occlusionSyncState(S).
// itrScaleHexValue / interiorFloorTopAt / interiorStandeeContactY / spriteEntryFor / HUMAN_TRUE_HEIGHT /
// markDirty / startTweenLoop stay HERE and reach it through that ctx; furnitureFor is still the plain
// classic-script global (src/ui/theater-interior.js) it always was, resolved the identical way.
// TEST-ONLY SEAM (dev/verify-occlusion-fade.mjs's own RED-FIRST proof): forces setInteriorBoard's
// wall/pillar occlusion pass off entirely (both kinds render at their ORIGINAL full height, no ankle
// stub, no ghost) so a harness can render the "nothing occludes this frame at all" baseline and prove
// a figure directly behind a full-height occluder genuinely reads occluded BEFORE trusting the fixed
// (default-on) render's green. No product caller ever sets this — false everywhere except the harness.
let ITR_OCCLUSION_FADE_DISABLED_FOR_TEST = false;

// ---- STAGE-A A4 DYNAMIC OCCLUSION v2: extracted to src/ui/theater-occlusion.js (split B6) ----
// The A4 tunables (ITR_OCCLUSION_UPPER_OPACITY + its ITR_OCCLUSION_GHOST_OPACITY back-compat alias,
// ITR_OCCLUSION_FADE_IN_MS / _FADE_OUT_MS, ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG,
// ITR_OCCLUSION_STUB_DARKEN, ITR_OCCLUSION_STUB_MIN_HEIGHT), the camera-bearing math
// (itrOcclusionBearingDeg / itrOcclusionBearingDeltaDeg), the pure hysteresis decision
// (itrOcclusionNextCommitted), the stateful classifier (itrOcclusionClassify — it owns
// S.occlusionFadeState and retargets its opacity tween on the SHARED S.tweens channel, never a second
// loop) and itrOcclusionIdFor moved there VERBATIM. S.occlusionClassifyBearingDeg and
// S.__occlusionFadeBoardRef stay owned HERE: only setInteriorBoard's own per-rebuild hold decision,
// mount()'s reset and the occlusion-fade diagnostic below touch them.
let ITR_ROOM_SHELL = true;
// split B1: the Clay Room module reads/writes this live flag through these accessors (an ES
// import binding would be read-only and a mirror would go stale under the facade's setRoomShell).
function rootGetRoomShell(){ return ITR_ROOM_SHELL; }
function rootSetRoomShell(v){ ITR_ROOM_SHELL = !!v; }
// UNIT G2 (docs/GEOMETRY-OSS-INTEGRATION.md §15) — theater-boot.js's own copy of the
// legacy|oss-compare|oss migration switch, threaded through to compileRoomShell(...) below as
// opts.roomShellPolygonKernel. This is the PRODUCTION render default (setInteriorBoard's build at the
// roomShellPolygonKernel pass-through below reads it). FLIPPED "legacy" -> "oss" 2026-07-13 (§15
// promotion step 8) after the full pre-flip evidence packet came back sound: verify-wall-runs-oss 92/0
// (corner gap 0 at stem/cap/footing, both cap lips, 100% provenance), verify-wall-runs-oss-fuzz over
// 5000 randomized rooms (zero join-gap, full segment provenance, acute-bevel contract + red-first
// negative control), verify-geometry-fixtures 28/0 (7 legacy defects fixed, 0 regressions), the
// outside-low grazing capture (oss closes the corner with a continuous mitered cap lip), the
// product-camera integrated capture (oss ≡ legacy at the player-visible shot), and the perf receipt
// (draw calls Δ0, triangles Δ-286 i.e. CHEAPER, geometries/programs Δ0, textures +2 one-time).
// The legacy path is RETAINED for the §15 step-9 stabilization hold: theater-room-mesh.js's module
// ROOM_SHELL_POLYGON_KERNEL stays "legacy" (the bare-call fallback + dev-harness default), and this
// flag is still test-seam-settable back to "legacy"/"oss-compare" via _setRoomShellPolygonKernel.
let ROOM_SHELL_POLYGON_KERNEL_FLAG = "oss";
// world units per texture repeat for the compiled shell's own vertex UVs (theater-room-mesh.js's
// DEFAULT_UV_DENSITY=1 mirrors this — kept as a SEPARATE named constant here, not an import, since the
// pure module stays decoupled from this file's own material-building code; see the wire-in call site).
const ITR_ROOM_SHELL_UV_DENSITY = 1;
// C4.1a (docs/WALL-VOLUMES-PRACTICALS.md): the compiled shell's near/far parapet cut is no longer a
// HEIGHT FRACTION (ITR_ROOM_SHELL_PARAPET_FRAC, retired — grepped: no other reader) — the wall is now a
// real capped-stem VOLUME, so "cut" means hide the segment's own UPPER mesh outright (a boolean), never
// squash its height. See the wallHeightForSegment/upperVisibleForSegment split at this unit's own
// setInteriorBoard call site below.
// riser side faces read as a DELIBERATELY DARKER material variant (directive step 7) — same value-
// multiply convention ITR_SCENE_DOORFRAME_VALUE already uses one section up, applied via itrScaleHexValue.
const ITR_ROOM_SHELL_RISER_DARKEN = 0.55;
// ---- the ankle-stub/ghost SPLITTER + the CLIP MARGIN LAW: extracted to src/ui/theater-occlusion.js
// (split B6, 2026-07-25) ---- itrSplitOccluderForAnkleGhost and the whole clip-margin family
// (itrClosestPointOnAabbXZ / itrCircleAabbPushXZ / itrNearbyPrismBoxes / itrClipNudgeFor /
// itrPointInAnyBox / itrBlockerNudgeCell / CLIP_NUDGE_MAX_FRAC / CLIP_DRESSING_EPSILON) moved there
// VERBATIM. The two ghost MESH builders (itrBuildOcclusionGhostMeshes /
// itrBuildOcclusionGhostPillarMeshes, further up beside interiorBuildInstancedMesh) stay HERE: they
// carry no occlusion law, only per-instance InstancedMesh construction, and moving them would have put
// THREE into a module the split keeps censused THREE-free.

// ---- F1 COMBAT-FIT CLAMP: extracted to src/ui/theater-camera.js (split B6, 2026-07-25) ----
// VQ2-RESPEC.md §4 unit F1's F1_COMBAT_CAM_CLAMP_FRAC + f1ClampCamFit moved there VERBATIM with the
// rest of the fit family. dev/verify-f1-combat-in-room.mjs §7 still text-extracts and evals that exact
// function standalone; its source read is repointed to the theater-boot + theater-camera composite.

// ---- THE INTERIOR REALIZER: extracted to src/ui/theater-interior-realize.js (split B9, 2026-07-25) ----
// setInteriorBoard and setInteriorVariant moved there, together with VQ2-RESPEC.md §4 unit F1's combat
// floor-grid overlay (F1_GRID_TEX_CACHE / f1CombatGridTexture / F1_GRID_OPACITY / F1_GRID_EDGE_OPACITY /
// f1BuildCombatGrid — censused: setInteriorBoard and the Clay Room ctx are its only consumers) and the
// clay-diagnostic lighting identity (interiorLightingIdentityFor, read only by setInteriorBoard).
// THE DECOMPOSITION (the brief's item 5): setInteriorBoard is NOT a single moved 1,448-line body there.
// Its orchestrator keeps only the admission guard (mount/data check, MF-1's pre-fit pose capture, the
// dirty-key skip — early returns a phase list cannot express) and then calls seventeen named phase
// functions IN THE ORIGINAL ORDER — realizePhaseIntake / Teardown / Frame / LightBed / Surfaces /
// WallsDoors / Shell / Pillars / Groups / Practicals / Pieces / Furniture / Doors / KitShells /
// Atmosphere / CameraFit / Tail — each of whose bodies is a verbatim-lifted contiguous range of the
// pre-split function. The locals that crossed a phase seam ride one explicit `pass` context object; no
// statement was reordered, merged or rewritten. That module's header carries the full phase map, the
// pass-field inventory and the closure/try-catch notes.
// Same root->leaf ctx law; it reads AND writes S, so interiorRealizeInit(ctx) at end-of-body is paired
// with interiorRealizeSyncState(S) at both `S = createTheaterState()` sites. It never imports this file;
// it DOES import theater-clay-room.js for the four CL-R0 hooks, which is acyclic — the clay module takes
// setInteriorBoard/setInteriorVariant/f1BuildCombatGrid from THIS file's clayRoomInit ctx, never by
// import.
// WHAT STAYS HERE, and why: the mutable room-shell flag ITR_ROOM_SHELL with its rootGet/SetRoomShell
// accessors (the Clay Room live-writes it, and itrDoorMountFor/itrDoorMountMapFrom above still read it)
// plus its sibling tunables ROOM_SHELL_POLYGON_KERNEL_FLAG (a window.Theater seam), ITR_ROOM_SHELL_UV_DENSITY
// and ITR_ROOM_SHELL_RISER_DARKEN — the last two censused as single-reader/movable but deliberately kept
// with their siblings as one root tunables block (B2's law), delivered as plain ctx values;
// ITR_OCCLUSION_FADE_DISABLED_FOR_TEST (its own seam + two root diagnostic readers below); the whole
// DOORS family (itrDoorMountMapFrom / itrApplyDoorMounts / interiorBuildInteractables /
// interiorBuildKitShellWalls / interiorBuildKitShellFloors — the standing d4-doors text-pin ruling);
// interiorFloorTopMapFrom / interiorFloorTopAt; itrScaleHexValue / itrBrightRealmFillFor / hexStrToNum /
// gradeColorLocal / applyPsxShaderTweaks; every ITR_SCENE_* / ITR_EMISSIVE_* / ITR_BRIGHT_* authored
// constant and LIGHT_TUNABLES (the tunables law); and drainTweens / startTweenLoop / markDirty /
// buildTheaterCtx. Eleven ctx accessor reads/writes cover the six mutable root `let`s the moved bodies
// still touch live.

/* T3 zoneToWorld (§4 ctx contract, theater-verbs.js): "band:lane" -> the SAME world tile coordinates
   theaterUnitsFrom (theater-data.js) would place a lone occupant of that zone at — reusing THIS
   file's own THEATER_PATCH-equivalent (a local const below mirrors theater-data.js's THEATER_PATCH=3
   and center-offset math exactly; kept in sync by comment/convention, same discipline as this file's
   existing ENV_VOID_TINT table, since the sealed ES-module boundary can't import theater-data.js's
   classic-script const). Returns null for a band/lane not in the last-set board's grid, or before any
   board has been set (S.lastGrid absent) — a verb resolving against an unresolvable zone just no-ops
   (theater-verbs.js's resolvePoint already treats a null return as "skip this field cleanly"). */
const ZONE_TO_WORLD_PATCH = 3; // must match theater-data.js's THEATER_PATCH
function zoneToWorld(band, lane){
  if(!S.lastGrid) return null;
  const bandIdx = (S.lastGrid.bands || []).indexOf(band);
  const laneIdx = (S.lastGrid.lanes || []).indexOf(lane);
  if(bandIdx < 0 || laneIdx < 0) return null;
  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  const center = (ZONE_TO_WORLD_PATCH - 1) / 2;
  return {
    x: (laneIdx * ZONE_TO_WORLD_PATCH) + center - cx,
    z: (bandIdx * ZONE_TO_WORLD_PATCH) + center - cz
  };
}

/* T3 findUnit (§4 ctx contract): unit id -> its mounted THREE.Object3D group, tagged with
   userData.unitId at setUnits() time below. Returns null pre-mount / unknown id — every verb treats
   that as "can't resolve this unit," a clean no-op.
   DUNGEON-GRAPH.md finale-gate finding (the dungeon-loop-gate, dev/battle-gate/capture-dungeon-loop.mjs):
   an interior board's `pieces` (interiorBuildPieces, above) live in S.interiorGroup's own pieces
   sub-group, not S.unitGroup — before this fix, play(verb,{who:fid}) could NEVER resolve a piece
   standing in a rendered room (findUnit only ever searched S.unitGroup), even though interiorBuildPieces
   already stamps userData.unitId when the caller tags a piece with its combat fid. Walk S.interiorGroup
   one level deep (interiorGroup -> {tile/wall/light/pieces sub-groups} -> sprite groups), the SAME
   traversal shape updateSpriteBillboardYaw already uses for the identical reason — checked AFTER
   S.unitGroup so the ordinary combat-stage lookup is untouched (byte-identical when no interior board
   is mounted / no piece carries a matching id). */
function findUnit(id){
  if(id == null) return null;
  const idStr = String(id);
  if(S.unitGroup){
    for(let i = 0; i < S.unitGroup.children.length; i++){
      if(S.unitGroup.children[i].userData && S.unitGroup.children[i].userData.unitId === idStr) return S.unitGroup.children[i];
    }
  }
  if(S.interiorGroup){
    for(let i = 0; i < S.interiorGroup.children.length; i++){
      const sub = S.interiorGroup.children[i];
      if(!sub || !sub.children) continue;
      for(let j = 0; j < sub.children.length; j++){
        const fig = sub.children[j];
        if(fig && fig.userData && fig.userData.unitId === idStr) return fig;
      }
    }
  }
  return null;
}

/* T3: the ctx object handed to theater-verbs.js's playVerb/tickTweens (see that file's header for the
   full contract). Built fresh on every play() call (cheap — a handful of field reads/closures, no
   allocation of the actual GL resources) so it always reflects the CURRENT mount/board/unit state
   rather than risking a stale snapshot across a retire()/remount(). */
function buildTheaterCtx(){
  return {
    THREE, scene: S.scene, fxGroup: S.fxGroup, unitGroup: S.unitGroup, camera: S.camera,
    tweens: S.tweens, findUnit, zoneToWorld, markDirty
  };
}

/* T3 play(verb, opts) — the public surface this unit's brief calls for: "expose Theater.play(verb,opts),
   the tween tick loop with render-on-demand preserved — animate only while a tween is live." Null-safe
   pre-mount (matches every other Theater method). Delegates verb semantics entirely to theater-verbs.js;
   this function's only job is ctx construction + kicking the tween loop while at least one tween is live. */
// GRAPHICS-ENGINE Part II §A WIRING (the standing production caller this unit proves against): the
// combat damage path already routes through play("hurt",{who,...}) / play("down",{who,...}) via
// cmTheaterNotify -> theaterFxFromLedger (render.js's hp/attack/foe-turn ledger hooks, src/world/dm.js's
// call sites). A 3D whole-object/glb figure plays theater-verbs.js's vHurt/vDown unchanged. A SPRITE
// billboard unit (SPRITE-TRANSITION T4 channel — userData.sprite=true, buildSpriteBillboard above) has
// no skeletal rig for vHurt's jitter/vDown's toppled-prone rotation to read correctly against (those
// verbs assume a posed 3D figure with real depth), so §A specs its own hit-damage/fall-death standee
// verbs for exactly this case. This table is the ONLY new mapping this wiring adds — no new event
// fields, no new ledger kinds (the WIRING LAW's "re-gate greps production callers" — the events feeding
// `verb`/`opts` here are the pre-existing hurt/down dispatch, untouched).
const STANDEE_VERB_FOR_THEATER_VERB = Object.freeze({ hurt: "hit-damage", down: "fall-death" });

function play(verb, opts){
  if(!S.mounted) return false;
  // THEATER-NEXT §3.2 — an animation may leave transforms displaced (knockback's slide, absurdity's
  // tile flicker) even when the NEXT setBoard/setUnits payload is byte-identical to the last one; null
  // both keys so that next sync always rebuilds — exactly today's behavior on any turn containing an
  // animation. The skip only ever fires on animation-free turns.
  S.boardKey = null; S.unitsKey = null;
  opts = opts || {};
  // MF-3b (BEAUTY-WAVE-4B §C): the ONLY conditional override on top of STANDEE_VERB_FOR_THEATER_VERB's
  // static map (every non-crit hurt/down call keeps the old mapping). standeeVerbForHurt/
  // recoilDirFromPositions are PURE functions imported from theater-verbs.js (this file's own GL
  // surface is browser-smoke-tested only, per its manifest note — factoring the decision/geometry math
  // out to the already-plain-Node-importable theater-verbs.js is what makes it unit-testable at all,
  // same spirit as this file's own "expose the pure builder" _*ForTest seams).
  const standeeVerb = standeeVerbForHurt(verb, opts, STANDEE_VERB_FOR_THEATER_VERB);
  const unit = standeeVerb && opts.who != null ? findUnit(opts.who) : null;
  if(unit && unit.userData && unit.userData.sprite){
    bindStandeeCtx(buildTheaterCtx());
    // MF-3b: standee-verbs.js has no ctx.findUnit of its own (its own header says so) — this is the one
    // place that CAN resolve both the attacker's and the target's live world positions, so it computes
    // the recoilDir unit vector (target<-attacker) here and threads it alongside attackerId (which
    // already rides opts unchanged from theaterFxFromLedger). Omitted whenever the attacker doesn't
    // resolve (not mounted, no attackerId) — recoil then falls back to MF-3's un-biased shake, never a
    // throw.
    let standeeOpts = opts;
    if(opts.attackerId != null && (standeeVerb === "hit-damage" || standeeVerb === "hit-crit")){
      const attackerUnit = findUnit(opts.attackerId);
      const dir = attackerUnit ? recoilDirFromPositions(unit.position, attackerUnit.position) : null;
      if(dir) standeeOpts = Object.assign({}, opts, { recoilDir: dir });
    }
    const played = playStandeeVerb(unit, standeeVerb, standeeOpts);
    if(played){
      // VP6 item 5 — hit-effects seam: the two production-wired standee verbs (WIRING LAW's own
      // {hurt:"hit-damage", down:"fall-death"} map, unchanged above) each spawn their effect card at
      // the target's own resolved world position. act-cast is named in the spec's prose but has no
      // production theater-verb mapped to it yet (no "cast" entry in STANDEE_VERB_FOR_THEATER_VERB —
      // the WIRING LAW's "no new event surface" holds), so it is wired at the standee-verb layer only
      // (playStandeeVerb itself has no effect-spawn hook); this call site fires for the two verbs that
      // ARE live in production today.
      spawnEffectCard(standeeVerb, unit.position.x, unit.position.y + 0.6, unit.position.z, 1.7);
      startTweenLoop();
      return true;
    }
    // an unresolvable/decline standee verb (e.g. hurt fired before the sprite texture finished loading,
    // buildSpriteBillboard's own "not loaded yet" miss) falls through to the ordinary 3D-figure verb
    // below rather than silently dropping the animation — matches every other Theater.play null-safety
    // posture in this file (never a hard failure for a missing/late asset).
  }
  // MF-3b: the 3D-figure vHurt path (theater-verbs.js) already reads opts.attackerId for hit-stop
  // unchanged; its directional recoil takes a separate `recoilFrom` point-ref that resolvePoint
  // resolves via ctx.findUnit — reuse the same attackerId as recoilFrom rather than duplicating the
  // position math this file just did for the sprite path above (vHurt already knows how to resolve a
  // unit id). No-op whenever attackerId is absent or the verb isn't hurt — byte-identical to before.
  const verbOpts = (verb === "hurt" && opts.attackerId != null && opts.recoilFrom == null)
    ? Object.assign({}, opts, { recoilFrom: opts.attackerId })
    : opts;
  const ok = playVerb(buildTheaterCtx(), verb, verbOpts);
  if(ok) startTweenLoop();
  return ok;
}

/* the tween tick loop: a SEPARATE rAF chain from the render-on-demand `raf` above (that one fires once
   per dirty flag and stops; this one runs every frame WHILE >=1 tween is live, per-frame calling
   tickTweens then markDirty to trigger the next render). Stops itself the instant tickTweens reports
   no tweens remain — "animate only while a tween is live" (this unit's brief, quoting §2's own
   render-on-demand discipline extended to animation). Idempotent: calling startTweenLoop while already
   running is a no-op (S.tweenRaf guard), so play() can call it after every verb without double-scheduling. */
/* A2 (REVIEW-FIXES-0705-VISUAL.md §W2-A finding 3) — force-drain every live tween BEFORE a board/unit
   swap or retire() tears down the Object3D/material handles those tweens still close over. Without
   this, setUnits' clearGroup(S.unitGroup) disposes meshes while S.tweens still holds live closures
   over them (stale mutation on the next tick + onDone firing against torn-down state); setBoard never
   swept S.fxGroup/S.tweens at all, so a new board inherited the old board's still-animating debris/
   glyphs; retire() cancelled the rAF loop but never ran the abandoned tweens' own onDone (a latent
   use-after-dispose for any future async verb). Fix: synchronously run every live tween's onDone
   (same guarded try/catch posture as tickTweens — one bad cleanup must never block the rest) then
   empty S.tweens. Tweens are sub-second; forced completion on a swap is visually correct — the
   figure/board settles into its terminal pose instantly rather than papering over a half-finished
   animation. Composes with A1's clone-restore: vHurt/vDown's onDone restores the ORIGINAL shared
   material + disposes the tween-local clone, so draining ALSO undoes any in-flight shared-material
   clone before the caller disposes the underlying figure/material caches. */
function drainTweens(S){
  if(!S || !S.tweens || !S.tweens.length) return;
  const live = S.tweens.slice();
  S.tweens.length = 0;
  live.forEach(function(tw){
    if(tw && typeof tw.onDone === "function"){
      try { tw.onDone(); } catch(e){ /* one bad cleanup must never block the rest — matches tickTweens' own posture */ }
    }
  });
}

function startTweenLoop(){
  if(!S.mounted || S.tweenRaf) return;
  const step = () => {
    if(!S.mounted){ S.tweenRaf = null; return; }
    const stillLive = tickTweens(buildTheaterCtx());
    if(stillLive){
      S.tweenRaf = requestAnimationFrame(step);
    } else {
      S.tweenRaf = null;
    }
  };
  S.tweenRaf = requestAnimationFrame(step);
}

// ---- desaturateGroup + setUnits: extracted to src/ui/theater-tabletop.js (split B9, 2026-07-25) ----
// DEAD-STATE's desaturateGroup (censused: setUnits is its ONLY caller — theater-whole-object.js names it
// in prose only, since the whole-object corpse path deliberately swaps a cached gray geometry instead)
// and setUnits itself moved there VERBATIM beside setBoard, so the flat tabletop channel's board pass and
// figure pass live together. drainTweens/startTweenLoop stay HERE (retire() and play() are their other
// callers, and dev/verify-theater-verbs.mjs pins drainTweens' own body to this file); so does the MF-2
// grace glue setUnits reaches through the tabletop ctx — see the setBoard extraction note above.

function rotate(){
  if(!S.mounted) return;
  S.rotationStep = (S.rotationStep + 1) % 4;
  placeCamera();
  markDirty();
}

/* THEATER-ZOOM-SPREAD — Theater.zoom(dir): ortho zoom, one discrete step per call. `dir` follows the
   same sign convention as a scroll-wheel delta's negation / a "+"-button click: dir>0 (or any truthy
   positive number) zooms IN (viewSize shrinks, board reads bigger), dir<0 zooms OUT. dir===0 or a
   non-finite value is a no-op (never throws, matches every other Theater method's null-safety). The
   new zoomLevel is clamped to [ZOOM_MIN, ZOOM_MAX] and re-applied via placeCamera() so it takes effect
   immediately — it then PERSISTS across any later rotate()/setBoard() call because those both re-derive
   viewSize by multiplying the board's fresh auto-fit by S.zoomLevel (placeCamera's own logic), never by
   resetting S.zoomLevel itself (setBoard() only resets it on an actual board-SHAPE change, see its own
   comment). Returns the resulting zoomLevel (useful for a caller wanting to reflect the current step in
   UI, e.g. disabling a +/- button at the clamp), or false pre-mount/on a bad dir. */
function zoom(dir){
  if(!S.mounted) return false;
  const d = Number(dir);
  if(!isFinite(d) || d === 0) return false;
  const factor = d > 0 ? (1 / ZOOM_STEP_FACTOR) : ZOOM_STEP_FACTOR; // dir>0 = zoom IN = smaller viewSize
  S.zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (S.zoomLevel || 1) * factor));
  placeCamera();
  markDirty();
  return S.zoomLevel;
}

/* reattach(el) — re-parent the LIVE canvas into a new container after the host UI re-rendered its
   DOM. renderWorld() does full innerHTML replacement, which detaches (not destroys) the canvas —
   a WebGL context survives re-parenting — but the old mount-once flow left the canvas orphaned
   forever (found live 2026-07-03: battle-stage mounted into the probe, then the stage re-render
   nuked it -> black stage). Also re-fits size + camera against the NEW container, which fixes the
   sibling bug of mount() sizing against the hidden zero-size probe. Null-safe pre-mount. */
function reattach(el){
  if(!S.mounted || !S.renderer || !el) return false;
  if(S.renderer.domElement.parentNode !== el) el.appendChild(S.renderer.domElement);
  // VP5: the floater overlay travels with the canvas — same re-parent, same reasoning (reattach's
  // own header comment above). Defensive re-create if a pre-VP5 S (or a stub in a headless harness)
  // never built one.
  if(!S.floaterEl){
    S.floaterEl = document.createElement("div");
    S.floaterEl.className = "theater-floater-layer";
    S.floaterEl.setAttribute("aria-hidden", "true");
  }
  if(S.floaterEl.parentNode !== el) el.appendChild(S.floaterEl);
  // MF-2 item 4: the room-transition overlay travels with the canvas too — same reasoning/defensive
  // re-create as the floater overlay just above.
  if(!S.transitionEl){
    S.transitionEl = document.createElement("div");
    S.transitionEl.className = "theater-transition-layer";
    S.transitionEl.setAttribute("aria-hidden", "true");
  }
  if(S.transitionEl.parentNode !== el) el.appendChild(S.transitionEl);
  S.el = el;
  const w = el.clientWidth || 1, h = el.clientHeight || 1;
  applyPsxCanvasSize(S.renderer, S.renderer.domElement, w, h);
  placeCamera();
  markDirty();
  return true;
}

/* disposeAuxCaches — HOTFIX-QUEUE-2026-07-06 H10: the small-key-space module-scope caches
   (FLOOR_TEXTURE_CACHE, BASE_DISC_MAT_CACHE, GROUNDING_BLOB_GEO_CACHE) leak across mount/retire
   cycles just like the whole-object caches disposeWholeObjectCaches already handles — this is
   their symmetric end-of-life dispose point, called from retire(). Idempotent-safe: an
   already-empty cache is a no-op. */
function disposeAuxCaches(){
  FLOOR_TEXTURE_CACHE.forEach(tex => { if(tex && tex.dispose) tex.dispose(); });
  FLOOR_TEXTURE_CACHE.clear();
  Object.keys(BASE_DISC_MAT_CACHE).forEach(k => { BASE_DISC_MAT_CACHE[k].dispose(); delete BASE_DISC_MAT_CACHE[k]; });
  Object.keys(GROUNDING_BLOB_GEO_CACHE).forEach(k => { GROUNDING_BLOB_GEO_CACHE[k].dispose(); delete GROUNDING_BLOB_GEO_CACHE[k]; });
}

function retire(){
  unmountLightLab(); // LL-1: the lab panel is a DOM node OUTSIDE S's own render tree — tear it down explicitly so a re-mount never orphans/duplicates it (S itself is about to be replaced wholesale below)
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  if(S.tweenRaf) cancelAnimationFrame(S.tweenRaf); // T3: stop the verb tween loop too, not just render-on-demand's raf
  stopLightFlicker(); // BOARD LIGHTING: the smooth ambient flame rAF outlives raf/tweenRaf otherwise
  stopMoteDrift(); // VP6 item 3: the mote drift rAF chain is its own loop, outlives raf/tweenRaf otherwise
  drainTweens(S); // A2: run every abandoned tween's onDone (restores shared materials etc.) BEFORE any dispose below
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  clearGroup(S.fxGroup);   // T3: sweep any live verb/FX primitives (glyphs, elemental bursts, the absurdity rift)
  disposeWholeObjectCaches(); // D7: the one true end-of-life dispose point for the shared whole-object caches
  disposeAuxCaches(); // HOTFIX-QUEUE-2026-07-06 H10: symmetric end-of-life dispose for the floor/disc/blob caches
  disposePixelSkinCache(); // A3: symmetric end-of-life dispose point for the pixel-skin texture cache
  if(S.textures){ Object.keys(S.textures).forEach(k => { const t = S.textures[k]; if(t && t !== "pending" && t.dispose) t.dispose(); }); } // HOTFIX-QUEUE-2026-07-06 H10
  // BEAUTY-WAVE-3 BW3-0 — symmetric end-of-life dispose for the composer's two WebGLRenderTargets +
  // its internal copyPass material (EffectComposer.dispose() owns all three), same "one true dispose
  // point" discipline as disposeWholeObjectCaches/disposeAuxCaches/disposePixelSkinCache above. Any
  // passes a later BW3 unit added are the CALLER's own dispose responsibility (removePass, below,
  // never disposes a pass itself — mirroring THREE's own EffectComposer.removePass contract) UNLESS
  // still attached at retire() time, in which case composer.dispose() only frees ITS OWN two render
  // targets + copyPass, never iterates `passes` — no leak here for a BW3-0-only mount (zero passes).
  // BEAUTY-WAVE-3 THE POST SUITE: dispose the three effect passes' own GPU resources (ShaderPass
  // FullScreenQuad materials + UnrealBloomPass's mip render-target chain) at end of life — composer.
  // dispose() below frees only ITS OWN targets, never the passes it holds, so this is the passes'
  // symmetric dispose point. Guarded on existence (a mount that never showed an interior board has
  // no suite).
  if(S.postSuite){
    teardownPostSuite();
    Object.keys(S.postSuite).forEach((k) => { const p = S.postSuite[k]; if(p && p.dispose) p.dispose(); });
    S.postSuite = null;
  }
  if(S.composer) S.composer.dispose();
  if(S.renderer){
    S.renderer.dispose();
    if(S.renderer.domElement && S.renderer.domElement.parentNode){
      S.renderer.domElement.parentNode.removeChild(S.renderer.domElement);
    }
  }
  S = createTheaterState();
  clayRoomSyncState(S); // split B1: the clay module mirrors the live state record
  lightLabSyncState(S); // split B2: same law for the lab
  postSyncState(S);     // split B4: same law for the post suite (it reads AND writes S.postSuite*)
  lightingSyncState(S); // split B5: same law for the lighting family + the flicker scheduler
  motesSyncState(S);    // split B5: same law for the mote field + its own drift scheduler
  cameraSyncState(S);   // split B6: same law for the camera/fit/shot family (it reads AND writes S)
  occlusionSyncState(S);// split B6: same law for the occlusion fade state (S.occlusionFadeState + S.tweens)
  standeeMountSyncState(S); // split B7: same law for the standee base/contact family (S.standeeCollision*)
  spritesSyncState(S);  // split B7: same law for the sprite/billboard family (replay + the facing pass)
  overlaysSyncState(S); // split B7: same law for the overlay family (rings/effects/floaters + S.tweens)
  dressingSyncState(S); // split B8: same law for the dressing/props family (the async real-art replay reads S.mounted/S.lastBoard)
  tabletopSyncState(S);        // split B9: same law for the flat tabletop realizer (setBoard/setUnits read AND write S)
  interiorRealizeSyncState(S); // split B9: same law for the interior realizer (every phase reads AND writes S)
}

/* P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 8) — ONE module-scope call, made once at import
   time (not per-mount): kicks off every whole-object creature-module dynamic import in the
   background. Pre-completion renders (mount()/setBoard()/setUnits() called before this settles) show
   the existing cuboid figures — correct, never blank, per figureFor's own "builder not loaded" guard.
   Once every distinct module has settled (loaded or failed), replay the LAST board/units payload
   (S.lastBoard/S.lastUnits, stamped by setBoard/setUnits themselves) so whatever's on screen upgrades
   to whole-object figures without the caller having to re-drive a render. Guarded on S.mounted (a
   retire() before the import settles must not resurrect a torn-down instance) and on each payload
   being non-null (a mount with no board/units set yet has nothing to replay). jsdom/headless never
   loads this file at all (ES module, excluded from the classic-script harness concat per CLAUDE.md/
   this file's own header) — the degrade path is structurally unchanged, nothing new to guard there. */
loadWholeObjectBuilders(function(){
  if(S.mounted){
    // THEATER-NEXT §3.2/§3.4 (C-E1) — THIS IS THE SITE THAT BREAKS SILENTLY IF MISSED: this replay
    // intentionally re-sends S.lastBoard/S.lastUnits VERBATIM (same payload as last time) so the
    // async-loaded whole-object models actually mount. Null both keys immediately before the two
    // re-calls so the dirty-key skip never dedupes this deliberate same-payload re-render away.
    S.boardKey = null; S.unitsKey = null;
    // DISCRIMINATE ON BOARD KIND before replaying (mirrors the other replay sites — line ~2712's
    // ensureWrap callback, ~6753, ~7936's setInteriorVariant): S.lastBoard is a SHARED field set by
    // BOTH setBoard (flat tabletop/combat: tiles/props/grid) and setInteriorBoard (interior3d:
    // instances/bounds/wallHeightBase). Feeding an interior3d board through the flat setBoard() here
    // silently corrupts the live scene — setBoard restores S.orthoCamera (killing the perspective
    // interior camera), turns shadowMap off, resets hemi/key/fill to tabletop defaults, and derives a
    // bogus fit off the mismatched data shape. This fires once, module-scope, a few hundred ms after
    // load, so an interior view open at that moment silently breaks its camera/lighting. Route each
    // board kind to its own renderer, exactly like every other replay call site in this file.
    if(S.lastBoard){
      if(S.lastBoard.kind === "interior3d") setInteriorBoard(S.lastBoard);
      else setBoard(S.lastBoard);
    }
    if(S.lastUnits) setUnits(S.lastUnits);
  }
  // TABLETOP-UNITS.md §U1 seam 5 / TABLETOP-VISION §9.8 (perf budget, "builders preloaded"): flip the
  // readiness flag now that every distinct whole-object module has settled (loaded or failed) — this
  // callback only fires once, module-scope, so `ready` only ever goes false->true, never back. A
  // caller (the U7 harness's warm-perf-loop, later) asserts this before timing trayFrom+setBoard, so
  // the budget measures a warm loop with every builder already resolved, not the async import tax.
  // This callback fires asynchronously (after the dynamic import() promises resolve) — by then the
  // `window.Theater = {...}` assignment below has already run synchronously, so `window.Theater`
  // always exists here.
  window.Theater.ready = true;
}, glbLoadScene); // BATTLE-THEATER T2: inject the GLTFLoader-backed scene loader (keeps theater-figures.js THREE-free)

// T3: THEATER_VERBS + theaterFxFromLedger re-exported on window.Theater so classic-script callers can
// reach them without their own import statement (ES-module scope is sealed, §2) — mirrors how every
// other Theater method is the classic-script-reachable surface for functionality that actually lives
// in an ES-module scope. cmTheaterNotify (src/world/render.js) is the one caller of fxFromLedger; it
// treats a missing window.Theater/fxFromLedger as a clean no-op (headless/jsdom), never a throw.
// reattach: the canvas re-parenting seam (battle-stage; renderWorld's innerHTML pass detaches the canvas).
window.Theater = {
  mount, reattach, setBoard, setInteriorBoard, setInteriorVariant, setUnits, setTextures, rotate, zoom, retire, play,
  verbs: THEATER_VERBS, fxFromLedger: theaterFxFromLedger,
  // GRAPHICS-ENGINE Part II §A: the standee-verb registry, re-exported the same "classic-script-
  // reachable surface" way THEATER_VERBS is above — no classic-script caller needs this today (play()
  // dispatches internally), but it keeps the surface symmetric and gives dev tooling/consoles the same
  // introspection theater-verbs.js already offers.
  standeeVerbs: STANDEE_VERBS
};

// DUNGEON-GRAPH.md U3 acceptance (3): "draw calls <= 1 per tile kind" — a read-only diagnostic so a
// capture/verify harness can assert the InstancedMesh count directly instead of trusting a screenshot.
// 0 before any setInteriorBoard call (no interior board mounted yet).
window.Theater.interiorMeshCount = function(){ return S.interiorMeshCount || 0; };
// BW2-3 MATERIAL TEXEL: how many folded-texture-file decodes are still in flight (async TextureLoader).
// A capture harness polls this to 0 before screenshotting so the walls/floors are actually painted.
window.Theater.interiorFileTexPending = function(){ return interiorMeshFileTexPending() || 0; }; // split B8: the counter moved with interiorFileTexture (src/ui/theater-interior-mesh.js) — read through its exported accessor

// DUNGEON-GRAPH.md U3 iteration-2 diagnostics (same "read-only, harness-facing" discipline as
// interiorMeshCount just above) — the capture rig's metrics.json needs to confirm every piece sprite
// actually resolved (not silently skipped for a texture-not-loaded/registry-miss reason) and that
// shadow-mapping is on for an interior board / restored off for a combat board.
window.Theater.interiorPiecesResolved = function(){ return S.interiorPiecesResolved || 0; };
window.Theater.interiorPiecesRequested = function(){ return S.interiorPiecesRequested || 0; };
window.Theater.interiorLightCount = function(){ return S.interiorLightCount || 0; };
window.Theater.interiorShadowCasterCount = function(){ return S.interiorShadowCasterCount || 0; };
// GRAPHICS-ENGINE.md GR2: same read-only harness-facing discipline — how many dressing cards mounted
// on the last setInteriorBoard call. 0 before any interior board / on a board with no data.dressing.
window.Theater.interiorDressingCount = function(){ return S.interiorDressingCount || 0; };
window.Theater.interiorDecalCount = function(){ return S.interiorDecalCount || 0; }; // VP6 item 4
// docs/DIEGETIC-LIGHT.md L-1 — harness-facing diagnostic + runtime toggle, same read-only/reversible
// convention as the study-rig's materials-on/off flag: how many light-shaft cones mounted on the last
// setInteriorBoard call (0 with the gate at its default-off), plus a runtime setter so a harness (or
// Adam, from the console) can flip ITR_LIGHT_CONE_ENABLED without editing source and remount to prove
// the flag is reversible.
window.Theater.interiorLightConeCount = function(){ return S.interiorLightConeCount || 0; };
window.Theater.setLightConeEnabled = function(v){ ITR_LIGHT_CONE_ENABLED = !!v; };
window.Theater.lightConeEnabled = function(){ return !!ITR_LIGHT_CONE_ENABLED; };
// LIGHT-CLOSE unit — harness-facing diagnostic + runtime toggle, same convention as the cone gate just
// above: how many glow discs actually mounted on the last setInteriorBoard call (0 for a bright/sky-lit
// profile once suppressed), plus a setter mirroring setLightConeEnabled's own reversibility so a
// harness (or Adam, from the console) can flip ITR_BRIGHT_SUPPRESS_PRACTICALS and remount to prove the
// suppression is load-bearing, not merely assumed.
window.Theater.interiorLightGlowCount = function(){ return S.interiorLightGlowCount || 0; };
window.Theater.setBrightPracticalsSuppressed = function(v){ ITR_BRIGHT_SUPPRESS_PRACTICALS = !!v; };
window.Theater.brightPracticalsSuppressed = function(){ return !!ITR_BRIGHT_SUPPRESS_PRACTICALS; };
// VQ2-RESPEC.md S4 — test-only seam (same "_xxxForTest" idiom as every other harness hook in this
// file): exposes the pure spriteEntryFor join function directly so a harness can drive the
// TIER 1 (bestiary-id map) / TIER 2 (normalized-name fallback) resolution WITHOUT going through
// figureFor/refFigure.build's full 3D-fallback machinery — the collision-class fixture (S4's
// RED-FIRST check) only needs the join outcome, not a built figure. Also exposes the fallback
// counter read-only so a harness can assert TIER 2 actually fired (or didn't).
window.Theater._spriteEntryForTest = function(recipeSlug){ return spriteEntryFor(recipeSlug); };
window.Theater._spriteJoinNameFallbackCountForTest = function(){ return SPRITE_JOIN_NAME_FALLBACK_COUNT; };
// CR-1 item 4 — the TIER 2 console.warn de-dupe Set, read-only size + a reset, so a harness can
// prove "warns once per slug, counter still climbs every hit" across repeated _spriteEntryForTest
// calls within a single subprocess instead of needing a fresh one per assertion.
window.Theater._spriteJoinNameFallbackWarnedSizeForTest = function(){ return SPRITE_JOIN_NAME_FALLBACK_WARNED.size; };
window.Theater._resetSpriteJoinNameFallbackWarnedForTest = function(){ SPRITE_JOIN_NAME_FALLBACK_WARNED.clear(); };
// VQ2-RESPEC.md §3 unit L2 — the demand-vs-null census read-out, same "_xxxForTest" idiom as every
// other harness hook in this file: a play-lens run (or any harness) reads a SUMMARIZED snapshot
// after each capture rather than poking GS.theaterCensus directly (GS is a classic-script global this
// ES-module scope doesn't otherwise expose a stable accessor for). Returns a fresh {counts, entries}
// object each call (a shallow copy of GS.theaterCensus's own two fields) — read-only, never mutates
// the live census; a caller wanting to "reset between shots" just remembers the prior counts/length
// and diffs, exactly like dev/play-lens.mjs's own manifest.json delta convention.
window.Theater._censusForTest = function(){
  const c = (typeof GS !== "undefined" && GS && GS.theaterCensus) ? GS.theaterCensus : { entries: [], counts: {} };
  return { counts: Object.assign({}, c.counts), entries: c.entries.slice() };
};
// VQ2-RESPEC.md §3 unit L2 — test-only seam exposing dressingTextureFor directly (mirrors
// _spriteEntryForTest's own "drive the pure resolution function without the full board-mount
// machinery" convention), so a harness can exercise seam 3's placeholder-card/resolved census
// recording for a bare slug without constructing a full interior board fixture.
window.Theater._dressingTextureForTest = function(slug){ return dressingTextureFor(slug); };
// docs/LIGHT-SIGHT-POLISH.md P-1 problem 3 — harness-facing diagnostic + runtime toggle, same
// convention as the cone gate just above: every mounted light-emitter marker (card OR nub) in the
// CURRENT interior scene graph, tagged by userData.lightEmitterMarker (see interiorBuildLightCard /
// interiorBuildLightEmitterNub), so a harness can assert "every glow disc has a visible emitter
// underneath it" directly against the live scene rather than trusting a screenshot alone.
window.Theater._interiorLightEmittersForTest = function(){
  const out = [];
  if(S.interiorGroup){
    S.interiorGroup.traverse((obj) => {
      if(obj.userData && obj.userData.lightEmitterMarker){
        out.push({ x: obj.position.x, y: obj.position.y, z: obj.position.z, kind: obj.userData.lightEmitterMarker });
      }
    });
  }
  return out;
};
window.Theater.setLightEmitterNubEnabled = function(v){ ITR_LIGHT_EMITTER_NUB_ENABLED = !!v; };
window.Theater.lightEmitterNubEnabled = function(){ return !!ITR_LIGHT_EMITTER_NUB_ENABLED; };
// E0 — VISIBLE PRACTICALS (docs/WALL-VOLUMES-PRACTICALS.md): same reversible-flag convention as every
// gate above — flips ITR_GLOW_DISC_DIAGNOSTIC so a harness can prove the production glowCount===0 claim
// is load-bearing (flip true, remount, glowCount moves) rather than vacuously zero for some other reason.
window.Theater.setGlowDiscDiagnosticForTest = function(v){ ITR_GLOW_DISC_DIAGNOSTIC = !!v; };
window.Theater.glowDiscDiagnosticEnabled = function(){ return !!ITR_GLOW_DISC_DIAGNOSTIC; };
// E0 — harness-facing diagnostic, same convention as _interiorLightEmittersForTest just above but for
// the NEW fixture system: every mounted fixture's own emitter submesh (userData.fixtureEmitter, set by
// interiorBuildFixtureGroup) in the CURRENT interior scene graph, at its WORLD position — so a harness
// can assert "every PointLight resolves exactly one visible fixture, emitter co-located" directly
// against the live scene rather than trusting a screenshot alone.
window.Theater._interiorFixtureEmittersForTest = function(){
  const out = [];
  if(S.interiorGroup){
    S.interiorGroup.traverse((obj) => {
      if(obj.userData && obj.userData.fixtureEmitter){
        const wp = obj.getWorldPosition ? obj.getWorldPosition(new THREE.Vector3()) : obj.position;
        const parent = obj.parent || {};
        out.push({
          x: wp.x, y: wp.y, z: wp.z,
          fixtureId: parent.userData ? parent.userData.fixtureId : undefined,
          mount: parent.userData ? parent.userData.mount : undefined,
          ownerSegIndex: parent.userData ? parent.userData.ownerSegIndex : undefined,
          emissiveIntensity: obj.material ? obj.material.emissiveIntensity : undefined,
        });
      }
    });
  }
  return out;
};
// P-1 problem 1/2 TEST-ONLY SEAMS — runtime toggles for the two RED-FIRST override flags declared
// alongside ITR_BRIGHT_REALM_FILL/ITR_EMISSIVE_PROFILES above (same reversible-flag convention as every
// other test seam on this surface).
window.Theater.setBrightRealmFillForceDefaultForTest = function(v){ ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST = !!v; };
window.Theater.setEmissiveFillDisabledForTest = function(v){ ITR_EMISSIVE_FILL_DISABLED_FOR_TEST = !!v; };
// LIGHT-CLOSE unit — same reversible-flag convention, isolates the COSMIC ALBEDO LIFT's own
// contribution from the emissive-light toggle just above (ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST,
// near ITR_EMISSIVE_ALBEDO_LIFT).
window.Theater.setEmissiveAlbedoLiftDisabledForTest = function(v){ ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST = !!v; };
// docs/DIEGETIC-LIGHT.md L-2 — harness-facing diagnostics + runtime toggle for the camera-key shadow
// retirement: the camera-key light's own current {position,castShadow,intensity} (null pre-mount), a
// setter mirroring setLightConeEnabled's convention above, and the LIVE shadow-casting point light(s)
// actually mounted in the current interior scene graph (isPointLight is the real THREE.PointLight
// marker — no separate userData tagging needed) so a harness can assert the shadow source sits at a
// KNOWN diegetic light's own position, not the camera's.
window.Theater._interiorCameraKeyForTest = function(){
  const dl = S.interiorCameraKey;
  if(!dl) return null;
  return { x: dl.position.x, y: dl.position.y, z: dl.position.z, castShadow: !!dl.castShadow, intensity: dl.intensity };
};
window.Theater.setCameraKeyCastsShadow = function(v){ ITR_CAMERA_KEY_CASTS_SHADOW = !!v; };
window.Theater.cameraKeyCastsShadow = function(){ return !!ITR_CAMERA_KEY_CASTS_SHADOW; };
// E0 — VISIBLE PRACTICALS: every PointLight now mounts as a CHILD of its own fixture group (positioned
// at the group-LOCAL emitterLocal, WALL-VOLUMES-PRACTICALS.md §E0), not a direct top-level `group`
// child at world-relative coordinates the way it did pre-E0 — so `obj.position` alone is no longer the
// light's effective world position for a wall-mount fixture (whose group itself carries a real
// position+rotation). getWorldPosition (walks the ancestor chain) is now the only correct read.
window.Theater._interiorShadowCastersForTest = function(){
  const out = [];
  if(S.interiorGroup){
    const wp = new THREE.Vector3();
    S.interiorGroup.traverse((obj) => {
      if(obj.isPointLight){
        obj.getWorldPosition(wp);
        out.push({ x: wp.x, y: wp.y, z: wp.z, castShadow: !!obj.castShadow, intensity: obj.intensity });
      }
    });
  }
  return out;
};
window.Theater.interiorMoteCount = function(){ return (S.moteGroup && S.moteGroup.children.length) || 0; }; // VP6 item 3
window.Theater.interiorDressingWorldPositions = function(){ return S.interiorDressingWorldPositions || []; };
// LIGHT-SIGHT-POLISH.md P-2 — harness-facing diagnostic, same read-only convention as
// interiorDressingWorldPositions above: one entry per mounted wall-hang EXTRUSION prop's REAL world
// position (post placement-fix push-to-wall-plane + mid-height lift), plus its rotY (the resolved
// wall-normal yaw) and the box's own authored depth (extrusionHeight is on g.userData already, per
// S.interiorWallPropsWorldPositions' own mapping in setInteriorBoard).
window.Theater.interiorWallPropsWorldPositions = function(){ return S.interiorWallPropsWorldPositions || []; };
window.Theater.interiorWallPropsCount = function(){ return S.interiorWallPropsCount || 0; };
// BW2-1b — harness-facing diagnostic, same read-only convention as interiorDressingWorldPositions
// above: one entry per mounted standee's REAL world position (post CLIP MARGIN nudge).
window.Theater.interiorPiecesWorldPositions = function(){ return S.interiorPiecesWorldPositions || []; };
// BW2-1b — TEST-ONLY SEAM: the FINAL (post-cutaway) pillar instance list — see S.interiorLastPillarList's
// own assignment comment in setInteriorBoard for why this proves stub-vs-full-height per instance
// without decomposing InstancedMesh matrices.
window.Theater._interiorPillarListForTest = function(){ return S.interiorLastPillarList || []; };
// S-1 OCCLUSION FADE — TEST-ONLY SEAMS: the post-cutaway WALL list (S.interiorLastWallList, wall's
// own peer to interiorLastPillarList — no such seam existed pre-S-1 since walls never had a per-
// figure sightline cutaway at all) + the separately-drawn ~5% GHOST lists for both kinds (the removed
// upper portions), so a harness can assert "ankle stub present + ghost present" per occluding
// instance without decomposing InstancedMesh matrices.
window.Theater._interiorWallListForTest = function(){ return S.interiorLastWallList || []; };
window.Theater._interiorWallGhostListForTest = function(){ return S.interiorLastWallGhostList || []; };
window.Theater._interiorPillarGhostListForTest = function(){ return S.interiorLastPillarGhostList || []; };
window.Theater._interiorDoorGhostListForTest = function(){ return S.interiorLastDoorGhostList || []; };
// STAGE-A A1 (docs/STAGE-A.md) — TEST-ONLY SEAMS, same read-only convention as the pillar/wall lists
// above: the exact per-instance lists the live floorMesh/doorMesh were built from, plus the DARKNESS
// PORTAL card list (empty unless ITR_ACTIVE_ROOM_ONLY is on and a focus room was requested) — lets
// dev/verify-active-room-only.mjs assert "no floor/wall/doorframe instance falls inside a non-kept
// neighbor room's rect" and "one portal card per boundary door" without decomposing InstancedMesh
// matrices.
window.Theater._interiorFloorListForTest = function(){ return S.interiorLastFloorList || []; };
window.Theater._interiorDoorListForTest = function(){ return S.interiorLastDoorList || []; };
window.Theater._interiorPortalListForTest = function(){ return S.interiorLastPortalList || []; };
// S-1 — TEST-ONLY SEAM: see ITR_OCCLUSION_FADE_DISABLED_FOR_TEST's own declaration comment — flips the
// whole ankle+ghost pass off for a genuine RED-FIRST baseline render (dev/verify-occlusion-fade.mjs).
window.Theater._setOcclusionFadeDisabledForTest = function(v){ ITR_OCCLUSION_FADE_DISABLED_FOR_TEST = !!v; };
// STAGE-A A4 — TEST-ONLY SEAMS: read-only access to the persistent per-instance fade state
// (S.occlusionFadeState) so a harness can prove the TWEEN (fake-clock start/mid/end distinct opacity)
// and the RECLASSIFY HYSTERESIS (a held id's committed state/opacity are untouched by a small camera
// move) without decomposing InstancedMesh matrices or a live GL read. `id` is itrOcclusionIdFor's own
// exact id string — exposed below so a harness never has to duplicate the rounding rule.
window.Theater._occlusionIdFor = function(kind, x, z, yBase){ return itrOcclusionIdFor(kind, x, z, yBase); };
window.Theater._occlusionFadeEntryForTest = function(id){
  const entry = S.occlusionFadeState && S.occlusionFadeState.get(id);
  return entry ? { blocking: entry.blocking, opacity: entry.opacity, fading: !!entry.fading } : null;
};
// the LIVE material.opacity value(s) actually mounted for this id's ghost mesh(es) right now — a
// stricter proof than reading entry.opacity alone (that number is what the tween WROTE; this reads
// what the real THREE material objects currently hold, catching any wiring gap between the two).
// CL-R0/CL-R3 evidence seam (2026-07-23): the WHOLE live fade map, not one id at a time. Adam asked
// whether the wall cutaway tech had been lost; answering that needs "how many occluders did this
// frame classify, and how many are blocking", which no existing seam could report. Read-only.
window.Theater._occlusionFadeSummaryForTest = function(){
  if(!S.occlusionFadeState) return { total: 0, blocking: 0, faded: 0, disabledForTest: !!ITR_OCCLUSION_FADE_DISABLED_FOR_TEST, rows: [] };
  const rows = [];
  S.occlusionFadeState.forEach(function(e, id){
    rows.push({ id: id, blocking: !!e.blocking, opacity: e.opacity, materials: (e.materials || []).length });
  });
  return {
    total: rows.length,
    blocking: rows.filter(function(r){ return r.blocking; }).length,
    faded: rows.filter(function(r){ return r.opacity != null && r.opacity < 0.99; }).length,
    disabledForTest: !!ITR_OCCLUSION_FADE_DISABLED_FOR_TEST,
    rows: rows.slice(0, 60),
  };
};
window.Theater._occlusionGhostMaterialOpacityForTest = function(id){
  const entry = S.occlusionFadeState && S.occlusionFadeState.get(id);
  if(!entry || !entry.materials) return null;
  return entry.materials.map((m) => (m ? m.opacity : null));
};
// the live camera bearing + hysteresis anchor (degrees) — lets a harness assert the RAW bearing math
// directly against S.occlusionClassifyBearingDeg without re-deriving atan2 itself.
window.Theater._occlusionBearingForTest = function(){
  return {
    camera: itrOcclusionBearingDeg(window.Theater._interiorCameraPositionForTest()),
    anchor: (S.occlusionClassifyBearingDeg != null) ? S.occlusionClassifyBearingDeg : null
  };
};
// ROOM-SHELL COMPILER — TEST/HARNESS SEAM: flips ITR_ROOM_SHELL live (dev/verify-room-shell-render.mjs's
// own before[flag off]/after[flag on] A-B capture), same convention as the setter just above.
window.Theater._setRoomShellEnabled = function(v){ ITR_ROOM_SHELL = !!v; };
window.Theater._roomShellEnabled = function(){ return ITR_ROOM_SHELL; };
// UNIT G2 — TEST/HARNESS SEAM: flips the ROOM_SHELL_POLYGON_KERNEL migration switch live
// (dev/verify-room-shell-oss.mjs's own forced-"oss" capture; dev/battle-gate/capture-stage-c3-shapes.mjs
// when run with the flag forced). Rejects anything but the three literal values, falling back to
// "legacy" — mirrors compileRoomShellData's own resolution rule, so this test seam can never leave the
// live app in an unrecognized kernel mode.
window.Theater._setRoomShellPolygonKernel = function(v){
  ROOM_SHELL_POLYGON_KERNEL_FLAG = (v === "oss" || v === "oss-compare") ? v : "legacy";
};
window.Theater._roomShellPolygonKernel = function(){ return ROOM_SHELL_POLYGON_KERNEL_FLAG; };
// the compiled shell's own last-build diagnostics (geometry meta + logical cell<->triangle map) — null
// whenever ITR_ROOM_SHELL is off or the active room has no compiled cells yet.
window.Theater._interiorRoomShellForTest = function(){ return S.interiorLastRoomShell || null; };
// ROOM-SHELL COMPILER — TEST SEAM: per-mesh primitive counts straight off the LIVE mounted
// S.interiorGroup, tagged by each mesh's own userData.interiorKind stamp (interiorBuildInstancedMesh's
// plain kind string for the per-cell path; "room-shell-floor/wall/riser" for the compiled path, set at
// this file's own wire-in call site). `count` is the InstancedMesh instance count for the per-cell
// kinds (the concrete O(cells) figure dev/verify-room-shell-render.mjs compares against the compiled
// path's O(segments) triangle count) or 1 for an ordinary (non-instanced) Mesh.
window.Theater._interiorGroupMeshInfoForTest = function(){
  if(!S.interiorGroup) return [];
  return S.interiorGroup.children.map((m) => ({
    kind: (m.userData && m.userData.interiorKind) || null,
    isInstanced: !!(m.isInstancedMesh),
    count: m.isInstancedMesh ? m.count : 1,
    triangleCount: (m.geometry && m.geometry.index) ? m.geometry.index.count / 3 : null,
    colorHex: (m.material && !Array.isArray(m.material) && m.material.color) ? "#" + m.material.color.getHexString() : null,
    // mapInfo: whether this mesh's own material texture has actually finished loading (the room-shell
    // path's own file-texture branch loads async via THREE.TextureLoader) — a harness/console check
    // that a "flat, no visible pattern" render is a genuine bug and not just a load-timing race.
    mapInfo: (m.material && !Array.isArray(m.material) && m.material.map) ? {
      hasImage: !!m.material.map.image, complete: !!(m.material.map.image && m.material.map.image.complete !== false),
      repeat: [m.material.map.repeat.x, m.material.map.repeat.y],
    } : null,
  }));
};
// BW2-1b — TEST-ONLY SEAM: a REAL THREE.Raycaster occlusion check against the LIVE mounted geometry —
// casts from the CURRENT S.camera.position toward targetWorldPos, intersects only the SOLID instance
// kinds (wall/pillar/doorframe — tagged via interiorBuildInstancedMesh's own mesh.userData.interiorKind
// stamp, above) that sit STRICTLY CLOSER than the target itself (raycaster.far = dist-0.05, so the
// standee's own base/plinth just past that distance is never mistaken for an occluder of itself).
// THREE's own InstancedMesh.raycast already resolves per-instance hits (instanceId) — this is the
// genuine renderer-side "is anything actually in the way" proof BW2-1b's spec calls for, not a
// re-derivation of the pure math _occlusionLawForTest above already covers.
window.Theater._interiorRaycastClearForTest = function(targetWorldPos){
  if(!S.camera || !S.interiorGroup || !targetWorldPos) return null;
  const camPos = S.camera.position.clone();
  const target = new THREE.Vector3(targetWorldPos.x, targetWorldPos.y, targetWorldPos.z);
  const toTarget = target.clone().sub(camPos);
  const dist = toTarget.length();
  if(dist < 1e-6) return { clear: true, dist: 0, hits: [] };
  const dir = toTarget.clone().normalize();
  const raycaster = new THREE.Raycaster(camPos, dir, 0, Math.max(0, dist - 0.05));
  const solids = S.interiorGroup.children.filter((m) => m.userData && (m.userData.interiorKind === "wall" || m.userData.interiorKind === "pillar" || m.userData.interiorKind === "doorframe"));
  const hits = raycaster.intersectObjects(solids, false);
  return { clear: hits.length === 0, dist, hits: hits.map((h) => ({ kind: h.object.userData.interiorKind, distance: h.distance, instanceId: h.instanceId })) };
};
window.Theater.interiorBoardOrigin = function(){ return S.boardOrigin ? { cx: S.boardOrigin.cx, cz: S.boardOrigin.cz } : null; };
// docs/DIEGETIC-LIGHT.md L-3/L-4 — harness-facing diagnostic: the CURRENT scene-wide light values the
// rigOn override block (setInteriorBoard) actually landed on, plus the resolved profile key, so a
// harness (or Adam, dialing from the console) can read the live numbers directly instead of trusting a
// pixel measurement alone to prove which branch (dim dungeon vs ITR_BRIGHT_SCENE_*) fired.
/* CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — read-only diagnostics for the Clayroom fixture, in this
   file's established `window.Theater._*ForTest` convention. They exist so a capture receipt and the
   verifier can both answer "which system owns every visible surface?" and "what camera produced this
   frame?" from the LIVE scene instead of from source-reading. Null-safe when no clay room is
   mounted; none of them mutates anything. */
window.Theater._claySurfaceCensusForTest = function(){
  return (typeof clayRoomSurfaceCensus === "function" && S.interiorGroup) ? clayRoomSurfaceCensus() : null;
};
window.Theater._clayTraversabilityGridForTest = function(){
  return S.clayGridMesh && S.clayGridMesh.userData
    ? Object.assign({}, S.clayGridMesh.userData.clayGridReport || {})
    : null;
};
// CL-R3a — the omission decision set, verbatim off S (deterministic board data, echoed into every
// capture receipt so a frame names exactly which wall segments were omitted and by which rule).
window.Theater._wallOmissionForTest = function(){ return S.wallOmissionReport || null; };
// door tranche — the applied door-mount offsets (shell-aware default + the workbench tune)
window.Theater._doorMountForTest = function(){ return S.doorMountReport || null; };
// Clayroom proof seam: read the REAL mounted hinge/leaf after a State-tab transition. This is
// deliberately read-only; the State tab below is the only dev affordance that authors a transition.
window.Theater._clayDoorProofForTest = function(){
  return (typeof clayRoomDoorProofState === "function") ? clayRoomDoorProofState() : null;
};
window.Theater._clayLightingProofForTest = function(){
  return (typeof clayRoomLightingSnapshot === "function")
    ? { snapshot: clayRoomLightingSnapshot("test-read"), probe: S.clayRoomLightingProbe || null }
    : null;
};
window.Theater._clayLightingRecipeForTest = function(){
  const id = S.clayRoomLightRecipeId || null;
  const recipe = id && LIGHT_TUNABLES.profiles[id] ? LIGHT_TUNABLES.profiles[id] : null;
  return recipe ? lightRecipeDeepClone(recipe) : null;
};
window.Theater._claySetLightingRecipeForTest = function(id){
  return (typeof clayRoomSetLightingRecipe === "function")
    ? clayRoomSetLightingRecipe(id, "clayroom-test-seam")
    : false;
};
window.Theater._clayMoodLayerForTest = function(){
  return (typeof clayRoomMoodSnapshot === "function") ? clayRoomMoodSnapshot() : null;
};
window.Theater._claySetMoodLayerForTest = function(id){
  return (typeof clayRoomSetMoodLayer === "function")
    ? clayRoomSetMoodLayer(id, "clayroom-mood-test-seam")
    : false;
};
window.Theater._clayLightingPixelMetricsForTest = function(){
  return (typeof clayRoomLightingPixelMetrics === "function")
    ? clayRoomLightingPixelMetrics(true)
    : null;
};
window.Theater._claySetLightingPreviewSeedForTest = function(seed){
  if(CLAY_ROOM_LIGHT_PREVIEW_SEEDS.indexOf(seed) < 0) return false;
  S.clayRoomPreviewSeed = seed;
  S.clayRoomPixelMetricsCache = null;
  return clayRoomSetLightingRecipe(S.clayRoomLightRecipeId || "torchlit", "clayroom-seed-test-seam");
};
window.Theater._clayCaptureLightingMatrixForTest = function(){
  return (typeof clayRoomCaptureLightingMatrix === "function")
    ? clayRoomCaptureLightingMatrix()
    : Promise.resolve(null);
};
window.Theater._clayLightingMatrixArtifactForTest = function(){
  return S.clayRoomLightingMatrixArtifact || null;
};
window.Theater._clayLightingBenchForTest = function(){
  const bench = S.clayRoomLightingBenchGroup;
  const overlays = S.clayRoomLightOverlayGroup;
  return {
    fixtureId: S.clayRoomFixtureId || null,
    benchMounted: !!(bench && bench.parent),
    primitives: bench ? bench.children.map(function(mesh){
      return {
        id: mesh.userData.clayBenchPrimitive,
        primitive: mesh.userData.clayBenchPrimitiveType,
        role: mesh.userData.interiorKind,
        castShadow: !!mesh.castShadow,
        receiveShadow: !!mesh.receiveShadow
      };
    }) : [],
    overlayModes: Object.assign({}, S.clayRoomLightOverlayModes || {}),
    overlays: overlays ? overlays.children.map(function(line){
      return {
        kind: line.userData.clayLightOverlayKind,
        lightId: line.userData.lightId,
        rangeFraction: line.userData.rangeFraction == null ? null : line.userData.rangeFraction,
        range: line.userData.range == null ? null : line.userData.range
      };
    }) : [],
    motesSuppressed: S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID && !S.moteGroup,
    previewSeed: S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0],
    lorePreviewRecipes: CLAY_ROOM_LORE_LIGHT_PREVIEWS.map(function(row){ return row.id; }),
    matrixRecipes: CLAY_ROOM_LIGHTING_MATRIX_RECIPES.slice()
  };
};
window.Theater._clayMaterialBenchForTest = function(){
  return (typeof clayRoomMaterialBenchSnapshot === "function")
    ? clayRoomMaterialBenchSnapshot()
    : null;
};
window.Theater._claySetMaterialModeForTest = function(mode){
  return (typeof clayRoomSetMaterialMode === "function")
    ? clayRoomSetMaterialMode(mode)
    : false;
};
window.Theater._clayTrimBenchForTest = function(){
  return (typeof clayRoomTrimBenchSnapshot === "function")
    ? clayRoomTrimBenchSnapshot()
    : null;
};
window.Theater._claySetTrimModeForTest = function(mode){
  return (typeof clayRoomSetTrimMode === "function")
    ? clayRoomSetTrimMode(mode)
    : false;
};
window.Theater._clayStructureBenchForTest = function(){
  if(!S.clayRoomStructureReport) return null;
  const group = S.clayRoomStructureBenchGroup;
  let mountedMeshes = 0, shadowCasters = 0, shadowReceivers = 0, hostSuppressedMeshes = 0;
  let frontFaceShadowCasters = 0, automaticShadowCasters = 0;
  if(S.interiorGroup){
    S.interiorGroup.traverse(function(node){
      if(node.userData && node.userData.clayStructureHostSuppressed) hostSuppressedMeshes++;
    });
  }
  if(group){
    group.traverse(function(node){
      if(!node.isMesh) return;
      mountedMeshes++;
      if(node.castShadow){
        shadowCasters++;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        if(mats.length && mats.every(function(mat){ return mat && mat.shadowSide === THREE.FrontSide; })){
          frontFaceShadowCasters++;
        } else {
          automaticShadowCasters++;
        }
      }
      if(node.receiveShadow) shadowReceivers++;
    });
  }
  const directionalShadowLights = [];
  if(S.scene){
    S.scene.traverse(function(node){
      if(!node || !node.isDirectionalLight || !node.castShadow || !node.shadow) return;
      directionalShadowLights.push({
        id: node.userData && node.userData.lightId || node.name || "directional",
        bias: +node.shadow.bias,
        normalBias: +node.shadow.normalBias,
        mapSize: [node.shadow.mapSize.x, node.shadow.mapSize.y]
      });
    });
  }
  const fade = window.Theater._occlusionFadeSummaryForTest();
  return Object.assign({}, S.clayRoomStructureReport, {
    view: S.clayRoomStructureView || CLAY_STRUCTURE_BENCH_FIXTURE.defaultView,
    mounted: !!(group && group.parent),
    mountedMeshes,
    shadowCasters,
    shadowReceivers,
    shadowContact: {
      rendererFilter: S.renderer && S.renderer.shadowMap
        ? (S.renderer.shadowMap.type === THREE.PCFShadowMap ? "pcf" : "other")
        : "none",
      frontFaceShadowCasters,
      automaticShadowCasters,
      directionalLights: directionalShadowLights
    },
    traversabilityGrid: S.clayGridMesh && S.clayGridMesh.userData
      ? Object.assign({}, S.clayGridMesh.userData.clayGridReport || {})
      : null,
    mood: (typeof clayRoomMoodSnapshot === "function") ? clayRoomMoodSnapshot() : null,
    hostSuppressedMeshes,
    climb: clayRoomStructureClimbSnapshot(),
    parking: S.clayRoomStructureParking ? Object.assign({}, S.clayRoomStructureParking) : null,
    cameraSideOmission: (S.clayRoomStructureReport && S.clayRoomStructureReport.cameraSideOmission)
      || S.wallOmissionReport || null,
    dynamicCutaway: {
      system: "itrOcclusionClassify",
      disabledForTest: !!fade.disabledForTest,
      candidates: fade.total,
      blocking: fade.blocking,
      faded: fade.faded
    }
  });
};
window.Theater._claySetStructureViewForTest = function(view){
  return clayRoomSetStructureView(view);
};
window.Theater._claySetStructureStagedForTest = function(staged){
  return clayRoomSetStructureStaged(!!staged);
};
window.Theater._claySetStructureDoorStateForTest = function(state){
  return clayRoomSetStructureDoorState(state);
};
window.Theater._claySelectStructureClimbTargetForTest = function(id){
  return clayRoomStructureClimbTargetSet(id, null, null);
};
window.Theater._clayResolveStructureClimbForTest = function(d20, modifier){
  return clayRoomStructureClimbAttempt(d20, modifier);
};
window.Theater._clayResetStructureClimbForTest = function(){
  return clayRoomStructureClimbReset();
};
window.Theater._clayFocusStructureSpecForTest = function(id, zoom){
  return clayRoomStructureFocusSpec(id, zoom);
};
window.Theater._clayFocusStructureProofForTest = function(family, zoom){
  return clayRoomStructureFocusProofFamily(family, zoom);
};
window.Theater._clayParkStructureStepForTest = function(id, stepIndex, animate){
  return clayRoomStructureParkActorOnStep(id, stepIndex, { animate: !!animate });
};
window.Theater._claySetFixtureForTest = function(id){
  return (typeof clayRoomSetFixture === "function")
    ? clayRoomSetFixture(id, "clayroom-fixture-test-seam")
    : false;
};
function clayRoomSpriteFigures(){
  const rows = [];
  if(!S.interiorGroup || typeof S.interiorGroup.traverse !== "function") return rows;
  S.interiorGroup.traverse(function(node){
    if(!node || !node.userData || !node.userData.sprite) return;
    rows.push(node);
  });
  return rows;
}
function clayRoomSetSelectedSprite(slug){
  const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
  if(!fixture.cast.some(function(row){ return row.slug === slug; })) return false;
  S.clayRoomSelectedSpriteSlug = slug;
  S.clayRoomSelectedId = slug;
  if(typeof S.clayRoomWorkbenchSelect === "function") S.clayRoomWorkbenchSelect(slug, "sprite lineup");
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}
function clayRoomSetSelectedSpriteView(mode){
  const offsets = { face: 0, angled: Math.PI / 4, edge: Math.PI / 2 };
  if(!Object.prototype.hasOwnProperty.call(offsets, mode)) return false;
  const selected = S.clayRoomSelectedSpriteSlug;
  clayRoomSpriteFigures().forEach(function(node){
    if(node.userData.sceneObjectId === selected){
      node.userData.claySpriteViewYawOffset = offsets[mode];
    }
  });
  S.clayRoomSelectedSpriteView = mode;
  S.standeeCollisionDirty = true;
  markDirty();
  scheduleRender();
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}
function clayRoomSpriteCitizenshipSnapshot(){
  if(!S.clayRoomRecord) return null;
  const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
  const castBySlug = {};
  fixture.cast.forEach(function(row){ castBySlug[row.slug] = row; });
  const figures = [];
  const stairs = [];
  clayRoomSpriteFigures().forEach(function(node){
    const stairSample = node.userData.claySpriteStairSample;
    if(stairSample){
      stairs.push({
        view: stairSample,
        supportDepth: node.userData.interiorBaseDepth,
        treadDepth: node.userData.stairTreadDepth,
        stairFit: !!node.userData.stairFit
      });
      return;
    }
    const spriteSlug = node.userData.sceneObjectId;
    const spec = castBySlug[spriteSlug];
    if(!spec) return;
    const registry = spriteEntryFor(spriteSlug) || {};
    figures.push({
      slug: spriteSlug,
      label: spec.label,
      stress: spec.stress,
      canonicalFeet: registry.worldHeight == null ? null : registry.worldHeight,
      renderedWorldHeight: node.userData.interiorHeight,
      renderedWorldWidth: node.userData.interiorWidth,
      tacticalSpanCells: node.userData.tacticalSpanCells,
      supportWidth: node.userData.interiorBaseWidth,
      supportDepth: node.userData.interiorBaseDepth,
      treadDepth: node.userData.stairTreadDepth,
      stairFit: !!node.userData.stairFit,
      shell: !!node.userData.standeeSideShell,
      footX: node.userData.footX,
      footY: node.userData.footY,
      contentBounds: node.userData.contentBounds,
      alphaCutoff: node.userData.alphaCutoff,
      shadowSilhouette: node.userData.spriteBillboardMesh ? {
        planeCasts: !!node.userData.spriteBillboardMesh.castShadow,
        alphaDepth: !!(node.userData.spriteBillboardMesh.customDepthMaterial
          && node.userData.spriteBillboardMesh.customDepthMaterial.map
          && node.userData.spriteBillboardMesh.customDepthMaterial.alphaTest === node.userData.alphaCutoff),
        alphaDistance: !!(node.userData.spriteBillboardMesh.customDistanceMaterial
          && node.userData.spriteBillboardMesh.customDistanceMaterial.map
          && node.userData.spriteBillboardMesh.customDistanceMaterial.alphaTest === node.userData.alphaCutoff),
        shellCasts: !!(node.userData.standeeSideShell && node.userData.standeeSideShell.castShadow)
      } : null,
      collisionRelocated: !!node.userData.standeeCollisionRelocated,
      collisionNudge: [
        +(node.userData.standeeCollisionNudgeX || 0).toFixed(4),
        +(node.userData.standeeCollisionNudgeZ || 0).toFixed(4)
      ],
      contactShadow: node.userData.contactBlobMesh ? {
        linked: node.userData.contactBlobMesh.userData.linkedSceneObjectId === node.userData.sceneObjectId,
        poolDiameter: node.userData.contactBlobMesh.userData.contactPoolDiameter,
        offset: node.userData.contactBlobMesh.userData.contactOffset,
        blendMode: node.userData.contactBlobMesh.userData.contactBlendMode,
        multiplyIdentityRim: !!node.userData.contactBlobMesh.userData.contactMultiplyIdentityRim
      } : null,
      selectionBaseRingGlow: !!(node.userData.standeeBaseMesh
        && node.userData.standeeBaseMesh.userData.claySelectionBaseRingGlow),
      selectionBaseNeon: node.userData.claySelectionBaseNeon ? {
        linked: node.userData.claySelectionBaseNeon.userData.linkedSceneObjectId === node.userData.sceneObjectId,
        visible: !!node.userData.claySelectionBaseNeon.visible,
        source: node.userData.claySelectionBaseNeon.userData.emissionSource,
        footprintShape: node.userData.claySelectionBaseNeon.userData.footprintShape,
        width: node.userData.claySelectionBaseNeon.userData.spillWidth,
        depth: node.userData.claySelectionBaseNeon.userData.spillDepth,
        additive: node.userData.claySelectionBaseNeon.material
          && node.userData.claySelectionBaseNeon.material.blending === THREE.AdditiveBlending,
        centerPointLight: false,
        castShadow: !!node.userData.claySelectionBaseNeon.castShadow
      } : null,
      regenRecommended: !!node.userData.spriteRegenRecommended,
      selected: spriteSlug === S.clayRoomSelectedSpriteSlug
    });
  });
  figures.sort(function(a, b){
    return fixture.cast.findIndex(function(row){ return row.slug === a.slug; })
      - fixture.cast.findIndex(function(row){ return row.slug === b.slug; });
  });
  return {
    fixtureId: S.clayRoomFixtureId,
    fixtureVersion: fixture.version,
    scaleMode: S.clayRoomSpriteScaleMode || "diagnostic-cap",
    selectedSlug: S.clayRoomSelectedSpriteSlug || fixture.selectedSlug,
    selectedView: S.clayRoomSelectedSpriteView || "face",
    supportForm: "shallow-rounded-strip",
    tacticalFootprintSeparate: true,
    collisionAudit: Object.assign({}, S.standeeCollisionAudit || {
      pieces: 0, checkedPairs: 0, relocations: 0, remainingOverlaps: null
    }),
    cameraFill: S.spriteCameraFill ? {
      enabled: S.spriteCameraFill.intensity > 0,
      spriteLayer: SPRITE_CAMERA_FILL_LAYER,
      castShadow: !!S.spriteCameraFill.castShadow,
      intensity: +S.spriteCameraFill.intensity.toFixed(4),
      distance: +S.spriteCameraFill.distance.toFixed(4),
      decay: S.spriteCameraFill.decay
    } : null,
    environmentFormFill: {
      kind: "hemisphere",
      intensity: S.hemiLight ? +S.hemiLight.intensity.toFixed(4) : null,
      diagnosticFloor: ITR_SHADOW_FORM_HEMI_FLOOR,
      castShadow: false
    },
    presentationCapFeet: [fixture.candidatePresentationCap.minFeet, fixture.candidatePresentationCap.maxFeet],
    lineup: figures,
    stairSamples: stairs,
    regenRecommended: figures.filter(function(row){ return row.regenRecommended; }).map(function(row){ return row.slug; })
  };
}
window.Theater._claySpriteCitizenshipForTest = function(){
  return clayRoomSpriteCitizenshipSnapshot();
};
window.Theater._claySetSpriteScaleModeForTest = function(mode){
  return clayRoomSetSpriteScaleMode(mode, "clayroom-sprite-scale-test-seam");
};
window.Theater._claySelectSpriteForTest = function(slug){
  return clayRoomSetSelectedSprite(slug);
};
window.Theater._claySetSelectedSpriteViewForTest = function(mode){
  return clayRoomSetSelectedSpriteView(mode);
};
window.Theater._clayMovementProofForTest = function(){
  const session = (typeof clayRoomMovementSession === "function") ? clayRoomMovementSession() : null;
  if(!session || typeof tqMovementRanges !== "function") return null;
  const actor = session.state.actors.find(function(row){ return row.id === session.fixture.actorId; });
  const connection = session.state.connections.find(function(row){ return row.id === session.fixture.connectionId; });
  return {
    stateRevision: session.state.revision,
    actor: actor ? { id: actor.id, sceneId: actor.sceneId, cellId: actor.cellId, speedFt: actor.speedFt } : null,
    connection: connection ? {
      id: connection.id, version: connection.version, state: connection.state
    } : null,
    ranges: tqMovementRanges(session.fixture.space, session.state, session.fixture.actorId),
    preview: session.preview || null,
    lastReceipt: session.lastReceipt || null,
    busy: !!session.busy,
    animation: session.animationProof || null,
    overlay: S.clayRoomMovementOverlaySummary || null
  };
};
window.Theater._claySetMovementOverlayVisibleForTest = function(visible){
  if(!S.clayRoomMovementOverlayGroup) return false;
  S.clayRoomMovementOverlayGroup.visible = visible !== false;
  return S.clayRoomMovementOverlayGroup.visible;
};
window.Theater._clayProvenanceAuditForTest = function(){
  return (typeof clayRoomProvenanceAudit === "function") ? clayRoomProvenanceAudit() : null;
};
// The camera pose seam the CL-R0 "before" capture could not record because it did not exist. A
// capture receipt without the camera that produced it is not a reproducible receipt.
window.Theater._clayCameraPoseForTest = function(){
  if(!S.camera) return null;
  const t = S.cameraLookTarget;
  return {
    kind: S.camera.isPerspectiveCamera ? "perspective" : "orthographic",
    fov: S.camera.isPerspectiveCamera ? S.camera.fov : null,
    zoom: S.camera.isPerspectiveCamera ? null : S.camera.zoom,
    position: [+S.camera.position.x.toFixed(4), +S.camera.position.y.toFixed(4), +S.camera.position.z.toFixed(4)],
    target: t ? [+t.x.toFixed(4), +t.y.toFixed(4), +t.z.toFixed(4)] : null,
    near: S.camera.near, far: S.camera.far,
    clayZoom: S.clayCamZoom || 1,
    clayZoomRange: [CLAY_CAM_ZOOM_MIN, CLAY_CAM_ZOOM_MAX],
  };
};
window.Theater._interiorSceneLightsForTest = function(){
  return {
    profileKey: S.lightProfileKey || null,
    ambient: S.ambientLight ? S.ambientLight.intensity : null,
    hemi: S.hemiLight ? S.hemiLight.intensity : null,
    key: S.keyLight ? S.keyLight.intensity : null,
    fill: S.fillLight ? S.fillLight.intensity : null,
  };
};
window.Theater.shadowMapEnabled = function(){ return !!(S.renderer && S.renderer.shadowMap.enabled); };
// CL-R3 contact-light diagnosis. Positive shadow normal-bias offsets the receiver used for the
// shadow comparison away from its real surface. At perpendicular/planar contacts that can separate
// the shadow from the geometry ("peter panning") even when the meshes physically interpenetrate.
// This test-only seam reads or temporarily sweeps the live shadow lights so the capture rig can
// distinguish geometry, GTAO, and shadow-map registration without editing an authored light lock
// between frames.
window.Theater._clayShadowContactForTest = function(mode){
  const rows = [];
  if(!S.scene) return rows;
  const rendererShadow = S.renderer && S.renderer.shadowMap ? S.renderer.shadowMap : null;
  let shadowAllocationChanged = false;
  let materialShadowSide = null;
  if(mode && typeof mode === "object" && rendererShadow && typeof mode.filter === "string"){
    const filterTypes = {
      basic: THREE.BasicShadowMap,
      pcf: THREE.PCFShadowMap,
      "pcf-soft": THREE.PCFSoftShadowMap,
      vsm: THREE.VSMShadowMap
    };
    if(Object.prototype.hasOwnProperty.call(filterTypes, mode.filter)
      && rendererShadow.type !== filterTypes[mode.filter]){
      rendererShadow.type = filterTypes[mode.filter];
      shadowAllocationChanged = true;
    }
  }
  if(mode && typeof mode === "object" && typeof mode.shadowSide === "string"){
    const shadowSides = {
      auto: null,
      front: THREE.FrontSide,
      back: THREE.BackSide,
      double: THREE.DoubleSide
    };
    if(Object.prototype.hasOwnProperty.call(shadowSides, mode.shadowSide)){
      materialShadowSide = mode.shadowSide;
      S.scene.traverse(function(obj){
        if(!obj || !obj.isMesh || !obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function(mat){
          if(!mat) return;
          mat.shadowSide = shadowSides[mode.shadowSide];
          mat.needsUpdate = true;
        });
      });
      shadowAllocationChanged = true;
    }
  }
  S.scene.traverse(function(light){
    if(!light || !light.isLight || !light.shadow) return;
    if(mode && typeof mode === "object"){
      if(typeof mode.castShadow === "boolean") light.castShadow = mode.castShadow;
      if(Number.isFinite(Number(mode.bias))) light.shadow.bias = Number(mode.bias);
      if(Number.isFinite(Number(mode.normalBias))) light.shadow.normalBias = Number(mode.normalBias);
      if([256, 512, 1024, 2048, 4096].indexOf(Number(mode.mapSize)) >= 0
        && (light.shadow.mapSize.x !== Number(mode.mapSize)
          || light.shadow.mapSize.y !== Number(mode.mapSize))){
        light.shadow.mapSize.set(Number(mode.mapSize), Number(mode.mapSize));
        shadowAllocationChanged = true;
      }
      if(shadowAllocationChanged && light.shadow.map){
        light.shadow.map.dispose();
        light.shadow.map = null;
      }
    }
    rows.push({
      id: light.userData && (light.userData.lightId || light.userData.sourceRef) || light.name || light.type,
      type: light.type,
      castShadow: !!light.castShadow,
      bias: Number(light.shadow.bias) || 0,
      normalBias: Number(light.shadow.normalBias) || 0,
      mapSize: light.shadow.mapSize
        ? [light.shadow.mapSize.x, light.shadow.mapSize.y]
        : null
    });
  });
  if(mode && typeof mode === "object"){
    if(rendererShadow) rendererShadow.needsUpdate = true;
    if(shadowAllocationChanged){
      S.scene.traverse(function(obj){
        if(!obj || !obj.isMesh || !obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function(mat){ if(mat) mat.needsUpdate = true; });
      });
    }
    markDirty();
  }
  rows.renderer = {
    type: rendererShadow ? rendererShadow.type : null,
    filter: rendererShadow
      ? (rendererShadow.type === THREE.PCFSoftShadowMap ? "pcf-soft"
        : (rendererShadow.type === THREE.PCFShadowMap ? "pcf"
          : (rendererShadow.type === THREE.BasicShadowMap ? "basic"
            : (rendererShadow.type === THREE.VSMShadowMap ? "vsm" : "unknown"))))
      : null,
    materialShadowSide
  };
  return rows;
};
// ENV-1 (docs/ENV-EXTERIOR-WAVE.md) — harness-facing diagnostic for the TABLETOP channel (setBoard),
// same read-only convention as _interiorSceneLightsForTest above but for the flat-tray light rig:
// the resolved profile key, live ambient/point-light state, and the actual scene.background hex
// setBoard just set — so a harness can assert the void/ambient values directly (not just infer them
// from a pixel measurement) and prove which branch (protection-set vs TABLETOP_EXTERIOR_LOOK) fired.
window.Theater._tabletopSceneLightsForTest = function(){
  return {
    profileKey: S.lightProfileKey || null,
    ambient: S.ambientLight ? S.ambientLight.intensity : null,
    // ENV-1B: castShadow/shadow.mapSize/shadow.bias ride along so a harness can assert the
    // applyTabletopShadowCasters contract directly (every point casts, at TABLETOP_SHADOW_MAP_SIZE)
    // without inferring it from a pixel measurement.
    // ENV-1c: `position` rides along too (additive — every existing consumer of this accessor ignores
    // unknown fields) so a harness can assert the celestial-arc key-light DIRECTION directly (the
    // dawn-vs-noon / morning-vs-evening RED-FIRST checks this unit's own verification requires),
    // rather than inferring it purely from a shadow-region pixel measurement.
    points: (S.pointLights || []).map((l) => ({
      intensity: l.intensity, color: l.color ? l.color.getHex() : null,
      castShadow: !!l.castShadow, shadowMapSize: l.shadow ? l.shadow.mapSize.x : null, shadowBias: l.shadow ? l.shadow.bias : null,
      position: l.position ? { x: l.position.x, y: l.position.y, z: l.position.z } : null,
    })),
    background: (S.scene && S.scene.background && S.scene.background.isColor) ? S.scene.background.getHex() : null,
  };
};
// dungeon-loop-gate (dev/battle-gate/capture-dungeon-loop.mjs) — a harness-facing read-only accessor,
// same family as the interior* diagnostics above: how many verb tweens (play()'s own S.tweens, the
// standee AND ordinary 3D-figure verbs both push into this one array) are still live right now, so a
// capture rig can poll-until-settled instead of guessing a fixed sleep duration before screenshotting
// a verb's terminal frame.
window.Theater.tweensLive = function(){ return (S.tweens && S.tweens.length) || 0; };
// BEAUTY-WAVE-4.md MF-1 — TEST-ONLY SEAM: the live camera-pose tween's own {start,dur} (Date.now()-
// timestamped at push, per pushTween's own convention this file's tween shares — see placeCameraTweened's
// header) so a harness can fake Date.now() and assert exact fake-clock t-fraction math (start/mid/end
// pose) against a KNOWN elapsed/dur pair, rather than guessing at real wall-clock timing.
window.Theater._mf1CameraPoseTweenForTest = function(){
  const tw = (S.tweens || []).find((t) => t && t.isCameraPoseTween);
  return tw ? { start: tw.start, dur: tw.dur } : null;
};
window.Theater._mf1CameraLookTargetForTest = function(){
  return S.cameraLookTarget ? { x: S.cameraLookTarget.x, y: S.cameraLookTarget.y, z: S.cameraLookTarget.z } : null;
};
// BEAUTY-WAVE-4.md MF-4 item 1 — TEST-ONLY SEAM, same {start,dur} convention as MF-1's own
// _mf1CameraPoseTweenForTest just above (fake Date.now(), then read back the exact live numbers rather
// than guessing at wall-clock timing).
window.Theater._mf4RingSlideTweenForTest = function(){
  const tw = (S.tweens || []).find((t) => t && t.isRingSlideTween);
  return tw ? { start: tw.start, dur: tw.dur } : null;
};
// the acting ring's own CURRENT world position (works whether it's mid-flight, parented to the scene
// root, or docked as a fig-child — getWorldPosition resolves either case identically), so a harness can
// sample the slide's start/mid/end without caring which parent it's under at that instant.
window.Theater._mf4RingWorldPosForTest = function(){
  const mesh = (S.actingRingMeshes || [])[0];
  if(!mesh) return null;
  const world = new THREE.Vector3();
  mesh.getWorldPosition(world);
  return { x: world.x, y: world.y, z: world.z };
};

// DUNGEON-GRAPH.md U3 iteration-2, SPRITE PURITY ruling — a harness-facing diagnostic (dev/verify-
// dungeon-interior.mjs's puppeteer check, dev/battle-gate/capture-interior-study.mjs's metrics) that
// scans the currently-mounted interior board's own scene graph for the two userData flags applyPsxShaderTweaks
// / buildSpriteBillboard set (see both functions' own header comments): every wall/floor/doorframe/
// pillar InstancedMesh material should carry psxApplied, every billboard sprite material should carry
// psxExempt and neither should carry the other's flag. Read-only, never mutates the scene.
window.Theater.interiorPsxAudit = function(){
  const audit = { wallMaterialsChecked: 0, wallMaterialsPsxApplied: 0, billboardsChecked: 0, billboardsPsxExempt: 0, billboardsWronglyPsxApplied: 0 };
  if(!S.interiorGroup) return audit;
  S.interiorGroup.traverse((obj) => {
    if(obj.isInstancedMesh && obj.material){
      audit.wallMaterialsChecked++;
      if(obj.material.userData && obj.material.userData.psxApplied) audit.wallMaterialsPsxApplied++;
    }
    if(obj.userData && obj.userData.sprite && obj.userData.spriteBillboardMesh){
      const mat = obj.userData.spriteBillboardMesh.material;
      audit.billboardsChecked++;
      if(mat && mat.userData && mat.userData.psxExempt) audit.billboardsPsxExempt++;
      if(mat && mat.userData && mat.userData.psxApplied) audit.billboardsWronglyPsxApplied++;
    }
  });
  return audit;
};

// BW2-4b item 1 — THE BRIGHTNESS LAW measurement seam (harness-only, no product caller). __setSpriteUnlitDebug
// flips buildSpriteBillboardMesh back to the old full-bright MeshBasic so a capture harness can mount the
// SAME board twice (lit vs unlit) and read every sprite's rendered luminance as a ratio of full-bright.
// __spriteScreenRects projects every mounted sprite billboard's own world box to canvas-pixel space so
// the harness knows WHERE to sample. Both exist only for dev/battle-gate/capture-lit-sprites.mjs.
window.Theater.__setSpriteUnlitDebug = function(on){ SPRITE_UNLIT_DEBUG = !!on; };
// bounded A/B for the standee depth bias — sets the live uniform on every registered sprite
// material (no recompile; the uniform is injected at first compile). Diagnosis + capture only.
window.Theater._setStandeeDepthBiasForTest = function(units){
  spritesSetDepthBiasUnits((typeof units === "number") ? units : 0.25); // split B7: the value moved to theater-sprites.js (SHADER-KEY LAW — see that file's header); written through its exported accessor
  // prune disposed materials while walking (board rebuilds retire cards; the registry must not
  // accumulate dead references across a long session)
  for(let i = SPRITE_DEPTH_BIAS_MATERIALS.length - 1; i >= 0; i--){
    const m = SPRITE_DEPTH_BIAS_MATERIALS[i];
    if(!m || m.disposed || (m.userData && m.userData.retired)){ SPRITE_DEPTH_BIAS_MATERIALS.splice(i, 1); continue; }
    if(m.userData && m.userData.standeeDepthBiasUniform) m.userData.standeeDepthBiasUniform.value = spritesGetDepthBiasUnits(); // split B7: read through theater-sprites.js's accessor
  }
  markDirty();
  return spritesGetDepthBiasUnits(); // split B7: read through theater-sprites.js's accessor
};
window.Theater._setSpriteSamplingForTest = function(mode){
  const linearMutation = mode === "linear";
  let changed = 0;
  Object.keys(SPRITE_TEXTURE_CACHE).forEach((key) => {
    const tex = SPRITE_TEXTURE_CACHE[key];
    if(!tex || tex === "pending" || tex === "failed") return;
    tex.magFilter = linearMutation ? THREE.LinearFilter : THREE.NearestFilter;
    tex.minFilter = linearMutation ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = !linearMutation;
    tex.needsUpdate = true;
    changed++;
  });
  markDirty();
  return { mode: linearMutation ? "linear-no-mipmap-mutation" : "production-nearest-mag-trilinear-min", changed };
};
window.Theater.__spriteScreenRects = function(){
  const out = [];
  if(!S.interiorGroup || !S.camera || !S.renderer) return out;
  const canvas = S.renderer.domElement;
  const W = canvas.width, H = canvas.height;
  const v = new THREE.Vector3();
  const project = (wx, wy, wz) => {
    v.set(wx, wy, wz).project(S.camera);
    return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
  };
  S.interiorGroup.traverse((obj) => {
    if(!(obj.userData && obj.userData.sprite && obj.userData.spriteBillboardMesh)) return;
    const wp = new THREE.Vector3();
    obj.getWorldPosition(wp);
    const height = obj.userData.interiorHeight || 1.1;
    const width = obj.userData.interiorWidth || height;
    const foot = project(wp.x, wp.y, wp.z);
    const head = project(wp.x, wp.y + height, wp.z);
    const side = project(wp.x + width * 0.5, wp.y + height * 0.5, wp.z);
    const mid = project(wp.x, wp.y + height * 0.5, wp.z);
    const pxH = Math.abs(foot.y - head.y);
    const pxW = Math.abs(side.x - mid.x) * 2;
    out.push({
      slug: obj.userData.spriteSlug || obj.userData.dressingSlug || null,
      cx: mid.x, cy: (foot.y + head.y) / 2,
      w: pxW, h: pxH,
      unlit: !!(obj.userData.spriteBillboardMesh.material && obj.userData.spriteBillboardMesh.material.isMeshBasicMaterial)
    });
  });
  return out;
};

// VP0/GRAPHICS-ENGINE law 2/2b (docs/BEAUTY-WAVE.md) — harness-facing read-only diagnostics for the
// two-flag study card (dev/battle-gate/capture-two-flag-card.mjs), same discipline as interiorPsxAudit
// just above: no product code reads these, they only expose the live scene-graph/camera state a
// browser-side harness can't otherwise reach without duplicating this file's own S internals.
window.Theater.cameraIsPerspective = function(){ return !!(S.camera && S.camera.isPerspectiveCamera); };
window.Theater.interiorWorldPsxAudit = function(){
  const audit = { checked: 0, ditherOnCount: 0, snapOnCount: 0 };
  if(!S.interiorGroup) return audit;
  S.interiorGroup.traverse((obj) => {
    if(obj.isInstancedMesh && obj.material && obj.material.userData && obj.material.userData.psxWorldSurface){
      audit.checked++;
      if(obj.material.userData.psxDitherResolved) audit.ditherOnCount++;
      if(obj.material.userData.psxSnapResolved) audit.snapOnCount++;
    }
  });
  return audit;
};

// BEAUTY-WAVE-2 BW2-0 (THE CRISP CHANNEL) — harness-facing read-only diagnostics, same family as the
// audits just above. canvasBufferInfo() exposes the live renderer's actual DRAWING BUFFER size next to
// the canvas's CSS box (the "1/3 squeeze" this unit's whole diagnosis is about lives entirely in the
// gap between these two numbers — a capture rig can assert `drawWidth === cssWidth` etc. without
// needing to duplicate applyPsxCanvasSize's own math). spriteFilterAudit() scans the CURRENTLY mounted
// scene(s) for billboard sprite materials (userData.sprite on the group, same tag buildSpriteBillboardMesh
// sets — see that function's own header) and reports each one's live texture magFilter/minFilter, so a
// harness can assert "mag Nearest, min Linear" against the REAL THREE.Texture objects in the scene
// graph rather than re-deriving the filter law from source text alone.
// measureRenderFps(sampleCount) — the loop-gate's own fps evidence (BW2-0 item 3: "full-res render
// ... must hold >= 30fps"). render-on-demand (this file's own header: "nothing repaints unless
// setBoard/... markDirty") means the app never runs a steady-state RAF loop to sample from, so this
// directly times `sampleCount` back-to-back S.renderer.render() calls against the CURRENTLY mounted
// scene/camera (whatever board/units/pieces a caller already built) and reports the wall-clock cost as
// fps — the honest proxy for "can this scene sustain >=30fps if it needed to render every frame",
// exercised at the REAL full-res drawing-buffer size applyPsxCanvasSize just set. Returns null pre-mount.
window.Theater.measureRenderFps = function(sampleCount){
  if(!S.mounted || !S.renderer || !S.scene || !S.camera) return null;
  const n = Math.max(1, sampleCount || 60);
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  for(let i = 0; i < n; i++) S.renderer.render(S.scene, S.camera);
  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  const elapsedMs = Math.max(1e-6, t1 - t0);
  return { samples: n, elapsedMs, fps: (n * 1000) / elapsedMs };
};

// BEAUTY-WAVE-3 BW3-0 (docs/BEAUTY-WAVE-3.md, THE COMPOSER SEAM) — the production surface BW3-2/3/6
// mount their DoF/bloom/grade passes onto. Thin delegation to the live S.composer (null pre-mount);
// both mark the theater dirty so the next scheduleRender actually redraws through the (now-changed)
// chain — a caller that adds/removes a pass without this would sit on a stale frame until some
// UNRELATED dirty-triggering call happened to repaint. Returns false pre-mount/no-op, never throws.
window.Theater.addPass = function(pass){
  if(!S.mounted || !S.composer || !pass) return false;
  S.composer.addPass(pass);
  markDirty();
  return true;
};
window.Theater.removePass = function(pass){
  if(!S.mounted || !S.composer || !pass) return false;
  S.composer.removePass(pass);
  markDirty();
  return true;
};
// _ForTest convention (this file's own established pattern — see _interiorPillarListForTest etc.
// above): read-only harness seams, no product code reads these. _postChainForTest exposes the live
// chain's shape (enabled flag + live pass count) so a capture/verify harness can assert "flag ON,
// zero passes" without reaching into module-private `S` directly. _setPostChainEnabledForTest lets a
// harness flip the flag itself (e.g. to prove flag OFF also forces the direct path even if a later
// unit has since added passes) — returns the new value, or null pre-mount.
// BEAUTY-WAVE-3 THE POST SUITE harness seams (read-only + A/B toggles; no product code reads these).
// _postSuiteForTest exposes the live suite's shape + every taste dial's current value so a capture/
// verify harness can assert focus-tracking, the bloom threshold, and the per-realm grade without
// reaching into module-private S. _setSuitePassEnabledForTest toggles ONE effect pass (.enabled) by
// its __bwName so an on/off A/B card can isolate each effect (dof-only, bloom-only, grade-only) — a
// disabled pass is skipped by EffectComposer but the chain stays >=1 pass so the composer path (not
// the direct-render fallback) still runs. dofFocus is the DoF focal-tracking assert surface: the
// world focus distance (camera->boardCenter) genuinely differs beat-vs-room, so it's directly
// assertable across fitModes.
window.Theater._postSuiteForTest = function(){
  if(!S.postSuite) return { mounted: false, built: false };
  const ps = S.postSuite;
  return {
    built: true,
    mounted: !!S.postSuiteMounted,
    passNames: (S.composer && S.composer.passes) ? S.composer.passes.map((p) => p.__bwName || "?") : [],
    passEnabled: { ao: !!(ps.ao && ps.ao.enabled), dof: !!ps.dof.enabled, bloom: !!ps.bloom.enabled, grade: !!ps.grade.enabled },
    dof: {
      focusV: ps.dof.uniforms.uFocusV.value,
      focusDist: S.dofFocusDist,
      focusNdcY: S.dofFocusNdcY,
      maxBlur: ps.dof.uniforms.uMaxBlur.value,
      strength: ps.dof.uniforms.uStrength.value
    },
    bloom: { threshold: ps.bloom.threshold, strength: ps.bloom.strength, radius: ps.bloom.radius },
    grade: {
      tintAmt: ps.grade.uniforms.uTintAmt.value,
      tintHex: "#" + ps.grade.uniforms.uTint.value.getHexString(),
      exposure: ps.grade.uniforms.uExposure.value,
      vignette: ps.grade.uniforms.uVignette.value,
      // LL-1: the exposure-floor uniform (ledger #12/13) — additive field, every existing consumer of
      // this accessor already ignores unknown keys.
      exposureFloor: ps.grade.uniforms.uExposureFloor.value
    }
  };
};
window.Theater._setSuitePassEnabledForTest = function(name, enabled){
  if(!S.postSuite) return null;
  const p = S.postSuite[name];
  if(!p) return null;
  p.enabled = !!enabled;
  // keep the Clayroom's ENV AO A/B button truthful when the toggle arrives through this seam —
  // a UI label that disagrees with the live pass state is a readout lie, however small
  if(name === "ao" && typeof S.clayRoomEnvAOSyncButton === "function") S.clayRoomEnvAOSyncButton();
  markDirty();
  return !!p.enabled;
};
// CLAYROOM VISUAL CORRECTION Checkpoint 1 — ENVIRONMENT AO seams (read-only + the same bounded
// A/B the other suite passes get through _setSuitePassEnabledForTest("ao", …)). No product code
// reads these. The receipt/harness surface: authored params (proving they are the frozen bounded
// set, not a drifted taste dial), the live pass state, and the prepass exclusion count from the
// last AO G-buffer render (proving sprite cards/overlay quads stayed out).
window.Theater._environmentAOForTest = function(){
  const ao = S.postSuite && S.postSuite.ao;
  return {
    built: !!ao,
    enabled: !!(ao && ao.enabled),
    enabledDefault: ENV_AO_ENABLED_DEFAULT,
    urlResolvedEnabled: envAOEnabled(),
    mounted: !!S.postSuiteMounted,
    params: Object.assign({}, ENV_AO_PARAMS),
    denoise: Object.assign({}, ENV_AO_DENOISE),
    blendIntensity: ao ? ao.blendIntensity : ENV_AO_BLEND_INTENSITY,
    output: ao ? ao.output : null,
    perspectiveDefine: ao ? ao.gtaoMaterial.defines.PERSPECTIVE_CAMERA : null,
    targetSize: ao ? { w: ao.width, h: ao.height } : null,
    lastPrepassExcludedCount: ao && ao.lastPrepassExcludedCount != null ? ao.lastPrepassExcludedCount : null,
  };
};
// AO contact-registration diagnostic seam (Adam 2026-07-25: "at every point of planar contact you
// can see a gap of light shining through"). Lets the capture rig A/B the two leading hypotheses
// LIVE without touching authored settings: "fullres" re-sizes the AO G-buffer to full device
// pixels (tests the half-res upsample-misregistration theory), "raw" zeroes the Poisson-denoise
// spatial radius (tests the denoise-bleed theory), "fullres-raw" combines, "on" restores the
// authored state. Diagnostic-only: nothing in production calls this.
window.Theater._aoContactDiagForTest = function(mode){
  const ao = S.postSuite && S.postSuite.ao;
  if(!ao || !S.renderer) return { mode: mode, applied: false };
  const size = new THREE.Vector2();
  S.renderer.getSize(size);
  const pr = S.renderer.getPixelRatio ? S.renderer.getPixelRatio() : 1;
  // object mode: an explicit {resolutionScale?, ...denoise-params} sweep candidate
  if(mode && typeof mode === "object"){
    const scale = (typeof mode.resolutionScale === "number") ? mode.resolutionScale : ENV_AO_RESOLUTION_SCALE;
    ao.setSize(Math.round(size.x * pr * scale), Math.round(size.y * pr * scale));
    const dn = Object.assign({}, ENV_AO_DENOISE, mode);
    delete dn.resolutionScale;
    ao.updatePdMaterial(dn);
    markDirty();
    return { mode: "custom", applied: true, targetSize: { w: ao.width, h: ao.height }, denoise: dn };
  }
  const fullRes = mode === "fullres" || mode === "fullres-raw";
  const raw = mode === "raw" || mode === "fullres-raw";
  const scale = fullRes ? 1 : ENV_AO_RESOLUTION_SCALE;
  ao.setSize(Math.round(size.x * pr * scale), Math.round(size.y * pr * scale));
  const dn = raw ? Object.assign({}, ENV_AO_DENOISE, { radius: 0 }) : ENV_AO_DENOISE;
  ao.updatePdMaterial(dn);
  markDirty();
  return { mode: mode, applied: true, targetSize: { w: ao.width, h: ao.height }, denoiseRadius: dn.radius };
};
// The pure prepass-exclusion predicate, exposed so the node harness can execute the actual rule
// against mesh-shaped fixtures (transparent sprite card -> excluded; opaque wall -> included)
// instead of grepping for it.
window.Theater._envAOPrepassExcludesForTest = function(meshLike){
  return envAOPrepassExcludes(meshLike);
};
// Read-only sprite shadow-caster census: every mounted sprite-card mesh's shadow contract state
// (castShadow, custom depth/distance materials, visibility, world position) so "why does this
// standee not cast" is answered by data instead of eyeballs.
window.Theater._spriteShadowStateForTest = function(){
  const rows = [];
  if(!S.interiorGroup) return rows;
  S.interiorGroup.traverse(function(node){
    if(!node || !node.userData || !node.userData.sprite) return;
    // the sprite tag sits on the standee GROUP; census every mesh beneath it
    node.traverse(function(child){
      if(!child || !child.isMesh) return;
      const p = new THREE.Vector3();
      child.getWorldPosition(p);
      const chain = [];
      for(let a = child; a; a = a.parent){ chain.push((a.name || a.type) + (a.visible ? "" : "!HIDDEN")); if(chain.length > 8) break; }
      rows.push({
        sprite: (node.userData.sprite && (node.userData.sprite.slug || node.userData.sprite.id)) || true,
        meshName: child.name || null,
        castShadow: !!child.castShadow,
        hasCustomDepth: !!child.customDepthMaterial,
        hasCustomDistance: !!child.customDistanceMaterial,
        visible: !!child.visible,
        layersMask: child.layers ? child.layers.mask : null,
        frustumCulled: !!child.frustumCulled,
        materialTransparent: !!(child.material && child.material.transparent),
        depthMaterialHasMap: !!(child.customDepthMaterial && child.customDepthMaterial.map),
        depthMaterialAlphaTest: child.customDepthMaterial ? child.customDepthMaterial.alphaTest : null,
        depthMaterialVisible: child.customDepthMaterial ? child.customDepthMaterial.visible !== false : null,
        geometryType: child.geometry ? child.geometry.type : null,
        worldScale: (function(){ const s = new THREE.Vector3(); child.getWorldScale(s); return { x: +s.x.toFixed(3), y: +s.y.toFixed(3), z: +s.z.toFixed(3) }; })(),
        parentChain: chain.join(" > "),
        worldPos: { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2) },
      });
    });
  });
  return rows;
};
// Checkpoint 2 solo A/B (diagnosis only): shows warm-only / cool-only / both for the SAME mounted
// scene by toggling light+emitter visibility — nothing moves, nothing rebuilds, instantly
// reversible. Pass a light id to solo it, null to restore all.
window.Theater._claySetLightSoloForTest = function(soloId){
  const rows = S.interiorLightTargets || [];
  let touched = 0;
  rows.forEach(function(r){
    if(!r || !r.pl) return;
    const on = soloId == null || r.id === soloId;
    r.pl.visible = on;
    if(r.marker) r.marker.visible = on;
    touched++;
  });
  markDirty();
  return { touched, soloId: soloId == null ? null : String(soloId) };
};
// One-shot shadow-pass entry probe: counts onBeforeShadow invocations on the sprite card versus a
// reference opaque bench mesh across one forced render, proving whether the card enters the
// renderer's shadow pass at all (THREE calls onBeforeShadow per shadow draw).
window.Theater._spriteShadowProbeForTest = function(){
  const counts = { card: 0, reference: 0 };
  let card = null, reference = null;
  if(!S.interiorGroup) return counts;
  S.interiorGroup.traverse(function(node){
    if(!card && node.isMesh && node.customDepthMaterial) card = node;
    if(!reference && node.isMesh && node.userData && node.userData.clayBenchPrimitive) reference = node;
  });
  const describe = function(shadowCamera){
    const p = new THREE.Vector3();
    shadowCamera.getWorldPosition(p);
    return shadowCamera.type + "@" + p.x.toFixed(1) + "," + p.y.toFixed(1) + "," + p.z.toFixed(1)
      + " box±" + (shadowCamera.right != null ? shadowCamera.right.toFixed(1) : "?");
  };
  counts.cardLights = []; counts.referenceLights = [];
  if(card) card.onBeforeShadow = function(r, o, cam, shadowCamera){ counts.card++; counts.cardLights.push(describe(shadowCamera)); };
  if(reference) reference.onBeforeShadow = function(r, o, cam, shadowCamera){ counts.reference++; counts.referenceLights.push(describe(shadowCamera)); };
  renderTheaterFrame();
  if(card) card.onBeforeShadow = function(){};
  if(reference) reference.onBeforeShadow = function(){};
  counts.foundCard = !!card;
  counts.foundReference = !!reference;
  return counts;
};
// Bounded A/B toggle for the sprite-card shadow caster (diagnosis only — the production contract
// keeps it ON): flips castShadow on every mounted sprite-card mesh that carries the alpha depth
// materials, so a capture pair can prove whether a missing standee shadow was never rendered or
// merely hidden from the fixed camera by the caster itself.
window.Theater._setSpriteCastShadowForTest = function(on){
  let flipped = 0;
  if(!S.interiorGroup) return flipped;
  S.interiorGroup.traverse(function(node){
    if(!node || !node.userData || !node.userData.sprite) return;
    node.traverse(function(child){
      if(child && child.isMesh && child.customDepthMaterial){ child.castShadow = !!on; flipped++; }
    });
  });
  markDirty();
  return flipped;
};
// Diagnostic OUTPUT switch for the AO pass — GTAO's own debug views (raw AO, denoised AO, depth,
// normals) as a bounded named-mode seam, for technical captures that separate "the AO math is
// wrong" from "the denoiser smeared it" without touching the authored settings. Never a taste
// control: modes are the pass's enum, default restored by passing "default".
window.Theater._setEnvironmentAOOutputForTest = function(mode){
  const ao = S.postSuite && S.postSuite.ao;
  if(!ao) return null;
  const map = { "default": GTAOPass.OUTPUT.Default, "ao": GTAOPass.OUTPUT.AO,
    "denoise": GTAOPass.OUTPUT.Denoise, "depth": GTAOPass.OUTPUT.Depth,
    "normal": GTAOPass.OUTPUT.Normal, "off": GTAOPass.OUTPUT.Off };
  if(!(mode in map)) return null;
  ao.output = map[mode];
  markDirty();
  return mode;
};
// P3-3a TEST/HARNESS SEAM — mirrors the _setRoomShellPolygonKernel convention: flips the
// GRADE_TONEMAP module `let` live, in-process, so dev/battle-gate/agx/capture-agx-ab.mjs can shoot
// the SAME mounted board twice ("none" then "agx") differing ONLY by this flag. GRADE_TONEMAP is
// read once, at makeGradePass() CALL time (it compiles the AgX GLSL into the shader source string,
// not a runtime uniform branch — see makeGradePass's own comment), so merely reassigning the
// variable does nothing to an already-compiled grade pass: this seam rebuilds the grade ShaderPass
// and — if a post suite is already mounted on the live composer — swaps the new pass in at the SAME
// composer.passes ARRAY INDEX the old one held (a direct in-place `passes[idx] = fresh` splice,
// deliberately NOT EffectComposer.removePass/insertPass — this file already reads/writes
// S.composer.passes directly elsewhere (see buildPostSuite's own comment), and a plain index swap
// needs no assumption about which composer methods a given three revision exposes), preserving chain
// order [render, dof, bloom, grade, output]. The live per-realm tint/tintAmt and the current canvas
// uResolution are copied from the old pass's uniforms onto the new one so the swap is invisible to
// everything except the tonemap curve itself (no re-derivation of kit/rigOn needed — the old pass's
// uniforms already ARE that resolved state). Returns {changed, tonemap}; a no-op (changed:false) if
// the requested value is already active.
window.Theater._setGradeTonemapForTest = function(v){
  const next = (v === "agx") ? "agx" : "none";
  if(next === GRADE_TONEMAP) return { changed: false, tonemap: GRADE_TONEMAP };
  GRADE_TONEMAP = next;
  if(S.postSuite){
    const old = S.postSuite.grade;
    const fresh = makeGradePass();
    if(old && old.uniforms){
      fresh.uniforms.uResolution.value.copy(old.uniforms.uResolution.value);
      fresh.uniforms.uTint.value.copy(old.uniforms.uTint.value);
      fresh.uniforms.uTintAmt.value = old.uniforms.uTintAmt.value;
      fresh.enabled = old.enabled;
    }
    if(S.composer && S.composer.passes && old){
      const idx = S.composer.passes.indexOf(old);
      if(idx !== -1) S.composer.passes[idx] = fresh;
    }
    if(old && old.dispose) old.dispose();
    S.postSuite.grade = fresh;
  }
  markDirty();
  return { changed: true, tonemap: GRADE_TONEMAP };
};
window.Theater._gradeTonemapForTest = function(){ return GRADE_TONEMAP; };
// LL-1 test seams. _setBloomMaskDisabledForTest flips BLOOM_MASK_DISABLED_FOR_TEST (see its own header,
// near BLOOM_LAYER) — the live RED/GREEN A/B for the emissive-masked-bloom red-first proof.
// _lightTunablesForTest returns a DEEP snapshot of LIGHT_TUNABLES (never the live object itself — a
// caller mutating the returned snapshot must never reach back into the real tunables) so a harness can
// assert the seeded values equal their authored consts ("pure no-op when untouched").
window.Theater._setBloomMaskDisabledForTest = function(v){ BLOOM_MASK_DISABLED_FOR_TEST = !!v; markDirty(); return BLOOM_MASK_DISABLED_FOR_TEST; };
window.Theater._lightTunablesForTest = function(){ return JSON.parse(JSON.stringify(LIGHT_TUNABLES)); };
// LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — P-A LUMINANCE-GATE READOUTS (docs/VQ2-RESPEC.md §1
// P-A: tray-edge <=12% display luma, PC-face >=18%, profile medians separated >=6%). This seam only
// MEASURES off the REAL rendered frame — it renders no verdict and asserts nothing; F3 (VQ2-RESPEC's
// own future unit) owns turning these numbers into a pass/fail gate. Feeds the light-lab's live
// readout display and any harness assertion built on top.
// Reads gl.readPixels off S.renderer's live drawing buffer SYNCHRONOUSLY right after a forced render
// (the renderer carries no preserveDrawingBuffer — same same-task-read discipline dev/verify-agx-
// tonecurve.mjs's own Section 3 already documents for reading a WebGL buffer honestly). Luma is the
// standard Rec.709 weighting on the DISPLAY-space (post-OutputPass sRGB) bytes, 0..1 — the SAME
// formula every capture-*.mjs harness's own sampleLuma() already uses on saved PNGs (see e.g.
// dev/battle-gate/standee-gallery/capture-standee-gallery.mjs), so a number from this seam is directly
// comparable to one read off a battle-gate contact sheet.
window.Theater._lumaGatesForTest = function(){
  if(!S.mounted || !S.renderer || !S.camera) return null;
  renderTheaterFrame();
  const gl = S.renderer.getContext();
  if(!gl) return null;
  const bw = gl.drawingBufferWidth, bh = gl.drawingBufferHeight;
  if(!bw || !bh) return null;
  function lumaAt(px, py){
    const half = 1; // 3x3 sample box
    const x0 = Math.max(0, Math.min(bw - 3, Math.round(px) - half));
    // WebGL's y=0 row is the BOTTOM of the buffer — flip from the top-left screen convention every
    // other NDC->pixel helper in this file uses (ndcToPixel's own siblings, e.g. capture-standee-
    // gallery.mjs, document the identical flip for the same reason).
    const y0 = Math.max(0, Math.min(bh - 3, bh - Math.round(py) - half - 1));
    const buf = new Uint8Array(4 * 3 * 3);
    gl.readPixels(x0, y0, 3, 3, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    let sum = 0, n = 0;
    for(let i = 0; i < buf.length; i += 4){ sum += 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2]; n++; }
    return n ? (sum / n) / 255 : null;
  }
  function ndcToPx(ndc){
    return { x: (ndc.x * 0.5 + 0.5) * bw, y: (ndc.y * 0.5 + 0.5) * bh };
  }
  // ---- tray-edge: the board's own REAL footprint boundary (S.boardHalfX/Z, S.boardCenter — the same
  // fields interiorFrustumCheck already reads, real geometry, never guessed) at floor height, midpoint
  // of each of the 4 edges, projected through the live camera.
  const hx = S.boardHalfX || S.boardHalfExtent || 5, hz = S.boardHalfZ || S.boardHalfExtent || 5;
  const cx = (S.boardCenter && typeof S.boardCenter.x === "number") ? S.boardCenter.x : 0;
  const cz = (S.boardCenter && typeof S.boardCenter.z === "number") ? S.boardCenter.z : 0;
  S.camera.updateMatrixWorld();
  const edgeMidpoints = [[cx, 0, cz - hz], [cx, 0, cz + hz], [cx - hx, 0, cz], [cx + hx, 0, cz]];
  const edgeLumas = edgeMidpoints
    .map(([x, y, z]) => { const px = ndcToPx(new THREE.Vector3(x, y, z).project(S.camera)); return lumaAt(px.x, px.y); })
    .filter((v) => v != null);
  const trayEdgeLuma = edgeLumas.length ? edgeLumas.reduce((a, b) => a + b, 0) / edgeLumas.length : null;
  // ---- PC-face: the live kind:"pc" unit's own figure group (S.unitGroup, tagged userData.unitId —
  // T3's own convention), sampled at ~85% of its rendered bbox height (a face-height approximation —
  // there is no rigged head bone in this figure system to sample exactly).
  let pcFaceLuma = null;
  const pcUnit = (S.lastUnits && Array.isArray(S.lastUnits.units)) ? S.lastUnits.units.find((u) => u.kind === "pc") : null;
  if(pcUnit && S.unitGroup){
    const idStr = String(pcUnit.id);
    let fig = null;
    for(let i = 0; i < S.unitGroup.children.length; i++){
      if(S.unitGroup.children[i].userData && S.unitGroup.children[i].userData.unitId === idStr){ fig = S.unitGroup.children[i]; break; }
    }
    if(fig){
      fig.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(fig);
      if(isFinite(box.max.y)){
        const faceY = box.min.y + (box.max.y - box.min.y) * 0.85;
        const faceX = (box.min.x + box.max.x) / 2, faceZ = (box.min.z + box.max.z) / 2;
        const px = ndcToPx(new THREE.Vector3(faceX, faceY, faceZ).project(S.camera));
        pcFaceLuma = lumaAt(px.x, px.y);
      }
    }
  }
  // ---- frame median: coarse 7x5 sample grid across the whole canvas. The ">=6% profile-median
  // separation" half of the P-A gate is a CALLER's job (call this seam twice under two light profiles
  // and diff the two frameMedianLuma numbers) — this seam only ever returns ONE frame's reading.
  const cols = 7, rows = 5, samples = [];
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      const v = lumaAt(((c + 0.5) / cols) * bw, ((r + 0.5) / rows) * bh);
      if(v != null) samples.push(v);
    }
  }
  samples.sort((a, b) => a - b);
  const frameMedianLuma = samples.length ? samples[Math.floor(samples.length / 2)] : null;
  return {
    trayEdgeLuma, pcFaceLuma, frameMedianLuma,
    lightProfile: S.lightProfileKey || null,
    drawingBuffer: { w: bw, h: bh },
    pcUnitFound: !!pcUnit, pcFigureFound: pcFaceLuma != null,
  };
};
window.Theater.dofFocus = function(){
  return { dist: S.dofFocusDist || 0, ndcY: S.dofFocusNdcY || 0, focusV: S.postSuite ? S.postSuite.dof.uniforms.uFocusV.value : null };
};
window.Theater._postChainForTest = function(){
  return {
    enabled: !!S.postChainEnabled,
    passCount: (S.composer && S.composer.passes) ? S.composer.passes.length : 0,
    hasComposer: !!S.composer
  };
};
window.Theater._setPostChainEnabledForTest = function(enabled){
  if(!S.mounted) return null;
  S.postChainEnabled = !!enabled;
  markDirty();
  return S.postChainEnabled;
};
// _renderFrameForTest — calls renderTheaterFrame() (scheduleRender's own render call site, the
// literal function BW3-0 is about) SYNCHRONOUSLY and directly, bypassing the requestAnimationFrame
// hop scheduleRender normally goes through. A harness needs this because rAF is unreliable to depend
// on from outside the page (backgrounded/automated tabs can throttle or fully suspend it — found live
// verifying this exact unit: a headless capture tab's scheduleRender-scheduled repaints never fired
// at all across a >1s wait, even though markDirty()/S.dirty were set correctly) — this seam removes
// that timing dependency for a proof that's about WHICH BRANCH ran, not about the rAF plumbing that
// normally invokes it. Returns false pre-mount, true otherwise; never throws.
window.Theater._renderFrameForTest = function(){
  if(!S.mounted) return false;
  renderTheaterFrame();
  return true;
};
// measureComposerFps(sampleCount) — the BW3-0 companion to measureRenderFps just above: same
// back-to-back wall-clock timing loop, but routed through a REAL single-RenderPass composer chain
// (not the permanent empty one this unit ships with) so the number answers "what does routing
// through EffectComposer's render-target ping-pong actually cost", not "how fast is the no-op empty
// loop" (which would trivially read ~free and prove nothing). A lone RenderPass has needsSwap=false
// and renders straight to the canvas when it's the composer's only/last enabled pass (THREE's own
// EffectComposer.render() sets pass.renderToScreen for the last enabled pass each frame) — so this is
// the minimum-possible real per-frame cost floor future BW3-2/3/6 passes stack on top of, not a
// synthetic best case. The probe pass is added+removed+disposed inside this call — it never leaks
// into the permanent chain measureRenderFps/renderTheaterFrame see afterward. Returns null pre-mount.
window.Theater.measureComposerFps = function(sampleCount){
  if(!S.mounted || !S.renderer || !S.scene || !S.camera || !S.composer) return null;
  const n = Math.max(1, sampleCount || 60);
  const probePass = new RenderPass(S.scene, S.camera);
  S.composer.addPass(probePass);
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  for(let i = 0; i < n; i++) S.composer.render();
  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  S.composer.removePass(probePass);
  if(probePass.dispose) probePass.dispose();
  const elapsedMs = Math.max(1e-6, t1 - t0);
  return { samples: n, elapsedMs, fps: (n * 1000) / elapsedMs };
};

window.Theater.canvasBufferInfo = function(){
  if(!S.mounted || !S.renderer || !S.el) return null;
  const canvas = S.renderer.domElement;
  return {
    drawWidth: canvas.width, drawHeight: canvas.height,
    cssWidth: S.el.clientWidth, cssHeight: S.el.clientHeight,
    psxEnabled: !!S.psxEnabled,
  };
};
window.Theater.spriteFilterAudit = function(){
  const audit = { checked: 0, magNearestCount: 0, minLinearCount: 0, minNearestCount: 0 };
  const scanGroup = (group) => {
    if(!group) return;
    group.traverse((obj) => {
      if(obj.userData && obj.userData.sprite && obj.userData.spriteBillboardMesh){
        const mat = obj.userData.spriteBillboardMesh.material;
        const tex = mat && mat.map;
        if(!tex) return;
        audit.checked++;
        if(tex.magFilter === THREE.NearestFilter) audit.magNearestCount++;
        if(tex.minFilter === THREE.LinearFilter) audit.minLinearCount++;
        if(tex.minFilter === THREE.NearestFilter) audit.minNearestCount++;
      }
    });
  };
  scanGroup(S.unitGroup);
  scanGroup(S.interiorGroup);
  return audit;
};

// GRAPHICS-ENGINE.md law 2c (FRAMING LAW): "during combat beats the camera fits the ACTION CLUSTER
// ... fully in frustum" — a harness-facing projection check (dev/battle-gate/capture-two-flag-card.mjs
// / dev/verify-interior-camera-frustum.mjs), same read-only discipline as the audits above. Projects
// the CURRENT interior board's fitted footprint (its S.boardHalfX/Z half-extents around the origin,
// at floor y=0 and at a representative "standee head height" y so a standing piece's TOP is checked
// too, not just its feet) through the LIVE camera (whichever of S.orthoCamera/S.perspCamera is
// currently assigned) via THREE's own Vector3.project — works identically for either projection type
// since project() is the camera's own view*projection matrix, not fit-math this file re-derives.
// Returns each corner's NDC {x,y} plus a rolled-up ok (every corner's x/y both within [-1,1]).
function interiorFrustumCheck(headHeight){
  const result = { corners: [], ok: true };
  if(!S.camera || !S.mounted) { result.ok = false; return result; }
  // same interior-vs-tabletop floor split placeCamera itself uses — this check must read the SAME
  // hx/hz placeCamera actually fit to, or it silently re-derives a different (wrong) box.
  const halfFloor = S.isInteriorBoard ? INTERIOR_FIT_HALF_FLOOR : 2;
  const hx = Math.max(halfFloor, S.boardHalfX || S.boardHalfExtent || 5);
  const hz = Math.max(halfFloor, S.boardHalfZ || S.boardHalfExtent || 5);
  const h = (typeof headHeight === "number" && isFinite(headHeight)) ? headHeight : 1.1; // HUMAN_TRUE_HEIGHT-ish default
  // BEAUTY-WAVE-2.md BW2-1: S.boardCenter is no longer ALWAYS (0,0,0) — "beat" fitMode aims the
  // camera at the participant cluster's own center, which can sit off the room's center. Read it
  // live rather than assuming the origin (the pre-unit assumption this comment used to document).
  const cx = (S.boardCenter && typeof S.boardCenter.x === "number") ? S.boardCenter.x : 0;
  const cz = (S.boardCenter && typeof S.boardCenter.z === "number") ? S.boardCenter.z : 0;
  const corners = [
    [cx - hx, 0, cz - hz], [cx + hx, 0, cz - hz], [cx - hx, 0, cz + hz], [cx + hx, 0, cz + hz],
    [cx - hx, h, cz - hz], [cx + hx, h, cz - hz], [cx - hx, h, cz + hz], [cx + hx, h, cz + hz]
  ];
  S.camera.updateMatrixWorld();
  corners.forEach(([x, y, z]) => {
    const v = new THREE.Vector3(x, y, z).project(S.camera);
    const inFrustum = Math.abs(v.x) <= 1.0001 && Math.abs(v.y) <= 1.0001;
    if(!inFrustum) result.ok = false;
    result.corners.push({ x, y, z, ndcX: v.x, ndcY: v.y, inFrustum });
  });
  return result;
}
window.Theater.interiorFrustumCheck = interiorFrustumCheck;
// BEAUTY-WAVE-2.md BW2-1 — harness-facing read of the CURRENT board's own tallest-participant height
// correction (S.interiorFitMaxHeight, placeCamera's screenHalfHeight term), so a test can assert
// frustum containment against the REAL height the fit was actually computed for, rather than
// interiorFrustumCheck's own generic 1.1 default (which would silently under-check a tall roster).
window.Theater.interiorFitMaxHeight = function(){ return S.interiorFitMaxHeight || 0; };

// BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA) — harness-facing diagnostic, same read-only discipline as
// interiorFrustumCheck/cameraIsPerspective above: projects one world-space point through the LIVE
// camera's view*projection matrix (THREE's own Vector3.project) and returns its NDC {x,y}. Used by
// dev/battle-gate/capture-beat-camera.mjs purely to locate WHERE on screen a reference standee's
// top/bottom should land, so that script's own pixel scan knows what row band to search — the actual
// height measurement is a real pixel read of the rendered frame, not this projection math. No product
// code path calls this.
function projectWorldPoint(x, y, z){
  if(!S.camera || !S.mounted) return null;
  S.camera.updateMatrixWorld();
  const v = new THREE.Vector3(x, y, z).project(S.camera);
  return { ndcX: v.x, ndcY: v.y };
}
window.Theater.projectWorldPoint = projectWorldPoint;

// GRAPHICS-NORTH-STAR.md STAGE A unit A3 — harness-facing diagnostics for dev/verify-shot-compose.mjs,
// same read-only discipline as projectWorldPoint/interiorFrustumCheck above. No product code path
// calls any of these three.
// shotProjectFor itself: republished here (not at its own definition site, near interiorCameraFitFor)
// because `window.Theater` doesn't exist yet at that earlier point in module-eval order — see that
// function's own neighboring comment.
window.Theater.shotProjectFor = shotProjectFor;
// the most recently composed {camera,metrics} from setInteriorBoard's own ITR_SHOT_COMPOSE block, or
// null on a board where compose was off/unavailable/all-rejected (the exact focusRect-fallback cases).
window.Theater.lastComposedShot = function(){ return S.lastComposedShot || null; };
// the ShotPlan that produced the above (null under the identical fallback conditions) — lets a harness
// assert provenance/walkRef/fieldRefs flowed through without re-deriving shotPlanFrom itself.
window.Theater.lastShotPlan = function(){ return S.lastShotPlan || null; };
// the RAW composeShot result even when all-rejected (S.lastComposedShot above stays null in that
// case, by design — it's only ever the ACCEPTED camFit source) and any thrown compose error message.
window.Theater.lastComposedShotAttempt = function(){ return S.lastComposedShotAttempt || null; };
window.Theater.lastComposedShotError = function(){ return S.lastComposedShotError || null; };

// TABLETOP-UNITS.md §U1 seam 5 — the boot-preload readiness flag: false until loadWholeObjectBuilders'
// module-scope onSettled callback (above) fires exactly once. A harness/caller asserting §9.8's warm
// perf budget checks this first (loop timing means nothing while builders are still async-loading).
window.Theater.ready = false;

// THEATER-NEXT §3.2 step 5 — read-only diagnostics (nothing in product code reads these); moved
// VALUES, not labels, so the battle-gate rig's acceptance can prove both the rebuild path and the
// skip path actually fire (M-11..M-14).
window.Theater.stats = { boardBuilds: 0, unitBuilds: 0, boardSkips: 0, unitSkips: 0 };

// MODEL-PATH INSTRUMENTATION (2026-07-08): the live figure-resolution tally + a console-friendly report.
// `window.Theater.stats.modelPaths` is the raw counter; modelPathReport() returns a summary with the
// cuboid/loadFail miss keys sorted by frequency — the "which foes are still stand-ins/broken" answer.
window.Theater.stats.modelPaths = MODEL_PATH_STATS;
window.Theater.modelPathReport = function(){
  const m = MODEL_PATH_STATS;
  // BATTLE-THEATER T2: glb is a resolved-model path (like exact/alias), so it counts toward the total.
  // SPRITE-TRANSITION T4: sprite joins the same "resolved" family — a billboard is a real render, not
  // a miss, so it counts toward total exactly like glb/exact/alias/pcRecipe/recipe do.
  const total = m.exact + m.alias + m.blank + m.glb + m.pcRecipe + m.recipe + m.cuboid + m.sprite;
  const missList = Object.keys(m.misses).map(k => ({ key: k, count: m.misses[k] })).sort((a,b)=>b.count-a.count);
  return { total, exact: m.exact, alias: m.alias, blank: m.blank, glb: m.glb, pcRecipe: m.pcRecipe,
    recipe: m.recipe, cuboid: m.cuboid, loadFail: m.loadFail, sprite: m.sprite, misses: missList };
};

// REFERENCE-SHELF seam (docs/BESTIARY-MANUAL.md "The figure seam"): build/dispose one standalone
// figure outside the battle stage — the Monster Manual's live-3D grid/detail viewer calls this
// instead of reaching into figureFor/clearGroup directly (both module-private). Purely additive:
// no existing Theater method changes shape. `o` = {archetype,seed,tint,silhouette,weapon,recipeSlug}.
// BATTLE-THEATER T2: `o.wholeKey` (optional) forces a specific whole-object registry key onto the
// whole-object build path (threaded to figureFor's wholeKeyOverride param) — the prove-load / gate
// entry point for the glb seam, e.g. window.Theater.refFigure.build({ wholeKey: "test:grunt-glb" }).
window.Theater.refFigure = {
  // BEAUTY-WAVE.md VP1b: `o.interiorMode`/`o.wallHeightCap` are additive test-seam params (every
  // existing caller omits them, unchanged) that let dev/verify-dungeon-interior.mjs exercise
  // figureFor's interior-true-scale branch directly, without a full mount()/setUnits() THREE render.
  build: function(o){ return figureFor(o.archetype, o.seed, o.tint, o.silhouette, o.weapon, o.recipeSlug, null, "foe", null, o.wholeKey, o.interiorMode, o.wallHeightCap); },
  dispose: function(group){ clearGroup(group); }
};

// BEAUTY-WAVE VP5 — public surface for the battle-UI items 2/3 (ground-ring selection glow, damage
// floaters). Additive assignments AFTER the window.Theater object-literal above (same placement
// convention as refFigure just above it) so they aren't clobbered by that literal's own assignment.
window.Theater.setActingUnit = setActingUnit;
window.Theater.projectUnit = projectUnit;
window.Theater.spawnFloater = spawnFloater;

/* UNIT 1 dev A/B toggle: `window.Theater.pixelSkin` (get/set) flips the procedural pixel-skin system
   on/off at runtime, so a visual gate can A/B the textured figures against the pre-Unit-1 flat-color
   baseline in one line (window.Theater.pixelSkin = false) without a reload — the same escape-hatch
   spirit as the psx clean/grit toggle. Defined as an accessor property (not a plain field) so a
   simple assignment drives the module-scope PIXEL_SKIN_ENABLED flag; the next setUnits() re-render
   picks it up. This ADDS an opt-in property; every existing method above keeps its exact shape (the
   flat-color path is byte-identical to pre-Unit-1 when this is false or when canvas-2D is absent). */
Object.defineProperty(window.Theater, "pixelSkin", {
  get: function(){ return PIXEL_SKIN_ENABLED; },
  // THEATER-NEXT §3.2 — the skin flip changes rendering without changing the setUnits() payload
  // itself; null S.unitsKey (+ S.boardKey, since props can carry skin-adjacent rendering too) so the
  // doc contract ("the next setUnits() re-render picks it up") stays true under the dirty-key skip.
  set: function(v){ PIXEL_SKIN_ENABLED = !!v; S.boardKey = null; S.unitsKey = null; },
  enumerable: true, configurable: true
});

/* P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 9): `window.Theater.wholeObject` (get/set) —
   the exact pixelSkin A/B-toggle pattern. Default TRUE (shipped-on). Flipping to false makes the
   NEXT setUnits()/setBoard() render the cuboid/generic-box fallback exclusively (figureFor/setBoard's
   prop path both gate on WHOLE_OBJECT_ENABLED before ever calling resolveWholeObject) — the capture-
   gate A/B lever + a runtime kill switch, same escape-hatch spirit as pixelSkin. Flipping back to true
   does NOT force an immediate re-render on its own (matching pixelSkin's own "the next call picks it
   up" contract) — a caller wanting an instant flip re-invokes setBoard/setUnits with the last-known
   payload (S.lastBoard/S.lastUnits are exactly that, though they stay module-private by design). */
Object.defineProperty(window.Theater, "wholeObject", {
  get: function(){ return WHOLE_OBJECT_ENABLED; },
  // THEATER-NEXT §3.2 — same rationale as pixelSkin's setter above: the registry flip changes
  // rendering without changing the payload, so both keys null to keep the doc contract true.
  set: function(v){ WHOLE_OBJECT_ENABLED = !!v; S.boardKey = null; S.unitsKey = null; },
  enumerable: true, configurable: true
});

/* SPRITE-TRANSITION T4 (docs/SPRITE-TRANSITION.md T4.3): `window.Theater.spriteChannel` (get/set) —
   the exact pixelSkin/wholeObject A/B-toggle pattern. Default TRUE (shipped-on). Flipping to false
   forces every figureFor call past the sprite branch entirely (3D chain exclusively, the A/B-capture
   kill switch T4.3 calls for) — same "next call picks it up" contract as its two siblings above. */
Object.defineProperty(window.Theater, "spriteChannel", {
  get: function(){ return SPRITE_CHANNEL_ENABLED; },
  set: function(v){ SPRITE_CHANNEL_ENABLED = !!v; S.boardKey = null; S.unitsKey = null; },
  enumerable: true, configurable: true
});

/* VQ2-RESPEC.md S5 — `window.Theater.facetedFlip`, READ-ONLY (FACETED_FLIP_ENABLED is a real `const`
   per spec, not a `let` like spriteChannel/wholeObject — the one-flag retreat is a SOURCE edit
   (flip the const, reload), same as the generator's `--admit-faceted` flag is a build-time source/
   CLI toggle, not a runtime one). This getter is diagnostics-only, so a console/harness can READ the
   live value; a harness that needs to prove the false-branch mutates the source text before loading
   the module in its own subprocess (this file's established RED-FIRST convention — see
   dev/verify-sprite-join.mjs's TIER-1 stub-out for the same pattern), not a runtime set. */
Object.defineProperty(window.Theater, "facetedFlip", {
  get: function(){ return FACETED_FLIP_ENABLED; },
  enumerable: true, configurable: true
});

// SPRITE-TRANSITION T4 — TEST-ONLY SEAM: exposes the module-private texture cache so a harness (this
// unit's own dev/verify-theater-sprites.mjs) can pre-seed a fake THREE.Texture-like object for a slug
// before calling refFigure.build/setUnits, exercising the cut-status render path without a real
// network/file image load ("stub texture loader" per the spec). Nothing in product logic reads or
// writes this from outside spriteTextureFor — same read-only-diagnostics spirit as window.Theater.stats.
window.Theater._spriteTextureCache = SPRITE_TEXTURE_CACHE;

// VQ2-RESPEC.md S5 — TEST-ONLY SEAM: exposes the path-resolution helper directly (so a harness can
// assert legacy-vs-candidate resolution against a bare entry object, no THREE/textureLoader/mount
// needed) and the slug->currently-loaded-path side table the cache-key invalidation law reads.
window.Theater._spriteAssetPathForTest = spriteAssetPathFor;
window.Theater._spriteTextureSrcCache = SPRITE_TEXTURE_SRC;
window.Theater._spriteTextureForTest = spriteTextureFor;
window.Theater._spriteCitizenshipRenderContractForTest = function(){
  const textures = [];
  Object.keys(SPRITE_TEXTURE_CACHE).sort().forEach(function(key){
    const tex = SPRITE_TEXTURE_CACHE[key];
    if(!tex || tex === "pending" || tex === "failed") return;
    textures.push({
      slug: key,
      magFilter: tex.magFilter,
      minFilter: tex.minFilter,
      generateMipmaps: !!tex.generateMipmaps,
      colorSpace: tex.colorSpace
    });
  });
  const materials = SPRITE_DEPTH_BIAS_MATERIALS.filter(function(mat){
    return mat && !mat.disposed && !(mat.userData && mat.userData.retired);
  }).map(function(mat){
    return {
      type: mat.type,
      emissiveIntensity: mat.emissiveIntensity,
      emissive: mat.emissive ? mat.emissive.getHex() : null,
      alphaTest: mat.alphaTest,
      alphaToCoverage: !!mat.alphaToCoverage,
      psxExempt: !!(mat.userData && mat.userData.psxExempt)
    };
  });
  return {
    recipe: "lit-standee-v2",
    readabilityFloor: LIGHT_TUNABLES.spriteEmissiveFloor,
    realmTintStrength: ITR_SPRITE_TINT_STRENGTH,
    textures: textures,
    materials: materials
  };
};

// BEAUTY-WAVE.md VP1 — TEST-ONLY SEAM: exposes interiorBuildPieces directly (the true-scale interior
// piece sizing this unit fixed) so a harness (dev/verify-dungeon-interior.mjs's VP1 checks) can build
// pieces and inspect the resulting mesh geometry without booting a full setInteriorBoard render (which
// needs a live WebGLRenderer/scene — see dev/battle-gate/capture-interior-study.mjs for that end). Same
// read-only-diagnostics spirit as refFigure/_spriteTextureCache above; nothing in product logic calls
// this from outside interiorBuildPieces's own production call site (setInteriorBoard).
window.Theater._interiorBuildPiecesForTest = function(pieces, cx, cz, wallHeightBase, floorTopMap, trimColor, prismLists){
  return interiorBuildPieces(pieces, cx, cz, wallHeightBase, floorTopMap, trimColor, prismLists);
};

// BEAUTY-WAVE.md VP7 — TEST-ONLY SEAM, same spirit as _interiorBuildPiecesForTest above: exposes
// interiorBuildDressing directly so a harness can build dressing cards (small/medium/large) and
// inspect the resulting contact-blob count without a live WebGLRenderer.
// BW2-2b/BW2-5 integration — TEST-ONLY SEAM: wall-hang entries mount through the EXTRUSION path
// (interiorBuildWallProps) since BW2-5, so the wall-contact AO harness asserts against this builder,
// not interiorBuildDressing (which skips primary:"wall-hang" entirely).
window.Theater._interiorBuildWallPropsForTest = function(wallProps, cx, cz, floorTopMap, wallHeightBase){
  return interiorBuildWallProps(wallProps, cx, cz, floorTopMap, wallHeightBase);
};
// LIGHT-SIGHT-POLISH.md P-2 — TEST-ONLY SEAM, same "never re-derive blind" spirit as
// _floorContactLawForTest above: exposes the wall-hang placement law's own real constants (the yaw
// table rotation reads, the wall-normal table the placement push reads, and the two dialable knobs) so
// a harness can compute its OWN expected mount point/rotation off the SAME numbers the product code
// uses, rather than hand-copying magic numbers that could silently drift from the real source.
window.Theater._wallHangLawForTest = {
  ITR_WALL_SIDE_YAW, ITR_WALL_SIDE_NORMAL, ITR_WALLHANG_HEIGHT_FRAC, ITR_WALLHANG_WALL_OFFSET
};
window.Theater._interiorBuildDressingForTest = function(dressing, cx, cz, floorTopMap, prismLists){
  return interiorBuildDressing(dressing, cx, cz, floorTopMap, prismLists);
};

// BW2-2 — TEST-ONLY SEAM, same spirit as the two accessors above: exposes interiorBuildDecals directly
// so a harness can inspect decal mount Y against the derived floor-contact law.
window.Theater._interiorBuildDecalsForTest = function(decals, cx, cz, floorTopMap){
  return interiorBuildDecals(decals, cx, cz, floorTopMap);
};

// docs/STAGE-D-WAVE-SPECS.md D4 — TEST-ONLY SEAM, same spirit as the accessors above: exposes
// interiorBuildInteractables + its shape/pose helpers directly so dev/verify-d4-doors.mjs can drive
// the door render channel (aperture silhouette, per-state pose, state-transition tween) without a
// live GL mount. Resetting S.interiorDoorStateBySourceRef is exposed too — a harness that wants an
// isolated "first projection ever" run (no inherited diff state from an earlier check in the same
// process) can call it explicitly rather than reaching into S directly.
window.Theater._interiorBuildInteractablesForTest = function(interactables, cx, cz, floorTopMap, kitDoors){
  return interiorBuildInteractables(interactables, cx, cz, floorTopMap, kitDoors);
};
window.Theater._itrDoorShapeForTest = function(arched){ return itrDoorShape(arched); };
window.Theater._itrDoorIsArchedForTest = function(entry){ return itrDoorIsArched(entry); };
window.Theater._itrDoorRestPoseForTest = function(state, sourceRef){ return itrDoorRestPose(state, sourceRef); };
window.Theater._itrDoorHingeSignForTest = function(sourceRef){ return itrDoorHingeSign(sourceRef); };
window.Theater._resetInteriorDoorStateForTest = function(){ S.interiorDoorStateBySourceRef = {}; };
// KS-2 — TEST-ONLY SEAM, same spirit as the D4 accessors above: exposes the kit-door pose function +
// live template-readiness so dev/verify-ks2-door-assembly.mjs can assert the kit path's own contract
// (leaf transform == hinge socket + state rotation; distinct per-state angles; broken hides the leaf)
// without waiting on a real render loop to happen to warm the async preload first.
window.Theater._itrKitDoorRestPoseForTest = function(state){ return itrKitDoorRestPose(state); };
window.Theater._kitDoorTemplateReadyForTest = function(){ return kitDoorTemplateReady; };
window.Theater._kitDoorTemplateForTest = function(){ return kitDoorTemplate; };
window.Theater._interiorBuildKitDoorMeshForTest = function(entry, cx, cz, floorTopMap, widthAxisIsZ, realmId, realmProfile){
  return interiorBuildKitDoorMesh(entry, cx, cz, floorTopMap, widthAxisIsZ, realmId, realmProfile);
};
// KS-3 — TEST-ONLY SEAMS: the generic per-(pack,slug,realmId) donor template cache (closes the KS-2
// realm-grading-passthrough deviation) + the kit-shell wall/floor builders, same "expose without
// waiting on a real render loop" spirit as the KS-2 seams just above.
window.Theater._donorTemplateReadyForTest = function(pack, slug, realmId){
  const cached = DONOR_TEMPLATE_CACHE[pack + "/" + slug + "@" + (realmId || "fantasy")];
  return !!(cached && cached !== "pending");
};
window.Theater._kitDoorGradedTemplateForTest = function(realmId){ return kitDoorGradedTemplatesByRealm[realmId || "fantasy"] || null; };
window.Theater._interiorBuildKitShellWallsForTest = function(wallRuns, cx, cz, realmId, realmProfile, wallHeightBase){
  return interiorBuildKitShellWalls(wallRuns, cx, cz, realmId, realmProfile, wallHeightBase);
};
window.Theater._interiorBuildKitShellFloorsForTest = function(floorBlocks, cx, cz, realmId, realmProfile){
  return interiorBuildKitShellFloors(floorBlocks, cx, cz, realmId, realmProfile);
};
window.Theater._interiorLastKitShellForTest = function(){
  return { walls: S.interiorLastKitShellWalls || [], floors: S.interiorLastKitShellFloors || [] };
};
// D4c test seam (mirrors _setGradeTonemapForTest's own convention above): pin the broken-variant
// pick for every door regardless of sourceRef — a controlled A/B/C study-card capture (or a verify
// harness) can force each of "flopped"/"hanging"/"shattered" without brute-forcing a hash-matching
// sourceRef. Any other value (including null/undefined) clears the override and restores the real
// per-sourceRef hash pick.
window.Theater._setBrokenDoorVariantForTest = function(v){
  ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST = (v === "flopped" || v === "hanging" || v === "shattered") ? v : null;
};
window.Theater._brokenDoorVariantForTest = function(sourceRef){ return itrDoorBrokenVariantFor(sourceRef); };
// D4c diagnostic accessor (mirrors _interiorFloorListForTest's own convention) — exposes the
// mounted-door world-position/state diagnostic (S.interiorInteractablesWorldPositions, extended
// with brokenVariant/shardCount above) for capture-script/harness reads.
window.Theater._interiorInteractablesWorldPositionsForTest = function(){ return S.interiorInteractablesWorldPositions || []; };

// BEAUTY-WAVE.md VP1c — TEST-ONLY SEAM, same spirit as the two accessors above: exposes the flat-
// tabletop unit group's child count so a harness can prove S.unitGroup is empty after
// setInteriorBoard (the kaiju-leak fix) without a live WebGLRenderer read of the scene graph.
window.Theater._unitGroupChildCountForTest = function(){
  return (S.unitGroup && S.unitGroup.children.length) || 0;
};

// BW2-2 — TEST-ONLY SEAM: exposes the FLOOR CONTACT LAW's raw pieces (the lookup builder/reader, the
// standee-contact derivation, and every hand-tuned constant it replaces the old per-caller magic
// numbers with) so a harness can independently recompute the expected Y at any cell without either
// re-deriving the arithmetic blind or trusting interiorBuildPieces/setUnits as a black box. Same read-
// only-diagnostics spirit as every other _*ForTest seam above.
window.Theater._floorContactLawForTest = {
  interiorFloorTopMapFrom, interiorFloorTopAt, interiorStandeeContactY,
  ITR_FLOOR_BASE_Y, ITR_FLOOR_HEIGHT_FALLBACK,
  INTERIOR_BASE_HEIGHT, INTERIOR_BASE_Y_OFFSET, INTERIOR_POOL_Y_OFFSET, INTERIOR_DECAL_Y_OFFSET
};
// BW2-2 — TEST-ONLY SEAM: the shared contact-pool gradient texture (the BW2-2 addendum's soft radial
// shadow) so a harness can sample its pixels and assert center-alpha > edge-alpha without a live
// WebGLRenderer.
window.Theater._interiorPoolTextureForTest = function(){ return interiorPoolTexture(); };
window.Theater._interiorPoolMaterialForTest = function(){ return interiorPoolMaterial(); };
// BW2-2 — TEST-ONLY SEAM: exposes findUnit directly so a harness can inspect a MOUNTED combat unit's
// live THREE.Group (position/userData/children) after a real setInteriorBoard+setUnits sequence,
// without a public getter existing anywhere in product code (nothing outside this file's own verb
// plumbing ever needs a raw handle to a unit's Object3D).
window.Theater._findUnitForTest = function(id){ return findUnit(id); };
// BW2-2 — TEST-ONLY SEAM: exposes S.interiorFloorTopMap (the per-cell lookup setInteriorBoard caches)
// after a real board mount, so a harness can confirm it was actually built+cached from the LIVE board's
// own instances.floor, not just prove the builder function works in isolation (_floorContactLawForTest
// above already covers that).
window.Theater._interiorFloorTopMapForTest = function(){ return S.interiorFloorTopMap || null; };

// BW2-1b — TEST-ONLY SEAM: THE OCCLUSION LAW's own pure geometry (segment-vs-AABB, the per-standee
// sight-point derivation, the per-pillar-instance cutaway mask, and the stub-height constant/deriver)
// so a harness can exercise the exact math setInteriorBoard's pillar cutaway pass runs — including a
// RED-FIRST re-derivation of "this pillar WOULD occlude at full height" — without a live WebGLRenderer
// (a jsdom import is enough; no GPU/WebGL backend needed for pure-math checks). Same read-only-
// diagnostics spirit as every other _*ForTest seam above; no product code path reads this object.
window.Theater._occlusionLawForTest = {
  itrSegmentIntersectsAabb, itrPieceSightPoints, itrPillarCutawayMask,
  itrPillarStubHeight, ITR_PILLAR_STUB_FRAC,
  // S-1 OCCLUSION FADE additions: the shared ankle-height alias + the split helper + the ghost-opacity
  // constant, so a harness can re-derive "stub + ghost, contiguous, summing to the original height"
  // without a live mount.
  itrOcclusionAnkleHeight, itrSplitOccluderForAnkleGhost, ITR_OCCLUSION_GHOST_OPACITY,
  // STAGE-A A4 additions: the furniture AABB/mask pair, the pure hysteresis decision + bearing math,
  // and every new named const — a harness can re-derive the FULL A4 classification decision (raw mask
  // -> hysteresis-held commit -> upper-opacity/duration targets) without a live mount.
  itrFurnitureOcclusionBoxFor, itrFurnitureOcclusionMask,
  itrOcclusionBearingDeg, itrOcclusionBearingDeltaDeg, itrOcclusionNextCommitted, itrOcclusionIdFor,
  ITR_OCCLUSION_UPPER_OPACITY, ITR_OCCLUSION_FADE_IN_MS, ITR_OCCLUSION_FADE_OUT_MS,
  ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG, ITR_OCCLUSION_STEM_HEIGHT_U
};
// BW2-1b — TEST-ONLY SEAM: the LIVE camera world position setInteriorBoard's own pillar-cutaway pass
// actually raycasts from (the PREVIEW placeCamera() call's own output, see that call's header
// comment) — lets a harness assert the mask it gets from _occlusionLawForTest against the SAME
// position the real mount used, rather than a second camera-position derivation of its own.
window.Theater._interiorCameraPositionForTest = function(){
  return S.camera ? { x: S.camera.position.x, y: S.camera.position.y, z: S.camera.position.z, zoom: S.camera.zoom } : null;
};
// GRAPHICS PRODUCTION RESEARCH WAVE — DEV/HARNESS ONLY. Candidate profilers and offline reference
// renderers need the exact live scene rather than a lossy reconstruction. This returns references,
// not a serializable public API; no production caller may depend on it. The JSON-safe sibling is the
// durable measurement surface for capture gates and deliberately reports unique resources separately
// from draw submissions (an atlas can lower texture count without lowering mesh submissions).
window.Theater._graphicsResearchContextForTest = function(){
  return {
    scene: S.scene, camera: S.camera, renderer: S.renderer, composer: S.composer,
    interiorGroup: S.interiorGroup, postSuite: S.postSuite
  };
};
window.Theater._graphicsResearchInventoryForTest = function(){
  const materials = new Map(), textures = new Map(), objectKinds = {}, materialTypes = {};
  let objects = 0, meshes = 0, instancedMeshes = 0, sprites = 0;
  let transparentMaterials = 0, alphaTestMaterials = 0, additiveMaterials = 0;
  const visitMaterial = function(m){
    if(!m || materials.has(m.uuid)) return;
    materials.set(m.uuid, m);
    const type = m.type || "Material";
    materialTypes[type] = (materialTypes[type] || 0) + 1;
    if(m.transparent) transparentMaterials++;
    if((m.alphaTest || 0) > 0) alphaTestMaterials++;
    if(m.blending === THREE.AdditiveBlending) additiveMaterials++;
    Object.keys(m).forEach(function(k){
      const v = m[k];
      if(v && v.isTexture && v.uuid) textures.set(v.uuid, v);
    });
  };
  if(S.scene) S.scene.traverse(function(obj){
    objects++;
    const kind = obj.type || "Object3D";
    objectKinds[kind] = (objectKinds[kind] || 0) + 1;
    if(obj.isMesh) meshes++;
    if(obj.isInstancedMesh) instancedMeshes++;
    if(obj.isSprite || (obj.userData && obj.userData.sprite)) sprites++;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    list.forEach(visitMaterial);
    if(obj.customDepthMaterial) visitMaterial(obj.customDepthMaterial);
    if(obj.customDistanceMaterial) visitMaterial(obj.customDistanceMaterial);
  });
  const info = S.renderer && S.renderer.info;
  return {
    mounted: !!S.mounted, interior: !!S.isInteriorBoard,
    scene: { objects, meshes, instancedMeshes, sprites, objectKinds },
    resources: {
      materials: materials.size, textures: textures.size, materialTypes,
      transparentMaterials, alphaTestMaterials, additiveMaterials
    },
    renderer: info ? {
      calls: info.render.calls, triangles: info.render.triangles, points: info.render.points,
      lines: info.render.lines, geometries: info.memory.geometries, textures: info.memory.textures,
      programs: info.programs ? info.programs.length : null, frame: info.render.frame
    } : null,
    post: S.postSuite ? {
      mounted: !!S.postSuiteMounted,
      dof: !!(S.postSuite.dofPass && S.postSuite.dofPass.enabled),
      bloom: !!(S.postSuite.bloomPass && S.postSuite.bloomPass.enabled),
      grade: !!(S.postSuite.gradePass && S.postSuite.gradePass.enabled)
    } : null
  };
};
// C4.1a — TEST-ONLY SEAM: the write-sibling of _interiorCameraPositionForTest above. No production
// caller ever moves the camera off placeCamera's own 4-yaw/fixed-elevation grid (see this file's own
// CAM_YAW_OFFSET_DEG/CAM_ELEV_DEG convention) — a capture-gate harness needs a real GRAZING low-angle
// shot (dev/battle-gate/capture-wall-volumes.mjs's own acceptance: "inner face + cap + outer face all
// resolve") that no product camera pose ever produces, so this exposes a direct pose override for that
// one purpose. `zoomMultiplier` (optional) also scales `camera.zoom`; the board's interior camera is
// PERSPECTIVE (confirmed live), so ordinary distance-from-target already drives close-up framing — the
// zoom knob is a secondary lever, kept for completeness. Returns false (no-op) before any board mounts
// a camera. Three defensive measures below (tween-cancel / composer renderPass re-sync / a forced
// synchronous render) each close a REAL staleness risk for a pose set between board mounts — none of
// them turned out to be THE reason an early pass of the capture-gate harness kept reading a stale
// frame; that root cause was a `elementHandle.screenshot()`-on-WebGL-canvas quirk in headless Chrome,
// fixed on the HARNESS side by switching to a full-page screenshot (see capture-wall-volumes.mjs's own
// `shoot()`). Kept here anyway because they are each independently correct.
window.Theater._setInteriorCameraPoseForTest = function(pos, lookAt, zoomMultiplier){
  if(!S.camera) return false;
  // cancel any in-flight camera-pose GLIDE tween (placeCameraTweened's own MF1_CAMERA_TWEEN_DUR
  // convention) — otherwise tickTweens would overwrite S.camera.position/lookAt toward the glide's OWN
  // end pose on a subsequent rAF tick, retargeting this override out from under a caller that expects
  // it to hold.
  if(S.tweens && S.tweens.length) S.tweens = S.tweens.filter((tw) => !(tw && tw.isCameraPoseTween));
  if(pos) S.camera.position.set(pos.x, pos.y, pos.z);
  if(lookAt) S.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
  if(typeof zoomMultiplier === "number" && typeof S.camera.zoom === "number") S.camera.zoom = S.camera.zoom * zoomMultiplier;
  if(typeof S.camera.updateProjectionMatrix === "function") S.camera.updateProjectionMatrix();
  // mountPostSuite (this file, above) only re-syncs S.postSuite.renderPass.camera at BOARD-MOUNT time —
  // a pose override that happens BETWEEN mounts needs the same re-sync here, or the composer's own
  // cached RenderPass camera reference would go stale against this new pose on the next composited frame.
  if(S.postSuite && S.postSuite.renderPass) S.postSuite.renderPass.camera = S.camera;
  // force an IMMEDIATE synchronous render (bypassing markDirty's own rAF scheduling) — a caller that
  // reads pixels right after this call shouldn't depend on rAF timing (unreliable from a backgrounded/
  // automated tab — see _renderFrameForTest's own header, same rationale).
  try { renderTheaterFrame(); } catch(e) {}
  markDirty();
  return true;
};

// CLIP MARGIN LAW (Adam addendum, mid-flight on BW2-1b) — TEST-ONLY SEAM: the pure geometry (circle-
// vs-AABB push, the nearby-prism-box gatherer, the clamp-and-report nudge deriver) so a harness can
// exercise the exact math interiorBuildPieces/interiorBuildDressing run, independent of a live mount.
window.Theater._clipMarginLawForTest = {
  itrClosestPointOnAabbXZ, itrCircleAabbPushXZ, itrNearbyPrismBoxes, itrClipNudgeFor,
  CLIP_NUDGE_MAX_FRAC, CLIP_DRESSING_EPSILON
};
// BW2-2b — TEST-ONLY SEAM: runs the real per-frame facing/tilt pass on demand (updateSpriteBillboardYaw
// is otherwise only ever invoked from inside scheduleRender's requestAnimationFrame callback — a
// harness that needs a DETERMINISTIC read of "did the camera-tilt vs verb-tilt split apply correctly"
// without racing a real rAF tick calls this directly instead).
window.Theater._updateSpriteBillboardYawForTest = function(){ updateSpriteBillboardYaw(); };
// ENV-3 (docs/ENV-EXTERIOR-WAVE.md) ruling 5 — TEST-ONLY SEAM: a deterministic read of every
// S.propGroup billboard card's OWN rotation.y next to the "correct camera-facing" yaw
// updateSpriteBillboardYaw's own `facing` local would assign it (mirrors that function's exact
// formula, kept in lockstep by hand since `facing` is function-scoped there) — a harness asserts
// against this rather than screenshot-diffing to catch a facing regression (the "mirrored text" bug
// class) without a live GL frame.
window.Theater._propGroupCardsForTest = function(){
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;
  const expectedFacing = yaw + Math.PI;
  const out = [];
  if(S.propGroup){
    for(let i = 0; i < S.propGroup.children.length; i++){
      const fig = S.propGroup.children[i];
      if(!fig || !fig.userData || !fig.userData.sprite) continue;
      out.push({
        slug: fig.userData.dressingSlug || null,
        rotY: fig.rotation.y,
        expectedFacing: expectedFacing,
        x: fig.position.x, z: fig.position.z
      });
    }
  }
  return out;
};
// BW2-2b — TEST-ONLY SEAM: exposes the kilter RNG + the base-glow toggle so a harness can assert
// determinism/bounds (kilterFor) and the shared-material-isolation property (setBaseGlow only ever
// touches the ONE mesh it's handed) without re-deriving either from scratch.
window.Theater._kilterForTest = function(seedKey){ return kilterFor(seedKey); };
window.Theater._setBaseGlowForTest = function(mesh, glowing){ return setBaseGlow(mesh, glowing); };
// BW3-4 — TEST-ONLY SEAMS: same "expose the pure builder, don't require a live mount()" convention as
// _interiorBuildPiecesForTest above — dev/verify-bw3-4-light-shafts.mjs drives these directly (no
// WebGL context needed; none of the four touch S.renderer).
window.Theater._interiorBuildLightsForTest = function(lights, cx, cz, realmId, floorTopMap, pieces, isBrightRealm, wallMountData){
  return interiorBuildLights(lights, cx, cz, realmId, floorTopMap, pieces, isBrightRealm, wallMountData);
};
window.Theater._interiorBuildMotesForTest = function(seedStr, bounds, kind, lights, cx, cz){
  return interiorBuildMotes(seedStr, bounds, kind, lights, cx, cz);
};
window.Theater._interiorBuildLightConeForTest = function(light, height){ return interiorBuildLightCone(light, height); };
// runs ONE flicker tick synchronously against caller-supplied stand-ins (never S.pointLights/
// S.interiorFlickerTargets) — a deterministic fake-clock harness drives Math.random itself and reads
// the result back, rather than racing startLightFlicker's live requestAnimationFrame interpolation.
window.Theater._lightFlickerStepForTest = function(pointLights, bases, interiorTargets, amplitude){
  return lightFlickerStep(pointLights, bases, interiorTargets, amplitude);
};
// QF-B1 (2026-07-14, PLAY-LENS P0 #4) test hooks — same "_xxxForTest" idiom as every other seam
// above. _wholeObjectRetintColorBufferForTest exposes the pure per-vertex recolor math directly
// (no geometry/scene needed). _wholeObjectGeometryForTest exposes the cached-geometry factory so a
// harness can pull a REAL registered prop's baked color attribute (e.g. "prop:web-mass") with and
// without a retintHex and assert the buffer actually changed — the red-first repro for "a realm-prop
// entry reuses a whole-object model whose baked palette doesn't match what it's standing in for."
window.Theater._wholeObjectRetintColorBufferForTest = function(col, targetHex){
  const copy = Float32Array.from(col);
  wholeObjectRetintColorBuffer(copy, targetHex);
  return copy;
};
window.Theater._wholeObjectGeometryForTest = function(key, gray, pieceKind, retintHex){
  return wholeObjectGeometryFor(key, gray, pieceKind, retintHex);
};

// FACETED FANTASY PROP PILOT — TEST/CAPTURE ONLY. This seam mounts candidate citizens into an
// already-built production interior without adding them to a runtime registry. It deliberately keeps
// technical compilation, integrated visual review, and admission separate: every child is tagged
// runtimeAdmitted:false and the group is destroyed by the next normal setInteriorBoard rebuild.
// The builders below exercise the intended construction classes instead of contour-extruding every
// reference PNG: door/lever/trap are articulated geometry, the container is a six-faced box, the
// portrait is a shallow framed surface, and only the accepted B-treatment shield loads as a contour GLB.
window.Theater._mountFantasyPropPilotForTest = async function(spec){
  if(!S.interiorGroup || !S.isInteriorBoard) return { ok:false, reason:"no-interior-board" };
  spec = spec || {};
  const group = new THREE.Group();
  group.name = "fantasy-prop-pilot-candidates";
  group.userData.runtimeAdmitted = false;
  group.userData.captureOnly = true;

  const mat = function(color, roughness, metalness, emissive){
    const m = new THREE.MeshStandardMaterial({ color, roughness: roughness == null ? 0.72 : roughness,
      metalness: metalness == null ? 0.08 : metalness, flatShading:true });
    if(emissive){ m.emissive = new THREE.Color(emissive); m.emissiveIntensity = 0.7; }
    return m;
  };
  const oak = mat("#5a321d", 0.86, 0.02), oakDark = mat("#2b1710", 0.9, 0.01);
  const iron = mat("#443d38", 0.48, 0.68), ironDark = mat("#201d1c", 0.6, 0.58);
  const brass = mat("#a8782f", 0.38, 0.72), stone = mat("#6f685c", 0.92, 0.02);
  const trapMetal = mat("#554f46", 0.62, 0.52);
  const addBox = function(parent, size, pos, material, bevel){
    const geo = bevel
      ? new THREE.BoxGeometry(size.x, size.y, size.z, 2, 2, 2)
      : new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geo, material); mesh.position.set(pos.x, pos.y, pos.z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const tag = function(obj, slug, constructionClass, sourceRefs){
    obj.userData.slug = slug; obj.userData.constructionClass = constructionClass;
    obj.userData.sourceRefs = sourceRefs || []; obj.userData.runtimeAdmitted = false;
    return obj;
  };
  const mount = function(obj, p, yaw){ obj.position.set(p.x, p.y, p.z); obj.rotation.y = yaw || 0; group.add(obj); return obj; };

  function door(state){
    const root = new THREE.Group(), leaf = new THREE.Group();
    addBox(root,{x:1.42,y:0.18,z:0.24},{x:0,y:2.02,z:0},stone);
    addBox(root,{x:0.18,y:2.1,z:0.24},{x:-0.72,y:1.05,z:0},stone);
    addBox(root,{x:0.18,y:2.1,z:0.24},{x:0.72,y:1.05,z:0},stone);
    addBox(leaf,{x:1.22,y:1.9,z:0.13},{x:0,y:0.95,z:0.03},oak,true);
    [-0.38,0,0.38].forEach(x=>addBox(leaf,{x:0.07,y:1.8,z:0.03},{x,y:0.95,z:0.11},oakDark));
    [0.35,1.52].forEach(y=>addBox(leaf,{x:1.12,y:0.09,z:0.06},{x:0,y,z:0.13},iron));
    addBox(leaf,{x:0.11,y:0.11,z:0.07},{x:0.42,y:0.96,z:0.17},brass);
    if(state === "open"){ leaf.position.x = -0.57; leaf.rotation.y = -Math.PI * 0.42; }
    root.add(leaf); return tag(root,"fantasy-obj-door-"+(state === "open" ? "open" : "shut"),"ARTICULATED_MODEL",
      ["Engine/02. _Procedures/Dungeon Encounter v2.0.md#Dungeon Door Type","Engine/02. _Procedures/Dungeon Encounter v2.0.md#Dungeon Door State","assets/dressing/fantasy-obj-door-"+(state === "open" ? "open" : "shut")+".png"]);
  }
  function lever(state){
    const root = new THREE.Group();
    addBox(root,{x:0.38,y:0.58,z:0.10},{x:0,y:0.32,z:0},ironDark,true);
    addBox(root,{x:0.27,y:0.44,z:0.05},{x:0,y:0.32,z:0.07},brass,true);
    const arm = new THREE.Group();
    addBox(arm,{x:0.075,y:0.48,z:0.075},{x:0,y:0.24,z:0},iron);
    const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,0),mat("#7b1f19",0.45,0.16));
    knob.position.y=0.5; knob.castShadow=true; arm.add(knob);
    arm.position.set(0,0.3,0.14); arm.rotation.z = state === "right" ? -0.72 : 0.72; root.add(arm);
    return tag(root,"fantasy-obj-lever-"+state,"ARTICULATED_MODEL",
      ["docs/BEAUTY-WAVE-5.md#levers","assets/dressing/fantasy-obj-lever-"+state+".png"]);
  }
  function trap(){
    const root = new THREE.Group();
    addBox(root,{x:1.25,y:0.055,z:1.05},{x:0,y:0.028,z:0},stone);
    addBox(root,{x:1.08,y:0.045,z:0.88},{x:0,y:0.07,z:0},trapMetal);
    [-0.38,-0.13,0.13,0.38].forEach(x=>addBox(root,{x:0.055,y:0.035,z:0.78},{x,y:0.10,z:0},ironDark));
    addBox(root,{x:0.16,y:0.04,z:0.16},{x:0,y:0.11,z:0},brass,true);
    return tag(root,"fantasy-obj-trap-hidden","MODEL_RECIPE",
      ["Engine/02. _Procedures/Dungeon Encounter v2.0.md","assets/dressing/fantasy-obj-trap-hidden.png"]);
  }
  function facedContainer(){
    const root = new THREE.Group();
    addBox(root,{x:1.05,y:0.68,z:0.78},{x:0,y:0.34,z:0},oak,true);
    [-0.43,0.43].forEach(x=>addBox(root,{x:0.09,y:0.72,z:0.84},{x,y:0.36,z:0},iron));
    [-0.30,0.30].forEach(z=>addBox(root,{x:1.1,y:0.09,z:0.08},{x:0,y:0.60,z},iron));
    addBox(root,{x:0.18,y:0.22,z:0.05},{x:0,y:0.42,z:0.42},brass,true);
    return tag(root,"fantasy-obj-container-intact","FACED_BOX",
      ["docs/BEAUTY-WAVE-5.md#containers","assets/dressing/fantasy-obj-container-intact.png"]);
  }
  function portrait(){
    const root = new THREE.Group(), tex = new THREE.TextureLoader().load("assets/dressing/fantasy-painting-1.png",markDirty);
    tex.colorSpace = THREE.SRGBColorSpace;
    addBox(root,{x:1.22,y:1.48,z:0.08},{x:0,y:0.74,z:0},oakDark,true);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.02,1.28),new THREE.MeshStandardMaterial({map:tex,roughness:0.78,metalness:0,side:THREE.DoubleSide}));
    face.position.set(0,0.74,0.046); face.castShadow=true; root.add(face);
    [-0.46,0.46].forEach(x=>addBox(root,{x:0.07,y:1.36,z:0.07},{x,y:0.74,z:0.08},brass));
    [-0.59,0.59].forEach(y=>addBox(root,{x:1.02,y:0.07,z:0.07},{x:0,y:0.74+y,z:0.08},brass));
    return tag(root,"fantasy-painting-1","SHALLOW_EXTRUDE",
      ["src/engine/place-dressing.js#fantasy-painting-1","assets/dressing/fantasy-painting-1.png","spr-fantasy-ancient-red-dragon"]);
  }

  mount(door("shut"),spec.doorShut || {x:-2.5,y:0,z:-2.55},0);
  mount(door("open"),spec.doorOpen || {x:2.35,y:0,z:-2.55},0);
  mount(lever("left"),spec.leverLeft || {x:-1.25,y:0.72,z:-2.38},0);
  mount(lever("right"),spec.leverRight || {x:1.25,y:0.72,z:-2.38},0);
  mount(portrait(),spec.portrait || {x:0,y:0.70,z:-2.42},0);
  mount(trap(),spec.trap || {x:-1.0,y:0.01,z:0.35},0);
  mount(facedContainer(),spec.container || {x:1.55,y:0,z:0.25},-0.25);

  let shield = null;
  try {
    shield = await glbLoadScene("dev/model-foundry/faceted-extrusion-proof/fantasy-shield-faceted.glb");
    if(shield){
      const bounds=new THREE.Box3().setFromObject(shield), size=new THREE.Vector3(), center=new THREE.Vector3();
      bounds.getSize(size); bounds.getCenter(center);
      const scalar=1.15/Math.max(0.001,size.y,size.x);
      shield.scale.setScalar(scalar);
      shield.position.set(-center.x*scalar,-center.y*scalar,-center.z*scalar);
      shield.traverse(function(o){ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
      const shieldMount=new THREE.Group();shieldMount.add(shield);
      tag(shieldMount,"fantasy-ornate-wall-shield","EXTRUDE",
        ["dev/model-foundry/faceted-extrusion-proof/fantasy-shield-flat-orthographic-source.png","dev/model-foundry/faceted-extrusion-proof/fantasy-shield-faceted.glb"]);
      mount(shieldMount,spec.shield || {x:-2.05,y:1.45,z:-2.35},0);
    }
  } catch(e){ console.warn("qa: fantasy pilot shield load failed",e); }
  S.interiorGroup.add(group); markDirty();
  return { ok:true, runtimeAdmittedCount:0, mounted:group.children.map(function(c){ return {
    slug:c.userData.slug || null, constructionClass:c.userData.constructionClass || null,
    runtimeAdmitted:false, sourceRefs:c.userData.sourceRefs || []
  }; }) };
};
// Capture-only composition helper for the pilot above. Candidate props are not part of ShotPlan, so
// the production occlusion classifier cannot know they are required subjects. Fade the two wall-upper
// segments nearest the live camera while retaining the opaque capped stem; this uses the real split
// wall bodies and leaves geometry/collision/mount ownership intact.
window.Theater._fantasyPropPilotCutawayForTest = function(){
  if(!S.camera || !S.interiorLastRoomShell) return false;
  const segments=S.interiorLastRoomShell.wallSegments || [], uppers=S.interiorLastRoomShell.wallUpperMeshes || [];
  const ranked=uppers.map(function(entry){
    const seg=segments[entry.ownerSegIndex], mid=seg?{x:(seg.a.x+seg.b.x)/2,z:(seg.a.z+seg.b.z)/2}:{x:0,z:0};
    return {entry,d:Math.hypot(mid.x-S.camera.position.x,mid.z-S.camera.position.z)};
  }).sort(function(a,b){return a.d-b.d;});
  ranked.slice(0,Math.min(2,ranked.length)).forEach(function(hit){
    const m=hit.entry.mesh&&hit.entry.mesh.material;if(m){m.transparent=true;m.opacity=0.045;m.depthWrite=false;}
  });
  try{renderTheaterFrame();}catch(e){} markDirty(); return true;
};
window.Theater._freezeFantasyPropPilotLightForTest = function(){ stopLightFlicker(); try{renderTheaterFrame();}catch(e){} return true; };

// ---- LIGHT LAB: extracted to src/ui/theater-light-lab.js (split B2, 2026-07-25) ----
// LL-1 lives in its own module now; this root keeps the lighting consts the lab tunes, imports
// the lab surface (top import block), passes capabilities via lightLabInit(ctx) at end-of-body,
// publishes its facade seams via lightLabPublishSeams() there, and re-syncs S at both
// `S = createTheaterState()` sites.

// ---- CLAY ROOM: extracted to src/ui/theater-clay-room.js (split B1, 2026-07-25) ----
// The ?clayroom=1 workbench region (CLAY-ROOM ADDITIONS BEGIN/END, ~5.1k lines) lives in its own
// module now. This root imports its surface (see the import block up top), passes capabilities via
// clayRoomInit(ctx) below at end-of-body, and re-syncs the live S record via clayRoomSyncState(S)
// at both `S = createTheaterState()` sites. dev/verify-clay-room.mjs's region grep-gates follow the
// markers into the new file.

// ---- split B1: wire the Clay Room module (see src/ui/theater-clay-room.js header) ----
// (split B3's skinsInit/wholeObjectInit are NOT here — they run right after the import block, above;
// see that block's own comment for the boot-time glbLoadScene reason. figureBuildInit IS here: its ctx
// carries top-level consts that are still in TDZ up there, and the first thing that can call figureFor
// is clayRoomBootSelfMount() at the very bottom of this block.)
/* ---- split B4: wire the post-processing module (see src/ui/theater-post.js's header) ----
   First in this block because it is the deepest leaf here: the light lab's own ctx carries
   mountPostSuite/updatePostSuiteGrade, and clayRoomBootSelfMount() at the bottom of the block is the
   first thing that can mount a board. Not hoisted up to the import block (unlike B3's
   skins/wholeObject inits): this ctx carries the live `S` record and LIGHT_TUNABLES, neither of which
   exists yet at module-eval time, and nothing in this file's own top-level body touches a post pass. */
postInit({
  S,
  postCtxGetGradeTonemap: function(){ return GRADE_TONEMAP; },
  postCtxBloomMaskDisabled: function(){ return BLOOM_MASK_DISABLED_FOR_TEST; },
  hexStrToNum,
  BLOOM_LAYER,
  GRADE_EXPOSURE_FLOOR,
  LIGHT_DEFAULT_PROFILE,
  LIGHT_TUNABLES,
});
/* ---- split B5: wire the lighting / practicals / motes modules (see each file's own header) ----
   All three sit in this end-of-body block rather than up with B3's skins/wholeObject inits: their ctx
   carries the live `S` record and LIGHT_TUNABLES (a TDZ const at import time), and nothing in this
   file's own top-level body reaches a light, a practical or a mote — the first thing that can is
   clayRoomBootSelfMount() at the bottom of this block. lightingInit runs FIRST of the three:
   theater-practicals.js imports celestialArcFor/CELESTIAL_* straight from theater-lighting.js
   (leaf->leaf), so the lighting mirrors must be live before any practical body can run. */
lightingInit({
  S,
  lightingCtxCameraKeyCastsShadow: function(){ return ITR_CAMERA_KEY_CASTS_SHADOW; },
  gradeColorLocal,
  markDirty,
  ITR_CAMERA_KEY_INTENSITY,
  LIGHT_TUNABLES,
  SPRITE_CAMERA_FILL_AT_TARGET,
  SPRITE_CAMERA_FILL_COLOR,
  SPRITE_CAMERA_FILL_LAYER,
  VOID_BG,
});
practicalsInit({
  practicalsCtxBrightSuppressPracticals: function(){ return ITR_BRIGHT_SUPPRESS_PRACTICALS; },
  practicalsCtxGlowDiscDiagnostic: function(){ return ITR_GLOW_DISC_DIAGNOSTIC; },
  practicalsCtxLightConeEnabled: function(){ return ITR_LIGHT_CONE_ENABLED; },
  BLOOM_LAYER,
  ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE,
  LIGHT_TUNABLES,
  dressingTextureFor,
  interiorFloorTopAt,
});
motesInit({
  S,
  markDirty,
});
/* ---- split B6: wire the camera / occlusion modules (see each file's own header) ----
   Both sit in this end-of-body block for the same reason B4/B5's do: their ctx carries the live `S`
   record, which does not exist at module-eval time, and nothing in this file's own top-level body
   places a camera or classifies an occluder — the first thing that can is clayRoomBootSelfMount() at
   the bottom of this block. cameraInit runs FIRST of the two: theater-occlusion.js imports
   mf1EaseOutCubic/mf1Lerp straight from theater-camera.js (leaf->leaf), so the camera module's own
   bindings must be live before any occlusion body can run a fade tween. Neither ctx carries a mutable
   root flag — there is not one accessor in either file (ITR_OCCLUSION_FADE_DISABLED_FOR_TEST stays
   here and has no reader in either module). */
cameraInit({
  S,
  FOG_FAR,
  HUMAN_TRUE_HEIGHT,
  markDirty,
  spriteEntryFor,
  startTweenLoop,
});
occlusionInit({
  S,
  HUMAN_TRUE_HEIGHT,
  interiorFloorTopAt,
  interiorStandeeContactY,
  itrScaleHexValue,
  markDirty,
  spriteEntryFor,
  startTweenLoop,
});
/* split B7 (2026-07-25) — the SPRITE / STANDEE-MOUNT / OVERLAY trio, same end-of-body ctx law as
   every module above: all three read the live S record, and their ctx lists carry TDZ-bound consts
   (LIGHT_TUNABLES, ITR_FLOOR_*) plus root functions declared far below this file's import block, so
   they wire HERE and not right after the imports. Nothing in this file's own top-level body builds a
   sprite, mounts a base or spawns an overlay before this point — the first thing that can is
   clayRoomBootSelfMount() at the bottom of this block. standeeMountInit runs FIRST of the three:
   theater-sprites.js imports mountedStandeeFigures/resolveMountedStandeeSupportCollisions/
   syncStandeeContactBlob straight from theater-standee-mount.js (leaf->leaf) and theater-overlays.js
   imports setBaseGlow from it, so that module's own S must be live before any facing pass or ring
   mount can run. spritesInit's ctx carries the only two accessors in this step (the mutable root
   `let`s SPRITE_UNLIT_DEBUG and ITR_SPRITE_EMISSIVE_TINT); the other two ctx lists carry none. */
standeeMountInit({
  S,
  ITR_FLOOR_BASE_Y,
  ITR_FLOOR_HEIGHT_FALLBACK,
  hashSeed,
  hexToRGB,
  rgbToHex,
  scaleRGB,
});
spritesInit({
  S,
  spritesCtxUnlitDebug: function(){ return SPRITE_UNLIT_DEBUG; },
  spritesCtxEmissiveTint: function(){ return ITR_SPRITE_EMISSIVE_TINT; },
  GLB_TARGET_HEIGHT,
  HUMAN_TRUE_HEIGHT,
  LIGHT_TUNABLES,
  SPRITE_CAMERA_FILL_LAYER,
  _censusBoardSceneKind,
  setInteriorBoard,
  setUnits,
  spriteAssetPathFor,
  textureLoader,
});
overlaysInit({
  S,
  findUnit,
  interiorFloorTopAt,
  markDirty,
  nearestify,
  startTweenLoop,
  textureLoader,
});
/* split B8 (2026-07-25) — the INTERIOR MESH + DRESSING pair, same end-of-body ctx law as every module
   above. interiorMeshInit runs FIRST of the two: src/ui/theater-dressing.js imports interiorFileTexture
   straight from src/ui/theater-interior-mesh.js (leaf->leaf), so the mesh module's own mirrors
   (textureLoader/markDirty/nearestify) must be live before furniturePanelMaterial can resolve a folded
   face tile. Neither ctx could be hoisted to the import block: both carry `textureLoader` (a TDZ const
   at module-eval time) and dressing's carries the live `S` record. Nothing in this file's own top-level
   body builds an interior mesh or dresses a room — the first thing that can is clayRoomBootSelfMount()
   at the bottom of this block. interiorMeshInit's ctx carries NO accessor (the mesh family reads no
   mutable root flag at all); dressingInit's carries the step's only two, both already B7 accessors on
   the sprite side: SPRITE_UNLIT_DEBUG and ITR_SPRITE_EMISSIVE_TINT. */
interiorMeshInit({
  applyPsxShaderTweaks,
  markDirty,
  nearestify,
  textureLoader,
});
dressingInit({
  S,
  dressingCtxUnlitDebug: function(){ return SPRITE_UNLIT_DEBUG; },
  dressingCtxEmissiveTint: function(){ return ITR_SPRITE_EMISSIVE_TINT; },
  LIGHT_TUNABLES,
  _censusBoardSceneKind,
  applyPsxShaderTweaks,
  buildTheaterCtx,
  interiorFloorTopAt,
  kilterFor,
  mfCascadeMount,
  nearestify,
  setBoard,
  setInteriorBoard,
  spriteEntryFor,
  textureLoader,
});
/* split B9 (2026-07-25) — THE TWO SCENE REALIZERS, same end-of-body ctx law as every module above.
   Both wire HERE rather than after the import block: their ctx lists carry the live `S` record and
   TDZ-bound consts (LIGHT_TUNABLES, ITR_FLOOR_*, the ITR_SCENE_* / ITR_EMISSIVE_* families) plus root
   functions declared far below the imports. Nothing in this file's own top-level body renders a board
   before this point — the first thing that can is clayRoomBootSelfMount() at the bottom of this block,
   and loadWholeObjectBuilders' replay callback (module scope, above) only ever fires after the dynamic
   import() promises settle, i.e. strictly after this synchronous body completes. They are wired AFTER
   dressingInit because both realizers import theater-dressing.js directly (leaf->leaf: buildDressingCard
   for ENV-2's biome scatter; interiorBuildPieces/Dressing/Furniture/WallProps for the room), so that
   module's own mirrors must be live first. tabletopInit's ctx carries two accessors (WHOLE_OBJECT_ENABLED,
   ITR_SPRITE_EMISSIVE_TINT); interiorRealizeInit's carries six (ITR_ROOM_SHELL,
   ROOM_SHELL_POLYGON_KERNEL_FLAG, ITR_OCCLUSION_FADE_DISABLED_FOR_TEST,
   ITR_EMISSIVE_FILL_DISABLED_FOR_TEST, ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST and the
   ITR_SPRITE_EMISSIVE_TINT setter) — every one a mutable root `let` a window.Theater seam can flip at
   runtime, which is why neither an import binding nor a copied mirror would do. */
tabletopInit({
  S,
  tabletopCtxWholeObjectEnabled: function(){ return WHOLE_OBJECT_ENABLED; },
  tabletopCtxSetSpriteEmissiveTint: function(v){ ITR_SPRITE_EMISSIVE_TINT = v; },
  DEFAULT_FIGURE_ZOOM_STEPS,
  FIGURE_SCALE,
  HEMI_INTENSITY_DEFAULT,
  SMALL_BOARD_BAND_THRESHOLD,
  THEATER_DEFAULT_ENV_FALLBACK,
  TILE_GAP,
  TILE_SIZE,
  ZOOM_STEP_FACTOR,
  addGroundingBlob,
  applyConditionMods,
  applyPsxShaderTweaks,
  baseDiscMatFor,
  buildTheaterCtx,
  drainTweens,
  flatTints,
  gradeColorLocal,
  hashSeed,
  interiorFloorTopAt,
  kilterFor,
  markDirty,
  mfDespawnGraceFor,
  mfMountGraceFor,
  mountLightProp,
  recipeFor,
  renderPartInto,
  scorchTintFor,
  sizeScaleFor,
  tileMaterialsFor,
  unitTint,
  nearestify,
  textureLoader,
});
interiorRealizeInit({
  S,
  itrCtxGetRoomShell: rootGetRoomShell,
  itrCtxRoomShellPolygonKernel: function(){ return ROOM_SHELL_POLYGON_KERNEL_FLAG; },
  itrCtxOcclusionFadeDisabled: function(){ return ITR_OCCLUSION_FADE_DISABLED_FOR_TEST; },
  itrCtxEmissiveFillDisabled: function(){ return ITR_EMISSIVE_FILL_DISABLED_FOR_TEST; },
  itrCtxEmissiveAlbedoLiftDisabled: function(){ return ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST; },
  itrCtxSetSpriteEmissiveTint: function(v){ ITR_SPRITE_EMISSIVE_TINT = v; },
  HEMI_INTENSITY_DEFAULT,
  INTERIOR_CAM_MODE,
  ITR_BRIGHT_PROFILES,
  ITR_EMISSIVE_ALBEDO_LIFT,
  ITR_EMISSIVE_PROFILES,
  ITR_EMISSIVE_SCENE_AMBIENT,
  ITR_EMISSIVE_SCENE_FILL,
  ITR_EMISSIVE_SCENE_FILL_SCALE,
  ITR_EMISSIVE_SCENE_HEMI,
  ITR_EMISSIVE_SCENE_KEY,
  ITR_FLOOR_BASE_Y,
  ITR_FLOOR_HEIGHT_FALLBACK,
  ITR_GLOOM_AMBIENT_LIFT,
  ITR_ROOM_SHELL_RISER_DARKEN,
  ITR_ROOM_SHELL_UV_DENSITY,
  ITR_SCENE_DOORFRAME_VALUE,
  ITR_SCENE_FILL,
  ITR_SCENE_FILL_SCALE,
  ITR_SCENE_HEMI,
  ITR_SCENE_KEY,
  ITR_SPRITE_TINT_STRENGTH,
  LIGHT_TUNABLES,
  THEATER_DEFAULT_ENV_FALLBACK,
  applyPsxShaderTweaks,
  buildTheaterCtx,
  drainTweens,
  gradeColorLocal,
  hexStrToNum,
  interiorBuildInteractables,
  interiorBuildKitShellFloors,
  interiorBuildKitShellWalls,
  interiorFloorTopAt,
  interiorFloorTopMapFrom,
  itrApplyDoorMounts,
  itrBrightRealmFillFor,
  itrDoorMountMapFrom,
  itrScaleHexValue,
  markDirty,
  nearestify,
  startTweenLoop,
  textureLoader,
});
figureBuildInit({
  figCtxSpriteChannelEnabled: function(){ return SPRITE_CHANNEL_ENABLED; },
  figCtxWholeObjectEnabled: function(){ return WHOLE_OBJECT_ENABLED; },
  ARCHETYPE_BUILDERS,
  WEAPON_PART_KEY,
  _spriteCensusOutcome,
  buildFigureFromRecipe,
  buildSpriteBillboard,
  flatTints,
  interiorSpriteBillboard,
  orientYawForArchetype,
  recipeFor,
  renderPartInto,
  spriteEntryFor,
  weaponCarryFor,
});
lightLabInit({
  S,
  labCtxGetGradeTonemap: function(){ return GRADE_TONEMAP; },
  applyCelestialArc,
  applyLightProfile,
  markDirty,
  mount,
  mountPostSuite,
  renderTheaterFrame,
  retire,
  scheduleRender,
  setBoard,
  setInteriorBoard,
  updatePostSuiteGrade,
  CELESTIAL_ARC,
  LIGHT_DEFAULT_PROFILE,
  LIGHT_LAB_AUTHORED_BASELINE,
  LIGHT_PROFILES,
  LIGHT_TUNABLES,
  STAGE_AMBIENT_FLOOR,
});
lightLabPublishSeams();
clayRoomInit({
  S,
  clayCtxGetRoomShell: rootGetRoomShell,
  clayCtxSetRoomShell: rootSetRoomShell,
  addInteriorContactBlob,
  addWallContactAO,
  applyLightProfile,
  applyPsxCanvasSize,
  buildFurnitureAssembly,
  buildInteriorBase,
  buildSpriteBillboard,
  buildTheaterCtx,
  clayRoomSetSelectedSprite,
  clayRoomSetSelectedSpriteView,
  clayRoomSpriteCitizenshipSnapshot,
  clearGroup,
  createTheaterState,
  donorTemplateFor,
  drainTweens,
  dressingTextureFor,
  f1BuildCombatGrid,
  findUnit,
  interiorBuildInstancedMesh,
  interiorBuildInteractables,
  interiorBuildLights,
  interiorBuildMotes,
  interiorBuildPieces,
  interiorFloorTopAt,
  interiorSpriteBillboard,
  interiorStandeeContactY,
  interiorStandeeSupportMetrics,
  itrOcclusionClassify,
  itrPillarCutawayMask,
  lightFlickerApplySample,
  lightFlickerStep,
  lightLabApplyTunables,
  lightLabMaybeAutoMount,
  lightLabShouldEnable,
  markDirty,
  mount,
  mountLightLab,
  placeCameraTweened,
  play,
  renderTheaterFrame,
  retire,
  rotate,
  scheduleRender,
  setBaseGlow,
  setInteriorBoard,
  setInteriorVariant,
  spriteAssetPathFor,
  spriteEntryFor,
  spriteTextureFor,
  startLightFlicker,
  startTweenLoop,
  stopLightFlicker,
  stopMoteDrift,
  syncStandeeContactBlob,
  zoom,
  BLOOM_LAYER,
  HUMAN_TRUE_HEIGHT,
  INTERIOR_BASE_HEIGHT,
  INTERIOR_BASE_TREAD_DEPTH,
  INTERIOR_CAM_MODE,
  ITR_DOOR_DEPTH_IN_WALL_DEFAULT,
  ITR_DOOR_MOUNT_ALONG_SHELL,
  ITR_DOOR_SWING_TWEEN_MS,
  ITR_SHADOW_FORM_HEMI_FLOOR,
  LIGHT_LAB_AUTHORED_BASELINE,
  LIGHT_TUNABLES,
  PSX_RES_SCALE,
});
clayRoomBootSelfMount();
