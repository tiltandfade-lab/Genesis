/* dev/model-qa/creatures/rlm-the-last-honest-marshal.js — The Last Honest Marshal
   (frontier, Medium, CR 14). A duster-coated lawman figure, a tin star fused straight into
   exposed bone at the chest, twin revolvers holstered low that never run dry. A relic of
   a hanged marshal, still standing his post. Whole-object grammar: one merged frame, no
   anchors. VS-desaturated bone-white + faded lawman-drab palette, dull tin star, gunmetal.
   NO eye quads — deep dark sockets under the hat brim (skull-shape, not eye quads).
   Medium size: base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheLastHonestMarshal(){
  const P = {
    duster:0x7a6a4c, dusterDk:0x4e4230, dusterLt:0x948260,
    bone:0xc8bd9e, boneDk:0x8f8468,
    star:0x9a8c50, starDk:0x6a5f38,
    gun:0x33312c, gunLt:0x4a463f,
    hat:0x2e2820, hatBand:0x191510,
    disc:0x453b2c, discTop:0x524636,
  };

  const L = { hipY:0.36, waistY:0.56, chestY:0.82, shldY:0.98, neckY:1.06, headY:1.22 };

  /* ---------- DUSTER TORSO — a straight, unmoving frame in a faded coat; ribs/bone visible
     where the coat hangs open at the chest. ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:L.hipY-0.06, rx:0.22, rz:0.19, hex:P.dusterDk},
      {y:L.hipY,      rx:0.19, rz:0.165,hex:P.duster},
      {y:L.waistY,    rx:0.175,rz:0.15, hex:P.duster},
      {y:L.chestY,    rx:0.21, rz:0.18, hex:P.dusterLt},
      {y:L.shldY,     rx:0.22, rz:0.185,hex:P.duster},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* long flat coat skirts */
    quad(V(-0.22,L.hipY-0.06,0.05), V(0.22,L.hipY-0.06,0.05), V(0.27,0.04,0.02), V(-0.27,0.04,0.02), P.dusterDk, 0.05);
    quad(V(-0.22,L.hipY-0.06,-0.09), V(0.22,L.hipY-0.06,-0.09), V(0.25,0.04,-0.13), V(-0.25,0.04,-0.13), P.dusterDk, 0.05);
    /* open coat-front revealing pale exposed bone/ribs */
    quad(V(-0.075,L.chestY+0.06,0.17), V(0.075,L.chestY+0.06,0.17), V(0.085,L.hipY+0.02,0.16), V(-0.085,L.hipY+0.02,0.16), P.bone, 0.04);
    for(let i=0;i<4;i++){
      const y=L.chestY-0.02-i*0.06;
      quad(V(-0.06,y,0.175), V(0.06,y,0.175), V(0.05,y-0.015,0.17), V(-0.05,y-0.015,0.17), P.boneDk, 0.04);
    }
    /* tin star fused directly into the bone at the chest */
    const scy=L.chestY+0.04, scz=0.185;
    for(let i=0;i<5;i++){
      const a=(i/5)*Math.PI*2 - Math.PI/2;
      const a2=a+Math.PI/5;
      quad(V(0,scy,scz), V(Math.cos(a)*0.05,scy+Math.sin(a)*0.05,scz+0.005), V(Math.cos((a+a2)/2)*0.075,scy+Math.sin((a+a2)/2)*0.075,scz+0.008), V(Math.cos(a2)*0.05,scy+Math.sin(a2)*0.05,scz+0.005), P.star, 0.05);
    }
  }

  /* ---------- SKULL-HEAD — a gaunt bone skull under the hat brim, deep dark sockets
     (skull-shape, no eye quads), a lipless dark mouth-slit. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.neckY,      rx:0.105, rz:0.10, hex:P.boneDk},
      {y:L.headY-0.02, rx:0.12,  rz:0.11, hex:P.bone},
      {y:L.headY+0.07, rx:0.10,  rz:0.095,hex:P.boneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headY+0.11,0.0), P.bone);
    /* deep dark eye sockets — carved recess, not flat quads pretending to be eyes */
    for(const s of [-1,1]){
      const cx=s*0.045, cy=L.headY+0.015, cz=0.105;
      quad(V(cx-0.028,cy-0.022,cz), V(cx+0.028,cy-0.022,cz), V(cx+0.024,cy+0.024,cz-0.01), V(cx-0.024,cy+0.024,cz-0.01), P.dusterDk, 0.02);
    }
    /* nasal cavity */
    quad(V(-0.014,L.headY-0.03,0.115), V(0.014,L.headY-0.03,0.115), V(0.010,L.headY-0.05,0.108), V(-0.010,L.headY-0.05,0.108), P.dusterDk, 0.02);
    /* lipless jaw-line, teeth implied by a dark slit */
    quad(V(-0.05,L.headY-0.075,0.105), V(0.05,L.headY-0.075,0.105), V(0.04,L.headY-0.09,0.11), V(-0.04,L.headY-0.09,0.11), P.dusterDk, 0.03);

    /* the marshal's hat, low brim */
    const hb0 = ring(V(0,L.headY+0.10,0.0), V(0,1,0), 0.135,0.125, n, ph);
    const hb1 = ring(V(0,L.headY+0.17,0.0), V(0,1,0), 0.095,0.09,n, ph);
    stitch([hb0,hb1], ()=>P.hat);
    capFan(hb1, V(0,L.headY+0.25,0.0), P.hat);
    const brimN=10;
    for(let i=0;i<brimN;i++){
      const a=(i/brimN)*Math.PI*2, a2=((i+1)/brimN)*Math.PI*2;
      const rIn=0.14, rOut=0.25;
      const y0=L.headY+0.11 + Math.max(0,Math.cos(a))*0.03;
      const y1=L.headY+0.11 + Math.max(0,Math.cos(a2))*0.03;
      quad(V(Math.cos(a)*rIn, y0, Math.sin(a)*rIn-0.02), V(Math.cos(a)*rOut, y0-0.012, Math.sin(a)*rOut-0.02),
           V(Math.cos(a2)*rOut, y1-0.012, Math.sin(a2)*rOut-0.02), V(Math.cos(a2)*rIn, y1, Math.sin(a2)*rIn-0.02), P.hatBand, 0.05);
    }
  }

  /* ---------- ARMS — bone hands resting near twin holstered revolvers that never run
     dry (a faint dull glow-less gunmetal, no magic FX, just the promise). ---------- */
  {
    const armAt=(sign)=>{
      const sh = V(sign*0.21, L.shldY-0.02, 0.0);
      const el = V(sign*0.26, L.waistY, 0.09);
      const wr = V(sign*0.23, L.hipY+0.02, 0.15);
      tube(sh, el, 0.06, 0.05, 6, P.duster, {capA:{hex:P.dusterDk}});
      tube(el, wr, 0.05, 0.038, 6, P.duster, {capB:{hex:P.bone, lift:0.012}});
      const hgrip = V(sign*0.25, L.hipY-0.05, 0.13);
      const hbarrel = V(sign*0.25, L.hipY-0.20, 0.19);
      tube(hgrip, hbarrel, 0.028, 0.022, 5, P.gun, {capB:{hex:P.gunLt}});
    };
    armAt(-1); armAt(1);
  }

  /* ---------- LEGS — straight, unmoving stance. ---------- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.10, 0.14, 0.0);
      const foot=V(sign*0.10, 0.02, 0.04);
      tube(hip, foot, 0.08, 0.075, 6, P.dusterDk, {capB:{hex:P.hat, lift:0.015}});
    };
    legAt(-1); legAt(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
