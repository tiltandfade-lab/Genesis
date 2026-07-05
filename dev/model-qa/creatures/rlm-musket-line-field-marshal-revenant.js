/* dev/model-qa/creatures/rlm-musket-line-field-marshal-revenant.js — Musket-Line Field
   Marshal-Revenant (theater, Medium, CR 13). A spectral officer frozen mid-order at his
   headquarters table: greatcoat stiff as frozen canvas, one gloved hand still planted flat on
   a map-board, the other raised pointing an order that never finished, a bicorne hat low over
   a hollow-socket face, sash and tarnished braid, sabre still sheathed at the hip. The read:
   an authority-figure silhouette caught paused, not fighting — the map-table IS the pose (a
   small folding table + pinned map built into the model, waist-height, one hand flat on it).
   Whole-object bipedal grammar, one merged frame, no anchors. VS-desaturated cold-drab palette
   (faded parade blue-grey greatcoat, tarnished brass, ash-pale ghost-skin) — theater register:
   war without a flag, no real-world insignia. NO eye quads. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineFieldMarshalRevenant(){
  const P = {
    coat:0x4a5058, coatDk:0x2e3238, coatLt:0x646c74,
    facing:0x6e2e2e, facingDk:0x481c1c,                 // faded regimental facing-red, unflagged
    sash:0x8a7048, sashDk:0x5e4c2e,
    skin:0x8a8a86, skinDk:0x5c5c58,                     // ash-pale ghost skin (desaturated grey)
    brass:0x8a7844, brassDk:0x5c4e2c,
    hat:0x2a2c30, hatDk:0x18191c,
    glove:0x3a3e3e,
    boot:0x242628,
    map:0xc4b896, mapDk:0x968a68, mapLine:0x4a4234,
    wood:0x3e3226, woodDk:0x281f18,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — upright, weight forward over the map-table, torso pitched slightly in. ---------- */
  const S = {
    hip:   V(0, 0.38, 0),
    waist: V(0.01, 0.52, 0.03),
    chest: V(0.01, 0.66, 0.05),
    shldr: V(0.00, 0.76, 0.05),
    neck:  V(0.00, 0.81, 0.04),
    headB: V(0, 0.85, 0.03),
    headT: V(0, 1.00, 0.00),
  };

  /* ---------- MAP-TABLE — a small folding table at waist height with a pinned map; the officer
     stands over it, one hand flat on the board. Anchors the "frozen mid-order" silhouette. ---------- */
  {
    const topY = 0.46;
    const tA=V(-0.20,topY,0.20), tB=V(0.22,topY,0.20), tC=V(0.22,topY,0.46), tD=V(-0.20,topY,0.46);
    quad(tA,tB,tC,tD,P.map,0.05);
    quad(tD,tC,tB,tA,P.mapDk,0.05);
    // map grid lines (thin dark strips)
    for(const dz of [0.06,0.14,0.22]) quad(V(-0.19,topY+0.002,0.20+dz), V(0.21,topY+0.002,0.20+dz),
                                            V(0.21,topY+0.002,0.20+dz+0.008), V(-0.19,topY+0.002,0.20+dz+0.008), P.mapLine, 0.02);
    // table legs + skirt
    const legTop=topY-0.02;
    for(const [x,z] of [[-0.18,0.24],[0.20,0.24],[0.20,0.44],[-0.18,0.44]]){
      tube(V(x,legTop,z), V(x*0.7,0.02,z*0.85+0.05), 0.020,0.014,4,P.wood);
    }
    quad(V(-0.21,topY-0.03,0.19), V(0.23,topY-0.03,0.19), V(0.23,topY-0.06,0.47), V(-0.21,topY-0.06,0.47), P.woodDk, 0.04);
  }

  /* ---------- TORSO — stiff frozen greatcoat, faded facing-red front, tarnished sash. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.150, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.145, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.160, hex:P.coatLt},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.168, hex:P.coat},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // coat skirts flaring stiff below the waist (frozen, not draping)
    quad(V(-0.16,S.hip.y-0.02,S.hip.z-0.02), V(0.16,S.hip.y-0.02,S.hip.z-0.02),
         V(0.22,S.hip.y-0.30,S.hip.z+0.06), V(-0.22,S.hip.y-0.30,S.hip.z+0.06), P.coatDk, 0.05);
    // facing-red front panel (unflagged regimental color, straight down the chest)
    quad(V(-0.05,S.chest.y+0.08,S.chest.z+0.10), V(0.05,S.chest.y+0.08,S.chest.z+0.10),
         V(0.06,S.hip.y+0.02,S.hip.z+0.10), V(-0.06,S.hip.y+0.02,S.hip.z+0.10), P.facing, 0.04);
    // brass buttons down the front
    for(const t of [0,1,2,3]){
      const yy = S.hip.y+0.06 + t*0.115;
      quad(V(-0.014,yy,S.hip.z+0.135), V(0.014,yy,S.hip.z+0.135), V(0.012,yy-0.02,S.hip.z+0.13), V(-0.012,yy-0.02,S.hip.z+0.13), P.brass, 0.03);
    }
    // sash across the chest, corner to hip
    quad(V(-0.16,S.shldr.y+0.02,S.shldr.z+0.02), V(-0.06,S.shldr.y-0.02,S.shldr.z+0.06),
         V(0.10,S.hip.y+0.10,S.hip.z+0.10), V(0.02,S.hip.y+0.14,S.hip.z+0.08), P.sash, 0.05);
    quad(V(0.02,S.hip.y+0.14,S.hip.z+0.08), V(0.10,S.hip.y+0.10,S.hip.z+0.10),
         V(0.09,S.hip.y+0.05,S.hip.z+0.10), V(0.01,S.hip.y+0.09,S.hip.z+0.08), P.sashDk, 0.04);
    // epaulettes on both shoulders
    for(const s of [-1,1]){
      const eb=ring(V(s*0.15,S.shldr.y+0.02,S.shldr.z), V(0,1,0), 0.045,0.045,6);
      capFan(eb, V(s*0.15,S.shldr.y+0.05,S.shldr.z), P.brass);
    }
  }

  /* ---------- SABRE — sheathed at the hip, not drawn (frozen at rest). ---------- */
  {
    const sA=V(0.12,S.hip.y-0.05,S.hip.z-0.10), sB=V(0.16,0.06,S.hip.z-0.20);
    tube(sA,sB,0.024,0.014,5,P.coatDk);
    tube(sB, V(sB.x+0.02,sB.y-0.10,sB.z-0.05), 0.014,0.006,5,P.brassDk,{capB:{hex:P.brassDk,lift:0.006}});
    const hilt = ring(V(0.11,S.hip.y+0.02,S.hip.z-0.10), V(0,1,0), 0.028,0.020,5);
    capFan(hilt, V(0.11,S.hip.y+0.06,S.hip.z-0.10), P.brass);
  }

  /* ---------- HEAD — bicorne hat, hollow-socket grim face, no eyes. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.076, hex:P.skinDk},
      {y:S.headB.y+0.06, r:0.082, hex:P.skin},
      {y:S.headT.y-0.03, r:0.066, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    // socket shading, no eyes
    quad(V(-0.054,S.headB.y+0.05,S.headB.z+0.062), V(-0.013,S.headB.y+0.05,S.headB.z+0.067),
         V(-0.017,S.headB.y+0.078,S.headB.z+0.061), V(-0.050,S.headB.y+0.078,S.headB.z+0.056), P.skinDk, 0.05);
    quad(V(0.013,S.headB.y+0.05,S.headB.z+0.067), V(0.054,S.headB.y+0.05,S.headB.z+0.062),
         V(0.050,S.headB.y+0.078,S.headB.z+0.056), V(0.017,S.headB.y+0.078,S.headB.z+0.061), P.skinDk, 0.05);
    // tight grim mouth line
    quad(V(-0.022,S.headB.y,S.headB.z+0.07), V(0.022,S.headB.y,S.headB.z+0.07),
         V(0.018,S.headB.y-0.018,S.headB.z+0.066), V(-0.018,S.headB.y-0.018,S.headB.z+0.066), P.skinDk, 0.04);
    // BICORNE HAT — a low wide crescent-brim hat, two peaks fore/aft
    const brimY = S.headT.y - 0.01;
    const bA=V(0,brimY,S.headB.z+0.20), bB=V(-0.17,brimY-0.02,S.headB.z-0.02), bC=V(0,brimY,S.headB.z-0.22), bD=V(0.17,brimY-0.02,S.headB.z-0.02);
    quad(bA,bD,bC,bB,P.hat,0.05);
    quad(bB,bC,bD,bA,P.hatDk,0.05);
    // crown ridge rising from front to back peak
    const crB=V(0,brimY+0.02,S.headB.z+0.16), crT=V(0,brimY+0.13,S.headB.z+0.0), crE=V(0,brimY+0.02,S.headB.z-0.16);
    quad(V(-0.05,crB.y,crB.z), V(0.05,crB.y,crB.z), V(0.04,crT.y,crT.z), V(-0.04,crT.y,crT.z), P.hatDk, 0.04);
    quad(V(-0.04,crT.y,crT.z), V(0.04,crT.y,crT.z), V(0.05,crE.y,crE.z), V(-0.05,crE.y,crE.z), P.hatDk, 0.04);
    // brass cockade at the front peak
    const cok=ring(V(0,crB.y+0.02,crB.z+0.02), V(0,0,1), 0.03,0.03,6);
    capFan(cok, V(0,crB.y+0.02,crB.z+0.05), P.brass);
  }

  /* ---------- ARMS — one flat planted on the map-table (frozen, palm down), one raised
     mid-order pointing forward, glove tips extended, the order that never finished. ---------- */
  {
    // right arm: flat on the table
    const shR = V(-0.17,S.shldr.y-0.02,S.shldr.z+0.02), elR = V(-0.20,0.58,0.20), hR = V(-0.12,0.47,0.34);
    tube(shR, elR, 0.050, 0.040, 6, P.coat);
    tube(elR, hR, 0.040, 0.032, 6, P.coatDk, {capB:{hex:P.glove, lift:0.014}});
    // spread glove fingers flat on the map
    for(const dx of [-0.03,0,0.03]){
      tube(V(-0.12+dx,0.462,0.35), V(-0.12+dx,0.462,0.40), 0.010,0.006,3,P.glove,{capB:{hex:P.glove,lift:0.002}});
    }
    // left arm: raised, pointing an unfinished order forward-up
    const shL = V(0.17,S.shldr.y-0.01,S.shldr.z+0.02), elL = V(0.28,0.86,0.16), hL = V(0.30,1.00,0.36);
    tube(shL, elL, 0.050, 0.040, 6, P.coat);
    tube(elL, hL, 0.040, 0.028, 6, P.coatDk, {capB:{hex:P.glove, lift:0.014}});
    // pointing finger extended
    tube(hL, V(0.32,1.03,0.48), 0.010,0.006,4,P.glove,{capB:{hex:P.glove,lift:0.003}});
  }

  /* ---------- LEGS — planted upright, boots braced. ---------- */
  {
    const hipL = V(-0.09,0.38,-0.02), kneeL = V(-0.11,0.20,0.02), footL = V(-0.10,0.02,0.10);
    tube(hipL, kneeL, 0.062, 0.050, 6, P.coatDk);
    tube(kneeL, footL, 0.050, 0.040, 6, P.coatDk, {capB:{hex:P.boot, lift:0.02}});
    const hipR = V(0.09,0.38,-0.02), kneeR = V(0.11,0.20,0.02), footR = V(0.10,0.02,0.10);
    tube(hipR, kneeR, 0.062, 0.050, 6, P.coatDk);
    tube(kneeR, footR, 0.050, 0.040, 6, P.coatDk, {capB:{hex:P.boot, lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
