# VQ2 World Looks — generation prompt set

Mode: built-in ImageGen. Each frame was generated as a separate 16:9 image; frame 16 was regenerated as a precise edit of frame 10 to prove scene continuity.

## Shared prompt contract

Every call included the frame's exact record and asset restrictions from `dev/model-qa/mock-gen/PACKET-VQ2-WORLD-LOOKS.md`, plus this photographed-diorama contract: contained tray/plinth in soft darkness; gentle approximately 20-degree downward perspective just above mini eye level; camera tight on the subject cluster plus one terrain ring; medium standee at 18–25% frame height; visibly flat 2D painted standees on compact dark plinths; dimensional low-poly terrain/architecture/props; one visible motivated source; dark + mid + one bright focus; tight 32–48-color palette; sparse negative space; no UI, text, top-down/flat-isometric view, vista, dense clutter, even exposure, 3D characters, glossy toy art, or cinematic effects.

Every call also quoted the figure canon verbatim:

> Visual language: mature, restrained, frightening where canonically appropriate — realistic
> dark-fantasy horror with a stylized triangulated low-poly twist. Large-faceted polygonal
> Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
> triangular planes. Use smaller facets only around face, eyes, joints, and critical equipment
> landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not World
> of Warcraft, not Baldur's Gate 3 cinematic glamour, not an MMO promotional render, a mobile
> game, a collectible toy, or a cartoon mascot.

## Per-frame deltas

1. `01-travel-grassland-daylit` — W-GRASS record; raking late-morning sun as the single bright focus; mid-value grass; black tray edge; PC/fire-ring/terrace triangle.
2. `02-travel-grassland-profiles` — one 2×2 contact sheet; identical W-GRASS geometry/camera; only daylit, overcast, moonlit, and dark rigs change; no labels.
3. `03-travel-swamp-moonlit` — W-SWAMP record; coiled partly submerged petrified-dragon hero silhouette; cold moon key and wet reflection; one PC.
4. `04-travel-desert-night-star` — W-DESERT record; fallen star is the sole visible source; one ring of amber falloff; all other dressing subordinate.
5. `05-travel-arctic-lavaflow` — W-ARCTIC record; cold overcast plate crossed by one hot diagonal lava ribbon; material boundary makes the juxtaposition intentional.
6. `06-wild-arrival-crossjunction` — W-ARRIVE record; tray silhouette itself is a four-way junction; raised center platform; ribcage hero; full PC with headroom.
7. `07-town-harborfront-street` — U-TOWN record; strictly `wall.glb`, `roof-gable.glb`, `road.glb`, `road-curb.glb`, `lantern.glb`, `cart.glb`; two facade planes maximum; Genesis material replacement.
8. `08-town-burning-building` — same street family as frame 7; one facade changes state; fire is the source; four crowd standees maximum; beads remain a trace.
9. `09-settlement-node-tray` — chrome “Garrison-Wife Town”; compact roof cluster around one route; one lit window; full PC and safe headroom; no invented landmark.
10. `10-kenney-dungeon-bridged` — D-ROOM record; strictly `room-small.glb`, `gate-door.glb`, `stairs.glb`; material replacement to limestone/iron/umber; one wall torch plus blue mushrooms.
11. `11-kenney-graveyard-gloom` — strictly `crypt.glb`, `gravestone-cross.glb`, `iron-fence.glb`, `pine-crooked.glb`, `lightpost-single.glb`, `lantern-glass.glb`; five-family minimum composition; sick lantern focus.
12. `12-beat-shop-open` — counter, exactly two shelves, one interior lamp, shopkeeper and PC; tight counter triangle; chrome palette.
13. `13-beat-long-rest` — strictly `tent.glb`, `campfire-pit.glb`, `bedroll.glb`; one seated PC; campfire focus; darkness ring instead of forest scenery.
14. `14-odd-glass-garden` — ODD-98; standard nature tree/plant silhouettes with smoky transparent-emissive regrade; one hero, six support pieces maximum; silica plate.
15. `15-odd-living-megastructure` — ODD-100; strictly `floor.glb`, `catwalk-straight.glb`, `cog-a.glb`, `building-a.glb`, `detail-tank.glb`; sunk terrain assembly; one coherent vein network.
16. `16-combat-in-room` — precise edit target: frame 10. Preserve room/camera/materials/bell/single torch/mushrooms/fog; replace entry PC with PC + `spr-fantasy-dire-wolf` + `spr-fantasy-skeleton`; add a subtle fading umber grid and nothing else.
