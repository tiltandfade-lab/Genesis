# PACKET-VQ2 — WORLD-LOOKS VISION QUEST (16 target frames: travel, town, dungeon, staging beats, odd rolls)

**Type:** MOCK-GEN reference-frame packet (mocks-propose-laws-dispose). NOT production art — these are
*target frames* Claude reads, extracts laws from, and cites by name in the ENV/EXTERIOR, TOWN-TRAY, and
STAGING-BEATS build waves. Render honestly; surprise us where the grammar allows; stay inside the bounds.

**What we're trying to learn (this packet exists to solve problems we do NOT have solutions for):**
PACKET-VQ answered "what does a *battle* look like." This packet answers "what does the *rest of the
game* look like." The play-lens audit (dev/play-lens/ledger.md, run pl1-002 — real bot-play screenshots
of the actual engine) measured the gap:

- **Travel legs render as an empty dark tile plane** — all 6 legs, no terrain, foliage, sky, path, or PC
  token (pl-003..009). The four light profiles exist in the pipeline but are pixel-identical outdoors.
  We do not have a daytime look. We do not have ANY wilderness look.
- **No town scene exists** — the settlement tray shows a random prop cluster, no buildings/street/NPCs
  (pl-002), and the camera clips the PC's head.
- **State beats have no staging** — shop-open, shop-closed, long-rest, dungeon-complete all render the
  same lone idle figure on black (pl-023..026). Day→night changes only as sidebar text.
- **Arrival renders as a single ellipse on black** (pl-010).
- **Combat drops the room** — the fight stages on a bare grid floating in void, losing the place the
  player just explored (pl-018..021).
- **Dungeon interiors are the near-solved case** (pl-022 is the quality bar) but exposure crushes half
  of most frames to illegible black and blows sources to white.

Each frame below is pinned to a REAL rolled walk record (§5 — actual output of the production rollers,
unedited) and to REAL assets on disk (§4). Project the record; don't invent a level.

---

## 1. THE ACHIEVABLE GRAMMAR (unchanged from PACKET-VQ — stay inside it)

Genesis is **ONE visual channel: a photographed miniature diorama.** Every frame MUST obey:

1. **The diorama, not a screenshot of a videogame world.** A contained tray/plinth of terrain sitting
   in soft darkness, shot from a **gentle ~20° downward perspective** (a hair above eye-level on the
   minis — NOT top-down, NOT isometric-flat). "Someone photographed a beautifully painted D&D board."
2. **Frame the SUBJECT CLUSTER, not the room.** Camera tightens on the beat's subject (the PC token,
   the shop counter, the campfire, the feature) + one ring of terrain. A medium mini reads ~18–25% of
   frame height. Empty tray beyond falls into shadow.
3. **Figures are 2D painted sprites standing on small dark plinths** with a soft shadow pool beneath —
   NOT 3D character models. Terrain/architecture/props ARE dimensional (low-poly boxes + extruded
   silhouettes with painted faces). Flat painted figures, real 3D stage.
4. **Diegetic light, darkness is a feature.** Light comes from a VISIBLE in-world source (torch, lamp,
   campfire, moon/sun/sky, neon, lava, glowing flora). No floating light with no source.
5. **VALUE LAW: hue is identity, value is composition.** Each frame = mostly dark, a mid band, and ONE
   bright focus. Don't light it flat/evenly. (§6 P-A asks how DAYLIGHT can obey this — that tension is
   the single most valuable thing this packet can solve.)
6. **Per-realm outline + palette**, quantized to a tight 32–48 color palette. FANTASY = warm
   umber/stone, selective-umber outline. GLOOM = cold desaturated deep blacks + one sick accent,
   full-dark outline. CHROME = cool metal + hot neon accent, neon-rim outline.
7. **The roll is a palette — trays are mostly BARE.** ONE clear theme prop + sparse clutter. Negative
   space is correct. Per the walk-native contract: *"Every arrow after the stored walk is a projection.
   None may invent or reroll content."* — dress ONLY from the pinned record's fields.

Out of bounds: photoreal lighting, cinematic FX, 3D character models, top-down or flat-ortho camera,
fully-lit evenly-exposed scenes, dense clutter, UI/HUD overlays, vistas (a travel tray is a patch of
ground on a table, never a landscape painting).

## 2. FIGURE REGISTER (docs/ART-DIRECTION-CANON.md — verbatim, per the decision-capture rule)

Any figure appearing in a frame must read as one of our canon sprites. The governing laws, quoted:

> 1. **Silhouette law.** Wide VARIETY of silhouettes across a wave — but the house bias is **lanky**:
>    longer limbs, rawboned frames, weight carried in posture not bulk. Girth is **diegetic, never
>    default** […]
> 2. **Base law.** Creatures and animals build on a **compact, generally forward-facing support
>    region** — never a wide sprawling stance. […] The figure must sit a standee base without the
>    silhouette fighting it.
> 3. **Style zone.** Adult register, always. **Realistic fantasy horror with a stylized triangulated
>    low-poly twist.** NOT World of Warcraft styling; NOT Baldur's Gate 3 cinematic glamour.

And for surface marks (blood, moss, scorch, grime) the decal exemption, quoted:

> Decals […] are rendered as **naturalistic organic surface marks**: matte, irregular natural edges,
> realistic stain/spread behavior for the material […] NO triangulation, NO polygonal planes, NO
> faceted geometry of any kind on a decal.

## 3. WHAT THE ENGINE RENDERS TODAY (calibrate against these before you render)

Look at the real frames first — they are the floor you're lifting from and the ceiling you must respect:

- `dev/play-lens/run-pl1-002/pl-004-scene-travel-leg-2.png` — the travel-leg void (the problem).
- `dev/play-lens/run-pl1-002/pl-002-scene-settlement-17.png` — the non-town (the problem).
- `dev/play-lens/run-pl1-002/pl-022-scene-combat-end.png` — the current BEST frame (protect this).
- `dev/play-lens/run-pl1-002/pl-024-scene-shop-open.png` — a "staged" beat today: one figure on black.
- `dev/battle-gate/env1-profiles/env1-wilderness-*.png` — the four light profiles as they exist: a bare
  plate under a recolored sky. The plumbing works; there is nothing to light.

## 4. REAL ASSETS (name these; do not invent asset types we don't have)

- **Figures — the newest faceted sprite wave** (branch `codex/faceted-f1-consolidation`,
  `assets/sprites/`, 896 cut magenta-key standees + the F2–F15 admit harvest in
  `dev/model-qa/faceted-sheets/`). Use real slugs where a named creature/NPC appears, e.g.
  `spr-fantasy-dire-wolf`, `spr-fantasy-skeleton`, `spr-fantasy-bandit-captain`, and the long-slug
  NPCs (e.g. `spr-fantasy-elven-archivist-keeper-of-a-library-older-than-the-town-around-it`).
- **The Kenney donor corpus** — **16 CC0 packs, ~1,752 GLBs**, landed on branch
  `codex/kenney-mesh-audit` (`assets/models/kenney-*/`; audit law in `docs/KENNEY-MESH-AUDIT.md` on
  that branch: full packs are a "local vocabulary reserve"; admission classes DIRECT_MODULATED /
  CHASSIS / PART_DONOR; "normalization, sockets, Genesis materials, and canonical visual QA before
  runtime use"). Master carries only the first three landings; NOTHING is engine-wired yet. The kits,
  by the environment they serve:
  - **Town/urban:** `kenney-fantasy-town-kit` (167 — modular walls/roofs/windows, road system,
    fountain set, cart, lantern, hedges, banners, chimneys), `kenney-building-kit` (79),
    `kenney-brick-kit` (296), `kenney-furniture-kit` (140), `kenney-food-kit` (200 — market/shop
    dressing).
  - **Wilderness:** `kenney-nature-kit` (329 — trees, rocks, terrain pieces), `kenney-survival-kit`
    (80 — camp: tent, fire, bedroll-tier props), `kenney-pirate-kit` (72 — coastal).
  - **Dungeon/interior:** `kenney-modular-dungeon-kit` (39), `kenney-mini-dungeon` (25),
    `kenney-modular-cave-kit` (40), `kenney-castle-kit` (76), `kenney-retro-fantasy-kit` (105).
  - **Chrome/industrial:** `kenney-factory-kit` (143), `kenney-city-kit-industrial` (25).
  - **Gloom:** `kenney-graveyard-kit` (~92 — crypts, gravestones, iron fences, lightposts, pines).
- **Realm flora/prop sprites already in the roster**: `fantasy-flora-{oak,mossboulder,ivywall,
  brambleblocker,herbbundle}`, `gloom-flora-{bonelichen,graveturf,witheredwillow,deadhedge,cattails,
  mournvine}`, `chrome-flora-{datamoss,wireweed,neonlily,vendingivy,solarvine,antennagrass,scraptree}`.
- **Light profiles** (the four that exist in the pipeline): `daylit`, `overcast`, `moonlit`, `dark`.

## 5. REAL WALK OUTPUT (unedited production rolls — every frame projects one of these)

These are actual `rollWildernessWalk` / `rollDungeonWalk` / `rollUrbanWalk` records (2026-07-14,
unseeded). Note `light: null` throughout — the profile is unwired at roll time; that's finding #8.

**W-GRASS** (travel leg, Grassland): biomeDesc "Sweeping plains, trackless steppes, and tall-grass
savannas." · footing "Deadfall / Rotted Logs / Fallen Pillars" · feature "Terraced Slopes: Earth
naturally shaped like giant stairs — three 10' wide steps" · signOfPassage "Overgrown Camp: an old fire
ring with new grass sprouting through the ash" · dressing "A patch of brightly colored moss that mimics
the pattern of a starry sky (Scorched)" · atmo "breeze, slight, damp".

**W-SWAMP** (travel leg, Swamp): biomeDesc "Fetid bogs, flooded marshes, and weeping willow mires." ·
footing "Brown Mold" · feature "Petrified Dragon: a wyrm turned entirely to stone — 30' wide, 50' long,
20' high" · signOfPassage "Gnawed Bark: trees stripped at waist height, marks weathered grey" · dressing
"A broken compass that always points to the nearest character (Revered / Arranged)" · atmo "acrid smoke
smell".

**W-DESERT** (travel leg, Desert): biomeDesc "Arid sand dunes, sun-baked salt flats, or rocky
badlands." · footing "Scattered Twigs / Driftwood" · feature "Fallen Star: a chunk of glowing white-hot
rock — 10' diameter" · signOfPassage "Shed Antlers / Horns" · dressing "A glass jar containing a weird
bit of flesh floating in preserving fluid (Scorched)" · encounter Discovery.

**W-ARCTIC** (travel leg, Arctic): biomeDesc "Frozen wastes, sweeping glaciers, and bitter tundra." ·
footing "Deep Snow Drifts / Piled Ash" · feature "Lava Flow: sluggish, glowing river of molten rock —
10' wide, 40' long" · signOfPassage "Slime Trail (Crusted)" · dressing "A puddle that smells strongly of
fresh pine (Flickering / Phasing)".

**W-ARRIVE** (wilderness arrival, Desert): areaType "80' x 80' Cross-Junction (30' wide)" · boundaries
"Steep 10-foot earthen banks" · side "20' wide paths at all four ends; a 20'x20' raised platform at the
intersection" · feature "Gargantuan Ribcage: bones of a mythical beast — 20' wide, 40' long, 15' high" ·
dressing "A massive, hollow bone that whistles like a flute in the breeze (Overgrown)".

**D-ROOM** (dungeon room, The Ruin S2): areaType "Small Octagon" · dims "20' x 20'" · side "10' x 10'
attached square entryway; each of the eight wall faces bears a faint carved symbol" · lighting
"Fog-Filtered — a low fog hugs the floor like spilled milk" · feature "Mushroom Colony: glowing blue
stems form a loose stand in the center — 5'×5', 2' high, dim light 10' radius" · object "Bell on a
string — tongue removed, silent signal" · scene "This room changed purpose at some point."

**U-TOWN** (urban walk setup, The Processional): type "Harborfront" · atmosphere "Shipping / docks" ·
skin "Rain-Soaked Stone — alleyways become shallow streams; crossings matter" · motif "Tools of the
Trade: murals of hammers, keys, scales, quills (Pristine)" · catalyst "A merchant consortium declares
the mayor unfit and moves to overthrow him". Segment S3: segType "The Burning Building" · dressing
"Glass beads spilled like tiny marbles (Decayed)" · encounter Problem.

**ODD-98 / ODD-100** (Travel Biome d100 oddball tail — real rollable rows, quoted): 98 "The Glass
Garden: transparent flora that tinkles like chimes; ground is literal silica." · 100 "The Living
Megastructure: terrain made of ancient, pulsing machinery covered in bioluminescent 'veins.'"

**BREACH-CHROME** (Walk Breach — Wilderness, real row): "The Fallen Field" — a buried metal colossus;
physics `techWorks`; entry: ambush.

## 6. THE UNSOLVED PROBLEMS (what your frames must attack)

- **P-A · DAYLIGHT vs THE VALUE LAW.** A daylit grassland cannot be "mostly dark" — or can it? Options
  we can't choose between without seeing them: sun as the ONE bright focus with terrain in mid-values
  and the tray edge falling to black; hard raking golden-hour light; cloud-shadow pooling; the "photo
  studio" answer (a brightly lit tray in a dark room). Show us a daylight that is unmistakably DAY yet
  still composed. This is the wave-blocking problem.
- **P-B · THE KENNEY BRIDGE.** ~1,752 CC0 GLBs are flat-shaded pastel low-poly; the house register is
  painted miniature, quantized palette, adult horror. Can Kenney geometry read as OURS with only
  engine-side treatment (palette regrade, texture grain, outline pass, weathering decals) — or do the
  meshes need generated face paint-overs (the CHASSIS admission class)? Render the bridged result,
  never the raw kit. This is THE gating question for the whole corpus: solve it once, unlock 16 packs.
- **P-C · TOWN GRAMMAR AT TRAY SCALE.** The fantasy-town kit gives us full modular building vocabulary
  — the danger flips from "no assets" to "too many": a kit-built street wants to become a city
  screenshot. What is the MINIMUM street-slice (how many building faces, what ground, what one light)
  that reads "you are in a town" while staying a photographed miniature? Which kit families earn a
  place on the tray (roofs? fountain? cart?) and which stay in reserve?
- **P-D · STAGING-BEAT ECONOMY.** Shop-open, shop-closed, long-rest, arrival — beats that today render
  as one figure on black. Each needs a readable stage from a HANDFUL of props (the roll is a palette).
  What's the minimal prop-set + light per beat that says what the sidebar text says?
- **P-E · ODD ROLLS WITHOUT NEW ART.** The d100 tail and breach tables roll The Glass Garden / The
  Living Megastructure / a buried colossus. We will never have bespoke kits for these. How far do
  regraded standard pieces + emissive accents + one hero silhouette get us before the frame reads as
  a rendering bug instead of a wonder? Where's the floor?
- **P-F · COMBAT KEEPS THE ROOM.** The explored room (D-ROOM) must persist under the combat grid
  instead of a void. Show the same room in exploration dress and mid-combat, same camera family.

## 7. THE 16 FRAMES

| # | file slug | record (§5) | realm | light | build from (§4) | what it tests |
|---|---|---|---|---|---|---|
| 1 | `01-travel-grassland-daylit` | W-GRASS | fantasy | **daylit** | terrain plate, terraced-slope tiers, fire-ring prop, nature-kit grass/rock silhouettes regraded, PC standee walking | **P-A** — the daytime look |
| 2 | `02-travel-grassland-profiles` | W-GRASS (same tray ×4) | fantasy | daylit / overcast / moonlit / dark, 2×2 contact sheet | identical tray, only light changes | **P-A** — do the four profiles read at a glance |
| 3 | `03-travel-swamp-moonlit` | W-SWAMP | fantasy | moonlit | petrified-dragon hero silhouette, cattail/deadhedge sprites + nature-kit dead trees regraded, wet ground | a huge rolled feature at travel scale without becoming a vista |
| 4 | `04-travel-desert-night-star` | W-DESERT | fantasy | dark | fallen star as the ONE diegetic source, dune plate | wilderness night lit by a rolled object |
| 5 | `05-travel-arctic-lavaflow` | W-ARCTIC | fantasy | overcast | snow plate + glowing lava ribbon | surreal table juxtapositions reading as intent, not bugs |
| 6 | `06-wild-arrival-crossjunction` | W-ARRIVE | fantasy | daylit | cross-junction tray shape, raised platform, gargantuan ribcage | areaType→tray SHAPE outdoors; the arrival beat (today: an ellipse on black) |
| 7 | `07-town-harborfront-street` | U-TOWN | fantasy | dusk lantern | STRICTLY fantasy-town-kit piece names (wall/roof-gable/road-curb/lantern/cart), regraded, 2–3 building faces max, rain-stream cobbles, NPC standees | **P-B + P-C** — minimum town grammar from the real kit |
| 8 | `08-town-burning-building` | U-TOWN S3 | fantasy | the fire IS the source | same street family, one face alight, crowd standees | an urban scene beat staged diegetically |
| 9 | `09-settlement-node-tray` | run pl1-002 "The Garrison-Wife Town" | chrome | dusk | settlement overview tray: rooftops cluster, one lit window, full PC visible (no head-clip) | replaces pl-002; tray-camera headroom |
| 10 | `10-kenney-dungeon-bridged` | D-ROOM | fantasy | torch | STRICTLY kenney-modular-dungeon-kit piece names (room-small + gate-door + stairs), regraded to house palette, faceted standees | **P-B** — the Kenney bridge, interior |
| 11 | `11-kenney-graveyard-gloom` | (gloom exterior) | gloom | one lantern-glass | STRICTLY graveyard-kit names (crypt, gravestone-cross, iron-fence, pine-crooked, lightpost-single), regraded | **P-B** — the Kenney bridge, exterior + realm |
| 12 | `12-beat-shop-open` | run pl1-002 "the-play-lens-trading-post" | chrome | interior lamp | counter, 2 shelf props, shopkeep + PC standees | **P-D** — shop-open staged |
| 13 | `13-beat-long-rest` | run pl1-002 rest leg (480 min) | fantasy | campfire | survival-kit camp pieces (tent/fire) regraded, bedroll, PC standee seated, night ring | **P-D** — the rest beat |
| 14 | `14-odd-glass-garden` | ODD-98 | realm-neutral | dawn refraction | silica plate, nature-kit tree/plant silhouettes regraded to transparent-emissive | **P-E** — oddball floor test: odd = standard vocabulary, exotic regrade |
| 15 | `15-odd-living-megastructure` | ODD-100 | chrome-adjacent | bioluminescent veins | machinery terrain from factory-kit + city-kit-industrial pieces regraded + vein emissives | **P-E** — the far end of odd |
| 16 | `16-combat-in-room` | D-ROOM, combat staged | fantasy | the room's own fog-filtered light | the octagon room from #10's family with wolf/skeleton/PC standees + subtle grid ON the room floor | **P-F** — continuity of place |

Frames 1–6 use figures sparingly (a lone PC standee sells scale). Every figure = a canon-register
standee on a dark plinth (§2). Name real sprite slugs in your notes where you cast one.

## 8. HOW TO DELIVER

- **16 images** named by the slug column, 4:3 or 16:9 landscape (frame 2 is a 2×2 contact sheet in one
  image). Deliver to `ui-sketches/mock-frames/vq2-world-looks/`.
- For each frame, 1–2 lines: **what you leaned into, and where the grammar fought you.** The friction
  is the most valuable deliverable.
- If a frame tempts you out of bounds, render the in-bounds version AND note what the out-of-bounds
  version would have added.
- Realm identity and beat identity are the pass/fail: a daylit frame must read DAY at thumbnail size;
  a shop must read SHOP; a Kenney frame must read GENESIS, not Kenney.

## 9. THE FOLLOW-UP FILE (chat instructions — Adam will run this with Sol)

After the 16 frames are rendered, write **`SOL-SOLUTIONS.md`** in the same delivery folder. This file
is how the vision quest becomes engineering. Claude will implement from it, and Adam will bring
Claude's blockers back to this chat — treat it as a living document you update when he does.

Required structure:

1. **`## Frame notes`** — the per-frame friction lines (like NOTES.md in vq-battle-scenes).
2. **`## P-A` through `## P-F`** — one section per unsolved problem in §6. Each section MUST contain
   exactly three blocks:
   - **LAW:** the composition/engine rule your frames propose, stated as a one-paragraph law that
     could be pasted into a spec (e.g. "Daylit = sun-source key at X:1 key-to-fill, tray edge always
     falls to ≤N% luminance…"). Cite the frames that prove it by file slug.
   - **RECIPE:** the concrete buildable steps against the CURRENT engine (Three.js classic-script
     theater; walkSceneFrom projection; assets in §4). Name assets, materials, light rigs, palette
     transforms, and parameter values. Assume no human graphics-production step — everything must be
     procedural or generated from existing pipelines.
   - **RISK:** where the recipe will likely fail in-engine, and the cheapest test that would expose
     it early.
3. **`## Cut list`** — anything a frame shows that we should explicitly NOT build (too expensive, off
   register, breaks a protected law), so beauty in a mock doesn't silently become scope.
4. **`## Follow-up queue`** — when Adam pastes an implementation blocker from Claude into this chat,
   append a dated entry here: the blocker verbatim, then a revised RECIPE block for it. Never rewrite
   history in P-A..P-F; amend via this queue so Claude can diff what changed.

Ground rules for Sol: the walk record is canonical — solutions may only *project* rolled fields, never
invent or reroll them; the protected set (dungeon material language, pl-022, UI chrome, wolf/skeleton
sprites) must not regress; and quote — never paraphrase — any law you pull from
`docs/ART-DIRECTION-CANON.md` or this packet.
