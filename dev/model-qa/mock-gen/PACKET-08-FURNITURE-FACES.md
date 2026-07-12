# PACKET-08 — FURNITURE FACES (faced-box furniture; the core-3 typology roster)

type: codex-packet
status: READY (Fable, 2026-07-11 — BW5 GRAPHICS-ENGINE §H FACED-BOX class + ROOM-GRAMMAR §4, CORE-3
SCOPE. Rectilinear furniture is NOT extruded from a flat sprite — it's a small parametric box that
WEARS sprite FACES per face (`furnitureFor(kind,realm)`, the crate-faces pattern). This packet
generates those faces for the furniture the ROOM-GRAMMAR typologies place — so shrine/barracks/
library/crypt/camp/shop rooms read right when IA-3 builds. Core 3 only: fantasy/gloom/chrome.)

## Delivery rules (face sheets — same class as PACKET-02/04 crate-faces)

- **OPAQUE face tiles, NOT tileable across faces** — each face is self-contained (its own bounded
  material tile), sliced apart at fold like crate-faces. A face MAY repeat along a run (a pew seat
  down its length) with mirrored wrapping (UV FURNITURE law).
- **512×512 six-face sheet** (six ~170px face tiles in a 3×2 grid), each face auto-trimmed to its
  non-dark bbox at fold. Flat ambient light only (the engine lights + grades it); PS1 retired —
  crisp full-res, detail in the texture; subtle low-contrast under the SUBTLE-TEXTURE law.
- Realm-true material skin; colors from the realm palette. Save
  `ui-sketches/textures/<realm>-<group>-faces-<n>.png`, additive law (`-take2`).
- These are the FACE of a box the engine builds — draw the surface *as seen flat-on* (a table TOP
  from directly above, a table SIDE straight-on), no perspective, no cast shadow (baked object AO in
  crevices is fine — the crate-faces rule).

## Standing prompt header (paste atop every prompt)

> Generate a pixel-art FURNITURE-FACE sheet, 512×512, six self-contained face tiles in a 3×2 grid on
> a dark neutral background. Each tile is ONE flat face of a piece of furniture — drawn straight-on
> (top faces from directly above, side/front faces perpendicular), NO perspective, NO vanishing
> point, so it maps cleanly onto a box face. Rich material read (wood grain, worn metal, carved
> stone, cloth weave) with baked crevice AO, but NO scene lighting and NO cast shadow — the engine
> lights the box. PS1 retired: crisp full-res, no dither except in the grain. Realm palette per the
> attached style-ref. Each face fully inside its cell.

## The sheets (3 core realms × 3 groups = 9 generations, 6 faces each)

Realm skins: **fantasy** = carved oak + iron + temple stone · **gloom** = rotwood + bone + coffin-
verdigris + old blood · **chrome** = molded polymer + brushed steel + status-lit panel.

### `<realm>-seating-faces-1` (6 faces)
bench seat-top · bench side/leg · pew seat-top · pew back-panel (carved/riveted per realm) · bed
bedding-top (blanket + pillow, seen from above) · bed frame-side (rail + leg).
- fantasy: waxed oak + wool blanket · gloom: rotted board + moth-eaten shroud · chrome: molded bench
  + med-bay bunk with a thin pad.

### `<realm>-surface-faces-1` (6 faces)
table top · table side/apron · counter top (shop) · counter front-panel · shelf-unit front (with
stocked contents implied) · shelf side.
- fantasy: plank table + goods shelf · gloom: cobwebbed shelf + stained table · chrome: steel bench +
  a server-rack front (cable-lit) as the "shelf".

### `<realm>-ritual-faces-1` (6 faces)
altar top · altar front-relief · sarcophagus lid (effigy/seal seen from above) · sarcophagus side-
relief · weapon-rack front (arms in slots) · niche-insert back panel.
- fantasy: carved stone altar + stone effigy · gloom: blood-stained altar + crypt effigy + bone
  niche · chrome: console-shrine terminal + stasis-pod lid + arms-locker front.

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → **crate-faces slice path** (extend `build/fold-textures.py`'s
`CRATE_FACE_NAMES` with per-group face-name lists: `SEATING_FACES`, `SURFACE_FACES`, `RITUAL_FACES`) →
auto-trim each face to bbox → fold to `assets/textures/<realm>-<face>-1.png` at texel. The
ROOM-GRAMMAR §4 `furnitureFor(kind, realm)` builders (a code unit) wear these via `textureFaceFor`
(the existing furniture-face registry) — one shared parametric box per kind, faces from the atlas,
per-face planar UV (long runs mirror-wrap). No new render system — this is BW2-5's furniture channel
fed real faces.
