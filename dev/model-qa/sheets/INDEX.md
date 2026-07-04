# Genesis Model Waves — Proof Sheet Index (2026-07-03 → 07-04 overnight program)

Every figure/prop is a bespoke whole-object landmark module in `dev/model-qa/creatures/`,
rendered here through the byte-faithful engine-PS1 surface (`ps1-sheet.html`: Bayer dither +
vertex-snap 96 + 1/3-res, grain default-on, specular on metal/glass). Live sheets need the
repo served on :5176 → `http://127.0.0.1:5176/dev/model-qa/ps1-sheet.html?set=<key>`.

**Pipeline per wave:** Opus authoring executors with a closed headless-capture render loop →
batched (≤3-wide, machine-resource law) Haiku positioning review + Opus repair workflow →
director gate on the sheet. 82 total pieces; every one passed QA.

## Sheets

| Sheet | Set key | Contents |
|---|---|---|
| [classes.png](classes.png) | `classes` (default) | fighter, barbarian, paladin, ranger, rogue, monk, cleric, druid, wizard, sorcerer, warlock, bard |
| [races.png](races.png) | `races` | gnome, halfling, dwarf, dragonborn, tiefling, half-orc |
| [npcs.png](npcs.png) | `npcs` | commoner, guard, shopkeep, noble, cultist, bandit |
| [cr0.png](cr0.png) | `cr0` | giant rat, goblin, kobold, skeleton, zombie, wolf, giant bat, gray ooze, giant spider |
| [cr1.png](cr1.png) | `cr1` | orc, gnoll, bugbear, ghoul, giant snake, harpy |
| [cr2.png](cr2.png) | `cr2` | ogre (Large), owlbear, minotaur, wight, gargoyle, werewolf |
| [cr5.png](cr5.png) | `cr5` | troll, hill giant (Huge), wraith, stone golem, **young dragon** |
| [icons.png](icons.png) | `icons` | mimic, animated armor, shadow, wyvern, fire elemental, earth elemental |
| [variants.png](variants.png) | `variants` | dire wolf, worg, hobgoblin, cult fanatic, giant wolf spider, veteran |
| [props.png](props.png) | `props` | pillar, broken pillar, brazier, statue, altar, well, archway+portcullis, containers, cart, table, throne, web mass, torch, candelabra, lantern post |
| [dragon-beauty.png](dragon-beauty.png) | — | Blender EEVEE beauty render of the flagship dragon |

## Size law (as shipped)
Small ~0.95u / disc r0.32 · Medium ~1.45u / r0.42 · big-Medium r0.48 · Large ~2.1u / r0.55
· dragon r0.62 · Huge ~2.7u / r0.68. Prop scale referenced to the ~1.5u humanoid.

## Polish backlog (logged at director gates; none blocking placeholder use)
- gray ooze reads slate-blue at board light — palette nudge toward grey
- giant rat snout slightly overhangs its disc edge
- dragonborn belt-knife catches too much light against rust scales
- giant snake strike-neck overhangs the disc (a physical mini would tip)
- harpy wings read thin at board distance despite full close-up feathering
- barbarian: softened chest patch reads as pale chip; rear axe-grip soft at hero angle
- warlock grimoire flirts with knife-read edge-on at the hero angle
- rogue reverse-grip dagger reads as sprouting from the hip at hero angle only
- wyvern haunch mass slightly lumpy at the game angle

## Next (per REFERENCE-DIRECTION §P1′)
1. Engine wiring: whole-object builders → BufferGeometry + material channels → figureMaterialFor
   → the shipped PSX pass (cuboids demote to fallback); lighting props anchor the rolled
   per-room light profiles.
2. `creatureId → builder` registry seam; palette-key material channels.
3. Down-state (tipped-piece) read check across the roster.
