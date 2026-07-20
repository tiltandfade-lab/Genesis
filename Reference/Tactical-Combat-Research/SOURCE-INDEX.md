---
type: reference-index
status: VERIFIED SOURCE SNAPSHOTS
created: 2026-07-20
---

# Tactical Combat Library Source Index

Retrieved 2026-07-20 for the procedural-redesign Wave 10 exact-cell investigation. These files are research
snapshots, **not installed Genesis dependencies and not implementation authority**. Each snapshot is pinned to an
immutable upstream commit. Source and tests were preserved where they materially help a later bakeoff; generated
bundles, media-heavy examples, application content, nested Git metadata, and dependency directories were omitted.
Included upstream files remain byte-for-byte snapshots and therefore retain any upstream formatting or trailing
whitespace; Genesis lint/format rules do not rewrite this reference corpus.

`MANIFEST.sha256` records SHA-256 hashes for every archived file except the manifest itself.

## Core movement/path candidates

| Local snapshot | Upstream and commit | Version/license | Included scope | Current disposition |
| --- | --- | --- | --- | --- |
| `libraries/tinyqueue/` | [`mourner/tinyqueue`](https://github.com/mourner/tinyqueue/tree/6f4349d466d79c6ccd3d243f26356efd65ac5b05) at `6f4349d466d79c6ccd3d243f26356efd65ac5b05` | 3.0.0, ISC | Implementation, types, tests, benchmark, package metadata, README, license | Leading direct-dependency candidate for a Genesis-owned bounded Dijkstra/A* queue; adoption still requires a later spec and license-notice check. |
| `libraries/easystarjs/` | [`prettymuchbryce/easystarjs`](https://github.com/prettymuchbryce/easystarjs/tree/10615147add3af46f76a5d86ee7b7e7bebf83ac5) at `10615147add3af46f76a5d86ee7b7e7bebf83ac5` | 0.4.4, MIT | Source, types, tests, package metadata, README, license | Prototype/bakeoff candidate for weighted 2D route-to-cell behavior; not a complete movement-range or D&D tactical kernel. |
| `libraries/pathfinding-js/` | [`qiao/PathFinding.js`](https://github.com/qiao/PathFinding.js/tree/2904a9afba483c02b5a61eb60fefd63e9b2db78c) at `2904a9afba483c02b5a61eb60fefd63e9b2db78c` | 0.4.18, MIT declared in package/README; no standalone license file upstream | Source, tests, documentation, entry point, package metadata, README | Algorithm and test oracle. Its mutable grid-node state and old packaging make it a weaker runtime candidate. |
| `libraries/rot-js/` | [`ondras/rot.js`](https://github.com/ondras/rot.js/tree/46782e248c2db9d379a5e4f13bb8323f18dff04b) at `46782e248c2db9d379a5e4f13bb8323f18dff04b` | 2.2.1, BSD-3-Clause | TypeScript source, tests, package/TypeScript metadata, README, license | Path/FOV reference and bakeoff candidate. Unit-cost paths and 2D FOV do not directly solve Genesis elevation or line of effect. |

## Deferred navigation and tactical-AI references

| Local snapshot | Upstream and commit | Version/license | Included scope | Current disposition |
| --- | --- | --- | --- | --- |
| `libraries/three-pathfinding/` | [`donmccurdy/three-pathfinding`](https://github.com/donmccurdy/three-pathfinding/tree/1526c84afed0d596cb13f4b7be36401fd2c6a430) at `1526c84afed0d596cb13f4b7be36401fd2c6a430` | 1.3.0, MIT | Source, tests, package metadata, README, license | Navmesh reference only for now; do not create a second geometry authority beside `SpatialPlan`. |
| `libraries/recast-navigation-js/` | [`isaac-mason/recast-navigation-js`](https://github.com/isaac-mason/recast-navigation-js/tree/8769e8b9995f127033af9f6e6eeac3fad7d66201) at `8769e8b9995f127033af9f6e6eeac3fad7d66201` | workspace snapshot, MIT | Package source and metadata, documentation, license; compiled WASM and examples omitted | Deferred navmesh/spatial-reasoning reference. Useful only if a later mode genuinely requires navigation beyond the canonical cell graph. |
| `libraries/yuka/` | [`Mugen87/yuka`](https://github.com/Mugen87/yuka/tree/10591304811222d6856020d5de129b39ef43b58d) at `10591304811222d6856020d5de129b39ef43b58d` | 0.7.8, MIT | Source, tests, package metadata, README/security notice, license | Deferred enemy-decision and agent-AI reference after tactical law exists; not a movement-authority candidate. |

## Target-schema reference

`schema-references/foundry-dnd5e/` contains only five files from
[`foundryvtt/dnd5e`](https://github.com/foundryvtt/dnd5e/tree/7e9435ed67240b3090cca2c3a1d03885085105d0)
commit `7e9435ed67240b3090cca2c3a1d03885085105d0`:

- `target-field.mjs` - separates affected-target declarations from area-template geometry;
- `range-field.mjs` - structured range/reach fields;
- `spell.mjs` - shows the fields composed into spell data;
- `config.mjs` - includes individual target and area-shape registries among the wider system configuration;
- `LICENSE.txt` - upstream MIT software license.

No Foundry packs, icons, tokens, fonts, templates, or SRD compendium content were copied. This is a schema-study
snapshot, not a runtime dependency. Any later adaptation must use Genesis names/provenance and perform a specific
license and attribution review.

## Deliberately not copied

- [`OpenXcom/OpenXcom`](https://github.com/OpenXcom/OpenXcom/tree/630130c5c9ac236b9e1d8496005fb23e84e397ca)
  at `630130c5c9ac236b9e1d8496005fb23e84e397ca`: GPL-3.0 C++ behavioral reference only.
- [`wesnoth/wesnoth`](https://github.com/wesnoth/wesnoth/tree/a9e55dce24af690eb8152b8c3842584f03d7fa33)
  at `a9e55dce24af690eb8152b8c3842584f03d7fa33`: GPL-2.0, multi-gigabyte C++ game repository; behavioral reference
  only.

Study their movement/action/visibility laws through upstream source and documentation when needed. Do not copy
their implementations into Genesis.

## Intended future use

When Wave 7 or an authorized implementation spec opens the exact-cell build, compare the Genesis-owned bounded
Dijkstra/A* approach against the archived EasyStar.js and rot.js behavior on the fixture corpus named in
`docs/PROCEDURAL-DUNGEON-DIRECTION.md` section 11.7. Library convenience may not override canonical `SpatialPlan`
topology, deterministic receipts, movement modes, elevation, footprints, occupancy, hazards, or action economy.
