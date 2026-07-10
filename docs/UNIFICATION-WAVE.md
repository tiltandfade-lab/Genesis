# UNIFICATION-WAVE — one render channel, one world, a face for the voice

type: system-spec
status: SPECCED (Adam's final art-direction rulings, 2026-07-10 night: "yes to all."
Runs AFTER the Beauty Wave proves the diorama on the flagships. Build = Adam's word.)

The last structural art decisions. After this, art direction is CLOSED — every future
wave is execution. Companion to docs/BEAUTY-WAVE.md (scene beauty) and
docs/GRAPHICS-ENGINE.md (the Wildermyth grammar laws, incl. tonight's 2/2b/2c/2d).

## THE ONE-CHANNEL RULING

Genesis renders through ONE channel: the diorama. The flat standing table (setBoard,
the band/lane grid) is a legacy channel that splits every polish dollar; Wildermyth is
always-diorama. Exteriors, settlements, and interiors all become dioramas; the flat
table survives behind a legacy flag until parity, then dies.

## UW1 — EXTERIOR DIORAMA KIT

Walk segments outdoors render as dioramas with TERRAIN PLATES instead of room prisms:
1. **Ground:** the segment's cell footprint as a terrain slab — seeded height noise
   (gentle, ≤ 0.15 units), per-cell tone jitter (VP3's law), realm ground material
   (REALM_MATERIALS gains `terrain` surfaces: soil/sand/snow/asphalt/boardwalk).
2. **Horizon:** a backdrop ring of 2-4 distant-silhouette cards (treeline/skyline/
   dunes — a new `horizon` roster in the dressing families, flagships first) +
   the realm's graded void; skirt law applies to the slab edge.
3. **Big foliage:** exterior dressing rolls denser than interiors (trees/rocks as
   large cards + occasional prism landmarks from REALM_PROPS), same dressPlan seams,
   `location:"exterior"` tags already exist in the manifests.
4. Wired where interiors wired: `trayFrom` gains the `exterior` kind off the walk
   cursor for non-dungeon environments; combat cellDims from the segment footprint
   (dm.js seam already generalizes).
*Verify:* the loop gate grows exterior iterations (wilderness + urban walks, 5/5);
determinism; light rig parity (sun = one warm directional low-intensity + hemisphere,
shadow-casting, replacing torch seeds outdoors); flagship exterior study card READ.

## UW2 — SETTLEMENT DIORAMAS

Place-gen records (GRID-LAW dims, place spine archetypes) render as building dioramas:
building = prism shell (wall material by realm) + door/window CARDS (objects family)
+ street/yard terrain plates + dressing by `station` tags. The existing place-tray
`node` source upgrades from the flat tray to the diorama channel (its screenshot gate
re-shoots). No new generation systems — this is a render-channel upgrade over the
already-landed PLACE-GEN data.
*Verify:* the gloom-diner gate scene re-renders as a diorama (side-by-side vs the old
tray, READ); place records byte-unchanged (render-only unit); combat in a settlement
uses the place's real cells.

## UW3 — FLAT-TABLE PARITY + RETIREMENT

1. Combat everywhere routes through the diorama channel (interior/exterior/settlement
   per the walk/place context); the band/lane grid stays as the DATA model (combat
   logic unchanged — bands project onto diorama cells via the existing zone seams).
2. The flat table survives behind `GS.legacyTable` (default off) for one soak cycle;
   its removal is a later chore commit once the diorama channel has a full playtest
   green (bridgeless soak + gauntlets).
3. OUT OF SCOPE: any combat-rules change; the tabletop's blob-shadow/figure code that
   the diorama channel reuses stays.
*Verify:* full gauntlet sweep + bridgeless playtest on the diorama channel; byte-gate
on combat event handling; a legacy-flag smoke check.

## UW4 — PORTRAITS (the emotional layer)

The DM's voice gets a face. New art family `portraits`:
1. **Format:** bust crops (shoulders up), 512px source, realm-styled but CLEANER than
   sprites (portraits may run painterly-pixel hybrid — they're read at full size; the
   50%-zoom law doesn't apply). Chroma-keyed sheets like everything else, 3x3 grids.
2. **Who (flagship first):** every PC ancestry×sex (24 busts, class-agnostic dress) +
   the flagship realms' named-tier NPC roster (~16 busts per flagship realm) + a
   generic-role fallback set per flagship (~8: guard/elder/merchant/priest/child/
   stranger/villain/ally — cast-bound like sprites, BINDING LAW applies via the same
   registry/overlay machinery: `portrait` field on the codex NPC record).
3. **EXPRESSIONS:** each bust ships a 3-variant expressionSet (calm / distressed /
   hostile) per SPRITE-TAGS law 2 — the expressionSet law finally gets its production
   surface. `guise_swap` swaps portraits too (GUISE law 1: the form set includes faces).
4. **Presentation:** a dialogue panel over the diorama (lower-third, Ivalice tokens,
   translucent per VP5's language): speaker bust + name chip + the DM's line; the
   panel is DOM, positioned like VP5's chips, hidden outside dialogue beats. Codex
   packet: `dev/model-qa/portrait-gen/` (generated like dressing-gen once rosters
   are red-penned — ~10-12 sheets for the flagship set).
*Verify:* portrait registry joins (every named-tier flagship NPC resolves a bust or
falls back to role); expression swap drives off the existing expressionSet field;
binding — a bust bound to one NPC never appears on another (harness over the casting
flow); panel screenshot gate READ.

## Order

UW1 → UW2 → UW3 strictly (each proves the channel the next consolidates onto);
UW4 independent, can ride alongside UW1. All after BEAUTY-WAVE VP0-VP4 land on the
flagships (the diorama must be worth consolidating onto). Every unit re-runs the loop
gate + the full verify sweep; UW3 additionally needs the playtest soak before the
retirement commit.
