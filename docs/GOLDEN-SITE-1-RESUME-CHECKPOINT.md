---
type: resume-checkpoint
project: Genesis
status: RESUMED — ACTIVE GOAL
date: 2026-07-30
goal: Golden Site 1 TS/FFT procedural-family beauty proof
---

# Golden Site 1 resume checkpoint

Adam gave the word to resume on 2026-07-30. This checkpoint now records the completed renderer
recovery and the remaining procedural-family beauty work.

## Banked state

- Visual profiles project candidate materials without changing the committed plan or mechanics.
- Neutral clay remains an explicit control through `guardprofile=neutral-clay`.
- Institutional and Upland profile identities exist; only Institutional has an initial scene proof.
- B04 rough-hewn and ashlar remain best starting parents, not Guard Post approvals.
- V1 render receipts expose material state, requested/loaded channels, usage, plan reference,
  mechanics reference, and visual-profile fingerprint.
- The current meadow is rejected for the Guard Post context: too yellow, too uniformly carpeted,
  and too dominant. The first road parent is also too orange and its hard ribbon boundary remains
  unresolved.
- Two new ImageGen ground candidates are banked in
  `assets/materials/golden/guard-post/v002/`; neither is seam-locked or admitted.

## First work on resume

1. **DONE:** Reproduce the softness regression with one old sharp sprite and the current test NPC.
2. **DONE:** Trace texture filters and resolution through source sprite, citizenship/normalization,
   loader, material, render target, post stack, device-pixel ratio, and screenshot downsample.
3. **DONE:** Restore nearest-neighbor magnification and pixel-preserving scale wherever the governed sprite
   contract owns it; prove the frame is not being softened globally.
4. **DONE:** Audit the test NPC's shadow caster, alpha test, normal/AO/contact treatment, and base contact.
5. **DONE:** Build a sprite-extrusion A/B: canonical billboard versus true shallow extruded sprite standee,
   with identical source art, scale, pose, light, camera, and tactical footprint.
6. **DONE:** Seam-lock and repeat-proof the v002 turf/road candidates, wire them only as candidates, and
   rerender Institutional q0.
7. **ACTIVE:** After the sharpness/shadow/AO gate passes, run four bearings, changed seeds, Upland,
   grayscale/value review, and the final beauty frame.

Additional banked progress:

- v004 ground now loads continuous turf/road albedo, normal, and ORM blends.
- v010 establishes the accepted-looking turf palette and small-scale breakup, but its baked
  fan-shaped grass tufts are rejected as bearing-dependent marks. A v011 tuftless fill candidate is
  banked only as repaint evidence. The production v011 starting parent instead uses reviewed-mask
  same-parent toroidal quilting, preserves all unmasked v010 pixels byte-exact, and moves readable
  tufts into separately placed multi-bearing dressing;
- a same-seed v011 scale proof compares 4.95/6.60/8.25/9.90 metres per repeat (3/4/5/6 combat
  cells). Adam's governed review selects 9.90 metres/six cells for its broad moss/soil masses and
  reduced wallpaper cadence. The receipt records candidate, metres, cells, and
  `mechanicalEffect:none`;
- v018 is now the default technical ground parent pending family proof. It preserves v011 as the
  six-cell macro authority but resolves the same 30-foot envelope at exact 960×960 / 32 px per
  foot, with matching normal and ORM channels. V016 (beige micro-pattern) and v017 (uniform moss
  carpet) remain explicit rejected experiments. The selection evidence is
  `artifacts/golden-site-1-ground-density-v018/01-v011-v018-ground-density-comparison.png`;
- the Guard Post uses a dedicated open-air Golden Site daylight recipe;
- the complete hip roof is 36 degrees and two sparse Meshy operational citizens load through
  engine-owned sockets;
- the exterior perimeter closes to a common tray datum with no mechanics change;
- drainage condition placement derives from the outfall/channel facts;
- condition candidate pack v009 deterministically packs the v008 source cutouts into a repeatable
  lower-wall trim band, discrete seam-moss slot, paired two-face ivy corner, endcaps, and a
  column/drain junction slot. It remains a technical candidate, not admitted art;
- the underlying condition vocabulary separates broad lower-wall grime, readable seam moss, and
  silhouette-bearing corner ivy. All three are generic source-over-parent RGBA assets; the parent
  keeps construction rhythm, normal, ORM, and lighting;
- edge origin no longer means junction-only coverage. The first narrow/decorative v008 grime tuning
  is rejected and must become a quieter, broader lower-wall stain beneath distinct moss;
- broad planar grime now modulates the parent wall fragment through engine-authored receiver bands;
  the old duplicate condition prisms are suppressed and cannot cast independent shadows. Discrete
  planar junction marks may still use receiver-local decals. Angled ground uses a separate
  engine-authored mesh-conformal moisture field derived from the drain, least-uphill flow,
  concavity, and road maintenance. It interpolates across shared terrain vertices and changes no
  mechanics;
- ground-contact receiver bands sample the actual committed terrain along each wall member rather
  than using an elevated module seam or one flat proxy datum;
- the route-control retaining run now bears on one continuous `foundation-gravel` footing. The
  footing overlaps the wall, extends below the adjacent responsive terrain, and is named by every
  retaining member's support receipt. This fixes physical contact; it does not yet constitute
  visual admission of the grime treatment;
- V005's baked masonry, V006's regular diagonal cadence, V007's centered application, and V007's
  nearly invisible junction-only correction remain rejected evidence.
- the guard shell now owns culture-independent structural wall-corner closures; cultural quoins,
  posts, bindings, and ornaments sheath or replace the visible junction profile without becoming
  responsible for watertightness;
- the first complete family census exposed one-cell footprint mutations as visually insufficient.
  The hero remains the committed 4×4 square watchhouse, while changed-family variants now add one
  complete two-cell bay along either depth or width and enlarge the related crown-deck sentence.
  Institutional expression now adds alternating dressed-stone quoin courses and a capped
  three-sided string course; the course deliberately omits the real door/shutter elevation rather
  than crossing apertures;
- right-angle trim is audited per concentric envelope layer. The hip roof is one closed shell with
  four retained facet semantics; its inner flashing is a continuous ring; its fascia, wall-head
  infill, and Institutional cornice are four-run WFC-compatible miter loops; and the lookout
  parapet is a three-run mitered U with a named open access side, two closed returns, and two
  four-vertex terminal caps;
- roof/fascia/flashing isolation captures are now a required visual diagnostic. They exposed
  technically intersecting cornice and parapet boxes that the assembled roof concealed. Neutral
  guard walls now butt against corner-post faces instead of running through them;
- corner blocks alone are not a sufficient visual fix when overlapping faces create false black AO
  seams. The production mutation grammar uses matched miter sockets for visible continuous runs
  and four-vertex caps only at intentional terminals. A manifold ring remains useful for
  non-mutating continuous flashing and as a diagnostic fallback.

Renderer recovery evidence is banked under `artifacts/golden-site-1-sprite-filter-audit/` and
`artifacts/golden-site-1-grounding-audit/`. The current production contract is nearest
magnification, one-level linear minification, and no mipmaps. The test NPC now carries a
source-alpha contour extrusion whose side wall participates in AO and casts a volumetric silhouette
shadow; the canonical alpha plane remains its face and tactical identity.

## Non-negotiable acceptance

- no plan/mechanics fingerprint drift;
- no soft sprite regression;
- nearest-neighbor pixel read at play scale;
- correct silhouette shadow and believable contact/AO;
- no constructed wall hovering above responsive terrain; retaining runs penetrate the terrain
  envelope or use a continuous terrain-embedded footing before condition dressing;
- extrusion does not corrupt sprite identity or tactical footprint;
- no material inherits approval;
- final evidence includes at least one genuinely beautiful governed frame, not merely a passing
  receipt.
