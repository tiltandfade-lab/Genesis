/* THEATER LIGHTING — the BOARD LIGHTING family (docs/BATTLE-THEATER.md §2), the ENV-EXTERIOR-WAVE
   passes (ENV-1 tabletop exterior look · ENV-1B tabletop shadow casters · ENV-1c the celestial arc),
   the two interior camera-side lights (BW2-4b's camera-key shadow, CL-R2's sprite camera fill), and
   the PRACTICAL FLICKER SCHEDULER — extracted VERBATIM from src/ui/theater-boot.js in split step B5
   (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: everything that decides HOW A BOARD IS LIT, from the authored profile table down to the
   per-frame flame nudge. LIGHT_PROFILES (the compiled-lock projection) + LIGHT_DEFAULT_PROFILE +
   lightProfileFor + applyLightProfile (the one shared ambient/point rebuild both channels funnel
   through); the tabletop-only post-passes that refine what applyLightProfile just built
   (TABLETOP_EXTERIOR_LOOK / voidTintForTabletop / applyTabletopExteriorLook, CELESTIAL_ARC and the
   whole celestial* family, applyTabletopShadowCasters); the env void tint (ENV_VOID_TINT/voidTintFor);
   the interior camera-key (mountInteriorCameraKey) and sprite camera fill (mountSpriteCameraFill /
   updateSpriteCameraFill); and the FLICKER SCHEDULER — lightFlicker* pure math plus startLightFlicker's
   own requestAnimationFrame loop and stopLightFlicker's cancel.

   SCHEDULER LAW (the brief's §Protected contracts, verbatim: "the intentional separation between the
   dirty-frame scheduler, verb tween scheduler, practical flicker scheduler, mote scheduler, and dev
   readout timers"): the flicker rAF loop moved here WHOLE and ALONE. It is still its own loop, still
   owns S.flickerRaf / S.flickerTick / S.interiorFlickerTargets, still self-stops on !S.mounted, and
   still has nothing to do with the MOTE scheduler (src/ui/theater-motes.js's own S.moteRaf loop) or the
   dirty-frame/tween loops in the root. Nothing was unified. Nothing was re-cadenced.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as theater-clay-room.js / theater-light-lab.js /
   theater-skins.js / theater-post.js): this module NEVER imports theater-boot.js. Capabilities arrive
   ONCE via lightingInit(ctx) into the module-local mirrors below, so every moved body keeps its bare
   identifiers. It DOES read and write the live theater state record (S.ambientLight / S.pointLights /
   S.scene / S.camera / S.realmProfile / S.lightProfileKey / S.lightPropAnchor / S.boardHalf* /
   S.celestialVoidTint / S.interiorCameraKey / S.spriteCameraFill* / S.cameraLookTarget /
   S.flickerRaf / S.flickerTick / S.interiorFlickerTargets / S.mounted / S.clayRoomRefreshLights), so
   the root also calls lightingSyncState(S) at BOTH `S = createTheaterState()` reassignment sites,
   beside the existing clayRoomSyncState / lightLabSyncState / postSyncState calls.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT: src/ui/theater-practicals.js imports FOUR symbols from
   this file directly (celestialArcFor, CELESTIAL_PROFILE_SET, CELESTIAL_MIN_KEY_HEIGHT,
   INTERIOR_LIGHT_FLICKER_AMPLITUDE) rather than taking them through its own ctx — a one-way leaf->leaf
   edge, censused acyclic (this file reads NOTHING from theater-practicals.js; the only mentions of
   interiorBuildLights / INTERIOR_SHADOW_* left in these bodies are prose in comments).

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     ITR_CAMERA_KEY_CASTS_SHADOW — a mutable root `let` that window.Theater.setCameraKeyCastsShadow
       reassigns at runtime (the L-2 diegetic-shadow toggle). An import binding is read-only and a
       copied mirror would go stale the moment the seam flips it, so it is read LIVE through
       lightingCtxCameraKeyCastsShadow() — B2/B3/B4's flag law. This is the ONLY non-verbatim
       production line in this file (marked with an inline `split B5` note at the exact line).
     LIGHT_TUNABLES + its whole SEED SET (STAGE_AMBIENT_FLOOR, GRADE_EXPOSURE_FLOOR, BLOOM_THRESHOLD,
       BLOOM_STRENGTH, GRADE_TINT_SCALE/MAX, ITR_SPRITE_EMISSIVE_FLOOR, ITR_SCENE_AMBIENT,
       ITR_LIGHT_RENDER_GAIN) + LIGHT_LAB_AUTHORED_BASELINE — B2's own law ("the lab is the UI over
       LIGHT_TUNABLES, not the owner of render-path values") and dev/verify-light-lab.mjs's scrape set,
       which reads those consts out of theater-boot.js's own TEXT. applyLightProfile and the celestial
       functions read the live LIGHT_TUNABLES object through ctx exactly as before.
     gradeColorLocal — the REALM-RENDER-STYLE §3 grade seam, shared with tile/figure/void colour code
       all over the root. ITR_CAMERA_KEY_INTENSITY / SPRITE_CAMERA_FILL_LAYER / _AT_TARGET / _COLOR /
       VOID_BG — authored consts that sit in the root's one ITR_* stage-const block. markDirty — the
       root's dirty-frame scheduler entry point. mountLightProp — reads the whole-object registry
       (resolveWholeObject / wholeObjectGeometryFor / wholeObjectMaterialsFor / WHOLE_OBJECT_SCALE /
       the mutable WHOLE_OBJECT_ENABLED gate) and addGroundingBlob, i.e. heavy non-lighting root
       readers, so it stayed put and calls lightProfileFor through the import block.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the five
   `split B5` chunk-boundary notes marking where a root-owned declaration was left behind, the single
   accessor line named above, and the trailing `export {...}` block. Not one other byte inside a moved
   declaration changed. */
import * as THREE from "three";

// ---- root-capability mirrors (wired once by lightingInit; S re-synced by lightingSyncState) ----
let S;
let lightingCtxCameraKeyCastsShadow;
let gradeColorLocal, markDirty, ITR_CAMERA_KEY_INTENSITY, LIGHT_TUNABLES,
    SPRITE_CAMERA_FILL_AT_TARGET, SPRITE_CAMERA_FILL_COLOR, SPRITE_CAMERA_FILL_LAYER, VOID_BG;

export function lightingInit(ctx){
  ({ gradeColorLocal,
    markDirty,
    ITR_CAMERA_KEY_INTENSITY,
    LIGHT_TUNABLES,
    SPRITE_CAMERA_FILL_AT_TARGET,
    SPRITE_CAMERA_FILL_COLOR,
    SPRITE_CAMERA_FILL_LAYER,
    VOID_BG } = ctx);
  S = ctx.S;
  lightingCtxCameraKeyCastsShadow = ctx.lightingCtxCameraKeyCastsShadow;
}
export function lightingSyncState(nextS){ S = nextS; }

/* T1.5 §2: per-env deep void background, keyed by the same env strings theater-data.js's
   THEATER_ENV_PALETTE uses (a small duplicated table — this module is a sealed ES-module scope that
   can't read that classic-script const, §2's "module scope stays sealed" boundary; kept in sync with
   theater-data.js's voidTint values by convention/comment, not import). Falls back to the module's
   own VOID_BG default for any env this table doesn't recognize. */
const ENV_VOID_TINT = {
  dungeon: 0x0a0807, urban: 0x09090a, wilderness: 0x07090a, breach: 0x0a0610
};
function voidTintFor(env){
  return (env && ENV_VOID_TINT[env] !== undefined) ? ENV_VOID_TINT[env] : VOID_BG;
}

// split B5: ENV_SCORCH_TINT / scorchTintFor (the obliteration-marker tint — a DEAD-STATE marker, not a
// light) and the REALM-RENDER-STYLE §3/§4 grade seam (gradeColorLocal, read by tile/figure/void colour
// code all over the root) stayed in theater-boot.js. gradeColorLocal arrives through ctx above.

/* ============================================================================
   BOARD LIGHTING (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03) — §2: "light profiles in the
   theater." Each profile is {ambient:{color,intensity}, points:[{color,intensity,pos}]}, applied on
   setBoard from `data.light.profile` (the string key theaterBoardFrom/theater-data.js stamps — see
   that file's THEATER_LIGHT_TABLE, kept in sync with these keys by convention/comment, same one-way
   classic/ES-module boundary discipline as ENV_VOID_TINT above). PSX-clean per the spec: 1-2 point
   lights max, no shadow-mapping (renderer.shadowMap stays disabled — grounding is the blob-quad work
   below, never a real shadow map), Lambert-friendly (MeshLambertMaterial already reacts correctly to
   THREE.PointLight/AmbientLight with zero material changes needed).
   `points[].pos` is a FRACTION of the board's own half-extents (not a fixed world position) — applied
   in applyLightProfile below by multiplying against S.boardHalfX/boardHalfZ, so a point sits at a
   sane spot (center-ish, or biased toward an edge) regardless of the current board's actual size.
   `flicker` (optional): a per-profile amplitude (0 = none) for the slow subtle intensity tween — see
   tickLightFlicker below for the "only when a flicker profile is live" cadence discipline.

   POINT-LIGHT INTENSITY SCALE (found live in the browser-check pass, worth flagging): three.js r166
   uses PHYSICALLY CORRECT photometric units for THREE.PointLight/THREE.SpotLight — intensity is
   candela (lm/sr), which falls off with the inverse square of distance, so a value calibrated for the
   OLD pre-r155 "watts-ish" scale (0.4-1.5, what a first pass here used) reads as functionally zero at
   even a few world units away — every profile's point light was invisible, all nine profiles looked
   identical to `dark`. THREE.AmbientLight is UNAFFECTED (it isn't distance-attenuated, so its intensity
   scale didn't change across that three.js version bump) — only the point-light intensities below are
   the "large" numbers; ambient stays in the original small 0.3-0.85 range. Point lights use decay:0
   (applyLightProfile) — a flat, non-attenuating light rather than physically-correct falloff, since
   the board is small/fixed-size and a decaying point light would need per-profile distance tuning to
   read consistently; decay:0 makes the intensity number alone predictable board-to-board. */
// docs/DIEGETIC-LIGHT.md L-3 / FORK F2 (Adam's ruling 2026-07-11): every profile's authored ambient
// dropped ~35% (the F2 band's midpoint) — "ambient is only enough to make out figures; beyond a
// source's reach it's dark, and darkness is a gameplay element." The diegetic point(s) below are now
// the read, not the ambient wash. Values are reversible for the re-shoot: each intensity is commented
// with its pre-DIEGETIC-LIGHT number so Adam can dial any one back individually.
// CL-R1: LIGHT_PROFILES is now a compatibility projection of the persistent, validated lock
// registry. The ten rolled profiles retain their exact authored numbers; the two unrolled Clayroom
// recipes add clearly-labelled neutral and warm/cool diagnostic modes without entering gameplay
// rolls. The registry is shared with src/engine/clay-room.js, so the workbench no longer owns a
// private copy of its opposing pair.
const LIGHT_PROFILES = Object.freeze((() => {
  const out = {};
  Object.keys(LIGHT_RECIPE_REGISTRY).forEach((key) => {
    out[key] = lightRecipeLegacyProfile(LIGHT_RECIPE_REGISTRY[key]);
  });
  return out;
})());
const LIGHT_DEFAULT_PROFILE = "dark";

// split B5: STAGE_AMBIENT_FLOOR (the readability floor) stayed in theater-boot.js with the rest of the
// LIGHT_TUNABLES seed set — applyLightProfile below reads it as LIGHT_TUNABLES.stageAmbientFloor
// exactly as before, and dev/verify-light-lab.mjs scrapes that seed set out of the root's own text.

function lightProfileFor(key){
  return LIGHT_PROFILES[key] || LIGHT_PROFILES[LIGHT_DEFAULT_PROFILE];
}

/* rebuild S.ambientLight/S.pointLights from a profile key. Idempotent + safe pre-mount (no-op if
   S.scene is absent). Tears down the PRIOR lights first (THREE.Light isn't pooled by clearGroup — it
   has no geometry/material to dispose, just remove-from-scene) so repeated setBoard calls on the SAME
   profile don't accumulate duplicate lights; `points` positions are board-relative FRACTIONS
   (LIGHT_PROFILES' own header comment) resolved against S.boardHalfX/boardHalfZ so a point sits at a
   sane spot regardless of the current board's size — falls back to a flat 4-unit default pre-setBoard
   (mount-time call, no board fitted yet). */
function applyLightProfile(key){
  if(!S.scene) return;
  if(S.ambientLight){ S.scene.remove(S.ambientLight); S.ambientLight = null; }
  (S.pointLights || []).forEach(l => S.scene.remove(l));
  S.pointLights = [];
  stopLightFlicker();

  const profile = lightProfileFor(key);
  S.lightProfileKey = key;
  // LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — the light-lab's own per-profile override, defaulting
  // to THIS profile's own authored ambient/key numbers (LIGHT_TUNABLES.profiles is seeded straight off
  // LIGHT_PROFILES at declaration — see LIGHT_TUNABLES' own header). An untouched lab means `tune.*`
  // below reads byte-identical to `profile.ambient.*`/`profile.points[0].*`, so this indirection is a
  // pure no-op in production.
  const tune = LIGHT_TUNABLES.profiles[key] || LIGHT_TUNABLES.profiles[LIGHT_DEFAULT_PROFILE];

  // readability floor (LIGHT_TUNABLES.stageAmbientFloor, seeded from STAGE_AMBIENT_FLOOR above) —
  // clamp UP only, never down: a profile authored brighter than the floor (at 0.65 that's daylit 0.85
  // alone) keeps its own value untouched; every sub-floor profile (dark 0.38 the worst case; overcast/
  // moonlit sit just under) gets lifted. Color is read straight off the tunable either way — the floor
  // governs intensity alone, so the profile still owns the mood/hue, and points still carry each
  // profile's relative brightness identity.
  const ambientIntensity = tune.mode && tune.mode.indexOf("diagnostic-") === 0
    ? tune.ambient.intensity
    : Math.max(tune.ambient.intensity, LIGHT_TUNABLES.stageAmbientFloor);
  // REALM-RENDER-STYLE.md §3: grade the profile's authored color through the current board's render
  // profile (S.realmProfile, set by setBoard just before this call — see that function's own comment;
  // null pre-mount/pre-setBoard, which gradeColorLocal treats as a no-op) — same "colors are already
  // resolved" seam the tile tints and figure materials share. Intensity is untouched (the readability
  // floor's own "color stays authored, only intensity is floored" discipline extends here).
  const ambientColor = gradeColorLocal(tune.ambient.color, S.realmProfile);
  const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
  S.scene.add(ambient);
  S.ambientLight = ambient;

  const hx = S.boardHalfX || 4, hz = S.boardHalfZ || 4;
  // P1' WHOLE-OBJECT WIRING Unit B (docs/P1-WIRING.md §4 Unit B step 2): a light-prop anchor computed
  // by setBoard's own mountLightProp call (below, AFTER this function returns — S.lightPropAnchor is
  // set by setBoard on every call, cleared to null when this profile has no registry mapping) sources
  // the FIRST point light's position at the prop's own flame/glow head instead of the profile's plain
  // fractional pos. Guarded per-point (index 0 only — LIGHT_PROFILES entries with a real prop mapping
  // author exactly one point, per prop-light.js's ENGINE NOTE reserving ONE light per prop), and only
  // when an anchor actually resolved this call (S.lightPropAnchor null -> byte-identical position math
  // to before this unit, the guard's own "light behavior byte-identical" contract, §4 step 3).
  const enabledLights = (tune.lights || []).filter((p) => p.enabled !== false);
  enabledLights.forEach((p, i) => {
    // decay:0, distance:0 — a flat non-attenuating point light (see LIGHT_PROFILES' own header on why:
    // predictable per-profile intensity numbers regardless of board size, no physically-correct falloff
    // tuning needed per profile). LL-1: index 0 (every LIGHT_PROFILES entry authors at most one point)
    // reads the lab's own tunable color/intensity; any further point (none exist today) keeps its
    // authored value untouched — tune only ever overrides the ONE point this profile vocabulary has.
    const pColor = p.color;
    const pIntensity = p.intensity;
    const light = new THREE.PointLight(gradeColorLocal(pColor, S.realmProfile), pIntensity, 0, 0);
    if(i === 0 && S.lightPropAnchor){
      light.position.set(S.lightPropAnchor.x, S.lightPropAnchor.y, S.lightPropAnchor.z);
    } else {
      light.position.set(
        (p.pos.x || 0) * hx,
        p.heightM != null ? p.heightM / 1.524 : (p.pos.y != null ? p.pos.y : 1.5),
        (p.pos.z || 0) * hz
      );
    }
    S.scene.add(light);
    S.pointLights.push(light);
  });

  const flickerAmplitude = enabledLights.reduce((max, p) => {
    return Math.max(max, p.flicker ? p.flicker.amplitude || 0 : 0);
  }, 0);
  if(flickerAmplitude > 0) startLightFlicker(flickerAmplitude);
}

/* ============================================================================================
   ENV-1 (docs/ENV-EXTERIOR-WAVE.md) — "light profiles differentiate everywhere". ROOT CAUSE
   (measured live against pl-004..009, dev/play-lens/ledger.md #8): applyLightProfile ALREADY runs
   on the flat tabletop channel — setBoard called it before this unit too, so every node/travel/
   settlement/combat/idle tray was already "consuming the active profile" in that narrow sense. Two
   things nonetheless made daylit/overcast/moonlit render pixel-identical to each other (and to a
   plain dark room) on that channel:
     1. the void/background tint (ENV_VOID_TINT/voidTintFor, above) is keyed ONLY by `env`
        (dungeon/urban/wilderness/breach) — the SAME wilderness travel leg shows the identical
        near-black void whether the walk rolled daylit, moonlit, or overcast. This is the single
        biggest visible defect (the void dominates a large fraction of every travel/node frame —
        see pl-004..009): "the black void reads as night ONLY when it should," per this unit's spec.
     2. STAGE_AMBIENT_FLOOR (0.42, above) clamps UP any profile authored below it — overcast (0.39)
        and moonlit (0.36) both clamp to the IDENTICAL 0.42 ambient on this channel, erasing the
        mood table's own (already-small, 0.03) intended gap between them, since nothing downstream
        of applyLightProfile touches S.ambientLight again on the tabletop path (unlike the interior
        channel below).
   FIX SCOPE — tabletop channel ONLY (setBoard calls the two helpers below; setInteriorBoard never
   does). LIGHT_PROFILES/applyLightProfile/STAGE_AMBIENT_FLOOR themselves stay byte-UNTOUCHED: they
   are shared with the interior channel, which OVERWRITES ambient/hemi/key/fill from its OWN
   ITR_BRIGHT_REALM_FILL/ITR_SCENE_* tables the instant setInteriorBoard's rigOn block runs, and
   separately multiplies every S.pointLights[].intensity by its own fillScale — so editing
   LIGHT_PROFILES' authored point numbers here would ride straight through to interior renders and
   break the "interiors byte-stable" requirement. Everything below is NEW code, called only from
   setBoard, mutating the LIVE THREE objects applyLightProfile just built for THIS render — never
   the shared authored table.
   dark/torchlit/lavalit/fungal-glow/magic-glow/lamplit/voidlit are the PROTECTION SET: absent from
   both tables below, so a tabletop tray rolling any of those profiles is BYTE-IDENTICAL to before
   this unit (no lookup hit -> both helpers fall through to the pre-existing voidTintFor(env)/plain-
   applyLightProfile behavior — the WORKING interior/dungeon-tabletop look, unchanged). Only the 3
   exterior moods get a differentiated look — the same "which profiles are the sun/moon/sky's own
   diegetic reach" set the interior channel already classifies as ITR_BRIGHT_PROFILES, reused here
   for the identical classification on this channel.
   Grouped per profile — one re-tune surface, DRAFT VALUES, Adam re-tunes here:
     daylit   — bright warm key + sky-blue ambient wash, ambient boosted well above the floor, a
                light sky-tone background (never a black void in daylight).
     overcast — flat grey-cool diffuse, muted background, ambient between daylit and moonlit.
     moonlit  — dim cool blue, near-dark background — the darkest of the 3 exterior looks, but
                ALWAYS >= dark's own floored ambient/void (an unlit room must never read brighter
                than moonlight).
   pointScale tunes each profile's existing LIGHT_PROFILES point-light contribution for THIS channel
   only — moonlit's authored point (intensity 8, decay:0 = non-attenuating, so it reaches the whole
   board at full strength regardless of distance) would otherwise out-shine overcast's flat ambient-
   only wash on the tile surface itself (a candela-scale point intensity and a 0-1 ambient multiplier
   are not directly comparable units), inverting the required daylit > overcast > moonlit luma
   ordering. Scaling it down here (mutating the live light instance, never LIGHT_PROFILES) keeps that
   ordering honest without touching the shared profile table the interior channel also reads.
   ============================================================================================ */
// ambientColor: a tabletop-only ambient HUE override (the spec's "sky-blue ambient" for daylit —
// LIGHT_PROFILES' authored daylit ambient color is a neutral 0xd8dce0, shared with the interior
// channel, so the sky-blue read lands here instead). The warm KEY stays the profile's own authored
// point color (daylit 0xfff2d8 — already warm), scaled by pointScale. overcast/moonlit keep their
// authored ambient hues (already grey-cool/cool-blue) — listed explicitly anyway so the whole look
// is re-tunable from this one table.
const TABLETOP_EXTERIOR_LOOK = {
  daylit:   { ambient: 0.80, ambientColor: 0xbdd7f0, pointScale: 1.2,  void: 0xaed4f2 }, // sky-blue ambient + warm key + bright sky wash
  "golden-site-daylit": { ambient: 0.84, ambientColor: 0xc8dce8, pointScale: 1.2, void: 0xb8d4e4 },
  overcast: { ambient: 0.55, ambientColor: 0xa8adb5, pointScale: 1.0,  void: 0x8c94a0 }, // flat muted grey-cool (authored hue kept)
  moonlit:  { ambient: 0.44, ambientColor: 0x8fa0c8, pointScale: 0.35, void: 0x141c30 }  // dim cool blue, near-dark (authored hue kept)
};
// void/background tint for the TABLETOP channel only — profile wins for the 3 exterior moods (the
// protection set has no entry here, so it falls through to the pre-existing env-keyed voidTintFor,
// byte-identical to before this unit).
// ENV-1c (docs/ENV-EXTERIOR-WAVE.md): `clockMin` is an ADDITIVE 3rd param — omitted (or S.celestialVoidTint
// unset, applyCelestialArc's own no-op guard below) falls straight through to ENV-1's static per-profile
// void, byte-identical to pre-ENV-1c. When a clock IS threaded and the profile is one of the 3 exterior
// moods, S.celestialVoidTint (stamped by applyCelestialArc, called earlier in setBoard — see that
// function's own header) wins: the sky/void reads the SAME dawn/noon/dusk/moonlit keyframe the key
// light's color just used, not a flat per-profile constant.
function voidTintForTabletop(env, profileKey, clockMin){
  if(clockMin != null && CELESTIAL_PROFILE_SET[profileKey] && S.celestialVoidTint != null){
    return S.celestialVoidTint;
  }
  const look = profileKey && TABLETOP_EXTERIOR_LOOK[profileKey];
  return look ? look.void : voidTintFor(env);
}
// mutates the LIVE S.ambientLight/S.pointLights objects applyLightProfile just (re)built for THIS
// render — never LIGHT_PROFILES itself. No-op (byte-identical to pre-unit setBoard) for any profile
// not in TABLETOP_EXTERIOR_LOOK (the protection set).
function applyTabletopExteriorLook(profileKey){
  const look = profileKey && TABLETOP_EXTERIOR_LOOK[profileKey];
  if(!look) return;
  if(S.ambientLight){
    S.ambientLight.intensity = look.ambient;
    // graded through the SAME realm profile applyLightProfile just used for the authored ambient
    // color — the tabletop hue override obeys the identical realm-grade seam, never bypasses it.
    if(look.ambientColor != null) S.ambientLight.color.setHex(gradeColorLocal(look.ambientColor, S.realmProfile));
  }
  (S.pointLights || []).forEach(l => { l.intensity *= look.pointScale; });
}

/* ============================================================================================
   ENV-1c (docs/ENV-EXTERIOR-WAVE.md) — "the sun and moon are diegetic sources and their position in
   the time of day should affect overall lighting when outdoors" (Adam's verbatim ruling, 2026-07-14).
   Outdoor light is not a static per-profile mood (ENV-1's own TABLETOP_EXTERIOR_LOOK, just above) —
   it is WHERE THE SUN/MOON IS. This is a SECOND tabletop-only post-pass, same discipline as
   applyTabletopExteriorLook/applyTabletopShadowCasters above: mutates the LIVE S.ambientLight/
   S.pointLights instances those two already (re)built for THIS render, never LIGHT_PROFILES itself.
   Called ONLY from setBoard (never setInteriorBoard — "dark and ALL interior profiles untouched,
   the arc is outdoors-only" per Adam's own scope note), AFTER applyTabletopExteriorLook (so it
   further refines the SAME already-profile-scaled light) and BEFORE applyTabletopShadowCasters (so
   the shadow-caster pass configures shadow camera/bias against the key's FINAL, arc-repositioned
   transform, not its pre-arc fractional position).

   THE ARC — a low-parameter continuous function of minute-of-day, NOT an astronomy library
   (explicitly out of scope, per the spec's own closing note): SUNRISE_MIN/SUNSET_MIN bound the sun's
   daytime pass; elevation follows a single sine hump (0 at sunrise/sunset, 1 at solar noon) so
   dawn/dusk naturally read low + raking and noon naturally reads high + tight — ENV-1B's shadow-caster
   pass gets that "for free" purely from the light's REPOSITIONED transform, no shadow-specific code
   needed here. Azimuth sweeps east->west (sunrise -90 degrees -> sunset +90 degrees) linearly with the
   same t, so the key's horizontal (x/z) position — and therefore any cast shadow's direction — flips
   sign between morning and evening. The moon gets its OWN slower arc across the night span (sunset ->
   next sunrise, wrapped), one shared shape function (celestialMoonDirFor mirrors celestialSunDirFor
   exactly) — "night = the moon takes the key" per the ruling.

   PROFILE COMPOSITION (the ruling's own "modulates the arc, never replaces it"): daylit renders the
   clear-sky sun arc as-authored; moonlit renders the moon arc as-authored; overcast renders the SAME
   sun arc (sun position retained) but desaturated toward grey (OVERCAST_DESAT) with its key
   intensity contribution further damped (OVERCAST_SHADOW_DAMP) — overcast today authors ZERO points
   in LIGHT_PROFILES (see that table's own "overcast: points: []" entry), so this function's point-
   light branch is already a no-op there by construction: overcast casts no shadow at all, which IS
   "shadow contrast drops" taken to its floor, consistent with pre-ENV-1c behavior. The void/color
   desaturation still applies (a subtle grey-flattened sky drift across the day), matching the
   ruling's "void/sky tint follows the same keyframes" for every exterior profile, not just daylit.

   ONE RE-TUNE SURFACE: CELESTIAL_ARC — every color/intensity/timing number Adam red-pens lives here,
   nothing below it does per-profile branching beyond the OVERCAST_* modulation the ruling itself
   calls out by name. */
const CELESTIAL_ARC = {
  SUNRISE_MIN: 360,   // 06:00 — sun elevation crosses 0 going up (a fantasy day, not real-world solar timing)
  SUNSET_MIN: 1200,   // 20:00 — sun elevation crosses 0 going down
  MIN_ELEV_ANGLE: 0.2094, // ~12 degrees — a floor so the key never grazes dead-flat at literal sunrise/sunset (keeps the raking shadow readable instead of a degenerate zero-length ray)
  sun: {
    dawnColor:   0xffc2a8, // low warm-pink (dawn side of the arc, t < 0.5)
    duskColor:   0xff7a42, // low orange-red (dusk side of the arc, t >= 0.5) — deliberately a DIFFERENT hue than dawn
    zenithColor: 0xfff6e4, // high near-white (solar noon, either side)
    dawnVoid:    0xf3c7b0,
    duskVoid:    0xe89a68,
    zenithVoid:  0xaed4f2, // matches TABLETOP_EXTERIOR_LOOK.daylit.void at full elevation — noon converges on ENV-1's own authored sky
    intensityHorizon: 0.35, // fraction of ENV-1's already-profile-scaled key intensity, at elevation 0 (sunrise/sunset)
    intensityZenith:  1.0   // 1.0 = ENV-1's own authored intensity, unmodified, at solar noon
  },
  moon: {
    color: 0xaebfe8, // cool blue-silver — moonlit's own authored point hue (LIGHT_PROFILES.moonlit), kept identical
    void:  0x141c30, // matches TABLETOP_EXTERIOR_LOOK.moonlit.void at full elevation
    intensityHorizon: 0.4,
    intensityZenith:  1.0
  },
  OVERCAST_DESAT: 0.4,        // 0 = no change, 1 = full grey — overcast's own "colors flatten" law
  OVERCAST_SHADOW_DAMP: 0.55  // overcast's key contribution shrinks further (on TOP of ENV-1's own pointScale) -> softer lit/shadow luma delta than daylit at the same minute
};
const CELESTIAL_KEY_REACH_FACTOR = 2.2; // key distance = max(boardHalfX,boardHalfZ) * this — stays inside applyTabletopShadowCasters' own far-plane budget (2.5x half-extent, that function's own const)
const CELESTIAL_MIN_KEY_HEIGHT = 1.5;   // never lets the key's Y drop to/through the tile plane even at the MIN_ELEV_ANGLE floor
const CELESTIAL_AMBIENT_FLOOR_SCALE = 0.6; // ambient intensity never drops below 60% of ENV-1's own authored value — the readability floor's own "never unreadably dark" law, extended to the arc
// the exact 3-profile exterior set TABLETOP_EXTERIOR_LOOK already carves out — reused here so the
// celestial layer's own protection-set discipline never drifts from ENV-1's.
const CELESTIAL_PROFILE_SET = {
  daylit: true, "golden-site-daylit": true, overcast: true, moonlit: true
};

// split B5: the LIGHT_TUNABLES declaration itself (plus LIGHT_LAB_AUTHORED_BASELINE, the frozen
// authored clone the lab resets to) sat here in the monolith; both stayed in theater-boot.js per B2's
// law, and the LIVE object arrives through ctx above — so every LIGHT_TUNABLES.* read below is the
// same property on the same object the light lab writes through.

// min-of-day -> {x,y,z (unit direction), elevation (0..1), t (0..1, sunrise->sunset)}. Pure, total:
// clamps `min` into [SUNRISE_MIN,SUNSET_MIN] first, so a daylit/overcast profile rolled outside that
// window (a keyword override, an edge-case snapshot) still returns a sane (if degenerate) direction
// rather than NaN/negative-elevation garbage.
function celestialSunDirFor(min){
  const rise = LIGHT_TUNABLES.celestialArc.SUNRISE_MIN, set = LIGHT_TUNABLES.celestialArc.SUNSET_MIN;
  const clamped = Math.min(Math.max(min, rise), set);
  const t = (set > rise) ? (clamped - rise) / (set - rise) : 0.5;
  const elevation = Math.sin(t * Math.PI); // 0 at rise/set, 1 at solar noon
  const elevAngle = LIGHT_TUNABLES.celestialArc.MIN_ELEV_ANGLE + elevation * (Math.PI / 2 - LIGHT_TUNABLES.celestialArc.MIN_ELEV_ANGLE);
  const azimuth = -Math.PI / 2 + t * Math.PI; // east (-90deg) at sunrise -> west (+90deg) at sunset
  return {
    x: Math.cos(elevAngle) * Math.cos(azimuth),
    y: Math.sin(elevAngle),
    z: Math.cos(elevAngle) * Math.sin(azimuth),
    elevation: elevation, t: t
  };
}
// mirrors celestialSunDirFor exactly, over the NIGHT span instead (sunset -> next sunrise, wrapped
// across midnight) — "its own slower arc" per the ruling: a longer or shorter span than the sun's own
// (whatever SUNRISE_MIN/SUNSET_MIN currently bound) naturally paces differently, with zero extra code.
function celestialMoonDirFor(min){
  const rise = LIGHT_TUNABLES.celestialArc.SUNRISE_MIN, set = LIGHT_TUNABLES.celestialArc.SUNSET_MIN;
  const nightLen = (1440 - set) + rise;
  let elapsed = min - set;
  if(elapsed < 0) elapsed += 1440;
  const t = (nightLen > 0) ? Math.min(Math.max(elapsed / nightLen, 0), 1) : 0.5;
  const elevation = Math.sin(t * Math.PI);
  const elevAngle = LIGHT_TUNABLES.celestialArc.MIN_ELEV_ANGLE + elevation * (Math.PI / 2 - LIGHT_TUNABLES.celestialArc.MIN_ELEV_ANGLE);
  const azimuth = -Math.PI / 2 + t * Math.PI;
  return {
    x: Math.cos(elevAngle) * Math.cos(azimuth),
    y: Math.sin(elevAngle),
    z: Math.cos(elevAngle) * Math.sin(azimuth),
    elevation: elevation, t: t
  };
}
// two 0xrrggbb ints -> a linearly-interpolated 0xrrggbb int at fraction f (clamped 0..1).
function celestialLerpColor(a, b, f){
  f = Math.max(0, Math.min(1, f));
  const ar=(a>>16)&255, ag=(a>>8)&255, ab=a&255, br=(b>>16)&255, bg=(b>>8)&255, bb=b&255;
  const r = Math.round(ar + (br-ar)*f), g = Math.round(ag + (bg-ag)*f), bl = Math.round(ab + (bb-ab)*f);
  return (r<<16)|(g<<8)|bl;
}
// a 0xrrggbb int, pulled toward its own luma-grey by fraction amt (0..1) — overcast's "colors flatten
// grey" law, reused for both the key color and the void tint.
function celestialDesaturate(hex, amt){
  const r=(hex>>16)&255, g=(hex>>8)&255, b=hex&255;
  const grey = Math.round(r*0.299 + g*0.587 + b*0.114);
  const nr = Math.round(r + (grey-r)*amt), ng = Math.round(g + (grey-g)*amt), nb = Math.round(b + (grey-b)*amt);
  return (nr<<16)|(ng<<8)|nb;
}
// the public per-profile arc read: (profileKey in CELESTIAL_PROFILE_SET, clockMin) -> {dir, elevation,
// color, voidTint, intensityScale}. Pure, total — no RNG, no S/GS/w touch — so the SAME (profileKey,
// clockMin) always yields a byte-identical rig (the determinism requirement this unit's own
// verification names explicitly).
function celestialArcFor(profileKey, clockMin){
  const isMoon = profileKey === "moonlit";
  const dirInfo = isMoon ? celestialMoonDirFor(clockMin) : celestialSunDirFor(clockMin);
  const body = isMoon ? CELESTIAL_ARC.moon : CELESTIAL_ARC.sun;
  const e = dirInfo.elevation;
  let color, voidTint;
  if(isMoon){
    color = body.color; voidTint = body.void; // one hue family, no dawn/dusk side split for the moon
  } else {
    const horizonColor = dirInfo.t < 0.5 ? body.dawnColor : body.duskColor;
    const horizonVoid  = dirInfo.t < 0.5 ? body.dawnVoid  : body.duskVoid;
    color = celestialLerpColor(horizonColor, body.zenithColor, e);
    voidTint = celestialLerpColor(horizonVoid, body.zenithVoid, e);
  }
  let intensityScale = body.intensityHorizon + (body.intensityZenith - body.intensityHorizon) * e;
  if(profileKey === "overcast"){
    color = celestialDesaturate(color, LIGHT_TUNABLES.celestialArc.OVERCAST_DESAT);
    voidTint = celestialDesaturate(voidTint, LIGHT_TUNABLES.celestialArc.OVERCAST_DESAT);
    intensityScale *= LIGHT_TUNABLES.celestialArc.OVERCAST_SHADOW_DAMP;
  }
  return { dir: { x: dirInfo.x, y: dirInfo.y, z: dirInfo.z }, elevation: e, color: color, voidTint: voidTint, intensityScale: intensityScale, isMoon: isMoon };
}
// the mutator: repositions/re-colors/re-scales the profile's own key point (S.pointLights[0] — every
// LIGHT_PROFILES entry authors at most one, applyTabletopShadowCasters' own header note) and damps
// ambient intensity by the same curve (floored at CELESTIAL_AMBIENT_FLOOR_SCALE — never below ENV-1's
// own readability floor). ALWAYS resets S.celestialVoidTint first (even on every early-return path) —
// S persists across renders, so a stale value from a PRIOR daylit/moonlit board must never leak into
// THIS render's void tint (voidTintForTabletop, above, reads it after this function returns).
// No-op (byte-identical to pre-ENV-1c setBoard) whenever clockMin is null (no clock threaded — a
// combat-less/walk-less snapshot, a narrow harness) or profileKey isn't one of the 3 exterior moods —
// the SAME protection-set discipline ENV-1/ENV-1B already established for this rig region.
function applyCelestialArc(profileKey, clockMin){
  S.celestialVoidTint = null;
  if(clockMin == null || !CELESTIAL_PROFILE_SET[profileKey]) return;
  const arc = celestialArcFor(profileKey, clockMin);
  S.celestialVoidTint = arc.voidTint;
  if(S.pointLights && S.pointLights.length){
    const hx = S.boardHalfX || 4, hz = S.boardHalfZ || 4;
    const reach = Math.max(hx, hz) * CELESTIAL_KEY_REACH_FACTOR;
    const key = S.pointLights[0];
    key.position.set(arc.dir.x * reach, Math.max(CELESTIAL_MIN_KEY_HEIGHT, arc.dir.y * reach), arc.dir.z * reach);
    key.color.setHex(gradeColorLocal(arc.color, S.realmProfile));
    key.intensity *= arc.intensityScale;
  }
  if(S.ambientLight){
    S.ambientLight.intensity *= Math.max(CELESTIAL_AMBIENT_FLOOR_SCALE, arc.intensityScale);
  }
}

// ENV-1B (docs/GRAPHICS-CONVERGENCE-CHARTER.md §3.3; Adam's DESIGN.md 2026-07-10 ruling — "soft real
// lighting + cast shadows", AO off BECAUSE "real shadows carry contact darkness") — THE TABLETOP
// SHADOW-CASTER PASS. Same discipline as applyTabletopExteriorLook just above: mutates the LIVE
// S.pointLights instances applyLightProfile just (re)built for THIS render, never LIGHT_PROFILES or
// applyLightProfile itself (which is SHARED with setInteriorBoard — see that function's own header —
// so giving castShadow to a light INSIDE applyLightProfile would silently turn the interior channel's
// own profile-mood point into a second shadow source alongside its diegetic torch practicals,
// breaking interior byte-stability for no reason). Called ONLY from setBoard, mirroring
// applyTabletopExteriorLook's own "new code, tabletop-only" scope note.
//   daylit's own point is the profile table's "warm key" (applyTabletopExteriorLook's own header
//   names it that — the profile's authored point color, boosted by TABLETOP_EXTERIOR_LOOK's
//   pointScale) — it stands in for the sun on this channel, so it casts. Every OTHER profile's single
//   authored point (torchlit/lamplit/lavalit/fungal-glow/magic-glow/voidlit/dark/moonlit) casts too,
//   the SAME "torch/practical points cast" convention interiorBuildLights already applies to its own
//   diegetic PointLight practicals (pl.castShadow=true there, this file's own established pattern).
//   No per-profile branching needed: every LIGHT_PROFILES entry authors at most ONE point (overcast
//   authors zero — a flat ambient-only wash with nothing to mark), so there is no interior-style
//   INTERIOR_SHADOW_CASTER_CAP to reproduce here.
const TABLETOP_SHADOW_MAP_SIZE = 512; // ENV-1B: starts at INTERIOR_SHADOW_MAP_SIZE's own value (line ~7015) — same small per-light budget, a SEPARATE named const so the two channels can be retuned independently.
const TABLETOP_SHADOW_BIAS = -0.002;  // mirrors interiorBuildLights' own PointLight practical bias (line ~7488)
function applyTabletopShadowCasters(){
  if(!S.pointLights || !S.pointLights.length) return;
  // far plane keyed off THIS board's own half-extent (set earlier in setBoard, before applyLightProfile
  // runs) rather than interior's fixed room-scale fallback — a tabletop board can span far more world
  // units than an interior room, and a too-small far plane would clip the shadow before it reaches the
  // floor at the board's edge. Falls back to interior's own 4-unit pre-fit default pre-mount/pre-board
  // (mountInteriorCameraKey's own "S.boardHalfExtent || 4" convention, reused here).
  const far = Math.max(10, (S.boardHalfExtent || 4) * 2.5);
  S.pointLights.forEach(light => {
    light.castShadow = true;
    light.shadow.mapSize.set(TABLETOP_SHADOW_MAP_SIZE, TABLETOP_SHADOW_MAP_SIZE);
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = far;
    light.shadow.bias = TABLETOP_SHADOW_BIAS;
  });
}

// BW2-4b item 2 — THE CAMERA-KEY SHADOW. One soft shadow-casting DirectionalLight aimed at the interior
// board center from the CAMERA's general direction (up + toward the camera), created lazily and reused
// across setInteriorBoard calls (positions/target refreshed each mount, disabled by setBoard on the flat
// tabletop path). Directional (parallel rays) is the ONLY light geometry that casts a readable billboard
// shadow — the interior torch PointLights throw an edge-on sliver off a flat cutout (the value-plunge
// diagnosis). Intensity a whisper (ITR_CAMERA_KEY_INTENSITY) so it never re-flattens the plunge or
// doubles scene brightness. The billboard's own alpha-tested customDepthMaterial makes the cast shadow
// take the sprite's real silhouette; the floor/base receiveShadow already. Shadow ortho bounds track the
// board's fitted half-extent so the map covers the whole framed room at a small fixed cost.
function mountInteriorCameraKey(cx, cz){
  if(!S.scene) return;
  if(!S.interiorCameraKey){
    const dl = new THREE.DirectionalLight(0xffffff, ITR_CAMERA_KEY_INTENSITY);
    dl.userData.interiorCameraKey = true;
    S.scene.add(dl);
    S.scene.add(dl.target);
    S.interiorCameraKey = dl;
  }
  const dl = S.interiorCameraKey;
  dl.intensity = ITR_CAMERA_KEY_INTENSITY;
  // the board geometry is origin-shifted by (cx,cz) at mount, so the framed room center sits at world
  // ~(0,0,0); aim the target there. Source the light from the camera's own horizontal bearing (so the
  // cast shadow falls AWAY from the camera, readable behind each standee) lifted high overhead.
  const camPos = S.camera ? S.camera.position : { x: 6, y: 9, z: 6 };
  const bearing = Math.hypot(camPos.x, camPos.z) || 1;
  const ux = camPos.x / bearing, uz = camPos.z / bearing;
  const reach = Math.max(6, (S.boardHalfExtent || 4) * 2.2);
  dl.position.set(ux * reach * 0.55, reach, uz * reach * 0.55);
  dl.target.position.set(0, 0, 0);
  dl.target.updateMatrixWorld();
  // L-2 (DIEGETIC-LIGHT.md): the camera-key no longer contributes a shadow by default — the room's own
  // diegetic point light(s) are the shadow source (interiorBuildLights' castShadow assignment, below).
  // See ITR_CAMERA_KEY_CASTS_SHADOW's own header comment for the reversible toggle.
  dl.castShadow = lightingCtxCameraKeyCastsShadow(); // split B5: mutable root `let` (window.Theater.setCameraKeyCastsShadow flips it live) — read through the ctx accessor, never a stale mirror
  const half = Math.max(2, (S.boardHalfExtent || 4) + 1.5);
  const cam = dl.shadow.camera;
  cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half;
  cam.near = 0.5; cam.far = reach * 2.2;
  cam.updateProjectionMatrix();
  dl.shadow.mapSize.set(1024, 1024);
  dl.shadow.bias = -0.0016;
}

// CL-R2 follow-up — CAMERA-SIDE SPRITE FILL. A real spotlight follows the current camera pose and
// targets the governed look point. Its layer mask reaches only billboard faces that explicitly join
// SPRITE_CAMERA_FILL_LAYER; architecture, props, bases, and floor never see it. Intensity is derived
// from the live camera distance so the target receives the same gentle fill after a board refit, while
// decay=1 still produces a visible near-to-far falloff across a deep room. It never casts shadows.
function mountSpriteCameraFill(){
  if(!S.scene) return;
  if(!S.spriteCameraFill){
    const fill = new THREE.SpotLight(
      SPRITE_CAMERA_FILL_COLOR,
      1,
      0,
      THREE.MathUtils.degToRad(24),
      0.82,
      1
    );
    fill.castShadow = false;
    fill.userData.spriteCameraFill = true;
    if(fill.layers) fill.layers.set(SPRITE_CAMERA_FILL_LAYER);
    S.scene.add(fill);
    S.scene.add(fill.target);
    S.spriteCameraFill = fill;
    S.spriteCameraFillTarget = fill.target;
  }
  updateSpriteCameraFill();
}
function updateSpriteCameraFill(){
  const fill = S.spriteCameraFill;
  if(!fill || !S.camera) return;
  const target = S.cameraLookTarget || new THREE.Vector3(0, 0, 0);
  const distance = Math.max(1, S.camera.position.distanceTo(target));
  fill.position.copy(S.camera.position);
  fill.target.position.copy(target);
  fill.target.updateMatrixWorld();
  fill.distance = distance * 1.35;
  fill.intensity = distance * SPRITE_CAMERA_FILL_AT_TARGET;
  fill.angle = THREE.MathUtils.degToRad(Math.max(24, (S.camera.fov || 20) * 0.75));
}

// split B5: mountLightProp (the P1' Unit B lighting-prop anchor) sat here in the monolith and stayed in
// theater-boot.js — it reads the whole-object registry, the mutable WHOLE_OBJECT_ENABLED gate and
// addGroundingBlob, none of which are lighting. It calls lightProfileFor through the root's import block.

/* FLICKER (§2's own "optional flicker for torch/lava"). Each source chooses seeded, irregular
   intensity and direction targets at its authored cadence, then glides between those targets on the
   display's requestAnimationFrame clock. The randomness therefore remains low-frequency and legible,
   while the visible flame, emitted light, highlights, and shadows move continuously instead of
   stepping every few hundred milliseconds. This is its own ambient animation loop rather than the
   verb tween chain. CL-R1 keeps samples seeded and local: only targets whose own state is
   `flickering` update; steady targets are never written. Self-stopping: stopLightFlicker (called at
   profile ownership changes and from retire()) cancels the frame, so a flame never survives past its
   owner or past retire(). */
// BEAUTY-WAVE.md VP6 item 2 (THE LIFE PASS — torch flicker): opted-in interior sources share this
// loop rather than growing one animation chain per fixture. Each target owns {state,seed,amplitude,
// pl,marker,bases}; the same normalized seeded sample scales the actual PointLight and its visible
// emitter material. The default amplitude remains below the tabletop torchlit profile's 0.14.
const INTERIOR_LIGHT_FLICKER_AMPLITUDE = 0.06;
// BW3-4 addendum: the per-tick nudge math pulled out to a PURE function (explicit args, no S/closure
// reads) — same "pure step, thin scheduler wraps it" split VP6's own mote drift already keeps
// (startMoteDrift's rAF loop vs the per-mote math it runs). Lets a deterministic fake-clock harness
// drive one tick directly (dev/verify-bw3-4-light-shafts.mjs) without needing S.mounted/a live
// scheduler, and lets the light-CONE card (this unit) ride the identical delta the marker already
// does — never a second independently-randomized swing (that would desync the shaft from its own
// marker/light, the exact "flicker sync" this unit's spec calls for).
function lightFlickerHash32(value){
  let h = 2166136261 >>> 0;
  const s = String(value || "");
  for(let i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
  return h >>> 0;
}
function lightFlickerNormalizedSample(seed, sampleIndex, amplitude){
  const h = lightFlickerHash32(String(seed || "light") + ":" + String(sampleIndex || 0));
  const unit = h / 4294967295;
  const a = Math.max(0, Math.min(0.45, Number(amplitude) || 0));
  return 1 + (unit * 2 - 1) * a;
}
function lightFlickerIntervalMs(seed, sampleIndex, cadenceMs, intervalJitter){
  const base = Math.max(120, Math.min(5000, Number(cadenceMs) || 480));
  const jitter = Math.max(0, Math.min(0.9, Number(intervalJitter) || 0));
  const h = lightFlickerHash32(String(seed || "light") + ":interval:" + String(sampleIndex || 0));
  const unit = h / 4294967295;
  return Math.max(120, Math.round(base * (1 - jitter + unit * jitter * 2)));
}
function lightFlickerDirectionSample(seed, sampleIndex, directionAmplitude){
  const amplitude = Math.max(0, Math.min(0.08, Number(directionAmplitude) || 0));
  if(!amplitude) return { x: 0, y: 0, z: 0 };
  const prefix = String(seed || "light") + ":direction:" + String(sampleIndex || 0);
  const angle = (lightFlickerHash32(prefix + ":angle") / 4294967295) * Math.PI * 2;
  const radiusUnit = lightFlickerHash32(prefix + ":radius") / 4294967295;
  const verticalUnit = lightFlickerHash32(prefix + ":vertical") / 4294967295;
  const radius = amplitude * (0.45 + radiusUnit * 0.55);
  return {
    x: Math.cos(angle) * radius,
    y: (verticalUnit * 2 - 1) * amplitude * 0.22,
    z: Math.sin(angle) * radius
  };
}
function lightFlickerSmoothProgress(progress){
  const t = Math.max(0, Math.min(1, Number(progress) || 0));
  return t * t * (3 - 2 * t);
}
function lightFlickerInterpolatedState(fromSample, toSample, fromDirection, toDirection, progress){
  const t = lightFlickerSmoothProgress(progress);
  const from = fromDirection || { x: 0, y: 0, z: 0 };
  const to = toDirection || { x: 0, y: 0, z: 0 };
  return {
    sample: fromSample + (toSample - fromSample) * t,
    direction: {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t
    }
  };
}
function lightFlickerApplySample(target, sample, direction){
  if(!target) return;
  const normalized = Number.isFinite(sample) ? sample : 1;
  const directional = direction && Number.isFinite(direction.x)
    ? direction : { x: 0, y: 0, z: 0 };
  if(target.pl){
    target.pl.intensity = Math.max(0, target.baseIntensity * normalized);
    if(target.basePointPosition && target.pl.position && typeof target.pl.position.set === "function"){
      target.pl.position.set(
        target.basePointPosition.x + directional.x,
        target.basePointPosition.y + directional.y,
        target.basePointPosition.z + directional.z
      );
    }
    target.pl.userData = target.pl.userData || {};
    target.pl.userData.flickerSample = normalized;
    target.pl.userData.directionSample = {
      x: directional.x, y: directional.y, z: directional.z
    };
    target.pl.userData.lightState = target.state;
  }
  if(target.marker && target.marker.material){
    if(target.emissiveFlicker){
      target.marker.material.emissiveIntensity = Math.max(0, target.baseEmissiveIntensity * normalized);
    } else {
      target.marker.material.opacity = Math.max(0, Math.min(1, target.baseOpacity * normalized));
    }
    if(target.baseMarkerPosition && target.marker.position && typeof target.marker.position.set === "function"){
      target.marker.position.set(
        target.baseMarkerPosition.x + directional.x,
        target.baseMarkerPosition.y + directional.y,
        target.baseMarkerPosition.z + directional.z
      );
    }
    if(target.marker.rotation && target.baseMarkerRotation){
      const amplitude = Math.max(0.000001, Number(target.directionAmplitude) || 0);
      target.marker.rotation.x = target.baseMarkerRotation.x + (directional.z / amplitude) * 0.12;
      target.marker.rotation.y = target.baseMarkerRotation.y;
      target.marker.rotation.z = target.baseMarkerRotation.z - (directional.x / amplitude) * 0.12;
    }
    target.marker.userData = target.marker.userData || {};
    target.marker.userData.flickerSample = normalized;
    target.marker.userData.directionSample = {
      x: directional.x, y: directional.y, z: directional.z
    };
    target.marker.userData.lightState = target.state;
  }
  if(target.cone && target.cone.material){
    target.cone.material.opacity = Math.max(0, Math.min(1, target.baseConeOpacity * normalized));
  }
  target.normalizedSample = normalized;
  target.directionSample = {
    x: directional.x, y: directional.y, z: directional.z
  };
}
function lightFlickerStep(pointLights, bases, interiorTargets, amplitude, tickIndex){
  (pointLights || []).forEach((l, i) => {
    const base = bases[i] != null ? bases[i] : l.intensity;
    const sample = lightFlickerNormalizedSample("profile:" + i, tickIndex || 0, amplitude);
    l.intensity = Math.max(0.05, base * sample);
  });
  (interiorTargets || []).forEach((t) => {
    if(t.state !== "flickering") return;
    const index = tickIndex != null ? tickIndex : ((t.sampleIndex || 0) + 1);
    t.sampleIndex = index;
    const sample = lightFlickerNormalizedSample(t.seed || t.id, index, t.amplitude);
    const direction = lightFlickerDirectionSample(
      t.seed || t.id,
      index,
      t.directionAmplitude
    );
    // CL-R1: one normalized deterministic sample drives the physical PointLight, the visible
    // emitter material, optional shaft, and co-located flame/light dance on this exact tick. A steady
    // sibling is never visited.
    lightFlickerApplySample(t, sample, direction);
  });
}
function startLightFlicker(amplitude, interiorTargets){
  stopLightFlicker();
  const bases = S.pointLights.map(l => l.intensity);
  S.interiorFlickerTargets = interiorTargets || [];
  S.flickerTick = 0;
  const hasProfileFlicker = amplitude > 0 && S.pointLights.length > 0;
  const hasLocalFlicker = S.interiorFlickerTargets.some(t => t && t.state === "flickering");
  if(!hasProfileFlicker && !hasLocalFlicker) return;
  const startTime = typeof performance !== "undefined" && performance.now
    ? performance.now() : Date.now();
  const profileTracks = bases.map((base, index) => ({
    base: base,
    index: 1,
    fromSample: 1,
    toSample: lightFlickerNormalizedSample("profile:" + index, 1, amplitude),
    startedAt: startTime,
    intervalMs: 480
  }));
  S.interiorFlickerTargets.forEach((target) => {
    if(!target || target.state !== "flickering") return;
    target.flickerEventIndex = 0;
    target.lastIntervalMs = null;
    target.nextIntervalMs = lightFlickerIntervalMs(
      target.seed,
      1,
      target.cadenceMs,
      target.intervalJitter
    );
    target.flickerFromSample = Number.isFinite(target.normalizedSample)
      ? target.normalizedSample : 1;
    target.flickerToSample = lightFlickerNormalizedSample(
      target.seed || target.id,
      1,
      target.amplitude
    );
    target.flickerFromDirection = Object.assign(
      { x: 0, y: 0, z: 0 },
      target.directionSample || {}
    );
    target.flickerToDirection = lightFlickerDirectionSample(
      target.seed || target.id,
      1,
      target.directionAmplitude
    );
    target.flickerStartedAt = startTime;
    target.sampleIndex = 1;
  });
  function frame(now){
    S.flickerRaf = null;
    if(!S.mounted){ stopLightFlicker(); return; }
    S.flickerTick++;
    if(hasProfileFlicker){
      profileTracks.forEach((track, index) => {
        let catchUpGuard = 0;
        while(now >= track.startedAt + track.intervalMs){
          track.startedAt += track.intervalMs;
          track.index++;
          track.fromSample = track.toSample;
          track.toSample = lightFlickerNormalizedSample(
            "profile:" + index,
            track.index,
            amplitude
          );
          // A backgrounded tab can resume after thousands of target intervals. Preserve continuity
          // for ordinary gaps without making the first visible frame pay an unbounded catch-up loop.
          if(++catchUpGuard >= 64){
            track.startedAt = now;
            break;
          }
        }
        const state = lightFlickerInterpolatedState(
          track.fromSample,
          track.toSample,
          null,
          null,
          (now - track.startedAt) / track.intervalMs
        );
        if(S.pointLights[index]){
          S.pointLights[index].intensity = Math.max(0.05, track.base * state.sample);
        }
      });
    }
    S.interiorFlickerTargets.forEach((target) => {
      if(!target || target.state !== "flickering") return;
      let catchUpGuard = 0;
      while(now >= target.flickerStartedAt + target.nextIntervalMs){
        target.flickerStartedAt += target.nextIntervalMs;
        target.lastIntervalMs = target.nextIntervalMs;
        target.flickerEventIndex = (target.flickerEventIndex || 0) + 1;
        target.flickerFromSample = target.flickerToSample;
        target.flickerFromDirection = target.flickerToDirection;
        target.sampleIndex = target.flickerEventIndex + 1;
        target.flickerToSample = lightFlickerNormalizedSample(
          target.seed || target.id,
          target.sampleIndex,
          target.amplitude
        );
        target.flickerToDirection = lightFlickerDirectionSample(
          target.seed || target.id,
          target.sampleIndex,
          target.directionAmplitude
        );
        target.nextIntervalMs = lightFlickerIntervalMs(
          target.seed,
          target.sampleIndex,
          target.cadenceMs,
          target.intervalJitter
        );
        if(++catchUpGuard >= 64){
          target.flickerStartedAt = now;
          break;
        }
      }
      const state = lightFlickerInterpolatedState(
        target.flickerFromSample,
        target.flickerToSample,
        target.flickerFromDirection,
        target.flickerToDirection,
        (now - target.flickerStartedAt) / target.nextIntervalMs
      );
      lightFlickerApplySample(target, state.sample, state.direction);
    });
    if(!hasProfileFlicker && !S.interiorFlickerTargets.some(t => t && t.state === "flickering")){
      stopLightFlicker();
      return;
    }
    // The scene stays display-rate smooth; the text telemetry is deliberately cheaper so rebuilding
    // its DOM cannot steal time from the flame/shadow animation the panel is describing.
    if(S.flickerTick % 6 === 0 && typeof S.clayRoomRefreshLights === "function"){
      S.clayRoomRefreshLights();
    }
    markDirty();
    S.flickerRaf = requestAnimationFrame(frame);
  }
  S.flickerRaf = requestAnimationFrame(frame);
}
function stopLightFlicker(){
  if(S.flickerRaf != null){ cancelAnimationFrame(S.flickerRaf); S.flickerRaf = null; }
  S.interiorFlickerTargets = [];
  S.flickerTick = 0;
}

export {
  voidTintFor, LIGHT_PROFILES, LIGHT_DEFAULT_PROFILE, lightProfileFor, applyLightProfile,
  TABLETOP_EXTERIOR_LOOK, voidTintForTabletop, applyTabletopExteriorLook,
  CELESTIAL_ARC, CELESTIAL_PROFILE_SET, CELESTIAL_MIN_KEY_HEIGHT, celestialArcFor, applyCelestialArc,
  applyTabletopShadowCasters, mountInteriorCameraKey, mountSpriteCameraFill, updateSpriteCameraFill,
  INTERIOR_LIGHT_FLICKER_AMPLITUDE, lightFlickerApplySample, lightFlickerStep,
  startLightFlicker, stopLightFlicker
};
