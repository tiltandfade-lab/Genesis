---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — build-ready (UI-autonomy: render legibility, swap-cheap, no new assets)
created: 2026-07-04
related:
  - "[[BATTLEMAP]]"
  - "[[BATTLE-THEATER]]"
  - "[[DESIGN-GUIDE]]"
---

# FLOOR-TEXTURES — the floor a fight sits on reflects the rolled terrain

## §0 Goal & doctrine

Today every battle-theater floor is a flat two-tone checker (theater-boot.js's palette baseline).
FFT's charm is that floors read as *materials* — flagstone, grass, sand, mud. This wires a **floor
material** derived from what the walk ALREADY rolls, and renders each material as a **procedurally-
generated CanvasTexture** (extending theater-boot.js's existing baked figure-skin texture pattern —
offline, deterministic, NO asset files, no 404-prone manifest). Palette-only stays the fallback
(§4 "never regress the no-asset baseline").

Floor material is a **derived render fact** (like `tile.kind`/`tile.tint` already are), NOT a new
rolled canon table — so no segment-builder edits, no compile pipeline, no walk-verifier risk.
(A future explicit "rolled floor the DM narrates" markdown table is a separate follow-up.)

## §1 The material vocabulary (12)

Each material key + its procedural pattern (all PSX-quantized, ~64×64 texels, tiling, seeded
deterministic — mirror `buildPixelSkinCanvas` at theater-boot.js:~326-490 for the technique: base
value banding + 4×4 Bayer dither + sparse speckle). The material's texels are TINTED at render time
by the tile's palette color (Lambert `map` × `color`), so each material harmonizes with the env
palette while carrying its own pattern.

| key | pattern (what the canvas draws) |
|---|---|
| `flagstone` | cut rectangular blocks: a grout grid of darker mortar lines, slight per-block value jitter |
| `cobble` | packed rounded cobbles: many small ovoid cells with darker gaps, pebbly |
| `cracked-earth` | packed dirt: broad value mottle + a few branching darker crack lines |
| `cave-rock` | rough uneven stone: coarse value blotches, no grid, dark pits |
| `grass` | turf: fine vertical blade speckle, two-green value flecking |
| `leaf-litter` | forest floor: scattered small angular leaf flecks over dark loam |
| `sand` | dune: soft horizontal ripple bands, fine grain speckle |
| `snow-ice` | pale smooth with faint blue sheen bands + sparse sparkle specks |
| `mud` | wet dark: broad glossy value blobs, a few darker puddle centers |
| `scree` | loose rock: many small angular pebble cells of varied value |
| `plank` | wood boards: long horizontal planks with darker seam lines + grain streaks |
| `ash` | grey soot: fine even fleck of light+dark over a mid grey |

## §2 Derivation — `theaterFloorMaterial(segment, env)` (new, in theater-data.js)

Pure function, returns one key from §1. Precedence:

1. **Keyword scan** (first hit wins) over the segment's rolled floor text — pooled from, per env:
   wilderness `segment.footing.text` (+ `segment.footing` if a string) + `segment.biomeDesc`;
   dungeon `segment.areaType` + `segment.scene` + `segment.sensory` + `theaterSegmentFeatureText(segment)`;
   urban `segment.description` + `segment.dressing.text`. Rules (regex → key), e.g.:
   `flagstone|flagging|paved|paving|tiled floor→flagstone` · `cobble→cobble` · `mosaic|tessell→flagstone`
   (mosaic reads as flagstone v1) · `plank|board|timber|wood floor→plank` · `sand|dune|salt flat|hardpan→sand`
   · `snow|ice|frost|frozen|glaci→snow-ice` · `mud|bog|marsh|mire|silt|wet→mud` · `moss|turf|grass|reed|ivy→grass`
   · `leaf|needle|petal|loam|litter→leaf-litter` · `slate|shale|scree|pebble|shell|gravel|rubble|coral→scree`
   · `ash|dust|soot|cinder→ash` · `bedrock|cavern|cave|rough stone|raw stone→cave-rock` · `dirt|clay|earth|packed→cracked-earth`.
2. **Biome map** (wilderness, when no keyword hit): Grassland→grass · Forest→leaf-litter · Jungle→leaf-litter ·
   Desert→sand · Coastal→sand · Arctic→snow-ice · Mountain→scree · Hill→cracked-earth · Swamp→mud · Underdark→cave-rock.
3. **Env default with seeded variety** (dungeon/urban, no keyword hit): a deterministic pick — seed off
   `segment.id` (reuse the existing `cmSeedHash`/`theaterZoneOrigin` seeding convention in this file, or a
   small local string hash) — from the env pool so two rooms differ:
   dungeon pool `[flagstone, flagstone, cobble, cracked-earth, cave-rock, ash]` (flagstone weighted);
   urban pool `[cobble, cobble, flagstone, cracked-earth, plank]`.
   Absolute fallback: dungeon→flagstone, urban→cobble, wilderness→cracked-earth, breach→cave-rock.

**Wire into `theaterBoardFrom` (theater-data.js:494-622):** compute `const floorMaterial =
theaterFloorMaterial(segment, env);` once. Stamp it on FLOOR + ELEVATED tiles only (hazard/water
keep their scorch/water texture path): at the tile push (line ~565), add
`material: (kind === "floor" || kind === "elevated") ? floorMaterial : null` to the tile object.
Also add `floorMaterial` to the returned board object (line ~619) for debugging/telemetry.

## §3 Render — procedural floor texture (theater-boot.js)

1. Add `FLOOR_MATERIAL_RECIPES` (a `{key: drawParams}` table) + `buildFloorCanvasTexture(material,
   tintHex, seed)` — builds a `<canvas>` per §1's pattern for that material, PSX-quantized (reuse the
   Bayer matrix + banding helpers already in the file), returns a `THREE.CanvasTexture` with
   `NearestFilter`/no mipmaps (run it through the same `nearestify` the file already uses) and
   `wrapS/wrapT = RepeatWrapping`. **Cache** in a module map keyed by `material + ":" + tintHex` (the
   figure-texture cache precedent — a dungeon has few distinct floor textures, never thousands).
2. In `tileMaterialsFor(t, …)` (theater-boot.js:2731): keep the existing precedence, insert the
   procedural path BELOW the file-texture path and ABOVE flat color:
   - file texture (`S.textures[texKey]`) present → use it (unchanged).
   - else if `t.material` set → `map: buildFloorCanvasTexture(t.material, t.tint, hash(t.x,t.z or zone))`,
     `color: topColor` (same tint-by-palette blend as the file path).
   - else flat `topColor` (unchanged baseline).
   Sides stay flat-tinted (§1 rule 2 untouched). (~~`altTop` checker still applies to the palette
   color under the texture~~ — the checker was RETIRED 2026-07-08 by Adam's realm-floor-color ruling:
   one room-wide tint per floor, the realm surface's authored `baseTint` on realm boards; the tile
   `altTop` field survives inert-false. See REALM-SURFACES-WIRING §3 decision 2, landed.)
3. No change to `setBoard`'s tile loop (already calls `tileMaterialsFor(t, …)` at :3046) — `t.material`
   rides through from theaterBoardFrom.

## §4 Out of scope
No segment-builder edits, no new roll tables, no compile pipeline, no `data/bestiary.js`. No shader
edits (reuse `applyPsxShaderTweaks`). The `setTextures` file path stays as the higher-priority
override (a future real-art tileset drops in over the procedural baseline, swap-cheap).

## §5 Build + verify
1. `node dev/verify-theater-data.mjs` (if present) + `node dev/verify-theater-figures.mjs` → green
   (the material field is additive; assert `theaterFloorMaterial` returns a §1 key for dungeon/urban/
   wilderness fixtures + a biome fixture; assert board tiles carry `material` on floor/elevated only).
2. `python3 build/check-manifest.py` → RESULT: OK.
3. **Visual gate (orchestrator):** render the theater across envs with distinct rolled floors and
   confirm the floor reads as the material (flagstone dungeon vs grass/sand/snow wilderness vs cobble
   urban), tinted to the env palette, PSX-gritty, tiling cleanly, no z-fight/seams, palette-only
   fallback still works when `material` is null.

## §6 Decisions (flag to veto)
| # | Decision | Ground |
|---|---|---|
| 1 | Material is a DERIVED render fact, not a rolled table | it's a visual interpretation of biome/footing/env (like tint/kind); zero engine-builder risk |
| 2 | Procedural CanvasTexture, not PNG assets | offline/deterministic; matches the shipped figure-texture pattern; no 404 manifest |
| 3 | 12 materials v1 | covers the 10 biomes + dungeon/urban defaults; expandable |
| 4 | file `setTextures` stays the higher-priority override | real-art tileset drops in later, swap-cheap (§II.0b) |
