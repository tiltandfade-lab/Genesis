STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

# Synthesis — Mixed-Scale Study (Golden Site 11)

type: research-synthesis
date: 2026-07-27
lanes: `lane-1-breadth-sweep.md` · `lane-2-image-reference.md` · `lane-3-fft-cohort.md` ·
`lane-4-engine-evidence.md` · `images/LICENSE-LEDGER.md`
consumer: `../../docs/SITE-11-MIXED-SCALE-SPEC.md`

## 1. What the research changed

Three things, in order of how much they move the build.

**(a) The demand is 3.7× larger than the census said, and it is demand for props.**
Recomputing the census's own data against the actual source table gives 100 of 539 wilderness
arrivals (18.55%) carrying a mixed-scale set-piece, not 27 (5.01%). Running the same broad
sweep for Site 3 as a control puts dormant/ruin content at 25.42%, so mixed-scale is the
**second**-largest recomputed share, not the largest — see `lane-4-engine-evidence.md` §1a,
where the earlier first-place claim is retracted with its arithmetic. And all 100 hits are
objects: colossal statues, giant skeletons, petrified dragons, oversized artefacts. Not one is
a hoard-hall, a giant steading, or an inhabited titan. **Site 11's real, measured, live demand
is for a mixed-scale prop-and-terrain register that can be dropped into the sites we already
have.** The dragon-hall was the least-evidenced part of the brief.

The control run also produced the best single piece of evidence for the transform reading:
28 of the 539 arrivals are caught by *both* sweeps — `Fallen Megalith`, `Shattered Throne`,
`Giant Sundial (Broken)`, `Beached Leviathan` and seven more. One rolled row, carrying a Site 3
state and a Site 11 relationship simultaneously, with no conflict. That is what two transforms
stacking over one object is supposed to look like.

**(b) The tactical grammar is already written; only the geometry is missing.**
Those 49 authored rows carry footprint, height, and tactical effect columns, and the effects
say *hide inside the mouth · walk inside · fight from inside the visor · fingers form
multi-level ledges · wings form ramps · acts as a bridge · palm creates an elevated platform ·
eye sockets act as arrow slits · can be run up like a ramp.* The engine already decided that a
mixed-scale object is enterable, climbable, and traversable. There is even a bespoke cover
class for it — `Slotted Cover`, in `wilderness-tactical-terrain` row 36 — which is authored
and unwired.

**(c) The site has four relational modes, not three, and the fourth is the cheap one.**
The brief named hoard-halls, giant steadings, and inhabited titan remains. The built record
adds a fourth that recurs more than any of them: **BUILT BY** — structures raised by a larger
body and inherited by a smaller one, which is exactly why classical Greeks named cyclopean
masonry after Cyclopes. It is also the cheapest to build (the existing kit with the piece
scale changed) and the one FFT's Nelveska Temple already demonstrates.

## 2. PROPOSED RULING — the Site 11 / Site 12 boundary

The census flagged `The Megastructure` (0.79% of dungeon walks) as "genuinely ambiguous vs.
Site 12." The source table resolves it without a taste call.

`Dungeon Type.md` rows 98–99 classify The Megastructure in their own theme column as
**"Anomaly / Ancient technology"**, and describe it as *"metallic corridors hum softly with
impossible geometry"* and *"non-euclidean walls shift in faint mechanical rhythm."* Neither
line mentions size. What they describe is a substrate that does not behave like matter —
which is the ontology contract's Site 12 definition ("non-building identity, unusual extent,
motion or living ownership").

> **PROPOSED RULING — BIGNESS IS NOT ANOMALY.**
> Site 11 owns spaces that are *dimensionally* strange but *physically ordinary*: euclidean,
> static, obeying gravity and ordinary material behaviour. Site 12 owns spaces that are
> *physically* strange — non-euclidean, moving, living, self-altering — **at any size**.
> `The Megastructure` therefore routes to **Site 12**, not Site 11.

### The three-question test (countable, in order)

1. **Does the space obey euclidean geometry, gravity, and ordinary material behaviour?**
   No → **Site 12**. Stop.
2. **Do the space's measurements have a named cause in some body's size** — a builder, an
   intended occupant, a set of remains, or a present colossus? No → it is the host site with
   an unusual footprint, not Site 11.
3. **Do at least two body classes have a simultaneous and consequential relationship to the
   same space?** No → it is the host site with a big occupant, not Site 11.

All three must pass. Question 3 is the one that does most of the work: it is what stops
"a cave with a dragon in it" from being Site 11 (which is Site 7's boundary note already), and
it is what makes Site 11 a *relationship* case rather than a size bucket.

### The corollary

A Megastructure may still carry a **Site 11 transform** — if its shifting corridors happen to
be sized for a body class other than the player's, the scale relationship is real and applies
as a delta. What it may not do is change host. This is `SETTLED-LIFE-SITES-PROGRAM.md` §2's
noun/state law applied unchanged: the host is a noun, the scale relationship is a modifier
over it.

## 3. PROPOSED — what Site 11 actually is

> **Site 11 is not a place. It is a relationship between a space and two bodies, plus the
> two pieces of geometry that relationship needs and no other site owns.**

That relationship applies as a transform over any host. The two pieces it owns outright are:

1. **The aperture pair** — a room with a big-body opening and a small-body opening. Evidenced
   at Hampi (eleven chambers each sized for two elephants, each with a small rear door for the
   mahouts) and structurally in the Tiryns gallery (a human passage threaded through an
   eight-metre wall). It produces two viable routes with different capacities from one wall
   assembly, and it rhymes exactly with Site 5's haul/manway split.
2. **Hoard terrain** — a granular mass with a repose angle, a stable band, an unstable band,
   and an engulfment failure mode. Nothing like it exists in the engine, and Site 7's brief is
   already waiting on it ("may borrow a bounded hoard-pile prop until site 11 mints hoard
   terrain properly").

Everything else Site 11 needs is the existing kit at a different piece scale, plus a bone
material and an irregular joint treatment.

## 4. The mode board

| mode | relationship | real precedent | signature geometry | cost |
|---|---|---|---|---|
| **A — BUILT BY** | larger builder, smaller user | Tiryns galleries · Mycenae · Karnak | inherited oversize: sills, treads, rails set to the wrong body | cheapest — existing kit, changed piece scale |
| **B — BUILT FOR** | smaller builder, larger occupant | Hampi Elephant Stables | **the aperture pair** | one wall assembly; highest gameplay yield |
| **C — BUILT OUT OF** | the larger body IS the structure | Mezhyrich · Whale Bone Alley · whale-jaw arches | anatomy as bay system; ribs → slotted cover | cheap — existing post/arch sockets + bone material |
| **D — BUILT AROUND** | colossal presence, parasitic apparatus | Bamiyan · Leshan · ship-breaking yards | colossus-as-terrain; added, irregular access | most expensive — new mass, new access rules |

## 5. Cross-lane agreements and one disagreement

**Agreements.**
- Lane 1 (built record), Lane 2 (images), and Lane 3 (FFT) all say the same thing about
  footprint: mixed-scale works at **ordinary tactical footprint**. Tiryns's gallery is one
  cell wide; FFT never enlarges a walkable cell. Site 11's 5-ft cell stays 5 ft.
- Lanes 1 and 3 agree that scale is only legible **against unscaled reference**. FFT's
  Nelveska needs its ordinary grass apron; Mycenae's gate needs the people walking through it.
  This qualifies the STRUCTURE-KIT matrix's "titan-scale (2×) piece variants" line: 2× pieces
  are only legible **next to 1× pieces**. A uniformly doubled scene reads as a normal scene.
- Lanes 2 and 4 agree that the read lives in the **vertical section**, not the plan — which
  makes the fixed production camera a first-class requirement rather than a finishing step.

**Disagreement, stated honestly.** Lane 3 found FFT's cheapest mixed-scale composition to be
one oversized object in an ordinary room (`73 Inside of Windmill Shed`) — a doughnut playfield
with a single prop. Lane 4's census evidence says the engine's actual demand is for exactly
that shape, at high volume, in the *wilderness*. But Lane 1's built record and the brief's own
framing both point at whole *sites*. These pull in opposite directions on build order. The
spec resolves it by putting the object-scale register first and the site-scale composition
second — but that is a proposal, and it is Founder Question 1.

## 6. Declared gaps — what would move `RESEARCHED` to `PASS`

1. **No measured plan or section of a building made for a large animal.** Hampi is photographs
   plus a prose dimension. Every clearance number in the spec is derived from the SRD size
   table and the Genesis quantum, not from a surveyed building. Likely source: public-domain
   19th-century engineering/veterinary literature. Not searched.
2. **The FFT cohort is not reproducible from this worktree.** The five-angle corpus is
   untracked local evidence in the root repo; the catalog forbids importing it. Another agent
   cannot re-check Lane 3 from `Genesis-sites` alone.
3. **No culture study.** Four relational modes across every realm is exactly the condition the
   SITE PIPELINE step 1 says demands one ("a culture study where the site's life demands
   one"). Who builds *for* a large body, who inherits *from* one, and who butchers one into a
   house are three different cultural postures and none has been studied.
4. **No figure-scale image of a metal hoard slope.** `MS-13` (talus) stands in. The material
   read comes from `MS-12`, which is museum-tray photography and carries no terrain
   information.
5. **No adversarial case researched.** The obvious hostile envelope — a Gargantuan standee
   (4 cells) inside a space its own occupant fits but the *camera* cannot frame — has not been
   tested against the fixed production camera.

## 7. Honest gate proposal

| gate | proposed | why not higher |
|---|---|---|
| `RESEARCHED` | **PARTIAL** | four lanes, 13-image ledger, recomputed tallies, and a synthesis all exist and were re-gated — but gaps 1–5 above are load-bearing, and the FFT lane is not reproducible from this worktree |
| `FOUNDER-RULED` | **OPEN** | no founder ruling of any kind exists for Site 11. Every item in the spec is `PROPOSED`, including the boundary ruling in §2 |
| `BRIEF-CONGRUENT` | **PARTIAL** | all fifteen working-spec sections and the ten-section brief material are present, but unresolved founder proposals carry load throughout |
| `CLAY-PROVED` | **OPEN** | nothing has been rendered. Prose and a mode board can never earn this gate |

Nothing in this packet is `CLAY-PROVED`, and nothing in it is a ruling.
