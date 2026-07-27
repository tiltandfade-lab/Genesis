STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-note
study: SITE-10-URBAN-INSTITUTION gap-close (2026-07-27 campaign)
created: 2026-07-27
status: GAP-CLOSE PASS RETURNED — reconciles the working spec to the landed
  BUILDING-PROGRAM-TABLE-FAMILIES.md / URBAN-FABRIC.md, and closes part of the declared
  construction-evidence gap
authority note: this is an evidence record, not the live implementation contract; current
  rules live in `docs/GOLDEN-SITES-CATALOG.md` and the working specification in
  `docs/SITE-10-URBAN-INSTITUTION-SPEC.md`. This pass ADDS evidence and reconciliation to
  that spec; it does not rewrite any of its rulings.
---

# SYNTHESIS — Urban Institution gap-close, 2026-07-27

## 1. What this pass was asked to do

The catalog's status-gate table records Site 10 as `RESEARCHED: PARTIAL`, `FOUNDER-RULED:
PARTIAL`, `BRIEF-CONGRUENT: PARTIAL`, `CLAY-PROVED: OPEN`, with the reason "body/culture
studies returned, but load-bearing construction and visual gaps remain"
(`GOLDEN-SITES-CATALOG.md`, "Golden Site status gates" table). The proof queue names the same
gaps explicitly: measured plans/sections for a frontage bay and market-hall family; direct
construction evidence for the shutter-counter, party wall, gallery/balcony, and roof access;
working-market evidence; a hillside/overlook camera test; broader cultural evidence
(`GOLDEN-SITES-PROOF-QUEUE.md`, "Site 10 — Urban Institution"). Separately, and not yet
reflected anywhere in the working spec, `docs/BUILDING-PROGRAM-TABLE-FAMILIES.md` and
`docs/URBAN-FABRIC.md` both landed as `ACCEPTED DIRECTION` / `BUILT` after the working spec
was written, and `docs/SETTLED-LIFE-SITES-PROGRAM.md` ran a full settled-life demand audit
that touches Site 10's boundary at four separate points. This pass does three things: closes
part of the construction-evidence gap with real measured references (market halls, civic
buildings, one temple ward); reconciles the working spec against the two landed table-family
documents; and reconciles it against the settled-life program's findings.

## 2. What was produced

- **`MEASURED-REFERENCES.md`** — real, dated dimensions/counts for four market-hall
  buildings (Ledbury, Tetbury, Shrewsbury, Sukiennice) and three civic buildings (Lavenham
  Guildhall, Titchfield Market Hall, the former Shire Hall at Llandeilo), plus one temple-ward
  anchor (St Peter Mancroft over Norwich's market place). Closes part of the "no measured
  plan/section for... the market hall" and "civic buildings, temple wards" gaps named in this
  pass's brief; explicitly does **not** close the frontage-bay/party-wall/balcony or
  shutter-mechanism-dimension gaps, which remain open.
- **`FFT-COHORT-COMPARISON.md`** — a targeted, small (3 new map ids, 7 new views) extension of
  the existing Urban-Study and Monastery-Study FFT lanes, closing the specific hole where
  neither prior lane examined a genuinely secular civic-authority interior. Finds a repeated
  banner+dais+long-table assembly-chamber grammar reused verbatim across three unrelated
  buildings (a castle office, a castle proper, a garrison), independent of the FFT boundary's
  restriction on copying layouts.
- **`BREADTH-SWEEP.md`** — reconciles Site 10's boundary against
  `SETTLED-LIFE-SITES-PROGRAM.md`'s already-completed classifications (confirms Site 10 does
  not own the harborfront, the slum host, or the infrastructure-hub host; refines two wording
  points), then runs three new step-0.5 tests: whether the market hall is itself a missing
  program (the load-bearing finding, §3 below), the courthouse-punishment/Site-6 boundary, and
  the town-gate-toll/Site-1 boundary. One cross-media comparator (Disco Elysium's Precinct 41,
  an adaptively reused civic building) confirms the existing adaptive-reuse transform
  mechanism applies cleanly to civic-authority buildings.
- **`LICENSE-LEDGER.md`** + **`images/`** — 11 real-image references (8 CC BY-SA 2.0, 1 CC
  BY-SA 4.0, 1 CC BY-SA 3.0, 1 CC0, 1 public domain), covering two open-post market halls, one
  arcaded-stone market hall, one free-standing arcaded block, two civic-authority/market-hall
  twins, one guildhall, one temple-ward anchor, one historic working-market print, one real
  ensemble photograph of a rebuilt market square, and one honestly recorded correction where a
  candidate pair turned out to show construction-in-progress rather than the intended subject.

## 3. The one load-bearing reconciliation: the market hall has no `BF-` family

This is the most consequential finding in the pass, so it is stated once here plainly rather
than only inside the breadth sweep.

`docs/BUILDING-PROGRAM-TABLE-FAMILIES.md` §2 defines seven authoring families over fourteen
programs, and **none of them is a market hall, exchange, or cloth hall.** `BF-PUBLIC-SERVICE`
(Tavern, Bathhouse, Gambling Den) shares "public arrival, recognition/payment, guest/customer
area" — wrong relationship, there is no guest area in an open-post trading floor.
`BF-CIVIC-AUTHORITY` (Guildhall, Garrison, Court) shares "recognized authority, decision/
assembly space, records" — closer, but a corn-exchange floor has no authority relationship at
all. `BF-LOGISTICS` (Warehouse, Dock-House) shares "receiving/dispatch edge, goods handling" —
closer still on the ground floor, wrong on any upper room. Site 10's own Golden Seed is a
market hall, and yet the very roller family document this pass was asked to reconcile the spec
against has no program for it. That silence is itself the finding, in the same way the
building-program document's own §"What happens to the general d300"/§3 audit found "there is
no ordinary dwelling, no quay, and no conveyance" — this pass adds a fourth silent gap.

**The reconciling evidence, `MEASURED-REFERENCES.md` §1-2:** real market halls do not have one
upper-room program, they have at least three, on the identical open-post-or-arcade ground
floor — pure grain storage (Ledbury), a commodity exchange (Shrewsbury's wool-trading hall),
and civic authority itself, expressed as either a council chamber (Titchfield Market Hall) or
a courtroom (the former Shire Hall, Llandeilo). Two independently surviving, differently
constructed, geographically separated buildings (Hampshire timber-frame; Welsh masonry)
converging on the identical "market ground floor + civic-authority upper room" split is
stronger evidence than either alone.

**The boundary, PROPOSED not ruled:** the market hall is a program `BUILDING-PROGRAM-
TABLE-FAMILIES.md` is missing, not a program Site 10 should invent unilaterally as bespoke
Site-10 geometry outside the family system. Two resolutions are offered, neither chosen here:
(a) add "Market Hall" as a program inside `BF-CIVIC-AUTHORITY`, licensed to share its chassis
with Court/Guildhall/Garrison specifically because the real evidence shows they are
*sometimes the same building*, distinguished only by upper-room arrangement and operating
state; or (b) add a fifth thin family, `BF-MARKET-EXCHANGE`, sharing only the open-post/
arcade ground-floor chassis relationship, the way `BF-SHOP-WORKSHOP`'s four programs share a
customer-edge relationship without being one program. This is offered as a build-order
suggestion for whoever authors the next `BUILDING-PROGRAM-TABLE-FAMILIES.md` wave, per the
generator principle — not a unilateral edit to that shared document, which this pass does not
touch.

## 4. Which `BF-` kits serve Site 10, and what the 42-roll audit proved

Direct answer to the task's reconciliation question, gathered here in one place for the
working spec's addendum to cite.

`BUILDING-PROGRAM-TABLE-FAMILIES.md`'s **42-roll audit** proved that the flat `building-
interior` d300 table is "mechanically additive but semantically unconstrained": a committed
Manor could roll a letter-writing shop or a private hospital; an Apothecary could roll a
printer's basement; a Garrison could roll a mast-maker or an apothecary; and same-seed realm
mirrors preserved the *identical* interior under every realm label. That is the reason typed
buildings now draw from coherent family chassis tables instead of the flat table. **This
matters for Site 10 specifically** because every one of its frontage bays is exactly this kind
of committed, typed building — a Site 10 scene that let a rolled Tavern bay's interior come
back as an Apothecary's stockroom, or let a Guildhall frontage roll the identical layout under
every realm's paint, would be reproducing the 42-roll audit's own failure mode inside the
Golden Seed. The working spec's generation order (step 5, "Generate frontage runs, party
walls, bay owners/programs, and physical shutters") must commit each bay's *program* first and
then draw that program's family/arrangement/state/scene/Spice stack — never the flat d300 —
exactly as `BUILDING-PROGRAM-TABLE-FAMILIES.md` §1's pipeline diagram requires.

| `BF-` family | programs | how it serves Site 10 |
|---|---|---|
| `BF-PUBLIC-SERVICE` | Tavern, Bathhouse, Gambling Den | Hosted frontage-bay venue programs, per `TAVERN-VENUE-ROUTING-BRIEF.md` and the working spec's own "Site 10 supplies public frontage... not a Site 10 subtype" line. Confirmed unchanged by this pass. |
| `BF-CIVIC-AUTHORITY` | Guildhall, Garrison, Court | The catalog's own "Courthouse/watch-house, temple, and guildhall are sibling institutions on the same slice grammar" line — this is that family. §3 above proposes it may also license the market hall's civic-upper-room variant. |
| `BF-RITUAL-INSTITUTION` | Temple | The "temple" sibling institution named at the same catalog line; `MEASURED-REFERENCES.md` §3's St Peter Mancroft anchor is real evidence for a temple as the plaza's dominant landmark alongside or instead of the market hall/fountain. |
| `BF-LOGISTICS` | Warehouse, Dock-House | The working spec's "Service/delivery edge" zone and the eight operating circuits' "Commerce and goods" circuit — goods arrival/storage/waste destinations, per `SETTLED-LIFE-SITES-PROGRAM.md` §4.2's own finding that `BF-LOGISTICS` "already has Warehouse and Dock-House." Does **not** extend to the water edge itself (§1 of `BREADTH-SWEEP.md`). |
| `BF-SHOP-WORKSHOP` | Smithy, Apothecary, General Store, Arcanist | Ordinary frontage-bay shopfront programs — the customer-edge/transaction/stock relationship the working spec's bay-owner/bay-program facts must commit to before drawing an interior. |
| `BF-HOUSEHOLD-ESTATE` | Manor | **Does not serve Site 10 directly.** `SETTLED-LIFE-SITES-PROGRAM.md` §3.1 places the household program outside Site 10 entirely (a separate habitation host, folding into the Manor's low end per Adam's Q1 ruling). A Manor may appear adjacent to or behind a Site 10 slice as a noble-quarter institution, but Site 10 does not own housing. Recorded here so the working spec does not silently claim it. |
| `BF-CUSTODY` | Prison/Custody | **Does not serve Site 10.** Owned by Site 6. `BREADTH-SWEEP.md` §3's courthouse-punishment test names the exact handoff: a non-custodial public punishment fixture (stocks/pillory) stays Site 10; any actual custody lifecycle crosses to Site 6, "however small." |

## 5. Reconciliation against `URBAN-FABRIC.md`

`URBAN-FABRIC.md` is `BUILT` (2026-07-26 audit: "typed buildings, tavern surfaces, and lazy
districts live; Golden-grade semantic/spatial venue composition remains unbuilt"). Its own
§-1 states plainly: "the tavern is an ordinary venue/host program... Site 10 may host its
urban-frontage expression" — already consistent with the working spec, no change needed. What
is genuinely new for the working spec's roller-preservation section to record: `rollBuilding`
+ `data/building-kits.js` is `LIVE` for ten typed kinds including Tavern, temple, guildhall,
manor, garrison, court, bathhouse, warehouse, and the shop kinds, and district minting is
`LIVE` and write-once per settlement node. This is the actual current implementation Site 10's
frontage bays would draw from today, sitting a layer below the not-yet-built
`BUILDING-PROGRAM-TABLE-FAMILIES.md` family stack — both facts belong in the working spec's
`§Current-roller preservation` section, and neither was named there before this pass.

## 6. Honesty check against the depth law

The depth law requires a breadth sweep, a real-image reference lane with per-image license
ledgers, and an FFT cohort comparison. All three now exist as targeted extensions for Site 10,
closing the specific construction-evidence and reconciliation gaps named in this pass's brief.
This pass does **not** claim:

- that Site 10 is `CLAY-PROVED` — no clay fixture exists, and none was built this pass;
- that the market-hall/`BF-CIVIC-AUTHORITY` overlap, or any other proposal in this packet, is
  founder-ruled — every candidate is `PROPOSED` per the generator principle;
- that the frontage-bay, party-wall, balcony, or shutter-mechanism measurement gaps are
  closed — they are not, and `MEASURED-REFERENCES.md` §4 says so explicitly;
- that the working spec's existing rulings (functional capsule, deck, growth ladder, eight
  operating circuits, generation order) have changed in any way. They have not been touched.

## 7. Proposed status-gate line (this document's authority only — not the shared catalog)

Per the task's honesty-gates instruction, this proposal lives only in this packet and in
`SITE-10-URBAN-INSTITUTION-SPEC.md`'s own addendum — the shared `GOLDEN-SITES-CATALOG.md`
status table is untouched by this pass.

**Proposed:** `RESEARCHED: PARTIAL` (unchanged — this pass closes part of the declared
construction-evidence gap, specifically market-hall and civic-building measured references and
the civic-authority FFT cohort, but the frontage-bay/party-wall/balcony/shutter-dimension gaps
and broad non-European cultural evidence remain genuinely open, so a full `PASS` is not
honestly claimable yet). `FOUNDER-RULED: PARTIAL` (unchanged — no card selection was ruled
this pass). `BRIEF-CONGRUENT: PARTIAL` (unchanged — this pass adds an addendum and
reconciliation, not a restructuring of the existing fifteen-section standard). `CLAY-PROVED:
OPEN` (unchanged — no fixture exists).

This is a proposal for Codex's adversarial review, not a self-declared final status.
