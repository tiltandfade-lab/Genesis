---
type: material-source-sprite-proof
status: PASS-TECHNICAL
date: 2026-07-24
workflow: sprite-first-mm-second
---

# Autonomous seamless-sprite proof v001

This proof removes human seam repair from the source-sprite stage while preserving ImageGen as
the author of the material's visual character. It deliberately stops before Material Maker.

The reusable production contract, algorithms, gates, failure registry, adapter-routing rules, and
commercial extraction boundary are documented in `AUTONOMOUS-SEAM-MACHINERY.md`.

## Result

Two different topology lanes pass:

1. **Period-aware / plank-and-batten** — detects two matching construction crevices, crops a
   complete crevice-to-crevice period, preserves that vertical construction boundary, and repairs
   only the non-structural top/bottom edge.
2. **Modular / slate** — extracts four ImageGen-authored slate sprites and assembles them on a
   toroidal staggered grid whose row, column, and variant periods divide the square canvas exactly.

The builder emits the final source sprite, a 3x3 repeat, a combined proof board, and a JSON
receipt. It exits non-zero if either material misses its topology gate or if the proof renderer
attempts to display a square tile or repeat at a non-square aspect ratio.

Run:

```bash
python3 dev/material-lane/build-autonomous-seam-proof.py
```

## Generator mode and source-component prompt

Mode: **built-in ImageGen**, followed by the imagegen skill's chroma-key removal helper.

```text
Use case: stylized-concept
Asset type: Genesis modular material sprite component sheet for autonomous seamless tile assembly
Primary request: exactly four separate hand-cut slate roof-piece sprites, arranged as a clean
2-by-2 component sheet. Each is one single flat blue-grey slate piece seen perfectly front-on,
with a broad rectangular body and a subtly irregular lower edge. Give the four pieces modest
silhouette and cool-value variation while keeping them clearly one material family.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal.
Style/medium: pixel-art sprite rendering with visible pixel grid; grounded Traditional Monster
Manual fantasy character; clean value shapes; restrained dither only at silhouette edges.
Composition/framing: four isolated slate pieces only, equal visual scale, generous green space
between them and around every outer edge; no touching or overlap.
Lighting/mood: flat local albedo color only; zero perspective; zero camera angle; zero depth
gradient; zero directional lighting.
Constraints: background must be exactly one uniform #00ff00 with no texture, shadows, gradients,
floor plane, or variation. Each slate must have a crisp closed silhouette. No cast shadows,
highlights, ambient occlusion, bevel shading, mortar, roof field, labels, grid lines, frame, text,
moss, cracks, props, watermark, or extra objects. Do not use #00ff00 inside any slate.
```

## Acceptance

The boundary transition must be no stronger than the 95th percentile of ordinary internal
neighbor transitions. A wrapped construction material's largest circular crevice gap may not
exceed 1.65x its median crevice gap. Modular periods must close exactly over the output
dimensions. A 3x3 repeat is mandatory evidence, displayed at an asserted 1:1 aspect ratio with
join locations marked by copper ticks.

This is a **technical topology proof**, not a final taste approval. The slate's small variant set
still produces visible repetition, and both sources may need quieter albedo treatment before they
become shipped Genesis materials. They are now safe to evaluate without hidden seam failures.

## Outputs

- `proofs/autonomous-seam-v001/plank-autotile-v001.png`
- `proofs/autonomous-seam-v001/plank-autotile-repeat-3x3-v001.png`
- `proofs/autonomous-seam-v001/slate-autotile-v001.png`
- `proofs/autonomous-seam-v001/slate-autotile-repeat-3x3-v001.png`
- `proofs/autonomous-seam-v001/autonomous-seam-proof-board-v001.png`
- `proofs/autonomous-seam-v001/autonomous-seam-proof-receipt-v001.json`
