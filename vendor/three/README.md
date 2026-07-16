# vendor/three — pinned three.js (BATTLE-THEATER T1 + T2 + T3)

**Version:** `three@0.166.0` (r166)
**Source:** unpkg CDN, downloaded 2026-07-03 (core) / 2026-07-08 (addons) / 2026-07-11 (postprocessing) / 2026-07-16 (TransformControls)
  - `three.module.js` ← `https://unpkg.com/three@0.166.0/build/three.module.js` (1,292,872 bytes)
  - `LICENSE` ← `https://unpkg.com/three@0.166.0/LICENSE` (1,081 bytes)
  - `addons/loaders/GLTFLoader.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/loaders/GLTFLoader.js` (110,043 bytes)
  - `addons/utils/BufferGeometryUtils.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/utils/BufferGeometryUtils.js` (31,768 bytes)
  - `addons/controls/TransformControls.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/controls/TransformControls.js` (40,731 bytes)
  - `addons/postprocessing/EffectComposer.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/postprocessing/EffectComposer.js` (4,651 bytes)
  - `addons/postprocessing/Pass.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/postprocessing/Pass.js` (1,706 bytes)
  - `addons/postprocessing/RenderPass.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/postprocessing/RenderPass.js` (1,941 bytes)
  - `addons/postprocessing/ShaderPass.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/postprocessing/ShaderPass.js` (1,576 bytes)
  - `addons/postprocessing/MaskPass.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/postprocessing/MaskPass.js` (2,231 bytes)
  - `addons/shaders/CopyShader.js` ← `https://unpkg.com/three@0.166.0/examples/jsm/shaders/CopyShader.js` (571 bytes)
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

**T3 — the composer seam** (BEAUTY-WAVE-3 BW3-0, docs/BEAUTY-WAVE-3.md). `EffectComposer.js` +
`RenderPass.js` + `ShaderPass.js` wire a postprocessing chain behind `GS.postChainEnabled`
(default ON, empty chain) at the `src/ui/theater-boot.js` render call site — BW3-2/3/6 will
mount DoF/bloom/grade passes onto this seam later via the exposed `Theater.addPass`/
`removePass`. Full import graph vendored and offline-resolvable: `EffectComposer.js` imports
only `three` + `./ShaderPass.js` + `./MaskPass.js` + `../shaders/CopyShader.js`; `ShaderPass.js`
and `RenderPass.js` and `MaskPass.js` each import only `three` + `./Pass.js`; `Pass.js` and
`CopyShader.js` import only `three` (or nothing). No other bare specifiers — no
`UnrealBloomPass`/`BokehPass`/`OutputPass` (those ride in with their own BW3 units when built).
When the composer has zero passes, the render call site falls back to direct
`renderer.render(scene, camera)` (EffectComposer.render() is a no-op with an empty `passes`
array — it would NOT clear/redraw the screen on its own, so the direct-render fallback is
load-bearing, not cosmetic).

Do not hand-edit any vendored `.js`. To bump the pin: re-run the same `curl -L` commands
against a new version tag (core + all addons together — addons must match the core
`REVISION`), verify the `REVISION` constant near the top of `three.module.js` matches, and
update this README's version/date/byte-counts.
