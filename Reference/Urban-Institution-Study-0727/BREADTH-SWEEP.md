STATUS: EVIDENCE PACKET — CODEX ADVERSARIAL DISPOSITION APPLIED 2026-07-28

---
type: research-note
study: SITE-10-URBAN-INSTITUTION gap-close (2026-07-27 campaign)
created: 2026-07-27
status: GAP-CLOSE PASS — "what else could this site be," tested through the concepting
  guidelines' step 0.5 classification
authority note: this is an evidence record, not the live implementation contract; current
  rules live in `docs/GOLDEN-SITES-CATALOG.md` and the working specification in
  `docs/SITE-10-URBAN-INSTITUTION-SPEC.md`. This pass ADDS evidence to that spec; it does not
  rewrite any of its rulings.
---

# BREADTH SWEEP — Site 10 boundary tests

The depth law requires a breadth sweep before a site's research gate can be believed. Site 10
already has an exhaustive breadth pass sitting one document away —
`docs/SETTLED-LIFE-SITES-PROGRAM.md` §3 ran the concepting guidelines' step 0.5 test against
seven settled-life demand candidates (domestic/lodging, port/harborfront, entertainment
venues, slums, home-settlement fabric, infrastructure hub, flooding), several of them
explicitly against Site 10's own boundary. **This pass does not redo that work.** It (1)
states what that program's findings mean for Site 10, plainly, in one place, because the
task asks this spec to reconcile against it; and (2) runs three *new* step-0.5 tests that
program did not cover, at the institution-building scale rather than the settled-life-slate
scale.

## 1. What `SETTLED-LIFE-SITES-PROGRAM.md` already settled about Site 10's boundary

| candidate | that program's classification | what it means for Site 10 |
|---|---|---|
| **Entertainment venues** (tavern, theater, gambling den) | **(b) venue fixture**, not a Site 10 subtype — `BF-PUBLIC-SERVICE` already names Tavern/Bathhouse/Gambling Den; theater needs one new fixture (`VENUE-ASSEMBLY-01`), not a new site | Site 10 hosts these as **frontage bays**, per the working spec's own line: "A town tavern... is a Tavern venue program hosted by Site 10's urban fabric, not a Site 10 subtype." Confirmed, not contradicted, by this pass. |
| **Port/harborfront** | **(a) new host program** — waterside route service and cargo custody; explicitly NOT Site 10 ("Site 10 is the nearest existing host and it does not fit: its proof is aggregation and public frontage, and a quay's operating model is throughput") | Site 10 does **not** own the water edge. `BF-LOGISTICS` (Warehouse, Dock-House) already supplies the *buildings*; the quay/tidal ground is a future, separate site-grade item. This working spec's own "Service/delivery edge" zone should name water/goods handoff to a hosted `BF-LOGISTICS` building, not invent a quay. |
| **Slums/warren** | **(a) new host program** — habitation at density, sharing §3.1's dwelling family at its aggregate rung; explicitly not Site 2 (fails the "what persists"/"which way it faces"/"who it serves" tests) | The catalog's existing "Inherits... the guest family's shanty quarter as the adjacent district expression" line is **directionally right but ownership-imprecise** — the shanty quarter is not Site 10's to inherit; it is the still-unbuilt slum host's aggregate expression standing *next to* Site 10's slice. Recorded as a wording note for the working spec, not a contradiction of its geometry claim. |
| **Infrastructure hub** | **(a) new host program** — conveyance/utility, its own family (`BF-CONVEYANCE`), entering from the dungeon walk, not the urban walk | Confirms the working spec's own "Vertical way... cellar" language is a **connection point to**, not ownership of, the infrastructure-hub host. Site 10's zone list already treats the cellar/vertical-way honestly as an access relation rather than claiming the underside as Site 10 territory. |
| **Home-settlement fabric** | **not a site** — the layer above every settled-life host, owned by `URBAN-FABRIC.md` | Confirms Site 10 is a **slice within** that fabric, never the fabric itself — consistent with the working spec's own "The town at large stays walk/map fabric" line. |

**Reconciliation verdict:** nothing in `SETTLED-LIFE-SITES-PROGRAM.md` requires a change to
Site 10's functional capsule or invariants. It sharpens two boundary statements (harborfront,
slums-ownership wording) that this pass records as `PROPOSED` refinements in the working
spec's addendum rather than silent rewrites.

## 2. New step-0.5 test — is the market hall itself a missing host or family program?

**The test.** `BUILDING-PROGRAM-TABLE-FAMILIES.md` §2 lists seven families and fourteen
programs. None of them is named "Market Hall," "Exchange," or "Cloth Hall." Site 10's own
Golden Seed is a market hall. Applying step 0.5: does the market hall need its own numbered
host (no — it is not a distinct *operating model* independent of an existing family's
grammar), a venue fixture (partially), or is it a **missing program inside an existing
family, or an eighth family**?

**Finding, load-bearing (full reasoning in `synthesis.md` §3).** `MEASURED-REFERENCES.md` §1-2
found that real market halls carry at least three different upper-room programs on the
identical open-post-or-arcade ground floor: pure storage (Ledbury), a commodity exchange
(Shrewsbury's wool hall), and civic authority — a council chamber (Titchfield) or a courtroom
(Llandeilo). That is not one program wearing different signage; a corn-exchange floor, a
guild's council chamber, and a magistrate's court have different authority relationships,
different records obligations, and different access rules, which is exactly
`BUILDING-PROGRAM-TABLE-FAMILIES.md`'s own test for whether programs may share one table
("share a table only where the programs can honestly consume the same spatial
relationship"). **Proposed (not ruled):** the market hall is a missing program that shares its
ground-floor chassis with `BF-CIVIC-AUTHORITY` sites under a licensed dual-use arrangement, or
alternatively deserves its own thin family (`BF-MARKET-EXCHANGE`) parallel to
`BF-CIVIC-AUTHORITY`, sharing only the open-post/arcade chassis relationship the same way
`BF-SHOP-WORKSHOP`'s programs share a customer-edge relationship. Both options are offered;
neither is chosen here, per the generator principle.

## 3. New step-0.5 test — does the courthouse's punishment ground belong to Site 10 or Site 6?

**The test.** A courthouse frequently has a public punishment apparatus attached (stocks,
pillory, a gallows platform, a holding cell for the immediately-convicted) — is that Site
10's civic-authority frontage, or does it cross into Site 6 Prison/Custody's territory the
moment it becomes involuntary custody?

**Finding.** `BUILDING-PROGRAM-TABLE-FAMILIES.md`'s own "Why Prison/Custody is a dedicated
family" section already answers this precisely: custody is "a controlled lifecycle" —
"authority admits identifiable people and property, classifies and assigns them, sustains
services and routine... and eventually releases, transfers, loses, or is defeated by them." A
stocks/pillory in the plaza, used for a public, time-limited, unescorted punishment, is a
**civic-authority fixture** (an object with a state — occupied/empty — not a custody
lifecycle) and stays Site 10. The moment a prisoner is held, fed, guarded on a schedule, or
has property intake, the site crosses into Site 6's "one-room lockup is a legal Rung-A
degradation of `BF-CUSTODY`" territory — even at hamlet scale. **Proposed:** Site 10's
institution card should name the stocks/pillory as a LICENSED civic-authority prop (a public,
non-custodial punishment fixture) and explicitly hand off any custody obligation, however
small, to Site 6's family rather than inventing a miniature jail inside the market slice.
FFT-Cohort-Comparison's Golgorand Execution Site (id 63, already classified by
Monastery-Study lane 5 as "punitive — walled yard, wall-walk, banner gate, central scaffold")
is the closest existing evidence for what a Site-10-owned public punishment ground looks like
short of custody; it is cited here, not reclassified.

## 4. New step-0.5 test — does a town-gate toll/customs post belong to Site 10 or Site 1?

**The test.** Site 10's culture-answer card already names "every gate toll carries a purpose
+ expiry" (catalog, UC5) — is the toll booth itself Site 1 Guard Post's territory (it is a
gate) or Site 10's (it is commerce/authority)?

**Finding.** This is a **transform-of-relationship, not a boundary dispute**, and the
existing catalog language already gets it right without saying so explicitly: Site 1 owns
"controlled transition or observation as functional identity" at the settlement's actual
edge/wall; Site 10's toll fact is a **commerce/authority state layered onto an ordinary
frontage bay or the plaza's own gate-facing edge**, inside the slice, not a second gatehouse.
Where the town wall and gate are themselves in frame (the working spec's "Arrival/Departure
street end" zones touching a real wall), that geometry is Site 1's, hosted at the edge of
Site 10's slice — the same hosting relationship Site 2's waystation already has with Site 10's
frontage grammar ("Site 2's waystation... expressions may borrow the frontage only after the
host caps and party-wall rules are proved"). **No new site or family is needed;** this is
recorded as a confirmation, not a proposal.

## 5. Cross-media comparison — Disco Elysium's Precinct 41

Every touchstone already read by `Reference/Urban-Study/lane-6-touchstones.md` (Baldur's Gate
3, Triangle Strategy, and others) is a combat- or exploration-forward title. This pass adds
one different-genre comparator: **Disco Elysium**, a dialogue-forward detective RPG whose
central civic-authority location is Precinct 41, the police station.

**[secondary source, Disco Elysium wiki]** Precinct 41 is **a repurposed former silk mill**,
not a building constructed as a civic-authority institution, organized into wings and
overseeing a district larger than its formal budget accounts for.

**Finding.** This is a genuinely different data point from anything in the FFT or prior
touchstone material: a real, well-documented civic-authority building whose *identity* is
adaptive reuse rather than purpose-built construction. It independently supports
`BUILDING-PROGRAM-TABLE-FAMILIES.md` §4's own "Explicit transform" mechanism (a whole
building's program can change through a committed adaptive-reuse transform, without becoming
a different family) and the ontology contract's `TransformStack` "repurposing" row. **This is
not evidence that Site 10 needs a new mechanism** — it confirms an already-accepted one
applies cleanly to civic-authority buildings, which the existing docs had not previously
illustrated with a concrete example. No FFT map in either cohort lane shows an adaptively
reused civic building; this is a genuine gap the touchstone lane, not the FFT lane, fills.

## 6. Sources

- `docs/SETTLED-LIFE-SITES-PROGRAM.md` §3, §4 (read in full for this pass).
- `docs/BUILDING-PROGRAM-TABLE-FAMILIES.md` §2, §"Why Prison/Custody is a dedicated family",
  §4 (read in full for this pass).
- `Reference/Monastery-Study/lane-5-fft-cohort.md` (cited, not reclassified).
- `Reference/Urban-Study/lane-6-touchstones.md` (cited, not reclassified).
- Disco Elysium wiki (Fandom), `Precinct 41` — web search 2026-07-27, secondary source only,
  not independently verified against the game itself this pass.
