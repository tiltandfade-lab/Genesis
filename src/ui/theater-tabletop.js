/* THEATER TABLETOP — the FLAT TABLETOP REALIZER: setBoard (the combat/settlement tile-column tray)
   and setUnits (the mounted figure pass), plus REALM-PROPS-WIRING §3's prop footprint family
   (PROP_FOOTPRINT_BY_SIZE / propFootprint / propSpanZones) and DEAD-STATE's desaturateGroup —
   extracted VERBATIM from src/ui/theater-boot.js in split step B9 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md §"Suggested migration method" item 5, "preserve the flat
   tabletop and interior paths as distinct consumers of shared capabilities").

   THIS IS ONE OF THE TWO SCENE REALIZERS. Its peer is src/ui/theater-interior-realize.js
   (setInteriorBoard / setInteriorVariant). They are PEERS, not layers: neither imports the other, and
   every capability they share (the camera fit, the lighting profiles, the post suite, the dressing
   cards, the standee plinths, the sprite facing pass) is reached through the SAME leaf modules with the
   SAME specifiers, so both channels consume one cached instance of each. The root keeps mount() /
   reattach() / retire() / rotate() / zoom() / play() and calls these two through imports.

   THE PROTECTED CONTRACTS THIS FILE CARRIES: the THEATER-NEXT §3.1/§3.2 DIRTY-KEY SKIP on both
   entry points (full-payload JSON.stringify against S.boardKey / S.unitsKey, boardSkips/unitSkips
   counted on the skip, boardBuilds/unitBuilds on the build — dev/verify-board-admission-dirty-key.mjs
   gates this live) and the A2 drain-before-teardown order (drainTweens(S) BEFORE the first clearGroup
   in both functions — dev/verify-theater-verbs.mjs A10e/A10f). Every per-channel RESTORE setBoard owns
   stays byte-identical: shadowMap.enabled=true, the S.orthoCamera swap-back + placeCamera, the
   HEMI_INTENSITY_DEFAULT / keyLight 0.72 / fillLight 0.22 restores, interiorCameraKey + spriteCameraFill
   to 0, the sprite emissive tint back to white, teardownPostSuite (the flat tabletop is pass-free), and
   S.interiorFitMaxHeight/S.boardTallestTileTop reset — setInteriorBoard is the ONLY place any of them is
   ever turned the other way. VP1c's other half also stays here: setBoard clears S.interiorGroup so a
   combat board never inherits an interior tray. G9 tune 6's boardCenter-at-origin + boardOrigin split,
   the THEATER-ZOOM-SPREAD small-board bias keyed on S.zoomBiasBandCount, ENV-1/1B/1c's
   profile/clock/shadow post-passes in their exact order, ENV-2's biome-scatter dressing-card branch
   ahead of the whole-object/part chain, and ENV-3 ruling 5's synchronous SYNC-FACE ON REBUILD
   (updateSpriteBillboardYaw before markDirty) are all unmoved. In setUnits: MF-2's despawn diff BEFORE
   clearGroup + the S.despawnGroup lift, the selective scorch-marker sweep (never a wholesale
   clearGroup(S.propGroup)), BW2-2's kilter + plinth + contact-pool standee mount, the whole-object D1/D2/
   D8 scale/disc/gray-geometry path, QF-B3's bbox height measurement, and the ENV-1B cast-shadow stamp.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B8 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via tabletopInit(ctx) into the module-local mirrors
   below, so every moved body keeps its bare identifiers. It reads AND writes the live theater state
   record, so the root also calls tabletopSyncState(S) at BOTH `S = createTheaterState()` reassignment
   sites, beside the existing clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState /
   motesSyncState / cameraSyncState / occlusionSyncState / standeeMountSyncState / spritesSyncState /
   overlaysSyncState / dressingSyncState calls.

   THE MF-2 GRACE GLUE STAYS IN THE ROOT (B8's ruling, re-censused this step and UPHELD):
   mfArtMaterialsOf / mfSetMaterialsOpacity / mfMountGraceFor / mfDespawnGraceFor / mfCascadeMount have
   two consumers — setUnits (here, mount + despawn grace on combat figures) and src/ui/theater-dressing.js
   (the piece/dressing/furniture CASCADE, which reaches mfCascadeMount through its own ctx from the root).
   Moving the family here would have made the INTERIOR dressing channel import the TABLETOP realizer for
   its cascade — a leaf edge that inverts the two-realizer peer law for no gain — and would have broken
   dev/verify-mf2-spawn-grace.mjs's B1a-c/B2 extractions, which read all five functions out of the root
   text. So the family stays root-owned and this file reaches mfMountGraceFor/mfDespawnGraceFor through
   the ctx below, exactly as dressing already reaches mfCascadeMount.

   ACCESSORS (exactly two, the step's only non-verbatim production lines on this side): the mutable root
   `let`s WHOLE_OBJECT_ENABLED (read in the prop whole-object branch; live-flipped by
   window.Theater.wholeObject) and ITR_SPRITE_EMISSIVE_TINT (written back to white by setBoard; read live
   by theater-sprites.js and theater-dressing.js through their OWN B7/B8 ctx getters off the SAME root
   `let`). An import binding would be read-only and a copied mirror would go stale the instant a seam
   flips one — the standing law since B2.

   `Parts` is imported with the IDENTICAL specifier the root uses so both resolve to the one cached
   module instance; `window.Theater.stats` stays the live facade object the root assembles.
   THIS MODULE OWNS NO SCHEDULER (censused: zero requestAnimationFrame) — markDirty/drainTweens/
   startTweenLoop stay the root's. */

import * as THREE from "three";
import * as Parts from "./theater-parts.js";
import { clearGroup, disposeGroupChild } from "./theater-dispose.js";
import { placeCamera, refitTabletopHeightFit } from "./theater-camera.js";
import {
  LIGHT_DEFAULT_PROFILE, applyLightProfile, applyTabletopExteriorLook, applyCelestialArc,
  applyTabletopShadowCasters, voidTintForTabletop,
} from "./theater-lighting.js";
import { teardownPostSuite } from "./theater-post.js";
import { buildDressingCard } from "./theater-dressing.js";
import {
  interiorStandeeSupportMetrics, interiorStandeeContactY, buildInteriorBase, addInteriorContactBlob,
} from "./theater-standee-mount.js";
import { updateSpriteBillboardYaw } from "./theater-sprites.js";
import { WHOLE_OBJECT_SCALE, wholeObjectGeometryFor, wholeObjectMaterialsFor } from "./theater-whole-object.js";
import { figureFor } from "./theater-figure-build.js";
import { resolveWholeObject } from "./theater-figures.js";

/* ---- the ctx mirrors (root-owned capabilities; see CTX LAW above) ---- */
let DEFAULT_FIGURE_ZOOM_STEPS, FIGURE_SCALE, HEMI_INTENSITY_DEFAULT, SMALL_BOARD_BAND_THRESHOLD,
    THEATER_DEFAULT_ENV_FALLBACK, TILE_GAP, TILE_SIZE, ZOOM_STEP_FACTOR;
let addGroundingBlob, applyConditionMods, applyPsxShaderTweaks, baseDiscMatFor, buildTheaterCtx,
    drainTweens, flatTints, gradeColorLocal, hashSeed, interiorFloorTopAt, kilterFor, markDirty,
    mfDespawnGraceFor, mfMountGraceFor, mountLightProp, recipeFor, renderPartInto, scorchTintFor,
    sizeScaleFor, tileMaterialsFor, unitTint;
let tabletopCtxWholeObjectEnabled, tabletopCtxSetSpriteEmissiveTint;
let S = null;

export function tabletopInit(ctx){
  DEFAULT_FIGURE_ZOOM_STEPS = ctx.DEFAULT_FIGURE_ZOOM_STEPS;
  FIGURE_SCALE = ctx.FIGURE_SCALE;
  HEMI_INTENSITY_DEFAULT = ctx.HEMI_INTENSITY_DEFAULT;
  SMALL_BOARD_BAND_THRESHOLD = ctx.SMALL_BOARD_BAND_THRESHOLD;
  THEATER_DEFAULT_ENV_FALLBACK = ctx.THEATER_DEFAULT_ENV_FALLBACK;
  TILE_GAP = ctx.TILE_GAP;
  TILE_SIZE = ctx.TILE_SIZE;
  ZOOM_STEP_FACTOR = ctx.ZOOM_STEP_FACTOR;
  addGroundingBlob = ctx.addGroundingBlob;
  applyConditionMods = ctx.applyConditionMods;
  applyPsxShaderTweaks = ctx.applyPsxShaderTweaks;
  baseDiscMatFor = ctx.baseDiscMatFor;
  buildTheaterCtx = ctx.buildTheaterCtx;
  drainTweens = ctx.drainTweens;
  flatTints = ctx.flatTints;
  gradeColorLocal = ctx.gradeColorLocal;
  hashSeed = ctx.hashSeed;
  interiorFloorTopAt = ctx.interiorFloorTopAt;
  kilterFor = ctx.kilterFor;
  markDirty = ctx.markDirty;
  mfDespawnGraceFor = ctx.mfDespawnGraceFor;
  mfMountGraceFor = ctx.mfMountGraceFor;
  mountLightProp = ctx.mountLightProp;
  recipeFor = ctx.recipeFor;
  renderPartInto = ctx.renderPartInto;
  scorchTintFor = ctx.scorchTintFor;
  sizeScaleFor = ctx.sizeScaleFor;
  tileMaterialsFor = ctx.tileMaterialsFor;
  unitTint = ctx.unitTint;
  tabletopCtxWholeObjectEnabled = ctx.tabletopCtxWholeObjectEnabled;
  tabletopCtxSetSpriteEmissiveTint = ctx.tabletopCtxSetSpriteEmissiveTint;
  if(ctx.S) S = ctx.S;
}

/* the root re-points this at BOTH `S = createTheaterState()` sites (mount() and retire()) — the same
   SyncState law every B1-B8 module follows. */
export function tabletopSyncState(next){ S = next; }

/* REALM-PROPS-WIRING.md §3 — the prop-sizing render pass (PROVISIONAL mapping, §5 decision 2,
   Adam veto row): a realm prop's Size (theater-data.js's theaterBoardFrom now stamps `size` on any
   prop entry it resolved via realmPropsFor — see that file's own comment on `propEntry.size`) drives
   a scale multiplier on top of the model's own authored Medium-normal geometry, PLUS whether the
   prop's zone tile(s) count as occupied (a future placement pass' "can a unit stand here" query —
   this render pass only COMPUTES and EXPOSES the occupancy fact via S.propOccupiedZones, per §3's
   own scope: "occupancy marks the zone tile(s) unstandable in placement", no enforcement wired here).
     Small  -> 0.55x, decorative (units may share the tile)  -> no occupancy
     Medium -> 0.80x, shares                                  -> no occupancy
     Large  -> 1.00x, OCCUPIES (unit may not stand on it)     -> its own zone tile occupied
     Huge   -> 1.60x, spans toward a second tile               -> BOTH anchor tiles occupied
   A prop with no Size at all (every pre-unit generic-cover entry, and any realm prop whose size is
   somehow absent) reads as the Medium-normal default (1x scale, no occupancy) — byte-identical to
   pre-unit rendering for every caller that never threads a realm prop through (regression law: no
   realms -> no `size` field -> propFootprint(undefined) resolves the neutral default below). */
const PROP_FOOTPRINT_BY_SIZE = {
  Small:  { scale: 0.55, occupies: false, span: false },
  Medium: { scale: 0.80, occupies: false, span: false },
  Large:  { scale: 1.00, occupies: true,  span: false },
  Huge:   { scale: 1.60, occupies: true,  span: true }
};
const PROP_FOOTPRINT_DEFAULT = { scale: 1.0, occupies: false, span: false };
function propFootprint(size){
  return PROP_FOOTPRINT_BY_SIZE[size] || PROP_FOOTPRINT_DEFAULT;
}

/* §3 "spanning toward a second tile" — a Huge prop's own zone (band:lane) plus the NEAREST
   adjacent zone in the same grid (by tile-center distance from the prop's own world position),
   mirroring mountLightProp's own "nearest real tile" scan discipline (a plain nearest-distance
   walk, ties broken by array order, never Math.random — deterministic for the same board). Absent
   grid/tiles (a narrow test harness, a malformed board) degrades to JUST the prop's own zone,
   never throws. Returns an array of zone key strings (1 entry for every non-Huge/no-span prop, 2
   for a Huge prop that found a real neighbor). */
function propSpanZones(p, grid, tiles){
  const own = p.zone;
  if(!own) return [];
  const footprint = propFootprint(p.size);
  if(!footprint.span || !grid || !tiles || !tiles.length) return own ? [own] : [];
  let best = null, bestDist = Infinity;
  tiles.forEach(t => {
    if(t.zone === own) return;
    const d = (t.x - p.x) * (t.x - p.x) + (t.z - p.z) * (t.z - p.z);
    if(d < bestDist){ bestDist = d; best = t.zone; }
  });
  return best ? [own, best] : [own];
}


export function setBoard(data){
  if(!S.mounted || !data) return;
  // THEATER-NEXT §3.1/§3.2 — dirty-key skip: full-payload stringify (correct-by-construction; a
  // hand-rolled per-field key would re-derive what stringify already proves, and any missed field is
  // a stale-board bug). A skipped call must not drain tweens either — nothing changed.
  const dirtyKey = JSON.stringify(data);
  if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
  S.boardKey = dirtyKey;
  window.Theater.stats.boardBuilds++;
  // ENV-1B (2026-07-14): shadow-mapping stays ON for the tabletop/combat path too — see mount()'s own
  // ENV-1B comment above for the full provenance (§2's old "no shadow maps" line retired; Adam's
  // DESIGN.md ruling wants real cast shadows everywhere). Kept as an explicit restore here (not just
  // left at mount()'s own true default) for the SAME per-channel discipline the orthoCamera/hemiLight/
  // keyLight/fillLight restores just below already keep — one obvious place for a future channel-
  // specific divergence, exactly like every other toggle in this block.
  if(S.renderer) S.renderer.shadowMap.enabled = true;
  // GRAPHICS-ENGINE law 2b/VP0: the flat tabletop channel ALWAYS renders ortho, regardless of
  // INTERIOR_CAM_MODE — only setInteriorBoard ever reads that flag. Restoring S.orthoCamera here
  // mirrors the shadowMap/hemi restores just above/below (setInteriorBoard is the only place that
  // ever swaps S.camera to the perspective one, so this is the one place it swaps back).
  if(S.orthoCamera && S.camera !== S.orthoCamera){ S.camera = S.orthoCamera; placeCamera(); }
  // GR3: restore the shared hemisphere key to its authored default whenever a table board mounts —
  // the ONLY place it's ever dimmed is setInteriorBoard's study-rig-only `variant.rig===false` toggle
  // (no product path sets it), same "one place turns it down, this is the one place it turns back up"
  // discipline the shadowMap restore just above already keeps.
  if(S.hemiLight) S.hemiLight.intensity = HEMI_INTENSITY_DEFAULT;
  // BW2-4b item 1/2: restore the tabletop key/fill DirectionalLights (setInteriorBoard's BRIGHTNESS-LAW
  // dim is the only place they drop) and disable the interior camera-key shadow light — same "one place
  // turns it down, this is the one place it turns back up" discipline as the hemi restore above.
  if(S.keyLight) S.keyLight.intensity = 0.72;
  if(S.fillLight) S.fillLight.intensity = 0.22;
  if(S.interiorCameraKey){ S.interiorCameraKey.intensity = 0; S.interiorCameraKey.castShadow = false; }
  if(S.spriteCameraFill) S.spriteCameraFill.intensity = 0;
  tabletopCtxSetSpriteEmissiveTint(0xffffff); // BW2-4b item 1: the realm-grade sprite floor tint is interior-only
  // BEAUTY-WAVE-3 THE POST SUITE (BW3-2/3/6): the flat tabletop stays pass-free — tear the DoF/bloom/
  // grade passes off the composer here (setInteriorBoard is the only place they're added; this is the
  // one place they come off, mirroring the shadowMap/hemi/key restores just above). Direct render
  // resumes for the tabletop (renderTheaterFrame's empty-composer fallback).
  teardownPostSuite();
  // BEAUTY-WAVE-2.md BW2-1: the flat tabletop's camera fit carries NO standee-height correction term
  // (placeCamera's own screenHalfHeight addition) — only setInteriorBoard ever computes a nonzero
  // S.interiorFitMaxHeight, so this is the one place it resets back to the tabletop's permanent 0,
  // mirroring the orthoCamera/hemiLight restores just above.
  S.interiorFitMaxHeight = 0;
  // ENV-3b (docs/ENV-EXTERIOR-WAVE.md composition-fix wave) ruling 2: QF-B3's own S.interiorFitMaxHeight
  // correction (above) only ever measured MOUNTED FIGURES (setUnits' tabletopTallestTop) — a board's
  // own TILE geometry (a settlement's `kind:"building"` masses, stamped straight onto the tile column
  // mesh below, never a "unit") was invisible to that term entirely, so a building mass taller than any
  // standing figure had NO vertical headroom correction at all: the camera's ortho viewSize fit only
  // ever "knew" about the board's flat FOOTPRINT plus whatever figure happened to be tallest, so a
  // building sticking up well past that (even after ruling 1's height cap) got its top cropped and the
  // frame read as "standing inside the block maze" rather than framing the whole tray (the gate's
  // camera-crop failure). Tracked fresh every setBoard call (reset here, same convention as every other
  // per-call-reset field just above/below) and folded into the tile mount loop's own tallest-top read
  // (below); setUnits' own final S.interiorFitMaxHeight computation (that file's own QF-B3 block) takes
  // the MAX of this and its own tabletopTallestTop, so neither term can starve the other.
  S.boardTallestTileTop = 0;
  S.isInteriorBoard = false; // placeCamera's own tabletop-vs-interior half-floor split
  drainTweens(S); // A2: force-complete every live tween BEFORE tearing down the board/FX it may reference
  clearGroup(S.fxGroup); // A2: a new board must never inherit the old board's still-animating debris/glyphs
  S.lastBoard = data; // P1' WHOLE-OBJECT WIRING (§4 step 8): replay target for the async post-load re-render
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.interiorGroup); // DUNGEON-GRAPH.md U3: a combat board must not leave a prior interior tray's meshes on stage
  S.interiorLightsBuilt = null;
  S.interiorLightTargets = [];
  S.interiorLightingKey = null;
  S.interiorLightingPreservedThisBuild = false;
  // REALM-PROPS-WIRING.md §3: recomputed fresh every setBoard call (swept the same way tile/prop
  // groups are — a stale prior board's occupied zones never survive a re-render). Populated in the
  // prop-mount loop below, exposed for a future placement-pass consumer (never read/enforced by
  // this file itself — computing + exposing the fact is this unit's whole scope).
  S.propOccupiedZones = {};

  const tiles = data.tiles || [];
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
  tiles.forEach(t => {
    minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x);
    minZ = Math.min(minZ, t.z); maxZ = Math.max(maxZ, t.z);
  });
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  // G9 tune 6 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the off-center/undersized-looking board bug the
  // orchestrator's tune-5 fill-fraction fix didn't fully solve. Every mesh below (tiles here, units in
  // setUnits) is positioned at `coord - cx`/`coord - cz` — i.e. the geometry is ALREADY re-centered to
  // sit at world origin (0,0,0). boardCenter is the camera's lookAt() target (placeCamera) and MUST be
  // that same world origin, not the pre-shift centroid (cx,cz) — the old code aimed the camera at a
  // point 4-5 world units away from where the board actually renders, which reads as the board sitting
  // small and pushed toward one side (exactly what an off-target lookAt in an orthographic camera looks
  // like: the correctly-sized/centered box appears shifted because the "center of frame" isn't where
  // the geometry is). boardOrigin keeps the raw (cx,cz) for the tile/unit shift math below (unchanged).
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.boardOrigin = { cx, cz };
  // §3 camera fit: half-extent is the larger of the board's own half-width/half-depth (world units;
  // +1 covers the tile's own half-size at the footprint edge so the fit doesn't clip the outer row).
  // G9 camera-yaw fix: boardHalfX/boardHalfZ keep the PER-AXIS halves (same +1 pad) so placeCamera can
  // compute the actual yaw-rotated projected footprint instead of assuming the axis-aligned envelope.
  S.boardHalfX = (maxX - minX) / 2 + 1;
  S.boardHalfZ = (maxZ - minZ) / 2 + 1;
  S.boardHalfExtent = Math.max(S.boardHalfX, S.boardHalfZ);

  // T1.5 §1/§2: env threading — theaterBoardFrom (theater-data.js) stamps `env` on its return; this
  // is the ONLY place the GL layer learns which palette-driven void/fog tint to show (the tile tints
  // are already baked into `t.tint` by theater-data.js, so setBoard never re-derives palette colors
  // itself — it only reads the env label to pick the void/fog background, which theater-data.js has
  // no GL concept of).
  // T3 (§4 zoneToWorld): stash the grid this board was derived from so a later verb can resolve a
  // "band:lane" zone string to the SAME world coordinates a unit standing there would occupy —
  // mirrors theater-data.js's theaterZoneOrigin math (band*PATCH, lane*PATCH + patch-center), kept in
  // sync by reusing the identical THEATER_PATCH-equivalent constant this file already defines (TILE_SIZE
  // is 1 world unit per tile, and theater-data.js's patch is 3 tiles/zone — see zoneToWorld below).
  S.lastGrid = data.grid || null;
  // THEATER-ZOOM-SPREAD: small-board bias — a board at or under SMALL_BOARD_BAND_THRESHOLD bands reads
  // more distant than a bigger board at the SAME fit fraction (less geometry filling the same frame
  // edge-to-edge), so bias the default zoom one step IN for it. setBoard() is called on EVERY render
  // while a fight is live (theaterStageSync, src/world/render.js) — re-deriving the bias every single
  // call would stomp a player's manual Theater.zoom() adjustment on the very next render. Only
  // (re-)apply the bias the first time this board's own band-count SHAPE is seen (S.zoomBiasBandCount
  // tracks it): an actual board-size change (a new fight, or the rare mid-fight room-size change)
  // re-biases as intended, but a same-shape re-render (the common case) leaves S.zoomLevel exactly
  // where the player last set it via zoom(dir).
  const bandCount = (S.lastGrid && S.lastGrid.bandCount) || (S.lastGrid && S.lastGrid.bands && S.lastGrid.bands.length) || 0;
  if(S.zoomBiasBandCount !== bandCount){
    S.zoomBiasBandCount = bandCount;
    // U7-lite (Adam 2026-07-03: "battle minis should render at roughly DOUBLE their current screen
    // size, ~200-300px tall instead of ~100-150px"): bias the default zoom IN by DEFAULT_FIGURE_ZOOM_STEPS
    // for EVERY board (was: small boards only got a single step). A small board still gets one EXTRA
    // step on top (it reads more distant at the same fill). This uses the existing zoom-spread multiplier
    // machinery (no new camera code) and PERSISTS as a default the player can still zoom out from — a
    // fresh board re-derives it, a same-shape re-render leaves the player's own zoom() untouched. Known
    // nit (per the ruling): a tighter default can crowd 5 foes in one band; if that reads badly it is
    // flagged for follow-up, not fixed here.
    const smallBoardExtra = (bandCount > 0 && bandCount <= SMALL_BOARD_BAND_THRESHOLD) ? 1 : 0;
    S.zoomLevel = Math.pow(1 / ZOOM_STEP_FACTOR, DEFAULT_FIGURE_ZOOM_STEPS + smallBoardExtra);
  }
  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  // U2 (REVIEW-FIXES-0705.md): the board's STAMPED profile is the ONLY path — theater-data.js
  // resolves it from data/realms.js (the single source), with the tint already converted to a
  // NUMBER there. No local mirror, no local resolution: a non-realm room (or an older snapshot with
  // no renderProfile field at all) -> null, which gradeColorLocal treats as a byte-identical no-op
  // for every call below (figureMaterialFor/applyLightProfile/the void-tint grade). Mirror drift =
  // the lava-red bright-kingdom incident, 2026-07-05 — this is why the mirror is gone, not patched.
  S.realmProfile = data.renderProfile || null;

  // P1' WHOLE-OBJECT WIRING Unit B (docs/P1-WIRING.md §4 Unit B step 1): resolve + mount the rolled
  // profile's lighting prop BEFORE applyLightProfile runs, so S.lightPropAnchor is ready the moment
  // that function builds this same profile's point light a few lines below. Needs boardHalfX/Z (set
  // earlier in this function) + cx/cz (the tile-centering locals, also already computed above).
  mountLightProp(data, cx, cz);

  // BOARD LIGHTING: data.light.profile (theaterBoardFrom's own stamp — src/engine/theater-data.js)
  // picks the LIGHT_PROFILES entry; falls back to the dark baseline for a board with no light field at
  // all (an older snapshot / a preview fixture that hasn't set one — same graceful-degrade discipline
  // as the env fallback just above). Applied AFTER boardHalfX/boardHalfZ are set (earlier in this
  // function) so point-light positions resolve against the REAL board size, not the pre-board default.
  const lightProfileKey = (data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE;
  applyLightProfile(lightProfileKey);
  // ENV-1 (docs/ENV-EXTERIOR-WAVE.md): tabletop-only exterior differentiation (daylit/overcast/
  // moonlit) — see TABLETOP_EXTERIOR_LOOK's own header comment above applyLightProfile's definition
  // for why this is a SEPARATE post-pass rather than an edit to applyLightProfile/LIGHT_PROFILES
  // themselves. No-op for the protection-set profiles (dark/torchlit/etc).
  applyTabletopExteriorLook(lightProfileKey);
  // ENV-1c (docs/ENV-EXTERIOR-WAVE.md): the celestial-arc post-pass — data.clockMin is theater-data.js's
  // own stamp (src/engine/theater-data.js, threaded from src/world/render.js's theaterHereSourceFor/
  // theaterStageSync off w.clock.min, the SAME continuous minute dmDigest ships the DM seat). Runs
  // AFTER applyTabletopExteriorLook (further refines the SAME already-profile-scaled key/ambient) and
  // BEFORE applyTabletopShadowCasters (so the shadow pass configures against the key's FINAL,
  // arc-repositioned transform). No-op — byte-identical to pre-ENV-1c — whenever data.clockMin is
  // absent (a narrow harness, an older snapshot) or lightProfileKey isn't one of the 3 exterior moods.
  applyCelestialArc(lightProfileKey, data.clockMin != null ? data.clockMin : null);
  // ENV-1B: every tabletop board's own profile point(s) become shadow casters — see
  // applyTabletopShadowCasters' own header for the full provenance/scope note. Runs after
  // applyTabletopExteriorLook so the shadow-casting flag lands on the SAME already-scaled light
  // instances (order is otherwise inert — shadow config doesn't read intensity).
  applyTabletopShadowCasters();

  // T1.5 §1/§2 env threading, now ALSO profile-threaded (ENV-1) and clock-threaded (ENV-1c):
  // voidTintForTabletop reads the celestial arc's own void keyframe first (S.celestialVoidTint,
  // stamped by applyCelestialArc just above) when a clock is threaded, else falls back to ENV-1's
  // static per-profile wash (a light sky-tone for daylit, muted grey for overcast, near-dark cool
  // blue for moonlit), and only falls back further to the plain env-keyed void for the protection-set
  // profiles — matching this unit's "byte-identical dark/torchlit" guarantee. Computed AFTER
  // applyLightProfile/applyTabletopExteriorLook/applyCelestialArc (was before, pre-ENV-1) so
  // S.lightProfileKey/S.celestialVoidTint are current — mountLightProp above doesn't read
  // scene.background, so this reordering is otherwise inert.
  const voidTint = gradeColorLocal(voidTintForTabletop(env, lightProfileKey, data.clockMin != null ? data.clockMin : null), S.realmProfile);
  if(S.scene){
    S.scene.background = new THREE.Color(voidTint);
    if(S.scene.fog) S.scene.fog.color = new THREE.Color(voidTint);
  }
  if(S.renderer) S.renderer.setClearColor(voidTint, 1);

  const topColorCache = {};
  const sideColorCache = {};
  const colorFor = (tint, factor, cache) => {
    const key = tint + ":" + factor;
    if(!cache[key]){
      const c = new THREE.Color(tint);
      c.multiplyScalar(factor);
      cache[key] = c;
    }
    return cache[key];
  };

  tiles.forEach(t => {
    const h = Math.max(0.15, 0.5 + (t.h || 0));
    const geo = new THREE.BoxGeometry(TILE_SIZE - TILE_GAP, h, TILE_SIZE - TILE_GAP);
    // §1 rule 2: top != side — strongly contrasted flat colors on the same column, now via
    // tileMaterialsFor so a matching loaded texture (§4) tints in instead of the flat top color.
    // BoxGeometry's material groups are [+x,-x,+y,-y,+z,-z]; index 2 is +y (the top face).
    const materials = tileMaterialsFor(t, topColorCache, sideColorCache, colorFor);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(t.x - cx, h / 2 - 0.5, t.z - cz);
    // ENV-3b ruling 2: this column's own real world-Y top (mesh center + half-height) — see
    // S.boardTallestTileTop's own header comment (above, this function's setup block) for why a tall
    // TILE mass (a settlement building) needs the same camera-fit visibility a mounted figure already
    // gets via tabletopTallestTop (setUnits). A flat/unelevated tile's top sits at 0, a no-op against
    // the reset-to-0 default.
    const tileTop = h - 0.5;
    if(tileTop > S.boardTallestTileTop) S.boardTallestTileTop = tileTop;
    // ENV-1B: the tabletop's own ground plane — receives a figure/prop's cast shadow, mirroring the
    // interior room-shell FLOOR mesh's own receiveShadow=true (never castShadow — a floor casting onto
    // itself/neighbors is not a meaningful contact-darkness read, same "shadows land on the GROUND"
    // convention this unit follows throughout).
    mesh.receiveShadow = true;
    S.tileGroup.add(mesh);
  });

  (data.props || []).forEach(p => {
    // MODEL-GRAMMAR G4: a prop entry carrying `part` (theater-data.js's theaterPropForText keyword
    // derivation off the segment's feature/hazard text) renders the ACTUAL named part — a cart reads
    // as a cart, a shrine as a shrine-block — via the SAME renderPartInto composition engine G1/G2
    // already use for figures. `partParams` rides straight through to the part function (a caller-
    // seeded params object, never randomness inside the part itself, per §1). No `part` (no keyword
    // hit for this zone's text, or a legacy caller that never threaded feature text at all) falls
    // straight through to the exact pre-G4 generic flat prop-box, byte-identical to before (§9
    // Decision 6's "never worse than today," reapplied to props — this fallback path is untouched).
    const px = p.x - cx, pz = p.z - cz;
    // GROUNDING SHADOW (§3): props had NONE before this unit — "props currently may have none — add
    // them." One shared blob per prop entry, added to S.propGroup (swept by the SAME clearGroup(S.
    // propGroup) call at the top of setBoard, so it never leaks across re-renders like the unit-side
    // blobs above don't). A fixed mid-size radius (0.42) rather than a per-part-derived size — the part
    // library's own footprints vary too much to size against cheaply here, and a slightly-generous
    // fixed blob under every prop still reads as "this object touches the ground here" without needing
    // per-part geometry introspection.
    addGroundingBlob(S.propGroup, px, pz, -0.495, 0.42);

    // ENV-2 (docs/ENV-EXTERIOR-WAVE.md) — a biome-scatter dressing entry (theaterBoardBuild's
    // env2BiomeScatterFor, src/engine/theater-data.js — carries `.slug`/`.cardKind`, never `.part`/
    // `.model`) renders as a camera-facing billboard card, the SAME buildDressingCard the interior
    // dressing pipeline already uses (assets/dressing/<slug>.png, or its placeholder card when the
    // art hasn't landed — dressingTextureFor's own graceful degrade). Checked FIRST, ahead of the
    // whole-object/part chain below: these entries carry no `.part`/`.model` to fall through onto,
    // so without this branch every scattered flora/rock/tree rendered as the SAME undifferentiated
    // flat prop-box the true no-keyword-hit fallback (bottom of this loop) uses — never distinguishing
    // a Forest fern from a Desert dune. `updateSpriteBillboardYaw` (this file) is extended alongside
    // this unit to ALSO camera-face S.propGroup's own sprite-tagged children (it previously only
    // walked S.unitGroup/S.interiorGroup, since no prop ever carried userData.sprite before now).
    if(p.slug && !p.part && !p.model){
      const g = buildDressingCard(p);
      g.position.set(px, 0, pz);
      S.propGroup.add(g);
      return;
    }

    // REALM-PROPS-WIRING.md §3: a realm prop entry carries its own Size (theater-data.js stamps
    // `p.size` only when theaterRealmPropForText resolved this zone's prop — every other prop entry,
    // including every pre-unit generic-cover entry, has no `size` at all). propFootprint(undefined)
    // resolves the neutral 1x/no-occupy default, so a non-realm-prop render path is byte-identical to
    // before this unit (regression law). occupied zone(s) are recorded on S.propOccupiedZones for a
    // future placement-pass consumer — this pass computes + exposes the fact, never enforces it.
    const footprint = propFootprint(p.size);
    if(footprint.occupies){
      propSpanZones(p, S.lastGrid, tiles).forEach(zk => { S.propOccupiedZones[zk] = true; });
    }

    // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 7): before the Parts.PARTS cuboid lookup,
    // try the whole-object registry keyed "prop:<part>". `pillar-broken` is shared by TWO distinct
    // rules (standing-stone: intact param; the candelabra/brazier retarget now uses its own
    // "candelabra" part string instead — see theater-data.js's own comment on that rule) — the
    // intact/broken variant routes to two DIFFERENT registry entries (prop:pillar-intact vs
    // prop:pillar-broken) off partParams.intact. Miss (gate off, no registry entry, builder not
    // loaded, geometry build throws) falls straight through to the EXISTING Parts.PARTS/generic-box
    // chain below — never a blank zone (§7.1 mutation M5's own contract).
    // TABLETOP-UNITS.md §U3: pieceKind:"prop" — a resolution miss here resolves to "blank:prop"
    // (the plain block) instead of null, so the Parts.PARTS/generic-box chain below is reached only
    // on an actual load failure (gate off / builder not loaded / geometry throws), never a bare miss.
    if(tabletopCtxWholeObjectEnabled() && (p.model || p.part)){
      // REALM-PROPS-WIRING fix (2026-07-08): a bespoke realm prop carries its own full registry key in
      // `p.model` ("prop:sentry-turret-mount" etc.) and prefers it — this is what revives the 8 net-new
      // realm-prop models that were dead when this resolver keyed only off `p.part` (they have no part).
      // Everything else keeps the exact part-derived key: pillar-broken's intact/broken split, else
      // "prop:"+part. A `model` miss (unloaded builder / geometry throw) still falls through to the
      // Parts.PARTS/generic-box chain below, same degrade as a part miss.
      const wPropKey = p.model
        ? p.model
        : ((p.part === "pillar-broken")
          ? ((p.partParams && p.partParams.intact) ? "prop:pillar-intact" : "prop:pillar-broken")
          : "prop:" + p.part);
      const wEntry = resolveWholeObject(wPropKey, "prop");
      if(wEntry && typeof wEntry.build === "function"){
        // QF-B1: an authored `partParams.retint` (data/realm-props.js — a realm prop reusing a
        // whole-object model whose baked palette doesn't match, e.g. the web-mass shape standing in
        // for "Alley Fire Escape") recolors the cached geometry's baked vertex colors toward that hex
        // (own cache-key suffix inside wholeObjectGeometryFor — never touches the original-palette
        // geometry every OTHER reuse of this same key still wants, e.g. Cobweb Mass's genuine web read).
        const wRetint = (p.partParams && typeof p.partParams.retint === "number") ? p.partParams.retint : null;
        const wGeo = wholeObjectGeometryFor(wPropKey, false, "prop", wRetint);
        if(wGeo){
          const wMats = wholeObjectMaterialsFor(wEntry);
          const wg = new THREE.Group();
          const wMesh = new THREE.Mesh(wGeo, wMats);
          // ENV-1B: a whole-object prop is a solid volumetric body (never a flat billboard cutout) —
          // both cast and receive, mirroring the interior room-shell furniture/wall/door convention
          // (theater-boot.js's own solid-object pattern: castShadow=true, receiveShadow=true) rather
          // than the sprite/dressing-card "cast-only" convention reserved for flat alpha-cutout art.
          wMesh.castShadow = true;
          wMesh.receiveShadow = true;
          wg.add(wMesh);
          wg.scale.setScalar(WHOLE_OBJECT_SCALE);
          const wScale = p.partParams && p.partParams.scale;
          if(wScale && isFinite(wScale) && wScale > 0) wg.scale.multiplyScalar(wScale);
          // REALM-PROPS-WIRING.md §3: the size->footprint scale multiplies ON TOP of the model's own
          // authored Medium-normal geometry (props are authored at Medium-normal per §3's own closing
          // line) — applied AFTER any partParams.scale so a realm prop's Size is the outermost, most
          // legible scale signal, never silently overridden by an unrelated params.scale.
          if(footprint.scale !== 1.0) wg.scale.multiplyScalar(footprint.scale);
          wg.position.set(px, 0, pz);
          S.propGroup.add(wg);
          return;
        }
      }
    }

    const partFn = p.part && Parts.PARTS[p.part];
    if(partFn){
      const g = new THREE.Group();
      const propTint = flatTints(0x6b5638);
      renderPartInto(g, partFn, p.partParams || {}, propTint, { x: 0, y: 0, z: 0 });
      // ENV-1B: stamp cast+receive on JUST this prop's own freshly-built boxes (a traverse scoped to
      // `g`, never a change to addBox/renderPartInto themselves — those are SHARED with figure bodies
      // on both channels, and touching them there would also change the interior channel's own
      // pieces, breaking byte-stability for no reason). Same solid-object convention as the whole-
      // object prop mesh just above.
      g.traverse(n => { if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
      // BUG REPAIR (found by the MODEL-QA rig's scene captures, 2026-07-03): theater-data.js's own
      // THEATER_PROP_KEYWORD_RULES emit `params.scale` ({scale:0.6} candelabra, {scale:1.8} colossal
      // statue, {scale:0.4} grate-rubble, ...) but NO part function reads a scale param — the value
      // was silently dropped, so every scaled rule mis-rendered at 1.0 (unseen until now because the
      // G4 browser gate ran on dev/theater-preview.html, which was syntax-dead at the time). Honor it
      // here at the GROUP level (one multiply, all of the part's boxes together — the exact pattern
      // SIZE_SCALE already uses for figures). Rule-less props (no scale in partParams) are untouched.
      const pScale = p.partParams && p.partParams.scale;
      if(pScale && isFinite(pScale) && pScale > 0) g.scale.setScalar(pScale);
      // REALM-PROPS-WIRING.md §3: same outermost-scale discipline as the whole-object branch above —
      // multiplies AFTER partParams.scale, no-op (x1) for every non-realm prop.
      if(footprint.scale !== 1.0) g.scale.multiplyScalar(footprint.scale);
      g.position.set(px, 0, pz);
      S.propGroup.add(g);
      return;
    }
    const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
    const propTex = S.textures.prop;
    // REALM-RENDER-STYLE.md §3/§4: the absolute flat-box prop fallback (no Parts.PARTS entry, no
    // whole-object registry hit) is the one prop color that never routes through figureMaterialFor —
    // graded here directly so every prop tier (whole-object / part / flat-box) shares the same render
    // grade. gradeColorLocal(0x6b5638, null) is a byte-identical passthrough on a non-realm room.
    const propColor = gradeColorLocal(0x6b5638, S.realmProfile);
    const mat = applyPsxShaderTweaks((propTex && propTex !== "pending")
      ? new THREE.MeshLambertMaterial({ map: propTex, color: propColor })
      : new THREE.MeshLambertMaterial({ color: propColor }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, 0.45, pz);
    // ENV-1B: same solid-object cast+receive convention as the whole-object/part prop tiers above —
    // the absolute flat-box fallback is still a real box volume, not a billboard cutout.
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // REALM-PROPS-WIRING.md §3: same scale discipline for the absolute flat-box fallback tier.
    if(footprint.scale !== 1.0) mesh.scale.multiplyScalar(footprint.scale);
    S.propGroup.add(mesh);
  });

  // ENV-3b ruling 2: was a bare placeCamera() call, fitting against whatever S.interiorFitMaxHeight
  // happened to still hold (0, this function's own reset above, on the FIRST call of a render pass —
  // or a stale figure-height reading left over from setUnits on a LATER async-replay-only call). The
  // shared combiner (this function's own header comment, above) folds in S.boardTallestTileTop (just
  // measured by the tile loop above) alongside whatever figure height is still on record, so a
  // building's own height is never dropped from the fit — including on a setBoard-only replay.
  refitTabletopHeightFit();
  // ENV-3 (docs/ENV-EXTERIOR-WAVE.md) ruling 5 — SYNC-FACE ON REBUILD: every fresh THREE.Group this
  // function just built (the tile group carries no billboards, but S.propGroup's dressing cards do —
  // buildDressingCard, above, tags each with userData.sprite=true) starts at rotation.y=0 by
  // construction; before this fix, the ONLY place that ever corrected it was updateSpriteBillboardYaw's
  // OWN scan inside scheduleRender's requestAnimationFrame callback — a race that depends on a paint
  // tick actually landing before anything reads the scene. That race is lost whenever this exact
  // function re-runs ASYNCHRONOUSLY off dressingTextureFor's own real-art-arrival replay (a few
  // hundred lines up: "S.boardKey = null; setBoard(S.lastBoard);") — a REAL assets/dressing/<slug>.png
  // landing for even ONE prop rebuilds the WHOLE propGroup from scratch (clearGroup, above), so every
  // OTHER card (including permanently-placeholder NPC/market cards whose slug never resolves) goes
  // back to its fresh, unfaced rotation.y=0 too — found live: the ENV-3 town card capture, a settlement
  // NPC placeholder card rendering with visibly MIRRORED text (a DoubleSide-textured plane viewed from
  // its own back reads as a horizontal mirror of its front). Calling the SAME face pass here,
  // synchronously, the instant this rebuild finishes, makes "freshly built cards face the camera" true
  // by construction rather than by timing luck — the next real rAF tick's own call is now a harmless,
  // idempotent no-op (the camera yaw hasn't changed) rather than the only place this ever happened.
  updateSpriteBillboardYaw();
  markDirty();
}

/* DEAD-STATE (2026-07-03, Adam's ruling): desaturate every mesh in a figure's group toward grayscale —
   the SAME cheap no-shader luminance-preserving trick vDown (theater-verbs.js) already animates via a
   tween; this is the static/terminal application for a CORPSE that setUnits renders directly on every
   refresh (no tween needed — a re-mounted/re-rendered corpse must read gray immediately, not replay an
   animation). `amount` in [0,1] lets the down-pose (full desaturate, 1.0) share this helper with any
   future partial-desaturate need without duplicating the RGB math. */
function desaturateGroup(group, amount){
  group.traverse(n => {
    if(!n.material || !n.material.color) return;
    const c = n.material.color;
    const gray = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
    c.setRGB(
      c.r + (gray - c.r) * amount,
      c.g + (gray - c.g) * amount,
      c.b + (gray - c.b) * amount
    );
  });
}


export function setUnits(data){
  if(!S.mounted || !data) return;
  // THEATER-NEXT §3.1/§3.2 — same dirty-key skip as setBoard, against its own key.
  const dirtyKey = JSON.stringify(data);
  if(dirtyKey === S.unitsKey){ window.Theater.stats.unitSkips++; return; }
  S.unitsKey = dirtyKey;
  window.Theater.stats.unitBuilds++;
  drainTweens(S); // A2: force-complete every live tween BEFORE clearGroup disposes the units they close over
  S.lastUnits = data; // P1' WHOLE-OBJECT WIRING (§4 step 8): replay target for the async post-load re-render

  // BEAUTY-WAVE-4.md MF-2 item 2 (DESPAWN GRACE): diff the PREVIOUSLY-known unit ids against this
  // render's new set BEFORE clearGroup disposes anything — "defeat removal where corpses don't
  // persist... board changes". A `down` unit is NOT a despawn (it persists + re-renders every frame
  // per the DEAD-STATE convention); only an id that's genuinely ABSENT from this render counts. The
  // despawning figure is pulled OUT of S.unitGroup into a transient S.despawnGroup so clearGroup(
  // S.unitGroup) just below naturally skips it (it's no longer a child by the time that runs) — no
  // clearGroup change needed. wasKnownUnitIds is captured here (before S.knownUnitIds is overwritten
  // at this function's end) so the MOUNT half below can tell a genuinely NEW id from a re-render.
  const wasKnownUnitIds = S.knownUnitIds || new Set();
  const newUnitIds = new Set((data.units || []).filter((u) => !u.obliterated).map((u) => String(u.id)));
  wasKnownUnitIds.forEach(function(id){
    if(newUnitIds.has(id)) return;
    let fig = null;
    for(let i = 0; i < S.unitGroup.children.length; i++){
      const child = S.unitGroup.children[i];
      if(child.userData && String(child.userData.unitId) === id){ fig = child; break; }
    }
    if(!fig) return; // already gone (e.g. a full retire() beat us here) — nothing to grace
    S.unitGroup.remove(fig);
    if(!S.despawnGroup){ S.despawnGroup = new THREE.Group(); if(S.scene) S.scene.add(S.despawnGroup); }
    S.despawnGroup.add(fig);
    mfDespawnGraceFor(buildTheaterCtx(), fig, function(){
      if(S.despawnGroup) S.despawnGroup.remove(fig);
      disposeGroupChild(fig); // THE BASE LIFTS LAST — this runs strictly after the 200ms art fade completes
    });
  });

  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  // DEAD-STATE: obliteration markers ride in S.propGroup (swept by setBoard's clearGroup/retire like
  // every other prop) — and a stale marker from a since-cleared unit must not survive a UNIT-only
  // refresh either, so setUnits sweeps its own markers here.
  // BUG REPAIR (found by the MODEL-QA rig's scene captures, 2026-07-03): this sweep used to be a
  // wholesale clearGroup(S.propGroup) — which ALSO erased every BOARD prop (cover columns, walk-
  // feature props + their grounding blobs) that setBoard had just built. The game always calls
  // setBoard then setUnits on every render, so NO board prop has ever survived to the screen since
  // the DEAD-STATE pass added that line — invisible in the live game and every fixture alike (unseen
  // until now because dev/theater-preview.html, the prop visual gate, was syntax-dead at the time).
  // Fix: remove/dispose ONLY setUnits' own scorch markers (tagged userData.scorchMarker at creation
  // below), leaving the board's props standing. Dispose per clearGroup's own discipline; the shared
  // per-call scorchGeo/scorchMat tolerate repeat dispose() (idempotent in three).
  for(let i = S.propGroup ? S.propGroup.children.length - 1 : -1; i >= 0; i--){
    const child = S.propGroup.children[i];
    if(child.userData && child.userData.scorchMarker){
      S.propGroup.remove(child);
      if(child.geometry) child.geometry.dispose();
      if(child.material){
        if(Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
  }

  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  // BEAUTY-WAVE.md VP1b: the SAME "S.lastBoard.kind === interior3d" discriminator setInteriorBoard/
  // setBoard already establish (setBoard's flat tabletop board carries no `kind` field at all) — the
  // FLAT TABLETOP combat path (interiorMode === false here) is untouched, byte-identical to before
  // this unit (verify-theater-sprites 12/12 is the regression gate for that claim).
  const interiorMode = !!(S.lastBoard && S.lastBoard.kind === "interior3d");
  const wallHeightCap = (interiorMode && typeof S.lastBoard.wallHeightBase === "number" && S.lastBoard.wallHeightBase > 0)
    ? S.lastBoard.wallHeightBase * 0.95
    : null;
  // G5 ROUND-1 (ruling 2): the base disc geometry is now sized per-UNIT (size-scaled — see the
  // baseDiscGeoFor cache below) rather than one shared geometry at a fixed FIGURE_SCALE radius, since
  // a Small goblin and a Huge ogre now render at different effective scales (ruling 3's SIZE_SCALE)
  // and their base discs should read proportionate to their own figure, not a one-size shadow blob.
  const baseDiscGeoCache = {};
  // P1' WHOLE-OBJECT WIRING (§4 step 6): the underlying radius-keyed cache generalizes to ANY radius
  // (the whole-object path's D2 formula, entry.discR * WHOLE_OBJECT_SCALE * 1.18 — bumped from 1.12
  // by the 2026-07-04 capture-gate follow-up, "bolder gold rim" — is not a plain
  // 0.34*figScale) — baseDiscGeoForRadius is that generalized helper; baseDiscGeoFor(figScale) below
  // is kept as the ORIGINAL cuboid-path entry point (byte-identical call-site name/signature/radius
  // formula this file has always used) so it stays the single source both paths share underneath,
  // without changing the cuboid path's own literal call convention (verify-model-grammar.mjs's own
  // text-scan checks for the exact `baseDiscGeoFor(figScale)` call site).
  function baseDiscGeoForRadius(radius){
    const key = radius.toFixed(3);
    if(!baseDiscGeoCache[key]) baseDiscGeoCache[key] = new THREE.CircleGeometry(radius, 16);
    return baseDiscGeoCache[key];
  }
  function baseDiscGeoFor(figScale){
    return baseDiscGeoForRadius(0.34 * figScale);
  }
  // DEAD-STATE: a corpse's base disc darkens to near-black — a distinct material (never a mutation
  // of the shared kind mats) so the corpse read persists across every setUnits refresh.
  const corpseDiscMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.9, depthWrite: false });
  // DEAD-STATE: the obliteration tile marker — a thin scorch-tinted quad flush with the floor,
  // reusing the per-env scorch tint; shared per setUnits call (one env per fight).
  const scorchGeo = new THREE.CircleGeometry(0.42 * FIGURE_SCALE, 10);
  const scorchMat = applyPsxShaderTweaks(new THREE.MeshBasicMaterial({
    color: scorchTintFor(S.env), transparent: true, opacity: 0.88, depthWrite: false
  }));

  // QF-B3 (TABLETOP_CAMERA_HEADROOM's own header comment, above): the tallest mounted figure's REAL
  // rendered top (world-space y, floor at 0), measured after this loop below. Only tracked for the
  // flat tabletop channel (`!S.isInteriorBoard`) — the interior channel already has its own dedicated
  // computation (interiorFitMaxHeightFor) and must never be stomped by this one.
  let tabletopTallestTop = 0;

  (data.units || []).forEach(u => {
    // BW2-2b item 4 (THE KILTER): `let`, not `const` — an interior-true-scale standee nudges these by
    // a tiny seeded offset below (kilterFor); the flat tabletop path (interiorSpriteFig false) never
    // reassigns them, so it stays byte-identical to before this unit.
    let x = u.x - cx, z = u.z - cz;

    // OBLITERATION (the exception per Adam's ruling): no figure, no shadow — a burst+sink FX plays via
    // the `obliterate` stage_fx verb (src/ui/theater-verbs.js) at the moment the flag is set; THIS
    // function only owns the RESTING state a re-render lands on afterward — nothing standing, a single
    // scorch-tinted tile marker left where the unit stood. Checked BEFORE the down branch below since
    // an obliterated unit is also down by construction (HP<=0) but must never ALSO render as a corpse.
    if(u.obliterated){
      // BUGFIX (found live in this unit's own browser check): a flat floor tile's TOP surface sits at
      // world y=0 (setBoard's own h/2-0.5 math — a flat tile's box spans y=[-0.5,0], center at -0.25,
      // half-height 0.25 -> top face at 0). The shadow discs below sit at y=-0.49 (well UNDER the tile
      // top, working only because they're never meant to be seen from above the opaque tile — they
      // read through anti-aliased edges/via the renderer's blending order in practice). A scorch quad
      // needs to be VISIBLE from the default camera angle looking down at the board, so it must sit
      // ABOVE the tile top (y=0), not buried inside the opaque tile geometry the way the old y=-0.485
      // placement (copy-pasted from the shadow convention without checking it against a floor tile
      // that isn't elevated/sunk) silently was — that placement rendered nothing, occluded by the
      // tile's own solid top face. 0.011 clears z-fighting against the flat-floor case while still
      // reading as "flush with the floor" at this camera's oblique angle.
      const scorch = new THREE.Mesh(scorchGeo, scorchMat);
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.set(x, 0.011, z);
      scorch.userData.scorchMarker = true; // BUG REPAIR tag — see the selective sweep at the top of setUnits
      S.propGroup.add(scorch);
      return;
    }

    const seed = hashSeed(u.id);
    const tint = unitTint(u.kind);
    // PASS 2: theaterUnitsFrom (src/engine/theater-data.js) now stamps `silhouette` (PC/ally class
    // read: martial/ranger/caster/cleric, undefined for foes) and `weapon` (a shape key every unit
    // carries — class-derived for PC/allies, name/action-keyword-derived for foes, "none" when no
    // weapon reads) onto each unit; figureFor threads both into the archetype builder so class
    // silhouettes + weapon slabs compose without this file re-deriving either.
    // MODEL-GRAMMAR G2: units may ALSO carry `recipeSlug` (theaterUnitsFrom stamps a foe's
    // resolved bestiary statId/slug when known) — figureFor resolves it through recipeFor
    // (overrides-then-generated-then-null) BEFORE falling back to the archetype builder, so a
    // recipe-driven figure wins whenever one exists for this unit's slug.
    // MODEL-GRAMMAR G3 §2: `pcRecipe` (PC/ally loadout-mirror units only) outranks both — see
    // figureFor's own precedence-chain comment.
    // P1' WHOLE-OBJECT WIRING (§2.4): `className` (lowercased pcRef.class/a.class, pc/ally only,
    // stamped by theater-data.js's theaterUnitsFrom) resolves the roster-supersession key BEFORE
    // any of the above — see figureFor's own header comment for the full precedence order.
    let figure = figureFor(u.archetype, seed, tint, u.silhouette, u.weapon, u.recipeSlug, u.pcRecipe, u.kind, u.className, null, interiorMode, wallHeightCap);
    // x/z already computed at the top of this forEach body (the obliterated branch above returns before
    // here, so this is the same block scope) — reuse them; a second `const x/z` here is a duplicate
    // declaration (a hard SyntaxError that stopped this whole module from parsing).
    // BEAUTY-WAVE.md VP1b, BW2-2-corrected: an interior-true-scale sprite figure's floor-CONTACT line
    // (not y=0, the tabletop tile-top convention) must sit on THIS cell's own real floor top plus its
    // own plinth base (interiorFloorTopAt/interiorStandeeContactY — the derived FLOOR CONTACT LAW,
    // this file's own header comment a few thousand lines up) — replaces the pre-BW2-2 hardcoded
    // "-0.5 - floorFrac*height" that assumed every floor tile sat exactly at y=-0.5 (it doesn't; the
    // measured burial this caused is what BW2-2 fixes). interiorBuildPieces (non-combat pieces) applies
    // the SAME law.
    const interiorSpriteFig = !!(figure.userData && figure.userData.interiorTrueScale);
    let posY = 0;
    if(interiorSpriteFig){
      const floorTop = interiorFloorTopAt(S.interiorFloorTopMap, u.x, u.z);
      const contactY = interiorStandeeContactY(floorTop);
      posY = contactY - (figure.userData.interiorFloorFrac || 0) * figure.userData.interiorHeight;
      // BW2-2b item 4 (THE KILTER): nudge x/z by a tiny seeded offset BEFORE the base/pool/figure
      // placement below reads them, so base+sprite+pool all pick up the SAME offset consistently
      // (never a shadow mismatched from its own standee). Keyed off this unit's own stable id — the
      // combat-path counterpart to interiorBuildPieces' slug+cell identity (see kilterFor's own header
      // for the walkId/determinism rationale).
      const kilter = kilterFor("unit:" + u.id);
      x += kilter.dx; z += kilter.dz;
      figure.userData.kilterYawDeg = kilter.yawDeg; // read every frame by updateSpriteBillboardYaw's face()
      // BW2-2 STANDEE BASES: a plinth cylinder under this combat standee too (spec: "piece + combat
      // unit"), same construction/child-of-figure convention interiorBuildPieces uses (buildInteriorBase's
      // own header explains why this makes fall-death's tip-as-one-group behavior free). Radius off
      // the sprite's own rendered width (figureFor's interior branch stamps interiorWidth alongside
      // interiorHeight specifically for this — see that branch's own comment).
      const support = interiorStandeeSupportMetrics(
        figure.userData.interiorWidth || figure.userData.interiorHeight || 1,
        u.size,
        u.tacticalSpanCells
      );
      const baseMesh = buildInteriorBase(
        support.width,
        support.depth,
        S.lastBoard && S.lastBoard.tileKit && S.lastBoard.tileKit.trimColor
      );
      figure.add(baseMesh);
      figure.userData.interiorBaseRadius = support.width * 0.5;
      figure.userData.interiorBaseWidth = support.width;
      figure.userData.interiorBaseDepth = support.depth;
      figure.userData.standeeCollisionNudgeX = 0;
      figure.userData.standeeCollisionNudgeZ = 0;
      figure.userData.standeeCollisionRelocated = false;
      figure.userData.tacticalSpanCells = support.tacticalSpanCells;
      figure.userData.stairTreadDepth = support.treadDepth;
      figure.userData.stairFit = support.stairFit;
      figure.userData.standeeBaseMesh = baseMesh; // setActingUnit's BW2-2b glow-toggle target
      // BW2-2: this standee's own soft contact pool (VP7's convention, extended to combat units — the
      // pre-BW2-2 tabletop hostility-disc/groundingBlob pair further below is UNTOUCHED and stays
      // buried under the true floor exactly as it already was, harmless/invisible; this pool is the
      // one that actually reads under an interior standee's base).
      const contactBlob = addInteriorContactBlob(
        S.shadowGroup, x, z, support.width, floorTop, support.depth
      );
      figure.userData.contactBlobMesh = contactBlob;
    }
    figure.position.set(x, posY, z);
    // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 6, §3-D1/D2/D8): a whole-object figure
    // (tagged by figureFor) takes a COMPLETELY SEPARATE scale/disc path from the cuboid-recipe math
    // below — D1: applying FIGURE_SCALE x sizeScaleFor on top of the module's own AUTHORED ABSOLUTE
    // size would double-scale, so it scales by WHOLE_OBJECT_SCALE alone, sizeScaleFor is NEVER
    // applied on this path. D2: disc radius is entry.discR x WHOLE_OBJECT_SCALE x 1.18 (bumped from
    // 1.12 — 2026-07-04 capture-gate follow-up, "bolder gold rim" — a touch wider still than the
    // figure's own footprint so the kind-tint reads as a rim ring around the baked neutral
    // disc, not painted over it). D8: a down/corpse whole-object unit swaps to the CACHED GRAY
    // geometry variant (never desaturateGroup, which would mutate the SHARED cached material used by
    // every other standing figure of the same key) — same topple rotation/y-lift the cuboid path uses.
    const isWholeObject = !!(figure.userData && figure.userData.wholeObject);
    let figScale;
    if(isWholeObject){
      figScale = WHOLE_OBJECT_SCALE;
      if(u.down){
        const grayGeo = wholeObjectGeometryFor(figure.userData.wholeObjectKey, true);
        if(grayGeo){
          // swap in the gray-variant mesh (same material array — vertexColors carries the desaturated
          // buffer, no material mutation needed) in place of the standing mesh this figure group holds.
          const mats = figure.children[0] && figure.children[0].material;
          figure.clear();
          figure.add(new THREE.Mesh(grayGeo, mats));
        }
      }
    } else if(interiorSpriteFig){
      // BEAUTY-WAVE.md VP1b: interiorSpriteBillboard already baked the FINAL true-scale world height
      // into the plane geometry itself (HUMAN_TRUE_HEIGHT x scaleTrue, wall-capped) — the same
      // "authored absolute size, scale by 1 alone" discipline the whole-object path documents just
      // above. Re-applying FIGURE_SCALE x sizeScaleFor here (the tabletop combat convention below)
      // would double-scale a plane that is already sized in world units, reproducing the kaiju bug
      // one line later — this is the fix.
      figScale = 1;
    } else {
      // G5 ROUND-1 (ruling 3): recipe.size (a bestiary/pcRecipe field carried since MODEL-GRAMMAR G2 but
      // never read until now) scales the WHOLE figure group on top of FIGURE_SCALE — one multiply, so a
      // weapon module (already a child of this same group, attached via renderPartInto's offset math)
      // scales together with the body it's gripped by, never independently. The archetype-builder
      // fallback (no recipe at all) has no size field to read — stays at plain FIGURE_SCALE, matching
      // §9 Decision 6 ("never worse than today").
      const effRecipe = u.pcRecipe || recipeFor(u.recipeSlug);
      figScale = FIGURE_SCALE * sizeScaleFor(effRecipe && effRecipe.size);
    }
    figure.scale.setScalar(figScale); // §3 G9 tune: "figure scale ~1.5x current relative to tiles" x size
    if(u.down){
      figure.rotation.z = Math.PI / 2;
      figure.position.y += 0.12 * figScale; // matches the figure's own effective (size-scaled) height
      // DEAD-STATE: desaturate the WHOLE toppled figure on every render (a setUnits refresh after
      // the fight must still read as a corpse with no live tween in flight). Whole-object figures
      // already swapped to their cached gray geometry variant above — desaturateGroup would try to
      // mutate that geometry's SHARED material color and is skipped for them (D8).
      if(!isWholeObject) desaturateGroup(figure, 1);
    }
    // MODEL-GRAMMAR G3 §2 (conditions as modules): applied AFTER the down-pose (so a prone rotation
    // mod adds onto, not overwrites, an already-down figure's 90° topple) and BEFORE fled-visibility
    // (a fled figure is invisible anyway, so attach order there doesn't matter). anchors resolve off
    // whichever base body this figure actually used — a recipe figure (pcRecipe or bestiary) reads
    // its own recipe.base's anchors; the archetype-builder fallback has no recipe object to consult,
    // so it uses torso-biped's anchors (see applyConditionMods' own header for why that's sane).
    const modAnchors = (u.pcRecipe && Parts.PARTS[u.pcRecipe.base] && Parts.PARTS[u.pcRecipe.base].anchors)
      || (recipeFor(u.recipeSlug) && Parts.PARTS[recipeFor(u.recipeSlug).base] && Parts.PARTS[recipeFor(u.recipeSlug).base].anchors)
      || Parts.torsoBiped.anchors;
    applyConditionMods(figure, u.conditionMods, modAnchors, tint);
    // QF-B3: measure this figure's REAL rendered top (post scale/position/down-topple/condition-mods —
    // the very last transform this figure gets) via an actual bounding-box read, not a per-archetype
    // height guess (see TABLETOP_CAMERA_HEADROOM's own header for why a bbox is the one measurement
    // that's correct across whole-object/recipe/cuboid/interior-sprite figures alike). A downed/prone
    // figure is naturally shorter once toppled (rotation.z=Math.PI/2 above) — the bbox reflects that
    // correctly on its own, no special-casing needed. Skipped entirely on the interior channel (that
    // system already computes its own fit height — see tabletopTallestTop's own declaration above).
    if(!S.isInteriorBoard){
      figure.updateMatrixWorld(true);
      const figBox = new THREE.Box3().setFromObject(figure);
      if(isFinite(figBox.max.y) && figBox.max.y > tabletopTallestTop) tabletopTallestTop = figBox.max.y;
    }
    if(u.fled) figure.visible = false;
    // ENV-1B: every TABLETOP figure casts a real shadow (Adam's DESIGN.md cast-shadows ruling — see
    // mount()'s own ENV-1B provenance comment). Stamped HERE, per-mounted-figure and gated
    // !interiorMode, rather than inside figureFor/addBox/renderPartInto — those builders are SHARED
    // with the interior channel, where PC/ally solid figures have never cast (only sprite billboards
    // and room-shell geometry do there), so stamping in the shared builder would change interior
    // renders and break that channel's byte-stability. Sprite-billboard figures already carry
    // castShadow=true + an alpha-tested customDepthMaterial from buildSpriteBillboardMesh (re-setting
    // is harmless); this traverse is what brings the whole-object/recipe/cuboid solid-figure family
    // up to the same convention. receiveShadow stays untouched (false) on every figure mesh —
    // BEAUTY-WAVE-3's "a cast shadow smeared across a flat card reads as a bug" ruling generalizes:
    // shadows land on the GROUND (the tiles' own receiveShadow=true), never on other minis.
    // userData.standeeBase (the interior plinth tag) is excluded by the same convention
    // mfArtMaterialsOf already keeps — a base never casts (degenerate self-shadow at floor level).
    if(!interiorMode){
      figure.traverse(n => { if(n.isMesh && !(n.userData && n.userData.standeeBase)) n.castShadow = true; });
    }
    // T3 (§4 ctx contract): tag every figure with its unit id so theater-verbs.js's findUnit(id) can
    // resolve a verb's `who` straight to this live Object3D — no separate id->handle map to keep in
    // sync, the tag lives on the object itself exactly where setUnits already iterates it.
    figure.userData.unitId = String(u.id);
    S.unitGroup.add(figure);
    // BEAUTY-WAVE-4.md MF-2 item 1 (STANDEE MOUNT): only a genuinely NEW arrival plays the mount-in
    // fade+scale-settle — a unit that was already known last render (an HP tick, a move, any other
    // field change that forces a rebuild) must NOT replay the fade every frame, which would read as
    // flicker rather than "arrival". mfArtMaterialsOf excludes any userData.standeeBase-tagged mesh
    // on its own, so interior standees' plinth base is already "at full opacity from t=0" for free.
    if(!wasKnownUnitIds.has(String(u.id))){
      mfMountGraceFor(buildTheaterCtx(), figure, 0);
    }

    // G5 ROUND-1 (ruling 2): the base disc REPLACES the flat black blob-shadow as the hostility
    // signal — a tinted disc/short cylinder under each unit, miniatures-style, matching unitTint's own
    // kind color (ember red foe / gold PC / blue ally, same palette the figure geometry already used
    // before ruling 1's natural-channel work moved foe TINT off the body). This is now the ONLY
    // hostility marker on a foe figure (ruling 1 kills the flat foe body tint in favor of natural
    // per-creature channel colors — see recipeChannelTints/buildBaseDiscMat below). Slightly WIDER
    // than the figure footprint (0.34 vs. the old shadow's 0.3 radius) and given a shallow height (a
    // short cylinder, not a flat disc-on-the-floor) for the "flat base/short cylinder, PSX-clean" read
    // the ruling calls for. P1' WHOLE-OBJECT WIRING (§3-D2): a whole-object figure ALREADY carries its
    // own baked neutral disc as the physical base (the module's own geometry) — this hostility disc
    // renders BENEATH it, widened to entry.discR x WHOLE_OBJECT_SCALE x 1.18 (D10: the disc stays the
    // ONLY side signal for a whole-object pc/ally, R5 — no figure tinting on this path). CAPTURE-GATE
    // FOLLOW-UP (2026-07-04, Adam: "a little bit bolder of a read on the gold rim") — widened from
    // 1.12 to 1.18 per R5's own recorded fallback ("the fix is a rim-intensity bump on the pc disc,
    // never figure tinting"); the cuboid-path disc radius formula on the line below is UNCHANGED.
    // A4 (REVIEW-FIXES-0705-VISUAL.md §W2-A finding 4): `|| 0.42` silently replaced an intentional
    // `discR: 0` (a whole-object entry that legitimately wants no hostility-disc rim showing) with
    // the 0.42 default — `||` can't distinguish "falsy because absent/undefined" from "falsy because
    // deliberately zero." `!= null` only falls back for a genuinely missing value (undefined/null),
    // letting 0 pass through unmolested.
    const discRadius = isWholeObject
      ? (figure.userData.wholeObjectDiscR != null ? figure.userData.wholeObjectDiscR : 0.42) * WHOLE_OBJECT_SCALE * 1.18
      : 0.34 * figScale;
    // P1' WHOLE-OBJECT WIRING (§3-D2/D10 — CAPTURE-GATE FIX, R5 side-read check): the cuboid path's
    // hostility disc sits at y=-0.49 — WELL BELOW the tile top (y=0), occluded by the opaque tile
    // geometry and only reading through incidental blend-order artifacts (see the DEAD-STATE scorch-
    // marker comment elsewhere in this file for that same mechanism). A whole-object figure carries
    // its OWN baked neutral disc essentially AT the tile surface (humanoid.js's disc top sits at local
    // y=0.058, i.e. ~0.075 world units above y=0 once WHOLE_OBJECT_SCALE(1.3) applies) — burying the
    // hostility disc at -0.49 put it not just under the tile but under the figure's OWN disc too,
    // doubly occluded, which is exactly what the capture-gate's R5/D10 side-read frame caught: ZERO
    // gold-tinted pixels anywhere in the disc region (verified by direct pixel scan of dev/model-qa/
    // p1-wiring-gate/B-wholeobject-fighter-dark-zoom3.png before this fix landed). Per the ruling's
    // own pre-registered fallback ("the fix is a rim-intensity bump on the pc disc, not figure
    // tinting"): the whole-object hostility disc seats just BENEATH the tile top instead (y=-0.004,
    // clearing z-fighting against the flat-floor case the same way the scorch marker's own 0.011
    // clearance does) so its wider rim is actually visible peeking out from under the figure's own
    // disc, rather than buried deep inside the tile geometry. The cuboid path's y=-0.49 is UNCHANGED
    // (byte-identical to before this unit — its own figures have no baked disc of their own to peek
    // out from beneath, so the existing blend-order mechanism is what that path has always relied on).
    const discY = isWholeObject ? -0.004 : -0.49;
    const baseDisc = new THREE.Mesh(baseDiscGeoForRadius(discRadius), u.down ? corpseDiscMat : baseDiscMatFor(u.kind));
    baseDisc.rotation.x = -Math.PI / 2;
    baseDisc.position.set(x, discY, z);
    if(u.fled) baseDisc.visible = false;
    S.shadowGroup.add(baseDisc);

    // GROUNDING SHADOW (§3): a dark blob quad BENEATH the hostility disc — slightly larger (1.15x the
    // disc's own radius) and seated a hair lower than the disc so the two never z-fight and the blob
    // visibly reads as UNDER the disc, not competing with it. Present on EVERY figure regardless of
    // kind or path, seated relative to that figure's OWN discY (cuboid: -0.495 vs -0.49; whole-object:
    // a matching -0.005 hair below the disc's own -0.004, same z-fight-avoidance discipline).
    const groundingBlob = addGroundingBlob(S.shadowGroup, x, z, discY - 0.005, discRadius * 1.15);
    if(groundingBlob && u.fled) groundingBlob.visible = false;
  });

  // BEAUTY-WAVE-4.md MF-2: this render's id set becomes the baseline the NEXT setUnits() call diffs
  // against for both halves (a still-absent id next time is a despawn; an id absent from THIS set that
  // reappears later is a fresh mount again).
  S.knownUnitIds = newUnitIds;

  // QF-B3: setBoard already ran placeCamera() once for this render, but at THAT point no unit was
  // mounted yet, so its screenHalfHeight term had no real standee height to work with (the flat
  // tabletop's permanent 0 — see TABLETOP_CAMERA_HEADROOM's own header). Now that every figure is
  // mounted+measured (tabletopTallestTop, above), refit the camera against the REAL tallest one, headroom
  // included — this is the fit that actually sticks (setUnits always runs after setBoard, never before).
  // Gated `!S.isInteriorBoard` so the interior channel's own dedicated fit (setInteriorBoard's own
  // placeCameraTweened call, already correct) is never touched or double-fit by this one. A board with
  // no units at all (the idle empty table) leaves tabletopTallestTop at 0 — S.interiorFitMaxHeight stays
  // 0 too, byte-identical to before this unit for that case (screenHalfHeight's height term is a no-op).
  if(!S.isInteriorBoard){
    // ENV-3b ruling 2: persist this call's own figure-height measurement onto S (mirroring
    // S.boardTallestTileTop, setBoard's sibling term) so a LATER setBoard-only replay (dressingTextureFor's
    // async real-art-arrival re-render, which never calls setUnits again) still has a valid figure
    // height to fold in via the shared combiner — see refitTabletopHeightFit's own header for the full
    // mechanism this closes. A board with no units at all (the idle empty table) leaves this at 0,
    // byte-identical to before this unit for that case.
    S.unitsTallestTop = tabletopTallestTop;
    refitTabletopHeightFit();
  }

  // ENV-3 ruling 5 — SYNC-FACE ON REBUILD: same race setBoard's own matching call (above) closes,
  // for S.unitGroup's freshly (re)built standees — see that call site's own full header for the
  // mechanism. Idempotent with the next real rAF tick's own pass.
  S.standeeCollisionDirty = true;
  updateSpriteBillboardYaw();
  markDirty();
}

