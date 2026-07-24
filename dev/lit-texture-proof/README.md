# Lit Texture Normal-Layer A/B Proof

This proof uses the shipped Fantasy floor and wall albedos without modifying their pixels. Each
control/layered pair has the same plane geometry, UV repeat, camera, albedo, roughness, and light.
Only the layered material receives a companion tangent-space normal map.

Run:

```sh
GENESIS_OFFLINE_ART_TOOLS=/private/tmp/genesis-offline-art-tools \
  python3 dev/lit-texture-proof/generate-normal-companions.py
node dev/lit-texture-proof/capture-normal-layer-proof.mjs
node dev/lit-texture-proof/verify-normal-layer-proof.mjs
```

The capture script records the proof under light azimuths 45° and 135°. Their elevation and
front-facing component are equal while their horizontal tangent components oppose, so the control
panels keep comparable illumination while normal-driven highlights and shadows reverse. The
production albedo copy is verified byte-for-byte against its Git LFS object. Captures use a
restrained normal scale of 1.2.

This proves the channel-layering and rendering path. The automatically inferred luminance height
is intentionally a prototype and its contrast is reduced to 80% around midpoint to keep the relief
restrained. Production character sprites should use semantic height groups for body, armor, face,
weapon, and recessed detail rather than treating every painted highlight as geometry.
