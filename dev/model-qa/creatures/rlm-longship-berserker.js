/* dev/model-qa/creatures/rlm-longship-berserker.js — Longship Berserker (theater, longship lens,
   Medium, CR 1). A wild-eyed raider chewing ritual root before the beach charge: bare-chested
   under a wolf/bear pelt mantle, unbound wild hair, a two-handed axe held low and ready, root-stained
   mouth. Whole-object bipedal grammar: one merged frame, no anchors. VS-desaturated cold-north
   palette (weathered pale skin, dull pelt browns, dark iron). NO eye quads (hollow sockets read
   only via shading). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLongshipBerserker(){
  const P = {
    skin:0x9c8468, skinDk:0x6c5847,
    pelt:0x5c4a36, peltDk:0x3c3024, peltLt:0x71604a,
    hair:0x433527, hairDk:0x2c2318,
    iron:0x3a3c3e, ironDk:0x232527, ironLt:0x585c5e,
    wood:0x4a3826, root:0x6b7a3a, mouth:0x3a2018,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — a wide, aggressive forward-leaning stance. ---------- */
  const S = {
    hip:   V(0, 0.35, 0),
    waist: V(0, 0.48, 0.03),
    chest: V(0, 0.60, 0.08),
    shldr: V(0, 0.68, 0.06),
    neck:  V(0, 0.72, 0.04),
    headB: V(0, 0.76, 0.03),
    headT: V(0, 0.90, 0.01),
  };

  /* ---------- TORSO — bare-chested, broad, wrapped low in a fur-strap belt. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.140, hex:P.peltDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.150, hex:P.skin},
      {y:S.chest.y, cz:S.chest.z, rx:0.175, hex:P.skin},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.185, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.peltDk, true);
    // chest scars / streaked war-paint smears
    for(const [dx,dy] of [[-0.06,0.08],[0.05,0.03],[-0.02,-0.05]]){
      quad(V(dx,S.chest.y+dy,S.chest.z+0.10), V(dx+0.03,S.chest.y+dy,S.chest.z+0.10),
           V(dx+0.02,S.chest.y+dy-0.09,S.chest.z+0.09), V(dx-0.01,S.chest.y+dy-0.09,S.chest.z+0.09), P.skinDk, 0.06);
    }
  }

  /* ---------- PELT MANTLE — a shaggy animal-hide draped over one shoulder, hanging down the back. ---------- */
  {
    const a=V(-0.16,S.shldr.y+0.05,S.shldr.z-0.02), b=V(0.10,S.shldr.y+0.02,S.shldr.z-0.06);
    const c=V(0.14,S.hip.y+0.05,S.hip.z-0.14), d=V(-0.12,S.hip.y-0.02,S.hip.z-0.16);
    quad(a,b,c,d,P.pelt,0.08);
    quad(V(-0.18,S.shldr.y+0.04,S.shldr.z-0.03), a, d, V(-0.16,S.hip.y,S.hip.z-0.18), P.peltDk, 0.08);
    // shaggy fringe tufts along the hem
    for(const t of [-0.14,-0.05,0.04,0.12]){
      quad(V(t,S.hip.y-0.02,S.hip.z-0.16), V(t+0.04,S.hip.y-0.02,S.hip.z-0.16),
           V(t+0.02,S.hip.y-0.14,S.hip.z-0.14), V(t-0.02,S.hip.y-0.14,S.hip.z-0.14), P.peltLt, 0.07);
    }
  }

  /* ---------- HEAD — gaunt, wild unbound hair, hollow socket shading, root-stained slack jaw. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, r:0.084, hex:P.skinDk},
      {y:S.headB.y+0.07, r:0.090, hex:P.skin},
      {y:S.headT.y-0.03, r:0.074, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.01), P.hair);
    // hollow socket shading (no eyes)
    quad(V(-0.06,S.headB.y+0.05,S.headB.z+0.07), V(-0.015,S.headB.y+0.05,S.headB.z+0.075),
         V(-0.02,S.headB.y+0.08,S.headB.z+0.07), V(-0.055,S.headB.y+0.08,S.headB.z+0.065), P.skinDk, 0.05);
    quad(V(0.015,S.headB.y+0.05,S.headB.z+0.075), V(0.06,S.headB.y+0.05,S.headB.z+0.07),
         V(0.055,S.headB.y+0.08,S.headB.z+0.065), V(0.02,S.headB.y+0.08,S.headB.z+0.07), P.skinDk, 0.05);
    // slack mouth stained green-brown from chewed root
    quad(V(-0.03,S.headB.y-0.01,S.headB.z+0.08), V(0.03,S.headB.y-0.01,S.headB.z+0.08),
         V(0.025,S.headB.y-0.05,S.headB.z+0.075), V(-0.025,S.headB.y-0.05,S.headB.z+0.075), P.mouth, 0.05);
    // wild unbound hair mass, ragged and standing off the skull
    for(const [dx,dz] of [[-0.05,-0.05],[0.06,-0.04],[0.0,-0.08],[-0.08,0.01],[0.09,0.0]]){
      const base=V(dx*0.6,S.headT.y-0.02,S.headB.z+dz*0.3);
      const tip=V(dx,S.headT.y+0.10,S.headB.z+dz);
      tube(base,tip,0.020,0.006,4,P.hairDk,{capB:{hex:P.hairDk,lift:0.005}});
    }
    // a stub of chewed ritual root pinched at the lip
    tube(V(0.03,S.headB.y-0.02,S.headB.z+0.09), V(0.07,S.headB.y-0.03,S.headB.z+0.14), 0.012,0.007,4,P.root);
  }

  /* ---------- ARMS — both raised low-forward gripping the two-handed axe; bare, muscled. ---------- */
  {
    const shR = V(-0.19,0.67,0.08), elR = V(-0.27,0.52,0.16), hR = V(-0.16,0.46,0.28);
    tube(shR, elR, 0.052, 0.042, 6, P.skin);
    tube(elR, hR, 0.042, 0.032, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
    const shL = V(0.19,0.66,0.08), elL = V(0.27,0.50,0.18), hL = V(0.10,0.44,0.30);
    tube(shL, elL, 0.052, 0.042, 6, P.skin);
    tube(elL, hL, 0.042, 0.032, 6, P.skin, {capB:{hex:P.skin, lift:0.02}});
  }

  /* ---------- TWO-HANDED AXE — held low and level, ready for the charge. ---------- */
  {
    const gripL=V(0.10,0.44,0.30), gripR=V(-0.16,0.46,0.28);
    const haftTop=V(-0.30,0.58,0.52);
    tube(gripL, gripR, 0.018, 0.018, 6, P.wood);
    tube(gripR, haftTop, 0.018, 0.014, 6, P.wood);
    quad(V(-0.30,0.58,0.52), V(-0.30,0.50,0.52), V(-0.48,0.54,0.56), V(-0.46,0.66,0.58), P.iron, 0.06);
    quad(V(-0.48,0.54,0.56), V(-0.46,0.66,0.58), V(-0.54,0.60,0.60), V(-0.54,0.60,0.60), P.ironLt, 0.06);
  }

  /* ---------- LEGS — wide forward-charging stance. ---------- */
  {
    const hipL = V(-0.09,0.35,0.02), kneeL = V(-0.14,0.19,0.14), footL = V(-0.14,0.02,0.20);
    tube(hipL, kneeL, 0.062, 0.050, 6, P.skinDk);
    tube(kneeL, footL, 0.050, 0.038, 6, P.iron, {capB:{hex:P.ironDk, lift:0.02}});
    const hipR = V(0.09,0.35,-0.02), kneeR = V(0.13,0.20,-0.16), footR = V(0.13,0.02,-0.22);
    tube(hipR, kneeR, 0.062, 0.050, 6, P.skinDk);
    tube(kneeR, footR, 0.050, 0.038, 6, P.iron, {capB:{hex:P.ironDk, lift:0.02}});
    // leg wrap straps
    for(const [x,z] of [[-0.14,0.14],[0.13,-0.16]]){
      ring(V(x,0.11,z), V(0,1,0), 0.044, 0.044, 7).forEach((p,i,arr)=>{
        const p2=arr[(i+1)%arr.length];
        quad(p,p2,V(p2.x,p2.y+0.02,p2.z),V(p.x,p.y+0.02,p.z), P.peltDk, 0.06);
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
