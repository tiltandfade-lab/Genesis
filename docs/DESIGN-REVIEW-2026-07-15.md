---
type: design-review
project: Genesis
status: OPEN — awaiting Adam's questionnaire answers (the design meeting)
created: 2026-07-15
author: Fable (the skeptical pass Adam asked for: "poke holes in our plans, ideas, concepts —
  offer solutions only if there truly is a better way")
related: GRAPHICS-CONVERGENCE-CHARTER.md, VQ2-RESPEC.md, dev/play-lens/DEMAND-LEDGER.md,
  EXTRUDED-SPRITE-PROP-LIBRARY.md, docs/DM-SEAT.md
---

# Design Review — 2026-07-15 (the skeptical pass)

Adam's charge, verbatim intent: review everything; poke holes in plans/ideas/concepts from a
skeptical perspective; offer solutions only where there truly is a better way; stop
instruction-running and weigh choices together. This document is that pass, plus the 20-question
design meeting. Nothing here executes until the meeting resolves it.

## 0. The door-column artifact (his direct question — answered)

**What it is:** the D4d doorframe's jamb+lintel prisms built along the WRONG AXIS — a doorframe
rotated 90° so it stands perpendicular to the wall, one slim post ~a cell into the room with the
header bridging back to the wall. It reads as a "hollow column construction hanging out in front
of the door" because that is literally what a sideways doorframe is.

**Why it haunts every scene:** `theater-interior.js:1345` derives the frame's width axis from
*room-rect edge membership* (`onLeftRight`/`onTopBottom` off `doorRoom`'s rectangle) and silently
defaults when the test is ambiguous — corner cells (on BOTH edges), doors whose `doorRoom`
resolves to the neighboring room, and non-rectangular shapes' notch cells (octagon/L/cave — Stage
C made these common) all take the wrong branch. Hand-authored study cards were clean (plain rect,
unambiguous edges); every ROLLED dungeon hits the ambiguous cases constantly. Ledger P0 #3
("door leaf floats unanchored… unlike the clean study-card scene") is the same family.

**The fix (small, mechanical, no meeting needed):** derive the axis from the LOCAL WALL RUN at
the door cell — scan the wall grid for the door's wall-neighbors; the wall's run direction IS the
aperture's width axis, shape-independent, corner-safe. Room-rect membership demotes to tiebreak.
Queued as **QF-D1** (quick-fix class; red-first fixture = a corner door + an octagon-notch door,
both wrong today).

## 1. The holes (ranked by how much they matter)

### H1 — We hand-roll geometry below the floor of assets we already own. (His instinct is right.)
The sharpest inversion in the project: 1,752 professionally-modeled CC0 GLBs are banked (16
Kenney packs; 3 on master) and the runtime renders ZERO of them, while we author doors, walls,
frames, and furniture as code-built prisms — and debug them one artifact at a time (the door
column is exactly this class). The D4 door package was 4 units of prism work; the modular dungeon
kit contains correct doors, doorframes, and wall pieces designed to socket together on a 5-ft-ish
grid. The no-human-production law never forbade kit assembly — Charter §5 explicitly provides the
adoption path — but every geometry plan predates the corpus landing (2 days ago) and none was
re-derived after it.

**Solution (a genuinely better way):** invert the F-wave order — **F4 (Kenney adapter pilot)
jumps ahead of F1/F2/F3**, and its pilot donors change from graveyard decor to the *dungeon
structural set* (door/doorframe/wall/arch pieces). Then F1 combat-in-room inherits real rooms,
QF-D1's prism fix becomes a fallback path rather than the main look, and F5's facades stop being
null the honest way. The walk stays canonical: kit pieces snap to the same cell grid the rolled
dims already produce. **Meeting questions 4–7 decide this.**

### H2 — Sockets are specced in four documents and built in zero code.
Charter §3.4, the foundry contract, the ES library plan, and the kit contract all require
attachment/mount sockets; the runtime has exactly one socket-like seam (`lightPropAnchor`).
Placement is scatter+heuristics, which is why props orphan mid-air (ledger #14) and why assembly
("easy assembly of objects and items" — Adam) doesn't exist. **Solution:** sockets are not a
future system, they're a *field on the F4 adapter's output* — every admitted donor gets
floor/wall/top/hinge sockets stamped in its normalized GLTF (adopting the kits' own join
conventions instead of inventing a schema), and Stage-D interactables consume them. First
consumer: doors (leaf hinges INTO frame socket — kills the floating-leaf class structurally).

### H3 — The lighting feedback loop is minutes long and belongs to me, not Adam.
The tuning surface is right (named-const tables: `LIGHT_PROFILES`, `CELESTIAL_ARC`,
`STAGE_AMBIENT_FLOOR`…) but iterating means editing consts → re-render → capture → look. Taste
iterates in seconds or it doesn't iterate. **Solution: LIGHT-LAB** — a dev-only overlay (plain
DOM sliders, no deps, behind a flag) binding those exact tables live: profile curves, arc
keyframes, ambient floors, bloom threshold, per-realm grade; an "export" button emits the values
as JSON that the generator folds back into the consts (edit-source→artifact preserved). Small
unit; it makes Adam the lighting director instead of a red-pen reviewer. Stage E's exposure
fixes (the daylit blow-out B3 measured) land the *mechanisms* the sliders tune.

### H4 — Play-feel debt is accruing silently while we pay visual debt.
Every session since 07-10 has been graphics. The DM seat that scored 4.96/5 hasn't had a live
playtest since AgX, the flip, ENV, doors, and the panel fix all landed on top of it; the LATENCY
LAW (≤15s routine turns, the launch gate) is unmeasured against the current stack. The demand
ledger proves the *renderer's* seams; nothing this week proves the *game's*. **Solution:** a live
bridge playtest gate before the next graphics wave — one session, latency measured, complaints
caught. Cheap insurance against polishing a stage nobody's playing on.

### H5 — The "two-weekend games look better" comparison: partly unfair, partly deserved.
Unfair half: those games hand-light five authored scenes; Genesis must earn every look as a LAW
that survives infinite rolled rooms — genuinely slower, and the walk-native constraint is the
product's moat, not overhead. Deserved half: our floors are lower than our own constraints
require because of H1/H2 — quality is sitting on disk unused. The honest framing: we are not slow
at polish, we are late at *adoption*. (Also worth saying plainly: pl4-gloom's dungeon room and
frame 10's target are not far apart in mood — interiors are close; exteriors/towns/beats are
where "busted and janky" is accurate today, and those are exactly the unbuilt F-units.)

### H6 — Evidence discipline: A/B shots must hold variables constant.
The B3 flip pair failed its purpose (occluded subject, different angles between panels). Now law
(memory + this doc): comparison shots = same scene, same camera transform (asserted numerically),
same light, unoccluded full bodies; only the tested variable changes. A controlled A/B rig is
being built as `dev/battle-gate/ab-flip-cards/` (in flight).

### H7 — Code review ran as orchestrator re-gates, not as a hostile pass.
True gap: today's 12 merges were gated on harnesses + diff reads, but no adversarial review.
One is running now over the whole day's code delta (results append below when it lands), and
the standing rule resumes: waves get a review pass before close, not after complaint.

## 2. THE DESIGN MEETING — 20 questions

Answer in any order, any depth; one-liners fine. These are the decisions that actually change
what gets built next. My recommendation is marked ★ where I have one; several I genuinely
shouldn't call alone.

**A. The bar**
1. **The honest reference floor:** when Genesis environments are "done enough to ship," which
   existing game is the floor — Wildermyth? Darkest Dungeon? Loop Hero? Something else? (This
   calibrates every "is it good enough" call I make without you.)
2. **Frame 10/16 (the VQ2 octagon):** shipping target or aspirational mock? If shipping target —
   may recognizable *kit shapes* appear under our materials to reach it, or must all geometry
   read bespoke?
3. **Camera freedom:** would you trade free orbit for 2–3 composed angles per scene (the mocks
   are composed stills) if it visibly doubled scene quality? ★ I'd consider it for non-combat
   beats; combat keeps orbit.

**B. The Kenney fork (the week's biggest call)**
4. **Style strictness:** P-B's bridge gate rejects a donor if the Kenney origin is
   *identifiable* in the modulated render. Strict reading kills most furniture. How strict —
   "no pastel/toy read" (loose) or "unrecognizable silhouette" (strict)? ★ loose — silhouettes
   are generic medieval; materials carry identity.
5. **Order inversion:** F4 adapter FIRST (before combat-in-room/staging/Stage E), pilot = the
   dungeon *structural* set (doors/frames/walls/arches)? ★ yes — see H1.
6. **Room dims:** constrain rolled room dimensions to kit-modular increments (the 5-ft grid
   already aligns) so kits cover ~95% of architecture, with prisms only as overflow? ★ yes;
   the tables still own the rolls — the increment is presentation-lawful.
7. **The 13 unbanked packs** (town kit especially): land them all now behind the adapter gate,
   or one pack at a time as each pilot passes? ★ all banked, admitted per-piece.

**C. Objects**
8. **Socket schema:** adopt the kits' own join conventions as THE socket system (fast, proven,
   grid-native) vs authoring our semantic socket spec first (expressive, slower)? ★ adopt now,
   annotate semantics later.
9. **The five interactables that must feel physical first** — my guess: door, chest, lever,
   campfire, shrine. Your order?
10. **Bareness:** after the PL-4 frames — is the roll-is-palette bareness reading as intentional
    negative space or as unfinished? Should density scale with room ROLE (hub/lair dense, corridor
    bare)?

**D. Light**
11. **LIGHT-LAB:** approve the slider tool as a next-wave unit? Day-one controls you want beyond
    profiles/arc/floors/bloom/grade?
12. **Stage E timing:** lighting is your #1 "shabby" driver and B3 measured real blow-outs — does
    Stage E (exposure floor + bloom mask) run BEFORE the content units (combat-in-room/beats), or
    after? ★ before — every capture everyone judges passes through it.
13. **Light vocabulary v1:** are daylit/overcast/moonlit/dark + the arc enough range for launch,
    or do fog/rain/firelight-only variants belong in the slider ranges now?

**E. Sprites**
14. **Flip verdict process:** what evidence closes "faceted stays" per creature — the controlled
    A/B cards, in-play lens frames, editor side-by-sides, or your own play session? And is a
    permanently MIXED corpus (some legacy, some faceted) acceptable, or must fantasy converge?
15. **The 81 unmeasured heights** (60 orphans + band-defaults): batch-rule before the next lens
    run, or tweak-as-you-go in the editor?
16. **B2 physical standees vs X2 extrusion compiler** — both make flats into objects; which
    first? ★ B2 (every scene has standees; extrusions are per-prop).

**F. Product**
17. **A live playtest gate** before the next graphics wave — yes/no? Which realm/scenario?
18. **LATENCY LAW:** still the launch gate? Should the playtest measure the current stack against
    ≤15s and publish the number?
19. **Realm scope honesty:** is launch fantasy-only-polished (gloom/chrome as fast-follow
    expansions, per the realm-runners model) — or must all core-three hit the bar? (This halves
    or triples every art queue.)
20. **The vertical slice question:** should the next month optimize for ONE recordable, beautiful,
    complete session (the one-DM-turn walkthrough as a showpiece — positioning says this is the
    killer exhibit) rather than raising all floors evenly? ★ this is the one I most want your
    answer on — it reorders everything above.

## 3. Registered follow-ups (pending the meeting)
- **QF-D1** — door-frame axis fix via wall-run derivation (bug class; can land same-day).
- **LIGHT-LAB** — the slider tool (H3), pending Q11.
- **AB-FLIP-CARDS** — controlled comparison rig (H6; in flight).
- **Code-review pass** over 891c12a4..HEAD (H7; in flight — findings will be appended here).
- The F-wave order stays FROZEN until Q4–Q7 are answered.
