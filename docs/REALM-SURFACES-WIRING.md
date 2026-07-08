---
type: system-spec
project: Genesis
status: BUILT — S1–S3 landed 2026-07-04; §3 decision-2's tint funnel LANDED 2026-07-08
  (feat/realm-floor-color, Adam's "floors are drab as hell" ruling): every surface carries an
  authored `baseTint` hex, theaterApplySurfaceTint resolves it, floor tiles carry it graded —
  and the tile checkerboard is retired game-wide (one room-wide tint; env palette = no-realm
  fallback, saturation-lifted).
created: 2026-07-04
related:
  - "[[REALM-SURFACES-DRAFT]]"
  - "[[FLOOR-TEXTURES]]"
  - "[[REALM-WIRING]]"
  - "[[REALM-RENDER-STYLE]]"
---

# REALM-SURFACES-WIRING — a breach room stands on its realm's floor

## §0 The gap

88 realm surfaces are drafted (REALM-SURFACES-DRAFT.md) but no `data/realm-surfaces.js` exists;
`theaterFloorMaterial` (theater-data.js:534–550) picks from the 12 core materials by segment
text + biome and never consults the realm. 5 of the 8 net-new base materials (grating, asphalt,
void-floor, rope-matting, candy-tile) have hex colors in `FLOOR_MATERIAL_BASE` but NO
`FLOOR_MATERIAL_RECIPES` builder — they'd render flat.

## §1 Unit S1 — `data/realm-surfaces.js` (generated)

- Author `dev/model-qa/realm-surfaces.json` from the draft doc's tables: per realm, 8 entries
  `{name, base, tint, where, summary}` — **base MUST be a key that exists in
  FLOOR_MATERIAL_RECIPES after S2** (validation), `where` normalized to `interior|exterior|any`.
- Generator `build/gen-realm-surfaces.py` (mirror gen-realm-bestiary.py; `--check` mode) →
  `data/realm-surfaces.js` (`REALM_SURFACES`), registered in manifest.json + genesis.html after
  data/realms.js. check-manifest OK.

## §2 Unit S2 — the 5 missing material recipes

Add `FLOOR_MATERIAL_RECIPES` builders (theater-boot.js) for `grating`, `asphalt`, `void-floor`,
`rope-matting`, `candy-tile` — same procedural-canvas grammar as the 12 shipped recipes
(FLOOR-TEXTURES.md §2 is the pattern doc; PSX grit defaults apply). Visual gate: extend the
floor-sheet capture (dev/model-qa, same harness FLOOR-TEXTURES §5 used) with the 5 new swatches;
orchestrator judges by eye (reads-as-material, no candy except candy-tile's deliberate register).

## §3 Unit S3 — the select seam

`theaterFloorMaterial(segment, biome, env, opts)` gains `opts.realms` (threaded from the SAME
`activeRealmsFor(skin, w)` value the encounter path uses — one seam, three consumers):

- When `opts.realms.length`: pick the primary realm's surface list from `REALM_SURFACES`,
  filter by `where` (interior for dungeon/urban interiors, exterior for wilderness/open), then
  keyword-match segment text against surface names/summaries; no match → seeded-random pick from
  the filtered list (deterministic per segment id — same seed law the zone-variety pass uses).
  Return `{material: s.base, tint: s.tint, surfaceName: s.name}`.
- `surfaceName` rides into the segment's prose twin + walk digest dressing line (blind-playable
  law: the named floor is narratable, not just visible).
- Tint application: multiply into the recipe's base hex at canvas-build (the hook
  REALM-RENDER-STYLE's gradeColor will later share — build it as a tiny pure helper now).
- No realms → byte-identical today's behavior (regression law).

## §4 Build + verify

Branch per unit (S1→S2→S3 stacked or S2 parallel to S1). Extend `dev/verify-theater-data.mjs`:
breach fixture → material ∈ the realm's surface bases + tint present + surfaceName narratable;
non-breach → legacy path unchanged; every REALM_SURFACES base resolves a real recipe (the S1
`--check` cross-validation, asserted at runtime too). MUTATION: break the realm filter → a
frontier breach rolls candy-tile → fail.

## §5 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Surfaces select by keyword-then-seeded-random, deterministic | anti-drift; mirrors theaterFloorMaterial's existing text-first logic |
| 2 | tint applied at canvas-build via a shared pure helper | one color funnel for surfaces now + render-grade later — **LANDED 2026-07-08**: `baseTint` authored per surface (dev/model-qa/realm-surfaces.json), funneled by `theaterApplySurfaceTint`, graded by the room's realmRenderProfile, realm-led into the floor canvas |
| 3 | surfaceName into the prose twin | BLIND-PLAYABLE FULLY doctrine |
| 4 | 3 units, S2 parallelizable | recipes are self-contained taste work |
