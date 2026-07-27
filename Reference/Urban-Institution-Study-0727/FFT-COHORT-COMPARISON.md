STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-note
study: SITE-10-URBAN-INSTITUTION gap-close (2026-07-27 campaign)
created: 2026-07-27
status: EXTENDS Urban-Study lane-5-fft-cohort.md and Monastery-Study lane-5 — does not
  reclassify anything either already covers
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/` — 121 map ids
  x 5 views, `<mapId>_<view>.gif`, read in place. View 0 = near-orthographic top-down plan;
  views 1-4 = the four oblique rotations. Name table: `study-archive/tools/heretic/src/map.c`,
  `map_list[]`.
boundary: THE FFT BOUNDARY (GOLDEN-SITES-CATALOG) applies in full. This is relational
  shape-grammar induction. No FFT image was copied into this repository or study; images were
  converted from the archive's GIFs to PNGs in a scratch directory outside any repo, viewed,
  and discarded. No layout is copied; no FFT asset may become a Genesis asset.
reused, not redone: `Reference/Urban-Study/lane-5-fft-cohort.md` already classifies the
  urban/market/street cohort (ids 22, 25, 27, 31, 35, 38, 42, 43, 44, 47, 48, 96, 98, 99,
  103) and is cited, not reclassified. `Reference/Monastery-Study/lane-5-fft-cohort.md`
  already classifies the institutional/sacred cohort (ids 3, 24, 33, 45, 50-52, 54, 56-63,
  65, 70, 95, 96, 100) and is cited, not reclassified.
---

# FFT COHORT COMPARISON — the civic-authority gap

## 0. What this pass adds, and why

Both existing FFT lanes for Site 10's territory are strong on markets, streets, and *sacred*
institutions (temples, monasteries, a school auditorium, a hospital, a public cemetery). Both
have a real gap: **neither examined a genuinely secular civic-authority interior** — a
council chamber, a court, a formal hall of state — even though the working spec's own
golden-seed section names "Courthouse/watch-house... and guildhall" as sibling institutions,
and `BUILDING-PROGRAM-TABLE-FAMILIES.md`'s `BF-CIVIC-AUTHORITY` family (Guildhall, Garrison,
Court) is exactly this program. This targeted extension reads three *new* map ids, chosen
from `map.c`'s name list specifically because their names promise administrative/authority
content and neither prior lane opened them: **id 4, "Office of Lesalia Castle"**; **id 21,
"Zeltennia Castle"**; **id 68, "Bethla Garrison."**

## 1. Method

Three ids, seven views read (4: views 0, 1, 3; 21: views 0, 1; 68: views 0, 1). One
additional view (97: view 1, "Inside Castle Gate in Lesalia") was opened as a sanity check
against Urban-Study's existing gate reading (id 98) and confirmed rather than contradicted
it — not separately tabulated below.

## 2. Findings, checkable against the images

**Finding CA-1 — a repeated three-part civic-assembly grammar, independent of building
name.** All three rooms (a castle "Office," a castle proper, and a garrison — three different
`map.c` name categories) build the *same* three-part composition:

1. a **hanging heraldic banner or tapestry on the room's short end wall** — a single flat
   plane, exactly the kind of cheap "claims the void" object the Urban-Study's lane 6 and
   this working spec's center-claim law already argue for at the market-hall/fountain scale,
   here doing the same job at chamber scale;
2. a **raised dais or step run leading to that end**, distinct from the room's main floor
   level — at id 4 (Office of Lesalia) it is a separate raised wood-floor platform reached
   through a stone archway; at ids 21 and 68 it is a shorter run of steps at the banner end;
3. a **long table down the room's center on a runner or carpet, with chairs/seats flanking
   it** — not a throne alone, and not an altar. This is a *meeting* object, not a *worship*
   object, which is the load-bearing visual distinction between this cohort and the
   Monastery-Study's raised-chancel/altar grammar (lane-5 §1, ids 3/50/51/52).

**Finding CA-2 — records are a wall, not a shelf-prop.** Id 4's "Office of Lesalia Castle"
carries a **full-height bookcase wall** along one long side of the room, running the whole
length from the entry threshold to the raised dais. This is architecture-scaled records
storage, not a single crate or chest prop — direct evidence for the working spec's
`BF-CIVIC-AUTHORITY` inheritance ("records" as a named minimum invariant) at the geometry
level, not just the data level.

**Finding CA-3 — a stone threshold antechamber precedes the chamber proper.** Id 4's fourth
view shows a lower, plain stone-flagged room with a chest, connected to the raised
bookcase-and-table chamber by an arched stone doorway one step up. This is the same
"controlled threshold before the authority space" relation the working spec already names for
its own "Institution threshold" zone (§"Required zones," item 11) — now with a real FFT
composition behind it instead of only prose.

**Finding CA-4 — the assembly-chamber grammar is reused verbatim across unrelated buildings.**
Ids 21 (Zeltennia Castle, a throne-room-named map) and 68 (Bethla Garrison, a military
logistics complex) build the *identical* banner+dais+table composition as id 4's civilian
"Office." FFT is not treating "court," "council," and "garrison headquarters" as
architecturally distinct programs — it reuses one authority-assembly module across all three,
which is independent visual support for `BUILDING-PROGRAM-TABLE-FAMILIES.md`'s own decision
to group Guildhall, Garrison, and Court into one `BF-CIVIC-AUTHORITY` family sharing "a
public or member threshold, recognized authority, decision/assembly space, records,
controlled interior, staff route."

## 3. What this does not show

- **No exterior/frontage evidence.** All three ids read here are interiors. Nothing about how
  a civic-authority building's exterior frontage differs from an ordinary shop bay was
  learned this pass — the existing Urban-Study lane 4/5 frontage findings still carry that
  load alone.
- **No plaza-facing civic building.** None of the three rooms read this pass sits in a
  town-square composition the way Warjilis's market (id 42) or Lesalia's Main Street (id 99)
  do — they are castle/garrison interiors, reached by a separate approach the corpus does not
  show here. The working spec's "institution threshold distinct from ordinary shopfront
  ownership" zone is evidenced at the *room* scale, not yet at the *street-facing* scale.
- **Only three ids, seven views, one session.** This is a small, targeted extension, not a
  re-audit of the corpus. `Reference/Urban-Study/lane-5-fft-cohort.md`'s own declared-gaps
  section (108 of 121 ids classified from `map.c` alone; only four ids read in three-plus
  views) still applies to the corpus at large.
- **Whether these rooms are walkable/fightable as shown is unconfirmed**, per every prior
  FFT lane's standing caveat — the five-view renders carry no unit tokens or height data.

## 4. Candidate grammar additions (PROPOSED — not ruled)

1. **Add a "banner + dais + long table" composition as a licensed variant for Site 10's
   institution threshold**, alongside the already-ruled hall+fountain market composition, for
   scenes where the sibling institution is a courthouse/guildhall/garrison-headquarters rather
   than a market hall. Distinguishes itself from the Monastery-Study's altar/shrine grammar by
   using a meeting table, not a worship object, as the claimed-void center.
2. **A records wall (a full architectural bookcase run) is a candidate `BF-CIVIC-AUTHORITY`
   fixture**, not merely a records chest — offered as a geometry-scale companion to
   `BUILDING-PROGRAM-TABLE-FAMILIES.md`'s existing "records" data-layer invariant.
3. **A stone threshold antechamber, one step below the chamber proper**, is a candidate
   pattern for the working spec's "Institution threshold" zone — a controlled, materially
   distinct room the player crosses before reaching the authority space, rather than a single
   door in a frontage wall.

None of these three are ruled. They are recorded here as build-order suggestions per the
generator principle, for founder review alongside the other proposals in `synthesis.md`.
