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

## Your task

Author the **full guard-post material possibility roster** (STRUCTURE-KIT-CATALOG §8 — every
slot, each possibility one cheap candidate; Adam taste-passes later in the review tool, so
breadth beats polish) as Material Maker 1.3 versioned seed graphs, plus the **culture-pair
expressions**. Batch order, stop-and-report after each:

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
- Every graph is a **versioned seed graph** with reusable custom nodes, named configurations,
  export receipts, and explicit parentage (no throwaway graphs — MATERIAL-LANE law). Height
  output wired in every base graph.
- **SUBTLE-TEXTURE bar:** quiet, readable-at-glance, never noisy, never photographic — the
  standee stays the star. Construction truth in the base; condition is a separate layer.
- Taste cards per the GP-MM-STONE-V001 pattern (reuse `dev/material-cards/`): tile · 3×3 seam ·
  lit slab · gameplay + standee · neutral clay control. Adam rules; FAIL notes return as graph
  revisions. The four existing stone candidates stay live — do not re-author them.

## Your lane

Worktree `../worktrees/Genesis-materials-2`, branch `material/wave-2`. Touch:
`dev/material-lane/**` (graphs/, library/, manifests/, receipts/, NOTES.md),
`dev/material-cards/**`. Never: engine files, `assets/`, canon docs, other lanes. Never push;
never merge; Fable lands your branch.

## Report format (raw data, per batch)

Branch + SHAs · per-material: slug, family/parentage, node approach (2 lines), dual-run sha256s,
tiling self-check · card capture paths · open taste questions for Adam (batched, ≤10, plain
English — the deck-edge batch especially).
