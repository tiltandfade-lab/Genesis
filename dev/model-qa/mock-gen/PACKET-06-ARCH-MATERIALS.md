# PACKET-06 — ARCHITECTURE MATERIALS (wire the building-material roll to the renderer)

type: codex-packet
status: READY (Fable, 2026-07-11 — BW5 SEAM 3 / MC-1. The `Architecture Material` d20 table
(Engine/03. _Tables/01. World Building/Architectural Details/Architecture Material.md) describes
what a place is BUILT of — basalt, marble, mudbrick, copper, glass, ironwood, silk — and it is
`voice_critical: true`, but it is **completely unwired to render**: the visual material is chosen
independently by keyword/realm, so the rolled building material never reaches the screen. These
sheets give MC-1 real art to point the roll at. Realm-AGNOSTIC — a marble hall can occur in any
realm — tinted per realm at render.)

## Delivery rules (same tileable rules as PACKET-04)

- **TILEABLE both axes · OPAQUE · 512×512 · flat ambient light · subtle low-contrast · additive
  save.** PS1 retired — full-res, detail in the texture. WALL ≈ 14 courses; FLOOR = 1 tile : 1
  grid cell (grout aligns to the combat grid).
- Save `ui-sketches/textures/arch-<material>-<wall|floor>-<n>.png`.
- **Neutral-leaning** so the per-realm grade can push it (a marble hall reads warm in frontier,
  cold in chrome) — but keep each material's defining hue (copper = verdigris green, silk =
  pale iridescent) since that hue IS the roll's identity.

## Standing prompt header (paste atop every prompt)

> Generate a SEAMLESS TILEABLE pixel-art BUILDING-MATERIAL surface, 512×512, flat ambient light
> only (the engine lights + grades it), subtle low-contrast so it reads at glance distance without
> fighting sprites in front of it. PS1 RETIRED — crisp full-res, detail in the texture, no dither
> except where the material itself is grainy. Tiles perfectly on both axes. This is the fabric of a
> building wall/floor — bake the material read (grain, mortar, patina, weave) but no scene lighting,
> no cast shadows beyond subtle mortar/crevice occlusion.

## The sheets (12 materials — wall each; +floor for the 4 stone ones = 16 generations)

Grounded band (d20 1–16):
1. **arch-basalt-wall / -floor** — rough-hewn dark volcanic stone, columnar-fracture hints, matte grey-black, tight mortar.
2. **arch-timber-daub-wall** — oak post-and-beam frame, white-washed daub infill panels, straw-thatch band along the top course.
3. **arch-marble-wall / -floor** — polished white marble, cool grey veining, high specular sheen, fine joint lines.
4. **arch-shipwood-wall** — reclaimed ship planking, salt-crusted grey grain, rusted iron strap bands, peeling weathered paint.
5. **arch-mudbrick-wall** — sun-dried tan adobe brick, visible straw binders, sun-cracked faces, crumbling mortar.
6. **arch-copper-wall** — oxidized copper sheet, mint-green verdigris patina, seamed panels, faint drip-runs of darker green.
7. **arch-iron-slate-wall / -floor** — dark grey slate shingles/tiles, rusted iron straps and rivets, wet-slick sheen.
8. **arch-limestone-wall / -floor** — stacked porous light-grey limestone blocks, dusty weathered faces, soft rounded joints.

Textured band (d20 17–19):
9. **arch-fused-glass-wall** — multicolored melted-sand glass, translucent jagged facets catching light, trapped bubbles, prismatic edges.
10. **arch-ironwood-wall** — LIVING wood: deep grain still growing, knot-eyes, small green leaf sprigs at the top course (eaves).
11. **arch-biolum-moss-wall** — organic glowing moss coating over dark bark/stone, soft cyan-green EMISSIVE bloom in the clumps (author the glow bright — it must trip the emissive-bloom threshold), dark between.

Strange band (d20 20):
12. **arch-silk-wall** — woven sentient thread wall, fibrous crosshatch weave, faint pearlescent iridescence, a subtle directional sheen (it "vibrates").

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → opaque texture fold (same gate as PACKET-04) → shared
`assets/textures/arch-<material>-*.png`. **MC-1 wiring:** map each `Architecture Material` d20 row →
its `arch-<material>` tile (a new `ARCH_MATERIAL_TEXTURES` lookup, or `FLOOR_MATERIAL_RECIPES`
aliases for the 4 stone floors); the place-gen/room-build pass reads the rolled material and selects
the tile instead of the keyword/realm default. The biolum-moss glow routes through the emissive path
(BW3 bloom gate). Adopt the material-inheritance rule here too: a cave-adjacent room forces the
rough stone (basalt/limestone) family so no marble corridor bolts onto a cavern.
