/* dev/model-qa/creatures/rlm-spore-choked-idol-fungus.js — SPORE-CHOKED IDOL FUNGUS
   (lost-world, Medium Plant, CR 0). Read: a stone idol head/bust half-swallowed by a shelf
   fungus growth — a squat weathered stone idol-fragment as the "core," ringed and capped by
   bulbous shelf-fungus caps and puffball spore-sacs that visibly shudder/shriek when disturbed
   (one cap mid-burst, spore puffs drifting). VS-desaturated grey stone + sickly fungal ochre/
   violet-brown caps. Whole-object grammar: one function, one frame, no anchors. Medium,
   base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSporeChokedIdolFungus(){
  const P = {
    stone:0x6b665a, stoneDk:0x4c473c, stoneLt:0x827c6c,
    carve:0x3a352b,
    cap:0x8a6a42, capDk:0x5f4a2e, capLt:0xa8875a,
    gill:0x3f2f24, spore:0xc9b070, sporeDk:0x9a824a,
    moss:0x5c6b3e,
    disc:0x4a4038, discTop:0x585047,
  };

  /* IDOL CORE — a squat weathered stone bust, broad base narrowing slightly, a carved brow */
  const S = {
    base:  V(0,0.06,0),
    waist: V(0,0.34,0.01),
    chest: V(0,0.58,0.0),
    neck:  V(0,0.74,-0.01),
    headB: V(0,0.82,-0.01),
  };
  tube(S.base,  S.waist, 0.230, 0.210, 9, P.stone,   {phase:Math.PI/9, capA:{hex:P.stoneDk,lift:0.02}});
  tube(S.waist, S.chest, 0.210, 0.195, 9, P.stoneDk, {phase:Math.PI/9});
  tube(S.chest, S.neck,  0.195, 0.130, 9, P.stone,   {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.130, 0.115, 9, P.stoneLt, {phase:Math.PI/9});

  /* idol HEAD — a blunt worn stone face, carved brow-ridge, eroded features (no eye quads) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.80, cz:0, rx:0.115, rz:0.110, hex:P.stoneLt},
      {y:0.92, cz:0.01, rx:0.130, rz:0.125, hex:P.stone},
      {y:1.02, cz:0.0, rx:0.098, rz:0.095, hex:P.stoneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.06,0.0), P.stoneDk);
    /* carved brow ridge — worn stone feature line, not an eye quad */
    quad(V(-0.09,0.90,0.10), V(0.09,0.90,0.10), V(0.07,0.86,0.12), V(-0.07,0.86,0.12), P.carve, 0.03);
    /* weathered mouth-line groove */
    quad(V(-0.06,0.80,0.11), V(0.06,0.80,0.11), V(0.045,0.775,0.115), V(-0.045,0.775,0.115), P.carve, 0.03);
    /* moss creeping up one side of the face */
    quad(V(0.06,0.78,0.09), V(0.12,0.86,0.10), V(0.10,0.98,0.09), V(0.05,0.92,0.09), P.moss, 0.06);
  }

  /* SHELF FUNGUS CAPS — 4 bracket/shelf caps jutting from the idol at different heights,
     overlapping fan shapes reading as a fungal shelf colony devouring the statue */
  {
    const shelf=(cy, ang, rOut, hex)=>{
      const cx = Math.sin(ang)*0.20, cz = Math.cos(ang)*0.20;
      const rootP = V(cx*0.55, cy, cz*0.55);
      const outP  = V(cx, cy+0.03, cz);
      /* a flat fan cap: several quads spreading from root to a wide outer arc */
      const half = rOut*0.9;
      const tang = V(-cz, 0, cx); // tangent dir for cap width
      const left  = V(outP.x+tang.x*half, outP.y-0.03, outP.z+tang.z*half);
      const right = V(outP.x-tang.x*half, outP.y-0.03, outP.z-tang.z*half);
      quad(rootP, left, V(outP.x*1.1,outP.y+0.02,outP.z*1.1), right, hex, 0.05);
      // underside gill shadow
      quad(left, right, V(outP.x*1.05,outP.y-0.06,outP.z*1.05), rootP, P.gill, 0.03);
    };
    shelf(0.44,  0.3,  0.20, P.cap);
    shelf(0.60, -0.6,  0.22, P.capDk);
    shelf(0.30,  2.4,  0.18, P.capLt);
    shelf(0.70,  1.6,  0.16, P.cap);
  }

  /* SPORE-SACS / PUFFBALLS — bulbous sacs, one mid-burst with spore puffs drifting off it */
  {
    const puff=(cx,cy,cz,r,hex)=>{
      const r1=ring(V(cx,cy-r*0.4,cz), V(0,1,0), r*0.7, r*0.7, 7, Math.PI/7);
      const r2=ring(V(cx,cy,cz),       V(0,1,0), r, r, 7, Math.PI/7);
      const r3=ring(V(cx,cy+r*0.5,cz), V(0,1,0), r*0.5, r*0.5, 7, Math.PI/7);
      stitch([r1,r2,r3], ()=>hex);
      capFan(r3, V(cx,cy+r*0.85,cz), hex);
      capFan(r1, V(cx,cy-r*0.65,cz), P.sporeDk, true);
    };
    puff(0.20, 0.36, 0.16, 0.075, P.spore);
    puff(-0.16, 0.52, 0.10, 0.06, P.sporeDk);
    /* burst sac — a broken half-sac with drifting spore puffs (small floating quads above it) */
    puff(-0.10, 0.72, -0.14, 0.05, P.spore);
    for(const [dx,dy,dz] of [[0.02,0.14,0.02],[-0.03,0.20,-0.01],[0.05,0.24,-0.04]]){
      const px=-0.10+dx, py=0.72+dy, pz=-0.14+dz;
      quad(V(px-0.015,py,pz), V(px+0.015,py,pz), V(px+0.01,py+0.02,pz+0.01), V(px-0.01,py+0.02,pz+0.01), P.spore, 0.1);
    }
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
