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

> **PROVEN 2026-07-08** — `dev/model-qa/rigs/quadruped.js` (`buildQuadruped(P)` + the `WOLF` param set).
> Baked to 334 tris (vs the hand-authored wolf's 598, vs the voxel blob's 1841) and rendered against
> the current wolf (`out/wolf/COMPARE_wolf_rig.png`): level topline, deep-chest/belly-tuck barrel,
> digitigrade hind leg (high backward hock) distinct from the columnar front leg, one clean skull→
> muzzle wedge, connected, seats on its base. The two pass-1 flaws (fin-tail, long muzzle) were fixed
> by editing NUMBERS in the `WOLF` param set — not by remodeling. A dire wolf / jackal / worg / big cat
> is a new param set on the same correct rig.

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

## Cross-family construction rules — LEARNED getting the wolf right (apply to EVERY rig)

These are tool-level truths surfaced by the wolf iterations; bake them into `buildUngulate`,
`buildWinged`, etc. so the same bugs don't recur per family:

1. **Topline continuity.** The neck's TOP edge must ride at the back line (`center = backTop − neckR`),
   never above it; the head crown must sit at/below the back line. Run the neck FORWARD-and-DOWN from
   the withers to a low-carried head — don't arch it up. (Fixed the "neck above the body" bug.)
2. **Seat appendages from the SURFACE, not the center.** An ear/horn/fin height must be measured from
   the part's surface (skull crown = ring `center + rz`), or it buries inside the mass. (Fixed the
   "where are the ears" bug — they were measured from skull center and sank into the crown.)
3. **Small features need real 3D volume.** A 2-sliver quad reads from one angle only. Build ears/horns
   as little pyramids (≥3 side faces) so they read front/side/3q.
4. **Proportions are params; anatomy is construction math.** Every taste fix (fin-tail, long muzzle,
   buried ears) was an edit to NUMBERS in the param set — never a re-model. If a fix needs new geometry
   logic, it belongs in the shared rig (all inheritors get it), not in one creature.
5. **Gate in the REAL engine, not only the Blender probe.** Verify through `ps1-sheet.html` +
   `ps1-capture.mjs` (the shipping dither+vertex-snap+1/3-res shader). The Blender probe is a fast lens;
   the engine PS1 render is the acceptance gate. (Wolf confirmed in-engine: `wolf-rigcmp-ps1.png`.)

## POSE-ANATOMY — the spine is the pose; arms bend at joints (Adam's ruling, 2026-07-08)

Batch-review finding after foundry waves 1–3 (Adam, eyes-on the wave sheets): the recurring
weakness is **awkward arm articulation and an unconsidered spine** — limbs posed on a mannequin.
These rules bind every humanoid/hybrid pose, and the critic pass gates on them:

1. **The spine is the pose.** Every pose starts as a SPINE GESTURE — one readable C- or S-curve
   from pelvis to skull (lean, twist, arch, hunch). Author the spine curve FIRST, then hang limbs
   off it continuing its line. A vertical-column torso with action limbs bolted on is a gate
   failure ("mannequin pose"). Test: trace hips→shoulders→skull in the render; if the trace is a
   plumb line while the arms are "acting," the pose is fake.
2. **Arms bend only at joints, and always bend.** Shoulder→elbow→wrist must read as an ARC with a
   visible elbow angle (~100–150° for most actions). A dead-straight arm (one segment shoulder to
   fingertip) or a hyperextended/backwards elbow is a gate failure. Even a full reach keeps a
   slight elbow break. Same for legs at the knee.
3. **Shoulders ride with the arm.** An arm raised above chest height drags its shoulder up and
   tilts the upper spine toward/away from the action; the neck/head counter. An overhead arm on
   level, square shoulders reads as a doll.
4. **Counterpose or fall over.** Weight on one leg tilts the hips; the shoulders tilt in
   OPPOSITION (contrapposto); an arm thrown forward is balanced by hip/other-arm counter. Squared
   hips + squared shoulders + symmetric feet is the at-attention failure law 5 already bans.
5. **The gesture line survives the squint.** At 1/3-res the whole figure should still read as one
   sweeping line of action (the spine curve extended through the loudest limb). If the squint
   shows a T- or X-shape of straight sticks, re-pose — do not re-model.

Critic gate question (d), added to the standard three: **trace the spine and the elbows — is
there a gesture line, and do the arms articulate?**

**Sanctioned exception (Adam, 2026-07-08): rigor-mortis stiffness.** The MUMMY (and kin whose
flavor is literally locked-stiff dead tissue) may carry a dead-straight arm as an expressive
choice — the stiffness IS the creature. The exception is per-creature and deliberate (state it
in the file header), never a default; the spine-gesture rule still applies (a stiff arm on a
curved, leaning body reads as rigor; a stiff arm on a plumb spine is still a mannequin).

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

## Family: SERPENTINE (snake, naga, constrictor) — RESEARCHED

**Body:** One continuous tapered tube, NOT a uniform sausage — the mass is a long ribcage/"chest," so
keep the diameter near-constant through the front two-thirds, then taper only in the rear third to a
fine tail tip (avoid a carrot cone). "String of beads": neck beads slightly narrower than the thick
mid-body beads, then a slow, late taper. Cross-section is a rounded-triangle/D-shape (flat belly-scale
underside, rounded top) — this also sells the coil. Head is a tiny fraction of length (~1/15–1/30).
For a mini, author already in a COIL (2–3 stacked loops, head raised/S-curved off the top) so the
footprint fits a base disc. A coil reads as a coil only when an inner loop tucks UNDER an outer one —
stack rings with slight vertical offset. Naga: same tube for the lower body, splice a humanoid torso
at the "neck" beads where the tube widens to shoulders.

**Head + neck:** Distinct wedge — top-down a lance/arrowhead (widest at the rear jaw hinge, narrowing
to a blunt snout); side-on a low flattened wedge, not a ball. Spend the polys on the jaw line and the
neck "kink" — snakes flare behind the skull then pinch into a narrower neck before the body widens;
that pinch reads as "head." Cobra/naga hood = a flattened paddle behind the skull. Forked-tongue sliver
off the snout = a cheap unmistakable tell.

**Topology / efficiency:** Sweep a low-count ring (6–8 sides) along a coil curve — the body is a ladder
of quad rings, no remesh. Ring COUNT carries curviness: dense rings only where it bends hardest (head
loop, S-neck), sparse on the outer coil. Head = a separate short capped tube, scaled/flattened, welded
to the neck ring. Target ~250–500 tris. Flat-shade; the belly-flat comes free from a D-profile ring.

**Reading cue (the ONE thing):** the raised, S-curved neck lifting a distinct wedge head off the coil —
that vertical head-on-a-stalk against the horizontal loops is the whole silhouette.

## Family: ARTHROPOD (spider, giant insect) — RESEARCHED

**Body:** Segmented and pinched — the whole family tell. Spider = TWO masses: a small cephalothorax
(leg anchor) joined by a narrow waist (pedicel) to a large bulbous abdomen (~1.5–2× the front volume);
the sharp pinch between them is non-negotiable. Insect = THREE masses in a line: head, boxy thorax (legs
+ wings anchor), long tapered abdomen. Never fuse the segments into one blob — the constriction IS the read.

**Legs:** Radial pairs — spider 8 (4 pairs), insect 6 (3 pairs), splaying OUTWARD. For a mini collapse
the joint chain to three visible segments with two bends: femur (thick base, angles UP-and-out) →
tibia (mid) → tarsus (thin foot angling DOWN to ground). The signature "spider knee": the femur rises
so the knee peaks HIGHER than the body, then the leg bends sharply down — an inverted-V tent-pole per
leg, knees above the back. Femur up ~30–45°, tibia down past vertical. Front pairs reach forward, rear
pairs sweep back → a splayed star footprint, not parallel rails. Coxa/trochanter = hidden, skip them.

**Topology / efficiency:** Each leg = a thin 4–6-side tube with ONE ring at each bend (~40–70 tris/leg).
Body = 2 lofts + pinch rings (spider) or 3 lofts (insect). Build one leg, radial-array it, yaw each pair
to fan. Add short fang/chelicerae nubs (spider) or antenna slivers (insect). Target ~400–700 tris (legs
eat the budget — keep bodies 6–8-sided). Flat-shade; leg kinks give free hard-edge faceting.

**Reading cue (the ONE thing):** the knees-above-the-body arched-leg silhouette — a ring of tent-poled
legs peaking over a pinched two/three-part body reads "bug" from any angle.

## Family: QUADRUPED — UNGULIGRADE (horse, deer, boar) — RESEARCHED

**Hind leg — Z-zigzag, but a GENTLE one:** hip→femur→stifle(forward)→tibia→**hock(backward)**→long
cannon→fetlock→hoof. Two musts: (1) **stifle sits HIGH & tucked into the belly (~0.55–0.65H)** — the
femur is nearly buried, barely a visible segment; (2) **hock is the prominent backward bend, HIGH off
the ground (~0.30–0.35H)**, with a long near-vertical cannon below it. Stifle/hock open ~150° (gentle,
not the sharp canine Z). FAILURE: a low, sharp "reversed human knee" at mid-leg, or mirroring the
straight front leg. Front leg = plumb line; hind = cocked/angular — that CONTRAST is the read.

**Front leg:** scapula→humerus→elbow(tucked to chest)→carpus(~0.30H)→cannon→fetlock→hoof. Near-vertical
straight column, carries ~60% weight. Hoof = a small blunt wedge/cylinder, NO toes.

**Torso (species dials):** Horse = **square, H≈L**, deep-narrow barrel (chest depth ~0.45–0.50H), level
back. Deer = leggier/lighter (chest ~0.40H, H slightly >L). Boar = INVERT: **front-heavy, L>H, short
legs (~0.35–0.40H), a shoulder/withers HUMP as the tallest point**, back sloping down to a weak rump.

**Head + neck:** long ARCHED neck up-and-forward (~1/3 body length, ~1.5× head length); head ~0.35–0.40H
tapering wedge, small upright ears. Deer = longer thinner neck, bigger ears (+antlers as a separate
payload). Boar = NO real neck (head runs into shoulders as one low heavy wedge, long snout, tusks).
FAILURE: a short/horizontal horse neck — the raised long neck IS the ungulate read.

**Topology / efficiency:** 4–6-side extruded tube per leg, one extra loop at stifle/hock/carpus/fetlock
only; barrel loft; neck tube; wedge head; hooves = tiny beveled blocks. Legs seat into the barrel/haunch
(no floating stubs; femur/scapula implied by the body mass). ~500–900 tris (boar cheaper ~500–650).

**Reading cue (the ONE thing):** the high angular hind-leg zigzag set against a straight vertical front
leg, under a level deep barrel on four thin legs ending in single blunt hooves.

## Family: WINGED (dragon, wyvern, bat, bird) — RESEARCHED

**Wing = arm-analog, never a fabric panel.** Bone chain: shoulder→**humerus**→**radius/ulna**→wrist→
**elongated finger struts**; the membrane (patagium) is skin stretched *between and behind* the struts
like a hand-held fan — the bones are the shape, the skin sags between them. Struts: bat = 4 elongated
fingers; **dragon/wyvern = simplify to a thick clawed thumb-spike at the wrist + 3 long struts fanning
back, each carrying one scalloped membrane bay** (trailing edge = a row of concave scallops, not a
straight line). Bird = DIFFERENT: hand fused, flight surface is overlapping rigid feathers (primaries
off the hand, secondaries along the ulna) — a stack of blades along the arm, not a spanned fan.

**#1 FAILURE MODE — the flat angular sheet** (the `dragon-beauty` wing): caused by extruding one quad
off the shoulder. Kill it by (1) building the strut skeleton FIRST as real geometry, membrane hung off
it; (2) a thickened **leading-edge spar** (humerus-radius bar) so the wing has a front edge; (3) each
bay scalloped + slightly drooped (camber), never a taut flat plane. No leading-edge bar + no scallops = fin.

**Folded vs spread:** **folded is the default for a static mini** (spread doubles the footprint, fragile
at low poly). Folded: forearm Z-folds back on the humerus, finger struts collapse forward like a closed
fan, membrane pleats into vertical folds tucked down the flank, spar riding high. Reserve spread for a
hero/airborne beat (give it dihedral + forward-cupped struts so it reads as caught air).

**Body integration (do NOT model these identically):** Dragon = wings are a *3rd limb pair* on a full
quadruped (4 legs + 2 wings, rooted high on the shoulders). Wyvern = wings ARE the forelimbs (2 hind
legs + 2 wings, walks on the wing-wrist claw). Bat = tiny body slung *beneath* dominant wings. Bird =
prominent keeled **breast block**, wings fold high against the back.

**Topology / efficiency:** struts = thin tapered 3–5-side tubes; membrane = a low-poly triangulated fan
between struts, trailing edge scalloped inward, one loop per bay for droop. ~60–150 tris/wing.
**NEVER remesh/voxel a wing** — it fuses struts + destroys the membrane = the flat-sheet failure again.

**Reading cue (the ONE thing):** the finger struts breaking the trailing edge into a fan of concave
scallops, radiating from a thick leading-edge spar. Spend your one detail there, not on surface texture.

## Family stubs — remaining

- **AVIAN** (harpy wings, giant bat): keel chest + the WINGED wing rules above; thin scaled legs, folded-wing default.
- **HUMANOID** — already covered by the PC kit grammar (`parts.js` / rlm-kits); noted for completeness.
