---
type: system-spec
project: Genesis
status: TRIAGE 2026-07-08 — the lane-decision layer that sits ABOVE the model build. Answers Adam's
  question: of everything not yet given the reference-driven treatment, which subjects deserve the
  Blender-from-ref lane vs the JS-render lane. Grounded in eyes-on evidence (cr2 contact sheet +
  humanoid A/B), not assertion.
created: 2026-07-08
related:
  - "[[MODELING-PIPELINE]]"   # the refs-first process — applies to BOTH lanes (this doc decides which lane)
  - "[[REALM-MODEL-PLAN]]"    # re-cuts the 42 targets BY REALM; this cuts them BY LANE (organic vs geometric)
  - "[[VISUAL-ASSET-QUEUE]]"  # the flat 42-target frequency ranking this consumes
  - "[[MODEL-BLITZ-24H]]"     # the parallel probe-lib text-wave method = the JS lane's production mode
  - "[[DESIGN-GUIDE]]"        # §II.0b all art is placeholder; swap-cheap seams
---

# MODEL-LANE-TRIAGE — Blender-from-ref vs JS-render, per subject

> **The decision this doc makes.** Every one of the ~410 registry keys already has a JS builder — the
> render pipeline has zero blanks. So "not yet modeled" means **not yet given the reference-driven
> treatment**. Most JS builders were authored from-memory, before the refs-first doctrine. This doc
> decides, per subject, which of two upgrade lanes it earns.

## The two lanes

**JS-render lane** — probe-lib landmark tables (`dev/model-qa/creatures/*.js`), authored refs-first,
produced as **parallel text waves** (the [[MODEL-BLITZ-24H]] method — an 82-piece roster landed in one
commit). Cheap, fast, no GUI socket. **Caliber is high for geometric subjects, capped for organic ones.**

**Blender-from-ref lane** — serial socket authoring (`genesis-blender-mcp`), refs-first per
[[MODELING-PIPELINE]] Step 1–5, exported through the live GLB seam
([theater-boot.js](../src/ui/theater-boot.js) L2430: a registry entry carrying `.glb` instead of
`.build` takes the GLTFLoader path). Expensive, serial, one figure at a time. **Caliber ceiling is high
across the board** — subdivision, sculpt, curved surfaces, modifier kitbash.

## Does refs-first help the JS lane? YES. (Adam's question, answered.)

Refs-first is a discipline on the **author**, not the tool. The pipeline's biggest quality lever is:
pull 4–8 Wikimedia refs → *view them* → distill a NOTES.md of what makes the silhouette read at mini
scale → **then** model off the notes. Nothing in that loop is Blender-specific. Authoring the JS
landmark tables *informed by the same notes* front-loads the same on-model correctness — correct
proportions, the specific reading cues (the wolf's low-slung head, the owlbear's beak-on-mass). **JS
can model from reference, and it raises caliber, for the same reason it does in Blender.**

**The ceiling is the catch.** Ref value is highest for period/exotic subjects (weak from-memory prior);
but even with identical references, an organic subject whose *read* depends on mass, musculature, wing
membrane, or flowing cloth will out-caliber in Blender, because the JS lane's primitives (quad-lofts:
`stack`/`ring`/`stitch`) resolve blocky/geometric form far better than organic form.

## The decision axis

> **Lane = f( organic-form-dependence , frequency , prior-weakness )**
> High organic-form-dependence → Blender. Geometric/silhouette read → JS. Frequency and
> period/exotic specificity raise the priority *within* whichever lane, and can pull a borderline
> organic subject up into the Blender queue.

## Eyes-on evidence (why this axis, not a guess)

From `dev/model-qa/sheets/cr2.png` (in-engine, PS1 grade) — the split is visible in one frame:

- **Reads well on the JS lane (geometric):** OGRE (club), WIGHT (armored + sword), MINOTAUR (horns).
  Clean, coherent, on-model. These do not need Blender.
- **Fails on the JS lane (organic):** OWLBEAR reads as a generic bulky humanoid — no bear-mass, no owl
  beak. WEREWOLF is an unparseable hunched blob. GARGOYLE's wings don't resolve. The organic read
  collapses. These are the Blender-from-ref candidates.
- The `dragon-beauty` silhouette reads as a dragon, but its wing is a single flat angular sheet — the
  geometric lane straining at an organic subject even when the overall silhouette survives.

## The ranking

### Blender-from-ref lane — organic subjects, build top-down by leverage

`inst` = live creatures aliasing to this target (VISUAL-ASSET-QUEUE). ✓ = a Blender GLB already exists
(may be unwired). "Stands for" = archetype leverage beyond its own count.

| # | subject | inst | why Blender | stands for |
|---|---|---|---|---|
| 1 | **young-red-dragon** ✓unwired | 46 | wings + serpentine mass + membrane | **ALL 43 chromatic/metallic dragon keys** (wyrmling→ancient) |
| 2 | **giant-lizard** | 52 | quadruped reptile body/gait | reptilian beasts, drakes |
| 3 | **wolf** | 33 | quadruped musculature, low-slung head | worg, dire wolf, jackal, hound line |
| 4 | **owlbear** | 31 | bear-mass + owl beak — *currently failing* | feathered/furred bruisers |
| 5 | **harpy** | 40 | winged-humanoid membrane | winged humanoids |
| 6 | **wyvern** | 22 | wings + reptile — dragon-adjacent | lesser draconics |
| 7 | **giant-bat** | 21 | wing membrane | flying beasts |
| 8 | **warhorse** | 18 | quadruped musculature | mounts, the horse line |
| — | tail (organic): troll, worg, fire-elemental, giant-constrictor-snake, werewolf, gargoyle | 2–6 ea | mass/flame/serpent | build as reached |

### JS-render lane — geometric subjects, well-served; re-author from ref only where frequency earns it

The vast majority. Every one reads on landmark tables; Blender would add cost without materially
raising the read.

- **Humanoids & armored:** warrior-veteran (79), skeleton (55), wight (50), cultist (47), bandit (36),
  ogre (32), ghoul (21), hill-giant (15), guard (10), zombie (9), orc-warrior (8), + cultist-fanatic,
  bugbear, goblin, gnoll, hobgoblin, kobold, commoner.
- **Constructs (blocky IS on-model):** stone-golem (33), earth-elemental (27), animated-armor (17).
- **The entire race×class PC matrix** (dragonborn/dwarf/gnome/halfling/half-orc × 12) — all humanoid,
  uniformly JS-lane. One note covers all ~300.
- **Amorphous/simple:** gray-ooze (26), shadow (42, translucent), needle-blight (26), mimic (12).
- **Arthropod:** giant-spider (11) — leg-tubes read fine on JS.

**Highest-frequency re-authoring candidates (JS-from-ref, cheap, high impact):** warrior-veteran (79)
and skeleton (55) each front ~130 creatures combined — a refs-first JS re-author of these two is the
best *caliber-per-hour* move on the whole roster, and needs no Blender.

## Proof — wolf, both lanes, same lit probe (2026-07-08)

Built to make the lane thesis empirical, not asserted. Artifacts in
`genesis-blender-mcp/out/wolf/` (`COMPARE_wolf_AB.png`, `wolf.glb`).

- **A — current JS** (`mon-wolf.js`, baked via `export-obj.mjs`, vertex colors intact): reads as a
  wolf in *silhouette* (low head, open maw, tail-back) but the forms are crude — single-tube legs
  with no haunch, a boxy slab trunk (no deep chest, no belly tuck), a fat tail floating off the back.
- **B — Blender-from-ref** (refs-first NOTES → overlapping-mass kitbash → voxel-remesh to one organic
  skin → decimate 1841 tris → PS1 facets): continuous muscled barrel torso, dropped deep chest,
  haunched legs, connected brush tail, low canine head. **The organic-mass delta is decisive** — the
  volume simply isn't reachable on the landmark-table lane.
- **Honest caveats (both are pass-3 polish, not lane-invalidating):** B's topline is slightly lumpy
  from sphere-fusion; B rendered near-monochrome (my 3-sun rig over-exposed the agouti colour zones —
  A's darker baked palette held up better under the same lights). The comparison stands on *form*.
- **Method is now batch-ready** — `wolf_blender.py` is the reusable kitbash→remesh→facet→zone→render
  →GLB harness; `export-obj.mjs` bakes any JS builder for the baseline. Next organic subjects are one
  script each.

**Recommendation:** the Blender lane is worth it for organic subjects — confirmed on a mid-difficulty
one. `wolf.glb` is ready to wire to the `wolf` registry entry as the first organic upgrade *pending
Adam's OK on the lane assignments below*.

## Gap-close experiment — a THIRD lane (2026-07-08, Adam's steer)

Adam's critique of the voxel-remesh wolf: blobby, ignores the actual form, poly-inefficient — the JS
wolf reads better. His question: **can Blender just CLOSE the JS models' gapped/sketchy shapes while
keeping their form + efficiency?** The JS wolf bake is objectively sketchy: **53 loose shells, 414
open-boundary edges, 598 tris.** Five techniques tried (`out/wolf/COMPARE_wolf_5way.png`):

| ver | technique | tris | result |
|---|---|---|---|
| C | **weld-by-distance + fill-holes** | **518** | ✅ closes 53→8 shells, 414→23 open edges, KEEPS exact faceted form + vertex colours, *trims* tris |
| B | voxel remesh (coarse 0.028) | 1841 | ❌ blob |
| D | boolean union (EXACT) | 457 | ❌ broke the mesh — open thin overlaps aren't manifold solids |
| E | fine voxel (0.014) + decimate | 3692 | ❌ jagged + 7× heavier |

**Finding — a third lane exists:** the conservative **weld+fill "close" pass** is the ONLY post-bake
op that closes gaps while honouring form + efficiency (every re-tessellation blobs, breaks, or bloats).
It is purely mechanical → **batchable across the whole JS roster** (bake → weld+fill → clean GLB, no
authoring). What it CANNOT fix: legs are separate open tubes *inserted into* the trunk (no shared
verts), so the leg/body junction stays seamed. That is a **source-geometry** limit, not a Blender one —
the clean fix is author-side (build quadruped leg-tops to seat into / share the body seam, and close
the barrel underbody), after which weld+fill closes fully. That source fix generalises to every
quadruped builder.

**Three lanes, not two:**
1. **JS as-is** — geometric subjects that already read. Free.
2. **JS → weld+fill CLOSE** *(new, batchable)* — de-sketch any JS model, keep form + efficiency.
3. **Blender-from-ref** — organic subjects needing invented mass (proper kitbash, NOT voxel).

## Build order (this session's recommendation)

1. **Wire the existing Blender dragon** (`out/mon-dragon.glb`) — highest leverage already built, just
   not connected. Zero modeling cost.
2. **Blender lane, top-down:** giant-lizard → wolf → owlbear → wyvern/giant-bat/warhorse.
3. **JS-from-ref re-authors (parallelizable):** warrior-veteran, skeleton — biggest caliber-per-hour.
4. Everything else stays JS, upgraded opportunistically per [[REALM-MODEL-PLAN]]'s realm cuts.
