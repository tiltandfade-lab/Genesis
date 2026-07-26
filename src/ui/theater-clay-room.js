/* THEATER CLAY ROOM — the ?clayroom=1 dev workbench, extracted VERBATIM from
   src/ui/theater-boot.js in split step B1 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).
   The CLAY-ROOM ADDITIONS BEGIN/END markers below delimit the same region
   dev/verify-clay-room.mjs has always grep-gated — the markers travel with the code.

   OWNERSHIP: every clayRoom-/clay-prefixed S-field namespace entry, the clay DOM panel, its overlay
   groups, pick/movement/lighting/structure benches, and their teardown (clayRoomUnmount).
   State/GPU resources it creates are torn down by its own unmount path; it owns no scheduler
   (the root's dirty-frame scheduler renders; the root's renderTheaterFrame polls
   clayRoomMaybeAutoMount, and setInteriorBoard's tail calls clayRoomAfterInteriorBoardRebuild).

   CTX LAW (recon §7.3 — acyclic imports): this module NEVER imports theater-boot.js. The root
   passes its capabilities ONCE via clayRoomInit(ctx) into the module-local mirrors below, so the
   moved bodies stay byte-identical (same bare identifiers). S is the ONE live theater-state
   record; the root re-syncs the mirror via clayRoomSyncState(S) at both of its
   `S = createTheaterState()` sites (retire/remount) — a stale S here would resurrect a retired
   theater, which the split brief forbids. ITR_ROOM_SHELL stays a ROOT-owned live flag (the
   facade's setRoomShell writes it): the three sites in this region that touched it now go
   through the clayCtxGet/SetRoomShell accessors instead of a stale mirror. */
import * as THREE from "three";
import { playStandeeVerb, bindStandeeCtx, stopIdleBreathe } from "./standee-verbs.js";
import { compileRoomShell, segmentNormal } from "./theater-room-mesh.js";
import { tickTweens } from "./theater-verbs.js";

// ---- root-capability mirrors (wired once by clayRoomInit; S re-synced by clayRoomSyncState) ----
let S;
let clayCtxGetRoomShell, clayCtxSetRoomShell;
let addInteriorContactBlob, addWallContactAO, applyLightProfile, applyPsxCanvasSize, buildFurnitureAssembly;
let buildInteriorBase, buildSpriteBillboard, buildTheaterCtx, clayRoomSetSelectedSprite, clayRoomSetSelectedSpriteView;
let clayRoomSpriteCitizenshipSnapshot, clearGroup, createTheaterState, donorTemplateFor, drainTweens;
let dressingTextureFor, f1BuildCombatGrid, findUnit, interiorBuildInstancedMesh, interiorBuildInteractables;
let interiorBuildLights, interiorBuildMotes, interiorBuildPieces, interiorFloorTopAt, interiorSpriteBillboard;
let interiorStandeeContactY, interiorStandeeSupportMetrics, itrOcclusionClassify, itrPillarCutawayMask, lightFlickerApplySample;
let lightFlickerStep, lightLabApplyTunables, lightLabMaybeAutoMount, lightLabShouldEnable, markDirty;
let mount, mountLightLab, placeCameraTweened, play, renderTheaterFrame;
let retire, rotate, scheduleRender, setBaseGlow, setInteriorBoard;
let setInteriorVariant, spriteAssetPathFor, spriteEntryFor, spriteTextureFor, startLightFlicker;
let startTweenLoop, stopLightFlicker, stopMoteDrift, zoom, BLOOM_LAYER;
let HUMAN_TRUE_HEIGHT, INTERIOR_BASE_HEIGHT, INTERIOR_BASE_TREAD_DEPTH, INTERIOR_CAM_MODE, ITR_DOOR_DEPTH_IN_WALL_DEFAULT;
let ITR_DOOR_MOUNT_ALONG_SHELL, ITR_DOOR_SWING_TWEEN_MS, ITR_SHADOW_FORM_HEMI_FLOOR, LIGHT_LAB_AUTHORED_BASELINE, LIGHT_TUNABLES;
let PSX_RES_SCALE;

export function clayRoomInit(ctx){
  ({ addInteriorContactBlob,
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
    PSX_RES_SCALE } = ctx);
  S = ctx.S;
  clayCtxGetRoomShell = ctx.clayCtxGetRoomShell;
  clayCtxSetRoomShell = ctx.clayCtxSetRoomShell;
}
// The root calls this at BOTH of its `S = createTheaterState()` sites — the mirror must always
// point at the live record, never a retired one.
export function clayRoomSyncState(nextS){ S = nextS; }

/* CLAY-ROOM ADDITIONS BEGIN — docs/C1A-CLAY-ROOM.md (Q12-B wave-12 gate, execution order U1->U2->U3;
   D15 re-wire addendum, 2026-07-23, this unit).
   D2 placement law: appended functions ONLY, plus at most two hook lines total added to the file's
   pre-existing bodies — this file adds exactly ONE (the clayRoomMaybeAutoMount() poll call inside
   renderTheaterFrame, beside lightLabMaybeAutoMount()'s own call, near this file's top). D1 clones
   the Light Lab dormant pattern verbatim (lightLabShouldEnable/lightLabMaybeAutoMount, this file
   ~14089-14110): a URL flag (?clayroom=1) OR a live console-settable GS.clayRoomEnabled, memoized
   once, zero DOM/listeners until the flag actually flips true.

   C1A surfaces below read the frozen record from clayRoomRecordFrom(seed). C1B movement projects
   immutable TacticalQueryKernel range/preview/commit receipts and feeds their exact cells into the
   existing move-step standee verb; this renderer still owns no rules, die resolution, or event
   application (grep-gated by dev/verify-clay-room.mjs check 7). D3: the interior
   (volumetric, perspective-composed) channel
   with the FIXED camera setInteriorBoard already gives it by default (INTERIOR_CAM_MODE==="persp",
   theater-interior.js:205) — this block never calls rotate()/zoom(), so "no rotation, no orbit"
   (W3 law) holds by omission, not a new guard. D5: the default (non-psx) canvas path — mount() is
   called with no `opts`, so S.psxEnabled stays its createTheaterState() default (false) and
   applyPsxCanvasSize's own DPR-capped branch runs unmodified; no new DPR code here.

   D15 RE-WIRE (docs/C1A-CLAY-ROOM.md spec addendum D15): the board-data path is now
   src/engine/clay-room.js's clayRoomBoardFrom(record) — the REAL production compile chain (a pinned
   synthetic walk fixture -> spatializePlan -> interiorBuildBoard), never a hand-assembled
   instances/doorframe/kitDoors/interactables literal (the OLD clayRoomBoardDataFrom shim, deleted
   this unit). mountClayRoom below calls it, then setInteriorBoard(compiled.board) directly — this
   file adds only POST-mount, additive treatment over that PRODUCTION output: the D4 light-profile
   override (clayRoomApplyLightProfile, unchanged), the D2-step-3 flat-grey material swaps
   (clayRoomFlattenFurniture, unchanged; clayRoomFlattenStructure, new — floor/wall/doorframe/pillar),
   the D12a seam grid (clayRoomBuildSeamGrid, unchanged), and D13 provenance tagging/audit (new). The
   door LEAF (a swinging mesh with an open/closed pose) is production's own data.interactables
   consumer (interiorBuildInteractables) fed by bindWalkInteractables in the real trayFrom pipeline —
   a pipeline stage D15 does not name and this unit does not call, so board.interactables stays empty
   (clay-room.js's own clayRoomBoardFrom sets it explicitly) rather than hand-built: the wall APERTURE
   and frame (jambs/header/arch corbels — real interiorBuildBoard output) render; no leaf fills it.
   Reported as a production-pipeline finding in this unit's own build report, never patched from here. */

let CLAY_ROOM_URL_FLAG = null;
// Holds ITR_ROOM_SHELL's pre-mount value across a mount/unmount cycle — see mountClayRoom's own
// header note (the room-shell-compiler finding) for why the restore happens in clayRoomUnmount,
// never immediately after setInteriorBoard.
let CLAY_ROOM_PRIOR_ROOM_SHELL = true;
function clayRoomShouldEnable(){
  try {
    if(typeof window === "undefined") return false;
    if(window.GS && window.GS.clayRoomEnabled === true) return true;
    if(CLAY_ROOM_URL_FLAG === null){
      CLAY_ROOM_URL_FLAG = !!(window.location && window.location.search
        && new URLSearchParams(window.location.search).get("clayroom") === "1");
    }
    return CLAY_ROOM_URL_FLAG;
  } catch(e){}
  return false;
}

const CLAY_ROOM_TRUTH_FIXTURE_ID = "cl-f00-room-truth";
const CLAY_ROOM_STRUCTURE_BENCH_ID = "cl-f01-structure-bench";
const CLAY_ROOM_LIGHTING_BENCH_ID = "cl-f02-lighting-bench";
const CLAY_ROOM_SPRITE_BENCH_ID = "cl-f03-sprite-citizenship";
const CLAY_ROOM_SPRITE_SCALE_MODES = Object.freeze(["true-scale", "diagnostic-cap"]);
const CLAY_ROOM_LIGHT_PREVIEW_SEEDS = Object.freeze(["A", "B", "C"]);
const CLAY_ROOM_LORE_LIGHT_PREVIEWS = Object.freeze([
  Object.freeze({ id: "daylit", label: "SUN · DAY", source: "sunlight" }),
  Object.freeze({ id: "moonlit", label: "MOON · NIGHT", source: "moonlight" }),
  Object.freeze({ id: "magic-glow", label: "MAGIC", source: "arcane crystal" }),
  Object.freeze({ id: "torchlit", label: "FIRE", source: "torch flame" }),
  Object.freeze({ id: "lavalit", label: "LAVA", source: "molten fissure" })
]);
const CLAY_ROOM_LIGHTING_MATRIX_RECIPES = Object.freeze([
  "clay-neutral-truth",
  "clay-opposing-pair",
  "daylit",
  "moonlit",
  "magic-glow",
  "torchlit",
  "lavalit"
]);
function clayRoomFixtureIdFromLocation(){
  try {
    const raw = window.location && window.location.search
      ? new URLSearchParams(window.location.search).get("clayfixture")
      : null;
    if(raw === "room" || raw === CLAY_ROOM_TRUTH_FIXTURE_ID) return CLAY_ROOM_TRUTH_FIXTURE_ID;
    if(raw === "structure" || raw === "structure-bench" || raw === CLAY_ROOM_STRUCTURE_BENCH_ID){
      return CLAY_ROOM_STRUCTURE_BENCH_ID;
    }
    if(raw === "lights" || raw === "lighting-bench" || raw === CLAY_ROOM_LIGHTING_BENCH_ID){
      return CLAY_ROOM_LIGHTING_BENCH_ID;
    }
    if(raw === "sprites" || raw === "sprite-citizenship" || raw === CLAY_ROOM_SPRITE_BENCH_ID){
      return CLAY_ROOM_SPRITE_BENCH_ID;
    }
  } catch(e){}
  // The active reset-ladder checkpoint opens on the fixture under review. Earlier fixtures remain
  // one click away and can be pinned directly with ?clayfixture=room or ?clayfixture=lights.
  return CLAY_ROOM_STRUCTURE_BENCH_ID;
}
function clayRoomMaybeAutoMount(){
  // CL-R0 (docs/CLAYROOM-RESET-LADDER.md): this poll now does ONE thing — mount the surface if the
  // flag is on and it isn't up yet. It used to ALSO reassert the light profile every frame, because
  // production's asynchronous board replays overwrite the mounted scene's lights from outside
  // mountClayRoom(). That per-frame reassert was a patch over the real defect: the clay fixture had
  // no post-rebuild lifecycle hook at all, so it covered lights (which someone noticed) and not
  // materials (which nobody did) — the exact asymmetry that let the dungeon floor come back while
  // the two-temperature profile appeared to hold. Both now reassert together, once per rebuild,
  // from clayRoomAfterInteriorBoardRebuild() at setInteriorBoard's own tail.
  if(S.clayRoomMounted) return;
  if(!clayRoomShouldEnable()) return;
  mountClayRoom();
}

// D7/D2 step 3 — flat, untextured clay-grey, swapped onto ALREADY-BUILT PRODUCTION geometry
// post-mount (never a hand-assembled instance array — see this region's own D15 header note above
// for why that path is gone). No hand-derived wall-height/door-height/edge-offset constants remain
// here: those numbers now come from the REAL spatializer + interiorBuildBoard chain
// (src/engine/clay-room.js's clayRoomBoardFrom), never re-authored in this file.
// CL-R0: the COLOUR and the per-role ROUTE are no longer decided here at all — they come from
// CLAY_DIAGNOSTIC_SURFACE_RECIPE (src/engine/clay-room.js), read at CALL time inside the clay
// functions, never at module-eval time. That timing matters: several harnesses legitimately load
// theater-boot.js on its own, without the engine module, and a top-level read of a callTimeDep
// throws ReferenceError before a single test runs (caught by the full verify sweep the moment this
// was written as a module-scope const — dev/verify-agx-tonecurve.mjs and friends went red with
// "CLAY_DIAGNOSTIC_SURFACE_RECIPE is not defined"). manifest.json declares the module as a
// callTimeDep precisely because that is the contract: call time, not load time.

// D4 / CL-R1 — the authored ambient remains a scene-level light, but the opposing point pair now
// arrives through board.lights -> interiorBuildLights, the real production practical path. This hook
// therefore removes only applyLightProfile's unrelated tabletop/profile points and installs the
// authored 0.18 ambient. It is idempotent: a geometry/door rebuild that preserved the lighting
// identity returns without replacing a light object, material, or scheduler.
function clayRoomApplyLightProfile(record){
  if(!S.scene) return;
  const recipeId = S.clayRoomLightRecipeId
    || (S.clayRoomCompiled && S.clayRoomCompiled.lightRecipeId)
    || "clay-opposing-pair";
  const recipe = LIGHT_TUNABLES.profiles[recipeId] || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
  const profile = lightRecipeLegacyProfile(recipe);
  const ambientIsAuthored = !!(S.ambientLight && S.ambientLight.userData
    && S.ambientLight.userData.clayLightId === "clay-ambient");
  const hasForeignProfilePoints = !!(S.pointLights && S.pointLights.length);
  if(!ambientIsAuthored){
    if(S.ambientLight) S.scene.remove(S.ambientLight);
    const ambient = new THREE.AmbientLight(profile.ambient.color, profile.ambient.intensity);
    ambient.userData.clayLightId = "clay-ambient";
    ambient.userData.clayLightRecipeId = recipe.id;
    S.scene.add(ambient);
    S.ambientLight = ambient;
  } else {
    S.ambientLight.color.setHex(profile.ambient.color);
    S.ambientLight.intensity = profile.ambient.intensity;
    S.ambientLight.userData.clayLightRecipeId = recipe.id;
  }
  if(hasForeignProfilePoints){
    // The old scheduler captured these exact profile point objects/bases. Stop it at the ownership
    // boundary before removing them, then bind the local-state scheduler to production practicals.
    stopLightFlicker();
    S.pointLights.forEach(function(l){ S.scene.remove(l); });
    S.pointLights = [];
    startLightFlicker(0, S.interiorLightTargets || []);
  }
  // Diagnostic modes still remove uncredited camera/key lights, but retain the low hemisphere
  // shadow-form floor: it is environment bounce, not a second subject light, and keeps tread/riser
  // orientation barely legible.
  if(recipe.mode.indexOf("diagnostic-") === 0){
    if(S.hemiLight) S.hemiLight.intensity = ITR_SHADOW_FORM_HEMI_FLOOR;
    [S.keyLight, S.fillLight, S.interiorCameraKey].forEach(function(light){
      if(light) light.intensity = 0;
    });
  }
  if(!S.clayRoomLightingBaseline && (S.interiorLightTargets || []).length){
    S.clayRoomLightingBaseline = clayRoomLightingSnapshot("authored-baseline");
  }
}

function clayRoomSetLightingRecipe(recipeId, reason){
  if(!S.clayRoomRecord || !LIGHT_TUNABLES.profiles[recipeId]) return false;
  S.clayRoomPixelMetricsCache = null;
  const recipe = lightRecipeDeepClone(LIGHT_TUNABLES.profiles[recipeId]);
  // Seed preview is a disposable clone-time input, never a mutation of LIGHT_TUNABLES or the
  // authored lock. Static sun/moon recipes are unchanged; licensed flicker recipes replay a
  // different deterministic target sequence while preserving every physical value.
  const previewSeed = S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
  (recipe.lights || []).forEach(function(light){
    if(!light.flicker || !(Number(light.flicker.amplitude) > 0)) return;
    const authoredSeed = light.flicker.seed || (recipe.id + ":" + light.id);
    light.flicker.seed = authoredSeed + ":clay-preview-" + previewSeed;
  });
  const validation = lightRecipeValidate(recipe);
  if(!validation.ok){
    try { console.warn("qa: rejected invalid Clayroom lighting recipe", recipeId, validation.errors); } catch(e){}
    return false;
  }
  const compiled = clayRoomBoardFrom(S.clayRoomRecord, {
    lightRecipeId: recipeId,
    lightRecipe: recipe
  });
  S.clayRoomCompiled = compiled;
  S.clayRoomLightRecipeId = recipeId;
  S.clayRoomLightingBaseline = null;
  S.boardKey = null;
  const session = clayRoomMovementSession();
  setInteriorBoard(
    (session && clayRoomMovementBoardFromState(session.state)) || compiled.board,
    { roomTransition: false, reason: reason || "clayroom-light-recipe" }
  );
  // A recipe change is the one rebuild that SHOULD replace lighting identity. Do not present that
  // expected replacement as a lifecycle failure in the same readout used for geometry-only replays.
  S.clayRoomLightingProbeToken = (S.clayRoomLightingProbeToken || 0) + 1;
  S.clayRoomLightingProbe = {
    label: "recipe switch → " + recipeId,
    expectedReplacement: true,
    preserved: false,
    duringPass: true,
    afterPass: true
  };
  if(typeof S.clayRoomRefreshLightCatalog === "function") S.clayRoomRefreshLightCatalog();
  if(typeof S.clayRoomRefreshLights === "function") S.clayRoomRefreshLights();
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}

function clayRoomSetFixture(fixtureId, reason){
  if(fixtureId !== CLAY_ROOM_TRUTH_FIXTURE_ID
    && fixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID
    && fixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID
    && fixtureId !== CLAY_ROOM_SPRITE_BENCH_ID){
    return false;
  }
  if(!S.clayRoomCompiled || !S.clayRoomRecord) return false;
  S.clayRoomFixtureId = fixtureId;
  S.clayCamOffset = { x: 0, z: 0 };
  S.clayCamZoom = fixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
    ? 0.72 : (fixtureId === CLAY_ROOM_SPRITE_BENCH_ID ? 0.9
      : (fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID ? 0.65 : 1));
  S.boardKey = null;
  const session = clayRoomMovementSession();
  const board = (session && clayRoomMovementBoardFromState(session.state)) || S.clayRoomCompiled.board;
  setInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-fixture-switch" });
  if(fixtureId === CLAY_ROOM_TRUTH_FIXTURE_ID) clayRoomMovementRangesRender();
  else clayRoomDisposeMovementOverlay();
  if(typeof S.clayRoomRefreshFixtureControls === "function") S.clayRoomRefreshFixtureControls();
  if(typeof S.clayRoomWorkbenchSelect === "function"){
    const roomOnlySelected = S.clayRoomSelectedId === S.clayRoomRecord.portal.id
      || S.clayRoomSelectedId === S.clayRoomRecord.object.id;
    if((fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      || fixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      || fixtureId === CLAY_ROOM_SPRITE_BENCH_ID) && roomOnlySelected){
      const recipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId];
      const light = recipe && (recipe.lights || []).find(function(row){ return row.enabled !== false; });
      if(light) S.clayRoomWorkbenchSelect(light.id, "fixture switch");
    }
    if(fixtureId === CLAY_ROOM_SPRITE_BENCH_ID){
      const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
      S.clayRoomSelectedSpriteSlug = S.clayRoomSelectedSpriteSlug || fixture.selectedSlug;
      S.clayRoomWorkbenchSelect(S.clayRoomSelectedSpriteSlug, "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("sprites");
    }
    if(fixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID){
      S.clayRoomSelectedId = "compiled-shell";
      S.clayRoomWorkbenchSelect("compiled-shell", "fixture switch");
      if(typeof S.clayRoomShowTab === "function") S.clayRoomShowTab("structure");
    }
  }
  if(typeof S.clayRoomRefreshLights === "function") S.clayRoomRefreshLights();
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  return true;
}

function clayRoomSetSpriteScaleMode(mode, reason){
  if(CLAY_ROOM_SPRITE_SCALE_MODES.indexOf(mode) < 0) return false;
  if(S.clayRoomSpriteScaleMode === mode) return true;
  S.clayRoomSpriteScaleMode = mode;
  if(S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID) return true;
  S.boardKey = null;
  const session = clayRoomMovementSession();
  const board = session && clayRoomMovementBoardFromState(session.state);
  if(board) setInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-sprite-scale-mode" });
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
  return true;
}

function clayRoomLightingSnapshot(label){
  function n(v){ return Number.isFinite(v) ? +v.toFixed(6) : null; }
  function colorOf(light){
    return light && light.color && typeof light.color.getHex === "function" ? light.color.getHex() : null;
  }
  function rigLight(light){
    return light ? { uuid: light.uuid, intensity: n(light.intensity), color: colorOf(light) } : null;
  }
  const targets = (S.interiorLightTargets || []).map(function(t){
    const emitted = t.pl ? t.pl.intensity : null;
    const mesh = t.marker && t.marker.material
      ? (t.emissiveFlicker ? t.marker.material.emissiveIntensity : t.marker.material.opacity)
      : null;
    const baseMesh = t.emissiveFlicker ? t.baseEmissiveIntensity : t.baseOpacity;
    const emittedNormalized = t.baseIntensity ? emitted / t.baseIntensity : null;
    const meshNormalized = baseMesh ? mesh / baseMesh : null;
    // WORLD position — the readout's mounted-truth line must name where the light actually sits
    // in the room, not its local offset inside a fixture group (Checkpoint 2 readout truth).
    const pointPosition = (function(){
      if(!t.pl || !t.pl.getWorldPosition) return null;
      const wp = new THREE.Vector3();
      t.pl.getWorldPosition(wp);
      return [n(wp.x), n(wp.y), n(wp.z)];
    })();
    const emitterPosition = t.marker && t.marker.position
      ? [n(t.marker.position.x), n(t.marker.position.y), n(t.marker.position.z)]
      : null;
    const direction = t.directionSample || { x: 0, y: 0, z: 0 };
    const directionRadius = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y + direction.z * direction.z
    );
    const directionAmplitude = Number(t.directionAmplitude) || 0;
    return {
      id: t.id,
      sourceRef: t.sourceRef,
      state: t.state,
      sampleIndex: t.sampleIndex || 0,
      normalizedSample: n(t.normalizedSample),
      emitted: n(emitted),
      emittedBase: n(t.baseIntensity),
      emittedNormalized: n(emittedNormalized),
      mesh: n(mesh),
      meshBase: n(baseMesh),
      meshNormalized: n(meshNormalized),
      parity: emittedNormalized != null && meshNormalized != null
        ? Math.abs(emittedNormalized - meshNormalized) < 0.000001
        : false,
      pointUuid: t.pl ? t.pl.uuid : null,
      emitterUuid: t.marker ? t.marker.uuid : null,
      materialUuid: t.marker && t.marker.material ? t.marker.material.uuid : null,
      color: colorOf(t.pl),
      distance: t.pl ? n(t.pl.distance) : null,
      decay: t.pl ? n(t.pl.decay) : null,
      castShadow: t.pl ? !!t.pl.castShadow : null,
      shadowMapSize: t.pl && t.pl.shadow && t.pl.shadow.mapSize
        ? [n(t.pl.shadow.mapSize.x), n(t.pl.shadow.mapSize.y)]
        : null,
      shadowCameraFar: t.pl && t.pl.shadow && t.pl.shadow.camera
        ? n(t.pl.shadow.camera.far)
        : null,
      pointPosition: pointPosition,
      emitterPosition: emitterPosition,
      celestial: t.pl && t.pl.userData && t.pl.userData.celestial ? t.pl.userData.celestial : null,
      basePointPosition: t.basePointPosition
        ? [n(t.basePointPosition.x), n(t.basePointPosition.y), n(t.basePointPosition.z)]
        : null,
      baseEmitterPosition: t.baseMarkerPosition
        ? [n(t.baseMarkerPosition.x), n(t.baseMarkerPosition.y), n(t.baseMarkerPosition.z)]
        : null,
      directionSample: { x: n(direction.x), y: n(direction.y), z: n(direction.z) },
      directionAmplitude: n(directionAmplitude),
      directionWithinBounds: directionAmplitude === 0
        ? directionRadius < 0.000001
        : directionRadius <= directionAmplitude * 1.05,
      coLocated: !!pointPosition && !!emitterPosition
        && pointPosition.every(function(value, index){
          return Math.abs(value - emitterPosition[index]) < 0.000001;
        }),
      cadenceMs: t.cadenceMs,
      intervalJitter: n(t.intervalJitter),
      lastIntervalMs: t.lastIntervalMs == null ? null : n(t.lastIntervalMs),
      nextIntervalMs: t.nextIntervalMs == null ? null : n(t.nextIntervalMs),
      materialColor: t.marker && t.marker.material && t.marker.material.color
        ? t.marker.material.color.getHex()
        : null,
      materialEmissive: t.marker && t.marker.material && t.marker.material.emissive
        ? t.marker.material.emissive.getHex()
        : null,
      materialOpacity: t.marker && t.marker.material ? n(t.marker.material.opacity) : null,
    };
  });
  return {
    label: label || "",
    at: Date.now(),
    ambient: S.ambientLight ? {
      uuid: S.ambientLight.uuid,
      intensity: n(S.ambientLight.intensity),
      color: colorOf(S.ambientLight),
    } : null,
    rig: {
      hemi: rigLight(S.hemiLight),
      key: rigLight(S.keyLight),
      fill: rigLight(S.fillLight),
      cameraKey: rigLight(S.interiorCameraKey),
    },
    lights: targets,
  };
}

function clayRoomLightingSnapshotsMatch(before, after){
  if(!before || !after || !before.ambient || !after.ambient) return false;
  if(before.ambient.uuid !== after.ambient.uuid
    || before.ambient.intensity !== after.ambient.intensity
    || before.ambient.color !== after.ambient.color
    || JSON.stringify(before.rig) !== JSON.stringify(after.rig)) return false;
  if(before.lights.length !== after.lights.length) return false;
  return before.lights.every(function(b){
    const a = after.lights.find(function(row){ return row.id === b.id; });
    if(!a || a.pointUuid !== b.pointUuid || a.emitterUuid !== b.emitterUuid
      || a.materialUuid !== b.materialUuid || a.color !== b.color || a.state !== b.state
      || a.distance !== b.distance || a.decay !== b.decay
      || a.castShadow !== b.castShadow || a.shadowCameraFar !== b.shadowCameraFar
      || JSON.stringify(a.shadowMapSize) !== JSON.stringify(b.shadowMapSize)
      || JSON.stringify(a.basePointPosition) !== JSON.stringify(b.basePointPosition)
      || JSON.stringify(a.baseEmitterPosition) !== JSON.stringify(b.baseEmitterPosition)
      || a.directionAmplitude !== b.directionAmplitude
      || a.cadenceMs !== b.cadenceMs || a.intervalJitter !== b.intervalJitter
      || a.materialColor !== b.materialColor || a.materialEmissive !== b.materialEmissive
      || a.materialOpacity !== b.materialOpacity || !a.parity
      || !a.coLocated || !a.directionWithinBounds) return false;
    // Flickering is allowed to move by definition; steady means byte-stable photometric + visible.
    if(a.state === "steady"){
      return a.emitted === b.emitted && a.mesh === b.mesh
        && a.emittedNormalized === 1 && a.meshNormalized === 1
        && JSON.stringify(a.pointPosition) === JSON.stringify(b.pointPosition)
        && JSON.stringify(a.emitterPosition) === JSON.stringify(b.emitterPosition);
    }
    return true;
  });
}

function clayRoomRecordLightingProbe(label, before, preserved){
  const during = clayRoomLightingSnapshot("during-animation");
  const token = (S.clayRoomLightingProbeToken || 0) + 1;
  S.clayRoomLightingProbeToken = token;
  S.clayRoomLightingProbe = {
    label: label,
    preserved: !!preserved,
    before: before,
    during: during,
    after: null,
    duringPass: !!preserved && clayRoomLightingSnapshotsMatch(before, during),
    afterPass: null,
  };
  setTimeout(function(){
    if(!S.clayRoomDiagnosticActive || S.clayRoomLightingProbeToken !== token) return;
    const after = clayRoomLightingSnapshot("after-animation");
    S.clayRoomLightingProbe.after = after;
    S.clayRoomLightingProbe.afterPass = clayRoomLightingSnapshotsMatch(before, after);
  }, 900);
}

function clayRoomSetLightState(lightId, nextState){
  const target = (S.interiorLightTargets || []).find(function(t){ return t && t.id === lightId; });
  if(!target) return false;
  target.state = nextState === "flickering" ? "flickering" : "steady";
  target.sampleIndex = 0;
  target.normalizedSample = 1;
  if(target.pl) target.pl.userData.lightState = target.state;
  if(target.marker) target.marker.userData.lightState = target.state;
  if(target.pl && target.pl.parent && target.pl.parent.userData){
    target.pl.parent.userData.lightState = target.state;
  }
  if(target.state === "steady") lightFlickerApplySample(target, 1);
  startLightFlicker(0, S.interiorLightTargets || []);
  markDirty();
  return true;
}

function clayRoomRestoreAuthoredLightBaseline(){
  const recipeId = S.clayRoomLightRecipeId || "clay-opposing-pair";
  const authoredRecipe = LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId] || null;
  if(LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId]){
    LIGHT_TUNABLES.profiles[recipeId] = lightRecipeDeepClone(
      LIGHT_LAB_AUTHORED_BASELINE.profiles[recipeId]
    );
    clayRoomSetLightingRecipe(recipeId, "clayroom-authored-baseline");
  }
  (S.interiorLightTargets || []).forEach(function(t){
    const authoredLight = authoredRecipe && (authoredRecipe.lights || []).find(function(light){
      return light.id === t.id;
    });
    t.state = authoredLight && authoredLight.state === "flickering" ? "flickering" : "steady";
    t.sampleIndex = 0;
    lightFlickerApplySample(t, 1);
  });
  startLightFlicker(0, S.interiorLightTargets || []);
  markDirty();
}

/* ─── CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — THE DIAGNOSTIC SURFACE ROUTE ────────────────────────
   Replaces clayRoomFlattenFurniture + clayRoomFlattenStructure (both deleted this unit). Those were
   two hand-written sweeps over a hardcoded four-kind whitelist, run ONCE from mountClayRoom(). Two
   independent defects followed, both measured live in the CL-R0 "before" capture
   (dev/clay-captures/cl-r0/before-receipt.json):

     1. NOT DURABLE. setInteriorBoard is re-entered from at least five asynchronous production
        replay sites OUTSIDE mountClayRoom() — spriteTextureFor's texture settle (this file ~3078),
        donorTemplateFor's GLTF settle (~4029), dressingTextureFor's real-art settle (~9167/9177),
        the module-scope post-load whole-object replay (~12524), and setInteriorVariant/
        lightLabApplyTunables (~11752/~13992). Each one rebuilds S.interiorGroup with production
        materials. The old sweeps never ran again, so the settled frame showed the realm's own
        textured floor/wall/doorframe: Adam's "It seems to have basic dungeon floor glued to it."
        Measured: floor region meanSaturation 175.4, neutralPct 0.00% — not one neutral pixel.
     2. NOT COMPLETE. The whitelist named floor/wall/doorframe/pillar. skirt, portal, every
        room-shell/kit-shell kind, and every future kind were never claimed at all.

   The repair is a single recipe-driven pass invoked from ONE post-rebuild lifecycle hook
   (clayRoomAfterInteriorBoardRebuild, at setInteriorBoard's own tail) so every rebuild path —
   present and future — routes through it. It swaps materials on already-built PRODUCTION geometry;
   it builds no geometry, forks no renderer, and holds no per-seed special case.

   INSTANCE COLOUR. interiorBuildInstancedMesh tints each instance via setColorAt (this file ~8103/
   ~8156), and THREE multiplies instanceColor into the material colour. Swapping the material alone
   therefore does NOT produce flat clay — it produces clay tinted by the kit's per-cell palette,
   which is why the fixture never looked uniform even before a replay landed. Claimed instanced
   meshes get every instance colour written to white so the multiply is identity; the census records
   `instanceColorNeutralized` so that fact is data, not a silent mutation. */
const CLAY_DIAGNOSTIC_MATERIALS = {};   // "#rrggbb" -> shared MeshLambertMaterial (flat, no map)
function clayDiagnosticMaterialFor(hex){
  if(!CLAY_DIAGNOSTIC_MATERIALS[hex]){
    CLAY_DIAGNOSTIC_MATERIALS[hex] = new THREE.MeshLambertMaterial({ color: hex });
  }
  return CLAY_DIAGNOSTIC_MATERIALS[hex];
}

// The active diagnostic mode ("clay" | "role-id"), resolved ONCE from ?claysurface= (or a live
// GS.clayRoomSurfaceMode) through the engine module's own reader so no second spelling exists.
let CLAY_SURFACE_MODE = null;
function clayRoomSurfaceMode(){
  if(CLAY_SURFACE_MODE === null){
    let raw = null;
    try {
      if(typeof window !== "undefined"){
        if(window.GS && window.GS.clayRoomSurfaceMode) raw = window.GS.clayRoomSurfaceMode;
        else if(window.location && window.location.search){
          raw = new URLSearchParams(window.location.search).get("claysurface");
        }
      }
    } catch(e){}
    CLAY_SURFACE_MODE = clayDiagnosticModeFrom(raw);
  }
  return CLAY_SURFACE_MODE;
}

/* clayRoomSurfaceRoleFor(node, ancestorRole) -> a recipe role or null. Resolves ONE scene node
   against the renderer's own existing ownership tags, in the order production actually stamps them.
   No new tagging is introduced: every branch reads a userData field some production builder already
   writes, which is why this doubles as an honest provenance answer rather than a parallel registry.

   `ancestorRole` carries a role down a sub-tree (a furniture assembly's prisms, a sprite
   billboard's plane) so a child mesh inherits its assembly's ownership instead of reading as
   unclaimed. */
function clayRoomSurfaceRoleFor(node, ancestorRole){
  if(!node) return ancestorRole || null;
  const ud = node.userData || {};
  const byKind = clayDiagnosticRoleForKind(ud.interiorKind);           // interiorBuildInstancedMesh / room-shell / kit-shell
  if(byKind) return byKind;
  // recipe v2: the standee support strip is its OWN surface under test (clay-routed so cast
  // shadows/AO read on it) — resolved BEFORE the sprite ancestor role can sweep it into passthrough
  if(ud.standeeBase) return "standee-base";                            // buildInteriorBase (~3852)
  if(ud.furnitureKind) return "furniture";                             // buildFurnitureAssembly (~9278)
  if(ud.spriteSlug) return "sprite";                                   // buildSpriteBillboard (~3180)
  if(ud.isDoorLeaf || ud.isDoorShard) return "door";                   // hinged leaf / broken shard
  if(ud.kind === "interactable" && ud.archetype === "door") return "door";
  if(ud.contactBlob || ud.wallContactAO) return "contact-shadow";      // addInteriorContactBlob / addWallContactAO
  if(ud.motePiece) return "mote";                                      // interiorBuildMotes
  if(ud.fixtureId || ud.emitter || ud.isLightEmitter) return "emitter"; // practical light bodies
  return ancestorRole || null;
}

/* clayRoomWalkSurfaces(visit) — one shared traversal, carrying the resolved role down each branch.
   Both the route application and the read-only census run through it, so what the census reports is
   by construction what the route saw.

   SCOPE (widened during CL-R0's own capture review): the walk starts at S.scene, not at
   S.interiorGroup. The first routed capture still showed one dark, red-mottled textured panel
   standing in the room while the census reported every surface flat and claimed — because that panel
   was mounted OUTSIDE S.interiorGroup and the census simply never looked at it. A provenance answer
   scoped to one group cannot honour CL-R0's requirement to say which system owns *every visible*
   surface; a surface the census cannot see is exactly the surface that reintroduces site material.
   `visit` receives the owning top-level group name so a foreign mount is attributable, not anonymous. */
function clayRoomSceneGroupNameFor(node){
  if(node === S.interiorGroup) return "interiorGroup";
  if(node === S.tileGroup) return "tileGroup";
  if(node === S.propGroup) return "propGroup";
  if(node === S.unitGroup) return "unitGroup";
  if(node === S.shadowGroup) return "shadowGroup";
  if(node === S.fxGroup) return "fxGroup";
  if(node === S.moteGroup) return "moteGroup";
  return null;
}
function clayRoomWalkSurfaces(visit){
  const root = S.scene || S.interiorGroup;
  if(!root) return;
  (function walk(node, ancestorRole, groupName){
    const g = clayRoomSceneGroupNameFor(node) || groupName;
    const role = clayRoomSurfaceRoleFor(node, ancestorRole);
    if(node.isMesh || node.isInstancedMesh) visit(node, role, g || "scene-direct");
    (node.children || []).forEach(function(child){ walk(child, role, g); });
  })(root, null, null);
}

/* clayRoomApplyDiagnosticSurfaces() — execute CLAY_DIAGNOSTIC_SURFACE_RECIPE over the mounted tree.
   Idempotent: safe to run after every rebuild, and a second run over an already-routed tree is a
   no-op assignment. Returns the count of surfaces it claimed, for the mount log. */
function clayRoomApplyDiagnosticSurfaces(){
  if(!S.scene && !S.interiorGroup) return 0;
  const mode = clayRoomSurfaceMode();
  let claimed = 0;
  clayRoomWalkSurfaces(function(mesh, role, groupName){
    // The seam grid is the diagnostic's own instrument, not a surface under test. It carries its own
    // recipe-owned colour (gridColor/gridOpacity) and must not be repainted by the role route.
    if(mesh.userData && mesh.userData.clayGrid) return;
    const decision = clayDiagnosticRouteFor(role, mode);
    if(decision.route === "passthrough") return;   // sprite art / emitter body / door state colour
    // "unclaimed" lands here too, deliberately: it is painted the loud UNCLAIMED colour rather than
    // left carrying whatever site material production gave it. A kind this recipe has never heard of
    // must be visible as a hole in the recipe, never as plausible-looking dungeon stone.
    //
    // FADE-AWARE SWAP (found live 2026-07-23, the ?clayshell=1 A/B): the room-shell wall-upper meshes
    // carry per-segment cloned materials whose OPACITY is mutated between rebuilds by the cutaway
    // tween (itrOcclusionClassify's fadeEntry.materials — see the wall-upper build site ~11378). A
    // naive `mesh.material = shared` swap severs that linkage: the probe showed the camera-side
    // suppression correctly classifying the two near walls as blocking and tweening THEIR OLD
    // materials to opacity 0.08 while the mesh rendered the shared clay material at 1.0 — opaque dark
    // slabs, the cutaway visibly "not working" while its state machine ran perfectly. So: if the
    // material being replaced is referenced by any live fade entry, the clay material is CLONED per
    // mesh (a shared material can't hold per-segment opacity), given the entry's CURRENT opacity +
    // transparent flag, and the entry's materials array is re-pointed at the clone — the tween keeps
    // driving the exact material the mesh renders, before and after every clay re-route.
    const priorMat = (mesh.material && !Array.isArray(mesh.material)) ? mesh.material : null;
    let fadeEntry = null;
    if(priorMat && S.occlusionFadeState){
      S.occlusionFadeState.forEach(function(e){
        if(!fadeEntry && e.materials && e.materials.indexOf(priorMat) >= 0) fadeEntry = e;
      });
    }
    if(fadeEntry){
      const clayMat = clayDiagnosticMaterialFor(decision.color).clone();
      clayMat.transparent = true;
      clayMat.opacity = (typeof fadeEntry.opacity === "number") ? fadeEntry.opacity : 1;
      mesh.material = clayMat;
      fadeEntry.materials = fadeEntry.materials.map(function(m){ return m === priorMat ? clayMat : m; });
    } else if(mesh.userData && mesh.userData.standeeBase){
      // recipe v2: the standee base swaps to clay like any surface under test, but as a PER-MESH
      // CLONE — setBaseGlow/selection write emissive straight onto this mesh's material, and a
      // shared clay material would light every clay surface in the room when one base glows.
      // The base geometry uses material GROUPS (top/side/bevel), so mirror its array shape.
      const baseClay = clayDiagnosticMaterialFor(decision.color);
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(function(){ return baseClay.clone(); })
        : baseClay.clone();
    } else {
      mesh.material = clayDiagnosticMaterialFor(decision.color);
    }
    if(mesh.isInstancedMesh && mesh.instanceColor){
      const white = new THREE.Color(1, 1, 1);
      for(let i = 0; i < mesh.count; i++) mesh.setColorAt(i, white);
      mesh.instanceColor.needsUpdate = true;
      mesh.userData.clayInstanceColorNeutralized = true;
    }
    mesh.userData.clayRoute = decision.route;
    mesh.userData.clayRole = decision.role;
    mesh.userData.clayGroup = groupName;
    claimed++;
  });
  return claimed;
}

/* clayRoomSurfaceCensus() -> the CL-R0 provenance answer: for every visible surface in the fixture,
   which builder owns it, which recipe route claimed it, and whether a colour texture is still bound.
   Read-only. This is the debug output the reset ladder requires ("tell which system owns every
   visible surface") and the shape the executable invariant asserts over:

     texturedClayCount   surfaces the recipe routed to diagnostic-clay that STILL carry a map.
                         Must be 0. A non-zero value is exactly the CR-1 regression returning.
     unclaimed           surfaces no recipe role matched. Must be 0 in an accepted fixture. */
function clayRoomSurfaceCensus(){
  const surfaces = [], unclaimed = [];
  const mode = clayRoomSurfaceMode();
  let texturedClayCount = 0;
  clayRoomWalkSurfaces(function(mesh, role, groupName){
    if(mesh.userData && mesh.userData.clayGrid) return; // the diagnostic's own instrument, not a surface under test
    const decision = clayDiagnosticRouteFor(role, mode);
    const mat = (mesh.material && !Array.isArray(mesh.material)) ? mesh.material : null;
    const textured = !!(mat && mat.map);
    // CR-6's lesson made permanent (the seam grid audited "owned" while rendering 13 cells away, and
    // the door tranche found the leaf owned-but-perpendicular): provenance without PLACEMENT is half
    // an answer. Every census row now carries the mesh's world position and its geometry's local
    // bounding size, computed without importing THREE into this diagnostic (the Vector3 comes from
    // position.constructor — the instance's own class).
    let worldPos = null, size = null;
    try {
      const v = new mesh.position.constructor();
      mesh.getWorldPosition(v);
      worldPos = [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
      if(mesh.geometry){
        if(!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox;
        if(bb){
          size = [+(bb.max.x - bb.min.x).toFixed(3), +(bb.max.y - bb.min.y).toFixed(3), +(bb.max.z - bb.min.z).toFixed(3)];
          // world centre of the geometry's own bb (translate-only — exact for the unrotated shell/
          // instanced meshes this exists to locate; a rotated mesh's pos field is already honest).
          worldPos = [+(worldPos[0] + (bb.min.x + bb.max.x) / 2).toFixed(3),
                      +(worldPos[1] + (bb.min.y + bb.max.y) / 2).toFixed(3),
                      +(worldPos[2] + (bb.min.z + bb.max.z) / 2).toFixed(3)];
        }
      }
    } catch(e){}
    const row = {
      role: decision.role,
      route: decision.route,
      group: groupName,
      pos: worldPos,
      size: size,
      rotY: +((mesh.rotation && mesh.rotation.y) || 0).toFixed(3),
      builder: (mesh.userData && mesh.userData.interiorKind) ? "interiorBuildInstancedMesh/" + mesh.userData.interiorKind
        : (mesh.userData && mesh.userData.spriteSlug) ? "buildSpriteBillboard"
        : (mesh.userData && mesh.userData.furnitureKind) ? "buildFurnitureAssembly"
        : (mesh.userData && (mesh.userData.isDoorLeaf || mesh.userData.archetype === "door")) ? "interiorBuildInteractables"
        : "unattributed",
      instances: mesh.isInstancedMesh ? mesh.count : 1,
      textured: textured,
      colorHex: (mat && mat.color) ? "#" + mat.color.getHexString() : null,
      instanceColorNeutralized: !!(mesh.userData && mesh.userData.clayInstanceColorNeutralized),
    };
    if(decision.route === "diagnostic-clay" && textured) texturedClayCount++;
    if(decision.route === "unclaimed") unclaimed.push(row);
    surfaces.push(row);
  });
  return {
    recipe: { id: CLAY_DIAGNOSTIC_SURFACE_RECIPE.id, version: CLAY_DIAGNOSTIC_SURFACE_RECIPE.version, mode: mode },
    surfaces: surfaces,
    unclaimed: unclaimed,
    texturedClayCount: texturedClayCount,
  };
}

/* CL-F01 structure bench — the production room-shell compiler owns the continuous floor, exposed
   slab sides, wall volumes/caps, corners, aperture, threshold, and retaining/riser runs. Generic
   structure-part assemblers own the remaining catalog atoms. All meshes remain in the same scene,
   camera, lights, shadows, tone map, and diagnostic-surface router as gameplay. */
function clayStructureMaterial(color){
  return new THREE.MeshStandardMaterial({
    color: color || CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
    roughness: 0.96,
    metalness: 0
  });
}
function clayStructureTag(mesh, specId, kind){
  mesh.castShadow = kind !== "floor";
  mesh.receiveShadow = true;
  mesh.userData.interiorKind = kind;
  mesh.userData.structureCatalogId = CLAY_STRUCTURE_KIT_CATALOG.id;
  mesh.userData.structureCatalogVersion = CLAY_STRUCTURE_KIT_CATALOG.version;
  mesh.userData.structureSpecId = specId;
  mesh.userData.structureProvenance = CLAY_STRUCTURE_KIT_CATALOG.provenance;
  return mesh;
}
function clayStructureRampGeometry(width, run, rise){
  const hw = width / 2, hr = run / 2;
  const vertices = new Float32Array([
    -hw, 0, -hr,   hw, 0, -hr,   -hw, rise, hr,   hw, rise, hr,
    -hw, 0, hr,    hw, 0, hr
  ]);
  const indices = [
    0, 1, 3, 0, 3, 2,       // walk surface
    0, 4, 5, 0, 5, 1,       // underside
    4, 2, 3, 4, 3, 5,       // high face
    0, 2, 4,                 // left
    1, 5, 3                  // right
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  // Checkpoint 4 (Adam's diagnosis: "the ramp ... looks inflated or pillow-like instead of
  // planar"): indexed shared vertices average normals across the wedge's hard faces. Drop the
  // index so computeVertexNormals produces true per-face normals — a crisp planar wedge.
  const hardFaced = geometry.toNonIndexed();
  hardFaced.computeVertexNormals();
  return hardFaced;
}
function clayStructureStripBetween(a, b, color, view, specId, thickness){
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.max(0.001, Math.hypot(dx, dz));
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(len, thickness || 0.035, (thickness || 0.035) * 1.45),
    new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, toneMapped: false })
  );
  mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.interiorKind = "clay-diagnostic-overlay";
  mesh.userData.structureOverlayView = view;
  mesh.userData.structureSpecId = specId;
  mesh.renderOrder = 72;
  return mesh;
}
// Checkpoint 4 SOCKET TRUTH ("socket marks do not communicate type, facing direction, polarity/
// ownership, or valid candidate pairing"): every socket now draws a TYPE-COLOURED ARROW along its
// actual authored axis — shaft plus angled head, so direction and polarity read from the frame.
// Omnidirectional sockets (floor-mount/top-surface, axis 0/0) draw a type-coloured cross at their
// face. The colour vocabulary is fixed and matches the panel legend.
const CLAY_SOCKET_TYPE_COLORS = {
  "butt-join-n": 0x35d8ff, "butt-join-e": 0x35d8ff, "butt-join-s": 0x35d8ff, "butt-join-w": 0x35d8ff,
  "walk-surface": 0x66dfa0, "top-surface": 0x6f8fff, "terrain-join": 0xc08a5a,
  "hinge": 0xff7ad8, "catch": 0xffe066, "floor-mount": 0xb9c2cc, "wall-mount": 0xb9c2cc,
};
function clayStructureAddSocketOverlay(group, spec, rawFloor, origin){
  const at = spec.at;
  const lift = spec.lift || 0;
  (spec.sockets || []).forEach(function(socket, index){
    const axis = socket.axis || { x: 0, z: 0 };
    const color = CLAY_SOCKET_TYPE_COLORS[socket.type] != null ? CLAY_SOCKET_TYPE_COLORS[socket.type] : 0x35d8ff;
    const spread = (index - ((spec.sockets.length - 1) / 2)) * 0.13;
    const x = at.x - origin.cx + (axis.x || 0) * 0.45 + (axis.z || 0) * spread;
    const z = at.z - origin.cz + (axis.z || 0) * 0.45 - (axis.x || 0) * spread;
    const y = rawFloor + lift + (socket.type === "top-surface" ? (spec.height || spec.rise || 0.5) + 0.05 : 0.08);
    const ax = axis.x || 0, az = axis.z || 0;
    if(Math.abs(ax) + Math.abs(az) > 0){
      // ARROW: shaft from the piece toward the joining direction, head at the tip
      const tip = new THREE.Vector3(x + ax * 0.34, y, z + az * 0.34);
      const tail = new THREE.Vector3(x - ax * 0.2, y, z - az * 0.2);
      group.add(clayStructureStripBetween(tail, tip, color, "sockets", spec.id, 0.05));
      // head: two short strips angled back from the tip (perpendicular blend)
      const px = -az, pz = ax; // perpendicular
      const headL = new THREE.Vector3(tip.x - ax * 0.14 + px * 0.1, y, tip.z - az * 0.14 + pz * 0.1);
      const headR = new THREE.Vector3(tip.x - ax * 0.14 - px * 0.1, y, tip.z - az * 0.14 - pz * 0.1);
      group.add(clayStructureStripBetween(headL, tip, color, "sockets", spec.id, 0.05));
      group.add(clayStructureStripBetween(headR, tip, color, "sockets", spec.id, 0.05));
    } else {
      group.add(clayStructureStripBetween(
        new THREE.Vector3(x - 0.16, y, z), new THREE.Vector3(x + 0.16, y, z), color, "sockets", spec.id, 0.045));
      group.add(clayStructureStripBetween(
        new THREE.Vector3(x, y, z - 0.16), new THREE.Vector3(x, y, z + 0.16), color, "sockets", spec.id, 0.045));
    }
  });
}
// Checkpoint 4 ACCESS TRUTH ("show access data per relevant face rather than assigning one summary
// colour to an entire object"): each authored face class draws its OWN frame in its OWN class
// colour — the top/tread class outlines the top plane, the side class frames the two camera-facing
// vertical faces, and 'none' renders neutral grey so inaccessibility is visibly a datum, not an
// omission. Colours are fixed vocabulary matched by the panel legend.
const CLAY_ACCESS_CLASS_COLORS = { walk: 0x66dfa0, "climb-cost": 0xf3bd55, "climb-dc": 0xff6d68, none: 0x8a9099 };
function clayStructureAddAccessOverlay(group, spec, rawFloor, origin){
  const at = spec.at;
  const lift = spec.lift || 0;
  const width = spec.width || spec.length || ((spec.radius || 0.35) * 2) || 1;
  const depth = spec.run || spec.thickness || ((spec.radius || 0.35) * 2) || 0.45;
  const hw = Math.max(0.22, width / 2), hd = Math.max(0.18, depth / 2);
  const cx0 = at.x - origin.cx, cz0 = at.z - origin.cz;
  const h = (spec.rise || spec.height || 0.1);
  const baseY = rawFloor + lift + 0.02;
  const topY = rawFloor + lift + h + 0.025;
  const access = spec.access || {};
  const topClass = access.top || access.treads || null;
  const sideClass = access.sides || access.shaft || access.faces || null;
  const colorFor = function(cls){ return CLAY_ACCESS_CLASS_COLORS[cls] != null ? CLAY_ACCESS_CLASS_COLORS[cls] : 0xf3bd55; };
  const frame = function(points, cls){
    if(!cls) return;
    for(let i = 0; i < points.length - 1; i++){
      group.add(clayStructureStripBetween(points[i], points[i + 1], colorFor(cls), "access", spec.id, 0.035));
    }
  };
  // TOP face (walk/tread class) — for the ramp, the frame follows the actual inclined plane
  if(spec.kind === "ramp"){
    const lowY = rawFloor + lift + 0.03, highY = rawFloor + lift + (spec.rise || 0.5) + 0.03;
    frame([
      new THREE.Vector3(cx0 - hw, lowY, cz0 - hd), new THREE.Vector3(cx0 + hw, lowY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, highY, cz0 + hd), new THREE.Vector3(cx0 - hw, highY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, lowY, cz0 - hd)
    ], topClass || access.top);
  } else {
    frame([
      new THREE.Vector3(cx0 - hw, topY, cz0 - hd), new THREE.Vector3(cx0 + hw, topY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 - hw, topY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, topY, cz0 - hd)
    ], topClass);
  }
  // SIDE faces (the two camera-facing planes under the fixed production camera: +x and +z)
  if(sideClass){
    frame([
      new THREE.Vector3(cx0 + hw, baseY, cz0 - hd), new THREE.Vector3(cx0 + hw, baseY, cz0 + hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 + hw, topY, cz0 - hd),
      new THREE.Vector3(cx0 + hw, baseY, cz0 - hd)
    ], sideClass);
    frame([
      new THREE.Vector3(cx0 - hw, baseY, cz0 + hd), new THREE.Vector3(cx0 + hw, baseY, cz0 + hd),
      new THREE.Vector3(cx0 + hw, topY, cz0 + hd), new THREE.Vector3(cx0 - hw, topY, cz0 + hd),
      new THREE.Vector3(cx0 - hw, baseY, cz0 + hd)
    ], sideClass);
  }
}
function clayStructureBuildPart(group, spec, rawFloor, origin){
  const mat = clayStructureMaterial();
  function add(mesh, y, x, z, kind){
    // spec.lift: assembled pieces may stand on the shell's own tiers (world-unit vertical offset)
    mesh.position.set(x == null ? spec.at.x - origin.cx : x, y + (spec.lift || 0), z == null ? spec.at.z - origin.cz : z);
    clayStructureTag(mesh, spec.id, kind || "furniture");
    group.add(mesh);
    return mesh;
  }
  if(spec.kind === "wall-run"){
    const dims = spec.axis === "z"
      ? [spec.thickness, spec.height, spec.length]
      : [spec.length, spec.height, spec.thickness];
    add(new THREE.Mesh(new THREE.BoxGeometry(dims[0], dims[1], dims[2]), mat),
      rawFloor + spec.height / 2, null, null, "wall");
  } else if(spec.kind === "t-junction"){
    add(new THREE.Mesh(new THREE.BoxGeometry(spec.length, spec.height, spec.thickness), mat),
      rawFloor + spec.height / 2, null, null, "wall");
    // Branch ends flush on the main run's outer face: no overlapping internal end volume.
    const branchZ = spec.at.z - origin.cz + spec.thickness / 2 + spec.branchLength / 2;
    add(new THREE.Mesh(new THREE.BoxGeometry(spec.thickness, spec.height, spec.branchLength), mat.clone()),
      rawFloor + spec.height / 2, spec.at.x - origin.cx, branchZ, "wall");
  } else if(spec.kind === "stair"){
    const tread = spec.run / spec.steps;
    for(let i = 0; i < spec.steps; i++){
      const height = spec.rise * (i + 1) / spec.steps;
      const z = spec.at.z - origin.cz - spec.run / 2 + tread * (i + 0.5);
      add(new THREE.Mesh(new THREE.BoxGeometry(spec.width, height, tread), mat.clone()),
        rawFloor + height / 2, spec.at.x - origin.cx, z, "riser");
    }
    const landing = new THREE.Mesh(new THREE.BoxGeometry(spec.width, spec.rise, 0.42), mat.clone());
    add(landing, rawFloor + spec.rise / 2, spec.at.x - origin.cx, spec.at.z - origin.cz + spec.run / 2 + 0.21, "riser");
  } else if(spec.kind === "ramp"){
    add(new THREE.Mesh(clayStructureRampGeometry(spec.width, spec.run, spec.rise), mat),
      rawFloor, null, null, "riser");
  } else if(spec.kind === "blocker"){
    add(new THREE.Mesh(new THREE.BoxGeometry(spec.length, spec.height, spec.thickness), mat),
      rawFloor + spec.height / 2, null, null, "wall");
  } else if(spec.kind === "support-square"){
    add(new THREE.Mesh(new THREE.BoxGeometry(spec.width, spec.height, spec.width), mat),
      rawFloor + spec.height / 2, null, null, "pillar");
  } else if(spec.kind === "support-round"){
    add(new THREE.Mesh(new THREE.CylinderGeometry(spec.radius, spec.radius * 1.04, spec.height, 20), mat),
      rawFloor + spec.height / 2, null, null, "pillar");
  }
  clayStructureAddSocketOverlay(group, spec, rawFloor, origin);
  clayStructureAddAccessOverlay(group, spec, rawFloor, origin);
}
function clayStructureBuildOpening(group, shell, fixture, tierHeights, origin){
  const aperture = shell.apertures && shell.apertures[0];
  if(!aperture) return null;
  const a = aperture.a, b = aperture.b;
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.max(0.0001, Math.hypot(dx, dz));
  const tx = dx / len, tz = dz / len;
  const width = Math.min(fixture.opening.width, len * 0.82);
  const floorY = tierHeights[aperture.tier] == null ? tierHeights[0] : tierHeights[aperture.tier];
  const midX = (a.x + b.x) / 2, midZ = (a.z + b.z) / 2;
  const hinge = new THREE.Group();
  hinge.name = fixture.opening.id;
  hinge.position.set(midX - tx * width / 2 - origin.cx, floorY, midZ - tz * width / 2 - origin.cz);
  hinge.rotation.y = -Math.atan2(tz, tx);
  hinge.userData.structureSpecId = fixture.opening.id;
  hinge.userData.structureSocket = fixture.opening.socket;
  hinge.userData.structureSwingClearanceDeg = fixture.opening.swingClearanceDeg;
  const geo = new THREE.BoxGeometry(width, fixture.opening.height, 0.075);
  geo.translate(width / 2, fixture.opening.height / 2, 0);
  const leaf = new THREE.Mesh(geo, clayStructureMaterial("#6f6f73"));
  const doorState = S.clayRoomStructureStageLatch
    ? S.clayRoomStructureStageLatch.doorState
    : fixture.opening.state;
  leaf.rotation.y = doorState === "open" ? Math.PI / 2 : (doorState === "ajar" ? Math.PI / 6 : 0);
  clayStructureTag(leaf, fixture.opening.id, "door");
  leaf.userData.isDoorLeaf = true;
  leaf.userData.structureDoorState = doorState;
  hinge.add(leaf);
  const arc = [];
  for(let i = 0; i <= 18; i++){
    const angle = (i / 18) * Math.PI / 2;
    arc.push(new THREE.Vector3(Math.cos(angle) * width, 0.035, -Math.sin(angle) * width));
  }
  const swing = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arc),
    new THREE.LineDashedMaterial({ color: 0x6fcfff, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.78 })
  );
  swing.computeLineDistances();
  swing.userData.interiorKind = "clay-diagnostic-overlay";
  swing.userData.structureOverlayView = "sockets";
  swing.userData.structureSpecId = fixture.opening.id;
  swing.renderOrder = 70;
  hinge.add(swing);
  group.add(hinge);
  return { aperture, hinge, leaf, swing };
}
function clayRoomApplyStructureViewVisibility(view){
  const group = S.clayRoomStructureBenchGroup;
  if(group){
    group.traverse(function(node){
      const ownView = node.userData && node.userData.structureOverlayView;
      if(ownView) node.visible = ownView === view;
    });
  }
  clayRoomApplyCamPose();
  if(typeof S.clayRoomRefreshStructure === "function") S.clayRoomRefreshStructure();
  markDirty();
  scheduleRender();
}
function clayRoomRebuildStructureBench(reason){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  const session = clayRoomMovementSession();
  const board = session && clayRoomMovementBoardFromState(session.state);
  if(!board) return false;
  S.boardKey = null;
  setInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-structure-rebuild" });
  return true;
}
function clayRoomSetStructureView(view){
  if(CLAY_STRUCTURE_BENCH_FIXTURE.views.indexOf(view) < 0) return false;
  const wasStrategic = S.clayRoomStructureView === "strategic";
  S.clayRoomStructureView = view;
  const isStrategic = view === "strategic";
  // Strategic mode changes the compiler input: every upper is built. Crossing that boundary
  // therefore rebuilds the production shell; merely hiding a pre-existing upper would lie about
  // the compile-time omission contract.
  if(S.clayRoomStructureBenchGroup && wasStrategic !== isStrategic){
    return clayRoomRebuildStructureBench("clayroom-structure-camera-mode");
  }
  clayRoomApplyStructureViewVisibility(view);
  return true;
}
function clayRoomSetStructureStaged(staged){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
    S.clayRoomStructureStageLatch,
    { type: staged ? CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.stagedEvent
      : CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.releaseEvent }
  );
  return clayRoomRebuildStructureBench(staged
    ? "clayroom-structure-space-entered"
    : "clayroom-structure-space-left-play");
}
function clayRoomSetStructureDoorState(state){
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID) return false;
  const session = clayRoomMovementSession();
  if(!session || session.busy) return false;
  const committed = tqConnectionStateCommit(session.fixture.space, session.state, {
    connectionId: session.fixture.connectionId,
    state: state
  });
  if(!committed.ok) return false;
  session.state = committed.state;
  session.lastReceipt = committed.receipt;
  session.preview = null;
  S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
    S.clayRoomStructureStageLatch,
    { type: "door-state", state: state }
  );
  return clayRoomRebuildStructureBench("clayroom-structure-door-" + state);
}
function clayRoomMountStructureBench(){
  S.clayRoomStructureBenchGroup = null;
  S.clayRoomStructureReport = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.clayStructureBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  group.userData.structureCatalogId = fixture.catalogId;

  // The 15×15 host supplies the calibrated floor, grid, camera, light, and shadow receiver. Its
  // tall perimeter uppers are not specimens and would turn the construction bench into a second
  // enclosed room, so CL-F01 leaves the mechanics stem and suppresses only that host upper/trim.
  // The fixture's own compiled shell below is the visible full-height wall-volume proof.
  S.interiorGroup.traverse(function(node){
    const kind = node.userData && node.userData.interiorKind;
    if(kind === "room-shell-wall-upper" || kind === "room-shell-wall-trim"){
      node.visible = false;
      node.userData.clayStructureHostSuppressed = true;
    }
  });

  const baseFloor = interiorFloorTopAt(S.interiorFloorTopMap, room.x + 7, room.y + 7);
  const h = CLAY_STRUCTURE_KIT_CATALOG.gridLaw.verticalQuantumWorldUnits;
  const tierHeights = { "-1": baseFloor + 0.025, "0": baseFloor + h + 0.025, "1": baseFloor + h * 2 + 0.025 };
  const cells = fixture.shellCells.map(function(cell){
    return {
      x: room.x + cell.x,
      z: room.y + cell.z,
      tier: cell.tier,
      isDoor: cell.isDoor,
      sourceRef: cell.sourceRef
    };
  });
  const omittedKeys = new Set();
  const staging = S.clayRoomStructureStageLatch || Object.freeze({
    staged: !!fixture.wallOmission.initialState.staged,
    latched: !!fixture.wallOmission.initialState.latched,
    lastEvent: "fixture-default",
    doorState: fixture.opening.state
  });
  const strategicView = S.clayRoomStructureView === "strategic";
  const omissionActive = staging.staged && staging.latched && !strategicView;
  const cameraRaw = S.camera
    ? { x: S.camera.position.x + origin.cx, z: S.camera.position.z + origin.cz }
    : { x: room.x + room.w, z: room.y + room.d };
  function upperVisibleForSegment(seg){
    // Apertures always retain their upper/frame volume; tier risers are separate compiler output
    // and therefore cannot enter this omission predicate at all.
    if(seg.kind === "door") return true;
    if(!omissionActive) return true;
    const normal = segmentNormal(seg);
    const mx = (seg.a.x + seg.b.x) / 2, mz = (seg.a.z + seg.b.z) / 2;
    const outwardX = -normal.x, outwardZ = -normal.z;
    const cameraOutside = (cameraRaw.x - mx) * outwardX + (cameraRaw.z - mz) * outwardZ > 0.15;
    if(cameraOutside) omittedKeys.add([seg.a.x, seg.a.z, seg.b.x, seg.b.z].join(","));
    return !cameraOutside;
  }
  const shell = compileRoomShell(cells, {
    tierHeights,
    wallHeight: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.storeyWorldUnits,
    wallThickness: 0.22,
    wallStemHeight: 0.28,
    wallCapHeight: 0.06,
    wallCapOverhang: 0.035,
    upperVisibleForSegment
  });
  const shellGroup = new THREE.Group();
  shellGroup.name = "compiled-shell";
  shellGroup.userData.structureSpecId = "compiled-shell";
  function addShell(geometry, kind, specId, cast){
    if(!geometry) return null;
    const mesh = new THREE.Mesh(geometry, clayStructureMaterial());
    mesh.position.set(-origin.cx, 0, -origin.cz);
    clayStructureTag(mesh, specId || "compiled-shell", kind);
    mesh.castShadow = cast !== false;
    shellGroup.add(mesh);
    return mesh;
  }
  addShell(shell.floorGeometry, "floor", "compiled-shell", false);
  addShell(shell.wallStemGeometry, "wall", "compiled-shell", true);
  (shell.wallUpperMeshes || []).forEach(function(entry){
    const mesh = addShell(entry.geometry, "wall", "compiled-shell", true);
    if(mesh) mesh.userData.ownerSegIndex = entry.ownerSegIndex;
  });
  addShell(shell.wallTrimGeometry, "trim", "compiled-shell", true);
  addShell(shell.riserGeometry, "riser", "compiled-shell", true);
  group.add(shellGroup);

  const openingBuilt = clayStructureBuildOpening(group, shell, fixture, tierHeights, origin);
  fixture.pieces.forEach(function(spec){
    const worldSpec = Object.assign({}, spec, {
      at: { x: room.x + spec.at.x, z: room.y + spec.at.z }
    });
    clayStructureBuildPart(group, worldSpec, baseFloor + 0.025, origin);
  });

  // Negative control: two otherwise-valid wall prisms stay visibly separated. The red X is only
  // shown in NEGATIVE view; the physical gap remains in every view so rejection never masquerades
  // as a successful join.
  const bad = fixture.negativeControl;
  const badMat = clayStructureMaterial();
  const badX = room.x + bad.at.x - origin.cx, badZ = room.y + bad.at.z - origin.cz;
  const badA = clayStructureTag(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.72, 0.22), badMat), bad.id, "wall");
  badA.position.set(badX - 0.55, baseFloor + 0.385, badZ);
  const badB = clayStructureTag(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.8), badMat.clone()), bad.id, "wall");
  badB.position.set(badX + 0.32, baseFloor + 0.385, badZ + 0.42);
  group.add(badA, badB);
  const xY = baseFloor + 0.82;
  group.add(
    clayStructureStripBetween(
      new THREE.Vector3(badX - 0.38, xY, badZ - 0.38),
      new THREE.Vector3(badX + 0.38, xY, badZ + 0.38),
      0xff3030, "negative", bad.id, 0.075
    ),
    clayStructureStripBetween(
      new THREE.Vector3(badX - 0.38, xY, badZ + 0.38),
      new THREE.Vector3(badX + 0.38, xY, badZ - 0.38),
      0xff3030, "negative", bad.id, 0.075
    )
  );

  S.interiorGroup.add(group);
  S.clayRoomStructureBenchGroup = group;
  const assessment = clayStructureSocketJoinAssessment(bad.source, bad.candidate);
  const slopeDeg = Math.atan2(
    fixture.pieces.find(function(p){ return p.id === "shallow-ramp"; }).rise,
    fixture.pieces.find(function(p){ return p.id === "shallow-ramp"; }).run
  ) * 180 / Math.PI;
  S.clayRoomStructureReport = {
    fixtureId: fixture.id,
    fixtureVersion: fixture.version,
    catalogId: CLAY_STRUCTURE_KIT_CATALOG.id,
    catalogVersion: CLAY_STRUCTURE_KIT_CATALOG.version,
    gridLaw: CLAY_STRUCTURE_KIT_CATALOG.gridLaw,
    shell: {
      meta: shell.meta,
      apertures: shell.apertures.length,
      tiers: Object.keys(tierHeights).map(Number).sort(),
      riserSegments: shell.riserSegments.length,
      wallSegments: shell.wallSegments.length,
      mountSlots: shell.mountSlots.length,
      builtUpperSegments: shell.wallUpperMeshes.length,
      omittedUpperSegments: omittedKeys.size,
      totalUpperSegments: shell.wallUpperMeshes.length + omittedKeys.size,
      exposedSlabSides: !!shell.riserGeometry
    },
    // Checkpoint 4 reporting parity ("the fixture can report all uppers present while also saying
    // camera-side omission is active"): the omission projection is derived HERE, from the exact
    // predicate/keys THIS build ran — never from the room-truth shell's separate generic report.
    cameraSideOmission: {
      ruleId: fixture.wallOmission.ruleId,
      version: fixture.wallOmission.version,
      active: omissionActive,
      omitted: shell.wallSegments
        .map(function(seg, i){ return { seg: seg, segIndex: i }; })
        .filter(function(row){ return omittedKeys.has([row.seg.a.x, row.seg.a.z, row.seg.b.x, row.seg.b.z].join(",")); })
        .map(function(row){ return { segIndex: row.segIndex, mid: { x: (row.seg.a.x + row.seg.b.x) / 2, z: (row.seg.a.z + row.seg.b.z) / 2 } }; }),
      built: shell.wallSegments
        .map(function(seg, i){ return { seg: seg, segIndex: i }; })
        .filter(function(row){ return !omittedKeys.has([row.seg.a.x, row.seg.a.z, row.seg.b.x, row.seg.b.z].join(",")); })
        .map(function(row){ return { segIndex: row.segIndex, mid: { x: (row.seg.a.x + row.seg.b.x) / 2, z: (row.seg.a.z + row.seg.b.z) / 2 } }; })
    },
    wallOmission: {
      ruleId: fixture.wallOmission.ruleId,
      version: fixture.wallOmission.version,
      staged: staging.staged,
      latched: staging.latched,
      lastEvent: staging.lastEvent,
      doorState: staging.doorState,
      strategicView: strategicView,
      cameraMode: strategicView ? "top-down-strategic" : "fixed-production",
      active: omissionActive,
      carveouts: fixture.wallOmission.carveouts,
      apertureUpperBuilt: !!openingBuilt,
      structuralMassBuilt: shell.riserSegments.length > 0,
      rawDoorStateChangesLatch: false
    },
    opening: {
      mounted: !!openingBuilt,
      threshold: fixture.opening.threshold,
      hingeSocket: fixture.opening.socket.type,
      doorState: staging.doorState,
      hingeAngleDeg: openingBuilt ? +(openingBuilt.leaf.rotation.y * 180 / Math.PI).toFixed(1) : null,
      swingClearanceDeg: fixture.opening.swingClearanceDeg,
      leafCastsShadow: !!(openingBuilt && openingBuilt.leaf.castShadow)
    },
    specimens: fixture.pieces.map(function(spec){
      return {
        id: spec.id, kind: spec.kind, sockets: spec.sockets, access: spec.access,
        provenance: CLAY_STRUCTURE_KIT_CATALOG.provenance
      };
    }),
    slope: {
      degrees: +slopeDeg.toFixed(3),
      maxDegrees: CLAY_STRUCTURE_KIT_CATALOG.gridLaw.maxWalkableSlopeDeg,
      walkable: slopeDeg <= CLAY_STRUCTURE_KIT_CATALOG.gridLaw.maxWalkableSlopeDeg
    },
    negativeControl: {
      id: bad.id,
      accepted: assessment.accepted,
      reason: assessment.reason,
      expectedReason: bad.expectedReason,
      visibleGap: true
    },
    cutawayWitness: {
      id: fixture.cutawayWitness.id,
      pieceSlug: fixture.cutawayWitness.pieceSlug,
      occluderId: fixture.cutawayWitness.occluder.id,
      rendererPath: "data.pieces + data.instances.pillar -> itrPillarCutawayMask -> itrOcclusionClassify"
    },
    climbMechanicsImplemented: CLAY_STRUCTURE_KIT_CATALOG.climbMechanicsImplemented,
    provenance: CLAY_STRUCTURE_KIT_CATALOG.provenance
  };
  clayRoomApplyStructureViewVisibility(S.clayRoomStructureView || fixture.defaultView);
  return group;
}

/* CL-F02 lighting bench — deterministic test INPUT mounted inside the same production Theater scene.
   These are neutral comparison forms, not a second renderer: the same camera, diagnostic surface
   route, real sprite builder, PointLights, shadows, tone map, and post chain remain in charge. */
function clayRoomMountLightingBench(){
  S.clayRoomLightingBenchGroup = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomLightingBenchFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const rawX = room.x + (room.w - 1) / 2;
  const rawZ = room.y + (room.d - 1) / 2;
  const floorTop = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ);
  const centerX = rawX - origin.cx;
  const centerZ = rawZ - origin.cz;
  const group = new THREE.Group();
  group.name = fixture.id;
  group.userData.clayLightingBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;
  fixture.primitives.forEach(function(spec){
    let geometry, height;
    if(spec.primitive === "sphere"){
      geometry = new THREE.SphereGeometry(spec.radius, 32, 20);
      height = spec.radius * 2;
    } else {
      geometry = new THREE.BoxGeometry(spec.size.x, spec.size.y, spec.size.z);
      height = spec.size.y;
    }
    const material = new THREE.MeshStandardMaterial({
      color: CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
      roughness: 1,
      metalness: 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = spec.id;
    mesh.position.set(centerX + spec.offset.x, floorTop + height / 2, centerZ + spec.offset.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = spec.role;
    mesh.userData.clayBenchPrimitive = spec.id;
    mesh.userData.clayBenchPrimitiveType = spec.primitive;
    group.add(mesh);
  });
  S.interiorGroup.add(group);
  S.clayRoomLightingBenchGroup = group;
  return group;
}

/* CL-F03 sprite bench — the lineup itself comes through data.pieces -> interiorBuildPieces. This
   post-build group adds only two visual measuring aids: tactical-footprint outlines (gameplay truth,
   explicitly separate from the visible support) and a three-tread stair carrying face/three-quarter/
   edge-on copies built by the same production billboard/base functions. */
function clayRoomMountSpriteBench(){
  S.clayRoomSpriteBenchGroup = null;
  if(S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID || !S.interiorGroup || !S.clayRoomRecord){
    return null;
  }
  const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  const origin = S.boardOrigin;
  if(!room || !origin) return null;
  const group = new THREE.Group();
  group.name = fixture.id + "-measures";
  group.userData.claySpriteBench = true;
  group.userData.fixtureId = fixture.id;
  group.userData.fixtureVersion = fixture.version;

  fixture.cast.forEach(function(spec){
    const rawX = room.x + spec.lineupCell.x;
    const rawZ = room.y + spec.lineupCell.z;
    const span = spec.tacticalSpanCells;
    const y = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ) + 0.018;
    const half = span / 2;
    const points = [
      new THREE.Vector3(rawX - origin.cx - half, y, rawZ - origin.cz - half),
      new THREE.Vector3(rawX - origin.cx + half, y, rawZ - origin.cz - half),
      new THREE.Vector3(rawX - origin.cx + half, y, rawZ - origin.cz + half),
      new THREE.Vector3(rawX - origin.cx - half, y, rawZ - origin.cz + half)
    ];
    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: spec.slug === fixture.selectedSlug ? 0x6fcfff : 0xd6b86c,
        transparent: true,
        opacity: 0.78,
        depthTest: true,
        depthWrite: false
      })
    );
    outline.userData.clayTacticalFootprint = true;
    outline.userData.spriteSlug = spec.slug;
    outline.userData.tacticalSpanCells = span;
    group.add(outline);
  });

  const stair = new THREE.Group();
  stair.name = fixture.stair.id;
  stair.userData.claySpriteStair = true;
  const stairCenterRawX = room.x + 7;
  const stairCenterRawZ = room.y + 12.25;
  const stairFloor = interiorFloorTopAt(S.interiorFloorTopMap, stairCenterRawX, stairCenterRawZ);
  const tread = fixture.stair.treadDepth;
  const riser = fixture.stair.riserHeight;
  for(let i = 0; i < fixture.stair.steps; i++){
    const layers = fixture.stair.steps - i;
    const depth = layers * tread;
    const height = (i + 1) * riser;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(fixture.stair.treadWidth + 1.2, height, depth),
      new THREE.MeshStandardMaterial({
        color: CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor,
        roughness: 1,
        metalness: 0
      })
    );
    mesh.position.set(
      stairCenterRawX - origin.cx,
      stairFloor + height / 2,
      stairCenterRawZ - origin.cz - i * tread / 2
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.interiorKind = "riser";
    mesh.userData.claySpriteStairLayer = i;
    mesh.userData.treadDepth = tread;
    stair.add(mesh);
  }

  const selectedEntry = spriteEntryFor(fixture.selectedSlug);
  if(selectedEntry){
    [-1, 0, 1].forEach(function(offset, index){
      const built = interiorSpriteBillboard(selectedEntry, null);
      if(!built) return;
      const sample = built.group;
      const stepTop = stairFloor + (index + 1) * riser;
      const z = stairCenterRawZ - origin.cz + (1 - index) * tread;
      sample.position.set(stairCenterRawX - origin.cx + offset * 1.05, interiorStandeeContactY(stepTop), z);
      sample.userData.sceneObjectId = "stair-" + ["face", "three-quarter", "edge"][index];
      sample.userData.claySpriteStairSample = ["face", "three-quarter", "edge"][index];
      sample.userData.claySpriteViewYawOffset = [0, Math.PI / 4, Math.PI / 2][index];
      sample.userData.kilterYawDeg = 0;
      const support = interiorStandeeSupportMetrics(built.width, selectedEntry.size, 1);
      const baseMesh = buildInteriorBase(
        support.width,
        support.depth,
        S.lastBoard && S.lastBoard.tileKit && S.lastBoard.tileKit.trimColor
      );
      sample.add(baseMesh);
      sample.userData.standeeBaseMesh = baseMesh;
      sample.userData.interiorBaseWidth = support.width;
      sample.userData.interiorBaseDepth = support.depth;
      sample.userData.standeeCollisionExcluded = true;
      sample.userData.stairTreadDepth = tread;
      sample.userData.stairFit = support.depth <= tread + 0.000001;
      sample.userData.interiorHeight = built.height;
      sample.userData.interiorWidth = built.width;
      stair.add(sample);
    });
  }
  group.add(stair);
  S.interiorGroup.add(group);
  S.clayRoomSpriteBenchGroup = group;
  S.standeeCollisionDirty = true;
  return group;
}

function clayRoomSuppressLightingBenchNoise(){
  if((S.clayRoomFixtureId !== CLAY_ROOM_STRUCTURE_BENCH_ID
    && S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID
    && S.clayRoomFixtureId !== CLAY_ROOM_SPRITE_BENCH_ID) || !S.moteGroup) return;
  stopMoteDrift();
  if(S.moteGroup.parent) S.moteGroup.parent.remove(S.moteGroup);
  clearGroup(S.moteGroup);
  S.moteGroup = null;
}

function clayRoomDisposeLightOverlays(){
  const group = S.clayRoomLightOverlayGroup;
  if(!group) return;
  if(group.parent) group.parent.remove(group);
  clearGroup(group);
  S.clayRoomLightOverlayGroup = null;
}

function clayRoomBuildLightOverlays(){
  clayRoomDisposeLightOverlays();
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID || !S.scene) return null;
  const modes = S.clayRoomLightOverlayModes || { position: false, range: false, shadow: false };
  S.clayRoomLightOverlayModes = modes;
  const group = new THREE.Group();
  group.name = "cl-f02-light-overlays";
  group.userData.clayLightingOverlay = true;
  (S.interiorLightTargets || []).forEach(function(target){
    if(!target || !target.pl) return;
    const light = target.pl;
    const p = new THREE.Vector3();
    light.getWorldPosition(p);
    const rawX = p.x + ((S.boardOrigin && S.boardOrigin.cx) || 0);
    const rawZ = p.z + ((S.boardOrigin && S.boardOrigin.cz) || 0);
    const floorY = interiorFloorTopAt(S.interiorFloorTopMap, rawX, rawZ) + 0.018;
    const color = light.color && typeof light.color.getHex === "function" ? light.color.getHex() : 0xffffff;
    if(modes.position){
      const r = 0.22;
      const points = [
        p.x - r, p.y, p.z, p.x + r, p.y, p.z,
        p.x, p.y - r, p.z, p.x, p.y + r, p.z,
        p.x, p.y, p.z - r, p.x, p.y, p.z + r,
        p.x, floorY, p.z, p.x, p.y, p.z
      ];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false
      }));
      line.userData.clayLightOverlayKind = "position";
      line.userData.lightId = target.id;
      line.renderOrder = 60;
      group.add(line);
    }
    if(modes.range && light.distance > 0){
      [0.25, 0.5, 1].forEach(function(frac){
        const radius = light.distance * frac;
        const points = [];
        for(let i = 0; i < 64; i++){
          const a = (i / 64) * Math.PI * 2;
          points.push(new THREE.Vector3(p.x + Math.cos(a) * radius, floorY, p.z + Math.sin(a) * radius));
        }
        const line = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color, transparent: true, opacity: frac === 1 ? 0.78 : 0.34,
            depthTest: false, depthWrite: false
          })
        );
        line.userData.clayLightOverlayKind = "range";
        line.userData.lightId = target.id;
        line.userData.rangeFraction = frac;
        line.userData.range = light.distance;
        line.renderOrder = 59;
        group.add(line);
      });
    }
    if(modes.shadow && light.castShadow && light.distance > 0){
      let sourceGeometry;
      if(light.isSpotLight){
        const coneRadius = Math.tan(light.angle || Math.PI / 4) * light.distance;
        sourceGeometry = new THREE.ConeGeometry(coneRadius, light.distance, 16, 1, true);
      } else {
        sourceGeometry = new THREE.SphereGeometry(light.distance, 12, 8);
      }
      const wireGeometry = new THREE.WireframeGeometry(sourceGeometry);
      sourceGeometry.dispose();
      const wire = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0.16, depthTest: false, depthWrite: false
      }));
      wire.position.copy(p);
      if(light.isSpotLight){
        wire.position.y -= light.distance / 2;
      }
      wire.userData.clayLightOverlayKind = light.isSpotLight ? "shadow-frustum" : "shadow-volume";
      wire.userData.lightId = target.id;
      wire.renderOrder = 58;
      group.add(wire);
    }
  });
  S.scene.add(group);
  S.clayRoomLightOverlayGroup = group;
  return group;
}

/* CL-R1 live pixel diagnostics. These measurements read the final display-space framebuffer after
   the production post chain. They intentionally do not inspect authored light values and call them
   "brightness": a clipped pixel, a crushed pixel, and a desaturated sprite are counted from what
   the user can actually see. The sprite crop comes from __spriteScreenRects(), which projects the
   live mounted billboard. Its local surround ring is the comparison field for the simple
   readability deltas; no subjective pass/fail threshold is invented here. */
function clayRoomMetricsForRgba(pixels, width, height, rect, opts){
  opts = opts || {};
  if(!pixels || !width || !height) return null;
  const box = rect || { x: 0, y: 0, w: width, h: height };
  const x0 = Math.max(0, Math.min(width, Math.floor(box.x)));
  const y0 = Math.max(0, Math.min(height, Math.floor(box.y)));
  const x1 = Math.max(x0, Math.min(width, Math.ceil(box.x + box.w)));
  const y1 = Math.max(y0, Math.min(height, Math.ceil(box.y + box.h)));
  const exclude = opts.excludeRect || null;
  const sampleStep = Math.max(1, Number(opts.sampleStep) || 1);
  const alphaMin = opts.alphaMin == null ? 0 : Number(opts.alphaMin);
  const flipY = opts.flipY !== false;
  const histogram = new Uint32Array(256);
  let count = 0, lumaSum = 0, saturationSum = 0, spreadSum = 0;
  let clipped = 0, crushed = 0, neutral = 0;
  for(let sy = y0; sy < y1; sy += sampleStep){
    for(let sx = x0; sx < x1; sx += sampleStep){
      if(exclude
        && sx >= exclude.x && sx < exclude.x + exclude.w
        && sy >= exclude.y && sy < exclude.y + exclude.h) continue;
      const sourceY = flipY ? (height - 1 - sy) : sy;
      const i = (sourceY * width + sx) * 4;
      if(pixels[i + 3] < alphaMin) continue;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const lumaBin = Math.max(0, Math.min(255, Math.round(luma)));
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const spread = maxChannel - minChannel;
      histogram[lumaBin]++;
      count++;
      lumaSum += luma;
      spreadSum += spread;
      saturationSum += maxChannel === 0 ? 0 : 255 * spread / maxChannel;
      if(r >= 250 && g >= 250 && b >= 250) clipped++;
      if(r <= 5 && g <= 5 && b <= 5) crushed++;
      if(spread <= 6) neutral++;
    }
  }
  if(!count) return null;
  function percentile(fraction){
    const target = Math.max(0, Math.min(count - 1, Math.floor(count * fraction)));
    let seen = 0;
    for(let value = 0; value < histogram.length; value++){
      seen += histogram[value];
      if(seen > target) return value;
    }
    return 255;
  }
  function rounded(value, places){
    const factor = Math.pow(10, places == null ? 2 : places);
    return Math.round(value * factor) / factor;
  }
  return {
    pixelsSampled: count,
    sampleStep: sampleStep,
    meanLuma: rounded(lumaSum / count),
    medianLuma: percentile(0.5),
    p05Luma: percentile(0.05),
    p95Luma: percentile(0.95),
    clippedHighlightPct: rounded(100 * clipped / count, 3),
    crushedShadowPct: rounded(100 * crushed / count, 3),
    meanSaturation: rounded(saturationSum / count),
    meanChromaSpread: rounded(spreadSum / count),
    neutralPct: rounded(100 * neutral / count)
  };
}

function clayRoomReadback(fullResolution){
  if(!S.mounted || !S.renderer || !S.camera) return null;
  renderTheaterFrame();
  // The always-visible readout uses a small same-task 2D copy of the just-rendered WebGL canvas.
  // It keeps the flame's 60fps animation from paying a full-resolution GPU readback every refresh.
  // The explicit comparison-sheet capture below requests the full framebuffer instead.
  if(!fullResolution && typeof document !== "undefined"){
    const source = S.renderer.domElement;
    const width = Math.min(480, source.width);
    const height = Math.max(1, Math.round(source.height * (width / source.width)));
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const ctx = sample.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    return {
      pixels: new Uint8Array(image.data.buffer.slice(0)),
      width: width,
      height: height,
      flipY: false,
      sourceWidth: source.width,
      sourceHeight: source.height
    };
  }
  const gl = S.renderer.getContext();
  if(!gl) return null;
  const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
  if(!width || !height) return null;
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return {
    pixels: pixels,
    width: width,
    height: height,
    flipY: true,
    sourceWidth: width,
    sourceHeight: height
  };
}

function clayRoomCitizenScreenRect(readback){
  if(!readback || !window.Theater || typeof window.Theater.__spriteScreenRects !== "function"){
    return null;
  }
  const expected = S.clayRoomRecord && S.clayRoomRecord.citizen
    ? S.clayRoomRecord.citizen.bestiaryId : null;
  const rects = window.Theater.__spriteScreenRects();
  const found = rects.find(function(rect){ return rect.slug === expected; }) || rects[0];
  if(!found || !(found.w > 1) || !(found.h > 1)) return null;
  const scaleX = readback.width / (readback.sourceWidth || readback.width);
  const scaleY = readback.height / (readback.sourceHeight || readback.height);
  const foundX = found.cx * scaleX, foundY = found.cy * scaleY;
  const foundW = found.w * scaleX, foundH = found.h * scaleY;
  const pad = Math.max(3, Math.min(foundW, foundH) * 0.06);
  return {
    slug: found.slug,
    x: Math.max(0, foundX - foundW / 2 - pad),
    y: Math.max(0, foundY - foundH / 2 - pad),
    w: Math.min(readback.width, foundW + pad * 2),
    h: Math.min(readback.height, foundH + pad * 2)
  };
}

function clayRoomCanvasFromReadback(readback, rect, targetCanvas){
  if(!readback || typeof document === "undefined") return null;
  const sourceRect = rect || { x: 0, y: 0, w: readback.width, h: readback.height };
  const x0 = Math.max(0, Math.floor(sourceRect.x));
  const y0 = Math.max(0, Math.floor(sourceRect.y));
  const width = Math.max(1, Math.min(readback.width - x0, Math.ceil(sourceRect.w)));
  const height = Math.max(1, Math.min(readback.height - y0, Math.ceil(sourceRect.h)));
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const scratchCtx = scratch.getContext("2d");
  const imageData = scratchCtx.createImageData(width, height);
  for(let y = 0; y < height; y++){
    const sourceY = readback.flipY === false ? (y0 + y) : (readback.height - 1 - (y0 + y));
    const start = (sourceY * readback.width + x0) * 4;
    imageData.data.set(readback.pixels.subarray(start, start + width * 4), y * width * 4);
  }
  scratchCtx.putImageData(imageData, 0, 0);
  if(!targetCanvas) return scratch;
  const outCtx = targetCanvas.getContext("2d");
  outCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  outCtx.fillStyle = "#090a0d";
  outCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  const scale = Math.min(targetCanvas.width / width, targetCanvas.height / height);
  const drawW = width * scale, drawH = height * scale;
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(
    scratch,
    (targetCanvas.width - drawW) / 2,
    (targetCanvas.height - drawH) / 2,
    drawW,
    drawH
  );
  return targetCanvas;
}

function clayRoomMountSourceSpriteCard(canvas, statusEl){
  if(!canvas || !S.clayRoomRecord) return null;
  const entry = spriteEntryFor(S.clayRoomRecord.citizen.bestiaryId);
  const path = entry ? spriteAssetPathFor(entry) : null;
  const state = { path: path, metrics: null, loaded: false };
  S.clayRoomSourceSprite = state;
  if(!path){
    if(statusEl) statusEl.textContent = "source sprite unavailable";
    return state;
  }
  const img = new Image();
  img.addEventListener("load", function(){
    const scratch = document.createElement("canvas");
    scratch.width = img.naturalWidth || 1;
    scratch.height = img.naturalHeight || 1;
    const scratchCtx = scratch.getContext("2d");
    scratchCtx.drawImage(img, 0, 0);
    const sourcePixels = scratchCtx.getImageData(0, 0, scratch.width, scratch.height);
    state.metrics = clayRoomMetricsForRgba(
      sourcePixels.data,
      scratch.width,
      scratch.height,
      null,
      { flipY: false, alphaMin: 8, sampleStep: 1 }
    );
    state.loaded = true;
    S.clayRoomPixelMetricsCache = null;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#090a0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / scratch.width, canvas.height / scratch.height);
    const drawW = scratch.width * scale, drawH = scratch.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH);
    if(statusEl){
      statusEl.textContent = "authored PNG · opaque pixels · " + path.replace(/^assets\/sprites\//, "");
    }
  });
  img.addEventListener("error", function(){
    if(statusEl) statusEl.textContent = "source sprite failed to load · " + path;
  });
  img.src = path;
  return state;
}

function clayRoomLightingPixelMetrics(force){
  if(S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID) return null;
  const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const cacheKey = (S.clayRoomLightRecipeId || "") + ":" + (S.clayRoomPreviewSeed || "A");
  const cached = S.clayRoomPixelMetricsCache;
  // Measuring is intentionally event-driven (recipe/seed/camera changes or the explicit refresh
  // button), never a recurring GPU sync while a flame is animating. "Live" means pixels from the
  // current mounted frame, not a background profiler that periodically steals an animation frame.
  if(!force && cached && cached.cacheKey === cacheKey) return cached.value;
  if(!force && S.clayRoomMatrixCaptureInProgress) return cached ? cached.value : null;
  const readback = clayRoomReadback(false);
  if(!readback) return null;
  const spriteRect = clayRoomCitizenScreenRect(readback);
  const frame = clayRoomMetricsForRgba(
    readback.pixels,
    readback.width,
    readback.height,
    null,
    { sampleStep: 1, flipY: readback.flipY }
  );
  const sprite = spriteRect ? clayRoomMetricsForRgba(
    readback.pixels,
    readback.width,
    readback.height,
    spriteRect,
    { sampleStep: 1, flipY: readback.flipY }
  ) : null;
  let surround = null;
  if(spriteRect){
    const growX = Math.max(8, spriteRect.w * 0.45);
    const growY = Math.max(8, spriteRect.h * 0.25);
    surround = clayRoomMetricsForRgba(
      readback.pixels,
      readback.width,
      readback.height,
      {
        x: spriteRect.x - growX,
        y: spriteRect.y - growY,
        w: spriteRect.w + growX * 2,
        h: spriteRect.h + growY * 2
      },
      { sampleStep: 1, excludeRect: spriteRect, flipY: readback.flipY }
    );
  }
  const readability = sprite && surround ? {
    lumaDelta: Math.round(Math.abs(sprite.medianLuma - surround.medianLuma) * 100) / 100,
    chromaDelta: Math.round(Math.abs(sprite.meanChromaSpread - surround.meanChromaSpread) * 100) / 100,
    definition: "absolute sprite-screen-box vs local-surround deltas; measurement only"
  } : null;
  if(S.clayRoomRenderedSpriteCanvas && spriteRect){
    clayRoomCanvasFromReadback(readback, spriteRect, S.clayRoomRenderedSpriteCanvas);
  }
  const value = {
    recipeId: S.clayRoomLightRecipeId || null,
    previewSeed: S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0],
    drawingBuffer: { w: readback.width, h: readback.height },
    frame: frame,
    sprite: sprite,
    localSurround: surround,
    readability: readability,
    sourceSprite: S.clayRoomSourceSprite ? {
      path: S.clayRoomSourceSprite.path,
      loaded: S.clayRoomSourceSprite.loaded,
      metrics: S.clayRoomSourceSprite.metrics
    } : null
  };
  S.clayRoomPixelMetricsCache = { cacheKey: cacheKey, measuredAt: now, value: value };
  return value;
}

function clayRoomWaitForCaptureSettle(ms){
  return new Promise(function(resolve){
    const afterFrames = function(){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ setTimeout(resolve, ms || 0); });
      });
    };
    if(typeof requestAnimationFrame === "function") afterFrames();
    else setTimeout(resolve, ms || 0);
  });
}

function clayRoomDownloadBlob(filename, type, content){
  const blob = content instanceof Blob ? content : new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 0);
}

function clayRoomShowLightingMatrix(sheetCanvas, receipt){
  const stale = document.getElementById("clay-lighting-matrix-sheet");
  if(stale && stale.parentNode) stale.parentNode.removeChild(stale);
  const overlay = document.createElement("div");
  overlay.id = "clay-lighting-matrix-sheet";
  overlay.style.cssText = "position:fixed;inset:54px 22px 18px;z-index:10020;background:rgba(10,11,14,.97);border:1px solid #56606d;border-radius:6px;padding:12px;box-sizing:border-box;overflow:auto;color:#e7edf4;font:11px/1.4 monospace;";
  const toolbar = document.createElement("div");
  toolbar.style.cssText = "position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;background:#111318;padding:0 0 9px;";
  const title = document.createElement("strong");
  title.textContent = "CL-R1 · COMPLETE LIGHTING COMPARISON · 7 REAL RECIPES";
  title.style.cssText = "margin-right:auto;font:600 12px -apple-system,sans-serif;";
  toolbar.appendChild(title);
  [
    ["DOWNLOAD PNG", function(){
      sheetCanvas.toBlob(function(blob){
        if(blob) clayRoomDownloadBlob("cl-r1-lighting-comparison.png", "image/png", blob);
      }, "image/png");
    }],
    ["DOWNLOAD RECEIPT", function(){
      clayRoomDownloadBlob(
        "cl-r1-lighting-comparison-receipt.json",
        "application/json",
        JSON.stringify(receipt, null, 2)
      );
    }],
    ["CLOSE", function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[0];
    button.style.cssText = "font:10px monospace;background:#252b33;color:#e3e8ee;border:1px solid #4b5562;border-radius:3px;padding:5px 8px;cursor:pointer;";
    button.addEventListener("click", def[1]);
    toolbar.appendChild(button);
  });
  overlay.appendChild(toolbar);
  sheetCanvas.style.cssText = "display:block;width:min(100%,1600px);height:auto;margin:0 auto;border:1px solid #333;background:#0b0d11;";
  overlay.appendChild(sheetCanvas);
  document.body.appendChild(overlay);
  S.clayRoomLightingMatrixOverlay = overlay;
}

async function clayRoomCaptureLightingMatrix(){
  if(S.clayRoomMatrixCaptureInProgress || S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID){
    return null;
  }
  S.clayRoomMatrixCaptureInProgress = true;
  if(S.clayRoomMatrixStatusEl) S.clayRoomMatrixStatusEl.textContent = "capturing 1 / 7…";
  const originalRecipeId = S.clayRoomLightRecipeId || "clay-opposing-pair";
  const originalOverlayModes = Object.assign(
    { position: false, range: false, shadow: false },
    S.clayRoomLightOverlayModes || {}
  );
  const previewSeed = S.clayRoomPreviewSeed || CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
  const cards = [];
  try {
    S.clayRoomLightOverlayModes = { position: false, range: false, shadow: false };
    clayRoomBuildLightOverlays();
    for(let index = 0; index < CLAY_ROOM_LIGHTING_MATRIX_RECIPES.length; index++){
      const recipeId = CLAY_ROOM_LIGHTING_MATRIX_RECIPES[index];
      if(S.clayRoomMatrixStatusEl){
        S.clayRoomMatrixStatusEl.textContent = "capturing " + (index + 1) + " / "
          + CLAY_ROOM_LIGHTING_MATRIX_RECIPES.length + " · " + recipeId;
      }
      if(!clayRoomSetLightingRecipe(recipeId, "clayroom-matrix-capture")){
        throw new Error("could not mount lighting matrix recipe " + recipeId);
      }
      await clayRoomWaitForCaptureSettle(180);
      // Animated recipes become deterministic stills at their second seeded target. This changes
      // no authored state; the restored live recipe restarts its ordinary smooth animation below.
      // Settle the standee's seeded mount/breathe tweens too, otherwise identical runs can catch a
      // different sub-frame of the goblin and move a handful of shadow pixels.
      if(S.interiorGroup){
        S.interiorGroup.traverse(function(object){
          if(object && object.userData && object.userData.sprite) stopIdleBreathe(object, false);
        });
      }
      drainTweens(S);
      stopLightFlicker();
      lightFlickerStep([], [], S.interiorLightTargets || [], 0, 2);
      const readback = clayRoomReadback(true);
      if(!readback) throw new Error("could not read rendered pixels for " + recipeId);
      const recipe = LIGHT_TUNABLES.profiles[recipeId];
      const targetById = {};
      (S.interiorLightTargets || []).forEach(function(target){ targetById[target.id] = target; });
      const liveLights = [];
      if(S.interiorGroup){
        S.interiorGroup.traverse(function(light){
          if(!light || !light.isLight || !light.userData || !light.userData.lightId) return;
          const worldPosition = new THREE.Vector3();
          light.getWorldPosition(worldPosition);
          const target = targetById[light.userData.lightId];
          liveLights.push({
            id: light.userData.lightId,
            type: light.isDirectionalLight ? "directional"
              : light.isAmbientLight ? "environment"
              : light.isSpotLight ? "spot" : "point",
            state: light.userData.lightState || (target && target.state) || "steady",
            color: light.color && typeof light.color.getHex === "function" ? light.color.getHex() : null,
            intensity: Number.isFinite(light.intensity) ? +light.intensity.toFixed(6) : null,
            range: Number.isFinite(light.distance) ? +light.distance.toFixed(6) : null,
            decay: Number.isFinite(light.decay) ? +light.decay.toFixed(6) : null,
            castShadow: !!light.castShadow,
            worldPosition: {
              x: +worldPosition.x.toFixed(6),
              y: +worldPosition.y.toFixed(6),
              z: +worldPosition.z.toFixed(6)
            },
            sampleIndex: target ? target.sampleIndex : 0,
            normalizedSample: target && Number.isFinite(target.normalizedSample)
              ? +target.normalizedSample.toFixed(6) : 1
          });
        });
      }
      cards.push({
        recipeId: recipeId,
        label: recipe.label,
        mode: recipe.mode,
        source: lightRecipeDeepClone(recipe.source),
        canvas: clayRoomCanvasFromReadback(readback),
        metrics: clayRoomMetricsForRgba(
          readback.pixels,
          readback.width,
          readback.height,
          null,
          { sampleStep: 2, flipY: readback.flipY }
        ),
        lights: liveLights
      });
    }

    const cardWidth = 380, cardHeight = 360, columns = 4;
    const rows = Math.ceil(cards.length / columns);
    const sheet = document.createElement("canvas");
    sheet.width = columns * cardWidth;
    sheet.height = 104 + rows * cardHeight;
    const ctx = sheet.getContext("2d");
    ctx.fillStyle = "#0b0d11";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = "#eef3f8";
    ctx.font = "600 28px -apple-system, sans-serif";
    ctx.fillText("CL-R1 · LIGHTING COMPARISON", 24, 38);
    ctx.fillStyle = "#9aa8b8";
    ctx.font = "16px monospace";
    ctx.fillText(
      "production renderer · fixture " + CLAY_ROOM_LIGHTING_BENCH_ID
        + " · preview seed " + previewSeed + " · dynamic sample 2",
      24,
      70
    );
    ctx.fillText("brightness, clipping, and colour are measured from final display pixels", 24, 94);
    cards.forEach(function(card, index){
      const col = index % columns, row = Math.floor(index / columns);
      const x = col * cardWidth, y = 104 + row * cardHeight;
      ctx.fillStyle = index % 2 ? "#11151b" : "#0f1318";
      ctx.fillRect(x + 6, y + 6, cardWidth - 12, cardHeight - 12);
      ctx.strokeStyle = card.source.loreNative ? "#476a58" : "#665b3d";
      ctx.strokeRect(x + 6.5, y + 6.5, cardWidth - 13, cardHeight - 13);
      ctx.fillStyle = "#edf2f7";
      ctx.font = "600 18px -apple-system, sans-serif";
      ctx.fillText(card.label, x + 18, y + 33);
      ctx.fillStyle = card.source.loreNative ? "#7fd6a4" : "#d8bd72";
      ctx.font = "12px monospace";
      ctx.fillText(card.source.loreNative ? "LORE-NATIVE" : "DIAGNOSTIC ONLY", x + 18, y + 52);
      const imageX = x + 18, imageY = y + 64, imageW = cardWidth - 36, imageH = 220;
      ctx.fillStyle = "#050608";
      ctx.fillRect(imageX, imageY, imageW, imageH);
      const imageScale = Math.min(imageW / card.canvas.width, imageH / card.canvas.height);
      const drawW = card.canvas.width * imageScale, drawH = card.canvas.height * imageScale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        card.canvas,
        imageX + (imageW - drawW) / 2,
        imageY + (imageH - drawH) / 2,
        drawW,
        drawH
      );
      const m = card.metrics;
      ctx.fillStyle = "#b9c6d3";
      ctx.font = "12px monospace";
      ctx.fillText("median " + m.medianLuma + "/255 · p95 " + m.p95Luma + "/255", x + 18, y + 306);
      ctx.fillText(
        "clipped " + m.clippedHighlightPct.toFixed(3) + "% · crushed "
          + m.crushedShadowPct.toFixed(3) + "%",
        x + 18,
        y + 325
      );
      ctx.fillText("colour spread " + m.meanChromaSpread.toFixed(2) + "/255", x + 18, y + 344);
    });

    const receipt = {
      id: "cl-r1-lighting-comparison",
      version: 1,
      rendererPath: "authored light lock -> clayRoomBoardFrom -> production Theater -> display-space framebuffer",
      fixtureId: CLAY_ROOM_LIGHTING_BENCH_ID,
      fixtureVersion: CLAY_LIGHTING_BENCH_FIXTURE.version,
      fixtureSeed: S.clayRoomRecord ? S.clayRoomRecord.seed : null,
      previewSeed: previewSeed,
      dynamicSampleIndex: 2,
      lightLock: {
        id: LIGHT_PROFILE_LOCKS_COMPILED.id,
        version: LIGHT_PROFILE_LOCKS_COMPILED.version,
        schemaVersion: LIGHT_PROFILE_LOCKS_COMPILED.schemaVersion
      },
      sourceSprite: S.clayRoomSourceSprite ? {
        path: S.clayRoomSourceSprite.path,
        metrics: S.clayRoomSourceSprite.metrics
      } : null,
      cards: cards.map(function(card){
        return {
          recipeId: card.recipeId,
          label: card.label,
          mode: card.mode,
          source: card.source,
          metrics: card.metrics,
          lights: card.lights
        };
      })
    };
    const dataUrl = sheet.toDataURL("image/png");
    S.clayRoomLightingMatrixArtifact = {
      receipt: receipt,
      dataUrl: dataUrl,
      width: sheet.width,
      height: sheet.height
    };
    clayRoomShowLightingMatrix(sheet, receipt);
    if(S.clayRoomMatrixStatusEl){
      S.clayRoomMatrixStatusEl.textContent = "ready · 7 recipes · PNG + receipt";
    }
    return S.clayRoomLightingMatrixArtifact;
  } catch(error) {
    if(S.clayRoomMatrixStatusEl) S.clayRoomMatrixStatusEl.textContent = "capture failed · " + error.message;
    throw error;
  } finally {
    S.clayRoomLightOverlayModes = originalOverlayModes;
    clayRoomSetLightingRecipe(originalRecipeId, "clayroom-matrix-restore");
    clayRoomBuildLightOverlays();
    S.clayRoomMatrixCaptureInProgress = false;
  }
}

/* clayRoomAfterInteriorBoardRebuild() — THE ONE LIFECYCLE HOOK. Called from setInteriorBoard's own
   tail (its single exit point), so it fires on the mount's first build AND on every asynchronous
   replay, without the clay surface having to know that those replay sites exist. A no-op unless the
   clay fixture is active, so the byte-for-byte-identical-boot requirement (D1) is unchanged: one
   boolean read per interior rebuild in normal play.

   Order matters: materials first (so a census taken later sees the routed tree), then the light
   profile (setInteriorBoard's own rigOn block has just overwritten S.ambientLight/S.pointLights),
   then provenance re-tagging (the rebuild replaced the children the previous tags pointed at). */
function clayRoomAfterInteriorBoardRebuild(){
  if(!S.clayRoomDiagnosticActive) return;
  clayRoomMountStructureBench();
  clayRoomMountLightingBench();
  clayRoomMountSpriteBench();
  clayRoomSuppressLightingBenchNoise();
  clayRoomApplyDiagnosticSurfaces();
  clayRoomApplyLightProfile(S.clayRoomRecord);
  clayRoomBuildLightOverlays();
  clayRoomTagAllProvenance();
  // pan/zoom survives rebuilds without compounding: capture THIS rebuild's fresh camera fit, then
  // re-derive the pose from fit ∘ offset ∘ zoom (see the CLAY CAMERA PAN/ZOOM block).
  // PROBE-CAUGHT (2026-07-23): placeCameraTweened GLIDES to the new fit, so at this hook the camera
  // still holds the pre-rebuild pose — capturing here stored a contaminated "fit" (pan+zoom baked
  // in, then re-applied on top = double), and the tween then landed on the TRUE fit, wiping the pan
  // entirely (probe: afterNudgeRebuild snapped back to the fit; reset then restored the contaminated
  // pose). Settle ONLY the camera-pose tween to its END pose first. The old drainTweens(S) call
  // force-finished every channel, including a newly queued door-state tween, which made the
  // Clayroom incapable of proving that a door actually swings. Board teardown still uses the full
  // drain; this live post-build hook preserves non-camera animation.
  clayRoomSettleCameraPoseTween();
  clayRoomCaptureCamFit();
  clayRoomApplyCamPose();
  if(S.clayRoomSelectedId) clayRoomHighlightSelection(S.clayRoomSelectedId);
  if(typeof S.clayRoomRefreshSprites === "function") S.clayRoomRefreshSprites();
}

function clayRoomSettleCameraPoseTween(){
  if(!S.tweens || !S.tweens.length) return;
  const keep = [], settle = [];
  S.tweens.forEach(function(tw){
    if(tw && tw.isCameraPoseTween) settle.push(tw);
    else keep.push(tw);
  });
  S.tweens = keep;
  settle.forEach(function(tw){
    if(tw && typeof tw.onDone === "function"){
      try { tw.onDone(); } catch(e){}
    }
  });
}

// ─── D12a (Adam's founder redline, capture packet #1, 2026-07-23 — verbatim: "i need a semi-
// transparent grid overlaying the seams of the tiles") ───────────────────────────────────────────
// A semi-transparent THREE.LineSegments grid drawn exactly on every cell BOUNDARY of the record's
// own floor — a visual truth aid, never a second source of cell geometry. Line COUNT is derived
// FROM record.dims, never a hardcoded literal: (w+1) lines running along Z (one per x-boundary,
// x=0..w) + (d+1) lines running along X (one per z-boundary, z=0..d) — exactly the spec's own
// "(w+1)+(d+1) lines". Origin/cell-size math mirrors the SAME law the floor itself renders through:
// cell size = 1 world unit = 5 ft (GRID LAW), origin = S.boardOrigin (setInteriorBoard's own
// (minX+maxX)/2,(minZ+maxZ)/2 — the EXACT cx/cz every floor/wall/doorframe instance already
// subtracts, interiorBuildInstancedMesh's own position.set line, this file ~8097) — read LIVE off S
// rather than re-derived, so the grid can never drift from wherever the floor actually mounted; a
// record.dims-only fallback (== the SAME (w-1)/2,(d-1)/2 setInteriorBoard would compute for this
// record's own bounds) covers a harness/edge case where S.boardOrigin hasn't been set yet. y sits
// just above the floor's own TOP surface via interiorFloorTopAt (the SAME derived-never-hand-tuned
// law every other floor-contact mount in this file already uses) plus a small clearance
// (CLAY_GRID_CLEARANCE, matching f1BuildCombatGrid's own +0.01 decal-clearance convention, this
// file ~10411) — enough to clear z-fighting without visibly floating. LineBasicMaterial (linewidth
// is capped at 1 on most GL backends — accepted per spec, never fought with a fatter-line shader).
// depthWrite:false (this file's own standard transparent-decal pairing) keeps it from corrupting
// the depth buffer other transparent draws (the citizen's sprite billboard) test against; a
// renderOrder BELOW the scene default (0) draws it EARLY in the transparent queue so it composites
// under later-drawn transparent geometry ("under the figures/objects", D12a), while ordinary
// depth-tested opaque geometry (walls, the crate, the door) still correctly occludes it via the
// normal depth test regardless of renderOrder. Added directly to S.scene (never as a child of
// S.interiorGroup) so setInteriorBoard's own clearGroup(S.interiorGroup) — which reruns on every
// async replay this mount can trigger (a sprite texture settling, the D12b kit-door template
// warming) — can never silently wipe it the way a same-frame reassert would otherwise have to guard
// against (mirrors clayRoomApplyLightProfile's own per-frame-reassert note just above, for the
// SAME class of replay, minus the need for a reassert since nothing else in this file ever touches
// S.scene's own top-level children list).
// CL-R0: colour/opacity now come from CLAY_DIAGNOSTIC_SURFACE_RECIPE, not from literals here — the
// grid is part of the diagnostic surface and must be legible against whatever the recipe paints the
// floor. The authored white was chosen against the REGRESSED near-black floor and disappeared the
// moment CL-R0 restored legible clay; that dependency is exactly why the value belongs in the recipe.
// Read at CALL time (see the CLAY_GREY note above for why module-eval reads of the engine module
// are forbidden here). D12a's own 0.25-0.35 opacity law is enforced on the recipe by the harness.
function clayRoomGridColor(){ return CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridColor; }
function clayRoomGridOpacity(){ return CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridOpacity; }
const CLAY_GRID_CLEARANCE = 0.01;   // matches f1BuildCombatGrid's own +0.01 (this file ~10411)
// CL-R0 COORDINATE FIX (found by the provenance audit's own new bbox field, not by eye): this grid
// was authored against the record's LOCAL 0..4 cell frame, but D15 re-wired the render to compile
// through the real spatializer, which places the room at the plan rect (room.x, room.y) — (3, 13)
// for the pinned fixture. setInteriorBoard then centres on the BOARD's bounds, so the floor draws at
// `room.x + cellX - cx` while this grid drew at `cellX - cx`: the grid mounted a full (3, 13) cells
// away from the room it was meant to overlay (audited bbox x[-5.5,-0.5] z[-15.5,-10.5] against a
// board of x[-3.5,3.5] z[-3.5,3.5]) and was simply off-camera. It audited "owned" the whole time,
// which is why the D13 audit alone never caught it. Nobody SAW it because the regressed floor was
// near-black; CL-R0's legible clay is what made the absence visible. `roomRect` is the spatialized
// room (clayRoomBoardFrom's own `room`), passed in rather than re-derived so the grid can never
// drift from wherever the spatializer actually put the room.
function clayRoomBuildSeamGrid(record, roomRect){
  if(!S.scene) return null;
  const ox = roomRect && typeof roomRect.x === "number" ? roomRect.x : 0;
  const oz = roomRect && typeof roomRect.y === "number" ? roomRect.y : 0;
  const cx = (S.boardOrigin && typeof S.boardOrigin.cx === "number") ? S.boardOrigin.cx : ox + (record.dims.w - 1) / 2;
  const cz = (S.boardOrigin && typeof S.boardOrigin.cz === "number") ? S.boardOrigin.cz : oz + (record.dims.d - 1) / 2;
  // Sample the floor-top map at a REAL cell of this room (its own origin cell), not at plan (0,0) —
  // which is outside the room entirely and silently returned the fallback height.
  const floorTop = interiorFloorTopAt(S.interiorFloorTopMap, ox, oz); // this record's floor is flat — any of its cells answers the same value
  const y = floorTop + CLAY_GRID_CLEARANCE;
  const minX = ox - 0.5 - cx, maxX = ox + (record.dims.w - 1) + 0.5 - cx;
  const minZ = oz - 0.5 - cz, maxZ = oz + (record.dims.d - 1) + 0.5 - cz;
  const pts = [];
  for(let ix = 0; ix <= record.dims.w; ix++){
    const x = ox + ix - 0.5 - cx;
    pts.push(x, y, minZ, x, y, maxZ);
  }
  for(let iz = 0; iz <= record.dims.d; iz++){
    const z = oz + iz - 0.5 - cz;
    pts.push(minX, y, z, maxX, y, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color: clayRoomGridColor(), transparent: true, opacity: clayRoomGridOpacity(), depthWrite: false });
  const grid = new THREE.LineSegments(geo, mat);
  grid.renderOrder = -1;
  grid.userData.clayGrid = true;
  S.scene.add(grid);
  return grid;
}

/* ─── C1B MOVEMENT PROJECTION ─────────────────────────────────────────────────────────────────
   The production TacticalQueryKernel owns cells, cost, legality, route choice, connection use, and
   preview/commit receipts. These helpers only project its immutable answers into the real Theater:
   a filled primary band, a hollow diamond Dash extension, an exact route line, and one move-step
   standee animation per receipt cell. No rule math lives here.
*/
function clayRoomMovementSession(){
  return (typeof GS !== "undefined" && GS) ? GS.clayRoomMovementSession || null : null;
}
function clayRoomMovementPoint(cellId){
  const coord = (typeof tqCellCoord === "function") ? tqCellCoord(cellId) : null;
  if(!coord || !S.boardOrigin) return null;
  const floorY = interiorFloorTopAt(S.interiorFloorTopMap, coord.x, coord.y);
  return new THREE.Vector3(
    coord.x - S.boardOrigin.cx,
    floorY + 0.025,
    coord.y - S.boardOrigin.cz
  );
}
function clayRoomDisposeMovementOverlay(){
  const group = S.clayRoomMovementOverlayGroup;
  if(!group) return;
  if(group.parent) group.parent.remove(group);
  group.traverse(function(node){
    if(node.geometry && node.geometry.dispose) node.geometry.dispose();
    if(node.material){
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(function(mat){ if(mat && mat.dispose) mat.dispose(); });
    }
  });
  S.clayRoomMovementOverlayGroup = null;
}
function clayRoomMovementCellInFocus(cellId){
  const coord = (typeof tqCellCoord === "function") ? tqCellCoord(cellId) : null;
  const room = S.clayRoomCompiled && S.clayRoomCompiled.room;
  return !!(coord && room
    && coord.x >= room.x && coord.x < room.x + room.w
    && coord.y >= room.y && coord.y < room.y + room.d);
}
function clayRoomRenderMovementOverlay(ranges, preview){
  clayRoomDisposeMovementOverlay();
  if(!S.scene || !ranges) return;
  const group = new THREE.Group();
  group.userData.clayMovementOverlay = true;
  const moveGeo = new THREE.BoxGeometry(0.86, 0.018, 0.86);
  const moveMat = new THREE.MeshBasicMaterial({
    color: 0x43b9df, transparent: true, opacity: 0.26,
    depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2
  });
  (ranges.moveCellIds || []).forEach(function(cellId){
    if(!clayRoomMovementCellInFocus(cellId)) return;
    const point = clayRoomMovementPoint(cellId); if(!point) return;
    const tile = new THREE.Mesh(moveGeo, moveMat);
    tile.position.copy(point);
    tile.userData.rangeBand = "move";
    tile.userData.cellId = cellId;
    tile.renderOrder = 20;
    group.add(tile);
  });
  const dashGeo = new THREE.RingGeometry(0.26, 0.40, 4);
  const dashMat = new THREE.MeshBasicMaterial({
    color: 0xf2bd54, transparent: true, opacity: 0.75,
    side: THREE.DoubleSide, depthWrite: false, depthTest: false
  });
  (ranges.dashCellIds || []).forEach(function(cellId){
    if(!clayRoomMovementCellInFocus(cellId)) return;
    const point = clayRoomMovementPoint(cellId); if(!point) return;
    const diamond = new THREE.Mesh(dashGeo, dashMat);
    diamond.rotation.x = -Math.PI / 2;
    diamond.rotation.z = Math.PI / 4;
    diamond.position.copy(point);
    diamond.position.y += 0.015;
    diamond.userData.rangeBand = "dash";
    diamond.userData.cellId = cellId;
    diamond.renderOrder = 21;
    group.add(diamond);
  });
  const origin = clayRoomMovementPoint(ranges.originCellId);
  if(origin){
    const originMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.45, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthTest: false })
    );
    originMesh.rotation.x = -Math.PI / 2;
    originMesh.position.copy(origin);
    originMesh.position.y += 0.035;
    originMesh.userData.rangeBand = "origin";
    originMesh.renderOrder = 23;
    group.add(originMesh);
  }
  if(preview && preview.ok && preview.route && preview.route.cells){
    const routePoints = preview.route.cells
      .filter(clayRoomMovementCellInFocus)
      .map(clayRoomMovementPoint)
      .filter(Boolean)
      .map(function(point){ point.y += 0.06; return point; });
    if(routePoints.length >= 2){
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(routePoints),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: false })
      );
      line.userData.clayMovementRoute = true;
      line.renderOrder = 24;
      group.add(line);
    }
    routePoints.forEach(function(point, index){
      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(index === routePoints.length - 1 ? 0.16 : 0.09, 16),
        new THREE.MeshBasicMaterial({
          color: index === routePoints.length - 1 ? 0x79e5a3 : 0xffffff,
          side: THREE.DoubleSide, depthTest: false
        })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.copy(point);
      marker.position.y += 0.01;
      marker.userData.clayMovementStep = index;
      marker.renderOrder = 25;
      group.add(marker);
    });
  }
  S.scene.add(group);
  S.clayRoomMovementOverlayGroup = group;
  S.clayRoomMovementOverlaySummary = {
    revision: ranges.stateRevision,
    originCellId: ranges.originCellId,
    moveCells: ranges.moveCellIds.length,
    dashCells: ranges.dashCellIds.length,
    previewId: preview ? preview.id : null,
    previewOk: preview ? preview.ok : null
  };
  markDirty();
  scheduleRender();
}
function clayRoomMovementRangesRender(){
  if(S.clayRoomFixtureId !== CLAY_ROOM_TRUTH_FIXTURE_ID){
    clayRoomDisposeMovementOverlay();
    return null;
  }
  const session = clayRoomMovementSession();
  if(!session) return null;
  const ranges = tqMovementRanges(session.fixture.space, session.state, session.fixture.actorId);
  clayRoomRenderMovementOverlay(ranges, session.preview);
  return ranges;
}
function clayRoomMovementPickAt(ev, host){
  const session = clayRoomMovementSession();
  if(!session || !S.camera || !S.boardOrigin || !host) return false;
  const rect = host.getBoundingClientRect();
  if(rect.width <= 0 || rect.height <= 0) return false;
  const pointer = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, S.camera);
  const floorY = interiorFloorTopAt(
    S.interiorFloorTopMap,
    session.state.actors[0].cellId ? tqCellCoord(session.state.actors[0].cellId).x : 0,
    session.state.actors[0].cellId ? tqCellCoord(session.state.actors[0].cellId).y : 0
  );
  const point = new THREE.Vector3();
  if(!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY), point)) return false;
  const cellId = tqCellId(
    Math.round(point.x + S.boardOrigin.cx),
    Math.round(point.z + S.boardOrigin.cz)
  );
  if(!session.fixture.space.cells.some(function(cell){ return cell.id === cellId; })) return false;
  if(S.clayRoomMovementPreviewCell) S.clayRoomMovementPreviewCell(cellId);
  return true;
}
function clayRoomMovementBoardFromState(state){
  const compiled = S.clayRoomCompiled;
  if(!compiled || !compiled.board || !state) return null;
  const session = clayRoomMovementSession();
  const actor = state.actors.find(function(row){ return row.id === session.fixture.actorId; });
  const connection = state.connections.find(function(row){ return row.id === session.fixture.connectionId; });
  const base = compiled.board;
  let pieces = [];
  if(actor && actor.sceneId === "clay-room"){
    const coord = tqCellCoord(actor.cellId);
    pieces = (base.pieces || []).map(function(piece){
      return Object.assign({}, piece, { cellX: coord.x, cellY: coord.y });
    });
  }
  const interactables = (base.interactables || []).map(function(entry){
    return entry.connectionId === session.fixture.connectionId
      ? Object.assign({}, entry, { state: connection ? connection.state : "shut" })
      : entry;
  });
  if(S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID){
    const fixture = clayRoomLightingBenchFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    pieces = pieces.map(function(piece){
      return Object.assign({}, piece, {
        cellX: room.x + fixture.spriteCell.x,
        cellY: room.y + fixture.spriteCell.z
      });
    });
    // CL-F02 is a measurement fixture. The approved sprite remains, but the room-truth crate and
    // door are removed from this projection so their extra faces do not muddle the comparison.
    return Object.assign({}, base, {
      pieces: pieces,
      furniture: [],
      interactables: [],
      dressing: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID){
    // CL-F01 isolates architecture. The outer production room remains the calibrated floor/light/
    // camera host; its crate, citizen, dressing, and authored door cannot be mistaken for bench
    // specimens. The structure fixture itself mounts in the post-build lifecycle hook below.
    const fixture = clayRoomStructureBenchFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    const witness = fixture.cutawayWitness;
    const witnessPiece = {
      id: witness.id,
      sourceRef: witness.pieceSlug,
      slug: witness.pieceSlug,
      label: "Human scale / cutaway witness",
      cellX: room.x + witness.pieceCell.x,
      cellY: room.y + witness.pieceCell.z,
      allowOverheight: true
    };
    const witnessPillar = {
      x: room.x + witness.occluder.at.x,
      z: room.y + witness.occluder.at.z,
      sx: witness.occluder.sx,
      sy: witness.occluder.sy,
      sz: witness.occluder.sz,
      color: "#888888",
      profile: witness.occluder.profile,
      sourceRef: witness.occluder.id
    };
    return Object.assign({}, base, {
      instances: Object.assign({}, base.instances, {
        pillar: (base.instances.pillar || []).concat([witnessPillar])
      }),
      pieces: [witnessPiece],
      furniture: [],
      interactables: [],
      dressing: [],
      wallProps: []
    });
  }
  if(S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID){
    const fixture = clayRoomSpriteCitizenshipFixtureFrom(S.clayRoomRecord);
    const room = compiled.room;
    const capMode = S.clayRoomSpriteScaleMode === "diagnostic-cap";
    const cap = fixture.candidatePresentationCap;
    pieces = fixture.cast.map(function(spec){
      const registry = spriteEntryFor(spec.slug);
      const worldHeight = registry && Number.isFinite(registry.worldHeight)
        ? registry.worldHeight
        : (registry && Number.isFinite(registry.feet) ? registry.feet : HUMAN_TRUE_HEIGHT * 5);
      const presentedFeet = capMode
        ? Math.max(cap.minFeet, Math.min(cap.maxFeet, worldHeight))
        : worldHeight;
      return {
        id: "clay-citizen-" + spec.slug,
        sourceRef: spec.slug,
        slug: spec.slug,
        label: spec.label,
        stress: spec.stress,
        tacticalSpanCells: spec.tacticalSpanCells,
        cellX: room.x + spec.lineupCell.x,
        cellY: room.y + spec.lineupCell.z,
        scaleVsHuman: capMode ? presentedFeet / 5.5 : null,
        allowOverheight: true
      };
    });
    return Object.assign({}, base, {
      pieces: pieces,
      furniture: [],
      interactables: [],
      dressing: [],
      cameraFit: {
        maxHeight: capMode ? cap.maxFeet / 5 : Math.max.apply(null, fixture.cast.map(function(spec){
          const registry = spriteEntryFor(spec.slug);
          return registry && Number.isFinite(registry.worldHeight) ? registry.worldHeight / 5 : 1.1;
        }))
      }
    });
  }
  return Object.assign({}, base, { pieces: pieces, interactables: interactables });
}
function clayRoomApplyMovementBoard(state, reason){
  const board = clayRoomMovementBoardFromState(state);
  if(!board) return;
  S.boardKey = null;
  setInteriorBoard(board, { roomTransition: false, reason: reason || "clayroom-movement-commit" });
  clayRoomMovementRangesRender();
}
function clayRoomAnimateMovementReceipt(receipt, onDone, onProgress){
  const session = clayRoomMovementSession();
  const actor = session && (findUnit(session.fixture.actorId) || clayRoomNodeForSelection(session.fixture.actorId));
  const cells = receipt && receipt.route ? receipt.route.cells || [] : [];
  if(session){
    session.animationProof = {
      receiptId: receipt ? receipt.id : null,
      actorFound: !!actor,
      requestedSteps: Math.max(0, cells.length - 1),
      startedSteps: 0,
      completedSteps: 0,
      selectionProbe: S.clayRoomSelectionProbe || null,
      status: actor && cells.length >= 2 ? "active" : "degraded-no-mounted-actor"
    };
  }
  if(!actor || cells.length < 2){
    if(onProgress) onProgress();
    if(onDone) onDone();
    return;
  }
  if(onProgress) onProgress();
  const fromPoint = clayRoomMovementPoint(cells[0]);
  const visualOffset = fromPoint ? {
    x: actor.position.x - fromPoint.x,
    z: actor.position.z - fromPoint.z
  } : { x: 0, z: 0 };
  let index = 1;
  function playNext(){
    if(index >= cells.length){
      session.animationProof.status = "settled";
      if(onProgress) onProgress();
      if(onDone) onDone();
      return;
    }
    const point = clayRoomMovementPoint(cells[index++]);
    if(!point){ playNext(); return; }
    point.x += visualOffset.x;
    point.z += visualOffset.z;
    point.y = actor.position.y;
    bindStandeeCtx(buildTheaterCtx());
    session.animationProof.startedSteps++;
    if(onProgress) onProgress();
    const started = playStandeeVerb(actor, "move-step", {
      targetPos: point,
      // tickTweens replaces its live list at the end of each pass. Schedule the next cell after
      // that pass completes so a tween created from onDone cannot be discarded as re-entrant work.
      onDone: function(){
        session.animationProof.completedSteps++;
        if(onProgress) onProgress();
        setTimeout(playNext, 0);
      }
    });
    if(started) startTweenLoop();
    else {
      session.animationProof.status = "degraded-verb-refused";
      playNext();
    }
  }
  playNext();
}

// ─── D13 (docs/C1A-CLAY-ROOM.md spec addendum D15 point 4 — provenance audit) ──────────────────────
// clayRoomTagProvenance(node,builder) stamps userData.clayProvenance = {builder,recordRef:"clay-c1a"}
// on ONE node and records it in S.clayRoomProvenanceRoots — the tracked root SET
// clayRoomProvenanceAudit walks. Scope is deliberately the clay mount's OWN attachment points
// (S.interiorGroup as a whole — the real production board tree setInteriorBoard just populated,
// floor/wall/doorframe/pillar/lights/pieces/furniture/dressing/interactables all nested under it;
// S.clayGridMesh; the light-profile's own ambient+point lights), never mount()'s generic baseline
// scaffolding (the hemisphere/key/fill lights and empty tile/prop/unit/shadow/fx groups every theater
// instance gets regardless of clay) — that scaffolding traces to no record and tagging it would be a
// false provenance claim, not an honest one. "Under a tagged group" (D15's own words) reads as: every
// one of these tracked roots IS itself tagged at attachment time, so nothing in this tracked set can
// ever be an orphan by construction; an entry only shows up missing if the node it names was never
// built at all (e.g. mount() degraded, S.interiorGroup absent) — reported as an orphan then, honestly.
function clayRoomTagProvenance(node, builder){
  if(!node || !node.userData) return;
  node.userData.clayProvenance = { builder: builder, recordRef: "clay-c1a" };
  S.clayRoomProvenanceRoots = S.clayRoomProvenanceRoots || [];
  S.clayRoomProvenanceRoots.push(node);
}
function clayRoomTagAllProvenance(){
  S.clayRoomProvenanceRoots = [];
  if(S.interiorGroup) clayRoomTagProvenance(S.interiorGroup, "setInteriorBoard"); // board/figure/lights/furniture — nested
  if(S.clayGridMesh) clayRoomTagProvenance(S.clayGridMesh, "clayRoomBuildSeamGrid"); // grid
  if(S.clayRoomLightOverlayGroup) clayRoomTagProvenance(S.clayRoomLightOverlayGroup, "clayRoomBuildLightOverlays");
  if(S.ambientLight) clayRoomTagProvenance(S.ambientLight, "clayRoomApplyLightProfile"); // lights
  (S.pointLights || []).forEach(function(l){ clayRoomTagProvenance(l, "clayRoomApplyLightProfile"); }); // lights
}
// clayRoomProvenanceAudit() -> {tagged:[{type,builder}...], orphans:[{type}...]} — walks
// S.clayRoomProvenanceRoots (populated by clayRoomTagAllProvenance at mount time), never all of
// S.scene.children (see this section's own header note on why that scope would be dishonest).
function clayRoomProvenanceAudit(){
  const tagged = [], orphans = [];
  (S.clayRoomProvenanceRoots || []).forEach(function(node){
    if(node && node.userData && node.userData.clayProvenance){
      // CL-R0: the audit now also reports WHERE each owned root actually sits. "Owned" is only half
      // the provenance question; a correctly-tagged object mounted in the wrong coordinate frame is
      // still a lie the frame tells. (Found by exactly this: the D12a seam grid audited clean while
      // rendering nowhere near the floor.) Lights have no geometry, so bbox is null for them.
      let bbox = null;
      try {
        if(node.isObject3D && typeof THREE !== "undefined" && THREE.Box3){
          const box = new THREE.Box3().setFromObject(node);
          if(isFinite(box.min.x)) bbox = {
            min: [+box.min.x.toFixed(3), +box.min.y.toFixed(3), +box.min.z.toFixed(3)],
            max: [+box.max.x.toFixed(3), +box.max.y.toFixed(3), +box.max.z.toFixed(3)],
          };
        }
      } catch(e){}
      tagged.push({ type: node.type, builder: node.userData.clayProvenance.builder, bbox: bbox });
    } else if(node){
      orphans.push({ type: node.type });
    }
  });
  return { tagged: tagged, orphans: orphans };
}

/* ─── CLAY CAMERA PAN/ZOOM (Adam, 2026-07-23: "i need to be able to pan around the room because the
   control panel is blocking the door") ─────────────────────────────────────────────────────────────
   The GOVERNED camera verbs only (W3 §12.13: fixed camera with governed pan/zoom/focus; the
   Workbench ruling forbids unlocked production camera PITCH): panning translates the camera position
   and its look target by the SAME ground-plane offset, and zoom dollies along the existing view ray
   — bearing and pitch are mathematically unchanged by both. No orbit, no rotation, dev-surface only
   (listeners exist solely on the clay host, which is created at clay mount and removed at unmount).

   Pose model: every rebuild re-fits the camera (placeCameraTweened), so the pan must survive
   rebuilds without compounding — the FIT pose is captured once per rebuild
   (clayRoomCaptureCamFit, called from the one lifecycle hook) and the final pose is always
   pose = fit ∘ offset ∘ zoom, recomputed from scratch. Drag = grab convention (the room follows
   the cursor). Double-click resets. */
// The fitted pose remains the reset/default. 0.12 lets the art director dolly roughly 8.3× closer
// for feet, shell, and alpha-edge inspection without unlocking bearing or pitch.
const CLAY_CAM_ZOOM_MIN = 0.12, CLAY_CAM_ZOOM_MAX = 2.5;
function clayRoomCaptureCamFit(){
  if(!S.camera) return;
  const t = S.cameraLookTarget ? S.cameraLookTarget.clone() : new THREE.Vector3(0, 0, 0);
  S.clayCamFit = { pos: S.camera.position.clone(), target: t };
  if(!S.clayCamOffset) S.clayCamOffset = { x: 0, z: 0 };
  if(!S.clayCamZoom) S.clayCamZoom = 1;
}
function clayRoomApplyCamPose(){
  if(!S.camera || !S.clayCamFit) return;
  const off = S.clayCamOffset || { x: 0, z: 0 };
  const zoom = S.clayCamZoom || 1;
  const target = S.clayCamFit.target.clone(); target.x += off.x; target.z += off.z;
  const pos = S.clayCamFit.pos.clone(); pos.x += off.x; pos.z += off.z;
  if(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    && S.clayRoomStructureView === "strategic"){
    // The strategic camera is the one governed pitch exception named by the wall-omission ruling:
    // fixed 72° map-reading pitch, same production bearing, pan, target, and perspective camera.
    // It is a named mode, never free orbit. Every wall is compiled in this mode (see CL-F01 mount).
    const ray = pos.sub(target);
    // Checkpoint 4 ("ALL WALLS is poorly fitted in the narrow viewport, crops or flattens the
    // scene"): the map-reading distance is computed from the ROOM'S OWN BOUNDS against the live
    // camera fov/aspect, not inherited from the production-pitch fit ray. The 72° pitch, bearing,
    // and governed zoom are unchanged — only the fit is honest to the viewport now.
    let distance;
    {
      const halfDiag = Math.sqrt(
        Math.pow(S.boardHalfX || 8, 2) + Math.pow(S.boardHalfZ || 8, 2)
      ) * 1.12 + 1.5; // margin: wall thickness + breathing room
      const vFov = ((S.camera.fov || 20) * Math.PI / 180) / 2;
      const aspect = S.camera.aspect || 1;
      const hFov = Math.atan(Math.tan(vFov) * aspect);
      distance = (halfDiag / Math.tan(Math.min(vFov, hFov))) * zoom;
    }
    const ground = new THREE.Vector2(ray.x, ray.z);
    if(ground.lengthSq() < 0.0001) ground.set(1, 1);
    ground.normalize();
    const pitch = 72 * Math.PI / 180;
    pos.set(
      target.x + ground.x * Math.cos(pitch) * distance,
      target.y + Math.sin(pitch) * distance,
      target.z + ground.y * Math.cos(pitch) * distance
    );
  } else {
    // dolly along the existing ray — direction (and therefore bearing+pitch) preserved exactly
    pos.sub(target).multiplyScalar(zoom).add(target);
  }
  S.camera.position.copy(pos);
  if(S.cameraLookTarget) S.cameraLookTarget.copy(target);
  S.camera.lookAt(target);
  S.clayRoomPixelMetricsCache = null;
  markDirty();
  scheduleRender();
}
function clayRoomNodeForSelection(id){
  if(!id || !S.interiorGroup) return null;
  let found = null;
  const probe = { requested: String(id), visited: 0, candidates: [] };
  S.interiorGroup.traverse(function(node){
    if(found || !node) return;
    probe.visited++;
    const ud = node.userData || {};
    const candidate = ud.structureSpecId || ud.unitId || ud.sceneObjectId || ud.lightId || ud.dressingSlug;
    if(candidate != null && probe.candidates.length < 12) probe.candidates.push(String(candidate));
    if(String(ud.structureSpecId || "") === String(id)
      || String(ud.sceneObjectId || "") === String(id)
      || String(ud.unitId || "") === String(id)
      || String(ud.lightId || "") === String(id)
      || String(ud.dressingSlug || "") === String(id)){
      found = node;
      return;
    }
    if(id === "room-shell" && ud.interiorKind
      && /^(room-shell|floor|wall|trim|skirt)/.test(String(ud.interiorKind))){
      found = node;
    }
  });
  probe.found = !!found;
  S.clayRoomSelectionProbe = probe;
  return found;
}
function clayRoomStandeeForSelectionNode(node){
  let cursor = node;
  while(cursor && cursor !== S.interiorGroup && cursor !== S.scene){
    if(cursor.userData && cursor.userData.sprite) return cursor;
    cursor = cursor.parent;
  }
  return null;
}
// CL-R2 selection follow-up — selected support illumination must read as NEON emitted by the blue
// vertical sidewall itself, never as a point bulb hidden at the base center. Standard real-time
// emissive materials do not illuminate nearby pixels, so the visible emission is paired with ONE
// very cheap, additive floor-spill quad shaped to the support's rounded-strip footprint. The opaque
// support hides its bright center; only the cyan feather immediately outside the physical sidewall
// remains visible. It adds no scene light, no extra shadow caster, and follows base relocation/yaw as
// a child of that same base.
const CLAY_SELECTION_BASE_NEON_COLOR = 0x53d5ff;
const CLAY_SELECTION_BASE_NEON_WIDTH_SCALE = 1.24;
const CLAY_SELECTION_BASE_NEON_DEPTH_SCALE = 1.72;
let CLAY_SELECTION_BASE_NEON_TEXTURE = null;
let CLAY_SELECTION_BASE_NEON_MATERIAL = null;
let CLAY_SELECTION_BASE_NEON_GEOMETRY = null;
function claySelectionBaseNeonTexture(){
  if(CLAY_SELECTION_BASE_NEON_TEXTURE) return CLAY_SELECTION_BASE_NEON_TEXTURE;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext && canvas.getContext("2d");
  if(ctx && typeof ctx.createRadialGradient === "function"){
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.72)");
    grad.addColorStop(0.46, "rgba(255,255,255,0.50)");
    grad.addColorStop(0.74, "rgba(255,255,255,0.20)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.userData.claySelectionBaseNeonTexture = true;
  CLAY_SELECTION_BASE_NEON_TEXTURE = tex;
  return tex;
}
function claySelectionBaseNeonMaterial(){
  if(CLAY_SELECTION_BASE_NEON_MATERIAL) return CLAY_SELECTION_BASE_NEON_MATERIAL;
  const mat = new THREE.MeshBasicMaterial({
    map: claySelectionBaseNeonTexture(),
    color: CLAY_SELECTION_BASE_NEON_COLOR,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  mat.userData.shared = true;
  mat.userData.claySelectionBaseNeonMaterial = true;
  CLAY_SELECTION_BASE_NEON_MATERIAL = mat;
  return mat;
}
function claySelectionBaseNeonGeometry(){
  if(CLAY_SELECTION_BASE_NEON_GEOMETRY) return CLAY_SELECTION_BASE_NEON_GEOMETRY;
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.userData.shared = true;
  CLAY_SELECTION_BASE_NEON_GEOMETRY = geo;
  return geo;
}
function setStandeeSelectionBaseNeon(fig, glowing){
  if(!fig || !fig.userData || !fig.userData.standeeBaseMesh) return;
  const base = fig.userData.standeeBaseMesh;
  let spill = fig.userData.claySelectionBaseNeon || null;
  if(glowing){
    if(!spill){
      spill = new THREE.Mesh(claySelectionBaseNeonGeometry(), claySelectionBaseNeonMaterial());
      spill.rotation.x = -Math.PI / 2;
      spill.position.set(0, -INTERIOR_BASE_HEIGHT - 0.002, 0);
      spill.scale.set(
        (base.userData.supportWidth || 0.45) * CLAY_SELECTION_BASE_NEON_WIDTH_SCALE,
        (base.userData.supportDepth || INTERIOR_BASE_TREAD_DEPTH) * CLAY_SELECTION_BASE_NEON_DEPTH_SCALE,
        1
      );
      spill.castShadow = false;
      spill.receiveShadow = false;
      spill.renderOrder = 3;
      spill.userData.claySelectionBaseNeon = true;
      spill.userData.emissionSource = "emissive-sidewall";
      spill.userData.footprintShape = "support-rounded-strip";
      spill.userData.spillWidth = spill.scale.x;
      spill.userData.spillDepth = spill.scale.y;
      fig.userData.claySelectionBaseNeon = spill;
    }
    if(spill.parent !== base){
      if(spill.parent) spill.parent.remove(spill);
      base.add(spill);
    }
    spill.visible = true;
    spill.userData.linkedSceneObjectId = fig.userData.sceneObjectId || fig.userData.unitId || null;
  } else if(spill){
    spill.visible = false;
  }
}
function setStandeeSelectionBaseRing(fig, glowing){
  if(!fig || !fig.userData || !fig.userData.standeeBaseMesh) return;
  const base = fig.userData.standeeBaseMesh;
  const mats = Array.isArray(base.material) ? base.material : [base.material];
  // ExtrudeGeometry's material contract is [top/bottom caps, vertical side wall]. Selection belongs
  // ONLY on index 1: the shallow outer face becomes a luminous ring while the top remains ordinary
  // stone and the character card receives no outline.
  const side = mats[1] || mats[0];
  if(side && side.emissive) side.emissive.setHex(glowing ? 0x53d5ff : 0x000000);
  if(base.layers){
    if(glowing) base.layers.enable(BLOOM_LAYER);
    else base.layers.disable(BLOOM_LAYER);
  }
  base.userData.claySelectionBaseRingGlow = !!glowing;
  setStandeeSelectionBaseNeon(fig, glowing);
}
function clayRoomClearSelectionGlow(){
  if(S.clayRoomSelectionGlowSprite){
    setStandeeSelectionBaseRing(S.clayRoomSelectionGlowSprite, false);
  }
  S.clayRoomSelectionGlowSprite = null;
}
function clayRoomMountSelectionGlow(node){
  const fig = clayRoomStandeeForSelectionNode(node);
  if(!fig || !S.scene) return;
  setStandeeSelectionBaseRing(fig, true);
  S.clayRoomSelectionGlowSprite = fig;
}
function clayRoomHighlightSelection(id){
  if(S.clayRoomSelectionHelper && S.clayRoomSelectionHelper.parent){
    S.clayRoomSelectionHelper.parent.remove(S.clayRoomSelectionHelper);
    if(S.clayRoomSelectionHelper.geometry) S.clayRoomSelectionHelper.geometry.dispose();
    if(S.clayRoomSelectionHelper.material) S.clayRoomSelectionHelper.material.dispose();
  }
  S.clayRoomSelectionHelper = null;
  clayRoomClearSelectionGlow();
  const node = clayRoomNodeForSelection(id);
  if(!node || !S.scene) return;
  // The compiled shell is the whole architectural composition, not one editable part. Boxing the
  // entire specimen field makes the assembled review read like a selection cage.
  if(id === "compiled-shell"){
    markDirty();
    scheduleRender();
    return;
  }
  // A standee selects through its diegetic base ring. Do not also draw the generic cyan BoxHelper
  // around the character card—the user's clarification is specifically that only the base wall
  // should light. Non-standee objects retain the workbench bounding-box diagnostic.
  if(clayRoomStandeeForSelectionNode(node)){
    clayRoomMountSelectionGlow(node);
    markDirty();
    scheduleRender();
    return;
  }
  const helper = new THREE.BoxHelper(node, 0x6fcfff);
  helper.material.depthTest = false;
  helper.material.transparent = true;
  helper.material.opacity = 0.9;
  helper.renderOrder = 999;
  helper.userData.claySelectionHelper = true;
  S.scene.add(helper);
  S.clayRoomSelectionHelper = helper;
  markDirty();
  scheduleRender();
}
function clayRoomPickAt(ev, host){
  if(!S.camera || !S.interiorGroup || !host) return null;
  const rect = host.getBoundingClientRect();
  if(rect.width <= 0 || rect.height <= 0) return null;
  const pointer = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, S.camera);
  const hits = raycaster.intersectObjects(S.interiorGroup.children, true);
  for(let i = 0; i < hits.length; i++){
    let node = hits[i].object;
    while(node && node !== S.interiorGroup){
      const ud = node.userData || {};
      const id = ud.structureSpecId || ud.sceneObjectId || ud.lightId || ud.dressingSlug;
      if(id){
        S.clayRoomSelectedId = id;
        if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(id, "viewport");
        return id;
      }
      if(ud.interiorKind && /^(room-shell|floor|wall|trim|skirt)/.test(String(ud.interiorKind))){
        S.clayRoomSelectedId = "room-shell";
        if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect("room-shell", "viewport");
        return "room-shell";
      }
      node = node.parent;
    }
  }
  return null;
}
function clayRoomWirePanZoom(host){
  if(!host || host.__clayPanWired) return;
  host.__clayPanWired = true;
  let dragging = false, lastX = 0, lastY = 0, startX = 0, startY = 0, moved = false;
  host.style.cursor = "grab";
  host.addEventListener("pointerdown", function(ev){
    if(ev.button !== 0) return;
    dragging = true; moved = false;
    startX = lastX = ev.clientX; startY = lastY = ev.clientY;
    host.style.cursor = "grabbing";
    try { host.setPointerCapture(ev.pointerId); } catch(e){}
  });
  host.addEventListener("pointermove", function(ev){
    if(!dragging || !S.camera || !S.clayCamFit) return;
    const dxPx = ev.clientX - lastX, dyPx = ev.clientY - lastY;
    lastX = ev.clientX; lastY = ev.clientY;
    if(Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4) moved = true;
    const target = S.clayCamFit.target, pos = S.camera.position;
    const dist = pos.distanceTo(S.cameraLookTarget || target);
    const fovRad = (S.camera.fov || 20) * Math.PI / 180;
    const worldPerPx = (2 * dist * Math.tan(fovRad / 2)) / Math.max(1, host.clientHeight);
    // ground-plane screen axes from the camera's own bearing (never re-derived constants)
    const dir = new THREE.Vector3().subVectors(S.cameraLookTarget || target, pos);
    const right = new THREE.Vector3(dir.z, 0, -dir.x).normalize();     // screen-right on the ground
    const fwd = new THREE.Vector3(dir.x, 0, dir.z).normalize();        // camera-forward on the ground
    const off = S.clayCamOffset || (S.clayCamOffset = { x: 0, z: 0 });
    // This offset moves the CAMERA, so it must follow the requested screen motion to make the
    // rendered room follow the pointer in this fixed-bearing rig. Both signs are browser-verified:
    // dragging right keeps the room moving right; dragging down keeps it moving down.
    off.x += (right.x * dxPx + fwd.x * dyPx) * worldPerPx;
    off.z += (right.z * dxPx + fwd.z * dyPx) * worldPerPx;
    clayRoomApplyCamPose();
  });
  const endDrag = function(){ dragging = false; host.style.cursor = "grab"; };
  host.addEventListener("pointerup", function(ev){
    const wasClick = dragging && !moved;
    endDrag();
    if(wasClick){
      if(S.clayRoomMovementPickMode && clayRoomMovementPickAt(ev, host)) return;
      clayRoomPickAt(ev, host);
    }
  });
  host.addEventListener("pointerleave", endDrag);
  host.addEventListener("wheel", function(ev){
    ev.preventDefault();
    if(!S.clayCamFit) return;
    const factor = ev.deltaY > 0 ? 1.18 : 0.82;
    S.clayCamZoom = Math.min(CLAY_CAM_ZOOM_MAX, Math.max(CLAY_CAM_ZOOM_MIN, (S.clayCamZoom || 1) * factor));
    clayRoomApplyCamPose();
  }, { passive: false });
  host.addEventListener("dblclick", function(){
    S.clayCamOffset = { x: 0, z: 0 };
    S.clayCamZoom = 1;
    clayRoomApplyCamPose();
  });
}

// Live proof read: board-authored state + the actual mounted hinge/leaf pose. The State tab and
// browser harness both consume this one measurement so the UI cannot claim a swing that the scene
// did not perform.
function clayRoomDoorProofState(){
  const authoredDoor = S.lastBoard && Array.isArray(S.lastBoard.interactables)
    ? S.lastBoard.interactables.find(function(e){ return e && e.archetype === "door" && !e.reserve; })
    : null;
  let hinge = null;
  if(S.interiorGroup){
    S.interiorGroup.traverse(function(node){
      if(!hinge && node.userData && node.userData.kind === "interactable" && node.userData.archetype === "door"){
        hinge = node;
      }
    });
  }
  const leaf = hinge && hinge.userData ? hinge.userData.leaf : null;
  const angleDeg = leaf ? leaf.rotation.y * 180 / Math.PI : null;
  return {
    sourceRef: authoredDoor ? authoredDoor.sourceRef : null,
    authoredState: authoredDoor ? authoredDoor.state : null,
    mountedState: hinge && hinge.userData ? hinge.userData.state : null,
    hingeAngleDeg: angleDeg == null ? null : +angleDeg.toFixed(1),
    leafVisible: !!(leaf && leaf.visible),
    tweenActive: !!((S.tweens || []).some(function(tw){ return tw && tw.isDoorStateTween; })),
    mount: S.doorMountReport && S.doorMountReport.perDoor ? S.doorMountReport.perDoor[0] || null : null,
  };
}

// Concept 1 — DOCKED STUDIO. The shell is deliberately DOM-only and dev-only; the center host still
// mounts the real Theater renderer and every list entry refers to an object already supplied by the
// production Clayroom record. Catalog buttons do not manufacture demo meshes.
function clayRoomWorkbenchDimensions(){
  // Checkpoint 4 ("the inspector consumes roughly half of a narrow browser window, leaving a
  // portrait-shaped renderer unsuitable for visual signoff"): chrome scales DOWN before the
  // viewport does. Below 1000px the catalog auto-collapses to its rail unless the user explicitly
  // expanded it this session (S.clayRoomCatalogCollapsed === false is an explicit choice; null/
  // undefined means default). The inspector clamps proportionally so the renderer always keeps
  // the MAJORITY of the window at review sizes.
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  const compact = w < 900;
  const catalogAutoCollapsed = w < 1000 && S.clayRoomCatalogCollapsed !== false;
  const inspector = Math.round(Math.min(390, Math.max(230, w * 0.28)));
  return {
    catalog: (S.clayRoomCatalogCollapsed || catalogAutoCollapsed) ? 42 : (compact ? 170 : 260),
    inspector: compact ? Math.min(inspector, 250) : inspector,
  };
}
function clayRoomApplyWorkbenchLayout(){
  const dims = clayRoomWorkbenchDimensions();
  const rail = document.getElementById("clay-room-workbench-catalog");
  const viewport = document.getElementById("clay-room-workbench-viewport");
  const panel = document.getElementById("clay-room-overlay");
  if(rail){
    rail.style.width = dims.catalog + "px";
    rail.style.padding = S.clayRoomCatalogCollapsed ? "8px 5px" : "12px";
    Array.from(rail.children).forEach(function(child){
      child.style.visibility = S.clayRoomCatalogCollapsed ? "hidden" : "visible";
    });
  }
  if(viewport){
    viewport.style.left = dims.catalog + "px";
    viewport.style.right = dims.inspector + "px";
  }
  if(panel && !CLAY_ROOM_PANEL_POSITION) panel.style.width = dims.inspector + "px";
}
function clayRoomBuildWorkbenchChrome(record){
  const top = document.createElement("div");
  top.id = "clay-room-workbench-topbar";
  top.style.cssText = "position:fixed;left:0;right:0;top:0;height:44px;z-index:9003;background:#15171b;border-bottom:1px solid #39404a;color:#e8edf2;display:flex;align-items:center;padding:0 14px;gap:14px;font:11px/1.2 monospace;box-sizing:border-box;";
  top.innerHTML =
    "<strong style='font:600 13px -apple-system,sans-serif;letter-spacing:.04em'>GENESIS · CLAYROOM</strong>" +
    "<span style='color:#91a0b2'>DOCKED STUDIO · CONCEPT 1</span>" +
    "<span style='margin-left:auto;color:#77d39a'>SESSION ONLY</span>" +
    "<span style='color:#aab4c0'>1 cell = 5 ft · walls = 10 ft · human = 6 ft reference</span>";
  const catalogToggle = document.createElement("button");
  catalogToggle.type = "button";
  catalogToggle.textContent = "catalog ◀";
  catalogToggle.setAttribute("aria-label", "Collapse or expand Clayroom catalog");
  catalogToggle.style.cssText = "order:-1;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:4px 6px;font:9px monospace;cursor:pointer;";
  top.appendChild(catalogToggle);

  const rail = document.createElement("aside");
  rail.id = "clay-room-workbench-catalog";
  rail.style.cssText = "position:fixed;left:0;top:44px;bottom:0;width:260px;z-index:9002;background:#17191e;border-right:1px solid #39404a;color:#dce3ea;overflow:hidden auto;padding:12px;box-sizing:border-box;font:11px/1.35 -apple-system,sans-serif;transition:width 120ms ease;";

  function railHeading(text){
    const h = document.createElement("div");
    h.textContent = text;
    h.style.cssText = "margin:2px 0 7px;color:#8e9baa;font:600 10px monospace;letter-spacing:.12em;";
    return h;
  }
  rail.appendChild(railHeading("CATALOG · LIVE FIXTURE SLICE"));
  const catalog = [
    ["STRUCTURE", "10 ft wall", "room-shell"],
    ["STRUCTURE KIT", "Construction bench", "compiled-shell"],
    ["SCALE / CUTAWAY", "Human witness", "structure-cutaway-witness"],
    ["PROP", "Crate · 3 ft", record.object.id],
    ["INTERACTABLE", "Door · 36 × 80 in", record.portal.id],
    ["DIAGNOSTIC LIGHT", "Warm calibration bulb", "clay-west-warm"],
    ["DIAGNOSTIC LIGHT", "Cool calibration bulb", "clay-east-cool"],
    ["SPRITE", "Goblin", record.citizen.bestiaryId],
  ];
  catalog.forEach(function(row){
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.claySelect = row[2];
    if(row[2] === "compiled-shell" || row[2] === "structure-cutaway-witness") b.dataset.clayStructureOnly = "1";
    if(row[2] === record.citizen.bestiaryId) b.dataset.claySpriteCatalog = "1";
    if(row[2] === record.object.id || row[2] === record.portal.id) b.dataset.clayRoomTruthOnly = "1";
    if(row[2] === "clay-west-warm") b.dataset.clayLightCatalogSlot = "0";
    if(row[2] === "clay-east-cool") b.dataset.clayLightCatalogSlot = "1";
    b.style.cssText = "width:100%;text-align:left;background:#20242b;color:#e0e5ea;border:1px solid #333a44;border-radius:4px;padding:7px 8px;margin:0 0 5px;cursor:pointer;";
    b.innerHTML = "<small data-clay-light-kind style='display:block;color:#8290a1;font:9px monospace'>" + row[0] + "</small>" +
      "<span data-clay-light-label>" + row[1] + "</span>" +
      "<small data-clay-light-status style='float:right;color:#6fcf91;font:9px monospace'>MOUNTED</small>";
    b.addEventListener("click", function(){
      S.clayRoomSelectedId = b.dataset.claySelect;
      if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(b.dataset.claySelect, "catalog");
    });
    rail.appendChild(b);
  });

  const scene = document.createElement("section");
  scene.id = "clay-room-workbench-scene";
  scene.style.cssText = "border-top:1px solid #333a44;margin-top:12px;padding-top:10px;";
  scene.appendChild(railHeading("SCENE · LIVE PRODUCTION OBJECTS"));
  [
    ["Room shell", "room-shell"],
    ["Construction bench", "compiled-shell"],
    ["Human cutaway witness", "structure-cutaway-witness"],
    ["Door", record.portal.id],
    ["Crate", record.object.id],
    ["Goblin", record.citizen.bestiaryId],
    ["Warm calibration bulb", "clay-west-warm"],
    ["Cool calibration bulb", "clay-east-cool"],
  ].forEach(function(row){
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.claySceneId = row[1];
    if(row[1] === "compiled-shell" || row[1] === "structure-cutaway-witness") b.dataset.clayStructureOnly = "1";
    if(row[1] === record.citizen.bestiaryId) b.dataset.claySpriteCatalog = "1";
    if(row[1] === record.object.id || row[1] === record.portal.id) b.dataset.clayRoomTruthOnly = "1";
    if(row[1] === "clay-west-warm") b.dataset.clayLightSceneSlot = "0";
    if(row[1] === "clay-east-cool") b.dataset.clayLightSceneSlot = "1";
    b.textContent = "◇  " + row[0];
    b.style.cssText = "display:block;width:100%;text-align:left;background:transparent;color:#cbd3dc;border:0;border-left:2px solid transparent;padding:5px 7px;cursor:pointer;font:11px monospace;";
    b.addEventListener("click", function(){
      S.clayRoomSelectedId = b.dataset.claySceneId;
      if(S.clayRoomWorkbenchSelect) S.clayRoomWorkbenchSelect(b.dataset.claySceneId, "scene");
    });
    scene.appendChild(b);
  });
  rail.appendChild(scene);
  const safety = document.createElement("div");
  safety.style.cssText = "margin-top:14px;padding:8px;border:1px solid #4d4431;background:#242117;color:#d7c58c;font:10px/1.4 monospace;";
  safety.textContent = "The light rows mirror the current recipe. Diagnostic bulbs never masquerade as world fixtures; placement edits remain session-only.";
  rail.appendChild(safety);

  const viewport = document.createElement("div");
  viewport.id = "clay-room-workbench-viewport";
  viewport.style.cssText = "position:fixed;left:260px;right:390px;top:44px;bottom:0;z-index:9000;background:#000;transition:left 120ms ease;";
  const host = document.createElement("div");
  host.id = "clay-room-host";
  host.style.cssText = "position:absolute;inset:0;background:#000;";
  viewport.appendChild(host);

  document.body.appendChild(top);
  document.body.appendChild(rail);
  document.body.appendChild(viewport);
  catalogToggle.addEventListener("click", function(){
    S.clayRoomCatalogCollapsed = !S.clayRoomCatalogCollapsed;
    catalogToggle.textContent = S.clayRoomCatalogCollapsed ? "catalog ▶" : "catalog ◀";
    rail.setAttribute("aria-expanded", S.clayRoomCatalogCollapsed ? "false" : "true");
    clayRoomApplyWorkbenchLayout();
    setTimeout(function(){
      if(S.resizeHandler) S.resizeHandler();
      markDirty(); scheduleRender();
    }, 140);
  });
  clayRoomApplyWorkbenchLayout();
  return { host: host, chrome: [top, rail, viewport] };
}

// mountClayRoom() — D2/wire-in steps 1-5 (the overlay, step 6, is built by
// clayRoomMountOverlay(record,host) — see the U3 addition below this comment once it lands). Never
// throws (mirrors mountLightLab's own dormant-surface discipline): a WebGL-less environment degrades
// to mount() returning false and this function no-oping.
// D15 re-wire: step 3 (project the record through the real interior board builders) is now
// clayRoomBoardFrom(record) — src/engine/clay-room.js's own real spatializer + interiorBuildBoard
// chain — feeding setInteriorBoard directly; this file adds no board-data assembly of its own.
//
// ITR_ROOM_SHELL (this file's own module-scope flag, default true, line ~10103 — "ROOM-SHELL
// COMPILER... flips ITR_ROOM_SHELL live") — found LIVE in the orchestrator's own browser re-gate:
// setInteriorBoard's own room-shell compiler is ON BY DEFAULT for every interior board (not a
// clay-specific mechanism), and it REPLACES the per-cell InstancedMesh floor/wall channel with a
// separate, non-instanced, kit-realm-textured mesh trio (room-shell-floor/wall-stem/wall-upper/
// wall-trim, tagged `kind` in _interiorGroupMeshInfoForTest) that clayRoomFlattenStructure's own
// InstancedMesh-only sweep never touches by construction (it isn't an InstancedMesh at all) — so
// with room-shell on, the floor/walls rendered their REAL, unflattened, dark realm colors instead
// of clay grey (dark enough under D4's own low-ambient profile to read as void-black, the exact
// "floor/walls didn't render" first read). Disabled the SAME way KIT_SHELL_ENABLED/KIT_DOORS_ENABLED
// already are (an existing, documented dev/harness toggle — "flips ITR_ROOM_SHELL live", this file's
// own comment at its definition — never a new mechanism): OFF only while the clay room stays mounted
// (restored in clayRoomUnmount, not immediately here) because setInteriorBoard's own async replay
// (the SPRITE_CHANNEL texture-settle callback this file's own header already documents) re-invokes
// setInteriorBoard(S.lastBoard) OUTSIDE this function, and ITR_ROOM_SHELL is read fresh every one of
// those calls — restoring it here would let that later replay silently rebuild an unflattened shell
// again. This keeps geometry in the plain InstancedMesh/BoxGeometry family every other kind already
// uses (D2 step 3's own "never a bespoke material... SAME InstancedMesh/BoxGeometry construction" law).
function mountClayRoom(){
  try {
    if(S.clayRoomMounted) return;
    const record = clayRoomRecordFrom(0x6c0ffee); // the CI seed, pinned per docs/C1A-CLAY-ROOM.md wire-in step 1

    const workbench = clayRoomBuildWorkbenchChrome(record);
    const host = workbench.host;

    const mounted = mount(host); // D5: no `opts` -> the default (non-psx) canvas path
    if(!mounted){
      workbench.chrome.forEach(function(el){ if(el && el.parentNode) el.parentNode.removeChild(el); });
      return;
    }
    S.clayRoomWorkbenchChrome = workbench.chrome;

    CLAY_ROOM_PRIOR_ROOM_SHELL = clayCtxGetRoomShell(); // split B1: root owns the flag; accessor replaces the same-module read
    // CL-R0 note: the room-shell compiler stays OFF by default (see this function's header), but the
    // diagnostic recipe now routes room-shell/kit-shell kinds too, so `?clayshell=1` can turn it back
    // on for an A/B against the production construction path. That A/B is EVIDENCE for the next
    // tranche, not a default flip — flipping it changes the fixture's geometry, which is a CL-R3
    // question, not a CL-R0 one.
    clayCtxSetRoomShell(clayRoomShellOverrideOn()); // restored in clayRoomUnmount — see this function's own header note above (split B1: accessor — ES import bindings are read-only)

    const initialFixtureId = clayRoomFixtureIdFromLocation();
    // CL-R3's canonical review is the daylight hero: neutral clay still carries no authored site
    // material, while the shared production sun makes wall thickness, caps, stairs, and slab faces
    // readable without diagnostic bulbs. Other fixtures retain their existing opposing-pair start.
    const initialLightRecipeId = initialFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      ? "daylit"
      : "clay-opposing-pair";
    const compiled = clayRoomBoardFrom(record, { lightRecipeId: initialLightRecipeId }); // D15 — real spatializer + interiorBuildBoard (src/engine/clay-room.js)
    const movementFixture = clayRoomMovementFixtureFrom(record, compiled);
    // C1B mechanical session truth lives in GS, not in the renderer state. Rebuilds and animations
    // may replace THREE objects, but they keep this exact revisioned query state. Closing/reopening
    // the dev surface within one app session also keeps it until the explicit Movement reset.
    if(!GS.clayRoomMovementSession
      || !GS.clayRoomMovementSession.fixture
      || GS.clayRoomMovementSession.fixture.space.id !== movementFixture.space.id){
      GS.clayRoomMovementSession = {
        version: 1,
        fixture: movementFixture,
        initialState: movementFixture.state,
        state: movementFixture.state,
        preview: null,
        lastReceipt: null,
        pace: "dash",
        route: "east"
      };
    } else {
      GS.clayRoomMovementSession.fixture = movementFixture;
      GS.clayRoomMovementSession.initialState = movementFixture.state;
    }
    // CL-R0: the record and the diagnostic-active flag are set BEFORE the first setInteriorBoard so
    // that build's own tail hook (clayRoomAfterInteriorBoardRebuild) applies the surface route, the
    // light profile, and provenance exactly the way every LATER rebuild will. One code path for the
    // first frame and the thousandth — the previous version's separate post-mount call sequence is
    // precisely what later replays could not reproduce.
    S.clayRoomRecord = record;
    S.clayRoomCompiled = compiled;
    S.clayRoomLightRecipeId = compiled.lightRecipeId || "clay-opposing-pair";
    S.clayRoomFixtureId = initialFixtureId;
    // CL-R2 ruling: presentation scale is the working default. True scale stays one click away as
    // an honest size-spectrum check; neither view mutates registry worldHeight or tactical span.
    S.clayRoomSpriteScaleMode = "diagnostic-cap";
    S.clayRoomSelectedSpriteSlug = CLAY_SPRITE_CITIZENSHIP_FIXTURE.selectedSlug;
    S.clayRoomLightOverlayModes = { position: false, range: false, shadow: false };
    S.clayRoomPreviewSeed = CLAY_ROOM_LIGHT_PREVIEW_SEEDS[0];
    S.clayCamOffset = { x: 0, z: 0 };
    S.clayCamZoom = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      ? 0.72 : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID ? 0.9
        : (S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID ? 0.65 : 1));
    S.clayRoomStructureView = CLAY_STRUCTURE_BENCH_FIXTURE.defaultView;
    S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
      null,
      { type: CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.stagedEvent }
    );
    const initialStructureConnection = GS.clayRoomMovementSession.state.connections.find(function(row){
      return row.id === GS.clayRoomMovementSession.fixture.connectionId;
    });
    S.clayRoomStructureStageLatch = clayStructureStagingLatchTransition(
      S.clayRoomStructureStageLatch,
      { type: "door-state", state: initialStructureConnection ? initialStructureConnection.state : "shut" }
    );
    S.clayRoomDiagnosticActive = true;
    setInteriorBoard(clayRoomMovementBoardFromState(GS.clayRoomMovementSession.state) || compiled.board);
    S.clayGridMesh = clayRoomBuildSeamGrid(record, compiled.room); // D12a — after setInteriorBoard so S.boardOrigin/S.interiorFloorTopMap are already live; compiled.room is the spatializer's REAL room rect (CL-R0 coordinate fix)
    clayRoomMovementRangesRender();
    clayRoomTagAllProvenance(); // D13 — re-tag now that the grid (built after the hook ran) exists
    markDirty();
    scheduleRender();

    S.clayRoomMounted = true;
    S.clayRoomHost = host;
    clayRoomWirePanZoom(host); // governed pan/zoom (drag · wheel · dblclick reset) — dev host only
    clayRoomMountOverlay(record, host);
  } catch(e) {
    try { console.warn("qa: clay-room mount failed", e); } catch(e2){}
  }
}

// CL-R3a (Adam's 2026-07-23 wall-omission ruling, RULED FOR TEST) — clayWallOmissionOn(): should
// camera-side wall segments build NO upper volume (compile-time omission, stem retained)? Default:
// ON exactly when the clay fixture is enabled (the ruled test bed), OFF in normal play until the
// test passes and Adam promotes the ruling game-wide. ?wallomit=1 forces on anywhere, ?wallomit=0
// forces off (the fade-only A/B). Memoized like every other clay flag.
let CLAY_WALL_OMISSION_FLAG = null;
function clayWallOmissionOn(){
  if(CLAY_WALL_OMISSION_FLAG === null){
    let on = null;
    try {
      if(typeof window !== "undefined" && window.location && window.location.search){
        const raw = new URLSearchParams(window.location.search).get("wallomit");
        if(raw === "1") on = true;
        else if(raw === "0") on = false;
      }
      if(on === null && typeof window !== "undefined" && window.GS && typeof window.GS.wallOmission === "boolean"){
        on = window.GS.wallOmission;
      }
    } catch(e){}
    CLAY_WALL_OMISSION_FLAG = (on === null) ? clayRoomShouldEnable() : on;
  }
  return CLAY_WALL_OMISSION_FLAG;
}

// CL-R0 — `?clayshell=1` (or GS.clayRoomShell === true) re-enables setInteriorBoard's own room-shell
// compiler for the clay fixture. Default OFF, preserving the pre-CL-R0 behaviour exactly; the flag
// exists so the "does the fixture still read as clay through the PRODUCTION room-shell construction
// path?" A/B is a reproducible capture rather than a source edit. Memoized like every other clay flag.
// CL-R3a: default flipped ON (was OFF) — the clay fixture now adopts the PRODUCTION room-shell wall
// construction (stem + uppers) by default, per the wall-omission ruling's test spec: with omission
// active, near walls simply build stem-only, so the old "shell walls read dark/opaque" reason for
// forcing the shell off is gone (and it was already fixed by the fade-aware swap, harness check 20).
// ?clayshell=0 (or GS.clayRoomShell === false) restores the plain InstancedMesh channel for the A/B.
let CLAY_ROOM_SHELL_FLAG = null;
function clayRoomShellOverrideOn(){
  if(CLAY_ROOM_SHELL_FLAG === null){
    let on = true;
    try {
      if(typeof window !== "undefined"){
        if(window.GS && window.GS.clayRoomShell === false) on = false;
        else if(window.location && window.location.search
          && new URLSearchParams(window.location.search).get("clayshell") === "0") on = false;
      }
    } catch(e){}
    CLAY_ROOM_SHELL_FLAG = on;
  }
  return CLAY_ROOM_SHELL_FLAG;
}

// D2 step 6 / D9 / D11 — the overlay panel, dormant-built the SAME way mountLightLab builds its own
// (plain styled divs, no framework, panel.id-guarded against a stale double-mount). Two tabs:
//   Facts   — clayRoomProse(record) shown VERBATIM (D9's own "same-facts-equivalence by
//             construction" law: the overlay never re-derives or reformats a single fact).
//   Explain — clayRoomExplain(record) VERBATIM, plus ONE edit affordance per BodyForm field
//             (worldHeight/heightSource/sizeCategory/occupiedCells/bestiaryId) that calls
//             clayRoomEditRefusal(field) and prints the typed refusal inline — D11's "no other
//             workbench scope" law: this is the only interactive control the panel offers besides
//             the tab switch and the close button.
// Plus a `renderer size <w>x<h> @ dpr <n>` line (wire-in step 6's own countable capture-packet line)
// read straight off the live S.renderer, never a re-derived guess.
let CLAY_ROOM_PANEL_POSITION = null;
function clayRoomMountOverlay(record, host){
  if(typeof document === "undefined") return;
  const stale = document.getElementById("clay-room-overlay");
  if(stale && stale.parentNode) stale.parentNode.removeChild(stale);

  const panel = document.createElement("div");
  panel.id = "clay-room-overlay";
  panel.setAttribute("data-region", "clay-room-workbench-inspector");
  panel.style.cssText =
    "position:fixed;top:44px;right:0;bottom:0;width:" + clayRoomWorkbenchDimensions().inspector + "px;overflow:auto;z-index:9002;box-sizing:border-box;" +
    "background:rgba(20,20,24,0.98);border-left:1px solid #444;padding:10px;" +
    "font:12px/1.3 -apple-system,sans-serif;color:#eee;box-shadow:0 4px 18px rgba(0,0,0,0.5);";

  const title = document.createElement("div");
  title.id = "clay-room-panel-drag-handle";
  title.setAttribute("aria-label", "Drag Clayroom panel");
  title.style.cssText = "font-weight:600;margin-bottom:4px;display:flex;gap:6px;justify-content:space-between;align-items:center;cursor:move;user-select:none;touch-action:none;";
  const titleText = document.createElement("span");
  titleText.textContent = "INSPECTOR · CLAY ROOM C1A";
  titleText.style.cssText = "flex:1;";
  title.appendChild(titleText);
  const resetPositionBtn = document.createElement("button");
  resetPositionBtn.textContent = "dock right";
  resetPositionBtn.setAttribute("aria-label", "Reset Clayroom panel position and dock right");
  resetPositionBtn.style.cssText = "background:#2a2a30;border:1px solid #555;border-radius:3px;color:#ccd;font:10px monospace;cursor:pointer;padding:2px 5px;";
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close Clayroom");
  closeBtn.style.cssText = "background:none;border:none;color:#ccc;font-size:16px;cursor:pointer;line-height:1;";
  closeBtn.addEventListener("click", function(){ clayRoomUnmount(); });
  title.appendChild(resetPositionBtn);
  title.appendChild(closeBtn);
  panel.appendChild(title);

  const panelPositionLine = document.createElement("div");
  panelPositionLine.id = "clay-room-panel-position";
  panelPositionLine.style.cssText = "color:#7f9;margin-bottom:5px;font:10px monospace;";
  panel.appendChild(panelPositionLine);

  const selectionCard = document.createElement("section");
  selectionCard.id = "clay-room-selection-inspector";
  selectionCard.style.cssText = "border:1px solid #39404a;background:#181b20;padding:8px;margin:0 0 8px;";
  const selectionKicker = document.createElement("div");
  selectionKicker.textContent = "SELECTED · LIVE PRODUCTION OBJECT";
  selectionKicker.style.cssText = "color:#8290a1;font:9px monospace;letter-spacing:.1em;";
  const selectionName = document.createElement("div");
  selectionName.style.cssText = "font:600 15px -apple-system,sans-serif;color:#eef3f7;margin:2px 0;";
  const selectionMeta = document.createElement("div");
  selectionMeta.style.cssText = "color:#9da8b5;font:10px/1.35 monospace;margin-bottom:7px;";
  selectionCard.appendChild(selectionKicker);
  selectionCard.appendChild(selectionName);
  selectionCard.appendChild(selectionMeta);
  const scopeRow = document.createElement("div");
  scopeRow.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;";
  const instanceScopeBtn = document.createElement("button");
  instanceScopeBtn.textContent = "INSTANCE";
  instanceScopeBtn.title = "Move or tune only this Clayroom instance; session-only by default.";
  const stateScopeBtn = document.createElement("button");
  stateScopeBtn.textContent = "STATE";
  stateScopeBtn.title = "Edit the selected production object's named state.";
  const socketScopeBtn = document.createElement("button");
  socketScopeBtn.textContent = "🔒 SOCKET";
  socketScopeBtn.title = "Protected authored socket. Use the explicit Mount tab and lock export.";
  const defaultScopeBtn = document.createElement("button");
  defaultScopeBtn.textContent = "🔒 DEFAULT";
  defaultScopeBtn.title = "Protected production default; an overwrite affects future rolls.";
  [instanceScopeBtn, stateScopeBtn, socketScopeBtn, defaultScopeBtn].forEach(function(b){
    b.style.cssText = "font:9px monospace;background:#252a32;color:#cad2dc;border:1px solid #414955;border-radius:3px;padding:5px 2px;cursor:pointer;";
    scopeRow.appendChild(b);
  });
  instanceScopeBtn.style.cssText += "background:#24516a;border-color:#4b9bc3;color:#eefaff;";
  socketScopeBtn.style.opacity = "0.72";
  defaultScopeBtn.style.opacity = "0.72";
  selectionCard.appendChild(scopeRow);
  const sessionLaw = document.createElement("div");
  sessionLaw.textContent = "SESSION ONLY · Clayroom movement does not rewrite a production socket.";
  sessionLaw.style.cssText = "padding:5px 6px;background:#17271f;color:#79d69a;border-left:2px solid #4da66d;font:9px/1.35 monospace;";
  selectionCard.appendChild(sessionLaw);
  const editorActions = document.createElement("div");
  editorActions.style.cssText = "display:flex;gap:5px;margin-top:6px;";
  const spriteEditorBtn = document.createElement("button");
  spriteEditorBtn.textContent = "open sprite editor ↗";
  spriteEditorBtn.title = "Run python3 dev/sprite-review.py, then open the selected sprite in the dedicated editor";
  const materialEditorBtn = document.createElement("button");
  materialEditorBtn.textContent = "material editor";
  materialEditorBtn.title = "Shared Material Editor seam; the admitted MM mapping pass is next.";
  [spriteEditorBtn, materialEditorBtn].forEach(function(b){
    b.style.cssText = "flex:1;font:9px monospace;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:5px;cursor:pointer;";
    editorActions.appendChild(b);
  });
  materialEditorBtn.disabled = true;
  materialEditorBtn.style.opacity = "0.55";
  selectionCard.appendChild(editorActions);
  const saveActions = document.createElement("div");
  saveActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px;";
  const saveVariantBtn = document.createElement("button");
  saveVariantBtn.textContent = "SAVE AS NEW STATE";
  saveVariantBtn.title = "Session-state scaffold; persistence will land through a versioned recipe.";
  const overwriteDefaultBtn = document.createElement("button");
  overwriteDefaultBtn.textContent = "🔒 OVERWRITE DEFAULT";
  overwriteDefaultBtn.title = "Protected. DEFAULT changes apply to FUTURE ROLLS.";
  overwriteDefaultBtn.disabled = true;
  [saveVariantBtn, overwriteDefaultBtn].forEach(function(b){
    b.style.cssText = "font:9px monospace;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:5px;";
    saveActions.appendChild(b);
  });
  overwriteDefaultBtn.style.opacity = "0.55";
  selectionCard.appendChild(saveActions);
  const futureRolls = document.createElement("div");
  futureRolls.textContent = "DEFAULT OVERWRITE → FUTURE ROLLS · locked until explicit promotion";
  futureRolls.style.cssText = "color:#a69773;font:9px monospace;margin-top:4px;";
  selectionCard.appendChild(futureRolls);
  panel.appendChild(selectionCard);
  function clayPanelClamp(left, top){
    const pad = 8, minTop = 52; // keep the floating title below the persistent 44px workbench bar
    const maxLeft = Math.max(pad, window.innerWidth - panel.offsetWidth - pad);
    const maxTop = Math.max(minTop, window.innerHeight - panel.offsetHeight - pad);
    return {
      left: Math.max(pad, Math.min(maxLeft, Number(left) || pad)),
      top: Math.max(minTop, Math.min(maxTop, Number(top) || minTop)),
    };
  }
  function clayPanelPlace(left, top, remember){
    const pos = clayPanelClamp(left, top);
    panel.style.bottom = "auto";
    panel.style.maxHeight = "calc(100vh - 60px)";
    panel.style.border = "1px solid #444";
    panel.style.borderRadius = "6px";
    panel.style.left = Math.round(pos.left) + "px";
    panel.style.top = Math.round(pos.top) + "px";
    panel.style.right = "auto";
    if(remember !== false) CLAY_ROOM_PANEL_POSITION = { left: pos.left, top: pos.top };
    const rect = panel.getBoundingClientRect();
    const inside = rect.left >= 0 && rect.top >= 0
      && rect.right <= window.innerWidth + 0.5 && rect.bottom <= window.innerHeight + 0.5;
    panelPositionLine.textContent = "panel x " + Math.round(rect.left) + " y " + Math.round(rect.top)
      + " · viewport clamp " + (inside ? "PASS" : "FAIL");
  }
  function clayPanelDockRight(){
    CLAY_ROOM_PANEL_POSITION = null;
    panel.style.width = clayRoomWorkbenchDimensions().inspector + "px";
    panel.style.left = "auto";
    panel.style.right = "0";
    panel.style.top = "44px";
    panel.style.bottom = "0";
    panel.style.maxHeight = "none";
    panel.style.border = "0";
    panel.style.borderLeft = "1px solid #444";
    panel.style.borderRadius = "0";
    panelPositionLine.textContent = "panel docked right · viewport clamp PASS · drag title to float";
  }
  function clayPanelResetPosition(){
    clayPanelDockRight();
  }
  resetPositionBtn.addEventListener("click", function(ev){
    ev.stopPropagation();
    clayPanelResetPosition();
  });
  let panelDrag = null;
  title.addEventListener("pointerdown", function(ev){
    if(ev.button !== 0 || (ev.target && ev.target.closest && ev.target.closest("button"))) return;
    const rect = panel.getBoundingClientRect();
    panelDrag = { pointerId: ev.pointerId, dx: ev.clientX - rect.left, dy: ev.clientY - rect.top };
    // Dragging the dedicated inspector title undocks it without disturbing any control below.
    clayPanelPlace(rect.left, rect.top, true);
    title.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  function clayPanelDragMove(ev){
    if(!panelDrag || panelDrag.pointerId !== ev.pointerId) return;
    clayPanelPlace(ev.clientX - panelDrag.dx, ev.clientY - panelDrag.dy, true);
  }
  function clayPanelEndDrag(ev){
    if(!panelDrag || panelDrag.pointerId !== ev.pointerId) return;
    panelDrag = null;
    if(title.hasPointerCapture(ev.pointerId)) title.releasePointerCapture(ev.pointerId);
  }
  // Listen on window as well as using capture: automation and older pointer implementations may
  // not retarget every move to the captured element once the cursor leaves the narrow title row.
  window.addEventListener("pointermove", clayPanelDragMove);
  window.addEventListener("pointerup", clayPanelEndDrag);
  window.addEventListener("pointercancel", clayPanelEndDrag);
  S.clayRoomPanelDragCleanup = function(){
    window.removeEventListener("pointermove", clayPanelDragMove);
    window.removeEventListener("pointerup", clayPanelEndDrag);
    window.removeEventListener("pointercancel", clayPanelEndDrag);
  };
  S.clayRoomPanelResizeHandler = function(){
    if(CLAY_ROOM_PANEL_POSITION){
      const rect = panel.getBoundingClientRect();
      clayPanelPlace(rect.left, rect.top, true);
    } else {
      clayPanelDockRight();
    }
    clayRoomApplyWorkbenchLayout();
    if(S.resizeHandler) S.resizeHandler();
  };
  window.addEventListener("resize", S.clayRoomPanelResizeHandler);

  const rendererLine = document.createElement("div");
  rendererLine.style.cssText = "color:#9ab;margin-bottom:6px;font:11px monospace;";
  const size = (S.renderer && typeof S.renderer.getSize === "function") ? S.renderer.getSize(new THREE.Vector2()) : null;
  const dpr = S.psxEnabled ? PSX_RES_SCALE : Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2);
  rendererLine.textContent = size
    ? ("renderer size " + Math.round(size.x) + "x" + Math.round(size.y) + " @ dpr " + dpr)
    : "renderer size unavailable";
  panel.appendChild(rendererLine);

  // CL-R0 — the recipe identity line, beside the renderer line. A frame is only reproducible if the
  // receipt names BOTH identities: the fixture record (id/version/seed, in Facts) and the surface
  // recipe (id/version/mode) that decided what every surface rendered as.
  const recipeLine = document.createElement("div");
  recipeLine.style.cssText = "color:#9ab;margin-bottom:6px;font:11px monospace;";
  recipeLine.textContent = "surface recipe " + CLAY_DIAGNOSTIC_SURFACE_RECIPE.id +
    " v" + CLAY_DIAGNOSTIC_SURFACE_RECIPE.version + " mode " + clayRoomSurfaceMode();
  panel.appendChild(recipeLine);
  const camHint = document.createElement("div");
  camHint.textContent = "drag canvas to pan · wheel to zoom (up to 8× closer) · double-click to reset";
  camHint.style.cssText = "color:#7a8494;margin-bottom:6px;font:10px monospace;";
  panel.appendChild(camHint);

  const tabBar = document.createElement("div");
  tabBar.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;border-top:1px solid #333;padding-top:6px;margin-bottom:6px;";
  const factsTabBtn = document.createElement("button");
  factsTabBtn.textContent = "Facts";
  const explainTabBtn = document.createElement("button");
  explainTabBtn.textContent = "Explain";
  const surfacesTabBtn = document.createElement("button");
  surfacesTabBtn.textContent = "Surfaces";
  const mountTabBtn = document.createElement("button");
  mountTabBtn.textContent = "Mount";
  const stateTabBtn = document.createElement("button");
  stateTabBtn.textContent = "State";
  const movementTabBtn = document.createElement("button");
  movementTabBtn.textContent = "Move";
  movementTabBtn.setAttribute("aria-label", "Clayroom production movement proof");
  const structureTabBtn = document.createElement("button");
  structureTabBtn.textContent = "Structure";
  structureTabBtn.setAttribute("aria-label", "Clayroom reusable structure grammar proof");
  const lightsTabBtn = document.createElement("button");
  lightsTabBtn.textContent = "Lights";
  lightsTabBtn.setAttribute("aria-label", "Clayroom lighting proof");
  const spritesTabBtn = document.createElement("button");
  spritesTabBtn.textContent = "Sprites";
  spritesTabBtn.setAttribute("aria-label", "Clayroom sprite citizenship proof");
  [factsTabBtn, explainTabBtn, surfacesTabBtn, mountTabBtn, stateTabBtn, movementTabBtn, structureTabBtn, lightsTabBtn, spritesTabBtn].forEach(function(b){
    b.style.cssText = "flex:1 1 46px;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
  });
  tabBar.appendChild(factsTabBtn); tabBar.appendChild(explainTabBtn); tabBar.appendChild(surfacesTabBtn);
  tabBar.appendChild(mountTabBtn); tabBar.appendChild(stateTabBtn); tabBar.appendChild(movementTabBtn);
  tabBar.appendChild(structureTabBtn); tabBar.appendChild(lightsTabBtn); tabBar.appendChild(spritesTabBtn);
  panel.appendChild(tabBar);

  const factsBody = document.createElement("pre");
  factsBody.style.cssText = "white-space:pre-wrap;font:11px/1.4 monospace;color:#dde;margin:0;";
  factsBody.textContent = clayRoomProse(record);

  const explainBody = document.createElement("div");
  explainBody.style.cssText = "display:none;";
  const explainPre = document.createElement("pre");
  explainPre.style.cssText = "white-space:pre-wrap;font:11px/1.4 monospace;color:#dde;margin:0 0 6px;";
  // D13 (spec addendum D15 point 4) — one line, LIVE values off the real audit function, appended to
  // clayRoomExplain(record)'s own verbatim text (never folded into that pure engine-module string,
  // which has no S/scene access to compute this from).
  const provenanceAudit = (typeof clayRoomProvenanceAudit === "function") ? clayRoomProvenanceAudit() : { tagged: [], orphans: [] };
  explainPre.textContent = clayRoomExplain(record) +
    "\nProvenance audit: " + provenanceAudit.tagged.length + " groups tagged, " + provenanceAudit.orphans.length + " orphans.";
  explainBody.appendChild(explainPre);

  const refusalHeader = document.createElement("div");
  refusalHeader.textContent = "BodyForm fields (generated — edit refused):";
  refusalHeader.style.cssText = "color:#9ab;margin-bottom:2px;";
  explainBody.appendChild(refusalHeader);
  const refusalOut = document.createElement("pre");
  refusalOut.style.cssText = "white-space:pre-wrap;font:10px/1.4 monospace;color:#e8b;margin:4px 0 0;min-height:1em;";
  ["worldHeight", "heightSource", "sizeCategory", "occupiedCells", "bestiaryId"].forEach(function(field){
    const btn = document.createElement("button");
    btn.textContent = "edit " + field;
    btn.style.cssText = "font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:2px 5px;margin:0 4px 4px 0;";
    btn.addEventListener("click", function(){
      refusalOut.textContent = JSON.stringify(clayRoomEditRefusal(field));
    });
    explainBody.appendChild(btn);
  });
  explainBody.appendChild(refusalOut);

  // CL-R0 Surfaces tab — the provenance inspector's v0: every visible surface, its owning builder,
  // the recipe route that claimed it, and whether a colour texture is still bound. Rendered LIVE on
  // each tab open (never cached at mount) so it reflects the tree after whatever rebuild ran last —
  // which is the whole point: the durability question is answered by looking, not by trusting.
  const surfacesBody = document.createElement("pre");
  surfacesBody.style.cssText = "display:none;white-space:pre-wrap;font:10px/1.4 monospace;color:#dde;margin:0;";
  function clayRenderSurfacesTab(){
    const c = clayRoomSurfaceCensus();
    const lines = [];
    lines.push("recipe " + c.recipe.id + " v" + c.recipe.version + " mode " + c.recipe.mode);
    lines.push("textured-clay surfaces: " + c.texturedClayCount + "   (CL-R0 requires 0)");
    lines.push("unclaimed surfaces:     " + c.unclaimed.length + "   (CL-R0 requires 0)");
    lines.push("");
    c.surfaces.forEach(function(s){
      lines.push([
        (s.role || "—").padEnd(10),
        s.route.padEnd(16),
        (s.colorHex || "—").padEnd(8),
        (s.textured ? "TEXTURED" : "flat").padEnd(9),
        "x" + s.instances,
        s.builder,
      ].join(" "));
    });
    surfacesBody.textContent = lines.join("\n");
  }

  // ── Mount tab — DEV-PORTAL.md §6.1 Object Workbench, the DOOR-MOUNT SLICE (landed early; see the
  // spec's own implementation-status note). Adam, 2026-07-23: "i need the dev tool to just do it
  // myself, make sure there is some kind of snapping and individual axis control." Conformance:
  //   - §6.1's nudge ladder verbatim: click/arrow 0.01 · Shift 0.001 · Alt 0.10 (world units).
  //   - individual axes: depthInWall (along, + = deeper into the wall) · sideLap (lateral along the
  //     wall run) · sill (vertical). Mapped onto GS.doorMountTune {along, lateral, vertical}.
  //   - named snap candidates per the spec amendment: cell-centre / boundary / wall-centre (the
  //     wall-centre candidate is MEASURED off the built wall body nearest the door, live).
  //   - portal rule 4: edits mutate only the in-memory tune and replay the board — never a mesh
  //     drag, never a JS-constant rewrite. The lock-shaped export (kind:object-mount) is the save
  //     surrogate until the portal's lock compiler exists.
  const mountBody = document.createElement("div");
  mountBody.style.cssText = "display:none;font:11px/1.5 monospace;color:#dde;";
  function clayMountTune(){ 
    if(typeof GS === "undefined" || !GS) return null;
    if(!GS.doorMountTune) GS.doorMountTune = {
      along: ITR_DOOR_DEPTH_IN_WALL_DEFAULT, lateral: 0, vertical: 0
    };
    return GS.doorMountTune;
  }
  function clayMountReplay(){
    S.boardKey = null;
    if(S.lastBoard && S.lastBoard.kind === "interior3d"){
      setInteriorBoard(S.lastBoard, { roomTransition: false, reason: "clayroom-mount-edit" });
    }
  }
  // wall-centre snap: measure the built wall body nearest the door along its passage axis — the
  // same translate-only bb-centre read the census uses, scoped to room-shell wall meshes.
  function clayMountWallCentreAlong(){
    const axes = (S.lastBoard && S.lastBoard.doorAxes && S.lastBoard.doorAxes[0]) || null;
    if(!axes || !S.interiorGroup) return null;
    const passageIsZ = !axes.widthAxisIsZ;
    const doorWorld = passageIsZ ? (axes.z - (S.boardOrigin ? S.boardOrigin.cz : 0)) : (axes.x - (S.boardOrigin ? S.boardOrigin.cx : 0));
    let best = null, bestD = Infinity;
    S.interiorGroup.traverse(function(node){
      if(!node.isMesh || !node.userData || String(node.userData.interiorKind || "").indexOf("wall") < 0) return;
      if(!node.geometry) return;
      if(!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      const bb = node.geometry.boundingBox; if(!bb) return;
      const c = passageIsZ ? (node.position.z + (bb.min.z + bb.max.z) / 2) : (node.position.x + (bb.min.x + bb.max.x) / 2);
      const thick = passageIsZ ? (bb.max.z - bb.min.z) : (bb.max.x - bb.min.x);
      if(thick > 1) return; // a wall RUN measured along its run axis, not its thickness — skip
      const d = Math.abs(c - doorWorld);
      if(d < bestD){ bestD = d; best = c; }
    });
    if(best === null) return null;
    // convert the wall-centre world coord into a NET along value (cell centre -> wall centre,
    // outward-signed), then into the TUNE value (net minus the anchor-derivation default).
    const sign = passageIsZ ? (axes.edgeSignZ || 0) : (axes.edgeSignX || 0);
    if(!sign) return null;
    const net = (best - doorWorld) * sign;
    return net - ITR_DOOR_MOUNT_ALONG_SHELL;
  }
  const mountRows = {};
  function clayMountRender(){
    const tune = clayMountTune(); if(!tune) return;
    const rep = S.doorMountReport;
    mountRows.depthInWall.textContent = (tune.along >= 0 ? "+" : "") + tune.along.toFixed(3);
    mountRows.sideLap.textContent = (tune.lateral >= 0 ? "+" : "") + tune.lateral.toFixed(3);
    mountRows.sill.textContent = (tune.vertical >= 0 ? "+" : "") + tune.vertical.toFixed(3);
    mountRows.applied.textContent = rep && rep.perDoor[0]
      ? ("applied dx " + rep.perDoor[0].dx + "  dz " + rep.perDoor[0].dz + "  dy " + rep.perDoor[0].dy +
         "  (anchor default along " + rep.alongDefault + ", shell " + rep.shellOn + ")")
      : "no door mounted";
    mountRows.exportBox.value = JSON.stringify({
      kind: "object-mount", id: "door", version: 1,
      fixture: "clay-c1a", recipe: "camera-side-wall-omission v1 + clay-diagnostic-surface v1",
      values: { depthInWallU: tune.along, sideLapU: tune.lateral, sillU: tune.vertical },
      appliedWorld: rep && rep.perDoor[0] ? rep.perDoor[0] : null,
    });
  }
  function clayMountNudge(axis, dir, ev){
    const tune = clayMountTune(); if(!tune) return;
    const step = ev && ev.shiftKey ? 0.001 : (ev && ev.altKey ? 0.10 : 0.01); // §6.1's ladder verbatim
    tune[axis] = +(tune[axis] + dir * step).toFixed(3);
    clayMountReplay(); clayMountRender();
  }
  function clayMountSnap(which){
    const tune = clayMountTune(); if(!tune) return;
    if(which === "cell-centre") tune.along = -ITR_DOOR_MOUNT_ALONG_SHELL; // net 0 from the cell
    else if(which === "boundary") tune.along = 0;                        // centre plane on wall face
    else if(which === "wall-centre"){
      const v = clayMountWallCentreAlong();
      if(v !== null) tune.along = +v.toFixed(3);
    }
    clayMountReplay(); clayMountRender();
  }
  [["depthInWall", "along", "depth into wall"], ["sideLap", "lateral", "lateral along run"], ["sill", "vertical", "vertical"]].forEach(function(def){
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:5px;margin:3px 0;";
    const label = document.createElement("span");
    label.textContent = def[0]; label.title = def[2];
    label.style.cssText = "width:86px;color:#9ab;";
    const minus = document.createElement("button"); minus.textContent = "−";
    const value = document.createElement("span"); value.style.cssText = "width:64px;text-align:center;";
    const plus = document.createElement("button"); plus.textContent = "+";
    [minus, plus].forEach(function(b){ b.style.cssText = "font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:1px 8px;"; });
    minus.addEventListener("click", function(ev){ clayMountNudge(def[1], -1, ev); });
    plus.addEventListener("click", function(ev){ clayMountNudge(def[1], +1, ev); });
    row.appendChild(label); row.appendChild(minus); row.appendChild(value); row.appendChild(plus);
    mountBody.appendChild(row);
    mountRows[def[0]] = value;
  });
  const stepNote = document.createElement("div");
  stepNote.textContent = "click ±0.01 · shift-click ±0.001 · alt-click ±0.10 (world units; 1 = 1 cell = 5 ft)";
  stepNote.style.cssText = "color:#7a8494;margin:2px 0 6px;";
  mountBody.appendChild(stepNote);
  const snapRow = document.createElement("div");
  snapRow.style.cssText = "display:flex;gap:4px;margin:2px 0 6px;";
  ["cell-centre", "boundary", "wall-centre"].forEach(function(which){
    const b = document.createElement("button");
    b.textContent = "snap " + which;
    b.style.cssText = "flex:1;font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:3px;";
    b.addEventListener("click", function(){ clayMountSnap(which); });
    snapRow.appendChild(b);
  });
  mountBody.appendChild(snapRow);
  mountRows.applied = document.createElement("div");
  mountRows.applied.style.cssText = "color:#9ab;margin:4px 0;";
  mountBody.appendChild(mountRows.applied);
  const exportLabel = document.createElement("div");
  exportLabel.textContent = "lock export (kind:object-mount — copy; the portal's SAVE pipeline lands with DEV-PORTAL):";
  exportLabel.style.cssText = "color:#7a8494;margin-top:6px;";
  mountBody.appendChild(exportLabel);
  mountRows.exportBox = document.createElement("textarea");
  mountRows.exportBox.readOnly = true;
  mountRows.exportBox.style.cssText = "width:100%;height:64px;font:10px monospace;background:#1a1a20;color:#cd9;border:1px solid #333;border-radius:3px;margin-top:2px;";
  mountBody.appendChild(mountRows.exportBox);

  // C1B Move tab — every answer comes from src/engine/tactical-query.js over the SAME SpatialPlan
  // that built the visible room. Filled cyan cells are the ordinary 30-ft band; hollow amber
  // diamonds are the additional Dash band, so the distinction survives without colour. Clicking
  // the real floor chooses a destination; only the kernel decides whether the preview is lawful.
  const movementBody = document.createElement("div");
  movementBody.style.cssText = "display:none;font:10px/1.45 monospace;color:#dde;";
  const movementIntro = document.createElement("div");
  movementIntro.innerHTML =
    "<div style='color:#9ab;margin-bottom:5px'>PRODUCTION SPATIALPLAN → TACTICAL QUERY → RECEIPT → MOVE-STEP</div>" +
    "<div><span style='color:#43b9df'>■ filled</span> MOVE 30 ft · <span style='color:#f2bd54'>◇ hollow</span> DASH +30 ft</div>" +
    "<div style='color:#7a8494;margin:3px 0 7px'>Move tab active: click a floor cell to preview. Pan still works by dragging.</div>";
  movementBody.appendChild(movementIntro);
  const movementPace = document.createElement("div");
  movementPace.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
  const movePaceBtn = document.createElement("button");
  movePaceBtn.textContent = "MOVE · 30 ft";
  const dashPaceBtn = document.createElement("button");
  dashPaceBtn.textContent = "DASH · 60 ft";
  [movePaceBtn, dashPaceBtn].forEach(function(button){
    button.style.cssText = "flex:1;font:10px monospace;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    movementPace.appendChild(button);
  });
  movementBody.appendChild(movementPace);
  const movementRoute = document.createElement("div");
  movementRoute.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
  const autoRouteBtn = document.createElement("button");
  autoRouteBtn.textContent = "AUTO";
  const eastRouteBtn = document.createElement("button");
  eastRouteBtn.textContent = "EAST / SAFE";
  const westRouteBtn = document.createElement("button");
  westRouteBtn.textContent = "WEST / DIFFICULT";
  [autoRouteBtn, eastRouteBtn, westRouteBtn].forEach(function(button){
    button.style.cssText = "flex:1;font:9px monospace;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    movementRoute.appendChild(button);
  });
  movementBody.appendChild(movementRoute);
  const movementActions = document.createElement("div");
  movementActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px;";
  const previewDoorBtn = document.createElement("button");
  previewDoorBtn.textContent = "PREVIEW DOOR";
  const usePortalBtn = document.createElement("button");
  usePortalBtn.textContent = "PREVIEW PORTAL USE";
  const commitMoveBtn = document.createElement("button");
  commitMoveBtn.textContent = "COMMIT PREVIEW";
  const resetMoveBtn = document.createElement("button");
  resetMoveBtn.textContent = "RESET MOVEMENT";
  [previewDoorBtn, usePortalBtn, commitMoveBtn, resetMoveBtn].forEach(function(button){
    button.style.cssText = "font:9px monospace;background:#252a32;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    movementActions.appendChild(button);
  });
  commitMoveBtn.style.background = "#254536";
  resetMoveBtn.style.background = "#49352e";
  movementBody.appendChild(movementActions);
  const movementOut = document.createElement("pre");
  movementOut.id = "clay-room-movement-readout";
  movementOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  movementBody.appendChild(movementOut);

  function clayMovementSession(){
    return clayRoomMovementSession();
  }
  function clayMovementVia(session){
    if(session.route === "east") return session.fixture.localCells.east;
    if(session.route === "west") return session.fixture.localCells.west;
    return null;
  }
  function clayMovementPreview(request){
    const session = clayMovementSession();
    if(!session || session.busy) return;
    session.preview = tqMovementPreview(session.fixture.space, session.state, request);
    clayMovementRender();
  }
  function clayMovementPreviewCell(cellId){
    const session = clayMovementSession();
    if(!session) return;
    clayMovementPreview({
      actorId: session.fixture.actorId,
      destinationCellId: cellId,
      pace: session.pace,
      viaCellId: clayMovementVia(session),
      routeLabel: session.route === "west"
        ? "west difficult shoulder"
        : (session.route === "east" ? "east of the crate" : "shortest lawful route")
    });
  }
  S.clayRoomMovementPreviewCell = clayMovementPreviewCell;
  function clayMovementRender(readoutOnly){
    const session = clayMovementSession();
    if(!session) return;
    const actor = session.state.actors.find(function(row){ return row.id === session.fixture.actorId; });
    const connection = session.state.connections.find(function(row){ return row.id === session.fixture.connectionId; });
    const ranges = tqMovementRanges(session.fixture.space, session.state, session.fixture.actorId);
    if(!readoutOnly) clayRoomRenderMovementOverlay(ranges, session.preview);
    movePaceBtn.style.background = session.pace === "move" ? "#24516a" : "#2a2a30";
    dashPaceBtn.style.background = session.pace === "dash" ? "#6a4d24" : "#2a2a30";
    autoRouteBtn.style.background = session.route === "auto" ? "#3a3a44" : "#2a2a30";
    eastRouteBtn.style.background = session.route === "east" ? "#35543b" : "#2a2a30";
    westRouteBtn.style.background = session.route === "west" ? "#684a28" : "#2a2a30";
    commitMoveBtn.disabled = !session.preview || !session.preview.ok || !!session.busy;
    commitMoveBtn.style.opacity = commitMoveBtn.disabled ? "0.5" : "1";
    const conn = session.fixture.space.connections[0];
    const ordinary = tqConnectionAssessment(conn, actor.bodyForm);
    const largeBody = Object.assign({}, actor.bodyForm, { sizeCategory: "Large" });
    const hugeBody = Object.assign({}, actor.bodyForm, { sizeCategory: "Huge" });
    const difficult = tqConnectionAssessment(conn, largeBody);
    const blocked = tqConnectionAssessment(conn, hugeBody);
    const uncertain = tqConnectionAssessment(conn, actor.bodyForm, "force-warped-frame");
    const lines = [
      "STATE rev " + session.state.revision + " · actor " + actor.sceneId + " / " + actor.cellId,
      "CONNECTION " + connection.id + " v" + connection.version + " · " + connection.state + " · one owner",
      "RANGE move " + ranges.moveCellIds.length + " cells · dash-only " + ranges.dashCellIds.length + " cells",
      "DOOR " + (ranges.moveCellIds.indexOf(session.fixture.localCells.portal) >= 0 ? "MOVE" :
        (ranges.dashCellIds.indexOf(session.fixture.localCells.portal) >= 0 ? "DASH" : "OUT OF RANGE")),
      "",
      "BODY CASES (same production connection)",
      "  Small → " + ordinary.kind,
      "  Large → " + difficult.kind + " · " + difficult.reason,
      "  Huge  → " + blocked.kind + " · alternatives " + blocked.alternatives.length,
      "  optional warped-frame method → " + uncertain.kind + " · exact DC hidden until commit",
      ""
    ];
    if(session.preview){
      lines.push(tqReceiptProse(session.preview));
    } else {
      lines.push("No preview. Click a floor cell or use a preview button.");
    }
    if(session.lastReceipt){
      lines.push("", "LAST COMMIT", tqReceiptProse(session.lastReceipt));
    }
    const animation = session.animationProof;
    lines.push("", "ANIMATION " + (session.busy ? "ACTIVE · receipt already committed" : "settled"));
    if(animation){
      lines.push("  actor " + (animation.actorFound ? "FOUND" : "MISSING")
        + " · steps " + animation.completedSteps + "/" + animation.requestedSteps
        + " · " + animation.status);
      if(!animation.actorFound && animation.selectionProbe){
        lines.push("  lookup " + animation.selectionProbe.visited + " nodes · candidates "
          + (animation.selectionProbe.candidates.join(", ") || "none"));
      }
    }
    movementOut.textContent = lines.join("\n");
  }
  movePaceBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.pace = "move"; clayMovementRender();
  });
  dashPaceBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.pace = "dash"; clayMovementRender();
  });
  autoRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "auto"; clayMovementRender();
  });
  eastRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "east"; clayMovementRender();
  });
  westRouteBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    session.route = "west"; clayMovementRender();
  });
  previewDoorBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    clayMovementPreviewCell(session.fixture.localCells.portal);
  });
  usePortalBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session) return;
    clayMovementPreview({
      actorId: session.fixture.actorId,
      connectionId: session.fixture.connectionId,
      pace: session.pace,
      routeLabel: "use canonical north connection"
    });
  });
  commitMoveBtn.addEventListener("click", function(){
    const session = clayMovementSession();
    if(!session || session.busy || !session.preview || !session.preview.ok) return;
    const committed = tqMovementCommit(session.fixture.space, session.state, session.preview);
    if(!committed.ok){
      session.preview = committed;
      clayMovementRender();
      return;
    }
    session.state = committed.state;
    session.lastReceipt = committed.receipt;
    session.preview = null;
    session.busy = true;
    const lightBefore = clayRoomLightingSnapshot("before-movement-animation");
    clayRoomRecordLightingProbe("movement " + committed.receipt.id, lightBefore, true);
    clayMovementRender();
    clayRoomAnimateMovementReceipt(committed.receipt, function(){
      clayRoomApplyMovementBoard(session.state, "clayroom-movement-receipt");
      session.busy = false;
      clayMovementRender();
    }, function(){ clayMovementRender(true); });
  });
  resetMoveBtn.addEventListener("click", function(){
    const session = clayMovementSession(); if(!session || session.busy) return;
    session.state = session.initialState;
    session.preview = null;
    session.lastReceipt = null;
    session.animationProof = null;
    session.pace = "dash";
    session.route = "east";
    clayRoomApplyMovementBoard(session.state, "clayroom-movement-reset");
    clayMovementRender();
  });

  // State tab — an executable proof of the production door projection, not a second demo door.
  // Each button clone-patches S.lastBoard.interactables and replays the SAME setInteriorBoard ->
  // interiorBuildInteractables -> hinge tween path normal state projection uses. The canonical clay
  // record stays frozen; this override lives only for the current dev session.
  const stateBody = document.createElement("div");
  stateBody.style.cssText = "display:none;font:11px/1.5 monospace;color:#dde;";
  const stateIntro = document.createElement("div");
  stateIntro.textContent = "canonical Connection commit → board.interactables projection → 320ms hinge tween";
  stateIntro.style.cssText = "color:#9ab;margin-bottom:6px;";
  stateBody.appendChild(stateIntro);
  const stateButtons = document.createElement("div");
  stateButtons.style.cssText = "display:flex;gap:5px;margin-bottom:7px;";
  const stateOut = document.createElement("div");
  stateOut.style.cssText = "white-space:pre-wrap;color:#cd9;border-top:1px solid #333;padding-top:6px;";
  function clayDoorStateRender(){
    const proof = clayRoomDoorProofState();
    stateOut.textContent = [
      "authored " + (proof.authoredState || "—") + " · mounted " + (proof.mountedState || "—"),
      "hinge " + (proof.hingeAngleDeg == null ? "—" : proof.hingeAngleDeg.toFixed(1) + "°") +
        " · leaf " + (proof.leafVisible ? "visible" : "hidden"),
      "tween " + (proof.tweenActive ? "ACTIVE" : "settled") +
        (proof.mount ? " · mount dx " + proof.mount.dx + " dz " + proof.mount.dz + " dy " + proof.mount.dy : ""),
    ].join("\n");
  }
  function clayDoorStateApply(nextState){
    const session = clayMovementSession();
    if(!session || session.busy) return;
    const committed = tqConnectionStateCommit(session.fixture.space, session.state, {
      connectionId: session.fixture.connectionId,
      state: nextState
    });
    if(!committed.ok) return;
    session.state = committed.state;
    session.lastReceipt = committed.receipt;
    session.preview = null;
    clayRoomApplyMovementBoard(session.state, "clayroom-door-state");
    clayDoorStateRender();
    clayMovementRender();
    setTimeout(clayDoorStateRender, ITR_DOOR_SWING_TWEEN_MS + 40);
  }
  [["shut", "Set door shut"], ["ajar", "Set door ajar"], ["open", "Set door open"]].forEach(function(def){
    const b = document.createElement("button");
    b.textContent = def[0];
    b.setAttribute("aria-label", def[1]);
    b.style.cssText = "flex:1;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    b.addEventListener("click", function(){ clayDoorStateApply(def[0]); });
    stateButtons.appendChild(b);
  });
  stateBody.appendChild(stateButtons);
  stateBody.appendChild(stateOut);

  // CL-R3 Structure tab — inspection and A/B views over the mounted production structure bench.
  // The controls reveal authored facts; they do not mutate dimensions or invent a second builder.
  const structureBody = document.createElement("div");
  structureBody.style.cssText = "display:none;font:10px/1.42 monospace;color:#dde;";
  const structureIntro = document.createElement("div");
  structureIntro.innerHTML =
    "<div style='color:#9fd4ec;margin-bottom:4px'>CL-F01 · REUSABLE CONSTRUCTION GRAMMAR</div>" +
    "<div style='color:#9ab'>Production shell + generic atoms + the ASSEMBLY terrace (same pieces composed). " +
    "SOCKET arrows point along their join axis — <span style='color:#35d8ff'>butt-join</span> · <span style='color:#66dfa0'>walk-surface</span> · " +
    "<span style='color:#6f8fff'>top-surface</span> · <span style='color:#c08a5a'>terrain-join</span> · <span style='color:#ff7ad8'>hinge</span> · " +
    "<span style='color:#b9c2cc'>mount</span>. ACCESS frames are per-face — <span style='color:#66dfa0'>walk</span> · " +
    "<span style='color:#f3bd55'>climb-cost</span> · <span style='color:#ff6d68'>climb-dc</span> · <span style='color:#8a9099'>none</span>. Red X = rejected join.</div>";
  structureBody.appendChild(structureIntro);
  const structureFixtureNav = document.createElement("div");
  structureFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:7px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTS"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITES"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-structure-fixture-nav");
      if(def[0] === CLAY_ROOM_STRUCTURE_BENCH_ID) clayShowTab("structure");
      else if(def[0] === CLAY_ROOM_LIGHTING_BENCH_ID) clayShowTab("lights");
      else if(def[0] === CLAY_ROOM_SPRITE_BENCH_ID) clayShowTab("sprites");
      else clayShowTab("movement");
    });
    structureFixtureNav.appendChild(button);
  });
  structureBody.appendChild(structureFixtureNav);
  const structureViewActions = document.createElement("div");
  structureViewActions.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:7px;";
  const structureViewButtons = {};
  [
    ["assembled", "ASSEMBLED"],
    ["sockets", "SOCKETS"],
    ["access", "ACCESS"],
    ["negative", "BAD JOIN"],
    ["strategic", "ALL WALLS"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Show Clayroom structure " + def[0] + " view");
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetStructureView(def[0]); });
    structureViewActions.appendChild(button);
    structureViewButtons[def[0]] = button;
  });
  structureBody.appendChild(structureViewActions);
  const structureStageActions = document.createElement("div");
  structureStageActions.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:7px;";
  const structureStageButtons = {};
  [
    ["sealed", "LEAVE PLAY", function(){ clayRoomSetStructureStaged(false); }],
    ["staged", "STAGE SPACE", function(){ clayRoomSetStructureStaged(true); }],
    ["shut", "SHUT DOOR", function(){ clayRoomSetStructureDoorState("shut"); }],
    ["open", "OPEN DOOR", function(){ clayRoomSetStructureDoorState("open"); }]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Clayroom structure " + def[0]);
    button.style.cssText = "font:7px monospace;background:#252a32;color:#cfd8e3;border:1px solid #414955;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", def[2]);
    structureStageActions.appendChild(button);
    structureStageButtons[def[0]] = button;
  });
  structureBody.appendChild(structureStageActions);
  const structureParts = document.createElement("div");
  structureParts.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:7px;";
  const structureFixture = clayRoomStructureBenchFixtureFrom(record);
  structureFixture.pieces.forEach(function(spec){
    const button = document.createElement("button");
    button.textContent = spec.label;
    button.title = spec.kind + " · " + spec.sockets.map(function(s){ return s.type; }).join(", ");
    button.style.cssText = "font:8px/1.25 monospace;text-align:left;background:#252a32;color:#ccd5df;border:1px solid #414955;border-radius:3px;padding:4px;cursor:pointer;";
    button.addEventListener("click", function(){
      S.clayRoomSelectedId = spec.id;
      S.clayRoomWorkbenchSelect(spec.id, "structure catalog");
    });
    structureParts.appendChild(button);
  });
  structureBody.appendChild(structureParts);
  const structureOut = document.createElement("pre");
  structureOut.id = "clay-room-structure-readout";
  structureOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  structureBody.appendChild(structureOut);
  function clayStructureRender(){
    const snap = window.Theater._clayStructureBenchForTest();
    Object.keys(structureViewButtons).forEach(function(view){
      structureViewButtons[view].style.background = snap && snap.view === view ? "#35516a" : "#2a2a30";
    });
    if(!snap){
      structureOut.textContent = "Switch to the Structure fixture to mount CL-F01.";
      return;
    }
    structureStageButtons.staged.style.background = snap.wallOmission.staged ? "#35543b" : "#252a32";
    structureStageButtons.sealed.style.background = snap.wallOmission.staged ? "#252a32" : "#684a28";
    structureStageButtons.shut.style.background = snap.wallOmission.doorState === "shut" ? "#35516a" : "#252a32";
    structureStageButtons.open.style.background = snap.wallOmission.doorState === "open" ? "#35516a" : "#252a32";
    const lines = [
      "fixture " + snap.fixtureId + " v" + snap.fixtureVersion + " · catalog " + snap.catalogId + " v" + snap.catalogVersion,
      "GRID 1 cell = " + snap.gridLaw.cellFeet + " ft · h = " + snap.gridLaw.verticalQuantumFeet
        + " ft · storey = " + snap.gridLaw.storeyFeet + " ft",
      "SHELL " + snap.shell.meta.floorCellCount + " cells · " + snap.shell.wallSegments + " wall runs · "
        + snap.shell.riserSegments + " retaining/riser runs",
      "      tiers " + snap.shell.tiers.join("/") + " · slab sides " + (snap.shell.exposedSlabSides ? "PASS" : "FAIL")
        + " · omitted near uppers " + snap.shell.omittedUpperSegments,
      "OMISSION " + (snap.wallOmission.active ? "STEM ONLY" : "ALL UPPERS") + " · staged "
        + (snap.wallOmission.staged ? "YES" : "NO") + " · latched "
        + (snap.wallOmission.latched ? "YES" : "NO") + " · door " + snap.wallOmission.doorState,
      "         camera " + snap.wallOmission.cameraMode + " · aperture "
        + (snap.wallOmission.apertureUpperBuilt ? "KEPT" : "FAIL") + " · riser mass "
        + (snap.wallOmission.structuralMassBuilt ? "KEPT" : "FAIL"),
      "OPENING aperture " + snap.shell.apertures + " · frame/threshold/hinge leaf · "
        + snap.opening.swingClearanceDeg + "° clearance",
      "RAMP " + snap.slope.degrees + "° ≤ " + snap.slope.maxDegrees + "° · " + (snap.slope.walkable ? "WALK" : "FAIL"),
      "SOCKETS " + CLAY_STRUCTURE_KIT_CATALOG.socketTypes.length + " named families · "
        + snap.specimens.reduce(function(n, row){ return n + row.sockets.length; }, 0) + " mounted specimen sockets",
      "ACCESS walk / climb-cost / climb-dc / none · mechanics "
        + (snap.climbMechanicsImplemented ? "IMPLEMENTED" : "NOT CLAIMED"),
      "BAD JOIN " + (snap.negativeControl.accepted ? "WRONG PASS" : "REJECTED") + " · "
        + snap.negativeControl.reason + " · visible gap " + (snap.negativeControl.visibleGap ? "YES" : "NO"),
      "CUTAWAY camera-side omission " + (snap.cameraSideOmission && snap.cameraSideOmission.active ? "ACTIVE" : "OFF")
        + " · dynamic classifier " + snap.dynamicCutaway.candidates + " candidates / "
        + snap.dynamicCutaway.blocking + " blocking / " + snap.dynamicCutaway.faded + " faded",
      "MESHES " + snap.mountedMeshes + " · shadow casters " + snap.shadowCasters + " · receivers " + snap.shadowReceivers,
      "PROVENANCE " + snap.provenance.author + " · " + snap.provenance.source
    ];
    structureOut.textContent = lines.join("\n");
  }
  S.clayRoomRefreshStructure = clayStructureRender;

  // CL-R1 Lights tab — reads and controls the real production fixture targets. No demonstration
  // meshes/lights are mounted here; every value comes from the live PointLight + emitter material.
  const lightsBody = document.createElement("div");
  lightsBody.style.cssText = "display:none;font:10px/1.45 monospace;color:#dde;";
  const fixtureActions = document.createElement("div");
  fixtureActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:7px;";
  const fixtureButtons = {};
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM TRUTH"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE BENCH"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTING BENCH"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITE BENCH"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Use " + def[0] + " Clayroom fixture");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){ clayRoomSetFixture(def[0], "clayroom-fixture-button"); });
    fixtureActions.appendChild(button);
    fixtureButtons[def[0]] = button;
  });
  lightsBody.appendChild(fixtureActions);
  const lightsIntro = document.createElement("div");
  lightsIntro.textContent = "CL-F02: neutral stairs + matte sphere/cube + real sprite, through the production renderer";
  lightsIntro.style.cssText = "color:#9ab;margin-bottom:6px;";
  lightsBody.appendChild(lightsIntro);
  const lightingModeActions = document.createElement("div");
  lightingModeActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const lightingModeButtons = {};
  [
    ["clay-neutral-truth", "NEUTRAL"],
    ["clay-opposing-pair", "WARM / COOL"],
    ["torchlit", "FANTASY TORCH"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Use " + def[0] + " lighting recipe");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){ clayRoomSetLightingRecipe(def[0], "clayroom-mode-button"); });
    lightingModeActions.appendChild(button);
    lightingModeButtons[def[0]] = button;
  });
  lightsBody.appendChild(lightingModeActions);
  const lorePreviewLabel = document.createElement("div");
  lorePreviewLabel.textContent = "LORE-NATIVE PREVIEWS · existing renderer recipes";
  lorePreviewLabel.style.cssText = "color:#8fb7a1;margin:8px 0 4px;";
  lightsBody.appendChild(lorePreviewLabel);
  const lorePreviewActions = document.createElement("div");
  lorePreviewActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  CLAY_ROOM_LORE_LIGHT_PREVIEWS.forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def.label;
    button.title = def.source + " · shared authored recipe " + def.id;
    button.setAttribute("aria-label", "Preview lore-native " + def.source + " recipe");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #44534b;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){
      clayRoomSetLightingRecipe(def.id, "clayroom-lore-preview");
    });
    lorePreviewActions.appendChild(button);
    lightingModeButtons[def.id] = button;
  });
  lightsBody.appendChild(lorePreviewActions);

  const seedLabel = document.createElement("div");
  seedLabel.textContent = "ANIMATION SEED PREVIEW · physical values stay locked";
  seedLabel.style.cssText = "color:#9ab;margin:5px 0 4px;";
  lightsBody.appendChild(seedLabel);
  const seedActions = document.createElement("div");
  seedActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const seedButtons = {};
  CLAY_ROOM_LIGHT_PREVIEW_SEEDS.forEach(function(seed){
    const button = document.createElement("button");
    button.textContent = "SEED " + seed;
    button.setAttribute("aria-label", "Use Clayroom animation preview seed " + seed);
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    button.addEventListener("click", function(){
      S.clayRoomPreviewSeed = seed;
      S.clayRoomPixelMetricsCache = null;
      clayRoomSetLightingRecipe(S.clayRoomLightRecipeId || "torchlit", "clayroom-seed-preview");
    });
    seedActions.appendChild(button);
    seedButtons[seed] = button;
  });
  lightsBody.appendChild(seedActions);

  const overlayActions = document.createElement("div");
  overlayActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const overlayButtons = {};
  [
    ["position", "POSITION"],
    ["range", "RANGE"],
    ["shadow", "SHADOW VOLUME"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.setAttribute("aria-label", "Toggle " + def[0] + " light overlay");
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
    button.addEventListener("click", function(){
      S.clayRoomLightOverlayModes = S.clayRoomLightOverlayModes || { position: false, range: false, shadow: false };
      S.clayRoomLightOverlayModes[def[0]] = !S.clayRoomLightOverlayModes[def[0]];
      clayRoomBuildLightOverlays();
      if(S.clayRoomRefreshFixtureControls) S.clayRoomRefreshFixtureControls();
      markDirty();
    });
    overlayActions.appendChild(button);
    overlayButtons[def[0]] = button;
  });
  lightsBody.appendChild(overlayActions);
  // Checkpoint 1 — the bounded ENVIRONMENT AO diagnostic A/B. One ON/OFF comparison control
  // (the same pass-enabled seam the harness uses), deliberately not a strength/radius slider:
  // the AO settings are authored constants, reviewed like any other visual law.
  const envAOActions = document.createElement("div");
  envAOActions.style.cssText = "display:grid;grid-template-columns:1fr;gap:4px;margin-bottom:7px;";
  const envAOButton = document.createElement("button");
  envAOButton.setAttribute("aria-label", "Toggle environment ambient occlusion A/B");
  envAOButton.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:5px;";
  const envAOSync = function(){
    const ao = S.postSuite && S.postSuite.ao;
    const on = !!(ao && ao.enabled);
    envAOButton.textContent = "ENV AO " + (on ? "ON" : "OFF") + " · A/B";
    envAOButton.style.background = on ? "#35516a" : "#2a2a30";
  };
  envAOButton.addEventListener("click", function(){
    const ao = S.postSuite && S.postSuite.ao;
    if(!ao) return;
    ao.enabled = !ao.enabled;
    envAOSync();
    markDirty();
  });
  envAOActions.appendChild(envAOButton);
  envAOSync();
  S.clayRoomEnvAOSyncButton = envAOSync;
  lightsBody.appendChild(envAOActions);
  const lightsActions = document.createElement("div");
  lightsActions.style.cssText = "display:flex;gap:5px;margin-bottom:7px;";
  const restoreLightsBtn = document.createElement("button");
  restoreLightsBtn.textContent = "authored baseline";
  restoreLightsBtn.setAttribute("aria-label", "Restore authored lighting baseline");
  const rebuildLightsBtn = document.createElement("button");
  rebuildLightsBtn.textContent = "rebuild/fade proof";
  rebuildLightsBtn.setAttribute("aria-label", "Run Clayroom board rebuild lighting proof");
  const refreshPixelsBtn = document.createElement("button");
  refreshPixelsBtn.textContent = "refresh pixels";
  refreshPixelsBtn.setAttribute("aria-label", "Refresh Clayroom final pixel measurements");
  [restoreLightsBtn, rebuildLightsBtn, refreshPixelsBtn].forEach(function(b){
    b.style.cssText = "flex:1;font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    lightsActions.appendChild(b);
  });
  lightsBody.appendChild(lightsActions);

  const comparisonLabel = document.createElement("div");
  comparisonLabel.textContent = "SOURCE ART ↔ LIVE RENDER";
  comparisonLabel.style.cssText = "color:#9ab;border-top:1px solid #333;padding-top:7px;margin-top:7px;";
  lightsBody.appendChild(comparisonLabel);
  const comparisonCards = document.createElement("div");
  comparisonCards.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:5px 0 3px;";
  function comparisonCard(label){
    const card = document.createElement("div");
    card.style.cssText = "border:1px solid #303740;background:#111419;padding:4px;";
    const heading = document.createElement("div");
    heading.textContent = label;
    heading.style.cssText = "color:#aeb9c5;margin-bottom:3px;";
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 170;
    canvas.style.cssText = "display:block;width:100%;height:100px;background:#090a0d;image-rendering:pixelated;";
    card.appendChild(heading);
    card.appendChild(canvas);
    comparisonCards.appendChild(card);
    return canvas;
  }
  const sourceSpriteCanvas = comparisonCard("AUTHORED PNG");
  const renderedSpriteCanvas = comparisonCard("FINAL PIXELS");
  lightsBody.appendChild(comparisonCards);
  const sourceSpriteStatus = document.createElement("div");
  sourceSpriteStatus.style.cssText = "color:#768697;font:9px/1.35 monospace;margin-bottom:6px;overflow-wrap:anywhere;";
  sourceSpriteStatus.textContent = "loading authored source…";
  lightsBody.appendChild(sourceSpriteStatus);
  S.clayRoomRenderedSpriteCanvas = renderedSpriteCanvas;
  clayRoomMountSourceSpriteCard(sourceSpriteCanvas, sourceSpriteStatus);

  const pixelReadout = document.createElement("pre");
  pixelReadout.id = "clay-room-pixel-readout";
  pixelReadout.style.cssText = "white-space:pre-wrap;color:#bfd0df;border:1px solid #303740;background:#111419;padding:6px;margin:5px 0 7px;";
  pixelReadout.textContent = "reading final display pixels…";
  lightsBody.appendChild(pixelReadout);

  const matrixButton = document.createElement("button");
  matrixButton.textContent = "BUILD COMPLETE 7-LIGHT SHEET";
  matrixButton.setAttribute("aria-label", "Capture the complete Clayroom lighting comparison sheet");
  matrixButton.style.cssText = "width:100%;font:10px monospace;background:#283a34;color:#def4e7;border:1px solid #4b6d5d;border-radius:3px;cursor:pointer;padding:6px;";
  matrixButton.addEventListener("click", async function(){
    matrixButton.disabled = true;
    try {
      await clayRoomCaptureLightingMatrix();
    } catch(error) {
      try { console.warn("qa: Clayroom lighting matrix capture failed", error); } catch(e){}
    } finally {
      matrixButton.disabled = false;
    }
  });
  lightsBody.appendChild(matrixButton);
  const matrixStatus = document.createElement("div");
  matrixStatus.style.cssText = "color:#7f9488;margin:3px 0 7px;";
  matrixStatus.textContent = "one click · neutral + diagnostic + sun/moon/magic/fire/lava";
  lightsBody.appendChild(matrixStatus);
  S.clayRoomMatrixStatusEl = matrixStatus;

  const lightStateButtons = {};
  const lightRows = document.createElement("div");
  lightsBody.appendChild(lightRows);
  let lightRowsKey = "";
  function clayLightsBuildRows(){
    const nextKey = (S.interiorLightTargets || []).map(function(target){ return target.id; }).join("|");
    if(nextKey === lightRowsKey) return;
    lightRowsKey = nextKey;
    lightRows.innerHTML = "";
    Object.keys(lightStateButtons).forEach(function(key){ delete lightStateButtons[key]; });
    (S.interiorLightTargets || []).forEach(function(target){
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:1fr auto auto;gap:5px;align-items:center;margin:4px 0;";
    const label = document.createElement("span");
    label.textContent = target.id;
    label.style.cssText = "color:#cd9;";
    const steady = document.createElement("button");
    steady.textContent = "steady";
    steady.setAttribute("aria-label", "Set " + target.id + " steady");
    const flicker = document.createElement("button");
    flicker.textContent = "flicker";
    flicker.setAttribute("aria-label", "Set " + target.id + " flickering");
    [steady, flicker].forEach(function(b){
      b.style.cssText = "font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:2px 5px;";
    });
    steady.addEventListener("click", function(){ clayRoomSetLightState(target.id, "steady"); clayLightsRender(); });
    flicker.addEventListener("click", function(){ clayRoomSetLightState(target.id, "flickering"); clayLightsRender(); });
    row.appendChild(label); row.appendChild(steady); row.appendChild(flicker);
    lightRows.appendChild(row);
    lightStateButtons[target.id] = { steady: steady, flicker: flicker };
    });
  }
  const lightsOut = document.createElement("pre");
  lightsOut.id = "clay-room-lighting-readout";
  lightsOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  lightsBody.appendChild(lightsOut);
  function clayLightsRender(){
    clayLightsBuildRows();
    const snap = clayRoomLightingSnapshot("panel");
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const authoredRecipe = LIGHT_LAB_AUTHORED_BASELINE.profiles[activeRecipe.id] || activeRecipe;
    const activeProfile = lightRecipeLegacyProfile(authoredRecipe);
    const recipeIsAuthored = JSON.stringify(activeRecipe) === JSON.stringify(authoredRecipe);
    const baselineActive = !!(snap.ambient
      && recipeIsAuthored
      && snap.ambient.intensity === activeProfile.ambient.intensity
      && snap.ambient.color === activeProfile.ambient.color
      && snap.lights.length === activeProfile.points.length
      && snap.lights.every(function(l){
        const authoredLight = activeProfile.points.find(function(point){ return point.id === l.id; });
        if(!authoredLight || l.state !== authoredLight.state) return false;
        // markerless environmental rows have no emitter mesh to hold parity against
        const meshOk = l.emitterUuid ? (l.parity && l.meshNormalized === 1) : true;
        return l.state === "flickering" || (l.emittedNormalized === 1 && meshOk);
      }));
    const flickering = snap.lights.filter(function(l){ return l.state === "flickering"; });
    const steady = snap.lights.filter(function(l){ return l.state === "steady"; });
    const isolationPass = flickering.length === 1
      && steady.every(function(l){ return l.emittedNormalized === 1 && l.meshNormalized === 1 && l.parity; });
    const lines = [
      "fixture " + (S.clayRoomFixtureId || "—")
        + (S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
          ? " · 3 steps + matte cube/sphere + approved sprite"
          : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID
            ? " · 7-sprite scale spectrum + stair fit"
            : " · architecture/movement truth")),
      "recipe " + activeRecipe.id + " · " + activeRecipe.mode,
      "source " + activeRecipe.source.label
        + (activeRecipe.source.loreNative ? " · LORE-NATIVE" : " · DIAGNOSTIC ONLY"),
      "authored baseline " + (baselineActive ? "PASS" : "inactive (restore available)"),
      "one-light isolation " + (flickering.length === 1 ? (isolationPass ? "PASS" : "FAIL") : "arm exactly one flicker"),
      "ambient " + (snap.ambient ? snap.ambient.intensity.toFixed(2) : "—")
        + " · rig hemi/key/fill/cam "
        + ["hemi", "key", "fill", "cameraKey"].map(function(k){
          return snap.rig[k] ? snap.rig[k].intensity.toFixed(3) : "—";
        }).join("/"),
      ""
    ];
    snap.lights.forEach(function(l){
      // Checkpoint 2 READOUT TRUTH: every line below is the LIVE mounted object, never the
      // authored recipe — environmental rows (sun/moon; markerless, no distance) print their own
      // shape instead of crashing the practical-shaped formatter.
      const sample = l.normalizedSample == null ? "—" : l.normalizedSample.toFixed(6);
      lines.push(l.id + " [" + l.state + "] sample " + sample);
      lines.push("  emitted " + (l.emitted == null ? "—" : l.emitted.toFixed(6))
        + "/" + (l.emittedBase == null ? "—" : l.emittedBase.toFixed(6))
        + (l.emittedNormalized == null ? "" : " = " + l.emittedNormalized.toFixed(6)));
      if(l.mesh != null){
        lines.push("  mesh    " + l.mesh.toFixed(6) + "/" + l.meshBase.toFixed(6)
          + " = " + l.meshNormalized.toFixed(6) + " · parity " + (l.parity ? "PASS" : "FAIL"));
      }
      lines.push("  " + (l.distance != null
          ? "range " + l.distance.toFixed(2) + " · decay " + (l.decay == null ? "—" : l.decay.toFixed(2))
          : "directional (no falloff)")
        + " · shadows " + (l.castShadow ? "ON" : "OFF"));
      if(l.pointPosition){
        lines.push("  mounted pos " + l.pointPosition.map(function(v){ return v.toFixed(2); }).join("/"));
      }
      if(l.celestial){
        const hh = Math.floor(l.celestial.clockMin / 60), mm = Math.round(l.celestial.clockMin % 60);
        lines.push("  clock " + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm
          + " · arc dir " + [l.celestial.derivedDir.x, l.celestial.derivedDir.y, l.celestial.derivedDir.z]
            .map(function(v){ return v.toFixed(2); }).join("/")
          + " · arc ×" + l.celestial.intensityScale.toFixed(3));
      }
      if(l.emitterUuid){
        lines.push("  dance Δ "
          + [l.directionSample.x, l.directionSample.y, l.directionSample.z]
            .map(function(value){ return value.toFixed(3); }).join("/")
          + " · co-located " + (l.coLocated && l.directionWithinBounds ? "PASS" : "FAIL"));
        lines.push("  interval last/next "
          + (l.lastIntervalMs == null ? "—" : l.lastIntervalMs.toFixed(0))
          + "/" + (l.nextIntervalMs == null ? "—" : l.nextIntervalMs.toFixed(0)) + " ms");
      }
      lines.push("  ids point " + String(l.pointUuid).slice(0, 8)
        + " · material " + String(l.materialUuid).slice(0, 8));
      const buttons = lightStateButtons[l.id];
      if(buttons){
        buttons.steady.style.background = l.state === "steady" ? "#35543b" : "#2a2a30";
        buttons.flicker.style.background = l.state === "flickering" ? "#684a28" : "#2a2a30";
      }
    });
    const probe = S.clayRoomLightingProbe;
    lines.push("");
    if(!probe){
      lines.push("animation guard: not run");
    } else if(probe.expectedReplacement){
      lines.push("animation guard: " + probe.label);
      lines.push("  lighting identity replacement EXPECTED · next geometry-only rebuild must preserve it");
    } else {
      lines.push("animation guard: " + probe.label);
      lines.push("  object/material preservation " + (probe.preserved ? "PASS" : "FAIL"));
      lines.push("  before → during " + (probe.duringPass ? "PASS" : "FAIL"));
      lines.push("  before → after " + (probe.afterPass == null ? "pending…" : (probe.afterPass ? "PASS" : "FAIL")));
    }
    Object.keys(lightingModeButtons).forEach(function(id){
      lightingModeButtons[id].style.background = id === activeRecipe.id ? "#35516a" : "#2a2a30";
    });
    Object.keys(seedButtons).forEach(function(seed){
      seedButtons[seed].style.background = seed === (S.clayRoomPreviewSeed || "A") ? "#4b3f61" : "#2a2a30";
    });
    const pixel = clayRoomLightingPixelMetrics(false);
    if(!pixel){
      pixelReadout.textContent = "FINAL PIXEL MEASUREMENTS\nlighting bench required";
    } else {
      const fmt = function(value){ return value == null ? "—" : Number(value).toFixed(2); };
      const frame = pixel.frame || {};
      const sprite = pixel.sprite || {};
      const source = pixel.sourceSprite && pixel.sourceSprite.metrics
        ? pixel.sourceSprite.metrics : null;
      pixelReadout.textContent = [
        "FINAL PIXEL MEASUREMENTS · no recipe-value guesses",
        "frame brightness  median " + fmt(frame.medianLuma) + "/255 · p95 " + fmt(frame.p95Luma) + "/255",
        "frame clipping    white " + fmt(frame.clippedHighlightPct) + "% · black " + fmt(frame.crushedShadowPct) + "%",
        "frame colour      chroma spread " + fmt(frame.meanChromaSpread) + "/255",
        "",
        "goblin screen box median " + fmt(sprite.medianLuma) + "/255 · p95 " + fmt(sprite.p95Luma) + "/255",
        "goblin clipping   white " + fmt(sprite.clippedHighlightPct) + "% · black " + fmt(sprite.crushedShadowPct) + "%",
        "goblin colour     chroma spread " + fmt(sprite.meanChromaSpread) + "/255",
        "readability       luma Δ " + fmt(pixel.readability && pixel.readability.lumaDelta)
          + " · colour Δ " + fmt(pixel.readability && pixel.readability.chromaDelta)
          + " vs nearby background",
        "",
        source
          ? "authored PNG      median " + fmt(source.medianLuma) + "/255 · colour " + fmt(source.meanChromaSpread) + "/255 · clipped " + fmt(source.clippedHighlightPct) + "%"
          : "authored PNG      measuring opaque source pixels…",
        "measurement only · no taste threshold silently applied"
      ].join("\n");
    }
    lightsOut.textContent = lines.join("\n");
  }
  function clayRefreshFixtureControls(){
    Object.keys(fixtureButtons).forEach(function(id){
      fixtureButtons[id].style.background = id === S.clayRoomFixtureId ? "#35516a" : "#2a2a30";
    });
    const modes = S.clayRoomLightOverlayModes || {};
    Object.keys(overlayButtons).forEach(function(id){
      overlayButtons[id].style.background = modes[id] ? "#5b4728" : "#2a2a30";
      overlayButtons[id].style.opacity = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID ? "1" : "0.45";
      overlayButtons[id].disabled = S.clayRoomFixtureId !== CLAY_ROOM_LIGHTING_BENCH_ID;
    });
    const roomTruth = S.clayRoomFixtureId === CLAY_ROOM_TRUTH_FIXTURE_ID;
    const structureBench = S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID;
    document.querySelectorAll("[data-clay-room-truth-only]").forEach(function(button){
      const status = button.querySelector("[data-clay-light-status]");
      if(status){
        status.textContent = roomTruth ? "MOUNTED" : "ROOM ONLY";
        button.disabled = !roomTruth;
        button.style.opacity = roomTruth ? "1" : "0.48";
      } else {
        button.style.display = roomTruth ? "block" : "none";
      }
    });
    document.querySelectorAll("[data-clay-structure-only]").forEach(function(button){
      button.style.display = structureBench ? "block" : "none";
      button.disabled = !structureBench;
    });
    document.querySelectorAll("[data-clay-sprite-catalog]").forEach(function(button){
      const mounted = roomTruth || S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID;
      const status = button.querySelector("[data-clay-light-status]");
      if(status) status.textContent = mounted ? "MOUNTED" : "NOT IN FIXTURE";
      button.disabled = !mounted;
      button.style.opacity = mounted ? "1" : "0.42";
      if(!status) button.style.display = mounted ? "block" : "none";
    });
  }
  S.clayRoomRefreshFixtureControls = clayRefreshFixtureControls;
  restoreLightsBtn.addEventListener("click", function(){
    clayRoomRestoreAuthoredLightBaseline();
    clayLightsRender();
  });
  rebuildLightsBtn.addEventListener("click", function(){
    if(!S.lastBoard || S.lastBoard.kind !== "interior3d") return;
    S.boardKey = null;
    setInteriorBoard(S.lastBoard, { roomTransition: false, reason: "clayroom-lighting-proof" });
    clayLightsRender();
  });
  refreshPixelsBtn.addEventListener("click", function(){
    S.clayRoomPixelMetricsCache = null;
    clayRoomLightingPixelMetrics(true);
    clayLightsRender();
  });
  S.clayRoomRefreshLights = clayLightsRender;

  // CL-R2 Sprites tab — one live control surface for the production lineup, canonical-vs-cap A/B,
  // source alpha, face/edge view, stair fit, and the accepted lighting contexts. It reads the mounted
  // production groups through clayRoomSpriteCitizenshipSnapshot; no parallel sprite preview renderer.
  const spritesBody = document.createElement("div");
  spritesBody.style.cssText = "display:none;font:10px/1.4 monospace;color:#dde;";
  const spritesIntro = document.createElement("div");
  spritesIntro.innerHTML =
    "<div style='color:#9fd4ec;margin-bottom:4px'>CL-F03 · PHYSICAL CITIZENS, NOT PAPER</div>" +
    "<div style='color:#9ab'>Gold/cyan floor outlines are tactical footprints. The shallow rounded strip is only the visible standee support.</div>";
  spritesBody.appendChild(spritesIntro);

  const spriteFixtureNav = document.createElement("div");
  spriteFixtureNav.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:7px 0;";
  [
    [CLAY_ROOM_TRUTH_FIXTURE_ID, "ROOM"],
    [CLAY_ROOM_STRUCTURE_BENCH_ID, "STRUCTURE"],
    [CLAY_ROOM_LIGHTING_BENCH_ID, "LIGHTS"],
    [CLAY_ROOM_SPRITE_BENCH_ID, "SPRITES"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){
      clayRoomSetFixture(def[0], "clayroom-sprite-fixture-nav");
      if(def[0] === CLAY_ROOM_STRUCTURE_BENCH_ID) clayShowTab("structure");
      else if(def[0] === CLAY_ROOM_LIGHTING_BENCH_ID) clayShowTab("lights");
      else if(def[0] === CLAY_ROOM_TRUTH_FIXTURE_ID) clayShowTab("movement");
      else clayShowTab("sprites");
    });
    spriteFixtureNav.appendChild(button);
  });
  spritesBody.appendChild(spriteFixtureNav);

  const spriteScaleLabel = document.createElement("div");
  spriteScaleLabel.textContent = "SCALE SPECTRUM";
  spriteScaleLabel.style.cssText = "color:#aeb7c4;margin-top:7px;";
  spritesBody.appendChild(spriteScaleLabel);
  const spriteScaleActions = document.createElement("div");
  spriteScaleActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 7px;";
  const trueScaleBtn = document.createElement("button");
  trueScaleBtn.textContent = "TRUE SCALE CHECK";
  const capScaleBtn = document.createElement("button");
  capScaleBtn.textContent = "PRESENTATION · 1–30 FT";
  [trueScaleBtn, capScaleBtn].forEach(function(button){
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    spriteScaleActions.appendChild(button);
  });
  trueScaleBtn.addEventListener("click", function(){ clayRoomSetSpriteScaleMode("true-scale", "clayroom-sprite-ui"); });
  capScaleBtn.addEventListener("click", function(){ clayRoomSetSpriteScaleMode("diagnostic-cap", "clayroom-sprite-ui"); });
  spritesBody.appendChild(spriteScaleActions);

  const spriteCastLabel = document.createElement("div");
  spriteCastLabel.textContent = "LIVE CAST · click to inspect";
  spriteCastLabel.style.cssText = "color:#aeb7c4;";
  spritesBody.appendChild(spriteCastLabel);
  const spriteCastActions = document.createElement("div");
  spriteCastActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 7px;";
  const spriteCastButtons = {};
  const spriteFixture = clayRoomSpriteCitizenshipFixtureFrom(record);
  spriteFixture.cast.forEach(function(spec){
    const button = document.createElement("button");
    button.textContent = spec.label;
    button.title = spec.stress;
    button.style.cssText = "font:9px monospace;text-align:left;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetSelectedSprite(spec.slug); });
    spriteCastActions.appendChild(button);
    spriteCastButtons[spec.slug] = button;
  });
  spritesBody.appendChild(spriteCastActions);

  const spriteViewActions = document.createElement("div");
  spriteViewActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:7px;";
  const spriteViewButtons = {};
  [["face", "FACE"], ["angled", "3/4"], ["edge", "EDGE"]].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.style.cssText = "font:9px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetSelectedSpriteView(def[0]); });
    spriteViewActions.appendChild(button);
    spriteViewButtons[def[0]] = button;
  });
  spritesBody.appendChild(spriteViewActions);

  const spriteLightLabel = document.createElement("div");
  spriteLightLabel.textContent = "LIGHT RESPONSE · shared production recipes";
  spriteLightLabel.style.cssText = "color:#aeb7c4;";
  spritesBody.appendChild(spriteLightLabel);
  const spriteLightActions = document.createElement("div");
  spriteLightActions.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:4px 0 7px;";
  const spriteLightButtons = {};
  [
    ["clay-neutral-truth", "NEUTRAL"],
    ["moonlit", "DARK"],
    ["torchlit", "WARM"],
    ["magic-glow", "COOL"],
    ["daylit", "DAY"]
  ].forEach(function(def){
    const button = document.createElement("button");
    button.textContent = def[1];
    button.title = def[0];
    button.style.cssText = "font:8px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;padding:5px 1px;cursor:pointer;";
    button.addEventListener("click", function(){ clayRoomSetLightingRecipe(def[0], "clayroom-sprite-light-context"); });
    spriteLightActions.appendChild(button);
    spriteLightButtons[def[0]] = button;
  });
  spritesBody.appendChild(spriteLightActions);

  const spriteSourceCard = document.createElement("div");
  spriteSourceCard.style.cssText = "display:grid;grid-template-columns:92px 1fr;gap:7px;align-items:center;border:1px solid #39404a;background:#181b20;padding:6px;margin-bottom:7px;";
  const spriteSourceImg = document.createElement("img");
  spriteSourceImg.alt = "Selected sprite source PNG";
  spriteSourceImg.style.cssText = "width:88px;height:88px;object-fit:contain;image-rendering:pixelated;background:repeating-conic-gradient(#252830 0 25%,#17191e 0 50%) 0/12px 12px;";
  const spriteSourceText = document.createElement("div");
  spriteSourceText.style.cssText = "color:#9ab;white-space:pre-wrap;";
  spriteSourceCard.appendChild(spriteSourceImg);
  spriteSourceCard.appendChild(spriteSourceText);
  spritesBody.appendChild(spriteSourceCard);

  const spritesOut = document.createElement("pre");
  spritesOut.id = "clay-room-sprite-readout";
  spritesOut.style.cssText = "white-space:pre-wrap;color:#dde;border-top:1px solid #333;padding-top:6px;margin:6px 0 0;";
  spritesBody.appendChild(spritesOut);

  function claySpritesRender(){
    const snap = clayRoomSpriteCitizenshipSnapshot();
    if(!snap){
      spritesOut.textContent = "sprite fixture unavailable";
      return;
    }
    trueScaleBtn.style.background = snap.scaleMode === "true-scale" ? "#35516a" : "#2a2a30";
    capScaleBtn.style.background = snap.scaleMode === "diagnostic-cap" ? "#684a28" : "#2a2a30";
    Object.keys(spriteCastButtons).forEach(function(slug){
      spriteCastButtons[slug].style.background = slug === snap.selectedSlug ? "#35516a" : "#2a2a30";
    });
    Object.keys(spriteViewButtons).forEach(function(view){
      spriteViewButtons[view].style.background = view === snap.selectedView ? "#4b3f61" : "#2a2a30";
    });
    Object.keys(spriteLightButtons).forEach(function(id){
      spriteLightButtons[id].style.background = id === S.clayRoomLightRecipeId ? "#35543b" : "#2a2a30";
    });
    const selected = snap.lineup.find(function(row){ return row.slug === snap.selectedSlug; });
    const selectedEntry = spriteEntryFor(snap.selectedSlug);
    if(selectedEntry) spriteSourceImg.src = spriteAssetPathFor(selectedEntry);
    spriteSourceText.textContent = selected
      ? [
          "SOURCE PNG · sRGB",
          selected.label,
          selected.canonicalFeet + " ft canonical",
          "anchor " + Number(selected.footX).toFixed(3) + " / " + Number(selected.footY).toFixed(3),
          "bounds " + (selected.contentBounds ? "compiled" : "MISSING · editor pass needed"),
          "alpha cutoff " + selected.alphaCutoff
        ].join("\n")
      : "selected sprite is loading…";
    const lines = [
      "fixture " + snap.fixtureId + " v" + snap.fixtureVersion,
      "mode " + snap.scaleMode + (snap.scaleMode === "diagnostic-cap" ? " · PREFERRED PRESENTATION" : " · CANONICAL SIZE CHECK"),
      "support " + snap.supportForm + " · tactical footprint remains separate",
      "contact pool multiply · darkens lit and already-shadowed floor values",
      "cast shadow alpha silhouette · edge shell non-casting",
      "shadow form " + Number(snap.environmentFormFill.intensity).toFixed(3)
        + " hemisphere · shadowless · tread/riser value floor",
      selected && selected.selectionBaseNeon
        ? "selected base neon · " + selected.selectionBaseNeon.source
          + " · " + selected.selectionBaseNeon.footprintShape
          + " · additive spill · no center bulb"
        : "selected base neon loading…",
      "stair proof " + (snap.stairSamples.length === 3 && snap.stairSamples.every(function(row){ return row.stairFit; })
        ? "PASS · face / 3⁄4 / edge"
        : "loading…"),
      ""
    ];
    snap.lineup.forEach(function(row){
      const renderedFeet = row.renderedWorldHeight == null ? "—" : (row.renderedWorldHeight * 5).toFixed(2);
      lines.push(
        (row.selected ? "▶ " : "  ") + row.label + " · canonical " + row.canonicalFeet + " ft · shown " + renderedFeet + " ft"
      );
      lines.push(
        "    tactical " + row.tacticalSpanCells + " cell · support "
        + Number(row.supportWidth).toFixed(2) + "×" + Number(row.supportDepth).toFixed(3)
        + " · tread " + Number(row.treadDepth).toFixed(3) + " · shell " + (row.shell ? "PASS" : "FAIL")
      );
      if(row.regenRecommended) lines.push("    ⚑ WIDTH FLAG · consider a taller/more upright regeneration");
    });
    lines.push("", "WIDTH FLAGS " + (snap.regenRecommended.length ? snap.regenRecommended.length : "none"));
    spritesOut.textContent = lines.join("\n");
  }
  S.clayRoomRefreshSprites = claySpritesRender;

  panel.appendChild(factsBody);
  panel.appendChild(explainBody);
  panel.appendChild(surfacesBody);
  panel.appendChild(mountBody);
  panel.appendChild(stateBody);
  panel.appendChild(movementBody);
  panel.appendChild(structureBody);
  panel.appendChild(lightsBody);
  panel.appendChild(spritesBody);

  function clayShowTab(which){
    factsBody.style.display = which === "facts" ? "" : "none";
    explainBody.style.display = which === "explain" ? "" : "none";
    surfacesBody.style.display = which === "surfaces" ? "" : "none";
    mountBody.style.display = which === "mount" ? "" : "none";
    stateBody.style.display = which === "state" ? "" : "none";
    movementBody.style.display = which === "movement" ? "" : "none";
    structureBody.style.display = which === "structure" ? "" : "none";
    lightsBody.style.display = which === "lights" ? "" : "none";
    spritesBody.style.display = which === "sprites" ? "" : "none";
    factsTabBtn.style.background = which === "facts" ? "#3a3a44" : "#2a2a30";
    explainTabBtn.style.background = which === "explain" ? "#3a3a44" : "#2a2a30";
    surfacesTabBtn.style.background = which === "surfaces" ? "#3a3a44" : "#2a2a30";
    mountTabBtn.style.background = which === "mount" ? "#3a3a44" : "#2a2a30";
    stateTabBtn.style.background = which === "state" ? "#3a3a44" : "#2a2a30";
    movementTabBtn.style.background = which === "movement" ? "#3a3a44" : "#2a2a30";
    structureTabBtn.style.background = which === "structure" ? "#3a3a44" : "#2a2a30";
    lightsTabBtn.style.background = which === "lights" ? "#3a3a44" : "#2a2a30";
    spritesTabBtn.style.background = which === "sprites" ? "#3a3a44" : "#2a2a30";
    S.clayRoomMovementPickMode = which === "movement";
    if(which === "surfaces") clayRenderSurfacesTab();
    if(which === "mount") clayMountRender();
    if(which === "state") clayDoorStateRender();
    if(which === "movement") clayMovementRender();
    else clayRoomDisposeMovementOverlay();
    if(which === "structure") clayStructureRender();
    if(which === "lights") clayLightsRender();
    if(which === "sprites") claySpritesRender();
    if(CLAY_ROOM_PANEL_POSITION){
      const panelRect = panel.getBoundingClientRect();
      clayPanelPlace(panelRect.left, panelRect.top, true);
    } else {
      clayPanelDockRight();
    }
  }
  S.clayRoomShowTab = clayShowTab;
  function claySelectionInfo(id){
    if(id === record.portal.id) return { name: "Door", type: "INTERACTABLE", ref: id, tab: "state", socket: true, sprite: false };
    if(id === record.object.id) return { name: "Crate · 3 ft", type: "PROP · FACED_BOX", ref: id, tab: "surfaces", socket: false, sprite: false };
    if(id === record.citizen.id || id === record.citizen.bestiaryId) return {
      name: "Goblin", type: "APPROVED CHARACTER SPRITE", ref: record.citizen.bestiaryId, tab: "facts", socket: false, sprite: true
    };
    const structureSpec = id === "compiled-shell"
      ? { id: "compiled-shell", label: "Compiled shell" }
      : clayRoomStructureBenchFixtureFrom(record).pieces.find(function(row){ return row.id === id; });
    if(structureSpec) return {
      name: structureSpec.label,
      type: id === "compiled-shell" ? "PRODUCTION COMPILED STRUCTURE" : "STRUCTURE KIT SPECIMEN",
      ref: structureSpec.id,
      tab: "structure",
      socket: id !== "compiled-shell",
      sprite: false
    };
    if(id === clayRoomStructureBenchFixtureFrom(record).cutawayWitness.id) return {
      name: "Human cutaway witness",
      type: "PRODUCTION STANDEE · DYNAMIC OCCLUSION TARGET",
      ref: clayRoomStructureBenchFixtureFrom(record).cutawayWitness.pieceSlug,
      tab: "structure",
      socket: false,
      sprite: true
    };
    const spriteSpec = clayRoomSpriteCitizenshipFixtureFrom(record).cast.find(function(row){ return row.slug === id; });
    if(spriteSpec) return {
      name: spriteSpec.label,
      type: "SPRITE CITIZEN · " + spriteSpec.stress,
      ref: spriteSpec.slug,
      tab: "sprites",
      socket: false,
      sprite: true
    };
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const activeLight = (activeRecipe.lights || []).find(function(light){ return light.id === id; });
    if(activeLight) return {
      name: activeLight.label,
      type: activeRecipe.mode.indexOf("diagnostic-") === 0 ? "DIAGNOSTIC LIGHT" : "LORE-NATIVE LIGHT",
      ref: id,
      tab: "lights",
      socket: false,
      sprite: false
    };
    return { name: "Room shell · 10 ft", type: "STRUCTURE", ref: "clay-c1a", tab: "surfaces", socket: false, sprite: false };
  }
  S.clayRoomRefreshLightCatalog = function(){
    const activeRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
      || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
    const lights = (activeRecipe.lights || []).filter(function(light){ return light.enabled !== false; });
    const diagnostic = activeRecipe.mode.indexOf("diagnostic-") === 0;
    document.querySelectorAll("[data-clay-light-catalog-slot]").forEach(function(button){
      const light = lights[Number(button.dataset.clayLightCatalogSlot)];
      button.style.display = light ? "" : "none";
      if(!light) return;
      button.dataset.claySelect = light.id;
      const kind = button.querySelector("[data-clay-light-kind]");
      const label = button.querySelector("[data-clay-light-label]");
      const status = button.querySelector("[data-clay-light-status]");
      if(kind) kind.textContent = diagnostic ? "DIAGNOSTIC LIGHT" : "LORE-NATIVE LIGHT";
      if(label) label.textContent = light.label;
      if(status) status.textContent = diagnostic ? "TEST ONLY" : "MOUNTED";
    });
    document.querySelectorAll("[data-clay-light-scene-slot]").forEach(function(button){
      const light = lights[Number(button.dataset.clayLightSceneSlot)];
      button.style.display = light ? "" : "none";
      if(!light) return;
      button.dataset.claySceneId = light.id;
      button.textContent = "◇  " + light.label;
    });
  };
  S.clayRoomWorkbenchSelect = function(id, source){
    S.clayRoomSelectedId = id;
    const info = claySelectionInfo(id);
    selectionName.textContent = info.name;
    selectionMeta.textContent = info.type + " · " + info.ref + " · selected from " + (source || "workbench");
    spriteEditorBtn.disabled = !info.sprite;
    spriteEditorBtn.style.opacity = info.sprite ? "1" : "0.5";
    socketScopeBtn.style.opacity = info.socket ? "1" : "0.55";
    socketScopeBtn.textContent = info.socket ? "🔒 SOCKET" : "SOCKET — N/A";
    stateScopeBtn.style.opacity = info.tab === "state" || info.tab === "structure"
      || info.tab === "lights" || info.tab === "sprites" ? "1" : "0.7";
    document.querySelectorAll("[data-clay-scene-id]").forEach(function(b){
      const active = b.dataset.claySceneId === id
        || (id === record.citizen.bestiaryId && b.dataset.claySceneId === record.citizen.id);
      b.style.borderLeftColor = active ? "#6fcfff" : "transparent";
      b.style.background = active ? "#202b35" : "transparent";
      b.style.color = active ? "#f0f8ff" : "#cbd3dc";
    });
    clayRoomHighlightSelection(id);
  };
  instanceScopeBtn.addEventListener("click", function(){
    sessionLaw.textContent = "INSTANCE · SESSION ONLY · transforms here never rewrite the production socket.";
  });
  stateScopeBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    clayShowTab(info.tab);
  });
  socketScopeBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    if(info.socket){
      if(info.tab === "structure"){
        sessionLaw.textContent = "SOCKET PROTECTED · showing authored axis/type; incompatible axes reject without relocation.";
        clayRoomSetStructureView("sockets");
        clayShowTab("structure");
      } else {
        sessionLaw.textContent = "SOCKET PROTECTED · Mount tab edits a session tune and exports an object-mount lock.";
        clayShowTab("mount");
      }
    } else {
      sessionLaw.textContent = "No socket on this selection. Clayroom movement stays instance-local.";
    }
  });
  defaultScopeBtn.addEventListener("click", function(){
    sessionLaw.textContent = "DEFAULT PROTECTED · an explicit promoted overwrite would affect FUTURE ROLLS.";
  });
  spriteEditorBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    if(!info.sprite) return;
    window.open(
      "http://127.0.0.1:5179/?sprite=" + encodeURIComponent(info.ref),
      "genesis-sprite-editor"
    );
  });
  saveVariantBtn.addEventListener("click", function(){
    const info = claySelectionInfo(S.clayRoomSelectedId);
    sessionLaw.textContent = "SESSION STATE CAPTURED · " + info.name + " · persistence awaits versioned recipe save.";
  });
  factsTabBtn.addEventListener("click", function(){ clayShowTab("facts"); });
  explainTabBtn.addEventListener("click", function(){ clayShowTab("explain"); });
  surfacesTabBtn.addEventListener("click", function(){ clayShowTab("surfaces"); });
  mountTabBtn.addEventListener("click", function(){ clayShowTab("mount"); });
  stateTabBtn.addEventListener("click", function(){ clayShowTab("state"); });
  movementTabBtn.addEventListener("click", function(){ clayShowTab("movement"); });
  structureTabBtn.addEventListener("click", function(){ clayShowTab("structure"); });
  lightsTabBtn.addEventListener("click", function(){ clayShowTab("lights"); });
  spritesTabBtn.addEventListener("click", function(){ clayShowTab("sprites"); });
  clayShowTab(S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
    ? "structure" : (S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID
      ? "lights" : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID ? "sprites" : "movement")));

  document.body.appendChild(panel);
  if(CLAY_ROOM_PANEL_POSITION){
    clayPanelPlace(CLAY_ROOM_PANEL_POSITION.left, CLAY_ROOM_PANEL_POSITION.top, true);
  } else {
    clayPanelDockRight();
  }
  const activeInitialRecipe = LIGHT_TUNABLES.profiles[S.clayRoomLightRecipeId]
    || LIGHT_TUNABLES.profiles["clay-opposing-pair"];
  const activeInitialLight = (activeInitialRecipe.lights || []).find(function(light){ return light.enabled !== false; });
  const initialSelection = S.clayRoomFixtureId === CLAY_ROOM_LIGHTING_BENCH_ID && activeInitialLight
    ? activeInitialLight.id
    : (S.clayRoomFixtureId === CLAY_ROOM_STRUCTURE_BENCH_ID
      ? "compiled-shell"
      : (S.clayRoomFixtureId === CLAY_ROOM_SPRITE_BENCH_ID
      ? (S.clayRoomSelectedSpriteSlug || spriteFixture.selectedSlug)
      : (S.clayRoomSelectedId || record.portal.id)));
  S.clayRoomWorkbenchSelect(initialSelection, "initial");
  S.clayRoomRefreshLightCatalog();
  clayRefreshFixtureControls();
  S.clayRoomLightReadoutTimer = setInterval(function(){
    if(S.clayRoomMounted && lightsBody.style.display !== "none") clayLightsRender();
  }, 120);
  S.clayRoomOverlayEl = panel;
}

// Dev-only teardown (the panel's own close button) — disposes the dedicated GL instance mountClayRoom
// created (retire(), the SAME teardown mount() itself calls on every re-mount) and removes both DOM
// hosts, then clears the mounted flag so a later flag re-flip (?clayroom=1 revisited, or
// GS.clayRoomEnabled toggled again) can mount fresh. Never touches anything the normal game flow
// owns — this dev surface only ever tears down what it itself built. retire() itself replaces `S`
// with a fresh createTheaterState() (mirroring mount()'s own idempotent-re-mount teardown), so the
// two DOM handles are captured BEFORE calling it, not read off S afterward.
function clayRoomUnmount(){
  if(!S.clayRoomMounted) return;
  const overlayEl = S.clayRoomOverlayEl, hostEl = S.clayRoomHost;
  const workbenchChrome = (S.clayRoomWorkbenchChrome || []).slice();
  const panelResizeHandler = S.clayRoomPanelResizeHandler;
  const panelDragCleanup = S.clayRoomPanelDragCleanup;
  const lightReadoutTimer = S.clayRoomLightReadoutTimer;
  const lightingMatrixOverlay = S.clayRoomLightingMatrixOverlay;
  // CL-R0: stand the lifecycle hook down BEFORE retire(). retire() swaps in a fresh
  // createTheaterState() (so the flag would clear anyway), but any setInteriorBoard that fires
  // during teardown must not try to re-route a tree that is being disposed.
  S.clayRoomDiagnosticActive = false;
  clayRoomDisposeLightOverlays();
  if(panelDragCleanup) panelDragCleanup();
  if(panelResizeHandler) window.removeEventListener("resize", panelResizeHandler);
  if(lightReadoutTimer != null) clearInterval(lightReadoutTimer);
  retire();
  clayCtxSetRoomShell(CLAY_ROOM_PRIOR_ROOM_SHELL); // restore mountClayRoom's own ITR_ROOM_SHELL override — see that function's header note (split B1: accessor)
  if(overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
  if(hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  if(lightingMatrixOverlay && lightingMatrixOverlay.parentNode){
    lightingMatrixOverlay.parentNode.removeChild(lightingMatrixOverlay);
  }
  workbenchChrome.forEach(function(el){ if(el && el.parentNode) el.parentNode.removeChild(el); });
}

// Spec addendum D1a (docs/C1A-CLAY-ROOM.md, orchestrator re-gate finding): clayRoomMaybeAutoMount's
// own per-frame poll (hooked into renderTheaterFrame, this file's top) only ever RUNS once some
// theater is already mounted and drawing frames — either the game's own board/interior mount kicks
// off scheduleRender's rAF loop, or a harness calls measureRenderFps/measureComposerFps directly.
// A COLD BOOT (title screen, no game session yet) never mounts anything and so never calls
// renderTheaterFrame at all — verified live by the orchestrator loading genesis.html?clayroom=1 from
// a blank tab: {theaterMounted:false, clayHost:false, canvases:0}. Light Lab's dormant-poll pattern
// (D1's own precedent) is fine living entirely inside that poll because Light Lab is a LIVE-theater
// accessory (it only ever makes sense once a board is already up); the clay room is a STANDALONE dev
// surface (docs/C1A-CLAY-ROOM.md's own framing — "the game boots identically with the flag off") and
// must self-mount at boot rather than wait on a frame that, on a cold title screen, may never come.
//
// Direct call, no setTimeout/microtask defer: this file's own <script type="module"> tag
// (genesis.html:1541) makes theater-boot.js an implicitly-deferred module script. Per the HTML
// spec, deferred/module scripts execute only once the document has finished parsing (document.body
// and every element already exist), AFTER every classic synchronous <script> in the document —
// including data/sprite-registry.js and the engine/clay-room.js tag (both load earlier, per D2's own
// manifest note) and the page's own end-of-body classic boot script that sets up window.GS — even
// though that classic script's <script> tag sits textually AFTER this module's tag in genesis.html
// (classic scripts run synchronously as the parser reaches them; deferred/module scripts always run
// after ALL of those, never before). This line also sits at the literal end of the file, after every
// function this region defines and after `let S = createTheaterState();` (this file's line ~5011),
// so there is no hoisting/ordering hazard to defer past. Net: a direct top-level call is exactly as
// "ready" as it will ever be — a setTimeout(0) here would only add a frame of avoidable latency for a
// dev-only cold-boot surface.
//
// Cost with the flag OFF (the byte-for-byte-identical-boot requirement): ONE clayRoomShouldEnable()
// call — a location.search read, memoized — and nothing else. Same one-boolean-read-when-off law D1
// already pays for the per-frame poll; this just pays it once, at boot, instead of (also) waiting for
// a frame that a cold title screen never produces.
function clayRoomBootSelfMount(){
  if(S.clayRoomMounted) return;
  if(!clayRoomShouldEnable()) return;
  mountClayRoom();
}
// split B1: the boot-time self-mount CALL lives in the root's own tail (theater-boot.js) —
// module evaluation runs before the root body wires ctx/S, so a top-level call here would
// null-deref; the root's end-of-body call preserves the original end-of-file timing exactly.
/* CLAY-ROOM ADDITIONS END */
// ---- the root imports exactly these (the region's pre-split externally-referenced surface) ----
export {
  mountClayRoom,
  clayRoomBootSelfMount,
  clayRoomMaybeAutoMount,
  clayRoomAfterInteriorBoardRebuild,
  clayRoomCaptureLightingMatrix,
  clayRoomDoorProofState,
  clayRoomLightingPixelMetrics,
  clayRoomLightingSnapshot,
  clayRoomMovementSession,
  clayRoomProvenanceAudit,
  clayRoomRecordLightingProbe,
  clayRoomSetFixture,
  clayRoomSetLightingRecipe,
  clayRoomSetSpriteScaleMode,
  clayRoomSetStructureDoorState,
  clayRoomSetStructureStaged,
  clayRoomSetStructureView,
  clayRoomSurfaceCensus,
  clayWallOmissionOn,
  CLAY_CAM_ZOOM_MIN,
  CLAY_ROOM_LIGHTING_BENCH_ID,
  CLAY_ROOM_LIGHTING_MATRIX_RECIPES,
  CLAY_ROOM_LIGHT_PREVIEW_SEEDS,
  CLAY_ROOM_LORE_LIGHT_PREVIEWS
};
