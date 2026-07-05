/* dev/model-qa/creatures/prop-charnel-pit.js — CHARNEL PIT (GLOOM set piece, Huge).
   The read: a wide sunken PIT dug into the floor, its rim built up from a low ring of packed dark
   earth/ash, the pit floor down inside strewn with a jumble of BONES (long-bones + a couple of
   bare skulls, not one neat pile — scattered), a few charred BLACKENED patches on the rim and pit
   floor (burnt-offering tell), and a haze of ash-grey dust settled in the low points. Occult-horror
   register: grim, not gothic-pretty — a working charnel site. VS-desaturated dark earth + bone-pale
   + ash-grey + char-black. One function, one geometry frame, no anchors. Huge disc r=0.68.
   Imported by prop-charnel-pit-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropCharnelPit(){
  /* ---------- PALETTE ---------- */
  const P = {
    earth:0x3a3226, earthDk:0x271f16, earthLt:0x4a4230,     // packed rim earth
    pitFloor:0x241d16, pitFloorDk:0x171209,                   // sunken pit floor
    bone:0xc9bc9e, boneDk:0x9c9078, boneShad:0x6e6450,       // bones
    char:0x120f0c, charLt:0x241f18,                           // charred patches
    ash:0x8a8478, ashDk:0x635f54,                             // settled ash haze
    disc:0x2c2822, discTop:0x362f27,
  };

  const rimR = 0.60, pitR = 0.46, pitDepth = 0.16;

  /* ---------- RIM — a low built-up ring of packed earth around the sunken pit ---------- */
  {
    const r0=ring(V(0,0.002,0), V(0,1,0), rimR, rimR, 18, 0);
    const r1=ring(V(0,0.11,0), V(0,1,0), rimR-0.05, rimR-0.05, 18, 0);
    stitch([r0,r1], (b,i)=> (i%3===0? P.earthDk : P.earth));
    // inner rim slope down toward the pit lip
    const r2=ring(V(0,0.03,0), V(0,1,0), pitR+0.04, pitR+0.04, 18, 0);
    stitch([r1,r2], ()=>P.earthLt);
  }

  /* ---------- PIT FLOOR — sunken bowl-ish floor, dark ---------- */
  {
    const rTop=ring(V(0,0.03,0), V(0,1,0), pitR, pitR, 18, 0);
    const rBot=ring(V(0,0.03-pitDepth,0), V(0,1,0), pitR*0.75, pitR*0.75, 18, 0);
    stitch([rTop,rBot], (b,i)=>(i%2? P.pitFloor:P.pitFloorDk));
    capFan(rBot, V(0,0.03-pitDepth-0.01,0), P.pitFloorDk);
  }

  const floorY = 0.03-pitDepth+0.005;

  /* ---------- CHARRED PATCHES — a couple of burnt-black smears on rim + pit floor ---------- */
  quad(V(-0.30,0.115,0.10), V(-0.14,0.118,0.14), V(-0.16,0.113,0.28), V(-0.32,0.112,0.24), P.char, 0.05);
  quad(V(0.05,floorY,-0.10), V(0.24,floorY,-0.06), V(0.22,floorY,0.10), V(0.03,floorY,0.06), P.charLt, 0.05);

  /* ---------- ASH HAZE — settled grey dust filling the low points ---------- */
  quad(V(-0.20,floorY+0.002,-0.20), V(0.02,floorY+0.002,-0.24), V(0.04,floorY+0.002,-0.06), V(-0.18,floorY+0.002,-0.03), P.ash, 0.06);
  quad(V(0.10,floorY+0.002,0.14), V(0.28,floorY+0.002,0.12), V(0.26,floorY+0.002,0.28), V(0.09,floorY+0.002,0.29), P.ashDk, 0.05);

  /* ---------- BONES — scattered jumble: long-bones as tapered tubes + two bare skulls ---------- */
  {
    const longBone=(x0,z0,x1,z1,y,hex)=>{
      const a=V(x0,y,z0), b=V(x1,y+0.01,z1);
      tube(a,b,0.020,0.016,5,hex,{capA:{hex:P.boneShad}, capB:{hex:P.boneShad}});
      // bulbous joint-ends
      const e1=ring(a,V(b.x-a.x,0,b.z-a.z),0.026,0.026,5,0); capFan(e1,V(a.x-(b.x-a.x)*0.05,a.y,a.z-(b.z-a.z)*0.05),hex,true);
      const e2=ring(b,V(a.x-b.x,0,a.z-b.z),0.026,0.026,5,0); capFan(e2,V(b.x-(a.x-b.x)*0.05,b.y,b.z-(a.z-b.z)*0.05),hex);
    };
    longBone(-0.20,-0.14, 0.02,0.10, floorY+0.01, P.bone);
    longBone(0.10,0.20, -0.06,-0.02, floorY+0.008, P.boneDk);
    longBone(-0.05,0.24, 0.18,0.30, floorY+0.012, P.bone);
    longBone(0.22,-0.16, 0.34,-0.05, floorY+0.008, P.boneDk);

    const skull=(cx,cz,y,scale)=>{
      const s=scale;
      const bands=[
        {y:y,        cz:cz-0.01*s, rx:0.048*s, hex:P.boneShad},
        {y:y+0.03*s, cz:cz,        rx:0.062*s, hex:P.bone},
        {y:y+0.06*s, cz:cz+0.005*s,rx:0.050*s, hex:P.boneDk},
      ];
      const rings=bands.map(b=>ring(V(cx,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.92,8,Math.PI/8));
      stitch(rings,b=>bands[b].hex);
      capFan(rings.at(-1), V(cx,y+0.075*s,cz), P.bone);
      // eye sockets (dark pits, not quad "eyes" — recessed hollows read as sockets)
      for(const s2 of [-1,1]){
        const ec=V(cx+s2*0.022*s, y+0.035*s, cz+0.045*s);
        const e1=ring(ec, V(0,0,1), 0.014*s,0.014*s,6,0);
        capFan(e1, V(ec.x,ec.y,ec.z+0.006*s), P.char);
      }
      // jaw hint (a small dark wedge below)
      quad(V(cx-0.025*s,y-0.01*s,cz+0.03*s), V(cx+0.025*s,y-0.01*s,cz+0.03*s), V(cx+0.015*s,y-0.03*s,cz+0.035*s), V(cx-0.015*s,y-0.03*s,cz+0.035*s), P.boneShad, 0.05);
    };
    skull(-0.10,-0.08, floorY+0.015, 1.0);
    skull(0.18,0.15, floorY+0.012, 0.9);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
