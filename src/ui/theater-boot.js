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
                    (fallback composed-cuboids, VS-proportioned, 1.5x scale) + their blob shadows.
     setTextures(manifest) -> void. `manifest` is a flat {"stone":path, ...} semantic-key map (T1.5
                    item 4). Loads each path via THREE.TextureLoader with NearestFilter/no mipmaps and
                    caches it; the next setBoard/setUnits call tints matched tile kinds by texture
                    instead of flat color. Safe to call before or after mount(); safe to call with an
                    absent/empty manifest (no-op, palette-only stays the baseline).
     rotate()    -> void. Steps the camera 90° around the board's vertical axis (BATTLE-THEATER §1
                    rule 4: "rotatable in 90° steps only"), preserving the 80%-fill fit.
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
import { playVerb, tickTweens, THEATER_VERBS, theaterFxFromLedger } from "./theater-verbs.js";
import * as Parts from "./theater-parts.js";

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
   (G9) can flip them without touching call sites — both default OFF (attempted only after the
   mandatory items are green, per the orchestrator's build order; landed/abandoned status reported
   at the end of the build). */
const PSX_DITHER_ENABLED = true;       // stretch: ordered-dither via onBeforeCompile fragment injection
const PSX_VERTEX_SNAP_ENABLED = true;  // stretch: clip-space vertex quantization via vertex injection
const PSX_VERTEX_SNAP_GRID = 96;       // clip-space quantization steps per axis (higher = subtler snap)
const PSX_DITHER_AMPLITUDE = 48.0;     // G9 tune 4: Bayer threshold divisor (DITHER_GLSL below) — was
                                        // 32.0 (a 1/32 nudge), which mushed the dark end into murk;
                                        // 48.0 is one notch weaker (~0.67x amplitude): still visibly
                                        // dithered, no longer mud at low luminance.

const CAM_ELEV_DEG = 35;
// G9 camera-yaw fix (docs/PRE-PLAYTEST-GAUNTLET.md §10b): the board's tile columns are plain
// axis-aligned boxes (setBoard's BoxGeometry, world X/Z grid) — an isometric/dimetric read is ENTIRELY
// a function of the camera sitting OFF that grid's axes. A yaw of exactly rotationStep*90° (the old
// math, with no offset) sits the camera dead-on one axis at every rotation step: it looks straight down
// a row, so only ONE side face of each tile column is ever visible and the board reads as a flat
// frontal wall (the regression this fix targets). +45° rotates the camera into the gap between axes —
// the classic FFT/dimetric camera — so two side faces are always visible and rows recede diagonally.
const CAM_YAW_OFFSET_DEG = 45;
const CAM_FIT_MARGIN = 0.90;   // §3: "fill ~80%" — a hair of slack (0.90 factor on top of the fit calc
                                // below already targets 80% coverage; see fitCameraToBoard's comment)
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
const SHADOW_OPACITY = 0.35;
const FIGURE_SCALE = 1.5;      // §3 G9 tune: "figure scale ~1.5x current relative to tiles"

// PSX low-res internal render: the renderer's DRAWING BUFFER is sized to this fraction of the
// canvas's CSS size, then the canvas is stretched back up via CSS with `image-rendering:pixelated`
// (the cheap robust route the spec calls for — "no postprocessing chain"). 1/3 per the build note.
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

function addBox(group, w, h, d, x, y, z, color, rotY, rotX, rotZ){
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color }));
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
function renderPartInto(group, partFn, params, channelTints, offset, rotOffset){
  offset = offset || { x: 0, y: 0, z: 0 };
  rotOffset = rotOffset || { x: 0, y: 0, z: 0 };
  const boxes = partFn(params || {});
  const cosY = Math.cos(rotOffset.y || 0), sinY = Math.sin(rotOffset.y || 0);
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
    addBox(group, b.box.w, b.box.h, b.box.d, x, y, z, color, rotY, rotX, rotZ);
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
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.15, x: -0.3, z: -0.12, yStart: 0.02, tiltX: 0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-left
  renderPartInto(g, Parts.legTapered, { baseW: 0.085, segLen: 0.15, x: -0.3, z: 0.12, yStart: 0.02, tiltX: -0.05 }, tints, { x: 0, y: 0, z: 0 });   // front-right
  renderPartInto(g, Parts.legTapered, { baseW: 0.095, segLen: 0.19, x: 0.26, z: -0.13, yStart: 0.02, tiltZ: 0.18 }, tints, { x: 0, y: 0, z: 0 });   // rear-left, haunch
  renderPartInto(g, Parts.legTapered, { baseW: 0.095, segLen: 0.19, x: 0.26, z: 0.13, yStart: 0.02, tiltZ: -0.18 }, tints, { x: 0, y: 0, z: 0 });   // rear-right, haunch
  return g;                                                                  // 8 boxes
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
function buildSwarm(seed, tint){
  const g = new THREE.Group();
  const totalN = 9;
  const ring = [];
  for(let i = 0; i < totalN; i++){
    ring.push({
      r: seededJitter(seed, i, 0.06),
      s: seededJitter(seed, i + 50, 0.03),
      y: seededJitter(seed, i + 100, 0.1),
      rot: seededJitter(seed, i + 60, 0.4)
    });
  }
  const tints = flatTints(tint);
  renderPartInto(g, Parts.swarmScatter, { totalN, startIdx: 0, count: 5, ring: ring.slice(0, 5) }, tints, { x: 0, y: 0, z: 0 });
  renderPartInto(g, Parts.swarmScatter, { totalN, startIdx: 5, count: 4, ring: ring.slice(5) }, tints, { x: 0, y: 0, z: 0 });
  return g;                                                      // 9 boxes
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
  const weaponMesh = weaponMeshFor(weapon || "mace", tint); // giants default to a blunt weapon read
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
   axe-wedge/bow-arcs/staff-tipped/spear-pole/dagger-slabs — every part was authored in part-local
   space with the SAME (wx,wy,wz)=(0.42,0.5,0.04) origin this function used inline, so offsetting by
   that origin reproduces the pre-G1 geometry exactly). "mace" has no listed §1 weapon key of its own
   (weaponMeshFor's original vocabulary predates the §1 inventory, which names club-mass instead) —
   kept mapped to club-mass's blunt haft+head read, the closest §1 equivalent (both are "short haft +
   blunt head"), rather than dropping the mace lookup theater-data.js's weapon-word scan still emits. */
const WEAPON_PART_KEY = {
  sword: "sword-slab", axe: "axe-wedge", bow: "bow-arcs", staff: "staff-tipped",
  spear: "spear-pole", mace: "club-mass", dagger: "dagger-slabs"
};
function weaponMeshFor(weapon, tint){
  if(!weapon || weapon === "none") return null;
  const partKey = WEAPON_PART_KEY[weapon];
  const partFn = partKey && Parts.PARTS[partKey];
  if(!partFn) return null;
  const g = new THREE.Group();
  renderPartInto(g, partFn, {}, flatTints(tint), { x: 0.42, y: 0.5, z: 0.04 });
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
  "skin-green-grey": 0x7a8a6e
};
function recipeChannelTints(channels, baseTint){
  const tints = flatTints(baseTint);
  Object.keys(channels || {}).forEach(function(ch){
    const val = channels[ch];
    const resolved = (val != null && Object.prototype.hasOwnProperty.call(CHANNEL_TINT_FALLBACK, val))
      ? CHANNEL_TINT_FALLBACK[val] : null;
    if(resolved != null) tints[ch] = resolved;
  });
  return tints;
}

function buildFigureFromRecipe(recipe, tint){
  const g = new THREE.Group();
  if(!recipe) return g;
  const baseKey = (recipe.base && Parts.PARTS[recipe.base]) ? recipe.base : "torso-biped";
  const baseFn = Parts.PARTS[baseKey];
  const anchors = baseFn.anchors || {};
  const tints = recipeChannelTints(recipe.channels, tint);

  // the base body itself, at the figure's own local origin (no offset — matches every fixed
  // archetype builder's own convention of drawing its body core at {0,0,0}).
  renderPartInto(g, baseFn, {}, tints, { x: 0, y: 0, z: 0 });

  (recipe.modules || []).forEach(function(m){
    if(!m || !m.part) return;
    const partFn = Parts.PARTS[m.part];
    if(!partFn) return; // unknown part — skip, never throw (§4b's own "unknown -> omitted" discipline,
                          // reapplied here at render time as a defensive second gate)
    const anchor = m.anchor && anchors[m.anchor];
    const offset = anchor ? anchor.pos : { x: 0, y: 0, z: 0 };
    const rotOffset = anchor ? anchor.rot : { x: 0, y: 0, z: 0 };
    renderPartInto(g, partFn, m.params || {}, tints, offset, rotOffset);
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

function figureFor(archetype, seed, tint, silhouette, weapon, recipeSlug, pcRecipe){
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
  if(pcRecipe) return buildFigureFromRecipe(pcRecipe, tint);
  const recipe = recipeFor(recipeSlug);
  if(recipe) return buildFigureFromRecipe(recipe, tint);
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  return build(seed, tint, silhouette, weapon);
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
    env: null,           // last board's env key — drives void/fog color
    textures: {},         // semantic key -> loaded+cached THREE.Texture (setTextures)
    psxEnabled: true,     // T1.5 preview-only toggle (dev/theater-preview.html's "PSX/clean" button);
                           // the shipped default is always PSX ON — this only exists so the visual
                           // gate can A/B the grit pass against the T1 clean baseline in one click.
    // T3 (theater-verbs, §4): fxGroup holds every verb-spawned FX primitive (glyphs, elemental
    // bursts, the absurdity rift) — swept by clearGroup exactly like tiles/props/units on the next
    // setBoard/setUnits/retire, so a verb never leaks geometry across a re-render. tweens is the
    // live tween queue theater-verbs.js's tickTweens owns; tweenRaf is this file's OWN animation-loop
    // handle (separate from the render-on-demand `raf` above — see startTweenLoop/stopTweenLoop).
    fxGroup: null, tweens: [], tweenRaf: null,
    // last board's grid + origin, kept for zoneToWorld (T3): the same {cx,cz} setBoard already
    // computes for centering tiles/units, plus the grid's own band/lane arrays so a "band:lane"
    // string resolves to the identical world coordinates theaterUnitsFrom would place a unit at.
    lastGrid: null
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

function scheduleRender(){
  if(!S.mounted || S.raf) return;
  S.raf = requestAnimationFrame(() => {
    S.raf = null;
    if(S.dirty && S.renderer && S.scene && S.camera){
      S.renderer.render(S.scene, S.camera);
      S.dirty = false;
    }
  });
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
  const rad = (CAM_ELEV_DEG * Math.PI) / 180;
  const yaw = (S.rotationStep * 90 * Math.PI) / 180 + (CAM_YAW_OFFSET_DEG * Math.PI) / 180;

  const hx = Math.max(2, S.boardHalfX || S.boardHalfExtent || 5);
  const hz = Math.max(2, S.boardHalfZ || S.boardHalfExtent || 5);
  // Screen-right axis (ground-plane, perpendicular to the camera's horizontal look direction) and the
  // ground-plane component of the screen-up axis (the camera's horizontal look direction itself, whose
  // contribution to screen-vertical is foreshortened by sin(elevation) — see camDist/y below for the
  // matching elevation split). Support-function projection of the (hx,hz) box onto each.
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  const screenHalfWidth = hx * Math.abs(cosYaw) + hz * Math.abs(sinYaw);
  const screenHalfDepth = hx * Math.abs(sinYaw) + hz * Math.abs(cosYaw);
  const screenHalfHeight = screenHalfDepth * Math.sin(rad);
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
  const viewSize = Math.max(viewSizeForHeight, viewSizeForWidth);
  S.viewSize = viewSize;

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

  S.camera.left = -viewSize * aspect;
  S.camera.right = viewSize * aspect;
  S.camera.top = viewSize;
  S.camera.bottom = -viewSize;
  S.camera.far = Math.max(100, camDist + FOG_FAR + 20);
  S.camera.updateProjectionMatrix();

  if(S.scene && S.scene.fog){
    // fog distances scale with the fit too, so a huge board's far edge still just "softens" instead
    // of vanishing entirely or not fogging at all — proportional to camDist rather than fixed.
    S.scene.fog.near = camDist * 0.55;
    S.scene.fog.far = camDist * 1.65;
  }
}

function clearGroup(group){
  if(!group) return;
  while(group.children.length){
    const child = group.children.pop();
    if(child.geometry) child.geometry.dispose();
    if(child.material){
      if(Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
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
   tile's own palette color, or the flat-color top/side pair (T1's baseline) when no texture applies.
   Returns the 6-entry BoxGeometry material array (index 2 = +y = top face, §1 rule 2). */
function tileMaterialsFor(t, topColorCache, sideColorCache, colorFor){
  const texKey = TILE_KIND_TEXTURE_KEY[t.kind];
  const tex = texKey && S.textures[texKey];
  const hasTex = tex && tex !== "pending";
  const topColor = colorFor(t.tint || "#4a5a3c", 1.35, topColorCache);
  const sideColor = colorFor(t.tint || "#4a5a3c", 0.6, sideColorCache);
  const topMat = applyPsxShaderTweaks(hasTex
    ? new THREE.MeshLambertMaterial({ map: tex, color: topColor })   // texture tinted by palette color
    : new THREE.MeshLambertMaterial({ color: topColor }));
  const sideMat = applyPsxShaderTweaks(new THREE.MeshLambertMaterial({ color: sideColor })); // sides
                                                                         // stay flat-tinted (§1 rule 2
                                                                         // is a TOP-face trick; texturing
                                                                         // sides too would wash out the
                                                                         // top/side contrast)
  return [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
}

/* T1.5 PSX low-res: sizes the renderer's DRAWING BUFFER to PSX_RES_SCALE of the element's CSS box,
   then stretches the canvas back up via CSS width/height + `image-rendering:pixelated` (set once at
   mount, never re-set per frame). `renderer.setSize(w, h, false)` — the `false` updateStyle arg is
   the whole trick: it sizes the drawing buffer to the LOW w/h without also writing that low size back
   onto the canvas's CSS box, so the CSS block below is what actually controls the on-screen size. */
function applyPsxCanvasSize(renderer, canvas, cssW, cssH){
  const scale = S.psxEnabled ? PSX_RES_SCALE : 1;
  const drawW = Math.max(1, Math.round(cssW * scale));
  const drawH = Math.max(1, Math.round(cssH * scale));
  renderer.setSize(drawW, drawH, false);
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

function applyPsxShaderTweaks(material){
  if(!PSX_DITHER_ENABLED && !PSX_VERTEX_SNAP_ENABLED) return material;
  const priorHook = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if(typeof priorHook === "function") priorHook(shader, renderer);
    if(PSX_DITHER_ENABLED){
      shader.fragmentShader = "#define PSX_DITHER\n" + shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        DITHER_GLSL + "\n  #include <opaque_fragment>"
      );
    }
    if(PSX_VERTEX_SNAP_ENABLED){
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
  return material;
}

function mount(el, opts){
  if(!el || !supportsWebGL()) return false;
  retire(); // idempotent: a re-mount tears down any prior instance first
  const priorTextures = S.textures; // T1.5: setTextures may be called before mount() — preserve any
                                     // already-loaded/loading cache across the retire()->fresh-state reset.
  S = createTheaterState();
  if(priorTextures) S.textures = priorTextures;
  if(opts && opts.psx === false) S.psxEnabled = false; // preview-only escape hatch, default stays ON

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

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(4, 10, 6);
  scene.add(ambient, key);

  const tileGroup = new THREE.Group();
  const propGroup = new THREE.Group();
  const unitGroup = new THREE.Group();
  const shadowGroup = new THREE.Group();
  const fxGroup = new THREE.Group();     // T3: verb/FX primitives (theater-verbs.js), swept like any other group
  scene.add(tileGroup, propGroup, shadowGroup, unitGroup, fxGroup);

  S.mounted = true;
  S.el = el;
  S.renderer = renderer;
  S.scene = scene;
  S.camera = camera;
  S.tileGroup = tileGroup;
  S.propGroup = propGroup;
  S.unitGroup = unitGroup;
  S.shadowGroup = shadowGroup;
  S.fxGroup = fxGroup;
  S.tweens = [];
  S.rotationStep = 0;
  S.boardCenter = new THREE.Vector3(0, 0, 0);
  S.env = THEATER_DEFAULT_ENV_FALLBACK;

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

function setBoard(data){
  if(!S.mounted || !data) return;
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);

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
  const env = data.env || THEATER_DEFAULT_ENV_FALLBACK;
  S.env = env;
  const voidTint = voidTintFor(env);
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
    const partFn = p.part && Parts.PARTS[p.part];
    if(partFn){
      const g = new THREE.Group();
      const propTint = flatTints(0x6b5638);
      renderPartInto(g, partFn, p.partParams || {}, propTint, { x: 0, y: 0, z: 0 });
      g.position.set(p.x - cx, 0, p.z - cz);
      S.propGroup.add(g);
      return;
    }
    const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
    const propTex = S.textures.prop;
    const mat = applyPsxShaderTweaks((propTex && propTex !== "pending")
      ? new THREE.MeshLambertMaterial({ map: propTex, color: 0x6b5638 })
      : new THREE.MeshLambertMaterial({ color: 0x6b5638 }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x - cx, 0.45, p.z - cz);
    S.propGroup.add(mesh);
  });

  placeCamera();
  markDirty();
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
   that as "can't resolve this unit," a clean no-op. */
function findUnit(id){
  if(!S.unitGroup || id == null) return null;
  const idStr = String(id);
  for(let i = 0; i < S.unitGroup.children.length; i++){
    if(S.unitGroup.children[i].userData && S.unitGroup.children[i].userData.unitId === idStr) return S.unitGroup.children[i];
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
function play(verb, opts){
  if(!S.mounted) return false;
  const ok = playVerb(buildTheaterCtx(), verb, opts || {});
  if(ok) startTweenLoop();
  return ok;
}

/* the tween tick loop: a SEPARATE rAF chain from the render-on-demand `raf` above (that one fires once
   per dirty flag and stops; this one runs every frame WHILE >=1 tween is live, per-frame calling
   tickTweens then markDirty to trigger the next render). Stops itself the instant tickTweens reports
   no tweens remain — "animate only while a tween is live" (this unit's brief, quoting §2's own
   render-on-demand discipline extended to animation). Idempotent: calling startTweenLoop while already
   running is a no-op (S.tweenRaf guard), so play() can call it after every verb without double-scheduling. */
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

function setUnits(data){
  if(!S.mounted || !data) return;
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);

  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  // shadow radius scales with FIGURE_SCALE too, so a bigger figure still sits on a proportionate blob.
  const shadowGeo = new THREE.CircleGeometry(0.3 * FIGURE_SCALE, 12);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: SHADOW_OPACITY, depthWrite: false
  });

  (data.units || []).forEach(u => {
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
    const figure = figureFor(u.archetype, seed, tint, u.silhouette, u.weapon, u.recipeSlug, u.pcRecipe);
    const x = u.x - cx, z = u.z - cz;
    figure.position.set(x, 0, z);
    figure.scale.setScalar(FIGURE_SCALE); // §3 G9 tune: "figure scale ~1.5x current relative to tiles"
    if(u.down){
      figure.rotation.z = Math.PI / 2;
      figure.position.y += 0.12 * FIGURE_SCALE;
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

    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, -0.49, z);
    if(u.fled) shadow.visible = false;
    S.shadowGroup.add(shadow);
  });

  markDirty();
}

function rotate(){
  if(!S.mounted) return;
  S.rotationStep = (S.rotationStep + 1) % 4;
  placeCamera();
  markDirty();
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
  S.el = el;
  const w = el.clientWidth || 1, h = el.clientHeight || 1;
  applyPsxCanvasSize(S.renderer, S.renderer.domElement, w, h);
  placeCamera();
  markDirty();
  return true;
}

function retire(){
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  if(S.tweenRaf) cancelAnimationFrame(S.tweenRaf); // T3: stop the verb tween loop too, not just render-on-demand's raf
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  clearGroup(S.fxGroup);   // T3: sweep any live verb/FX primitives (glyphs, elemental bursts, the absurdity rift)
  if(S.renderer){
    S.renderer.dispose();
    if(S.renderer.domElement && S.renderer.domElement.parentNode){
      S.renderer.domElement.parentNode.removeChild(S.renderer.domElement);
    }
  }
  S = createTheaterState();
}

// T3: THEATER_VERBS + theaterFxFromLedger re-exported on window.Theater so classic-script callers can
// reach them without their own import statement (ES-module scope is sealed, §2) — mirrors how every
// other Theater method is the classic-script-reachable surface for functionality that actually lives
// in an ES-module scope. cmTheaterNotify (src/world/render.js) is the one caller of fxFromLedger; it
// treats a missing window.Theater/fxFromLedger as a clean no-op (headless/jsdom), never a throw.
// reattach: the canvas re-parenting seam (battle-stage; renderWorld's innerHTML pass detaches the canvas).
window.Theater = {
  mount, reattach, setBoard, setUnits, setTextures, rotate, retire, play,
  verbs: THEATER_VERBS, fxFromLedger: theaterFxFromLedger
};
