---
type: system-spec
project: Genesis
status: LOCKED 2026-07-08 — the figure/prop modeling pipeline v2, distilled from the noir + theater
  pilots (two realms, incl. a real failure caught and corrected). This is the repeatable process for
  fleshing out all remaining realms + props.
created: 2026-07-08
related:
  - "[[BLENDER-MODEL-SPEC]]"   # the HOW: scale law, tri budget, palettes, kitbash grammar, prop scale contract
  - "[[REALM-MODEL-PLAN]]"     # the WHAT/ORDER: per-realm kits, stand-in targets, build order
  - "[[PROP-NOUN-LIBRARY]]"    # the prop taxonomy + table-expansion waves
  - "[[DESIGN-GUIDE]]"         # §II.0b all-art-is-placeholder; the swap-cheap seam
---

# MODELING-PIPELINE — the efficient way to build the best figures (v2)

> **Scale-out addendum (2026-07-08, Fable):** this doc describes the per-set process. For bulk
> production across all realms, see **[[MODEL-BLITZ-24H]]** — the existing 346 models were built as
> massively PARALLEL probe-lib text waves (an 82-piece roster landed in one commit), not serial
> Blender; the blitz returns to that method for rank-and-file (upgraded with this doc's laws) and
> reserves the serial Blender socket for 1–3 sculptural HEROES per realm.

**One-paragraph version.** Author references-FIRST, model in Blender through the live socket, keep
the kit (shared torso + swappable per-realm kit), run exactly **2 taste-gated rounds** per figure set,
wire through the **GLB seam** into the engine, and judge everything **with your eyes on lit renders** —
never on a metric. The silhouette-IoU number is a guardrail, not a target. Placeholder-coherent is the
bar (§II.0b), not beauty. This process took noir from "tuxedo t-shirts" to distinct minis and theater
from lookalike blocks to five era-distinct war pieces + a Sherman; it also produced (and we caught) one
metric-gamed disaster, which is why the rules below are worded the way they are.

## The pipeline (per figure set of ~4–6)

**Step 0 — Targets + scale contract (before any modeling).** Pick the set (from REALM-MODEL-PLAN's
per-realm kit + the highest-frequency stand-ins). Write each subject's real-world size into the scale
contract (feet, per BLENDER-MODEL-SPEC §1 — the same discipline the prop scale contract enforces). A
Sherman is tank-sized *on paper* before a vertex exists. This is what kills the "everything is one
square unit" failure at the source.

**Step 1 — References FIRST.** For each subject pull 4–8 Wikimedia Commons images (commons.wikimedia.org
API → Special:FilePath), **view them**, and distill a short `NOTES.md` — 4–6 bullets per subject on what
makes the silhouette *read at miniature scale* (the Brodie soup-plate dish, the scutum as one big flat
rectangle, the Sherman's cast turret + volute bogies). **Then** model off the notes. This is the single
biggest quality lever: it front-loads on-model correctness into pass 1, the cheapest place to have it.
Reference value is HIGHEST for period/realm-specific subjects (a 1916 uniform, a Sherman) where the
model's from-memory prior is weak; LOWEST for generic forms it already knows (a chair, a plain box).
**Standing rule (Adam):** delete the downloaded images when the notes are written — keep only `NOTES.md`.

**Step 2 — Pass 1: reference-informed kitbash.** Build the realm kit once (`rlm-<realm>-kit.js`
grammar: 1 shared torso + swappable head/kit/weapon units), assemble each figure from kit + ≤3
mutations + ≤1 prop. Author at scale (Step 0), PS1-faceted, in the realm's own authored palette
(graded-aware — check what realmRenderProfile does and author hexes that still read after the grade).
Tri budget [120, 2600]. Export GLB + a **lit** probe render (front + side).

**Step 3 — Taste-gate pass 1 (LOOK, don't assume).** Open every lit render and check with your eyes:
coherence, alignment, clipping, nothing floating, correct subject (centurion ≠ legionary), correct
facing (+z front). Fix bugs before iterating. Most of this session's misses — floating shield, spike
crest, wrong tank facing, magenta silhouettes — were "I built it so it should be right" without
looking. **A build you haven't visually verified is not done.**

**Step 4 — Pass 2: ONE coherent polish round.** Push pose expression + readability + realm character.
Do NOT chase distinctness — that splays figures into incoherent shapes (it shattered the legionary's
shield). Compute silhouette-IoU ONCE as a *guardrail*: flag any pair > 0.65 for a human look, but
never reshape a figure to lower the number. Taste-gate again on lit renders.

**Step 5 — Targeted round 3 (optional, rare).** Only for a single figure with a specific flagged
defect (the brute's value ladder; the centurion's shield/crest). Never a full re-pass. Note: value /
material / head / prop fixes are INVISIBLE to silhouette-IoU — judge them on the rendered image or a
value histogram, not the mask.

**Step 6 — Wire + render in-engine.** Register each GLB (`{glb, discR}` entry, the peer of
`{module, fn}`), load through the live GLB seam, and render on an actual board so the realm grade +
PS1 dither are applied. The final taste gate is in-engine, not in Blender preview.

## The hard-won rules (anti-patterns, worded from real failures)

1. **The metric is a guardrail, not a target.** Silhouette-IoU measures distinctness, not coherence
   or grace. Optimizing it produces exploded, incoherent figures. Adam's eye caught what the number
   rewarded. Use it only to flag lookalike pairs.
2. **Coherence > distinctness > beauty.** Fix floating parts / clipping / wrong-facing / freak-combos
   (centurion crest on a legionary body) first. Distinct silhouettes second. Polish last — and polish
   is the diminishing-returns zone; know when to stop (placeholder is the bar).
3. **References before pass 1, not on round 2.** Theater's reference-first pass 1 started better than
   noir's post-references round 2 — because a strong first pass caps (and obviates) the iteration.
4. **2 rounds is the budget.** r0→r2 is where a set stops being lookalike blocks; r2→r3 moved the
   metric ~1% (noir) and mostly reshuffled. Budget 2 rounds/set; reserve round 3 for one flagged hero.
5. **Look with your eyes on LIT renders.** Every "done" claim rides on a lit front+side the agent (or
   you) actually viewed. Silhouette/magenta previews hide material and seating bugs.
6. **Kitbash is the multiplier.** Shared torso + swappable kit ≈ 5× fewer builds (naive ~573 → ~110–130
   across all realms). The substrate already exists (`dev/model-qa/parts.js`).

## Tooling TODOs surfaced by the pilots (fix before the big rollout)

- **`seat_on_base` needs `radius`/`center` overrides** — it derives the disc from the full bbox, so a
  held weapon (tommy gun) balloons + off-centers the base. Add the params (spec §7).
- **GLB imports at an offset** (last import ~x≈12) — verification renders must use a **Track-To camera**
  aimed at the mesh bbox center, never a hardcoded camera aim (that's what produced the empty renders).
- **Reuse the build script's material/light rig for verification renders** — a fresh scene renders flat
  magenta (no materials) and can't be taste-gated. Match `theater_final.py`'s key/fill area-light setup.
- **GLB re-triangulates on export** — coplanar-merge "surface cleanup" is inert on the shipped artifact;
  don't budget for it. Crispness comes from fewer/cleaner authored boxes, not post-merge.

## The rollout plan (remaining realms + props, sequenced through this pipeline)

**Figures — build order (from REALM-MODEL-PLAN, by style-wrongness × frequency):**
1. **noir** — DONE (kit + brute/gangster/maestro/civilian, r2 quality; r3 brute value-ladder). GLBs in
   `genesis-blender-mcp/out/noir/`.
2. **theater** — DONE (trench soldier · centurion · revenant · Mark IV tank · Sherman). GLBs in
   `out/theater/final/`. War-across-eras thesis proven; the kit (one infantry torso) validated.
3. **frontier** — NEXT. Spaghetti-western: duster-and-revolver gunhands, boothill skeletal cowboys,
   cattle, the iron horse. ~high reference value (period-specific).
4. **high-seas** — pirates (currently render as `giant-rat`), the ship, sea-beasts.
5. then the mid-urgency realms (chrome, suburb, cosmic, lost-world, ash, bright-kingdom); **gloom LAST**
   (most stand-ins but lowest style-urgency — its shadow/skeleton/wight already read Gothic).
Per realm: Step 0–6, 2 rounds, ~11-part kit → ~30 figures. One realm per focused session.

**Props — Wave 4 (from PROP-NOUN-LIBRARY), authored against the scale contract:**
chair · bed · fence · market stall · shelf first (the most common real-terrain pieces, all currently
absent), then the remaining blank-block families. Every prop authored against its
`prop-scale-contract.js` row BEFORE modeling. Table waves 1–3 (keyword rules → core rows → realm-prop
rows) can land ahead of the models — an unbuilt part falls to the blank block, never a hole.

**Vehicles / non-humanoid** (tanks, ships, war-elephants, the iron horse): own size class, wide base,
break the humanoid disc — model per the scale contract, prove with a human-next-to-it scale render
every time (the Sherman precedent).

## Status inventory (2026-07-08)

- **GLB seam: LIVE + browser-proven** — Blender→engine load path merged to master. Realm floors
  recolored + checkerboard killed. Prop scale contract + resize landed (0 flags). 12 orphan props
  registered. Wave-1 interactable rules landed. Standardization linter landed.
- **Built, not yet engine-wired:** the noir kit (4 figures) + the theater set (5 pieces). Next concrete
  step for either: register their GLBs and render in-engine (Step 6).
- **The doctrine above is validated across 2 realms including a caught failure** — it is the process for
  the remaining 9 realms + props.
