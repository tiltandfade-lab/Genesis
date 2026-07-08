---
type: system-spec
project: Genesis
status: SEED 2026-07-08 — the accuracy layer for the model pipeline. Answers Adam's question: how to
  make modeling accuracy a SOLID PROCESS that improves every bestiary model without micromanaging
  batches. Moves anatomical correctness OUT of per-model authoring INTO a shared canon + parametric
  family base-rigs + an auto-QA gate. Seeded with the quadruped-digitigrade family (the acute pain);
  other families are stubs pending a research fan-out.
created: 2026-07-08
related:
  - "[[MODEL-LANE-TRIAGE]]"    # which lane a subject takes; this fixes accuracy WITHIN the lanes
  - "[[MODELING-PIPELINE]]"    # refs-first; this narrows per-model work to "measure proportions"
  - "[[MODEL-GRAMMAR]]"        # the existing shared-parts kit this generalises to full anatomy
  - "[[MODEL-BLITZ-24H]]"      # the parallel-wave production mode the auto-gate makes safe
sources:
  - Canine hindlimb anatomy (Physiopedia, VeterianKey): digitigrade stance, hip/stifle 110–150°, high hock
  - Quadruped topology (Polycount wiki, Blender Artists, Hippydrome/Brian Tindall): edge flow through joints
---

# ANATOMY-CANON — correctness by construction, not by micromanagement

## The problem this solves (Adam, 2026-07-08)

Recurring model failures are **anatomy-knowledge gaps, not tool gaps**: "the hind legs aren't the
right angle in ANY model" (nobody encoded the digitigrade hock), "sheep not wolf" (torso proportion),
"french-fry leg burning polygons" (no efficient shared leg), "two loaves and a gumdrop head" (no
correct shared head). Each model is authored from a weak from-memory prior, so the same mistakes
recur. Fixing them one at a time IS the micromanagement. **Fix: encode the anatomy ONCE per body
family; every creature inherits it.**

## The four pillars

**1. Canon (this doc) — the knowledge layer.** Reference-derived structural truths per body FAMILY
(not per creature): segment counts, joint angles, proportion ratios, the one silhouette cue. Authored
once from a topology/anatomy sweep. Single source of truth.

**2. Parametric family base-rigs — the shared-correctness layer.** One probe-lib builder per family,
e.g. `buildQuadruped(P)`, where the anatomy (digitigrade 4-segment hind leg, high backward hock,
columnar front leg, deep-chest torso) is CORRECT BY CONSTRUCTION inside the function. A creature is a
**parameter set** (proportions + features), not a re-authored mesh. **Fix the hock math once → every
quadruped's hock fixes at once.** Also kills the poly-waste (authors a tight hex-tube leg, no remesh)
and the gaps (legs seat into the torso by construction → weld+fill closes clean, or it ships already
connected). This is the existing shared-parts kit grammar extended from "swap a head" to full anatomy.

**3. Refs-measured param tables — the per-model layer (the ONLY per-creature work).** Pull 1–2 refs →
read the *proportion deltas* off the base (this wolf is leggier; that boar is deeper-chested) → set
the param table. Cheap, and the anatomy can't go wrong — it lives in the base. Refs-first shrinks from
"reinvent the animal" to "measure the proportions."

**4. Auto-QA gate — the enforcement layer (no eyeballing every batch).** A validator scores each baked
model against canon and flags only OUTLIERS: hind-leg segment count, hock-height band, tri budget,
post-weld shell count, no floating parts, silhouette-IoU vs a family reference (guardrail). Batches
self-triage — you review the 5 that fail, not the 500 that pass.

**The batch loop becomes:** canon (once) → base-rigs (once per ~6 families) → per-creature param tables
(cheap, refs-measured) → bake → weld+fill close → auto-QA gate → human reviews only flagged outliers.

---

## Family: QUADRUPED — DIGITIGRADE (canine, feline) — SEEDED

Stands on the toes; the visible "backward knee" is the **hock (ankle)**, set HIGH. This is the single
most-failed structure. All values are fractions of **shoulder height H** (spine at the withers) unless
noted; body length L measured chest-front to rump.

**Hind leg — 4 segments, a Z-zigzag (the money structure):**
1. **Thigh** hip → **stifle(knee)**: angles DOWN-and-FORWARD. Stifle sits forward of the hip, at ~0.55H.
2. **Tibia** stifle → **hock(ankle)**: angles DOWN-and-BACK. Hock sits BEHIND the stifle, HIGH at ~0.35–0.40H.
3. **Metatarsus(cannon)** hock → paw: NEAR-VERTICAL (slight forward lean).
4. Compact paw on the ground.
- Stance angles: hip & stifle ~110–150° open (stifle more flexed). The hock is the sharp rearward bend.
- FAILURE MODE to kill: a single straight tube or one human-like forward knee. Must read hip→fwd→stifle
  →back→hock→down→paw.

**Front leg — near-straight column:** shoulder → elbow (~0.55H, tucked close under the chest) → carpus
(barely bent) → compact foot. Weight-bearing, vertical. Much straighter than the hind.

**Torso (the "wolf-not-sheep" fix):**
- Shoulder height H ≈ 0.60–0.65·L for a wolf (leggy). A sheep/heavy dog reads when legs are too short
  and the belly doesn't tuck — so LEG LENGTH + BELLY TUCK are the two dials that flip the read.
- **Deep chest:** brisket (chest bottom) drops to the elbow, ~0.45–0.50H off the ground. Not a shallow barrel.
- **Belly tuck:** behind the ribcage the underline cuts UP to ~0.62–0.70H. The chest-low → belly-high
  line is THE canine read; a flat underline = sheep/pig.
- Topline near-level, slight withers rise, gentle slope to croup.

**Head — carried level with or slightly BELOW the topline:**
- Length ~0.28–0.30·L. A blended neck (thick ruff, no thin stalk) into a wedge skull + a long muzzle
  projecting near-horizontal FORWARD. Erect triangular wide-set ears.
- FAILURE MODE to kill: "two loaves + a gumdrop" = cranium and muzzle as two separate boxes with a ball.
  Fix: one tapering wedge (skull→muzzle continuous), ears and a defined stop, mouth as a line not a gape.

**Topology / efficiency:** author each limb as a hex (6-side) tube following the bone path with a ring
at each joint; body as a single loft; head as one wedge loft. No voxel remesh (that's the french-fry
waste). Target ~500–900 tris whole. Legs seat INTO the body loft (shared seam) so the model ships
connected.

**Reading cue (the ONE thing):** the high backward hock + deep-chest/belly-tuck line. Get those two and
it reads wolf at miniature scale even faceted.

---

## Family stubs — pending research fan-out (same format as above)

- **QUADRUPED — UNGULIGRADE** (horse, deer, boar): stands on hooves; longer distal cannon; straighter
  leg; single/cloven hoof; head on a longer neck. Warhorse/deer/boar lines.
- **WINGED** (dragon, wyvern, bat, bird): membrane vs feathered; wing = arm-analog (humerus→radius→
  finger struts) not a flat sheet; folded vs spread pose. The `dragon-beauty` flat-sheet wing is the
  failure mode. Highest-leverage (43 dragon keys).
- **SERPENTINE** (snake, naga): tapered tube, coil topology, no limbs; head-neck read.
- **ARTHROPOD** (spider, insect): segmented body (cephalothorax/abdomen), jointed leg pairs (coxa→
  femur→tibia→tarsus), radial symmetry.
- **AVIAN** (harpy wings, giant bat): keel chest, folded-wing default, thin scaled legs.
- **HUMANOID** — already covered by the PC kit grammar (`parts.js` / rlm-kits); note here for completeness.
