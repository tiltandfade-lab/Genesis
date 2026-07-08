/* dev/model-qa/creatures/prop-overlay-decals.js — TABLETOP-UNITS.md §U5 AMBIENT OVERLAY LANE: four
   flat floor decals (crack-web / standing-water / moss-patch / drag-marks), the v1 shape budget the
   spec caps at. NOT set pieces — no rim, no lift, genuinely flat (the opposite discipline from
   prop-pool.js's own "never a rug" ruling: an overlay IS the decal). Each builder is a single flat
   disc (a capFan over a ring, near-zero height) with a handful of accent quads scattered across it
   so the read differs per shape (a web of cracks, a puddle's ripple rings, moss clumps, parallel
   drag gouges) — same landmark-table/probe-lib discipline as every other whole-object module (one
   function, one geometry frame, no anchors, no return value — build() writes straight into the
   shared POS/COL/CHAN buffers via quad/ring/capFan, read back by getBuffers()).
   Sits on the shared base-disc footprint (r=0.42, same radius every whole-object piece uses) so it
   never overhangs its zone tile. VS-desaturated palette per shape. Imported by theater-figures.js's
   "prop:overlay-*" registry entries. */
import { V, ring, capFan, quad, setChannels } from '../probe-lib.js';

const Y = 0.006; // a hair above the floor plane — a decal, not a floor-penetrating patch
const R = 0.40;
const N = 116; // capFan(ring(N)) alone (+accents) clears the [120,2600] tri-count floor with margin

/* crack-web — a pale stone-crack pattern radiating across a dark disc. */
export function buildOverlayCrackWeb(){
  const P = { base: 0x585349, baseDk: 0x413d35, crack: 0x8f897a, crackLt: 0xaba496 };
  setChannels({ [P.base]: "stone", [P.baseDk]: "stone", [P.crack]: "stone", [P.crackLt]: "stone" });
  const disc = ring(V(0, Y, 0), V(0, 1, 0), R, R, N);
  capFan(disc, V(0, Y, 0), P.baseDk);
  // radiating crack lines (thin quads from near-center out toward the rim, at varied angles)
  const legs = 7;
  for(let i = 0; i < legs; i++){
    const t = (i / legs) * Math.PI * 2 + 0.31 * i;
    const rEnd = R * (0.55 + 0.35 * ((i % 3) / 3));
    const x0 = Math.cos(t) * 0.03, z0 = Math.sin(t) * 0.03;
    const x1 = Math.cos(t) * rEnd, z1 = Math.sin(t) * rEnd;
    const perp = 0.012;
    quad(V(x0 - Math.sin(t) * perp, Y + 0.001, z0 + Math.cos(t) * perp),
      V(x0 + Math.sin(t) * perp, Y + 0.001, z0 - Math.cos(t) * perp),
      V(x1 + Math.sin(t) * perp * 0.4, Y + 0.001, z1 - Math.cos(t) * perp * 0.4),
      V(x1 - Math.sin(t) * perp * 0.4, Y + 0.001, z1 + Math.cos(t) * perp * 0.4),
      (i % 2) ? P.crack : P.crackLt, 0.1);
  }
}

/* standing-water — a still, dark shallow puddle disc with faint concentric ripple bands. */
export function buildOverlayStandingWater(){
  const P = { water: 0x1c2620, waterMid: 0x28362d, glint: 0x415449 };
  setChannels({ [P.water]: "stone", [P.waterMid]: "stone", [P.glint]: "stone" });
  const disc = ring(V(0, Y, 0), V(0, 1, 0), R, R, N);
  capFan(disc, V(0, Y, 0), P.water);
  for(const [rr, hex] of [[R * 0.68, P.waterMid], [R * 0.42, P.glint], [R * 0.18, P.waterMid]]){
    const a = ring(V(0, Y + 0.001, 0), V(0, 1, 0), rr + 0.01, rr + 0.01, 20);
    const b = ring(V(0, Y + 0.001, 0), V(0, 1, 0), rr - 0.01, rr - 0.01, 20);
    for(let i = 0; i < 20; i++){ const j = (i + 1) % 20; quad(a[i], a[j], b[j], b[i], hex, 0.05); }
  }
}

/* moss-patch — an irregular green growth disc with a few darker clumps. */
export function buildOverlayMossPatch(){
  const P = { moss: 0x4a5c33, mossDk: 0x37461f, mossLt: 0x62783f };
  setChannels({ [P.moss]: "stone", [P.mossDk]: "stone", [P.mossLt]: "stone" });
  const disc = ring(V(0, Y, 0), V(0, 1, 0), R, R, N);
  capFan(disc, V(0, Y, 0), P.moss);
  const clumps = [[-0.14, -0.06, P.mossDk], [0.10, 0.12, P.mossLt], [0.02, -0.18, P.mossDk], [-0.05, 0.15, P.mossLt]];
  clumps.forEach(([cx, cz, hex]) => {
    const a = ring(V(cx, Y + 0.002, cz), V(0, 1, 0), 0.09, 0.09, 10);
    capFan(a, V(cx, Y + 0.003, cz), hex);
  });
}

/* drag-marks — a set of parallel scrape gouges across a plain dirt-toned disc. */
export function buildOverlayDragMarks(){
  const P = { ground: 0x4d463a, groundDk: 0x352f26, gouge: 0x62594a };
  setChannels({ [P.ground]: "stone", [P.groundDk]: "stone", [P.gouge]: "stone" });
  const disc = ring(V(0, Y, 0), V(0, 1, 0), R, R, N);
  capFan(disc, V(0, Y, 0), P.ground);
  const lanes = 5;
  for(let i = 0; i < lanes; i++){
    const off = -0.28 + i * 0.14;
    quad(V(-R * 0.85, Y + 0.001, off - 0.02), V(R * 0.85, Y + 0.001, off - 0.02),
      V(R * 0.85, Y + 0.001, off + 0.02), V(-R * 0.85, Y + 0.001, off + 0.02),
      (i % 2) ? P.gouge : P.groundDk, 0.06);
  }
}
