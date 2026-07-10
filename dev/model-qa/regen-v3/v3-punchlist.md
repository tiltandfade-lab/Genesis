# REGEN-V3 punch list — 2026-07-10 gate results

## Missing sheets (codex choked before generating — rerun these prompts)
- cosmic.md sheets 10-24 (cosmic-large-v3-10 … cosmic-tiny-v3-24): 15 sheets, 72 sprites
- gloom.md sheets 6-8 (the whole VHS-horror expansion): 3 sheets, 34 sprites

## Style fail (regen with corrective line)
- lost-world-huge-v3-03.png — photoreal/painterly, no pixel grain (both cells)

## Subject misses (regen or accept)
- high-seas-tiny-v3-23 r1c1: 'silverfish trio' drew three fish-folk warriors, not insects
- frontier-tribal-enemies-v3-22 r2c1: dog-soldier drew a literal leashed dog, not the sash-staked warrior
- lost-world-large-v3-05 r1c2: belled crocodile has no bell
- cosmic-large-v3-07 r1c2: Penrose 'impossible cube' reads as an ordinary cube frame
- chrome-large-v3-11 r2c1: 'three-headed robot dog pack' = one cerberus (acceptable?)
- high-seas-large-v3-09 r1c1: coral hulk drew a walking ghost-ship creature (suits the slot?)

## Slicing risks (eyeball the cut sprites)
- cosmic-humanoid-v3-04 cell 'pink static/lightning humanoid': hot-pink body near the magenta key — check for eaten pixels
- theater-large-v3-12 'soldier column in fog': translucent fog fade may carry magenta fringe
- theater-humanoid-v3-07: codex packed rows 4/3/4 instead of the declared grid — cell alignment suspect, verify all 11 cuts
- lost-world-tiny-v3-14: faint off-chroma gridlines may leave hairline artifacts
- suburb-enemies-large-v3-05 UFO: tractor-beam light cone included in the cut

## Static-pose sprites (26 — tagged 'static-pose' in v3-sizing.json; usable but boring, regen opportunistically)
Concentrated in livestock sheets: ash-large-03 (all 4), ash-large-04 (3), fantasy-large-01 (all 4), fantasy-large-02 (2); singles: cosmic castle golem, coral golem, iron golem, steam golem, brass pope, TV-head, neighborhood thing, undead centurion, demon bull, lawman brute, high-seas kids x2. NOTE: several are constructs/uncanny subjects where stillness may be intended.

## Gate verdict
143/161 sheets delivered, 142 style-pass (99.3%), 650 sprites sliced to dev/sprite-sheets/incoming/v3/ with transparency + sizing + QA tags.