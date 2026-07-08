/* dev/model-qa/rigs/quadruped.js — PILLAR 2: the parametric quadruped BASE-RIG.
   The anatomy from docs/ANATOMY-CANON.md is encoded here ONCE, correct by construction; a creature is
   a PARAMETER SET, not a re-authored mesh. Fix the hock math here -> every quadruped's hock fixes.

   Convention (matches probe-lib creatures): spine along +z (head at +z front), up +y, ground y=0.
   Correct-by-construction features this rig guarantees:
     - DIGITIGRADE hind leg = 4-segment Z-zigzag with the HOCK set HIGH (~0.37H) and BEHIND the stifle
       (canon's #1 failure fix). Front leg = near-vertical column. Hind-cocked vs front-straight contrast.
     - Deep chest + belly TUCK: torso rings hold a LEVEL back (top at H) while the underline drops at the
       chest (~0.46H) and tucks up behind the ribs (~0.66H) — the "wolf-not-sheep" read.
     - Legs seat INTO the body (top rings sit above the underline, inside the barrel) -> ships connected.
     - ONE tapering skull->muzzle wedge (kills "two loaves + a gumdrop"); efficient hex-tube limbs (no
       french-fry poly waste, no remesh). ~500-900 tris whole.
   Imported by export-obj.mjs (bake) + any probe. buildQuadruped(P) is the rig; WOLF is one param set. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildQuadruped(P){
  const H = P.H, C = P.col;                 // shoulder height; palette
  const seg = P.hindSeg ?? 6, fseg = P.frontSeg ?? 6;

  /* ---------- TORSO: rings ⊥ spine(+z). Level back (top=H), underline = station.belly (×H). ---------- */
  // each station: {z, hw(=x half-width), belly(=underline height as ×H), hex}
  const T = P.torso;                        // authored per-creature (proportions live here)
  const trings = T.map(s=>{
    const belly = s.belly*H, cy=(H*P.backY + belly)/2, ry=(H*P.backY - belly)/2;
    return ring(V(0, cy, s.z), V(0,0,1), s.hw, ry, 8, Math.PI/8);
  });
  stitch(trings, (b)=> T[b].hex);
  capFan(trings[0], V(0, (H*P.backY+T[0].belly*H)/2, T[0].z-0.03), T[0].hex, true);   // cap rump

  /* ---------- NECK + HEAD: topline CONTINUOUS — neck top rides at the back line (H·backY), never
     above it; the neck runs FORWARD-and-DOWN from the withers to a LOW-carried head. ---------- */
  const shTopZ = T[T.length-1].z;
  const backTop = H*P.backY;
  // neck base sits so its TOP edge = backTop (center = backTop - neckR); tapers down-forward to the head base
  tube(V(0, backTop - P.neckR, shTopZ), V(0, P.head[0].y*H, P.head[0].z-0.02), P.neckR, P.neckR*0.72, 8, C.ruff, {phase:Math.PI/8});
  {
    // head bands along +z — carried LOW (crown at/below backTop), muzzle projecting forward-down
    const hb = P.head;   // [{z, y(×H), rx, rz, hex}]
    const hr = hb.map(b=> ring(V(0, b.y*H, b.z), V(0,0,1), b.rx, b.rz, 8, Math.PI/8));
    stitch(hr, (b)=> hb[b].hex);
    capFan(hr[hr.length-1], V(0, hb[hb.length-1].y*H-0.005, hb[hb.length-1].z+0.03), C.nose);   // nose
    // dark mouth line (a thin quad under the muzzle) — reads as a closed snarl, NOT a gape
    const m=P.mouth; quad(V(-m.w,m.y*H,m.z0), V(m.w,m.y*H,m.z0), V(m.w*0.6,m.y*H-0.012,m.z1), V(-m.w*0.6,m.y*H-0.012,m.z1), C.mouth, 0.02);
    // ears: real triangular PYRAMIDS seated on the SKULL CROWN (skull top = band0 center + its rz),
    // wide-set, tips poking up-and-back. 3 side faces each so they read from front/side/3q.
    const crownY = hb[0].y*H + hb[0].rz - 0.008, ez = hb[0].z - 0.01;
    for(const sx of [-1,1]){
      const cx = sx*P.earX;
      const a = V(cx - P.earW, crownY, ez - P.earD);           // base: back-outer
      const b = V(cx + P.earW, crownY, ez + P.earD*0.5);       // base: front-inner
      const c = V(cx, crownY, ez + P.earD);                    // base: front point
      const apex = V(cx + sx*0.012, crownY + P.earH, ez - P.earD*0.3);   // tip up + slightly out/back
      quad(a, b, apex, apex, C.ear, 0.03);
      quad(b, c, apex, apex, C.earIn, 0.03);
      quad(c, a, apex, apex, C.ear, 0.03);
    }
  }

  /* ---------- LEGS ---------- */
  // HIND (digitigrade Z): hip(in haunch) -> stifle(fwd,down) -> hock(HIGH, BEHIND) -> paw(cannon vertical)
  const legHind = (sx)=>{
    const hip   = V(sx*P.hipX,  H*0.90, P.hindZ+0.04);
    const stifle= V(sx*P.hipX,  H*0.55, P.hindZ+0.11);   // forward (+z) & down
    const hock  = V(sx*P.footXh,H*0.37, P.hindZ-0.03);   // HIGH & BACK (behind stifle)
    const paw   = V(sx*P.footXh,0.03,   P.hindZ+0.01);   // cannon near-vertical
    tube(hip, stifle, P.thighR, P.thighR*0.66, seg, C.coat);      // thick haunch
    tube(stifle, hock, P.shankR, P.shankR*0.82, seg, C.coatDk);   // tibia (the backward run)
    tube(hock, paw, P.shankR*0.82, P.pawR, seg, C.coatDk);        // cannon
    footBlock(paw, sx, C.claw);
  };
  // FRONT (columnar plumb line): shoulder -> elbow(tucked) -> carpus -> paw
  const legFront = (sx)=>{
    const sh  = V(sx*P.shX, H*0.88, P.frontZ);
    const elb = V(sx*P.shX, H*0.52, P.frontZ-0.01);
    const car = V(sx*P.shX, H*0.22, P.frontZ+0.005);
    const paw = V(sx*P.shX, 0.03,   P.frontZ+0.015);
    tube(sh, elb, P.uparmR, P.uparmR*0.74, fseg, C.coat);
    tube(elb, car, P.foreR, P.foreR*0.86, fseg, C.coatDk);
    tube(car, paw, P.foreR*0.86, P.pawR, fseg, C.coatDk);
    footBlock(paw, sx, C.claw);
  };
  function footBlock(paw, sx, hex){
    const y=paw.y, z=paw.z, x=paw.x, w=P.pawR*1.1;
    quad(V(x-w,y,z-w),V(x+w,y,z-w),V(x+w,y,z+w*1.6),V(x-w,y,z+w*1.6), hex, 0.02);       // sole
    quad(V(x-w,0.0,z+w*1.6),V(x+w,0.0,z+w*1.6),V(x+w,y,z+w*1.6),V(x-w,y,z+w*1.6), hex, 0.02); // toe front
  }
  for(const sx of [-1,1]){ legHind(sx); legFront(sx); }

  /* ---------- TAIL: base off the croup, low brush sweeping back-down ---------- */
  const t=P.tail;
  tube(V(0,H*t.y0,t.z0), V(0,H*t.y1,t.z1), t.r0, t.r1, 6, C.coatDk, {phase:Math.PI/6});
  tube(V(0,H*t.y1,t.z1), V(0,H*t.y2,t.z2), t.r1, t.r2, 6, C.coatDk, {phase:Math.PI/6});
}

/* ================= WOLF param set (one instance of the rig) ================= */
export const WOLF = {
  H:0.80, backY:1.0, neckEndY:0.90, neckR:0.12,
  hipX:0.10, footXh:0.115, shX:0.11, hindZ:-0.42, frontZ:0.20, headZ:0.60,
  thighR:0.088, shankR:0.056, uparmR:0.075, foreR:0.052, pawR:0.036,
  col:{ coat:0x8a8175, coatDk:0x6a6157, saddle:0x4b453c, belly:0xb0a693, ruff:0x9a9084,
        ear:0x6a6157, earIn:0x453d33, nose:0x2c2620, mouth:0x1a1512, claw:0x2c2620 },
  // torso: rump -> loin(TUCK) -> ribcage -> chest(DEEP) -> shoulder
  torso:[
    {z:-0.46, hw:0.195, belly:0.55, hex:0x8a8175},
    {z:-0.24, hw:0.180, belly:0.66, hex:0x4b453c},   // loin tuck + darker saddle band
    {z:-0.02, hw:0.205, belly:0.56, hex:0x4b453c},
    {z: 0.18, hw:0.215, belly:0.46, hex:0x8a8175},    // deep chest
    {z: 0.30, hw:0.180, belly:0.52, hex:0x8a8175},
  ],
  // head wedge: skull -> brow -> muzzle mid -> nose (continuous taper, slight droop)
  // head carried LOW (crown below the back line), blunt muzzle projecting forward-down
  head:[
    {z:0.50, y:0.820, rx:0.120, rz:0.115, hex:0x8a8175},
    {z:0.57, y:0.790, rx:0.105, rz:0.098, hex:0x8a8175},
    {z:0.635,y:0.755, rx:0.072, rz:0.062, hex:0x6a6157},
    {z:0.70, y:0.725, rx:0.048, rz:0.042, hex:0x6a6157},
  ],
  mouth:{ w:0.034, y:0.710, z0:0.60, z1:0.70 },
  earX:0.055, earW:0.035, earD:0.050, earH:0.100,
  // brush tail: off the croup, HANGS down-and-back (mass below the body, not a mid-height paddle)
  tail:{ y0:0.78, z0:-0.45, y1:0.45, z1:-0.52, y2:0.15, z2:-0.57, r0:0.050, r1:0.044, r2:0.018 },
};

export function buildWolfRig(){ buildQuadruped(WOLF); }
