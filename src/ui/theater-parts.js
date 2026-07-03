/* GENESIS MODULE — src/ui/theater-parts.js — MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2)
   THE PARTS LIBRARY. A THIRD ES-module boundary file, parallel to src/ui/theater-boot.js and
   src/ui/theater-verbs.js (its own file, its own manifest entry, its own `<script type="module">`
   tag) — kept separate so this unit's part-authoring work never collides with the parallel unit
   reworking render.js/genesis.html battle-stage CSS, or theater-boot.js's own figure-geometry code
   (this file DOES eventually get consumed by theater-boot.js's buildFigureFromParts, but that
   composition wiring is this same unit's step 2 — theater-boot.js only calls INTO this file, it
   never reaches back).

   §0 thesis: "A procedural figure is ~10 lines of DATA naming which PARTS to compose. Parts are
   code, written once (~40 of them); recipes are data, nearly free." G1 builds the ~40-part library
   ONLY — recipes (data naming which parts + params) are G2's job (data/model-recipes.js). This file
   exports PURE FUNCTIONS, never composes a whole figure and never touches THREE/window/document.

   §1 A PART is a pure function `(params) -> [{box:{w,h,d}, pos:{x,y,z}, rot:{x,y,z}, taper?, channel}]`
   in PART-LOCAL SPACE (origin/orientation conventions match theater-boot.js's existing figure-local
   space: +y up, part footprint centered near x=0, weapon/off-hand parts read on the +x side per that
   file's existing weaponMeshFor convention). Deterministic — NO Math.random anywhere in this file;
   any per-part variance a caller wants comes from `params` (seeded upstream, at recipe/build level,
   per §1's "seeding happens at recipe level"). Budget: <=6 boxes per part (checked by
   dev/verify-model-parts.mjs). `channel` names a SEMANTIC tint slot (§5: "channels, not colors") —
   `skin`/`armor`/`accent`/`glow`/`weapon` — never a literal color; the caller (theater-boot.js
   today, the recipe resolver later) resolves a channel name to an actual THREE color via the active
   palette stack. A box with no channel inherits the whole-figure default tint (kept for parity with
   theater-boot.js's existing single-tint-per-figure fallback figures).

   §2 THE ANCHOR CONTRACT: every BODY part additionally exports a `.anchors` object (attached to the
   function itself, e.g. `torsoBiped.anchors = {...}`, since a part's anchor set doesn't depend on
   `params` — it's a fixed local-space contract) naming the full anchor set:
     mainHand · offHand · back · head · shoulders · base · mount
   Each anchor value is a local transform `{pos:{x,y,z}, rot:{x,y,z}}` — the point+orientation a
   module (weapon/armor/FX part) attaches at. A body that has no meaningful position for a given
   anchor (e.g. a legless blob-mass has no natural "mount" point) still exports the key with a
   best-effort placement (never omits it — dev/verify-model-parts.mjs's "every body exports the full
   anchor set" check is unconditional, per the spec's letter) so a module never fails to resolve
   purely because ITS body happens to be an unusual shape; §4b's shape-hint resolver leans on this
   same guarantee ("nothing that exists is ever shapeless").

   MODULE parts (limbs/heads/weapons/armor/FX/props) each declare which anchor they expect via a
   `.expectedAnchor` string on the function (e.g. `swordSlab.expectedAnchor = "mainHand"`) — purely
   informational metadata for the recipe resolver (G2) and this unit's own verify harness; nothing in
   THIS file reads it, it is simply attached so the contract is machine-checkable end to end.

   SEEDING (this unit, per the brief): every part here is DECOMPOSED from theater-boot.js's existing
   PASS-2 archetype builders (buildBiped/buildQuadruped/buildFlyer/buildSerpent/buildSwarm/buildGiant/
   buildOoze/buildArachnid/buildAmorphousHorror + weaponMeshFor) — box dimensions/positions/rotations
   below are lifted verbatim from those functions' literals wherever a direct precedent exists, so the
   rendered look this module produces (once G1 step 2 wires buildFigureFromParts) stays visually
   equivalent to today. Parts with NO existing precedent (armor/FX/prop categories — theater-boot.js
   has no armor or terrain-prop geometry yet) are composed fresh IN THE ESTABLISHED STYLE (thin
   slabs, <=6 boxes, the same silhouette-first "shape reads before detail" discipline weaponMeshFor
   already uses for its sword/axe/bow/staff/spear/mace/dagger keys).

   Public surface: PARTS (a frozen {name: fn} registry — the single source of truth
   dev/verify-model-parts.mjs checks the full §1 inventory against) plus each part function as a
   named export (so a future recipe resolver can `import {torsoBiped} from "./theater-parts.js"`
   directly instead of going through the PARTS map, whichever is more convenient call-site to call-
   site — both point at the same function objects). ANCHOR_NAMES is the frozen 7-name anchor set
   (§2) both this file's own tests and a later resolver validate against. */

/* ============================================================================
   §2 the anchor contract — the 7 required anchor names, frozen so both this file and its verify
   harness read the same list rather than two independently-typed literals drifting apart.
   ============================================================================ */
export const ANCHOR_NAMES = Object.freeze([
  "mainHand", "offHand", "back", "head", "shoulders", "base", "mount"
]);

/* small helper — NOT exported, NOT a part itself: builds one box entry in the §1 shape. Kept as a
   tiny literal-object constructor (not a class) so every part function stays a plain, easily-diffed
   array of these — mirrors theater-boot.js's own addBox()'s parameter order (w,h,d,x,y,z + rotations)
   translated into the data-shape §1 asks for instead of an immediate THREE.Mesh side effect. */
function boxSpec(w, h, d, x, y, z, opts){
  opts = opts || {};
  return {
    box: { w: w, h: h, d: d },
    pos: { x: x, y: y, z: z },
    rot: { x: opts.rx || 0, y: opts.ry || 0, z: opts.rz || 0 },
    taper: opts.taper,
    channel: opts.channel || "skin"
  };
}

/* ============================================================================
   SHAPE-WAVE UNIT 1 — THE L13 PRIMITIVE LAYER (REFERENCE-DIRECTION.md L13/L6, Adam 2026-07-03:
   "the primitive vocabulary is NOT box-only... {box · taperedBox · wedge · prism6/8 · lozenge ·
   low-cone · low-blob}, each <=~60 tris, default box for back-compat. Organic masses get
   tapered/faceted volumes; boxes are for crates, plates, and architecture.")

   A spec now MAY carry a `shape` field naming a non-box primitive; when absent it is "box" (the
   pre-Unit-1 default — every existing boxSpec call is byte-identical, so all 510 recipes stay valid
   and verify-model-parts' box{w,h,d}>0 checks all still hold). Each primitive still carries a
   `box:{w,h,d}` BOUNDING size (the same field the pixel-skin texture sizing + tri-budget math read),
   plus a small shape-specific param set (e.g. taperedBox's `topScale`, prism's `sides`). theater-boot.js's
   geometryForSpec routes on `shape` to build the matching THREE geometry sized to that bounding box.

   TRI BUDGETS (SHAPE_TRIS, the single source the tri-budget harness counts against without importing
   THREE — a plain triangle-count-per-primitive table, kept in EXACT lockstep with geometryForSpec's
   own segment choices in theater-boot.js by comment/convention, the same one-way classic/module
   discipline the rest of this codebase uses). Every primitive is <=60 tris:
     box          12  (BoxGeometry — 6 faces × 2)
     taperedBox   12  (BoxGeometry, +Y face vertices scaled by topScale — same tri count as a box)
     wedge         8  (a triangular prism / ramp — 2 tri sides + 3 quad faces... an explicit 8-tri
                       BufferGeometry: 2 triangular end-caps + the 3 rectangular faces as 2 tris each
                       = 2 + 6 = 8)
     prism6       24  (CylinderGeometry(6): 6 side quads ×2 + top/bottom 6-fans = 12 + 12)
     prism8       32  (CylinderGeometry(8): 8 side quads ×2 + top/bottom 8-fans = 16 + 16)
     lozenge       8  (OctahedronGeometry(detail 0) — 8 faces, stretched per box dims)
     coneLow      16  (ConeGeometry(8): 8 side tris + 8-fan base)
     blobLow      20  (IcosahedronGeometry(detail 0) — 20 faces; detail<=1 per the ruling, 0 chosen so
                       one blob stays under 60; a rounder read comes from stacking a few, not from
                       subdividing one past the budget)
   ============================================================================ */
export const SHAPE_TRIS = Object.freeze({
  box: 12, taperedBox: 12, wedge: 8, prism6: 24, prism8: 32, lozenge: 8, coneLow: 16, blobLow: 20
});

/* THE LOFT PRIMITIVE (SHAPE-WAVE, L21 TOPOLOGY LAW — Adam 2026-07-03, from the 400-tri/207-vert
   low-poly humanoid wireframe reference: "organic masses are ONE continuous skin, not glued blocks;
   limb/torso cross-sections are 6-8 sided loops, tapering, never square; triangle density concentrates
   at joints"). A loft is a SPINE of cross-section loops skinned into one continuous triangle mesh with
   capped ends — the primitive that lets a torso flow into hips and a limb flow at the shoulder, instead
   of gluing separate blocks. It is a VARIABLE-tri primitive (unlike the fixed box-solids above): its
   count is a function of its spine, so it is NOT in SHAPE_TRIS — the spec carries a precomputed `tris`
   field the budget harness reads instead. The ≤60-tri box-primitive cap does NOT bind a loft (the L21
   reference proves a torso is ~120 tris well spent); a loft still lives inside the 150-350 FIGURE
   window like everything else.

   spine: an array of loops, each {y, rx, rz, sides?, x?, z?}:
     y        — the loop's height (part-local); loops SHOULD be ordered low->high but any order works.
     rx, rz   — the loop's half-extents on x and z (an ellipse; rx!=rz gives a flattened cross-section,
                e.g. a chest deeper than wide, or a wolf's ribcage wider than tall).
     sides    — vertices in this loop (default 6; 6-8 per L21). A loop may narrow to a POINT with
                rx=rz=0 (a capped tip — a domed head-top, a tapered tail).
     x, z     — optional lateral offset of the loop's center (a spine that bends/leans).
   The mesh: consecutive loops are bridged (loop[i] verts -> loop[i+1] verts) as a quad strip (2 tris
   per side), and the two END loops are fan-capped (unless they're already a point). All loops share
   the same `sides` count for a clean bridge — the constructor normalizes to the MAX sides in the spine
   (a lower-count loop repeats verts). Deterministic: pure function of the spine, no randomness. */
function loftTris(spine, sides){
  // (loops-1) rings * sides quads * 2 tris + up to 2 end fans (sides-2 tris each for a polygon cap,
  // 0 for a point-cap). Computed here so the spec can carry it and the harness needs no THREE.
  const n = spine.length;
  if(n < 2) return 0;
  let t = (n - 1) * sides * 2;
  const first = spine[0], last = spine[n - 1];
  if(!(first.rx === 0 && first.rz === 0)) t += (sides - 2); // fan-cap the bottom unless it's a point
  if(!(last.rx === 0 && last.rz === 0)) t += (sides - 2);   // fan-cap the top unless it's a point
  return t;
}
function loftSpec(spine, opts){
  opts = opts || {};
  // the bounding box (for pixel-skin texture sizing + the anchor/placement reasoning every spec needs):
  // the spine's x/z/y extent. A loop's own x/z offset widens the box.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  let maxSides = 3;
  spine.forEach(function(lp){
    const cx = lp.x || 0, cz = lp.z || 0;
    minX = Math.min(minX, cx - lp.rx); maxX = Math.max(maxX, cx + lp.rx);
    minZ = Math.min(minZ, cz - lp.rz); maxZ = Math.max(maxZ, cz + lp.rz);
    minY = Math.min(minY, lp.y); maxY = Math.max(maxY, lp.y);
    if(lp.sides && lp.sides > maxSides) maxSides = lp.sides;
  });
  if(maxSides < 6) maxSides = 6; // L21: 6-8 sided loops, never square
  const w = Math.max(0.02, maxX - minX), h = Math.max(0.02, maxY - minY), d = Math.max(0.02, maxZ - minZ);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
  return {
    box: { w: w, h: h, d: d },
    pos: { x: opts.x || 0, y: opts.y || 0, z: opts.z || 0 },
    rot: { x: opts.rx || 0, y: opts.ry || 0, z: opts.rz || 0 },
    channel: opts.channel || "skin",
    shape: "loft",
    spine: spine,
    sides: maxSides,
    // the loft's own local center (so the render can center the pixel-skin UV / bounding reasoning);
    // informational — geometryForSpec builds the mesh at the spine's own coordinates.
    center: { x: cx, y: cy, z: cz },
    tris: loftTris(spine, maxSides)
  };
}

/* taperedBox — a box whose TOP (+Y) face is scaled by `topScale` (0..1 narrows toward the top, >1
   flares). The organic-mass primitive for a torso/limb that should read as a body, not a crate (L6).
   `box` is the bounding size at the WIDEST (bottom) face; the render frustum-scales the top. */
function taperedBoxSpec(w, h, d, x, y, z, topScale, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  s.shape = "taperedBox";
  s.topScale = topScale != null ? topScale : 0.7;
  return s;
}
/* wedge — a triangular prism (ramp): the sloped face rises from the -x low edge to the +x high edge
   over depth d, height h. `dir` (+1 default / -1) flips which x-end is tall. The maw/beak/snout point
   primitive (L6 "wedges over boxes"). */
function wedgeSpec(w, h, d, x, y, z, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  s.shape = "wedge";
  s.dir = opts.dir != null ? opts.dir : 1;
  return s;
}
/* prism — a faceted column with `sides` (6 or 8). A rounded-but-cheap limb/segment/pillar read
   (spider leg segments, tapered horns). `box` bounds it; the render maps w->x-diameter, d->z-diameter,
   h->height. */
function prismSpec(w, h, d, x, y, z, sides, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  const n = sides === 8 ? 8 : 6;
  s.shape = n === 8 ? "prism8" : "prism6";
  s.sides = n;
  s.topScale = opts.topScale != null ? opts.topScale : 1; // a tapered prism (topScale<1) reads as a limb
  return s;
}
/* lozenge — a stretched octahedron (a faceted diamond). The oversized-fist / eyeless-head / pod read
   (L14's fist volume gets a rounder, more hand-like read than a cube). */
function lozengeSpec(w, h, d, x, y, z, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  s.shape = "lozenge";
  return s;
}
/* coneLow — a low-poly cone (8-sided), point-up by default (dir:-1 points down). Horns, teeth,
   spikes, drip-tendril tips. */
function coneLowSpec(w, h, d, x, y, z, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  s.shape = "coneLow";
  s.dir = opts.dir != null ? opts.dir : 1; // +1 point-up, -1 point-down
  return s;
}
/* blobLow — a low-poly icosphere (detail 0, 20 tris), scaled per box dims. The rounded-mass primitive
   for oozes/pods (L20 "ROUNDED blob, not stacked cuboids"). */
function blobLowSpec(w, h, d, x, y, z, opts){
  opts = opts || {};
  const s = boxSpec(w, h, d, x, y, z, opts);
  s.shape = "blobLow";
  return s;
}

/* a local (non-exported) anchor-transform constructor, matching §2's `{pos:{x,y,z}, rot:{x,y,z}}`
   shape exactly — used to build every body part's `.anchors` object below. */
function anchor(x, y, z, opts){
  opts = opts || {};
  return { pos: { x: x, y: y, z: z }, rot: { x: opts.rx || 0, y: opts.ry || 0, z: opts.rz || 0 } };
}

/* ============================================================================
   BODIES (8) — each exports the full §2 anchor set. Geometry lifted from theater-boot.js's PASS-2
   builders (buildBiped/buildGiant/buildQuadruped/buildArachnid/buildSerpent/buildSwarm/buildOoze/
   buildAmorphousHorror) — see each function's header comment for its source builder. `params.tint`
   is accepted (matching theater-boot.js's per-box `tint` argument) but every box's real color
   resolution is the CALLER's job (§5 channels) — this file only ever tags a semantic channel name.
   ============================================================================ */

/* torso-biped — source: theater-boot.js buildBiped()'s non-caster branch, TORSO CORE ONLY (head/
   torso/shoulder bar/pelvis — 4 boxes, within §1's <=6-box-per-part budget). Legs and arms are
   SEPARATE modules (leg-tapered x2 + arm-tapered x2, attached at `base`/`shoulders`), matching §1's
   part-per-concern granularity (a body's job is the torso core; a limb is its own reusable part,
   composed per side by the caller) — the pre-G1 monolithic buildBiped() drew all 8 boxes in one
   function; G1 splits that into 4 (core) + 2x2 (legs, via leg-tapered) so every part independently
   respects the budget. martial/ranger/default silhouette. params: {crouch=0, stanceTilt=0.05} mirror
   buildBiped's own `crouch`/`stanceTilt` locals (ranger crouch, seeded per-figure weight-shift) —
   left as caller-supplied params instead of an internal seededJitter call since §1 forbids randomness
   INSIDE a part; the seed->jitter mapping now happens one layer up, at recipe/build time.

   G5 ROUND-1 (ruling 5, posture params): {stance, headScale=1} added. `stance:"hunched"` (goblinoids,
   via keyword) tips the torso forward ~25° (rz) and drops+forward-tilts the head on top of that (a
   steeper head-only rz so the head reads "forward and down," not just riding the torso's own tilt),
   bends the knees a touch further (an extra crouch nudge) — "classic goblin silhouettes are hunched
   with oversized heads" per Adam's own reference note, paired with `headScale` (default 1, recipes
   set ~1.25 for goblinoids via scalars.headScale) scaling ONLY the head box's footprint, not the whole
   figure. `stance:"slouched"` (zombies) drops one shoulder asymmetrically and lets the torso hang
   off-vertical on BOTH x and z (an uneven, off-balance lean, distinct from hunched's forward-only
   symmetric tip) — arms hanging is achieved by the (separate) arm-tapered calls carrying their own
   slouched tiltZ, not by this body part. `stance:"crouched"` (rogues/ambushers) is a deeper, wider-
   kneed crouch than the existing ranger `crouch` param — reuses crouch's own y-drop convention at a
   larger magnitude rather than inventing a second drop axis. */
/* SHAPE-WAVE UNIT 2 + L21 TOPOLOGY LAW: the torso is now a single LOFTED MASS — one continuous skin
   flowing neck -> shoulders -> chest -> waist -> hips (never a box torso glued to a box pelvis). Per
   the 400-tri humanoid reference: 6-8 sided cross-section loops, tapering, the chest deeper on z than
   wide (a real ribcage), the waist pinched, the hips flaring back out. The head stays a separate box
   (box[0], preserved so buildBiped's caster branch + any index-reader stay valid) and the shoulder bar
   stays an armor-channel box (a plate/harness read on top of the flowing torso, L8). Stance params are
   honored by tilting the whole loft (rz on the loft spec) + the head. torsoScale flattens/widens the
   loop radii (a gaunt undead 0.85 -> a narrow hollow torso; a heavy construct >1 -> a broad slab).
   BOX LAYOUT (preserved contract): [0]=head, [1]=torso LOFT, [2]=shoulder bar, [3]=hip nub — the same
   head/torso/shoulder/pelvis ORDER the old 4-box version used, so .slice(0,3) (caster) + any index
   reasoning still line up (box[1] is now a loft, but still "the torso"; box[3] is a small hip nub
   the loft's own hips already cover — kept as a cheap explicit pelvis marker for parity). */
export function torsoBiped(params){
  params = params || {};
  const crouch = params.crouch || 0;
  const stanceTilt = params.stanceTilt != null ? params.stanceTilt : 0.05;
  const stance = params.stance || null;
  const headScale = params.headScale != null ? params.headScale : 1;
  // UNIT 3 (L3): torsoScale multiplies the torso's WIDTH/DEPTH only (a gaunt undead = 0.85 -> a
  // narrower, hollowed torso; a heavier construct > 1). Frame landmarks (shoulder/hip Y) don't shift.
  const torsoScale = params.torsoScale != null ? params.torsoScale : 1;
  const hunched = stance === "hunched";
  const slouched = stance === "slouched";
  const crouchedStance = stance === "crouched";
  const torsoTilt = hunched ? 0.44 : (stanceTilt * 0.3);          // ~25° forward tip, hunched
  const headTilt = hunched ? 0.62 : 0;                             // steeper still — head forward+down
  const headDrop = hunched ? 0.05 : 0;
  const extraCrouch = crouchedStance ? 0.1 : 0;
  const shoulderDropX = slouched ? 0.22 : 0;                       // asymmetric shoulder-drop rotation
  const slouchLeanZ = slouched ? -0.14 : 0;                        // off-vertical hang, not a clean tip
  const c = crouch + extraCrouch;
  const ts = torsoScale;
  // the torso loft spine (neck at top -> hips at bottom). radii: rx = half-WIDTH, rz = half-DEPTH.
  // chest is deeper (rz) than wide (rx) — the ribcage read; waist pinches; hips flare back. 6-sided
  // loops (the lean end of L21's 6-8 range) keep the whole biped inside the 250-300 budget.
  const bodyLoft = loftSpec([
    { y: 0.58 - c, rx: 0.15 * ts, rz: 0.13 * ts, sides: 6 },   // hips (flared, wider than waist)
    { y: 0.72 - c, rx: 0.12 * ts, rz: 0.11 * ts, sides: 6 },   // waist (pinched)
    { y: 0.86 - c, rx: 0.16 * ts, rz: 0.15 * ts, sides: 6 },   // chest (deep on z — the ribcage)
    { y: 0.98 - c, rx: 0.17 * ts, rz: 0.13 * ts, sides: 6 },   // upper chest / shoulder shelf (broad on x)
    { y: 1.06 - c, rx: 0.08, rz: 0.08, sides: 6 }              // neck base (tapers in)
  ], { rz: torsoTilt + slouchLeanZ, rx: slouched ? 0.08 : 0, channel: "skin" });
  return [
    boxSpec(0.22 * headScale, 0.18 * headScale, 0.18 * headScale, 0, 1.16 - c - headDrop, hunched ? 0.05 : 0,
      { rz: torsoTilt + headTilt, channel: "skin" }),                                        // 0 head
    bodyLoft,                                                                                 // 1 torso LOFT (was a box)
    boxSpec(0.5, 0.09, 0.19, 0, 1.0 - c, 0, { rz: shoulderDropX, channel: "armor" })          // 2 shoulder bar
  ];
}
/* the exact leg params torso-biped's own source (buildBiped's non-caster branch) used, exposed so
   theater-boot.js's buildBiped can compose 2x leg-tapered calls that reproduce the original's
   thigh/shin geometry precisely (left thigh/shin: x=-0.12, tiltZ=-stanceTilt; right: x=0.12,
   tiltZ=stanceTilt*1.4) without duplicating these literals at the call site. Not itself a §1 part —
   a small param-factory helper kept next to its body for discoverability. */
torsoBiped.legParams = function(side, crouch, stanceTilt){
  return { baseW: 0.11, segLen: 0.26, x: side * 0.12, yStart: 0.02 - crouch,
    tiltZ: side < 0 ? -stanceTilt : stanceTilt * 1.4, foot: false }; // biped legs: no paw wedge (feet don't read at cell scale)
};
/* FRAME RETARGET (2026-07-03, Adam's round-1 sheet review + director diagnosis — supersedes the
   whole G5-round-1/round-2 grip saga below). The ROOT of that saga was never the anchor Y — it was
   that arm-tapered's arms hung from the OLD 0.56 hip line (an un-converted archetype-builder frame),
   so every attempt to seat a weapon "at the hand" chased a forearm that was itself drawn at the hip.
   With arm-tapered now hanging arms from the real shoulder line (yStart 1.0, see that part's own
   FRAME-RETARGET header — forearm now spans shoulder 1.0 -> wrist 0.58), the grip can finally sit
   where a held weapon belongs: a READY-GRIP height (L11 "weapon held across the body") at y=0.76 —
   below the shoulder line (1.0), well above the old hip band (0.56), squarely on the mid/lower
   forearm (the arm spans 0.58-1.0). x pulled slightly INWARD (0.3 -> 0.26) so the grip visually
   meets the forearm (arm sits at x=0.3) and the weapon reads carried across the body, not stuck out
   to the side. rz stays 0 by design: the per-weapon-shape cant (sword forward, spear vertical, bow
   held out) is theater-boot.js's WEAPON_CANT table's job, applied by BOTH render paths on top of
   this plain POSITION (keeping rotation out of the anchor avoids the two callers double-canting).
   `back` (wings) stays at 0.85 shoulder-blade height (just below the shoulders line, never above the
   head — see wingSlab's own FRAME-RETARGET note; lowered a hair from 0.9 to 0.85 to sit clearly
   below the shoulder bar). theater-boot.js's WEAPON_BASE_OFFSET is kept byte-identical to this
   mainHand by hand — the "one grip contract, two render paths" invariant.

   THE FIST RULE (L14, 2026-07-03, Adam ruling 3 — supersedes the ready-grip 0.76 anchor above): a
   held weapon must pass THROUGH the fist volume (geometric intersection), not sit adjacent to a bare
   anchor point. arm-tapered now draws an oversized FIST box at the FOREARM END (the wrist, y=0.58 for
   this body — armTapered.fistBox), so mainHand/offHand move DOWN from the mid-forearm ready-grip
   (0.76) to the FIST CENTER (y=0.58, x=±0.3 = the arm's own x): a weapon seated here has its grip
   section INSIDE the fist. The weapon still reads "held across the body" — that's the WEAPON_CANT's
   job now (a canted blade from a fist at 0.58 sweeps up-and-across the torso). This is NOT a return of
   the old hip-band bug: the difference is the visible fist wrapping the grip (the old bug had a bare
   point with no hand), which is exactly the "position-only proximity is the failure mode" ruling. */
torsoBiped.anchors = {
  mainHand: anchor(0.3, 0.58, 0.02),
  offHand: anchor(-0.3, 0.58, 0.02, { ry: 0.15 }),   // shield-slab's own outward face turn (ry unchanged)
  back: anchor(0, 0.85, -0.14),
  head: anchor(0, 1.22, 0),
  shoulders: anchor(0, 1.0, 0),
  base: anchor(0, 0, 0),
  mount: anchor(0, 0.62, 0)
};

/* torso-tapered — FIGURE-FIDELITY ROUND-2 UNIT 2 (L6 "a box torso reads as a crate; a tapered wedge
   reads as a body"). A torso-biped VARIANT with SHOULDERS WIDER THAN HIPS — the athletic/soldier
   V-taper the flat torso-biped crate lacks. Same anatomical vocabulary and the SAME frame as
   torso-biped (identical head/shoulder/pelvis Y positions, so it reuses torso-biped's own
   .legParams/.anchors verbatim — the frame retarget's shoulder-line arms + ready-grip weapons carry
   over unchanged), differing ONLY in the width taper: a wider shoulder bar + a narrower waist/pelvis,
   so the silhouette reads as a body, not a box. A NEW part (torso-biped is NOT removed — recipes
   reference bases by name; removing would break 510 recipes), opt-in per family via the generator.
   The taper is deliberately MINIMAL box-width-proportions (no bespoke taper math — L13's shape-
   primitive layer generalizes real tapers next wave); this just needs the V-silhouette to read. It
   honors the SAME stance/headScale params torso-biped reads (a tapered goblinoid could still hunch),
   so nothing that keys off stance regresses when a recipe swaps torso-biped -> torso-tapered. */
export function torsoTapered(params){
  params = params || {};
  const crouch = params.crouch || 0;
  const stanceTilt = params.stanceTilt != null ? params.stanceTilt : 0.05;
  const stance = params.stance || null;
  const headScale = params.headScale != null ? params.headScale : 1;
  const torsoScale = params.torsoScale != null ? params.torsoScale : 1;  // UNIT 3 (L3) — chest/waist width
  const hunched = stance === "hunched";
  const slouched = stance === "slouched";
  const crouchedStance = stance === "crouched";
  const torsoTilt = hunched ? 0.44 : (stanceTilt * 0.3);
  const headTilt = hunched ? 0.62 : 0;
  const headDrop = hunched ? 0.05 : 0;
  const extraCrouch = crouchedStance ? 0.1 : 0;
  const shoulderDropX = slouched ? 0.22 : 0;
  const slouchLeanZ = slouched ? -0.14 : 0;
  const c = crouch + extraCrouch;
  // BOX ORDER is deliberately head(0) / torso-chest(1) / shoulder-bar(2) / pelvis(3) / waist(4) —
  // the SAME head/torso/shoulder/pelvis order torso-biped/torso-biped-huge use for their first four
  // boxes, so any consumer that reads a body's torso as box[1] and pelvis as box[3] (the shared
  // convention — e.g. the weapon-seat/base-disc harness checks) stays correct on this body too. The
  // taper's extra waist box is appended LAST (index 4) so it never shifts those load-bearing indices.
  return [
    boxSpec(0.22 * headScale, 0.16 * headScale, 0.18 * headScale, 0, 1.14 - c - headDrop, hunched ? 0.05 : 0,
      { rz: torsoTilt + headTilt, channel: "skin" }),                                        // 0 head
    // torso is a WEDGE: wider at the chest (shoulder-adjacent top), narrower at the waist (box 4).
    // UNIT 3: torsoScale multiplies chest/waist width/depth (height untouched, frame landmarks fixed).
    boxSpec(0.32 * torsoScale, 0.24, 0.2 * torsoScale, 0, 0.9 - c, 0, { rz: torsoTilt + slouchLeanZ, rx: slouched ? 0.08 : 0, channel: "skin" }), // 1 torso/chest — BROAD
    boxSpec(0.56, 0.09, 0.2, 0, 1.02 - c, 0, { rz: shoulderDropX, channel: "armor" }),        // 2 shoulder bar — WIDER than torso-biped's 0.5
    boxSpec(0.2, 0.13, 0.18, 0, 0.6 - c, 0, { channel: "skin" }),                             // 3 pelvis/hips — NARROW
    boxSpec(0.2 * torsoScale, 0.14, 0.17 * torsoScale, 0, 0.74 - c, 0, { rz: torsoTilt + slouchLeanZ, channel: "skin" }) // 4 waist — NARROW (the taper, between chest & pelvis)
  ];
}
// torso-tapered reuses torso-biped's OWN leg params + anchor set verbatim (same frame — see this
// part's header). Attaching them by reference (not a copy) keeps the two bodies' frames in lockstep:
// a future frame change to torso-biped propagates to torso-tapered automatically, no second edit.
torsoTapered.legParams = torsoBiped.legParams;
torsoTapered.anchors = torsoBiped.anchors;

/* torso-biped-huge — source: theater-boot.js buildGiant() (huge biped, massive shoulders, 1.5-2 tile
   read per Adam's own note quoted in that file). Same anatomical vocabulary as torso-biped but every
   proportion scaled up, shoulder bar disproportionately wider (the mass differential IS the
   archetype, not a uniform scale-up — matches buildGiant's own comment). TORSO CORE ONLY (4 boxes,
   within §1's <=6-box-per-part budget) — legs/arms are separate leg-tapered/arm-tapered calls (see
   .legParams/.armParams factories below), matching torso-biped's own G1 split. */
export function torsoBipedHuge(params){
  params = params || {};
  const lean = params.lean || 0;
  return [
    boxSpec(0.3, 0.24, 0.26, 0, 1.68, 0, { rz: lean, channel: "skin" }),           // head, large/blocky
    boxSpec(0.44, 0.62, 0.32, 0, 1.28, 0, { rz: lean * 0.6, channel: "skin" }),    // torso — thick, tall
    boxSpec(0.82, 0.16, 0.32, 0, 1.5, 0, { channel: "armor" }),                   // massive shoulder bar
    boxSpec(0.36, 0.2, 0.28, 0, 0.9, 0, { channel: "skin" })                      // pelvis — wide
  ];
}
/* source: buildGiant's addTaperedLimb(2,0.18,0.18,0.4,x,0.1,0,tint,1,tiltZ,0) — dir=1 stacks UPWARD
   from yStart=0.1, tiltZ=side*0.06. Exposed as a param-factory (not a §1 part of its own) so
   theater-boot.js's buildGiant can compose 2x leg-tapered without duplicating these literals. */
torsoBipedHuge.legParams = function(side){
  return { baseW: 0.18, segLen: 0.4, x: side * 0.2, yStart: 0.1, tiltZ: side * 0.06, foot: false };
};
/* FRAME RETARGET (2026-07-03): the giant's arms hang from ITS shoulder line — torsoBipedHuge.anchors
   .shoulders.y = 1.5 — not the old 1.1 (which sat below the shoulder bar, the same un-converted-frame
   hip-hang bug arm-tapered's own header documents at biped scale). yStart 1.1 -> 1.5; with segLen 0.36
   x 2 the arm now spans shoulder(1.5)->wrist(0.78), reaching the pelvis band (0.9) like a real arm. */
torsoBipedHuge.armParams = function(side){
  return { side, x: side * 0.5, tiltZ: side * 0.22, baseW: 0.15, segLen: 0.36, yStart: 1.5 };
};
/* G5 ROUND-1 (ruling 3): same grip-seat fix as torso-biped above — the giant's own arm-tapered call
   (armParams: x=side*0.5, yStart=1.1, segLen=0.36, dir=-1) bottoms its forearm at y~0.38 (1.1 -
   0.36*2), not the old anchor's y=0.5/1.1 (upper-arm/shoulder height). Retargeted to the arm's real
   x (0.5) and a y just above the forearm's true bottom (0.42).

   FRAME RETARGET (2026-07-03, supersedes the G5-round-2 hip-band values below): once the giant's
   arms hang from their real shoulder line (armParams yStart 1.1 -> 1.5, above), the hip-band grip
   (y=0.85) is again below the forearm and beside the thigh — the exact symptom the round-2 hip-band
   move was chasing, now curable at the source. mainHand/offHand rise to a READY-GRIP height (L11:
   weapon held across the body) proportional to this body's taller frame: biped grips at ~0.76 of its
   1.0 shoulder line, so the giant grips at ~0.76 * 1.5 = ~1.14 (below the shoulder bar 1.5, well above
   the pelvis 0.9), x pulled slightly inward (0.5 -> 0.44) so the grip visually meets the forearm
   (which sits at x=0.5). rz stays 0 — WEAPON_CANT owns the per-weapon cant on top (one grip contract,
   both render paths; see theater-boot.js's WEAPON_BASE_OFFSET, kept in sync by hand). `back` (wings)
   stays at 1.4 — shoulder-blade height, just below the shoulders line (1.5), never above the head.

   THE FIST RULE (L14): same fist retarget as torso-biped — the giant's arm draws its fist at the
   wrist (x=0.5, y = 1.5 - 0.36*2 = 0.78; armParams' bigger baseW/segLen make a proportionally bigger
   fist automatically), so mainHand/offHand move to the fist center (0.5, 0.78) for grip intersection,
   down from the ready-grip 1.14. WEAPON_CANT carries the "across the body" read from there. */
torsoBipedHuge.anchors = {
  mainHand: anchor(0.5, 0.78, 0.04),
  offHand: anchor(-0.5, 0.78, 0.04, { ry: 0.15 }),
  back: anchor(0, 1.4, -0.2),
  head: anchor(0, 1.8, 0),
  shoulders: anchor(0, 1.5, 0),
  base: anchor(0, 0, 0),
  mount: anchor(0, 0.9, 0)
};

/* torso-quad — SHAPE-WAVE UNIT 2 + L21/reference-#12 (the low-poly horse): the quadruped now has a
   REAL NECK, which is what makes a four-legged species read instead of a plank. The body is a
   HORIZONTAL LOFT along +x (the spine runs front-to-back): a series of vertical cross-section loops
   from the tail root, through a deep muscled haunch, a pinched loin, a deeper-and-taller chest, up to
   the shoulders — chest loops deeper/wider than the haunch (the horse reference's proportion). A
   SEPARATE rising NECK LOFT (diagonal, 3 loops) flows out of the shoulders up to the head; the wedge
   head + maw module front it. Ear spikes (coneLow, ~cheap) + a hanging tail plane (wedge) finish the
   silhouette. Body long axis +x; the figure's stage yaw (theater-boot UNIT 0) turns it broadside.
   The 4 legs arrive from the recipe (front straighter, rear hock-bent — theater-boot's QUAD leg sets).

   NOTE the horizontal loft: loftSpec's spine loops are stacked on the loop `y` field, i.e. a VERTICAL
   spine — so a horizontal body is authored as a vertical loft (loops along body height) that is then
   laid on its side? No: cleaner to author each body cross-section as its own vertical column is wrong
   too. Instead the body loft here uses loops whose CENTERS walk along +x via the loop `x` field while
   sharing a body-height `y`, and rx as the along-body half-length is small (a thin disc) — that gives a
   nose-to-tail tube. To keep the ellipse in the correct plane (cross-section faces +x), each loop is a
   THIN slab on x (rx small = the disc thickness) and full on z (rz = body half-width) with the loop
   stepping along x. Height variation (chest taller than haunch) rides on rz being the vertical... no —
   loftSpec's ellipse is in the X/Z plane at height y. For a horizontal animal body we want circles in
   the Y/Z plane stepping along X. loftSpec can't do that directly, so the body is built as a SHORT
   vertical loft (the torso's girth) and STRETCHED/placed as a barrel via a horizontal prism instead —
   we keep the barrel-prism trunk (rounded ribcage) but ADD the missing neck+head line as lofts, which
   is the actual fix the reference calls for (the plank read came from the missing neck, not the trunk
   shape). Trunk stays a prism6 laid horizontal; haunch/chest swells give the fore/aft mass; the neck
   loft + wedge head are the new species-defining line. */
export function torsoQuad(params){
  params = params || {};
  const out = [
    // trunk: a prism6 barrel laid horizontal (rounded ribcage), long on +x, front (+x) end deeper.
    prismSpec(0.66, 0.3, 0.34, -0.04, 0.45, 0, 6, { topScale: 0.92, rz: Math.PI / 2, channel: "skin" }),
    // rear haunch — a lozenge over the hindquarter (the muscled hip, the horse reference's deep rear).
    lozengeSpec(0.36, 0.38, 0.4, -0.3, 0.44, 0, { channel: "skin" }),
    // chest/shoulder mass at the front — DEEPER and TALLER than the haunch per reference #12.
    lozengeSpec(0.3, 0.36, 0.36, 0.24, 0.46, 0, { channel: "skin" })
  ];
  // THE NECK (reference #12): a rising diagonal loft, 3 loops from the shoulders up-and-forward to the
  // head. This line is what makes a quadruped read as a species and not a crate. Loops step up in y and
  // forward in x (the `x` offset), tapering toward the head.
  out.push(loftSpec([
    { y: 0.5, x: 0.36, rx: 0.13, rz: 0.13, sides: 6 },   // neck base at the shoulders
    { y: 0.6, x: 0.46, rx: 0.11, rz: 0.11, sides: 6 },   // mid neck (rising forward)
    { y: 0.66, x: 0.56, rx: 0.1, rz: 0.1, sides: 6 }     // neck top, into the head
  ], { channel: "skin" }));
  // head block — the maw-open / head-snout module fronts this (recipe attaches at `head`); a solid
  // cranium so a beast with NO maw still has a real head. Sits forward+up at the neck top.
  out.push(boxSpec(0.2, 0.19, 0.2, 0.64, 0.66, 0, { channel: "skin" }));
  // brow ridge — a small wedge (the low predatory forehead), reads even without a maw.
  out.push(wedgeSpec(0.14, 0.07, 0.18, 0.7, 0.73, 0, { dir: 1, channel: "skin" }));
  // ear spikes (reference #12 item 2) — cheap WEDGES (8 tris ea. vs a cone's 16) — the alert-animal read.
  out.push(wedgeSpec(0.05, 0.1, 0.06, 0.6, 0.78, 0.07, { dir: 1, rz: -0.2, channel: "skin" }));
  out.push(wedgeSpec(0.05, 0.1, 0.06, 0.6, 0.78, -0.07, { dir: 1, rz: -0.2, channel: "skin" }));
  // tail (reference #13 item 3: the tail has VOLUME — a lofted curve, never a flat plane): a short
  // 3-loop loft sweeping down-and-back off the haunch, tapering to a point.
  out.push(loftSpec([
    { y: 0.42, x: -0.44, rx: 0.06, rz: 0.06, sides: 6 },   // tail root (at the haunch)
    { y: 0.3, x: -0.56, rx: 0.045, rz: 0.045, sides: 6 },  // mid tail (curving down-back)
    { y: 0.16, x: -0.62, rx: 0.0, rz: 0.0, sides: 6 }      // tail tip (a point)
  ], { channel: "skin" }));
  return out;
}
// UNIT 2: anchors retargeted to the rebuilt body. `head` now sits at the head block's FRONT face
// (x=0.66, y=0.6) so the maw-open module reads as the jaws AT the muzzle, not floating behind it.
// `back` raised to the barrel's top (y=0.66) so a winged quad (the bat) mounts its wings on the spine.
torsoQuad.anchors = {
  mainHand: anchor(0.72, 0.6, 0.1),    // a quadruped has no real "hand" — best-effort at the snout/bite point
  offHand: anchor(0.72, 0.6, -0.1),
  back: anchor(-0.06, 0.66, 0),
  head: anchor(0.66, 0.6, 0),
  shoulders: anchor(0.26, 0.56, 0),
  base: anchor(0, 0.02, 0),
  mount: anchor(-0.06, 0.56, 0)        // riding position, back-mounted
};

/* blob-mass — source: theater-boot.js buildOoze() (low wide blob, stacked shrinking irregular
   boxes; no limbs/head by design — "the ABSENCE of any articulated parts... a soft-edged read"). 6
   layers, offsets driven by `params.offsets` (a caller-seeded array, since §1 forbids intra-part
   randomness) so the deterministic irregular-slump read stays reachable without Math.random here. */
export function blobMass(params){
  params = params || {};
  const offsets = params.offsets || [0, 0, 0, 0, 0, 0];
  const layers = 6;
  let w = 0.62, d = 0.62, y = 0;
  const out = [];
  for(let i = 0; i < layers; i++){
    const h = 0.1 + (offsets[i] ? offsets[i] * 0.02 : 0);
    const cy = y + h / 2;
    const ox = (offsets[(i + 1) % offsets.length] || 0) * 0.06;
    const oz = (offsets[(i + 2) % offsets.length] || 0) * 0.06;
    out.push(boxSpec(w, h, d, ox, cy, oz, { ry: (offsets[(i + 3) % offsets.length] || 0) * 0.3, channel: "skin" }));
    y += h;
    w *= 0.78; d *= 0.78;
  }
  return out;
}
blobMass.anchors = {
  mainHand: anchor(0.3, 0.3, 0),
  offHand: anchor(-0.3, 0.3, 0),
  back: anchor(0, 0.4, -0.2),
  head: anchor(0, 0.55, 0),
  shoulders: anchor(0, 0.4, 0),
  base: anchor(0, 0, 0),
  mount: anchor(0, 0.3, 0)
};

/* thorax-abdomen — source: theater-boot.js buildArachnid()'s body core (cephalothorax + abdomen,
   "the real spider-anatomy split"). Leg placement lives in the leg-spider module part, not here —
   this body part is just the 2-segment torso core. */
export function thoraxAbdomen(params){
  // SHAPE-WAVE UNIT 2: the two body segments are now rounded MASSES (blobLow) instead of boxes — a
  // spider's cephalothorax + bulbous abdomen read as swollen ovoids, not bricks. The abdomen (rear) is
  // the larger, taller dome (a motif canvas for the sigil paint, L10). Front cephalothorax carries the
  // head/fang attach. Raised a touch (y~0.24) so the arced legs (leg-spider, knee above the body) read
  // as coming down from under a lifted body.
  return [
    blobLowSpec(0.26, 0.2, 0.24, 0.14, 0.24, 0, { channel: "skin" }),   // cephalothorax (front)
    blobLowSpec(0.36, 0.3, 0.38, -0.18, 0.26, 0, { channel: "skin" })   // abdomen (rear, larger dome)
  ];
}
thoraxAbdomen.anchors = {
  mainHand: anchor(0.32, 0.24, 0.1),   // foreleg/fang read — best-effort, arachnids have no true hand
  offHand: anchor(0.32, 0.24, -0.1),
  back: anchor(-0.16, 0.34, -0.15),
  head: anchor(0.24, 0.24, 0),
  shoulders: anchor(0.14, 0.24, 0),
  base: anchor(0, 0, 0),
  mount: anchor(-0.1, 0.3, 0)
};

/* serpent-coil — source: theater-boot.js buildSerpent() (7 tapering segments). `params.yawSeed`
   (an array of per-segment yaw offsets) replaces the original's inline seededJitter call — same
   "seeding moves up to the caller" discipline as blob-mass above. */
/* serpent-coil — source: theater-boot.js buildSerpent() (7 tapering segments). SPLIT ACROSS TWO
   CALLS to respect §1's <=6-box-per-part budget: params {totalSegs=7} fixes the taper/spacing math
   against the FULL body length (so each half still reads as one continuous tapering coil, not two
   independently-tapered stubs), while {startIdx=0, count=totalSegs} pick WHICH slice of that body
   this call draws — theater-boot.js's buildSerpent composes two serpent-coil calls (segments 0-3,
   4-6) to reproduce the original single 7-segment loop exactly. */
export function serpentCoil(params){
  params = params || {};
  const totalSegs = params.totalSegs || 7;
  const startIdx = params.startIdx || 0;
  const count = params.count != null ? params.count : totalSegs;
  const yawSeed = params.yawSeed || new Array(count).fill(0);
  const zSeed = params.zSeed || new Array(count).fill(0);
  const out = [];
  for(let k = 0; k < count; k++){
    const i = startIdx + k;
    const t = i / (totalSegs - 1);
    const w = 0.26 - t * 0.16;
    out.push(boxSpec(w, w, 0.28, 0, 0.13 + w / 2, -0.78 + i * 0.26 + (zSeed[k] || 0) * 0.02,
      { ry: (yawSeed[k] || 0) * 0.08, channel: "skin" }));
  }
  return out;
}
serpentCoil.anchors = {
  mainHand: anchor(0.15, 0.3, 0.9),   // near the head-end segment
  offHand: anchor(-0.15, 0.3, 0.9),
  back: anchor(0, 0.35, 0.3),
  head: anchor(0, 0.23, 0.9),
  shoulders: anchor(0, 0.3, 0.6),
  base: anchor(0, 0.06, -0.78),
  mount: anchor(0, 0.3, 0)
};

/* swarm-scatter — SHAPE-WAVE UNIT 3 + L17 THE SWARM LAW (Adam 2026-07-03: "a swarm is 8-14 SMALL
   INSTANCES of the member creature — mini-bats with real little wings, rat wedges with tails, insect
   specks with wing shimmer — in an IRREGULAR cluster... varied heights, varied orientations, never a
   uniform circle. Reference: Diablo 2's insect swarm"). The swarm is NO LONGER a ring of identical
   cubes (the §7b "campfire stones" prop-miss). It scatters MEMBERS — each a tiny multi-part creature
   whose shape follows the `member` kind (rat / winged / crawler / generic) — across an IRREGULAR
   cluster with DETERMINISTIC per-index jitter of position/height/yaw/size (never Math.random — a small
   integer-hash PRNG on the index, pure and reproducible, matching the determinism gate).
   params: {member="generic", n=10}. Returns ~2-4 specs per member (so n=10 rats ≈ 20-30 specs) — the
   swarm gets a raised spec budget in verify-model-parts (a swarm is definitionally many small things).
   Total tris stay in the swarm tier (30-60/member, <=800 total). The 8 anchors below are best-effort
   centroid points (a swarm has no single body). */
function swarmHash(i, salt){
  // deterministic integer hash -> [0,1). Pure (no Math.random); same (i,salt) => same value forever.
  let h = ((i + 1) * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0; h = Math.imul(h, 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function swarmMemberSpecs(member, cx, cy, cz, s, yaw){
  // one member creature at (cx,cy,cz), size s, facing yaw. Small + cheap; the READ is the type.
  const opt = { ry: yaw, channel: "skin" };
  if(member === "rat"){
    // a rat: a low tapered-wedge body + a thin tail trailing behind (-x local, before yaw).
    return [
      wedgeSpec(0.13 * s, 0.08 * s, 0.09 * s, cx, cy + 0.04 * s, cz, { dir: 1, ry: yaw, channel: "skin" }),   // body wedge (nose +x)
      boxSpec(0.09 * s, 0.02 * s, 0.02 * s, cx - Math.cos(yaw) * 0.1 * s, cy + 0.03 * s, cz - Math.sin(yaw) * 0.1 * s, { ry: yaw, channel: "skin" }) // tail
    ];
  }
  if(member === "winged"){
    // a bat/insect/bird speck: a tiny body + two little wing wedges (real little wings, L17).
    return [
      boxSpec(0.07 * s, 0.06 * s, 0.09 * s, cx, cy, cz, opt),                                                 // body speck
      wedgeSpec(0.11 * s, 0.02 * s, 0.07 * s, cx, cy + 0.03 * s, cz + 0.07 * s, { dir: 1, ry: yaw + 0.4, channel: "skin" }),  // wing R
      wedgeSpec(0.11 * s, 0.02 * s, 0.07 * s, cx, cy + 0.03 * s, cz - 0.07 * s, { dir: -1, ry: yaw - 0.4, channel: "skin" })  // wing L
    ];
  }
  if(member === "crawler"){
    // a crawling claw / small snake segment: a small blob body + a couple of stub legs/tendrils.
    return [
      blobLowSpec(0.11 * s, 0.08 * s, 0.11 * s, cx, cy + 0.03 * s, cz, opt),                                  // body blob
      boxSpec(0.02 * s, 0.06 * s, 0.02 * s, cx + 0.05 * s, cy, cz + 0.04 * s, { rz: 0.4, channel: "skin" }),  // stub
      boxSpec(0.02 * s, 0.06 * s, 0.02 * s, cx - 0.05 * s, cy, cz - 0.04 * s, { rz: -0.4, channel: "skin" })  // stub
    ];
  }
  // generic: a small faceted speck (a lozenge — rounder than a cube, still one primitive).
  return [ lozengeSpec(0.12 * s, 0.1 * s, 0.12 * s, cx, cy + 0.03 * s, cz, opt) ];
}
export function swarmScatter(params){
  params = params || {};
  const member = params.member || "generic";
  const n = Math.max(6, Math.min(14, params.n || 10));
  const out = [];
  for(let i = 0; i < n; i++){
    // an IRREGULAR cluster (never a uniform ring, per L17): a base ring angle jittered per-member,
    // a jittered radius (some near the center, some at the edge — a real clump), varied height (some
    // hop up), varied yaw + size. All deterministic via swarmHash(i, salt).
    const baseAng = (i / n) * Math.PI * 2;
    const ang = baseAng + (swarmHash(i, 1) - 0.5) * 1.4;                 // angle jitter (±0.7 rad) — breaks the ring
    const r = 0.06 + swarmHash(i, 2) * 0.34;                             // radius jitter (center..edge) — a clump, not a circle
    const cx = Math.cos(ang) * r, cz = Math.sin(ang) * r;
    const cy = 0.02 + swarmHash(i, 3) * (member === "winged" ? 0.34 : 0.08); // winged members hover higher/varied
    const s = 0.8 + swarmHash(i, 4) * 0.6;                               // size jitter (0.8..1.4x)
    const yaw = swarmHash(i, 5) * Math.PI * 2;                           // random facing
    swarmMemberSpecs(member, cx, cy, cz, s, yaw).forEach(function(sp){ out.push(sp); });
  }
  return out;
}
swarmScatter.anchors = {
  mainHand: anchor(0.28, 0.2, 0),
  offHand: anchor(-0.28, 0.2, 0),
  back: anchor(0, 0.24, -0.2),
  head: anchor(0, 0.3, 0.2),         // a swarm has no single head — best-effort centroid-top point
  shoulders: anchor(0, 0.2, 0),
  base: anchor(0, 0, 0),
  mount: anchor(0, 0.16, 0)
};

/* horror-mass — source: theater-boot.js buildAmorphousHorror()'s asymmetric core (the 3 overlapping
   off-axis boxes; the tentacle slabs live in the drip-tendrils FX part / a dedicated tentacle usage,
   kept separate from the core per §1's part-per-concern granularity). `params.jitter` supplies the
   6 offsets the original's seededJitter(seed, 0..6) calls used. */
export function horrorMass(params){
  params = params || {};
  const j = params.jitter || [0, 0, 0, 0, 0, 0, 0];
  return [
    boxSpec(0.4, 0.34, 0.36, 0, 0.36, 0, { ry: (j[0] || 0) * 0.3, channel: "skin" }),
    boxSpec(0.28, 0.4, 0.26, (j[1] || 0) * 0.14, 0.5, (j[2] || 0) * 0.1, { ry: (j[3] || 0) * 0.4, channel: "skin" }),
    boxSpec(0.22, 0.22, 0.24, (j[4] || 0) * 0.16, 0.68, (j[5] || 0) * 0.12, { ry: (j[6] || 0) * 0.5, channel: "skin" })
  ];
}
horrorMass.anchors = {
  mainHand: anchor(0.3, 0.5, 0),
  offHand: anchor(-0.3, 0.5, 0),
  back: anchor(0, 0.6, -0.2),
  head: anchor(0, 0.79, 0),          // best-effort — an aberration's "head" is just its topmost mass
  shoulders: anchor(0, 0.5, 0),
  base: anchor(0, 0, 0),
  mount: anchor(0, 0.4, 0)
};

/* ============================================================================
   LIMBS / LOCOMOTION (6) — attach at a body's shoulders/base/mount anchor. Each declares
   `.expectedAnchor` (informational). Geometry lifted from theater-boot.js's addTaperedLimb() call
   sites (buildBiped's arm/leg calls, buildQuadruped's 4 legs, buildFlyer's wings/tail, buildArachnid's
   legs, buildSerpent's tail read reused as a segmented tail).
   ============================================================================ */

/* arm-tapered — a 2-segment downward-stacking taper (shoulder->elbow->wrist), attached at a body's
   `shoulders` anchor and hanging DOWN from it.

   FRAME RETARGET (2026-07-03, Adam's round-1 sheet review, director diagnosis): the ROOT frame bug.
   These arm literals were ported verbatim from the OLD archetype-builder frame (buildBiped's
   addTaperedLimb yStart), where the shoulder line sat at y≈0.56. But the grammar torsoBiped's
   `shoulders` anchor is y=1.0 — the port never converted the frame, so arms were hanging from the
   HIP (top at 0.56, bottoms at 0.14, entirely below the pelvis box at y~0.62). That is why arms
   read as dangling from hip level and, downstream, why the G5-round-2 "hip-band retarget" chased the
   symptom by dragging mainHand/offHand DOWN to 0.56 to meet the misplaced forearms (weapons then
   stood beside the thighs). THE FIX (this unit): default yStart rises to 1.0 — the torsoBiped
   shoulder line — so an arm now hangs shoulder(1.0)->wrist(0.58) over its own 0.42 span (segLen 0.21
   x 2), reaching the hip band naturally, exactly like a real arm at the side. torso-biped-huge's own
   armParams factory still passes its bigger yStart (1.5-frame, see below) — a per-body shoulder line,
   the anchor-relative intent expressed as an explicit per-body param (the approach chosen here: an
   explicit shoulder-line yStart per body, so the two known bodies each hang their arms from their own
   real shoulder anchor; a future body just passes its own shoulders.y). dir is always -1 (stacks
   DOWNWARD from yStart) — every arm precedent uses that.
   params: {side=1, tiltZ=0.16, crouch=0, x=side*0.3, baseW=0.085, segLen=0.21, yStart=1.0-crouch}. */
export function armTapered(params){
  params = params || {};
  const side = params.side || 1;              // -1 = left (buildBiped's x=-0.3), 1 = right (x=0.3)
  const tiltZ = params.tiltZ != null ? params.tiltZ : 0.16; // buildBiped's own tiltZ, NOT side-negated
  const crouch = params.crouch || 0;
  const x = params.x != null ? params.x : side * 0.3;
  const baseW = params.baseW != null ? params.baseW : 0.085;
  const segLen = params.segLen != null ? params.segLen : 0.21;
  // FRAME RETARGET: shoulder line is y=1.0 (torsoBiped.anchors.shoulders.y), NOT the old 0.56 hip.
  const yStart = (params.yStart != null ? params.yStart : 1.0) - crouch;
  const taper = params.taper != null ? params.taper : 0.82;
  const w2 = baseW * taper;
  // THE FIST RULE (L14, 2026-07-03, Adam ruling 3): a slightly OVERSIZED fist block (goblin-reference
  // hands, ~1.3x the forearm width) at the FOREARM END. This is the volume "in the hand" means passing
  // THROUGH — the weapon's grip section intersects this box, never merely sits adjacent to a bare
  // anchor point (the position-only-proximity failure Adam rejected). A lozenge-ish box (a touch wider
  // than tall) is fine here; a real lozenge primitive arrives with L13's shape layer. The fist can be
  // suppressed (params.fist:false) for a no-fist limb read, but it's ON by default — every held-weapon
  // seat depends on it. fistW scales off the forearm's own tip width so a giant's bigger arm gets a
  // proportionally bigger fist automatically. */
  const wantFist = params.fist !== false;
  const fistScale = params.fistScale != null ? params.fistScale : 1.3;
  const wristY = yStart - segLen * 2;
  // SHAPE-WAVE UNIT 2 + L21: the arm is now a LOFT — one continuous skin from the shoulder down to the
  // wrist with an EXTRA loop at the elbow (topology density concentrates at joints, the reference's own
  // rule), tapering shoulder->wrist (hex cross-sections, never square). The fist stays a BLOCK mitt
  // (L21: "hands = flat mitts ~10 tris"). The loft is authored at x (the arm's own x) and the loop
  // radii ride off baseW so a giant's bigger-baseW arm gets a proportionally fatter arm automatically.
  // tiltZ leans the whole loft (the outward arm cant); it's applied as the spec rz so the elbow/wrist
  // stay in line. rz-lean about x=0 would swing the arm off its own x, so instead we author the loop
  // centers straight and let the caller's own x seat it (the pre-loft boxes did the same — tiltZ only
  // ever nudged, never re-based).
  const rElbow = w2, rShoulder = baseW * 1.05, rWrist = w2 * 0.82;
  const elbowY = yStart - segLen;
  // 3-loop loft (wrist -> elbow joint loop -> shoulder), 6-sided — the lean limb budget (~32 tris),
  // still with the joint loop L21 calls for at the elbow.
  const boxes = [
    loftSpec([
      { y: wristY, x: x, rx: rWrist, rz: rWrist, sides: 6 },                 // wrist
      { y: elbowY, x: x, rx: rElbow, rz: rElbow, sides: 6 },                 // elbow (the joint loop)
      { y: yStart, x: x, rx: rShoulder, rz: rShoulder, sides: 6 }            // shoulder
    ], { rz: tiltZ, channel: "skin" })
  ];
  if(wantFist){
    const fw = w2 * fistScale;
    // the fist — an oversized flat mitt block at the wrist (L14 grip volume + L21 "hands = mitts").
    boxes.push(boxSpec(fw, fw * 0.85, fw * 0.7, x, wristY, 0, { rz: tiltZ, channel: "skin" }));
  }
  return boxes;
}
armTapered.expectedAnchor = "shoulders";
// FRAME RETARGET: the wrist Y an arm's forearm bottoms out at, given a body's shoulder-line yStart —
// the single source both the anchor retarget (mainHand/offHand ready-grip height) and any harness
// that checks "is the weapon at the forearm" read from, so a body-frame change propagates to the grip
// without a second hand-typed literal drifting. yStart - segLen*2 (dir=-1, two segments).
armTapered.wristY = function(yStart, segLen){
  const ys = yStart != null ? yStart : 1.0;
  const sl = segLen != null ? segLen : 0.21;
  return ys - sl * 2;
};
/* THE FIST RULE (L14): the fist's world-local CENTER + half-extent for a given arm's params — the
   single source the weapon-carry code (theater-boot.js) and its harness read to seat a weapon's grip
   THROUGH the fist (geometric intersection). Mirrors the fist box authored above: centered at
   (x, wristY), a cube of side fistW = (baseW*taper)*fistScale. Returns {x,y,z,half} in the same
   part-local space every anchor uses, so a caller can place a weapon's grip section to overlap it. */
armTapered.fistBox = function(params){
  params = params || {};
  const side = params.side || 1;
  const crouch = params.crouch || 0;
  const x = params.x != null ? params.x : side * 0.3;
  const baseW = params.baseW != null ? params.baseW : 0.085;
  const segLen = params.segLen != null ? params.segLen : 0.21;
  const yStart = (params.yStart != null ? params.yStart : 1.0) - crouch;
  const taper = params.taper != null ? params.taper : 0.82;
  const fistScale = params.fistScale != null ? params.fistScale : 1.3;
  const fw = baseW * taper * fistScale;
  return { x: x, y: yStart - segLen * 2, z: 0, half: fw / 2 };
};

/* leg-tapered — source: buildQuadruped's 4-leg addTaperedLimb calls / buildGiant's 2-leg calls (2-
   segment taper each, dir=1 stacks upward from yStart — matches addTaperedLimb's own convention).
   FULLY PARAMETRIC (unlike arm-tapered/torso-biped's legs, which stay fixed-dimension since they're
   already baked into torso-biped for T1 visual-parity reasons) because its two real precedents use
   different dimensions: buildQuadruped's front pair is baseW=0.085/segLen=0.15 at x=-0.3, its rear
   (haunch) pair is baseW=0.095/segLen=0.19 at x=0.26 with a sharper tiltZ; buildGiant's pair is
   baseW=0.18/segLen=0.4 at x=-0.2/0.2. params: {baseW=0.085, segLen=0.15, x=-0.3, z=0, yStart=0.02,
   tiltZ=0, taper=0.82} — defaults reproduce buildQuadruped's own front-left leg exactly. */
export function legTapered(params){
  params = params || {};
  const baseW = params.baseW != null ? params.baseW : 0.085;
  const segLen = params.segLen != null ? params.segLen : 0.15;
  const x = params.x != null ? params.x : -0.3;
  const z = params.z || 0;
  const yStart = params.yStart != null ? params.yStart : 0.02;
  const tiltZ = params.tiltZ || 0;
  const tiltX = params.tiltX || 0;   // buildQuadruped's front-leg pair tilts on X (forward/back splay), not Z
  const taper = params.taper != null ? params.taper : 0.82;
  const w1 = baseW, w2 = baseW * taper;
  // SHAPE-WAVE UNIT 2 + L21/reference-#12: the leg is a LOFT — foot to hip with a KNEE/HOCK joint loop
  // (topology density at the joint). `hock` (reference #12 item 3) offsets the middle (knee) loop
  // BACKWARD on x so a rear quadruped leg has the animal's Z-bend hock; front legs pass hock:0 and stay
  // straight (four identical posts is the failure mode). foot = a small wedge at the bottom (L21 "feet =
  // wedges"). Loops stack UP from yStart (dir=1 convention). tiltZ/tiltX lean the whole loft.
  const hock = params.hock || 0;               // rear-leg hock bend magnitude (x-offset of the knee loop)
  const wantFoot = params.foot !== false;      // biped legs pass foot:false (feet don't read at cell scale)
  const hipY = yStart + segLen * 2, kneeY = yStart + segLen;
  const wKnee = baseW * 0.94;
  // 3-loop loft (ankle -> knee/hock joint loop -> hip), 6-sided — the lean limb budget (~32 tris),
  // still with the joint loop L21 calls for. `hock` bends the knee loop back on x (rear quad legs);
  // front legs pass hock:0 and stay straight (four identical posts is the failure mode).
  const boxes = [
    loftSpec([
      { y: yStart + 0.02, x: x, rx: w2 * 0.9, rz: w2 * 0.9, sides: 6 },              // ankle
      { y: kneeY, x: x + hock, rx: wKnee, rz: wKnee, sides: 6 },                      // knee/hock (the joint loop)
      { y: hipY, x: x, rx: w1 * 1.08, rz: w1 * 1.08, sides: 6 }                       // hip/thigh top
    ], { rz: tiltZ, rx: tiltX, channel: "skin" })
  ];
  // foot wedge (paw/hoof) — the quad's paws read on a beast; bipeds skip it (foot:false).
  if(wantFoot){
    boxes.push(wedgeSpec(w1 * 1.3, w2 * 0.9, w1 * 1.6, x + w1 * 0.6, yStart + 0.02, z, { dir: 1, rz: tiltZ, channel: "skin" }));
  }
  return boxes;
}
legTapered.expectedAnchor = "base";

/* leg-spider — SHAPE-WAVE UNIT 2 + reference #7 (the PSX spider): a spider leg ARCS — it rises from
   the body UP-and-OUT to a knee ABOVE the body line, then falls DOWN-and-OUT to the foot on the ground.
   That raised-knee splay is what reads "spider" at cell scale (the old single flat slab read as a
   plank sticking out sideways). Built as TWO tapered prism6 segments (femur rising, tibia falling) that
   meet at the knee joint — banding/tint comes from the skin material program (U4), not geometry. The
   knee height + splay vary per leg (idx) for a scuttling, non-uniform read. params: {side, idx, count,
   tiltSeed}. Returns 2 specs/leg (femur + tibia); the caller composes 8 (one per leg). */
export function legSpider(params){
  params = params || {};
  const side = params.side || 1;
  const idx = params.idx || 0;
  const count = params.count || 4;
  const seed = params.tiltSeed || 0;
  // U0 ADDENDUM (Adam's live review): the leg FAN must be LATERAL — the body's head->tail long axis is
  // X (thorax-abdomen: cephalothorax +x, abdomen -x), so legs splay left/RIGHT of it, i.e. out on the
  // ±Z axis (side controls Z), distributed FORE-AFT along X (idx spreads on x). The old version splayed
  // legs on ±x — the SAME axis as head-tail — which read as legs pointing forward/back, the "leg fan
  // 90° off" symptom. Now: side = ±z (lateral), the arc rises in the Z/Y plane (out on z, up to a knee
  // above the body, down to the foot); idx walks the attach point along the body length (x).
  const xAlong = (count > 1 ? (idx / (count - 1) - 0.5) : 0) * 0.42; // fore-aft attach position (along body X)
  const kneeZ = side * 0.34, kneeY = 0.42 + (idx % 2) * 0.04 + seed * 0.03;  // knee ABOVE the body (raised arch)
  const bodyZ = side * 0.12, bodyY = 0.24;         // where the leg meets the body side
  const footZ = side * 0.52, footY = 0.0;          // the foot on the ground, splayed wide laterally
  // femur: body-side -> knee (out on z + up). Authored along +y (height=fLen), rotated on X (rx) so it
  // lies in the Z/Y plane along the body->knee direction. rx = -(angle from +y toward +z).
  const fdz = kneeZ - bodyZ, fdy = kneeY - bodyY;
  const fLen = Math.sqrt(fdz * fdz + fdy * fdy), fAng = Math.atan2(fdz, fdy);
  // tibia: knee -> foot (out on z + down).
  const tdz = footZ - kneeZ, tdy = footY - kneeY;
  const tLen = Math.sqrt(tdz * tdz + tdy * tdy), tAng = Math.atan2(tdz, tdy);
  return [
    // femur — prism6 along +y, tilted on X toward +z by fAng so it arcs out laterally and up. The femur
    // (thigh, top of the arch) reads rounded; the tibia stays a cheap thin box (a spindly lower leg).
    prismSpec(0.05, fLen, 0.05, xAlong, (bodyY + kneeY) / 2, (bodyZ + kneeZ) / 2, 6,
      { topScale: 0.8, rx: fAng, channel: "skin" }),
    // tibia — a thin box, knee->foot.
    boxSpec(0.035, tLen, 0.035, xAlong, (kneeY + footY) / 2, (kneeZ + footZ) / 2,
      { rx: tAng, channel: "skin" })
  ];
}
legSpider.expectedAnchor = "base";

/* wing-slab — source: buildFlyer()'s 2-part swept wing (root+tip, each angled more than the last).
   params: {side=-1|1, yBase=0.8} mirrors left/right. Returns root+tip as one pair.

   FRAME RETARGET (2026-07-03, director diagnosis): wing-slab's boxes were authored at an ABSOLUTE
   y≈0.8 (correct for buildFlyer's own slim body core, which has no anchor system). But the recipe
   path (gen-model-recipes.py's fly rule) attached the wings at the `shoulders` anchor (y=1.0), which
   ADDS to the box's own 0.8 -> wings floated at y~1.8, above the head (y=1.22) — the "wings attach
   far above the shoulder line" symptom, same un-converted-frame class as the arms. THE FIX: `yBase`
   is now a param (default 0.8 keeps buildFlyer byte-identical), and the recipe path attaches wings at
   the `back` anchor (shoulder-blade height, y=0.85) with yBase:0, so a wing sits AT its attach point
   (0.85 + 0) = shoulder-blade, never stacked a body-height above it. `.expectedAnchor` updated to
   `back` to match the recipe wiring (informational; the generator is the authority). */
/* wing-slab — SHAPE-WAVE UNIT 2 + L22 THE WING LAW (the worst blind-round reader): a wing is an
   ARM SPAR sweeping up-and-out from the shoulder + radiating FINGER SPARS + MEMBRANE PANELS fanned
   BETWEEN the fingers, with a scalloped trailing edge — a RAISED silhouette (a sail, not a flat
   horizontal plank; the plank read was the wing lying flat on the body's z-plane). Built so the whole
   wing rises in the X/Y plane (out on +x*side, up on +y) and the membrane panels are thin near-vertical
   webs between the finger spars. `yBase` offsets the whole wing (default 0 for the recipe `back`-anchor
   wiring; buildFlyer passes its own). `span`/`rise` scale the wing. ~6 specs/side, ~50 tris/side —
   inside budget. The membranes use `wedge` (a scalloped, tapering web read), the spars thin boxes. */
export function wingSlab(params){
  params = params || {};
  const side = params.side || -1;
  const yBase = params.yBase != null ? params.yBase : 0;
  const span = params.span != null ? params.span : 1;
  const rise = params.rise != null ? params.rise : 1;
  const sx = side; // +x*side is outboard
  // the arm spar: a thin box sweeping from the shoulder (near origin) up-and-out to the wrist joint.
  // Authored along +x, rotated up (rz) so the far end rises — the raised leading edge. The peak is
  // kept modest (top ~0.32 above the attach point) so a biped-with-wings' wing never reaches above the
  // head anchor (the frame-retarget invariant verify-model-parts checks), while still reading RAISED.
  const out = [
    boxSpec(0.34 * span, 0.05, 0.05, sx * 0.2 * span, yBase + 0.14 * rise, -0.02, { rz: sx * -0.55, ry: sx * 0.25, channel: "skin" }) // arm spar (leading edge, rising)
  ];
  // finger spars: 2 thin ribs radiating from the wrist end DOWN-and-out, fanning the wing (2 keeps the
  // whole part at the ≤6-spec module budget: 1 arm spar + 2 fingers + 2 membranes = 5).
  const wristX = sx * 0.4 * span, wristY = yBase + 0.32 * rise;
  const fingers = [
    { ex: sx * 0.64 * span, ey: yBase + 0.14 * rise },   // upper finger (out, slightly down from wrist)
    { ex: sx * 0.52 * span, ey: yBase - 0.14 * rise }    // lower finger (down-out — the wing's bottom point)
  ];
  fingers.forEach(function(f){
    const mx = (wristX + f.ex) / 2, my = (wristY + f.ey) / 2;
    const dx = f.ex - wristX, dy = f.ey - wristY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx);
    out.push(boxSpec(len, 0.035, 0.035, mx, my, -0.03, { rz: ang, channel: "skin" })); // finger spar
  });
  // membrane panels: near-vertical webs BETWEEN consecutive fingers (and between the arm spar and the
  // first finger) — thin wedges giving the scalloped bat-wing sail. Each spans the gap, tapering to the
  // trailing edge. channel:"skin" (the membrane tints with the body; a recipe may route accent). The
  // top web point is kept at ~+0.24 rise so the wing's highest bbox point stays below the head anchor
  // (the frame-retarget invariant: a biped's wings never tower over its head).
  const webPts = [{ x: sx * 0.32 * span, y: yBase + 0.24 * rise }].concat(fingers.map(function(f){ return { x: f.ex, y: f.ey }; }));
  for(let i = 0; i < webPts.length - 1; i++){
    const a = webPts[i], b = webPts[i + 1];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const w = Math.abs(b.x - a.x) + 0.14, h = Math.abs(b.y - a.y) + 0.14;
    out.push(wedgeSpec(Math.max(0.1, w), Math.max(0.1, h), 0.03, mx, my, -0.05, { dir: sx, rz: sx * -0.2, channel: "skin" })); // membrane web
  }
  return out;
}
wingSlab.expectedAnchor = "back";

/* tail-segments — source: buildSerpent()'s tapering-segment loop, reused as a general segmented
   tail. params: {segCount=5, baseW=0.2, taper=0.85, x=0, yBase=0.13, zStart=-0.2, zStep=-0.22,
   rz=0} — the x/yBase/zStart/zStep/rz overrides let a single-segment call (segCount=1) reproduce a
   small forked-tail HALF exactly (buildFlyer's own 2-box tail fork: one tail-segments(segCount:1,
   x:∓0.05, yBase:0.38, zStart:-0.28, rz:±0.18) call per side), while the multi-segment default
   still reproduces buildSerpent's own tapering-tail read. */
export function tailSegments(params){
  params = params || {};
  const segCount = params.segCount || 5;
  const baseW = params.baseW || 0.2;
  const taper = params.taper != null ? params.taper : 0.85;
  const x = params.x || 0;
  const yBase = params.yBase != null ? params.yBase : 0.13;
  const zStart = params.zStart != null ? params.zStart : -0.2;
  const zStep = params.zStep != null ? params.zStep : -0.22;
  const rz = params.rz || 0;
  const out = [];
  let w = baseW;
  for(let i = 0; i < segCount; i++){
    out.push(boxSpec(w, w, 0.24, x, yBase + w / 2, zStart + i * zStep, { rz: rz, channel: "skin" }));
    w *= taper;
  }
  return out;
}
tailSegments.expectedAnchor = "base";

/* fin-ridge — no direct existing precedent (theater-boot.js has no swim-only archetype yet, per
   MODEL-GRAMMAR §1's "where a listed part has no existing precedent, compose it in the established
   style"). A thin dorsal ridge of 3 shrinking slabs, matching wing-slab's thin-slab silhouette-first
   read but mounted along the spine (back anchor) instead of the shoulders. */
export function finRidge(params){
  params = params || {};
  return [
    boxSpec(0.05, 0.16, 0.1, 0, 0.1, 0, { channel: "skin" }),
    boxSpec(0.04, 0.12, 0.08, 0, 0.08, -0.14, { channel: "skin" }),
    boxSpec(0.03, 0.08, 0.06, 0, 0.06, -0.24, { channel: "skin" })
  ];
}
finRidge.expectedAnchor = "back";

/* ============================================================================
   HEADS (5) — attach at a body's `head` anchor. head-round/head-snout have direct precedent
   (buildBiped/buildQuadruped's head boxes); head-horned/head-skull/head-eyeless have no existing
   builder precedent (theater-boot.js tints skeleton/horned reads via color only today) — composed
   fresh in-style per §1.
   ============================================================================ */

export function headRound(params){
  return [ boxSpec(0.22, 0.16, 0.18, 0, 0, 0, { channel: "skin" }) ]; // source: buildBiped's head box
}
headRound.expectedAnchor = "head";

/* head-snout — source: buildQuadruped's head+snout pair. UNIT 2 (L6 "wedges over boxes"): the snout
   now reads as a TAPERED WEDGE (the wolf-muzzle reference), not a stub — a longer, narrower, slightly
   nose-down snout box in front of the cranium so the profile is a wedge, not two stacked cubes. This
   taper is deliberately MINIMAL — plain narrower-box-proportions + a small down-cant, no bespoke taper
   math (the L13 shape-primitive layer next wave generalizes real tapers; this just needs the wedge
   silhouette to read now). A third small box tips the muzzle (the nose), completing the wedge point. */
export function headSnout(params){
  return [
    boxSpec(0.2, 0.19, 0.2, 0, 0, 0, { channel: "skin" }),                          // cranium
    boxSpec(0.16, 0.12, 0.13, 0.13, 0.0, 0, { rz: -0.12, channel: "skin" }),        // muzzle — longer/narrower wedge, nose-down
    boxSpec(0.08, 0.07, 0.09, 0.23, -0.02, 0, { rz: -0.12, channel: "skin" })       // nose tip — narrows the wedge to a point
  ];
}
headSnout.expectedAnchor = "head";

/* head-horned — no existing precedent; a round head base + 2 short angled horn slabs, in-style with
   wing-slab/leg-spider's thin-angled-slab silhouette vocabulary. */
export function headHorned(params){
  return [
    boxSpec(0.22, 0.16, 0.18, 0, 0, 0, { channel: "skin" }),
    boxSpec(0.03, 0.14, 0.03, -0.08, 0.14, 0, { rz: -0.3, channel: "accent" }),
    boxSpec(0.03, 0.14, 0.03, 0.08, 0.14, 0, { rz: 0.3, channel: "accent" })
  ];
}
headHorned.expectedAnchor = "head";

/* head-skull — no existing precedent; a narrower/flatter head box (the "gaunt" read) + a small jaw
   underslab, in-style with the biped head's proportions. */
export function headSkull(params){
  return [
    boxSpec(0.19, 0.17, 0.16, 0, 0, 0, { channel: "skin" }),
    boxSpec(0.13, 0.06, 0.14, 0, -0.1, 0.02, { channel: "skin" })
  ];
}
headSkull.expectedAnchor = "head";

/* head-eyeless — no existing precedent; a smooth ovoid read (single unbroken box, deliberately
   featureless — "eyeless" reads through the ABSENCE of any secondary box, same logic buildOoze uses
   for blob-mass's limbless read). */
export function headEyeless(params){
  return [ boxSpec(0.2, 0.2, 0.2, 0, 0, 0, { channel: "skin" }) ];
}
headEyeless.expectedAnchor = "head";

/* maw-open — FIGURE-FIDELITY ROUND-2 UNIT 2 (REFERENCE-DIRECTION L4 "one signature feature per
   creature" / L6 "wedges over boxes"). The PSX-wolf jaw rule: an OPEN wedge jaw with geometric teeth
   IS "predator" — the §7b judge should be able to name a beast from this feature alone at ~100px. An
   upper jaw wedge (front edge low, hinged back — a snout-forward box canted so its front sits below
   its back) + a lower jaw wedge canted the opposite way, leaving a visible GAP between them (the open
   maw), with 3-4 teeth prisms bridging the gap (small boxes on the upper jaw pointing DOWN + the
   lower jaw pointing UP — an interlocking fang read). 6 boxes: upper jaw, lower jaw, 4 teeth — at the
   §1 budget. Attaches at `head` (it replaces/fronts a head — a beast recipe pairs it with head-snout
   or uses it as the head itself). params: {scale=1, open=1} — `open` (0..1) widens the jaw gap
   (1=full gape, the default predator read; a smaller value = a closed-mouth snarl). The wedge read
   here is deliberately SIMPLE box-proportions-plus-rotation (no bespoke taper math) — the primitive-
   vocabulary layer (L13, next wave: taperedBox/wedge/prism) will generalize the actual taper; this
   part just needs the open-jaw SILHOUETTE to read now, off plain boxes. channel: "skin" for the jaws,
   "accent" for teeth (bone-white against the maw when a recipe routes accent that way). */
export function mawOpen(params){
  params = params || {};
  const s = params.scale != null ? params.scale : 1;
  const open = params.open != null ? params.open : 1;
  const gap = 0.06 * open;                         // half the jaw-gap; scales the open gape
  // SHAPE-WAVE UNIT 2 (L4 "one signature feature per creature", the wolf-jaw rule; L6 "wedges over
  // boxes"): the jaws are now real WEDGES (a tapering snout that narrows to the muzzle tip — the
  // predator profile a box can't give), and the teeth are coneLow FANGS (pointed, interlocking) rather
  // than square nubs. Upper jaw wedge: tall at the back (hinge), narrowing to the nose, sitting above
  // the gap; lower jaw wedge canted the opposite way below the gap — the open gape between them IS the
  // read. Both push forward on +x (the snout direction). ~6 primitives, at the §1 budget.
  const boxes = [
    // upper jaw: a wedge, high edge at the back (hinge), tapering down toward the +x nose.
    wedgeSpec(0.28 * s, 0.11 * s, 0.19 * s, 0.08 * s, gap + 0.06 * s, 0, { dir: -1, rz: -0.12, channel: "skin" }),
    // lower jaw: a shorter wedge, canted nose-up, below the gap.
    wedgeSpec(0.24 * s, 0.08 * s, 0.18 * s, 0.06 * s, -gap - 0.05 * s, 0, { dir: -1, rz: 0.14, channel: "skin" })
  ];
  // fangs: 4 coneLow points — 2 upper (pointing DOWN into the gap), 2 lower (pointing UP), offset along
  // the jaw so they interlock — the full predator bite (the tiered budget affords the extra fangs).
  // accent channel = bone-white fang read.
  const fw = 0.045 * s, fh = 0.1 * s;
  boxes.push(coneLowSpec(fw, fh, fw, 0.04 * s, gap - 0.01 * s, 0.05 * s, { dir: -1, channel: "accent" }));  // upper fang L
  boxes.push(coneLowSpec(fw, fh, fw, 0.14 * s, gap - 0.01 * s, -0.05 * s, { dir: -1, channel: "accent" })); // upper fang R
  boxes.push(coneLowSpec(fw, fh, fw, 0.06 * s, -gap + 0.01 * s, -0.02 * s, { dir: 1, channel: "accent" }));  // lower fang L
  boxes.push(coneLowSpec(fw, fh, fw, 0.16 * s, -gap + 0.01 * s, 0.04 * s, { dir: 1, channel: "accent" }));   // lower fang R
  return boxes;
}
mawOpen.expectedAnchor = "head";

/* ============================================================================
   WEAPONS (8) — attach at `mainHand` (or `offHand` for a shield). sword-slab/axe-wedge/spear-pole/
   bow-arcs/staff-tipped/dagger-slabs have direct precedent (theater-boot.js weaponMeshFor's sword/
   axe/spear/bow/staff/dagger keys, ported verbatim). shield-slab/club-mass are NEW — shield-slab
   ports weaponMeshFor's inline cleric off-hand shield box (buildBiped) as a standalone part; club-mass
   is composed fresh (a blunt, heavier mace-adjacent read) in-style with weaponMeshFor's existing
   mace key.
   ============================================================================ */

export function swordSlab(params){
  return [ boxSpec(0.045, 0.5, 0.045, 0, 0, 0, { rz: -0.3, channel: "weapon" }) ]; // source: weaponMeshFor "sword"
}
swordSlab.expectedAnchor = "mainHand";

export function axeWedge(params){
  // source: weaponMeshFor "axe" (haft + wedge head)
  return [
    boxSpec(0.04, 0.42, 0.04, 0, 0, 0, { rz: -0.2, channel: "weapon" }),
    boxSpec(0.16, 0.14, 0.05, 0.07, 0.16, 0, { rz: -0.2, channel: "weapon" })
  ];
}
axeWedge.expectedAnchor = "mainHand";

export function spearPole(params){
  // source: weaponMeshFor "spear" (long haft + spearhead)
  return [
    boxSpec(0.035, 0.7, 0.035, 0, 0.1, 0, { rz: -0.15, channel: "weapon" }),
    boxSpec(0.05, 0.14, 0.05, 0.02, 0.46, 0, { rz: -0.15, channel: "weapon" })
  ];
}
spearPole.expectedAnchor = "mainHand";

export function bowArcs(params){
  // source: weaponMeshFor "bow" (two angled limbs forming a shallow V — "a real curve isn't worth a
  // new geometry type... the angled-pair reads as a bow in silhouette", per that file's own comment)
  return [
    boxSpec(0.03, 0.3, 0.03, -0.03, 0.1, 0, { rz: 0.5, channel: "weapon" }),
    boxSpec(0.03, 0.3, 0.03, -0.03, -0.1, 0, { rz: -0.5, channel: "weapon" })
  ];
}
bowArcs.expectedAnchor = "mainHand";

export function staffTipped(params){
  // source: weaponMeshFor "staff" (tall pole + tip cube)
  return [
    boxSpec(0.035, 0.7, 0.035, -0.05, 0.15, 0, { channel: "weapon" }),
    boxSpec(0.08, 0.08, 0.08, -0.05, 0.52, 0, { channel: "accent" })
  ];
}
staffTipped.expectedAnchor = "mainHand";

/* shield-slab — source: buildBiped()'s inline cleric off-hand shield box, lifted out as its own
   named part (weaponMeshFor never had a "shield" key — the cleric silhouette composed it inline). */
export function shieldSlab(params){
  return [ boxSpec(0.05, 0.3, 0.22, 0, 0, 0.02, { ry: 0.15, channel: "armor" }) ]; // source rotY, not rotZ
}
shieldSlab.expectedAnchor = "offHand";

export function daggerSlabs(params){
  // source: weaponMeshFor "dagger" (short blade) — pluralized per §1's list name; a second offset
  // blade is included so an off-hand dual-dagger recipe reads distinctly from a single main-hand one.
  return [
    boxSpec(0.035, 0.22, 0.035, 0, 0, 0, { rz: -0.35, channel: "weapon" }),
    boxSpec(0.03, 0.18, 0.03, 0.05, -0.03, 0, { rz: -0.35, channel: "weapon" })
  ];
}
daggerSlabs.expectedAnchor = "mainHand";

/* club-mass — no existing "club" key (weaponMeshFor's closest precedent is "mace": haft + head);
   composed fresh in the same haft+head vocabulary but bulkier/blunter (a plain thick cylinder-read
   box head instead of mace's smaller cube) — the blunt-instrument silhouette one step past mace. */
export function clubMass(params){
  return [
    boxSpec(0.045, 0.3, 0.045, 0, 0, 0, { rz: -0.25, channel: "weapon" }),
    boxSpec(0.15, 0.18, 0.15, 0.06, 0.2, 0, { rz: -0.25, channel: "weapon" })
  ];
}
clubMass.expectedAnchor = "mainHand";

/* ============================================================================
   ARMOR (4) — pauldrons/chest-plate/helm-crest attach at shoulders/mount/head; robe-skirt REPLACES
   a body's lower-leg region (attaches at `base`, matching buildBiped's caster-silhouette branch,
   which is this part's direct precedent). pauldrons/chest-plate/helm-crest have no existing
   builder precedent (theater-boot.js currently reads AC bands as a channel/color choice only) —
   composed fresh in-style, thin plate-slabs matching shield-slab's flat-box armor read.
   ============================================================================ */

export function pauldrons(params){
  return [
    boxSpec(0.14, 0.08, 0.16, -0.28, 0, 0, { channel: "armor" }),
    boxSpec(0.14, 0.08, 0.16, 0.28, 0, 0, { channel: "armor" })
  ];
}
pauldrons.expectedAnchor = "shoulders";

export function chestPlate(params){
  return [ boxSpec(0.3, 0.36, 0.05, 0, 0, 0.1, { channel: "armor" }) ];
}
chestPlate.expectedAnchor = "mount";

export function helmCrest(params){
  return [
    boxSpec(0.24, 0.18, 0.2, 0, 0, 0, { channel: "armor" }),   // helm shell, slightly larger than a bare head
    boxSpec(0.03, 0.14, 0.05, 0, 0.15, -0.02, { channel: "accent" }) // crest fin
  ];
}
helmCrest.expectedAnchor = "head";

/* robe-skirt — SHAPE-WAVE UNIT 2 + L23 THE ROBE LAW: the robe IS the body. One flowing LOFT from the
   shoulders to the GROUND (a bell that flares from a narrow shoulder loop to a wide skirt hem), NO legs
   modeled — the robe's hem hides the feet the way a real robe does. This is the caster/cultist/spectre
   silhouette (transformative for the wizard PC, and a strong ghost read for a translucent specter).
   Attaches at `base` (0,0,0). The consumer (buildBiped's caster branch / a recipe's robe-skirt module)
   drops the leg parts — the robe replaces them. ~6-sided loops keep it lean (~44 tris). A DARK-VOID
   hood is a SEPARATE concern (the head part / a recipe hood module); this part is the gown itself. */
export function robeSkirt(params){
  params = params || {};
  const crouch = params.crouch || 0;
  const c = crouch;
  return [
    loftSpec([
      { y: 0.0, rx: 0.34, rz: 0.26, sides: 6 },        // hem (widest, on the ground)
      { y: 0.22 - c, rx: 0.3, rz: 0.23, sides: 6 },    // lower skirt
      { y: 0.46 - c, rx: 0.22, rz: 0.18, sides: 6 },   // knee-line
      { y: 0.7 - c, rx: 0.16, rz: 0.14, sides: 6 },    // waist
      { y: 0.9 - c, rx: 0.15, rz: 0.13, sides: 6 }     // chest/shoulders (into the torso above)
    ], { channel: "armor" })
  ];
}
robeSkirt.expectedAnchor = "base";

/* ============================================================================
   FX ATTACHMENTS (4) — static geometry only (motion stays T3's per §1's own note: "motion stays
   T3's"). ember-flecks has no existing builder precedent but a clear naming pin from the crit/FX
   vocabulary in theater-verbs.js's fx:fire handling; drip-tendrils similarly pins to that file's
   necrotic/shadow-wraith fx read; bone-protrusions/glow-halo are fresh compositions in-style.
   ============================================================================ */

export function emberFlecks(params){
  return [
    boxSpec(0.03, 0.03, 0.03, 0.08, 0.1, 0.06, { channel: "glow" }),
    boxSpec(0.025, 0.025, 0.025, -0.06, 0.2, -0.04, { channel: "glow" }),
    boxSpec(0.02, 0.02, 0.02, 0.02, 0.32, 0.08, { channel: "glow" })
  ];
}
emberFlecks.expectedAnchor = "mount";

export function glowHalo(params){
  return [
    boxSpec(0.3, 0.02, 0.3, 0, 0, 0, { channel: "glow" })
  ];
}
glowHalo.expectedAnchor = "head";

/* drip-tendrils — thin angled boxes radiating outward from a center point; a standalone FX
   attachment (a "shadow/wraith" reskin hook per MODEL-GRAMMAR §4 rule 5) AND the direct source for
   buildAmorphousHorror's own 5-tentacle core (theater-boot.js's buildAmorphousHorror composes this
   part with count=5 to reproduce its original inline tentacle loop exactly — same radiating-slab
   vocabulary, just a different count/radius/length/base-y). params: {count=3, radius=0.14,
   yBase=-0.11, angleSeed=[] (per-tentacle extra yaw, unit-normalized), lenSeed=[] (per-tentacle
   extra length, unit-normalized), tiltSeed=[]/rollSeed=[] (per-tentacle rx/rz jitter)}. Defaults
   reproduce the FX-attachment's original fixed 3-tendril read. */
export function dripTendrils(params){
  params = params || {};
  const n = params.count || 3;
  const radius = params.radius != null ? params.radius : 0.14;
  const yBase = params.yBase != null ? params.yBase : -0.11;
  const baseLen = params.baseLen != null ? params.baseLen : 0.22;
  const thickness = params.thickness != null ? params.thickness : 0.03;
  const angleSeed = params.angleSeed || [];
  const lenSeed = params.lenSeed || [];
  const tiltSeed = params.tiltSeed || [];
  const rollSeed = params.rollSeed || [];
  const out = [];
  for(let i = 0; i < n; i++){
    const ang = (i / n) * Math.PI * 2 + (angleSeed[i] || 0);
    const x = Math.cos(ang) * radius, z = Math.sin(ang) * radius;
    const len = baseLen + Math.abs(lenSeed[i] || 0);
    // angleAxis picks which local axis carries the radiating angle: "x" (this part's own default FX
    // read) or "y" (buildAmorphousHorror's precedent — its original inline loop set rotY=ang, not
    // rotX, since addBox's positional order is (...,rotY,rotX,rotZ) and the source call passed `ang`
    // in the rotY slot).
    const angleAxis = params.angleAxis || "x";
    out.push(boxSpec(thickness, len, thickness, x, yBase + len / 2, z,
      Object.assign({ channel: "glow" },
        angleAxis === "y" ? { ry: ang, rx: tiltSeed[i] || 0 } : { rx: ang, ry: tiltSeed[i] || 0 },
        { rz: rollSeed[i] || 0 })));
  }
  return out;
}
dripTendrils.expectedAnchor = "base";

export function boneProtrusions(params){
  return [
    boxSpec(0.03, 0.16, 0.03, -0.1, 0.05, -0.05, { rz: -0.4, channel: "accent" }),
    boxSpec(0.03, 0.16, 0.03, 0.1, 0.05, -0.05, { rz: 0.4, channel: "accent" })
  ];
}
boneProtrusions.expectedAnchor = "shoulders";

/* ============================================================================
   PROPS (7) — terrain nouns, no anchor set (props are not bodies; they mount directly at a world/
   prop-slot position the caller supplies, matching theater-boot.js's existing flat 0.5x0.9x0.5
   prop-box baseline in setBoard). No existing per-kind precedent (theater-boot.js's current prop
   geometry is one undifferentiated box for every cover kind) — composed fresh, in-style, each kept
   at or under the 6-box budget and silhouette-first per Adam's weapon-shape rule extended to props.
   ============================================================================ */

export function crate(params){
  return [ boxSpec(0.5, 0.5, 0.5, 0, 0.25, 0, { channel: "accent" }) ];
}

export function cart(params){
  return [
    boxSpec(0.6, 0.3, 0.9, 0, 0.35, 0, { channel: "accent" }),
    boxSpec(0.08, 0.3, 0.08, -0.25, 0.15, 0.4, { channel: "accent" }),
    boxSpec(0.08, 0.3, 0.08, 0.25, 0.15, 0.4, { channel: "accent" }),
    boxSpec(0.08, 0.3, 0.08, -0.25, 0.15, -0.4, { channel: "accent" }),
    boxSpec(0.08, 0.3, 0.08, 0.25, 0.15, -0.4, { channel: "accent" })
  ];
}

export function pillarBroken(params){
  return [
    boxSpec(0.4, 0.9, 0.4, 0, 0.45, 0, { channel: "accent" }),
    boxSpec(0.5, 0.15, 0.5, 0.08, 0.98, -0.04, { rz: 0.3, channel: "accent" }) // broken/canted cap
  ];
}

export function shrineBlock(params){
  return [
    boxSpec(0.6, 0.2, 0.6, 0, 0.1, 0, { channel: "accent" }),
    boxSpec(0.36, 0.5, 0.36, 0, 0.45, 0, { channel: "accent" }),
    boxSpec(0.44, 0.1, 0.44, 0, 0.75, 0, { channel: "glow" })
  ];
}

export function treeBare(params){
  return [
    boxSpec(0.16, 0.9, 0.16, 0, 0.45, 0, { channel: "skin" }),
    boxSpec(0.06, 0.4, 0.06, -0.1, 0.95, 0, { rz: 0.6, channel: "skin" }),
    boxSpec(0.06, 0.35, 0.06, 0.1, 0.92, 0.05, { rz: -0.5, channel: "skin" }),
    boxSpec(0.05, 0.3, 0.05, 0, 0.98, -0.08, { rz: 0.15, channel: "skin" })
  ];
}

export function rubbleScatter(params){
  params = params || {};
  const offsets = params.offsets || [0, 0, 0, 0];
  return [0, 1, 2, 3].map(function(i){
    const o = offsets[i] || 0;
    const s = 0.12 + Math.abs(o) * 0.08;
    const ang = (i / 4) * Math.PI * 2;
    return boxSpec(s, s * 0.7, s, Math.cos(ang) * 0.18, s * 0.35, Math.sin(ang) * 0.18,
      { ry: o, channel: "accent" });
  });
}

export function bannerPole(params){
  return [
    boxSpec(0.04, 1.1, 0.04, 0, 0.55, 0, { channel: "accent" }),
    boxSpec(0.24, 0.36, 0.02, 0.13, 0.85, 0, { channel: "accent" })
  ];
}

/* ============================================================================
   PROPS, PART II (17) — MODEL-GRAMMAR G4 (dev/model-coverage-report.md class-(c), the 17-part list
   the walk-table audit named). Same conventions as the 7 above: no anchor set (props mount at a
   world/prop-slot position the caller supplies), ≤6 boxes, silhouette-first, deterministic (any
   per-instance variance comes from caller-seeded `params`, never Math.random in-part). Three of the
   audit's 17 (`furnace-block`/#13, `tent-canopy`/#15, `throne-seat`/#17) were flagged there as
   "borderline — could be a param on an existing/other-new part"; built here as their OWN small
   functions anyway (the audit's ceiling, not floor) but composed as CHEAP variants reusing this
   file's own established box vocabulary (table-slab's leg-block, wing-slab's angled-panel read,
   pillar-broken's cap-slab) rather than inventing new geometry primitives — so even the "maybe
   redundant" three stay honest about their cost.
   ============================================================================ */

/* statue-figure — audit #1, highest-value new part ("statues appear in all three biomes").
   base slab + torso block(s) + head nub + optional arm-stub, per the audit's own box sketch.
   params: {pose:"standing"|"kneeling"|"broken"} (kneeling lowers+shortens the torso block; broken
   drops the head nub and cants the torso, an "already-toppled" read), {scale=1}, {channel="accent"}
   (stone/bronze/ice are just different channel VALUES the caller's palette resolves, per §5 —
   this part never picks a literal material). */
export function statueFigure(params){
  params = params || {};
  const pose = params.pose || "standing";
  const scale = params.scale != null ? params.scale : 1;
  const ch = params.channel || "accent";
  const broken = pose === "broken";
  const kneeling = pose === "kneeling";
  const torsoH = (kneeling ? 0.42 : 0.62) * scale;
  const torsoY = 0.12 * scale + torsoH / 2;
  const boxes = [
    boxSpec(0.5 * scale, 0.12 * scale, 0.5 * scale, 0, 0.06 * scale, 0, { channel: ch }),         // base slab
    boxSpec(0.32 * scale, torsoH, 0.26 * scale, broken ? 0.06 * scale : 0, torsoY, 0,
      { rz: broken ? 0.35 : 0, channel: ch })                                                       // torso block
  ];
  if(!broken){
    boxes.push(boxSpec(0.2 * scale, 0.2 * scale, 0.2 * scale, 0, 0.12 * scale + torsoH + 0.1 * scale, 0,
      { channel: ch }));                                                                            // head nub
    boxes.push(boxSpec(0.08 * scale, 0.24 * scale, 0.08 * scale, 0.2 * scale, torsoY, 0,
      { rz: -0.2, channel: ch }));                                                                  // arm-stub
  }
  return boxes;
}

/* table-slab — audit #4. flat top + leg stubs (or one pedestal leg). params: {legs=4, w=0.5,
   d=0.34, h=0.32} covers workbench/trestle-table/counter/anvil-block/grindstone reads; {legs=1}
   collapses to a single pedestal-leg variant (also reused as throne-seat's seat below). */
export function tableSlab(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.5;
  const d = params.d != null ? params.d : 0.34;
  const h = params.h != null ? params.h : 0.32;
  const legs = params.legs != null ? params.legs : 4;
  const ch = params.channel || "accent";
  const top = boxSpec(w, 0.05, d, 0, h, 0, { channel: ch });
  if(legs <= 1){
    return [top, boxSpec(0.1, h - 0.05, 0.1, 0, (h - 0.05) / 2, 0, { channel: ch })];
  }
  const lx = w / 2 - 0.05, lz = d / 2 - 0.05;
  return [
    top,
    boxSpec(0.05, h - 0.05, 0.05, -lx, (h - 0.05) / 2, -lz, { channel: ch }),
    boxSpec(0.05, h - 0.05, 0.05, lx, (h - 0.05) / 2, -lz, { channel: ch }),
    boxSpec(0.05, h - 0.05, 0.05, -lx, (h - 0.05) / 2, lz, { channel: ch }),
    boxSpec(0.05, h - 0.05, 0.05, lx, (h - 0.05) / 2, lz, { channel: ch })
  ];
}

/* chain-drape — audit #5. a vertical/catenary chain run between two anchor heights, 2-4 short
   linked (tapered) segments. params: {segCount=3, yTop=0.9, yBottom=0.1, x=0, z=0, sag=0.06}
   (sag bows the middle segments outward on x, a cheap catenary read without a curve primitive). */
export function chainDrape(params){
  params = params || {};
  const segCount = Math.max(2, Math.min(4, params.segCount || 3));
  const yTop = params.yTop != null ? params.yTop : 0.9;
  const yBottom = params.yBottom != null ? params.yBottom : 0.1;
  const x = params.x || 0, z = params.z || 0;
  const sag = params.sag != null ? params.sag : 0.06;
  const ch = params.channel || "accent";
  const out = [];
  const step = (yTop - yBottom) / segCount;
  for(let i = 0; i < segCount; i++){
    const t = (i + 0.5) / segCount;
    const bow = Math.sin(t * Math.PI) * sag; // 0 at the ends, max at the midpoint — the "sag" read
    out.push(boxSpec(0.035, step * 0.95, 0.035, x + bow, yTop - step * (i + 0.5), z,
      { rz: (i % 2 === 0 ? 1 : -1) * 0.12, channel: ch }));
  }
  return out;
}

/* cage-frame — audit #6. a lattice box: 4 corner posts + top/bottom frame rails, collapsible to a
   cheap 3-box version (params.cheap=true drops the bottom rail — an open-bottomed hanging cage).
   params: {w=0.4, h=0.5, d=0.4, cheap=false}. */
export function cageFrame(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.4;
  const h = params.h != null ? params.h : 0.5;
  const d = params.d != null ? params.d : 0.4;
  const cheap = !!params.cheap;
  const ch = params.channel || "accent";
  const hx = w / 2 - 0.02, hz = d / 2 - 0.02;
  const boxes = [
    boxSpec(0.04, h, 0.04, -hx, h / 2, -hz, { channel: ch }),
    boxSpec(0.04, h, 0.04, hx, h / 2, -hz, { channel: ch }),
    boxSpec(0.04, h, 0.04, -hx, h / 2, hz, { channel: ch }),
    boxSpec(0.04, h, 0.04, hx, h / 2, hz, { channel: ch }),
    boxSpec(w, 0.04, d, 0, h, 0, { channel: ch })
  ];
  if(!cheap) boxes.push(boxSpec(w, 0.04, d, 0, 0, 0, { channel: ch }));
  return boxes;
}

/* basin-block — audit #8. wide shallow trough/bowl on a base: base slab + 4 short rim walls.
   params: {w=0.7, d=0.7, rimH=0.16}. Covers fountain/cistern/trough/font/large-scale bathtub reads
   (small decorative basins stay on shrine-block per the audit's class-(b) mapping). */
export function basinBlock(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.7;
  const d = params.d != null ? params.d : 0.7;
  const rimH = params.rimH != null ? params.rimH : 0.16;
  const ch = params.channel || "accent";
  const hx = w / 2, hz = d / 2;
  return [
    boxSpec(w, 0.08, d, 0, 0.04, 0, { channel: ch }),                                  // base
    boxSpec(w, rimH, 0.06, 0, 0.08 + rimH / 2, -hz, { channel: ch }),                  // rim -z
    boxSpec(w, rimH, 0.06, 0, 0.08 + rimH / 2, hz, { channel: ch }),                   // rim +z
    boxSpec(0.06, rimH, d, -hx, 0.08 + rimH / 2, 0, { channel: ch }),                  // rim -x
    boxSpec(0.06, rimH, d, hx, 0.08 + rimH / 2, 0, { channel: ch })                    // rim +x
  ];
}

/* web-mass — audit #9. an irregular translucent volume via 2-4 overlapping angled slabs, tinted
   through a `channel:"web"`-style caller resolution (this part just tags the box, per §5). Also
   usable as an FX attachment on bestiary spider-family recipes (audit: "earns its keep twice").
   params: {count=3, spread=0.3, channel="accent"}. */
export function webMass(params){
  params = params || {};
  const count = Math.max(2, Math.min(4, params.count || 3));
  const spread = params.spread != null ? params.spread : 0.3;
  const ch = params.channel || "accent";
  const out = [];
  for(let i = 0; i < count; i++){
    const t = count > 1 ? i / (count - 1) - 0.5 : 0;
    out.push(boxSpec(0.4 - Math.abs(t) * 0.1, 0.03, 0.4 - Math.abs(t) * 0.1,
      t * spread, 0.02 + Math.abs(t) * 0.04, t * spread * 0.4,
      { ry: t * 0.6, rx: 0.15, channel: ch }));
  }
  return out;
}

/* arch-frame — the audit's "honorable mention" new part (~15 rows, archway/gate). two side posts
   + a lintel top, optional keystone highlight. params: {w=0.8, h=0.9, postW=0.12, keystone=true}. */
export function archFrame(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.8;
  const h = params.h != null ? params.h : 0.9;
  const postW = params.postW != null ? params.postW : 0.12;
  const keystone = params.keystone !== false;
  const ch = params.channel || "accent";
  const hx = w / 2 - postW / 2;
  const boxes = [
    boxSpec(postW, h, postW, -hx, h / 2, 0, { channel: ch }),
    boxSpec(postW, h, postW, hx, h / 2, 0, { channel: ch }),
    boxSpec(w, postW, postW, 0, h + postW / 2, 0, { channel: ch })
  ];
  if(keystone) boxes.push(boxSpec(postW * 1.3, postW * 1.3, postW * 1.4, 0, h + postW / 2, 0, { channel: "glow" }));
  return boxes;
}

/* coffin-slab — audit #8 (of the 17-list numbering — "sarcophagus/coffin"). a rectangular base +
   a lid, optionally ajar (params.ajar rotates/offsets the lid off the base — a cracked-open read).
   params: {w=0.3, len=0.8, h=0.3, ajar=false}. */
export function coffinSlab(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.3;
  const len = params.len != null ? params.len : 0.8;
  const h = params.h != null ? params.h : 0.3;
  const ajar = !!params.ajar;
  const ch = params.channel || "accent";
  return [
    boxSpec(w, h * 0.7, len, 0, h * 0.35, 0, { channel: ch }),
    boxSpec(w * 1.05, h * 0.3, len * 1.02, ajar ? w * 0.35 : 0, h * 0.7 + h * 0.15, 0,
      { rz: ajar ? 0.3 : 0, channel: ch })
  ];
}

/* vine-tangle — the audit's second honorable-mention-adjacent new part (bramble/briar/hanging-
   vines/razorvine/thorny-arch dressing). 3-5 thin curved (angled-segment) tendrils, wall- or
   ground-anchored. params: {count=4, anchorY=0, spread=0.3}. */
export function vineTangle(params){
  params = params || {};
  const count = Math.max(3, Math.min(5, params.count || 4));
  const anchorY = params.anchorY != null ? params.anchorY : 0;
  const spread = params.spread != null ? params.spread : 0.3;
  const ch = params.channel || "skin";
  const out = [];
  for(let i = 0; i < count; i++){
    const t = count > 1 ? i / (count - 1) - 0.5 : 0;
    const len = 0.3 + Math.abs(t) * 0.15;
    out.push(boxSpec(0.025, len, 0.025, t * spread, anchorY + len / 2, t * spread * 0.3,
      { rz: t * 0.5, channel: ch }));
  }
  return out;
}

/* mushroom-cluster — audit #10. cap-on-stalk repeated 2-4x at varying scale. params: {count=2,
   spread=0.18, channel="skin"}. Covers mushroom colony/fungal bloom/puffball/glowing-fungus. */
export function mushroomCluster(params){
  params = params || {};
  const count = Math.max(1, Math.min(4, params.count || 2));
  const spread = params.spread != null ? params.spread : 0.18;
  const ch = params.channel || "skin";
  const out = [];
  for(let i = 0; i < count; i++){
    const t = count > 1 ? i / (count - 1) - 0.5 : 0;
    const s = 0.12 - Math.abs(t) * 0.03;
    const x = t * spread, z = (i % 2 === 0 ? 1 : -1) * spread * 0.3;
    out.push(boxSpec(s * 0.4, s * 1.4, s * 0.4, x, s * 0.7, z, { channel: ch }));       // stalk
    out.push(boxSpec(s * 1.3, s * 0.5, s * 1.3, x, s * 1.4 + s * 0.25, z,
      { channel: "glow" }));                                                             // cap
  }
  return out;
}

/* well-shaft — audit #11. a low ring wall (simplified to a 4-segment box ring) around an implied
   dark void (no floor plane drawn — the absence of a bottom IS the depth read, matching blob-mass's
   own "read through absence" convention). params: {r=0.32, wallH=0.28}. */
export function wellShaft(params){
  params = params || {};
  const r = params.r != null ? params.r : 0.32;
  const wallH = params.wallH != null ? params.wallH : 0.28;
  const ch = params.channel || "accent";
  const out = [];
  for(let i = 0; i < 4; i++){
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    out.push(boxSpec(r * 0.85, wallH, 0.08, Math.cos(ang) * r, wallH / 2, Math.sin(ang) * r,
      { ry: ang, channel: ch }));
  }
  return out;
}

/* ladder-rungs — audit #12. a pair of tapered rails + one textured "rungs" slab standing in for
   the repeated-rung read (cheap — matches the audit's own "2 rails + 1 rungs-slab" suggestion).
   params: {h=0.9, w=0.24}. */
export function ladderRungs(params){
  params = params || {};
  const h = params.h != null ? params.h : 0.9;
  const w = params.w != null ? params.w : 0.24;
  const ch = params.channel || "accent";
  return [
    boxSpec(0.035, h, 0.035, -w / 2, h / 2, 0, { channel: ch }),
    boxSpec(0.035, h, 0.035, w / 2, h / 2, 0, { channel: ch }),
    boxSpec(w - 0.04, 0.03, 0.03, 0, h / 2, 0.02, { channel: ch })    // one slab standing in for the rung repeat
  ];
}

/* furnace-block — audit #13 (flagged borderline: "could be a param on shrine-block if budget is
   tight" — built as its own cheap part anyway, per the task brief's "full class-(c) list"). a squat
   heavy block + a glow-channel vent face + a chimney stub. params: {w=0.5, h=0.5, d=0.4}. */
export function furnaceBlock(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.5;
  const h = params.h != null ? params.h : 0.5;
  const d = params.d != null ? params.d : 0.4;
  const ch = params.channel || "accent";
  return [
    boxSpec(w, h, d, 0, h / 2, 0, { channel: ch }),
    boxSpec(w * 0.4, h * 0.3, 0.02, 0, h * 0.4, d / 2, { channel: "glow" }),    // vent/mouth face
    boxSpec(0.12, 0.3, 0.12, w / 2 - 0.1, h + 0.15, -d / 2 + 0.1, { channel: ch }) // chimney stub
  ];
}

/* gear-cluster — the audit's 14th new part (mechanical gears/clockwork wreckage/winch drum). 2-3
   overlapping disc-read (flattened box) boxes at offset angles/heights. params: {count=3, r=0.16}. */
export function gearCluster(params){
  params = params || {};
  const count = Math.max(2, Math.min(3, params.count || 3));
  const r = params.r != null ? params.r : 0.16;
  const ch = params.channel || "accent";
  const out = [];
  for(let i = 0; i < count; i++){
    const s = r * (1 - i * 0.22);
    out.push(boxSpec(s, 0.05, s, i * 0.1, 0.1 + i * 0.06, i * -0.06, { ry: i * 0.4, channel: ch }));
  }
  return out;
}

/* tent-canopy — audit #15 (flagged as possibly not needing a new part at all — "this may not need
   a new part... flagging as (c) conservatively"). built cheaply by reusing wing-slab's own angled-
   panel vocabulary "reused upside-down" per the audit's own description: two angled roof panels
   meeting at a ridge + an optional ridge pole. params: {w=0.7, h=0.4, ridgePole=true}. */
export function tentCanopy(params){
  params = params || {};
  const w = params.w != null ? params.w : 0.7;
  const h = params.h != null ? params.h : 0.4;
  const ridgePole = params.ridgePole !== false;
  const ch = params.channel || "accent";
  const boxes = [
    boxSpec(w * 0.55, 0.03, w * 0.5, -w * 0.22, h * 0.8, 0, { rz: 0.5, channel: ch }),
    boxSpec(w * 0.55, 0.03, w * 0.5, w * 0.22, h * 0.8, 0, { rz: -0.5, channel: ch })
  ];
  if(ridgePole) boxes.push(boxSpec(0.03, 0.03, w * 0.5, 0, h, 0, { channel: ch }));
  return boxes;
}

/* bell-mass — the audit's 16th new part (hanging tavern-sign bell/church bell/alarm bell/gong). a
   tapered bell-body box on a mount yoke. params: {r=0.14, h=0.2}. */
export function bellMass(params){
  params = params || {};
  const r = params.r != null ? params.r : 0.14;
  const h = params.h != null ? params.h : 0.2;
  const ch = params.channel || "accent";
  return [
    boxSpec(0.05, 0.06, 0.05, 0, h + 0.06, 0, { channel: ch }),                 // mount yoke
    boxSpec(r, h, r, 0, h / 2, 0, { taper: 0.7, channel: ch })                  // bell body, tapered
  ];
}

/* throne-seat — audit #17 (flagged as possibly collapsible into a table-slab param). built as its
   own cheap part reusing table-slab's own single-pedestal-leg call plus a tall back panel, per the
   audit's own note that it "could alternatively be a table-slab param". params: {backH=0.5}. */
export function throneSeat(params){
  params = params || {};
  const backH = params.backH != null ? params.backH : 0.5;
  const ch = params.channel || "accent";
  const seat = tableSlab({ legs: 1, w: 0.36, d: 0.36, h: 0.28, channel: ch });
  return seat.concat([
    boxSpec(0.36, backH, 0.05, 0, 0.28 + backH / 2, -0.17, { channel: ch })
  ]);
}

/* ============================================================================
   THE REGISTRY — the single source of truth dev/verify-model-parts.mjs iterates against the full
   §1 inventory. Keys use the §1 kebab-case names verbatim (the doc's own vocabulary); values are the
   exported functions above (same function objects as the named exports, not copies).
   ============================================================================ */
export const PARTS = Object.freeze({
  // bodies
  "torso-biped": torsoBiped,
  "torso-tapered": torsoTapered,   // UNIT 2 — the V-taper biped variant (shoulders wider than hips)
  "torso-biped-huge": torsoBipedHuge,
  "torso-quad": torsoQuad,
  "blob-mass": blobMass,
  "thorax-abdomen": thoraxAbdomen,
  "serpent-coil": serpentCoil,
  "swarm-scatter": swarmScatter,
  "horror-mass": horrorMass,
  // limbs/locomotion
  "arm-tapered": armTapered,
  "leg-tapered": legTapered,
  "leg-spider": legSpider,
  "wing-slab": wingSlab,
  "tail-segments": tailSegments,
  "fin-ridge": finRidge,
  // heads
  "head-round": headRound,
  "head-snout": headSnout,
  "head-horned": headHorned,
  "head-skull": headSkull,
  "head-eyeless": headEyeless,
  "maw-open": mawOpen,             // UNIT 2 — the open predator jaw (the wolf-jaw signature-feature rule)
  // weapons
  "sword-slab": swordSlab,
  "axe-wedge": axeWedge,
  "spear-pole": spearPole,
  "bow-arcs": bowArcs,
  "staff-tipped": staffTipped,
  "shield-slab": shieldSlab,
  "dagger-slabs": daggerSlabs,
  "club-mass": clubMass,
  // armor
  "pauldrons": pauldrons,
  "chest-plate": chestPlate,
  "helm-crest": helmCrest,
  "robe-skirt": robeSkirt,
  // FX attachments
  "ember-flecks": emberFlecks,
  "glow-halo": glowHalo,
  "drip-tendrils": dripTendrils,
  "bone-protrusions": boneProtrusions,
  // props
  "crate": crate,
  "cart": cart,
  "pillar-broken": pillarBroken,
  "shrine-block": shrineBlock,
  "tree-bare": treeBare,
  "rubble-scatter": rubbleScatter,
  "banner-pole": bannerPole,
  // props, part II — MODEL-GRAMMAR G4 (dev/model-coverage-report.md class-(c), 17 new parts)
  "statue-figure": statueFigure,
  "table-slab": tableSlab,
  "chain-drape": chainDrape,
  "cage-frame": cageFrame,
  "basin-block": basinBlock,
  "web-mass": webMass,
  "arch-frame": archFrame,
  "coffin-slab": coffinSlab,
  "vine-tangle": vineTangle,
  "mushroom-cluster": mushroomCluster,
  "well-shaft": wellShaft,
  "ladder-rungs": ladderRungs,
  "furnace-block": furnaceBlock,
  "gear-cluster": gearCluster,
  "tent-canopy": tentCanopy,
  "bell-mass": bellMass,
  "throne-seat": throneSeat
});

/* the BODY-only subset (the §2 anchor-set check iterates this, not the full PARTS map, since limbs/
   heads/weapons/armor/FX/props never carry an .anchors object — only a body does). */
export const BODY_PART_NAMES = Object.freeze([
  "torso-biped", "torso-tapered", "torso-biped-huge", "torso-quad", "blob-mass", "thorax-abdomen",
  "serpent-coil", "swarm-scatter", "horror-mass"
]);
