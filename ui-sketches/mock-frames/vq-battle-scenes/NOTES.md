# PACKET-VQ Battle Scene Vision Frames

Generated for `dev/model-qa/mock-gen/PACKET-VQ-BATTLE-SCENES.md`.

Mode: built-in image generation, project-bound outputs copied into this folder.

Claude implementation handoff: read `CLAUDE-IMPLEMENTATION-HANDOFF.md`. It explains the intent behind
the frames and proposes a fully procedural route from the current Three.js theater to the target,
including engine changes, sprite/texture generation and folding, shot composition, rendering, staged
milestones, and automated visual acceptance gates. No human graphics-production step is assumed.

Walk-system amendment: read `WALK-NATIVE-DIORAMA-CONTRACT.md`. The stored walk segment is canonical;
SpatialPlan, tray, room shell, and ShotPlan are projections. Sparse frames selectively objectify
rolled fields but never discard, reroll, or replace them. Over-budget fields may enter a
source-referenced staging reserve whose authority remains the walk record.

Shared target grammar across all frames:
- A Genesis battle is a photographed miniature diorama, not a videogame screenshot.
- Terrain, walls, props, and trays are dimensional; combatants are flat painted standee sprites on dark plinths.
- Camera is a gentle about-20-degree downward tabletop view, cropped to the action cluster plus one ring of terrain.
- Each frame should read as mostly dark, one mid band, and one bright diegetic focus.
- Sparse is correct. The roll is a palette; the room is not a manifest.

## Packet 10

1. `01-fantasy-dungeon.png` - Leaned into the current quality bar: stone, torch pools, mossboulder/ivy, Ogre plus Skeletons. Friction: two torches make the room prettier but slightly weaken the "one bright focus" law.
2. `02-fantasy-urban.png` - Leaned into a small street tray with timber face, stall, hanging lantern, and bandit standoff. Friction: urban wants architectural height, which can pull the crop away from the action cluster.
3. `03-fantasy-wilderness.png` - Leaned into oak, bramble, mossboulder, low sun, and wolf-pack silhouettes. Friction: wilderness daylight tries to become scenic and ambient; the tray edge and plinths have to keep it tabletop.
4. `04-gloom-dungeon.png` - Leaned into candle-centered crypt darkness, hard outlines, tomb slab, and undead ring. Friction: gloom readability needs just enough fill to avoid losing sprites while still staying mostly black.
5. `05-gloom-urban.png` - Leaned into dead-town wet cobbles, boarded fronts, withered willow, and a single green lamp. Friction: shopfront detail competes with the action unless the light pool stays tight.
6. `06-gloom-wilderness.png` - Leaned into moonlit marsh, cattails, grave marker, dead hedge, and cold reflections. Friction: moon/sky cues help the light source but flirt with "vista"; the implementation should treat sky as a grade, not a background scene.
7. `07-chrome-dungeon.png` - Leaned into metal panel walls, server-rack cover, datamoss/wireweed, strip light, and magenta seam glow. Friction: chrome rim light makes sprites sing, but can tip toward sci-fi render unless bases/tray remain explicit.
8. `08-chrome-urban.png` - Leaned into the money shot: rain-wet neon alley, vending unit, puddle reflection, cyan sign, magenta edges. Friction: neon signage can become too dominant; keep it a single source, not a city.
9. `09-chrome-wilderness.png` - Leaned into cracked concrete, scraptree, beacon, weeds, and overcast chrome identity without night-neon. Friction: overcast wants flat value; the beacon and rim accents carry realm identity.
10. `10-flagship-gloom-boss.png` - Leaned into a boss beat: dais, broken column, amber shaft, candles, large Gargoyle/Ogre threat, Skeleton adds. Friction: the dramatic shaft is close to cinematic; keep it diegetic and physically sourced.

## Extra 10 Development Targets

11. `11-fantasy-dungeon-occlusion-fade.png` - Target for occlusion-fade over camera-avoidance. The near wall fades away while the action cluster stays readable; this is one of the clearest images for the next renderer pass.
12. `12-gloom-octagon-room-shape.png` - Target for real room shapes and structural terrain. The octagonal room, dais, and sunken ring show why "not a rectangle" is tactical and beautiful, not decoration.
13. `13-chrome-stateful-door-lever.png` - Target for stateful interactables. The half-open/broken door and flipped lever read as placed scene citizens, not prose-only rolls.
14. `14-fantasy-urban-cover-lanes.png` - Target for tactical readability without UI. The market stall and wall-adjacent props define cover and lanes; friction is that the clear center can feel empty unless the lighting carries composition.
15. `15-gloom-corpse-trace-persistence.png` - Target for trace persistence. A toppled corpse card, bone scatter, and blood/scuff decals show how the table remembers; this intentionally pushes the grim lane and may need tone tuning.
16. `16-chrome-material-condition-decals.png` - Target for material and condition overlays. Wet stain, rust, scorch, and base metal all change the scene while staying sparse.
17. `17-fantasy-wilderness-exterior-light.png` - Target for outdoor source-light discipline. Campfire plus dusk fill solves "wilderness but not flat daylight."
18. `18-gloom-wilderness-fog-readability.png` - Target for fog as atmosphere, not a blanket. The fog stays low; silhouettes, plinths, and hard outlines remain readable.
19. `19-fantasy-dungeon-terrain-tiers.png` - Target for structural terrain tiers. Dais, pit, steps, and darker side faces make elevation legible without a grid overlay.
20. `20-chrome-terrain-change-breach.png` - Target for `terrain_change` and improvised stage effects. The collapsed tile reads as a clean table state with rubble and rim-lit void, not as graphical corruption.

## Architecture Takeaways

- Current repo direction has moved past the older pure FFT/PS1 board idea toward the newer `GRAPHICS-ENGINE.md` / `TABLETOP-VISION.md` rule: flat cutout standees in dimensional miniature trays, with soft lighting and action-cluster framing.
- The ugly-map loop is likely less about adding more art and more about enforcing composition laws: one active room/tray, sparse curated props, one light focus, visible tray edge, and value hierarchy before palette.
- Sprite glitches should be attacked as integration problems: plinth/base discipline, alpha purity, no world shader on sprite pixels, soft contact shadows, and rim/outline rules per realm.
- The next high-leverage visual build targets are frames 11, 12, 13, 18, and 20: occlusion fade, real room shape, stateful objects, fog readability, and clean terrain mutation.
