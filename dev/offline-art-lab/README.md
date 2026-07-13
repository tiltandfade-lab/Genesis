# Offline art foundry lab

Research-only tools for graphics production outside the live Genesis renderer. Nothing in this
directory is loaded by `genesis.html`, registered in `manifest.json`, or permitted to alter walk data.

The default scratch dependency root is `/private/tmp/genesis-offline-art-tools`:

```sh
python3 -m pip install --target /private/tmp/genesis-offline-art-tools \
  trimesh==4.12.2 opencv-python-headless==4.12.0.88 scikit-image==0.24.0

python3 dev/offline-art-lab/visual_metrics.py
python3 dev/offline-art-lab/texture_probe.py
python3 dev/offline-art-lab/mesh_probe.py

# Networked catalog audit; downloads only to the chosen scratch directory.
python3 dev/offline-art-lab/kenney_catalog_audit.py \
  --out-dir /private/tmp/genesis-offline-art-results/kenney --download-shortlist
python3 dev/offline-art-lab/kenney_grammar_probe.py \
  --staged-root /private/tmp/genesis-offline-art-results/kenney/glb \
  --out-dir /private/tmp/genesis-offline-art-results/kenney
```

Set `GENESIS_OFFLINE_ART_TOOLS` to use another dependency root. Results default to
`/private/tmp/genesis-offline-art-results`; pass `--out-dir` to retain a particular run. The committed
`baseline-findings.json` is the dated evidence used by the research specification.

These probes measure technical and compositional properties. They do not autonomously accept art.
Taste-bearing conclusions still require reading the generated overlays and comparison images.

This directory is a Python/image research lab, not the shared JavaScript dependency authority.
`dev/geometry-tools/pins.json` and `dev/geometry-tools/LEDGER.md` own geometry/glTF package pins and
the R0-R9 execution path in `docs/GRAPHICS-CONVERGENCE-PLAN.md` owns global ordering.

`kenney_catalog_audit.py` is intentionally a scratch fetcher, not an asset installer. It records
official source URLs, declared license, archive license evidence, versions, hashes, and contents.
It never writes under `assets/`. A reviewed donor manifest must select exact files before any
geometry can enter production; see `docs/OFFLINE-ART-FOUNDRY-RESEARCH.md`.
