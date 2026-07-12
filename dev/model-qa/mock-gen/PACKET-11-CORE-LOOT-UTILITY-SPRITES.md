# PACKET-11 — CORE-3 LOOT + UTILITY SPRITES (item-get cards, pickups, affordances)

type: codex-packet
status: DRAFT (Fable, 2026-07-11 — fills inventory/readability gaps for fantasy, gloom, chrome)

## Rationale

The existing realm sprite sheets cover creatures/NPCs/items broadly, but the diorama loop also needs
small readable pickup and utility sprites: keys, tools, map fragments, quest clues, repair parts,
consumables, and the non-object sparkle affordance named in BW5 IA-4. These improve beauty and DM
clarity without forcing every pickup to become a full interactable model.

## Delivery Rules

Flat item-get / pickup sprites on chroma background. These are icon-like but still pixel-realistic in
realm material language. No perspective floor, no labels, no UI frame baked in. Use square cells.
Save to `ui-sketches/sprite-sheets/items/`.

## Sheets

### `items-core-utility-shared-1.png` — 5x5 grid
Sparkle affordance, noticed-secret glint, map scrap, wax seal, iron key, brass key, lockpick bundle,
small coin spill, ration packet, potion vial, bandage roll, chalk mark, rope coil, torch stub, oil
flask, repair needle, broken gear, empty hand marker, quest clue note, lantern lens, compass, gem
chip, bone token, numbered abstract tag, bonus generic charm.

### `items-fantasy-utility-1.png` — 5x5 grid
Rune key, mossy idol, temple coin, herb poultice, candle saint, carved oak token, pilgrim badge,
silver bell, spell page, fairy jar, blessed nail, green-glass vial, dragon-scale chip, old crown
fragment, oath ribbon, shrine bead, map knot, bone flute, moon seed, whetstone, wolf tooth, amber
die, brass astrolabe part, folded banner scrap, bonus relic shard.

### `items-gloom-utility-1.png` — 5x5 grid
Crypt key, black candle, bone rosary, moth charm, rusted scalpel, old blood note, grave coin, cracked
mirror shard, ash vial, coffin nail, funeral bell, curse tag, dead flower, eye-shaped locket, pall
cloth scrap, cold iron pin, omen card, skull bead, grave dust pouch, tarnished reliquary bit, hook
token, shroud stitch, pale mask chip, sealed confession, bonus wax-black ring.

### `items-chrome-utility-1.png` — 5x5 grid
Access chip, neon keycard, coolant ampoule, battery cell, broken optic, data wafer, med patch,
anti-nausea gum packet, drone lens, servo tooth, fiber cable coil, reactor badge, mag clamp,
stun-needle, chrome knuckle part, black-market implant, transit token, small holo-emitter, circuit
sigil, hazard tab, micro fuse, wrist display, smart dust vial, encrypted coin, bonus glowing screw.

## Prompt Header

Create a pixel-art ITEM SPRITE sheet on a solid chroma-key background, square grid, one distinct
object per cell. Flat icon readability, no floor plane, no cast shadow, no text or labels. The item
must read from silhouette and one high-value focal detail at 50% zoom. Realm palette and materials
must be clear but not noisy.

## Return Handling

Slice to `assets/sprites/items/`. Register as `pickup`, `quest-clue`, `consumable`, `currency`,
`repair`, or `affordance`. The sparkle affordance is explicitly non-mesh and is used by ambient
perception/secret reveal flows.
