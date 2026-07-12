# PACKET-10 — CORE-3 DRESSING CARDS (flora, clutter, wall-hangs)

type: codex-packet
status: DRAFT (Fable, 2026-07-11 — follows GRAPHICS-ENGINE §D / GR2 and BW5 IA-3)

## Rationale

The room engine needs beautiful, deterministic dressing that is cheaper than bespoke models and more
expressive than procedural boxes. This packet fills the core-3 card channel for floor clutter,
foliage/organic growth, and wall-hung set dressing.

## Delivery Rules

Pixel-art dressing-card sheets on solid chroma background. Ground-level/eye-level cards only, no
top-down angle, no floor plane, no cast shadow, no text. Each cell is one prop/card, fully separated
with generous padding. Save to `ui-sketches/sprite-sheets/dressing/`.

Manifest every cell with `{slug, label, realm, family:"dressing", primary, location, stationTags[]}`.

## Sheets

### `dressing-fantasy-flora-1.png` — 4x4 grid
Ivy curtain, moss tuft, fern clump, mushroom ring, root coil, thorn bramble, hanging vine, fallen
leaves, candle cluster, herb bundle, shrine flowers, small sapling, reed bundle, lichen stone,
glowing fairy motes, bonus ivy variant.

### `dressing-fantasy-clutter-1.png` — 4x4 grid
Rubble pile, torn banner, stacked books, cracked urn, rope coil, training dummy, bedroll, wooden
bucket, loose scrolls, brazier shell, broken shield, market basket, sacks, plank barricade, altar
cloth, bonus crate scatter.

### `dressing-gloom-flora-clutter-1.png` — 4x4 grid
Dead hedge, grave reeds, pale fungus, bone pile, coffin board, moth-eaten drape, black candle
cluster, cracked gravestone, rusted chain, ash mound, web curtain, dead bouquet, skull niche,
fallen reliquary, pooled grave wax, bonus shroud fold.

### `dressing-chrome-flora-clutter-1.png` — 4x4 grid
Cable vine, server scrap, med-bay curtain, loose conduit, neon hazard pylon, cracked holo-sign,
coolant puddle card, battery stack, drone husk, cable spool, polymer crate scatter, loose floor
panel, warning placard with abstract glyphs only, reactor canister, broken monitor, bonus wire nest.

### `dressing-core-wallhangs-1.png` — 4x4 grid
Realm-mix wall cards: fantasy banner/torch plate/shield rack/glyph plaque; gloom cobweb drape/
bone niche/crypt plaque/cursed mirror; chrome conduit plate/vent grille/status panel/warning strip;
plus four neutral hooks/chain plates.

## Prompt Header

Create a pixel-art DRESSING CARD sprite sheet on a solid chroma-key background. Ground-level /
eye-level view, front/side/three-quarter only, never top-down. Each card is a single placeable prop
or scenery cutout, fully visible, no floor plane, no cast shadow, no labels. Clean silhouette first;
realm palette and material identity must read at 50% zoom.

## Return Handling

Slice to alpha PNGs under `assets/sprites/dressing/`. Register with placement tags:
`primary: floor|wall-hang|blocker|light|focal|setPiece`, `location: interior|exterior|both`,
and station hints such as shrine, barracks, library, crypt, camp, market.
