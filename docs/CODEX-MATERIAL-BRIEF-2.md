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

1. **Timber wall/set + roof family** (the guard house's missing demand): wall candidates —
   post-and-beam · plank siding · log/roundwood · timber-frame with wattle-daub infill · weathered
   grey; shared door/lintel/post/beam grain family with at least the seed spec's
   `institutional-standard-section` and `upland-heavy-local` named configurations; roof fields —
   timber shake/shingle · plank-and-batten · slate · clay tile · thatch · turf/sod · hide/canvas
   tarp. The roof fields are possibility-roster seeds, not selections or admissions for Guard
   Post 1: §13's flat walkable deck in both cultures stays locked.
2. **Deck-edge culture candidates** (the locked ruling, catalog §13): the invariant is the flat
   deck + a cover-granting edge; the PATTERN is culture-expressive. Author candidates for
   Institutional (crenellated stone parapet family) and Upland (its own answers — timber rail,
   rubble upstand, others you judge coherent). These are taste candidates for Adam's A/B; do
   not pick a winner. This material lane authors surface/trim rhythms on declared neutral proxy
   geometry only; it does not author parapet/rail geometry or claim the later clay/validator proof
   of cover-class equality.
3. **Exterior ground set:** grass/meadow · worn path · mud · gravel/scree · marsh/bog.
4. **Remaining masonry + interior floors:** ashlar dressed · rough-hewn · dry-stack fieldstone ·
   brick · plastered rubble; flagstone · plank · packed earth · cobble · rush-strewn paint layer.
5. **Makeshift set** (vernacular 6): mud daub · wattle · stretched hide · bone/tusk stakes ·
   scavenged plank patchwork · swamp-moss thatch.
6. **Condition layers:** maintained-overgrowth masks (damp, moss/lichen, crevice growth,
   cleared-use suppression, recent-repair suppression — the lock audit's list) plus the remaining
   §8 roster responses (age, erosion, scorch, rust; reuse the already-proven wetness work rather
   than re-authoring it) as reusable filter subgraphs with parentage. These are affinities and
   response tools, never baked claims that a site is old, damaged, wet, repaired, or overgrown.
   Then author the trim-sheet `h6-v1` sources: six Institutional and six mirrored Upland role
   graphs under byte-equivalent layout metadata, followed by the deterministic 1024 master → 512
   runtime fold. A debug layout is additional, not one of the twelve beauty sources.

## Rules carried forward (all still binding)

- MM **1.3** pinned (`/Applications/Material Maker 1.3.app`, sha prefix `597b199fae597c4f`);
  headless export only, `Godot/Godot 4 ORM`. Base-material authoring/export is **512²**.
  **Named trim exception:** `h6-v1` source bands and master packing are **1024²**, with a
  deterministic **512²** runtime fold, exactly as the trim spec requires.
- **Determinism duty:** export every graph twice; byte-identical or it does not manifest.
- Every graph is a **versioned seed graph** with reusable custom nodes, named configurations,
  export receipts, and explicit parentage (no throwaway graphs — MATERIAL-LANE law). Height
  output wired in every base graph.
- **SUBTLE-TEXTURE bar:** quiet, readable-at-glance, never noisy, never photographic — the
  standee stays the star. Construction truth in the base; condition is a separate layer.
- Taste cards per the GP-MM-STONE-V001 pattern (reuse `dev/material-cards/`): tile · 3×3 seam ·
   lit slab · gameplay + standee · neutral clay control. Adam rules; FAIL notes return as graph
   revisions. Generalizing the currently hard-coded capture harness is in scope. Add the
   MATERIAL-LANE review surface that persists PASS/FAIL/notes in a rulings registry; until that
   surface is usable, reports must label captures `PENDING`, never imply admission. The four
   existing stone candidates stay live — do not re-author them.
- Retain at least one explicit negative-control card per relevant family (too-small scale,
  too-strong normal/macro/joint response, hue-only culture, or condition ignoring use/repair as
  applicable). The candidate must visibly outperform its control at the production camera.

## Your lane

Create with
`GIT_LFS_SKIP_SMUDGE=1 git worktree add ../worktrees/Genesis-materials-2 -b material/wave-2`.
Materialize only the existing canonical standee required by the card harness, read-only; never
stage it or any other LFS asset. Worktree `../worktrees/Genesis-materials-2`, branch
`material/wave-2`. Touch:
`dev/material-lane/**` (graphs/, library/, manifests/, receipts/, NOTES.md),
`dev/material-cards/**`. Never edit, author, or stage engine files, `assets/`, canon docs, or other
lanes; the read-only materialization of the one existing canonical standee above is the sole
`assets/` exception. Never push; never merge; Fable lands your branch.

At each stop: run the batch's deterministic exporter/verifier, card capture, `git diff --check`,
and any proportional repo gate; stage explicit paths only and make one coherent batch commit.
Do not begin the next batch until Adam responds to the report.

## Report format (raw data, per batch)

Branch + SHAs · per-material: slug, family/parentage, node approach (2 lines), dual-run sha256s,
tiling self-check · negative-control result · card capture paths/status · verifier results ·
batch commit SHA · open taste questions for Adam (batched, ≤10, plain English — the deck-edge
batch especially).
