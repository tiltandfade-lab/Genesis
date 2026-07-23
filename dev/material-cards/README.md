# Guard Post material-card harness

`guard-post-material-cards.html` interprets the compiled Material Maker channels the same way the
production three.js renderer does:

- `MeshStandardMaterial`
- albedo in `SRGBColorSpace`, kept crisp with nearest filtering
- tangent-space normal and ORM in linear space
- ORM red = AO, green = roughness, blue = metalness
- AO intensity `0.82`, candidate-bounded normal scale, AgX tone mapping
- neutral-warm key, cool opposing practical, ambient intensity `0.18`
- fixed gameplay camera at 45° yaw, 35° elevation, and 20° FOV

Each card includes the raw 1× albedo, a 3×3 seam/repetition view, normal, ORM, a lit wall slab, the
same wall in the fixed gameplay camera with the canonical Goblin Warrior standee, and a neutral-clay
geometry control. `capture-guard-post-material-cards.mjs` runs the page in real system Chrome with
three.js r166 and emits both full-size and 1400 px app-width sheets plus one card per candidate.
