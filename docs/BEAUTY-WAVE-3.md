# BEAUTY-WAVE-3 — THE INTEGRATION PASS (sprites become citizens of the scene)

type: system-spec
status: SPECCED (Fable, delegated seat, 2026-07-11 late — Adam's closing design question:
"the sprites all still look environmentally out of place... they have tricks for that in
Triangle Strategy." They do. These are the tricks. Build after BW2 closes.)

## The diagnosis

Sprites render UNLIT — buildSpriteBillboardMesh uses MeshBasicMaterial (full-bright, ignores
every scene light). The room plunges into torch gloom; the sprite stays noon-bright, pasted.
HD-2D's (Octopath/Triangle Strategy) core integration trick is the opposite: sprites RECEIVE
the scene — its light, its shadow, its grade, its depth of field. Every unit below moves a
sprite from "tourist" to "citizen."

## THE SPRITE PURITY AMENDMENT (law change — register in DESIGN.md at build)

Purity = ZERO geometric/texel distortion (no dither, no vertex snap, no warp, no smearing
filters on character pixels). Purity does NOT mean unlit. LIGHTING RESPONSE IS REQUIRED:
sprites take scene illumination and the realm grade like every other citizen of the diorama.

## BW3-0 — THE COMPOSER SEAM (prerequisite; verified missing 2026-07-11: zero EffectComposer
## in theater-boot, renderer.render() direct at :3497)

One unit: vendor/wire THREE's EffectComposer + RenderPass behind a flag, output byte-identical
to direct rendering when no effect passes are added (screenshot-diff proof). BW3-2/3/6 mount
their passes onto this seam; without it they have nowhere to live. FPS overhead of the bare
composer measured and reported (should be ~zero).

## BW3-1 — LIT SPRITES (the #1 fix) — PROMOTED FORWARD (2026-07-11: runs as part of BW2-4b,
## the post-texture polish pass, NOT waiting for the BW3 wave)

Adam confirmed the diagnosis live on the BW2-4 frames ("sprites look very desaturated... will
work better once sprites have dynamic [lighting]"): scene fog applies to the unlit billboards
(MeshBasicMaterial fogs by default — verified, no fog exemption exists) so sprites take the
near-black fog wash by depth while receiving zero torch light — atmosphere's costs, none of
its benefits. The fix is THIS unit, not a fog exemption (a fog-exempt unlit sprite floats
worse at distance). BW2-4b tunes the value dials ONCE, against lit sprites.

Billboard material MeshBasic → lit (MeshLambert or a minimal custom Lambert-ish shader):
receives the hemisphere key, torch PointLights, and the realm grade tint. Alpha-test cutout +
cast-shadow behavior unchanged; receiveShadow stays OFF (a cast shadow smeared across a flat
cutout reads as a bug — the U3 ruling stands; light RESPONSE ≠ shadow RECEIPT). Tune: a lift
floor so sprites never crush to unreadable black (min ambient term ~0.25 — readability law);
emissive micro-term for eyes/glow pixels can ride a later pass. Same treatment for dressing
cards + extrusion prop faces (the whole cutout family).
*Verify:* a standee beside a torch measures warmer/brighter than the same standee in a dark
corner (captured, pixel-measured); grade applied (chrome sprite reads cool, fantasy warm);
no distortion (texel-identical geometry, purity checks stay green); readability floor held.

## BW3-2 — TILT-SHIFT DoF (the HD-2D signature)

Subtle depth-of-field: sharp focal plane on the action/focus room, soft blur ramping at
near-foreground and far-background. This is THE photographed-miniature cue — it makes the
diorama read as a tiny real thing on a table (the Dwarf-Fortress-rpg-as-tabletop thesis,
literally in lens form). three.js BokehPass or a cheap two-tap separable blur w/ depth mask;
intensity a realm-tunable whisper (mock-level, never phone-camera-portrait-mode). Focus
follows the camera fit (beat = action cluster plane; room = room center).
*Verify:* focal plane tracks fitMode; blur bounded (max CoC capped); fps ≥ 30 held; A/B card
on/off READ — the on-frame should feel like the mocks' depth without anyone naming why.

## BW3-3 — SELECTIVE BLOOM (emissives only)

Torch flames, neon, glow seams, spell effects bloom softly (threshold-gated UnrealBloomPass or
emissive-layer-only bloom). The chrome mock's neon halos and the shop's candle glow are this.
Never blooms albedo (a white sprite must not glow).
*Verify:* bloom fires on emissive-tagged pixels only (threshold proof frame); chrome neon
halos visible; white-sprite negative control; fps ≥ 30.

## BW3-4 — LIGHT SHAFTS + MOTE COUPLING (fake volumetrics)

Each torch/lamp gets a soft additive light-cone card (the classic fake volumetric — a
gradient cone billboard, flicker-synced via the VP6 channel) and the VP6 motes BIAS INTO the
light pools (drift paths weighted toward cones) — dust visible IN the light, like the wolf
room's warm shaft. Cheap quads, no ray-marching.
*Verify:* cone per light source, flicker-synced; motes measurably denser inside pool radii;
additive never occludes; determinism.

## BW3-5 — SEAM-SOFTENING (why the wolf room's foliage "almost belongs")

The mock's foliage sits at ARCHITECTURE SEAMS — tufts and roots along the wall-floor joint,
moss at column feet, rubble in corners — hiding the hard prism edges. New dressing sub-pass
(ROOM-GRAMMAR-compatible): small filler cards seeded ALONG the wall-base line + at column/
furniture feet + doorway corners (realm-true: grass/roots/moss · bone-dust/cobweb · cable/
grime), density by room role. This is composition, not clutter: the seam line is the target.
*Verify:* filler placement hugs seams (distance-to-wall-base assert); density bounded by
role; CLEAR law respected (never on door/aisle cells); before/after READ — the prism edges
should stop reading as CG seams.

## BW3-6 — THE FILMIC GRADE (formalize per realm)

The whisper-fog + grade tints consolidate into one per-realm post grade: filmic tone curve,
gentle saturation shape, the existing vignette/rim darkening folded in. One LUT-ish grade per
realm (data, not code), flagships tuned by eyes, others inherit.
*Verify:* grade deterministic per realm; VALUE LAW ordering preserved post-grade; flagship
A/B cards READ.

## Order

BW3-1 first and alone (every later unit is judged on lit sprites). Then 2/3/4/5/6 in the
usual isolated-worktree fan-out (2/3/6 touch the render pass chain — orchestrator resolves).
The convergence gate re-runs after: engine | mock triptychs, the question now "do the sprites
BELONG?" Model split per the standing rule: mechanical → Sonnet; the DoF/bloom/grade taste
dials → Opus iterate loops.
