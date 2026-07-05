/* dev/model-qa/creatures/rlm-ascended-splice-cultist.js — ASCENDED SPLICE CULTIST (chrome,
   Medium humanoid/construct-hybrid, CR 10). Read: a cult convert far along the splice-rite —
   more chrome/graft machine than flesh now, a robed torso opening onto a fused mechanical ribcage,
   one whole arm replaced by a fused weapon-limb, a halo-ring of small floating splice-relic shards
   orbiting the head (the "ascended" visual signature), a bowed reverent posture. Chrome register:
   ritual-gold-trimmed chrome over dark cult robes — warmer accent than the ganger factions, this
   is a worship-cult not a gang. NO eye quads — a glowing ritual brand seared across the brow
   instead. Whole-object grammar: one function, one frame, no anchors. Medium size, base disc
   r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAscendedSpliceCultist(){
  const P = {
    robe:0x2c2420, robeDk:0x181410, robeLt:0x453a30,
    skin:0x8a6a4c, skinDk:0x5c4530,
    graft:0x565d60, graftDk:0x2e3336, graftLt:0x767d80,
    gold:0xc9a24a, goldDk:0x8a6d2c,
    brand:0xff8a3a, brandDk:0x8a3f14,
    relic:0x6fe0d8, relicDk:0x1c5a68,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0, 0.80, 0.02),
    chest: V(0, 1.02, -0.02),
    neck:  V(0, 1.16, -0.06),   // bowed forward — reverent posture
    headB: V(0, 1.18, -0.06),
    headT: V(0, 1.37, -0.10),
  };

  /* torso — robed lower half, fused mechanical ribcage exposed at the chest */
  tube(S.hip, S.waist, 0.175, 0.165, 8, P.robe, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.165, 0.205, 8, P.robeDk, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.205, 0.095, 8, P.graft, {phase:Math.PI/8, capB:{hex:P.graftDk, lift:0.01}});
  /* the open robe reveals a fused chrome ribcage — vertical rib-struts over dark cavity */
  quad(V(-0.15,0.92,0.16), V(0.15,0.92,0.16), V(0.12,1.13,0.14), V(-0.12,1.13,0.14), P.robeDk, 0.05);
  for(let i=-2;i<=2;i++){
    const x = i*0.05;
    quad(V(x-0.012,0.96,0.17), V(x+0.012,0.96,0.17), V(x+0.010,1.10,0.15), V(x-0.010,1.10,0.15), P.graftLt, 0.05);
  }
  /* gold ritual trim along the robe collar and hem */
  quad(V(-0.16,1.10,0.14), V(0.16,1.10,0.14), V(0.13,1.15,0.13), V(-0.13,1.15,0.13), P.gold, 0.06);
  quad(V(-0.19,0.63,0.06), V(0.19,0.63,0.06), V(0.21,0.60,0.04), V(-0.21,0.60,0.04), P.goldDk, 0.05);

  /* head — bowed, mostly still flesh, a glowing ritual brand seared into the brow (not eyes) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, cx:0, cz:-0.06, rx:0.100, rz:0.098, hex:P.skinDk},
      {y:S.headB.y+0.10, cx:0, cz:-0.08, rx:0.108, rz:0.104, hex:P.skin},
      {y:S.headT.y-0.03, cx:0, cz:-0.10, rx:0.092, rz:0.088, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,-0.10), P.skinDk);

    /* seared ritual brand across the brow — a glowing sigil-slash, the eyes-replacement read */
    quad(V(-0.075,S.headT.y-0.095,-0.005), V(0.075,S.headT.y-0.095,-0.005), V(0.06,S.headT.y-0.12,-0.02), V(-0.06,S.headT.y-0.12,-0.02), P.brandDk, 0.05);
    quad(V(-0.05,S.headT.y-0.10,0.00), V(0.05,S.headT.y-0.10,0.00), V(0.04,S.headT.y-0.115,-0.015), V(-0.04,S.headT.y-0.115,-0.015), P.brand, 0.12);
    /* partial graft plate replacing one side of the jaw — mid-splice-rite read */
    quad(V(-0.09,S.headB.y+0.01,-0.03), V(-0.02,S.headB.y-0.01,-0.01), V(-0.02,S.headB.y-0.06,-0.02), V(-0.09,S.headB.y-0.04,-0.04), P.graft, 0.04);
  }

  /* halo-ring of small floating splice-relic shards orbiting the head — the "ascended" signature */
  {
    const hc = V(0, S.headT.y+0.06, -0.10);
    for(let i=0;i<5;i++){
      const a = (i/5)*Math.PI*2;
      const rx = 0.20, rz = 0.20;
      const px = hc.x+Math.cos(a)*rx, pz = hc.z+Math.sin(a)*rz, py = hc.y+Math.sin(a*2)*0.03;
      const p0 = V(px-0.02,py-0.02,pz);
      const p1 = V(px+0.02,py-0.02,pz);
      const p2 = V(px+0.015,py+0.03,pz+0.01);
      const p3 = V(px-0.015,py+0.03,pz+0.01);
      quad(p0,p1,p2,p3, P.relic, 0.1);
    }
  }

  /* arms — left mostly still flesh in a sleeve, right entirely replaced by a fused weapon-limb */
  {
    const shL = V(-0.20, 1.00, -0.02);
    const elL = V(-0.25, 0.80, 0.02);
    const hnL = V(-0.21, 0.62, 0.06);
    tube(shL, elL, 0.062, 0.052, 6, P.robe, {phase:Math.PI/6});
    tube(elL, hnL, 0.052, 0.036, 6, P.robeDk, {phase:Math.PI/6, capB:{hex:P.skin, lift:0.02}});

    const shR = V(0.20, 1.00, -0.02);
    const elR = V(0.27, 0.80, 0.02);
    const hnR = V(0.24, 0.58, 0.10);
    tube(shR, elR, 0.070, 0.060, 6, P.graft, {phase:Math.PI/6});
    tube(elR, hnR, 0.060, 0.040, 6, P.graftDk, {phase:Math.PI/6});
    /* fused weapon-limb — the forearm terminates in a spiked chrome relic-blade, gold-veined */
    const wB = hnR, wT = V(hnR.x+0.02, hnR.y-0.02, hnR.z+0.30);
    tube(wB, wT, 0.032, 0.010, 5, P.graftLt, {capB:{hex:P.gold, lift:0.01}});
    quad(V(wB.x-0.03,wB.y+0.02,wB.z+0.02), V(wB.x+0.03,wB.y+0.02,wB.z+0.02), V(wT.x+0.01,wT.y,wT.z-0.02), V(wT.x-0.01,wT.y,wT.z-0.02), P.gold, 0.06);
  }

  /* legs — robed, simple, mostly hidden by the hem */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.09, 0.60, 0);
      const knee = V(sx*0.11, 0.32, 0.02);
      const foot = V(sx*0.11, 0.03, 0.08);
      tube(hipJ, knee, 0.075, 0.062, 6, P.robeDk, {phase:Math.PI/6});
      tube(knee, foot, 0.062, 0.048, 6, P.robe, {phase:Math.PI/6, capB:{hex:P.robeDk, lift:0.02}});
    };
    legPair(-1); legPair(1);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
