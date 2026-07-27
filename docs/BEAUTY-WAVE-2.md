# BEAUTY-WAVE-2 — THE MOCK CONVERGENCE (engine visual upgrade toward the PACKET-01 targets)

type: system-spec
status: SPECCED (Adam 2026-07-10 night: "let's focus on the engine visual upgrade"; the
PACKET-01 mock frames at ui-sketches/mock-frames/ are the reference targets — Adam's verdict:
"beautiful... we are close technically." Build authorized by that focus call.)

## The diagnosis (why our frames read as mush and the mocks read as product)

Adam's read of the VP8 shots: "a big pixely mess, I can't make out what I am looking at."
Root cause is NOT missing systems — the gloom mock contains our death knight, our ghost, our
painting, our chip strip, our decals. Five presentation deltas separate us:

1. **PRESENTATION SCALE** — mocks render a medium sprite ≈250px tall (near-native, crisp);
   our captures frame whole rooms so the same sprite lands ≈40px (downsampled soup).
2. **WALL TEXEL** — mock walls are readable pixel-art brick/block courses; ours are near-flat tint.
3. **VALUE PLUNGE** — mocks: deep darks, small hot light pools, rim vignette to black;
   ours: even mid-light.
4. **STANDEE BASES** — mock figures stand on physical plinth discs (miniature bases); the
   acting ring wraps the BASE. We have flat blobs only.
5. **SILHOUETTE** — mock doorways are ARCHES with depth, cutaway walls carry a low parapet
   rim, the finale has a real dais with steps.

Mock license flags (proposes-disposes law): redrawn creature poses = generation-time (puppet
tier, NOT engine); fully-3D-modeled props (torch sconce, tombstone volume) = the Blender lane,
not this wave; our cards stand in.

Reference targets (cite by name in every unit): `mock-01-gloom-combat.png` (the everyday frame),
`mock-01-fantasy-explore.png` (exploration register), `mock-01-finale.png` (staging), plus
camp/death/dialogue/shop/chrome for later UI-state waves.

## BW2-0 — THE CRISP CHANNEL (the mode-7 root cause; runs FIRST, found 2026-07-10 night)

Adam: sprites are high-res "and still look super crusty mode 7 style." Diagnosis (verified in
source): `applyPsxCanvasSize` (theater-boot.js ~:3948) renders the WHOLE theater at
`PSX_RES_SCALE = 1/3` resolution (`S.psxEnabled` default true) and CSS-stretches ×3 with
image-rendering:pixelated. Every sprite gets nearest-minified into a third-res buffer then
chunk-upscaled — double resample = the mode-7 warp/shimmer. Sprites were exempt from the
dither SHADER (VP0) but nothing is exempt from a low-res framebuffer. Per the standing PS1
scope amendment (palette+poly ONLY on the diorama), the buffer squeeze comes OFF:
1. **FULL resolution EVERYWHERE (Adam's mid-wave ruling: PS1 retired game-wide, tabletop
   included — no legacy-look maintenance on a channel that dies at UW3):** `psxEnabled`
   default OFF; buffer = CSS × min(devicePixelRatio, 2); `image-rendering: auto`. The dev
   escape hatch (opts.psx) stays functional for comparison. Dither/vertex-snap defaults go
   off on ALL channels too; machinery deletion rides UW3 cleanup.
2. **Sprite texture filtering:** magFilter stays Nearest (crisp when magnified — the pixel-art
   law); minFilter becomes Linear for sprite billboards (kills residual minification shimmer;
   NPOT-safe, no mipmap requirement). World-surface textures keep nearest min+mag (their texel
   is authored; BW2-3 owns their look).
3. FPS check: full-res render with the instanced kits + ≤8 standees must hold ≥30fps in the
   loop-gate capture report (the 4-draw-call budget makes this near-certain).
*Verify:* red-first — assert at the pinned pre-fix ref the drawing-buffer width < CSS width
(the 1/3 squeeze, provable); after: buffer == CSS×min(dpr,2) BY DEFAULT on both channels, and
the explicit psx:true escape hatch still reproduces the squeeze (both asserted); sprite min/mag
filters asserted per class; loop gate re-shot + READ (the crust should visibly die); fps ≥30;
check-manifest OK; interior + frustum + theater-sprites harnesses green.

## BW2-1 — THE BEAT CAMERA (presentation scale; the #1 fix — presentation SCALE; BW2-0 is the #1 fix for CRISPNESS)

Law 2c exists ("the camera fits the ACTION CLUSTER"), was ruled 2026-07-10, and is not wired.
1. **Combat beats:** camera fits participants + 1 cell margin (not the room). Target: a medium
   standee occupies ≥ 18% of frame height (mock ≈ 25%; measure gloom mock as the anchor).
2. **Exploration beats:** frame the room but CLOSE — the fantasy-explore mock frames one room
   wall-to-wall, camera lower (elevation angle nearer 35° than our current high look-down);
   sprites ≥ 12% frame height.
3. Implementation: extend placeCamera/the interior fit math (theater-boot.js) with a
   `fitMode: "beat" | "room"` param; combat mount + verb events pass "beat" with the
   participant cell set; exploration passes "room" with the focus room. Smooth tween between
   fits rides the existing camera tween channel if one exists — else snap (tween is a rider,
   not a gate).
4. OUT OF SCOPE: changing cell sizes, room footprints, or true-scale sizing (presentation
   only — the sprites are already the right WORLD size; the camera gets closer).
*Verify:* frustum check green in both modes; measured standee-height-fraction in the re-shot
gate ≥ 18% (combat) / ≥ 12% (room) — pixel-measure the capture; determinism; existing
interior/dressing harnesses green. READ the frames vs the mocks side by side.

## BW2-2 — STANDEE BASES (the miniature ontology made visible)

Per `mock-01-gloom-combat.png`: every combat standee stands on a physical plinth disc.
1. A low cylinder base under every interior standee (piece + combat unit): radius = the
   sprite's world width × 0.42, height ≈ 0.04 world units, seated on the floor line; realm
   trim color (REALM_MATERIALS trim, darkened) with a lighter top face.
2. The acting ring (VP5's setActingUnit) relocates to wrap the BASE rim (slightly larger
   radius, same gold), not a floor blob.
3. VP7's contact blob stays UNDER the base (ambient contact); base + blob + ring layer per the
   existing no-z-fight comment conventions.
4. Corpses: fall-death tips the standee; the BASE STAYS FLAT (a tipped miniature falls off its
   base? No — the whole miniature-with-base tips as one, per tabletop physicality; the blob
   stays put). Keep it one group.
*Verify:* one base per standee (count check, both pieces and combat units); base radius/height
bounds; ring wraps base radius; corpse tip keeps base attached; no z-fight (pixel-scan);
existing 282+ interior checks green. READ vs the mock.

## BW2-2b — BASES v2 + CONTACT AO (Adam 2026-07-11 night, off the landed BW2-2 frames)

1. **FLOOR-ALIGNED BASES (the bug):** the plinth currently inherits the standee's camera-pitch
   tilt (it's a child of the figure group that updateSpriteBillboardYaw tilts) — it must lie
   FLAT on the floor plane like a physical mini base. Move the tilt to the sprite's inner
   wrapper (the ensureWrap seam standee-verbs already uses); base + pool stay floor-aligned on
   the group. Fall-death still tips the WHOLE group (mini-with-base as one) — the tilt split is
   camera-tilt vs verb-tilt, assert both.
2. **THICKER:** base height 0.04 → ~0.09 (a real plinth, per the mock read).
3. **TURN GLOW:** when a unit is acting, its BASE ITSELF glows (emissive material swap, accent
   gold, joins the existing ring — ring + glowing plinth together read "your turn" diegetically).
4. **THE KILTER (taste ruling — "a figurine placed on that particular 5x5 tile"):** each
   standee gets a tiny SEEDED placement humanization — yaw jitter ±4°, position jitter ≤6% of
   cell — so minis read hand-placed, not machine-snapped. Deterministic per walkId+slug;
   combat-grid cell ownership unchanged (visual offset only).
5. **CONTACT AO, INTENSIFIED + GENERALIZED:** (a) the base's radial pool darkens (core opacity
   0.5 → ~0.7, tight to the plinth rim — the mock's "subtle drop shadow on the figurine base"
   reads MORE than ours); (b) WALL-CONTACT AO — any wall-hung or wall-adjacent dressing card
   (paintings, the chrome screen, shelves) gets a simulated-AO gradient at its attachment seam
   (a soft dark band card behind/around the contact edge, same CanvasTexture-gradient channel
   as the pool). Cheap quads, no SSAO pass.
*Verify:* base world-up alignment asserted under a tilted camera (base normal = +Y while the
sprite wrapper tilts); thickness/glow/material asserted; kilter deterministic + bounded + cell
ownership intact; fall-death integrity re-proven; pool intensity measured (core ≥0.65 alpha);
wall-contact AO present behind every wall-hang in a seeded room; existing interior/floor-contact
harnesses green; loop gate 5/5 re-shot + READ vs the gloom mock's bases.

## BW2-3 — MATERIAL TEXEL (walls and floors that read as masonry)

Per both mocks: wall faces show pixel-art block courses; floors show large stone tiles with
grout lines; texel density matches the sprite corpus (≈ 36px/ft at capture scale).
1. **GENERATED-FIRST (Adam 2026-07-10 night, off the chrome+shop mocks — "all the rich
   textures on every surface... utilize codex"):** the primary texture source is codex-generated
   tileable sheets per dev/model-qa/mock-gen/PACKET-02-TEXTURES.md (18 generations: wall/floor/
   floor-alt/trim/crate-faces × 3 flagships + shared) — fold gate: wrap-shift edge diff
   (tileability), loose palette bound, contrast cap; fold to assets/textures/ at engine texel
   (integer-ratio). The procedural painter below remains the FALLBACK (non-flagship realms +
   until arrivals land). Upgrade the procedural CanvasTextures from grain-tint to REAL courses:
   stone-course (running bond, per-block value jitter ±4%, thin dark grout), floor tile
   (2.5ft tiles, grout + per-tile jitter), plus the existing material kinds (plank/metal)
   getting the same treatment. Nearest-filtered, seeded per walkId (determinism law).
2. Texel law: one texel density across a kit, sized so a block course reads at the BW2-1
   camera distance (anchor: measure the gloom mock's brick rows against wall height — ≈ 14
   courses per wall height).
2b. **UV MAPPING LAWS (Adam 2026-07-11 — "the texture tricks"; what makes ONE 512 sheet serve
   every room size, per the everything-procedural doctrine):**
   - **FLOOR: 1 texture tile = 1 grid cell (5ft), 1:1.** RepeatWrapping; repeat = room dims in
     cells; the grout grid thereby ALIGNS with the combat grid (free legibility).
   - **WALLS: world-coordinate repeat, never stretch** — vertical at fixed texel (≈14 courses/
     wall-height), horizontal repeats by wall length; the fold gate grades each arrival:
     perfect tile → RepeatWrapping, near-tile → MirroredRepeatWrapping (ping-pong hides the seam).
   - **COLUMNS/PILLARS: per-face planar** from the wall sheet at matching texel (never
     wrap-stretched around the prism); alternate faces mirrored so adjacent faces never read identical.
   - **TRIM strips: stretch-to-fit along the run**, clamped vertically (bounded elements are
     the ONE legal stretch case).
   - **FURNITURE (ROOM-GRAMMAR's roster): per-face planar, one self-contained face tile per
     face**; long runs (pew seats) repeat the face tile with mirrored wrapping along the length.
   - **DOCTRINE (Adam): everything is procedural — only setPiece centerpieces are handcrafted.**
     These mapping laws are the mechanism: any wall length, any footprint, any furniture size
     consumes the same small texture set with zero per-room authoring.
3. Subtle-texture law still binds: low contrast (value jitter caps), never busy under sprites.
4. Flagships tuned (fantasy/gloom/chrome); other realms inherit mechanically.
*Verify:* textures deterministic; contrast bounds asserted (max value spread per face);
courses-per-wall-height ≈ 14±3 measured on a capture; harnesses green; before/after card READ.

## BW2-4 — THE VALUE PLUNGE (light pools + rim vignette)

Per the mocks: ambient drops hard, torch pools are small and hot, the diorama rim falls to
near-black, fog hugs the void edge.
1. SCENE_DIRECTION dials: ambient/hemisphere intensity down (target: unlit floor reads ≤ 25%
   value), key/torch pools hotter with faster distance falloff (decay 2, radius tuned so a
   pool spans ≈ 4-5 cells like the mock's torch).
2. RIM VIGNETTE: perimeter cells + skirt darken toward the void (extends VP3's edge softening
   outward — a graded multiplier band, not a screen-space shader; determinism).
3. The existing whisper fog tint stays; edge fog may thicken slightly at the skirt line.
4. VALUE LAW asserted: dark (rim/unlit) < mid (lit floor) < ONE bright (key pool / focal).
*Verify:* value-script ordering still green (VP4's 17 checks); measured luminance bands on a
capture (rim ≤ 25%, pool peak ≥ 70%); determinism; READ vs mocks — the frame should feel like
the mock's darkness without losing readability.

## BW2-5 — SILHOUETTE UPGRADES (arches, parapet, dais, THE COLUMN DEMOTION)

**COLUMN DEMOTION (Adam 2026-07-10 night: "why are there so many uniform square columns?"):**
per the chrome mock, mid-room verticality is FURNITURE, not columns — crates, cabinets,
machines, shelves as cover-height prism assemblies whose faces come from PACKET-02's
crate-face sheets (realm-true, glow seams on chrome). The dressing roll's `blocker` tag maps
to furniture-class volumes; bare square columns become a RARE accent (≤1 per room, and varied:
round/tapered/broken profiles when they do appear). Combat cover semantics unchanged — the
volume is the cover, whatever it looks like.

Per `mock-01-fantasy-explore.png` (door arches with real depth) + `mock-01-finale.png`
(parapet rims, dais with steps):
1. **Door arches:** doorframe prisms gain an arch header (2-3 stacked prisms corbelling in, or
   one arch-profile prism) + visible wall THICKNESS at openings (door reveals — the mock's
   doorways read deep).
2. **Parapet rim:** cutaway (camera-side) walls render as an exact 1 ft / 0.20u retained stub
   instead of vanishing entirely — the diorama reads as a box you look into (the finale mock).
   Cutaway law amended 2026-07-26: full walls drop to the one-foot stub, never to nothing. This
   supersedes the earlier proportional ≈0.4-wall-height target.
3. **Finale dais:** finale rooms get a centered 2-step dais platform (extends VP3's micro-step
   channel with real 0.15-0.25 steps, walkable, combat-grid-aware) — the staging law's floor.
   The setPiece focal (and the boss standee's cell) prefer the dais top.
4. All seeded/deterministic; 4-draw-call instancing budget respected (new prism kinds join the
   InstancedMesh kits).
*Verify:* draw-call budget unchanged (U3's 27 checks); arch/parapet/dais present in seeded
captures (structural asserts + pixel evidence); combat grid respects dais walkability; scale
domains unaffected; interior harnesses green; READ vs mocks.

## BW2-1b — THE OCCLUSION LAW (Adam 2026-07-10 night: "big columns blocking the characters")

**LAW: nothing renders between the camera and an actor's standee.** The mocks (and Wildermyth)
never let a column eat a character; our loop frames do (loop-03's knight behind a pillar).
1. **Dynamic cutaway:** extend the cutaway-walls treatment to interior columns/pillar prisms —
   any prism whose bounds intersect a camera→standee sightline (test per mounted standee, each
   camera fit) drops to a stub (≈0.3 wall height, the parapet grammar) or fades to ≤0.25
   opacity. Recompute on camera refit (BW2-1's fitMode changes) and on standee moves
   (move-step). Instancing note: per-instance visibility/height on the InstancedMesh, or move
   offenders to a small dynamic mesh set — respect the draw-call budget.
2. **Placement bias:** pillar/blocker dressing seeding avoids cells on the camera side of
   walkable/combat cells (the dressPlan already knows blockers; add the camera-side exclusion
   band). Seeded, deterministic — the bias is in the roll, the cutaway handles the rest.
3. OUT OF SCOPE: walls (already cutaway), dressing cards (flat, rarely occlude; skip v1).
*Verify:* red-first — reproduce a seeded scene where a pillar intersects the camera→standee
ray TODAY (assert the intersection); after: zero standees occluded across 100 seeded
combat fits (raycast assert); stub/fade prisms restore when the sightline clears; budget
unchanged; determinism; loop gate re-shot + READ (every figure fully visible in all 15 shots).

## THE PROP PERSPECTIVE LAW (Adam 2026-07-11 night — the opposite-perspective cyber screen)

Two prop classes, decided by attachment:
1. **CAMERA-FACING** (creatures, NPCs, free-standing dressing: trees, gravestones, statues) —
   ¾ eye-level art, billboarded. Baked perspective is legal because the quad always faces you.
2. **SURFACE-ATTACHED** (wall: screens/paintings/shelves/sconces · floor: rugs/grates/trapdoors
   · ceiling) — art must be FLAT (front elevation for wall items, top-down plan for floor
   items) and mounts as the face of a SHALLOW EXTRUSION prism (relief prop): depth per
   archetype (painting 0.04 · screen 0.05 · sconce 0.08 · shelf 0.3 · rug 0.01), side faces
   AUTO-MATERIAL-MATCHED by edge-sampling the art's border pixels (bronze frame → bronze
   sides, mechanically). The scene's real camera perspectives the volume — baked-angle art can
   never fight placement again.
Enforcement: (a) BW2-5 builds `extrusionPropFor(entry)` and wall-hang/floor-lay dressing
mounts through it; (b) the dressing manifests gain a `facing: front|top|three-quarter` field —
attached archetypes generate FLAT in every future packet (the dressing-gen prompt clause);
(c) triage: existing attached-class arrivals whose baked angle fights placement are flagged at
the fold gate (eyes), reclassified free-standing or re-queued.

**THE EXTRUSION TIER LADDER (Adam's question 2026-07-11: "any sprite or predefined shapes?" —
answer: ANY sprite, auto-classified; BW2-5 lands tier 1, tiers 2/3 = the follow-up unit):**
- Tier 1 BOX: bounding-rect thin box, alpha-cut front, edge-sampled sides — for
  near-rectangular art. Alpha coverage of bbox > ~85% routes here.
- Tier 2 SILHOUETTE: marching-squares alpha contour → Douglas-Peucker simplify (~30-80 pts,
  holes supported) → THREE.ExtrudeGeometry, cached per unique prop (~200 tris) — the wreath's
  actual shape extrudes. Coverage 30-85% routes here. Matters most for deep props (0.25+) and
  oblique angles; at 0.04 depth box ≈ silhouette visually.
- Tier 3 CARD: wispy/organic (no meaningful volume boundary) stays an alpha-cut card. Low
  coverage / high edge complexity routes here.
No hand-tagging — the classifier measures the sprite.

## BW2-6 — THE CONVERGENCE GATE (replaces VP8's caption queue)

Re-shoot the three anchor states on real rolled dungeons with BW2-1..5 on: gloom combat,
fantasy exploration, finale staging. Compose per-state triptychs: ENGINE | MOCK. The gate
question (Adam's eyes): "are we converging?" Any named delta becomes BW3's queue. Full-res
(BG_SHOT_W/H 1920×1080), standee-height fractions reported on the card.
**Plus the UPSCALE A/B CARD (Adam's ask):** 3 representative sprites (one crisp, one organic,
one under-res XL) each shown at beat-camera scale via {nearest, scale2x, xBRZ-if-vendorable}
side by side — Adam's eyes pick the law. Standing posture until then: nearest at ≥native,
REGENERATE-at-2× for genuinely under-res art (the XL-lane precedent); algorithmic upscale is
the fallback, not the fix.

## Order + vehicles

BW2-1 first (everything else is judged at its camera). Then BW2-1b/2/3/4/5 parallel
(worktree-isolated; **model split per Adam 2026-07-10: Sonnet for the mechanical units
BW2-1/1b/2/5; OPUS for the taste loops BW2-3/BW2-4**, each with an explicit iterate loop:
shoot → read vs mock → adjust dials → repeat to convergence, ≤5 rounds, every round's frame
kept as evidence). BW2-3 and BW2-4 both touch theater-interior — orchestrator resolves at
merge (VP-wave precedent). BW2-6 = the orchestrator's own gate shoot. Every unit re-runs the
loop gate; kill stale capture servers before every shoot (the standing scar).
