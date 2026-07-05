/* dev/model-qa/creatures/rlm-longship-berserker-kings-champion.js — Longship Berserker-King's
   Champion (theater, longship lens, Medium, CR 7). Read: a bare-chested champion planted at the
   longship's carved prow, fighting from the deck rail — huge two-handed axe raised overhead, wild
   braided hair, heavy warpaint bands, a wolf-pelt half-cloak. Reuses/extends the berserker bipedal
   grammar with a grander, more decorated silhouette + a fragment of the ship's prow rail beneath
   the feet. Whole-object grammar: one merged frame, no anchors. VS-desaturated cold-north palette.
   NO eye quads (hollow socket shading only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLongshipBerserkerKingsChampion(){
  const P = {
    skin:0x9c8468, skinDk:0x6c5847,
    pelt:0x5c4a36, peltDk:0x3c3024, peltLt:0x71604a,
    hair:0x433527, hairDk:0x2c2318,
    iron:0x3a3c3e, ironDk:0x232527, ironLt:0x585c5e,
    gold:0x8a7a3e,
    wood:0x4a3826, woodDk:0x2e2016,
    paint:0x6b7a8a, paintDk:0x445260,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — braced wide stance at the prow, torso hinged up for the overhead swing. -- */
  const S = {
    hip:V(0,0.35,0), waist:V(0,0.49,0.02), chest:V(0,0.63,0.04),
    shldr:V(0,0.73,0.02), neck:V(0,0.78,0.0), headB:V(0,0.82,0.0), headT:V(0,0.98,-0.02),
  };

  /* ---------- SHIP-PROW FRAGMENT — a carved wooden rail/gunwale beneath the feet. ---------- */
  {
    quad(V(-0.30,0.0,-0.10),V(0.30,0.0,-0.10),V(0.26,0.02,0.18),V(-0.26,0.02,0.18),P.wood,0.05);
    quad(V(-0.28,0.02,0.16),V(0.28,0.02,0.16),V(0.30,0.10,0.30),V(-0.30,0.10,0.30),P.woodDk,0.05);
    // carved dragonhead motif spiral hint at the prow front
    tube(V(0.28,0.06,0.24),V(0.38,0.16,0.34),0.024,0.010,5,P.woodDk,{capB:{hex:P.gold,lift:0.006}});
  }

  /* ---------- TORSO — grander bare-chested, war-paint bands, decorated belt. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.150, hex:P.peltDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.160, hex:P.skin},
      {y:S.chest.y, cz:S.chest.z, rx:0.190, hex:P.skin},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.200, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.peltDk, true);
    // war-paint bands across the chest (blue-grey, desaturated)
    for(const [dx,dy] of [[-0.08,0.10],[0.06,0.06],[-0.03,-0.02],[0.09,-0.06]]){
      quad(V(dx,S.chest.y+dy,S.chest.z+0.14), V(dx+0.03,S.chest.y+dy,S.chest.z+0.14),
           V(dx+0.025,S.chest.y+dy-0.10,S.chest.z+0.13), V(dx-0.005,S.chest.y+dy-0.10,S.chest.z+0.13), P.paint, 0.06);
    }
    // gold torc/belt at the waist
    quad(V(-0.14,S.waist.y-0.02,S.waist.z+0.10),V(0.14,S.waist.y-0.02,S.waist.z+0.10),
         V(0.12,S.waist.y+0.02,S.waist.z+0.10),V(-0.12,S.waist.y+0.02,S.waist.z+0.10),P.gold,0.05);
  }

  /* ---------- PELT HALF-CLOAK — grander wolf-pelt mantle over one shoulder, streaming back. --------- */
  {
    const a=V(-0.20,S.shldr.y+0.06,S.shldr.z-0.02), b=V(0.12,S.shldr.y+0.02,S.shldr.z-0.08);
    const c=V(0.18,S.hip.y+0.02,S.hip.z-0.22), d=V(-0.16,S.hip.y-0.04,S.hip.z-0.24);
    quad(a,b,c,d,P.pelt,0.08);
    quad(V(-0.22,S.shldr.y+0.05,S.shldr.z-0.03),a,d,V(-0.20,S.hip.y-0.02,S.hip.z-0.28),P.peltDk,0.08);
    for(const t of [-0.16,-0.06,0.04,0.14]){
      quad(V(t,S.hip.y-0.02,S.hip.z-0.24),V(t+0.05,S.hip.y-0.02,S.hip.z-0.24),
           V(t+0.03,S.hip.y-0.18,S.hip.z-0.22),V(t-0.02,S.hip.y-0.18,S.hip.z-0.22),P.peltLt,0.07);
    }
  }

  /* ---------- HEAD — braided wild hair, war-paint face streaks, hollow socket shading. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:S.headB.y,r:0.088,hex:P.skinDk},{y:S.headB.y+0.07,r:0.094,hex:P.skin},{y:S.headT.y-0.03,r:0.078,hex:P.skin}];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z),V(0,1,0),b.r,b.r*0.9,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.hair);
    // paint streaks on the face
    quad(V(-0.05,S.headB.y+0.07,S.headB.z+0.075),V(-0.02,S.headB.y+0.07,S.headB.z+0.075),
         V(-0.018,S.headB.y-0.01,S.headB.z+0.07),V(-0.045,S.headB.y-0.01,S.headB.z+0.07),P.paintDk,0.06);
    // hollow socket shading (no eyes)
    for(const s of [-1,1]) quad(V(s*0.06-0.020,S.headB.y+0.05,S.headB.z+0.07), V(s*0.06+0.020,S.headB.y+0.05,S.headB.z+0.07),
         V(s*0.06+0.016,S.headB.y+0.08,S.headB.z+0.065), V(s*0.06-0.016,S.headB.y+0.08,S.headB.z+0.065), P.skinDk, 0.05);
    // braided hair mass with beads
    for(const [dx,dz] of [[-0.06,-0.05],[0.07,-0.04],[0.0,-0.09],[-0.09,0.0],[0.10,0.01]]){
      const base=V(dx*0.6,S.headT.y-0.02,S.headB.z+dz*0.3), tip=V(dx,S.headT.y+0.02,S.headB.z+dz-0.10);
      tube(base,tip,0.018,0.008,4,P.hairDk,{capB:{hex:P.gold,lift:0.004}});
    }
  }

  /* ---------- ARMS — both raised high overhead for the swing. ---------- */
  {
    const shR=V(-0.20,S.shldr.y,S.shldr.z), elR=V(-0.30,S.shldr.y+0.20,S.shldr.z-0.04), hR=V(-0.22,S.shldr.y+0.42,S.shldr.z-0.10);
    tube(shR,elR,0.054,0.042,6,P.skin); tube(elR,hR,0.042,0.032,6,P.skin,{capB:{hex:P.skin,lift:0.02}});
    const shL=V(0.20,S.shldr.y,S.shldr.z), elL=V(0.30,S.shldr.y+0.20,S.shldr.z-0.04), hL=V(0.14,S.shldr.y+0.44,S.shldr.z-0.14);
    tube(shL,elL,0.054,0.042,6,P.skin); tube(elL,hL,0.042,0.032,6,P.skin,{capB:{hex:P.skin,lift:0.02}});
  }

  /* ---------- TWO-HANDED AXE — raised overhead, mid-swing. ---------- */
  {
    const gripL=V(0.14,S.shldr.y+0.44,S.shldr.z-0.14), gripR=V(-0.22,S.shldr.y+0.42,S.shldr.z-0.10);
    const haftTop=V(-0.05,S.shldr.y+0.66,S.shldr.z-0.24);
    tube(gripL,gripR,0.020,0.020,6,P.wood); tube(gripR,haftTop,0.020,0.015,6,P.wood);
    quad(V(-0.05,S.shldr.y+0.66,S.shldr.z-0.24),V(-0.05,S.shldr.y+0.58,S.shldr.z-0.24),
         V(-0.26,S.shldr.y+0.62,S.shldr.z-0.18),V(-0.24,S.shldr.y+0.76,S.shldr.z-0.16),P.iron,0.06);
    quad(V(-0.26,S.shldr.y+0.62,S.shldr.z-0.18),V(-0.24,S.shldr.y+0.76,S.shldr.z-0.16),
         V(-0.34,S.shldr.y+0.70,S.shldr.z-0.14),V(-0.34,S.shldr.y+0.70,S.shldr.z-0.14),P.ironLt,0.06);
  }

  /* ---------- LEGS — braced wide stance planted on the prow rail. ---------- */
  {
    const hipL=V(-0.10,0.35,0.02), kneeL=V(-0.16,0.19,0.14), footL=V(-0.16,0.03,0.20);
    tube(hipL,kneeL,0.066,0.054,6,P.skinDk); tube(kneeL,footL,0.054,0.040,6,P.iron,{capB:{hex:P.ironDk,lift:0.02}});
    const hipR=V(0.10,0.35,-0.02), kneeR=V(0.15,0.20,-0.16), footR=V(0.15,0.03,-0.22);
    tube(hipR,kneeR,0.066,0.054,6,P.skinDk); tube(kneeR,footR,0.054,0.040,6,P.iron,{capB:{hex:P.ironDk,lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
