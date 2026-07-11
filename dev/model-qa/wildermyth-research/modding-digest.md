# Wildermyth Modding Pipeline — Research Digest

Sources: Wildermyth Wiki (wildermyth.com/wiki), Steam Workshop, KosGames tutorial.
All facts below are SOURCED unless marked **[INFERENCE]**.

## 0. Overall pipeline (sourced)
- All moddable game data is stored as **JSON files**. (Data Format Overview, Modding Guide)
- Mods live in `mods/user/[modName]/` and **mirror the core game's folder structure** exactly —
  e.g. to override `assets/data/balance/campaignBalance.json` a modder creates the same path
  under their mod folder. (Modding Guide: https://wildermyth.com/wiki/Modding_Guide)
- Three mod install roots: `mods/builtin` (shipped base content), `mods/user` (local mods),
  `steamapps/workshop/content/763890` (Workshop mods). (Modding_Guide)
- Authoring happens via an in-game **"Content and Comics Editor"** (Tools → Editor in the main
  menu), which also has a **Steam Workshop** publish flow (Mods → Create New Mod → Share).
  (Modding_Guide, https://steamcommunity.com/workshop/about/?appid=763890)
- Data Format Overview top-level taxonomy (sourced, https://wildermyth.com/wiki/index.php?title=Data_Format_Overview):
  Effects, Outcomes, Aspects, History, Events, Abilities, Tidings, Scenarios, Plots — a
  trigger/outcome-oriented content-authoring model, not an ECS/scene-graph exposed to modders.

## 1. Scenery / environment format
Source: https://wildermyth.com/wiki/Scenery , https://wildermyth.com/wiki/Scenery_Data ,
https://wildermyth.com/wiki/Scenery_Lab

- Scenery entries live at `assets/data/scenery/*.json`; new entries are appended "at the very
  bottom of a JSON file, above the closing `]`" and typically authored by copying an existing
  entry. (Scenery_Data)
- Companion **PNG image** goes in a parallel `.../scenery/` images folder; the Scenery Lab tool
  can list "all the images in the scenery folder" and flag which ones have no matching JSON data
  (orphan-image detection). (Scenery_Lab)
- Placement is **tag-driven, two-tier**: a primary tag (e.g. `focalPoint`, `floor`, `lamp`,
  `lampOff`, `barricade`, `setPiece`, `setPieceCeiling`) plus one or more specifier tags —
  location (`interior`/`exterior`), biome/environment (`forest`, `field`, `foothills`, `swamp`,
  `town`, `cave`), or station tags (`forge`, `library`). "The game will always use a primary
  tag...and then generally one or more specifiers." (Scenery_Lab, Scenery_Data)
- A **"Length Range"** field controls "how big or small this scenery can appear on the map" —
  the closest documented analog to a footprint/scale parameter. (Scenery_Data)
- **Aspects** attached to a scenery entry affect its interactability (game-logic hook, not
  purely visual). (Scenery_Data)
- Other documented-but-unspecified fields: `shadow`, `submerge`, plus colors/scale explicitly
  marked `"todo"` by the wiki authors as of the page's last edit (Dec 2019) — **the wiki itself
  is incomplete here**, no `blocking`/`height`/exact footprint schema or JSON example is public.
- **On the map (Site Editor), scenery is placed via a `MapDetail_RandomScenery` component** with
  placement mode `everywhere` / `specificArea` / `exactLocations` and a density slider 0.0–1.0.
  (KosGames tutorial: https://kosgames.com/wildermyth-how-to-create-an-incursion-defense-map-23029/)
- Not found: explicit numeric footprint/blocking/height fields, a full example scenery JSON
  object. **Gap** — likely only discoverable by opening the shipped `assets/data/scenery/*.json`
  files directly (not surfaced in any fetched wiki text).

## 2. Character art / layered-piece format
Source: https://wildermyth.com/wiki/Image_layers , https://wildermyth.com/wiki/Modding_alternate_races

- Characters are built from **separate PNG layers per body region**, keyed to one of six base
  "rigs": `hunterF`, `hunterM`, `mysticF`, `mysticM`, `warriorF`, `warriorM`. (Image_layers)
- **Naming convention: `<rigName>_<layerName>.png`** — e.g. `warriorF_myNewLayer.png`. A custom
  layer needs one PNG per rig variant it should appear on. (Image_layers)
- Canvas sizes: **head layers 192×256 px** (Drauven race exception: 256×384 px); **body layers
  512×512 px**; item layers are flexible, scaled via `scaleX`/`scaleY`. (Image_layers)
- **Z-order via a `depth` integer**, higher draws on top, within same-group layers. Documented
  hard-coded bands: 1000 = human torso, 1100 = human legs, 1200 = human arms, 2000–2400 =
  clothing/armor, 5000+ = offhand items, 7000 = main-hand items. (Image_layers)
- **Pivot/anchor for held items: `gripOffset: {x, y}`** (example given: `{"x":114,"y":210}`),
  plus a grip-location field (`mainHand`/`offHand`) and an inactive-stow position enum
  (`highBack`/`midBack`/`lowBack`/`hide`). (Image_layers)
- File paths: body/head layers at `assets/figures/images/human/misc/`; item layers at
  `assets/figures/images/human/items/`. A mod PNG that reuses a base-game filename **overrides**
  the default asset (simple filename-shadowing override system, not a merge/patch system).
  (Image_layers)
- **Themes** = the mechanism for transformations (wolf arm, crow wings, etc.):
  - A theme JSON defines a `layers` list that **replaces** specific body-part layers wholesale.
    "A theme is a fast way to set up layers for a character and will automatically overwrite
    human visuals." (Modding_alternate_races)
  - Same rig-prefixed naming convention applies to theme layer PNGs (e.g. an `alternateTorso`
    layer needs `hunterF_alternateTorso.png`, `hunterM_alternateTorso.png`, etc. across rigs).
  - Head/face theme layers carry a `"headOffset": true` field.
  - Themes can declare **mutual incompatibility** with other themes (e.g. transforming all limbs
    via one theme excludes eligibility for a second limb-transform theme) — a simple
    exclusion-list, not a constraint solver.
  - Conditional layer visibility is driven by **`ifOwnerAspect` / `ifNoOwnerAspects`** fields —
    i.e. the *aspect system* (Wildermyth's generic tag/status-marker mechanism) gates which art
    layer renders, so "has wolf-arm aspect" toggles the wolf-arm PNG layer on and the normal-arm
    layer off. This is the technical answer to "how does the swap work": **aspect-gated layer
    replacement**, not a shader/rig-bone system.
  - Same `depth` field reused for theme layer ordering.

## 3. Animation / effects / attacks format
Source: https://wildermyth.com/wiki/Effects , https://wildermyth.com/wiki/Modding_monster_abilities ,
WebSearch snippets citing Outcomes/Modding_monster_abilities pages.

- Abilities are defined with metadata fields `icon`, `category`, `priority`, `cooldown`; a
  **`targets`** block does `domain` (what to search) + `filter` (validity test, e.g. range,
  line-of-sight, footprint checks); an **`outcomes`** block executes results (damage rolls,
  aspect application, mission starts, scenery mutation). (Effects, Modding_monster_abilities)
- **Animation is NOT keyframe-authored by modders.** Instead, an AttackRoll-type outcome
  specifies a **client-side animation *script id*** to play, e.g.:
  - `specialAnimationEffect` — flags a specific effect on the attack animation.
  - `specialAnimationExpression` — a float parameter passed to that effect (example given:
    Bloodrage's "+2" value is passed this way).
  - `customSpecialAnimationEffect` — lets an outcome node like `DAMAGE_ROLL`/`DEFENSE_ROLL`
    reference a custom animation effect.
  - `attackerAnimationOverride` / `defenderAnimationOverride` — swap which animation clip each
    combatant plays.
  - `audioOverride` — swap the sound cue for the attack.
  - `particles` field on an AttackRoll outcome — spawns a named particle effect; only referenced
    by id/name, no particle-system parameters (emission rate, lifetime, etc.) are exposed in
    modder-facing docs.
  (These field names are corroborated by WebSearch snippets pulling from the wiki's Effects /
  Modding_monster_abilities / Outcomes pages, not independently re-verified via direct fetch of
  Outcomes — treat field *names* as sourced, exact semantics as partially inferred.)
- **Gap / not found**: any keyframe timeline, tween-curve, or particle-parameter schema. The wiki
  itself only exposes animation as a **reference-by-id into a compiled/hardcoded animation
  library** — i.e., modders pick from existing named clips/scripts rather than author new motion.
  This strongly implies **[INFERENCE]** the actual skeletal/keyframe animation system lives in
  the (closed-source) Unity/engine layer, unexposed to the JSON modding surface.

## 4. Map / encounter format
Source: https://wildermyth.com/wiki/Battle_map (mostly empty),
https://kosgames.com/wildermyth-how-to-create-an-incursion-defense-map-23029/ (Site Editor),
https://wildermyth.com/wiki/Modding_Wilderness_encounter , https://wildermyth.com/wiki/Combat_Lab

- **"The Mission Plan is a representation of our map data... this is just a JSON file."**
  (direct quote, KosGames tutorial, <15 words) — confirms maps are plain JSON, edited via a
  visual **Site Editor** rather than hand-authored JSON in practice.
- Site Editor is **tile/grid-based**: click a tile to add, right-click to remove, shift-drag to
  multi-select, adjustable brush size. (KosGames)
- Composable "MapDetail" building blocks observed:
  - `DrawFloor` — paints floor tiles.
  - `DrawWalls` — paints walls, with biome-height presets `shortBiome`/`midBiome`/`tallBiome`.
  - `MapDetail_RandomScenery` — scatters scenery objects at density 0.0–1.0 in mode
    `everywhere`/`specificArea`/`exactLocations` (see §1).
  - Doors placed directly on wall tiles; placement auto-removes the underlying wall tile.
  - Custom textures dropped in as JPGs at `mods/<modname>/assets/sites/images/`.
- This is a **procedural-assembly-via-composable-detail-layers model**: a mission plan is a
  stack of "detail" generators (draw floor, draw walls, scatter scenery, place doors) applied to
  a tile grid, rather than a single hand-placed tilemap array — **[INFERENCE, moderately
  confident]** based on the naming pattern (`MapDetail_*`) and the tutorial's description of
  layering multiple details onto one map.
- **Not found**: explicit grid coordinate system (square vs. hex — Wildermyth's visible art style
  strongly implies square/orthogonal, but this is **[INFERENCE]** from screenshots, not sourced
  text), map dimension limits, full Mission Plan JSON schema, or how the wilderness/overworld
  encounter map differs structurally from a combat site map. `Battle_map` wiki page is
  gameplay-only (line-of-sight, doors) with zero technical schema content.
- `Modding_Wilderness_encounter` page is about wiring an *encounter's story/outcome* (roles,
  targets, comic panel backgrounds like `comicBG_hillsYellow`, `encounterEnabled` bool) — i.e.
  it documents the narrative-event layer bolted onto a map, not the map geometry itself.
- `Combat_Lab` wiki page is a one-line stub: a testing sandbox for abilities/gear, no map format
  content.

## 5. Story / comic compositor
Source: https://wildermyth.com/wiki/Comic_Editor_Reference , https://wildermyth.com/wiki/Actor_styles ,
https://wildermyth.com/wiki/Panel_Editor (mostly a stub)

- A comic **panel** is composed of discrete typed objects: actor representations, text boxes
  (dialogue/narration/thought), custom images, "animations", narration blocks, "dark boxes"
  (background overlay/dim), action-text labels, and pointer lines connecting a speech box to its
  speaking actor.
- Panel-level fields (named, sourced): `animation` (controls panel reveal order/depth sequencing),
  `actorSlots` (per-actor config array), `textSlots` (text box placement/config), `focus`
  (`face`/`middle`/`foot` — anchors the auto-scale/crop point on an actor), `color`/`colorFilter`
  (tint an actor to match scene lighting), `allowDrawOverEdges` (lets a text box bleed past the
  panel border).
- Per-actor manipulation exposed in the editor: position, rotation (pivot = character's feet),
  scale, horizontal flip, independent head rotation/flip, facial expression override, weapon
  visibility toggle, draw-order (front/behind other actors in the same panel).
- **Actor styles** = a shorthand syntax appended to an actor tag in panel script text —
  `<panel | character_name style>` — that bundles an expression + text-box behavior in one
  token. Expression styles: neutral, talking, dead, happy, joy, angry, sad, scared, surprised,
  grim, pained, rage, skeptical, joke — each maps to a `frame-<name>` sprite frame id (e.g.
  `frame-angry`). Text-box styles: `speaking` (owns a speech-bubble text box), `narrating`
  (caption box, no pointer), `thinking` (thought bubble).
- This shows the comic compositor is a **2D layered-sprite scene graph driven by a lightweight
  markup/script language** (the `<panel | actor style>` tag syntax) sitting on top of the same
  actor-rig/expression-frame system used for character art (§2) — expressions are discrete named
  sprite frames, not blended/procedural facial animation. **[INFERENCE]**: the frame-based
  expression system (`frame-angry`, etc.) is very likely just another `depth`-ordered image layer
  swap keyed by aspect/state, consistent with the theme mechanism in §2, though this specific
  link (expressions-as-theme-layers) is not explicitly stated anywhere fetched.
- **Not found**: exact JSON schema for a panel object, background-image ID catalog, camera
  zoom/pan parameters beyond per-actor scale, or how multi-panel comic pages are sequenced/laid
  out on a page. `Panel_Editor` page is an acknowledged wiki stub ("Todo please document all the
  stuff you can and cannot do").

## Sources list
- https://wildermyth.com/wiki/index.php?title=Data_Format_Overview
- https://wildermyth.com/wiki/Modding_Guide
- https://wildermyth.com/wiki/Category:Modding
- https://wildermyth.com/wiki/Scenery
- https://wildermyth.com/wiki/Scenery_Data
- https://wildermyth.com/wiki/Scenery_Lab
- https://wildermyth.com/wiki/Image_layers
- https://wildermyth.com/wiki/Modding_alternate_races
- https://wildermyth.com/wiki/Effects
- https://wildermyth.com/wiki/Modding_monster_abilities
- https://wildermyth.com/wiki/Combat_Lab
- https://wildermyth.com/wiki/Battle_map
- https://wildermyth.com/wiki/Modding_Wilderness_encounter
- https://wildermyth.com/wiki/Comic_Editor_Reference
- https://wildermyth.com/wiki/Actor_styles
- https://wildermyth.com/wiki/Panel_Editor
- https://kosgames.com/wildermyth-how-to-create-an-incursion-defense-map-23029/
- https://steamcommunity.com/workshop/about/?appid=763890
