# PACKET WAVES — the BW5 texture + dressing image-gen queue (index)

type: codex-index
status: LIVE (Fable, 2026-07-11 — CORE-3 SCOPE. Adam's ruling: prove the engine on the CORE 3
(fantasy/gloom/chrome) before opening new realm fronts; the other 9 realms are parked as future
expansion packs. So the goal here is to fill the CORE-3 gaps, not the big-9 gaps. Run each
execute-now packet through the codex/ImageGen window; art lands in `ui-sketches/`, then the fold
scripts + code touches wire it. Additive-save law everywhere: `-take2` on a retry, NEVER overwrite.)

## Scope ruling (2026-07-11)

**Core 3 = fantasy, gloom, chrome.** Everything below is prioritized around them. The other 9
canonical realms (frontier/noir/ash/suburb/cosmic/theater/high-seas/lost-world/bright-kingdom) are
**shelved as expansion packs** — their texture/flat-prop/painting/dungeon-object work is
spec-complete but parked until a realm ships. The SAME scoping governs the BW5 SEAM 1 dungeon-object
(interactables) work — prove objects-dg-03 on the core 3 first (`docs/BEAUTY-WAVE-5.md`).

## The core-3 gaps this queue closes

- **Texture variety:** the core 3 each carry ONE tile per surface (length-1 arrays) and only ~5 of
  ~8 declared surfaces are authored — rooms repeat one tile, the rest fall back to procedural.
- **Condition:** lives only as prose (`REALM_SURFACES.summary`); the renderer never sees it — true
  for ALL realms incl. the core 3.
- **Architecture Material** (d20, `voice_critical`): completely unwired everywhere — basalt/marble/
  copper/glass/silk never reach the screen; buildings of these appear in the core 3 too.

## EXECUTE NOW — core 3

| # | Packet | Covers | Gens | Status |
|---|---|---|---|---|
| 1 | `PACKET-07-CORE-VARIANTS.md` | widen fantasy/gloom/chrome pools + their un-authored surfaces | ~14 | **READY** |
| 2 | `PACKET-05-CONDITION-DECALS.md` | 9 shared condition overlay sets (realm-agnostic → serves the core 3) | 9 | **READY** |
| 3 | `PACKET-06-ARCH-MATERIALS.md` | 12 building materials (realm-agnostic → serves the core 3) | 16 | **READY** |
| 4 | `PACKET-08-FURNITURE-FACES.md` | faced-box furniture faces for the ROOM-GRAMMAR typologies × core 3 | 9 | **READY** |
| — | `PACKET-04` cross-usable subset | lost-world mossy stone → fantasy/gloom variants only | ~3 | **READY** (subset) |

## PARKED — expansion packs (do NOT run yet)

| Packet | Covers | Un-park when |
|---|---|---|
| `PACKET-04-REALM-TEXTURES.md` | textures × the 9 non-flagship realms (minus the cross-usable subset) | a realm ships |
| `PACKET-10-FLAT-PROPS-R2.md` *(unwritten)* | surface-attached flat-props × 9 non-flagship realms | a realm ships |
| `PACKET-11-PAINTINGS.md` *(unwritten)* | gallery/painting-dg family × 11 non-fantasy realms | galleries scoped |

*(PACKET-09 reserved for a core-3 flat-props widen if IA-4 wants more surface-attached props.)*

## Run order + rationale (execute set)

**Core-variants (1) first** — the biggest core-3 win (kills the one-tile repeat, covers missing
surfaces). **Decals (2) + Arch-Materials (3) next** — both overlay/point-at the base surfaces and
apply immediately to the core 3; run them together. **Furniture-faces (4)** is coupled to IA-3 (the
placement engine): it must land before the ROOM-GRAMMAR typologies (shrine/barracks/library/crypt/
camp) render, so run it alongside 1–3 rather than after. The **PACKET-04 cross-usable subset** rides
along with core-variants (same fantasy/gloom slugs). Priority inside each packet: the EMISSIVE sheets
(chrome reactor grate, biolum-moss) and the un-authored surfaces before pure variants.

## Shared laws every packet embeds (source of truth)

PS1 RETIRED game-wide · SUBTLE-TEXTURE law (contrast cap 0.62, never busy under sprites) · UV LAW
(floor 1 tile : 1 grid cell so grout = combat grid; wall ≈14 courses; trim = the one legal stretch)
· BRIGHTNESS LAW (art authored flat-ambient, engine lights it) · chroma `#FF00FF` + defringe +
additive `-take2`. Per-realm truth: `data/realm-surfaces.js`, `dev/model-qa/realm-palettes/<realm>.json`,
`dev/model-qa/regen-v3/style-refs/<realm>-style-ref.png`. Laws: `docs/BEAUTY-WAVE-2.md` (BW2-3 / UV /
PROP PERSPECTIVE), `docs/DESIGN.md` (BRIGHTNESS · PS1 RETIRED), `docs/BEAUTY-WAVE-5.md` (SEAM 3).

## One-time code touches (core-3 scope — after the art lands)

The core 3 already have `REALM_TEXTURES` entries and already fold, so NO `FLAGSHIPS` extension is
needed for the execute set (that's an expansion-un-park task). What the execute set needs:
1. **Wave 1** — APPEND the new tiles to the core-3 `REALM_TEXTURES` variant arrays
   (`src/ui/theater-interior.js`); point any newly-authored `REALM_SURFACES` surface `base` at its tile.
2. **Wave 2** — add a chroma→alpha SLICE path in `build/fold-textures.py` (decals are alpha, not
   opaque); register `CONDITION_DECALS` parallel to `DECAL_KIND_COLOR`; MC-2 extends
   `interiorBuildDecals` to carry an art texture; reuse the `childTagged` gate for blood.
3. **Wave 3** — `ARCH_MATERIAL_TEXTURES` lookup mapping the d20 row → tile (MC-1); emissive biolum-moss
   routes through the BW3 bloom gate.

These are BW5 SEAM 3 build units — the packets only produce the art; wiring is the engine work that
follows, and it too stays core-3-scoped.
