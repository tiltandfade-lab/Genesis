# MATERIAL-IDENTITY — per-realm surface feel via normal maps

type: system-spec
status: SPECCED-WITH-SPIKE (Opus 4.8, 2026-07-11 — from Adam: "is there bump mapping in three.js? if
so is it cheap or expensive?" + the standing re-shoot finding that realms read the same because
identity comes from LIGHT COLOR, not material. Answer: yes, and it's cheap — per-fragment normal
perturbation, no added geometry. This spec adds per-realm normal maps to the interior surfaces so each
realm's stone/metal/tile reads distinct. Grounded, but gated behind a SPIKE — see §0.)

## The goal
Strip the torch color and every realm's dungeon reads as the same grey stone. A normal map (tangent-
space RGB perturbing the surface normal per fragment) makes chrome read as brushed panel, gloom as
pitted crypt stone, fantasy as cut ashlar — for near-zero GPU cost (one texture fetch + a few ALU ops
per fragment; NOT geometry). This is the cheapest lever for realm material identity.

## §0 — THE SPIKE (do this FIRST; it decides the build path)
The interior floor/wall surfaces are `MeshLambertMaterial` (theater-boot.js:2766 and the interior tile
build). Historically Lambert did NOT support `normalMap`; modern three.js (≈r125+) added it. The
bundled three is `./vendor/three/three.module.js` (genesis.html importmap). **First confirm** whether
this build's `MeshLambertMaterial` honors `normalMap`:
- Grep the vendored three for `normalMap` support on Lambert (or the `REVISION` constant), OR write a
  2-minute real-Chrome probe: mount a Lambert material with a known normalMap and assert the lit
  result differs from the flat one.
- **If Lambert supports normalMap** → attach per-realm normal maps to the existing interior Lambert
  materials (cheapest, no material swap).
- **If it does NOT** → switch ONLY the interior floor/wall surfaces to `MeshPhongMaterial` (supports
  normalMap, still cheap; keep shininess low so it doesn't read glossy) — do NOT switch figures/sprites.
Record which branch you took in the report. Everything below assumes the chosen material honors normalMap.

## Where the normal maps come from (decision)
The interior surface albedo is already generated per realm by the BW2-3 material-texel system
(`interiorMaterialTexture` in theater-boot.js; the texel recipes in theater-materials.js; per-realm
folded textures — grep `REALM_TEXTURES`/`foldTexture`/`interiorMaterialTexture`). Two options:
- **(A) Derive a normal map from the existing albedo/height** — a Sobel height→normal pass over the
  same generated texel canvas (the recipes already encode grout/brick/panel structure as luminance).
  Cheapest to author, guaranteed per-realm coherent, no new art. PREFERRED.
- **(B) Author per-realm normal textures** — more control, but new assets + a generation round.
Default to **(A)**: extend the material-texel builder to also emit a normal map (Sobel on the texel
height) and bind it as `material.normalMap` with a per-realm `normalScale` (a named constant, dial-able).

## Units
- **MI-1 — SPIKE + wire (one unit):** do §0; then extend `interiorMaterialTexture`/the texel builder to
  emit a derived normal map (option A) and bind it on the interior floor + wall materials with a
  per-realm `normalScale`. Gate behind a flag (`ITR_NORMAL_MAPS_ENABLED`, default ON but one-line
  reversible) so Adam can A/B. Keep it to the interior surfaces (floor, wall, doorframe) — NOT figures,
  NOT sprites, NOT dressing (this pass is about the room shell).

## Scope / cost guardrails
- Normal maps ONLY on interior shell surfaces. No displacement maps (those DO cost geometry). No
  parallax. `normalScale` modest — this is surface *feel*, not relief; if it reads as a motion/noise
  artifact it's too strong (mirror the SMALL-IS-CORRECT discipline from BW4).
- One extra texture per realm surface (the derived normal), cached like the albedo. Assert draw-call
  count and texture count don't regress beyond +1/surface-kind.

## Verify — `dev/verify-material-identity.mjs` (real Chrome + THREE)
- §0 spike result recorded (which material branch).
- ⊗ RED-FIRST: with normal maps OFF (flag), a flat-lit interior wall's shaded normal is uniform across
  the face; ON, the per-fragment normal varies (sample the lit luminance variance across a wall face —
  prove it's ~flat at base, textured when on). The point: the surface now catches the diegetic light
  with relief.
- Two different realms' walls produce DIFFERENT normal-derived shading (chrome vs gloom variance/pattern
  differ) — the identity claim.
- fps ≥30 with normal maps on; texture/draw-call count within the +1/kind guardrail.
- Regression: verify-theater-materials / verify-dungeon-interior 287/0 / verify-theater-lighting 21/0
  (the light rig must still read correctly with perturbed normals). check-manifest OK.
- A re-shoot of 2-3 realms (gloom/chrome/fantasy) capture, READ by the orchestrator — the surfaces must
  read distinct without reading noisy.

## Out of scope
Figures/sprites/dressing normal maps; displacement/parallax; roughness/metalness PBR (that's a bigger
material-model change — MeshStandardMaterial + a full PBR pass, deferred); the non-core realms.

## Order + vehicles
One unit (MI-1), one executor, AFTER the LIGHT-SIGHT-POLISH lighting dials land (so the normal-map
look is judged against the corrected lighting, not the blown-out one). Re-shoot for Adam's eye.
