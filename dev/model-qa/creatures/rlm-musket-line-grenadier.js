/* dev/model-qa/creatures/rlm-musket-line-grenadier.js — Musket-Line Grenadier (theater, musket
   lens, Medium, CR 5). Read: a tall standing soldier in a distinctive tall mitre-style hat, a
   heavy satchel of black-powder grenades slung across the chest, one grenade held ready with a
   lit fuse. Whole-object bipedal grammar: one merged frame, upright braced stance, no anchors.
   VS-desaturated faded field-drab wool, dull brass, dark leather satchel, iron grenade shells.
   NO eye quads (hat-brim shadow socket read only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineGrenadier(){
  const P = {
    coat:0x5c5642, coatDk:0x3a3728, coatLt:0x716a52,
    skin:0x8a715c, skinDk:0x5f4c3d,
    hat:0x2e2b22, hatDk:0x1c1a15, hatBand:0x6b5a34,
    satchel:0x3e321f, satchelDk:0x281f13,
    brass:0x8a7a3e, iron:0x2c2c28,
    fuse:0x8a7040, spark:0xd97a2e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tall upright stance, chest thrown forward for the satchel. ---------- */
  const S = {
    hip:V(0,0.34,0), waist:V(0,0.48,0.02), chest:V(0,0.62,0.06),
    shldr:V(0,0.72,0.05), neck:V(0,0.76,0.04), headB:V(0,0.80,0.03), headT:V(0,0.96,0.02),
  };

  /* ---------- TORSO — tall, upright, heavy coat. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.145, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.140, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.160, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.140, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // brass buttons down the front
    for(const y of [0.42,0.52,0.62]) quad(V(-0.015,y,S.chest.z+0.15),V(0.015,y,S.chest.z+0.15),V(0.012,y+0.02,S.chest.z+0.15),V(-0.012,y+0.02,S.chest.z+0.15),P.brass,0.05);
  }

  /* ---------- GRENADE SATCHEL — heavy bag slung diagonally across the chest, prominent + wide. ---------- */
  {
    const a=V(-0.16,0.70,0.10), b=V(0.14,0.62,0.14), c=V(0.10,0.36,0.06), d=V(-0.18,0.42,0.02);
    quad(a,b,c,d,P.satchel,0.06);
    quad(V(-0.18,0.72,0.06),a,d,V(-0.20,0.40,-0.02),P.satchelDk,0.06);
    // buckle
    quad(V(-0.03,0.52,0.16),V(0.03,0.52,0.16),V(0.025,0.56,0.16),V(-0.025,0.56,0.16),P.brass,0.04);
    // pouch bulge low on the bag (round grenade shapes underneath the flap)
    quad(V(-0.14,0.40,0.10),V(0.10,0.36,0.10),V(0.08,0.30,0.06),V(-0.12,0.32,0.06),P.satchelDk,0.06);
  }

  /* ---------- HEAD — the distinctive TALL mitre-style hat (the grenadier silhouette marker). ------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.082, hex:P.skinDk},
      {y:S.headB.y+0.06, r:0.088, hex:P.skin},
      {y:S.headT.y-0.14, r:0.078, hex:P.hatBand},
      {y:S.headT.y-0.04, r:0.060, hex:P.hat},
      {y:S.headT.y+0.06, r:0.038, hex:P.hatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.14,S.headB.z), P.hatDk);
    // hat-brim shadow (no eyes)
    quad(V(-0.05,S.headB.y+0.02,S.headB.z+0.07), V(0.05,S.headB.y+0.02,S.headB.z+0.07),
         V(0.045,S.headB.y+0.05,S.headB.z+0.075), V(-0.045,S.headB.y+0.05,S.headB.z+0.075), P.skinDk, 0.04);
    // front brass badge/plate on the mitre face
    quad(V(-0.04,S.headT.y-0.10,S.headB.z+0.07),V(0.04,S.headT.y-0.10,S.headB.z+0.07),
         V(0.03,S.headT.y-0.02,S.headB.z+0.06),V(-0.03,S.headT.y-0.02,S.headB.z+0.06),P.brass,0.05);
  }

  /* ---------- ARMS — one steadying the satchel strap, one raised holding a lit grenade ready. ------- */
  {
    const shL=V(0.14,0.70,0.06), elL=V(0.20,0.56,0.14), hL=V(0.12,0.44,0.16);
    tube(shL,elL,0.052,0.040,6,P.coat); tube(elL,hL,0.040,0.030,6,P.coatDk,{capB:{hex:P.skin,lift:0.02}});
    const shR=V(-0.14,0.72,0.06), elR=V(-0.22,0.66,0.20), hR=V(-0.18,0.80,0.28);
    tube(shR,elR,0.052,0.040,6,P.coat); tube(elR,hR,0.038,0.028,6,P.coatDk,{capB:{hex:P.skin,lift:0.02}});
    // grenade held in raised hand
    const gc=V(-0.18,0.82,0.30);
    const rings=[]; const n=6;
    for(const r of [{y:-0.03,rad:0.030},{y:0,rad:0.036},{y:0.03,rad:0.028}]) rings.push(ring(V(gc.x,gc.y+r.y,gc.z),V(0,1,0),r.rad,r.rad,n));
    stitch(rings, ()=>P.iron);
    capFan(rings.at(-1), V(gc.x,gc.y+0.05,gc.z), P.iron);
    // lit fuse + spark
    tube(V(gc.x,gc.y+0.04,gc.z), V(gc.x+0.02,gc.y+0.10,gc.z-0.01), 0.008,0.004,4,P.fuse);
    quad(V(gc.x+0.00,gc.y+0.11,gc.z-0.01),V(gc.x+0.03,gc.y+0.11,gc.z-0.01),V(gc.x+0.015,gc.y+0.14,gc.z-0.01),V(gc.x+0.005,gc.y+0.14,gc.z-0.01),P.spark,0.1);
  }

  /* ---------- LEGS — braced stance. ---------- */
  {
    const hipL=V(-0.08,0.34,0), kneeL=V(-0.10,0.16,0.06), footL=V(-0.10,0.02,0.10);
    tube(hipL,kneeL,0.072,0.056,6,P.coatDk); tube(kneeL,footL,0.056,0.040,6,P.coat,{capB:{hex:P.hatDk,lift:0.02}});
    const hipR=V(0.08,0.34,0), kneeR=V(0.11,0.16,-0.06), footR=V(0.13,0.02,-0.10);
    tube(hipR,kneeR,0.072,0.054,6,P.coatDk); tube(kneeR,footR,0.054,0.038,6,P.coat,{capB:{hex:P.hatDk,lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
