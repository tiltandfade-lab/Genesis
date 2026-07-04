# ENV-WAVES — environmental model queue for the crawls (D → W → U)

```
type: system-spec
status: SPECCED (locked 2026-07-04; the queue Adam OK'd. Drop-order ruling: if the day runs
short, Wilderness + Urban SLIP — Dungeon wave lands first, it rolls every room)
consumer: Opus authoring executors + Haiku positioning review; orchestrator gates
```

All POLISH-WAVE-1 "Laws that bind every unit here" apply verbatim (whole-object modules,
ps1-sheet QA gate on your assigned port, size law, generated textures, INDEX.md upkeep).
Prop scale references the ~1.5u humanoid. Every piece gets a keyword-rule entry in
`THEATER_PROP_KEYWORD_RULES` (`src/engine/theater-data.js:227–361`) mapping its rolled noun
text — that entry is part of the piece, not a follow-up. Where a noun currently maps to a
WRONG part (shipwreck→cart), the new rule must win: order it ABOVE the old match.

## Wave D — Dungeon (10 pieces; source: dungeon-feature d150, rolls every room)

| piece | rolled noun(s) | notes |
|---|---|---|
| portcullis-gate | iron portcullis (rusted/wedged/bent/warped) | fills a no-seam gap; pairs with the built archway |
| bone-wall | bone-wall (skull-mortared/lattice/screen) | undead architecture; no seam today |
| drainage-grate | drainage-grate (raised/rusted/blocked) | currently renders as generic rubble |
| sarcophagus | sarcophagus (open/sealed/carved/cracked) | 8/150 — highest-frequency unbuilt |
| hanging-cage | hanging-cage (empty/swaying/bone-filled) | hangs from a chain; silhouette piece |
| refuse-pile | refuse-pile + crumbled-masonry | bespoke replaces the cuboid rubble-scatter read |
| wall-manacles | wall-manacles + rusted chains | wall-mounted; pairs with chain-drape language |
| gear-cluster | mechanical-gears (bronze/broken-tooth/frozen) | bespoke replaces the cuboid part |
| inscribed-obelisk | inscribed-obelisk + floating-monolith variant | emissive rune channel; float variant param |
| stagnant-pool | stagnant-pool (dark/rippling/algae) | BUILD as a flat disc + rim; if the Haiku review says it reads as a rug, demote to env-FX and record the verdict — QA decides, not the author |

## Wave W — Wilderness (12 pieces; source: wilderness-feature d300, rolls every leg) — SLIPS FIRST

standing-stone-circle (cluster spawn, 3–7 menhirs) · menhir/obelisk (weathered variants) ·
cairn · ruined-wall/palisade section (straight + corner) · watchtower-ruin (low-poly blockhouse)
· shipwreck-hull (replaces the scaled-cart mapping — rule must outrank `/cart/`) ·
leviathan-ribcage/giant-bones · crystal-outcropping (specular showcase) · dead/petrified tree ·
grave-mound/barrow · gallows-pyre-stocks (one module, three variants) · giant-artifact set
(spear/helm/throne at mythic scale — the "let it get MYTHIC" pieces)

## Wave U — Urban (5 pieces; source: urban-feature d100, rolls every segment) — SLIPS SECOND

fountain (tiered + wall variants) · forge-and-anvil station · market-stall/awning ·
signpost/notice-board/tavern-sign (one module, three heads) · barrel-keg cluster + crate-stack

## Out of scope

Micro-props (docs/MICRO-PROPS.md, spec-only) · stairs/balconies/scaffolding (board-generator
architecture, not props) · terrain features (fissures, trenches, mosaic floors — decal/board
problems) · new keyword nouns not listed here (log them, don't build them).

## Verification (per wave)

1. ⊗ RED-FIRST per piece: a fixture room/leg/segment whose feature text names the noun renders
   the OLD result (generic cover / wrong part / nothing) — capture it before the module lands.
2. New sheet set keys (`envd` / `envw` / `envu`) in ps1-sheet + INDEX.md; full-wave sheet render.
3. Haiku positioning review verdicts per piece (board-distance legibility is a named check —
   these are scenery, they must read at game camera, not just hero angle).
4. Keyword-rule coverage: `theaterPropForText(<noun text>)` returns the new part for every
   listed noun spelling; ordering beats stale matches (shipwreck test explicitly).
5. `python3 build/check-manifest.py` after the theater-data edit → RESULT: OK; full
   `dev/verify-*.mjs` sweep by exit code.
