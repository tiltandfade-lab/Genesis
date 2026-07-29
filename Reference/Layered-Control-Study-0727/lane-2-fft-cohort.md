STATUS: EVIDENCE DRAFT — CODEX ADVERSARIAL DISPOSITION RECORDED IN `synthesis.md` (2026-07-28)

---
type: research-note
study: LAYERED-CONTROL-STUDY-0727 lane 2
status: EVIDENCE GATHERED 2026-07-27 — nothing here is ruled
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/`
  (121 map ids × 5 views, `<mapId>_<view>.gif`), READ IN PLACE in the sibling `genesis/`
  worktree — the archive is git-ignored and absent from `Genesis-sites/`. Map names
  cross-referenced from `study-archive/tools/libfft/fft.h` (`fft_map_list`, ids 0–127).
boundary: THE FFT BOUNDARY (GOLDEN-SITES-CATALOG) applies in full. Relational shape-grammar
  study only. **No FFT image was copied out of the archive, into this packet, or into this
  worktree**; no map was reconstructed; nothing here authorises one-to-one layout conversion.
view semantics: view 0 is a near-orthographic top-down plan; views 1–4 are the four isometric
  rotations. (Discovered and recorded by the Camp Study's lane 4; re-confirmed here.)
---

# Lane 2 — The FFT cohort: how the board-grammar authority handles two control systems

## 0. Sampling and method

Fourteen images read: thirteen view-0 plans and one isometric. Map ids and why each was chosen are
in §4. Names were extracted programmatically from `fft_map_list` (lines 3637–3765 of `fft.h`), and
the cluster tally in §1 was computed rather than eyeballed.

The cohort was selected on a **narrative** criterion — maps whose fiction is two persistent claims
over one host — and then read for **spatial** content. That ordering matters: it is the only way to
find out whether FFT's boards express the layering at all, or only its story.

---

## 1. The headline structural finding: FFT expresses layered control by SPLITTING THE MAP

**78 of 116 named playable maps (67.2%) belong to one of twenty multi-map host clusters.** Excluding
the nineteen named wilderness maps, the two tutorials and the Arena, the figure rises to
**78 of 94 built/settlement maps — 83.0%.**

The clusters, by id:

| host cluster | map ids | n |
|---|---|---:|
| Orbonne Monastery | 56, 62, 57–61 (Book Storage 1F–5F) | 7 |
| Deep Dungeon | 105–114 | 10 |
| Limberry Castle | 15, 16, 17, 18, 19 | 5 |
| Lesalia | 2, 4, 97, 98, 99 | 5 |
| Goland Coal City | 27, 28, 29, 30, 39 | 5 |
| Bethla Garrison | 64, 65, 66, 67, 68 | 5 |
| Igros Castle | 1, 9, 10, 11, 92 | 5 |
| Dorter Trade City | 31, 32, 33, 34 | 4 |
| Riovanes Castle | 5, 6, 7, 8 | 4 |
| St. Murond Temple | 3, 50, 51, 52 | 4 |
| Lionel Castle | 12, 13, 14 | 3 |
| Zeltennia | 20, 21, 45 | 3 |
| Zaland | 35, 36, 37 | 3 |
| Goug Machine City | 38, 40, 41 | 3 |
| Yardow Fort City | 25, 26 | 2 |
| Warjilis | 42, 43 | 2 |
| Zarghidas | 47, 48 | 2 |
| Windmill Shed | 73, 103 | 2 |
| Belouve Residence | 23, 104 | 2 |
| Murond Death City | 53, 69 | 2 |

And the naming grammar is explicit about the layering:

- **Dorter Trade City → Slums in Dorter → Hospital in Slums → Cellar of Sand Mouse** — a four-deep
  chain from public commerce down to a covert room, each rung its own board.
- **Goland Coal City → Colliery Underground 1F/2F/3F → Underground Passage in Goland** — the mine
  host and its five sub-boards.
- **Orbonne Monastery → Chapel → Underground Book Storage 1F–5F** — the institution and the archive
  its own order does not fully control.
- **Yardow Fort City → Weapon Storage of Yardow** — the back room, as a separate map.
- Every castle: **At the Gate / Inside / Office / Citadel / Underground Cemetery** — public face,
  interior, private office, secure core, buried layer.

**This is the honest verdict, and it is a warning, not a template.** Final Fantasy Tactics never
puts two control regimes on one board and lets the player move between them. It ships them as
*adjacent boards of the same named host* and moves the player by cutscene. Genesis has ruled the
opposite: the transform may not grow the map, and promotion follows semantic overflow rather than
level size (`docs/DESIGN.md`, 2026-07-26). **So on its central question, the board-grammar
authority does not solve our problem — it solves the problem by refusing it.**

That is a real finding and it should be stated plainly rather than smoothed over. Genesis is
attempting something FFT did not attempt.

---

## 2. Where FFT *does* put two regimes on one board — four transferable devices

Four maps in the cohort carry the layering inside a single board. Between them they give four
devices, none of which enlarges the map.

### 2.1 The owned diagonal — MAP032 *Slums in Dorter* (view 0)

A single narrow dirt lane runs corner to corner. Everything else is dense timber mass: roof planes,
stair heads, balcony decks, doors at several levels, with green scrub only in the two far corners.
There is one public route and it is the *worst* ground on the board — overlooked from every side,
with no cover on it.

Compare **MAP031 *Dorter Trade City*** (the same host, one rung up): the same relational shape — a
paved climb running diagonally between two large flanking masses — but the masses are *two* big
blue-roofed institutional buildings instead of *twenty* small timber ones, and the surface is
dressed stone instead of dirt.

> **Device 1 — grain, not topology.** The layer under a host has the *same route topology* as the
> host and a mass grain several times finer. The public spine survives; the number of owners on
> each side multiplies. This is the single most reusable observation in the lane, because it means
> a Genesis LC-3 expression can be generated by **re-partitioning** an existing composition rather
> than laying out a new one.

### 2.2 The single controlled approach — MAP091 *Thieves Fort* (view 0)

A compact walled compound on an island: stone and timber ranges around a small green yard, water on
every side, and one timber pier reaching in from the bottom edge. The fort itself is architecturally
ordinary. What makes it *theirs* is that there is exactly one way in and they are standing on it.

> **Device 2 — a claimant is expressed by owning the approach, not by owning the architecture.**
> Zero new geometry: the host's existing portal plus an occupancy fact.

### 2.3 The appended strip — MAP026 *Weapon Storage of Yardow* (view 0)

A tall, narrow board roughly one to two cells wide: a corridor of mauve stone with timber racks and
crates along both sides and unlit voids at one edge. The entire second-regime space is a strip.

> **Device 3 — the back room is a strip, not a room.** The LC-2 rung's spatial cost can be a
> single-file corridor appended to the host's envelope, with storage on both walls and the property
> in reach of the corridor. It reads instantly as "someone else's" because the host's public
> circulation is never one cell wide.

### 2.4 Void plus owned light — MAP039 *Underground Passage in Goland* (view 0)

Almost the entire board is black. Through it runs a thin chain of timber platforms and stair heads,
with two small warm pools of light and one pale figure-scale highlight. Nothing is lit that someone
did not light.

> **Device 4 — the covert route is defined by darkness and by two owned lamps.** This is the
> CAUSAL LIGHT LAW arriving from the board-grammar side: the second claimant's route is legible
> *because* its lighting has an owner and the rest does not. Cheap, dramatic, and it satisfies the
> readability requirement without inventing an unexplained lamp.

---

## 3. Three further readings worth banking

**3.1 The sub-layer's order relative to its host encodes *who* controls it.**
- Under a **trade city**, the layer is *less* ordered: MAP032's slum is fine-grained, irregular and
  organic against MAP031's two big regular masses.
- Under a **monastery**, the layer is *more* ordered: MAP057 *Underground Book Storage 1F* is a
  rigidly symmetric masonry hall with repeated shelf bays projecting from both side walls and a
  black unlit corridor down the centre — against MAP056 *Orbonne Monastery*'s irregular green
  ground, water edge and pitched roof mass.

So the same "there is a layer beneath" fact produces opposite grain shifts depending on the
claimant. An *informal* claimant refines and disorders the grain; a *deeper institutional* claimant
coarsens and regularises it. That is a generator rule, not a mood: **the grain delta is a function
of the claimant's formality, not of depth.**

**3.2 FFT puts the covert room in an adjacent ruin, not in a basement.**
MAP034 *Cellar of Sand Mouse* is, in the isometric, an **outdoor** composition: a broken stone
structure with a collapsed arch on a wooded hillside, a paved court in front, a timber lean-to
against one wall, trees stepping up behind. The "cellar" of an inn is staged as a *separate,
disused, adjacent structure* — precommitted, obviously old, visibly not part of the pub.

This is a direct, independent confirmation of the ontology's overflow law (§4.2 clauses 2 and 4):
the expansion capacity was **licensed and visible before it was useful**. FFT did not add a room to
the pub when the plot needed one; it pointed at a ruin that was already there.

**3.3 An interior institutional board can be almost entirely black.**
MAP033 *Hospital in Slums* (view 0) is one small lit room — a wall, a window, a doorway — inside a
vast unlit envelope. Confirms that a bounded institutional interior does not owe the camera a
fully lit floor plan, and that a tiny lit knot inside a large dark envelope is a legitimate,
shipped composition.

---

## 4. The cohort, with selection rationale

| id | name | why in cohort | what it gave |
|---:|---|---|---|
| 31 | Dorter Trade City | public host of the deepest layering chain in the corpus | the host reading for the grain comparison |
| 32 | Slums in Dorter | the informal layer of that host | **device 1** (owned diagonal / grain shift) |
| 33 | Hospital in Slums | an institution inside the informal layer | one lit knot in a dark envelope |
| 34 | Cellar of Sand Mouse (views 0 and 1) | the corpus's canonical covert venue-room | the adjacent-ruin finding (§3.2) |
| 96 | Pub | the tavern host itself | two floor materials, an internal void, a service edge; no covert layer visible on the board |
| 26 | Weapon Storage of Yardow | the back room of a fort city | **device 3** (appended strip) |
| 27 | Goland Coal City | mine host under a second claim | snowbound surface city; the split is not on this board |
| 28 | Colliery Underground First Floor | the mine's sub-board | pale, open, irregular working ground |
| 39 | Underground Passage in Goland | the covert route through the mine host | **device 4** (void + owned light) |
| 40 | Slums in Goug | second informal-layer sample | raised central timber deck in broken ground — confirms §3.1's grain reading |
| 56 | Orbonne Monastery | institution host | irregular ground, water edge, roof mass |
| 57 | Underground Book Storage 1F | the archive beneath it | **§3.1's opposite grain shift** (more ordered, not less) |
| 91 | Thieves Fort | a host whose control has changed hands | **device 2** (owning the approach) |

---

## 5. What this lane changes about Site 8

1. **The FFT precedent cannot be copied.** Its answer to layered control is a second board. Ours
   must be a delta on one board. Where the two disagree, the DESIGN.md ruling wins.
2. **Four devices transfer, and all four are free.** Owned diagonal, owned approach, appended strip,
   void-plus-owned-light. None enlarges the materialization window; three of the four are pure
   occupancy or lighting facts over existing geometry.
3. **Grain is one strong conditional visual instrument.** Where construction and tenure facts
   license re-partitioning, an LC-3 profile may subdivide masses, multiply doors, or change
   surface without changing host topology. Other valid claims may leave grain untouched.
4. **Claimant formality is a hypothesis for the direction of a licensed grain shift.** The sampled
   informal claimants refine and disorder while deeper institutional claimants coarsen and
   regularise. Changed-seed and broader cultural evidence must test this proposed bias; formality
   alone never licenses construction.
5. **The corpus supplies no many-claimant board.** Nothing in the 121 maps reads as N equal claims
   around one shared centre. The khan case from lane 1 has no FFT equivalent, which is a genuine
   evidence gap for the open question in the synthesis.
