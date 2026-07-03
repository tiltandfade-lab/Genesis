# vendor/three — pinned three.js (BATTLE-THEATER T1)

**Version:** `three@0.166.0` (r166)
**Source:** unpkg CDN, downloaded 2026-07-03
  - `three.module.js` ← `https://unpkg.com/three@0.166.0/build/three.module.js` (1,292,872 bytes)
  - `LICENSE` ← `https://unpkg.com/three@0.166.0/LICENSE` (1,081 bytes)
**License:** MIT (Copyright © 2010-2024 three.js authors) — see `LICENSE` in this folder.

Vendored (not npm-installed) per docs/BATTLE-THEATER.md §2 — "three.js vendored at
`vendor/three/`, version pinned, committed — the offline/no-CDN law." Loaded via an
importmap (`"three": "vendor/three/three.module.js"`) from the one ES-module boundary
file, `src/ui/theater-boot.js`. No other files are vendored here yet — GLTFLoader (and
any `examples/jsm/` addons) are T2's job (BATTLE-THEATER.md §7, gated on the model-pack
download pre-step).

Do not hand-edit `three.module.js`. To bump the pin: re-run the same two `curl -L`
commands against a new version tag, verify the `REVISION` constant near the top of the
file matches, and update this README's version/date/byte-counts.
