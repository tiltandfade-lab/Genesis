# Material Workbench condition proof

This proof applies independent, deterministic age, erosion, and wetness overrides to the shipped
Fantasy floor and wall textures. The source albedos are copied byte-for-byte from their Git LFS
objects and never overwritten.

The structure pass is not luminance-to-height. Thin local darkness plus oriented support proposes
joints; seeded geometry supplies face relief; and each material class sets its own joint depth,
erosion depth, face relief, and normal bake response. Source discoloration has zero direct height
gain. Automatic joint proposals remain editable starting masks rather than final semantic truth.

Run:

```sh
GENESIS_OFFLINE_ART_TOOLS=/private/tmp/genesis-offline-art-tools \
  python3 dev/material-workbench-proof/generate-condition-maps.py
node dev/material-workbench-proof/capture-condition-workbench.mjs
node dev/material-workbench-proof/verify-condition-workbench.mjs
```

For an interactive session, serve the repository without opening any application automatically:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then visit
`http://127.0.0.1:8765/dev/material-workbench-proof/material-condition-workbench.html`.

The browser proof uses stock `MeshStandardMaterial` with composite CanvasTextures:

- Age blends a masked, desaturated mineral finish and slightly raises dry roughness.
- Erosion blends toward a class-scaled normal derived from widened joints and chipped edges while
  preserving albedo.
- Wetness darkens only its mask, lowers roughness toward a class-specific wet target, and softens
  wet micro-normal response.

The intended repository save contract is deliberately non-destructive:

- **Save New** writes a new tracked preset JSON containing the base material and override values.
- **Overwrite** updates the selected preset JSON only after presenting a diff.
- Source PNG and `.ptex` files are immutable through ordinary Save operations.
- **Bake/Export** is separate and writes derived albedo/normal/roughness artifacts under a new or
  explicitly selected derived-material target.

The proof demonstrates the visual and data contracts. The local write API, catalog browser,
correction brush, diff view, and production export path are subsequent Material Workbench units.
