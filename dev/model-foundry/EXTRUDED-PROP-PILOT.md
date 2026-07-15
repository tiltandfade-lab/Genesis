# Extruded prop pilot report

This directory executes ES-0 and ES-1 from `docs/EXTRUDED-SPRITE-PROP-LIBRARY.md` without touching
runtime theater code.

Production scope is limited to **Fantasy, Gloom, and Chrome**. Other-realm dressing sprites are
listed only when they match a high-value cross-realm semantic primitive; they are not automatically
compiled or expanded into a realm matrix.

## Commands

```sh
python3 dev/model-foundry/gen_prop_source_manifest.py
python3 dev/model-foundry/gen_flat_prop_regeneration.py
python3 dev/model-foundry/extrude_prop_sources.py --allow-legacy-perspective-research
```

The extrusion proof uses pinned Shapely/Earcut packages in the disposable offline-art tool home.
That backend is research evidence only. Production polygon ownership remains gated on R1/G1 in the
graphics convergence plan.

The override in the third command is deliberately alarming: it reproduces failed evidence from
legacy perspective-painted sprites. Normal production compilation excludes every source until a
fresh one-asset generation passes the flat orthographic projection gate.

## Proof corpus

The twelve-object router corpus includes nine real source-art extrusion candidates and three
negative controls. Crate/barrel must route to `FACED_BOX`; urn must route to a lathed `MODEL`.
Router success means they are rejected from the single-extrusion compiler, not that the compiler somehow
forces them into shallow geometry.

Canonical GLBs are emitted under `extruded-props/glb/` for offline inspection. They are not runtime
assets and are not referenced by `manifest.json`.

After the router proof, every currently cut core-realm source classified `EXTRUDE` is compiled into
`extruded-props/library-glb/`. `library-report.json` records technical compilation, failures,
topology, hashes, and provisional face-budget results. Technical compilation proves only that a GLB
can be generated and reloaded. It is not visual acceptance. This is an offline candidate library,
not a runtime registry; every record has `runtimeAdmitted: false`.

Read `extruded-props/VISUAL-REVIEW.md` before interpreting either contact sheet. The current visual
verdict is `FAIL`, including for the improved second capture.
