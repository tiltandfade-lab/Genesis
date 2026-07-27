# Meshy Runtime Pack

Status: production pilot complete (2026-07-26)

## What shipped

The first 15 accepted Meshy donors are compiled as the `meshy-genesis` runtime pack. Each asset now has:

- a stable source and processed-donor provenance chain;
- bottom-centered placement at Genesis scale (`1 world unit = 5 feet`);
- a tactical footprint and collision/cover classification;
- legal scaling axes;
- semantic ownership groups and Genesis material families;
- mounting, interaction, assembly, or effect sockets as appropriate;
- site-runtime state ownership;
- local LOD0, LOD1, and LOD2 GLBs.

Simple repeated components and state dressing are not additional Meshy assets. Wheels, axles,
handles, cranks, hinges, latches, hooks, brackets, spikes, feet, pulleys, bearing blocks, clamps,
collars, couplers, eyelets, cleats, pins, rungs, caps, rope, chain, FX, containers, cargo sockets,
gears, sprockets, ratchets, pawls, winch drums, spools, rollers, chain guides, fairleads, shackles,
swivels, tensioners, buckles, strap loops, corner plates, gussets, anchor plates, wedges, runners,
socket cups, surface media, and composable state recipes are owned by the complementary
`PROCEDURAL-ASSET-KIT.md` runtime module.

The editable citizenship catalog is
`Reference/Meshy-Premium-Month-1/runtime-citizenship.json`. It is the authority for runtime size,
parts, materials, sockets, footprints, and collision. Processed GLBs remain immutable donors.

## Rebuild

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background \
  --python scripts/model-foundry/build-meshy-runtime-pack.py
node dev/verify-meshy-runtime-pack.mjs
```

Generated outputs live in `assets/models-normalized/meshy-genesis/`; full hashes, measured
dimensions, scale factors, sockets, and output sizes live in
`dev/model-foundry/MESHY-RUNTIME-PROVENANCE.json`.

## Visual proof

Serve the repository and open:

`/dev/model-foundry/meshy-runtime-viewer.html`

The proof loads every piece through `src/ui/theater-donor.js`, applies Genesis-owned runtime
materials, enables shadows, arranges the assets as a guard-post construction palette, and exposes
click-to-inspect orbit and zoom controls.

The material-context selector demonstrates the two-layer contract:

- the compiled mesh owns semantic families such as `wood`, `iron`, `stone`, `cloth`, and `ceramic`;
- `loadDonorPiece()` accepts `materialContext` for explicit variants or `contextText` for already
  rolled narrative/sensory text.

For example, `{wood:"ironwood"}` recolors every structural-wood group without touching iron or
stone. Passing `"soot-black creosote over raw pine"` through `contextText` resolves the existing
mine-surface language to creosote pine automatically. Current recognized variants include pine,
oak, ironwood, driftwood, rotwood, creosote pine, wrought/rusted/blackened iron, granite,
sandstone, slate, canvas, wool, and earthenware. This is a derivation seam, not a new roll: when
regional text already establishes a material, the visual donor reflects it; otherwise it retains
the generic Genesis family palette.

## Source preservation

`scripts/model-foundry/organize-meshy-sources.py --apply` performs only explicit, source-preserving
moves. It never deletes donors. The resulting checksums and canonical paths are recorded in
`Reference/Meshy-Premium-Month-1/incoming/SOURCE-LEDGER.json`; useful alternates remain in
`incoming/variants/`, and failed attempts remain in `incoming/rejected/`.
