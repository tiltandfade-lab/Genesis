/* dev/model-qa/creatures/rlm-siege-ballista-crew.js — Siege Ballista Crew (theater, siege lens,
   Large, CR 6). Read: a heavy gate-punching ballista on a stout wooden frame, a long drawn bolt
   nocked and under tension, crewed by two soldiers who never rest — one braced at the winch crank,
   one sighting down the bolt. Whole-object grammar: one merged frame, no anchors — machine + crew
   read as one Large siege-emplacement silhouette. VS-desaturated weathered timber, dull iron
   fittings, taut rope/sinew cord, dirty field-drab crew wool. NO eye quads (helmet-shadow socket
   read only). Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSiegeBallistaCrew(){
  const P = {
    wood:0x4a3826, woodDk:0x2e2016, woodLt:0x5e4a34,
    iron:0x2c2c28, ironDk:0x1a1a17, ironLt:0x484844,
    cord:0x8a7a5c, cordDk:0x5c503a,
    bolt:0x6b5a3e, boltTip:0x38362f,
    coat:0x54523e, coatDk:0x363527, coatLt:0x686550,
    skin:0x8a715c, skinDk:0x5f4c3d,
    helm:0x3e3d33, helmDk:0x27261f,
    disc:0x3f362d, discTop:0x4c4238,
  };

  /* ---------- FRAME — a stout A-frame timber base carrying the throwing arms + a central stock. --- */
  {
    // splayed base legs (4 corners) up to a central deck
    const deck=V(0,0.42,0.0);
    for(const [x,z] of [[-0.36,0.28],[0.36,0.28],[-0.36,-0.28],[0.36,-0.28]]){
      tube(V(x,0.02,z), V(x*0.4,0.42,z*0.3), 0.055,0.040,6,P.woodDk);
    }
    // deck platform
    quad(V(-0.30,0.40,0.24),V(0.30,0.40,0.24),V(0.28,0.40,-0.24),V(-0.28,0.40,-0.24),P.wood,0.05);
    // upright frame posts holding the bow-arms
    tube(V(-0.28,0.42,0.0),V(-0.30,0.86,0.0),0.045,0.032,6,P.wood);
    tube(V(0.28,0.42,0.0),V(0.30,0.86,0.0),0.045,0.032,6,P.wood);
    // top crossbar
    tube(V(-0.30,0.86,0.0),V(0.30,0.86,0.0),0.030,0.030,6,P.woodDk);
  }

  /* ---------- BOW-ARMS + CORD — two long tensioned arms sweeping forward, joined by a drawn cord. */
  {
    const armL0=V(-0.30,0.72,0.02), armL1=V(-0.62,0.60,0.62);
    const armR0=V(0.30,0.72,0.02), armR1=V(0.62,0.60,0.62);
    tube(armL0,armL1,0.040,0.020,6,P.wood,{capB:{hex:P.woodDk,lift:0.01}});
    tube(armR0,armR1,0.040,0.020,6,P.wood,{capB:{hex:P.woodDk,lift:0.01}});
    // taut cord between the arm tips, drawn back to the nock
    const nock=V(0,0.66,0.20);
    tube(armL1,nock,0.012,0.010,4,P.cord);
    tube(armR1,nock,0.012,0.010,4,P.cord);
    // stock/track running forward to the muzzle
    tube(V(0,0.66,-0.10),V(0,0.66,0.86),0.030,0.020,6,P.woodLt);
  }

  /* ---------- BOLT — a long heavy bolt nocked and drawn, iron-tipped, projecting forward. ---------- */
  {
    const nock=V(0,0.66,0.20), mid=V(0,0.665,0.70), tip=V(0,0.67,1.10);
    tube(nock,mid,0.024,0.018,6,P.bolt);
    tube(mid,tip,0.018,0.008,6,P.boltTip,{capB:{hex:P.ironDk,lift:0.004}});
    // fletching at the nock
    for(const s of [-1,1]) quad(V(s*0.02,0.66,0.14),V(s*0.06,0.66,0.10),V(s*0.05,0.70,0.12),V(s*0.015,0.70,0.16),P.cordDk,0.06);
  }

  /* ---------- WINCH — a stubby crank drum at the rear of the deck. ---------- */
  {
    const wc=V(0,0.52,-0.22);
    const rings=[ring(V(wc.x-0.04,wc.y,wc.z),V(1,0,0),0.09,0.09,7),ring(V(wc.x+0.04,wc.y,wc.z),V(1,0,0),0.09,0.09,7)];
    stitch(rings, ()=>P.iron);
    capFan(rings[0], V(wc.x-0.05,wc.y,wc.z), P.ironDk, true);
    capFan(rings[1], V(wc.x+0.05,wc.y,wc.z), P.ironDk);
    // crank handle
    tube(V(wc.x+0.05,wc.y,wc.z),V(wc.x+0.09,wc.y+0.09,wc.z-0.02),0.012,0.008,4,P.ironLt);
  }

  /* ---------- helper: bespoke crewman ---------- */
  function crewman(hipX, hipZ, headTurn, armReach){
    const S = {
      hip:V(hipX,0.42,hipZ), waist:V(hipX,0.54,hipZ+0.02), chest:V(hipX,0.64,hipZ+0.04),
      shldr:V(hipX,0.72,hipZ+0.02), neck:V(hipX,0.76,hipZ), headB:V(hipX,0.80,hipZ-0.01), headT:V(hipX,0.94,hipZ-0.02),
    };
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.110, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.105, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.120, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.100, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(hipX,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(hipX,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(hipX,S.hip.y-0.05,S.hip.z), P.coatDk, true);
    // helmet
    const hb=[{y:S.headB.y,r:0.062,hex:P.skinDk},{y:S.headB.y+0.05,r:0.068,hex:P.helm},{y:S.headT.y-0.02,r:0.066,hex:P.helm}];
    const hr=hb.map(b=>ring(V(hipX,b.y,S.headB.z),V(0,1,0),b.r,b.r*0.92,7,Math.PI/7));
    stitch(hr, b=>hb[b].hex);
    capFan(hr.at(-1), V(hipX,S.headT.y+0.02,S.headB.z-0.01), P.helmDk);
    quad(V(hipX-0.04,S.headB.y+0.01,S.headB.z+headTurn), V(hipX+0.04,S.headB.y+0.01,S.headB.z+headTurn),
         V(hipX+0.036,S.headB.y+0.035,S.headB.z+headTurn+0.005), V(hipX-0.036,S.headB.y+0.035,S.headB.z+headTurn+0.005), P.skinDk, 0.04);
    // arm reaching toward the machine (winch or stock)
    tube(V(hipX,S.shldr.y,S.shldr.z),armReach,0.038,0.026,6,P.coat,{capB:{hex:P.skin,lift:0.015}});
    // legs braced
    tube(V(hipX-0.06,S.hip.y,S.hip.z),V(hipX-0.07,0.14,S.hip.z+0.04),0.058,0.044,6,P.coatDk);
    tube(V(hipX+0.06,S.hip.y,S.hip.z),V(hipX+0.08,0.14,S.hip.z-0.06),0.058,0.042,6,P.coatDk);
  }
  crewman(-0.10,-0.30,-0.02, V(0.02,0.50,-0.20));      // rear: at the winch
  crewman(0.14,0.36,0.10, V(0.0,0.64,0.55));           // front: sighting down the stock

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
