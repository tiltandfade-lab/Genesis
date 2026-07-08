# vendor/three — pinned three.js (BATTLE-THEATER T1 + T2)

**Version:** `three@0.166.0` (r166)
**Source:** unpkg CDN, downloaded 2026-07-03 (core) / 2026-07-08 (addons)
  - `three.module.js` ← `https://unpkg.com/three@0.166.0/build/three.module.js` (1,292,872 bytes)
  - `LICENSE` ← `https://unpkg.com/three@0.166.0/LICENSE` (1,081 bytes)
  - `addons/loaders/GLTFLoader.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/loaders/GLTFLoader.js` (110,043 bytes)
  - `addons/utils/BufferGeometryUtils.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/utils/BufferGeometryUtils.js` (31,768 bytes)
**License:** MIT (Copyright © 2010-2024 three.js authors) — see `LICENSE` in this folder.

Vendored (not npm-installed) per docs/BATTLE-THEATER.md §2 — "three.js vendored at
`vendor/three/`, version pinned, committed — the offline/no-CDN law." Loaded via an
importmap from the one ES-module boundary file, `src/ui/theater-boot.js`:
  - `"three": "./vendor/three/three.module.js"` (the core build)
  - `"three/addons/": "./vendor/three/addons/"` (the conventional three.js addon prefix)

**T2 — the GLTFLoader / .glb model-loading seam** (BATTLE-THEATER.md §7). `GLTFLoader.js`
loads Blender-authored `.glb` models in-engine ALONGSIDE the hand-authored probe-lib JS
figures (see `src/ui/theater-figures.js`'s `glb`-shaped registry entries + `figureFor`'s
glb branch in `theater-boot.js`). Its full import graph is vendored and offline-resolvable:
`GLTFLoader.js` imports only `three` (the core build above) and its one transitive dep,
`../utils/BufferGeometryUtils.js` (which itself imports only `three`) — no other bare
specifiers, no `fflate`/DRACO/meshopt (those ride only with the compressed loaders, which
are NOT vendored). Compressed/Draco/KTX2 `.glb` variants are therefore unsupported until
their loaders are vendored too; the seam targets uncompressed `.glb` (the Blender default).

Do not hand-edit any vendored `.js`. To bump the pin: re-run the same `curl -L` commands
against a new version tag (core + both addons together — addons must match the core
`REVISION`), verify the `REVISION` constant near the top of `three.module.js` matches, and
update this README's version/date/byte-counts.
