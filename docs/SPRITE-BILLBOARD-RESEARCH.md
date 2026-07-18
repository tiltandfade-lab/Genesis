# Sprite Billboarding & Proportions — Research Brief

**Date:** 2026-07-16
**Type:** research
**Scope:** Benchmark Genesis's existing standee/billboard system against current best practice for
rendering flat 2D sprites in a Three.js scene under an elevated orthographic (HD-2D) camera.
**Method:** 5-angle fan-out web research (billboarding methods, ortho-camera squash, proportions/sizing,
filtering/alpha, HD-2D lit-sprite integration), sources cited inline. Claims flagged where they are
inferred/derived rather than directly attested.

---

## TL;DR verdict on the six current choices

| # | Current Genesis choice | Verdict |
|---|---|---|
| 1 | Y-axis-only billboard, per-frame `rotation.y`, manual `PlaneGeometry` (not `THREE.Sprite`) | **Validated** |
| 2 | Camera-pitch **tilt-back** on inner wrapper to kill vertical squash | **Validated (non-textbook; note the tradeoff)** |
| 3 | True-scale `w = h * (img.width/img.height)`, SRD size ladder, feet at `y = h/2` | **Validated — one real gap: trimmed atlases** |
| 4 | `magFilter=Nearest`, `minFilter=Linear`, `generateMipmaps=false` | **Validated for the art direction (one dated rationale)** |
| 5 | `alphaTest 0.5` cutout, `DoubleSide`, alpha-tested `customDepthMaterial`, cast-not-receive | **Validated — two optional hardening moves** |
| 6 | HD-2D lit sprites: `MeshLambert` + `emissiveMap` readability floor | **Validated — Genesis is ahead of the documented curve; one enhancement** |

Concrete gaps worth acting on, in priority order:
1. **Edge-bleed / premultiplied alpha on the sprite PNGs** — Linear min-filtering *will* bleed the RGB of
   fully-transparent texels into the silhouette, producing dark/white halos, unless the transparent
   regions carry solidified edge color. This is the most likely source of "off" looking sprites.
2. **Trimmed-atlas footprint/anchor** — if any sprite art is auto-trimmed/packed, deriving aspect from
   `tex.image.width/height` mis-sizes and mis-anchors it. Full-frame untrimmed PNGs are safe.
3. **Optional:** `alphaToCoverage` (with MSAA) to anti-alias the hard cutout edges; normal maps for
   per-pixel form lighting instead of the flat-slab Lambert response.

---

## 1. Billboarding method — axial vs spherical vs Sprite vs shader

**Genesis:** Y-axis-only (cylindrical/axial) billboard on a manual `PlaneGeometry`, `rotation.y` set to
the camera yaw each dirty render. **Verdict: validated.**

- Cylindrical (Y-only) billboarding is the explicitly recommended choice for ground-standing sprites in a
  3D world — "trees, bushes, rocks, or distant NPCs" — precisely because it avoids the tilt/stretch that
  spherical billboards suffer at high or low camera angles.
  ([gamedev.net](https://www.gamedev.net/forums/topic/646643-spherical-and-cylindrical-billboarding/))
- Spherical / full camera-facing (what `THREE.Sprite` does) makes grounded characters visibly lean and
  "reveal them as flat 3D surfaces" / detach from the floor as they near the camera edges — the reason
  practitioners lock the vertical axis for anything standing on the ground.
  ([gamedevbeginner.com](https://gamedevbeginner.com/billboards-in-unity-and-how-to-make-your-own/))
- `THREE.Sprite` is spherical-only by design and cannot be axis-constrained "without changing the
  implementation of THREE.Sprite"; a three.js core maintainer says outright "a sprite is just a special
  type of a plane mesh." It also **cannot cast shadows** and **cannot be instanced**. All three are
  reasons to prefer a manual plane for characters — exactly Genesis's call.
  ([three.js docs — Sprite](https://threejs.org/docs/pages/Sprite.html);
  [discourse: Sprite facing camera always](https://discourse.threejs.org/t/sprite-facing-camera-always/42788);
  [discourse: Sprite vs Mesh for orthographic camera](https://discourse.threejs.org/t/sprite-vs-mesh-for-orthographic-camera-and-without-lighting/87517))
- Per-frame CPU `rotation.y` is a standard, unremarkable pattern at the scale Genesis runs (tens to low
  hundreds of on-stage figures). Shader/`InstancedMesh` billboarding only becomes necessary at
  thousands-to-millions of instances (foliage/crowds), where a JS per-instance loop is infeasible and the
  rotation must move into the vertex shader.
  ([discourse: billboard vertex shader for InstancedMesh](https://discourse.threejs.org/t/lookat-billboard-vertex-shader-for-instancedmesh-instances/86227);
  [discourse: InstancedMesh + implement billboard](https://discourse.threejs.org/t/instancedmesh-implement-billboard/29354))
  - No source gives a hard instance-count threshold; treat "tens–low hundreds = fine on CPU" as the
    supported range, not a precise cliff.

**Micro-optimization (inferred, not load-bearing):** with a *fixed* ortho camera the view direction is
constant, so a direction-based cylindrical billboard's yaw only changes when the camera itself rotates
(`rotationStep` flips), not every frame. Genesis already only stamps yaw on dirty renders, so it isn't
burning cycles — but the yaw is genuinely invariant between camera rotations, so there's no correctness
reason to ever recompute it more often than that.
([three.js manual — billboards, direction vs position billboards](https://threejs.org/manual/en/billboards.html))

---

## 2. The elevated-ortho "squash," and the tilt-back fix

**Genesis:** tilts each sprite back by the camera elevation angle on an inner wrapper (`standeeWrap`),
keeping the feet anchored at the outer group origin so the base stays floor-flat. **Verdict: validated,
but it is a considered engineering choice rather than a textbook-named technique — know the tradeoff.**

- The geometry: an upright Y-billboard's normal is horizontal; when the camera pitches down by θ, the
  quad is no longer perpendicular to the view and its projected **height scales by cos(θ)** — it reads as
  vertically compressed ("razor-thin from above"), worse with steeper pitch.
  ([Godot forum](https://godotforums.org/d/41420-billboarding-with-sprite-3d-with-a-current-camera);
  [tw0catsgames HD-2D billboard dev log](https://tw0catsgames.com/update/2023/11/06/perfecting-unitys_billboard_shader_for_hd2d_01.html))
- The literature splits into two documented camps for **characters**:
  - **Keep upright, accept some foreshortening, limit the camera range.** This is what shipped HD-2D
    actually does. Octopath Traveler II's team describes pushing "how far we could rotate the camera
    without compromising graphical fidelity … nearly 90 degrees in some battle effects" — i.e. they
    *manage* the distortion by constraining the camera, they don't fully solve it.
    ([Unreal Engine dev interview](https://www.unrealengine.com/en-US/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style))
  - **Go full spherical, accept leaning/floating feet.** An HD-2D-inspired indie (tw0catsgames) rewrote
    the billboard shader to make characters fully camera-facing to beat the razor-thin problem — and
    accepted the feet-detachment tradeoff. ([tw0catsgames](https://tw0catsgames.com/update/2023/11/06/perfecting-unitys_billboard_shader_for_hd2d_01.html))
- **No source recommends the exact "tilt the rigid quad back by θ for a grounded character" pattern** —
  it appears in the wild mainly for sky/sun/flare billboards
  ([Petrolution / Alamo engine](https://modtools.petrolution.net/articles/Understanding_Billboarding)).
  Genesis's version is genuinely a hybrid the sources don't name: **yaw on the outer group (base stays
  flat) + pitch-tilt on the inner wrapper (art faces the view plane, zero art distortion) + feet pinned
  at the origin.** It captures the upside of full spherical (no squash) while defeating its documented
  downside (floating/leaning base). That's arguably *more* refined than either documented camp.
- **The tradeoff to keep in view:** tilting the quad back means its top edge physically leans *away* from
  the camera in world space. For a tall sprite this can (a) poke the top through a wall standing directly
  behind it, and (b) shift where its cast shadow lands. If either ever bites, the alternative is:
  - **Fix B — vertical scale by `1/cos(θ)`** (keep the quad upright, stretch its height to cancel the
    compression). Feet stay planted and the quad stays in its own vertical plane (better for wall
    proximity and cast-shadow direction), at the cost of mildly stretching the pixel art. No direct
    precedent found — this is the mathematical complement of the squash, flagged as a derived option, not
    an attested one. A cautionary note from a Unity dev: per-*vertex* angle-based scaling distorts large
    quads; do it as a uniform per-sprite `scale.y`, not in the vertex shader.
    ([Unity Discussions — scaling billboard by angle](https://discussions.unity.com/t/scaling-billboard-based-on-angle-to-camera/749702))

  Net: Genesis's tilt-back optimizes for **art fidelity** (the sprite is shown undistorted, perpendicular
  to view); Fix B optimizes for **spatial correctness** (sprite stays in its footprint plane). For an
  HD-2D diorama where the art is the point, tilt-back is the defensible default. The fixed camera also
  means Genesis never hits Square Enix's "how far can we rotate" problem at all.

---

## 3. Proportions & sizing

**Genesis:** `w = h * (img.width/img.height)`; `h = HUMAN_TRUE_HEIGHT * scaleTrue` (SRD size category);
feet at `mesh.position.y = h/2` on a center-origin plane. **Verdict: validated; one real gap.**

- Aspect-preserving `w = h * (texW/texH)` is the standard way to avoid stretch — three.js's own billboard
  example scales x and y proportionally from the texture's pixel dimensions, mathematically identical to
  fixing height and deriving width from the aspect ratio.
  ([three.js manual — billboards](https://threejs.org/manual/en/billboards.html);
  [discourse: inconsistent sprite scaling](https://discourse.threejs.org/t/inconsistent-sprite-scaling/33327))
- Anchoring height on a **real-world reference** ("a Medium human is N units tall," then scale categories
  off it) is exactly how engines derive a consistent pixels-per-unit and keep differently-sized sprites
  in proportion — Genesis's `HUMAN_TRUE_HEIGHT × SRD-size-scale` ladder is the textbook approach, and
  gives the correct "a Gargantuan sprite dwarfs a Medium one."
  ([Unity Discussions — pixels per unit](https://discussions.unity.com/t/pixels-per-unit-main-character-sprite-dimensions-74x36/867994))
- Feet-on-floor via `position.y = h/2` for a center-origin `PlaneGeometry` is the standard offset (bottom
  edge lands at y=0). three.js's own character example stacks geometry with the same `y = height/2`
  convention. ([three.js manual — billboards](https://threejs.org/manual/en/billboards.html);
  [three.js docs — Sprite.center for bottom-center pivot](https://threejs.org/docs/pages/Sprite.html))
- **THE GAP — trimmed atlases.** The aspect formula is only correct when the texture's visible content
  fills its frame. If sprite art is auto-**trimmed** (a packer crops transparent margins), the crop's raw
  pixel aspect no longer matches the character's true footprint, and `tex.image.width/height` will both
  mis-size and **mis-anchor** the sprite — every frame trims a different margin, so the "feet" drift. This
  is a documented real bug (PlayCanvas "bouncing mole"). The fix is to size/anchor from the atlas
  metadata — `sourceSize` (original untrimmed dims), `spriteSourceSize` (offset of the crop inside the
  original), and `pivot` (defined against `sourceSize`) — not from the trimmed bitmap.
  ([CodeAndWeb TexturePacker file formats](https://www.codeandweb.com/texturepacker/documentation/file-formats);
  [PlayCanvas forum — trimmed sprites & positioning](https://forum.playcanvas.com/t/texture-packer-trimmed-sprites-and-positioning/15024))
  - **Action:** confirm the Genesis sprite pipeline (see `SPRITE-SHEETS.md`) ships **full-frame untrimmed
    PNGs** per figure. If it does, no change. If it ever trims/packs, the aspect + `y=h/2` math needs to
    read the untrimmed `sourceSize`/`pivot`, or every trimmed figure will sit slightly wrong on its tile.

---

## 4. Texture filtering & alpha

**Genesis:** `magFilter=Nearest`, `minFilter=Linear`, `generateMipmaps=false`; `alphaTest 0.5`,
`DoubleSide`, dedicated alpha-tested `customDepthMaterial`, cast-not-receive. **Verdict: validated for the
crisp art direction; two optional hardening moves.**

- **Nearest-mag** keeps pixel art crisp when blown up (magFilter default is Linear, so the override is
  deliberate and correct). **Nearest-min** is what produces the "mode-7" minification shimmer — each
  screen pixel snaps to one texel and that texel changes abruptly as the sprite recedes. **Linear-min
  reduces** that shimmer by averaging 4 texels. So Genesis's switch to Linear-min was the right diagnosis
  and fix. ([three.js filters guide](https://salivity.github.io/three.js/article/three-js-texture-magnification-filters-guide);
  [gamedev.net — reducing shimmering](https://gamedev.net/forums/topic/655651-preparing-textures-to-reduce-shimmering/5147776/))
- **Caveat:** Linear-min *reduces* but does not *eliminate* shimmer at high minification ratios — mipmaps
  are "the standard solution" for that, at the cost of blurring pixel art (which is why Genesis avoids
  them). Note the rationale in the code ("NPOT-safe") is slightly dated: modern three.js defaults to a
  WebGL2 context (r118+), and **WebGL2 supports mipmaps on non-power-of-two textures** — so NPOT is no
  longer the reason mipmaps are off. The real reason is art direction (crispness), which still stands.
  ([MDN — using textures in WebGL, POT/NPOT rules](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL);
  [Khronos — NPOT texture](https://www.khronos.org/opengl/wiki/NPOT_Texture))
- **alphaTest cutout vs blend:** `alphaTest` keeps the sprite in the **opaque** render/depth path and
  sidesteps the transparency sort-order problem that plagues many overlapping blended planes — the
  correct call for a stage full of overlapping standees. `0.5` is the commonly-used threshold. The edge is
  hard/aliased (the tradeoff vs soft-but-sort-dependent blending).
  ([three.js issue #4724](https://github.com/mrdoob/three.js/issues/4724);
  [discourse — the transparent problem](https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553))
- **Cutout-shaped shadows:** an alpha-tested `customDepthMaterial` is exactly the documented way to make
  the shadow match the silhouette instead of a solid quad; `DoubleSide` (or `shadowSide`) is required or a
  plane won't cast at all. Genesis has both right.
  ([discourse — cast shadow from semi-transparent texture](https://discourse.threejs.org/t/cast-a-shadow-from-a-semi-transparent-texture/49818);
  [three.js docs — Material.alphaTest](https://threejs.org/docs/#api/en/materials/Material.alphaTest))

**Two optional hardening moves:**
- **Edge fringing (highest-value).** With Linear filtering active, the GPU bilinearly blends across the
  silhouette edge — and if the fully-transparent texels carry garbage/zeroed RGB (many PNG exporters zero
  it), you get dark or white halos on the sprite outline. Fix either by **edge-bleeding / "solidifying"**
  the transparent regions with the adjacent opaque color before export, or by using **premultiplied
  alpha** (transparent texels become pure black, so bleed is structurally harmless; also cleaner for any
  future mip chain). John Carmack's rule of thumb: the dark fringe comes from "the texture went to 0 0 0 0
  right at the outline, rather than just cutting it out in the alpha channel."
  ([Adrian Courrèges — beware of transparent pixels](https://www.adriancourreges.com/blog/2017/05/09/beware-of-transparent-pixels/);
  [three.js — WebGLRenderer.premultipliedAlpha](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.premultipliedAlpha))
  - Note: three.js `Texture.premultiplyAlpha` has **no effect on `ImageBitmap` sources** — premultiply at
    `createImageBitmap()` time if that loader path is used.
- **Anti-aliased cutout edges.** `material.alphaToCoverage = true` (only works when the renderer was
  created with `antialias: true` / MSAA) smooths `alphaTest`-clipped edges — turns the hard aliased
  silhouette into a clean one without going to sort-dependent blending. Cheap win if the aliased edges
  ever read as "stickery." ([three.js docs — Material.alphaToCoverage](https://threejs.org/docs/#api/en/materials/Material.alphaToCoverage);
  [three.js issue #12438](https://github.com/mrdoob/three.js/issues/12438))

---

## 5. HD-2D lit-sprite integration

**Genesis:** `MeshLambertMaterial` so sprites warm/brighten near torch PointLights, + `emissiveMap` at a
low floor so a dark-art creature never crushes to unreadable black. **Verdict: validated — Genesis is at
or ahead of the documented public state of the art here; one enhancement.**

- Shipped HD-2D treats sprites as "flat sheets of paper" that do **not** naturally light like the 3D
  environment; the fixes are per-scene "tricks," a point light added mainly so sprites **cast** shadows,
  and careful art/lighting matching — not full dynamic relighting of the sprite surface. So Genesis
  choosing to actually let the sprite *respond* to torch lights via Lambert is a legitimate, and somewhat
  more ambitious, integration than the shipped baseline.
  ([Octopath II Unreal interview](https://www.unrealengine.com/en-US/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style);
  [Wikipedia — HD-2D](https://en.wikipedia.org/wiki/HD-2D);
  [Triangle Strategy — accurate HD-2D](https://nintendoeverything.com/triangle-strategy-devs-on-how-the-game-uses-accurate-hd-2d/))
- The **emissive readability floor** (emissiveMap = the sprite's own texture at low intensity) is *not* a
  named/documented industry pattern — but it's mechanically sound: emissive is added on top of the
  Lambert result and is unaffected by light attenuation, so it's exactly the right lever to guarantee a
  minimum brightness in shadow. Genesis essentially derived a reasonable technique the literature doesn't
  name. ([three.js docs — MeshStandardMaterial.emissive](https://threejs.org/docs/#api/materials/MeshStandardMaterial.emissive))
- **The one real limitation:** a flat plane has a **single normal**, and because it billboards to face the
  camera, that normal stays roughly camera-aligned — so Lambert lights the sprite as a uniform slab, not
  as a figure with sculpted form (arms, folds, volume). It reads fine for tinting/brightness; it can't
  express directional form. The documented upgrade is a **normal map per sprite** — Unity's 2D lights
  support it natively, and tools like **SpriteIlluminator / Sprite Lamp** can auto-generate a normal map
  by inflating the alpha silhouette. Practitioners are explicit it's an "illusion of 3D," but for a
  torch-lit dungeon it's the difference between a lit slab and a figure that catches the light on one
  side. Whether it's worth the asset-pipeline cost at Genesis's sprite sizes is a judgment call — no
  source quantifies a size threshold.
  ([SpriteIlluminator](https://www.codeandweb.com/spriteilluminator);
  [Unity — secondary normal/mask textures for sprites](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@7.0/manual/SecondaryTextures.html))
- **Grounding shadows:** Genesis relies on the billboard's own cutout cast shadow. Shipped HD-2D-style
  work uses **both** a real cast shadow **and** a blob/decal shadow underneath, because a billboard's cast
  shadow goes razor-thin when the light or camera is near-overhead. Genesis's camera is fixed and not
  overhead, so this likely doesn't bite — but if a torch ever sits near-directly above a figure and its
  shadow vanishes, a small blob-shadow decal at the feet is the standard patch. (Also note: keeping
  `receiveShadow = off` on sprites is the correct call — a shadow smeared across a flat cutout reads as a
  bug, which Genesis's own code comments already recognize.)
  ([tw0catsgames — dual-shadow tradeoff](https://tw0catsgames.com/update/2023/11/06/perfecting-unitys_billboard_shader_for_hd2d_01.html);
  [gamedev.net — 2D sprite ground shadow / blob shadows](https://gamedev.net/forums/topic/550492-2d-sprite-ground-shadow/))

---

## 6. Performance (many sprites)

**Verdict: not a current concern; the escalation path is known.** Per-frame CPU billboard updates are
fine for tens-to-low-hundreds of figures. The scaling path, if a scene ever needs thousands (a big crowd
board), is: **texture atlas** (one draw call can serve visually distinct sprites) → **`InstancedMesh` +
billboard computed in the vertex shader** (read each instance's own matrix via an instanced buffer keyed
by `instanceIndex`; the naive `modelWorldMatrix` shader billboard only works when the camera is at the
origin). One caveat with instanced billboards: instances in a single draw call are hard to depth-interleave
with separate meshes, so transparency layering needs `renderer.clearDepth()` between passes or z-offsets.
None of this is needed at Genesis's current scale.
([discourse — billboard vertex shader for InstancedMesh](https://discourse.threejs.org/t/lookat-billboard-vertex-shader-for-instancedmesh-instances/86227);
[discourse — Sprite vs Mesh (atlas advice)](https://discourse.threejs.org/t/sprite-vs-mesh-for-orthographic-camera-and-without-lighting/87517);
[three.js manual — facade/impostor baking](https://threejs.org/manual/en/billboards.html))

---

## Source-confidence notes

- **Strongly corroborated (multiple independent sources):** cylindrical > spherical for grounded
  characters; `THREE.Sprite` limitations (no axis-lock / no instancing / no shadows); aspect-preserving
  sizing; trimmed-atlas `sourceSize`/`pivot` convention; alphaTest keeps sprites out of the transparency
  sort; alpha-tested `customDepthMaterial` for cutout shadows; premultiplied-alpha / edge-bleed for
  fringing; HD-2D "flat sheets of paper" framing (primary dev interview).
- **Single-source or derived (treat as directional):** the exact cos(θ) squash math and the `1/cos(θ)`
  Fix-B correction (geometrically sound, no direct character-sprite precedent); "tilt-back for a grounded
  character" is not a named technique in the literature (Genesis's hybrid is its own); the emissive
  readability floor is mechanically valid but not a documented named pattern; "three.js defaults to WebGL2
  since r118" came via aggregated search, not a primary changelog — verify if load-bearing.
- **Rejected/flagged:** the claim that shipped HD-2D sprites get full per-layer PBR relighting
  (aggregator source) is contradicted by the primary dev interview's "flat sheets of paper" framing —
  don't assume sprites dynamically relight in those titles. `THREE.Sprite` is a convenience wrapper, **not**
  a performance fast-path (a core-forum contributor states it's no faster than a camera-facing quad shader).
