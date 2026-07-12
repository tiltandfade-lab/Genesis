# PACKET-VQ — BATTLE-SCENE VISION QUEST (10 target frames, 3 realms × 3 environments)

**Type:** MOCK-GEN reference-frame packet (mocks-propose-laws-dispose). This is NOT production art —
it is a set of 10 *target frames* that show what a Genesis **battle scene** should look like in each of
the three flagship realms across three environment types. Claude reads what you render, extracts laws,
and cites your frames by name in the next build wave. Render honestly; surprise us where the grammar
allows, but stay inside the bounds below.

**What we're trying to learn:** the engine renders DUNGEON interiors well today; URBAN and WILDERNESS
battle dioramas are declared in the art direction but not yet built. We want to see how a battle reads
in those settings — composition, how the realm identity survives the setting change, what dressing and
terrain sell "urban" vs "wilderness," and where the achievable grammar strains. Your frames become the
spec references.

---

## THE ACHIEVABLE GRAMMAR (stay inside this — "what can actually be done")

Genesis is **ONE visual channel: a photographed miniature diorama.** A battle is painted minis on a
small sculpted tray, shot like a tabletop. Every frame you render MUST obey:

1. **The diorama, not a screenshot of a videogame world.** A contained tray/plinth of terrain sitting
   in soft darkness, shot from a **gentle ~20° downward perspective** (a hair above eye-level on the
   minis — NOT top-down, NOT isometric-flat). Think "someone photographed a beautifully painted D&D
   board," not "a render of a place."
2. **Frame the ACTION CLUSTER, not the room.** The camera tightens on the knot of combatants + one
   ring of terrain around them. Empty room beyond falls into shadow. A medium mini reads ~18–25% of
   frame height.
3. **Minis are 2D painted sprites standing on small dark plinths** with a soft shadow pool beneath —
   NOT 3D character models. Terrain/architecture/props ARE dimensional (low-poly boxes + extruded
   silhouettes with painted faces). So: flat painted figures, real 3D stage.
4. **Diegetic light, darkness is a feature.** Light comes from a VISIBLE in-world source (torch,
   lamp, lava, neon sign, campfire, moon/sun). Ambient is only enough to read the minis; beyond a
   source's reach it goes dark. One scene = a couple of warm/colored source pools in shadow. No
   floating light with no source.
5. **VALUE LAW: hue is identity, value is composition.** Each frame = mostly dark, a mid band, and
   ONE bright focus (usually the light source or the key mini). Don't light it flat/evenly.
6. **Per-realm outline + palette** (below). Each realm quantizes to a tight 32–48 color palette.
7. **The roll is a palette — rooms are mostly BARE.** A battle tray carries ONE clear theme prop +
   sparse clutter, not a cluttered diorama. Negative space is correct.

Out of bounds (do NOT render): photoreal lighting, cinematic FX, 3D character models, top-down or
flat-ortho camera, a fully-lit evenly-exposed scene, dense clutter, UI/HUD overlays.

---

## THE THREE FLAGSHIP REALMS (identity must survive every environment)

- **FANTASY** — classic sword-and-torch adventure. Warm umber/stone, torchlight. **Outline law:
  selective umber** (soft dark line only on shadow edges). Touchstone: painted Warhammer-quest board.
- **GLOOM** — horror/undead, funereal. Cold desaturated, deep blacks, one sick-green or candle-amber
  accent. **Outline law: full-dark** (every form hard-lined). Touchstone: a graveyard at midnight.
- **CHROME** — cyber/industrial. Cool metal + a hot neon accent (magenta/cyan). **Outline law:
  neon-rim, no black line** (forms edged by their own emissive rim-light). Touchstone: a rain-wet
  back-alley under a sign.

---

## THE THREE ENVIRONMENTS (as diorama types)

- **DUNGEON** — an interior room tray: stone/panel walls on 2–3 sides, a floor, torch/lamp/lava light
  seeds, columns as cover. (This one the engine does today — render it as the *quality bar*.)
- **URBAN** — a settlement/street tray: building faces, a paved/grated ground, a doorway or stall, a
  street-level light source (lamp-post, neon sign, window glow). A slice of a street, not a whole city.
- **WILDERNESS** — a terrain-plate tray: sculpted ground (grass/mud/rock/snow), a natural feature
  (boulder, tree, ridge, water edge), open sky reading as the light source (sun/moon/overcast). A
  patch of ground, not a vista.

---

## THE 10 FRAMES (name the REAL assets; all creatures below exist as cut sprites in the roster)

Party in every frame = a small PC band (2–4): e.g. a **Knight/Guard** (armored front-liner), a robed
caster, a light skirmisher — painted hero minis. Foes + dressing are realm-specific below.

| # | realm | environment | foes (real cut sprites) | key dressing / terrain (real slugs + kind) | light source | what it tests |
|---|---|---|---|---|---|---|
| 1 | fantasy | dungeon | Ogre + 2 Skeletons | fantasy-flora-mossboulder, fantasy-flora-ivywall; stone columns as cover | wall torches | the quality bar — do our current best |
| 2 | fantasy | urban | 3 Bandits + Guard | market stall, timber building face, fantasy-flora-herbbundle | hanging lantern | fantasy identity on a street |
| 3 | fantasy | wilderness | Dire Wolf pack (3) | fantasy-flora-oak, fantasy-flora-mossboulder, fantasy-flora-brambleblocker; dirt+grass plate | low sun through trees | warm outdoor daylight that still reads as a diorama |
| 4 | gloom | dungeon | Wight + 3 Zombies | gloom-flora-bonelichen, gloom-flora-graveturf; cracked crypt stone, a tomb slab | single guttering candle | full-dark outline + darkness-as-feature at its purest |
| 5 | gloom | urban | Ghoul + 2 Cult Fanatics (use Bandit/Assassin sprites) | boarded shopfronts, gloom-flora-witheredwillow, wet cobbles | one sick-green street lamp | horror in a dead town — one cold accent in black |
| 6 | gloom | wilderness | 2 Wraiths + Skeleton | gloom-flora-deadhedge, gloom-flora-cattails, gloom-flora-mournvine; fog, a leaning grave marker | thin moonlight | moonlit marsh — can the terrain plate hold dread |
| 7 | chrome | dungeon | Animated Armor + 2 Assassins | chrome-flora-datamoss, chrome-flora-wireweed; metal panel walls, server-rack cover | overhead strip light + magenta seam glow | neon-rim outline in an interior; cool metal + hot accent |
| 8 | chrome | urban | 3 Assassins + Gargoyle (drone) | chrome-flora-neonlily, chrome-flora-vendingivy; alley building faces, a vending unit | a big neon sign (cyan) + puddle reflection | THE chrome money shot — rain-wet neon alley battle |
| 9 | chrome | wilderness | Animated Armor + 2 Gargoyles | chrome-flora-solarvine, chrome-flora-antennagrass, chrome-flora-scraptree; cracked concrete + weeds plate | overcast sky + a distant beacon | tech-overgrowth "wilderness" — does the realm survive with no neon night |
| 10 | **FLAGSHIP** — gloom | dungeon (boss) | a single large threat: **Gargoyle** or **Ogre** as a mini-boss, 2 Skeleton adds | a raised dais tier, gloom-flora-bonelichen, a broken column | one shaft of amber from above + candle | the hero frame: a boss beat, the action-cluster framing at full drama |

---

## HOW TO DELIVER

- **10 images**, one per frame, labeled by number + realm + environment. 4:3 or 16:9, landscape.
- For each frame, one or two lines: **what you leaned into, and where the grammar fought you** (e.g.
  "urban needed a building face the current kit doesn't have," "wilderness daylight wanted more
  ambient than the diorama likes"). That friction is the most valuable thing you can give us.
- Stay inside THE ACHIEVABLE GRAMMAR above. If a frame tempts you past it, render the in-bounds
  version AND note what the out-of-bounds version would have added — don't just break the rules.
- Realm identity is the pass/fail: a chrome frame must not read as fantasy, a gloom frame must not
  read cheerful, even when the environment changes.

**Deliver to:** `ui-sketches/mock-frames/` (drop the 10 images + a short notes block). Claude will read
them, extract the laws each frame proposes, and cite them by number in the urban/wilderness build specs.
