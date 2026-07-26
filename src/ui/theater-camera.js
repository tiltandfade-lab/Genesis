/* THEATER CAMERA — the CAMERA / FIT / SHOT family: the authored camera angles, the one instant fit
   (placeCamera) and its MF-1 glide wrapper (placeCameraTweened), the tabletop height-fit combiner,
   the interior room/beat fit resolvers, the STAGE-A A3 shot-compose projector, and the F1 combat-fit
   clamp — extracted VERBATIM from src/ui/theater-boot.js in split step B6 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: everything that decides WHERE THE CAMERA SITS AND WHAT IT FRAMES. The authored angles
   and margins (CAM_ELEV_DEG / CAM_YAW_OFFSET_DEG / CAM_FIT_MARGIN / TABLETOP_CAMERA_HEADROOM /
   INTERIOR_FIT_HALF_FLOOR); the ONE fit both render channels funnel through (placeCamera — ortho for
   the flat tabletop, perspective for the interior channel, branching on S.camera.isPerspectiveCamera
   exactly as before) plus refitTabletopHeightFit's shared "tallest tile vs tallest figure" combiner;
   the MF-1 CAMERA TWEEN (MF1_CAMERA_TWEEN_DUR / mf1EaseOutCubic / mf1Lerp / placeCameraTweened); the
   BW2-1 beat/room fit resolvers (INTERIOR_ROOM_FIT_PAD / INTERIOR_BEAT_MARGIN_CELLS /
   interiorCameraFitFor / interiorFitMaxHeightFor); the STAGE-A A3 SHOT COMPOSE WIRING (ITR_SHOT_COMPOSE,
   the scratch projector _shotScratchCamera/shotScratchCamera/shotNumOr/shotCameraAspect/shotProjectFor/
   shotProjectTwoArg, fitFromComposedShot and its superseded wide-box test seam); and VQ2-RESPEC §4's
   F1_COMBAT_CAM_CLAMP_FRAC / f1ClampCamFit.

   SCHEDULER LAW (the brief's §Protected contracts): placeCameraTweened rides the SHARED S.tweens /
   tickTweens channel (theater-verbs.js) exactly as it did in the monolith — the same channel every verb,
   effect and occlusion fade already animates through. It does NOT own a requestAnimationFrame loop of
   its own, it does not touch the practical FLICKER loop (theater-lighting.js), the MOTE loop
   (theater-motes.js), or the root's dirty-frame loop. Nothing was unified; nothing was re-cadenced.
   `startTweenLoop` is still the root's one entry point and arrives through ctx.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as theater-clay-room.js / theater-light-lab.js /
   theater-post.js / theater-lighting.js): this module NEVER imports theater-boot.js. Capabilities arrive
   ONCE via cameraInit(ctx) into the module-local mirrors below, so every moved body keeps its bare
   identifiers. It DOES read and write the live theater state record (S.camera / S.boardCenter /
   S.boardHalfX / S.boardHalfZ / S.boardHalfExtent / S.boardTallestTileTop / S.unitsTallestTop /
   S.interiorFitMaxHeight / S.isInteriorBoard / S.rotationStep / S.zoomLevel / S.viewSize /
   S.cameraLookTarget / S.tweens / S.mounted / S.scene / S.el / S.boardKey / S.lastBoard /
   S.interiorVariant), so the root also calls cameraSyncState(S) at BOTH `S = createTheaterState()`
   reassignment sites, beside the existing clayRoomSyncState / lightLabSyncState / postSyncState /
   lightingSyncState / motesSyncState calls. Censused: this module never touches the clay room's own
   S.clayCamFit / S.clayCamOffset / S.clayCamZoom pan/zoom record — that pose lives entirely in
   theater-clay-room.js and reaches the camera only through the root's existing wiring.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT, IN BOTH DIRECTIONS:
     - it imports updateDofFocus DIRECTLY from its sibling src/ui/theater-post.js (placeCameraTweened's
       per-tick DoF re-focus) rather than taking it through ctx — a one-way leaf->leaf edge, censused
       acyclic (theater-post.js imports only "three" and three/addons; it reads nothing from this file).
       Identical specifier spelling to theater-boot.js's own import of that file, so both resolve to the
       ONE cached module instance and the function called here IS the function the root calls.
     - src/ui/theater-occlusion.js imports mf1EaseOutCubic + mf1Lerp from THIS file (itrOcclusionClassify's
       own opacity tween reuses the MF-1 easing verbatim) — a one-way leaf->leaf edge, censused acyclic
       (this file reads NOTHING from theater-occlusion.js; the only occlusion names left in these bodies
       are prose in comments). That edge is why theater-camera.js's <script type="module"> tag precedes
       theater-occlusion.js's in genesis.html.

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     FOG_FAR — the shared fog-distance const, read by setBoard/setInteriorBoard/the fog builders all over
       the root, not just by placeCamera's own far-plane math.
     HUMAN_TRUE_HEIGHT — the true-scale human reference, read by the sprite/figure/interior families
       everywhere in the root; interiorFitMaxHeightFor just consumes it.
     spriteEntryFor — the sprite-registry join (theater-boot.js's own resolution chain).
     markDirty — the root's dirty-frame scheduler entry point.
     startTweenLoop — the root's shared tween loop starter (theater-verbs.js's tickTweens driver).
     INTERIOR_CAM_MODE / INTERIOR_CAM_FOV_DEG — the interior channel's camera TYPE choice. Censused: no
       body in this file reads either (placeCamera branches on S.camera.isPerspectiveCamera, three.js's
       own type flag). They are read only by mount()'s camera CONSTRUCTION and setInteriorBoard's camera
       SWAP — both root board-realizer code — and their authored header comment is shared with the
       non-camera WORLD_PSX_ENABLED flag, so the whole block stayed put with no ctx entry at all.
     The ZOOM step math (ZOOM_STEP_FACTOR / ZOOM_MIN / ZOOM_MAX / DEFAULT_FIGURE_ZOOM_STEPS) and the
       window.Theater.zoom/rotate facade seams — player-intent input handling, not fit math; they call
       placeCamera through the root's import block exactly as before.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the four
   `split B6` chunk-boundary notes marking where a root-owned declaration was left behind, and the
   trailing `export {...}` block. There is not ONE accessor swap in this file — every moved production
   line is byte-identical to the monolith. */
import * as THREE from "three";
// split B6: the sibling post module (leaf->leaf, one-way — see this file's header). Identical specifier
// spelling to theater-boot.js's own import of the same file, so both resolve to the ONE cached module
// instance and updateDofFocus here IS the function the root calls.
import { updateDofFocus } from "./theater-post.js";

// ---- root-capability mirrors (wired once by cameraInit; S re-synced by cameraSyncState) ----
let S;
let FOG_FAR, HUMAN_TRUE_HEIGHT, markDirty, spriteEntryFor, startTweenLoop;

export function cameraInit(ctx){
  ({ FOG_FAR,
    HUMAN_TRUE_HEIGHT,
    markDirty,
    spriteEntryFor,
    startTweenLoop } = ctx);
  S = ctx.S;
}
export function cameraSyncState(nextS){ S = nextS; }

// split B6: WORLD_PSX_ENABLED / INTERIOR_CAM_MODE / INTERIOR_CAM_FOV_DEG stayed in theater-boot.js —
// their shared authored header covers the non-camera world-PSX flag too, and their only readers are
// mount()'s camera construction and setInteriorBoard's camera swap (no body here reads them).

const CAM_ELEV_DEG = 35;
// G9 camera-yaw fix (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the board's tile columns are plain
// axis-aligned boxes (setBoard's BoxGeometry, world X/Z grid) — an isometric/dimetric read is ENTIRELY
// a function of the camera sitting OFF that grid's axes. A yaw of exactly rotationStep*90° (the old
// math, with no offset) sits the camera dead-on one axis at every rotation step: it looks straight down
// a row, so only ONE side face of each tile column is ever visible and the board reads as a flat
// frontal wall (the regression this fix targets). +45° rotates the camera into the gap between axes —
// the classic FFT/dimetric camera — so two side faces are always visible and rows recede diagonally.
const CAM_YAW_OFFSET_DEG = 45;
// THEATER-ZOOM-SPREAD (Adam 2026-07-03: "still a little too zoomed out"): the default fit tightens
// from 0.90 -> 0.94 — placeCamera's viewSize is boardHalfExtent/CAM_FIT_MARGIN, so the margin fraction
// directly IS the board's fill fraction of the constraining canvas axis (a bigger margin -> a smaller
// viewSize -> the board covers more of the frame). 0.90 measured out to the orchestrator's ~88% report;
// 0.94 lands close to the requested ~92% without crowding the board against the canvas edge at any
// rotation step (verify-battle-stage's fixture-2 non-square-room overflow gate, G9 camera-yaw fix,
// still holds — this only rescales viewSize uniformly, it doesn't touch the yaw-aware footprint math).
const CAM_FIT_MARGIN = 0.94;
// QF-B3 (2026-07-14, PLAY-LENS P0 #6 — "the tray camera clips the PC's head"): placeCamera's
// screenHalfHeight term is `screenHalfDepth * sin(elevation) + (a standee-height term) * cos(elevation)`
// — the interior/"beat" camera channel already carries a real standee-height term (S.interiorFitMaxHeight,
// setInteriorBoard's own interiorFitMaxHeightFor), but the FLAT TABLETOP channel (setBoard/setUnits — the
// node/settlement tray AND live combat both render through this same GL layer) never did: setBoard resets
// S.interiorFitMaxHeight to 0 with the comment "0 for the flat tabletop... only setInteriorBoard ever
// computes a nonzero" — i.e. the tray's floor-footprint-only fit term has ZERO knowledge of how TALL a
// standing figure actually is, so a normal-height PC/NPC standee can have its head cropped by the top
// frame edge even though its floor cell sits correctly inside the fit (the exact "Ogre Zombie" class of
// bug BW2-1's own header already names for the interior channel — this closes the matching gap on the
// tabletop channel). setUnits (below) now measures every mounted figure's REAL rendered bounding-box
// height (an accurate THREE.Box3 read, not a per-archetype height guess — the tabletop mounts whole-
// object/recipe/cuboid/interior-sprite figures through several different scale conventions, so a single
// bbox read is the one measurement that's correct for all of them) and feeds the tallest one into this
// SAME S.interiorFitMaxHeight field (gated `!S.isInteriorBoard` so it never stomps the interior channel's
// own dedicated computation), plus this headroom margin — clearance above the tallest figure's own
// measured top so its head sits inside the frame with room to spare, never flush against the edge.
const TABLETOP_CAMERA_HEADROOM = 0.3;
// ENV-3b (docs/ENV-EXTERIOR-WAVE.md composition-fix wave) ruling 2: QF-B3's own S.interiorFitMaxHeight
// correction (above) was computed ONLY inside setUnits, off a LOCAL tabletopTallestTop var — correct
// for the ordinary setBoard-then-setUnits render pass, but dressingTextureFor's own async real-art-
// arrival replay (a real assets/dressing/<slug>.png landing) calls setBoard ALONE ("S.boardKey = null;
// setBoard(S.lastBoard);", a few hundred lines down) with no accompanying setUnits call — that replay's
// own placeCamera() call had nothing but the just-reset 0 to fit against, silently dropping the
// standee-height correction (and, ruling 1/2 both landing together, a settlement's own tall BUILDING
// masses too) back to a footprint-only fit until the NEXT full setUnits ever ran again. Both
// measurements now persist on S itself (S.boardTallestTileTop — setBoard's own tile-mount loop;
// S.unitsTallestTop — setUnits' own unit-mount loop, set just below) rather than living only in a
// function-local var, so THIS shared combiner can be called from the tail of EITHER setBoard or setUnits
// and always produce the correct MAX of "the last known tall tile" and "the last known tall figure" —
// whichever one didn't just re-run keeps its own persisted, still-valid measurement. No-op (S remains
// untouched, camera unmoved) for the interior channel (setInteriorBoard's own dedicated fit owns that
// case entirely — see S.isInteriorBoard's own header).
function refitTabletopHeightFit(){
  if(S.isInteriorBoard) return;
  const fitTop = Math.max(S.boardTallestTileTop || 0, S.unitsTallestTop || 0);
  S.interiorFitMaxHeight = fitTop > 0 ? (fitTop + TABLETOP_CAMERA_HEADROOM) : 0;
  placeCamera();
}
// BEAUTY-WAVE-4.md MF-1 (CAMERA TWEENS — the snap killer): every beat/room/move-step camera refit
// glides position+target over this duration instead of snapping (BW4's 280-350ms band, ease-out).
// A single fixed value inside the band (not randomized) keeps the motion predictable + fake-clock
// testable — the SAME number every time a fit fires, matching every other DEFAULT_DUR-style constant
// in this file/theater-verbs.js. Player zoom()/rotate() calls stay on the plain, instant placeCamera()
// below (Feel Law 3 — never add lag to player intent); only the programmatic interior board fit
// (setInteriorBoard's own authoritative placeCamera() call, which also covers move-step refits since
// a move-step forces a fresh setInteriorBoard rebuild — see that call site's own comment) routes
// through placeCameraTweened().
const MF1_CAMERA_TWEEN_DUR = 320;
const mf1EaseOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function mf1Lerp(a, b, t){ return a + (b - a) * t; }
// BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): placeCamera's own degenerate-box floor on hx/hz — was a
// flat 2 for every board (tabletop AND interior). The tabletop's own boards are never intentionally
// smaller than that, so 2 stays its floor unchanged (OUT OF SCOPE: "the flat tabletop"). The interior
// channel's "beat"/CLOSE-room fits are DESIGNED to be tight (a small room or a melee huddle IS the
// point) — a flat 2 silently re-inflated a small room's fit back out no matter how tight
// INTERIOR_ROOM_FIT_PAD/INTERIOR_BEAT_MARGIN_CELLS were tuned, so the interior channel gets its own,
// smaller floor (still nonzero — guards the same degenerate near-zero-footprint collapse the
// tabletop's floor exists for, just at the interior channel's own real scale).
const INTERIOR_FIT_HALF_FLOOR = 0.75;

// split B6: TILE_SIZE / TILE_GAP / BASE_DISC_OPACITY / FIGURE_SCALE and the whole THEATER-ZOOM-SPREAD
// step block (ZOOM_STEP_FACTOR / ZOOM_MIN / ZOOM_MAX / DEFAULT_FIGURE_ZOOM_STEPS) stayed in
// theater-boot.js — tile/figure geometry and player-intent zoom input, not camera-fit math.


// split B6: the FILMIC GRADE / BLOOM / AgX tunables that sat just above placeCamera in the monolith
// (GRADE_TONEMAP, BLOOM_MASK_DISABLED_FOR_TEST, the LIGHT_TUNABLES seed set) stayed in theater-boot.js
// — B2's law and theater-post.js's own ctx already own that split.

/* T1.5 §3 camera fit: frame the board to fill ~80% of the canvas — fit the orthographic camera's
   half-height to the board's own half-extent (its largest tile-footprint radius) with a small margin,
   independent of aspect so it holds through resize, and independent of rotationStep so a 90°-turned
   board reads the SAME fill (an orthographic camera looking at a square-ish footprint from any of the
   4 yaw steps sees the same silhouette envelope — the fit only needs to be recomputed on setBoard,
   not on every rotate(), but rotate() calls this too for safety against an out-of-order call site).
   G9 TUNE 5 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the orchestrator measured the board filling only
   ~45% of the canvas, high-left of center. Two compounding bugs:
     1. An unexplained extra `* 1.15` pad on top of the already-intended CAM_FIT_MARGIN division
        inflated viewSize ~28% past its target, shrinking the board's apparent fill well below 80%.
     2. The fit only ever sized `viewSize` off the board's half-extent and applied `aspect` to the
        HORIZONTAL box only (`left`/`right`) — it never checked the fit against BOTH canvas dimensions.
        On a canvas narrower than it is tall (aspect < 1) this UNDER-fills horizontally (viewSize's
        vertical target left unchecked against the narrower width), which reads as the board sitting
        small and pushed toward one side rather than centered and filling the frame.
   G9 camera-yaw fix (this pass): the tune-5 fit above sized `half` off the AXIS-ALIGNED bounding box
   (max of the board's raw half-width/half-depth), which is only correct when the camera looks straight
   down an axis. Restoring the CAM_YAW_OFFSET_DEG 45° dimetric offset means the camera now looks at the
   board's DIAGONAL, so the true on-screen footprint is the board's YAW-ROTATED projected bounding box —
   for a rectangle of half-extents (hx,hz) viewed along a ground-plane direction (dx,dz), the projected
   half-width along that direction's perpendicular is `hx*|dx| + hz*|dz|` (an axis-aligned box's support
   function). Skipping this and reusing the old axis-aligned `half` at a 45° yaw underestimates the
   screen footprint by up to ~41% (a square's diagonal vs. its side), which is exactly what overflowed
   fixture 2 (a non-square 100'x60' room) off the edge of the canvas at some rotation steps. */
function placeCamera(){
  if(!S.camera) return;
  // MF-1 (BEAUTY-WAVE-4.md, Feel Law 3 — "input is never blocked by cosmetic motion"): an INSTANT fit
  // (this function, called directly by zoom()/rotate()/resize/mount/the tabletop's own setBoard) must
  // always win outright — cancel any in-flight camera-GLIDE tween first so it can't keep overriding
  // this call's placement on the next tick (placeCameraTweened() itself also calls this function, but
  // it does its own equivalent filter first — see that function's header — so this is a no-op there).
  if(S.tweens && S.tweens.length){
    S.tweens = S.tweens.filter((tw) => !(tw && tw.isCameraPoseTween));
  }
  const rad = (CAM_ELEV_DEG * Math.PI) / 180;
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;

  // BEAUTY-WAVE-2.md BW2-1: the degenerate-box floor below is smaller for the interior channel — a
  // "beat"/CLOSE-room fit is DESIGNED to be tight (a small room or huddle is the whole point), and the
  // flat tabletop's pre-unit floor (2) was already generous enough that this unit's tighter interior
  // pads/margins couldn't take effect on a small room/cluster without it. The tabletop's own floor
  // stays exactly 2 (OUT OF SCOPE: "the flat tabletop" — S.isInteriorBoard is false there, always).
  const halfFloor = S.isInteriorBoard ? INTERIOR_FIT_HALF_FLOOR : 2;
  const hx = Math.max(halfFloor, S.boardHalfX || S.boardHalfExtent || 5);
  const hz = Math.max(halfFloor, S.boardHalfZ || S.boardHalfExtent || 5);
  // Screen-right axis (ground-plane, perpendicular to the camera's horizontal look direction) and the
  // ground-plane component of the screen-up axis (the camera's horizontal look direction itself, whose
  // contribution to screen-vertical is foreshortened by sin(elevation) — see camDist/y below for the
  // matching elevation split). Support-function projection of the (hx,hz) box onto each.
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  const screenHalfWidth = hx * Math.abs(cosYaw) + hz * Math.abs(sinYaw);
  const screenHalfDepth = hx * Math.abs(sinYaw) + hz * Math.abs(cosYaw);
  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): the floor-footprint-only term above (screenHalfDepth *
  // sin(elevation)) is a fine vertical-coverage PROXY for a generously-padded ROOM fit (the standing
  // creatures inside it are always much shorter than the room's own half-extent, so the proxy has
  // slack to spare) — but it contains NO actual standee-height term, so a "beat" fit tight enough to
  // satisfy law 2c's floor-cluster+1-cell-margin on its own can still crop a tall participant's HEAD
  // (found live: an Ogre Zombie true-scaling well above HUMAN_TRUE_HEIGHT overflowed a tight beat
  // frame even though its FLOOR cell was correctly inside the fit). A vertical world-space segment of
  // height H, viewed from elevation `rad`, projects to a screen-vertical extent of H*cos(rad) (the
  // complement of updateSpriteBillboardYaw's own tilt-compensation cosine — that function tilts a
  // BILLBOARD's mesh geometry to counteract this exact foreshortening for the rendered quad; this is
  // the same relationship applied to the camera's OWN frustum-containment math instead).
  // S.interiorFitMaxHeight (setInteriorBoard) is the tallest participant's real world height for the
  // CURRENT board, 0 for the flat tabletop (setBoard resets it) — additive: a 0 term changes nothing.
  const screenHalfHeight = screenHalfDepth * Math.sin(rad) + (S.interiorFitMaxHeight || 0) * Math.cos(rad);
  // half: the larger of the two screen-space half-extents the fit needs to cover — mirrors the old
  // scalar's role (the single number viewSizeForHeight/Width fit against) but now yaw-aware.
  const half = Math.max(screenHalfWidth, screenHalfHeight);
  // aspect must be known BEFORE viewSize is picked, so the fit can be checked against both canvas
  // dimensions at once (fix #2) — target: the board's ROTATED screen footprint (both the horizontal
  // and the foreshortened-vertical extents) fills CAM_FIT_MARGIN (0.90 -> ~80% after typical void/
  // margin framing) of whichever canvas dimension is more constraining.
  const w = S.el ? (S.el.clientWidth || 480) : 480;
  const h = S.el ? (S.el.clientHeight || Math.round(w * (9 / 16))) : Math.round(480 * (9 / 16));
  const aspect = w / Math.max(1, h);
  // viewSize is the camera's half-HEIGHT. To fill the frame on the height axis: viewSize = screenHalfHeight / margin.
  // To fill the frame on the width axis: viewSize * aspect = screenHalfWidth / margin  =>  viewSize = screenHalfWidth / (margin * aspect).
  // Each candidate only guarantees containment on ITS OWN axis — picking the SMALLER (the tune-5 fit's
  // choice) leaves the OTHER axis under-sized, i.e. cropped, whenever screenHalfWidth != screenHalfHeight
  // (which the yaw-rotated footprint almost never is, and wasn't even reliably true in the axis-aligned
  // case on a non-square canvas — this is the actual mechanism behind "fixture 2 overflows"). Taking the
  // LARGER of the two guarantees BOTH axes are contained: the frustum this produces is always >= the
  // per-axis requirement, so the more generous axis just carries extra margin instead of clipping the
  // tighter one (fix #1 already removed the stray 1.15 overshoot so this doesn't over-shrink the board).
  const viewSizeForHeight = screenHalfHeight / CAM_FIT_MARGIN;
  const viewSizeForWidth = screenHalfWidth / (CAM_FIT_MARGIN * Math.max(aspect, 0.0001));
  const fittedViewSize = Math.max(viewSizeForHeight, viewSizeForWidth);
  // THEATER-ZOOM-SPREAD: zoomLevel scales the FITTED viewSize (a smaller viewSize = a tighter ortho
  // frustum = the board reads bigger on screen = "zoomed in") — applied here, after the fit itself is
  // computed, so zoom is always relative to "the board's own auto-fit," never an absolute world-unit
  // size that would read inconsistently across different board footprints.
  // GRAPHICS-ENGINE law 2b/2c (VP0/docs/BEAUTY-WAVE.md): S.camera.isPerspectiveCamera (three.js's own
  // type flag, set on every PerspectiveCamera instance) is the single source of truth for which fit
  // math runs — whichever camera object setBoard/setInteriorBoard currently has assigned to S.camera
  // is the one this function fits+positions, no separate mode variable to keep in sync.
  const isPersp = !!S.camera.isPerspectiveCamera;

  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): the screenHalfWidth/Height support-function estimate
  // above is a fast, CORRECT-FOR-A-ROUGHLY-SQUARE-BOX approximation — every pre-unit caller (a room
  // rect, or the whole board) stayed square-ish enough (and generously padded enough) that it always
  // held. A "beat" participant cluster can be ELONGATED (a melee lined up along one axis is a common,
  // realistic shape) and/or carry a tall outlier (S.interiorFitMaxHeight) — found live: an elongated
  // beat cluster under-fit even at height 0 (a pre-existing gap in the approximation, just never
  // exercised by a fit tight enough to expose it before "beat" mode existed). Rather than re-deriving
  // a closed-form fix for every box shape, verify the SAME 8 corners interiorFrustumCheck itself
  // checks (world-axis-aligned box at S.boardCenter, half-extents hx/hz, y in
  // [0, S.interiorFitMaxHeight]) against the camera THIS function is about to commit to, and push it
  // back (persp: distance: ortho: viewSize) until every corner actually lands inside NDC [-1,1] — a
  // short fixed-point correction, not a second fit formula. Costs nothing when the estimate already
  // holds (the common case: room mode, or a compact/square beat cluster) since the loop exits on its
  // first pass.
  const fitBoxCx = (S.boardCenter && typeof S.boardCenter.x === "number") ? S.boardCenter.x : 0;
  const fitBoxCz = (S.boardCenter && typeof S.boardCenter.z === "number") ? S.boardCenter.z : 0;
  const fitBoxH = S.interiorFitMaxHeight || 0;
  const fitCorners = [];
  [-hx, hx].forEach((dx) => [-hz, hz].forEach((dz) => [0, fitBoxH].forEach((dy) => {
    fitCorners.push(new THREE.Vector3(fitBoxCx + dx, dy, fitBoxCz + dz));
  })));
  function worstCornerNdc(){
    S.camera.updateMatrixWorld();
    let worst = 0;
    fitCorners.forEach((p) => {
      const v = p.clone().project(S.camera);
      worst = Math.max(worst, Math.abs(v.x), Math.abs(v.y));
    });
    return worst;
  }

  if(isPersp){
    // FRAMING LAW 2c: fit the ACTION CLUSTER (participants + margin) fully in frustum. Under a FIXED
    // FOV, the fit variable is CAMERA DISTANCE, not a frustum half-extent — solve the distance along
    // each axis that makes the frustum's half-height/half-width (at that distance) equal the board's
    // own screen-space half-extents at CAM_FIT_MARGIN fill, same containment discipline the ortho
    // branch already uses (take the LARGER distance so BOTH axes stay contained, never cropped).
    const fovYRad = (S.camera.fov * Math.PI) / 180;
    const tanHalfFovY = Math.tan(fovYRad / 2);
    const distForHeight = (screenHalfHeight / CAM_FIT_MARGIN) / tanHalfFovY;
    const distForWidth = (screenHalfWidth / (CAM_FIT_MARGIN * Math.max(aspect, 0.0001))) / tanHalfFovY;
    // half*1.05 floor: guards the degenerate near-zero-elevation/near-zero-footprint case (distForHeight
    // could otherwise collapse toward 0 and place the camera inside the board) — mirrors the ortho
    // branch's own `Math.max(half, hx, hz)` floor one function down.
    let autoFitDist = Math.max(distForHeight, distForWidth, half * 1.05, hx, hz);
    S.viewSize = null; // no orthographic half-height under perspective; harnesses branch on isPerspectiveCamera instead

    function placeAt(dist){
      const horiz = Math.cos(rad) * dist;
      const y = Math.sin(rad) * dist;
      const x = Math.sin(yaw) * horiz;
      const z = Math.cos(yaw) * horiz;
      S.camera.position.set(x, y, z);
      S.camera.lookAt(S.boardCenter || new THREE.Vector3(0, 0, 0));
    }
    S.camera.aspect = aspect;
    S.camera.near = 0.1;

    // exact-containment correction (see this function's own header comment above), run at the
    // UN-ZOOMED auto-fit distance — THEATER-ZOOM-SPREAD's own manual zoom-in is INTENTIONALLY allowed
    // to crop past the auto-fit (that's what zooming in means); correcting post-zoom would instead
    // fight the player's own zoom lever, defeating it. NDC magnitude scales ~1/distance for a fixed
    // FOV/lookAt, so scaling distance by the worst corner's own overflow converges in a couple of
    // passes; capped iterations so a pathological/degenerate box can never spin this into a loop.
    placeAt(autoFitDist);
    S.camera.far = Math.max(100, autoFitDist + FOG_FAR + 20);
    S.camera.updateProjectionMatrix();
    for(let pass = 0; pass < 6; pass++){
      const worst = worstCornerNdc();
      if(worst <= 0.999) break;
      autoFitDist *= worst / 0.999;
      placeAt(autoFitDist);
      S.camera.far = Math.max(100, autoFitDist + FOG_FAR + 20);
      S.camera.updateProjectionMatrix();
    }

    // NOW apply the player's own zoom multiplier on top of the corrected auto-fit distance.
    const camDist = autoFitDist * (S.zoomLevel || 1);
    placeAt(camDist);
    S.camera.far = Math.max(100, camDist + FOG_FAR + 20);
    S.camera.updateProjectionMatrix();

    if(S.scene && S.scene.fog){
      S.scene.fog.near = camDist * 0.55;
      S.scene.fog.far = camDist * 1.65;
    }
    // MF-1: keep the tracked "current look target" in sync with wherever this (instant, un-tweened)
    // fit just pointed the camera — placeCameraTweened() reads this as its start-target on the NEXT
    // fit, whether or not the intervening calls (zoom/rotate/resize) were themselves tweened.
    S.cameraLookTarget = (S.boardCenter ? S.boardCenter.clone() : new THREE.Vector3(0, 0, 0));
    return;
  }

  // camera distance scales with viewSize so a big board doesn't clip through a fixed-distance camera
  // (T1 used a flat CAM_DIST=26; T1.5 makes it board-relative so the fit holds for any room size).
  // Distance also needs to clear the board's rotated footprint (not just `half`'s old axis-aligned
  // reading), so it's derived from the same screen-space half used for the fit.
  const camDist = Math.max(half, hx, hz) * 2.6;
  const horiz = Math.cos(rad) * camDist;
  const y = Math.sin(rad) * camDist;
  const x = Math.sin(yaw) * horiz;
  const z = Math.cos(yaw) * horiz;
  S.camera.position.set(x, y, z);
  S.camera.lookAt(S.boardCenter || new THREE.Vector3(0, 0, 0));

  // exact-containment correction (see this function's own header comment above), run at the UN-ZOOMED
  // auto-fit viewSize first — same "don't fight the player's own zoom lever" discipline the persp
  // branch's own comment explains. An orthographic camera's NDC framing is governed by left/right/
  // top/bottom, NOT distance — scale viewSize (and left/right proportionally) by the worst corner's
  // own overflow instead of moving the camera.
  let autoFitViewSize = fittedViewSize;
  S.camera.left = -autoFitViewSize * aspect;
  S.camera.right = autoFitViewSize * aspect;
  S.camera.top = autoFitViewSize;
  S.camera.bottom = -autoFitViewSize;
  S.camera.far = Math.max(100, camDist + FOG_FAR + 20);
  S.camera.updateProjectionMatrix();
  for(let pass = 0; pass < 6; pass++){
    const worst = worstCornerNdc();
    if(worst <= 0.999) break;
    autoFitViewSize *= worst / 0.999;
    S.camera.left = -autoFitViewSize * aspect;
    S.camera.right = autoFitViewSize * aspect;
    S.camera.top = autoFitViewSize;
    S.camera.bottom = -autoFitViewSize;
    S.camera.updateProjectionMatrix();
  }

  // NOW apply the player's own zoom multiplier on top of the corrected auto-fit viewSize.
  // QF-B3: THEATER-ZOOM-SPREAD's own readability default (DEFAULT_FIGURE_ZOOM_STEPS, ~0.51x at 3
  // steps) is a deliberate zoom-IN bias — a smaller viewSize reads as "closer/bigger" — applied
  // UNCONDITIONALLY on every flat-tabletop board, board-footprint fit or not. Before this unit,
  // nothing floored how far that bias could shrink the frame, so it could (and did — pl-001/pl-002)
  // zoom in past the point where a standing figure's own head still fits: viewSizeForHeight (this
  // function's own headroom-inclusive height term, now carrying TABLETOP_CAMERA_HEADROOM via
  // S.interiorFitMaxHeight — see that constant's own header) is the one viewSize below which the
  // tallest mounted figure's padded top would NOT be contained — clamping the biased viewSize to
  // never go below it makes "zoom in for readability" and "never crop a head" compatible: a board
  // whose footprint already demands more room than the bias would give keeps its existing (larger)
  // fit unchanged (Math.max is a no-op there), and a board that WOULD have over-zoomed past a
  // figure's head now stops exactly at the safe floor instead.
  const viewSize = Math.max(autoFitViewSize * (S.zoomLevel || 1), viewSizeForHeight);
  S.camera.left = -viewSize * aspect;
  S.camera.right = viewSize * aspect;
  S.camera.top = viewSize;
  S.camera.bottom = -viewSize;
  S.camera.updateProjectionMatrix();
  S.viewSize = viewSize;

  if(S.scene && S.scene.fog){
    // fog distances scale with the fit too, so a huge board's far edge still just "softens" instead
    // of vanishing entirely or not fogging at all — proportional to camDist rather than fixed.
    S.scene.fog.near = camDist * 0.55;
    S.scene.fog.far = camDist * 1.65;
  }
  // MF-1: see the perspective branch's own matching line above — keeps the tracked look target
  // current for placeCameraTweened()'s next start-pose read.
  S.cameraLookTarget = (S.boardCenter ? S.boardCenter.clone() : new THREE.Vector3(0, 0, 0));
}

/* BEAUTY-WAVE-4.md MF-1 (CAMERA TWEENS): wraps placeCamera() so a programmatic beat/room/move-step
   camera refit GLIDES from its current live pose to the new fit's pose over MF1_CAMERA_TWEEN_DUR ms
   (ease-out), instead of the plain placeCamera()'s instant snap. Reuses the SAME tween channel every
   other verb/effect animates through (S.tweens / tickTweens, theater-verbs.js) — no second tween
   system. Only wraps POSITION + LOOK TARGET (the fields BW4's MF-1 names); projection-matrix fields
   (aspect/fov/near/far/ortho left-right-top-bottom, viewSize/zoom) still apply INSTANTLY as part of
   computing the new fit's end pose, matching the spec's literal "tween position+target" scope — a
   full projection tween isn't asked for and isn't attempted here.

   INTERRUPTIBLE RETARGET: if a camera tween is already in flight when a new fit arrives, the new
   tween starts from the CURRENT INTERPOLATED pose (S.camera.position + S.cameraLookTarget, both kept
   live by the in-flight tween's own onUpdate every frame) — never a restart from the old tween's
   original start, and never a snap to its old end. The stale tween is spliced out of S.tweens first so
   only one camera-pose tween is ever live at a time. */
function placeCameraTweened(preFit){
  if(!S.mounted || !S.camera){ placeCamera(); return; }

  // start pose = wherever the camera/look-target ACTUALLY were right before THIS fit's math ran.
  // `preFit` (an explicit {pos,target} snapshot) is required whenever the caller does its own
  // preview/idempotent placeCamera() call before this one (setInteriorBoard's OCCLUSION LAW preview,
  // see its own header) — by the time control reaches here S.camera already sits at what will become
  // the END pose too, so reading S.camera.position "live" at this point would silently no-op every
  // fit (found live debugging this unit). Falls back to reading the live pose directly for any future
  // caller that has no such preview step of its own.
  const startPos = (preFit && preFit.pos) ? preFit.pos.clone() : S.camera.position.clone();
  const startTarget = (preFit && preFit.target) ? preFit.target.clone()
    : (S.cameraLookTarget ? S.cameraLookTarget.clone() : new THREE.Vector3(0, 0, 0));

  // cancel any in-flight camera-pose tween (retarget, not stack) — never two competing camera tweens.
  if(S.tweens && S.tweens.length){
    S.tweens = S.tweens.filter((tw) => !(tw && tw.isCameraPoseTween));
  }

  // let the real fit math run + commit — placeCamera() leaves S.camera at the FINAL end pose (and the
  // final projection), which is exactly the number this function needs; it's then snapped back to the
  // start pose below so nothing flashes to the end pose before the tween's first tick.
  placeCamera();
  const endPos = S.camera.position.clone();
  const endTarget = (S.cameraLookTarget ? S.cameraLookTarget.clone() : new THREE.Vector3(0, 0, 0));

  // degenerate/no-op fit (e.g. re-fitting the identical board) — nothing to glide, skip the tween.
  if(startPos.distanceToSquared(endPos) < 1e-8 && startTarget.distanceToSquared(endTarget) < 1e-8){
    return;
  }

  S.camera.position.copy(startPos);
  S.camera.lookAt(startTarget);
  S.cameraLookTarget = startTarget.clone();

  if(!S.tweens) S.tweens = [];
  const tw = {
    start: Date.now(),
    dur: MF1_CAMERA_TWEEN_DUR,
    isCameraPoseTween: true,
    update: (t) => {
      const e = mf1EaseOutCubic(t);
      const px = mf1Lerp(startPos.x, endPos.x, e);
      const py = mf1Lerp(startPos.y, endPos.y, e);
      const pz = mf1Lerp(startPos.z, endPos.z, e);
      S.camera.position.set(px, py, pz);
      const tx = mf1Lerp(startTarget.x, endTarget.x, e);
      const ty = mf1Lerp(startTarget.y, endTarget.y, e);
      const tz = mf1Lerp(startTarget.z, endTarget.z, e);
      S.camera.lookAt(tx, ty, tz);
      S.cameraLookTarget = new THREE.Vector3(tx, ty, tz);
      // keep the DoF focal band (BW3-2) tracking the camera continuously through the glide, not just
      // its start/end — updateDofFocus no-ops safely if the post suite hasn't mounted yet this call.
      if(typeof updateDofFocus === "function") updateDofFocus();
    },
    onDone: () => {
      S.camera.position.copy(endPos);
      S.camera.lookAt(endTarget);
      S.cameraLookTarget = endTarget.clone();
      if(typeof updateDofFocus === "function") updateDofFocus();
    }
  };
  S.tweens.push(tw);
  if(typeof markDirty === "function") markDirty();
  startTweenLoop();
}

// split B6: ENV_SCORCH_TINT / scorchTintFor and gradeColorLocal (the REALM-RENDER-STYLE §3 grade seam)
// sat immediately after placeCameraTweened in the monolith and stayed in theater-boot.js — a dead-state
// marker tint and a colour seam, neither of them camera work.


/* BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA) — law 2c wired: "the camera fits the ACTION CLUSTER"
   (combat beats) vs. "frame the room but CLOSE" (exploration). Pre-unit, setInteriorBoard's camera
   fit was ALWAYS the room's own focusRect + a flat 2-world-unit pad, aimed at boardCenter=(0,0,0) —
   correct for "frame the room" but with too loose a pad to read as CLOSE (measured well under the
   law's own 12%-of-frame-height floor for a medium standee, dev/battle-gate/capture-beat-camera.mjs's
   own red-first run), and with NO path at all for "fit the participants, not the room" (combat beats
   would inherit the identical loose room fit regardless of how few combatants are on screen).

   data.cameraFit is a plain caller-set field (data.pieces/data.dressing/data.lightProfile's own
   established convention on the board object — no setInteriorBoard signature change):
     absent / {mode:"room"}  — fit `fit` (the room rect, or the whole board footprint with no focus
                                room) with INTERIOR_ROOM_FIT_PAD world units of margin, aimed at the
                                room's own center (boardCenter stays (0,0,0) in the already cx/cz-
                                shifted coordinate frame every mounted instance uses) — CLOSER than
                                the pre-unit pad, same shape otherwise.
     {mode:"beat", cells:[{x,y},...], marginCells?} — fit the PARTICIPANT CLUSTER: the bounding box of
                                `cells` (raw, PRE-shift cell coordinates — the SAME space data.pieces[
                                ].cellX/cellY and data.focusRect already use) + marginCells (default
                                INTERIOR_BEAT_MARGIN_CELLS = 1, law 2c's own "+1 cell margin"), aimed
                                at the cluster's own center — which may sit off the room's center, so
                                boardCenter is offset accordingly (still in the cx/cz-shifted frame:
                                clusterCenter - cx/cz). Falls back to "room" mode if `cells` is
                                missing/empty (never a thrown/blank fit).
   Geometry (floor/wall/pieces/dressing mount, all keyed off cx/cz above) is COMPLETELY UNTOUCHED by
   this — only the CAMERA's aim point and half-extents change. Returns {center, halfX, halfZ}, the
   exact three fields setInteriorBoard assigns to S.boardCenter/S.boardHalfX/S.boardHalfZ. */
const INTERIOR_ROOM_FIT_PAD = -0.5;    // world units of margin around the room rect — was a flat "+2"
const INTERIOR_BEAT_MARGIN_CELLS = 1;  // law 2c: "participants + 1 cell margin"
function interiorCameraFitFor(cameraFit, fit, cx, cz){
  const mode = cameraFit && cameraFit.mode === "beat" ? "beat" : "room";
  if(mode === "beat" && Array.isArray(cameraFit.cells) && cameraFit.cells.length){
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    cameraFit.cells.forEach(function(c){
      if(!c) return;
      const px = (typeof c.x === "number") ? c.x : 0;
      const pz = (typeof c.y === "number") ? c.y : ((typeof c.z === "number") ? c.z : 0);
      if(px < minX) minX = px; if(px > maxX) maxX = px;
      if(pz < minZ) minZ = pz; if(pz > maxZ) maxZ = pz;
    });
    if(isFinite(minX) && isFinite(maxX) && isFinite(minZ) && isFinite(maxZ)){
      const margin = (typeof cameraFit.marginCells === "number" && cameraFit.marginCells >= 0)
        ? cameraFit.marginCells : INTERIOR_BEAT_MARGIN_CELLS;
      const clusterCx = (minX + maxX) / 2, clusterCz = (minZ + maxZ) / 2;
      return {
        center: new THREE.Vector3(clusterCx - cx, 0, clusterCz - cz),
        halfX: (maxX - minX) / 2 + margin,
        halfZ: (maxZ - minZ) / 2 + margin
      };
    }
    // cells present but degenerate (every entry missing x/y) — fall through to "room" below rather
    // than aim at a NaN/zero-size cluster.
  }
  return {
    center: new THREE.Vector3(0, 0, 0),
    halfX: (fit.maxX - fit.minX) / 2 + INTERIOR_ROOM_FIT_PAD,
    halfZ: (fit.maxZ - fit.minZ) / 2 + INTERIOR_ROOM_FIT_PAD
  };
}

// BEAUTY-WAVE-2.md BW2-1 — see placeCamera's screenHalfHeight comment for the "why". An explicit
// data.cameraFit.maxHeight (world units) always wins; else the tallest data.pieces entry's real
// TRUE-SCALE height (spriteEntryFor's scaleTrue, or a piece's own scaleVsHuman override — the SAME
// resolution order interiorSpriteBillboard uses, just without its wallHeightCap clamp: the fit should
// reserve room for a creature's full intended height, not the height it gets clipped to for ceiling
// clearance). Falls back to HUMAN_TRUE_HEIGHT (an undressed-human default, matching every other
// "no data" default in this render channel) when there are no pieces at all, or none resolve against
// the sprite registry — never zero (a zero here would silently re-introduce the pre-unit crop bug on
// the very first board that ever supplies pieces before the registry has loaded).
function interiorFitMaxHeightFor(data){
  if(data && data.cameraFit && typeof data.cameraFit.maxHeight === "number" && data.cameraFit.maxHeight > 0){
    return data.cameraFit.maxHeight;
  }
  let tallest = 0;
  (data && data.pieces || []).forEach(function(p){
    if(!p || !p.slug) return;
    const base = (typeof spriteEntryFor === "function") ? spriteEntryFor(p.slug) : null;
    const scaleTrue = (typeof p.scaleVsHuman === "number" && p.scaleVsHuman > 0)
      ? p.scaleVsHuman
      : (base && typeof base.scaleTrue === "number" && base.scaleTrue > 0) ? base.scaleTrue : null;
    if(scaleTrue == null) return; // unresolved piece (texture/registry not loaded yet) — skip, don't guess
    const h = HUMAN_TRUE_HEIGHT * scaleTrue;
    if(h > tallest) tallest = h;
  });
  return tallest > 0 ? tallest : HUMAN_TRUE_HEIGHT;
}

/* GRAPHICS-NORTH-STAR.md STAGE A unit A3 (docs/STAGE-A.md §A3; docs/WALK-NATIVE-A.md A3) — THE SHOT
   COMPOSE WIRING. theater-shot.js's ShotPlan/composeShot are pure (no THREE/DOM); this is the one
   thing they can't own themselves — a real multi-pose projector, and the seam that drives the interior
   camera fit from the chosen candidate instead of the plain focusRect box.

   ITR_SHOT_COMPOSE (default ON) is this unit's own reversible flag, mirroring theater-interior.js's
   ITR_ACTIVE_ROOM_ONLY (A1) in NAME/INTENT only — NOT in mechanism. theater-interior.js is a classic
   <script> (global scope), so `var ITR_ACTIVE_ROOM_ONLY` is directly `window.ITR_ACTIVE_ROOM_ONLY`,
   flippable from any harness. This file is the ONE sealed ES-module boundary in Genesis (its own
   header, above) — a top-level `const` here is NOT a `window` property, so a harness can't reach it
   that way. Every existing study-rig toggle in this exact function already solves that the same way
   (INTERIOR_CAM_MODE vs. `variant.camMode`, `rigOn` vs. `variant.rig`, a few lines up in
   setInteriorBoard) — S.interiorVariant / window.Theater.setInteriorVariant() is this file's own
   established "flip a normally-const render choice at runtime" channel, so ITR_SHOT_COMPOSE follows
   that precedent: `variant.shotCompose` (boolean) overrides the ITR_SHOT_COMPOSE default when set,
   exactly like camMode/rigOn do for theirs. */
const ITR_SHOT_COMPOSE = true;

// shotScratchCamera — ONE lazily-created THREE.PerspectiveCamera, reused across every candidate/point
// projected (cheap: only its transform+FOV are touched, never attached to S.scene, never rendered
// through, never visible to any other code). "SCRATCH" per the spec: this is never S.camera.
let _shotScratchCamera = null;
function shotScratchCamera(){
  if(!_shotScratchCamera) _shotScratchCamera = new THREE.PerspectiveCamera(20, 1, 0.05, 4000);
  return _shotScratchCamera;
}
function shotNumOr(v, d){ return (typeof v === "number" && isFinite(v)) ? v : d; }
// shotCameraAspect — the live canvas aspect when mounted (matches what the REAL camera will render
// at); a sane fallback otherwise (an unmounted/harness call with no S.el yet).
function shotCameraAspect(){
  if(S.el && S.el.clientWidth && S.el.clientHeight) return S.el.clientWidth / Math.max(1, S.el.clientHeight);
  if(S.camera && S.camera.aspect) return S.camera.aspect;
  return 16 / 9;
}
/* shotProjectFor(cameraPose) -> project(worldPt) -> {ndcX,ndcY}|null — theater-shot.js's own header
   ("THE PROJECTION CONTRACT") spells out exactly why this must be a MULTI-pose projector: composeShot
   scores several hypothetical camera poses (4 diagonal yaws + the current orbit) per call, and a single
   fixed projection through whatever camera is already mounted can't answer "where would this point
   land under candidate B's pose" without actually moving the live camera there first — an expensive,
   side-effecting operation a pure caller (and this wiring, which must never perturb what's on screen
   mid-compose) must never trigger. This positions the SCRATCH camera (never S.camera) per `cameraPose`
   (the exact `{id,mode,yaw,pitch,fov,target,distance,sharpSubjects}` shape scoreCandidate's own
   normalizeCandidate produces), updates its matrices, and projects `worldPt` through it — reusing the
   identical `Vector3.project(camera)` math projectWorldPoint/interiorFrustumCheck already use in this
   file, just against a camera this function owns instead of the live one. Position math mirrors
   placeCamera's own yaw/pitch->offset convention (this function's own target-relative orbit, since a
   candidate's `target` can sit anywhere — placeCamera's version only ever orbits the fixed origin
   because its own target is always the already cx/cz-shifted S.boardCenter). */
function shotProjectFor(cameraPose){
  return function(worldPt){
    if(!worldPt || !cameraPose) return null;
    try {
      const cam = shotScratchCamera();
      cam.fov = shotNumOr(cameraPose.fov, 20);
      cam.aspect = shotCameraAspect();
      cam.near = 0.05;
      cam.far = 4000;
      const target = cameraPose.target || { x: 0, z: 0 };
      const tx = shotNumOr(target.x, 0), ty = shotNumOr(target.y, 0), tz = shotNumOr(target.z, 0);
      const distance = Math.max(0.1, shotNumOr(cameraPose.distance, 6));
      const yawRad = (shotNumOr(cameraPose.yaw, 0) * Math.PI) / 180;
      const pitchRad = (shotNumOr(cameraPose.pitch, 32) * Math.PI) / 180;
      const horiz = Math.cos(pitchRad) * distance;
      const height = Math.sin(pitchRad) * distance;
      cam.position.set(tx + Math.sin(yawRad) * horiz, ty + height, tz + Math.cos(yawRad) * horiz);
      cam.up.set(0, 1, 0);
      cam.lookAt(tx, ty, tz);
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld(true);
      const v = new THREE.Vector3(shotNumOr(worldPt.x, 0), shotNumOr(worldPt.y, 0), shotNumOr(worldPt.z, 0)).project(cam);
      if(!isFinite(v.x) || !isFinite(v.y)) return null;
      return { ndcX: v.x, ndcY: v.y };
    } catch(e){ return null; }
  };
}
// shotProjectFor is republished onto window.Theater further down (AFTER the `window.Theater = {...}`
// object-literal assignment this file makes near its own bottom — every other harness-facing
// diagnostic in this file, e.g. projectWorldPoint/interiorFrustumCheck, is republished the same way,
// at that same later point, for the identical reason: window.Theater doesn't exist yet up here).
// shotProjectTwoArg — the 2-arg adapter theater-shot.js's own composeShot contract actually calls
// (`project(worldPt, cameraPose)`, one function reused across every candidate — see that file's header
// "THE PROJECTION CONTRACT"). Trivial curry over shotProjectFor so this file keeps the pose-first
// naming the spec calls for while still satisfying composeShot's real signature.
function shotProjectTwoArg(worldPt, cameraPose){ return shotProjectFor(cameraPose)(worldPt); }

/* fitFromComposedShot — converts a composed shot into the exact {center,halfX,halfZ} shape
   interiorCameraFitFor already returns (setInteriorBoard assigns it straight to
   S.boardCenter/S.boardHalfX/S.boardHalfZ either way, so this is a drop-in alternate source for that
   shape, not a second code path downstream of it).

   ROUND 2 FIX (coordinator read of the after-composed capture): the earlier version derived the box
   half-extent from the composed camera's OWN `distance*tan(fovY/2)` — the full frustum half-height at
   the target plane, i.e. the WHOLE framed region. Re-fitting THAT box back through placeCamera (which
   fits a floor box to ~94% of frame, on the 45°-yawed footprint whose screen projection is ~1.41x
   wider, taking the LARGER of the width/height axes) reproduced a WIDE view and dropped a medium
   standee to ~13% of frame height — LOOSER than the plain focusRect fit and void-heavy, failing the
   Stage-A gate ("medium standee 18-25% frame height, minimal dead frame"). The distance→box conversion
   was the lossy step: composeShot's chosen distance already validated the figure at 18-25% for ITS
   pose, but placeCamera's box-fit doesn't reproduce that pose from a full-frustum box.

   The fix frames the ACTUAL ACTION-CLUSTER EXTENT instead — the participant/piece positions the
   ShotPlan already carries — by REUSING interiorCameraFitFor's own "beat" branch, the exact tight-crop
   path dev/battle-gate/capture-beat-camera.mjs already proved lands a medium standee >=18% frame
   height. composeShot still runs and still governs the fallback (its metrics.allRejected -> focusRect,
   below) and still records its chosen pose/metrics for the harness — it just no longer sizes the box
   from a full-frustum distance; the cluster's own extent (+ the beat margin) sizes it, faithfully
   reproducing the tight framing composeShot's medium-figure constraint had validated.

   Cells come from the ShotPlan's LIVING pieces (combat units + staged cast cards — all carry
   living:true, and x/z in the SAME raw pre-shift cell frame `fit`/cx/cz use). Absent any (a pure
   environment tray with no encounter), falls back to the resolved anchors (player/threat/objective);
   absent even those, returns null so the caller drops to the plain focusRect room fit. */
function fitFromComposedShot(shotPlan, fit, cx, cz){
  if(!shotPlan) return null;
  const cells = [];
  (shotPlan.pieces || []).forEach(function(p){
    if(p && p.living && typeof p.x === "number" && typeof p.z === "number") cells.push({ x: p.x, y: p.z });
  });
  if(!cells.length){
    const a = shotPlan.anchors || {};
    [a.player, a.primaryThreat, a.objective].forEach(function(an){
      if(an && typeof an.x === "number" && typeof an.z === "number") cells.push({ x: an.x, y: an.z });
    });
  }
  if(!cells.length) return null; // no action cluster -> the caller's focusRect room fallback fires
  // interiorCameraFitFor's beat branch never reads `fit` when cells are present+finite; passing the
  // real `fit` only feeds its internal degenerate-cells fallback, so this is safe either way.
  return interiorCameraFitFor({ mode: "beat", cells: cells }, fit, cx, cz);
}

// STAGE-A A3 — TEST-ONLY SEAM (default OFF): the SUPERSEDED full-frustum box (halfExtent =
// distance*tan(fovY/2), the whole framed region) the round-1 build shipped and the coordinator's own
// after-composed read flagged as too WIDE (medium standee dropped to ~13% frame height, void-heavy).
// Kept ONLY so dev/verify-shot-compose.mjs can flip `variant.shotComposeWideBoxForTest` on for a
// GENUINE, reproducible RED-FIRST baseline of the figure-height check (proving that check catches the
// loose framing), then flip it off (the default) for the tight, gate-passing green. No product caller
// ever sets that flag — production always takes fitFromComposedShot's action-cluster crop above.
function fitFromComposedCameraWideForTest(camera, cx, cz){
  if(!camera) return null;
  const target = camera.target || { x: 0, z: 0 };
  const tx = shotNumOr(target.x, 0), tz = shotNumOr(target.z, 0);
  const fovRad = (shotNumOr(camera.fov, 20) * Math.PI) / 180;
  const distance = Math.max(0.1, shotNumOr(camera.distance, 6));
  const halfExtent = Math.max(0.5, distance * Math.tan(fovRad / 2));
  return { center: new THREE.Vector3(tx - cx, 0, tz - cz), halfX: halfExtent, halfZ: halfExtent };
}

// split B6: the BW2-1b OCCLUSION LAW family (itrSegmentIntersectsAabb / itrPieceSightPoints /
// itrPillarCutawayMask / the A4 fade classifier / the clip-margin nudge helpers) that followed the shot
// wiring in the monolith moved to its own module, src/ui/theater-occlusion.js — which imports
// mf1EaseOutCubic/mf1Lerp from THIS file (see this file's header).

// VQ2-RESPEC.md §4 unit F1 — "target/distance delta clamped ≤10%" (combat-in-room's own camera law,
// Sol P-F). f1ClampCamFit(camFit, baseline, maxFrac) bounds a combat render's composed fit against the
// SAME room's last non-combat (exploration) fit: the TARGET (camFit.center) is clamped to an absolute
// delta of at most `maxFrac` of the room's own fitted extent (max(baseline.halfX,halfZ,1) — the room's
// footprint is the natural "how far is far" reference; using the raw center coordinate itself would be
// unstable near the room-mode default of ~(0,0)). The DISTANCE proxy (halfX/halfZ — what
// placeCamera's screenHalf*/viewSize math actually scales off) is clamped as a relative delta off its
// OWN baseline value instead (a room's fitted half-extent is never ~0, so a plain relative bound is
// safe there). Never mutates its inputs; returns a NEW {center,halfX,halfZ} object every time.
const F1_COMBAT_CAM_CLAMP_FRAC = 0.10;
function f1ClampCamFit(camFit, baseline, maxFrac){
  if(!camFit || !baseline) return camFit;
  const scale = Math.max(baseline.halfX || 0, baseline.halfZ || 0, 1);
  const maxCenterDelta = scale * maxFrac;
  const dx = camFit.center.x - baseline.center.x, dz = camFit.center.z - baseline.center.z;
  const centerDist = Math.hypot(dx, dz);
  let center = camFit.center;
  if(centerDist > maxCenterDelta && centerDist > 0){
    const k = maxCenterDelta / centerDist;
    const clampedX = baseline.center.x + dx * k, clampedZ = baseline.center.z + dz * k;
    // interiorCameraFitFor/fitFromComposedShot always hand back a REAL THREE.Vector3 for `.center`
    // (placeCamera's own S.boardCenter.clone() call downstream requires it) — clone+mutate here so
    // the clamped result stays a Vector3 in production, never a bare `new THREE.Vector3(...)` call
    // (which would make this function un-eval-able outside a THREE-loaded context; dev/verify-f1-
    // combat-in-room.mjs §7 extracts + evals this exact function text standalone, no THREE global,
    // to unit-test the pure clamp math). A plain {x,z}-shaped input (that harness's own fixtures)
    // degrades to a plain object the same way.
    if(typeof camFit.center.clone === "function"){
      center = camFit.center.clone();
      if(typeof center.set === "function") center.set(clampedX, center.y, clampedZ);
      else { center.x = clampedX; center.z = clampedZ; }
    } else {
      center = { x: clampedX, z: clampedZ };
    }
  }
  function clampExtent(cur, base){
    if(!(base > 0)) return cur;
    const maxDelta = base * maxFrac;
    const delta = cur - base;
    if(Math.abs(delta) <= maxDelta) return cur;
    return base + Math.sign(delta) * maxDelta;
  }
  return { center, halfX: clampExtent(camFit.halfX, baseline.halfX), halfZ: clampExtent(camFit.halfZ, baseline.halfZ) };
}

export {
  CAM_ELEV_DEG, CAM_YAW_OFFSET_DEG, CAM_FIT_MARGIN, TABLETOP_CAMERA_HEADROOM,
  refitTabletopHeightFit, MF1_CAMERA_TWEEN_DUR, mf1EaseOutCubic, mf1Lerp, INTERIOR_FIT_HALF_FLOOR,
  placeCamera, placeCameraTweened,
  INTERIOR_ROOM_FIT_PAD, INTERIOR_BEAT_MARGIN_CELLS, interiorCameraFitFor, interiorFitMaxHeightFor,
  ITR_SHOT_COMPOSE, shotScratchCamera, shotNumOr, shotCameraAspect,
  shotProjectFor, shotProjectTwoArg, fitFromComposedShot, fitFromComposedCameraWideForTest,
  F1_COMBAT_CAM_CLAMP_FRAC, f1ClampCamFit
};
