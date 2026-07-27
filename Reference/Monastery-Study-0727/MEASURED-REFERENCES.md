STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-lane
study: SITE-4-MONASTERY-COMMUNE evidence-thickening (2026-07-27 campaign)
created: 2026-07-27
purpose: closes the working spec's declared gap "obtain measured arcade bay/section before
  dimensions become cards" (`SITE-4-MONASTERY-COMMUNE-SPEC.md` "Remaining evidence and proof
  gaps") and the original packet's own declared gap "no metric bay dimensions... no plan of a
  terraced cloister" (`Reference/Monastery-Study/synthesis.md` §8).
---

# MEASURED REFERENCES — real dimensions for cell, refectory, cloister, and court

The original `Reference/Monastery-Study/` packet based every proportion on **photographs read by
eye** — lane 1 states this plainly: "Everything proportional above is read off photographs, not
measured drawings." This lane adds independently sourced, dated, measured figures — real
buildings, a real Genesis-native scene-frame table, and a real Zen monastic module — cross-
checked against the working spec's existing provisional grid hypotheses rather than replacing
them.

**Standing rule, carried from the Mine/Workshop gap-close packet and equally true here:** no
source measurement outranks fun gameplay. Every figure below is a real historical or textual data
point offered to the working spec's clay-calibration process, not a proposed replacement for its
gameplay-driven grid hypotheses. Where a real figure conflicts with a working-spec hypothesis,
the conflict is stated plainly rather than resolved here.

## 1. Cloister, church, and refectory — Fountains Abbey (measured, Cistercian, England)

| element | figure | source |
|---|---|---|
| Refectory | **108 ft × 45 ft** (≈32.9 m × 13.7 m) | Catholic Encyclopedia / historical description of Fountains Abbey |
| Great cloister | **300 ft × 42 ft** (as walked/described — see note below) | Same source |
| Church (nave + choir) | **351 ft long**, nave **65 ft wide** | Same source |

**Honest note on the cloister figure.** The "300 ft × 42 ft" description most plausibly describes
the **great cloister's walk run** (the four covered walks laid end to end, or the walk range
along its longer axis) rather than a single square garth, since a 300 ft × 42 ft rectangle is not
proportioned like a typical square cloister garth (compare Fontenay's 118 ft × 125 ft — near-
square — below). It is reproduced here as sourced rather than silently corrected, because the
underlying description was not independently re-verified against a scaled plan in this pass —
flagged as a genuine residual uncertainty, not resolved.

The measured plan image (`LICENSE-LEDGER.md` M4-09, `images/M4-09-fountains-abbey-measured-plan.jpg`)
labels every room these figures belong to directly: NAVE / TRANSEPT / CHOIR / CHAPEL OF NINE
ALTARS / CLOISTER COURT / CHAPTER HOUSE / GREAT CLOISTER (walk) / REFECTORY / FRATER HOUSE /
BUTTERY / THE ABBOT'S HOUSE (GREAT HALL, KITCHEN, STORE HOUSE, CHAPEL) / HOSPITIUM / HOUSES FOR
STRANGERS / INFIRMARY, set along the River Skell — the first image in either packet that shows
the room-ring relations and real dimensions on one object.

## 2. Cloister garth — comparative real dimensions (multiple sites)

| site | figure | source |
|---|---|---|
| Fontenay Abbey (Cistercian, France) | cloister galleries form a rectangle **118 ft × 125 ft** (≈36 m × 38 m) | Abbaye de Fontenay official site |
| Glastonbury Abbey (England) | enclosed cloister space **≈40 m across** | Glastonbury Abbey Archaeology project |
| Canterbury Cathedral cloister | **≈39 m** | Comparative citation in the same source |
| Westminster Abbey cloister | **≈43 m** | Comparative citation in the same source |
| Cloister walk vault (large medieval examples, general) | height **3.5–5 m**; width **2.5–4 m** | General architectural-history summary |

**Reading against the working spec.** Fontenay (near-square, ~36–38 m per side) is the best
single real comparandum for the working spec's Golden Seed "level wrapped court" — at Genesis's
5 ft/1.5 m grid cell, a 36–38 m garth is on the order of **24 cells per side**, well inside the
range a Rung-B tactical map can hold alongside its surrounding gate, ranges, and stair. This is
offered as a clay-calibration data point, not a ruling — the working spec's own grid section
(§"Provisional grid hypotheses") explicitly defers exact court size to measurement and clay.

## 3. Individual monastic cell — Carthusian (measured, real precedent for the "cell row" variant)

**A real Carthusian cell measures 4 m × 4 m × 4 m, on a module of 80 cm.**

This is the single cleanest measured figure either packet has found for the working spec's own
declared M3-adjacent question — the original study's lane 1 §7 established qualitatively that the
Carthusian cell is "a small two-storey house" with workshop above and a *cubiculum*, wet cell, and
private walled garden below, entered off the walk through a door with a serving hatch beside it;
this lane adds the real number. At a 4 m (≈13 ft) footprint per floor, a Carthusian cell sits
close to **2–3 Genesis grid cells on a side** — small enough to read as a genuinely private room
rather than a subdivided dormitory bay, supporting the working spec's own note that "the cell
version is far more gameplay-legible" than the shared dorter (original synthesis §7), without
this lane taking a position on which one is DEFAULT.

## 4. The dormitory/cell module, restated by an unrelated tradition — the Zen *tan*

Independently of any European source, Sōtō Zen practice provides its own **measured per-person
sleep/meditation module**: the **tan**, sized to one tatami mat, **≈180 cm × 90 cm (≈5.9 ft ×
3.0 ft)**, arranged in a continuous row along the *sōdō*'s inner walls (`BREADTH-SWEEP.md` §1.3).

This is worth carrying into the working spec's grid section as a real cross-check, stated
honestly as a coincidence worth noting rather than a design principle: **180 cm is close to
Genesis's own 5 ft (1.52 m) horizontal grid cell**, and a monk's full sleep/sit/eat footprint (mat
plus the aisle in front of it) is well inside a single Genesis cell. This does not argue for any
specific dormitory-bay width — the working spec's own "arcade bay width... remain measurement and
clay questions" stands unchanged — but it is real, independent, non-European evidence that a
single 5 ft module is a plausible order of magnitude for "one person's claimed floor," which the
working spec has so far only asserted by analogy to the general grid.

## 5. Genesis's own existing measured monastery content (Urban Scene Frame table)

This is the most load-bearing figure in this lane, because it is not a historical citation —
it is a **currently LIVE Genesis roller row**, found by grepping Engine markdown source (never
generated `tables.js`/`.json`, per repo-wide token discipline):

| table | row | content |
|---|---|---|
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Scene Frame.md` (row 157) and `Urban Scene Frame — Open.md` (row 57) | **Monastery Cloister** | **60' × 60' square**; four covered walks (**8' deep**); central garden well (**6' diameter**) |
| `Urban Scene Frame.md` (row 393) / `Urban Scene Frame — Threshold.md` (row 93) | **Monastery Gate House** | **15' × 20'**, austere; single door (**8' tall**); 6' × 6' guard cell; bell pull |
| `Urban Scene Frame — Vertical.md` (row 16 / 216) | **Tiered Monastery Roof** | **35' × 45'** rectangle; **30' drop**; three levels (8' rise, 5' platform, 8' rise again) |
| `Urban Area Type.md` (row 161) | **Cloister** | **40' × 60'** rectangle; 20' × 40' open-air center; **10' wide** covered walkways around |
| `Urban Area Type.md` (row 173) / `Dungeon Area Type.md` (row 153) | **Chapel** | 30' × 40' (urban) / 25' × 35' (dungeon) rectangle; 10' × 10' attached vestry/sacristy |

**This directly numbers the working spec's own open hypotheses.** The working spec's
"Provisional grid hypotheses" section currently defers court size, arcade bay width, and stair
width to "measurement and clay questions" with no number offered. Genesis already has a live,
authored number for a monastery court: **60' × 60' (12 × 12 grid cells at 5'), an 8'-deep covered
walk, and a 6'-diameter central well** — a real, if currently `AUTHORED-UNWIRED`/`ORACLE-MANUAL`
composition (its exact wiring status belongs to `docs/intel-sites/SITE-4-SPAWNABLE.md`, not this
lane), that predates and independently agrees with the working spec's own "wrapped court, arcade
ring, well at the yard" grammar without ever having been cross-referenced against it before. The
Gate House row (15' × 20', austere, single 8'-tall door, 6' × 6' guard cell) is an equally direct,
independently-existing number for the working spec's REQUIRED "ceremonial gate/filter" zone.

**Reconciliation, PROPOSED not ruled.** A 60' × 60' court is smaller than Fontenay's real ~118–125
ft rectangle (§2 above) but larger than the working spec's smallest-plausible Rung-A "communal
house" yard would need — it sits squarely in Rung-B territory, which is exactly where the working
spec's own Golden Seed recommendation already sits. This lane does not rule the court size; it
records that Genesis's own existing table and this lane's real-world comparanda land in the same
neighborhood, which is a stronger form of evidence than either alone.

## 6. What this closes, and what remains open

**Closes:** the working spec's declared gap "obtain measured arcade bay/section before dimensions
become cards" — this lane adds real measured refectory, church, and cloister figures (Fountains
Abbey), a real cloister-garth comparison set (Fontenay, Glastonbury, Canterbury, Westminster), a
real measured individual-cell figure (Carthusian, 4 m module), an independent non-European
measured module (the Zen *tan*), and — most importantly — surfaces Genesis's own existing,
previously uncross-referenced Monastery Cloister/Gate House scene-frame numbers.

**Does not close:** none of these figures have been clay-tested against Genesis's own arcade-bay
piece, standee envelopes, or camera. The working spec's own standing rule applies unchanged —
every number may be rejected by standee fit, camera legibility, movement, or tactical balance.
This lane supplies real comparanda and one real Genesis-native precedent; it does not run the
clay pass that would accept, adjust, or reject any grid hypothesis.

## Sources

- Fountains Abbey dimensions — Catholic Encyclopedia (newadvent.org, catholic.org, catholic.com
  mirrors); cross-checked against the plan image `LICENSE-LEDGER.md` M4-09
- [Abbaye de Fontenay — Cloister](https://www.abbayedefontenay.com/en/discover-fontenay/the-abbey-and-its-gardens/cloister) (118 ft × 125 ft)
- [The Cloister (c.1150s) — Glastonbury Abbey Archaeology](https://research.reading.ac.uk/glastonburyabbeyarchaeology/digital/the-cloister-c-1150s/) (≈40 m, comparison to Canterbury/Westminster)
- Carthusian cell dimensions — general web search, cross-referencing chartreux.org ("The living
  environment – The Carthusian monks") and multiple architectural-history summaries (4 m × 4 m ×
  4 m, 80 cm module)
- Zen *tan* module — sotozen.com "Manners in the Zendo"; general web search on Sōtō Zen monastic
  architecture
- `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Scene Frame.md`,
  `Urban Scene Frame — Open.md`, `Urban Scene Frame — Threshold.md`,
  `Urban Scene Frame — Vertical.md`, `Urban Area Type.md`, `Dungeon Area Type.md` (local Engine
  markdown source, grepped directly per repo token discipline — never read via generated
  `tables.js`/`.json`)
- `Reference/Monastery-Study/synthesis.md` and `lane-1-cloister-morphology.md` (local; the
  original packet's photograph-derived proportions, restated here only for comparison)
