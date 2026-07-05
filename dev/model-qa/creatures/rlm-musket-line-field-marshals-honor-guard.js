/* dev/model-qa/creatures/rlm-musket-line-field-marshals-honor-guard.js — Musket-Line Field
   Marshal's Honor Guard (theater, musket lens, Medium, CR 6). Read: a decorated soldier standing
   fast, planted, gripping a tall battle standard-pole braced against one shoulder, sabre at the
   hip, a sash of rank across the chest. Whole-object bipedal grammar: one merged frame, no anchors,
   rigid parade-stiff braced stance. VS-desaturated deep faded-wool coat, tarnished gold braid, a
   weathered cloth standard. NO eye quads (shako-brim shadow socket read only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineFieldMarshalsHonorGuard(){
  const P = {
    coat:0x4a3c48, coatDk:0x2e2430, coatLt:0x5e4e5c,
    sash:0x8a3630, sashDk:0x5c2018,
    braid:0x8a7a3e, braidDk:0x6b5a2e,
    skin:0x8a715c, skinDk:0x5f4c3d,
    shako:0x2a2622, shakoDk:0x18150f, plume:0x6b2018,
    sabre:0x484844, hilt:0x8a7a3e, wood:0x4a3826,
    standard:0x6b5a3e, standardDk:0x4a3c28, finial:0x8a7a3e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — stiff braced parade stance. ---------- */
  const S = {
    hip:V(0,0.34,0), waist:V(0,0.48,0.0), chest:V(0,0.62,0.0),
    shldr:V(0,0.72,0.0), neck:V(0,0.76,0.0), headB:V(0,0.80,0.0), headT:V(0,0.96,0.0),
  };

  /* ---------- TORSO — decorated coat, rigid, braid trim + sash. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.150, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.145, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.165, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.145, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // sash of rank, diagonal across the chest
    quad(V(-0.15,0.70,0.12),V(0.02,0.66,0.14),V(0.06,0.38,0.06),V(-0.10,0.42,0.04),P.sash,0.06);
    quad(V(-0.13,0.68,0.13),V(-0.02,0.65,0.14),V(0.02,0.40,0.05),V(-0.09,0.43,0.045),P.sashDk,0.05);
    // shoulder braid epaulettes
    for(const s of [-1,1]) quad(V(s*0.12,0.72,-0.04),V(s*0.16,0.72,0.06),V(s*0.15,0.68,0.08),V(s*0.11,0.68,-0.02),P.braid,0.05);
    // gold buttons
    for(const y of [0.44,0.53,0.62]) quad(V(-0.016,y,S.chest.z+0.16),V(0.016,y,S.chest.z+0.16),V(0.013,y+0.02,S.chest.z+0.16),V(-0.013,y+0.02,S.chest.z+0.16),P.braid,0.04);
  }

  /* ---------- HEAD — tall shako with a stiff plume. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.080, hex:P.skinDk},
      {y:S.headB.y+0.055, r:0.086, hex:P.skin},
      {y:S.headT.y-0.10, r:0.080, hex:P.shakoDk},
      {y:S.headT.y-0.01, r:0.078, hex:P.shako},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.shakoDk);
    // brim
    quad(V(-0.09,S.headT.y-0.13,S.headB.z+0.08), V(0.09,S.headT.y-0.13,S.headB.z+0.08),
         V(0.075,S.headT.y-0.10,S.headB.z-0.07), V(-0.075,S.headT.y-0.10,S.headB.z-0.07), P.shakoDk, 0.04);
    // gold plate + braid strap
    quad(V(-0.03,S.headT.y-0.09,S.headB.z+0.075),V(0.03,S.headT.y-0.09,S.headB.z+0.075),
         V(0.024,S.headT.y-0.02,S.headB.z+0.06),V(-0.024,S.headT.y-0.02,S.headB.z+0.06),P.braid,0.04);
    // stiff plume standing tall
    tube(V(0,S.headT.y+0.02,S.headB.z-0.02),V(0.01,S.headT.y+0.20,S.headB.z-0.04),0.024,0.006,5,P.plume,{capB:{hex:P.plume,lift:0.006}});
    // brim shadow (no eyes)
    quad(V(-0.05,S.headB.y+0.02,S.headB.z+0.07), V(0.05,S.headB.y+0.02,S.headB.z+0.07),
         V(0.045,S.headB.y+0.05,S.headB.z+0.075), V(-0.045,S.headB.y+0.05,S.headB.z+0.075), P.skinDk, 0.04);
  }

  /* ---------- BATTLE STANDARD — a tall pole braced against the shoulder, weathered cloth banner. --- */
  {
    const base=V(0.20,0.02,-0.12), top=V(0.24,1.30,-0.06);
    tube(base,top,0.024,0.014,6,P.standard);
    capFan(ring(V(top.x,top.y,top.z),V(0,1,0),0.03,0.03,6), V(top.x,top.y+0.06,top.z), P.finial);
    // banner cloth hanging from the pole, worn/tattered edge
    quad(V(0.25,1.10,-0.05),V(0.25,0.62,-0.08),V(0.44,0.66,-0.02),V(0.44,1.06,0.02),P.standard,0.07);
    quad(V(0.25,1.10,-0.05),V(0.44,1.06,0.02),V(0.42,1.16,0.04),V(0.24,1.20,-0.03),P.standardDk,0.06);
    // ragged bottom fringe
    for(const t of [0.28,0.34,0.40]) quad(V(t,0.64,-0.04),V(t+0.03,0.64,-0.04),V(t+0.015,0.56,-0.02),V(t-0.015,0.56,-0.02),P.standardDk,0.08);
  }

  /* ---------- ARMS — one gripping the standard braced at the shoulder, one resting on the sabre hilt. */
  {
    const shR=V(0.13,0.70,0.02), elR=V(0.20,0.58,0.0), hR=V(0.20,0.42,-0.06);
    tube(shR,elR,0.050,0.038,6,P.coat); tube(elR,hR,0.038,0.028,6,P.coatDk,{capB:{hex:P.skin,lift:0.015}});
    const shL=V(-0.13,0.70,0.02), elL=V(-0.17,0.55,0.06), hL=V(-0.14,0.42,0.10);
    tube(shL,elL,0.050,0.038,6,P.coat); tube(elL,hL,0.038,0.028,6,P.coatDk,{capB:{hex:P.skin,lift:0.015}});
  }

  /* ---------- SABRE — sheathed at the hip, curved hilt visible. ---------- */
  {
    const hilt=V(-0.15,0.40,0.08), tip=V(-0.20,0.06,0.20);
    tube(hilt,tip,0.020,0.010,5,P.sabre);
    quad(V(-0.17,0.42,0.06),V(-0.13,0.42,0.06),V(-0.13,0.46,0.08),V(-0.17,0.46,0.08),P.hilt,0.04);
  }

  /* ---------- LEGS — braced, feet planted apart. ---------- */
  {
    const hipL=V(-0.08,0.34,0), kneeL=V(-0.09,0.16,0.02), footL=V(-0.10,0.02,0.05);
    tube(hipL,kneeL,0.068,0.052,6,P.coatDk); tube(kneeL,footL,0.052,0.036,6,P.coat,{capB:{hex:P.shakoDk,lift:0.02}});
    const hipR=V(0.08,0.34,0), kneeR=V(0.10,0.16,-0.02), footR=V(0.12,0.02,-0.05);
    tube(hipR,kneeR,0.068,0.052,6,P.coatDk); tube(kneeR,footR,0.052,0.036,6,P.coat,{capB:{hex:P.shakoDk,lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
