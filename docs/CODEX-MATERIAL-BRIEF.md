# CODEX-MATERIAL-BRIEF — Wave-1 material authoring (the proving task)

type: agent-brief
status: ACTIVE 2026-07-23 (folded lane; source of truth = docs/MATERIAL-LANE.md — read it FIRST, fully)
consumer: Codex (the art department). Adam hands this brief to a fresh Codex session.

## Your task

Author the **Wave-1 material set** as Material Maker `.ptex` node graphs and prove the pipeline:
one PBR material per existing floor-recipe key, exported headlessly, deterministic, manifested.
This is the proving ground — quality of process counts as much as quality of output.

**The 17 Wave-1 keys** (the live `FLOOR_MATERIAL_RECIPES` demand list, theater-boot.js:687):
`flagstone` · `cobble` · `cracked-earth` · `cave-rock` · `grass` · `leaf-litter` · `sand` ·
`snow-ice` · `mud` · `scree` · `plank` · `ash` · `grating` (cutout) · `asphalt` ·
`void-floor` · `rope-matting` · `candy-tile`

**Prove yourself on the first three: `flagstone`, `cobble`, `plank`.** Stop after those three
and report; Adam reviews the process before you continue the roster.

## The tool (pinned — never upgrade, never substitute)

- Material Maker **1.3** at `/Applications/Material Maker 1.3.app` (binary sha256 prefix
  `597b199fae597c4f`). 1.7 is deleted and forbidden (hardware ceiling; MATERIAL-LANE §1a).
- `.ptex` files are JSON text — author/mutate them directly. The GUI is Adam's, not yours.
- Headless export (the ONLY compile path you use):
  ```
  "/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker" \
    --export-material --target "Godot/Godot 4 ORM" -o <outdir> <graph>.ptex
  ```
  Emits `<name>_albedo.png`, `<name>_normal.png`, `<name>_orm.png` (AO=R, Rough=G, Metal=B).
- Export resolution: **512²** (set the graph/export size; MM's 2048² default is wrong for us).

## Your lane (files you may touch — NOTHING else)

Work in your own worktree on branch `material/wave-1`
(`GIT_LFS_SKIP_SMUDGE=1 git worktree add ../Genesis-materials -b material/wave-1`).
- `dev/material-lane/graphs/<slug>.ptex` — the authored sources (tracked; slug = the recipe key).
- `dev/material-lane/exports/` — **gitignored** (add the .gitignore entry); exported PNGs live
  here locally until a taste-card PASS admits them.
- `dev/material-lane/MANIFEST.json` — one entry per material:
  `{slug, family, intendedRealms[], ptexPath, ptexSha256, exportTarget, exportResolution,
    outputs:{albedo,normal,orm}: {file, sha256}, authoredDate, notes}`.
- `dev/material-lane/NOTES.md` — your working log (decisions, node techniques, open questions).
Never: engine files, canon docs, `assets/`, `manifest.json`, other lanes' files. Never push;
never merge; Adam's orchestrator lands your branch.

## The bar (this is what PASS means later)

- **SUBTLE-TEXTURE principle (the review bar):** low-contrast, readable-at-glance, never noisy,
  never photographic — the stage stays quiet so the standee sprites stay the stars. A material
  that would upstage a sprite FAILS however good it looks alone.
- Each material must **tile seamlessly** (check a 3×3 repeat yourself before manifesting).
- Height output wired in every graph (mutators will key off it later — MATERIAL-LANE §5a).
- `grating` uses alpha cutout (mesh/see-through), not painted holes.

## Determinism duty (non-negotiable, per export)

Export every graph **twice**; the PNG sha256s must be byte-identical across runs. Record the
hashes in MANIFEST.json. A graph whose exports differ between runs is broken — fix it (no
time/random-seed-drift nodes) before manifesting.

## What happens to your output

Your graphs + exports feed the **taste-card harness** (`dev/material-cards.mjs`, being built in
the Claude lane): 1:1 tile · 3×3 field · lit slab under the Genesis light rig · sprite-context
strip. **Adam PASS/FAIL-rules every card; FAIL notes come back to you as graph revisions.** No
material touches the engine before its PASS (MATERIAL-LANE §2). Until the harness lands, your
deliverable is graphs + deterministic exports + manifest — review-ready.

## Report format (raw data)

Branch + SHAs · per-material: slug, node-graph approach (2 lines), export sha256s ×2 runs
(proving identity), tiling self-check result · anything you couldn't make deterministic ·
open taste questions for Adam (batched, ≤10, plain English).
