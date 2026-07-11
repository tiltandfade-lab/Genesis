# BEAUTY-WAVE — closing the visible gap to the Wildermyth grammar

type: system-spec
status: SPECCED (Adam asked for the full spec 2026-07-10 night; build authorization = his word.
Units are Sonnet-ready; VP1 is a defect fix and may run immediately.)

## Why (the honest gap read, from the loop-gate contact sheet)

Construction parity landed tonight; the frames still read crusty because: pieces are
kaiju-scaled (defect), dressing is placeholder boxes (art pending, channel wired),
floors are one flat extruded color (no ground design), scenes have no art direction
(no palette script, lights placed by seed not composition), the combat UI slathers
opaque debug boxes over the stage, nothing moves, and sprites float. Wildermyth wins
on density + design, not on tech we lack. Each unit below removes one named crust.

Verified anchors (orchestrator, tip a92fba0): `interiorBuildPieces` theater-boot.js:4390 ·
`buildSpriteBillboard` :2507 · `spriteSizeScaleFor` :2491 + `SPRITE_SIZE_SCALE` ·
`GLB_TARGET_HEIGHT = 1.5` :1191 · blob-shadow quad convention comment :2815 ·
light flicker rig (`tickLightFlicker`) :2909 region · kits/materials
`src/ui/theater-interior.js` (`INTERIOR_TILE_KITS`, `REALM_MATERIALS`, `itrRoomLights`,
skirt) · `dressPlan` `src/engine/place-dressing.js` · `STANDEE_VERBS`
`src/ui/standee-verbs.js` · sizing sources `dev/model-qa/corpus-sizing.json`,
`dev/sprite-sheets/incoming/v3/v3-sizing.json`, overlay `floor` rulings ·
registry generator `build/gen-sprite-registry.py` (overlay fold sites ~:243-258,
emit sites ~:150-156) · battle overlay documented in docs/BATTLE-VISUALS.md
(band rails MELEE/NEAR/FAR/OUT left, L/C/R top; DOM lives in the theater host —
VP5 step 0 greps its ids from genesis.html).

## FLAGSHIP SCOPE (Adam 2026-07-10 night)

**Three flagship realms get the full wave: FANTASY, GLOOM, CHROME.** Every VP unit
builds its mechanism realm-agnostic but polishes, tunes, and gates ONLY the flagships;
the other nine realms inherit the proven kit later, realm-by-realm — **each realm is an
expansion pack** (product strategy: land the core with the flagships, then a new realm
drop roughly every 6 months keeps the audience fed). Dressing/effects art beyond the
flagships stays queued, not gating.

## VP0 — THE TWO-FLAG STUDY CARD (run before everything; Adam's pixel-verdict)

Same seeded gloom+fantasy rooms × four cells: {ortho, perspective ~20° FOV} ×
{PSX dither+snap ON world, OFF world}. One card, four constructions, Adam picks with
eyes. His pick locks GRAPHICS-ENGINE 2/2b before VP3/VP4 build on top. (Sprites remain
PSX-exempt in all cells; tabletop untouched.)
*Verify:* the four cells are pixel-distinct (pairwise diff > threshold); harnesses
green under both camera modes (placeCamera math asserted for perspective: action
cluster fully in frustum).

## VP1 — TRUE-SCALE PIECES + the registry sizing fold  (defect fix; run first)

The kaiju bug: `interiorBuildPieces` sizes billboards through the TABLETOP convention
(`spriteSizeScaleFor(size) × GLB_TARGET_HEIGHT × entry.scale` — a *render-height
multiplier* system tuned for the flat table) while interior space is TRUE-SCALE
(`cellSize: 1 world unit = 5 ft`, DUNGEON-GRAPH law 1). A medium creature must stand
≈ 5.5/5 = **1.1 world units** in a room; today it inherits table height ≈ several units.

1. **Registry fold (edit-source → compile):** extend `build/gen-sprite-registry.py` to
   fold per-slug TRUE-SCALE fields — read `dev/model-qa/corpus-sizing.json` (committed
   corpus) and `dev/sprite-sheets/incoming/v3/v3-sizing.json` (v3 wave; keys are
   `realm/label` — join via the v3 manifests' `replaces` field where present, else skip
   uncut slugs) and emit per entry: `feet` (number), `scaleTrue` (= scaleVsHuman,
   feet/5.5, 2dp). The overlay `floor` field already folds (landed today). NEVER
   hand-edit data/sprite-registry.js; regenerate with
   `--manifest dev/sprite-manifests/v2-manifest.json`. The legacy `scale` field is
   UNTOUCHED (tabletop keeps its convention this wave).
2. **Interior sizing:** in `interiorBuildPieces` (theater-boot.js:4390), piece world
   height = `HUMAN_TRUE_HEIGHT (1.1) × (entry.scaleTrue || piece.scaleVsHuman || 1.0)`,
   width from the sprite texture's aspect. `entry.floor` (fraction up from image
   bottom) offsets the quad down so the floor line sits on y = -0.5. Cap render height
   at the room's wall height × 0.95 with a `qa: oversize-clamped` console.warn (a
   titanic in a human room is a SCALE-DOMAIN problem, not a rendering one).
3. OUT OF SCOPE: changing tabletop sizing; re-judging any sprite's feet (data is data).

*Verify (extend dev/verify-dungeon-interior.mjs):* ⊗ red-first — assert today a medium
piece's built height > 2 world units (the bug, provable before the fix); after: medium
1.05–1.15, large ≈ 2.0–2.4, the loop-gate knight ≤ 1.3; registry emits feet/scaleTrue
for ≥ 800 cut slugs (`grep -c scaleTrue data/sprite-registry.js`); floor-line offset
math asserted for a nonzero-floor fixture. Mutation: stub the fold off → registry count
check reds. Re-run the FULL loop gate (5/5) and READ the contact sheet — knights stand
human-height beside doors.

## VP1.5 — THE CORPUS UNIFICATION PASS (palette + texel + fringe; one batch, no codex spend)

The collage killer (Adam's rulings #2/#3/#7): one mechanical reprocess of every cut
sprite, then automatic on every future fold (extends the ADDITIVE FOLD slice step).
1. **REALM MASTER PALETTES:** derive a fixed 32-48 color palette per realm — seeded from
   the realm's style-ref PNG + kit/grade colors (k-means over the style ref, then hand
   room for skin/metal ramps; emit `dev/model-qa/realm-palettes/<realm>.json`, a
   GENERATED artifact with a build script). Every sprite quantizes to its realm's
   palette at slice time (nearest-color, alpha untouched, NO dithering added).
2. **TEXEL DENSITY LAW:** target pixels-per-foot per size band (one number, e.g. medium
   ≈ 36 px/ft → a 5.5ft human ≈ 200px tall; derive the exact target from the corpus
   median so most sprites resample ≤ 1.5×). Downsample = nearest; upsample = xBRZ 4×
   then nearest-down to target (the validated upscaler card). `feet` from the registry
   fold (VP1) is the input — VP1 runs first.
3. **DEFRINGE** (ruling #7) runs in the same sweep (the magenta-lane unmix pass).
4. Output OVERWRITES assets/sprites/*.png + the v3 incoming set; originals archived to
   quarantine-pack/pre-unification/ (additive law — one zip, then the folder may be
   LFS'd). Registry pxHeight fields regenerate.
5. FLAGSHIPS gate the eyeball pass (fantasy/gloom/chrome contact sheets, READ);
   the other realms process mechanically under the same laws.
*Verify:* every processed sprite's colors ⊆ its realm palette (exact set check);
texel targets hit ±10%; alpha byte-identical where no fringe was removed; before/after
contact sheet per flagship realm READ by the orchestrator + Adam. Mutation: run with
quantization stubbed → the palette-subset check reds.

## OUTLINE LAW (ruling #5 — per-realm, enforced in prompts + gates + the unification pass)

One outline treatment per realm, no mixing. Flagship defaults (Adam may red-pen):
**fantasy** = selective dark-umber outline (outer silhouette only) · **gloom** = full
1px near-black outline (the VHS-horror cel look) · **chrome** = NO line; neon rim-edge
carries the silhouette. Others drafted in `realm-palettes/<realm>.json` (`outline:` field)
and applied when their expansion ships. Prompts gain a per-realm outline clause
(patched into pending packets for the three flagships only); the style gate checks it;
the unification pass can ENFORCE the gloom full-outline mechanically (edge-detect +
darken) but never synthesizes selective/none styles — those are generation-time.

## VP2 — DRESSING ART FOLD (codex arrivals → the wired channel)

When dressing-gen sheets land (`ui-sketches/sprite-sheets/*-dg-*.png`, root tree):
gate → slice per the dressing-gen manifests (same slicer lineage as today's
slice_arrivals.py; grid from manifest, chroma #FF00FF) → write cards to
`assets/dressing/<slug>.png` (the loader's real path, placeholder falls away
automatically) → extend `REALM_DRESSING` from the 6-entry stubs to the full rosters
(regenerate from the manifests — write `build/gen-realm-dressing.py`, GENERATED header,
never hand-edit) → density tune: dressPlan's per-role counts reviewed against the
Wildermyth rule (1-3 focal, filler sparse — visual-conventions.md #5).
*Verify:* every REALM_DRESSING slug has a PNG on disk post-fold; a re-shot loop-gate
frame contains zero placeholder-label textures (pixel-scan for the placeholder's
signature color); slice QA per ADDITIVE FOLD LAW (gate verdicts recorded).

## VP2b — THE GALLERY PASS (Adam 2026-07-10 night: bottom-clipped sprites become paintings)

Reclamation, pure additive law — sprites whose art is cut off at the bottom edge are
defective standees but perfectly-composed FRAMED ART:
1. **Detect (mechanical):** alpha touching the bottom image edge across ≥ 30% of the
   width = bottom-clipped candidate; union with Adam's review fails whose notes flag
   clipping; also sweep quarantine + the `-takeN` reject takes (paid-for art, additive
   law). Emit `dev/model-qa/gallery-candidates.json` for a one-pass eyeball cull.
2. **Frame (procedural):** composite each keeper into a painting card — realm frame
   styles (fantasy gilt/wood, gloom cracked-black w/ a canted option, chrome bezel
   holo-display, per REALM_MATERIALS trim colors) + a canvas-texture inset behind the
   subject; output `assets/dressing/<realm>-painting-<n>.png`.
3. **Register:** join REALM_DRESSING as `primary: wall-hang` cards (the dressing roll
   already places wall-hangs against wall cells); castable lore hooks ride free —
   a creature's portrait hanging in a dungeon is foreshadowing the DM can NAME, and a
   painting is a legal mimic guise (GUISE object-guiser class).
4. Subjects keep provenance: card manifest carries `paintingOf: <source slug>` so the
   DM/codex knows whose face hangs on the wall.
*Verify:* detector precision on a labeled sample (no full-body sprite falsely eaten);
frames deterministic per realm; every emitted card joins REALM_DRESSING and resolves
on disk; a gloom study frame shows ≥1 hung painting, READ. OUT OF SCOPE: generating
NEW painting art (this pass only reclaims; authored paintings can join dressing-gen
rosters later).

## VP3 — GROUND DESIGN (floors that read composed, not extruded)

In `src/ui/theater-interior.js` (all seeded off walkId — determinism law):
1. **Floor tone variation:** per-room floor color = kit floor color ± a seeded value
   nudge (≤ 6%) + per-CELL micro-jitter (≤ 3%) via the existing per-instance color path
   — kills the single-flat-slab read.
2. **Micro height steps:** seeded 5-15% of a room's floor cells raise/sink by 0.04-0.08
   units (sy jitter on floor slabs) — Wildermyth boards are never billiard-flat. Never
   under a piece/dressing cell (placement queries this), never in the center 2x2.
3. **Ground-cover patches:** a new low quad-card kind (`cover`: moss/dust/spill decals,
   flat ON the floor +0.01, from a small `cover` roster in the dressing sheets or a
   procedural tint-splat fallback until art lands) — 1-3 seeded patches per room.
4. **Room-edge softening:** perimeter floor cells darken 8% toward walls (extends the
   AO seam ring — this is the baked kind that real shadows DON'T already provide since
   it's tone design, not occlusion).
*Verify:* determinism; jitter bounds (assert ≤ caps); raised cells never collide with
pieces/dressing/center; cover patches on FLOOR only; before/after study card, READ.

## VP4 — SCENE ART DIRECTION (the palette script)

New data + small boot logic (`SCENE_DIRECTION` in theater-interior.js):
1. Per realm × room ROLE: {dominantHue (from kit), accentHue, valueScript} where
   valueScript = floor value < wall value < focal-light value (the painted-scene
   hierarchy — assert ordering after grade application).
2. **Key-light-as-composition:** the room's brightest light seed relocates adjacent to
   the room's FOCAL dressing piece (dressPlan already tags focal placements — export
   the chosen focal cell on plan.dressing entries); remaining lights dim to fill
   (≤ 60% of key intensity).
3. **Accent discipline:** doorframes/trim tint toward accentHue (≤ 0.1 strength) so
   every room carries exactly one accent thread.
4. Finale rooms get +1 key intensity step and the setPiece focal (staging law).
*Verify:* value-ordering assertion per realm×role; key sits within 1 cell of a focal
piece in ≥ 90% of 100 seeded rooms (some rooms legitimately lack focals); intensities
bounded; determinism; study card re-shot (this is the unit most needing EYES — Adam
taste-gates the card).

## VP5 — BATTLE UI REDESIGN (the clunk)

Adam holds standing UI autonomy (Ivalice bible) — design calls are Claude's here.
Step 0: grep the battle overlay DOM ids from genesis.html + docs/BATTLE-VISUALS.md
(band rails + unit cards drawn over the stage). Then:
1. **Get off the stage:** initiative/unit cards collapse to a slim translucent strip
   (single row of name+HP-pip chips, ≤ 48px tall, backdrop-blur, 0.75 opacity) docked
   BOTTOM; band labels (MELEE/NEAR/FAR/OUT) become small floating tags at each band's
   stage edge, not stacked cards.
2. **Diegetic selection:** the acting unit's chip highlights AND its standee gets a
   ground-ring glow (reuse blob-quad channel, accent color) — eyes stay on the stage.
3. **Damage floaters:** hit numbers rise off the standee (a DOM overlay positioned via
   the unit's projected screen position — theater already projects for blob quads) and
   fade 600ms; kills the need to read HP from cards mid-action.
4. Typography/skin per the Ivalice bible tokens already in genesis.html's CSS vars.
5. OUT OF SCOPE: non-combat UI, the creator, menus.
*Verify:* screenshot gate ONLY (this is design): re-shot loop-gate frames — stage
occlusion by UI ≤ 10% of frame (measure opaque-UI pixel share), all information still
present (chips readable at 1x), no DOM element overlaps the focus room's bounds. READ
the card; Adam gets final eyes.

## VP6 — THE LIFE PASS (stillness reads dead)

1. **Idle sway verb:** `idle-breathe` in STANDEE_VERBS (±1.5% scaleY, 2.4s loop,
   phase-offset per piece by seeded hash so a room never syncs) — auto-plays on every
   living piece while its board is mounted; `persist`, cancelled by any other verb,
   resumed after. Corpses (fall-death) never breathe.
2. **Torch flicker:** the interior light sources join the EXISTING tickLightFlicker
   channel (theater-boot:2909 region) at low amplitude; emissive marker quads pulse
   in sync with their light.
3. **Ambient motes:** 4-8 seeded drifting particle cards per room (ember for torch
   realms / dust for lamp realms — tint from kit), slow vertical drift + wrap, additive,
   tiny (0.05-0.12 units).
4. **VISIBLE HISTORY (ruling #5b):** combat leaves marks — on hit/death, seeded blood/
   scorch decal cards (the VP3 `cover` channel) drop at the event cell and PERSIST in
   the room's dressing record (stamped into pn.spatial.dressing, so the codex place
   remembers its battles across visits; grim register, children carve-out as ever).
5. **Hit effects wiring:** when effects-core art lands (VP2 fold), `hit-damage`/
   `fall-death`/`act-cast` verbs spawn their effect card (oversized 1.5-2×, per
   GRAPHICS-ENGINE §B) at the target; until art lands, a procedural flash-ring quad
   stands in behind the same seam (`effectCardFor(name) || proceduralRing`).
*Verify:* sway phase-desync asserted (no two pieces share phase in a 6-piece room);
corpse exclusion; flicker amplitude bound; motes stay within room bounds; effect seam
fires on the verb events (harness: fake clock, assert spawn+expiry); FPS budget —
loop-gate capture reports ≥ 30fps with 8 pieces + motes.

## VP7 — CONTACT GROUNDING (floaters)

Every interior piece + large dressing card gets the blob contact shadow the tabletop
figures already have (theater-boot:2815 blob-quad convention — reuse, don't reinvent):
radius from the sprite's texture width × 0.4, opacity 0.35, y=-0.495 (under the card,
above the floor, no z-fight — the convention comment covers this). Cast shadows stay;
the blob fills the ambient-side contact that shadow maps miss at torch angles.
*Verify:* every piece has exactly one blob; blob under corpse persists (tipped card
keeps its ground anchor); no z-fighting (render capture, pixel-scan the seam row).

## VP8 — THE BEAUTY SHOT (the wave's gate)

One art-directed scene, built not staged: seeded gloom crypt, VP1-VP7 all on, real
dressing art, 4 pieces mid-combat, one corpse, damage floater visible — captured at
1920×1080, placed SIDE BY SIDE with a Wildermyth combat screenshot (the research set,
scratchpad wildermyth-visual/) in one comparison card. The question for Adam's gate:
**"is the construction now the same?"** — not the art style, the construction. Plus the
same scene for chrome + fantasy. Any construction gap named in the card's caption
becomes the next wave's queue.

## Order + dependencies

VP0 + VP1 first (VP0 = Adam's two pixel-rulings; VP1 = the defect). VP2 when codex art
lands (independent; flagship sheets prioritized in the codex order). VP3 → VP4 (art direction wants ground design under it). VP5, VP6,
VP7 independent after VP1. VP8 last, after VP2. Executors: Sonnet each, isolated
worktrees, orchestrator re-gates (screenshots READ, not trusted); every unit re-runs
the loop gate before landing (the standing regression for this whole surface).
