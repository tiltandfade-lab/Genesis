/* dev/model-qa/creatures/rlm-jungle-ambush-war-priest.js — Jungle Ambush War-Priest (theater,
   jungle lens, Medium, CR 7). Read: a war-priest emerging from cover, mid-swing with a ritual
   club after finishing a blessing — jungle-drab wraps, feathered/beaded totems, jade-dull ritual
   paint, a heavy stone-headed club raised at the follow-through. Whole-object bipedal grammar: one
   merged frame, no anchors, a low twisting lunge stance. VS-desaturated jungle-drab wraps + dull
   jade/ochre ritual paint. NO eye quads (mask-shadow socket read only). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleAmbushWarPriest(){
  const P = {
    wrap:0x5a5236, wrapDk:0x3a3422, wrapLt:0x6e6644,
    skin:0x8a6c4a, skinDk:0x5c4830,
    jade:0x4a6b5c, jadeDk:0x2e4638,
    ochre:0x8a5c34, ochreDk:0x5c3c20,
    feather:0x6b7a4a, feathDk:0x445230,
    club:0x4a3826, stone:0x5c584c, stoneDk:0x38352c,
    bead:0x8a7a3e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — low twisting lunge, torso rotated for the club follow-through. ---------- */
  const S = {
    hip:V(0,0.32,0), waist:V(0.02,0.45,0.02), chest:V(0.03,0.58,0.05),
    shldr:V(0.02,0.66,0.06), neck:V(0.01,0.70,0.06), headB:V(0.0,0.74,0.05), headT:V(-0.01,0.90,0.03),
  };

  /* ---------- TORSO — lean wrapped frame, ritual paint bands, twisted stance. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y, cz:S.hip.z, rx:0.130, hex:P.wrapDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.125, hex:P.wrap},
      {y:S.chest.y, cz:S.chest.z, rx:0.145, hex:P.skin},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.130, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.02,S.neck.z), P.skinDk);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.wrapDk, true);
    // jade ritual paint bands across the chest
    for(const [dx,dy] of [[-0.06,0.08],[0.04,0.02],[-0.02,-0.06]]){
      quad(V(dx,S.chest.y+dy,S.chest.z+0.12), V(dx+0.03,S.chest.y+dy,S.chest.z+0.12),
           V(dx+0.024,S.chest.y+dy-0.08,S.chest.z+0.11), V(dx-0.006,S.chest.y+dy-0.08,S.chest.z+0.11), P.jade, 0.06);
    }
    // waist wrap sash with beads
    quad(V(-0.13,S.waist.y-0.02,S.waist.z+0.08),V(0.13,S.waist.y-0.02,S.waist.z+0.08),
         V(0.11,S.waist.y+0.02,S.waist.z+0.08),V(-0.11,S.waist.y+0.02,S.waist.z+0.08),P.wrapLt,0.05);
    for(const x of [-0.08,-0.02,0.04,0.10]) quad(V(x,S.waist.y-0.06,S.waist.z+0.09),V(x+0.015,S.waist.y-0.06,S.waist.z+0.09),
         V(x+0.012,S.waist.y-0.10,S.waist.z+0.09),V(x-0.003,S.waist.y-0.10,S.waist.z+0.09),P.bead,0.04);
  }

  /* ---------- HEAD — ritual mask paint, feathered totem crest, mask-shadow socket read. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:S.headB.y,r:0.076,hex:P.skinDk},{y:S.headB.y+0.055,r:0.082,hex:P.skin},{y:S.headT.y-0.04,r:0.070,hex:P.skinDk}];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z),V(0,1,0),b.r,b.r*0.9,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.01,S.headB.z-0.01), P.wrapDk);
    // mask paint stripes across the face
    for(const s of [-1,1]) quad(V(s*0.05-0.014,S.headB.y+0.02,S.headB.z+0.065),V(s*0.05+0.014,S.headB.y+0.02,S.headB.z+0.065),
         V(s*0.05+0.011,S.headB.y+0.10,S.headB.z+0.06),V(s*0.05-0.011,S.headB.y+0.10,S.headB.z+0.06),P.jadeDk,0.06);
    // mask-shadow socket read (no eyes)
    for(const s of [-1,1]) quad(V(s*0.055-0.018,S.headB.y+0.05,S.headB.z+0.07), V(s*0.055+0.018,S.headB.y+0.05,S.headB.z+0.07),
         V(s*0.055+0.014,S.headB.y+0.08,S.headB.z+0.065), V(s*0.055-0.014,S.headB.y+0.08,S.headB.z+0.065), P.skinDk, 0.05);
    // feathered totem crest atop the head
    for(const [dx,dz] of [[-0.04,-0.04],[0.0,-0.06],[0.05,-0.03]]){
      const base=V(dx*0.5,S.headT.y-0.02,S.headB.z+dz*0.3), tip=V(dx,S.headT.y+0.14,S.headB.z+dz);
      tube(base,tip,0.016,0.005,4,P.feather,{capB:{hex:P.feathDk,lift:0.004}});
    }
  }

  /* ---------- ARMS — one arm mid-blessing gesture (open palm), one gripping the club at follow-through. */
  {
    const shR=V(-0.14,S.shldr.y,S.shldr.z), elR=V(-0.22,S.shldr.y-0.06,S.shldr.z+0.14), hR=V(-0.16,S.shldr.y-0.16,S.shldr.z+0.30);
    tube(shR,elR,0.046,0.036,6,P.skin); tube(elR,hR,0.036,0.026,6,P.skinDk,{capB:{hex:P.skin,lift:0.015}});
    // open blessing palm — a flat quad hand
    quad(V(-0.16,S.shldr.y-0.14,S.shldr.z+0.30),V(-0.10,S.shldr.y-0.14,S.shldr.z+0.32),
         V(-0.11,S.shldr.y-0.22,S.shldr.z+0.34),V(-0.17,S.shldr.y-0.22,S.shldr.z+0.32),P.skin,0.05);
    const shL=V(0.14,S.shldr.y,S.shldr.z), elL=V(0.24,S.shldr.y+0.16,S.shldr.z-0.10), hL=V(0.20,S.shldr.y+0.34,S.shldr.z-0.22);
    tube(shL,elL,0.046,0.036,6,P.skin); tube(elL,hL,0.036,0.026,6,P.skinDk,{capB:{hex:P.skin,lift:0.015}});
  }

  /* ---------- RITUAL CLUB — heavy stone-headed club raised at the follow-through of the swing. ------ */
  {
    const grip=V(0.20,S.shldr.y+0.34,S.shldr.z-0.22), mid=V(0.28,S.shldr.y+0.50,S.shldr.z-0.34);
    tube(grip,mid,0.022,0.020,6,P.club);
    // bulbous stone head
    const rings=[ring(V(0.32,S.shldr.y+0.56,S.shldr.z-0.40),V(1,0.3,-0.4),0.030,0.030,7),
                 ring(V(0.36,S.shldr.y+0.62,S.shldr.z-0.46),V(1,0.3,-0.4),0.048,0.048,7),
                 ring(V(0.40,S.shldr.y+0.68,S.shldr.z-0.52),V(1,0.3,-0.4),0.030,0.030,7)];
    stitch(rings, (b)=> b===0?P.stoneDk:P.stone);
    capFan(rings.at(-1), V(0.43,S.shldr.y+0.71,S.shldr.z-0.55), P.stoneDk);
    capFan(rings[0], V(0.29,S.shldr.y+0.53,S.shldr.z-0.37), P.stoneDk, true);
    // binding wraps at the club neck
    quad(V(0.25,S.shldr.y+0.47,S.shldr.z-0.31),V(0.29,S.shldr.y+0.47,S.shldr.z-0.33),
         V(0.28,S.shldr.y+0.51,S.shldr.z-0.34),V(0.24,S.shldr.y+0.51,S.shldr.z-0.32),P.bead,0.05);
  }

  /* ---------- LEGS — low twisted lunge stance, back foot pivoted. ---------- */
  {
    const hipL=V(-0.08,0.32,0.02), kneeL=V(-0.12,0.16,0.16), footL=V(-0.14,0.02,0.24);
    tube(hipL,kneeL,0.066,0.052,6,P.wrapDk); tube(kneeL,footL,0.052,0.036,6,P.wrap,{capB:{hex:P.wrapDk,lift:0.02}});
    const hipR=V(0.08,0.32,-0.02), kneeR=V(0.16,0.14,-0.14), footR=V(0.20,0.02,-0.26);
    tube(hipR,kneeR,0.066,0.050,6,P.wrapDk); tube(kneeR,footR,0.050,0.034,6,P.wrap,{capB:{hex:P.wrapDk,lift:0.02}});
    // leg wrap straps
    for(const [x,z] of [[-0.14,0.24],[0.20,-0.26]]){
      ring(V(x,0.09,z), V(0,1,0), 0.040, 0.040, 7).forEach((p,i,arr)=>{
        const p2=arr[(i+1)%arr.length];
        quad(p,p2,V(p2.x,p2.y+0.02,p2.z),V(p.x,p.y+0.02,p.z), P.wrapLt, 0.06);
      });
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
