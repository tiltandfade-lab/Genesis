# MOCK-GEN PACKET 01 — target-frame references (the reference-model loop)

type: codex-packet
status: READY (paste-ready; Adam's codex window)
created: 2026-07-10 (Fable, delegated seat) — the loop Adam proposed: ChatGPT as our own
reference model. Mocks propose, engine laws dispose; specs extract STRUCTURE (layout, value
hierarchy, density, framing, UI placement), never pixels.

## How to run

One prompt per generation. For each frame: attach the listed files (real corpus art + the
current engine frame as the "real engine today" anchor), paste the prompt. Save arrivals to
`ui-sketches/mock-frames/mock-01-<slug>.png` (add `-take2` etc. for retries — additive law,
never overwrite). Aspect: request LANDSCAPE 16:9 in every generation.

## Standing prompt header (paste at the top of EVERY prompt below)

> You are producing a TARGET SCREENSHOT mock for a video game called Genesis — a solo TTRPG
> where an AI DM narrates and the battle view is a Wildermyth-style diorama: 2D pixel-art
> cutout standees standing in a 3D room of clean blocky prism architecture, gentle ~20°
> perspective camera, cutaway front walls, soft real lighting with cast shadows, the room
> floating as a diorama over a dark void. The attached pixel-art sprites are the game's REAL
> art — use them as literally as possible (do not restyle them; place them as flat standees).
> The attached engine screenshot shows the real renderer today — keep its construction, improve
> its composition. World surfaces are subtly textured, low contrast. Value law: every scene owns
> a dark, a mid, and ONE bright. Render at native pixel-art crispness, landscape 16:9.

## FRAME 1 — gloom crypt, mid-combat, full UI  `mock-01-gloom-combat`
Attach: `dev/battle-gate/dungeon-loop/loop-02-room.png` (engine anchor),
`assets/sprites/spr-fantasy-death-knight.png`, `assets/sprites/spr-fantasy-ghost.png`,
`assets/dressing/gloom-clutter-brokentombstone.png`, `assets/dressing/gloom-flora-witheredwillow.png`,
`assets/dressing/fantasy-painting-1.png`
Prompt: A gloom-realm crypt room mid-combat. Purple-black stone, one torch key light near a
broken tombstone set-piece, whisper of fog. The death knight standee faces the ghost standee
at melee range; a damage number "7" floats above the ghost in small crisp UI type. Bottom of
frame: a slim translucent chip strip (backdrop blur) with 4 unit chips — name + 3 HP pips
each, the acting unit's chip glowing gold, matching gold ring on the floor under the acting
standee. Small floating band tags "MELEE / NEAR / FAR" at the stage edges. A framed painting
hangs on the back wall. Persistent dark bloodstain decals on the floor from earlier rounds.
No other UI. The stage floats over void; front wall cut away.

## FRAME 2 — fantasy exploration, quiet room  `mock-01-fantasy-explore`
Attach: `dev/battle-gate/dungeon-loop/loop-03-room.png`,
`assets/sprites/spr-fantasy-dire-wolf.png`, `assets/dressing/fantasy-painting-3.png`,
any 2 fantasy flora cards from `assets/dressing/fantasy-flora-*.png`
Prompt: A fantasy-realm dungeon chamber, no combat — exploration beat. Warm amber torchlight,
sandstone prisms, a root-arch and ferns dressing the corners, the kraken painting hung on a
wall, a dire wolf standee prowling near a doorway, dust motes in the key light. NO combat UI
at all — instead a single narrow prose panel docked lower-third LEFT (translucent, elegant
serif) showing two lines of DM narration text. Composition frames the ROOM (exploration
framing): doorways visible as exits.

## FRAME 3 — chrome realm, neon combat  `mock-01-chrome-combat`
Attach: `dev/battle-gate/dungeon-loop/loop-01-room.png`,
`assets/dressing/chrome-clutter-drone-husk.png`, `assets/dressing/chrome-clutter-cctv-eye.png`,
`assets/dressing/chrome-clutter-brokenscreen.png` + 2 chrome flora cards
Prompt: A chrome-realm corridor hub mid-combat — Warriors×TMNT×RoboCop street-tech. Cool
blue-steel prisms, ONE neon accent color (cyan) as the bright, broken screens flickering,
a drone husk smoking on the floor. Two humanoid standees in cover behind crates, muzzle-flash
effect card. Same bottom chip strip + band tags as the gloom frame (one UI grammar across
realms). Neon rim-light carries silhouettes — no dark outlines on chrome sprites.

## FRAME 4 — dialogue beat with portrait (UW4 preview)  `mock-01-dialogue`
Attach: `dev/battle-gate/dungeon-loop/loop-03-room.png`,
`assets/sprites/spr-fantasy-dwarven-town-guard-captain-elderly-dwarf-decades-on-the-wall-trusted-by-everyone.png`
Prompt: The same fantasy chamber, dialogue beat. An elderly dwarf guard-captain standee faces
the player's knight standee. Lower-third dialogue panel over the diorama: LEFT side a painted
bust portrait of the dwarf (shoulders-up, richer rendering than the sprite but same palette),
name chip "CAPTAIN HELDRA", then one line of spoken dialogue in clean UI type. Panel is
translucent dark with a thin gold rule. The diorama dims slightly behind the panel (focus
pull). No combat UI.

## FRAME 5 — the death moment  `mock-01-death`
Attach: `dev/battle-gate/dungeon-loop/loop-04-room.png`, `assets/sprites/spr-fantasy-death-knight.png`
Prompt: The instant the player character dies in a gloom vault. The knight standee tipped
flat on the floor (corpse card), desaturating, its contact blob still under it. All UI fades
to 20% except one centered line in large serif: "The Vale takes you back." Torches gutter to
embers; the scene's one bright is a cold spirit-light rising off the corpse. Grim, not gory.

## FRAME 6 — the shop  `mock-01-shop`
Attach: `dev/battle-gate/dungeon-loop/loop-03-room.png` + 3 objects cards from
`assets/dressing/fantasy-objects-*.png`
Prompt: A fantasy village shop interior as a small diorama room — counter as a prism, shelf
dressing cards, a merchant standee behind the counter. RIGHT third of frame: a translucent
inventory panel — 6 item rows (icon square + name + price in gold numerals), purse total at
top, one row highlighted. The diorama stays live behind the panel (not a full-screen menu —
the tabletop never disappears).

## FRAME 7 — quiet camp beat  `mock-01-camp`
Attach: `dev/battle-gate/dungeon-loop/loop-02-room.png`, `assets/sprites/spr-fantasy-dire-wolf.png`,
1 fantasy flora card
Prompt: A rest/camp beat in a dungeon pocket room. Campfire object card lit at center (the
scene's one bright), bedroll dressing, the PC knight standee seated-ish beside it, the tamed
dire wolf curled nearby, long soft shadows, ember motes rising. Minimal UI: three small
translucent action chips bottom-center: "Rest until dawn · Keep watch · Break camp".

## FRAME 8 — the finale room  `mock-01-finale`
Attach: `dev/battle-gate/dungeon-loop/loop-04-room.png`, `assets/sprites/spr-fantasy-death-knight.png`,
`assets/dressing/gloom-clutter-brokentombstone.png`, `assets/dressing/fantasy-painting-4.png`
Prompt: A dungeon FINALE room — the deepest chamber, staged like a set piece. Bigger room,
raised dais, the boss standee (death knight) at the dais center under the strongest key light
in the dungeon, tombstone set-dressing radiating out, the tarrasque painting looming on the
back wall as foreshadowing. The player's party (2 standees) small at the door — scale of
threat read through staging, not sprite size. Combat UI present but the composition is the
point: dark → mid → the boss owns the bright.

## Return handling (orchestrator)

Arrivals → `ui-sketches/mock-frames/` → Fable reads all takes → per-frame structure notes
(what the mock proposes that the engine lacks; law violations flagged and discarded) →
next-wave specs cite `mock-01-<slug>` by name → VP8 gate becomes the triptych: real frame |
Wildermyth | mock target. Iterate: PACKET-02 re-briefs any frame whose mock fought a law.
