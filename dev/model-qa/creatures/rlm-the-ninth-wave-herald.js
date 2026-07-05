/* dev/model-qa/creatures/rlm-the-ninth-wave-herald.js — THE NINTH WAVE HERALD (high-seas, Huge
   Elemental, CR 15). Read: a churning wall-WAVE given a face — a towering curling breaker of dark
   water frozen mid-crash, a crude scowling face pressed into the wave-face, lightning threading
   through the curling crest like veins. Silhouette: a leaning, curling wall shape (not humanoid) —
   a wave about to break. VS-desaturated: deep storm-teal/slate water, foam a dirty grey-white,
   lightning a dull violet-white vein (never neon). Whole-object grammar: one function, one frame,
   no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheNinthWaveHerald(){
  const P = {
    water:0x2e4a4c, waterDk:0x1c2e30, waterLt:0x3e6062,
    foam:0x8c948c, foamDk:0x5c645c, foamLt:0xacb0a8,
    bolt:0x8a7ca0, boltLt:0xb8a8d0,
    face:0x223838,
    disc:0x1c2828, discTop:0x263434,
  };

  const L = { baseY:0.10, waistY:1.00, chestY:1.70, crestY:2.30, crownY:2.55 };

  /* ---------- WALL BODY — a leaning curling wave-mass, widest at the base, curling FORWARD at the
     crest (the classic breaking-wave silhouette). Built as a leaning stacked loft. ---------- */
  {
    const bands=[
      {y:L.baseY,  cz:0.00, rx:0.560, rz:0.360, hex:P.waterDk},
      {y:0.55,     cz:0.06, rx:0.520, rz:0.340, hex:P.water},
      {y:L.waistY, cz:0.16, rx:0.460, rz:0.310, hex:P.waterLt},
      {y:1.35,     cz:0.32, rx:0.400, rz:0.280, hex:P.water},
      {y:L.chestY, cz:0.52, rx:0.340, rz:0.250, hex:P.waterLt},
      {y:2.05,     cz:0.74, rx:0.280, rz:0.210, hex:P.water},
      {y:L.crestY, cz:0.92, rx:0.220, rz:0.170, hex:P.foamDk},   // curling lip begins
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rz,10,Math.PI/10));
    stitch(rings,b=>bands[b].hex);
  }

  /* ---------- CURLING CREST — the wave lip curling forward and DOWN over the top (breaking-wave). ---------- */
  {
    const c0=V(0,L.crestY,0.92), c1=V(0.02,L.crestY+0.18,1.15), c2=V(0.03,L.crestY+0.10,1.36), tip=V(0.02,L.crestY-0.14,1.46);
    tube(c0,c1,0.220,0.170,8,P.foamDk,{phase:Math.PI/8});
    tube(c1,c2,0.170,0.120,8,P.foam,{phase:Math.PI/8});
    tube(c2,tip,0.120,0.050,8,P.foamLt,{phase:Math.PI/8,capB:{hex:P.foamLt,lift:0.02}});
    capFan(ring(c0,V(0,1,0),0.220,0.170,8,Math.PI/8),V(0,L.crownY,0.88),P.foamDk);
  }

  /* ---------- FOAM SPRAY — crown of foam-tufts breaking off along the crest edge. ---------- */
  for(const [dx,dz,h] of [[0.24,1.00,0.24],[-0.24,1.02,0.22],[0.12,1.20,0.20],[-0.14,1.18,0.18],[0,1.32,0.16]]){
    const b=V(dx,L.crestY+0.05,dz), t=V(dx*1.3,L.crestY+h,dz*1.05);
    tube(b,t,0.06,0.015,5,P.foam,{capB:{hex:P.foamLt,lift:0.02}});
  }
  // foam streaks down the wave face
  for(const [x,y0,y1,z] of [[-0.30,1.90,1.30,0.60],[0.28,1.60,1.05,0.42],[-0.10,0.90,0.50,0.18]]){
    quad(V(x-0.03,y0,z),V(x+0.03,y0,z),V(x*1.1+0.02,y1,z*0.7),V(x*1.1-0.02,y1,z*0.7),P.foam,0.06);
  }

  /* ---------- LIGHTNING VEINS — threading through the curling crest and down the body, dull violet. ---------- */
  {
    const path=[V(0.06,L.crownY-0.10,0.90),V(-0.08,2.10,0.60),V(0.10,1.55,0.38),V(-0.06,1.05,0.22),V(0.04,0.55,0.10)];
    for(let i=0;i<path.length-1;i++) tube(path[i],path[i+1],0.020,0.014,4,P.bolt,{capB:{hex:P.boltLt}});
    // a few branching forks
    for(const i of [1,3]){
      const p=path[i];
      tube(p,V(p.x+0.14,p.y-0.10,p.z+0.10),0.012,0.004,3,P.boltLt,{capB:{hex:P.boltLt}});
    }
  }

  /* ---------- FACE — a crude scowling face pressed into the mid-wave-face, no eye quads (dark pits). ---------- */
  {
    const fz=0.30, fy=1.30;
    quad(V(-0.14,fy+0.10,fz),V(-0.05,fy+0.10,fz),V(-0.05,fy-0.02,fz-0.01),V(-0.14,fy-0.02,fz-0.01),P.face,0.0);
    quad(V(0.05,fy+0.10,fz),V(0.14,fy+0.10,fz),V(0.14,fy-0.02,fz-0.01),V(0.05,fy-0.02,fz-0.01),P.face,0.0);
    // scowling downturned mouth-line, wide
    quad(V(-0.18,fy-0.16,fz+0.02),V(0.18,fy-0.16,fz+0.02),V(0.14,fy-0.24,fz),V(-0.14,fy-0.24,fz),P.face,0.03);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.68,0.68,20);
    const r2=ring(V(0,0.055,0),V(0,1,0),0.66,0.66,20);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.058,0),P.discTop);
  }
}
