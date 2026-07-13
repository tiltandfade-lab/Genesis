# Graphics research lab

This directory evaluates graphics-production candidates without adding them to Genesis's runtime.
All versions are exact-pinned in `toolchain.json`; the default install lives in disposable
`/private/tmp/genesis-graphics-research-tools`.

```sh
mkdir -p /private/tmp/genesis-graphics-research-tools
cd /private/tmp/genesis-graphics-research-tools
npm init -y
npm install --save-exact three@0.166.0 three-gpu-pathtracer@0.0.23 three-mesh-bvh@0.7.4 \
  xatlas-web@0.1.0 xatlas-three@0.2.1 stats-gl@4.2.3 potpack@2.1.0 \
  poisson-disk-sampling@2.3.1 three-wboit@1.0.15 sharp@0.35.3
cd /path/to/Genesis
node dev/graphics-research/verify-toolchain.mjs
node dev/graphics-research/verify-layout-probes.mjs
```

Set `GRAPHICS_RESEARCH_HOME` to use another scratch install. Never add these packages to the
production import map until the corresponding gate in `docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md`
has passed and a separate implementation unit is approved.
