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
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
// BEAUTY-WAVE-3 BW3-3 (docs/BEAUTY-WAVE-3.md, SELECTIVE BLOOM): UnrealBloomPass, threshold-gated so
// only the brightest EMISSIVE pixels bloom (flame apexes, the BW3-4 fake-volumetric cone apex, chrome
// glow seams, spell FX) — a lit-but-albedo white sprite stays under threshold (the negative control).
// Vendored the SAME way as EffectComposer/RenderPass/ShaderPass above (pinned three@0.166.0, the
// `three/addons/` importmap); its own internal deps (Pass.js FullScreenQuad, CopyShader,
// LuminosityHighPassShader) are vendored alongside it under the same addons tree.
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
// BEAUTY-WAVE-3 THE POST SUITE — the composer's effect passes render into LINEAR intermediate targets
// (RenderPass writes un-encoded linear; only a direct-to-screen renderer.render applies the sRGB OETF).
// A custom ShaderPass drawn to screen does NOT re-encode, so without this the graded/blurred frame
// showed up crushed-dark (round-1/2 failure). OutputPass is three's canonical final pass: it applies
// the renderer's tone mapping (NoToneMapping here) + the sRGB transfer, so the chain ends correct and
// matches the direct-render baseline. ALWAYS the last pass in the interior chain.
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { playVerb, tickTweens, THEATER_VERBS, theaterFxFromLedger, standeeVerbForHurt, recoilDirFromPositions } from "./theater-verbs.js";
// GRAPHICS-ENGINE Part II §A: the sibling billboard-standee verb library — see that file's header for
// why it's a separate module from theater-verbs.js (rotation-ownership conflict with
// updateSpriteBillboardYaw, below) and for the ctx-binding contract bindStandeeCtx/playStandeeVerb use.
import { playStandeeVerb, bindStandeeCtx, STANDEE_VERBS, startIdleBreathe } from "./standee-verbs.js";
// BEAUTY-WAVE-4.md MF-2 (SPAWN/DESPAWN GRACE): the sibling zero-THREE-coupling tween-producer module —
// see that file's own header for why mount/despawn/cascade/room-transition tweens live there instead of
// as closures in this file (unit-testable via a real Node `import`, no jsdom/sandbox needed).
import {
  pushMountGrace, pushDespawnGrace, pushScreenFade, seededCascadeDelays,
  MOUNT_GRACE_DUR, DESPAWN_GRACE_DUR, DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS, ROOM_TRANSITION_DUR
} from "./spawn-grace.js";
import * as Parts from "./theater-parts.js";
import { resolveWholeObject, loadWholeObjectBuilders, WHOLE_OBJECT_REGISTRY, NEAREST_SUB } from "./theater-figures.js";
// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 3): a STATIC import of probe-lib.js itself —
// every dev/model-qa/creatures/*.js module ALSO imports probe-lib.js by the identical relative
// specifier (resolved from dev/model-qa/, '../probe-lib.js'), which both Node and browsers resolve
// to the exact same cached module instance keyed by resolved URL — so this file's own resetGeom()/
// getBuffers() calls (wholeObjectGeometryFor below) operate on the SAME module-scope POS/COL/CHAN
// buffers a just-invoked creature builder wrote into, exactly like ps1-sheet.html's own figureScene
// convention (resetGeom(); fn(); const {POS,COL,CHAN} = getBuffers();). A static (not dynamic) import
// keeps this synchronously available at module-evaluation time — no promise/timing seam to manage.
import { resetGeom as wholeObjectResetGeom, getBuffers as wholeObjectGetBuffers } from "../../dev/model-qa/probe-lib.js";

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
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
// G5 ROUND-1 (ruling 2): was the flat black blob-shadow's opacity; the base disc that REPLACES it
// (baseDiscMatFor, near unitTint below) reads at a higher, near-opaque value (0.85) — a miniatures
// base should read solid/present, not translucent like a soft-shadow blob — so this constant now
// documents that specific PSX-clean-disc opacity rather than the old shadow's dimmer 0.35.
const BASE_DISC_OPACITY = 0.85;
const FIGURE_SCALE = 1.5;      // §3 G9 tune: "figure scale ~1.5x current relative to tiles"

// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D1, R2): whole-object figures bake ABSOLUTE size in
// their own module geometry (the size law: Small ~0.95u, Medium ~1.45u, Large ~2.1u, Huge ~2.7u —
// dev/model-qa/sheets/INDEX.md) — applying the cuboid path's FIGURE_SCALE(1.5) x sizeScaleFor(size)
// on TOP of that would double-scale (D1's own failure mode), so the whole-object path scales by this
// ONE constant instead, and sizeScaleFor is NEVER applied on this path. CAPTURE-GATE FOLLOW-UP
// (2026-07-04, Adam at the capture gate: "make them 1.2 so they can be next to each other without
// touching") — R2's own 1.3-vs-1.5 comparison pair surfaced that even the smaller of the two crowded
// adjacent lanes; 1.2 is the director's own ruling, tuned by CAPTURE not box-math (§8 decision 5).
const WHOLE_OBJECT_SCALE = 1.2;

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

/* ============================================================================
   FIGURE-FIDELITY ROUND-2, UNIT 1 — THE PROCEDURAL PIXEL-SKIN SYSTEM (REFERENCE-DIRECTION.md
   laws L2/L7; docs/MODEL-GRAMMAR.md §5 channels). "Detail lives in the texture, not the mesh"
   (RE1/the goblin reference): geometry owns silhouette, a tiny hand-shaded-look canvas texture
   owns the surface. At material-creation time (figureMaterialFor, the single funnel every figure
   box's material now routes through — see addBox) this replaces the pre-Unit-1 flat per-box color
   with a small procedural CanvasTexture that bakes L2's whole recipe into ~48x48 texels:
     base color (the part's already-resolved §5 channel color) -> quantize into 2-3 value bands,
     TOP-LIT (upper region lighter) -> Bayer/ordered dither between adjacent bands (±~6% value) ->
     a 1px lighter top-EDGE highlight row + a 1px darker bottom-edge row (the goblin reference's
     worn-edge paint, zero geometry) -> sparse low-alpha speckle for texel dirt.
   The texture is tinted-white-friendly: the material's own `color` stays 0xffffff so the baked
   texel colors show through 1:1 (a Lambert map multiplies the vertex/material color by the texel,
   so a white material color passes the texture through unchanged while still lighting correctly).

   DETERMINISM (the hard requirement): every random value here is drawn from a seeded PRNG whose
   seed is hash(partName + ":" + channelColorHex + ":" + variantKey) — NO Math.random anywhere.
   Same figure => byte-identical texel buffer, forever. CACHE: textures are memoized by that exact
   same key string (PIXEL_SKIN_CACHE) so the 510-recipe corpus mints one canvas per distinct
   (part, color, variant) triple, never thousands (a goblin's olive-dun torso texture is shared by
   every goblin's torso, and reused across re-renders/re-mounts within a page).

   HARD DEGRADE: pixelSkinCapable() capability-checks canvas 2D (try getContext('2d')); when it's
   absent (jsdom/headless/no-DOM) figureMaterialFor falls back to the EXACT pre-Unit-1 flat-color
   material path (a plain MeshLambertMaterial({color})), so every existing harness renders/asserts
   byte-identically to before this unit. A dev toggle (window.Theater.pixelSkin = false, wired on
   the public surface at the bottom of this file) A/Bs the whole system off against flat color at
   runtime without a reload — same escape-hatch spirit as psxEnabled's clean/PSX toggle.
   ============================================================================ */
const PIXEL_SKIN_TEX_SIZE = 48;        // texels per axis (L2's "~32-64px painted-look textures")
let PIXEL_SKIN_ENABLED = true;         // the dev A/B toggle (window.Theater.pixelSkin mirrors this)

// capability probe, memoized (null = not yet checked). A headless/jsdom document either has no
// document.createElement at all, or a <canvas> whose getContext('2d') returns null (no 2D backend) —
// either way pixel-skin degrades to the flat-color path. Wrapped in try/catch so a throwing stub
// (some minimal DOM shims throw rather than return null) counts as "not capable," never propagates.
let PIXEL_SKIN_CAPABLE = null;
function pixelSkinCapable(){
  if(PIXEL_SKIN_CAPABLE !== null) return PIXEL_SKIN_CAPABLE;
  let ok = false;
  try {
    if(typeof document !== "undefined" && typeof document.createElement === "function"){
      const c = document.createElement("canvas");
      ok = !!(c && typeof c.getContext === "function" && c.getContext("2d"));
    }
  } catch(e){ ok = false; }
  PIXEL_SKIN_CAPABLE = ok;
  return ok;
}

// deterministic string hash (same ((h<<5)-h+ch)|0 algorithm as hashSeed/theaterLightSeedHash below,
// kept local so pixel-skin has no ordering dependency on where hashSeed is declared). Always returns
// a non-negative 32-bit int; a stable 0 for an empty/absent seed.
function pixelSkinHash(s){
  s = String(s || "");
  let h = 0;
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return h >>> 0; // unsigned so the PRNG seed is well-defined
}
// mulberry32 — a tiny, fast, well-distributed seeded PRNG. Pure function of its state; identical
// seed => identical stream, which is the whole determinism guarantee. Returns a closure yielding
// floats in [0,1). NOT a cryptographic RNG; just a stable per-texel jitter source (L2's dither/
// speckle need pseudo-randomness that reproduces byte-for-byte, which Math.random cannot give).
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

/* THE ALBEDO FLOOR (director intel: "add a resolved-albedo luminance floor... resolved base colors
   land roughly 0.25-0.65 luminance, desaturated but VISIBLE"). Applied to a figure's RESOLVED base
   color (numeric hex) right before it becomes a material/pixel-skin base — a defensive guarantee that
   NO figure's albedo drops so dark it reads as a black column (the §7b lineup's "bone Skeleton
   indistinguishable from charcoal Bandit" failure the intel flagged, whatever the exact upstream
   cause). Only LIFTS a color that's below the floor (a bright bone-white 0.81 is untouched); it lifts
   by uniformly scaling the RGB toward the floor luminance, which preserves hue+relative-channel ratios
   (a dark-red stays red, just a visible dark red — never desaturated to grey), and CAPS at the upper
   bound so an over-bright value is gently pulled down into the desaturated band too. Deterministic and
   pure (no state), so it doesn't perturb any determinism guarantee. */
const ALBEDO_FLOOR_LUM = 0.26;   // resolved base colors never render darker than this luminance
const ALBEDO_CEIL_LUM = 0.66;    // ...nor brighter (keeps the whole roster in the desaturated band)
function albedoFloor(hex){
  const c = hexToRGB(hex);
  const L = lumaOf(c);
  if(L >= ALBEDO_FLOOR_LUM && L <= ALBEDO_CEIL_LUM) return hex; // already in-band — untouched
  if(L <= 0.0001){
    // a pure/near-black channel color has no hue to preserve — lift to a neutral floor grey rather
    // than divide-by-~zero. (No real channel resolves this dark, but belt-and-suspenders.)
    const v = clamp255(ALBEDO_FLOOR_LUM * 255);
    return rgbToHex(v, v, v);
  }
  const target = L < ALBEDO_FLOOR_LUM ? ALBEDO_FLOOR_LUM : ALBEDO_CEIL_LUM;
  const f = target / L;                 // uniform scale preserves hue + channel ratios
  return rgbToHex(c.r * f, c.g * f, c.b * f);
}

/* the L2 texture recipe. Draws PIXEL_SKIN_TEX_SIZE^2 texels of a top-lit, band-quantized, ordered-
   dithered, worn-edge-highlighted paint skin off a single base color, seeded deterministically.
   Returns the <canvas> element (the caller wraps it in a CanvasTexture). Value banding: the base
   color is the MIDDLE band; a lighter band (top-lit upper region) and a darker band (lower region)
   bracket it, and the ordered-dither (a 4x4 Bayer matrix, screen-independent here since it's baked
   into texel space) nudges each texel between its band and the adjacent one by ±~6% value so the
   two-tone banding reads as hand-shading, not hard stripes. Row 0 (top edge) is a lighter highlight;
   the bottom row is darker (the reference's painted worn edges). Sparse speckle: a small fraction of
   texels get a low-alpha darker fleck for texel dirt (deterministic which ones, via the same PRNG). */
const PIXEL_SKIN_BAYER4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
];

/* ============================================================================
   SHAPE-WAVE UNIT 4 — MATERIAL PROGRAMS (L18) + EYES (L19). The pixel-skin generator grows PER-MATERIAL
   texel programs selected by (part kind + channel + a coarse color read), not one generic dither:
     bone    — pale base, darker JOINT CRACK lines (a skeleton must READ bone)
     plate   — horizontal BANDS + RIVET dots + a bright RIM highlight row (armored humanoids read metal)
     cloth   — soft vertical WEAVE banding (robes/cloth)
     scale   — offset ROW pattern (a reptile/dragon scale read)
     leather — mottle (worn hide)
     fur     — directional streak NOISE (beast pelts)
     generic — the pre-U4 top-lit band+dither+speckle (the universal fallback, unchanged look)
   Plus EYE DOTS on head-front parts (2-4 px, black default, RED for undead/fiends — the cheapest life a
   figure can get). Every program is deterministic (the same seeded PRNG; no Math.random) and headless-
   degrades exactly like before (the whole system is behind pixelSkinCapable()). ============================================================================ */
// derive a material program from the part name + channel + a coarse color luminance/hue read. Curated,
// keyword-driven (no NLP) off the part-name vocabulary — the same discipline the recipe rules use.
const PLATE_PARTS = { "chest-plate": 1, "pauldrons": 1, "helm-crest": 1, "shield-slab": 1 };
const BONE_PARTS = { "head-skull": 1, "bone-protrusions": 1 };
const FUR_BODY_PARTS = { "torso-quad": 1 };
// UNIT 6: head-eyeless is deliberately NOT here — an eyeless aberration gets NO eye dots (its blank
// smooth dome is the read). Every other head-front part gets eyes (L19).
const HEAD_FRONT_PARTS = { "head-round": 1, "head-snout": 1, "head-horned": 1, "head-skull": 1, "maw-open": 1, "helm-crest": 1 };
function materialProgramFor(partName, channel, colorHex){
  const c = hexToRGB(colorHex), L = lumaOf(c);
  const bluishPale = (c.b >= c.r) && L > 0.5;       // bone-white / grave-pallor read
  if(BONE_PARTS[partName]) return "bone";
  if(channel === "armor"){
    if(partName === "robe-skirt") return "cloth";
    if(PLATE_PARTS[partName]) return "plate";
    // an armor-channel torso band on a humanoid reads as worn plate/harness; a light metal color -> plate,
    // else leather.
    return L > 0.5 ? "plate" : "leather";
  }
  // a pale, bluish skin on a skull-adjacent part reads bone even without the skull part (a bleached body).
  if(channel === "skin" && bluishPale && (partName === "torso-biped" || partName === "arm-tapered" || partName === "leg-tapered")) return "bone";
  if(FUR_BODY_PARTS[partName]) return "fur";
  if(partName === "legTapered" || partName === "leg-tapered") return "skinSmooth";
  return "generic";
}
// eye rule: head-front parts get eyes; RED when the resolved color reads fiendish/dark-red (a hot,
// red-dominant, dark color) — otherwise black. Undead skulls (bone program) get dark hollow sockets
// (near-black), which read correctly as empty eye sockets.
function eyeSpecFor(partName, channel, colorHex){
  if(!HEAD_FRONT_PARTS[partName]) return null;
  const c = hexToRGB(colorHex);
  const redDominant = c.r > c.g + 20 && c.r > c.b + 20;   // a red-forward color -> fiend/undead-hot eyes
  return { color: redDominant ? 0xd83a2a : 0x000000 };
}

function buildPixelSkinCanvas(colorHex, seed, program, eyeSpec, texSize){
  const size = texSize || PIXEL_SKIN_TEX_SIZE;
  program = program || "generic";
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const base = hexToRGB(colorHex);
  const bands = [ scaleRGB(base, 0.80), base, scaleRGB(base, 1.18) ];
  const rand = mulberry32(seed);
  // one deterministic PRNG stream, consumed in a FIXED ORDER regardless of program, so a program swap
  // never desyncs the determinism guarantee: pull the speckle decisions first (every program shares
  // this budget), then each program pulls its own extra stream as needed.
  const speckle = new Uint8Array(size * size);
  for(let i = 0; i < size * size; i++){ speckle[i] = rand() < 0.07 ? 1 : 0; }
  const set = (x, y, r, g, b) => { const o = (y * size + x) * 4; data[o] = clamp255(r); data[o+1] = clamp255(g); data[o+2] = clamp255(b); data[o+3] = 255; };

  for(let y = 0; y < size; y++){
    const vt = y / (size - 1);            // 0 top .. 1 bottom
    for(let x = 0; x < size; x++){
      const ht = x / (size - 1);
      // --- the base top-lit band+dither (every program starts here, then layers its own marks) ---
      let bandIdx = vt < 0.34 ? 2 : (vt < 0.67 ? 1 : 0);
      const bayer = PIXEL_SKIN_BAYER4[(y % 4) * 4 + (x % 4)] / 16;
      const frac = (vt < 0.34 ? (vt / 0.34) : (vt < 0.67 ? ((vt - 0.34) / 0.33) : ((vt - 0.67) / 0.33)));
      if(frac < 0.5 && bandIdx > 0 && bayer > frac * 2) bandIdx -= 1;
      else if(frac > 0.5 && bandIdx < 2 && bayer > (1 - frac) * 2) bandIdx += 1;
      let col = bands[bandIdx];
      if(y === 0) col = scaleRGB(base, 1.32);
      else if(y === size - 1) col = scaleRGB(base, 0.66);
      let mul = 1;                          // per-texel value multiplier the program layers on
      // --- PER-MATERIAL PROGRAM (L18) ---
      if(program === "plate"){
        // horizontal plate BANDS (a lame/lamellar read): a repeating dark seam every ~1/4 height, with
        // a bright RIM row just below each seam (the worn metal highlight), + rivet dots on the seams.
        const bandN = 4, bp = vt * bandN, seam = bp - Math.floor(bp);
        if(seam < 0.08) mul *= 0.6;                       // the recessed seam between plates (dark)
        else if(seam < 0.16) mul *= 1.35;                 // the bright rim highlight just below the seam
        // rivets: dots along each seam line at regular x
        const rivetX = Math.abs((ht * 6) % 1 - 0.5) < 0.08;
        if(seam < 0.1 && rivetX) mul *= 1.5;              // a bright rivet head
      } else if(program === "bone"){
        // pale bone base + darker JOINT CRACK lines: a couple of thin dark diagonal/horizontal fissures
        // (the seams between bones) + a slightly desaturated, brighter overall value.
        mul *= 1.08;
        const crack1 = Math.abs(vt - 0.4) < 0.03, crack2 = Math.abs(vt - 0.72) < 0.025;
        const crackV = Math.abs(ht - 0.5) < 0.02;         // a vertical fissure down the center
        if(crack1 || crack2 || crackV) mul *= 0.5;        // the dark crack
      } else if(program === "scale"){
        // offset ROW pattern (reptile scales): a grid of half-offset cells, each with a dark lower edge
        // (the scale overlap shadow) — the classic dragon-scale read.
        const rows = 8, rp = vt * rows, rowY = rp - Math.floor(rp);
        const offset = (Math.floor(rp) % 2) * 0.5;
        const cp = ((ht * rows) + offset) % 1;
        if(rowY > 0.7) mul *= 0.68;                        // the scale's lower overlap shadow
        if(cp < 0.1 || cp > 0.9) mul *= 0.85;              // the vertical scale edges
      } else if(program === "cloth"){
        // soft vertical WEAVE banding (a robe's folds): gentle sinusoidal light/dark columns.
        const fold = Math.sin(ht * Math.PI * 5);
        mul *= 1 + fold * 0.14;
        // a faint horizontal weave cross-hatch
        if((y % 3) === 0) mul *= 0.96;
      } else if(program === "fur"){
        // directional streak NOISE (a pelt): vertical streaks of value, biased by a per-column hash so
        // the fur reads as combed downward.
        const streak = swarmHashLocal(x, 7);              // stable per-column
        mul *= 0.86 + streak * 0.28;
        if((y % 2) === 0 && streak > 0.6) mul *= 1.1;     // a lit guard hair
      } else if(program === "leather"){
        // mottle: soft irregular blotches (worn hide) via a low-freq per-cell hash.
        const blot = swarmHashLocal(Math.floor(x / 4) * 13 + Math.floor(y / 4) * 7, 11);
        mul *= 0.82 + blot * 0.34;
      }
      // per-texel micro-jitter (kills the flat fill) — shared by every program, one draw from the stream.
      const jitter = 1 + (rand() - 0.5) * 0.10;
      let r = col.r * jitter * mul, g = col.g * jitter * mul, b = col.b * jitter * mul;
      if(speckle[y * size + x]){ r *= 0.72; g *= 0.72; b *= 0.72; }
      set(x, y, r, g, b);
    }
  }

  // --- EYES (L19): 2 dots on the head-front (upper-mid band), 2-4 px each, black default / red for
  // fiends. Drawn AFTER the material fill so they sit on top. Scaled to texSize so the 64px hero variant
  // gets proportionally-sized eyes. Only head-front parts pass a non-null eyeSpec. ---
  if(eyeSpec){
    const ec = hexToRGB(eyeSpec.color);
    const dot = Math.max(2, Math.round(size / 16));       // 3px @48, 4px @64
    const ey = Math.round(size * 0.4);                    // eye row (upper-mid — the face)
    const exL = Math.round(size * 0.36), exR = Math.round(size * 0.64);
    for(let dy = 0; dy < dot; dy++){
      for(let dx = 0; dx < dot; dx++){
        set(exL + dx - ((dot/2)|0), ey + dy, ec.r, ec.g, ec.b);
        set(exR + dx - ((dot/2)|0), ey + dy, ec.r, ec.g, ec.b);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}
// a tiny deterministic per-index hash local to the pixel-skin programs (fur streaks / leather mottle),
// matching swarmHash's algorithm shape but self-contained here (the swarm one lives in theater-parts).
function swarmHashLocal(i, salt){
  let h = ((i + 1) * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0; h = Math.imul(h, 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ============================================================================
   FLOOR-TEXTURES.md §3 — procedural floor textures. Mirrors buildPixelSkinCanvas's technique (base
   value banding + 4x4 Bayer dither + sparse speckle) for the 12 §1 floor materials, so a rolled
   room's floor reads as a MATERIAL (flagstone/cobble/sand/grass/etc.) instead of a flat two-tone
   checker. Every recipe below is a small per-texel program keyed off the same PIXEL_SKIN_BAYER4
   matrix + mulberry32 seeded PRNG this file already uses for figure skins — deterministic, offline,
   no asset files (§6 decision 2). ============================================================ */
const FLOOR_TEX_SIZE = 64; // texels per axis (§1: "~64 texels, tiling")

// each recipe is a small per-texel draw function: (ctx: {x,y,size,vt,ht,base,bands,bayer,rand,
// speckle}) -> {r,g,b} (pre-jitter/speckle; the shared tail applies per-texel jitter + speckle same
// as buildPixelSkinCanvas does). `bands` is the same [dark, base, light] triple buildPixelSkinCanvas
// derives; recipes lean on it so every material stays in the same tonal family as its tile tint.
// each material's OWN characteristic base color (VS-desaturated but distinct) — so snow reads pale,
// sand tan, grass green, mud brown, rather than every material collapsing to the env palette tint.
// buildFloorMaterialCanvas mixes this 88/12 toward the tile tint on a NO-REALM floor (material
// dominates); on a realm-surface floor the ratio INVERTS (12/88) — the authored realm baseTint
// leads and this color is only a hue nudge under the recipe's pattern (Adam 2026-07-08).
const FLOOR_MATERIAL_BASE = {
  flagstone: 0x6f6f74, cobble: 0x777069, "cracked-earth": 0x7d6a4c, "cave-rock": 0x615c53,
  grass: 0x5c7038, "leaf-litter": 0x6d5a35, sand: 0xbcac7c, "snow-ice": 0xccd4e0,
  mud: 0x4f4335, scree: 0x827c73, plank: 0x715736, ash: 0x84817b,
  // net-new realm-surface bases (docs/REALM-SURFACES-DRAFT.md)
  grating: 0x585d64, asphalt: 0x3a3c40, "void-floor": 0x141620, "rope-matting": 0x8a7854, "candy-tile": 0xd85a84,
};
// mix two {r,g,b} — tB is the weight on b (0 = all a).
function mixRGB(a, b, tB){ const tA = 1 - tB; return { r: a.r * tA + b.r * tB, g: a.g * tA + b.g * tB, b: a.b * tA + b.b * tB }; }

const FLOOR_MATERIAL_RECIPES = {
  // cut rectangular blocks: a grout grid of darker mortar lines, slight per-block value jitter.
  flagstone(c){
    const cols = 4, rows = 4;
    const cx = (c.ht * cols) % 1, cy = (c.vt * rows) % 1;
    const grout = cx < 0.06 || cx > 0.94 || cy < 0.06 || cy > 0.94;
    const blockJitter = swarmHashLocal(Math.floor(c.ht * cols) * 13 + Math.floor(c.vt * rows) * 7, 3);
    let mul = 0.92 + blockJitter * 0.2;
    if(grout) mul *= 0.55;
    return scaleRGB(c.base, mul);
  },
  // packed rounded cobbles: many small ovoid cells with darker gaps, pebbly.
  cobble(c){
    const cellsX = 8, cellsY = 8;
    const cx = (c.ht * cellsX) % 1 - 0.5, cy = (c.vt * cellsY) % 1 - 0.5;
    const d = Math.sqrt(cx * cx + cy * cy);
    const cellJitter = swarmHashLocal(Math.floor(c.ht * cellsX) * 17 + Math.floor(c.vt * cellsY) * 11, 5);
    let mul = 0.88 + cellJitter * 0.3;
    if(d > 0.42) mul *= 0.5; // the gap between cobbles
    return scaleRGB(c.base, mul);
  },
  // packed dirt: broad value mottle + a few branching darker crack lines.
  "cracked-earth"(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 10) * 13 + Math.floor(c.vt * 10) * 7, 11);
    let mul = 0.82 + blot * 0.34;
    const crack = Math.abs(((c.ht * 3 + c.vt * 2) % 1) - 0.5) < 0.025;
    if(crack) mul *= 0.55;
    return scaleRGB(c.base, mul);
  },
  // rough uneven stone: coarse value blotches, no grid, dark pits.
  "cave-rock"(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 9) * 19 + Math.floor(c.vt * 9) * 23, 17);
    let mul = 0.75 + blot * 0.5;
    const pit = swarmHashLocal(Math.floor(c.ht * 14) * 5 + Math.floor(c.vt * 14) * 31, 29) > 0.92;
    if(pit) mul *= 0.4;
    return scaleRGB(c.base, mul);
  },
  // turf: fine vertical blade speckle, two-green value flecking.
  grass(c){
    const streak = swarmHashLocal(Math.floor(c.x / 1) + Math.floor(c.y / 2) * 3, 7);
    let mul = 0.85 + streak * 0.3;
    if((c.y % 2) === 0 && streak > 0.55) mul *= 1.12; // a lit blade tip
    return scaleRGB(c.base, mul);
  },
  // forest floor: scattered small angular leaf flecks over dark loam.
  "leaf-litter"(c){
    let mul = 0.7; // dark loam base
    const leaf = swarmHashLocal(Math.floor(c.ht * 12) * 41 + Math.floor(c.vt * 12) * 3, 13) > 0.72;
    if(leaf) mul = 0.95 + swarmHashLocal(Math.floor(c.ht * 12), 19) * 0.35;
    return scaleRGB(c.base, mul);
  },
  // dune: soft horizontal ripple bands, fine grain speckle.
  sand(c){
    const ripple = Math.sin(c.vt * Math.PI * 10 + c.ht * 1.5);
    let mul = 1 + ripple * 0.1;
    const grain = swarmHashLocal(Math.floor(c.x) + Math.floor(c.y) * 71, 3);
    mul *= 0.94 + grain * 0.12;
    return scaleRGB(c.base, mul);
  },
  // pale smooth with faint blue sheen bands + sparse sparkle specks.
  "snow-ice"(c){
    const sheen = Math.sin(c.vt * Math.PI * 4 + c.ht * 2.2);
    let mul = 1.05 + sheen * 0.06;
    const sparkle = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 97, 41) > 0.94;
    const col = scaleRGB(c.base, mul);
    if(sparkle) return { r: col.r * 1.3 + 20, g: col.g * 1.3 + 20, b: col.b * 1.35 + 25 };
    return col;
  },
  // wet dark: broad glossy value blobs, a few darker puddle centers.
  mud(c){
    const blot = swarmHashLocal(Math.floor(c.ht * 7) * 13 + Math.floor(c.vt * 7) * 29, 23);
    let mul = 0.68 + blot * 0.3;
    const puddle = swarmHashLocal(Math.floor(c.ht * 5) * 3 + Math.floor(c.vt * 5) * 7, 31) > 0.85;
    if(puddle) mul *= 0.5;
    return scaleRGB(c.base, mul);
  },
  // loose rock: many small angular pebble cells of varied value.
  scree(c){
    const cell = swarmHashLocal(Math.floor(c.ht * 11) * 37 + Math.floor(c.vt * 11) * 43, 7);
    let mul = 0.7 + cell * 0.55;
    return scaleRGB(c.base, mul);
  },
  // wood boards: long horizontal planks with darker seam lines + grain streaks.
  plank(c){
    const planks = 5, pp = c.vt * planks, seam = pp - Math.floor(pp);
    let mul = 1;
    if(seam < 0.06) mul *= 0.55; // the seam between boards
    const grain = swarmHashLocal(Math.floor(c.x / 1) + Math.floor(pp) * 53, 9);
    mul *= 0.9 + grain * 0.22;
    return scaleRGB(c.base, mul);
  },
  // grey soot: fine even fleck of light+dark over a mid grey.
  ash(c){
    const fleck = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 89, 53);
    const mul = 0.8 + fleck * 0.4;
    return scaleRGB(c.base, mul);
  },
  // REALM-SURFACE net-new bases (docs/REALM-SURFACES-DRAFT.md) --------------------------------------
  // perforated metal walkway: a grid of punched holes (dark see-through gaps) between lit metal ribs.
  grating(c){
    const cells = 6, cx = (c.ht * cells) % 1 - 0.5, cy = (c.vt * cells) % 1 - 0.5;
    const d = Math.max(Math.abs(cx), Math.abs(cy));
    let mul = 0.95 + swarmHashLocal(Math.floor(c.ht * cells) * 7 + Math.floor(c.vt * cells) * 13, 5) * 0.12;
    if(d < 0.30) mul *= 0.18; else if(d < 0.37) mul *= 0.5;   // punched hole + rim shadow
    return scaleRGB(c.base, mul);
  },
  // rolled asphalt: fine dark grain + a faded painted lane stripe ghosting diagonally through.
  asphalt(c){
    const grain = swarmHashLocal(Math.floor(c.x) * 3 + Math.floor(c.y) * 61, 41);
    const s = (c.ht + c.vt) % 1;
    if(s > 0.46 && s < 0.54) return { r: 150 + grain * 36, g: 148 + grain * 36, b: 136 + grain * 36 }; // worn paint stripe
    return scaleRGB(c.base, 0.82 + grain * 0.30);
  },
  // star-flecked void: a near-black floor with sparse bright star specks + faint constellation seams.
  "void-floor"(c){
    const star = swarmHashLocal(Math.floor(c.x * 1.3) * 17 + Math.floor(c.y * 1.3) * 29, 71);
    if(star > 0.972){ const b = 180 + (star - 0.972) / 0.028 * 70; return { r: b * 0.88, g: b * 0.94, b: b }; }
    const seam = ((c.ht * 3) % 1) < 0.05 || ((c.vt * 3) % 1) < 0.05;
    let mul = 0.7 + swarmHashLocal(Math.floor(c.ht * 3) * 5 + Math.floor(c.vt * 3) * 7, 3) * 0.5;
    if(seam) mul *= 1.4;
    return scaleRGB(c.base, mul);
  },
  // woven rope matting: over-under strand weave, under-strands in shadow.
  "rope-matting"(c){
    const strands = 7, sx = Math.floor(c.ht * strands), sy = Math.floor(c.vt * strands);
    const over = ((sx + sy) % 2) === 0;
    const along = over ? ((c.vt * strands) % 1 - 0.5) : ((c.ht * strands) % 1 - 0.5);
    let mul = (0.78 + (1 - Math.abs(along) * 2) * 0.32) * (over ? 1.0 : 0.86);
    return scaleRGB(c.base, mul);
  },
  // candy tile: a bright checkerboard of two confection tones — bright-kingdom pops HIGH-SAT by design
  // (the "too-bright color of a warning"), so this recipe ignores the env tint on purpose.
  "candy-tile"(c){
    const cells = 4, on = ((Math.floor(c.ht * cells) + Math.floor(c.vt * cells)) % 2) === 0;
    const jit = 1 + (swarmHashLocal(Math.floor(c.ht * cells) * 3 + Math.floor(c.vt * cells) * 7, 9) - 0.5) * 0.10;
    return on ? { r: 222 * jit, g: 98 * jit, b: 134 * jit } : { r: 150 * jit, g: 210 * jit, b: 190 * jit };
  }
};

function buildFloorMaterialCanvas(material, colorHex, seed, realmLead){
  const size = FLOOR_TEX_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const data = img.data;
  // 2026-07-08 (Adam "floors are drab as hell" — the realm tint funnel): two mixing regimes off ONE
  // room-wide tint (the checker's per-parity double-texture is gone with the parity tint itself):
  //   realmLead (tile carries a realm surface baseTint): the AUTHORED realm color LEADS — the
  //     material base contributes only a 12% hue nudge plus its full per-texel pattern, so red rock
  //     reads RED and bright-kingdom SCREAMS instead of collapsing to the material's stock gray.
  //   no realm: material's OWN color dominates as before, env tint mixed for cohesion — weight
  //     reduced 0.30 -> 0.12 so the (gray-ish) env fallback stops dragging every material toward
  //     the same drab hue; the recipe's own color + pattern carry the look.
  const envRGB = hexToRGB(colorHex);
  const matHex = FLOOR_MATERIAL_BASE[material];
  const base = (matHex != null)
    ? (realmLead ? mixRGB(envRGB, hexToRGB(matHex), 0.12) : mixRGB(hexToRGB(matHex), envRGB, 0.12))
    : envRGB;
  const bands = [scaleRGB(base, 0.80), base, scaleRGB(base, 1.18)];
  const rand = mulberry32(seed);
  const speckle = new Uint8Array(size * size);
  for(let i = 0; i < size * size; i++){ speckle[i] = rand() < 0.05 ? 1 : 0; }
  const set = (x, y, r, g, b) => { const o = (y * size + x) * 4; data[o] = clamp255(r); data[o+1] = clamp255(g); data[o+2] = clamp255(b); data[o+3] = 255; };
  const recipe = FLOOR_MATERIAL_RECIPES[material] || FLOOR_MATERIAL_RECIPES.flagstone;

  for(let y = 0; y < size; y++){
    const vt = y / (size - 1);
    for(let x = 0; x < size; x++){
      const ht = x / (size - 1);
      const col = recipe({ x, y, vt, ht, base, bands, rand });
      const jitter = 1 + (rand() - 0.5) * 0.08;
      let r = col.r * jitter, g = col.g * jitter, b = col.b * jitter;
      if(speckle[y * size + x]){ r *= 0.75; g *= 0.75; b *= 0.75; }
      set(x, y, r, g, b);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// module-scope cache: material+":"+tintHex -> THREE.CanvasTexture (the figure-texture cache
// precedent — a dungeon has few distinct floor textures, never thousands, §3 item 1). `tintHex` is
// the tile's own `t.tint` value — a "#rrggbb" string in this codebase (theater-data.js's palette
// entries) — used verbatim as the cache key so two tiles sharing a tint+material share one texture.
const FLOOR_TEXTURE_CACHE = new Map();
function buildFloorCanvasTexture(material, tintHex, seed, realmLead){
  // realmLead rides the cache key: a realm-led mix and a material-led mix of the same (material,
  // tint) pair are genuinely different canvases and must never collide.
  const key = material + ":" + tintHex + (realmLead ? ":realm" : "");
  const hit = FLOOR_TEXTURE_CACHE.get(key);
  if(hit) return hit;
  let tex = null;
  try {
    // resolve tintHex (a "#rrggbb" string, or already-numeric) to a numeric 0xrrggbb via THREE.Color
    // so this stays in sync with however colorFor/topColor elsewhere in this file parse the same
    // tile.tint field — never a bespoke string hash of the color (that would drift the hue).
    const parsed = new THREE.Color(tintHex);
    const colorHex = (parsed.r * 255 << 16) | (parsed.g * 255 << 8) | (parsed.b * 255 | 0);
    const canvas = buildFloorMaterialCanvas(material, colorHex, pixelSkinHash(key + ":" + seed), !!realmLead);
    tex = new THREE.CanvasTexture(canvas);
    nearestify(tex); // NearestFilter mag+min, generateMipmaps=false (§3 item 1)
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
  } catch(e){ tex = null; }
  FLOOR_TEXTURE_CACHE.set(key, tex);
  return tex;
}

/* the cached CanvasTexture factory. Key = partName:colorHex:variantKey (the exact tuple the brief
   names). One CanvasTexture per distinct triple; NearestFilter + no mipmaps (L2: "NearestFilter, no
   mips") applied via the same nearestify() helper every other texture entry point uses. Returns a
   THREE.Texture. On any failure (should never happen once capable) returns null so figureMaterialFor
   cleanly falls back to flat color.

   A3 (REVIEW-FIXES-0705-VISUAL.md §W2-A finding 3) — PIXEL_SKIN_CACHE used to retain EVERY CanvasTexture
   ever minted for the lifetime of the mount (key space is part:channel:variant:colorHex x realm grading,
   so a long session touring many realms/creatures grows this unboundedly) and retire() never disposed
   it at all — asymmetric with disposeWholeObjectCaches' own D7 treatment of the whole-object caches.
   Fix: a bounded LRU (a `Map`, whose iteration/re-insertion order gives "least-recently-fetched" for
   free — re-`set`ting an existing key on a cache HIT bumps it to the most-recent position by delete+
   re-insert) capped at PIXEL_SKIN_CACHE_CAP entries; inserting past the cap evicts + disposes the
   oldest entry. 128 comfortably covers a board's live variety while bounding a long session. Disposed
   symmetrically at retire() (see disposePixelSkinCache below) — retire() is the one true end-of-life
   point for this cache too, matching disposeWholeObjectCaches. figureMaterialFor (:781-ish, the only
   consumer) is untouched — this file's own signature/behavior at the call site is unchanged. */
const PIXEL_SKIN_CACHE_CAP = 128;
const PIXEL_SKIN_CACHE = new Map();
// UNIT 4 (L18/L19): the skinKey is "partName:channel:variantKey" (renderPartInto builds it); variantKey
// is "slug|kind". Parse it to pick the material program + eye spec + (U7-lite) the hero-tier 64px texel
// size. The cache key already includes all of these (via skinKey + color), so a program/eye/size change
// mints its own texture and never collides with a differently-programmed one.
const PIXEL_SKIN_HERO_TEX_SIZE = 64;   // U7-lite: PC/boss tier gets a crisper 64px skin at ~2x screen size
function pixelSkinTextureFor(colorHex, skinKey){
  const key = skinKey + ":" + (colorHex >>> 0).toString(16);
  if(PIXEL_SKIN_CACHE.has(key)){
    // LRU touch: bump this key to the most-recently-fetched position (delete+re-insert — a Map's own
    // iteration order is insertion order, so this is the whole LRU mechanism, no separate timestamp).
    const hit = PIXEL_SKIN_CACHE.get(key);
    PIXEL_SKIN_CACHE.delete(key);
    PIXEL_SKIN_CACHE.set(key, hit);
    return hit;
  }
  let tex = null;
  try {
    const parts = String(skinKey).split(":");
    const partName = parts[0] || "";
    const channel = parts[1] || "skin";
    const variantKey = parts.slice(2).join(":");
    const kind = (variantKey.split("|")[1] || "");
    const program = materialProgramFor(partName, channel, colorHex);
    const eyeSpec = eyeSpecFor(partName, channel, colorHex);
    const texSize = (kind === "pc") ? PIXEL_SKIN_HERO_TEX_SIZE : PIXEL_SKIN_TEX_SIZE;
    const canvas = buildPixelSkinCanvas(colorHex, pixelSkinHash(key), program, eyeSpec, texSize);
    tex = new THREE.CanvasTexture(canvas);
    nearestify(tex);          // NearestFilter mag+min, generateMipmaps=false (L2)
    tex.colorSpace = THREE.SRGBColorSpace; // the canvas RGB bytes are authored in sRGB, like a PNG
  } catch(e){ tex = null; }
  PIXEL_SKIN_CACHE.set(key, tex);
  if(PIXEL_SKIN_CACHE.size > PIXEL_SKIN_CACHE_CAP){
    // evict the OLDEST entry — a Map's iterator yields insertion order, so .next() on .keys() is
    // exactly the least-recently-fetched key (every cache HIT above re-inserts to bump recency).
    const oldestKey = PIXEL_SKIN_CACHE.keys().next().value;
    const oldestTex = PIXEL_SKIN_CACHE.get(oldestKey);
    if(oldestTex && oldestTex.dispose) oldestTex.dispose();
    PIXEL_SKIN_CACHE.delete(oldestKey);
  }
  return tex;
}
/* A3 — the symmetric end-of-life dispose point for PIXEL_SKIN_CACHE, called from retire() alongside
   disposeWholeObjectCaches(). Disposes every still-cached CanvasTexture then empties the cache so a
   subsequent mount() starts fresh (a disposed THREE.Texture can't be reused, same discipline as
   disposeWholeObjectCaches). Idempotent-safe: an already-empty cache is a no-op. */
function disposePixelSkinCache(){
  PIXEL_SKIN_CACHE.forEach(function(tex){ if(tex && tex.dispose) tex.dispose(); });
  PIXEL_SKIN_CACHE.clear();
}

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

/* ============================================================================
   P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.2/§4 Unit A steps 3-4) — the geometry factory +
   material funnel for the whole-object figure/prop roster (dev/model-qa/creatures/, reached via
   src/ui/theater-figures.js's registry). Ported BYTE-FOR-BYTE from dev/model-qa/ps1-sheet.html's own
   figureScene/grainTexture/quadUVs/matBucket (that file is the byte-faithful copy of THIS file's PSX
   pass, so porting its whole-object rebuild back into the engine is the inverse of how it was
   authored) — §2.2's closed CHANNEL_KEYS vocabulary generalizes ps1-sheet's 3-bucket matBucket
   classifier (matte/metal/glass) to the full skin/cloth/leather/bone/scale/fur/wood/stone/glass/glow
   set, all of which render through ONE of THREE material classes (Lambert matte, Phong metal, Phong
   glass — §2.2's render-mapping table) — a channel's material palette differs by TEXEL PROGRAM
   (grain-atlas window family), not by THREE material subclass beyond those three buckets. ============================================================================ */

// §2.2 channel vocabulary (mirrors probe-lib.js's own CHANNEL_KEYS, kept in sync by convention/
// comment — this ES module could import it directly since probe-lib.js is also Node/browser-safe,
// but the values are a closed, rarely-changing vocabulary and this file already keeps several other
// small mirrored tables, e.g. ENV_VOID_TINT, for the same "sealed scope, small stable table" reason).
const WHOLE_CHANNEL_KEYS = ["", "skin", "cloth", "leather", "bone", "metal",
  "scale", "fur", "wood", "stone", "glass", "glow"];
// channel name -> material bucket index (0 matte/Lambert, 1 metal/Phong, 2 glass/Phong, 3 glow/Basic
// unlit) — §2.2's render-mapping table. CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "the torch fire
// itself [must be] bright and looks like light/fire") — "glow" moves from bucket 0 (Lambert, lit —
// the spec's v1 placeholder, §2.2's own table footnote "real emissive deferred") to its OWN bucket 3
// (MeshBasicMaterial, always full-bright regardless of scene lighting) so flame/lantern-glow geometry
// actually reads as light instead of a dim lit-matte surface. An unrecognized/untagged ("") channel is
// a matte-bucket classifier read (wholeObjectClassifyBucket below), not a static lookup — see
// wholeObjectBucketFor.
const WHOLE_CHANNEL_BUCKET = {
  skin: 0, cloth: 0, leather: 0, bone: 0, scale: 0, fur: 0, wood: 0, stone: 0,
  metal: 1, glass: 2, glow: 3
};
/* untagged-tri classifier — matBucket (ps1-sheet.html L253-259) verbatim: a coarse color read over
   the tri's own averaged vertex color decides matte/metal/glass when the module shipped no CHAN tag
   for that tri (probe-lib.js's CHAN defaults every tri to 0/"" until a module calls setChannels()).
   This is the "untagged tris fall to the classifier" contract §2.2 names explicitly. */
function wholeObjectClassifyBucket(r, g, b){
  const v = Math.max(r, g, b), sat = v - Math.min(r, g, b);
  if(b > r && b > g && v > 0.55) return 2;                          // glass (orb cyans)
  if(r > g * 1.12 && g > b * 1.45 && v > 0.35 && sat > 0.15) return 1; // brass/gold -> metal
  if(sat < 0.09 && v > 0.40 && v < 0.74 && b >= r) return 1;         // steel (cool desaturated mids)
  return 0;                                                          // matte
}
// resolve a tri's material bucket: a tagged channel wins (WHOLE_CHANNEL_BUCKET lookup); an untagged
// ("" / unrecognized) channel falls to the coarse-color classifier over the tri's own averaged color.
function wholeObjectBucketFor(channelName, r, g, b){
  if(channelName && WHOLE_CHANNEL_BUCKET[channelName] != null) return WHOLE_CHANNEL_BUCKET[channelName];
  return wholeObjectClassifyBucket(r, g, b);
}

/* the texel-grain atlas — grainTexture() ported verbatim from ps1-sheet.html L203-231 (a seeded
   128px canvas, near-white base + mottle patches + darker/pale flecks + worn scratches; NearestFilter,
   no mipmaps, deterministic — no asset files, no Math.random). Memoized module-scope (one atlas for
   every whole-object figure, shared, matching the sheet's own single-instance discipline). */
let WHOLE_GRAIN_TEX = null;
function wholeObjectGrainTexture(){
  if(WHOLE_GRAIN_TEX) return WHOLE_GRAIN_TEX;
  if(typeof document === "undefined" || typeof document.createElement !== "function") return null; // headless degrade
  let c;
  try { c = document.createElement("canvas"); c.width = c.height = 128; } catch(e){ return null; }
  const g = c.getContext && c.getContext("2d");
  if(!g) return null;
  g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, 128, 128);
  let s = 987654321 >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for(let i = 0; i < 170; i++){
    const v = (0.86 + rnd() * 0.10) * 255 | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect((rnd() * 128) | 0, (rnd() * 128) | 0, 3 + ((rnd() * 4) | 0), 3 + ((rnd() * 4) | 0));
  }
  for(let i = 0; i < 4200; i++){
    const dark = rnd() < 0.85;
    const v = dark ? 0.60 + rnd() * 0.34 : 1.0;
    const vv = (v * 255) | 0;
    g.fillStyle = `rgb(${vv},${vv},${vv})`;
    g.fillRect((rnd() * 128) | 0, (rnd() * 128) | 0, 1 + ((rnd() * 3) | 0), 1 + ((rnd() * 3) | 0));
  }
  for(let i = 0; i < 110; i++){
    const x = (rnd() * 128) | 0, y = (rnd() * 128) | 0, len = 2 + (rnd() * 6) | 0, v = (0.58 + rnd() * 0.16) * 255 | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, y, rnd() < 0.5 ? len : 1, rnd() < 0.5 ? 1 : len);
  }
  const tex = new THREE.CanvasTexture(c);
  nearestify(tex);
  WHOLE_GRAIN_TEX = tex;
  return tex;
}
/* per-quad (tri-pair) UV windows into the 128px grain atlas — quadUVs() ported verbatim from
   ps1-sheet.html L232-245: a deterministic xorshift hash (fixed seed) picks a 14x14-grid window per
   quad, shared by both tris of the pair (a tri-pair IS the quad probe-lib.js's own quad() emits). */
function wholeObjectQuadUVs(triCount){
  const uv = new Float32Array(triCount * 3 * 2);
  const CELLS = 14, W = 2 / 16;
  let h = 2463534242 >>> 0;
  const hash = () => ((h = (h ^ (h << 13)) >>> 0, h = (h ^ (h >>> 17)) >>> 0, h = (h ^ (h << 5)) >>> 0) / 4294967296);
  let cu = 0, cv = 0;
  for(let t = 0; t < triCount; t++){
    if(t % 2 === 0){ cu = (hash() * CELLS | 0) / 16; cv = (hash() * CELLS | 0) / 16; }
    const o = t * 6;
    uv[o] = cu;     uv[o + 1] = cv;
    uv[o + 2] = cu + W; uv[o + 3] = cv;
    uv[o + 4] = cu + (t % 2 ? W : 0); uv[o + 5] = cv + W;
  }
  return uv;
}

/* wholeObjectMaterialsFor(entry) — §3-D5: the 4-slot material array (Lambert matte / Phong metal /
   Phong glass / Basic glow-unlit), the figureScene construction from ps1-sheet.html L293-297 ported
   byte-for-byte for the first 3 slots — each `{vertexColors:true, flatShading:true, map:grainAtlas,
   color:0xffffff}` (white base color so the baked vertex colors show through 1:1, matching
   figureMaterialFor's own pixel-skin convention) then `applyPsxShaderTweaks`'d exactly like every other
   material this file builds. Does NOT route through pixelSkinTextureFor/figureMaterialFor (D5: "no
   double eyes — house eyes are geometry" — a whole-object module bakes its own eyes as vertex-colored
   geometry, so layering a procedural pixel-skin texture on top would double-paint). Memoized (one
   quadruple per opacity value — translucent entries clone with transparent+depthWrite:false per the
   TRANSLUCENT_OPACITY precedent, L1458-ish).

   CAPTURE-GATE FOLLOW-UP (2026-07-04, Adam: "the torch fire itself [must be] bright and looks like
   light/fire") — slot 3 is MeshBasicMaterial, not Lambert: unlit means it ignores the scene's key/
   fill/ambient lights entirely and always renders at its own baked vertex-color brightness, which is
   exactly what a flame/glow surface needs (a lit Lambert flame reads dark in a "dark" room profile —
   the bug this fixes). Verified `applyPsxShaderTweaks` works unmodified on MeshBasicMaterial: it only
   needs the `<opaque_fragment>` (fragment) and `<project_vertex>` (vertex) shader-chunk anchors to
   splice its dither/vertex-snap GLSL into, and vendor/three/three.module.js's own meshbasic_frag/
   meshbasic_vert chunks (ShaderLib.basic) both carry those two anchors verbatim — same as every other
   material class this file already tweaks — so no emissive-boosted-Lambert fallback was needed.

   FLAME-GLOW FOLLOW-UP (2026-07-04, Adam: "the material on the flame still reads flat, it should be
   glowing/bright vs a flat orange texture, probably with some opacity as well") — unlit alone still
   reads as a flat painted-orange surface at board distance: full-bright is necessary but not
   sufficient for a LIGHT read. Slot 3 now additionally carries `transparent:true, opacity:0.85,
   blending:THREE.AdditiveBlending, depthWrite:false`. Additive blending is what actually sells "this
   surface emits" — it sums the flame's own color into whatever's behind/around it (the dark board/fog)
   instead of just occluding it at a fixed unlit brightness, which is the visual signature of light
   sources vs. painted matte surfaces in every PSX-era game this project's grit reference draws from.
   depthWrite:false is required alongside transparent (the standard three.js pairing — an opaque
   depth-write from a see-through/additive surface would incorrectly occlude geometry behind it and,
   for overlapping flame tufts, z-fight/hide layers that should all be summing together). opacity 0.85
   rather than 1.0 leaves the additive sum from behind-showing-through readable as PART of the glow
   (a fully opaque additive layer still sums fine, but 0.85 gave a slightly softer/less-clipped core in
   capture — Adam's own "with some opacity as well" ask). This is independent of the entry-level
   `opacity` field (a whole-object's overall ghost/translucency dial, e.g. an incorporeal figure) —
   glow buckets are ALWAYS additive-transparent regardless of that field; if a translucent entry ever
   also carries glow tris, the entry opacity still multiplies in via the base object's `opacity` key
   (Object.assign below applies glowOpts after base, so translucent-entry opacity is overridden by the
   fixed glow opacity — a translucent whole-object's flame reads at the same glow brightness as any
   other, which is the desired "fire is fire" behavior, not dimmed by an unrelated ghost dial).
   applyPsxShaderTweaks verified unaffected: dither still splices into `<opaque_fragment>` (present in
   meshbasic_frag regardless of the material's transparent/blending state — that chunk sets the final
   `gl_FragColor` before the tonemapping/colorspace chunks that follow it, not before whatever blend
   mode the GL state applies) and vertex-snap still splices into `<project_vertex>` — additive+dither
   judged on capture (dev/model-qa/gate-followups/flame-glow-*): no banding/moire artifacts, dither
   speckle reads as a texel/grain cue same as every other material, no double-brightening from the
   dither's own signed offset (it's a small +/- nudge on an already-additive-summed color, not a second
   multiplicative pass). */
const WHOLE_MATERIALS_CACHE = {};
function wholeObjectMaterialsFor(entry){
  const opacity = (entry && entry.opacity != null) ? entry.opacity : 1;
  const key = "op:" + opacity;
  if(WHOLE_MATERIALS_CACHE[key]) return WHOLE_MATERIALS_CACHE[key];
  const grain = wholeObjectGrainTexture();
  const base = { vertexColors: true, flatShading: true, color: 0xffffff };
  if(grain) base.map = grain;
  const translucent = opacity < 1;
  if(translucent){ base.transparent = true; base.opacity = opacity; base.depthWrite = false; }
  // slot 3 = "glow": always additive-transparent (see the FLAME-GLOW FOLLOW-UP header above) — applied
  // AFTER base so these three keys win over any entry-level translucent opacity/transparent/depthWrite.
  const glowOpts = { transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false };
  // figureAO on the three lit body buckets (matte/metal/glass) — the base-darkening occlusion read.
  // NOT on the glow bucket (slot 3): those texels are meant to be full-bright emissive (flame/rune),
  // AO-darkening them would dim the fire.
  const mats = [
    applyPsxShaderTweaks(new THREE.MeshLambertMaterial(Object.assign({}, base)), { figureAO: true }),
    applyPsxShaderTweaks(new THREE.MeshPhongMaterial(Object.assign({}, base, { shininess: 46, specular: 0x8a8f94 })), { figureAO: true }),
    applyPsxShaderTweaks(new THREE.MeshPhongMaterial(Object.assign({}, base, { shininess: 95, specular: 0xbfdbe8 })), { figureAO: true }),
    // MeshBasicMaterial has no `flatShading` concept (unlit, no normals-based shading at all) — omit
    // it rather than pass a meaningless key; vertexColors/map carry over from base as-is.
    applyPsxShaderTweaks(new THREE.MeshBasicMaterial(Object.assign({}, base, { flatShading: undefined }, glowOpts)))
  ];
  // D7: tag each cached material shared, same discipline as the geometry cache (wholeObjectGeometryFor)
  // — clearGroup's disposeMeshMaybeShared skips .dispose() for a shared material too, since this
  // opacity-keyed set is reused across every whole-object figure/prop at that opacity.
  mats.forEach(m => { m.userData.shared = true; });
  WHOLE_MATERIALS_CACHE[key] = mats;
  return mats;
}

/* Rec.601 luma-desaturation of a flat [r,g,b] color-buffer IN PLACE — the D8 gray-variant helper
   (corpse desaturation without touching desaturateGroup's live-material mutation path, which would
   corrupt the SHARED cached geometry every other standing figure of the same key also uses). */
function wholeObjectDesaturateColorBuffer(col){
  for(let i = 0; i < col.length; i += 3){
    const r = col[i], g = col[i + 1], b = col[i + 2];
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    col[i] = gray; col[i + 1] = gray; col[i + 2] = gray;
  }
}

/* wholeObjectGeometryFor(key, gray) — §4 step 3: cache-checked; else resolves the registry entry,
   calls its (already-loaded) builder between resetGeom()/getBuffers() (probe-lib.js's own contract),
   buckets tris by channel (WHOLE_CHANNEL_BUCKET, classifier fallback for untagged/"" tris), rebuilds
   the position/color/uv buffers BUCKET-CONTIGUOUS so THREE's addGroup material-index ranges work (the
   figureScene rebuild, ps1-sheet.html L266-291, ported verbatim), computes vertex normals, and caches
   the resulting BufferGeometry by registry key (+ "|gray" for the D8 desaturated corpse variant).
   Returns null on ANY failure (entry not registered, builder not yet loaded/failed import, a throwing
   builder) — callers (figureFor) treat null as "fall through to the existing cuboid chain," never a
   crash (§4 step 5's own guard list). D7: geometry is cached and tagged so clearGroup's per-setUnits
   sweep can skip disposing a SHARED cached geometry (see clearGroup's own edit below). */
const WHOLE_GEOMETRY_CACHE = {};
function wholeObjectGeometryFor(key, gray, pieceKind){
  if(!key) return null;
  const cacheKey = key + (gray ? "|gray" : "");
  const cached = WHOLE_GEOMETRY_CACHE[cacheKey];
  if(cached) return cached;

  // TABLETOP-UNITS.md §U3: pieceKind ("figure"/"prop") threads through to resolveWholeObject so a
  // genuine miss resolves to the blank-piece entry instead of null — see that function's own header
  // comment. Omitted (mountLightProp's "light:" lookups) keeps the original null-on-miss contract.
  const entry = resolveWholeObject(key, pieceKind);
  if(!entry || typeof entry.build !== "function") return null; // not registered / not yet loaded / failed import

  let POS, COL, CHAN;
  try {
    wholeObjectResetGeom();
    entry.build();
    const buf = wholeObjectGetBuffers();
    POS = buf.POS; COL = buf.COL; CHAN = buf.CHAN;
  } catch(e){
    // a throwing builder — evict any stale cache entry for this key and fall through to null (§4
    // step 5's "geometry build throws -> catch, evict cache entry, skip").
    delete WHOLE_GEOMETRY_CACHE[cacheKey];
    return null;
  }
  if(!POS || !POS.length) return null;

  const triCount = POS.length / 9;
  const uvAll = wholeObjectQuadUVs(triCount);
  // CAPTURE-GATE FOLLOW-UP: 4 buckets now (matte/metal/glass/glow) — see wholeObjectMaterialsFor's own
  // header for why "glow" got promoted out of the matte bucket into its own unlit slot.
  const buckets = [[], [], [], []];
  for(let t = 0; t < triCount; t++){
    const chanByte = (CHAN && CHAN[t] != null) ? CHAN[t] : 0;
    const chanName = WHOLE_CHANNEL_KEYS[chanByte] || "";
    const r = (COL[t * 9] + COL[t * 9 + 3] + COL[t * 9 + 6]) / 3;
    const g = (COL[t * 9 + 1] + COL[t * 9 + 4] + COL[t * 9 + 7]) / 3;
    const b = (COL[t * 9 + 2] + COL[t * 9 + 5] + COL[t * 9 + 8]) / 3;
    buckets[wholeObjectBucketFor(chanName, r, g, b)].push(t);
  }
  const pos = new Float32Array(POS.length), col = new Float32Array(COL.length), uv = new Float32Array(triCount * 6);
  let w = 0;
  const ranges = [];
  for(const bkt of buckets){
    const start = w;
    for(const t of bkt){
      pos.set(POS.slice(t * 9, t * 9 + 9), w * 9);
      col.set(COL.slice(t * 9, t * 9 + 9), w * 9);
      uv.set(uvAll.slice(t * 6, t * 6 + 6), w * 6);
      w++;
    }
    ranges.push([start * 3, (w - start) * 3]);
  }
  if(gray) wholeObjectDesaturateColorBuffer(col);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  ranges.forEach(([s, c], i) => { if(c > 0) geo.addGroup(s, c, i); });
  geo.computeVertexNormals();
  geo.userData.shared = true; // D7: clearGroup's dispose-skip tag for cached whole-object geometry
  WHOLE_GEOMETRY_CACHE[cacheKey] = geo;
  return geo;
}

/* ============================================================================
   BATTLE-THEATER T2 — THE GLB / GLTFLoader SEAM (docs/BATTLE-THEATER.md §7, vendor/three/README.md).
   A Blender-authored .glb model loaded ALONGSIDE the hand-authored probe-lib figures, routed through
   the IDENTICAL PS1 treatment so an import matches the shipped look, never a glossy passthrough:
     - glbLoadScene(url): the injected loader theater-figures.js's loadWholeObjectBuilders calls (kept
       here so THREE/GLTFLoader never enter that THREE-free, Node-importable file). One shared
       GLTFLoader instance; resolves gltf.scene (or null). Any parse/network failure rejects and the
       loader's own catch leaves the entry unresolved -> figureFor's glb branch skips it -> cuboid
       fallback (the same total-function miss-chain every other whole-object call site follows).
     - wholeObjectGeometryForGlb(cacheKey, entry): walks the parsed scene's meshes, bakes world-space
       triangles into the SAME non-indexed POS/COL buffer shape wholeObjectGeometryFor produces from a
       probe-lib builder, normalizes to the module size/seat convention (center X/Z, feet at y=0,
       uniform-scaled to GLB_TARGET_HEIGHT so the downstream WHOLE_OBJECT_SCALE/disc/seat path in
       setUnits treats it byte-identically to a procedural figure), and returns a BufferGeometry that
       wholeObjectMaterialsFor's faceted/flat-shaded/grain-mapped/dither-snapped materials render.
   Colour: a GLB usually carries no probe-lib CHAN channels and no baked vertex colours (the grunt
   test asset is white PBR), so per-vertex colour is taken from a mesh vertex-colour attribute when
   present, else the material base colour; a near-white/near-black material (no usable hue) substitutes
   the grit-neutral stone default so a colourless export reads as desaturated stone, not glaring white;
   then every colour is pulled GLB_DESAT_MIX of the way toward its own luma to sit in the grit palette
   range. All tris route to the matte/Lambert bucket (slot 0) — the same slot an untagged procedural
   tri classifies into — since there is no channel data to bucket by. This is a FIRST seam: per-entry
   height/colour overrides and channel-tagged GLB materials are deferred tuning knobs, not this unit.
   ============================================================================ */
const GLB_TARGET_HEIGHT = 1.5;      // module height convention (humanoid.js tops out ~1.475 incl. its baked disc)
// BEAUTY-WAVE.md VP1: TRUE-SCALE reference height for interior pieces — 5.5ft (the SRD medium-human
// convention the registry's scaleTrue/scaleVsHuman ratios are already computed against) at
// cellSize: 1 world unit = 5ft (DUNGEON-GRAPH.md law 1) => 5.5/5 = 1.1 world units.
const HUMAN_TRUE_HEIGHT = 1.1;
const GLB_NEUTRAL_COLOR = 0x8a8378; // grit stone-grey for a colourless (near-white/black) GLB material
const GLB_DESAT_MIX = 0.35;         // fraction each imported colour is pulled toward its own luma
let _glbLoader = null;
function glbLoadScene(url){
  if(!_glbLoader) _glbLoader = new GLTFLoader();
  return _glbLoader.loadAsync(url).then(function(gltf){ return (gltf && gltf.scene) ? gltf.scene : null; });
}
function wholeObjectGeometryForGlb(cacheKey, entry){
  const cached = WHOLE_GEOMETRY_CACHE[cacheKey];
  if(cached) return cached;
  const scene = entry && entry.glbScene;
  if(!scene) return null;
  const POS = [], COL = [];
  const tmpV = new THREE.Vector3();
  const nCol = new THREE.Color(GLB_NEUTRAL_COLOR);
  try {
    scene.updateMatrixWorld(true);
    scene.traverse(function(obj){
      if(!obj.isMesh || !obj.geometry) return;
      const geom = obj.geometry;
      const posAttr = geom.getAttribute("position");
      if(!posAttr) return;
      const idx = geom.getIndex();
      const colAttr = geom.getAttribute("color");
      let mat = obj.material;
      if(Array.isArray(mat)) mat = mat[0];
      const baseCol = new THREE.Color(0xffffff);
      if(mat && mat.color) baseCol.copy(mat.color);
      const mn = Math.min(baseCol.r, baseCol.g, baseCol.b), mx = Math.max(baseCol.r, baseCol.g, baseCol.b);
      const neutralish = (mn > 0.9) || (mx < 0.06); // no usable hue -> grit-neutral substitute
      const world = obj.matrixWorld;
      const vertCount = idx ? idx.count : posAttr.count;
      for(let i = 0; i < vertCount; i++){
        const vi = idx ? idx.getX(i) : i;
        tmpV.fromBufferAttribute(posAttr, vi).applyMatrix4(world);
        POS.push(tmpV.x, tmpV.y, tmpV.z);
        let cr, cg, cb;
        if(colAttr){ cr = colAttr.getX(vi); cg = colAttr.getY(vi); cb = colAttr.getZ(vi); }
        else if(neutralish){ cr = nCol.r; cg = nCol.g; cb = nCol.b; }
        else { cr = baseCol.r; cg = baseCol.g; cb = baseCol.b; }
        const luma = cr * 0.299 + cg * 0.587 + cb * 0.114;
        cr += (luma - cr) * GLB_DESAT_MIX; cg += (luma - cg) * GLB_DESAT_MIX; cb += (luma - cb) * GLB_DESAT_MIX;
        COL.push(cr, cg, cb);
      }
    });
  } catch(e){ delete WHOLE_GEOMETRY_CACHE[cacheKey]; return null; }
  if(!POS.length || POS.length % 9 !== 0) return null; // empty / not clean triangle soup

  // normalize to the module seat convention: center X/Z, feet (min Y) at 0, uniform-scale to target height.
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for(let i = 0; i < POS.length; i += 3){
    if(POS[i] < minX) minX = POS[i]; if(POS[i] > maxX) maxX = POS[i];
    if(POS[i + 1] < minY) minY = POS[i + 1]; if(POS[i + 1] > maxY) maxY = POS[i + 1];
    if(POS[i + 2] < minZ) minZ = POS[i + 2]; if(POS[i + 2] > maxZ) maxZ = POS[i + 2];
  }
  const h = maxY - minY;
  const scale = (h > 1e-4) ? (GLB_TARGET_HEIGHT / h) : 1;
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  for(let i = 0; i < POS.length; i += 3){
    POS[i] = (POS[i] - cx) * scale;
    POS[i + 1] = (POS[i + 1] - minY) * scale;
    POS[i + 2] = (POS[i + 2] - cz) * scale;
  }

  const triCount = POS.length / 9;
  const uv = wholeObjectQuadUVs(triCount); // same per-tri grain windows the probe-lib path uses
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(POS), 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(COL), 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.addGroup(0, POS.length / 3, 0); // one group -> matte/Lambert bucket (slot 0); no CHAN data to bucket by
  geo.computeVertexNormals(); // non-indexed -> per-face normals -> faceted read under flatShading (D5 look)
  geo.userData.shared = true; // D7: clearGroup's dispose-skip tag for cached whole-object geometry
  WHOLE_GEOMETRY_CACHE[cacheKey] = geo;
  return geo;
}

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
const ITR_SPRITE_EMISSIVE_FLOOR = 0.05; // sprite readability floor — emissiveIntensity on the lit billboard's own emissiveMap
// BW2-4b item 1 — INTERIOR LIGHT RANGE CAP. The torch/lamp PointLights (data.lights, default range 12)
// spilled far enough that an 8-torch room had NO dark corner — every cell sat in some pool, so a sprite
// read ~0.7 of full-bright everywhere (the BRIGHTNESS LAW's exact failure). Capping the range tightens
// each pool to the mock's small hot circle, so the gaps between pools go genuinely dark and a standee
// standing there reads dim. Pool brightness (near the flame) is untouched — only the far spill is cut.
const ITR_LIGHT_DISTANCE_CAP = 7;
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
// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D3): every whole-object module is authored facing
// +z (verified against humanoid.js/mon-wolf.js/mon-giant.js/spider.js/prop-light.js — §1 ground
// truth), so the whole-object path sets figure.rotation.y to this ONE constant UNCONDITIONALLY —
// BASE_ORIENT_YAW (the cuboid-recipe orientation law above) never applies on this path, since a
// whole-object quadruped is already composed broadside in its own geometry, not end-on like the
// cuboid torso-quad base. Kept as a single named constant (not a bare 0 literal at the call site)
// so a future capture-review finding ("quadruped broadside" read issue) is ONE constant to flip,
// never a per-module edit (§3-D3's own text).
const WHOLE_OBJECT_YAW = 0;
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
// THE FIST RULE (L14, 2026-07-03): kept byte-identical to torsoBiped.anchors.mainHand.pos (0.3, 0.58,
// 0.02) — the FIST CENTER the fist retarget moved the biped grip to (see theater-parts.js's own FIST-
// RULE anchor header). A weapon seated here has its grip section INSIDE the arm's oversized fist box
// (geometric intersection, not adjacency). The "one grip contract, two render paths" invariant: the
// legacy weaponMeshFor path (this constant) and the recipe path (the anchor) MUST agree; the giant
// path reads torsoBipedHuge.anchors.mainHand live (no separate literal).
const WEAPON_BASE_OFFSET = { x: 0.3, y: 0.58, z: 0.02 };
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

/* weaponMeshFor — the LEGACY archetype-builder weapon composer (buildBiped/buildGiant's fallback path,
   used only when a unit has NO recipe). `weapon` is a weapon SHAPE key (sword/axe/spear/...); `offset`
   is the caller's grip anchor (torsoBiped/torsoBipedHuge mainHand). CARRY STATES (L14/L15): routes
   through the SAME weaponCarryFor the recipe path uses, so a legacy spear PLANTS and a legacy sword is
   held-fist identically to a recipe one — the two paths stay in sync (the desync the ruling warns
   against). The legacy path has no heavy-2H signal (a bare shape key can't distinguish a longsword from
   a greatsword) so it never back-mounts — a fallback figure just holds its weapon at the fist, which is
   correct (back-mount is a recipe/PC-item affordance). Returns null for none/unknown. */
function weaponMeshFor(weapon, tint, offset){
  if(!weapon || weapon === "none") return null;
  const partKey = WEAPON_PART_KEY[weapon];
  const partFn = partKey && Parts.PARTS[partKey];
  if(!partFn) return null;
  const base = offset || WEAPON_BASE_OFFSET;
  const carry = weaponCarryFor(partKey, { heavy: false });
  const g = new THREE.Group();
  const dpos = carry.dpos || { x: 0, y: 0, z: 0 };
  renderPartInto(g, partFn, {}, flatTints(tint),
    { x: base.x + (dpos.x || 0), y: base.y + (dpos.y || 0), z: base.z + (dpos.z || 0) }, { z: carry.rz });
  return g;
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

/* P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.4/§4 step 5) — the unit-side resolution key: a
   pc/ally with a known class resolves "class:<lowercase class>"; every other unit (foe, or a
   pc/ally with no className) resolves its bestiary recipeSlug directly (already the exact bestiary
   id per theater-data.js's own comments). Mirrors §2.4's resolution-order pseudocode exactly. */
function wholeObjectKeyFor(kind, className, recipeSlug){
  if((kind === "pc" || kind === "ally") && className) return "class:" + className;
  return recipeSlug || null;
}

// P1' gate (§4 step 9): window.Theater.wholeObject accessor (get/set), the exact pixelSkin A/B-
// toggle pattern — default TRUE (shipped-on), flippable at runtime for the capture-gate A/B and as
// a kill switch. Declared here (module scope) so both figureFor/setBoard's read and the public
// accessor at the bottom of this file share the single source of truth.
let WHOLE_OBJECT_ENABLED = true;

/* MODEL-PATH INSTRUMENTATION (Codex diagnosis rec #2, 2026-07-08 — "visual misses stop being a black
   box"). Every figure resolution tallies WHICH path built it: a bespoke model (exact), a NEAREST_SUB
   stand-in (alias), the unpainted meeple (blank), a PC/bestiary recipe, or the legacy archetype cuboid
   — plus loadFail (a real key whose builder wasn't loaded / geometry threw, the invisible failure that
   used to look like taste). `misses` keys the cuboid/loadFail cases by their render key so "why is THIS
   a cuboid" is answerable at a glance. Read-only diagnostics — nothing in product logic reads these;
   exposed on window.Theater.stats.modelPaths + window.Theater.modelPathReport(). */
const MODEL_PATH_STATS = { exact:0, alias:0, blank:0, glb:0, pcRecipe:0, recipe:0, cuboid:0, loadFail:0, sprite:0, misses:{} };
function _classifyWholeKey(wKey){
  if(!wKey) return null;
  if(wKey.indexOf("blank:") === 0) return "blank";
  if(WHOLE_OBJECT_REGISTRY[wKey]) return "exact";
  if(NEAREST_SUB[wKey]) return "alias";
  return "blank";   // resolveWholeObject's figure/prop floor returned the blank entry
}
function _tallyPath(bucket, key){
  MODEL_PATH_STATS[bucket] = (MODEL_PATH_STATS[bucket] || 0) + 1;
  if((bucket === "cuboid" || bucket === "loadFail") && key){
    MODEL_PATH_STATS.misses[key] = (MODEL_PATH_STATS.misses[key] || 0) + 1;
  }
}

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

// texture cache, keyed by sprite slug: undefined (never requested) | "pending" | "failed" | a loaded
// THREE.Texture. Exposed read/write on window.Theater._spriteTextureCache (bottom of this file) as a
// TEST-ONLY seam — dev/verify-theater-sprites.mjs pre-seeds a fake Texture here to exercise the
// cut-status render path without a real network/file image load (the spec's own "stub texture
// loader" instruction); nothing in product logic writes to this object from outside spriteTextureFor.
const SPRITE_TEXTURE_CACHE = {};

// GRAPHICS-ENGINE.md GR2 (dressing cards): texture cache keyed by dressing slug — either a
// synchronously-generated placeholder label-card CanvasTexture (art doesn't exist yet — DRESSING-GEN
// runs in the codex after this unit) or, once assets/dressing/<slug>.png resolves, the real loaded
// THREE.Texture swapped in in-place. Unlike SPRITE_TEXTURE_CACHE above, a cache MISS here never
// returns null — dressingTextureFor always returns a usable texture immediately (the placeholder),
// so a dressing card never silently fails to mount pending an async load; see dressingTextureFor's
// own header comment for the swap-on-load mechanics.
const DRESSING_TEXTURE_CACHE = {};

// join-key normalizer (docs/SPRITE-TRANSITION.md's own kebab discipline, loosened further for a
// forgiving join): lowercase, strip everything but [a-z0-9] so "Grinning Poppet" and a bestiary
// recipeSlug of "grinning-poppet" (or "grinningPoppet") normalize to the same key.
function normalizeSpriteKey(s){
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* T4.1 resolution: recipeSlug is already "the exact bestiary id" (wholeObjectKeyFor's own header
   comment) — join it against SPRITE_REGISTRY's `name` field (the manifest/registry's own join key
   per the spec's shared-data-shapes section, "cell name <-> realm-bestiary-draft.json creature name
   within the same realm"). Only a `status:"cut"` entry ever resolves here: a same-name entry that is
   still `status:"pending"` (not yet sliced) is a real miss for THIS function — it returns null and
   the caller falls through to the existing 3D chain untouched, exactly like a whole-object key that
   doesn't resolve. (The spec's fuller realm/type/size fallback tier is NOT implemented in this unit
   — see the T4 deviation note in the unit's own handoff; the exact-name/cut-only tier above is the
   one every RED-FIRST acceptance check in this unit's spec actually exercises.) */
function spriteEntryFor(recipeSlug){
  if(!recipeSlug || typeof SPRITE_REGISTRY === "undefined" || !SPRITE_REGISTRY) return null;
  const wantKey = normalizeSpriteKey(recipeSlug);
  if(!wantKey) return null;
  for(const regKey in SPRITE_REGISTRY){
    const e = SPRITE_REGISTRY[regKey];
    if(!e || !e.name || e.status !== "cut") continue;
    if(e.verdict === "fail") continue; // review-failed art never renders — falls through to the 3D chain
    if(normalizeSpriteKey(e.name) === wantKey) return Object.assign({ slug: regKey }, e);
  }
  return null; // no cut entry by that name — a pending-only match (or no match at all) falls through
}

// SPRITE-SIZE LADDER — deliberately its OWN table, not a reuse of sizeScaleFor's SIZE_SCALE above.
// SIZE_SCALE is a cosmetic in-game-readability tune (gargantuan/medium = 2.2x) for the cuboid/recipe
// figure family; a billboard plane instead bakes the SRD size CATEGORY's real space ratio (5ft
// Medium square vs. a 20ft Gargantuan footprint = 4 squares = 4x) so "a Gargantuan dragon sprite must
// visibly dwarf a Medium PC sprite" (the spec's own decision 4 wording) holds at the geometry level,
// not just a readability nudge — this is the ratio dev/verify-theater-sprites.mjs's check (c) proves.
const SPRITE_SIZE_SCALE = {
  tiny: 0.5, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4
};
function spriteSizeScaleFor(size){
  const s = (size || "medium").toLowerCase();
  return SPRITE_SIZE_SCALE[s] != null ? SPRITE_SIZE_SCALE[s] : 1;
}

/* Async texture fetch, mirroring the glb path's own "resolved now or fall through, pick it up on the
   next replay" convention (loadWholeObjectBuilders' onSettled callback, this file's module-scope call
   near the bottom): a cache miss kicks off THREE.TextureLoader.load and returns null immediately (this
   call's figure falls through to the 3D chain, exactly like a whole-object entry whose builder isn't
   loaded yet) — success nearest-filters the texture (no mipmap smear, matching the PS1/cutout look)
   and, if the theater is still mounted, replays S.lastUnits (same null-the-dirty-key-then-resend
   trick loadWholeObjectBuilders' callback uses) so the sprite appears on the very next render without
   the caller having to re-drive anything. A failed load caches "failed" — permanently falls through,
   never retried, never throws. */
function spriteTextureFor(slug){
  const cached = SPRITE_TEXTURE_CACHE[slug];
  if(cached && cached !== "pending" && cached !== "failed") return cached;
  if(cached === "pending" || cached === "failed") return null;
  SPRITE_TEXTURE_CACHE[slug] = "pending";
  textureLoader.load(
    "assets/sprites/" + slug + ".png",
    function(tex){
      // BEAUTY-WAVE-2 BW2-0: magFilter stays Nearest (crisp when magnified — the pixel-art law, a
      // creature sprite viewed close must show its authored texel grid, not smoothed mush). minFilter
      // becomes Linear (was Nearest) — a billboard plane shrinks as it recedes/rotates, and
      // Nearest-minification is what actually produced the "mode-7" shimmer/warp (nearest-picks a
      // single aliasing texel per screen pixel instead of blending the covered footprint); Linear
      // minification kills that without needing mipmaps (NPOT-safe — generateMipmaps stays false,
      // Linear minFilter doesn't require them, only NearestMipmap*/LinearMipmap* variants do).
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      SPRITE_TEXTURE_CACHE[slug] = tex;
      if(S.mounted && S.lastUnits){
        S.unitsKey = null; // force the dirty-key skip past, same trick as the glb-settle replay
        setUnits(S.lastUnits);
      }
      // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: an interior board's `pieces` are billboard sprites
      // too (interiorBuildPieces -> buildSpriteBillboard, same async-texture-not-loaded-yet miss this
      // callback exists to recover from) — S.lastUnits alone (above) never covers them, since pieces
      // mount via S.lastBoard/setInteriorBoard, a completely separate replay target. Same "null the
      // dirty key, replay" trick, gated to the interior3d board kind so a combat board's lastBoard is
      // never accidentally replayed through the wrong builder.
      if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d"){
        S.boardKey = null;
        setInteriorBoard(S.lastBoard);
      }
    },
    undefined,
    function(){ SPRITE_TEXTURE_CACHE[slug] = "failed"; }
  );
  return null;
}

/* Billboard construction (T4.2): a single THREE plane, textured, nearest-filtered, alpha-cutout (no
   blend-order fighting between overlapping sprites), sized from the SPRITE-SIZE LADDER above times
   GLB_TARGET_HEIGHT (the module-height convention this file already established for the glb path,
   L1173 — reused here rather than inventing a second height constant, since both paths bake an
   ABSOLUTE authored size into their own geometry the same way). Seated feet-at-0 (mesh.position.y =
   h/2 lifts the plane's own center up to half its height, matching every other figure's feet-on-the-
   base-disc convention) — the base disc ITSELF is untouched (setUnits' own math; see this unit's
   header note: this group carries no userData.wholeObject, so it falls through setUnits' EXISTING
   non-whole-object disc branch, unmodified by this unit). Y-axis-only billboarding to the camera is
   applied per render pass by updateSpriteBillboardYaw() (scheduleRender, below) rather than baked
   here — the group's OWN rotation.y is reset every dirty render, so it never drifts out of sync with
   whichever way setUnits/rotate() last left the camera. */
// BEAUTY-WAVE.md VP1: shared billboard-mesh construction, factored out of buildSpriteBillboard so
// the interior TRUE-SCALE path (interiorSpriteBillboard, below) can build a differently-proportioned
// (width != height, from the texture's own aspect) plane through the exact same material/shadow
// setup, rather than forking that logic a second time. w/h are already-final WORLD units; this
// function does no sizing math of its own.
// BW2-4b item 1 — LIT SPRITES debug seam: forces the OLD unlit MeshBasic path so the iterate-loop
// measurement harness can capture a full-bright REFERENCE frame (the 1.0 the BRIGHTNESS LAW measures
// every lit sprite as a ratio of) from the identical scene. No product caller sets it — toggled only
// by window.Theater.__setSpriteUnlitDebug (below), and a re-mount rebuilds sprites under the new flag.
let SPRITE_UNLIT_DEBUG = false;
// BW2-4b item 1 — REALM GRADE on the sprite floor: the emissive readability floor is tinted toward the
// current interior realm's grade (chrome cool, fantasy warm, gloom cold-violet) so a lit standee reads
// the realm even where no nearby torch reaches it (the mock's cool soldiers / warm knights). White (no
// tint) on the flat tabletop and any realm with no authored grade. setInteriorBoard sets it per board;
// setBoard resets it to white. A SUBTLE blend (ITR_SPRITE_TINT_STRENGTH) — never a saturated wash.
let ITR_SPRITE_EMISSIVE_TINT = 0xffffff;
const ITR_SPRITE_TINT_STRENGTH = 0.5;
function buildSpriteBillboardMesh(tex, w, h, slug){
  const geo = new THREE.PlaneGeometry(w, h);
  // BW2-4b item 1 — THE BRIGHTNESS LAW (see ITR_SCENE_KEY/ITR_SPRITE_EMISSIVE_FLOOR): the billboard is
  // now LIT — a MeshLambertMaterial that RECEIVES the interior hemisphere key + torch PointLights +
  // the realm-graded ambient, so a sprite beside a torch reads warmer/brighter than the same sprite in
  // a dark corner (the HD-2D integration trick). SPRITE PURITY holds: this is a LIGHTING response only,
  // zero geometric/texel distortion (no dither, no vertex-snap — it still never routes through
  // applyPsxShaderTweaks). emissiveMap = the sprite's own texture at ITR_SPRITE_EMISSIVE_FLOOR gives an
  // albedo-scaled readability floor so a dark-art creature never crushes to unreadable black, WITHOUT
  // ever reading as day-lit (emissive is a fixed dim self-illumination, not a light). receiveShadow
  // stays OFF (U3 ruling: a cast shadow smeared across a flat cutout reads as a bug). The debug flag
  // (SPRITE_UNLIT_DEBUG) restores the old full-bright MeshBasic for the measurement reference capture.
  const mat = SPRITE_UNLIT_DEBUG
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: ITR_SPRITE_EMISSIVE_TINT, emissiveIntensity: ITR_SPRITE_EMISSIVE_FLOOR,
        transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true
      });
  // DUNGEON-GRAPH.md U3 iteration-2, SPRITE PURITY ruling (Adam 2026-07-10 evening): billboards must
  // carry ZERO PS1 distortion (no dither, no vertex-snap) — a flat-cut 2D sprite reads as a sticker
  // the moment its texel grid wobbles or dithers, unlike a real low-poly mesh where those tricks read
  // as "in-world" texture grain. This material deliberately never routes through applyPsxShaderTweaks
  // (contrast wholeObjectMaterialsFor/figureMaterialFor/interiorBuildInstancedMesh, which all do).
  // userData.psxExempt is a TESTABILITY flag only (no runtime behavior reads it) — dev/verify-dungeon-
  // interior.mjs's sprite-purity check asserts it's set (billboards) vs. absent+psxApplied set (walls).
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2 (real light sources + cast shadows, interiors only):
  // a billboard CASTS a shadow (so creature silhouettes fall on the interior floor) via a dedicated
  // alpha-tested depth material (a plain opaque depth pass would cast a solid SQUARE shadow off the
  // plane's full quad, not the sprite's actual cutout silhouette) but never RECEIVES one (a receiving
  // billboard would show other casters' shadows smeared across its own flat alpha-cutout face, which
  // reads as a lighting bug, not grounding). Harmless when renderer.shadowMap.enabled is false (the
  // combat/tabletop path, §2's untouched "no shadow maps" ruling) — shadowMap being globally off means
  // these per-mesh flags are simply never consulted there.
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    map: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking
  });
  const g = new THREE.Group();
  // BW2-2b item 1 (FLOOR-ALIGNED BASES — "the bug"): the sprite mesh lives in its OWN inner wrapper,
  // built EAGERLY here (not lazily on first verb, standee-verbs.js's pre-BW2-2b ensureWrap convention)
  // so camera-pitch tilt has somewhere to go that ISN'T this outer group `g` the moment a standee
  // mounts — before this fix, updateSpriteBillboardYaw stamped `fig.rotation.x = tilt` straight onto
  // `g`, and BW2-2's plinth base (added later as a plain CHILD of `g` — buildInteriorBase's own header)
  // inherited that tilt with it, reading as a coin propped up on edge instead of a flat mini base. Now
  // only `wrap` (holding just `mesh`) gets the camera tilt (see updateSpriteBillboardYaw below); a
  // base/ring mounted as a SIBLING of `wrap` directly on `g` (interiorBuildPieces/setUnits,
  // setActingUnit) stays floor-flat under `g`'s own yaw-only rotation. `g.userData.standeeWrap` is the
  // SAME identity key standee-verbs.js's runKeyframeVerb reads/writes — see that file's own updated
  // COMPOSITION CONTRACT header for the other half of this split (verb-tilt, e.g. fall-death, now
  // writes `g.rotation.x` directly instead, freed by camera-tilt vacating that field).
  const wrap = new THREE.Group();
  wrap.add(mesh);
  g.add(wrap);
  g.userData.sprite = true;
  g.userData.spriteSlug = slug;
  g.userData.spriteBillboardMesh = mesh; // updateSpriteBillboardYaw's per-frame Y-facing target
  g.userData.standeeWrap = wrap;
  return g;
}

function buildSpriteBillboard(entry){
  const tex = spriteTextureFor(entry.slug);
  if(!tex) return null; // not loaded yet / failed load -> caller falls through, never rejects
  // entry.scale = the per-slug heads-line-up calibration from the sprite-review overlay
  // (dev/sprite-review.py -> sprite-tags-overlay.json -> gen-sprite-registry.py) — crops vary
  // in headroom/tightness, so the size ladder alone can't make same-size creatures read the
  // same height.
  const calib = (typeof entry.scale === "number" && entry.scale > 0) ? entry.scale : 1;
  // DUNGEON-GRAPH.md law 1 (TRUE-SCALE RENDER LAW): scaleVsHuman (feet/5.5, the real progression-payoff
  // ratio) wins over the SRD size-CATEGORY ladder (spriteSizeScaleFor) whenever it's present — on either
  // the registry entry itself (once data/sprite-registry.js's corpus-sizing fold lands, HANDOFF item 2)
  // or passed straight through on the board piece data (`entry.scaleVsHuman`, a caller-supplied override
  // — no registry edit required to exercise true scale today). Absent on both -> the old compressed
  // SRD-category ladder, byte-identical to before this law (the "legacy fallback view only" clause).
  // NOTE (BEAUTY-WAVE.md VP1 OUT OF SCOPE): this is the TABLETOP convention, deliberately untouched —
  // interior pieces route through interiorSpriteBillboard below, its own TRUE-SCALE sizing.
  const sizeMultiplier = (typeof entry.scaleVsHuman === "number" && entry.scaleVsHuman > 0)
    ? entry.scaleVsHuman
    : spriteSizeScaleFor(entry.size);
  const h = sizeMultiplier * GLB_TARGET_HEIGHT * calib;
  return buildSpriteBillboardMesh(tex, h, h, entry.slug); // square plane; the sprite's own alpha silhouette reads the real shape
}

// BEAUTY-WAVE.md VP1 (the kaiju-scale-bug fix): interior pieces are TRUE-SCALE (cellSize: 1 world
// unit = 5ft, DUNGEON-GRAPH.md law 1), NOT the tabletop's render-height-multiplier convention above
// — a medium creature must stand ~1.1 world units tall in a room, not several. Height comes from
// entry.scaleTrue (the registry fold, feet/5.5) or a caller-supplied scaleVsHuman override, falling
// back to 1.0 (an undressed human) when neither is present. Width is derived from the loaded
// texture's own pixel aspect ratio (a sprite crop is rarely square) rather than the tabletop's
// baked square plane. Returns {group, height} so interiorBuildPieces can floor-offset + wall-clamp
// without re-deriving the height.
function interiorSpriteBillboard(entry, wallHeightCap){
  const tex = spriteTextureFor(entry.slug);
  if(!tex) return null; // not loaded yet / failed load -> caller falls through, never rejects
  const scaleTrue = (typeof entry.scaleTrue === "number" && entry.scaleTrue > 0)
    ? entry.scaleTrue
    : (typeof entry.scaleVsHuman === "number" && entry.scaleVsHuman > 0)
      ? entry.scaleVsHuman
      : 1.0;
  let h = HUMAN_TRUE_HEIGHT * scaleTrue;
  let oversizeClamped = false;
  // Cap render height at the room's wall height * 0.95 (a titanic in a human room is a SCALE-DOMAIN
  // problem — DUNGEON-GRAPH.md's scale-domain law — not something this renderer should paper over by
  // clipping through the ceiling).
  if(typeof wallHeightCap === "number" && wallHeightCap > 0 && h > wallHeightCap){
    h = wallHeightCap;
    oversizeClamped = true;
  }
  const img = tex.image;
  const aspect = (img && img.width && img.height) ? (img.width / img.height) : 1;
  const w = h * aspect;
  const g = buildSpriteBillboardMesh(tex, w, h, entry.slug);
  if(oversizeClamped){
    console.warn("qa: oversize-clamped", entry.slug, "-> capped at wall height", wallHeightCap);
  }
  return { group: g, height: h, width: w };
}

// BEAUTY-WAVE.md VP1b (combat-standee true scale, follow-up to VP1): `interiorMode`/`wallHeightCap`
// are additive optional params — every existing caller (refFigure.build, and setUnits when the
// mounted board is the flat tabletop) omits them, so this degrades to the byte-identical tabletop
// buildSpriteBillboard call below. setUnits passes both ONLY when S.lastBoard.kind === "interior3d"
// (the same discriminator setInteriorBoard/setBoard already establish) — combat foes standing in a
// dungeon room then size through interiorSpriteBillboard's TRUE-SCALE math (HUMAN_TRUE_HEIGHT x
// scaleTrue, the SAME function VP1 wired for non-combat interior pieces) instead of inheriting the
// tabletop's render-height-multiplier convention (the kaiju bug this unit fixes).
function figureFor(archetype, seed, tint, silhouette, weapon, recipeSlug, pcRecipe, kind, className, wholeKeyOverride, interiorMode, wallHeightCap){
  // SPRITE-TRANSITION T4: the sprite-billboard channel resolves AHEAD of the whole-object/glb/recipe/
  // cuboid chain below (docs/SPRITE-TRANSITION.md T4.1) — creature-kind pieces only (a pc/ally keys
  // off its CLASS, not a bestiary name, so it has no sprite-registry join key at all and always skips
  // straight past this branch, same as it always skipped the bestiary recipeSlug lookup further down).
  // Every guard here falls through rather than throwing/rendering blank: gate off, no registry loaded,
  // no name match, a pending (not-yet-cut) match, or a texture that hasn't loaded yet all reach the
  // SAME existing chain this file already had.
  if(SPRITE_CHANNEL_ENABLED && kind !== "pc" && kind !== "ally"){
    const sEntry = spriteEntryFor(recipeSlug);
    if(sEntry){
      if(interiorMode){
        // VP1b: reuse interiorSpriteBillboard/buildSpriteBillboardMesh — never a second sizing formula.
        const built = interiorSpriteBillboard(sEntry, wallHeightCap);
        if(built){
          const g = built.group;
          g.userData.interiorTrueScale = true;
          g.userData.interiorHeight = built.height;
          // BW2-2: the base plinth's radius formula (0.42 x rendered width) needs the sprite's own
          // rendered WORLD width, not just its height — interiorSpriteBillboard already derives it
          // (aspect-scaled off the loaded texture), so stash it alongside interiorHeight rather than
          // re-deriving a second width formula at the setUnits call site.
          g.userData.interiorWidth = built.width;
          g.userData.interiorFloorFrac = (typeof sEntry.floor === "number") ? sEntry.floor : 0;
          _tallyPath("sprite", sEntry.slug);
          return g;
        }
      } else {
        const sg = buildSpriteBillboard(sEntry);
        if(sg){ _tallyPath("sprite", sEntry.slug); return sg; }
      }
    }
  }
  // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 5): resolved BEFORE the pcRecipe branch — the
  // roster-supersession clause (§8 decision 4: "cuboids demote to auto-fallback... never deleted").
  // Guards, in order, EVERY ONE falling through to the EXISTING chain below (pcRecipe -> bestiary
  // recipe -> archetype cuboid) rather than throwing or rendering blank:
  //   - gate off (WHOLE_OBJECT_ENABLED false)              -> skip
  //   - no resolvable key / no registry (+ NEAREST_SUB) hit -> skip (resolveWholeObject returns null)
  //   - builder not yet loaded / its import failed          -> skip (entry.build is not a function)
  //   - geometry build throws                               -> skip (wholeObjectGeometryFor's own
  //                                                             try/catch returns null, evicting any
  //                                                             stale cache entry for that key)
  // A resolved figure gets rotation.y = WHOLE_OBJECT_YAW unconditionally (§3-D3 — BASE_ORIENT_YAW
  // never applies on this path; every module is authored facing +z already).
  if(WHOLE_OBJECT_ENABLED){
    // BATTLE-THEATER T2: an explicit wholeKeyOverride (the reference-shelf / prove-load path,
    // window.Theater.refFigure.build({wholeKey})) forces a specific registry key straight onto the
    // whole-object build path, bypassing wholeObjectKeyFor's kind/class/recipe derivation — the only
    // way to reach a glb test entry that is deliberately not wired to any live unit's key. A falsy
    // override falls back to the normal derivation, so every existing caller is byte-unchanged.
    const wKey = wholeKeyOverride || wholeObjectKeyFor(kind, className, recipeSlug);
    // TABLETOP-UNITS.md §U3: a figure request never comes up empty at the resolveWholeObject step —
    // pieceKind:"figure" routes a genuine miss to "blank:figure" instead of null (the unpainted
    // meeple). The cuboid fallback below is reached ONLY if the resolved entry's builder isn't
    // loaded yet / its geometry build throws (the load-failure path — see resolveWholeObject's own
    // header comment for the full chain).
    // Guarded on wKey truthy (unchanged from before this unit): a unit with NO whole-object key at
    // all (pc/ally with no className, foe with no recipeSlug) is a different situation than "a key
    // that fails to resolve" — it correctly falls through to the pcRecipe/bestiary-recipe/archetype
    // chain below, same as always. The blank-piece guarantee applies once we DO have a key to ask
    // the registry about and it comes back empty.
    const wEntry = wKey && resolveWholeObject(wKey, "figure");
    // BATTLE-THEATER T2: a glb-backed entry (carries `.glb`, no `.build`) takes the GLTFLoader path —
    // its parsed scene (populated on `.glbScene` by loadWholeObjectBuilders) is baked into the SAME
    // whole-object geometry/material shape as a probe-lib figure, wrapped/seated/yawed identically, and
    // tallied as its own "glb" resolution. glb and module entries are mutually exclusive (an entry is
    // one or the other), so this is a peer branch to the module path, not a reorder of it. A glb entry
    // whose scene hasn't loaded yet / whose bake fails falls through to the shared loadFail tally below.
    if(wEntry && wEntry.glb && wEntry.glbScene){
      const geo = wholeObjectGeometryForGlb(wKey, wEntry);
      if(geo){
        const mats = wholeObjectMaterialsFor(wEntry);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geo, mats));
        g.rotation.y = WHOLE_OBJECT_YAW;
        g.userData.wholeObject = true;
        g.userData.wholeObjectKey = wKey;
        g.userData.wholeObjectDiscR = wEntry.discR;
        _tallyPath("glb", wKey);
        return g;
      }
    } else if(wEntry && typeof wEntry.build === "function"){
      const geo = wholeObjectGeometryFor(wKey, false, "figure");
      if(geo){
        const mats = wholeObjectMaterialsFor(wEntry);
        const mesh = new THREE.Mesh(geo, mats);
        const g = new THREE.Group();
        g.add(mesh);
        g.rotation.y = WHOLE_OBJECT_YAW;
        g.userData.wholeObject = true;
        g.userData.wholeObjectKey = wKey;
        g.userData.wholeObjectDiscR = wEntry.discR;
        _tallyPath(_classifyWholeKey(wKey), wKey);
        return g;
      }
    }
    // a resolved entry we couldn't BUILD (builder not loaded yet / geometry threw) — the invisible
    // failure. Record it (it still falls through to the recipe/cuboid chain below, which tallies the
    // path actually taken; this is the separate "would-have-been-a-model" signal).
    if(wKey && wEntry) _tallyPath("loadFail", wKey);
  }
  // MODEL-GRAMMAR G2: a unit carrying a resolvable recipeSlug renders recipe-driven (§9
  // Decision 1: recipes may improve on the fixed archetypes — new weapon/armor modules from
  // actual bestiary fields — but never worse: recipeFor's own null-fallthrough plus this
  // function's existing archetype-builder fallback together guarantee SOME figure always
  // renders, recipe-driven or not). Silhouette/weapon (PC/ally class-driven / foe keyword-
  // scan) are ONLY meaningful to the fixed archetype builders (buildBiped's silhouette
  // branches, weaponMeshFor) — a recipe-driven figure ignores them entirely, since its own
  // modules[] already encode weapon/armor from the bestiary's real fields, a strictly richer
  // source than the name/action-text keyword scan those params come from.
  // MODEL-GRAMMAR G3 §2 (the loadout mirror): a unit carrying `pcRecipe` (theaterUnitsFrom's live
  // sheet.equipped derivation, PC/ally only) takes precedence over BOTH the bestiary recipeSlug
  // path and the archetype fallback — pcRecipe already IS a full §3 recipe shape
  // (buildFigureFromRecipe's own input), so this is just one more entry in the same precedence
  // chain (pcRecipe > bestiary recipe > archetype), not a new code path. A foe never carries
  // pcRecipe (theaterUnitsFrom only stamps it on pc/ally units), so this branch is a pure no-op
  // for every foe figure.
  if(pcRecipe){ _tallyPath("pcRecipe", null); return buildFigureFromRecipe(pcRecipe, tint, kind); }
  const recipe = recipeFor(recipeSlug);
  if(recipe){ _tallyPath("recipe", recipeSlug); return buildFigureFromRecipe(recipe, tint, kind); }
  // the legacy archetype-builder path — a genuine cuboid (§U3: reached only when there is NO whole-
  // object key, NO recipe; instrumented so this stops being invisible). `wKey||("kind:"+kind)` names
  // the miss so the debug report says WHAT couldn't resolve (a foe recipeSlug, a keyless npc, etc.).
  _tallyPath("cuboid", wholeObjectKeyFor(kind, className, recipeSlug) || ("kind:" + kind));
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  const g = build(seed, tint, silhouette, weapon);
  // UNIT 0 (L16): the legacy archetype-builder fallback (no recipe) turns to the SAME convention as
  // the recipe path — a legacy quadruped/arachnid/serpent presents its broadside profile too, so a
  // bestiary creature with a recipe and one without face the same way (the recipe path sets this yaw
  // inside buildFigureFromRecipe; this is the matching set for the no-recipe path). orientYawForArchetype
  // resolves the archetype -> base -> yaw, so both paths read the identical BASE_ORIENT_YAW value.
  if(g) g.rotation.y = orientYawForArchetype(archetype);
  return g;
}

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
    const sy = (typeof inst.sy === "number" && inst.sy > 0) ? inst.sy : ITR_FLOOR_HEIGHT_FALLBACK;
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

// BW2-2 — STANDEE BASES: a low plinth cylinder under every interior standee (piece + combat unit),
// seated flush on the floor top the law above derives. Realm trim color (kit.trimColor — the SAME
// flat trim the doorframe/pillar instances already use, GR1's palette anchor), darkened for the side
// wall, lightened for the top face (a real "lit from above" plinth read, not a flat tinted disc — per
// the mock, ui-sketches/mock-frames/mock-01-gloom-combat.png, whose plinths read as physical stone/wood
// under both the acting and idle standee). Geometry cache-keyed by rounded radius (most true-scale
// creatures share a handful of footprints); materials cache-keyed by the realm's own trim hex (one kit
// per mounted board, so this cache never grows past a handful of entries per session).
const INTERIOR_BASE_HEIGHT = 0.09;                 // BW2-2b item 2: 0.04 -> ~0.09 ("a real plinth, per the mock read")
// BW2-4b item 3 — base radius as a fraction of the standee's rendered width. Was 0.42; reduced ~15%
// to 0.36 so adjacent bases in a tight melee huddle stop fusing into one big pale pad (the huddle-blob).
const INTERIOR_BASE_RADIUS_FRAC = 0.36;
const INTERIOR_BASE_Y_OFFSET = 0.006;              // clears the contact pool's own +0.003 (below) — never z-fights it
// BW2-2b item 3 (TURN GLOW) — the accent gold every acting standee's ring already uses (ACTING_RING_MAT,
// below); the base's own top/side materials swap TOWARD this on emissive when a standee is acting, so
// ring + glowing plinth read "your turn" together, diegetically.
const BASE_GLOW_EMISSIVE_HEX = 0xd4af6e;
const INTERIOR_BASE_GEO_CACHE = {};
function interiorBaseGeoFor(radius){
  const key = radius.toFixed(3);
  if(!INTERIOR_BASE_GEO_CACHE[key]) INTERIOR_BASE_GEO_CACHE[key] = new THREE.CylinderGeometry(radius, radius, INTERIOR_BASE_HEIGHT, 16);
  return INTERIOR_BASE_GEO_CACHE[key];
}
const INTERIOR_BASE_MAT_CACHE = {};
function interiorBaseMaterialsFor(trimHex){
  const key = trimHex || "#8a8478";
  if(INTERIOR_BASE_MAT_CACHE[key]) return INTERIOR_BASE_MAT_CACHE[key];
  const c = hexToRGB(key);
  // BW2-4b item 3 — BASE TINT: bases were pale lily-pads (side x0.55 / top x1.4 off the bright trim
  // accent read as lit stone in noon light). Darkened to realm-trim STONE per the gloom mock — dark
  // sides, a subtly lighter (not bright) top — so a base reads as shadowed ground, and adjacent bases
  // fusing in a melee huddle read as one dark shadow-blob rather than a pale pad. Now that sprites +
  // bases are both LIT and the interior key is a whisper, these multipliers are the base's whole value.
  const sideRGB = scaleRGB(c, 0.30);
  const topRGB = scaleRGB(c, 0.62);
  const side = new THREE.MeshLambertMaterial({ color: rgbToHex(sideRGB.r, sideRGB.g, sideRGB.b) });
  const top = new THREE.MeshLambertMaterial({ color: rgbToHex(topRGB.r, topRGB.g, topRGB.b) });
  // CylinderGeometry material groups: [0]=side wall, [1]=top cap, [2]=bottom cap — bottom reuses the
  // darker side tone (flush against the floor, never actually visible from any playable camera angle).
  const mats = [side, top, side];
  INTERIOR_BASE_MAT_CACHE[key] = mats;
  return mats;
}
// interiorStandeeContactY: the world Y a standee's own feet-line (its group's local y=0 —
// buildSpriteBillboardMesh's bottom-anchored convention) must sit at so the sprite reads as STANDING ON
// its own base's TOP FACE, not the raw floor. A registry floorFrac (a flying/floating creature's
// ground-contact fraction) still applies ON TOP of this exactly as it did pre-BW2-2 — it now lifts
// further above the base top instead of the bare -0.5 plane, same relative behavior, corrected origin.
function interiorStandeeContactY(floorTop){
  return floorTop + INTERIOR_BASE_Y_OFFSET + INTERIOR_BASE_HEIGHT;
}
// buildInteriorBase — one plinth mesh. Added as a CHILD of the standee's own figure group (never a
// sibling blob-group entry, and — BW2-2b item 1 — never a child of that group's own inner sprite wrap
// either, see buildSpriteBillboardMesh's own header) so BW2-2's item 4 ("the whole miniature-with-base
// tips as one") holds WITHOUT any reparenting trick: standee-verbs.js's fall-death now tips the OUTER
// group's own rotation.x directly (freed by camera-tilt moving to the inner wrap — see
// updateSpriteBillboardYaw), and a base mounted here as a plain sibling child of that same outer group
// rides along automatically, exactly like a real miniature-with-base tipping as one rigid piece. The
// blob/pool stays in its own untouched sibling group (added to S.shadowGroup/blobGroup directly, never
// to this figure), exactly per spec item 4's "the blob stays put." Local position is fixed regardless
// of floorFrac — the group's own world Y already carries the full contact-line math
// (interiorStandeeContactY minus floorFrac*height, at the call sites below), so the base's local origin
// is always "flush under local y=0": the group's local y=0 IS the base's own top face, which is also
// exactly where a floorFrac=0 sprite's own bottom edge sits (buildSpriteBillboardMesh's
// mesh.position.y=h/2 convention) — one shared local reference point, no separate bookkeeping.
function buildInteriorBase(radius, trimHex){
  const geo = interiorBaseGeoFor(Math.max(0.05, radius || 0.3));
  // BW2-2b item 3 (TURN GLOW): the cache above (interiorBaseMaterialsFor) deliberately shares ONE
  // material set per realm trim color across every standee mounted from the same board — cheap, and
  // correct for a static plinth tint. Turning a SINGLE acting standee's base gold via that shared
  // object would light up every OTHER standee sharing the same trim color too. Clone once per base
  // mesh here so setActingUnit's glow toggle only ever touches THIS standee's own materials.
  const mats = interiorBaseMaterialsFor(trimHex).map((m) => m.clone());
  const mesh = new THREE.Mesh(geo, mats);
  mesh.position.set(0, -INTERIOR_BASE_HEIGHT / 2, 0);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.userData.standeeBase = true; // verify-bw2-2's per-standee base-count check
  return mesh;
}
// setBaseGlow(mesh, glowing) — BW2-2b item 3: toggles the acting-standee "your turn" plinth glow by
// writing straight to each of the base's own (per-instance-cloned, see buildInteriorBase above)
// materials' `emissive` channel — MeshLambertMaterial supports emissive self-illumination but has no
// `emissiveIntensity` knob (that's a MeshStandardMaterial-only field), so a flat on/off hex swap is the
// whole mechanism; combined with the existing gold acting ring (ACTING_RING_MAT) this reads as "ring +
// glowing plinth together" per the spec. Null-safe (a non-interior figure has no base mesh at all).
function setBaseGlow(mesh, glowing){
  if(!mesh || !mesh.material) return;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => { if(m && m.emissive) m.emissive.setHex(glowing ? BASE_GLOW_EMISSIVE_HEX : 0x000000); });
}

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

// BW2-2 ADDENDUM (Adam, mid-flight review — "the contact shadow... really sells the illusion"): the
// contact pool is now a SOFT RADIAL GRADIENT quad (dark center feathering to fully transparent at the
// rim), replacing VP7's flat hard-edged disc — matches the mock's shadow hugging the acting knight's
// base. ONE shared gradient CanvasTexture (never a per-standee canvas — the gradient SHAPE is identical
// everywhere; only the quad's own world-space SCALE differs per standee footprint), linear-filtered
// (SPRITE PURITY's nearest-only rule guards CHARACTER pixels — buildSpriteBillboardMesh's own header
// comment names the exemption for exactly this kind of non-character ground shadow/blob quad — a
// smooth gradient with visible texel edges would read as a rendering bug, not a soft shadow).
let INTERIOR_POOL_TEXTURE = null;
function interiorPoolTexture(){
  if(INTERIOR_POOL_TEXTURE) return INTERIOR_POOL_TEXTURE;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  // total-function discipline (every other texture builder in this file — interiorMaterialTexture,
  // dressingPlaceholderTexture — degrades cleanly rather than throwing): a jsdom harness with no native
  // `canvas` npm package installed returns ctx===null (a real browser/Chrome, the only place this ever
  // actually renders, always resolves a working 2D context) — skip the paint rather than crash, and
  // hand back an untextured (but still valid) CanvasTexture so interiorBuildPieces/setUnits' pool-mount
  // call sites never need their own null-guard.
  const ctx = canvas.getContext && canvas.getContext("2d");
  if(ctx && typeof ctx.createRadialGradient === "function"){
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  // BW2-2b item 5a (CONTACT AO, INTENSIFIED): core opacity 0.5 -> ~0.7, TIGHT to the plinth rim — Adam's
  // read: "the mock's subtle drop shadow on the figurine base reads MORE than ours." The core now stays
  // dense out to a slightly SMALLER fraction of the pool's total radius (0.55 vs the old 0.62) so the
  // darkest band hugs the base rim more closely before it starts feathering, matching the mock's tighter
  // shadow silhouette rather than a broad soft wash.
  grad.addColorStop(0, "rgba(0,0,0,0.7)");     // dense core at the base contact line (BW2-2b: 0.5 -> ~0.7)
  grad.addColorStop(0.55, "rgba(0,0,0,0.6)");  // core stays dense out to just past the base's OWN radius (tighter than BW2-2's 0.62)
  grad.addColorStop(1, "rgba(0,0,0,0)");       // feathers fully transparent at the rim
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // deliberately NOT nearestify() — SPRITE PURITY's carve-out for non-character ground shadows
  INTERIOR_POOL_TEXTURE = tex;
  return tex;
}
const INTERIOR_POOL_GEO_CACHE = {};
function interiorPoolGeoFor(radius){
  const key = radius.toFixed(3);
  if(!INTERIOR_POOL_GEO_CACHE[key]) INTERIOR_POOL_GEO_CACHE[key] = new THREE.PlaneGeometry(radius * 2, radius * 2);
  return INTERIOR_POOL_GEO_CACHE[key];
}
let INTERIOR_POOL_MAT = null;
function interiorPoolMaterial(){
  if(!INTERIOR_POOL_MAT){
    INTERIOR_POOL_MAT = new THREE.MeshBasicMaterial({
      map: interiorPoolTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
  }
  return INTERIOR_POOL_MAT;
}
// BEAUTY-WAVE.md VP7 (CONTACT GROUNDING), BW2-2-upgraded: interior pieces + combat units + large
// dressing cards get one soft contact pool each (reuse, don't reinvent). `texWidth` is the standee/
// card's own rendered world-space width (radius = texWidth*0.4, unchanged from VP7 — a hair under half
// its footprint); the POOL itself extends further per the addendum ("feather extends ~1.6x the base
// radius"). `floorTop` (BW2-2) replaces the old hardcoded y=-0.495 — the pool now seats a hair above
// THIS cell's own real floor surface (never the bare -0.5 plane), below every base's own +INTERIOR_BASE_Y_OFFSET
// so the two never z-fight.
const INTERIOR_POOL_Y_OFFSET = 0.003;
function addInteriorContactBlob(group, x, z, texWidth, floorTop){
  if(!group) return null;
  const footprint = Math.max(0.05, (texWidth || 1) * 0.4);
  const poolRadius = footprint * 1.6;
  const mesh = new THREE.Mesh(interiorPoolGeoFor(poolRadius), interiorPoolMaterial());
  mesh.rotation.x = -Math.PI / 2;
  const y = (typeof floorTop === "number" ? floorTop : ITR_FLOOR_BASE_Y + ITR_FLOOR_HEIGHT_FALLBACK) + INTERIOR_POOL_Y_OFFSET;
  mesh.position.set(x, y, z);
  mesh.userData.contactBlob = true; // verify-dungeon-interior's per-piece blob-count check
  group.add(mesh);
  return mesh;
}

// BEAUTY-WAVE.md VP6 item 4 — VISIBLE HISTORY (render half). data.decals mirrors data.dressing/
// data.pieces (a plain field the caller sets directly on the board object, sourced from
// src/world/prep.js's spatialDecalsForSeg(pn, segNum) — the PERSIST half lives there, not here; this
// function only renders whatever decal records that call already returned). Each entry
// {x,y,kind,roomSegNum} — kind in {blood,scorch,impact,dust} — reuses the SAME flat-ground-quad
// convention the cover-patch channel established (theater-interior.js's itrCoverCardFor/proceduralSplat
// seam, VP3 item 3): a colored CircleGeometry card laid flat at the floor plane, no real art needed (the
// spec's own "VP3's cover channel" instruction — reuse the render idiom, not a new mechanism). No
// dedicated decal art has landed (assets/dressing has no per-decal slugs), so every decal is currently
// the procedural tint card — the seam is here (kindColor) the moment real decal art wants to join it.
const DECAL_KIND_COLOR = {
  blood: 0x6e1414, scorch: 0x2a2018, impact: 0x8a8478, dust: 0xcfc9a8
};
const DECAL_GEO_CACHE = {};
function decalGeoFor(radius){
  const key = radius.toFixed(3);
  if(!DECAL_GEO_CACHE[key]) DECAL_GEO_CACHE[key] = new THREE.CircleGeometry(radius, 10);
  return DECAL_GEO_CACHE[key];
}
const INTERIOR_DECAL_Y_OFFSET = 0.010; // BW2-2: relative to THIS cell's own floor top (interiorFloorTopAt), not the bare -0.5 plane — clears the contact-pool layer's own +0.003 offset
function interiorBuildDecals(decals, cx, cz, floorTopMap){
  const group = new THREE.Group();
  (decals || []).forEach((d) => {
    const color = DECAL_KIND_COLOR[d.kind] || DECAL_KIND_COLOR.impact;
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(decalGeoFor(0.32), mat);
    mesh.rotation.x = -Math.PI / 2;
    // BW2-2: a hair above THIS cell's own real floor top (interiorFloorTopAt), never the bare -0.5
    // plane the pre-BW2-2 hardcode assumed — visible history reads ON the actual floor surface, still
    // above the contact-pool layer so the two never fight for the same plane.
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    mesh.position.set((d.x || 0) - (cx || 0), floorTop + INTERIOR_DECAL_Y_OFFSET, (d.y || 0) - (cz || 0));
    mesh.userData.decalKind = d.kind || "impact";
    group.add(mesh);
  });
  return group;
}

/* BEAUTY-WAVE.md VP6 item 5 — HIT-EFFECTS SEAM. hit-damage/fall-death (act-cast stays out of scope for
   THIS unit's production wiring — see below) spawn an effect card at the target: real effects-core art
   the moment it lands (effectCardFor's own async cache-with-placeholder-replay convention, same idiom
   as dressingTextureFor/dressingPlaceholderTexture just above) OR a procedural flash-ring quad standing
   in behind the SAME seam while no art has landed yet (`effectCardFor(name) || proceduralRing`, the
   spec's own literal words). Oversized 1.5-2x at the target per GRAPHICS-ENGINE §B. Lives in S.fxGroup
   (already swept every board swap by clearGroup(S.fxGroup) in setInteriorBoard/retire — zero new
   cleanup bookkeeping needed) and expires via a normal S.tweens entry (the SAME tween array
   buildTheaterCtx/tickTweens already drain every frame) fading opacity to 0 over EFFECT_CARD_DUR ms,
   then removing + disposing itself — "assert spawn+expiry" per the spec's own verify line. */
const EFFECT_CARD_DUR = 420;
const EFFECT_RING_GEO_CACHE = {};
function effectRingGeoFor(radius){
  const key = radius.toFixed(3);
  if(!EFFECT_RING_GEO_CACHE[key]) EFFECT_RING_GEO_CACHE[key] = new THREE.RingGeometry(radius * 0.55, radius, 20);
  return EFFECT_RING_GEO_CACHE[key];
}
const EFFECT_PROC_COLOR = { "hit-damage": 0xff5040, "fall-death": 0x8a8478, "act-cast": 0x8a6bff };
// effectCardFor(name) — real effects-core art seam (VP2's fold, GR2 §D-adjacent convention): tries
// assets/dressing/effect-<name>.png via the SAME async TextureLoader-with-cache pattern as
// dressingTextureFor, but returns null (not a placeholder) synchronously until a real texture resolves —
// an absent effect texture is the documented `|| proceduralRing` fallback below, never a labeled
// placeholder card (a placeholder reads as "art is coming"; a procedural ring reads as "this IS the
// effect, art will refine it later" — the correct fallback register for a combat-feedback flash).
function effectCardFor(name){
  if(!S.effectTexCache) S.effectTexCache = {};
  const key = "effect:" + name;
  if(!(key in S.effectTexCache)){
    S.effectTexCache[key] = null; // pending
    textureLoader.load(
      "assets/dressing/effect-" + name + ".png",
      (tex) => { nearestify(tex); S.effectTexCache[key] = tex; },
      undefined,
      () => { S.effectTexCache[key] = false; } // confirmed missing — never retried
    );
  }
  const cached = S.effectTexCache[key];
  return cached ? cached : null;
}
function spawnEffectCard(name, x, y, z, oversize){
  if(!S.fxGroup) return null;
  const size = 1 * (oversize || 1.7); // "oversized 1.5-2x" — 1.7 is the seam's own default midpoint
  const tex = effectCardFor(name);
  const color = EFFECT_PROC_COLOR[name] || 0xffffff;
  const mat = new THREE.MeshBasicMaterial({
    map: tex || null, color: tex ? 0xffffff : color, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const geo = tex ? new THREE.PlaneGeometry(size, size) : effectRingGeoFor(size * 0.5);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData.effectCard = name;
  S.fxGroup.add(mesh);
  const baseOpacity = mat.opacity;
  S.tweens.push({
    start: Date.now(), dur: EFFECT_CARD_DUR,
    update(t){ mat.opacity = baseOpacity * (1 - t); },
    onDone(){
      if(mesh.parent) mesh.parent.remove(mesh);
      if(mat.dispose) mat.dispose();
      if(geo && geo.dispose && !tex) { /* cached ring geo — never dispose the shared cache entry */ }
    }
  });
  startTweenLoop();
  return mesh;
}

/* BEAUTY-WAVE VP5 item 2 — diegetic selection: "the acting unit's chip highlights AND its standee
   gets a ground-ring glow (reuse the blob-quad channel, accent color)." Same convention as
   addGroundingBlob just above (a flat circle quad, seated at the floor plane) but a thin RING
   (inner radius carved out) so it reads as a glow ANNOUNCING the figure rather than a shadow
   grounding it, and it rides the accent gold rather than near-black. Mounted as a CHILD of the
   unit's own figure group (not a separate group tracked by world x/z) so it inherits the figure's
   position/rotation for free and gets swept automatically the instant clearGroup() disposes that
   figure on the next setUnits() — no separate cleanup bookkeeping needed beyond the one call below
   that removes the previous ring before adding a new one. */
const ACTING_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0xd4af6e, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false
});
const ACTING_RING_GEO_CACHE = {};
function actingRingGeoFor(radius){
  const key = radius.toFixed(3);
  if(!ACTING_RING_GEO_CACHE[key]) ACTING_RING_GEO_CACHE[key] = new THREE.RingGeometry(radius * 0.7, radius, 28);
  return ACTING_RING_GEO_CACHE[key];
}
// BEAUTY-WAVE-4.md MF-4 item 1 (the rhythm layer): the acting-ring's own slide duration, same
// tween-channel discipline as MF-1's placeCameraTweened (reuses mf1EaseOutCubic/mf1Lerp above —
// they're generic numeric-ease helpers despite the mf1-prefixed name, not camera-specific).
const MF4_RING_SLIDE_DUR = 300;
// interior standees wrap their own base rim (radius derived from the stamped base radius); tabletop
// figures use the fixed 0.6 floor-blob convention. Pulled out of setActingUnit's old inline body so
// both the slide path and the instant (re)mount path below share one derivation.
function actingRingRadiusFor(fig){
  const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
  return interiorFig ? Math.max(0.12, (fig.userData.interiorBaseRadius || 0.3) * 1.2) : 0.6;
}
// world-space target for the ring: the fig's own world position plus the SAME fixed local y offset
// the pre-MF-4 child-of-fig mount used (a hair above local y=0 for an interior standee's base-rim
// contact line, -0.48 for a tabletop figure — see the original comment preserved on the instant path
// below). A ring is a flat disc rotated flat (-90° on local X) so it's radially symmetric — reading
// its position in world space instead of as a fig-child is visually identical as long as the fig
// itself never scales/tilts off the vertical (true for every figure this renders today), which is
// exactly what lets the MF-4 slide below move the SAME mesh across two different figures' local
// frames without a re-parent mid-flight.
function actingRingWorldPosFor(fig){
  const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
  const world = new THREE.Vector3();
  fig.getWorldPosition(world);
  world.y += interiorFig ? 0.003 : -0.48;
  return world;
}
/* setActingUnit(idOrIds) — takes a single unit id OR an array (COMBAT.md's side-based initiative has
   no single "current actor," only a currently-acting SIDE — the PC is one unit so its turn lights one
   ring, but the foes' turn can mean several live foes could act, so the caller passes every live id on
   the acting side; the existing .cmb-active chip class already does the identical "highlight the whole
   side" thing, this is that same design call applied to standees). id(s)=null/[] clears every ring
   (between rounds / no fight). Returns the count of rings actually mounted (0 if none resolved).

   BEAUTY-WAVE-4.md MF-4 item 1: "the gold base glow + ring TWEEN between units — a 300ms slide of the
   ring to the next actor — instead of blinking/teleporting." A clean single-actor-to-single-actor
   HANDOFF (exactly one previous acting id, exactly one new one, and they differ — the common "whose
   turn it is" case for the PC or a lone acting foe) now SLIDES the existing ring mesh from the old
   actor's world position to the new actor's over MF4_RING_SLIDE_DUR ms on the shared S.tweens channel,
   instead of the old instant remove+recreate. Any other shape — first reveal (0 -> N), a full clear
   (N -> 0), a multi-unit acting SIDE on either end, or the same id repeated — keeps the pre-MF-4
   instant behavior verbatim (a slide only reads as "the eye follows whose turn it is" between exactly
   two rings; interpolating N>1 rings has no single well-defined path and isn't asked for). The base
   glow itself is NOT slid (a base is a fixed mesh per unit — there's nothing physical to interpolate
   between two different bases) — it keeps toggling instantly per the existing BW2-2b law; only the
   one ring object animates. */
function setActingUnit(idOrIds){
  const ids = idOrIds == null ? [] : (Array.isArray(idOrIds) ? idOrIds : [idOrIds]);

  // cancel any in-flight ring-slide tween first — never two competing slides live at once, same
  // retarget-not-stack discipline as MF-1's placeCameraTweened cancelling a stale camera-pose tween.
  if(S.tweens && S.tweens.length){
    S.tweens = S.tweens.filter((tw) => !(tw && tw.isRingSlideTween));
  }

  // BW2-2b item 3 (TURN GLOW): revert every PREVIOUSLY-glowing base before mounting the new set —
  // instant in every case, slide or not (see header above).
  (S.actingGlowBaseMeshes || []).forEach(function(m){ setBaseGlow(m, false); });
  S.actingGlowBaseMeshes = [];

  // resolve the new id set's figs up front — needed both for the slide-eligibility check and the
  // instant mount loop below.
  const figsById = {};
  ids.forEach(function(id){
    if(id == null) return;
    const fig = findUnit(id);
    if(fig) figsById[id] = fig;
  });
  const newResolvedIds = ids.filter((id) => figsById[id]);
  const prevIds = S.actingIds || [];

  const canSlide = prevIds.length === 1 && newResolvedIds.length === 1 && prevIds[0] !== newResolvedIds[0]
    && S.actingRingMeshes && S.actingRingMeshes.length === 1 && S.actingRingMeshes[0].parent;

  if(canSlide){
    const ringMesh = S.actingRingMeshes[0];
    const fromWorld = ringMesh.getWorldPosition(new THREE.Vector3());
    const toFig = figsById[newResolvedIds[0]];
    const toWorld = actingRingWorldPosFor(toFig);
    const toRadius = actingRingRadiusFor(toFig);
    const toInterior = !!(toFig.userData && toFig.userData.interiorTrueScale);

    // detach from the old fig and reparent to the scene root AT its current world position, so the
    // tween below can move it in pure world space without fighting either fig's local transform.
    if(ringMesh.parent) ringMesh.parent.remove(ringMesh);
    ringMesh.position.copy(fromWorld);
    ringMesh.rotation.x = -Math.PI / 2;
    S.scene.add(ringMesh);

    if(!S.tweens) S.tweens = [];
    S.tweens.push({
      start: Date.now(),
      dur: MF4_RING_SLIDE_DUR,
      isRingSlideTween: true,
      update: (t) => {
        const e = mf1EaseOutCubic(t);
        ringMesh.position.set(
          mf1Lerp(fromWorld.x, toWorld.x, e),
          mf1Lerp(fromWorld.y, toWorld.y, e),
          mf1Lerp(fromWorld.z, toWorld.z, e)
        );
      },
      onDone: () => {
        // dock into the new fig's local frame — matches the instant-mount convention exactly (see the
        // radius/Y comment on the instant path below), so any later board rebuild sees the same
        // parented-to-fig shape it always has, slide or not.
        toFig.add(ringMesh);
        ringMesh.position.set(0, toInterior ? 0.003 : -0.48, 0);
        const wantGeo = actingRingGeoFor(toRadius);
        if(ringMesh.geometry !== wantGeo) ringMesh.geometry = wantGeo;
      }
    });
    markDirty();
    startTweenLoop();

    // the new actor's base glow mounts instantly (unchanged BW2-2b law) — only the ring itself is
    // mid-flight this turn.
    if(toInterior && toFig.userData.standeeBaseMesh){
      setBaseGlow(toFig.userData.standeeBaseMesh, true);
      S.actingGlowBaseMeshes.push(toFig.userData.standeeBaseMesh);
    }
    S.actingIds = newResolvedIds;
    return 1;
  }

  // instant path — byte-identical to the pre-MF-4 behavior, used for first reveal, a full clear, any
  // multi-unit acting side, or a same-id no-op call.
  (S.actingRingMeshes || []).forEach(function(m){ if(m.parent) m.parent.remove(m); });
  S.actingRingMeshes = [];
  let mounted = 0;
  newResolvedIds.forEach(function(id){
    const fig = figsById[id];
    // BW2-2: an interior true-scale standee's ring relocates to wrap its own BASE rim (slightly
    // larger radius, same gold) instead of the tabletop's fixed 0.6-radius floor-blob convention below
    // — the base radius was stamped onto userData at mount time (interiorBuildPieces/setUnits, both
    // above) specifically for this. A non-interior (tabletop combat) figure carries no
    // interiorTrueScale flag at all, so it falls through to the exact pre-BW2-2 radius/Y — byte-
    // identical, untouched.
    const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
    const ringRadius = actingRingRadiusFor(fig);
    const mesh = new THREE.Mesh(actingRingGeoFor(ringRadius), ACTING_RING_MAT);
    mesh.rotation.x = -Math.PI / 2;
    // interior: a hair above local y=0 — which IS the base's own top face / the standee's own
    // contact line (buildInteriorBase's header explains why local 0 is that shared reference point) —
    // so the ring reads as wrapping the base rim. tabletop (unchanged): -0.48, above the grounding
    // blob's -0.495 and below the hostility base disc, per the SAME layering law addGroundingBlob's
    // header documents ("never fighting it for the same plane").
    mesh.position.set(0, interiorFig ? 0.003 : -0.48, 0);
    fig.add(mesh);
    S.actingRingMeshes.push(mesh);
    // BW2-2b item 3: the base itself glows gold too (joins the ring, not a replacement) — only an
    // interior standee HAS a base mesh at all (stamped onto userData at mount time, same discriminator
    // as the ring radius above); a tabletop figure's own hostility disc/grounding blob are untouched.
    if(interiorFig && fig.userData.standeeBaseMesh){
      setBaseGlow(fig.userData.standeeBaseMesh, true);
      S.actingGlowBaseMeshes.push(fig.userData.standeeBaseMesh);
    }
    mounted++;
  });
  S.actingIds = newResolvedIds;
  markDirty();
  return mounted;
}

/* BEAUTY-WAVE VP5 item 3 — damage floaters. projectUnit(id) turns a mounted unit's world position
   into on-screen pixel coordinates (relative to the canvas host), the SAME Vector3.project(camera)
   math interiorFrustumCheck already uses above, just for one point instead of a room's corners.
   headHeight defaults to HUMAN_TRUE_HEIGHT-ish (1.1, matching interiorFrustumCheck's own default)
   so the floater spawns near a standing figure's head, not its feet. */
function projectUnit(id, headHeight){
  if(!S.mounted || !S.camera || !S.renderer) return null;
  const fig = findUnit(id);
  if(!fig) return null;
  const h = (typeof headHeight === "number" && isFinite(headHeight)) ? headHeight : 1.1;
  const world = new THREE.Vector3();
  fig.getWorldPosition(world);
  world.y += h;
  S.camera.updateMatrixWorld();
  const v = world.clone().project(S.camera);
  const rect = S.renderer.domElement.getBoundingClientRect();
  const w = rect.width || S.renderer.domElement.clientWidth || 1;
  const hgt = rect.height || S.renderer.domElement.clientHeight || 1;
  const x = (v.x * 0.5 + 0.5) * w;
  const y = (1 - (v.y * 0.5 + 0.5)) * hgt;
  const onscreen = v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
  return { x, y, onscreen };
}

/* spawnFloater(id, text, opts) — appends one ephemeral DOM node into S.floaterEl (the persistent
   overlay div created at mount()/reattach() above, so it survives the host's innerHTML replacement
   on the NEXT combat re-render same as the canvas does). AMENDED per the VP5 spec's 2c-framing note:
   "either reproject per-frame while alive, or anchor at spawn and rely on the fast fade; never let a
   floater drift onto the wrong standee after a camera fit" — this picks anchor-at-spawn (the fade is
   only 600ms, well inside a single camera-fit beat, so drift risk is negligible and it avoids a
   per-frame rAF hook keeping a reference to a figure that might get disposed mid-fade). Returns the
   node (or null if the unit can't be projected — e.g. pre-mount, headless, or off-board). */
function spawnFloater(id, text, opts){
  if(!S.floaterEl) return null;
  const pos = projectUnit(id, opts && opts.headHeight);
  if(!pos) return null;
  const el = document.createElement("div");
  el.className = "theater-floater" + (opts && opts.variant ? (" theater-floater-" + opts.variant) : "");
  el.style.left = pos.x + "px";
  el.style.top = pos.y + "px";
  el.textContent = String(text == null ? "" : text);
  S.floaterEl.appendChild(el);
  // fast, deterministic cleanup — no reliance on an animationend listener firing (a re-render that
  // detaches floaterEl mid-fade must not leak the node or the timer's closure forever).
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 650);
  return el;
}

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
    tileGroup: null, propGroup: null, unitGroup: null, shadowGroup: null,
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
    // + flickerRaf/flickerRunning drive the flicker tick (tickLightFlicker) — a SEPARATE, cheap-by-design
    // low-frequency loop from both the render-on-demand `raf` and the tween `tweenRaf` chains (see that
    // function's own header for why a full-rAF loop would be wasteful for a "flicker ~2x/sec" cadence).
    ambientLight: null, pointLights: [], lightProfileKey: null, flickerRaf: null, keyLight: null, fillLight: null, interiorCameraKey: null,
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
    postSuite: null, postSuiteMounted: false, dofFocusDist: 0, dofFocusNdcY: 0
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

// SPRITE-TRANSITION T4.2: Y-axis-only billboarding — every sprite group (tagged userData.sprite by
// buildSpriteBillboard) turns to face the camera's current yaw step each render pass, rotating the
// GROUP about Y only (rotation.x/z stay 0 — "sprites stay upright" per the spec) rather than a true
// look-at (which would also tip the plane's top toward/away from the camera at this game's fixed
// elevation, reading as a leaning card instead of an upright PS1/Doom sprite). The camera only ever
// sits at one of placeCamera's 4 discrete 90°-step yaws (+ the fixed CAM_YAW_OFFSET_DEG dimetric
// offset), so recomputing this on every dirty render (cheap — a handful of live sprite units at most)
// is simpler and just as correct as hooking rotate()/placeCamera() separately. A plane is authored
// facing +Z (buildSpriteBillboard's own PlaneGeometry default); +PI turns that face to point back at
// the camera position (which sits at angle `yaw` from the board origin, looking inward).
function updateSpriteBillboardYaw(){
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;
  const facing = yaw + Math.PI;
  // Camera-pitch tilt (Adam 2026-07-10 evening): an upright quad under the elevated ortho camera
  // foreshortens vertically by cos(elevation) — reads as a SQUASHED sprite. Tilting each standee
  // back by the camera elevation makes the quad camera-perpendicular: full sprite height on
  // screen, no distortion, feet still anchored at the group origin. rotation order YXZ so the
  // pitch rides the yaw.
  const tilt = (CAM_ELEV_DEG * Math.PI) / 180; // top leans AWAY from the camera (standee), not into the floor
  // BW2-2b item 1 (FLOOR-ALIGNED BASES): camera-pitch tilt now lands on the standee's INNER wrapper
  // (g.userData.standeeWrap, built eagerly by buildSpriteBillboardMesh above — holds ONLY the sprite
  // mesh) instead of the OUTER group `fig` itself. `fig.rotation.x` is deliberately left untouched
  // here — a plinth base/acting ring mounted as a direct SIBLING child of `fig` (never of the wrap)
  // then stays floor-flat under `fig`'s own yaw-only rotation, and `fig.rotation.x` is FREE for
  // standee-verbs.js's verb-tilt (fall-death) to tip the whole mini — base included — as one rigid
  // body (see that file's runKeyframeVerb). A group whose wrap is missing (defensive — every real
  // sprite built via buildSpriteBillboardMesh has one) falls back to the pre-BW2-2b behavior on the
  // OUTER group so nothing silently stops tilting.
  // BW2-2b item 4 (THE KILTER): a per-standee seeded yaw jitter (kilterFor, below) rides on TOP of the
  // camera-relative facing yaw, applied to the OUTER group (fig) — so the WHOLE mini (base+sprite)
  // reads as sitting a hair off-true on its tile, exactly like a hand-placed physical miniature, per
  // Adam's mock read (ui-sketches/mock-frames/mock-01-gloom-combat.png: the ghost's base sits
  // perceptibly off-kilter next to the knight's square one).
  function face(fig){
    fig.rotation.order = "YXZ";
    const kilterRad = ((fig.userData.kilterYawDeg || 0) * Math.PI) / 180;
    fig.rotation.y = facing + kilterRad;
    const wrap = fig.userData.standeeWrap;
    if(wrap){
      wrap.rotation.order = "YXZ";
      wrap.rotation.x = tilt;
    } else {
      fig.rotation.x = tilt;
    }
  }
  if(S.unitGroup){
    for(let i = 0; i < S.unitGroup.children.length; i++){
      const fig = S.unitGroup.children[i];
      if(fig && fig.userData && fig.userData.sprite) face(fig);
    }
  }
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: interior "pieces" (creature/PC sprites standing in the
  // room) are billboard groups too (interiorBuildPieces -> buildSpriteBillboard, same userData.sprite
  // tag), but they live in S.interiorGroup's own pieces sub-group, not S.unitGroup — walk the group
  // tree one level deep (interiorGroup -> {tile/wall/light/pieces sub-groups} -> sprite groups) rather
  // than a flat scan, so this stays cheap even on an 80-room whole-plan interior render.
  if(S.interiorGroup){
    for(let i = 0; i < S.interiorGroup.children.length; i++){
      const sub = S.interiorGroup.children[i];
      if(!sub || !sub.children) continue;
      for(let j = 0; j < sub.children.length; j++){
        const fig = sub.children[j];
        if(fig && fig.userData && fig.userData.sprite) face(fig);
      }
    }
  }
}

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
  if(S.postChainEnabled && S.composer && S.composer.passes && S.composer.passes.length > 0){
    S.composer.render();
  } else {
    S.renderer.render(S.scene, S.camera);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   BEAUTY-WAVE-3 — THE POST SUITE (BW3-2 TILT-SHIFT DoF · BW3-3 SELECTIVE BLOOM · BW3-6 FILMIC GRADE)
   docs/BEAUTY-WAVE-3.md. Three effect passes that mount ONTO BW3-0's EffectComposer seam, INTERIOR
   BOARDS ONLY (the flat tabletop stays pass-free — it dies at UW3). Chain order, each frame:
       RenderPass  ->  DoF  ->  Bloom  ->  Grade(->screen)
   Grade LAST so it is judged over the bloomed frame (the spec's own ordering: "grade is judged after
   bloom"). SUBTLE is the law — every dial below is tuned so the effect is FELT (the photographed-
   miniature cue, the emissive halo, the realm's mood) but never NAMED as an effect. The dials are the
   TASTE-iterate surface (Opus loop): change the numbers here, re-shoot, re-read vs the mocks.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

// ── TILT-SHIFT DoF dials (BW3-2). Screen-space vertical tilt-shift: a sharp horizontal focal BAND
// centred on the projected board-centre (the action cluster for a "beat" fit, the room centre for a
// "room" fit — it TRACKS because S.boardCenter itself moves per fitMode), blur ramping toward the
// near-foreground (screen bottom, nearer under the elevated camera) and far-background (screen top,
// farther). This is the classic tilt-shift lens the miniature-photography cue is built on — near/far
// map DIRECTLY to screen-vertical under a fixed elevation, so a vertical CoC gradient IS a depth
// gradient here, and it needs no depth buffer (cheaper, robust across ortho AND persp interior cams).
// UV space: v in [0,1]. FOCUS_HALF = half-height of the fully-sharp band; RAMP = UV distance over
// which CoC climbs 0->1 past the band; MAX_BLUR = peak sample radius (capped CoC — the whisper cap).
const DOF_FOCUS_HALF = 0.16;   // fully-sharp band spans ~32% of screen height around the focal row
const DOF_RAMP = 0.42;         // gentle climb to full blur — no hard focus edge
const DOF_MAX_BLUR = 0.0055;   // peak CoC radius in UV (~9px at 1600px tall) — a whisper, capped here
const DOF_STRENGTH = 0.85;     // global master (0 = off); per-realm nudge folds in at mount

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
const BLOOM_RADIUS = 0.5;      // spread of the halo (tighter = the wash stays ON the emissive)
const BLOOM_RESOLUTION_SCALE = 0.5; // half-res bloom chain (fps)

// ── FILMIC GRADE dials (BW3-6). One per-realm post grade: exposure -> ACES filmic tone curve ->
// contrast (both MONOTONIC, so the VALUE LAW ordering floor<wall<light survives in pixels, not just
// in the material data verify-scene-direction asserts) -> saturation shape -> per-realm tint wash ->
// vignette. The per-realm TINT + its strength come from the interior tile kit's OWN authored
// gradeTint/gradeStrength (theater-interior.js — the SAME data the material grade and the BW2-4b
// sprite-emissive tint already read), so flagships carry their tuned hue (chrome cool, fantasy warm,
// gloom cold-violet) and the 9 non-flagship realms inherit whatever their kit authored (or neutral).
// The existing whisper-fog + vignette-in-render stay UNDER this (they're in the scene; this grades the
// composited frame on top). GRADE_TINT_SCALE maps kit.gradeStrength (a material-grade strength, ~0.1-
// 0.3) down to a gentle post wash so the grade doesn't double-hit the already-graded materials.
// NOTE (round 2): the frame the composer reads is ALREADY the renderer's tone-mapped, sRGB-encoded
// LDR output — so a full ACES tone curve here (round 1) DOUBLE-tonemapped and crushed the already-dark
// torch-lit scenes toward black, leaving only the red lantern light (the "everything went red/dark"
// failure). The grade is now a gentle LDR colour grade: lift-preserving soft contrast + saturation +
// a capped realm tint wash + a soft vignette. No tone curve. Every luminance stage stays monotonic so
// the VALUE LAW ordering survives in pixels.
const GRADE_EXPOSURE = 1.02;   // barely-there lift
const GRADE_CONTRAST = 1.05;   // very gentle S around mid — a touch of mood, never crushing
const GRADE_SATURATION = 1.07; // a touch richer, never garish
const GRADE_TINT_SCALE = 0.45; // kit.gradeStrength -> post-wash amount (gentle, avoids double-grade)
const GRADE_TINT_MAX = 0.12;   // hard cap on the tint wash so no realm over-tints the frame
const GRADE_VIGNETTE = 0.20;   // edge darkening depth (the mocks all carry a soft vignette)
const GRADE_VIGNETTE_INNER = 0.34; // radius (from centre, UV) where the vignette starts
const GRADE_VIGNETTE_OUTER = 0.92; // radius where it reaches full depth (corners ~0.71 in a wide frame)

// DoF tilt-shift: a Poisson-ish 12-tap disc scaled by a vertical-gradient CoC. Aspect-corrected so the
// blur disc stays circular on a wide canvas. Sharp inside the focal band, ramping to MAX_BLUR at the
// screen's near/far edges.
function makeDofPass(){
  const shader = {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uFocusV: { value: 0.5 },
      uFocusHalf: { value: DOF_FOCUS_HALF },
      uRamp: { value: DOF_RAMP },
      uMaxBlur: { value: DOF_MAX_BLUR },
      uStrength: { value: DOF_STRENGTH }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uFocusV, uFocusHalf, uRamp, uMaxBlur, uStrength;
      void main(){
        vec4 base = texture2D(tDiffuse, vUv);
        // CoC from vertical distance to the focal band (near/far == screen bottom/top under the
        // elevated camera). Capped at 1.0 -> the whisper cap on max blur.
        float d = abs(vUv.y - uFocusV);
        float coc = clamp((d - uFocusHalf) / max(uRamp, 1e-4), 0.0, 1.0) * uStrength;
        if(coc <= 0.001){ gl_FragColor = base; return; }
        float r = coc * uMaxBlur;
        float ar = uResolution.x / max(uResolution.y, 1.0); // aspect correct: circular disc
        // 12-tap disc (unit-circle offsets) + centre.
        vec2 o[12];
        o[0]=vec2(0.94,0.0); o[1]=vec2(0.47,0.82); o[2]=vec2(-0.47,0.82); o[3]=vec2(-0.94,0.0);
        o[4]=vec2(-0.47,-0.82); o[5]=vec2(0.47,-0.82); o[6]=vec2(0.35,0.20); o[7]=vec2(-0.35,0.20);
        o[8]=vec2(0.0,-0.42); o[9]=vec2(0.0,0.42); o[10]=vec2(0.62,-0.36); o[11]=vec2(-0.62,-0.36);
        vec4 sum = base;
        for(int i=0;i<12;i++){
          vec2 off = vec2(o[i].x / ar, o[i].y) * r;
          sum += texture2D(tDiffuse, vUv + off);
        }
        gl_FragColor = sum / 13.0;
      }
    `
  };
  const pass = new ShaderPass(shader);
  pass.__bwName = "dof";
  return pass;
}

// Filmic grade: exposure, ACES tone (Narkowicz approx), contrast, saturation, per-realm tint wash,
// vignette. Every luminance-affecting stage is monotonic so value ordering survives.
function makeGradePass(){
  const shader = {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uExposure: { value: GRADE_EXPOSURE },
      uContrast: { value: GRADE_CONTRAST },
      uSat: { value: GRADE_SATURATION },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uTintAmt: { value: 0.0 },
      uVignette: { value: GRADE_VIGNETTE },
      uVigInner: { value: GRADE_VIGNETTE_INNER },
      uVigOuter: { value: GRADE_VIGNETTE_OUTER }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uExposure, uContrast, uSat, uTintAmt, uVignette, uVigInner, uVigOuter;
      uniform vec3 uTint;
      void main(){
        // The composer buffer is LINEAR. Grade in a PERCEPTUAL (sRGB-ish) space so the dials read
        // intuitively (a 0.5 pivot really is mid-grey), then hand a linear result back to OutputPass,
        // which applies the real sRGB OETF at the end of the chain. gamma 2.2 approximation is plenty
        // for a grade (the display encode is OutputPass's exact job, not this one's).
        vec3 lin = texture2D(tDiffuse, vUv).rgb;
        vec3 col = pow(max(lin, 0.0), vec3(1.0 / 2.2)); // linear -> perceptual
        col *= uExposure;
        col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0); // gentle S around mid (monotonic)
        float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(luma), col, uSat);
        col *= mix(vec3(1.0), uTint, uTintAmt); // per-realm wash (multiplicative — chrome cool, etc.)
        // soft radial vignette (edge0<edge1 so it's well-defined: 0 at centre -> uVignette at corners)
        float dist = length(vUv - 0.5);
        float vig = smoothstep(uVigInner, uVigOuter, dist);
        col *= (1.0 - uVignette * vig);
        col = pow(clamp(col, 0.0, 1.0), vec3(2.2)); // perceptual -> linear (OutputPass encodes to sRGB)
        gl_FragColor = vec4(col, 1.0);
      }
    `
  };
  const pass = new ShaderPass(shader);
  pass.__bwName = "grade";
  return pass;
}

// Build the three passes once (lazy — needs a live renderer + a sized canvas). Stored on S.postSuite.
function buildPostSuite(){
  if(S.postSuite || !S.renderer || !S.composer) return S.postSuite;
  const size = new THREE.Vector2();
  S.renderer.getSize(size);
  const dof = makeDofPass();
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(Math.max(1, Math.round(size.x * BLOOM_RESOLUTION_SCALE)),
                      Math.max(1, Math.round(size.y * BLOOM_RESOLUTION_SCALE))),
    BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD
  );
  bloom.__bwName = "bloom";
  const grade = makeGradePass();
  const renderPass = new RenderPass(S.scene, S.camera);
  renderPass.__bwName = "render";
  const outputPass = new OutputPass();
  outputPass.__bwName = "output";
  S.postSuite = { renderPass, dof, bloom, grade, outputPass };
  return S.postSuite;
}

// Recompute the DoF focal band from the CURRENT camera fit: project S.boardCenter to NDC and centre
// the sharp band on its screen-Y. This is what makes focus TRACK fitMode — S.boardCenter is the
// action-cluster centre in a "beat" fit and the room centre in a "room" fit, so the sharp band lands
// on whatever the camera framed. Also records the world focus distance (camera->boardCenter) for the
// determinism/assert surface (window.Theater.dofFocus). Called after placeCamera at mount time.
function updateDofFocus(){
  if(!S.postSuite || !S.camera) return;
  const center = S.boardCenter || new THREE.Vector3(0, 0, 0);
  S.dofFocusDist = S.camera.position.distanceTo(center);
  S.camera.updateMatrixWorld();
  const ndc = center.clone().project(S.camera); // ndc.y in [-1,1]
  const focusV = THREE.MathUtils.clamp(ndc.y * 0.5 + 0.5, 0.08, 0.92);
  S.dofFocusNdcY = ndc.y;
  S.postSuite.dof.uniforms.uFocusV.value = focusV;
}

// Push the per-realm FILMIC GRADE params from the interior tile kit's authored grade onto the grade
// pass. Flagships carry their tuned gradeTint/gradeStrength; kits with no grade -> neutral (tint amt
// 0, still filmic+vignette). rigOn=false (study-rig honest baseline) -> neutral too.
function updatePostSuiteGrade(kit, rigOn){
  if(!S.postSuite) return;
  const g = S.postSuite.grade.uniforms;
  const hasGrade = rigOn && kit && kit.gradeTint && typeof kit.gradeStrength === "number";
  if(hasGrade){
    const tintNum = hexStrToNum(kit.gradeTint);
    g.uTint.value.setHex(tintNum);
    g.uTintAmt.value = Math.min(GRADE_TINT_MAX, kit.gradeStrength * GRADE_TINT_SCALE);
  } else {
    g.uTint.value.setRGB(1, 1, 1);
    g.uTintAmt.value = 0.0;
  }
}

// Push resolution-dependent uniforms (DoF aspect, grade resolution) after any canvas resize.
function syncPostSuiteResolution(){
  if(!S.postSuite || !S.renderer) return;
  const size = new THREE.Vector2();
  S.renderer.getSize(size);
  S.postSuite.dof.uniforms.uResolution.value.set(size.x, size.y);
  S.postSuite.grade.uniforms.uResolution.value.set(size.x, size.y);
  if(S.postSuite.bloom && S.postSuite.bloom.setSize){
    S.postSuite.bloom.setSize(size.x * BLOOM_RESOLUTION_SCALE, size.y * BLOOM_RESOLUTION_SCALE);
  }
}

// Mount the post suite onto the composer (interior boards). Idempotent — re-mounting on an interior->
// interior board swap just refreshes uniforms/focus (the passes stay attached). Adds in chain order
// [render, dof, bloom, grade] via the addPass seam. renderPass MUST be first so the effects have the
// scene to read; grade last so EffectComposer flags it renderToScreen.
function mountPostSuite(kit, rigOn){
  if(!S.mounted || !S.composer) return;
  buildPostSuite();
  if(!S.postSuite) return;
  // keep the renderPass camera in sync (setInteriorBoard may have swapped ortho<->persp cameras)
  S.postSuite.renderPass.camera = S.camera;
  syncPostSuiteResolution();
  updatePostSuiteGrade(kit, rigOn);
  updateDofFocus();
  if(!S.postSuiteMounted){
    S.composer.addPass(S.postSuite.renderPass);
    S.composer.addPass(S.postSuite.dof);
    S.composer.addPass(S.postSuite.bloom);
    S.composer.addPass(S.postSuite.grade);
    S.composer.addPass(S.postSuite.outputPass); // ALWAYS last — applies sRGB OETF (see OutputPass import)
    S.postSuiteMounted = true;
  }
}

// Tear the post suite OFF the composer (flat tabletop — the tabletop stays pass-free). Removes via the
// removePass seam; mirrors THREE's own contract (removePass never disposes a pass — the passes persist
// on S.postSuite for the next interior board, disposed only at retire()).
function teardownPostSuite(){
  if(!S.composer || !S.postSuite || !S.postSuiteMounted) return;
  S.composer.removePass(S.postSuite.outputPass);
  S.composer.removePass(S.postSuite.grade);
  S.composer.removePass(S.postSuite.bloom);
  S.composer.removePass(S.postSuite.dof);
  S.composer.removePass(S.postSuite.renderPass);
  S.postSuiteMounted = false;
}

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
  const viewSize = autoFitViewSize * (S.zoomLevel || 1);
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

// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D7): dispose one mesh's geometry+material, UNLESS its
// geometry is tagged shared (userData.shared, set once by wholeObjectGeometryFor at cache-insert time)
// — a cached whole-object BufferGeometry is reused across EVERY unit/prop instance of the same
// registry key, so disposing it when ONE figure's wrapper group gets swept would corrupt every other
// still-live figure sharing that same cached geometry. The mesh still fully DETACHES either way
// (clearGroup's own child-removal loop below handles that uniformly) — only the dispose() call is
// skipped for a shared geometry. Materials are NEVER shared-tagged (wholeObjectMaterialsFor's own
// cache is keyed by opacity only, reused the same way — dispose is skipped for those too, since a
// disposed shared material would break every other figure using that opacity bucket); non-whole-
// object meshes carry no `shared` tag on either geometry or material, so their dispose is unaffected —
// byte-identical to before this unit for every cuboid-path figure/prop.
function disposeMeshMaybeShared(mesh){
  const sharedGeo = !!(mesh.geometry && mesh.geometry.userData && mesh.geometry.userData.shared);
  if(mesh.geometry && !sharedGeo) mesh.geometry.dispose();
  if(mesh.material){
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const sharedMat = mats.some(m => m && m.userData && m.userData.shared);
    if(!sharedMat) mats.forEach(m => m && m.dispose());
  }
}
// P1' WHOLE-OBJECT WIRING (§3-D7): a whole-object figure/prop is a THREE.Group wrapper (matching
// the pre-existing cuboid-figure convention — every archetype builder ALSO returns a Group, not a
// bare Mesh) holding ONE mesh with a cached/shared geometry+material triple. Traverse into it (one
// level is sufficient — the wrapper's only child is that one mesh) so the shared-geometry/material
// skip actually reaches the mesh that carries the tag; a plain cuboid figure's own nested boxes
// (never tagged shared) still dispose exactly as before via the same traversal. Factored out of
// clearGroup (BEAUTY-WAVE-4.md MF-2) so a single DETACHED figure — a despawn-grace tween's onLifted,
// which pulls one child OUT of its group before clearGroup ever sees it (see setUnits' despawn diff) —
// can dispose itself via the exact same logic, byte-identical to what clearGroup already did per child.
function disposeGroupChild(child){
  if(child.geometry || child.material){
    disposeMeshMaybeShared(child);
  } else if(child.children && child.children.length){
    child.traverse(function(n){ if(n.geometry || n.material) disposeMeshMaybeShared(n); });
  }
}
function clearGroup(group){
  if(!group) return;
  while(group.children.length){
    const child = group.children.pop();
    disposeGroupChild(child);
  }
}

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
const LIGHT_PROFILES = {
  dark: {
    ambient: { color: 0x8fa8c8, intensity: 0.25 }, // was 0.38
    // ARENA round 3 (2026-07-04): dark was the only ambient-only profile left after the readability
    // floor landed, and it still read as a flat near-black sheet — ambient alone gives Lambert
    // materials zero directionality, so tile/figure facets all shade identically. ONE dim point
    // (overhead-center, the table's own pattern) adds facet depth without changing the mood: its
    // color is dark's own ambient hue lightened a touch (0x8fa8c8 family), and intensity 7 is the
    // LOWEST point intensity in this table (moonlit 8, fungal-glow 9) — dark stays the dimmest of
    // the point-lit profiles by construction.
    points: [ { color: 0x9fb4d8, intensity: 7, pos: { x: 0, y: 3, z: 0 } } ],
    flicker: 0
  },
  torchlit: {
    ambient: { color: 0x4a3826, intensity: 0.21 }, // was 0.32
    points: [ { color: 0xffa04a, intensity: 18, pos: { x: 0, y: 2.2, z: 0.6 } } ],
    flicker: 0.14
  },
  lavalit: {
    // "from below/edge tiles" (§2's own brief) — a literal below-floor Y is fully occluded by the tile
    // column geometry from the fixed top-down-ish camera (tiles sit roughly y:[-0.5, +0.5+height]), so
    // this reads as a low glow seeping up AT floor level rather than truly under it: still visibly the
    // lowest/reddest point of any profile, but actually contributes light to the scene.
    ambient: { color: 0x3a1c14, intensity: 0.2 }, // was 0.3
    points: [ { color: 0xff5522, intensity: 22, pos: { x: 0, y: 0.15, z: 0 } } ],
    flicker: 0.18
  },
  "fungal-glow": {
    ambient: { color: 0x3a5a3a, intensity: 0.27 }, // was 0.42
    points: [ { color: 0x7fdc6a, intensity: 9, pos: { x: 0.4, y: 1.0, z: 0.4 } } ],
    flicker: 0.05
  },
  "magic-glow": {
    ambient: { color: 0x4048a0, intensity: 0.26 }, // was 0.4
    points: [ { color: 0x8a6bff, intensity: 14, pos: { x: -0.3, y: 1.6, z: 0.2 } } ],
    flicker: 0.06
  },
  lamplit: {
    ambient: { color: 0x40382a, intensity: 0.22 }, // was 0.34
    points: [ { color: 0xffcf8a, intensity: 16, pos: { x: 0, y: 2.4, z: -0.5 } } ],
    flicker: 0.1
  },
  moonlit: {
    ambient: { color: 0x8fa0c8, intensity: 0.36 }, // was 0.55
    points: [ { color: 0xaebfe8, intensity: 8, pos: { x: 0.5, y: 3, z: -0.5 } } ],
    flicker: 0
  },
  daylit: {
    // L-4: daylit/overcast/moonlit additionally get a brighter hemisphere override on interior boards
    // (ITR_BRIGHT_PROFILES, applied in setInteriorBoard) — the sun/moon/sky IS their diegetic source.
    ambient: { color: 0xd8dce0, intensity: 0.55 }, // was 0.85
    points: [ { color: 0xfff2d8, intensity: 9, pos: { x: 0.4, y: 3, z: -0.4 } } ],
    flicker: 0
  },
  overcast: {
    ambient: { color: 0xa8adb5, intensity: 0.39 }, // was 0.6
    points: [],
    flicker: 0
  },
  voidlit: {
    ambient: { color: 0x5a3a6e, intensity: 0.2 }, // was 0.3
    points: [ { color: 0x9a5ad0, intensity: 11, pos: { x: 0, y: 1.2, z: 0 } } ],
    flicker: 0.08
  }
};
const LIGHT_DEFAULT_PROFILE = "dark";
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

  // readability floor (STAGE_AMBIENT_FLOOR, above) — clamp UP only, never down: a profile authored
  // brighter than the floor (at 0.65 that's daylit 0.85 alone) keeps its own value untouched; every
  // sub-floor profile (dark 0.38 the worst case; overcast/moonlit sit just under) gets lifted. Color
  // is read straight off the profile either way — the floor governs intensity alone, so the profile
  // still owns the mood/hue, and points still carry each profile's relative brightness identity.
  const ambientIntensity = Math.max(profile.ambient.intensity, STAGE_AMBIENT_FLOOR);
  // REALM-RENDER-STYLE.md §3: grade the profile's authored color through the current board's render
  // profile (S.realmProfile, set by setBoard just before this call — see that function's own comment;
  // null pre-mount/pre-setBoard, which gradeColorLocal treats as a no-op) — same "colors are already
  // resolved" seam the tile tints and figure materials share. Intensity is untouched (the readability
  // floor's own "color stays authored, only intensity is floored" discipline extends here).
  const ambientColor = gradeColorLocal(profile.ambient.color, S.realmProfile);
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
  profile.points.forEach((p, i) => {
    // decay:0, distance:0 — a flat non-attenuating point light (see LIGHT_PROFILES' own header on why:
    // predictable per-profile intensity numbers regardless of board size, no physically-correct falloff
    // tuning needed per profile).
    const light = new THREE.PointLight(gradeColorLocal(p.color, S.realmProfile), p.intensity, 0, 0);
    if(i === 0 && S.lightPropAnchor){
      light.position.set(S.lightPropAnchor.x, S.lightPropAnchor.y, S.lightPropAnchor.z);
    } else {
      light.position.set((p.pos.x || 0) * hx, p.pos.y != null ? p.pos.y : 1.5, (p.pos.z || 0) * hz);
    }
    S.scene.add(light);
    S.pointLights.push(light);
  });

  if(profile.flicker > 0) startLightFlicker(profile.flicker);
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
  dl.castShadow = ITR_CAMERA_KEY_CASTS_SHADOW;
  const half = Math.max(2, (S.boardHalfExtent || 4) + 1.5);
  const cam = dl.shadow.camera;
  cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half;
  cam.near = 0.5; cam.far = reach * 2.2;
  cam.updateProjectionMatrix();
  dl.shadow.mapSize.set(1024, 1024);
  dl.shadow.bias = -0.0016;
}

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

/* FLICKER (§2's own "optional flicker for torch/lava... a low-frequency setInterval that marks dirty
   ~2x/sec ONLY for flicker profiles; keep it cheap"). Deliberately NOT the tween rAF chain (theater-
   verbs.js's tickTweens runs every frame while >=1 verb tween is live — a torch flicker isn't a verb,
   it's ambient scene mood that should keep going for the ENTIRE time a flicker profile is mounted, verb
   tweens or no) and NOT a plain rAF loop either (60fps for a "randomly nudge one light's intensity"
   effect is wasted work the render-on-demand discipline this file otherwise holds to would flag) — a
   setInterval at ~2Hz is the cheapest mechanism that still reads as a living flame: each tick nudges
   every current point light's intensity by a small random delta around its profile base and calls
   markDirty() once. Self-stopping: stopLightFlicker (called at the top of every applyLightProfile, and
   from retire()) clears the interval, so a flicker never survives past the profile that requested it or
   past retire(). */
// BEAUTY-WAVE.md VP6 item 2 (THE LIFE PASS — torch flicker): interior light sources JOIN this same
// channel rather than growing a second setInterval — startLightFlicker's third param is an optional
// list of {pl, marker, baseIntensity, baseOpacity} entries (interiorBuildLights, below, builds these)
// that the SAME 480ms tick also nudges, at a fixed LOW amplitude (bounded here, never per-call —
// verify-vp6-life-pass.mjs's "flicker amplitude bound" check reads this const directly) so a torch-lit
// interior room never reads as more violently flickering than the tabletop `torchlit` profile (0.14)
// already established. The marker mesh's OWN opacity is nudged by the same delta*0.5 so the visible
// flame-quad pulses IN SYNC with its light's intensity swing, never independently randomized.
const INTERIOR_LIGHT_FLICKER_AMPLITUDE = 0.06;
// BW3-4 addendum: the per-tick nudge math pulled out to a PURE function (explicit args, no S/closure
// reads) — same "pure step, thin scheduler wraps it" split VP6's own mote drift already keeps
// (startMoteDrift's rAF loop vs the per-mote math it runs). Lets a deterministic fake-clock harness
// drive one tick directly (dev/verify-bw3-4-light-shafts.mjs) without needing S.mounted/a live
// setInterval, and lets the light-CONE card (this unit) ride the identical delta the marker already
// does — never a second independently-randomized swing (that would desync the shaft from its own
// marker/light, the exact "flicker sync" this unit's spec calls for).
function lightFlickerStep(pointLights, bases, interiorTargets, amplitude){
  (pointLights || []).forEach((l, i) => {
    const base = bases[i] != null ? bases[i] : l.intensity;
    l.intensity = Math.max(0.05, base + (Math.random() * 2 - 1) * amplitude);
  });
  (interiorTargets || []).forEach((t) => {
    const delta = (Math.random() * 2 - 1) * t.amplitude;
    t.pl.intensity = Math.max(0.05, t.baseIntensity + delta);
    if(t.marker && t.marker.material){
      t.marker.material.opacity = Math.max(0.2, Math.min(1, t.baseOpacity + delta * 0.5));
    }
    // BW3-4: the light-cone card rides the SAME delta*0.5 swing as the marker above (its own base
    // opacity is much lower — see ITR_LIGHT_CONE_OPACITY — so this is a proportional nudge off that
    // lower base, never a re-rolled random of its own); floor-clamped just above zero rather than the
    // marker's 0.2 (a near-invisible shaft at the bottom of a flicker dip is fine, a near-invisible
    // marker quad reads as a snuffed-out flame — the two clamps intentionally differ).
    if(t.cone && t.cone.material){
      t.cone.material.opacity = Math.max(0.05, Math.min(1, t.baseConeOpacity + delta * 0.5));
    }
  });
}
function startLightFlicker(amplitude, interiorTargets){
  stopLightFlicker();
  const bases = S.pointLights.map(l => l.intensity);
  S.interiorFlickerTargets = interiorTargets || [];
  S.flickerRaf = setInterval(() => {
    if(!S.mounted){ stopLightFlicker(); return; }
    lightFlickerStep(S.pointLights, bases, S.interiorFlickerTargets, amplitude);
    if(!S.pointLights.length && !(S.interiorFlickerTargets || []).length){ stopLightFlicker(); return; }
    markDirty();
  }, 480); // ~2x/sec per §2's own cadence note
}
function stopLightFlicker(){
  if(S.flickerRaf != null){ clearInterval(S.flickerRaf); S.flickerRaf = null; }
  S.interiorFlickerTargets = [];
}

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
  const sideMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color: sideColor })); // sides
                                                                         // stay flat-tinted (§1 rule 2
                                                                         // is a TOP-face trick; texturing
                                                                         // sides too would wash out the
                                                                         // top/side contrast)
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
  renderer.shadowMap.enabled = false; // §2: "no shadow maps" — blob quads only
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
  S.tweens = [];
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

function setBoard(data){
  if(!S.mounted || !data) return;
  // THEATER-NEXT §3.1/§3.2 — dirty-key skip: full-payload stringify (correct-by-construction; a
  // hand-rolled per-field key would re-derive what stringify already proves, and any missed field is
  // a stale-board bug). A skipped call must not drain tweens either — nothing changed.
  const dirtyKey = JSON.stringify(data);
  if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
  S.boardKey = dirtyKey;
  window.Theater.stats.boardBuilds++;
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: restore the standing table's "no shadow maps" ruling
  // (§2, mount()'s own default below) whenever a COMBAT/tabletop board mounts — setInteriorBoard is
  // the only place that turns shadow-mapping ON, so this is the one place it turns back off, however
  // many interior trays were mounted in between.
  if(S.renderer) S.renderer.shadowMap.enabled = false;
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
  ITR_SPRITE_EMISSIVE_TINT = 0xffffff; // BW2-4b item 1: the realm-grade sprite floor tint is interior-only
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
  S.isInteriorBoard = false; // placeCamera's own tabletop-vs-interior half-floor split
  drainTweens(S); // A2: force-complete every live tween BEFORE tearing down the board/FX it may reference
  clearGroup(S.fxGroup); // A2: a new board must never inherit the old board's still-animating debris/glyphs
  S.lastBoard = data; // P1' WHOLE-OBJECT WIRING (§4 step 8): replay target for the async post-load re-render
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.interiorGroup); // DUNGEON-GRAPH.md U3: a combat board must not leave a prior interior tray's meshes on stage
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
  const voidTint = gradeColorLocal(voidTintFor(env), S.realmProfile);
  if(S.scene){
    S.scene.background = new THREE.Color(voidTint);
    if(S.scene.fog) S.scene.fog.color = new THREE.Color(voidTint);
  }
  if(S.renderer) S.renderer.setClearColor(voidTint, 1);

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
  applyLightProfile((data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE);

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
    if(WHOLE_OBJECT_ENABLED && (p.model || p.part)){
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
        const wGeo = wholeObjectGeometryFor(wPropKey, false, "prop");
        if(wGeo){
          const wMats = wholeObjectMaterialsFor(wEntry);
          const wg = new THREE.Group();
          wg.add(new THREE.Mesh(wGeo, wMats));
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
    // REALM-PROPS-WIRING.md §3: same scale discipline for the absolute flat-box fallback tier.
    if(footprint.scale !== 1.0) mesh.scale.multiplyScalar(footprint.scale);
    S.propGroup.add(mesh);
  });

  placeCamera();
  markDirty();
}

// ─── DUNGEON-GRAPH.md U3 / GR1 (docs/GRAPHICS-ENGINE.md build unit GR1) — the volumetric interior
// renderer's GL layer ──────────────────────────────────────────────────────────────────────────────
// interiorMaterialTexture: the ONE place src/ui/theater-materials.js's pure pixel buffer
// (materialTexturePixels) becomes an actual THREE.CanvasTexture — putImageData onto a real <canvas>,
// nearest-filtered, RepeatWrapping (same "data layer elsewhere, GL layer here" split
// theater-interior.js's own header keeps, one file down: theater-materials.js stays as canvas/DOM-free
// as theater-interior.js does). Cached per (material,baseColor,seedKey) — GR1's own "boot-time, seeded"
// instruction: the SAME realm+surface always resolves the SAME cached texture object, baked once, never
// rebuilt per room/plan/session (materialTexturePixels itself is already deterministic off that same
// key — this cache just avoids re-painting the identical buffer + re-uploading it to the GPU on every
// setInteriorBoard call). seedKey is "<realmId>:<surface>" (theater-interior.js's tileKit doesn't carry
// realmId+surface directly here, so setInteriorBoard passes them through explicitly, below).
const INTERIOR_MATERIAL_TEXTURE_CACHE = {};
function interiorMaterialTexture(material, baseColorHex, seedKey, grainIntensity, repeatX, repeatZ){
  if(!material || !baseColorHex) return null;
  const key = material + ":" + baseColorHex + ":" + seedKey + ":" + grainIntensity + ":" + repeatX + ":" + repeatZ;
  if(INTERIOR_MATERIAL_TEXTURE_CACHE[key]) return INTERIOR_MATERIAL_TEXTURE_CACHE[key];
  const pixels = materialTexturePixels(material, baseColorHex, seedKey, MATERIAL_TEXEL_PX, grainIntensity);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width; canvas.height = pixels.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(Math.max(1, repeatX || 1), Math.max(1, repeatZ || 1));
  nearestify(tex);
  INTERIOR_MATERIAL_TEXTURE_CACHE[key] = tex;
  return tex;
}

// BW2-3 MATERIAL TEXEL (GENERATED-FIRST): the ONE place a folded PACKET-02 texture FILE
// (assets/textures/*.png, build/fold-textures.py) becomes a THREE.Texture on a world surface —
// async TextureLoader (image lands later; onLoad -> markDirty replays the render, the SAME pattern
// dressingTextureFor/loadTextureManifest already keep). NearestFilter min+mag (BW2-0 world-surface
// law: the texel is AUTHORED, crisp when magnified — the fold resamples the 512 source DOWN to engine
// texel so on-stage it is a MAGNIFICATION, no minification shimmer). `wrap` + per-surface `repeat` are
// the §2b UV MAPPING LAWS, applied by the caller. Cached per url+wrap+repeat so the same surface never
// re-fetches/re-uploads. INTERIOR_FILE_TEX_PENDING lets a capture harness wait for the async decodes.
let INTERIOR_FILE_TEX_PENDING = 0;
const INTERIOR_FILE_TEXTURE_CACHE = {};
function interiorFileTexture(url, wrapMode, repeatX, repeatZ){
  if(!url) return null;
  const key = url + ":" + wrapMode + ":" + repeatX + ":" + repeatZ;
  if(INTERIOR_FILE_TEXTURE_CACHE[key]) return INTERIOR_FILE_TEXTURE_CACHE[key];
  const wrap = wrapMode === "mirror" ? THREE.MirroredRepeatWrapping
             : wrapMode === "clamp" ? THREE.ClampToEdgeWrapping
             : THREE.RepeatWrapping;
  INTERIOR_FILE_TEX_PENDING++;
  const tex = textureLoader.load(url,
    () => { INTERIOR_FILE_TEX_PENDING = Math.max(0, INTERIOR_FILE_TEX_PENDING - 1); markDirty(); },
    undefined,
    () => { INTERIOR_FILE_TEX_PENDING = Math.max(0, INTERIOR_FILE_TEX_PENDING - 1); }); // load failure -> drop, painter/flat wins
  tex.wrapS = wrap; tex.wrapT = wrap;
  tex.repeat.set(Math.max(0.0001, repeatX || 1), Math.max(0.0001, repeatZ || 1));
  nearestify(tex);
  INTERIOR_FILE_TEXTURE_CACHE[key] = tex;
  return tex;
}

// BW2-3 §2b UV MAPPING LAWS — per-surface repeat. Every floor/wall/pillar InstancedMesh instance is a
// 1x1x* box sharing ONE unit-cube geometry (UV 0..1 per face) and ONE material, so texture.repeat is
// the per-cell tile count:
//   FLOOR: repeat (1,1) -> exactly ONE texture tile per 5ft cell; the tile's border grout thereby lands
//     on the cell boundary -> the grout grid ALIGNS with the combat grid (the room shows roomW x roomD
//     tiles == room cell dims, the spec's "repeat = room dims" expressed per-cell).
//   WALL: repeat (1, ITR_WALL_COURSE_REPEAT) -> one texture WIDTH per cell (courses continue seamlessly
//     across adjacent wall cells) and the full texture HEIGHT (~14 authored courses) over the wall
//     height. (Scale-domain-taller walls stretch the same courses — the pre-existing shared-material
//     limitation, not introduced here; base-height flagship walls read at fixed texel.)
//   TRIM: ClampToEdge, repeat (1,1) -> stretch-to-fit along the run (the one legal stretch case, §2b).
const ITR_WALL_COURSE_REPEAT = 1.0; // vertical wall repeat multiplier — the taste-loop dial to hit 14+/-3 courses
function interiorSurfaceFileTexture(surface, file, wrap){
  if(!file) return null;
  if(surface === "wall") return interiorFileTexture(file, wrap, 1, ITR_WALL_COURSE_REPEAT);
  if(surface === "trim") return interiorFileTexture(file, "clamp", 1, 1);
  return interiorFileTexture(file, wrap, 1, 1); // floor (and any other 1:1-per-cell surface)
}

// unit cube, shared by every InstancedMesh kind below — each instance's own transform (position+scale
// baked into its matrix) is what gives it its real footprint/height, per VOLUMETRIC WALL LAW (real
// BoxGeometry with height, never a flat plane) — never re-created per call.
let INTERIOR_UNIT_BOX = null;
function interiorUnitBoxGeometry(){
  if(!INTERIOR_UNIT_BOX) INTERIOR_UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
  return INTERIOR_UNIT_BOX;
}

// DUNGEON-GRAPH.md U3 render-quality study card (a/e/f variants): "baked vertex AO — darken wall-floor
// seams". A true per-vertex bake doesn't apply to a shared-geometry InstancedMesh (every instance reuses
// the SAME unit-cube vertices) — the INSTANCE-level equivalent this rig uses instead is a per-instance
// COLOR darken on any floor/door cell 4-adjacent to a wall cell (the contact seam), which is what the
// reference repo's screenshots actually read as: the darker line right where a wall meets the floor.
// Pure function over the plain instance arrays — no THREE, easy to unit-test, applied only when the
// study rig's AO variant is on (product callers never set this; see setInteriorVariant below).
function interiorApplyAODarkening(instances, factor){
  const wallKeys = new Set((instances.wall || []).map((w) => w.x + "," + w.z));
  const AO_FACTOR = (typeof factor === "number" && factor > 0 && factor < 1) ? factor : 0.45; // default = card-v6 pick; variant.aoFactor sweeps it (intensity taste card)
  ["floor", "doorframe"].forEach((kind) => {
    (instances[kind] || []).forEach((inst) => {
      const seam = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => wallKeys.has((inst.x + dx) + "," + (inst.z + dz)));
      if(!seam) return;
      const c = new THREE.Color(inst.color || "#ffffff").multiplyScalar(AO_FACTOR);
      inst.color = "#" + c.getHexString();
    });
  });
  return instances;
}

// BW2-3 MATERIAL TEXEL — INSTANCE-COLOR NEUTRALIZATION. A floor/wall InstancedMesh multiplies its
// texture map by each instance's per-cell COLOR (setColorAt). Those colors are the kit's DARK palette
// anchor (floorColor/wallColor) modulated by the scene value-scripts (BW2-4 rim plunge, VP3 perimeter
// darken/tone jitter) — perfect for the PROCEDURAL painter, whose texture is a near-flat tint of that
// same base. But a FOLDED file texture already carries full realm color, so multiplying by the dark
// base double-darkens it to near-black under the plunged ambient (the gloom R1 read). Fix: convert
// each per-cell color to a NEUTRAL grey VALUE MULTIPLIER = its luminance RELATIVE to the kit base — so
// a normal cell reads the texture at full value, while a perimeter/AO-darkened cell still darkens it
// proportionally (the rim vignette + contact seam survive; only the absolute dark HUE is dropped, which
// the texture now supplies itself). Pure over the plain instance list (returns a shallow-cloned list).
function itrNeutralizeInstanceColors(list, baseHex){
  const base = new THREE.Color(baseHex || "#808080");
  const baseLum = Math.max(0.02, 0.299 * base.r + 0.587 * base.g + 0.114 * base.b);
  return (list || []).map(function(inst){
    const c = new THREE.Color(inst.color || baseHex || "#808080");
    const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    const g = Math.max(0, Math.min(1.2, lum / baseLum)); // relative value; >1 clamped so it never blows out
    return Object.assign({}, inst, { color: "#" + new THREE.Color(g, g, g).getHexString() });
  });
}

// one InstancedMesh per tile KIND (floor/wall/doorframe/pillar) — the draw-call budget DUNGEON-GRAPH.md
// U3's acceptance names ("draw calls <= 1 per tile kind"), however many hundreds/thousands of instances
// an 80-room plan carries. `list` is one of data.instances.{floor,wall,doorframe,pillar} (§ interiorBuildBoard,
// src/ui/theater-interior.js) — each entry {x,z,sx,sy,sz,color}. Ground convention matches the existing
// tile-column math a few hundred lines up (mesh.position.y = h/2-0.5 -> every column's base sits on the
// SAME y=-0.5 floor plane): here that's y = sy/2 - 0.5. `variant.banded` (study rig only) routes through
// applyPsxShaderTweaks' quantized-lighting injection.
function interiorBuildInstancedMesh(list, cx, cz, texture, variant, shadowKind, ghostOpacity){
  if(!list || !list.length) return null;
  const geo = interiorUnitBoxGeometry();
  const vertical = shadowKind === "wall" || shadowKind === "pillar" || shadowKind === "doorframe";
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md): a caller passing a numeric `ghostOpacity` wants THIS
  // mesh built as the translucent GHOST overlay for an already-ankle-stubbed occluder list (see
  // itrSplitOccluderForAnkleGhost) rather than the normal opaque mesh — every existing call site never
  // passes a 7th argument, so `isGhost` is false and this function's behavior is byte-identical to
  // before this unit for every non-S-1 caller.
  const isGhost = typeof ghostOpacity === "number";
  const matBase = texture ? { map: texture } : { color: 0xffffff };
  if(isGhost) Object.assign(matBase, { transparent: true, opacity: ghostOpacity, depthWrite: false });
  const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(matBase), {
       banded: !!(variant && variant.banded), bandedSteps: variant && variant.bandedSteps,
       baseAO: (variant && variant.ao && vertical) ? { floor: variant.aoFactor || 0.45, range: 0.22 } : null, // tight contact band — 0.45 spread read as mush (pixel-diff proved it rendered, eyes said no)
       worldSurface: true, // GRAPHICS-ENGINE law 2 (VP0): the interior channel's floor/wall/doorframe/pillar
                            // materials are its WORLD surfaces — gate dither+snap through WORLD_PSX_ENABLED
       worldPsxOverride: (variant && typeof variant.worldPsx === "boolean") ? variant.worldPsx : undefined });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  // BW2-1b — TEST/DIAGNOSTIC TAG: which instance-kind this mesh is (floor/wall/doorframe/pillar/
  // skirt) — a plain read-only userData stamp (harmless to production rendering) so a harness can
  // pick the SOLID kinds (wall/pillar/doorframe) out of S.interiorGroup.children for a real
  // THREE.Raycaster occlusion check (_interiorRaycastClearForTest, below) without this file needing
  // to expose the raw mesh references any other way. S-1: a ghost overlay is tagged kind+"-ghost" —
  // deliberately NOT one of the solid tags _interiorRaycastClearForTest filters on, since a translucent
  // ghost is exactly the geometry that should read as "sightline clear" now.
  mesh.userData.interiorKind = isGhost ? (shadowKind + "-ghost") : shadowKind;
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: wall/floor/pillar/doorframe instanced meshes cast AND
  // receive real shadows on an interior board (harmless while renderer.shadowMap.enabled is false on
  // the combat/tabletop path — these flags are simply never consulted there). Floors are the one
  // exception on cast: a floor slab casting onto itself/adjacent floor cells buys nothing and only
  // costs shadow-map budget, so floors receive-only, everything else casts+receives. S-1: a ghost
  // overlay (~5% opacity) neither casts nor receives — a near-invisible slab throwing/catching a full
  // shadow would read as a visual bug, not atmosphere.
  mesh.receiveShadow = isGhost ? false : (shadowKind !== "skirt");
  mesh.castShadow = isGhost ? false : (shadowKind !== "floor" && shadowKind !== "skirt");
  const m = new THREE.Matrix4();
  const colorObj = new THREE.Color();
  // GR4: every OTHER kind grows UP off the shared y=-0.5 floor plane (position.y = sy/2-0.5, this
  // function's own header comment); the skirt is the one kind that hangs DOWN off that same plane
  // instead — its own top face sits flush at y=-0.5 and it extends downward by its own sy, reading as
  // the underside of the floating slab rather than a second floor layer.
  const skirtBand = shadowKind === "skirt";
  // BEAUTY-WAVE-2.md BW2-5: `yBase` (default 0, so every pre-existing instance renders IDENTICALLY to
  // before this unit) lets a prism's bottom sit ABOVE the shared floor plane instead of always growing
  // up off it — arch-header prisms stacking on top of a doorframe, a tapered column's narrower cap.
  // `ox`/`oz` (also default 0) offset the instance WITHIN its own cell — door-reveal jambs sitting in
  // the margin beside a narrower frame, sub-cell furniture-assembly prisms.
  list.forEach((inst, i) => {
    const yBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
    const y = skirtBand ? (-0.5 - (inst.sy || 1) / 2) : (yBase + (inst.sy || 1) / 2 - 0.5);
    m.compose(
      new THREE.Vector3((inst.x + (inst.ox || 0)) - cx, y, (inst.z + (inst.oz || 0)) - cz),
      new THREE.Quaternion(),
      new THREE.Vector3(Math.max(0.01, inst.sx || 1), Math.max(0.01, inst.sy || 1), Math.max(0.01, inst.sz || 1))
    );
    mesh.setMatrixAt(i, m);
    colorObj.set(inst.color || "#ffffff");
    mesh.setColorAt(i, colorObj);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

// BW2-5 THE COLUMN DEMOTION: pillar instances now carry an optional `profile` field (square/round/
// tapered/broken/tapered-cap — theater-interior.js's own column-roll comment). square/tapered/broken/
// tapered-cap stay box-based (scale/height differences alone read the profile, same shared box
// InstancedMesh every other kind already uses); "round" gets a small dedicated CylinderGeometry
// InstancedMesh instead — columns are now RARE (<=1/room, most rooms earn none), so this NEVER
// meaningfully grows the draw-call budget dev/verify-dungeon-interior.mjs check 2 guards (that check
// only asserts board.instances' own KEYS, which this split never touches — it's a pure GL-layer
// interpretation of the SAME `pillar` array).
let INTERIOR_CYLINDER_GEO = null;
function interiorCylinderGeometry(){
  if(!INTERIOR_CYLINDER_GEO) INTERIOR_CYLINDER_GEO = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
  return INTERIOR_CYLINDER_GEO;
}
function interiorBuildPillarMeshes(list, cx, cz, variant, pillarTex, ghostOpacity){
  const boxList = (list || []).filter((p) => p.profile !== "round");
  const roundList = (list || []).filter((p) => p.profile === "round");
  const meshes = [];
  // BW2-3 §2b COLUMNS: per-face planar from the WALL sheet (pillarTex) — box pillars route it through
  // interiorBuildInstancedMesh's own map path, round pillars get it below. null on non-flagship/off ->
  // the pre-BW2-3 flat-colored pillar, unchanged.
  const boxMesh = interiorBuildInstancedMesh(boxList, cx, cz, pillarTex || null, variant, "pillar", ghostOpacity);
  if(boxMesh) meshes.push(boxMesh);
  if(roundList.length){
    const geo = interiorCylinderGeometry();
    // S-1 OCCLUSION FADE: same ghost-overlay convention interiorBuildInstancedMesh's own box path uses
    // — round pillars are rare (<=1/room) but must fade too when they're the occluder.
    const isGhost = typeof ghostOpacity === "number";
    const roundMatBase = pillarTex ? { map: pillarTex } : { color: 0xffffff };
    if(isGhost) Object.assign(roundMatBase, { transparent: true, opacity: ghostOpacity, depthWrite: false });
    const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial(roundMatBase), {
      banded: !!(variant && variant.banded), bandedSteps: variant && variant.bandedSteps, worldSurface: true,
      worldPsxOverride: (variant && typeof variant.worldPsx === "boolean") ? variant.worldPsx : undefined
    });
    const mesh = new THREE.InstancedMesh(geo, mat, roundList.length);
    mesh.receiveShadow = !isGhost; mesh.castShadow = !isGhost;
    const m = new THREE.Matrix4(); const colorObj = new THREE.Color();
    roundList.forEach((inst, i) => {
      const yBase = (typeof inst.yBase === "number") ? inst.yBase : 0;
      const y = yBase + (inst.sy || 1) / 2 - 0.5;
      m.compose(
        new THREE.Vector3((inst.x + (inst.ox || 0)) - cx, y, (inst.z + (inst.oz || 0)) - cz),
        new THREE.Quaternion(),
        new THREE.Vector3(Math.max(0.01, inst.sx || 1), Math.max(0.01, inst.sy || 1), Math.max(0.01, inst.sz || 1))
      );
      mesh.setMatrixAt(i, m);
      colorObj.set(inst.color || "#ffffff");
      mesh.setColorAt(i, colorObj);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    meshes.push(mesh);
  }
  return meshes;
}

/* window.Theater.setInteriorBoard(data) — DUNGEON-GRAPH.md U3's tray-render entry point for a
   src/ui/theater-interior.js `interiorBuildBoard(plan, opts)` output ({kind:"interior3d", env, realmId,
   wallHeightBase, fog, tileKit, instances:{floor,wall,doorframe,pillar}, bounds, meta}). Peer to
   setBoard (above), not a wrapper over it — an interior board's geometry (real-height wall PRISMS via
   InstancedMesh) is a materially different shape than the combat tile-column grid, so this owns its own
   group (S.interiorGroup) and its own camera-fit/fog bookkeeping, while reusing setBoard's proven
   conventions (dirty-key skip, clearGroup, placeCamera, applyLightProfile) wherever the shape lines up.
   Clears S.tileGroup/S.propGroup too (and setBoard, above, clears S.interiorGroup) so switching between
   a combat board and a standing-table interior tray never leaves the OTHER render's meshes on stage. */
// DUNGEON-GRAPH.md U3 iteration-2, ruling 2: cap total shadow-CASTING lights per interior board —
// each shadow-casting PointLight is its own shadow-map render pass, so an unbounded count on an
// 80-room whole-plan render would tank frame time. Non-casting lights still LIGHT the scene (real
// PointLight, real falloff, real color) — they just skip the shadow-map cost. Nearest-to-focus wins
// (see interiorAssignShadowCasters below); this is a render-BUDGET cap, not a data-shape cap — U3's
// own instance/draw-call budget is untouched.
const INTERIOR_SHADOW_CASTER_CAP = 4;
const INTERIOR_SHADOW_MAP_SIZE = 512; // small per-light map — 4 lights x 512^2 stays cheap on the dev machine

// deterministic distance-sort + cap: the CENTER (cx,cz) is the focus-room-or-whole-plan centroid
// setInteriorBoard already computes (the SAME point placeCamera aims at) — lights nearest that point
// are the ones actually inside/adjacent the room the camera is looking at, so they're the ones worth
// paying the shadow-map cost for.
function interiorAssignShadowCasters(lights, cx, cz){
  const withDist = (lights || []).map((l, i) => ({
    l, i, d: Math.hypot((l.x || 0) - cx, (l.z || 0) - cz)
  }));
  withDist.sort((a, b) => a.d - b.d);
  const casterIdx = new Set(withDist.slice(0, INTERIOR_SHADOW_CASTER_CAP).map((w) => w.i));
  return (lights || []).map((l, i) => Object.assign({}, l, { castShadow: casterIdx.has(i) }));
}

// BW2-4 addendum (Adam, mid-flight: "I don't think I have seen any... in-world light sources") — THE
// LIGHT-MARKER SWAP. Adam's ruling 2 asked the source to "read as an object, not magic"; U3's first cut
// was a bare flame-colored RECTANGLE quad, which reads at board distance as a floating orange rectangle
// (Adam's complaint). Two replacements, both deterministic (same seeds, no RNG):
//  (a) EVERY light gets a soft additive GLOW DISC (radial-gradient, not a hard-edged rectangle) at the
//      flame point — the universal "this point emits" read, and the flicker channel's opacity target.
//  (b) Realms with a light-primary dressing card (INTERIOR_LIGHT_CARD) additionally get that card
//      standing self-lit on the floor at the light seed — a lantern/candle OBJECT (mock-01-finale.png
//      stands floor lanterns exactly this way). Where no card exists, the glow disc alone stands in.
// A realmId -> floor-standing light-card slug map. Grepped from assets/dressing: gloom/fantasy carry
// lantern/candle cards today; realms without one fall through to the glow-disc-only path (never a bare
// rectangle again). The emitter card never casts a shadow (it sits AT the light — a self-shadow on its
// own pool is degenerate) and is self-lit (MeshBasicMaterial), so it reads at the plunged ambient.
const INTERIOR_LIGHT_CARD = {
  gloom: "gloom-clutter-lanternrust",
  fantasy: "fantasy-clutter-lanternhook",
  chrome: "chrome-flora-lightpod", // BW2-4b item 5: chrome's folded light-pod card so its cones stand on a real fixture too
};
const INTERIOR_LIGHT_CARD_HEIGHT = 1.1; // world units — a small floor lantern, well under standee height
let INTERIOR_GLOW_TEXTURE = null;
function interiorGlowTexture(){
  if(INTERIOR_GLOW_TEXTURE) return INTERIOR_GLOW_TEXTURE;
  const size = 64;
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // a soft glow — never nearest
  INTERIOR_GLOW_TEXTURE = tex;
  return tex;
}
// the soft additive glow disc — a camera-facing group (userData.sprite) so updateSpriteBillboardYaw
// turns it to face the camera; returns {group, mesh} so the flicker channel can pulse mesh.opacity.
function interiorBuildGlowDisc(light){
  // BW2-4b item 5 — CONE FIXTURES: the disc was too small/faint to read as a fixture at the cone apex,
  // so the cones looked like they beamed from bare air. Sized up (0.5/0.6 -> 0.85/1.0) and opacity
  // raised so a real hot emitter reads at every apex in EVERY realm (a floor light-card, where the realm
  // has one — INTERIOR_LIGHT_CARD — additionally grounds it, but the apex fixture is this disc).
  const size = (light.kind === "lamp" ? 0.85 : 1.0);
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshBasicMaterial({
    map: interiorGlowTexture(), color: light.color || "#ffbb66",
    transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own glow never shadows itself
  const group = new THREE.Group();
  group.add(mesh);
  group.userData.sprite = true;
  return { group, mesh };
}
// the floor-standing emitter card (self-lit lantern/candle) — mirrors buildDressingCard's construction
// (dressingTextureFor's always-available placeholder-or-real join, alpha-cutout, psxExempt) but never
// casts a shadow (it sits AT its own light) and stands at a fixed small lantern height.
function interiorBuildLightCard(slug){
  const tex = dressingTextureFor(slug);
  const h = INTERIOR_LIGHT_CARD_HEIGHT;
  const geo = new THREE.PlaneGeometry(h, h);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  mesh.castShadow = false; mesh.receiveShadow = false;
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.sprite = true;
  g.userData.dressingSlug = slug;
  g.userData.lightEmitterMarker = "card"; // P-1 problem 3 test-facing tag — see _interiorLightEmittersForTest
  return g;
}

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
const ITR_LIGHT_EMITTER_NUB_RADIUS = 0.16; // world units — a small stub, well under a standee's own scale
const ITR_LIGHT_EMITTER_NUB_HEIGHT = 0.3;
function interiorBuildLightEmitterNub(light){
  const geo = new THREE.CylinderGeometry(ITR_LIGHT_EMITTER_NUB_RADIUS * 0.7, ITR_LIGHT_EMITTER_NUB_RADIUS, ITR_LIGHT_EMITTER_NUB_HEIGHT, 8);
  const mat = new THREE.MeshBasicMaterial({ color: light.color || "#ffbb66" });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = ITR_LIGHT_EMITTER_NUB_HEIGHT / 2;
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own tiny fixture never shadows itself (same discipline as the glow disc/card)
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.lightEmitterMarker = "nub"; // test-facing tag — see _interiorLightEmittersForTest
  return g;
}

// BEAUTY-WAVE-3.md BW3-4 — LIGHT SHAFTS: the classic cheap fake-volumetric "god ray" — a single
// camera-yaw-facing gradient-cone billboard per light, apex at the flame/lamp point, widening
// DOWNWARD to the room's own floor (interiorFloorTopAt — the derived law, never a bare -0.5 plane),
// bridging the glow-disc marker to the floor pool the mock (mock-01-fantasy-explore.png) reads as one
// warm shaft. Cheap quads only: one PlaneGeometry + one CanvasTexture, additive+depthWrite:false (never
// occludes — the same "additive glow" family the glow disc/light card already are), no ray-marching,
// no post pass (BW3-0's composer seam is a sibling unit — this stays independent of it, same MeshBasic
// family as everything else in this render).
const ITR_LIGHT_CONE_WIDTH_RATIO = 0.55; // base (floor) width as a fraction of the apex->floor height
const ITR_LIGHT_CONE_MIN_HEIGHT = 0.6;   // guards a degenerate sliver when a light sits almost on the floor
const ITR_LIGHT_CONE_OPACITY = { lamp: 0.22, torch: 0.3 }; // a whisper — this is atmosphere, not a second light source
// docs/DIEGETIC-LIGHT.md L-1 — CONE GATE (Adam's ruling 2026-07-11, fork F1): the volumetric god-ray
// cone reads as a magic beam, not a diegetic point light's real falloff — "remove the cone behind a
// reversible flag... keep only the emissive flame/glow marker + the point light's real falloff."
// Defaults OFF. interiorBuildLightCone itself is UNTOUCHED (still callable, still under test via
// window.Theater._interiorBuildLightConeForTest) — only its MOUNT call site in interiorBuildLights
// (below) is gated. Reversible in one line for the re-shoot: flip this literal, or call
// window.Theater.setLightConeEnabled(true) at runtime.
let ITR_LIGHT_CONE_ENABLED = false;
let INTERIOR_CONE_TEXTURE = null;
// a triangular alpha gradient painted onto a plain rectangle (the fake-cone trick: the QUAD stays a
// simple billboard, the CONE SHAPE lives entirely in the texture's alpha) — apex at canvas top (y=0,
// centered), base spanning most of the canvas width at the bottom; a vertical gradient additionally
// fades the whole shape toward transparent by the floor so the shaft reads as dissipating light, not a
// hard-edged wedge.
function interiorConeTexture(){
  if(INTERIOR_CONE_TEXTURE) return INTERIOR_CONE_TEXTURE;
  const w = 128, h = 256;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);    // apex — the flame/lamp point
  ctx.lineTo(w * 0.14, h); // floor-pool left edge
  ctx.lineTo(w * 0.86, h); // floor-pool right edge
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.5, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // a soft gradient — never nearest
  INTERIOR_CONE_TEXTURE = tex;
  return tex;
}
// `height` is the apex->floor world-unit span (interiorBuildLights computes this off the light's own
// y and interiorFloorTopAt, below) — returns {group, mesh} so the flicker channel can pulse
// mesh.material.opacity in sync with its light, same contract as interiorBuildGlowDisc.
function interiorBuildLightCone(light, height){
  const h = Math.max(ITR_LIGHT_CONE_MIN_HEIGHT, height);
  const w = h * ITR_LIGHT_CONE_WIDTH_RATIO;
  const geo = new THREE.PlaneGeometry(w, h);
  const baseOpacity = ITR_LIGHT_CONE_OPACITY[light.kind] != null ? ITR_LIGHT_CONE_OPACITY[light.kind] : ITR_LIGHT_CONE_OPACITY.torch;
  const mat = new THREE.MeshBasicMaterial({
    map: interiorConeTexture(), color: light.color || "#ffbb66",
    transparent: true, opacity: baseOpacity, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  // the texture's apex (canvas y=0) maps to the plane's own top edge — shifting the mesh DOWN by
  // half its height puts that top edge at the group's local origin (where the group gets positioned
  // to the light's own apex point, below), so the cone's wide base descends from there toward the
  // floor, never the reverse.
  mesh.position.y = -h / 2;
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own volumetric shaft never shadows itself
  const group = new THREE.Group();
  group.add(mesh);
  group.userData.sprite = true; // camera-yaw-facing billboard, same convention as the glow disc/light card
  return { group, mesh };
}

// data.lights -> {group, casters} — builds one THREE.PointLight + one emissive marker mesh per light
// entry (src/ui/theater-interior.js's interiorBuildBoard emits the plain {x,z,y,color,intensity,kind,
// roomSegNum} data; this is the ONE place that becomes real THREE objects, same "data in theater-
// interior.js, GL in theater-boot.js" split the rest of this render already keeps). Shadow-casting
// lights get a small shadow-map budget (INTERIOR_SHADOW_MAP_SIZE) + a near/far tuned to interior room
// scale (never the board-wide combat camera's frustum).
function interiorBuildLights(lights, cx, cz, realmId, floorTopMap, pieces){
  const group = new THREE.Group();
  const assigned = interiorAssignShadowCasters(lights, cx, cz);
  let casters = 0;
  // BW2-4 addendum: the realm's floor-standing emitter card (INTERIOR_LIGHT_CARD), or null -> glow-disc
  // only. Kept once per build (not per light) since it's a pure realm lookup.
  const cardSlug = (realmId && INTERIOR_LIGHT_CARD[realmId]) || null;
  // BW2-4b item 7a — COLLISION: skip the floor light-CARD (a lantern/candle at the light seed) when a
  // piece already stands on that cell, or the lantern reads mounted above the standee's head. The glow
  // disc + cone stay (they sit at flame height, above the piece — no collision). Cell keys off the raw
  // piece cellX/cellY (same space the light x/z uses).
  const pieceCells = new Set((pieces || []).map((p) => (p.cellX || 0) + "," + (p.cellY || 0)));
  // VP6 item 2: every interior light source joins the shared flicker channel (startLightFlicker,
  // above) at INTERIOR_LIGHT_FLICKER_AMPLITUDE — collected here (not started here) so setInteriorBoard
  // can hand the finished list to ONE startLightFlicker call alongside the board's own S.pointLights.
  const flickerTargets = [];
  assigned.forEach((light) => {
    const pl = new THREE.PointLight(
      light.color || "#ffbb66",
      // BW2-4 item 1: render-side gain (see ITR_LIGHT_RENDER_GAIN) — the DATA intensity is the relative
      // value; this is the absolute decay-2 pool brightness. Preserves the fill<=60%-of-key ratio (both
      // key and fill are gained equally).
      (light.intensity != null ? light.intensity : 1.2) * ITR_LIGHT_RENDER_GAIN,
      // BW2-4b item 1 — LIGHT RANGE CAP: tighten each pool to a small hot circle (the mock read) so the
      // gaps between torches go genuinely dark (the BRIGHTNESS LAW's dark-corner requirement).
      Math.min(light.distance != null ? light.distance : 12, ITR_LIGHT_DISTANCE_CAP),
      light.decay != null ? light.decay : 2
    );
    pl.position.set((light.x || 0) - cx, light.y != null ? light.y : 1.4, (light.z || 0) - cz);
    if(light.castShadow){
      pl.castShadow = true;
      pl.shadow.mapSize.set(INTERIOR_SHADOW_MAP_SIZE, INTERIOR_SHADOW_MAP_SIZE);
      pl.shadow.camera.near = 0.1;
      pl.shadow.camera.far = light.distance != null ? light.distance : 12;
      pl.shadow.bias = -0.002;
      casters++;
    }
    group.add(pl);
    // BW2-4 addendum — THE LIGHT-MARKER SWAP: a soft additive glow disc at the flame point (replaces the
    // old bare rectangle marker), plus — where the realm has one — a self-lit lantern/candle card
    // standing on the floor at the light seed. The glow disc is the flicker channel's opacity target.
    const glow = interiorBuildGlowDisc(light);
    glow.group.position.copy(pl.position);
    if(light.kind !== "lamp") glow.group.position.y -= 0.15; // torch flame sits slightly below its light point (on the sconce)
    group.add(glow.group);
    // BW3-4 — LIGHT SHAFTS: one cone per light source, apex at the SAME point as the glow disc just
    // above (so shaft and marker read as one coherent light) — the earlier interiorFloorTopAt call
    // this unit reads is the SAME derived floor law the light-card branch below already uses, never a
    // second/parallel floor formula. Its base reaches THIS light's own floor top exactly (the mock's
    // shaft bridges flame->floor, not flame->some fixed generic drop).
    // L-1 (DIEGETIC-LIGHT.md): gated — the cone only mounts (and only joins the flicker channel) when
    // ITR_LIGHT_CONE_ENABLED is true. Off by default: the glow disc + light-card + the point light's
    // own falloff carry the "where light comes from" read on their own.
    const floorTopAtLight = interiorFloorTopAt(floorTopMap, light.x || 0, light.z || 0);
    const coneHeight = glow.group.position.y - floorTopAtLight;
    const cone = ITR_LIGHT_CONE_ENABLED ? interiorBuildLightCone(light, coneHeight) : null;
    if(cone){
      cone.group.position.copy(glow.group.position);
      group.add(cone.group);
    }
    if(!pieceCells.has(Math.round(light.x || 0) + "," + Math.round(light.z || 0))){
      if(cardSlug){
        const card = interiorBuildLightCard(cardSlug);
        const floorTop = interiorFloorTopAt(floorTopMap, light.x || 0, light.z || 0);
        card.position.set((light.x || 0) - cx, floorTop, (light.z || 0) - cz);
        group.add(card);
      } else if(ITR_LIGHT_EMITTER_NUB_ENABLED){
        // P-1 problem 3 — no dressing card for this realm: seat a tiny self-lit emitter nub instead so
        // the glow disc still reads as coming FROM something, same collision guard as the card branch.
        const nub = interiorBuildLightEmitterNub(light);
        const floorTop = interiorFloorTopAt(floorTopMap, light.x || 0, light.z || 0);
        nub.position.set((light.x || 0) - cx, floorTop, (light.z || 0) - cz);
        group.add(nub);
      }
    }
    const fallbackConeOpacity = ITR_LIGHT_CONE_OPACITY[light.kind] != null ? ITR_LIGHT_CONE_OPACITY[light.kind] : ITR_LIGHT_CONE_OPACITY.torch;
    flickerTargets.push({
      pl, marker: glow.mesh, cone: cone ? cone.mesh : null,
      baseIntensity: pl.intensity,
      baseOpacity: glow.mesh.material ? glow.mesh.material.opacity : 0.85,
      baseConeOpacity: (cone && cone.mesh.material) ? cone.mesh.material.opacity : fallbackConeOpacity,
      amplitude: INTERIOR_LIGHT_FLICKER_AMPLITUDE
    });
  });
  return { group, casters, flickerTargets };
}

// BEAUTY-WAVE.md VP6 item 3 — AMBIENT MOTES: 4-8 seeded drifting particle cards per room, ember-tinted
// for torch-lit realms / dust-tinted for lamp-lit ones (kit-driven, no new per-realm authoring table —
// reused off the SAME `light.kind` field interiorBuildLights already reads), slow vertical drift with
// wrap-around, additive blending (same "reads bright regardless of ambient" idiom as the light markers
// just above), tiny (0.05-0.12 world units — a speck, never a readable sprite). Seeded (mulberry32-style
// hash off a per-room string) so a room's mote field is stable across re-renders of the SAME board data,
// not re-rolled every frame/rebuild.
const MOTE_COUNT_MIN = 4, MOTE_COUNT_MAX = 8;
const MOTE_SIZE_MIN = 0.05, MOTE_SIZE_MAX = 0.12;
function moteHash32(str){
  let h = 2166136261 >>> 0;
  const s = String(str || "");
  for(let i = 0; i < s.length; i++){ h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; }
  return h >>> 0;
}
// a tiny deterministic PRNG seeded from moteHash32 — mulberry32, the same shape every other seeded-RNG
// spot in this codebase already uses (dspHashStr-adjacent convention in theater-interior.js), reimplemented
// locally rather than imported since this ES module can't reach that classic-script helper.
function moteRng(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// ember (torch/lava-flavored) is the default; a room whose lights are ALL "lamp" kind reads dust instead
// (dry/dusty interiors — lamplit halls, not open flame) — mirrors interiorBuildLightMarker's own
// isLamp branch rather than inventing a second per-realm classification.
function interiorMoteKindFor(lights){
  const list = lights || [];
  if(list.length && list.every((l) => l.kind === "lamp")) return "dust";
  return "ember";
}
const MOTE_TINT = { ember: 0xffb066, dust: 0xcfc9a8 };
// BW3-4 — MOTE COUPLING: a room's dust biases toward its own light pools (the mock's warm shaft reads
// as dust visible IN the light, not scattered evenly through a dark room) — MOTE_POOL_BIAS_FRACTION of
// spawns land within MOTE_POOL_RADIUS of a (seed-picked, deterministic) light center; the rest spawn
// uniformly across the room exactly like pre-unit VP6 did. A lightless room (no `lights` arg, or an
// empty one) degrades to that pre-unit uniform behavior byte-for-byte — see the pools.length guard
// below, and dev/verify-bw3-4-light-shafts.mjs's own regression check against the pre-unit call shape.
const MOTE_POOL_BIAS_FRACTION = 0.65;
const MOTE_POOL_RADIUS = 1.8;
function interiorBuildMotes(seedStr, bounds, kind, lights, cx, cz){
  const group = new THREE.Group();
  const b = bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  // BW3-4 COORDINATE FIX: `bounds` (data.bounds) is the board's RAW, pre-origin-shift footprint —
  // every OTHER piece of interior geometry (floor/wall/light/piece meshes, setInteriorBoard's own
  // convention throughout this file) mounts at (rawX - cx, rawZ - cz), cx/cz being the camera-fit
  // rect's own center. The pre-BW3-4 call site here passed raw bounds straight through with NO shift
  // at all, so the mote field silently floated at a (+cx,+cz) offset from the room it was meant to
  // dust whenever cx/cz != 0 (any room not centered on the whole-board origin — i.e. almost always on
  // a real multi-room plan) — invisible or drifting over the WRONG room entirely. Fixed here (this
  // unit's own pool-bias math needs the SAME coordinate space as `lights` to mean anything: a "bias
  // toward the pool" that's itself rendered in the wrong place doesn't read as coupling at all).
  // cx/cz default to 0 so a caller that still omits them (the pre-unit 3-arg call shape) is a clean
  // no-op shift, byte-identical to the old behavior.
  const shiftX = cx || 0, shiftZ = cz || 0;
  const minX = b.minX - shiftX, maxX = b.maxX - shiftX, minZ = b.minZ - shiftZ, maxZ = b.maxZ - shiftZ;
  const rng = moteRng(moteHash32(seedStr));
  const count = MOTE_COUNT_MIN + Math.floor(rng() * (MOTE_COUNT_MAX - MOTE_COUNT_MIN + 1));
  const color = MOTE_TINT[kind] || MOTE_TINT.ember;
  const yBottom = -0.2, yTop = 2.2; // a modest drift band above the floor, well under wall-height ceilings
  // shifted pool centers — same coordinate space as minX/maxX/minZ/maxZ above (raw light x/z, same
  // shift applied). An absent/empty `lights` list yields an empty pools array, which the per-mote loop
  // below treats identically to "no coupling" (the pre-unit uniform spawn).
  const pools = (lights || []).map((l) => ({ x: (l.x || 0) - shiftX, z: (l.z || 0) - shiftZ }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
  for(let i = 0; i < count; i++){
    const size = MOTE_SIZE_MIN + rng() * (MOTE_SIZE_MAX - MOTE_SIZE_MIN);
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    let x, z;
    // MOTE COUPLING: pools.length is the ONLY gate — a lightless room never draws the extra rng() call
    // below, so its rng SEQUENCE (and therefore every downstream x/z/y/size/speed draw) stays exactly
    // what pre-unit interiorBuildMotes produced for the same seed (short-circuit && never evaluates
    // the right side when pools.length is 0).
    if(pools.length && rng() < MOTE_POOL_BIAS_FRACTION){
      const pool = pools[Math.floor(rng() * pools.length)];
      const angle = rng() * Math.PI * 2;
      const r = rng() * MOTE_POOL_RADIUS;
      x = Math.min(maxX, Math.max(minX, pool.x + Math.cos(angle) * r));
      z = Math.min(maxZ, Math.max(minZ, pool.z + Math.sin(angle) * r));
    } else {
      x = minX + rng() * Math.max(0.01, maxX - minX);
      z = minZ + rng() * Math.max(0.01, maxZ - minZ);
    }
    const y = yBottom + rng() * (yTop - yBottom);
    mesh.position.set(x, y, z);
    mesh.userData.motePiece = true;
    mesh.userData.driftSpeed = 0.04 + rng() * 0.05; // world units/sec, slow
    mesh.userData.wrapBottom = yBottom;
    mesh.userData.wrapTop = yTop;
    group.add(mesh);
  }
  return group;
}
// self-stopping rAF drift loop — same dedicated-loop discipline as startLightFlicker's setInterval
// (a continuous ambient effect, not a one-shot tween), self-stops the instant the mote group is gone
// (board swap/retire) rather than depending on an external caller to remember to cancel it.
function startMoteDrift(){
  if(S.moteRaf) return;
  let last = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  const step = (now) => {
    now = now || ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now());
    if(!S.mounted || !S.moteGroup || !S.moteGroup.children.length){ S.moteRaf = null; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.moteGroup.children.forEach((m) => {
      m.position.y += m.userData.driftSpeed * dt;
      if(m.position.y > m.userData.wrapTop) m.position.y = m.userData.wrapBottom;
    });
    markDirty();
    S.moteRaf = requestAnimationFrame(step);
  };
  S.moteRaf = requestAnimationFrame(step);
}
function stopMoteDrift(){
  if(S.moteRaf != null){ cancelAnimationFrame(S.moteRaf); S.moteRaf = null; }
}

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

// data.pieces -> billboard sprites standing IN the room (DUNGEON-GRAPH.md U3 iteration-2, ruling 3:
// "creatures render at true scale... standing on the floor"). Each entry {slug, cellX, cellY,
// scaleVsHuman?} joins the sprite registry, but — BEAUTY-WAVE.md VP1 fix — sizes through
// interiorSpriteBillboard's OWN true-scale math (HUMAN_TRUE_HEIGHT * scaleTrue), NOT
// buildSpriteBillboard's tabletop render-height-multiplier convention (the kaiju bug: a medium
// creature inherited several world units of TABLE height in a room where 1 unit = 5ft). `entry.floor`
// (the registry's ground-contact-line fraction, up from the image's bottom edge) offsets the quad
// down so that line — not just the image's bottom pixel row — sits on y=-0.5, the room floor plane
// (a flying/floating creature's registry entry can sit its silhouette correctly without this function
// knowing anything about flight). Returns {group, resolved, requested} so setInteriorBoard can expose
// "did every piece sprite resolve" on window.Theater for the capture rig's metrics (a piece whose slug
// doesn't join the registry, or whose texture hasn't loaded yet, silently skips — same total-function/
// never-throw discipline every other figure resolution in this file keeps).
// BW2-1b + BW2-5 integration merge: prismLists (CLIP MARGIN LAW) and daisTop (finale dais
// preferDais bias) are BOTH additive tail params — the two units landed in parallel worktrees
// and compose here.
function interiorBuildPieces(pieces, cx, cz, wallHeightBase, floorTopMap, trimColor, prismLists, daisTop){
  const group = new THREE.Group();
  // VP7 CONTACT GROUNDING: blobs live in their OWN sibling sub-group, appended to `group` once at
  // the end — NOT interleaved into `group`'s direct children — so existing/other callers walking
  // `group.children` in piece order (this function's own established contract: "same order as the
  // pieces array", relied on by dev/verify-dungeon-interior.mjs's VP1 checks) see byte-identical
  // indices to before this unit.
  const blobGroup = new THREE.Group();
  let resolved = 0;
  // BEAUTY-WAVE-4.md MF-2 item 3 (DRESSING/FURNITURE CASCADE — pieces are the room's own creatures/
  // set-pieces, the SAME "the room sets itself" mount reveal the spec names): every piece resolved
  // this pass is collected here so mfCascadeMount can rank+stagger the whole set ONCE at the end,
  // rather than each piece guessing its own delay independent of its siblings.
  const mountEntries = [];
  // 0.95 * wall height: a titanic-in-a-human-room is a SCALE-DOMAIN problem, not a rendering one —
  // this cap only keeps a piece from visibly poking through the ceiling.
  const wallCap = (typeof wallHeightBase === "number" && wallHeightBase > 0) ? wallHeightBase * 0.95 : null;
  (pieces || []).forEach((p) => {
    const base = spriteEntryFor(p.slug);
    if(!base) return;
    const entry = Object.assign({}, base, {
      scaleVsHuman: p.scaleVsHuman != null ? p.scaleVsHuman : base.scaleVsHuman
    });
    const built = interiorSpriteBillboard(entry, wallCap);
    if(!built) return; // texture not loaded yet — falls through, same as every other billboard resolution
    // BEAUTY-WAVE-2.md BW2-5 item 3: "the boss standee's cell prefers the dais top". An opt-in
    // mechanism, additive/non-breaking — a piece the caller tags `preferDais:true` with NO explicit
    // cellX/cellY defaults onto the board's own finale-room dais anchor (data.daisTop, src/ui/theater-
    // interior.js's itrDaisAnchor) when one exists; every existing caller that sets a real cellX/cellY
    // (or doesn't tag preferDais at all) behaves exactly as before.
    if(p.preferDais && p.cellX == null && p.cellY == null && Array.isArray(daisTop) && daisTop.length){
      const anchor = (p.roomSegNum != null) ? (daisTop.find((d) => d.roomSegNum === p.roomSegNum) || daisTop[0]) : daisTop[0];
      if(anchor){ p = Object.assign({}, p, { cellX: anchor.x, cellY: anchor.y }); }
    }
    const g = built.group;
    const floorFrac = (typeof base.floor === "number") ? base.floor : 0;
    // BW2-4b item 7c — BLOCKER-CELL EXCLUSION: shift a piece off any pillar/doorframe cell it landed on
    // (the loop-05 wolf-on-a-pillar) to the nearest clear cell before any contact/kilter/clip math reads
    // it. prismLists = [wallList, pillarList, doorframe]; slice(1) drops walls (perimeter, handled by the
    // clip nudge). Render-only — the caller's combat cell ownership (p.cellX/Y) is never rewritten.
    const rawCellX = p.cellX || 0, rawCellY = p.cellY || 0;
    const freeCell = itrBlockerNudgeCell(rawCellX, rawCellY, (prismLists || []).slice(1));
    const cellX = freeCell.x, cellY = freeCell.y;
    // BW2-2: the ground-contact line (image-bottom when floor=0) sits on THIS cell's own real floor
    // TOP (interiorFloorTopAt — the derived law, never the bare -0.5 plane) plus its own plinth base
    // (interiorStandeeContactY) — replaces the pre-BW2-2 hardcoded "-0.5 - floorFrac*height" that
    // assumed every floor tile was paper-thin and sat exactly at y=-0.5 (it doesn't; see this file's
    // own FLOOR CONTACT LAW header comment a few screens up for the measured burial this caused).
    const floorTop = interiorFloorTopAt(floorTopMap, cellX, cellY);
    const contactY = interiorStandeeContactY(floorTop);
    // BW2-2b item 4 (THE KILTER) + CLIP MARGIN LAW (BW2-1b addendum), COMPOSED at the integration
    // merge per the spec's own ordering note ("apply kilter BEFORE his clip check runs"): the kilter
    // offsets first (hand-placed-mini read), then the clip nudge is tested AT the kiltered position
    // so a kilter that would push a wide sprite into a wall is corrected by the same pass. Both are
    // visual offsets only — cell ownership (cellX/cellY) is UNTOUCHED. The contact pool below reads
    // g.position.x/z directly, so pool/base/sprite all share the final composed offset.
    const kilter = kilterFor(p.slug + ":" + cellX + "," + cellY);
    const clipNudge = itrClipNudgeFor(cellX + kilter.dx, cellY + kilter.dz, built.width * 0.5, prismLists);
    if(clipNudge.clamped){
      console.warn("qa: sprite-oversize", { slug: p.slug, cellX, cellY, rawMagnitude: clipNudge.rawMagnitude, clampedTo: clipNudge.magnitude });
    }
    g.position.set(
      cellX - (cx || 0) + kilter.dx + clipNudge.x,
      contactY - floorFrac * built.height,
      cellY - (cz || 0) + kilter.dz + clipNudge.z // origin-shifted like every tile/light (the v3 card bug: raw cell coords rendered pieces outside the fitted frame)
    );
    g.userData.kilterYawDeg = kilter.yawDeg; // read every frame by updateSpriteBillboardYaw's face()
    // BW2-2 STANDEE BASES: a plinth cylinder under this piece, radius off its own rendered world
    // width (spec: 0.42x) — added as a CHILD of `g`, a plain SIBLING of `g`'s own inner sprite wrap
    // (buildSpriteBillboardMesh) so BW2-2b's floor-alignment fix (updateSpriteBillboardYaw) leaves it
    // floor-flat under everyday camera tilt, while still tipping WITH the sprite when fall-death moves
    // `g`'s own rotation.x (see buildInteriorBase's own header for the full mechanism).
    const baseMesh = buildInteriorBase(built.width * INTERIOR_BASE_RADIUS_FRAC, trimColor);
    g.add(baseMesh);
    g.userData.standeeBaseMesh = baseMesh; // setActingUnit's BW2-2b glow-toggle target
    g.userData.interiorTrueScale = true;
    g.userData.interiorHeight = built.height;
    g.userData.interiorWidth = built.width;
    g.userData.interiorFloorFrac = floorFrac;
    g.userData.interiorBaseRadius = built.width * INTERIOR_BASE_RADIUS_FRAC;
    // DUNGEON-GRAPH.md finale-gate finding: a caller may tag an interior piece with the combat foe's
    // own `fid` (o.foes[i].fid, combat.js's combatStart) so play(verb,{who:fid}) — the SAME production
    // standee-verb entry point combat damage already routes through (§A STANDEE VERBS WIRING, this
    // file's STANDEE_VERB_FOR_THEATER_VERB table) — can resolve a piece standing in an interior room,
    // not just a unit built by setUnits(). Optional/additive: a piece with no `fid` is untagged and
    // behaves exactly as before.
    if(p.fid != null) g.userData.unitId = String(p.fid);
    group.add(g);
    // VP7 CONTACT GROUNDING: one pool per piece, at the SAME (x,z) as the piece's own floor-
    // contact position — added to the sibling `blobGroup` (not as a child of `g`, and not
    // interleaved into `group`'s own direct children) so it survives at a fixed world y even if a
    // caller later re-tweens `g`'s own rotation (e.g. a tipped fall-death card, STANDEE_VERBS'
    // fall-death — the corpse keeps its ground anchor because the pool isn't parented to the
    // tilting wrapper), and existing callers walking `group.children` in piece order see no change.
    // BW2-2: seated off THIS cell's own real floor top, not the old hardcoded -0.495.
    addInteriorContactBlob(blobGroup, g.position.x, g.position.z, built.width, floorTop);
    // VP6 item 1: idle-breathe auto-plays on every living piece the instant it mounts (a fresh
    // fall-death corpse never reaches this — dead pieces are re-mounted by the NEXT setInteriorBoard
    // call with p.fid's own userData never carrying userData.corpse from a torn-down prior group, so
    // this is a clean re-roll for a genuinely-new mount; a corpse persisting WITHIN one mount's
    // lifetime is fall-death's own stopIdleBreathe(...,true) call, not this mount-time start).
    bindStandeeCtx(buildTheaterCtx());
    startIdleBreathe(g, p.slug + ":" + p.cellX + "," + p.cellY);
    // BEAUTY-WAVE-4.md MF-2 item 3: this piece's own mount-grace entry, keyed the SAME slug+cell
    // identity kilterFor/idle-breathe already use — staggered below, once every piece has resolved.
    mountEntries.push({ group: g, key: p.slug + ":" + cellX + "," + cellY });
    resolved++;
  });
  group.add(blobGroup);
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return { group, resolved, requested: (pieces || []).length };
}

// GRAPHICS-ENGINE.md GR2 §D DRESSING SYSTEM (render half) — data.dressing entries (src/engine/
// place-dressing.js's dressPlan output: {slug,x,y,primary,cardKind,roomSegNum,lightAffine?}) mount
// as upright CARDS, the same standee construction billboard pieces already use (nearestify, alpha-
// cutout, camera-facing yaw+tilt via updateSpriteBillboardYaw's face(), tagged userData.sprite so
// that function's existing "walk S.interiorGroup one level deep" scan already picks these up with
// zero changes there), shadow-casting, sized by CARD_SIZE_BY_KIND off the entry's own `cardKind`
// (small/medium/large, mirroring the manifest's own `size` field).
const CARD_SIZE_BY_KIND = { small: 0.6, medium: 1.0, large: 1.6 };
function dressingCardHeight(cardKind){
  return CARD_SIZE_BY_KIND[cardKind] != null ? CARD_SIZE_BY_KIND[cardKind] : CARD_SIZE_BY_KIND.medium;
}

// synchronously-built label-card CanvasTexture — the dev-only stand-in for a not-yet-generated
// assets/dressing/<slug>.png (DRESSING-GEN runs in the codex after this unit; see this file's own
// GR2 header note above). Small, legible, nearest-filtered (matches every other procedural texture
// this file builds, e.g. interiorPatternTexture) so it reads clearly as "placeholder art", not a
// rendering bug, at study-card distances.
function dressingPlaceholderTexture(slug){
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#2a2a2a"; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#c9a85c"; ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 120, 120);
  ctx.fillStyle = "#e8e8e8";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // word-wrap the slug across a few lines — long dressing slugs (e.g. "gloom-clutter-mausoleumdoor-
  // shard") need to break somewhere to stay legible in a 128px card.
  const words = String(slug || "dressing").split("-");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const next = line ? line + "-" + w : w;
    if(next.length > 14 && line){ lines.push(line); line = w; } else { line = next; }
  });
  if(line) lines.push(line);
  const lineH = 14, startY = 64 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, 64, startY + i * lineH));
  const tex = new THREE.CanvasTexture(canvas);
  nearestify(tex);
  return tex;
}

// mirrors spriteTextureFor's async-load/replay convention (this file's own established pattern) but
// NEVER returns null: a cache miss synthesizes+caches the placeholder immediately (so the caller's
// card mounts on the very first render pass, no pending/blank state) while a real
// assets/dressing/<slug>.png load races in the background; on success the cache entry is swapped to
// the real texture and S.lastBoard is replayed (same "null the dirty key, resend" trick), so real art
// drops in with ZERO code change the moment DRESSING-GEN's files land. A failed load just keeps the
// placeholder forever (loader that "falls back cleanly", per this unit's own brief) — never retried,
// never throws.
function dressingTextureFor(slug){
  const cached = DRESSING_TEXTURE_CACHE[slug];
  if(cached) return cached;
  const placeholder = dressingPlaceholderTexture(slug);
  DRESSING_TEXTURE_CACHE[slug] = placeholder;
  textureLoader.load(
    "assets/dressing/" + slug + ".png",
    function(tex){
      nearestify(tex);
      DRESSING_TEXTURE_CACHE[slug] = tex;
      if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d"){
        S.boardKey = null;
        setInteriorBoard(S.lastBoard);
      }
    },
    undefined,
    function(){ /* no assets/dressing/<slug>.png yet (or failed) — placeholder stays permanently */ }
  );
  return placeholder;
}

// a single dressing card group — same construction discipline as buildSpriteBillboard (SPRITE PURITY:
// psxExempt, no dither/vertex-snap on card pixels; camera-facing group, feet-at-origin, alpha-cutout
// shadow casting via a MeshDepthMaterial keyed off the same texture) — kept as its OWN function
// (not a buildSpriteBillboard call) since dressing cards resolve via dressingTextureFor (always-
// available placeholder-or-real) rather than the sprite registry's resolved-or-null join.
function buildDressingCard(entry){
  const tex = dressingTextureFor(entry.slug);
  const h = dressingCardHeight(entry.cardKind);
  const geo = new THREE.PlaneGeometry(h, h);
  // BW2-4b item 1 — LIT cutout family: dressing cards RECEIVE the scene like the standee billboards
  // (same MeshLambert + emissive readability floor, same BRIGHTNESS LAW) so a floor-clutter card in a
  // dark corner reads dim, not pasted-bright. Purity holds (lighting response only). Debug seam mirrors
  // the standee's so a full-bright reference frame captures cards unlit too.
  const mat = SPRITE_UNLIT_DEBUG
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: ITR_SPRITE_EMISSIVE_TINT, emissiveIntensity: ITR_SPRITE_EMISSIVE_FLOOR,
        transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true
      });
  mat.userData.psxExempt = true; // SPRITE PURITY — cards are flat painted art, never PS1-distorted
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    map: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking
  });
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.sprite = true; // updateSpriteBillboardYaw's existing scan picks this group up unmodified
  g.userData.dressingSlug = entry.slug;
  return g;
}

// BEAUTY-WAVE-2.md BW2-5 FURNITURE CHANNEL — "mid-room verticality is FURNITURE, not columns" (the
// chrome mock's crates/cabinets/machines). Real multi-prism BoxGeometry assemblies (furnitureFor(kind,
// realm), src/ui/theater-interior.js — the shared builder ROOM-GRAMMAR.md §4 names as its own
// dependency), textured per PACKET-02's planar-face law (textureFaceFor(realm,face) || the procedural
// panel fallback below — PACKET-02's crate-face arrivals haven't landed yet).
const FURNITURE_PANEL_TEXTURE_CACHE = {};
function proceduralPanelTexture(realm, face, baseColorHex){
  const key = realm + ":" + face + ":" + baseColorHex;
  if(FURNITURE_PANEL_TEXTURE_CACHE[key]) return FURNITURE_PANEL_TEXTURE_CACHE[key];
  const pixels = materialTexturePixels("mottle", baseColorHex, "furniture:" + key, MATERIAL_TEXEL_PX, 0.09);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width; canvas.height = pixels.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  nearestify(tex);
  FURNITURE_PANEL_TEXTURE_CACHE[key] = tex;
  return tex;
}
function furniturePanelMaterial(realm, face, baseColorHex){
  // BW2-3: textureFaceFor now returns a folded PACKET-02 face-tile FILE PATH (flagships) or null. A
  // path loads as a per-face planar ClampToEdge texture (§2b FURNITURE law — one self-contained face
  // tile per face, never wrapped); null falls back to the procedural panel painter. Same seam shape.
  const faceFile = textureFaceFor(realm, face);
  const tex = (faceFile ? interiorFileTexture(faceFile, "clamp", 1, 1) : null)
    || proceduralPanelTexture(realm, face, baseColorHex);
  return applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ map: tex }), { worldSurface: true });
}
function buildFurnitureAssembly(entry){
  const recipe = furnitureFor(entry.kind, entry.realmId);
  const kit = INTERIOR_TILE_KITS ? (INTERIOR_TILE_KITS[entry.realmId] || INTERIOR_TILE_KITS.chrome) : null;
  const baseColorHex = (kit && kit.trimColor) || "#8a7a63";
  const group = new THREE.Group();
  recipe.prisms.forEach((p) => {
    const geo = new THREE.BoxGeometry(Math.max(0.02, p.sx), Math.max(0.02, p.sy), Math.max(0.02, p.sz));
    const mat = furniturePanelMaterial(entry.realmId, p.face, baseColorHex);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.dx || 0, (p.yBase || 0) + p.sy / 2, p.dz || 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });
  group.userData.furnitureKind = recipe.kind;
  group.userData.dressingSlug = entry.slug;
  return group;
}
// data.furniture -> group of furniture assemblies, origin-shifted the SAME way every other interior
// mount already is (cx/cz subtraction) — feet-on-floor via the SAME FLOOR CONTACT LAW every other
// mount point reads through (interiorFloorTopAt).
function interiorBuildFurniture(furniture, cx, cz, floorTopMap){
  const group = new THREE.Group();
  // BEAUTY-WAVE-4.md MF-2 item 3: "Dressing/FURNITURE on first room reveal" — furniture assemblies get
  // the SAME seeded stagger cascade as data.pieces/data.dressing (see mfCascadeMount's own header).
  const mountEntries = [];
  (furniture || []).forEach((f) => {
    if(!f || !f.slug) return;
    const g = buildFurnitureAssembly(f);
    const floorTop = interiorFloorTopAt(floorTopMap, f.x || 0, f.y || 0);
    g.position.set((f.x || 0) - (cx || 0), floorTop, (f.y || 0) - (cz || 0));
    g.userData.dressingSlug = f.slug;
    group.add(g);
    mountEntries.push({ group: g, key: f.slug + ":" + f.x + "," + f.y });
  });
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return group;
}

// ADDENDUM — THE PROP PERSPECTIVE LAW: surface-attached props mount as real SHALLOW-EXTRUSION prisms,
// wall-LOCKED (never camera-billboarded — that's the whole bug this fixes: a billboard always faces
// the camera regardless of which wall it's mounted on, so at a fixed isometric angle a "screen" can
// read backwards). Side/back faces are EDGE-SAMPLED off the SAME art texture's own outermost opaque
// pixel ring (automatic — no second authored color source), front face is the real dressing art.
const ITR_EDGE_COLOR_CACHE = {};
function itrPropEdgeColorFor(slug, tex){
  if(ITR_EDGE_COLOR_CACHE[slug]) return ITR_EDGE_COLOR_CACHE[slug];
  let color = "#3a3a3a"; // safe neutral fallback (image not yet loaded / canvas-tainted / degenerate)
  try {
    const img = tex && tex.image;
    if(img && img.width && img.height){
      const cvs = document.createElement("canvas");
      cvs.width = img.width; cvs.height = img.height;
      const cctx = cvs.getContext("2d");
      cctx.drawImage(img, 0, 0);
      const data = cctx.getImageData(0, 0, img.width, img.height).data;
      const margin = Math.max(1, Math.round(Math.min(img.width, img.height) * 0.04));
      let r = 0, g = 0, b = 0, n = 0;
      const sample = (x, y) => {
        if(x < 0 || y < 0 || x >= img.width || y >= img.height) return;
        const i = (y * img.width + x) * 4;
        if(data[i + 3] < 40) return; // skip near-transparent — "the outermost OPAQUE ring"
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      };
      for(let x = 0; x < img.width; x++){ sample(x, margin); sample(x, img.height - 1 - margin); }
      for(let y = 0; y < img.height; y++){ sample(margin, y); sample(img.width - 1 - margin, y); }
      if(n > 0){
        const hx = (v) => Math.round(v).toString(16).padStart(2, "0");
        color = "#" + hx(r / n) + hx(g / n) + hx(b / n);
      }
    }
  } catch(e) { /* cross-origin/canvas-tainted or not-yet-loaded image — keep the safe fallback */ }
  ITR_EDGE_COLOR_CACHE[slug] = color;
  return color;
}
// front (+z local) faces AWAY from the wall the prop is mounted on, into the room — "n"/"s"/"e"/"w"
// names which side the adjacent WALL cell sits on (itrWallSideAt, src/ui/theater-interior.js).
const ITR_WALL_SIDE_YAW = { n: 0, s: Math.PI, w: -Math.PI / 2, e: Math.PI / 2 };
function buildExtrusionProp(entry){
  const tex = dressingTextureFor(entry.slug);
  const h = dressingCardHeight(entry.cardKind);
  const depth = Math.max(0.01, entry.depth || 0.05);
  const geo = new THREE.BoxGeometry(h, h, depth);
  const sideColorHex = itrPropEdgeColorFor(entry.slug, tex);
  // BW2-4b item 1 — LIT cutout family: the extrusion prop's FRONT (art) face receives the scene too
  // (the side faces are already MeshLambert), so a wall-hung painting/screen tracks the plunge with its
  // own edges instead of glowing full-bright off a dark wall. Purity holds (lighting response only).
  const frontMat = SPRITE_UNLIT_DEBUG
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: true })
    : new THREE.MeshLambertMaterial({
        map: tex, emissiveMap: tex, emissive: ITR_SPRITE_EMISSIVE_TINT, emissiveIntensity: ITR_SPRITE_EMISSIVE_FLOOR,
        transparent: true, alphaTest: 0.5, depthWrite: true
      });
  frontMat.userData.psxExempt = true; // SPRITE PURITY — the art face is flat painted art, never PS1-distorted
  const sideMat = new THREE.MeshLambertMaterial({ color: sideColorHex });
  // BoxGeometry material-group order: 0:+x 1:-x 2:+y 3:-y 4:+z 5:-z — the art sits on +z (index 4)
  const mesh = new THREE.Mesh(geo, [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]);
  mesh.position.y = h / 2;      // same "bottom edge at group origin" convention buildDressingCard keeps
  mesh.position.z = depth / 2;  // the -z (BACK) face sits flush on the wall plane; extrudes +z into the room
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ map: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking });
  const g = new THREE.Group();
  g.rotation.y = ITR_WALL_SIDE_YAW[entry.wallSide] || 0;
  g.add(mesh);
  g.userData.dressingSlug = entry.slug;
  g.userData.extrusionProp = true; // deliberately NOT userData.sprite — wall-LOCKED, never camera-billboarded
  g.userData.extrusionHeight = h;   // BW2-2b integration: wall-contact AO sizes its halo off this
  return g;
}
function interiorBuildWallProps(wallProps, cx, cz, floorTopMap){
  const group = new THREE.Group();
  (wallProps || []).forEach((d) => {
    if(!d || !d.slug) return;
    const g = buildExtrusionProp(d);
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    g.position.set((d.x || 0) - (cx || 0), floorTop, (d.y || 0) - (cz || 0));
    // BW2-2b item 5b (wired here at the integration merge): WALL-CONTACT AO now attaches to the
    // EXTRUSION prop, not the old flat wall-hang card — BW2-5 rerouted wall-hangs through this
    // builder (interiorBuildDressing skips primary:"wall-hang" entirely), which made BW2-2b's
    // original in-loop AO call dead code. The AO halo mounts as a child of the extrusion group,
    // sitting a hair behind the prop's back face (the wall plane) so it reads as the seam shadow
    // hugging where the object meets the wall — exactly the mock's painting vignette, and per the
    // extrusion addendum's own coordination note ("your extrusion gives that band a real volume
    // edge to hug").
    addWallContactAO(g, (g.userData && g.userData.extrusionHeight) || 1, 0.005);
    group.add(g);
  });
  return group;
}

// data.dressing -> group of dressing card standees, origin-shifted the SAME way tiles/lights/pieces
// already are (the v3 card bug class this unit's own brief calls out by name: raw cell coords render
// outside the fitted camera frame — every mount in this function goes through the (cx,cz) subtraction,
// no exceptions).

// BW2-2b item 5b — WALL-CONTACT AO. Every wall-hung dressing card (REALM_DRESSING roster entries
// tagged `primary:"wall-hang"` in src/engine/place-dressing.js — paintings, the chrome broken-screen,
// wall clutter) gets a soft dark gradient card mounted directly BEHIND its own billboard at the
// attachment seam, per Adam's read of the mock's painting ("a soft dark vignette hugging the wall
// around the frame"): "same CanvasTexture-gradient channel as the pool" (the spec's own words) —
// interiorPoolGeoFor/interiorPoolMaterial ARE that channel, reused verbatim rather than a second
// texture/material path. The pool rotates that same PlaneGeometry flat (-90 deg on X) to lie on the
// floor; this quad leaves it in its AUTHORED orientation (facing +Z, buildSpriteBillboard's own
// convention) and mounts it as a CHILD of the card's own billboard group at a small negative local Z —
// "behind" the card in the group's own local frame, which rides along with whatever camera-facing
// yaw+tilt updateSpriteBillboardYaw gives the PARENT group every frame (this AO quad is a grandchild,
// never independently tagged userData.sprite, so it never gets its own separate facing pass — it just
// inherits the parent's transform for free, always reading as flush behind the card from every yaw
// step). Sized larger than the card so it "halos" past the card's own edges rather than reading as a
// hard-edged rectangle. Cheap: one extra quad per wall-hang, no SSAO pass.
const WALL_AO_SCALE = 1.6;     // same multiplier as the pool's own feather-extent (footprint x 1.6)
const WALL_AO_Z_OFFSET = -0.02;
function addWallContactAO(cardGroup, cardHeight, zOffset){
  const radius = Math.max(0.05, (cardHeight || 1) * 0.5 * WALL_AO_SCALE);
  const mesh = new THREE.Mesh(interiorPoolGeoFor(radius), interiorPoolMaterial());
  // zOffset: flat billboard cards sit at local z=0 with the camera-facing pass yawing the group, so
  // "behind the card" is NEGATIVE local z (the original -0.02). An EXTRUSION prop's back face sits ON
  // the wall plane at local z=0 with the room toward +z, so its seam halo must sit a hair in FRONT of
  // the wall (+0.005) to be visible around the prop's silhouette — the caller picks per mount type.
  mesh.position.set(0, (cardHeight || 1) / 2, (typeof zOffset === "number") ? zOffset : WALL_AO_Z_OFFSET);
  mesh.userData.wallContactAO = true; // verify hook — per-wall-hang AO presence/count check
  cardGroup.add(mesh);
  return mesh;
}
function interiorBuildDressing(dressing, cx, cz, floorTopMap, prismLists){
  const group = new THREE.Group();
  // VP7 CONTACT GROUNDING: same sibling-subgroup convention as interiorBuildPieces' blobGroup
  // (below) — blobs never interleave into `group`'s own direct children.
  const blobGroup = new THREE.Group();
  // BEAUTY-WAVE-4.md MF-2 item 3: dressing cards get the SAME seeded stagger cascade as
  // data.pieces/data.furniture — "the room sets itself" applies to every set-piece family.
  const mountEntries = [];
  (dressing || []).forEach((d) => {
    if(!d || !d.slug) return;
    // BW2-5: blocker-primary entries render as furniture-class volumes (interiorBuildFurniture,
    // off the sibling data.furniture array) and wall-hang entries as extrusion props
    // (interiorBuildWallProps, off data.wallProps) — both derived from this SAME dressing roll, so
    // skip them here to avoid mounting the same entry twice.
    if(d.primary === "blocker" || d.primary === "wall-hang") return;
    const g = buildDressingCard(d);
    // BW2-2: feet on THIS cell's own real floor top (interiorFloorTopAt — the derived law), replacing
    // the pre-BW2-2 hardcoded -0.4 (that value's own comment falsely claimed parity with pieces' -0.5
    // convention — it was actually 0.1 units higher, and still 0.1 below the true nominal floor top;
    // see this file's FLOOR CONTACT LAW header for the measured numbers). Dressing gets NO plinth base
    // (per the mock, ui-sketches/mock-frames/mock-01-gloom-combat.png — only combat-representing
    // standees carry a base; a tombstone/torch/painting sits directly on the floor).
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    // CLIP MARGIN LAW (Adam addendum, mid-flight on BW2-1b), item 2 — LARGE cards only ("every
    // interior piece + large dressing card" is VP7's own existing large-only carve-out, reused
    // here): may TOUCH the wall plane (that's the point, dpAdjacentToWall already seeds it there) but
    // never pass THROUGH it — resolved via the SAME itrClipNudgeFor circle-vs-prism push, radius
    // inflated by CLIP_DRESSING_EPSILON so the card's own true edge clears the wall face by a hair
    // (no magnitude cap/warning: a wall-adjacent card's own overlap is always small by construction).
    let dressNudge = { x: 0, z: 0 };
    if(d.cardKind === "large"){
      dressNudge = itrClipNudgeFor((d.x || 0), (d.y || 0), dressingCardHeight(d.cardKind) / 2 + CLIP_DRESSING_EPSILON, prismLists, { maxMag: 1 });
    }
    g.position.set((d.x || 0) - (cx || 0) + dressNudge.x, floorTop, (d.y || 0) - (cz || 0) + dressNudge.z);
    group.add(g);
    // VP7 CONTACT GROUNDING: large dressing cards only (§VP7: "every interior piece + large
    // dressing card") — small/medium cards (crates, wall clutter) stay floater-free by spec.
    if(d.cardKind === "large"){
      addInteriorContactBlob(blobGroup, g.position.x, g.position.z, dressingCardHeight(d.cardKind), floorTop);
    }
    mountEntries.push({ group: g, key: d.slug + ":" + d.x + "," + d.y });
  });
  group.add(blobGroup);
  mfCascadeMount(buildTheaterCtx(), mountEntries, function(entry){ return entry.key; });
  return group;
}

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
    const scaleTrue = (base && typeof base.scaleTrue === "number" && base.scaleTrue > 0)
      ? base.scaleTrue
      : (typeof p.scaleVsHuman === "number" && p.scaleVsHuman > 0) ? p.scaleVsHuman : null;
    if(scaleTrue == null) return; // unresolved piece (texture/registry not loaded yet) — skip, don't guess
    const h = HUMAN_TRUE_HEIGHT * scaleTrue;
    if(h > tallest) tallest = h;
  });
  return tallest > 0 ? tallest : HUMAN_TRUE_HEIGHT;
}

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
function itrPillarCutawayMask(pillarList, cameraPos, sightPoints, cx, cz){
  const list = pillarList || [];
  if(!cameraPos || !sightPoints || !sightPoints.length) return list.map(() => false);
  return list.map((inst) => {
    const halfX = Math.max(0.01, (inst.sx || 1)) / 2;
    const halfY = Math.max(0.01, (inst.sy || 1)) / 2;
    const halfZ = Math.max(0.01, (inst.sz || 1)) / 2;
    const centerX = (inst.x || 0) - (cx || 0), centerZ = (inst.z || 0) - (cz || 0);
    const centerY = (inst.sy || 1) / 2 - 0.5;
    const boxMin = { x: centerX - halfX, y: centerY - halfY, z: centerZ - halfZ };
    const boxMax = { x: centerX + halfX, y: centerY + halfY, z: centerZ + halfZ };
    return sightPoints.some((pt) => itrSegmentIntersectsAabb(cameraPos, pt, boxMin, boxMax));
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
const ITR_PILLAR_STUB_FRAC = 0.12;
function itrPillarStubHeight(wallHeightBase){
  const base = (typeof wallHeightBase === "number" && wallHeightBase > 0) ? wallHeightBase : 2.4;
  return base * ITR_PILLAR_STUB_FRAC;
}
// S-1 alias — the SAME ankle-height deriver, named for its wider (wall+pillar) role in the occlusion
// fade path below (itrPillarStubHeight kept as the historical/tested name the BW2-1b harness seam
// already exposes).
const itrOcclusionAnkleHeight = itrPillarStubHeight;
// TEST-ONLY SEAM (dev/verify-occlusion-fade.mjs's own RED-FIRST proof): forces setInteriorBoard's
// wall/pillar occlusion pass off entirely (both kinds render at their ORIGINAL full height, no ankle
// stub, no ghost) so a harness can render the "nothing occludes this frame at all" baseline and prove
// a figure directly behind a full-height occluder genuinely reads occluded BEFORE trusting the fixed
// (default-on) render's green. No product caller ever sets this — false everywhere except the harness.
let ITR_OCCLUSION_FADE_DISABLED_FOR_TEST = false;
// S-1 GHOST OPACITY — Adam's own number ("~5%"): the removed upper portion of an occluding wall/pillar
// renders at this opacity instead of vanishing outright, so the player can still tell a column/wall is
// there while the figure behind it reads clearly through it.
const ITR_OCCLUSION_GHOST_OPACITY = 0.05;
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
  const stubH = Math.min(fullH, ankleH);
  const stub = Object.assign({}, inst, { yBase: origYBase, sy: stubH });
  const ghostH = fullH - stubH;
  const ghost = ghostH > 1e-6 ? Object.assign({}, inst, { yBase: origYBase + stubH, sy: ghostH }) : null;
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

function setInteriorBoard(data){
  if(!S.mounted || !data) return;
  // BEAUTY-WAVE-4.md MF-1: capture the TRUE live camera pose as the very FIRST thing this function
  // does — before drainTweens() (a few lines down) gets a chance to force-complete an in-flight
  // camera-pose tween to ITS end pose. drainTweens' own job is legitimate (force-settle tweens whose
  // Object3D/material handles are about to be disposed by the clearGroup calls that follow it) — a
  // camera-pose tween doesn't hold any such handle (it only ever touches the persistent S.camera), so
  // it's harmless for drainTweens to complete it too, but doing so BEFORE this capture point would
  // silently defeat MF-1's own "retarget from the CURRENT interpolated pose" contract (found live
  // debugging this unit: a fit fired mid-glide always re-derived its start from the OLD tween's own
  // end, never the live mid-flight pose, because drainTweens had already snapped to it by the time the
  // old capture point — right before the preview placeCamera() call, much later in this function — ever
  // ran). Captured unconditionally (even on the dirty-key skip path below) — a wasted clone is cheap.
  const mf1PreFitPos = S.camera ? S.camera.position.clone() : null;
  const mf1PreFitTarget = S.cameraLookTarget ? S.cameraLookTarget.clone() : null;
  // DUNGEON-GRAPH.md U3 render-quality study card: S.interiorVariant (window.Theater.setInteriorVariant,
  // below) folds into the dirty key so a variant-only change (same board data, different AO/banded/fog
  // flags — exactly what the study rig does per scene) still forces a rebuild instead of skipping.
  const variant = S.interiorVariant || {};
  const dirtyKey = "interior:" + JSON.stringify(variant) + ":" + JSON.stringify(data);
  if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
  S.boardKey = dirtyKey;
  // BEAUTY-WAVE-4.md MF-2 item 4 (ROOM TRANSITION CROSSFADE): only a REAL swap gets the crossfade —
  // "walk/travel BOARD SWAPS", not this mount's very first room reveal (nothing to hide a cut FROM
  // yet; the dressing/piece cascade already wired into interiorBuildPieces/Dressing/Furniture is that
  // first reveal's own "the room sets itself" beat). S.lastBoard is still the PRIOR board here (this
  // function only overwrites it a few lines down) — truthy iff a board was already showing. The
  // overlay snaps OPAQUE synchronously, right here, BEFORE drainTweens/clearGroup/rebuild run — this
  // whole function is single-threaded JS, so no frame is ever painted mid-rebuild; the opaque snap is
  // what "the rebuild happens under it" means when the rebuild itself is synchronous. The fade back to
  // transparent (revealing the NEW room) is pushed once the rebuild + camera fit are done, at this
  // function's own tail below.
  const isRoomTransition = !!S.lastBoard;
  if(isRoomTransition && S.transitionEl){
    S.transitionEl.style.opacity = "1";
  }
  // GRAPHICS-ENGINE law 2b/VP0 (docs/BEAUTY-WAVE.md): the interior channel's own camera-mode switch.
  // `variant.camMode` (study-rig ONLY — dev/battle-gate/capture-two-flag-card.mjs's ortho/persp cells)
  // overrides the module default INTERIOR_CAM_MODE for this render only; no product caller ever sets
  // it, so this degrades to INTERIOR_CAM_MODE everywhere else. setBoard's own S.orthoCamera restore
  // (above) is the one place that ever swaps back to ortho for the tabletop channel — this is the one
  // place that ever swaps TO the perspective camera.
  const camMode = (variant.camMode === "ortho" || variant.camMode === "persp") ? variant.camMode : INTERIOR_CAM_MODE;
  const wantPersp = camMode === "persp";
  if(wantPersp && S.perspCamera && S.camera !== S.perspCamera) S.camera = S.perspCamera;
  else if(!wantPersp && S.orthoCamera && S.camera !== S.orthoCamera) S.camera = S.orthoCamera;
  window.Theater.stats.boardBuilds++;
  drainTweens(S);
  clearGroup(S.fxGroup);
  S.lastBoard = data;
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.interiorGroup);
  // BEAUTY-WAVE.md VP1c (THE LOOP-04 KAIJU PROBE, diagnosed this unit): production's own per-render
  // sync (src/world/render.js theaterStageSync) pushes the FLAT TABLETOP board+units into S.unitGroup/
  // S.shadowGroup (window.Theater.setBoard + setUnits) on every renderWorld() while GS.combat.active —
  // and dm.js's combat_start handler calls renderWorld() at the end of its own case. Those units size
  // through the pre-VP1 render-height-multiplier convention (GLB_TARGET_HEIGHT x entry.scale x
  // spriteSizeScaleFor), NOT the true-scale math VP1/VP1b gave interior pieces. Neither group was ever
  // cleared here, so a caller that drives combat_start and then separately mounts an interior tray
  // (window.Theater.setInteriorBoard — the dungeon-loop gate's own documented allowance, and any future
  // combat-in-a-room feature) inherited the leftover flat-tabletop meshes standing in the SAME world-
  // origin neighborhood the interior camera frames — the kaiju towering in the loop-04/05 contact-sheet
  // frames. An interior tray's creatures are pieces (VP1/VP1b's own true-scale render family); the flat
  // tabletop unit family must never coexist with it. setBoard already clears these same two groups for
  // the reverse direction (a tabletop board must not inherit a prior interior tray's leftover pieces);
  // this is the missing other half.
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  S.propOccupiedZones = {};
  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): setInteriorBoard never used to manage S.zoomLevel at
  // all (only setBoard's own small-board bias ever touched it) — a LATENT gap, harmless before this
  // unit since the pre-unit fit was always generously padded enough to absorb a stray leftover
  // zoomLevel from a prior flat-tabletop mount. It stops being harmless now: interiorCameraFitFor's
  // "beat" fit + placeCamera's own exact-containment correction (this unit) compute a precise
  // corrected auto-fit distance, and then apply S.zoomLevel ON TOP of it (by design — a PLAYER's own
  // manual Theater.zoom() call is intentionally allowed to crop past the auto-fit); a stale zoomLevel
  // inherited from a completely different board (the tabletop's own bias, or a previous interior
  // board's manual zoom) would silently re-introduce the exact crop this unit fixes. Reset to 1 on
  // every ACTUAL rebuild (the dirty-key skip above already returns before this line, so a caller
  // polling the SAME board every render tick never has an in-progress manual zoom reset out from
  // under it) — mirrors setBoard's own "a fresh board gets a fresh [zoom] reading" convention.
  S.zoomLevel = 1;
  S.isInteriorBoard = true; // placeCamera's own tabletop-vs-interior half-floor split
  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: interior boards get real shadow-mapping — the
  // tabletop/combat path's "no shadow maps" ruling (§2, this file's mount()-time default + setBoard's
  // own explicit restore below) is untouched; this is the ONE place shadow-mapping turns on.
  if(S.renderer) S.renderer.shadowMap.enabled = true;

  const b = data.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  // Camera framing: fit to the FOCUS ROOM when the board carries one (interiorBuildBoard's
  // focusRect — study card v3 "camera pulled into the room"); neighbors still render, they just
  // sit outside the fitted frame. Fallback: the whole board footprint, the original behavior.
  const fit = data.focusRect || b;
  const cx = (fit.minX + fit.maxX) / 2, cz = (fit.minZ + fit.maxZ) / 2;
  S.boardOrigin = { cx, cz };
  // BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA): the camera-FIT box (what placeCamera sizes/aims at) is
  // now independent of the geometry-mount origin shift above (cx/cz — untouched, room footprints stay
  // exactly where they always were, per this unit's own OUT OF SCOPE). data.cameraFit is a plain
  // caller-set field (data.pieces/data.dressing/data.lightProfile's own convention): absent boards
  // default to "room" mode, byte-identical in SHAPE to the pre-unit fit (still data.focusRect), just
  // CLOSER (see interiorCameraFitFor's own header). See that function for "beat" mode.
  const camFit = interiorCameraFitFor(data.cameraFit, fit, cx, cz);
  S.boardCenter = camFit.center;
  S.boardHalfX = camFit.halfX;
  S.boardHalfZ = camFit.halfZ;
  S.boardHalfExtent = Math.max(S.boardHalfX, S.boardHalfZ);
  // BEAUTY-WAVE-2.md BW2-1: see placeCamera's own screenHalfHeight comment — the fit above is FLOOR-
  // footprint-only; this is the standee-height correction term it's missing. An explicit
  // data.cameraFit.maxHeight wins (a caller who already knows its own roster's tallest piece); else
  // auto-derived from data.pieces' real true-scale heights (interiorSpriteBillboard's own UNCLAMPED
  // formula — deliberately ignoring the wall-height clamp, since the fit should account for a
  // creature's full intended height even where the render later clips it for ceiling clearance).
  S.interiorFitMaxHeight = interiorFitMaxHeightFor(data);
  S.lastGrid = null; // no band/lane grid on an interior tray — zoneToWorld/zoom-bias callers degrade to their own defaults

  // BEAUTY-WAVE-4.md MF-1: mf1PreFitPos/mf1PreFitTarget (captured at this function's very TOP, before
  // drainTweens() could force-complete an in-flight camera tween) are what placeCameraTweened() below
  // uses as its start pose — NOT a fresh read of S.camera here, since the preview placeCamera() call
  // just below is byte-identical to the authoritative one further down this function (see its own
  // comment: "idempotent... not a second/different fit") and would already have snapped the camera to
  // what becomes the "end" pose by the time control reaches past it.

  // BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 1: a PREVIEW placeCamera() call — every input
  // it reads (S.boardCenter/halfX/halfZ/halfExtent, S.interiorFitMaxHeight, S.rotationStep,
  // S.zoomLevel=1 just reset above, S.el's own DOM layout, S.camera's own persp/ortho type already
  // resolved above this line) is already final by this point in the function, and NOTHING between
  // here and this function's own later, authoritative placeCamera() call (below) changes any of
  // them — so this early call is a byte-identical, side-effect-free PREVIEW of the real camera
  // position (idempotent: calling it twice with no state change between calls yields the same
  // S.camera.position both times), not a second/different fit. It exists only so the CUTAWAY
  // pillar/wall-adjacent occlusion test below can raycast from the camera's REAL world position
  // instead of re-deriving a parallel approximation of it.
  placeCamera();
  const occlusionCameraPos = S.camera ? { x: S.camera.position.x, y: S.camera.position.y, z: S.camera.position.z } : null;

  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  S.realmProfile = null; // tileKit colors are already final (src/ui/theater-interior.js) — no second grade pass
  const kit = data.tileKit || {};
  // GR3 (docs/GRAPHICS-ENGINE.md build unit GR3, LIGHT RIG LAW): the kit's own gradeTint/gradeStrength
  // (src/ui/theater-interior.js's tileKit, GR3 addition) becomes a gradeColorLocal-shaped profile —
  // the SAME grade FUNCTION setBoard's own void-tint line already applies for the flat table (line
  // ~3981's `gradeColorLocal(voidTintFor(env), S.realmProfile)`), just sourced from the kit's own
  // authored numbers instead of data/realms.js's REALM_RENDER_DEFAULT table (GR3's "parity" is the
  // shared math, not a duplicated per-realm registry — the interior kits and the table's realm
  // profiles are deliberately two different authored sources, per REALM_MATERIALS' own sibling-
  // registry precedent one unit up). null when a kit carries no grade at all (an unresolved/legacy
  // realmId) -> gradeColorLocal's own no-op passthrough, never a thrown/undefined color.
  // study-rig ONLY toggle (dev/battle-gate/capture-interior-study.mjs's rig-on/rig-off card, mirroring
  // GR1's own materials-on/off convention): `variant.rig === false` drops the grade profile to null
  // (an honest "no GR3 grade" baseline) and dims the shared hemisphere key to 0 for THIS render — no
  // product caller ever sets S.interiorVariant, so this is a no-op everywhere except the study card.
  const rigOn = variant.rig !== false;
  if(S.hemiLight) S.hemiLight.intensity = rigOn ? HEMI_INTENSITY_DEFAULT : 0;
  const gradeProfile = (rigOn && kit.gradeStrength)
    ? { sat: 1, tintAmt: kit.gradeStrength, contrast: 1, tint: hexStrToNum(kit.gradeTint) }
    : null;
  // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4 STAGE LAW): "void backdrop tinted per realm — route
  // voidTintFor through the kit grade" — the fallback branch (a kit with no authored fog.color) now
  // grades voidTintFor(env) instead of using it raw; a kit-authored fog.color is graded too (the SAME
  // profile, so the two branches never diverge in how "final" a color reads).
  const fogColorNum = gradeColorLocal(
    (data.fog && data.fog.color) ? hexStrToNum(data.fog.color) : voidTintFor(env),
    gradeProfile
  );
  const fogColorObj = new THREE.Color(fogColorNum);
  // GR3: the interior fog DEFAULT is now the kit's own fogWhisper (tileKit.fogWhisper, GR3 addition) —
  // "fog off by default except a whisper where the realm earns it" REPLACES the old ad-hoc per-kit
  // `fog.density` numbers (0.02-0.035, GR1-era, no shared rationale). study-rig fog variant (d/f):
  // `variant.fog === false` still swaps in a near-zero-density FogExp2 instead of removing S.scene.fog
  // outright — placeCamera (above) unconditionally reads S.scene.fog.near/far when it exists, and
  // setBoard's own combat path expects SOME fog object to mutate .color on, so a null fog would
  // silently break the NEXT combat render rather than this one.
  const fogWhisper = (typeof kit.fogWhisper === "number" && isFinite(kit.fogWhisper)) ? kit.fogWhisper : 0;
  const fogDensity = variant.fog === false ? 0.0015 : fogWhisper;
  if(S.scene){
    S.scene.background = fogColorObj;
    S.scene.fog = new THREE.FogExp2(fogColorObj, fogDensity);
  }
  if(S.renderer) S.renderer.setClearColor(fogColorObj, 1);

  S.lightPropAnchor = null; // interior boards carry no light-prop registry mapping (data.light absent) — plain profile lighting
  // interior boards may name their own profile (the tile kits are dark-value surfaces; the "dark"
  // default reads near-black on them — study card v1/v2). Falls back to the standing default.
  applyLightProfile((data.lightProfile && LIGHT_PROFILES[data.lightProfile]) ? data.lightProfile : LIGHT_DEFAULT_PROFILE);

  // BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4, item 1) — interior scene-wide fill drop.
  // applyLightProfile just (a) floored ambient to STAGE_AMBIENT_FLOOR, (b) rebuilt the profile's own
  // overhead fill point(s) into S.pointLights. Both flatten the value structure the mocks avoid and
  // wash out the torch cast-shadows (addendum: shadows must READ). Drop all three here so the torch/
  // lamp data.lights carry the scene. Gated behind rigOn so the study-rig's honest "no GR3" baseline
  // (variant.rig === false) is untouched. MUST run BEFORE interiorBuildLights + startLightFlicker below
  // so the flicker bases (startLightFlicker snapshots S.pointLights[i].intensity) capture the plunged
  // fill, not the pre-plunge value. See ITR_SCENE_* constants (near HEMI_*) for the tuned numbers.
  if(rigOn){
    // docs/DIEGETIC-LIGHT.md L-4 / docs/LIGHT-SIGHT-POLISH.md P-1 — BRIGHT-REALM HEMISPHERE: daylit/
    // overcast/moonlit are the sun/moon/sky's OWN diegetic reach — they get a per-realm bright-fill row
    // (ITR_BRIGHT_REALM_FILL / itrBrightRealmFillFor, above) instead of the dim single-torch dungeon
    // model below (this is the "daylit lost-world reads darker than a torchlit crypt" inversion Adam
    // caught; S.lightProfileKey is set a moment ago by applyLightProfile above). P-1's own fix: this used
    // to be ONE global set of numbers (tuned for lost-world's dark jungle albedo) applied to every bright
    // realm alike — suburb's much lighter kit blew out under lost-world's numbers. Now keyed on
    // data.realmId, with a luminance-derived fallback for any realm with no explicit row.
    const isBrightRealm = ITR_BRIGHT_PROFILES.has(S.lightProfileKey);
    // docs/LIGHT-SIGHT-POLISH.md P-1 problem 2 — cosmic's voidlit gets its OWN dim/cool/legible path
    // (ITR_EMISSIVE_SCENE_*, above), distinct from both the dim dungeon default and the sunlit numbers.
    const isEmissiveRealm = !isBrightRealm && !ITR_EMISSIVE_FILL_DISABLED_FOR_TEST && ITR_EMISSIVE_PROFILES.has(S.lightProfileKey);
    const brightFill = isBrightRealm ? itrBrightRealmFillFor(data.realmId, kit) : null;
    // BW2-4b item 6 — THE GLOOM LIFT: gloom ONLY gets a small ambient bump (fantasy is the reference
    // register — never brightened). Every other non-bright/non-emissive realm keeps ITR_SCENE_AMBIENT
    // exactly.
    const gloomLift = (data.realmId === "gloom") ? ITR_GLOOM_AMBIENT_LIFT : 0;
    if(S.ambientLight) S.ambientLight.intensity = isBrightRealm ? brightFill.ambient : isEmissiveRealm ? ITR_EMISSIVE_SCENE_AMBIENT : (ITR_SCENE_AMBIENT + gloomLift);
    if(S.hemiLight) S.hemiLight.intensity = isBrightRealm ? brightFill.hemi : isEmissiveRealm ? ITR_EMISSIVE_SCENE_HEMI : ITR_SCENE_HEMI;
    (S.pointLights || []).forEach((l) => { l.intensity *= isBrightRealm ? brightFill.fillScale : isEmissiveRealm ? ITR_EMISSIVE_SCENE_FILL_SCALE : ITR_SCENE_FILL_SCALE; });
    // BW2-4b item 1 — THE BRIGHTNESS LAW: dim the tabletop key/fill DirectionalLights to a whisper for
    // the interior channel. They light a camera-facing billboard's normal at N·L~0.6, so at the mount
    // default (0.72/0.22) a sprite reads ~0.5 of full-bright everywhere BEFORE any torch — "full
    // brightness even in the dark", the exact thing the law forbids. setBoard restores the tabletop
    // values on its own path (mirroring the hemi restore just above the shadowMap toggle there).
    // L-4/P-1: bright realms restore these MOST of the way toward that tabletop default (sunlit, not
    // dim, and scaled per-realm); cosmic gets a faint star-key, well under the bright numbers.
    if(S.keyLight) S.keyLight.intensity = isBrightRealm ? brightFill.key : isEmissiveRealm ? ITR_EMISSIVE_SCENE_KEY : ITR_SCENE_KEY;
    if(S.fillLight) S.fillLight.intensity = isBrightRealm ? brightFill.fill : isEmissiveRealm ? ITR_EMISSIVE_SCENE_FILL : ITR_SCENE_FILL;
    // BW2-4b item 2 — camera-key: mount/refresh the soft fill DirectionalLight from the camera's general
    // direction (L-2: no longer a shadow source by default — see ITR_CAMERA_KEY_CASTS_SHADOW).
    mountInteriorCameraKey(cx, cz);
  }
  // BW2-4b item 1 — REALM GRADE on the sprite floor: tint the emissive readability floor toward this
  // realm's grade (kit.gradeTint) at ITR_SPRITE_TINT_STRENGTH so a lit standee reads the realm (chrome
  // cool, fantasy warm) even out of torch reach. White when the kit carries no grade or the study rig is
  // off. Set BEFORE interiorBuildPieces below (it bakes the emissive color at material-build time).
  {
    const gt = (rigOn && kit.gradeTint) ? hexStrToNum(kit.gradeTint) : null;
    if(gt == null){ ITR_SPRITE_EMISSIVE_TINT = 0xffffff; }
    else {
      const s = ITR_SPRITE_TINT_STRENGTH, inv = 1 - s;
      const r = Math.round(255 * inv + ((gt >> 16) & 255) * s);
      const g = Math.round(255 * inv + ((gt >> 8) & 255) * s);
      const b = Math.round(255 * inv + (gt & 255) * s);
      ITR_SPRITE_EMISSIVE_TINT = (r << 16) | (g << 8) | b;
    }
  }

  // GR1 (docs/GRAPHICS-ENGINE.md build unit GR1): floor/wall each bake their own REALM_MATERIALS
  // painter into a real CanvasTexture (interiorMaterialTexture, above) — replaces the old flat-pattern
  // texture entirely, per GR1's own "replace the current flat/pattern textures" instruction. The study
  // rig's `variant.materials === false` (dev/battle-gate/capture-interior-study.mjs's before/after
  // card) drops back to texture:null (a flat single-color material, interiorBuildInstancedMesh's own
  // "no texture" branch) so a materials-off shot is an honest OLD-FLAT baseline, not the retired
  // pattern texture (which no longer exists) — product callers never set this flag, so this is a no-op
  // everywhere except the study card.
  // BW2-3 MATERIAL TEXEL (GENERATED-FIRST seam): a folded PACKET-02 texture FILE (kit.*TextureFile,
  // chosen by interiorBuildBoard's VARIANT ROLL — flagships only) WINS; the procedural REALM_MATERIALS
  // painter (interiorMaterialTexture) is the FALLBACK for the 9 non-flagship realms. Exactly
  // `interiorSurfaceFileTexture(...) || <procedural>`. `variant.materials === false` (study rig) still
  // drops to null (flat) for an honest OLD-FLAT baseline, ahead of both branches.
  const materialsOn = variant.materials !== false;
  const floorTex = materialsOn
    ? (interiorSurfaceFileTexture("floor", kit.floorTextureFile, kit.floorTextureWrap)
        || interiorMaterialTexture(kit.floorMaterial, kit.floorColor, data.realmId + ":floor", kit.floorGrain,
            Math.max(1, b.maxX - b.minX + 1), Math.max(1, b.maxZ - b.minZ + 1)))
    : null;
  const wallTex = materialsOn
    ? (interiorSurfaceFileTexture("wall", kit.wallTextureFile, kit.wallTextureWrap)
        || interiorMaterialTexture(kit.wallMaterial, kit.wallColor, data.realmId + ":wall", kit.wallGrain,
            1, Math.max(1, data.wallHeightBase || 1)))
    : null;
  // BW2-3 §2b COLUMNS: pillars take the WALL sheet (per-face planar from the wall texture at matching
  // texel), null on a non-flagship realm OR materials-off — the pre-BW2-3 flat-colored pillar. (TRIM:
  // the folded trim strip is registered on the tileKit (kit.trimTextureFile) + REALM_TEXTURES but is
  // NOT GL-wired this unit — its only candidate geometry today is the BW2-5 arch doorframe, which BW2-4
  // deliberately plunges to near-black, and a baseboard/cornice STRIP stretched over a big arch prism
  // reads wrong. Trim awaits a dedicated trim-run geometry, unchanged from the pre-BW2-3 "trim stays
  // flat, registry data not yet GL-wired" note — the arrival is folded + staged, honest, just not
  // force-fit onto the wrong surface.)
  // BW2-4b item 4 — PILLAR TEXTURE: pillars now take the SAME fully-resolved wallTex the walls do
  // (file texture on flagships, procedural REALM_MATERIALS fallback on the other 9 realms), not the
  // file-only lookup that left every non-flagship pillar an untextured flat monolith (the loop-05
  // black-pillar read). "columns take the WALL sheet" (BW2-3 §2b), now on every realm per the UV laws.
  const pillarTex = materialsOn ? wallTex : null;

  // study-rig AO variant (b/e/f): darken instance colors at wall-floor seams (interiorApplyAODarkening,
  // above) — operates on a SHALLOW-CLONED instances object so the caller's own `data` (which may be
  // S.lastBoard, replayed by setInteriorVariant below) is never mutated in place.
  const inst = variant.ao
    ? interiorApplyAODarkening({
        floor: (data.instances && data.instances.floor || []).map((o) => Object.assign({}, o)),
        wall: (data.instances && data.instances.wall || []).map((o) => Object.assign({}, o)),
        doorframe: (data.instances && data.instances.doorframe || []).map((o) => Object.assign({}, o)),
        pillar: (data.instances && data.instances.pillar || []).map((o) => Object.assign({}, o)),
      }, variant.aoFactor)
    : (data.instances || {});
  // BW2-2 — THE FLOOR CONTACT LAW: one lookup, built off THIS board's own real floor instances
  // (inst.floor, post-AO-clone above), cached on S so setUnits (a separate, later call against the
  // SAME mounted board) can reuse it without rebuilding — see this file's own FLOOR CONTACT LAW header
  // comment (interiorFloorTopMapFrom/interiorFloorTopAt) for the derivation this replaces the old
  // hardcoded -0.5/-0.4 assumptions with.
  S.interiorFloorTopMap = interiorFloorTopMapFrom(inst.floor);
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md) — sight points computed ONCE here (needs
  // S.interiorFloorTopMap, just set above) and shared by BOTH the wall-occlusion and pillar-occlusion
  // masks below; BW2-1b's own pillar-only cutaway used to compute this locally further down this
  // function — hoisted so walls (which never got a sightline-based treatment at all before S-1, only
  // the unconditional focusRect parapet below) get the identical treatment.
  const itrSightPoints = occlusionCameraPos ? itrPieceSightPoints(data.pieces, cx, cz, S.interiorFloorTopMap) : [];
  // BW2-3: file-textured surfaces neutralize their per-cell color to a value multiplier (the texture
  // carries the hue). floorFromFile/wallFromFile track which branch floorTex/wallTex resolved from.
  const floorFromFile = materialsOn && !!kit.floorTextureFile;
  const wallFromFile = materialsOn && !!kit.wallTextureFile;
  const floorList = floorFromFile ? itrNeutralizeInstanceColors(inst.floor, kit.floorColor) : inst.floor;
  const floorMesh = interiorBuildInstancedMesh(floorList, cx, cz, floorTex, variant, "floor");
  // CUTAWAY WALLS (study card v4; BEAUTY-WAVE-2.md BW2-5 item 2 amendment): when the board frames a
  // focus room, the room's CAMERA-SIDE perimeter walls drop to a PARAPET so the camera sees INTO the
  // room instead of at the outside face of a (possibly scale-domain-tall) wall — the standard dungeon-
  // view cutaway. PRE-BW2-5 this dropped every camera-side wall to a FIXED absolute height (KNEE=0.35
  // world units, ~15% of the base 2.4 wall height) regardless of the room's own (possibly scaled)
  // wall height — thin enough to read as barely-there rather than "a box you look into" (the finale
  // mock's parapet rim). BW2-5's amendment: "full walls drop to parapet, never to nothing" — a
  // PROPORTIONAL fraction (ITR_CUTAWAY_PARAPET_FRAC, ~0.4 of THIS wall's own height, scale-domain and
  // all) so a scaled lair's parapet scales too, and the rim reads as a real low wall, not a knee-strip.
  // Computed from the camera yaw AT BUILD TIME (a later user rotate keeps the same cutaway until the
  // next board build — acceptable v1, noted here on purpose).
  const ITR_CUTAWAY_PARAPET_FRAC = 0.4; // BW2-5 item 2: "≈0.4 wall height"
  let wallList = inst.wall;
  if(data.focusRect){
    const fr = data.focusRect;
    const yawNow = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;
    const dirX = Math.sin(yawNow), dirZ = Math.cos(yawNow);
    wallList = inst.wall.map(function(wi){
      const inBand = wi.x >= fr.minX - 1 && wi.x <= fr.maxX + 1 && wi.z >= fr.minZ - 1 && wi.z <= fr.maxZ + 1;
      if(!inBand) return wi;
      const rx = wi.x - cx, rz = wi.z - cz;
      if(rx * dirX + rz * dirZ <= 0) return wi;            // far-side walls stay full height
      const parapetH = (wi.sy || 1) * ITR_CUTAWAY_PARAPET_FRAC;
      if((wi.sy || 1) <= parapetH) return wi;              // already at/under parapet height — never GROWS a wall
      return Object.assign({}, wi, { sy: parapetH });
    });
  }
  // S-1 OCCLUSION FADE (docs/DIEGETIC-LIGHT.md) — separate concern from the focusRect PARAPET just
  // above (that's whole-room camera-side framing, unconditional on any actual figure; this is
  // per-figure sightline occlusion, the SAME itrPillarCutawayMask segment-vs-AABB test the pillar path
  // below already used, generalized to walls — which never got a sightline-based treatment before this
  // unit). Runs against wallList AFTER the parapet (so an already-parapetted near wall's smaller box is
  // what's actually tested); any instance whose box sits on a camera->figure segment gets split into an
  // ankle-height solid stub (rendered here, in the normal opaque wallMesh) + a ~5% ghost of the
  // removed upper portion (rendered in the separate wallGhostMesh below — its own draw call, only
  // built when at least one wall instance is actually occluding this frame).
  let wallGhostList = [];
  if(!ITR_OCCLUSION_FADE_DISABLED_FOR_TEST && itrSightPoints.length && wallList.length){
    const wallOcclusionMask = itrPillarCutawayMask(wallList, occlusionCameraPos, itrSightPoints, cx, cz);
    const wallAnkleH = itrOcclusionAnkleHeight(data.wallHeightBase);
    wallList = wallList.map(function(wi, i){
      if(!wallOcclusionMask[i]) return wi;
      const split = itrSplitOccluderForAnkleGhost(wi, wallAnkleH);
      if(split.ghost) wallGhostList.push(split.ghost);
      return split.stub;
    });
  }
  S.interiorLastWallList = wallList; // S-1 test seam, mirrors S.interiorLastPillarList's own convention
  S.interiorLastWallGhostList = wallGhostList;
  const wallMesh = interiorBuildInstancedMesh(
    wallFromFile ? itrNeutralizeInstanceColors(wallList, kit.wallColor) : wallList,
    cx, cz, wallTex, variant, "wall");
  const wallGhostMesh = wallGhostList.length ? interiorBuildInstancedMesh(
    wallFromFile ? itrNeutralizeInstanceColors(wallGhostList, kit.wallColor) : wallGhostList,
    cx, cz, wallTex, variant, "wall", ITR_OCCLUSION_GHOST_OPACITY) : null;
  // BW2-4b item 4 — DOORFRAME VALUE + TEXTURE. The doorframe ships trimColor as its instance color; a
  // textured InstancedMesh MULTIPLIES its map by that per-instance color, so a dark trim double-darkened
  // the wallTex to a pure-black slab (the loop-02 black-monolith arch — the exact bug the WALL
  // neutralization one section up already solved). When textured, NEUTRALIZE the doorframe color to a
  // value multiplier (relative to the wall base, same as the wall path) so the arch shows the wall
  // texture at proper value, THEN apply the recess-darken (ITR_SCENE_DOORFRAME_VALUE) so it reads a
  // touch darker than the wall — a recessed textured stone arch, per the mock. Untextured (no wallTex)
  // keeps the old plain trim-value darken. rigOn-gated so the study baseline stays honest.
  const doorList = wallTex
    ? itrNeutralizeInstanceColors(inst.doorframe, kit.wallColor).map((d) => Object.assign({}, d, { color: itrScaleHexValue(d.color, ITR_SCENE_DOORFRAME_VALUE) }))
    : (rigOn ? inst.doorframe.map((d) => Object.assign({}, d, { color: itrScaleHexValue(d.color, ITR_SCENE_DOORFRAME_VALUE) })) : inst.doorframe);
  // BW2-4b item 4 — DOORFRAME TEXTURE: doorframes carried texture=null (an untextured flat prism), then
  // the BW2-4 value-plunge darkened them to near-black — the loop-05/loop-02 "black monolith arch". Now
  // they take the SAME wallTex the walls/pillars do (per-face planar for the vertical prism), with the
  // darkened-trim instance color kept (NOT neutralized) so the arch reads as textured dark stone with a
  // whisper of the trim accent hue — the mock's dark textured archway, not a flat black block.
  const doorMesh = interiorBuildInstancedMesh(doorList, cx, cz, wallTex, variant, "doorframe");
  // BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 1, superseded by docs/DIEGETIC-LIGHT.md unit S-1
  // (Adam's live steer, 2026-07-11): DYNAMIC CUTAWAY for pillar prisms — a pillar between the camera
  // and a mounted standee. Recomputed every board build (camera refit, BW2-1's own fitMode changes,
  // AND every standee move-step — a move-step is itself a data.pieces change that forces a fresh
  // setInteriorBoard call, so "recompute on move-step" falls out of the existing dirty-key rebuild
  // path for free, no separate hook needed). WAS a pure height stub to a KNEE (ITR_PILLAR_STUB_FRAC's
  // old 0.3 — Adam's own bug report: "columns and walls still obscure figures" — the old knee (0.72
  // world units at the 2.4 default) sat BELOW a typical torso sight point, so it never actually
  // cleared the sightline it claimed to). NOW: an offending instance drops to a genuinely-low ANKLE
  // stub (itrOcclusionAnkleHeight, same shared deriver the wall path above now also uses) PLUS a ~5%
  // GHOST of the removed upper portion (itrSplitOccluderForAnkleGhost) so the column still reads as
  // "there" — see pillarGhostMeshes below, its own (small, occlusion-only) draw call.
  let pillarList = inst.pillar;
  let pillarGhostList = [];
  if(!ITR_OCCLUSION_FADE_DISABLED_FOR_TEST && occlusionCameraPos && pillarList && pillarList.length && itrSightPoints.length){
    const mask = itrPillarCutawayMask(pillarList, occlusionCameraPos, itrSightPoints, cx, cz);
    const pillarAnkleH = itrOcclusionAnkleHeight(data.wallHeightBase);
    pillarList = pillarList.map(function(pinst, i){
      if(!mask[i]) return pinst;
      const split = itrSplitOccluderForAnkleGhost(pinst, pillarAnkleH);
      if(split.ghost) pillarGhostList.push(split.ghost);
      return split.stub;
    });
  }
  // BW2-1b — harness diagnostic: the FINAL (post-cutaway) pillar instance list, byte-identical shape
  // to data.instances.pillar (same length — a stub only rewrites `sy`/`yBase`, never adds/removes an
  // entry, preserving U3's own draw-call budget for the MAIN mesh) so a harness can assert stub-applied
  // vs full-height per instance without decomposing InstancedMesh matrices.
  S.interiorLastPillarList = pillarList;
  S.interiorLastPillarGhostList = pillarGhostList; // S-1 test seam — the separately-drawn ~5% ghosts
  // BW2-5 THE COLUMN DEMOTION: pillar instances split by `profile` (round gets its own cylinder
  // mesh) — fed the POST-CUTAWAY list so the sightline stubs apply to every profile alike.
  const pillarMeshes = interiorBuildPillarMeshes(
    pillarTex ? itrNeutralizeInstanceColors(pillarList, kit.wallColor) : pillarList,
    cx, cz, variant, pillarTex);
  const pillarGhostMeshes = pillarGhostList.length ? interiorBuildPillarMeshes(
    pillarTex ? itrNeutralizeInstanceColors(pillarGhostList, kit.wallColor) : pillarGhostList,
    cx, cz, variant, pillarTex, ITR_OCCLUSION_GHOST_OPACITY) : [];
  // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4): the diorama edge skirt — data.skirt (src/ui/theater-
  // interior.js's interiorBuildBoard, GR4 addition), a sibling of `instances` (never counted toward the
  // "4 known instance kinds" data-shape check — see that function's own doc comment). Untextured (flat
  // darkened color, same as pillar/doorframe) — a texture would be wasted detail on a band the camera
  // only ever sees edge-on.
  const skirtMesh = interiorBuildInstancedMesh(data.skirt, cx, cz, null, variant, "skirt");
  // BW2-5: furniture-class blocker volumes + wall-hang extrusion props (THE PROP PERSPECTIVE LAW) —
  // built further below (after dressing) since both read S.interiorFloorTopMap; declared here so the
  // mesh-count/group-add sweep stays one place. See interiorBuildFurniture/interiorBuildWallProps.
  // S-1 OCCLUSION FADE: the ghost overlays (wallGhostMesh, pillarGhostMeshes) are ADDITIONAL draw
  // calls over the pre-S-1 budget — only ever created when at least one instance of that kind is
  // actually occluding a figure this frame (both are null/empty otherwise, so a board with no
  // occlusion in play costs exactly what it did before this unit).
  const itrAllInteriorMeshes = [floorMesh, wallMesh, wallGhostMesh, doorMesh, skirtMesh].concat(pillarMeshes).concat(pillarGhostMeshes);
  itrAllInteriorMeshes.forEach((mesh) => { if(mesh) S.interiorGroup.add(mesh); });
  S.interiorMeshCount = itrAllInteriorMeshes.filter(Boolean).length;

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: real environmental light sources (data.lights, emitted
  // by src/ui/theater-interior.js's interiorBuildBoard) — realm-flavored PointLights + their own
  // visible emissive markers, capped at INTERIOR_SHADOW_CASTER_CAP shadow-casters.
  const lightsBuilt = interiorBuildLights(data.lights, cx, cz, data.realmId, S.interiorFloorTopMap, data.pieces);
  S.interiorGroup.add(lightsBuilt.group);
  S.interiorShadowCasterCount = lightsBuilt.casters;
  S.interiorLightCount = (data.lights || []).length;
  // L-1 (DIEGETIC-LIGHT.md) harness diagnostic, same read-only convention as interiorShadowCasterCount
  // above: how many light-shaft cones actually mounted this call (0 whenever ITR_LIGHT_CONE_ENABLED is
  // false, since interiorBuildLights skips both the mount AND the flickerTargets.cone assignment then).
  S.interiorLightConeCount = lightsBuilt.flickerTargets.filter((t) => t.cone).length;
  // VP6 item 2: join the interior lights (+ their emissive markers) onto the shared flicker channel —
  // startLightFlicker tore down any board-level flicker a moment ago (applyLightProfile above always
  // calls stopLightFlicker first), so this call is the one that actually starts ticking for an interior
  // board with any lights at all; a light-less room (lightsBuilt.flickerTargets === []) is a clean no-op
  // (startLightFlicker's own interval self-stops when both lists are empty).
  if(lightsBuilt.flickerTargets.length) startLightFlicker(INTERIOR_LIGHT_FLICKER_AMPLITUDE, lightsBuilt.flickerTargets);

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 3: creature/PC billboard sprites standing in the room
  // (data.pieces, a plain field the caller sets directly on the board object — independent of
  // interiorBuildBoard, same as data.lightProfile above).
  // CLIP MARGIN LAW (Adam addendum, mid-flight on BW2-1b): the solid prisms a standee's own footprint
  // must clear — wallList/pillarList are the SAME post-cutaway lists just mounted above (cutaway only
  // ever changes a stubbed instance's sy/height, never its sx/sz footprint, so testing against the
  // post-cutaway lists is byte-identical to testing against the pre-cutaway ones on the XZ axes this
  // check actually reads). daisTop rides per BW2-5 (finale preferDais bias).
  const piecesBuilt = interiorBuildPieces(data.pieces, cx, cz, data.wallHeightBase, S.interiorFloorTopMap, kit.trimColor, [wallList, pillarList, inst.doorframe], data.daisTop);
  S.interiorGroup.add(piecesBuilt.group);
  S.interiorPiecesResolved = piecesBuilt.resolved;
  S.interiorPiecesRequested = piecesBuilt.requested;
  // BW2-1b — harness-facing diagnostic (mirrors S.interiorDressingWorldPositions, below): one entry
  // per MOUNTED standee, its REAL world position read straight off the group THREE actually placed
  // (post CLIP MARGIN nudge) — so an occlusion/clip-margin harness asserts against the mount, never a
  // parallel formula that could drift from it. piecesBuilt.group's own children are the per-piece
  // groups (tagged userData.interiorTrueScale, interiorBuildPieces' own convention) FOLLOWED by the
  // sibling blobGroup (untagged) — filtering on the tag excludes the blob group cleanly.
  S.interiorPiecesWorldPositions = piecesBuilt.group.children
    .filter((g) => g.userData && g.userData.interiorTrueScale)
    .map((g) => ({ x: g.position.x, y: g.position.y, z: g.position.z, height: g.userData.interiorHeight, width: g.userData.interiorWidth, unitId: g.userData.unitId || null }));

  // GRAPHICS-ENGINE.md GR2 §D: dressing cards (data.dressing, src/engine/place-dressing.js's
  // dressPlan output — a plain field the caller sets directly on the board object, same convention
  // as data.pieces/data.lightProfile above).
  const dressingGroup = interiorBuildDressing(data.dressing, cx, cz, S.interiorFloorTopMap, [wallList, pillarList, inst.doorframe]);
  S.interiorGroup.add(dressingGroup);
  S.interiorDressingCount = (data.dressing || []).length;
  // harness-facing diagnostic (dev/verify-dungeon-dressing.mjs check 4: "render mount... origin-
  // shifted correctly") — one entry per mounted card, its REAL world position read straight off the
  // group THREE actually placed (never recomputed by the test), so the check proves the mount, not a
  // parallel formula that could drift from it.
  S.interiorDressingWorldPositions = dressingGroup.children.map((g) => ({
    slug: g.userData && g.userData.dressingSlug, x: g.position.x, y: g.position.y, z: g.position.z
  }));

  // BEAUTY-WAVE-2.md BW2-5: furniture-class blocker volumes (data.furniture) + wall-hang extrusion
  // props (data.wallProps, THE PROP PERSPECTIVE LAW) — both siblings of data.dressing, built off the
  // SAME roll (see interiorBuildDressing's own skip-blocker/wall-hang comment just above).
  const furnitureGroup = interiorBuildFurniture(data.furniture, cx, cz, S.interiorFloorTopMap);
  S.interiorGroup.add(furnitureGroup);
  S.interiorFurnitureCount = (data.furniture || []).length;
  const wallPropsGroup = interiorBuildWallProps(data.wallProps, cx, cz, S.interiorFloorTopMap);
  S.interiorGroup.add(wallPropsGroup);
  S.interiorWallPropsCount = (data.wallProps || []).length;
  S.interiorWallPropsWorldPositions = wallPropsGroup.children.map((g) => ({
    slug: g.userData && g.userData.dressingSlug, x: g.position.x, y: g.position.y, z: g.position.z,
    rotY: g.rotation.y, depth: g.children[0] && g.children[0].geometry && g.children[0].geometry.parameters
      && g.children[0].geometry.parameters.depth
  }));

  // BEAUTY-WAVE.md VP6 item 4 — VISIBLE HISTORY (render half). data.decals is a plain field the caller
  // sets directly on the board object (same convention as data.pieces/data.dressing above), sourced
  // from src/world/prep.js's spatialDecalsForSeg(pn, segNum) — the persist half.
  const decalsGroup = interiorBuildDecals(data.decals, cx, cz, S.interiorFloorTopMap);
  S.interiorGroup.add(decalsGroup);
  S.interiorDecalCount = (data.decals || []).length;

  // BEAUTY-WAVE.md VP6 item 3 — ambient motes, seeded off this board's own focus rect so re-rendering
  // the SAME board data yields the SAME mote field (never re-rolled every frame).
  // BW3-4 MOTE COUPLING: data.lights + cx/cz now ride along so interiorBuildMotes can (a) bias spawns
  // toward the room's own light pools and (b) mount the whole field in the SAME shifted coordinate
  // space every other piece of interior geometry already uses (see that function's own COORDINATE FIX
  // comment — the pre-unit call passed raw `b` with no shift at all).
  stopMoteDrift();
  const moteSeed = "motes:" + (data.realmId || env) + ":" + JSON.stringify(fit);
  const moteGroup = interiorBuildMotes(moteSeed, b, interiorMoteKindFor(data.lights), data.lights, cx, cz);
  S.interiorGroup.add(moteGroup);
  S.moteGroup = moteGroup;
  startMoteDrift();

  // BEAUTY-WAVE-4.md MF-1: this is the authoritative fit for the interior channel — covers every
  // beat/room refit AND every move-step (a move-step forces a fresh setInteriorBoard rebuild, so
  // "recompute on move-step" falls out of this same call path, per the pillar-cutaway comment above).
  // Tweened (not the plain placeCamera()) so the camera glides instead of snapping (Feel Law 1).
  placeCameraTweened((mf1PreFitPos && mf1PreFitTarget) ? { pos: mf1PreFitPos, target: mf1PreFitTarget } : null);
  // BEAUTY-WAVE-3 THE POST SUITE (BW3-2/3/6): mount DoF + selective bloom + filmic grade onto the
  // composer for this interior board. AFTER the authoritative placeCamera above so updateDofFocus
  // projects the FINAL camera fit (the focal band tracks beat-vs-room framing). kit + rigOn are this
  // function's own locals (the tile kit's authored gradeTint/gradeStrength drive the per-realm grade;
  // rigOn=false drops to a neutral grade for the study-rig's honest baseline). INTERIOR-ONLY — setBoard
  // (the flat tabletop) tears it back off.
  mountPostSuite(kit, rigOn);

  // BEAUTY-WAVE-4.md MF-2 item 4: the rebuild (everything above) has finished — fade the transition
  // overlay back to transparent over ROOM_TRANSITION_DUR, revealing the freshly-built room. Skipped on
  // this mount's first reveal (isRoomTransition false — the overlay was never snapped opaque, so a
  // fade from 0 would be a harmless no-op anyway, but skipping is the honest "no transition happened"
  // read for a fresh mount's own instrumentation).
  if(isRoomTransition && S.transitionEl){
    pushScreenFade(buildTheaterCtx(), {
      setOpacity: function(v){ S.transitionEl.style.opacity = String(v); },
      from: 1, to: 0, dur: ROOM_TRANSITION_DUR
    });
    startTweenLoop();
  }

  markDirty();
}

/* window.Theater.setInteriorVariant(flags) — DUNGEON-GRAPH.md U3 render-quality study card ONLY
   (dev/battle-gate/capture-interior-study.mjs is the sole caller; no product code path sets this).
   flags: {ao, banded, fog} — see interiorApplyAODarkening / applyPsxShaderTweaks' banded injection /
   setInteriorBoard's fogOn ternary above for what each does. Merges onto S.interiorVariant (persists
   across calls, same convention as S.zoomLevel) and, if an interior board is already mounted, forces
   an immediate rebuild under the new flags by replaying S.lastBoard through setInteriorBoard (the
   SAME "null the dirty key, replay" trick the async texture/glb loaders already use elsewhere in this
   file) — the study rig calls this BETWEEN setInteriorBoard(sameBoard) calls to capture every variant
   of the identical scene. */
function setInteriorVariant(flags){
  S.interiorVariant = Object.assign({}, S.interiorVariant, flags || {});
  if(S.lastBoard && S.lastBoard.kind === "interior3d"){
    S.boardKey = null;
    setInteriorBoard(S.lastBoard);
  }
}

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

function setUnits(data){
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
      const baseRadius = (figure.userData.interiorWidth || figure.userData.interiorHeight || 1) * INTERIOR_BASE_RADIUS_FRAC;
      const baseMesh = buildInteriorBase(baseRadius, S.lastBoard && S.lastBoard.tileKit && S.lastBoard.tileKit.trimColor);
      figure.add(baseMesh);
      figure.userData.interiorBaseRadius = baseRadius;
      figure.userData.standeeBaseMesh = baseMesh; // setActingUnit's BW2-2b glow-toggle target
      // BW2-2: this standee's own soft contact pool (VP7's convention, extended to combat units — the
      // pre-BW2-2 tabletop hostility-disc/groundingBlob pair further below is UNTOUCHED and stays
      // buried under the true floor exactly as it already was, harmless/invisible; this pool is the
      // one that actually reads under an interior standee's base).
      addInteriorContactBlob(S.shadowGroup, x, z, (figure.userData.interiorWidth || figure.userData.interiorHeight || 1), floorTop);
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
    if(u.fled) figure.visible = false;
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

  markDirty();
}

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

// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D7's last clause: "retire() gains an explicit
// cache-dispose sweep"). clearGroup's per-render sweeps deliberately SKIP disposing shared whole-
// object geometry/materials (they're reused across every figure/prop of the same key, still live);
// retire() is the one true end-of-life point for this Theater instance, so it's the right place to
// actually free that GPU memory — every cached BufferGeometry + material triple, plus the grain
// atlas texture, disposed exactly once, then the caches themselves cleared so a subsequent mount()
// rebuilds fresh (dispose()'d THREE objects can't be reused). Idempotent-safe: an already-empty
// cache (retire() called twice, or called before any whole-object figure ever rendered) is a no-op.
function disposeWholeObjectCaches(){
  Object.keys(WHOLE_GEOMETRY_CACHE).forEach(function(k){
    const geo = WHOLE_GEOMETRY_CACHE[k];
    if(geo && geo.dispose) geo.dispose();
    delete WHOLE_GEOMETRY_CACHE[k];
  });
  Object.keys(WHOLE_MATERIALS_CACHE).forEach(function(k){
    const mats = WHOLE_MATERIALS_CACHE[k];
    if(Array.isArray(mats)) mats.forEach(function(m){ if(m && m.dispose) m.dispose(); });
    delete WHOLE_MATERIALS_CACHE[k];
  });
  if(WHOLE_GRAIN_TEX){ WHOLE_GRAIN_TEX.dispose(); WHOLE_GRAIN_TEX = null; }
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
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  if(S.tweenRaf) cancelAnimationFrame(S.tweenRaf); // T3: stop the verb tween loop too, not just render-on-demand's raf
  stopLightFlicker(); // BOARD LIGHTING: the ~2Hz setInterval flicker tick outlives raf/tweenRaf otherwise
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
window.Theater.interiorFileTexPending = function(){ return INTERIOR_FILE_TEX_PENDING || 0; };

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
// P-1 problem 1/2 TEST-ONLY SEAMS — runtime toggles for the two RED-FIRST override flags declared
// alongside ITR_BRIGHT_REALM_FILL/ITR_EMISSIVE_PROFILES above (same reversible-flag convention as every
// other test seam on this surface).
window.Theater.setBrightRealmFillForceDefaultForTest = function(v){ ITR_BRIGHT_REALM_FILL_FORCE_DEFAULT_FOR_TEST = !!v; };
window.Theater.setEmissiveFillDisabledForTest = function(v){ ITR_EMISSIVE_FILL_DISABLED_FOR_TEST = !!v; };
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
window.Theater._interiorShadowCastersForTest = function(){
  const out = [];
  if(S.interiorGroup){
    S.interiorGroup.traverse((obj) => {
      if(obj.isPointLight) out.push({ x: obj.position.x, y: obj.position.y, z: obj.position.z, castShadow: !!obj.castShadow, intensity: obj.intensity });
    });
  }
  return out;
};
window.Theater.interiorMoteCount = function(){ return (S.moteGroup && S.moteGroup.children.length) || 0; }; // VP6 item 3
window.Theater.interiorDressingWorldPositions = function(){ return S.interiorDressingWorldPositions || []; };
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
// S-1 — TEST-ONLY SEAM: see ITR_OCCLUSION_FADE_DISABLED_FOR_TEST's own declaration comment — flips the
// whole ankle+ghost pass off for a genuine RED-FIRST baseline render (dev/verify-occlusion-fade.mjs).
window.Theater._setOcclusionFadeDisabledForTest = function(v){ ITR_OCCLUSION_FADE_DISABLED_FOR_TEST = !!v; };
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
    passEnabled: { dof: !!ps.dof.enabled, bloom: !!ps.bloom.enabled, grade: !!ps.grade.enabled },
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
      vignette: ps.grade.uniforms.uVignette.value
    }
  };
};
window.Theater._setSuitePassEnabledForTest = function(name, enabled){
  if(!S.postSuite) return null;
  const p = S.postSuite[name];
  if(!p) return null;
  p.enabled = !!enabled;
  markDirty();
  return !!p.enabled;
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

// SPRITE-TRANSITION T4 — TEST-ONLY SEAM: exposes the module-private texture cache so a harness (this
// unit's own dev/verify-theater-sprites.mjs) can pre-seed a fake THREE.Texture-like object for a slug
// before calling refFigure.build/setUnits, exercising the cut-status render path without a real
// network/file image load ("stub texture loader" per the spec). Nothing in product logic reads or
// writes this from outside spriteTextureFor — same read-only-diagnostics spirit as window.Theater.stats.
window.Theater._spriteTextureCache = SPRITE_TEXTURE_CACHE;

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
window.Theater._interiorBuildWallPropsForTest = function(wallProps, cx, cz, floorTopMap){
  return interiorBuildWallProps(wallProps, cx, cz, floorTopMap);
};
window.Theater._interiorBuildDressingForTest = function(dressing, cx, cz, floorTopMap, prismLists){
  return interiorBuildDressing(dressing, cx, cz, floorTopMap, prismLists);
};

// BW2-2 — TEST-ONLY SEAM, same spirit as the two accessors above: exposes interiorBuildDecals directly
// so a harness can inspect decal mount Y against the derived floor-contact law.
window.Theater._interiorBuildDecalsForTest = function(decals, cx, cz, floorTopMap){
  return interiorBuildDecals(decals, cx, cz, floorTopMap);
};

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
  itrOcclusionAnkleHeight, itrSplitOccluderForAnkleGhost, ITR_OCCLUSION_GHOST_OPACITY
};
// BW2-1b — TEST-ONLY SEAM: the LIVE camera world position setInteriorBoard's own pillar-cutaway pass
// actually raycasts from (the PREVIEW placeCamera() call's own output, see that call's header
// comment) — lets a harness assert the mask it gets from _occlusionLawForTest against the SAME
// position the real mount used, rather than a second camera-position derivation of its own.
window.Theater._interiorCameraPositionForTest = function(){
  return S.camera ? { x: S.camera.position.x, y: S.camera.position.y, z: S.camera.position.z } : null;
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
// BW2-2b — TEST-ONLY SEAM: exposes the kilter RNG + the base-glow toggle so a harness can assert
// determinism/bounds (kilterFor) and the shared-material-isolation property (setBaseGlow only ever
// touches the ONE mesh it's handed) without re-deriving either from scratch.
window.Theater._kilterForTest = function(seedKey){ return kilterFor(seedKey); };
window.Theater._setBaseGlowForTest = function(mesh, glowing){ return setBaseGlow(mesh, glowing); };
// BW3-4 — TEST-ONLY SEAMS: same "expose the pure builder, don't require a live mount()" convention as
// _interiorBuildPiecesForTest above — dev/verify-bw3-4-light-shafts.mjs drives these directly (no
// WebGL context needed; none of the four touch S.renderer).
window.Theater._interiorBuildLightsForTest = function(lights, cx, cz, realmId, floorTopMap){
  return interiorBuildLights(lights, cx, cz, realmId, floorTopMap);
};
window.Theater._interiorBuildMotesForTest = function(seedStr, bounds, kind, lights, cx, cz){
  return interiorBuildMotes(seedStr, bounds, kind, lights, cx, cz);
};
window.Theater._interiorBuildLightConeForTest = function(light, height){ return interiorBuildLightCone(light, height); };
// runs ONE flicker tick synchronously against caller-supplied stand-ins (never S.pointLights/
// S.interiorFlickerTargets) — a deterministic fake-clock harness drives Math.random itself and reads
// the result back, rather than racing startLightFlicker's real 480ms setInterval.
window.Theater._lightFlickerStepForTest = function(pointLights, bases, interiorTargets, amplitude){
  return lightFlickerStep(pointLights, bases, interiorTargets, amplitude);
};
