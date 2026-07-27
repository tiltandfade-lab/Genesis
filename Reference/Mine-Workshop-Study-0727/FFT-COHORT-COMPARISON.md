STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-lane
study: SITE-5-MINE-WORKSHOP gap-close (2026-07-27 campaign)
created: 2026-07-27
status: EVIDENCE GATHERED 2026-07-27 — nothing here is ruled
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/` (121 map ids ×
  5 views, `<mapId>_<view>.gif`), read **in place** from the sibling `genesis` worktree at
  `~/Desktop/Work/projects/Genesis/genesis/`. Map names cross-referenced from
  `study-archive/tools/heretic/src/map.c` (`fft_map_list`, ids 0–120 with display names).
boundary: THE FFT BOUNDARY (`GOLDEN-SITES-CATALOG.md`) applies in full. Relational shape-grammar
  study only. No FFT image was copied out of the archive, no map was reconstructed, and nothing
  here authorises one-to-one layout conversion. No image from this corpus is in `images/`.
---

# FFT COHORT COMPARISON — Site 5 Mine/Workshop

This is the evidence that directly closes the working spec's first declared gap:
*"the direct tactical-map/FFT mine cohort is absent"* (`SITE-5-MINE-WORKSHOP-CONCEPT.md`,
Research verdict; restated in `GOLDEN-SITES-PROOF-QUEUE.md` §"Site 5 — Targeted evidence").
The Camp and Lair studies solved the same problem for their sites by reading the 121-map
archive in place; this lane does the same for the mine.

## 0. The direct hit: a named mine complex already exists in the corpus

Unlike the camp study (which found **zero** camps in 121 maps), the FFT corpus contains a
genuine, named, multi-floor mine/coal-town complex. `study-archive/tools/heretic/src/map.c`
lists it explicitly:

| id | name | class |
|---|---|---|
| 27 | Goland Coal City | surface settlement |
| 28 | Colliery Underground First Floor | mine interior |
| 29 | Colliery Underground Second Floor | mine interior |
| 30 | Colliery Underground Third Floor | mine interior |
| 39 | Underground Passage in Goland | mine-adjacent interior (see §3 caveat) |

This is a real, playable cohort — not a surrogate borrowed from another program the way the
camp study had to use the Public Cemetery. The Lair study's lane 4 had already flagged ids
28–30 in passing (its "B — Adopted void/mine" bucket) while reading for cave grammar; this
lane opens the same ids as the primary subject and reads Goland Coal City (27) and the
workshop-flavoured Goug Machine City (38) for the first time.

**Method note carried over from the Camp/Lair studies:** view `_0` is a near-orthographic
top-down plan; views `_1`–`_4` are the four isometric rotations. Plan view is fastest for
topology; isometric views are needed for vertical/mass reads. Both were sampled here.

**Sampling.** 9 images viewed: `27_0`, `27_1`, `28_0`, `28_1`, `28_3`, `29_0`, `29_1`,
`30_0`, `30_2`, `38_1`, `39_0`, `39_2` (12 total across the two named complexes — some ids
sampled at more than one view for the vertical/mass read).

## 1. Goland Coal City (id 27) — the surface threshold, solved

Plan view (`27_0`) and isometric (`27_1`) show a steep snow-covered hillside settlement:
heavy timber-and-plaster buildings stacked up the slope, a windmill-like vent/headworks
structure at the peak, roofs at many different pitches packed tight against each other, and
a visible working ground level cut into the snow terrain at the base.

This is directly useful for the working spec's **surface threshold** zone (required zone 1
in `SITE-5-MINE-WORKSHOP-CONCEPT.md`):

- **the settlement sits ON the resource, not beside it.** There is no separate "mine building"
  next to a "town" — Goland *is* the coal city; the whole hillside reads as one production
  settlement. This supports the working spec's D-rung "production district" recombination
  language more than it supports any single-building portal reading.
- **snow, roof-pitch variety, and stacked terracing carry the "working settlement" read at a
  glance**, the same way FFT's slum maps (Camp study lane 4 §3.2) carry density through roof
  adjacency rather than ground coverage. Site 5's surface threshold can borrow this: a
  believable pithead settlement is legible from silhouette and terracing alone, before any
  cart, sign, or figure is placed.
- **the vent/headworks silhouette at the peak is the tallest object in the composition** —
  consistent with the guard-post-derived "elevation hierarchy" rule (Lair study §"Cross-check
  against the guard-post ten") transferring cleanly to an industrial surface site.

## 2. Colliery Underground, Floors 1–3 (ids 28–30) — the direct mine-interior cohort

All three floors share one palette and grammar: pale, near-white worked rock with visible
cool-blue shadow facets, heavy dark timber portal frames and door structures set directly
into the terrain, and a stepped, terraced floor plan rather than a flat corridor.

- **`28_0` / `28_1` (First Floor):** the plan shows an irregular stepped footprint with
  several small dark rectangular openings (worked portals/doorframes) cut directly into pale
  rock terraces. The isometric view (`28_1`) confirms these are genuine built timber door
  structures — squared frames with a visible lintel — not painted holes. This is the clearest
  FFT evidence anywhere in the corpus for the working spec's **"worked portal/lintel"**
  structural atom (`STRUCTURE-KIT-CATALOG.md` §"Site 5 structure ownership").
- **`28_3` (First Floor, second isometric angle):** reveals a tall timber gallows/frame
  structure standing in the open terrace — read most plausibly as a hoist, windlass, or
  headworks frame rather than a doorway, given its height and open lattice construction. This
  is independent FFT evidence for a **surface-adjacent hoist structure**, distinct from and in
  addition to Agricola's geared winch (`LICENSE-LEDGER.md` MW-02).
- **`29_0` / `29_1` (Second Floor):** the isometric view is the single most useful image in the
  cohort. It shows a **repeated row of identical dark timber portal/door frames set into a
  stepped stone terrace riser**, evenly spaced along one continuous rock face. This is direct
  visual precedent for the working spec's **support rhythm** hypothesis (repeated post/cap/sill
  sets at a regular interval) — except FFT expresses the repetition through *portals*, not
  through free-standing timber frames mid-corridor. That is a real, checkable difference from
  the working spec's assumption (which models support as mid-route timber sets) and is
  recorded as a proposed refinement in `synthesis.md` §4.
- **`30_0` / `30_2`:** Third Floor is sparser — mostly bare pale terrain with two small dark
  portal openings and a scatter of stacked-timber prop objects at lower-left (`30_0`). `30_2`
  is a corner/rim view showing the same striated pale-rock riser treatment the Lair study's
  cave cohort documented (LC-1: irregularity lives in riser texture, not mesh). The mine and
  the lair share this construction economy — confirmed independently from two different
  studies reading two different id ranges.

**Cross-check against the Lair study's independent read of the same ids** (`Lair-Study/
lane-4-fft-cave-cohort.md` §"B — Adopted void/mine"): the Lair study classified 28/29/30 as
"pale mine-rock palette, heavy timber frames" and flagged the near-white palette as an honest
ambiguity with snow. Reading the same three floors now for the mine's own purposes confirms
the timber-frame reading and adds the portal-repetition and hoist-frame findings above that
the Lair study, working at cave grammar rather than mine grammar, did not need to extract.

## 3. Underground Passage in Goland (id 39) — the honest caveat

`39_0` and `39_2` are strikingly different from 28–30: a warm ochre/gold sandstone-and-masonry
corridor with cut ashlar block walls, a vaulted or arched ceiling relationship, lit braziers,
and carved architectural detail (statuary-like niches visible in `39_2`). This reads as a
**built, dressed masonry interior** — closer to a temple crypt or treasury than a coal mine —
despite its name literally placing it "in Goland."

**Recorded honestly, not smoothed over:** the name-table match is not proof of visual kinship.
This is useful evidence in its own right (a "Layered Control"–eligible reading — a dressed
passage *underneath* a mining town, potentially a separate claimant or an older use — is
exactly the kind of cross-host transform Site 8 exists to describe per
`GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` §5), but it should not be cited as mine-interior
cohort evidence. It is excluded from the "direct hit" count in §0's table logic and carried
here only as a documented boundary case.

## 4. Goug Machine City (id 38) — the workshop cohort

`38_1` shows a hillside town built from pale timber-framed buildings with **two visible
windmill sails** mounted on tower-like structures rising above the roofline, set against a
green terraced hillside. This is the corpus's best available stand-in for Site 5's **attached
workshop / power-source** stretch family:

- power (wind) is expressed as a **tall, silhouette-dominant mechanism attached to ordinary
  building mass** — not a separate "power building." This directly supports the working
  spec's inherited principle that mechanism sockets (hoist, wheel, bellows) mount onto
  ordinary structure rather than requiring a unique building type.
- the buildings are timber-framed with steep multi-gable roofs, terraced into the hillside —
  visually continuous with Goland Coal City's stacked-settlement grammar (§1), supporting the
  working spec's claim that mine and workshop are one family expressed through different
  attached mechanisms, not two separate site types.
- this is independent of, and adds to, the smelting-house architecture in Agricola's plate
  (`LICENSE-LEDGER.md` MW-03): Agricola shows the *interior* of a built processing workshop;
  Goug Machine City shows its *exterior* silhouette in a settlement context.

## 5. What this closes, and what it does not

**Closes:** the working spec's declared gap that "the direct FFT/tactical-map mine cohort is
absent." A real, named, multi-floor mine-interior cohort (28–30) plus its surface counterpart
(27) plus a workshop-power cohort (38) now exist as read-in-place evidence with specific,
checkable findings (worked-portal repetition, hoist-frame silhouette, riser-texture economy,
power-as-attached-mechanism).

**Does not close:** route-choice, elevation, objective-placement, retreat, and fixed-camera
legibility comparison — the proof-queue's fuller ask (`GOLDEN-SITES-PROOF-QUEUE.md` §"Site 5")
also wants FFT evidence compared against *actual clay*, which does not exist yet for Site 5.
This lane supplies morphology and construction-economy evidence, not gameplay-route evidence,
because no route has been built to compare against.

## 6. Candidate grammar additions (PROPOSED — not ruled)

Induced relations, offered in the same "current design defaults awaiting Adam's promotion"
spirit as the Lair study's ten-rule list. None of these may be read as founder-ruled.

- **MW-FFT-1 — Support can be expressed as portal repetition, not only mid-route timber
  sets.** `29_1`'s row of identical door-frames in a terrace riser is a legitimate alternative
  to the working spec's "repeated timber support ~9 ft apart" hypothesis: the *rhythm* is the
  support signal, whether it lands on a free-standing frame or a portal.
- **MW-FFT-2 — A hoist/winch can read as a tall open lattice frame standing in unroofed
  terrain**, independent of a shaft collar (`28_3`). Useful for Rung-A/B prospect and drift
  scenes that want a hoist silhouette before the site has earned a true shaft collar.
- **MW-FFT-3 — Power mounts onto ordinary building mass as a tall attached mechanism**
  (Goug's windmills), not as a dedicated "power building." This licenses cheap workshop power
  dressing at low structural cost.
- **MW-FFT-4 — Named mine-adjacent interiors are not automatically mine-interior evidence.**
  Underground Passage in Goland (39) is the corpus's own warning against trusting a name over
  a visual read — restated here as a process note for any future study using this archive.
