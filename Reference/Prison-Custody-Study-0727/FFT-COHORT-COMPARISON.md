STATUS: EVIDENCE DRAFT — CODEX ADVERSARIAL DISPOSITION RECORDED IN `synthesis.md` (2026-07-28)

---
type: research-lane
study: SITE-6-PRISON-CUSTODY measured-breadth gap-close (2026-07-27 campaign)
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

# FFT COHORT COMPARISON — Site 6 Prison/Custody

This is the evidence that directly closes Site 6's declared gap that *"no direct tactical-RPG
prison-map cohort is available in this worktree"*
(`Reference/Prison-Custody-Study/SOURCE-LEDGER.md`, "Declared gaps" §1) and the parallel line in
`synthesis.md` §14. The Mine/Workshop and Camp studies solved the same problem for their sites by
reading the 121-map archive in place; this lane does the same for Prison/Custody — with a
different, more honest result.

## 0. The honest headline: unlike Mine/Workshop, FFT has no named prison

`study-archive/tools/heretic/src/map.c`'s full 121-entry name list contains no map named
"Prison," "Jail," "Gaol," "Dungeon" (as a custody label — several maps are geographically
underground without being custodial), or any direct synonym. This mirrors the Camp study's
finding of **zero** literal camp maps in the same corpus, not the Mine study's finding of a
direct named hit (Colliery Underground). **Site 6 gets the Camp study's result, not the Mine
study's.** This is recorded plainly rather than stretched to claim a direct hit that does not
exist.

What the corpus does contain is a small set of maps whose names or visible content touch one or
more of Site 6's eight operating circuits (`Reference/Prison-Custody-Study/synthesis.md` §5) —
disposition/execution, captured-stronghold reuse, and restraint/underground-holding-adjacent
spaces — without any of them being a custody-building map in the Guard-Post/Mine sense. Six
candidates were identified by name-scan and sampled visually; two earn a real finding, three are
honestly recorded as non-hits, and one (id 39, already flagged by the Mine study) is confirmed
excluded for the same reason it was excluded there.

| id | name | candidate reason | verdict |
|---|---|---|---|
| 63 | Golgorand Execution Site | disposition/execution edge (named in the working spec's circuit 8) | **direct hit — see §1** |
| 91 | Thieves Fort | criminal-stronghold / faction-seized-custody adjacency | **partial hit — see §2** |
| 115 | Banished Fort | disposition-as-exile theme (name only) | **weak/thematic only — see §3** |
| 17 | Underground Cemetery of Limberry Castle | crypt/restraint-adjacent guess | **non-hit — see §4** |
| 34 | Cellar of Sand Mouse | "cellar"/hideout guess | **non-hit — see §4** |
| 26 | Weapon Storage of Yardow | secure-storage/staff-only-edge guess | **non-hit — see §4** |

**Method note, carried over from the Camp/Mine/Lair studies:** view `_0` is a near-orthographic
top-down plan; views `_1`–`_4` are the four isometric rotations. Both were sampled.
**Sampling:** 11 images viewed across the six candidates: `63_0`, `63_1`, `63_2`, `91_0`, `91_1`,
`115_0`, `115_1`, `17_0`, `34_0`, `26_0` (10 unique views; `63` was sampled at three angles
because it produced the packet's strongest finding).

## 1. Golgorand Execution Site (id 63) — the direct hit, for disposition rather than confinement

`63_0` (plan) shows a walled rectangular courtyard entered through a gated archway with heraldic
banners; a raised wooden structure with steps sits at the courtyard's center on open grass.
`63_1` and `63_2` (isometric) confirm the structure is a tall timber scaffold with a raised
platform and a vertical frame element — read most plausibly as a gallows/execution scaffold,
consistent with the map's own name — standing inside a fully enclosed masonry perimeter with
exactly one gated threshold.

This is a genuine, useful hit for one specific part of Site 6's grammar: the working spec's own
circuit 8 ("disposition / continuity") names **execution** explicitly as one committed
disposition outcome, and its §"Occupancy states and hooks" lists "stop an execution" as a named
outside-start hook. FFT's Golgorand independently confirms three relational facts the working
spec currently states only in prose:

- **`FFT-PC-1` — a disposition-edge structure earns its own walled, single-threshold enclosure**,
  separate from any holding/cell mass. Golgorand has no visible cells at all — it is *purely* a
  disposition site, which is itself evidence that Site 6's "disposition edge" (execution
  specifically) is a legitimate standalone *materialization* under the working spec's
  materialization-window logic (`GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` §4), not something
  that must always be co-located with the custody mass that produced the sentence.
- **`FFT-PC-2` — the controlled threshold is expressed as a single heraldic gate**, not a
  guardhouse or checkpoint building. This is a legitimate, cheap alternative to the working
  spec's "keeper landing/deck" vocabulary for a site whose entire purpose is one witnessed event
  rather than ongoing custody — worth recording as a licensed variant for a disposition-only
  materialization rather than a change to the deck's own required grammar.
- **`FFT-PC-3` — the scaffold is the tallest, most silhouette-dominant object in the
  composition**, exactly the "elevation hierarchy" rule the Mine and Guard Post studies already
  extracted independently from this same corpus. Confirms (a fourth independent confirmation,
  now) that FFT consistently makes its single most narratively important object the tallest
  thing in frame, regardless of site family.

**What this does not close:** Golgorand is disposition/execution evidence, not confinement/cell
evidence. It supplies nothing toward the working spec's cell-front, grille, control-landing, or
property-custody grammar. It is recorded as a targeted, honest partial closure of one named
circuit, not a substitute for the still-absent custody-building cohort.

## 2. Thieves Fort (id 91) — partial hit, for the "faction-seized prison" occupancy state

`91_0` (plan) and `91_1` (isometric) show a dense, irregular stacked fortified compound on a
rocky islet or promontory surrounded by water, built up in tight vertical tiers of
timber-and-plaster construction — visually closer to the corpus's slum/warren density language
(per the Camp study's lane 4 findings on FFT roof-adjacency) than to any formal institutional
massing.

This is useful, narrowly, for exactly one line in the working spec's own "Occupancy and hooks"
section: *"faction-seized prison"* and *"prison run by former prisoners."* A criminal
stronghold that has been informally repurposed into a holding site (captives kept by an outlaw
faction rather than a civic institution) would plausibly look like Thieves Fort's dense, ad-hoc,
non-institutional massing rather than like either doctrine card's more legible public/civic
form. This is recorded as **partial** because nothing in the sampled views shows an actual cell,
restraint, or control position — it is evidence for the *occupancy-state silhouette* of an
irregular, faction-controlled holding site, not for its custody mechanics.

## 3. Banished Fort (id 115) — weak, thematic-only hit

`115_0` and `115_1` show a compact hillside/cliff-edge fortification with a stone keep tower and
a single approach road cut into rock — a conventional small fort, structurally unremarkable next
to the corpus's other fortifications (Igros, Lionel, Limberry). The map's *name* ("Banished")
directly names exile as a disposition, which the working spec's own circuit 8 lists as a
disposition option alongside execution, ransom, and transfer. But nothing in the visible
architecture distinguishes it from any other small fort in the corpus — there is no unique
"exile site" grammar to extract, only the naming coincidence. **Recorded honestly as a naming
echo, not visual evidence**, per this study's method note (carried over from the Mine study's
`MW-FFT-4`: a name match is not proof of visual kinship).

## 4. Three honest non-hits

- **Underground Cemetery of Limberry Castle (id 17):** `17_0` shows a narrow masonry corridor
  running between two rectangular sunken pools (rendered teal-green) with grave/altar markers at
  the near end. This is a funerary/hazard space (poison or ritual pools), not a custody space —
  no cell, grille, or restraint element is present. Non-hit.
- **Cellar of Sand Mouse (id 34):** `34_0` shows an ordinary wooded clearing transitioning into a
  small stone building at grade — visually a bandit hideout entrance, not a holding space. No
  restraint, threshold-control, or repeated-cell evidence. Non-hit.
- **Weapon Storage of Yardow (id 26):** `26_0` shows a plain masonry corridor lined with wooden
  storage doors — a legitimate reference for the working spec's generic "staff-only property
  edge" vocabulary in the abstract (secure storage behind a corridor of doors), but it is
  explicitly an armory, not a prison, and adding it as prison-cohort evidence would repeat
  exactly the naming-over-visual-kinship error `MW-FFT-4` warns against. Recorded as a
  **non-hit for Site 6 specifically**, even though the corridor-of-doors grammar is real and
  already available to the working spec's inherit list from Site 1/Site 5 vocabulary.

## 5. Underground Passage in Goland (id 39) — confirmed excluded, cross-referenced

The Mine study's `FFT-COHORT-COMPARISON.md` §3 already documents id 39 as a dressed, masonry,
temple/treasury-like interior wrongly implied to be mine-adjacent by its name alone, and
explicitly flags it as "a 'Layered Control'–eligible reading... exactly the kind of cross-host
transform Site 8 exists to describe." That finding is not re-litigated here; it is cross-
referenced because a dressed underground passage beneath a working settlement is architecturally
closer to a **secret/covert custody annex** than to anything sampled directly for this lane. No
new claim is made — this is a pointer for a future Site 6/Site 8 layered-control study, not
Prison/Custody cohort evidence in its own right.

## 6. What this closes, and what it does not

**Closes:** the specific declared gap that no FFT evidence exists for Site 6 at all. Two real,
checkable findings now exist (`FFT-PC-1`/`FFT-PC-2`/`FFT-PC-3` from Golgorand; the Thieves Fort
occupancy-silhouette reading), reached honestly rather than by stretching a non-hit into a hit.

**Does not close, and should not be read as closing:** a direct tactical cell-block/gallery/
control-landing cohort comparable to the Mine study's Colliery Underground floors. **FFT simply
does not contain one.** Route-choice, elevation, objective-placement, and fixed-camera
legibility comparison against actual Site 6 clay (which does not exist yet) remain exactly as
open as `GOLDEN-SITES-PROOF-QUEUE.md` already states for every un-clayed site. This lane
supplies disposition-edge and occupancy-silhouette morphology evidence, not cell-grammar
evidence — the working spec's cell-front, grille, and control-landing vocabulary remains
un-cross-checked against any tactical-RPG cohort and should be reported that way, not folded
into a false "FFT: PASS" claim.

## 7. Candidate grammar additions (PROPOSED — not ruled)

Offered in the same "current design defaults awaiting Adam's promotion" spirit as the Mine and
Lair studies' rule lists. None of these may be read as founder-ruled.

- **PC-FFT-1 — A disposition-only site (execution, in this case) may materialize as its own
  small, walled, single-gate enclosure, entirely separate from any custody mass**, when the
  active window only needs the disposition event and not ongoing holding. Directly supports the
  working spec's materialization-window discipline (commit the smallest honest window) for a
  scene whose entire purpose is one scheduled event.
- **PC-FFT-2 — A faction-seized or informally-repurposed holding site may read through dense,
  irregular, non-institutional massing** (Thieves-Fort-style stacked construction) rather than
  through any formal civic-jail silhouette, as a cheap, legible way to distinguish the
  "faction-seized prison" occupancy state from the doctrine-card civic baseline without a
  dedicated new structure kit.
- **PC-FFT-3 — A name match is not a visual match**, restated for a fourth time across four
  independent studies (Mine's `MW-FFT-4`, this lane's Banished Fort and Weapon Storage findings).
  This is now a load-bearing enough pattern across the corpus that a future study reading this
  archive should treat it as a standing method warning rather than rediscover it each time.
