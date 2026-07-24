# CODEX-MATERIAL-BRIEF-2 — the guard-post possibility roster + the culture pair

type: agent-brief
status: ACTIVE 2026-07-24. Supersedes the Wave-1 generic-keys task in `CODEX-MATERIAL-BRIEF.md`
(Adam's 2026-07-24 ruling: site-kit-first; the generic roster accumulates out of site kits).
consumer: Codex. Runs in PARALLEL with the clay-ladder lane — zero dependency either way; your
outputs are consumed when CL-R4 (material bench) opens.
authorities, read in order: `docs/MATERIAL-LANE.md` (the lane's source of truth) ·
`docs/STRUCTURE-KIT-CATALOG.md` §8 (the roster you are authoring) + §13 (the locked deck ruling) ·
`Reference/FFT-Guard-Post-Study/analysis/GUARD-POST-MATERIAL-MAKER-1.3-SEED-GRAPH-SPEC.md`
(your node/graph/mutation/export contract) · `GUARD-POST-TRIM-SHEET-MM1.3-SPEC.md` (band work).

## Binding workflow override — sprite first, MM depth second

Adam's 2026-07-24 ruling, verbatim:

> "alright switched to a lower model and immediately ran into problems. so fable may have decided
> that materials shouldn't be built sprite first, but I am overriding that immediately, sprites
> first, materials layered on those sprites second. i like the richness of character that the
> sprites give us. Just for science, can you generate 3 different sprites and then just do 3
> different materials so I can make this decision with some evidence?"

This overrides any material-first reading of this brief. The required order for every base
material is now explicit:

1. Generate the surface **source sprite** under the standing Genesis sprite-art law and approve its
   visual identity at play distance.
2. Repair and prove the source sprite's required seams/repeat behavior. A source that merely looks
   plausible at 1× but fails its repeat axis is not production-ready.
3. Import that sprite into the versioned MM 1.3 graph as the albedo source.
4. Use MM to interpret structural height and supply normal, AO, roughness, and height. MM augments
   the sprite; it does not replace, repaint, or procedurally reinvent the sprite's albedo identity.
5. Review **before MM depth** and **after MM depth** under the same geometry, camera, roughness, and
   light rig. Reject depth that embosses illustration grain or ink lines as geometry.

The proof fixture is `SPRITE-FIRST-MATERIAL-V001` under
`dev/material-lane/` and `dev/material-cards/`. Its method passed; its three generated sources
remain non-production evidence until their seam failures are repaired.

## Your task

Author the **full guard-post material possibility roster** (STRUCTURE-KIT-CATALOG §8 — every
slot, each possibility one cheap source-sprite + derived-material pair; Adam taste-passes later in
the review tool, so breadth beats polish) as approved source sprites feeding Material Maker 1.3
versioned seed graphs, plus the **culture-pair expressions**. Batch order, stop-and-report after
each:

1. **Timber set + roof family** (the guard house's missing demand): door/lintel/post/beam grain
   family; roof fields — timber shake/shingle · plank-and-batten · slate · clay tile · thatch ·
   turf/sod · hide/canvas tarp.
2. **Deck-edge culture candidates** (the locked ruling, catalog §13): the invariant is the flat
   deck + a cover-granting edge; the PATTERN is culture-expressive. Author candidates for
   Institutional (crenellated stone parapet family) and Upland (its own answers — timber rail,
   rubble upstand, others you judge coherent). These are taste candidates for Adam's A/B; do
   not pick a winner.
3. **Exterior ground set:** grass/meadow · worn path · mud · gravel/scree · marsh/bog.
4. **Remaining masonry + interior floors:** ashlar dressed · rough-hewn · dry-stack fieldstone ·
   brick · plastered rubble; flagstone · plank · packed earth · cobble.
5. **Makeshift set** (vernacular 6): mud daub · wattle · stretched hide · bone/tusk stakes ·
   scavenged plank patchwork · swamp-moss thatch.
6. **Condition layers:** maintained-overgrowth masks (damp, moss/lichen, crevice growth,
   cleared-use suppression, recent-repair suppression — the lock audit's list) as reusable
   filter subgraphs with parentage; then the trim-sheet `h6-v1` production bands.

## Rules carried forward (all still binding)

- MM **1.3** pinned (`/Applications/Material Maker 1.3.app`, sha prefix `597b199fae597c4f`);
  headless export only, `Godot/Godot 4 ORM`, **512²**.
- **Determinism duty:** export every graph twice; byte-identical or it does not manifest.
- Every source sprite has a receipt and every derived graph is a **versioned seed graph** with
  reusable custom nodes, named configurations, export receipts, and explicit parentage (no
  throwaway graphs — MATERIAL-LANE law). The approved sprite is the graph's albedo parent. Height
  output is wired in every base graph.
- **SUBTLE-TEXTURE bar:** quiet, readable-at-glance, never noisy, never photographic — the
  standee stays the star. Construction truth begins in the sprite; MM depth must isolate broad
  structural relief rather than emboss high-frequency illustration grain. Condition is a separate
  layer.
- Taste cards per the GP-MM-STONE-V001 pattern (reuse `dev/material-cards/`): tile · 3×3 seam ·
  source sprite · pre-MM lit slab · post-MM lit slab · gameplay + standee · neutral clay control.
  Adam rules; source failures return as sprite revisions and depth failures return as graph
  revisions. The four existing stone candidates stay live — do not re-author them, but do not use
  their earlier material-first construction as precedent for new roster entries.

## Your lane

Worktree `../worktrees/Genesis-materials-2`, branch `material/wave-2`. Touch:
`dev/material-lane/**` (graphs/, library/, manifests/, receipts/, NOTES.md),
`dev/material-cards/**`. Never: engine files, `assets/`, canon docs, other lanes. Never push;
never merge; Fable lands your branch.

## Report format (raw data, per batch)

Branch + SHAs · per-material: slug, family/parentage, node approach (2 lines), dual-run sha256s,
tiling self-check · card capture paths · open taste questions for Adam (batched, ≤10, plain
English — the deck-edge batch especially).
